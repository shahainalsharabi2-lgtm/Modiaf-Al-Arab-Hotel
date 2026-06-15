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
  HOTEL_USER_ROLE,
  normalizeHotelUserRole,
  type HotelUserRole,
} from '../../utils/hotel-user-role';
import {
  CreateUpdateHotelAppUserDto,
  HotelAppUserDto,
  HotelAppUserService,
} from '../../services/hotel-app-user.service';
import {
  UsrUserFormDto,
  UsrUserRowDto,
  apiUserToRow,
  displayUsrUserName,
  emptyUsrUserForm,
  rowToApiInput,
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
  private readonly userService = inject(HotelAppUserService);
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
  loading = true;
  saving = false;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.loadRows();
  }

  private loadRows(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (users) => {
        this.rows = users.map((user) => apiUserToRow(user));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.rows = [];
        this.cdr.markForCheck();
      },
    });
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

  setAllowNavigation(value: boolean): void {
    if (!this.canEdit) {
      return;
    }
    this.form.allowNavigation = value;
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
    if (!this.canEdit || this.saving) {
      return;
    }
    const userName = this.form.userName.trim();
    if (!userName || !this.form.firstName.trim()) {
      this.uiMsg.show(this.ui.screenText('settings', 'usersRequiredFields'));
      return;
    }
    const password = this.form.password.trim();
    const isEdit = !!this.form.id;
    if (!isEdit && !password) {
      this.uiMsg.show(this.ui.screenText('settings', 'usersRequiredFields'));
      return;
    }

    const input = rowToApiInput(this.form);
    this.saving = true;
    const request$ = isEdit
      ? this.userService.update(this.form.id!, input)
      : this.userService.create(input);

    request$.subscribe({
      next: (saved) => {
        const row = apiUserToRow(saved);
        if (isEdit) {
          this.rows = this.rows.map((r) => (r.id === row.id ? row : r));
        } else {
          this.rows = [...this.rows, row];
        }
        this.saving = false;
        this.closeModal();
        this.cdr.markForCheck();
      },
      error: () => {
        this.saving = false;
        this.uiMsg.show(this.ui.screenText('settings', 'usersSaveFail'));
        this.cdr.markForCheck();
      },
    });
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
      this.userService.delete(row.id).subscribe({
        next: () => {
          this.rows = this.rows.filter((r) => r.id !== row.id);
          this.cdr.markForCheck();
        },
        error: () => {
          this.uiMsg.show(this.ui.screenText('settings', 'usersSaveFail'));
          this.cdr.markForCheck();
        },
      });
    });
  }

  modalTitleKey(): string {
    return this.editingId ? 'usrUsersModalEditTitle' : 'usrUsersModalCreateTitle';
  }
}
