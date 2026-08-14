/**
 * Business Empire: Ultimate
 * Mobile "More" Full-Featured Navigation Drawer & Hub
 */

import React, { useState } from 'react';
import {
  X,
  Search,
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
  Users,
  Trophy,
  Package,
  Gamepad2,
  Zap,
  Settings,
  Save,
  ChevronRight,
} from 'lucide-react';
import { NavigationTab, GameState } from '../types/game';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface MobileMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  state: GameState;
  onOpenSettings: () => void;
  onSaveGame: () => void;
}

interface DrawerCategory {
  title: string;
  items: {
    id: NavigationTab;
    label: string;
    subLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number | null;
    badgeVariant?: 'emerald' | 'cyan' | 'violet' | 'amber' | 'rose' | 'indigo' | 'gold';
  }[];
}

export const MobileMoreDrawer: React.FC<MobileMoreDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  state,
  onOpenSettings,
  onSaveGame,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const categories: DrawerCategory[] = [
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
          badge: state.worldEconomy?.activeEvents?.length
            ? `${state.worldEconomy.activeEvents.length} соб.`
            : null,
          badgeVariant: 'indigo',
        },
        {
          id: 'competitors',
          label: 'Forbes & Рейтинг',
          subLabel: '22 AI-корпорации',
          icon: Trophy,
          badge: 'Рейтинг',
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
          badge:
            (state.retailStores?.length || 0) + (state.businesses?.length || 0) || null,
          badgeVariant: 'violet',
        },
        {
          id: 'production',
          label: 'Производство',
          subLabel: 'Заводы и фабрики',
          icon: Factory,
          badge: state.industrial?.factories?.length || null,
          badgeVariant: 'amber',
        },
        {
          id: 'warehouses',
          label: 'Склады & логистика',
          subLabel: 'Хранилища и автопарк',
          icon: Boxes,
          badge: state.warehouses?.length || null,
          badgeVariant: 'amber',
        },
        {
          id: 'staff',
          label: 'Персонал & AI',
          subLabel: 'Штат, HR и менеджеры',
          icon: Users,
          badge: state.staff?.employees?.length || null,
          badgeVariant: 'violet',
        },
        {
          id: 'real_estate',
          label: 'Недвижимость',
          subLabel: 'Аренда и девелопмент',
          icon: Building2,
          badge: state.properties?.length || null,
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
          badge: state.automotive?.ownedCars?.length || state.cars?.length || null,
          badgeVariant: 'amber',
        },
        {
          id: 'trading',
          label: 'Рынок товаров',
          subLabel: 'Оптовая торговля товарами',
          icon: TrendingUp,
          badge: state.inventory?.length || null,
          badgeVariant: 'emerald',
        },
        {
          id: 'stocks',
          label: 'Фондовая биржа',
          subLabel: '3000+ акций & дивиденды',
          icon: LineChart,
          badge: '3000+',
          badgeVariant: 'cyan',
        },
        {
          id: 'bank',
          label: 'Банк & Кредиты',
          subLabel: 'Вклады, займы и счета',
          icon: Landmark,
          badge: state.loans?.length ? `${state.loans.length} долг` : null,
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
          badge: 'ТУРБО',
          badgeVariant: 'gold',
        },
        {
          id: 'casino',
          label: 'Казино-Империя',
          subLabel: '120+ игр, слоты & VIP',
          icon: Trophy,
          badge: 'HOT',
          badgeVariant: 'gold',
        },
        {
          id: 'cases',
          label: 'Кейсы & Скины',
          subLabel: 'Дропы, контракты & маркет',
          icon: Package,
          badge: 'NEW',
          badgeVariant: 'amber',
        },
        {
          id: 'esports',
          label: 'Киберспорт-Империя',
          subLabel: '27 дисциплин & турниры',
          icon: Gamepad2,
          badge: 'PRO',
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
          badge: 'R&D',
          badgeVariant: 'indigo',
        },
        {
          id: 'corporation',
          label: 'Холдинг & Конгломерат',
          subLabel: 'M&A, IPO & Дочерние фирмы',
          icon: ShieldCheck,
          badge: 'Endgame',
          badgeVariant: 'indigo',
        },
      ],
    },
  ];

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (i) =>
          i.label.toLowerCase().includes(search.toLowerCase()) ||
          i.subLabel.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative z-10 w-full max-h-[85vh] bg-slate-900 border-t border-slate-700/80 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250">
        {/* Handle Bar & Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col gap-3">
          <div className="w-12 h-1.5 rounded-full bg-slate-700 mx-auto" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-base font-extrabold text-slate-100 font-sans">
                ВСЕ РАЗДЕЛЫ ИМПЕРИИ
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 bg-slate-800/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск раздела (биржа, авто, заводы, кейсы...)"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Scrollable Navigation Grid */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {filteredCategories.map((cat) => (
            <div key={cat.title} className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono px-2">
                {cat.title}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all min-h-[52px] ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                          : 'bg-slate-950/50 hover:bg-slate-800/60 text-slate-300 border border-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-xl ${
                            isActive
                              ? 'bg-emerald-500/30 text-emerald-300'
                              : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate text-slate-100">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {item.subLabel}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {item.badge && (
                          <Badge variant={item.badgeVariant || 'slate'} size="sm">
                            {item.badge}
                          </Badge>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Save className="w-4 h-4 text-emerald-400" />}
            onClick={() => {
              onSaveGame();
              onClose();
            }}
            className="flex-1"
          >
            Сохранить
          </Button>

          <Button
            variant="outline"
            size="md"
            leftIcon={<Settings className="w-4 h-4 text-slate-300" />}
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="flex-1"
          >
            Настройки
          </Button>
        </div>
      </div>
    </div>
  );
};
