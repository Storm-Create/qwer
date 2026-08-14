/**
 * Business Empire: Ultimate
 * Supplementary Games Modal: Dice, Baccarat, Fortune Wheel, Boss Battles, Racing, Gacha
 */

import React, { useState } from 'react';
import { CasinoGameDefinition } from '../../../types/casino';
import {
  DiceEngine,
  BaccaratEngine,
  WheelEngine,
  BossBattleEngine,
  VirtualRacingEngine,
  GachaLootBoxEngine,
  VIRTUAL_RACERS,
  FORTUNE_WHEEL_SECTORS,
} from '../../../game/casino/engines/otherEngines';
import { casinoManager } from '../../../game/casino/casinoManager';
import { X, Play, Zap, Award, Sparkles, Shield, Trophy } from 'lucide-react';

interface GenericGameModalProps {
  game: CasinoGameDefinition;
  onClose: () => void;
  casinoCoins: number;
}

export const GenericGameModal: React.FC<GenericGameModalProps> = ({ game, onClose, casinoCoins }) => {
  const [bet, setBet] = useState(100);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Dice State
  const [diceType, setDiceType] = useState<'over7' | 'under7' | 'exact7' | 'even' | 'odd' | 'doubles'>('over7');
  const [diceResult, setDiceResult] = useState<{ d1: number; d2: number; total: number } | null>(null);

  // Baccarat State
  const [baccaratChoice, setBaccaratChoice] = useState<'player' | 'banker' | 'tie'>('player');

  // Wheel State
  const [wheelSectorIndex, setWheelSectorIndex] = useState<number | null>(null);
  const [spinningWheel, setSpinningWheel] = useState(false);

  // Boss Battle State
  const [bossHp, setBossHp] = useState(10000);
  const [bossMaxHp] = useState(10000);

  // Racing State
  const [chosenRacerId, setChosenRacerId] = useState('racer_1');
  const [racing, setRacing] = useState(false);

  // Gacha Chest State
  const [unlockedItem, setUnlockedItem] = useState<any>(null);

  // ----------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------
  const playDice = () => {
    if (casinoCoins < bet) return;
    const res = DiceEngine.roll(bet, diceType);
    setDiceResult({ d1: res.dice1, d2: res.dice2, total: res.total });
    setStatusMessage(res.message);
    casinoManager.recordGameRound(game.id, game.name, game.category, bet, res.payoutCC);
  };

  const playBaccarat = () => {
    if (casinoCoins < bet) return;
    const res = BaccaratEngine.play(bet, baccaratChoice);
    setStatusMessage(res.message);
    casinoManager.recordGameRound(game.id, game.name, game.category, bet, res.payoutCC);
  };

  const playWheel = () => {
    if (casinoCoins < bet || spinningWheel) return;
    setSpinningWheel(true);
    setStatusMessage(null);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setWheelSectorIndex(Math.floor(Math.random() * FORTUNE_WHEEL_SECTORS.length));
      if (count >= 12) {
        clearInterval(interval);
        const res = WheelEngine.spin(bet);
        setWheelSectorIndex(res.sectorIndex);
        setStatusMessage(res.message);
        setSpinningWheel(false);
        casinoManager.recordGameRound(game.id, game.name, game.category, bet, res.payoutCC, res.sector.isJackpot, 'mega');
      }
    }, 90);
  };

  const playBossAttack = () => {
    if (casinoCoins < bet) return;
    const res = BossBattleEngine.attack(bet, bossHp, bossMaxHp);
    setBossHp(res.bossDefeated ? bossMaxHp : res.bossHpRemaining);
    setStatusMessage(res.message);
    casinoManager.recordGameRound(game.id, game.name, game.category, bet, res.payoutCC);
  };

  const playRace = () => {
    if (casinoCoins < bet || racing) return;
    setRacing(true);
    setStatusMessage('Гонка стартовала! Болиды мчат по ночной трассе...');

    setTimeout(() => {
      const res = VirtualRacingEngine.runRace(chosenRacerId, bet);
      setStatusMessage(res.message);
      setRacing(false);
      casinoManager.recordGameRound(game.id, game.name, game.category, bet, res.payoutCC);
    }, 1500);
  };

  const playGachaOpen = () => {
    if (casinoCoins < bet) return;
    const res = GachaLootBoxEngine.openChest(bet, 'royal');
    setUnlockedItem(res.item);
    setStatusMessage(res.message);
    casinoManager.recordGameRound(game.id, game.name, game.category, bet, res.instantCashCC);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-500/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`p-4 bg-gradient-to-r ${game.bannerGradient} flex items-center justify-between border-b border-slate-800`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{game.thumbnailEmoji}</span>
            <div>
              <h3 className="text-lg font-black text-white">{game.name}</h3>
              <div className="text-xs text-slate-300 font-mono">
                Категория: {game.category.toUpperCase()} • RTP: {game.rtp}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-purple-500/40 text-purple-300 font-mono font-bold text-xs">
              🪙 {casinoCoins.toLocaleString()} CC
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 text-slate-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Game Area */}
        <div className="p-6 bg-slate-950/80 min-h-[300px] flex flex-col items-center justify-center gap-6">
          {/* 1. DICE */}
          {game.category === 'dice' && (
            <div className="flex flex-col items-center gap-4 w-full max-w-md">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-slate-800 border-2 border-purple-500/40 rounded-2xl flex items-center justify-center text-4xl shadow-xl">
                  {diceResult ? diceResult.d1 : '🎲'}
                </div>
                <span className="text-2xl font-black text-slate-600">+</span>
                <div className="w-20 h-20 bg-slate-800 border-2 border-purple-500/40 rounded-2xl flex items-center justify-center text-4xl shadow-xl">
                  {diceResult ? diceResult.d2 : '🎲'}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 w-full">
                {[
                  { id: 'over7', label: 'Больше 7 (2.3x)' },
                  { id: 'under7', label: 'Меньше 7 (2.3x)' },
                  { id: 'exact7', label: 'Ровно 7 (5.8x)' },
                  { id: 'even', label: 'Чётное (1.95x)' },
                  { id: 'odd', label: 'Нечётное (1.95x)' },
                  { id: 'doubles', label: 'Дубль (5.5x)' },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setDiceType(b.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      diceType === b.id
                        ? 'bg-purple-600 border-purple-400 text-white font-black'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. BACCARAT */}
          {game.category === 'cards' && (
            <div className="flex flex-col items-center gap-4 w-full max-w-md">
              <div className="grid grid-cols-3 gap-3 w-full">
                {[
                  { id: 'player', label: 'ИГРОК (1:1)' },
                  { id: 'banker', label: 'БАНКИР (0.95:1)' },
                  { id: 'tie', label: 'НИЧЬЯ (8:1)' },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBaccaratChoice(b.id as any)}
                    className={`py-4 px-2 rounded-2xl text-xs font-black border transition-all ${
                      baccaratChoice === b.id
                        ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. WHEEL */}
          {game.category === 'wheel' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 rounded-full border-4 border-amber-500/40 bg-slate-900 flex flex-col items-center justify-center p-4 shadow-2xl relative">
                <span className="text-4xl">🎡</span>
                <span className="text-sm font-black text-amber-300 font-mono mt-2">
                  {wheelSectorIndex !== null ? FORTUNE_WHEEL_SECTORS[wheelSectorIndex].label : 'ВРАЩАЙТЕ'}
                </span>
              </div>
            </div>
          )}

          {/* 4. BOSS BATTLE */}
          {game.category === 'boss' && (
            <div className="flex flex-col items-center gap-3 w-full max-w-md">
              <span className="text-5xl">👹</span>
              <div className="text-sm font-black text-rose-400 uppercase">Cyber Demon Lord</div>
              {/* HP Bar */}
              <div className="w-full bg-slate-900 rounded-full h-4 border border-rose-500/40 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-rose-600 to-amber-500 h-full transition-all duration-300"
                  style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                />
              </div>
              <div className="text-xs font-mono text-slate-400">
                HP: {bossHp.toLocaleString()} / {bossMaxHp.toLocaleString()}
              </div>
            </div>
          )}

          {/* 5. RACING */}
          {game.category === 'racing' && (
            <div className="flex flex-col gap-2 w-full max-w-md">
              <div className="text-xs font-bold text-slate-400 uppercase mb-1">Выберите суперкар:</div>
              {VIRTUAL_RACERS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setChosenRacerId(r.id)}
                  className={`p-3 rounded-2xl flex items-center justify-between border transition-all ${
                    chosenRacerId === r.id
                      ? 'bg-purple-600/30 border-purple-400'
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{r.emoji}</span>
                    <div className="text-left">
                      <div className="text-xs font-black text-white">{r.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.car}</div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-xs">
                    {r.odds}x
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 6. GACHA */}
          {game.category === 'gacha' && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-32 h-32 bg-slate-900 border-2 border-amber-500/40 rounded-3xl flex flex-col items-center justify-center shadow-xl">
                <span className="text-5xl">🎁</span>
              </div>
              {unlockedItem && (
                <div className="p-3 bg-amber-500/20 border border-amber-400 rounded-2xl text-center">
                  <div className="text-xs font-black text-amber-300">{unlockedItem.name} ({unlockedItem.rarity})</div>
                  <div className="text-[10px] text-slate-300 mt-0.5">{unlockedItem.description}</div>
                </div>
              )}
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-purple-500/30 text-purple-300 text-xs font-bold font-mono text-center max-w-md animate-fade-in">
              {statusMessage}
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Ставка:</span>
            <div className="flex items-center gap-1.5">
              {[50, 100, 500, 1000, 5000].map((v) => (
                <button
                  key={v}
                  onClick={() => setBet(v)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border ${
                    bet === v ? 'bg-purple-600 text-white border-purple-400 font-black' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <button
              disabled={casinoCoins < bet || spinningWheel || racing}
              onClick={() => {
                if (game.category === 'dice') playDice();
                else if (game.category === 'cards') playBaccarat();
                else if (game.category === 'wheel') playWheel();
                else if (game.category === 'boss') playBossAttack();
                else if (game.category === 'racing') playRace();
                else if (game.category === 'gacha') playGachaOpen();
              }}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
            >
              ИГРАТЬ ({bet} CC)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
