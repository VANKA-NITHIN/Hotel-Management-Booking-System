import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  hideCloseButton?: boolean;
  footer?: React.ReactNode;
}

const positionClasses = {
  left: 'top-0 left-0 h-full border-r',
  right: 'top-0 right-0 h-full border-l',
  bottom: 'bottom-0 left-0 right-0 w-full rounded-t-2xl border-t',
};

const sizeClasses = {
  left: {
    sm: 'w-64', md: 'w-80', lg: 'w-96', xl: 'w-[32rem]', full: 'w-screen',
  },
  right: {
    sm: 'w-64', md: 'w-80', lg: 'w-96', xl: 'w-[32rem]', full: 'w-screen',
  },
  bottom: {
    sm: 'h-1/3', md: 'h-1/2', lg: 'h-2/3', xl: 'h-5/6', full: 'h-screen',
  },
};

const getSlideAnimation = (position: 'left' | 'right' | 'bottom') => {
  switch (position) {
    case 'left': return { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } };
    case 'right': return { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } };
    case 'bottom': return { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } };
  }
};

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = 'right',
  size = 'md',
  className = '',
  hideCloseButton = false,
  footer,
}: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        if (drawerRef.current) {
          const focusable = drawerRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (focusable.length) (focusable[0] as HTMLElement).focus();
          else drawerRef.current.focus();
        }
      }, 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleEscape]);

  const animation = getSlideAnimation(position);
  const sizeClass = sizeClasses[position][size];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] overflow-hidden">
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            {...animation}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              absolute bg-bg-surface border-border-base shadow-2xl flex flex-col
              ${positionClasses[position]} 
              ${sizeClass} 
              ${position !== 'bottom' ? 'max-w-[calc(100vw-3rem)] sm:max-w-none' : ''}
              ${className}
            `}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'drawer-title' : undefined}
          >
            {(title || !hideCloseButton) && (
              <div className="flex items-start justify-between p-5 sm:p-6 border-b border-border-base shrink-0">
                <div>
                  {title && <h2 id="drawer-title" className="text-lg font-bold text-text-base">{title}</h2>}
                  {description && <p className="text-sm text-text-muted mt-1">{description}</p>}
                </div>
                {!hideCloseButton && (
                  <button
                    onClick={onClose}
                    className="flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 -mt-2 rounded-lg text-text-muted hover:text-text-base hover:bg-bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-secondary"
                    aria-label="Close drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {children}
            </div>

            {footer && (
              <div className="p-5 sm:p-6 border-t border-border-base bg-bg-surface-hover/50 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
