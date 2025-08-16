# High-level Architecture

![Architecture Diagram](img/architecture.png)

##PrimeScore is built with:
- **Client (Frontend)**: React + Tailwind - Handles UI and calls APIs from the backend

- **Server (Backend)**: Node.js + Express - Provides REST APIs for matches, events, and feeds. 
- **Database**: Firestore - For realtime storage

- **Authentication**: Firebase (roles : admin, viewer)

- **Hosting**: Microsoft Azure (backend) + Vercel (Frontend)

- **CI/CD**: Github Actions + Codecov


##Data Flow (with Client–Server)

Admin (client) → calls Backend API → saves match into Firestore

Events (client/admin tools) → hit Live Update API → Firestore updates

Frontend (client) → listens to Firestore changes or queries Feed API

Backend (server) → provides formatted display API → overlays/scoreboards