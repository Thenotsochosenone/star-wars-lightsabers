# ⚔️ Lightsaber Registry

A wonderfully unnecessary full-stack app for tracking Star Wars characters and the color of their lightsabers (canon **and** legends). Built with Node.js, Express, and SQLite.

## Features

- REST API backed by a local SQLite database
- Pre-seeded with 50+ familiar Jedi, Sith, Mandalorians and legends characters
- Search + filter by name, color, affiliation, era (canon/legends), and blade type
- Add, edit, and remove characters from a simple web UI
- Extra fields: `era`, `blade_type`, `notes`
- Color-aware glowing swatches (including Darksaber, crossguard, bronze, etc.)
- Optional SWAPI import to pull in more names that match the local color map

## Tech stack

- **Backend:** Node.js + Express
- **Database:** SQLite (via better-sqlite3)
- **Frontend:** Plain HTML/CSS/JS (no framework)

## Getting started

```bash
npm install
npm start
```

Then open http://localhost:3000. The database file (`lightsabers.db`) is created automatically on first run and seeded with a solid starter set.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/characters | List characters (supports query params) |
| GET    | /api/characters/:id | Get one character |
| POST   | /api/characters | Add a character |
| PUT    | /api/characters/:id | Update a character |
| DELETE | /api/characters/:id | Remove a character |
| GET    | /api/stats | Simple counts by color & era |

### Query parameters for `GET /api/characters`

- `q` – free-text search (name, color, notes)
- `color` – partial match on lightsaber color
- `affiliation` – partial match
- `era` – exact (`canon` or `legends`)
- `blade_type` – exact (`single`, `double`, `dual`, `crossguard`, `curved`)

### Example body for POST / PUT

```json
{
  "name": "Ahsoka Tano",
  "lightsaber_color": "White",
  "affiliation": "Ex-Jedi",
  "era": "canon",
  "blade_type": "dual",
  "notes": "Green → Blue → White (purified crystals)"
}
```

## Populating more characters

The seed data in `db.js` is a solid starter set. To pull additional names from SWAPI that match the local lookup:

```bash
npm run import
```

This fetches character names from the free [SWAPI](https://www.swapi.tech) and cross-references them against the `LIGHTSABER_COLORS` map in `scripts/import-characters.js`. Only characters with a known color get inserted. Add more entries to that map to grow the registry over time.

## Project structure

```
.
├── server.js                 # Express app + API routes
├── db.js                     # SQLite setup + rich seed data
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── scripts/
│   └── import-characters.js  # SWAPI importer + color map
└── lightsabers.db            # created on first run (gitignored)
```

## Notes

This repo was built as a series of small commits (scaffold → database → API → frontend → docs → richer model + search/edit). Still a fun side project — idea is to keep growing a useful repository of lightsaber-wielding characters across canon and legends.
