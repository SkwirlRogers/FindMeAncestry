# FindMeAncestry — Technical SEO and Commercial Release Audit

**Audit basis:** repository source on `main`, production deployment evidence recorded November 3, 2026, and connected Search Console inventory check on November 4, 2026. This is a source-level audit, not a live crawler score.

## Verified SEO findings

| Area | Evidence | Status |
|---|---|---|
| Homepage title | `index.html` has a branded title and product phrase | Present; can be made more intent-focused |
| Meta description | Present; describes genealogy, DNA matches, historical records, Scout | Present; claims should be aligned to verified live capabilities |
| Canonical URL | No canonical link in inspected homepage head | Missing |
| Open Graph / social metadata | No OG or Twitter card metadata in inspected homepage head | Missing |
| Structured data | No JSON-LD in inspected homepage head | Missing |
| Sitemap | `sitemap.xml` not found in default branch | Missing |
| robots.txt | Allows all public paths and disallows `/api/`; no sitemap directive | Partial |
| Search Console | Connected GSC Wizard account returned no registered properties | Not connected/registered |
| Internal links | Footer contains placeholder `href="#"` links for Privacy Policy, Terms, Accessibility | Release blocker |
| HTML validity | Homepage source includes malformed input markup around Country field (an input element closes with `</`) | Fix and validate |
| Production reproducibility | Latest Pages production deployment recorded at commit `5460a978...`, marked dirty | Release blocker |
| Product claims | Homepage contains “search billions,” “12-platform” network, and broad live capability statements | Evidence review required |

## Homepage metadata direction

Use a concise title and description that match the actual service, not a guarantee or unverified scale claim. Proposed draft (do not publish until the canonical hostname and live product scope are confirmed):

- Title: `FindMeAncestry | Guided Genealogy & Family History Research`
- Description: `Organize family-history clues, explore historical-record research paths, and learn DNA genealogy methods with FindMeAncestry and Scout.`

Canonical host is currently ambiguous because the project has a Pages subdomain and a second, differently spelled legacy Pages project/domain in the Cloudflare inventory. Confirm the intended public hostname before emitting canonical tags or sitemap URLs.

## High-priority implementation queue

### P0 — trust and technical correctness
- Confirm the intended public host and reconcile `findmeancestry` versus `findmeancentry`; do not redirect or rename either based on spelling alone.
- Fix malformed HTML and run an HTML validator.
- Remove or replace placeholder legal links only after real policy pages and contact details exist.
- Reconcile all product capability claims with working routes and connected services.
- Build from a clean commit and verify the deployed artifact matches the repository.

### P1 — crawl and shareability
- Add a sitemap containing only canonical public URLs that return 200 and are intended for indexing.
- Add the sitemap location to robots.txt.
- Add canonical tags after host confirmation.
- Add Open Graph and Twitter metadata using the approved brand image.
- Add relevant JSON-LD only when the page supports it: Organization, WebSite, SoftwareApplication (only if the product description and offer data are accurate), and BreadcrumbList where breadcrumbs are visible.
- Add unique title, description, H1, and internal links to each indexable page.
- Set noindex on account, dashboard, upload, API, private, and thin/duplicate utility pages where appropriate.
- Check broken links, redirect chains, duplicate titles, orphan pages, image dimensions/alt text, mobile rendering, and Core Web Vitals.

### P1 — analytics and indexing
- Register the confirmed canonical property in Google Search Console.
- Verify ownership and submit the sitemap.
- Connect consent-aware GA4 or another approved analytics system.
- Record events: `demo_start`, `scout_chat_start`, `research_tool_open`, `qualified_enquiry`, `checkout_start`, `purchase`, `subscription_cancel`.
- Never log names, family-history details, DNA data, uploaded filenames, or chat content in marketing analytics.
- Use UTMs for each channel and creative; report reach separately from impressions.

### P0 — paid conversion and privacy gates
- Google Pay checkout endpoint currently returns a simulated success; it does not charge a card or provision a subscription.
- Server-side access must not trust a client-provided `isSubscribed` flag.
- Public prices and the SQL plan seeds conflict; the owner approved the homepage prices as canonical. Update the authoritative server-side plan source to match only after tracing the actual deployed database/schema and migration path.
- Production Pages binding `DNA_BUCKET` points to `nutteros-library`, also bound to the NUTTEROS kernel Worker. The shared storage configuration is confirmed; disclosure is not established. Isolate FindMeAncestry family/DNA uploads using a separately approved, restricted storage boundary before paid acquisition.
- Test subscription lifecycle, payment failure, renewal, cancellation, refunds, tax, receipts, account access, and support escalation.

## SEO score and acceptance

A “five-star SEO rating” cannot be promised or honestly assigned from source inspection alone. A named auditor must crawl the exact production URL and report its scoring rubric. Release acceptance should require:

- No critical HTML or crawl errors.
- Valid sitemap and robots rules.
- Canonical URLs resolve to the intended host.
- No broken internal links or placeholder legal links.
- Unique metadata and useful indexable content on every public landing page.
- Mobile usability and accessibility checks passed.
- Search Console ownership verified and sitemap accepted.
- Analytics events tested without collecting sensitive family or DNA data.
- Search performance reported from real impressions, clicks, queries, and indexed-page data.

## Launch decision

**Do not send paid traffic to subscription checkout yet.** Build awareness and educational content can be prepared, but paid conversion campaigns remain blocked until checkout, entitlement security, storage isolation, legal/support pages, analytics, and clean deployment are verified.
