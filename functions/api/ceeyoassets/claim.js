const HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

// Claim intake remains disabled until authenticated case storage, access
// controls, retention policy, and secure document handling are deployed.
export async function onRequestPost() {
  return json({
    ok: false,
    configured: false,
    accepting_claims: false,
    error: 'Secure claim intake is not available yet. No claim was submitted. Please use the official government portal linked from your search results.',
  }, 503);
}

export async function onRequestGet() {
  return json({ error: 'Use POST to submit a claim' }, 405);
}
