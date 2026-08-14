/**
 * Business Empire: Ultimate
 * Comprehensive Retail Subsystem Data Contracts & Types
 */

import { CommodityCategory, CommodityQuality } from './game';

export type RetailStoreType =
  | 'kiosk'
  | 'grocery'
  | 'clothing'
  | 'electronics'
  | 'furniture'
  | 'auto_parts'
  | 'supermarket'
  | 'premium_store';

export type LocationType =
  | 'suburb'
  | 'transit_hub'
  | 'downtown'
  | 'shopping_mall'
  | 'luxury_quarter'
  | 'highway_cluster';

export type EmployeeRole =
  | 'cashier'
  | 'consultant'
  | 'merchandiser'
  | 'store_manager'
  | 'security';

export interface RetailLocationConfig {
  id: LocationType;
  name: string;
  description: string;
  baseFootTraffic: number; // Base daily pedestrians
  rentPerSqMeter: number; // Daily rent per sq.m
  incomeLevel: 'low' | 'medium' | 'high' | 'luxury';
  demographics: {
    budgetShare: number; // 0..1
    standardShare: number; // 0..1
    premiumShare: number; // 0..1
    luxuryShare: number; // 0..1
  };
  preferredCategories: CommodityCategory[];
}

export interface RetailEmployee {
  id: string;
  name: string;
  role: EmployeeRole;
  salaryDaily: number;
  skillLevel: number; // 1 to 10
  morale: number; // 0 to 100
  hiredAtDay: number;
}

export interface StoreProductAutoSupply {
  enabled: boolean;
  sourceWarehouseId: string;
  minThreshold: number; // Reorder when stock < minThreshold
  batchQuantity: number; // Amount to transfer/order
  maxBuyPrice?: number;
}

export interface StoreProductItem {
  id: string; // matches MarketCommodity.id
  commodityId: string;
  name: string;
  category: CommodityCategory;
  quality: CommodityQuality;
  unit: string;
  weight: number;
  volume: number; // m3 per unit
  currentStock: number; // units on shelves & backroom
  maxStockCapacity: number; // max units allowed for this slot
  avgCostPrice: number; // cost basis per unit ($)
  currentMarketPrice: number; // reference wholesale market price
  sellingPrice: number; // retail price set by player ($)
  markupPercent: number; // % markup over cost or market
  discountPercent: number; // temporary promotional discount %
  dailySoldUnits: number; // sold in current day
  dailyRevenue: number; // revenue generated today
  dailyProfit: number; // gross profit generated today
  totalSoldUnits: number;
  totalRevenue: number;
  totalProfit: number;
  autoSupply: StoreProductAutoSupply;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  description: string;
  costDaily: number;
  trafficBoostPercent: number; // e.g. +25%
  reputationBoostDaily: number; // e.g. +0.5
  conversionBoostPercent: number; // e.g. +5%
  active: boolean;
  minStoreLevel: number;
}

export interface StoreEquipmentUpgrade {
  id: string;
  name: string;
  category: 'pos' | 'refrigeration' | 'interior' | 'security' | 'logistics';
  level: number;
  maxLevel: number;
  currentLevel: number;
  cost: number;
  dailyElectricityCost: number;
  benefitsDescription: string;
  conversionBonus: number; // percentage
  serviceSpeedBonus: number; // percentage
  shrinkageReduction: number; // theft/damage reduction %
  spoilageReduction: number; // spoilage reduction %
}

export interface DailyStoreFinancialRecord {
  day: number;
  dateStr: string;
  revenue: number;
  cogs: number; // Cost of Goods Sold
  grossProfit: number;
  salaries: number;
  rent: number;
  electricity: number;
  advertising: number;
  otherExpenses: number;
  netProfit: number;
  customersVisited: number;
  customersPurchased: number;
  conversionRate: number;
  avgTicket: number;
  outOfStockLoss: number;
}

export interface RetailStore {
  id: string;
  name: string;
  type: RetailStoreType;
  level: number; // 1 to 10
  locationId: LocationType;
  areaSqM: number; // Total floor space in sq.m
  salesAreaSqM: number; // Sales floor
  backroomAreaSqM: number; // Storage backroom
  shelvesVolumeCapacity: number; // m3
  backroomVolumeCapacity: number; // m3
  usedVolume: number;
  
  // Personnel
  employees: RetailEmployee[];
  
  // Products & Shelves
  inventory: StoreProductItem[];
  maxProductSlots: number;
  
  // Performance & Customer Metrics
  reputation: number; // 0 to 100
  cleanliness: number; // 0 to 100
  customerSatisfaction: number; // 0 to 100
  dailyCustomers: number;
  dailyPurchases: number;
  dailyAvgTicket: number;
  dailyConversionRate: number;
  outOfStockLossDaily: number;
  
  // Marketing & Campaigns
  activeCampaigns: string[]; // campaign IDs
  
  // Equipment & Systems
  equipment: StoreEquipmentUpgrade[];
  
  // Financial metrics
  dailyRent: number;
  dailyElectricity: number;
  dailySalaries: number;
  dailyAdCost: number;
  dailyRevenue: number;
  dailyCogs: number;
  dailyGrossProfit: number;
  dailyNetProfit: number;
  
  // Lifetime Totals
  totalRevenue: number;
  totalExpenses: number;
  totalNetProfit: number;
  totalCustomersServed: number;
  
  // Historical analytics
  history: DailyStoreFinancialRecord[];
  
  status: 'active' | 'closed' | 'renovating';
  createdAtDay: number;
}

export interface RetailStoreTypeTemplate {
  type: RetailStoreType;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  badgeColor: string;
  initialSetupCost: number;
  baseAreaSqM: number;
  baseShelvesVolume: number;
  baseBackroomVolume: number;
  minEmployees: number;
  recommendedLocations: LocationType[];
  supportedCategories: CommodityCategory[];
  baseTicketMultiplier: number;
  baseMarginExpected: number; // expected % markup
  unlockRequirement?: string;
}
