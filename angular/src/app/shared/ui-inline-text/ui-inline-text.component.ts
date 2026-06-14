import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Observable, fromEvent } from 'rxjs';
import { UiTranslationsService } from '../../services/ui-translations.service';
import type { UiInlineFieldKind } from '../../services/ui-translations.service';

@Component({
  selector: 'ui-inline-text',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <ng-container *ngIf="!workbench; else workbenchTpl">
      <span [class]="hostClass || null" [attr.data-ui-tr-target]="translationTargetAttr()">{{ normalText() }}</span>
    </ng-container>

    <ng-template #workbenchTpl>
      <span
        class="ui-inline-wrap ui-inline-wrap--open"
        [class]="hostClass || null"
        [class.ui-inline-wrap--filled]="hasLocaleValue()">
        <span class="ui-inline-ref" [attr.data-ui-tr-target]="translationTargetAttr()" [attr.title]="arabicText()">
          {{ arabicText() }}
        </span>
        <input
          class="ui-inline-input ui-inline-input--always"
          type="text"
          [(ngModel)]="draft"
          (blur)="onWorkbenchBlur()"
          [attr.placeholder]="localePlaceholder()" />
      </span>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: inline;
      }

      .ui-inline-wrap {
        display: inline-flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        max-width: 100%;
        vertical-align: middle;
      }

      .ui-inline-wrap--open {
        margin: 0.15rem 0.2rem;
        padding: 0.35rem 0.45rem;
        border-radius: 12px;
        background: rgba(25, 118, 210, 0.06);
        border: 1px solid rgba(25, 118, 210, 0.16);
      }

      .ui-inline-wrap--filled {
        border-color: rgba(34, 197, 94, 0.35);
        background: rgba(34, 197, 94, 0.06);
      }

      .ui-inline-ref {
        display: block;
        margin: 0;
        padding: 0;
        color: #1565c0;
        font: inherit;
        font-weight: 800;
        line-height: 1.35;
        text-align: inherit;
      }

      .ui-inline-input {
        min-width: 140px;
        max-width: min(320px, 100%);
        border: 1.5px solid rgba(25, 118, 210, 0.45);
        border-radius: 10px;
        padding: 6px 10px;
        font: inherit;
        outline: none;
        background: #fff;
      }

      .ui-inline-input--always {
        display: block;
        width: 100%;
        min-width: 10rem;
        min-height: 2.2rem;
        padding: 0.5rem 0.7rem;
        font-size: 0.94rem;
        font-weight: 600;
        line-height: 1.35;
        box-sizing: border-box;
      }

      .ui-inline-input:focus {
        border-color: #1976d2;
        box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.14);
      }
    `,
  ],
})
export class UiInlineTextComponent implements OnInit {
  private readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input({ required: true }) kind!: UiInlineFieldKind;
  @Input() screen = '';
  @Input({ required: true }) key!: string;
  @Input() hostClass = '';

  draft = '';
  saving = false;

  private static readonly instances = new Set<UiInlineTextComponent>();

  static flushActiveSave(): Promise<void> {
    const pending = [...UiInlineTextComponent.instances].map((component) => component.flushIfDirty());
    return Promise.all(pending).then(() => undefined);
  }

  get workbench(): boolean {
    return this.ui.inlineWorkbenchActive();
  }

  ngOnInit(): void {
    this.syncDraftFromLocale();
  }

  constructor() {
    UiInlineTextComponent.instances.add(this);
    this.destroyRef.onDestroy(() => {
      UiInlineTextComponent.instances.delete(this);
    });

    fromEvent(window, 'hotelUiLocaleChanged')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.syncDraftFromLocale();
        this.cdr.markForCheck();
      });

    fromEvent(window, 'hotelUiTranslationsUpdated')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.syncDraftFromLocale();
        this.cdr.markForCheck();
      });

    fromEvent(window, 'hotelUiInlineTranslationModeChanged')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.syncDraftFromLocale();
        this.cdr.markForCheck();
      });
  }

  translationTargetAttr(): string | null {
    if (this.kind === 'screen') {
      return `screen:${this.screen}:${this.key}`;
    }
    if (this.kind === 'sidebar') {
      return `sidebar:${this.key}`;
    }
    if (this.kind === 'chrome') {
      return `chrome:${this.key}`;
    }
    return null;
  }

  normalText(): string {
    return this.ui.resolveFieldText(this.kind, this.screen, this.key);
  }

  arabicText(): string {
    return this.ui.arabicFieldText(this.kind, this.screen, this.key);
  }

  localeValue(): string {
    return this.ui.localeFieldRaw(this.kind, this.screen, this.key);
  }

  hasLocaleValue(): boolean {
    return !!this.localeValue().trim();
  }

  localePlaceholder(): string {
    return this.ui.inlineWorkbenchActive()
      ? this.ui.chromeLabel('uiInlineTranslationPh')
      : '';
  }

  onWorkbenchBlur(): void {
    window.setTimeout(() => {
      void this.flushIfDirty();
    }, 0);
  }

  flushIfDirty(): Promise<void> {
    if (!this.workbench || this.saving) {
      return Promise.resolve();
    }
    const next = this.draft.trim();
    if (next === this.localeValue().trim()) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.persistDraft(next, resolve);
    });
  }

  private syncDraftFromLocale(): void {
    this.draft = this.localeValue();
  }

  private persistDraft(value: string, onComplete?: () => void): void {
    if (this.saving) {
      onComplete?.();
      return;
    }
    this.saving = true;
    this.ui.setInlineTranslationSaving(true);
    this.patchLocale(value).subscribe({
      next: () => {
        this.saving = false;
        this.ui.setInlineTranslationSaving(false);
        this.syncDraftFromLocale();
        this.cdr.markForCheck();
        onComplete?.();
      },
      error: () => {
        this.saving = false;
        this.ui.setInlineTranslationSaving(false);
        this.cdr.markForCheck();
        onComplete?.();
      },
    });
  }

  private patchLocale(value: string): Observable<boolean> {
    return this.ui.patchLocaleField(this.kind, this.screen, this.key, value);
  }
}
