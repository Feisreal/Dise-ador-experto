/**
 * Cloudflare Worker para FEISS Knowledge
 * Proxy, seguridad, caching y manejo de solicitudes
 */

/**
 * Manejador principal de solicitudes
 */
export default {
  async fetch(request, env, ctx) {
    // Añadir headers de seguridad
    const headers = new Headers();
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-XSS-Protection', '1; mode=block');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; img-src 'self' data: https:; font-src 'self' cdnjs.cloudflare.com;");

    const url = new URL(request.url);
    const pathname = url.pathname;

    // Rutas de API
    if (pathname.startsWith('/api/')) {
      return handleAPI(request, env, ctx);
    }

    // Rutas de archivos estáticos (con caché)
    if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
      return handleStatic(request, env, ctx);
    }

    // Rutas dinámicas
    if (pathname === '/' || pathname === '/index.html') {
      return handleHome(request, env, ctx);
    }

    if (pathname === '/landing' || pathname === '/landing.html') {
      return handleLanding(request, env, ctx);
    }

    // 404
    return new Response('Not Found', { status: 404, headers });
  },

  /**
   * Manejador de webhooks de Stripe
   */
  async scheduled(event, env, ctx) {
    // Tareas programadas
    console.log('Ejecutando tareas programadas');
  }
};

/**
 * Maneja solicitudes de API
 */
async function handleAPI(request, env, ctx) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Validar método y origen
  if (request.method === 'OPTIONS') {
    return handleCORS(request);
  }

  // Proxy a Vercel
  const vercelUrl = `https://feispla.vercel.app${pathname}${url.search}`;
  
  const proxyRequest = new Request(vercelUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' ? request.body : undefined
  });

  try {
    const response = await fetch(proxyRequest);
    return addSecurityHeaders(response);
  } catch (error) {
    return new Response(JSON.stringify({ error: 'API Error', message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Maneja archivos estáticos con caché
 */
async function handleStatic(request, env, ctx) {
  const url = new URL(request.url);
  const cacheKey = new Request(url.toString(), { method: 'GET' });
  const cache = caches.default;

  // Intentar obtener del caché
  let response = await cache.match(cacheKey);
  if (response) {
    return response;
  }

  // Proxy a Vercel
  const vercelUrl = `https://feispla.vercel.app${url.pathname}${url.search}`;
  const proxyRequest = new Request(vercelUrl, { method: 'GET' });

  try {
    response = await fetch(proxyRequest);
    
    if (response.status === 200) {
      // Cachear por 30 días
      const cacheHeaders = new Headers(response.headers);
      cacheHeaders.set('Cache-Control', 'public, max-age=2592000');
      const cachedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: cacheHeaders
      });
      ctx.waitUntil(cache.put(cacheKey, cachedResponse.clone()));
      return addSecurityHeaders(cachedResponse);
    }

    return addSecurityHeaders(response);
  } catch (error) {
    return new Response('Static file not found', { status: 404 });
  }
}

/**
 * Maneja la página de inicio
 */
async function handleHome(request, env, ctx) {
  const url = new URL(request.url);
  const vercelUrl = `https://feispla.vercel.app/index.html`;
  
  try {
    const response = await fetch(vercelUrl);
    return addSecurityHeaders(response);
  } catch (error) {
    return new Response('Home page not found', { status: 404 });
  }
}

/**
 * Maneja la página de landing
 */
async function handleLanding(request, env, ctx) {
  const url = new URL(request.url);
  const vercelUrl = `https://feispla.vercel.app/landing.html`;
  
  try {
    const response = await fetch(vercelUrl);
    return addSecurityHeaders(response);
  } catch (error) {
    return new Response('Landing page not found', { status: 404 });
  }
}

/**
 * Maneja solicitudes CORS
 */
function handleCORS(request) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

/**
 * Añade headers de seguridad a la respuesta
 */
function addSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
