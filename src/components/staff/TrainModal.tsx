/**
 * Business Empire: Ultimate
 * Training Modal Component
 */

import React from 'react';
import { X, GraduationCap, Award, Zap, Heart, CheckCircle2 } from 'lucide-react';
import { Employee, TrainingCourse } from '../../types/staff';
import { TRAINING_COURSES, EMPLOYEE_ROLES } from '../../game/staff/staffCatalog';
import { economy } from '../../game/economy';

interface TrainModalProps {
  employee: Employee;
  cash: number;
  onClose: () => void;
  onSelectCourse: (course: TrainingCourse) => void;
}

export const TrainModal: React.FC<TrainModalProps> = ({
  employee,
  cash,
  onClose,
  onSelectCourse,
}) => {
  const role = EMPLOYEE_ROLES[employee.type];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono">
                КУРСЫ ПОВЫШЕНИЯ КВАЛИФИКАЦИИ
              </h3>
              <p className="text-xs text-slate-400">
                Сотрудник: <span className="text-slate-200 font-bold">{employee.name}</span> ({role.title}, Lvl {employee.level})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Employee Stats */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
          <div>
            <div className="text-[10px] text-slate-400">Текущий навык</div>
            <div className="text-xs font-bold text-slate-200 font-mono mt-0.5">
              {employee.skill} / 100
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Текущий КПД</div>
            <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
              {Math.round(employee.efficiency * 100)}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">Уровень</div>
            <div className="text-xs font-bold text-purple-300 font-mono mt-0.5">
              Lvl {employee.level}
            </div>
          </div>
        </div>

        {/* Available Courses */}
        <div className="space-y-3">
          {TRAINING_COURSES.map((course) => {
            const isEligible = employee.level >= course.targetMinLevel;
            const canAfford = cash >= course.cost;

            return (
              <div
                key={course.id}
                className={`p-4 rounded-xl border transition-all ${
                  isEligible
                    ? 'bg-slate-950/40 border-slate-800 hover:border-indigo-500/50'
                    : 'bg-slate-950/20 border-slate-800/40 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{course.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{course.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-indigo-400 font-mono">
                      {economy.formatMoney(course.cost)}
                    </div>
                    <div className="text-[10px] text-slate-500">стоимость</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mb-3 font-mono">
                  <span className="text-amber-400">+{course.skillBonus} навык</span>
                  <span className="text-emerald-400">
                    +{Math.round(course.efficiencyBonus * 100)}% КПД
                  </span>
                  <span className="text-rose-400">+{course.moraleBonus}% мораль</span>
                  <span className="text-purple-400">+1 Lvl</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-400">
                    {isEligible
                      ? `Требуется от Lvl ${course.targetMinLevel} (подходит)`
                      : `Требуется уровень ${course.targetMinLevel}+`}
                  </span>

                  <button
                    onClick={() => onSelectCourse(course)}
                    disabled={!isEligible || !canAfford}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isEligible && canAfford
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {!canAfford ? 'Недостаточно $' : 'Пройти курс'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
