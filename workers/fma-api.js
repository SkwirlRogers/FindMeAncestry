export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const jsonHeaders = { 'content-type': 'application/json' };

    const sendJson = (status, body) =>
      new Response(JSON.stringify(body), {
        status,
        headers: jsonHeaders,
      });

    const parseBody = async () => {
      try {
        return await request.json();
      } catch {
        return {};
      }
    };

    const readSessionToken = (req) => {
      const auth = req.headers.get('Authorization') || '';
      if (auth.startsWith('Bearer ')) {
        return auth.slice(7);
      }
      return req.headers.get('x-session-token') || null;
    };

    const getSessionUser = async (req) => {
      const token = readSessionToken(req);
      if (!token) {
        return {
          ok: false,
          response: sendJson(401, { ok: false, error: 'Missing session token' }),
        };
      }

      const now = new Date().toISOString();
      const row = await env.DB.prepare(`
        SELECT u.id, u.email, u.full_name, u.role, u.plan_id, p.slug AS plan_slug, p.is_premium
        FROM user_sessions s
        JOIN users u ON u.id = s.user_id
        LEFT JOIN plans p ON p.id = u.plan_id
        WHERE s.token = ? AND s.expires_at > ?
      `).bind(token, now).first();

      if (!row) {
        return {
          ok: false,
          response: sendJson(401, { ok: false, error: 'Invalid or expired session' }),
        };
      }

      return {
        ok: true,
        user: {
          id: row.id,
          email: row.email,
          fullName: row.full_name,
          role: row.role,
          planId: row.plan_id,
          planSlug: row.plan_slug || 'demo',
          isPremium: !!row.is_premium,
        },
      };
    };

    const requireAuth = async (req) => {
      const auth = await getSessionUser(req);
      if (!auth.ok) {
        return auth;
      }
      return { ok: true, user: auth.user };
    };

    const requirePremium = async (req) => {
      const auth = await requireAuth(req);
      if (!auth.ok) return auth;
      if (!auth.user.isPremium) {
        return {
          ok: false,
          response: sendJson(403, {
            ok: false,
            error: 'Premium plan required for this feature',
          }),
        };
      }
      return { ok: true, user: auth.user };
    };

    if (path === '/api/auth/signup' && method === 'POST') {
      const body = await parseBody();
      const email = String(body.email || '').trim().toLowerCase();
      const fullName = String(body.fullName || body.name || '').trim();
      const password = String(body.password || '');

      if (!email || !fullName || !password) {
        return sendJson(400, {
          ok: false,
          error: 'Email, full name, and password are required',
        });
      }

      const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
      if (existing) {
        return sendJson(409, { ok: false, error: 'User already exists' });
      }

      const defaultPlan = await env.DB.prepare('SELECT id FROM plans WHERE slug = ?').bind('demo').first();
      const encoder = new TextEncoder();
      const hashBytes = await crypto.subtle.digest('SHA-256', encoder.encode(password));
      const passwordHash = Array.from(new Uint8Array(hashBytes))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');

      const createUser = await env.DB.prepare(`
        INSERT INTO users (email, password_hash, full_name, role, plan_id)
        VALUES (?, ?, ?, 'member', ?)
      `).bind(email, passwordHash, fullName, defaultPlan?.id || null).run();

      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

      await env.DB.prepare(`
        INSERT INTO user_sessions (user_id, token, expires_at)
        VALUES (?, ?, ?)
      `).bind(createUser.meta.last_row_id, sessionToken, expiresAt).run();

      return sendJson(201, {
        ok: true,
        user: {
          id: createUser.meta.last_row_id,
          email,
          fullName,
          role: 'member',
          planSlug: 'demo',
          isPremium: false,
        },
        sessionToken,
        expiresAt,
      });
    }

    if (path === '/api/auth/login' && method === 'POST') {
      const body = await parseBody();
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      if (!email || !password) {
        return sendJson(400, { ok: false, error: 'Email and password are required' });
      }

      const encoder = new TextEncoder();
      const hashBytes = await crypto.subtle.digest('SHA-256', encoder.encode(password));
      const passwordHash = Array.from(new Uint8Array(hashBytes))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');

      const user = await env.DB.prepare(`
        SELECT u.id, u.email, u.full_name, u.role, p.slug AS plan_slug, p.is_premium
        FROM users u
        LEFT JOIN plans p ON p.id = u.plan_id
        WHERE u.email = ? AND u.password_hash = ?
      `).bind(email, passwordHash).first();

      if (!user) {
        return sendJson(401, { ok: false, error: 'Invalid email or password' });
      }

      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

      await env.DB.prepare(`
        INSERT INTO user_sessions (user_id, token, expires_at)
        VALUES (?, ?, ?)
      `).bind(user.id, sessionToken, expiresAt).run();

      return sendJson(200, {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          planSlug: user.plan_slug || 'demo',
          isPremium: !!user.is_premium,
        },
        sessionToken,
        expiresAt,
      });
    }

    if (path === '/api/session/validate' && method === 'GET') {
      const auth = await getSessionUser(request);
      if (!auth.ok) return auth.response;
      return sendJson(200, { ok: true, user: auth.user });
    }

    if (path === '/api/cases' && method === 'GET') {
      const auth = await requireAuth(request);
      if (!auth.ok) return auth.response;

      const rows = await env.DB.prepare(`
        SELECT id, title, summary, status, metadata_json, created_at, updated_at
        FROM cases
        WHERE user_id = ?
        ORDER BY updated_at DESC
      `).bind(auth.user.id).all();

      return sendJson(200, { ok: true, cases: rows.results || [] });
    }

    if (path === '/api/cases' && method === 'POST') {
      const auth = await requireAuth(request);
      if (!auth.ok) return auth.response;

      const body = await parseBody();
      const title = String(body.title || '').trim();
      const summary = String(body.summary || '').trim();

      if (!title) {
        return sendJson(400, { ok: false, error: 'Case title is required' });
      }

      const insertResult = await env.DB.prepare(`
        INSERT INTO cases (user_id, title, summary, status, metadata_json)
        VALUES (?, ?, ?, 'open', ?)
      `).bind(auth.user.id, title, summary, JSON.stringify(body.metadata || {})).run();

      return sendJson(201, {
        ok: true,
        case: {
          id: insertResult.meta.last_row_id,
          userId: auth.user.id,
          title,
          summary,
          status: 'open',
        },
      });
    }

    if (path === '/api/chat/threads' && method === 'POST') {
      const auth = await requirePremium(request);
      if (!auth.ok) return auth.response;

      const body = await parseBody();
      const title = String(body.title || '').trim() || 'New Research Thread';
      const caseId = body.caseId ? Number(body.caseId) : null;

      const insertResult = await env.DB.prepare(`
        INSERT INTO chat_threads (user_id, case_id, title)
        VALUES (?, ?, ?)
      `).bind(auth.user.id, caseId, title).run();

      return sendJson(201, {
        ok: true,
        thread: {
          id: insertResult.meta.last_row_id,
          userId: auth.user.id,
          caseId,
          title,
        },
      });
    }

    if (path.startsWith('/api/chat/threads/') && method === 'GET') {
      const auth = await requirePremium(request);
      if (!auth.ok) return auth.response;

      const threadId = Number(path.split('/').filter(Boolean).pop());
      const thread = await env.DB.prepare(`
        SELECT id, user_id, case_id, title, created_at, updated_at
        FROM chat_threads
        WHERE id = ? AND user_id = ?
      `).bind(threadId, auth.user.id).first();

      if (!thread) {
        return sendJson(404, { ok: false, error: 'Thread not found' });
      }

      const messages = await env.DB.prepare(`
        SELECT id, sender, content, created_at
        FROM chat_messages
        WHERE thread_id = ?
        ORDER BY created_at ASC
      `).bind(threadId).all();

      return sendJson(200, {
        ok: true,
        thread,
        messages: messages.results || [],
      });
    }

    if (path.startsWith('/api/chat/threads/') && method === 'POST') {
      const auth = await requirePremium(request);
      if (!auth.ok) return auth.response;

      const threadId = Number(path.split('/').filter(Boolean).pop());
      const body = await parseBody();
      const content = String(body.content || '').trim();

      if (!content) {
        return sendJson(400, { ok: false, error: 'Message content is required' });
      }

      const threadExists = await env.DB.prepare(`
        SELECT id FROM chat_threads WHERE id = ? AND user_id = ?
      `).bind(threadId, auth.user.id).first();

      if (!threadExists) {
        return sendJson(404, { ok: false, error: 'Thread not found' });
      }

      const insertResult = await env.DB.prepare(`
        INSERT INTO chat_messages (thread_id, sender, content)
        VALUES (?, 'user', ?)
      `).bind(threadId, content).run();

      return sendJson(201, {
        ok: true,
        message: {
          id: insertResult.meta.last_row_id,
          threadId,
          sender: 'user',
          content,
        },
      });
    }

    return sendJson(404, { ok: false, error: 'Not found' });
  },
};
