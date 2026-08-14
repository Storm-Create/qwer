/**
 * Business Empire: Ultimate
 * Interactive Texas Hold'em Poker vs AI Component
 */

import React, { useState } from 'react';
import { CasinoGameDefinition } from '../../../types/casino';
import { PokerEngine, PokerRoundState } from '../../../game/casino/engines/pokerEngine';
import { PlayingCard } from '../../../game/casino/engines/blackjackEngine';
import { casinoManager } from '../../../game/casino/casinoManager';
import { X, Play, ShieldAlert, Sparkles } from 'lucide-react';

interface PokerGameModalProps {
  game: CasinoGameDefinition;
  onClose: () => void;
  casinoCoins: number;
}

export const PokerGameModal: React.FC<PokerGameModalProps> = ({ game, onClose, casinoCoins }) => {
  const [blind, setBlind] = useState(100);
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [round, setRound] = useState<PokerRoundState | null>(null);

  const startRound = () => {
    if (casinoCoins < blind) return;
    const { state: initRound, deck: newDeck } = PokerEngine.startRound(blind);
    setRound(initRound);
    setDeck(newDeck);
  };

  const handleNextStage = () => {
    if (!round) return;

    if (round.stage === 'preflop') {
      const { state: s2, deck: d2 } = PokerEngine.dealFlop(round, deck);
      setRound(s2);
      setDeck(d2);
    } else if (round.stage === 'flop') {
      const { state: s3, deck: d3 } = PokerEngine.dealTurn(round, deck);
      setRound(s3);
      setDeck(d3);
    } else if (round.stage === 'turn') {
      const { state: s4, deck: d4 } = PokerEngine.dealRiver(round, deck);
      setRound(s4);
      setDeck(d4);
    } else if (round.stage === 'river') {
      const resolved = PokerEngine.showdown(round);
      setRound(resolved);
      const payout = resolved.winner === 'player' ? resolved.potCC : resolved.winner === 'tie' ? Math.floor(resolved.potCC / 2) : 0;
      casinoManager.recordGameRound(game.id, game.name, game.category, resolved.playerBetCC, payout);
    }
  };

  const handleRaise = () => {
    if (!round || casinoCoins < round.playerBetCC + blind) return;
    const addedBet = blind;
    const updatedRound: PokerRoundState = {
      ...round,
      playerBetCC: round.playerBetCC + addedBet,
      aiBetCC: round.aiBetCC + addedBet,
      potCC: round.potCC + (addedBet * 2),
    };
    setRound(updatedRound);
    handleNextStage();
  };

  const handleFold = () => {
    if (!round) return;
    setRound({
      ...round,
      stage: 'showdown',
      winner: 'ai',
      playerFolded: true,
      resultMessage: 'Вы сбросили карты (Fold). Раунд проигран.',
    });
    casinoManager.recordGameRound(game.id, game.name, game.category, round.playerBetCC, 0);
  };

  const renderCard = (card: PlayingCard, hidden = false) => {
    if (hidden) {
      return (
        <div className="w-12 h-16 sm:w-14 sm:h-20 bg-gradient-to-br from-indigo-900 to-slate-950 border-2 border-indigo-500/40 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-lg">🂠</span>
        </div>
      );
    }

    const isRed = card.suit === '♥' || card.suit === '♦';
    return (
      <div className="w-12 h-16 sm:w-14 sm:h-20 bg-white border border-slate-300 rounded-xl p-1 flex flex-col justify-between shadow-lg text-slate-950 select-none">
        <div className={`text-[11px] font-black leading-none ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {card.value}{card.suit}
        </div>
        <div className={`text-base self-center font-bold ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {card.suit}
        </div>
        <div className={`text-[11px] font-black leading-none self-end rotate-180 ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {card.value}{card.suit}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-blue-500/30 rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 to-slate-950 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">♠️</span>
            <div>
              <h3 className="text-lg font-black text-white">{game.name}</h3>
              <div className="text-xs text-blue-300 font-mono">
                Texas Hold'em vs AI • Блайнды: {blind} CC
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-blue-500/40 text-blue-300 font-mono font-bold text-xs">
              🪙 {casinoCoins.toLocaleString()} CC
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 text-slate-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Poker Felt Table */}
        <div className="p-6 sm:p-8 bg-blue-950/40 border-y border-blue-900/50 flex flex-col items-center justify-between gap-6 min-h-[380px]">
          {/* AI Cards */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="text-xs uppercase tracking-widest font-bold text-blue-300">
              AI Оппонент {round?.aiHandRank && `(${round.aiHandRank})`}
            </div>
            <div className="flex gap-2 min-h-[80px]">
              {round ? (
                round.aiCards.map((c, i) => (
                  <div key={i}>{renderCard(c, round.stage !== 'showdown')}</div>
                ))
              ) : (
                <div className="text-xs text-slate-500">Ожидание начала игры...</div>
              )}
            </div>
          </div>

          {/* Table Community Board & Pot */}
          <div className="flex flex-col items-center gap-3 bg-slate-950/80 p-4 rounded-2xl border border-blue-500/30 w-full max-w-xl">
            <div className="text-xs font-mono font-bold text-amber-300">
              БАНК (POT): {round ? round.potCC.toLocaleString() : 0} CC
            </div>

            <div className="flex gap-2 min-h-[80px] items-center">
              {round && round.communityCards.length > 0 ? (
                round.communityCards.map((c, idx) => <div key={idx}>{renderCard(c)}</div>)
              ) : (
                <div className="text-xs text-slate-500 italic">Префлоп: карты борда закрыты</div>
              )}
            </div>

            {round?.resultMessage && (
              <div className="text-xs font-bold text-cyan-300 text-center font-mono animate-fade-in">
                {round.resultMessage}
              </div>
            )}
          </div>

          {/* Player Cards */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex gap-2 min-h-[80px]">
              {round ? (
                round.playerCards.map((c, i) => <div key={i}>{renderCard(c)}</div>)
              ) : (
                <div className="text-xs text-slate-500">Ваши 2 карманные карты</div>
              )}
            </div>
            <div className="text-xs uppercase tracking-widest font-bold text-blue-300">
              Ваша рука {round?.playerHandRank && `(${round.playerHandRank})`}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Блайнд:</span>
            <div className="flex items-center gap-1.5">
              {[50, 100, 500, 1000].map((v) => (
                <button
                  key={v}
                  disabled={round && round.stage !== 'showdown'}
                  onClick={() => setBlind(v)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border ${
                    blind === v ? 'bg-blue-500 text-white border-blue-400 font-black' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!round || round.stage === 'showdown' ? (
              <button
                disabled={casinoCoins < blind}
                onClick={startRound}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                НОВАЯ РАЗДАЧА ({blind} CC)
              </button>
            ) : (
              <>
                <button
                  onClick={handleNextStage}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow"
                >
                  CHECK / CALL
                </button>
                <button
                  onClick={handleRaise}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow"
                >
                  RAISE (+{blind} CC)
                </button>
                <button
                  onClick={handleFold}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-xs border border-rose-500/30"
                >
                  FOLD (СБРОС)
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
