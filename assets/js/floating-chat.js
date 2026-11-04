// Unified Scout launcher: the floating entry point opens the full Scout workspace,
// including its service/research sidebar. The embedded page suppresses this launcher.
(function () {
  const params = new URLSearchParams(window.location.search);
  if (params.get('embed') === '1' || window.self !== window.top) return;
  if (document.getElementById('floating-chat-widget')) return;

  const style = document.createElement('style');
  style.textContent = `
    #floating-chat-widget{position:fixed;right:22px;bottom:22px;z-index:1200;width:58px;height:58px;border:0;border-radius:50%;display:grid;place-items:center;background:var(--clr-primary,#172554);color:#fff;box-shadow:0 8px 28px rgba(0,0,0,.25);cursor:pointer}
    #floating-chat-widget svg{width:27px;height:27px}
    #floating-chat-modal{position:fixed;right:20px;bottom:92px;z-index:1199;width:min(980px, calc(100vw - 40px));height:min(720px, calc(100vh - 120px));background:var(--clr-surface,#fff);border:1px solid var(--clr-border,#dbe4ee);border-radius:16px;box-shadow:0 18px 60px rgba(0,0,0,.28);overflow:hidden;display:none}
    #floating-chat-modal.open{display:block}
    #floating-chat-modal iframe{display:block;width:100%;height:100%;border:0;background:#fff}
    @media(max-width:700px){#floating-chat-modal{inset:8px;width:auto;height:auto;bottom:8px;border-radius:12px}#floating-chat-widget{right:16px;bottom:16px}}
  `;
  document.head.appendChild(style);

  const launcher = document.createElement('button');
  launcher.id = 'floating-chat-widget';
  launcher.type = 'button';
  launcher.setAttribute('aria-label', 'Open ScoutAI workspace');
  launcher.title = 'Open ScoutAI workspace';
  launcher.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></svg>';

  const modal = document.createElement('section');
  modal.id = 'floating-chat-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-label', 'ScoutAI chat and research services');
  const frame = document.createElement('iframe');
  frame.title = 'ScoutAI full workspace with research services';
  frame.src = '/scout_chat.html?embed=1';
  frame.loading = 'lazy';
  modal.appendChild(frame);

  function close() {
    modal.classList.remove('open');
    launcher.setAttribute('aria-expanded', 'false');
  }
  launcher.addEventListener('click', () => {
    const opening = !modal.classList.contains('open');
    modal.classList.toggle('open', opening);
    launcher.setAttribute('aria-expanded', String(opening));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
  });
  document.body.append(launcher, modal);
})();
