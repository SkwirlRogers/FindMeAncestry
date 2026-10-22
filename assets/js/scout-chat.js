/**
 * ScoutAI Shared Chat Component
 * Reusable chat panel with surname context injection
 * Usage: const chat = new ScoutChat(document.getElementById('chat-container'), { surnameContext: {...} });
 */
class ScoutChat {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      surnameContext: options.surnameContext || null,
      showQuickActions: options.showQuickActions !== false,
      storageKey: options.storageKey || 'scout_chat_history',
      isSubscribed: options.isSubscribed || false,
      onMessage: options.onMessage || null
    };
    this.history = JSON.parse(localStorage.getItem(this.options.storageKey) || '[]');
    this.render();
    this.restoreHistory();
  }

  render() {
    this.container.innerHTML = `
      <div class="scout-chat-panel">
        <div class="scout-chat-header">
          <span class="scout-avatar">🕵️‍♂️</span>
          <div>
            <div class="scout-name">Scout "Roots" Patterson</div>
            <div class="scout-role">Private Family Detective</div>
          </div>
        </div>
        ${this.options.showQuickActions ? `
        <div class="scout-quick-actions" id="scoutQuickActions">
          <button class="quick-action-btn" data-action="explain-origin">📜 Explain Origin</button>
          <button class="quick-action-btn" data-action="find-variants">🧬 Find Variants</button>
          <button class="quick-action-btn" data-action="migration-flow">🗺️ Migration Flow</button>
          <button class="quick-action-btn" data-action="frequency-timeline">📊 Frequency Timeline</button>
          <button class="quick-action-btn" data-action="notable-bearers">🏛️ Notable Bearers</button>
          <button class="quick-action-btn" data-action="dna-haplogroups">🧬 DNA Haplogroups</button>
          <button class="quick-action-btn" data-action="generate-report">📄 Generate Report</button>
        </div>` : ''}
        <div class="scout-chat-messages" id="scoutChatMessages"></div>
        <form class="scout-chat-input" id="scoutChatForm">
          <input type="text" id="scoutChatInput" placeholder="Ask Scout about surnames, origins, records..." autocomplete="off">
          <button type="submit" class="btn btn-accent">Send</button>
        </form>
      </div>
    `;
    this.messagesEl = this.container.querySelector('#scoutChatMessages');
    this.formEl = this.container.querySelector('#scoutChatForm');
    this.inputEl = this.container.querySelector('#scoutChatInput');
    this.formEl.addEventListener('submit', (e) => { e.preventDefault(); this.sendMessage(); });
    this.container.querySelectorAll('.quick-action-btn').forEach(btn => {
      btn.addEventListener('click', () => this.sendQuickAction(btn.dataset.action));
    });
  }

  restoreHistory() {
    for (const msg of this.history) {
      this.appendMessage(msg.role, msg.text, false);
    }
  }

  appendMessage(role, text, save = true) {
    const div = document.createElement('div');
    div.className = `scout-msg scout-msg-${role}`;
    div.innerHTML = text;
    this.messagesEl.appendChild(div);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    if (save) {
      this.history.push({ role, text, time: Date.now() });
      if (this.history.length > 50) this.history = this.history.slice(-50);
      localStorage.setItem(this.options.storageKey, JSON.stringify(this.history));
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
        prompt = `[SURNAME RESEARCH MODE]\nActive Surname: ${this.options.surnameContext.surname}\nSoundex: ${this.options.surnameContext.soundex}\nVariants: ${(this.options.surnameContext.variants || []).join(', ')}\nNC Records: ${this.options.surnameContext.nc_data ? this.options.surnameContext.nc_data.total_records : 0} records\nTop Counties: ${this.options.surnameContext.nc_data && this.options.surnameContext.nc_data.top_counties ? this.options.surnameContext.nc_data.top_counties.slice(0,3).map(c => c.county + '(' + c.count + ')').join(', ') : 'N/A'}\nBirth Range: ${this.options.surnameContext.nc_data ? (this.options.surnameContext.nc_data.earliest_birth || '?') + '-' + (this.options.surnameContext.nc_data.latest_birth || '?') : 'N/A'}\n\nBehindTheName Analysis Framework - analyze across ALL dimensions:\n1. ETYMOLOGY & CLASSIFICATION (origin, meaning, type: patronymic/occupational/locative/topographic)\n2. HISTORICAL FORMS (earliest attestations, spelling evolution)\n3. GEOGRAPHIC DISTRIBUTION (origin region, migration, current concentrations)\n4. FREQUENCY & RANK (census rankings, trends over time)\n5. VARIANTS & COGNATES (spelling variants, Soundex, DMetaphone)\n6. BEARERS & NOTABLES (historical figures, population stats)\n7. CULTURAL CONTEXT (naming customs, traditions)\n8. GENETIC GENEALOGY (associated Y-DNA/mtDNA haplogroups, surname DNA projects)\n\nUser Query: ${text}`;
      }

      const response = await fetch('/api/scout/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, isSubscribed: this.options.isSubscribed })
      });
      const data = await response.json();
      this.messagesEl.removeChild(typing);
      this.appendMessage('scout', data.reply || 'Scout encountered an issue. Please try again.');
    } catch (err) {
      this.messagesEl.removeChild(typing);
      this.appendMessage('scout', 'Network error. Please check your connection and try again.');
    }
  }

  sendQuickAction(action) {
    const s = this.options.surnameContext ? this.options.surnameContext.surname : '';
    const prompts = {
      'explain-origin': `Explain the complete etymology and origin history of the surname "${s}". Classify the naming type (patronymic, occupational, locative, topographic, etc.) and trace its earliest known forms.`,
      'find-variants': `List all spelling variants, cognates, and related forms of the surname "${s}". Include Soundex codes and any international equivalents.`,
      'migration-flow': `Map the complete migration history of the surname "${s}". Where did it originate? What are the major settlement areas? Show migration paths over time.`,
      'frequency-timeline': `Show the frequency trend of the surname "${s}" from 1700 to present. Include US census rankings, birth decade distribution, and population statistics.`,
      'notable-bearers': `List notable historical and modern bearers of the surname "${s}". Include fields of achievement and approximate dates.`,
      'dna-haplogroups': `What Y-DNA and mtDNA haplogroups are commonly associated with the surname "${s}"? List any active surname DNA projects.`,
      'generate-report': `Generate a comprehensive One-Name Study report for the surname "${s}" using the BehindTheName framework. Include etymology, variants, geography, frequency, migration, cultural context, and DNA information.`
    };
    this.inputEl.value = prompts[action] || `Tell me about the surname "${s}"`;
    this.sendMessage();
  }

  updateContext(newContext) {
    this.options.surnameContext = newContext;
  }
}

if (typeof module !== 'undefined') module.exports = ScoutChat;
