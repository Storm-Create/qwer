/**
 * Business Empire: Ultimate
 * Game Constants and Balance Formulas
 */

import { GameSettings, GameState } from '../types/game';

export const SAVE_VERSION = 1;
export const STORAGE_KEY = 'business_empire_ultimate_save_v1';

// Time Engine Constants
export const REAL_SECONDS_PER_GAME_DAY = 60; // 1 game day in 60 real seconds at 1x
export const HOURS_PER_DAY = 24;
export const DAYS_PER_MONTH = 30;
export const MONTHS_PER_YEAR = 12;
export const DAYS_PER_YEAR = DAYS_PER_MONTH * MONTHS_PER_YEAR; // 360 days

// 1 game hour in real milliseconds at 1x: (60 * 1000) / 24 = 2500 ms (2.5 sec)
export const MS_PER_GAME_HOUR = (REAL_SECONDS_PER_GAME_DAY * 1000) / HOURS_PER_DAY;

// Maximum offline simulation cap: 12 hours
export const MAX_OFFLINE_SECONDS = 12 * 60 * 60; // 43,200 seconds

// Autosave interval in real seconds
export const DEFAULT_AUTOSAVE_SECONDS = 30;

// Maximum transactions stored in state history to prevent memory explosion
export const MAX_TRANSACTION_HISTORY = 300;
export const MAX_FINANCIAL_SNAPSHOTS = 120;

export const INITIAL_SETTINGS: GameSettings = {
  soundEnabled: true,
  autoSaveIntervalSec: 30,
  compactNumbers: false,
  currency: '$',
  language: 'ru',
};

export const INITIAL_GAME_STATE: GameState = {
  cash: 25000,
  netWorth: 25000,
  gameTime: {
    year: 1,
    month: 1,
    day: 1,
    hour: 8, // Starts at 8:00 AM on Year 1, Month 1, Day 1
    totalHours: 8,
    totalDays: 0,
  },
  timeSpeed: 1,
  inventory: [],
  warehouses: [
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
  ],
  deliveries: [],
  autoSupplyRoutes: [],
  trucks: [
    {
      id: 'trk_starter_gazelle',
      name: 'ГАЗель NEXT (Рефрижератор)',
      brand: 'ГАЗ',
      model: 'NEXT City Box',
      category: 'van',
      volumeCapacity: 14,
      weightCapacity: 1800,
      speedKmH: 90,
      purchasePrice: 18000,
      maintenanceDaily: 25,
      fuelCostPerKm: 0.35,
      status: 'idle',
      currentLocation: 'Москва',
    },
  ],
  cars: [],
  retailStores: [],
  businesses: [],
  employees: [],
  properties: [],
  stocks: {
    holdings: {},
    market: [
      {
        symbol: 'TECH',
        name: 'Apex Technologies',
        sector: 'Technology',
        currentPrice: 142.50,
        previousPrice: 140.00,
        priceHistory: [135, 138, 137, 140, 142.5],
        volatility: 0.04,
        trend: 0.02,
        dividendYield: 0.015,
      },
      {
        symbol: 'RETL',
        name: 'Omni Retail Group',
        sector: 'Consumer Goods',
        currentPrice: 58.20,
        previousPrice: 59.00,
        priceHistory: [62, 60, 59.5, 59.0, 58.2],
        volatility: 0.025,
        trend: -0.01,
        dividendYield: 0.038,
      },
      {
        symbol: 'ENRG',
        name: 'Global Clean Energy',
        sector: 'Energy',
        currentPrice: 88.75,
        previousPrice: 87.10,
        priceHistory: [82, 84, 86, 87.1, 88.75],
        volatility: 0.03,
        trend: 0.015,
        dividendYield: 0.022,
      },
      {
        symbol: 'BANK',
        name: 'United Capital Corp',
        sector: 'Finance',
        currentPrice: 210.00,
        previousPrice: 208.50,
        priceHistory: [200, 204, 206, 208.5, 210],
        volatility: 0.02,
        trend: 0.008,
        dividendYield: 0.045,
      },
    ],
  },
  loans: [],
  technologies: [
    {
      id: 'tech_automation_1',
      name: 'Базовая автоматизация процессов',
      category: 'Оптимизация',
      cost: 15000,
      researchHours: 72,
      researched: false,
      progressHours: 0,
      effects: { revenueMultiplier: 0.08, expenseReduction: 0.05 },
      description: 'Увеличивает выручку предприятий на 8% и снижает операционные издержки на 5%.',
    },
    {
      id: 'tech_logistics_1',
      name: 'Умная складская логистика',
      category: 'Логистика',
      cost: 22000,
      researchHours: 96,
      researched: false,
      progressHours: 0,
      effects: { warehouseCapacityBonus: 0.25, logisticsCostReduction: 0.15 },
      description: 'Расширяет вместимость складов на 25% за счет оптимизации ячеек хранения.',
    },
    {
      id: 'tech_marketing_ai',
      name: 'Алгоритмический маркетинг',
      category: 'Маркетинг',
      cost: 35000,
      researchHours: 120,
      researched: false,
      progressHours: 0,
      effects: { salesVolumeBonus: 0.18 },
      description: 'Увеличивает поток клиентов и объем оптово-розничных продаж на 18%.',
    },
  ],
  corporation: {
    name: 'Vanguard Enterprises',
    established: false,
    sharesPublic: false,
    creditRating: 'BBB',
    valuationMultiplier: 1.0,
    taxRate: 0.13,
    executiveBoard: {
      ceo: 'Основатель (Вы)',
    },
  },
  transactions: [
    {
      id: 'tx_seed_initial',
      timestamp: Date.now(),
      gameTime: { year: 1, month: 1, day: 1, hour: 8, totalHours: 8, totalDays: 0 },
      amount: 25000,
      type: 'seed',
      category: 'Стартовый капитал',
      description: 'Первоначальный капитал для запуска бизнес-империи',
      balanceAfter: 25000,
    },
  ],
  tradeHistory: [],
  events: [],
  statistics: {
    totalEarned: 25000,
    totalSpent: 0,
    transactionsCount: 1,
    businessesFounded: 0,
    daysPlayed: 0,
    highestNetWorth: 25000,
    dealsClosed: 0,
    seedContractsCompleted: 0,
    totalTradeVolume: 0,
    totalTradeProfit: 0,
    tradesExecuted: 0,
  },
  financialHistory: [
    {
      timestamp: Date.now(),
      gameTime: { year: 1, month: 1, day: 1, hour: 8, totalHours: 8, totalDays: 0 },
      cash: 25000,
      netWorth: 25000,
      dailyRevenue: 0,
      dailyExpenses: 0,
      dailyProfit: 0,
    },
  ],
  settings: INITIAL_SETTINGS,
  lastSavedTimestamp: Date.now(),
};
