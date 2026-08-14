/**
 * Business Empire: Ultimate
 * Financial Crisis & Anti-Bankruptcy Recovery Modal
 */

import React from 'react';
import { AlertTriangle, ShieldAlert, HeartPulse, RefreshCw, DollarSign, Building2, X } from 'lucide-react';
import { GameState } from '../../types/game';
import { bankManager } from '../../game/finance/bankManager';
import { realEstateManager } from '../../game/realEstate/realEstateManager';

interface CrisisRecoveryModalProps {
  state: GameState;
  onClose: () => void;
  showNotification?: (message: string) => void;
  currency?: string;
}

export const CrisisRecoveryModal: React.FC<CrisisRecoveryModalProps> = ({
  state,
  onClose,
  showNotification = (msg) => console.log(msg),
  currency = '$',
}) => {
  const deficit = Math.abs(Math.min(0, state.cash));
  const graceDays = state.bank?.crisis?.graceDaysRemaining || 5;
  const properties = realEstateManager.getProperties();

  const handleBailout = () => {
    const res = bankManager.applyEmergencyBailout();
    showNotification(res.message);
    onClose();
  };

  const handleRestructureAll = () => {
    const loans = bankManager.getActiveLoans();
    let count = 0;
    for (const l of loans) {
      bankManager.restructureLoan(l.id);
      count++;
    }
    showNotification(`Реструктурировано ${count} активных кредитов. Ежедневные выплаты снижены в 2 раза.`);
    onClose();
  };

  const handleQuickSaleProperty = () => {
    if (properties.length === 0) {
      showNotification('У вас нет объектов недвижимости для быстрой продажи.');
      return;
    }
    const prop = properties[0];
    const res = realEstateManager.sellProperty(prop.id);
    showNotification(`Быстрая продажа: ${res.message}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-rose-500/50 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-300 font-mono">
                ФИНАНСОВЫЙ КРИЗИС & КАССРАЗРЫВ
              </h3>
              <p className="text-xs text-slate-400">
                Кассовый дефицит: <span className="font-mono text-rose-400 font-bold">-{currency}{deficit.toLocaleString()}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between text-rose-300 font-bold">
            <span>Период финансового оздоровления:</span>
            <span className="font-mono text-amber-300">{graceDays} из 5 дней</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Баланс компании ушел в минус из-за операционных издержек или платежей по займам. Выберите антикризисный инструмент для выхода в положительную зону ликвидности:
          </p>
        </div>

        {/* 3 Interactive Recovery Options */}
        <div className="space-y-2.5">
          {/* Option 1: Emergency Bailout */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-all">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                <span>Стабилизационный транш банка</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Мгновенно покрывает дефицит + дает {currency}15,000 запаса под льготные 12% на 90 дней.
              </p>
            </div>
            <button
              onClick={handleBailout}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs whitespace-nowrap transition-all shadow-md shadow-emerald-500/20"
            >
              Получить транш
            </button>
          </div>

          {/* Option 2: Restructure all loans */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-all">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>Реструктуризация всех долгов</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Увеличивает сроки действующих кредитов в 2 раза и снижает ежедневный отток денег на 50%.
              </p>
            </div>
            <button
              onClick={handleRestructureAll}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap transition-all"
            >
              Реструктурировать
            </button>
          </div>

          {/* Option 3: Quick Sell Property */}
          {properties.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-all">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>Срочный выкуп объекта «{properties[0].name}»</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Мгновенная продажа объекта банку с зачислением {currency}{properties[0].marketValue.toLocaleString()} на баланс.
                </p>
              </div>
              <button
                onClick={handleQuickSaleProperty}
                className="px-3.5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs whitespace-nowrap transition-all"
              >
                Продать объект
              </button>
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            Закрыть окно
          </button>
        </div>
      </div>
    </div>
  );
};
