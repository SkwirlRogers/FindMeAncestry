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
    // Return mock online status when bridge URL is not configured (development mode)
    return json({
      ok: true,
      configured: false,
      bridge: 'mock_online',
      status: 'online',
      detail: 'Bridge not configured; returning mock online status for development purposes.'
    });
  }
  try {
    const response = await fetch(`${base}/api/findme/status`);
    return new Response(await response.text(), {
      status: response.status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  } catch {
    return json({ ok: false, error: 'Bridge unreachable' }, 502);
  }
}
