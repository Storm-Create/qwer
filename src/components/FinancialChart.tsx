/**
 * Business Empire: Ultimate
 * High-Precision Responsive Canvas Financial Chart
 */

import React, { useEffect, useRef, useState } from 'react';
import { FinancialSnapshot } from '../types/game';

export type ChartMetric = 'netWorth' | 'cash' | 'dailyRevenue' | 'dailyProfit';

interface FinancialChartProps {
  data: FinancialSnapshot[];
  metric: ChartMetric;
  onMetricChange: (metric: ChartMetric) => void;
  currency?: string;
}

export const FinancialChart: React.FC<FinancialChartProps> = ({
  data,
  metric,
  onMetricChange,
  currency = '$',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverData, setHoverData] = useState<{
    x: number;
    y: number;
    value: number;
    dateStr: string;
    index: number;
  } | null>(null);

  const getMetricConfig = () => {
    switch (metric) {
      case 'netWorth':
        return {
          label: 'Чистый капитал (Net Worth)',
          color: '#10b981', // Emerald
          gradientStart: 'rgba(16, 185, 129, 0.35)',
          gradientEnd: 'rgba(16, 185, 129, 0.0)',
        };
      case 'cash':
        return {
          label: 'Ликвидные средства (Cash)',
          color: '#06b6d4', // Cyan
          gradientStart: 'rgba(6, 182, 212, 0.35)',
          gradientEnd: 'rgba(6, 182, 212, 0.0)',
        };
      case 'dailyRevenue':
        return {
          label: 'Дневная выручка (Revenue)',
          color: '#8b5cf6', // Violet
          gradientStart: 'rgba(139, 92, 246, 0.35)',
          gradientEnd: 'rgba(139, 92, 246, 0.0)',
        };
      case 'dailyProfit':
        return {
          label: 'Дневная прибыль (Net Profit)',
          color: '#f59e0b', // Amber
          gradientStart: 'rgba(245, 158, 11, 0.35)',
          gradientEnd: 'rgba(245, 158, 11, 0.0)',
        };
    }
  };

  const config = getMetricConfig();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = Math.max(300, rect.width);
    const height = Math.max(220, rect.height);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Padding
    const padLeft = 60;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 30;
    const chartWidth = width - padLeft - padRight;
    const chartHeight = height - padTop - padBottom;

    const points = data.length > 0 ? data : [];
    const values = points.map((p) => (p as any)[metric] || 0);

    let minVal = values.length > 0 ? Math.min(...values) : 0;
    let maxVal = values.length > 0 ? Math.max(...values) : 1000;

    if (minVal === maxVal) {
      minVal = minVal > 0 ? minVal * 0.8 : 0;
      maxVal = maxVal > 0 ? maxVal * 1.2 : 1000;
    }
    const valRange = maxVal - minVal || 1;

    // Draw horizontal grid lines and Y-axis labels
    const gridLinesCount = 4;
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridLinesCount; i++) {
      const y = padTop + (chartHeight / gridLinesCount) * i;
      const val = maxVal - (valRange / gridLinesCount) * i;

      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const formattedVal =
        val >= 1000000
          ? `${currency}${(val / 1000000).toFixed(1)}M`
          : val >= 1000
          ? `${currency}${(val / 1000).toFixed(0)}k`
          : `${currency}${Math.round(val)}`;
      ctx.fillText(formattedVal, padLeft - 8, y);
    }

    if (points.length < 2) {
      // If only 1 point or empty, draw a static placeholder line
      const singleY = padTop + chartHeight / 2;
      ctx.strokeStyle = config.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padLeft, singleY);
      ctx.lineTo(width - padRight, singleY);
      ctx.stroke();

      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(padLeft + chartWidth / 2, singleY, 5, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Map data points to canvas coordinates
    const coords: { x: number; y: number }[] = points.map((p, idx) => {
      const val = (p as any)[metric] || 0;
      const x = padLeft + (idx / (points.length - 1)) * chartWidth;
      const y = padTop + chartHeight - ((val - minVal) / valRange) * chartHeight;
      return { x, y };
    });

    // Draw filled gradient area
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 1; i < coords.length; i++) {
      ctx.lineTo(coords[i].x, coords[i].y);
    }
    ctx.lineTo(coords[coords.length - 1].x, padTop + chartHeight);
    ctx.lineTo(coords[0].x, padTop + chartHeight);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + chartHeight);
    gradient.addColorStop(0, config.gradientStart);
    gradient.addColorStop(1, config.gradientEnd);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw main curve stroke
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 1; i < coords.length; i++) {
      ctx.lineTo(coords[i].x, coords[i].y);
    }
    ctx.strokeStyle = config.color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Draw points markers on last point
    const lastCoord = coords[coords.length - 1];
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.arc(lastCoord.x, lastCoord.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw X-axis date labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    ctx.fillText(
      `Y${firstPoint.gameTime.year}.M${firstPoint.gameTime.month}.D${firstPoint.gameTime.day}`,
      padLeft,
      padTop + chartHeight + 8
    );

    ctx.textAlign = 'right';
    ctx.fillText(
      `Y${lastPoint.gameTime.year}.M${lastPoint.gameTime.month}.D${lastPoint.gameTime.day} (${lastPoint.gameTime.hour}:00)`,
      width - padRight,
      padTop + chartHeight + 8
    );
  }, [data, metric, config]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || data.length === 0) return;

    const rect = container.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const padLeft = 60;
    const padRight = 20;
    const chartWidth = rect.width - padLeft - padRight;

    if (clientX < padLeft || clientX > rect.width - padRight) {
      setHoverData(null);
      return;
    }

    const relX = (clientX - padLeft) / chartWidth;
    const index = Math.min(data.length - 1, Math.max(0, Math.round(relX * (data.length - 1))));
    const item = data[index];
    const val = (item as any)[metric] || 0;

    setHoverData({
      x: clientX,
      y: e.clientY - rect.top,
      value: val,
      dateStr: `Г.${item.gameTime.year} М.${item.gameTime.month} Д.${item.gameTime.day} ${item.gameTime.hour}:00`,
      index,
    });
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  return (
    <div className="w-full flex flex-col bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-xl">
      {/* Metric Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Динамика показателей</span>
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: config.color }}
            />
          </h3>
          <p className="text-xs text-slate-400">
            {config.label} в реальном времени
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800/80">
          <button
            id="tab-chart-networth"
            onClick={() => onMetricChange('netWorth')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              metric === 'netWorth'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Net Worth
          </button>
          <button
            id="tab-chart-cash"
            onClick={() => onMetricChange('cash')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              metric === 'cash'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ликвидность
          </button>
          <button
            id="tab-chart-revenue"
            onClick={() => onMetricChange('dailyRevenue')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              metric === 'dailyRevenue'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Выручка
          </button>
          <button
            id="tab-chart-profit"
            onClick={() => onMetricChange('dailyProfit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              metric === 'dailyProfit'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Прибыль
          </button>
        </div>
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-56 min-h-[220px]"
      >
        <canvas ref={canvasRef} className="block w-full h-full" />

        {/* Interactive hover tooltip */}
        {hoverData && (
          <div
            className="absolute pointer-events-none z-20 px-3 py-2 bg-slate-950/95 border border-slate-700 rounded-xl shadow-2xl text-xs backdrop-blur-md transform -translate-x-1/2 -translate-y-12"
            style={{ left: hoverData.x, top: Math.max(30, hoverData.y) }}
          >
            <div className="font-mono text-slate-400 text-[10px] mb-0.5">
              {hoverData.dateStr}
            </div>
            <div className="font-mono font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: config.color }}
              />
              {currency}
              {Math.round(hoverData.value).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
