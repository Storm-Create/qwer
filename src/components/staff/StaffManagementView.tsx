/**
 * Business Empire: Ultimate
 * Master Staff & Automation Management View
 */

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Zap,
  Bot,
  BarChart3,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
} from 'lucide-react';
import { GameState } from '../../types/game';
import {
  Employee,
  EmployeeType,
  AutomationLevelConfig,
  TrainingCourse,
} from '../../types/staff';
import { staffManager } from '../../game/staff/staffManager';
import { AUTOMATION_LEVELS, EMPLOYEE_ROLES } from '../../game/staff/staffCatalog';
import { EmployeeCard } from './EmployeeCard';
import { CandidateCard } from './CandidateCard';
import { AutomationLevelCard } from './AutomationLevelCard';
import { AIManagerControlPanel } from './AIManagerControlPanel';
import { StaffImpactMatrix } from './StaffImpactMatrix';
import { TrainModal } from './TrainModal';
import { AssignModal } from './AssignModal';
import { BonusModal } from './BonusModal';
import { economy } from '../../game/economy';

interface StaffManagementViewProps {
  state: GameState;
}

type SubTab = 'team' | 'recruitment' | 'automation' | 'ai_manager' | 'matrix';

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({ state }) => {
  const staffState = staffManager.getOrCreateState();
  const bonuses = staffManager.getAggregatedBonuses();

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('team');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modals state
  const [trainingEmployee, setTrainingEmployee] = useState<Employee | null>(null);
  const [assigningEmployee, setAssigningEmployee] = useState<Employee | null>(null);
  const [bonusingEmployee, setBonusingEmployee] = useState<Employee | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Handlers
  const handleHire = (candidate: Employee) => {
    const res = staffManager.hireCandidate(candidate.id);
    if (res.success) {
      showNotification(res.message, 'success');
    } else {
      showNotification(res.message, 'error');
    }
  };

  const handleFire = (employee: Employee) => {
    const res = staffManager.fireEmployee(employee.id);
    if (res.success) {
      showNotification(res.message, 'success');
    } else {
      showNotification(res.message, 'error');
    }
  };

  const handleAssign = (businessId: string | null, businessName: string, businessType: any) => {
    if (!assigningEmployee) return;
    const res = staffManager.assignEmployee(
      assigningEmployee.id,
      businessId,
      businessName,
      businessType
    );
    setAssigningEmployee(null);
    if (res.success) {
      showNotification(res.message, 'success');
    } else {
      showNotification(res.message, 'error');
    }
  };

  const handleTrainCourse = (course: TrainingCourse) => {
    if (!trainingEmployee) return;
    const res = staffManager.trainEmployee(trainingEmployee.id, course.id);
    setTrainingEmployee(null);
    if (res.success) {
      showNotification(res.message, 'success');
    } else {
      showNotification(res.message, 'error');
    }
  };

  const handlePayBonus = (amount: number) => {
    if (!bonusingEmployee) return;
    const res = staffManager.payBonus(bonusingEmployee.id, amount);
    setBonusingEmployee(null);
    if (res.success) {
      showNotification(res.message, 'success');
    } else {
      showNotification(res.message, 'error');
    }
  };

  const handleAutomationAction = (config: AutomationLevelConfig) => {
    const res = staffManager.unlockAutomationLevel(config.id);
    if (res.success) {
      showNotification(res.message, 'success');
    } else {
      showNotification(res.message, 'error');
    }
  };

  // Filtered employees
  const filteredEmployees = staffState.employees.filter((emp) => {
    if (roleFilter === 'all') return true;
    return emp.type === roleFilter;
  });

  const filteredCandidates = staffState.marketCandidates.filter((cand) => {
    if (roleFilter === 'all') return true;
    return cand.type === roleFilter;
  });

  const isAIUnlocked = staffState.unlockedAutomationLevels.includes('ai_manager') || staffState.unlockedAutomationLevels.includes('full_autonomy');

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 border transition-all animate-bounce ${
            feedback.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
              : 'bg-rose-950/90 text-rose-200 border-rose-500/50'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="tab_staff_team"
            onClick={() => setActiveSubTab('team')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'team'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Мой штат</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/60 text-indigo-300 font-mono">
              {staffState.employees.length}
            </span>
          </button>

          <button
            id="tab_staff_recruitment"
            onClick={() => setActiveSubTab('recruitment')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'recruitment'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Биржа труда / Найм</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/60 text-emerald-300 font-mono">
              {staffState.marketCandidates.length}
            </span>
          </button>

          <button
            id="tab_staff_automation"
            onClick={() => setActiveSubTab('automation')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'automation'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Автоматизация (1–7)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/60 text-amber-300 font-mono">
              {staffState.automationLevel}
            </span>
          </button>

          <button
            id="tab_staff_ai"
            onClick={() => setActiveSubTab('ai_manager')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'ai_manager'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI-Менеджер</span>
            {staffState.aiManager.enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            id="tab_staff_matrix"
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'matrix'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Влияние на бизнес</span>
          </button>
        </div>

        {/* Role Filter Dropdown */}
        {(activeSubTab === 'team' || activeSubTab === 'recruitment') && (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="select_staff_role_filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Все профессии (10 ролей)</option>
              {Object.keys(EMPLOYEE_ROLES).map((k) => (
                <option key={k} value={k}>
                  {EMPLOYEE_ROLES[k as EmployeeType].title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* SUB-VIEW 1: MY TEAM */}
      {activeSubTab === 'team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono">
                ШТАТНОЕ РАСПИСАНИЕ КОМПАНИИ
              </h3>
              <p className="text-xs text-slate-400">
                Управляйте сотрудниками, повышайте квалификацию, назначайте на объекты и выплачивайте премии
              </p>
            </div>

            <button
              onClick={() => setActiveSubTab('recruitment')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Нанять специалистов
            </button>
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <Users className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
              <div className="text-sm font-bold text-slate-300">
                Нет сотрудников по выбранному фильтру
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Откройте вкладку «Биржа труда / Найм», чтобы пополнить штат холдинга новыми профессионалами.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => (
                <EmployeeCard
                  key={emp.id}
                  employee={emp}
                  onTrain={(e) => setTrainingEmployee(e)}
                  onAssign={(e) => setAssigningEmployee(e)}
                  onBonus={(e) => setBonusingEmployee(e)}
                  onFire={handleFire}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: RECRUITMENT MARKET */}
      {activeSubTab === 'recruitment' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-mono">
              БИРЖА ТРУДА & КАНДИДАТЫ НА НАЙМ
            </h3>
            <p className="text-xs text-slate-400">
              Резюме обновляются каждые 3 игровых дня. Кандидаты обладают уникальными навыками, уровнем и зарплатными ожиданиями.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map((cand) => (
              <CandidateCard
                key={cand.id}
                candidate={cand}
                canAfford={state.cash >= cand.salary * 3}
                onHire={handleHire}
              />
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: AUTOMATION LEVELS 1-7 */}
      {activeSubTab === 'automation' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-mono">
              7 УРОВНЕЙ АВТОМАТИЗАЦИИ БИЗНЕС-ИМПЕРИИ
            </h3>
            <p className="text-xs text-slate-400">
              От ручного режима до полностью саморазвивающейся автономной корпорации. Каждый уровень требует инвестиций и квалифицированного персонала.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AUTOMATION_LEVELS.map((levelCfg) => (
              <AutomationLevelCard
                key={levelCfg.id}
                config={levelCfg}
                isUnlocked={staffState.unlockedAutomationLevels.includes(levelCfg.id)}
                isActive={staffState.automationLevel === levelCfg.id}
                employees={staffState.employees}
                canAfford={state.cash >= levelCfg.unlockCost}
                onActivateOrUnlock={handleAutomationAction}
              />
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: AI-MANAGER DASHBOARD */}
      {activeSubTab === 'ai_manager' && (
        <AIManagerControlPanel
          settings={staffState.aiManager}
          isAILevelUnlocked={isAIUnlocked}
          onUpdateSettings={(updates) => staffManager.updateAISettings(updates)}
          onUnlockAILevel={() => handleAutomationAction(AUTOMATION_LEVELS[5])}
        />
      )}

      {/* SUB-VIEW 5: STAFF IMPACT MATRIX */}
      {activeSubTab === 'matrix' && (
        <StaffImpactMatrix bonuses={bonuses} employees={staffState.employees} />
      )}

      {/* MODALS */}
      {trainingEmployee && (
        <TrainModal
          employee={trainingEmployee}
          cash={state.cash}
          onClose={() => setTrainingEmployee(null)}
          onSelectCourse={handleTrainCourse}
        />
      )}

      {assigningEmployee && (
        <AssignModal
          employee={assigningEmployee}
          gameState={state}
          onClose={() => setAssigningEmployee(null)}
          onAssign={handleAssign}
        />
      )}

      {bonusingEmployee && (
        <BonusModal
          employee={bonusingEmployee}
          cash={state.cash}
          onClose={() => setBonusingEmployee(null)}
          onPayBonus={handlePayBonus}
        />
      )}
    </div>
  );
};
