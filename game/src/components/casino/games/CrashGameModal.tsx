/**
 * Business Empire: Ultimate
 * Interactive Cyberpunk Rocket Crash Game Component
 */

import React, { useState, useEffect, useRef } from 'react';
import { CasinoGameDefinition } from '../../../types/casino';
import { CrashEngine, CrashRoundHistory } from '../../../game/casino/engines/crashEngine';
import { casinoManager } from '../../../game/casino/casinoManager';
import { X, Play, Rocket, AlertTriangle, Zap } from 'lucide-react';

interface CrashGameModalProps {
  game: CasinoGameDefinition;
  onClose: () => void;
  casinoCoins: number;
}

export const CrashGameModal: React.FC<CrashGameModalProps> = ({ game, onClose, casinoCoins }) => {
  const [bet, setBet] = useState(100);
  const [gameState, setGameState] = useState<'idle' | 'running' | 'cashed_out' | 'crashed'>('idle');
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashTarget, setCrashTarget] = useState(2.00);
  const [payoutWonCC, setPayoutWonCC] = useState(0);
  const [history, setHistory] = useState<number[]>([1.45, 2.80, 1.12, 14.50, 1.95, 3.20, 1.05, 5.75]);

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRound = () => {
    if (casinoCoins < bet) return;
    const target = CrashEngine.generateCrashPoint();
    setCrashTarget(target);
    setMultiplier(1.00);
    setGameState('running');
    setPayoutWonCC(0);
    startTimeRef.current = Date.now();

    const updateLoop = () => {
      const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
      // Exponential curve: mult = e^(0.06 * t * speedFactor)
      const currentMult = Math.round((Math.pow(Math.E, 0.25 * elapsedSec)) * 100) / 100;

      if (currentMult >= target) {
        // Crash!
        setMultiplier(target);
        setGameState('crashed');
        setHistory((prev) => [target, ...prev.slice(0, 7)]);
        casinoManager.recordGameRound(game.id, game.name, game.category, bet, 0);
      } else {
        setMultiplier(currentMult);
        animationFrameRef.current = requestAnimationFrame(updateLoop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateLoop);
  };

  const cashOut = () => {
    if (gameState !== 'running') return;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    const winAmount = CrashEngine.calculateCashout(bet, multiplier);
    setPayoutWonCC(winAmount);
    setGameState('cashed_out');
    setHistory((prev) => [crashTarget, ...prev.slice(0, 7)]);

    casinoManager.recordGameRound(game.id, game.name, game.category, bet, winAmount);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Compute rocket position percentage across canvas
  const progressPercent = Math.min(85, ((multiplier - 1.0) / 8.0) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl shadow-emerald-500/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-950 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚀</span>
            <div>
              <h3 className="text-lg font-black text-white">{game.name}</h3>
              <div className="text-xs text-emerald-300 font-mono">
                RTP: {game.rtp}% • Множитель до 1000.00x
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs">
              🪙 {casinoCoins.toLocaleString()} CC
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 text-slate-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History bar */}
        <div className="px-4 py-2 bg-slate-950 flex items-center gap-2 overflow-x-auto border-b border-slate-800 text-[11px] font-mono">
          <span className="text-slate-500 font-bold uppercase text-[10px]">История:</span>
          {history.map((h, i) => (
            <span
              key={i}
              className={`px-2 py-0.5 rounded-lg font-bold ${
                h >= 2.0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {h.toFixed(2)}x
            </span>
          ))}
        </div>

        {/* Dynamic Flight Canvas */}
        <div className="relative h-64 sm:h-72 bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center p-6 overflow-hidden">
          {/* Cyberpunk Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

          {/* Central Multiplier Indicator */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className={`text-5xl sm:text-6xl font-black font-mono tracking-tighter ${
                gameState === 'crashed'
                  ? 'text-rose-500 animate-pulse'
                  : gameState === 'cashed_out'
                  ? 'text-emerald-400'
                  : 'text-amber-300'
              }`}
            >
              {multiplier.toFixed(2)}x
            </div>

            <div className="text-xs font-bold uppercase tracking-widest mt-2">
              {gameState === 'crashed' ? (
                <span className="text-rose-400">💥 CRASHED AT {crashTarget.toFixed(2)}x</span>
              ) : gameState === 'cashed_out' ? (
                <span className="text-emerald-400">🎉 ЗАБРАНО: +{payoutWonCC.toLocaleString()} CC</span>
              ) : gameState === 'running' ? (
                <span className="text-cyan-300 animate-pulse">🚀 ПОЛЕТ НАБИРАЕТ ВЫСОТУ...</span>
              ) : (
                <span className="text-slate-500">Нажмите СТАРТ для запуска</span>
              )}
            </div>
          </div>

          {/* Animated Rocket */}
          {gameState === 'running' && (
            <div
              className="absolute z-20 transition-all duration-75 text-3xl sm:text-4xl"
              style={{
                left: `${15 + progressPercent * 0.7}%`,
                bottom: `${15 + progressPercent * 0.6}%`,
              }}
            >
              🚀
            </div>
          )}
        </div>

        {/* Bottom Betting & Cashout Bar */}
        <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Ставка:</span>
            <div className="flex items-center gap-1.5">
              {[50, 100, 500, 1000, 5000].map((v) => (
                <button
                  key={v}
                  disabled={gameState === 'running'}
                  onClick={() => setBet(v)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                    bet === v
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            {gameState === 'running' ? (
              <button
                onClick={cashOut}
                className="px-10 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>ЗАБРАТЬ</span>
                <span className="font-mono">({Math.round(bet * multiplier).toLocaleString()} CC)</span>
              </button>
            ) : (
              <button
                disabled={casinoCoins < bet}
                onClick={startRound}
                className="px-10 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                СТАРТ РАУНДА ({bet} CC)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
