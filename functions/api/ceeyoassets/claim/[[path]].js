const HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

export async function onRequestGet({ params }) {
  return json({
    ok: false,
    configured: false,
    claim_id: Array.isArray(params.path) ? params.path.join('/') : params.path || null,
    error: 'CeeYoAssets claim lookup is not connected to this deployment.',
  }, 501);
}
