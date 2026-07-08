interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'secondary';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantMap: Record<string, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  neutral: 'badge-neutral',
  secondary: 'badge-secondary',
};

export function Badge({ variant = 'neutral', children, className = '', dot }: BadgeProps) {
  return (
    <span className={`badge ${variantMap[variant]} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

export const statusBadge = (status: string) => {
  const map: Record<string, BadgeProps['variant']> = {
    PENDING: 'warning',
    CONFIRMED: 'success',
    CHECKED_IN: 'info',
    CHECKED_OUT: 'neutral',
    CANCELLED: 'danger',
    REFUNDED: 'info',
    AVAILABLE: 'success',
    OCCUPIED: 'warning',
    MAINTENANCE: 'danger',
    CLEAN: 'success',
    DIRTY: 'warning',
    INSPECTION: 'info',
  };
  return { variant: map[status] || 'neutral', dot: true };
};
