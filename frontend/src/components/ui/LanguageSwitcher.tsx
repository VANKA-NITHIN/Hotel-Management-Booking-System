import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '../../i18n/config';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'navbar' | 'settings' | 'compact';
}

export function LanguageSwitcher({ className = '', variant = 'navbar' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const currentLang = SUPPORTED_LANGUAGES[language];

  const filteredLanguages = useMemo(() => {
    if (!search) return Object.values(SUPPORTED_LANGUAGES);
    const q = search.toLowerCase();
    return Object.values(SUPPORTED_LANGUAGES).filter(
      (l) => l.name.toLowerCase().includes(q) || l.nativeName.toLowerCase().includes(q) || l.code.includes(q)
    );
  }, [search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (variant === 'settings') {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code as LanguageCode)}
              className={`p-3 rounded-xl border text-start transition-all ${
                language === lang.code
                  ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                  : 'border-border-base hover:border-border-strong hover:bg-bg-surface-hover'
              }`}
            >
              <span className="text-lg me-2">{lang.flag}</span>
              <div className="mt-1">
                <span className="block text-sm font-bold text-text-base">{lang.nativeName}</span>
                <span className="block text-xs text-text-muted">{lang.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-base bg-bg-surface hover:bg-bg-surface-hover text-xs font-bold text-text-base transition-colors"
        aria-label="Select Language"
      >
        <span className="text-sm">{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.nativeName}</span>
        <ChevronDown className={`w-3 h-3 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute end-0 mt-2 w-72 bg-bg-surface border border-border-base rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-2 border-b border-border-base">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search languages..."
                  className="w-full ps-9 pe-8 py-2 bg-bg-surface-hover rounded-lg text-xs text-text-base placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute end-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-bg-surface-active"
                  >
                    <X className="w-3 h-3 text-text-muted" />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {filteredLanguages.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as LanguageCode);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-start transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-base hover:bg-bg-surface-hover'
                    }`}
                  >
                    <span className="text-lg shrink-0">{lang.flag}</span>
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold truncate">{lang.nativeName}</span>
                      <span className="block text-[11px] text-text-muted truncate">{lang.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                );
              })}
              {filteredLanguages.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-text-muted">
                  No languages found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
