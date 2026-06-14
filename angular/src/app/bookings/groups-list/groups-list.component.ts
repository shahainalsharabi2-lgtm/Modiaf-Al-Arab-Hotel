import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import {
  GROUPS_LIST_STATIC,
  GROUPS_LIST_TABS,
  type GroupsListItem,
  type GroupsListTab,
} from './groups-list.static-data';

@Component({
  selector: 'app-groups-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, UiInlineTextComponent, LocaleNumberPipe],
  templateUrl: './groups-list.component.html',
  styleUrls: ['./groups-list.component.css'],
})
export class GroupsListComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly tabs = GROUPS_LIST_TABS;
  readonly allGroups = GROUPS_LIST_STATIC;

  activeTab: GroupsListTab = 'open';
  viewMode: 'grid' | 'list' = 'grid';
  scopeFilter = '';
  searchTerm = '';

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  label(key: string): string {
    return this.ui.screenText('groupsList', key);
  }

  tabLabel(tab: GroupsListTab): string {
    return this.label(`tab${this.capitalize(tab)}`);
  }

  statusLabel(status: GroupsListTab): string {
    return this.tabLabel(status);
  }

  tabCount(tab: GroupsListTab): number {
    return this.allGroups.filter((g) => g.status === tab).length;
  }

  get filteredGroups(): GroupsListItem[] {
    const q = this.searchTerm.trim().toLowerCase();
    return this.allGroups.filter((group) => {
      if (group.status !== this.activeTab) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        String(group.id).includes(q) ||
        group.groupName.toLowerCase().includes(q) ||
        group.contactName.toLowerCase().includes(q)
      );
    });
  }

  setTab(tab: GroupsListTab): void {
    this.activeTab = tab;
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  formatDisplayDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) {
      return iso;
    }
    return `${y}/${m}/${d}`;
  }

  groupInitial(name: string): string {
    const trimmed = name.trim();
    return trimmed ? trimmed.charAt(0) : 'م';
  }

  trackById(_index: number, item: GroupsListItem): number {
    return item.id;
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
