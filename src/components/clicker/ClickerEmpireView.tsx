/**
 * Business Empire: Ultimate
 * Interactive Tycoon Clicker & Booster Engine View
 */

import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  Flame,
  Bot,
  TrendingUp,
  Award,
  MousePointerClick,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { GameState } from '../../types/game';
import { clickerManager, ClickResult } from '../../game/clicker/clickerManager';
import { Button, Card, Badge, StatCard, ProgressBar } from '../ui';
import { useToast } from '../ui/ToastContext';

interface ClickParticle {
  id: number;
  x: number;
  y: number;
  amount: number;
  isCritical: boolean;
}

export const ClickerEmpireView: React.FC<{ gameState: GameState }> = ({ gameState: state }) => {
  const { showSuccess, showError } = useToast();
  const [particles, setParticles] = useState<ClickParticle[]>([]);
  const [isPressing, setIsPressing] = useState(false);
  const [lastResult, setLastResult] = useState<ClickResult | null>(null);

  const clickerState = clickerManager.getOrCreateState();
  const upgrades = clickerManager.getUpgrades();
  const currency = state.settings.currency || '$';

  const handleBigClick = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    // Determine click position for floating particle
    const rect = e.currentTarget.getBoundingClientRect();
    let clientX = rect.left + rect.width / 2;
    let clientY = rect.top + rect.height / 2;

    if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    const result = clickerManager.executeClick();
    setLastResult(result);

    const newParticle: ClickParticle = {
      id: Date.now() + Math.random(),
      x: relX,
      y: relY,
      amount: result.amount,
      isCritical: result.isCritical,
    };

    setParticles((prev) => [...prev.slice(-15), newParticle]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 1000);
  };

  const handleBuyUpgrade = (id: 'power' | 'crit' | 'auto' | 'synergy') => {
    const res = clickerManager.buyUpgrade(id);
    if (res.success) {
      showSuccess('Апгрейд завершен', res.message);
    } else {
      showError('Ошибка покупки', res.message);
    }
  };

  const baseClickEstimate = Math.round(25 + (clickerState.clickPowerLevel - 1) * 35);
  const autoClickHourly = Math.round(150 * clickerState.autoClickerLevel * (1 + clickerState.synergyLevel * 0.08));

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20 ring-2 ring-yellow-400/40 flex-shrink-0">
            <Zap className="w-8 h-8 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight font-sans">
                ТАП-БУСТИНГ & БИЗНЕС-ДРАЙВ
              </h1>
              <Badge variant="gold" size="sm">
                ТУРБО-РЕЖИМ
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Ускоряйте капитализацию ручными сделками, прокачивайте критические контракты и AI-автоботов
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 self-stretch md:self-auto justify-between md:justify-start">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Всего заработано</div>
            <div className="text-sm sm:text-base font-black font-mono text-emerald-400">
              {currency}{clickerState.totalClickEarnings.toLocaleString()}
            </div>
          </div>
          <div className="h-7 w-px bg-slate-800 mx-2" />
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Кликов</div>
            <div className="text-sm sm:text-base font-black font-mono text-cyan-300">
              {clickerState.totalClicks.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Big Tap Center Area (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden min-h-[420px]">
          {/* Subtle pulsating ambient glow */}
          <div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none animate-pulse" />

          {/* Central Mega Click Button */}
          <div className="relative z-10 flex flex-col items-center">
            <button
              id="btn-mega-clicker"
              onMouseDown={() => setIsPressing(true)}
              onMouseUp={() => setIsPressing(false)}
              onMouseLeave={() => setIsPressing(false)}
              onTouchStart={() => setIsPressing(true)}
              onTouchEnd={() => setIsPressing(false)}
              onClick={handleBigClick}
              className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 p-2 shadow-2xl shadow-amber-500/30 border-4 border-yellow-200/60 transition-transform duration-100 cursor-pointer select-none active:scale-95 group focus:outline-none ${
                isPressing ? 'scale-95' : 'hover:scale-105'
              }`}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/80 flex flex-col items-center justify-center p-4 border border-amber-400/30 group-hover:border-amber-400/70 transition-colors">
                <div className="p-3.5 rounded-full bg-amber-500/20 text-yellow-300 mb-2 group-hover:scale-110 transition-transform">
                  <Zap className="w-10 h-10 sm:w-12 sm:h-12 fill-yellow-400 text-yellow-300 drop-shadow-md" />
                </div>
                <span className="text-base sm:text-lg font-black tracking-wider uppercase text-yellow-300 drop-shadow-sm font-mono">
                  BIG CLICK
                </span>
                <span className="text-xs font-bold text-amber-200/80 font-mono mt-0.5">
                  +{currency}{baseClickEstimate}
                </span>
              </div>

              {/* Floating Numbers Container */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
                {particles.map((p) => (
                  <div
                    key={p.id}
                    className={`absolute font-black font-mono transition-all duration-700 -translate-x-1/2 -translate-y-8 animate-out fade-out zoom-out-50 ${
                      p.isCritical
                        ? 'text-yellow-300 text-lg sm:text-xl drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]'
                        : 'text-emerald-300 text-sm sm:text-base drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                    }`}
                    style={{ left: p.x, top: p.y }}
                  >
                    {p.isCritical ? `⚡ CRIT! +${currency}${p.amount}` : `+${currency}${p.amount}`}
                  </div>
                ))}
              </div>
            </button>

            {/* Click Feedback Message */}
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {lastResult ? (
                <span>
                  Последний тап: <strong className="text-emerald-400 font-mono">+{currency}{lastResult.amount}</strong>
                  {lastResult.isCritical && (
                    <span className="ml-1.5 text-yellow-400 font-bold">(Крит x{lastResult.multiplier}!)</span>
                  )}
                </span>
              ) : (
                <span>Нажимайте кнопку для мгновенного заработка</span>
              )}
            </div>

            {/* Power Rating Stars */}
            <div className="flex items-center gap-1 mt-3">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = clickerState.clickPowerLevel >= star * 3;
                return (
                  <span
                    key={star}
                    className={`text-sm ${isFilled ? 'text-yellow-400 drop-shadow' : 'text-slate-700'}`}
                  >
                    ★
                  </span>
                );
              })}
              <span className="text-[11px] font-mono text-slate-400 ml-2">
                Ур. Мощности {clickerState.clickPowerLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Stats & Quick KPI Cards (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <StatCard
            title="Базовая сила касания"
            value={`${currency}${baseClickEstimate}`}
            subtext={`Уровень прокачки: ${clickerState.clickPowerLevel}`}
            icon={<Zap className="w-4 h-4" />}
            accentColor="amber"
          />

          <StatCard
            title="Критический шанс"
            value={`${Math.min(60, 5 + clickerState.criticalChanceLevel * 4)}%`}
            subtext={`Множитель: ${(2.5 + clickerState.criticalChanceLevel * 0.3).toFixed(1)}x`}
            icon={<Flame className="w-4 h-4" />}
            accentColor="rose"
          />

          <StatCard
            title="AI-Автокликер"
            value={`+${currency}${autoClickHourly}/час`}
            subtext={clickerState.autoClickerLevel > 0 ? `Активен (Ур. ${clickerState.autoClickerLevel})` : 'Не активирован'}
            icon={<Bot className="w-4 h-4" />}
            accentColor="cyan"
          />

          <StatCard
            title="Корпоративная синергия"
            value={`+${clickerState.synergyLevel * 8}%`}
            subtext="Умножает профит со всех сделок"
            icon={<TrendingUp className="w-4 h-4" />}
            accentColor="violet"
          />
        </div>
      </div>

      {/* Upgrades Shop Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 font-sans">
              ДРЕВО АПГРЕЙДОВ & ТУРБО-ТЕХНОЛОГИЙ
            </h2>
            <p className="text-xs text-slate-400">
              Инвестируйте в увеличение ручного дохода и полную автоматизацию кликера
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {upgrades.map((upg) => {
            const canAfford = state.cash >= upg.cost;
            return (
              <Card
                key={upg.id}
                title={upg.name}
                badge={
                  <Badge variant={canAfford ? 'amber' : 'slate'} size="sm">
                    Ур. {upg.level}
                  </Badge>
                }
                icon={
                  upg.id === 'power' ? (
                    <Zap className="w-4 h-4 text-amber-400" />
                  ) : upg.id === 'crit' ? (
                    <Flame className="w-4 h-4 text-rose-400" />
                  ) : upg.id === 'auto' ? (
                    <Bot className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  )
                }
                className="flex flex-col justify-between"
              >
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-slate-400 min-h-[32px]">{upg.description}</p>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono font-bold text-emerald-400">
                    {upg.bonusText}
                  </div>
                </div>

                <Button
                  id={`btn-upgrade-${upg.id}`}
                  variant={canAfford ? 'gold' : 'secondary'}
                  size="md"
                  disabled={!canAfford}
                  onClick={() => handleBuyUpgrade(upg.id)}
                  className="w-full"
                >
                  <span>Купить за {currency}{upg.cost.toLocaleString()}</span>
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
