/**
 * Business Empire: Ultimate
 * Car Dealerships & Showroom Networks View
 */

import React, { useState } from 'react';
import {
  Store,
  Sparkles,
  DollarSign,
  TrendingUp,
  Users,
  Car,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Tag,
  Building,
} from 'lucide-react';
import { CarDealership, OwnedCar } from '../../types/automotive';
import { DealershipSystem } from '../../game/automotive/dealershipSystem';
import { automotiveManager } from '../../game/automotive/automotiveManager';
import { gameState } from '../../game/gameState';
import { economy } from '../../game/economy';

interface Props {
  dealerships: CarDealership[];
  ownedCars: OwnedCar[];
  onDealershipUpdated: () => void;
  onNavigateToTab: (tabId: string) => void;
}

export const CarDealershipsView: React.FC<Props> = ({
  dealerships,
  ownedCars,
  onDealershipUpdated,
  onNavigateToTab,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDealerName, setNewDealerName] = useState('Автосалон "Престиж Авто"');
  const [newDealerType, setNewDealerType] = useState<'budget' | 'standard' | 'premium' | 'luxury'>('standard');
  const [newDealerLocation, setNewDealerLocation] = useState('Москва, Ленинградский пр-т');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const playerCash = gameState.getState().cash;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateDealership = () => {
    const { dealership, cost } = DealershipSystem.createDealership(newDealerName, newDealerType, newDealerLocation);

    if (playerCash < cost) {
      showToast(`Недостаточно средств для открытия автосалона! Требуется $${cost.toLocaleString()}`);
      return;
    }

    economy.removeMoney(
      cost,
      'Автосалоны',
      `Открытие автосалона: ${dealership.name} (${dealership.type})`,
      'investment'
    );

    gameState.update(draft => {
      if (draft.automotive) {
        draft.automotive.dealerships.push(dealership);
      }
    });

    showToast(`Поздравляем! Автосалон "${dealership.name}" успешно открыт!`);
    setShowCreateModal(false);
    onDealershipUpdated();
  };

  const handleRemoveCarFromDisplay = (dealership: CarDealership, carId: string) => {
    gameState.update(draft => {
      const car = draft.automotive?.ownedCars.find(c => c.id === carId);
      const d = draft.automotive?.dealerships.find(dealer => dealer.id === dealership.id);
      if (car && d) {
        car.status = 'in_garage';
        car.assignedShowroomId = undefined;
        car.location = 'Гаражный бокс';
        d.carsOnDisplayIds = d.carsOnDisplayIds.filter(id => id !== carId);
      }
    });
    showToast('Автомобиль возвращен в ваш гараж');
    onDealershipUpdated();
  };

  const totalCarsSold = dealerships.reduce((sum, d) => sum + d.totalCarsSold, 0);
  const totalRevenue = dealerships.reduce((sum, d) => sum + d.totalRevenueGenerated, 0);
  const totalProfit = dealerships.reduce((sum, d) => sum + d.totalProfitGenerated, 0);

  return (
    <div className="space-y-6" id="car-dealerships-view">
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
          <div className="text-xs text-zinc-400 font-medium">Сеть автосалонов:</div>
          <div className="text-2xl font-black text-white mt-1">{dealerships.length} салонов</div>
          <div className="text-[11px] text-zinc-500 mt-1">Шоурумы и торговые площадки</div>
        </div>

        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
          <div className="text-xs text-zinc-400 font-medium">Продано автомобилей:</div>
          <div className="text-2xl font-black text-white mt-1">{totalCarsSold} шт.</div>
          <div className="text-[11px] text-zinc-500 mt-1">Клиентские розничные продажи</div>
        </div>

        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
          <div className="text-xs text-zinc-400 font-medium">Общая выручка сети:</div>
          <div className="text-2xl font-black text-amber-400 mt-1">${totalRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Оборот розничной реализации</div>
        </div>

        <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
          <div className="text-xs text-zinc-400 font-medium">Чистая прибыль автосалонов:</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">+${totalProfit.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Маржа розницы выше оптового выкупа на +18%</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🏛️</span> Сеть официальных дилерских центров
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Выставляйте восстановленные и выпущенные с завода автомобили на подиум автосалонов с наценкой +15..30%!
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Открыть новый автосалон</span>
        </button>
      </div>

      {/* Dealerships List */}
      <div className="space-y-6">
        {dealerships.map(dealer => {
          const displayCars = ownedCars.filter(c => dealer.carsOnDisplayIds.includes(c.id));

          return (
            <div
              key={dealer.id}
              className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-lg"
            >
              {/* Top Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-full uppercase">
                      Класс: {dealer.type}
                    </span>
                    <span className="text-xs text-zinc-400">📍 {dealer.location}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">{dealer.name}</h3>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-xs text-zinc-500">Заполняемость зала:</span>
                    <div className="text-lg font-bold text-white">
                      {displayCars.length} / {dealer.capacityCars} подиумов
                    </div>
                  </div>

                  <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-300">
                    <span className="text-zinc-500 block text-[10px]">Репутация дилера</span>
                    <strong className="text-amber-400">{Math.round(dealer.reputation)} / 100 ⭐</strong>
                  </div>
                </div>
              </div>

              {/* Cars on Display in Showroom */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <Car className="w-4 h-4 text-amber-400" />
                    <span>Автомобили на витрине ({displayCars.length}):</span>
                  </h4>

                  <button
                    onClick={() => onNavigateToTab('garage')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Добавить авто из гаража</span>
                  </button>
                </div>

                {displayCars.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayCars.map(car => (
                      <div
                        key={car.id}
                        className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2.5 relative"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-bold text-white text-sm">
                              {car.brand} {car.model}
                            </h5>
                            <p className="text-[11px] text-zinc-400">{car.year} г. • {car.condition}% сост.</p>
                          </div>
                          <button
                            onClick={() => handleRemoveCarFromDisplay(dealer, car.id)}
                            className="text-zinc-500 hover:text-rose-400 text-xs"
                            title="Снять с продажи"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-900">
                          <span className="text-zinc-500">Цена в салоне:</span>
                          <strong className="text-emerald-400 font-bold">
                            ${(car.saleAskingPrice || car.marketValue).toLocaleString()}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-zinc-950/60 border border-dashed border-zinc-800 rounded-xl text-center text-xs text-zinc-500">
                    На витрине сейчас нет автомобилей. Перейдите в Гараж и нажмите "В автосалон".
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {dealerships.length === 0 && (
          <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 space-y-3">
            <Store className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">У вас еще нет автосалонов</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Откройте свой первый дилерский центр, чтобы продавать автомобили с высокой розничной маржой вместо оптового дисконта!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-500/20"
            >
              Открыть автосалон
            </button>
          </div>
        )}
      </div>

      {/* Create Dealership Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400" />
                <span>Открытие нового автосалона</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Название автосалона:</label>
                <input
                  type="text"
                  value={newDealerName}
                  onChange={e => setNewDealerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Локация:</label>
                <input
                  type="text"
                  value={newDealerLocation}
                  onChange={e => setNewDealerLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-medium">Класс автосалона:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'budget', name: 'Бюджетный трейд-ин', cost: 75000, cap: 6 },
                    { id: 'standard', name: 'Стандартный дилер', cost: 180000, cap: 12 },
                    { id: 'premium', name: 'Премиум шоурум', cost: 450000, cap: 20 },
                    { id: 'luxury', name: 'Люкс бутик', cost: 1200000, cap: 10 },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setNewDealerType(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        newDealerType === item.id
                          ? 'bg-amber-500/20 border-amber-500 text-white'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <strong className="block text-white text-xs">{item.name}</strong>
                      <span className="text-[11px] text-amber-400 block mt-0.5">${item.cost.toLocaleString()}</span>
                      <span className="text-[10px] text-zinc-500">Вместимость: {item.cap} авто</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateDealership}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20"
              >
                Оплатить и открыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
