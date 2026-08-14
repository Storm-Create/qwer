/**
 * Business Empire: Ultimate
 * Core TypeScript Definitions & Architecture Contracts
 */

import { AutomotiveState } from './automotive';
import { RetailStore } from './retail';
import { IndustrialState, IndustrialFactory } from './production';
import { StaffSubsystemState } from './staff';
import { RealEstateProperty, RealEstateMarketState } from './realEstate';
import { BankSubsystemState } from './bank';
import { StockExchangeState } from './stockExchange';
import { WorldEconomyState } from './worldEconomy';
import { CasinoSubsystemState } from './casino';
import { CasesSubsystemState } from './cases';
import { EsportsSubsystemState } from './esports';

export type TimeSpeed = 0 | 1 | 2 | 4 | 8;

export type NavigationTab = 
  | 'dashboard'
  | 'world_economy'
  | 'trading'
  | 'cars'
  | 'businesses'
  | 'warehouses'
  | 'production'
  | 'staff'
  | 'real_estate'
  | 'stocks'
  | 'bank'
  | 'competitors'
  | 'technology'
  | 'corporation'
  | 'casino'
  | 'cases'
  | 'esports'
  | 'clicker';

export interface GameTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  totalHours: number;
  totalDays: number;
}

export type TransactionType = 'revenue' | 'expense' | 'investment' | 'loan' | 'tax' | 'seed';

export interface Transaction {
  id: string;
  timestamp: number;
  gameTime: GameTime;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  balanceAfter: number;
}

export interface FinancialSnapshot {
  timestamp: number;
  gameTime: GameTime;
  cash: number;
  netWorth: number;
  dailyRevenue: number;
  dailyExpenses: number;
  dailyProfit: number;
}

export type CommodityCategory =
  | 'Продукты'
  | 'Напитки'
  | 'Одежда'
  | 'Обувь'
  | 'Электроника'
  | 'Смартфоны'
  | 'Компьютеры'
  | 'Комплектующие'
  | 'Бытовая техника'
  | 'Мебель'
  | 'Стройматериалы'
  | 'Инструменты'
  | 'Автозапчасти'
  | 'Шины'
  | 'Масла'
  | 'Металлы'
  | 'Нефть'
  | 'Пластик'
  | 'Древесина'
  | 'Хлопок'
  | 'Зерно';

export type CommodityQuality =
  | 'Эконом'
  | 'Стандарт'
  | 'Премиум'
  | 'Оригинал'
  | 'OEM'
  | 'Китай'
  | 'Промышленный'
  | 'Люкс';

export interface MarketCommodity {
  id: string;
  name: string;
  category: CommodityCategory;
  basePrice: number;
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
  demand: number; // 0.2 to 2.5
  supply: number; // 0.2 to 2.5
  volatility: number; // 0.015 to 0.12
  quality: CommodityQuality;
  weight: number; // kg per unit
  volume: number; // m3 per unit
  storageCost: number; // $ per unit per day
  seasonality: number[]; // 12 monthly factors (0.7 to 1.4)
  priceHistory: number[]; // exactly 30 points
  unit: string;
  trend: number; // -1 to +1
  change24h: number; // percentage change from previous day
  description?: string;
}

export interface InventoryItem {
  id: string; // matches MarketCommodity.id
  name: string;
  category: CommodityCategory;
  quantity: number;
  totalCost: number; // total capital spent on current remaining volume
  avgBuyPrice: number; // weighted average buy price
  currentMarketPrice: number;
  weight: number;
  volume: number;
  quality: CommodityQuality;
  unit: string;
}

export interface TradeRecord {
  id: string;
  timestamp: number;
  gameTime: GameTime;
  commodityId: string;
  commodityName: string;
  category: CommodityCategory;
  type: 'BUY' | 'SELL';
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  avgBuyPrice?: number;
  realizedProfit?: number;
  marginPercent?: number;
  balanceAfter: number;
}

export interface Warehouse {
  id: string;
  name: string;
  level: number; // 1 to 8: 100, 250, 500, 1000, 2500, 5000, 10000, 25000
  tier?: number;
  capacity: number; // volume capacity in m3 / units
  usedCapacity: number; // current used volume
  usedWeight: number; // current used weight in kg
  maxWeight: number; // max weight capacity in kg
  rent: number; // daily rent cost
  maintenance: number; // daily maintenance cost
  storageCostDaily?: number; // daily cost for held goods
  rentCostDaily?: number; // legacy alias
  location: string;
  inventory: InventoryItem[];
}

export interface DeliveryItem {
  commodityId: string;
  name: string;
  quantity: number;
  unit: string;
  weight: number;
  volume: number;
  avgBuyPrice: number;
  quality: CommodityQuality;
}

export interface Delivery {
  id: string;
  name: string;
  origin: string;
  destination: string;
  sourceWarehouseId?: string;
  targetWarehouseId: string;
  targetBusinessId?: string;
  vehicleId?: string;
  vehicleName: string;
  items: DeliveryItem[];
  totalVolume: number;
  totalWeight: number;
  distanceKm: number;
  totalHours: number;
  remainingHours: number;
  cost: number;
  status: 'in_transit' | 'completed' | 'cancelled';
  createdAt: number;
}

