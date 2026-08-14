/**
 * Business Empire: Ultimate
 * UI System - Universal Button Component
 */

import React from 'react';

export type ButtonVariant = 
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'gold'
  | 'purple'
  | 'outline'
  | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold font-sans transition-all duration-150 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] rounded-xl gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2.5 min-h-[44px] rounded-xl gap-2',
    lg: 'text-sm sm:text-base px-6 py-3 min-h-[50px] rounded-2xl gap-2.5',
    icon: 'p-2.5 min-w-[44px] min-h-[44px] rounded-xl justify-center',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20 focus:ring-emerald-500 border border-emerald-400/40',
    secondary:
      'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 focus:ring-slate-500 shadow-md',
    success:
      'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-500/60 focus:ring-emerald-500',
    danger:
      'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 hover:border-rose-500/60 focus:ring-rose-500',
    warning:
      'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 hover:border-amber-500/60 focus:ring-amber-500',
    gold:
      'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:via-yellow-300 hover:to-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 focus:ring-amber-500 border border-yellow-300/60',
    purple:
      'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold shadow-lg shadow-purple-500/20 focus:ring-purple-500 border border-purple-400/30',
    outline:
      'bg-transparent hover:bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500 focus:ring-slate-400',
    ghost:
      'bg-transparent hover:bg-slate-900/80 text-slate-400 hover:text-slate-200 focus:ring-slate-500 border border-transparent',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
