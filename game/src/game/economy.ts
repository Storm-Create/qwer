/**
 * Business Empire: Ultimate
 * Economy Engine & Financial API
 */

import { gameState } from './gameState';
import { MAX_FINANCIAL_SNAPSHOTS, MAX_TRANSACTION_HISTORY } from './constants';
import { FinancialSnapshot, Transaction, TransactionType } from '../types/game';

export interface FinancialBreakdown {
  cash: number;
  inventoryValuation: number;
  vehiclesValuation: number;
  businessesValuation: number;
  realEstateValuation: number;
  stocksValuation: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  dailyRevenue: number;
  dailyExpenses: number;
  dailyProfit: number;
}

class EconomyAPI {
  /**
   * Checks if player has sufficient funds
   */
  public canAfford(amount: number): boolean {
    if (amount <= 0) return true;
    return gameState.getState().cash >= amount;
  }

  /**
   * Adds money to cash balance, logs transaction, updates stats & net worth
   */
  public addMoney(
    amount: number,
    category: string,
    description: string,
    type: TransactionType = 'revenue'
  ): boolean {
    if (amount <= 0) return false;

    let transaction: Transaction | null = null;

    gameState.update((state) => {
      state.cash += amount;
      state.statistics.totalEarned += amount;
      state.statistics.transactionsCount += 1;

      transaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        gameTime: { ...state.gameTime },
        amount,
        type,
        category,
        description,
        balanceAfter: state.cash,
      };

      state.transactions.unshift(transaction);
      if (state.transactions.length > MAX_TRANSACTION_HISTORY) {
        state.transactions = state.transactions.slice(0, MAX_TRANSACTION_HISTORY);
      }

      this.recalculateNetWorthInDraft(state);
    });

