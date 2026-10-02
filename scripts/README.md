# `scripts` folder

This folder contains **helper scripts** for the monorepo: development automation, maintenance utilities, repetitive tasks (setup, lint, migrations, data generation, etc.), and internal tooling.

- **Main purpose**: group support tools that do not belong to a specific app, agent, or pipeline but make the team’s work easier.
- **Recommendation**: document each script (what it does, parameters, requirements, usage examples) and keep them reproducible (and safe) across environments.

> _Spanish version: [README.es.md](./README.es.md)._

## Brasaland Incident Analyzer

Run from the repository root (Python 3.11+; no external dependencies):

```bash
python scripts/analyze.py scripts/incidents-brasaland-demo.csv
```

Or place the original course CSV locally in this folder and run:

```bash
cd scripts
python analyze.py incidents-brasaland.csv
```

The script streams the file, reports every triggered invalid-rule count, and
calculates metrics only for valid rows. Choose `y` at the export prompt to write
`results.csv` in the current working directory. Errors exit with status 1.
The CLI and API import the same `packages/incident_analysis` implementation.

`incidents-brasaland-demo.csv` is **synthetic**, generated to reproduce the
published benchmark. It is not the missing course attachment and contains no
customer identifiers. Regenerate it with the following command only when the
file does not already exist (the generator never overwrites existing files):

```bash
python scripts/generate_incident_demo.py
```

Private incident CSVs and generated results are ignored by Git. Never commit
the production file or screenshots containing customer information.
See [verification and screenshots](../docs/incident-analysis/README.md).
