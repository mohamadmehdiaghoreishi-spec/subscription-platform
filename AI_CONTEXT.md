# AI_CONTEXT.md — Implementation Guide

> Practical reference for AI agents doing implementation work.
> For project state and bugs: PROJECT_CONTEXT.md
> For permanent rules: CLAUDE.md and PROJECT_RULES.md

---

## 1. Pipeline Flow

```
HTTP Request
  ↓
index.ts → try/catch → ErrorBoundary.toResponse()
  ↓
SubscriptionPipeline.execute()
  ↓
[PUBLIC ROUTES — no auth]
  ├── GET  /                → health check
  ├── POST /auth/create-key → ApiKeyService.create()
  └── POST /webhook/stripe  → PaymentService.verifyWebhook()
  ↓
AuthGuard.authenticate()       reads x-api-key → returns SubscriptionContext
  ↓
PolicyResolver.check()         validates route is in allowedRoutes
  ↓
PlanService.getSubscriptionPlan()
  ↓
QuotaGuard.check()             daily usage vs plan limit
  ↓
[AUTHENTICATED ROUTE HANDLER]
  ↓
UsageLogger.log()
  ↓
JSON Response
```

**Rule:** Never change this order without Architecture Review.

---

## 2. Layer Responsibilities

| Layer | Path | Job |
|-------|------|-----|
| Handler | `src/index.ts` | Receive request, call pipeline, return response |
| Pipeline | `src/pipeline/` | Orchestrate flow — zero business logic |
| Services | `src/core/*/` | All business logic |
| Repositories | `src/infrastructure/d1/` | All D1 access — nothing else |
| Domain | `src/domain/` | Entity interfaces and repository interfaces |
| Errors | `src/core/errors/` | WorkerError, ErrorBoundary, ErrorCode, ErrorStatusMap |

---

## 3. Error Pattern

```typescript
// Always WorkerError — never plain Error
throw new WorkerError({
  code: ErrorCode.NOT_FOUND,
  message: "Subscription not found",
  metadata: { subscriptionId, path: url.pathname }
});
```

`ErrorBoundary.toResponse()` in `index.ts` handles the rest. Unknown errors become 500.

---

## 4. D1 Repository Pattern

```typescript
// Repository — DB access only, returns domain entity
async findById(id: string): Promise<SubscriptionEntity | null> {
  const row = await this.db
    .prepare(`SELECT * FROM subscriptions WHERE id = ?`)
    .bind(id)
    .first<SubscriptionRow>();
  return row ? this.toEntity(row) : null;
}

// Service — uses repository interface, throws WorkerError
async getById(id: string): Promise<SubscriptionEntity> {
  const sub = await this.repo.findById(id);
  if (!sub) throw new WorkerError({ code: ErrorCode.NOT_FOUND, message: "Not found" });
  return sub;
}
```

Never call `D1Database` directly from a service.

---

## 5. Adding a New Authenticated Endpoint

1. Add route to `PolicyResolver.allowedRoutes`
2. Add handler block in `SubscriptionPipeline.execute()`
3. Business logic → appropriate Service
4. DB access → appropriate Repository
5. Schema change? → new `migrations/000N_description.sql`
6. Update `README.md` endpoint table
7. Update `PROJECT_CONTEXT.md` status

---

## 6. Adding a New Public Endpoint

Same as above, but:
- Handle **before** `AuthGuard.authenticate()` in the pipeline
- Add entry to `docs/architecture-notes.md`
- Do NOT add to `PolicyResolver.allowedRoutes`

---

## 7. Risk Analysis (required for non-trivial changes)

| Dimension | Question |
|-----------|----------|
| Technical | Could this affect pipeline order or layer separation? |
| Performance | Does this add DB queries per request? |
| Security | Does this expose new attack surface or internal data? |
| Migration | Does this require a new migration? |
| Maintenance | Does this add a new interface others must keep in sync? |

---

## 8. Bug Fix Requirements

Every bug fix must state:

- **Root cause** — why did the bug exist?
- **Why the fix is correct** — what guarantees it?
- **Regression risk** — what could break?
- **Regression test** — what must be covered?

---

## 9. Output Format (every completed task)

```
## Summary
## Files Changed
- path/to/file.ts — what and why
## Why
## Risks
## Tests Needed
## Documentation Updated
## Next Recommended Task
## Quality Score
Architecture/Maintainability/Security/Performance/Testing — /10 each
(explain any score below 9)
```
