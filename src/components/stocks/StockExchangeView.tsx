/**
 * Business Empire: Ultimate
 * Complete Stock Exchange & Capital Markets View (3,000+ Public Companies)
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  PieChart,
  DollarSign,
  Briefcase,
  Layers,
  Activity,
  Calendar,
  Zap,
  Globe,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  BarChart3,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import { GameState } from '../../types/game';
import {
  StockCompany,
  StockSector,
  MarketRegimeType,
} from '../../types/stockExchange';
import { stockExchange } from '../../game/markets/stockExchangeManager';
import { CompanyPriceChart } from './CompanyPriceChart';
import { StockTradeModal } from './StockTradeModal';

interface StockExchangeViewProps {
  state: GameState;
  showNotification: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

type StockSubTab = 'catalog' | 'portfolio' | 'terminal' | 'macro' | 'history';

const SECTORS: StockSector[] = [
  'Technology',
  'Finance',
  'Healthcare',
  'Energy',
  'Consumer Discretionary',
  'Consumer Staples',
  'Industrials',
  'Telecommunications',
  'Utilities',
  'Real Estate',
  'Materials',
];

const SECTOR_LABELS_RU: Record<StockSector, string> = {
  Technology: 'Технологии & ИИ',
  Finance: 'Финансы & Банки',
  Healthcare: 'Здравоохранение & Фарма',
  Energy: 'Энергетика & Нефтегаз',
  'Consumer Discretionary': 'Потребительские товары & Авто',
  'Consumer Staples': 'Продуктовый ритейл & FMCG',
  Industrials: 'Промышленность & Авиация',
  Telecommunications: 'Телеком & 5G',
  Utilities: 'Коммунальный сектор & ВИЭ',
  'Real Estate': 'Недвижимость & REIT',
  Materials: 'Металлы & Горнодобыча',
};

export const StockExchangeView: React.FC<StockExchangeViewProps> = ({
  state,
  showNotification,
}) => {
  const currency = state.settings.currency || '$';
  const [activeTab, setActiveTab] = useState<StockSubTab>('catalog');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'marketCap' | 'change24h' | 'price' | 'peRatio' | 'dividendYield' | 'volume'>('marketCap');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 25;

  // Selected company for terminal inspection & trading
  const allCompanies = stockExchange.getCompanies();
  const [selectedTicker, setSelectedTicker] = useState<string>(allCompanies[0]?.ticker || 'AAPL');
  const [tradingCompany, setTradingCompany] = useState<StockCompany | null>(null);

  const holdings = stockExchange.getHoldings();
  const regimeState = stockExchange.getMarketRegime();
  const portfolioSummary = stockExchange.getPortfolioSummary();
  const orderHistory = stockExchange.getOrderHistory();
  const dividendHistory = stockExchange.getDividendHistory();

  const selectedCompany = useMemo(() => {
    return stockExchange.getCompany(selectedTicker) || allCompanies[0];
  }, [selectedTicker, allCompanies]);

  // Filtering & Sorting of 3,000+ companies
  const filteredCompanies = useMemo(() => {
    let list = allCompanies;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) => c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      );
    }

    if (selectedSector !== 'ALL') {
      list = list.filter((c) => c.sector === selectedSector);
    }

    const sorted = [...list].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'desc' ? valB - valA : valA - valB;
      }
      return 0;
    });

    return sorted;
  }, [allCompanies, searchQuery, selectedSector, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage) || 1;
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCompanies.slice(start, start + itemsPerPage);
  }, [filteredCompanies, currentPage, itemsPerPage]);

  // Regime styling helper
  const getRegimeBadge = (regime: MarketRegimeType) => {
    switch (regime) {
      case 'bull':
        return { label: 'БЫЧИЙ РЫНОК (BULL MARKET)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: TrendingUp };
      case 'bear':
        return { label: 'МЕДВЕЖИЙ РЫНОК (BEAR MARKET)', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: TrendingDown };
      case 'crisis':
        return { label: 'ЛИКВИДНЫЙ КРИЗИС (MARKET CRISIS)', color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: ShieldAlert };
      case 'rally':
        return { label: 'БЫЧЬЕ РАЛЛИ (MARKET RALLY)', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Flame };
      case 'crash':
        return { label: 'ОБВАЛ КОТИРОВОК (MARKET CRASH)', color: 'bg-rose-600/30 text-rose-200 border-rose-500/40', icon: AlertTriangle };
      case 'neutral':
      default:
        return { label: 'БОКОВОЙ ТРЕНД (NEUTRAL/SIDEWAYS)', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: Activity };
    }
  };

  const currentRegimeInfo = getRegimeBadge(regimeState.regime);
  const RegimeIcon = currentRegimeInfo.icon;

  return (
    <div className="space-y-5">
      {/* Top Header with Market Regime & Live Metrics Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-wider text-blue-400 uppercase">
                ГЛОБАЛЬНЫЙ БИРЖЕВОЙ ДЕПАРТАМЕНТ
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                3,050 Эмитентов
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-1">
              Фондовая биржа & Рынки капитала
            </h2>
          </div>

          {/* Macro Regime Pill */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border ${currentRegimeInfo.color} font-mono text-xs font-bold`}>
            <RegimeIcon className="w-4 h-4 shrink-0" />
            <span>{currentRegimeInfo.label}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300">Индекс: {regimeState.marketIndex.toFixed(1)} п.</span>
          </div>
        </div>

        {/* 4 Core Financial Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/70">
            <span className="text-[11px] text-slate-400 block mb-1">Оценка портфеля акций</span>
            <div className="font-mono text-xl font-black text-slate-100">
              {currency}{portfolioSummary.totalValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Инвестировано: {currency}{portfolioSummary.totalInvested.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/70">
            <span className="text-[11px] text-slate-400 block mb-1">Нереализованный P/L</span>
            <div
              className={`font-mono text-xl font-black ${
                portfolioSummary.unrealizedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {portfolioSummary.unrealizedProfit >= 0 ? '+' : ''}
              {currency}{portfolioSummary.unrealizedProfit.toLocaleString()}
            </div>
            <div
              className={`text-[11px] font-mono font-semibold ${
                portfolioSummary.unrealizedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {portfolioSummary.unrealizedProfit >= 0 ? '+' : ''}
              {portfolioSummary.unrealizedProfitPercent.toFixed(2)}% всего
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/70">
            <span className="text-[11px] text-slate-400 block mb-1">Дивидендный доход / год</span>
            <div className="font-mono text-xl font-black text-emerald-400">
              +{currency}{portfolioSummary.annualDividendsProjected.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Выплачено: +{currency}{stockExchange.getTotalDividendsEarned().toFixed(2)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/70">
            <span className="text-[11px] text-slate-400 block mb-1">Фиксация прибыли (Реализовано)</span>
            <div
              className={`font-mono text-xl font-black ${
                stockExchange.getTotalRealizedProfits() >= 0 ? 'text-blue-400' : 'text-rose-400'
              }`}
            >
              {stockExchange.getTotalRealizedProfits() >= 0 ? '+' : ''}
              {currency}{stockExchange.getTotalRealizedProfits().toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Позиций в портфеле: {portfolioSummary.holdingsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto text-xs font-mono">
        <button
          id="tab-stock-catalog"
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          КОТИРОВАЛЬНЫЙ ЗАЛ ({filteredCompanies.length})
        </button>

        <button
          id="tab-stock-portfolio"
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'portfolio'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          ИНВЕСТИЦИОННЫЙ ПОРТФЕЛЬ ({portfolioSummary.holdingsCount})
        </button>

        <button
          id="tab-stock-terminal"
          onClick={() => setActiveTab('terminal')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'terminal'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          ТОРГОВЫЙ ТЕРМИНАЛ ({selectedCompany.ticker})
        </button>

        <button
          id="tab-stock-macro"
          onClick={() => setActiveTab('macro')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'macro'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Globe className="w-4 h-4" />
          МАКРОЭКОНОМИКА & РЕЖИМЫ
        </button>

        <button
          id="tab-stock-history"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          ИСТОРИЯ СДЕЛОК & ДИВИДЕНДЫ
        </button>
      </div>

      {/* 1. CATALOG TAB */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filter, Search and Sorting Controls */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-stock-search"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Поиск по тикеру или названию..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Sector Selector */}
            <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <select
                id="select-stock-sector"
                value={selectedSector}
                onChange={(e) => {
                  setSelectedSector(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Все секторы экономики (11)</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {SECTOR_LABELS_RU[s]}
                  </option>
                ))}
              </select>

              {/* Sort By Selector */}
              <select
                id="select-stock-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="marketCap">Сортировка: Капитализация ($)</option>
                <option value="change24h">Сортировка: Изменение за день (%)</option>
                <option value="price">Сортировка: Цена акции ($)</option>
                <option value="dividendYield">Сортировка: Дивидендная доходность (%)</option>
                <option value="peRatio">Сортировка: Мультипликатор P/E</option>
                <option value="volume">Сортировка: Торговый объем</option>
              </select>

              <button
                id="btn-toggle-sort-order"
                onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 hover:text-white"
              >
                {sortOrder === 'desc' ? '▼ По убыв.' : '▲ По возр.'}
              </button>
            </div>
          </div>

          {/* Companies Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
                    <th className="py-3 px-4">ТИКЕР / ЭМИТЕНТ</th>
                    <th className="py-3 px-4">СЕКТОР</th>
                    <th className="py-3 px-4 text-right">ЦЕНА АКЦИИ</th>
                    <th className="py-3 px-4 text-right">ИЗМЕНЕНИЕ (24Ч)</th>
                    <th className="py-3 px-4 text-right">КАПИТАЛИЗАЦИЯ</th>
                    <th className="py-3 px-4 text-right">P/E</th>
                    <th className="py-3 px-4 text-right">ДИВИДЕНДЫ</th>
                    <th className="py-3 px-4 text-center">ДЕЙСТВИЯ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {paginatedCompanies.map((c) => {
                    const diff = c.price - c.previousPrice;
                    const isPos = diff >= 0;
                    const holding = holdings[c.ticker];
                    const hasHolding = holding && holding.shares > 0;

                    return (
                      <tr
                        key={c.ticker}
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => {
                          setSelectedTicker(c.ticker);
                          setActiveTab('terminal');
                        }}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                              {c.ticker}
                            </span>
                            <div>
                              <div className="font-sans font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
                                {c.name}
                              </div>
                              {hasHolding && (
                                <span className="text-[10px] text-emerald-400">
                                  В портфеле: {holding.shares.toLocaleString()} шт.
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-sans">
                          {SECTOR_LABELS_RU[c.sector]}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-100 text-sm">
                          {currency}{c.price.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold">
                          <span
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
                              isPos
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {isPos ? '+' : ''}
                            {c.change24hPercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-300 font-medium">
                          {currency}{(c.marketCap / 1_000_000_000).toFixed(2)}B
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-400">
                          {c.peRatio > 0 ? `${c.peRatio.toFixed(1)}x` : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                          {(c.dividendYield * 100).toFixed(1)}% ({currency}{c.dividend.toFixed(2)})
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              id={`btn-trade-${c.ticker}`}
                              onClick={() => setTradingCompany(c)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
                            >
                              ТОРГОВАТЬ
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">
                Показано {(currentPage - 1) * itemsPerPage + 1}–
                {Math.min(currentPage * itemsPerPage, filteredCompanies.length)} из{' '}
                {filteredCompanies.length.toLocaleString()} компаний
              </span>

              <div className="flex items-center gap-2">
                <button
                  id="btn-pagination-prev"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-slate-300 font-bold px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  id="btn-pagination-next"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed hover:bg-slate-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PORTFOLIO TAB */}
      {activeTab === 'portfolio' && (
        <div className="space-y-5">
          {portfolioSummary.holdingsCount === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-slate-100">Инвестиционный портфель пуст</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Перейдите в котировальный зал или торговый терминал, чтобы приобрести акции ведущих публичных корпораций и начать получать ежедневные дивиденды.
                </p>
              </div>
              <button
                id="btn-goto-catalog"
                onClick={() => setActiveTab('catalog')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-xl shadow-lg transition-colors"
              >
                ОТКРЫТЬ КОТИРОВАЛЬНЫЙ ЗАЛ
              </button>
            </div>
          ) : (
            <>
              {/* Sector Diversification & Allocation */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <PieChart className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-100 font-mono">
                    ОТРАСЛЕВАЯ ДИВЕРСИФИКАЦИЯ ПОРТФЕЛЯ
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {portfolioSummary.sectorAllocation.map((sec) => (
                    <div key={sec.sector} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[11px] text-slate-400 block mb-0.5 truncate">
                        {SECTOR_LABELS_RU[sec.sector]}
                      </span>
                      <div className="font-mono text-base font-black text-slate-100">
                        {currency}{sec.value.toLocaleString()}
                      </div>
                      <div className="text-[11px] font-mono text-blue-400 font-bold">
                        {sec.percent}% портфеля
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Holdings Table */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
                        <th className="py-3 px-4">АКТИВ / ТИКЕР</th>
                        <th className="py-3 px-4 text-right">АКЦИЙ (ШТ)</th>
                        <th className="py-3 px-4 text-right">СРЕДНЯЯ ЦЕНА</th>
                        <th className="py-3 px-4 text-right">ТЕКУЩАЯ ЦЕНА</th>
                        <th className="py-3 px-4 text-right">СТОИМОСТЬ</th>
                        <th className="py-3 px-4 text-right">НЕРЕАЛИЗОВАННЫЙ P/L</th>
                        <th className="py-3 px-4 text-right">ДИВИДЕНДЫ / ГОД</th>
                        <th className="py-3 px-4 text-center">ДЕЙСТВИЯ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {Object.values(holdings)
                        .filter((h) => h.shares > 0)
                        .map((h) => {
                          const comp = stockExchange.getCompany(h.ticker);
                          const currentPrice = comp ? comp.price : h.avgBuyPrice;
                          const posVal = h.shares * currentPrice;
                          const posInvested = h.totalInvested;
                          const posProfit = posVal - posInvested;
                          const posProfitPercent = posInvested > 0 ? (posProfit / posInvested) * 100 : 0;
                          const annualDiv = comp ? h.shares * comp.dividend : 0;

                          return (
                            <tr key={h.ticker} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                    {h.ticker}
                                  </span>
                                  <span className="font-sans font-bold text-slate-100">
                                    {comp?.name || h.ticker}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                                {h.shares.toLocaleString()}
                              </td>
                              <td className="py-3.5 px-4 text-right text-slate-300">
                                {currency}{h.avgBuyPrice.toFixed(2)}
                              </td>
                              <td className="py-3.5 px-4 text-right font-black text-slate-100">
                                {currency}{currentPrice.toFixed(2)}
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold text-slate-100">
                                {currency}{posVal.toLocaleString()}
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold">
                                <span
                                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
                                    posProfit >= 0
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  }`}
                                >
                                  {posProfit >= 0 ? '+' : ''}
                                  {currency}{posProfit.toLocaleString()} ({posProfitPercent.toFixed(2)}%)
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">
                                +{currency}{annualDiv.toFixed(2)}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    id={`btn-portfolio-trade-${h.ticker}`}
                                    onClick={() => {
                                      if (comp) setTradingCompany(comp);
                                    }}
                                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 font-bold rounded-lg text-xs transition-colors"
                                  >
                                    ТОРГОВАТЬ
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 3. TERMINAL TAB */}
      {activeTab === 'terminal' && selectedCompany && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Chart Column */}
          <div className="lg:col-span-2 space-y-5">
            <CompanyPriceChart
              ticker={selectedCompany.ticker}
              name={selectedCompany.name}
              currentPrice={selectedCompany.price}
              previousPrice={selectedCompany.previousPrice}
              priceHistory={selectedCompany.priceHistory}
              currency={currency}
              change24h={selectedCompany.change24h}
              change24hPercent={selectedCompany.change24hPercent}
              dayLow={selectedCompany.dayLow}
              dayHigh={selectedCompany.dayHigh}
              week52Low={selectedCompany.week52Low}
              week52High={selectedCompany.week52High}
            />

            {/* In-Depth Fundamental Multi-Metric Grid */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                ФУНДАМЕНТАЛЬНЫЕ ПОКАЗАТЕЛИ & ФИНАНСОВЫЙ ПРОФИЛЬ
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Капитализация (Cap)</span>
                  <span className="font-mono text-sm font-black text-slate-100">
                    {currency}{(selectedCompany.marketCap / 1_000_000_000).toFixed(2)} млрд
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Годовая выручка (Revenue)</span>
                  <span className="font-mono text-sm font-bold text-slate-200">
                    {currency}{(selectedCompany.revenue / 1_000_000_000).toFixed(2)} млрд
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Чистая прибыль (Profit)</span>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {currency}{(selectedCompany.profit / 1_000_000_000).toFixed(2)} млрд
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Совокупный долг (Debt)</span>
                  <span className="font-mono text-sm font-bold text-rose-400">
                    {currency}{(selectedCompany.debt / 1_000_000_000).toFixed(2)} млрд
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">P/E Мультипликатор</span>
                  <span className="font-mono text-sm font-bold text-slate-100">
                    {selectedCompany.peRatio > 0 ? `${selectedCompany.peRatio.toFixed(1)}x` : '—'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Дивидендная доходность</span>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {(selectedCompany.dividendYield * 100).toFixed(2)}% ({currency}{selectedCompany.dividend.toFixed(2)})
                  </span>
                </div>
              </div>

              {selectedCompany.description && (
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-400 leading-relaxed">
                  <span className="text-slate-300 font-bold block mb-1">Профиль деятельности:</span>
                  {selectedCompany.description}
                </div>
              )}
            </div>
          </div>

          {/* Right Trading & Sentiment Column */}
          <div className="space-y-5">
            {/* Quick Trading Action Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                ОПЕРАЦИИ С АКЦИЯМИ
              </h4>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>В вашем портфеле:</span>
                  <span className="font-bold text-slate-100">
                    {holdings[selectedCompany.ticker]?.shares || 0} шт.
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Средняя цена покупки:</span>
                  <span className="font-bold text-slate-200">
                    {holdings[selectedCompany.ticker]
                      ? `${currency}${holdings[selectedCompany.ticker].avgBuyPrice.toFixed(2)}`
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Доступный кэш:</span>
                  <span className="font-bold text-emerald-400">
                    {currency}{state.cash.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                id="btn-open-terminal-trade"
                onClick={() => setTradingCompany(selectedCompany)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-black rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                ОТКРЫТЬ ТОРГОВЫЙ ОРДЕР
              </button>
            </div>

            {/* AI Competitors & Market Sentiment */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
                  ИНСТИТУЦИОНАЛЬНЫЙ ИИ-СПРОС
                </h4>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Владение AI-фондов:</span>
                  <span className="font-bold text-purple-300">
                    {selectedCompany.aiCompetitorHoldings.toLocaleString()} шт. (
                    {(
                      (selectedCompany.aiCompetitorHoldings / selectedCompany.sharesOutstanding) *
                      100
                    ).toFixed(1)}
                    %)
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Настроения инвесторов:</span>
                  <span
                    className={`font-bold ${
                      selectedCompany.investorSentiment >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {selectedCompany.investorSentiment >= 0 ? 'BULLISH (Позитив)' : 'BEARISH (Давление)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Волатильность (Beta):</span>
                  <span className="font-bold text-slate-200">
                    {(selectedCompany.volatility * 40).toFixed(2)}x
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Switcher of Top Global Giants */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                БЫСТРЫЙ ПЕРЕХОД (ТОП-АКТИВЫ)
              </h4>

              <div className="grid grid-cols-2 gap-1.5">
                {['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'TSLA', 'JPM', 'LLY'].map((sym) => (
                  <button
                    key={sym}
                    id={`btn-quick-switch-${sym}`}
                    onClick={() => setSelectedTicker(sym)}
                    className={`p-2 rounded-xl border text-left font-mono transition-colors flex items-center justify-between ${
                      selectedTicker === sym
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold">{sym}</span>
                    <span className="text-[10px] text-slate-500">
                      {currency}{stockExchange.getCompany(sym)?.price.toFixed(1) || '—'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MACROECONOMIC & REGIMES TAB */}
      {activeTab === 'macro' && (
        <div className="space-y-5">
          {/* Regime Overview Dashboard */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <span className="font-mono text-xs text-blue-400 font-bold uppercase">
                  МАКРОЭКОНОМИЧЕСКИЙ СТАТУС РЫНКА
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-1">
                  Экономические циклы & Динамика индексов
                </h3>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Ключевая ставка ЦБ: </span>
                  <span className="font-bold text-slate-200">{(regimeState.interestRate * 100).toFixed(1)}%</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Инфляция: </span>
                  <span className="font-bold text-slate-200">{(regimeState.inflationRate * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Detailed Explanation of Macro Regimes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  БЫЧИЙ РЫНОК & РАЛЛИ
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Период активного экономического роста, притока ликвидности и экспансии. Технологический сектор и циклические компании показывают опережающий рост котировок.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-rose-400">
                  <TrendingDown className="w-4 h-4" />
                  МЕДВЕЖИЙ РЫНОК & КРИЗИСЫ
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Повышенная волатильность, рост стоимости заимствований и давление на компании с высокой долговой нагрузкой. Лучшую устойчивость демонстрируют здравоохранение и дивидендные защитные секторы.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-blue-400">
                  <Activity className="w-4 h-4" />
                  ПОСТЕПЕННОСТЬ ИМПУЛЬСА
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Смена рыночных фаз формируется постепенно на базе макроэкономического импульса, корпоративных прибылей и действий институциональных ИИ-алгоритмов.
                </p>
              </div>
            </div>

            {/* News Feed Wire */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="font-mono text-xs font-bold text-slate-400 uppercase">
                ЛЕНТА НОВОСТЕЙ & КОРПОРАТИВНЫХ СОБЫТИЙ
              </h4>

              {regimeState.newsFeed.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono">Ожидание публикации свежих аналитических сводок...</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {regimeState.newsFeed.map((news) => (
                    <div
                      key={news.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/10 text-[10px]">
                            {news.ticker}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">День {news.day}</span>
                        </div>
                        <p className="text-slate-200 font-medium">{news.headline}</p>
                      </div>
                      <span
                        className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          news.sentiment === 'bullish'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {news.impactPercent >= 0 ? '+' : ''}{news.impactPercent.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Trades Ledger */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              РЕЕСТР ИСПОЛНЕННЫХ ТОРГОВЫХ СДЕЛОК
            </h3>

            {orderHistory.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-8 text-center">Сделки еще не совершались</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {orderHistory.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                            ord.type === 'BUY'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {ord.type === 'BUY' ? 'ПОКУПКА' : 'ПРОДАЖА'}
                        </span>
                        <span className="font-bold text-slate-200">{ord.ticker}</span>
                        <span className="text-[10px] text-slate-500">День {ord.day}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {ord.shares.toLocaleString()} шт. по {currency}{ord.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-100">{currency}{ord.totalAmount.toLocaleString()}</div>
                      {ord.realizedProfit !== undefined && (
                        <div className={`text-[10px] font-bold ${ord.realizedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          P/L: {ord.realizedProfit >= 0 ? '+' : ''}{currency}{ord.realizedProfit.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dividend Payouts Ledger */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              ИСТОРИЯ ВЫПЛАТ ДИВИДЕНДОВ
            </h3>

            {dividendHistory.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono py-8 text-center">Выплаты дивидендов еще не производились</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {dividendHistory.map((div) => (
                  <div
                    key={div.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                          ДИВИДЕНДЫ
                        </span>
                        <span className="font-bold text-slate-200">{div.ticker}</span>
                        <span className="text-[10px] text-slate-500">День {div.day}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {div.shares.toLocaleString()} шт. ({currency}{div.perShare.toFixed(3)}/акция)
                      </div>
                    </div>
                    <div className="font-black text-emerald-400 text-sm">
                      +{currency}{div.totalAmount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trade Modal */}
      {tradingCompany && (
        <StockTradeModal
          company={tradingCompany}
          holding={holdings[tradingCompany.ticker]}
          playerCash={state.cash}
          currency={currency}
          onClose={() => setTradingCompany(null)}
          showNotification={showNotification}
        />
      )}
    </div>
  );
};
