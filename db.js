const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'lightsabers.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    lightsaber_color TEXT NOT NULL,
    affiliation TEXT
  )
`);

const seedData = [
  { name: 'Luke Skywalker', lightsaber_color: 'Green', affiliation: 'Jedi' },
  { name: 'Darth Vader', lightsaber_color: 'Red', affiliation: 'Sith' },
  { name: 'Obi-Wan Kenobi', lightsaber_color: 'Blue', affiliation: 'Jedi' },
  { name: 'Mace Windu', lightsaber_color: 'Purple', affiliation: 'Jedi' },
  { name: 'Yoda', lightsaber_color: 'Green', affiliation: 'Jedi' },
  { name: 'Darth Maul', lightsaber_color: 'Red', affiliation: 'Sith' },
  { name: 'Rey', lightsaber_color: 'Yellow', affiliation: 'Jedi' },
  { name: 'Kylo Ren', lightsaber_color: 'Red (crossguard)', affiliation: 'Sith' },
  { name: 'Ahsoka Tano', lightsaber_color: 'White', affiliation: 'Ex-Jedi' },
  { name: 'Qui-Gon Jinn', lightsaber_color: 'Green', affiliation: 'Jedi' }
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO characters (name, lightsaber_color, affiliation)
  VALUES (@name, @lightsaber_color, @affiliation)
`);

const seedIfEmpty = db.transaction((rows) => {
  for (const row of rows) insert.run(row);
});

const count = db.prepare('SELECT COUNT(*) AS count FROM characters').get().count;
if (count === 0) {
  seedIfEmpty(seedData);
}

module.exports = db;
