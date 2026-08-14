/**
 * Business Empire: Ultimate
 * Esports Empire — Virtual Pro Players Procedural Generator
 * Generates rich virtual players with authentic nicknames, regional names,
 * attributes, potentials, market values, and discipline-tailored stats.
 */

import { DisciplineId, EsportsRegion, ProPlayer, PlayerAttributes } from '../../types/esports';
import { ESPORTS_DISCIPLINES } from './esportsDisciplines';

export const REGIONS: EsportsRegion[] = [
  'Europe',
  'CIS',
  'North America',
  'South America',
  'Brazil',
  'Asia',
  'China',
  'Japan',
  'Korea',
  'Middle East',
  'Oceania',
  'Southeast Asia',
];

const REGIONAL_FLAG_EMOJIS: Record<EsportsRegion, string> = {
  Europe: '🇪🇺',
  CIS: '🌐',
  'North America': '🇺🇸',
  'South America': '🇦🇷',
  Brazil: '🇧🇷',
  Asia: '🌏',
  China: '🇨🇳',
  Japan: '🇯🇵',
  Korea: '🇰🇷',
  'Middle East': '🇦🇪',
  Oceania: '🇦🇺',
  'Southeast Asia': '🇸🇬',
};

const FIRST_NAMES: Record<EsportsRegion, string[]> = {
  Europe: ['Lucas', 'Oliver', 'Noah', 'Leo', 'Mathias', 'Felix', 'Gabriel', 'Elias', 'Maximilian', 'Hugo', 'Arthur', 'Oscar'],
  CIS: ['Александр', 'Дмитрий', 'Илья', 'Кирилл', 'Максим', 'Артем', 'Никита', 'Даниил', 'Иван', 'Егор', 'Тимур', 'Михаил'],
  'North America': ['Jack', 'Alex', 'Ryan', 'Brandon', 'Tyler', 'Connor', 'Ethan', 'Jacob', 'Mason', 'Dylan', 'Logan', 'Caleb'],
  'South America': ['Mateo', 'Santiago', 'Agustin', 'Facundo', 'Nicolas', 'Tomas', 'Ignacio', 'Franco', 'Sebastian', 'Joaquin'],
  Brazil: ['Gabriel', 'Lucas', 'Matheus', 'Felipe', 'Bruno', 'Leonardo', 'Vinicius', 'Rodrigo', 'Thiago', 'Guilherme'],
  Asia: ['Kenji', 'Tatsuya', 'Min-ho', 'Ji-hoon', 'Wei', 'Jun-jie', 'Arata', 'Siddharth', 'Aarav', 'Thanh', 'Bao', 'Rey'],
  China: ['Yufan', 'Zihao', 'Haoran', 'Junhao', 'Yuxuan', 'Ziteng', 'Bohao', 'Mingxuan', 'Tianyu', 'Rui'],
  Japan: ['Ren', 'Haruto', 'Souta', 'Yuto', 'Daiki', 'Kaito', 'Ryota', 'Shun', 'Kazuki', 'Takumi'],
  Korea: ['Sang-hyeok', 'Jae-hyuk', 'Min-seok', 'Woo-je', 'Hyeon-jun', 'Si-woo', 'Geon-bu', 'Bo-seong', 'Su-hwan', 'Chang-hyun'],
  'Middle East': ['Tariq', 'Omar', 'Zaid', 'Yousef', 'Khalid', 'Faris', 'Hamza', 'Karim', 'Sami', 'Nader'],
  Oceania: ['Liam', 'Jack', 'Lachlan', 'Cooper', 'Bailey', 'Harrison', 'Finn', 'Archie', 'Flynn', 'Declan'],
  'Southeast Asia': ['Rafi', 'Kurniawan', 'Pratama', 'Nguyen', 'Somchai', 'Ananda', 'Putra', 'Wijaya', 'Santoso', 'Lim'],
};

