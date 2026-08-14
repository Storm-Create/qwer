/**
 * Business Empire: Ultimate
 * Esports Empire — Interactive Match Viewer Modal
 * Displays round-by-round live simulation, killfeed, clutch moments,
 * live viewer spikes, MVP player, and trophy celebrations.
 */

import React, { useEffect, useState } from 'react';
import {
  Trophy,
  X,
  Zap,
  Users,
  Award,
  Play,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
} from 'lucide-react';
import { TournamentMatch } from '../../types/esports';

interface MatchLiveModalProps {
  match: TournamentMatch;
  onClose: () => void;
}

export const EsportsMatchLiveModal: React.FC<MatchLiveModalProps> = ({ match, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const rounds = match.roundDetails || [];
  const isFinished = currentStep >= rounds.length;

  useEffect(() => {
    if (!isAutoPlaying || isFinished) return;
    const timer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 1200);
    return () => clearTimeout(timer);
  }, [currentStep, isAutoPlaying, isFinished, rounds.length]);

  const visibleRounds = rounds.slice(0, currentStep);
  const latestRound = rounds[currentStep - 1];
  const isTeamAWon = match.winnerId === match.teamAId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Live Broadcast Banner */}
        <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-black animate-pulse">
              <Radio className="w-3.5 h-3.5 text-rose-500" />
              LIVE MATCH BROADCAST
            </div>
            <span className="text-sm font-semibold text-slate-300">{match.roundName}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/50">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Зрители:</span>
              <span className="font-bold text-slate-200">{match.viewers.live.toLocaleString()}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big Scoreboard Banner */}
        <div className="p-6 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-around text-center">
          {/* Team A (Player) */}
          <div className="flex-1 flex flex-col items-center">
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold mb-1">Ваша Организация</span>
            <h3 className="text-xl lg:text-2xl font-black text-white">{match.teamAName}</h3>
            <span className="text-xs text-slate-400 mt-1">Рейтинг: <b className="text-cyan-300">{match.teamARating}</b></span>
          </div>

          {/* Current Score Display */}
          <div className="px-6 py-2 bg-slate-900 border border-slate-700/80 rounded-2xl flex items-center gap-4 shadow-inner">
            <span className={`text-3xl lg:text-5xl font-black ${isTeamAWon && isFinished ? 'text-emerald-400 scale-110' : 'text-cyan-400'}`}>
              {latestRound ? latestRound.scoreAfter[0] : 0}
            </span>
            <span className="text-xl font-bold text-slate-600">:</span>
            <span className={`text-3xl lg:text-5xl font-black ${!isTeamAWon && isFinished ? 'text-emerald-400 scale-110' : 'text-rose-400'}`}>
              {latestRound ? latestRound.scoreAfter[1] : 0}
            </span>
          </div>

          {/* Team B (Rival) */}
          <div className="flex-1 flex flex-col items-center">
            <span className="text-xs uppercase tracking-wider text-rose-400 font-bold mb-1">Соперник</span>
            <h3 className="text-xl lg:text-2xl font-black text-white">{match.teamBName}</h3>
            <span className="text-xs text-slate-400 mt-1">Рейтинг: <b className="text-rose-300">{match.teamBRating}</b></span>
          </div>
        </div>

        {/* Live Timeline & Events Feed */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-900/60">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Ход матча и ключевые события</span>
            <span className="text-slate-500 font-normal">Раунд {Math.min(currentStep, rounds.length)} из {rounds.length}</span>
          </div>

          {visibleRounds.map((r, idx) => {
            const isRoundTeamA = r.winner === 'teamA';
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition animate-in slide-in-from-bottom-2 duration-300 ${
                  isRoundTeamA
                    ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-100'
                    : 'bg-rose-950/20 border-rose-500/30 text-rose-100'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${
                    isRoundTeamA
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  R{r.roundNumber}
                </div>

                <div className="flex-1 text-sm">
                  <p className="font-medium text-slate-200">{r.eventDescription}</p>
                </div>

                <div className="text-xs font-black px-2.5 py-1 rounded bg-slate-900 border border-slate-700/80 text-slate-300 flex-shrink-0">
                  {r.scoreAfter[0]} - {r.scoreAfter[1]}
                </div>
              </div>
            );
          })}

          {/* Match Completion Card */}
          {isFinished && (
            <div className={`p-5 rounded-2xl border text-center my-4 animate-in zoom-in-95 duration-300 ${
              isTeamAWon
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
                : 'bg-slate-950/60 border-slate-700 text-slate-200'
            }`}>
              <div className="flex justify-center mb-2">
                {isTeamAWon ? (
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
                    <Trophy className="w-6 h-6 animate-bounce" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                )}
              </div>

              <h4 className="text-xl font-black text-white">
                {isTeamAWon ? '🎉 ПОБЕДА В МАТЧЕ!' : 'Поражение в серии'}
              </h4>
              <p className="text-sm text-slate-400 mt-1">
                Финальный счет: <b className="text-white">{match.scoreA} : {match.scoreB}</b>
              </p>

              {match.mvpPlayerName && (
                <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                  <Award className="w-4 h-4 text-amber-400" />
                  MVP Матча: {match.mvpPlayerName}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {!isFinished ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Play className={`w-3.5 h-3.5 ${isAutoPlaying ? 'text-amber-400' : 'text-slate-400'}`} />
                {isAutoPlaying ? 'Пауза' : 'Авто-воспроизведение'}
              </button>
              <button
                onClick={() => setCurrentStep(rounds.length)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Пропустить к результату
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Пиковый онлайн матча: <b className="text-cyan-400">{match.viewers.peak.toLocaleString()} чел.</b>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
