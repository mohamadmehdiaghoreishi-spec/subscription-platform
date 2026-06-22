# AI CONTEXT — Subscription Platform

## IMPORTANT INSTRUCTION FOR ANY AI

You are working on a Cloudflare Worker project called:

👉 Subscription Platform

You must fully understand the repository before making changes.

---

## 1. Project Purpose

This project is a backend subscription system built on:

- Cloudflare Workers (runtime)
- D1 Database (planned)
- Strict layered architecture pipeline

---

## 2. Current Status

- Worker is active and running
- Local development works via wrangler dev
- Basic endpoints implemented

### Endpoints:
- GET / → Subscription Platform Running 🚀
- GET /sub → health check

---

## 3. Architecture (DO NOT CHANGE)

Version: v1.2.2 (FROZEN)

Request Flow:

Handler →
ErrorBoundary →
SubscriptionPipeline →
QuotaGuard →
PolicyResolver →
NodeSelector →
ExecutorRegistry →
SubscriptionBuilder →
RendererRegistry →
Response

---

## 4. RULES (VERY IMPORTANT)

- Do NOT change architecture
- Do NOT redesign system
- Only implement missing modules
- Always follow pipeline order
- Keep Cloudflare Worker as main runtime

---

## 5. Current Milestone

Milestone 1: Foundation Wiring

You should focus ONLY on:

- WorkerError
- ErrorBoundary
- ErrorStatusMap

DO NOT jump to other features.

---

## 6. How AI should work

When you read this repository:

1. First read README.md
2. Then read this file (AI_CONTEXT.md)
3. Understand architecture
4. Continue implementation step-by-step

---

## 7. Output rules for AI

When modifying code:

- Only output necessary code changes
- Do not rewrite full project
- Respect existing structure
- Keep changes minimal and safe

---

## FINAL NOTE

This file is the single source of truth for AI agents working on this repository.