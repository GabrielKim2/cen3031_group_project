# Collected Company

An unofficial Magic: The Gathering tournament platform. CEN3031, Section 10705, Group 2.

## Frontend foundation

React + TypeScript + Vite with responsive navigation and initial layouts: home, tournament search/filtering, event details, login, registration, profile, organizer workspace, and a 404 page.

This is a UI scaffold. The three sample events in `client/src/data/events.ts` are fixtures, not database records. Authentication, authorization, persistence, registration, event creation, pairings, and statistics are not implemented. Unavailable actions are disabled; form drafts are not saved. The profile does not imply an authenticated user.

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

- `client/src/components/`: shared layout and event card.
- `client/src/data/events.ts`: typed sample data.
- `client/src/App.tsx`: route definitions and page layouts.
- `client/src/styles.css`: responsive styles and CSS artwork.
- `client/vite.config.ts`: React tooling and future development API proxy.

Routes: `/`, `/tournaments`, `/tournaments/:id`, `/login`, `/register`, `/profile`, `/organizer`. Unknown paths and event IDs show a not-found page.

## Backend handoff

The intended stack remains MongoDB, Express, React, and Node. No backend or database dependency has been added. Vite proxies `/api` to `http://localhost:3001` during development. This is a proposed backend port to agree with the team; the UI currently makes no API requests.

Next agree user/role and tournament schemas plus API contracts with backend owners. Replace fixtures with backend reads and loading/error states, then wire forms. Enforce roles and event ownership on the server. Add session handling and logout when authentication exists. Do not commit secrets.

Production hosting requires an SPA fallback to `index.html` for direct client routes, plus a configured API origin or reverse proxy. Vite's development proxy is not included in production assets.

## Contribution scope

This change establishes frontend setup, navigation, responsive initial layouts, type checks, build automation, and run documentation. It does not complete the course authentication/database requirements. Coordinate React work with Lathan and API integration with Gabe and Diya. Record individual contributions based on actual work and review.
