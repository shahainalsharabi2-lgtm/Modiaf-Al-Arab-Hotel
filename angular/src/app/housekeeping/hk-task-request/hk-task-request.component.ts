import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { HK_TASK_ROWS } from '../hk-tasks/hk-tasks.static-data';

@Component({
  selector: 'app-hk-task-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './hk-task-request.component.html',
  styleUrls: ['./hk-task-request.component.css'],
})
export class HkTaskRequestComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly taskTypeOptions = HK_TASK_ROWS.map((row) => ({
    id: row.id,
    label: row.name,
    code: row.code,
  }));

  readonly roomOptions = ['101', '102', '209', '928', '1027'];
  readonly employeeOptions = [
    { id: '1', name: 'أحمد' },
    { id: '2', name: 'محمد' },
    { id: '3', name: 'سارة' },
  ];

  recordId = 0;

  readonly form = this.fb.group({
    taskTypeId: [''],
    notes: [''],
    roomNo: [''],
    employeeId: [''],
    employeeNotes: [''],
  });

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  label(key: string): string {
    return this.ui.screenText('hkTaskRequest', key);
  }

  newRecord(): void {
    this.recordId = 0;
    this.form.reset({
      taskTypeId: '',
      notes: '',
      roomNo: '',
      employeeId: '',
      employeeNotes: '',
    });
  }

  save(): void {}

  deleteRecord(): void {
    this.newRecord();
  }

  printForm(): void {
    window.print();
  }

  goToList(): void {}

  undo(): void {
    this.newRecord();
  }
}
