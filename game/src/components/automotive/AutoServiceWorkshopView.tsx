/**
 * Business Empire: Ultimate
 * Auto Service & Workshop Management View
 */

import React, { useState } from 'react';
import {
  Wrench,
  Sparkles,
  Zap,
  Users,
  Building,
  TrendingUp,
  DollarSign,
  CheckCircle,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { AutoServiceWorkshop } from '../../types/automotive';
import { AutoServiceSystem } from '../../game/automotive/autoServiceSystem';
import { gameState } from '../../game/gameState';
import { economy } from '../../game/economy';

interface Props {
  workshops: AutoServiceWorkshop[];
  onWorkshopUpdated: () => void;
}

export const AutoServiceWorkshopView: React.FC<Props> = ({ workshops, onWorkshopUpdated }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const playerCash = gameState.getState().cash;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUpgrade = (workshop: AutoServiceWorkshop) => {
    const upgradeCosts = [0, 25000, 85000, 250000];
    const cost = upgradeCosts[workshop.level];

    if (playerCash < cost) {
      showToast(`Недостаточно средств для улучшения сервиса! Требуется $${cost.toLocaleString()}`);
      return;
    }

    const res = AutoServiceSystem.upgradeWorkshop(workshop);
    if (res.success) {
      economy.removeMoney(
        res.cost,
        'Модернизация',
        `Модернизация автосервиса до уровня "${workshop.tierName}"`,
        'investment'
      );
      showToast(res.message);
      onWorkshopUpdated();
    } else {
      showToast(res.message);
    }
  };

  const totalDailyRevenue = workshops.reduce((sum, w) => sum + w.dailyCustomerRevenue, 0);
  const totalDailyProfit = workshops.reduce((sum, w) => sum + (w.dailyCustomerProfit - w.dailyRent - w.dailyMaintenance), 0);
  const totalLifts = workshops.reduce((sum, w) => sum + w.liftsCount, 0);
  const totalMechanics = workshops.reduce((sum, w) => sum + w.mechanicsCount, 0);

  return (
    <div className="space-y-6" id="auto-service-workshop-view">
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

      {/* KPI Header */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
          <div className="text-xs text-zinc-400 font-medium">Активных автосервисов:</div>
          <div className="text-2xl font-black text-white mt-1">{workshops.length} филиалов</div>
          <div className="text-[11px] text-zinc-500 mt-1">{totalLifts} подъёмников, {totalMechanics} автомехаников</div>
        </div>

        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
          <div className="text-xs text-zinc-400 font-medium">Дневной поток клиентов:</div>
          <div className="text-2xl font-black text-white mt-1">
            {workshops.reduce((sum, w) => sum + w.customerThroughputDaily, 0)} авто/день
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Ремонт, замена масла и диагностика</div>
        </div>

        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
          <div className="text-xs text-zinc-400 font-medium">Дневная выручка:</div>
          <div className="text-2xl font-black text-amber-400 mt-1">${totalDailyRevenue.toLocaleString()}/день</div>
          <div className="text-[11px] text-zinc-500 mt-1">Суммарный оборот услуг и запчастей</div>
        </div>

        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
          <div className="text-xs text-zinc-400 font-medium">Чистая суточная прибыль:</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">+${totalDailyProfit.toLocaleString()}/день</div>
          <div className="text-[11px] text-zinc-500 mt-1">С учетом аренды и содержания боксов</div>
        </div>
      </div>

      {/* Workshop Cards List */}
      <div className="space-y-5">
        {workshops.map(ws => {
          const upgradeCosts = [0, 25000, 85000, 250000];
          const nextCost = ws.level < 4 ? upgradeCosts[ws.level] : 0;
          const netDaily = ws.dailyCustomerProfit - ws.dailyRent - ws.dailyMaintenance;

          return (
            <div
              key={ws.id}
              className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-lg"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-full">
                      Уровень {ws.level}
                    </span>
                    <span className="text-xs text-zinc-400">📍 {ws.location}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">{ws.name}</h3>
                  <p className="text-sm text-zinc-400 font-medium">{ws.tierName}</p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-xs text-zinc-500">Чистая прибыль автосервиса:</span>
                    <div className="text-xl font-black text-emerald-400">+${netDaily.toLocaleString()}/день</div>
                    <span className="text-[11px] text-zinc-400">
                      Выручка: ${ws.dailyCustomerRevenue} • Аренда: -${ws.dailyRent + ws.dailyMaintenance}
                    </span>
                  </div>

                  {ws.level < 4 && (
                    <button
                      onClick={() => handleUpgrade(ws)}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 shrink-0"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Улучшить за ${nextCost.toLocaleString()}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Stats & Infrastructure Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                  <span className="text-xs text-zinc-500 block">Площадь боксов</span>
                  <strong className="text-white text-base">{ws.areaSqM} м²</strong>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                  <span className="text-xs text-zinc-500 block">Подъёмников</span>
                  <strong className="text-amber-400 text-base">{ws.liftsCount} постов</strong>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                  <span className="text-xs text-zinc-500 block">Штат автомехаников</span>
                  <strong className="text-white text-base">{ws.mechanicsCount} мастеров</strong>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                  <span className="text-xs text-zinc-500 block">Репутация СТО</span>
                  <strong className="text-emerald-400 text-base">{ws.reputation} / 100 ⭐</strong>
                </div>
              </div>

              {/* Capabilities & Dual Functionality Banner */}
              <div className="p-4 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-xs text-zinc-300 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Возможности и преимущества вашего сервиса:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-400">
                  <div>• Бесплатный и моментальный ремонт узлов ваших собственных перекуп-автомобилей</div>
                  <div>• Скидка 65% на стоимость ремонта при наличии запчастей на вашем складе</div>
                  <div>• Профессиональный пост детейлинга и нанесения керамики (220% ROI к стоимости авто)</div>
                  <div>• Стенд чип-тюнинга ЭБУ двигателя (Stage 1, Stage 2, Stage 3)</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
