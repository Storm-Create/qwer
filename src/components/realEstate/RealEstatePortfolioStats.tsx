/**
 * Business Empire: Ultimate
 * Real Estate Portfolio Stats Header
 */

import React from 'react';
import { Building2, TrendingUp, DollarSign, Users, Wrench, ArrowUpRight } from 'lucide-react';
import { RealEstateProperty, RealEstateMarketState } from '../../types/realEstate';

interface RealEstatePortfolioStatsProps {
  properties: RealEstateProperty[];
  market: RealEstateMarketState;
  currency?: string;
}

export const RealEstatePortfolioStats: React.FC<RealEstatePortfolioStatsProps> = ({
  properties,
  market,
  currency = '$',
}) => {
  const count = properties.length;
  const totalValuation = properties.reduce((acc, p) => acc + p.marketValue, 0);
  const totalInvested = properties.reduce((acc, p) => acc + p.purchasePrice, 0);
  const totalDailyRent = properties.reduce(
    (acc, p) => (p.isRented ? acc + Math.round(p.rent * (p.occupancy / 100) * (p.condition / 100)) : acc),
    0
  );
  const totalDailyMaint = properties.reduce((acc, p) => acc + p.maintenance, 0);
  const netDailyIncome = totalDailyRent - totalDailyMaint;
  const avgOccupancy = count > 0 ? Math.round(properties.reduce((acc, p) => acc + p.occupancy, 0) / count) : 0;
  const capitalGain = totalValuation - totalInvested;
  const capitalGainPercent = totalInvested > 0 ? (capitalGain / totalInvested) * 100 : 0;

  const trendColor =
    market.trend === 'booming' || market.trend === 'growing'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      : market.trend === 'stable'
      ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
      : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

  const trendLabel =
    market.trend === 'booming'
      ? 'Бум на рынке (+8.5%/год)'
      : market.trend === 'growing'
      ? 'Умеренный рост (+6.2%/год)'
      : market.trend === 'stable'
      ? 'Стабильный рынок'
      : 'Остывание цен (-3.1%/год)';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Стоимость портфеля</span>
          <Building2 className="w-4 h-4 text-teal-400" />
        </div>
        <div className="font-mono text-xl font-bold text-slate-100">
          {currency}{totalValuation.toLocaleString()}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px]">
          <span className="text-slate-500">{count} объектов</span>
          {capitalGain !== 0 && (
            <span
              className={`font-mono font-medium ${
                capitalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              ({capitalGain >= 0 ? '+' : ''}{capitalGainPercent.toFixed(1)}%)
            </span>
          )}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Чистый доход от аренды</span>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="font-mono text-xl font-bold text-emerald-400">
          {netDailyIncome >= 0 ? '+' : ''}{currency}{netDailyIncome.toLocaleString()}/день
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>В месяц: ~{currency}{(netDailyIncome * 30).toLocaleString()}</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Средняя заполняемость</span>
          <Users className="w-4 h-4 text-blue-400" />
        </div>
        <div className="font-mono text-xl font-bold text-slate-100">
          {avgOccupancy}%
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>Эксплуатация: {currency}{totalDailyMaint.toLocaleString()}/день</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Индекс рынка жилья</span>
          <TrendingUp className="w-4 h-4 text-amber-400" />
        </div>
        <div className="font-mono text-xl font-bold text-slate-100">
          {market.marketIndex.toFixed(1)} <span className="text-xs text-slate-500 font-sans font-normal">pts</span>
        </div>
        <div className="mt-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-medium ${trendColor}`}>
            {trendLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
