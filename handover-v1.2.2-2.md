# Handover — v1.2.2

> For project status and bugs: PROJECT_CONTEXT.md
> For architecture decisions: docs/architecture-notes.md
> This file contains only what isn't documented elsewhere: database schema detail and critical deploy notes.

---

## Database Schema

### `subscriptions`
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| node | TEXT | `default` / `premium` / `fallback` |
| status | TEXT | ⚠️ inconsistent case — see BUG-005 |
| payload | TEXT | JSON blob |
| createdAt | TEXT | ISO 8601 |

### `api_keys`
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| key | TEXT UNIQUE | 64-char random hex |
| subscriptionId | TEXT | FK → subscriptions.id |
| status | TEXT | `active` / `revoked` |
| createdAt | TEXT | ISO 8601 |

### `usage`
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| subscriptionId | TEXT | FK → subscriptions.id |
| endpoint | TEXT | ⚠️ BUG-001: code inserts column named `path` |
| createdAt | TEXT | ISO 8601 |

### `billing`
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| subscriptionId | TEXT | FK → subscriptions.id |
| usageCount | INTEGER | |
| cost | REAL | usageCount × 0.001 |
| periodStart | TEXT | ISO 8601 |
| periodEnd | TEXT | ISO 8601 |
| createdAt | TEXT | ISO 8601 |

### `plans`
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | `free` / `basic` / `pro` / `enterprise` |
| name | TEXT UNIQUE | `FREE` / `BASIC` / `PRO` / `ENTERPRISE` |
| createdAt | TEXT | ISO 8601 |

### `subscription_plans`
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| subscriptionId | TEXT | FK → subscriptions.id |
| planId | TEXT | FK → plans.id |
| createdAt | TEXT | ISO 8601 |

---

## Critical Notes Before Deploy

1. Do NOT deploy until BUG-001, BUG-002, BUG-003 are fixed.
2. Do NOT use real Stripe keys until BUG-006 (webhook verification) is fixed.
3. `wrangler.toml` has a placeholder `database_id` — replace before any deploy.
4. Apply all three migrations locally before testing, all three to production before deploying.
