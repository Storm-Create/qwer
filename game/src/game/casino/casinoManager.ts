/**
 * Business Empire: Ultimate
 * Casino Manager & Business Operations Engine
 */

import { gameState } from '../gameState';
import {
  CasinoSubsystemState,
  CasinoVenueSize,
  OwnedCasinoBusiness,
  CasinoHall,
  CasinoMachineUnit,
  CasinoStaffMember,
  CasinoMarketingCampaign,
  CasinoDailyMission,
  CasinoTournament,
  CollectionItem,
  VipTier,
  AiCasinoCompetitor,
} from '../../types/casino';

export const INITIAL_CASINO_STATE: CasinoSubsystemState = {
  casinoCoins: 10000,
  exchangeRate: 1.0,
  buyFeePercent: 0.05, // 5% fee when exchanging $ -> CC
  sellFeePercent: 0.08, // 8% fee when cashing out CC -> $
  transactions: [
    {
      id: 'tx_init_cc',
      timestamp: Date.now(),
      type: 'buy_cc',
      amountCash: 10000,
      amountCC: 10000,
      description: 'Приветственный бонус Casino Coins',
      balanceCCAfter: 10000,
    },
  ],
  xp: 0,
  level: 1,
  vipTier: 'Bronze',
  vipPoints: 0,
  totalWageredCC: 0,
  totalWonCC: 0,
  totalLostCC: 0,
  biggestSingleWinCC: 0,
  gamesPlayedCount: 0,
  favorites: ['slot_pharaoh_gold', 'cyber_neon_crash', 'anime_neon_samurai'],
  recentGameIds: [],
  jackpotPool: {
    mini: 50000,
    major: 250000,
    mega: 1000000,
    lastUpdated: Date.now(),
  },
  jackpotHistory: [
    {
      id: 'jackpot_1',
      timestamp: Date.now() - 3600000 * 5,
      jackpotType: 'mini',
      amountCC: 48200,
      winnerName: 'CryptoWhale_77',
      gameId: 'slot_vegas_royale',
      gameName: 'Vegas Royale 777',
    },
    {
      id: 'jackpot_2',
      timestamp: Date.now() - 3600000 * 24,
      jackpotType: 'major',
      amountCC: 285400,
      winnerName: 'CyberNinja_99',
      gameId: 'anime_neon_samurai',
      gameName: 'Neon Samurai',
    },
  ],
  dailyMissions: [
    {
      id: 'mission_spins',
      title: 'Мастер Слотов',
      description: 'Сделайте 15 спинов в любых слотах',
      category: 'slots',
      targetCount: 15,
      currentCount: 0,
      rewardCC: 2500,
      rewardXP: 150,
      completed: false,
      claimed: false,
    },
    {
      id: 'mission_crash',
      title: 'Космический Взлет',
      description: 'Сыграйте 5 раундов в Crash с кэшаутом > 1.5x',
      category: 'crash',
      targetCount: 5,
      currentCount: 0,
      rewardCC: 3000,
      rewardXP: 200,
      completed: false,
      claimed: false,
    },
    {
      id: 'mission_blackjack',
      title: 'Карточный Стратег',
      description: 'Одержите 3 победы в Блэкджек против дилера',
      category: 'cards',
      targetCount: 3,
      currentCount: 0,
      rewardCC: 4000,
      rewardXP: 250,
      completed: false,
      claimed: false,
    },
    {
      id: 'mission_boss',
      title: 'Охотник на Боссов',
      description: 'Нанесите 5,000 урона в битве с Боссом',
      category: 'boss',
      targetCount: 5000,
      currentCount: 0,
      rewardCC: 5000,
      rewardXP: 300,
      completed: false,
      claimed: false,
    },
  ],
  tournaments: [
    {
      id: 'tourn_weekly_grand',
      title: 'Grand High Roller Championship',
      gameCategory: 'slots',
      entryFeeCC: 1000,
      prizePoolCC: 500000,
      durationDays: 7,
      endDay: 15,
      participantsCount: 128,
      playerScore: 0,
      playerRank: 42,
      leaderboard: [
        { rank: 1, name: 'Sovereign_VIP', score: 145200, prizeCC: 150000 },
        { rank: 2, name: 'Tokyo_HighRoller', score: 112400, prizeCC: 90000 },
        { rank: 3, name: 'Apex_Legend', score: 98500, prizeCC: 60000 },
        { rank: 4, name: 'NeonSamurai', score: 84000, prizeCC: 40000 },
        { rank: 5, name: 'Monaco_Whale', score: 71200, prizeCC: 30000 },
      ],
      status: 'active',
    },
  ],
  ownedCollections: [],
  ownedCasinos: [],
  competitors: [
    { id: 'ai_cas_1', name: 'Bellagio Nexus Resort', city: 'Las Vegas', reputation: 98, marketSharePercent: 32, dailyRevenue: 1250000, venueSize: 'mega_resort' },
    { id: 'ai_cas_2', name: 'Grand Lisboa Cyber Palace', city: 'Macau', reputation: 95, marketSharePercent: 28, dailyRevenue: 980000, venueSize: 'mega_resort' },
    { id: 'ai_cas_3', name: 'Casino de Monte Carlo', city: 'Monaco', reputation: 97, marketSharePercent: 24, dailyRevenue: 850000, venueSize: 'large' },
    { id: 'ai_cas_4', name: 'Marina Bay Sands Star', city: 'Singapore', reputation: 92, marketSharePercent: 16, dailyRevenue: 620000, venueSize: 'large' },
  ],
  businessStatistics: {
    totalCasinosOwned: 0,
    totalCasinoValuation: 0,
    cumulativeBusinessProfit: 0,
    playerMarketShare: 0,
  },
  lastDailyResetDay: 1,
};

