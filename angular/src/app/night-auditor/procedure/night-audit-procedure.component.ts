import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { todayLocalDateString } from '../../utils/date-only';
import { NIGHT_AUDIT_SETTINGS_DEFAULTS } from '../night-audit-settings/night-audit-settings.types';
import {
  NIGHT_AUDIT_ARCHIVE_DEFAULTS,
  type NightAuditArchiveRow,
  type NightAuditArchiveStatus,
  type NightAuditDayStatus,
  type NightAuditRunMode,
} from './night-audit-procedure.types';

@Component({
  selector: 'app-night-audit-procedure',
  standalone: true,
  imports: [CommonModule, UiInlineTextComponent],
  templateUrl: './night-audit-procedure.component.html',
  styleUrls: ['./night-audit-procedure.component.css'],
})
export class NightAuditProcedureComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  businessDate = '';
  systemTime = '';
  systemDateLabel = '';
  autoCloseEnabled = NIGHT_AUDIT_SETTINGS_DEFAULTS.automatic;
  dayStatus: NightAuditDayStatus = 'open';
  archiveRows: NightAuditArchiveRow[] = NIGHT_AUDIT_ARCHIVE_DEFAULTS.map((row) => ({ ...row }));

  private clockTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.businessDate = this.formatYmdSlash(todayLocalDateString());
    this.tickClock();
    this.clockTimer = setInterval(() => this.tickClock(), 1000);
    this.destroyRef.onDestroy(() => {
      if (this.clockTimer != null) {
        clearInterval(this.clockTimer);
      }
    });
  }

  label(key: string): string {
    return this.ui.screenText('nightAuditProcedure', key);
  }

  get autoCloseLabel(): string {
    return this.autoCloseEnabled ? this.label('autoCloseEnabled') : this.label('autoCloseDisabled');
  }

  get dayStatusLabel(): string {
    switch (this.dayStatus) {
      case 'in_progress':
        return this.label('dayStatusInProgress');
      case 'closed':
        return this.label('dayStatusClosed');
      default:
        return this.label('dayStatusOpen');
    }
  }

  statusLabel(status: NightAuditArchiveStatus): string {
    return status === 'completed' ? this.label('archiveStatusCompleted') : this.label('archiveStatusInProgress');
  }

  modeLabel(mode: NightAuditRunMode): string {
    return mode === 'automatic' ? this.label('modeAutomatic') : this.label('modeManual');
  }

  startProcedure(): void {
    if (this.dayStatus === 'in_progress') {
      return;
    }
    this.dayStatus = 'in_progress';
    this.archiveRows = [
      {
        id: `run-${Date.now()}`,
        businessDate: this.businessDate,
        startAt: this.formatDateTime(new Date()),
        endAt: '',
        status: 'in_progress',
        mode: this.autoCloseEnabled ? 'automatic' : 'manual',
        notes: '',
      },
      ...this.archiveRows,
    ];
    this.cdr.markForCheck();
  }

  trackRow(_index: number, row: NightAuditArchiveRow): string {
    return row.id;
  }

  cellValue(value: string): string {
    return value?.trim() ? value : '—';
  }

  private tickClock(): void {
    const now = new Date();
    const loc = this.ui.displayLocale() === 'ar' ? 'ar-SA' : undefined;
    this.systemTime = now.toLocaleTimeString(loc, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    this.systemDateLabel = now.toLocaleDateString(loc, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    this.cdr.markForCheck();
  }

  private formatYmdSlash(ymd: string): string {
    if (!ymd) {
      return '';
    }
    const [y, m, d] = ymd.split('-');
    if (!y || !m || !d) {
      return ymd;
    }
    return `${y}/${m}/${d}`;
  }

  private formatDateTime(date: Date): string {
    const loc = this.ui.displayLocale() === 'ar' ? 'ar-SA' : undefined;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const time = date.toLocaleTimeString(loc, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return `${y}/${m}/${d} ${time}`;
  }
}
