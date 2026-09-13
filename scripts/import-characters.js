// One-off / re-runnable import: pulls character names from the public
// SWAPI Star Wars API (https://www.swapi.tech), then cross-references
// a local lightsaber-color lookup, since SWAPI has no lightsaber data.
// Run with: npm run import

const db = require('../db');

const LIGHTSABER_COLORS = {
  // Core
  'Luke Skywalker': { color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: 'Originally blue, then green' },
  'Darth Vader': { color: 'Red', affiliation: 'Sith', era: 'canon', blade_type: 'single', notes: 'Formerly Anakin' },
  'Obi-Wan Kenobi': { color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Yoda': { color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Anakin Skywalker': { color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single', notes: 'Later Darth Vader' },
  'Qui-Gon Jinn': { color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Count Dooku': { color: 'Red', affiliation: 'Sith', era: 'canon', blade_type: 'curved' },
  'Mace Windu': { color: 'Purple', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Darth Maul': { color: 'Red', affiliation: 'Sith', era: 'canon', blade_type: 'double' },
  'Palpatine': { color: 'Red', affiliation: 'Sith', era: 'canon', blade_type: 'single', notes: 'Darth Sidious' },
  'Sheev Palpatine': { color: 'Red', affiliation: 'Sith', era: 'canon', blade_type: 'single' },

  // Jedi Council / PT
  'Ki-Adi-Mundi': { color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Plo Koon': { color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Luminara Unduli': { color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Barriss Offee': { color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Shaak Ti': { color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Kit Fisto': { color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Aayla Secura': { color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Adi Gallia': { color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Saesee Tiin': { color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Agen Kolar': { color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Depa Billaba': { color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Stass Allie': { color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Quinlan Vos': { color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Eeth Koth': { color: 'Green', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },

  // Ahsoka & friends
  'Ahsoka Tano': { color: 'White', affiliation: 'Ex-Jedi', era: 'canon', blade_type: 'dual', notes: 'Green → Blue → White' },
  'Asajj Ventress': { color: 'Red', affiliation: 'Dark Jedi', era: 'canon', blade_type: 'dual' },
  'Savage Opress': { color: 'Red', affiliation: 'Sith', era: 'canon', blade_type: 'double' },

  // Rebels / Jedi survivors
  'Kanan Jarrus': { color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Ezra Bridger': { color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Cal Kestis': { color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },

  // Sequel
  'Rey': { color: 'Yellow', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },
  'Kylo Ren': { color: 'Red (crossguard)', affiliation: 'First Order', era: 'canon', blade_type: 'crossguard' },
  'Ben Solo': { color: 'Blue', affiliation: 'Jedi', era: 'canon', blade_type: 'single' },

  // Darksaber related (SWAPI may not have all)
  'Pre Vizsla': { color: 'Black (Darksaber)', affiliation: 'Mandalorian', era: 'canon', blade_type: 'single' },

  // Legends (SWAPI is mostly film/canon focused, but some names overlap)
  'Revan': { color: 'Purple', affiliation: 'Jedi / Sith', era: 'legends', blade_type: 'single' },
  'Bastila Shan': { color: 'Yellow', affiliation: 'Jedi', era: 'legends', blade_type: 'double' },
  'Satele Shan': { color: 'Blue', affiliation: 'Jedi', era: 'legends', blade_type: 'double' }
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
    INSERT OR IGNORE INTO characters (name, lightsaber_color, affiliation, era, blade_type, notes)
    VALUES (@name, @lightsaber_color, @affiliation, @era, @blade_type, @notes)
  `);

  let added = 0;
  for (const entry of people) {
    const name = extractName(entry);
    if (!name) continue;

    const match = LIGHTSABER_COLORS[name];
    if (!match) continue;

    const result = insert.run({
      name,
      lightsaber_color: match.color,
      affiliation: match.affiliation || null,
      era: match.era || 'canon',
      blade_type: match.blade_type || 'single',
      notes: match.notes || null
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
