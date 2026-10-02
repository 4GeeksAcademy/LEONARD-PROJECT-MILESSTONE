# Brasaland Backend Architecture Proposal

## Purpose and context

Brasaland needs a central API to connect 14 restaurants in Colombia and Florida, where sales currently come from separate POS systems and day-to-day operations rely on spreadsheets, calls, and WhatsApp. The same company platform is expected to support location operations, purchasing, customer loyalty and ordering, workforce processes, training, and executive reporting. It must account for two currencies, two markets, and potentially Spanish- and English-speaking users.

This proposal describes a first backend direction, not a final data model or implementation plan. It builds on the repository's existing `services/admin-api` FastAPI scaffold and its stated goal of one centralized company API.

## Recommended pattern: a modular monolith with layered responsibilities

Start with one deployable FastAPI application, organized into business domains and with clear API, application, and persistence responsibilities inside each domain. This is a modular monolith: the modules are separated in code, but deployed and operated together.

This fits Brasaland's current stage for three reasons:

- The technology team is small and is building the company's shared platform from near-zero. One service keeps local development, deployment, and operational ownership manageable.
- The business needs to reconcile information that currently sits in disconnected systems. A central API and a shared source of truth for locations, menus, sales, and suppliers create a practical foundation for operations and reporting.
- The requested capabilities share business data. For example, sales and inventory inform purchasing, while sales and customers inform loyalty and executive reporting. Domain boundaries are important, but splitting them into independently deployed services before those boundaries and integration needs are understood would add coordination and failure modes without a demonstrated benefit.

The API layer handles HTTP concerns, request validation, and response formatting. Application services enforce use-case rules; domain modules own their concepts and persistence access. Keep modules in the same application, but avoid having one domain manipulate another domain's tables directly. Use explicit service interfaces for cross-domain actions. This allows boundaries to become clearer as the system grows and leaves room to extract a module later if its scale, release cadence, or reliability requirements justify it.

This is not a recommendation to put all behavior in one `main.py`, nor to treat FastAPI route handlers as the business layer. It is also not MVC as the primary organizing pattern: a web framework's request/response controller concepts alone do not capture Brasaland's business domains and integrations.

## Proposed service structure

Keep the service under `services/admin-api` initially, since that scaffold already exists. As the API becomes the company-wide backend for both internal and customer-facing clients, revisit the `admin-api` name; “admin” may incorrectly suggest it only serves an internal interface.

```text
services/admin-api/
  app/
    main.py                    # Create the FastAPI app and register top-level routers
    api/
      v1/
        router.py              # Assemble versioned domain routers
    core/
      config.py                # Environment-backed settings
      security.py              # Authentication and shared authorization helpers
    db/
      session.py               # Database connection/session lifecycle
    domains/
      locations/
        router.py               # HTTP endpoints for the locations domain
        schemas.py              # Request/response contracts
        models.py               # Persistence models owned by this domain
        repository.py           # Database queries and persistence operations
        service.py              # Location use cases and business rules
      catalog/
        router.py
        schemas.py
        models.py
        repository.py
        service.py
      sales/
        router.py
        schemas.py
        models.py
        repository.py
        service.py
      procurement/
        router.py
        schemas.py
        models.py
        repository.py
        service.py
      customers/
        router.py
        schemas.py
        models.py
        repository.py
        service.py
      workforce/
        router.py
        schemas.py
        models.py
        repository.py
        service.py
    integrations/
      pos/                       # Adapters for the different POS systems, when scoped
    tests/
      domains/
  requirements.txt
  README.md
```

The domain boundaries reflect the business capabilities and the data each team needs to manage, not the company's org chart. For example, supplier records, price history, and purchase orders belong together in procurement; sales ingestion and reporting belong in sales; restaurant identity and operating details belong in locations. Customer orders and loyalty can start as one customer-facing domain if that keeps initial scope small, then separate when their rules warrant it. Telemetry and training can be added as explicit domains when the first use cases are defined.

