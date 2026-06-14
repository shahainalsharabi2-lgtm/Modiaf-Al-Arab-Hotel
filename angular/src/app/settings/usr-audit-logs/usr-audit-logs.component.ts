import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import {
  AUDIT_LOGS_SEED,
  AUDIT_LOG_APPLICATIONS,
  AUDIT_LOG_HTTP_METHODS,
  AuditLogFilterDto,
  AuditLogRowDto,
  emptyAuditLogFilter,
} from './usr-audit-logs.seed';

@Component({
  selector: 'app-usr-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './usr-audit-logs.component.html',
  styleUrls: [
    '../hotel-chains/hotel-chains.component.scss',
    '../room-types/room-types.component.scss',
    './usr-audit-logs.component.scss',
  ],
})
export class UsrAuditLogsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  readonly httpMethods = AUDIT_LOG_HTTP_METHODS;
  readonly applications = AUDIT_LOG_APPLICATIONS;

  allRows: AuditLogRowDto[] = [];
  rows: AuditLogRowDto[] = [];
  filter: AuditLogFilterDto = emptyAuditLogFilter();
  detailsRow: AuditLogRowDto | null = null;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.allRows = AUDIT_LOGS_SEED.map((row) => ({ ...row }));
    this.rows = [...this.allRows];
  }

  displayValue(value: string): string {
    return value.trim() || '—';
  }

  formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }

  runSearch(): void {
    const qUser = this.filter.userName.trim().toLowerCase();
    const qUrl = this.filter.url.trim().toLowerCase();
    const qIp = this.filter.ipAddress.trim().toLowerCase();
    const qCorrelation = this.filter.correlationId.trim().toLowerCase();
    const minDuration = Number(this.filter.minDuration);
    const fromDate = this.filter.fromDate ? new Date(this.filter.fromDate) : null;
    const toDate = this.filter.toDate ? new Date(`${this.filter.toDate}T23:59:59`) : null;

    this.rows = this.allRows.filter((row) => {
      if (fromDate && new Date(row.occurredAt) < fromDate) {
        return false;
      }
      if (toDate && new Date(row.occurredAt) > toDate) {
        return false;
      }
      if (qUser && !row.userName.toLowerCase().includes(qUser)) {
        return false;
      }
      if (qUrl && !row.url.toLowerCase().includes(qUrl)) {
        return false;
      }
      if (!Number.isNaN(minDuration) && this.filter.minDuration.trim() && row.durationMs < minDuration) {
        return false;
      }
      if (this.filter.httpMethod && row.httpMethod !== this.filter.httpMethod) {
        return false;
      }
      if (this.filter.applicationName && row.applicationName !== this.filter.applicationName) {
        return false;
      }
      if (qIp && !row.ipAddress.toLowerCase().includes(qIp)) {
        return false;
      }
      if (qCorrelation && !row.correlationId.toLowerCase().includes(qCorrelation)) {
        return false;
      }
      return true;
    });
    this.cdr.markForCheck();
  }

  clearFilter(): void {
    this.filter = emptyAuditLogFilter();
    this.rows = [...this.allRows];
    this.cdr.markForCheck();
  }

  openDetails(row: AuditLogRowDto): void {
    this.detailsRow = row;
    this.cdr.markForCheck();
  }

  closeDetails(): void {
    this.detailsRow = null;
    this.cdr.markForCheck();
  }
}
