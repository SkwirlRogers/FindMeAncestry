# FindMeAncestry genealogy seed audit and FamilySearch Beta OAuth

**Status date:** 2026-11-21  
**Environment:** Cloudflare D1 + Worker staging  
**Scope:** FindMeAncestry / National Archives only. This work does not modify the Families R Us Legacy Library or the Central Library.

## Recovered SQLite source

Source object:

`R&B Intelligence/NuttNeptune Builder/Subscriton Builds/SkwirlWorld National Resources/genealogy_seed.sqlite`

- Size: 1,404,928 bytes
- R2 ETag: `c569be9a34bfa7b8ac060525a2e54691`
- SQLite page size: 4,096 bytes
- Tables found: `states`, `resource_links`, `jurisdictions_current_seed`, `jurisdictions_historical_seed`
- Indexes found: `idx_states_abbr`, `idx_current_state`, `idx_hist_state`

### Audit results

| Source table | Rows | Treatment |
|---|---:|---|
| `states` | 50 | Imported to public reference table |
| `resource_links` | 250 | Imported as unverified source leads |
| `jurisdictions_current_seed` | 3,141 | Preserved in quarantine; not published |
| `jurisdictions_historical_seed` | 50 | Preserved in quarantine; not published |

The current-jurisdiction seed rows explicitly label themselves as placeholders, e.g. names such as `Alabama County 001`, and state that they must be replaced by official current-subdivision imports. They contain no usable FIPS codes. The historical rows explicitly say that historical jurisdiction import is pending source harvest and do not identify historical units or dates.

The 3,141 and 50 rows are retained in `seed_quarantine_jurisdictions` and `seed_quarantine_historical` with a quarantine reason. They are not available through public API endpoints. Published `jurisdictions` and `jurisdiction_changes` remain empty until real source-backed data is imported.

### Duplicate reconciliation

The earlier workbook import duplicated the 250 SQLite resource links. The duplicate rows were removed by grouping on state, resource type, title, and URL. Current counts are 50 states and 250 unique state-level resource links. Three national Census geography source references were added, bringing the resource-link directory to 253 unique rows.

## Official current geography sources identified

The U.S. Census Bureau's 2026 Gazetteer page identifies national county and county-subdivision files for the 50 states, District of Columbia, and Puerto Rico. These are pipe-delimited national reference files with geographic identifiers and names.

- [2026 National Counties Gazetteer ZIP](https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2026_Gazetteer/2026_Gaz_counties_national.zip)
- [2026 National County Subdivisions Gazetteer ZIP](https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2026_Gazetteer/2026_Gaz_cousubs_national.zip)
- [2026 National County Adjacency File (TXT)](https://www2.census.gov/geo/docs/reference/county_adjacency/county_adjacency2026.txt)
- [U.S. Census Bureau Gazetteer Files](https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html)
- [2026 County Adjacency File documentation](https://www.census.gov/geographies/reference-files/time-series/geo/county-adjacency.html)

The adjacency file supplies county/county-equivalent GEOIDs and neighboring GEOIDs, including shared-boundary lengths. These sources are recorded in D1 under `state_abbr='US'`. The Gazetteer ZIP files have not yet been imported or validated row-by-row. Do not describe county or county-subdivision coverage as live until that import and QA are complete.

## Staging database

Cloudflare D1 database: `findmeancestry-genealogy-staging`

Tables include:

- `states`
- `resource_links`
- `jurisdictions`
- `jurisdiction_changes`
- `import_manifest`
- `seed_quarantine_jurisdictions`
- `seed_quarantine_historical`
- `fs_oauth_transactions`
- `fs_exchange_codes`
- `fs_sessions`

## Read-only genealogy API

Worker: `findmeancestry-genealogy-api`

- `GET /health`
- `GET /api/states`
- `GET /api/resources?state_abbr=NC`
- `GET /api/resources?state_abbr=US`
- `GET /api/search?q=North`
- `GET /api/jurisdictions`
- `GET /api/timeline`

The genealogy reference endpoints are read-only. The API returns source-link leads as unverified. It does not search or expose private surname files, private family records, or the quarantined placeholder rows.

## FamilySearch Beta OAuth preparation

FamilySearch Developer Support issued a Beta AppKey for the FamiliesR Us / FindYourBabyFamily application and requires the callback URI and product Realm to be registered before authentication.

Proposed registration:

- **Beta callback URI:** `https://findmeancestry-genealogy-api.skwirlynuts-nutteros.workers.dev/familysearch/callback`
- **Realm:** `https://www.findyourbabyfamily.com`

A reply draft requesting these registrations is saved in the Families R Us Superhuman mailbox thread. It has **not** been sent. Authentication must remain pending until FamilySearch confirms the registration.

The Worker now contains a PKCE S256 authorization-code flow with state validation, one-time exchange codes, AES-GCM token encryption, and opaque server-side sessions. The token-encryption secret is configured in Cloudflare. The FamilySearch AppKey must be added to the Worker secret store as `FS_APP_KEY`; never place it in source control, static site files, query strings, logs, or documentation.

OAuth routes:

- `GET /familysearch/login`
- `GET /familysearch/callback`
- `POST /api/familysearch/exchange`
- `GET /api/familysearch/status`
- `POST /api/familysearch/disconnect`

The login route intentionally reports that Beta credentials are not fully configured until `FS_APP_KEY` is present. No FamilySearch user data is currently imported, and no production access is claimed.

FamilySearch documentation:

- [Authorization Code Flow](https://developers.familysearch.org/main/docs/authorization-code-flow)
- [Developer Support — callback URI registration](https://developers.familysearch.org/main/docs/developer-support)
- [Getting Started](https://developers.familysearch.org/main/docs/getting-started)

FamilySearch's Beta environment is for testing. Production access follows its compatibility process; this implementation is not yet certified.

## Privacy and separation rules

- Do not publish private surname JSON or private archive records.
- Do not expose Kayla's private archive through the public Assettie assistant.
- Keep FYBF's two assistants, Scout and Assettie, separate from the Central Library's assistants.
- Do not change the FRU Legacy Library or Central Library while developing this backend.
- Do not advertise live person searches, private-record access, or claim submission until the relevant authorized integration exists and has been tested.
