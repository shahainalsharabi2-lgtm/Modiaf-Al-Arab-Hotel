import { CommonModule } from '@angular/common';
import { UiInlineTextComponent } from '../../shared/ui-inline-text/ui-inline-text.component';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiTranslationsService } from '../../services/ui-translations.service';
import { bindUiTranslationRefresh } from '../../utils/ui-screen-i18n.helper';
import { LocaleNumberPipe } from '../../shared/pipes/locale-number.pipe';
import {
  CRM_PROFILE_FIELD_DEFAULTS,
  CRM_PROFILE_REQUIREMENT_KEYS,
  type CrmProfileFieldSetting,
  type CrmProfileRequirementKey,
} from './crm-profile-settings.types';

@Component({
  selector: 'app-crm-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LocaleNumberPipe, UiInlineTextComponent],
  templateUrl: './crm-profile-settings.component.html',
  styleUrls: ['./crm-profile-settings.component.css'],
})
export class CrmProfileSettingsComponent implements OnInit {
  readonly ui = inject(UiTranslationsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly requirementKeys = CRM_PROFILE_REQUIREMENT_KEYS;
  readonly pageSizeOptions = [10, 20, 50] as const;

  fields: CrmProfileFieldSetting[] = CRM_PROFILE_FIELD_DEFAULTS.map((field) => ({
    ...field,
    requirements: { ...field.requirements },
    expanded: false,
  }));

  pageSize: (typeof this.pageSizeOptions)[number] = 10;
  currentPage = 1;

  ngOnInit(): void {
    bindUiTranslationRefresh(this.cdr, this.destroyRef);
  }

  label(key: string): string {
    return this.ui.screenText('crmProfileSettings', key);
  }

  requirementLabel(key: CrmProfileRequirementKey): string {
    switch (key) {
      case 'onCreate':
        return this.label('reqOnCreate');
      case 'onCheckIn':
        return this.label('reqOnCheckIn');
      case 'onNightAudit':
        return this.label('reqOnNightAudit');
      default:
        return '';
    }
  }

  setUsed(field: CrmProfileFieldSetting, used: boolean): void {
    field.used = used;
    if (!field.used) {
      for (const key of this.requirementKeys) {
        field.requirements[key] = false;
      }
      return;
    }
    for (const key of this.requirementKeys) {
      field.requirements[key] = true;
    }
  }

  toggleUsed(field: CrmProfileFieldSetting): void {
    this.setUsed(field, !field.used);
  }

  toggleRequirement(field: CrmProfileFieldSetting, key: CrmProfileRequirementKey): void {
    if (!field.used) {
      return;
    }
    field.requirements[key] = !field.requirements[key];
  }

  requirementActive(field: CrmProfileFieldSetting, key: CrmProfileRequirementKey): boolean {
    return field.used && field.requirements[key];
  }

  editField(field: CrmProfileFieldSetting): void {
    void field;
  }

  hasSubItems(field: CrmProfileFieldSetting): boolean {
    return (field.subItemCount ?? 0) > 0;
  }

  subItemsLabel(field: CrmProfileFieldSetting): string {
    return this.label('subItemsCount').replace('{count}', String(field.subItemCount ?? 0));
  }

  toggleExpand(field: CrmProfileFieldSetting): void {
    if (!this.hasSubItems(field)) {
      return;
    }
    field.expanded = !field.expanded;
  }

  trackField(_index: number, field: CrmProfileFieldSetting): string {
    return field.id;
  }

  get totalItems(): number {
    return this.fields.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get pagedFields(): CrmProfileFieldSetting[] {
    const safePage = Math.min(this.currentPage, this.totalPages);
    const start = (safePage - 1) * this.pageSize;
    return this.fields.slice(start, start + this.pageSize);
  }

  get rangeFrom(): number {
    if (this.totalItems === 0) {
      return 0;
    }
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setPageSize(size: number): void {
    this.pageSize = size as (typeof this.pageSizeOptions)[number];
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(Math.max(1, page), this.totalPages);
  }

  goFirstPage(): void {
    this.goToPage(1);
  }

  goLastPage(): void {
    this.goToPage(this.totalPages);
  }

  pageRangeSummary(): string {
    return this.label('pageRangeSummary')
      .replace('{from}', String(this.rangeFrom))
      .replace('{to}', String(this.rangeTo))
      .replace('{total}', String(this.totalItems));
  }
}
