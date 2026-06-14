import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../ui-inline-text/ui-inline-text.component';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { UiTranslationsService } from '../../services/ui-translations.service';

type CalcBtn = {
  label: string;
  type: 'digit' | 'operator' | 'action' | 'equals';
  value?: string;
  wide?: boolean;
};

@Component({
  selector: 'app-calculator-modal',
  standalone: true,
  imports: [CommonModule, UiInlineTextComponent],
  templateUrl: './app-calculator-modal.component.html',
  styleUrls: ['./app-calculator-modal.component.css'],
})
export class AppCalculatorModalComponent {
  readonly ui = inject(UiTranslationsService);

  @Output() closed = new EventEmitter<void>();

  display = '0';
  private accumulator: number | null = null;
  private pendingOp: string | null = null;
  private resetOnNext = false;

  readonly buttons: CalcBtn[] = [
    { label: 'C', type: 'action', value: 'clear' },
    { label: 'CE', type: 'action', value: 'entry' },
    { label: '⌫', type: 'action', value: 'back' },
    { label: '÷', type: 'operator', value: '/' },
    { label: '7', type: 'digit', value: '7' },
    { label: '8', type: 'digit', value: '8' },
    { label: '9', type: 'digit', value: '9' },
    { label: '×', type: 'operator', value: '*' },
    { label: '4', type: 'digit', value: '4' },
    { label: '5', type: 'digit', value: '5' },
    { label: '6', type: 'digit', value: '6' },
    { label: '−', type: 'operator', value: '-' },
    { label: '1', type: 'digit', value: '1' },
    { label: '2', type: 'digit', value: '2' },
    { label: '3', type: 'digit', value: '3' },
    { label: '+', type: 'operator', value: '+' },
    { label: '0', type: 'digit', value: '0', wide: true },
    { label: '.', type: 'digit', value: '.' },
    { label: '=', type: 'equals', value: '=' },
  ];

  onButton(btn: CalcBtn): void {
    switch (btn.type) {
      case 'digit':
        this.appendDigit(btn.value ?? '');
        break;
      case 'operator':
        this.setOperator(btn.value ?? '+');
        break;
      case 'equals':
        this.calculate();
        break;
      case 'action':
        if (btn.value === 'clear') {
          this.clearAll();
        } else if (btn.value === 'entry') {
          this.display = '0';
          this.resetOnNext = false;
        } else if (btn.value === 'back') {
          this.backspace();
        }
        break;
    }
  }

  close(): void {
    this.closed.emit();
  }

  private appendDigit(value: string): void {
    if (this.resetOnNext) {
      this.display = value === '.' ? '0.' : value;
      this.resetOnNext = false;
      return;
    }
    if (value === '.' && this.display.includes('.')) {
      return;
    }
    if (this.display === '0' && value !== '.') {
      this.display = value;
      return;
    }
    this.display += value;
  }

  private setOperator(op: string): void {
    const current = Number(this.display);
    if (this.accumulator == null) {
      this.accumulator = current;
    } else if (!this.resetOnNext) {
      this.accumulator = this.applyOp(this.accumulator, current, this.pendingOp ?? '+');
      this.display = this.formatNumber(this.accumulator);
    }
    this.pendingOp = op;
    this.resetOnNext = true;
  }

  private calculate(): void {
    if (this.accumulator == null || !this.pendingOp) {
      return;
    }
    const current = Number(this.display);
    const result = this.applyOp(this.accumulator, current, this.pendingOp);
    this.display = this.formatNumber(result);
    this.accumulator = null;
    this.pendingOp = null;
    this.resetOnNext = true;
  }

  private applyOp(left: number, right: number, op: string): number {
    switch (op) {
      case '+':
        return left + right;
      case '-':
        return left - right;
      case '*':
        return left * right;
      case '/':
        return right === 0 ? 0 : left / right;
      default:
        return right;
    }
  }

  private clearAll(): void {
    this.display = '0';
    this.accumulator = null;
    this.pendingOp = null;
    this.resetOnNext = false;
  }

  private backspace(): void {
    if (this.resetOnNext || this.display.length <= 1) {
      this.display = '0';
      return;
    }
    this.display = this.display.slice(0, -1) || '0';
  }

  private formatNumber(value: number): string {
    if (!Number.isFinite(value)) {
      return '0';
    }
    const rounded = Math.round(value * 1e10) / 1e10;
    return String(rounded);
  }
}
