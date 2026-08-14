/**
 * Business Empire: Ultimate
 * AI Competitor Tycoons & Rival Corporations Type Definitions
 */

export type AIStrategy =
  | 'aggressive'
  | 'conservative'
  | 'trading'
  | 'industrial'
  | 'retail'
  | 'investment';

export type AICreditRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'D';

export type AIActionType =
  | 'buy_goods'
  | 'sell_goods'
  | 'open_store'
  | 'build_factory'
  | 'buy_car'
  | 'buy_real_estate'
  | 'take_loan'
  | 'repay_loan'
  | 'buy_stock'
  | 'hire_staff'
  | 'bankruptcy'
  | 'restructure';

export interface AICompetitorAction {
  id: string;
  day: number;
  timestamp: number;
  companyId: string;
  companyName: string;
  actionType: AIActionType;
  title: string;
  description: string;
  amount: number;
  impact: string;
  icon: string;
}

export interface AICompetitorFinancialSnapshot {
  day: number;
  netWorth: number;
  revenue: number;
  profit: number;
  cash: number;
}

export interface AICompetitorCompany {
  id: string;
  name: string;
  ceoName: string;
  avatarIcon: string;
  color: string;
  sector: string;
  strategy: AIStrategy;
  description: string;
  
  // Financial State
  cash: number;
  netWorth: number;
  dailyRevenue: number;
  dailyExpenses: number;
  dailyProfit: number;
  totalRevenue: number;
  totalProfit: number;
  debt: number;
  creditRating: AICreditRating;
  
  // Physical Assets & Operations
  employees: number;
  stores: number;
  factories: number;
  realEstateCount: number;
  carsCount: number;
  
  // Market standing
  marketShare: number; // 0-100%
  sectorDominance: number; // 0-100%
  reputation: number; // 0-100
  
  // Solvency & Risk
  isBankrupt: boolean;
  bankruptDaysCount: number;
  consecutiveLossDays: number;
  status: 'dominant' | 'growing' | 'stable' | 'distressed' | 'bankrupt';

  // Portfolios
  inventory: Record<string, number>; // commodityId -> qty
  stockPortfolio: Record<string, number>; // ticker -> shares
  
  // Historical data
  history: AICompetitorFinancialSnapshot[];
  recentActions: AICompetitorAction[];
}

export interface AICompetitorMarketState {
  companies: AICompetitorCompany[];
  globalMarketVolume: number;
  sectorMarketVolumes: Record<string, number>;
  actionFeed: AICompetitorAction[];
  lastUpdateDay: number;
}

export interface LeaderboardRankingItem {
  rank: number;
  isPlayer: boolean;
  id: string;
  name: string;
  ceoName: string;
  avatarIcon: string;
  color: string;
  sector: string;
  strategy: AIStrategy | 'player';
  netWorth: number;
  dailyRevenue: number;
  dailyProfit: number;
  debt: number;
  employees: number;
  stores: number;
  factories: number;
  marketShare: number;
  creditRating: string;
  isBankrupt: boolean;
  status: 'dominant' | 'growing' | 'stable' | 'distressed' | 'bankrupt';
}
