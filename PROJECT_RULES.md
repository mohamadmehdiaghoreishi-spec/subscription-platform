# PROJECT_RULES.md — Permanent Project Conventions

> These rules almost never change.
> They apply to every file, every engineer, and every AI agent working on this repository.
> When in doubt, follow these rules exactly.

---

## 1. Naming Conventions

### Files
- Classes → `PascalCase.ts` (e.g. `AuthGuard.ts`, `D1SubscriptionRepository.ts`)
- Interfaces → `PascalCase.ts` (same file as the class that uses them, or in `domain/`)
- Enums → `PascalCase.ts` (e.g. `ErrorCode.ts`, `SubscriptionStatus.ts`)

### Classes
- Services: `[Domain]Service` — e.g. `PlanService`, `ApiKeyService`
- Guards: `[Domain]Guard` — e.g. `AuthGuard`, `QuotaGuard`
- Repositories: `D1[Domain]Repository` — e.g. `D1SubscriptionRepository`
- Registries: `[Domain]Registry` — e.g. `ExecutorRegistry`
- Engines: `[Domain]Engine` — e.g. `BillingEngine`
- Builders: `[Domain]Builder` — e.g. `SubscriptionBuilder`
- Clients: `[Provider]Client` — e.g. `StripeClient`

### Variables & Functions
- `camelCase` always
- Booleans: `is*`, `has*`, `can*` prefix (e.g. `isActive`, `hasQuota`)
- Async functions: no special prefix — let the return type `Promise<T>` speak

### Database Columns
- `camelCase` (e.g. `subscriptionId`, `createdAt`)
- Primary keys: always `id TEXT PRIMARY KEY`
- Timestamps: always `createdAt TEXT` in ISO 8601

---

## 2. Folder Conventions

```
src/
├── index.ts                  Worker entry point only — no business logic
├── types/                    Global re-exports and shared type aliases
├── pipeline/                 Pipeline orchestrators only
├── core/
│   ├── auth/                 Authentication services and guards
│   ├── billing/              Billing logic
│   ├── builders/             Response builders
│   ├── config/               Environment and config interfaces
│   ├── context/              Request context types passed through pipeline
│   ├── errors/               Error classes, codes, boundary
│   ├── executor/             Subscription execution logic
│   ├── guard/                Quota and access guards
│   ├── http/                 HTTP response helpers
│   ├── logger/               Logging
│   ├── payments/             Payment provider clients and services
│   ├── plans/                Plan types and plan resolution
│   ├── policy/               Route access policy
│   ├── routing/              Node selection and routing
│   └── usage/                Usage tracking
├── domain/
│   ├── entities/             Domain entity interfaces
│   └── repositories/         Repository interfaces (not implementations)
└── infrastructure/
    └── d1/                   D1 repository implementations
```

**Rule:** New modules go into the most specific existing folder. Only create a new folder if the module genuinely belongs to a new domain.

---

## 3. Error Convention

- All application errors must use `WorkerError` — never throw plain `Error`.
- `WorkerError` requires `code: ErrorCode` and `message: string`.
- Include `metadata` for debugging context (path, subscriptionId, etc.).
- Never expose stack traces in HTTP responses.
- `ErrorBoundary.toResponse()` is the only place errors are converted to HTTP responses.

```typescript
// ✅ Correct
throw new WorkerError({
  code: ErrorCode.NOT_FOUND,
  message: "Subscription not found",
  metadata: { subscriptionId, path: url.pathname }
});

// ❌ Wrong
throw new Error("not found");
```

---

## 4. Logging Convention

- Use `console.log` with structured JSON — Cloudflare Workers captures this.
- Log format: `{ timestamp, level, path, method, subscriptionId?, durationMs?, message }`
- Levels: `info` | `warn` | `error`
- Never log secrets, API keys, or full request bodies.
- Errors are logged by `ErrorBoundary` — do not double-log in services.

---

## 5. Testing Convention

- Test files live next to the file they test: `AuthGuard.test.ts` beside `AuthGuard.ts`
- Unit tests: one file per class
- Integration tests: `tests/integration/` at root level
- Test naming: `describe('[ClassName]') > it('[method] should [expected behavior] when [condition]')`
- Never mock the D1 database in unit tests — use a test double or in-memory stub
- Every bug fix must include a regression test

---

## 6. Repository Convention

- Repositories only access D1. No business logic.
- Every repository implements an interface from `domain/repositories/`.
- Methods return domain entities, not raw DB rows.
- All SQL uses parameterized queries — never string interpolation.
- Column names in SQL match migration schema exactly.
- If a column is renamed, create a new migration — do not edit existing ones.

```typescript
// ✅ Correct
await this.db.prepare(`SELECT * FROM subscriptions WHERE id = ?`).bind(id).first();

// ❌ Wrong — SQL injection risk
await this.db.prepare(`SELECT * FROM subscriptions WHERE id = '${id}'`).run();
```

---

## 7. Service Convention

- Services contain all business logic.
- Services depend on repository interfaces, not implementations.
- Services never access `D1Database` directly.
- Services never construct `Response` objects.
- Services throw `WorkerError` for business rule violations.
- One class, one responsibility.

---

## 8. Pipeline Convention

- Pipeline steps execute in strict order: `AuthGuard → PolicyResolver → QuotaGuard → [route handler]`
- Public routes (no auth required) are handled before `AuthGuard` with early-return blocks.
- The pipeline orchestrates — it does not contain business logic.
- Any new authenticated route must be added to `PolicyResolver.allowedRoutes`.
- Any new public route must be documented in `docs/architecture-notes.md`.

---

## 9. Security Convention

- Never hardcode secrets. Read from `env.*` only.
- Validate every external input before use.
- Never trust request bodies — cast and validate explicitly.
- Never expose internal error details (stack traces, DB errors) in HTTP responses.
- Webhook endpoints must verify signatures before processing payloads.
- Follow least privilege: services receive only the repository they need.

---

## 10. Migration Convention

- Never edit existing migration files.
- New file for every schema change: `migrations/000N_short_description.sql`.
- Every migration must be idempotent where possible (`CREATE TABLE IF NOT EXISTS`).
- Breaking schema changes require a transition migration (add new column → backfill → drop old column across separate migrations).
- Apply locally before production: `npx wrangler d1 execute ... --local` first.
