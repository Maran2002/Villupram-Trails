# Development roadmap

This is the original proposed sequence derived from audit findings. Current code-side execution status is tracked in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md); staging and runtime gates remain separate.

| ID | Task | Priority | Affected feature | Dependencies | Acceptance criteria | Complexity / order |
|---|---|---|---|---|---|---|
| R-001 | Require strong JWT secret and remove fallbacks | P0 | Auth | Deployment secret setup | Startup/API auth fails closed if missing; tokens only verify with configured key; rotation plan documented | S; 1 |
| R-002 | Normalize server-side RBAC | P0 | Admin APIs/users | R-001 | Each admin method/action checks module permission; role-only exceptions documented; direct API matrix passes | L; 2 |
| R-003 | Constrain permission/role grants | P0 | User management | R-002 | Allowlisted keys/actions; only appropriate superadmin can grant privileged roles; escalation tests pass | M; 3 |
| R-004 | Add auth and authorization regression tests | P0 | Cross-cutting | R-001/R-002 | Tests cover guest/user/limited-admin/admin/superadmin, ownership and invalid tokens | L; 4 |
| R-005 | Enforce review eligibility policy | P1 | Reviews | Product verification rule | Server handler enforces verified status or policy/documentation is aligned; tests cover both outcomes | S; 5 |
| R-006 | Fix Explore controls and clarify search scope | P1 | Explore | None | Search action works by keyboard/button; Map View works or affordance removed; filters match API semantics | M; 6 |
| R-007 | Complete destination action flows | P1 | Place detail | Product scope, persistence design | Directions/routes and save controls function or are clearly unavailable; no false success messages | M/L; 7 |
| R-008 | Establish public SEO fundamentals | P1 | Public routes | Approved place content | Route metadata, canonical policy, sitemap/robots and crawler-visible content validated | M; 8 |
| R-009 | Replace assumed place facts with explicit missing-data states | P1 | Place detail | Content model | Missing fields never display invented defaults as verified facts | S; 9 |
| R-010 | Add end-to-end/API validation suite | P1 | Core flows | R-004 | Place/review/report/support flows have failure/permission tests and regression checks | L; 10 |
| R-011 | Review token persistence/session model | P1 | Auth/store | R-001 | Documented threat model; reduce readable token persistence; expiry/logout behavior verified | M; 11 |
| R-012 | Define visitor-data privacy and retention | P1 | Analytics | Product/legal input | Collection minimized, access scoped, retention implemented and privacy notice matches | M; 12 |
| R-013 | Managed image upload or explicit URL-only workflow | P2 | Contribution | Storage provider/product decision | Size/type/scheme restrictions and image failure UI; no ambiguous upload affordance | L; 13 |
| R-014 | Add error/empty/loading state review and accessibility testing | P2 | All UI | Browser QA | Keyboard, focus, reduced motion, labels, contrast and narrow viewport checks documented and resolved | L; 14 |
| R-015 | Bound and optimize search/analytics queries | P2 | Browse/admin | Query/index verification | Input caps, escaped search, indexes confirmed, large dataset response reviewed | M; 15 |
| R-016 | Complete collection-only updates list | P3 | Newsletter | Retention/privacy decision | Public form and permission-gated admin list implemented; decide retention and confirm copy; no automated sending or unsubscribe UI in scope | S; 16 |
| R-017 | Migrate deprecated middleware convention to proxy | P2 | Route gating | Installed Next.js proxy guide | Preserve matchers and redirect behavior under `src/proxy.js`; confirm framework build/runtime behavior | S; sequence after P0 auth/RBAC work |

Priority meanings: P0 security/production blockers; P1 core journey and discovery issues; P2 UX/quality/optimization; P3 optional completeness. Complexity is relative implementation size, not a time estimate. Dependencies/order are indicative.
