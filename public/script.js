const listEl = document.getElementById('character-list');
const formEl = document.getElementById('add-form');

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function colorToCss(colorName) {
  const map = {
    green: '#3ddc47',
    red: '#ff3b3b',
    blue: '#3b9dff',
    purple: '#b83bff',
    yellow: '#ffe93b',
    white: '#f4f4f4',
    orange: '#ff9d3b'
  };
  const key = Object.keys(map).find((k) => colorName.toLowerCase().includes(k));
  return key ? map[key] : '#999999';
}

async function fetchCharacters() {
  const res = await fetch('/api/characters');
  const characters = await res.json();
  renderCharacters(characters);
}

function renderCharacters(characters) {
  listEl.innerHTML = '';
  characters.forEach((char) => {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.innerHTML = `
      <span class="swatch" style="background:${colorToCss(char.lightsaber_color)}"></span>
      <div class="info">
        <strong>${escapeHtml(char.name)}</strong>
        <span>${escapeHtml(char.lightsaber_color)}${char.affiliation ? ' · ' + escapeHtml(char.affiliation) : ''}</span>
      </div>
      <button class="delete-btn" data-id="${char.id}">✕</button>
    `;
    listEl.appendChild(card);
  });

  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await fetch(`/api/characters/${btn.dataset.id}`, { method: 'DELETE' });
      fetchCharacters();
    });
  });
}

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const lightsaber_color = document.getElementById('color').value.trim();
  const affiliation = document.getElementById('affiliation').value.trim();

  const res = await fetch('/api/characters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, lightsaber_color, affiliation })
  });

  if (res.ok) {
    formEl.reset();
    fetchCharacters();
  } else {
    const err = await res.json();
    alert(err.error || 'Failed to add character');
  }
});

fetchCharacters();
