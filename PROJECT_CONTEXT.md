# Subscription Platform — Project Context

## Status
Cloudflare Worker project is active and running locally via wrangler dev.

## Endpoints
- GET / → Subscription Platform Running 🚀
- GET /sub → health check endpoint

## Architecture Version
v1.2.2 (FROZEN)

## Core Flow
Request → Handler → ErrorBoundary → SubscriptionPipeline → QuotaGuard → PolicyResolver → NodeSelector → ExecutorRegistry → SubscriptionBuilder → RendererRegistry → Response

## Current Phase
Milestone 1: Foundation Wiring

## In Progress
- WorkerError
- ErrorBoundary
- ErrorStatusMap

## Note
This file is the single source of truth for any AI assistant working on this project.