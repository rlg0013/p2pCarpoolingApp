# CampusPool Bangalore

A peer-to-peer carpooling web-app prototype for college students in Bangalore. It uses a Go backend API and a React frontend served as static files, with the data layer currently in memory so the project runs immediately for demos.

## Current Prototype Features

- College-only ride discovery for Bangalore routes.
- Student verification signals, trust score, ratings, and college ID requirement.
- Ride search by route, college, pickup point, or tag.
- Women-only ride filtering and posting.
- Offer-a-ride form with seats, fare, vehicle, pickup, and meeting point.
- Seat request flow that updates availability through the Go API.
- Safety concept screen for live trip sharing, SOS, reporting, and trusted contacts.
- Dashboard stats for active rides, seats, verified drivers, and estimated CO2 saved.

## Recommended Full Project Scope

- Authentication with college email OTP and student ID verification.
- MongoDB persistence for students, rides, bookings, vehicles, reviews, reports, and campuses.
- Route matching using pickup radius, college destination, travel time, and recurring schedules.
- Booking lifecycle: requested, accepted, rejected, cancelled, completed, no-show.
- In-app chat after a request is accepted.
- UPI payment handoff or split-fare tracking.
- Emergency contact sharing, campus security shortcut, and post-ride incident reporting.
- Admin dashboard for colleges to review reports, blocked users, and ride patterns.

## Architecture

```text
web/                 React prototype UI served by Go
cmd/server/          Go application entry point
internal/api/        JSON API, seeded data, booking logic
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
- `GET /api/rides`
- `POST /api/rides`
- `POST /api/bookings`
- `GET /api/stats`

## Note

The frontend uses React from CDN because the local `npm` command is broken in this environment. When `npm` is fixed, the next step is to move `web/` into a Vite React app and keep the Go backend as the API service.
