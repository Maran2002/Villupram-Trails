# Villupuram Discovery Hub (Villupuram Elite / Trails)

> **Project started on:** 09-05-2026

## About The Project

Villupuram Discovery Hub is a community-driven platform for travelers to explore and discover all places available in and around the Villupuram district of Tamil Nadu. Our goal is to cover both well-known tourist attractions and undiscovered hidden gems with rich, relevant details.

This project is **open-sourced and open to contributions!** We welcome developers, designers, and local experts to help us build the most comprehensive travel and heritage directory for Villupuram.

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
- **Authentication:** Custom JWT (JSON Web Tokens) with Bcrypt password hashing
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
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

We are actively looking for contributors! Whether you want to improve the codebase, fix bugs, design new features, or add local data about Villupuram, your help is appreciated. 

Please feel free to fork the repository, make your changes, and submit a Pull Request.
