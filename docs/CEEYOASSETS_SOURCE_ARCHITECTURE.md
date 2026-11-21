# CeeYoAssets Source Architecture and Expansion Plan

**Status:** research architecture; not a live search integration  
**Evidence snapshot:** CeeYo Source Atlas generated 2026-10-24; official-source checks refreshed 2026-11-21; R2 archive audit 2026-11-21  
**Product boundary:** Assettie / CeeYoAssets only. This document does not authorize access to Kayla's private genealogy archive or Scout's FamilySearch account.

## 1. Operating model

CeeYoAssets is a multi-jurisdiction, multi-asset research and official-portal handoff service. It is not one national database and it must not imply that a name search has queried every government or private holder.

Each source record must identify:
- jurisdiction and level: international, national/federal, state/province/territory, county/municipal, court, employer, insurer, plan administrator, or private holder;
- asset families supported;
- official owner/operator and canonical search URL;
- access mode: documented API, public search form, public downloadable data, user-authorized portal handoff, or manual contact;
- verification timestamp, last successful check, and evidence;
- limitations, eligibility caveats, authentication requirements, and whether the service can actually search it.

A captured website is archival evidence only. It is not a live agency connection, searchable database, API, match, claim, or ownership determination.

## 2. Existing R2 evidence

The private `ceeyo-source-atlas` snapshot in `rnb-intelligence-inbox` contains 93 source records across eight categories:

| Atlas category | Count |
|---|---:|
| Unclaimed-property portals | 59 |
| Government benefits | 10 |
| Records | 8 |
| Archives | 7 |
| Courts | 4 |
| DNA | 3 |
| Family services | 1 |
| Newspapers | 1 |
| **Total** | **93** |

The historical capture statuses were 70 full captures, 2 partial, 10 external, 9 evidence-only, and 2 retired. These are capture statuses as of 2026-10-24, not current source-health checks. Several URLs have since changed; for example, North Carolina's official portal is now `https://www.nccash.gov/`, not the old `nccash.com` domain. The source JSON contains generic DOL and PBGC home-page entries, but no airline-specific benefit source, no direct PBGC unclaimed-benefit search endpoint, and no explicit property-tax refund source. Those categories need dedicated, current official endpoints added and verified. Revalidate every URL before publishing it as a verified source.

The R2 handoffs describe three rounds of source capture and atlas work. The proposed site-integration patch was staged but the handoff explicitly says it was not applied to the live `fma_repo` surface. The atlas is a private research catalogue, not a live lookup backend. The separate `NEXUS_SURPRISE_HANDOFF.md` makes broad claims about 191 cloned engines and 60+ state asset portals, but those claims are not substantiated by a live connector or a verified source registry; they are not treated as deployed capabilities.

## 3. Asset taxonomy to support

### Employment, compensation, and retirement
- unpaid wages, back pay, payroll checks, commissions, bonuses, expense reimbursements;
- pensions, defined-benefit plans, 401(k)/defined-contribution plans, profit-sharing, annuities, abandoned plans, missing participants, union-sponsored plans;
- workers' compensation payments and uncashed benefit checks;
- employer stock, equity awards, dividends, and plan distributions.

**Airline-worker lead:** no airline-specific program was identified in the user's email search. Former airline employees should be routed by benefit type: PBGC for covered terminated private-sector pensions and the Department of Labor's Retirement Savings Lost and Found for reported private-sector employer or union retirement plans. Search by former employer, plan name, union, and employment dates. PBGC says additional limitations may apply to certain airline-industry plans; it does not guarantee severance, vacation pay, life insurance, health/welfare benefits, or every other non-pension benefit. A database match is not proof that money is owed.

### Insurance and annuity benefits
- life-insurance death benefits and group life policies;
- annuities, matured policies, endowments, retained-asset accounts;
- unpaid insurance claim payments, premium refunds, policy dividends, and other amounts due under a policy;
- property/casualty and auto-insurance refunds or uncashed claim checks where they become reportable unclaimed property.

