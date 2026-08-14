import React from 'react';
import {
  X,
  Star,
  Lock,
  Unlock,
  DollarSign,
  TrendingUp,
  Award,
  Sparkles,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { SkinItem } from '../../types/cases';
import { RARITY_CONFIG } from '../../game/cases/skinCatalog';
import { casesManager } from '../../game/cases/casesManager';

interface SkinInspectModalProps {
  skin: SkinItem;
  onClose: () => void;
  onQuickSell?: (skin: SkinItem) => void;
  onNavigateToUpgrade?: (skin: SkinItem) => void;
  onNavigateToMarket?: (skin: SkinItem) => void;
}

export const SkinInspectModal: React.FC<SkinInspectModalProps> = ({
  skin,
  onClose,
  onQuickSell,
  onNavigateToUpgrade,
  onNavigateToMarket,
}) => {
  const rarityCfg = RARITY_CONFIG[skin.rarity] || RARITY_CONFIG.Common;
  const isFavorite = skin.isFavorite;
  const isLocked = skin.isLocked;

  const handleToggleFavorite = () => {
    casesManager.toggleFavorite(skin.id);
  };

  const handleToggleLock = () => {
    casesManager.toggleLock(skin.id);
  };

  // Float bar position in percent (0% to 100%)
  const floatPercent = Math.min(100, Math.max(0, skin.float * 100));

  return (
    <div
      id="skin-inspect-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="skin-inspect-modal-card"
        className={`relative w-full max-w-2xl bg-slate-900/95 border ${rarityCfg.border} rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]`}
      >
        {/* Top Glow Bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${rarityCfg.gradient}`} />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 text-xs font-black rounded-lg uppercase tracking-wider ${rarityCfg.badgeBg}`}>
              {rarityCfg.name}
            </span>
            <span className="text-xs text-slate-400 font-medium">{skin.collectionName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="inspect-favorite-btn"
              onClick={handleToggleFavorite}
              className={`p-2 rounded-lg border transition-all ${
                isFavorite
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-amber-300'
              }`}
              title={isFavorite ? 'В избранном' : 'Добавить в избранное'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>

            <button
              id="inspect-lock-btn"
              onClick={handleToggleLock}
              className={`p-2 rounded-lg border transition-all ${
                isLocked
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-rose-300'
              }`}
              title={isLocked ? 'Заблокирован от продажи' : 'Заблокировать от продажи'}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>

            <button
              id="inspect-close-btn"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Visual Showcase */}
          <div
            className={`relative rounded-xl p-8 flex flex-col items-center justify-center bg-gradient-to-b ${rarityCfg.gradient} border ${rarityCfg.border} overflow-hidden`}
          >
            <div className="absolute inset-0 bg-radial-gradient opacity-20 pointer-events-none" />

            {/* Special Pattern / StatTrak Tag */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {skin.hasStatTrak && (
                <span className="px-2.5 py-0.5 text-xs font-black bg-orange-500/25 text-orange-300 border border-orange-500/50 rounded-md tracking-wider flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-orange-400" />
                  StatTrak™ ({skin.statTrak || 0})
                </span>
              )}
              {skin.isSpecialPattern && (
                <span className="px-2.5 py-0.5 text-xs font-black bg-amber-500/30 text-amber-200 border border-amber-400/60 rounded-md tracking-wider flex items-center gap-1 shadow-sm">
                  <Award className="w-3 h-3 text-amber-300" />
                  {skin.specialPatternName || `Pattern #${skin.pattern}`}
                </span>
              )}
            </div>

            {/* Big Emoji / Art Icon */}
            <div className="text-8xl my-4 drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] animate-pulse transition-transform hover:scale-105 duration-300 cursor-pointer">
              {skin.iconEmoji}
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-2xl font-black text-white text-center tracking-wide drop-shadow-md">
              {skin.name}
            </h2>
            <p className="text-sm font-semibold text-slate-300 mt-1">{skin.condition}</p>

            {/* Estimated Value */}
            <div className="mt-4 px-4 py-1.5 rounded-full bg-slate-950/70 border border-amber-500/40 text-amber-300 font-extrabold text-base flex items-center gap-1.5 shadow-lg">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>{skin.marketValue.toLocaleString()} CC</span>
              <span className="text-xs text-slate-400 font-normal">(${(skin.marketValue).toLocaleString()})</span>
            </div>
          </div>

          {/* Float Meter & Specifications */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Степень износа (Float Value)
              </span>
              <span className="font-mono text-sm font-black text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                {skin.float.toFixed(4)}
              </span>
            </div>

            {/* Float Continuous Gradient Bar */}
            <div className="relative pt-4 pb-2">
              {/* Pointer Needle */}
              <div
                className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                style={{ left: `${floatPercent}%` }}
              >
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-slate-900 border border-amber-500/50 px-1 rounded shadow">
                  {skin.float.toFixed(3)}
                </span>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-amber-400" />
              </div>

              {/* Progress Segments */}
              <div className="h-3 w-full rounded-full overflow-hidden flex border border-slate-700 bg-slate-800 shadow-inner">
                <div className="h-full bg-emerald-500" style={{ width: '7%' }} title="Factory New (0.00 - 0.07)" />
                <div className="h-full bg-teal-500" style={{ width: '8%' }} title="Minimal Wear (0.07 - 0.15)" />
                <div className="h-full bg-sky-500" style={{ width: '23%' }} title="Field-Tested (0.15 - 0.38)" />
                <div className="h-full bg-amber-500" style={{ width: '7%' }} title="Well-Worn (0.38 - 0.45)" />
                <div className="h-full bg-rose-600" style={{ width: '55%' }} title="Battle-Scarred (0.45 - 1.00)" />
              </div>

              {/* Scale Labels */}
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>0.00 (FN)</span>
                <span>0.07 (MW)</span>
                <span>0.15 (FT)</span>
                <span>0.38 (WW)</span>
                <span>1.00 (BS)</span>
              </div>
            </div>

            {/* Grid Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Паттерн (Pattern ID)</span>
                <span className="text-sm font-bold text-slate-200 font-mono flex items-center gap-1">
                  #{skin.pattern}
                  {skin.isSpecialPattern && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                </span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Категория</span>
                <span className="text-sm font-bold text-slate-200">{skin.category}</span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Происхождение</span>
                <span className="text-sm font-bold text-slate-200 capitalize">
                  {skin.origin === 'case_opening'
                    ? 'Открытие кейса'
                    : skin.origin === 'crafting'
                    ? 'Крафт на заводе'
                    : skin.origin === 'trade_up'
                    ? 'Trade-Up Контракт'
                    : skin.origin === 'upgrade'
                    ? 'Upgrade Апгрейд'
                    : skin.origin === 'auction'
                    ? 'Аукцион'
                    : skin.origin === 'reward'
                    ? 'Награда за коллекцию'
                    : 'Маркет'}
                </span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Базовая стоимость</span>
                <span className="text-sm font-bold text-amber-300">{skin.baseValue.toLocaleString()} CC</span>
              </div>
            </div>
          </div>

          {/* Lore & Description */}
          {skin.description && (
            <div className="text-xs text-slate-400 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 leading-relaxed italic">
              "{skin.description}"
              {skin.craftedByBrand && (
                <div className="mt-2 text-indigo-400 font-semibold not-italic flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Скрафчено студией: {skin.craftedByBrand}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-950/80 border-t border-slate-800">
          <button
            id="inspect-sell-quick-btn"
            onClick={() => {
              if (onQuickSell) onQuickSell(skin);
              onClose();
            }}
            disabled={isLocked}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              isLocked
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Быстрая продажа ({Math.round(skin.marketValue * 0.85).toLocaleString()} CC)
          </button>

          <div className="flex items-center gap-2">
            {onNavigateToUpgrade && (
              <button
                id="inspect-upgrade-btn"
                onClick={() => {
                  onNavigateToUpgrade(skin);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl font-bold text-sm bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition-all flex items-center gap-1.5"
              >
                <ArrowUpRight className="w-4 h-4" />
                В Апгрейд
              </button>
            )}

            {onNavigateToMarket && (
              <button
                id="inspect-market-list-btn"
                onClick={() => {
                  onNavigateToMarket(skin);
                  onClose();
                }}
                disabled={isLocked}
                className="px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-400 hover:to-yellow-400 transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <TrendingUp className="w-4 h-4" />
                Выставить на Маркет
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
