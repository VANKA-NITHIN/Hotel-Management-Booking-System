import { forwardRef, useState } from 'react';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  success?: boolean;
  loading?: boolean;
  showCharacterCount?: boolean;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      rightIcon,
      success,
      loading,
      showCharacterCount,
      fullWidth = true,
      className = '',
      type,
      maxLength,
      value,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    // Use provided ID or fallback for a11y connections
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className={`${fullWidth ? 'w-full' : 'inline-block'}`}>
        {label && (
          <div className="flex justify-between items-center mb-1.5">
            <label
              htmlFor={inputId}
              className="block text-sm font-medium text-text-base"
            >
              {label}
            </label>
            {showCharacterCount && maxLength && (
              <span className="text-xs text-text-muted">
                {currentLength} / {maxLength}
              </span>
            )}
          </div>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute start-3 top-1/2 -translate-y-1/2 text-text-muted flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            maxLength={maxLength}
            value={value}
            aria-invalid={!!error}
            aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
            className={`
              input-field 
              ${icon ? 'ps-10' : ''} 
              ${(isPassword || rightIcon || success || error || loading) ? 'pe-10' : ''} 
              ${error ? 'input-error' : ''} 
              ${success && !error ? 'border-success focus:border-success focus:ring-success/20' : ''}
              ${className}
            `}
            {...props}
          />

          <div className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {loading && <Loader2 className="w-4 h-4 text-text-muted animate-spin" />}
            
            {error && !loading && (
              <AlertCircle className="w-4 h-4 text-danger pointer-events-none" />
            )}
            
            {success && !error && !loading && (
              <CheckCircle2 className="w-4 h-4 text-success pointer-events-none" />
            )}

            {isPassword && !loading && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-muted hover:text-text-base transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus rounded-sm"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}

            {rightIcon && !isPassword && !error && !success && !loading && (
              <div className="text-text-muted flex items-center">
                {rightIcon}
              </div>
            )}
          </div>
        </div>

        {error && (
          <p id={errorId} className="text-xs text-danger mt-1.5 flex items-start gap-1">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={helperId} className="text-xs text-text-muted mt-1.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
