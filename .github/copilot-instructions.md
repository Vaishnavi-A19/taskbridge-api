# GitHub Copilot Project Instructions — TaskBridge

Project-wide declaration
- Tech stack: Node.js + TypeScript, Express, TypeORM (Postgres in production), Jest.
- Architecture: Microservice-friendly monorepo layout. Each service under src/<service> with clear layers: model (entities), repository (DB access), service (business logic), controller/route (HTTP).

Coding standards & conventions
- Use TypeScript with strict mode enabled.
- Follow Conventional Commits.
- Use repository and service layers; controllers only orchestrate validation and call services.
- All public functions must have JSDoc.
- Prefer dependency injection (constructor-based) for services and repositories.

API & security rules (multi-tenant B2B SaaS)
- All requests must include an Authorization: Bearer <JWT> header.
- JWT must include orgId claim. Enforce orgId-based tenant isolation at repository/service layer.
- Never return data from other organizations; always filter by orgId server-side.
- Use parameterized queries/ORM to avoid injection.
- Enforce least privilege for internal endpoints — internal-only endpoints must require a service token or be on internal network.
- Mask or avoid sensitive fields in API responses (e.g., do not return IP addresses in list endpoints unless required).
- Audit log immutability: no updates or deletes at API/service level; append-only storage.

Data exposure & retention
- Retain audit logs per company policy; document retention in SPEC.
- Scrubbing/PII: only store IP addresses when required and ensure legal review; store hashed or truncated forms when possible.

Testing expectations
- Unit tests for services and repositories.
- Integration tests covering controllers and DB persistence using an ephemeral SQLite DB.
- At least one auth/tenant isolation test per service.

Copilot usage
- Save all prompts & Copilot outputs in src/copilot_prompts.txt.
- For generated code, run a human review: run static analysis, search for raw SQL, auth bypass, open CORS, secrets in code, and direct filesystem writes.
