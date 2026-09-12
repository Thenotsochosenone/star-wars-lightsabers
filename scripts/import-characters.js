// One-off / re-runnable import: pulls character names from the public
// SWAPI Star Wars API (https://www.swapi.tech), then cross-references
// a local lightsaber-color lookup, since SWAPI has no lightsaber data.
// Run with: npm run import

const db = require('../db');

const LIGHTSABER_COLORS = {
  'Luke Skywalker': { color: 'Green', affiliation: 'Jedi', hilt_type: 'Single-bladed' },
  'Darth Vader': { color: 'Red', affiliation: 'Sith', hilt_type: 'Single-bladed' },
  'Obi-Wan Kenobi': { color: 'Blue', affiliation: 'Jedi', hilt_type: 'Single-bladed' },
  'Yoda': { color: 'Green', affiliation: 'Jedi', hilt_type: 'Single-bladed (shoto)' },
  'Anakin Skywalker': { color: 'Blue', affiliation: 'Jedi (later Sith)', hilt_type: 'Single-bladed' },
  'Qui-Gon Jinn': { color: 'Green', affiliation: 'Jedi', hilt_type: 'Single-bladed' },
  'Count Dooku': { color: 'Red', affiliation: 'Sith', hilt_type: 'Curved-hilt' },
  'Mace Windu': { color: 'Purple', affiliation: 'Jedi', hilt_type: 'Single-bladed' },
  'Ki-Adi-Mundi': { color: 'Blue', affiliation: 'Jedi', hilt_type: 'Single-bladed' },
  'Plo Koon': { color: 'Blue', affiliation: 'Jedi', hilt_type: 'Single-bladed' },
  'Luminara Unduli': { color: 'Green', affiliation: 'Jedi', hilt_type: 'Single-bladed' },
  'Barriss Offee': { color: 'Green', affiliation: 'Jedi', hilt_type: 'Single-bladed' },
  'Shaak Ti': { color: 'Yellow', affiliation: 'Jedi', hilt_type: 'Single-bladed' },
  'Kit Fisto': { color: 'Green', affiliation: 'Jedi', hilt_type: 'Single-bladed' },
  'Bastila Shan': { color: 'White', affiliation: 'Jedi', hilt_type: 'Single-bladed' },
  'Revan': { color: 'Red', affiliation: 'Sith', hilt_type: 'Single-bladed' },
  'Kal Kestis': { color: 'Blue', affiliation: 'Jedi', hilt_type: 'Single-bladed' }
};

const BASE_URL = 'https://www.swapi.tech/api/people';

function extractName(entry) {
  return entry.name || (entry.properties && entry.properties.name) || null;
}

async function fetchAllPeople() {
  const people = [];
  let url = `${BASE_URL}?page=1&limit=50`;

  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`SWAPI request failed: ${res.status}`);
    const data = await res.json();
    const results = data.results || data.result || [];
    people.push(...results);
    url = data.next || null;
  }

  return people;
}

async function run() {
  console.log('Fetching character names from SWAPI...');
  const people = await fetchAllPeople();
  console.log(`Fetched ${people.length} characters from SWAPI.`);

  const insert = db.prepare(`
    INSERT OR IGNORE INTO characters (name, lightsaber_color, affiliation, hilt_type)
    VALUES (@name, @lightsaber_color, @affiliation, @hilt_type)
  `);

  let added = 0;
  for (const entry of people) {
    const name = extractName(entry);
    if (!name) continue;

    const match = LIGHTSABER_COLORS[name];
    if (!match) continue; // skip characters we have no lightsaber data for

    const result = insert.run({
      name,
      lightsaber_color: match.color,
      affiliation: match.affiliation,
      hilt_type: match.hilt_type || null
    });
    if (result.changes > 0) added++;
  }

  console.log(`Added ${added} new lightsaber-wielding characters.`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Import failed:', err.message);
  process.exit(1);
});
