/**
 * Business Empire: Ultimate
 * Modal: Product Pricing, Markup & Auto-Supply Settings
 */

import React, { useState } from 'react';
import { X, Tag, Sliders, DollarSign, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { gameState } from '../../game/gameState';
import { retailManager } from '../../game/business/retailManager';
import { RetailStore, StoreProductItem } from '../../types/retail';
import { RETAIL_STORE_TEMPLATES } from '../../game/business/retailCatalog';

interface ProductPricingModalProps {
  store: RetailStore;
  product: StoreProductItem;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const ProductPricingModal: React.FC<ProductPricingModalProps> = ({
  store,
  product,
  onClose,
  onSuccess,
}) => {
  const state = gameState.getState();
  const currency = state.settings.currency || '$';
  const template = RETAIL_STORE_TEMPLATES[store.type];
  const expectedMarkup = template ? template.baseMarginExpected : 40;

  const [sellingPrice, setSellingPrice] = useState<number>(product.sellingPrice || Math.round(product.avgCostPrice * 1.4));
  const [discountPercent, setDiscountPercent] = useState<number>(product.discountPercent || 0);

  // Auto-Supply states
  const [autoSupplyEnabled, setAutoSupplyEnabled] = useState<boolean>(product.autoSupply?.enabled || false);
  const [sourceWarehouseId, setSourceWarehouseId] = useState<string>(
    product.autoSupply?.sourceWarehouseId || state.warehouses[0]?.id || ''
  );
  const [minThreshold, setMinThreshold] = useState<number>(product.autoSupply?.minThreshold || 25);
  const [batchQuantity, setBatchQuantity] = useState<number>(product.autoSupply?.batchQuantity || 50);

  const cost = product.avgCostPrice || 10;
  const effectivePrice = Math.round(sellingPrice * (1 - discountPercent / 100));
  const unitProfit = effectivePrice - cost;
  const currentMarkup = Math.round(((effectivePrice - cost) / cost) * 100);

  // Projected conversion estimate
  let demandSentiment = 'Оптимальная цена (высокий поток)';
  let sentimentColor = 'text-emerald-400';
  if (currentMarkup <= expectedMarkup * 0.7) {
    demandSentiment = 'Демпинг / Распродажа (мгновенный смет, низкая маржа)';
    sentimentColor = 'text-cyan-400';
  } else if (currentMarkup <= expectedMarkup * 1.1) {
    demandSentiment = 'Сбалансированная рыночная цена (отличный спрос)';
    sentimentColor = 'text-emerald-400';
  } else if (currentMarkup <= expectedMarkup * 1.6) {
    demandSentiment = 'Повышенная наценка (умеренный спрос, высокая прибыль с единицы)';
    sentimentColor = 'text-amber-400';
  } else {
    demandSentiment = 'Завышенная цена (покупатели могут уходить без покупки)';
    sentimentColor = 'text-rose-400';
  }

  const handleSave = () => {
    retailManager.updateProductPricing(store.id, product.commodityId, sellingPrice, discountPercent);
    retailManager.configureAutoSupply(store.id, product.commodityId, {
      enabled: autoSupplyEnabled,
      sourceWarehouseId,
      minThreshold,
      batchQuantity,
    });
    onSuccess(`Параметры для "${product.name}" успешно обновлены!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                ЦЕНООБРАЗОВАНИЕ & АВТОПОСТАВКА
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-[240px]">{product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Controls */}
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-400">Себестоимость:</div>
              <div className="font-bold text-slate-300">{currency}{cost}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Розничная цена:</div>
              <div className="font-bold text-emerald-400">{currency}{effectivePrice}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Прибыль/ед:</div>
              <div className={`font-bold ${unitProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {unitProfit >= 0 ? '+' : ''}{currency}{unitProfit}
              </div>
            </div>
          </div>

          {/* Selling Price Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Розничная цена ценника:</span>
              <span className="font-bold text-slate-100">{currency}{sellingPrice}</span>
            </div>
            <input
              type="range"
              min={Math.max(1, Math.round(cost * 0.5))}
              max={Math.round(cost * 4)}
              value={sellingPrice}
              onChange={(e) => setSellingPrice(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>{currency}{Math.max(1, Math.round(cost * 0.5))}</span>
              <span>Базовая наценка ниши: +{expectedMarkup}%</span>
              <span>{currency}{Math.round(cost * 4)}</span>
            </div>
          </div>

          {/* Promotional Discount Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Временная скидка (Акция):</span>
              <span className={`font-bold ${discountPercent > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {discountPercent}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={70}
              step={5}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
            />
          </div>

          {/* Demand Prediction Box */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs">
            <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">
              Прогноз реакции покупателей:
            </div>
            <div className={`font-medium ${sentimentColor}`}>
              Наценка: {currentMarkup}% — {demandSentiment}
            </div>
          </div>

          {/* Auto-Supply Section */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${autoSupplyEnabled ? 'text-cyan-400 animate-spin-slow' : 'text-slate-500'}`} />
                <span className="text-xs font-bold text-slate-200 font-mono">АВТО-ПОСТАВКА СО СКЛАДА</span>
              </div>
              <input
                type="checkbox"
                checked={autoSupplyEnabled}
                onChange={(e) => setAutoSupplyEnabled(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>

            {autoSupplyEnabled && (
              <div className="space-y-2.5 pt-1 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-mono">Склад-источник:</label>
                  <select
                    value={sourceWarehouseId}
                    onChange={(e) => setSourceWarehouseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                  >
                    {state.warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Порог заказа (остаток &lt;):</label>
                    <input
                      type="number"
                      value={minThreshold}
                      onChange={(e) => setMinThreshold(Math.max(1, parseInt(e.target.value || '1', 10)))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Партия пополнения (ед.):</label>
                    <input
                      type="number"
                      value={batchQuantity}
                      onChange={(e) => setBatchQuantity(Math.max(1, parseInt(e.target.value || '1', 10)))}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSave}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Применить изменения</span>
        </button>
      </div>
    </div>
  );
};
