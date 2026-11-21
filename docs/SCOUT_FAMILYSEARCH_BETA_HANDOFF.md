# Scout / FamilySearch Beta API Handoff

**Product:** FamiliesR Us | FindYourBabyFamily  
**Persona:** Scout (genealogy, DNA, family history, family reunification)  
**Evidence checked:** connected mailboxes and repository on 2026-11-21  
**Status:** Beta AppKey issued by FamilySearch; integration is not yet connected.

## 1. What the email confirms

FamilySearch Partners Support accepted FamiliesR Us | FindYourBabyFamily into its Beta Program as an Innovator Solution Provider. Support issued a Beta AppKey on 2026-11-16 and repeated it on 2026-11-18. The key is intentionally not copied into this repository or this document; store it only in the deployment's secret manager.

Support requires:
1. Register an OAuth redirect/callback URI for the Beta environment.
2. Supply the product Realm (the main product URL).
3. Use an authenticated OAuth 2.0 authorization-code session. Support explicitly said unauthenticated-session and client-credentials flows are not available for this application.
4. After the Beta integration demonstrates authentication plus read/write operations, submit a recorded Compatibility compliance video and wait for written compatibility status and Solution Gallery instructions.

The Beta AppKey does not mean Production access has been granted.

## 2. Official OAuth requirements

FamilySearch's current Authorization Code Flow guide says:
- `client_id` is the assigned AppKey;
- `redirect_uri` must be registered before it is used;
- `response_type=code`;
- `state` is recommended;
- PKCE is recommended for web apps and required for native/mobile apps;
- after consent, the app receives a one-time authorization code and exchanges it for tokens;
- the callback must validate state and must not log or expose authorization codes or tokens.

Official docs:
- [Authorization Code Flow](https://developers.familysearch.org/main/docs/authorization-code-flow)
- [Developer Support](https://developers.familysearch.org/main/docs/developer-support)
- [API Key Management](https://developers.familysearch.org/main/docs/api-key-management)

## 3. Candidate callback and Realm (not yet registered)

Candidate product Realm: `https://www.findyourbabyfamily.com`

Candidate web callback: `https://www.findyourbabyfamily.com/api/familysearch/callback`

These are proposals only. Before sending them to FamilySearch, verify that the exact domain is served by the deployment that will host the callback, implement and test the callback endpoint, and confirm the production routing path. Do not register an endpoint that does not yet exist.

A separate localhost callback may be registered for local development if needed. Do not use the production AppKey or credentials in an untrusted development environment.

## 4. Repository state

The current repository does not yet contain a FamilySearch OAuth callback or token exchange implementation.

- `functions/api/findme/search.js` returns HTTP 503 when `FINDME_BRIDGE_URL` is not configured.
- `functions/api/findme/trees.js` returns HTTP 503 when the bridge is not configured.
- No FamilySearch OAuth route was found by code search.
- The source atlas contains a FamilySearch public-site capture, but that is not an API integration.

Do not label Scout as FamilySearch API-connected until a real authenticated Beta session has been tested.

## 5. Safe implementation sequence

1. Confirm the exact callback host and deployment routing.
2. Implement OAuth authorization start with a cryptographically random state and PKCE S256.
3. Implement callback state validation, error handling, and one-time code exchange on the server.
4. Store access/refresh tokens only in an encrypted server-side secret or token store; never in browser storage, logs, chat transcripts, R2 public objects, or Git.
5. Request the minimum required scopes and obtain user consent.
6. Add read-only person, relationship, and tree operations first; test against Beta fixtures and a user-owned test tree.
7. Add writes only after explicit user action, clear preview, duplicate checks, and confirmation.
8. Demonstrate authentication, reading, and writing on Beta; submit the required compatibility recording.
9. Wait for written compatibility status and Production enablement before using Production data.

## 6. Other genealogy services found in mail

- **MyHeritage:** consumer Data-plan trial and affiliate correspondence; no developer API access was issued. A May 2026 terms email explicitly noted restrictions on AI and automated data extraction.
- **Ancestry:** consumer Pro Tools subscription/marketing; no developer API access was issued or requested in the email results.
- **Pinterest:** API access request denied; not a genealogy data provider.
- Other messages were book-promotion outreach, not API approvals.

FamilySearch is the only direct genealogy developer API access confirmed in the searched mailboxes. Other services can be linked as user-directed research portals or support authorized GEDCOM/data imports where allowed; do not scrape their private member records or infer API access from a subscription.
