import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiMessageService } from '../../services/ui-message.service';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { HOTELS_SEED } from '../hotels/hotels.seed';
import { USR_GROUPS_SEED } from '../usr-groups/usr-groups.seed';
import {
  USR_USERS_SEED,
  UsrUserFormDto,
  UsrUserRowDto,
  displayUsrUserName,
  emptyUsrUserForm,
  usrUserRowToForm,
} from './usr-users.seed';

type ModalTab = 'info' | 'groups';
type SortKey = 'displayName' | 'userName' | 'mobile' | 'email' | 'isActive' | 'defaultHotelId';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-usr-users',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './usr-users.component.html',
  styleUrls: [
    '../hotel-chains/hotel-chains.component.scss',
    '../room-types/room-types.component.scss',
    './usr-users.component.scss',
  ],
})
export class UsrUsersComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  readonly hotels = HOTELS_SEED;
  readonly groups = USR_GROUPS_SEED;

  rows: UsrUserRowDto[] = [];
  form: UsrUserFormDto = emptyUsrUserForm();
  modalOpen = false;
  editingId: number | null = null;
  activeModalTab: ModalTab = 'info';
  showPassword = false;
  searchQuery = '';
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  openActionsId: number | null = null;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = USR_USERS_SEED.map((row) => ({ ...row, groupIds: [...row.groupIds] }));
  }

  @HostListener('document:click')
  closeActionsMenu(): void {
    if (this.openActionsId !== null) {
      this.openActionsId = null;
      this.cdr.markForCheck();
    }
  }

  displayName(row: UsrUserRowDto): string {
    return displayUsrUserName(row);
  }

  hotelName(hotelId: number): string {
    return this.hotels.find((h) => h.id === hotelId)?.name ?? '';
  }

  isLatinText(value: string): boolean {
    return /^[\x00-\x7F]+$/.test(value.trim());
  }

  toggleSort(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
    this.cdr.markForCheck();
  }

  sortIcon(key: SortKey): string {
    if (this.sortKey !== key) {
      return 'fa-sort';
    }
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  filteredRows(): UsrUserRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.rows];
    if (q) {
      rows = rows.filter((row) => {
        const haystack = [
          this.displayName(row),
          row.userName,
          row.mobile,
          row.email,
          this.hotelName(row.defaultHotelId),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
    }
    if (this.sortKey) {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        let cmp = 0;
        switch (this.sortKey) {
          case 'displayName':
            cmp = this.displayName(a).localeCompare(this.displayName(b), 'ar', { sensitivity: 'base' });
            break;
          case 'userName':
            cmp = a.userName.localeCompare(b.userName, 'ar', { sensitivity: 'base' });
            break;
          case 'mobile':
            cmp = a.mobile.localeCompare(b.mobile, undefined, { numeric: true });
            break;
          case 'email':
            cmp = a.email.localeCompare(b.email, undefined, { sensitivity: 'base' });
            break;
          case 'isActive':
            cmp = Number(a.isActive) - Number(b.isActive);
            break;
          case 'defaultHotelId':
            cmp = this.hotelName(a.defaultHotelId).localeCompare(this.hotelName(b.defaultHotelId), 'ar', {
              sensitivity: 'base',
            });
            break;
        }
        if (cmp === 0) {
          cmp = a.id - b.id;
        }
        return cmp * dir;
      });
    } else {
      rows.sort((a, b) => a.id - b.id);
    }
    return rows;
  }

  toggleActionsMenu(rowId: number, event: Event): void {
    event.stopPropagation();
    this.openActionsId = this.openActionsId === rowId ? null : rowId;
    this.cdr.markForCheck();
  }

  setModalTab(tab: ModalTab): void {
    this.activeModalTab = tab;
    this.cdr.markForCheck();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    this.cdr.markForCheck();
  }

  isGroupSelected(groupId: number): boolean {
    return this.form.groupIds.includes(groupId);
  }

  toggleGroup(groupId: number): void {
    if (!this.canEdit) {
      return;
    }
    if (this.form.groupIds.includes(groupId)) {
      this.form.groupIds = this.form.groupIds.filter((id) => id !== groupId);
    } else {
      this.form.groupIds = [...this.form.groupIds, groupId];
    }
    this.cdr.markForCheck();
  }

  openCreate(): void {
    if (!this.canEdit) {
      return;
    }
    this.editingId = null;
    this.form = emptyUsrUserForm(1);
    this.activeModalTab = 'info';
    this.showPassword = false;
    this.modalOpen = true;
    this.cdr.markForCheck();
  }

  openEdit(row: UsrUserRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    this.editingId = row.id;
    this.form = usrUserRowToForm(row);
    this.activeModalTab = 'info';
    this.showPassword = false;
    this.modalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.modalOpen = false;
    this.editingId = null;
    this.form = emptyUsrUserForm();
    this.activeModalTab = 'info';
    this.showPassword = false;
    this.cdr.markForCheck();
  }

  saveForm(): void {
    if (!this.canEdit) {
      return;
    }
    const payload: UsrUserRowDto = {
      id: this.form.id ?? this.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1,
      firstName: this.form.firstName.trim(),
      surname: this.form.surname.trim(),
      userName: this.form.userName.trim(),
      mobile: this.form.mobile.trim(),
      email: this.form.email.trim(),
      isActive: this.form.isActive,
      defaultHotelId: this.form.defaultHotelId ?? 1,
      groupIds: [...this.form.groupIds],
    };
    if (this.form.id) {
      this.rows = this.rows.map((row) => (row.id === payload.id ? payload : row));
    } else {
      this.rows = [...this.rows, payload];
    }
    this.closeModal();
  }

  deleteRow(row: UsrUserRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    void this.uiMsg.confirm(this.ui.screenText('settings', 'usrUsersDeleteConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.rows = this.rows.filter((r) => r.id !== row.id);
      this.cdr.markForCheck();
    });
  }

  modalTitleKey(): string {
    return this.editingId ? 'usrUsersModalEditTitle' : 'usrUsersModalCreateTitle';
  }
}
