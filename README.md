# CampusPool Bangalore

A peer-to-peer carpooling web-app prototype for college students in Bangalore. It uses a Go backend API and a React frontend served as static files, with the data layer currently in memory so the project runs immediately for demos.

## Current Prototype Features

- College email signup with an allowlist such as `@sit.ac.in`, `@rvce.edu.in`, `@pes.edu`, and more.
- Student ID verification and driver's license verification with trust score updates.
- Driver gating: only verified drivers can publish rides.
- Route-overlap matching using route points, not only exact source/destination text.
- Regular rides with recurring day schedules.
- Gender preference filtering for women-only rides.
- College hubs for popular PG, hostel, metro, and campus pickup zones.
- Ride request, accept, reject, and waitlist flows.
- In-app chat with phone-number sharing blocked before confirmation.
- Live trip start, location updates, trusted-contact sharing, and SOS events.
- Auto fare calculator based on distance, fuel cost, seat split, and platform fee.
- UPI deep-link generation and pay-later eligibility through trust score.
- Two-way ratings for drivers and passengers.
- Ride history with request and trip timestamps.
- Notification feed for ride matches, requests, payments, safety, waitlists, and carbon.
- Carbon savings tracker with monthly totals and badge progress.

## Next Production Steps

- Replace in-memory storage with MongoDB collections for students, rides, requests, chats, trips, payments, ratings, notifications, hubs, and waitlists.
- Add OTP delivery for college email verification.
- Replace simulated document approval with an admin review queue and file storage.
- Add a real maps provider for route geometry, pickup radius, ETA, and live location.
- Add real push notifications through Firebase Cloud Messaging or web push.
- Add real UPI app handoff and payment status reconciliation where possible.

## Architecture

```text
web/                 React prototype UI served by Go
cmd/server/          Go application entry point
internal/api/        JSON API, domain models, seeded data, tests
```

Suggested production architecture:

```text
React + Vite frontend
Go REST API
MongoDB Atlas
JWT auth
Google Maps / Mapbox route APIs
Cloudinary or S3 for ID upload evidence
```

## Run Locally

```powershell
go run ./cmd/server
```

Open `http://localhost:8080`.

## API

- `GET /api/health`
- `POST /api/auth/signup`
- `GET /api/students`
- `POST /api/verifications/student-id`
- `POST /api/verifications/license`
- `GET /api/hubs`
- `GET /api/rides`
- `POST /api/rides`
- `POST /api/matches`
- `GET /api/ride-requests`
- `POST /api/ride-requests`
- `POST /api/ride-requests/{id}/accept`
- `POST /api/ride-requests/{id}/reject`
- `GET /api/chat`
- `POST /api/chat`
- `POST /api/trips/start`
- `POST /api/trips/{id}/location`
- `POST /api/trips/{id}/sos`
- `POST /api/trips/{id}/complete`
- `POST /api/payments/calculate`
- `POST /api/payments`
- `POST /api/ratings`
- `GET /api/history`
- `GET /api/notifications`
- `GET /api/waitlists`
- `POST /api/waitlists`
- `GET /api/carbon`
- `GET /api/stats`

## Test

```powershell
go test ./...
```

## Note

The frontend uses React from CDN because the local `npm` command is broken in this environment. When `npm` is fixed, the next step is to move `web/` into a Vite React app and keep the Go backend as the API service.
