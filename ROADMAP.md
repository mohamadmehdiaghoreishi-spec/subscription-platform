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

## Milestone 5 — Bug Fixes & Hardening 🔄 CURRENT
- [ ] BUG-001: Fix usage table column mismatch (endpoint vs path)
- [ ] BUG-002: Fix PolicyResolver — add missing allowed routes
- [ ] BUG-003: Fix Stripe key — read from env, not hardcoded
- [ ] BUG-004: Fix listSubscriptions filter logic
- [ ] BUG-005: Normalize SubscriptionStatus enum values
- [ ] BUG-006: Implement real Stripe webhook signature verification
- [ ] BUG-007: Deduplicate Env interface
- [ ] BUG-008: Set real D1 database_id in wrangler.toml

## Milestone 6 — Real Stripe Integration ⏳
- [ ] Real Stripe API calls in StripeClient
- [ ] HMAC-SHA256 webhook signature verification
- [ ] Stripe webhook event handling (subscription activated, payment failed, etc.)
- [ ] Plan upgrade/downgrade on payment events

## Milestone 7 — Validation Layer ⏳
- [ ] Request body validation for all POST endpoints
- [ ] Dedicated validation layer (not in pipeline or services)
- [ ] Typed request schemas

## Milestone 8 — Test Coverage ⏳
- [ ] Unit tests: Repository layer
- [ ] Unit tests: Service layer
- [ ] Integration tests: Full pipeline flows
- [ ] Integration tests: Stripe webhook flow

## Milestone 9 — Observability ⏳
- [ ] Structured logging (request/response logging)
- [ ] Error tracking integration
- [ ] Usage analytics endpoint

## Milestone 10 — Production Deploy ⏳
- [ ] Create production D1 database
- [ ] Apply all migrations to production
- [ ] Set all secrets via wrangler secret
- [ ] Deploy with `npm run deploy`
- [ ] Smoke test all endpoints
