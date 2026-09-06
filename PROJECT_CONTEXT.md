# Project Context — Subscription Platform

> Single source of truth for project state. Keep this file updated after every milestone.

---

## Current Version

`v1.2.2`

---

## Current Status

| Item | Status |
|------|--------|
| Worker running locally | ✅ |
| Deployed to production | ✅ https://subscription-platform-production.pc-jahan-gh.workers.dev |
| D1 schema migrations | ✅ Applied to production (`subscription-db-prod`) |
| Error system (WorkerError, ErrorBoundary) | ✅ Complete |
| Auth (AuthGuard, ApiKeyService) | ✅ Complete |
| QuotaGuard | ✅ Complete |
| PolicyResolver | ✅ Complete (BUG-002 fixed) |
| Pipeline wiring | ✅ Complete |
| Repository layer (D1) | ✅ Complete |
| ZarinPal integration | ✅ Complete — ⚠️ merchant ID is currently a placeholder, real payments are not yet live |
| Payment callback idempotency | ✅ Complete (`D1PaymentRepository`, migration `0006`) |
| Payment-specific logging | ✅ Complete (checkout/verify/duplicate/gateway-error events) |
| Validation layer | ✅ Complete (`RequestSchemas.ts`, `ValidationRules.ts`) |
| Tests | ✅ 26 files, unit + integration (`tests/`) |
| wrangler.toml D1 ID | ✅ Real production D1 ID set (`subscription-db-prod`) |

---

## Active Milestone

**All milestones (1–10) complete. Project is live in production.**

Current focus is post-launch hardening: `/`-and-`/sub` health checks don't yet
verify D1 connectivity, and no alerting exists for payment failures. See
`technical-debt.md` for the current punch list.

---

## Roadmap

| Milestone | Description | Status |
|-----------|-------------|--------|
| 1 | Foundation: WorkerError, ErrorBoundary, ErrorStatusMap | ✅ Done |
| 2 | Core Pipeline: AuthGuard, QuotaGuard, PolicyResolver, NodeSelector | ✅ Done |
| 3 | Execution Layer: ExecutorRegistry, SubscriptionBuilder | ✅ Done |
| 4 | Database Integration: D1 migrations + repositories | ✅ Done |
| 5 | Bug Fixes & Production Hardening | ✅ Done |
| 6 | Real Payment Integration (ZarinPal) | ✅ Done |
| 7 | Validation Layer | ✅ Done |
| 8 | Test Coverage | ✅ Done |
| 9 | Observability (logging, error tracking) | ✅ Done |
| 10 | Production Deploy | ✅ Done |

---

## Known Bugs — Historical Log

### ~~BUG-001~~ — ✅ FIXED — SQL column mismatch in usage table
**Fix:** Migration renamed `endpoint` → `path`. `D1UsageRepository.create()` SQL updated to match.

---

### ~~BUG-002~~ — ✅ FIXED — PolicyResolver blocks valid routes
**Severity:** 🔴 Critical (resolved)
**File:** `src/core/policy/PolicyResolver.ts`
**Fix:** All authenticated routes added to `allowedRoutes`.

---

### ~~BUG-003~~ — ✅ FIXED — Payment provider key hardcoded
**Severity:** 🔴 Critical (resolved)
**File:** `src/pipeline/SubscriptionPipeline.ts`
**Problem:** Payment client was constructed with a literal secret string instead of reading from env.
**Fix:** `ZarinpalClient` now reads `env.ZARINPAL_MERCHANT_ID` / `env.ZARINPAL_SANDBOX`. This coincided with the Stripe → ZarinPal switch (Milestone 6).

---

### ~~BUG-004~~ — ✅ FIXED — listSubscriptions filter logic wrong
**Severity:** 🟡 High (resolved)
**File:** `src/core/executor/ExecutorRegistry.ts`

---

### ~~BUG-005~~ — ✅ FIXED — SubscriptionStatus enum values inconsistent
**Severity:** 🟡 High (resolved)
**File:** `src/domain/entities/SubscriptionStatus.ts`

---

### ~~BUG-006~~ — ✅ FIXED — Payment verification was not actually verifying
**Severity:** 🟡 High (resolved)
**File:** `src/core/payments/ZarinpalClient.ts` (was `StripeClient.ts`)
**Problem:** Original Stripe-era check only tested for a non-empty payload/signature.
**Fix:** ZarinPal doesn't use webhook signing — the redirect callback's `Authority`
is verified server-to-server via ZarinPal's `verify` API before activation.

---

### ~~BUG-007~~ — ✅ FIXED — Env interface duplicated
**Severity:** 🟠 Medium (resolved)
**Files:** `src/index.ts`, `src/core/config/EnvContext.ts`

---

### ~~BUG-008~~ — ✅ FIXED — wrangler.toml had placeholder D1 database_id
**Severity:** 🟠 Medium (resolved — production ID set to `subscription-db-prod`)

---

### ~~BUG-009~~ — ✅ FIXED — Payment callback was not idempotent
**Severity:** 🔴 Critical (resolved)
**Files:** `src/pipeline/SubscriptionPipeline.ts`, `src/infrastructure/d1/D1PaymentRepository.ts`, migration `0006_processed_payments.sql`
**Problem:** `/payment/callback` re-verified and re-activated on every call for
the same `Authority` (Zarinpal retry, refresh, double tab), with no record of
already-processed payments.
**Fix:** `D1PaymentRepository.tryClaim()` atomically claims an `Authority`
(PRIMARY KEY insert) before activation; a duplicate claim short-circuits and
returns the original result without re-verifying or re-activating. Rolled
back on activation failure so a genuine retry can still succeed.

---

### ~~BUG-010~~ — ✅ FIXED — Raw ZarinPal error leaked to clients
**Severity:** 🟡 Medium (resolved)
**Files:** `src/core/payments/ZarinpalClient.ts`, `src/core/errors/ErrorBoundary.ts`
**Problem:** A failed ZarinPal request threw a plain `Error` with the raw
gateway response inlined in the message, which `ErrorBoundary`'s fallback
path returned verbatim to the client.
**Fix:** `ZarinpalClient` now throws a `WorkerError` (`PAYMENT_GATEWAY_ERROR`)
with a generic client-facing message; the raw gateway payload is tagged
`metadata.internalOnly: true`, which `ErrorBoundary` strips before the
response is sent and logs server-side instead.

---

## Known Gaps (Not Bugs — Tracked Separately)

- `/` and `/sub` health checks don't verify D1 connectivity — see `technical-debt.md`.
- No alerting on repeated payment failures (Sentry or equivalent) — deferred until
  business direction for the project is clearer.
- `src/core/logger/Logger.ts` is a dead, empty file — see `technical-debt.md` (TD-003).

---

## Architecture Rules (Do Not Violate)

- Pipeline order must be preserved: `AuthGuard → PolicyResolver → QuotaGuard → NodeSelector → ExecutorRegistry → SubscriptionBuilder`
- Repository pattern is mandatory. All DB access must go through repository classes.
- Business logic stays in Services, never in repositories or handlers.
- HTTP handlers stay thin. No business logic in `index.ts` or `SubscriptionPipeline.ts`.
- No Node.js-only APIs. Workers runtime only.
