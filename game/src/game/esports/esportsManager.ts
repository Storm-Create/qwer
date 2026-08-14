/**
 * Business Empire: Ultimate
 * Esports Empire — Central Manager Engine
 * Manages 27 real disciplines, organizations, rosters, transfers,
 * staff, training, tournaments, arena, sponsors, merch & holding synergies.
 */

import {
  DisciplineId,
  EsportsArena,
  EsportsOrganization,
  EsportsRoster,
  EsportsStaff,
  EsportsSubsystemState,
  GamingHouseFacility,
  MediaChannel,
  ProPlayer,
  SponsorOffer,
  StaffRole,
  TournamentMatch,
  WorldRankingEntry,
} from '../../types/esports';
import { gameState } from '../gameState';
import { ALL_DISCIPLINE_IDS, ESPORTS_DISCIPLINES } from './esportsDisciplines';
import { generateInitialPlayerDatabase, generateProPlayer } from './esportsPlayerGenerator';
import { generateStaffMember } from './esportsStaffData';
import { createInitialSponsors } from './esportsSponsorsData';
import { INITIAL_MERCH_ITEMS } from './esportsMerchData';
import { AI_RIVAL_ORGS, generateInitialTournaments, generateTournament } from './esportsTournamentsData';
import { simulateEsportsMatch } from './esportsMatchEngine';

export const INITIAL_GAMING_HOUSE: GamingHouseFacility = {
  level: 1,
  name: 'Apartment Bootcamp (Начальный буткемп)',
  monthlyUpkeep: 4500,
  gamingPCsLevel: 1,
  internetLevel: 1,
  equipmentLevel: 1,
  analysisRoomLevel: 1,
  recoveryGymLevel: 1,
  streamingStudioLevel: 1,
  usedFactoryHardware: false,
};

export const INITIAL_ARENA: EsportsArena = {
  tier: 'small_arena',
  name: 'Cyber Club Arena (Малая арена)',
  level: 1,
  seatCapacity: 1200,
  ticketPrice: 25,
  monthlyMaintenance: 15000,
  vipSuitesLevel: 1,
  foodConcessionsLevel: 1,
  merchStandsLevel: 1,
  adBannersLevel: 1,
  fanSatisfaction: 85,
  lastMonthRevenue: {
    tickets: 30000,
    vip: 12000,
    food: 8000,
    merch: 10000,
    ads: 15000,
    sponsors: 20000,
    total: 95000,
  },
};

export const INITIAL_MEDIA: MediaChannel = {
  followers: 45000,
  fanBase: 12000,
  engagementRate: 8.4,
  monthlySponsorValue: 25000,
  videoViewsMonthly: 350000,
  streamingHoursMonthly: 120,
  activeCampaigns: [],
};

export function createInitialRosters(): Record<DisciplineId, EsportsRoster> {
  const rosters = {} as Record<DisciplineId, EsportsRoster>;
  ALL_DISCIPLINE_IDS.forEach((dId, idx) => {
    rosters[dId] = {
      disciplineId: dId,
      teamName: `NEON ${ESPORTS_DISCIPLINES[dId].name.toUpperCase()}`,
      activePlayerIds: [],
      substitutePlayerIds: [],
      headCoachId: null,
      analystId: null,
      teamRating: 70,
      form: 80,
      morale: 85,
      chemistry: 65,
      strategy: 70,
      experience: 50,
      fatigue: 0,
      trainingFocus: 'balanced',
      winLoss: { wins: 0, losses: 0, draws: 0 },
      trophies: 0,
      totalEarnings: 0,
      regionalRank: Math.floor(Math.random() * 20) + 15,
      worldRank: Math.floor(Math.random() * 40) + 30,
      rankingPoints: 1200,
      scrimStreak: 0,
      isParticipatingInTournament: false,
      currentTournamentId: null,
    };
  });
  return rosters;
}

