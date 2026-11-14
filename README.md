# Oor Thadam

Oor Thadam is a community travel guide for discovering well-known destinations and lesser-known places around Villupuram, Tamil Nadu. Travellers can explore place information, directions, photos, and community reviews; local contributors can suggest places and share their experiences. The platform is designed to expand to other districts over time.

The project is open to contributions. See [Contributing](#contributing).

## What it does

- Lets visitors explore approved places and browse paginated listings.
- Provides place details such as descriptions, location, photos, and directions.
- Lets registered contributors submit places and reviews.
- Requires verified email accounts to publish reviews.
- Keeps new contributor submissions pending for administrator review; administrators can approve content.
- Provides account, contributor dashboard, and administrator tools for managing content and users.
- Sends verification and password-reset codes through Brevo when email delivery is configured.
- Uses MongoDB for accounts, places, reviews, moderation, and application data.

## Technology

- Next.js 16 App Router and React 19
- JavaScript, Tailwind CSS, and Framer Motion
- Next.js route handlers for the server API
- MongoDB native driver
- Vercel deployment support

## Project structure

```text
src/
  app/
    (admin)/       Administrator pages
    (auth)/        Sign-in and account pages
    (contribute)/  Place and review contribution pages
    (dashboard)/   Contributor dashboard
    (routes)/      Public site pages
    api/           Server route handlers
  components/      Shared interface components
  lib/             Database, authentication, email, and application helpers
scripts/
  create-admin.mjs   One-time initial administrator setup
  setup-indexes.mjs MongoDB index setup utility
public/              Static assets
```

## Local development

### Requirements

- Node.js compatible with the installed Next.js version
- npm
- MongoDB, either a local instance or a MongoDB Atlas database

### Start the app

1. Clone the repository and enter the project directory.
2. Install packages:

   ```bash
   npm install
   ```

3. Create `.env.local` in the project root and set the required values listed below. `.env.example` is a variable-name template; copy it if useful, then fill in the values you need.
4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

Other useful commands:

```bash
npm run lint
npm run build
npm start
```

`npm start` serves a production build, so run `npm run build` first.

### Environment variables

Keep secrets in `.env.local` for development or in your hosting provider's environment settings. Never commit real credentials. The `.env` files are ignored by Git.

| Variable | Requirement | Why it is used |
| --- | --- | --- |
| `MONGODB_URI` | **Required** | Connects the app to MongoDB. Use a local database for development or a properly secured database for deployment. |
| `JWT_SECRET` | **Required** | Signs authentication tokens. Set a private random value of at least 32 characters; the app fails closed if it is missing or too short. |
| `ADMIN_ACCESS_TOKEN` | Required for administrator sign-in | Additional credential for the separate administrator login flow. |
| `NEXT_PUBLIC_SITE_URL` | Recommended locally; **set in production** | Public site origin used for metadata, canonical URLs, sitemap, and robots output. Use the exact deployed HTTPS origin in production. |
| `BREVO_API_KEY` | Optional for basic local browsing; required for email delivery | Server-side Brevo API key for account verification and password-reset messages. |
| `BREVO_SENDER_EMAIL` | Required when Brevo email is enabled | Verified sender address configured in Brevo. |
| `BREVO_SENDER_NAME` | Optional | Sender display name; defaults to `Oor Thadam`. |
| `EMAIL_OTP_SECRET` | Optional | Dedicated secret for OTP hashing. If omitted, the app uses `JWT_SECRET`. |
| `GOOGLE_MAPS_API_KEY` | Optional | Enables server-side map previews and reverse geocoding. Restrict the key to the APIs and usage your deployment needs. |
| `SUPERADMIN_ID` | Required to grant superadministrator privileges | MongoDB ID of the designated superadministrator account. Set it after creating that account. |
| `INITIAL_ADMIN_USERNAME` | One-time setup only | Username for the initial administrator created by the bootstrap script. |
| `INITIAL_ADMIN_EMAIL` | One-time setup only | Email for the initial administrator. |
| `INITIAL_ADMIN_PASSWORD` | One-time setup only | Initial administrator password; use at least 12 characters. Remove these bootstrap values after setup. |
| `NEXT_PUBLIC_API_BASE_URL` | Optional | Overrides the API base URL; normally same-origin requests are sufficient. |
| `NEXT_PUBLIC_AUTHOR_LINK` | Optional | Link displayed in the site footer. |
| `API_TIMEOUT` | Optional | API client timeout in milliseconds; defaults to `10000`. |
| `TRUSTED_CLIENT_IP_HEADER` | Optional; for self-hosted reverse proxies | Header supplied by a trusted proxy for rate limiting. Configure only when the proxy strips incoming copies and sets the header itself. Vercel uses its forwarded client IP header by default. |

Generate a strong secret locally, for example:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

#### Initial administrator setup

For a database without an administrator, set `MONGODB_URI`, `INITIAL_ADMIN_USERNAME`, `INITIAL_ADMIN_EMAIL`, and `INITIAL_ADMIN_PASSWORD`, then run:

```bash
node scripts/create-admin.mjs
```

Set the created account's ID as `SUPERADMIN_ID`, restart the app, and remove the one-time `INITIAL_ADMIN_*` values. The script refuses to create another administrator when one already exists.

#### MongoDB indexes

The app and rate limiting rely on database indexes. `scripts/setup-indexes.mjs` requires an explicit `INDEX_SETUP_TARGET` and `MONGODB_URI`; remote and production targets have additional opt-in safeguards. Review the script and its safety checks before using it against any shared or production database, and back up important data first.

## Contributing

Contributions are welcome: bug fixes, accessibility and usability improvements, documentation, and accurate local place information are all useful. Open an issue to discuss a larger change, then submit a pull request with a clear description of what changed.

## License

This repository currently has no `LICENSE` file, so no open-source license has been declared. Contributions are welcome, but that statement alone does not grant permission to reuse or redistribute the project. Add a license before publishing it as an openly licensed project.
