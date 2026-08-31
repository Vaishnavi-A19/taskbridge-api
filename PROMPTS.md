Prompt engineering record

Overview
- All prompts used with GitHub Copilot are saved in src/copilot_prompts.txt. Below are the principal prompts used, in order, with technique, feature used, and rationale.

Chain & prompts

1) Contractor generation (requirement)
Prompt (exact):
"Generate a Project model and a Project service with create, update status, get by team, and delete functions. Use a database."
- Copilot feature: code generation (file suggestion)
- Technique: low-specificity seed (to simulate contractor)
- Rationale: requirement constraint — intentionally unreviewed

2) Remediation scaffold
Prompt:
"Create a TypeORM Project entity with orgId, createdAt, updatedAt, and soft-delete. Also produce repository, service, and controller (Express) with JWT-based tenant isolation. Use class-validator DTOs."
- Copilot feature: code completion / file generation
- Technique: role-based + constraints (explicit DTO, ORM)
- Rationale: replace low-quality generated code with standards

3) Notifications & Audit spec drafting
Prompt:
"Draft a SPEC.md for a Notification & Audit microservice that records immutable audit entries (prev/new state), creates notifications for team members, and exposes endpoints POST /audit and GET /audit/:projectId. Include data models and security constraints."
- Copilot feature: chat-based spec drafting
- Technique: decomposition (spec + models + contracts)
- Rationale: get initial spec, then refine manually

4) Controller & immutability enforcement
Prompt:
"Generate an Express router for audit endpoints that enforces internal-only POST /audit using x-service-token and ensures GET /audit/:projectId enforces orgId from JWT."
- Copilot feature: inline code generation
- Technique: constraint + iterative refinement

5) Tests scaffold
Prompt:
"Generate Jest tests to assert notification dispatch to team members and audit immutability."
- Copilot feature: test generation
- Technique: few-shot (provided test patterns), iterative refinement

Post-generation corrections (what I changed and why)
- Added orgId checks everywhere — Copilot often omitted tenant enforcement.
- Replaced raw SQL or driver with TypeORM entities for data safety and migrations.
- Added structured error handling and validation (class-validator).
- Added service token check and clarified internal-only semantics.
- Inserted audit immutability at service level and ensured no update/delete endpoints exist.

Copilot features used (at least 2) and techniques applied
- Features: file completion/code generation, chat-assisted spec drafting, test generation.
- Techniques: constraint prompting, role-based, iterative refinement, few-shot examples.