export function createInitialRankings(): Record<DisciplineId, WorldRankingEntry[]> {
  const rankings = {} as Record<DisciplineId, WorldRankingEntry[]>;
  ALL_DISCIPLINE_IDS.forEach((dId) => {
    const rivals = AI_RIVAL_ORGS[dId] || ['Team Alpha', 'Cyber Wolves', 'Titan Gaming', 'Nova Squad'];
    const entries: WorldRankingEntry[] = rivals.map((name, idx) => ({
      rank: idx + 1,
      teamId: `ai_team_${dId}_${idx}`,
      teamName: name,
      region: idx % 3 === 0 ? 'Europe' : idx % 2 === 0 ? 'Asia' : 'North America',
      disciplineId: dId,
      points: 2500 - idx * 120,
      change: 0,
      isPlayerOrg: false,
      winLossRate: Math.round((78 - idx * 3) * 10) / 10,
      trophies: Math.max(0, 8 - idx),
    }));

    // Add Player Org as #15
    entries.push({
      rank: entries.length + 1,
      teamId: 'player_org',
      teamName: `NEON ${ESPORTS_DISCIPLINES[dId].name.toUpperCase()}`,
      region: 'Europe',
      disciplineId: dId,
      points: 1200,
      change: 0,
      isPlayerOrg: true,
      winLossRate: 50.0,
      trophies: 0,
    });

    rankings[dId] = entries;
  });
  return rankings;
}

export function createInitialEsportsState(): EsportsSubsystemState {
  const players = generateInitialPlayerDatabase();
  const rosters = createInitialRosters();

  // Starter squad: Automatically populate CS2 & MLBB with initial owned players
  const cs2Players = players.filter((p) => p.gameId === 'cs2').slice(0, 5);
  cs2Players.forEach((p) => {
    p.teamId = 'player_org';
    p.teamName = 'NEON CS2';
    rosters.cs2.activePlayerIds.push(p.id);
  });

  const mlbbPlayers = players.filter((p) => p.gameId === 'mlbb').slice(0, 5);
  mlbbPlayers.forEach((p) => {
    p.teamId = 'player_org';
    p.teamName = 'NEON MLBB';
    rosters.mlbb.activePlayerIds.push(p.id);
  });

  const starterStaff = [
    generateStaffMember('head_coach', 'cs2'),
    generateStaffMember('head_coach', 'mlbb'),
    generateStaffMember('content_manager', 'all'),
  ];

  return {
    organization: {
      name: 'NEON ESPORTS',
      tag: 'NEON',
      logoEmoji: '⚡',
      primaryColor: '#06b6d4',
      level: 1,
      reputation: 65,
      foundedYear: 2026,
      fansCount: 45000,
      totalPrizeMoneyEarned: 0,
      totalTrophiesCount: 0,
      worldRankOverall: 24,
    },
    rosters,
    players,
    aiTeams: [],
    staff: starterStaff,
    gamingHouse: INITIAL_GAMING_HOUSE,
    arena: INITIAL_ARENA,
    tournaments: generateInitialTournaments(),
    sponsors: createInitialSponsors(),
    merch: INITIAL_MERCH_ITEMS,
    media: INITIAL_MEDIA,
    rankings: createInitialRankings(),
    matchHistory: [],
    monthlyFinances: {
      prizeMoney: 0,
      sponsorIncome: 0,
      merchProfit: 0,
      ticketSales: 0,
      streamingRevenue: 0,
      playerSalaries: 0,
      staffSalaries: 0,
      facilityUpkeep: 0,
      transfersSpent: 0,
      transfersEarned: 0,
      netProfit: 0,
    },
    stats: {
      totalTournamentsWon: 0,
      totalMajorsWon: 0,
      totalWorldChampionships: 0,
      totalMatchesPlayed: 0,
      totalMatchesWon: 0,
      biggestPrizeCheck: 0,
    },
  };
}

class EsportsManager {
  public getOrCreateState(): EsportsSubsystemState {
    const root = gameState.getState();
    if (!root.esports) {
      const initial = createInitialEsportsState();
      gameState.update((draft) => {
        draft.esports = initial;
      });
      return initial;
    }
    return root.esports;
  }

