/**
 * Business Empire: Ultimate
 * UI System - Tabs & Pill Navigation
 */

import React from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number | null;
  badgeColor?: string;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  variant?: 'pills' | 'underline' | 'segmented';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  size = 'md',
  fullWidth = false,
}: TabsProps<T>) {
  const sizeStyles = {
    sm: 'text-xs py-1.5 px-3 rounded-xl gap-1.5 min-h-[36px]',
    md: 'text-xs sm:text-sm py-2 px-3.5 sm:px-4 rounded-xl gap-2 min-h-[42px]',
    lg: 'text-sm sm:text-base py-2.5 px-5 rounded-2xl gap-2.5 min-h-[48px]',
  }[size];

  if (variant === 'segmented') {
    return (
      <div className={`p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex items-center gap-1 overflow-x-auto ${fullWidth ? 'w-full' : 'inline-flex'}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center justify-center font-bold whitespace-nowrap transition-all duration-150 select-none cursor-pointer ${
                fullWidth ? 'flex-1' : ''
              } ${sizeStyles} ${
                isActive
                  ? 'bg-slate-800 text-slate-100 shadow-md border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge !== null && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                    tab.badgeColor || (isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400')
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-1 max-w-full ${fullWidth ? 'w-full' : ''}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center justify-center font-bold whitespace-nowrap transition-all duration-150 select-none cursor-pointer ${
              fullWidth ? 'flex-1' : ''
            } ${sizeStyles} ${
              isActive
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/5 font-extrabold'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80'
            }`}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                  tab.badgeColor || (isActive ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-800 text-slate-400')
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