class CasinoManager {
  /**
   * Safe getter and initializer of Casino state
   */
  public getOrCreateState(): CasinoSubsystemState {
    const s = gameState.getState();
    if (!s.casino) {
      gameState.update((draft) => {
        draft.casino = JSON.parse(JSON.stringify(INITIAL_CASINO_STATE));
      });
    }
    return gameState.getState().casino!;
  }

  public getCasinoCoins(): number {
    return this.getOrCreateState().casinoCoins;
  }

  public addCasinoCoins(amountCC: number, description: string): void {
    if (amountCC <= 0) return;
    gameState.update((draft) => {
      if (!draft.casino) {
        draft.casino = JSON.parse(JSON.stringify(INITIAL_CASINO_STATE));
      }
      draft.casino.casinoCoins += amountCC;
      draft.casino.transactions.unshift({
        id: `tx_cc_add_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        type: 'bonus_cc',
        amountCC: amountCC,
        description,
        balanceCCAfter: draft.casino.casinoCoins,
      });
    });
  }

  public deductCasinoCoins(amountCC: number, description: string): boolean {
    if (amountCC <= 0) return true;
    const current = this.getCasinoCoins();
    if (current < amountCC) return false;
    gameState.update((draft) => {
      if (!draft.casino) {
        draft.casino = JSON.parse(JSON.stringify(INITIAL_CASINO_STATE));
      }
      draft.casino.casinoCoins -= amountCC;
      draft.casino.transactions.unshift({
        id: `tx_cc_dec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        type: 'wager',
        amountCC: -amountCC,
        description,
        balanceCCAfter: draft.casino.casinoCoins,
      });
    });
    return true;
  }

  public addTransaction(tx: any): void {
    gameState.update((draft) => {
      if (!draft.casino) {
        draft.casino = JSON.parse(JSON.stringify(INITIAL_CASINO_STATE));
      }
      draft.casino.transactions.unshift({
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        ...tx,
        balanceCCAfter: draft.casino.casinoCoins,
      });
    });
  }

  // ----------------------------------------------------
  // CURRENCY EXCHANGE ($ <-> CC)
  // ----------------------------------------------------

