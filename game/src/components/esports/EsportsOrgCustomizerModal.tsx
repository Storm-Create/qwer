/**
 * Business Empire: Ultimate
 * Esports Empire — Organization Customization Modal
 */

import React, { useState } from 'react';
import { X, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { esportsManager } from '../../game/esports/esportsManager';

interface CustomizerModalProps {
  currentName: string;
  currentTag: string;
  currentLogo: string;
  currentColor: string;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

const LOGO_EMOJIS = ['⚡', '👑', '🐉', '🐺', '🦅', '🔥', '🛡️', '⚔️', '🎯', '🚀', '💎', '🦁', '💀', '🤖', '🌟'];
const THEME_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#6366f1'];

export const EsportsOrgCustomizerModal: React.FC<CustomizerModalProps> = ({
  currentName,
  currentTag,
  currentLogo,
  currentColor,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState(currentName);
  const [tag, setTag] = useState(currentTag);
  const [logo, setLogo] = useState(currentLogo);
  const [color, setColor] = useState(currentColor);

  const handleSave = () => {
    if (!name.trim()) return;
    esportsManager.renameOrganization(name, tag, logo, color);
    onSuccess('Брендинг организации успешно сохранен!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Брендинг организации</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/20"
            style={{ backgroundColor: `${color}30`, borderColor: color }}
          >
            {logo}
          </div>
          <div>
            <div className="text-xs uppercase font-black tracking-wider text-slate-400">Превью тега: [{tag || 'TAG'}]</div>
            <h4 className="text-lg font-black text-white">{name || 'Название организации'}</h4>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Название организации</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none"
              placeholder="NEON ESPORTS"
              maxLength={26}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Командный тег (2-6 символов)</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 focus:outline-none uppercase"
              placeholder="NEON"
              maxLength={6}
            />
          </div>

          {/* Logo Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Эмблема организации</label>
            <div className="grid grid-cols-5 gap-2">
              {LOGO_EMOJIS.map((item) => (
                <button
                  key={item}
                  onClick={() => setLogo(item)}
                  className={`p-2 rounded-xl text-xl transition border ${
                    logo === item ? 'bg-cyan-500/20 border-cyan-400 scale-105' : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Фирменный цвет</label>
            <div className="grid grid-cols-8 gap-2">
              {THEME_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full border-2 transition flex items-center justify-center"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? '#ffffff' : 'transparent',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  {color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20"
          >
            Сохранить брендинг
          </button>
        </div>

      </div>
    </div>
  );
};
