/**
 * Business Empire: Ultimate
 * Interactive European Roulette Game Component
 */

import React, { useState } from 'react';
import { CasinoGameDefinition } from '../../../types/casino';
import {
  RouletteEngine,
  RoulettePlacedBet,
  RouletteBetType,
  RouletteSpinResult,
  ROULETTE_RED_NUMBERS,
  ROULETTE_BLACK_NUMBERS,
} from '../../../game/casino/engines/rouletteEngine';
import { casinoManager } from '../../../game/casino/casinoManager';
import { X, Play, RotateCcw, Sparkles } from 'lucide-react';

interface RouletteGameModalProps {
  game: CasinoGameDefinition;
  onClose: () => void;
  casinoCoins: number;
}

export const RouletteGameModal: React.FC<RouletteGameModalProps> = ({ game, onClose, casinoCoins }) => {
  const [chipValue, setChipValue] = useState(50);
  const [placedBets, setPlacedBets] = useState<RoulettePlacedBet[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<RouletteSpinResult | null>(null);
  const [wheelDisplayNum, setWheelDisplayNum] = useState<number | null>(null);

  const totalBet = placedBets.reduce((acc, b) => acc + b.amountCC, 0);

  const addBet = (type: RouletteBetType, value?: number) => {
    if (spinning) return;
    if (casinoCoins < totalBet + chipValue) return;

    setPlacedBets((prev) => {
      const existing = prev.find((b) => b.type === type && b.value === value);
      if (existing) {
        return prev.map((b) =>
          b.type === type && b.value === value ? { ...b, amountCC: b.amountCC + chipValue } : b
        );
      }
      return [...prev, { type, value, amountCC: chipValue }];
    });
  };

  const clearBets = () => {
    if (spinning) return;
    setPlacedBets([]);
    setSpinResult(null);
  };

  const handleSpin = () => {
    if (spinning || placedBets.length === 0 || casinoCoins < totalBet) return;
    setSpinning(true);
    setSpinResult(null);

    // Wheel visual spin interval
    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      setWheelDisplayNum(Math.floor(Math.random() * 37));
      if (ticks >= 15) {
        clearInterval(interval);
        const res = RouletteEngine.spin(placedBets);
        setWheelDisplayNum(res.winningNumber);
        setSpinResult(res);
        setSpinning(false);

        casinoManager.recordGameRound(
          game.id,
          game.name,
          game.category,
          res.totalBetCC,
          res.totalPayoutCC
        );
      }
    }, 80);
  };

  const getBetOnItem = (type: RouletteBetType, val?: number) => {
    const item = placedBets.find((b) => b.type === type && b.value === val);
    return item ? item.amountCC : 0;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-500/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 to-slate-950 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎡</span>
            <div>
              <h3 className="text-lg font-black text-white">{game.name}</h3>
              <div className="text-xs text-cyan-300 font-mono">
                RTP: {game.rtp}% • Перевес казино (House Edge): 2.7%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs">
              🪙 {casinoCoins.toLocaleString()} CC
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 text-slate-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Wheel Display Header */}
        <div className="p-4 bg-slate-950 flex items-center justify-center gap-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center border-4 text-2xl font-black shadow-2xl transition-all ${
                wheelDisplayNum === null
                  ? 'border-slate-700 bg-slate-900 text-slate-500'
                  : wheelDisplayNum === 0
                  ? 'border-emerald-400 bg-emerald-600 text-white'
                  : ROULETTE_RED_NUMBERS.includes(wheelDisplayNum)
                  ? 'border-rose-400 bg-rose-600 text-white'
                  : 'border-slate-500 bg-slate-950 text-white'
              } ${spinning ? 'animate-spin' : ''}`}
            >
              {wheelDisplayNum ?? '?'}
            </div>

            <div>
              <div className="text-xs uppercase font-bold text-slate-400">Результат раунда:</div>
              <div className="text-sm font-black text-cyan-300 font-mono">
                {spinning
                  ? 'Колесо вращается...'
                  : spinResult
                  ? spinResult.totalPayoutCC > 0
                    ? `🎉 Выигрыш: +${spinResult.totalPayoutCC.toLocaleString()} CC (${spinResult.winningNumber} ${spinResult.color.toUpperCase()})`
                    : `Выпало: ${spinResult.winningNumber} (${spinResult.color.toUpperCase()})`
                  : 'Сделайте ставки на столе'}
              </div>
            </div>
          </div>
        </div>

        {/* Betting Board */}
        <div className="p-4 sm:p-6 bg-slate-950/60 overflow-x-auto">
          <div className="min-w-[620px] max-w-3xl mx-auto flex flex-col gap-2 select-none">
            {/* Zero and Numbers 1-36 */}
            <div className="flex gap-1">
              {/* Green 0 */}
              <button
                onClick={() => addBet('number', 0)}
                className="w-14 h-32 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg flex flex-col items-center justify-center relative border border-emerald-400/40"
              >
                <span>0</span>
                {getBetOnItem('number', 0) > 0 && (
                  <span className="absolute bottom-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black">
                    {getBetOnItem('number', 0)}
                  </span>
                )}
              </button>

              {/* 3 rows x 12 columns grid */}
              <div className="grid grid-rows-3 grid-flow-col gap-1 flex-1">
                {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => {
                  const isRed = ROULETTE_RED_NUMBERS.includes(num);
                  const curBet = getBetOnItem('number', num);
                  return (
                    <button
                      key={num}
                      onClick={() => addBet('number', num)}
                      className={`h-10 rounded-lg font-bold text-xs relative flex items-center justify-center border transition-all ${
                        isRed
                          ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600/40'
                      }`}
                    >
                      <span>{num}</span>
                      {curBet > 0 && (
                        <span className="absolute top-0.5 right-0.5 px-1 rounded-full bg-amber-400 text-slate-950 text-[8px] font-black">
                          {curBet}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dozens (1-12, 13-24, 25-36) */}
            <div className="grid grid-cols-3 gap-1 pl-14">
              {(['dozen1', 'dozen2', 'dozen3'] as RouletteBetType[]).map((dz, idx) => (
                <button
                  key={dz}
                  onClick={() => addBet(dz)}
                  className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 relative"
                >
                  {idx === 0 ? '1-я Дюжина (1-12)' : idx === 1 ? '2-я Дюжина (13-24)' : '3-я Дюжина (25-36)'}
                  {getBetOnItem(dz) > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black">
                      {getBetOnItem(dz)}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Outside Bets (1-18, Even, Red, Black, Odd, 19-36) */}
            <div className="grid grid-cols-6 gap-1 pl-14">
              {[
                { type: 'low' as RouletteBetType, label: '1-18' },
                { type: 'even' as RouletteBetType, label: 'ЧЁТ' },
                { type: 'red' as RouletteBetType, label: 'КРАСНОЕ', bg: 'bg-rose-600 text-white' },
                { type: 'black' as RouletteBetType, label: 'ЧЕРНОЕ', bg: 'bg-slate-900 text-white' },
                { type: 'odd' as RouletteBetType, label: 'НЕЧЁТ' },
                { type: 'high' as RouletteBetType, label: '19-36' },
              ].map((b) => (
                <button
                  key={b.type}
                  onClick={() => addBet(b.type)}
                  className={`py-2 border border-slate-700 rounded-xl text-xs font-bold relative ${
                    b.bg || 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {b.label}
                  {getBetOnItem(b.type) > 0 && (
                    <span className="ml-1.5 px-1 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[8px] font-black">
                      {getBetOnItem(b.type)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Фишка:</span>
            <div className="flex items-center gap-1.5">
              {[10, 50, 100, 500, 1000, 5000].map((c) => (
                <button
                  key={c}
                  onClick={() => setChipValue(c)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${
                    chipValue === c
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="pl-3 border-l border-slate-800 text-xs text-slate-300">
              Ставка: <span className="font-bold text-cyan-300 font-mono">{totalBet.toLocaleString()} CC</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={spinning || placedBets.length === 0}
              onClick={clearBets}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-bold"
            >
              Сбросить
            </button>

            <button
              disabled={spinning || placedBets.length === 0 || casinoCoins < totalBet}
              onClick={handleSpin}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              КРУТИТЬ РУЛЕТКУ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
