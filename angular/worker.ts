const API_ORIGIN = 'https://hotel-api-fo0z.onrender.com';

const WARMUP_PATHS = ['/swagger/index.html', '/api/app/hotel-settings'];

function shouldProxy(pathname: string): boolean {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/connect/') ||
    pathname.startsWith('/.well-known/') ||
    pathname.startsWith('/Abp/')
  );
}

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function warmupApi(): Promise<void> {
  await Promise.allSettled(
    WARMUP_PATHS.map((path) =>
      fetch(new URL(path, API_ORIGIN).toString(), {
        method: 'GET',
        headers: { accept: 'application/json, text/html;q=0.9' },
      }),
    ),
  );
}

async function fetchUpstreamWithRetry(target: string, init: RequestInit): Promise<Response> {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(target, init);
      const contentType = response.headers.get('content-type') ?? '';

      if (response.ok) {
        return response;
      }

      const retryable =
        response.status >= 500 ||
        response.status === 429 ||
        (contentType.includes('text/html') && target.includes('/api/'));

      if (!retryable || attempt === maxAttempts) {
        return response;
      }
    } catch {
      if (attempt === maxAttempts) {
        throw new Error('Upstream API unavailable');
      }
    }

    await sleep(3_000 * attempt);
  }

  throw new Error('Upstream API unavailable');
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (shouldProxy(url.pathname)) {
      const target = new URL(url.pathname + url.search, API_ORIGIN);
      const headers = new Headers(request.headers);
      headers.set('Host', new URL(API_ORIGIN).host);

      let response: Response;
      try {
        response = await fetchUpstreamWithRetry(target.toString(), {
          method: request.method,
          headers,
          body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
          redirect: 'follow',
        });
      } catch {
        return new Response(
          JSON.stringify({
            error: {
              message:
                'الخادم يستيقظ من السكون (Render). انتظر قليلاً وسيتم الاتصال تلقائياً دون تحديث الصفحة.',
            },
          }),
          { status: 503, headers: { 'content-type': 'application/json; charset=utf-8' } },
        );
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('text/html') && url.pathname.startsWith('/api/')) {
        return new Response(
          JSON.stringify({
            error: {
              message:
                'استجابة غير متوقعة من الخادم (صفحة HTML). تأكد من نشر آخر إصدار للـ API على Render.',
            },
          }),
          { status: 502, headers: { 'content-type': 'application/json; charset=utf-8' } },
        );
      }

      return response;
    }

    // عند فتح الموقع: أيقظ API في الخلفية (لا تنتظر)
    ctx.waitUntil(warmupApi());
    return env.ASSETS.fetch(request);
  },

  async scheduled(_event: ScheduledEvent, _env: Env, ctx: ExecutionContext): Promise<void> {
    // كل 14 دقيقة — يمنع نوم Render قدر الإمكان (الخطة المجانية تنام بعد ~15 دقيقة)
    ctx.waitUntil(warmupApi());
  },
};
