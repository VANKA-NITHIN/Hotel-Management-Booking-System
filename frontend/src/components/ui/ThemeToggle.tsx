import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1 gap-0.5">
      {[
        { value: 'light' as const, icon: Sun, label: 'Light' },
        { value: 'system' as const, icon: Monitor, label: 'System' },
        { value: 'dark' as const, icon: Moon, label: 'Dark' },
      ].map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            theme === value
              ? 'text-secondary'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          {theme === value && (
            <motion.div
              layoutId="theme-toggle-bg"
              className="absolute inset-0 bg-white dark:bg-gray-700 rounded-full shadow-sm"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <Icon className="w-4 h-4 relative z-10" />
        </button>
      ))}
    </div>
  );
}
