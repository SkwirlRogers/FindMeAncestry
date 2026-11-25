// Legacy endpoint disabled: it previously returned simulated payment success.
// Never treat a received wallet token as proof that a payment was captured.

export const onRequestPost = async () => {
  return new Response(JSON.stringify({
    success: false,
    code: 'PAYMENT_PROVIDER_NOT_CONFIGURED',
    message: 'Google Pay checkout is not configured. No payment was taken.',
  }), {
    status: 410,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
};
