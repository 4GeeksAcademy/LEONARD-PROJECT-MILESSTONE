import os
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

from services.api.main import app
from services.api.seed import SUPPLIERS_SEED, seed_database


class SupplierTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.path = Path(self.directory.name) / "suppliers.json"
        self.environment = patch.dict(os.environ, SUPPLIERS_DB_PATH=str(self.path))
        self.environment.start()
        self.client = TestClient(app)
        self.client.__enter__()

    def tearDown(self):
        self.client.__exit__(None, None, None)
        self.environment.stop()
        self.directory.cleanup()

    def test_seed_and_filters(self):
        suppliers = self.client.get("/suppliers").json()
        self.assertEqual(len(suppliers), 15)
        for record, expected in zip(suppliers, SUPPLIERS_SEED):
            for key, value in expected.items():
                self.assertEqual(record[key], value)
            self.assertIsNotNone(datetime.fromisoformat(record["updated_at"]).tzinfo)
        self.assertEqual(seed_database(app.state.suppliers_db), 0)
        for country, count in [("Colombia", 9), ("USA", 6)]:
            records = self.client.get("/suppliers", params={"country": country}).json()
            self.assertEqual(len(records), count)
            self.assertTrue(all(record["country"] == country for record in records))
        records = self.client.get("/suppliers?category=bebidas").json()
        self.assertEqual(len(records), 3)
        records = self.client.get("/suppliers?country=USA&category=carne").json()
        self.assertEqual([record["name"] for record in records], ["Miami Meat Distributors LLC"])

    def test_create_update_and_persistence(self):
        response = self.client.post("/suppliers", json={**SUPPLIERS_SEED[0], "name": "New supplier"})
        self.assertEqual(response.status_code, 201, response.text)
        record = response.json()
        supplier_id = record["id"]
        self.assertEqual(self.client.get(f"/suppliers/{supplier_id}").json(), record)
        before = datetime.now(timezone.utc)
        updated = self.client.patch(f"/suppliers/{supplier_id}/rate", json={"rate_per_unit": 12.5}).json()
        self.assertEqual(updated["rate_per_unit"], 12.5)
        self.assertGreaterEqual(datetime.fromisoformat(updated["updated_at"]), before)
        self.assertNotEqual(updated["updated_at"], record["updated_at"])
        status = self.client.patch(f"/suppliers/{supplier_id}/status", json={"status": "suspended"}).json()
        self.assertEqual(status["status"], "suspended")
        self.assertEqual(status["updated_at"], updated["updated_at"])
        self.client.__exit__(None, None, None)
        self.client.__enter__()
        self.assertEqual(self.client.get(f"/suppliers/{supplier_id}").json(), status)
        self.assertEqual(len(self.client.get("/suppliers").json()), 16)
        self.assertEqual(self.client.delete(f"/suppliers/{supplier_id}").status_code, 200)
        self.assertEqual(self.client.get(f"/suppliers/{supplier_id}").status_code, 404)

    def test_invalid_inputs_never_write(self):
        invalid = [{"country": ""}, {"currency": "USD"}, {"categories": []},
                   {"categories": ["carne", "invalid"]}, {"status": "deleted"},
                   {"rate_per_unit": 0}, {"rate_per_unit": -5}, {"rate_per_unit": True},
                   {"name": "  "}, {"updated_at": "2026-01-01"}, {"contact_email": "invalid"}]
        before = self.path.read_bytes()
        for changes in invalid:
            with self.subTest(changes=changes):
                response = self.client.post("/suppliers", json=SUPPLIERS_SEED[0] | changes)
                self.assertEqual(response.status_code, 422, response.text)
        missing = dict(SUPPLIERS_SEED[0])
        del missing["country"]
        self.assertEqual(self.client.post("/suppliers", json=missing).status_code, 422)
        for rate in [0, -1, True, "10", None]:
            self.assertEqual(self.client.patch("/suppliers/1/rate", json={"rate_per_unit": rate}).status_code, 422)
        self.assertEqual(self.client.patch("/suppliers/1/status", json={"status": "OPEN"}).status_code, 422)
        self.assertEqual(self.client.patch("/suppliers/1/rate", json={"rate_per_unit": 1, "updated_at": "2026-01-01"}).status_code, 422)
        self.assertEqual(self.client.get("/suppliers?category=invalid").status_code, 422)
        self.assertEqual(self.path.read_bytes(), before)

    def test_missing_ids(self):
        for method, url, payload in [
            ("get", "/suppliers/9999", None), ("delete", "/suppliers/9999", None),
            ("patch", "/suppliers/9999/rate", {"rate_per_unit": 1}),
            ("patch", "/suppliers/9999/status", {"status": "active"}),
        ]:
            self.assertEqual(self.client.request(method, url, json=payload).status_code, 404)


if __name__ == "__main__":
    unittest.main()