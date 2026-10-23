// Floating Chat Widget for FindMeAncestry
(function(){
  const widget = document.createElement('div');
  widget.id = 'floating-chat-widget';
  widget.style.position = 'fixed';
  widget.style.bottom = '20px';
  widget.style.right = '20px';
  widget.style.zIndex = '1000';
  widget.style.background = 'var(--clr-primary)';
  widget.style.borderRadius = '50%';
  widget.style.width = '56px';
  widget.style.height = '56px';
  widget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  widget.style.cursor = 'pointer';
  widget.title = 'Chat with ScoutAI';
  widget.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24" height="24" style="margin:16px;"><path d="M12 3C6.48 3 2 6.92 2 11.5c0 2.54 1.5 4.81 3.89 6.32-.2 1.12-.86 2.79-2.06 3.68 1.93-.02 3.53-.77 4.64-1.58 1.07.31 2.22.48 3.43.48 5.52 0 10-3.92 10-8.5S17.52 3 12 3z"/></svg>';
  document.body.appendChild(widget);

  const modal = document.createElement('div');
  modal.id = 'floating-chat-modal';
  modal.style.position = 'fixed';
  modal.style.bottom = '80px';
  modal.style.right = '20px';
  modal.style.width = '300px';
  modal.style.maxHeight = '400px';
  modal.style.background = 'var(--clr-surface)';
  modal.style.border = '1px solid var(--clr-border)';
  modal.style.borderRadius = '8px';
  modal.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
  modal.style.display = 'none';
  modal.style.flexDirection = 'column';
  modal.style.zIndex = '1000';
  modal.innerHTML = `
    <div style="padding:8px;background:var(--clr-primary);color:white;border-top-left-radius:8px;border-top-right-radius:8px;">
      ScoutAI Chat
    </div>
    <div id="chat-messages" style="flex:1;overflow-y:auto;padding:8px;font-size:0.9rem;"></div>
    <div style="display:flex;padding:8px;gap:4px;">
      <input id="chat-input" type="text" placeholder="Type a message..." style="flex:1;padding:4px;" />
      <button id="chat-send" style="padding:4px 8px;">Send</button>
    </div>
  `;
  document.body.appendChild(modal);

  widget.addEventListener('click', () => {
    modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
  });

  document.getElementById('chat-send').addEventListener('click', sendMessage);
  document.getElementById('chat-input').addEventListener('keypress', (e)=>{ if(e.key==='Enter') sendMessage(); });

  function appendMessage(text, fromUser){
    const el = document.createElement('div');
    el.textContent = text;
    el.style.marginBottom='6px';
    el.style.textAlign = fromUser ? 'right' : 'left';
    el.style.color = fromUser ? 'var(--clr-primary)' : 'var(--clr-text)';
    document.getElementById('chat-messages').appendChild(el);
    el.scrollIntoView({behavior:'smooth'});
  }

  async function sendMessage(){
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if(!msg) return;
    appendMessage(msg, true);
    input.value='';
    try {
      const resp = await fetch('/api/scout/chat', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({message:msg})
      });
      const data = await resp.json();
      appendMessage(data.reply || '...');
    } catch(e){
      appendMessage('Error contacting ScoutAI', false);
    }
  }
})();
