# GYMFLOW — Gym Slot Booking System

A full-stack web application for booking gym slots, handling waitlists, and managing turnstile check-ins.

- **Live Deployed Application**: [https://gymflow-htdo.onrender.com](https://gymflow-htdo.onrender.com)
- **GitHub Repository**: [https://github.com/pra27-06/gym](https://github.com/pra27-06/gym)

---

## Design Note: Stack & Data Model (Max 10 lines)
Built with Node.js, Express, better-sqlite3, and vanilla HTML/CSS/JavaScript with zero heavy frameworks.
The relational SQLite schema comprises four core tables: `users`, `sessions`, `bookings`, and `waitlist_entries`.
`users` stores member and admin credentials with bcrypt password hashes and role constraints.
`sessions` enforces 1-hour durations, a fixed 20-seat capacity, and uniqueness on `(session_date, start_hour)`.
`bookings` links members to sessions with unique cryptographically random 6-character check-in codes.
`waitlist_entries` tracks queues using `created_at` timestamps to ensure first-in, first-out (FIFO) order.
All booking insertions, cancellations, and promotions run inside SQLite transactions to eliminate race conditions.
The frontend is a single-page app with protected client-side routes, optimistic UI, polling, and 360px responsiveness.

---

## Assumptions
1. **Waitlist Expiration**: If a session starts, waitlisted members who were not promoted remain on record but cannot be promoted, as promotions and bookings are barred once a session start time has passed.
2. **Gym Timezone**: All session dates and start hours represent the gym's local operational timezone.
3. **Check-in Codes**: Codes are 6-character uppercase hexadecimal strings (e.g., `7XKP2Q`) generated cryptographically to prevent guessing.
4. **Waitlist Re-entry**: A member who leaves a waitlist can re-join later at the back of the queue, but cannot hold duplicate entries simultaneously.
5. **Admin Scope**: Admins cannot be created via user registration; they are seeded or created directly in the database.

---

## Test Credentials
The database comes pre-seeded with test users and sessions (including one completely full session):
- **Admin Account**: `admin@gym.com` / `password123`
- **Member 1**: `alice@gym.com` / `password123`
- **Member 2**: `bob@gym.com` / `password123`

---

## Quickstart & Local Setup Instructions

### 1. Requirements
- Node.js (v18 or higher recommended)
- npm

### 2. Installation
```bash
# Clone the repository and enter the directory
git clone https://github.com/pra27-06/gym.git
cd gym

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env
```

### 3. Environment Variables (.env)
```env
PORT=3000
JWT_SECRET=supersecretgymkey123
DB_PATH=./gym.db
```

### 4. Seed Database
```bash
# Populates admin, members, sessions, and one session with 20 confirmed bookings
node src/seed.js
```

### 5. Run the Server
```bash
npm start
# or: node server.js
```
The application will be live at `http://localhost:3000`.

---

## Running Automated Test Suites
Run all automated test suites covering constraints, auth, concurrency, waitlists, and UI:
```bash
# Run all tests
npm test
```
Or run individually:
- `node test/db-test.js` — Database schema & constraint tests
- `node test/auth-test.js` — Registration, login, and authorization middleware tests
- `node test/sessions-booking-test.js` — Booking limit, duplicate slot, and waitlist promotion tests
- `node test/checkin-test.js` — Check-in code validity and 1-hour window tests
- `node test/frontend-test.js` — Frontend file serving and routing tests
- `node test/e2e-test.js` — Full user journey & concurrency stress test (simultaneous bookings)
- `node test/live-test.js` — Live production deployment API verification suite

---

## Production Deployment
Configured via `render.yaml` for zero-configuration deployment on Render:
- **Build Command**: `npm install`
- **Start Command**: `npm run seed && npm start`
- **Database Persistence Note**: On Render's free tier, filesystem storage persists while the service is active. If spun down due to 15 minutes of inactivity, the start command uses our idempotent seed check (`src/seed.js`) to guarantee the database always boots cleanly with required test accounts and the full 20/20 session.
