// Legacy Google Pay widget intentionally disabled.
// This repository does not contain a production Google Pay gateway integration.
// Do not load Google Pay in TEST mode with Stripe placeholder credentials.
// Production checkout must be provided by a configured, server-verified provider.

(function () {
  window.triggerGooglePay = function () {
    const message = 'Google Pay is not configured for this checkout. No payment was taken. Please use the official checkout option shown on this site.';
    console.error(message);
    window.alert(message);
    return false;
  };
})();
