# Roadmap — Subscription Platform

> Updated: 2025-06 | Version: v1.2.2

---

## Milestone 1 — Foundation ✅ DONE
- [x] WorkerError class
- [x] ErrorBoundary
- [x] ErrorStatusMap
- [x] ErrorCode enum

## Milestone 2 — Core Pipeline ✅ DONE
- [x] AuthGuard (API key auth)
- [x] PolicyResolver (route access control)
- [x] QuotaGuard (daily quota)
- [x] NodeSelector (routing)
- [x] SubscriptionContext

## Milestone 3 — Execution Layer ✅ DONE
- [x] ExecutorRegistry (subscription CRUD)
- [x] SubscriptionBuilder
- [x] UsageLogger
- [x] BillingEngine

## Milestone 4 — Database Integration ✅ DONE
- [x] migrations/0001_init.sql
- [x] migrations/0002_billing_auth.sql
- [x] migrations/0003_plans.sql
- [x] D1SubscriptionRepository
- [x] D1ApiKeyRepository
- [x] D1UsageRepository
- [x] D1BillingRepository
- [x] D1PlanRepository

## Milestone 5 — Bug Fixes & Hardening ✅ DONE
- [x] BUG-001: Fix usage table column mismatch (endpoint vs path)
- [x] BUG-002: Fix PolicyResolver — add missing allowed routes
- [x] BUG-003: Fix payment provider key — read from env, not hardcoded
- [x] BUG-004: Fix listSubscriptions filter logic
- [x] BUG-005: Normalize SubscriptionStatus enum values
- [x] BUG-006: Implement real payment webhook/callback verification
- [x] BUG-007: Deduplicate Env interface
- [x] BUG-008: Set real D1 database_id in wrangler.toml

## Milestone 6 — Real Payment Integration ✅ DONE
> Decision (2026-09-02): switched from Stripe to ZarinPal. Stripe does not support
> Iran-based accounts or Iranian cardholders due to sanctions, and this platform's
> users are in Iran. ZarinPal is the standard domestic gateway instead.
- [x] Real ZarinPal REST calls in ZarinpalClient (request + verify)
- [x] Payment callback handling (ZarinPal uses a redirect callback, not a webhook)
- [x] Plan pricing table (PlanPrices) and subscription activation on verified payment

## Milestone 7 — Validation Layer ✅ DONE
- [x] Request body validation for all POST endpoints
- [x] Dedicated validation layer (not in pipeline or services)
- [x] Typed request schemas

## Milestone 8 — Test Coverage ⏳
- [ ] Unit tests: Repository layer
- [ ] Unit tests: Service layer
- [ ] Integration tests: Full pipeline flows
- [ ] Integration tests: ZarinPal payment callback flow

## Milestone 9 — Observability ✅ DONE
- [x] Structured logging (request/response logging)
- [x] Error tracking integration (structured error logs with WorkerError code)
- [x] Usage analytics endpoint (GET /usage/summary)

## Milestone 10 — Production Deploy ⏳
- [ ] Create production D1 database
- [ ] Apply all migrations to production
- [ ] Set all secrets via wrangler secret
- [ ] Deploy with `npm run deploy`
- [ ] Smoke test all endpoints
