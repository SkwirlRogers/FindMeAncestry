const HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

const ALLOWED = new Set(['txt', 'csv', 'ged', 'gedcom', 'json']);
const MAX_BYTES = 25 * 1024 * 1024;

export async function onRequestPost({ request, env }) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return json({ error: 'multipart/form-data with a "file" field is required' }, 415);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Could not parse upload' }, 400);
  }

  const file = form.get('file');
  if (!(file instanceof File)) return json({ error: 'file field is required' }, 400);
  if (file.size > MAX_BYTES) return json({ error: 'File exceeds the 25 MB limit' }, 413);

  const originalName = file.name || 'upload.bin';
  const extension = (originalName.split('.').pop() || '').toLowerCase();
  if (!ALLOWED.has(extension)) {
    return json({ error: 'Unsupported file type. Allowed: txt, csv, ged, gedcom, json' }, 415);
  }

  if (!env.DNA_BUCKET) {
    return json({
      ok: false,
      configured: false,
      error: 'Storage is not configured on this deployment. Bind an R2 bucket as DNA_BUCKET to enable DNA and GEDCOM uploads.',
    }, 501);
  }

  const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  try {
    await env.DNA_BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
      customMetadata: { originalName: originalName.slice(0, 200) },
    });
    return json({ ok: true, key, size: file.size, type: extension });
  } catch {
    return json({ ok: false, error: 'Upload failed' }, 502);
  }
}

export async function onRequestGet() {
  return json({ error: 'Use POST multipart/form-data with a "file" field' }, 405);
}
