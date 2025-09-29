# Third-Party Code Documentation

This project uses multiple third-party **frameworks, libraries, developer tools, and external APIs**. These components were carefully selected to accelerate development, ensure reliability, and support real-time sports data integration. Below is the documentation and justification for each.

---

## Frameworks & Libraries

### Backend

1. **Express.js (v5.1.0)**

   - **Purpose:** Web framework for building RESTful APIs.
   - **Why Used:** Handles routing, middleware, and HTTP request/response handling.
   - **Challenges:** Migration from Express 4 to 5 required adapting middleware.

2. **Cloudinary (v2.7.0)**

   - **Purpose:** Cloud storage for media uploads.
   - **Why Used:** Stores match-related images (logos, banners) with fast delivery.
   - **Challenges:** Authentication via API key and secure URL handling.

3. **CORS (v2.8.5)**

   - **Purpose:** Cross-Origin Resource Sharing middleware.
   - **Why Used:** Allows the frontend (React) to interact with backend APIs securely.
   - **Challenges:** Configuring allowed origins without overexposing endpoints.

4. **Dotenv (v17.2.2)**

   - **Purpose:** Loads environment variables.
   - **Why Used:** Secures API keys (Firebase, SoccerDataAPI, Rugby API).
   - **Challenges:** Ensuring `.env` files are excluded from Git.

5. **Firebase-Admin (v13.4.0)**

   - **Purpose:** Server-side SDK for Firebase Auth & Firestore.
   - **Why Used:** Validates tokens and enforces role-based access (`admin`, `official`, `resident`).
   - **Challenges:** Token verification in middleware and syncing with client Firebase SDK.

6. **Multer (v2.0.2)**
   - **Purpose:** Middleware for file uploads.
   - **Why Used:** Handles user uploads (team logos, documents).
   - **Challenges:** Managing file storage before pushing to Cloudinary.

---

### Frontend

1. **React (v19.1.0)**

   - **Purpose:** Frontend library for building UI.
   - **Why Used:** Dynamic rendering of live match data and dashboards.
   - **Challenges:** State management for live data feeds.

2. **React-DOM (v19.1.0)**

   - **Purpose:** Entry point to render React components to the DOM.
   - **Why Used:** Integrates React with the browser environment.

3. **React-Router-DOM (v7.8.0)**

   - **Purpose:** Client-side routing library.
   - **Why Used:** Provides navigation between dashboard, match view, and admin pages.
   - **Challenges:** Protecting routes with Firebase authentication.

4. **Lucide-React (v0.541.0)**

   - **Purpose:** Icon set for React.
   - **Why Used:** Modern, lightweight icons for sports dashboards.

5. **React-Icons (v5.5.0)**

   - **Purpose:** Collection of icons (FontAwesome, Material, etc.).
   - **Why Used:** Complements Lucide for extra UI elements.

6. **Firebase (v12.1.0)**
   - **Purpose:** Client SDK for Firebase Auth & Firestore.
   - **Why Used:** Handles login, token issuance, and Firestore reads/writes.
   - **Challenges:** Token sync with backend `firebase-admin`.

---

## Testing & Developer Tools

1. **Jest (v30.0.5)**

   - **Purpose:** Testing framework.
   - **Why Used:** Unit, integration, and coverage tests.
   - **Challenges:** Configuring with Babel and ES Modules.

2. **Supertest (v7.1.4)**

   - **Purpose:** HTTP assertions for Express apps.
   - **Why Used:** Automated API endpoint testing.
   - **Challenges:** Requires mocking Firebase authentication for protected routes.

3. **Nodemon (v3.1.10)**

   - **Purpose:** Auto-restarts Node.js server.
   - **Why Used:** Speeds up development cycles.

4. **Babel (core v7.28.3, preset-env v7.28.3, babel-jest v30.0.5)**

   - **Purpose:** Transpiler to make ES6+ syntax compatible with Jest/Node.

5. **ESLint (v9.30.1 + plugins)**

   - **Purpose:** Enforces coding standards.
   - **Plugins Used:**
     - `eslint-plugin-react-hooks` (v5.2.0)
     - `eslint-plugin-react-refresh` (v0.4.20)
   - **Why Used:** Ensures maintainable and consistent code quality.

6. **Vite (v6.3.5)**

   - **Purpose:** Frontend bundler and dev server.
   - **Why Used:** Fast HMR (Hot Module Replacement) for React app.

7. **Rollup (v4.46.2)**

   - **Purpose:** Bundler used internally by Vite.

8. **Codecov Vite Plugin (v1.9.1)**
   - **Purpose:** Coverage reporting.

---

## Third-Party APIs

### 1. **SoccerDataAPI**

- **Purpose:** Real-time and seasonal soccer data.
- **Endpoints Used:**
  - `livescores` (live matches).
  - `matches` (season fixtures).
- **Coverage:** EPL, La Liga, Serie A, PSL.
- **Challenges:** Nested JSON, league ID mapping, date/time parsing.

### 2. **ScoreDataAPI (Rugby)**

- **Purpose:** Real-time rugby match data.
- **Endpoints Used:**
  - `competitions`, `matches`, `livescores`.
- **Coverage:** Rugby World Cup, Rugby Championship, URC, Currie Cup.
- **Challenges:** Mapping rugby-specific events (`try`, `conversion`) to UI.

---

## Summary

The use of these **frameworks, libraries, developer tools, and APIs** allowed us to:

- Build a scalable **backend (Express, Firebase-Admin)** and **frontend (React, Vite)**.
- Implement **authentication and role-based access** securely.
- Provide **real-time sports data (soccer & rugby)** via trusted APIs.
- Maintain **code quality and reliability** through testing and linting tools.
- Deliver a polished **user experience with icons and fast builds**.
