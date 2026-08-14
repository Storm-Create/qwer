/**
 * Business Empire: Ultimate
 * Main Commodity & Goods Trading Terminal View
 * High-performance UI rendering 1000+ items with category filtering,
 * inventory valuation, market analytics, and instant trading modal.
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Package,
  Boxes,
  History,
  BarChart3,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Info,
  DollarSign,
  Layers,
} from 'lucide-react';
import {
  GameState,
  MarketCommodity,
  CommodityCategory,
  CommodityQuality,
  InventoryItem,
} from '../../types/game';
import { goodsMarket } from '../../game/markets/goodsMarket';
import { TradeCommodityModal } from './TradeCommodityModal';
import { TradeHistoryTable } from './TradeHistoryTable';

const ALL_CATEGORIES: Array<{ id: CommodityCategory | 'ALL'; name: string }> = [
  { id: 'ALL', name: 'Все категории' },
  { id: 'Продукты', name: 'Продукты' },
  { id: 'Напитки', name: 'Напитки' },
  { id: 'Одежда', name: 'Одежда' },
  { id: 'Обувь', name: 'Обувь' },
  { id: 'Электроника', name: 'Электроника' },
  { id: 'Смартфоны', name: 'Смартфоны' },
  { id: 'Компьютеры', name: 'Компьютеры' },
  { id: 'Комплектующие', name: 'Комплектующие' },
  { id: 'Бытовая техника', name: 'Бытовая техника' },
  { id: 'Мебель', name: 'Мебель' },
  { id: 'Стройматериалы', name: 'Стройматериалы' },
  { id: 'Инструменты', name: 'Инструменты' },
  { id: 'Автозапчасти', name: 'Автозапчасти' },
  { id: 'Шины', name: 'Шины' },
  { id: 'Масла', name: 'Масла' },
  { id: 'Металлы', name: 'Металлы' },
  { id: 'Нефть', name: 'Нефть' },
  { id: 'Пластик', name: 'Пластик' },
  { id: 'Древесина', name: 'Древесина' },
  { id: 'Хлопок', name: 'Хлопок' },
  { id: 'Зерно', name: 'Зерно' },
];

const QUALITIES: Array<CommodityQuality | 'ALL'> = [
  'ALL',
  'Оригинал',
  'Премиум',
  'Стандарт',
  'Эконом',
  'OEM',
  'Китай',
  'Промышленный',
  'Люкс',
];

interface GoodsMarketViewProps {
  gameState: GameState;
}

export const GoodsMarketView: React.FC<GoodsMarketViewProps> = ({ gameState }) => {
  const [activeTab, setActiveTab] = useState<'MARKET' | 'INVENTORY' | 'HISTORY' | 'ANALYTICS'>('MARKET');
  const [selectedCategory, setSelectedCategory] = useState<CommodityCategory | 'ALL'>('ALL');
  const [selectedQuality, setSelectedQuality] = useState<CommodityQuality | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'change_desc' | 'change_asc' | 'demand_desc' | 'name' | 'owned_desc'>('change_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [tradingCommodity, setTradingCommodity] = useState<MarketCommodity | null>(null);

  const currency = gameState.settings.currency || '$';
  const commodities = goodsMarket.getCommodities();

  // Create fast lookup map for owned inventory
  const inventoryMap = useMemo(() => {
    const map = new Map<string, InventoryItem>();
    for (const item of gameState.inventory) {
      map.set(item.id, item);
    }
    return map;
  }, [gameState.inventory]);

  // Total Portfolio Calculations
  const portfolioStats = useMemo(() => {
    let totalValue = 0;
    let totalInvested = 0;

    for (const item of gameState.inventory) {
      const live = commodities.find((c) => c.id === item.id);
      const currentPrice = live ? live.currentPrice : item.currentMarketPrice;
      totalValue += item.quantity * currentPrice;
      totalInvested += item.totalCost;
    }

    const unrealizedPnL = totalValue - totalInvested;
    const unrealizedPercent = totalInvested > 0 ? (unrealizedPnL / totalInvested) * 100 : 0;

    return {
      totalValue: Math.round(totalValue),
      totalInvested: Math.round(totalInvested),
      unrealizedPnL: Math.round(unrealizedPnL),
      unrealizedPercent: Math.round(unrealizedPercent * 10) / 10,
      uniquePositions: gameState.inventory.length,
    };
  }, [gameState.inventory, commodities]);

  // Filtered & Sorted Commodities
  const filteredCommodities = useMemo(() => {
    let list = [...commodities];

    // If INVENTORY tab, only show owned items
    if (activeTab === 'INVENTORY') {
      list = list.filter((c) => inventoryMap.has(c.id) && (inventoryMap.get(c.id)?.quantity || 0) > 0);
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      list = list.filter((c) => c.category === selectedCategory);
    }

    // Quality filter
    if (selectedQuality !== 'ALL') {
      list = list.filter((c) => c.quality === selectedQuality);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.quality.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      switch (sortBy) {
        case 'price_desc':
          return b.currentPrice - a.currentPrice;
        case 'price_asc':
          return a.currentPrice - b.currentPrice;
        case 'change_desc':
          return b.change24h - a.change24h;
        case 'change_asc':
          return a.change24h - b.change24h;
        case 'demand_desc':
          return b.demand / Math.max(0.1, b.supply) - a.demand / Math.max(0.1, a.supply);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'owned_desc': {
          const aQty = inventoryMap.get(a.id)?.quantity || 0;
          const bQty = inventoryMap.get(b.id)?.quantity || 0;
          return bQty - aQty;
        }
        default:
          return 0;
      }
    });

    return list;
  }, [commodities, activeTab, selectedCategory, selectedQuality, searchQuery, sortBy, inventoryMap]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredCommodities.length / itemsPerPage));
  const paginatedCommodities = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCommodities.slice(start, start + itemsPerPage);
  }, [filteredCommodities, currentPage]);

  const analytics = useMemo(() => goodsMarket.getMarketAnalytics(), [commodities]);

  return (
    <div className="space-y-6">
      {/* Portfolio Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Стоимость портфеля</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {currency}
            {portfolioStats.totalValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {portfolioStats.uniquePositions} поз. на складе
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Нереализованный PnL</span>
            {portfolioStats.unrealizedPnL >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              portfolioStats.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {portfolioStats.unrealizedPnL >= 0 ? '+' : ''}
            {currency}
            {portfolioStats.unrealizedPnL.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {portfolioStats.unrealizedPercent >= 0 ? '+' : ''}
            {portfolioStats.unrealizedPercent}% доходность
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Свободная ликвидность</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {currency}
            {gameState.cash.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Готово к сделкам</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Зафиксированная прибыль</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              (gameState.statistics.totalTradeProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {(gameState.statistics.totalTradeProfit || 0) >= 0 ? '+' : ''}
            {currency}
            {(gameState.statistics.totalTradeProfit || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Сделок: {gameState.statistics.tradesExecuted || 0}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Каталог биржи</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {commodities.length.toLocaleString()} товаров
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">21 товарная категория</div>
        </div>
      </div>

      {/* Main Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'MARKET', label: 'Биржа товаров', icon: ShoppingBag, count: commodities.length },
            {
              id: 'INVENTORY',
              label: 'Мой склад',
              icon: Boxes,
              count: portfolioStats.uniquePositions,
            },
            {
              id: 'HISTORY',
              label: 'История сделок',
              icon: History,
              count: gameState.tradeHistory.length,
            },
            { id: 'ANALYTICS', label: 'Аналитика и тренды', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW: TRADE HISTORY LEDGER */}
      {activeTab === 'HISTORY' && (
        <TradeHistoryTable tradeHistory={gameState.tradeHistory} settings={gameState.settings} />
      )}

      {/* VIEW: ANALYTICS & MARKET INTELLIGENCE */}
      {activeTab === 'ANALYTICS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Лидеры роста (24ч)
              </h3>
              <span className="text-xs text-slate-400 font-mono">Топ-8</span>
            </div>
            <div className="space-y-2">
              {analytics.topGainers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setTradingCommodity(c)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-white truncate max-w-[260px]">{c.name}</div>
                    <div className="text-[10px] text-slate-400">{c.category}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-white">
                      {currency}
                      {c.currentPrice.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-400">+{c.change24h.toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                Лидеры падения (Возможности для закупки)
              </h3>
              <span className="text-xs text-slate-400 font-mono">Топ-8</span>
            </div>
            <div className="space-y-2">
              {analytics.topLosers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setTradingCommodity(c)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-white truncate max-w-[260px]">{c.name}</div>
                    <div className="text-[10px] text-slate-400">{c.category}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-white">
                      {currency}
                      {c.currentPrice.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-bold text-rose-400">{c.change24h.toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High Demand / Deficit Items */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Товары с острым дефицитом (Высокий спрос)
              </h3>
              <span className="text-xs text-slate-400 font-mono">Топ спроса</span>
            </div>
            <div className="space-y-2">
              {analytics.highDemand.map((c) => {
                const ratio = c.demand / Math.max(0.1, c.supply);
                return (
                  <div
                    key={c.id}
                    onClick={() => setTradingCommodity(c)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white truncate max-w-[260px]">{c.name}</div>
                      <div className="text-[10px] text-amber-400/90">
                        Спрос {c.demand.toFixed(2)} / Предл. {c.supply.toFixed(2)} (Коэфф: {ratio.toFixed(2)}x)
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-white">
                        {currency}
                        {c.currentPrice.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400">/{c.unit}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deep Discount Below Base Price */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-sky-400" />
                Скидка &gt;15% от базовой цены
              </h3>
              <span className="text-xs text-slate-400 font-mono">Выгодный вход</span>
            </div>
            <div className="space-y-2">
              {analytics.highestMarginOpportunities.map((item) => (
                <div
                  key={item.commodity.id}
                  onClick={() => setTradingCommodity(item.commodity)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-white truncate max-w-[260px]">
                      {item.commodity.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Базовая: {currency}
                      {item.commodity.basePrice.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-emerald-400">
                      {currency}
                      {item.commodity.currentPrice.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-500">
                      Скидка -{item.discountPercent}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: MAIN MARKET TABLE (MARKET & INVENTORY TABS) */}
      {(activeTab === 'MARKET' || activeTab === 'INVENTORY') && (
        <div className="space-y-4">
          {/* Categories Horizontal Scroll Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {ALL_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Search, Quality & Sort Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Поиск по названию, категории или спецификации..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Quality Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedQuality}
                onChange={(e) => {
                  setSelectedQuality(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">Любое качество (Все)</option>
                {QUALITIES.filter((q) => q !== 'ALL').map((q) => (
                  <option key={q} value={q}>
                    Качество: {q}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="sm:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="change_desc">Сортировка: Рост цены (+%)</option>
                <option value="change_asc">Сортировка: Падение цены (-%)</option>
                <option value="price_desc">Сортировка: Цена (макс)</option>
                <option value="price_asc">Сортировка: Цена (мин)</option>
                <option value="demand_desc">Сортировка: Высокий спрос</option>
                <option value="owned_desc">Сортировка: В наличии на складе</option>
                <option value="name">Сортировка: По названию (А-Я)</option>
              </select>
            </div>
          </div>

          {/* Commodities Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
            {paginatedCommodities.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <Package className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                <p className="text-sm font-semibold text-white">Товары не найдены</p>
                <p className="text-xs text-slate-500 mt-1">
                  {activeTab === 'INVENTORY'
                    ? 'Ваш склад пока пуст. Приобретите товары во вкладке «Биржа товаров»'
                    : 'Попробуйте сбросить фильтры поиска'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">Товар / Спецификация</th>
                      <th className="py-3.5 px-4 text-right">Текущая цена</th>
                      <th className="py-3.5 px-4 text-right">24ч Изменение</th>
                      <th className="py-3.5 px-4 text-center">Рынок (Спрос/Предл)</th>
                      <th className="py-3.5 px-4 text-right">В наличии</th>
                      <th className="py-3.5 px-4 text-right">Ср. закупка / PnL</th>
                      <th className="py-3.5 px-4 text-center">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {paginatedCommodities.map((item) => {
                      const owned = inventoryMap.get(item.id);
                      const ownedQty = owned ? owned.quantity : 0;
                      const avgBuy = owned ? owned.avgBuyPrice : 0;
                      const pnl = owned ? (item.currentPrice - avgBuy) * ownedQty : 0;
                      const marginPct = owned && avgBuy > 0 ? ((item.currentPrice - avgBuy) / avgBuy) * 100 : 0;

                      const demandRatio = item.demand / Math.max(0.1, item.supply);

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                          onClick={() => setTradingCommodity(item)}
                        >
                          {/* Item Name and Meta */}
                          <td className="py-3 px-4 font-sans">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white text-xs group-hover:text-amber-400 transition-colors">
                                {item.name}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {item.quality}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {item.category} • Базовая: {currency}
                              {item.basePrice.toLocaleString()}
                            </div>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4 text-right">
                            <div className="font-bold text-white text-sm">
                              {currency}
                              {item.currentPrice.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-400">/{item.unit}</div>
                          </td>

                          {/* 24h Change */}
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-bold text-xs ${
                                item.change24h >= 0
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {item.change24h >= 0 ? '+' : ''}
                              {item.change24h.toFixed(2)}%
                            </span>
                          </td>

                          {/* Demand / Supply Status */}
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5 text-[11px]">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  demandRatio > 1.25
                                    ? 'bg-amber-400 animate-pulse'
                                    : demandRatio < 0.8
                                    ? 'bg-blue-400'
                                    : 'bg-slate-400'
                                }`}
                              />
                              <span className="text-slate-300 font-sans">
                                {item.demand.toFixed(2)} / {item.supply.toFixed(2)}
                              </span>
                            </div>
                          </td>

                          {/* In Stock */}
                          <td className="py-3 px-4 text-right">
                            {ownedQty > 0 ? (
                              <span className="font-bold text-amber-400">
                                {ownedQty.toLocaleString()} {item.unit}
                              </span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>

                          {/* Avg Buy & PnL */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            {ownedQty > 0 ? (
                              <div>
                                <div className="text-slate-300 text-xs">
                                  {currency}
                                  {avgBuy.toFixed(avgBuy < 10 ? 2 : 0)}
                                </div>
                                <div
                                  className={`text-[10px] font-bold ${
                                    pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                  }`}
                                >
                                  {pnl >= 0 ? '+' : ''}
                                  {currency}
                                  {Math.round(pnl).toLocaleString()} ({marginPct >= 0 ? '+' : ''}
                                  {marginPct.toFixed(1)}%)
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>

                          {/* Trade Button */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTradingCommodity(item);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold font-sans text-xs border border-amber-500/30 transition-all"
                            >
                              Торговать
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/60 text-xs">
                <span className="text-slate-400 font-mono">
                  Показано {paginatedCommodities.length} из {filteredCommodities.length} позиций (Стр.{' '}
                  {currentPage} из {totalPages})
                </span>

                <div className="flex items-center gap-1.5 font-mono">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5) {
                        if (currentPage > 3) pageNum = currentPage - 2 + i;
                        if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                            currentPage === pageNum
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Trading Terminal Modal */}
      {tradingCommodity && (
        <TradeCommodityModal
          commodity={tradingCommodity}
          gameState={gameState}
          onClose={() => setTradingCommodity(null)}
        />
      )}
    </div>
  );
};
