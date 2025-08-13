# High-level Architecture

![Architecture Diagram](img/architecture.png)

## Components
- **Frontend (React on Vercel):** Match Viewer, Timeline, Admin Screens.
- **Backend (Node.js/Express on Azure):** APIs for Match Setup, Live Update, Feed, Display.
- **Firestore:** Matches, Events, Teams/Players, Display State.
- **Firebase Auth:** Roles (admin, commentator, viewer).

## Data Flow (simplified)
1. Admin creates a match (Match Setup API) → Firestore.
2. Events arrive (Live Update API) → Firestore update.
3. Frontend listens to changes (Firestore) or calls Feed API.
4. Display API formats overlays/scoreboards for clients.
