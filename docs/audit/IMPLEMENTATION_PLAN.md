# Production implementation plan

This plan began as a static audit and now also records an implementation pass. See the execution status below; completion of code changes does not imply staging verification or production readiness.

## Implementation execution status — 2026-11-07

Code changes and the security review were completed in the workspace. The user reports a successful build before the final security-session and return-path fixes; a build on the updated source remained at “Creating an optimized production build” for about two minutes and was stopped without further output. No deployment was made. No automated tests were added or run per P-501 direction.

| Work item | Status | Work completed / remaining |
| --- | --- | --- |
| P-101, P-102, P-103 | Implemented in code; updated build pending | JWT fallbacks are removed; cookie auth reloads the user and checks session version; admin handlers use module/action permissions; permission keys/actions are allowlisted and privilege changes are superadmin-only. Admin sessions now require the admin-login claim. No integration tests were run. |
| P-104 | Implemented in code; manual runtime review pending | Session token is held in an HttpOnly cookie; password/privilege changes invalidate prior sessions; standard login no longer issues admin sessions; logout clears the current cookie. A copied stateless cookie is not individually revoked before expiry. |
| P-105 | Partial; operational controls deferred | Bounded validation, escaped search, origin checks, and image restrictions are implemented. Shared rate limiting, abuse controls, and consistent request-body limits remain. The user owns deployment/operations work. |
| P-201, P-202, P-204–P-206 | Implemented in code; runtime review incomplete | Review eligibility, place moderation/ownership, Explore controls, favorites, missing-data states, and report/support administration were updated. Browser workflow/accessibility review was not completed. |
| P-203 | Transactional code implemented; Atlas data repaired | Review/place mutations and aggregates use transactions. Three stale Atlas aggregates were repaired; follow-up inspection found no mismatches. Tests remain skipped by user direction. |
| P-207 | Implemented in code and configured Atlas | Public email collection and permission-gated paginated admin listing are in place. Automated newsletter sending and unsubscribe controls are excluded by product scope. |
| P-301 | Indexes applied and verified on configured Atlas; migration/rollback deferred | Index setup and data-contract documentation exist; duplicate preflight and representative query-plan inspection were completed. Production migration/rollback rehearsal is an operator task. |
| P-302 | Retention implementation applied; privacy/legal review skipped by user | Approved retention is 90 days for visitor logs, 365 days for closed support/reports and audit logs, and manual removal for newsletter emails. Atlas TTL policies are applied. The user explicitly waived the privacy/legal review. Contact requests use the contact form. |
| P-303 | Operator-owned work skipped | `SUPERADMIN_ID` and `NEXT_PUBLIC_SITE_URL` are present in local `.env`; the local origin is `http://localhost:3000`, which is already used by metadata, sitemap, and robots generation. Production secrets, backups, monitoring, key restrictions, and deployment ownership were delegated to the user. |
| P-304 | User-reported build success; latest source pending build confirmation | The user reported a successful build. After final security edits, the local build stalled at the optimized-build step without diagnostics and was interrupted after about two minutes. |
| P-401 | Local origin configured; production crawler check pending | Metadata, sitemap, and robots use `NEXT_PUBLIC_SITE_URL`; local rehearsal uses `http://localhost:3000`. The production origin is undecided, so deployed crawler validation remains with the release operator. |
| P-402 | Partial; visual review unavailable | Static source inspection only. Computer-use access to Chrome was not approved, so no viewport, keyboard, contrast, or screen-reader review was performed. |
| P-403 | Partial; production metrics delegated | Atlas index checks were completed earlier. Bundle, image delivery, API latency, and Core Web Vitals were not measured. |
| P-501 | Skipped by user direction | No tests were added or run. |
| P-502 | Local rehearsal authorized; acceptance incomplete | The user authorized using the development codebase as the release-rehearsal environment. A separate production-like deployment, backup/restore, rollback, and browser acceptance were not performed; operational tasks are user-owned. |
| P-503 | Skipped by user direction | Deployment and production operations are handled by the user; no deployment was made. |

