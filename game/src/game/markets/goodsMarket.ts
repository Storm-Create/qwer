/**
 * Business Empire: Ultimate
 * Goods & Commodity Trading Market Subsystem
 * High-performance market simulation with 1000+ commodities, realistic supply/demand dynamics,
 * seasonality, weighted-average inventory accounting, and trade history ledger.
 */

import { gameLoop } from '../gameLoop';
import { gameState } from '../gameState';
import { economy } from '../economy';
import { warehouseSystem } from '../business/warehouses';
import { GameTime, MarketCommodity, TradeRecord, InventoryItem, CommodityCategory, Warehouse } from '../../types/game';
import { buildComprehensiveGoodsCatalog } from './goodsCatalog';

class GoodsMarketSystem {
  private commodities: Map<string, MarketCommodity> = new Map();
  private catalogList: MarketCommodity[] = [];
  private isInitialized = false;

  constructor() {
    this.initCatalog();

    // Hook market price fluctuation to daily game loop
    gameLoop.onDay((time: GameTime) => {
      this.updateDailyMarketFluctuations(time.month);
    });
  }

  /**
   * Initializes or reloads the comprehensive catalog
   */
  public initCatalog(): void {
    if (this.isInitialized) return;
    const generated = buildComprehensiveGoodsCatalog();
    this.catalogList = generated;
    this.commodities.clear();
    for (const item of generated) {
      this.commodities.set(item.id, item);
    }
    this.isInitialized = true;
  }

  public getCommodities(): MarketCommodity[] {
    return this.catalogList;
  }

  public getCommodity(id: string): MarketCommodity | undefined {
    return this.commodities.get(id);
  }

  public getCommoditiesByCategory(category: CommodityCategory): MarketCommodity[] {
    return this.catalogList.filter((c) => c.category === category);
  }

  /**
   * Simulates daily market movements with supply-demand dynamics, seasonality & mean reversion
   */
  public updateDailyMarketFluctuations(currentMonth: number): void {
    const monthIdx = Math.max(0, Math.min(11, currentMonth - 1));

    for (let i = 0; i < this.catalogList.length; i++) {
      const item = this.catalogList[i];

      // 1. Organic slight shift in supply and demand
      const demandDelta = (Math.random() - 0.5) * 0.04;
      const supplyDelta = (Math.random() - 0.5) * 0.04;
      item.demand = Math.max(0.3, Math.min(2.4, Math.round((item.demand + demandDelta) * 100) / 100));
      item.supply = Math.max(0.3, Math.min(2.4, Math.round((item.supply + supplyDelta) * 100) / 100));

      // 2. Market pressure from demand/supply ratio
      const ratio = item.demand / Math.max(0.1, item.supply);
      let marketPressure = (ratio - 1.0) * 0.06; // positive if deficit, negative if surplus

      // 3. Seasonal modifier for current month
      const seasonalMultiplier = item.seasonality[monthIdx] || 1.0;

      // 4. Equilibrium Target Price
      const targetPrice = item.basePrice * seasonalMultiplier * (0.85 + 0.3 * ratio);

      // 5. Mean reversion pull
      const meanReversionPull = (targetPrice - item.currentPrice) * 0.06;

      // 6. Stochastic Brownian noise
      const stochasticDrift = (Math.random() - 0.495) * item.volatility * item.currentPrice;

      // 7. Calculate new price
      let newPrice = item.currentPrice + stochasticDrift + meanReversionPull + marketPressure * item.currentPrice;

      // Ensure price bounds
      newPrice = Math.max(item.minPrice, Math.min(item.maxPrice, newPrice));

      // Precision rounding based on price magnitude
      if (newPrice > 100) newPrice = Math.round(newPrice);
      else if (newPrice > 10) newPrice = Math.round(newPrice * 10) / 10;
      else newPrice = Math.round(newPrice * 100) / 100;

      const prevPrice = item.currentPrice;
      item.currentPrice = newPrice;

      // Update 30-day history
      item.priceHistory.push(newPrice);
      if (item.priceHistory.length > 30) {
        item.priceHistory.shift();
      }

      // Update change24h and trend
      item.change24h = Math.round(((newPrice - prevPrice) / Math.max(0.01, prevPrice)) * 10000) / 100;
      item.trend = Math.round(((newPrice - item.priceHistory[0]) / Math.max(0.01, item.priceHistory[0])) * 100) / 100;
    }

    // Synchronize inventory currentMarketPrice in GameState
    gameState.update((draft) => {
      let changed = false;
      for (const inv of draft.inventory) {
        const live = this.commodities.get(inv.id);
        if (live && live.currentPrice !== inv.currentMarketPrice) {
          inv.currentMarketPrice = live.currentPrice;
          changed = true;
        }
      }
    }, false);
  }

