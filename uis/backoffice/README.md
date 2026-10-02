# Brasaland Operations Backoffice

Incident analysis is the initial application-menu view. The browser supports
file selection and drag/drop, displays totals, categories, statuses,
satisfaction distribution, and each invalid-rule count, and downloads the
aggregate CSV. Empty, loading, success, no-score, all-invalid, and error states
are supported. A failed upload preserves the last successful summary.

## Build and Run

```bash
npm --prefix uis/backoffice ci
npm --prefix uis/backoffice run build
```

Then run the [FastAPI service](../../services/api/README.md) and open
`http://localhost:8012/backoffice/`. This page requires the API, not a file URL
or independent static server. Generated JavaScript/font bundles are ignored by
Git and must be built before serving.

The interface uses bundled Lucide icons, DM Sans and Space Grotesk fonts, and
a local food photograph. No CDN requests, analytics, or external AI calls occur
at runtime. The photograph is decorative restaurant-food imagery, not a claim
to depict an actual Brasaland location; source:
https://images.unsplash.com/photo-1555939594-58d7cb561ad1

## Browser Verification

Install Chromium with `npm --prefix uis/backoffice exec -- playwright install chromium`.
If browser runtime libraries are missing, install the dependencies recommended
by Playwright using your environment's approved process before testing.

```bash
npm --prefix uis/backoffice test
```

The test configuration starts and stops a test API on port 8012, which must be
free. Tests cover desktop/mobile uploads, metrics and CSV download, drag/drop,
clean validation, malformed and empty files, all-invalid/no-score results,
local assets/fonts/icons, runtime errors, and layout overflow. Tests capture
the script and web screenshots in [docs/incident-analysis](../../docs/incident-analysis/README.md).

Generate the synthetic demo CSV first if it is absent:

```bash
python scripts/generate_incident_demo.py
```