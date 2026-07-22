export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' as const },
  te: { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', dir: 'ltr' as const },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' as const },
  ta: { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', dir: 'ltr' as const },
  kn: { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', dir: 'ltr' as const },
  ml: { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', dir: 'ltr' as const },
  mr: { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', dir: 'ltr' as const },
  bn: { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', dir: 'ltr' as const },
  gu: { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', dir: 'ltr' as const },
  pa: { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', dir: 'ltr' as const },
  ur: { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl' as const },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' as const },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' as const },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' as const },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' as const },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', dir: 'ltr' as const },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', dir: 'ltr' as const },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' as const },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', dir: 'ltr' as const },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', dir: 'ltr' as const },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const RTL_LANGUAGES: LanguageCode[] = ['ar', 'ur'];

export function isRTL(lang: string): boolean {
  return RTL_LANGUAGES.includes(lang as LanguageCode);
}

export function getLanguageConfig(lang: string) {
  return SUPPORTED_LANGUAGES[lang as LanguageCode] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
}
