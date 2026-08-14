/**
 * Business Empire: Ultimate
 * Real Estate Property Card (Owned Asset)
 */

import React from 'react';
import {
  Building2,
  TrendingUp,
  Wrench,
  DollarSign,
  ArrowUpCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { RealEstateProperty } from '../../types/realEstate';
import { REAL_ESTATE_TYPES_META } from '../../game/realEstate/realEstateCatalog';

interface PropertyCardProps {
  property: RealEstateProperty;
  onToggleRent: (id: string) => void;
  onUpgrade: (property: RealEstateProperty) => void;
  onRepair: (id: string) => void;
  onSell: (property: RealEstateProperty) => void;
  currency?: string;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onToggleRent,
  onUpgrade,
  onRepair,
  onSell,
  currency = '$',
}) => {
  const meta = REAL_ESTATE_TYPES_META[property.type];
  const effectiveOccupancyRate = (property.occupancy / 100) * (property.condition / 100);
  const currentDailyRent = property.isRented
    ? Math.round(property.rent * effectiveOccupancyRate)
    : 0;
  const netDaily = currentDailyRent - property.maintenance;

  const gain = property.marketValue - property.purchasePrice;
  const gainPercent = property.purchasePrice > 0 ? (gain / property.purchasePrice) * 100 : 0;

  const conditionColor =
    property.condition > 80
      ? 'bg-emerald-500'
      : property.condition > 50
      ? 'bg-amber-500'
      : 'bg-rose-500';

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700/80 transition-all">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xl">
              {property.imageEmoji || meta.iconEmoji}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-slate-100">{property.name}</h4>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono">
                  Lvl {property.level}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{property.location}</span>
              </div>
            </div>
          </div>

          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${meta.badgeBg}`}>
            {meta.title}
          </span>
        </div>

        {/* Valuation & Capital Gains */}
        <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-400">Рыночная стоимость:</span>
            <div className="text-right">
              <span className="font-mono text-base font-bold text-slate-100">
                {currency}{property.marketValue.toLocaleString()}
              </span>
              <div className="text-[10px] font-mono">
                {gain >= 0 ? (
                  <span className="text-emerald-400">
                    +{currency}{gain.toLocaleString()} (+{gainPercent.toFixed(1)}%)
                  </span>
                ) : (
                  <span className="text-rose-400">
                    -{currency}{Math.abs(gain).toLocaleString()} ({gainPercent.toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Доход от аренды:</span>
            <span className={`font-mono font-bold ${property.isRented ? 'text-emerald-400' : 'text-slate-500'}`}>
              {property.isRented
                ? `+${currency}${currentDailyRent.toLocaleString()}/день`
                : 'Не сдается'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Обслуживание:</span>
            <span className="font-mono text-rose-400">-{currency}{property.maintenance}/день</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
            <span>Чистый баланс:</span>
            <span className={`font-mono ${netDaily >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400'}`}>
              {netDaily >= 0 ? '+' : ''}{currency}{netDaily.toLocaleString()}/день
            </span>
          </div>
        </div>

        {/* Occupancy and Technical Condition */}
        <div className="mt-3 space-y-2">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Заполняемость арендаторами:</span>
              <span className="font-mono text-slate-200 font-bold">{property.occupancy}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${property.occupancy}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">Техническое состояние:</span>
              <span className="font-mono text-slate-200 font-bold">{Math.round(property.condition)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full ${conditionColor} rounded-full transition-all`}
                style={{ width: `${property.condition}%` }}
              />
            </div>
          </div>
        </div>

        {/* Perks */}
        {property.perks && property.perks.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {property.perks.slice(0, 3).map((perk, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700/60"
              >
                {perk}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2">
        <button
          onClick={() => onToggleRent(property.id)}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
            property.isRented
              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          {property.isRented ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
          <span>{property.isRented ? 'Сдается' : 'Сдать'}</span>
        </button>

        <button
          onClick={() => onUpgrade(property)}
          disabled={property.level >= 5}
          className="py-2 px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowUpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>{property.level >= 5 ? 'Макс. ур.' : 'Улучшить'}</span>
        </button>

        {property.condition < 95 && (
          <button
            onClick={() => onRepair(property.id)}
            className="py-2 px-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Wrench className="w-3.5 h-3.5 text-blue-400" />
            <span>Ремонт</span>
          </button>
        )}

        <button
          onClick={() => onSell(property)}
          className="py-2 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
        >
          <span>Продать</span>
        </button>
      </div>
    </div>
  );
};
