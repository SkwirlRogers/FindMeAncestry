/* ============================================================
   SkwirlWorld — Global Public Nav Component
   Version: 1.0.0
   Usage: Include this script in every hub page.
         Set data-hub attribute on <body> to highlight active hub.
   ============================================================ */

(function() {
  'use strict';

  // Public hubs available on the shared FYBF/FindMeAncestry domain.
  // Unavailable legacy port-based hubs are intentionally omitted until they have real routes.
  const HUBS = [
    { id: 'findmeancestry', name: 'FindMeAncestry', path: '/findmeancestry/', icon: '🔍', desc: 'Ancestry Discovery' },
    { id: 'nationalarchives', name: 'National Archives', path: '/nationalarchives/', icon: '🏛️', desc: 'Records & Repositories' },
    { id: 'bookhub', name: 'FRU Legacy Library', path: '/fru-skwirl-legacy-library.html', icon: '📖', desc: 'Family Research Library' },
    { id: 'ceeyoassets', name: 'CeeYoAssets', path: '/ceeyoassets.html', icon: '💰', desc: 'Unclaimed Assets' },
  ];

  function getBaseURL(hubId) {
    const hub = HUBS.find(h => h.id === hubId);
    return hub ? hub.path : '/';
  }

  function getHubURL(hubId) {
    return getBaseURL(hubId);
  }

  function renderUtilityStrip() {
    const currentHub = document.body.getAttribute('data-hub') || '';
    return `
    <div class="utility-strip">
      <div class="container">
        <div class="utility-strip__trust">
          <span>⚡ SkwirlWorld ECC</span>
          <span>•</span>
          <span>Rogers & Barrett Creative Media</span>
        </div>
        <div class="utility-strip__links">
          ${HUBS.filter(h => h.id !== currentHub).map(h =>
            `<a href="${getHubURL(h.id)}">${h.icon} ${h.name}</a>`
          ).join('<span>•</span>')}
        </div>
      </div>
    </div>`;
  }

  function renderHeader() {
    const currentHub = document.body.getAttribute('data-hub') || '';
    const hub = HUBS.find(h => h.id === currentHub);
    const hubName = hub ? hub.name : 'SkwirlWorld';
    const hubDesc = hub ? hub.desc : '';
    const navItems = [
      { label: 'Search', href: '#search' },
      { label: 'Records', href: '#records' },
      { label: 'Pathways', href: '#pathways' },
      { label: 'Help', href: '#help' },
    ];

    return `
    <header class="site-header">
      <div class="container">
        <a href="${getHubURL(currentHub)}" class="site-logo">
          🌐 SkwirlWorld
          <span class="logo-sub">${hubName} — ${hubDesc}</span>
        </a>
        <nav class="main-nav" id="mainNav">
          ${navItems.map(item =>
            `<a href="${item.href}">${item.label}</a>`
          ).join('')}
          <a href="${getHubURL(currentHub)}" class="nav-cta">Sign In</a>
        </nav>
        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle navigation">
          ☰
        </button>
      </div>
    </header>`;
  }

  function renderCrossHubNav() {
    const currentHub = document.body.getAttribute('data-hub') || '';
    return `
    <section class="cross-hub-nav">
      <div class="container">
        <h3>🌐 Explore SkwirlWorld Hubs</h3>
        <div class="cross-hub-grid">
          ${HUBS.filter(h => h.id !== currentHub).map(h => `
            <a href="${getHubURL(h.id)}" class="cross-hub-link">
              <span class="icon">${h.icon}</span>
              <div>
                <div class="label">${h.name}</div>
                <div class="desc">${h.desc}</div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>`;
  }

  function renderFooter() {
    const currentHub = document.body.getAttribute('data-hub') || '';
    return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <h3>🌐 SkwirlWorld</h3>
            <p>The world's first all-in-one genealogy, ancestry, DNA research, asset recovery, and travel ecosystem. Powered by SkwirlAI and Rogers & Barrett Creative Media.</p>
          </div>
          <div class="footer-col">
            <h4>Hubs</h4>
            ${HUBS.map(h =>
              `<a href="${getHubURL(h.id)}">${h.icon} ${h.name}</a>`
            ).join('')}
          </div>
          <div class="footer-col">
            <h4>Resources</h4>
            <a href="${getHubURL('nationalarchives')}">National Archives</a>
            <a href="${getHubURL('findmeancestry')}">Ancestry Search</a>
            <a href="${getHubURL('bookhub')}">Book Store</a>
            <a href="#">DNA Tools</a>
            <a href="#">Research Guides</a>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <a href="#">About Rogers & Barrett Creative Media</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact</a>
            <a href="#">Support</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} SkwirlWorld — Rogers & Barrett Creative Media. All rights reserved.</p>
          <div class="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>`;
  }

  function init() {
    const utilTarget = document.getElementById('utility-strip');
    const headerTarget = document.getElementById('site-header');
    const navTarget = document.getElementById('cross-hub-nav');
    const footerTarget = document.getElementById('site-footer');

    if (utilTarget) utilTarget.innerHTML = renderUtilityStrip();
    if (headerTarget) headerTarget.innerHTML = renderHeader();
    if (navTarget) navTarget.innerHTML = renderCrossHubNav();
    if (footerTarget) footerTarget.innerHTML = renderFooter();

    const menuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    if (menuBtn && mainNav) {
      menuBtn.addEventListener('click', () => mainNav.classList.toggle('open'));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SkwirlNav = { HUBS, PORT_MAP, getHubURL, getBaseURL };
})();