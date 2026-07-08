import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AccordionItemProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function AccordionItem({ title, children, isOpen = false, onToggle, className = '' }: AccordionItemProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(isOpen);
  const isControlled = onToggle !== undefined;
  
  const isExpanded = isControlled ? isOpen : internalIsOpen;

  const handleToggle = () => {
    if (isControlled) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  return (
    <div className={`border-b border-border-base last:border-0 ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full py-4 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-md"
        aria-expanded={isExpanded}
      >
        <span className="font-semibold text-text-base">{title}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-muted shrink-0 ml-4"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-text-muted text-sm leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface AccordionProps {
  items: { id: string; title: string | React.ReactNode; content: React.ReactNode }[];
  allowMultiple?: boolean;
  defaultExpandedIds?: string[];
  className?: string;
}

export function Accordion({ items, allowMultiple = false, defaultExpandedIds = [], className = '' }: AccordionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(defaultExpandedIds));

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!allowMultiple) newSet.clear();
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className={`bg-bg-surface border border-border-base rounded-xl px-5 ${className}`}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          title={item.title}
          isOpen={expandedIds.has(item.id)}
          onToggle={() => handleToggle(item.id)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}
