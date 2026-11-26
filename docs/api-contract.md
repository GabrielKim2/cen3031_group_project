# API contract (Sprint 1)

The endpoints the React client calls. The TypeScript shapes live in
`client/src/types.ts`; the client calls live in `client/src/api/index.ts`.
Backend and frontend changes to any endpoint should update this file, the
types, and the mock API (`client/src/api/mock.ts`) together.

All paths are under `/api`. Requests and responses are JSON. The backend
returns `id` (not Mongo's `_id`) and never returns password hashes.

## Authentication

Protected endpoints take `Authorization: Bearer <token>`. The token is the
JWT returned by register or login. It expires after `JWT_EXPIRES_IN` (1 day by
default). A protected endpoint returns `401` with `"Please log in first."` when
the header is missing, and `"Your session has expired. Please log in again."`
when the token is invalid, expired, or belongs to a deleted account. Either
way the client should drop the token and send the user to log in.

| Method | Path                    | Body            | Success                  |
| ------ | ----------------------- | --------------- | ------------------------ |
| POST   | `/users/register`       | `RegisterInput` | `201` `AuthResponse`     |
| POST   | `/auth/login`           | `LoginInput`    | `200` `AuthResponse`     |
| GET    | `/auth/me`              | (token)         | `200` `{ "user": User }` |
| GET    | `/users/me/tournaments` | (token)         | `200` `Tournament[]`     |

Registration uses `/users/register` to match Gabe's PBI-2 endpoint (SCRUM-5) and is implemented in `server/`, as is `/auth/me`. The login path is a proposal to confirm with the backend.

`/users/me/tournaments` returns the signed-in user's tournaments: the ones
they organize, plus the ones they're registered for. Sorted by date, soonest
first. Used by the profile page.

Login failures: a wrong email and a wrong password both return `401` with
`"Incorrect email or password."`, so the response never reveals which emails
have accounts. After 5 failed logins for the same email (and IP) within 15
minutes, `/auth/login` returns `429` with `"Too many login attempts. Try again
later."` and a `Retry-After` header giving the seconds until the user can try
again. Further attempts during that time get the same `429`, even with the
right password. A successful login resets the count. Accounts are never
permanently locked. The mock API locks for 60 seconds so the demo is quick.

`RegisterInput`: `displayName` (2–60 chars), `email` (stored lowercased),
`password` (8+ chars and at most 72 bytes, at least one letter and one number),
`role` (`"player"` or `"organizer"`; defaults to `"player"` if omitted).

`AuthResponse`: `{ "token": string, "user": User }`.

`User`: `id`, `displayName`, `email`, `role`, `createdAt` (ISO 8601).

## Tournaments

| Method | Path                                       | Body                            | Success                        |
| ------ | ------------------------------------------ | ------------------------------- | ------------------------------ |
| GET    | `/tournaments`                             | none                            | `200` `Tournament[]`           |
| GET    | `/tournaments/:id`                         | none                            | `200` `Tournament` + `players` |
| POST   | `/tournaments`                             | `CreateTournamentInput`         | `201` `Tournament`             |
| POST   | `/tournaments/:id/registration`            | (token)                         | `201` `Tournament` + `players` |
| DELETE | `/tournaments/:id/registration`            | (token)                         | `200` `Tournament` + `players` |
| POST   | `/tournaments/:id/start`                   | (organizer token)               | `200` `Tournament` + `players` |
| GET    | `/tournaments/:id/rounds/current`          | none                            | `200` `Round`                  |
| POST   | `/tournaments/:id/matches/:matchId/result` | `MatchResult` (organizer token) | `200` `Round`                  |

Creating a tournament requires an organizer token. `organizerId` is set by
the server from the token, not sent by the client.

Registering and dropping act on the signed-in user (from the token), so the
client sends no body. Both return the updated tournament with its roster, so
the page can redraw without a second request. Registration fails with `403` for
the tournament's own organizer and `409` when the player is already
registered, the tournament is full, or its date has passed. Dropping fails with
`409` if the player isn't registered. `playerCount` always equals the length of
`players`. Once a tournament has started, registering and dropping both fail
with `409` `"Registration is closed because the tournament has started."`

Starting a tournament moves its `status` from `"upcoming"` to `"in_progress"`
and closes registration. Only that tournament's organizer can start it (`403`
otherwise). It fails with `409` if it has already started, or if fewer than 2
players are registered. It sends no body and returns the updated tournament.
Starting also pairs round 1 (Swiss pairing, PBI-17), which
`/tournaments/:id/rounds/current` returns.

`/tournaments/:id/rounds/current` returns the current round's pairings and
results. Anyone can read it. It fails with `409` before the tournament starts.

Reporting a result is organizer only (`403` otherwise) and returns the updated
round. Reporting again replaces the result, so organizers can correct
mistakes. It fails with `404` for an unknown match, `409` for a bye (byes are
recorded as a 2–0 win automatically), and `400` for a result that isn't
possible in a best-of-three: each player has at most 2 wins, not both 2, and
1 to 3 games in total.

`MatchResult`: `wins1`, `wins2`, `draws` (games won by player 1, by player 2,
and drawn games).

`Match`: `id`, `table` (1, 2, …), `player1` and `player2` (`{ id, displayName }`;
`player2` is `null` for a bye), `result` (`MatchResult`, or `null` until
reported).

`Round`: `number` (1, 2, …), `matches` (`Match[]`).

`Tournament`: `id`, `name`, `format` (`"Standard"`, `"Modern"`,
`"Commander"`), `date` (`YYYY-MM-DD`), `time`, `venue`, `capacity`,
`playerCount`, `fee`, `description`, `organizerId`, `status` (`"upcoming"`,
`"in_progress"`, `"completed"`; new tournaments start as `"upcoming"`), and on
the detail endpoint `players` (`{ id, displayName }[]`).

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
duplicate (e.g. email), `429` too many login attempts (with `Retry-After`).