  /**
   * Exchanges Business USD to Casino Coins (CC)
   */
  public exchangeCashToCC(amountUSD: number): { success: boolean; message: string; ccReceived?: number } {
    if (amountUSD <= 0) return { success: false, message: 'Укажите положительную сумму' };
    const s = gameState.getState();
    if (s.cash < amountUSD) return { success: false, message: 'Недостаточно средств на основном балансе бизнеса' };

    const casinoState = this.getOrCreateState();
    const fee = Math.round(amountUSD * casinoState.buyFeePercent);
    const netUSD = amountUSD - fee;
    const ccReceived = Math.round(netUSD * casinoState.exchangeRate);

    gameState.update((draft) => {
      draft.cash -= amountUSD;
      draft.statistics.totalSpent += amountUSD;

      draft.transactions.unshift({
        id: `tx_exc_buy_${Date.now()}`,
        timestamp: Date.now(),
        gameTime: { ...draft.gameTime },
        amount: -amountUSD,
        type: 'expense',
        category: 'Казино',
        description: `Покупка ${ccReceived.toLocaleString()} CC (комиссия ${fee.toLocaleString()} $)`,
        balanceAfter: draft.cash,
      });

      const c = draft.casino!;
      c.casinoCoins += ccReceived;
      c.transactions.unshift({
        id: `tx_cc_buy_${Date.now()}`,
        timestamp: Date.now(),
        type: 'buy_cc',
        amountCash: amountUSD,
        amountCC: ccReceived,
        feePercent: casinoState.buyFeePercent,
        description: `Обмен: ${amountUSD.toLocaleString()} $ → ${ccReceived.toLocaleString()} CC`,
        balanceCCAfter: c.casinoCoins,
      });
    });

    return {
      success: true,
      message: `Успешно обменено $${amountUSD.toLocaleString()} на ${ccReceived.toLocaleString()} CC (комиссия 5%)`,
      ccReceived,
    };
  }

  /**
   * Cashes out Casino Coins (CC) to Business USD
   */
  public exchangeCCToCash(amountCC: number): { success: boolean; message: string; cashReceived?: number } {
    if (amountCC <= 0) return { success: false, message: 'Укажите положительную сумму' };
    const casinoState = this.getOrCreateState();
    if (casinoState.casinoCoins < amountCC) return { success: false, message: 'Недостаточно Casino Coins для вывода' };

    const fee = Math.round(amountCC * casinoState.sellFeePercent);
    const netCC = amountCC - fee;
    const cashReceived = Math.round(netCC / casinoState.exchangeRate);

    gameState.update((draft) => {
      draft.cash += cashReceived;
      draft.statistics.totalEarned += cashReceived;

      draft.transactions.unshift({
        id: `tx_exc_sell_${Date.now()}`,
        timestamp: Date.now(),
        gameTime: { ...draft.gameTime },
        amount: cashReceived,
        type: 'revenue',
        category: 'Казино',
        description: `Вывод из казино: ${cashReceived.toLocaleString()} $ (комиссия ${fee.toLocaleString()} CC)`,
        balanceAfter: draft.cash,
      });

      const c = draft.casino!;
      c.casinoCoins -= amountCC;
      c.transactions.unshift({
        id: `tx_cc_sell_${Date.now()}`,
        timestamp: Date.now(),
        type: 'sell_cc',
        amountCash: cashReceived,
        amountCC: amountCC,
        feePercent: casinoState.sellFeePercent,
        description: `Вывод: ${amountCC.toLocaleString()} CC → $${cashReceived.toLocaleString()}`,
        balanceCCAfter: c.casinoCoins,
      });
    });

    return {
      success: true,
      message: `Успешно выведено ${amountCC.toLocaleString()} CC в $${cashReceived.toLocaleString()} (комиссия 8%)`,
      cashReceived,
    };
  }

  // ----------------------------------------------------
  // GAMEPLAY WAGERING & PROGRESSION
  // ----------------------------------------------------

