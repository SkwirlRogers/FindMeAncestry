const HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
function json(body,status=200){return new Response(JSON.stringify(body),{status,headers:HEADERS});}
export async function onRequestPost(){
  return json({ok:false,configured:false,intake_enabled:false,error:'Secure CeeYoAssets claim intake is not enabled yet. No personal information was accepted or stored. Start or track a claim directly with the official agency holding the property.',official_help:'https://unclaimed.org/claim-your-found-property/'},503);
}
export async function onRequestGet(){
  return json({ok:false,error:'Claim intake is not enabled. Use the official agency claim portal.',official_help:'https://unclaimed.org/claim-your-found-property/'},503);
}
