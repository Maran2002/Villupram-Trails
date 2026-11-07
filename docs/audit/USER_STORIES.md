# User stories

Stories below reflect existing pages/APIs and visible UI. Missing behavior is marked proposed only where the UI or repository documentation indicates it. Acceptance criteria are target expectations for implementation status, not proof of test success.

## Guest

### US-GUEST-001 — Discover destinations
As a guest, I want to browse and search approved Villupuram places so that I can plan a visit.

- Preconditions: public site available.
- Acceptance: Given approved places exist, when I open Explore, then I can browse them; when I filter/search, then visible results match; when no results exist, then a clear empty state appears.
- Status: Partial. Evidence: `(routes)/explore/page.js`, `PlaceGrid`, `/api/places`. Priority P1. Dependencies: MongoDB/place data.

### US-GUEST-002 — Read place information
As a guest, I want to view a destination's details, map, hours and reviews so that I can assess a visit.

- Acceptance: destination content is available to crawler/user; missing facts are labeled; external directions open a valid map; non-existent IDs show not-found.
- Status: Partial. Evidence: `(routes)/explore/[placeId]/page.js`, `/api/places/[placeId]`. P1.

### US-GUEST-003 — Contact support
As a guest, I want to send a contact request so that the community team can respond.

- Acceptance: required fields validate; successful submission is acknowledged; ticket is stored and available to permitted admins; failures are actionable.
- Status: Partial (storage exists; response delivery not found). Evidence: contact page, `/api/support`, `support_tickets`. P2.

### US-GUEST-004 — Report content
As a guest, I want to report inappropriate content so that admins can review it.

- Acceptance: report identifies a type/reason/details; persistence produces a confirmation; admin queue can process it.
- Status: Partial. Evidence: report page, `/api/reports`, `/api/admin/reports`. P1.

### US-GUEST-005 — Submit an email to the updates list
As a guest, I want to submit my email so an administrator can include it in the community updates list.

- Status: Implemented as collection only. Admins with `newsletter.view` can see stored addresses. The site does not send email or provide unsubscribe controls. User-approved policy keeps addresses until an operator manually removes them; privacy requests use the contact form. P3.

## User / contributor

### US-USER-001 — Register and sign in
As a visitor, I want to create an account and log in so that I can contribute.

- Acceptance: valid credentials create a user with hashed password; duplicate identity is rejected; login issues bounded session; logout invalidates browser session.
- Status: Implemented in code; runtime validation remains. Auth uses HttpOnly cookies and fail-closed JWT configuration. P0.

### US-USER-002 — Submit a destination
As a contributor, I want to submit a place so that local destinations can be added.

- Acceptance: required fields validate; place is stored with submitter; configured moderation policy controls status; contributor sees its status.
- Status: Partial. Evidence: contribute page, `/api/places` POST, dashboard contributions. P1.

### US-USER-003 — Review a destination
As a signed-in user, I want to rate and describe a place so that other travelers can benefit from experience.

- Acceptance: only the intended eligible account can submit; rating/comment validate; moderation visibility follows settings; aggregate count/rating updates.
- Status: Implemented in code. Verified-account eligibility is checked server-side; review aggregates update transactionally after create, edit, moderation, and deletion. Automated tests were skipped at the user's direction. P1.

### US-USER-004 — Manage profile and password
As a user, I want to update my profile and password so that my account remains current and secure.

- Status: Partial. Evidence: dashboard profile, `/api/user/profile`, `/api/user/password`. P2.

### US-USER-005 — Track contributions and reports
As a contributor, I want to see my submitted places, reviews and reports so that I know what needs attention.

- Status: Partial. Evidence: dashboard pages/APIs. P2.

### US-USER-006 — Save a destination
As a user, I want to save a destination for later so that I can revisit it.

- Status: Implemented in code via `/api/user/favorites`; saved places appear in the user's dashboard. Runtime behavior remains unverified. P2.

## Admin

### US-ADMIN-001 — Moderate place submissions
As an authorized admin, I want to approve, reject or edit pending destinations so that public listings remain accurate.

- Status: Partial. Evidence: admin places/approvals UI and APIs. P1.

### US-ADMIN-002 — Moderate reviews
As an authorized admin, I want to hide, edit or delete reviews so that community content is safe.

- Status: Partial. Permission checks differ by endpoint. Evidence: admin review UI/APIs. P1.

### US-ADMIN-003 — Manage accounts and permissions
As an authorized admin, I want to manage accounts and scoped permissions so that responsibilities can be delegated safely.

- Status: Implemented in code; runtime role-boundary review remains. Admin role and permission mutations are allowlisted and permission-gated. P0.

### US-ADMIN-004 — Process reports and support requests
As an authorized admin, I want to assign status and document action so that user concerns are tracked.

- Status: Partial. Evidence: admin reports/support UI/APIs. P2.

### US-ADMIN-005 — Configure moderation and site settings
As an authorized admin, I want to control public settings and moderation behavior so that operations match policy.

- Status: Partial. Evidence: settings API/UI. P2.

### US-ADMIN-006 — Review visitor and audit logs
As an authorized admin, I want to inspect activity records so that I can understand traffic and administrative changes.

- Status: Implemented in code; operational privacy review remains. Visitor fields are minimized, private routes excluded, and retention indexes are live on configured Atlas. P1.

### US-ADMIN-007 — Search administrative records
As an admin, I want to search across places, users and reviews so that I can reach records quickly.

- Status: Implemented in code; runtime unverified. Evidence: `/api/admin/search`, `AdminSearch`. P2.

## Proposed stories (not established requirements)

- **US-PROPOSED-001:** As a visitor, I want managed image uploads and verified destination photography. No upload storage workflow was found; proposed based on image-related UI/schema/documentation only.
- **US-PROPOSED-002:** As a traveler, I want nearby itineraries and directions. Detail tabs currently state “coming soon”; no route data service was found.
