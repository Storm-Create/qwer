/**
 * Business Empire: Ultimate
 * Modern Collapsible Desktop & Tablet Sidebar
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Globe2,
  TrendingUp,
  Car,
  Store,
  Boxes,
  Factory,
  Building2,
  LineChart,
  Landmark,
  Cpu,
  ShieldCheck,
  ChevronRight,
  Users,
  Trophy,
  Package,
  Gamepad2,
  Zap,
  ChevronLeft,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { NavigationTab, GameState } from '../types/game';
import { Tooltip } from './ui/ProgressBar';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  state: GameState;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItemConfig {
  id: NavigationTab;
  label: string;
  subLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: (state: GameState) => string | number | null;
  badgeVariant?: 'emerald' | 'cyan' | 'violet' | 'amber' | 'rose' | 'indigo' | 'gold';
}

interface NavCategory {
  title: string;
  items: NavItemConfig[];
}

const NAV_CATEGORIES: NavCategory[] = [
  {
    title: 'ОБЗОР & МАКРО',
    items: [
      {
        id: 'dashboard',
        label: 'Главная панель',
        subLabel: 'KPI, сводка и баланс',
        icon: LayoutDashboard,
      },
      {
        id: 'world_economy',
        label: 'Мировая экономика',
        subLabel: 'Индикаторы, ЦБ & события',
        icon: Globe2,
        badge: (s) => {
          const count = s.worldEconomy?.activeEvents?.length || 0;
          return count > 0 ? `${count} соб.` : null;
        },
        badgeVariant: 'indigo',
      },
      {
        id: 'competitors',
        label: 'Forbes & Конкуренты',
        subLabel: '22 AI-корпорации',
        icon: Trophy,
        badge: () => 'Рейтинг',
        badgeVariant: 'gold',
      },
    ],
  },
  {
    title: 'БИЗНЕС & АКТИВЫ',
    items: [
      {
        id: 'businesses',
        label: 'Розничный бизнес',
        subLabel: 'Магазины, бутики, сети',
        icon: Store,
        badge: (s) => {
          const count = (s.retailStores?.length || 0) + (s.businesses?.length || 0);
          return count > 0 ? count : null;
        },
        badgeVariant: 'violet',
      },
      {
        id: 'production',
        label: 'Производство',
        subLabel: 'Заводы и фабрики',
        icon: Factory,
        badge: (s) => {
          const count = (s.industrial?.factories?.length || 0) + s.businesses.filter((b) => b.category === 'factory').length;
          return count > 0 ? count : null;
        },
        badgeVariant: 'amber',
      },
      {
        id: 'warehouses',
        label: 'Склады & логистика',
        subLabel: 'Хранилища и автопарк',
        icon: Boxes,
        badge: (s) => (s.warehouses.length > 0 ? s.warehouses.length : null),
        badgeVariant: 'amber',
      },
      {
        id: 'staff',
        label: 'Персонал & AI',
        subLabel: 'Штат, HR и менеджеры',
        icon: Users,
        badge: (s) => {
          const count = s.staff?.employees?.length || 0;
          return count > 0 ? `${count}` : null;
        },
        badgeVariant: 'violet',
      },
      {
        id: 'real_estate',
        label: 'Недвижимость',
        subLabel: 'Аренда и девелопмент',
        icon: Building2,
        badge: (s) => (s.properties.length > 0 ? s.properties.length : null),
        badgeVariant: 'cyan',
      },
    ],
  },
  {
    title: 'РЫНКИ & ФИНАНСЫ',
    items: [
      {
        id: 'cars',
        label: 'Автоиндустрия & СТО',
        subLabel: 'Перекуп, сервис, заводы',
        icon: Car,
        badge: (s) => {
          const owned = s.automotive?.ownedCars?.length || s.cars?.length || 0;
          return owned > 0 ? owned : null;
        },
        badgeVariant: 'amber',
      },
      {
        id: 'trading',
        label: 'Рынок товаров',
        subLabel: 'Оптовая торговля товарами',
        icon: TrendingUp,
        badge: (s) => (s.inventory.length > 0 ? s.inventory.length : null),
        badgeVariant: 'emerald',
      },
      {
        id: 'stocks',
        label: 'Фондовая биржа',
        subLabel: '3000+ акций & дивиденды',
        icon: LineChart,
        badge: (s) => {
          const exHoldings = (s as any).stockExchange?.holdings;
          if (exHoldings) {
            const count = Object.values(exHoldings).filter((h: any) => h.shares > 0).length;
            return count > 0 ? `${count} поз.` : null;
          }
          return Object.keys(s.stocks?.holdings || {}).length > 0
            ? `${Object.keys(s.stocks.holdings).length} поз.`
            : null;
        },
        badgeVariant: 'cyan',
      },
      {
        id: 'bank',
        label: 'Банк & Кредиты',
        subLabel: 'Вклады, займы и счета',
        icon: Landmark,
        badge: (s) => (s.loans.length > 0 ? `${s.loans.length} долг` : null),
        badgeVariant: 'rose',
      },
    ],
  },
  {
    title: 'РАЗВЛЕЧЕНИЯ & КИБЕР',
    items: [
      {
        id: 'clicker',
        label: 'Тап-Бустинг & Кликер',
        subLabel: 'Ручные сделки & AI-автоботы',
        icon: Zap,
        badge: () => 'ТУРБО',
        badgeVariant: 'gold',
      },
      {
        id: 'casino',
        label: 'Казино-Империя',
        subLabel: '120+ игр, слоты & VIP',
        icon: Trophy,
        badge: (s) => {
          const cc = s.casino?.casinoCoins;
          return cc ? `${cc >= 1000 ? `${Math.floor(cc / 1000)}k` : cc} CC` : 'HOT';
        },
        badgeVariant: 'gold',
      },
      {
        id: 'cases',
        label: 'Кейсы & Скины',
        subLabel: 'Дропы, контракты & маркет',
        icon: Package,
        badge: (s) => {
          const count = s.cases?.inventory?.length;
          return count !== undefined && count > 0 ? `${count}` : 'NEW';
        },
        badgeVariant: 'amber',
      },
      {
        id: 'esports',
        label: 'Киберспорт-Империя',
        subLabel: '27 дисциплин & турниры',
        icon: Gamepad2,
        badge: (s) => {
          const org = s.esports?.organization;
          return org ? `#${org.worldRankOverall}` : 'PRO';
        },
        badgeVariant: 'cyan',
      },
    ],
  },
  {
    title: 'МЕГАКОРПОРАЦИЯ',
    items: [
      {
        id: 'technology',
        label: 'R&D и Технологии',
        subLabel: 'Инновации и патенты',
        icon: Cpu,
        badge: (s) => {
          const activeResearch = s.technologies.filter(
            (t) => !t.researched && t.progressHours > 0
          ).length;
          return activeResearch > 0 ? 'R&D' : null;
        },
        badgeVariant: 'indigo',
      },
      {
        id: 'corporation',
        label: 'Холдинг & Конгломерат',
        subLabel: 'M&A, IPO & Дочерние фирмы',
        icon: ShieldCheck,
        badge: (s) => {
          const h = (s as any).holding;
          if (h?.established) {
            return h.ipo?.isPublic ? `$${h.ipo.ticker}` : `Tier ${h.megacorpTier || 1}`;
          }
          return 'Endgame';
        },
        badgeVariant: 'indigo',
      },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  state,
  collapsed = false,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={`hidden lg:flex flex-col bg-slate-950/90 backdrop-blur-2xl border-r border-slate-800/80 transition-all duration-300 flex-shrink-0 z-20 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Header Controls / Collapse Toggle */}
      <div className="p-3.5 border-b border-slate-800/60 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2 px-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
              НАВИГАЦИЯ ИМПЕРИИ
            </span>
          </div>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 transition-colors mx-auto lg:mx-0"
            aria-label={collapsed ? 'Развернуть' : 'Свернуть'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Links Grouped by Category */}
      <nav className="flex-1 overflow-y-auto p-2.5 space-y-4 max-h-[calc(100vh-140px)]">
        {NAV_CATEGORIES.map((category) => (
          <div key={category.title} className="space-y-1">
            {!collapsed && (
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                {category.title}
              </div>
            )}

            {category.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const badgeVal = item.badge ? item.badge(state) : null;

              if (collapsed) {
                return (
                  <Tooltip key={item.id} content={`${item.label} (${item.subLabel})`} position="right">
                    <button
                      id={`nav-item-${item.id}`}
                      onClick={() => onTabChange(item.id)}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all mx-auto relative group ${
                        isActive
                          ? 'bg-gradient-to-tr from-emerald-500/25 to-teal-500/10 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                      }`}
                    >
                      <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                      {badgeVal !== null && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                      )}
                    </button>
                  </Tooltip>
                );
              }

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-left transition-all group duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-900 text-slate-100 border border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl transition-all ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 shadow-inner'
                          : 'bg-slate-900/80 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-bold truncate ${
                          isActive ? 'text-emerald-300' : 'text-slate-200 group-hover:text-white'
                        }`}
                      >
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-500 group-hover:text-slate-400 truncate">
                        {item.subLabel}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    {badgeVal !== null && (
                      <span
                        className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-lg border ${
                          item.badgeVariant === 'gold'
                            ? 'bg-amber-500/20 text-yellow-300 border-yellow-400/40'
                            : item.badgeVariant === 'indigo'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            : item.badgeVariant === 'rose'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : item.badgeVariant === 'cyan'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : item.badgeVariant === 'violet'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {badgeVal}
                      </span>
                    )}
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isActive
                          ? 'text-emerald-400 translate-x-0.5'
                          : 'text-slate-700 group-hover:text-slate-400'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer System Status */}
      {!collapsed && (
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] text-slate-300 font-bold">Online 24/7</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 font-semibold">TYCOON V2</span>
        </div>
      )}
    </aside>
  );
};
