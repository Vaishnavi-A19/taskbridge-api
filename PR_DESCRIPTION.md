PR: Add Notification & Audit Service + Remediated Project Service

Summary
- Remediated Project Service (entities, repository, service, controller) with tenant isolation, validation, structured logging, and audit hooks.
- New Notification & Audit Service that persists immutable audit entries and creates notifications for project team members.
- Tests: Jest test suite covering main flows and security checks.
- Spec, review, impact analysis, and prompts included.

AI Tool Disclosure
- Tools used: GitHub Copilot (code generation, chat spec drafting, test generation).
- Accepted AI output vs override:
  - Contractor files (src/projects/generated_*) were produced by Copilot and saved unmodified per the assignment.
  - All remediation code was drafted using Copilot prompts but reviewed and corrected by hand (I enforced tenant filters, replaced raw SQL with TypeORM, added validation, auth, and logging).
  - Approximation: ~40% AI-generated snippets, ~60% manually written/adapted and reviewed.

Integration & contracts
- Project Service calls Notification & Audit Service POST /audit (internal-only with X-SERVICE-TOKEN) on milestone create/update/delete. The payload contains actor (userId, orgId), prevState, newState, eventType, and optional ipAddress.
- Notification & Audit Service persists audit entries (append-only) and creates notifications for team members.

Testing coverage & gaps
- Provided tests cover core behaviors and tenant isolation.
- Known gaps: end-to-end test across both services (mocked via service client), load/performance tests, encryption-at-rest verification for sensitive fields.

Genuine risk/trade-off
- Using an internal HTTP call for audit dispatch from Project Service is simple but introduces coupling and potential blocking. A future improvement is to use an internal message bus (Rabbit/Kafka) for decoupling and resiliency.

Self-review checklist before submitting
- [x] All endpoints validated with DTOs
- [x] Tenant isolation enforced
- [x] Audit immutability enforced at service layer
- [x] Internal-only endpoints require service token
- [x] Tests for main flows and security scenarios included
- [x] Copilot prompts saved in repo per instruction

Peer Review Simulation (3 comments)
1) File: src/projects/service/ProjectService.ts
   Comment: "When calling auditClient.postAudit, you swallow errors silently. Please log the failure with a structured logging call including projectId and actor, and consider a retry/backoff for transient failures. This avoids silent loss of audit records."
   Rationale: Observability and reliability.

2) File: src/notifications/repository/NotificationsRepository.ts
   Comment: "The query uses JSON extraction to filter orgId: Ensure your DB indexes support this query pattern or normalize actor.orgId into a top-level audit column (already present in entity). If using Postgres, prefer a dedicated column to JSON path extraction for performance."
   Rationale: Performance and maintainability.

3) File: src/notifications/service/NotificationsService.ts
   Comment: "Team membership is fetched via teamService.getTeamMemberIds — please add error handling and rate-limiting if that call fails or returns large lists. Consider using pagination or batching when dispatching notifications for very large teams."
   Rationale: Reliability and DOS protection. Also, AI often misses operational limits (too many notifications).