const LAST_NAMES: Record<EsportsRegion, string[]> = {
  Europe: ['Müller', 'Schmidt', 'Andersson', 'Larsen', 'Dubois', 'Moreau', 'Nielsen', 'Hansen', 'Jensen', 'Novak'],
  CIS: ['Морозов', 'Соколов', 'Ковалев', 'Волков', 'Васильев', 'Попов', 'Смирнов', 'Кузнецов', 'Новиков', 'Петров'],
  'North America': ['Miller', 'Johnson', 'Smith', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson'],
  'South America': ['Gonzalez', 'Rodriguez', 'Gomez', 'Fernandez', 'Lopez', 'Diaz', 'Martinez', 'Perez', 'Romero'],
  Brazil: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Carvalho', 'Almeida', 'Ferreira', 'Ribeiro'],
  Asia: ['Tanaka', 'Sato', 'Suzuki', 'Takahashi', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato'],
  China: ['Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou'],
  Japan: ['Takahashi', 'Watanabe', 'Kobayashi', 'Yamamoto', 'Nakamura', 'Yoshida', 'Yamada', 'Sasaki', 'Saito'],
  Korea: ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho', 'Yoon', 'Jang', 'Lim'],
  'Middle East': ['Al-Mansoor', 'Al-Hashimi', 'Haddad', 'Nasser', 'Qasim', 'Saleh', 'Farhat', 'Najjar', 'Barakat'],
  Oceania: ['Smith', 'Jones', 'Williams', 'Brown', 'Wilson', 'Taylor', 'Morton', 'Kelly', 'Campbell', 'Johnston'],
  'Southeast Asia': ['Prasetyo', 'Hartono', 'Susanto', 'Kusuma', 'Gunawan', 'Chua', 'Tan', 'Wong', 'Lee', 'Phan'],
};

const NICKNAMES_BY_GENRE: Record<string, string[]> = {
  'FPS/Tactical': [
    'Shadow', 'Vortex', 'Phantom', 'Blitz', 'Scythe', 'Reaper', 'Frost', 'Apex', 'SniperX', 'Spectre',
    'Venom', 'Hydra', 'Trigger', 'Ghost', 'Zero', 'Krypton', 'Vandal', 'Headshot', 'Havoc', 'Rogue',
    'Zephyr', 'Nova', 'Pulse', 'Mirage', 'Titan', 'Omen', 'Bullet', 'Crest', 'Echo', 'Raptor',
  ],
  MOBA: [
    'Chronos', 'Aegis', 'Solaris', 'Mythic', 'Oracle', 'Nemesis', 'Frenzy', 'Nexus', 'Dominion', 'Astral',
    'Eclipse', 'Valkyrie', 'Tempest', 'Kraken', 'Sovereign', 'Archon', 'Karma', 'Spell', 'Zeus', 'Rune',
    'GankGod', 'CarryLord', 'MidKing', 'Blade', 'Abyss', 'Zenith', 'Phantom', 'Cosmo', 'Void', 'Slayer',
  ],
  'Battle Royale': [
    'Survivor', 'Storm', 'DropZone', 'ZoneLord', 'Predator', 'ClutchKing', 'TarpGod', 'Glider', 'Falcon', 'Eagle',
    'Bounty', 'Viper', 'Hazard', 'Rampage', 'Canyon', 'Flank', 'Bulletproof', 'Hunter', 'Overdrive', 'Havoc',
  ],
  'Strategy/RTS': [
    'MindBender', 'Grandmaster', 'Overlord', 'Tactician', 'Matrix', 'Nexus', 'APMGod', 'CyberBrain', 'Strategos', 'Goliath',
    'HiveMind', 'Alpha', 'Calculus', 'Savant', 'IronWill', 'Chronicle', 'Empirical', 'Archon', 'Vanguard', 'Omega',
  ],
  'Card/Autobattler': [
    'HighRoll', 'DeckMaster', 'Augment', 'EconKing', 'Pivot', 'Lethal', 'RNGsus', 'Gambit', 'Sovereign', 'CardSharper',
    'TopDeck', 'ManaFlow', 'Tactix', 'ChessLord', 'Synergy', 'HyperRoll', 'Fast8', 'Arcana', 'Shuffle', 'Wildcard',
  ],
  'Sports/Arcade': [
    'Striker', 'Turbo', 'AerialGod', 'Flick', 'Rocket', 'Nitro', 'Drifter', 'Boost', 'Cruiser', 'Flash',
    'Goalie', 'Pinnacle', 'Dynamo', 'Velocity', 'Sonic', 'Spike', 'Dash', 'Whirlwind', 'Ace', 'Tornado',
  ],
  Chess: [
    'GrandmasterX', 'DeepBlue', 'MagnusMind', 'Checkmate', 'KnightRider', 'QueenGambit', 'BlitzPro', 'PawnStorm', 'BulletKing', 'Sicilian',
    'RookSlayer', 'Positional', 'FischerEye', 'EndgameBoss', 'ClockMaster', 'TheoryGod', 'MindFortress', 'TacticsLord', 'EnPassant', 'Immortal',
  ],
};

export function generateProPlayer(
  disciplineId: DisciplineId,
  options?: {
    forcedRating?: number;
    forcedPotential?: number;
    teamId?: string | null;
    teamName?: string | null;
    region?: EsportsRegion;
  }
): ProPlayer {
  const discipline = ESPORTS_DISCIPLINES[disciplineId];
  const region: EsportsRegion = options?.region || REGIONS[Math.floor(Math.random() * REGIONS.length)];
  const flagEmoji = REGIONAL_FLAG_EMOJIS[region];

  const firstNames = FIRST_NAMES[region];
  const lastNames = LAST_NAMES[region];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const realName = `${firstName} ${lastName}`;

  const genreNicknames = NICKNAMES_BY_GENRE[discipline.genre] || NICKNAMES_BY_GENRE['FPS/Tactical'];
  const baseNickname = genreNicknames[Math.floor(Math.random() * genreNicknames.length)];
  const suffix = Math.random() > 0.6 ? `${Math.floor(Math.random() * 99) + 1}` : '';
  const nickname = `${baseNickname}${suffix}`;

  // Age: 16 to 27
  const age = Math.floor(Math.random() * 11) + 17;

  // Rating & Potential
  let rating = options?.forcedRating;
  if (rating === undefined) {
    // Bell curve 65 - 94, average around 76
    const r1 = Math.random();
    const r2 = Math.random();
    const mean = 76;
    const stdDev = 7;
    const z = Math.sqrt(-2.0 * Math.log(r1)) * Math.cos(2.0 * Math.PI * r2);
    rating = Math.round(Math.min(96, Math.max(60, mean + z * stdDev)));
  }

  let potential = options?.forcedPotential;
  if (potential === undefined) {
    const growthRoom = age <= 20 ? Math.floor(Math.random() * 15) + 3 : Math.floor(Math.random() * 5);
    potential = Math.min(99, rating + growthRoom);
  }

  // Pick Role from Discipline catalog
  const role = discipline.roles[Math.floor(Math.random() * discipline.roles.length)];

  // Form, Morale, Fatigue, Experience
  const form = Math.floor(Math.random() * 25) + 75; // 75-99
  const morale = Math.floor(Math.random() * 20) + 80;
  const fatigue = Math.floor(Math.random() * 20); // 0-20
  const experience = Math.min(99, Math.floor((age - 16) * 9 + Math.random() * 15));
  const popularity = Math.round(Math.min(99, Math.max(10, (rating - 50) * 1.8 + Math.random() * 10)));

  // Financial calculations
  // Monthly salary based on rating: 70 -> $3,500, 80 -> $12,000, 90 -> $45,000, 95+ -> $90,000+
  const salaryBase = Math.pow(rating / 50, 4.2) * 1200;
  const salary = Math.round(salaryBase / 100) * 100;

  // Market Value: based on rating, potential, age, and contract
  const ageMultiplier = age <= 21 ? 1.4 : age <= 24 ? 1.1 : 0.85;
  const potentialBonus = Math.max(0, potential - rating) * 35000;
  const marketValue = Math.round((Math.pow(rating / 50, 4.8) * 45000 * ageMultiplier + potentialBonus) / 1000) * 1000;

  // Attributes
  const variance = () => Math.round((Math.random() - 0.5) * 12);
  const clampStat = (val: number) => Math.min(99, Math.max(45, val));

  const attributes: PlayerAttributes = {
    aim: clampStat(rating + variance()),
    reaction: clampStat(rating + variance()),
    strategy: clampStat(rating + variance()),
    gameKnowledge: clampStat(rating + variance()),
    communication: clampStat(rating + variance()),
    teamwork: clampStat(rating + variance()),
    mechanics: clampStat(rating + variance()),
    consistency: clampStat(rating + variance()),
    // Specialty stats
    utility: clampStat(rating + variance()),
    positioning: clampStat(rating + variance()),
    mapAwareness: clampStat(rating + variance()),
    farming: clampStat(rating + variance()),
    decisionMaking: clampStat(rating + variance()),
    teamfight: clampStat(rating + variance()),
    drafting: clampStat(rating + variance()),
    movement: clampStat(rating + variance()),
  };

  const matchesPlayed = Math.floor(experience * 4.5 + Math.random() * 50);
  const winrate = Math.round((48 + (rating - 70) * 0.6 + (Math.random() * 8 - 4)) * 10) / 10;
  const mvpAwards = Math.floor((matchesPlayed * (rating / 100) * 0.22));
  const trophies = Math.floor(rating >= 85 ? (rating - 82) * 1.5 + Math.random() * 2 : Math.random() * 1.2);
  const totalEarnings = Math.round(trophies * 45000 + matchesPlayed * 650);

  return {
    id: `player_${disciplineId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    nickname,
    realName,
    age,
    gameId: disciplineId,
    role,
    region,
    nationalityEmoji: flagEmoji,
    rating,
    potential,
    salary,
    marketValue,
    popularity,
    form,
    morale,
    fatigue,
    experience,
    contractMonths: Math.floor(Math.random() * 18) + 6,
    attributes,
    teamId: options?.teamId !== undefined ? options.teamId : null,
    teamName: options?.teamName !== undefined ? options.teamName : null,
    history: {
      matchesPlayed,
      winrate: Math.min(85, Math.max(35, winrate)),
      mvpAwards,
      trophies,
      totalEarnings,
    },
  };
}

export function generateInitialPlayerDatabase(): ProPlayer[] {
  const players: ProPlayer[] = [];
  const disciplines = Object.keys(ESPORTS_DISCIPLINES) as DisciplineId[];

  disciplines.forEach((dId) => {
    // Generate 12-16 players per discipline for the transfer pool / free agents
    const count = 14;
    for (let i = 0; i < count; i++) {
      players.push(generateProPlayer(dId));
    }
  });

  return players;
}
