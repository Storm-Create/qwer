/**
 * Business Empire: Ultimate
 * Interactive 30-Day Commodity Price Chart (Canvas)
 * High-performance, crisp 2x retina rendering, crosshair hover tooltip,
 * and user buy-price reference lines.
 */

import React, { useRef, useEffect, useState } from 'react';
import { MarketCommodity } from '../../types/game';

interface MarketCommodityChartProps {
  commodity: MarketCommodity;
  avgBuyPrice?: number;
  currency?: string;
  height?: number;
}

export const MarketCommodityChart: React.FC<MarketCommodityChartProps> = ({
  commodity,
  avgBuyPrice,
  currency = '$',
  height = 200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const history = commodity.priceHistory && commodity.priceHistory.length > 0
    ? commodity.priceHistory
    : [commodity.basePrice, commodity.currentPrice];

  const firstPrice = history[0];
  const lastPrice = history[history.length - 1];
  const isPositive = lastPrice >= firstPrice;
  const changePercent = ((lastPrice - firstPrice) / Math.max(0.01, firstPrice)) * 100;

  const minVal = Math.min(...history, avgBuyPrice || Infinity, commodity.basePrice * 0.85);
  const maxVal = Math.max(...history, avgBuyPrice || -Infinity, commodity.basePrice * 1.15);
  const range = Math.max(1, maxVal - minVal);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      renderChart(ctx, rect.width, height);
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [commodity, hoverIndex, avgBuyPrice, height]);

  const renderChart = (ctx: CanvasRenderingContext2D, width: number, h: number) => {
    ctx.clearRect(0, 0, width, h);

    const paddingLeft = 10;
    const paddingRight = 10;
    const paddingTop = 25;
    const paddingBottom = 25;
    const chartW = width - paddingLeft - paddingRight;
    const chartH = h - paddingTop - paddingBottom;

    if (chartW <= 0 || chartH <= 0 || history.length < 2) return;

    // Background horizontal grid lines (4 lines)
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)'; // slate-700
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (let i = 0; i <= 3; i++) {
      const y = paddingTop + (chartH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(paddingLeft + chartW, y);
      ctx.stroke();

      const priceLabel = maxVal - (range / 3) * i;
      ctx.fillStyle = '#64748b'; // slate-500
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${currency}${priceLabel.toFixed(priceLabel < 10 ? 2 : 0)}`, paddingLeft + chartW, y - 4);
    }

    ctx.setLineDash([]); // Reset dash

    // Baseline (base price line)
    const baseY = paddingTop + chartH - ((commodity.basePrice - minVal) / range) * chartH;
    if (baseY >= paddingTop && baseY <= paddingTop + chartH) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)'; // slate-400
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, baseY);
      ctx.lineTo(paddingLeft + chartW, baseY);
      ctx.stroke();
    }

    // User Average Buy Price Line (if present)
    if (avgBuyPrice && avgBuyPrice > 0) {
      const buyY = paddingTop + chartH - ((avgBuyPrice - minVal) / range) * chartH;
      if (buyY >= paddingTop && buyY <= paddingTop + chartH) {
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)'; // amber-500
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(paddingLeft, buyY);
        ctx.lineTo(paddingLeft + chartW, buyY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#eab308';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Куплено: ${currency}${avgBuyPrice.toFixed(avgBuyPrice < 10 ? 2 : 0)}`, paddingLeft + 4, buyY - 3);
      }
    }

    // Coordinate Mapping Function
    const getPoint = (idx: number, val: number) => {
      const x = paddingLeft + (chartW / (history.length - 1)) * idx;
      const y = paddingTop + chartH - ((val - minVal) / range) * chartH;
      return { x, y };
    };

    // Main Price Curve Path
    const points = history.map((val, idx) => getPoint(idx, val));

    // Fill Gradient Area
    const grad = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + chartH);
    if (isPositive) {
      grad.addColorStop(0, 'rgba(16, 185, 129, 0.28)'); // emerald
      grad.addColorStop(1, 'rgba(16, 185, 129, 0.00)');
    } else {
      grad.addColorStop(0, 'rgba(244, 63, 94, 0.28)'); // rose
      grad.addColorStop(1, 'rgba(244, 63, 94, 0.00)');
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      // Catmull-Rom or bezier smoothing
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      ctx.bezierCurveTo(cx, prev.y, cx, curr.y, curr.x, curr.y);
    }
    ctx.lineTo(points[points.length - 1].x, paddingTop + chartH);
    ctx.lineTo(points[0].x, paddingTop + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Stroke Price Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      ctx.bezierCurveTo(cx, prev.y, cx, curr.y, curr.x, curr.y);
    }
    ctx.strokeStyle = isPositive ? '#10b981' : '#f43f5e';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Hover Crosshair and Dot
    if (hoverIndex !== null && hoverIndex >= 0 && hoverIndex < points.length) {
      const pt = points[hoverIndex];
      const hoverVal = history[hoverIndex];

      // Vertical line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(pt.x, paddingTop);
      ctx.lineTo(pt.x, paddingTop + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point circle
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = isPositive ? '#10b981' : '#f43f5e';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tooltip Box
      const text = `${currency}${hoverVal.toFixed(hoverVal < 10 ? 2 : 0)}`;
      const dayText = `День T-${history.length - 1 - hoverIndex}`;
      ctx.font = 'bold 11px monospace';
      const textW = Math.max(ctx.measureText(text).width, ctx.measureText(dayText).width) + 14;
      const boxH = 34;

      let boxX = pt.x - textW / 2;
      if (boxX < paddingLeft) boxX = paddingLeft;
      if (boxX + textW > width - paddingRight) boxX = width - paddingRight - textW;

      let boxY = pt.y - boxH - 8;
      if (boxY < paddingTop) boxY = pt.y + 8;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'; // slate-900
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, textW, boxH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(dayText, boxX + textW / 2, boxY + 12);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(text, boxX + textW / 2, boxY + 26);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || history.length < 2) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - 10;
    const chartW = rect.width - 20;
    if (chartW <= 0) return;

    const ratio = Math.max(0, Math.min(1, x / chartW));
    const idx = Math.round(ratio * (history.length - 1));
    setHoverIndex(idx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div className="space-y-1.5">
      {/* Chart Header Info */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-slate-400">30-ДНЕВНАЯ ДИНАМИКА</span>
          <span
            className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
              isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {changePercent.toFixed(1)}% за 30 дн.
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span>
            Мин: <span className="text-slate-200">{currency}{minVal.toFixed(minVal < 10 ? 2 : 0)}</span>
          </span>
          <span>
            Макс: <span className="text-slate-200">{currency}{maxVal.toFixed(maxVal < 10 ? 2 : 0)}</span>
          </span>
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full relative rounded-xl bg-slate-950/70 border border-slate-800/80 cursor-crosshair overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
