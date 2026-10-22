const HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 80);
}

async function handle(context) {
  const { request, env } = context;
  const origin = new URL(request.url).origin;

  if (request.method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }
    const surname = typeof body.surname === 'string' ? body.surname.trim() : '';
    if (!surname) return json({ error: 'surname is required' }, 400);
    const slug = slugify(surname);
    if (!slug) return json({ error: 'surname must contain letters' }, 400);

    try {
      const record = await env.ASSETS.fetch(new URL(`/assets/data/surnames/${slug}.json`, origin));
      if (record.ok) {
        return json({ surname, slug, found: true, data: await record.json() });
      }
      const index = await env.ASSETS.fetch(new URL('/assets/data/surnames-index.json', origin));
      return json({
        surname,
        slug,
        found: false,
        index_available: index.ok,
        hint: 'Surname is not in the local index. Use ScoutAI chat for live research.',
      });
    } catch {
      return json({ error: 'Context lookup failed' }, 500);
    }
  }

  return json({
    service: 'FindMeAncestry Scout Context',
    version: '1.0',
    endpoints: {
      chat: '/api/scout/chat',
      context: '/api/scout/context',
      upload: '/api/upload',
      bridge_status: '/api/findme/status',
    },
    surname_index: '/assets/data/surnames-index.json',
  });
}

export async function onRequestGet(context) {
  return handle(context);
}

export async function onRequestPost(context) {
  return handle(context);
}
