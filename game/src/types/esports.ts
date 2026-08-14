/**
 * Business Empire: Ultimate
 * Esports Empire — Real Esports System Type Definitions
 */

export type EsportsPlatform = 'PC' | 'Mobile' | 'Cross-platform' | 'Web';

export type EsportsGenre = 
  | 'FPS/Tactical' 
  | 'MOBA' 
  | 'Battle Royale' 
  | 'Strategy/RTS' 
  | 'Card/Autobattler' 
  | 'Sports/Arcade' 
  | 'Chess';

export type EsportsRegion = 
  | 'Europe' 
  | 'CIS' 
  | 'North America' 
  | 'South America' 
  | 'Brazil' 
  | 'Asia' 
  | 'China' 
  | 'Japan' 
  | 'Korea' 
  | 'Middle East' 
  | 'Oceania' 
  | 'Southeast Asia';

export type DisciplineId =
  // Mobile Disciplines
  | 'standoff_2'
  | 'mlbb'
  | 'honor_of_kings'
  | 'arena_of_valor'
  | 'free_fire'
  | 'clash_royale'
  | 'brawl_stars'
  | 'pubg_mobile'
  | 'bgmi'
  | 'cod_mobile'
  | 'garena_free_fire'
  // PC Disciplines
  | 'cs2'
  | 'dota_2'
  | 'lol'
  | 'valorant'
  | 'r6_siege'
  | 'apex_legends'
  | 'starcraft_2'
  | 'overwatch_2'
  | 'rocket_league'
  | 'deadlock'
  // Cross-platform & Web
  | 'hearthstone'
  | 'tft'
  | 'wild_rift'
  | 'fortnite'
  | 'chess_com'
  | 'lichess';

export interface DisciplineInfo {
  id: DisciplineId;
  name: string;
  platform: EsportsPlatform;
  genre: EsportsGenre;
  teamFormat: string; // e.g. "5v5", "4v4", "3v3", "1v1", "Squads (4)"
  rosterSize: number; // Active starting lineup count (e.g. 5 for CS2, 1 for Chess)
  popularity: number; // 0 - 100
  avgViewers: number;
  peakViewers: number;
  prizePoolScale: number; // Base annual prize pool scale in USD
  proTeamsCount: number;
  rating: number; // 1 - 100 discipline prestige
  tournamentsCount: number;
  currentSeason: string;
  iconEmoji: string;
  themeColor: string;
  roles: string[];
  keyAttributes: string[];
  description: string;
}

export interface PlayerAttributes {
  // General Attributes
  aim: number;
  reaction: number;
  strategy: number;
  gameKnowledge: number;
  communication: number;
  teamwork: number;
  mechanics: number;
  consistency: number;
  // Specific disciplines specialty boosts
  utility?: number;       // CS2 / FPS
  positioning?: number;   // CS2 / FPS
  mapAwareness?: number;  // MOBA / Strategy
  farming?: number;       // MOBA
  decisionMaking?: number;// MOBA / Chess
  teamfight?: number;     // MOBA / Hero Shooters
  drafting?: number;      // MOBA / CCG
  movement?: number;      // Brawl Stars / Apex
}

export interface ProPlayer {
  id: string;
  nickname: string;
  realName: string;
  age: number;
  gameId: DisciplineId;
  role: string;
  region: EsportsRegion;
  nationalityEmoji: string;
  rating: number;      // 50 - 99
  potential: number;   // 50 - 99
  salary: number;      // Monthly salary in $
  marketValue: number; // Transfer fee in $
  popularity: number;  // 0 - 100
  form: number;        // 0 - 100
  morale: number;      // 0 - 100
  fatigue: number;     // 0 - 100 (100 = exhausted)
  experience: number;  // 0 - 100
  contractMonths: number;
  attributes: PlayerAttributes;
  teamId: string | null; // null if free agent
  teamName: string | null;
  history: {
    matchesPlayed: number;
    winrate: number;
    mvpAwards: number;
    trophies: number;
    totalEarnings: number;
  };
  loanInfo?: {
    originalTeamId: string;
    originalTeamName: string;
    monthsRemaining: number;
    fee: number;
  };
}

