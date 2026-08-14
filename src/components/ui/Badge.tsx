/**
 * Business Empire: Ultimate
 * UI System - Reusable Badge Component
 */

import React from 'react';

export type BadgeVariant =
  | 'emerald'
  | 'cyan'
  | 'violet'
  | 'amber'
  | 'rose'
  | 'indigo'
  | 'slate'
  | 'gold';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  dot = false,
  pulse = false,
  className = '',
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dotColor: string }> = {
    emerald: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-300',
      border: 'border-emerald-500/30',
      dotColor: 'bg-emerald-400',
    },
    cyan: {
      bg: 'bg-cyan-500/15',
      text: 'text-cyan-300',
      border: 'border-cyan-500/30',
      dotColor: 'bg-cyan-400',
    },
    violet: {
      bg: 'bg-violet-500/15',
      text: 'text-violet-300',
      border: 'border-violet-500/30',
      dotColor: 'bg-violet-400',
    },
    amber: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-300',
      border: 'border-amber-500/30',
      dotColor: 'bg-amber-400',
    },
    rose: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-300',
      border: 'border-rose-500/30',
      dotColor: 'bg-rose-400',
    },
    indigo: {
      bg: 'bg-indigo-500/15',
      text: 'text-indigo-300',
      border: 'border-indigo-500/30',
      dotColor: 'bg-indigo-400',
    },
    slate: {
      bg: 'bg-slate-800/80',
      text: 'text-slate-300',
      border: 'border-slate-700/60',
      dotColor: 'bg-slate-400',
    },
    gold: {
      bg: 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20',
      text: 'text-amber-200',
      border: 'border-yellow-400/40 font-black',
      dotColor: 'bg-yellow-400',
    },
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-[10px] px-2 py-0.5 rounded-md font-mono',
    md: 'text-xs px-2.5 py-1 rounded-lg font-semibold',
    lg: 'text-xs sm:text-sm px-3.5 py-1.5 rounded-xl font-bold',
  };

  const current = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 border leading-none select-none ${current.bg} ${current.text} ${current.border} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${current.dotColor} ${pulse ? 'animate-pulse' : ''}`}
        />
      )}
      {children}
    </span>
  );
};
