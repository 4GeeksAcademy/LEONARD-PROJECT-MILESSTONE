# Milestone 3 - Run and Validation Commands

## Next.js App Location

uis/talent-pipeline-tracker

## Install

```bash
cd uis/talent-pipeline-tracker
npm install
```

## Environment

```bash
cp .env.example .env.local
```

Required variable:

```bash
NEXT_PUBLIC_API_URL=https://playground.4geeks.com/tracker/api/v1
```

## Development Server

```bash
npm run dev
```

## Lint

```bash
npm run lint
```

## Build

```bash
npm run build
```

## Shell View (Milestone 3 + Full Project)

Run the app on port 3001 for embedding in the global shell:

```bash
npm run dev -- --port 3001
```

Then open:

- http://127.0.0.1:3000/project-shell.html (if serving the monorepo with static server)
- Select Milestone 3 or Full Project
