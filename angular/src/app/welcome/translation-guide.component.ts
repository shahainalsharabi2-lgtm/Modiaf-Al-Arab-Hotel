import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UiInlineTextComponent } from '../shared/ui-inline-text/ui-inline-text.component';
import { UiTranslationsService } from '../services/ui-translations.service';
import { WELCOME_GUIDE_STORAGE_KEY } from '../guards/welcome-entry.guard';
import { bindUiTranslationRefresh } from '../utils/ui-screen-i18n.helper';

@Component({
  selector: 'app-translation-guide',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, UiInlineTextComponent],
  templateUrl: './translation-guide.component.html',
  styleUrls: ['./translation-guide.component.css'],
})
export class TranslationGuideComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  dontShowOnStartup = false;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  startUsingSystem(): void {
    if (this.dontShowOnStartup) {
      this.markGuideCompleted();
    }
    void this.router.navigate(['/settings'], { queryParams: { tab: 'uiTranslations' } });
  }

  openInlineTranslationDemo(): void {
    if (this.ui.displayLocale() === 'ar') {
      this.ui.setDisplayLocale('en', { skipToast: true });
    }
    if (!this.ui.inlineTranslationMode()) {
      this.ui.toggleInlineTranslationMode();
    }
    void this.router.navigate(['/dashboard']);
  }

  markGuideCompleted(): void {
    try {
      localStorage.setItem(WELCOME_GUIDE_STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  skipGuide(): void {
    this.markGuideCompleted();
    void this.router.navigate(['/settings'], { queryParams: { tab: 'uiTranslations' } });
  }
}
