/**
 * Business Empire: Ultimate
 * Casino Empire — Game Registry & Catalog Generator
 */

import { CasinoCategory, CasinoGameDefinition, CasinoGameEngineType, GameVolatility } from '../../types/casino';

// Pre-defined rich handcrafted games
const BASE_GAMES: CasinoGameDefinition[] = [
  // 🎰 SLOTS
  {
    id: 'slot_pharaoh_gold',
    name: 'Pharaoh\'s Golden Tomb',
    category: 'slots',
    theme: 'Ancient Egypt',
    engineType: 'slot',
    minBet: 10,
    maxBet: 5000,
    rtp: 96.8,
    volatility: 'high',
    hasJackpot: true,
    jackpotType: 'mega',
    popularity: 98,
    activePlayersOnline: 1420,
    biggestWinMultiplier: 5000,
    thumbnailEmoji: '👑',
    bannerGradient: 'from-amber-600 to-yellow-900',
    tag: 'HOT',
    description: 'Легендарная гробница фараона с расширяющимися Wild-символами и множителем до 5000x.',
    rules: ['5 барабанов, 20 линий выплат', '3+ пирамиды запускают 10 фриспинов', 'Wild заменяет любые символы'],
    features: ['Expanding Wilds', 'Free Spins Multiplier 3x', 'Mega Jackpot Chance'],
  },
  {
    id: 'slot_vegas_royale',
    name: 'Vegas Royale 777',
    category: 'slots',
    theme: 'Vegas Classic',
    engineType: 'slot',
    minBet: 5,
    maxBet: 2500,
    rtp: 97.2,
    volatility: 'medium',
    hasJackpot: true,
    jackpotType: 'major',
    popularity: 95,
    activePlayersOnline: 1850,
    biggestWinMultiplier: 2500,
    thumbnailEmoji: '🎰',
    bannerGradient: 'from-rose-600 to-purple-950',
    tag: 'POPULAR',
    description: 'Классический слот Лас-Вегаса с неоновыми семерками, вишнями и золотыми колокольчиками.',
    rules: ['5 барабанов, 25 линий выплат', 'Семерки оплачиваются до 1000x', 'Scatter дает бонусные респины'],
  },
  {
    id: 'slot_diamond_strike',
    name: 'Diamond Strike Deluxe',
    category: 'slots',
    theme: 'Luxury Diamonds',
    engineType: 'slot',
    minBet: 20,
    maxBet: 10000,
    rtp: 96.5,
    volatility: 'high',
    hasJackpot: true,
    jackpotType: 'mega',
    popularity: 94,
    activePlayersOnline: 920,
    biggestWinMultiplier: 10000,
    thumbnailEmoji: '💎',
    bannerGradient: 'from-cyan-500 to-blue-900',
    tag: 'JACKPOT',
    description: 'Блеск бриллиантов и огромные джекпоты в королевском слот-зале.',
    rules: ['5 барабанов, 15 линий', 'Сбор 5 алмазов активирует Jackpot Wheel'],
  },
  {
    id: 'slot_wild_west_bounty',
    name: 'Wild West Outlaws',
    category: 'slots',
    theme: 'Wild West',
    engineType: 'slot',
    minBet: 10,
    maxBet: 4000,
    rtp: 96.4,
    volatility: 'high',
    hasJackpot: false,
    popularity: 91,
    activePlayersOnline: 810,
    biggestWinMultiplier: 3500,
    thumbnailEmoji: '🤠',
    bannerGradient: 'from-amber-700 to-orange-950',
    tag: 'NEW',
    description: 'Дуэль на Диком Западе: револьверы, шерифы и динамит с липкими вайлдами.',
    rules: ['5 барабанов, 20 линий', 'Вайлды фиксируются во время фриспинов'],
  },
  {
    id: 'slot_fruit_bonanza',
    name: 'Fruit Cocktail Bonanza',
    category: 'slots',
    theme: 'Fruits',
    engineType: 'slot',
    minBet: 2,
    maxBet: 1000,
    rtp: 97.5,
    volatility: 'low',
    hasJackpot: false,
    popularity: 89,
    activePlayersOnline: 1100,
    biggestWinMultiplier: 1200,
    thumbnailEmoji: '🍓',
    bannerGradient: 'from-pink-500 to-red-900',
    tag: 'CASUAL',
    description: 'Сочные клубнички, арбузы и лимоны с частыми выплатами и низким риском.',
    rules: ['3 барабана, 5 линий', 'Классическая фруктовая механика с респинами'],
  },

  // 🌸 ANIME
  {
    id: 'anime_neon_samurai',
    name: 'Neon Samurai: Blade of Destiny',
    category: 'anime',
    theme: 'Anime Samurai',
    engineType: 'slot',
    minBet: 15,
    maxBet: 7500,
    rtp: 96.9,
    volatility: 'high',
    hasJackpot: true,
    jackpotType: 'mega',
    popularity: 99,
    activePlayersOnline: 2400,
    biggestWinMultiplier: 7777,
    thumbnailEmoji: '⚔️',
    bannerGradient: 'from-fuchsia-600 via-pink-700 to-indigo-950',
    tag: 'HOT ANIME',
    description: 'Кибернетический самурай разрубает барабаны лазерной катаной, утраивая выигрыши!',
    rules: ['5 барабанов, 30 линий', 'Катана Самурая разрезает символы надвое', '12 Free Spins с множителем x5'],
  },
  {
    id: 'anime_demon_academy',
    name: 'Demon Academy: Dark Sorcery',
    category: 'anime',
    theme: 'Demon Magic',
    engineType: 'slot',
    minBet: 20,
    maxBet: 8000,
    rtp: 96.6,
    volatility: 'extreme',
    hasJackpot: true,
    jackpotType: 'major',
    popularity: 96,
    activePlayersOnline: 1650,
    biggestWinMultiplier: 12000,
    thumbnailEmoji: '🔮',
    bannerGradient: 'from-purple-600 to-violet-950',
    tag: 'EXTREME',
    description: 'Магическая академия демонов с каскадными падениями рун и инфернальным множителем.',
    rules: ['Каскадная механика выплат', 'Каждое совпадение увеличивает комбо-множитель'],
  },
  {
    id: 'anime_mecha_arena',
    name: 'Mecha Titans: Valkyrie Rising',
    category: 'anime',
    theme: 'Mecha Sci-Fi',
    engineType: 'slot',
    minBet: 25,
    maxBet: 10000,
    rtp: 97.0,
    volatility: 'high',
    hasJackpot: true,
    jackpotType: 'mega',
    popularity: 95,
    activePlayersOnline: 1980,
    biggestWinMultiplier: 8888,
    thumbnailEmoji: '🤖',
    bannerGradient: 'from-cyan-500 to-indigo-950',
    tag: 'TITAN',
    description: 'Битва гигантских мехов на орбитальной станции с трансформацией Wild-роботов.',
    rules: ['Сетка 6x5', 'Гигантские символы 3x3 Mecha'],
  },
  {
    id: 'anime_spirit_hunters',
    name: 'Spirit Hunters: Kitsune Fortune',
    category: 'anime',
    theme: 'Kitsune & Spirits',
    engineType: 'wheel',
    minBet: 10,
    maxBet: 5000,
    rtp: 96.7,
    volatility: 'medium',
    hasJackpot: false,
    popularity: 93,
    activePlayersOnline: 1120,
    biggestWinMultiplier: 3000,
    thumbnailEmoji: '🦊',
    bannerGradient: 'from-amber-500 to-rose-950',
    tag: 'POPULAR',
    description: 'Девятихвостая лисица вращает священное колесо духовных сокровищ.',
    rules: ['Колесо удачи с 18 секторами духов', 'Бонусные вращения Лисы'],
  },

  // 🌆 CYBERPUNK
  {
    id: 'cyber_neon_crash',
    name: 'Cyberpunk Rocket: Overdrive',
    category: 'crash',
    theme: 'Cyberpunk',
    engineType: 'crash',
    minBet: 5,
    maxBet: 20000,
    rtp: 97.0,
    volatility: 'extreme',
    hasJackpot: false,
    popularity: 100,
    activePlayersOnline: 3500,
    biggestWinMultiplier: 50000,
    thumbnailEmoji: '🚀',
    bannerGradient: 'from-emerald-500 via-teal-600 to-slate-950',
    tag: 'TOP CRASH',
    description: 'Кибернетическая ракета летит сквозь неоновый мегаполис. Забери выигрыш до взрыва!',
    rules: ['Множитель растет от 1.00x до 1000x+', 'Нажми Cash Out до момента Crash'],
  },
  {
    id: 'cyber_hacker_dice',
    name: 'Matrix Hacker: Cyber Dice',
    category: 'cyberpunk',
    theme: 'Hacking Matrix',
    engineType: 'dice',
    minBet: 5,
    maxBet: 15000,
    rtp: 98.0,
    volatility: 'low',
    hasJackpot: false,
    popularity: 92,
    activePlayersOnline: 940,
    biggestWinMultiplier: 980,
    thumbnailEmoji: '🎲',
    bannerGradient: 'from-green-500 to-slate-950',
    tag: 'LOW HOUSE EDGE',
    description: 'Взлом серверов мегакорпораций через числовые диапазоны с отдачей 98%.',
    rules: ['Выбери шанс победы от 1% до 95%', 'Мгновенный криптографический бросок'],
  },
  {
    id: 'cyber_neon_roulette',
    name: 'Neon Metropolis Roulette',
    category: 'roulette',
    theme: 'Cyberpunk City',
    engineType: 'roulette',
    minBet: 10,
    maxBet: 50000,
    rtp: 97.3,
    volatility: 'medium',
    hasJackpot: true,
    jackpotType: 'major',
    popularity: 97,
    activePlayersOnline: 1750,
    biggestWinMultiplier: 360,
    thumbnailEmoji: '🎡',
    bannerGradient: 'from-pink-500 to-indigo-950',
    tag: 'LUXURY',
    description: 'Европейская рулетка с голографическим неоновым колесом и лазерным шариком.',
    rules: ['Числа 0-36, красное/черное, дюжины, колонки', 'Выплата за прямое число 35:1'],
  },

  // 🚗 CAR GAMES
  {
    id: 'car_supercar_drag',
    name: 'Night City Supercar Drag Race',
    category: 'racing',
    theme: 'Street Racing',
    engineType: 'racing',
    minBet: 25,
    maxBet: 25000,
    rtp: 96.5,
    volatility: 'high',
    hasJackpot: true,
    jackpotType: 'major',
    popularity: 96,
    activePlayersOnline: 1890,
    biggestWinMultiplier: 4500,
    thumbnailEmoji: '🏎️',
    bannerGradient: 'from-red-600 via-orange-600 to-slate-950',
    tag: 'RACE',
    description: 'Выбери гиперкар, поставь ставку и обойди соперников на четверти мили с закисью азота!',
    rules: ['6 суперкаров с уникальными ТХ', 'Ставки на победителя, подиум и дуэль'],
  },
  {
    id: 'car_nitro_slots',
    name: 'Nitro Turbo 1000HP Slots',
    category: 'cars',
    theme: 'Tuning & Supercars',
    engineType: 'slot',
    minBet: 10,
    maxBet: 5000,
    rtp: 96.7,
    volatility: 'medium',
    hasJackpot: true,
    jackpotType: 'mini',
    popularity: 90,
    activePlayersOnline: 740,
    biggestWinMultiplier: 3000,
    thumbnailEmoji: '🚗',
    bannerGradient: 'from-blue-600 to-slate-900',
    tag: 'TURBO',
    description: 'Турбины, выхлопные системы и суперкары с ускоренными барабанами.',
    rules: ['5 барабанов, турбо-спины с гарантированным множителем'],
  },

  // 🐉 FANTASY
  {
    id: 'fantasy_dragon_king',
    name: 'Dragon King\'s Vault',
    category: 'fantasy',
    theme: 'Ancient Dragon',
    engineType: 'slot',
    minBet: 20,
    maxBet: 10000,
    rtp: 96.8,
    volatility: 'high',
    hasJackpot: true,
    jackpotType: 'mega',
    popularity: 97,
    activePlayersOnline: 2100,
    biggestWinMultiplier: 10000,
    thumbnailEmoji: '🐉',
    bannerGradient: 'from-red-600 to-amber-950',
    tag: 'MEGA JACKPOT',
    description: 'Огнедышащий древний дракон охраняет несметные золотые горы.',
    rules: ['Драконье дыхание превращает случайные символы в Wild', 'Бонус Драконьего Логова'],
  },
  {
    id: 'fantasy_wizard_cards',
    name: 'Archmage Spell Cards',
    category: 'fantasy',
    theme: 'Wizard Magic',
    engineType: 'card_battle',
    minBet: 15,
    maxBet: 8000,
    rtp: 96.5,
    volatility: 'medium',
    hasJackpot: false,
    popularity: 88,
    activePlayersOnline: 620,
    biggestWinMultiplier: 2500,
    thumbnailEmoji: '🧙',
    bannerGradient: 'from-indigo-600 to-slate-950',
    tag: 'PVE BATTLE',
    description: 'Карточная дуэль с верховным архимагом за кристаллы маны и сокровища.',
    rules: ['Собери комбинацию заклинаний сильнее оппонента'],
  },

  // 👹 BOSS BATTLES
  {
    id: 'boss_cyber_titan',
    name: 'Cyber Mecha Overlord Boss',
    category: 'boss',
    theme: 'Cyber Boss',
    engineType: 'boss',
    minBet: 50,
    maxBet: 50000,
    rtp: 96.5,
    volatility: 'extreme',
    hasJackpot: true,
    jackpotType: 'mega',
    popularity: 98,
    activePlayersOnline: 2600,
    biggestWinMultiplier: 20000,
    thumbnailEmoji: '👹',
    bannerGradient: 'from-red-700 via-purple-800 to-slate-950',
    tag: 'RAID BOSS',
    description: 'Сразись с механическим боссом с 1,000,000 HP! Наноси критические удары и забирай джекпот!',
    rules: ['Каждая ставка наносит урон боссу', 'Фаталити-удар срывает накопительный Джекпот'],
  },
  {
    id: 'boss_dragon_lord',
    name: 'Infernal Red Dragon Boss',
    category: 'boss',
    theme: 'Dragon Boss',
    engineType: 'boss',
    minBet: 25,
    maxBet: 25000,
    rtp: 96.4,
    volatility: 'high',
    hasJackpot: true,
    jackpotType: 'major',
    popularity: 95,
    activePlayersOnline: 1750,
    biggestWinMultiplier: 15000,
    thumbnailEmoji: '🐲',
    bannerGradient: 'from-orange-600 to-red-950',
    tag: 'EPIC BOSS',
    description: 'Битва гильдии против Инфернального Дракона. Чем дольше раунд, тем выше множитель!',
    rules: ['Выдержи 5 фаз атак дракона для получения мега-выплаты'],
  },

  // 🃏 CARDS / BLACKJACK / POKER / BACCARAT
  {
    id: 'card_blackjack_classic',
    name: 'Vegas VIP Blackjack',
    category: 'cards',
    theme: 'Classic Vegas Casino',
    engineType: 'blackjack',
    minBet: 10,
    maxBet: 100000,
    rtp: 99.4,
    volatility: 'low',
    hasJackpot: false,
    popularity: 99,
    activePlayersOnline: 3100,
    biggestWinMultiplier: 250,
    thumbnailEmoji: '🃏',
    bannerGradient: 'from-emerald-700 to-slate-950',
    tag: '99.4% RTP',
    description: 'Премиальный блэкджек против дилера: Hit, Stand, Double, Split, Surrender.',
    rules: ['Блэкджек оплачивается 3:2', 'Дилер берет карту на Soft 17', 'Доступен сплит и удвоение'],
  },
  {
    id: 'card_texas_holdem',
    name: 'Texas Hold\'em Poker Pro',
    category: 'cards',
    theme: 'Poker Championship',
    engineType: 'poker',
    minBet: 25,
    maxBet: 50000,
    rtp: 98.2,
    volatility: 'medium',
    hasJackpot: true,
    jackpotType: 'major',
    popularity: 97,
    activePlayersOnline: 2450,
    biggestWinMultiplier: 5000,
    thumbnailEmoji: '♠️',
    bannerGradient: 'from-blue-700 to-slate-950',
    tag: 'POKER ROOM',
    description: 'Настоящий техасский холдем против продвинутого AI: Pre-Flop, Flop, Turn, River, All-in!',
    rules: ['Классические покерные комбинации', 'Интеллектуальные блефы и ставки AI'],
  },
  {
    id: 'card_macau_baccarat',
    name: 'Macau Royal Baccarat',
    category: 'cards',
    theme: 'Macau Luxury',
    engineType: 'baccarat',
    minBet: 50,
    maxBet: 200000,
    rtp: 98.9,
    volatility: 'low',
    hasJackpot: false,
    popularity: 93,
    activePlayersOnline: 1350,
    biggestWinMultiplier: 800,
    thumbnailEmoji: '🧧',
    bannerGradient: 'from-red-800 via-amber-700 to-slate-950',
    tag: 'HIGH ROLLER',
    description: 'Люксовая баккара из Макао: ставки на Игрока (1:1), Банкира (0.95:1) и Ничью (8:1).',
    rules: ['Правило третьей карты баккара', 'Минимальный перевес казино'],
  },

  // 🎡 WHEEL & FORTUNE
  {
    id: 'wheel_mega_jackpot',
    name: 'Mega Fortune Gold Wheel',
    category: 'wheel',
    theme: 'Gold Luxury',
    engineType: 'wheel',
    minBet: 10,
    maxBet: 10000,
    rtp: 96.5,
    volatility: 'high',
    hasJackpot: true,
    jackpotType: 'mega',
    popularity: 96,
    activePlayersOnline: 2150,
    biggestWinMultiplier: 10000,
    thumbnailEmoji: '🎡',
    bannerGradient: 'from-amber-500 via-yellow-600 to-slate-950',
    tag: 'MEGA WHEEL',
    description: 'Золотое колесо фортуны с секторами множителей от 2x до 500x и сектором Mega Jackpot!',
    rules: ['24 сектора с множителями', 'Золотые стрелки удваивают призы'],
  },

  // 🎁 GACHA & COLLECTION
  {
    id: 'gacha_cyber_chests',
    name: 'Cyber Matrix Loot Chests',
    category: 'collection',
    theme: 'Cyberpunk Gacha',
    engineType: 'gacha',
    minBet: 50,
    maxBet: 10000,
    rtp: 96.0,
    volatility: 'high',
    hasJackpot: false,
    popularity: 94,
    activePlayersOnline: 1400,
    biggestWinMultiplier: 5000,
    thumbnailEmoji: '🎁',
    bannerGradient: 'from-fuchsia-600 to-cyan-950',
    tag: 'LOOT BOX',
    description: 'Открывай сундуки с прозрачными шансами: аватары, талисманы с баффами и суперкары!',
    rules: ['Шанс Mythic 0.5%, Legendary 2.5%, Epic 10%', 'Предметы дают постоянный буст к XP и кэшбэку'],
  },

  // 🚀 SCI-FI
  {
    id: 'scifi_space_voyager',
    name: 'Cosmic Voyager: Singularity',
    category: 'scifi',
    theme: 'Deep Space',
    engineType: 'slot',
    minBet: 10,
    maxBet: 8000,
    rtp: 96.7,
    volatility: 'high',
    hasJackpot: true,
    jackpotType: 'major',
    popularity: 91,
    activePlayersOnline: 870,
    biggestWinMultiplier: 6000,
    thumbnailEmoji: '🌌',
    bannerGradient: 'from-indigo-600 via-purple-900 to-slate-950',
    tag: 'COSMIC',
    description: 'Черная дыра поглощает проигрышные символы и запускает космические респины.',
    rules: ['Гравитационная воронка Wild', 'Множитель сингулярности до 10x'],
  },

  // 👻 HORROR
  {
    id: 'horror_vampire_manor',
    name: 'Vampire Lord: Blood Moon',
    category: 'horror',
    theme: 'Gothic Horror',
    engineType: 'slot',
    minBet: 15,
    maxBet: 6000,
    rtp: 96.3,
    volatility: 'high',
    hasJackpot: true,
    jackpotType: 'mini',
    popularity: 89,
    activePlayersOnline: 650,
    biggestWinMultiplier: 4000,
    thumbnailEmoji: '🧛',
    bannerGradient: 'from-red-900 via-slate-900 to-black',
    tag: 'HORROR',
    description: 'Кровавая луна пробуждает графа вампиров с липкими вайлдами и гробовыми множителями.',
    rules: ['Бонус Кровавой Луны с превращением символов в Wild'],
  },

  // 🏴‍☠️ PIRATES
  {
    id: 'pirates_blackbeard_gold',
    name: 'Blackbeard\'s Cursed Treasure',
    category: 'pirates',
    theme: 'Pirates Sea',
    engineType: 'slot',
    minBet: 10,
    maxBet: 5000,
    rtp: 96.6,
    volatility: 'medium',
    hasJackpot: true,
    jackpotType: 'major',
    popularity: 92,
    activePlayersOnline: 980,
    biggestWinMultiplier: 3500,
    thumbnailEmoji: '🏴‍☠️',
    bannerGradient: 'from-amber-800 to-slate-950',
    tag: 'PIRATES',
    description: 'Пиратский бриг штурмует королевский галеон. Карты сокровищ открывают скрытый сундук.',
    rules: ['3 карты сокровищ открывают бонусную мини-игру с выбором сундуков'],
  },

  // 🏆 SPORTS
  {
    id: 'sports_penalty_shootout',
    name: 'World Cup Penalty Shootout',
    category: 'sports',
    theme: 'Football',
    engineType: 'arcade',
    minBet: 10,
    maxBet: 20000,
    rtp: 97.0,
    volatility: 'medium',
    hasJackpot: false,
    popularity: 95,
    activePlayersOnline: 1800,
    biggestWinMultiplier: 3200,
    thumbnailEmoji: '⚽',
    bannerGradient: 'from-emerald-600 to-slate-950',
    tag: 'SPORTS',
    description: 'Пробей пенальти в девятку ворот! Каждое попадание увеличивает множитель забитого гола.',
    rules: ['Выбери угол удара (5 зон)', 'Серия из 5 пенальти дает максимальный куш 32x'],
  },

  // 💎 VIP
  {
    id: 'vip_monaco_sovereign',
    name: 'Monaco Sovereign Penthouse Baccarat',
    category: 'vip',
    theme: 'Monaco Royal VIP',
    engineType: 'baccarat',
    minBet: 500,
    maxBet: 1000000,
    rtp: 99.1,
    volatility: 'low',
    hasJackpot: true,
    jackpotType: 'mega',
    popularity: 99,
    activePlayersOnline: 450,
    biggestWinMultiplier: 1500,
    thumbnailEmoji: '💎',
    bannerGradient: 'from-amber-400 via-rose-500 to-purple-950',
    tag: 'VIP EXCLUSIVE',
    description: 'Закрытый пентхаус в Монте-Карло для магнатов и миллиардеров. Максимальные лимиты до 1,000,000 CC.',
    rules: ['VIP кэшбэк 5%', 'Персональный дилер', 'Ставки до 1,000,000 CC'],
  },
];

