# SEO audit

## Summary

**Readiness: low to moderate by code evidence; not scored as a numeric grade.** The app has generic root title/description, but no inspected route-specific metadata, sitemap, robots policy, canonical URLs, Open Graph/Twitter configuration, or structured data. Public exploration/detail pages are client components that load record content after render, limiting confidence about crawler-visible destination content without runtime rendering inspection.

For a reproducible implementation-only score, use seven equally weighted checks below (1 = absent/weak in inspected code, 3 = partial evidence, 5 = implemented and verified). The current **static SEO implementation score is 1.6/5 (31%)**, rounded from 11/35: metadata 1, indexability/rendering 2, sitemap/robots 1, structured data 1, semantic structure 3, image SEO 2, URL/canonical 1. This is a code-presence rubric, not a Lighthouse score, search ranking estimate, or verified production readiness score; runtime crawler behavior was not tested.

## Findings

| ID | Area | Evidence | Assessment / recommendation |
|---|---|---|---|
| SEO-01 | Metadata | `src/app/layout.js` defines title “Villupuram Travel Community” and generic description. `src/app/not-found.js` defines metadata. No page `metadata`/`generateMetadata` references found in route files. | Add unique titles/descriptions and social metadata for public informational pages and place detail. |
| SEO-02 | Rendering/indexability | Explore and place detail declare `'use client'`; place data is fetched by client hooks. | Verify rendered HTML and indexing; consider server-rendered data for indexable destination details. No crawler test performed. |
| SEO-03 | Sitemap/robots | No `src/app/sitemap.*`, `src/app/robots.*`, or corresponding public files found in enumerated tree. | Provide crawl directives and discoverable approved destination URLs. |
| SEO-04 | Structured data | No JSON-LD/schema.org implementation found. | Evaluate tourism place/Breadcrumb structured data with valid source data. |
| SEO-05 | Semantics/content | Pages include headings and detail H1; dynamic places may have generic fallback text. | Ensure unique factual copy and avoid template-like fallback facts. |
| SEO-06 | Images | `next.config.mjs` allows `images.unsplash.com`; local assets exist. No upload/image SEO pipeline or systematic dimensions/alt audit run. | Verify optimized image component use, descriptive alt, dimensions, and social preview assets. |
| SEO-07 | URL/canonical | Dynamic place route uses `[placeId]`; canonical/noindex behavior not found in static scan. | Decide canonical URL policy, especially query-filtered listings and admin/auth pages. |

No Lighthouse, crawler, rich-results, or Search Console data was collected. Findings are implementation gaps or verification needs, not measured rankings.