### Current release decision

**Not production-ready based on the evidence available.** The updated source has two security fixes that still need a successful production build. Browser accessibility/release review was blocked by Chrome automation approval. Rate limiting, request-size controls, deployment headers, audit-write monitoring, logout revocation policy, production environment configuration, and user-owned operations remain unresolved. P-501 and privacy/legal review were explicitly waived; production rollout is user-owned.

## Release objective

Move Villupuram Trails to production only after authentication and authorization are safe by default, essential public and admin journeys behave consistently, data and privacy practices are operationally defined, and release checks pass in a staging environment.

The audit was static. Treat every runtime-dependent criterion below as work to verify, not as an established result. Preserve any unrelated working-tree changes while implementing.

## Release gates

### Gate A — Security baseline

- No default or hard-coded JWT signing secret is accepted by any runtime path.
- Every admin API method enforces its intended module/action permission on the server.
- Role and permission grants are limited to an explicit permission schema and authorized actors.
- Session expiry, logout, password changes, and token rejection behavior are covered by tests.
- Review eligibility matches the documented product rule and is enforced server-side.

### Gate B — Core workflows

- Visitors can browse, search, and filter approved places; controls shown in the UI perform the described action.
- Contributors can submit places and see moderation status; admins can process submissions.
- Review ownership, eligibility, visibility, and aggregate updates work for both success and failure paths.
- Reports and support tickets can be submitted and processed; success/error feedback reflects persistence outcomes.
- No button or label promises persistence or behavior that is not implemented.

### Gate C — Operations and privacy

- Production environment values are validated without exposing secrets.
- MongoDB connectivity, required indexes, backups, restore procedure, monitoring, and incident ownership are confirmed.
- Visitor data collection, access, retention, and user-facing disclosure are aligned.
- Staging build, smoke checks, rollback procedure, and deployment configuration are documented and exercised.

### Gate D — Public readiness

- Public pages have suitable metadata and crawl configuration; destination content is visible to intended crawlers.
- Critical flows pass responsive, keyboard, accessibility, and browser checks at representative screen sizes.
- Known production-blocking issues are resolved or explicitly accepted by the release owner with a reason and mitigation.

## Sequenced work plan

### Phase 0 — Establish a safe implementation baseline

**P-001: Protect the existing worktree and define staging.** Inventory current user changes, create a reviewed implementation branch/worktree per team practice, and agree on an isolated staging database and deployment. Do not seed or migrate production data during feature work.

- Acceptance: implementation changes are isolated from pre-existing edits; staging credentials/data are separate from production; rollback owner is named.
- Dependencies: none. Complexity: S.

**P-002: Convert audit observations into tracked issues.** Create tickets from this plan with owners, dependencies, release labels, and test expectations. Keep audit findings distinct from confirmed runtime defects until reproduced.

- Acceptance: each P0 and P1 item has an owner and completion evidence location.
- Dependencies: P-001. Complexity: S.

### Phase 1 — Close security blockers (release-blocking)

**P-101: Remove JWT secret fallbacks and standardize token configuration.** Require one server-only high-entropy secret at startup/runtime; fail closed when missing. Remove inconsistent fallback values across auth routes, shared auth helpers, and page-gating code. If any fallback was ever used in a deployed environment, rotate the key and invalidate affected sessions.

- Acceptance: missing secret prevents issuing or accepting tokens; valid tokens verify consistently across login, `/me`, API authorization, and page gating; expired/invalid tokens are rejected; secret values do not appear in client bundles or logs.
- Dependencies: staging secrets from P-001. Complexity: S/M.

**P-102: Define and enforce the RBAC policy centrally.** Inventory every admin handler and HTTP method. Map route/action to a permission key, then use the same server-side policy for all list, read, create, edit, delete, approve, settings, analytics, and audit operations. Keep UI navigation filtering as presentation only.

- Acceptance: anonymous and regular-user direct API attempts are denied; an admin lacking a permission is denied even when calling the API directly; granted admins can perform only the permitted actions; superadmin exceptions are explicit and tested.
- Dependencies: P-101; permission matrix in [Roles and permissions](ROLES_AND_PERMISSIONS.md). Complexity: L.

