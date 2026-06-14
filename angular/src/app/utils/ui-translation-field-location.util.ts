import { localeEditorScreenTitle } from './ui-locale-editor-labels';

export type UiTranslationFieldLocationKind =
  | 'brandSubtitle'
  | 'chrome'
  | 'sidebarNav'
  | 'screenCopy'
  | 'settings';

export interface UiTranslationFieldLocationQuery {
  kind: UiTranslationFieldLocationKind;
  key: string;
  screenId?: string;
  panelPathKeys?: readonly string[];
}

function inferScreenKeyPlacement(key: string): string {
  if (key === 'pageTitle' || key === 'pageSubtitle') {
    return 'عنوان الصفحة';
  }
  if (key.startsWith('col')) {
    return 'جدول';
  }
  if (key.startsWith('filter')) {
    return 'فلاتر';
  }
  if (key.startsWith('add') || key.startsWith('btn')) {
    return 'أزرار';
  }
  if (key.startsWith('tab')) {
    return 'تبويب';
  }
  if (key.includes('Modal') || key.startsWith('modal')) {
    return 'نافذة منبثقة';
  }
  if (key.endsWith('Aria')) {
    return 'وصف مساعد';
  }
  if (key.endsWith('Placeholder')) {
    return 'حقل إدخال';
  }
  if (key.startsWith('status')) {
    return 'حالة';
  }
  if (key.startsWith('empty')) {
    return 'رسالة فارغة';
  }
  if (/(?:Success|Fail|Error|Confirm|Hint|Warning)$/i.test(key)) {
    return 'رسالة نظام';
  }
  return 'نص الصفحة';
}

function inferChromePlacement(key: string): string {
  if (key.startsWith('navRail')) {
    return 'الشريط الجانبي';
  }
  if (key.startsWith('lang')) {
    return 'الشريط العلوي · اللغة';
  }
  if (key.startsWith('search')) {
    return 'الشريط العلوي · البحث';
  }
  if (key.startsWith('account') || key.startsWith('notifications')) {
    return 'الشريط العلوي · الحساب';
  }
  if (key.startsWith('uiInline')) {
    return 'وضع الترجمة';
  }
  if (key.startsWith('help')) {
    return 'قائمة المساعدة';
  }
  if (key.startsWith('settingsMenu')) {
    return 'الشريط العلوي · الإعدادات';
  }
  return 'الشريط العلوي';
}

function joinLocation(parts: Array<string | undefined | null>): string {
  return parts
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join(' · ');
}

export function uiTranslationFieldLocationId(
  kind: UiTranslationFieldLocationKind,
  key: string,
  screenId?: string,
): string {
  return `${kind}:${screenId ?? '-'}:${key}`;
}

export function uiTranslationFieldLocationHint(
  query: UiTranslationFieldLocationQuery,
  labelForNavKey?: (key: string) => string,
): string {
  switch (query.kind) {
    case 'brandSubtitle':
      return 'في الشريط الجانبي · تحت اسم الفندق';
    case 'chrome':
      return `في ${inferChromePlacement(query.key)}`;
    case 'sidebarNav': {
      const label = labelForNavKey?.(query.key) ?? query.key;
      return joinLocation(['في القائمة', label]);
    }
    case 'settings': {
      const path =
        query.panelPathKeys
          ?.map((pathKey) => labelForNavKey?.(pathKey) ?? pathKey)
          .filter(Boolean)
          .join(' / ') || 'الإعدادات';
      return `في ${path}`;
    }
    case 'screenCopy': {
      const screenId = query.screenId ?? '';
      const screenTitle = screenId ? localeEditorScreenTitle(screenId) : screenId;
      return screenTitle ? `في ${screenTitle}` : inferScreenKeyPlacement(query.key);
    }
    default:
      return 'في واجهة النظام';
  }
}
