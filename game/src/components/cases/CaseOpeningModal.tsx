import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  DollarSign,
  RotateCw,
  Zap,
  ArrowRight,
  Trophy,
  Award,
} from 'lucide-react';
import { CaseDefinition, SkinItem } from '../../types/cases';
import { RARITY_CONFIG } from '../../game/cases/skinCatalog';
import { casesManager } from '../../game/cases/casesManager';
import { casinoManager } from '../../game/casino/casinoManager';

interface CaseOpeningModalProps {
  caseDef: CaseDefinition;
  onClose: () => void;
  onOpenAnother?: () => void;
}

export const CaseOpeningModal: React.FC<CaseOpeningModalProps> = ({
  caseDef,
  onClose,
  onOpenAnother,
}) => {
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'revealed'>('idle');
  const [fastOpen, setFastOpen] = useState(false);
  const [multiCount, setMultiCount] = useState<1 | 5 | 10>(1);
  const [winningItems, setWinningItems] = useState<SkinItem[]>([]);
  const [reelItems, setReelItems] = useState<SkinItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reelContainerRef = useRef<HTMLDivElement>(null);
  const [reelTranslateX, setReelTranslateX] = useState<number>(0);

  // Sound effect generator using standard Web Audio API
  const playTickSound = (frequency: number = 440) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  const playWinSound = (isUltra: boolean = false) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const notes = isUltra ? [523.25, 659.25, 783.99, 1046.5, 1318.5] : [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.45);
      });
    } catch {
      // Ignore audio error
    }
  };

  const startOpening = () => {
    setErrorMsg(null);
    const result = casesManager.openCase(caseDef.id, multiCount);
    if (!result.success || !result.items || result.items.length === 0) {
      setErrorMsg(result.error || 'Не удалось открыть кейс');
      return;
    }

    setWinningItems(result.items);

    if (fastOpen || multiCount > 1) {
      // Instant reveal
      setPhase('revealed');
      const isRare = result.items.some(
        (it) => it.rarity === 'Legendary' || it.rarity === 'Mythic' || it.rarity === 'Ultra Rare' || it.rarity === 'Prestige'
      );
      playWinSound(isRare);
      return;
    }

    // 1-item animated unboxing roulette
    const firstWon = result.items[0];
    const generatedReel = casesManager.generateReelItems(caseDef.id, firstWon, 45);
    setReelItems(generatedReel);
    setPhase('spinning');

    // Item card width = 160px + gap = 16px -> 176px per item
    // Target landing is item index 35 (center)
    const itemWidth = 176;
    const targetItemIndex = 35;
    // Add small random offset inside the card [-40px, +40px]
    const randomOffset = (Math.random() - 0.5) * 60;
    const containerWidth = reelContainerRef.current?.offsetWidth || 700;
    const targetOffset = targetItemIndex * itemWidth + itemWidth / 2 - containerWidth / 2 + randomOffset;

    // Reset reel position
    setReelTranslateX(0);

    // Trigger roulette spin with cubic-bezier deceleration
    setTimeout(() => {
      setReelTranslateX(-targetOffset);

      // Play tick sounds periodically
      let tickCount = 0;
      const tickInterval = setInterval(() => {
        tickCount++;
        playTickSound(350 + (tickCount % 4) * 50);
        if (tickCount > 28) clearInterval(tickInterval);
      }, 160);

      // Finish spin after 5.2 seconds
      setTimeout(() => {
        clearInterval(tickInterval);
        setPhase('revealed');
        const isRare =
          firstWon.rarity === 'Legendary' ||
          firstWon.rarity === 'Mythic' ||
          firstWon.rarity === 'Ultra Rare' ||
          firstWon.rarity === 'Prestige';
        playWinSound(isRare);
      }, 5400);
    }, 50);
  };

  const handleQuickSellWonItems = () => {
    winningItems.forEach((it) => {
      casesManager.quickSellSkin(it.id);
    });
    onClose();
  };

  const totalWonValue = winningItems.reduce((sum, it) => sum + it.marketValue, 0);
  const highestRarityWon = winningItems.reduce<SkinItem | null>((highest, curr) => {
    if (!highest) return curr;
    const r1 = RARITY_CONFIG[curr.rarity]?.order || 0;
    const r2 = RARITY_CONFIG[highest.rarity]?.order || 0;
    return r1 > r2 ? curr : highest;
  }, null);

  const isUltraCelebration =
    highestRarityWon &&
    (highestRarityWon.rarity === 'Prestige' ||
      highestRarityWon.rarity === 'Ultra Rare' ||
      highestRarityWon.rarity === 'Mythic' ||
      highestRarityWon.rarity === 'Legendary');

  return (
    <div
      id="case-opening-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
    >
      {/* Full-screen celebratory particles overlay for rare drops */}
      {phase === 'revealed' && isUltraCelebration && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 animate-in fade-in zoom-in duration-500">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-fuchsia-500/10 to-transparent" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
        </div>
      )}

      <div
        id="case-opening-modal-card"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{caseDef.emoji}</span>
            <div>
              <h2 className="text-lg font-black text-white">{caseDef.name}</h2>
              <span className="text-xs text-slate-400 font-medium">{caseDef.theme}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Стоимость открытия</span>
              <span className="text-sm font-bold text-amber-300 font-mono">
                {(caseDef.priceCC * multiCount).toLocaleString()} CC
              </span>
            </div>

            <button
              id="case-close-btn"
              onClick={onClose}
              disabled={phase === 'spinning'}
              className="p-2 rounded-lg bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-700 transition-all disabled:opacity-30"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content View Area */}
        <div className="p-6 flex-1 flex flex-col justify-center items-center overflow-y-auto space-y-6 min-h-[380px]">
          {errorMsg && (
            <div className="w-full p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-sm font-bold text-center">
              {errorMsg}
            </div>
          )}

          {/* PHASE 1: IDLE / READY TO OPEN */}
          {phase === 'idle' && (
            <div className="flex flex-col items-center justify-center space-y-6 my-auto text-center">
              {/* Big Case Visual */}
              <div
                className={`relative w-48 h-48 rounded-2xl bg-gradient-to-b ${caseDef.gradient} border-2 border-slate-600/80 flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.7)] group hover:scale-105 transition-transform duration-300`}
              >
                <div className="text-7xl drop-shadow-xl animate-bounce">{caseDef.emoji}</div>
                <div className="absolute bottom-2 px-3 py-1 bg-slate-950/80 rounded-full border border-amber-500/40 text-xs font-bold text-amber-300">
                  {caseDef.priceCC.toLocaleString()} CC
                </div>
              </div>

              {/* Options: Multi-Open & Fast Toggle */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setMultiCount(1)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      multiCount === 1 ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1x Кейс
                  </button>
                  <button
                    onClick={() => setMultiCount(5)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      multiCount === 5 ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    5x Кейсов
                  </button>
                  <button
                    onClick={() => setMultiCount(10)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      multiCount === 10 ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    10x Кейсов
                  </button>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fastOpen}
                    onChange={(e) => setFastOpen(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500 bg-slate-800 border-slate-700"
                  />
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Быстрое открытие
                </label>
              </div>

              {/* Open Button */}
              <button
                id="start-unboxing-btn"
                onClick={startOpening}
                className="px-10 py-4 rounded-xl font-black text-base bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-400 hover:to-yellow-300 shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-wider"
              >
                <Sparkles className="w-5 h-5 text-slate-950" />
                ОТКРЫТЬ ЗА {(caseDef.priceCC * multiCount).toLocaleString()} CC
              </button>
            </div>
          )}

          {/* PHASE 2: ANIMATED HORIZONTAL REEL SPIN */}
          {phase === 'spinning' && (
            <div className="w-full flex flex-col items-center space-y-4 py-8">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-widest animate-pulse flex items-center gap-2">
                <RotateCw className="w-4 h-4 animate-spin text-amber-400" />
                Идет выбор выигрышного предмета...
              </div>

              {/* The Roulette Window */}
              <div
                ref={reelContainerRef}
                className="relative w-full h-44 bg-slate-950/90 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl"
              >
                {/* Center Pointer Indicator */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-amber-400 z-20 shadow-[0_0_15px_#f59e0b]">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-amber-400" />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[10px] border-b-amber-400" />
                </div>

                {/* Shaded vignette sides */}
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

                {/* Animated Horizontal Strip */}
                <div
                  className="flex items-center h-full gap-4 px-4 transition-transform ease-out"
                  style={{
                    transform: `translateX(${reelTranslateX}px)`,
                    transitionDuration: '5.2s',
                    transitionTimingFunction: 'cubic-bezier(0.12, 0.8, 0.15, 1)',
                  }}
                >
                  {reelItems.map((item, index) => {
                    const rCfg = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.Common;
                    return (
                      <div
                        key={`${item.id}_${index}`}
                        className={`flex-shrink-0 w-40 h-36 rounded-xl bg-gradient-to-b ${rCfg.gradient} border ${rCfg.border} flex flex-col items-center justify-between p-3 select-none`}
                      >
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${rCfg.badgeBg}`}>
                          {item.rarity}
                        </span>
                        <div className="text-4xl my-1 drop-shadow">{item.iconEmoji}</div>
                        <div className="w-full text-center">
                          <p className="text-[11px] font-bold text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-amber-300 font-mono">
                            {item.marketValue.toLocaleString()} CC
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* PHASE 3: REVEALED RESULTS */}
          {phase === 'revealed' && (
            <div className="w-full flex flex-col items-center space-y-6 animate-in zoom-in-95 duration-300">
              {/* Grand Announcement */}
              <div className="text-center">
                {isUltraCelebration && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/30 via-fuchsia-500/30 to-rose-500/30 border border-amber-400 text-amber-300 font-black text-xs uppercase tracking-widest mb-2 animate-bounce">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    ✨ РЕДКИЙ ТРОФЕЙ ВЫБИТ! ✨
                  </span>
                )}
                <h3 className="text-2xl font-black text-white">
                  {winningItems.length === 1 ? 'Поздравляем с выигрышем!' : `Вы открыли ${winningItems.length} предметов!`}
                </h3>
              </div>

              {/* Items Showcase Grid */}
              <div
                className={`w-full grid gap-4 ${
                  winningItems.length === 1
                    ? 'grid-cols-1 max-w-md mx-auto'
                    : winningItems.length <= 5
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
                }`}
              >
                {winningItems.map((item) => {
                  const rCfg = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.Common;
                  return (
                    <div
                      key={item.id}
                      className={`relative rounded-xl p-4 bg-gradient-to-b ${rCfg.gradient} border-2 ${rCfg.border} flex flex-col items-center text-center shadow-xl group`}
                    >
                      {/* StatTrak / Pattern badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {item.hasStatTrak && (
                          <span className="px-1.5 py-0.5 text-[9px] font-black bg-orange-500/30 text-orange-300 border border-orange-500/60 rounded">
                            ST
                          </span>
                        )}
                        {item.isSpecialPattern && (
                          <span className="px-1.5 py-0.5 text-[9px] font-black bg-amber-500/30 text-amber-300 border border-amber-400/60 rounded">
                            P#{item.pattern}
                          </span>
                        )}
                      </div>

                      <span className={`px-2 py-0.5 text-[10px] font-black rounded ${rCfg.badgeBg} mb-2`}>
                        {item.rarity}
                      </span>

                      <div className="text-5xl my-2 drop-shadow-md group-hover:scale-110 transition-transform">
                        {item.iconEmoji}
                      </div>

                      <h4 className="text-sm font-extrabold text-white leading-snug line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">{item.condition}</p>

                      <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-slate-400">
                        <span>Float: {item.float.toFixed(3)}</span>
                        <span>•</span>
                        <span>#{item.pattern}</span>
                      </div>

                      <div className="mt-3 px-3 py-1 rounded-full bg-slate-950/70 border border-amber-500/40 text-xs font-bold text-amber-300">
                        {item.marketValue.toLocaleString()} CC
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Value Bar */}
              <div className="px-5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-4 text-xs font-medium text-slate-300">
                <span>
                  Итоговая стоимость: <strong className="text-amber-300 font-mono text-sm">{totalWonValue.toLocaleString()} CC</strong>
                </span>
                <span>•</span>
                <span>Предметы автоматически добавлены в ваш Инвентарь</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-950/90 border-t border-slate-800">
          {phase === 'revealed' ? (
            <>
              <button
                id="reveal-sell-all-btn"
                onClick={handleQuickSellWonItems}
                className="px-4 py-2.5 rounded-xl font-bold text-sm bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Быстро продать ({Math.round(totalWonValue * 0.85).toLocaleString()} CC)
              </button>

              <div className="flex items-center gap-3">
                <button
                  id="reveal-again-btn"
                  onClick={startOpening}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  Открыть еще раз ({(caseDef.priceCC * multiCount).toLocaleString()} CC)
                </button>

                <button
                  id="reveal-inventory-btn"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-400 hover:to-yellow-400 transition-all flex items-center gap-2 shadow-md"
                >
                  В Инвентарь
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                onClick={onClose}
                disabled={phase === 'spinning'}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all disabled:opacity-30"
              >
                Закрыть
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