**P-103: Constrain account and permission administration.** Validate role values and permission keys/actions against an allowlist. Restrict who may create or promote admins, grant permissions, alter the superadmin, or edit their own privilege level. Review both collection and individual user routes.

- Acceptance: malformed/unknown permissions are rejected or safely discarded; no lower-privilege actor can grant themselves or another account higher access; superadmin protection works for update and deletion; changes are audit logged.
- Dependencies: P-102. Complexity: M.

**P-104: Review session and token persistence.** Use the HttpOnly session cookie as the only accepted credential; clear legacy client storage and retain same-origin protections for writes. Verify logout, expiry, password change, and account disable behavior.

- Acceptance: tokens are not exposed unnecessarily to JavaScript; state is cleared on logout/expiry; revoked or changed credentials have the expected session effect; CSRF posture is documented and tested for chosen cookie behavior.
- Dependencies: P-101. Complexity: M/L.

**P-105: Apply input and abuse controls to public endpoints.** Review registration, reports, support, newsletter, visitor logging, regex search, and image inputs. Add input length/type limits, literal-safe search, request throttling/abuse controls appropriate to the hosting layer, and safe image scheme/size validation.

- Acceptance: oversized or malformed requests fail with consistent 4xx responses; repeated submissions are bounded; regex metacharacters cannot create uncontrolled queries; image input obeys an explicit format/size policy.
- Dependencies: policy decisions for image and privacy work. Complexity: M/L.

### Phase 2 — Correct critical user journeys

**P-201: Align review eligibility with product policy.** Confirm whether verified accounts are required. If yes, enforce `isVerified` (or the authoritative verification source) in the POST handler and explain eligibility in the UI. If no, update the README and relevant copy. Do not rely on a UI-only check.

- Acceptance: ineligible accounts cannot submit by direct API request; eligible accounts can submit; approval settings still determine visibility; behavior is covered by tests.
- Dependencies: product decision; P-102 auth patterns. Complexity: S.

**P-202: Complete place contribution and moderation lifecycle.** Trace submission form fields through validation, MongoDB persistence, moderation state, admin approval/rejection, and contributor dashboard. Define what happens when approval is automatic and when it is manual. Ensure errors do not report success when persistence fails.

- Acceptance: new place ownership and status are correct; admin action updates status and audit trail; contributor sees accurate current status; failure cases leave no misleading success response.
- Dependencies: P-102, P-103, P-301. Complexity: M.

**P-203: Complete review and place aggregate consistency.** Make create/edit/hide/delete operations update rating and review counts consistently, including when a multi-step MongoDB operation fails. Add ownership and malformed-ID cases.

- Acceptance: stored visible reviews and place aggregates agree after every operation; hidden reviews are excluded from public lists and aggregation; unauthorized owners cannot mutate others' records.
- Dependencies: P-201, P-102. Complexity: M.

**P-204: Fix Explore controls.** Make search work on Enter and button activation, clarify supported fields, wire Map View to a real map/list state or remove the control, and ensure category/day filters match API behavior.

- Acceptance: keyboard and pointer search return the same expected results; active filters are visible and removable; no inert control remains; loading, empty, and error states are understandable.
- Dependencies: none. Complexity: M.

**P-205: Resolve detail-page placeholders and factual fallbacks.** Decide whether nearby routes, directions, itinerary saves, and bookmarks are in production scope. Implement persistent behavior where required; otherwise remove or relabel controls. Replace generic opening-hour, fee, best-time, tips, and accessibility defaults with explicit “not provided” states unless sourced data exists.

- Acceptance: no success toast appears without persistence; directions open the intended destination; missing data is distinguishable from verified data; unavailable features are not presented as working.
- Dependencies: product scope and, for saves/routes, data model/service design. Complexity: M/L.

