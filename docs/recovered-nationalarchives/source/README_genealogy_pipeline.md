# Genealogy Hub Pipeline Pack

Contents:
- genealogy_seed.sqlite: starter SQLite seed with states, current seed rows, historical seed rows, and resource links.
- genealogy_schema.sql: normalized schema for SQLite/Postgres.
- full_genealogy_pipeline.py: ETL scaffold for official current subdivisions, historical jurisdictions, and resource enrichment.
- genealogy_api.py: FastAPI search API starter.
- genealogy_pipeline_seed_workbook.xlsx: spreadsheet view of the seed data.

Expected next inputs in ./data:
- states.csv
- official_current_subdivisions.csv
- historical_jurisdictions.csv
- resource_links.csv

Recommended source families:
- Census county/county-equivalent references
- FamilySearch state and county wiki pages
- USGenWeb state/county projects
- National Archives and state archives directories
- Library of Congress local history/genealogy guides
- State libraries, local libraries, cemetery indexes, and county history portals