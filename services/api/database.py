import os
from pathlib import Path
from threading import Lock

from fastapi import Request
from tinydb import TinyDB


database_lock = Lock()
DEFAULT_DATABASE = Path(__file__).resolve().parents[2] / "data" / "suppliers.json"


def open_database() -> TinyDB:
    path = Path(os.environ.get("SUPPLIERS_DB_PATH", str(DEFAULT_DATABASE)))
    path.parent.mkdir(parents=True, exist_ok=True)
    return TinyDB(path, ensure_ascii=False, indent=2)


def get_database(request: Request):
    with database_lock:
        yield request.app.state.suppliers_db