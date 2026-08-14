/**
 * Business Empire: Ultimate
 * Master Retail Management Workspace: Multi-Store Grid, Real-time Sales,
 * Shelf Logistics, Staff Roster, Equipment Upgrades, Marketing & P&L Analytics
 */

import React, { useState } from 'react';
import {
  Store,
  Plus,
  Boxes,
  Users,
  Megaphone,
  BarChart3,
  Sparkles,
  ShoppingBag,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Tag,
  Wrench,
  Shield,
  Layers,
  MapPin,
  ChevronRight,
  Zap,
  Percent,
  Sliders,
  Settings,
  X,
  Package,
  RefreshCw,
} from 'lucide-react';
import { gameState } from '../../game/gameState';
import { economy } from '../../game/economy';
import { retailManager } from '../../game/business/retailManager';
import {
  RetailStore,
  RetailStoreType,
  LocationType,
  StoreProductItem,
  EmployeeRole,
} from '../../types/retail';
import {
  RETAIL_STORE_TEMPLATES,
  RETAIL_LOCATIONS,
  MARKETING_CAMPAIGNS_CATALOG,
} from '../../game/business/retailCatalog';
import { TransferFromWarehouseModal } from './TransferFromWarehouseModal';
import { DirectBuyModal } from './DirectBuyModal';
import { ProductPricingModal } from './ProductPricingModal';
import { HireStaffModal } from './HireStaffModal';

type RetailSubTab = 'my_stores' | 'inventory' | 'staff_equipment' | 'marketing' | 'analytics' | 'new_store';

