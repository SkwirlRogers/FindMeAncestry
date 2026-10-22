const HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function callGemini(env, message, isSubscribed) {
  try {
    const model = env.GEMINI_MODEL || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
    const system = [
      'You are Scout Patterson, a forensic genealogist and private family detective.',
      'You help people trace family history using public records, DNA evidence, and historical context.',
      'Be warm, precise, and concise. Never invent records, matches, or citations.',
      'If evidence is missing, say so and suggest the next verifiable research step.',
      isSubscribed ? 'The user has a subscriber session.' : 'The user is in demo mode: give a useful preview and invite them to continue.',
    ].join(' ');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: `${system}\n\nUser query: ${message}` }] }] }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const text = (data?.candidates?.[0]?.content?.parts || []).map((part) => part.text || '').join('');
    return text || null;
  } catch {
    return null;
  }
}

async function bridgeSearch(env, message, isSubscribed) {
  if (!env.SCOUT_BRIDGE_URL) return null;
  try {
    const base = env.SCOUT_BRIDGE_URL.replace(/\/$/, '');
    const response = await fetch(`${base}/api/bridge/search`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: message, use_fallback: Boolean(isSubscribed) }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function quickLinks() {
  return '<br><hr style="margin:12px 0;border-color:#dbe4ee;"><div style="font-size:0.85rem;color:#5b6b7c;"><strong>Quick Links:</strong> ' +
    '<a href="index.html#pricing" style="color:#1a759f;margin:0 4px;">Subscription Tiers</a> | ' +
    '<a href="index.html#free-resources" style="color:#1a759f;margin:0 4px;">Free Resources</a> | ' +
    '<a href="dna-hub.html" style="color:#1a759f;margin:0 4px;">DNA Hub</a> | ' +
    '<a href="ceeyoassets.html" style="color:#1a759f;margin:0 4px;">CeeYoAssets</a>' +
    '</div>';
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const message = typeof body.message === 'string' ? body.message.slice(0, 4000).trim() : '';
  if (!message) return json({ error: 'Message is required' }, 400);
  const isSubscribed = Boolean(body.isSubscribed);
  const lower = message.toLowerCase();

  if (/(unclaimed asset|unclaimed property|estate recovery|unclaimed money)/.test(lower)) {
    return json({
      reply: "<strong>Redirect Notice:</strong> Unclaimed assets and property searches are handled by our sister portal. Please use <a href='ceeyoassets.html' class='btn btn-accent' style='padding:4px 12px;font-size:0.8rem;'>CeeYoAssets</a>.",
      redirected: true,
    });
  }

  const bridge = await bridgeSearch(env, message, isSubscribed);
  const llm = env.GEMINI_API_KEY ? await callGemini(env, message, isSubscribed) : null;

  let reply = '<strong>Detective Scout Patterson:</strong><br><br>';
  if (llm) {
    reply += esc(llm).replace(/\n/g, '<br>');
  } else {
    reply += `I have logged your query: <em>"${esc(message)}"</em>.<br><br>`;
    const results = Array.isArray(bridge?.free_results) ? bridge.free_results : [];
    if (results.length) {
      const limit = isSubscribed ? results.length : Math.min(2, results.length);
      reply += '<ul>';
      for (const item of results.slice(0, limit)) {
        const url = esc(item.url || '#');
        reply += `<li><strong>[${esc(item.source || 'record')}]</strong> <a href="${url}" target="_blank" rel="noopener" style="color:#1a759f;font-weight:700;">${esc(item.title || 'Result')}</a><br><small style="color:#666;">${esc(item.snippet || '')}</small></li>`;
      }
      reply += '</ul>';
    } else {
      reply += 'The live archival bridge is not connected on this deployment yet. Your request is ready for the research network the moment the bridge is linked.<br><br>';
      reply += '<strong>What you can do now:</strong><ul>' +
        '<li>Start with the <a href="surname-center.html" style="color:#1a759f;">Surname Center</a> to review surname distribution and variants.</li>' +
        '<li>Upload raw DNA in the <a href="dna-hub.html" style="color:#1a759f;">DNA Hub</a> to prepare a triangulation workspace.</li>' +
        '<li>Map migration paths in the <a href="map-view.html" style="color:#1a759f;">Migration Map</a>.</li>' +
        '<li>Review the <a href="resource-hub.html" style="color:#1a759f;">Resources &amp; Tools</a> for record jurisdictions.</li></ul>';
    }
  }

  reply += quickLinks();
  return json({ reply, demoLimited: !isSubscribed });
}

export async function onRequestGet() {
  return json({ error: 'Use POST with JSON { message, isSubscribed }' }, 405);
}
