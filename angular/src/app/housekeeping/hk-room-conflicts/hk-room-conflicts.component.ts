import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';

@Component({
  selector: 'app-hk-room-conflicts',
  standalone: true,
  imports: [CommonModule, UiInlineTextComponent],
  templateUrl: './hk-room-conflicts.component.html',
  styleUrls: ['./hk-room-conflicts.component.css'],
})
export class HkRoomConflictsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  /** لا توجد تعارضات في البيانات التجريبية — حالة فارغة كما في الصورة */
  readonly hasConflicts = false;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  label(key: string): string {
    return this.ui.screenText('hkRoomConflicts', key);
  }
}
