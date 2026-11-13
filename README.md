# Oor Thadam

> **Project started on:** 09-05-2026

## About The Project

Oor Thadam is a community-driven platform for travelers to explore and discover all places available in and around the Villupuram district of Tamil Nadu. Our goal is to cover both well-known tourist attractions and undiscovered hidden gems with rich, relevant details.

This project is **open-sourced and open to contributions!** We welcome developers, designers, and local experts to help us build the most comprehensive travel and heritage directory for Villupuram.

## Key Features (Latest Updates - May 14, 2026)

### 🛡️ Security & Access Control (RBAC)
- **Granular Permissions**: Implemented a robust Role-Based Access Control (RBAC) system using a centralized `hasPermission` engine.
- **Superadmin Authority**: Hardened the platform with a `SUPERADMIN_ID` level, ensuring critical administrative actions are restricted.
- **Cookie Sessions**: Authentication uses an HttpOnly session cookie; server routes enforce authorization.
- **Session Recovery**: The client checks the cookie-backed session and clears stale legacy browser auth state.

### 🎧 Support & Community Management
- **Centralized Support Hub**: New administrative dashboard to manage user inquiries from the Contact and FAQ pages with status tracking.
- **Support Queue**: Contact and FAQ forms store support requests for admin handling. Automatic email replies are not configured.
- **Content Moderation Toggles**: Global switches for "Automatic Approvals" vs "Manual Moderation" for both new places and community reviews.

### 🚩 Content Curation & Integrity
- **Curated Feeds**: New "Trending" (🔥) and "Featured" (⭐) toggles allowing admins to hand-pick destinations for the homepage.
- **Enhanced Places Management**: Dedicated "Requests" tab for handling submissions with a side-by-side diff view of changes.
- **Admin Audit Trail**: Comprehensive logging for all administrative actions, including approvals and settings modifications.
- **Visitor Insights**: New page-view records store the path, referrer origin, and coarse device/browser/OS labels; they omit IP addresses, raw user-agent strings, and screen dimensions.
- **Global Admin Search**: Intelligent, fuzzy search for deep-linking across Users, Places, Reviews, and Navigation.

### 🏗️ Architectural Refinements
- **Layout Groups**: Modern Next.js organization using route groups (`(admin)`, `(dashboard)`, `(auth)`, `(routes)`) for distinct layout management.
- **Centralized API Client**: Unified Axios-based client for consistent authentication header injection and global error handling.

## User Story & Features

When a user visits the platform, they can explore detailed listings of various destinations. This includes:
- Comprehensive details and historical significance
- Opening hours and best times to visit
- Community reviews
- Information about special occasions, dates, and related media
- Google Maps location links and routing

**Interactivity & Contributions:**
- If a user has already visited a place, they can add their own reviews and photos.
- To maintain community safety and content quality, **only accounts with a verified email address** can submit reviews. No identity document upload workflow is provided.
- Users can register and create an account to add completely unseen or new places to the directory.
- Contributors get access to a **separate personalized dashboard** where they can track and manage all their contributions (reviews, places added, and approval statuses).

## Technology Stack

This project is built using a modern, scalable JavaScript stack optimized for serverless deployment:

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Framer Motion
- **Backend:** Next.js API Route Handlers, Node.js
- **Database:** MongoDB (Native Driver for optimal serverless connection pooling)
- **Security:** HttpOnly cookie sessions, JWT signing, Bcrypt password hashing, server-side permissions
- **Icons:** Lucide React
- **Hosting/Deployment:** Ready for Vercel

## Getting Started

### Prerequisites
You will need a MongoDB instance (local or Atlas) to run the application.

1. Clone the repository.
2. Copy `.env.example` to `.env.local`, generate unique secrets, and configure your MongoDB URI and site URL:
   ```env
   MONGODB_URI="mongodb://127.0.0.1:27017/villupuram_db"
   JWT_SECRET="<generate-a-unique-secret-of-at-least-32-characters>"
   ADMIN_ACCESS_TOKEN="<generate-a-separate-random-token>"
   NEXT_PUBLIC_SITE_URL="https://your-production-domain.example"
   BREVO_API_KEY="<server-side Brevo API key>"
   BREVO_SENDER_EMAIL="<verified Brevo sender address>"
   BREVO_SENDER_NAME="Oor Thadam"
   EMAIL_OTP_SECRET="<optional dedicated random secret for OTP hashing>"
   GOOGLE_MAPS_API_KEY="<server-side key restricted to Geocoding and Static Maps APIs>"
   ```
   Generate each value with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. Do not deploy the placeholders.
   Configure a verified sender in Brevo. The server uses its transactional email API for registration verification and password reset codes; the API key remains server-only. Codes expire after 10 minutes, allow up to 5 attempts, and are limited to 5 sends per account per 24 hours with a 60-second resend cooldown. Legacy accounts with no `isVerified` field retain access; new self-registrations must verify before login. Legacy accounts without confirmation for their current address can verify it in Account Settings before reviewing. A change of email requires the current password and a code sent to the new address. Set a dedicated `EMAIL_OTP_SECRET` or the code HMAC uses `JWT_SECRET`.
   Google Maps keys are read only on the server. Restrict the key to the Static Maps and Geocoding APIs and to the server's allowed network/IP where supported. Map previews are served through a same-origin image route; reverse geocoding is available to signed-in users.
3. Install dependencies:
   ```bash
   npm install
   ```
4. For an empty database, configure `INITIAL_ADMIN_USERNAME`, `INITIAL_ADMIN_EMAIL`, and `INITIAL_ADMIN_PASSWORD` (at least 12 characters), then run `node scripts/create-admin.mjs` once. The script requires an explicit `MONGODB_URI`, refuses to run when an admin already exists, and does not print credentials. Set the printed account ID as `SUPERADMIN_ID`, restart the application, then remove the one-time bootstrap credentials from the environment.
5. Review `scripts/setup-indexes.mjs` before running it. Set `INDEX_SETUP_TARGET=local`, `staging`, `atlas`, or `production` alongside the intended `MONGODB_URI`. Local requires a loopback URI; Atlas requires `ALLOW_ATLAS_INDEX_SETUP=true`; production requires `ALLOW_PRODUCTION_INDEX_SETUP=true`. Back up the intended database first, then verify its index inventory and TTL results. Apply the rate-limit TTL index in the target database. For self-hosting, set `TRUSTED_CLIENT_IP_HEADER` to a header that your reverse proxy strips and replaces with the real client IP. Requests without a trusted IP share a rate limit per endpoint. Configure backups, retention, and monitoring for your deployment.
6. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

We are actively looking for contributors! Whether you want to improve the codebase, fix bugs, design new features, or add local data about Villupuram, your help is appreciated. 

Please feel free to fork the repository, make your changes, and submit a Pull Request.
