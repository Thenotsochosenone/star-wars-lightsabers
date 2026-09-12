const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'lightsabers.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    lightsaber_color TEXT NOT NULL,
    affiliation TEXT,
    hilt_type TEXT
  )
`);

// Migration for databases created before hilt_type existed.
const columns = db.prepare('PRAGMA table_info(characters)').all();
const hasHiltType = columns.some((col) => col.name === 'hilt_type');
if (!hasHiltType) {
  db.exec('ALTER TABLE characters ADD COLUMN hilt_type TEXT');
}

const seedData = [
  { name: 'Luke Skywalker', lightsaber_color: 'Green', affiliation: 'Jedi', hilt_type: 'Single-bladed' },
  { name: 'Darth Vader', lightsaber_color: 'Red', affiliation: 'Sith', hilt_type: 'Single-bladed' },
  { name: 'Obi-Wan Kenobi', lightsaber_color: 'Blue', affiliation: 'Jedi', hilt_type: 'Single-bladed' },
  { name: 'Mace Windu', lightsaber_color: 'Purple', affiliation: 'Jedi', hilt_type: 'Single-bladed' },
  { name: 'Yoda', lightsaber_color: 'Green', affiliation: 'Jedi', hilt_type: 'Single-bladed (shoto)' },
  { name: 'Darth Maul', lightsaber_color: 'Red', affiliation: 'Sith', hilt_type: 'Double-bladed' },
  { name: 'Rey', lightsaber_color: 'Yellow', affiliation: 'Jedi', hilt_type: 'Single-bladed' },
  { name: 'Kylo Ren', lightsaber_color: 'Red', affiliation: 'Sith', hilt_type: 'Crossguard' },
  { name: 'Ahsoka Tano', lightsaber_color: 'White', affiliation: 'Ex-Jedi', hilt_type: 'Dual-wield (shoto pair)' },
  { name: 'Qui-Gon Jinn', lightsaber_color: 'Green', affiliation: 'Jedi', hilt_type: 'Single-bladed' }
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO characters (name, lightsaber_color, affiliation, hilt_type)
  VALUES (@name, @lightsaber_color, @affiliation, @hilt_type)
`);

const seedIfEmpty = db.transaction((rows) => {
  for (const row of rows) insert.run(row);
});

const count = db.prepare('SELECT COUNT(*) AS count FROM characters').get().count;
if (count === 0) {
  seedIfEmpty(seedData);
}

module.exports = db;
