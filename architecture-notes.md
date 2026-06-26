# Architecture Notes

> Log of architecture-affecting decisions made **during implementation** — not decisions already covered in README or AI_CONTEXT.
> Once a decision stabilizes and is no longer under review, it may be promoted to a formal ADR.

---

## How to Add an Entry

Assign the next ID. Only log decisions that affect architecture — not routine implementation choices.

```
## AN-XXX — [TITLE]
- **Date:**
- **Context:** (what situation led to this decision)
- **Decision:** (what was decided)
- **Reason:** (why this option over alternatives)
- **Consequences:** (what does this enable or constrain going forward)
- **Affected Files:**
- **Review Required:** Yes | No
```

---

## AN-001 — Public routes bypass AuthGuard inline inside the pipeline

- **Date:** 2025-06
- **Context:** Routes `/`, `/auth/create-key`, and `/webhook/stripe` must be accessible without an API key. The pipeline runs `AuthGuard.authenticate()` before most handlers.
- **Decision:** Handle these three routes with early-return blocks at the top of `SubscriptionPipeline.execute()`, before `AuthGuard` is invoked.
- **Reason:** Cleanest approach with minimal structural change. Avoids adding conditional auth logic inside `AuthGuard` itself.
- **Consequences:** Any new public route must be explicitly added as an early-return block at the top of the pipeline. Forgetting this causes a 401 on the new route.
- **Affected Files:** `src/pipeline/SubscriptionPipeline.ts`
- **Review Required:** No — but document every new public route here.

---

## AN-002 — D1 repositories return domain entities, not raw rows

- **Date:** 2025-06
- **Context:** D1 `.first()` and `.all()` return raw SQLite row objects. Services consume typed domain entities.
- **Decision:** Each repository is responsible for mapping raw DB rows to domain entity interfaces before returning.
- **Reason:** Keeps services independent of DB schema details. If a column is renamed, only the repository changes.
- **Consequences:** Each repository needs a `toEntity()` mapping step. Currently implemented inline — may be worth extracting to private methods as repositories grow.
- **Affected Files:** `src/infrastructure/d1/*.ts`
- **Review Required:** No.

---

## AN-003 — Stripe key is read from env, not from a config service

- **Date:** 2025-06
- **Context:** BUG-003 — Stripe key was hardcoded as a string literal. Needs to be read from the Worker environment.
- **Decision:** Pass `env.STRIPE_SECRET_KEY` directly from `index.ts` into `SubscriptionPipeline`, then into `StripeClient`. No separate config service at this stage.
- **Reason:** A config service would add a layer of indirection for a single secret. Premature abstraction at current scale.
- **Consequences:** If the number of secrets grows significantly, revisit whether a `ConfigService` or `EnvContext` service should wrap env access.
- **Affected Files:** `src/index.ts`, `src/pipeline/SubscriptionPipeline.ts`, `src/core/payments/StripeClient.ts`, `src/core/config/EnvContext.ts`
- **Review Required:** Yes — revisit at Milestone 6 when Stripe integration is real.

---

## AN-004 — Migration files are append-only, never edited

- **Date:** 2025-06
- **Context:** Schema bugs (e.g. BUG-001: `endpoint` vs `path` column name) need to be fixed.
- **Decision:** Never edit existing migration files. Always create new migrations for schema changes.
- **Reason:** D1 migrations are applied incrementally. Editing an already-applied migration creates a divergence between the schema and migration history.
- **Consequences:** Each bug fix or schema extension requires a new numbered migration file. Migration filenames follow `000N_description.sql`.
- **Affected Files:** `migrations/`
- **Review Required:** No — this is a permanent rule.
