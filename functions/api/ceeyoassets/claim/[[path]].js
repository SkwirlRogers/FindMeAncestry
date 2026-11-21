const HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
export async function onRequestGet(){
  return new Response(JSON.stringify({ok:false,configured:false,error:'CeeYoAssets claim tracking is not enabled yet. Claim status is controlled by the official agency holding the property.',official_help:'https://unclaimed.org/claim-your-found-property/'}),{status:503,headers:HEADERS});
}
