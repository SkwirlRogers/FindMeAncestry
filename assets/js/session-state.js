const SESSION_KEY = 'findme_session_v1';

const SessionState = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
    } catch {
      return {};
    }
  },

  set(data) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  },

  login(email, name) {
    const state = this.get();
    state.user = { email, name };
    state.plan = state.plan || 'demo';
    state.subscribed = !!state.subscribed;
    this.set(state);
    return state;
  },

  subscribe(plan = 'Forensic Explorer') {
    const state = this.get();
    state.plan = plan;
    state.subscribed = true;
    this.set(state);
    return state;
  },

  logout() {
    this.set({ user: null, plan: 'demo', subscribed: false });
  },

  isSubscribed() {
    return !!this.get().subscribed;
  },

  hasAccess(feature) {
    const state = this.get();
    if (feature === 'dashboard') {
      return state.subscribed || state.plan === 'Forensic Explorer';
    }
    return true;
  }
};

window.SessionState = SessionState;
