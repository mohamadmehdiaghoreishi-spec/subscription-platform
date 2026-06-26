# Project Context — Subscription Platform

> Single source of truth for project state. Keep this file updated after every milestone.

---

## Current Version

`v1.2.2` — Architecture Frozen

---

## Current Status

| Item | Status |
|------|--------|
| Worker running locally | ✅ |
| D1 schema migrations | ✅ Written, needs applying |
| Error system (WorkerError, ErrorBoundary) | ✅ Complete |
| Auth (AuthGuard, ApiKeyService) | ✅ Complete |
| QuotaGuard | ✅ Complete |
| PolicyResolver | ⚠️ Bug — blocks valid routes (see Known Bugs) |
| Pipeline wiring | ✅ Complete |
| Repository layer (D1) | ✅ Implemented (needs bug fixes) |
| Stripe integration | ⚠️ MVP stub only — not production-ready |
| Tests | ❌ Not written yet |
| wrangler.toml D1 ID | ❌ Placeholder — must be replaced before deploy |

---

## Active Milestone

**Milestone 5 — Bug Fixes & Production Hardening**

Fix known bugs (listed below) before proceeding to next milestone.

---

## Roadmap

| Milestone | Description | Status |
|-----------|-------------|--------|
| 1 | Foundation: WorkerError, ErrorBoundary, ErrorStatusMap | ✅ Done |
| 2 | Core Pipeline: AuthGuard, QuotaGuard, PolicyResolver, NodeSelector | ✅ Done |
| 3 | Execution Layer: ExecutorRegistry, SubscriptionBuilder | ✅ Done |
| 4 | Database Integration: D1 migrations + repositories | ✅ Done |
| 5 | Bug Fixes & Production Hardening | 🔄 Current |
| 6 | Real Stripe Integration | ⏳ Pending |
| 7 | Validation Layer | ⏳ Pending |
| 8 | Test Coverage | ⏳ Pending |
| 9 | Observability (logging, error tracking) | ⏳ Pending |
| 10 | Production Deploy | ⏳ Pending |

---

## Known Bugs (Must Fix Before Deploy)

### ~~BUG-001~~ — ✅ FIXED — SQL column mismatch in usage table
**Fix:** Migration `0004_rename_usage_endpoint_to_path.sql` renames `endpoint` → `path`. `D1UsageRepository.create()` SQL updated to match.

---

### BUG-002 — PolicyResolver blocks valid routes
**Severity:** 🔴 Critical  
**File:** `src/core/policy/PolicyResolver.ts`  
**Problem:** `allowedRoutes` only contains `/sub`, `/subscribe`, `/billing`. Routes like `/subscription`, `/subscriptions`, `/subscription/cancel`, `/auth/keys`, `/auth/revoke-key` are blocked with 403.  
**Fix:** Add all authenticated routes to `allowedRoutes`.

---

### BUG-003 — Stripe secret key hardcoded
**Severity:** 🔴 Critical  
**File:** `src/pipeline/SubscriptionPipeline.ts`  
**Problem:** `new StripeClient("STRIPE_SECRET_KEY")` — literal string, not env variable.  
**Fix:** Pass `env.STRIPE_SECRET_KEY` from Worker env. Update `Env` interface in `index.ts` and `EnvContext.ts`.

---

### BUG-004 — listSubscriptions filter logic wrong
**Severity:** 🟡 High  
**File:** `src/core/executor/ExecutorRegistry.ts`  
**Problem:** Fetches all subscriptions from DB then filters by `subscription.id === subscriptionId`. This finds the subscription with that exact ID, not all subscriptions belonging to a user. Should filter by `ownerId` or a dedicated field.  
**Fix:** Add `subscriptionId` (owner reference) field to `subscriptions` table, or restructure query in D1SubscriptionRepository.

---

### BUG-005 — SubscriptionStatus enum values inconsistent
**Severity:** 🟡 High  
**File:** `src/domain/entities/SubscriptionStatus.ts`  
**Problem:** `CREATED = "created"` is lowercase while `ACTIVE`, `CANCELED`, `FAILED` are uppercase. SQL comparisons may fail.  
**Fix:** Normalize all values to uppercase: `CREATED = "CREATED"`.

---

### BUG-006 — StripeClient.verifyWebhook not actually verifying
**Severity:** 🟡 High  
**File:** `src/core/payments/StripeClient.ts`  
**Problem:** Webhook verification only checks if payload/signature are non-empty. Any fake signature passes.  
**Fix:** Implement HMAC-SHA256 signature verification using `crypto.subtle` (Web Crypto API — Cloudflare compatible).

---

### BUG-007 — Env interface duplicated
**Severity:** 🟠 Medium  
**File:** `src/index.ts` and `src/core/config/EnvContext.ts`  
**Problem:** `Env` interface defined in two places with different fields.  
**Fix:** Keep single definition in `src/core/config/EnvContext.ts`, import it in `index.ts`.

---

### BUG-008 — wrangler.toml has placeholder D1 database_id
**Severity:** 🟠 Medium (blocks production deploy)  
**File:** `wrangler.toml`  
**Problem:** `database_id = "REPLACE_WITH_YOUR_D1_DATABASE_ID"` — never configured.  
**Fix:** Run `npx wrangler d1 create subscription-platform-db`, paste the resulting ID.

---

## Architecture Rules (Do Not Violate)

- Architecture version `v1.2.2` is **frozen**. No redesign without explicit approval.
- Pipeline order must be preserved: `AuthGuard → PolicyResolver → QuotaGuard → NodeSelector → ExecutorRegistry → SubscriptionBuilder`
- Repository pattern is mandatory. All DB access must go through repository classes.
- Business logic stays in Services, never in repositories or handlers.
- HTTP handlers stay thin. No business logic in `index.ts` or `SubscriptionPipeline.ts`.
- No Node.js-only APIs. Workers runtime only.
