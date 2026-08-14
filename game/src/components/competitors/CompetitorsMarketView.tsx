/**
 * Business Empire: Ultimate
 * AI Competitor Market & Global Corporate Leaderboard View
 */

import React, { useState, useMemo } from 'react';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Building2,
  Store,
  Factory,
  Users,
  DollarSign,
  Shield,
  Zap,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  X,
  AlertTriangle,
  CheckCircle2,
  Globe,
  BarChart3,
  Briefcase,
  Crown,
  Sparkles,
  Activity,
  Layers,
  Award,
} from 'lucide-react';
import { gameState } from '../../game/gameState';
import { GameState } from '../../types/game';
import { competitorMarketEngine } from '../../game/ai/competitorMarketEngine';
import {
  AICompetitorCompany,
  LeaderboardRankingItem,
  AIStrategy,
  AIActionType,
} from '../../types/aiCompetitors';

type TabMode = 'leaderboard' | 'cards' | 'live_wire' | 'sectors';
type SortField = 'netWorth' | 'dailyRevenue' | 'dailyProfit' | 'marketShare' | 'stores' | 'factories';

interface CompetitorsMarketViewProps {
  state?: GameState;
}

export const CompetitorsMarketView: React.FC<CompetitorsMarketViewProps> = ({ state: propState }) => {
  const state = propState || gameState.getState();
  const currency = state.settings?.currency || '$';

  const [activeTab, setActiveTab] = useState<TabMode>('leaderboard');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [strategyFilter, setStrategyFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('netWorth');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionProcessing, setActionProcessing] = useState(false);

  // Retrieve current ranking
  const leaderboard = useMemo(() => {
    return competitorMarketEngine.getLeaderboard();
  }, [state.gameTime.totalDays, state.cash, state.businesses.length, state.properties.length]);

  const companies = useMemo(() => {
    return competitorMarketEngine.getCompanies();
  }, [state.gameTime.totalDays]);

  const actionFeed = useMemo(() => {
    return competitorMarketEngine.getActionFeed();
  }, [state.gameTime.totalDays]);

  // Selected company object
  const selectedCompany = useMemo(() => {
    if (!selectedCompanyId) return null;
    return companies.find((c) => c.id === selectedCompanyId) || null;
  }, [selectedCompanyId, companies]);

  // Player position in the leaderboard
  const playerItem = useMemo(() => {
    return leaderboard.find((item) => item.isPlayer) || null;
  }, [leaderboard]);

  // Filtered & Sorted Leaderboard
  const filteredLeaderboard = useMemo(() => {
    let list = [...leaderboard];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.ceoName.toLowerCase().includes(q) ||
          c.sector.toLowerCase().includes(q)
      );
    }

    if (strategyFilter !== 'all') {
      list = list.filter((c) => c.strategy === strategyFilter);
    }

    if (sectorFilter !== 'all') {
      list = list.filter((c) => c.sector.includes(sectorFilter));
    }

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return 0;
    });

    return list;
  }, [leaderboard, searchQuery, strategyFilter, sectorFilter, sortField, sortAsc]);

  // Sectors list for filters
  const sectorsList = useMemo(() => {
    const set = new Set<string>();
    for (const c of companies) {
      const main = c.sector.split('&')[0].trim();
      set.add(main);
    }
    return Array.from(set);
  }, [companies]);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Trigger feedback banner
  const triggerFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4500);
  };

  // Launch Marketing War
  const handleLaunchMarketing = (compId: string) => {
    setActionProcessing(true);
    const res = competitorMarketEngine.launchMarketingCampaignAgainst(compId);
    setActionProcessing(false);
    triggerFeedback(res.message);
  };

  // Buy Competitor Equity
  const handleBuyEquity = (compId: string, pct: number) => {
    setActionProcessing(true);
    const res = competitorMarketEngine.buyCompetitorEquity(compId, pct);
    setActionProcessing(false);
    triggerFeedback(res.message);
  };

  const getStrategyBadge = (strat: AIStrategy | 'player') => {
    switch (strat) {
      case 'aggressive':
        return { label: 'Агрессивная', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'conservative':
        return { label: 'Консервативная', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'trading':
        return { label: 'Торговая', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
      case 'industrial':
        return { label: 'Промышленная', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'retail':
        return { label: 'Розничная', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'investment':
        return { label: 'Инвестиционная', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'player':
        return { label: 'Игрок (Вы)', color: 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50' };
    }
  };

  const getRatingBadge = (rating: string) => {
    if (rating === 'AAA' || rating === 'AA') {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
    if (rating === 'A' || rating === 'BBB') {
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }
    if (rating === 'BB' || rating === 'B') {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
    return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-3 animate-fade-in shadow-xl backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/60 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5" />
              <span>Автономная экосистема из 20+ корпораций</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
              <span>Рынок и AI-Конкуренты</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                22 ТАЙКУНА
              </span>
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              ИИ-конкуренты самостоятельно торгуют товарами, открывают заводы и магазины, скупают недвижимость, инвестируют в акции и влияют на мировые цены и спрос.
            </p>
          </div>

          {/* Player Rank Card */}
          {playerItem && (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 shadow-inner flex items-center gap-4 min-w-[280px]">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-md">
                👑
              </div>
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Ваша Позиция</span>
                </div>
                <div className="text-xl font-extrabold text-slate-100 flex items-baseline gap-2">
                  <span>Ранг #{playerItem.rank}</span>
                  <span className="text-xs font-normal text-slate-400">из 23</span>
                </div>
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  {currency}{(playerItem.netWorth / 1_000_000).toFixed(2)}M Капитал
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top 4 Quick Market Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400 mb-1 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Лидер Рейтинга (#1)</span>
            </div>
            <div className="font-bold text-slate-100 truncate">
              {leaderboard[0]?.name || 'OmniCorp Worldwide'}
            </div>
            <div className="text-[11px] font-mono text-emerald-400">
              {currency}{((leaderboard[0]?.netWorth || 145000000) / 1_000_000).toFixed(1)}M
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Всего Корпораций</span>
            </div>
            <div className="font-bold text-slate-100">
              22 AI + 1 Игрок
            </div>
            <div className="text-[11px] text-slate-400">
              6 экономических секторов
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400 mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>Сделок в Ленте</span>
            </div>
            <div className="font-bold text-slate-100 font-mono">
              {actionFeed.length} событий
            </div>
            <div className="text-[11px] text-indigo-400">
              Реальное влияние на рынок
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400 mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ваша Доля Рынка</span>
            </div>
            <div className="font-bold text-slate-100 font-mono">
              {playerItem?.marketShare.toFixed(1)}%
            </div>
            <div className="text-[11px] text-amber-400">
              Рейтинг: {playerItem?.creditRating}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Рейтинг Форбс (Таблица)</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'cards'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Карточки 22 Корпораций</span>
          </button>

          <button
            onClick={() => setActiveTab('live_wire')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'live_wire'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Биржевой Провод (Live Feed)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-950/60 text-[10px] font-mono font-bold">
              {actionFeed.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск корпорации, CEO или сектора..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 mr-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Стратегия:</span>
        </div>

        {['all', 'aggressive', 'conservative', 'trading', 'industrial', 'retail', 'investment'].map((strat) => (
          <button
            key={strat}
            onClick={() => setStrategyFilter(strat)}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-all ${
              strategyFilter === strat
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {strat === 'all' && 'Все стратегии'}
            {strat === 'aggressive' && '🔥 Агрессивная'}
            {strat === 'conservative' && '🛡️ Консервативная'}
            {strat === 'trading' && '📦 Торговая'}
            {strat === 'industrial' && '🏭 Промышленная'}
            {strat === 'retail' && '🛒 Розничная'}
            {strat === 'investment' && '📈 Инвестиционная'}
          </button>
        ))}
      </div>

      {/* TAB 1: LEADERBOARD TABLE */}
      {activeTab === 'leaderboard' && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 select-none">
                  <th className="py-3.5 px-4 font-bold text-center w-14">#</th>
                  <th className="py-3.5 px-4 font-bold">Корпорация & CEO</th>
                  <th className="py-3.5 px-4 font-bold">Сектор & Стратегия</th>
                  <th
                    onClick={() => handleSort('netWorth')}
                    className="py-3.5 px-4 font-bold text-right cursor-pointer hover:text-slate-200 transition-colors"
                  >
                    <div className="inline-flex items-center gap-1">
                      <span>Капитал</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('dailyRevenue')}
                    className="py-3.5 px-4 font-bold text-right cursor-pointer hover:text-slate-200 transition-colors"
                  >
                    <div className="inline-flex items-center gap-1">
                      <span>Выручка/день</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('dailyProfit')}
                    className="py-3.5 px-4 font-bold text-right cursor-pointer hover:text-slate-200 transition-colors"
                  >
                    <div className="inline-flex items-center gap-1">
                      <span>Прибыль/день</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-bold text-center">Активы</th>
                  <th
                    onClick={() => handleSort('marketShare')}
                    className="py-3.5 px-4 font-bold text-right cursor-pointer hover:text-slate-200 transition-colors"
                  >
                    <div className="inline-flex items-center gap-1">
                      <span>Доля</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-bold text-center">Рейтинг</th>
                  <th className="py-3.5 px-4 font-bold text-center">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLeaderboard.map((item) => {
                  const badge = getStrategyBadge(item.strategy);
                  const isHighlighted = item.isPlayer;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => !item.isPlayer && setSelectedCompanyId(item.id)}
                      className={`group transition-colors ${
                        isHighlighted
                          ? 'bg-amber-500/10 hover:bg-amber-500/15 border-l-4 border-amber-500'
                          : 'hover:bg-slate-800/40 cursor-pointer'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        {item.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                            🥇
                          </span>
                        ) : item.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300/20 border border-slate-300/40 text-slate-200">
                            🥈
                          </span>
                        ) : item.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 border border-amber-700/40 text-amber-500">
                            🥉
                          </span>
                        ) : (
                          <span className={`text-sm ${isHighlighted ? 'text-amber-400 font-extrabold' : 'text-slate-400'}`}>
                            #{item.rank}
                          </span>
                        )}
                      </td>

                      {/* Name & CEO */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform flex-shrink-0">
                            {item.avatarIcon}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-100 flex items-center gap-1.5 truncate">
                              <span>{item.name}</span>
                              {item.isPlayer && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                                  ВЫ
                                </span>
                              )}
                              {item.isBankrupt && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-bold">
                                  БАНКРОТ
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              CEO: {item.ceoName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Sector & Strategy */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="text-slate-300 font-medium truncate max-w-[180px]">
                            {item.sector}
                          </div>
                          <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-semibold ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                      </td>

                      {/* Net Worth */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100 text-sm">
                        {currency}{(item.netWorth / 1_000_000).toFixed(2)}M
                      </td>

                      {/* Daily Revenue */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {currency}{(item.dailyRevenue / 1_000).toFixed(1)}k
                      </td>

                      {/* Daily Profit */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span className={item.dailyProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {item.dailyProfit >= 0 ? '+' : ''}{currency}{(item.dailyProfit / 1_000).toFixed(1)}k
                        </span>
                      </td>

                      {/* Assets summary */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-2 text-[11px] text-slate-400">
                          {item.stores > 0 && (
                            <span className="flex items-center gap-0.5" title="Магазины">
                              <Store className="w-3 h-3 text-purple-400" />
                              {item.stores}
                            </span>
                          )}
                          {item.factories > 0 && (
                            <span className="flex items-center gap-0.5" title="Заводы">
                              <Factory className="w-3 h-3 text-amber-400" />
                              {item.factories}
                            </span>
                          )}
                          {item.employees > 0 && (
                            <span className="flex items-center gap-0.5" title="Сотрудники">
                              <Users className="w-3 h-3 text-sky-400" />
                              {item.employees}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Market share */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full"
                              style={{ width: `${Math.min(100, item.marketShare * 5)}%` }}
                            />
                          </div>
                          <span>{item.marketShare.toFixed(1)}%</span>
                        </div>
                      </td>

                      {/* Credit Rating */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded border font-mono font-bold text-[10px] ${getRatingBadge(item.creditRating)}`}>
                          {item.creditRating}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        {!item.isPlayer ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCompanyId(item.id);
                            }}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Открыть досье и аналитику"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                            Ваша Корпорация
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CARDS GRID */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((comp) => {
            const badge = getStrategyBadge(comp.strategy);
            return (
              <div
                key={comp.id}
                onClick={() => setSelectedCompanyId(comp.id)}
                className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-4 relative overflow-hidden group shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                      {comp.avatarIcon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm group-hover:text-amber-400 transition-colors">
                        {comp.name}
                      </h3>
                      <div className="text-xs text-slate-400">CEO: {comp.ceoName}</div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {comp.description}
                </p>

                {/* Financial KPI Bento */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs">
                  <div>
                    <div className="text-slate-500 text-[10px]">Капитал (Net Worth)</div>
                    <div className="font-mono font-bold text-slate-100">
                      {currency}{(comp.netWorth / 1_000_000).toFixed(1)}M
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">Прибыль / день</div>
                    <div className={`font-mono font-bold ${comp.dailyProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {comp.dailyProfit >= 0 ? '+' : ''}{currency}{(comp.dailyProfit / 1_000).toFixed(1)}k
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">Кэш & Ликвидность</div>
                    <div className="font-mono text-cyan-400">
                      {currency}{(comp.cash / 1_000_000).toFixed(1)}M
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">Доля сектора</div>
                    <div className="font-mono font-bold text-amber-400">
                      {comp.marketShare.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Asset Indicators Footer */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 text-slate-400">
                  <div className="flex items-center gap-3">
                    {comp.stores > 0 && (
                      <span className="flex items-center gap-1" title="Магазины">
                        <Store className="w-3.5 h-3.5 text-purple-400" />
                        {comp.stores}
                      </span>
                    )}
                    {comp.factories > 0 && (
                      <span className="flex items-center gap-1" title="Заводы">
                        <Factory className="w-3.5 h-3.5 text-amber-400" />
                        {comp.factories}
                      </span>
                    )}
                    {comp.employees > 0 && (
                      <span className="flex items-center gap-1" title="Штат">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        {comp.employees}
                      </span>
                    )}
                  </div>

                  <span className={`px-2 py-0.5 rounded border font-mono text-[10px] font-bold ${getRatingBadge(comp.creditRating)}`}>
                    {comp.creditRating}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: LIVE WIRE / ACTION FEED */}
      {activeTab === 'live_wire' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-3">
            <Activity className="w-5 h-5 flex-shrink-0 text-indigo-400" />
            <div>
              <span className="font-bold">Живая лента действий ИИ:</span> Каждая сделка конкурентов (закупки сырья на бирже, строительство заводов, покупка акций на бирже, банкротства) напрямую меняет рыночные цены, объемы предложения и уровень конкуренции.
            </div>
          </div>

          <div className="space-y-3">
            {actionFeed.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-4 text-xs"
              >
                <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl flex-shrink-0 shadow-md">
                  {act.icon}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-bold text-slate-100 flex items-center gap-2">
                      <span className="text-amber-400">{act.companyName}</span>
                      <span className="text-slate-500">•</span>
                      <span>{act.title}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      День {act.day}
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed">
                    {act.description}
                  </p>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-emerald-400 font-medium mt-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Эффект на рынок: {act.impact}</span>
                  </div>
                </div>
              </div>
            ))}

            {actionFeed.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-sm">
                Действия ИИ генерируются с ходом игровых дней. Промотайте время вперед для первых сделок!
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: COMPANY INSPECTOR DOSSIER */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-6 text-xs text-slate-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shadow-inner">
                  {selectedCompany.avatarIcon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-100">{selectedCompany.name}</h2>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getStrategyBadge(selectedCompany.strategy).color}`}>
                      {getStrategyBadge(selectedCompany.strategy).label}
                    </span>
                  </div>
                  <div className="text-slate-400 text-xs mt-0.5">
                    CEO: <span className="text-slate-200 font-semibold">{selectedCompany.ceoName}</span> • Сектор: {selectedCompany.sector}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCompanyId(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Overview Bento */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-slate-500 text-[10px]">Капитал (Net Worth)</div>
                <div className="text-base font-mono font-bold text-slate-100 mt-1">
                  {currency}{(selectedCompany.netWorth / 1_000_000).toFixed(2)}M
                </div>
                <div className="text-[10px] text-amber-400 mt-0.5">
                  Доля рынка: {selectedCompany.marketShare.toFixed(1)}%
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-slate-500 text-[10px]">Кэш & Ликвидность</div>
                <div className="text-base font-mono font-bold text-cyan-400 mt-1">
                  {currency}{(selectedCompany.cash / 1_000_000).toFixed(2)}M
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Долг: {currency}{(selectedCompany.debt / 1_000_000).toFixed(2)}M
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-slate-500 text-[10px]">Выручка / Прибыль в день</div>
                <div className="text-base font-mono font-bold text-emerald-400 mt-1">
                  +{currency}{(selectedCompany.dailyProfit / 1_000).toFixed(1)}k
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Оборот: {currency}{(selectedCompany.dailyRevenue / 1_000).toFixed(1)}k
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-slate-500 text-[10px]">Кредитный Рейтинг</div>
                <div className="text-base font-mono font-bold text-slate-100 mt-1 flex items-center gap-2">
                  <span>{selectedCompany.creditRating}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getRatingBadge(selectedCompany.creditRating)}`}>
                    Инвест. класс
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Репутация: {selectedCompany.reputation}/100
                </div>
              </div>
            </div>

            {/* Asset Breakdown & Portfolio */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Производственные и физические активы</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                  <Store className="w-6 h-6 text-purple-400" />
                  <div>
                    <div className="font-bold text-slate-100 text-sm">{selectedCompany.stores}</div>
                    <div className="text-slate-400 text-[11px]">Магазинов / точек</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                  <Factory className="w-6 h-6 text-amber-400" />
                  <div>
                    <div className="font-bold text-slate-100 text-sm">{selectedCompany.factories}</div>
                    <div className="text-slate-400 text-[11px]">Заводов / фабрик</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                  <Users className="w-6 h-6 text-sky-400" />
                  <div>
                    <div className="font-bold text-slate-100 text-sm">{selectedCompany.employees}</div>
                    <div className="text-slate-400 text-[11px]">Сотрудников</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-emerald-400" />
                  <div>
                    <div className="font-bold text-slate-100 text-sm">{selectedCompany.realEstateCount}</div>
                    <div className="text-slate-400 text-[11px]">Объектов недвиж.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Actions by Player */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
              <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Стратегическое взаимодействие & M&A</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  disabled={actionProcessing || state.cash < 250000}
                  onClick={() => handleLaunchMarketing(selectedCompany.id)}
                  className="p-3 rounded-xl bg-gradient-to-r from-rose-600/30 to-amber-600/30 border border-rose-500/40 hover:border-rose-500 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="font-bold text-slate-100 group-hover:text-rose-300 flex items-center justify-between">
                    <span>🎯 Маркетинговая война</span>
                    <span className="font-mono text-xs">{currency}250,000</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Запустить агрессивную рекламную кампанию и переманить долю рынка у конкурента.
                  </p>
                </button>

                <button
                  disabled={actionProcessing || state.cash < selectedCompany.netWorth * 0.1}
                  onClick={() => handleBuyEquity(selectedCompany.id, 10)}
                  className="p-3 rounded-xl bg-gradient-to-r from-indigo-600/30 to-sky-600/30 border border-indigo-500/40 hover:border-indigo-500 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="font-bold text-slate-100 group-hover:text-indigo-300 flex items-center justify-between">
                    <span>🤝 Выкуп 10% акций</span>
                    <span className="font-mono text-xs">
                      {currency}{((selectedCompany.netWorth * 0.115) / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Войти в капитал корпорации в качестве стратегического акционера.
                  </p>
                </button>
              </div>
            </div>

            {/* Recent Actions Feed */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Последние операции корпорации:
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedCompany.recentActions.map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3 text-xs"
                  >
                    <span className="text-lg">{act.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-200 truncate">{act.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{act.description}</div>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">День {act.day}</div>
                  </div>
                ))}

                {selectedCompany.recentActions.length === 0 && (
                  <div className="text-slate-500 text-xs py-2">
                    Корпорация находится в штатном операционном режиме.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
