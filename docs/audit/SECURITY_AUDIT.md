# Security review

**Review date:** 2026-11-07  
**Method:** static source review of authentication, authorization, public API validation, session handling, rendering, and security headers. This is not a penetration test, dependency advisory scan, secret scan, or live endpoint test. No secret values were read into the report.

## Findings

| ID | Severity | Status | Finding and evidence | Follow-up |
| --- | --- | --- | --- | --- |
| SEC-01 | High | Fixed in workspace; not build-verified | Standard email login previously accepted administrator accounts and issued a seven-day cookie, bypassing the separate admin access-token flow and its one-hour session. `/api/auth/login` now rejects admin accounts; admin JWTs carry an `adminSession` claim checked by `getAuthUser` and `src/proxy.js`. | Admins with cookies issued before this change must sign in again through `/auth/admin/vpm/login`. The current build attempt stalled before completion. |
| SEC-02 | Medium | Fixed in workspace; not build-verified | The login page previously passed the untrusted `from` query value directly to `router.push`. It now accepts only same-origin paths. | Retain validation if return-path behavior changes. |
| SEC-03 | Medium | Open; operational mitigation needed | Public registration, support, report, newsletter, visitor-log, and admin-login endpoints have no shared rate limit. Several have field limits, but repeated submissions can still consume database and application resources. | Configure platform-level rate limiting/abuse controls and monitor rejected traffic. Deployment controls are operator-owned. |
| SEC-04 | Medium | Open | Request-size enforcement is inconsistent. Visitor logging checks `Content-Length`; other JSON routes do not apply a shared request-body cap. | Set a body-size ceiling at the hosting/proxy layer and add endpoint limits where large place-image payloads are accepted. |
| SEC-05 | Medium | Open; deployment configuration | `next.config.mjs` sets `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, and `Permissions-Policy`, but does not set CSP or HSTS. | Define a CSP compatible with maps/assets and enable HSTS only on the HTTPS deployment. |
| SEC-06 | Medium | Open | Profile and site-settings handlers accept some values without complete per-field type, length, URL, or schema validation. Access is authenticated/permission-gated, but malformed data can corrupt display fields or increase storage. | Add explicit allowlists and caps for profile image, bio/location, and settings fields. |
| SEC-07 | Medium | Open | Logout clears the current browser cookie but does not revoke a copied stateless JWT. Password and privilege changes increment `sessionVersion`; a stolen cookie remains usable until its expiry or such a change. | Consider a session revocation mechanism if single-session logout is required; otherwise document the one-hour admin/seven-day user expiry behavior. |
| SEC-08 | Low/Medium | Open | `writeAudit()` catches and suppresses all persistence failures, so security-relevant actions can succeed without a corresponding audit record. | Add monitoring or a durable failure signal for audit writes. |
| SEC-09 | Informational | Not assessed | Production secret quality/rotation, database-user least privilege, TLS/host configuration, platform logs, dependency advisories, backup security, and incident monitoring were not inspected. | Operator review; production operations were explicitly delegated to the user. |

## Controls confirmed in source

- JWT secret handling fails closed when `JWT_SECRET` is missing or shorter than 32 characters; no hard-coded fallback remains in the shared auth or proxy paths.
- Cookies are HttpOnly, SameSite=Lax, and Secure in production. API authentication reloads the user from MongoDB and compares `sessionVersion`.
- Admin API routes use module/action permissions; permission keys/actions are allowlisted, and role/permission changes are superadmin-only. The notification endpoints follow the same checks.
- Unsafe API methods pass through an exact-origin check in `src/proxy.js`.
- Search terms are length-bounded and escaped before becoming regular expressions. User-generated text is rendered as React text; no `dangerouslySetInnerHTML` use was found in the inspected source.
- Place image inputs are restricted to HTTPS URLs or bounded PNG/JPEG/WebP data URIs by the shared schema builder.
- Visitor-log fields are minimized and private/authenticated page paths are excluded in the tracker route.

## Release conclusion

No penetration or live endpoint testing was performed. P-501 automated tests remain skipped at the user's direction. The two code findings fixed in this review still need a successful build on the updated source. Rate limiting, request-size limits, CSP/HSTS, audit-failure visibility, logout revocation policy, and operator-owned deployment controls remain release risks. Privacy/legal review and production operations were explicitly waived/delegated by the user; this does not establish them as complete.