  /**
   * Processes a completed game round: manages wager, win/loss, XP, level, progressive jackpot pools
   */
  public recordGameRound(
    gameId: string,
    gameName: string,
    category: string,
    betCC: number,
    payoutCC: number,
    isJackpot = false,
    jackpotType?: 'mini' | 'major' | 'mega'
  ): { netResultCC: number; xpGained: number; levelUp: boolean; newVipTier?: VipTier } {
    const netResultCC = payoutCC - betCC;
    const xpGained = Math.max(5, Math.floor(betCC * 0.1));
    let levelUp = false;
    let newVipTier: VipTier | undefined = undefined;

    gameState.update((draft) => {
      const c = draft.casino!;

      c.casinoCoins += netResultCC;
      c.totalWageredCC += betCC;
      c.gamesPlayedCount += 1;

      if (netResultCC > 0) {
        c.totalWonCC += netResultCC;
        if (payoutCC > c.biggestSingleWinCC) {
          c.biggestSingleWinCC = payoutCC;
        }
      } else {
        c.totalLostCC += Math.abs(netResultCC);
      }

      // Recent games tracking
      if (!c.recentGameIds.includes(gameId)) {
        c.recentGameIds = [gameId, ...c.recentGameIds.slice(0, 15)];
      }

      // XP & Level calculations
      c.xp += xpGained;
      const prevLevel = c.level;
      const requiredXp = c.level * 1000;
      if (c.xp >= requiredXp) {
        c.level += 1;
        c.xp -= requiredXp;
        levelUp = true;
      }

      // VIP tier calculation
      c.vipPoints += Math.floor(betCC * 0.05);
      const prevVip = c.vipTier;
      if (c.vipPoints >= 500000) c.vipTier = 'Royal';
      else if (c.vipPoints >= 200000) c.vipTier = 'Diamond';
      else if (c.vipPoints >= 75000) c.vipTier = 'Platinum';
      else if (c.vipPoints >= 25000) c.vipTier = 'Gold';
      else if (c.vipPoints >= 5000) c.vipTier = 'Silver';
      else c.vipTier = 'Bronze';

      if (c.vipTier !== prevVip) {
        newVipTier = c.vipTier;
      }

      // Progressive jackpot pool accumulation (0.5% of wager feeds the pool)
      const jackpotContribution = betCC * 0.005;
      c.jackpotPool.mini += jackpotContribution * 0.5;
      c.jackpotPool.major += jackpotContribution * 0.35;
      c.jackpotPool.mega += jackpotContribution * 0.15;

      // Handle jackpot win
      if (isJackpot && jackpotType) {
        const jAmount = Math.round(c.jackpotPool[jackpotType]);
        c.casinoCoins += jAmount;
        c.jackpotHistory.unshift({
          id: `jackpot_win_${Date.now()}`,
          timestamp: Date.now(),
          jackpotType,
          amountCC: jAmount,
          winnerName: 'Вы (Игрок)',
          gameId,
          gameName,
        });

        // Reset jackpot base pool
        c.jackpotPool[jackpotType] = jackpotType === 'mini' ? 50000 : jackpotType === 'major' ? 250000 : 1000000;
      }

      // Daily missions progress
      for (const m of c.dailyMissions) {
        if (!m.completed) {
          if (m.category === category || m.category === 'general') {
            m.currentCount += 1;
            if (m.currentCount >= m.targetCount) {
              m.completed = true;
            }
          }
        }
      }

      // Tournament score update
      for (const t of c.tournaments) {
        if (t.status === 'active' && (t.gameCategory === category || t.gameCategory === 'slots')) {
          t.playerScore += Math.max(0, netResultCC);
        }
      }
    });

    return { netResultCC, xpGained, levelUp, newVipTier };
  }

  /**
   * Claims reward for a completed daily mission
   */
  public claimMissionReward(missionId: string): { success: boolean; message: string } {
    const s = gameState.getState();
    const c = s.casino;
    if (!c) return { success: false, message: 'Казино не инициализировано' };

    const mission = c.dailyMissions.find((m) => m.id === missionId);
    if (!mission) return { success: false, message: 'Задание не найдено' };
    if (!mission.completed) return { success: false, message: 'Задание еще не выполнено' };
    if (mission.claimed) return { success: false, message: 'Награда уже получена' };

    gameState.update((draft) => {
      const targetM = draft.casino!.dailyMissions.find((m) => m.id === missionId)!;
      targetM.claimed = true;
      draft.casino!.casinoCoins += targetM.rewardCC;
      draft.casino!.xp += targetM.rewardXP;
    });

    return {
      success: true,
      message: `Награда получена: +${mission.rewardCC.toLocaleString()} CC и +${mission.rewardXP} XP!`,
    };
  }

