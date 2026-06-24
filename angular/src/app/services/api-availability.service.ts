import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

/** يُطلق عندما يصبح API على Render جاهزاً بعد كان نائماً */
export const HOTEL_API_BECAME_READY_EVENT = 'hotelApiBecameReady';

/**
 * يراقب جاهزية API (Render free tier cold start).
 * عند عودة الخادم يُطلق حدثاً لإعادة تحميل البيانات دون تحديث الصفحة يدوياً.
 */
@Injectable({ providedIn: 'root' })
export class ApiAvailabilityService {
  private readonly http = inject(HttpClient);

  readonly apiReady = signal(false);

  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private probeInFlight = false;

  private readonly probeUrl = `${environment.apis.default.url}/api/app/hotel-settings`;

  startMonitoring(): void {
    if (!environment.production || this.pollTimer) {
      return;
    }

    this.probeOnce();
    this.pollTimer = setInterval(() => this.probeOnce(), 8_000);
  }

  private probeOnce(): void {
    if (this.probeInFlight) {
      return;
    }

    this.probeInFlight = true;
    this.http.get(this.probeUrl).subscribe({
      next: () => {
        const wasDown = !this.apiReady();
        this.apiReady.set(true);
        this.probeInFlight = false;
        if (wasDown) {
          window.dispatchEvent(new Event(HOTEL_API_BECAME_READY_EVENT));
        }
      },
      error: () => {
        this.apiReady.set(false);
        this.probeInFlight = false;
      },
    });
  }
}
