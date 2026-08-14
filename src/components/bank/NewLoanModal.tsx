/**
 * Business Empire: Ultimate
 * Bank New Loan Application Modal
 */

import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Zap, TrendingUp, Building, ArrowRight } from 'lucide-react';
import { LoanProduct, CreditScoreReport } from '../../types/bank';
import { bankManager } from '../../game/finance/bankManager';

interface NewLoanModalProps {
  report: CreditScoreReport;
  onClose: () => void;
  onConfirmLoan: (productId: string, amount: number) => void;
  currency?: string;
}

export const NewLoanModal: React.FC<NewLoanModalProps> = ({
  report,
  onClose,
  onConfirmLoan,
  currency = '$',
}) => {
  const products = bankManager.getLoanProducts();
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct>(products[0]);
  const maxAllowed = Math.min(selectedProduct.maxAmountMultiplier, report.maxCreditLine);
  const [borrowAmount, setBorrowAmount] = useState<number>(Math.round(maxAllowed * 0.5));

  const isEligible = bankManager.isRatingSufficient(report.rating, selectedProduct.minRatingRequired);

  const totalInterest = borrowAmount * (selectedProduct.baseAnnualRate * (selectedProduct.termDays / 360));
  const totalRepayment = Math.round(borrowAmount + totalInterest);
  const dailyPayment = Math.round(totalRepayment / selectedProduct.termDays);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Оформление корпоративного кредита</h3>
              <p className="text-xs text-slate-400">
                Ваш текущий рейтинг: <span className="font-mono font-bold text-slate-200">{report.rating}</span> ({report.score} pts)
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

        {/* Product selector grid */}
        <div className="grid grid-cols-2 gap-2">
          {products.map((p) => {
            const meetsRating = bankManager.isRatingSufficient(report.rating, p.minRatingRequired);
            const isSelected = selectedProduct.id === p.id;

            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProduct(p);
                  const newMax = Math.min(p.maxAmountMultiplier, report.maxCreditLine);
                  setBorrowAmount(Math.round(newMax * 0.5));
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-rose-500/10 border-rose-500/40 text-slate-100 ring-1 ring-rose-500/30'
                    : meetsRating
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    : 'bg-slate-950/30 border-slate-900 text-slate-500 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{p.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      Рейтинг {p.minRatingRequired}+
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Лимит до {currency}{p.maxAmountMultiplier.toLocaleString()}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                  <span className="text-rose-400 font-mono">{(p.baseAnnualRate * 100).toFixed(1)}% годовых</span>
                  <span className="text-slate-400">{p.termDays} дней</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Loan Amount Slider */}
        {isEligible ? (
          <div className="space-y-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400">Сумма кредита:</span>
                <span className="font-mono text-lg font-bold text-slate-100">
                  {currency}{borrowAmount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={maxAllowed}
                step={5000}
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Мин: {currency}5,000</span>
                <span>Макс: {currency}{maxAllowed.toLocaleString()}</span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                <div className="text-slate-400 text-[10px]">Срок кредита:</div>
                <div className="font-mono font-bold text-slate-200 mt-0.5">
                  {selectedProduct.termDays} дней
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                <div className="text-slate-400 text-[10px]">Ежедневный платеж:</div>
                <div className="font-mono font-bold text-rose-400 mt-0.5">
                  -{currency}{dailyPayment.toLocaleString()}/день
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80">
                <div className="text-slate-400 text-[10px]">Итого к возврату:</div>
                <div className="font-mono font-bold text-slate-200 mt-0.5">
                  {currency}{totalRepayment.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-1">
            <div className="text-xs font-bold text-rose-300">
              Недостаточный кредитный рейтинг для данного продукта
            </div>
            <p className="text-[11px] text-slate-400">
              Требуется рейтинг {selectedProduct.minRatingRequired} или выше. Погашайте текущие задолженности вовремя для повышения оценки банка.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              onConfirmLoan(selectedProduct.id, borrowAmount);
              onClose();
            }}
            disabled={!isEligible}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              isEligible
                ? 'bg-rose-500 hover:bg-rose-400 text-white font-bold shadow-lg shadow-rose-500/20'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Оформить заем ({currency}{borrowAmount.toLocaleString()})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
