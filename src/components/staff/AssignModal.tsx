/**
 * Business Empire: Ultimate
 * Department Assignment Modal Component
 */

import React from 'react';
import { X, Briefcase, Store, Factory, Building2, Wrench, Boxes, ShieldCheck, Check } from 'lucide-react';
import { Employee } from '../../types/staff';
import { EMPLOYEE_ROLES } from '../../game/staff/staffCatalog';
import { GameState } from '../../types/game';

interface AssignModalProps {
  employee: Employee;
  gameState: GameState;
  onClose: () => void;
  onAssign: (businessId: string | null, businessName: string, businessType: any) => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  employee,
  gameState,
  onClose,
  onAssign,
}) => {
  const role = EMPLOYEE_ROLES[employee.type];

  // Compile all possible assignable targets
  const targets: Array<{
    id: string | null;
    name: string;
    type: 'retail' | 'factory' | 'car_service' | 'warehouse' | 'trading' | 'headquarters' | 'general';
    categoryTitle: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: null,
      name: 'Общий резерв (Центральный офис)',
      type: 'headquarters',
      categoryTitle: 'Штаб-квартира',
      icon: ShieldCheck,
    },
  ];

  // Warehouses
  for (const wh of gameState.warehouses || []) {
    targets.push({
      id: wh.id,
      name: wh.name,
      type: 'warehouse',
      categoryTitle: 'Складская база',
      icon: Boxes,
    });
  }

  // Retail Stores
  for (const store of gameState.retailStores || []) {
    targets.push({
      id: store.id,
      name: store.name,
      type: 'retail',
      categoryTitle: 'Розничный магазин',
      icon: Store,
    });
  }

  // Factories
  for (const fact of gameState.industrial?.factories || []) {
    targets.push({
      id: fact.id,
      name: fact.name,
      type: 'factory',
      categoryTitle: 'Промышленный завод',
      icon: Factory,
    });
  }

  // Auto service workshops
  if (gameState.automotive?.workshop) {
    targets.push({
      id: gameState.automotive.workshop.id,
      name: gameState.automotive.workshop.name,
      type: 'car_service',
      categoryTitle: 'Автомастерская СТО',
      icon: Wrench,
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono">
                НАЗНАЧЕНИЕ НА ОБЪЕКТ
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

        <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
            Рекомендуемый сектор:
          </span>
          {role.recommendedDepartment}
        </div>

        {/* Target List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {targets.map((t, idx) => {
            const isCurrent = employee.assignedBusinessId === t.id;
            const Icon = t.icon;

            return (
              <div
                key={idx}
                onClick={() => onAssign(t.id, t.name, t.type)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-100">{t.name}</h5>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {t.categoryTitle}
                    </span>
                  </div>
                </div>

                <div>
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-mono">
                      <Check className="w-3.5 h-3.5" /> Назначен
                    </span>
                  ) : (
                    <button className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700">
                      Назначить
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
