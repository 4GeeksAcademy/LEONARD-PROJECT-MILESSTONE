# Brasaland Incident Analysis

Dependency-free shared Python module for the CLI and FastAPI service.
The source of truth is [Context-company.md](../../Context-company.md).

## API

- `analyze_csv(source)`: consumes a UTF-8 text stream (or line iterator) and
  returns totals, invalid-rule counts, category/status counts, and satisfaction
  counts/average. Raises `AnalysisError` for empty or malformed files.
- `results_csv(summary)`: returns a CSV with `metric,value,percentage`, one row
  per metric. Percentages are based on valid records; satisfaction uses only
  scored, valid CLOSED cases. No scored cases produces `average: null` in JSON,
  `N/A` in the console, and an empty CSV value.

## Validation

The CSV must have exactly the nine specified headers, in any order. A UTF-8 BOM
is accepted. Fields are trimmed; allowed values remain case-sensitive.
Required values, the five categories, three statuses, 14 location codes,
identifier formats, calendar dates, description length, and integer scores
1-5 are validated. A CLOSED row without a score is invalid. Optional customer
IDs are validated when present. Duplicate incident IDs and incorrect-width or
blank CSV rows are also invalid. Later occurrences of an ID are invalid even
if the first occurrence had another validation problem.

Invalid-rule counts can overlap; each invalid record counts only once in the
invalid total. No raw record values are returned, logged, or exported.
Duplicate detection uses a fixed 1,000,000-byte lookup for the six-digit ID
space; the rest of the analysis uses constant-size counters, not a row list.
Streaming permits million-row inputs without loading the dataset into memory.

## Tests

From the repository root:

```bash
PYTHONPATH=packages python -m unittest discover -s packages/incident_analysis -p 'test_*.py' -v
```

The benchmark test uses synthetic records, not the original attachment.
Tests also cover overlapping rules, duplicates, blank/malformed files,
UTF-8 BOMs, score validation, optional scores, aggregate export, and CLI export.