# Roles and permissions

## Discovered roles

1. **Guest / anonymous** — no persisted account; may view public pages and submit contact/report/newsletter endpoints where enabled.
2. **User / contributor** — database `role: 'user'`; may manage own profile, submit places/reviews/reports, and view own dashboard data subject to handler checks.
3. **Admin** — database `role: 'admin'`; permissions map can gate modules/actions. A specific hard-coded **superadmin identity** bypasses module checks in `hasPermission`; this is a privileged admin subtype, not a separate role string.

The configured Atlas users collection currently contains the `admin` and `user` roles. There is no separate moderator role or guest database account. A verified user remains a `user` with a verification flag. `vpm_admin` is the configured superadmin identity; superadmin is a privileged admin account, not a distinct role string.

## Permission matrix (implemented evidence)

“Role-only” means any admin JWT/user passes the visible check, regardless of per-module permission flags.

| Capability | Guest | User | Admin | Evidence |
|---|---|---|---|---|
| Browse approved places/reviews | Allow | Allow | Allow | `/api/places`, place reviews GET filter visibility by token role |
| View pending places/hidden reviews | Deny | Deny | Conditional by `approvals.view` / `reviews.view` | Admin list logic |
| Create place | Deny | Allow | Allow | `/api/places` POST requires auth |
| Edit place | Deny | Own records only (handler logic) | Conditional | `/api/places/[placeId]` PUT; admin flag affects patch fields |
| Delete place | Deny | Deny | `places.delete` | `/api/places/[placeId]` DELETE |
| Submit review | Deny | Verified user, subject to settings | Admin requires `reviews.add` | `/api/places/[placeId]/reviews` |
| Delete review | Deny | Own records only | `reviews.delete` | `/api/reviews/[reviewId]` DELETE |
| Moderate reviews | Deny | Deny | `reviews.edit` / `approvals.edit` | `/api/admin/reviews*`, `/api/admin/approvals` |
| View own contributions/reports | Deny | Own records only | Own records only when endpoint called | dashboard/reports APIs |
| Submit report/contact/newsletter | Allow | Allow | Allow | public POST handlers |
| Admin users | Deny | Deny | Conditional users permissions for list/create/edit/delete | `/api/admin/users*`; superadmin bypass |
| Admin approvals/settings/support/reports | Deny | Deny | Conditional module/action | corresponding handlers using `hasPermission` |
| Admin analytics/audit/search/review list | Deny | Deny | Conditional module/action permissions | `/api/admin/{stats,logs,audit,search,reviews}` |

## Inconsistencies and risk

Admin APIs use `hasPermission(user, module, action)` for protected operations, and permission keys/actions are allowlisted in `src/lib/permissions.js`. The UI filters navigation for presentation; server checks remain authoritative. Admin-session tokens require the admin login flow. Other administrators need explicit module/action permissions; the configured superadmin bypasses these checks.

`src/proxy.js` performs optimistic page gating by token claims, while API authorization reloads the database user and validates session version and role. The proxy is not the API security boundary.

## Recommended authorization tests

For every HTTP method: anonymous, regular user, admin without module permission, admin with permission, superadmin, owner, non-owner, and malformed/expired token. Include privilege escalation checks for role and permissions updates. See [roadmap](DEVELOPMENT_ROADMAP.md).
