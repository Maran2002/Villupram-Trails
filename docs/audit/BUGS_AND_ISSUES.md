# Bugs and issues

Static findings; runtime reproduction was not performed. Confirmed means directly visible in code or a stated placeholder, not that a live deployment was exercised.

## Confirmed defects / incomplete workflows

The table contains **11 code-confirmed findings**. Four directly establish a user-visible or policy mismatch (I-001 through I-004); the remaining entries are security, privacy, error-handling, or framework-maintenance weaknesses confirmed in source/docs, with production impact unverified.

| ID | Severity | Feature / route | Evidence and observed behavior | Expected behavior / impact | Suggested remediation |
|---|---|---|---|---|---|
| I-001 | High | Place reviews | `src/app/api/places/[placeId]/reviews/route.js` POST checks authenticated user and optional moderation setting; no `isVerified` check. README claims only verified accounts can review. | Enforce documented eligibility or align documentation/product rule; unverified accounts can currently submit by code path. | Define verification source and enforce server-side; add tests. |
| I-002 | High | Explore | `src/app/(routes)/explore/page.js`: Search button has no `onClick`; filtering is driven by input/store. Map View button has no handler. | Buttons should trigger described behavior or be removed/disabled. | Wire handlers or remove affordances. |
| I-003 | Medium | Place details | `src/app/(routes)/explore/[placeId]/page.js`: Nearby Routes/Directions render “coming soon”; save/itinerary buttons only emit success toast. | Avoid implying completed navigation/persistence. | Implement or relabel and define persistence. |
| I-004 | High | Admin authorization | Admin APIs differ: some use `hasPermission`, several use role-only checks (`/api/admin/reviews`, `/audit`, `/logs`, `/stats`, `/search`, dynamic review handlers). | Permissions configured in admin UI should be consistently enforced at server boundary. | Centralize policy and test every endpoint/action. |
| I-005 | Critical | Authentication security | `src/lib/auth.js`, login/register, middleware use `process.env.JWT_SECRET || 'secret'` (some route uses different fallback). | Production must fail closed without a strong secret. | Require a configured high-entropy secret; rotate if fallback ever used. |
| I-006 | Medium | Auth store | `src/lib/store/authStore.js` persists auth state and also writes token to localStorage; logout clears local values and cookie. Encryption key is bundled client-side. | Client-side encryption cannot protect bearer tokens from same-origin script compromise. | Reduce token exposure and review persistence/session model. |
| I-007 | Medium | Admin review/user management | `src/lib/schemas.js` allows admin `permissions` object from request body with minimal normalization; user admin mutation endpoints need full privilege-boundary review. | Restrict who may grant roles/permissions and which permission keys/actions are accepted. | Allowlist permission schema and constrain privilege escalation. |
| I-008 | Medium | Place details content | Defaults like best-time, practical tips, accessibility, hours and entry fee can display generic assumed values when data missing. | Visitors should distinguish missing facts from verified destination data. | Use explicit “not provided” states or sourced data fields. |
| I-009 | Medium | Privacy/analytics | `VisitorTracker` posts path, user agent, IP-derived data and client attributes; retention/consent behavior not found in reviewed flow. | Explain collection and define minimization/retention. | Review privacy notice, consent, retention, and IP handling. |
| I-010 | Low | Error contracts | Axios interceptor reads `error.response.data.message`, while most handlers return `error`; user-facing error may fall back to generic Axios text. | Preserve actionable API error messages. | Normalize response contracts/interceptor. |
| I-011 | Low | Framework maintenance | Next.js 16.2.6 installed guide `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` marks `middleware` convention deprecated/renamed to `proxy`; app uses `src/middleware.js`. | Current convention may produce deprecation friction and requires migration planning; no runtime failure was tested. | Plan migration per installed guide and verify matchers/behavior. |

## Potential defects / risks requiring execution

### Current implementation dispositions (2026-11-07)

The findings below describe the initial audit snapshot. Code changes since that snapshot address I-001 through I-011 in code: verified-account review checks, Explore controls, detail-page save/data behavior, server-side permission checks, fail-closed JWT configuration, HttpOnly-cookie auth state, permission allowlisting, truthful missing-data states, minimized/retained visitor logs, normalized API error messages, and the `proxy` convention. Review and place mutations now update aggregates inside MongoDB transactions; three stale Atlas aggregates were repaired and a follow-up check found no mismatches. Runtime/browser behavior remains unverified. P-501 automated tests were explicitly skipped at the user's direction.

There are **9 grouped potential or runtime-verification risks** below; none is reported as a reproduced runtime defect.

- Dynamic routes, forms, mobile drawer, filters and admin workflow interactions may have state/parameter issues; static inspection is insufficient to reproduce.
- MongoDB documents and indexes may not match code assumptions; no database inspection occurred.
- Inconsistent JWT fallback strings across files can cause login-issued tokens to fail verification when `JWT_SECRET` is unset (`/api/auth/me` uses a different fallback); configuration determines impact.
- Regex search uses user-provided terms and may have performance risks; query limits and indexes require review.
- Place CRUD uses `ObjectId` construction in some paths after ID checks are inconsistent; malformed input behavior needs endpoint-level tests.
- Review/place aggregate consistency may drift after multi-step updates/deletes if an operation fails midway.
- Responsive layout, keyboard operation, contrast, and hydration issues are not confirmed without browser/assistive testing.
- Build/lint/dependency compatibility was not executed or asserted.

## Unverified risks

Production environment variables, database connectivity, third-party Maps key restrictions, Vercel deployment settings, security headers, CORS/rate limiting, production logs, real admin permission assignments, and actual runtime console/network failures were not inspected or tested. See [Security](SECURITY_AUDIT.md), [UI/UX](UI_UX_AUDIT.md), and [Performance/testing](PERFORMANCE_AND_TESTING.md).
