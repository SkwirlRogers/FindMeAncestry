const APP_STORAGE_KEY = 'findme_app_state_v1';

const PLAN_CATALOG = {
  demo: {
    name: 'Demo',
    tier: 'demo',
    premium: false,
    description: 'Explore the platform in preview mode',
  },
  'Discovery': {
    name: 'Discovery',
    tier: 'starter',
    premium: false,
    description: 'Light family search access',
  },
  'Forensic Explorer': {
    name: 'Forensic Explorer',
    tier: 'subscriber',
    premium: true,
    description: 'Full research workspace and AI access',
  },
  'Advocate': {
    name: 'Advocate',
    tier: 'subscriber',
    premium: true,
    description: 'Advanced case management and family advocacy tools',
  },
  'Investigator': {
    name: 'Investigator',
    tier: 'subscriber',
    premium: true,
    description: 'Full deep-dive investigation suite',
  },
};

function defaultState() {
  return {
    user: null,
    plan: 'demo',
    tier: 'demo',
    subscribed: false,
    lastUpdated: new Date().toISOString(),
  };
}

const AppState = {
  ensure() {
    try {
      const raw = localStorage.getItem(APP_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(defaultState()));
      }
    } catch (error) {
      console.warn('AppState localStorage unavailable', error);
    }
  },

  get() {
    this.ensure();
    try {
      const raw = localStorage.getItem(APP_STORAGE_KEY);
      return raw ? JSON.parse(raw) : defaultState();
    } catch (_error) {
      return defaultState();
    }
  },

  save(state) {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify({ ...defaultState(), ...state, lastUpdated: new Date().toISOString() }));
  },

  getPlanInfo(planName = this.get().plan || 'demo') {
    const name = planName || 'demo';
    return PLAN_CATALOG[name] || PLAN_CATALOG.demo;
  },

  login(email, fullName = 'Member', role = 'member') {
    const state = this.get();
    state.user = {
      email,
      fullName,
      role,
      loggedInAt: new Date().toISOString(),
    };
    if (!state.plan || !PLAN_CATALOG[state.plan]) {
      state.plan = 'demo';
    }
    state.tier = this.getPlanInfo(state.plan).tier;
    state.subscribed = Boolean(state.subscribed);
    this.save(state);
    return state;
  },

  logout() {
    const state = this.get();
    state.user = null;
    state.plan = 'demo';
    state.tier = 'demo';
    state.subscribed = false;
    this.save(state);
    return state;
  },

  subscribe(plan = 'Forensic Explorer') {
    const state = this.get();
    state.plan = plan;
    state.tier = this.getPlanInfo(plan).tier;
    state.subscribed = true;
    this.save(state);
    return state;
  },

  isSubscribed() {
    return Boolean(this.get().subscribed);
  },

  isLoggedIn() {
    return Boolean(this.get().user);
  },

  getUser() {
    return this.get().user;
  },

  getPlan() {
    return this.get().plan || 'demo';
  },

  hasAccess(requiredTier = 'subscriber') {
    const state = this.get();
    const currentTier = state.tier || 'demo';
    if (requiredTier === 'subscriber') {
      return state.subscribed || currentTier === 'subscriber';
    }
    if (requiredTier === 'starter') {
      return state.subscribed || currentTier === 'starter' || currentTier === 'subscriber';
    }
    return true;
  },

  renderStatus(targetSelector = '[data-app-status]') {
    const nodes = document.querySelectorAll(targetSelector);
    const state = this.get();
    const user = state.user;
    const planLabel = this.getPlanInfo(state.plan).name;
    const label = user ? `${user.fullName} · ${planLabel}` : `Demo Mode · ${planLabel}`;

    nodes.forEach((node) => {
      node.textContent = label;
    });
  },

  renderAccountPanel() {
    const state = this.get();
    const user = state.user;
    const panel = document.getElementById('account-panel');
    if (!panel) return;

    if (!user) {
      panel.innerHTML = `
        <div class="auth-card">
          <h3>Access Portal</h3>
          <form id="findme-login-form">
            <input type="text" id="findme-login-name" placeholder="Full name" style="margin-bottom: 10px; width:100%; padding:10px;" />
            <input type="email" id="findme-login-email" placeholder="Email address" required style="margin-bottom: 10px; width:100%; padding:10px;" />
            <button type="submit" class="btn btn-accent" style="width:100%;">Enter Workspace</button>
          </form>
        </div>
      `;
      return;
    }

    panel.innerHTML = `
      <div class="auth-card">
        <h3>Account</h3>
        <p><strong>${user.fullName}</strong></p>
        <p>${user.email}</p>
        <p>Plan: <strong>${state.plan}</strong></p>
        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
          <button type="button" class="btn btn-accent" data-app-upgrade>Upgrade</button>
          <button type="button" class="btn btn-outline" data-app-logout>Logout</button>
        </div>
      </div>
    `;
  },

  bindAuthEvents() {
    document.addEventListener('submit', (event) => {
      if (event.target && event.target.id === 'findme-login-form') {
        event.preventDefault();
        const email = document.getElementById('findme-login-email')?.value?.trim();
        const name = document.getElementById('findme-login-name')?.value?.trim() || 'Member';
        if (!email) return;
        this.login(email, name, 'member');
        this.renderAccountPanel();
        this.renderStatus();
        this.reRenderAccessBanner();
      }
    });

    document.addEventListener('click', (event) => {
      if (event.target && event.target.matches('[data-app-upgrade]')) {
        this.subscribe('Forensic Explorer');
        this.renderAccountPanel();
        this.renderStatus();
        this.reRenderAccessBanner();
      }

      if (event.target && event.target.matches('[data-app-logout]')) {
        this.logout();
        this.renderAccountPanel();
        this.renderStatus();
        this.reRenderAccessBanner();
      }
    });
  },

  reRenderAccessBanner() {
    const banner = document.getElementById('access-banner');
    if (!banner) return;

    const state = this.get();
    if (state.subscribed) {
      banner.innerHTML = '<strong>Subscriber access active.</strong> Your workspace is unlocked.';
      banner.style.display = 'block';
      return;
    }

    banner.innerHTML = 'Demo access active. Upgrade for full research workspace access.';
    banner.style.display = 'block';
  },
};

window.AppState = AppState;
window.PLAN_CATALOG = PLAN_CATALOG;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    AppState.ensure();
    AppState.bindAuthEvents();
    AppState.renderStatus();
    AppState.renderAccountPanel();
    AppState.reRenderAccessBanner();
  });
}
