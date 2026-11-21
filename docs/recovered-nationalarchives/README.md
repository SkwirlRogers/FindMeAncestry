# National Archives and FindMeAncestry R2 recovery audit

**Date:** 2026-11-21  
**Source:** R2 bucket `rnb-intelligence-inbox`, FindMeAncestry project backup tree.

## What was recovered
The FindMeAncestry repository is already the main FindMeAncestry copy. The R2 checkpoint contains newer/different versions of several existing pages and assets, plus backend files that were absent from the GitHub repository. The separate `resource_hub_backup_originals/nationalarchives` directory is the user's independent SkwirlWorld National Archives site.

The National Archives static site includes:
- a 52 KB `index.html` with 52 state/territory entries (50 states, DC, and Puerto Rico);
- a 52 KB `genealogy-dashboard.html` with 50 state rows;
- shared navigation, shared CSS, and shared utility scripts held under the old FindMeAncestry backup;
- a separate services page, MyAssets page, estate research page, Node server, CAO Python service, and data pipeline source.

This recovery adds the public directory and dashboard to the FindMeAncestry copy and makes their shared navigation work on same-domain routes.

## Missing or disconnected pieces found
1. `server.js` points its root route to `genealogy_hub.html`, but that file is absent from the National Archives directory and was not found in any of the 12 inspected R2 buckets. The recovered static site uses `index.html`.
2. The pipeline README names `full_genealogy_pipeline.py`, but that file was not found in any of the 12 inspected R2 buckets.
3. `genealogy_api.py` expects `genealogy_hub.sqlite`; the available database is named `genealogy_seed.sqlite`. The separate `backend_app_main_py.py` expects the seed database. The schema, data and API versions need reconciliation before deployment.
4. The SQLite seed database and `archives.db` are present in R2, but have not been imported into a live database or attached to a production API.
5. The Node server requires a shared `hub_llm.js` module and local ports 8003/8005. Those dependencies are not part of the static Wix deployment.
6. The old Book Hub link pointed to `http://localhost:8006`; this copy now routes to the FYBF Legacy Library page.
7. The old newsletter handler called `/api/newsletter/subscribe`, which does not exist in the current repository. It now displays a truthful contact notice rather than claiming signup succeeded.
8. The old shared navigation routed to localhost ports 8004–8009. It now links only to verified same-domain pages: FindMeAncestry, National Archives, FYBF Legacy Library, and CeeYoAssets.
9. The MyAssets, services, and estate-research pages contain unverified payment, claim-intake, and local API integrations. They are not added as functional public pages by this recovery. Assettie remains separate from Kayla's private genealogy archive.

## Security and release boundaries
- No API credentials, tokens, Stripe secrets, or private archive data are added.
- The archived Playwright login automation for third-party genealogy sites is not enabled. Use official APIs, user-authorized exports, and permitted portal links.
- The recovered static pages are a research directory, not a live universal genealogy search engine.
- Database-backed jurisdiction search and automated data refresh remain separate engineering tasks.
