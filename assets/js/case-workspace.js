const CASE_STORAGE_KEY = 'findme_cases_v1';
const SEARCH_STORAGE_KEY = 'findme_saved_searches_v1';

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn('Storage read failed', error);
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('Storage write failed', error);
    return false;
  }
}

function createCaseObject(title = 'New Family Case', notes = '') {
  return {
    id: `case-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    title,
    status: 'open',
    notes,
    people: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

window.FindMeWorkspace = {
  listCases() {
    return readJSON(CASE_STORAGE_KEY, []);
  },

  addCase(title, notes = '') {
    const cases = this.listCases();
    const next = createCaseObject(title || 'New Family Case', notes);
    cases.unshift(next);
    writeJSON(CASE_STORAGE_KEY, cases);
    return next;
  },

  saveSearch(query) {
    const searches = readJSON(SEARCH_STORAGE_KEY, []);
    const entry = {
      id: `search-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      query,
      createdAt: new Date().toISOString(),
    };
    searches.unshift(entry);
    writeJSON(SEARCH_STORAGE_KEY, searches.slice(0, 20));
    return entry;
  },

  renderCaseList() {
    const list = document.getElementById('case-list');
    if (!list) return;
    const cases = this.listCases();

    if (!cases.length) {
      list.innerHTML = '<p class="muted">No saved cases yet. Create your first family case to begin a research thread.</p>';
      return;
    }

    list.innerHTML = cases.map((item) => `
      <div class="case-item" data-case-id="${item.id}">
        <div class="case-item-header">
          <strong>${(item.title || 'Untitled Case').replace(/</g, '&lt;')}</strong>
          <span class="case-pill">${item.status}</span>
        </div>
        <p>${(item.notes || 'No notes yet').replace(/</g, '&lt;')}</p>
        <small>${new Date(item.updatedAt || item.createdAt).toLocaleString()}</small>
      </div>
    `).join('');
  },

  bindCaseForm() {
    const form = document.getElementById('case-form');
    if (!form) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const titleInput = document.getElementById('case-title');
      const noteInput = document.getElementById('case-notes');
      const title = (titleInput && titleInput.value.trim()) || 'New Family Case';
      const notes = noteInput ? noteInput.value.trim() : '';
      this.addCase(title, notes);
      this.renderCaseList();
      if (titleInput) titleInput.value = '';
      if (noteInput) noteInput.value = '';
    });
  },

  bindSearchForm() {
    const form = document.getElementById('search-form');
    if (!form) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = document.getElementById('search-query');
      if (!input) return;
      const query = input.value.trim();
      if (!query) return;
      this.saveSearch(query);
      input.value = '';
      this.renderRecentSearches();
    });
  },

  renderRecentSearches() {
    const list = document.getElementById('recent-searches');
    if (!list) return;
    const searches = readJSON(SEARCH_STORAGE_KEY, []);
    if (!searches.length) {
      list.innerHTML = '<p class="muted">No saved searches yet.</p>';
      return;
    }

    list.innerHTML = searches.slice(0, 5).map((item) => `
      <div class="search-item">${(item.query || 'Untitled search').replace(/</g, '&lt;')}</div>
    `).join('');
  },

  init() {
    this.renderCaseList();
    this.renderRecentSearches();
    this.bindCaseForm();
    this.bindSearchForm();
  },
};

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.FindMeWorkspace.init();
  });
}
