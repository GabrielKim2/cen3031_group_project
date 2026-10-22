# Collected Company

An unofficial Magic: The Gathering tournament platform. CEN3031, Section 10705, Group 2.

## Frontend foundation

React + TypeScript + Vite with responsive navigation and initial layouts: home, tournament search/filtering, event details, login, registration, profile, organizer workspace, and a 404 page.

Pages load data through a single API client (`client/src/api/`). It runs in one of two modes:

- **mock** (default): an in-browser stand-in for the backend with the three sample events in `client/src/data/events.ts`. Register and login work; mock accounts are saved in this browser's `localStorage`, not a database.
- **live**: requests go to the Express backend. Start the frontend with `VITE_API_MODE=live` (and `VITE_API_URL` if the API is not at `/api`).

The endpoints, request/response shapes, and error format are in [docs/api-contract.md](docs/api-contract.md); the shared TypeScript types are in `client/src/types.ts`. Sign-in state lives in `client/src/auth/AuthContext.tsx`: the token is saved in `localStorage`, the session is restored on reload through `GET /auth/me`, and the header shows the signed-in user with a logout button. Tournament registration, pairings, and statistics are not implemented yet.

## Run locally

Requires Node.js 22.12+ and npm. Node 24 is used in CI. From the repository root:

```sh
npm ci
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173).

```sh
npm run check   # TypeScript validation
npm run build   # Production build in client/dist
npm run preview # Local production preview
```

## Structure and routes

- `client/src/types.ts`: shared data types (users, players, tournaments, API inputs and errors).
- `client/src/api/`: API client, endpoint functions, mock backend, and the `useApi` loading hook.
- `client/src/pages/Auth.tsx`: login and registration forms with validation.
- `client/src/auth/AuthContext.tsx`: signed-in user, session restore, and logout (`useAuth()`).
- `client/src/components/`: shared layout and event card.
- `client/src/data/events.ts`: sample tournaments for mock mode.
- `client/src/App.tsx`: route definitions and page layouts.
- `client/src/styles.css`: responsive styles and CSS artwork.
- `client/vite.config.ts`: React tooling and future development API proxy.

Routes: `/`, `/tournaments`, `/tournaments/:id`, `/login`, `/register`, `/profile`, `/organizer`. Unknown paths and event IDs show a not-found page.

## Backend handoff

The intended stack remains MongoDB, Express, React, and Node. No backend or database dependency has been added. Vite proxies `/api` to `http://localhost:3001` during development, so in live mode the backend should listen on port 3001.

To connect the backend, implement the endpoints in `docs/api-contract.md` and run the client with `VITE_API_MODE=live`. Enforce roles and event ownership on the server. Add session handling and logout when authentication exists. Do not commit secrets.

Production hosting requires an SPA fallback to `index.html` for direct client routes, plus a configured API origin or reverse proxy. Vite's development proxy is not included in production assets.

## Contribution scope

This change establishes frontend setup, navigation, responsive initial layouts, type checks, build automation, and run documentation. It does not complete the course authentication/database requirements. Coordinate React work with Lathan and API integration with Gabe and Diya. Record individual contributions based on actual work and review.
