export async function onRequestDelete({ request, env }) {
  try {
    // 1. Authenticate the user role
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();
    
    let isAdmin = (token === env.MASTER_KEY);
    if (!isAdmin && token) {
      isAdmin = !!(await env.ILS.get(`admin_${token}`));
    }
    
    if (!isAdmin) {
      return new Response('Unauthorized Access', { status: 401 });
    }

    // 2. Extract and validate the target slug
    const { slug } = await request.json();
    if (!slug) {
      return new Response('Missing slug parameter', { status: 400 });
    }

    // 3. Remove the entry from the KV database
    await env.ILS.delete(slug);
    
    return new Response(JSON.stringify({ success: true }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (err) {
    console.error('Delete Link Error:', err);
    return new Response(`Server Error: ${err.message}`, { status: 500 });
  }
}
