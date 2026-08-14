/**
 * Business Empire: Ultimate
 * Bank Active Loan Card
 */

import React from 'react';
import { CreditCard, CheckCircle2, Clock, RotateCcw, AlertCircle } from 'lucide-react';
import { BankLoan } from '../../types/bank';

interface LoanCardProps {
  loan: BankLoan;
  playerCash: number;
  onRepayEarly: (loanId: string) => void;
  onRestructure: (loanId: string) => void;
  currency?: string;
}

export const LoanCard: React.FC<LoanCardProps> = ({
  loan,
  playerCash,
  onRepayEarly,
  onRestructure,
  currency = '$',
}) => {
  const progressPercent = Math.max(
    0,
    Math.min(100, ((loan.principal - loan.remainingDebt) / loan.principal) * 100)
  );

  const canAffordEarly = playerCash >= loan.remainingDebt;

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">{loan.name}</h4>
              <div className="text-[11px] text-slate-400">
                Ставка: {(loan.interestRate * 100).toFixed(1)}% годовых
              </div>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">
            Остаток: {currency}{loan.remainingDebt.toLocaleString()}
          </span>
        </div>

        {/* Repayment Progress Bar */}
        <div className="my-3 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400">Погашено из тела займа:</span>
            <span className="font-mono text-slate-200 font-bold">
              {currency}{Math.max(0, loan.principal - loan.remainingDebt).toLocaleString()} / {currency}{loan.principal.toLocaleString()}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Loan Financial Specs */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Ежедневный платеж:</span>
            <span className="font-mono font-bold text-rose-400">
              -{currency}{loan.payment.toLocaleString()}/день
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Осталось дней:</span>
            <span className="font-mono text-slate-300">
              {loan.daysRemaining} из {loan.duration} дней
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Всего выплачено:</span>
            <span className="font-mono text-slate-300">
              {currency}{loan.totalPaid.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2">
        <button
          onClick={() => onRestructure(loan.id)}
          className="py-2 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          title="Продлить срок в 2 раза и снизить ежедневный платеж"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Реструктуризация</span>
        </button>

        <button
          onClick={() => onRepayEarly(loan.id)}
          disabled={!canAffordEarly}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            canAffordEarly
              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Погасить ({currency}{loan.remainingDebt.toLocaleString()})</span>
        </button>
      </div>
    </div>
  );
};