  // -------------------------------------------------------------
  // ORGANIZATION MANAGEMENT
  // -------------------------------------------------------------

  public renameOrganization(name: string, tag: string, logoEmoji: string, primaryColor: string): void {
    this.updateState((state) => {
      state.organization.name = name.trim() || 'NEON ESPORTS';
      state.organization.tag = tag.trim().toUpperCase() || 'NEON';
      state.organization.logoEmoji = logoEmoji || '⚡';
      state.organization.primaryColor = primaryColor || '#06b6d4';

      // Update all active roster names
      ALL_DISCIPLINE_IDS.forEach((dId) => {
        state.rosters[dId].teamName = `${state.organization.tag} ${ESPORTS_DISCIPLINES[dId].name.toUpperCase()}`;
      });
    });
  }

  // -------------------------------------------------------------
  // ROSTER & LINEUP OPERATIONS
  // -------------------------------------------------------------

  public setStarterPlayer(disciplineId: DisciplineId, playerId: string): boolean {
    const state = this.getOrCreateState();
    const roster = state.rosters[disciplineId];
    const discipline = ESPORTS_DISCIPLINES[disciplineId];

    if (roster.activePlayerIds.includes(playerId)) return true;
    if (roster.activePlayerIds.length >= discipline.rosterSize) {
      return false; // Active slots full
    }

    this.updateState((draft) => {
      const r = draft.rosters[disciplineId];
      r.substitutePlayerIds = r.substitutePlayerIds.filter((id) => id !== playerId);
      r.activePlayerIds.push(playerId);
      this.recalculateRosterStats(r, draft.players);
    });
    return true;
  }

  public benchPlayer(disciplineId: DisciplineId, playerId: string): void {
    this.updateState((draft) => {
      const r = draft.rosters[disciplineId];
      r.activePlayerIds = r.activePlayerIds.filter((id) => id !== playerId);
      if (!r.substitutePlayerIds.includes(playerId)) {
        r.substitutePlayerIds.push(playerId);
      }
      this.recalculateRosterStats(r, draft.players);
    });
  }

  public setTrainingFocus(disciplineId: DisciplineId, focus: EsportsRoster['trainingFocus']): void {
    this.updateState((draft) => {
      draft.rosters[disciplineId].trainingFocus = focus;
    });
  }

  private recalculateRosterStats(roster: EsportsRoster, players: ProPlayer[]): void {
    const active = players.filter((p) => roster.activePlayerIds.includes(p.id));
    if (active.length === 0) {
      roster.teamRating = 50;
      return;
    }
    const avgRating = active.reduce((acc, p) => acc + p.rating, 0) / active.length;
    const avgForm = active.reduce((acc, p) => acc + p.form, 0) / active.length;
    roster.teamRating = Math.round(avgRating * 0.8 + (avgForm - 50) * 0.4);
    roster.morale = Math.round(active.reduce((acc, p) => acc + p.morale, 0) / active.length);
    roster.fatigue = Math.round(active.reduce((acc, p) => acc + p.fatigue, 0) / active.length);
  }

  // -------------------------------------------------------------
  // TRANSFER MARKET
  // -------------------------------------------------------------

  public buyPlayer(playerId: string): { success: boolean; message: string } {
    const state = this.getOrCreateState();
    const player = state.players.find((p) => p.id === playerId);
    if (!player) return { success: false, message: 'Игрок не найден на рынке' };
    if (player.teamId === 'player_org') return { success: false, message: 'Игрок уже принадлежит вашей организации' };

    const cost = player.marketValue;
    const cash = gameState.getState().cash;

    if (cash < cost) {
      return { success: false, message: `Недостаточно средств. Требуется: $${cost.toLocaleString()}` };
    }

    gameState.update((root) => {
      root.cash -= cost;
      const esports = root.esports!;
      const targetPlayer = esports.players.find((p) => p.id === playerId)!;
      targetPlayer.teamId = 'player_org';
      targetPlayer.teamName = esports.organization.name;
      targetPlayer.contractMonths = 24;

      // Automatically add to bench or starter if space available
      const roster = esports.rosters[targetPlayer.gameId];
      const discipline = ESPORTS_DISCIPLINES[targetPlayer.gameId];
      if (roster.activePlayerIds.length < discipline.rosterSize) {
        roster.activePlayerIds.push(targetPlayer.id);
      } else {
        roster.substitutePlayerIds.push(targetPlayer.id);
      }
      this.recalculateRosterStats(roster, esports.players);

      esports.monthlyFinances.transfersSpent += cost;
    });

    return { success: true, message: `Игрок ${player.nickname} (${player.realName}) подписан за $${cost.toLocaleString()}!` };
  }

