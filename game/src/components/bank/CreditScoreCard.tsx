/**
 * Business Empire: Ultimate
 * Bank Credit Score & Risk Audit Card
 */

import React from 'react';
import { ShieldCheck, ShieldAlert, Award, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { CreditScoreReport, CreditRatingGrade } from '../../types/bank';

interface CreditScoreCardProps {
  report: CreditScoreReport;
  currency?: string;
}

export const CreditScoreCard: React.FC<CreditScoreCardProps> = ({
  report,
  currency = '$',
}) => {
  const ratingColors: Record<CreditRatingGrade, { bg: string; text: string; border: string }> = {
    AAA: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/40' },
    AA: { bg: 'bg-teal-500/20', text: 'text-teal-300', border: 'border-teal-500/40' },
    A: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/40' },
    BBB: { bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/40' },
    BB: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40' },
    B: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40' },
    CCC: { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/40' },
    D: { bg: 'bg-red-500/30', text: 'text-red-300', border: 'border-red-500/50' },
  };

  const riskColors = {
    minimal: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    low: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    moderate: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    elevated: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    critical: 'text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse',
  };

  const riskLabels = {
    minimal: 'Минимальный риск',
    low: 'Низкий риск',
    moderate: 'Умеренный риск',
    elevated: 'Повышенный риск',
    critical: 'Критический дефицит',
  };

  const style = ratingColors[report.rating] || ratingColors.BBB;

  return (
    <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-black text-2xl border ${style.bg} ${style.text} ${style.border}`}>
            {report.rating}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100 font-mono">
                КРЕДИТНЫЙ РЕЙТИНГ: {report.score} / 850
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${riskColors[report.riskLevel]}`}>
                {riskLabels[report.riskLevel]}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Максимальный доступный кредитный лимит: <span className="font-mono text-emerald-400 font-bold">{currency}{report.maxCreditLine.toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
            <div className="text-slate-400 text-[10px]">Долговая нагрузка (D/A)</div>
            <div className={`font-mono font-bold ${report.debtToAssetRatio > 0.5 ? 'text-rose-400' : 'text-slate-200'}`}>
              {(report.debtToAssetRatio * 100).toFixed(1)}%
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
            <div className="text-slate-400 text-[10px]">Покрытие долга (DSCR)</div>
            <div className={`font-mono font-bold ${report.debtServiceCoverageRatio < 1.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {report.dailyDebtService > 0 ? `${report.debtServiceCoverageRatio.toFixed(2)}x` : '10.0x'}
            </div>
          </div>
        </div>
      </div>

      {/* Audit Factors */}
      <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        {report.factors.map((f, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-start gap-2"
          >
            {f.impact === 'positive' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : f.impact === 'negative' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <TrendingUp className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold text-slate-200">{f.title}</div>
              <div className="text-[11px] text-slate-400">{f.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
