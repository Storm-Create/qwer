/**
 * Business Empire: Ultimate
 * Modal: Direct Purchase from Wholesale Market to Store
 */

import React, { useState } from 'react';
import { X, ShoppingBag, ArrowRight, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import { gameState } from '../../game/gameState';
import { goodsMarket } from '../../game/markets/goodsMarket';
import { retailManager } from '../../game/business/retailManager';
import { RetailStore } from '../../types/retail';
import { RETAIL_STORE_TEMPLATES } from '../../game/business/retailCatalog';
import { CommodityCategory, MarketCommodity } from '../../types/game';

interface DirectBuyModalProps {
  store: RetailStore;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const DirectBuyModal: React.FC<DirectBuyModalProps> = ({
  store,
  onClose,
  onSuccess,
}) => {
  const state = gameState.getState();
  const currency = state.settings.currency || '$';
  const template = RETAIL_STORE_TEMPLATES[store.type];
  const allCommodities = goodsMarket.getCommodities();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(50);
  const [error, setError] = useState<string | null>(null);

  // Filter commodities relevant to store or matching search
  const filteredCommodities = allCommodities.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all'
        ? template.supportedCategories.includes(c.category)
        : c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedCommodity = allCommodities.find((c) => c.id === selectedCommodityId);
  const totalCost = selectedCommodity ? Math.round(selectedCommodity.currentPrice * quantity) : 0;
  const itemVolume = selectedCommodity ? selectedCommodity.volume * quantity : 0;
  const maxCapacity = store.shelvesVolumeCapacity + store.backroomVolumeCapacity;
  const remainingCapacity = Math.max(0, maxCapacity - store.usedVolume);

  const handlePurchase = () => {
    if (!selectedCommodityId || quantity <= 0) {
      setError('Выберите товар и укажите объем закупки.');
      return;
    }

    const res = retailManager.directPurchaseToStore(store.id, selectedCommodityId, quantity);
    if (res.success) {
      onSuccess(res.message);
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                ПРЯМАЯ ЗАКУПКА В МАГАЗИН С БИРЖИ
              </h3>
              <p className="text-xs text-slate-400">
                Магазин: <span className="text-slate-200 font-semibold">{store.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Поиск товара..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">Профиль магазина</option>
              {template.supportedCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Commodity list scroll */}
          <div className="max-h-48 overflow-y-auto rounded-2xl bg-slate-950/80 border border-slate-800/80 p-1.5 space-y-1">
            {filteredCommodities.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 font-mono">
                Товары не найдены
              </div>
            ) : (
              filteredCommodities.map((c) => {
                const isSelected = c.id === selectedCommodityId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCommodityId(c.id);
                      setError(null);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left text-xs flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                        : 'hover:bg-slate-900 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-100">{c.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {c.category} • {c.quality} • {c.volume}м³/ед.
                      </div>
                    </div>
                    <div className="font-mono font-bold text-cyan-400">
                      {currency}{c.currentPrice} / {c.unit}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Quantity & Calculations */}
        {selectedCommodity && (
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Количество для закупки:</span>
                <span className="font-bold text-slate-100">
                  {quantity} {selectedCommodity.unit}
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={500}
                step={5}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
              />
              <div className="flex gap-2">
                {[20, 50, 100, 200, 400].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setQuantity(v)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-all"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Итоговая стоимость партии:</span>
                <span className="text-cyan-400 font-bold">
                  {currency}{totalCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Объем груза:</span>
                <span className="text-slate-200 font-bold">{itemVolume.toFixed(2)} м³</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Свободно места в магазине:</span>
                <span
                  className={`font-bold ${
                    itemVolume > remainingCapacity ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {remainingCapacity.toFixed(2)} м³
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handlePurchase}
          disabled={!selectedCommodity || totalCost > state.cash || itemVolume > remainingCapacity}
          className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            !selectedCommodity || totalCost > state.cash || itemVolume > remainingCapacity
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/10'
          }`}
        >
          <span>Оплатить и доставить в магазин</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
