import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: 'indigo' | 'cyan' | 'violet' | 'emerald' | 'none';
  variant?: 'glass' | 'solid' | 'subtle';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  variant = 'glass',
  ...props
}) => {
  const variantStyles = {
    glass: 'bg-[#0f111a]/80 backdrop-blur-md border border-white/[0.08] shadow-xl shadow-black/40',
    solid: 'bg-[#121422] border border-white/[0.06] shadow-lg',
    subtle: 'bg-[#0b0c13]/60 border border-white/[0.04]',
  };

  const glowStyles = {
    none: '',
    indigo: 'hover:border-indigo-500/30 hover:shadow-indigo-500/5 transition-all duration-300',
    cyan: 'hover:border-cyan-500/30 hover:shadow-cyan-500/5 transition-all duration-300',
    violet: 'hover:border-violet-500/30 hover:shadow-violet-500/5 transition-all duration-300',
    emerald: 'hover:border-emerald-500/30 hover:shadow-emerald-500/5 transition-all duration-300',
  };

  return (
    <div
      className={`rounded-2xl transition-all duration-200 ${variantStyles[variant]} ${glowStyles[glow]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
