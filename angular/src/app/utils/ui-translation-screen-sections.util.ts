export interface UiTranslationScreenSection {
  id: string;
  labelKey: string;
  keys: readonly string[];
}

const PAGE_SECTION_RULES: ReadonlyArray<{
  id: string;
  labelKey: string;
  match: (key: string) => boolean;
}> = [
  {
    id: 'buttons',
    labelKey: 'uiTranslationsScreenSectionButtons',
    match: (key) =>
      key.startsWith('add') ||
      key.startsWith('btn') ||
      key.endsWith('Btn') ||
      key.endsWith('Button') ||
      key.endsWith('Submit') ||
      key === 'save' ||
      key === 'cancel',
  },
  {
    id: 'tooltips',
    labelKey: 'uiTranslationsScreenSectionTooltips',
    match: (key) =>
      key !== 'pageTitle' &&
      key !== 'pageSubtitle' &&
      (
        key.endsWith('Title') ||
        key.endsWith('Tooltip') ||
        key.endsWith('Tip') ||
        key.endsWith('Hint') ||
        key.endsWith('Aria')
      ),
  },
  {
    id: 'texts',
    labelKey: 'uiTranslationsScreenSectionTexts',
    match: (key) =>
      key === 'pageTitle' ||
      key === 'pageSubtitle' ||
      key.endsWith('Title') ||
      key.endsWith('Subtitle') ||
      key.endsWith('Label') ||
      key.startsWith('label') ||
      key.startsWith('field') ||
      key.startsWith('tab') ||
      key.startsWith('view'),
  },
  {
    id: 'cols',
    labelKey: 'uiTranslationsScreenSectionCols',
    match: (key) => key.startsWith('col'),
  },
  {
    id: 'filters',
    labelKey: 'uiTranslationsScreenSectionFilters',
    match: (key) => key.startsWith('filter'),
  },
  {
    id: 'status',
    labelKey: 'uiTranslationsScreenSectionStatus',
    match: (key) => key.startsWith('status'),
  },
  {
    id: 'modals',
    labelKey: 'uiTranslationsScreenSectionModals',
    match: (key) => key.includes('Modal') || key.startsWith('modal'),
  },
  {
    id: 'aria',
    labelKey: 'uiTranslationsScreenSectionAria',
    match: (key) => key.endsWith('Aria'),
  },
  {
    id: 'placeholders',
    labelKey: 'uiTranslationsScreenSectionPlaceholders',
    match: (key) => key.endsWith('Placeholder'),
  },
  {
    id: 'empty',
    labelKey: 'uiTranslationsScreenSectionEmpty',
    match: (key) => key.startsWith('empty'),
  },
];

export function isUiTranslationSystemMessageKey(key: string): boolean {
  return (
    (key !== 'pageTitle' &&
      key !== 'pageSubtitle' &&
      /(?:Title|Tooltip|Tip|Hint|Aria|Placeholder|Badge|Microcopy|Desc|Description|Info|Help|Note|Prompt)$/i.test(key)) ||
    /(?:Success|Fail|Failed|Error|Confirm|Warning|Warn|Invalid|Duplicate|Required|Saved|Saving)$/i.test(key) ||
    /(?:Toast|Message|Notify|Badge|Microcopy|Description|Help|Info|Note|Prompt)/i.test(key) ||
    /^empty[A-Z]/.test(key) ||
    /^notify[A-Z]/.test(key) ||
    key === 'loading' ||
    key === 'saving'
  );
}

export function uiTranslationScreenSectionStorageKey(screenId: string, sectionId: string): string {
  return `screen-section:${screenId}:${sectionId}`;
}

/** أقسام فرعية مستبعدة من محرر الترجمة لشاشة معيّنة */
export const UI_TRANSLATION_EDITOR_EXCLUDED_SCREEN_SECTIONS: Readonly<
  Record<string, ReadonlySet<string>>
> = {
  dashboard: new Set(['system-msgs', 'general']),
};

export function uiTranslationScreenSectionsForEditor(
  screenId: string,
  keys: readonly string[],
): readonly UiTranslationScreenSection[] {
  const sections = uiTranslationScreenSections(keys);
  const excluded = UI_TRANSLATION_EDITOR_EXCLUDED_SCREEN_SECTIONS[screenId];
  return sections.filter((section) => section.id !== 'system-msgs' && !excluded?.has(section.id));
}

export function uiTranslationScreenSections(keys: readonly string[]): readonly UiTranslationScreenSection[] {
  const sorted = [...keys].sort((a, b) => a.localeCompare(b));
  const systemKeys = sorted.filter((key) => isUiTranslationSystemMessageKey(key));
  const pageKeys = sorted.filter((key) => !isUiTranslationSystemMessageKey(key));
  const sections: UiTranslationScreenSection[] = [];
  const assigned = new Set<string>();

  if (systemKeys.length) {
    sections.push({
      id: 'system-msgs',
      labelKey: 'uiTranslationsSystemMessages',
      keys: systemKeys,
    });
  }

  for (const rule of PAGE_SECTION_RULES) {
    const sectionKeys = pageKeys.filter((key) => !assigned.has(key) && rule.match(key));
    if (!sectionKeys.length) {
      continue;
    }
    for (const key of sectionKeys) {
      assigned.add(key);
    }
    sections.push({
      id: rule.id,
      labelKey: rule.labelKey,
      keys: sectionKeys,
    });
  }

  const otherKeys = pageKeys.filter((key) => !assigned.has(key));
  if (otherKeys.length) {
    sections.push({
      id: 'other',
      labelKey: 'uiTranslationsScreenSectionOther',
      keys: otherKeys,
    });
  }

  return sections;
}
