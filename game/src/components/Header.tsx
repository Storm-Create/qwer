/**
 * Business Empire: Ultimate
 * Modern Tycoon Header & KPI Center
 */

import React, { useState } from 'react';
import {
  Play,
  Pause,
  FastForward,
  Zap,
  Save,
  Settings as SettingsIcon,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  Layers,
  Bell,
  CheckCircle2,
  AlertCircle,
  Menu,
  ShieldAlert,
  ChevronDown,
  X,
} from 'lucide-react';
import { GameState, TimeSpeed } from '../types/game';
import { gameLoop } from '../game/gameLoop';
import { saveSystem } from '../game/saveSystem';
import { economy } from '../game/economy';
import { useToast } from './ui/ToastContext';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface HeaderProps {
  state: GameState;
  onOpenSettings: () => void;
  onOpenMobileMenu?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onOpenSettings,
  onOpenMobileMenu,
  onNavigateTab,
}) => {
  const { showSuccess, showError, history } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);

  const { gameTime, timeSpeed, cash, netWorth, settings } = state;
  const currency = settings.currency || '$';

  const breakdown = economy.getFinancialBreakdown();

  const handleSpeedChange = (speed: TimeSpeed) => {
    gameLoop.setSpeed(speed);
  };

  const handleManualSave = () => {
    const res = saveSystem.saveGame();
    if (res.success) {
      showSuccess('Игра сохранена', 'Все данные надежно сохранены в локальное хранилище');
    } else {
      showError('Ошибка сохранения', 'Не удалось записать данные');
    }
  };

  const formatMoney = (val: number) => {
    if (settings.compactNumbers) {
      if (Math.abs(val) >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(2)}B`;
      if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
      if (Math.abs(val) >= 10_000) return `${(val / 1_000).toFixed(1)}k`;
    }
    return Math.round(val).toLocaleString();
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800/90 shadow-2xl px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Side: Brand Logo & Company Title */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          {/* Mobile Menu Trigger */}
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
              aria-label="Меню"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <div
            onClick={() => onNavigateTab && onNavigateTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none min-w-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/50 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5 text-slate-950 font-black" />
            </div>
            <div className="min-w-0 hidden xs:block">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xs sm:text-sm font-black tracking-wider uppercase text-slate-100 font-mono truncate">
                  BUSINESS EMPIRE
                </span>
                <span className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate mt-0.5">
                {state.corporation.name}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Financial KPI Pills */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {/* Cash Balance */}
          <div
            id="kpi-header-cash"
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-inner min-w-0"
            title="Ликвидные денежные средства"
          >
            <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400 flex-shrink-0">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider hidden sm:block">
                Баланс
              </div>
              <div className="text-xs sm:text-sm font-black font-mono text-emerald-400 truncate">
                {currency}{formatMoney(cash)}
              </div>
            </div>
          </div>

          {/* Net Worth (Cap) */}
          <div
            id="kpi-header-networth"
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-inner min-w-0"
            title="Общий чистый капитал"
          >
            <div className="p-1 rounded-lg bg-cyan-500/15 text-cyan-400 flex-shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 tracking-wider hidden sm:block">
                Капитал
              </div>
              <div className="text-xs sm:text-sm font-black font-mono text-cyan-300 truncate">
                {currency}{formatMoney(netWorth)}
              </div>
            </div>
          </div>

          {/* Daily Profit (Hidden on small mobile) */}
          <div
            id="kpi-header-profit"
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-inner"
            title="Дневная чистая прибыль"
          >
            <div
              className={`p-1 rounded-lg flex-shrink-0 ${
                breakdown.dailyProfit >= 0
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-rose-500/15 text-rose-400'
              }`}
            >
              {breakdown.dailyProfit >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Профит/день
              </div>
              <div
                className={`text-xs font-bold font-mono ${
                  breakdown.dailyProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {breakdown.dailyProfit >= 0 ? '+' : ''}
                {currency}{formatMoney(breakdown.dailyProfit)}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Time Engine, Notifications, Save, Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Calendar & Time Display */}
          <div
            id="header-calendar-chip"
            className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Г.{gameTime.year} М.{gameTime.month} Д.{gameTime.day}
            </span>
            <div className="w-px h-3 bg-slate-800" />
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{String(gameTime.hour).padStart(2, '0')}:00</span>
          </div>

          {/* Speed Engine Buttons */}
          <div className="flex items-center rounded-2xl bg-slate-900 border border-slate-800 p-0.5">
            <button
              onClick={() => handleSpeedChange(0)}
              title="Пауза"
              className={`p-1.5 rounded-xl transition-all ${
                timeSpeed === 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleSpeedChange(1)}
              title="1x скорость"
              className={`px-2 py-1 text-xs font-mono font-bold rounded-xl transition-all ${
                timeSpeed === 1
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => handleSpeedChange(2)}
              title="2x скорость"
              className={`hidden xs:inline px-2 py-1 text-xs font-mono font-bold rounded-xl transition-all ${
                timeSpeed === 2
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2x
            </button>
            <button
              onClick={() => handleSpeedChange(4)}
              title="4x скорость"
              className={`px-2 py-1 text-xs font-mono font-bold rounded-xl transition-all ${
                timeSpeed === 4
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              4x
            </button>
          </div>

          {/* Tap-Boost Shortcut Button */}
          <button
            onClick={() => onNavigateTab && onNavigateTab('clicker')}
            title="Запустить Бустер & Кликер"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden md:inline">Буст</span>
          </button>

          {/* Notifications Log Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              title="Центр уведомлений"
              className="p-2 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all relative"
            >
              <Bell className="w-4 h-4" />
              {history.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl z-50 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Bell className="w-3.5 h-3.5 text-emerald-400" />
                    <span>История уведомлений</span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-500 hover:text-slate-300 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {history.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      Новых уведомлений пока нет
                    </div>
                  ) : (
                    history.slice(0, 10).map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                      >
                        <div className="font-bold text-slate-200">{item.title}</div>
                        {item.description && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {item.description}
                          </div>
                        )}
                        <div className="text-[9px] text-slate-500 font-mono mt-1 text-right">
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Save */}
          <button
            id="btn-manual-save"
            onClick={handleManualSave}
            title="Быстрое сохранение игры"
            className="p-2 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Сохранить</span>
          </button>

          {/* Settings Trigger */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            title="Настройки игры & Сохранения"
            className="p-2 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
