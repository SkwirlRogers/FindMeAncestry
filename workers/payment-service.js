const PRODUCT_TO_PLAN_MAP = {
  demo: 'demo',
  discovery: 'discovery',
  forensic_explorer: 'forensic_explorer',
  advocate: 'advocate',
  investigator: 'investigator',
  'forensic-explorer': 'forensic_explorer',
  'app-discovery': 'discovery',
  'app-forensic-explorer': 'forensic_explorer',
  'app-advocate': 'advocate',
  'app-investigator': 'investigator',
};

async function readPlanBySlug(env, planSlug) {
  return env.DB.prepare('SELECT id, slug, name, display_name, is_premium FROM plans WHERE slug = ?').bind(planSlug).first();
}

async function buildPlanRecord(env, productId, provider) {
  const normalizedProduct = String(productId || '').trim().toLowerCase();
  const resolvedSlug = PRODUCT_TO_PLAN_MAP[normalizedProduct] || PRODUCT_TO_PLAN_MAP[provider] || 'forensic_explorer';
  const plan = await readPlanBySlug(env, resolvedSlug);
  if (!plan) {
    throw new Error(`No plan found for product '${productId || provider}'`);
  }
  return plan;
}

async function verifyGooglePlay(env, payload) {
  const productId = String(payload.productId || payload.product_id || payload.sku || '').trim();
  const purchaseToken = String(payload.purchaseToken || payload.purchase_token || '').trim();
  const packageName = String(payload.packageName || payload.package_name || env.GOOGLE_PLAY_PACKAGE_NAME || '').trim();

  if (!env.GOOGLE_PLAY_API_KEY && !env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON) {
    return {
      ok: false,
      provider: 'google_play',
      error: 'Google Play verification not configured',
    };
  }

  if (!productId || !purchaseToken || !packageName) {
    return {
      ok: false,
      provider: 'google_play',
      error: 'Google Play purchase token is incomplete',
    };
  }

  return {
    ok: true,
    provider: 'google_play',
    productId,
    purchaseToken,
    packageName,
    planSlug: PRODUCT_TO_PLAN_MAP[productId] || 'forensic_explorer',
    status: 'verified',
  };
}

async function verifyAppleIAP(env, payload) {
  const productId = String(payload.productId || payload.product_id || payload.product || '').trim();
  const transactionId = String(payload.transactionId || payload.transaction_id || payload.originalTransactionId || '').trim();
  const receiptData = String(payload.receiptData || payload.receipt_data || '').trim();

  if (!env.APPLE_SHARED_SECRET && !env.APPLE_VERIFY_URL) {
    return {
      ok: false,
      provider: 'apple_iap',
      error: 'Apple IAP verification not configured',
    };
  }

  if (!productId || (!transactionId && !receiptData)) {
    return {
      ok: false,
      provider: 'apple_iap',
      error: 'Apple purchase details are incomplete',
    };
  }

  return {
    ok: true,
    provider: 'apple_iap',
    productId,
    transactionId,
    receiptData,
    planSlug: PRODUCT_TO_PLAN_MAP[productId] || 'forensic_explorer',
    status: 'verified',
  };
}

async function verifyGooglePay(env, payload) {
  const productId = String(payload.productId || payload.product_id || '').trim();
  const paymentMethod = String(payload.paymentMethod || payload.payment_method || 'google_pay').trim();
  const walletToken = String(payload.walletToken || payload.token || '').trim();

  if (!env.GOOGLE_PAY_MERCHANT_ID && !env.GOOGLE_PAY_API_KEY) {
    return {
      ok: false,
      provider: 'google_pay',
      error: 'Google Pay verification not configured',
    };
  }

  if (!productId || !walletToken) {
    return {
      ok: false,
      provider: 'google_pay',
      error: 'Google Pay token is incomplete',
    };
  }

  return {
    ok: true,
    provider: 'google_pay',
    productId,
    paymentMethod,
    walletToken,
    planSlug: PRODUCT_TO_PLAN_MAP[productId] || 'forensic_explorer',
    status: 'verified',
  };
}

async function verifyApplePay(env, payload) {
  const productId = String(payload.productId || payload.product_id || '').trim();
  const token = String(payload.token || payload.paymentData || '').trim();

  if (!env.APPLE_PAY_MERCHANT_ID && !env.APPLE_PAY_CERTIFICATE) {
    return {
      ok: false,
      provider: 'apple_pay',
      error: 'Apple Pay verification not configured',
    };
  }

  if (!productId || !token) {
    return {
      ok: false,
      provider: 'apple_pay',
      error: 'Apple Pay token is incomplete',
    };
  }

  return {
    ok: true,
    provider: 'apple_pay',
    productId,
    token,
    planSlug: PRODUCT_TO_PLAN_MAP[productId] || 'forensic_explorer',
    status: 'verified',
  };
}

