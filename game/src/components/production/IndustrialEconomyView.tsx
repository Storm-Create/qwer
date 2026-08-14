/**
 * Business Empire: Ultimate
 * Complete Industrial Economy Subsystem View
 */

import React, { useState } from 'react';
import {
  Factory,
  Plus,
  Layers,
  Cpu,
  Flame,
  Shirt,
  Wheat,
  Hammer,
  Car,
  TrendingUp,
  DollarSign,
  Zap,
  Users,
  Boxes,
  Sparkles,
  BarChart3,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { GameState } from '../../types/game';
import { IndustrialFactory, FactoryRecipe, FactoryType } from '../../types/production';
import { FactoryControlCard } from './FactoryControlCard';
import { ProductionChainsDiagram } from './ProductionChainsDiagram';
import { FactoryBuildModal } from './FactoryBuildModal';
import { FactoryUpgradeModal } from './FactoryUpgradeModal';
import { UnitCostModal } from './UnitCostModal';
import { FACTORY_BLUEPRINTS, FACTORY_RECIPES } from '../../game/production/productionCatalog';
import { industrialManager } from '../../game/production/industrialManager';

interface IndustrialEconomyViewProps {
  state: GameState;
  onNavigateTab?: (tab: string) => void;
}

type SubTab = 'factories' | 'chains' | 'construction' | 'cost_matrix';

export const IndustrialEconomyView: React.FC<IndustrialEconomyViewProps> = ({
  state,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('factories');
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
  const [upgradeTargetFactory, setUpgradeTargetFactory] = useState<IndustrialFactory | null>(null);
  const [unitCostTarget, setUnitCostTarget] = useState<{ factory: IndustrialFactory; recipe: FactoryRecipe } | null>(null);

  const currency = state.settings?.currency || '$';
  const industrial = industrialManager.getOrCreateState();
  const factories = industrial.factories || [];

  // Summary Metrics
  const activeFactoriesCount = factories.filter((f) => f.status === 'active').length;
  const totalEmployees = factories.reduce((sum, f) => sum + f.employeesCount, 0);
  const totalElectricityDaily = factories.reduce((sum, f) => sum + f.electricityKWhDaily, 0);

  let totalDailyRevenueEstimate = 0;
  let totalDailyNetProfitEstimate = 0;
  let totalDailyProducedUnitsEstimate = 0;

  for (const f of factories) {
    if (f.status !== 'stopped') {
      const rec = FACTORY_RECIPES.find((r) => r.id === f.activeRecipeId) || FACTORY_RECIPES[0];
      const breakdown = industrialManager.calculateUnitCostBreakdown(f, rec);
      totalDailyRevenueEstimate += breakdown.dailyEstimatedRevenue;
      totalDailyNetProfitEstimate += breakdown.dailyEstimatedNetProfit;
      totalDailyProducedUnitsEstimate += breakdown.dailyEstimatedUnits;
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Industrial Metrics Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-emerald-600/10 via-teal-600/5 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Тяжелая и легкая индустрия
              </span>
              <span className="text-xs text-slate-400">Производственные цепочки & Заводы</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-100 font-mono mt-1 flex items-center gap-2.5">
              <Factory className="w-7 h-7 text-emerald-400" />
              Промышленный комплекс
            </h1>
            <p className="text-xs lg:text-sm text-slate-400 mt-1 max-w-2xl">
              Создавайте реальные цепочки глубокой переработки: от добычи сырья до выпуска готовой одежды, гаджетов, мебели и автомобилей.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              onClick={() => setIsBuildModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/40"
            >
              <Plus className="w-4 h-4" />
              <span>Построить завод</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Stats Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <Factory className="w-3.5 h-3.5 text-emerald-400" /> Активные заводы:
            </span>
            <span className="text-lg font-bold font-mono text-slate-100">
              {activeFactoriesCount} <span className="text-xs text-slate-500 font-normal">/ {factories.length}</span>
            </span>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <Boxes className="w-3.5 h-3.5 text-cyan-400" /> Суточный выпуск:
            </span>
            <span className="text-lg font-bold font-mono text-cyan-400">
              {totalDailyProducedUnitsEstimate.toLocaleString()}{' '}
              <span className="text-xs text-slate-500 font-normal">ед./д</span>
            </span>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Прогноз чистой прибыли:
            </span>
            <span className="text-lg font-bold font-mono text-emerald-400">
              +{currency}{Math.round(totalDailyNetProfitEstimate).toLocaleString()}{' '}
              <span className="text-xs text-slate-500 font-normal">/д</span>
            </span>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <Users className="w-3.5 h-3.5 text-purple-400" /> Персонал холдинга:
            </span>
            <span className="text-lg font-bold font-mono text-slate-200">
              {totalEmployees} <span className="text-xs text-slate-500 font-normal">чел.</span>
            </span>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Энергопотребление:
            </span>
            <span className="text-lg font-bold font-mono text-amber-400">
              {totalElectricityDaily.toLocaleString()}{' '}
              <span className="text-xs text-slate-500 font-normal">кВт⋅ч/д</span>
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('factories')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'factories'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Factory className="w-4 h-4" />
          <span>Мои предприятия ({factories.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('chains')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'chains'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Технологические цепочки (5)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('construction')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'construction'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Каталог строительства</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cost_matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'cost_matrix'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Анализ себестоимости</span>
        </button>
      </div>

      {/* Sub-Tab 1: My Factories */}
      {activeSubTab === 'factories' && (
        <div className="space-y-4">
          {factories.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-10 text-center">
              <Factory className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-200 font-mono">У вас пока нет промышленных предприятий</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Постройте пищевой комбинат, текстильную фабрику или высокотехнологичный завод электроники для запуска прибыльных цепочек.
              </p>
              <button
                onClick={() => setIsBuildModalOpen(true)}
                className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Открыть первый завод</span>
              </button>
            </div>
          ) : (
            factories.map((factory) => (
              <FactoryControlCard
                key={factory.id}
                factory={factory}
                warehouses={state.warehouses || []}
                currency={currency}
                onOpenUpgrade={(f) => setUpgradeTargetFactory(f)}
                onOpenUnitCost={(f, r) => setUnitCostTarget({ factory: f, recipe: r })}
              />
            ))
          )}
        </div>
      )}

      {/* Sub-Tab 2: Production Chains Diagram */}
      {activeSubTab === 'chains' && (
        <ProductionChainsDiagram
          factories={factories}
          warehouses={state.warehouses || []}
          currency={currency}
          onNavigateToMarket={(cat) => onNavigateTab && onNavigateTab('goods_market')}
        />
      )}

      {/* Sub-Tab 3: Factory Construction Catalog */}
      {activeSubTab === 'construction' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(FACTORY_BLUEPRINTS).map((bp) => {
            const ownedCount = factories.filter((f) => f.type === bp.type).length;
            const canAfford = state.cash >= bp.purchaseCost;

            return (
              <div
                key={bp.type}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-slate-700 shadow-lg relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-48 h-24 bg-gradient-to-l ${bp.bannerGradient} pointer-events-none opacity-50`} />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {bp.categoryTitle}
                    </span>
                    {ownedCount > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        В наличии: {ownedCount}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-100 font-mono">{bp.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{bp.tagline}</p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-950/60 rounded p-2 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Мощность:</span>
                      <span className="font-mono text-slate-200 font-semibold">{bp.baseCapacityUnitsDaily} ед./день</span>
                    </div>
                    <div className="bg-slate-950/60 rounded p-2 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Цикл выпуска:</span>
                      <span className="font-mono text-slate-200 font-semibold">{bp.baseProductionTimeHours} ч./партия</span>
                    </div>
                    <div className="bg-slate-950/60 rounded p-2 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Персонал:</span>
                      <span className="font-mono text-slate-200 font-semibold">{bp.minEmployees} чел.</span>
                    </div>
                    <div className="bg-slate-950/60 rounded p-2 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Энергия:</span>
                      <span className="font-mono text-slate-200 font-semibold">{bp.baseElectricityKWhDaily} кВт⋅ч</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Стоимость:</span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      {currency}{bp.purchaseCost.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => setIsBuildModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Выбрать</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sub-Tab 4: Unit Cost & Profitability Matrix */}
      {activeSubTab === 'cost_matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 font-mono">Сводная матрица себестоимости и маржи</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Точный расчет затрат на сырье, оплату труда, электроэнергию и техобслуживание по всем 12 рецептам.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="text-[11px] uppercase font-mono bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Рецепт / Продукция</th>
                  <th className="py-3 px-2 text-right">Сырье</th>
                  <th className="py-3 px-2 text-right">ФОТ</th>
                  <th className="py-3 px-2 text-right">Энергия</th>
                  <th className="py-3 px-2 text-right">Себестоимость</th>
                  <th className="py-3 px-2 text-right">Цена биржи</th>
                  <th className="py-3 px-3 text-right">Маржинальность</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {FACTORY_RECIPES.map((recipe) => {
                  const dummyFactory: IndustrialFactory = {
                    id: 'temp',
                    type: recipe.factoryType,
                    name: 'Тест',
                    location: 'Парк',
                    level: 1,
                    status: 'active',
                    activeRecipeId: recipe.id,
                    capacityUtilization: 1.0,
                    targetBatchVolume: 1,
                    employeesCount: recipe.laborRequirement || 15,
                    employeeSalaryDaily: 100,
                    electricityKWhDaily: recipe.electricityKWhPerBatch * 4,
                    electricityPricePerKWh: 0.14,
                    maintenanceDaily: 250,
                    automation: {
                      autoBuyRawMaterials: true,
                      autoBuyThresholdBatches: 2,
                      maxAutoBuyPriceMultiplier: 1.2,
                      autoTransferToWarehouse: true,
                      targetWarehouseId: 'any',
                      sourceWarehouseId: 'any',
                      autoSupplyRetail: true,
                      autoSellExcess: false,
                    },
                    progress: {
                      currentCycleHoursElapsed: 0,
                      currentBatchId: 'b',
                      totalBatchesCompleted: 0,
                      materialsLockedForCurrentBatch: false,
                      lastRunTimestamp: Date.now(),
                    },
                    dailyProducedUnits: 0,
                    dailyRevenue: 0,
                    dailyExpenses: 0,
                    dailyProfit: 0,
                    totalProducedUnits: 0,
                    totalRevenueAllTime: 0,
                    totalCostAllTime: 0,
                    missingMaterials: [],
                    recentLogs: [],
                  };

                  const cost = industrialManager.calculateUnitCostBreakdown(dummyFactory, recipe);

                  return (
                    <tr key={recipe.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-100">{recipe.name}</div>
                        <div className="text-[10px] text-emerald-400 font-mono">{recipe.tagline}</div>
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-amber-400">
                        {currency}{cost.rawMaterialsCostPerUnit}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-blue-400">
                        {currency}{cost.laborCostPerUnit}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-yellow-400">
                        {currency}{cost.electricityCostPerUnit}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-slate-100 font-bold">
                        {currency}{cost.totalUnitCost}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-cyan-400 font-bold">
                        {currency}{cost.currentMarketPrice}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                        +{cost.estimatedMarginPercent}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <FactoryBuildModal
        isOpen={isBuildModalOpen}
        onClose={() => setIsBuildModalOpen(false)}
        cash={state.cash}
        currency={currency}
      />

      <FactoryUpgradeModal
        factory={upgradeTargetFactory}
        isOpen={!!upgradeTargetFactory}
        onClose={() => setUpgradeTargetFactory(null)}
        cash={state.cash}
        currency={currency}
      />

      <UnitCostModal
        factory={unitCostTarget?.factory || null}
        recipe={unitCostTarget?.recipe || null}
        isOpen={!!unitCostTarget}
        onClose={() => setUnitCostTarget(null)}
        currency={currency}
      />
    </div>
  );
};
