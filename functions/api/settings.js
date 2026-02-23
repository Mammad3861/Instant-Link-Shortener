// Manage global system settings. Master admin only.

export async function onRequestGet({ request, env }) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${env.MASTER_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Default status is 'open' if not set
    const status = await env.ILS.get('config_public_status') || 'open';
    return new Response(JSON.stringify({ publicStatus: status }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Settings fetch error:', err);
    return new Response('Server Error', { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${env.MASTER_KEY}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { publicStatus } = await request.json();
    if (publicStatus !== 'open' && publicStatus !== 'closed') {
      return new Response('Invalid status value', { status: 400 });
    }

    await env.ILS.put('config_public_status', publicStatus);
    return new Response('Settings updated successfully', { status: 200 });
  } catch (err) {
    console.error('Settings update error:', err);
    return new Response('Server Error', { status: 500 });
  }
}