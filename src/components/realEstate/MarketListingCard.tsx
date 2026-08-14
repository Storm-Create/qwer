/**
 * Business Empire: Ultimate
 * Real Estate Catalog Listing Card (For Purchase)
 */

import React from 'react';
import { ShoppingCart, MapPin, TrendingUp, DollarSign, Sparkles } from 'lucide-react';
import { RealEstateCatalogItem } from '../../types/realEstate';
import { REAL_ESTATE_TYPES_META } from '../../game/realEstate/realEstateCatalog';

interface MarketListingCardProps {
  item: RealEstateCatalogItem & { currentPrice: number; currentRentDaily: number; currentMaintDaily: number };
  playerCash: number;
  onBuy: (id: string) => void;
  currency?: string;
}

export const MarketListingCard: React.FC<MarketListingCardProps> = ({
  item,
  playerCash,
  onBuy,
  currency = '$',
}) => {
  const meta = REAL_ESTATE_TYPES_META[item.type];
  const canAfford = playerCash >= item.currentPrice;

  // Annualized estimated gross yield
  const annualGrossRent = item.currentRentDaily * 360 * (item.baseOccupancy / 100);
  const annualYieldPercent = item.currentPrice > 0 ? (annualGrossRent / item.currentPrice) * 100 : 0;
  const netDaily = Math.round(item.currentRentDaily * (item.baseOccupancy / 100)) - item.currentMaintDaily;

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xl">
              {item.imageEmoji || meta.iconEmoji}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">{item.name}</h4>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>{item.location}</span>
              </div>
            </div>
          </div>

          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${meta.badgeBg}`}>
            {meta.title}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 my-2.5 line-clamp-2">{item.description}</p>

        {/* Pricing and Yield Metrics */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-400">Стоимость объекта:</span>
            <span className="font-mono text-base font-bold text-slate-100">
              {currency}{item.currentPrice.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Прогноз аренды:</span>
            <span className="font-mono text-emerald-400 font-bold">
              +{currency}{item.currentRentDaily.toLocaleString()}/день
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Обслуживание:</span>
            <span className="font-mono text-rose-400">-{currency}{item.currentMaintDaily}/день</span>
          </div>

          <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Доходность инвестиций:</span>
            <span className="font-mono font-bold text-teal-400">~{annualYieldPercent.toFixed(1)}% годовых</span>
          </div>
        </div>

        {/* Perks */}
        {item.perks && item.perks.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {item.perks.map((perk, idx) => (
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

      {/* Buy Button */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <button
          onClick={() => onBuy(item.id)}
          disabled={!canAfford}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            canAfford
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>
            {canAfford
              ? `Приобрести за ${currency}${item.currentPrice.toLocaleString()}`
              : `Недостаточно средств (${currency}${item.currentPrice.toLocaleString()})`}
          </span>
        </button>
      </div>
    </div>
  );
};
