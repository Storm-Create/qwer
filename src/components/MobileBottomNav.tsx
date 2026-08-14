/**
 * Business Empire: Ultimate
 * Mobile Bottom Navigation Bar
 */

import React from 'react';
import {
  LayoutDashboard,
  Store,
  LineChart,
  Trophy,
  MoreHorizontal,
  Zap,
} from 'lucide-react';
import { NavigationTab, GameState } from '../types/game';

interface MobileBottomNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onOpenMore: () => void;
  state: GameState;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenMore,
  state,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Главная',
      icon: LayoutDashboard,
    },
    {
      id: 'businesses' as NavigationTab,
      label: 'Бизнес',
      icon: Store,
      badge: (state.retailStores?.length || 0) + (state.businesses?.length || 0) || null,
    },
    {
      id: 'clicker' as NavigationTab,
      label: 'Буст',
      icon: Zap,
      isSpecial: true,
    },
    {
      id: 'stocks' as NavigationTab,
      label: 'Рынки',
      icon: LineChart,
    },
    {
      id: 'casino' as NavigationTab,
      label: 'Казино',
      icon: Trophy,
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation-bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/90 px-2 py-1.5 shadow-2xl flex items-center justify-around"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0.5rem), 0.5rem)' }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        if (item.isSpecial) {
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center justify-center min-w-[56px] -mt-5 group"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 ring-4 ring-slate-950 shadow-amber-500/30'
                    : 'bg-gradient-to-tr from-amber-600 to-yellow-500 text-slate-950 ring-4 ring-slate-950 shadow-amber-500/20 group-hover:scale-105'
                }`}
              >
                <Icon className="w-6 h-6 fill-current" />
              </div>
              <span
                className={`text-[10px] font-black uppercase mt-1 font-mono ${
                  isActive ? 'text-yellow-300' : 'text-amber-400/80'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl min-w-[52px] min-h-[48px] transition-all relative ${
              isActive
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                isActive ? 'bg-emerald-500/20 text-emerald-300 scale-110' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5 tracking-tight">
              {item.label}
            </span>
            {item.badge !== undefined && item.badge !== null && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
            )}
          </button>
        );
      })}

      {/* "More" Trigger Button */}
      <button
        onClick={onOpenMore}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl min-w-[52px] min-h-[48px] text-slate-400 hover:text-slate-200 transition-all"
        aria-label="Все разделы"
      >
        <div className="p-1 rounded-xl">
          <MoreHorizontal className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Еще</span>
      </button>
    </nav>
  );
};
