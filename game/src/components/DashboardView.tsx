/**
 * Business Empire: Ultimate
 * Master Tycoon Financial Dashboard (Stage 1 & Beyond)
 */

import React, { useState } from 'react';
import {
  DollarSign,
  Layers,
  TrendingUp,
  TrendingDown,
  Scale,
  PieChart,
  History,
  Briefcase,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Building,
  Car,
  Boxes,
  Trophy,
  Globe2,
  Store,
  Factory,
  LineChart,
  Landmark,
  Gamepad2,
  Package,
} from 'lucide-react';
import { GameState, NavigationTab } from '../types/game';
import { FinancialChart, ChartMetric } from './FinancialChart';
import { economy, FinancialBreakdown } from '../game/economy';
import { gameState } from '../game/gameState';
import { competitorMarketEngine } from '../game/ai/competitorMarketEngine';
import { clickerManager } from '../game/clicker/clickerManager';
import { Card, Button, Badge, StatCard, ProgressBar, Tabs } from './ui';
import { useToast } from './ui/ToastContext';
import { formatMoney } from '../utils/formatters';

interface DashboardViewProps {
  state: GameState;
  breakdown: FinancialBreakdown;
  onNavigateTab: (tab: NavigationTab) => void;
}

const STARTER_CONTRACTS = [
  {
    id: 'deal_consulting_1',
    title: 'Финансовый аудит стартапа',
    reward: 1800,
    costTimeHours: 6,
    requiredLevel: 'Новичок',
    description: 'Оценить юнит-экономику и составить финансовую модель для венчурного раунда.',
  },
  {
    id: 'deal_broker_trade',
    title: 'Посредническая сделка поставок',
    reward: 3500,
    costTimeHours: 12,
    requiredLevel: 'Предприниматель',
    description: 'Организовать контракт между оптовым складом кофе и сетью городских кофеен.',
  },
  {
    id: 'deal_franchise_scout',
    title: 'Консалтинг локаций для ритейла',
    reward: 6200,
    costTimeHours: 18,
    requiredLevel: 'Инвестор',
    description: 'Провести анализ проходимости и конкурентной среды в торговых центрах.',
  },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  breakdown,
  onNavigateTab,
}) => {
  const { showSuccess } = useToast();
  const [chartMetric, setChartMetric] = useState<ChartMetric>('netWorth');
  const [transactionFilter, setTransactionFilter] = useState<string>('all');
  const [contractFeedback, setContractFeedback] = useState<string | null>(null);

  const currency = state.settings.currency || '$';

  const formatAmount = (val: number) => {
    return formatMoney(val, { compact: state.settings.compactNumbers, currency, hideCurrency: true });
  };

  const handleExecuteContract = (contract: typeof STARTER_CONTRACTS[0]) => {
    gameState.advanceTime(contract.costTimeHours);

    economy.addMoney(
      contract.reward,
      'Консалтинг и сделки',
      `Выполнен контракт: ${contract.title}`,
      'revenue'
    );

    gameState.update((draft) => {
      draft.statistics.seedContractsCompleted =
        (draft.statistics.seedContractsCompleted || 0) + 1;
      draft.statistics.dealsClosed += 1;
    });

    const msg = `Контракт «${contract.title}» выполнен (+${currency}${contract.reward.toLocaleString()})`;
    setContractFeedback(msg);
    showSuccess('Контракт выполнен', msg);
    setTimeout(() => setContractFeedback(null), 3500);
  };

  const handleQuickTapBoost = () => {
    const res = clickerManager.executeClick();
    showSuccess(
      res.isCritical ? '⚡ КРИТИЧЕСКИЙ БУСТ!' : 'Быстрый буст',
      `Получено +${currency}${res.amount} в капитал`
    );
  };

  const filteredTransactions = state.transactions.filter((tx) => {
    if (transactionFilter === 'all') return true;
    return tx.type === transactionFilter;
  });

  const totalAssetsVal = Math.max(1, breakdown.totalAssets);
  const cashPercent = Math.round((breakdown.cash / totalAssetsVal) * 100);
  const businessPercent = Math.round((breakdown.businessesValuation / totalAssetsVal) * 100);
  const inventoryPercent = Math.round((breakdown.inventoryValuation / totalAssetsVal) * 100);
  const vehiclesPercent = Math.round((breakdown.vehiclesValuation / totalAssetsVal) * 100);
  const stocksPercent = Math.round((breakdown.stocksValuation / totalAssetsVal) * 100);

  const quickActionShortcuts = [
    {
      id: 'clicker',
      label: 'Тап-Буст',
      sub: 'Мгновенный доход',
      icon: Zap,
      color: 'amber',
      badge: 'ТУРБО',
      tab: 'clicker' as NavigationTab,
    },
    {
      id: 'cars',
      label: 'Автоиндустрия',
      sub: 'Автосалоны и СТО',
      icon: Car,
      color: 'amber',
      tab: 'cars' as NavigationTab,
    },
    {
      id: 'trading',
      label: 'Товары',
      sub: 'Оптовая торговля',
      icon: Boxes,
      color: 'emerald',
      tab: 'trading' as NavigationTab,
    },
    {
      id: 'businesses',
      label: 'Ритейл',
      sub: 'Магазины и сети',
      icon: Store,
      color: 'violet',
      tab: 'businesses' as NavigationTab,
    },
    {
      id: 'production',
      label: 'Заводы',
      sub: 'Фабрики и цеха',
      icon: Factory,
      color: 'amber',
      tab: 'production' as NavigationTab,
    },
    {
      id: 'stocks',
      label: 'Биржа 3000+',
      sub: 'Акции и дивиденды',
      icon: LineChart,
      color: 'cyan',
      tab: 'stocks' as NavigationTab,
    },
    {
      id: 'bank',
      label: 'Банк',
      sub: 'Кредиты и вклады',
      icon: Landmark,
      color: 'rose',
      tab: 'bank' as NavigationTab,
    },
    {
      id: 'casino',
      label: 'Казино-VIP',
      sub: 'Слоты и джекпоты',
      icon: Trophy,
      color: 'gold',
      badge: '120+ Игр',
      tab: 'casino' as NavigationTab,
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Dynamic News Banner if Active Events Exist */}
      {state.events.length > 0 && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider font-mono">
                Рыночное событие: {state.events[0].title}
              </div>
              <div className="text-xs text-amber-200/90 mt-0.5">
                {state.events[0].description} (Длительность: {state.events[0].daysLeft} дн.)
              </div>
            </div>
          </div>
          <Badge variant="amber" size="sm">
            АКТИВНЫЙ ЭФФЕКТ
          </Badge>
        </div>
      )}

      {/* Primary 4 Tycoon KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          id="kpi-networth-card"
          title="Чистый капитал (Net Worth)"
          value={`${currency}${formatAmount(breakdown.netWorth)}`}
          subtext={`Активы: ${currency}${formatAmount(breakdown.totalAssets)}`}
          icon={<Layers className="w-4 h-4" />}
          accentColor="emerald"
        />

        <StatCard
          id="kpi-cash-card"
          title="Ликвидность (Cash)"
          value={`${currency}${formatAmount(breakdown.cash)}`}
          subtext="Доступно для сделок"
          icon={<DollarSign className="w-4 h-4" />}
          accentColor="cyan"
          onClick={handleQuickTapBoost}
        />

        <StatCard
          id="kpi-revenue-card"
          title="Дневная выручка"
          value={`+${currency}${formatAmount(breakdown.dailyRevenue)}`}
          subtext="Бизнес, ритейл и аренда"
          icon={<TrendingUp className="w-4 h-4" />}
          accentColor="violet"
        />

        <StatCard
          id="kpi-profit-card"
          title="Чистая прибыль / день"
          value={`${breakdown.dailyProfit >= 0 ? '+' : ''}${currency}${formatAmount(breakdown.dailyProfit)}`}
          subtext={`Расходы: -${currency}${formatAmount(breakdown.dailyExpenses)}/дн`}
          icon={<Scale className="w-4 h-4" />}
          accentColor={breakdown.dailyProfit >= 0 ? 'emerald' : 'rose'}
          trend={{
            value: `${breakdown.dailyProfit >= 0 ? '+' : ''}${currency}${formatAmount(breakdown.dailyProfit)}`,
            isPositive: breakdown.dailyProfit >= 0,
          }}
        />
      </div>

      {/* Quick Launchpad & Empire Hub */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              БЫСТРЫЙ ДОСТУП & ИМПЕРСКИЙ ЦЕНТР
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('clicker')}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>Открыть бустер</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {quickActionShortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigateTab(item.tab)}
                className="p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-all flex flex-col justify-between group active:scale-95 min-h-[92px]"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="p-1.5 rounded-xl bg-slate-900 text-slate-300 group-hover:text-emerald-300 group-hover:bg-slate-800 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  {item.badge && (
                    <Badge variant="gold" size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors truncate">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {item.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* World Economy Quick Status Banner */}
      {state.worldEconomy && (
        <div
          id="dashboard-macro-banner"
          onClick={() => onNavigateTab('world_economy')}
          className="p-4 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 transition-all cursor-pointer shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 group-hover:scale-110 transition-transform">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Мировая макроэкономика & Циклы
                </span>
                <Badge variant="emerald" size="sm">
                  {state.worldEconomy.economicCyclePhase === 'expansion'
                    ? 'Экспансия'
                    : state.worldEconomy.economicCyclePhase === 'recession'
                    ? 'Рецессия'
                    : state.worldEconomy.economicCyclePhase === 'peak'
                    ? 'Пик цикла'
                    : 'Восстановление'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span>Инфляция: <strong className="text-slate-200">{state.worldEconomy.indicators.inflation.toFixed(1)}%</strong></span>
                <span>Ставка ЦБ: <strong className="text-amber-400">{state.worldEconomy.indicators.interestRate.toFixed(2)}%</strong></span>
                <span>Нефть Brent: <strong className="text-slate-200">${state.worldEconomy.indicators.oilPrice.toFixed(1)}</strong></span>
                <span>Событий: <strong className="text-indigo-400">{state.worldEconomy.activeEvents.length}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold sm:self-center">
            Открыть World Economy <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      )}

      {/* Main Historical Canvas Chart */}
      <FinancialChart
        data={state.financialHistory}
        metric={chartMetric}
        onMetricChange={setChartMetric}
        currency={currency}
      />

      {/* Balance Sheet: Assets vs Liabilities Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Assets Breakdown Card */}
        <Card
          title="СТРУКТУРА АКТИВОВ"
          icon={<PieChart className="w-4 h-4 text-emerald-400" />}
          badge={
            <span className="text-xs font-mono font-bold text-emerald-400">
              {currency}{formatAmount(breakdown.totalAssets)}
            </span>
          }
        >
          <div className="space-y-3">
            <ProgressBar
              label="Ликвидные денежные средства"
              sublabel={`${currency}${formatAmount(breakdown.cash)}`}
              value={cashPercent}
              variant="cyan"
              size="md"
            />

            <ProgressBar
              label="Оценка ритейла & предприятий"
              sublabel={`${currency}${formatAmount(breakdown.businessesValuation)}`}
              value={businessPercent}
              variant="violet"
              size="md"
            />

            <ProgressBar
              label="Товары на складах & инвентарь"
              sublabel={`${currency}${formatAmount(breakdown.inventoryValuation)}`}
              value={inventoryPercent}
              variant="amber"
              size="md"
            />

            <ProgressBar
              label="Автомобильный парк & флот"
              sublabel={`${currency}${formatAmount(breakdown.vehiclesValuation)}`}
              value={vehiclesPercent}
              variant="rose"
              size="md"
            />

            <div
              onClick={() => onNavigateTab('stocks')}
              className="cursor-pointer group pt-1"
            >
              <ProgressBar
                label="Ценные бумаги & портфель акций (3000+)"
                sublabel={`${currency}${formatAmount(breakdown.stocksValuation)}`}
                value={stocksPercent}
                variant="emerald"
                size="md"
              />
            </div>
          </div>
        </Card>

        {/* Liabilities & Debt Card */}
        <Card
          title="ОБЯЗАТЕЛЬСТВА & КРЕДИТЫ"
          icon={<Scale className="w-4 h-4 text-rose-400" />}
          badge={
            <span className="text-xs font-mono font-bold text-rose-400">
              {currency}{formatAmount(breakdown.totalLiabilities)}
            </span>
          }
          className="flex flex-col justify-between"
        >
          <div>
            {state.loans.length === 0 ? (
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center py-6">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <div className="text-xs sm:text-sm font-bold text-slate-200 mb-0.5">
                  Нулевая долговая нагрузка
                </div>
                <div className="text-xs text-slate-400 max-w-xs mx-auto">
                  У вашей корпорации нет активных непогашенных кредитов. Вы можете получить заем в разделе «Банк».
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {state.loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{loan.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Платеж: {currency}{formatAmount(loan.dailyPayment)}/день ({loan.daysRemaining} дн.)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-rose-400">
                        {currency}{formatAmount(loan.remainingAmount)}
                      </div>
                      <div className="text-[10px] text-slate-500">Остаток долга</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Кредитный рейтинг:</span>
            <Badge variant="emerald" size="sm">
              {state.corporation.creditRating} — Высокая надежность
            </Badge>
          </div>
        </Card>
      </div>

      {/* Global AI Rivals & Forbes Leaderboard Preview */}
      {(() => {
        const ranking = competitorMarketEngine.getLeaderboard();
        const playerRank = ranking.find((r) => r.isPlayer)?.rank || 1;
        const top3 = ranking.slice(0, 3);

        return (
          <Card
            title="Глобальный Рейтинг Корпораций"
            icon={<Trophy className="w-4 h-4 text-amber-400" />}
            badge={<Badge variant="gold" size="sm">22 AI-КОНКУРЕНТА</Badge>}
            action={
              <Button
                variant="gold"
                size="sm"
                rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                onClick={() => onNavigateTab('competitors')}
              >
                Открыть Forbes
              </Button>
            }
          >
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Ваша позиция в мировом рейтинге: <strong className="text-amber-300">Ранг #{playerRank} из 23</strong>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {top3.map((corp) => (
                  <div
                    key={corp.id}
                    onClick={() => onNavigateTab('competitors')}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 flex items-center justify-between cursor-pointer group transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono font-black text-amber-400 text-sm flex-shrink-0">
                        #{corp.rank}
                      </span>
                      <span className="text-xl flex-shrink-0">{corp.avatarIcon}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-200 group-hover:text-amber-300 transition-colors truncate">
                          {corp.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {corp.isPlayer ? 'Ваша Корпорация' : `CEO: ${corp.ceoName}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-slate-100 text-xs flex-shrink-0 ml-2">
                      {currency}{(corp.netWorth / 1_000_000).toFixed(1)}M
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })()}

      {/* Starter Entrepreneur Business Deals (Bootstrap Module) */}
      <Card
        title="ОПЕРАТИВНЫЕ КОНТРАКТЫ & БУТСТРЕППИНГ"
        icon={<Briefcase className="w-4 h-4 text-amber-400" />}
        badge={
          <span className="text-xs font-mono text-slate-400">
            Завершено: <strong className="text-amber-400">{state.statistics.seedContractsCompleted || 0}</strong>
          </span>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Выполняйте сделки для быстрого накопления первоначального капитала и разгона оборота
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {STARTER_CONTRACTS.map((contract) => (
              <div
                key={contract.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5 font-mono font-bold">
                    <span className="text-emerald-400">
                      +{currency}{contract.reward.toLocaleString()}
                    </span>
                    <span className="text-slate-500 font-normal">
                      ~{contract.costTimeHours} ч.
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-100 mb-1">
                    {contract.title}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                    {contract.description}
                  </p>
                </div>

                <Button
                  id={`btn-exec-${contract.id}`}
                  variant="success"
                  size="sm"
                  leftIcon={<Zap className="w-3.5 h-3.5" />}
                  onClick={() => handleExecuteContract(contract)}
                  className="w-full"
                >
                  Выполнить контракт
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Transaction History & Financial Ledger */}
      <Card
        title="ФИНАНСОВЫЙ ЖУРНАЛ (LEDGER)"
        icon={<History className="w-4 h-4 text-slate-300" />}
        action={
          <Tabs
            size="sm"
            variant="segmented"
            tabs={[
              { id: 'all', label: 'Все' },
              { id: 'revenue', label: 'Доходы' },
              { id: 'expense', label: 'Расходы' },
              { id: 'investment', label: 'Инвестиции' },
            ]}
            activeTab={transactionFilter}
            onChange={setTransactionFilter}
          />
        }
      >
        {/* Desktop View: Clean high-density table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-2.5 px-3">Время игры</th>
                <th className="py-2.5 px-3">Категория</th>
                <th className="py-2.5 px-3">Описание операции</th>
                <th className="py-2.5 px-3 text-right">Сумма</th>
                <th className="py-2.5 px-3 text-right">Остаток баланса</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
              {filteredTransactions.slice(0, 15).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                    Г.{tx.gameTime.year} М.{tx.gameTime.month} Д.{tx.gameTime.day} ({tx.gameTime.hour}:00)
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <Badge variant="slate" size="sm">
                      {tx.category}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-slate-200 max-w-xs truncate">
                    {tx.description}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap ${
                      tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {tx.amount >= 0 ? '+' : ''}
                    {currency}{Math.abs(tx.amount).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-400 whitespace-nowrap">
                    {currency}{Math.round(tx.balanceAfter).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Responsive cards */}
        <div className="sm:hidden space-y-2">
          {filteredTransactions.slice(0, 10).map((tx) => (
            <div
              key={tx.id}
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Badge variant="slate" size="sm">
                    {tx.category}
                  </Badge>
                  <span className="text-[10px] font-mono text-slate-500">
                    Г.{tx.gameTime.year} Д.{tx.gameTime.day}
                  </span>
                </div>
                <div className="text-xs text-slate-200 font-medium truncate">
                  {tx.description}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div
                  className={`text-xs font-mono font-bold ${
                    tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {tx.amount >= 0 ? '+' : ''}
                  {currency}{Math.abs(tx.amount).toLocaleString()}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                  {currency}{Math.round(tx.balanceAfter).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
