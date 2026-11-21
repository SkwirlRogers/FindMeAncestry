CREATE TABLE states (
  state_abbr TEXT PRIMARY KEY,
  state_name TEXT NOT NULL,
  current_subdivision_count INTEGER,
  primary_subdivision_type TEXT,
  familysearch_state_url TEXT,
  usgenweb_url TEXT,
  loc_guide_url TEXT,
  state_archives_directory_url TEXT,
  census_reference_url TEXT
);

CREATE TABLE jurisdictions (
  jurisdiction_id TEXT PRIMARY KEY,
  state_abbr TEXT NOT NULL,
  state_name TEXT NOT NULL,
  jurisdiction_name TEXT NOT NULL,
  jurisdiction_type TEXT NOT NULL,
  status_current_or_former TEXT NOT NULL,
  fips_code TEXT,
  parent_jurisdiction TEXT,
  effective_start_date TEXT,
  effective_end_date TEXT,
  renamed_from TEXT,
  renamed_to TEXT,
  boundary_change_notes TEXT,
  familysearch_url TEXT,
  usgenweb_url TEXT,
  state_archive_url TEXT,
  state_library_url TEXT,
  county_history_url TEXT,
  local_library_url TEXT,
  cemetery_url TEXT,
  historical_atlas_url TEXT,
  notes TEXT
);

CREATE TABLE jurisdiction_changes (
  change_id TEXT PRIMARY KEY,
  state_abbr TEXT NOT NULL,
  old_name TEXT,
  new_name TEXT,
  change_type TEXT,
  effective_date TEXT,
  notes TEXT,
  source_url TEXT,
  source_title TEXT
);

CREATE TABLE resource_links (
  state_abbr TEXT NOT NULL,
  jurisdiction_id TEXT,
  resource_type TEXT NOT NULL,
  title TEXT,
  url TEXT NOT NULL,
  source_title TEXT,
  last_verified TEXT
);