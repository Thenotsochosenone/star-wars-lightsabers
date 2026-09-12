# ⚔️ Lightsaber Registry

A wonderfully unnecessary full-stack app for tracking Star Wars characters
and the color of their lightsabers. Built with Node.js, Express, and SQLite.

## Features
- REST API backed by a local SQLite database
- Pre-seeded with a handful of familiar Jedi and Sith
- Simple web UI to view, add, and remove characters

## Tech stack
- **Backend:** Node.js + Express
- **Database:** SQLite (via `better-sqlite3`)
- **Frontend:** Plain HTML/CSS/JS (no framework)

## Getting started

```bash
npm install
npm start
```

Then open http://localhost:3000 in your browser. The database file
(`lightsabers.db`) is created automatically on first run and seeded
with a few characters.

## API

| Method | Endpoint            | Description           |
|--------|---------------------|------------------------|
| GET    | /api/characters     | List all characters   |
| GET    | /api/characters/:id | Get one character     |
| POST   | /api/characters     | Add a character       |
| PUT    | /api/characters/:id | Update a character    |
| DELETE | /api/characters/:id | Remove a character    |

A `POST`/`PUT` body looks like:

```json
{ "name": "Anakin Skywalker", "lightsaber_color": "Blue", "affiliation": "Jedi" }
```

## Project structure

```
.
├── server.js       # Express app + API routes
├── db.js           # SQLite setup + seed data
├── public/         # Frontend
│   ├── index.html
│   ├── style.css
│   └── script.js
└── lightsabers.db  # created automatically on first run (gitignored)
```

## Notes
This repo was built as a series of small commits (scaffold → database →
API → frontend → docs) — a simple example of how a trivial full-stack
app comes together, if that's ever useful to look back on.
