/**
 * Business Empire: Ultimate
 * Automation Level Card Component (7 Tiers)
 */

import React from 'react';
import {
  CheckCircle2,
  Lock,
  Zap,
  ArrowRight,
  ShieldAlert,
  Bot,
  Sparkles,
  Layers,
} from 'lucide-react';
import { AutomationLevelConfig, Employee } from '../../types/staff';
import { EMPLOYEE_ROLES } from '../../game/staff/staffCatalog';
import { economy } from '../../game/economy';

interface AutomationLevelCardProps {
  config: AutomationLevelConfig;
  isUnlocked: boolean;
  isActive: boolean;
  employees: Employee[];
  canAfford: boolean;
  onActivateOrUnlock: (config: AutomationLevelConfig) => void;
}

export const AutomationLevelCard: React.FC<AutomationLevelCardProps> = ({
  config,
  isUnlocked,
  isActive,
  employees,
  canAfford,
  onActivateOrUnlock,
}) => {
  // Check requirements
  let meetsStaffReq = true;
  let currentStaffCount = 0;
  let staffReqText = '';

  if (config.requiredStaffRole && config.requiredStaffCount) {
    const matchingStaff = employees.filter((e) => e.type === config.requiredStaffRole);
    currentStaffCount = matchingStaff.length;
    meetsStaffReq = currentStaffCount >= config.requiredStaffCount;
    const roleTitle = EMPLOYEE_ROLES[config.requiredStaffRole].title;
    staffReqText = `Требуется: ${config.requiredStaffCount}x «${roleTitle}» (в штате: ${currentStaffCount})`;
  }

  const isTierReadyToUnlock = !isUnlocked && meetsStaffReq && canAfford;

  return (
    <div
      id={`automation_tier_${config.id}`}
      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
        isActive
          ? 'bg-gradient-to-b from-indigo-950/40 to-slate-900/90 border-indigo-500/60 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500/30'
          : isUnlocked
          ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          : 'bg-slate-950/60 border-slate-800/60 opacity-90'
      }`}
    >
      <div>
        {/* Tier Badge & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                isActive
                  ? 'bg-indigo-500 text-white'
                  : isUnlocked
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              0{config.levelNumber}
            </span>
            <div>
              <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {config.name}
                {isActive && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    АКТИВЕН
                  </span>
                )}
              </h4>
              <p className="text-xs text-indigo-300/80 font-medium">{config.tagline}</p>
            </div>
          </div>

          <div className="text-right">
            {config.unlockCost === 0 ? (
              <span className="text-xs font-mono text-slate-400">Бесплатно</span>
            ) : isUnlocked ? (
              <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Внедрено
              </span>
            ) : (
              <div className="text-right">
                <div className="text-xs font-bold text-amber-300 font-mono">
                  {economy.formatMoney(config.unlockCost)}
                </div>
                <div className="text-[10px] text-slate-400">стоимость внедрения</div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          {config.description}
        </p>

        {/* Benefits List */}
        <div className="space-y-1.5 mb-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Возможности уровня:
          </span>
          {config.benefits.map((b, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
              <Zap className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
              <span>{b}</span>
            </div>
          ))}
        </div>

        {/* Staff Requirements */}
        {staffReqText && (
          <div
            className={`p-2.5 rounded-lg text-xs mb-4 flex items-center gap-2 border ${
              meetsStaffReq
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}
          >
            {meetsStaffReq ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{staffReqText}</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-3 border-t border-slate-800/80">
        {isActive ? (
          <div className="w-full py-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Текущий рабочий режим
          </div>
        ) : isUnlocked ? (
          <button
            id={`btn_switch_${config.id}`}
            onClick={() => onActivateOrUnlock(config)}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Включить этот режим</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            id={`btn_unlock_${config.id}`}
            onClick={() => onActivateOrUnlock(config)}
            disabled={!isTierReadyToUnlock}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isTierReadyToUnlock
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-950/50 cursor-pointer'
                : 'bg-slate-800/80 text-slate-500 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>
              Внедрить за {economy.formatMoney(config.unlockCost)}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
