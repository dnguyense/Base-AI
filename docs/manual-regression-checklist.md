# Manual Regression Checklist

## 1. Authentication (Signup/Login/Session)

### Signup & Email Verification
- [ ] Sign up with a new email; verify success response and welcome messaging.
- [ ] Attempt to register with an existing email; ensure informative error.
- [ ] Validate password policy: weak passwords should be rejected client and server side.
- [ ] Verify email flow: confirmation link marks account verified; repeated link usage handled gracefully.
- [ ] Confirm resend verification/forgot password flows do not leak user existence.

### Login & Token Lifecycle
- [ ] Log in with valid credentials; dashboard loads with correct user info.
- [ ] Invalid credentials return generic error (no hint of which field failed).
- [ ] Refresh token flow (`/api/auth/refresh-token`) issues new tokens; client stores updates.
- [ ] Access token expiry triggers silent refresh then retries original request.
- [ ] `/api/auth/validate` confirms session state and refreshes profile details.
- [ ] Logout clears local tokens and protected routes require fresh login.

### Security & Error Handling
- [ ] Inspect logs to confirm no plaintext credentials or tokens are emitted.
- [ ] JWT/refresh secrets inspected in prod build/deployment pipeline (≥32 chars).
- [ ] Rate limiting on auth endpoints enforces lockout after configured attempts.

## 2. Compression & Upload Flows

### Single Upload/Compression
- [ ] Upload valid PDF (<= limit); confirm file ID, preview, and metadata display.
- [ ] Trigger compression with default settings; verify progress UI and final metrics (size reduced, ratio).
- [ ] Download compressed file; confirm integrity and audit entry.

### Batch Upload
- [ ] Upload mixed PDFs via batch flow (<= per-file & total limit); verify job ID and SSE updates.
- [ ] Exceed per-file size; expect 413 with descriptive message.
- [ ] Upload invalid PDF; ensure validation error and cleanup of temp files.

### Edge Cases & Cleanup
- [ ] Upload an empty or zero-byte file; expect clear rejection.
- [ ] Network interruption mid-upload; retry works without orphaned jobs.
- [ ] Completed jobs removed per retention policy; orphaned files cleaned by service.

## 3. Billing & Subscription Management

### Pricing Page & Checkout
- [ ] Pricing tiers load real Stripe publishable key and dynamic pricing from API.
- [ ] Start checkout for each plan (monthly/yearly); verify Stripe session creation and redirect.
- [ ] Cancel checkout midway; ensure UI resets without stale state.

### Subscription Lifecycle
- [ ] Successful subscription activates plan, updates limits, and logs audit entry.
- [ ] Downgrade/upgrade adjusts plan benefits immediately and records audit trail.
- [ ] Reactivation after scheduled cancel restores access.
- [ ] Manual cancel (immediate and period-end) updates UI, backend status, and sends email.
- [ ] Failed invoice triggers notification, keeps audit log, and retains degraded access state.

### Billing History & Entitlements
- [ ] Billing history surfaces accurate invoices/dates pulled from backend.
- [ ] Plan limits enforced server-side (compression/download quotas) per subscription tier.
- [ ] Free user hitting paid feature prompt displays upgrade call-to-action.

## 4. Admin & Operational Tooling

### Admin Dashboards/Endpoints
- [ ] Download audit trail requires admin auth; filters by user/date range accurately.
- [ ] Error logs/feedback endpoints accessible only to admins; audit entries logged for access.
- [ ] Cleanup tooling (status/history/run/emergency/config/storage) respects admin gating and records actions.

### Monitoring & Alerts
- [ ] Healthcheck endpoint reports DB/Redis status; simulate dependency outage to confirm failure mode.
- [ ] Verify structured logs include correlation IDs (where applicable) without leaking sensitive data.
- [ ] Confirm rate limit counters and audit trails populate dashboards (if configured).

## 5. Cross-cutting Quality Checks

- [ ] Smoke test across supported browsers/devices (Chrome, Firefox, Safari, mobile viewports).
- [ ] Accessibility spot-check on critical flows (signup, upload, billing) via keyboard and screen reader basics.
- [ ] Localization/formatting sanity (dates, numbers) align with app defaults.
- [ ] Offline/error boundary states present actionable messaging.
- [ ] Regression of automated suite: run unit/integration/e2e tests and review failures.

## 6. Release Sign-off

- [ ] Checklist reviewed and signed by QA lead.
- [ ] Outstanding issues documented with owners/ETAs.
- [ ] Release notes updated with major changes and known risks.
