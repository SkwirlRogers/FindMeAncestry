const HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

export async function onRequestGet() {
  return json({
    ok: false,
    configured: false,
    results: [],
    error: 'The CeeYoAssets enhanced search service is not connected to this deployment.',
  }, 501);
}