export interface AutoSupplyRoute {
  id: string;
  name: string;
  active: boolean;
  sourceType: 'market' | 'warehouse';
  sourceWarehouseId?: string;
  targetWarehouseId: string;
  targetBusinessId?: string;
  commodityId: string;
  commodityName?: string;
  batchQuantity: number;
  minThreshold: number; // Trigger purchase when stock < minThreshold
  vehicleId?: string;
  maxPriceLimit?: number;
  lastExecutedDay?: number;
  createdAt?: number;
}

export interface LogisticsTruck {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: 'van' | 'medium' | 'heavy' | 'road_train' | 'train' | 'plane';
  volumeCapacity: number; // m3
  weightCapacity: number; // kg
  speedKmH: number;
  purchasePrice: number;
  maintenanceDaily: number;
  fuelCostPerKm: number;
  status: 'idle' | 'in_transit' | 'maintenance';
  currentLocation: string;
  assignedDeliveryId?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: 'personal' | 'commercial' | 'fleet';
  condition: number; // 0 to 100%
  purchasePrice: number;
  marketValue: number;
  maintenanceCostDaily: number;
  status: 'idle' | 'in_transit' | 'for_sale';
}

export type BusinessCategory = 'retail' | 'factory' | 'logistics' | 'service' | 'tech';

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  level: number;
  baseDailyRevenue: number;
  baseDailyExpense: number;
  employeesCount: number;
  managerHired: boolean;
  status: 'active' | 'suspended' | 'upgrading';
  upgradeProgress?: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  salaryDaily: number;
  skillLevel: number;
  efficiencyMultiplier: number;
  businessId?: string;
}

export interface Property {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'industrial' | 'land';
  purchasePrice: number;
  currentValuation: number;
  rentalIncomeDaily: number;
  maintenanceDaily: number;
  isRented: boolean;
}

export interface StockHolding {
  symbol: string;
  shares: number;
  avgPrice: number;
  totalInvested: number;
}

export interface StockMarketItem {
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  previousPrice: number;
  priceHistory: number[];
  volatility: number;
  trend: number;
  dividendYield: number;
}

export interface Loan {
  id: string;
  name: string;
  principal: number;
  remainingAmount: number;
  dailyInterestRate: number;
  dailyPayment: number;
  termDays: number;
  daysRemaining: number;
}

export interface Technology {
  id: string;
  name: string;
  category: string;
  cost: number;
  researchHours: number;
  researched: boolean;
  progressHours: number;
  effects: Record<string, number>;
  description: string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: 'market' | 'company' | 'regulatory' | 'opportunity';
  impactDurationDays: number;
  daysLeft: number;
  multiplierEffects: Record<string, number>;
  timestamp: number;
}

export interface GameStatistics {
  totalEarned: number;
  totalSpent: number;
  transactionsCount: number;
  businessesFounded: number;
  daysPlayed: number;
  highestNetWorth: number;
  dealsClosed: number;
  seedContractsCompleted: number;
  totalTradeVolume: number;
  totalTradeProfit: number;
  tradesExecuted: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  autoSaveIntervalSec: number;
  compactNumbers: boolean;
  currency: string;
  language: 'ru' | 'en';
}

export interface CorporationState {
  name: string;
  established: boolean;
  sharesPublic: boolean;
  creditRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
  valuationMultiplier: number;
  taxRate: number; // e.g., 0.15 (15%)
  executiveBoard: {
    ceo: string;
    cfo?: string;
    coo?: string;
    cto?: string;
  };
}

export interface ClickerSubsystemState {
  clickPowerLevel: number;
  criticalChanceLevel: number;
  autoClickerLevel: number;
  synergyLevel: number;
  totalClicks: number;
  totalClickEarnings: number;
}

export interface GameState {
  cash: number;
  netWorth: number;
  gameTime: GameTime;
  timeSpeed: TimeSpeed;
  inventory: InventoryItem[];
  warehouses: Warehouse[];
  deliveries: Delivery[];
  autoSupplyRoutes: AutoSupplyRoute[];
  trucks: LogisticsTruck[];
  cars: Vehicle[];
  automotive?: AutomotiveState;
  retailStores?: RetailStore[];
  industrial?: IndustrialState;
  staff?: StaffSubsystemState;
  realEstate?: {
    properties: RealEstateProperty[];
    market: RealEstateMarketState;
  };
  bank?: BankSubsystemState;
  stockExchange?: StockExchangeState;
  worldEconomy?: WorldEconomyState;
  casino?: CasinoSubsystemState;
  cases?: CasesSubsystemState;
  esports?: EsportsSubsystemState;
  clicker?: ClickerSubsystemState;
  businesses: Business[];
  employees: Employee[];
  properties: Property[];
  stocks: {
    holdings: Record<string, StockHolding>;
    market: StockMarketItem[];
  };
  loans: Loan[];
  technologies: Technology[];
  corporation: CorporationState;
  transactions: Transaction[];
  tradeHistory: TradeRecord[];
  events: GameEvent[];
  statistics: GameStatistics;
  financialHistory: FinancialSnapshot[];
  settings: GameSettings;
  lastSavedTimestamp: number;
}

export interface SaveData {
  saveVersion: number;
  timestamp: number;
  state: GameState;
}

export interface OfflineProgressResult {
  elapsedSeconds: number;
  simulatedHours: number;
  simulatedDays: number;
  earnings: number;
  expenses: number;
  netProfit: number;
  timestamp: number;
}
