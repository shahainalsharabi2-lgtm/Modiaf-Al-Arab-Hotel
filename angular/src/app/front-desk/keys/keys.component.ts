import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiMessageService } from '../../services/ui-message.service';
import { BookingService } from '../../services/booking.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { KEY_ROWS } from './keys.static-data';
import type { KeyRow, KeyRowSortDir, KeyRowSortKey } from './keys.types';
import {
  bookingsToKeyReservations,
  expiryYmdFromHours,
  filterKeyReservations,
  isKeyHardwareOnline,
  nextKeyReceiptNo,
  type KeyReservationOption,
} from './keys.util';

type KeysModalId = 'issue' | 'verify' | 'read' | 'temp';

@Component({
  selector: 'app-keys',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './keys.component.html',
  styleUrls: ['./keys.component.css'],
})
export class KeysComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly bookingService = inject(BookingService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  rows: KeyRow[] = KEY_ROWS.map((row) => ({ ...row }));

  sortKey: KeyRowSortKey = 'roomNo';
  sortDir: KeyRowSortDir = 'asc';

  filterRoomNo = '';
  filterGuestName = '';
  filterKeyNo = '';
  filterType = '';
  filterStatus = '';
  filterExpiry = '';

  activeModal: KeysModalId | null = null;
  modalError = '';

  reservationOptions: KeyReservationOption[] = [];
  reservationSearch = '';
  reservationListOpen = false;
  reservationBookingsLoading = false;

  issueBookingNo = '';
  issueRoomNo = '';
  issueGuestName = '';
  issueArrival = '';
  issueDeparture = '';

  actionRoomNo = '';

  tempRoomNo = '';
  tempDurationHours = 4;
  tempPurpose = '';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  label(key: string): string {
    return this.ui.screenText('keys', key);
  }

  typeLabel(key: string): string {
    return this.label(key);
  }

  statusLabel(key: string): string {
    return this.label(key);
  }

  refresh(): void {
    this.rows = KEY_ROWS.map((row) => ({ ...row }));
    this.cdr.markForCheck();
  }

  verifyCard(): void {
    this.openModal('verify');
  }

  readCard(): void {
    this.openModal('read');
  }

  temporaryKey(): void {
    this.openModal('temp');
  }

  issueKey(): void {
    this.openModal('issue');
  }

  offlineService(): void {
    this.uiMsg.warning(this.label('serviceOfflineMsg'));
  }

  viewRow(row: KeyRow): void {
    const detail = [
      `${this.label('colRoomNo')}: ${row.roomNo}`,
      `${this.label('colGuestName')}: ${row.guestName}`,
      `${this.label('colKeyNo')}: ${row.keyNo}`,
      `${this.label('colType')}: ${this.typeLabel(row.typeKey)}`,
      `${this.label('colStatus')}: ${this.statusLabel(row.statusKey)}`,
      `${this.label('colExpiry')}: ${this.formatDate(row.expiry)}`,
    ].join(' · ');
    this.uiMsg.info(detail, { title: this.label('viewRowTitle') });
  }

  closeModal(): void {
    this.activeModal = null;
    this.modalError = '';
    this.reservationListOpen = false;
  }

  modalTitle(): string {
    switch (this.activeModal) {
      case 'issue':
        return this.label('issueModalTitle');
      case 'verify':
        return this.label('verifyModalTitle');
      case 'read':
        return this.label('readModalTitle');
      case 'temp':
        return this.label('tempModalTitle');
      default:
        return '';
    }
  }

  openReservationList(): void {
    this.reservationListOpen = true;
  }

  closeReservationList(): void {
    window.setTimeout(() => {
      this.reservationListOpen = false;
      this.cdr.markForCheck();
    }, 150);
  }

  selectReservation(option: KeyReservationOption): void {
    this.issueBookingNo = option.id;
    this.reservationSearch = option.label;
    this.issueRoomNo = option.roomNo;
    this.issueGuestName = option.guestName;
    this.reservationListOpen = false;
    this.modalError = '';
  }

  get filteredReservationOptions(): KeyReservationOption[] {
    return filterKeyReservations(this.reservationOptions, this.reservationSearch);
  }

  submitIssueKey(): void {
    const guestName = this.issueGuestName.trim();
    const roomNo = this.issueRoomNo.trim();
    if (!guestName || !roomNo) {
      this.modalError = this.label('requiredHint');
      return;
    }
    if (!this.requireHardware()) {
      return;
    }

    const expiry = this.issueDeparture ? this.issueDeparture.slice(0, 10) : expiryYmdFromHours(24);
    this.rows = [
      {
        id: `key-${Date.now()}`,
        roomNo,
        guestName,
        keyNo: nextKeyReceiptNo(this.rows),
        typeKey: 'typeGuest',
        statusKey: 'statusActive',
        expiry,
      },
      ...this.rows,
    ];
    this.uiMsg.success(this.label('issueSuccess'));
    this.closeModal();
    this.cdr.markForCheck();
  }

  submitVerifyCard(): void {
    if (!this.actionRoomNo.trim()) {
      this.modalError = this.label('requiredHint');
      return;
    }
    if (!this.requireHardware()) {
      return;
    }
    this.uiMsg.success(this.label('verifySuccess'));
    this.closeModal();
  }

  submitReadCard(): void {
    if (!this.actionRoomNo.trim()) {
      this.modalError = this.label('requiredHint');
      return;
    }
    if (!this.requireHardware()) {
      return;
    }
    this.uiMsg.success(this.label('readSuccess').replace('{room}', this.actionRoomNo.trim()));
    this.closeModal();
  }

  submitTemporaryKey(): void {
    const roomNo = this.tempRoomNo.trim();
    if (!roomNo) {
      this.modalError = this.label('requiredHint');
      return;
    }
    if (!this.requireHardware()) {
      return;
    }

    const hours = Math.max(1, Number(this.tempDurationHours) || 1);
    this.rows = [
      {
        id: `key-${Date.now()}`,
        roomNo,
        guestName: this.label('tempGuestPlaceholder'),
        keyNo: nextKeyReceiptNo(this.rows),
        typeKey: 'typeGuest',
        statusKey: 'statusActive',
        expiry: expiryYmdFromHours(hours),
      },
      ...this.rows,
    ];
    this.uiMsg.success(this.label('tempSuccess'));
    this.closeModal();
    this.cdr.markForCheck();
  }

  formatDate(iso: string): string {
    if (!iso) {
      return '—';
    }
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) {
      return iso;
    }
    return `${y}/${m}/${d}`;
  }

  toggleSort(key: KeyRowSortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      return;
    }
    this.sortKey = key;
    this.sortDir = 'asc';
  }

  sortIcon(key: string): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  get filteredRows(): KeyRow[] {
    const roomQ = this.filterRoomNo.trim().toLowerCase();
    const guestQ = this.filterGuestName.trim().toLowerCase();
    const keyQ = this.filterKeyNo.trim().toLowerCase();
    const typeQ = this.filterType.trim().toLowerCase();
    const statusQ = this.filterStatus.trim().toLowerCase();
    const expiryQ = this.filterExpiry.trim();

    let list = this.rows.filter((row) => {
      if (roomQ && !row.roomNo.toLowerCase().includes(roomQ)) {
        return false;
      }
      if (guestQ && !row.guestName.toLowerCase().includes(guestQ)) {
        return false;
      }
      if (keyQ && !row.keyNo.toLowerCase().includes(keyQ)) {
        return false;
      }
      if (typeQ && !this.typeLabel(row.typeKey).toLowerCase().includes(typeQ)) {
        return false;
      }
      if (statusQ && !this.statusLabel(row.statusKey).toLowerCase().includes(statusQ)) {
        return false;
      }
      if (expiryQ && row.expiry !== expiryQ) {
        return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => this.compareRows(a, b));
    return list;
  }

  trackRow(_index: number, row: KeyRow): string {
    return row.id;
  }

  private openModal(id: KeysModalId): void {
    this.resetModalForms();
    this.activeModal = id;
    if (id === 'issue') {
      this.loadReservations();
    }
  }

  private resetModalForms(): void {
    this.modalError = '';
    this.reservationSearch = '';
    this.issueBookingNo = '';
    this.issueRoomNo = '';
    this.issueGuestName = '';
    this.issueArrival = '';
    this.issueDeparture = '';
    this.actionRoomNo = '';
    this.tempRoomNo = '';
    this.tempDurationHours = 4;
    this.tempPurpose = '';
    this.reservationListOpen = false;
  }

  private loadReservations(): void {
    if (this.reservationOptions.length > 0 || this.reservationBookingsLoading) {
      return;
    }
    this.reservationBookingsLoading = true;
    this.bookingService
      .getBookings()
      .pipe(
        catchError((err) => {
          console.error('keys: failed to load bookings', err);
          return of([]);
        }),
      )
      .subscribe((bookings) => {
        this.reservationOptions = bookingsToKeyReservations(bookings);
        this.reservationBookingsLoading = false;
        this.cdr.markForCheck();
      });
  }

  private requireHardware(): boolean {
    if (isKeyHardwareOnline()) {
      return true;
    }
    this.uiMsg.warning(this.label('serviceOfflineMsg'));
    return false;
  }

  private compareRows(a: KeyRow, b: KeyRow): number {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    const av = this.sortValue(a, this.sortKey);
    const bv = this.sortValue(b, this.sortKey);
    if (av < bv) {
      return -1 * dir;
    }
    if (av > bv) {
      return 1 * dir;
    }
    return 0;
  }

  private sortValue(row: KeyRow, key: KeyRowSortKey): string | number {
    switch (key) {
      case 'roomNo':
        return Number(row.roomNo) || row.roomNo;
      case 'guestName':
        return row.guestName;
      case 'keyNo':
        return row.keyNo;
      case 'type':
        return this.typeLabel(row.typeKey);
      case 'status':
        return this.statusLabel(row.statusKey);
      case 'expiry':
        return row.expiry;
      default:
        return '';
    }
  }
}
