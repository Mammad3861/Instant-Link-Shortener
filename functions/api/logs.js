export async function onRequestGet({ request, env }) {
  // Require admin authentication
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${env.API_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Fetch all keys with the 'ban_' prefix
    const list = await env.ILS.list({ prefix: 'ban_' });
    const logs = [];

    // Retrieve violation details for each blocked IP
    for (const key of list.keys) {
      const data = await env.ILS.get(key.name);
      const ip = key.name.replace('ban_', '');
      
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          logs.push({ ip, ...parsedData });
        } catch {
          // Fallback if data is not JSON
          logs.push({ ip, rawData: data });
        }
      }
    }

    return new Response(JSON.stringify({ logs }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Log Fetch Error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}