/**
 * Business Empire: Ultimate
 * Commercial Banking, Loans, Deposits & Credit Rating Subsystem
 */

import React, { useState } from 'react';
import {
  CreditCard,
  PiggyBank,
  ShieldCheck,
  Plus,
  AlertTriangle,
  HeartPulse,
  TrendingUp,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Landmark,
} from 'lucide-react';
import { GameState } from '../../types/game';
import { bankManager } from '../../game/finance/bankManager';
import { CreditScoreCard } from './CreditScoreCard';
import { LoanCard } from './LoanCard';
import { DepositCard } from './DepositCard';
import { NewLoanModal } from './NewLoanModal';
import { NewDepositModal } from './NewDepositModal';
import { CrisisRecoveryModal } from './CrisisRecoveryModal';

interface BankViewProps {
  state: GameState;
  showNotification?: (message: string) => void;
}

export const BankView: React.FC<BankViewProps> = ({
  state,
  showNotification = (msg) => console.log(msg),
}) => {
  const [activeTab, setActiveTab] = useState<'loans' | 'deposits' | 'rating'>('loans');
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);
  const [showNewDepositModal, setShowNewDepositModal] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);

  const report = bankManager.getCreditScoreReport();
  const activeLoans = bankManager.getActiveLoans();
  const activeDeposits = bankManager.getActiveDeposits();
  const currency = state.settings?.currency || '$';

  const isCashNegative = state.cash < 0 || state.bank?.crisis?.inCrisis;

  const handleRepayLoanEarly = (loanId: string) => {
    const res = bankManager.repayLoanEarly(loanId);
    showNotification(res.message);
  };

  const handleRestructureLoan = (loanId: string) => {
    const res = bankManager.restructureLoan(loanId);
    showNotification(res.message);
  };

  const handleWithdrawDeposit = (depositId: string, isEarly: boolean) => {
    const res = bankManager.withdrawDeposit(depositId, isEarly);
    showNotification(res.message);
  };

  const handleToggleAutoRenew = (depositId: string) => {
    bankManager.toggleDepositAutoRenew(depositId);
    showNotification('Настройки автопролонгации обновлены');
  };

  const handleConfirmLoan = (productId: string, amount: number) => {
    const res = bankManager.takeLoan(productId, amount);
    showNotification(res.message);
  };

  const handleConfirmDeposit = (planId: string, amount: number) => {
    const res = bankManager.openDeposit(planId, amount);
    showNotification(res.message);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Financial Crisis Alert Banner if Cash < 0 */}
      {isCashNegative && (
        <div className="p-4 rounded-3xl bg-rose-500/20 border border-rose-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-rose-500/10 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-slate-950 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-200">
                Внимание: Кассовый дефицит ({currency}{Math.floor(state.cash).toLocaleString()})
              </h4>
              <p className="text-xs text-rose-300/80">
                Запустите антикризисную стабилизацию для восстановления положительного баланса.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCrisisModal(true)}
            className="w-full sm:w-auto py-2 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <HeartPulse className="w-4 h-4" />
            <span>Антикризисный план</span>
          </button>
        </div>
      )}

      {/* Credit Score Top Audit Card */}
      <CreditScoreCard report={report} currency={currency} />

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('loans')}
            className={`flex-1 sm:flex-none py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'loans'
                ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Кредиты и Обязательства ({activeLoans.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deposits')}
            className={`flex-1 sm:flex-none py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'deposits'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span>Депозиты и Доход ({activeDeposits.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rating')}
            className={`flex-1 sm:flex-none py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'rating'
                ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Финансовый аудит</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {activeTab === 'loans' && (
            <button
              onClick={() => setShowNewLoanModal(true)}
              className="py-2 px-3.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Оформить кредит</span>
            </button>
          )}

          {activeTab === 'deposits' && (
            <button
              onClick={() => setShowNewDepositModal(true)}
              className="py-2 px-3.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Открыть депозит</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Loans */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          <div className="flex sm:hidden">
            <button
              onClick={() => setShowNewLoanModal(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Оформить новый кредит</span>
            </button>
          </div>

          {activeLoans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeLoans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  playerCash={state.cash}
                  onRepayEarly={handleRepayLoanEarly}
                  onRestructure={handleRestructureLoan}
                  currency={currency}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mx-auto flex items-center justify-center">
                <CreditCard className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-100">
                У вас нет активных кредитных обязательств
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Используйте заемный капитал для закупки оптовых партий товаров, покупки коммерческой недвижимости или модернизации фабрик.
              </p>
              <button
                onClick={() => setShowNewLoanModal(true)}
                className="py-2.5 px-5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs inline-flex items-center gap-2 transition-all shadow-lg shadow-rose-500/20"
              >
                <span>Выбрать кредитный продукт</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Deposits */}
      {activeTab === 'deposits' && (
        <div className="space-y-4">
          <div className="flex sm:hidden">
            <button
              onClick={() => setShowNewDepositModal(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Разместить новый депозит</span>
            </button>
          </div>

          {activeDeposits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeDeposits.map((dep) => (
                <DepositCard
                  key={dep.id}
                  deposit={dep}
                  onWithdraw={handleWithdrawDeposit}
                  onToggleAutoRenew={handleToggleAutoRenew}
                  currency={currency}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-teal-500/10 text-teal-400 border border-teal-500/20 mx-auto flex items-center justify-center">
                <PiggyBank className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-100">
                Нет открытых депозитов
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Размещайте свободную корпоративную ликвидность на срочных депозитах под ставку до 14.5% годовых с ежедневным начислением процентов.
              </p>
              <button
                onClick={() => setShowNewDepositModal(true)}
                className="py-2.5 px-5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20"
              >
                <span>Открыть депозитный счет</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Financial Rating and Risk Deep Audit */}
      {activeTab === 'rating' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Как повысить кредитный рейтинг до уровня AAA</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Снижайте Debt-to-Asset (D/A):</strong> Держите объем совокупного долга ниже 25% от чистых активов компании.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Поддерживайте высокий DSCR:</strong> Обеспечьте, чтобы ежедневная чистая прибыль предприятий и аренды превышала ежедневные выплаты по займам минимум в 2 раза.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Формируйте подушку ликвидности:</strong> Храните на счетах или ликвидных депозитах сумму, достаточную для покрытия 30 дней операционных расходов.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Успешная кредитная история:</strong> Каждое своевременное или досрочное погашение займа дает постоянный бонус к баллу надежности.
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-400" />
                <span>Институциональные привилегии высокого рейтинга</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70 flex justify-between items-center">
                  <span className="text-slate-400">Рейтинг A - AAA:</span>
                  <span className="font-mono text-emerald-400 font-bold">Сниженная ставка по кредитам от 5.5%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70 flex justify-between items-center">
                  <span className="text-slate-400">Синдицированные займы:</span>
                  <span className="font-mono text-emerald-400 font-bold">Лимит до {currency}5,000,000</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70 flex justify-between items-center">
                  <span className="text-slate-400">Депозитная премия:</span>
                  <span className="font-mono text-teal-300 font-bold">+1.5% к ставке вкладов</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showNewLoanModal && (
        <NewLoanModal
          report={report}
          onClose={() => setShowNewLoanModal(false)}
          onConfirmLoan={handleConfirmLoan}
          currency={currency}
        />
      )}

      {showNewDepositModal && (
        <NewDepositModal
          playerCash={state.cash}
          onClose={() => setShowNewDepositModal(false)}
          onConfirmDeposit={handleConfirmDeposit}
          currency={currency}
        />
      )}

      {showCrisisModal && (
        <CrisisRecoveryModal
          state={state}
          onClose={() => setShowCrisisModal(false)}
          showNotification={showNotification}
          currency={currency}
        />
      )}
    </div>
  );
};
