/**
 * Business Empire: Ultimate
 * Interactive Video Slot Machine Component
 */

import React, { useState, useEffect } from 'react';
import { CasinoGameDefinition } from '../../../types/casino';
import { SlotEngine, STANDARD_SLOT_SYMBOLS, SlotSpinResult } from '../../../game/casino/engines/slotEngine';
import { casinoManager } from '../../../game/casino/casinoManager';
import { X, Play, Zap, Award, Sparkles, Volume2, VolumeX, ShieldAlert, Star } from 'lucide-react';

interface SlotGameModalProps {
  game: CasinoGameDefinition;
  onClose: () => void;
  casinoCoins: number;
}

export const SlotGameModal: React.FC<SlotGameModalProps> = ({ game, onClose, casinoCoins }) => {
  const [betPerLine, setBetPerLine] = useState(Math.max(1, Math.floor(game.minBet / 20)));
  const [lines, setLines] = useState(20);
  const [spinning, setSpinning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(0);
  const [lastResult, setLastResult] = useState<SlotSpinResult | null>(null);
  const [displayReels, setDisplayReels] = useState<string[][]>([
    ['seven', 'diamond', 'bar'],
    ['cherry', 'wild', 'crown'],
    ['seven', 'bell', 'seven'],
    ['lemon', 'grape', 'bar'],
    ['scatter', 'diamond', 'seven'],
  ]);
  const [winMessage, setWinMessage] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState<'big' | 'mega' | 'jackpot' | null>(null);

  const totalBet = betPerLine * lines;

  const getSymbol = (id: string) => {
    return STANDARD_SLOT_SYMBOLS.find((s) => s.id === id) || STANDARD_SLOT_SYMBOLS[0];
  };

  const handleSpin = () => {
    if (spinning) return;
    const isFreeSpin = freeSpinsLeft > 0;
    if (!isFreeSpin && casinoCoins < totalBet) {
      setWinMessage('Недостаточно Casino Coins для спина');
      setAutoSpin(false);
      return;
    }

    setSpinning(true);
    setWinMessage(null);
    setShowCelebration(null);

    // If free spin, do not deduct bet
    const currentBet = isFreeSpin ? 0 : totalBet;

    // Simulate animated reel spin
    let spinsCount = 0;
    const spinInterval = setInterval(() => {
      spinsCount++;
      setDisplayReels((prev) =>
        prev.map((col) => [
          STANDARD_SLOT_SYMBOLS[Math.floor(Math.random() * STANDARD_SLOT_SYMBOLS.length)].id,
          STANDARD_SLOT_SYMBOLS[Math.floor(Math.random() * STANDARD_SLOT_SYMBOLS.length)].id,
          STANDARD_SLOT_SYMBOLS[Math.floor(Math.random() * STANDARD_SLOT_SYMBOLS.length)].id,
        ])
      );

      if (spinsCount >= 6) {
        clearInterval(spinInterval);
        // Calculate real result
        const result = SlotEngine.spin(betPerLine, lines, STANDARD_SLOT_SYMBOLS, game.rtp);
        setDisplayReels(result.reels);
        setLastResult(result);
        setSpinning(false);

        // Record in casino manager
        casinoManager.recordGameRound(
          game.id,
          game.name,
          game.category,
          currentBet,
          result.totalPayoutCC,
          result.isJackpotWin,
          result.jackpotType
        );

        if (result.freeSpinsWon > 0) {
          setFreeSpinsLeft((f) => f + result.freeSpinsWon);
          setWinMessage(`🎁 +${result.freeSpinsWon} БЕСПЛАТНЫХ СПИНОВ!`);
        } else if (isFreeSpin) {
          setFreeSpinsLeft((f) => f - 1);
        }

        if (result.isJackpotWin) {
          setShowCelebration('jackpot');
          setWinMessage(`👑 ДЖЕКПОТ ${result.jackpotType?.toUpperCase()}! Выигрыш: ${result.totalPayoutCC.toLocaleString()} CC!`);
        } else if (result.isMegaWin) {
          setShowCelebration('mega');
          setWinMessage(`🔥 MEGA WIN! +${result.totalPayoutCC.toLocaleString()} CC (${result.multiplier}x)`);
        } else if (result.isBigWin) {
          setShowCelebration('big');
          setWinMessage(`✨ BIG WIN! +${result.totalPayoutCC.toLocaleString()} CC`);
        } else if (result.totalPayoutCC > 0) {
          setWinMessage(`Выигрыш: +${result.totalPayoutCC.toLocaleString()} CC`);
        } else {
          setWinMessage(null);
        }
      }
    }, 90);
  };

  // Auto-spin loop
  useEffect(() => {
    let timeout: any;
    if (autoSpin && !spinning && (casinoCoins >= totalBet || freeSpinsLeft > 0)) {
      timeout = setTimeout(() => {
        handleSpin();
      }, 700);
    } else if (autoSpin && casinoCoins < totalBet && freeSpinsLeft === 0) {
      setAutoSpin(false);
    }
    return () => clearTimeout(timeout);
  }, [autoSpin, spinning, casinoCoins, totalBet, freeSpinsLeft]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className={`p-4 bg-gradient-to-r ${game.bannerGradient} flex items-center justify-between border-b border-slate-800`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{game.thumbnailEmoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-wide">{game.name}</h3>
                {game.tag && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                    {game.tag}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-200/80 font-mono">
                RTP: {game.rtp}% • Волатильность: {game.volatility.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs flex items-center gap-1.5">
              <span>🪙</span>
              <span>{casinoCoins.toLocaleString()} CC</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 text-slate-300 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slot Screen / Reel Area */}
        <div className="p-4 sm:p-8 bg-slate-950 flex flex-col items-center justify-center relative select-none">
          {/* Win Celebration Banner */}
          {showCelebration && (
            <div className="absolute top-4 z-20 px-6 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-widest shadow-xl animate-bounce">
              {showCelebration === 'jackpot' ? '👑 MEGA JACKPOT!' : showCelebration === 'mega' ? '🔥 MEGA WIN!' : '✨ BIG WIN!'}
            </div>
          )}

          {/* 5x3 Reels Grid */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3 bg-slate-900/90 p-3 sm:p-4 rounded-3xl border-2 border-amber-500/40 shadow-inner w-full max-w-2xl">
            {displayReels.map((col, colIdx) => (
              <div
                key={colIdx}
                className={`flex flex-col gap-2 sm:gap-3 bg-slate-950/90 p-1.5 sm:p-2.5 rounded-2xl border border-slate-800 transition-all ${
                  spinning ? 'animate-pulse' : ''
                }`}
              >
                {col.map((symId, rowIdx) => {
                  const sym = getSymbol(symId);
                  const isWinningSym = lastResult?.winningLines.some((l) => l.symbolId === sym.id);
                  return (
                    <div
                      key={rowIdx}
                      className={`h-16 sm:h-20 rounded-xl flex flex-col items-center justify-center border transition-all ${
                        isWinningSym && !spinning
                          ? 'bg-amber-500/20 border-amber-400 scale-105 shadow-lg shadow-amber-500/20'
                          : 'bg-slate-900/60 border-slate-800/80'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl filter drop-shadow">{sym.emoji}</span>
                      <span className="text-[9px] font-bold text-slate-400 tracking-tight mt-0.5">
                        {sym.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Win / Status Feedback */}
          <div className="mt-4 h-6 text-center">
            {winMessage ? (
              <span className="text-sm font-black text-amber-300 font-mono animate-fade-in">
                {winMessage}
              </span>
            ) : freeSpinsLeft > 0 ? (
              <span className="text-xs font-bold text-purple-400 font-mono">
                Бесплатные спины: {freeSpinsLeft}
              </span>
            ) : (
              <span className="text-xs text-slate-500">Сделайте ставку и нажмите Spin</span>
            )}
          </div>
        </div>

        {/* Bottom Betting Controls */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Bet Per Line */}
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Ставка на линию</span>
              <div className="flex items-center gap-1.5 mt-1">
                <button
                  disabled={spinning || betPerLine <= 1}
                  onClick={() => setBetPerLine((b) => Math.max(1, b - 5))}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold"
                >
                  -
                </button>
                <span className="px-3 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-amber-300">
                  {betPerLine} CC
                </span>
                <button
                  disabled={spinning || betPerLine * lines >= game.maxBet}
                  onClick={() => setBetPerLine((b) => b + 5)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Paylines */}
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Линий</span>
              <div className="flex items-center gap-1 mt-1">
                {[5, 10, 20].map((l) => (
                  <button
                    key={l}
                    disabled={spinning}
                    onClick={() => setLines(l)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      lines === l ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Bet Display */}
            <div className="flex flex-col pl-2 border-l border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Общая ставка</span>
              <span className="text-sm font-mono font-black text-white mt-1">
                {totalBet.toLocaleString()} CC
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              disabled={spinning}
              onClick={() => setAutoSpin(!autoSpin)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                autoSpin
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              {autoSpin ? 'Стоп Авто' : 'Автоспин'}
            </button>

            <button
              disabled={spinning || (casinoCoins < totalBet && freeSpinsLeft === 0)}
              onClick={handleSpin}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50 text-slate-950 font-black text-sm tracking-wider uppercase shadow-lg shadow-amber-500/20 flex items-center gap-2 transform active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{spinning ? 'Вращение...' : freeSpinsLeft > 0 ? `Фриспин (${freeSpinsLeft})` : 'SPIN'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
