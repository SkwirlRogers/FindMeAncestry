const WorkspaceGate = {
  apply() {
    const state = SessionState.get();
    const banner = document.getElementById('access-banner');
    const dashboard = document.getElementById('dashboardWorkspace');
    const scoutInput = document.getElementById('dashboardInput');

    if (state.subscribed) {
      if (banner) {
        banner.style.display = 'block';
        banner.textContent = 'Subscriber access active. Workspace unlocked.';
      }
      if (scoutInput) {
        scoutInput.disabled = false;
        scoutInput.placeholder = 'Ask Scout about your selected ancestor...';
      }
      return;
    }

    if (banner) {
      banner.style.display = 'block';
      banner.textContent = 'Demo access active. Upgrade to unlock the full workspace.';
    }

    if (dashboard) {
      dashboard.style.opacity = '0.72';
    }

    if (scoutInput) {
      scoutInput.disabled = true;
      scoutInput.placeholder = 'Upgrade to unlock ScoutAI';
    }
  },

  bindUpgrade() {
    document.addEventListener('click', (event) => {
      const target = event.target.closest('[data-upgrade-plan]');
      if (!target) return;
      SessionState.subscribe(target.dataset.upgradePlan || 'Forensic Explorer');
      this.apply();
    });
  }
};

window.WorkspaceGate = WorkspaceGate;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    WorkspaceGate.apply();
    WorkspaceGate.bindUpgrade();
  });
}
