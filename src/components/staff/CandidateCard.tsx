/**
 * Business Empire: Ultimate
 * Candidate Card Component for Recruitment Market
 */

import React from 'react';
import { Award, Zap, Heart, UserPlus } from 'lucide-react';
import { Employee } from '../../types/staff';
import { EMPLOYEE_ROLES } from '../../game/staff/staffCatalog';
import { economy } from '../../game/economy';

interface CandidateCardProps {
  candidate: Employee;
  onHire: (candidate: Employee) => void;
  canAfford: boolean;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onHire,
  canAfford,
}) => {
  const role = EMPLOYEE_ROLES[candidate.type];
  const placementFee = candidate.salary * 3;
  const efficiencyPercent = Math.round(candidate.efficiency * 100);

  return (
    <div
      id={`candidate_card_${candidate.id}`}
      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-2xl">
              {candidate.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-100">{candidate.name}</h4>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Lvl {candidate.level}
                </span>
              </div>
              <span className={`inline-block px-2 py-0.5 mt-0.5 rounded text-[11px] font-medium border ${role.badgeBg}`}>
                {role.title}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-slate-200 font-mono">
              {economy.formatMoney(candidate.salary)}/д
            </div>
            <div className="text-[10px] text-slate-400">ожидание з/п</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 mb-3 text-center">
          <div>
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Award className="w-3 h-3 text-amber-400" /> Навык
            </div>
            <div className="text-xs font-bold text-slate-200 font-mono mt-0.5">
              {candidate.skill} / 100
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" /> КПД
            </div>
            <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
              {efficiencyPercent}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Heart className="w-3 h-3 text-rose-400" /> Мораль
            </div>
            <div className="text-xs font-bold text-rose-300 font-mono mt-0.5">
              {candidate.morale}%
            </div>
          </div>
        </div>

        {/* Role Impact Note */}
        <div className="text-xs text-slate-300 bg-slate-800/40 p-2 rounded-lg border border-slate-800/60 mb-3">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
            Профиль должности:
          </span>
          {role.primaryImpactDescription}
        </div>

        {candidate.perks && candidate.perks.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {candidate.perks.map((p, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700"
              >
                ✨ {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hire Action */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] text-slate-400">Стоимость найма (комиссия агентства):</div>
          <div className="text-xs font-bold text-slate-200 font-mono">
            {economy.formatMoney(placementFee)}
          </div>
        </div>

        <button
          id={`btn_hire_${candidate.id}`}
          onClick={() => onHire(candidate)}
          disabled={!canAfford}
          className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            canAfford
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Принять в штат
        </button>
      </div>
    </div>
  );
};