  /**
   * Toggles game favorite status
   */
  public toggleFavorite(gameId: string): void {
    gameState.update((draft) => {
      const c = draft.casino!;
      if (c.favorites.includes(gameId)) {
        c.favorites = c.favorites.filter((id) => id !== gameId);
      } else {
        c.favorites.push(gameId);
      }
    });
  }

  // ----------------------------------------------------
  // CASINO BUSINESS MANAGEMENT (OWNING CASINOS)
  // ----------------------------------------------------

  /**
   * Buys and establishes a new player-owned casino venue
   */
  public openCasinoVenue(
    name: string,
    venueSize: CasinoVenueSize,
    cityLocation: string
  ): { success: boolean; message: string } {
    const COST_BY_SIZE: Record<CasinoVenueSize, number> = {
      small: 100000,
      medium: 1000000,
      large: 10000000,
      mega_resort: 100000000,
    };

    const cost = COST_BY_SIZE[venueSize];
    const s = gameState.getState();
    if (s.cash < cost) {
      return { success: false, message: `Недостаточно средств. Требуется $${cost.toLocaleString()}` };
    }

    const defaultHalls: CasinoHall[] = [
      { id: 'hall_slot', type: 'slot_hall', name: 'Игровой зал слот-автоматов', level: 1, capacity: 50, unlocked: true, upgradeCost: 50000, dailyMaintenance: 200 },
      { id: 'hall_roulette', type: 'roulette_hall', name: 'Зал европейской рулетки', level: 1, capacity: 25, unlocked: true, upgradeCost: 75000, dailyMaintenance: 350 },
      { id: 'hall_blackjack', type: 'blackjack_room', name: 'Блэкджек лаунж', level: 1, capacity: 20, unlocked: true, upgradeCost: 60000, dailyMaintenance: 300 },
      { id: 'hall_poker', type: 'poker_room', name: 'Покерный клуб', level: 1, capacity: 30, unlocked: venueSize !== 'small', upgradeCost: 120000, dailyMaintenance: 500 },
      { id: 'hall_vip', type: 'vip_room', name: 'VIP Салон', level: 1, capacity: 15, unlocked: venueSize === 'large' || venueSize === 'mega_resort', upgradeCost: 300000, dailyMaintenance: 1200 },
      { id: 'hall_high_roller', type: 'high_roller_room', name: 'High Roller Пентхаус', level: 1, capacity: 10, unlocked: venueSize === 'mega_resort', upgradeCost: 1000000, dailyMaintenance: 3500 },
    ];

    const defaultStaff: CasinoStaffMember[] = [
      { id: 'st_1', name: 'Главный пит-босс', role: 'manager', salaryDaily: 400, skill: 70, morale: 90, efficiency: 1.0, level: 1 },
      { id: 'st_2', name: 'Служба охраны', role: 'security', salaryDaily: 250, skill: 65, morale: 85, efficiency: 1.0, level: 1 },
      { id: 'st_3', name: 'Крупье и дилеры', role: 'dealer', salaryDaily: 300, skill: 75, morale: 80, efficiency: 1.0, level: 1 },
    ];

    const newVenue: OwnedCasinoBusiness = {
      id: `casino_venue_${Date.now()}`,
      name,
      venueSize,
      cityLocation,
      reputation: 60,
      securityRating: 70,
      halls: defaultHalls,
      installedMachines: [
        { id: 'mach_1', gameId: 'slot_vegas_royale', name: 'Vegas Royale 777 Cabinets', type: 'slot', tier: 1, purchasePrice: 20000, dailyMaintenance: 50, guestCapacity: 10, avgDailyTurnover: 15000, houseEdgePercent: 3.8, popularityRating: 85 },
        { id: 'mach_2', gameId: 'cyber_neon_roulette', name: 'Cyber Neon Wheel Tables', type: 'roulette', tier: 1, purchasePrice: 35000, dailyMaintenance: 100, guestCapacity: 8, avgDailyTurnover: 25000, houseEdgePercent: 2.7, popularityRating: 90 },
      ],
      staff: defaultStaff,
      marketing: [
        { id: 'mkt_local', name: 'Локальные баннеры и промо', type: 'local', costDaily: 200, trafficBoostPercent: 15, vipVisitorBoostPercent: 5, reputationBoostDaily: 0.1, active: true },
      ],
      activeEvents: [],
      stats: {
        dailyVisitors: 150,
        dailyVipVisitors: 8,
        dailyHighRollers: 1,
        dailyTotalWagered: 120000,
        dailyGrossRevenue: 15000,
        dailyPayouts: 11000,
        dailyNetGamingRevenue: 4000,
        dailyOperatingExpenses: 1500,
        dailyNetProfit: 2500,
        totalHistoricalProfit: 0,
      },
      limits: {
        minTableBet: 10,
        maxTableBet: 5000,
        highRollerLimit: 25000,
      },
    };

    gameState.update((draft) => {
      draft.cash -= cost;
      draft.statistics.totalSpent += cost;

      draft.transactions.unshift({
        id: `tx_open_casino_${Date.now()}`,
        timestamp: Date.now(),
        gameTime: { ...draft.gameTime },
        amount: -cost,
        type: 'investment',
        category: 'Бизнес Казино',
        description: `Открытие казино "${name}" (${venueSize}) в г. ${cityLocation}`,
        balanceAfter: draft.cash,
      });

      const c = draft.casino!;
      c.ownedCasinos.push(newVenue);
      c.businessStatistics.totalCasinosOwned += 1;
      c.businessStatistics.totalCasinoValuation += cost;
    });

    return { success: true, message: `Казино "${name}" успешно открыто в г. ${cityLocation}!` };
  }

