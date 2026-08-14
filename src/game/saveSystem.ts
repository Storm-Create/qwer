/**
 * Business Empire: Ultimate
 * Save/Load System, Persistence & Offline Progress Engine
 */

import { gameState } from './gameState';
import { economy } from './economy';
import {
  DEFAULT_AUTOSAVE_SECONDS,
  MAX_OFFLINE_SECONDS,
  REAL_SECONDS_PER_GAME_DAY,
  SAVE_VERSION,
  STORAGE_KEY,
} from './constants';
import { GameState, OfflineProgressResult, SaveData } from '../types/game';

class SaveManager {
  private autoSaveTimer: any = null;

  /**
   * Serializes and saves current game state to localStorage
   */
  public saveGame(): { success: boolean; message: string } {
    try {
      const state = gameState.getState();
      const saveData: SaveData = {
        saveVersion: SAVE_VERSION,
        timestamp: Date.now(),
        state: {
          ...state,
          lastSavedTimestamp: Date.now(),
        },
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
      
      gameState.update((draft) => {
        draft.lastSavedTimestamp = Date.now();
      }, false);

      return { success: true, message: 'Игра успешно сохранена' };
    } catch (err) {
      console.error('Failed to save game:', err);
      return { success: false, message: 'Ошибка при сохранении игры' };
    }
  }

  /**
   * Loads saved game, applies data migrations if needed, and simulates offline progress
   */
  public loadGame(): { success: boolean; message: string; offlineResult?: OfflineProgressResult } {
    try {
      const rawData = localStorage.getItem(STORAGE_KEY);
      if (!rawData) {
        return { success: false, message: 'Сохраненных данных не найдено' };
      }

      const parsed: SaveData = JSON.parse(rawData);

      // Handle migrations
      const migratedState = this.migrateSaveData(parsed);

      // Calculate offline progress
      const offlineResult = this.processOfflineProgress(migratedState, parsed.timestamp || Date.now());

      // Set state to game manager
      gameState.setState(migratedState);

      return {
        success: true,
        message: 'Игра успешно загружена',
        offlineResult: offlineResult.elapsedSeconds > 10 ? offlineResult : undefined,
      };
    } catch (err) {
      console.error('Failed to load game:', err);
      return { success: false, message: 'Ошибка при загрузке сохраненных данных' };
    }
  }

  /**
   * Resets game progress and clears localStorage
   */
  public resetGame(): void {
    localStorage.removeItem(STORAGE_KEY);
    gameState.reset();
  }

  /**
   * Starts periodic autosave
   */
  public startAutoSave(intervalSeconds = DEFAULT_AUTOSAVE_SECONDS): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(() => {
      this.saveGame();
    }, intervalSeconds * 1000);
  }

