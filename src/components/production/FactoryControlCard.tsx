/**
 * Business Empire: Ultimate
 * Industrial Factory Control Card Component
 */

import React, { useState } from 'react';
import {
  Play,
  Pause,
  ArrowUpRight,
  Sliders,
  Zap,
  Users,
  Wrench,
  Package,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Settings,
  ChevronDown,
  Layers,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { IndustrialFactory, FactoryRecipe } from '../../types/production';
import { industrialManager } from '../../game/production/industrialManager';
import { FACTORY_BLUEPRINTS, FACTORY_RECIPES, UPGRADE_TIERS } from '../../game/production/productionCatalog';
import { Warehouse } from '../../types/game';

interface FactoryControlCardProps {
  factory: IndustrialFactory;
  warehouses: Warehouse[];
  currency: string;
  onOpenUpgrade: (factory: IndustrialFactory) => void;
  onOpenUnitCost: (factory: IndustrialFactory, recipe: FactoryRecipe) => void;
}

export const FactoryControlCard: React.FC<FactoryControlCardProps> = ({
  factory,
  warehouses,
  currency,
  onOpenUpgrade,
  onOpenUnitCost,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const blueprint = FACTORY_BLUEPRINTS[factory.type] || FACTORY_BLUEPRINTS.food_factory;
  const currentRecipe = FACTORY_RECIPES.find((r) => r.id === factory.activeRecipeId) || FACTORY_RECIPES[0];
  const tier = UPGRADE_TIERS[factory.level - 1] || UPGRADE_TIERS[0];
  const isMaxLevel = factory.level >= UPGRADE_TIERS.length;

  const costBreakdown = industrialManager.calculateUnitCostBreakdown(factory, currentRecipe);
  const effectiveCycleHours = Math.max(1, Math.round(currentRecipe.cycleHours * (1 - tier.cycleTimeReduction)));
  const progressPercent = Math.min(
    100,
    Math.round((factory.progress.currentCycleHoursElapsed / effectiveCycleHours) * 100)
  );

  const availableRecipes = FACTORY_RECIPES.filter(
    (r) => r.factoryType === factory.type || (factory.type === 'food_factory' && r.chainId === 'wood_to_furniture')
  );

  const getStatusBadge = () => {
    switch (factory.status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Работает
          </span>
        );
      case 'out_of_materials':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Нехватка сырья
          </span>
        );
      case 'warehouse_full':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <Package className="w-3.5 h-3.5" />
            Склад переполнен
          </span>
        );
      case 'stopped':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <Pause className="w-3.5 h-3.5" />
            Остановлен
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 lg:p-5 shadow-lg relative overflow-hidden transition-all hover:border-slate-700">
      {/* Background Subtle Gradient Glow */}
      <div className={`absolute top-0 right-0 w-72 h-32 bg-gradient-to-l ${blueprint.bannerGradient} pointer-events-none rounded-tr-xl opacity-60`} />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Уровень {factory.level}
            </span>
            <span className="text-xs text-slate-400">
              {blueprint.categoryTitle} • {factory.location}
            </span>
          </div>
          <h3 className="text-base lg:text-lg font-bold text-slate-100 font-mono mt-1">
            {factory.name}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge()}

          {factory.status === 'active' ? (
            <button
              onClick={() => industrialManager.stopFactory(factory.id)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              Пауза
            </button>
          ) : (
            <button
              onClick={() => industrialManager.startFactory(factory.id)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Запустить
            </button>
          )}

          <button
            onClick={() => onOpenUpgrade(factory)}
            disabled={isMaxLevel}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              isMaxLevel
                ? 'bg-slate-800/50 text-slate-500 border-slate-800 cursor-not-allowed'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            {isMaxLevel ? 'МАКС' : 'Улучшить'}
          </button>
        </div>
      </div>

      {/* Main Production Flow & Recipe Selection */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Active Recipe Selector & Description */}
        <div className="lg:col-span-2 bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Активная производственная линия:
            </label>
            <button
              onClick={() => onOpenUnitCost(factory, currentRecipe)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-mono flex items-center gap-1"
            >
              <DollarSign className="w-3 h-3" />
              Себестоимость: {currency}{costBreakdown.totalUnitCost}/ед. (+{costBreakdown.estimatedMarginPercent}%)
            </button>
          </div>

          <select
            value={factory.activeRecipeId}
            onChange={(e) => industrialManager.setActiveRecipe(factory.id, e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            {availableRecipes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.tagline}) — Цикл: {r.cycleHours}ч
              </option>
            ))}
          </select>

          {/* Inputs → Outputs visual stream */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Required Inputs */}
            <div className="bg-slate-900/80 rounded p-2 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Потребление сырья (за партию):
              </span>
              <div className="space-y-1">
                {currentRecipe.inputs.map((inp, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-300">
                    <span>{inp.name}</span>
                    <span className="font-mono text-amber-400">
                      {(inp.quantity * (factory.targetBatchVolume || 1) * (factory.capacityUtilization || 1)).toFixed(1)} {inp.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Produced Outputs */}
            <div className="bg-slate-900/80 rounded p-2 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Выпуск готовой продукции:
              </span>
              <div className="space-y-1">
                {currentRecipe.outputs.map((out, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-300">
                    <span className="truncate pr-1">{out.name}</span>
                    <span className="font-mono text-emerald-400 whitespace-nowrap">
                      +{(out.quantity * (factory.targetBatchVolume || 1) * (factory.capacityUtilization || 1)).toFixed(1)} {out.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Operational Metrics */}
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-2">
              Эксплуатационные параметры
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-400" /> Персонал:
                </span>
                <span className="font-mono text-slate-200">
                  {factory.employeesCount} чел. ({currency}{factory.employeesCount * factory.employeeSalaryDaily}/день)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Электроэнергия:
                </span>
                <span className="font-mono text-slate-200">
                  {factory.electricityKWhDaily} кВт⋅ч ({currency}{Math.round(factory.electricityKWhDaily * factory.electricityPricePerKWh)}/день)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-slate-400" /> Обслуживание:
                </span>
                <span className="font-mono text-slate-200">
                  {currency}{factory.maintenanceDaily}/день
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Чистая прибыль:
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  ~{currency}{costBreakdown.dailyEstimatedNetProfit.toLocaleString()}/день
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Партий выпущено:</span>
            <span className="font-mono text-slate-200 font-medium">{factory.progress.totalBatchesCompleted}</span>
          </div>
        </div>
      </div>

      {/* Production Cycle Progress Bar */}
      <div className="mt-3 bg-slate-950/70 rounded-lg p-3 border border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Прогресс текущего цикла выпуска ({factory.progress.currentCycleHoursElapsed}ч из {effectiveCycleHours}ч):
          </span>
          <span className="font-mono text-cyan-400 font-bold">{progressPercent}%</span>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              factory.status === 'out_of_materials'
                ? 'bg-amber-500'
                : factory.status === 'warehouse_full'
                ? 'bg-orange-500'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Warning if out of materials */}
        {factory.status === 'out_of_materials' && factory.missingMaterials?.length > 0 && (
          <div className="mt-2 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded p-1.5 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Ожидание поставки сырья:</span>{' '}
              {factory.missingMaterials.join(', ')}.
              {factory.automation.autoBuyRawMaterials && (
                <span className="text-slate-400 ml-1">(Автозакупка активна, ожидает поступления на биржу)</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Volume / Capacity Utilization Slider & Automation Toggle Expand */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Utilization Slider */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap">
            <Sliders className="w-3.5 h-3.5 text-slate-400" /> Загрузка мощности:
          </span>
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={Math.round((factory.capacityUtilization || 1) * 100)}
            onChange={(e) => industrialManager.setCapacityUtilization(factory.id, Number(e.target.value) / 100)}
            className="w-36 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-xs font-mono text-emerald-400 font-bold min-w-[40px]">
            {Math.round((factory.capacityUtilization || 1) * 100)}%
          </span>
        </div>

        {/* Automation Settings Toggle Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors self-end sm:self-auto"
        >
          <Settings className="w-3.5 h-3.5 text-emerald-400" />
          <span>Автоматизация и склады</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expandable Automation Drawer */}
      {showSettings && (
        <div className="mt-3 pt-3 border-t border-slate-800 bg-slate-950/70 rounded-lg p-3 space-y-3 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Auto Buy Raw Materials */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={factory.automation.autoBuyRawMaterials}
                onChange={(e) =>
                  industrialManager.updateAutomation(factory.id, {
                    autoBuyRawMaterials: e.target.checked,
                  })
                }
                className="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-300">Автозакупка сырья на бирже при исчерпании</span>
            </label>

            {/* Auto Transfer to Warehouse */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={factory.automation.autoTransferToWarehouse}
                onChange={(e) =>
                  industrialManager.updateAutomation(factory.id, {
                    autoTransferToWarehouse: e.target.checked,
                  })
                }
                className="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-300">Автоматически отгружать продукцию на склад</span>
            </label>

            {/* Auto Supply Retail Stores */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={factory.automation.autoSupplyRetail}
                onChange={(e) =>
                  industrialManager.updateAutomation(factory.id, {
                    autoSupplyRetail: e.target.checked,
                  })
                }
                className="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-300">Прямое снабжение магазинов розничной сети (0% наценка)</span>
            </label>

            {/* Auto Sell Excess on Market */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={factory.automation.autoSellExcess}
                onChange={(e) =>
                  industrialManager.updateAutomation(factory.id, {
                    autoSellExcess: e.target.checked,
                  })
                }
                className="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-300">Автопродажа на бирже при переполнении складов</span>
            </label>
          </div>

          {/* Target Warehouse Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 whitespace-nowrap">Целевой склад готовой продукции:</span>
            <select
              value={factory.automation.targetWarehouseId}
              onChange={(e) =>
                industrialManager.updateAutomation(factory.id, {
                  targetWarehouseId: e.target.value,
                })
              }
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-emerald-500"
            >
              <option value="any">Ближайший свободный склад (Авто)</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.location}) — Свободно: {Math.max(0, Math.round((w.capacity - (w.usedCapacity || 0))))} м³
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
