/**
 * Business Empire: Ultimate
 * Bonus Modal Component
 */

import React, { useState } from 'react';
import { X, Sparkles, Heart, DollarSign } from 'lucide-react';
import { Employee } from '../../types/staff';
import { EMPLOYEE_ROLES } from '../../game/staff/staffCatalog';
import { economy } from '../../game/economy';

interface BonusModalProps {
  employee: Employee;
  cash: number;
  onClose: () => void;
  onPayBonus: (amount: number) => void;
}

export const BonusModal: React.FC<BonusModalProps> = ({
  employee,
  cash,
  onClose,
  onPayBonus,
}) => {
  const role = EMPLOYEE_ROLES[employee.type];
  const [selectedBonus, setSelectedBonus] = useState<number>(employee.salary);

  const bonusPresets = [
    { label: 'Суточная премия', amount: employee.salary, morale: '+20%' },
    { label: 'Квартальный бонус', amount: employee.salary * 3, morale: '+35%' },
    { label: 'Годовой супербонус', amount: employee.salary * 10, morale: '+50% (Max 100%)' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono">
                ВЫПЛАТА ПРЕМИИ
              </h3>
              <p className="text-xs text-slate-400">
                Сотрудник: <span className="text-slate-200 font-bold">{employee.name}</span> ({role.title})
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

        {/* Current Morale */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-slate-300">Текущая мораль и лояльность:</span>
          </div>
          <span className="text-sm font-bold font-mono text-rose-300">{employee.morale}%</span>
        </div>

        {/* Presets */}
        <div className="space-y-2.5">
          {bonusPresets.map((preset, idx) => {
            const isSelected = selectedBonus === preset.amount;
            const canAfford = cash >= preset.amount;

            return (
              <div
                key={idx}
                onClick={() => canAfford && setSelectedBonus(preset.amount)}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                } ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-100">{preset.label}</div>
                  <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                    Эффект: {preset.morale} к морали
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-200 font-mono">
                    {economy.formatMoney(preset.amount)}
                  </div>
                  {!canAfford && (
                    <span className="text-[10px] text-rose-400">Не хватает</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => onPayBonus(selectedBonus)}
            disabled={cash < selectedBonus}
            className={`w-full py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
              cash >= selectedBonus
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Выплатить премию {economy.formatMoney(selectedBonus)}
          </button>
        </div>
      </div>
    </div>
  );
};
