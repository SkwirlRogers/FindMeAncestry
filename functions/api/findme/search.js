const HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

function bridgeBase(env) {
  return env.FINDME_BRIDGE_URL ? env.FINDME_BRIDGE_URL.replace(/\/$/, '') : null;
}

export async function onRequestPost({ request, env }) {
  const base = bridgeBase(env);
  if (!base) {
    return json({
      ok: false,
      configured: false,
      error: 'The Ancestry/FamilySearch bridge is not linked to this deployment.',
    }, 503);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  try {
    const response = await fetch(`${base}/api/findme/search`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    return new Response(await response.text(), {
      status: response.status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  } catch {
    return json({ ok: false, error: 'Bridge unreachable' }, 502);
  }
}
