/**
 * Business Empire: Ultimate
 * Modal: Hire Retail Staff
 */

import React, { useState } from 'react';
import { X, UserPlus, Users, Star, Award, Shield, DollarSign, CheckCircle2 } from 'lucide-react';
import { gameState } from '../../game/gameState';
import { retailManager } from '../../game/business/retailManager';
import { RetailStore, EmployeeRole } from '../../types/retail';

interface HireStaffModalProps {
  store: RetailStore;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

interface RoleConfig {
  role: EmployeeRole;
  name: string;
  desc: string;
  icon: any;
  baseSalary: number;
}

const ROLES: RoleConfig[] = [
  {
    role: 'cashier',
    name: 'Кассир-оператор',
    desc: 'Обслуживает покупателей на кассе, предотвращает задержки и очереди.',
    icon: DollarSign,
    baseSalary: 65,
  },
  {
    role: 'consultant',
    name: 'Продавец-консультант',
    desc: 'Консультирует посетителей в торговом зале, повышает средний чек и конверсию в покупку.',
    icon: Users,
    baseSalary: 85,
  },
  {
    role: 'merchandiser',
    name: 'Мерчандайзер / Кладовщик',
    desc: 'Организует выкладку товара на полках, следит за порядком и приемкой грузов.',
    icon: Star,
    baseSalary: 75,
  },
  {
    role: 'security',
    name: 'Сотрудник безопасности',
    desc: 'Предотвращает кражи покупателей, следит за порядком в зале.',
    icon: Shield,
    baseSalary: 90,
  },
  {
    role: 'store_manager',
    name: 'Управляющий магазином',
    desc: 'Координирует всю команду, оптимизирует рабочие процессы и повышает мораль.',
    icon: Award,
    baseSalary: 160,
  },
];

export const HireStaffModal: React.FC<HireStaffModalProps> = ({
  store,
  onClose,
  onSuccess,
}) => {
  const state = gameState.getState();
  const currency = state.settings.currency || '$';

  const [selectedRole, setSelectedRole] = useState<EmployeeRole>('cashier');
  const [skillLevel, setSkillLevel] = useState<number>(3);
  const [error, setError] = useState<string | null>(null);

  const roleObj = ROLES.find((r) => r.role === selectedRole) || ROLES[0];
  const salaryDaily = Math.round(roleObj.baseSalary * (1 + (skillLevel - 1) * 0.15));
  const recruitmentFee = salaryDaily * 5;

  const handleHire = () => {
    const res = retailManager.hireEmployee(store.id, selectedRole, skillLevel);
    if (res.success) {
      onSuccess(res.message);
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                НАЙМ ПЕРСОНАЛА В МАГАЗИН
              </h3>
              <p className="text-xs text-slate-400">
                Магазин: <span className="text-slate-200 font-semibold">{store.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 font-mono">
            Выберите должность:
          </label>
          <div className="grid grid-cols-1 gap-2">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = r.role === selectedRole;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setSelectedRole(r.role)}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    isSelected
                      ? 'bg-violet-500/20 border-violet-500/50 text-slate-100'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      isSelected ? 'bg-violet-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-bold text-slate-100">{r.name}</div>
                      <div className="text-[11px] font-mono text-violet-400">
                        от {currency}{r.baseSalary}/день
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{r.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Skill level */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Квалификация кандидата:</span>
            <span className="font-bold text-violet-400">
              Уровень {skillLevel} / 5 ({skillLevel <= 2 ? 'Стажер' : skillLevel <= 4 ? 'Специалист' : 'Мастер'})
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={skillLevel}
            onChange={(e) => setSkillLevel(parseInt(e.target.value, 10))}
            className="w-full accent-violet-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
          />
        </div>

        {/* Financial calculation */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Разовая комиссия HR-агентства:</span>
            <span className="text-slate-200 font-bold">{currency}{recruitmentFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Ежедневный оклад:</span>
            <span className="text-violet-400 font-bold">{currency}{salaryDaily}/день</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <button
          onClick={handleHire}
          disabled={recruitmentFee > state.cash}
          className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            recruitmentFee > state.cash
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-slate-950 shadow-lg shadow-violet-500/10'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Нанять сотрудника ({currency}{recruitmentFee})</span>
        </button>
      </div>
    </div>
  );
};
