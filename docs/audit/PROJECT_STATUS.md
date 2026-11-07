# Project status

## Overall assessment

**Stage:** active development codebase authorized by the user for a local release rehearsal. The configured local site origin is `http://localhost:3000`; this does not establish a separate, production-like database or deployment environment.

**Production readiness:** not established. The user reports a successful build before the latest authentication changes. A build attempt on the updated source stalled at Next.js's optimized-build step without diagnostics and was interrupted after about two minutes. Browser-based accessibility review was blocked by Chrome computer-use approval. No automated tests were run at the user's direction.

## Implemented modules

- Public landing, about, explore, place detail, contact, report, help, and policy pages.
- Registration, user login, protected administrator login, profiles, contributions, reviews, favorites, support, reports, newsletter email capture, and visitor analytics.
- Admin management for users, places, reviews, approvals, reports, support, newsletter addresses, notifications, settings, search, logs, and audit.
- In-app manual notifications with role audiences, desktop modal/mobile full-screen presentation, month grouping, and admin CRUD/search/pagination.
- MongoDB index and retention setup; configured Atlas indexes and TTL policies were previously applied and inspected.

## Review status

- JWT fallback secrets were removed. Admin sessions now require the admin-login claim; the normal login route rejects admin accounts. An untrusted login return path is restricted to same-origin paths.
- Admin APIs use module/action permissions, with `vpm_admin` configured as the superadmin through `SUPERADMIN_ID`.
- A security review is recorded in [SECURITY_AUDIT.md](SECURITY_AUDIT.md). Remaining concerns include rate limiting, consistent body-size limits, CSP/HSTS configuration, audit-write failure visibility, and logout revocation semantics.
- In-app notification routes enforce role-scoped reads and permission-gated admin mutations; no automated emails or browser push are sent.

## User-directed scope and evidence limits

- P-501 automated tests are skipped by explicit user direction.
- Privacy/legal review is skipped by explicit user direction.
- Production operations, backups, monitoring, and rollout are user-owned and were not performed.
- The production domain is undecided. Local `NEXT_PUBLIC_SITE_URL` is set to `http://localhost:3000` and is already consumed by metadata, sitemap, and robots generation.
- The local browser accessibility review could not proceed because computer-use access to Chrome was not approved.
- No deployment, backup/restore rehearsal, rollback, dependency audit, secret scan, or penetration test was performed.

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for item-by-item status and [README.md](README.md) for audit methodology.
