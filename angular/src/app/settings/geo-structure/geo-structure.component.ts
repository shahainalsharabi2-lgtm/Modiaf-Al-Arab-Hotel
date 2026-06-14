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
import {
  GEO_CITIES_SEED,
  GEO_COUNTRIES_SEED,
  GEO_GOVERNORATES_SEED,
  GEO_REGIONS_SEED,
  GeoRowDto,
  GeoTab,
} from './geo-structure.seed';

type ViewMode = 'list' | 'grid';
type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey = 'code' | 'name' | 'foreignName';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-geo-structure',
  standalone: true,
  imports: [CommonModule, FormsModule, UiInlineTextComponent],
  templateUrl: './geo-structure.component.html',
  styleUrls: ['../hotel-chains/hotel-chains.component.scss', './geo-structure.component.scss'],
})
export class GeoStructureComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly uiMsg = inject(UiMessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  readonly geoTabs: GeoTab[] = ['countries', 'governorates', 'cities', 'regions'];

  activeGeoTab: GeoTab = 'countries';
  countries: GeoRowDto[] = [];
  governorates: GeoRowDto[] = [];
  cities: GeoRowDto[] = [];
  regions: GeoRowDto[] = [];

  viewMode: ViewMode = 'list';
  searchQuery = '';
  statusFilter: StatusFilter = 'all';
  sortKey: SortKey | null = null;
  sortDir: SortDir = 'asc';
  openActionsId: number | null = null;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.countries = GEO_COUNTRIES_SEED.map((row) => ({ ...row }));
    this.governorates = GEO_GOVERNORATES_SEED.map((row) => ({ ...row }));
    this.cities = GEO_CITIES_SEED.map((row) => ({ ...row }));
    this.regions = GEO_REGIONS_SEED.map((row) => ({ ...row }));
  }

  @HostListener('document:click')
  closeActionsMenu(): void {
    if (this.openActionsId !== null) {
      this.openActionsId = null;
      this.cdr.markForCheck();
    }
  }

  setGeoTab(tab: GeoTab): void {
    this.activeGeoTab = tab;
    this.searchQuery = '';
    this.sortKey = null;
    this.openActionsId = null;
    this.cdr.markForCheck();
  }

  geoTabLabelKey(tab: GeoTab): string {
    switch (tab) {
      case 'governorates':
        return 'geoStructureTabGovernorates';
      case 'cities':
        return 'geoStructureTabCities';
      case 'regions':
        return 'geoStructureTabRegions';
      default:
        return 'geoStructureTabCountries';
    }
  }

  currentRows(): GeoRowDto[] {
    switch (this.activeGeoTab) {
      case 'governorates':
        return this.governorates;
      case 'cities':
        return this.cities;
      case 'regions':
        return this.regions;
      default:
        return this.countries;
    }
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    this.cdr.markForCheck();
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

  filteredRows(): GeoRowDto[] {
    const q = this.searchQuery.trim().toLowerCase();
    let rows = [...this.currentRows()];
    if (q) {
      rows = rows.filter((r) => {
        const hay = `${r.code} ${r.name} ${r.foreignName ?? ''}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (this.sortKey) {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        let cmp = 0;
        switch (this.sortKey) {
          case 'name':
            cmp = a.name.localeCompare(b.name, 'ar');
            break;
          case 'foreignName':
            cmp = (a.foreignName ?? '').localeCompare(b.foreignName ?? '', 'en');
            break;
          default:
            cmp = a.code.localeCompare(b.code, 'en', { sensitivity: 'base' });
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

  openCreate(): void {
    if (!this.canEdit) {
      return;
    }
  }

  openEdit(row: GeoRowDto): void {
    if (!this.canEdit) {
      return;
    }
    void row;
  }

  deleteRow(row: GeoRowDto): void {
    if (!this.canEdit) {
      return;
    }
    this.openActionsId = null;
    void this.uiMsg.confirm(this.ui.screenText('settings', 'geoStructureDeleteConfirm')).then((ok) => {
      if (!ok) {
        return;
      }
      this.replaceRows(this.currentRows().filter((r) => r.id !== row.id));
      this.cdr.markForCheck();
    });
  }

  private replaceRows(rows: GeoRowDto[]): void {
    switch (this.activeGeoTab) {
      case 'governorates':
        this.governorates = rows;
        break;
      case 'cities':
        this.cities = rows;
        break;
      case 'regions':
        this.regions = rows;
        break;
      default:
        this.countries = rows;
    }
  }
}
