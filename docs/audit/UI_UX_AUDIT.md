# UI/UX audit

**Method:** source-level structural/style inspection only. No browser viewport screenshots, keyboard audit, screen-reader run, or interaction testing was performed. Responsive conclusions are inferred from Tailwind classes, not measured.

## Page and journey review

| Area | Evidence | Assessment |
|---|---|---|
| Public shell | `src/components/layout/Header.jsx`, `Footer.jsx`, `(routes)/layout.js` | Shared navigation, theme control, mobile menu and footer are present; active styles and mobile interactions need live review. Header hover/outside-click behavior and focus visibility are not proven. |
| Home | `(routes)/page.js`, `src/components/hero/*`, `sections/*` | Strong visual hierarchy with hero and destination sections; dynamic empty/error states and content density need runtime review. |
| Explore | `(routes)/explore/page.js`, `PlaceFilter`, `PlaceGrid` | Search field and mobile filter drawer exist; search CTA and Map View are inert. “Featured Destinations” heading may not reflect all list results. |
| Place detail | `(routes)/explore/[placeId]/page.js`, `PlaceCarousel`, `PlaceReviews` | Rich cards/tabs and map. Nearby routes/directions and save controls imply unavailable functionality. Generic fallback travel facts could mislead. |
| Auth | `(auth)/auth/login`, `register`, `admin/vpm/login` | Forms and account entry paths exist; form feedback/validation, tab sequence and recovery journeys not fully runtime verified. |
| Contribution | `(contribute)/contribute/page.js` | Place contribution form and API exist. No managed image upload service discovered; field-level validation and draft recovery require verification. |
| Dashboard/profile | `(dashboard)/**` | Stats, profile and reports surfaces; empty/error/loading states and data consistency unverified. |
| Admin | `(admin)/admin/**`, admin components | Broad functionality and sidebar/search. Permission-filtered links may hide areas but are not proof of backend authorization; large tables/modal usability need browser review. |
| Help/contact/report | `(routes)/faq`, `contact`, `report` | FAQ/contact/report forms exist. Contact/report server persists data; outbound email/notifications not found. |
| Policy pages | privacy, cookies, accessibility, terms, guidelines | Static content exists; legal accuracy and semantic/accessibility quality need specialist review. |

## Visual system

Global CSS and Tailwind classes show a consistent neutral/primary palette, light/dark variants, rounded cards, shadows, and serif headings. Framer Motion is used for entrances/accordions. Repeated bespoke utility strings indicate no clearly centralized component token system beyond shared components. Color contrast, type scaling, animation preferences, and consistency across every page were not measured.

## Responsive behavior

Evidence of responsive classes includes `sm`, `md`, `lg` breakpoints and an explicit mobile Explore filter drawer. Desktop filter sidebar is hidden below `lg`; mobile drawer uses fixed overlay. This suggests responsive intent but does not confirm no overflow or usable controls at 320 px, 768 px, 1024 px, or 1280 px. Admin tables, detail tabs, header menus and forms require viewport testing.

## Accessibility and usability risks

- Controls represented by icon-only buttons should have accessible names; some have `title`, but systematic `aria-label` coverage was not verified.
- Focus-visible styling, keyboard trap/escape handling for drawers and menus, semantic landmark/heading order, contrast, reduced-motion support, image alternative text, and form error association require audit in browser.
- `iframe` map has a title; image usage and decorative alt handling vary.
- Inert controls (Search, Map View, bookmarks) violate interaction expectations.
- Generic detail fallbacks make absent data look authoritative.

## UX backlog

Prioritize wiring/removing inert controls (I-002), explicit unavailable data, clear empty/error states, consistent form validation, and keyboard/screen reader checks. Link corresponding tasks in [roadmap](DEVELOPMENT_ROADMAP.md).
