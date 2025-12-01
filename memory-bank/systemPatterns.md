# Zerobait – System Patterns

## High-Level Architecture
- **Frontend:**
  - React single-page application (SPA) using Tailwind CSS.
  - Consumes a RESTful API from the backend.
  - Handles routing for:
    - Home / URL Scanner
    - Games / Courses
    - Leaderboard
    - Profile / Progress
    - Authentication callbacks (Google SSO flow completion where needed).

- **Backend:**
  - Node.js with Express.
  - REST API endpoints for:
    - Authentication (Google OAuth 2.0 login, logout, callback).
    - URL scanning and result retrieval.
    - Community URL reports.
    - Games metadata (list of games, descriptions, difficulty).
    - Game sessions and answer submissions.
    - User scores and progress.
    - Leaderboard queries.
  - Business logic layer encapsulating URL analysis, scoring rules, and report aggregation.

- **Database:**
  - PostgreSQL as the primary data store.
  - ORM/Query Layer: Prisma or similar (to be finalized during implementation, default assumption: Prisma).

- **Infrastructure:**
  - Local development using Docker (e.g., Docker Compose) to run PostgreSQL and potentially the backend.
  - Deployment to a free-tier-friendly platform for:
    - Backend API service.
    - Frontend static site or SPA hosting.
    - PostgreSQL database (using a free tier, if available).

## Key Domain Concepts
- **User**
  - Authentication via Google SSO.
  - Profile with display name, avatar URL (from Google), country/locale when available.
  - Aggregated score and progress statistics.

- **URL Scan**
  - Input URL is normalized and parsed.
  - System applies rules/heuristics (e.g., suspicious TLDs, known patterns) and community-report signals.
  - Result categories: SAFE, WARNING, COMMUNITY_REPORTED, UNKNOWN.
  - Store scan history and link to user (if logged in) or anonymous ID.

- **URL Report**
  - User-submitted flag on a URL as suspicious/phishing.
  - Aggregated per URL, with counts and basic reputation score.

- **Game**
  - Metadata describing game type (quiz, scenario-based, multiple-choice, etc.).
  - Content such as questions, choices, explanations.

- **Game Session & Score**
  - Each playthrough is recorded as a session.
  - Correct answers and completion yield points based on difficulty.
  - Aggregate score per user drives leaderboard rank.

- **Leaderboard**
  - Global ranking based on total score (and possibly tie-breakers like completion rate or recent activity).

## Core Design Patterns
- **API Layering:**
  - Route handlers → service layer (business logic) → data access layer (ORM).
- **DTO / Response Normalization:**
  - Consistent API responses with a shared envelope (e.g., `{ data, error }`).
- **Auth Middleware:**
  - Express middleware to verify sessions/JWT for protected routes (e.g., game submissions, reporting URLs) while allowing public access for scanning.
- **Configuration via Environment Variables:**
  - OAuth client IDs/secrets.
  - Database connection URLs.
  - Runtime flags (e.g., enable/disable external threat-intel integration).

## URL Detection Approach (MVP)
- **Rule-Based + Community Signals (No Paid APIs):**
  - Basic heuristics on URL, host, path (e.g., presence of suspicious keywords, long subdomains, mismatched domain text vs. TLD).
  - Check against a locally stored list of known bad/flagged domains (populated from community reports and potential open-source lists if used).
  - Community report count thresholds for escalating from UNKNOWN to COMMUNITY_REPORTED to WARNING.

- **Extensibility for Future:**
  - Design the service layer so more advanced ML models or external scanning APIs can be plugged in later without breaking the frontend.

## Security Considerations (Initial)
- Sanitize and normalize all URL input before storing or evaluating.
- Avoid rendering untrusted HTML from remote content.
- Protect authenticated endpoints with session/JWT verification.
- Rate-limit endpoints that could be abused (e.g., report submissions, scan requests).

## Important Implementation Paths
1. **Auth Flow:**
   - Frontend initiates Google login → backend handles OAuth callback → creates/updates user in DB → issues session/JWT → frontend stores session state.

2. **Scan Flow:**
   - Frontend sends URL to `/api/scan` → backend normalizes and analyzes → reads community reports and heuristics → returns result + explanation → frontend renders card similar to the provided design examples.

3. **Game Flow:**
   - Frontend fetches game list → user chooses game → frontend fetches content → user plays through questions → submits answers to backend → backend calculates score and updates user totals → frontend updates progress UI and leaderboard position.

4. **Leaderboard Flow:**
   - Frontend queries `/api/leaderboard` → backend returns top-ranked users (and possibly current user rank) → frontend displays results in a simple, accessible list.
