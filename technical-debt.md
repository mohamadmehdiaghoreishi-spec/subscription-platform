# Technical Debt Backlog

> Treat this as a lightweight issue tracker.
> Do NOT fix items here unless they block a current task or are scheduled in the active milestone.
> Add new items during implementation. Review and reprioritize before each milestone.

---

## How to Add an Item

Copy the template below, assign the next ID, and append to this file.

```
## TD-XXX — [TITLE]
- **Category:**
- **Severity:** Critical | High | Medium | Low
- **Priority:** P1 | P2 | P3 | P4
- **Affected Files:**
- **Description:**
- **Why It Exists:**
- **Suggested Fix:**
- **Estimated Complexity:** XS | S | M | L | XL
- **Blocked By:** (TD-ID or "none")
- **Target Milestone:** (milestone number or "backlog")
```

---

## TD-001 — StripeClient is a non-functional stub

- **Category:** Architecture / Security
- **Severity:** High
- **Priority:** P2
- **Affected Files:**
  - `src/core/payments/StripeClient.ts`
  - `src/core/payments/PaymentService.ts`
- **Description:** `createCheckoutSession` returns fake data. `verifyWebhook` accepts any non-empty signature as valid. No real Stripe API calls are made.
- **Why It Exists:** Stripe integration was deferred to keep Milestone 4 focused on D1 repositories.
- **Suggested Fix:** Implement real `fetch`-based Stripe REST calls. Replace webhook verification with HMAC-SHA256 using `crypto.subtle` (Web Crypto — Workers native).
- **Estimated Complexity:** M
- **Blocked By:** BUG-003 (Stripe key must be read from env first)
- **Target Milestone:** 6

---

## TD-002 — No input validation on any endpoint

- **Category:** Security / Maintainability
- **Severity:** High
- **Priority:** P2
- **Affected Files:**
  - `src/pipeline/SubscriptionPipeline.ts` (all POST handlers)
- **Description:** Request bodies are cast directly with `as { field: type }` — no runtime validation. Malformed input silently fails or causes unhandled errors.
- **Why It Exists:** Validation layer was planned for Milestone 7 and intentionally deferred.
- **Suggested Fix:** Create `src/core/validation/` with typed validators for each request shape. No external libraries — pure TypeScript + WorkerError.
- **Estimated Complexity:** M
- **Blocked By:** none
- **Target Milestone:** 7

---

## TD-003 — Logger.ts is an empty placeholder

- **Category:** Maintainability / Documentation
- **Severity:** Medium
- **Priority:** P3
- **Affected Files:**
  - `src/core/logger/Logger.ts`
- **Description:** File exists but has no implementation. Nothing is structured-logged.
- **Why It Exists:** Logging was deferred during initial pipeline implementation.
- **Suggested Fix:** Implement structured JSON logging via `console.log` (Cloudflare Workers compatible). Fields: timestamp, path, method, status, subscriptionId, durationMs.
- **Estimated Complexity:** S
- **Blocked By:** none
- **Target Milestone:** 9

---

## TD-004 — subscriptions table has no owner reference field

- **Category:** Architecture
- **Severity:** High
- **Priority:** P2
- **Affected Files:**
  - `src/core/executor/ExecutorRegistry.ts`
  - `src/infrastructure/d1/D1SubscriptionRepository.ts`
  - `migrations/`
- **Description:** `listSubscriptions` fetches all rows then filters by `subscription.id === subscriptionId`. This is semantically wrong — the subscription's primary key is not the owner reference.
- **Why It Exists:** The data model was simplified during initial D1 integration. Owner reference was not designed in.
- **Suggested Fix:** Add migration `0004_add_owner_id.sql` with `ownerId TEXT NOT NULL` on `subscriptions`. Update `D1SubscriptionRepository.list()` to accept `ownerId`. Update `ExecutorRegistry`.
- **Estimated Complexity:** M
- **Blocked By:** BUG-004
- **Target Milestone:** 5

---

## TD-005 — No pre-auth rate limiting

- **Category:** Security / Performance
- **Severity:** Medium
- **Priority:** P3
- **Affected Files:**
  - `src/pipeline/SubscriptionPipeline.ts`
  - `wrangler.toml`
- **Description:** `QuotaGuard` enforces per-subscription daily limits, but runs after auth. No protection exists at the edge before auth is attempted.
- **Why It Exists:** Rate limiting was not in scope for Milestone 1–4.
- **Suggested Fix:** Use Cloudflare Rate Limiting rules in `wrangler.toml`, or add a lightweight IP-based counter using the Workers `cf` object before the pipeline.
- **Estimated Complexity:** S
- **Blocked By:** none
- **Target Milestone:** 9

---

## TD-006 — ApiResponse helper is defined but never used

- **Category:** Maintainability
- **Severity:** Low
- **Priority:** P4
- **Affected Files:**
  - `src/core/http/ApiResponse.ts`
  - `src/pipeline/SubscriptionPipeline.ts`
  - `src/index.ts`
- **Description:** `ApiResponse.success()` and `ApiResponse.error()` exist but all handlers construct response objects inline. Response shapes are inconsistent across routes.
- **Why It Exists:** The helper was created before the pipeline was fully wired. The pipeline was written independently.
- **Suggested Fix:** Standardize all response construction through `ApiResponse`. Remove all inline `{ success: true, data: ... }` literals.
- **Estimated Complexity:** S
- **Blocked By:** none
- **Target Milestone:** 7

---

## TD-007 — D1 repositories use untyped row results

- **Category:** Maintainability
- **Severity:** Medium
- **Priority:** P3
- **Affected Files:**
  - `src/infrastructure/d1/*.ts`
- **Description:** `.first<any>()` and `.all<any>()` are used throughout. No typed row interfaces exist for DB results.
- **Why It Exists:** Typed D1 row interfaces were deferred to keep repository implementation fast.
- **Suggested Fix:** Define `*Row` interfaces (e.g. `SubscriptionRow`, `ApiKeyRow`) in each repository file. Replace all `any` casts.
- **Estimated Complexity:** S
- **Blocked By:** none
- **Target Milestone:** 8
