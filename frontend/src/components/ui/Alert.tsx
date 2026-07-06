import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  className?: string;
}

const config = {
  info: { icon: Info, bg: 'bg-info-light dark:bg-info/10', border: 'border-info/20', text: 'text-info-dark dark:text-info-light', Icon: Info },
  success: { icon: CheckCircle2, bg: 'bg-success-light dark:bg-success/10', border: 'border-success/20', text: 'text-success-dark dark:text-success-light', Icon: CheckCircle2 },
  warning: { icon: AlertTriangle, bg: 'bg-warning-light dark:bg-warning/10', border: 'border-warning/20', text: 'text-warning-dark dark:text-warning-light', Icon: AlertTriangle },
  danger: { icon: AlertCircle, bg: 'bg-danger-light dark:bg-danger/10', border: 'border-danger/20', text: 'text-danger-dark dark:text-danger-light', Icon: AlertCircle },
};

export function Alert({ variant = 'info', title, children, dismissible, className = '' }: AlertProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const { bg, border, text, Icon } = config[variant];

  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${bg} ${border} ${className}`} role="alert">
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${text}`} />
      <div className="flex-1 min-w-0">
        {title && <h4 className={`font-semibold text-sm mb-0.5 ${text}`}>{title}</h4>}
        <div className={`text-sm ${variant === 'info' ? 'text-gray-600 dark:text-gray-400' : text}`}>{children}</div>
      </div>
      {dismissible && (
        <button onClick={() => setDismissed(true)} className={`shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${text}`}>
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
