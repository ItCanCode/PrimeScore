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

# Third-Party Code Documentation

For the live soccer data feature, we integrated **SoccerDataAPI**, a third-party API providing real-time and seasonal soccer match data. This allowed our application to display ongoing matches and key events such as goals, substitutions, and cards.

## API Endpoints Used

- **livescores endpoint** – Provides current live matches across multiple leagues.
- **matches endpoint** – Provides all matches for a league season, which we filtered to show relevant matches in South Africa.

## League Coverage

We focused on four popular leagues for South African users:

- English Premier League (EPL)
- Serie A (Italy)
- La Liga (Spain)
- South African Premier Soccer League (PSL)

## Integration and Challenges

Integrating SoccerDataAPI was non-trivial and required careful handling of:

- **League Selection:** Each league has a unique ID. Our component dynamically sets `League_id` based on the selected league.
- **Data Structure Complexity:** The API returns nested structures (`stage → matches`), requiring `flatMap` and conditional checks to extract match data.
- **Event Mapping:** Each match can have multiple event types (`goal`, `penalty_goal`, `yellow_card`, `red_card`, `substitution`), and our app had to map them to user-readable formats.
- **Date & Time Handling:** The API returns date and time separately in `dd/mm/yyyy` format, which we transform to JavaScript `Date` objects for proper display.
- **Error Handling & Loading States:** Network failures, empty results, or invalid responses were handled gracefully to ensure UI stability.

### Example: Fetching Live Matches

```javascript
const fetchLive = async () => {
  try {
    const response = await fetch(
      `https://api.soccerdataapi.com/livescores/?auth_token=${API_KEY}`
    );
    const data = await response.json();

    const leagueMatches =
      data.results
        .find((league) => league.league_id === League_id)
        ?.stage.flatMap((stage) => stage.matches) || [];

    setMatches(leagueMatches);
  } catch (error) {
    console.error("Error fetching matches:", error);
  }
};
```
