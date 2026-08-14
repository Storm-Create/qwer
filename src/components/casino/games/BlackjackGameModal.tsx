/**
 * Business Empire: Ultimate
 * Interactive Blackjack Game Component
 */

import React, { useState } from 'react';
import { CasinoGameDefinition } from '../../../types/casino';
import {
  BlackjackEngine,
  BlackjackRoundState,
  PlayingCard,
} from '../../../game/casino/engines/blackjackEngine';
import { casinoManager } from '../../../game/casino/casinoManager';
import { X, Play, Plus, Shield, RotateCcw, AlertCircle } from 'lucide-react';

interface BlackjackGameModalProps {
  game: CasinoGameDefinition;
  onClose: () => void;
  casinoCoins: number;
}

export const BlackjackGameModal: React.FC<BlackjackGameModalProps> = ({ game, onClose, casinoCoins }) => {
  const [bet, setBet] = useState(100);
  const [shoe, setShoe] = useState<PlayingCard[]>(() => BlackjackEngine.createShuffledShoe());
  const [round, setRound] = useState<BlackjackRoundState | null>(null);

  const handleDeal = () => {
    if (casinoCoins < bet) return;
    const { state: newState, remainingShoe } = BlackjackEngine.startRound(bet, shoe);
    setShoe(remainingShoe);
    setRound(newState);

    if (newState.status === 'resolved') {
      casinoManager.recordGameRound(
        game.id,
        game.name,
        game.category,
        bet,
        newState.payoutCC
      );
    }
  };

  const handleHit = () => {
    if (!round || round.status !== 'player_turn') return;
    const { state: nextState, remainingShoe } = BlackjackEngine.hit(round, shoe);
    setShoe(remainingShoe);
    setRound(nextState);

    if (nextState.status === 'resolved') {
      casinoManager.recordGameRound(
        game.id,
        game.name,
        game.category,
        round.betAmountCC,
        nextState.payoutCC
      );
    }
  };

  const handleStand = () => {
    if (!round || round.status !== 'player_turn') return;
    const { state: nextState, remainingShoe } = BlackjackEngine.stand(round, shoe);
    setShoe(remainingShoe);
    setRound(nextState);

    casinoManager.recordGameRound(
      game.id,
      game.name,
      game.category,
      round.betAmountCC,
      nextState.payoutCC
    );
  };

  const handleDouble = () => {
    if (!round || round.status !== 'player_turn') return;
    if (casinoCoins < round.betAmountCC) return; // need equal additional amount

    const { state: nextState, remainingShoe } = BlackjackEngine.doubleDown(round, shoe);
    setShoe(remainingShoe);
    setRound(nextState);

    casinoManager.recordGameRound(
      game.id,
      game.name,
      game.category,
      nextState.betAmountCC,
      nextState.payoutCC
    );
  };

  const handleSurrender = () => {
    if (!round || round.status !== 'player_turn') return;
    const nextState = BlackjackEngine.surrender(round);
    setRound(nextState);

    casinoManager.recordGameRound(
      game.id,
      game.name,
      game.category,
      round.betAmountCC,
      nextState.payoutCC
    );
  };

  const renderCard = (card: PlayingCard, hidden = false) => {
    if (hidden) {
      return (
        <div className="w-14 h-20 sm:w-16 sm:h-24 bg-gradient-to-br from-blue-900 to-indigo-950 border-2 border-indigo-400/40 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-xl">🂠</span>
        </div>
      );
    }

    const isRed = card.suit === '♥' || card.suit === '♦';
    return (
      <div className="w-14 h-20 sm:w-16 sm:h-24 bg-slate-100 border border-slate-300 rounded-xl p-1.5 flex flex-col justify-between shadow-xl animate-fade-in text-slate-950 select-none">
        <div className={`text-xs font-black leading-none ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {card.value}
          <span className="text-[10px] ml-0.5">{card.suit}</span>
        </div>
        <div className={`text-xl self-center font-bold ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {card.suit}
        </div>
        <div className={`text-xs font-black leading-none self-end rotate-180 ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {card.value}
          <span className="text-[10px] ml-0.5">{card.suit}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl shadow-emerald-500/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 to-slate-950 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🃏</span>
            <div>
              <h3 className="text-lg font-black text-white">{game.name}</h3>
              <div className="text-xs text-emerald-300 font-mono">
                RTP: {game.rtp}% • Блэкджек платит 3:2 • Дилер стоит на 17
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

        {/* Green Felt Table */}
        <div className="p-6 sm:p-10 bg-emerald-950/60 border-y border-emerald-900 flex flex-col items-center justify-between gap-8 min-h-[380px] relative">
          {/* Dealer Area */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs uppercase tracking-widest font-bold text-emerald-300/80">
              Рука Дилера {round && `(${round.status === 'player_turn' ? '?' : round.dealerHand.score})`}
            </div>
            <div className="flex gap-2 min-h-[100px] items-center">
              {round ? (
                <>
                  {round.dealerHand.cards.map((c, idx) => (
                    <div key={idx}>{renderCard(c)}</div>
                  ))}
                  {round.dealerHiddenCard && renderCard(round.dealerHiddenCard, true)}
                </>
              ) : (
                <div className="text-xs text-emerald-400/40">Ожидание ставки...</div>
              )}
            </div>
          </div>

          {/* Table Center / Result Banner */}
          {round?.resultMessage && (
            <div className="px-6 py-2 rounded-2xl bg-slate-950/90 border border-emerald-400/50 text-emerald-300 text-xs sm:text-sm font-black font-mono shadow-2xl animate-fade-in text-center">
              {round.resultMessage}
            </div>
          )}

          {/* Player Area */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2 min-h-[100px] items-center">
              {round ? (
                round.playerHand.cards.map((c, idx) => (
                  <div key={idx}>{renderCard(c)}</div>
                ))
              ) : (
                <div className="text-xs text-emerald-400/40">Ваши карты появятся здесь</div>
              )}
            </div>
            <div className="text-xs uppercase tracking-widest font-bold text-emerald-300">
              Ваша рука {round && `(Очки: ${round.playerHand.score})`}
            </div>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          {/* Bet controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Ставка:</span>
            <div className="flex items-center gap-1.5">
              {[50, 100, 500, 1000, 5000].map((v) => (
                <button
                  key={v}
                  disabled={round?.status === 'player_turn'}
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

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!round || round.status === 'resolved' ? (
              <button
                disabled={casinoCoins < bet}
                onClick={handleDeal}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                РАЗДАТЬ ({bet} CC)
              </button>
            ) : (
              <>
                <button
                  onClick={handleHit}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow"
                >
                  HIT (ЕЩЕ)
                </button>
                <button
                  onClick={handleStand}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow"
                >
                  STAND (ХВАТИТ)
                </button>
                {round.canDouble && (
                  <button
                    disabled={casinoCoins < round.betAmountCC}
                    onClick={handleDouble}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow"
                  >
                    DOUBLE (x2)
                  </button>
                )}
                {round.canSurrender && (
                  <button
                    onClick={handleSurrender}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    SURRENDER
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