  public sellPlayer(playerId: string): { success: boolean; message: string } {
    const state = this.getOrCreateState();
    const player = state.players.find((p) => p.id === playerId);
    if (!player || player.teamId !== 'player_org') {
      return { success: false, message: 'Вы не владеете этим игроком' };
    }

    const earnings = Math.round(player.marketValue * 0.9); // 10% agent/market fee

    gameState.update((root) => {
      root.cash += earnings;
      const esports = root.esports!;
      const targetPlayer = esports.players.find((p) => p.id === playerId)!;
      targetPlayer.teamId = null;
      targetPlayer.teamName = null;

      const roster = esports.rosters[targetPlayer.gameId];
      roster.activePlayerIds = roster.activePlayerIds.filter((id) => id !== playerId);
      roster.substitutePlayerIds = roster.substitutePlayerIds.filter((id) => id !== playerId);
      this.recalculateRosterStats(roster, esports.players);

      esports.monthlyFinances.transfersEarned += earnings;
    });

    return { success: true, message: `Игрок ${player.nickname} успешно продан за $${earnings.toLocaleString()}!` };
  }

  public renewContract(playerId: string, addedMonths: number): { success: boolean; message: string } {
    const state = this.getOrCreateState();
    const player = state.players.find((p) => p.id === playerId);
    if (!player || player.teamId !== 'player_org') {
      return { success: false, message: 'Игрок не принадлежит организации' };
    }

    const bonus = Math.round(player.salary * (addedMonths / 6));
    const cash = gameState.getState().cash;
    if (cash < bonus) {
      return { success: false, message: `Недостаточно средств на подписной бонус ($${bonus.toLocaleString()})` };
    }

    gameState.update((root) => {
      root.cash -= bonus;
      const p = root.esports!.players.find((item) => item.id === playerId)!;
      p.contractMonths += addedMonths;
      p.morale = Math.min(100, p.morale + 15);
    });

    return { success: true, message: `Контракт с ${player.nickname} продлен на +${addedMonths} мес. Бонус: $${bonus.toLocaleString()}` };
  }

  public releasePlayer(playerId: string): { success: boolean; message: string } {
    const state = this.getOrCreateState();
    const player = state.players.find((p) => p.id === playerId);
    if (!player || player.teamId !== 'player_org') {
      return { success: false, message: 'Игрок не найден' };
    }

    this.updateState((draft) => {
      const p = draft.players.find((item) => item.id === playerId)!;
      p.teamId = null;
      p.teamName = null;
      const roster = draft.rosters[p.gameId];
      roster.activePlayerIds = roster.activePlayerIds.filter((id) => id !== playerId);
      roster.substitutePlayerIds = roster.substitutePlayerIds.filter((id) => id !== playerId);
      this.recalculateRosterStats(roster, draft.players);
    });

    return { success: true, message: `Игрок ${player.nickname} отпущен в статус свободного агента` };
  }

  // -------------------------------------------------------------
  // STAFF MANAGEMENT
  // -------------------------------------------------------------

  public hireStaff(role: StaffRole, disciplineId: DisciplineId | 'all' = 'all'): { success: boolean; message: string } {
    const newStaff = generateStaffMember(role, disciplineId);
    const cost = Math.round(newStaff.salary * 1.5); // Signing bonus
    const cash = gameState.getState().cash;

    if (cash < cost) {
      return { success: false, message: `Недостаточно средств на контракт ($${cost.toLocaleString()})` };
    }

    gameState.update((root) => {
      root.cash -= cost;
      root.esports!.staff.push(newStaff);
    });

    return { success: true, message: `Специалист ${newStaff.name} (${newStaff.specialization}) нанят!` };
  }