Within a domain, routers should depend on application services, services should coordinate business rules, and repositories should own database access. Pydantic request/response schemas are API contracts; they are not automatically the same thing as persistence models. This separation helps prevent a database change from silently changing a public response and makes business rules testable without routing every test through HTTP.

Keep shared concerns such as configuration, database session lifecycle, authentication, and API version assembly outside individual domains. Put POS-specific translation in adapters rather than allowing vendor payloads to spread through core sales and inventory logic. Avoid creating empty abstractions for future systems: add a domain or adapter when there is a real use case to support.

## FastAPI router and endpoint organization

Expose a versioned REST API, initially under `/api/v1`. Keep health checks separate from business resources. Each domain owns its router and the top-level version router includes those routers; endpoint handlers should remain thin and delegate use cases to their domain service.

Initial route groups could include:

| Router/domain | Example endpoints | Responsibility |
| --- | --- | --- |
| Health | `GET /health` | Service liveness/status; not business data |
| Locations | `GET /api/v1/locations`, `GET /api/v1/locations/{location_id}` | Restaurant identity, market, operating details, and location-scoped views |
| Catalog | `GET /api/v1/menus`, `GET /api/v1/menus/{menu_id}` | Menus and items available by market or location |
| Sales | `POST /api/v1/sales/transactions`, `GET /api/v1/sales/reports` | POS transaction intake and authorized sales summaries by date, location, and market |
| Procurement | `GET /api/v1/suppliers`, `GET /api/v1/suppliers/{supplier_id}/prices`, `POST /api/v1/purchase-orders` | Supplier records, price history, and purchase ordering |
| Customers | `POST /api/v1/customers`, `GET /api/v1/customers/{customer_id}`, `GET /api/v1/customers/{customer_id}/orders` | Customer profile and order history, subject to privacy and access rules |
| Loyalty | `GET /api/v1/loyalty/accounts/{customer_id}`, `POST /api/v1/loyalty/transactions` | Brasa Points balance and earn/redeem operations |
| Workforce (later) | `GET /api/v1/locations/{location_id}/employees`, `POST /api/v1/leave-requests` | Employee and leave workflows, with especially restricted access |

Group routes by resource and business capability, using HTTP methods for actions on resources where practical. Apply authorization and location scope consistently: a restaurant manager should not gain access to every location's sales or employee records just because those records share an API. Reports spanning locations should be available only to roles that need chain-level visibility.

Treat currency as part of each monetary value and retain the source amount and currency. Do not sum COP and USD as if they were one unit; any converted consolidated report should state its exchange-rate source and effective date. Record timestamps consistently and convert them for display using the location's timezone. These are data-contract decisions that should be settled before dashboards depend on the results.

## Frontend and backend as separate systems

The frontend and API have separate responsibilities and can be deployed independently even while their code lives in this monorepo. The Next.js application under `uis/talent-pipeline-tracker` already uses a configured API base URL and a small API client instead of embedding fetch logic throughout UI components. Its current `NEXT_PUBLIC_API_URL` points to the course playground, not to `services/admin-api`; connecting it to Brasaland's API will require an intentional environment change and compatible contracts.

The frontend communicates with the backend over HTTPS using the versioned API. Keep the API base URL configurable per environment (local development, test/staging, production). `NEXT_PUBLIC_` variables are delivered to browser code in Next.js, so they may contain a public API origin but must never contain credentials, signing keys, or other secrets. Keep backend secrets and database configuration in server-side environment variables or a managed secret store, not in source control or browser bundles. Document required variable names and safe example values in each service's README.

Because local development and production commonly serve the UI and API from different origins, configure FastAPI CORS middleware with the exact allowed frontend origins for each environment. Allow only the methods and headers the client needs. Do not use a wildcard origin when credentials are enabled; CORS is a browser access policy, not authentication or authorization. Production requests should use HTTPS, and sensitive operations still require backend identity, role, and location-scope checks.

