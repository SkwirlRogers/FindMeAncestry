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
      trees: [],
      error: 'The Ancestry/FamilySearch bridge is not linked to this deployment.',
    }, 503);
  }
  try {
    const response = await fetch(`${base}/api/findme/trees`);
    return new Response(await response.text(), {
      status: response.status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  } catch {
    return json({ ok: false, error: 'Bridge unreachable' }, 502);
  }
}
