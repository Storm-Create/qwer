/**
 * Business Empire: Ultimate
 * Case & Skin Empire Subsystem — TypeScript Definitions & Contracts
 */

export type SkinRarity =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Epic'
  | 'Legendary'
  | 'Mythic'
  | 'Ultra Rare'
  | 'Prestige';

export type SkinCondition =
  | 'Factory New'
  | 'Minimal Wear'
  | 'Field-Tested'
  | 'Well-Worn'
  | 'Battle-Scarred';

export type SkinCategory =
  | 'Weapons'
  | 'Knives'
  | 'Gloves'
  | 'Anime'
  | 'Cyberpunk'
  | 'Cars'
  | 'Luxury'
  | 'Artifacts';

export type CaseCategory =
  | 'popular'
  | 'new'
  | 'premium'
  | 'weapons'
  | 'cars'
  | 'anime'
  | 'cyberpunk'
  | 'fantasy'
  | 'luxury'
  | 'events'
  | 'custom';

export interface SkinItem {
  id: string;
  templateId: string;
  name: string;
  weaponType: string; // e.g. "Cyber Katana", "Quantum Rifle", "Hypercar Phantom"
  skinName: string;   // e.g. "Hyperion Void", "Dragon Lore", "Sakura Blossom"
  category: SkinCategory;
  rarity: SkinRarity;
  condition: SkinCondition;
  float: number;      // 0.0000 to 0.9999
  pattern: number;    // 1 to 1000
  isSpecialPattern?: boolean;
  specialPatternName?: string; // e.g. "Gold Genesis", "Blue Gem #1", "Ruby Core", "Emerald Pulse"
  statTrak?: number;
  hasStatTrak?: boolean;
  baseValue: number;  // in CC
  marketValue: number;// in CC
  collectionId: string;
  collectionName: string;
  isFavorite?: boolean;
  isLocked?: boolean;
  craftedByBrand?: string;
  acquiredAt: number;
  origin: 'case_opening' | 'crafting' | 'trade_up' | 'upgrade' | 'auction' | 'market_buy' | 'reward';
  iconEmoji: string;
  gradient: string;
  accentColor: string;
  description: string;
}

export interface SkinTemplate {
  id: string;
  name: string;
  weaponType: string;
  skinName: string;
  category: SkinCategory;
  rarity: SkinRarity;
  baseValue: number; // Base CC value at Factory New
  collectionId: string;
  collectionName: string;
  iconEmoji: string;
  gradient: string;
  accentColor: string;
  description: string;
  lore?: string;
  canBeStatTrak: boolean;
  specialPatterns?: { patternId: number; name: string; multiplier: number }[];
}

export interface CaseDefinition {
  id: string;
  name: string;
  category: CaseCategory;
  theme: string;
  priceCC: number;
  rarity: SkinRarity;
  emoji: string;
  gradient: string;
  accentColor: string;
  description: string;
  itemIds: string[]; // references SkinTemplate.id
  dropRates: Record<SkinRarity, number>; // exact percentage (e.g. { Common: 55, Uncommon: 27, ... })
  isCustomCreated?: boolean;
  creatorBrand?: string;
  totalOpened?: number;
}

export interface UpgradeAttempt {
  id: string;
  timestamp: number;
  inputItemIds: string[];
  inputTotalValue: number;
  targetMultiplier: number;
  targetValue: number;
  winChancePercent: number;
  rollResult: number; // 0.00 to 100.00
  won: boolean;
  rewardItem?: SkinItem;
}

export interface TradeUpContractRecord {
  id: string;
  timestamp: number;
  inputItemIds: string[];
  inputRarity: SkinRarity;
  outputRarity: SkinRarity;
  resultItem: SkinItem;
  averageFloat: number;
}

export interface SkinMarketListing {
  id: string;
  skin: SkinItem;
  sellerId: string;
  sellerName: string;
  isPlayer: boolean;
  priceCC: number;
  listedAt: number;
  expiresAt: number;
}

export type AiCollectorArchetype = 'Collector' | 'Trader' | 'Investor' | 'Whale' | 'Casual';

export interface AiCollector {
  id: string;
  name: string;
  avatar: string;
  archetype: AiCollectorArchetype;
  budgetCC: number;
  preferredCategories: SkinCategory[];
  preferredRarities: SkinRarity[];
  description: string;
}

export interface SkinAuction {
  id: string;
  skin: SkinItem;
  sellerName: string;
  sellerIsPlayer: boolean;
  startingPriceCC: number;
  currentBidCC: number;
  highestBidderId: string;
  highestBidderName: string;
  highestBidderIsPlayer: boolean;
  bidCount: number;
  createdAt: number;
  endsAt: number;
  minNextBidCC: number;
  bidHistory: {
    bidderName: string;
    amountCC: number;
    timestamp: number;
    isPlayer: boolean;
  }[];
}

export interface SkinCraftingRecipe {
  id: string;
  outputTemplateId: string;
  name: string;
  description: string;
  tierRequired: number;
  costCC: number;
  requiredMaterials: {
    resourceName: string; // e.g. "Металлы", "Пластик", "Электроника", "Титановый сплав", "Наноуглерод", "Энергокристалл"
    quantity: number;
    unit: string;
    description: string;
  }[];
  craftDurationSeconds: number;
}

export interface PlayerSkinStudio {
  isCreated: boolean;
  brandName: string;
  tagline: string;
  logoEmoji: string;
  level: number;
  reputation: number; // 0 to 100
  followersCount: number;
  marketSharePercent: number;
  totalRoyaltiesEarnedCC: number;
  dailyRoyaltyIncomeCC: number;
  customCasesCreated: number;
  skinsDesignedCount: number;
  upgradesPurchased: {
    marketingLevel: number;
    materialsDiscountLevel: number;
    dropRateRefinementLevel: number;
    factoryAutomationLevel: number;
  };
}

export interface SkinCollectionDefinition {
  id: string;
  name: string;
  theme: string;
  description: string;
  iconEmoji: string;
  bannerGradient: string;
  itemTemplateIds: string[];
  completionRewardCC: number;
  trophyTitle: string;
  exclusiveRewardTemplateId: string;
}

export interface SkinAchievement {
  id: string;
  title: string;
  description: string;
  iconEmoji: string;
  rewardCC: number;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
}

export interface PriceTrendPoint {
  timestamp: number;
  price: number;
  volume: number;
}

export interface SkinMarketTrend {
  templateId: string;
  currentPrice: number;
  change24hPercent: number;
  volume24h: number;
  history: PriceTrendPoint[];
}

export interface CaseOpenRecord {
  id: string;
  timestamp: number;
  caseId: string;
  caseName: string;
  item: SkinItem;
}

export interface CasesSubsystemState {
  inventory: SkinItem[];
  openedCasesCount: number;
  totalCasesValueCC: number;
  totalSpentOnCasesCC: number;
  
  marketListings: SkinMarketListing[];
  activeAuctions: SkinAuction[];
  completedCollections: string[];
  customCases: CaseDefinition[];
  playerStudio: PlayerSkinStudio;
  
  upgradeHistory: UpgradeAttempt[];
  tradeUpHistory: TradeUpContractRecord[];
  caseOpeningHistory: CaseOpenRecord[];
  achievements: SkinAchievement[];
  
  marketTrends: Record<string, SkinMarketTrend>;
  lastSimulationTick: number;
}
