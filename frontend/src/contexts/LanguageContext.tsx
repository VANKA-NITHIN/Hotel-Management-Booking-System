import { createContext, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage } from '../i18n';
import { SUPPORTED_LANGUAGES, type LanguageCode, isRTL, getLanguageConfig } from '../i18n/config';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  isRTL: boolean;
  dir: 'ltr' | 'rtl';
  languages: typeof SUPPORTED_LANGUAGES;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: Date | string) => string;
  formatRelativeTime: (date: Date | string) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currencyCode?: string) => string;
  formatPercent: (num: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const CURRENCY_MAP: Record<string, string> = {
  en: 'USD', te: 'INR', hi: 'INR', ta: 'INR', kn: 'INR', ml: 'INR',
  mr: 'INR', bn: 'INR', gu: 'INR', pa: 'INR', ur: 'INR', ar: 'SAR',
  fr: 'EUR', de: 'EUR', es: 'EUR', pt: 'EUR', it: 'EUR',
  ja: 'JPY', ko: 'KRW', zh: 'CNY',
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const lang = getCurrentLanguage();
  const rtl = isRTL(lang);
  const config = getLanguageConfig(lang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  }, [lang, rtl]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'luxurystay_language' && e.newValue) {
        changeLanguage(e.newValue as LanguageCode);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const ctx = useMemo<LanguageContextType>(() => ({
    language: lang,
    setLanguage: changeLanguage,
    isRTL: rtl,
    dir: rtl ? 'rtl' : 'ltr',
    languages: SUPPORTED_LANGUAGES,
    formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString(lang, options || {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    },
    formatTime: (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
    },
    formatRelativeTime: (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      const diff = d.getTime() - Date.now();
      const absDiff = Math.abs(diff);
      const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
      if (absDiff < 60000) return rtf.format(Math.round(diff / 1000), 'second');
      if (absDiff < 3600000) return rtf.format(Math.round(diff / 60000), 'minute');
      if (absDiff < 86400000) return rtf.format(Math.round(diff / 3600000), 'hour');
      if (absDiff < 2592000000) return rtf.format(Math.round(diff / 86400000), 'day');
      if (absDiff < 31536000000) return rtf.format(Math.round(diff / 2592000000), 'month');
      return rtf.format(Math.round(diff / 31536000000), 'year');
    },
    formatNumber: (num: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(lang, options).format(num);
    },
    formatCurrency: (amount: number, currencyCode?: string) => {
      const code = currencyCode || CURRENCY_MAP[lang] || 'USD';
      return new Intl.NumberFormat(lang, { style: 'currency', currency: code }).format(amount);
    },
    formatPercent: (num: number) => {
      return new Intl.NumberFormat(lang, { style: 'percent', minimumFractionDigits: 1 }).format(num / 100);
    },
  }), [lang, rtl]);

  return (
    <LanguageContext.Provider value={ctx}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
