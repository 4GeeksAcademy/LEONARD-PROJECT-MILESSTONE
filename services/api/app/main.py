import io
import secrets
import sys
import threading
import time
from collections import OrderedDict
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, Request, Response, UploadFile
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles


ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "packages"))

from incident_analysis import AnalysisError, RULES, analyze_csv, results_csv


MAX_UPLOAD_BYTES = 256 * 1024 * 1024
SESSION_TTL = 3600
MAX_SESSIONS = 128
COOKIE_NAME = "brasaland_analysis"
analyses = OrderedDict()
cache_lock = threading.Lock()


class UploadLimitMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        headers = dict(scope.get("headers", []))
        content_length = headers.get(b"content-length", b"0")
        if content_length.isdigit() and int(content_length) > MAX_UPLOAD_BYTES:
            return await JSONResponse(
                status_code=413, content={"detail": "Upload exceeds the 256 MiB limit."}
            )(scope, receive, send)
        received = 0

        async def limited_receive():
            nonlocal received
            message = await receive()
            received += len(message.get("body", b""))
            if received > MAX_UPLOAD_BYTES:
                raise HTTPException(413, "Upload exceeds the 256 MiB limit.")
            return message

        await self.app(scope, limited_receive, send)


app = FastAPI(title="Brasaland Incident Analysis API", version="1.0.0")
app.add_middleware(UploadLimitMiddleware)


def expire_cache() -> None:
    now = time.monotonic()
    for token, (created, _) in list(analyses.items()):
        if now - created >= SESSION_TTL:
            del analyses[token]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/incidents/analyze")
def analyze_incidents(request: Request, response: Response, file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(415, "Select a .csv file encoded as UTF-8.")
    source = io.TextIOWrapper(file.file, encoding="utf-8-sig", newline="")
    try:
        summary = analyze_csv(source)
    except AnalysisError as error:
        raise HTTPException(400, str(error)) from error
    finally:
        source.detach()
    with cache_lock:
        expire_cache()
        existing = request.cookies.get(COOKIE_NAME)
        token = existing if existing in analyses else secrets.token_urlsafe(32)
        analyses[token] = (time.monotonic(), summary)
        analyses.move_to_end(token)
        while len(analyses) > MAX_SESSIONS:
            analyses.popitem(last=False)
    response.set_cookie(
        COOKIE_NAME, token, max_age=SESSION_TTL, httponly=True,
        samesite="strict", secure=request.url.scheme == "https", path="/api/incidents",
    )
    response.headers["Cache-Control"] = "no-store"
    return {**summary, "rule_labels": RULES}


@app.get("/api/incidents/results/export")
def export_results(request: Request):
    with cache_lock:
        expire_cache()
        cached = analyses.get(request.cookies.get(COOKIE_NAME))
    if cached is None:
        raise HTTPException(404, "No analysis is available for this browser. Upload a CSV first; results expire after one hour.")
    return Response(
        content=results_csv(cached[1]), media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="results.csv"', "Cache-Control": "no-store"},
    )


@app.get("/")
def home():
    return RedirectResponse("/backoffice/")


frontend = ROOT / "uis" / "backoffice" / "public"
if frontend.exists():
    app.mount("/backoffice", StaticFiles(directory=frontend, html=True), name="backoffice")