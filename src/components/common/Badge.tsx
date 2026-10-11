import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'indigo' | 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'indigo',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const variantStyles = {
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    violet: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    slate: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  };

  const dotColors = {
    indigo: 'bg-indigo-400',
    cyan: 'bg-cyan-400',
    violet: 'bg-violet-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    slate: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`} />}
      {children}
    </span>
  );
};
