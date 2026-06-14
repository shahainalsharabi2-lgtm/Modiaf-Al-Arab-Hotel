import type { UiTranslationFieldLocationKind } from './ui-translation-field-location.util';
import {
  isUiTranslationCorruptedNumericPlaceholder,
  isUiTranslationValueFilled,
} from './ui-translation-group-stats.util';

export interface UiTranslationUntranslatedFlatRow {
  trackId: string;
  contextLabel: string;
  referenceAr: string;
  referenceEn: string;
  defaultValue: string;
  kind: UiTranslationFieldLocationKind;
  key: string;
  screenId?: string;
}

export function pushUntranslatedFlatRow(
  rows: UiTranslationUntranslatedFlatRow[],
  row: Omit<UiTranslationUntranslatedFlatRow, 'defaultValue'> & { value: string | undefined },
): void {
  if (isUiTranslationCorruptedNumericPlaceholder(row.referenceAr)) {
    return;
  }
  if (isUiTranslationValueFilled(row.value)) {
    return;
  }
  rows.push({
    trackId: row.trackId,
    contextLabel: row.contextLabel,
    referenceAr: row.referenceAr,
    referenceEn: row.referenceEn,
    defaultValue: row.value ?? '',
    kind: row.kind,
    key: row.key,
    screenId: row.screenId,
  });
}
