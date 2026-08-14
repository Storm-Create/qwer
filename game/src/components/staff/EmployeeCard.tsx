/**
 * Business Empire: Ultimate
 * Employee Card Component
 */

import React from 'react';
import {
  TrendingUp,
  Award,
  Zap,
  DollarSign,
  Briefcase,
  Trash2,
  GraduationCap,
  Sparkles,
  Heart,
} from 'lucide-react';
import { Employee } from '../../types/staff';
import { EMPLOYEE_ROLES } from '../../game/staff/staffCatalog';
import { economy } from '../../game/economy';

interface EmployeeCardProps {
  employee: Employee;
  onTrain: (employee: Employee) => void;
  onAssign: (employee: Employee) => void;
  onBonus: (employee: Employee) => void;
  onFire: (employee: Employee) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onTrain,
  onAssign,
  onBonus,
  onFire,
}) => {
  const role = EMPLOYEE_ROLES[employee.type];
  const efficiencyPercent = Math.round(employee.efficiency * 100);

  return (
    <div
      id={`employee_card_${employee.id}`}
      className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-2xl shadow-inner">
              {employee.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-100">{employee.name}</h4>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Lvl {employee.level}
                </span>
              </div>
              <span className={`inline-block px-2 py-0.5 mt-0.5 rounded text-[11px] font-medium border ${role.badgeBg}`}>
                {role.title}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-slate-200 font-mono">
              {economy.formatMoney(employee.salary)}/д
            </div>
            <div className="text-[10px] text-slate-400">зарплата</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 mb-3 text-center">
          <div>
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Award className="w-3 h-3 text-amber-400" /> Навык
            </div>
            <div className="text-xs font-bold text-slate-200 font-mono mt-0.5">
              {employee.skill} / 100
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
              {employee.morale}%
            </div>
          </div>
        </div>

        {/* Impact description */}
        <div className="text-xs text-slate-300 bg-slate-800/40 p-2 rounded-lg border border-slate-800/60 mb-3">
          <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider block mb-0.5">
            Бизнес-эффект:
          </span>
          {role.primaryImpactDescription}
        </div>

        {/* Assignment & Perks */}
        <div className="space-y-1.5 mb-3 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1 text-[11px]">
              <Briefcase className="w-3 h-3 text-slate-400" /> Назначение:
            </span>
            <span className="font-medium text-slate-200 truncate max-w-[160px]">
              {employee.assignedBusinessName || 'Не назначен'}
            </span>
          </div>

          {employee.perks && employee.perks.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {employee.perks.map((p, idx) => (
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
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800">
        <button
          id={`btn_assign_${employee.id}`}
          onClick={() => onAssign(employee)}
          className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors flex items-center justify-center gap-1"
          title="Назначить на объект"
        >
          <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Пост</span>
        </button>

        <button
          id={`btn_train_${employee.id}`}
          onClick={() => onTrain(employee)}
          className="px-2 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition-colors flex items-center justify-center gap-1"
          title="Отправить на обучение"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Обучить</span>
        </button>

        <button
          id={`btn_bonus_${employee.id}`}
          onClick={() => onBonus(employee)}
          className="px-2 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition-colors flex items-center justify-center gap-1"
          title="Выплатить премию"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Премия</span>
        </button>

        <button
          id={`btn_fire_${employee.id}`}
          onClick={() => onFire(employee)}
          className="px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/20 transition-colors flex items-center justify-center"
          title="Уволить сотрудника"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