export interface EsportsRoster {
  disciplineId: DisciplineId;
  teamName: string;
  activePlayerIds: string[]; // List of active player IDs
  substitutePlayerIds: string[]; // Bench players
  headCoachId: string | null;
  analystId: string | null;
  teamRating: number;
  form: number;
  morale: number;
  chemistry: number;
  strategy: number;
  experience: number;
  fatigue: number;
  trainingFocus: 'balanced' | 'mechanics' | 'tactics' | 'teamwork' | 'mental' | 'rest';
  winLoss: {
    wins: number;
    losses: number;
    draws: number;
  };
  trophies: number;
  totalEarnings: number;
  regionalRank: number;
  worldRank: number;
  rankingPoints: number;
  scrimStreak: number;
  isParticipatingInTournament: boolean;
  currentTournamentId: string | null;
}

export type StaffRole = 
  | 'head_coach'
  | 'assistant_coach'
  | 'analyst'
  | 'scout'
  | 'manager'
  | 'performance_coach'
  | 'psychologist'
  | 'content_manager'
  | 'smm_manager';

export interface EsportsStaff {
  id: string;
  name: string;
  role: StaffRole;
  rating: number; // 50 - 99
  salary: number; // Monthly $
  experience: number; // 0 - 100
  specialization: string;
  assignedDisciplineId: DisciplineId | 'all';
  bonusEffect: string;
}

export interface GamingHouseFacility {
  level: number; // 1: Apartment Bootcamp, 2: Pro Villa, 3: High-Tech HQ, 4: Global Performance Complex
  name: string;
  monthlyUpkeep: number;
  gamingPCsLevel: number;      // 1-5 (Hardware boost)
  internetLevel: number;       // 1-5 (Ping/Lag reduction)
  equipmentLevel: number;      // 1-5 (Pro Chairs/Monitors)
  analysisRoomLevel: number;   // 1-5 (Tactical learning speed)
  recoveryGymLevel: number;    // 1-5 (Fatigue recovery)
  streamingStudioLevel: number;// 1-5 (Social media / stream rev)
  usedFactoryHardware: boolean; // Synergies with electronics factory
}

export type ArenaTier = 
  | 'small_arena' 
  | 'regional_arena' 
  | 'major_arena' 
  | 'international_arena' 
  | 'world_arena';

export interface EsportsArena {
  tier: ArenaTier;
  name: string;
  level: number;
  seatCapacity: number;
  ticketPrice: number;
  monthlyMaintenance: number;
  vipSuitesLevel: number;
  foodConcessionsLevel: number;
  merchStandsLevel: number;
  adBannersLevel: number;
  fanSatisfaction: number;
  lastMonthRevenue: {
    tickets: number;
    vip: number;
    food: number;
    merch: number;
    ads: number;
    sponsors: number;
    total: number;
  };
}

export type TournamentTier = 
  | 'local' 
  | 'regional' 
  | 'national' 
  | 'international' 
  | 'major' 
  | 'world_championship';

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  roundName: string; // e.g. "Quarter-Finals", "Semi-Finals", "Grand Final"
  teamAId: string;
  teamAName: string;
  teamARating: number;
  teamBId: string;
  teamBName: string;
  teamBRating: number;
  scoreA: number;
  scoreB: number;
  isFinished: boolean;
  winnerId: string | null;
  events: MatchLogEvent[];
  viewers: {
    live: number;
    peak: number;
    avg: number;
  };
  mvpPlayerName?: string;
  roundDetails?: {
    roundNumber: number;
    winner: 'teamA' | 'teamB';
    eventDescription: string;
    scoreAfter: [number, number];
  }[];
}

export interface MatchLogEvent {
  minuteOrRound: number;
  type: 'kill' | 'clutch' | 'ace' | 'objective' | 'teamfight' | 'highlight';
  text: string;
  actorName: string;
  team: 'teamA' | 'teamB';
  viewerSpike?: number;
}

