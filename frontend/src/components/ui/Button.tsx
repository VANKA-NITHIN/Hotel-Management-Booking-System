import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantClasses: Record<string, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  link: 'btn-link',
};

const sizeClasses: Record<string, string> = {
  xs: 'text-xs px-2.5 py-1.5',
  sm: 'text-sm px-3 py-2',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-6 py-3',
  xl: 'text-lg px-8 py-4',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        className={`
          ${variantClasses[variant] || variantClasses.primary}
          ${sizeClasses[size] || sizeClasses.md}
          ${fullWidth ? 'w-full flex justify-center' : 'inline-flex'}
          ${className}
        `}
        {...props}
      >
        {loading && iconPosition === 'left' && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" aria-hidden="true" />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className="w-4 h-4 mr-2 shrink-0 flex items-center justify-center" aria-hidden="true">
            {icon}
          </span>
        )}

        <span>{loading && loadingText ? loadingText : children}</span>

        {loading && iconPosition === 'right' && (
          <Loader2 className="w-4 h-4 ml-2 animate-spin shrink-0" aria-hidden="true" />
        )}
        {!loading && icon && iconPosition === 'right' && (
          <span className="w-4 h-4 ml-2 shrink-0 flex items-center justify-center" aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