**Important distinction:** the NAIC Life Insurance Policy Locator searches for life-insurance policies and annuity contracts of deceased persons. It is not an auto-insurance or general property-insurance claim search. Other insurance leads may require the insurer, state insurance department, or relevant state unclaimed-property office.

### Government, tax, and public finance
- federal and state tax refunds or credits;
- property-tax overpayments, duplicate payments, tax-sale surplus, and local-government refunds;
- housing and mortgage-related refunds;
- veterans' benefits and insurance;
- agency-issued checks, rebates, and other uncashed payments.

Property-tax refunds are often local or state-specific. Do not label a county tax collector, assessor, treasurer, or tax-sale surplus source as nationally searchable. Record the county/city and tax year as part of the source route.

### Financial, commercial, and tangible property
- bank accounts, savings, checking, certificates of deposit, money orders, cashier's checks;
- brokerage balances, stock shares, bonds, dividends, mutual funds, securities and underlying shares;
- credit balances, customer overpayments, vendor checks, gift-card balances where covered by state law;
- utility deposits, service refunds, rebates, traveler checks;
- safe-deposit-box contents and other tangible property;
- mineral, oil, gas, and other royalties.

### Courts, estates, and legal distributions
- bankruptcy-court unclaimed funds;
- state/local court registry balances and settlement distributions;
- estate, trust, fiduciary, missing-heir, and probate distributions;
- class-action settlement funds only where an official administrator or court source provides a public claimant search or distribution process.

Do not equate a potential heir clue with legal heirship. Escalate disputed ownership, probate, and court matters to qualified legal professionals.

## 4. Jurisdiction layers

1. **International:** national/provincial public authorities and cross-border benefit systems where official search services exist. The current 93-source atlas is not comprehensive global coverage.
2. **United States federal:** PBGC, DOL/EBSA, Treasury/Fiscal Service, IRS, FDIC, NCUA, HUD, VA, SEC, and federal court sources. Each has its own purpose and eligibility rules.
3. **State/territory:** each state's or territory's official unclaimed-property program, insurance regulator, revenue department, and other relevant agencies.
4. **Province/country outside the U.S.:** the responsible provincial or national treasury, insurance regulator, court, pension authority, or tax agency.
5. **County/municipal:** property-tax refunds, tax-sale surplus, local court registry funds, utility deposits, and municipal overpayments.
6. **Private holder/employer:** former employers, airline pension plan administrators, unions, insurers, banks, utilities, brokerages, and settlement administrators.

There is no single governmentwide source for all unclaimed money and assets. The product must run a source plan appropriate to the person's residence, former residences, work history, asset type, and relevant dates.

## 5. Verified official starting points (2026-11-21)

