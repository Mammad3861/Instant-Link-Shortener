// Handle link deletion with role-based ownership checks

export async function onRequestDelete({ request, env }) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  
  const isMaster = token === env.MASTER_KEY;
  // Verify if the token belongs to a valid sub-admin
  const isSubAdmin = token ? await env.ILS.get(`admin_${token}`) : false;

  if (!isMaster && !isSubAdmin) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { slug } = await request.json();
    if (!slug) return new Response('Missing slug', { status: 400 });

    // Enforce ownership for sub-admins
    if (!isMaster) {
      // getWithMetadata retrieves the hidden creator tag
      const { value, metadata } = await env.ILS.getWithMetadata(slug);
      
      if (!value) {
        return new Response('Link not found', { status: 404 });
      }
      
      if (!metadata || metadata.creator !== token) {
        return new Response('Forbidden: You can only delete your own links', { status: 403 });
      }
    }

    // Master admins bypass the check, sub-admins pass if it's their link
    await env.ILS.delete(slug);
    return new Response('Link deleted successfully', { status: 200 });

  } catch (err) {
    console.error('Delete Error:', err);
    return new Response('Server Error', { status: 500 });
  }
}