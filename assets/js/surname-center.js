/**
 * Surname Research Center — Main Page Logic
 * Handles autocomplete, tab switching, data loading, charts, and export
 */
let currentSurnameData = null;
let timelineChart = null;
let surnameIndex = [];

async function init() {
  try {
    const res = await fetch('/assets/data/surnames-index.json');
    surnameIndex = await res.json();
  } catch (e) {
    console.error('Failed to load surname index:', e);
  }
  setupAutocomplete();
  setupTabs();
  setupResizeHandle();
}

function setupAutocomplete() {
  const input = document.getElementById('surnameSearch');
  const list = document.getElementById('autocompleteList');
  let debounce = null;

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { list.classList.remove('show'); return; }
    debounce = setTimeout(() => {
      const matches = surnameIndex.filter(s =>
        s.surname.toLowerCase().includes(q) || s.soundex.includes(q.toUpperCase())
      ).slice(0, 15);
      if (matches.length === 0) { list.classList.remove('show'); return; }
      list.innerHTML = matches.map(m =>
        `<div class="autocomplete-item" data-slug="${m.slug}" onclick="selectSurname('${m.slug}')">
          <span class="name">${m.surname}</span>
          <span class="meta">${m.soundex} · ${m.total_records} NC records</span>
        </div>`
      ).join('');
      list.classList.add('show');
    }, 150);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const first = list.querySelector('.autocomplete-item');
      if (first) selectSurname(first.dataset.slug);
    }
    if (e.key === 'Escape') list.classList.remove('show');
  });

  document.addEventListener('click', (e) => {
    if (!list.contains(e.target) && e.target !== input) list.classList.remove('show');
  });
}

async function selectSurname(slug) {
  document.getElementById('autocompleteList').classList.remove('show');
  document.getElementById('surnameSearch').value = slug.replace(/-/g, ' ');
  await loadSurnameBySlug(slug);
}

async function loadSurname(name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  await loadSurnameBySlug(slug);
}

async function loadSurnameBySlug(slug) {
  try {
    const res = await fetch(`/assets/data/surnames/${slug}.json`);
    if (!res.ok) throw new Error('Not found');
    currentSurnameData = await res.json();
    renderOverview();
    renderVariants();
    renderGeography();
    renderTimeline();
    renderMigration();
    renderResources();
    // Switch to overview tab
    switchTab('overview');
  } catch (e) {
    console.error('Failed to load surname:', e);
    alert('Surname not found in database. Try searching by name.');
  }
}

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  const btn = document.querySelector(`[data-tab="${tabId}"]`);
  const pane = document.getElementById(`tab-${tabId}`);
  if (btn) btn.classList.add('active');
  if (pane) pane.classList.add('active');
}

function renderOverview() {
  const d = currentSurnameData;
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('overviewContent').style.display = 'block';
  document.getElementById('overviewSurname').textContent = d.surname;
  document.getElementById('overviewSoundex').textContent = `Soundex: ${d.soundex} | First recorded surname data from NC`;

  const nc = d.nc_data;
  document.getElementById('overviewStats').innerHTML = `
    <div class="stat-card"><div class="stat-value">${nc.total_records}</div><div class="stat-label">NC Records</div></div>
    <div class="stat-card"><div class="stat-value">${nc.top_counties.length}</div><div class="stat-label">NC Counties</div></div>
    <div class="stat-card"><div class="stat-value">${nc.earliest_birth || 'N/A'}</div><div class="stat-label">Earliest Birth</div></div>
    <div class="stat-card"><div class="stat-value">${nc.latest_birth || 'N/A'}</div><div class="stat-label">Latest Birth</div></div>
    <div class="stat-card"><div class="stat-value">${d.variants.length}</div><div class="stat-label">Known Variants</div></div>
  `;

  document.getElementById('overviewEtymology').innerHTML = `
    <h3>Etymology & Classification</h3>
    <p style="font-size:0.9rem; color:var(--clr-text-muted);">Scout AI can provide full etymology analysis. Ask in the chat panel about the origin, meaning, and classification type (patronymic, occupational, locative, topographic) of "${d.surname}".</p>
  `;

  if (nc.top_counties.length > 0) {
    const max = nc.top_counties[0].count;
    document.getElementById('overviewCounties').innerHTML = `
      <h3>NC County Distribution (Top 8)</h3>
      ${nc.top_counties.map(c => `
        <div class="county-bar">
          <div class="bar-name">${c.county}</div>
          <div class="bar-fill" style="width: ${(c.count / max * 100)}%"></div>
          <div class="bar-count">${c.count}</div>
        </div>
      `).join('')}
    `;
  }
}

function renderVariants() {
  const d = currentSurnameData;
  const el = document.getElementById('variantsList');
  if (d.variants.length === 0) {
    el.innerHTML = '<p style="color:var(--clr-text-muted);">No variant forms found in the NC dataset. Ask Scout for global variants.</p>';
  } else {
    el.innerHTML = d.variants.map(v => `<span class="variant-chip">${v}</span>`).join('');
  }
  document.getElementById('phoneticCodes').innerHTML = `
    <div style="display:flex;gap:16px;margin-top:8px;">
      <div class="stat-card" style="flex:1;"><div class="stat-value" style="font-size:1.2rem;">${d.soundex}</div><div class="stat-label">Soundex</div></div>
    </div>
    <p style="font-size:0.85rem; color:var(--clr-text-muted); margin-top:12px;">DMetaphone and other phonetic codes can be computed by Scout. Ask in the chat panel.</p>
  `;
}