  /**
   * Executes a purchase of specified commodity quantity into player warehouses
   */
  public buyCommodity(
    commodityId: string,
    quantity: number,
    targetWarehouseId?: string
  ): { success: boolean; message: string; trade?: TradeRecord } {
    const qty = Math.floor(quantity);
    if (qty <= 0) {
      return { success: false, message: 'Укажите положительное количество для покупки' };
    }

    const commodity = this.commodities.get(commodityId);
    if (!commodity) {
      return { success: false, message: 'Товар не найден на бирже' };
    }

    const totalCost = qty * commodity.currentPrice;
    const requiredVolume = Math.round((commodity.volume || 0.05) * qty * 100) / 100;
    const requiredWeight = Math.round((commodity.weight || 0.5) * qty * 10) / 10;

    const state = gameState.getState();
    const currency = state.settings.currency || '$';

    // 1. Check Financial funds
    if (!economy.canAfford(totalCost)) {
      return {
        success: false,
        message: `Недостаточно средств. Требуется ${currency}${totalCost.toLocaleString()}, доступно ${currency}${state.cash.toLocaleString()}`,
      };
    }

    // Ensure player has at least one warehouse
    let targetWh: Warehouse | undefined = undefined;
    const warehouses = state.warehouses && state.warehouses.length > 0 ? state.warehouses : [];

    if (warehouses.length === 0) {
      return {
        success: false,
        message: 'У вас нет активного склада! Приобретите склад во вкладке «Склады и логистика».',
      };
    }

    if (targetWarehouseId) {
      targetWh = warehouses.find((w) => w.id === targetWarehouseId);
    } else {
      // Find the first warehouse with sufficient free capacity
      targetWh = warehouses.find((w) => {
        const m = warehouseSystem.getWarehouseMetrics(w);
        return m.freeVolume >= requiredVolume;
      });
      // Or fallback to first warehouse if needed
      if (!targetWh) {
        targetWh = warehouses[0];
      }
    }

    if (!targetWh) {
      return { success: false, message: 'Склад назначения не найден' };
    }

    const metrics = warehouseSystem.getWarehouseMetrics(targetWh);
    if (requiredVolume > metrics.freeVolume) {
      return {
        success: false,
        message: `Недостаточно складского объёма на складе «${targetWh.name}»! Требуется ${requiredVolume} м³, свободно ${metrics.freeVolume} м³. Улучшите склад или освободите место.`,
      };
    }

    // Deduct cash and record finance transaction
    const ok = economy.removeMoney(
      totalCost,
      'Товарный рынок',
      `Закупка: ${commodity.name} (${qty} ${commodity.unit}) по ${commodity.currentPrice} → ${targetWh.name}`,
      'expense'
    );

    if (!ok) {
      return { success: false, message: 'Ошибка списания средств' };
    }

    let createdTrade: TradeRecord | null = null;

    gameState.update((draft) => {
      // Ensure warehouses array exists
      if (!draft.warehouses || draft.warehouses.length === 0) {
        draft.warehouses = [
          {
            id: 'wh_starter_main',
            name: 'Основной склад (Москва)',
            level: 1,
            tier: 1,
            capacity: 100,
            usedCapacity: 0,
            usedWeight: 0,
            maxWeight: 5000,
            rent: 40,
            maintenance: 20,
            storageCostDaily: 0,
            rentCostDaily: 60,
            location: 'Москва',
            inventory: [],
          },
        ];
      }

      const whDraft = draft.warehouses.find((w) => w.id === targetWh!.id) || draft.warehouses[0];
      if (!whDraft.inventory) whDraft.inventory = [];

      // 1. Update target warehouse inventory
      const existingInWh = whDraft.inventory.find((i) => i.id === commodity.id);
      if (existingInWh) {
        const prevQ = existingInWh.quantity;
        const prevCost = existingInWh.totalCost;
        const newQ = prevQ + qty;
        const newCost = prevCost + totalCost;
        existingInWh.quantity = newQ;
        existingInWh.totalCost = newCost;
        existingInWh.avgBuyPrice = Math.round((newCost / newQ) * 100) / 100;
        existingInWh.currentMarketPrice = commodity.currentPrice;
      } else {
        whDraft.inventory.push({
          id: commodity.id,
          name: commodity.name,
          category: commodity.category,
          quantity: qty,
          totalCost: totalCost,
          avgBuyPrice: commodity.currentPrice,
          currentMarketPrice: commodity.currentPrice,
          weight: commodity.weight,
          volume: commodity.volume,
          quality: commodity.quality,
          unit: commodity.unit,
        });
      }

      // 2. Synchronize consolidated inventory
      warehouseSystem.syncGlobalInventoryDraft(draft);

      // 3. Create Trade Record
      createdTrade = {
        id: `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        gameTime: { ...draft.gameTime },
        commodityId: commodity.id,
        commodityName: commodity.name,
        category: commodity.category,
        type: 'BUY',
        quantity: qty,
        pricePerUnit: commodity.currentPrice,
        totalAmount: totalCost,
        avgBuyPrice: commodity.currentPrice,
        balanceAfter: draft.cash,
      };

      draft.tradeHistory.unshift(createdTrade);
      if (draft.tradeHistory.length > 300) {
        draft.tradeHistory = draft.tradeHistory.slice(0, 300);
      }

      // 4. Update Statistics
      draft.statistics.totalTradeVolume += totalCost;
      draft.statistics.tradesExecuted += 1;
      draft.statistics.dealsClosed += 1;
    });

    // Player buying creates minor upward demand pressure
    commodity.demand = Math.min(2.5, Math.round((commodity.demand + 0.01) * 100) / 100);

    return {
      success: true,
      message: `Успешно куплено: ${qty} ${commodity.unit} ${commodity.name} (${requiredVolume} м³) на склад «${targetWh.name}» за ${currency}${totalCost.toLocaleString()}`,
      trade: createdTrade || undefined,
    };
  }

  /**
   * Executes a sale of specified commodity quantity from inventory
   */
  public sellCommodity(
    commodityId: string,
    quantity: number,
    fromWarehouseId?: string
  ): { success: boolean; message: string; trade?: TradeRecord } {
    const qty = Math.floor(quantity);
    if (qty <= 0) {
      return { success: false, message: 'Укажите положительное количество для продажи' };
    }

    const commodity = this.commodities.get(commodityId);
    if (!commodity) {
      return { success: false, message: 'Товар не найден на бирже' };
    }

    const state = gameState.getState();
    const existing = state.inventory.find((i) => i.id === commodity.id);

    if (!existing || existing.quantity < qty) {
      return {
        success: false,
        message: `Недостаточно товара на складах. В наличии: ${existing ? existing.quantity : 0} ${commodity.unit}`,
      };
    }

    const sellPrice = commodity.currentPrice;
    const totalRevenue = qty * sellPrice;
    const avgBuyPrice = existing.avgBuyPrice;
    const costBasis = qty * avgBuyPrice;
    const realizedProfit = totalRevenue - costBasis;
    const marginPercent = ((sellPrice - avgBuyPrice) / Math.max(0.001, avgBuyPrice)) * 100;

    // Credit money to player cash
    economy.addMoney(
      totalRevenue,
      'Товарный рынок',
      `Продажа: ${commodity.name} (${qty} ${commodity.unit}) по ${sellPrice} (Прибыль: ${realizedProfit >= 0 ? '+' : ''}${Math.round(realizedProfit)})`,
      'revenue'
    );

    let createdTrade: TradeRecord | null = null;

    gameState.update((draft) => {
      // Deduct from warehouses
      let remainingToDeduct = qty;

      if (fromWarehouseId) {
        const wh = draft.warehouses.find((w) => w.id === fromWarehouseId);
        if (wh && wh.inventory) {
          const itemIdx = wh.inventory.findIndex((i) => i.id === commodity.id);
          if (itemIdx >= 0) {
            const item = wh.inventory[itemIdx];
            const deduct = Math.min(item.quantity, remainingToDeduct);
            item.quantity -= deduct;
            item.totalCost = Math.max(0, item.quantity * item.avgBuyPrice);
            remainingToDeduct -= deduct;
            if (item.quantity <= 0) {
              wh.inventory.splice(itemIdx, 1);
            }
          }
        }
      }

      if (remainingToDeduct > 0 && draft.warehouses) {
        for (const wh of draft.warehouses) {
          if (!wh.inventory) continue;
          const itemIdx = wh.inventory.findIndex((i) => i.id === commodity.id);
          if (itemIdx >= 0) {
            const item = wh.inventory[itemIdx];
            const deduct = Math.min(item.quantity, remainingToDeduct);
            item.quantity -= deduct;
            item.totalCost = Math.max(0, item.quantity * item.avgBuyPrice);
            remainingToDeduct -= deduct;
            if (item.quantity <= 0) {
              wh.inventory.splice(itemIdx, 1);
            }
          }
          if (remainingToDeduct <= 0) break;
        }
      }

      // Synchronize consolidated inventory
      warehouseSystem.syncGlobalInventoryDraft(draft);

      // 2. Create Trade Record
      createdTrade = {
        id: `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        gameTime: { ...draft.gameTime },
        commodityId: commodity.id,
        commodityName: commodity.name,
        category: commodity.category,
        type: 'SELL',
        quantity: qty,
        pricePerUnit: sellPrice,
        totalAmount: totalRevenue,
        avgBuyPrice: avgBuyPrice,
        realizedProfit: Math.round(realizedProfit * 100) / 100,
        marginPercent: Math.round(marginPercent * 100) / 100,
        balanceAfter: draft.cash,
      };

      draft.tradeHistory.unshift(createdTrade);
      if (draft.tradeHistory.length > 300) {
        draft.tradeHistory = draft.tradeHistory.slice(0, 300);
      }

      // 3. Update Statistics
      draft.statistics.totalTradeVolume += totalRevenue;
      draft.statistics.totalTradeProfit += realizedProfit;
      draft.statistics.tradesExecuted += 1;
      draft.statistics.dealsClosed += 1;
    });

    // Player selling creates minor upward supply pressure
    commodity.supply = Math.min(2.5, Math.round((commodity.supply + 0.01) * 100) / 100);

    const currency = gameState.getState().settings.currency || '$';
    const profitSign = realizedProfit >= 0 ? '+' : '';
    return {
      success: true,
      message: `Успешно продано: ${qty} ${commodity.unit} ${commodity.name} на сумму ${currency}${totalRevenue.toLocaleString()} (Прибыль: ${profitSign}${currency}${Math.round(realizedProfit).toLocaleString()} [${marginPercent.toFixed(1)}%])`,
      trade: createdTrade || undefined,
    };
  }

