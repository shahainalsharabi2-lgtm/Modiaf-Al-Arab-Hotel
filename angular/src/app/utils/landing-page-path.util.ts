export const DEFAULT_LANDING_PAGE_PATH = '/dashboard';

/** يستخرج المسار النسبي من رابط كامل أو نسبي */
export function normalizeLandingPagePath(value: string | null | undefined): string {
  let trimmed = (value ?? '').trim();
  if (!trimmed || trimmed === '/') {
    return DEFAULT_LANDING_PAGE_PATH;
  }

  const embeddedUrl = trimmed.match(/\/?https?:\/\/[^\s]+/i)?.[0]?.replace(/^\//, '');
  if (embeddedUrl) {
    trimmed = embeddedUrl;
  }

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const url = new URL(trimmed);
      trimmed = `${url.pathname}${url.search}`;
    }
  } catch {
    /* keep raw value */
  }

  trimmed = trimmed.replace(/^\/+/, '/');
  if (trimmed.startsWith('/http://') || trimmed.startsWith('/https://')) {
    const fixed = trimmed.slice(1);
    try {
      const url = new URL(fixed);
      trimmed = `${url.pathname}${url.search}`;
    } catch {
      trimmed = DEFAULT_LANDING_PAGE_PATH;
    }
  }

  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const qIndex = withSlash.indexOf('?');
  const pathPart = qIndex >= 0 ? withSlash.slice(0, qIndex) : withSlash;
  const query = qIndex >= 0 ? withSlash.slice(qIndex + 1) : '';
  const path = pathPart.replace(/\/+$/, '') || '/';
  const normalized = query ? `${path}?${query}` : path;
  return normalized.startsWith('/') ? normalized : DEFAULT_LANDING_PAGE_PATH;
}

/** يحوّل مسار التطبيق إلى UrlTree آمن للتوجيه */
export function parseAppPath(path: string): { path: string; query: Record<string, string> } {
  const normalized = normalizeLandingPagePath(path);
  const qIndex = normalized.indexOf('?');
  const pathOnly = qIndex >= 0 ? normalized.slice(0, qIndex) : normalized;
  const query: Record<string, string> = {};
  if (qIndex >= 0) {
    const params = new URLSearchParams(normalized.slice(qIndex + 1));
    params.forEach((v, k) => {
      query[k] = v;
    });
  }
  return { path: pathOnly || DEFAULT_LANDING_PAGE_PATH, query };
}
