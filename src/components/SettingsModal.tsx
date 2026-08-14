/**
 * Business Empire: Ultimate
 * Settings, Save/Load & Data Management Modal
 */

import React, { useState } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
  Check,
  FileJson,
  Sliders,
  DollarSign,
} from 'lucide-react';
import { GameSettings, GameState } from '../types/game';
import { gameState } from '../game/gameState';
import { saveSystem } from '../game/saveSystem';

interface SettingsModalProps {
  state: GameState;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ state, onClose }) => {
  const [jsonText, setJsonText] = useState('');
  const [showJsonArea, setShowJsonArea] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const { settings } = state;

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    gameState.update((draft) => {
      draft.settings[key] = value;
    });
  };

  const handleSave = () => {
    const res = saveSystem.saveGame();
    setMessage({ text: res.message, type: res.success ? 'success' : 'error' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLoad = () => {
    const res = saveSystem.loadGame();
    setMessage({ text: res.message, type: res.success ? 'success' : 'error' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportJson = () => {
    const json = saveSystem.exportStateToJson();
    setJsonText(json);
    setShowJsonArea(true);
    setMessage({ text: 'Код сохранения сформирован ниже', type: 'success' });
  };

  const handleImportJson = () => {
    if (!jsonText.trim()) {
      setMessage({ text: 'Вставьте JSON-код сохранения в поле ниже', type: 'error' });
      return;
    }
    const res = saveSystem.importStateFromJson(jsonText);
    setMessage({ text: res.message, type: res.success ? 'success' : 'error' });
    if (res.success) {
      setTimeout(() => onClose(), 1500);
    }
  };

  const handleResetGame = () => {
    saveSystem.resetGame();
    setShowResetConfirm(false);
    setMessage({ text: 'Игровой процесс сброшен к начальному состоянию', type: 'success' });
    setTimeout(() => onClose(), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-200">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono">
                НАСТРОЙКИ & СОХРАНЕНИЯ
              </h3>
              <p className="text-xs text-slate-400">
                Управление игровым процессом, профилем и резервными копиями
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-2xl flex items-center gap-2 text-xs font-semibold ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Preferences Toggles */}
        <div className="space-y-4 mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Отображение и удобство
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-all">
              <span className="text-xs text-slate-300 font-medium">Компактные числа (1.5M)</span>
              <input
                type="checkbox"
                checked={settings.compactNumbers}
                onChange={(e) => updateSetting('compactNumbers', e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-all">
              <span className="text-xs text-slate-300 font-medium">Звуковые эффекты</span>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Save/Load Quick Controls */}
        <div className="space-y-3 mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Хранилище данных (localStorage)
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSave}
              className="py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Сохранить в браузер</span>
            </button>

            <button
              onClick={handleLoad}
              className="py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Загрузить сохранение</span>
            </button>
          </div>
        </div>

        {/* JSON Backup & Transfer */}
        <div className="space-y-3 mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Резервное копирование (JSON)
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExportJson}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Экспорт JSON</span>
            </button>

            <button
              onClick={() => setShowJsonArea(!showJsonArea)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <FileJson className="w-3.5 h-3.5 text-slate-400" />
              <span>{showJsonArea ? 'Скрыть поле' : 'Импорт JSON'}</span>
            </button>
          </div>

          {showJsonArea && (
            <div className="mt-3 space-y-2">
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Вставьте сюда JSON-код сохранения..."
                rows={4}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 focus:outline-none focus:border-emerald-500/50 resize-none"
              />
              <button
                onClick={handleImportJson}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Применить импортированное сохранение</span>
              </button>
            </div>
          )}
        </div>

        {/* Danger Zone: Reset Game */}
        <div className="pt-4 border-t border-slate-800">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Сбросить весь прогресс (Начать заново)</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-center space-y-3">
              <div className="text-xs font-bold text-rose-300">
                Вы уверены? Все текущие финансы, бизнесы и активы будут безвозвратно удалены!
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleResetGame}
                  className="py-1.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all"
                >
                  Да, удалить всё
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
