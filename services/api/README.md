# Brasaland Incident API

FastAPI service for internal incident analysis. It imports the exact same
streaming analyzer as `scripts/analyze.py` and serves the backoffice at the
same origin. No AI service is used.

## Run

From the repository root:

```bash
python -m venv .venv
.venv/bin/python -m pip install -r services/api/requirements.txt
npm --prefix uis/backoffice ci
npm --prefix uis/backoffice run build
.venv/bin/python -m uvicorn services.api.app.main:app --host 0.0.0.0 --port 8012
```

Open `http://localhost:8012/backoffice/`. API documentation is available at
`http://localhost:8012/docs`. Build the frontend before starting the server.
There is no need to start a second frontend server. If port 8012 is occupied,
choose another port and open that URL instead.

## Endpoints

| Endpoint | Contract |
| --- | --- |
| `POST /api/incidents/analyze` | Multipart field `file`, a UTF-8 `.csv`; returns aggregate JSON plus validation-rule labels. |
| `GET /api/incidents/results/export` | Downloads the current browser's last successful analysis as `results.csv`. |
| `GET /health` | Service availability. |

Example upload, storing the export session cookie locally:

```bash
curl -c /tmp/brasaland-analysis-cookies -F 'file=@scripts/incidents-brasaland-demo.csv' http://localhost:8012/api/incidents/analyze
curl -b /tmp/brasaland-analysis-cookies http://localhost:8012/api/incidents/results/export -o results.csv
```

| Status | Meaning |
| --- | --- |
| `400` | Empty/header-only file, invalid UTF-8, wrong CSV headers, or corrupt quoting. |
| `404` | No successful analysis for this browser, session expired, or cache entry evicted. |
| `413` | Multipart upload exceeds 256 MiB, including multipart overhead. |
| `415` | File does not have a `.csv` extension. |
| `422` | Missing multipart file. |

Files with invalid records still return `200`: invalid rows are counted and
excluded, including files where every row is invalid. No-score averages are
`null`. Failed requests do not overwrite the last successful analysis.

## Data Handling and Deployment

Only aggregate summaries are retained, using a random HttpOnly, SameSite=Strict
cookie to isolate browser sessions. HTTPS enables the Secure cookie flag.
Results expire after one hour; the cache holds at most 128 browser sessions,
evicting the oldest entries when full. The cache is process-local: restarting
the service loses summaries. Use **one worker** for this implementation; a
shared, authenticated store is required before using multiple workers.

Uploaded files are streamed from FastAPI's spooled temporary upload, not stored
in the repository. Temporary files are closed by the request lifecycle. Raw
records and customer identifiers are never included in summaries or exports.
Fonts, icons, and the decorative food photograph are served locally.

This course implementation has no company SSO/authorization. Session isolation
is not authentication. Keep the Codespaces port private and deploy only behind
the company's authenticated internal gateway with HTTPS, upload/rate limits,
encrypted temporary storage, and appropriate retention controls before using
sensitive production data. Avoid request-body logging at the gateway.

## Tests

```bash
.venv/bin/python -m unittest discover -s services/api/tests -p 'test_*.py' -v
```

Tests verify the context benchmark, download contract, browser isolation,
expiration, last successful result, UTF-8/input failures, missing files, and
upload limits for both Content-Length and streamed requests.