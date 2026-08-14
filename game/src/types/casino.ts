/**
 * Business Empire: Ultimate
 * Casino Empire Subsystem — TypeScript Definitions & Engine Interfaces
 */

export type CasinoCategory =
  | 'hot'
  | 'slots'
  | 'anime'
  | 'cyberpunk'
  | 'cars'
  | 'fantasy'
  | 'scifi'
  | 'horror'
  | 'pirates'
  | 'sports'
  | 'arcade'
  | 'collection'
  | 'boss'
  | 'racing'
  | 'cards'
  | 'roulette'
  | 'poker'
  | 'dice'
  | 'gacha'
  | 'wheel'
  | 'crash'
  | 'vip'
  | 'favorites'
  | 'recent';

export type CasinoGameCategory = CasinoCategory;

export type CasinoGameEngineType =
  | 'slot'
  | 'blackjack'
  | 'roulette'
  | 'poker'
  | 'baccarat'
  | 'dice'
  | 'crash'
  | 'wheel'
  | 'boss'
  | 'racing'
  | 'card_battle'
  | 'gacha'
  | 'arcade';

export type GameVolatility = 'low' | 'medium' | 'high' | 'extreme';

export type VipTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Royal';

export type CollectionRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export interface CasinoCurrencyTransaction {
  id: string;
  timestamp: number;
  type:
    | 'buy_cc'
    | 'sell_cc'
    | 'game_win'
    | 'game_loss'
    | 'tournament_reward'
    | 'mission_reward'
    | 'jackpot_win'
    | 'vip_cashback'
    | 'business_dividend'
    | 'bonus_cc'
    | 'wager'
    | 'case_open'
    | 'skin_sale'
    | 'auction_bid'
    | 'upgrade'
    | 'crafting';
  amountCash?: number;
  amountCC: number;
  feePercent?: number;
  description: string;
  balanceCCAfter: number;
}

export interface CasinoGameDefinition {
  id: string;
  name: string;
  category: CasinoCategory;
  theme: string;
  engineType: CasinoGameEngineType;
  minBet: number; // in Casino Coins (CC)
  maxBet: number;
  rtp: number; // e.g. 96.5%
  volatility: GameVolatility;
  hasJackpot: boolean;
  jackpotType?: 'mini' | 'major' | 'mega';
  popularity: number; // 0 to 100
  activePlayersOnline: number;
  biggestWinMultiplier: number;
  thumbnailEmoji: string;
  bannerGradient: string;
  tag?: string; // 'HOT', 'NEW', 'VIP', 'JACKPOT', 'EXCLUSIVE'
  description: string;
  rules: string[];
  features?: string[];
}

export interface ProgressiveJackpotPool {
  mini: number;
  major: number;
  mega: number;
  lastUpdated: number;
}

export interface JackpotWinnerRecord {
  id: string;
  timestamp: number;
  jackpotType: 'mini' | 'major' | 'mega';
  amountCC: number;
  winnerName: string;
  gameId: string;
  gameName: string;
}

export interface CasinoDailyMission {
  id: string;
  title: string;
  description: string;
  category: CasinoCategory | 'general';
  targetCount: number;
  currentCount: number;
  rewardCC: number;
  rewardXP: number;
  completed: boolean;
  claimed: boolean;
}

export interface CasinoTournament {
  id: string;
  title: string;
  gameCategory: CasinoCategory;
  entryFeeCC: number;
  prizePoolCC: number;
  durationDays: number;
  endDay: number;
  participantsCount: number;
  playerScore: number;
  playerRank: number;
  leaderboard: { rank: number; name: string; score: number; prizeCC: number; isPlayer?: boolean }[];
  status: 'active' | 'finished';
}

export interface CollectionItem {
  id: string;
  name: string;
  category: 'avatar' | 'talisman' | 'skin' | 'car' | 'trophy';
  rarity: CollectionRarity;
  bonusType: 'xp_boost' | 'cashback_boost' | 'luck_boost' | 'reputation_boost' | 'aesthetic';
  bonusValue: number; // e.g. 0.05 (+5%)
  icon: string;
  description: string;
  unlockedAt?: number;
}

// ----------------------------------------------------
// CASINO BUSINESS SUBSYSTEM (OWNING AND RUNNING CASINOS)
// ----------------------------------------------------

export type CasinoVenueSize = 'small' | 'medium' | 'large' | 'mega_resort';

