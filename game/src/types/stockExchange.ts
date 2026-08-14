/**
 * Business Empire: Ultimate
 * Stock Exchange & Capital Markets Subsystem Types
 */

export type StockSector =
  | 'Technology'
  | 'Finance'
  | 'Healthcare'
  | 'Energy'
  | 'Consumer Discretionary'
  | 'Consumer Staples'
  | 'Industrials'
  | 'Telecommunications'
  | 'Utilities'
  | 'Real Estate'
  | 'Materials';

export type MarketRegimeType = 'bull' | 'bear' | 'crisis' | 'rally' | 'crash' | 'neutral';

export interface StockNewsItem {
  id: string;
  ticker: string;
  companyName: string;
  headline: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impactPercent: number; // e.g. +4.5% or -6.2%
  day: number;
}

export interface StockCompany {
  ticker: string;
  name: string;
  sector: StockSector;
  price: number;
  previousPrice: number;
  priceHistory: number[]; // 30-60 points
  marketCap: number; // in $
  revenue: number; // annual $
  profit: number; // annual net profit $
  debt: number; // total debt $
  dividend: number; // annual dividend per share in $
  dividendYield: number; // 0.01 to 0.09 (1% to 9%)
  volatility: number; // beta/volatility 0.015 to 0.09
  sharesOutstanding: number;
  peRatio: number; // P/E
  pbRatio: number; // P/B
  eps: number; // Earnings Per Share
  change24h: number; // $ change
  change24hPercent: number; // % change
  dayLow: number;
  dayHigh: number;
  week52Low: number;
  week52High: number;
  volume: number; // daily volume in shares
  aiCompetitorHoldings: number; // shares held by AI institutional funds
  investorSentiment: number; // -1.0 to 1.0
  country?: string;
  description?: string;
  latestNews?: StockNewsItem;
}

export interface StockHoldingRecord {
  ticker: string;
  shares: number;
  avgBuyPrice: number;
  totalInvested: number;
  totalDividendsReceived: number;
  firstPurchasedDay: number;
  lastPurchasedDay: number;
}

export interface StockTradeOrder {
  id: string;
  day: number;
  timestamp: number;
  ticker: string;
  companyName: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  totalAmount: number;
  avgBuyPrice?: number;
  realizedProfit?: number;
  profitPercent?: number;
}

export interface StockDividendPayout {
  id: string;
  day: number;
  timestamp: number;
  ticker: string;
  companyName: string;
  shares: number;
  perShare: number;
  totalAmount: number;
}

export interface StockMarketRegimeState {
  regime: MarketRegimeType;
  regimeDaysRemaining: number;
  momentum: number; // -1.0 to 1.0
  interestRate: number; // e.g. 0.045
  inflationRate: number; // e.g. 0.028
  marketIndex: number; // composite stock market index (pts)
  indexHistory: number[];
  newsFeed: StockNewsItem[];
  bullTrendDays: number;
  bearTrendDays: number;
}

export interface StockExchangeState {
  companies: StockCompany[];
  holdings: Record<string, StockHoldingRecord>;
  orderHistory: StockTradeOrder[];
  dividendHistory: StockDividendPayout[];
  marketRegime: StockMarketRegimeState;
  totalDividendsEarned: number;
  totalRealizedProfits: number;
  lastSimulatedDay: number;
}
