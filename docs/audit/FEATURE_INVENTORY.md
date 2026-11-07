# Feature inventory

Statuses are based on source evidence only. “Complete” does not mean runtime verified. Route groups in parentheses are omitted from browser URLs. `API` names the related handler path. This inventory captures baseline findings; the current execution status is in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

| ID | Feature / route | Purpose and implementation evidence | API / data | Role(s) | Status | Issues / priority |
|---|---|---|---|---|---|---|
| F-001 | Landing `/` | Hero, featured/trending/community sections; `src/app/(routes)/page.js`, `src/components/sections/*` | `/api/places`, `/api/stats/public`; places | Guest+all | PARTIALLY COMPLETE | Dynamic data and error states need runtime verification; P2 |
| F-002 | Explore `/explore` | Client search/filter/grid; `PlaceFilter`, `PlaceGrid`, filter store | `/api/places`; places | Guest+all | Implemented in code | Search is keyboard/pointer usable; inert Map View was removed; runtime filter behavior remains unverified |
| F-003 | Place detail `/explore/[placeId]` | Fetches place/reviews; gallery, map embed, details | `/api/places/[placeId]`, reviews; places/reviews | Guest+all | PARTIALLY COMPLETE | Favorites persist; unsupported route controls and fabricated fallback facts were removed. Runtime behavior remains unverified |
| F-004 | Reviews | Read, create, delete own, admin moderate | `/api/places/[placeId]/reviews`, `/api/reviews/[reviewId]`, `/api/admin/reviews*`; reviews | User/admin | Implemented in code | Verified-account eligibility and moderation permissions are enforced; aggregate updates are transactional. P-501 tests skipped by user direction |
| F-005 | Account registration | Create user, hash password, issue JWT | `/api/auth/register`; users | Guest | COMPLETE | Runtime and duplicate-race verification absent |
| F-006 | User login/logout/session | HttpOnly cookie, database-backed session and auth store | `/api/auth/login`, `/logout`, `/me`; users | Guest/user | Implemented in code | Admin accounts are refused by standard login; logout does not revoke a copied stateless cookie before expiry |
| F-007 | Admin login | Access token + password + admin role, short admin-session JWT | `/api/auth/admin-login`; users | Admin | Implemented in code | Admin access-token configuration and login throttling are deployment/runtime concerns; latest source build is pending |
| F-008 | Submit a place `/contribute` | Contribution form, place document creation and pending/approved setting | `/api/places` POST; places/users/settings | User/admin | PARTIALLY COMPLETE | Approval rules exist; no media upload; verification claim mismatch; P1 |
| F-009 | Contributor dashboard `/dashboard` | Stats and contributions | `/api/dashboard/stats`, `/my-contributions`; users/places/reviews | User | PARTIALLY COMPLETE | Aggregates and owner filtering need runtime/data verification; P2 |
| F-010 | User profile `/dashboard/profile` | Edit profile/password endpoints and UI | `/api/user/profile`, `/password`; users | User/admin | PARTIALLY COMPLETE | Client validation/error coverage unverified; P2 |
| F-011 | User reports `/report`, dashboard reports | Submit guest/auth report; authenticated user list | `/api/reports`; reports | Guest/user | COMPLETE | Input shape not strongly constrained; duplicate/spam controls absent; P2 |
| F-012 | Admin report handling `/admin/reports` | List/filter/update action and status | `/api/admin/reports`; reports/audit_logs | Admin with permission | PARTIALLY COMPLETE | Endpoint checks module permissions; runtime workflow unverified; P2 |
| F-013 | Contact support `/contact` | Submit support request to MongoDB | `/api/support`; support_tickets | Guest | COMPLETE | No email send/confirmation workflow; P2 |
| F-014 | Admin support `/admin/support` | List/update/delete tickets | `/api/admin/support`; support_tickets | Permitted admin | PARTIALLY COMPLETE | Status/filters UI/API consistency unverified; P2 |
| F-015 | Newsletter updates list | Public email capture; admin list with permission gate, search, and pagination | `/api/newsletter`, `/api/admin/newsletter`; newsletter_subscribers | Guest / authorized admin | Implemented in workspace | Collection only: no automated email delivery or unsubscribe controls; addresses are retained until manually removed per approved P-302 policy |
| F-016 | Admin users/contributors | List/create/edit/delete accounts, roles/permissions | `/api/admin/users*`; users | Admin with permissions | PARTIALLY COMPLETE | Check privilege assignment paths; some UI tables are admin surfaces; P0 |
| F-017 | Admin place management | List/search/edit/delete places, moderation | `/api/places*`, `/api/admin/approvals`; places | Admin | PARTIALLY COMPLETE | API role/permission enforcement differs by operation; P1 |
| F-018 | Admin review moderation | List/edit/delete/visibility | `/api/admin/reviews*`, approvals; reviews/places | Admin | PARTIALLY COMPLETE | Some handlers use role-only checks; P1 |
| F-019 | Admin settings `/admin/settings` | Public config read and privileged update | `/api/admin/settings`, `/api/settings/public`; settings | Admin/guest read | PARTIALLY COMPLETE | Dynamic settings and client behavior not runtime-verified; P2 |
| F-020 | Admin search | Search users/places/reviews | `/api/admin/search`; users/places/reviews | Admin | COMPLETE | Unbounded query/input cost should be reviewed; P2 |
| F-021 | Visitor analytics/logs | Track public visit and view admin aggregates | `/api/visitor/log`, `/api/admin/logs`, stats endpoints; visitor_logs | Guest/admin | PARTIALLY COMPLETE | IP/user-agent collection privacy/retention need review; P1 |
| F-022 | Admin audit trail | Write administrative events, browse logs | `writeAudit`, `/api/admin/audit`; audit_logs | Admin | PARTIALLY COMPLETE | Writes are best-effort and swallow errors; not every mutation consistently logged; P2 |
| F-023 | Policy/help pages | About, FAQ, guidelines, terms, privacy, cookies, accessibility | Static page files | Guest | COMPLETE | Legal content accuracy and accessibility not independently verified |
| F-024 | Map directions/routes | Map embed and external map link exist | `src/lib/maps.js` | Guest+all | PLACEHOLDER / MOCK | “Nearby Routes” and “Directions” tab is explicit coming-soon UI; P2 |
| F-025 | Saved places/itinerary | Persisted saved-place controls on cards, place detail, and dashboard | `/api/user/favorites`; favorites/places | User | Implemented in code | Saved places persist; no itinerary planner is implemented |
| F-026 | Place image upload | Images field accepts URL/data URI in schema | places.images | Contributor/admin | NOT IMPLEMENTED | No upload API/storage service found; UI may accept images but no managed upload flow; P2 |
| F-027 | In-app notifications | Manual admin announcements with audience roles, client modal, month groups, and admin CRUD/search/pagination | `/api/notifications`, `/api/admin/notifications*`; notifications/users | Authenticated user/admin | Implemented in workspace | No email or browser push is sent; permission assignment and runtime behavior still need validation |

## Cross-cutting observations

- API listing is in [Architecture](ARCHITECTURE.md) and [Evidence](AUDIT_EVIDENCE.md); 31 `route.js` files found.
- Saved-place persistence is implemented through `/api/user/favorites`. Booking, reservation, and nearby route data are not implemented. Manual in-app notifications are implemented; automated email/browser push remains out of scope.
- Several user-visible fields use fallback static text (best time, tips, accessibility, opening times); see [UI/UX](UI_UX_AUDIT.md).
- Test evidence is absent; see [Performance and testing](PERFORMANCE_AND_TESTING.md).
