/**
 * Business Empire: Ultimate
 * Trade Commodity Terminal Modal
 * High-precision buy/sell execution interface with instant margin & PnL calculation,
 * 30-day interactive price curve, inventory metrics, and volume sliders.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Package,
  Layers,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Weight,
  Box,
} from 'lucide-react';
import { MarketCommodity, InventoryItem, GameState } from '../../types/game';
import { goodsMarket } from '../../game/markets/goodsMarket';
import { MarketCommodityChart } from './MarketCommodityChart';

interface TradeCommodityModalProps {
  commodity: MarketCommodity | null;
  gameState: GameState;
  onClose: () => void;
  onTradeSuccess?: (message: string) => void;
}

export const TradeCommodityModal: React.FC<TradeCommodityModalProps> = ({
  commodity,
  gameState,
  onClose,
  onTradeSuccess,
}) => {
  if (!commodity) return null;

  const [mode, setMode] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(
    gameState.warehouses[0]?.id || ''
  );
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Selected warehouse
  const targetWarehouse =
    gameState.warehouses.find((w) => w.id === selectedWarehouseId) || gameState.warehouses[0];
  const requiredVolume = Math.round((commodity.volume || 0.05) * quantity * 100) / 100;
  const requiredWeight = Math.round((commodity.weight || 0.5) * quantity * 10) / 10;

  // Player inventory for this commodity
  const inventoryItem: InventoryItem | undefined = gameState.inventory.find((i) => i.id === commodity.id);
  const ownedQuantity = inventoryItem ? inventoryItem.quantity : 0;
  const avgBuyPrice = inventoryItem ? inventoryItem.avgBuyPrice : 0;

  const currency = gameState.settings.currency || '$';
  const cash = gameState.cash;

  // Max quantities
  const maxBuyQty = Math.max(0, Math.floor(cash / Math.max(0.01, commodity.currentPrice)));
  const maxSellQty = ownedQuantity;

  // Default quantity to 1 or max if 0
  useEffect(() => {
    setFeedback(null);
    if (mode === 'BUY') {
      setQuantity(maxBuyQty > 0 ? 1 : 0);
    } else {
      setQuantity(maxSellQty > 0 ? 1 : 0);
    }
  }, [commodity.id, mode]);

  // Calculations for preview
  const currentPrice = commodity.currentPrice;
  const totalAmount = quantity * currentPrice;

  // SELL mode margin preview
  const costBasis = quantity * avgBuyPrice;
  const potentialProfit = mode === 'SELL' ? totalAmount - costBasis : 0;
  const profitMarginPercent =
    mode === 'SELL' && avgBuyPrice > 0 ? ((currentPrice - avgBuyPrice) / avgBuyPrice) * 100 : 0;

  // BUY mode weighted average preview
  const nextQuantity = ownedQuantity + quantity;
  const nextTotalCost = (inventoryItem ? inventoryItem.totalCost : 0) + totalAmount;
  const nextAvgPrice = nextQuantity > 0 ? nextTotalCost / nextQuantity : currentPrice;

  // Cash balance after
  const cashAfter = mode === 'BUY' ? cash - totalAmount : cash + totalAmount;

  // Demand / Supply status
  const demandRatio = commodity.demand / Math.max(0.1, commodity.supply);
  let marketStatusText = 'Баланс';
  let marketStatusColor = 'text-slate-400 bg-slate-800/60 border-slate-700';

  if (demandRatio > 1.3) {
    marketStatusText = 'Острый дефицит (Спрос высокий)';
    marketStatusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  } else if (demandRatio > 1.1) {
    marketStatusText = 'Умеренный спрос';
    marketStatusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  } else if (demandRatio < 0.75) {
    marketStatusText = 'Избыток предложения (Профицит)';
    marketStatusColor = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  }

  const handleQuickPercent = (pct: number) => {
    if (mode === 'BUY') {
      const target = Math.floor(maxBuyQty * pct);
      setQuantity(Math.max(0, target));
    } else {
      const target = Math.floor(maxSellQty * pct);
      setQuantity(Math.max(0, target));
    }
  };

  const handleIncrement = (delta: number) => {
    const next = Math.max(0, quantity + delta);
    const limit = mode === 'BUY' ? maxBuyQty : maxSellQty;
    setQuantity(Math.min(limit, next));
  };

  const handleExecute = () => {
    setFeedback(null);
    if (quantity <= 0) {
      setFeedback({ type: 'error', text: 'Укажите количество больше 0' });
      return;
    }

    if (mode === 'BUY') {
      const res = goodsMarket.buyCommodity(commodity.id, quantity, selectedWarehouseId);
      if (res.success) {
        setFeedback({ type: 'success', text: res.message });
        if (onTradeSuccess) onTradeSuccess(res.message);
        setTimeout(() => {
          onClose();
        }, 1100);
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } else {
      const res = goodsMarket.sellCommodity(commodity.id, quantity, selectedWarehouseId);
      if (res.success) {
        setFeedback({ type: 'success', text: res.message });
        if (onTradeSuccess) onTradeSuccess(res.message);
        setTimeout(() => {
          onClose();
        }, 1100);
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{commodity.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700">
                  {commodity.quality}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Категория: <span className="text-slate-200">{commodity.category}</span> • Ед. изм.:{' '}
                <span className="text-slate-200">{commodity.unit}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left Column: Analytics & Chart (7 cols) */}
          <div className="lg:col-span-7 p-5 space-y-4">
            {/* Price Key Numbers Banner */}
            <div className="flex flex-wrap items-end justify-between gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <div>
                <span className="text-xs font-medium text-slate-400">ТЕКУЩАЯ ЦЕНА БИРЖИ</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                    {currency}
                    {commodity.currentPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400">/ {commodity.unit}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-1 font-mono text-sm font-bold px-2.5 py-1 rounded-lg ${
                    commodity.change24h >= 0
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {commodity.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>
                    {commodity.change24h >= 0 ? '+' : ''}
                    {commodity.change24h.toFixed(2)}% (24ч)
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive 30-Day Canvas Chart */}
            <MarketCommodityChart
              commodity={commodity}
              avgBuyPrice={avgBuyPrice > 0 ? avgBuyPrice : undefined}
              currency={currency}
              height={190}
            />

            {/* Market Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Базовая цена</span>
                <span className="font-mono font-semibold text-slate-200 text-sm">
                  {currency}
                  {commodity.basePrice.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Спрос / Предл.</span>
                <span className="font-mono font-semibold text-slate-200 text-sm">
                  {commodity.demand.toFixed(2)} / {commodity.supply.toFixed(2)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Волатильность</span>
                <span className="font-mono font-semibold text-slate-200 text-sm">
                  {(commodity.volatility * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Вес / Объем</span>
                <span className="font-mono font-semibold text-slate-200 text-sm">
                  {commodity.weight} кг • {commodity.volume} м³
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Хранение</span>
                <span className="font-mono font-semibold text-slate-200 text-sm">
                  {currency}
                  {commodity.storageCost}/сут
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Статус рынка</span>
                <span className={`text-[11px] font-semibold truncate block ${marketStatusColor.split(' ')[0]}`}>
                  {marketStatusText.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* User Owned Position Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-amber-400" />
                  Ваша позиция на складе:
                </span>
                <span className="font-mono text-white font-bold">
                  {ownedQuantity.toLocaleString()} {commodity.unit}
                </span>
              </div>

              {ownedQuantity > 0 ? (
                <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-2 border-t border-slate-800/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Ср. цена покупки</span>
                    <span className="text-slate-200 font-bold">
                      {currency}
                      {avgBuyPrice.toFixed(avgBuyPrice < 10 ? 2 : 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Стоимость</span>
                    <span className="text-slate-200 font-bold">
                      {currency}
                      {(ownedQuantity * currentPrice).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Нереализ. PnL</span>
                    <span
                      className={`font-bold ${
                        currentPrice >= avgBuyPrice ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {currentPrice >= avgBuyPrice ? '+' : ''}
                      {currency}
                      {Math.round(ownedQuantity * (currentPrice - avgBuyPrice)).toLocaleString()} (
                      {(((currentPrice - avgBuyPrice) / Math.max(0.01, avgBuyPrice)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Товар отсутствует на вашем складе</p>
              )}
            </div>
          </div>

          {/* Right Column: Execution Form (5 cols) */}
          <div className="lg:col-span-5 p-5 flex flex-col justify-between space-y-4 bg-slate-900/50">
            <div className="space-y-4">
              {/* Buy / Sell Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setMode('BUY')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    mode === 'BUY'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ПОКУПКА (BUY)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('SELL')}
                  disabled={ownedQuantity <= 0}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    mode === 'SELL'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                      : ownedQuantity <= 0
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ПРОДАЖА (SELL)
                </button>
              </div>

              {/* Quantity Selector Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-300">Количество ({commodity.unit}):</label>
                  <span className="font-mono text-slate-400 text-[11px]">
                    Доступно:{' '}
                    <span className="text-white font-bold">
                      {mode === 'BUY' ? maxBuyQty.toLocaleString() : maxSellQty.toLocaleString()} {commodity.unit}
                    </span>
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={mode === 'BUY' ? maxBuyQty : maxSellQty}
                    value={quantity || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const limit = mode === 'BUY' ? maxBuyQty : maxSellQty;
                      if (isNaN(val)) setQuantity(0);
                      else setQuantity(Math.max(0, Math.min(limit, val)));
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                    {commodity.unit}
                  </span>
                </div>

                {/* Quick Increment Buttons */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[1, 10, 50, 100].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => handleIncrement(step)}
                      className="py-1 px-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-200 border border-slate-700/60 transition-colors"
                    >
                      +{step}
                    </button>
                  ))}
                </div>

                {/* Percentage Shortcuts */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: '25%', val: 0.25 },
                    { label: '50%', val: 0.5 },
                    { label: '75%', val: 0.75 },
                    { label: 'МАКС', val: 1.0 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleQuickPercent(p.val)}
                      className="py-1 px-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] font-mono font-semibold text-amber-400 border border-amber-500/20 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination Warehouse Selection */}
              {gameState.warehouses.length > 0 && (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-300">Склад размещения:</label>
                    <span className="font-mono text-amber-400 text-[11px]">
                      Свободно:{' '}
                      {(
                        targetWarehouse.capacity -
                        (targetWarehouse.usedCapacity || 0)
                      ).toFixed(1)}{' '}
                      м³
                    </span>
                  </div>
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  >
                    {gameState.warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.location} - LVL {w.level})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Deal Calculations Preview Box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Сумма сделки:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {currency}
                    {totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>Объём / Вес партии:</span>
                  <span className="font-mono text-amber-300">
                    {requiredVolume} м³ / {requiredWeight} кг
                  </span>
                </div>

                {mode === 'BUY' && (
                  <>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Ср. цена после покупки:</span>
                      <span className="font-mono text-slate-200">
                        {currency}
                        {nextAvgPrice.toFixed(nextAvgPrice < 10 ? 2 : 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Остаток наличных:</span>
                      <span className="font-mono text-slate-200">
                        {currency}
                        {Math.max(0, cashAfter).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}

                {mode === 'SELL' && (
                  <>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Себестоимость партии:</span>
                      <span className="font-mono text-slate-200">
                        {currency}
                        {Math.round(costBasis).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Расчетная прибыль (PnL):</span>
                      <span
                        className={`font-mono font-bold ${
                          potentialProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {potentialProfit >= 0 ? '+' : ''}
                        {currency}
                        {Math.round(potentialProfit).toLocaleString()} ({profitMarginPercent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Наличные после продажи:</span>
                      <span className="font-mono text-slate-200">
                        {currency}
                        {cashAfter.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Feedback Alert */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                      feedback.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {feedback.type === 'success' ? (
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    )}
                    <span>{feedback.text}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Execution Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExecute}
                disabled={quantity <= 0 || (mode === 'BUY' && totalAmount > cash) || (mode === 'SELL' && quantity > ownedQuantity)}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  mode === 'BUY'
                    ? 'bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 shadow-emerald-900/20'
                    : 'bg-rose-500 hover:bg-rose-400 disabled:bg-slate-800 disabled:text-slate-500 text-white shadow-rose-900/20'
                }`}
              >
                {mode === 'BUY' ? (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>
                      Купить {quantity} {commodity.unit} за {currency}
                      {totalAmount.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    <span>
                      Продать {quantity} {commodity.unit} за {currency}
                      {totalAmount.toLocaleString()}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
