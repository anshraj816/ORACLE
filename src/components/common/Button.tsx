import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 select-none rounded-xl active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-lg shadow-indigo-950/40 border border-indigo-400/20',
    secondary:
      'bg-[#191c2b] hover:bg-[#22263a] text-slate-200 border border-white/[0.08] shadow-sm',
    ghost:
      'bg-transparent hover:bg-white/[0.05] text-slate-300 hover:text-white',
    outline:
      'bg-transparent border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400',
    danger:
      'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
