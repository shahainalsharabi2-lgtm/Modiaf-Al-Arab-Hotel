import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { PagedResultDto } from '../models/paged-result-dto.model';

export interface HotelChainDto {
  id: number;
  code: string;
  name: string;
  foreignName?: string | null;
  notes?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateUpdateHotelChainDto {
  code: string;
  name: string;
  foreignName?: string | null;
  notes?: string | null;
  displayOrder: number;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class HotelChainService {
  private readonly http = inject(HttpClient);

  private get apiUrl(): string {
    return `${environment.apis.default.url}/api/app/hotel-chain`;
  }

  getAll(): Observable<HotelChainDto[]> {
    return this.http
      .get<PagedResultDto<HotelChainDto>>(this.apiUrl, {
        params: { skipCount: '0', maxResultCount: '1000' },
      })
      .pipe(
        map((r) =>
          (r.items ?? []).sort(
            (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name, 'ar'),
          ),
        ),
      );
  }

  create(payload: CreateUpdateHotelChainDto): Observable<HotelChainDto> {
    return this.http.post<HotelChainDto>(this.apiUrl, payload);
  }

  update(id: number, payload: CreateUpdateHotelChainDto): Observable<HotelChainDto> {
    return this.http.put<HotelChainDto>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
