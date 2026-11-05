// Payment activation is fail-closed until each provider has a real server-side
// verification implementation. Environment-variable presence and client-supplied
// tokens are NOT proof of payment. Do not activate subscriptions from either.

const SUPPORTED_PROVIDER_ALIASES = {
  google_play: 'Google Play',
  googleplay: 'Google Play',
  google: 'Google Play',
  google_pay: 'Google Pay',
  googlepay: 'Google Pay',
  apple_iap: 'Apple In-App Purchase',
  appleiap: 'Apple In-App Purchase',
  apple: 'Apple In-App Purchase',
  apple_pay: 'Apple Pay',
  applepay: 'Apple Pay',
  klarna: 'Klarna',
};

export async function verifyAndActivatePurchase(_env, _userId, provider) {
  const normalizedProvider = String(provider || '')
    .trim()
    .toLowerCase()
    .replace(/\\s+/g, '_');

  const displayName = SUPPORTED_PROVIDER_ALIASES[normalizedProvider];

  if (!displayName) {
    return {
      ok: false,
      error: `Unsupported payment provider: ${provider}`,
      status: 'verification_failed',
    };
  }

  return {
    ok: false,
    provider: normalizedProvider,
    error: `${displayName} receipt verification is not implemented. No subscription was activated.`,
    status: 'provider_not_configured',
  };
}

export default {
  verifyAndActivatePurchase,
  providers: Object.keys(SUPPORTED_PROVIDER_ALIASES),
};
