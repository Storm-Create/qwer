/**
 * Business Empire: Ultimate
 * UI System - ProgressBar & Tooltip
 */

import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  sublabel?: string;
  variant?: 'emerald' | 'cyan' | 'violet' | 'amber' | 'rose' | 'gold' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  showPercent?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  sublabel,
  variant = 'emerald',
  size = 'md',
  showPercent = true,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  const variantStyles = {
    emerald: 'from-emerald-500 to-teal-400 shadow-emerald-500/20',
    cyan: 'from-cyan-500 to-blue-400 shadow-cyan-500/20',
    violet: 'from-purple-500 to-violet-400 shadow-purple-500/20',
    amber: 'from-amber-500 to-orange-400 shadow-amber-500/20',
    rose: 'from-rose-500 to-red-400 shadow-rose-500/20',
    gold: 'from-amber-400 via-yellow-300 to-amber-500 shadow-yellow-500/30',
    indigo: 'from-indigo-500 to-blue-500 shadow-indigo-500/20',
  }[variant];

  return (
    <div className="w-full space-y-1.5">
      {(label || sublabel || showPercent) && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            {label && <span className="font-semibold text-slate-300 truncate">{label}</span>}
            {sublabel && <span className="text-[11px] text-slate-500 truncate">{sublabel}</span>}
          </div>
          {showPercent && (
            <span className="font-mono font-bold text-slate-300 ml-2">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}

      <div className={`w-full bg-slate-950/80 rounded-full overflow-hidden border border-slate-800/80 ${sizeStyles}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${variantStyles} transition-all duration-300 shadow-md`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const [visible, setVisible] = React.useState(false);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position];

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={`absolute z-50 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-[11px] font-medium text-slate-100 shadow-2xl backdrop-blur-md whitespace-nowrap pointer-events-none transition-all animate-in fade-in duration-150 ${positionStyles}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
