export async function onRequestGet({ request, env }) {
  try {
    // --- 1. Security First: Verify the user's identity ---
    // We only want authorized personnel accessing this sensitive data.
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();
    
    let isAdmin = (token === env.MASTER_KEY);
    if (!isAdmin && token) {
      isAdmin = !!(await env.ILS.get(`admin_${token}`));
    }
    
    // If they don't have the key, gently show them the door.
    if (!isAdmin) {
      return new Response('Unauthorized Access', { status: 401 });
    }

    // --- 2. Gather the Data ---
    // Let's ask Cloudflare KV for everything we have stored.
    const data = await env.ILS.list();
    const links = [];

    // --- 3. Filter and Clean up ---
    // We need to separate actual short links from system configuration keys.
    for (const key of data.keys) {
      const name = key.name;
      
      // These prefixes are strictly for system use, so we hide them from the dashboard.
      const isSystemKey = name.startsWith('ban_') || 
                          name.startsWith('rl_') || 
                          name.startsWith('admin_') || 
                          name.startsWith('config_');
      
      if (!isSystemKey) {
        const url = await env.ILS.get(name);
        
        // Sometimes old or broken data leaves a "null" ghost behind. Let's filter those out.
        if (url && url !== 'null') {
          links.push({ slug: name, url: url });
        } else {
          // Housekeeping: automatically clean up corrupted or empty ghost links to save space!
          await env.ILS.delete(name);
        }
      }
    }

    // --- 4. Deliver the payload ---
    return new Response(JSON.stringify({ links }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (err) {
    // Something unexpected happened. Let's log it so we can fix it later.
    console.error('Fetch Links Error:', err);
    return new Response(`Server Error: ${err.message}`, { status: 500 });
  }
}
