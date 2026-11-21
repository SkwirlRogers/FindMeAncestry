/* ============================================================
   SkwirlWorld — Shared utilities for all public hubs
   Version: 1.0.0
   ============================================================ */

(function() {
  'use strict';

  const API_TIMEOUT = 15000;

  async function apiFetch(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_TIMEOUT);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  function debounce(fn, ms = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  function formatNumber(n) {
    return new Intl.NumberFormat().format(n);
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }
  function toggle(el) { if (el) el.classList.toggle('hidden'); }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type}`;
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:3000;max-width:400px;animation:fadeInUp 0.3s ease;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  function initTabs() {
    document.querySelectorAll('.tabs').forEach(tabBar => {
      const tabs = tabBar.querySelectorAll('.tab');
      const container = tabBar.closest('.section') || tabBar.parentElement;
      const panels = container.querySelectorAll('.tab-panel');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => t.classList.remove('active'));
          panels.forEach(p => p.classList.remove('active'));
          tab.classList.add('active');
          const target = container.querySelector(`#${tab.dataset.tab}`);
          if (target) target.classList.add('active');
        });
      });
    });
  }

  function initForms() {
    document.querySelectorAll('form[data-ajax]').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = form.getAttribute('action');
        const method = form.getAttribute('method') || 'POST';
        const data = Object.fromEntries(new FormData(form));
        try {
          const result = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          showToast('Success!', 'success');
          if (form.dataset.onSuccess) window[form.dataset.onSuccess](result);
        } catch (err) {
          showToast('Something went wrong. Please try again.', 'danger');
        }
      });
    });
  }

  function init() {
    initTabs();
    initForms();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SkwirlUtils = { apiFetch, debounce, formatNumber, formatDate, sanitize, show, hide, toggle, showToast };
})();