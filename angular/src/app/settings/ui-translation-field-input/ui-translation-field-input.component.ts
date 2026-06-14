import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'ui-translation-field-input',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="ui-tr-input-wrap">
      <input
        class="ui-tr-input"
        type="text"
        [attr.data-ui-tr-field]="fieldTrack || null"
        [value]="value"
        (focus)="onFocus()"
        (input)="onInput($event)"
        (keydown.enter)="onEnter($event)"
        (blur)="onBlur($event)" />
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        min-height: 42px;
        flex: 1 1 auto;
        gap: 0.35rem;
      }

      .ui-tr-input-wrap {
        display: flex;
        align-items: stretch;
        width: 100%;
        min-height: 42px;
        flex: 1 1 auto;
      }

      .ui-tr-input {
        flex: 1;
        min-width: 0;
        height: auto;
      }
    `,
  ],
})
export class UiTranslationFieldInputComponent implements OnChanges {
  @Input() defaultValue = '';
  @Input() fieldTrack = '';

  @Output() readonly valueCommit = new EventEmitter<string>();

  value = '';
  private focused = false;
  private lastEmittedValue: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    const fieldChanged = !!changes['fieldTrack'];
    const valueChanged = !!changes['defaultValue'];
    if (!valueChanged && !fieldChanged) {
      return;
    }
    if (this.focused && !fieldChanged) {
      return;
    }
    this.value = this.defaultValue ?? '';
    this.lastEmittedValue = this.value;
  }

  onFocus(): void {
    this.focused = true;
  }

  onInput(event: Event): void {
    this.commitValue(event.target);
  }

  onEnter(event: Event): void {
    this.commitValue(event.target);
  }

  onBlur(event: FocusEvent): void {
    this.focused = false;
    this.commitValue(event.target);
  }

  private updateLocalValue(target: EventTarget | null): void {
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.value = target.value;
  }

  private commitValue(target: EventTarget | null): void {
    this.updateLocalValue(target);
    if (this.value === this.lastEmittedValue) {
      return;
    }
    this.lastEmittedValue = this.value;
    this.valueCommit.emit(this.value);
  }
}
