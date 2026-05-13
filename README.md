# Villupuram Discovery Hub (Villupuram Elite / Trails)

> **Project started on:** 09-05-2026

## About The Project

Villupuram Discovery Hub is a community-driven platform for travelers to explore and discover all places available in and around the Villupuram district of Tamil Nadu. Our goal is to cover both well-known tourist attractions and undiscovered hidden gems with rich, relevant details.

This project is **open-sourced and open to contributions!** We welcome developers, designers, and local experts to help us build the most comprehensive travel and heritage directory for Villupuram.

## Key Features (Latest Updates - May 14, 2026)

### 🛡️ Security & Access Control (RBAC)
- **Granular Permissions**: Implemented a robust Role-Based Access Control (RBAC) system using a centralized `hasPermission` engine.
- **Superadmin Authority**: Hardened the platform with a `SUPERADMIN_ID` level, ensuring critical administrative actions are restricted.
- **AES-256 Encryption**: Integrated CryptoJS into local storage persistence for client-side data security.
- **Automated Session Recovery**: Global API interceptors detect token expiry (401 errors) and synchronize UI state.

### 🎧 Support & Community Management
- **Centralized Support Hub**: New administrative dashboard to manage user inquiries from the Contact and FAQ pages with status tracking.
- **Email Integration**: Integrated mail-to shortcuts for admins to respond directly to community inquiries.
- **Content Moderation Toggles**: Global switches for "Automatic Approvals" vs "Manual Moderation" for both new places and community reviews.

### 🚩 Content Curation & Integrity
- **Curated Feeds**: New "Trending" (🔥) and "Featured" (⭐) toggles allowing admins to hand-pick destinations for the homepage.
- **Enhanced Places Management**: Dedicated "Requests" tab for handling submissions with a side-by-side diff view of changes.
- **Admin Audit Trail**: Comprehensive logging for all administrative actions, including approvals and settings modifications.
- **Visitor Insights**: Real-time visitor tracking and logging system providing traffic analytics.
- **Global Admin Search**: Intelligent, fuzzy search for deep-linking across Users, Places, Reviews, and Navigation.

### 🏗️ Architectural Refinements
- **Layout Groups**: Modern Next.js organization using route groups (`(admin)`, `(dashboard)`, `(auth)`, `(routes)`) for distinct layout management.
- **Centralized API Client**: Unified Axios-based client for consistent authentication header injection and global error handling.

## User Story & Features

When a user visits the platform, they can explore detailed listings of various destinations. This includes:
- Comprehensive details and historical significance
- Opening hours and best times to visit
- Community reviews with photos
- Information about special occasions, dates, and related media
- Google Maps location links and routing

**Interactivity & Contributions:**
- If a user has already visited a place, they can add their own reviews and photos.
- To maintain community safety and content quality, **only verified accounts** are able to submit reviews.
- Users can register and create an account to add completely unseen or new places to the directory.
- Contributors get access to a **separate personalized dashboard** where they can track and manage all their contributions (reviews, places added, and approval statuses).

## Technology Stack

This project is built using a modern, scalable JavaScript stack optimized for serverless deployment:

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Framer Motion
- **Backend:** Next.js API Route Handlers, Node.js
- **Database:** MongoDB (Native Driver for optimal serverless connection pooling)
- **Security:** AES-256 Encryption (CryptoJS), JWT Authentication, Bcrypt hashing
- **Icons:** Lucide React
- **Hosting/Deployment:** Ready for Vercel

## Getting Started

### Prerequisites
You will need a MongoDB instance (local or Atlas) to run the application.

1. Clone the repository.
2. Copy `.env.local.example` (or create `.env.local`) and add your MongoDB URI and JWT Secret:
   ```env
   MONGODB_URI="mongodb://127.0.0.1:27017/villupuram_db"
   JWT_SECRET="your_super_secret_key_here"
   NEXT_PUBLIC_API_BASE_URL="http://localhost:3000/api"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Seed the database with initial admin users and placeholder places:
   ```bash
   node scripts/seed.js
   node scripts/seed_logs.js # Optional: for analytics testing
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

We are actively looking for contributors! Whether you want to improve the codebase, fix bugs, design new features, or add local data about Villupuram, your help is appreciated. 

Please feel free to fork the repository, make your changes, and submit a Pull Request.
