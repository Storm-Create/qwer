/**
 * Business Empire: Ultimate
 * Offline Progress Report Modal
 */

import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, DollarSign, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { OfflineProgressResult } from '../types/game';

interface OfflineProgressModalProps {
  result: OfflineProgressResult;
  currency?: string;
  onClose: () => void;
}

export const OfflineProgressModal: React.FC<OfflineProgressModalProps> = ({
  result,
  currency = '$',
  onClose,
}) => {
  const hoursAway = (result.elapsedSeconds / 3600).toFixed(1);
  const minutesAway = Math.round(result.elapsedSeconds / 60);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 font-mono">
              ОФЛАЙН ОТЧЕТ ИМПЕРИИ
            </h3>
            <p className="text-xs text-slate-400">
              Ваши предприятия и активы продолжали генерировать прибыль
            </p>
          </div>
        </div>

        {/* Offline Time Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Реальное время отсутствия:</span>
            </div>
            <div className="text-sm font-bold font-mono text-slate-200">
              {minutesAway < 60 ? `${minutesAway} мин.` : `${hoursAway} час.`}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Симулировано в игре:</span>
            </div>
            <div className="text-sm font-bold font-mono text-emerald-300">
              {result.simulatedDays} дн. ({result.simulatedHours} ч.)
            </div>
          </div>
        </div>

        {/* Financial Flow Summary */}
        <div className="space-y-2.5 mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Получено доходов:
            </span>
            <span className="font-mono font-semibold text-emerald-400">
              +{currency}{result.earnings.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              Оплачено расходов и налогов:
            </span>
            <span className="font-mono font-semibold text-rose-400">
              -{currency}{result.expenses.toLocaleString()}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm font-bold">
            <span className="text-slate-200 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Чистая прибыль начислена:
            </span>
            <span
              className={`font-mono text-base ${
                result.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {result.netProfit >= 0 ? '+' : ''}
              {currency}{result.netProfit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          id="btn-claim-offline-progress"
          onClick={onClose}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Принять и войти в управление</span>
        </button>
      </div>
    </div>
  );
};