  /**
   * Returns market intelligence analytics
   */
  public getMarketAnalytics(): {
    totalCommodities: number;
    gainersCount: number;
    losersCount: number;
    topGainers: MarketCommodity[];
    topLosers: MarketCommodity[];
    highDemand: MarketCommodity[];
    highestMarginOpportunities: Array<{ commodity: MarketCommodity; discountPercent: number }>;
  } {
    const list = [...this.catalogList];
    const gainers = list.filter((c) => c.change24h > 0).sort((a, b) => b.change24h - a.change24h);
    const losers = list.filter((c) => c.change24h < 0).sort((a, b) => a.change24h - b.change24h);
    const highDemand = [...list].sort((a, b) => b.demand / Math.max(0.1, b.supply) - a.demand / Math.max(0.1, a.supply));

    // Commodities trading at heavy discount below basePrice
    const discountItems = list
      .map((c) => ({
        commodity: c,
        discountPercent: Math.round(((c.basePrice - c.currentPrice) / c.basePrice) * 100),
      }))
      .filter((i) => i.discountPercent > 15)
      .sort((a, b) => b.discountPercent - a.discountPercent)
      .slice(0, 10);

    return {
      totalCommodities: list.length,
      gainersCount: gainers.length,
      losersCount: losers.length,
      topGainers: gainers.slice(0, 8),
      topLosers: losers.slice(0, 8),
      highDemand: highDemand.slice(0, 8),
      highestMarginOpportunities: discountItems,
    };
  }
}

export const goodsMarket = new GoodsMarketSystem();
