# Zerobait – Tech Context

## Stack Overview
- **Frontend:**
  - React (SPA)
  - Tailwind CSS (including dark mode) for styling.
  - React Router (or similar) for client-side routing.

- **Backend:**
  - Node.js (LTS)
  - Express for HTTP server and routing.
  - Passport.js (or similar) with Google OAuth 2.0 for SSO.

- **Database & ORM:**
  - PostgreSQL as the main relational database.
  - Prisma ORM (assumed) for schema management and type-safe queries.

- **Infrastructure & Tooling:**
  - Docker / Docker Compose for local development (PostgreSQL, optional backend container).
  - Environment variables for secrets and configuration.
  - Free-tier-friendly hosting:
    - Frontend: static hosting (e.g., Netlify/Vercel free tier) or part of a Node-hosted app.
    - Backend: Node hosting on a free-tier platform (e.g., Render/Railway) with a free Postgres instance where possible.

## Development Setup (Planned)
- **Node & Package Manager:**
  - Node.js LTS.
  - npm (default; can be revisited) for dependency management.

- **Frontend Dev:**
  - Vite or Create React App (preferred: Vite for speed) to bootstrap React project.
  - Tailwind set up with the color palette from the design examples:
    - `primary: #2bee6c`
    - `background-light: #f6f8f6`
    - `background-dark: #102216`
  - Use Google Fonts (Inter) and Material Symbols as in the provided HTML.

- **Backend Dev:**
  - Express app with a modular structure:
    - `routes/` for API endpoints.
    - `services/` for business logic.
    - `prisma/` for schema and migrations.
    - `config/` for env and app configuration.

- **Database Dev:**
  - Local PostgreSQL via Docker Compose.
  - Prisma migrations for schema evolution.

## Technical Constraints
- No paid services for the core functionality; only free/open-source components and free tiers.
- Authentication must be Google SSO (no local password store initially).
- Database must be PostgreSQL.

## Dependencies (Initial, High-Level)
- Frontend:
  - `react`, `react-dom`
  - `react-router-dom`
  - `tailwindcss`, `postcss`, `autoprefixer`

- Backend:
  - `express`
  - `cors`
  - `dotenv`
  - `passport`, `passport-google-oauth20`
  - `cookie-session` or `express-session` (for session-based auth) or JWT stack (to be finalized).

- Shared / Tooling:
  - `prisma`, `@prisma/client`
  - `typescript` (if we decide to use TS; recommended), plus build tooling.

## Tool Usage Patterns
- Use environment variables to control OAuth credentials, DB URLs, and deployment-specific settings.
- Keep frontend and backend in a single monorepo for easier coordination (e.g., `/frontend`, `/backend`, `/memory-bank`).
- Use Docker Compose to spin up Postgres and optionally the backend in one command during development.
