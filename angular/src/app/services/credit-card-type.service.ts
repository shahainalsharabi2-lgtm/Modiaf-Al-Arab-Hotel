import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { PagedResultDto } from '../models/paged-result-dto.model';

export interface CreditCardTypeDto {
  id: number;
  code: string;
  name: string;
  foreignName?: string | null;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  bank?: string | null;
}

export interface CreateUpdateCreditCardTypeDto {
  code: string;
  name: string;
  foreignName?: string | null;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  bank?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CreditCardTypeService {
  private readonly http = inject(HttpClient);

  private get apiUrl(): string {
    return `${environment.apis.default.url}/api/app/credit-card-type`;
  }

  getAll(): Observable<CreditCardTypeDto[]> {
    return this.http
      .get<PagedResultDto<CreditCardTypeDto>>(this.apiUrl, {
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

  create(payload: CreateUpdateCreditCardTypeDto): Observable<CreditCardTypeDto> {
    return this.http.post<CreditCardTypeDto>(this.apiUrl, payload);
  }

  update(id: number, payload: CreateUpdateCreditCardTypeDto): Observable<CreditCardTypeDto> {
    return this.http.put<CreditCardTypeDto>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
