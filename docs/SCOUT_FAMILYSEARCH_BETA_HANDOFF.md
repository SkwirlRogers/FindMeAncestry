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
- The source atlas contains a FamilySearch public-site capture, but that is not an API integration. A separate archived FindMeAncestry genealogy resource hub is also present in R2: it includes a SQLite seed database, a normalized schema for states, current/historical jurisdictions, boundary changes, and resource links, plus FastAPI starter endpoints such as `/states`, `/jurisdictions`, `/timeline`, and `/resource-links`. Its country subdivision selector includes Australia, Brazil, Canada, France, Germany, Spain, India, Italy, the Netherlands, New Zealand, the United Kingdom, the United States, and Kosovo. This is a promising Scout jurisdiction/resource-discovery foundation, but it is an archived prototype: its database freshness, completeness, hosting, and current deployment are not verified, and it is not an Assettie unclaimed-property engine.

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

| Service | Mail evidence | API/developer access |
|---|---|---|
| **Ancestry** | Pro Tools purchased 2025-11-27; renewal notices followed; membership cancellation notice 2026-04-24 due to outdated payment information | None found |
| **MyHeritage** | Account created 2025-12-13; 14-day Data-plan trial began; payment declined at trial end 2025-12-28 and paid-plan access ended; affiliate application submitted 2026-03-17 with no approval found | None found |
| **GEDmatch** | Welcome email 2026-08-15 confirms a free account was activated | None found |
| **Fold3** | Discount promotions only; no purchase confirmation found | None found |
| **Newspapers.com** | Mentioned as a benefit of Ancestry All Access promotions; no standalone purchase confirmation found | None found |
| **OldNews.com** | Seven-day trial promotion only; no signup confirmation found | None found |
| **Findmypast, Geneanet, American Ancestors** | No related emails found in the searched mailboxes | None found |

A MyHeritage terms-update email dated 2026-05-11 called out restrictions on AI and automated data extraction. Do not build automated extraction against MyHeritage from the consumer trial or affiliate relationship. Ancestry Pro Tools was a consumer subscription, not API permission. GEDmatch account activation is not API permission.

FamilySearch is the only direct genealogy developer API access confirmed in the searched mailboxes. Other services can be linked as user-directed research portals or support authorized GEDCOM/data imports where allowed; do not scrape their private member records or infer API access from a subscription.

## 7. Legacy Scout resource hub in R2

The R2 archive also contains the older `nationalarchives/data` resource-hub prototype:
- `genealogy_api.py` and `backend_app_main_py.py`: FastAPI starter service;
- `genealogy_schema.sql`: tables for states, jurisdictions, jurisdiction changes, and resource links;
- `genealogy_seed.sqlite`: a 1.4 MB SQLite seed database;
- `StatesDropdown.js`: country-to-subdivision selector with multiple national subdivision systems.

The API design includes current and historical jurisdictions, renamed/former jurisdictions, and links to state archives, libraries, county histories, FamilySearch, USGenWeb, cemeteries, and historical atlases. This appears to be the global-to-local genealogy backend you may have been remembering. It is distinct from the CeeYoAssets source atlas and from the FamilySearch API. Treat it as an archived candidate to recover and validate for Scout, not as an already-running service.
