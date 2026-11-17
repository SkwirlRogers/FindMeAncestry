// FindMeAncestry site-wide assistant launchers.
// Scout is the genealogy, DNA, family-history and records research assistant.
// Assettie AI is the CeeYoAssets asset-intelligence assistant.
// Each assistant keeps its own existing workspace and in-page conversation state.
(function () {
  if (new URLSearchParams(window.location.search).get('embed') === '1') return;
  if (document.getElementById('fma-agent-launchers')) return;

  const root = document.createElement('div');
  root.id = 'fma-agent-launchers';
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', 'FindMeAncestry assistant launchers');
  document.body.appendChild(root);

  const style = document.createElement('style');
  style.id = 'fma-agent-orb-styles';
  style.textContent = `
    #fma-agent-launchers{position:relative;z-index:10001}
    .fma-agent-fab{position:fixed;bottom:20px;width:82px;height:88px;padding:0;border:0;background:transparent;color:#fff;cursor:pointer;z-index:10001;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px}
    .fma-agent-fab:focus-visible{outline:3px solid #fbbf24;outline-offset:5px;border-radius:18px}
    .fma-scout-fab{right:18px}
    .fma-assettie-fab{left:18px}
    .fma-orb{position:relative;display:block;width:62px;height:62px;flex:none;border-radius:50%;border:1px solid rgba(255,235,190,.75);background:radial-gradient(circle at 32% 25%,#fff8df 0,#f4dfad 8%,#d7b56b 26%,#9c7540 54%,#50665a 82%,#263c36 100%);box-shadow:0 0 0 5px rgba(210,176,112,.12),0 0 24px rgba(185,145,77,.72),0 0 54px rgba(94,126,104,.28),inset -8px -10px 18px rgba(29,38,31,.42);animation:fma-orb-float 5.5s ease-in-out infinite}
    .fma-orb:before{content:"";position:absolute;top:25px;left:21px;width:6px;height:8px;border-radius:50%;background:#382e27;box-shadow:14px 0 0 #382e27,1px 1px 0 1px rgba(255,255,255,.35)}
    .fma-orb:after{content:"";position:absolute;left:22px;bottom:15px;width:18px;height:9px;border-bottom:2.5px solid #382e27;border-radius:0 0 50% 50%}
    .fma-assettie-orb{border-color:rgba(199,246,255,.9);background:radial-gradient(circle at 32% 25%,#f0fdff 0,#b9f1f7 10%,#55c4d7 30%,#2089a8 58%,#17516e 84%,#102d49 100%);box-shadow:0 0 0 5px rgba(63,181,207,.13),0 0 24px rgba(42,172,201,.72),0 0 54px rgba(31,117,165,.32),inset -8px -10px 18px rgba(12,40,62,.42)}
    .fma-assettie-fab:hover .fma-assettie-orb{box-shadow:0 0 0 6px rgba(63,181,207,.2),0 0 30px rgba(42,190,220,.9),0 0 64px rgba(31,117,165,.44),inset -8px -10px 18px rgba(12,40,62,.42)}
    .fma-scout-fab:hover .fma-orb:not(.fma-assettie-orb){box-shadow:0 0 0 6px rgba(210,176,112,.18),0 0 30px rgba(211,171,94,.9),0 0 64px rgba(94,126,104,.4),inset -8px -10px 18px rgba(29,38,31,.42)}
    .fma-orb-label{display:block;padding:2px 9px;border:1px solid rgba(232,205,153,.32);border-radius:999px;background:rgba(25,37,34,.94);color:#fff8e8;font:700 11px/1.35 system-ui,sans-serif;letter-spacing:.04em;text-shadow:0 1px 2px rgba(0,0,0,.35);white-space:nowrap}
    .fma-assettie-fab .fma-orb-label{border-color:rgba(148,222,237,.42);background:rgba(13,48,69,.96);color:#e9fbff}
    .fma-agent-modal{position:fixed;inset:3vh 2vw;width:96vw;height:94vh;display:none;background:var(--clr-surface,#fff);border:2px solid var(--clr-accent,#d5a928);border-radius:14px;overflow:hidden;z-index:10002;box-shadow:0 12px 48px rgba(0,0,0,.35)}
    .fma-agent-modal.open{display:block}
    .fma-agent-modal iframe{display:block;width:100%;height:100%;border:0;background:#fff}
    .fma-agent-close{position:absolute;top:8px;right:10px;z-index:3;width:40px;height:40px;border:0;border-radius:50%;background:#172b4d;color:#fff;font-size:24px;line-height:1;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25)}
    .fma-agent-close:focus-visible{outline:3px solid #d4af37;outline-offset:3px}
    @keyframes fma-orb-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @media(prefers-reduced-motion:reduce){.fma-orb{animation:none;transition:none}}
    @media(max-width:700px){.fma-agent-modal{inset:0;width:100vw;height:100dvh;border:0;border-radius:0}.fma-agent-fab{bottom:14px}.fma-scout-fab{right:8px}.fma-assettie-fab{left:8px}}
  `;
  document.head.appendChild(style);

  function addAgent({ id, label, url, className, orbClass }) {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = id + '-launcher';
    button.className = 'fma-agent-fab ' + className;
    button.setAttribute('aria-label', 'Open ' + label + ' assistant');
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-expanded', 'false');
    button.title = 'Chat with ' + label;

    const face = document.createElement('span');
    face.className = 'fma-orb ' + orbClass;
    face.setAttribute('aria-hidden', 'true');
    const visibleLabel = document.createElement('span');
    visibleLabel.className = 'fma-orb-label';
    visibleLabel.textContent = label;
    button.append(face, visibleLabel);

    const modal = document.createElement('section');
    modal.id = id + '-modal';
    modal.className = 'fma-agent-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', label + ' workspace');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'fma-agent-close';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Close ' + label + ' workspace');

    const frame = document.createElement('iframe');
    frame.title = label + ' full workspace';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.dataset.src = url;

    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      button.setAttribute('aria-expanded', 'false');
      button.focus();
    }

    close.addEventListener('click', closeModal);
    button.addEventListener('click', () => {
      document.querySelectorAll('.fma-agent-modal.open').forEach((el) => {
        el.classList.remove('open');
        el.setAttribute('aria-hidden', 'true');
      });
      document.querySelectorAll('.fma-agent-fab[aria-expanded="true"]').forEach((el) => {
        el.setAttribute('aria-expanded', 'false');
      });
      if (!frame.dataset.loaded) {
        frame.src = frame.dataset.src;
        frame.dataset.loaded = 'true';
      }
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      button.setAttribute('aria-expanded', 'true');
      close.focus();
    });

    modal.append(close, frame);
    root.append(button, modal);
  }

  addAgent({
    id: 'fma-scout',
    label: 'Scout',
    url: '/scout_chat.html?embed=1',
    className: 'fma-scout-fab',
    orbClass: 'fma-scout-orb'
  });

  addAgent({
    id: 'fma-assettie',
    label: 'Assettie AI',
    url: '/assetie_chat.html?embed=1',
    className: 'fma-assettie-fab',
    orbClass: 'fma-assettie-orb'
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const active = document.querySelector('.fma-agent-modal.open');
    if (!active) return;
    const close = active.querySelector('.fma-agent-close');
    if (close) close.click();
  });
})();
