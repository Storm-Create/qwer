/**
 * Business Empire: Ultimate
 * Trade History Ledger Table Component
 * Displays chronological buy/sell operations with profit/loss metrics,
 * margin percentages, search filters, and transaction audit trails.
 */

import React, { useState } from 'react';
import { TradeRecord, GameSettings } from '../../types/game';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  DollarSign,
  Package,
} from 'lucide-react';

interface TradeHistoryTableProps {
  tradeHistory: TradeRecord[];
  settings: GameSettings;
}

export const TradeHistoryTable: React.FC<TradeHistoryTableProps> = ({ tradeHistory, settings }) => {
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const currency = settings.currency || '$';

  const filteredHistory = tradeHistory.filter((trade) => {
    if (filterType !== 'ALL' && trade.type !== filterType) return false;
    if (
      searchQuery.trim() &&
      !trade.commodityName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !trade.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Calculate summary metrics
  const totalTrades = tradeHistory.length;
  const buyTrades = tradeHistory.filter((t) => t.type === 'BUY');
  const sellTrades = tradeHistory.filter((t) => t.type === 'SELL');
  const totalVolume = tradeHistory.reduce((acc, t) => acc + t.totalAmount, 0);
  const totalProfit = tradeHistory.reduce((acc, t) => acc + (t.realizedProfit || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary Stat Mini-Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Всего сделок</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold font-mono text-white">{totalTrades}</span>
            <span className="text-xs text-slate-400">
              ({buyTrades.length} пок. / {sellTrades.length} прод.)
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Торговый оборот</span>
          <span className="text-xl font-bold font-mono text-amber-400 mt-0.5 block">
            {currency}
            {totalVolume.toLocaleString()}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Зафиксированная прибыль</span>
          <span
            className={`text-xl font-bold font-mono mt-0.5 block ${
              totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalProfit >= 0 ? '+' : ''}
            {currency}
            {totalProfit.toLocaleString()}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium block">Винрейт по сделкам</span>
          <span className="text-xl font-bold font-mono text-slate-200 mt-0.5 block">
            {sellTrades.length > 0
              ? `${Math.round(
                  (sellTrades.filter((t) => (t.realizedProfit || 0) > 0).length / sellTrades.length) * 100
                )}%`
              : '—'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по сделкам..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['ALL', 'BUY', 'SELL'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === type
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {type === 'ALL' ? 'Все' : type === 'BUY' ? 'Покупки' : 'Продажи'}
            </button>
          ))}
        </div>
      </div>

      {/* Trades Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Package className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-medium">История сделок пуста</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery ? 'Попробуйте изменить параметры поиска' : 'Совершите первую торговую операцию на бирже товаров'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Время</th>
                  <th className="py-3 px-4">Тип</th>
                  <th className="py-3 px-4">Товар</th>
                  <th className="py-3 px-4 text-right">Кол-во</th>
                  <th className="py-3 px-4 text-right">Цена ед.</th>
                  <th className="py-3 px-4 text-right">Сумма</th>
                  <th className="py-3 px-4 text-right">Прибыль / Маржа</th>
                  <th className="py-3 px-4 text-right">Баланс после</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredHistory.map((trade) => {
                  const isBuy = trade.type === 'BUY';
                  const pnl = trade.realizedProfit;
                  const margin = trade.marginPercent;

                  return (
                    <tr key={trade.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                        Г.{trade.gameTime.year} М.{trade.gameTime.month} Д.{trade.gameTime.day}{' '}
                        {trade.gameTime.hour.toString().padStart(2, '0')}:00
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isBuy
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isBuy ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {isBuy ? 'ПОКУПКА' : 'ПРОДАЖА'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-sans font-medium">
                        <div className="truncate max-w-[220px]">{trade.commodityName}</div>
                        <div className="text-[10px] text-slate-400">{trade.category}</div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-200">
                        {trade.quantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-200">
                        {currency}
                        {trade.pricePerUnit.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white">
                        {currency}
                        {trade.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {!isBuy && pnl !== undefined ? (
                          <span
                            className={`font-bold ${
                              pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {pnl >= 0 ? '+' : ''}
                            {currency}
                            {pnl.toLocaleString()}{' '}
                            {margin !== undefined && (
                              <span className="text-[10px] opacity-80">({margin >= 0 ? '+' : ''}{margin.toFixed(1)}%)</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {currency}
                        {trade.balanceAfter.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
