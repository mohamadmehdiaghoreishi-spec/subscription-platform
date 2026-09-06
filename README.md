# Subscription Platform

> Backend subscription system built on Cloudflare Workers + D1 SQLite

## Status

🟢 **Live in production:** https://subscription-platform-production.pc-jahan-gh.workers.dev

⚠️ **ZarinPal merchant ID is currently a placeholder — real payments are not yet live.**

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| Language | TypeScript (strict mode) |
| Payments | ZarinPal (checkout + redirect-based callback verification) |
| Testing | Vitest + `@cloudflare/vitest-pool-workers` |

## Architecture Version

`v1.2.2`

## Request Pipeline

```
Request
  → Handler (index.ts)
  → ErrorBoundary
  → SubscriptionPipeline
      → AuthGuard          (API key validation)
      → PolicyResolver     (route access control)
      → QuotaGuard         (daily usage limits)
      → NodeSelector       (routing logic)
      → ExecutorRegistry   (subscription CRUD)
      → SubscriptionBuilder
      → UsageLogger
  → Response
```

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | ❌ | Health check |
| POST | `/auth/create-key` | ❌ | Create API key for subscription |
| GET | `/auth/keys` | ✅ | List API keys |
| POST | `/auth/revoke-key` | ✅ | Revoke an API key |
| GET | `/sub` | ✅ | Build subscription response |
| POST | `/subscribe` | ✅ | Create new subscription |
| GET | `/subscription` | ✅ | Get current subscription |
| GET | `/subscriptions` | ✅ | List subscriptions |
| POST | `/subscription/cancel` | ✅ | Cancel subscription |
| POST | `/billing/checkout` | ✅ | Create ZarinPal checkout session |
| GET | `/billing/invoice` | ✅ | Generate invoice |
| GET | `/payment/callback` | ❌ | ZarinPal payment callback (redirect-based verification, idempotent) |
| GET | `/usage/summary` | ✅ | Usage analytics summary |

## Plans & Quotas

| Plan | Requests/Day |
|------|-------------|
| FREE | 100 |
| BASIC | 1,000 |
| PRO | 10,000 |
| ENTERPRISE | Unlimited |

## Quick Start (Local Dev)

```bash
# 1. Install dependencies
npm install

# 2. Create D1 database
npx wrangler d1 create subscription-platform-db

# 3. Copy the database_id output and paste it in wrangler.toml

# 4. Apply migrations (run all, in order)
npx wrangler d1 execute subscription-platform-db --local --file=migrations/0001_init.sql
npx wrangler d1 execute subscription-platform-db --local --file=migrations/0002_billing_auth.sql
npx wrangler d1 execute subscription-platform-db --local --file=migrations/0003_plans.sql
npx wrangler d1 execute subscription-platform-db --local --file=migrations/0004_subscription_owner.sql
npx wrangler d1 execute subscription-platform-db --local --file=migrations/0005_owner_refactor.sql
npx wrangler d1 execute subscription-platform-db --local --file=migrations/0006_processed_payments.sql

# 5. Start dev server
npm run dev
```

## Deploy to Production

```bash
# Apply migrations to production D1 (run all, in order — see list above)
npx wrangler d1 execute subscription-db-prod --remote --file=migrations/0001_init.sql
# ...through 0006_processed_payments.sql

# Set ZarinPal merchant ID
npx wrangler secret put ZARINPAL_MERCHANT_ID --env production
# ⚠️ placeholder value currently in use — replace with the real merchant ID
# once obtained, then confirm ZARINPAL_SANDBOX is "false" for production

# Deploy
npx wrangler deploy --env production
```

## Environment Variables (wrangler.toml / secrets)

| Variable | Type | Description |
|----------|------|-------------|
| `DB` | D1 binding | Database binding (set in wrangler.toml) |
| `ZARINPAL_MERCHANT_ID` | Secret | ZarinPal merchant ID (set via `wrangler secret put`) — ⚠️ placeholder, real payments are not yet live |
| `ZARINPAL_SANDBOX` | Var | `"true"` / `"false"` — toggles ZarinPal sandbox vs live endpoint |

## Source Structure

```
src/
├── index.ts                    Entry point (Cloudflare Worker fetch handler)
├── types/
│   └── errors.ts               Re-exports from core/errors
├── pipeline/
│   └── SubscriptionPipeline.ts Main pipeline orchestrator (routes all endpoints)
├── core/
│   ├── auth/
│   │   ├── AuthGuard.ts        API key authentication
│   │   └── ApiKeyService.ts    API key CRUD logic
│   ├── billing/
│   │   └── BillingEngine.ts    Invoice generation
│   ├── builders/
│   │   └── SubscriptionBuilder.ts Builds subscription response
│   ├── config/
│   │   └── EnvContext.ts       Worker env bindings (DB, secrets)
│   ├── context/
│   │   └── SubscriptionContext.ts Auth context passed through pipeline
│   ├── errors/
│   │   ├── WorkerError.ts      Typed application error class
│   │   ├── ErrorBoundary.ts    Catches errors, returns HTTP response
│   │   ├── ErrorCode.ts        Enum of error codes
│   │   └── ErrorStatusMap.ts   Maps ErrorCode → HTTP status
│   ├── executor/
│   │   └── ExecutorRegistry.ts Subscription CRUD via repository
│   ├── guard/
│   │   └── QuotaGuard.ts       Daily quota enforcement
│   ├── http/
│   │   └── ApiResponse.ts      Standard response shape helpers
│   ├── logging/
│   │   └── Logger.ts           Structured event logging (request + payment events)
│   ├── payments/
│   │   ├── PaymentService.ts   ZarinPal checkout + callback verification logic
│   │   └── ZarinpalClient.ts   ZarinPal HTTP client (request + verify)
│   ├── plans/
│   │   ├── PlanTypes.ts        PlanType enum + PlanLimits
│   │   └── PlanService.ts      Resolves plan for a subscription
│   ├── policy/
│   │   └── PolicyResolver.ts   Route-based access control
│   ├── routing/
│   │   └── NodeSelector.ts     Selects execution node (default/premium/fallback)
│   ├── usage/
│   │   └── UsageLogger.ts      Logs request to usage table
│   └── validation/
│       ├── RequestSchemas.ts   Per-endpoint request body validators
│       └── ValidationRules.ts  Shared validation primitives
├── domain/
│   ├── entities/
│   │   ├── BillingEntity.ts
│   │   ├── SubscriptionStatus.ts
│   │   └── UsageEntity.ts
│   └── repositories/
│       └── SubscriptionRepository.ts  ISubscriptionRepository interface
└── infrastructure/
    └── d1/
        ├── D1ApiKeyRepository.ts
        ├── D1BillingRepository.ts
        ├── D1PaymentRepository.ts     Idempotency ledger for processed ZarinPal payments
        ├── D1PlanRepository.ts
        ├── D1SubscriptionRepository.ts
        └── D1UsageRepository.ts
```

> Note: `src/core/logger/Logger.ts` is a dead, empty file left over from an
> earlier refactor — the real logger is `src/core/logging/Logger.ts`. Safe to
> delete; see `technical-debt.md` (TD-003).

## Testing

```bash
npm install
npx vitest run
```

Full unit + integration test suite (26 files), including payment-flow
idempotency regression tests. Run `npx tsc --noEmit` for a type-check.
