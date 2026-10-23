// Floating Chat Widget for FindMeAncestry
(function () {
  function init() {
    if (document.getElementById('floating-chat-widget')) return;
    const widget = document.createElement('button');
    widget.type = 'button';
    widget.id = 'floating-chat-widget';
    widget.title = 'Chat with ScoutAI';
    widget.setAttribute('aria-label', 'Open ScoutAI chat');
    widget.setAttribute('aria-expanded', 'false');
    widget.setAttribute('aria-controls', 'floating-chat-modal');
    Object.assign(widget.style, {position:'fixed', bottom:'20px', right:'20px', zIndex:'1000', background:'var(--clr-primary)', border:'0', borderRadius:'50%', width:'56px', height:'56px', padding:'16px', boxShadow:'0 4px 12px rgba(0,0,0,0.15)', cursor:'pointer'});
    widget.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M12 3C6.48 3 2 6.92 2 11.5c0 2.54 1.5 4.81 3.89 6.32-.2 1.12-.86 2.79-2.06 3.68 1.93-.02 3.53-.77 4.64-1.58 1.07.31 2.22.48 3.43.48 5.52 0 10-3.92 10-8.5S17.52 3 12 3z"/></svg>';
    const panel = document.createElement('section');
    panel.id = 'floating-chat-modal';
    panel.setAttribute('aria-label', 'ScoutAI chat');
    panel.hidden = true;
    Object.assign(panel.style, {position:'fixed', bottom:'88px', right:'min(20px, 4vw)', width:'min(340px, 92vw)', height:'min(400px, calc(100dvh - 108px))', maxHeight:'calc(100vh - 108px)', background:'var(--clr-surface)', border:'1px solid var(--clr-border)', borderRadius:'8px', boxShadow:'0 4px 12px rgba(0,0,0,0.2)', display:'none', flexDirection:'column', overflow:'hidden', zIndex:'1000'});
    panel.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px;background:var(--clr-primary);color:white;"><span>ScoutAI Chat</span><button type="button" data-chat-close aria-label="Close ScoutAI chat" style="min-width:44px;min-height:44px;border:1px solid white;border-radius:4px;background:transparent;color:white;cursor:pointer;">Close</button></div><div data-chat-messages role="log" aria-live="polite" aria-relevant="additions" aria-label="Chat messages" style="flex:1;min-height:0;overflow-y:auto;padding:8px;font-size:0.9rem;overflow-wrap:anywhere;"></div><form data-chat-form style="display:flex;padding:8px;gap:4px;"><input data-chat-input type="text" aria-label="Message ScoutAI" placeholder="Type a message..." style="flex:1;min-width:0;padding:8px;font-size:16px;"><button type="submit" data-chat-send style="padding:8px;min-height:44px;">Send</button></form>`;
    document.body.append(widget, panel);
    const input = panel.querySelector('[data-chat-input]');
    const send = panel.querySelector('[data-chat-send]');
    const messages = panel.querySelector('[data-chat-messages]');
    let pending = false;
    function setOpen(open, restoreFocus) {
      panel.hidden = !open;
      panel.style.display = open ? 'flex' : 'none';
      widget.setAttribute('aria-expanded', String(open));
      widget.setAttribute('aria-label', open ? 'Close ScoutAI chat' : 'Open ScoutAI chat');
      if (open) input.focus();
      else if (restoreFocus) widget.focus();
    }
    widget.addEventListener('click', () => setOpen(panel.hidden, false));
    panel.querySelector('[data-chat-close]').addEventListener('click', () => setOpen(false, true));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden && (panel.contains(document.activeElement) || document.activeElement === widget)) {
        event.preventDefault();
        setOpen(false, true);
      }
    });
    function appendMessage(text, fromUser) {
      const el = document.createElement('div');
      el.textContent = (fromUser ? 'You: ' : 'ScoutAI: ') + text;
      Object.assign(el.style, {marginBottom:'6px', textAlign:fromUser ? 'right' : 'left', color:fromUser ? 'var(--clr-primary)' : 'var(--clr-text)'});
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
    }
    panel.querySelector('[data-chat-form]').addEventListener('submit', async event => {
      event.preventDefault();
      const message = input.value.trim();
      if (!message || pending) return;
      pending = true;
      send.disabled = true;
      send.textContent = 'Sending…';
      appendMessage(message, true);
      input.value = '';
      try {
        const response = await fetch('/api/scout/chat', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message})});
        if (!response.ok) throw new Error('Chat request failed');
        const data = await response.json();
        appendMessage(typeof data.reply === 'string' && data.reply.trim() ? data.reply : 'No reply was received. Please try again.', false);
      } catch (error) {
        appendMessage('Unable to contact ScoutAI. Please try again. Your message has been restored when possible.', false);
        if (!input.value) input.value = message;
      } finally {
        pending = false;
        send.disabled = false;
        send.textContent = 'Send';
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