**P-206: Complete support and report handling.** Verify form validation, ownership/privacy of user report lists, status transitions, action notes, admin permissions, and user-facing acknowledgments. Decide whether response emails are required; current code evidence shows persistence but not outbound delivery.

- Acceptance: submitted records are accessible only to intended roles; admins can transition allowed states; validation and server errors are actionable; claimed response/delivery behavior matches implementation.
- Dependencies: P-102, P-105. Complexity: M.

**P-207: Implement collection-only updates list.** Collect email addresses through the public form and show them to authorized admins. Do not implement campaign delivery or unsubscribe controls in this scope. Explain the use of the address and that automated email is not sent; set retention and privacy handling under P-302.

- Acceptance: email is normalized and unique; unauthorized users cannot list addresses; authorized admins can search and page through records; public copy accurately describes collection-only behavior; no delivery or unsubscribe feature is implied.
- Dependencies: P-102, P-301, P-302. Complexity: S/M.

### Phase 3 — Data, privacy, and operations

**P-301: Formalize MongoDB data contracts and indexes.** Document required fields, valid enums, uniqueness expectations, indexes, retention, and relationships for users, places, reviews, reports, support tickets, settings, visitor logs, newsletter subscribers, and audit logs. Make index deployment repeatable and safe.

- Acceptance: the selected database index inventory matches the documented plan; duplicate email/username behavior is protected by unique indexes; representative query paths use planned indexes; schema changes have a controlled deployment/rollback method. Atlas index inventory and representative query plans are verified; staging and migration rollback remain.
- Dependencies: P-001; coordinate with P-202/P-203. Complexity: M/L.

**P-302: Set visitor analytics privacy policy.** User-approved policy: new page-view records minimize fields to a path without query parameters, referrer origin, coarse device/browser/OS labels, and timestamp; pages expire after 90 days. Closed support tickets and reports expire 365 days after closing; audit logs expire after 365 days; newsletter addresses remain until manually removed. The privacy contact channel is the contact form. TTL indexes are applied and verified on configured Atlas; review provider logs and complete legal review before release.

- Acceptance: collection has a documented purpose and retention period; access is permission checked; privacy text matches actual fields; deletion/expiry is operational.
- Dependencies: legal/product review. Complexity: M.

**P-303: Establish operational readiness.** Validate required environment variable names and presence without printing values. Confirm MongoDB network access, least-privilege credentials, backups, tested restore, monitoring/alerting, log redaction, error reporting, and deployment ownership. Confirm Maps key restrictions and quota policy.

- Acceptance: staging deployment starts with all required configuration; missing required config fails safely; backup restore is demonstrated; alerts reach an owner; no secrets or sensitive personal data appear in logs.
- Dependencies: P-001, P-101, P-301. Complexity: L.

**P-304: Migrate deprecated Next.js middleware convention.** The installed Next.js 16.2.6 guide marks `middleware` deprecated and renamed to `proxy`. Migrate `src/middleware.js` according to the local `proxy.md` guide, preserving matchers and redirects, then verify the production build and route behavior.

- Acceptance: no deprecation warning remains; protected and public route behavior matches approved cases; API handlers remain independently authorized.
- Dependencies: P-101/P-102 so migration does not preserve unsafe assumptions. Complexity: S.

### Phase 4 — Discovery, accessibility, and performance

**P-401: Verify public SEO implementation.** Route-specific titles/descriptions, path-based canonicals, sitemap/robots handling, and approved-place detail metadata are implemented. Configure `NEXT_PUBLIC_SITE_URL`, validate output with crawlers after deployment, and add structured data only for verified fields. Confirm whether destination content needs further crawler-visible rendering.

- Acceptance: crawler can discover approved public destinations; metadata is unique and valid; unpublished/admin/private records are excluded; canonical and query URL behavior is documented and checked.
- Dependencies: P-205, P-301. Complexity: M.

**P-402: Run accessibility and responsive review.** Test 320–480 px, tablet, and desktop layouts; keyboard-only navigation; focus order/visibility; dialogs/drawers; labels/errors; color contrast; reduced motion; semantic headings and image alternatives. Fix critical barriers before launch.

