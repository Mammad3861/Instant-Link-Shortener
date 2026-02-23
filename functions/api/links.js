// Fetch all active short links for the admin dashboard.
export async function onRequestGet({ request, env }) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  
  if (token !== env.MASTER_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Fetch all keys from the ILS namespace
    const list = await env.ILS.list();
    const links = [];

    for (const key of list.keys) {
      const name = key.name;
      // Skip system keys used for rate limiting, bans, and admins
      if (name.startsWith('ban_') || name.startsWith('rl_') || name.startsWith('admin_')) {
        continue;
      }
      
      const targetUrl = await env.ILS.get(name);
      links.push({
        slug: name,
        url: targetUrl
      });
    }

    return new Response(JSON.stringify({ links }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Failed to fetch links:', err);
    return new Response('Server Error', { status: 500 });
  }
}