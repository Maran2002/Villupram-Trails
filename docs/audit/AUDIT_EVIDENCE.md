# Audit evidence index

Repository paths below are relative to the project root. Findings point to source files/functions so a reader can inspect exact evidence. Line numbers are omitted where source was reviewed by named function/route rather than captured as a stable numbered excerpt; use current checked-out files because pre-existing worktree edits may shift lines.

| Finding/topic | Evidence locations |
|---|---|
| Framework, scripts, dependencies | `package.json`, `next.config.mjs`, `tailwind.config.js`, `src/app/globals.css` |
| App Router pages/layouts | `src/app/layout.js`; `src/app/(routes)/**/page.js`; `src/app/(auth)/**/page.js`; `src/app/(contribute)/contribute/page.js`; `src/app/(dashboard)/**/page.js`; `src/app/(admin)/admin/**/page.js` |
| Next.js conventions checked | `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`; `15-route-handlers.md` |
| Deprecated routing convention | `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` states middleware convention is deprecated/renamed to proxy; project source is `src/middleware.js` |
| Authentication/JWT | `src/lib/auth.js` (`verifyToken`, `getAuthUser`); `src/app/api/auth/{register,login,admin-login,me,logout}/route.js`; `src/middleware.js` |
| Password hashing/session persistence | Auth API routes; `src/lib/store/authStore.js`; `src/lib/store/storage.js`; `src/lib/api.js` |
| RBAC | `src/lib/permissions.js` (`hasPermission`, `SUPERADMIN_ID`); `src/app/(admin)/admin/layout.js`; all `src/app/api/admin/**/route.js` |
| Place schema/validation | `src/lib/schemas.js` (`buildPlaceDoc`, `buildPlacePatch`, `buildUserPatch`, `buildReviewDoc`) |
| Place browse/contribute | `src/app/api/places/route.js`; `src/app/api/places/[placeId]/route.js`; `(contribute)/contribute/page.js`; `src/lib/hooks/usePlaces.js`; `src/components/place/PlaceGrid.jsx`; `PlaceFilter.jsx` |
| Review policy and flows | `src/app/api/places/[placeId]/reviews/route.js`; `src/app/api/reviews/[reviewId]/route.js`; `src/app/api/admin/reviews/**`; `src/components/place/PlaceReviews.jsx`; README verified-account statement |
| Explore inert controls | `src/app/(routes)/explore/page.js` search and Map View buttons |
| Detail placeholders/bookmarks | `src/app/(routes)/explore/[placeId]/page.js` `PlanYourVisit`, `handleSave`, tab content; `src/components/place/PlaceCarousel.jsx` |
| User dashboard/profile | `src/app/(dashboard)/dashboard/**`; `src/app/api/dashboard/**`; `src/app/api/user/{profile,password}/route.js` |
| Reports | `src/app/(routes)/report/page.js`; `(dashboard)/dashboard/reports/page.js`; `src/app/api/reports/route.js`; `src/app/api/admin/reports/route.js` |
| Support/contact | `(routes)/contact/page.js`; `src/app/api/support/route.js`; `src/app/(admin)/admin/support/page.js`; `src/app/api/admin/support/route.js` |
| Newsletter | `src/app/api/newsletter/route.js`; no page/component found in source inventory |
| Admin workflow screens | `src/app/(admin)/admin/**`; `src/components/admin/**`; matching `src/app/api/admin/**` handlers |
| Visitor tracking/privacy | `src/components/common/VisitorTracker.jsx`; `src/app/api/visitor/log/route.js`; admin logs/stats API and pages; privacy/cookie pages |
| Settings | `src/app/(admin)/admin/settings/page.js`; `src/app/api/admin/settings/route.js`; `src/app/api/settings/public/route.js`; settings store |
| MongoDB/data/indexes | `src/lib/mongodb.js`; collection references across `src/app/api`; `scripts/setup-indexes.mjs` |
| SEO | `src/app/layout.js`; `src/app/not-found.js`; no discovered sitemap/robots/page metadata files in enumerated app/public tree |
| Tests | `package.json` scripts; repository tree search for `*.test.*` / `*.spec.*` returned none |
| Deployment | `README.md`, `.vercel/`, `next.config.mjs`; no deployment operation performed |
| Existing documentation claims | `README.md`, `site_audit.md`, `site_audit.md.resolved`, `EXECUTIVE_SUMMARY.md`, `QUICK_START_GUIDE.md`, `READING_GUIDE.md`, `DESIGN.md`, `COMPONENT_CHECKLIST.md`, `ANIMATION_PATTERNS_GUIDE.md`, `CLAUDE.md` |

## API route inventory

31 Route Handler files were found. Methods below are source exports.

| Route | Methods |
|---|---|
| `/api/admin/approvals` | GET, PUT |
| `/api/admin/audit` | GET |
| `/api/admin/logs` | GET |
| `/api/admin/reports` | GET, PATCH |
| `/api/admin/reviews` | GET |
| `/api/admin/reviews/[reviewId]` | PUT, DELETE |
| `/api/admin/search` | GET |
| `/api/admin/settings` | GET, PUT |
| `/api/admin/stats` | GET |
| `/api/admin/support` | GET, PATCH, DELETE |
| `/api/admin/users` | GET, POST |
| `/api/admin/users/[id]` | PUT, DELETE |
| `/api/auth/admin-login` | POST |
| `/api/auth/login` | POST |
| `/api/auth/logout` | POST |
| `/api/auth/me` | GET |
| `/api/auth/register` | POST |
| `/api/dashboard/my-contributions` | GET |
| `/api/dashboard/stats` | GET |
| `/api/newsletter` | POST |
| `/api/places` | GET, POST |
| `/api/places/[placeId]` | GET, PUT, DELETE |
| `/api/places/[placeId]/reviews` | GET, POST |
| `/api/reports` | GET, POST |
| `/api/reviews/[reviewId]` | DELETE, PATCH |
| `/api/settings/public` | GET |
| `/api/stats/public` | GET |
| `/api/support` | POST |
| `/api/user/password` | PUT |
| `/api/user/profile` | GET, PUT |
| `/api/visitor/log` | POST |
