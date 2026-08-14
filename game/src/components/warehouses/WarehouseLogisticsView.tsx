/**
 * Business Empire: Ultimate
 * Warehouse & Logistics Command Center
 * Multi-warehouse management, tier upgrades (100 - 25,000 m³), fleet dealership,
 * real-time freight transit tracking, and automated supply chains.
 */

import React, { useState } from 'react';
import {
  Boxes,
  Truck,
  Building2,
  TrendingUp,
  Package,
  Plus,
  ArrowRight,
  ArrowLeftRight,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  Navigation,
} from 'lucide-react';
import {
  GameState,
  Warehouse,
  Delivery,
  AutoSupplyRoute,
  LogisticsTruck,
  InventoryItem,
} from '../../types/game';
import {
  warehouseSystem,
  WAREHOUSE_TIER_CONFIG,
  AVAILABLE_LOCATIONS,
} from '../../game/business/warehouses';
import { logisticsSystem, TRUCK_CATALOG } from '../../game/business/logistics';
import { goodsMarket } from '../../game/markets/goodsMarket';

interface WarehouseLogisticsViewProps {
  state: GameState;
}

type SubTab = 'warehouses' | 'buy_warehouse' | 'fleet' | 'deliveries' | 'auto_supply';

export const WarehouseLogisticsView: React.FC<WarehouseLogisticsViewProps> = ({ state }) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('warehouses');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(
    state.warehouses[0]?.id || ''
  );
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Transfer / Delivery Modal state
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchSourceWh, setDispatchSourceWh] = useState<string>(state.warehouses[0]?.id || '');
  const [dispatchTargetWh, setDispatchTargetWh] = useState<string>(state.warehouses[1]?.id || state.warehouses[0]?.id || '');
  const [dispatchCommodityId, setDispatchCommodityId] = useState<string>('');
  const [dispatchQuantity, setDispatchQuantity] = useState<number>(10);
  const [dispatchVehicleId, setDispatchVehicleId] = useState<string>('');

  // Auto Supply Modal state
  const [showAutoSupplyModal, setShowAutoSupplyModal] = useState(false);
  const [autoSupplyWhId, setAutoSupplyWhId] = useState<string>(state.warehouses[0]?.id || '');
  const [autoSupplyCommodityId, setAutoSupplyCommodityId] = useState<string>('prod_grain_wheat');
  const [autoSupplyMinThreshold, setAutoSupplyMinThreshold] = useState<number>(20);
  const [autoSupplyBatchQty, setAutoSupplyBatchQty] = useState<number>(100);

  const currency = state.settings.currency || '$';
  const networkSummary = warehouseSystem.getNetworkSummary(state.warehouses);
  const selectedWarehouse =
    state.warehouses.find((w) => w.id === selectedWarehouseId) || state.warehouses[0];

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleUpgradeWarehouse = (whId: string) => {
    const res = warehouseSystem.upgradeWarehouse(whId);
    if (res.success) {
      showNotification('success', res.message);
    } else {
      showNotification('error', res.message);
    }
  };

  const handleBuyWarehouse = (locationName: string, name: string) => {
    const res = warehouseSystem.buyNewWarehouse(locationName, name);
    if (res.success) {
      showNotification('success', res.message);
      if (res.warehouse) {
        setSelectedWarehouseId(res.warehouse.id);
        setActiveSubTab('warehouses');
      }
    } else {
      showNotification('error', res.message);
    }
  };

  const handleBuyTruck = (modelId: string) => {
    const res = logisticsSystem.buyTruck(modelId);
    if (res.success) {
      showNotification('success', res.message);
    } else {
      showNotification('error', res.message);
    }
  };

  const handleDispatchDelivery = () => {
    if (!dispatchSourceWh || !dispatchTargetWh) {
      showNotification('error', 'Выберите склад отправления и назначения');
      return;
    }
    if (dispatchSourceWh === dispatchTargetWh) {
      showNotification('error', 'Склады отправления и назначения должны отличаться');
      return;
    }
    if (!dispatchCommodityId || dispatchQuantity <= 0) {
      showNotification('error', 'Укажите товар и корректное количество');
      return;
    }

    const sourceWh = state.warehouses.find((w) => w.id === dispatchSourceWh);
    const targetWh = state.warehouses.find((w) => w.id === dispatchTargetWh);
    if (!sourceWh || !targetWh) return;

    const heldItem = sourceWh.inventory.find((i) => i.id === dispatchCommodityId);
    if (!heldItem || heldItem.quantity < dispatchQuantity) {
      showNotification('error', 'Недостаточно товара на складе отправления');
      return;
    }

    const selectedTruck = state.trucks?.find((t) => t.id === dispatchVehicleId);
    const totalVol = Math.round((heldItem.volume || 0.05) * dispatchQuantity * 100) / 100;
    const totalWt = Math.round((heldItem.weight || 0.5) * dispatchQuantity * 10) / 10;
    const distanceKm = 450; // Average inter-city distance

    const estimate = logisticsSystem.calculateDeliveryEstimate(
      distanceKm,
      totalVol,
      totalWt,
      selectedTruck
    );

    if (selectedTruck && !estimate.fitsInTruck) {
      showNotification(
        'error',
        `Груз (${totalVol} м³ / ${totalWt} кг) превышает грузоподъемность транспорта «${selectedTruck.name}» (${selectedTruck.volumeCapacity} м³ / ${selectedTruck.weightCapacity} кг)`
      );
      return;
    }

    const res = logisticsSystem.dispatchDelivery({
      origin: sourceWh.name,
      destination: targetWh.name,
      sourceWarehouseId: sourceWh.id,
      targetWarehouseId: targetWh.id,
      vehicleId: selectedTruck?.id,
      items: [
        {
          commodityId: heldItem.id,
          name: heldItem.name,
          quantity: dispatchQuantity,
          avgBuyPrice: heldItem.avgBuyPrice,
          volume: heldItem.volume,
          weight: heldItem.weight,
          unit: heldItem.unit,
          quality: (heldItem.quality as any) || 'Стандарт',
        },
      ],
      distanceKm,
      cost: estimate.cost,
      totalHours: estimate.durationHours,
    });

    if (res.success) {
      showNotification('success', res.message);
      setShowDispatchModal(false);
      setActiveSubTab('deliveries');
    } else {
      showNotification('error', res.message);
    }
  };

  const handleCreateAutoSupply = () => {
    if (!autoSupplyWhId || !autoSupplyCommodityId || autoSupplyBatchQty <= 0) {
      showNotification('error', 'Заполните все параметры автопоставки');
      return;
    }

    const commodity = goodsMarket.getCommodity(autoSupplyCommodityId);
    if (!commodity) return;

    const newRoute: AutoSupplyRoute = {
      id: `route_${Date.now()}`,
      name: `Автоснабжение: ${commodity.name}`,
      commodityId: commodity.id,
      commodityName: commodity.name,
      sourceType: 'market',
      targetWarehouseId: autoSupplyWhId,
      minThreshold: autoSupplyMinThreshold,
      batchQuantity: autoSupplyBatchQty,
      active: true,
      createdAt: Date.now(),
    };

    const res = logisticsSystem.saveAutoSupplyRoute(newRoute);
    if (res.success) {
      showNotification('success', 'Автоматический маршрут снабжения настроен!');
      setShowAutoSupplyModal(false);
      setActiveSubTab('auto_supply');
    }
  };

  const toggleAutoSupplyRoute = (route: AutoSupplyRoute) => {
    logisticsSystem.saveAutoSupplyRoute({
      ...route,
      active: !route.active,
    });
  };

  const deleteAutoSupplyRoute = (routeId: string) => {
    logisticsSystem.deleteAutoSupplyRoute(routeId);
    showNotification('success', 'Маршрут удален');
  };

  return (
    <div className="space-y-5">
      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all animate-in fade-in slide-in-from-top-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
              : 'bg-rose-950/80 text-rose-300 border-rose-800/80'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header & Network KPIs Summary */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/90 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Boxes className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-100 font-mono tracking-tight">
                  СКЛАДСКАЯ СЕТЬ & ЛОГИСТИКА
                </h2>
                <p className="text-xs text-slate-400">
                  Управление логистическими хабами, вместимостью, автопарком и цепочками поставок
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDispatchModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              Отправить рейс
            </button>
            <button
              onClick={() => setShowAutoSupplyModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              + Автопоставка
            </button>
          </div>
        </div>

        {/* Global Network Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
              <Package className="w-3 h-3 text-amber-400" />
              Общий объём сети
            </div>
            <div className="text-base font-bold font-mono text-slate-100">
              {networkSummary.totalUsedVolume.toLocaleString()} /{' '}
              <span className="text-amber-400">{networkSummary.totalCapacity.toLocaleString()} м³</span>
            </div>
            <div className="mt-1.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  networkSummary.volumePercent > 90
                    ? 'bg-rose-500'
                    : networkSummary.volumePercent > 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, networkSummary.volumePercent)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Занято: {networkSummary.volumePercent.toFixed(1)}% • Свободно:{' '}
              {networkSummary.totalFreeVolume.toLocaleString()} м³
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-cyan-400" />
              Складские хабы
            </div>
            <div className="text-base font-bold font-mono text-slate-100">
              {state.warehouses.length}{' '}
              <span className="text-xs font-normal text-slate-400">объектов</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Грузов в наличии:{' '}
              <span className="text-slate-200 font-mono font-semibold">
                {state.inventory.reduce((sum, i) => sum + i.quantity, 0).toLocaleString()} ед.
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-rose-400" />
              Складские расходы
            </div>
            <div className="text-base font-bold font-mono text-rose-400">
              -{currency}{networkSummary.totalDailyExpenses.toLocaleString()}/дн.
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Аренда: ${networkSummary.totalDailyRent} • Обсл.: ${networkSummary.totalDailyMaintenance} •
              Хран.: ${networkSummary.totalDailyStorageCost}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
              <Truck className="w-3 h-3 text-emerald-400" />
              Автопарк и рейсы
            </div>
            <div className="text-base font-bold font-mono text-slate-100">
              {state.trucks?.length || 0}{' '}
              <span className="text-xs font-normal text-slate-400">машин</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">
              В пути рейсов: {state.deliveries?.filter((d) => d.status === 'in_transit').length || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <button
          onClick={() => setActiveSubTab('warehouses')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'warehouses'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Мои склады ({state.warehouses.length})
        </button>

        <button
          onClick={() => setActiveSubTab('buy_warehouse')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'buy_warehouse'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          Покупка складов
        </button>

        <button
          onClick={() => setActiveSubTab('fleet')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'fleet'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          Автопарк ({state.trucks?.length || 0})
        </button>

        <button
          onClick={() => setActiveSubTab('deliveries')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'deliveries'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          Рейсы в пути ({state.deliveries?.filter((d) => d.status === 'in_transit').length || 0})
        </button>

        <button
          onClick={() => setActiveSubTab('auto_supply')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'auto_supply'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Автопоставки ({state.autoSupplyRoutes?.length || 0})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: MY WAREHOUSES & INVENTORIES */}
      {/* ========================================================================= */}
      {activeSubTab === 'warehouses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Warehouse List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Список ваших складов
            </h3>

            <div className="space-y-2.5">
              {state.warehouses.map((wh) => {
                const metrics = warehouseSystem.getWarehouseMetrics(wh);
                const isSelected = selectedWarehouse?.id === wh.id;

                return (
                  <div
                    key={wh.id}
                    onClick={() => setSelectedWarehouseId(wh.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            LVL {wh.level}
                          </span>
                          <span className="text-xs font-bold text-slate-100">{wh.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <span>Локация: {wh.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {wh.capacity.toLocaleString()} м³
                        </span>
                        <div className="text-[10px] text-slate-500">
                          -{currency}{metrics.totalDailyCost}/дн.
                        </div>
                      </div>
                    </div>

                    {/* Progress Gauge */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Заполнение объёма</span>
                        <span className="font-mono">{metrics.volumePercent.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${
                            metrics.volumePercent > 90
                              ? 'bg-rose-500'
                              : metrics.volumePercent > 70
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, metrics.volumePercent)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Columns: Selected Warehouse Details & Upgrade Hub */}
          {selectedWarehouse && (
            <div className="lg:col-span-2 space-y-4">
              {(() => {
                const metrics = warehouseSystem.getWarehouseMetrics(selectedWarehouse);
                const nextTier = WAREHOUSE_TIER_CONFIG.find(
                  (t) => t.level === selectedWarehouse.level + 1
                );

                return (
                  <>
                    {/* Warehouse Detail Card & Upgrade Hero */}
                    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Уровень {selectedWarehouse.level} из 8
                            </span>
                            <h3 className="text-base font-bold text-slate-100">
                              {selectedWarehouse.name}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Локация: <strong className="text-slate-200">{selectedWarehouse.location}</strong> •
                            Хранение: {selectedWarehouse.inventory.length} видов товаров
                          </p>
                        </div>

                        {nextTier ? (
                          <button
                            onClick={() => handleUpgradeWarehouse(selectedWarehouse.id)}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-950/40 cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4" />
                            Улучшить до {nextTier.capacity.toLocaleString()} м³ (
                            {currency}{nextTier.upgradeCost.toLocaleString()})
                          </button>
                        ) : (
                          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Максимальный уровень (25,000 м³)
                          </div>
                        )}
                      </div>

                      {/* Warehouse Resource Metrics Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800">
                          <div className="text-slate-400 text-[11px]">Объём склада (м³)</div>
                          <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
                            {metrics.usedVolume.toFixed(1)} /{' '}
                            <span className="text-amber-400">{selectedWarehouse.capacity.toLocaleString()} м³</span>
                          </div>
                          <div className="text-[10px] text-emerald-400 mt-0.5">
                            Свободно: {metrics.freeVolume.toFixed(1)} м³
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800">
                          <div className="text-slate-400 text-[11px]">Весовая нагрузка (кг)</div>
                          <div className="text-sm font-bold font-mono text-slate-100 mt-0.5">
                            {metrics.usedWeight.toLocaleString()} /{' '}
                            <span className="text-cyan-400">{(selectedWarehouse.maxWeight || selectedWarehouse.capacity * 50).toLocaleString()} кг</span>
                          </div>
                          <div className="text-[10px] text-cyan-400 mt-0.5">
                            Свободно: {metrics.freeWeight.toLocaleString()} кг
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 col-span-2 sm:col-span-1">
                          <div className="text-slate-400 text-[11px]">Суточные расходы</div>
                          <div className="text-sm font-bold font-mono text-rose-400 mt-0.5">
                            -{currency}{metrics.totalDailyCost}/дн.
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Аренда ${selectedWarehouse.rent || 0} + Обсл ${selectedWarehouse.maintenance || 0} + Хран ${metrics.dailyStorageCost}
                          </div>
                        </div>
                      </div>

                      {/* Tier Progression Tracker Bar (100 -> 250 -> 500 -> 1000 -> 2500 -> 5000 -> 10000 -> 25000) */}
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <div className="text-[11px] font-bold font-mono text-slate-400 mb-2">
                          ЭВОЛЮЦИЯ ВМЕСТИМОСТИ СКЛАДА:
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center">
                          {WAREHOUSE_TIER_CONFIG.map((t) => {
                            const isCurrent = t.level === selectedWarehouse.level;
                            const isPast = t.level < selectedWarehouse.level;

                            return (
                              <div
                                key={t.level}
                                className={`p-2 rounded-lg border text-[10px] transition-all ${
                                  isCurrent
                                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                                    : isPast
                                    ? 'bg-slate-900/90 border-slate-800 text-slate-400 line-through'
                                    : 'bg-slate-950/40 border-slate-900 text-slate-600'
                                }`}
                              >
                                <div className="font-mono">LVL {t.level}</div>
                                <div className="font-bold">{t.capacity.toLocaleString()} м³</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Stored Goods Table */}
                    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-amber-400" />
                          Товары на складе ({selectedWarehouse.inventory.length})
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          Всего единиц:{' '}
                          <strong className="text-slate-200 font-mono">
                            {selectedWarehouse.inventory
                              .reduce((acc, i) => acc + i.quantity, 0)
                              .toLocaleString()}
                          </strong>
                        </span>
                      </div>

                      {selectedWarehouse.inventory.length === 0 ? (
                        <div className="p-8 text-center rounded-xl bg-slate-950/50 border border-slate-800/60 text-slate-500 text-xs">
                          Склад пуст. Закупайте товары на товарной бирже или отправляйте грузы с
                          других складов!
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-mono">
                                <th className="pb-2">Наименование</th>
                                <th className="pb-2">Категория</th>
                                <th className="pb-2">Количество</th>
                                <th className="pb-2">Объём / Вес</th>
                                <th className="pb-2">Ср. цена покупки</th>
                                <th className="pb-2 text-right">Действия</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850">
                              {selectedWarehouse.inventory.map((item) => {
                                const totalItemVol =
                                  Math.round((item.volume || 0.05) * item.quantity * 100) / 100;
                                const totalItemWt =
                                  Math.round((item.weight || 0.5) * item.quantity * 10) / 10;

                                return (
                                  <tr key={item.id} className="hover:bg-slate-800/40">
                                    <td className="py-2.5 font-semibold text-slate-200">
                                      {item.name}
                                    </td>
                                    <td className="py-2.5 text-slate-400">{item.category}</td>
                                    <td className="py-2.5 font-mono font-bold text-amber-300">
                                      {item.quantity.toLocaleString()} {item.unit}
                                    </td>
                                    <td className="py-2.5 font-mono text-slate-300">
                                      {totalItemVol} м³ / {totalItemWt} кг
                                    </td>
                                    <td className="py-2.5 font-mono text-slate-300">
                                      {currency}{item.avgBuyPrice.toLocaleString()}
                                    </td>
                                    <td className="py-2.5 text-right">
                                      <button
                                        onClick={() => {
                                          setDispatchSourceWh(selectedWarehouse.id);
                                          setDispatchCommodityId(item.id);
                                          setDispatchQuantity(Math.min(item.quantity, 50));
                                          setShowDispatchModal(true);
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-all border border-slate-700 cursor-pointer"
                                      >
                                        Отправить
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
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: BUY NEW WAREHOUSES */}
      {/* ========================================================================= */}
      {activeSubTab === 'buy_warehouse' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono">
                КАТАЛОГ СКЛАДСКОЙ НЕДВИЖИМОСТИ
              </h3>
              <p className="text-xs text-slate-400">
                Приобретайте новые логистические комплексы в ключевых транспортных узлах
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {AVAILABLE_LOCATIONS.map((loc) => {
              const alreadyOwned = state.warehouses.some((w) => w.location === loc.city);

              return (
                <div
                  key={loc.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                    alreadyOwned
                      ? 'bg-slate-900/40 border-slate-800 opacity-80'
                      : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40 shadow-lg'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {loc.country}
                      </span>
                      {alreadyOwned && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                          Куплен
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-slate-100 mb-1">{loc.hubName}</div>
                    <p className="text-[11px] text-slate-400 mb-3">{loc.description}</p>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Город / Узел:</span>
                        <span className="font-mono font-bold text-slate-200">{loc.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Начальный объём:</span>
                        <span className="font-mono font-bold text-amber-300">100 м³ (LVL 1)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Макс. развитие:</span>
                        <span className="font-mono text-slate-300">до 25,000 м³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Стоимость покупки:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {currency}{loc.basePurchaseCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleBuyWarehouse(loc.city, `${loc.hubName} (${loc.city})`)
                    }
                    className="mt-4 w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-950/30 cursor-pointer"
                  >
                    {alreadyOwned ? 'Купить доп. склад' : 'Приобрести склад'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: FLEET & COMMERCIAL TRUCKS */}
      {/* ========================================================================= */}
      {activeSubTab === 'fleet' && (
        <div className="space-y-5">
          {/* Player Fleet Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Ваш коммерческий автопарк ({state.trucks?.length || 0})
            </h3>

            {!state.trucks || state.trucks.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500 text-xs">
                У вас пока нет грузового транспорта. Приобретите машины в автосалоне ниже!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {state.trucks.map((truck) => (
                  <div
                    key={truck.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[10px] font-mono text-cyan-400 font-bold">
                          {truck.brand}
                        </div>
                        <div className="text-xs font-bold text-slate-100">{truck.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Базирование: {truck.currentLocation}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          truck.status === 'in_transit'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {truck.status === 'in_transit' ? 'В рейсе' : 'Свободен'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Вместимость:</span>
                        <span className="font-mono text-slate-200">
                          {truck.volumeCapacity} м³ / {truck.weightCapacity.toLocaleString()} кг
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Скорость:</span>
                        <span className="font-mono text-cyan-300">{truck.speedKmH} км/ч</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Обслуживание:</span>
                        <span className="font-mono text-rose-400">
                          -{currency}{truck.maintenanceDaily}/дн.
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dealership Catalog */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Автосалон грузового транспорта & спецтехники
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {TRUCK_CATALOG.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="text-xs font-mono text-cyan-400 font-bold mb-1">
                      {item.brand}
                    </div>
                    <div className="text-xs font-bold text-slate-100 mb-1">{item.name}</div>
                    <p className="text-[11px] text-slate-400 mb-3">{item.description}</p>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Вместимость:</span>
                        <span className="font-mono font-bold text-amber-300">
                          {item.volumeCapacity} м³ ({item.weightCapacity.toLocaleString()} кг)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Скорость:</span>
                        <span className="font-mono text-slate-300">{item.speedKmH} км/ч</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Стоимость покупки:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {currency}{item.purchasePrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Обслуживание:</span>
                        <span className="font-mono text-rose-400">
                          -{currency}{item.maintenanceDaily}/дн.
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuyTruck(item.id)}
                    className="mt-4 w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-950/30 cursor-pointer"
                  >
                    Купить в автопарк
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: DELIVERIES & REAL-TIME TRANSIT */}
      {/* ========================================================================= */}
      {activeSubTab === 'deliveries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono">
                РЕЙСЫ И ТРАНСПОРТНЫЕ ПЕРЕВОЗКИ
              </h3>
              <p className="text-xs text-slate-400">
                Мониторинг движения грузов в реальном времени с почасовым расчетом пути
              </p>
            </div>

            <button
              onClick={() => setShowDispatchModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Отправить новый рейс
            </button>
          </div>

          {!state.deliveries || state.deliveries.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500 text-xs">
              Нет активных рейсов. Вы можете перемещать партии товаров между своими складами!
            </div>
          ) : (
            <div className="space-y-3">
              {state.deliveries.map((del) => {
                const progressPct =
                  del.totalHours > 0
                    ? Math.round(((del.totalHours - del.remainingHours) / del.totalHours) * 100)
                    : 100;

                return (
                  <div
                    key={del.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-100">{del.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              del.status === 'in_transit'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {del.status === 'in_transit' ? 'В пути' : 'Доставлен'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>Транспорт: {del.vehicleName}</span>
                          <span>•</span>
                          <span>Дистанция: {del.distanceKm} км</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-amber-300">
                          {del.status === 'in_transit'
                            ? `Прибытие через ~${Math.max(1, Math.ceil(del.remainingHours))} ч.`
                            : 'Разгружен'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Объём: {del.totalVolume} м³ • Вес: {del.totalWeight} кг
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            del.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, progressPct))}%` }}
                        />
                      </div>
                    </div>

                    {/* Items on board */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800 text-[11px]">
                      {del.items.map((it, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 font-mono"
                        >
                          {it.name}: <strong>{it.quantity} {it.unit}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 5: AUTOMATED SUPPLY ROUTES */}
      {/* ========================================================================= */}
      {activeSubTab === 'auto_supply' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono">
                АВТОМАТИЧЕСКИЕ ЦЕПОЧКИ ПОСТАВОК
              </h3>
              <p className="text-xs text-slate-400">
                Автопополнение запасов на складах при снижении остатков ниже порогового значения
              </p>
            </div>

            <button
              onClick={() => setShowAutoSupplyModal(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Создать маршрут
            </button>
          </div>

          {!state.autoSupplyRoutes || state.autoSupplyRoutes.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500 text-xs">
              Нет настроенных маршрутов автопоставок. Настройте автопополнение для непрерывного
              производства и торговли!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {state.autoSupplyRoutes.map((route) => {
                const targetWh = state.warehouses.find((w) => w.id === route.targetWarehouseId);

                return (
                  <div
                    key={route.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-100">{route.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Склад: {targetWh?.name || 'Основной'}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleAutoSupplyRoute(route)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                          route.active
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {route.active ? 'Активен' : 'На паузе'}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Условие автозаказа:</span>
                        <span className="font-mono text-amber-300">
                          Остаток &lt; {route.minThreshold} ед.
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Объём партии:</span>
                        <span className="font-mono text-slate-200">
                          {route.batchQuantity} ед.
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Источник:</span>
                        <span className="font-mono text-cyan-300">Товарная биржа</span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => deleteAutoSupplyRoute(route.id)}
                        className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Удалить правило
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
      {/* MODAL: DISPATCH DELIVERY */}
      {/* ========================================================================= */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                ОТПРАВИТЬ ЛОГИСТИЧЕСКИЙ РЕЙС
              </h3>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Склад отправления:</label>
                <select
                  value={dispatchSourceWh}
                  onChange={(e) => setDispatchSourceWh(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                >
                  {state.warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Склад назначения:</label>
                <select
                  value={dispatchTargetWh}
                  onChange={(e) => setDispatchTargetWh(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                >
                  {state.warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Товар для перевозки:</label>
                {(() => {
                  const sourceWh = state.warehouses.find((w) => w.id === dispatchSourceWh);
                  const items = sourceWh?.inventory || [];

                  return (
                    <select
                      value={dispatchCommodityId}
                      onChange={(e) => setDispatchCommodityId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                    >
                      <option value="">-- Выберите товар --</option>
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.name} (В наличии: {it.quantity} {it.unit})
                        </option>
                      ))}
                    </select>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Количество:</label>
                  <input
                    type="number"
                    min="1"
                    value={dispatchQuantity}
                    onChange={(e) => setDispatchQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Транспорт автопарка:</label>
                  <select
                    value={dispatchVehicleId}
                    onChange={(e) => setDispatchVehicleId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                  >
                    <option value="">Наемный фрахт (курьер)</option>
                    {state.trucks
                      ?.filter((t) => t.status === 'idle')
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.volumeCapacity} м³)
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowDispatchModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={handleDispatchDelivery}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold cursor-pointer"
              >
                Подтвердить отправку
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE AUTO SUPPLY ROUTE */}
      {/* ========================================================================= */}
      {showAutoSupplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                НАСТРОЙКА АВТОПОСТАВКИ
              </h3>
              <button
                onClick={() => setShowAutoSupplyModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Склад назначения:</label>
                <select
                  value={autoSupplyWhId}
                  onChange={(e) => setAutoSupplyWhId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                >
                  {state.warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Товар для автозакупки:</label>
                <select
                  value={autoSupplyCommodityId}
                  onChange={(e) => setAutoSupplyCommodityId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                >
                  {goodsMarket.getCommodities().slice(0, 100).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category} - ${c.currentPrice})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Порог срабатывания (ед.):</label>
                  <input
                    type="number"
                    min="1"
                    value={autoSupplyMinThreshold}
                    onChange={(e) =>
                      setAutoSupplyMinThreshold(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">
                    Заказ пойдет, если остаток меньше этого числа
                  </span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Объём автозаказа (ед.):</label>
                  <input
                    type="number"
                    min="1"
                    value={autoSupplyBatchQty}
                    onChange={(e) =>
                      setAutoSupplyBatchQty(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">
                    Количество, закупаемое за один рейс
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAutoSupplyModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateAutoSupply}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
              >
                Сохранить правило
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
