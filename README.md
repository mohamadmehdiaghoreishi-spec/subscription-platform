# Subscription Platform

> Backend subscription system built on Cloudflare Workers + D1 SQLite

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| Language | TypeScript (strict mode) |
| Payments | Stripe (webhook + checkout) |

## Architecture Version

`v1.2.2` — **FROZEN** (do not redesign without explicit approval)

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
| POST | `/billing/checkout` | ✅ | Create Stripe checkout session |
| GET | `/billing/invoice` | ✅ | Generate invoice |
| POST | `/webhook/stripe` | ❌ | Stripe webhook receiver |

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

# 4. Apply migrations
npx wrangler d1 execute subscription-platform-db --local --file=migrations/0001_init.sql
npx wrangler d1 execute subscription-platform-db --local --file=migrations/0002_billing_auth.sql
npx wrangler d1 execute subscription-platform-db --local --file=migrations/0003_plans.sql

# 5. Start dev server
npm run dev
```

## Deploy to Production

```bash
# Apply migrations to production D1
npx wrangler d1 execute subscription-platform-db --file=migrations/0001_init.sql
npx wrangler d1 execute subscription-platform-db --file=migrations/0002_billing_auth.sql
npx wrangler d1 execute subscription-platform-db --file=migrations/0003_plans.sql

# Set Stripe secret
npx wrangler secret put STRIPE_SECRET_KEY

# Deploy
npm run deploy
```

## Environment Variables (wrangler.toml / secrets)

| Variable | Type | Description |
|----------|------|-------------|
| `DB` | D1 binding | Database binding (set in wrangler.toml) |
| `STRIPE_SECRET_KEY` | Secret | Stripe API key (set via `wrangler secret put`) |

## Source Structure

```
src/
├── index.ts                    Entry point (Cloudflare Worker fetch handler)
├── types/
│   └── errors.ts               Re-exports from core/errors
├── pipeline/
│   └── SubscriptionPipeline.ts Main pipeline orchestrator
├── core/
│   ├── auth/
│   │   ├── AuthGuard.ts        API key authentication
│   │   └── ApiKeyService.ts    API key CRUD logic
│   ├── billing/
│   │   └── BillingEngine.ts    Invoice generation
│   ├── builders/
│   │   └── SubscriptionBuilder.ts Builds subscription response
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
│   ├── logger/
│   │   └── Logger.ts           (placeholder)
│   ├── payments/
│   │   ├── PaymentService.ts   Stripe checkout + webhook logic
│   │   └── StripeClient.ts     Stripe HTTP client (MVP stub)
│   ├── plans/
│   │   ├── PlanTypes.ts        PlanType enum + PlanLimits
│   │   └── PlanService.ts      Resolves plan for a subscription
│   ├── policy/
│   │   └── PolicyResolver.ts   Route-based access control
│   ├── routing/
│   │   └── NodeSelector.ts     Selects execution node (default/premium/fallback)
│   └── usage/
│       └── UsageLogger.ts      Logs request to usage table
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
        ├── D1PlanRepository.ts
        ├── D1SubscriptionRepository.ts
        └── D1UsageRepository.ts
```