  /**
   * Stops autosave interval
   */
  public stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Simulates offline earnings and expenses when player was away
   */
  private processOfflineProgress(
    state: GameState,
    lastSavedTimestamp: number
  ): OfflineProgressResult {
    const now = Date.now();
    const rawElapsedSeconds = Math.max(0, Math.floor((now - lastSavedTimestamp) / 1000));
    const cappedElapsedSeconds = Math.min(rawElapsedSeconds, MAX_OFFLINE_SECONDS);

    // If less than 10 seconds, skip offline calculation
    if (cappedElapsedSeconds < 10) {
      return {
        elapsedSeconds: rawElapsedSeconds,
        simulatedHours: 0,
        simulatedDays: 0,
        earnings: 0,
        expenses: 0,
        netProfit: 0,
        timestamp: now,
      };
    }

    // 1 game day = 60 real seconds => simulatedDays = cappedSeconds / 60
    const simulatedDays = cappedElapsedSeconds / REAL_SECONDS_PER_GAME_DAY;
    const simulatedHours = Math.floor(simulatedDays * 24);

    // Calculate daily rates
    let dailyRevenue = 0;
    let dailyExpenses = 0;

    // Active businesses
    for (const biz of state.businesses || []) {
      if (biz.status === 'active') {
        const managerBonus = biz.managerHired ? 1.1 : 0.85; // manager ensures efficiency offline
        dailyRevenue += biz.baseDailyRevenue * (1 + biz.level * 0.15) * managerBonus;
        dailyExpenses += biz.baseDailyExpense;
      }
    }

    // Real estate rentals
    for (const prop of state.properties || []) {
      if (prop.isRented) {
        dailyRevenue += prop.rentalIncomeDaily;
      }
      dailyExpenses += prop.maintenanceDaily;
    }

    // Warehouses rent
    for (const w of state.warehouses || []) {
      dailyExpenses += w.rentCostDaily;
    }

    // Vehicles maintenance
    for (const car of state.cars || []) {
      dailyExpenses += car.maintenanceCostDaily;
    }

    // Employee salaries
    for (const emp of state.employees || []) {
      dailyExpenses += emp.salaryDaily;
    }

    // Stock dividends
    if ((state as any).stockExchange?.holdings) {
      for (const [ticker, h] of Object.entries((state as any).stockExchange.holdings as Record<string, any>)) {
        if (h.shares > 0) {
          const comp = (state as any).stockExchange.companies?.find((c: any) => c.ticker === ticker);
          if (comp && comp.dividend > 0) {
            const annualDividends = h.shares * comp.dividend;
            dailyRevenue += annualDividends / 30;
          }
        }
      }
    } else {
      for (const [symbol, holding] of Object.entries(state.stocks?.holdings || {})) {
        const marketItem = state.stocks?.market?.find((m) => m.symbol === symbol);
        if (marketItem && marketItem.dividendYield > 0) {
          const annualDividends = (holding as any).shares * marketItem.currentPrice * marketItem.dividendYield;
          dailyRevenue += annualDividends / 30;
        }
      }
    }

    const totalOfflineEarnings = Math.round(dailyRevenue * simulatedDays);
    const totalOfflineExpenses = Math.round(dailyExpenses * simulatedDays);
    const netOfflineProfit = totalOfflineEarnings - totalOfflineExpenses;

    // Apply to loaded state cash
    if (netOfflineProfit !== 0) {
      state.cash = Math.max(0, state.cash + netOfflineProfit);

      if (netOfflineProfit > 0) {
        state.statistics.totalEarned += netOfflineProfit;
      } else {
        state.statistics.totalSpent += Math.abs(netOfflineProfit);
      }

      state.transactions.unshift({
        id: `tx_offline_${now}`,
        timestamp: now,
        gameTime: { ...state.gameTime },
        amount: netOfflineProfit,
        type: netOfflineProfit >= 0 ? 'revenue' : 'expense',
        category: 'Офлайн прогресс',
        description: `Доход за время отсутствия (${Math.round(simulatedDays * 10) / 10} дн. / ${(cappedElapsedSeconds / 3600).toFixed(1)} ч.)`,
        balanceAfter: state.cash,
      });
    }

    // Advance calendar by simulated hours
    let hoursToAdd = simulatedHours;
    state.gameTime.hour += hoursToAdd % 24;
    state.gameTime.totalHours += hoursToAdd;
    let daysToAdd = Math.floor(hoursToAdd / 24);

    state.gameTime.day += daysToAdd;
    state.gameTime.totalDays += daysToAdd;

    while (state.gameTime.hour >= 24) {
      state.gameTime.hour -= 24;
      state.gameTime.day += 1;
      state.gameTime.totalDays += 1;
    }

    while (state.gameTime.day > 30) {
      state.gameTime.day -= 30;
      state.gameTime.month += 1;
      if (state.gameTime.month > 12) {
        state.gameTime.month = 1;
        state.gameTime.year += 1;
      }
    }

    return {
      elapsedSeconds: rawElapsedSeconds,
      simulatedHours,
      simulatedDays: Math.round(simulatedDays * 10) / 10,
      earnings: totalOfflineEarnings,
      expenses: totalOfflineExpenses,
      netProfit: netOfflineProfit,
      timestamp: now,
    };
  }

  /**
   * Version migration pipeline
   */
  private migrateSaveData(savedData: SaveData): GameState {
    let state = savedData.state;

    // Ensure fallback defaults for any newly added fields across versions
    if (!state.corporation) {
      state.corporation = {
        name: 'Vanguard Enterprises',
        established: false,
        sharesPublic: false,
        creditRating: 'BBB',
        valuationMultiplier: 1.0,
        taxRate: 0.13,
        executiveBoard: { ceo: 'Основатель (Вы)' },
      };
    }

    if (!state.settings) {
      state.settings = {
        soundEnabled: true,
        autoSaveIntervalSec: 30,
        compactNumbers: false,
        currency: '$',
        language: 'ru',
      };
    }

    if (!Array.isArray(state.financialHistory)) {
      state.financialHistory = [];
    }

    if (!Array.isArray(state.inventory)) {
      state.inventory = [];
    }

    if (!Array.isArray(state.tradeHistory)) {
      state.tradeHistory = [];
    }

    if (state.statistics) {
      if (typeof state.statistics.totalTradeVolume !== 'number') state.statistics.totalTradeVolume = 0;
      if (typeof state.statistics.totalTradeProfit !== 'number') state.statistics.totalTradeProfit = 0;
      if (typeof state.statistics.tradesExecuted !== 'number') state.statistics.tradesExecuted = 0;
    }

    return state;
  }

  /**
   * Exports state as formatted JSON string for backup/sharing
   */
  public exportStateToJson(): string {
    const state = gameState.getState();
    const exportData: SaveData = {
      saveVersion: SAVE_VERSION,
      timestamp: Date.now(),
      state,
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Imports state from raw JSON string
   */
  public importStateFromJson(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed: SaveData = JSON.parse(jsonString);
      if (!parsed.state || typeof parsed.state.cash !== 'number') {
        return { success: false, message: 'Неверный формат файла сохранения' };
      }
      const migrated = this.migrateSaveData(parsed);
      gameState.setState(migrated);
      this.saveGame();
      return { success: true, message: 'Импорт успешно выполнен' };
    } catch (err) {
      return { success: false, message: 'Ошибка парсинга JSON: невалидные данные' };
    }
  }
}

export const saveSystem = new SaveManager();
