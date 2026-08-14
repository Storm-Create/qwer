/**
 * Business Empire: Ultimate
 * Bank New Deposit Modal
 */

import React, { useState } from 'react';
import { X, PiggyBank, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { DepositPlan } from '../../types/bank';
import { bankManager } from '../../game/finance/bankManager';

interface NewDepositModalProps {
  playerCash: number;
  onClose: () => void;
  onConfirmDeposit: (planId: string, amount: number) => void;
  currency?: string;
}

export const NewDepositModal: React.FC<NewDepositModalProps> = ({
  playerCash,
  onClose,
  onConfirmDeposit,
  currency = '$',
}) => {
  const plans = bankManager.getDepositPlans();
  const [selectedPlan, setSelectedPlan] = useState<DepositPlan>(plans[0]);
  const [depositAmount, setDepositAmount] = useState<number>(Math.max(selectedPlan.minAmount, Math.min(playerCash, selectedPlan.minAmount * 2)));

  const canAfford = playerCash >= depositAmount && depositAmount >= selectedPlan.minAmount;

  const dailyInterest = Math.round((depositAmount * selectedPlan.annualInterestRate) / 360);
  const totalInterestExpected = Math.round(dailyInterest * selectedPlan.termDays);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Открытие банковского депозита</h3>
              <p className="text-xs text-slate-400">
                Доступно средств: <span className="font-mono text-emerald-400 font-bold">{currency}{Math.floor(playerCash).toLocaleString()}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-2 gap-2">
          {plans.map((p) => {
            const isSelected = selectedPlan.id === p.id;

            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPlan(p);
                  if (depositAmount < p.minAmount) {
                    setDepositAmount(p.minAmount);
                  }
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-500/10 border-teal-500/40 text-slate-100 ring-1 ring-teal-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{p.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300">
                      {p.badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Мин. вклад: {currency}{p.minAmount.toLocaleString()}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                  <span className="text-teal-400 font-mono font-bold">
                    +{(p.annualInterestRate * 100).toFixed(1)}% годовых
                  </span>
                  <span className="text-slate-400">{p.termDays} дней</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Amount Input */}
        <div className="space-y-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400">Сумма вклада:</span>
              <span className="font-mono text-lg font-bold text-slate-100">
                {currency}{depositAmount.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={selectedPlan.minAmount}
              max={Math.max(selectedPlan.minAmount * 5, playerCash)}
              step={selectedPlan.minAmount > 50000 ? 50000 : 5000}
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>Мин: {currency}{selectedPlan.minAmount.toLocaleString()}</span>
              <span>Баланс: {currency}{Math.floor(playerCash).toLocaleString()}</span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-1.5 pt-1">
            {[0.25, 0.5, 0.75, 1.0].map((fraction) => {
              const amount = Math.max(selectedPlan.minAmount, Math.floor(playerCash * fraction));
              return (
                <button
                  key={fraction}
                  type="button"
                  onClick={() => setDepositAmount(amount)}
                  className="flex-1 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  {fraction * 100}% ({currency}{amount.toLocaleString()})
                </button>
              );
            })}
          </div>

          {/* Return Projections */}
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">Срок фиксации:</div>
              <div className="font-mono font-bold text-slate-200 mt-0.5">
                {selectedPlan.termDays} дней
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">Доход в день:</div>
              <div className="font-mono font-bold text-emerald-400 mt-0.5">
                +{currency}{dailyInterest.toLocaleString()}/день
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">Итоговый профит:</div>
              <div className="font-mono font-bold text-teal-300 mt-0.5">
                +{currency}{totalInterestExpected.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              onConfirmDeposit(selectedPlan.id, depositAmount);
              onClose();
            }}
            disabled={!canAfford}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              canAfford
                ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-lg shadow-teal-500/20'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span>Разместить вклад ({currency}{depositAmount.toLocaleString()})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
