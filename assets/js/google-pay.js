// Google Pay integration (test mode)
// This script provides a minimal implementation of triggerGooglePay()
// It uses Google Pay test merchant ID and Stripe as the gateway.
// Replace the placeholder alerts with actual Google Pay flow.

// Load Google Pay script dynamically if not already loaded
if (!window.google) {
  const gpScript = document.createElement('script');
  gpScript.src = 'https://pay.google.com/gp/p/js/pay.js';
  gpScript.async = true;
  gpScript.onload = initGooglePay;
  document.head.appendChild(gpScript);
} else {
  initGooglePay();
}

function initGooglePay() {
  const paymentsClient = new google.payments.api.PaymentsClient({environment: 'TEST'});

  const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
  };

  const allowedCardNetworks = ['VISA', 'MASTERCARD'];
  const allowedCardAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];

  const tokenizationSpecification = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
      // Use Stripe test gateway values. Replace with real values for production.
      gateway: 'stripe',
      // Stripe test merchant ID (public key). This is a placeholder.
      'stripe:publishableKey': 'pk_test_TYooMQauvdEDq54NiTphI7jx',
    },
  };

  const cardPaymentMethod = Object.assign(
    {},
    baseRequest,
    {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: allowedCardAuthMethods,
        allowedCardNetworks: allowedCardNetworks,
      },
      tokenizationSpecification: tokenizationSpecification,
    }
  );

  const googlePayConfig = Object.assign(
    {},
    baseRequest,
    {
      merchantInfo: {
        // Test merchant ID – replace with your own for production.
        merchantId: '01234567890123456789',
        merchantName: 'FindMeAncestry Demo',
      },
      allowedPaymentMethods: [cardPaymentMethod],
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPriceLabel: 'Total',
        // totalPrice will be set dynamically before showing the payment sheet.
        countryCode: 'US',
        currencyCode: 'USD',
      },
    }
  );

  // Check if Google Pay is available
  paymentsClient.isReadyToPay({allowedPaymentMethods: [cardPaymentMethod]})
    .then(function(response) {
      if (response.result) {
        // Google Pay is available – no further action needed now.
        console.log('Google Pay is ready');
      } else {
        console.warn('Google Pay not available');
      }
    })
    .catch(function(err) {
      console.error('Error checking Google Pay readiness', err);
    });

  // Expose triggerGooglePay globally
  window.triggerGooglePay = function(tierName, price) {
    // Update transactionInfo with price
    const request = Object.assign({}, googlePayConfig, {
      transactionInfo: Object.assign({}, googlePayConfig.transactionInfo, {
        totalPrice: price.toFixed(2),
      }),
    });
    paymentsClient.loadPaymentData(request)
      .then(function(paymentData) {
        // Send payment token to backend for processing
        return fetch('/api/googlepay/checkout', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            token: paymentData.paymentMethodData.tokenizationData.token,
            tier: tierName,
            amount: price,
          }),
        });
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Payment successful! Thank you for purchasing the ' + tierName + ' tier.');
        } else {
          alert('Payment failed: ' + (data.message || 'unknown error'));
        }
      })
      .catch(function(err) {
        console.error('Google Pay payment failed', err);
        alert('Payment could not be completed.');
      });
  };
}
