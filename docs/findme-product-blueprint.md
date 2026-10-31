# FindMeAncestry — Real Product Execution Blueprint

This is the full working blueprint for turning the current repo from a static marketing concept into a real SaaS product.

The goal:
- keep the premium brand, story, and positioning
- turn the static site into a working product ecosystem
- build a real user workflow for genealogy research
- add premium access, saved cases, saved searches, and AI-assisted research
- make the repo function like a commercial-grade platform instead of a brochure

---

## Current repo reality

The repo already has:
- strong brand identity
- premium positioning
- AI concept pages
- pricing architecture
- dashboard/workspace concept
- Cloudflare Functions structure
- multiple product pages already built

What it is missing:
- real user authentication
- real subscription state
- real research case management
- real saved search history
- actual case-linked AI context
- product data storage
- protected premium features
- analytics and conversion tracking

This repo is already a strong skeleton. It needs the body.

---

## Product direction

FindMeAncestry should become:
- a genealogy research platform
- a premium AI-assisted family investigation product
- a membership-based SaaS
- a content + lead-gen engine
- a research workspace for family records, DNA, surname work, and investigation flows

The product should be built in layers:
1. acquisition layer
2. product layer
3. workspace layer
4. AI research layer
5. monetization layer
6. SEO and growth layer

---

## Architecture recommendation

Use a Cloudflare-native stack:

- Cloudflare Pages
  - public marketing pages
  - app shell
- Cloudflare Workers / Functions
  - auth
  - billing
  - cases
  - searches
  - chat
  - admin
- D1 database
  - users
  - subscriptions
  - cases
  - searches
  - chats
- R2 storage
  - uploads
  - documents
  - research exports
- KV
  - sessions
  - feature flags
  - caching
- Stripe / Google Pay
  - monetization
- Turnstile
  - bot protection

This gives the repo a real operating system behind the current pages.

---

## Product model

### Core user types
- demo
- free user
- subscriber
- admin

### Core subscription tiers
- Discovery
- Forensic Explorer
- Advocate
- Investigator

### Core product features
- account creation
- login/logout
- subscription status
- premium workspace access
- saved family cases
- saved searches
- research notes
- AI chat threads
- exportable research reports
- admin analytics

---

## Product data model

### Users
- id
- email
- password hash
- full name
- role
- status
- created_at
- last_login

### Plans
- id
- name
- price
- internal_tier
- features_json
- is_active

### Subscriptions
- id
- user_id
- plan_id
- status
- started_at
- ends_at
- provider
- provider_customer_id

### Cases
- id
- user_id
- title
- status
- notes
- created_at
- updated_at

### Case people
- id
- case_id
- first_name
- middle_name
- last_name
- birth_year
- death_year
- birth_location
- death_location
- gender
- relationship_type

### Saved searches
- id
- user_id
- query_text
- filters_json
- created_at

### Chat threads
- id
- user_id
- case_id
- assistant_type
- title
- created_at
- updated_at

### Chat messages
- id
- thread_id
- role
- content
- created_at

### Uploads
- id
- user_id
- case_id
- file_name
- storage_key
- mime_type
- created_at

### Audit logs
- id
- user_id
- action
- metadata_json
- created_at

---

## API surface

### Auth
- /api/auth/register
- /api/auth/login
- /api/auth/logout
- /api/auth/me
- /api/auth/reset-password

### Subscriptions
- /api/subscriptions/plans
- /api/subscriptions/checkout
- /api/subscriptions/status
- /api/subscriptions/portal
- /api/subscriptions/webhook

### Cases
- /api/cases
- /api/cases/create
- /api/cases/:id
- /api/cases/:id/people
- /api/cases/:id/notes
- /api/cases/:id/export

### Searches
- /api/search
- /api/search/save
- /api/search/history

### Chat
- /api/scout/chat
- /api/scout/context
- /api/scout/threads
- /api/scout/threads/:id/messages
- /api/assetie/chat

### Admin
- /api/admin/users
- /api/admin/subscriptions
- /api/admin/cases
- /api/admin/analytics

---

## Frontend conversion plan

### Current pages and their intended role
- index.html
  - marketing funnel
  - acquisition page
  - pricing and CTA page

- scout_chat.html
  - premium AI research experience
  - demo and subscriber mode

- assetie_chat.html
  - asset recovery/financial research vertical

- dashboard.html
  - member workspace
  - cases, search history, research workspace, plan status

- dna-hub.html
  - premium DNA and match workflow area

- map-view.html
  - migration and ancestry mapping tool

- resource-hub.html
  - content + education + lead capture

- surname-center.html
  - specialist lineage and surname analysis area

- sync-center.html
  - imports, exports, and data sync

- findme_bridge.html
  - research / data bridge workflow

The site already has the right page structure. The next move is to connect each page to actual app logic.

---

## Product roadmap

### Phase 1: Foundation
- auth flow
- demo vs subscriber state
- protected workspaces
- dashboard shell
- simple account panel
- saved sessions

### Phase 2: SaaS core
- case creation
- case lists
- saved searches
- notes and evidence
- user profile and dashboard

### Phase 3: AI research workflow
- case-linked ScoutAI chats
- premium chat constraints
- user-specific chat threads
- saved research outputs
- AI context tied to case records

### Phase 4: Premium conversion
- pricing gating
- upgrade flow
- billing status
- conversion tracking
- retention milestones

### Phase 5: Growth engine
- SEO landing pages
- long-tail genealogy pages
- topic clusters
- content library
- analytics and optimization

---

## Current repo progress

The repo has already started to move in the right direction with:
- account state layer
- premium access awareness
- dashboard workspace upgrades
- saved cases and saved search logic

This is the product layer starting to show up behind the marketing shell.

---

## What to do next

The next exact implementation sequence is:

1. finalize account and session state
2. add plan-tier logic
3. add real case creation form
4. save and render case lists
5. save and render recent searches
6. link chat to selected case and account
7. add plan-based gating
8. add billing and status flow
9. add analytics and conversion tracking
10. expand SEO and content pages

This is the correct product sequence.

---

## Strategic summary

The repo should not remain a static concept.
It should become a real product with:
- premium account system
- working research workspace
- case management
- saved search flow
- AI-powered genealogy assistance
- paid product tiers
- content and growth engine

That is the real FindMeAncestry.

This is where the project becomes a serious commercial platform instead of a landing page with a story.

---

## Final call

This repo is already strong enough to become a real product. The next move is not more styling or more copy. It is product logic, data, access control, and workflow systems.

If this repo is reopened in a direct workspace with editing access, the next steps should be:
- auth
- plans
- case management
- saved searches
- chat state
- premium gating
- billing layer
- analytics

That is the actual path to building the real business behind FindMeAncestry.

This is the product blueprint.
