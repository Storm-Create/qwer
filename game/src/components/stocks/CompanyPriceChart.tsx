/**
 * Business Empire: Ultimate
 * High-Precision Interactive Stock Price Chart
 */

import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CompanyPriceChartProps {
  ticker: string;
  name: string;
  currentPrice: number;
  previousPrice: number;
  priceHistory: number[];
  currency?: string;
  change24h: number;
  change24hPercent: number;
  dayLow: number;
  dayHigh: number;
  week52Low: number;
  week52High: number;
}

type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

export const CompanyPriceChart: React.FC<CompanyPriceChartProps> = ({
  ticker,
  name,
  currentPrice,
  priceHistory,
  currency = '$',
  change24h,
  change24hPercent,
  dayLow,
  dayHigh,
  week52Low,
  week52High,
}) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1M');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Slice history based on timeframe
  const pointsCount =
    timeFrame === '1D' ? 7 :
    timeFrame === '1W' ? 14 :
    timeFrame === '1M' ? 30 :
    priceHistory.length;

  const activeHistory = priceHistory.slice(Math.max(0, priceHistory.length - pointsCount));
  const minPrice = Math.min(...activeHistory) * 0.985;
  const maxPrice = Math.max(...activeHistory) * 1.015;
  const range = maxPrice - minPrice || 1;

  const isPositive = change24h >= 0;
  const strokeColor = isPositive ? '#10b981' : '#f43f5e';
  const fillColor = isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)';

  const svgWidth = 700;
  const svgHeight = 240;
  const paddingX = 20;
  const paddingY = 25;

  const graphWidth = svgWidth - paddingX * 2;
  const graphHeight = svgHeight - paddingY * 2;

  // Build SVG path
  const coordinates = activeHistory.map((p, idx) => {
    const x = paddingX + (idx / (activeHistory.length - 1 || 1)) * graphWidth;
    const y = paddingY + graphHeight - ((p - minPrice) / range) * graphHeight;
    return { x, y, price: p };
  });

  const pathD = coordinates.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${coordinates[coordinates.length - 1]?.x || 0} ${svgHeight - paddingY} L ${coordinates[0]?.x || 0} ${svgHeight - paddingY} Z`;

  const hoveredPoint = hoverIndex !== null && coordinates[hoverIndex] ? coordinates[hoverIndex] : null;
  const displayPrice = hoveredPoint ? hoveredPoint.price : currentPrice;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
      {/* Header with price & timeframe */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {ticker}
            </span>
            <h3 className="text-base font-bold text-slate-100">{name}</h3>
          </div>
          <div className="flex items-baseline gap-3 mt-1.5">
            <div className="font-mono text-2xl font-black text-slate-100 tracking-tight">
              {currency}{displayPrice.toFixed(2)}
            </div>
            <div
              className={`flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isPositive ? '+' : ''}
              {change24h.toFixed(2)} ({change24hPercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              id={`btn-timeframe-${tf.toLowerCase()}`}
              onClick={() => setTimeFrame(tf)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                timeFrame === tf
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full h-[220px] bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden my-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full cursor-crosshair"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;
            let closestIdx = 0;
            let minDiff = Infinity;
            coordinates.forEach((pt, idx) => {
              const diff = Math.abs(pt.x - mouseX);
              if (diff < minDiff) {
                minDiff = diff;
                closestIdx = idx;
              }
            });
            setHoverIndex(closestIdx);
          }}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.25" />
              <stop offset="100%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1={paddingX} y1={paddingY + graphHeight / 2} x2={svgWidth - paddingX} y2={paddingY + graphHeight / 2} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#1e293b" strokeDasharray="3 3" />

          {/* Area under curve */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Price curve */}
          <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Hover Crosshair */}
          {hoveredPoint && (
            <g>
              <line
                x1={hoveredPoint.x}
                y1={paddingY}
                x2={hoveredPoint.x}
                y2={svgHeight - paddingY}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="5"
                fill="#ffffff"
                stroke={strokeColor}
                strokeWidth="2.5"
              />
            </g>
          )}
        </svg>

        {/* Min / Max Labels */}
        <div className="absolute top-2 right-3 font-mono text-[10px] text-slate-500">
          Max: {currency}{maxPrice.toFixed(2)}
        </div>
        <div className="absolute bottom-2 right-3 font-mono text-[10px] text-slate-500">
          Min: {currency}{minPrice.toFixed(2)}
        </div>
      </div>

      {/* 24h & 52-week statistics bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-xs">
        <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">Дневной минимум</span>
          <span className="font-mono font-bold text-slate-200">{currency}{dayLow.toFixed(2)}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">Дневной максимум</span>
          <span className="font-mono font-bold text-slate-200">{currency}{dayHigh.toFixed(2)}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">52-нед. минимум</span>
          <span className="font-mono font-bold text-slate-300">{currency}{week52Low.toFixed(2)}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
          <span className="text-[10px] text-slate-500 block uppercase font-mono">52-нед. максимум</span>
          <span className="font-mono font-bold text-slate-300">{currency}{week52High.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
