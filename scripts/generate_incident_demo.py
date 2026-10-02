import argparse
import csv
import sys
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "packages"))

from incident_analysis import FIELDS
from incident_analysis.test_analysis import benchmark_rows


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate SYNTHETIC Brasaland demo data, not the course attachment.")
    parser.add_argument("--output", type=Path, default=Path(__file__).with_name("incidents-brasaland-demo.csv"))
    arguments = parser.parse_args()
    with arguments.output.open("x", encoding="utf-8", newline="") as destination:
        writer = csv.DictWriter(destination, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(benchmark_rows())
    print(f"Synthetic demo created: {arguments.output}")


if __name__ == "__main__":
    main()