export async function onRequestGet({ request, env, params }) {
  // Extract the requested path/slug
  const slug = params.slug;

  // 1. Static Asset Bypass (Crucial for Dashboard and UI)
  // If the request is for the dashboard, admin panel, or a file with an extension, ignore it as a shortlink
  const bypassedPaths = ['dashboard', 'dashboard.html', 'admin', 'admin.html', 'favicon.ico'];
  
  if (!slug || slug.includes('.') || bypassedPaths.includes(slug.toLowerCase())) {
    // Tell Cloudflare to stop processing this function and load the static HTML file instead
    return env.ASSETS.fetch(request);
  }

  // 2. Process Actual Link Redirection
  try {
    const targetUrl = await env.ILS.get(slug);
    
    // If the slug doesn't exist in the database
    if (!targetUrl) {
      return new Response('Short link not found or expired.', { status: 404 });
    }

    // Successfully redirect the user
    return Response.redirect(targetUrl, 302);
    
  } catch (err) {
    // Catch and log execution errors silently
    console.error('Redirection System Error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
