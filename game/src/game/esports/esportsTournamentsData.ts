/**
 * Business Empire: Ultimate
 * Esports Empire — Tournaments Generator & AI Rival Teams
 */

import { DisciplineId, EsportsRegion, EsportsTournament, TournamentTier } from '../../types/esports';
import { ESPORTS_DISCIPLINES } from './esportsDisciplines';

export const AI_RIVAL_ORGS: Record<DisciplineId, string[]> = {
  // Mobile
  standoff_2: ['Saints Esports', 'Horizon Team', 'Absolute Zero', 'Revive GG', 'Cyber Storm', 'Virtus Pro Mobile', 'HellRaisers SO2', 'Nemesis Squad'],
  mlbb: ['ONIC Esports', 'RRQ Hoshi', 'Blacklist International', 'AP.Bren', 'ECHO Philippines', 'Team Liquid ID', 'Fnatic ONIC', 'Geek Fam'],
  honor_of_kings: ['AG Super Play', 'Wolves Esports', 'eStar Pro', 'WB Gaming', 'Hero JiuJing', 'TTG Guangzhou', 'LGD Gaming', 'DRG Esports'],
  arena_of_valor: ['Talon Esports', 'Bacon Time', 'Buriram United', 'Flash Gaming', 'V Gaming', 'One Team Esports', 'BRO Esports', 'Saigon Phantom'],
  free_fire: ['Magic Squad', 'LOUD FF', 'Buriram United FF', 'Miners gg', 'Fluxo', 'Evos Phoenix', 'WJS Esports', 'EXP Esports'],
  clash_royale: ['SK Gaming', 'Tribe Gaming', 'Team Queso', 'Chasmac Gaming', 'Nova Esports CR', 'Mkers', 'Furious Gaming', 'Giants Gaming'],
  brawl_stars: ['ZETA DIVISION', 'SK Gaming BS', 'STMN Esports', 'Tribe Gaming BS', 'Crazy Raccoon', 'FUT Esports', 'Reply Totem', 'Luminosity'],
  pubg_mobile: ['IHC Esports', 'Alpha7 Esports', 'Vampire Esports', 'Stalwart Esports', 'Nova Esports PM', 'S2G Esports', 'Dplus KIA', 'Reject'],
  bgmi: ['GodLike Esports', 'Team Soul', 'Gladiator Esports', 'Blind Esports', 'Revenant Esports', 'Team XSpark', 'Gods Reign', 'Entity Gaming'],
  cod_mobile: ['Luminosity Gaming', 'Tribe Gaming CODM', 'Wolves CODM', 'Q9 Esports', 'Elevate', 'Team Vitality IN', 'Stand Point', 'Kings Gaming'],
  garena_free_fire: ['LOUD Pro', 'Magic Squad FF', 'Morph Team', 'Gods Plan', 'Vanguard Esports', 'Cyber Wolves GFF', 'Titan Squad', 'Nova GFF'],

  // PC
  cs2: ['Natus Vincere (NAVI)', 'Team Vitality', 'FaZe Clan', 'Team Spirit', 'G2 Esports', 'MOUZ', 'Virtus.pro', 'Astralis', 'Team Liquid', 'Cloud9', 'HEROIC', 'Complexity'],
  dota_2: ['Team Spirit', 'Gaimin Gladiators', 'Team Falcons', 'Team Liquid', 'BetBoom Team', 'OG Esports', 'Xtreme Gaming', 'Tundra Esports', 'Entity', 'PSG Quest'],
  lol: ['T1 (Telecom)', 'Gen.G Esports', 'Bilibili Gaming (BLG)', 'TOP Esports (TES)', 'G2 Esports LOL', 'Fnatic', 'Weibo Gaming', 'Hanwha Life', 'FlyQuest', 'JD Gaming'],
  valorant: ['Sentinels', 'Fnatic VAL', 'Paper Rex', 'Team Heretics', 'EDward Gaming (EDG)', 'Leviatán', 'Gen.G VAL', 'DRX', 'LOUD', 'NRG Esports'],
  r6_siege: ['w7m esports', 'FaZe Clan R6', 'FURIA Esports', 'DarkZero', 'Spacestation Gaming', 'G2 Esports R6', 'Bleed Esports', 'Team Secret'],
  apex_legends: ['DarkZero Apex', 'TSM Pro', 'Spacestation Apex', 'Fnatic Apex', 'Reject Win', 'Legends Gaming', 'Alliance', 'Moist Esports'],
  starcraft_2: ['Team Liquid SC2', 'Shopify Rebellion', 'BASILISK', 'Twisted Minds', 'Dragon Phoenix Gaming', 'DKZ Gaming', 'Crazy Raccoon SC2', 'Team NV'],
  overwatch_2: ['Crazy Raccoon OW', 'Team Falcons OW', 'Toronto Defiant', 'Spacestation OW', 'Fnatic OW', 'Twisted Minds OW', 'ZETA DIVISION OW', 'ENCE'],
  rocket_league: ['Team BDS', 'Team Vitality RL', 'G2 Stride', 'Karmine Corp', 'Gentle Mates Alpine', 'FURIA RL', 'Spacestation RL', 'Team Falcons RL'],
  deadlock: ['Neon Cyber', 'Valve Masters', 'Vortex Prime', 'Omni Gaming', 'Deadlock Kings', 'Shadow Syndicate', 'Abyss Clan', 'Titan Deadlock'],

  // Cross-platform & Web
  hearthstone: ['Team Liquid HS', 'Cloud9 HS', 'Method Pro', 'Tempo Storm', 'Team Celestial', 'Complexity HS', 'SK Gaming HS', 'NaVi HS'],
  tft: ['Team Liquid TFT', 'Karmine Corp TFT', 'T1 TFT', 'Wolves TFT', 'Vitality TFT', 'Splyce', 'Team SoloMid TFT', 'Aegis TFT'],
  wild_rift: ['Nova Esports WR', 'J Team', 'KT Rolster WR', 'Team Secret WR', 'Flash Wolves', 'Buriram WR', 'RRQ WR', 'Sentinels WR'],
  fortnite: ['FaZe Clan FN', 'Become Legends', 'Guild Esports', 'Wave Esports', 'Team Falcons FN', 'Dignitas', 'Heroic FN', 'LootBoy'],
  chess_com: ['Gotham Knights', 'Levitov Chess Masters', 'Chessbrahs Team', 'Norway GMs', 'Saint Louis Arch Bishops', 'Indian Prodigies', 'Hikaru Blitzers', 'Carlsen Kings'],
  lichess: ['Lichess Berserkers', 'Bullet Kings', 'Grandmaster United', 'Arena Gladiators', 'Checkmate Society', 'Elite Blitzers', 'Ultra Bullet Squad', 'Open Source Masters'],
};

