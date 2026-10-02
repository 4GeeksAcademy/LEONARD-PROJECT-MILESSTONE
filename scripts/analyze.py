import argparse
import sys
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "packages"))

from incident_analysis import AnalysisError, RULES, analyze_csv, results_csv


def print_summary(summary: dict, filename: str) -> None:
    print("=" * 60)
    print("  BRASALAND - INCIDENT REPORT ANALYSIS")
    print(f"  Source file: {filename}")
    print("=" * 60)
    for label, field in (
        ("TOTAL RECORDS IN FILE", "total_records"),
        ("Valid records", "valid_records"),
        ("Invalid / incomplete", "invalid_records"),
    ):
        print(f"{label:.<40} {summary[field]:>8}")
    print("\nINVALID RECORDS BREAKDOWN")
    for rule, count in summary["invalid_breakdown"].items():
        if count:
            print(f"  {RULES[rule]:.<49} {count:>5}")
    if not summary["invalid_records"]:
        print("  No invalid records.")
    print("  Rule counts can overlap when a record has several problems.")
    for group in ("categories", "statuses"):
        print(f"\nBREAKDOWN BY {group.upper()} (valid records)")
        for name, count in summary[group].items():
            percentage = count / summary["valid_records"] * 100 if summary["valid_records"] else 0
            print(f"  {name:.<32} {count:>8}  ({percentage:.1f}%)")
    satisfaction = summary["satisfaction"]
    print("\nSATISFACTION INDEX (closed cases)")
    print(f"  Scored cases: {satisfaction['scored_cases']} of {satisfaction['closed_cases']}")
    average = satisfaction["average"]
    print(f"  Average score: {average:.2f} / 5.00" if average is not None else "  Average score: N/A (no scored closed cases)")
    for score, count in satisfaction["scores"].items():
        print(f"  Score {score:.<27} {count:>8}")
    print("=" * 60)


def main() -> int:
    parser = argparse.ArgumentParser(description="Analyze Brasaland incident records locally.")
    parser.add_argument("csv_path", type=Path)
    arguments = parser.parse_args()
    try:
        with arguments.csv_path.open(encoding="utf-8-sig", newline="") as source:
            summary = analyze_csv(source)
        print_summary(summary, arguments.csv_path.name)
        while True:
            try:
                answer = input("Export results to CSV? [y / n]: ").strip().lower()
            except EOFError:
                answer = "n"
            if answer in ("y", "n"):
                break
            print("Please choose y or n.")
        if answer == "y":
            Path("results.csv").write_text(results_csv(summary), encoding="utf-8", newline="")
            print("Results exported to results.csv")
        return 0
    except (AnalysisError, OSError) as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())