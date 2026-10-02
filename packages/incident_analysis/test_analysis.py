import csv
import io
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from incident_analysis import AnalysisError, FIELDS, analyze_csv, results_csv


def benchmark_rows():
    categories = ["CUSTOMER_COMPLAINT"] * 29 + ["EQUIPMENT"] * 17 + ["SUPPLY"] * 22 + ["FOOD_QUALITY"] * 19 + ["STAFF"] * 9
    statuses = ["CLOSED"] * 50 + ["OPEN"] * 32 + ["DISCARDED"] * 14
    scores = ["1"] * 4 + ["2"] * 6 + ["3"] * 12 + ["4"] * 19 + ["5"] * 9
    rows = []
    for number, (category, status) in enumerate(zip(categories, statuses), start=1):
        rows.append({
            "incident_id": f"BRS-{number:06}", "date": "2026-09-01",
            "location_id": f"COL-{(number - 1) % 10 + 1:02}", "category": category,
            "description": "Synthetic operational incident", "status": status,
            "customer_id": "", "satisfaction_score": scores[number - 1] if status == "CLOSED" else "",
            "reporter_id": "MGR-01",
        })
    for number, updates in enumerate((
        {"location_id": ""}, {"category": "UNKNOWN"},
        {"description": "bad"}, {"status": "CLOSED", "satisfaction_score": ""},
    ), start=97):
        rows.append({**rows[50], "incident_id": f"BRS-{number:06}", **updates})
    return rows


def csv_source(rows):
    output = io.StringIO(newline="")
    writer = csv.DictWriter(output, fieldnames=FIELDS)
    writer.writeheader()
    writer.writerows(rows)
    output.seek(0)
    return output


class AnalysisTests(unittest.TestCase):
    def test_context_benchmark(self):
        summary = analyze_csv(csv_source(benchmark_rows()))
        self.assertEqual((summary["total_records"], summary["valid_records"], summary["invalid_records"]), (100, 96, 4))
        self.assertEqual(list(summary["categories"].values()), [29, 17, 22, 19, 9])
        self.assertEqual(summary["statuses"], {"OPEN": 32, "CLOSED": 50, "DISCARDED": 14})
        self.assertEqual(summary["satisfaction"]["average"], 3.46)
        self.assertEqual(summary["satisfaction"]["scored_cases"], 50)
        self.assertEqual(list(summary["satisfaction"]["scores"].values()), [4, 6, 12, 19, 9])
        self.assertEqual({rule: count for rule, count in summary["invalid_breakdown"].items() if count}, {
            "location": 1, "category": 1, "description": 1, "closed_score": 1,
        })

    def test_validation_rules(self):
        cases = {
            "location": {"location_id": "FLA-05"}, "category": {"category": "OTHER"},
            "description": {"description": "    "}, "reporter": {"reporter_id": ""},
            "closed_score": {"satisfaction_score": ""}, "score": {"satisfaction_score": "6"},
            "incident_id": {"incident_id": "invalid"}, "date": {"date": "2026-02-30"},
            "status": {"status": "closed"}, "customer_id": {"customer_id": "invalid"},
        }
        for rule, changes in cases.items():
            with self.subTest(rule=rule):
                summary = analyze_csv(csv_source([{**benchmark_rows()[0], **changes}]))
                self.assertEqual(summary["invalid_records"], 1)
                self.assertEqual(summary["invalid_breakdown"][rule], 1)

    def test_overlapping_errors_count_one_invalid_record(self):
        summary = analyze_csv(csv_source([{**benchmark_rows()[0], "category": "", "location_id": ""}]))
        self.assertEqual(summary["invalid_records"], 1)
        self.assertEqual(sum(summary["invalid_breakdown"].values()), 2)
        self.assertIsNone(summary["satisfaction"]["average"])

    def test_invalid_files(self):
        for text in ("", ",".join(FIELDS) + "\n", "name,email\nExample,x\n", ",".join(FIELDS) + '\n"unterminated'):
            with self.subTest(text=text), self.assertRaises(AnalysisError):
                analyze_csv(io.StringIO(text))

    def test_optional_score_and_bom(self):
        row = benchmark_rows()[50]
        summary = analyze_csv(io.StringIO("\ufeff" + csv_source([row]).getvalue()))
        self.assertEqual(summary["valid_records"], 1)
        self.assertIsNone(summary["satisfaction"]["average"])
        for score in ("0", "5.0", "NaN", "-1"):
            with self.subTest(score=score):
                summary = analyze_csv(csv_source([{**row, "satisfaction_score": score}]))
                self.assertEqual(summary["invalid_breakdown"]["score"], 1)

    def test_export_contains_only_aggregates(self):
        summary = analyze_csv(csv_source(benchmark_rows()))
        exported = results_csv(summary)
        metrics = {row["metric"]: row for row in csv.DictReader(io.StringIO(exported))}
        self.assertEqual(metrics["satisfaction.average"]["value"], "3.46")
        self.assertEqual(metrics["categories.CUSTOMER_COMPLAINT"]["percentage"], "30.2")
        self.assertNotIn("BRS-000001", exported)
        self.assertNotIn("Synthetic operational incident", exported)

    def test_duplicate_ids(self):
        row = benchmark_rows()[0]
        summary = analyze_csv(csv_source([row, row]))
        self.assertEqual(summary["valid_records"], 1)
        self.assertEqual(summary["invalid_breakdown"]["duplicate_id"], 1)

    def test_row_shape(self):
        source = csv_source([benchmark_rows()[0]]).getvalue().rstrip() + ",extra\n"
        summary = analyze_csv(io.StringIO(source))
        self.assertEqual(summary["invalid_breakdown"]["row_shape"], 1)

    def test_blank_rows_are_not_silently_skipped(self):
        source = csv_source([benchmark_rows()[0]]).getvalue() + "\n"
        summary = analyze_csv(io.StringIO(source))
        self.assertEqual(summary["total_records"], 2)
        self.assertEqual(summary["invalid_records"], 1)
        self.assertEqual(summary["invalid_breakdown"]["row_shape"], 1)

    def test_cli_export(self):
        script = Path(__file__).resolve().parents[2] / "scripts" / "analyze.py"
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "synthetic.csv"
            source.write_text(csv_source(benchmark_rows()).getvalue(), encoding="utf-8")
            process = subprocess.run(
                [sys.executable, str(script), str(source)], input="y\n", text=True,
                capture_output=True, cwd=directory,
            )
            self.assertEqual(process.returncode, 0, process.stderr)
            self.assertIn("Average score: 3.46 / 5.00", process.stdout)
            self.assertTrue((Path(directory) / "results.csv").exists())


if __name__ == "__main__":
    unittest.main()