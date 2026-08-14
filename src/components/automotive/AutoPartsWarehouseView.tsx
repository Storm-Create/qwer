/**
 * Business Empire: Ultimate
 * Auto Parts Warehouse & Procurement View
 */

import React, { useState } from 'react';
import {
  Wrench,
  Package,
  Boxes,
  DollarSign,
  Plus,
  Minus,
  Sparkles,
  Layers,
  Factory,
  Search,
  CheckCircle,
} from 'lucide-react';
import { AutoPartCategory, AutoPartItem } from '../../types/automotive';
import { AUTO_PARTS_CATALOG } from '../../game/automotive/partsCatalog';
import { automotiveManager } from '../../game/automotive/automotiveManager';
import { gameState } from '../../game/gameState';

const PART_CATEGORY_LABELS: Record<AutoPartCategory, string> = {
  engine: 'Двигатели и наддув',
  transmission: 'Трансмиссия и сцепление',
  brakes: 'Тормозная система',
  suspension: 'Подвеска и стойки',
  electronics: 'Электроника и ЭБУ',
  body: 'Кузовные панели и оптика',
  interior: 'Салон и сиденья',
  wheels: 'Кованые диски',
  tires: 'Комплекты шин',
  fluids: 'Масла и фильтры (ТО)',
  battery: 'Тяговые батареи (EV)',
};

export const AutoPartsWarehouseView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<AutoPartCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [purchaseQuantities, setPurchaseQuantities] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const autoState = automotiveManager.getOrCreateState();
  const stock = autoState.partsWarehouseStock;
  const playerCash = gameState.getState().cash;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getQty = (partId: string) => purchaseQuantities[partId] || 1;
  const setQty = (partId: string, val: number) => {
    setPurchaseQuantities(prev => ({
      ...prev,
      [partId]: Math.max(1, val),
    }));
  };

  const handleBuy = (part: AutoPartItem) => {
    const qty = getQty(part.id);
    const res = automotiveManager.buyAutoParts(part.id, qty);
    showToast(res.message);
  };

  const filteredParts = AUTO_PARTS_CATALOG.filter(part => {
    const matchesCategory = selectedCategory === 'all' || part.category === selectedCategory;
    const matchesSearch =
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const totalPartsInStock = Object.values(stock).reduce((sum, q) => sum + q, 0);

  return (
    <div className="space-y-6" id="auto-parts-warehouse-view">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 font-medium flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>⚙️</span> Склад автозапчастей и оптовые закупки
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Закупайте компоненты у оптовых поставщиков или производите на своих заводах. Запчасти на складе дают 65% скидку при ремонте и используются на сборочных линиях!
          </p>
        </div>

        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-right">
          <span className="text-xs text-zinc-500 block">Запчастей на складе:</span>
          <span className="text-xl font-black text-amber-400">{totalPartsInStock} шт.</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Поиск деталей по названию, производителю..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Все категории
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(PART_CATEGORY_LABELS) as AutoPartCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                  : 'bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {PART_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Parts Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredParts.map(part => {
          const inStockCount = stock[part.id] || 0;
          const qty = getQty(part.id);
          const totalBuyCost = part.marketPrice * qty;

          return (
            <div
              key={part.id}
              className="bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase text-amber-400">
                      {PART_CATEGORY_LABELS[part.category]}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">{part.name}</h3>
                    <p className="text-xs text-zinc-400 font-medium">Поставщик: {part.supplier}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-zinc-500 block">На складе:</span>
                    <span
                      className={`text-sm font-black px-2 py-0.5 rounded-md ${
                        inStockCount > 0
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {inStockCount} шт.
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{part.description}</p>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/60 text-xs text-zinc-300">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Цена за шт.</span>
                    <strong className="text-white font-bold">${part.marketPrice.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Себестоимость</span>
                    <strong className="text-emerald-400 font-bold">${part.productionCost.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Manufacturing Recipe Requirements */}
                {part.materialRequirements && part.materialRequirements.length > 0 && (
                  <div className="text-[11px] text-zinc-400 space-y-1 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800/40">
                    <span className="font-semibold text-zinc-300 block">Сырье для заводского производства:</span>
                    {part.materialRequirements.map((m, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>• {m.commodityName}</span>
                        <span className="text-amber-400 font-medium">{m.quantity} ед.</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Purchase Controls */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-1">
                    <button
                      onClick={() => setQty(part.id, qty - 1)}
                      className="p-1 text-zinc-400 hover:text-white rounded"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      value={qty}
                      onChange={e => setQty(part.id, Number(e.target.value))}
                      className="w-12 text-center text-xs font-bold text-white bg-transparent focus:outline-none"
                    />
                    <button
                      onClick={() => setQty(part.id, qty + 1)}
                      className="p-1 text-zinc-400 hover:text-white rounded"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-zinc-500">Итого:</span>
                    <span className="text-sm font-bold text-white ml-1.5">${totalBuyCost.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(part)}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Купить партию ({qty} шт.)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
