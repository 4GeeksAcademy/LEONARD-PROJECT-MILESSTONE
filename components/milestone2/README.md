# Milestone 2 - Brasaland TypeScript Logic

This module contains Milestone 2 logic in TypeScript with explicit types and pure functions.

## Features implemented

- Context-based interfaces for Brasaland entities
- Filtering by one or multiple criteria
- Sorting ascending/descending and by multiple fields
- Linear search on unsorted arrays
- Binary search on sorted arrays
- Aggregation reports (counts, totals, averages, max, min)
- Business validations based on Brasaland context rules

## Commands

Install dependencies:

```bash
cd components/milestone2
npm install
```

Type check without emitting files:

```bash
npx tsc --noEmit
```

Build:

```bash
npm run build
```

Serve manual test page in Codespaces:

```bash
npx --yes serve . -l 3000
```

Then open port 3000 and go to `/index.html`.
