const HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
};
function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}
// Official portals listed in NAUPA's state/province directory. Names are never forwarded.
const STATE_PORTALS = {
  AL:['Alabama','https://unclaimed.alabama.gov/'], AK:['Alaska','https://unclaimedproperty.alaska.gov/'],
  AZ:['Arizona','https://azdor.gov/unclaimed-property'], AR:['Arkansas','https://auditor.ar.gov/'],
  CA:['California','https://sco.ca.gov/upd_msg.html'], CO:['Colorado','https://colorado.findyourunclaimedproperty.com/'],
  CT:['Connecticut','https://ctbiglist.gov/'], DE:['Delaware','https://unclaimedproperty.delaware.gov/'],
  DC:['District of Columbia','https://unclaimedproperty.dc.gov/'], FL:['Florida','https://claimyourcashfl.gov/'],
  GA:['Georgia','https://dor.georgia.gov/unclaimed-property'], GU:['Guam','https://doa.guam.gov/treasurer-of-guam/'],
  HI:['Hawaii','https://budget.hawaii.gov/finance/unclaimedproperty/'], ID:['Idaho','https://yourmoney.idaho.gov/'],
  IL:['Illinois','https://icash.illinoistreasurer.gov/'], IN:['Indiana','https://www.indianaunclaimed.gov/'],
  IA:['Iowa','https://www.iowatreasurer.gov/for-citizens/great-iowa-treasure-hunt/'], KS:['Kansas','https://kansascash.ks.gov/'],
  KY:['Kentucky','https://treasury.ky.gov/Pages/index.aspx'], LA:['Louisiana','https://lacashclaim.org/'],
  ME:['Maine','https://www.maineunclaimedproperty.gov/'], MD:['Maryland','https://www.claimitmd.gov/'],
  MA:['Massachusetts','https://www.findmassmoney.gov/'], MI:['Michigan','https://unclaimedproperty.michigan.gov/'],
  MN:['Minnesota','https://mn.gov/commerce/consumers/your-money/find-missing-money/'], MS:['Mississippi','https://treasury.ms.gov/for-citizens/unclaimed-property/'],
  MO:['Missouri','https://treasurer.mo.gov/UnclaimedProperty/en/'], MT:['Montana','https://revenue.mt.gov/'],
  NE:['Nebraska','https://treasurer.nebraska.gov/up/'], NV:['Nevada','https://www.nevadatreasurer.gov/Unclaimed_Property/UP_Home/'],
  NH:['New Hampshire','https://www.findnhmoney.gov/'], NJ:['New Jersey','https://www.nj.gov/treasury/unclaimed-property/'],
  NM:['New Mexico','https://www.tax.newmexico.gov/individuals/what-is-unclaimed-property/search-unclaimed-property/'],
  NY:['New York','https://www.osc.ny.gov/unclaimed-funds'], NC:['North Carolina','https://www.nccash.gov/'],
  ND:['North Dakota','https://unclaimedproperty.nd.gov/'], OH:['Ohio','https://unclaimed.org/search/'],
  OK:['Oklahoma','https://www.ok.gov/treasurer/Unclaimed_Property/index.html'], OR:['Oregon','https://unclaimed.oregon.gov/'],
  PA:['Pennsylvania','https://www.patreasury.gov/unclaimed-property/'], PR:['Puerto Rico','https://www.ocif.pr.gov/consumidores'],
  RI:['Rhode Island','https://www.findrimoney.gov/'], SC:['South Carolina','https://treasurer.sc.gov/what-we-do/for-citizens/unclaimed-property-program/'],
  SD:['South Dakota','https://southdakota.findyourunclaimedproperty.com/'], TN:['Tennessee','https://treasury.tn.gov/Unclaimed-Property/Claim-Unclaimed-Property/Find-Your-Missing-Money'],
  TX:['Texas','https://www.claimittexas.gov/'], UT:['Utah','https://mycash.utah.gov/'],
  VT:['Vermont','https://www.vermonttreasurer.gov/content/unclaimed-property'], VA:['Virginia','https://www.vamoneysearch.gov/'],
  WA:['Washington','https://ucp.dor.wa.gov/'], WV:['West Virginia','https://wvtreasury.gov/'],
  WI:['Wisconsin','https://www.revenue.wi.gov/Pages/UnclaimedProperty/Home.aspx'], WY:['Wyoming','https://statetreasurer.wyo.gov/UnclaimedProperty.aspx']
};
const FEDERAL_SOURCES = [
  {id:'fdic',name:'FDIC — Unclaimed property from failed banks',url:'https://www.fdic.gov/bank-failures/unclaimed-property-information-state',note:'State-by-state contacts for unclaimed accounts at failed banks.'},
  {id:'pbgc',name:'PBGC — Find unclaimed retirement benefits',url:'https://www.pbgc.gov/workers-retirees/find-unclaimed-retirement-benefits',note:'Benefits from certain terminated pension plans.'},
  {id:'dol',name:'U.S. Department of Labor — Workers Owed Wages',url:'https://webapps.dol.gov/wow/',note:'Back wages recovered by the Wage and Hour Division.'},
  {id:'hud',name:'HUD — FHA mortgage insurance refunds',url:'https://entp.hud.gov/dsrs/refunds/',note:'Search the HUD/FHA refund database.'},
  {id:'courts',name:'U.S. Courts — Bankruptcy unclaimed funds',url:'https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics/unclaimed-funds-bankruptcy',note:'Official guidance for locating bankruptcy court unclaimed funds.'},
  {id:'ncua',name:'NCUA — Unclaimed credit union deposits',url:'https://ncua.gov/support-services/conservatorships-liquidations/unclaimed-deposits',note:'Information about unclaimed deposits from liquidated credit unions.'},
  {id:'irs',name:'IRS — Refund status',url:'https://www.irs.gov/refunds',note:'Federal tax refund status; not a general unclaimed-property search.'}
];
function normalizeState(value) {
  if (!value) return '';
  const v=String(value).trim().toUpperCase();
  if (STATE_PORTALS[v]) return v;
  return Object.keys(STATE_PORTALS).find(code=>STATE_PORTALS[code][0].toUpperCase()===v)||'';
}
export async function onRequestGet({request}) {
  const url=new URL(request.url);
  const state=normalizeState(url.searchParams.get('state'));
  const stateSources=state?[{id:state.toLowerCase(),name:STATE_PORTALS[state][0]+' official unclaimed-property program',url:STATE_PORTALS[state][1],category:'state',authority:'Portal listed by NAUPA'}]:[];
  const national=[
    {id:'naupa',name:'NAUPA — Official state program directory',url:'https://unclaimed.org/search/',category:'national',authority:'National Association of Unclaimed Property Administrators'},
    {id:'missingmoney',name:'MissingMoney.com — Multi-state search',url:'https://www.missingmoney.com/',category:'national',authority:'NAUPA-sponsored search for participating states'}
  ];
  return json({
    ok:true,mode:'official_source_directory',search_performed:false,name_transmitted:false,
    generated_at:new Date().toISOString(),selected_state:state||null,
    notice:'This prepares official source links only. It does not search agency databases, return person-level matches, verify ownership, or file claims. Enter names only on the official portal you choose.',
    sources:[...stateSources,...national,...FEDERAL_SOURCES.map(s=>({...s,category:'federal'}))],
    state_directory:Object.entries(STATE_PORTALS).map(([code,[name,portal]])=>({code,name,url:portal}))
  });
}
