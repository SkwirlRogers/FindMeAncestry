/** ScoutAI shared chat component. Message content is rendered as text, never HTML. */
class ScoutChat {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      surnameContext: options.surnameContext || null,
      showQuickActions: options.showQuickActions !== false,
      storageKey: options.storageKey || 'scout_chat_history',
      isSubscribed: false,
      onMessage: options.onMessage || null
    };
    try {
      const saved = JSON.parse(localStorage.getItem(this.options.storageKey) || '[]');
      this.history = Array.isArray(saved) ? saved.slice(-50) : [];
    } catch { this.history = []; }
    this.render();
    this.restoreHistory();
  }

  render() {
    this.container.innerHTML = `
      <div class="scout-chat-panel">
        <div class="scout-chat-header"><span class="scout-avatar">🕵️‍♂️</span><div><div class="scout-name">Scout "Roots" Patterson</div><div class="scout-role">Private Family Detective</div></div></div>
        ${this.options.showQuickActions ? `<div class="scout-quick-actions" id="scoutQuickActions">
          <button class="quick-action-btn" data-action="explain-origin">📜 Explain Origin</button><button class="quick-action-btn" data-action="find-variants">🧬 Find Variants</button><button class="quick-action-btn" data-action="migration-flow">🗺️ Migration Flow</button><button class="quick-action-btn" data-action="frequency-timeline">📊 Frequency Timeline</button><button class="quick-action-btn" data-action="notable-bearers">🏛️ Notable Bearers</button><button class="quick-action-btn" data-action="dna-haplogroups">🧬 DNA Haplogroups</button><button class="quick-action-btn" data-action="generate-report">📄 Generate Report</button>
        </div>` : ''}
        <div class="scout-chat-messages" id="scoutChatMessages"></div>
        <form class="scout-chat-input" id="scoutChatForm"><input type="text" id="scoutChatInput" placeholder="Ask Scout about surnames, origins, records..." autocomplete="off"><button type="submit" class="btn btn-accent">Send</button></form>
      </div>`;
    this.messagesEl = this.container.querySelector('#scoutChatMessages');
    this.formEl = this.container.querySelector('#scoutChatForm');
    this.inputEl = this.container.querySelector('#scoutChatInput');
    this.formEl.addEventListener('submit', e => { e.preventDefault(); this.sendMessage(); });
    this.container.querySelectorAll('.quick-action-btn').forEach(btn => btn.addEventListener('click', () => this.sendQuickAction(btn.dataset.action)));
  }

  restoreHistory() { for (const msg of this.history) this.appendMessage(msg.role, msg.text, false); }

  appendMessage(role, text, save = true) {
    const div = document.createElement('div');
    div.className = `scout-msg scout-msg-${role === 'user' ? 'user' : 'scout'}`;
    div.textContent = String(text ?? '');
    this.messagesEl.appendChild(div);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    if (save) {
      this.history.push({ role, text: String(text ?? ''), time: Date.now() });
      this.history = this.history.slice(-50);
      try { localStorage.setItem(this.options.storageKey, JSON.stringify(this.history)); } catch {}
    }
  }

  async sendMessage() {
    const text = this.inputEl.value.trim();
    if (!text) return;
    this.inputEl.value = '';
    this.appendMessage('user', text);
    const typing = document.createElement('div');
    typing.className = 'scout-msg scout-msg-scout';
    typing.textContent = 'Scout is analyzing records & historical databases...';
    this.messagesEl.appendChild(typing);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    try {
      let prompt = text;
      if (this.options.surnameContext) {
        const c = this.options.surnameContext;
        prompt = `[SURNAME RESEARCH MODE]\nActive Surname: ${c.surname}\nSoundex: ${c.soundex}\nVariants: ${(c.variants || []).join(', ')}\nUser Query: ${text}`;
      }
      const response = await fetch('/api/scout/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: prompt }) });
      const data = await response.json();
      typing.remove();
      this.appendMessage('scout', data.reply || data.error || 'Scout encountered an issue. Please try again.');
    } catch {
      typing.remove();
      this.appendMessage('scout', 'Network error. Please check your connection and try again.');
    }
  }

  sendQuickAction(action) {
    const s = this.options.surnameContext?.surname || '';
    const prompts = {
      'explain-origin': `Explain the etymology and origin history of the surname "${s}".`,
      'find-variants': `List spelling variants, cognates, and Soundex codes for the surname "${s}".`,
      'migration-flow': `Trace the documented migration history of the surname "${s}". Distinguish evidence from hypotheses.`,
      'frequency-timeline': `Summarize available frequency trends for the surname "${s}" and cite source limitations.`,
      'notable-bearers': `Identify notable bearers of the surname "${s}" with verifiable sources.`,
      'dna-haplogroups': `Explain what can and cannot be inferred about DNA haplogroups for the surname "${s}".`,
      'generate-report': `Create a sourced one-name study outline for the surname "${s}".`
    };
    this.inputEl.value = prompts[action] || `Tell me about the surname "${s}".`;
    this.sendMessage();
  }
  updateContext(newContext) { this.options.surnameContext = newContext; }
}
if (typeof module !== 'undefined') module.exports = ScoutChat;
