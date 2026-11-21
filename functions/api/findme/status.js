const HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

function bridgeBase(env) {
  return env.FINDME_BRIDGE_URL ? env.FINDME_BRIDGE_URL.replace(/\/$/, '') : null;
}

export async function onRequestGet({ env }) {
  const base = bridgeBase(env);
  if (!base) {
    return json({
      ok: false,
      configured: false,
      bridge: 'not_configured',
      status: 'offline',
      detail: 'The genealogy bridge is not configured for this deployment. No live FamilySearch or Ancestry search is connected.',
    }, 503);
  }
  try {
    const response = await fetch(`${base}/api/findme/status`, { headers: { 'cache-control': 'no-store' } });
    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  } catch {
    return json({ ok: false, configured: true, bridge: 'unreachable', status: 'offline', error: 'Bridge unreachable' }, 502);
  }
}
