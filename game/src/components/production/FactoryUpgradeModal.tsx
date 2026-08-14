/**
 * Business Empire: Ultimate
 * Factory Upgrade Modal (Level 1..6)
 */

import React, { useState } from 'react';
import {
  X,
  ArrowUpRight,
  Check,
  Zap,
  Clock,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { IndustrialFactory } from '../../types/production';
import { UPGRADE_TIERS, FACTORY_RECIPES } from '../../game/production/productionCatalog';
import { industrialManager } from '../../game/production/industrialManager';

interface FactoryUpgradeModalProps {
  factory: IndustrialFactory | null;
  isOpen: boolean;
  onClose: () => void;
  cash: number;
  currency: string;
}

export const FactoryUpgradeModal: React.FC<FactoryUpgradeModalProps> = ({
  factory,
  isOpen,
  onClose,
  cash,
  currency,
}) => {
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isOpen || !factory) return null;

  const currentTier = UPGRADE_TIERS[factory.level - 1] || UPGRADE_TIERS[0];
  const nextTierIndex = factory.level; // index for next level
  const hasNextTier = nextTierIndex < UPGRADE_TIERS.length;
  const nextTier = hasNextTier ? UPGRADE_TIERS[nextTierIndex] : null;

  const canAfford = nextTier ? cash >= nextTier.upgradeCost : false;

  const handleUpgrade = () => {
    setStatusMessage(null);
    const result = industrialManager.upgradeFactory(factory.id);
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono uppercase text-amber-400">Модернизация производственных цехов</span>
            <h2 className="text-lg font-bold text-slate-100 font-mono mt-0.5">{factory.name}</h2>
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
          {/* Current Level vs Next Level Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Current Tier */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-mono uppercase text-slate-400 block mb-1">
                Текущий уровень {currentTier.level}
              </span>
              <h4 className="text-sm font-bold text-slate-200 font-mono">{currentTier.name}</h4>
              <p className="text-xs text-slate-400 mt-1">{currentTier.description}</p>

              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Множитель емкости:</span>
                  <span className="font-mono">x{currentTier.capacityMultiplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ускорение цикла:</span>
                  <span className="font-mono">+{Math.round(currentTier.cycleTimeReduction * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Энергоэффективность:</span>
                  <span className="font-mono">{Math.round(currentTier.energyEfficiency * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Next Tier */}
            {nextTier ? (
              <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-4 relative overflow-hidden">
                <span className="text-xs font-mono uppercase text-emerald-400 font-bold block mb-1">
                  Следующий уровень {nextTier.level} (Апгрейд)
                </span>
                <h4 className="text-sm font-bold text-slate-100 font-mono">{nextTier.name}</h4>
                <p className="text-xs text-slate-300 mt-1">{nextTier.description}</p>

                <div className="mt-3 pt-3 border-t border-emerald-500/20 space-y-1.5 text-xs text-emerald-200">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Множитель емкости:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      x{nextTier.capacityMultiplier} (+{Math.round((nextTier.capacityMultiplier - currentTier.capacityMultiplier) * 100)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Ускорение цикла:</span>
                    <span className="font-mono font-bold text-cyan-400">
                      +{Math.round(nextTier.cycleTimeReduction * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Энергоэффективность:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {Math.round(nextTier.energyEfficiency * 100)}% (-{Math.round((1 - nextTier.energyEfficiency) * 100)}% расхода)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mb-2" />
                <h4 className="text-sm font-bold text-slate-200 font-mono">Максимальный уровень</h4>
                <p className="text-xs text-slate-400 mt-1">Все передовые технологии фабрики разблокированы.</p>
              </div>
            )}
          </div>

          {/* Status Message */}
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

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-slate-800 bg-slate-950">
          <div className="text-xs">
            {nextTier && (
              <>
                <span className="text-slate-400">Стоимость апгрейда: </span>
                <span className="font-mono font-bold text-emerald-400">
                  {currency}{nextTier.upgradeCost.toLocaleString()}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Отмена
            </button>
            {nextTier && (
              <button
                onClick={handleUpgrade}
                disabled={!canAfford}
                className={`px-5 py-2 rounded-lg text-xs font-bold font-mono flex items-center gap-2 transition-all ${
                  canAfford
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/40 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Модернизировать</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
