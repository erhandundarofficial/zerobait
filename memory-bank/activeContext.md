# Zerobait – Active Context

## Current Focus
- Initialize the Zerobait project structure and Memory Bank.
- Decide and document the core architecture, stack, and workflows.
- Prepare for implementation of Phase 0 tasks.

## Recent Decisions
- Project name: **Zerobait**.
- Target audience: General public (B2C), with special care for kids, older people, and non-technical users.
- Frontend: React SPA with Tailwind CSS, inspired by the provided phishing scanner and educational dashboard designs.
- Backend: Node.js + Express, REST API.
- Database: PostgreSQL with Prisma ORM.
- Auth: Google Single Sign-On (OAuth 2.0).
- Infrastructure: Docker for local development; free-tier-friendly hosting for frontend, backend, and Postgres.
- Detection approach: Rule-based + community reports (no paid APIs).
- Language/tone: Casual, friendly, gamified, simple; prepared for future multi-language support.

## Next Steps (Short-Term)
- Phase 0 implementation:
  - Create project folders (`frontend`, `backend`, `memory-bank`).
  - Initialize frontend React app with Tailwind and apply base layout similar to provided HTML designs.
  - Initialize backend Express app with basic health check endpoint.
  - Set up Docker Compose for PostgreSQL and basic backend connectivity.
  - Initialize Prisma schema with foundational models (User, Url, UrlReport, Game, GameSession, UserScore or similar).

## Important Patterns & Preferences
- Maintain a clear separation between API routes, business logic, and data layer.
- Keep the UI accessible and readable for non-technical users (legible fonts, high contrast, clear CTAs).
- Favor simple, explainable detection logic over opaque, complex models in early phases.

## Open Questions / Future Considerations
- Exact scoring formula for games (per-game weighting, streak bonuses, etc.).
- Detailed game specifications (exact question sets, difficulty tiers, and progression).
- Leaderboard extensions (per-country, friends-only, seasonal resets).
- Internationalization framework and first additional languages beyond English.
