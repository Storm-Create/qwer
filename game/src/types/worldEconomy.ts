/**
 * Business Empire: Ultimate
 * World Economy & Macroeconomics TypeScript Contracts
 */

export interface MacroIndicators {
  inflation: number; // Annual inflation rate in % (e.g. 4.2%)
  interestRate: number; // Central bank key interest rate in % (e.g. 5.5%)
  consumerConfidence: number; // Consumer confidence index (base 100, range 20 - 180)
  unemployment: number; // Unemployment rate in % (e.g. 4.8%)
  economicGrowth: number; // Annual GDP / economic growth in % (e.g. +2.8%)
  oilPrice: number; // Oil price per barrel in USD (e.g. 78.50)
  transportCost: number; // Freight and transport cost index / multiplier (base 1.00)
}

export interface MacroHistoryPoint {
  day: number;
  dateStr: string;
  inflation: number;
  interestRate: number;
  consumerConfidence: number;
  unemployment: number;
  economicGrowth: number;
  oilPrice: number;
  transportCost: number;
}

export type EventSeverity = 'minor' | 'moderate' | 'major' | 'critical' | 'boom';

export type EventCategory = 
  | 'macroeconomics'
  | 'monetary_policy'
  | 'energy_commodities'
  | 'logistics_supply'
  | 'industry_tech'
  | 'retail_consumer'
  | 'real_estate'
  | 'geopolitics';

export interface EconomicImpactModifiers {
  inflationDelta?: number; // Added to inflation (%)
  interestRateDelta?: number; // Added to interest rate (%)
  consumerConfidenceDelta?: number; // Added to confidence index
  unemploymentDelta?: number; // Added to unemployment (%)
  economicGrowthDelta?: number; // Added to growth rate (%)
  oilPricePercentChange?: number; // Multiplier change on oil price (e.g. +0.25 for +25%)
  transportCostPercentChange?: number; // Multiplier change on freight cost (e.g. +0.15)
  
  // Specific Sector Operational Multipliers (1.0 = normal)
  retailSalesMultiplier?: number; // e.g. 1.20 (+20% retail store footfall)
  productionCostMultiplier?: number; // e.g. 1.15 (+15% factory raw material/energy expenses)
  factoryOutputMultiplier?: number; // e.g. 0.85 (-15% manufacturing output)
  realEstateDemandMultiplier?: number; // e.g. 1.10 (+10% property occupancy/rent)
  carSalesMultiplier?: number; // e.g. 1.25 (+25% dealership demand)
  bankLoanRateModifier?: number; // e.g. +0.02 (+2% on loan APR)
  stockMarketSentiment?: number; // e.g. +0.05 (+5% general stock market drift)
  commodityCategoryPriceMod?: {
    category: string;
    multiplier: number; // e.g. 'Нефть': 1.30, 'Электроника': 1.40
  }[];
}

export interface EconomicEventDefinition {
  id: string;
  title: string;
  category: EventCategory;
  severity: EventSeverity;
  icon: string;
  description: string;
  consequences: string[]; // Explicit list of real consequences
  durationDaysMin: number;
  durationDaysMax: number;
  modifiers: EconomicImpactModifiers;
  newsHeadline: string;
  newsBody: string;
  breakingQuote?: string;
  suggestedAction?: string;
}

export interface ActiveEconomicEvent {
  id: string;
  definitionId: string;
  title: string;
  category: EventCategory;
  severity: EventSeverity;
  icon: string;
  description: string;
  consequences: string[];
  startDay: number;
  durationDays: number;
  remainingDays: number;
  modifiers: EconomicImpactModifiers;
  newsHeadline: string;
  newsBody: string;
}

export interface MacroNewsItem {
  id: string;
  day: number;
  timestamp: number;
  headline: string;
  summary: string;
  category: EventCategory;
  severity: EventSeverity;
  icon: string;
  isBreaking: boolean;
  eventId?: string;
  impactMetrics: {
    label: string;
    value: string;
    trend: 'up' | 'down' | 'neutral';
    isPositive: boolean;
  }[];
}

export interface CentralBankState {
  targetInflation: number; // Default 2.5%
  nextMeetingDays: number; // Days until next rate decision
  sentiment: 'dovish' | 'neutral' | 'hawkish';
  lastDecisionSummary: string;
  projectedRateChange: number; // e.g. +0.25%, 0.0%, -0.50%
}

export type MacroCyclePhase = 'expansion' | 'peak' | 'recession' | 'recovery';

export interface WorldEconomyState {
  indicators: MacroIndicators;
  baseIndicators: MacroIndicators;
  history: MacroHistoryPoint[];
  activeEvents: ActiveEconomicEvent[];
  newsFeed: MacroNewsItem[];
  centralBank: CentralBankState;
  economicCyclePhase: MacroCyclePhase;
  lastEventSpawnDay: number;
}
