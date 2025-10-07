# Implementation Architecture Plan — STANDARD

## A) Executive Summary
- Outcome, value, non-goals, constraints
- Sources: [ai-docs/research/* you used]

## B) Requirements Traceability
- Functional (FR-1..n)
- Non-Functional (performance, reliability, security, privacy, cost)

## C) Architecture Overview
- Context diagram (ASCII or Mermaid)
- Component interactions / sequence flow
- Data model deltas (schemas, indices, ownership, lifecycle)
- External integrations (auth, quotas, error models)

## D) Decisions (ADR-style)
- ADR-001 <decision> — context, decision, consequences
- Rejected alternatives (with 1–2 trade-offs)

## E) Implementation Plan
- Milestones (M1..M?) with acceptance bars
- Task groups with explicit file paths:
  - Backend
  - Web
  - Mobile
  - Infra/DevOps

## F) API & Contracts
- Surfaces (REST/GraphQL/Socket/Queues)
  | Surface | Method | Path/Channel | Request | Response | Notes |
  |--------|--------|--------------|---------|----------|-------|
- Versioning & compatibility

## G) Testing Strategy
- Unit coverage map (key modules & boundary conditions)
- Integration/Contract tests (producers/consumers)
- Perf/Load (if applicable) and budgets

## H) Security & Compliance
- Threats/abuse cases
- AuthN/Z changes, PII classification, retention, audit logging

## I) Observability & Operations
- Metrics/logs/traces dashboards
- Alarms and runbooks for top-5 failure modes
- Cost considerations (estimate & caps)

## J) Rollout
- Environments, exposure strategy (flags/tenant-scope)
- Migration/backfill steps (if needed), order-of-ops
- Rollback (code + data)

## K) Story Seeds (concise)
- Titles + Acceptance Criteria + DoD only
