# admin-api

Minimal centralized FastAPI service scaffold for this repository.

## Run

```bash
cd services/admin-api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Endpoints

- `GET /health` returns service status.
