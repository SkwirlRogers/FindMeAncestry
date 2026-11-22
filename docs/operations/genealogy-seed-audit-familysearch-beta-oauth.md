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

Five adjacency rows are currently imported and name/GEOID-validated for Person County, North Carolina (GEOID `37145`). This is complete for Person County only; statewide adjacency coverage remains partial. The national 2026 source has been audited but has **not** been imported. Historical jurisdiction changes are not loaded.

## Official geography sources recorded

- [2026 National Counties Gazetteer ZIP](https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2026_Gazetteer/2026_Gaz_counties_national.zip)
- [2026 National County Subdivisions Gazetteer ZIP](https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2026_Gazetteer/2026_Gaz_cousubs_national.zip)
- [2026 National County Adjacency File (TXT)](https://www2.census.gov/geo/docs/reference/county_adjacency/county_adjacency2026.txt)
- [U.S. Census Bureau Gazetteer Files](https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html)
- [2026 County Adjacency File documentation](https://www.census.gov/geographies/reference-files/time-series/geo/county-adjacency.html)

The two Gazetteer ZIP files are recorded as source leads but have not been imported. The 2026 adjacency file is the source for the 3,222 imported names and GEOIDs, plus the five validated Person County neighbor records.

## 2026 national adjacency source audit (import pending)

The live 2026 Census County Adjacency File was retrieved and parsed on 2026-11-22.

- Source file: [2026 County Adjacency TXT](https://www2.census.gov/geo/docs/reference/county_adjacency/county_adjacency2026.txt)
- 18,969 lines including the header
- 18,958 directed relationship rows
- 9,479 unique undirected county/county-equivalent pairs after sorting GEOIDs and deduplicating reverse-direction rows
- 9,476 unique pairs remain when scoped to the existing 3,222 current registry GEOIDs (50 states, DC, and Puerto Rico); the 13 Island Areas GEOIDs are excluded until those jurisdictions are explicitly added
- 3,235 unique GEOIDs in the national file, including 13 Island Areas GEOIDs
- 10 records have a county GEOID but blank neighbor fields; three are current Hawaii county GEOIDs (`15001`, `15003`, `15007`) and seven belong to Island Areas. The three current Hawaii records should receive `no_adjacency_rows_in_source` coverage rather than being treated as missing data
- Reverse-direction records were checked; no conflicting shared-boundary lengths were found
- The Length field is in meters. Point-touch neighbors are valid and have a zero-length boundary; the Census file also includes certain water-separated neighbors

The existing current-jurisdiction registry contains 3,222 records for the 50 states, DC, and Puerto Rico. The 13 Island Areas GEOIDs are outside that registry and must not be silently added as adjacency endpoints without first adding and validating their jurisdiction records. The planned national import is therefore scoped to pairs whose two endpoints are in the existing current registry, with a coverage row for each of those 3,222 GEOIDs.

**Import status:** no national adjacency batch has been committed. Cloudflare D1 returned free-tier daily row-read-limit error 7500 during the write attempt, before any batch was accepted. The existing five Person County adjacency rows remain the only imported adjacency records until the D1 allowance resets and the national import can be run and verified. Do not update the County Explorer's Person-County-only coverage notice until a read-back confirms the import.

## Historical boundary source roadmap

The next historical-jurisdiction build should use separate source types rather than treating current Gazetteer files as historical records:

1. **Geographic Boundary Change Notes (through December 31, 2025):** Census records selected new/deleted entities, name changes/corrections, FIPS/code changes, county boundary changes/corrections, and higher-level geographic relationship changes. Records include effective date, event description, source of change, and submission date. Census cautions that neither the effective date nor submission date always identifies when a change was applied to the geographic database or which annual product first reflects it. These are event records, not a complete map of every historical county boundary. [Overview and record fields](https://www.census.gov/programs-surveys/geography/technical-documentation/boundary-change-notes.2025.html). Direct national files verified: [2025](https://www2.census.gov/geo/docs/reference/bndrychange/national_gcn_2025.txt), [2024](https://www2.census.gov/geo/docs/reference/bndrychange/national_gcn_2024.txt), [2022](https://www2.census.gov/geo/docs/reference/bndrychange/national_gcn_2022.txt), [2021](https://www2.census.gov/geo/docs/reference/bndrychange/national_gcn_2021.txt), and [2014–2020 combined](https://www2.census.gov/geo/docs/reference/bndrychange/national_gcn_2014_2020.txt). The [2014–2020 North Carolina file](https://www2.census.gov/geo/docs/reference/bndrychange/st37_nc_gcn_2014_2020.txt) includes county boundary events such as Ashe/Wilkes, Chatham/Wake, and cross-state boundary exchanges. The 2023 national filename was not verified during this pass and must be located before claiming a complete 2021–2025 series.
2. **Substantial County Changes, 1970–present:** Census summarizes substantial county/county-equivalent changes using population/area thresholds; it explicitly does not provide before-and-after maps. Use as a curated event index, not a complete boundary geometry source. [Census County Changes](https://www.census.gov/programs-surveys/geography/technical-documentation/county-changes.html)
3. **Boundary and Annexation Survey (BAS) reference files:** legal boundary changes, annexations, incorporations, mergers, consolidations, and disincorporations reported by governments. These are useful for event provenance but do not include every non-legal boundary correction. [BAS Reference Files](https://www.census.gov/programs-surveys/bas/geographies/reference-files.html)
4. **Annual Gazetteer files:** authoritative current-year names, GEOIDs, area measurements, and representative points for current geography. Use for year-by-year current snapshots, not as a substitute for dated historical events. [2026 Gazetteer Files](https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html)

The 2025 national file demonstrates why event-type filtering matters: many records describe place and county-subdivision changes or redistricting rather than county-level changes. County timeline ingestion must classify the record type and extract only county/county-equivalent events, while retaining the original description for audit. Preserve effective and submitted dates as separate fields; do not treat either as the definitive date a yearly Census geography product changed.

Every future historical record should retain its source, effective date (when available), processing/reference date, event type, old and new GEOIDs/names, and confidence/coverage notes. Do not infer a county's exact historical boundary or effective date from a name-only change note.

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
