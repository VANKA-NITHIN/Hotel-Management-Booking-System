import { toast as hotToast, resolveValue } from 'react-hot-toast';
import type { Toast as HotToastProps } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface ToastProps {
  t: HotToastProps;
}

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-success" />,
  error: <AlertCircle className="w-5 h-5 text-danger" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning" />,
  info: <Info className="w-5 h-5 text-info" />,
};

const borderStyles = {
  success: 'border-s-4 border-s-success',
  error: 'border-s-4 border-s-danger',
  warning: 'border-s-4 border-s-warning',
  info: 'border-s-4 border-s-info',
  blank: 'border border-border-base',
  custom: 'border border-border-base',
  loading: 'border border-border-base',
};

export function Toast({ t }: ToastProps) {
  // Determine type based on standard hot-toast types or custom properties
  const type = t.type as keyof typeof icons | 'blank' | 'custom' | 'loading';
  const icon = icons[type as keyof typeof icons];
  
  return (
    <AnimatePresence>
      {t.visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`
            max-w-md w-full bg-bg-surface shadow-elevated rounded-xl pointer-events-auto
            flex items-start overflow-hidden
            ${borderStyles[type] || borderStyles.blank}
          `}
        >
          <div className="p-4 flex-1 flex gap-3">
            {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
            
            <div className="flex-1 text-sm font-medium text-text-base">
              {resolveValue(t.message, t)}
            </div>
            
            <button
              onClick={() => hotToast.dismiss(t.id)}
              className="shrink-0 -mr-2 -mt-2 p-2 rounded-lg text-text-muted hover:text-text-base hover:bg-bg-surface-hover transition-colors focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Wrapper utility for simple usage throughout the app
export const toast = {
  success: (msg: string) => hotToast.custom((t) => <Toast t={{...t, type: 'success', message: msg} as any} />),
  error: (msg: string) => hotToast.custom((t) => <Toast t={{...t, type: 'error', message: msg} as any} />),
  warning: (msg: string) => hotToast.custom((t) => <Toast t={{...t, type: 'warning', message: msg} as any} />),
  info: (msg: string) => hotToast.custom((t) => <Toast t={{...t, type: 'info', message: msg} as any} />),
  dismiss: hotToast.dismiss,
};
