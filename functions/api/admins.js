// Manage sub-admins. Strict MASTER_KEY authorization required.

export async function onRequestGet({ request, env }) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${env.MASTER_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Fetch all sub-admin tokens from KV
    const list = await env.ILS.list({ prefix: 'admin_' });
    const admins = list.keys.map(key => key.name.replace('admin_', ''));
    
    return new Response(JSON.stringify({ admins }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Fetch Admins Error:', err);
    return new Response('Server Error', { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${env.MASTER_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { token, name } = await request.json();
    if (!token) return new Response('Missing token', { status: 400 });

    // Store sub-admin token. The value is a label/name.
    await env.ILS.put(`admin_${token}`, name || 'Sub-Admin');
    
    return new Response('Sub-admin created', { status: 201 });
  } catch (err) {
    return new Response('Server Error', { status: 500 });
  }
}

export async function onRequestDelete({ request, env }) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${env.MASTER_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { token } = await request.json();
    if (!token) return new Response('Missing token', { status: 400 });

    await env.ILS.delete(`admin_${token}`);
    return new Response('Sub-admin removed', { status: 200 });
  } catch (err) {
    return new Response('Server Error', { status: 500 });
  }
}