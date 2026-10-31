import { verifyAndActivatePurchase } from './payment-service.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    const sendJson = (status, body) => new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
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
      if (auth.startsWith('Bearer ')) return auth.slice(7);
      return req.headers.get('x-session-token') || null;
    };

    const getSessionUser = async (req) => {
      const token = readSessionToken(req);
      if (!token) {
        return { ok: false, response: sendJson(401, { ok: false, error: 'Missing session token' }) };
      }

      const row = await env.DB.prepare(`
        SELECT u.id, u.email, u.full_name, u.role, u.plan_id, p.slug AS plan_slug, p.is_premium
        FROM user_sessions s
        JOIN users u ON u.id = s.user_id
        LEFT JOIN plans p ON p.id = u.plan_id
        WHERE s.token = ? AND s.expires_at > ?
      `).bind(token, new Date().toISOString()).first();

      if (!row) {
        return { ok: false, response: sendJson(401, { ok: false, error: 'Invalid or expired session' }) };
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

    if (path === '/api/payments/verify' && method === 'POST') {
      const auth = await getSessionUser(request);
      if (!auth.ok) return auth.response;

      const body = await parseBody();
      const provider = String(body.provider || '').trim();
      const payload = body.payload || body;

      if (!provider) {
        return sendJson(400, { ok: false, error: 'Payment provider is required' });
      }

      const result = await verifyAndActivatePurchase(env, auth.user.id, provider, payload);
      if (!result.ok) {
        return sendJson(400, {
          ok: false,
          provider,
          error: result.error || 'Payment verification failed',
          status: result.status || 'verification_failed',
        });
      }

      return sendJson(200, {
        ok: true,
        provider: result.provider,
        plan: result.plan,
        status: result.status,
        expiresAt: result.expiresAt,
      });
    }

    if (path === '/api/user/me' && method === 'GET') {
      const auth = await getSessionUser(request);
      if (!auth.ok) return auth.response;

      return sendJson(200, {
        ok: true,
        user: auth.user,
      });
    }

    return sendJson(404, { ok: false, error: 'Not found' });
  },
};
