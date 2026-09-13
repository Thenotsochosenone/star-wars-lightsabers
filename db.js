const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'lightsabers.db'));

// Create / migrate table
db.exec(`
  CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    lightsaber_color TEXT NOT NULL,
    affiliation TEXT,
    era TEXT DEFAULT 'canon',
    blade_type TEXT DEFAULT 'single',
    notes TEXT
  )
`);

// Lightweight migration for existing DBs (safe to re-run)
const columns = db.prepare("PRAGMA table_info(characters)").all().map(c => c.name);
if (!columns.includes('era')) {
  db.exec("ALTER TABLE characters ADD COLUMN era TEXT DEFAULT 'canon'");
}
if (!columns.includes('blade_type')) {
  db.exec("ALTER TABLE characters ADD COLUMN blade_type TEXT DEFAULT 'single'");
}
if (!columns.includes('notes')) {
  db.exec("ALTER TABLE characters ADD COLUMN notes TEXT");
}

const seedData = [
  // Core OT / PT
  { name: 'Luke Skywalker', lightsaber_color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: 'Originally blue (ANH/ESB), then green (ROTJ)' },
  { name: 'Darth Vader', lightsaber_color: 'Red', affiliation: 'Sith', era: 'canon', blade_type: 'single', notes: 'Formerly Anakin Skywalker (blue)' },
  { name: 'Obi-Wan Kenobi', lightsaber_color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: null },
  { name: 'Yoda', lightsaber_color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: 'Short hilt' },
  { name: 'Mace Windu', lightsaber_color: 'Purple', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: 'Unique purple blade' },
  { name: 'Anakin Skywalker', lightsaber_color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: 'Later became Darth Vader' },
  { name: 'Qui-Gon Jinn', lightsaber_color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: null },
  { name: 'Count Dooku', lightsaber_color: 'Red', affiliation: 'Sith', era: 'canon', blade_type: 'curved', notes: 'Curved hilt' },
  { name: 'Darth Maul', lightsaber_color: 'Red', affiliation: 'Sith', era: 'canon', blade_type: 'double', notes: 'Double-bladed' },
  { name: 'Darth Sidious', lightsaber_color: 'Red', affiliation: 'Sith', era: 'canon', blade_type: 'single', notes: 'Also known as Emperor Palpatine' },

  // Prequel era Jedi
  { name: 'Ahsoka Tano', lightsaber_color: 'White', affiliation: 'Ex-Jedi', era: 'canon', blade_type: 'dual', notes: 'Green → Blue → White (purified)' },
  { name: 'Plo Koon', lightsaber_color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: null },
  { name: 'Ki-Adi-Mundi', lightsaber_color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: null },
  { name: 'Kit Fisto', lightsaber_color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: null },
  { name: 'Luminara Unduli', lightsaber_color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: null },
  { name: 'Barriss Offee', lightsaber_color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: 'Later fell to the dark side' },
  { name: 'Shaak Ti', lightsaber_color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: null },
  { name: 'Aayla Secura', lightsaber_color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: null },
  { name: 'Depa Billaba', lightsaber_color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: null },
  { name: 'Saesee Tiin', lightsaber_color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: null },
  { name: 'Agen Kolar', lightsaber_color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: null },
  { name: 'Adi Gallia', lightsaber_color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: null },
  { name: 'Stass Allie', lightsaber_color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: null },
  { name: 'Quinlan Vos', lightsaber_color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: null },

  // Clone Wars / Rebels era
  { name: 'Kanan Jarrus', lightsaber_color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: 'Formerly Caleb Dume' },
  { name: 'Ezra Bridger', lightsaber_color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: 'Multiple configurations; also green' },
  { name: 'Cal Kestis', lightsaber_color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: 'Can change color; often blue/green' },
  { name: 'Asajj Ventress', lightsaber_color: 'Red', affiliation: 'Sith / Dark Jedi', era: 'canon', blade_type: 'dual', notes: 'Later yellow after leaving the dark side' },
  { name: 'Savage Opress', lightsaber_color: 'Red', affiliation: 'Sith', era: 'canon', blade_type: 'double', notes: null },
  { name: 'The Grand Inquisitor', lightsaber_color: 'Red', affiliation: 'Inquisitor', era: 'canon', blade_type: 'double', notes: 'Spinning double-bladed' },

  // Sequel trilogy
  { name: 'Rey', lightsaber_color: 'Yellow', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: 'Yellow in TROS; previously used Anakin/Luke blue' },
  { name: 'Kylo Ren', lightsaber_color: 'Red (crossguard)', affiliation: 'Sith / First Order', era: 'canon', blade_type: 'crossguard', notes: 'Unstable cracked crystal' },
  { name: 'Ben Solo', lightsaber_color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: 'Before becoming Kylo Ren' },

  // Darksaber & special
  { name: 'Tarre Vizsla', lightsaber_color: 'Black (Darksaber)', affiliation: 'Mandalorian Jedi', era: 'canon', blade_type: 'single', notes: 'Creator of the Darksaber' },
  { name: 'Pre Vizsla', lightsaber_color: 'Black (Darksaber)', affiliation: 'Mandalorian', era: 'canon', blade_type: 'single', notes: null },
  { name: 'Din Djarin', lightsaber_color: 'Black (Darksaber)', affiliation: 'Mandalorian', era: 'canon', blade_type: 'single', notes: 'Wielded the Darksaber' },
  { name: 'Bo-Katan Kryze', lightsaber_color: 'Black (Darksaber)', affiliation: 'Mandalorian', era: 'canon', blade_type: 'single', notes: null },

  // Ahsoka series / later
  { name: 'Baylan Skoll', lightsaber_color: 'Orange', affiliation: 'Dark Jedi', era: 'canon', blade_type: 'single', notes: null },
  { name: 'Shin Hati', lightsaber_color: 'Orange', affiliation: 'Dark Jedi', era: 'canon', blade_type: 'single', notes: null },

  // Legends / KOTOR era
  { name: 'Revan', lightsaber_color: 'Purple / Blue / Red', affiliation: 'Jedi / Sith', era: 'legends', blade_type: 'single', notes: 'Multiple colors across his life' },
  { name: 'Bastila Shan', lightsaber_color: 'Yellow', affiliation: 'Jedi', era: 'legends', blade_type: 'double', notes: 'Double-bladed' },
  { name: 'Meetra Surik', lightsaber_color: 'Blue / Green / Violet', affiliation: 'Jedi', era: 'legends', blade_type: 'single', notes: 'The Exile – player choice' },
  { name: 'Exar Kun', lightsaber_color: 'Blue / Red', affiliation: 'Sith', era: 'legends', blade_type: 'double', notes: null },
  { name: 'Ulic Qel-Droma', lightsaber_color: 'Blue / Red', affiliation: 'Jedi / Sith', era: 'legends', blade_type: 'single', notes: null },
  { name: 'Nomi Sunrider', lightsaber_color: 'Green', affiliation: 'Jedi', era: 'legends', blade_type: 'single', notes: null },
  { name: 'Kyle Katarn', lightsaber_color: 'Green / Yellow / Orange', affiliation: 'Jedi', era: 'legends', blade_type: 'single', notes: 'Multiple colors' },
  { name: 'Jaina Solo', lightsaber_color: 'Purple', affiliation: 'Jedi', era: 'legends', blade_type: 'single', notes: null },
  { name: 'Jacen Solo', lightsaber_color: 'Green / Red', affiliation: 'Jedi / Sith', era: 'legends', blade_type: 'single', notes: 'Later Darth Caedus' },
  { name: 'Mara Jade Skywalker', lightsaber_color: 'Purple', affiliation: 'Jedi', era: 'legends', blade_type: 'single', notes: null },
  { name: 'Corran Horn', lightsaber_color: 'Silver / Purple', affiliation: 'Jedi', era: 'legends', blade_type: 'single', notes: null },
  { name: 'Lowbacca', lightsaber_color: 'Bronze', affiliation: 'Jedi', era: 'legends', blade_type: 'single', notes: 'Wookiee Jedi' },
  { name: 'Satele Shan', lightsaber_color: 'Blue / Green', affiliation: 'Jedi', era: 'legends', blade_type: 'double', notes: null },
  { name: 'Darth Malgus', lightsaber_color: 'Red', affiliation: 'Sith', era: 'legends', blade_type: 'single', notes: null },
  { name: 'Darth Bane', lightsaber_color: 'Red', affiliation: 'Sith', era: 'legends', blade_type: 'single', notes: 'Rule of Two' },
  { name: 'Darth Revan', lightsaber_color: 'Red / Purple', affiliation: 'Sith', era: 'legends', blade_type: 'single', notes: 'Same as Revan' }
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO characters (name, lightsaber_color, affiliation, era, blade_type, notes)
  VALUES (@name, @lightsaber_color, @affiliation, @era, @blade_type, @notes)
`);

const seedIfEmpty = db.transaction((rows) => {
  for (const row of rows) insert.run(row);
});

const count = db.prepare('SELECT COUNT(*) AS count FROM characters').get().count;
if (count === 0) {
  seedIfEmpty(seedData);
  console.log(`Seeded ${seedData.length} characters.`);
}

module.exports = db;
