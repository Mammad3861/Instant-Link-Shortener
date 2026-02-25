export async function onRequestGet({ request, env }) {
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

    // 2. Fetch all banned IP logs from the KV database
    const data = await env.ILS.list({ prefix: 'ban_' });
    const logs = [];

    // 3. Parse and format the log data
    for (const key of data.keys) {
      const logDataStr = await env.ILS.get(key.name);
      try {
        const logData = JSON.parse(logDataStr);
        logs.push({
          ip: key.name.replace('ban_', ''),
          attemptedUrl: logData.attemptedUrl || 'Unknown',
          timestamp: logData.timestamp || null
        });
      } catch (e) {
        // Fallback for older raw-text logs
        logs.push({ 
          ip: key.name.replace('ban_', ''), 
          attemptedUrl: logDataStr, 
          timestamp: null 
        });
      }
    }

    // 4. Return the formatted logs
    return new Response(JSON.stringify({ logs }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (err) {
    console.error('Fetch Logs Error:', err);
    return new Response(`Server Error: ${err.message}`, { status: 500 });
  }
}
