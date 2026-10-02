import csv
import io
import re
from collections import Counter
from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from typing import TextIO


FIELDS = (
    "incident_id", "date", "location_id", "category", "description", "status",
    "customer_id", "satisfaction_score", "reporter_id",
)
CATEGORIES = ("CUSTOMER_COMPLAINT", "EQUIPMENT", "SUPPLY", "FOOD_QUALITY", "STAFF")
STATUSES = ("OPEN", "CLOSED", "DISCARDED")
LOCATIONS = {f"COL-{number:02}" for number in range(1, 11)} | {
    f"FLA-{number:02}" for number in range(1, 5)
}
RULES = {
    "location": "Missing or invalid location_id",
    "category": "Invalid or missing category",
    "description": "Empty or too-short description",
    "reporter": "Missing or invalid reporter_id",
    "closed_score": "Closed case, no score",
    "score": "Invalid satisfaction_score (integer 1-5 required)",
    "incident_id": "Missing or invalid incident_id",
    "duplicate_id": "Duplicate incident_id",
    "date": "Missing or invalid date (YYYY-MM-DD required)",
    "status": "Missing or invalid status",
    "customer_id": "Invalid customer_id",
    "row_shape": "Incorrect number of CSV fields",
}


class AnalysisError(ValueError):
    pass


def analyze_csv(source: TextIO) -> dict:
    reader = csv.reader(source, strict=True)
    try:
        headers = next(reader, None)
        if not headers:
            raise AnalysisError("The CSV file is empty.")
        headers[0] = headers[0].removeprefix("\ufeff")
        if len(headers) != len(set(headers)):
            raise AnalysisError("The CSV header contains duplicate columns.")
        if set(headers) != set(FIELDS):
            raise AnalysisError("Expected exactly these CSV columns: " + ", ".join(FIELDS))

        total = valid = scored = score_sum = 0
        seen_ids = bytearray(1_000_000)
        categories = Counter({category: 0 for category in CATEGORIES})
        statuses = Counter({status: 0 for status in STATUSES})
        scores = Counter({str(score): 0 for score in range(1, 6)})
        invalid = Counter({rule: 0 for rule in RULES})
        for raw_row in reader:
            total += 1
            problems = set()
            if len(raw_row) != len(headers):
                problems.add("row_shape")
            row = dict(zip(headers, raw_row))
            values = {field: (row.get(field) or "").strip() for field in FIELDS}
            if values["location_id"] not in LOCATIONS:
                problems.add("location")
            if values["category"] not in CATEGORIES:
                problems.add("category")
            if len(values["description"]) < 5:
                problems.add("description")
            if not re.fullmatch(r"MGR-[0-9]{2}", values["reporter_id"]):
                problems.add("reporter")
            if not re.fullmatch(r"BRS-[0-9]{6}", values["incident_id"]):
                problems.add("incident_id")
            else:
                identifier = int(values["incident_id"][4:])
                if seen_ids[identifier]:
                    problems.add("duplicate_id")
                seen_ids[identifier] = 1
            try:
                if not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", values["date"]):
                    raise ValueError
                date.fromisoformat(values["date"])
            except ValueError:
                problems.add("date")
            if values["status"] not in STATUSES:
                problems.add("status")
            if values["customer_id"] and not re.fullmatch(r"CLI-[0-9]{6}", values["customer_id"]):
                problems.add("customer_id")
            score = values["satisfaction_score"]
            if values["status"] == "CLOSED" and not score:
                problems.add("closed_score")
            if score and score not in ("1", "2", "3", "4", "5"):
                problems.add("score")
            if problems:
                invalid.update(problems)
                continue
            valid += 1
            categories[values["category"]] += 1
            statuses[values["status"]] += 1
            if values["status"] == "CLOSED" and score:
                scored += 1
                score_sum += int(score)
                scores[score] += 1
        if not total:
            raise AnalysisError("The CSV contains a header but no incident records.")
    except (csv.Error, UnicodeError) as error:
        raise AnalysisError("The file must be a correctly quoted, comma-separated UTF-8 CSV.") from error

    return {
        "total_records": total,
        "valid_records": valid,
        "invalid_records": total - valid,
        "invalid_breakdown": dict(invalid),
        "categories": dict(categories),
        "statuses": dict(statuses),
        "satisfaction": {
            "scored_cases": scored,
            "closed_cases": statuses["CLOSED"],
            "average": float((Decimal(score_sum) / scored).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )) if scored else None,
            "scores": dict(scores),
        },
    }


def metric_rows(summary: dict):
    for metric in ("total_records", "valid_records", "invalid_records"):
        yield metric, summary[metric], ""
    for rule, count in summary["invalid_breakdown"].items():
        yield f"invalid.{rule}", count, ""
    for group in ("categories", "statuses"):
        for name, count in summary[group].items():
            percentage = f"{count / summary['valid_records'] * 100:.1f}" if summary["valid_records"] else "0.0"
            yield f"{group}.{name}", count, percentage
    for name in ("scored_cases", "closed_cases", "average"):
        value = summary["satisfaction"][name]
        yield f"satisfaction.{name}", "" if value is None else value, ""
    for score, count in summary["satisfaction"]["scores"].items():
        yield f"satisfaction.score.{score}", count, ""


def results_csv(summary: dict) -> str:
    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(("metric", "value", "percentage"))
    writer.writerows(metric_rows(summary))
    return output.getvalue()