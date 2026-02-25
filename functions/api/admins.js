export async function onRequest(context) {
  try {
    const { request, env } = context;

    // 1. Strict Authentication: Only MASTER_KEY can manage admins
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();
    
    if (token !== env.MASTER_KEY) {
      return new Response('Forbidden: Master key privileges required', { status: 403 });
    }

    // 2. Handle GET request: List all sub-admins
    if (request.method === 'GET') {
      const data = await env.ILS.list({ prefix: 'admin_' });
      const admins = data.keys.map(k => k.name.replace('admin_', ''));
      return new Response(JSON.stringify({ admins }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 3. Handle POST request: Add a new sub-admin
    if (request.method === 'POST') {
      const { name, token: newToken } = await request.json();
      if (!newToken) return new Response('Token is required', { status: 400 });
      
      await env.ILS.put(`admin_${newToken}`, name || 'SubAdmin');
      return new Response(JSON.stringify({ success: true }), { status: 201 });
    }

    // 4. Handle DELETE request: Remove a sub-admin
    if (request.method === 'DELETE') {
      const { token: tokenToRemove } = await request.json();
      await env.ILS.delete(`admin_${tokenToRemove}`);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response('Method Not Allowed', { status: 405 });

  } catch (err) {
    console.error('Admin Management Error:', err);
    return new Response(`Server Error: ${err.message}`, { status: 500 });
  }
}
