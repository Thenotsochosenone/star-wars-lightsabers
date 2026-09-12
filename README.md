# ⚔️ Lightsaber Registry

A wonderfully unnecessary full-stack app for tracking Star Wars characters
and the color of their lightsabers. Built with Node.js, Express, and SQLite.

## Features
- REST API backed by a local SQLite database
- Pre-seeded with a handful of familiar Jedi and Sith
- Tracks lightsaber color *and* hilt type (single-bladed, double-bladed,
  crossguard, curved-hilt, dual-wield)
- Web UI to view, add, remove, search, and sort characters

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
{
  "name": "Anakin Skywalker",
  "lightsaber_color": "Blue",
  "hilt_type": "Single-bladed",
  "affiliation": "Jedi"
}
```

## Populating more characters

The seed data in `db.js` is a small starter set. To pull in more names,
run:

```bash
npm run import
```

This fetches character names from the free [SWAPI](https://www.swapi.tech)
Star Wars API and cross-references them against a small local lightsaber-
color lookup in `scripts/import-characters.js` (SWAPI itself doesn't track
lightsaber colors, since that's fan/reference trivia, not canonical API
data). Only characters with a known color get inserted; everyone else from
SWAPI is skipped. Add more entries to the `LIGHTSABER_COLORS` map in that
file to pull in more characters over time.

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
