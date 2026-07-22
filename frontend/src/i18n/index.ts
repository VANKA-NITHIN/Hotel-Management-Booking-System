import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { DEFAULT_LANGUAGE, type LanguageCode } from './config';

const STORAGE_KEY = 'luxurystay_language';

function getSavedLanguage(): LanguageCode {
  const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode;
  if (saved) return saved;
  const browserLang = navigator.language.split('-')[0] as LanguageCode;
  return browserLang;
}

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: ['en', 'te', 'hi', 'ta', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa', 'ur', 'ar', 'fr', 'de', 'es', 'pt', 'it', 'ja', 'ko', 'zh'],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  });

export function changeLanguage(lang: LanguageCode) {
  i18n.changeLanguage(lang);
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  const dir = (lang === 'ar' || lang === 'ur') ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
}

export function getCurrentLanguage(): LanguageCode {
  return (i18n.language?.split('-')[0] || DEFAULT_LANGUAGE) as LanguageCode;
}

export default i18n;