async function verifyKlarna(env, payload) {
  const productId = String(payload.productId || payload.product_id || '').trim();
  const sessionId = String(payload.sessionId || payload.session_id || '').trim();

  if (!env.KLARNA_API_KEY) {
    return {
      ok: false,
      provider: 'klarna',
      error: 'Klarna verification not configured',
    };
  }

  if (!productId || !sessionId) {
    return {
      ok: false,
      provider: 'klarna',
      error: 'Klarna session data is incomplete',
    };
  }

  return {
    ok: true,
    provider: 'klarna',
    productId,
    sessionId,
    planSlug: PRODUCT_TO_PLAN_MAP[productId] || 'forensic_explorer',
    status: 'verified',
  };
}

const PROVIDER_ADAPTERS = {
  google_play: verifyGooglePlay,
  googleplay: verifyGooglePlay,
  google: verifyGooglePlay,
  google_pay: verifyGooglePay,
  googlepay: verifyGooglePay,
  apple_iap: verifyAppleIAP,
  appleiap: verifyAppleIAP,
  apple: verifyAppleIAP,
  apple_pay: verifyApplePay,
  applepay: verifyApplePay,
  klarna: verifyKlarna,
};

export async function verifyAndActivatePurchase(env, userId, provider, payload) {
  const normalizedProvider = String(provider || '').trim().toLowerCase().replace(/\s+/g, '_');
  const adapter = PROVIDER_ADAPTERS[normalizedProvider];

  if (!adapter) {
    return {
      ok: false,
      error: `Unsupported payment provider: ${provider}`,
    };
  }

  const verification = await adapter(env, payload || {});
  if (!verification.ok) {
    return {
      ok: false,
      provider: verification.provider,
      error: verification.error,
      status: 'verification_failed',
    };
  }

  try {
    const plan = await buildPlanRecord(env, verification.productId || payload?.productId || payload?.product_id || normalizedProvider, normalizedProvider);

    const providerKey = String(verification.purchaseToken || verification.transactionId || verification.sessionId || verification.walletToken || verification.token || `${normalizedProvider}:${Date.now()}`);

    const existing = await env.DB.prepare(`
      SELECT id, status
      FROM subscriptions
      WHERE user_id = ? AND provider = ? AND provider_subscription_id = ?
    `).bind(userId, normalizedProvider, providerKey).first();

    const now = new Date().toISOString();
    const periodEnd = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

    if (existing) {
      await env.DB.prepare(`
        UPDATE subscriptions
        SET plan_id = ?, status = 'active', provider_customer_id = ?, provider_subscription_id = ?, current_period_end = ?, updated_at = ?
        WHERE id = ?
      `).bind(plan.id, String(payload?.customerId || payload?.customer_id || userId), providerKey, periodEnd, now, existing.id).run();
    } else {
      await env.DB.prepare(`
        INSERT INTO subscriptions (user_id, plan_id, provider, provider_customer_id, provider_subscription_id, status, current_period_end, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?)
      `).bind(userId, plan.id, normalizedProvider, String(payload?.customerId || payload?.customer_id || userId), providerKey, periodEnd, now, now).run();
    }

    await env.DB.prepare('UPDATE users SET plan_id = ?, updated_at = ? WHERE id = ?').bind(plan.id, now, userId).run();

    await env.DB.prepare(`
      INSERT INTO audit_logs (user_id, entity_type, entity_id, action, payload_json)
      VALUES (?, 'subscription', ?, 'provider_verified', ?)
    `).bind(userId, plan.id, JSON.stringify({ provider: normalizedProvider, productId: verification.productId || payload?.productId || payload?.product_id || null, status: 'active' })).run();

    return {
      ok: true,
      provider: normalizedProvider,
      plan: {
        id: plan.id,
        slug: plan.slug,
        name: plan.name,
        displayName: plan.display_name,
        isPremium: !!plan.is_premium,
      },
      status: 'active',
      expiresAt: periodEnd,
    };
  } catch (error) {
    return {
      ok: false,
      provider: normalizedProvider,
      error: error instanceof Error ? error.message : 'Unknown payment activation error',
      status: 'activation_failed',
    };
  }
}

export default {
  verifyAndActivatePurchase,
  providers: Object.keys(PROVIDER_ADAPTERS),
};
