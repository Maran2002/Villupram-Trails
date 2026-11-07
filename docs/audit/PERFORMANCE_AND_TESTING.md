# Performance and testing

## Performance and production readiness

- `package.json` has dev/build/start/lint scripts; no test script is declared. No test files were found in the inspected tree.
- `scripts/setup-indexes.mjs` indexes for places, reviews, users, audit logs, favorites, newsletter subscribers, support tickets, reports, and visitor logs were applied to the configured Atlas database and verified. Representative query plans use the intended indexes; the dataset is small and no production-scale benchmark was run.
- `src/lib/mongodb.js` caches a client promise globally in development and creates a client per module load in non-development. Production serverless connection/pool behavior is unverified.
- Public browse API applies pagination (default 12, cap 50) and sorts by creation date. Admin reports, support, and newsletter lists are paginated with bounded page sizes; other query/index behavior still needs dataset-scale confirmation.
- Client components and animation libraries increase client JS; no bundle report or network profile was generated.
- Next image remote pattern only permits `images.unsplash.com`; actual component usage, image sizing, lazy behavior and data URI cost were not benchmarked.
- No caching strategy, error monitoring provider, or structured logging pipeline was established by inspection.
- Repository-wide `npm run lint` exits successfully with 20 warnings, mostly image optimization recommendations.
- The user reported a successful build before the final security-session and return-path edits. A subsequent `npm run build` on the updated source reached “Creating an optimized production build” and produced no further output for about two minutes; it was interrupted. The CLI identified Turbopack. The latest source therefore has no completed build verification.
- A local dev server was already running at `http://localhost:3000`, which is now the `.env` rehearsal origin. Browser-based accessibility review was attempted but Chrome computer-use access was not approved; no browser interaction was performed.

## Test inventory

| Test type | Evidence | Result |
|---|---|---|
| Unit | No test files/config found | Not present in inspected repository |
| API integration | None found | Not present |
| Component | None found | Not present |
| E2E/browser | None found | Not present |
| Auth/authorization | None found | Critical gap |
| Validation/regression | None found | Critical gap |
| Coverage report | None found | Not available |

No tests were added or run, at the user's direction to skip P-501. No passing/failing test claim is made; automated test coverage is an explicitly accepted gap for this release plan.

## Automated test scope

P-501 was skipped at the user's direction. Keep test execution and test-file creation out of this workstream unless the user changes that instruction. Manual release checks and database/query-plan inspection are documented separately and do not count as automated tests.

## Production verification checklist

Confirm environment variables without exposing values; MongoDB connectivity/indexes; secrets and rotation; headers and transport; error/monitoring; backup and restore; build/start in staging; Vercel route/runtime behavior; actual accessibility and Lighthouse/crawler measurements. See [roadmap](DEVELOPMENT_ROADMAP.md).
