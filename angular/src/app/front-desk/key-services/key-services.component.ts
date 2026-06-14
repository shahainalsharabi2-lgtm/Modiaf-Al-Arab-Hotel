import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiMessageService } from '../../services/ui-message.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { KEY_SERVICE_ROWS } from './key-services.static-data';
import {
  findKeyServiceRow,
  isDuplicateServiceNo,
  nextKeyServiceId,
  removeKeyServiceRow,
} from './key-services.util';
import type { KeyServiceRow, KeyServiceSortDir, KeyServiceSortKey } from './key-services.types';

@Component({
  selector: 'app-key-services',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './key-services.component.html',
  styleUrls: ['./key-services.component.css'],
})
export class KeyServicesComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly rows = KEY_SERVICE_ROWS;

  sortKey: KeyServiceSortKey = 'serviceNo';
  sortDir: KeyServiceSortDir = 'asc';

  filterServiceNo = '';
  filterServiceName = '';
  filterStatus = '';
  filterLastSeen = '';
  filterLinkedUsers = '';

  serviceModalOpen = false;
  editingId: string | null = null;
  formServiceNo = '';
  formServiceName = '';
  formError = '';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  label(key: string): string {
    return this.ui.screenText('keyServices', key);
  }

  statusLabel(status: KeyServiceRow['status']): string {
    return status === 'online' ? this.label('statusOnline') : this.label('statusOffline');
  }

  linkedUsersLabel(count: number): string {
    return this.label('linkedUsersBadge').replace('{count}', String(count));
  }

  formatDateTime(value: string): string {
    if (!value) {
      return '—';
    }
    const [datePart, timePart] = value.split('T');
    if (!datePart) {
      return value;
    }
    const [y, m, d] = datePart.split('-');
    if (!y || !m || !d) {
      return value;
    }
    const date = `${y}/${m}/${d}`;
    if (!timePart) {
      return date;
    }
    return `${date} ${timePart.slice(0, 5)}`;
  }

  get serviceModalTitle(): string {
    return this.editingId ? this.label('editServiceModalTitle') : this.label('addServiceModalTitle');
  }

  addService(): void {
    this.editingId = null;
    this.formServiceNo = '';
    this.formServiceName = '';
    this.formError = '';
    this.serviceModalOpen = true;
  }

  editRow(row: KeyServiceRow): void {
    this.editingId = row.id;
    this.formServiceNo = row.serviceNo;
    this.formServiceName = row.serviceName;
    this.formError = '';
    this.serviceModalOpen = true;
  }

  closeServiceModal(): void {
    this.serviceModalOpen = false;
    this.formError = '';
  }

  saveService(): void {
    const serviceNo = this.formServiceNo.trim();
    const serviceName = this.formServiceName.trim();
    if (!serviceNo || !serviceName) {
      this.formError = this.label('requiredHint');
      return;
    }
    if (isDuplicateServiceNo(serviceNo, this.editingId)) {
      this.formError = this.label('duplicateServiceNo');
      return;
    }

    if (this.editingId) {
      const row = findKeyServiceRow(this.editingId);
      if (row) {
        row.serviceNo = serviceNo;
        row.serviceName = serviceName;
      }
      this.uiMsg.success(this.label('updateSuccess'));
    } else {
      KEY_SERVICE_ROWS.unshift({
        id: nextKeyServiceId(),
        serviceNo,
        serviceName,
        status: 'offline',
        lastSeen: '',
        linkedUsersCount: 0,
      });
      this.uiMsg.success(this.label('saveSuccess'));
    }

    this.closeServiceModal();
    this.cdr.markForCheck();
  }

  async deleteRow(row: KeyServiceRow): Promise<void> {
    const confirmed = await this.uiMsg.confirm(this.label('deleteConfirm').replace('{name}', row.serviceName));
    if (!confirmed) {
      return;
    }
    removeKeyServiceRow(row.id);
    this.uiMsg.success(this.label('deleteSuccess'));
    this.cdr.markForCheck();
  }

  viewLinkedUsers(row: KeyServiceRow): void {
    const message =
      row.linkedUsersCount > 0
        ? this.label('viewUsersCount').replace('{count}', String(row.linkedUsersCount))
        : this.label('viewUsersEmpty');
    this.uiMsg.info(message, { title: this.label('viewUsersTitle') });
  }

  toggleSort(key: KeyServiceSortKey): void {
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

  get filteredRows(): KeyServiceRow[] {
    const noQ = this.filterServiceNo.trim().toLowerCase();
    const nameQ = this.filterServiceName.trim().toLowerCase();
    const statusQ = this.filterStatus.trim().toLowerCase();
    const lastQ = this.filterLastSeen.trim();
    const usersQ = this.filterLinkedUsers.trim().toLowerCase();

    let list = this.rows.filter((row) => {
      if (noQ && !row.serviceNo.toLowerCase().includes(noQ)) {
        return false;
      }
      if (nameQ && !row.serviceName.toLowerCase().includes(nameQ)) {
        return false;
      }
      if (statusQ && !this.statusLabel(row.status).toLowerCase().includes(statusQ)) {
        return false;
      }
      if (lastQ && row.lastSeen && !row.lastSeen.startsWith(lastQ)) {
        return false;
      }
      if (usersQ && !String(row.linkedUsersCount).includes(usersQ) && !this.linkedUsersLabel(row.linkedUsersCount).toLowerCase().includes(usersQ)) {
        return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => this.compareRows(a, b));
    return list;
  }

  trackRow(_index: number, row: KeyServiceRow): string {
    return row.id;
  }

  private compareRows(a: KeyServiceRow, b: KeyServiceRow): number {
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

  private sortValue(row: KeyServiceRow, key: KeyServiceSortKey): string | number {
    switch (key) {
      case 'serviceNo':
        return row.serviceNo;
      case 'serviceName':
        return row.serviceName;
      case 'status':
        return this.statusLabel(row.status);
      case 'lastSeen':
        return row.lastSeen;
      case 'linkedUsers':
        return row.linkedUsersCount;
      default:
        return '';
    }
  }
}
