/**
 * Business Empire: Ultimate
 * Real Estate Upgrade Modal
 */

import React from 'react';
import { X, ArrowUpCircle, Check, Sparkles, Building, TrendingUp } from 'lucide-react';
import { RealEstateProperty } from '../../types/realEstate';
import { UPGRADE_TIERS } from '../../game/realEstate/realEstateCatalog';
import { realEstateManager } from '../../game/realEstate/realEstateManager';

interface UpgradePropertyModalProps {
  property: RealEstateProperty | null;
  playerCash: number;
  onClose: () => void;
  onConfirmUpgrade: (propertyId: string) => void;
  currency?: string;
}

export const UpgradePropertyModal: React.FC<UpgradePropertyModalProps> = ({
  property,
  playerCash,
  onClose,
  onConfirmUpgrade,
  currency = '$',
}) => {
  if (!property) return null;

  const currentLevel = property.level;
  const nextTier = UPGRADE_TIERS.find((t) => t.level === currentLevel + 1);
  const upgradeCost = realEstateManager.getUpgradeCost(property);
  const canAfford = playerCash >= upgradeCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-xl">
              {property.imageEmoji || '🏢'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Модернизация объекта</h3>
              <p className="text-xs text-slate-400">{property.name} (Уровень {currentLevel})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {nextTier ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-300">
                  Следующий уровень: {nextTier.level} — {nextTier.name}
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {currency}{upgradeCost.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {nextTier.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                  <div className="text-slate-400 text-[11px]">Рост стоимости:</div>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">
                    +{Math.round(nextTier.valueBonusMultiplier * 100)}% к капитализации
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                  <div className="text-slate-400 text-[11px]">Рост арендной ставки:</div>
                  <div className="font-mono font-bold text-emerald-400 mt-0.5">
                    +{Math.round(nextTier.rentBonusMultiplier * 100)}% к доходу
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                  <div className="text-slate-400 text-[11px]">Снижение издержек:</div>
                  <div className="font-mono font-bold text-teal-400 mt-0.5">
                    -{Math.round(nextTier.maintenanceReduction * 100)}% расходов
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                  <div className="text-slate-400 text-[11px]">Бонус к заполняемости:</div>
                  <div className="font-mono font-bold text-blue-400 mt-0.5">
                    +{nextTier.occupancyBonus}% арендаторов
                  </div>
                </div>
              </div>
            </div>

            {/* Current vs Next preview */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Текущая стоимость:</span>
                <span className="font-mono text-slate-300">{currency}{property.marketValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Стоимость после апгрейда:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {currency}{Math.round(property.marketValue * (1 + nextTier.valueBonusMultiplier)).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  onConfirmUpgrade(property.id);
                  onClose();
                }}
                disabled={!canAfford}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  canAfford
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>
                  {canAfford
                    ? `Улучшить за ${currency}${upgradeCost.toLocaleString()}`
                    : `Недостаточно средств (${currency}${upgradeCost.toLocaleString()})`}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-sm">
            Объект уже модернизирован до максимального уровня.
          </div>
        )}
      </div>
    </div>
  );
};