export interface CasinoHall {
  id: string;
  type: 'slot_hall' | 'vip_room' | 'poker_room' | 'blackjack_room' | 'roulette_hall' | 'high_roller_room' | 'jackpot_room';
  name: string;
  level: number; // 1 to 5
  capacity: number; // guest capacity
  unlocked: boolean;
  upgradeCost: number;
  dailyMaintenance: number;
}

export interface CasinoMachineUnit {
  id: string;
  gameId: string;
  name: string;
  type: 'slot' | 'roulette' | 'blackjack' | 'poker' | 'wheel' | 'arcade';
  tier: number; // 1 to 4
  purchasePrice: number;
  dailyMaintenance: number;
  guestCapacity: number;
  avgDailyTurnover: number;
  houseEdgePercent: number; // e.g. 3.5%
  popularityRating: number;
}

export type CasinoStaffRole =
  | 'dealer'
  | 'manager'
  | 'security'
  | 'bartender'
  | 'cleaner'
  | 'vip_host'
  | 'marketing_head'
  | 'accountant'
  | 'general_director';

export interface CasinoStaffMember {
  id: string;
  name: string;
  role: CasinoStaffRole;
  salaryDaily: number;
  skill: number; // 1 to 100
  morale: number; // 1 to 100
  efficiency: number; // 0.5 to 1.5
  level: number;
}

export interface CasinoMarketingCampaign {
  id: string;
  name: string;
  type: 'local' | 'internet' | 'tv' | 'influencers' | 'luxury' | 'international';
  costDaily: number;
  trafficBoostPercent: number;
  vipVisitorBoostPercent: number;
  reputationBoostDaily: number;
  active: boolean;
}

export interface CasinoSpecialEvent {
  id: string;
  title: string;
  description: string;
  type: 'jackpot_week' | 'vip_weekend' | 'high_roller_night' | 'slot_festival' | 'poker_open' | 'anniversary';
  durationDaysRemaining: number;
  trafficMultiplier: number;
  revenueMultiplier: number;
  highRollerChanceMultiplier: number;
}

export interface OwnedCasinoBusiness {
  id: string;
  name: string;
  venueSize: CasinoVenueSize;
  cityLocation: string;
  reputation: number; // 0 to 100
  securityRating: number; // 0 to 100
  halls: CasinoHall[];
  installedMachines: CasinoMachineUnit[];
  staff: CasinoStaffMember[];
  marketing: CasinoMarketingCampaign[];
  activeEvents: CasinoSpecialEvent[];
  stats: {
    dailyVisitors: number;
    dailyVipVisitors: number;
    dailyHighRollers: number;
    dailyTotalWagered: number;
    dailyGrossRevenue: number;
    dailyPayouts: number;
    dailyNetGamingRevenue: number;
    dailyOperatingExpenses: number;
    dailyNetProfit: number;
    totalHistoricalProfit: number;
  };
  limits: {
    minTableBet: number;
    maxTableBet: number;
    highRollerLimit: number;
  };
}

export interface AiCasinoCompetitor {
  id: string;
  name: string;
  city: string;
  reputation: number;
  marketSharePercent: number;
  dailyRevenue: number;
  venueSize: CasinoVenueSize;
}

// ----------------------------------------------------
// ROOT STATE FOR CASINO SUBSYSTEM
// ----------------------------------------------------

export interface CasinoSubsystemState {
  // Virtual Currency
  casinoCoins: number;
  exchangeRate: number; // 1 USD = X Casino Coins (default 1.0)
  buyFeePercent: number; // e.g. 5% fee on purchasing CC
  sellFeePercent: number; // e.g. 8% fee on cashing out to Business USD
  transactions: CasinoCurrencyTransaction[];

  // Player Progression
  xp: number;
  level: number;
  vipTier: VipTier;
  vipPoints: number;
  totalWageredCC: number;
  totalWonCC: number;
  totalLostCC: number;
  biggestSingleWinCC: number;
  gamesPlayedCount: number;

  // Favorites & History
  favorites: string[];
  recentGameIds: string[];

  // Live Systems
  jackpotPool: ProgressiveJackpotPool;
  jackpotHistory: JackpotWinnerRecord[];
  dailyMissions: CasinoDailyMission[];
  tournaments: CasinoTournament[];
  ownedCollections: CollectionItem[];

  // Business Side
  ownedCasinos: OwnedCasinoBusiness[];
  competitors: AiCasinoCompetitor[];
  businessStatistics: {
    totalCasinosOwned: number;
    totalCasinoValuation: number;
    cumulativeBusinessProfit: number;
    playerMarketShare: number;
  };

  lastDailyResetDay: number;
}
