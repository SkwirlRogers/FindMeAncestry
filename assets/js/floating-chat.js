// FindMeAncestry floating agent launchers.
// Scout opens the existing full Scout workspace (including every original tab and sidebar).
// Kayla opens her own asset-focused workspace. Kayla's launcher appears on the homepage only.
(function () {
  if (new URLSearchParams(window.location.search).get('embed') === '1') return;
  if (document.getElementById('fma-agent-launchers')) return;

  const isHome = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
  const root = document.createElement('div');
  root.id = 'fma-agent-launchers';
  document.body.appendChild(root);

  const style = document.createElement('style');
  style.textContent = `
    .fma-agent-fab{position:fixed;bottom:20px;width:60px;height:60px;border:0;border-radius:50%;color:#fff;font-size:25px;cursor:pointer;z-index:10001;box-shadow:0 4px 16px rgba(0,0,0,.24);display:flex;align-items:center;justify-content:center}
    .fma-agent-fab:focus-visible{outline:3px solid #fbbf24;outline-offset:3px}
    .fma-scout-fab{right:20px;background:var(--clr-primary,#17324d)}
    .fma-kayla-fab{left:20px;background:linear-gradient(135deg,#0e4d6e,#1a759f)}
    .fma-agent-modal{position:fixed;inset:3vh 2vw;width:96vw;height:94vh;display:none;background:var(--clr-surface,#fff);border:2px solid var(--clr-accent,#d5a928);border-radius:14px;overflow:hidden;z-index:10002;box-shadow:0 12px 48px rgba(0,0,0,.35)}
    .fma-agent-modal.open{display:block}
    .fma-agent-modal iframe{display:block;width:100%;height:100%;border:0;background:#fff}
    .fma-agent-close{position:absolute;top:8px;right:10px;z-index:2;width:38px;height:38px;border:0;border-radius:50%;background:#172b4d;color:#fff;font-size:22px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25)}
    @media(max-width:700px){.fma-agent-modal{inset:0;width:100vw;height:100dvh;border:0;border-radius:0}.fma-agent-fab{bottom:16px;width:54px;height:54px}.fma-scout-fab{right:14px}.fma-kayla-fab{left:14px}}
  `;
  document.head.appendChild(style);

  function addAgent({id,label,icon,side,url,className}) {
    const button=document.createElement('button');
    button.type='button';button.id=id+'-launcher';button.className='fma-agent-fab '+className;
    button.textContent=icon;button.setAttribute('aria-label','Open '+label+' chat');button.title='Chat with '+label;
    const modal=document.createElement('section');
    modal.id=id+'-modal';modal.className='fma-agent-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-label',label+' chat');modal.setAttribute('aria-modal','true');
    const close=document.createElement('button');close.type='button';close.className='fma-agent-close';close.textContent='×';close.setAttribute('aria-label','Close '+label+' chat');
    const frame=document.createElement('iframe');frame.title=label+' full chat workspace';frame.src=url;
    close.addEventListener('click',()=>{modal.classList.remove('open');button.focus();});
    button.addEventListener('click',()=>{
      document.querySelectorAll('.fma-agent-modal.open').forEach(el=>el.classList.remove('open'));
      modal.classList.add('open');
    });
    modal.append(close,frame);root.append(button,modal);
  }

  addAgent({id:'fma-scout',label:'ScoutAI',icon:'🕵️',side:'right',url:'scout_chat.html?embed=1',className:'fma-scout-fab'});
  if(isHome){
    addAgent({id:'fma-kayla',label:'KaylaAI',icon:'💼',side:'left',url:'kayla_chat.html?embed=1',className:'fma-kayla-fab'});
  }
})();
