const HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export async function onRequestPost({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  const message = typeof body.message === 'string' ? body.message.slice(0, 2000).trim() : '';
  if (!message) return json({ error: 'Message is required' }, 400);

  return json({
    reply: '<strong>AssetieAI:</strong><br><br>' +
      'Unclaimed property, asset recovery, and estate research are handled on the CeeYoAssets line. ' +
      'Open <a href="ceeyoassets.html" style="color:#1a759f;font-weight:700;">CeeYoAssets</a> to continue.<br><br>' +
      `<small style="color:#5b6b7c;">Query logged: ${esc(message)}</small>`,
    demoLimited: false,
  });
}

export async function onRequestGet() {
  return json({ error: 'Use POST with JSON { message }' }, 405);
}
