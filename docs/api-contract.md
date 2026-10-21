# API contract (Sprint 1)

The endpoints the React client calls. The TypeScript shapes live in
`client/src/types.ts`; the client calls live in `client/src/api/index.ts`.
Backend and frontend changes to any endpoint should update this file, the
types, and the mock API (`client/src/api/mock.ts`) together.

All paths are under `/api`. Requests and responses are JSON. The backend
returns `id` (not Mongo's `_id`) and never returns password hashes.

## Authentication

Protected endpoints take `Authorization: Bearer <token>`. The token is the
JWT returned by register or login.

| Method | Path             | Body            | Success                  |
| ------ | ---------------- | --------------- | ------------------------ |
| POST   | `/auth/register` | `RegisterInput` | `201` `AuthResponse`     |
| POST   | `/auth/login`    | `LoginInput`    | `200` `AuthResponse`     |
| GET    | `/auth/me`       | (token)         | `200` `{ "user": User }` |

`RegisterInput`: `displayName` (2–60 chars), `email`, `password` (8+ chars,
at least one letter and one number), `role` (`"player"` or `"organizer"`).

`AuthResponse`: `{ "token": string, "user": User }`.

`User`: `id`, `displayName`, `email`, `role`, `createdAt` (ISO 8601).

## Tournaments

| Method | Path               | Body                    | Success                        |
| ------ | ------------------ | ----------------------- | ------------------------------ |
| GET    | `/tournaments`     | none                    | `200` `Tournament[]`           |
| GET    | `/tournaments/:id` | none                    | `200` `Tournament` + `players` |
| POST   | `/tournaments`     | `CreateTournamentInput` | `201` `Tournament`             |

Creating a tournament requires an organizer token. `organizerId` is set by
the server from the token, not sent by the client.

`Tournament`: `id`, `name`, `format` (`"Standard"`, `"Modern"`,
`"Commander"`), `date` (`YYYY-MM-DD`), `time`, `venue`, `capacity`,
`playerCount`, `fee`, `description`, `organizerId`, and on the detail
endpoint `players` (`{ id, displayName }[]`).

## Errors

Any non-2xx response uses this body:

```json
{
  "error": {
    "message": "That email is already registered.",
    "fields": { "email": "That email is already registered." }
  }
}
```

`fields` is optional and maps input names to messages, so forms can show the
error next to the right input. Status codes: `400` invalid input, `401` not
logged in or wrong credentials, `403` wrong role, `404` not found, `409`
duplicate (e.g. email).
