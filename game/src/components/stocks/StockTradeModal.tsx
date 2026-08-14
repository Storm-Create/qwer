/**
 * Business Empire: Ultimate
 * Interactive Stock Trading Terminal & Modal
 */

import React, { useState } from 'react';
import { X, ArrowUpRight, ArrowDownRight, Wallet, PieChart, ShieldCheck } from 'lucide-react';
import { StockCompany, StockHoldingRecord } from '../../types/stockExchange';
import { stockExchange } from '../../game/markets/stockExchangeManager';

interface StockTradeModalProps {
  company: StockCompany;
  holding?: StockHoldingRecord;
  playerCash: number;
  currency?: string;
  onClose: () => void;
  showNotification: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export const StockTradeModal: React.FC<StockTradeModalProps> = ({
  company,
  holding,
  playerCash,
  currency = '$',
  onClose,
  showNotification,
}) => {
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>(holding && holding.shares > 0 ? 'BUY' : 'BUY');
  const [sharesInput, setSharesInput] = useState<number>(1);

  const ownedShares = holding?.shares || 0;
  const avgBuyPrice = holding?.avgBuyPrice || 0;

  const maxAffordableShares = Math.max(0, Math.floor(playerCash / company.price));
  const maxSellableShares = ownedShares;

  const maxQuantity = tradeType === 'BUY' ? maxAffordableShares : maxSellableShares;

  const validShares = Math.max(1, Math.min(sharesInput, maxQuantity > 0 ? maxQuantity : 1));
  const totalAmount = Math.round(validShares * company.price * 100) / 100;

  // Realized profit calculation if selling
  const costBasis = validShares * avgBuyPrice;
  const projectedProfit = tradeType === 'SELL' ? totalAmount - costBasis : 0;
  const projectedProfitPercent = costBasis > 0 ? (projectedProfit / costBasis) * 100 : 0;

  // Potential annual dividend income
  const projectedAnnualDividend = validShares * company.dividend;

  const handleExecute = () => {
    if (tradeType === 'BUY') {
      if (validShares > maxAffordableShares) {
        showNotification('Недостаточно денежных средств на балансе', 'error');
        return;
      }
      const res = stockExchange.buyStock(company.ticker, validShares);
      if (res.success) {
        showNotification(res.message, 'success');
        onClose();
      } else {
        showNotification(res.message, 'error');
      }
    } else {
      if (validShares > ownedShares) {
        showNotification('Недостаточно акций в портфеле для продажи', 'error');
        return;
      }
      const res = stockExchange.sellStock(company.ticker, validShares);
      if (res.success) {
        showNotification(res.message, 'success');
        onClose();
      } else {
        showNotification(res.message, 'error');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="p-5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-mono font-black text-blue-400">
              {company.ticker.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400">{company.ticker}</span>
                <span className="text-[11px] text-slate-500">· {company.sector}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-100">{company.name}</h3>
            </div>
          </div>
          <button
            id="btn-close-stock-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Price & Balance bar */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">Рыночная котировка</span>
              <div className="font-mono text-xl font-black text-slate-100">
                {currency}{company.price.toFixed(2)}
              </div>
              <div className={`text-[11px] font-mono font-semibold ${company.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {company.change24h >= 0 ? '+' : ''}{company.change24h.toFixed(2)} ({company.change24hPercent.toFixed(2)}%)
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-0.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Доступная ликвидность</span>
              </div>
              <div className="font-mono text-xl font-black text-emerald-400">
                {currency}{playerCash.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                В портфеле: {ownedShares.toLocaleString()} шт.
              </div>
            </div>
          </div>

          {/* Trade Type Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              id="btn-switch-buy"
              onClick={() => setTradeType('BUY')}
              className={`py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                tradeType === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              КУПИТЬ АКЦИИ
            </button>
            <button
              id="btn-switch-sell"
              onClick={() => setTradeType('SELL')}
              disabled={ownedShares <= 0}
              className={`py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                tradeType === 'SELL'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40'
                  : ownedShares <= 0
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              ПРОДАТЬ ПОЗИЦИЮ ({ownedShares})
            </button>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Количество акций (шт.):</span>
              <span className="font-mono text-slate-400">
                Макс: {maxQuantity.toLocaleString()} шт.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="input-shares-quantity"
                type="number"
                min="1"
                max={maxQuantity > 0 ? maxQuantity : 1}
                value={sharesInput || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setSharesInput(isNaN(val) ? 0 : Math.max(0, val));
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-base text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              />
              <button
                id="btn-shares-max"
                onClick={() => setSharesInput(maxQuantity > 0 ? maxQuantity : 1)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 font-mono text-xs font-bold rounded-xl transition-colors shrink-0"
              >
                МАКС
              </button>
            </div>

            {/* Quick amount presets */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[1, 10, 50, 100, 500].map((preset) => (
                <button
                  key={preset}
                  id={`btn-preset-${preset}`}
                  onClick={() => setSharesInput(preset)}
                  className="py-1 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Сумма сделки:</span>
              <span className="font-mono text-sm font-bold text-slate-100">
                {currency}{totalAmount.toLocaleString()}
              </span>
            </div>

            {tradeType === 'BUY' && (
              <>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Ожидаемые дивиденды / год:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    +{currency}{projectedAnnualDividend.toFixed(2)} ({(company.dividendYield * 100).toFixed(2)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Остаток баланса после покупки:</span>
                  <span className="font-mono text-slate-200">
                    {currency}{Math.max(0, playerCash - totalAmount).toLocaleString()}
                  </span>
                </div>
              </>
            )}

            {tradeType === 'SELL' && (
              <>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Средняя цена покупки:</span>
                  <span className="font-mono text-slate-300">
                    {currency}{avgBuyPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Прибыль / Убыток (P/L):</span>
                  <span
                    className={`font-mono font-bold ${
                      projectedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {projectedProfit >= 0 ? '+' : ''}{currency}{projectedProfit.toLocaleString()} ({projectedProfitPercent.toFixed(2)}%)
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Action Button */}
          <button
            id="btn-confirm-order"
            onClick={handleExecute}
            disabled={(tradeType === 'BUY' && (totalAmount > playerCash || playerCash <= 0)) || (tradeType === 'SELL' && ownedShares <= 0)}
            className={`w-full py-3.5 rounded-2xl font-mono text-sm font-black text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
              tradeType === 'BUY'
                ? totalAmount > playerCash
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
                : ownedShares <= 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {tradeType === 'BUY'
              ? `ПОДТВЕРДИТЬ ПОКУПКУ НА ${currency}${totalAmount.toLocaleString()}`
              : `ПОДТВЕРДИТЬ ПРОДАЖУ НА ${currency}${totalAmount.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
};
