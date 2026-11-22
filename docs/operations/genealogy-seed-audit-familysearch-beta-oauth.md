# FindMeAncestry genealogy seed audit and FamilySearch Beta OAuth

**Status date:** 2026-11-21  
**Environment:** Cloudflare D1 + Worker staging  
**Scope:** FindMeAncestry / National Archives only. The FRU Legacy Library and Central Library were not modified.

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

The 3,141 and 50 rows are retained in `seed_quarantine_jurisdictions` and `seed_quarantine_historical` with a quarantine reason. They are not available through public API endpoints. No synthetic placeholder row is used as a published county.

### Duplicate reconciliation

The earlier workbook import duplicated the 250 SQLite resource links. The duplicate rows were removed by grouping on state, resource type, title, and URL. Current counts are 50 states and 250 unique state-level resource links. Three national Census geography source references were added, bringing the resource-link directory to 253 unique rows.

## Current geography import

The U.S. Census Bureau's 2026 County Adjacency File was used to import distinct primary county and county-equivalent names and five-character GEOIDs.

**Verified D1 import totals:**

| Geography | Records |
|---|---:|
| 50 states | 3,143 |
| District of Columbia | 1 |
| Puerto Rico | 78 |
| **Total current county/county-equivalent records** | **3,222** |

The state-level subdivision counts were updated from this source. Examples checked against the import include North Carolina (100 counties), Connecticut (9 planning regions), Alaska (30 county equivalents), Virginia (133 county equivalents), DC (1), and Puerto Rico (78 municipios). Person County, North Carolina is present as GEOID `37145`.

Five directed adjacency rows are imported and name/GEOID-validated for Person County, North Carolina (GEOID `37145`). This is complete for Person County only; statewide adjacency coverage is partial. Historical jurisdiction changes are not loaded.

## Official geography sources recorded

- [2026 National Counties Gazetteer ZIP](https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2026_Gazetteer/2026_Gaz_counties_national.zip)
- [2026 National County Subdivisions Gazetteer ZIP](https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2026_Gazetteer/2026_Gaz_cousubs_national.zip)
- [2026 National County Adjacency File (TXT)](https://www2.census.gov/geo/docs/reference/county_adjacency/county_adjacency2026.txt)
- [U.S. Census Bureau Gazetteer Files](https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html)
- [2026 County Adjacency File documentation](https://www.census.gov/geographies/reference-files/time-series/geo/county-adjacency.html)

The two Gazetteer ZIP files are recorded as source leads but have not been imported. The 2026 adjacency file is the source for the 3,222 imported names and GEOIDs, plus the five validated Person County neighbor records.

## Staging database

Cloudflare D1 database: `findmeancestry-genealogy-staging`

Tables include:

- `states`
- `resource_links`
- `jurisdictions`
- `jurisdiction_changes`
- `jurisdiction_adjacency`
- `import_manifest`
- `geography_import_manifest`
- `seed_quarantine_jurisdictions`
- `seed_quarantine_historical`
- `fs_oauth_transactions`
- `fs_exchange_codes`
- `fs_sessions`

## Live staging API

Worker: `findmeancestry-genealogy-api`  
Custom domain: [genealogy-api.skwirlrogers.store](https://genealogy-api.skwirlrogers.store/health)

The custom domain is attached to the Worker and the health endpoint has been smoke-tested successfully (HTTP 200).

- `GET /health`
- `GET /api/states`
- `GET /api/resources?state_abbr=NC`
- `GET /api/resources?state_abbr=US`
- `GET /api/search?q=Person`
- `GET /api/jurisdictions?state_abbr=NC`
- `GET /api/jurisdictions?state_abbr=VA`
- `GET /api/jurisdictions?state_abbr=PR`
- `GET /api/adjacency?geoid=37145`
- `GET /api/adjacency?state_abbr=NC`
- `GET /api/timeline`

The NC jurisdiction endpoint returns 100 current county records, and the search endpoint returns Person County with GEOID 37145. The Person County adjacency endpoint returns five validated neighbors. State-level adjacency responses explicitly report partial coverage until all counties in a state are imported. Public genealogy reference endpoints are read-only. Resource-link leads remain marked unverified. The API does not search or expose private surname files, private family records, or quarantined placeholders.

## Public County Explorer

Published page: [FindMeAncestry County & Boundary Explorer](https://www.findyourbabyfamily.com/findmeancestry/county-explorer.html)

The page is linked from the FindMeAncestry homepage and Resource Hub. It uses the live staging API to browse county names and GEOIDs by state, search across jurisdictions, and display neighboring jurisdictions where the adjacency source has been imported. It uses the existing FYBF assistant script and does not add a third assistant or modify the Central Library or FRU Legacy Library.

The page clearly states that only Person County currently has complete adjacency coverage and that historical boundary changes are not yet loaded.

## FamilySearch Beta OAuth preparation

FamilySearch Developer Support issued a Beta AppKey for the FamiliesR Us / FindYourBabyFamily application and requires the callback URI and product Realm to be registered before authentication.

Proposed registration:

- **Beta callback URI:** `https://genealogy-api.skwirlrogers.store/familysearch/callback`
- **Realm:** `https://www.findyourbabyfamily.com`

A reply draft requesting these registrations is saved in the Families R Us Superhuman mailbox thread. It has **not** been sent. Authentication must remain pending until FamilySearch confirms the registration.

The Worker contains a PKCE S256 authorization-code flow with state validation, one-time exchange codes, AES-GCM token encryption, and opaque server-side sessions. The token-encryption secret is configured in Cloudflare. The FamilySearch AppKey is not yet configured as the Worker secret `FS_APP_KEY`; it must never be placed in source control, static site files, query strings, logs, or documentation.

OAuth routes:

- `GET /familysearch/login`
- `GET /familysearch/callback`
- `POST /api/familysearch/exchange`
- `GET /api/familysearch/status`
- `POST /api/familysearch/disconnect`

The login route reports that Beta credentials are not fully configured until `FS_APP_KEY` is present. No FamilySearch user data is currently imported, and no production access is claimed.

FamilySearch documentation:

- [Authentication](https://developers.familysearch.org/main/docs/authentication)
- [Obtain Access Token](https://developers.familysearch.org/main/docs/obtain-access-token)
- [Getting Started](https://developers.familysearch.org/main/docs/getting-started)

FamilySearch's Beta environment is for testing. Production access follows its compatibility process; this implementation is not yet certified.

## Privacy and separation rules

- Do not publish private surname JSON or private archive records.
- Do not expose Kayla's private archive through the public Assettie assistant.
- Keep FYBF's two assistants, Scout and Assettie, separate from the Central Library's assistants.
- Do not change the FRU Legacy Library or Central Library while developing this backend.
- Do not advertise live person searches, private-record access, or claim submission until the relevant authorized integration exists and has been tested.