function renderGeography() {
  const nc = currentSurnameData.nc_data;
  const el = document.getElementById('countyBars');
  if (nc.top_counties.length === 0) {
    el.innerHTML = '<p style="color:var(--clr-text-muted);">No county data available.</p>';
  } else {
    const max = nc.top_counties[0].count;
    el.innerHTML = nc.top_counties.map(c => `
      <div class="county-bar">
        <div class="bar-name">${c.county}</div>
        <div class="bar-fill" style="width: ${(c.count / max * 100)}%"></div>
        <div class="bar-count">${c.count}</div>
      </div>
    `).join('');
  }
}

function renderTimeline() {
  const nc = currentSurnameData.nc_data;
  const el = document.getElementById('timelineChart');
  if (nc.birth_decades.length === 0) {
    document.getElementById('tab-timeline').innerHTML = '<p style="color:var(--clr-text-muted); padding:20px;">No birth decade data available.</p>';
    return;
  }
  if (timelineChart) timelineChart.destroy();
  timelineChart = new Chart(el, {
    type: 'bar',
    data: {
      labels: nc.birth_decades.map(d => d.decade + 's'),
      datasets: [{
        label: 'Births by Decade',
        data: nc.birth_decades.map(d => d.count),
        backgroundColor: '#c9a84c',
        borderColor: '#8a6d2b',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Count' } },
        x: { title: { display: true, text: 'Decade' } }
      }
    }
  });
  document.getElementById('timelineStats').innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="stat-value">${nc.earliest_birth || 'N/A'}</div><div class="stat-label">Earliest</div></div>
      <div class="stat-card"><div class="stat-value">${nc.latest_birth || 'N/A'}</div><div class="stat-label">Latest</div></div>
      <div class="stat-card"><div class="stat-value">${nc.total_records}</div><div class="stat-label">Total Records</div></div>
    </div>
  `;
}

function renderMigration() {
  const nc = currentSurnameData.nc_data;
  const el = document.getElementById('migrationPaths');
  if (nc.top_counties.length === 0) {
    el.innerHTML = '<p style="color:var(--clr-text-muted);">No migration data available.</p>';
    return;
  }
  el.innerHTML = `
    <div class="info-section">
      <h3>NC Settlement Pattern</h3>
      <p style="font-size:0.9rem; color:var(--clr-text-muted); margin-bottom:12px;">Based on birth and death county records, the "${currentSurnameData.surname}" family concentrated in these NC regions:</p>
      ${nc.top_counties.map((c, i) => `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <div style="width:24px;height:24px;border-radius:50%;background:var(--clr-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;">${i + 1}</div>
          <div><strong>${c.county}</strong> — ${c.count} records</div>
        </div>
      `).join('')}
    </div>
    <div class="info-section">
      <h3>Ask Scout for Migration Analysis</h3>
      <p style="font-size:0.9rem; color:var(--clr-text-muted);">Scout can trace historical migration paths, origin regions, and settlement patterns beyond NC data. Use the chat panel to request a full migration flow analysis.</p>
    </div>
  `;
}

function renderResources() {
  const res = currentSurnameData.resources;
  const el = document.getElementById('resourceLinks');
  const sites = [
    { key: 'behindthename', label: '📖 BehindTheName', desc: 'Etymology & meaning' },
    { key: 'familysearch', label: '🔍 FamilySearch', desc: 'Surname records' },
    { key: 'geneanet', label: '🌳 Geneanet', desc: 'Global distribution' },
    { key: 'ancestry', label: '📋 Ancestry', desc: 'Name meaning' },
    { key: 'houseofnames', label: '🏰 HouseOfNames', desc: 'Coat of arms' },
    { key: 'one_name_org', label: '📚 One-Name Studies', desc: 'Surname projects' }
  ];
  el.innerHTML = sites.map(s =>
    `<a href="${res[s.key]}" target="_blank" rel="noopener" class="resource-link">
      ${s.label} <span style="font-weight:400;color:var(--clr-text-muted);">${s.desc}</span>
    </a>`
  ).join('');
}

function exportSurname(format) {
  if (!currentSurnameData) return alert('Search for a surname first.');
  if (format === 'pdf') {
    alert('PDF export: $10 per report. Google Pay integration coming soon.');
  } else if (format === 'gedmark') {
    alert('GEDMark export: $10 per report. Google Pay integration coming soon.');
  } else if (format === 'csv') {
    const nc = currentSurnameData.nc_data;
    let csv = 'Name,Birth,County\n';
    nc.sample_records.forEach(r => { csv += `"${r.name}",${r.birth || ''},"${r.county}"\n`; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${currentSurnameData.slug}-sample.csv`;
    a.click(); URL.revokeObjectURL(url);
  }
}

function setupResizeHandle() {
  const handle = document.getElementById('resizeHandle');
  const left = document.getElementById('leftPanel');
  const right = document.getElementById('rightPanel');
  if (!handle) return;
  let startX, startW;
  handle.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    startW = left.offsetWidth;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', () => document.removeEventListener('mousemove', onDrag));
  });
  function onDrag(e) {
    const diff = e.clientX - startX;
    left.style.flex = 'none';
    left.style.width = Math.max(300, startW + diff) + 'px';
  }
}

document.addEventListener('DOMContentLoaded', init);
