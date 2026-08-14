/**
 * Business Empire: Ultimate
 * Automotive Factory, Assembly Line, Robotics & Batch Production View
 */

import React, { useState } from 'react';
import {
  Factory,
  Sparkles,
  Zap,
  Boxes,
  Cpu,
  Layers,
  CheckCircle,
  Plus,
  Play,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import {
  AutoFactoryLine,
  CustomCarModelDesign,
  PlayerCarBrand,
} from '../../types/automotive';
import { ManufacturingSystem } from '../../game/automotive/manufacturingSystem';
import { automotiveManager } from '../../game/automotive/automotiveManager';
import { gameState } from '../../game/gameState';
import { economy } from '../../game/economy';

interface Props {
  factories: AutoFactoryLine[];
  brands: PlayerCarBrand[];
  models: CustomCarModelDesign[];
  onFactoryUpdated: () => void;
  onNavigateToTab: (tabId: string) => void;
}

export const CarManufacturingView: React.FC<Props> = ({
  factories,
  brands,
  models,
  onFactoryUpdated,
  onNavigateToTab,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFactoryName, setNewFactoryName] = useState('Автозавод "Titan Motorworks"');
  const [newFactoryLocation, setNewFactoryLocation] = useState('Калужский автокластер');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const playerCash = gameState.getState().cash;
  const currentDay = gameState.getState().gameTime.day;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateFactory = () => {
    const { factory, cost } = ManufacturingSystem.createFactoryLine(newFactoryName, newFactoryLocation);

    if (playerCash < cost) {
      showToast(`Недостаточно средств для строительства автозавода! Требуется $${cost.toLocaleString()}`);
      return;
    }

    economy.removeMoney(
      cost,
      'Автозаводы',
      `Строительство автосборочного завода: ${factory.name}`,
      'investment'
    );

    gameState.update(draft => {
      if (draft.automotive) {
        draft.automotive.factoryLines.push(factory);
      }
    });

    showToast(`Автомобильный сборочный завод "${factory.name}" успешно запущен!`);
    setShowCreateModal(false);
    onFactoryUpdated();
  };

  const handleUpgrade = (factory: AutoFactoryLine, type: 'robotics' | 'paint' | 'qc') => {
    const res = ManufacturingSystem.upgradeFactoryLine(factory, type);
    if (!res.success) {
      showToast(res.message);
      return;
    }

    if (playerCash < res.cost) {
      showToast(`Недостаточно средств для модернизации! Требуется $${res.cost.toLocaleString()}`);
      return;
    }

    economy.removeMoney(
      res.cost,
      'Автозаводы',
      `Модернизация завода "${factory.name}": ${type}`,
      'investment'
    );

    showToast(res.message);
    onFactoryUpdated();
  };

  const handleProduceUnit = (factory: AutoFactoryLine, model: CustomCarModelDesign) => {
    const unitCost = model.calculatedUnitCost;
    if (playerCash < unitCost) {
      showToast(`Недостаточно средств для запуска сборки! Себестоимость единицы: $${unitCost.toLocaleString()}`);
      return;
    }

    const brand = brands.find(b => b.id === model.brandId);
    const brandName = brand ? brand.name : 'Custom Motors';

    const producedCar = ManufacturingSystem.produceCarUnit(model, brandName, factory, currentDay);

    economy.removeMoney(
      unitCost,
      'Производство',
      `Заводской выпуск: ${producedCar.brand} ${producedCar.model} (Завод: ${factory.name})`,
      'expense'
    );

    gameState.update(draft => {
      if (draft.automotive) {
        draft.automotive.ownedCars.unshift(producedCar);
        draft.automotive.totalCarsManufactured += 1;
      }
    });

    showToast(`Готово! Новый серийный автомобиль ${producedCar.brand} ${producedCar.model} сошел с конвейера и отправлен в ваш гараж!`);
    onFactoryUpdated();
  };

  return (
    <div className="space-y-6" id="car-manufacturing-view">
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

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🏭</span> Заводы серийного автопроизводства
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Конвейерная сборка, KUKA робототехника, катафорезная покраска и лазерный контроль геометрии кузова.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Построить автозавод ($2.5M)</span>
        </button>
      </div>

      {/* Factories List */}
      <div className="space-y-6">
        {factories.map(fac => (
          <div
            key={fac.id}
            className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xl"
          >
            {/* Factory Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-bold rounded-full">
                    KUKA Robotics {fac.roboticsLevel}.0
                  </span>
                  <span className="text-xs text-zinc-400">📍 {fac.location}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mt-1">{fac.name}</h3>
                <p className="text-xs text-zinc-400">{fac.tierName}</p>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Мощность линии:</span>
                  <strong className="text-amber-400 text-base">{fac.capacityCarsPerMonth} авто/мес</strong>
                </div>
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Уровень брака:</span>
                  <strong className="text-emerald-400 text-base">{fac.defectRatePct.toFixed(1)}%</strong>
                </div>
              </div>
            </div>

            {/* Upgrades Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleUpgrade(fac, 'robotics')}
                className="p-3.5 bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 rounded-xl text-left transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-sky-400" />
                    <span>Роботизация сборочной линии</span>
                  </span>
                  <span className="text-amber-400 font-bold">${(1.2 * fac.roboticsLevel).toFixed(1)}M</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Уровень: {fac.roboticsLevel}/5 (+40 авто/мес, -1.5% брак)
                </p>
              </button>

              <button
                onClick={() => handleUpgrade(fac, 'paint')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  fac.automatedPaintShop
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-zinc-950 hover:bg-zinc-800/80 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Катафорезная покраска</span>
                  </span>
                  <span className="text-amber-400 font-bold">{fac.automatedPaintShop ? 'Установлено' : '$1.8M'}</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {fac.automatedPaintShop ? 'Роботы-распылители активны (-2% брак)' : 'Устраняет дефекты ЛКП на 100%'}
                </p>
              </button>

              <button
                onClick={() => handleUpgrade(fac, 'qc')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  fac.qualityControlLab
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-zinc-950 hover:bg-zinc-800/80 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Лазерный QC 3D-контроль</span>
                  </span>
                  <span className="text-amber-400 font-bold">{fac.qualityControlLab ? 'Установлено' : '$950k'}</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {fac.qualityControlLab ? 'Тестовый трек и ISO 9001 работают' : 'Снижает гарантийные рекламации'}
                </p>
              </button>
            </div>

            {/* Production Matrix: Ready Models to Build */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-amber-400" />
                  <span>Модели вашей марки, готовые к серийному производству:</span>
                </h4>

                <button
                  onClick={() => onNavigateToTab('rnd')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Спроектировать новую модель</span>
                </button>
              </div>

              {models.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {models.map(m => {
                    const grossMargin = m.recommendedRetailPrice - m.calculatedUnitCost;
                    const marginPct = Math.round((grossMargin / m.calculatedUnitCost) * 100);

                    return (
                      <div
                        key={m.id}
                        className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-amber-400">{m.bodyType}</span>
                              <h5 className="text-base font-bold text-white">{m.name}</h5>
                              <p className="text-xs text-zinc-400">
                                {m.engineType} • {m.enginePowerHp} л.с.
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-zinc-500 block">Себестоимость:</span>
                              <strong className="text-white text-sm">${m.calculatedUnitCost.toLocaleString()}</strong>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-zinc-900">
                            <span className="text-zinc-400">Рекомендуемая цена (RRP):</span>
                            <span className="text-emerald-400 font-bold">
                              ${m.recommendedRetailPrice.toLocaleString()} (+{marginPct}%)
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleProduceUnit(fac, m)}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
                        >
                          <Play className="w-3.5 h-3.5 fill-black" />
                          <span>Выпустить серийный автомобиль (-${m.calculatedUnitCost.toLocaleString()})</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 bg-zinc-950/60 border border-dashed border-zinc-800 rounded-xl text-center text-xs text-zinc-500 space-y-2">
                  <p>У вас еще нет спроектированных моделей в КБ (Конструкторском Бюро).</p>
                  <button
                    onClick={() => onNavigateToTab('rnd')}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Перейти в Конструкторское Бюро
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {factories.length === 0 && (
          <div className="text-center py-20 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 space-y-3">
            <Factory className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">У вас еще нет автосборочных заводов</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Постройте современный автозавод, чтобы производить автомобили собственной марки и продавать их через свои автосалоны!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-500/20"
            >
              Построить автозавод ($2.5M)
            </button>
          </div>
        )}
      </div>

      {/* Create Factory Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Factory className="w-5 h-5 text-amber-400" />
                <span>Строительство автозавода</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Название автозавода:</label>
                <input
                  type="text"
                  value={newFactoryName}
                  onChange={e => setNewFactoryName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Локация:</label>
                <input
                  type="text"
                  value={newFactoryLocation}
                  onChange={e => setNewFactoryLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Стоимость строительства:</span>
                  <strong className="text-amber-400">$2,500,000</strong>
                </div>
                <div className="flex justify-between">
                  <span>Штат:</span>
                  <span className="text-white">45 рабочих, 8 инженеров</span>
                </div>
                <div className="flex justify-between">
                  <span>Стартовая мощность:</span>
                  <span className="text-white">60 авто / месяц</span>
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
                onClick={handleCreateFactory}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20"
              >
                Начать стройку
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
