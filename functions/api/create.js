// Generate a 6-character random slug
const generateSlug = () => Math.random().toString(36).substring(2, 8);

// --- Content Safety Guardian ---
// A comprehensive list of keywords we want to actively block to keep our service clean, safe, and professional.
const blocklist = [
  'porn', 'xxx', 'xvideos', 'pornhub', 'xnxx', 'xhamster', 
  'casino', 'betting', 'malware', 'phishing', 'onlyfans'
];

export async function onRequestPost({ request, env }) {
  const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';
  const banKey = `ban_${clientIp}`;
  const rateLimitKey = `rl_${clientIp}`;

  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();
  
  let role = 'public';
  if (token === env.MASTER_KEY) {
    role = 'master';
  } else if (token) {
    const isSubAdmin = await env.ILS.get(`admin_${token}`);
    if (isSubAdmin) role = 'subadmin';
  }

  const isAdmin = role === 'master' || role === 'subadmin';

  // Check if public access is disabled
  if (!isAdmin) {
    const publicStatus = await env.ILS.get('config_public_status') || 'open';
    if (publicStatus === 'closed') {
      return new Response('Service is currently private', { status: 403 });
    }
  }

  // Enforce IP bans and rate limits for public users
  if (!isAdmin && clientIp !== 'unknown') {
    if (await env.ILS.get(banKey)) return new Response('Access Denied', { status: 403 });
    if (await env.ILS.get(rateLimitKey)) return new Response('Too Many Requests', { status: 429 });
  }

  try {
    // Get variables from request
    let { url, customSlug, ttl } = await request.json();
    if (!url) return new Response('Missing URL', { status: 400 });

    // Auto-prepend https:// if the user forgot it
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    // Validate the corrected URL
    try { new URL(url); } catch { return new Response('Invalid URL', { status: 400 }); }
    
    const lowerUrl = url.toLowerCase();
    const isUnsafe = blocklist.some(keyword => lowerUrl.includes(keyword));
    
    if (isUnsafe) {
      if (!isAdmin && clientIp !== 'unknown') {
        const logData = JSON.stringify({ attemptedUrl: url, timestamp: new Date().toISOString() });
        await env.ILS.put(banKey, logData, { expirationTtl: 7200 }); // 2-hour ban
      }
      return new Response('Forbidden: Unsafe link', { status: 403 });
    }

    let finalSlug;
    let expirationTtl;

    if (isAdmin) {
      finalSlug = customSlug ? customSlug.trim() : generateSlug();
      // Convert hours to seconds (e.g., 2 hours = 7200 seconds)
      if (ttl && Number(ttl) > 0) {
        expirationTtl = Math.floor(Number(ttl) * 3600);
        if (expirationTtl < 60) expirationTtl = 60; // Cloudflare minimum is 60s
      }
    } else {
      finalSlug = generateSlug();
      expirationTtl = 600; // 10-minute default for public
    }

    if (await env.ILS.get(finalSlug)) {
      return new Response('Slug already in use', { status: 409 });
    }

    const options = {};
    if (expirationTtl) options.expirationTtl = expirationTtl;
    if (isAdmin) options.metadata = { creator: role === 'master' ? 'master' : token };

    await env.ILS.put(finalSlug, url, options);

    if (!isAdmin && clientIp !== 'unknown') {
      await env.ILS.put(rateLimitKey, '1', { expirationTtl: 60 });
    }

    return new Response(JSON.stringify({ 
      slug: finalSlug, url, expiresIn: expirationTtl || 'never', role 
    }), { status: 201, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('Create Link Error:', err);
    return new Response('Server Error', { status: 500 });
  }
}
