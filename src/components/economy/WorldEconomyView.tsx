/**
 * Business Empire: Ultimate
 * World Economy Main View Component
 * Displays 7 real-time macro indicators, Central Bank monetary policy,
 * active multi-day global events, interactive historical charts, consequential news feed,
 * and live multiplier breakdown on the player's empire.
 */

import React, { useState } from 'react';
import {
  Globe2,
  TrendingUp,
  TrendingDown,
  Percent,
  Landmark,
  Smile,
  Users,
  Activity,
  Fuel,
  Truck,
  Flame,
  AlertTriangle,
  Clock,
  Newspaper,
  ShieldAlert,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  Store,
  Factory,
  Car,
  Building2,
  CreditCard,
  LineChart as LineChartIcon,
  Filter,
  Info,
} from 'lucide-react';
import { GameState } from '../../types/game';
import {
  ActiveEconomicEvent,
  MacroIndicators,
  MacroNewsItem,
  CentralBankState,
  MacroHistoryPoint,
} from '../../types/worldEconomy';
import { worldEconomyEngine } from '../../game/economy/worldEconomyEngine';

interface WorldEconomyViewProps {
  state: GameState;
  showNotification?: (msg: string) => void;
}

export const WorldEconomyView: React.FC<WorldEconomyViewProps> = ({ state, showNotification }) => {
  const [selectedChartTab, setSelectedChartTab] = useState<'growth_inflation' | 'rates_oil' | 'confidence_jobs' | 'logistics'>('growth_inflation');
  const [selectedNewsCategory, setSelectedNewsCategory] = useState<string>('all');
  const [selectedEventModal, setSelectedEventModal] = useState<ActiveEconomicEvent | null>(null);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  const economyState = state.worldEconomy || worldEconomyEngine.getIndicators();
  const indicators: MacroIndicators = state.worldEconomy?.indicators || worldEconomyEngine.getIndicators();
  const activeEvents: ActiveEconomicEvent[] = state.worldEconomy?.activeEvents || [];
  const newsFeed: MacroNewsItem[] = state.worldEconomy?.newsFeed || [];
  const centralBank: CentralBankState = state.worldEconomy?.centralBank || worldEconomyEngine.getCentralBank();
  const history: MacroHistoryPoint[] = state.worldEconomy?.history || [];
  const cyclePhase = state.worldEconomy?.economicCyclePhase || 'expansion';

  // Live Multipliers for Player's Empire
  const retailMult = worldEconomyEngine.getRetailSalesMultiplier();
  const prodCostMult = worldEconomyEngine.getProductionCostMultiplier();
  const transportMult = worldEconomyEngine.getTransportCostMultiplier();
  const carSalesMult = worldEconomyEngine.getCarSalesMultiplier();
  const realEstateMult = worldEconomyEngine.getRealEstateDemandMultiplier();
  const loanRateMod = worldEconomyEngine.getBankLoanRateModifier();
  const stockSentiment = worldEconomyEngine.getStockMarketSentiment();

  const filteredNews = selectedNewsCategory === 'all'
    ? newsFeed
    : newsFeed.filter((item) => item.category === selectedNewsCategory);

  const cycleBadgeColors: Record<string, { bg: string; text: string; label: string; desc: string }> = {
    expansion: {
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      text: 'text-emerald-400',
      label: 'Экономический подъем (Экспансия)',
      desc: 'Высокие темпы роста ВВП, растущий потребительский спрос и инвестиционная активность бизнеса.',
    },
    peak: {
      bg: 'bg-amber-500/10 border-amber-500/30',
      text: 'text-amber-400',
      label: 'Пик цикла (Замедление)',
      desc: 'Максимальная загрузка мощностей, ужесточение ДКП Центробанком для сдерживания перегрева.',
    },
    recession: {
      bg: 'bg-rose-500/10 border-rose-500/30',
      text: 'text-rose-400',
      label: 'Рецессия & Спад спроса',
      desc: 'Снижение объемов производства, падение потребительского оптимизма и охлаждение кредитования.',
    },
    recovery: {
      bg: 'bg-cyan-500/10 border-cyan-500/30',
      text: 'text-cyan-400',
      label: 'Восстановление & Оживление',
      desc: 'Постепенная нормализация цепочек поставок, снижение процентных ставок и оживление заказов.',
    },
  };

  const currentCycle = cycleBadgeColors[cyclePhase] || cycleBadgeColors.expansion;

  return (
    <div id="world-economy-viewport" className="space-y-6 pb-12">
      {/* 1. Header Banner & Economic Cycle Phase */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 p-5 lg:p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center justify-center p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Globe2 className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Глобальная макроэкономика & Рынки
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Мировая экономика
              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${currentCycle.bg} ${currentCycle.text}`}>
                {currentCycle.label}
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              {currentCycle.desc} Все индикаторы в реальном времени влияют на выручку магазинов, стоимость логистики, кредитные ставки и спрос на ваши активы.
            </p>
          </div>

          {/* Central Bank Quick Status */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1.5 min-w-[260px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Landmark className="w-4 h-4 text-amber-400" />
                Центральный банк
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                centralBank.sentiment === 'hawkish'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : centralBank.sentiment === 'dovish'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {centralBank.sentiment === 'hawkish' ? 'Ястребиный курс' : centralBank.sentiment === 'dovish' ? 'Мягкий курс' : 'Нейтральный курс'}
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1 border-t border-slate-800/80">
              <span className="text-xs text-slate-400">Ключевая ставка:</span>
              <span className="text-base font-bold text-white font-mono">{indicators.interestRate.toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Заседание через:</span>
              <span className="font-semibold text-amber-400">{centralBank.nextMeetingDays} дн.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 7 Key Macro Indicators Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            7 Ключевых макроэкономических индикаторов
          </h2>
          <span className="text-xs text-slate-500">Обновляются ежедневно игровым циклом</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {/* 1. Inflation */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Инфляция</span>
              <Percent className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-xl font-extrabold text-white font-mono">{indicators.inflation.toFixed(1)}%</span>
              <span className="text-[10px] text-slate-400">год.</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 border-t border-slate-800/60 pt-1.5 mt-1">
              <span className={indicators.inflation > 6.0 ? 'text-rose-400' : 'text-emerald-400'}>
                {indicators.inflation > 6.0 ? 'Высокая' : 'Умеренная'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 truncate">Расходы +{((indicators.inflation / 100) * 50).toFixed(1)}%</span>
            </div>
          </div>

          {/* 2. Interest Rate */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Ключевая ставка</span>
              <Landmark className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-xl font-extrabold text-white font-mono">{indicators.interestRate.toFixed(2)}%</span>
              <span className="text-[10px] text-slate-400">ЦБ</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 border-t border-slate-800/60 pt-1.5 mt-1">
              <span className="text-amber-400">Кредиты</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 truncate">Ставка {indicators.interestRate > 8 ? 'высокая' : 'доступная'}</span>
            </div>
          </div>

          {/* 3. Consumer Confidence */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Доверие потребителей</span>
              <Smile className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-xl font-extrabold text-white font-mono">{indicators.consumerConfidence}</span>
              <span className="text-[10px] text-slate-400">п. (база 100)</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 border-t border-slate-800/60 pt-1.5 mt-1">
              <span className={indicators.consumerConfidence >= 100 ? 'text-emerald-400' : 'text-rose-400'}>
                {indicators.consumerConfidence >= 100 ? 'Оптимизм' : 'Пессимизм'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 truncate">Ритейл {retailMult.toFixed(2)}x</span>
            </div>
          </div>

          {/* 4. Unemployment */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Безработица</span>
              <Users className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-xl font-extrabold text-white font-mono">{indicators.unemployment.toFixed(1)}%</span>
              <span className="text-[10px] text-slate-400">рынок</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 border-t border-slate-800/60 pt-1.5 mt-1">
              <span className={indicators.unemployment < 5.0 ? 'text-emerald-400' : 'text-amber-400'}>
                {indicators.unemployment < 5.0 ? 'Полная занятость' : 'Резерв кадров'}
              </span>
            </div>
          </div>

          {/* 5. Economic Growth */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Рост ВВП</span>
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className={`text-xl font-extrabold font-mono ${indicators.economicGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {indicators.economicGrowth >= 0 ? '+' : ''}{indicators.economicGrowth.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400">год.</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 border-t border-slate-800/60 pt-1.5 mt-1">
              <span className={indicators.economicGrowth >= 2.0 ? 'text-emerald-400' : indicators.economicGrowth >= 0 ? 'text-amber-400' : 'text-rose-400'}>
                {indicators.economicGrowth >= 2.0 ? 'Экспансия' : indicators.economicGrowth >= 0 ? 'Стагнация' : 'Спад'}
              </span>
            </div>
          </div>

          {/* 6. Oil Price */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Нефть Brent</span>
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-xl font-extrabold text-white font-mono">${indicators.oilPrice.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400">/барр</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 border-t border-slate-800/60 pt-1.5 mt-1">
              <span className={indicators.oilPrice > 90 ? 'text-rose-400' : indicators.oilPrice < 65 ? 'text-emerald-400' : 'text-slate-300'}>
                {indicators.oilPrice > 90 ? 'Дорогая' : indicators.oilPrice < 65 ? 'Дешевая' : 'Нейтральная'}
              </span>
            </div>
          </div>

          {/* 7. Transport Cost Multiplier */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-lg">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Логистика & Фрахт</span>
              <Truck className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-xl font-extrabold text-white font-mono">{indicators.transportCost.toFixed(2)}x</span>
              <span className="text-[10px] text-slate-400">индекс</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 border-t border-slate-800/60 pt-1.5 mt-1">
              <span className={indicators.transportCost > 1.1 ? 'text-rose-400' : indicators.transportCost < 0.9 ? 'text-emerald-400' : 'text-slate-300'}>
                {indicators.transportCost > 1.1 ? 'Удорожание' : indicators.transportCost < 0.9 ? 'Скидки' : 'Базовый'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Empire Impact Matrix (Live Multipliers on Player's Operations) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 border border-indigo-500/20 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Zap className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Влияние макроэкономики на вашу бизнес-империю</h3>
              <p className="text-xs text-slate-400">Реальные мультипликаторы спроса, себестоимости и ставок, действующие на ваши активы прямо сейчас</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Retail */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Store className="w-3.5 h-3.5 text-violet-400" />
              Розничные продажи
            </div>
            <div className="text-lg font-bold text-white font-mono flex items-baseline gap-1">
              {retailMult.toFixed(2)}x
              <span className={`text-xs ${retailMult >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({retailMult >= 1.0 ? '+' : ''}{Math.round((retailMult - 1.0) * 100)}%)
              </span>
            </div>
            <div className="text-[10px] text-slate-500">Выручка в магазинах</div>
          </div>

          {/* Production */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Factory className="w-3.5 h-3.5 text-orange-400" />
              Себестоимость заводов
            </div>
            <div className="text-lg font-bold text-white font-mono flex items-baseline gap-1">
              {prodCostMult.toFixed(2)}x
              <span className={`text-xs ${prodCostMult <= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({prodCostMult > 1.0 ? '+' : ''}{Math.round((prodCostMult - 1.0) * 100)}%)
              </span>
            </div>
            <div className="text-[10px] text-slate-500">Затраты на сырье и свет</div>
          </div>

          {/* Logistics */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Truck className="w-3.5 h-3.5 text-indigo-400" />
              Транспорт & Топливо
            </div>
            <div className="text-lg font-bold text-white font-mono flex items-baseline gap-1">
              {transportMult.toFixed(2)}x
              <span className={`text-xs ${transportMult <= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({transportMult > 1.0 ? '+' : ''}{Math.round((transportMult - 1.0) * 100)}%)
              </span>
            </div>
            <div className="text-[10px] text-slate-500">Доставка грузов и авто</div>
          </div>

          {/* Automotive */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Car className="w-3.5 h-3.5 text-amber-400" />
              Спрос на автомобили
            </div>
            <div className="text-lg font-bold text-white font-mono flex items-baseline gap-1">
              {carSalesMult.toFixed(2)}x
              <span className={`text-xs ${carSalesMult >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({carSalesMult >= 1.0 ? '+' : ''}{Math.round((carSalesMult - 1.0) * 100)}%)
              </span>
            </div>
            <div className="text-[10px] text-slate-500">Автосалоны и перекуп</div>
          </div>

          {/* Real Estate */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-teal-400" />
              Недвижимость & Аренда
            </div>
            <div className="text-lg font-bold text-white font-mono flex items-baseline gap-1">
              {realEstateMult.toFixed(2)}x
              <span className={`text-xs ${realEstateMult >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({realEstateMult >= 1.0 ? '+' : ''}{Math.round((realEstateMult - 1.0) * 100)}%)
              </span>
            </div>
            <div className="text-[10px] text-slate-500">Заполняемость объектов</div>
          </div>

          {/* Bank Loans */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CreditCard className="w-3.5 h-3.5 text-rose-400" />
              Наценка по кредитам
            </div>
            <div className="text-lg font-bold text-white font-mono flex items-baseline gap-1">
              {loanRateMod >= 0 ? '+' : ''}{(loanRateMod * 100).toFixed(2)}%
              <span className={`text-xs ${loanRateMod <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {loanRateMod <= 0 ? 'Дешевле' : 'Дороже'}
              </span>
            </div>
            <div className="text-[10px] text-slate-500">К банковской ставке</div>
          </div>
        </div>
      </div>

      {/* 4. Active Global Economic Events */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Текущие глобальные события ({activeEvents.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">Активно действуют на рынок прямо сейчас</span>
        </div>

        {activeEvents.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
            <Sparkles className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-60" />
            <div className="text-base font-semibold text-white">Рыночное равновесие</div>
            <div className="text-sm text-slate-400 mt-1">
              В данный момент глобальных шоков не зафиксировано. Рынки функционируют в базовом режиме.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEvents.map((ev) => {
              const severityBadge = {
                boom: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                critical: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                major: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                moderate: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                minor: 'bg-slate-800 text-slate-300 border-slate-700',
              }[ev.severity];

              return (
                <div
                  key={ev.id}
                  id={`event-card-${ev.id}`}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg relative overflow-hidden group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{ev.icon}</span>
                      <div>
                        <h3 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                          {ev.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase ${severityBadge}`}>
                            {ev.severity}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            Осталось: <strong className="text-amber-400">{ev.remainingDays} дн.</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                    {ev.description}
                  </p>

                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 space-y-1 mb-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Последствия для рынков:
                    </div>
                    {ev.consequences.slice(0, 3).map((c, i) => (
                      <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800 text-slate-400">
                    <span>Старт: день {ev.startDay}</span>
                    <button
                      id={`btn-event-details-${ev.id}`}
                      onClick={() => setSelectedEventModal(ev)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
                    >
                      Подробнее & Рекомендации <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Interactive Macro History Charts */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">Динамика макроэкономических показателей</h3>
              <p className="text-xs text-slate-400">История за последние {history.length} дней игрового мира</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              id="chart-tab-growth-inflation"
              onClick={() => setSelectedChartTab('growth_inflation')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedChartTab === 'growth_inflation'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ВВП & Инфляция
            </button>
            <button
              id="chart-tab-rates-oil"
              onClick={() => setSelectedChartTab('rates_oil')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedChartTab === 'rates_oil'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ставка & Нефть
            </button>
            <button
              id="chart-tab-confidence-jobs"
              onClick={() => setSelectedChartTab('confidence_jobs')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedChartTab === 'confidence_jobs'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Доверие & Безработица
            </button>
            <button
              id="chart-tab-logistics"
              onClick={() => setSelectedChartTab('logistics')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedChartTab === 'logistics'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Индекс логистики
            </button>
          </div>
        </div>

        {/* Interactive SVG Chart Engine */}
        <div className="relative w-full h-[280px] bg-slate-950/60 rounded-xl border border-slate-800/80 p-4 flex flex-col justify-between overflow-hidden">
          {history.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Накопление исторических данных...
            </div>
          ) : (() => {
            // Determine series config based on active tab
            let series1 = { key: 'economicGrowth' as keyof MacroHistoryPoint, label: 'Рост ВВП (%)', color: '#38bdf8', format: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` };
            let series2 = { key: 'inflation' as keyof MacroHistoryPoint, label: 'Инфляция (%)', color: '#f43f5e', format: (v: number) => `${v.toFixed(1)}%` };

            if (selectedChartTab === 'rates_oil') {
              series1 = { key: 'interestRate' as keyof MacroHistoryPoint, label: 'Ключевая ставка (%)', color: '#fbbf24', format: (v: number) => `${v.toFixed(2)}%` };
              series2 = { key: 'oilPrice' as keyof MacroHistoryPoint, label: 'Нефть Brent ($/bbl)', color: '#a855f7', format: (v: number) => `$${v.toFixed(1)}` };
            } else if (selectedChartTab === 'confidence_jobs') {
              series1 = { key: 'consumerConfidence' as keyof MacroHistoryPoint, label: 'Индекс доверия', color: '#10b981', format: (v: number) => `${Math.round(v)} п.` };
              series2 = { key: 'unemployment' as keyof MacroHistoryPoint, label: 'Безработица (%)', color: '#f97316', format: (v: number) => `${v.toFixed(1)}%` };
            } else if (selectedChartTab === 'logistics') {
              series1 = { key: 'transportCost' as keyof MacroHistoryPoint, label: 'Индекс логистики', color: '#6366f1', format: (v: number) => `${v.toFixed(2)}x` };
              series2 = { key: 'transportCost' as keyof MacroHistoryPoint, label: 'Индекс логистики (база 1.0)', color: '#6366f1', format: (v: number) => `${v.toFixed(2)}x` };
            }

            const points1 = history.map((h) => Number(h[series1.key]));
            const points2 = history.map((h) => Number(h[series2.key]));

            const min1 = Math.min(...points1);
            const max1 = Math.max(...points1);
            const range1 = Math.max(0.1, max1 - min1);

            const min2 = Math.min(...points2);
            const max2 = Math.max(...points2);
            const range2 = Math.max(0.1, max2 - min2);

            const width = 800;
            const height = 200;
            const paddingX = 40;
            const paddingY = 20;

            const getCoords1 = (val: number, idx: number) => {
              const x = paddingX + (idx / Math.max(1, history.length - 1)) * (width - paddingX * 2);
              const y = height - paddingY - ((val - min1) / range1) * (height - paddingY * 2);
              return { x, y };
            };

            const getCoords2 = (val: number, idx: number) => {
              const x = paddingX + (idx / Math.max(1, history.length - 1)) * (width - paddingX * 2);
              const y = height - paddingY - ((val - min2) / range2) * (height - paddingY * 2);
              return { x, y };
            };

            const pathD1 = history.reduce((acc, h, i) => {
              const { x, y } = getCoords1(Number(h[series1.key]), i);
              return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
            }, '');

            const pathD2 = selectedChartTab !== 'logistics' ? history.reduce((acc, h, i) => {
              const { x, y } = getCoords2(Number(h[series2.key]), i);
              return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
            }, '') : '';

            const areaD1 = selectedChartTab === 'logistics' && history.length > 0
              ? `${pathD1} L ${getCoords1(Number(history[history.length - 1][series1.key]), history.length - 1).x} ${height - paddingY} L ${getCoords1(Number(history[0][series1.key]), 0).x} ${height - paddingY} Z`
              : '';

            const activeIdx = hoveredPointIdx !== null && hoveredPointIdx < history.length ? hoveredPointIdx : history.length - 1;
            const activePoint = history[activeIdx];

            return (
              <>
                {/* Legend & Hover Info */}
                <div className="flex flex-wrap items-center justify-between text-xs px-2 mb-1">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: series1.color }} />
                      <span className="text-slate-300">{series1.label}:</span>
                      <strong className="text-white font-mono">{series1.format(Number(activePoint[series1.key]))}</strong>
                    </div>
                    {selectedChartTab !== 'logistics' && (
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: series2.color }} />
                        <span className="text-slate-300">{series2.label}:</span>
                        <strong className="text-white font-mono">{series2.format(Number(activePoint[series2.key]))}</strong>
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {activePoint.dateStr}
                  </div>
                </div>

                {/* SVG Visual Stage */}
                <div className="relative flex-1 w-full">
                  <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-full overflow-visible"
                    onMouseLeave={() => setHoveredPointIdx(null)}
                  >
                    <defs>
                      <linearGradient id="svgAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={series1.color} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={series1.color} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>

                    {/* Grid horizontal lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                      const y = paddingY + pct * (height - paddingY * 2);
                      return (
                        <line
                          key={i}
                          x1={paddingX}
                          y1={y}
                          x2={width - paddingX}
                          y2={y}
                          stroke="#1e293b"
                          strokeDasharray="4 4"
                        />
                      );
                    })}

                    {/* Area fill for logistics or single series */}
                    {areaD1 && (
                      <path d={areaD1} fill="url(#svgAreaGrad)" />
                    )}

                    {/* Series 1 Path */}
                    <path
                      d={pathD1}
                      fill="none"
                      stroke={series1.color}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Series 2 Path */}
                    {pathD2 && (
                      <path
                        d={pathD2}
                        fill="none"
                        stroke={series2.color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Active hover vertical cursor line */}
                    {activeIdx !== null && (
                      <>
                        <line
                          x1={getCoords1(Number(activePoint[series1.key]), activeIdx).x}
                          y1={paddingY}
                          x2={getCoords1(Number(activePoint[series1.key]), activeIdx).x}
                          y2={height - paddingY}
                          stroke="#64748b"
                          strokeDasharray="2 2"
                        />
                        <circle
                          cx={getCoords1(Number(activePoint[series1.key]), activeIdx).x}
                          cy={getCoords1(Number(activePoint[series1.key]), activeIdx).y}
                          r="4.5"
                          fill={series1.color}
                          stroke="#0f172a"
                          strokeWidth="2"
                        />
                        {selectedChartTab !== 'logistics' && (
                          <circle
                            cx={getCoords2(Number(activePoint[series2.key]), activeIdx).x}
                            cy={getCoords2(Number(activePoint[series2.key]), activeIdx).y}
                            r="4.5"
                            fill={series2.color}
                            stroke="#0f172a"
                            strokeWidth="2"
                          />
                        )}
                      </>
                    )}

                    {/* Transparent touch/hover hit boxes across X axis */}
                    {history.map((_, idx) => {
                      const x = paddingX + (idx / Math.max(1, history.length - 1)) * (width - paddingX * 2);
                      const colWidth = (width - paddingX * 2) / Math.max(1, history.length);
                      return (
                        <rect
                          key={idx}
                          x={x - colWidth / 2}
                          y={0}
                          width={colWidth}
                          height={height}
                          fill="transparent"
                          className="cursor-crosshair"
                          onMouseEnter={() => setHoveredPointIdx(idx)}
                        />
                      );
                    })}
                  </svg>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* 6. Real Consequential News Feed */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">Лента мировых экономических новостей</h3>
              <p className="text-xs text-slate-400">Каждая новость формирует реальные экономические последствия и сдвиги котировок</p>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Все новости' },
              { id: 'macroeconomics', label: 'Макро' },
              { id: 'commodities', label: 'Сырье & Нефть' },
              { id: 'technology', label: 'Технологии' },
              { id: 'monetary_policy', label: 'ЦБ & Ставки' },
              { id: 'corporate', label: 'Корпорации' },
            ].map((cat) => (
              <button
                key={cat.id}
                id={`filter-news-${cat.id}`}
                onClick={() => setSelectedNewsCategory(cat.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedNewsCategory === cat.id
                    ? 'bg-slate-800 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {filteredNews.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Нет новостей в выбранной категории
          </div>
        ) : (
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {filteredNews.map((item) => (
              <div
                key={item.id}
                id={`news-item-${item.id}`}
                className={`p-4 rounded-xl border transition-all ${
                  item.isBreaking
                    ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950/20 border-rose-500/30 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.icon || '📰'}</span>
                    <div>
                      {item.isBreaking && (
                        <span className="inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 mr-2">
                          BREAKING NEWS
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-white inline">
                        {item.headline}
                      </h4>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">
                    День {item.day}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-1 leading-relaxed pl-7">
                  {item.summary}
                </p>

                {/* Impact Metrics Badges */}
                {item.impactMetrics && item.impactMetrics.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-2.5 pl-7">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Реальные последствия:
                    </span>
                    {item.impactMetrics.map((m, mi) => (
                      <span
                        key={mi}
                        className={`text-[11px] px-2 py-0.5 rounded-md font-mono font-semibold flex items-center gap-1 border ${
                          m.isPositive
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                        }`}
                      >
                        {m.trend === 'up' ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : m.trend === 'down' ? (
                          <ArrowDownRight className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                        <span>{m.label}:</span>
                        <strong>{m.value}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedEventModal.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedEventModal.title}</h3>
                  <div className="text-xs text-slate-400">Осталось действовать: {selectedEventModal.remainingDays} дней</div>
                </div>
              </div>
              <button
                id="btn-close-event-modal"
                onClick={() => setSelectedEventModal(null)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {selectedEventModal.description}
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Рыночные последствия и мультипликаторы:
              </div>
              {selectedEventModal.consequences.map((c, i) => (
                <div key={i} className="text-xs text-slate-200 flex items-start gap-2">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>

            <button
              id="btn-close-event-modal-ok"
              onClick={() => setSelectedEventModal(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
