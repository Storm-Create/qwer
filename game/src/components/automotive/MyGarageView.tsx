/**
 * Business Empire: Ultimate
 * My Garage & Fleet View - Owned Cars, Component Status, Repairs, Detailing, Tuning & Sales
 */

import React, { useState } from 'react';
import {
  Car,
  Wrench,
  Sparkles,
  DollarSign,
  TrendingUp,
  Store,
  ShieldCheck,
  Zap,
  Gauge,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { CarComponentType, OwnedCar } from '../../types/automotive';
import { automotiveManager } from '../../game/automotive/automotiveManager';
import { AutoServiceSystem } from '../../game/automotive/autoServiceSystem';
import { gameState } from '../../game/gameState';

interface Props {
  cars: OwnedCar[];
  onCarUpdated: () => void;
  onNavigateToTab: (tabId: string) => void;
}

export const MyGarageView: React.FC<Props> = ({ cars, onCarUpdated, onNavigateToTab }) => {
  const [selectedCar, setSelectedCar] = useState<OwnedCar | null>(null);
  const [showShowroomModal, setShowShowroomModal] = useState<OwnedCar | null>(null);
  const [askingPriceInput, setAskingPriceInput] = useState<number>(0);
  const [selectedDealershipId, setSelectedDealershipId] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const autoState = automotiveManager.getOrCreateState();
  const playerCash = gameState.getState().cash;
  const partsStock = autoState.partsWarehouseStock;
  const dealerships = autoState.dealerships;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSellDirect = (car: OwnedCar) => {
    const res = automotiveManager.sellCarDirect(car.id);
    showToast(res.message);
    if (res.success) {
      if (selectedCar?.id === car.id) setSelectedCar(null);
      onCarUpdated();
    }
  };

  const handleAssignShowroom = (car: OwnedCar) => {
    if (!selectedDealershipId) {
      showToast('Выберите автосалон для размещения!');
      return;
    }
    const res = automotiveManager.assignCarToShowroom(car.id, selectedDealershipId, askingPriceInput);
    showToast(res.message);
    if (res.success) {
      setShowShowroomModal(null);
      onCarUpdated();
    }
  };

  const handleRepairComponent = (car: OwnedCar, type: CarComponentType) => {
    const res = AutoServiceSystem.repairComponent(car, type, true, partsStock);
    if (res.success) {
      if (res.cost > 0) {
        if (playerCash < res.cost) {
          showToast('Недостаточно средств для оплаты работы механиков!');
          return;
        }
        gameState.update(draft => {
          draft.cash -= res.cost;
        });
      }
      showToast(res.message);
      onCarUpdated();
    } else {
      showToast(res.message);
    }
  };

  const handleFullRestore = (car: OwnedCar) => {
    const res = AutoServiceSystem.fullyRestoreCar(car, partsStock);
    if (res.success) {
      if (res.totalCost > 0) {
        if (playerCash < res.totalCost) {
          showToast('Недостаточно средств для полной реставрации!');
          return;
        }
        gameState.update(draft => {
          draft.cash -= res.totalCost;
        });
      }
      showToast(res.message);
      onCarUpdated();
    }
  };

  const handleApplyDetailing = (car: OwnedCar) => {
    const res = AutoServiceSystem.applyDetailing(car);
    if (res.success) {
      if (playerCash < res.cost) {
        showToast('Недостаточно средств для детейлинга!');
        return;
      }
      gameState.update(draft => {
        draft.cash -= res.cost;
      });
      showToast(res.message);
      onCarUpdated();
    } else {
      showToast(res.message);
    }
  };

  const handleApplyChipStage = (car: OwnedCar, stage: 1 | 2 | 3) => {
    const res = AutoServiceSystem.applyChipTuning(car, stage);
    if (res.success) {
      if (playerCash < res.cost) {
        showToast('Недостаточно средств для чип-тюнинга!');
        return;
      }
      gameState.update(draft => {
        draft.cash -= res.cost;
      });
      showToast(res.message);
      onCarUpdated();
    } else {
      showToast(res.message);
    }
  };

  const totalGarageValue = cars.reduce((sum, c) => sum + c.marketValue, 0);
  const totalInvested = cars.reduce((sum, c) => sum + c.financials.totalInvested, 0);
  const totalUnrealizedProfit = totalGarageValue - totalInvested;

  return (
    <div className="space-y-6" id="my-garage-view">
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

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
          <div className="text-xs text-zinc-400 font-medium">Автомобилей в парке:</div>
          <div className="text-2xl font-black text-white mt-1">{cars.length} шт.</div>
          <div className="text-[11px] text-zinc-500 mt-1">Готовы к тюнингу, сервису или перепродаже</div>
        </div>

        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
          <div className="text-xs text-zinc-400 font-medium">Оценочная стоимость гаража:</div>
          <div className="text-2xl font-black text-amber-400 mt-1">${totalGarageValue.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Инвестировано: ${totalInvested.toLocaleString()}</div>
        </div>

        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
          <div className="text-xs text-zinc-400 font-medium">Потенциальная прибыль флипов:</div>
          <div className={`text-2xl font-black mt-1 ${totalUnrealizedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${totalUnrealizedProfit.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Маржинальность: {Math.round((totalUnrealizedProfit / Math.max(1, totalInvested)) * 100)}%
          </div>
        </div>
      </div>

      {/* Cars Grid */}
      {cars.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {cars.map(car => {
            const profitPotential = car.marketValue - car.financials.totalInvested;
            const roiPct = Math.round((profitPotential / Math.max(1, car.financials.totalInvested)) * 100);

            return (
              <div
                key={car.id}
                className="bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-700 rounded-2xl p-5 space-y-4 transition-all shadow-md"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase text-amber-400 tracking-wider">
                      {car.location}
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      {car.brand} {car.model}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {car.generation} • {car.year} г. • {car.engine}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-zinc-500">Рыночная оценка:</span>
                    <div className="text-xl font-black text-amber-400">${car.marketValue.toLocaleString()}</div>
                    <span className={`text-xs font-bold ${profitPotential >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      Прибыль: +${profitPotential.toLocaleString()} ({roiPct}%)
                    </span>
                  </div>
                </div>

                {/* Status & Condition Gauges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/60">
                    <span className="text-zinc-500 block text-[10px]">Состояние</span>
                    <strong className={car.condition > 80 ? 'text-emerald-400' : 'text-amber-400'}>
                      {car.condition}%
                    </strong>
                  </div>

                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/60">
                    <span className="text-zinc-500 block text-[10px]">Мощность</span>
                    <strong className="text-white">{car.enginePowerHp} л.с.</strong>
                  </div>

                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/60">
                    <span className="text-zinc-500 block text-[10px]">Детейлинг</span>
                    <strong className={car.tuning.detailingDone ? 'text-emerald-400' : 'text-zinc-400'}>
                      {car.tuning.detailingDone ? 'Керамика 100%' : 'Не сделан'}
                    </strong>
                  </div>

                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/60">
                    <span className="text-zinc-500 block text-[10px]">Тюнинг Stage</span>
                    <strong className={car.tuning.chipStage > 0 ? 'text-amber-400' : 'text-zinc-400'}>
                      {car.tuning.chipStage > 0 ? `Stage ${car.tuning.chipStage}` : 'Сток'}
                    </strong>
                  </div>
                </div>

                {/* Component Wear Breakdown */}
                <div className="p-3.5 bg-zinc-950/80 border border-zinc-800/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span>Состояние ключевых узлов:</span>
                    <button
                      onClick={() => handleFullRestore(car)}
                      className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Восстановить всё</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(Object.keys(car.components) as CarComponentType[]).slice(0, 6).map(type => {
                      const comp = car.components[type];
                      return (
                        <div key={type} className="flex items-center justify-between bg-zinc-900/60 px-2 py-1.5 rounded-lg">
                          <span className="text-zinc-400 truncate pr-1">{comp.name.split(' ')[0]}:</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={comp.condition > 75 ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                              {comp.condition}%
                            </span>
                            {comp.condition < 95 && (
                              <button
                                onClick={() => handleRepairComponent(car, type)}
                                className="px-1.5 py-0.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black rounded text-[10px] font-bold transition-colors"
                                title={`Ремонт: ~$${comp.repairCostEst}`}
                              >
                                Fix
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Tuning & Detailing Controls */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {!car.tuning.detailingDone && (
                    <button
                      onClick={() => handleApplyDetailing(car)}
                      className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Детейлинг (+$$)</span>
                    </button>
                  )}

                  {car.tuning.chipStage < 3 && (
                    <button
                      onClick={() => handleApplyChipStage(car, (car.tuning.chipStage + 1) as 1 | 2 | 3)}
                      className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Установить Stage {car.tuning.chipStage + 1}</span>
                    </button>
                  )}
                </div>

                {/* Selling Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => handleSellDirect(car)}
                    className="py-2.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Быстрый выкуп (${Math.round(car.marketValue * 0.92).toLocaleString()})</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowShowroomModal(car);
                      setAskingPriceInput(Math.round(car.marketValue * 1.08));
                    }}
                    className="py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
                  >
                    <Store className="w-4 h-4" />
                    <span>В автосалон</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 space-y-4">
          <Car className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Ваш гараж пуст</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Перейдите на вторичный рынок, чтобы выкупить перспективные автомобили с дисконтом, провести диагностику и ремонт!
          </p>
          <button
            onClick={() => onNavigateToTab('market')}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            Перейти на вторичный рынок
          </button>
        </div>
      )}

      {/* Showroom Assignment Modal */}
      {showShowroomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400" />
                <span>Выставить в автосалон</span>
              </h3>
              <button onClick={() => setShowShowroomModal(null)} className="text-zinc-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1 text-xs text-zinc-300">
                <div>
                  Автомобиль: <strong className="text-white">{showShowroomModal.brand} {showShowroomModal.model}</strong>
                </div>
                <div>
                  Рыночная оценка: <strong className="text-amber-400">${showShowroomModal.marketValue.toLocaleString()}</strong>
                </div>
              </div>

              {dealerships.length > 0 ? (
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-medium">Выберите ваш автосалон:</label>
                  <select
                    value={selectedDealershipId}
                    onChange={e => setSelectedDealershipId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Выберите шоурум --</option>
                    {dealerships.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.carsOnDisplayIds.length}/{d.capacityCars} мест)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                  У вас пока нет открытых автосалонов. Вы можете открыть свой первый шоурум во вкладке "Автосалоны"!
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-medium">Желаемая цена продажи ($):</label>
                <input
                  type="number"
                  value={askingPriceInput}
                  onChange={e => setAskingPriceInput(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-bold text-base focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowShowroomModal(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold"
              >
                Отмена
              </button>
              <button
                disabled={dealerships.length === 0}
                onClick={() => handleAssignShowroom(showShowroomModal)}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20"
              >
                Разместить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
