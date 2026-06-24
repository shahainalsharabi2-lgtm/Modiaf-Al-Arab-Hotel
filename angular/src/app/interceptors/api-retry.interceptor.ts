import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, timer } from 'rxjs';

const RETRYABLE_STATUSES = new Set([0, 502, 503, 504]);

/** إعادة المحاولة أثناء إقلاع Render البارد */
export const apiRetryInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/api/')) {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: 4,
      delay: (error: unknown, retryCount) => {
        const status = error instanceof HttpErrorResponse ? error.status : 0;
        if (!RETRYABLE_STATUSES.has(status)) {
          throw error;
        }
        return timer(3_000 * retryCount);
      },
    }),
  );
};
