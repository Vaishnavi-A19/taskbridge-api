Scope change: Add MILESTONE_REOPENED; capture actor IP address in audits.

Files & modules affected
- src/notifications/entity/AuditEntry.ts
  - add ipAddress?: string (already present in remediated entity; confirm DB migration)
- src/notifications/service/NotificationsService.ts
  - allow 'MILESTONE_REOPENED' in allowed events (already includes it)
- src/projects/service/ProjectService.ts
  - when posting audit, include requestor IP (controller must capture req.ip and pass into audit client)
- src/notifications/controller/notificationsRouter.ts
  - POST /audit must accept ipAddress and persisted as provided (internal-only)
- tests/ — add test case covering MILESTONE_REOPENED and IP capture
- DB migration
  - Add migration to add ipAddress column to audit_entries table (nullable string)

Nature of changes
- Additive: new enum value and additional optional field on audit entries.
- Migration required: schema change to add ipAddress column (nullable) — non-breaking.
- Code changes: update caller code paths to capture IP at web layer and pass to audit endpoint.

Security & compliance risks capturing IP addresses
- IP addresses are personal data in many jurisdictions; storing them may increase compliance burden (GDPR, CCPA).
- Risks: data retention, access control, logging leaks of IP addresses, attacker exfiltration.
- Mitigations:
  - Limit retention of IP addresses with a policy (e.g., 30-90 days) and document it.
  - Encrypt-at-rest for DB, restrict access to audit DB to minimal roles.
  - Mask or truncate IPs if full address unnecessary (e.g., store /24 for IPv4).
  - Ensure IPs are not returned in generic API responses (only in compliance or admin endpoints).
  - Legal review and update privacy policy.

Recommended implementation approach & sequencing
1. Update API spec & acceptance tests to include MILESTONE_REOPENED and ipAddress behavior.
2. Add DB migration to add ipAddress column (nullable). Run migration in staging.
3. Update Project Service controller to capture req.ip and include in audit posting; do not log IPs in general logs.
4. Add tests for new event and IP capture.
5. Update retention/policy docs and gain legal sign-off before enabling long-term storage of raw IPs.
6. Deploy to staging, run migrations, verify data flows, and run compliance checks.

How Copilot assisted this analysis
- I asked Copilot to produce a migration SQL snippet and example controller code to include req.ip. Copilot produced examples that were syntactically correct but did not include privacy mitigations (retention, masking). I validated and added those mitigations manually.
