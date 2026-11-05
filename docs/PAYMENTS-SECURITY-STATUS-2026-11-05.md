# Payment safety status — 2026-11-05

## What was wrong

The legacy Google Pay browser integration used Google Pay TEST mode with Stripe test credentials and placeholder merchant values. Its server endpoint returned a successful response without contacting a payment processor or capturing funds.

The shared payment service also treated the presence of environment variables plus a client-supplied token, receipt, transaction ID, or session ID as sufficient to mark a purchase verified. It did not call the relevant provider verification API. That could grant premium access without a verified payment.

## Changes on this branch

- Disabled the legacy Google Pay browser widget. It no longer loads Google Pay TEST mode or Stripe test credentials.
- Disabled the simulated Google Pay checkout endpoint. It now returns HTTP 410 and explicitly says no payment was taken.
- Changed payment activation to fail closed for Google Play, Google Pay, Apple In-App Purchase, Apple Pay, and Klarna until each provider has a real server-side verification adapter.
- Removed the unsafe behavior that activated a subscription merely because a credential variable or client-supplied token was present.

## Important boundary

This branch is a security repair, not a live payment integration. It does not deploy anything, configure provider accounts, create merchant credentials, or process a payment. Do not merge or deploy until real provider verification is implemented and tested in each provider's sandbox.

## FindYourBabyFamily Wix checkout

The published FindYourBabyFamily site is a separate Wix site with Wix Stores Catalog V3, Wix Bookings, Wix Pricing Plans, Forms, Members Area and Proposals installed.

Wix's payment-method catalog API is read-only and lists methods available in the US (including Apple Pay, Google Pay, PayPal, Klarna, Affirm and Afterpay). That catalog is not evidence that any one method is connected or enabled on the merchant account.

Merchant-side payment-method configuration must be checked in the site's Wix Dashboard under Settings → Accept Payments. Do not infer active status from the method catalog or from placeholder code in this repository.

## No Stripe custom integration

No new Stripe account, Stripe API key, Stripe webhook, Stripe checkout or Stripe-hosted payment flow should be introduced by this branch.
