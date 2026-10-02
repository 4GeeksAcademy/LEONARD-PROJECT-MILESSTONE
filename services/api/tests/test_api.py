import io
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from services.api.app.main import app, analyses
from incident_analysis.test_analysis import benchmark_rows, csv_source


class ApiTests(unittest.TestCase):
    def setUp(self):
        analyses.clear()
        self.client = TestClient(app)

    def upload(self, rows=None):
        return self.client.post("/api/incidents/analyze", files={
            "file": ("synthetic.csv", csv_source(rows or benchmark_rows()).getvalue().encode(), "text/csv")
        })

    def test_upload_export_and_browser_isolation(self):
        self.assertEqual(self.client.get("/api/incidents/results/export").status_code, 404)
        response = self.upload()
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["satisfaction"]["average"], 3.46)
        self.assertEqual(response.json()["invalid_records"], 4)
        self.assertIn("HttpOnly", response.headers["set-cookie"])
        exported = self.client.get("/api/incidents/results/export")
        self.assertEqual(exported.status_code, 200)
        self.assertIn('filename="results.csv"', exported.headers["content-disposition"])
        self.assertIn("satisfaction.average,3.46", exported.text)
        self.assertNotIn("BRS-000001", exported.text)
        with TestClient(app) as other:
            self.assertEqual(other.get("/api/incidents/results/export").status_code, 404)

    def test_input_errors_and_last_successful_result(self):
        self.upload()
        cases = (("empty.csv", b"", 400), ("bad.csv", b"name,email\n", 400),
                 ("wrong.txt", b"hello", 415), ("encoding.csv", b"\xff", 400))
        for filename, content, expected in cases:
            with self.subTest(filename=filename):
                response = self.client.post("/api/incidents/analyze", files={"file": (filename, content)})
                self.assertEqual(response.status_code, expected, response.text)
                self.assertIn("detail", response.json())
        self.assertEqual(self.client.get("/api/incidents/results/export").status_code, 200)
        self.assertEqual(self.client.post("/api/incidents/analyze").status_code, 422)

    def test_upload_limit(self):
        with patch("services.api.app.main.MAX_UPLOAD_BYTES", 20):
            response = self.upload()
            self.assertEqual(response.status_code, 413)
            def chunks():
                yield b"x" * 21
            response = self.client.post("/api/incidents/analyze", content=chunks(), headers={"Content-Type": "multipart/form-data; boundary=abc"})
            self.assertEqual(response.status_code, 413, response.text)

    def test_expiration_and_latest_result(self):
        self.upload()
        response = self.upload([benchmark_rows()[50]])
        self.assertEqual(response.json()["total_records"], 1)
        self.assertIn("total_records,1", self.client.get("/api/incidents/results/export").text)
        with patch("services.api.app.main.SESSION_TTL", 0):
            self.assertEqual(self.client.get("/api/incidents/results/export").status_code, 404)


if __name__ == "__main__":
    unittest.main()