- Acceptance: critical public/auth/contribution/admin workflows can be completed by keyboard; no blocking overflow or inaccessible controls remain in target viewports; findings and retest evidence are attached to release record.
- Dependencies: P-204/P-205 UI decisions. Complexity: M/L.

**P-403: Measure and tune performance.** Measure production-like bundle, image delivery, API latency, Mongo query plans, and Core Web Vitals in staging. Optimize only based on measured bottlenecks; add indexes/caching with correctness and privacy reviewed.

- Acceptance: baselines and thresholds are recorded; high-cost queries are bounded/indexed; image loading is appropriately sized; changes do not leak private/pending data through caching.
- Dependencies: P-301, P-303, P-401. Complexity: M/L.

### Phase 5 — Verification and controlled release

**P-501: Build the test suite around release risks.** Skipped at the user's explicit direction; do not add or run tests for this workstream. Automated regression coverage remains absent.

- Acceptance: critical flows have automated regression coverage; each RBAC endpoint is tested for anonymous, user, limited admin, permitted admin, owner/non-owner, superadmin, invalid, and expired credentials; CI fails on regression.
- Dependencies: P-101 through P-206. Complexity: L.

**P-502: Staging acceptance and release rehearsal.** Deploy a production-like build to staging, run smoke tests, accessibility/crawler checks, backup/restore rehearsal, and rollback rehearsal. Verify only staging data is used.

- Acceptance: all Gates A–D pass; no P0 remains; all P1 issues are fixed or have an explicit release-owner exception; rollback completes within the team's agreed recovery objective.
- Dependencies: all release-blocking tasks. Complexity: M.

**P-503: Production rollout and observation.** Deploy in a controlled window with monitoring and named incident coverage. Validate health, authentication, public place browsing, and admin workflows using non-destructive checks. Keep rollback ready until agreed observation criteria pass.

- Acceptance: health and error metrics remain within agreed thresholds; no auth/RBAC regressions; support/report and visitor logging behave as expected; release owner records go/no-go and follow-up actions.
- Dependencies: P-502 approval. Complexity: M.

## Must complete before production

Minimum release-blocking set: P-101, P-102, P-103, P-104, P-105 risk review, P-201, P-202, P-203, P-204, P-205 scope and misleading-copy resolution, P-301 migration/rollback, P-302 legal/provider review, P-303 operational readiness, P-304 successful build and route validation, P-401 deployed crawler validation, P-402 critical accessibility issues, and P-502. P-501 is explicitly waived by the user for this workstream; the coverage gap is recorded. P-206 is required if support/report administration is presented as an active service. P-207's collection/admin-list functionality is implemented; privacy, retention, and authorization acceptance still require verification if the signup remains public.

Do not treat this list as a waiver for a discovered critical vulnerability or data-integrity defect. Any exception should name an accountable release owner, the exact remaining risk, a mitigation, and a review date.

## Suggested workstream ownership

- **Application/security:** P-101–P-105, P-201, P-203, P-304.
- **Product/content:** P-201, P-205, P-207, P-401.
- **Data/operations:** P-301–P-303, P-403, P-502–P-503.
- **Frontend/QA/accessibility:** P-202, P-204–P-206, P-401–P-402, P-501.

One person may own multiple tracks, but each release gate needs a reviewer other than the implementer when practical.

## Audit-to-plan cross-reference

- Security and permissions: [Security audit](SECURITY_AUDIT.md), [Roles and permissions](ROLES_AND_PERMISSIONS.md).
- Functional workflows: [Feature inventory](FEATURE_INVENTORY.md), [Bugs and issues](BUGS_AND_ISSUES.md), [User stories](USER_STORIES.md).
- UI and SEO: [UI/UX audit](UI_UX_AUDIT.md), [SEO audit](SEO_AUDIT.md).
- Data, operations, and verification: [Architecture](ARCHITECTURE.md), [Performance and testing](PERFORMANCE_AND_TESTING.md), [Audit evidence](AUDIT_EVIDENCE.md).
