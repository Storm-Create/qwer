/**
 * Business Empire: Ultimate
 * Factory Construction Modal
 */

import React, { useState } from 'react';
import {
  X,
  Wheat,
  Shirt,
  Flame,
  Cpu,
  Cog,
  Car,
  Check,
  Zap,
  Users,
  Wrench,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { FactoryType } from '../../types/production';
import { FACTORY_BLUEPRINTS } from '../../game/production/productionCatalog';
import { industrialManager } from '../../game/production/industrialManager';

interface FactoryBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  cash: number;
  currency: string;
}

const FACTORY_TYPES: FactoryType[] = [
  'food_factory',
  'textile_factory',
  'metallurgy_plant',
  'electronics_plant',
  'autoparts_factory',
  'automobile_plant',
];

export const FactoryBuildModal: React.FC<FactoryBuildModalProps> = ({
  isOpen,
  onClose,
  cash,
  currency,
}) => {
  const [selectedType, setSelectedType] = useState<FactoryType>('food_factory');
  const [customName, setCustomName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Центральный промышленный парк');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isOpen) return null;

  const blueprint = FACTORY_BLUEPRINTS[selectedType];
  const canAfford = cash >= blueprint.purchaseCost;

  const getFactoryIcon = (type: FactoryType) => {
    switch (type) {
      case 'food_factory':
        return <Wheat className="w-5 h-5" />;
      case 'textile_factory':
        return <Shirt className="w-5 h-5" />;
      case 'metallurgy_plant':
        return <Flame className="w-5 h-5" />;
      case 'electronics_plant':
        return <Cpu className="w-5 h-5" />;
      case 'autoparts_factory':
        return <Cog className="w-5 h-5" />;
      case 'automobile_plant':
        return <Car className="w-5 h-5" />;
    }
  };

  const handleBuild = () => {
    setStatusMessage(null);
    const result = industrialManager.purchaseFactory(
      selectedType,
      customName.trim() || undefined,
      selectedLocation
    );

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono uppercase text-emerald-400">Промышленный девелопмент</span>
            <h2 className="text-xl font-bold text-slate-100 font-mono">Строительство нового завода</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 lg:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Factory Types Selection Grid */}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-2.5">
              Выберите отраслевой профиль предприятия:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FACTORY_TYPES.map((type) => {
                const bp = FACTORY_BLUEPRINTS[type];
                const isSelected = type === selectedType;

                return (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type);
                      setCustomName('');
                      setStatusMessage(null);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-slate-800 text-emerald-400">
                        {getFactoryIcon(type)}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-200 font-mono">{bp.name}</div>
                      <div className="text-[11px] font-mono text-emerald-400 font-semibold mt-1">
                        {currency}{bp.purchaseCost.toLocaleString()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Factory Specification */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 lg:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono uppercase text-slate-400">{blueprint.categoryTitle}</span>
                <h3 className="text-lg font-bold text-slate-100 font-mono mt-0.5">{blueprint.name}</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">{blueprint.description}</p>
              </div>

              <div className="text-right sm:self-center">
                <span className="text-xs text-slate-400 block">Стоимость строительства:</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {currency}{blueprint.purchaseCost.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Specifications Matrix */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 text-[11px] mb-1">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" /> Базовая мощность:
                </span>
                <span className="font-mono text-slate-200 font-bold text-sm">
                  {blueprint.baseCapacityUnitsDaily} ед./день
                </span>
              </div>

              <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 text-[11px] mb-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" /> Время цикла:
                </span>
                <span className="font-mono text-slate-200 font-bold text-sm">
                  {blueprint.baseProductionTimeHours} ч./партия
                </span>
              </div>

              <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 text-[11px] mb-1">
                  <Users className="w-3.5 h-3.5 text-purple-400" /> Мин. персонал:
                </span>
                <span className="font-mono text-slate-200 font-bold text-sm">
                  {blueprint.minEmployees} чел. ({currency}{blueprint.minEmployees * blueprint.baseSalaryDailyPerWorker}/д)
                </span>
              </div>

              <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 text-[11px] mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Энергопотребление:
                </span>
                <span className="font-mono text-slate-200 font-bold text-sm">
                  {blueprint.baseElectricityKWhDaily} кВт⋅ч/день
                </span>
              </div>
            </div>
          </div>

          {/* Factory Customization Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">
                Название предприятия (опционально):
              </label>
              <input
                type="text"
                value={customName}
                placeholder={blueprint.name}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">
                Локация и промышленный кластер:
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Москва (Южный промышленный узел)">Москва (Южный промышленный узел)</option>
                <option value="Санкт-Петербург (Логистический хаб Порта)">Санкт-Петербург (Логистический хаб Порта)</option>
                <option value="Екатеринбург (Уральский кластер тяжелой индустрии)">Екатеринбург (Уральский кластер)</option>
                <option value="Казань (Технополис Иннополис)">Казань (Технополис Иннополис)</option>
                <option value="Новосибирск (Сибирский научный парк)">Новосибирск (Сибирский научный парк)</option>
              </select>
            </div>
          </div>

          {/* Status Message if any */}
          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-medium border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-red-500/10 text-red-300 border-red-500/30'
              }`}
            >
              {statusMessage.text}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-5 border-t border-slate-800 bg-slate-950">
          <div className="text-xs">
            <span className="text-slate-400">Доступный капитал: </span>
            <span className="font-mono font-bold text-slate-200">
              {currency}{cash.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleBuild}
              disabled={!canAfford}
              className={`px-5 py-2 rounded-lg text-xs font-bold font-mono flex items-center gap-2 transition-all ${
                canAfford
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <span>Построить завод</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
