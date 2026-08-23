# Talent Pipeline Tracker (Milestone 3)

Internal Brasaland People and Culture tracker built with Next.js App Router + TypeScript.

## Environment Variables

Create a local env file from `.env.example`:

```bash
cp .env.example .env.local
```

Required variable:

```bash
NEXT_PUBLIC_API_URL=https://playground.4geeks.com/tracker/api/v1
```

## Run Locally

```bash
cd uis/talent-pipeline-tracker
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Shell Integration

To display this milestone inside `project-shell.html`, run it on port 3001:

```bash
npm run dev -- --port 3001
```

Then open `project-shell.html` from the repo root.

## Delivered Features

- Candidate list with status filter, stage filter, and search via query params.
- Candidate detail view with status and stage updates using `PATCH /records/:id`.
- Notes management (list/add/delete).
- Candidate creation (`POST /records`) and edition (`PUT /records/:id`).
- Loading, success, and error states across async actions.
- Typed API contracts under `src/types` and API service functions under `src/services`.