export interface EsportsTournament {
  id: string;
  disciplineId: DisciplineId;
  name: string;
  tier: TournamentTier;
  region: EsportsRegion | 'Global';
  prizePool: number;
  prizes: {
    firstPlace: number;
    secondPlace: number;
    thirdPlace: number;
    participationPrize: number;
  };
  trophyName: string;
  teamsCount: number;
  participantTeamNames: string[];
  status: 'upcoming' | 'ongoing' | 'finished';
  dayStart: number;
  dayEnd: number;
  currentRound: number;
  totalRounds: number;
  matches: TournamentMatch[];
  winnerTeamName: string | null;
  playerOrgResult?: {
    place: number;
    prizeWon: number;
    pointsGained: number;
    mvpAward: boolean;
  };
}

export type SponsorCategory = 
  | 'gaming_hardware'
  | 'smartphones'
  | 'internet_providers'
  | 'energy_drinks'
  | 'cars'
  | 'clothing'
  | 'technology'
  | 'software';

export interface SponsorOffer {
  id: string;
  companyName: string;
  logoEmoji: string;
  category: SponsorCategory;
  tier: 1 | 2 | 3 | 4 | 5;
  monthlyPayment: number;
  tournamentVictoryBonus: number;
  mvpBonus: number;
  minFansRequired: number;
  minWorldRankingRequired: number;
  durationMonths: number;
  monthsRemaining: number;
  isActive: boolean;
}

export interface MerchItem {
  id: string;
  name: string;
  category: 'jerseys' | 'hoodies' | 'caps' | 'mousepads' | 'posters' | 'accessories';
  unitCost: number;
  retailPrice: number;
  stock: number;
  monthlySales: number;
  qualityRating: number; // 1-100
  suppliedByTextileFactory: boolean; // +40% margin synergy
}

export interface MediaChannel {
  followers: number;
  fanBase: number;
  engagementRate: number; // %
  monthlySponsorValue: number;
  videoViewsMonthly: number;
  streamingHoursMonthly: number;
  activeCampaigns: {
    id: string;
    title: string;
    type: 'highlights' | 'vlog' | 'interview' | 'announcement' | 'stream_marathon';
    cost: number;
    fanGain: number;
    hypeDaysRemaining: number;
  }[];
}

export interface WorldRankingEntry {
  rank: number;
  teamId: string;
  teamName: string;
  region: EsportsRegion;
  disciplineId: DisciplineId;
  points: number;
  change: number; // +2, -1, 0
  isPlayerOrg: boolean;
  winLossRate: number;
  trophies: number;
}

export interface EsportsOrganization {
  name: string;
  tag: string;
  logoEmoji: string;
  primaryColor: string;
  level: number; // 1-10
  reputation: number; // 0-100
  foundedYear: number;
  fansCount: number;
  totalPrizeMoneyEarned: number;
  totalTrophiesCount: number;
  worldRankOverall: number;
}

export interface EsportsSubsystemState {
  organization: EsportsOrganization;
  rosters: Record<DisciplineId, EsportsRoster>;
  players: ProPlayer[]; // All players owned by user + free agents / transfer targets in pool
  aiTeams: {
    id: string;
    name: string;
    region: EsportsRegion;
    disciplineId: DisciplineId;
    rating: number;
  }[];
  staff: EsportsStaff[];
  gamingHouse: GamingHouseFacility;
  arena: EsportsArena;
  tournaments: EsportsTournament[];
  sponsors: SponsorOffer[];
  merch: MerchItem[];
  media: MediaChannel;
  rankings: Record<DisciplineId, WorldRankingEntry[]>;
  matchHistory: TournamentMatch[];
  monthlyFinances: {
    prizeMoney: number;
    sponsorIncome: number;
    merchProfit: number;
    ticketSales: number;
    streamingRevenue: number;
    playerSalaries: number;
    staffSalaries: number;
    facilityUpkeep: number;
    transfersSpent: number;
    transfersEarned: number;
    netProfit: number;
  };
  stats: {
    totalTournamentsWon: number;
    totalMajorsWon: number;
    totalWorldChampionships: number;
    totalMatchesPlayed: number;
    totalMatchesWon: number;
    biggestPrizeCheck: number;
  };
}
