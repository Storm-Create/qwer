/**
 * Business Empire: Ultimate
 * UI System - StatCard Component
 */

import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number | string;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: 'emerald' | 'cyan' | 'violet' | 'amber' | 'rose' | 'indigo' | 'gold';
  onClick?: () => void;
  badge?: React.ReactNode;
  id?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  trend,
  accentColor = 'emerald',
  onClick,
  badge,
  id,
}) => {
  const accentStyles = {
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
      valueColor: 'text-emerald-400',
      glow: 'from-emerald-500/10 to-transparent',
    },
    cyan: {
      border: 'hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/15 text-cyan-400',
      valueColor: 'text-cyan-300',
      glow: 'from-cyan-500/10 to-transparent',
    },
    violet: {
      border: 'hover:border-violet-500/40',
      iconBg: 'bg-violet-500/15 text-violet-400',
      valueColor: 'text-violet-400',
      glow: 'from-violet-500/10 to-transparent',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/15 text-amber-400',
      valueColor: 'text-amber-400',
      glow: 'from-amber-500/10 to-transparent',
    },
    rose: {
      border: 'hover:border-rose-500/40',
      iconBg: 'bg-rose-500/15 text-rose-400',
      valueColor: 'text-rose-400',
      glow: 'from-rose-500/10 to-transparent',
    },
    indigo: {
      border: 'hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/15 text-indigo-400',
      valueColor: 'text-indigo-400',
      glow: 'from-indigo-500/10 to-transparent',
    },
    gold: {
      border: 'hover:border-yellow-400/40',
      iconBg: 'bg-amber-500/20 text-yellow-300',
      valueColor: 'text-yellow-300',
      glow: 'from-yellow-500/15 to-transparent',
    },
  }[accentColor];

  return (
    <div
      id={id}
      onClick={onClick}
      className={`p-4 sm:p-5 rounded-2xl bg-slate-900/85 border border-slate-800/90 shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between transition-all duration-200 ${
        onClick ? `cursor-pointer active:scale-[0.99] ${accentStyles.border}` : ''
      }`}
    >
      {/* Subtle background glow */}
      <div
        className={`absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br ${accentStyles.glow} rounded-full blur-2xl pointer-events-none opacity-60`}
      />

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate font-sans">
            {title}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {badge}
            {icon && (
              <div className={`p-1.5 sm:p-2 rounded-xl ${accentStyles.iconBg}`}>
                {icon}
              </div>
            )}
          </div>
        </div>

        <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-100 mb-1 truncate">
          {value}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/50 text-[11px] sm:text-xs text-slate-400">
        <span className="truncate">{subtext}</span>
        {trend && (
          <div
            className={`flex items-center gap-1 font-mono font-bold flex-shrink-0 ${
              trend.isPositive !== false ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.isPositive !== false ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
        {onClick && !trend && (
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
        )}
      </div>
    </div>
  );
};
