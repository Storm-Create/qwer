/**
 * Business Empire: Ultimate
 * UI System - Reusable Card Container
 */

import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'glass' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'interactive';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  header,
  footer,
  badge,
  icon,
  title,
  subtitle,
  action,
  noPadding = false,
  className = '',
  ...props
}) => {
  const variantStyles: Record<CardVariant, string> = {
    default:
      'bg-slate-900/80 border-slate-800/80 text-slate-100 shadow-xl backdrop-blur-md',
    elevated:
      'bg-slate-900 border-slate-700/80 text-slate-100 shadow-2xl',
    glass:
      'bg-slate-950/70 border-slate-800/80 text-slate-100 backdrop-blur-xl shadow-xl',
    emerald:
      'bg-gradient-to-br from-emerald-950/30 via-slate-900/90 to-slate-900 border-emerald-500/30 text-slate-100 shadow-xl shadow-emerald-950/20',
    amber:
      'bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-slate-900 border-amber-500/30 text-slate-100 shadow-xl shadow-amber-950/20',
    indigo:
      'bg-gradient-to-br from-indigo-950/30 via-slate-900/90 to-slate-900 border-indigo-500/30 text-slate-100 shadow-xl shadow-indigo-950/20',
    rose:
      'bg-gradient-to-br from-rose-950/30 via-slate-900/90 to-slate-900 border-rose-500/30 text-slate-100 shadow-xl shadow-rose-950/20',
    interactive:
      'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 text-slate-100 shadow-xl transition-all cursor-pointer hover:shadow-2xl active:scale-[0.995]',
  };

  const hasHeader = Boolean(header || title || subtitle || icon || badge || action);

  return (
    <div
      className={`rounded-2xl border flex flex-col transition-all duration-200 overflow-hidden ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {hasHeader && (
        <div className="p-4 sm:p-5 border-b border-slate-800/60 flex items-center justify-between gap-3">
          {header ? (
            header
          ) : (
            <>
              <div className="flex items-center gap-3 min-w-0">
                {icon && (
                  <div className="p-2 rounded-xl bg-slate-800/80 text-slate-300 flex-shrink-0">
                    {icon}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {typeof title === 'string' ? (
                      <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate font-sans">
                        {title}
                      </h3>
                    ) : (
                      title
                    )}
                    {badge}
                  </div>
                  {subtitle && (
                    <div className="text-xs text-slate-400 truncate mt-0.5">
                      {subtitle}
                    </div>
                  )}
                </div>
              </div>
              {action && <div className="flex-shrink-0">{action}</div>}
            </>
          )}
        </div>
      )}

      <div className={`flex-1 ${noPadding ? '' : 'p-4 sm:p-5'}`}>{children}</div>

      {footer && (
        <div className="p-4 sm:p-5 border-t border-slate-800/60 bg-slate-950/40 mt-auto">
          {footer}
        </div>
      )}
    </div>
  );
};