  /**
   * Installs new gaming equipment/machine in a casino
   */
  public installMachine(casinoId: string, machine: Omit<CasinoMachineUnit, 'id'>): { success: boolean; message: string } {
    const s = gameState.getState();
    if (s.cash < machine.purchasePrice) {
      return { success: false, message: 'Недостаточно средств для закупки оборудования' };
    }

    gameState.update((draft) => {
      draft.cash -= machine.purchasePrice;
      const cas = draft.casino!.ownedCasinos.find((c) => c.id === casinoId);
      if (cas) {
        cas.installedMachines.push({
          ...machine,
          id: `mach_${Date.now()}`,
        });
      }
    });

    return { success: true, message: `Оборудование "${machine.name}" успешно установлено!` };
  }

  /**
   * Hires a new staff member for the casino
   */
  public hireStaffMember(casinoId: string, staff: Omit<CasinoStaffMember, 'id'>): { success: boolean; message: string } {
    gameState.update((draft) => {
      const cas = draft.casino!.ownedCasinos.find((c) => c.id === casinoId);
      if (cas) {
        cas.staff.push({
          ...staff,
          id: `staff_${Date.now()}`,
        });
      }
    });

    return { success: true, message: `Сотрудник ${staff.name} (${staff.role}) успешно принят в штат!` };
  }

  // ----------------------------------------------------
  // DAILY & HOURLY TICK SIMULATION
  // ----------------------------------------------------