  public fireStaff(staffId: string): void {
    this.updateState((draft) => {
      draft.staff = draft.staff.filter((s) => s.id !== staffId);
    });
  }

  // -------------------------------------------------------------
  // GAMING HOUSE & ARENA UPGRADES
  // -------------------------------------------------------------

  public upgradeGamingHouse(facilityKey: 'gamingPCsLevel' | 'internetLevel' | 'equipmentLevel' | 'analysisRoomLevel' | 'recoveryGymLevel' | 'streamingStudioLevel'): { success: boolean; message: string } {
    const state = this.getOrCreateState();
    const currentLvl = state.gamingHouse[facilityKey];
    if (currentLvl >= 5) return { success: false, message: 'Максимальный уровень уже достигнут (Уровень 5)' };

    // Check industrial factory synergy
    const rootState = gameState.getState();
    const hasIndustrialFactory = (rootState.industrial?.factories?.length || 0) > 0;
    const baseCost = (currentLvl + 1) * 35000;
    const finalCost = (facilityKey === 'gamingPCsLevel' && hasIndustrialFactory) ? Math.round(baseCost * 0.5) : baseCost;

    if (rootState.cash < finalCost) {
      return { success: false, message: `Недостаточно средств ($${finalCost.toLocaleString()})` };
    }

    gameState.update((root) => {
      root.cash -= finalCost;
      root.esports!.gamingHouse[facilityKey] += 1;
      root.esports!.gamingHouse.monthlyUpkeep += 2500;
    });

    return { success: true, message: `Улучшение выполнено! Новый уровень: ${currentLvl + 1}` };
  }

  public upgradeArena(facilityKey: 'level' | 'vipSuitesLevel' | 'foodConcessionsLevel' | 'merchStandsLevel' | 'adBannersLevel'): { success: boolean; message: string } {
    const state = this.getOrCreateState();
    const currentLvl = state.arena[facilityKey];
    if (currentLvl >= 5) return { success: false, message: 'Максимальный уровень арены достигнут' };

    const cost = (currentLvl + 1) * 120000;
    if (gameState.getState().cash < cost) {
      return { success: false, message: `Недостаточно средств на модернизацию ($${cost.toLocaleString()})` };
    }

    gameState.update((root) => {
      root.cash -= cost;
      root.esports!.arena[facilityKey] += 1;
      if (facilityKey === 'level') {
        root.esports!.arena.seatCapacity += 3500;
        root.esports!.arena.monthlyMaintenance += 12000;
      }
    });

    return { success: true, message: `Арена успешно модернизирована до Уровня ${currentLvl + 1}!` };
  }

  public setArenaTicketPrice(price: number): void {
    this.updateState((draft) => {
      draft.arena.ticketPrice = Math.max(5, Math.min(250, price));
    });
  }

  // -------------------------------------------------------------
  // TOURNAMENTS & MATCH SIMULATION
  // -------------------------------------------------------------

  public participateInTournament(tournamentId: string): { success: boolean; message: string } {
    const state = this.getOrCreateState();
    const tournament = state.tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return { success: false, message: 'Турнир не найден' };

    const roster = state.rosters[tournament.disciplineId];
    const discipline = ESPORTS_DISCIPLINES[tournament.disciplineId];
    if (roster.activePlayerIds.length < discipline.rosterSize) {
      return { success: false, message: `Неполный состав! Требуется ${discipline.rosterSize} игроков в старте ${discipline.name}` };
    }

    this.updateState((draft) => {
      const t = draft.tournaments.find((item) => item.id === tournamentId)!;
      t.status = 'ongoing';
      draft.rosters[tournament.disciplineId].isParticipatingInTournament = true;
      draft.rosters[tournament.disciplineId].currentTournamentId = tournamentId;
    });

    return { success: true, message: `Команда ${roster.teamName} зарегистрирована на турнир ${tournament.name}!` };
  }

