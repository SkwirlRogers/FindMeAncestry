export const onRequestPost = async ({request}) => {
  try {
    const {token, tier, amount} = await request.json();
    // In a real implementation you would send the token to your payment gateway.
    // Here we just simulate success for testing purposes.
    console.log('Received Google Pay token for', tier, amount);
    return new Response(JSON.stringify({success:true, message:`Payment simulated for ${tier} ($${amount})`} ), {
      headers:{'Content-Type':'application/json'}
    });
  } catch (e) {
    console.error('Error in checkout handler', e);
    return new Response(JSON.stringify({success:false, message:e.message}), {
      status:500,
      headers:{'Content-Type':'application/json'}
    });
  }
};
