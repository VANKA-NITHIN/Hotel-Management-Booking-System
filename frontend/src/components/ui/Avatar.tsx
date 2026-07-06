interface AvatarProps {
  src?: string;
  initials: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export function Avatar({ src, initials, size = 'md', className = '', alt }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || initials}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full gold-gradient flex items-center justify-center text-white font-bold shrink-0 ${className}`}>
      {initials}
    </div>
  );
}