// Helper: procedural generator to enrich catalog into 120+ games across themes & mechanics
function generateFullCatalog(): CasinoGameDefinition[] {
  const catalog: CasinoGameDefinition[] = [...BASE_GAMES];

  const THEMES_CONFIG: {
    category: CasinoCategory;
    theme: string;
    engineType: CasinoGameEngineType;
    emojis: string[];
    gradients: string[];
    namePrefixes: string[];
    nameSuffixes: string[];
    rtpBase: number;
  }[] = [
    {
      category: 'anime',
      theme: 'Anime Fantasy',
      engineType: 'slot',
      emojis: ['🌸', '🗡️', '⚡', '👘', '🦊', '💫'],
      gradients: ['from-fuchsia-600 to-indigo-900', 'from-pink-500 to-purple-950', 'from-violet-600 to-slate-900'],
      namePrefixes: ['Tokyo', 'Shinobi', 'Kitsune', 'Astral', 'Sakura', 'Shadow Ronin', 'Dragon Girl'],
      nameSuffixes: ['Chronicles', 'Destiny', 'Revenge', 'Fortune', 'Odyssey', 'Academy', 'Strike'],
      rtpBase: 96.7,
    },
    {
      category: 'cyberpunk',
      theme: 'Cyberpunk',
      engineType: 'slot',
      emojis: ['🌆', '🦾', '💾', '⚡', '🕶️', '💻'],
      gradients: ['from-cyan-600 to-slate-950', 'from-emerald-600 to-slate-950', 'from-purple-600 to-slate-950'],
      namePrefixes: ['Neon', 'Cyber', 'Matrix', 'Quantum', 'Hacker', 'Synthwave', 'Overclock'],
      nameSuffixes: ['Runner', 'Grid', 'Core', 'Overdrive', 'Protocol', 'Nexus', '2099'],
      rtpBase: 96.8,
    },
    {
      category: 'cars',
      theme: 'Racing & Cars',
      engineType: 'racing',
      emojis: ['🏎️', '🚗', '🏁', '💨', '🔥', '🛞'],
      gradients: ['from-red-600 to-slate-900', 'from-orange-600 to-slate-950', 'from-blue-600 to-slate-950'],
      namePrefixes: ['Apex', 'Turbo', 'Formula', 'Nitro', 'Drift', 'Supercar', 'Midnight'],
      nameSuffixes: ['Grand Prix', 'Tarmac', 'Showdown', 'Velocity', 'Asphalt', 'Speedway', 'Rivals'],
      rtpBase: 96.5,
    },
    {
      category: 'fantasy',
      theme: 'High Fantasy',
      engineType: 'slot',
      emojis: ['🐉', '🏰', '🧙', '🧝', '🛡️', '🗝️'],
      gradients: ['from-amber-600 to-slate-950', 'from-indigo-700 to-slate-950', 'from-emerald-700 to-slate-950'],
      namePrefixes: ['Dragon', 'Elder', 'Crown of', 'Elven', 'Dungeon', 'Mythic', 'Enchanted'],
      nameSuffixes: ['Kingdom', 'Throne', 'Spells', 'Relics', 'Prophecy', 'Legacy', 'Saga'],
      rtpBase: 96.6,
    },
    {
      category: 'scifi',
      theme: 'Sci-Fi Universe',
      engineType: 'crash',
      emojis: ['🚀', '🪐', '👽', '🌌', '🛸', '☄️'],
      gradients: ['from-blue-600 to-indigo-950', 'from-purple-700 to-black', 'from-teal-600 to-slate-950'],
      namePrefixes: ['Cosmic', 'Galactic', 'Hyper', 'Orbit', 'Starship', 'Nebula', 'Andromeda'],
      nameSuffixes: ['Ascent', 'Singularity', 'Warp', 'Explorer', 'Eclipse', 'Horizon', 'Crash'],
      rtpBase: 97.0,
    },
    {
      category: 'arcade',
      theme: 'Retro Arcade',
      engineType: 'arcade',
      emojis: ['🕹️', '👾', '🎯', '💥', '⚡', '🎪'],
      gradients: ['from-yellow-500 to-rose-900', 'from-cyan-500 to-fuchsia-900', 'from-emerald-500 to-blue-950'],
      namePrefixes: ['Pixel', 'Turbo', 'Laser', 'Retro', 'Mega', 'Hyper', 'Sonic'],
      nameSuffixes: ['Rush', 'Blast', 'Tap', 'Frenzy', 'Challenger', 'Strike', 'Clash'],
      rtpBase: 97.2,
    },
  ];

  let idCounter = 100;
  for (const cfg of THEMES_CONFIG) {
    for (let i = 0; i < cfg.namePrefixes.length; i++) {
      for (let j = 0; j < cfg.nameSuffixes.length; j++) {
        if ((i + j) % 2 === 0) continue; // Keep catalog clean and diverse (~40 additional games per category)
        idCounter++;
        const name = `${cfg.namePrefixes[i]} ${cfg.nameSuffixes[j]}`;
        const emoji = cfg.emojis[(i + j) % cfg.emojis.length];
        const gradient = cfg.gradients[(i + j) % cfg.gradients.length];
        const vol: GameVolatility = (i + j) % 3 === 0 ? 'high' : (i + j) % 3 === 1 ? 'medium' : 'low';
        const hasJackpot = (i + j) % 3 === 0;

        catalog.push({
          id: `game_${cfg.category}_${idCounter}`,
          name,
          category: cfg.category,
          theme: cfg.theme,
          engineType: cfg.engineType,
          minBet: 10 + (i * 5),
          maxBet: 5000 + (j * 1000),
          rtp: Math.round((cfg.rtpBase + ((i % 5) * 0.2) - ((j % 4) * 0.15)) * 10) / 10,
          volatility: vol,
          hasJackpot,
          jackpotType: hasJackpot ? ((i + j) % 6 === 0 ? 'mega' : 'major') : undefined,
          popularity: 80 + ((i * 7 + j * 3) % 20),
          activePlayersOnline: 300 + ((i * 123 + j * 87) % 1500),
          biggestWinMultiplier: 1000 + ((i + j) * 500),
          thumbnailEmoji: emoji,
          bannerGradient: gradient,
          tag: hasJackpot ? 'JACKPOT' : vol === 'high' ? 'POPULAR' : 'CLASSIC',
          description: `Увлекательная игра в категории ${cfg.theme} с динамическими бонусами и отдачей ${cfg.rtpBase}%.`,
          rules: ['Сделайте ставку и запустите раунд', 'Выигрыши зачисляются мгновенно'],
        });
      }
    }
  }

  return catalog;
}

