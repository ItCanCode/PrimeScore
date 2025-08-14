# API List (Sprint scope)

> Base URL: `https://<your-backend-host>/api`

## Match Setup API
- **POST /matches** — create a match
- **GET /matches/:id** — get match by id
- **PATCH /matches/:id** — edit basic info (venue/time)
- **DELETE /matches/:id** — delete match

## Live Update API
- **POST /matches/:id/events** — add event (goal/card/sub)
- **PATCH /matches/:id/score** — adjust score (admin only)

## Feed API
- **GET /feed/:id** — current state (score, clock, possession)
- **GET /feed/:id/events?limit=50** — recent timeline events

## Display API
- **GET /display/:id/scoreboard** — overlay-ready payload
- **GET /display/:id/ticker** — compact ticker format

### Auth
All write endpoints require Firebase Auth (Bearer token) + role = `admin` or `official`.