    return true;
  }

  /**
   * Deducts money from cash balance, logs transaction, updates stats & net worth
   */
  public removeMoney(
    amount: number,
    category: string,
    description: string,
    type: TransactionType = 'expense'
  ): boolean {
    if (amount <= 0) return true;

    const currentCash = gameState.getState().cash;
    if (currentCash < amount) {
      return false; // Insufficient funds
    }

    let transaction: Transaction | null = null;

    gameState.update((state) => {
      state.cash -= amount;
      state.statistics.totalSpent += amount;
      state.statistics.transactionsCount += 1;

      transaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        gameTime: { ...state.gameTime },
        amount: -amount,
        type,
        category,
        description,
        balanceAfter: state.cash,
      };

      state.transactions.unshift(transaction);
      if (state.transactions.length > MAX_TRANSACTION_HISTORY) {
        state.transactions = state.transactions.slice(0, MAX_TRANSACTION_HISTORY);
      }

      this.recalculateNetWorthInDraft(state);
    });

    return true;
  }

  /**
   * Helper internal method to recalculate Net Worth on mutable draft
   */
  private recalculateNetWorthInDraft(state: any): void {
    let assets = state.cash;

    // Warehouses inventory
    if (state.warehouses && state.warehouses.length > 0) {
      for (const w of state.warehouses) {
        for (const item of w.inventory) {
          assets += item.quantity * item.currentMarketPrice;
        }
      }
    }

    // Direct inventory
    if (state.inventory && state.inventory.length > 0) {
      for (const item of state.inventory) {
        assets += item.quantity * item.currentMarketPrice;
      }
    }

    // Vehicles
    if (state.cars && state.cars.length > 0) {
      for (const car of state.cars) {
        assets += car.marketValue;
      }
    }

    // Businesses & Retail Stores
    if (state.businesses && state.businesses.length > 0) {
      for (const biz of state.businesses) {
        const valuation = (biz.baseDailyRevenue * 60) * (1 + biz.level * 0.2);
        assets += valuation;
      }
    }
    if (state.retailStores && state.retailStores.length > 0) {
      for (const store of state.retailStores) {
        // Store asset valuation: area value + equipment value + inventory at cost
        let storeInvValue = 0;
        for (const item of store.inventory) {
          storeInvValue += item.currentStock * item.avgCostPrice;
        }
        const storeValuation = store.areaSqM * 1200 * (1 + store.level * 0.15) + storeInvValue;
        assets += storeValuation;
      }
    }

    // Real Estate Subsystem & Legacy Properties
    if (state.realEstate && state.realEstate.properties.length > 0) {
      for (const prop of state.realEstate.properties) {
        assets += prop.marketValue;
      }
    } else if (state.properties && state.properties.length > 0) {
      for (const prop of state.properties) {
        assets += prop.currentValuation;
      }
    }

    // Bank Deposits Subsystem
    if (state.bank && state.bank.deposits && state.bank.deposits.length > 0) {
      for (const dep of state.bank.deposits) {
        assets += dep.amount;
      }
    }

    // Stocks Portfolio Subsystem
    if ((state as any).stockExchange && (state as any).stockExchange.holdings) {
      for (const [sym, holding] of Object.entries((state as any).stockExchange.holdings as Record<string, any>)) {
        if (holding.shares > 0) {
          const comp = (state as any).stockExchange.companies?.find((c: any) => c.ticker === sym);
          const currentPrice = comp ? comp.price : holding.avgBuyPrice;
          assets += holding.shares * currentPrice;
        }
      }
    } else if (state.stocks && state.stocks.holdings) {
      for (const [symbol, holding] of Object.entries(state.stocks.holdings as Record<string, any>)) {
        const marketItem = state.stocks.market?.find((m: any) => m.symbol === symbol);
        const currentPrice = marketItem ? marketItem.currentPrice : holding.avgPrice;
        assets += holding.shares * currentPrice;
      }
    }

    // Liabilities (Bank Subsystem Loans & Legacy Loans)
    let liabilities = 0;
    if (state.bank && state.bank.loans && state.bank.loans.length > 0) {
      for (const loan of state.bank.loans) {
        liabilities += loan.remainingDebt;
      }
    }
    if (state.loans && state.loans.length > 0) {
      for (const loan of state.loans) {
        liabilities += loan.remainingAmount;
      }
    }

    const netWorth = Math.max(0, assets - liabilities);
    state.netWorth = netWorth;

    if (netWorth > state.statistics.highestNetWorth) {
      state.statistics.highestNetWorth = netWorth;
    }
  }

  /**
   * Returns current total net worth of player
   */
  public getNetWorth(): number {
    return this.getFinancialBreakdown().netWorth;
  }

  /**
   * Calculates comprehensive financial breakdown
   */
  public getFinancialBreakdown(): FinancialBreakdown {
    const state = gameState.getState();

    let inventoryValuation = 0;
    for (const w of state.warehouses) {
      for (const item of w.inventory) {
        inventoryValuation += item.quantity * item.currentMarketPrice;
      }
    }
    for (const item of state.inventory) {
      inventoryValuation += item.quantity * item.currentMarketPrice;
    }

    let vehiclesValuation = 0;
    for (const car of state.cars) {
      vehiclesValuation += car.marketValue;
    }

    let businessesValuation = 0;
    for (const biz of state.businesses) {
      const valuation = (biz.baseDailyRevenue * 60) * (1 + biz.level * 0.2);
      businessesValuation += valuation;
    }
    if (state.retailStores) {
      for (const store of state.retailStores) {
        let storeInv = 0;
        for (const item of store.inventory) {
          storeInv += item.currentStock * item.avgCostPrice;
        }
        businessesValuation += store.areaSqM * 1200 * (1 + store.level * 0.15) + storeInv;
      }
    }

    let realEstateValuation = 0;
    if (state.realEstate && state.realEstate.properties && state.realEstate.properties.length > 0) {
      for (const prop of state.realEstate.properties) {
        realEstateValuation += prop.marketValue;
      }
    } else if (state.properties && state.properties.length > 0) {
      for (const prop of state.properties) {
        realEstateValuation += prop.currentValuation;
      }
    }

    let bankDepositsValuation = 0;
    if (state.bank && state.bank.deposits && state.bank.deposits.length > 0) {
      for (const dep of state.bank.deposits) {
        bankDepositsValuation += dep.amount;
      }
    }

    let stocksValuation = 0;
    if ((state as any).stockExchange && (state as any).stockExchange.holdings) {
      for (const [sym, holding] of Object.entries((state as any).stockExchange.holdings as Record<string, any>)) {
        if (holding.shares > 0) {
          const comp = (state as any).stockExchange.companies?.find((c: any) => c.ticker === sym);
          const currentPrice = comp ? comp.price : holding.avgBuyPrice;
          stocksValuation += holding.shares * currentPrice;
        }
      }
    } else if (state.stocks && state.stocks.holdings) {
      for (const [symbol, holding] of Object.entries(state.stocks.holdings)) {
        const marketItem = state.stocks.market?.find((m) => m.symbol === symbol);
        const currentPrice = marketItem ? marketItem.currentPrice : holding.avgPrice;
        stocksValuation += holding.shares * currentPrice;
      }
    }

    let totalLiabilities = 0;
    for (const loan of state.loans || []) {
      totalLiabilities += loan.remainingAmount;
    }
    if (state.bank && state.bank.loans) {
      for (const bLoan of state.bank.loans) {
        totalLiabilities += bLoan.remainingDebt;
      }
    }

    const totalAssets =
      state.cash +
      inventoryValuation +
      vehiclesValuation +
      businessesValuation +
      realEstateValuation +
      bankDepositsValuation +
      stocksValuation;

    const netWorth = Math.max(0, totalAssets - totalLiabilities);

    const { dailyRevenue, dailyExpenses, dailyProfit } = this.calculateDailyMetrics();

    return {
      cash: state.cash,
      inventoryValuation,
      vehiclesValuation,
      businessesValuation,
      realEstateValuation,
      stocksValuation,
      totalAssets,
      totalLiabilities,
      netWorth,
      dailyRevenue,
      dailyExpenses,
      dailyProfit,
    };
  }

  /**
   * Calculates projected daily revenues, expenses, and net profit
   */
  public calculateDailyMetrics(): { dailyRevenue: number; dailyExpenses: number; dailyProfit: number } {
    const state = gameState.getState();

    let dailyRevenue = 0;
    let dailyExpenses = 0;

    // Businesses & Retail Stores
    for (const biz of state.businesses) {
      if (biz.status === 'active') {
        dailyRevenue += biz.baseDailyRevenue * (1 + biz.level * 0.15);
        dailyExpenses += biz.baseDailyExpense;
      }
    }
    if (state.retailStores) {
      for (const store of state.retailStores) {
        if (store.status === 'active') {
          dailyRevenue += store.dailyRevenue || (store.level * 1200);
          dailyExpenses += (store.dailyCogs || (store.level * 600)) +
            (store.dailyRent || 100) +
            (store.dailyElectricity || 20) +
            (store.dailySalaries || 200) +
            (store.dailyAdCost || 0);
        }
      }
    }

    // Real Estate rental income
    for (const prop of state.properties) {
      if (prop.isRented) {
        dailyRevenue += prop.rentalIncomeDaily;
      }
      dailyExpenses += prop.maintenanceDaily;
    }

    // Warehouses rent
    for (const w of state.warehouses) {
      dailyExpenses += w.rentCostDaily;
    }

    // Vehicle maintenance
    for (const car of state.cars) {
      dailyExpenses += car.maintenanceCostDaily;
    }

    // Employee salaries
    for (const emp of state.employees) {
      dailyExpenses += emp.salaryDaily;
    }

    // Loans daily payments
    for (const loan of state.loans) {
      if (loan.remainingAmount > 0) {
        dailyExpenses += loan.dailyPayment;
      }
    }

    // Stock dividends (daily approximation)
    for (const [symbol, holding] of Object.entries(state.stocks.holdings)) {
      const marketItem = state.stocks.market.find((m) => m.symbol === symbol);
      if (marketItem && marketItem.dividendYield > 0) {
        const annualDividends = holding.shares * marketItem.currentPrice * marketItem.dividendYield;
        const dailyDividends = annualDividends / 360;
        dailyRevenue += dailyDividends;
      }
    }

    const dailyProfit = dailyRevenue - dailyExpenses;

    return { dailyRevenue, dailyExpenses, dailyProfit };
  }

  /**
   * Formats numeric currency with symbol and separator
   */
  public formatMoney(amount: number): string {
    const currency = gameState.getState().settings?.currency || '$';
    return `${currency}${Math.round(amount).toLocaleString('ru-RU')}`;
  }

  /**
   * Captures a snapshot for historical charting
   */
  public captureSnapshot(): void {
    const state = gameState.getState();
    const metrics = this.calculateDailyMetrics();

    const snapshot: FinancialSnapshot = {
      timestamp: Date.now(),
      gameTime: { ...state.gameTime },
      cash: state.cash,
      netWorth: state.netWorth,
      dailyRevenue: metrics.dailyRevenue,
      dailyExpenses: metrics.dailyExpenses,
      dailyProfit: metrics.dailyProfit,
    };

    gameState.update((draft) => {
      draft.financialHistory.push(snapshot);
      if (draft.financialHistory.length > MAX_FINANCIAL_SNAPSHOTS) {
        draft.financialHistory = draft.financialHistory.slice(
          draft.financialHistory.length - MAX_FINANCIAL_SNAPSHOTS
        );
      }
    }, false);
  }
}

export const economy = new EconomyAPI();
