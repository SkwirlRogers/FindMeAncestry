# SkwirlWorld National Archives — recovery copy

This folder restores the user's independent **SkwirlWorld: National Archival & Deep Research** site into the FindMeAncestry/FYBF web project.

## Public pages
- `index.html`: state and territory genealogy jurisdiction directory with client-side search, filters, state cards, and official research links.
- `data/genealogy-dashboard.html`: standalone 50-state jurisdiction dashboard with embedded state rows and filters.

The shared navigation and visual system live in the repository's root `_shared/` folder so both this site and the main FindMeAncestry copy can use them.

## Important boundaries
- This is the user's independent genealogy research directory. It is not the U.S. National Archives and Records Administration and does not represent that agency.
- The directory's embedded records are research starting points. They do not prove a record exists or that a source has been searched.
- The dashboard has 50 state rows. The main directory includes the 50 states plus District of Columbia and Puerto Rico. It is not a complete global/local county database.
- The page does not perform live agency searches. It links users to research sources.
- The legacy newsletter handler has been changed to a clear contact notice because this repository has no `/api/newsletter/subscribe` endpoint.
- The old localhost Book Hub link has been replaced with the FYBF Legacy Library route.
- Shared navigation now uses same-domain page paths rather than obsolete localhost ports.

## Backend recovery still outstanding
The R2 archive contains:
- `genealogy_seed.sqlite` (1,404,928 bytes)
- `archives.db` (20,480 bytes)
- `genealogy-dashboard.html` (52,778 bytes)
- FastAPI starter source and a SQL schema.

The static site copy does not yet load either database. The archived API files expect different database filenames (`genealogy_seed.sqlite` vs `genealogy_hub.sqlite`) and require a reviewed deployment, data import, and current-source validation before they can be enabled.

Two references in the legacy package are missing from all 12 inspected R2 buckets:
- `genealogy_hub.html`, referenced by the archived National Archives `server.js` root route.
- `full_genealogy_pipeline.py`, named in the archived pipeline README.

The archived server also depends on a shared LLM module and local ports that are not available in Wix static hosting. Those services have not been enabled or represented as live.
