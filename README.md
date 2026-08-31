# TaskBridge — Notification & Audit Service (Practitioner Assessment)

Technology stack
- Node.js (18+), TypeScript
- Express.js for HTTP APIs
- TypeORM (SQLite for local testing; Postgres recommended in production)
- class-validator, class-transformer for request validation
- jsonwebtoken for auth (JWT)
- Jest + supertest for tests
- winston for structured logging

Contents
- .github/copilot-instructions.md — project Copilot instructions & standards
- src/projects/ — remediated Project Service (model, repository, service, controller)
- src/notifications/ — Notification & Audit Service (model, service, controller)
- src/copilot_prompts.txt — saved Copilot prompts (required)
- tests/ — Jest test suites
- SPEC.md, REVIEW.md, IMPACT_ANALYSIS.md, PROMPTS.md, PR_DESCRIPTION.md, TOOL_STRATEGY.md, ARCHITECTURE.md

Quick dev
- Install: npm install
- Run tests: npm test
- Start (dev): npm run dev
