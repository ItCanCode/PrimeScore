# PrimeScore ⚽🔥

> A real-time sports broadcasting and viewer experience tool built with **React**, **Express.js**, and **Firebase**.  
> Developed by the **ItCanCode** organization as part of the 2.7 Project 6 deliverable.

## 📸 Overview

**PrimeScore** allows users to follow live sports games with up-to-date scores, animated event timelines, and a full match setup system for organizers. Whether you're a fan, commentator, or admin, PrimeScore keeps the match accessible, interactive, and organized.

## 🚀 Features

### 🎮 Match Viewer
- Displays current **score**, **game clock**, **possession**, and **key events** (goals, fouls, etc.).
- Visual data accessible for fans, commentators, or organizers.

### 🕒 Event Feed
- Live timeline of **in-game events** with timestamps and details.
- Animates key actions like **substitutions**, **yellow/red cards**, etc.

### 🛠 Match Setup
- Manually create and manage **matches**, **teams**, and **expected schedules**.
- Assign teams, players, venues, and match times.

### ✍️ Live Input
- Manually input match **events** and **score changes**.
- Supports **pause/resume**, **timeline edits**, and **corrections**.

---

## 🧩 Architecture

### Frontend: **React**
- Responsive user interface
- Live match updates and interactions
- Components: `LiveScoreboard`, `EventTimeline`, `SetupScreen`, `ManualInputPanel`

### Backend: **Express.js (Node.js)**
- Handles API requests and routing
- Integrates Firebase Admin SDK for real-time database actions
- Modularized APIs:
  - `/live-update` – Receive & store stat events
  - `/feed` – Return match display data
  - `/match` – Create/update match meta info
  - `/display` – Serve structured game state to frontend clients
## 🔧 Getting Started

### Prerequisites
- Node.js v18+
- Firebase project & credentials
- Git

### Clone the repo
```bash
git clone https://github.com/ItCanCode/PrimeScore.git
cd PrimeScore
