/**
 * Business Empire: Ultimate
 * Staff Impact & Efficiency Matrix Component
 */

import React from 'react';
import {
  TrendingUp,
  Award,
  Zap,
  Target,
  Wrench,
  Truck,
  Cog,
  Calculator,
  LineChart,
  Users,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { StaffAggregatedBonuses, Employee } from '../../types/staff';
import { EMPLOYEE_ROLES } from '../../game/staff/staffCatalog';
import { economy } from '../../game/economy';

interface StaffImpactMatrixProps {
  bonuses: StaffAggregatedBonuses;
  employees: Employee[];
}

export const StaffImpactMatrix: React.FC<StaffImpactMatrixProps> = ({
  bonuses,
  employees,
}) => {
  const getCountByType = (type: string) =>
    employees.filter((e) => e.type === type).length;

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Штат холдинга</div>
          <div className="text-xl font-bold text-slate-100 font-mono mt-1">
            {bonuses.totalStaffCount} чел.
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">активных специалистов</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Суточный ФОТ</div>
          <div className="text-xl font-bold text-indigo-400 font-mono mt-1">
            {economy.formatMoney(bonuses.totalDailyPayroll)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">зарплатный фонд в день</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Средняя мораль</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
            {bonuses.holdingAverageMorale}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">лояльность команды</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Синергия дирекции</div>
          <div className="text-xl font-bold text-purple-400 font-mono mt-1">
            x{bonuses.directorLeadershipBonus}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">мультипликатор капитализации</div>
        </div>
      </div>

      {/* 10 Roles Impact Grid */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-slate-100 font-mono">
            МАТРИЦА РЕАЛЬНОГО ВЛИЯНИЯ НА БИЗНЕС
          </h4>
          <p className="text-xs text-slate-400">
            Сотрудники дают прямые процентные и финансовые бонусы подразделениям холдинга
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 1. Продавец */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Продавцы ({getCountByType('salesperson')} в штате)
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  +{Math.round((bonuses.salesVolumeMultiplier - 1.0) * 100)}% к продажам
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Повышают конверсию покупателей в розничных магазинах и ускоряют оборачиваемость товарных запасов.
              </p>
            </div>
          </div>

          {/* 2. Маркетолог */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Маркетологи ({getCountByType('marketer')} в штате)
                </span>
                <span className="text-xs font-mono font-bold text-rose-400">
                  +{Math.round((bonuses.retailTrafficMultiplier - 1.0) * 100)}% трафика
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Генерируют поток платежеспособных клиентов во все розничные бутики и автосалоны холдинга.
              </p>
            </div>
          </div>

          {/* 3. Механик */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Механики ({getCountByType('mechanic')} в штате)
                </span>
                <span className="text-xs font-mono font-bold text-orange-400">
                  -{Math.round(bonuses.carRepairDiscount * 100)}% на ремонт авто
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Снижают себестоимость ремонта и дефектовки машин в автосервисах и при автофлиппинге.
              </p>
            </div>
          </div>

          {/* 4. Водитель */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Водители ({getCountByType('driver')} в штате)
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  -{Math.round(bonuses.logisticsCostDiscount * 100)}% на логистику
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Оптимизируют маршруты грузовиков, снижают расход топлива и износ шин автопарка.
              </p>
            </div>
          </div>

          {/* 5. Инженер */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Cog className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Инженеры ({getCountByType('engineer')} в штате)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  +{Math.round(bonuses.factoryCapacityBonus * 100)}% выпуск заводов
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Модернизируют конвейерные линии, снижают энергопотребление и простои промышленного оборудования.
              </p>
            </div>
          </div>

          {/* 6. Бухгалтер */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Бухгалтеры ({getCountByType('accountant')} в штате)
                </span>
                <span className="text-xs font-mono font-bold text-teal-400">
                  -{Math.round(bonuses.taxReductionRate * 100)}% налогов & -{Math.round(bonuses.overheadCostDiscount * 100)}% издержек
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Оптимизируют налоговую нагрузку корпорации и выявляют неэффективные статьи расходов.
              </p>
            </div>
          </div>

          {/* 7. Трейдер */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <LineChart className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Трейдеры ({getCountByType('trader')} в штате)
                </span>
                <span className="text-xs font-mono font-bold text-blue-400">
                  -{Math.round(bonuses.tradingCommissionDiscount * 100)}% комиссий биржи
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Снижают биржевые сборы брокера и ловят прибыльные арбитражные спреды по акциям и сырью.
              </p>
            </div>
          </div>

          {/* 8. Аналитик */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Аналитики ({getCountByType('analyst')} в штате)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {bonuses.marketForecastAccuracy}% точность прогнозов
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Генерируют опережающие прогнозы трендов фондового и товарного рынков.
              </p>
            </div>
          </div>

          {/* 9. Менеджер */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Менеджеры ({getCountByType('manager')} в штате)
                </span>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  +{Math.round((bonuses.managementSynergyBonus - 1.0) * 100)}% КПД отделов
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Повышают общую производительность филиалов и предотвращают выгорание персонала.
              </p>
            </div>
          </div>

          {/* 10. Директор */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Директора ({getCountByType('director')} в штате)
                </span>
                <span className="text-xs font-mono font-bold text-purple-400">
                  +{Math.round((bonuses.directorLeadershipBonus - 1.0) * 100)}% капитализация
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Дают мощную синергию всему холдингу, повышают инвестиционный рейтинг и корпоративную оценку.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
