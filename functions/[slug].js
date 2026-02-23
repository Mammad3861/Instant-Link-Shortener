export async function onRequestGet(context) {
  const { env, params } = context;
  const slug = params.slug;

  if (!slug) {
    return new Response('Bad Request: Missing slug', { status: 400 });
  }

  try {
    // Fetch the destination URL from Cloudflare KV
    const targetUrl = await env.ILS.get(slug);

    if (targetUrl) {
      return Response.redirect(targetUrl, 302);
    }

    // Slug not found in KV
    return new Response('Not Found', { status: 404 });

  } catch (err) {
    console.error('KV Read Error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}