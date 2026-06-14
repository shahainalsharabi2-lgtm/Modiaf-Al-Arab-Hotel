export type UiTranslationSectionFilter = 'all' | 'translated' | 'untranslated';

export interface UiTranslationGroupTranslationStats {
  total: number;
  translated: number;
  untranslated: number;
}

export function isUiTranslationValueFilled(value: string | undefined | null): boolean {
  return !!(value ?? '').trim();
}

/** مرجع عربي تالف (رقم فقط) — يُستبعد من محرر ترجمة الواجهة */
export function isUiTranslationCorruptedNumericPlaceholder(
  value: string | undefined | null,
): boolean {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 && /^\d+$/.test(trimmed);
}

export function emptyUiTranslationGroupStats(): UiTranslationGroupTranslationStats {
  return { total: 0, translated: 0, untranslated: 0 };
}

export function uiTranslationGroupStatsFromCounts(
  total: number,
  translated: number,
): UiTranslationGroupTranslationStats {
  return {
    total,
    translated,
    untranslated: Math.max(0, total - translated),
  };
}

export function uiTranslationValueMatchesSectionFilter(
  filter: UiTranslationSectionFilter,
  value: string | undefined | null,
): boolean {
  if (filter === 'all') {
    return true;
  }
  const filled = isUiTranslationValueFilled(value);
  if (filter === 'translated') {
    return filled;
  }
  return !filled;
}

export function uiTranslationGroupMatchesSectionFilter(
  filter: UiTranslationSectionFilter,
  stats: UiTranslationGroupTranslationStats,
): boolean {
  if (filter === 'all' || stats.total === 0) {
    return filter === 'all';
  }
  if (filter === 'translated') {
    return stats.untranslated === 0;
  }
  return stats.untranslated > 0;
}
