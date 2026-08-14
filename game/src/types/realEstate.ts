/**
 * Business Empire: Ultimate
 * Real Estate Subsystem Types & Interfaces
 */

export type RealEstateType =
  | 'apartment'
  | 'house'
  | 'office'
  | 'shop'
  | 'warehouse'
  | 'mall'
  | 'factory';

export interface RealEstateProperty {
  id: string;
  name: string;
  type: RealEstateType;
  location: string;
  districtId: string;
  level: number; // 1 to 5
  purchasePrice: number;
  marketValue: number;
  baseMarketValue: number;
  rent: number; // Daily rental revenue at full occupancy
  maintenance: number; // Daily maintenance and utility cost
  occupancy: number; // 0 - 100%
  isRented: boolean;
  condition: number; // 0 - 100%
  acquiredDay: number;
  totalRentCollected: number;
  priceHistory: number[];
  perks: string[];
  description: string;
  imageEmoji: string;
}

export interface RealEstateCatalogItem {
  id: string;
  name: string;
  type: RealEstateType;
  location: string;
  districtId: string;
  basePrice: number;
  baseRentDaily: number;
  baseMaintenanceDaily: number;
  baseOccupancy: number;
  minLevelRequired?: number;
  perks: string[];
  description: string;
  imageEmoji: string;
}

export interface RealEstateMarketState {
  marketIndex: number; // 100 = baseline
  marketIndexHistory: number[];
  districtMultipliers: Record<string, number>;
  trend: 'booming' | 'growing' | 'stable' | 'cooling' | 'recession';
  annualGrowthRate: number; // e.g. +0.08 (+8%/year)
  lastUpdatedDay: number;
}

export interface RealEstateUpgradeTier {
  level: number;
  name: string;
  costMultiplier: number; // multiplier of current marketValue (e.g. 0.20 = 20% of value)
  valueBonusMultiplier: number; // e.g. +30% to marketValue
  rentBonusMultiplier: number; // e.g. +35% to rent
  maintenanceReduction: number; // e.g. -10% maintenance
  occupancyBonus: number; // e.g. +10%
  description: string;
}
