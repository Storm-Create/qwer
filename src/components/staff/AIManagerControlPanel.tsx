/**
 * Business Empire: Ultimate
 * AI-Manager Strategy & Autonomous Control Panel
 */

import React from 'react';
import {
  Bot,
  Zap,
  Flame,
  Shield,
  Scale,
  CheckSquare,
  Square,
  Sliders,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { AIManagerSettings, AIStrategy } from '../../types/staff';
import { economy } from '../../game/economy';

interface AIManagerControlPanelProps {
  settings: AIManagerSettings;
  isAILevelUnlocked: boolean;
  onUpdateSettings: (updates: Partial<AIManagerSettings>) => void;
  onUnlockAILevel: () => void;
}

export const AIManagerControlPanel: React.FC<AIManagerControlPanelProps> = ({
  settings,
  isAILevelUnlocked,
  onUpdateSettings,
  onUnlockAILevel,
}) => {
  const toggleModule = (moduleKey: keyof AIManagerSettings['modules']) => {
    onUpdateSettings({
      modules: {
        ...settings.modules,
        [moduleKey]: !settings.modules[moduleKey],
      },
    });
  };

  const setStrategy = (strategy: AIStrategy) => {
    onUpdateSettings({ strategy });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-inner">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-100 font-mono">
                НЕЙРОСЕТЕВОЙ AI-МЕНЕДЖЕР
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                  settings.enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {settings.enabled ? 'АКТИВЕН / ОНЛАЙН' : 'ОТКЛЮЧЕН'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Автономный искусственный интеллект для оперативного управления цепочками поставок, ценообразованием, оптовыми продажами и денежными потоками.
            </p>
          </div>
        </div>

        {/* Activation Button */}
        <div>
          {!isAILevelUnlocked ? (
            <button
              id="btn_unlock_ai_from_panel"
              onClick={onUnlockAILevel}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/40 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Разблокировать AI-Менеджер
            </button>
          ) : (
            <button
              id="btn_toggle_ai_manager"
              onClick={() => onUpdateSettings({ enabled: !settings.enabled })}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                settings.enabled
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40'
              }`}
            >
              <Bot className="w-4 h-4" />
              {settings.enabled ? 'Приостановить AI' : 'Запустить AI-Менеджер'}
            </button>
          )}
        </div>
      </div>

      {/* 3 Strategy Selectors */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-100 font-mono">
              СТРАТЕГИЯ ПОВЕДЕНИЯ AI
            </h4>
            <p className="text-xs text-slate-400">
              Определяет риск-профиль, пороги наценок, страховые запасы и управление ликвидностью
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Aggressive */}
          <div
            id="strategy_card_aggressive"
            onClick={() => setStrategy('aggressive')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              settings.strategy === 'aggressive'
                ? 'bg-rose-950/30 border-rose-500/60 ring-1 ring-rose-500/40 shadow-lg shadow-rose-950/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-400" />
                <span className="text-sm font-bold text-slate-100">Агрессивная</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Макс. маржа
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Высокие наценки (+55%), загрузка мощностей на 100%, агрессивное реинвестирование свободных денег при минимальном резерве кэша (10%).
            </p>
            <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
              <div className="flex justify-between">
                <span>Резерв кэша:</span>
                <span className="text-rose-300 font-bold">10%</span>
              </div>
              <div className="flex justify-between">
                <span>Целевая наценка:</span>
                <span className="text-rose-300 font-bold">+55%</span>
              </div>
              <div className="flex justify-between">
                <span>Буфер запасов:</span>
                <span className="text-rose-300 font-bold">1 день</span>
              </div>
            </div>
          </div>

          {/* 2. Balanced */}
          <div
            id="strategy_card_balanced"
            onClick={() => setStrategy('balanced')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              settings.strategy === 'balanced'
                ? 'bg-indigo-950/30 border-indigo-500/60 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-950/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-bold text-slate-100">Сбалансированная</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Оптимально
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Разумный баланс скорости роста и безопасности: наценки +35%, поддержание 30% ликвидности, 3-дневный страховой запас.
            </p>
            <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
              <div className="flex justify-between">
                <span>Резерв кэша:</span>
                <span className="text-indigo-300 font-bold">30%</span>
              </div>
              <div className="flex justify-between">
                <span>Целевая наценка:</span>
                <span className="text-indigo-300 font-bold">+35%</span>
              </div>
              <div className="flex justify-between">
                <span>Буфер запасов:</span>
                <span className="text-indigo-300 font-bold">3 дня</span>
              </div>
            </div>
          </div>

          {/* 3. Conservative */}
          <div
            id="strategy_card_conservative"
            onClick={() => setStrategy('conservative')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              settings.strategy === 'conservative'
                ? 'bg-teal-950/30 border-teal-500/60 ring-1 ring-teal-500/40 shadow-lg shadow-teal-950/30'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-400" />
                <span className="text-sm font-bold text-slate-100">Консервативная</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Низкий риск
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Надежная защита от кризисов: удержание 60% кэша, 7-дневный резерв на складах, умеренная наценка (+15%) для высокой оборачиваемости.
            </p>
            <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
              <div className="flex justify-between">
                <span>Резерв кэша:</span>
                <span className="text-teal-300 font-bold">60%</span>
              </div>
              <div className="flex justify-between">
                <span>Целевая наценка:</span>
                <span className="text-teal-300 font-bold">+15%</span>
              </div>
              <div className="flex justify-between">
                <span>Буфер запасов:</span>
                <span className="text-teal-300 font-bold">7 дней</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Autonomous Modules Toggles */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h4 className="text-sm font-bold text-slate-100 font-mono mb-1">
          МОДУЛИ ДЕЛЕГИРОВАНИЯ AI
        </h4>
        <p className="text-xs text-slate-400 mb-4">
          Включайте и отключайте конкретные полномочия искусственного интеллекта
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Module: Auto Order */}
          <button
            id="mod_auto_order"
            onClick={() => toggleModule('autoOrderGoods')}
            className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-colors ${
              settings.modules.autoOrderGoods
                ? 'bg-slate-800/90 border-indigo-500/40 text-slate-100'
                : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}
          >
            {settings.modules.autoOrderGoods ? (
              <CheckSquare className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold">Заказывать товары</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Автопополнение полок магазинов и заводских складов при дефиците.
              </div>
            </div>
          </button>

          {/* Module: Auto Sell */}
          <button
            id="mod_auto_sell"
            onClick={() => toggleModule('autoSellGoods')}
            className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-colors ${
              settings.modules.autoSellGoods
                ? 'bg-slate-800/90 border-indigo-500/40 text-slate-100'
                : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}
          >
            {settings.modules.autoSellGoods ? (
              <CheckSquare className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold">Продавать товары</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Реализация излишков готовой продукции на оптовой бирже по лучшим ценам.
              </div>
            </div>
          </button>

          {/* Module: Manage Inventory */}
          <button
            id="mod_manage_inv"
            onClick={() => toggleModule('manageInventory')}
            className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-colors ${
              settings.modules.manageInventory
                ? 'bg-slate-800/90 border-indigo-500/40 text-slate-100'
                : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}
          >
            {settings.modules.manageInventory ? (
              <CheckSquare className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold">Управлять запасами</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Динамический расчет складского буфера и защита от затоваривания.
              </div>
            </div>
          </button>

          {/* Module: Manage Pricing */}
          <button
            id="mod_manage_pricing"
            onClick={() => toggleModule('managePricing')}
            className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-colors ${
              settings.modules.managePricing
                ? 'bg-slate-800/90 border-indigo-500/40 text-slate-100'
                : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}
          >
            {settings.modules.managePricing ? (
              <CheckSquare className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold">Управлять ценами</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Автоматическая корректировка наценок в магазинах по уровню спроса.
              </div>
            </div>
          </button>

          {/* Module: Reallocate Cash */}
          <button
            id="mod_reallocate_cash"
            onClick={() => toggleModule('reallocateCash')}
            className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-colors ${
              settings.modules.reallocateCash
                ? 'bg-slate-800/90 border-indigo-500/40 text-slate-100'
                : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}
          >
            {settings.modules.reallocateCash ? (
              <CheckSquare className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold">Перераспределять деньги</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Автопогашение дорогих кредитов и направление кэша в доходные активы.
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* AI Live Actions Log */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-slate-100 font-mono">
              ЖУРНАЛ АВТОНОМНЫХ РЕШЕНИЙ AI
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {settings.actionLogs.length} событий
          </span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {settings.actionLogs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 flex items-start justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 uppercase ${
                    log.type === 'order'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : log.type === 'sell'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : log.type === 'price'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {log.type}
                </span>
                <span className="text-slate-300 leading-relaxed">{log.message}</span>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[10px] text-slate-500 font-mono">
                  День {log.gameDay}
                </div>
                {log.amount !== undefined && (
                  <div className="text-[11px] font-bold font-mono text-slate-200">
                    {economy.formatMoney(log.amount)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