  public playTournamentMatch(tournamentId: string): TournamentMatch | null {
    const state = this.getOrCreateState();
    const tournament = state.tournaments.find((t) => t.id === tournamentId);
    if (!tournament || tournament.status !== 'ongoing') return null;

    const roster = state.rosters[tournament.disciplineId];
    const activePlayers = state.players.filter((p) => roster.activePlayerIds.includes(p.id));
    const coach = state.staff.find((s) => s.role === 'head_coach' && (s.assignedDisciplineId === tournament.disciplineId || s.assignedDisciplineId === 'all'));

    const roundNames = ['Четвертьфинал', 'Полуфинал', 'Гранд-Финал'];
    const currentRoundName = roundNames[tournament.currentRound - 1] || 'Матч турнира';

    const rivalName = tournament.participantTeamNames[Math.floor(Math.random() * tournament.participantTeamNames.length)] || 'Cyber Wolves';
    const rivalRating = Math.min(98, Math.max(65, 75 + (tournament.currentRound * 5) + Math.floor(Math.random() * 8)));

    const matchResult = simulateEsportsMatch({
      tournamentId,
      roundName: currentRoundName,
      disciplineId: tournament.disciplineId,
      teamA: {
        id: 'player_org',
        name: roster.teamName,
        roster,
        players: activePlayers,
        coachRating: coach?.rating || 70,
        facilityBoost: state.gamingHouse.gamingPCsLevel,
      },
      teamB: {
        id: `ai_${rivalName}`,
        name: rivalName,
        rating: rivalRating,
      },
    });

    const isWon = matchResult.winnerId === 'player_org';

    gameState.update((root) => {
      const esports = root.esports!;
      const t = esports.tournaments.find((item) => item.id === tournamentId)!;
      t.matches.push(matchResult);
      esports.matchHistory.unshift(matchResult);

      const r = esports.rosters[t.disciplineId];
      if (isWon) {
        r.winLoss.wins++;
        r.rankingPoints += 45;
        r.chemistry = Math.min(100, r.chemistry + 3);
        r.form = Math.min(100, r.form + 2);

        if (t.currentRound >= t.totalRounds) {
          // WON TOURNAMENT!
          t.status = 'finished';
          t.winnerTeamName = r.teamName;
          const prize = t.prizes.firstPlace;
          root.cash += prize;
          r.trophies++;
          r.totalEarnings += prize;
          esports.organization.totalPrizeMoneyEarned += prize;
          esports.organization.totalTrophiesCount++;
          esports.organization.fansCount += Math.round(t.prizePool * 0.08);
          esports.stats.totalTournamentsWon++;
          esports.stats.biggestPrizeCheck = Math.max(esports.stats.biggestPrizeCheck, prize);
          r.isParticipatingInTournament = false;
          r.currentTournamentId = null;

          // Check sponsors bonus
          esports.sponsors.filter((s) => s.isActive).forEach((s) => {
            root.cash += s.tournamentVictoryBonus;
          });
        } else {
          t.currentRound++;
        }
      } else {
        // Lost match
        r.winLoss.losses++;
        t.status = 'finished';
        t.winnerTeamName = rivalName;
        const consolation = t.currentRound === 1 ? t.prizes.participationPrize : t.prizes.secondPlace;
        root.cash += consolation;
        r.totalEarnings += consolation;
        esports.organization.totalPrizeMoneyEarned += consolation;
        r.isParticipatingInTournament = false;
        r.currentTournamentId = null;
      }

      // Add fatigue to players
      activePlayers.forEach((p) => {
        const target = esports.players.find((pl) => pl.id === p.id);
        if (target) {
          target.fatigue = Math.min(100, target.fatigue + 15);
          target.history.matchesPlayed++;
          if (isWon) target.history.winrate = Math.round(((target.history.winrate * (target.history.matchesPlayed - 1) + 100) / target.history.matchesPlayed) * 10) / 10;
        }
      });

      this.updateRankings(esports, t.disciplineId);
    });

    return matchResult;
  }