export const RetailDashboardView: React.FC = () => {
  const state = gameState.getState();
  const stores = state.retailStores || [];
  const currency = state.settings.currency || '$';

  const [activeSubTab, setActiveSubTab] = useState<RetailSubTab>(
    stores.length > 0 ? 'my_stores' : 'new_store'
  );
  const [selectedStoreId, setSelectedStoreId] = useState<string>(stores[0]?.id || '');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Modals state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDirectBuyModal, setShowDirectBuyModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedProductForPricing, setSelectedProductForPricing] = useState<StoreProductItem | null>(null);
  const [showHireModal, setShowHireModal] = useState(false);

  // New Store Wizard state
  const [wizardType, setWizardType] = useState<RetailStoreType>('grocery');
  const [wizardLocation, setWizardLocation] = useState<LocationType>('suburb');
  const [wizardName, setWizardName] = useState<string>('');

  const currentStore = stores.find((s) => s.id === selectedStoreId) || stores[0];

  const showNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 4500);
  };

  // High-level aggregate KPIs
  const totalDailyRevenue = stores.reduce((sum, s) => sum + (s.dailyRevenue || 0), 0);
  const totalDailyProfit = stores.reduce((sum, s) => sum + (s.dailyNetProfit || 0), 0);
  const totalDailyCustomers = stores.reduce((sum, s) => sum + (s.dailyCustomers || 0), 0);
  const totalOutOfStockLoss = stores.reduce((sum, s) => sum + (s.outOfStockLossDaily || 0), 0);

  // Wizard Handler
  const handleCreateStore = () => {
    const res = retailManager.openStore(wizardName, wizardType, wizardLocation);
    if (res.success && res.store) {
      showNotice(res.message);
      setSelectedStoreId(res.store.id);
      setActiveSubTab('inventory');
      setWizardName('');
    } else {
      showNotice(res.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notice */}
      {noticeMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500/40 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-3 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Top Banner & Global Stats */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase mb-1">
              <Store className="w-4 h-4" />
              <span>Розничная Торговая Сеть</span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight font-mono">
              РОЗНИЧНЫЙ БИЗНЕС & МАГАЗИНЫ
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Управляйте сетью розничных точек: от локальных киосков и супермаркетов до люксовых бутиков.
              Выстраивайте цепочки поставок со складов, настраивайте маржинальность, обучайте персонал и запускайте рекламу.
            </p>
          </div>

          <button
            onClick={() => setActiveSubTab('new_store')}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Открыть новый магазин</span>
          </button>
        </div>

        {/* Global Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[11px] font-mono text-slate-400">АКТИВНЫХ МАГАЗИНОВ</div>
            <div className="text-xl font-bold font-mono text-slate-100 mt-1">
              {stores.length} <span className="text-xs text-slate-500 font-normal">точек</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[11px] font-mono text-slate-400">ВЫРУЧКА СЕТИ (ДЕНЬ)</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {currency}{totalDailyRevenue.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[11px] font-mono text-slate-400">ЧИСТАЯ ПРИБЫЛЬ (ДЕНЬ)</div>
            <div className={`text-xl font-bold font-mono mt-1 ${totalDailyProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalDailyProfit >= 0 ? '+' : ''}{currency}{totalDailyProfit.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[11px] font-mono text-slate-400">УПУЩЕННАЯ ВЫРУЧКА (OOS)</div>
            <div className={`text-xl font-bold font-mono mt-1 ${totalOutOfStockLoss > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {currency}{totalOutOfStockLoss.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('my_stores')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'my_stores'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Мои магазины ({stores.length})</span>
        </button>

        {stores.length > 0 && (
          <>
            <button
              onClick={() => setActiveSubTab('inventory')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                activeSubTab === 'inventory'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Витрины & Склад магазина</span>
            </button>

            <button
              onClick={() => setActiveSubTab('staff_equipment')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                activeSubTab === 'staff_equipment'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Персонал & Модернизация</span>
            </button>

            <button
              onClick={() => setActiveSubTab('marketing')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                activeSubTab === 'marketing'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Маркетинг & Реклама</span>
            </button>

            <button
              onClick={() => setActiveSubTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                activeSubTab === 'analytics'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>P&L & Аналитика</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveSubTab('new_store')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'new_store'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Новый магазин</span>
        </button>
      </div>

      {/* Store Selector (for store-specific tabs) */}
      {stores.length > 1 && activeSubTab !== 'my_stores' && activeSubTab !== 'new_store' && (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-mono text-slate-400 pl-2">Текущий магазин:</span>
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-100 focus:outline-none focus:border-emerald-500/50 font-mono"
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (Ур.{s.level}, {RETAIL_STORE_TEMPLATES[s.type]?.shortName}, Выручка: {currency}{s.dailyRevenue?.toLocaleString()}/д)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 1: MY STORES LIST */}
      {/* ========================================================================= */}
      {activeSubTab === 'my_stores' && (
        <div className="space-y-4">
          {stores.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <Store className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="text-sm font-bold font-mono text-slate-200">
                У ВАС ПОКА НЕТ ОТКРЫТЫХ МАГАЗИНОВ
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Начните строить торговую империю: откройте компактный киоск или продуктовый супермаркет, настройте поставки и получайте ежедневную розничную прибыль.
              </p>
              <button
                onClick={() => setActiveSubTab('new_store')}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all font-mono"
              >
                Открыть первый магазин
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map((store) => {
                const template = RETAIL_STORE_TEMPLATES[store.type];
                const location = RETAIL_LOCATIONS[store.locationId];
                const maxVol = store.shelvesVolumeCapacity + store.backroomVolumeCapacity;
                const usedPct = Math.min(100, Math.round((store.usedVolume / (maxVol || 1)) * 100));

                return (
                  <div
                    key={store.id}
                    className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${template?.badgeColor}`}>
                              {template?.shortName}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
                              Ур. {store.level}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-100 font-mono mt-1.5 truncate">
                            {store.name}
                          </h3>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
                          <Store className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Location & Area */}
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{location?.name} ({store.areaSqM} м²)</span>
                      </div>

                      {/* Key Daily Performance */}
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 font-mono text-xs">
                        <div>
                          <div className="text-[10px] text-slate-500">Выручка/день:</div>
                          <div className="font-bold text-emerald-400">
                            {currency}{store.dailyRevenue?.toLocaleString() || 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">Прибыль/день:</div>
                          <div className={`font-bold ${(store.dailyNetProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {(store.dailyNetProfit || 0) >= 0 ? '+' : ''}{currency}{store.dailyNetProfit?.toLocaleString() || 0}
                          </div>
                        </div>
                      </div>

                      {/* Stock occupancy progress bar */}
                      <div className="space-y-1 font-mono text-[11px]">
                        <div className="flex justify-between text-slate-400">
                          <span>Заполненность витрин:</span>
                          <span className={usedPct < 15 ? 'text-amber-400' : 'text-slate-300'}>
                            {store.usedVolume.toFixed(1)} / {maxVol} м³ ({usedPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              usedPct < 15 ? 'bg-amber-500' : usedPct > 90 ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${usedPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Mini stats */}
                      <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-1">
                        <span>Позиций: {store.inventory.length}</span>
                        <span>Штат: {store.employees.length} чел.</span>
                        <span className="text-amber-400">★ {store.reputation.toFixed(0)}/100</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setSelectedStoreId(store.id);
                          setActiveSubTab('inventory');
                        }}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Boxes className="w-3.5 h-3.5 text-amber-400" />
                        <span>Товары</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStoreId(store.id);
                          setActiveSubTab('staff_equipment');
                        }}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Users className="w-3.5 h-3.5 text-violet-400" />
                        <span>Управление</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: STORE INVENTORY & SHELVES */}
      {/* ========================================================================= */}
      {activeSubTab === 'inventory' && currentStore && (
        <div className="space-y-5">
          {/* Action Bar */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                <span>АССОРТИМЕНТ & ВИТРИНЫ: {currentStore.name.toUpperCase()}</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Занято объема: {currentStore.usedVolume.toFixed(1)} м³ из{' '}
                {currentStore.shelvesVolumeCapacity + currentStore.backroomVolumeCapacity} м³ • Слотов:{' '}
                {currentStore.inventory.length} / {currentStore.maxProductSlots}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowTransferModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-2 transition-all"
              >
                <Boxes className="w-4 h-4" />
                <span>Поставка со склада</span>
              </button>
              <button
                onClick={() => setShowDirectBuyModal(true)}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-2 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Закупка с биржи</span>
              </button>
            </div>
          </div>

          {/* Product Items Table */}
          {currentStore.inventory.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <Package className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-xs font-bold font-mono text-slate-300">
                ПОЛКИ МАГАЗИНА ПУСТЫ
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Магазин не сможет генерировать выручку без товара. Переместите товары со своего склада или оформите прямую закупку.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold"
                >
                  Поставка со склада
                </button>
                <button
                  onClick={() => setShowDirectBuyModal(true)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold"
                >
                  Купить на бирже
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-5">Товар / Категория</th>
                    <th className="p-3.5">В наличии</th>
                    <th className="p-3.5">Себестоимость</th>
                    <th className="p-3.5">Розничная цена</th>
                    <th className="p-3.5">Наценка</th>
                    <th className="p-3.5">Продажи (день)</th>
                    <th className="p-3.5">Выручка (день)</th>
                    <th className="p-3.5">Авто-поставка</th>
                    <th className="p-3.5 pr-5 text-right">Настройки</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {currentStore.inventory.map((item) => {
                    const cost = item.avgCostPrice || 1;
                    const effPrice = Math.round(item.sellingPrice * (1 - (item.discountPercent || 0) / 100));
                    const markup = Math.round(((effPrice - cost) / cost) * 100);

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 pl-5">
                          <div className="font-bold text-slate-100">{item.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {item.category} • {item.quality}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`font-bold ${
                              item.currentStock <= 0
                                ? 'text-rose-400'
                                : item.currentStock < 20
                                ? 'text-amber-400'
                                : 'text-slate-100'
                            }`}
                          >
                            {item.currentStock} {item.unit}
                          </span>
                          {item.currentStock <= 0 && (
                            <span className="block text-[9px] text-rose-400 uppercase font-bold">
                              OOS (Дефицит)
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-400">
                          {currency}{cost}
                        </td>
                        <td className="p-3.5 font-bold text-emerald-400">
                          {currency}{effPrice}
                          {item.discountPercent > 0 && (
                            <span className="ml-1 text-[10px] text-amber-400 font-normal">
                              (-{item.discountPercent}%)
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              markup > 70
                                ? 'bg-amber-500/20 text-amber-300'
                                : markup >= 25
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-cyan-500/20 text-cyan-300'
                            }`}
                          >
                            +{markup}%
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          {item.dailySoldUnits || 0} {item.unit}
                        </td>
                        <td className="p-3.5 text-emerald-400 font-bold">
                          {currency}{item.dailyRevenue?.toLocaleString() || 0}
                        </td>
                        <td className="p-3.5">
                          {item.autoSupply?.enabled ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              Вкл (&lt;{item.autoSupply.minThreshold})
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Выкл</span>
                          )}
                        </td>
                        <td className="p-3.5 pr-5 text-right">
                          <button
                            onClick={() => {
                              setSelectedProductForPricing(item);
                              setShowPricingModal(true);
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-all"
                            title="Изменить цену и авто-поставку"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: STAFF & EQUIPMENT UPGRADES */}
      {/* ========================================================================= */}
      {activeSubTab === 'staff_equipment' && currentStore && (
        <div className="space-y-6">
          {/* Store Expansion & Level Up Banner */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex justify-between items-center">
              <div>
                <div className="text-xs font-mono text-slate-400">ТЕКУЩИЙ УРОВЕНЬ МАГАЗИНА</div>
                <div className="text-lg font-bold font-mono text-slate-100 mt-0.5">
                  Уровень {currentStore.level} / 10
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Слотов для товаров: {currentStore.maxProductSlots}
                </div>
              </div>
              <button
                onClick={() => {
                  const res = retailManager.levelUpStore(currentStore.id);
                  showNotice(res.message);
                }}
                disabled={currentStore.level >= 10}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold font-mono text-xs transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Повысить уровень</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex justify-between items-center">
              <div>
                <div className="text-xs font-mono text-slate-400">ПЛОЩАДЬ ПОМЕЩЕНИЯ</div>
                <div className="text-lg font-bold font-mono text-slate-100 mt-0.5">
                  {currentStore.areaSqM} кв. метров
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Зал: {currentStore.salesAreaSqM}м² • Склад: {currentStore.backroomAreaSqM}м²
                </div>
              </div>
              <button
                onClick={() => {
                  const res = retailManager.expandStoreArea(currentStore.id);
                  showNotice(res.message);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs transition-all flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4" />
                <span>Расширить площадь</span>
              </button>
            </div>
          </div>

          {/* Staff Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                  <Users className="w-4 h-4 text-violet-400" />
                  <span>ШТАТ СОТРУДНИКОВ ({currentStore.employees.length} ЧЕЛ.)</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Фонд оплаты труда: {currency}{currentStore.dailySalaries}/день
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const res = retailManager.trainEmployees(currentStore.id);
                    showNotice(res.message);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 text-xs font-mono font-bold transition-all"
                >
                  Обучить команду
                </button>
                <button
                  onClick={() => setShowHireModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Нанять сотрудника</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentStore.employees.map((emp) => (
                <div
                  key={emp.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-xs text-slate-100 font-mono">{emp.name}</div>
                      <div className="text-[11px] text-violet-400 font-mono">
                        {emp.role === 'cashier'
                          ? 'Кассир-оператор'
                          : emp.role === 'consultant'
                          ? 'Продавец-консультант'
                          : emp.role === 'merchandiser'
                          ? 'Мерчандайзер'
                          : emp.role === 'security'
                          ? 'Охранник'
                          : 'Управляющий'}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const res = retailManager.fireEmployee(currentStore.id, emp.id);
                        showNotice(res.message);
                      }}
                      className="text-slate-500 hover:text-rose-400 text-[10px] font-mono transition-colors"
                      title="Уволить"
                    >
                      Уволить
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-slate-400">
                    <div>
                      <span>Квалификация: </span>
                      <span className="text-slate-200 font-bold">Ур. {emp.skillLevel}</span>
                    </div>
                    <div>
                      <span>Оклад: </span>
                      <span className="text-slate-200 font-bold">{currency}{emp.salaryDaily}/д</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment Upgrades Section */}
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span>МОДЕРНИЗАЦИЯ ОБОРУДОВАНИЯ И СИСТЕМ</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Кассовые узлы, климатические витрины, антикражные ворота и автоматизация учета
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentStore.equipment.map((eq) => {
                const upgradeCost = Math.round(eq.cost * Math.pow(1.6, eq.currentLevel));
                const isMax = eq.currentLevel >= eq.maxLevel;

                return (
                  <div
                    key={eq.id}
                    className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-100 font-mono">{eq.name}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Ур. {eq.currentLevel} / {eq.maxLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{eq.benefitsDescription}</p>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1">
                        {eq.conversionBonus > 0 && (
                          <div className="text-emerald-400">+ {eq.conversionBonus}% к конверсии</div>
                        )}
                        {eq.serviceSpeedBonus > 0 && (
                          <div className="text-cyan-400">+ {eq.serviceSpeedBonus}% к скорости обслуживания</div>
                        )}
                        {eq.shrinkageReduction > 0 && (
                          <div className="text-amber-400">- {eq.shrinkageReduction}% кражи/потери</div>
                        )}
                        {eq.spoilageReduction > 0 && (
                          <div className="text-emerald-400">- {eq.spoilageReduction}% списание порчи</div>
                        )}
                        <div>Энергия: {currency}{eq.dailyElectricityCost}/день</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const res = retailManager.upgradeEquipment(currentStore.id, eq.id);
                        showNotice(res.message);
                      }}
                      disabled={isMax}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all ${
                        isMax
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {isMax ? (
                        <span>Максимальный уровень</span>
                      ) : (
                        <span>
                          Улучшить до Ур. {eq.currentLevel + 1} ({currency}{upgradeCost.toLocaleString()})
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: MARKETING & PROMOTION */}
      {/* ========================================================================= */}
      {activeSubTab === 'marketing' && currentStore && (
        <div className="space-y-5">
          <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-400" />
                <span>РЕКЛАМНЫЕ КАМПАНИИ: {currentStore.name.toUpperCase()}</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Ежедневный рекламный бюджет: {currency}{currentStore.dailyAdCost}/день • Репутация:{' '}
                {currentStore.reputation.toFixed(1)}/100
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MARKETING_CAMPAIGNS_CATALOG.map((camp) => {
              const isActive = currentStore.activeCampaigns.includes(camp.id);
              const isLocked = currentStore.level < camp.minStoreLevel;

              return (
                <div
                  key={camp.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                    isActive
                      ? 'bg-emerald-950/30 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-100 font-mono">{camp.name}</h4>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {currency}{camp.costDaily}/день
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{camp.description}</p>

                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-950/60 font-mono text-[10px] text-center">
                      <div>
                        <span className="text-slate-500 block">Трафик:</span>
                        <span className="text-emerald-400 font-bold">+{camp.trafficBoostPercent}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Конверсия:</span>
                        <span className="text-cyan-400 font-bold">+{camp.conversionBoostPercent}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Репутация:</span>
                        <span className="text-amber-400 font-bold">+{camp.reputationBoostDaily}/д</span>
                      </div>
                    </div>
                  </div>

                  {isLocked ? (
                    <div className="p-2.5 rounded-xl bg-slate-950 text-slate-500 text-xs font-mono text-center">
                      Требуется {camp.minStoreLevel} уровень магазина
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        const res = retailManager.toggleCampaign(currentStore.id, camp.id);
                        showNotice(res.message);
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold font-mono text-xs transition-all ${
                        isActive
                          ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      }`}
                    >
                      {isActive ? 'Остановить рекламу' : 'Запустить кампанию'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: P&L & ANALYTICS */}
      {/* ========================================================================= */}
      {activeSubTab === 'analytics' && currentStore && (
        <div className="space-y-5">
          {/* Top Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400">ПОСЕТИТЕЛЕЙ (ДЕНЬ)</div>
              <div className="text-lg font-bold font-mono text-slate-100 mt-1">
                {currentStore.dailyCustomers?.toLocaleString() || 0}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400">КОНВЕРСИЯ В ЧЕК</div>
              <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
                {currentStore.dailyConversionRate || 0}%
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400">СРЕДНИЙ ЧЕК</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                {currency}{currentStore.dailyAvgTicket || 0}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400">ИНДЕКС УДОВЛЕТВОРЕННОСТИ</div>
              <div className="text-lg font-bold font-mono text-amber-400 mt-1">
                {currentStore.customerSatisfaction || 80}%
              </div>
            </div>
          </div>

          {/* Historical P&L Table */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-mono">
              ОТЧЕТ О ПРИБЫЛЯХ И УБЫТКАХ (P&L ПОСЛЕДНИХ ДНЕЙ)
            </h3>

            {currentStore.history.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-slate-500">
                История появится после первого полного игрового дня работы магазина.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3 pl-4">День</th>
                      <th className="p-3">Выручка</th>
                      <th className="p-3">Себестоимость (COGS)</th>
                      <th className="p-3">Аренда</th>
                      <th className="p-3">Зарплаты</th>
                      <th className="p-3">Реклама & Свет</th>
                      <th className="p-3 pr-4 text-right">Чистая прибыль</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {currentStore.history
                      .slice()
                      .reverse()
                      .map((h, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 pl-4 font-bold text-slate-300">{h.dateStr}</td>
                          <td className="p-3 text-emerald-400 font-bold">
                            {currency}{h.revenue.toLocaleString()}
                          </td>
                          <td className="p-3 text-slate-400">{currency}{h.cogs.toLocaleString()}</td>
                          <td className="p-3 text-slate-400">{currency}{h.rent}</td>
                          <td className="p-3 text-slate-400">{currency}{h.salaries}</td>
                          <td className="p-3 text-slate-400">{currency}{h.advertising + h.electricity}</td>
                          <td
                            className={`p-3 pr-4 text-right font-bold ${
                              h.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {h.netProfit >= 0 ? '+' : ''}{currency}{h.netProfit.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 6: OPEN NEW STORE WIZARD */}
      {/* ========================================================================= */}
      {activeSubTab === 'new_store' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-400" />
                <span>МАСТЕР ОТКРЫТИЯ НОВОГО МАГАЗИНА</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Выберите концепцию розничной точки, подберите идеальную локацию и сформируйте стартовый бюджет.
              </p>
            </div>

            {/* Step 1: Select Store Type */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 font-mono uppercase">
                1. Выберите формат торговой точки:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.values(RETAIL_STORE_TEMPLATES).map((tpl) => {
                  const isSelected = tpl.type === wizardType;
                  return (
                    <button
                      key={tpl.type}
                      type="button"
                      onClick={() => setWizardType(tpl.type)}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-3 transition-all ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 text-slate-100 shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${tpl.badgeColor}`}>
                          {tpl.shortName}
                        </span>
                        <h4 className="text-xs font-bold text-slate-100 font-mono mt-2">{tpl.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{tpl.description}</p>
                      </div>

                      <div className="font-mono text-xs pt-1 border-t border-slate-800">
                        <div className="text-slate-500 text-[10px]">Старт от:</div>
                        <div className="font-bold text-emerald-400">
                          {currency}{tpl.initialSetupCost.toLocaleString()}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Location */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 font-mono uppercase">
                2. Выберите локацию в городе:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.values(RETAIL_LOCATIONS).map((loc) => {
                  const isSelected = loc.id === wizardLocation;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setWizardLocation(loc.id)}
                      className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 text-slate-100 shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-100 font-mono">{loc.name}</h4>
                        <span className="text-[10px] font-mono text-emerald-400">
                          {currency}{loc.rentPerSqMeter}/м²/д
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{loc.description}</p>
                      <div className="text-[10px] font-mono text-slate-500 pt-1">
                        Пешеходный поток: ~{loc.baseFootTraffic.toLocaleString()} чел/день
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Store Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 font-mono uppercase">
                3. Название магазина:
              </label>
              <input
                type="text"
                placeholder={`Например: "${RETAIL_STORE_TEMPLATES[wizardType]?.shortName} на Центральной"`}
                value={wizardName}
                onChange={(e) => setWizardName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Total Investment & Launch Button */}
            {(() => {
              const setupCost = retailManager.calculateSetupCost(wizardType, wizardLocation);
              const canAfford = state.cash >= setupCost;

              return (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-xs text-slate-400">
                      Итоговый объем первоначальных инвестиций:
                    </span>
                    <span className="text-lg font-bold text-emerald-400">
                      {currency}{setupCost.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={handleCreateStore}
                    disabled={!canAfford}
                    className={`w-full py-3.5 px-6 rounded-2xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all ${
                      canAfford
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>
                      {canAfford
                        ? `Запустить магазин за ${currency}${setupCost.toLocaleString()}`
                        : `Недостаточно средств (нужно ${currency}${setupCost.toLocaleString()})`}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Helper Modals */}
      {showTransferModal && currentStore && (
        <TransferFromWarehouseModal
          store={currentStore}
          onClose={() => setShowTransferModal(false)}
          onSuccess={showNotice}
        />
      )}

      {showDirectBuyModal && currentStore && (
        <DirectBuyModal
          store={currentStore}
          onClose={() => setShowDirectBuyModal(false)}
          onSuccess={showNotice}
        />
      )}

      {showPricingModal && currentStore && selectedProductForPricing && (
        <ProductPricingModal
          store={currentStore}
          product={selectedProductForPricing}
          onClose={() => {
            setShowPricingModal(false);
            setSelectedProductForPricing(null);
          }}
          onSuccess={showNotice}
        />
      )}

      {showHireModal && currentStore && (
        <HireStaffModal
          store={currentStore}
          onClose={() => setShowHireModal(false)}
          onSuccess={showNotice}
        />
      )}
    </div>
  );
};
