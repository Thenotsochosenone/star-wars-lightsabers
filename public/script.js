const listEl = document.getElementById('character-list');
const formEl = document.getElementById('add-form');
const searchEl = document.getElementById('search');
const sortByEl = document.getElementById('sort-by');
const resultCountEl = document.getElementById('result-count');

let allCharacters = [];

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
  allCharacters = await res.json();
  renderCharacters();
}

function getFilteredAndSorted() {
  const query = searchEl.value.trim().toLowerCase();
  const sortBy = sortByEl.value;

  let result = allCharacters;

  if (query) {
    result = result.filter((char) => {
      const haystack = [char.name, char.lightsaber_color, char.hilt_type, char.affiliation]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  result = [...result].sort((a, b) => {
    const aVal = (a[sortBy] || '').toString().toLowerCase();
    const bVal = (b[sortBy] || '').toString().toLowerCase();
    return aVal.localeCompare(bVal);
  });

  return result;
}

function renderCharacters() {
  const characters = getFilteredAndSorted();
  resultCountEl.textContent = `${characters.length} of ${allCharacters.length} character${allCharacters.length === 1 ? '' : 's'}`;

  listEl.innerHTML = '';

  if (characters.length === 0) {
    listEl.innerHTML = '<p class="no-results">No characters match your search.</p>';
    return;
  }

  characters.forEach((char) => {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.innerHTML = `
      <span class="swatch" style="background:${colorToCss(char.lightsaber_color)}"></span>
      <div class="info">
        <strong>${escapeHtml(char.name)}</strong>
        <div class="badges">
          <span class="badge">${escapeHtml(char.lightsaber_color)}</span>
          ${char.hilt_type ? `<span class="badge hilt">${escapeHtml(char.hilt_type)}</span>` : ''}
          ${char.affiliation ? `<span class="badge">${escapeHtml(char.affiliation)}</span>` : ''}
        </div>
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
  const hilt_type = document.getElementById('hilt-type').value;
  const affiliation = document.getElementById('affiliation').value.trim();

  const res = await fetch('/api/characters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, lightsaber_color, hilt_type, affiliation })
  });

  if (res.ok) {
    formEl.reset();
    fetchCharacters();
  } else {
    const err = await res.json();
    alert(err.error || 'Failed to add character');
  }
});

searchEl.addEventListener('input', renderCharacters);
sortByEl.addEventListener('change', renderCharacters);

fetchCharacters();
