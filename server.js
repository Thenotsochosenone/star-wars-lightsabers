const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET all characters (with optional search & filters)
app.get('/api/characters', (req, res) => {
  const { q, color, affiliation, era, blade_type } = req.query;
  let sql = 'SELECT * FROM characters WHERE 1=1';
  const params = [];

  if (q) {
    sql += ' AND (name LIKE ? OR notes LIKE ? OR lightsaber_color LIKE ?)';
    const term = `%${q}%`;
    params.push(term, term, term);
  }
  if (color) {
    sql += ' AND lightsaber_color LIKE ?';
    params.push(`%${color}%`);
  }
  if (affiliation) {
    sql += ' AND affiliation LIKE ?';
    params.push(`%${affiliation}%`);
  }
  if (era) {
    sql += ' AND era = ?';
    params.push(era);
  }
  if (blade_type) {
    sql += ' AND blade_type = ?';
    params.push(blade_type);
  }

  sql += ' ORDER BY name';
  const characters = db.prepare(sql).all(...params);
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
  const { name, lightsaber_color, affiliation, era, blade_type, notes } = req.body;
  if (!name || !lightsaber_color) {
    return res.status(400).json({ error: 'name and lightsaber_color are required' });
  }
  try {
    const result = db.prepare(`
      INSERT INTO characters (name, lightsaber_color, affiliation, era, blade_type, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      name,
      lightsaber_color,
      affiliation || null,
      era || 'canon',
      blade_type || 'single',
      notes || null
    );
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
  const { name, lightsaber_color, affiliation, era, blade_type, notes } = req.body;
  const existing = db.prepare('SELECT * FROM characters WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Character not found' });

  try {
    db.prepare(`
      UPDATE characters
      SET name = ?, lightsaber_color = ?, affiliation = ?, era = ?, blade_type = ?, notes = ?
      WHERE id = ?
    `).run(
      name ?? existing.name,
      lightsaber_color ?? existing.lightsaber_color,
      affiliation !== undefined ? affiliation : existing.affiliation,
      era ?? existing.era,
      blade_type ?? existing.blade_type,
      notes !== undefined ? notes : existing.notes,
      req.params.id
    );
    const updated = db.prepare('SELECT * FROM characters WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'A character with that name already exists' });
    }
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// DELETE character
app.delete('/api/characters/:id', (req, res) => {
  const result = db.prepare('DELETE FROM characters WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Character not found' });
  res.status(204).send();
});

// Simple stats endpoint (nice extra)
app.get('/api/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS count FROM characters').get().count;
  const byColor = db.prepare(`
    SELECT lightsaber_color, COUNT(*) AS count
    FROM characters GROUP BY lightsaber_color ORDER BY count DESC
  `).all();
  const byEra = db.prepare(`
    SELECT era, COUNT(*) AS count FROM characters GROUP BY era
  `).all();
  res.json({ total, byColor, byEra });
});

app.listen(PORT, () => {
  console.log(`Lightsaber registry running at http://localhost:${PORT}`);
});