const TOURNAMENT_NAMES_BY_TIER: Record<TournamentTier, (discName: string) => string> = {
  local: (d) => `Local Open Cup: ${d}`,
  regional: (d) => `Regional Masters: ${d}`,
  national: (d) => `National Pro League: ${d}`,
  international: (d) => `International Championship: ${d}`,
  major: (d) => `Major Circuit Premier: ${d}`,
  world_championship: (d) => `WORLD CHAMPIONSHIP: ${d}`,
};

export function generateTournament(
  disciplineId: DisciplineId,
  tier: TournamentTier,
  startDay: number
): EsportsTournament {
  const discipline = ESPORTS_DISCIPLINES[disciplineId];
  const nameGenerator = TOURNAMENT_NAMES_BY_TIER[tier];
  const name = nameGenerator(discipline.name);

  // Multipliers by tier
  const tierMultiplier: Record<TournamentTier, number> = {
    local: 0.05,
    regional: 0.15,
    national: 0.35,
    international: 0.75,
    major: 1.5,
    world_championship: 3.5,
  };

  const mult = tierMultiplier[tier];
  const prizePool = Math.round((discipline.prizePoolScale * mult) / 10000) * 10000;

  const firstPlace = Math.round(prizePool * 0.48);
  const secondPlace = Math.round(prizePool * 0.22);
  const thirdPlace = Math.round(prizePool * 0.14);
  const participationPrize = Math.round(prizePool * 0.02);

  const regionList: (EsportsRegion | 'Global')[] = [
    'Global', 'Europe', 'CIS', 'North America', 'Asia', 'China', 'Korea', 'Southeast Asia', 'Brazil',
  ];
  const region = tier === 'world_championship' || tier === 'major' ? 'Global' : regionList[Math.floor(Math.random() * regionList.length)];

  const rivalPool = AI_RIVAL_ORGS[disciplineId] || ['Team Alpha', 'Cyber Wolves', 'Titan Gaming', 'Nova Squad'];
  const shuffled = [...rivalPool].sort(() => 0.5 - Math.random());
  const teamsCount = tier === 'world_championship' ? 16 : 8;
  const participantTeamNames = shuffled.slice(0, teamsCount - 1);

  return {
    id: `tourn_${disciplineId}_${tier}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    disciplineId,
    name,
    tier,
    region,
    prizePool,
    prizes: {
      firstPlace,
      secondPlace,
      thirdPlace,
      participationPrize,
    },
    trophyName: `${discipline.name} ${tier.toUpperCase()} Trophy 🏆`,
    teamsCount,
    participantTeamNames,
    status: 'upcoming',
    dayStart: startDay,
    dayEnd: startDay + (tier === 'world_championship' ? 4 : 2),
    currentRound: 1,
    totalRounds: tier === 'world_championship' ? 4 : 3,
    matches: [],
    winnerTeamName: null,
  };
}

export function generateInitialTournaments(): EsportsTournament[] {
  const tournaments: EsportsTournament[] = [];
  const disciplines = Object.keys(ESPORTS_DISCIPLINES) as DisciplineId[];

  disciplines.forEach((dId, idx) => {
    // Generate an upcoming or active tournament for each discipline
    const tier: TournamentTier = idx % 5 === 0 ? 'world_championship' : idx % 3 === 0 ? 'major' : idx % 2 === 0 ? 'international' : 'regional';
    tournaments.push(generateTournament(dId, tier, 1 + (idx % 3)));
  });

  return tournaments;
}
