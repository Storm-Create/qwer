/**
 * Business Empire: Ultimate
 * Holding, Corporate Conglomerate, M&A, IPO & Endgame Subsystem Types
 */

import { MacroCyclePhase } from './worldEconomy';

export type BusinessBranchType =
  | 'retail'        // Магазины
  | 'automotive'    // Автосалоны и автобизнес
  | 'industrial'    // Заводы и фабрики
  | 'warehouses'    // Склады
  | 'logistics'     // Логистические компании и автопарки
  | 'real_estate'   // Недвижимость
  | 'investments';  // Инвестиции и акции

export interface HoldingBranchSummary {
  type: BusinessBranchType;
  name: string;
  count: number;
  totalValuation: number;
  dailyRevenue: number;
  dailyExpense: number;
  dailyProfit: number;
  synergyBoostPercent: number;
  description: string;
}

export interface HoldingSynergy {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  requiredBranches: BusinessBranchType[];
  bonusType: 'revenue' | 'logistics_discount' | 'tax_reduction' | 'production_speed' | 'brand_reputation';
  bonusValuePercent: number;
}

export interface SubsidiaryCompany {
  id: string;
  name: string;
  sector: string;
  ceoName: string;
  foundedDay: number;
  capital: number;
  valuation: number;
  dailyRevenue: number;
  dailyExpenses: number;
  dailyProfit: number;
  marketShare: number;
  ownershipPercent: number; // 100% for founded, or acquired %
  status: 'active' | 'expanding' | 'restructuring';
  acquiredFromAIId?: string;
  consolidatedBranches: BusinessBranchType[];
  assetCount: number;
  employees: number;
}

export interface CompanyValuationBreakdown {
  companyId: string;
  companyName: string;
  netWorth: number;
  annualRevenue: number;
  annualProfit: number;
  tangibleAssets: number;
  debt: number;
  marketConditionsMultiplier: number;
  cyclePhase: MacroCyclePhase;
  finalValuation: number;
  pricePerShare?: number;
  buyout100Price: number;
  controlling51Price: number;
  minority25Price: number;
  minority10Price: number;
}

export interface IPOSystemState {
  isPublic: boolean;
  ipoDay?: number;
  ticker: string;
  companyName: string;
  sharesOutstanding: number;
  publicFloatPercent: number; // e.g. 25% (25% owned by market, 75% by player)
  playerShares: number;
  publicShares: number;
  ipoPrice: number;
  currentSharePrice: number;
  previousSharePrice: number;
  priceHistory: number[];
  marketCap: number;
  capitalRaisedAtIPO: number;
  quarterlyDividendPerShare: number;
  dividendYield: number;
  shareholderSatisfaction: number; // 0-100
  quarterlyProfitTarget: number;
  currentQuarterProfit: number;
  peRatio: number;
}

export type MegacorpTier = 1 | 2 | 3 | 4 | 5;

export interface MegacorpTierInfo {
  tier: MegacorpTier;
  title: string;
  requiredNetWorth: number;
  perks: string[];
  globalInfluenceScore: number;
}

export interface GlobalTradeRoute {
  id: string;
  name: string;
  originHub: string;
  destinationHub: string;
  commodityType: string;
  investmentCost: number;
  dailyProfit: number;
  requiredMegacorpTier: MegacorpTier;
  active: boolean;
  unlocked: boolean;
  riskFactorPercent: number;
  fleetCapacityTons: number;
}

export interface GlobalInvestment {
  id: string;
  name: string;
  country: string;
  category: 'sovereign_bonds' | 'infrastructure' | 'space_tech' | 'energy_grid' | 'ai_supercluster';
  investmentCost: number;
  dailyYield: number;
  annualYieldPercent: number;
  minMegacorpTier: MegacorpTier;
  purchased: boolean;
  riskRating: 'AAA' | 'AA' | 'A' | 'BBB';
  description: string;
}

export interface SectorMonopolyStatus {
  sectorId: string;
  sectorName: string;
  playerMarketShare: number; // 0-100%
  topCompetitorShare: number;
  monopolyTier: 'none' | 'oligopoly' | 'dominant' | 'monopoly' | 'absolute_hegemony';
  monopolyBonusRevenuePercent: number;
  antiTrustRisk: number; // 0-100%
  lobbyingBudgetDaily: number;
}

export interface HoldingState {
  established: boolean;
  establishedDay: number;
  name: string;
  motto: string;
  headquartersCity: string;
  level: number;
  holdingTreasury: number;
  subsidiaries: SubsidiaryCompany[];
  synergies: HoldingSynergy[];
  ipo: IPOSystemState;
  megacorpTier: MegacorpTier;
  globalTradeRoutes: GlobalTradeRoute[];
  globalInvestments: GlobalInvestment[];
  sectorMonopolies: SectorMonopolyStatus[];
  antiTrustLobbyingActive: boolean;
  totalConsolidatedNetWorth: number;
  totalConsolidatedDailyRevenue: number;
  totalConsolidatedDailyProfit: number;
}
