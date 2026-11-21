const HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

// This endpoint deliberately does not invent matches or scrape government sites.
// It records that a live property-search integration is not yet configured and
// directs the client to official portals. Search terms are not persisted.
export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const last = (url.searchParams.get('last') || '').trim();
  if (!last) return json({ ok: false, error: 'A last name is required.', results: [] }, 400);
  if (last.length > 100) return json({ ok: false, error: 'Search term is too long.', results: [] }, 400);

  return json({
    ok: true,
    configured: false,
    search_mode: 'official_portal_handoff',
    search_complete: false,
    total: 0,
    results: [],
    message: 'No centralized property database is connected. No records were searched and no match determination was made. Continue at the official state and federal portals.',
    queried_at: new Date().toISOString(),
    next_step: 'Search the official portals directly using the name and relevant prior states of residence.',
  });
}
