/**
 * Business Empire: Ultimate
 * Unit Cost & Profitability Matrix Modal (Себестоимость)
 */

import React from 'react';
import {
  X,
  DollarSign,
  TrendingUp,
  Boxes,
  Users,
  Zap,
  Wrench,
  Percent,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { IndustrialFactory, FactoryRecipe } from '../../types/production';
import { industrialManager } from '../../game/production/industrialManager';

interface UnitCostModalProps {
  factory: IndustrialFactory | null;
  recipe: FactoryRecipe | null;
  isOpen: boolean;
  onClose: () => void;
  currency: string;
}

export const UnitCostModal: React.FC<UnitCostModalProps> = ({
  factory,
  recipe,
  isOpen,
  onClose,
  currency,
}) => {
  if (!isOpen || !factory || !recipe) return null;

  const breakdown = industrialManager.calculateUnitCostBreakdown(factory, recipe);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono uppercase text-emerald-400">
              Экономический аудит и себестоимость
            </span>
            <h2 className="text-lg font-bold text-slate-100 font-mono mt-0.5">{recipe.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 lg:p-6 space-y-5 flex-1 overflow-y-auto">
          {/* Key Metrics Top Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Себестоимость единицы:</span>
              <span className="text-lg font-bold font-mono text-amber-400">
                {currency}{breakdown.totalUnitCost}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Оптовая цена биржи:</span>
              <span className="text-lg font-bold font-mono text-cyan-400">
                {currency}{breakdown.currentMarketPrice}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/30 bg-emerald-950/10 rounded-xl p-3 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Маржинальность:</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                +{breakdown.estimatedMarginPercent}%
              </span>
            </div>
          </div>

          {/* Detailed Structure Table */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-mono uppercase text-slate-400 mb-3 font-semibold">
              Калькуляция затрат на 1 единицу готовой продукции:
            </h4>

            <div className="space-y-2.5 text-xs">
              {/* Raw materials */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-slate-200 font-medium block">Затраты на сырье и материалы</span>
                    <span className="text-[10px] text-slate-400">
                      Потребление ингредиентов по рыночным котировкам
                    </span>
                  </div>
                </div>
                <span className="font-mono text-slate-100 font-bold">
                  {currency}{breakdown.rawMaterialsCostPerUnit}
                </span>
              </div>

              {/* Labor */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="text-slate-200 font-medium block">Фонд оплаты труда (ФОТ)</span>
                    <span className="text-[10px] text-slate-400">
                      Зарплаты операторов и инженеров цеха
                    </span>
                  </div>
                </div>
                <span className="font-mono text-slate-100 font-bold">
                  {currency}{breakdown.laborCostPerUnit}
                </span>
              </div>

              {/* Electricity */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <div>
                    <span className="text-slate-200 font-medium block">Электроэнергия и энергоресурсы</span>
                    <span className="text-[10px] text-slate-400">
                      Расход кВт⋅ч на плавку, прессы и конвейеры
                    </span>
                  </div>
                </div>
                <span className="font-mono text-slate-100 font-bold">
                  {currency}{breakdown.electricityCostPerUnit}
                </span>
              </div>

              {/* Tooling & Maintenance */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-200 font-medium block">Амортизация станков и ТО</span>
                    <span className="text-[10px] text-slate-400">
                      Износ оснастки, смазочные материалы и аренда цехов
                    </span>
                  </div>
                </div>
                <span className="font-mono text-slate-100 font-bold">
                  {currency}{breakdown.maintenanceCostPerUnit}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Projected Financials */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 text-xs">
            <h4 className="font-mono text-emerald-400 font-bold uppercase mb-2">
              Суточный финансовый прогноз (при 100% загрузке):
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Выпуск:</span>
                <span className="font-mono text-slate-100 font-bold">{breakdown.dailyEstimatedUnits} ед./день</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Выручка:</span>
                <span className="font-mono text-slate-100 font-bold">{currency}{breakdown.dailyEstimatedRevenue.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Затраты:</span>
                <span className="font-mono text-red-400 font-bold">-{currency}{breakdown.dailyEstimatedExpenses.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Чистая прибыль:</span>
                <span className="font-mono text-emerald-400 font-bold">+{currency}{breakdown.dailyEstimatedNetProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition-colors"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
