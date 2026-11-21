const HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

// No claim case store or authenticated status service is connected.
export async function onRequestGet() {
  return json({
    ok: false,
    configured: false,
    claim_status_lookup: false,
    accepting_claims: false,
    error: 'CeeYoAssets claim status lookup is not available. Check claim status directly with the official agency that received the claim.',
  }, 503);
}
