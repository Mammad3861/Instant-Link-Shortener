// Generate a 6-character random slug
const generateSlug = () => Math.random().toString(36).substring(2, 8);

// --- Level 1: Fast Regex Guardian ---
const unsafePatterns = new RegExp([
  'porn', 'xxx', 'xvideos', 'pornhub', 'xnxx', 'xhamster', 'redtube', 
  'youporn', 'brazzers', 'chaturbate', 'onlyfans', 'rule34', 'nude',
  'casino', 'betting', '1xbet', 'gamble', 'free-robux', 'ponzi',
  'malware', 'phishing', 'hack', 'crack', 'nulled', 'grabber',
  '\\.tk/', '\\.ml/', '\\.ga/', '\\.cf/', '\\.gq/'
].join('|'), 'i');

export async function onRequestPost({ request, env }) {
  try {
    if (!env.ILS) return new Response("Database binding missing", { status: 500 });
    if (!env.MASTER_KEY) return new Response("Master key missing", { status: 500 });

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

    if (!isAdmin) {
      const publicStatus = await env.ILS.get('config_public_status') || 'open';
      if (publicStatus === 'closed') return new Response('Service is currently private', { status: 403 });
    }

    if (!isAdmin && clientIp !== 'unknown') {
      if (await env.ILS.get(banKey)) return new Response('Access Denied', { status: 403 });
      if (await env.ILS.get(rateLimitKey)) return new Response('Too Many Requests', { status: 429 });
    }

    let { url, customSlug, ttl } = await request.json();
    if (!url) return new Response('Missing URL', { status: 400 });

    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    try { new URL(url); } catch { return new Response('Invalid URL', { status: 400 }); }
    
    // --- Security Check 1: Fast Regex ---
    let isUnsafe = unsafePatterns.test(url);
    
    // --- Security Check 2: Google Safe Browsing API (If Configured) ---
    // This makes the project enterprise-grade while remaining completely optional.
    if (!isUnsafe && env.SAFE_BROWSING_KEY) {
      try {
        const gbUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${env.SAFE_BROWSING_KEY}`;
        const payload = {
          client: { clientId: "ils-cloudflare", clientVersion: "1.0" },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url: url }]
          }
        };
        
        const gbRes = await fetch(gbUrl, { method: 'POST', body: JSON.stringify(payload) });
        const gbData = await gbRes.json();
        
        if (gbData.matches && gbData.matches.length > 0) {
          isUnsafe = true;
          console.warn(`Google Safe Browsing blocked: ${url}`);
        }
      } catch (apiErr) {
        console.error('Google API Error (Skipping):', apiErr);
      }
    }
    
    // Handle Unsafe Content
    if (isUnsafe) {
      if (!isAdmin && clientIp !== 'unknown') {
        const logData = JSON.stringify({ attemptedUrl: url, timestamp: new Date().toISOString() });
        await env.ILS.put(banKey, logData, { expirationTtl: 7200 }); 
      }
      return new Response('Forbidden: Unsafe link', { status: 403 });
    }

    let finalSlug;
    let expirationTtl;

    if (isAdmin) {
      finalSlug = customSlug ? customSlug.trim() : generateSlug();
      if (ttl && Number(ttl) > 0) {
        expirationTtl = Math.floor(Number(ttl) * 3600);
        if (expirationTtl < 60) expirationTtl = 60; 
      }
    } else {
      finalSlug = generateSlug();
      expirationTtl = 600; 
    }

    if (await env.ILS.get(finalSlug)) return new Response('Slug already in use', { status: 409 });

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
    console.error('CRITICAL ERROR:', err);
    return new Response(`Server Error: ${err.message}`, { status: 500 });
  }
}
