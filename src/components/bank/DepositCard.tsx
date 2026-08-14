/**
 * Business Empire: Ultimate
 * Bank Active Deposit Card
 */

import React from 'react';
import { PiggyBank, ArrowDownRight, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { BankDeposit } from '../../types/bank';

interface DepositCardProps {
  deposit: BankDeposit;
  onWithdraw: (depositId: string, isEarly: boolean) => void;
  onToggleAutoRenew: (depositId: string) => void;
  currency?: string;
}

export const DepositCard: React.FC<DepositCardProps> = ({
  deposit,
  onWithdraw,
  onToggleAutoRenew,
  currency = '$',
}) => {
  const isMatured = deposit.daysRemaining <= 0;
  const progressPercent = Math.max(
    0,
    Math.min(100, ((deposit.duration - deposit.daysRemaining) / deposit.duration) * 100)
  );

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">{deposit.name}</h4>
              <div className="text-[11px] text-slate-400">
                Ставка: {(deposit.interestRate * 100).toFixed(1)}% годовых
              </div>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 text-[10px] font-mono font-bold">
            Тело: {currency}{deposit.amount.toLocaleString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="my-3 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Срок вклада:</span>
            <span className="font-mono text-slate-200 font-bold">
              {deposit.daysRemaining > 0
                ? `${deposit.duration - deposit.daysRemaining} / ${deposit.duration} дней`
                : 'Срок завершен'}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Financial info */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Ежедневный процентный доход:</span>
            <span className="font-mono font-bold text-emerald-400">
              +{currency}{deposit.dailyInterest.toLocaleString()}/день
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Всего заработано процентов:</span>
            <span className="font-mono text-teal-300 font-bold">
              +{currency}{deposit.totalInterestEarned.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
            <span className="text-slate-400">Автопролонгация:</span>
            <button
              onClick={() => onToggleAutoRenew(deposit.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                deposit.autoRenew
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {deposit.autoRenew ? 'Включена' : 'Выключена'}
            </button>
          </div>
        </div>
      </div>

      {/* Withdraw button */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <button
          onClick={() => onWithdraw(deposit.id, !isMatured)}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
            isMatured
              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          <ArrowDownRight className="w-3.5 h-3.5" />
          <span>{isMatured ? 'Забрать депозит с прибылью' : 'Досрочно закрыть вклад'}</span>
        </button>
      </div>
    </div>
  );
};
