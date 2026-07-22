import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const handleFocus = () => {
    setIsVisible(true);
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const positionStyles = {
    top: 'bottom-full start-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full start-1/2 -translate-x-1/2 mt-2',
    left: 'end-full top-1/2 -translate-y-1/2 me-2',
    right: 'start-full top-1/2 -translate-y-1/2 ms-2',
  };

  const animationVariants = {
    top: { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 } },
    bottom: { initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 5 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -5 }, animate: { opacity: 1, x: 0 } },
  };

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={animationVariants[position].initial}
            animate={animationVariants[position].animate}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.15 }}
            className={`
              absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white 
              bg-neutral-900 rounded-md shadow-sm whitespace-nowrap pointer-events-none
              ${positionStyles[position]}
              ${className}
            `}
            role="tooltip"
          >
            {content}
            {/* Arrow */}
            <div 
              className={`
                absolute w-2 h-2 bg-neutral-900 rotate-45
                ${position === 'top' ? 'bottom-[-4px] start-1/2 -translate-x-1/2' : ''}
                ${position === 'bottom' ? 'top-[-4px] start-1/2 -translate-x-1/2' : ''}
                ${position === 'left' ? 'end-[-4px] top-1/2 -translate-y-1/2' : ''}
                ${position === 'right' ? 'start-[-4px] top-1/2 -translate-y-1/2' : ''}
              `} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
