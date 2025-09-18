# Production Readiness TODO

## Backend API
- [x] Fix upload/compression flow so stored filenames match client IDs and compression returns real artifacts.
- [x] Implement true PDF/image optimisation (or integrate a native library/service) with measurable size reduction.
- [x] Align API contract with client expectations (job IDs, status polling, SSE batch endpoints) or simplify client to synchronous flow.
- [ ] Harden authentication (expose validate/refresh endpoints, remove verbose logging of credentials, enforce strong secrets).
- [ ] Replace in-memory/email/cleanup placeholders with production services (queue for cleanup, persistent job store, proper metrics/logging).
- [x] Validate required environment variables at startup and fail fast when misconfigured.
- [x] Add healthcheck that actually tests DB/Redis/external dependencies.

## Frontend Web App
- [x] Update upload/compression UI to match real backend capabilities and remove simulated progress where unnecessary.
- [x] Handle authentication tokens consistently (access/refresh storage, renewal, logout) and surface errors gracefully.
- [x] Add axios/fetch interceptors to auto-attach tokens, refresh on 401, and broadcast auth state changes via context.
- [x] Provide user feedback for long-running compression jobs (spinner/progress fed by real API data).
- [x] Implement polling/SSE hooks tied to `/api/v1/pdf/compress` responses and show queued/processing states per file.
- [ ] Audit pricing/payment flows to use real Stripe publishable key and handle subscription states.
- [ ] Wire pricing page + settings screen to live subscription API, show plan limits, payment history, upgrade/downgrade CTA.
- [x] Harden error/empty states across dashboard, history, payments, and guard premium routes behind feature flags.

## Infrastructure & Ops
- [x] Provision managed Postgres/Redis and wire into configuration.
- [x] Define Terraform/Pulumi stacks for VPC, service accounts, Postgres, Redis, and environment secrets; review for least-privilege.
- [x] Automate DB provisioning: managed Postgres with read replicas, backup schedule, PITR verification, and readiness probes in app config.
- [x] Stand up managed Redis (TLS enforced) with eviction policy, metrics export, and failover testing plan.
- [ ] Migrate file storage to a durable bucket (S3/GCS) with signed URLs and lifecycle policies.
- [ ] Implement CDN/cache headers for downloads and configure bucket replication + retention policies.
- [ ] Add structured logging, tracing, and error reporting (e.g. pino + Sentry) across services.
- [ ] Pipe logs/metrics to centralized stack (CloudWatch/Stackdriver/Grafana), define alert thresholds for latency/error spikes.
- [x] Set up CI/CD with automated testing, linting, and image builds.
- [ ] Gate deployments with smoke tests, blue/green rollouts, and automatic rollback on health regression.
- [ ] Container hardening: run as non-root, minimal base, secrets via env/secret store, tighten rate limits.
- [ ] Add dependency scanning, image signing, and runtime security policies (OPA/PodSecurity) before production deploys.

## Security & Compliance
- [x] Remove default JWT/email secrets and require secure values in prod.
- [x] Eliminate logging of sensitive payloads (passwords, SMTP credentials, tokens).
- [ ] Implement input validation + size checks on all upload endpoints, including batch APIs.
- [ ] Add audit trails for downloads, subscription changes, and admin actions (persisted outside process memory).

## Quality Assurance
- [x] Expand automated test coverage (unit + integration + e2e) for auth, compression, downloads, payments.
- [ ] Stabilise flaky tests and add deterministic fixtures/seeds for file processing cases.
- [ ] Wire automated tests into CI so PRs block on lint, coverage thresholds, and smoke suites.
- [ ] Add load testing for upload/compression pipeline and rate-limiting verification.
- [ ] Capture baseline performance/error metrics from load tests and publish dashboards.
- [ ] Draft manual regression checklist covering signup/login, compression flows, billing, admin tooling.
- [ ] Document runbooks for incidents, cleanup jobs, and data migrations.
- [ ] Define release sign-off criteria (entry/exit) and track QA sign-offs per release.
