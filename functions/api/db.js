const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (!key) return new Response(JSON.stringify({ error: 'key required' }), { status: 400, headers: CORS });
  try {
    const value = await env.SLR_DB.get(key);
    return new Response(JSON.stringify({ value: value ? JSON.parse(value) : null }), { headers: CORS });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { key, value } = await request.json();
    if (!key) return new Response(JSON.stringify({ error: 'key required' }), { status: 400, headers: CORS });
    await env.SLR_DB.put(key, JSON.stringify(value));
    return new Response(JSON.stringify({ ok: true }), { headers: CORS });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}
