# Collected Company

An unofficial Magic: The Gathering tournament platform. CEN3031, Section 10705, Group 2.

## Frontend foundation

React + TypeScript + Vite with responsive navigation and initial layouts: home, tournament search/filtering, event details, login, registration, profile, organizer workspace, and a 404 page.

Pages load data through a single API client (`client/src/api/`). It runs in one of two modes:

- **mock** (default): an in-browser stand-in for the backend with the three sample events in `client/src/data/events.ts`. Register and login work; mock accounts are saved in this browser's `localStorage`, not a database.
- **live**: requests go to the Express backend. Copy `client/.env.example` to `client/.env.local` (it sets `VITE_API_MODE=live`), start the backend on port 3001, then run `npm run dev`.

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

The intended stack remains MongoDB, Express, React, and Node. The backend lives in `server/` (see below). Vite proxies `/api` to `http://localhost:3001` during development, so in live mode the backend should listen on port 3001.

To connect the backend, implement the endpoints in `docs/api-contract.md` and run the client with `VITE_API_MODE=live`. Enforce roles and event ownership on the server. Add session handling and logout when authentication exists. Do not commit secrets.

## Backend (`server/`)

Express 5 + Mongoose, plain JavaScript (ES modules). Implemented so far: `GET /api/health` and `POST /api/users/register` (PBI-2). Login and `GET /api/auth/me` are next.

To run it you need a MongoDB to connect to (a local install or a MongoDB Atlas connection string):

```sh
cp server/.env.example server/.env   # then set MONGODB_URI and JWT_SECRET
npm run dev:server                   # http://localhost:3001, restarts on file changes
npm run test:server                  # no database or .env needed
```

The server tests start a throwaway in-memory MongoDB (`mongodb-memory-server`). The first run downloads a MongoDB binary, which takes a few minutes; later runs reuse it.

Layout: `src/routes` map URLs to `src/controllers`, which validate input (`src/validation`) and call `src/services` for the business rules. `src/models` holds the Mongoose schemas, and `src/middleware/errorHandler.js` turns every error into the contract's error body. `src/app.js` builds the app; `src/server.js` connects to MongoDB and starts listening.

Production hosting requires an SPA fallback to `index.html` for direct client routes, plus a configured API origin or reverse proxy. Vite's development proxy is not included in production assets.

## Contribution scope

This change establishes frontend setup, navigation, responsive initial layouts, type checks, build automation, and run documentation. It does not complete the course authentication/database requirements. Coordinate React work with Lathan and API integration with Gabe and Diya. Record individual contributions based on actual work and review.
