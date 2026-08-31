Architecture summary

- Relationship: Project Service owns project lifecycle and invokes Notification & Audit Service when milestone events occur by calling an internal POST /audit. Notification & Audit Service persists append-only AuditEntry rows and creates Notification records for team members.
- Layered flow: HTTP request -> Auth middleware (JWT) -> Controller/Route validates DTOs -> Service layer performs business logic and calls repository -> Repository persists via ORM -> Service calls audit client (internal HTTP) -> Notification service persists audit and notifications.
- Multitenancy: orgId enforced at repository/service boundary; JWT must carry orgId claim. No cross-org data leaks permitted.
- Rationale: Decoupling (small services) and clear ownership reduces blast radius and eases compliance. Using a dedicated audit service centralizes immutable logs.
- Trade-offs: Synchronous internal HTTP call is simple but couples services; future improvement is async messaging for resiliency and buffering.
