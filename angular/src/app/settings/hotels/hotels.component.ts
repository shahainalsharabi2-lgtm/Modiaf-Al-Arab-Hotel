import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { HOTELS_SEED, HotelRowDto } from './hotels.seed';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule, UiInlineTextComponent],
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.scss'],
})
export class HotelsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() canEdit = true;

  rows: HotelRowDto[] = [];
  selectedIds = new Set<number>();

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
    this.rows = HOTELS_SEED.map((row) => ({ ...row }));
  }

  rowCount(): number {
    return this.rows.length;
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  toggleSelect(id: number): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    this.cdr.markForCheck();
  }

  addHotel(): void {
    if (!this.canEdit) {
      return;
    }
  }

  deleteSelected(): void {
    if (!this.canEdit || !this.selectedIds.size) {
      return;
    }
    this.rows = this.rows.filter((row) => !this.selectedIds.has(row.id));
    this.selectedIds.clear();
    this.cdr.markForCheck();
  }
}
