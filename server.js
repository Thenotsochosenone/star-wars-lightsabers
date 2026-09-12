const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET all characters
app.get('/api/characters', (req, res) => {
  const characters = db.prepare('SELECT * FROM characters ORDER BY name').all();
  res.json(characters);
});

// GET single character
app.get('/api/characters/:id', (req, res) => {
  const character = db.prepare('SELECT * FROM characters WHERE id = ?').get(req.params.id);
  if (!character) return res.status(404).json({ error: 'Character not found' });
  res.json(character);
});

// POST new character
app.post('/api/characters', (req, res) => {
  const { name, lightsaber_color, affiliation, hilt_type } = req.body;
  if (!name || !lightsaber_color) {
    return res.status(400).json({ error: 'name and lightsaber_color are required' });
  }
  try {
    const result = db.prepare(
      'INSERT INTO characters (name, lightsaber_color, affiliation, hilt_type) VALUES (?, ?, ?, ?)'
    ).run(name, lightsaber_color, affiliation || null, hilt_type || null);
    const newCharacter = db.prepare('SELECT * FROM characters WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newCharacter);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'A character with that name already exists' });
    }
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// PUT update character
app.put('/api/characters/:id', (req, res) => {
  const { name, lightsaber_color, affiliation, hilt_type } = req.body;
  const existing = db.prepare('SELECT * FROM characters WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Character not found' });

  db.prepare(
    'UPDATE characters SET name = ?, lightsaber_color = ?, affiliation = ?, hilt_type = ? WHERE id = ?'
  ).run(
    name ?? existing.name,
    lightsaber_color ?? existing.lightsaber_color,
    affiliation ?? existing.affiliation,
    hilt_type ?? existing.hilt_type,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM characters WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE character
app.delete('/api/characters/:id', (req, res) => {
  const result = db.prepare('DELETE FROM characters WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Character not found' });
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Lightsaber registry running at http://localhost:${PORT}`);
});
