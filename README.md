# PulseBoard - Term Project (Mock-First MVC App)

PulseBoard is a dark-themed gaming/community dashboard web app with topic discussions and social-feed interactions.

## Assignment patterns implemented

- **MVC**: route handlers call controllers, controllers call models, models read/write via singleton data access, and views render HTML.
- **Observer**: `post:created` events notify observers that append activity log entries and update per-topic stats.
- **Singleton**: `DatabaseSingleton` provides a single data-access instance used by all models/observers.

## Run locally

```bash
node server.js
```

Visit `http://localhost:3000`.

## Demo credentials

- username: `demo`
- password: `demo123`

## Main routes

- `GET /`
- `GET /auth/login`, `POST /auth/login`
- `GET /auth/register`, `POST /auth/register`
- `POST /auth/logout`
- `GET /dashboard`
- `GET /topics/explore`
- `GET /topics/my`
- `GET /topics/:topicId`
- `POST /topics` (create topic)
- `POST /topics/:topicId/subscribe`
- `POST /topics/:topicId/unsubscribe`
- `POST /posts`
- `GET /stats`
- `GET /api/topics/stats`
- `GET /api/users/me`

## Project structure

- `server.js`: custom HTTP server, middleware-lite request/session wiring
- `routes/index.js`: route table + auth flags
- `controllers/`: request orchestration logic
- `models/`: domain/data operations
- `views/`: HTML rendering functions
- `services/observers/`: Subject + Observer classes
- `config/databaseSingleton.js`: singleton data access abstraction
- `data/mockData.js`: seeded mock entities
- `public/`: CSS + JS frontend assets
