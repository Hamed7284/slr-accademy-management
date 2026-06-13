export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try { body = await request.json(); } 
  catch (e) {
    return new Response(JSON.stringify({ error: 'invalid request' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }
  const prompt = body.prompt;
  if (!prompt || typeof prompt !== 'string') {
    return new Response(JSON.stringify({ error: 'prompt required' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not set' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'Anthropic error' }), {
        status: res.status, headers: { 'Content-Type': 'application/json' }
      });
    }
    const text = (data.content || []).map(c => c.text || '').join('\n').trim();
    return new Response(JSON.stringify({ text }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestGet() {
  return new Response(JSON.stringify({ error: 'POST only' }), {
    status: 405, headers: { 'Content-Type': 'application/json' }
  });
}
