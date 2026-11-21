(() => {
  const CHAT_API = "https://fybf-orb-chat.skwirlynuts-nutteros.workers.dev/chat";
  const people = {
    scout: {
      name: "Scout",
      role: "Genealogy · DNA education · Family history",
      greeting: "Hello, I’m Scout. I can help you plan genealogy research, understand DNA-match concepts, evaluate historical records, and organize family-history evidence. I do not access private family files from this public chat.",
      page: "/fru-skwirl-legacy-library.html",
      link: "Open the FRU Legacy Library",
      extraPage: "/nationalarchives/index.html",
      extraLink: "Open National Archives & Deep Research"
    },
    assettie: {
      name: "Assettie",
      role: "CeeYoAssets · Unclaimed property · Estate research",
      greeting: "Hello, I’m Assettie. I can guide you through responsible unclaimed-property research, official agency resources, estate documentation, and next steps. I do not search private assets or determine legal ownership in this public chat.",
      page: "/ceeyoassets.html",
      link: "Open CeeYoAssets"
    }
  };
  const histories = { scout: [], assettie: [] };
  let active = null;
  let voiceReplies = false;
  let recognition = null;

  // FYBF owns its two-orb experience. Prevent the shared Library widget from
  // rendering a second set of cross-site assistants on this domain.
  window.__SR_ORBCORE_V1__ = true;
  document.getElementById("sr-orbcore")?.remove();
  document.getElementById("sr-orbcore-panel")?.remove();

  const oldDock = document.querySelector(".orb-dock");
  const dock = oldDock || document.createElement("div");
  dock.id = "fybf-agent-dock";
  dock.className = "fybf-agent-dock";
  if (!oldDock) document.body.appendChild(dock);

  document.getElementById("fybf-agent-style")?.remove();
  const style = document.createElement("style");
  style.id = "fybf-agent-style";
  style.textContent = `
    .fybf-agent-dock{position:fixed;right:18px;bottom:18px;z-index:2147483000;display:flex;align-items:flex-end;gap:12px}
    .fybf-agent-orb{--orb:#d9b66d;--orb2:#8e652c;position:relative;width:66px;height:66px;border:1px solid #ffffffaa;border-radius:50%;padding:0;cursor:pointer;isolation:isolate;background:radial-gradient(circle at 31% 23%,#fff 0 3%,#fff4d7 8%,var(--orb) 39%,var(--orb2) 80%,#101827 115%);box-shadow:0 8px 28px #0007,inset -8px -9px 18px #0005,inset 5px 6px 13px #fff9;animation:fybf-orb-float 5.8s ease-in-out infinite;transition:transform .2s}
    .fybf-agent-orb:hover{transform:translateY(-5px) scale(1.04)}
    .fybf-agent-orb[data-persona="assettie"]{--orb:#8de4f4;--orb2:#197d9b;animation-delay:-1.8s}
    .fybf-agent-orb:after{content:attr(data-name);position:absolute;left:50%;bottom:-20px;transform:translateX(-50%);font:800 10px/1.2 system-ui,sans-serif;color:#fff;text-shadow:0 1px 5px #000;white-space:nowrap}
    .fybf-agent-face{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8%;pointer-events:none}
    .fybf-agent-eyes{display:flex;gap:10px;transform:translate(var(--gx,0px),var(--gy,0px));transition:transform .12s}
    .fybf-agent-eye{width:9px;height:14px;border-radius:50%;background:#faffff;box-shadow:0 0 0 1px #17324c88;position:relative;overflow:hidden;animation:fybf-blink 6s infinite}
    .fybf-agent-eye:after{content:"";position:absolute;width:45%;height:55%;left:35%;top:27%;border-radius:50%;background:#102b4a}
    .fybf-agent-mouth{width:10px;height:5px;border-bottom:2px solid #152b45;border-radius:0 0 60% 60%;transform-origin:center}
    .fybf-agent-orb.speaking .fybf-agent-mouth{height:12px;border:2px solid #152b45;border-radius:45% 45% 55% 55%;background:#762d50;animation:fybf-mouth .16s ease-in-out infinite alternate}
    .fybf-agent-orb.speaking:before{content:"";position:absolute;inset:-8px;border:2px solid var(--orb);border-radius:50%;animation:fybf-ring .8s ease-out infinite}
    .fybf-agent-panel{position:fixed;right:16px;bottom:106px;z-index:2147483001;width:min(390px,calc(100vw - 24px));max-height:min(640px,calc(100vh - 132px));display:flex;flex-direction:column;overflow:hidden;border:1px solid #ffffff30;border-radius:20px;background:linear-gradient(150deg,#14233a,#091321);box-shadow:0 20px 65px #000a;color:#f5f7fb;font:14px/1.5 system-ui,sans-serif}
    .fybf-agent-panel[hidden]{display:none}
    .fybf-agent-head{display:flex;align-items:center;gap:10px;padding:13px 15px;background:#ffffff0c;border-bottom:1px solid #ffffff20}
    .fybf-agent-avatar{width:42px;height:42px;flex:none;border-radius:50%;background:radial-gradient(circle at 30% 24%,#fff,#e2c17d 48%,#aa7d34);box-shadow:0 0 18px #e2c17d66}
    .fybf-agent-head strong{display:block;font-size:15px}
    .fybf-agent-head small{display:block;color:#c4d2e2;font-size:11px}
    .fybf-agent-close{margin-left:auto;border:1px solid #ffffff33;background:#ffffff12;color:#fff;border-radius:10px;padding:6px 10px;font-size:18px;cursor:pointer}
    .fybf-agent-messages{min-height:140px;max-height:330px;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
    .fybf-agent-msg{max-width:92%;padding:10px 12px;border-radius:13px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px}
    .fybf-agent-msg.assistant{align-self:flex-start;background:#ffffff12;border:1px solid #ffffff18;color:#e8eff7}
    .fybf-agent-msg.user{align-self:flex-end;background:#1c7895;color:#fff}
    .fybf-agent-tools{display:flex;gap:7px;flex-wrap:wrap;padding:0 14px 10px}
    .fybf-agent-tools button,.fybf-agent-tools a{border:1px solid #ffffff30;border-radius:999px;padding:7px 10px;background:#ffffff0d;color:#fff;text-decoration:none;font:700 11px system-ui;cursor:pointer}
    .fybf-agent-tools button[aria-pressed="true"]{background:#d6b66f;color:#162033}
    .fybf-agent-form{display:flex;align-items:flex-end;gap:7px;padding:12px;border-top:1px solid #ffffff20;background:#0002}
    .fybf-agent-input{flex:1;min-width:0;max-height:100px;min-height:42px;resize:vertical;border:1px solid #ffffff30;border-radius:11px;padding:10px;background:#081321;color:#fff;font:13px/1.4 system-ui}
    .fybf-agent-input:focus{outline:2px solid #80d8ec;outline-offset:1px}
    .fybf-agent-send,.fybf-agent-mic{border:0;border-radius:11px;padding:11px 12px;background:#d6b66f;color:#152033;font-weight:800;cursor:pointer}
    .fybf-agent-mic{background:#1b718e;color:#fff}
    .fybf-agent-send:disabled{opacity:.5;cursor:wait}
    .fybf-agent-note{padding:0 14px 12px;color:#aebed0;font-size:10px}
    .fybf-agent-status{padding:0 14px 9px;color:#a8d9c5;font-size:11px;min-height:18px}
    @keyframes fybf-orb-float{0%,100%{transform:translateY(0)}25%{transform:translateY(-9px)}50%{transform:translateY(-15px)}75%{transform:translateY(-5px)}}
    @keyframes fybf-blink{0%,45%,48%,100%{transform:scaleY(1)}46.5%{transform:scaleY(.08)}}
    @keyframes fybf-mouth{from{transform:scaleY(.55)}to{transform:scaleY(1.2)}}
    @keyframes fybf-ring{from{transform:scale(.9);opacity:.7}to{transform:scale(1.3);opacity:0}}
    @media(max-width:560px){.fybf-agent-dock{right:12px;bottom:15px;gap:9px}.fybf-agent-orb{width:54px;height:54px}.fybf-agent-panel{right:8px;bottom:88px;width:calc(100vw - 16px)}}
    @media(prefers-reduced-motion:reduce){.fybf-agent-orb,.fybf-agent-eye,.fybf-agent-orb.speaking:before,.fybf-agent-orb.speaking .fybf-agent-mouth{animation:none!important;transition:none!important}}
  `;
  document.head.appendChild(style);

  dock.innerHTML = `
    <button class="fybf-agent-orb" type="button" data-persona="scout" data-name="Scout" aria-label="Open Scout genealogy assistant" aria-expanded="false">
      <span class="fybf-agent-face"><span class="fybf-agent-eyes"><i class="fybf-agent-eye"></i><i class="fybf-agent-eye"></i></span><span class="fybf-agent-mouth"></span></span>
    </button>
    <button class="fybf-agent-orb" type="button" data-persona="assettie" data-name="Assettie" aria-label="Open Assettie assets assistant" aria-expanded="false">
      <span class="fybf-agent-face"><span class="fybf-agent-eyes"><i class="fybf-agent-eye"></i><i class="fybf-agent-eye"></i></span><span class="fybf-agent-mouth"></span></span>
    </button>
  `;

  const panel = document.createElement("section");
  panel.className = "fybf-agent-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "false");
  panel.setAttribute("aria-label", "Families R Us assistant chat");
  panel.innerHTML = `
    <header class="fybf-agent-head">
      <div class="fybf-agent-avatar" aria-hidden="true"></div>
      <div><strong class="fybf-agent-title">Scout</strong><small class="fybf-agent-role"></small></div>
      <button class="fybf-agent-close" type="button" aria-label="Close assistant">×</button>
    </header>
    <div class="fybf-agent-messages" role="log" aria-live="polite"></div>
    <div class="fybf-agent-tools">
      <button type="button" data-intro>Hear introduction</button>
      <button type="button" data-voice aria-pressed="false">Voice replies: Off</button>
      <button type="button" data-stop>Stop voice</button>
      <a data-local-link href="/fru-skwirl-legacy-library.html">Open library</a>
    </div>
    <div class="fybf-agent-status" aria-live="polite">Ready when you are.</div>
    <form class="fybf-agent-form">
      <textarea class="fybf-agent-input" rows="1" maxlength="1600" placeholder="Ask Scout a genealogy question…" aria-label="Message"></textarea>
      <button class="fybf-agent-mic" type="button" aria-label="Use voice input">🎙</button>
      <button class="fybf-agent-send" type="submit">Send</button>
    </form>
    <div class="fybf-agent-note">Public assistant chat. It does not access private family or asset records. Do not enter Social Security numbers, bank details, passwords, raw DNA files, or sensitive information about living relatives.</div>
  `;
  document.body.appendChild(panel);

  const title = panel.querySelector(".fybf-agent-title");
  const role = panel.querySelector(".fybf-agent-role");
  const messages = panel.querySelector(".fybf-agent-messages");
  const status = panel.querySelector(".fybf-agent-status");
  const input = panel.querySelector(".fybf-agent-input");
  const sendButton = panel.querySelector(".fybf-agent-send");
  const voiceButton = panel.querySelector("[data-voice]");
  const introButton = panel.querySelector("[data-intro]");
  const stopButton = panel.querySelector("[data-stop]");
  const localLink = panel.querySelector("[data-local-link]");

  function addMessage(kind, text) {
    const node = document.createElement("div");
    node.className = "fybf-agent-msg " + kind;
    node.textContent = text;
    messages.appendChild(node);
    messages.scrollTop = messages.scrollHeight;
  }
  function stopSpeech() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    dock.querySelectorAll(".fybf-agent-orb").forEach(x => x.classList.remove("speaking"));
  }
  function speak(text) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      status.textContent = "Speech playback is not supported in this browser.";
      return;
    }
    stopSpeech();
    const orb = dock.querySelector('[data-persona="' + active + '"]');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = active === "scout" ? 0.96 : 1.02;
    utterance.onstart = () => { orb?.classList.add("speaking"); status.textContent = people[active].name + " is speaking…"; };
    utterance.onend = utterance.onerror = () => { orb?.classList.remove("speaking"); status.textContent = "Ready when you are."; };
    window.speechSynthesis.speak(utterance);
  }
  function open(persona) {
    active = persona;
    const person = people[persona];
    title.textContent = person.name;
    role.textContent = person.role;
    localLink.href = person.page;
    localLink.textContent = person.link;
    let extraLink = panel.querySelector(".fybf-extra-link");
    if (!extraLink) {
      extraLink = document.createElement("a");
      extraLink.className = "fybf-extra-link";
      extraLink.style.cssText = "display:block;margin-top:8px;padding:9px 12px;border:1px solid rgba(201,168,76,.45);border-radius:10px;text-align:center;font-size:.82rem;font-weight:650;text-decoration:none;color:inherit;";
      localLink.insertAdjacentElement("afterend", extraLink);
    }
    if (person.extraPage) {
      extraLink.href = person.extraPage;
      extraLink.textContent = person.extraLink;
      extraLink.hidden = false;
    } else {
      extraLink.hidden = true;
    }
    input.placeholder = "Ask " + person.name + " a question…";
    messages.innerHTML = "";
    addMessage("assistant", person.greeting);
    if (histories[persona].length) histories[persona].forEach(item => addMessage(item.role, item.content));
    panel.hidden = false;
    dock.querySelectorAll(".fybf-agent-orb").forEach(x => x.setAttribute("aria-expanded", String(x.dataset.persona === persona)));
    input.focus();
  }
  async function sendMessage(text) {
    const message = String(text || "").trim();
    if (!message || !active) return;
    input.value = "";
    addMessage("user", message);
    status.textContent = "Thinking…";
    sendButton.disabled = true;
    const prior = histories[active].slice(-8);
    try {
      const response = await fetch(CHAT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify({ persona: active, message, history: prior })
      });
      const data = await response.json();
      if (!response.ok || !data.reply) throw new Error(data.error || "The assistant could not reply.");
      histories[active].push({ role: "user", content: message }, { role: "assistant", content: data.reply });
      histories[active] = histories[active].slice(-8);
      addMessage("assistant", data.reply);
      status.textContent = "Connected · " + people[active].name;
      if (voiceReplies) speak(data.reply);
    } catch (error) {
      addMessage("assistant", error.message || "The assistant is temporarily unavailable. Please try again.");
      status.textContent = "Connection issue · try again in a moment.";
    } finally {
      sendButton.disabled = false;
      input.focus();
    }
  }

  dock.querySelectorAll(".fybf-agent-orb").forEach(button => button.addEventListener("click", () => open(button.dataset.persona)));
  panel.querySelector(".fybf-agent-close").addEventListener("click", () => {
    stopSpeech();
    panel.hidden = true;
    dock.querySelectorAll(".fybf-agent-orb").forEach(x => x.setAttribute("aria-expanded", "false"));
  });
  panel.querySelector(".fybf-agent-form").addEventListener("submit", event => {
    event.preventDefault();
    sendMessage(input.value);
  });
  introButton.addEventListener("click", () => { if (active) speak(people[active].greeting); });
  stopButton.addEventListener("click", () => { stopSpeech(); status.textContent = "Voice stopped."; });
  voiceButton.addEventListener("click", () => {
    voiceReplies = !voiceReplies;
    voiceButton.setAttribute("aria-pressed", String(voiceReplies));
    voiceButton.textContent = "Voice replies: " + (voiceReplies ? "On" : "Off");
    status.textContent = voiceReplies ? "Voice replies enabled." : "Voice replies disabled.";
  });
  panel.querySelector(".fybf-agent-mic").addEventListener("click", () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { status.textContent = "Voice input is not supported in this browser. You can type your question."; return; }
    if (recognition) { recognition.stop(); recognition = null; }
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => { status.textContent = "Listening…"; };
    recognition.onresult = event => { input.value = event.results[0][0].transcript; status.textContent = "Voice captured. Press Send when ready."; input.focus(); };
    recognition.onerror = () => { status.textContent = "Voice input stopped. You can type instead."; };
    recognition.onend = () => { recognition = null; };
    recognition.start();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) {
      stopSpeech();
      panel.hidden = true;
      dock.querySelectorAll(".fybf-agent-orb").forEach(x => x.setAttribute("aria-expanded", "false"));
    }
  });
  document.addEventListener("pointermove", event => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gx = (event.clientX / innerWidth - 0.5) * 7;
    const gy = (event.clientY / innerHeight - 0.5) * 5;
    dock.querySelectorAll(".fybf-agent-eyes").forEach(el => {
      el.style.setProperty("--gx", gx.toFixed(1) + "px");
      el.style.setProperty("--gy", gy.toFixed(1) + "px");
    });
  }, { passive: true });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stopSpeech(); });
})();
