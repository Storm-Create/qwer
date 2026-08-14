/**
 * Business Empire: Ultimate
 * Modal: Transfer Goods from Warehouse to Retail Store
 */

import React, { useState } from 'react';
import { X, Boxes, ArrowRight, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { gameState } from '../../game/gameState';
import { retailManager } from '../../game/business/retailManager';
import { RetailStore } from '../../types/retail';
import { Warehouse, InventoryItem } from '../../types/game';
import { RETAIL_STORE_TEMPLATES } from '../../game/business/retailCatalog';

interface TransferFromWarehouseModalProps {
  store: RetailStore;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const TransferFromWarehouseModal: React.FC<TransferFromWarehouseModalProps> = ({
  store,
  onClose,
  onSuccess,
}) => {
  const state = gameState.getState();
  const warehouses = state.warehouses.filter((w) => w.inventory.length > 0);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(
    warehouses[0]?.id || state.warehouses[0]?.id || ''
  );
  const selectedWarehouse = state.warehouses.find((w) => w.id === selectedWarehouseId);
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>(
    selectedWarehouse?.inventory[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(50);
  const [error, setError] = useState<string | null>(null);

  const selectedItem = selectedWarehouse?.inventory.find((i) => i.id === selectedCommodityId);
  const storeTemplate = RETAIL_STORE_TEMPLATES[store.type];
  const maxCapacity = store.shelvesVolumeCapacity + store.backroomVolumeCapacity;
  const remainingCapacity = Math.max(0, maxCapacity - store.usedVolume);

  const itemVolume = selectedItem ? selectedItem.volume * quantity : 0;
  const isCategorySupported = selectedItem
    ? storeTemplate.supportedCategories.includes(selectedItem.category)
    : false;

  const handleTransfer = () => {
    if (!selectedWarehouseId || !selectedCommodityId || quantity <= 0) {
      setError('Выберите склад, товар и укажите корректное количество.');
      return;
    }

    const res = retailManager.transferGoodsFromWarehouse(
      store.id,
      selectedWarehouseId,
      selectedCommodityId,
      quantity
    );

    if (res.success) {
      onSuccess(res.message);
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                ПОСТАВКА СО СКЛАДА В МАГАЗИН
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

        {warehouses.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-2">
            <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto opacity-80" />
            <div className="text-xs font-bold text-slate-200 font-mono">
              НЕТ ДОСТУПНЫХ ТОВАРОВ НА СКЛАДАХ
            </div>
            <p className="text-[11px] text-slate-400">
              Закупите товары на бирже во вкладке «Рынок товаров» или оформите прямую закупку с доставкой в магазин.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Source Warehouse Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                1. Исходный склад:
              </label>
              <select
                value={selectedWarehouseId}
                onChange={(e) => {
                  setSelectedWarehouseId(e.target.value);
                  const wh = state.warehouses.find((w) => w.id === e.target.value);
                  setSelectedCommodityId(wh?.inventory[0]?.id || '');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-100 focus:outline-none focus:border-amber-500/50"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.inventory.length} позиций, {w.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Commodity Select */}
            {selectedWarehouse && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                  2. Выберите товар на складе:
                </label>
                <select
                  value={selectedCommodityId}
                  onChange={(e) => setSelectedCommodityId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-100 focus:outline-none focus:border-amber-500/50"
                >
                  {selectedWarehouse.inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — в наличии: {item.quantity} {item.unit} (${item.avgBuyPrice}/ед., {item.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category match badge */}
            {selectedItem && (
              <div
                className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                  isCategorySupported
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                <span>
                  Категория: <strong>{selectedItem.category}</strong>
                </span>
                <span className="font-mono text-[11px]">
                  {isCategorySupported ? '✓ Профиль магазина' : '⚠ Непрофильный товар'}
                </span>
              </div>
            )}

            {/* Quantity Slider */}
            {selectedItem && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-mono">3. Объем партии:</span>
                  <span className="font-mono font-bold text-slate-100">
                    {quantity} / {selectedItem.quantity} {selectedItem.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={selectedItem.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
                />
                <div className="flex gap-2">
                  {[25, 50, 100, 250, selectedItem.quantity].map((v, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuantity(Math.min(selectedItem.quantity, v))}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-all"
                    >
                      {v === selectedItem.quantity ? 'Макс' : v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Capacity & Volume metrics */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Объем перемещаемого груза:</span>
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

            {error && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleTransfer}
              disabled={itemVolume > remainingCapacity || !selectedItem}
              className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                itemVolume > remainingCapacity || !selectedItem
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/10'
              }`}
            >
              <span>Подтвердить перемещение в магазин</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