  /**
   * Daily business simulator for player-owned casinos
   */
  public handleDayTick(currentDay: number): void {
    const s = gameState.getState();
    const c = s.casino;
    if (!c || c.ownedCasinos.length === 0) return;

    gameState.update((draft) => {
      const casinoSub = draft.casino!;
      let totalDailyCasinoProfit = 0;

      for (const casino of casinoSub.ownedCasinos) {
        // Calculate operating expenses: Staff wages + Machine maintenance + Marketing costs + Hall maintenance
        const staffWages = casino.staff.reduce((acc, st) => acc + st.salaryDaily, 0);
        const machineMaint = casino.installedMachines.reduce((acc, m) => acc + m.dailyMaintenance, 0);
        const marketingCost = casino.marketing.filter((m) => m.active).reduce((acc, m) => acc + m.costDaily, 0);
        const hallMaint = casino.halls.filter((h) => h.unlocked).reduce((acc, h) => acc + h.dailyMaintenance, 0);
        const dailyOperatingExpenses = staffWages + machineMaint + marketingCost + hallMaint;

        // Calculate visitor traffic
        const baseTraffic = casino.venueSize === 'small' ? 200 : casino.venueSize === 'medium' ? 800 : casino.venueSize === 'large' ? 3000 : 12000;
        const repFactor = casino.reputation / 100;
        const mktTrafficBoost = casino.marketing.filter((m) => m.active).reduce((acc, m) => acc + m.trafficBoostPercent, 0) / 100;
        const dailyVisitors = Math.round(baseTraffic * repFactor * (1 + mktTrafficBoost));

        // VIP visitors & High Rollers
        const dailyVipVisitors = Math.round(dailyVisitors * (0.05 + (casino.reputation > 80 ? 0.05 : 0)));
        const dailyHighRollers = casino.halls.some((h) => h.type === 'high_roller_room' && h.unlocked)
          ? Math.max(1, Math.floor(dailyVisitors * 0.005))
          : 0;

        // Total Wagered Turnover
        const avgBetPerVisitor = casino.venueSize === 'small' ? 150 : casino.venueSize === 'medium' ? 400 : casino.venueSize === 'large' ? 1200 : 3500;
        const dailyTotalWagered = (dailyVisitors * avgBetPerVisitor) + (dailyHighRollers * 50000);

        // Realistic GGR based on average House Edge (approx 3.5% with statistical variance)
        const avgHouseEdge = 0.035;
        const varianceFactor = 0.85 + Math.random() * 0.30; // Random daily variance (e.g. lucky visitors)
        const expectedGrossRevenue = Math.round(dailyTotalWagered * avgHouseEdge * varianceFactor);
        const dailyPayouts = Math.round(dailyTotalWagered - expectedGrossRevenue);
        const dailyNetGamingRevenue = Math.max(0, expectedGrossRevenue);

        // Net Profit for the day
        const dailyNetProfit = dailyNetGamingRevenue - dailyOperatingExpenses;
        totalDailyCasinoProfit += dailyNetProfit;

        // Update casino stats
        casino.stats = {
          dailyVisitors,
          dailyVipVisitors,
          dailyHighRollers,
          dailyTotalWagered,
          dailyGrossRevenue: dailyNetGamingRevenue,
          dailyPayouts,
          dailyNetGamingRevenue,
          dailyOperatingExpenses,
          dailyNetProfit,
          totalHistoricalProfit: casino.stats.totalHistoricalProfit + dailyNetProfit,
        };

        // Reputation drift
        if (dailyNetGamingRevenue > 0 && casino.securityRating >= 70) {
          casino.reputation = Math.min(100, casino.reputation + 0.1);
        }
      }

      // Add to company cash balance
      if (totalDailyCasinoProfit !== 0) {
        draft.cash += totalDailyCasinoProfit;
        if (totalDailyCasinoProfit > 0) {
          draft.statistics.totalEarned += totalDailyCasinoProfit;
        } else {
          draft.statistics.totalSpent += Math.abs(totalDailyCasinoProfit);
        }

        draft.transactions.unshift({
          id: `tx_casino_daily_${Date.now()}`,
          timestamp: Date.now(),
          gameTime: { ...draft.gameTime },
          amount: totalDailyCasinoProfit,
          type: totalDailyCasinoProfit >= 0 ? 'revenue' : 'expense',
          category: 'Казино Бизнес',
          description: `Суточная чистая прибыль сети казино (${casinoSub.ownedCasinos.length} заведений)`,
          balanceAfter: draft.cash,
        });

        casinoSub.businessStatistics.cumulativeBusinessProfit += totalDailyCasinoProfit;
      }

      // Update market share
      const totalMarketRevenue = casinoSub.competitors.reduce((acc, comp) => acc + comp.dailyRevenue, 0) + (totalDailyCasinoProfit > 0 ? totalDailyCasinoProfit : 1000);
      const playerRev = Math.max(0, totalDailyCasinoProfit);
      casinoSub.businessStatistics.playerMarketShare = Math.min(100, Math.round((playerRev / totalMarketRevenue) * 1000) / 10);
    });
  }
}

export const casinoManager = new CasinoManager();