  // -------------------------------------------------------------
  // SPONSORS & MERCH STORE
  // -------------------------------------------------------------

  public signSponsor(sponsorId: string): { success: boolean; message: string } {
    const state = this.getOrCreateState();
    const sponsor = state.sponsors.find((s) => s.id === sponsorId);
    if (!sponsor) return { success: false, message: 'Спонсор не найден' };

    if (state.organization.fansCount < sponsor.minFansRequired) {
      return { success: false, message: `Недостаточно фанатов. Требуется: ${sponsor.minFansRequired.toLocaleString()}` };
    }

    this.updateState((draft) => {
      const s = draft.sponsors.find((item) => item.id === sponsorId)!;
      s.isActive = true;
      s.monthsRemaining = s.durationMonths;
    });

    return { success: true, message: `Спонсорский контракт с ${sponsor.companyName} подписан! (+$${sponsor.monthlyPayment.toLocaleString()}/мес)` };
  }

  public restockMerchWithTextileFactory(merchId: string, quantity: number): { success: boolean; message: string } {
    const state = this.getOrCreateState();
    const merch = state.merch.find((m) => m.id === merchId);
    if (!merch) return { success: false, message: 'Товар не найден' };

    // Check if player owns a textile factory or industrial plant
    const root = gameState.getState();
    const hasTextile = root.businesses.some((b) => b.category === 'factory' || b.name.toLowerCase().includes('текстил'));
    const unitCost = hasTextile ? Math.round(merch.unitCost * 0.5) : merch.unitCost;
    const totalCost = unitCost * quantity;

    if (root.cash < totalCost) {
      return { success: false, message: `Недостаточно средств ($${totalCost.toLocaleString()})` };
    }

    gameState.update((draft) => {
      draft.cash -= totalCost;
      const target = draft.esports!.merch.find((m) => m.id === merchId)!;
      target.stock += quantity;
      target.suppliedByTextileFactory = hasTextile;
    });

    return { success: true, message: `Заказано ${quantity} шт. ${merch.name}. ${hasTextile ? 'Скидка -50% за счет собственной текстильной фабрики!' : ''}` };
  }

  public launchMediaCampaign(type: 'highlights' | 'vlog' | 'interview' | 'announcement' | 'stream_marathon'): { success: boolean; message: string } {
    const costs: Record<string, number> = {
      highlights: 8000,
      vlog: 15000,
      interview: 12000,
      announcement: 5000,
      stream_marathon: 25000,
    };
    const cost = costs[type] || 10000;
    const cash = gameState.getState().cash;
    if (cash < cost) return { success: false, message: `Недостаточно средств ($${cost.toLocaleString()})` };

    const fanGain = type === 'stream_marathon' ? 18000 : type === 'highlights' ? 9500 : 6000;

    gameState.update((draft) => {
      draft.cash -= cost;
      draft.esports!.organization.fansCount += fanGain;
      draft.esports!.media.followers += Math.round(fanGain * 1.6);
      draft.esports!.media.activeCampaigns.push({
        id: `camp_${Date.now()}`,
        title: `Медиа-кампания: ${type.toUpperCase()}`,
        type,
        cost,
        fanGain,
        hypeDaysRemaining: 7,
      });
    });

    return { success: true, message: `Медиа-кампания запущена! Получено +${fanGain.toLocaleString()} новых фанатов!` };
  }

  // -------------------------------------------------------------
  // SIMULATION TICKS (Hourly / Daily Background Engine)
  // -------------------------------------------------------------

  public handleHourTick(_totalHours?: number): void {
    const state = this.getOrCreateState();

    // Minor player fatigue recovery in Gaming House
    const recoveryBoost = state.gamingHouse.recoveryGymLevel * 0.4;
    this.updateState((draft) => {
      draft.players.forEach((p) => {
        if (p.fatigue > 0) {
          p.fatigue = Math.max(0, p.fatigue - (1 + recoveryBoost));
        }
      });
    });
  }

