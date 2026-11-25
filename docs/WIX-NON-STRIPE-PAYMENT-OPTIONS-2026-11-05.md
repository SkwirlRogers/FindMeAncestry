# Wix non-Stripe payment route assessment — 2026-11-05

## Scope and decision
This is a read-only compatibility assessment for the US FindYourBabyFamily Wix site. It does not connect a provider, open an account, change merchant settings, create credentials, or process payments. Stripe is excluded from the proposed custom integration path at the user's direction.

The Wix site uses Wix Stores, Bookings, and Pricing Plans. Pricing Plans include recurring/biweekly offers, so recurring-payment support is a launch requirement.

## Verified Wix provider facts (official Wix Help Center)
- Wix lists these providers as available in the United States: Wix Payments, PayPal, Stripe, Braintree, Afterpay, Bankful, Sezzle, Square, Affirm, Square POS, Evergreen Payments Northwest, Klarna, Splitit, Nuvei, Priority Payments, Authorize.net Powered by Bankful, Choice Payment Solutions, TripleA Crypto Payment Gateway, Elavon Payments, and Zip.
  Source: https://support.wix.com/en/article/available-payment-providers-in-your-country
- Wix says recurring payments on Pricing Plans are supported by Wix Payments, PayPal, Bankful, Priority Payments, and Evergreen Payments Northwest (among other region-dependent providers); Square and Braintree are explicitly not supported for recurring payments.
  Source: https://support.wix.com/en/article/accepting-recurring-payments
  Source: https://support.wix.com/en/article/request-additional-payment-providers-for-accepting-recurring-payments
- Wix says PayPal recurring payments require a PayPal Business account; a new account may need PayPal review, while an existing account may need Advanced Options permission enabled.
  Source: https://support.wix.com/en/article/connecting-paypal-as-a-payment-provider
- Wix says Priority Payments is available in the US, supports recurring payments, and lists card acceptance and a starting fee from 2.75% + $0.25 per transaction; fees must be confirmed directly before signup.
  Source: https://support.wix.com/en/article/connecting-priority-payments-as-a-payment-provider
- Wix says Square is available in the US and supports credit/debit cards, Cash App Pay, POS and Afterpay/Clearpay depending on region, but it is not on Wix's recurring-payment provider list.
  Source: https://support.wix.com/en/article/connecting-square-as-a-payment-provider
- Wix says Braintree is available in the US and lists a US fee of 2.9% + $0.30, but it is not on Wix's recurring-payment provider list.
  Source: https://support.wix.com/en/article/connecting-braintree-as-a-payment-provider
- Wix's Apple Pay guidance says Apple Pay for Wix Stores checkout is currently available only in locations where Wix Payments is available; Apple Pay via other listed third-party providers is not offered as the native Wix Stores checkout button. Some providers may show Apple Pay on their own hosted checkout, which is a different flow.
  Source: https://support.wix.com/en/article/request-adding-apple-pay-as-a-payment-method-in-locations-not-supported-by-wix-payments
- Wix Payments supports Apple Pay and Google Pay in the US, but the US terms list Stripe United States among the processor terms. Do not promise a zero-Stripe underlying processor relationship without written confirmation from Wix.
  Source: https://support.wix.com/en/article/wix-payments
  Source: https://www.wix.com/about/terms-of-payments

## Recommended decision sequence
1. First inspect whether the already-connected PayPal Business account can be used for both one-time and recurring Pricing Plans. If it is already available, prefer enabling the required Advanced Options / recurring permission through the merchant dashboard, after reviewing the account's current terms and status.
2. If PayPal is not suitable, compare Priority Payments and Bankful for recurring Pricing Plans. Get written fee schedules, onboarding requirements, payout timing, refund/dispute terms, and confirmation of compatibility with the site's Stores, Bookings, and Pricing Plans before selecting either.
3. Treat Square and Braintree as possible one-time/POS routes only; do not select them as the primary processor for recurring/biweekly plans.
4. Treat native Apple Pay / Google Pay on Wix Stores as a separate requirement. The official Wix guidance reviewed does not establish that these native wallet buttons can be enabled with Square, Braintree, PayPal, or Priority Payments in place of Wix Payments. Do not advertise native wallet checkout until tested on the actual site and devices.
5. Keep all GitHub custom checkout endpoints disabled until a real processor adapter is implemented, provider-side transaction verification is tested, duplicate/replay handling and refunds are covered, and production credentials are provisioned securely.

## What remains merchant-side
- Confirm current PayPal Business account ownership/status and whether recurring permission is enabled.
- In Wix Dashboard → Settings → Accept Payments, inspect the connected provider and active methods.
- Do not disconnect an existing provider or switch recurring plans without first checking for active subscriptions; Wix warns that switching providers requires canceling active recurring plans and asking customers to repurchase.
- No account has been created, connected, switched, or charged by this assessment.
