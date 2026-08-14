/**
 * Business Empire: Ultimate
 * Automotive Brand, R&D Tech Tree & Custom Model Designer (Конструкторское Бюро)
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Cpu,
  Layers,
  CheckCircle,
  Plus,
  Compass,
  Award,
  Sliders,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import {
  AutomotiveRndTech,
  CarCategory,
  CustomCarModelDesign,
  PlayerCarBrand,
} from '../../types/automotive';
import { BrandAndRndSystem } from '../../game/automotive/brandAndRndSystem';
import { ManufacturingSystem } from '../../game/automotive/manufacturingSystem';
import { gameState } from '../../game/gameState';
import { economy } from '../../game/economy';

interface Props {
  brands: PlayerCarBrand[];
  models: CustomCarModelDesign[];
  technologies: AutomotiveRndTech[];
  onDataUpdated: () => void;
  onNavigateToTab: (tabId: string) => void;
}

export const CarBrandAndRndView: React.FC<Props> = ({
  brands,
  models,
  technologies,
  onDataUpdated,
  onNavigateToTab,
}) => {
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showDesignModal, setShowDesignModal] = useState(false);

  // Brand Form
  const [brandName, setBrandName] = useState('Titan Motors');
  const [brandCountry, setBrandCountry] = useState('Германия');
  const [brandPositioning, setBrandPositioning] = useState<'budget' | 'mass' | 'premium' | 'luxury' | 'sport' | 'ev'>('premium');

  // Designer Form
  const [modelName, setModelName] = useState('Spectre GT');
  const [modelCategory, setModelCategory] = useState<CarCategory>('sport');
  const [engineType, setEngineType] = useState<'ice_i4_turbo' | 'ice_v6_twin_turbo' | 'ice_v8_twin_turbo' | 'hybrid_phev' | 'electric_single_motor' | 'electric_dual_motor'>('ice_v8_twin_turbo');
  const [enginePower, setEnginePower] = useState<number>(550);
  const [interiorTrim, setInteriorTrim] = useState<'cloth_standard' | 'leatherette' | 'genuine_leather' | 'nappa_carbon' | 'executive_wood'>('nappa_carbon');
  const [techPackage, setTechPackage] = useState<'basic' | 'comfort' | 'advanced_driver_assist' | 'full_autopilot'>('full_autopilot');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const playerCash = gameState.getState().cash;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateBrand = () => {
    const brand = BrandAndRndSystem.createBrand(brandName, brandCountry, brandPositioning);
    gameState.update(draft => {
      if (draft.automotive) {
        draft.automotive.playerBrands.push(brand);
      }
    });

    showToast(`Автомобильный бренд "${brand.name}" успешно зарегистрирован!`);
    setShowBrandModal(false);
    onDataUpdated();
  };

  const handleCreateDesign = () => {
    if (brands.length === 0) {
      showToast('Сначала зарегистрируйте свой автомобильный бренд!');
      return;
    }

    const activeBrand = brands[0];
    const design = BrandAndRndSystem.designNewModel(
      activeBrand,
      modelName,
      modelCategory,
      engineType,
      enginePower,
      interiorTrim,
      techPackage
    );

    gameState.update(draft => {
      if (draft.automotive) {
        draft.automotive.customModels.push(design);
      }
    });

    showToast(`Проект модели "${design.name}" успешно утвержден в КБ! Теперь её можно выпускать на заводе!`);
    setShowDesignModal(false);
    onDataUpdated();
  };

  const handleUnlockTech = (tech: AutomotiveRndTech) => {
    if (playerCash < tech.cost) {
      showToast(`Недостаточно средств для исследования! Требуется $${tech.cost.toLocaleString()}`);
      return;
    }

    economy.removeMoney(
      tech.cost,
      'R&D Исследования',
      `R&D исследование: ${tech.name}`,
      'investment'
    );

    gameState.update(draft => {
      const t = draft.automotive?.rndTechnologies.find(item => item.id === tech.id);
      if (t) {
        t.unlocked = true;
        t.progressHours = t.researchHours;
      }
    });

    showToast(`Технология "${tech.name}" успешно разработана и внедрена в производство!`);
    onDataUpdated();
  };

  const currentCostPreview = ManufacturingSystem.calculateUnitCost({
    engineType,
    enginePowerHp: enginePower,
    interiorTrim,
    techPackage,
  });

  return (
    <div className="space-y-6" id="car-brand-rnd-view">
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

      {/* Brand Profile & Designer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🏎️</span> Автомобильный бренд и Конструкторское Бюро (КБ)
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Разрабатывайте собственные платформы, двигатели, автопилот и проектируйте уникальные автомобили!
          </p>
        </div>

        <div className="flex items-center gap-3">
          {brands.length === 0 ? (
            <button
              onClick={() => setShowBrandModal(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>Создать автобренд</span>
            </button>
          ) : (
            <button
              onClick={() => setShowDesignModal(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Sliders className="w-4 h-4" />
              <span>Спроектировать модель</span>
            </button>
          )}
        </div>
      </div>

      {/* Registered Brands Section */}
      {brands.length > 0 && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{brands[0].logo}</span>
              <div>
                <h3 className="text-xl font-bold text-white">{brands[0].name}</h3>
                <p className="text-xs text-zinc-400">
                  Штаб-квартира: {brands[0].country} • Позиционирование: {brands[0].positioning.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Престиж марки:</span>
                <strong className="text-amber-400 text-base">{brands[0].prestigeScore} / 100 🏆</strong>
              </div>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Моделей в гамме:</span>
                <strong className="text-white text-base">{models.length} моделей</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Models Designed in R&D */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          <span>Разработанные модели в Конструкторском Бюро ({models.length}):</span>
        </h3>

        {models.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map(m => (
              <div key={m.id} className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 space-y-3 shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase">{m.bodyType}</span>
                    <h4 className="text-lg font-bold text-white mt-0.5">{m.name}</h4>
                    <p className="text-xs text-zinc-400">
                      {m.engineType} ({m.enginePowerHp} л.с.)
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">Unit Cost:</span>
                    <span className="text-sm font-bold text-white">${m.calculatedUnitCost.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-800 text-zinc-300">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Отделка салона:</span>
                    <span className="truncate block font-medium">{m.interiorTrim}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Автопилот / ADAS:</span>
                    <span className="truncate block font-medium">{m.techPackage}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800">
                  <span className="text-zinc-400">Розничная цена (RRP):</span>
                  <strong className="text-emerald-400 font-bold">${m.recommendedRetailPrice.toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-center text-xs text-zinc-500">
            В конструкторском бюро пока нет утвержденных чертежей. Нажмите "Спроектировать модель", чтобы задать характеристики.
          </div>
        )}
      </div>

      {/* R&D Tech Tree */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            <span>Дерево R&D Технологий и Патентов</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Открывайте передовые инженерные решения, снижающие себестоимость сборки и повышающие спрос на мировом рынке.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {technologies.map(tech => (
            <div
              key={tech.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                tech.unlocked
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm shadow-emerald-500/5'
                  : 'bg-zinc-900/90 border-zinc-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400">
                    Категория: {tech.category}
                  </span>
                  {tech.unlocked ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                      <CheckCircle className="w-4 h-4" /> Изучено
                    </span>
                  ) : (
                    <span className="text-xs font-black text-amber-400">${tech.cost.toLocaleString()}</span>
                  )}
                </div>

                <h4 className="text-base font-bold text-white mt-1.5">{tech.name}</h4>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{tech.description}</p>
              </div>

              {!tech.unlocked && (
                <button
                  onClick={() => handleUnlockTech(tech)}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Исследовать (-${tech.cost.toLocaleString()})</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Brand Registration Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Регистрация автоконцерна</span>
              </h3>
              <button onClick={() => setShowBrandModal(false)} className="text-zinc-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Название бренда:</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Страна штаб-квартиры:</label>
                <input
                  type="text"
                  value={brandCountry}
                  onChange={e => setBrandCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Сегмент рынка:</label>
                <select
                  value={brandPositioning}
                  onChange={e => setBrandPositioning(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm"
                >
                  <option value="budget">Бюджетный масс-маркет</option>
                  <option value="mass">Средний класс (Standard)</option>
                  <option value="premium">Премиальный сегмент</option>
                  <option value="luxury">Люкс и представительский</option>
                  <option value="sport">Спорткары и суперкары</option>
                  <option value="ev">Инновационные электромобили (EV)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowBrandModal(false)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateBrand}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20"
              >
                Зарегистрировать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Model Configurator Designer Modal */}
      {showDesignModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <span>Конфигуратор новой модели в КБ</span>
              </h3>
              <button onClick={() => setShowDesignModal(false)} className="text-zinc-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">Название модели:</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={e => setModelName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium">Класс кузова:</label>
                  <select
                    value={modelCategory}
                    onChange={e => setModelCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="sedan">Седан</option>
                    <option value="suv">Внедорожник / SUV</option>
                    <option value="crossover">Кроссовер</option>
                    <option value="sport">Спорткупе</option>
                    <option value="ev">Электрокар</option>
                    <option value="luxury">Представительский</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium">Силовая установка:</label>
                  <select
                    value={engineType}
                    onChange={e => setEngineType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="ice_i4_turbo">2.0L I4 Turbo</option>
                    <option value="ice_v6_twin_turbo">3.0L V6 Twin-Turbo</option>
                    <option value="ice_v8_twin_turbo">4.4L V8 Twin-Turbo</option>
                    <option value="hybrid_phev">PHEV Гибрид</option>
                    <option value="electric_dual_motor">EV Dual Motor 4WD</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Мощность двигателя:</span>
                  <strong className="text-amber-400">{enginePower} л.с.</strong>
                </div>
                <input
                  type="range"
                  min="150"
                  max="1100"
                  step="10"
                  value={enginePower}
                  onChange={e => setEnginePower(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium">Отделка интерьера:</label>
                  <select
                    value={interiorTrim}
                    onChange={e => setInteriorTrim(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="cloth_standard">Ткань стандарт</option>
                    <option value="genuine_leather">Кожа Dakota</option>
                    <option value="nappa_carbon">Nappa + Carbon Fiber</option>
                    <option value="executive_wood">Executive Wood & Alcantara</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-medium">Пакет ассистентов:</label>
                  <select
                    value={techPackage}
                    onChange={e => setTechPackage(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="basic">Базовый</option>
                    <option value="comfort">Комфорт + Камеры 360</option>
                    <option value="full_autopilot">Автопилот L3 + LiDAR</option>
                  </select>
                </div>
              </div>

              {/* Real-time Unit Cost Calculation Preview */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1.5 text-xs">
                <div className="font-bold text-white flex items-center justify-between pb-1 border-b border-zinc-900">
                  <span>Расчет Unit-экономики единицы:</span>
                  <span className="text-emerald-400 font-bold">Маржа 45%</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Себестоимость сборки (Unit Cost):</span>
                  <strong className="text-white">${currentCostPreview.totalUnitCost.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Рекомендуемая розничная цена (RRP):</span>
                  <strong className="text-amber-400">${currentCostPreview.recommendedRetailPrice.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowDesignModal(false)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateDesign}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20"
              >
                Утвердить чертеж в КБ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
