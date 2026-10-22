const HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

export async function onRequestPost() {
  return json({
    ok: false,
    configured: false,
    error: 'CeeYoAssets claims are handled by the separate CeeYoAssets service and are not connected to this deployment.',
  }, 501);
}

export async function onRequestGet() {
  return json({ error: 'Use POST to submit a claim' }, 405);
}
