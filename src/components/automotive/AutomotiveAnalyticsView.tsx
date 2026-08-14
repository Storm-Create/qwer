/**
 * Business Empire: Ultimate
 * Automotive Empire Analytics & Financial P&L Breakdown
 */

import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Award,
  Store,
  Factory,
  Wrench,
  Sparkles,
  PieChart,
  Percent,
  Layers,
} from 'lucide-react';
import { AutomotiveState } from '../../types/automotive';

interface Props {
  automotiveState: AutomotiveState;
}

export const AutomotiveAnalyticsView: React.FC<Props> = ({ automotiveState }) => {
  const {
    ownedCars,
    autoWorkshops,
    dealerships,
    factoryLines,
    totalFlipsCompleted,
    totalFlipProfit,
    totalCarsManufactured,
    totalCarsSoldViaDealerships,
  } = automotiveState;

  const totalGarageValue = ownedCars.reduce((sum, c) => sum + c.marketValue, 0);
  const totalGarageCost = ownedCars.reduce((sum, c) => sum + c.financials.totalInvested, 0);
  const avgProfitPerFlip = totalFlipsCompleted > 0 ? Math.round(totalFlipProfit / totalFlipsCompleted) : 0;

  const totalWorkshopDailyIncome = autoWorkshops.reduce((sum, w) => sum + w.dailyCustomerProfit, 0);
  const totalDealerRevenue = dealerships.reduce((sum, d) => sum + d.totalRevenueGenerated, 0);
  const totalDealerProfit = dealerships.reduce((sum, d) => sum + d.totalProfitGenerated, 0);

  return (
    <div className="space-y-6" id="automotive-analytics-view">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-1 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Прибыль с перепродажи:</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">+${totalFlipProfit.toLocaleString()}</div>
          <p className="text-[11px] text-zinc-500">Завершено сделок: {totalFlipsCompleted} авто</p>
        </div>

        <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-1 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Средний профит с флипа:</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">${avgProfitPerFlip.toLocaleString()} / сделку</div>
          <p className="text-[11px] text-zinc-500">С учетом диагностики и ремонта</p>
        </div>

        <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-1 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Прибыль дилерских центров:</span>
            <Store className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400">+${totalDealerProfit.toLocaleString()}</div>
          <p className="text-[11px] text-zinc-500">Выручка: ${totalDealerRevenue.toLocaleString()}</p>
        </div>

        <div className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-1 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
            <span>Произведено на заводах:</span>
            <Factory className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{totalCarsManufactured} авто</div>
          <p className="text-[11px] text-zinc-500">Серийный конвейерный выпуск</p>
        </div>
      </div>

      {/* Deep P&L Breakdown Table */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-amber-400" />
          <span>Консолидированный P&L автобизнеса</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 uppercase font-semibold text-[11px] border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Направление бизнеса</th>
                <th className="p-3.5">Масштаб</th>
                <th className="p-3.5">Суточный оборот</th>
                <th className="p-3.5">Чистый результат</th>
                <th className="p-3.5">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              <tr className="hover:bg-zinc-800/30 transition-colors">
                <td className="p-3.5 font-bold text-white flex items-center gap-2">
                  <span>🚗</span> Вторичный рынок & Перекуп
                </td>
                <td className="p-3.5">{totalFlipsCompleted} успешных сделок</td>
                <td className="p-3.5">Динамический</td>
                <td className="p-3.5 font-black text-emerald-400">+${totalFlipProfit.toLocaleString()}</td>
                <td className="p-3.5 text-emerald-400 font-semibold">Высокая рентабельность</td>
              </tr>

              <tr className="hover:bg-zinc-800/30 transition-colors">
                <td className="p-3.5 font-bold text-white flex items-center gap-2">
                  <span>🔧</span> Сеть автосервисов и СТО
                </td>
                <td className="p-3.5">{autoWorkshops.length} филиалов</td>
                <td className="p-3.5">
                  ${autoWorkshops.reduce((sum, w) => sum + w.dailyCustomerRevenue, 0).toLocaleString()}/день
                </td>
                <td className="p-3.5 font-black text-emerald-400">+${totalWorkshopDailyIncome.toLocaleString()}/день</td>
                <td className="p-3.5 text-emerald-400 font-semibold">Пассивный поток</td>
              </tr>

              <tr className="hover:bg-zinc-800/30 transition-colors">
                <td className="p-3.5 font-bold text-white flex items-center gap-2">
                  <span>🏛️</span> Сеть официальных дилерских центров
                </td>
                <td className="p-3.5">{dealerships.length} салонов ({totalCarsSoldViaDealerships} продаж)</td>
                <td className="p-3.5">${totalDealerRevenue.toLocaleString()}</td>
                <td className="p-3.5 font-black text-emerald-400">+${totalDealerProfit.toLocaleString()}</td>
                <td className="p-3.5 text-emerald-400 font-semibold">Розничная маржа</td>
              </tr>

              <tr className="hover:bg-zinc-800/30 transition-colors">
                <td className="p-3.5 font-bold text-white flex items-center gap-2">
                  <span>🏭</span> Автосборочные заводы
                </td>
                <td className="p-3.5">{factoryLines.length} производственных линий</td>
                <td className="p-3.5">
                  {factoryLines.reduce((sum, f) => sum + f.capacityCarsPerMonth, 0)} авто / месяц
                </td>
                <td className="p-3.5 font-black text-white">{totalCarsManufactured} собрано</td>
                <td className="p-3.5 text-sky-400 font-semibold">Индустриальный масштаб</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