  public handleDayTick(day?: number): void {
    const state = this.getOrCreateState();
    const rootState = gameState.getState();

    // 1. Calculate Monthly Sponsor Income (daily pro-rata)
    const activeSponsors = state.sponsors.filter((s) => s.isActive);
    const dailySponsorIncome = Math.round(
      activeSponsors.reduce((acc, s) => acc + s.monthlyPayment, 0) / 30
    );

    // 2. Merch Store Daily Sales
    let dailyMerchProfit = 0;
    const fanMultiplier = Math.min(5, Math.max(0.5, state.organization.fansCount / 50000));
    state.merch.forEach((m) => {
      const sold = Math.min(m.stock, Math.round((m.monthlySales / 30) * fanMultiplier));
      if (sold > 0) {
        const profit = sold * (m.retailPrice - (m.suppliedByTextileFactory ? m.unitCost * 0.5 : m.unitCost));
        dailyMerchProfit += profit;
      }
    });

    // 3. Arena Daily Concessions & Ticket Revenue
    const arenaAttendance = Math.min(state.arena.seatCapacity, Math.round(state.arena.seatCapacity * (state.organization.fansCount / 100000)));
    const dailyArenaRev = Math.round((arenaAttendance * state.arena.ticketPrice * 0.15) / 30) + 1200;

    // 4. Salaries & Upkeep (daily pro-rata)
    const ownedPlayers = state.players.filter((p) => p.teamId === 'player_org');
    const dailyPlayerSalaries = Math.round(ownedPlayers.reduce((acc, p) => acc + p.salary, 0) / 30);
    const dailyStaffSalaries = Math.round(state.staff.reduce((acc, s) => acc + s.salary, 0) / 30);
    const dailyFacilityUpkeep = Math.round((state.gamingHouse.monthlyUpkeep + state.arena.monthlyMaintenance) / 30);

    const netDailyProfit = (dailySponsorIncome + dailyMerchProfit + dailyArenaRev) - (dailyPlayerSalaries + dailyStaffSalaries + dailyFacilityUpkeep);

    gameState.update((draft) => {
      draft.cash += netDailyProfit;
      const esports = draft.esports!;

      // Deduct sold merch
      esports.merch.forEach((m) => {
        const sold = Math.min(m.stock, Math.round((m.monthlySales / 30) * fanMultiplier));
        m.stock = Math.max(0, m.stock - sold);
      });

      // Training progress per discipline
      ALL_DISCIPLINE_IDS.forEach((dId) => {
        const roster = esports.rosters[dId];
        const active = esports.players.filter((p) => roster.activePlayerIds.includes(p.id));
        active.forEach((p) => {
          if (p.rating < p.potential && Math.random() > 0.6) {
            p.rating += 0.05;
            p.rating = Math.round(p.rating * 100) / 100;
          }
        });
      });

      // Generate new upcoming tournaments if old finished
      if (esports.tournaments.filter((t) => t.status !== 'finished').length < 12) {
        const randomDId = ALL_DISCIPLINE_IDS[Math.floor(Math.random() * ALL_DISCIPLINE_IDS.length)];
        esports.tournaments.push(generateTournament(randomDId, 'major', day || 1));
      }
    });
  }

  private updateRankings(state: EsportsSubsystemState, disciplineId: DisciplineId): void {
    const list = state.rankings[disciplineId] || [];
    list.sort((a, b) => b.points - a.points);
    list.forEach((item, idx) => {
      item.change = item.rank - (idx + 1);
      item.rank = idx + 1;
    });
    const playerEntry = list.find((e) => e.isPlayerOrg);
    if (playerEntry) {
      state.rosters[disciplineId].worldRank = playerEntry.rank;
    }
  }

  private updateState(updater: (state: EsportsSubsystemState) => void): void {
    gameState.update((draft) => {
      if (!draft.esports) {
        draft.esports = createInitialEsportsState();
      }
      updater(draft.esports);
    });
  }
}

export const esportsManager = new EsportsManager();