| Asset / task | Official starting point | What it can and cannot establish |
|---|---|---|
| State unclaimed property | [NAUPA / Unclaimed.org](https://unclaimed.org/) and each official state portal | Directory and state-by-state route; not a single universal federal search |
| North Carolina unclaimed property | [NCCASH.gov](https://www.nccash.gov/) | Official NC state program; free public search |
| Unclaimed retirement benefits | [PBGC unclaimed benefits search](https://www.pbgc.gov/workers-retirees/find-unclaimed-retirement-benefits/search-unclaimed) | Initial possible match; PBGC requires further verification and additional identifying information |
| Retirement plans / former employers and unions | [DOL Retirement Savings Lost and Found](https://lostandfound.dol.gov/) | Information database for reported private-sector employer/union plans; does not decide eligibility or pay benefits |
| Life insurance / annuities for deceased persons | [NAIC Life Insurance Policy Locator guidance](https://content.naic.org/article/learn-how-use-naic-life-insurance-policy-locator) | Free policy-locator request; insurer contacts a beneficiary if a policy is found |
| Federal agency-held payments | [USAGov unclaimed money guide](https://www.usa.gov/unclaimed-money) and [TreasuryDirect unclaimed money FAQ](https://www.treasurydirect.gov/help-center/unclaimed-money-and-assets-faqs/) | Separate agency-specific sources; no governmentwide database |
| U.S. bankruptcy court unclaimed funds | [U.S. Courts Unclaimed Funds Locator](https://ucf.uscourts.gov/) | Court-unit-specific funds and processes; each court unit maintains its own procedures |

## 6. Access and integration rules

- Use documented official APIs only within their published authorization and data-use terms.
- Where no API exists, provide an official portal handoff or a user-guided research workflow; do not silently scrape, bypass CAPTCHAs, evade rate limits, or automate a login contrary to a provider's terms.
- Keep source captures for internal evidence and engineering only. Do not serve captured agency pages as if they were current official pages.
- Never ask for or store Social Security numbers, bank credentials, one-time passcodes, identity documents, death certificates, claim forms, or other sensitive claim evidence in public chat.
- Do not upload claimant documents until authenticated case storage, encryption, access controls, retention/deletion policy, audit logging, and secure document handling are implemented and tested.
- Separate stages: source lead → possible match → evidence review → claimant identity/authority review → official claim submission → agency determination/payment. Assettie must not claim ownership or entitlement.
- Do not submit claims, sign agency forms, or contact holders as a claimant's agent until the legal authority and jurisdiction-specific registration requirements are satisfied.

## 7. North Carolina property-finder compliance gate

North Carolina's current N.C.G.S. §§ 116B-78 and 116B-78.1 impose specific requirements for fee-charging property finders dealing with covered unclaimed property:
- annual registration with the Department of State Treasurer;
- private-investigator licensure through the North Carolina Private Protective Services Board;
- written agreements that identify the property, holder, services, known value, possible competing claims, and fees;
- owner and authorized licensed-PI signatures notarized;
- total fees and costs capped at **$1,000 or 20% of recovered value, whichever is less**, for the ordinary covered agreement;
- a statutory time restriction on when covered agreements may be entered;
- no initiating a claim before registration, licensure, and a valid agreement.

The covered agreement is also void if entered during the statutory period beginning when the property is distributable and extending through 24 months after it is paid or delivered to the Treasurer. The North Carolina Treasurer says the public state search is free and advises consumers to contact the office before signing a finder agreement. This means a 25% fee must not be offered for covered North Carolina state-held unclaimed property. A 10% figure is not automatically permissible either: all registration, licensing, agreement, timing, and fee-cap requirements still apply. Estate/heir agreements can involve additional statutory provisions. Obtain North Carolina legal review before marketing, quoting, or accepting paid recovery work. Other jurisdictions have different rules; never apply the NC cap globally.

## 8. Current product status and next engineering gates

- The current CeeYo search endpoint is an honest official-portal handoff, not a connected asset search.
- Claim intake is disabled. The UI must not imply that a claim is filed, documents are received, or claim status is tracked.
- Assettie's public chat is separate from Kayla's private genealogy archive.
- The existing source atlas is not connected to the live search route.
- Build a versioned source registry with jurisdiction, asset type, access mode, current verification, source owner, limitations, and evidence.
- Add specialist routes for pensions, insurance, tax/property-tax refunds, court funds, wages, and state/provincial unclaimed property.
- Start with read-only source metadata and official portal handoffs. Add API-backed search only after each provider's terms, authentication, and data contract are verified.
- Keep paid claim assistance disabled until applicable licensing, registration, contracts, privacy, and legal review are complete.

## 9. Historical MyAssets / Estate Research prototype — pricing not approved

The R2 archive contains an older `MyAssets` page and an `estate_research.html` prototype. They contain inconsistent draft offers:
- 15–25% success commission;
- Basic Research: $497 flat or 10% of recovered amount;
- Full Claim Service: 20%;
- Large estates: 15–25%;
- Estate Research: $497 flat; Claim Preparation: 20%.

These are archived prototype strings, not an approved or current price list. The same prototype claims 50-state searches, claim filing, and an agent network, but its front end calls `/api/asset-scan` and `/api/kayla/intake`, while checkout merely displays a reminder to connect a Stripe secret. No matching live backend was established by this audit. Do not reuse the prices, performance claims, or claim-filing language without owner approval and jurisdiction-specific legal review.
