// Adapts the Vercel/Express-style `(req, res)` handlers in /api to Netlify Functions
// (Request -> Response), so the handlers themselves stay unchanged.
export function wrap(handler) {
  return async (request, context) => {
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams);

    let body = {};
    if (!['GET', 'HEAD'].includes(request.method)) {
      const text = await request.text();
      if (text) {
        try { body = JSON.parse(text); } catch { body = text; }
      }
    }

    const headers = Object.fromEntries(request.headers);
    headers['x-forwarded-proto'] ||= url.protocol.replace(':', '');
    headers['x-forwarded-host'] ||= headers.host || url.host;

    const req = {
      method: request.method,
      url: url.pathname + url.search,
      query,
      body,
      headers,
      socket: { remoteAddress: context?.ip },
    };

    const outHeaders = new Headers();
    let statusCode = 200;
    let finish;
    const done = new Promise((resolve) => { finish = resolve; });
    const send = (payload) => finish(new Response(payload, { status: statusCode, headers: outHeaders }));

    const res = {
      status(code) { statusCode = code; return res; },
      setHeader(name, value) { outHeaders.set(name, value); return res; },
      json(data) {
        if (!outHeaders.has('content-type')) outHeaders.set('content-type', 'application/json');
        send(JSON.stringify(data));
        return res;
      },
      send(data) { send(typeof data === 'object' && data !== null ? JSON.stringify(data) : data ?? null); return res; },
      end(data) { send(data ?? null); return res; },
    };

    try {
      await handler(req, res);
      // Handler returned without responding
      send(null);
    } catch (err) {
      console.error('Function error:', err);
      statusCode = 500;
      outHeaders.set('content-type', 'application/json');
      send(JSON.stringify({ error: 'Internal server error' }));
    }
    return done;
  };
}