export const CASINO_GAMES_CATALOG: CasinoGameDefinition[] = generateFullCatalog();

class GameRegistryService {
  private games: Map<string, CasinoGameDefinition> = new Map();

  constructor() {
    for (const g of CASINO_GAMES_CATALOG) {
      this.games.set(g.id, g);
    }
  }

  public getGame(id: string): CasinoGameDefinition | undefined {
    return this.games.get(id);
  }

  public getAllGames(): CasinoGameDefinition[] {
    return Array.from(this.games.values());
  }

  public getGamesByCategory(category: CasinoCategory): CasinoGameDefinition[] {
    if (category === 'hot') {
      return this.getAllGames().filter((g) => g.popularity >= 94 || g.tag === 'HOT' || g.tag === 'TOP CRASH');
    }
    if (category === 'vip') {
      return this.getAllGames().filter((g) => g.category === 'vip' || g.maxBet >= 50000 || g.minBet >= 50);
    }
    return this.getAllGames().filter((g) => g.category === category);
  }

  public searchGames(query: string): CasinoGameDefinition[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAllGames();
    return this.getAllGames().filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.theme.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        (g.tag && g.tag.toLowerCase().includes(q))
    );
  }

  public getJackpotGames(): CasinoGameDefinition[] {
    return this.getAllGames().filter((g) => g.hasJackpot);
  }
}

export const gameRegistry = new GameRegistryService();
