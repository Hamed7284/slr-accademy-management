// Cloudflare Pages Function
// مسیر: /api/coach-suggestion
// این فایل به‌عنوان یک پروکسی امن بین فایل HTML و Anthropic API عمل می‌کند.
// کلید API هرگز در کد یا در مرورگر کاربر دیده نمی‌شود — فقط در سرور Cloudflare
// به‌صورت یک Environment Variable به اسم ANTHROPIC_API_KEY ذخیره می‌شود.

export async function onRequestPost(context) {
  const { request, env } = context;

  // فقط درخواست‌های JSON با فیلد "prompt" قبول می‌شود
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'بدنه درخواست نامعتبر است' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const prompt = body.prompt;
  if (!prompt || typeof prompt !== 'string') {
    return new Response(JSON.stringify({ error: 'فیلد prompt الزامی است' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({
      error: 'کلید API روی سرور تنظیم نشده است. ANTHROPIC_API_KEY را در تنظیمات Cloudflare Pages اضافه کنید.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
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

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'خطا در ارتباط با Anthropic' }), {
        status: anthropicRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const text = (data.content || []).map(c => c.text || '').join('\n').trim();

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'خطا در ارتباط با سرویس هوش مصنوعی: ' + e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// درخواست‌های غیر از POST را رد می‌کنیم
export async function onRequestGet() {
  return new Response(JSON.stringify({ error: 'فقط متد POST پشتیبانی می‌شود' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}
