import { forwardRef } from 'react';
import { Calendar } from 'lucide-react';
import type { InputProps } from './Input';
import { Input } from './Input';

export interface DatePickerProps extends Omit<InputProps, 'type' | 'icon'> {
  minDate?: string;
  maxDate?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className = '', minDate, maxDate, ...props }, ref) => {
    return (
      <div className="relative">
        <Input
          ref={ref}
          type="date"
          min={minDate}
          max={maxDate}
          icon={<Calendar className="w-5 h-5" />}
          className={`
            [&::-webkit-calendar-picker-indicator]:opacity-0 
            [&::-webkit-calendar-picker-indicator]:absolute
            [&::-webkit-calendar-picker-indicator]:inset-0
            [&::-webkit-calendar-picker-indicator]:w-full
            [&::-webkit-calendar-picker-indicator]:h-full
            [&::-webkit-calendar-picker-indicator]:cursor-pointer
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
