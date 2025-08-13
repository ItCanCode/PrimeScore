# Current Sprint Backlog (Sprint 2)

## Goal
Deliver a live viewer experience: real-time feed, admin event input, and automated tests.

## Stories (with DoD)
- **Live Match Feed (viewer)**
  - Shows teams, score, clock, and updates without refresh.
  - DoD: At most 1 non-severe bug. Cross-browser check.

- **Admin Event Input**
  - Add goals/cards/substitutions; updates propagate instantly.
  - DoD: Role-restricted, event saved in Firestore, appears in feed.

- **API Tests (Jest + Supertest)**
  - Coverage for create match, add event, get feed.
  - DoD: Stable tests, no flakiness; run in CI.

- **UI Tests (React Testing Library/Cypress)**
  - Form validation, live feed render, auth guard.
  - DoD: Passes on CI; basic happy-path e2e runs.

- **External API integration (if applicable)**
  - Adapter service + error handling + caching.
  - DoD: Toggleable via env var; documented.

## Rituals
- Daily standup, mid-sprint demo, retro notes attached to board.

> See also: [Developer Setup Guide](setup-guide.md)
