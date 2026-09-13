const listEl = document.getElementById('character-list');
const formEl = document.getElementById('character-form');
const searchEl = document.getElementById('search');
const filterColorEl = document.getElementById('filter-color');
const filterEraEl = document.getElementById('filter-era');
const filterBladeEl = document.getElementById('filter-blade');
const clearBtn = document.getElementById('clear-filters');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit');
const editIdEl = document.getElementById('edit-id');
const statsEl = document.getElementById('stats');

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function colorToCss(colorName) {
  if (!colorName) return '#999999';
  const lower = colorName.toLowerCase();

  // Order matters – more specific first
  if (lower.includes('black') || lower.includes('darksaber')) return '#1a1a1a';
  if (lower.includes('crossguard') || (lower.includes('red') && lower.includes('unstable'))) return '#ff2a2a';
  if (lower.includes('red')) return '#ff3b3b';
  if (lower.includes('purple') || lower.includes('violet')) return '#b83bff';
  if (lower.includes('blue')) return '#3b9dff';
  if (lower.includes('green')) return '#3ddc47';
  if (lower.includes('yellow')) return '#ffe93b';
  if (lower.includes('orange')) return '#ff9d3b';
  if (lower.includes('white')) return '#f4f4f4';
  if (lower.includes('bronze') || lower.includes('copper')) return '#cd7f32';
  if (lower.includes('silver') || lower.includes('cyan')) return '#a8d8e8';
  if (lower.includes('indigo')) return '#6b5bff';
  return '#999999';
}

function buildQuery() {
  const params = new URLSearchParams();
  const q = searchEl.value.trim();
  if (q) params.set('q', q);
  if (filterColorEl.value) params.set('color', filterColorEl.value);
  if (filterEraEl.value) params.set('era', filterEraEl.value);
  if (filterBladeEl.value) params.set('blade_type', filterBladeEl.value);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function fetchCharacters() {
  const res = await fetch(`/api/characters${buildQuery()}`);
  const characters = await res.json();
  renderCharacters(characters);
}

async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    const colorSummary = data.byColor.slice(0, 5).map(c => `${c.lightsaber_color}: ${c.count}`).join(' · ');
    statsEl.textContent = `${data.total} characters · ${colorSummary}`;
  } catch {
    statsEl.textContent = '';
  }
}

function renderCharacters(characters) {
  listEl.innerHTML = '';
  if (characters.length === 0) {
    listEl.innerHTML = '<p class="empty">No characters match your filters.</p>';
    return;
  }

  characters.forEach((char) => {
    const card = document.createElement('div');
    card.className = 'character-card';
    const cssColor = colorToCss(char.lightsaber_color);
    const isDark = cssColor === '#1a1a1a';

    card.innerHTML = `
      <span class="swatch" style="background:${cssColor}; ${isDark ? 'box-shadow: 0 0 8px #666, inset 0 0 4px #000;' : ''}"></span>
      <div class="info">
        <strong>${escapeHtml(char.name)}</strong>
        <span class="meta">
          ${escapeHtml(char.lightsaber_color)}
          ${char.affiliation ? ' · ' + escapeHtml(char.affiliation) : ''}
          ${char.era ? ' · <span class="tag">' + escapeHtml(char.era) + '</span>' : ''}
          ${char.blade_type && char.blade_type !== 'single' ? ' · <span class="tag">' + escapeHtml(char.blade_type) + '</span>' : ''}
        </span>
        ${char.notes ? `<span class="notes">${escapeHtml(char.notes)}</span>` : ''}
      </div>
      <div class="actions">
        <button class="edit-btn" data-id="${char.id}" title="Edit">✎</button>
        <button class="delete-btn" data-id="${char.id}" title="Delete">✕</button>
      </div>
    `;
    listEl.appendChild(card);
  });

  // Delete handlers
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove this character?')) return;
      await fetch(`/api/characters/${btn.dataset.id}`, { method: 'DELETE' });
      fetchCharacters();
      fetchStats();
    });
  });

  // Edit handlers
  document.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const res = await fetch(`/api/characters/${btn.dataset.id}`);
      if (!res.ok) return;
      const char = await res.json();
      enterEditMode(char);
    });
  });
}

function enterEditMode(char) {
  editIdEl.value = char.id;
  document.getElementById('name').value = char.name || '';
  document.getElementById('color').value = char.lightsaber_color || '';
  document.getElementById('affiliation').value = char.affiliation || '';
  document.getElementById('era').value = char.era || 'canon';
  document.getElementById('blade_type').value = char.blade_type || 'single';
  document.getElementById('notes').value = char.notes || '';
  submitBtn.textContent = 'Update Character';
  cancelEditBtn.hidden = false;
  formEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function exitEditMode() {
  editIdEl.value = '';
  formEl.reset();
  document.getElementById('era').value = 'canon';
  document.getElementById('blade_type').value = 'single';
  submitBtn.textContent = 'Add Character';
  cancelEditBtn.hidden = true;
}

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = editIdEl.value;
  const payload = {
    name: document.getElementById('name').value.trim(),
    lightsaber_color: document.getElementById('color').value.trim(),
    affiliation: document.getElementById('affiliation').value.trim() || null,
    era: document.getElementById('era').value,
    blade_type: document.getElementById('blade_type').value,
    notes: document.getElementById('notes').value.trim() || null
  };

  const url = id ? `/api/characters/${id}` : '/api/characters';
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    exitEditMode();
    fetchCharacters();
    fetchStats();
  } else {
    const err = await res.json();
    alert(err.error || 'Failed to save character');
  }
});

cancelEditBtn.addEventListener('click', exitEditMode);

// Live filtering
let debounceTimer;
function scheduleFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchCharacters, 180);
}

searchEl.addEventListener('input', scheduleFetch);
filterColorEl.addEventListener('change', fetchCharacters);
filterEraEl.addEventListener('change', fetchCharacters);
filterBladeEl.addEventListener('change', fetchCharacters);

clearBtn.addEventListener('click', () => {
  searchEl.value = '';
  filterColorEl.value = '';
  filterEraEl.value = '';
  filterBladeEl.value = '';
  fetchCharacters();
});

// Initial load
fetchCharacters();
fetchStats();
