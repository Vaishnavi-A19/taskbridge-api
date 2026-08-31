TaskBridge — Notification & Audit Service — SPEC

Overview
- The Notification & Audit Service receives project milestone events and does two things:
  1. Emit notifications for relevant team members.
  2. Persist immutable audit entries for compliance.

Primary data models (Types & rationale)
- AuditEntry
  - id: UUID
  - eventType: string (enum: MILESTONE_CREATED | MILESTONE_UPDATED | MILESTONE_CLOSED)
  - entityType: string (e.g., 'milestone'|'project')
  - entityId: UUID
  - actor: { userId: UUID, orgId: UUID }
  - prevState: JSON | nullable
  - newState: JSON
  - ipAddress: string | nullable (added in later change request)
  - createdAt: ISO timestamp
  - immutability: no update/delete via API

- Notification
  - id: UUID
  - recipientUserId: UUID
  - orgId: UUID
  - eventType: string
  - projectId: UUID
  - message: string
  - read: boolean (default false)
  - createdAt: ISO timestamp

API contracts
- POST /audit
  - Internal-only endpoint
  - Request:
    - { eventType, entityType, entityId, actor: { userId, orgId }, prevState, newState, ipAddress? }
  - Response: 201 { id, createdAt }

- GET /audit/:projectId
  - Query params: from (ISO), to (ISO), eventType (string)
  - Authorization: must belong to orgId of project
  - Response: 200 [{ AuditEntry }]

- GET /notifications/:userId
  - Query params: unreadOnly=true|false
  - Auth: userId in JWT must match or admin within same org
  - Response: 200 [{ Notification }]

- PATCH /notifications/:id/read
  - Body: { read: true }
  - Auth: recipient must match JWT userId
  - Response: 200 { id, read }

Integration points with Project Service
- Project Service calls POST /audit on every milestone create/update/delete with before/after snapshot.
- Alternatively: Project Service emits messages on an internal bus (future), Notification & Audit Service subscribes.

Constraints & validation
- Audit entries immutable: service returns 405 for attempts to update/delete.
- Validation: eventType from allowed enum; prev/new state JSON must be well-formed and include milestone id and status.
- Authorization: internal endpoint requires a service token (x-service-token) or running in internal network; GET endpoints require standard JWT with orgId claim.
- RLS/Multi-tenant: All queries filtered by orgId.

Notes on Copilot assistance
- Copilot helped draft initial data shapes and sample controller code. I validated types, added orgId enforcement, added immutability, and ensured internal-only endpoint security. Human judgment corrected tenant filtering and input validation specifics.