Keeping both systems in this repository supports coordinated changes to API contracts and clients, while keeping them in separate `uis/` and `services/` directories preserves independent responsibilities, dependencies, and deployments. If the team later needs separate repository permissions or release ownership, the API can move without changing this logical boundary; stable versioned contracts and environment configuration matter more than choosing separate repositories now.

## Initial technical decisions

- Use the existing FastAPI service as the single initial API entry point and retain an explicit `/api/v1` prefix for business endpoints.
- Split endpoints into domain routers and register them from the application entry point, following FastAPI's documented multi-file application pattern.
- Use validated request and response schemas as the boundary between HTTP clients and backend use cases. Keep persistence models and API schemas conceptually distinct.
- Prefer a relational source of truth for core entities and transactional workflows such as locations, orders, supplier prices, and loyalty transactions. Confirm the database and migration approach after defining the first data model; this proposal does not prescribe a new database package.
- Configure API origins, database connection details, and secrets per environment. Commit example configuration only, never live credentials.
- Define authentication, role permissions, location scoping, audit needs, and handling of customer and employee personal data before exposing those domains beyond trusted internal users.
- Start with POS ingestion as a domain integration boundary, not a promise of real-time support for every terminal. Confirm each vendor's export/webhook capabilities, identifiers, retry behavior, and data quality before committing to a synchronization design.

## Risks and points of attention

1. **A monolith can become a monolith in name only.** If all endpoints, rules, and data access accumulate in `main.py` or shared utility files, changes become hard to test and domain ownership disappears. Keep routers thin, enforce domain ownership, and test business rules within their modules.
2. **Premature microservices would burden a small team.** Separate databases, deployment pipelines, network calls, and failure handling can slow delivery before there is evidence that independent scaling or release is needed. Extract a service only with a concrete operational or organizational reason and a clear data ownership boundary.
3. **Loose access controls could expose sensitive data across locations or departments.** Customer profiles, employee records, and chain-wide sales are not equally visible to every user. Define roles and location-level authorization in the API; hiding screens in the frontend is insufficient.
4. **Inconsistent source data can undermine reports and purchasing decisions.** The two POS systems may use different identifiers, fields, currencies, and timing semantics. Normalize at the integration boundary, retain source identifiers, make ingestion idempotent, and reconcile totals before treating dashboards as authoritative.
5. **Currency and time assumptions can produce misleading comparisons.** Combining COP and USD without explicit conversion, or grouping transactions by the wrong timezone, can make location and executive reports incorrect. Preserve native values and define conversion and reporting-time policies explicitly.
6. **Uncontrolled CORS or exposed environment values can create avoidable security problems.** Broad CORS rules do not secure an API, and browser-visible variables are public. Restrict origins, keep secrets server-side, and enforce identity and authorization on every protected endpoint.
7. **The word “admin” may narrow the perceived API scope.** The proposed central API is expected to serve internal tools and future customer experiences. Revisit the service name before its consumers and deployment conventions spread.

## Research references

The following official FastAPI documentation informed the structure and configuration decisions:

- [Bigger Applications - Multiple Files](https://fastapi.tiangolo.com/tutorial/bigger-applications/): demonstrates splitting a larger application into modules, defining `APIRouter` instances, and composing them with `include_router`.
- [CORS (Cross-Origin Resource Sharing)](https://fastapi.tiangolo.com/tutorial/cors/): explains origins and configuring CORS middleware when browser clients and APIs use different origins.
- [Settings and Environment Variables](https://fastapi.tiangolo.com/advanced/settings/): describes loading application settings from environment variables and separating configuration from code.

These conventions inform the router, configuration, and CORS choices above; the domain boundaries and single-deployment recommendation come from Brasaland's operating needs and the existing monorepo guidance.