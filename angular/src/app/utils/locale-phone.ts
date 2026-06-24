import { resolveArabicRegionProfile, type ArabicRegionProfile } from './arabic-region-profile.util';
import type { HotelUiLocaleCode } from './hotel-currency.presets';

/** بادئة الهاتف المعروضة حسب لغة الواجهة (نفس أعلام الشريط الجانبي) */
export type LocalePhoneDisplay = {
  flagEmoji: string;
  flagSrc: string;
  dialCode: string;
  maxLength: number;
};

const LOCALE_PHONE: Record<HotelUiLocaleCode, LocalePhoneDisplay> = {
  ar: { flagEmoji: '🇸🇦', flagSrc: 'assets/flags/sa.svg', dialCode: '+966', maxLength: 9 },
  en: { flagEmoji: '🇺🇸', flagSrc: 'assets/flags/us.svg', dialCode: '+1', maxLength: 10 },
  fr: { flagEmoji: '🇫🇷', flagSrc: 'assets/flags/fr.svg', dialCode: '+33', maxLength: 9 },
  tr: { flagEmoji: '🇹🇷', flagSrc: 'assets/flags/tr.svg', dialCode: '+90', maxLength: 10 },
  id: { flagEmoji: '🇮🇩', flagSrc: 'assets/flags/id.svg', dialCode: '+62', maxLength: 11 },
  am: { flagEmoji: '🇪🇹', flagSrc: 'assets/flags/et.svg', dialCode: '+251', maxLength: 9 },
};

export function localePhoneDisplay(
  locale: string,
  arabicProfile?: ArabicRegionProfile | LocalePhoneDisplay | null,
): LocalePhoneDisplay {
  if (locale === 'ar') {
    if (arabicProfile) {
      const { flagEmoji, flagSrc, dialCode, maxLength } = arabicProfile;
      return { flagEmoji, flagSrc, dialCode, maxLength };
    }
    return resolveArabicRegionProfile('');
  }
  if (locale in LOCALE_PHONE) {
    return LOCALE_PHONE[locale as HotelUiLocaleCode];
  }
  return LOCALE_PHONE.ar;
}
