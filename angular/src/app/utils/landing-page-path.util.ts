export const DEFAULT_LANDING_PAGE_PATH = '/dashboard';

/** يستخرج المسار النسبي من رابط كامل أو نسبي */
export function normalizeLandingPagePath(value: string | null | undefined): string {
  let trimmed = (value ?? '').trim();
  if (!trimmed || trimmed === '/') {
    return DEFAULT_LANDING_PAGE_PATH;
  }

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const url = new URL(trimmed);
      trimmed = `${url.pathname}${url.search}`;
    }
  } catch {
    /* keep raw value */
  }

  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const qIndex = withSlash.indexOf('?');
  const pathPart = qIndex >= 0 ? withSlash.slice(0, qIndex) : withSlash;
  const query = qIndex >= 0 ? withSlash.slice(qIndex + 1) : '';
  const path = pathPart.replace(/\/+$/, '') || '/';
  return query ? `${path}?${query}` : path;
}
