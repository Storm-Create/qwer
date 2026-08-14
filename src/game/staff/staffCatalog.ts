/**
 * Business Empire: Ultimate
 * Staff & Automation Catalog & Generators
 */

import {
  EmployeeRoleConfig,
  EmployeeType,
  RussianEmployeeType,
  AutomationLevelConfig,
  AutomationLevelId,
  TrainingCourse,
  Employee,
} from '../../types/staff';

export const EMPLOYEE_ROLES: Record<EmployeeType, EmployeeRoleConfig> = {
  salesperson: {
    type: 'salesperson',
    russianName: 'продавец',
    title: 'Продавец-консультант',
    category: 'commercial',
    description: 'Мастер прямых продаж и работы с клиентами в торговых залах и бутиках.',
    primaryImpactDescription: 'Увеличивает объем продаж розницы (+5%..+50%) и снижает залежалость товаров.',
    baseSalaryMin: 80,
    baseSalaryMax: 240,
    iconName: 'ShoppingBag',
    colorClass: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    recommendedDepartment: 'Розничные магазины & Бутики',
    skills: ['Прямые продажи', 'Кросс-селлинг', 'Мерчандайзинг', 'Работа с возражениями'],
  },
  manager: {
    type: 'manager',
    russianName: 'менеджер',
    title: 'Операционный менеджер',
    category: 'management',
    description: 'Координирует операционную деятельность филиалов, мотивирует коллектив и автоматизирует рутину.',
    primaryImpactDescription: 'Повышает производительность подразделения (+10%..+35%) и удерживает высокую мораль.',
    baseSalaryMin: 150,
    baseSalaryMax: 450,
    iconName: 'Users',
    colorClass: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    recommendedDepartment: 'Управление филиалами & Офис',
    skills: ['Лидерство', 'KPI-контроль', 'Тайм-менеджмент', 'Разрешение конфликтов'],
  },
  mechanic: {
    type: 'mechanic',
    russianName: 'механик',
    title: 'Автомеханик / Инженер СТО',
    category: 'technical',
    description: 'Специалист по диагностике, дефектовке, ремонту узлов и реставрации автомобилей.',
    primaryImpactDescription: 'Снижает стоимость ремонта авто (-10%..-60%) и ускоряет предпродажную подготовку.',
    baseSalaryMin: 120,
    baseSalaryMax: 380,
    iconName: 'Wrench',
    colorClass: 'text-orange-400',
    badgeBg: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
    recommendedDepartment: 'Автомастерские СТО & Автосалоны',
    skills: ['Ремонт ДВС', 'Кузовные работы', 'Компьютерная диагностика', 'Тюнинг'],
  },
  driver: {
    type: 'driver',
    russianName: 'водитель',
    title: 'Водитель-экспедитор',
    category: 'logistics',
    description: 'Опытный дальнобойщик и водитель грузовой автоколонны.',
    primaryImpactDescription: 'Снижает транспортные расходы на км (-15%..-50%) и исключает срывы поставок.',
    baseSalaryMin: 90,
    baseSalaryMax: 290,
    iconName: 'Truck',
    colorClass: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    recommendedDepartment: 'Логистический парк & Склады',
    skills: ['Безаварийное вождение', 'Эко-драйвинг', 'Маршрутизация', 'Экспедирование'],
  },
  engineer: {
    type: 'engineer',
    russianName: 'инженер',
    title: 'Главный инженер производства',
    category: 'technical',
    description: 'Проектирует и оптимизирует конвейерные линии заводов, станков ЧПУ и роботов.',
    primaryImpactDescription: 'Увеличивает мощность заводов (+10%..+60%) и снижает энергопотребление.',
    baseSalaryMin: 200,
    baseSalaryMax: 650,
    iconName: 'Cog',
    colorClass: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    recommendedDepartment: 'Промышленные заводы & Фабрики',
    skills: ['Бережливое производство (Lean)', 'Автоматизация конвейеров', 'Техобслуживание ЧПУ', 'Энергоаудит'],
  },
  marketer: {
    type: 'marketer',
    russianName: 'маркетолог',
    title: 'Директор по маркетингу',
    category: 'commercial',
    description: 'Организует масштабные рекламные кампании, таргетинг и привлекает поток платежеспособных клиентов.',
    primaryImpactDescription: 'Увеличивает поток клиентов во все магазины и автосалоны (+20%..+80%).',
    baseSalaryMin: 180,
    baseSalaryMax: 550,
    iconName: 'Target',
    colorClass: 'text-rose-400',
    badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    recommendedDepartment: 'Маркетинговый отдел & Бренд',
    skills: ['Performance-маркетинг', 'Анализ ЦА', 'Брендинг', 'Вирусные кампании'],
  },
  accountant: {
    type: 'accountant',
    russianName: 'бухгалтер',
    title: 'Главный бухгалтер / Финансист',
    category: 'finance',
    description: 'Ведет аудит баланса, налоговую оптимизацию и минимизирует операционные утечки бюджета.',
    primaryImpactDescription: 'Оптимизирует налоги (-5%..-25%) и снижает накладные расходы холдинга.',
    baseSalaryMin: 160,
    baseSalaryMax: 500,
    iconName: 'Calculator',
    colorClass: 'text-teal-400',
    badgeBg: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
    recommendedDepartment: 'Бухгалтерия & Налоговый аудит',
    skills: ['Налоговое планирование', 'МСФО', 'Казначейство', 'Аудит издержек'],
  },
  director: {
    type: 'director',
    russianName: 'директор',
    title: 'Исполнительный директор (COO / CEO)',
    category: 'management',
    description: 'Топ-менеджер стратегического уровня, задающий вектор развития корпорации.',
    primaryImpactDescription: 'Дает мощную синергию всем отделам, поднимает мораль и капитализацию корпорации.',
    baseSalaryMin: 500,
    baseSalaryMax: 1800,
    iconName: 'Award',
    colorClass: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    recommendedDepartment: 'Совет директоров & Корпоративный центр',
    skills: ['Стратегический менеджмент', 'M&A сделки', 'Кризисное управление', 'Инвестиционный банкинг'],
  },
  trader: {
    type: 'trader',
    russianName: 'трейдер',
    title: 'Биржевой трейдер',
    category: 'finance',
    description: 'Торгует акциями и сырьевыми контрактами, снижает биржевые комиссии брокера.',
    primaryImpactDescription: 'Снижает комиссии на биржах (-20%..-70%) и находит арбитражные возможности.',
    baseSalaryMin: 220,
    baseSalaryMax: 750,
    iconName: 'TrendingUp',
    colorClass: 'text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    recommendedDepartment: 'Торговый деск & Фондовая биржа',
    skills: ['Технический анализ', 'HFT-алгоритмы', 'Арбитраж спредов', 'Управление рисками'],
  },
  analyst: {
    type: 'analyst',
    russianName: 'аналитик',
    title: 'Финансовый & Рыночный аналитик',
    category: 'finance',
    description: 'Строит прогностические модели рынка товаров, динамики акций и цен на недвижимость.',
    primaryImpactDescription: 'Дает точные прогнозы трендов (+60%..+95% точности) и защищает от просадок.',
    baseSalaryMin: 190,
    baseSalaryMax: 600,
    iconName: 'LineChart',
    colorClass: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    recommendedDepartment: 'Аналитический отдел & R&D',
    skills: ['Эконометрика', 'Предиктивная аналитика', 'Оценка фундаментала', 'Сценарное моделирование'],
  },
};

// 7 Automation Levels Config
export const AUTOMATION_LEVELS: AutomationLevelConfig[] = [
  {
    id: 'manual',
    levelNumber: 1,
    name: 'Ручное управление',
    russianName: 'ручное управление',
    tagline: 'Базовый режим управления бизнес-империей',
    description: 'Все заказы товаров, ценообразование, ремонт авто и запуск заводов выполняются игроком вручную.',
    unlockCost: 0,
    benefits: [
      'Полный точечный контроль над каждым решением',
      'Нулевые постоянные затраты на автоматизацию',
    ],
    features: {
      autoBuy: false,
      autoSell: false,
      autoLogistics: false,
      autoProduction: false,
      aiPricing: false,
      aiReallocation: false,
      fullAutonomy: false,
    },
  },
  {
    id: 'auto_purchasing',
    levelNumber: 2,
    name: 'Автозакупка',
    russianName: 'автозакупка',
    tagline: 'Автоматическое пополнение истощенных запасов',
    description: 'Система отслеживает остатки на складах и в магазинах, автоматически закупая товар при падении ниже порогового значения.',
    unlockCost: 25000,
    requiredStaffRole: 'driver',
    requiredStaffCount: 1,
    benefits: [
      'Предотвращение простоя розничных магазинов из-за отсутствия товара',
      'Автозаказ сырья для заводов по лучшим биржевым ценам',
    ],
    features: {
      autoBuy: true,
      autoSell: false,
      autoLogistics: false,
      autoProduction: false,
      aiPricing: false,
      aiReallocation: false,
      fullAutonomy: false,
    },
  },
  {
    id: 'auto_selling',
    levelNumber: 3,
    name: 'Автопродажа',
    russianName: 'автопродажа',
    tagline: 'Автоматическая реализация готовой продукции',
    description: 'Автоматический сбыт произведенных товаров на оптовой бирже и поддержание оптимального товарооборота в магазинах.',
    unlockCost: 50000,
    requiredStaffRole: 'salesperson',
    requiredStaffCount: 1,
    benefits: [
      'Склады не переполняются готовой продукцией',
      'Фиксация прибыли при локальных ценовых пиках на оптовой бирже',
    ],
    features: {
      autoBuy: true,
      autoSell: true,
      autoLogistics: false,
      autoProduction: false,
      aiPricing: false,
      aiReallocation: false,
      fullAutonomy: false,
    },
  },
  {
    id: 'auto_logistics',
    levelNumber: 4,
    name: 'Автологистика',
    russianName: 'автологистика',
    tagline: 'Умная диспетчеризация автопарка и хабов',
    description: 'Автоматическая маршрутизация грузовиков между портами, складами, заводами и торговыми точками без ручной отправки рейсов.',
    unlockCost: 100000,
    requiredStaffRole: 'manager',
    requiredStaffCount: 1,
    benefits: [
      'Снижение холостого пробега грузовиков на 35%',
      'Мгновенная доставка сырья в заводские цеха точно в срок (JIT)',
    ],
    features: {
      autoBuy: true,
      autoSell: true,
      autoLogistics: true,
      autoProduction: false,
      aiPricing: false,
      aiReallocation: false,
      fullAutonomy: false,
    },
  },
  {
    id: 'auto_production',
    levelNumber: 5,
    name: 'Автопроизводство',
    russianName: 'автопроизводство',
    tagline: 'Интеллектуальная балансировка заводских конвейеров',
    description: 'Заводы автоматически переключают рецепты на самую высокомаржинальную продукцию в зависимости от текущих котировок.',
    unlockCost: 250000,
    requiredStaffRole: 'engineer',
    requiredStaffCount: 2,
    benefits: [
      'Максимизация суточной прибыли промышленных комплексов',
      'Автоматическая остановка линий при резком подорожании сырья',
    ],
    features: {
      autoBuy: true,
      autoSell: true,
      autoLogistics: true,
      autoProduction: true,
      aiPricing: false,
      aiReallocation: false,
      fullAutonomy: false,
    },
  },
  {
    id: 'ai_manager',
    levelNumber: 6,
    name: 'AI-менеджер',
    russianName: 'AI-менеджер',
    tagline: 'Нейросетевое операционное управление холдингом',
    description: 'Искусственный интеллект непрерывно анализирует весь холдинг, регулирует наценки, закупки, сбыт и перераспределяет ликвидность.',
    unlockCost: 500000,
    requiredStaffRole: 'analyst',
    requiredStaffCount: 2,
    benefits: [
      'Динамическое адаптивное ценообразование в реальном времени',
      'Умное перераспределение кэша в самые доходные подразделения',
      'Выбор стратегии: Агрессивная, Сбалансированная или Консервативная',
    ],
    features: {
      autoBuy: true,
      autoSell: true,
      autoLogistics: true,
      autoProduction: true,
      aiPricing: true,
      aiReallocation: true,
      fullAutonomy: false,
    },
  },
  {
    id: 'full_autonomy',
    levelNumber: 7,
    name: 'Полная автоматизация',
    russianName: 'полная автоматизация',
    tagline: 'Саморазвивающаяся автономная сверхкорпорация',
    description: 'Высшая ступень эволюции бизнеса: корпорация сама генерирует миллиардные потоки, масштабирует филиалы и хеджирует любые риски.',
    unlockCost: 1500000,
    requiredStaffRole: 'director',
    requiredStaffCount: 1,
    benefits: [
      'Полная автономия всех секторов бизнеса',
      'Максимальный мультипликатор эффективности (+50% ко всем бонусам)',
      'Самопогашение дорогих долгов и оптимизация налогов до абсолютного минимума',
    ],
    features: {
      autoBuy: true,
      autoSell: true,
      autoLogistics: true,
      autoProduction: true,
      aiPricing: true,
      aiReallocation: true,
      fullAutonomy: true,
    },
  },
];

export const TRAINING_COURSES: TrainingCourse[] = [
  {
    id: 'train_fast_track',
    name: 'Экспресс-курс повышения квалификации',
    role: 'all',
    targetMinLevel: 1,
    cost: 1500,
    durationDays: 1,
    skillBonus: 8,
    efficiencyBonus: 0.1,
    moraleBonus: 10,
    description: 'Интенсивный тренинг для новичков: стандарты сервиса, безопасность и базовые регламенты.',
  },
  {
    id: 'train_advanced_master',
    name: 'Мастер-класс углубленной специализации',
    role: 'all',
    targetMinLevel: 3,
    cost: 5000,
    durationDays: 2,
    skillBonus: 15,
    efficiencyBonus: 0.2,
    moraleBonus: 15,
    description: 'Углубленные техники профильного ремесла: от сложной диагностики до стратегического таргетинга.',
  },
  {
    id: 'train_executive_mba',
    name: 'Executive MBA & Системное лидерство',
    role: 'all',
    targetMinLevel: 5,
    cost: 15000,
    durationDays: 3,
    skillBonus: 25,
    efficiencyBonus: 0.35,
    moraleBonus: 25,
    description: 'Элитная программа бизнес-школы для ведущих топ-специалистов и директоров.',
  },
];

// Names Pool for realistic candidate generation
const FIRST_NAMES_MALE = [
  'Александр', 'Дмитрий', 'Максим', 'Сергей', 'Андрей', 'Алексей', 'Артем', 'Илья',
  'Кирилл', 'Михаил', 'Никита', 'Матвей', 'Роман', 'Егор', 'Арсений', 'Иван',
  'Денис', 'Евгений', 'Даниил', 'Тимофей', 'Владислав', 'Игорь', 'Владимир', 'Павел',
  'Виктор', 'Олег', 'Константин', 'Юрий', 'Григорий', 'Антон'
];

const FIRST_NAMES_FEMALE = [
  'Анна', 'Мария', 'Елена', 'Дарья', 'Алина', 'Полина', 'Екатерина', 'Виктория',
  'Анастасия', 'София', 'Валерия', 'Ксения', 'Юлия', 'Ольга', 'Татьяна', 'Наталья',
  'Ирина', 'Светлана', 'Алена', 'Маргарита', 'Кристина', 'Диана', 'Вероника', 'Яна'
];

const LAST_NAMES = [
  'Смирнов', 'Иванов', 'Кузнецов', 'Попов', 'Соколов', 'Лебедев', 'Козлов', 'Новиков',
  'Морозов', 'Петров', 'Волков', 'Соловьев', 'Васильев', 'Зайцев', 'Павлов', 'Семенов',
  'Голубев', 'Виноградов', 'Богданов', 'Воробьев', 'Федоров', 'Михайлов', 'Беляев',
  'Тарасов', 'Белов', 'Комаров', 'Орлов', 'Киселев', 'Макаров', 'Андреев', 'Ковалев',
  'Ильин', 'Гусев', 'Титов', 'Кузьмин', 'Кудрявцев', 'Баранов', 'Куликов', 'Алексеев'
];

const AVATARS_MALE = ['👨‍💼', '👨‍🔧', '👨‍🔬', '👨‍💻', '👨‍🏫', '👨‍🏭', '🧔', '👨‍🦱', '👨‍🦰', '🧑‍💼', '👨‍⚖️', '👨‍🌾'];
const AVATARS_FEMALE = ['👩‍💼', '👩‍🔧', '👩‍🔬', '👩‍💻', '👩‍🏫', '👩‍🏭', '👩‍🦱', '👩‍🦰', '🧑‍💼', '👩‍⚖️'];

const SPECIAL_PERKS = [
  'Трудоголик (+10% выносливость)',
  'Аналитический склад ума (+15% точность)',
  'Прирожденный переговорщик (+15% сбыт)',
  'Педант в деталях (-20% брак)',
  'Лидер мнений (+10% мораль отдела)',
  'Стрессоустойчивость (мораль не падает)',
  'Оптимизатор процессов (-10% расходы)',
  'Харизматик (+20% лояльность)',
];

export function generateCandidate(
  type: EmployeeType,
  levelMin = 1,
  levelMax = 4,
  gameDay = 1
): Employee {
  const isFemale = Math.random() > 0.5;
  const firstName = isFemale
    ? FIRST_NAMES_FEMALE[Math.floor(Math.random() * FIRST_NAMES_FEMALE.length)]
    : FIRST_NAMES_MALE[Math.floor(Math.random() * FIRST_NAMES_MALE.length)];
  let lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  if (isFemale && !lastName.endsWith('а')) {
    lastName += 'а';
  }

  const avatar = isFemale
    ? AVATARS_FEMALE[Math.floor(Math.random() * AVATARS_FEMALE.length)]
    : AVATARS_MALE[Math.floor(Math.random() * AVATARS_MALE.length)];

  const role = EMPLOYEE_ROLES[type];
  const level = Math.floor(Math.random() * (levelMax - levelMin + 1)) + levelMin;

  const baseSalary =
    role.baseSalaryMin +
    ((role.baseSalaryMax - role.baseSalaryMin) * (level - 1)) / 9;
  const salaryVariance = 0.85 + Math.random() * 0.3; // 85%..115%
  const salary = Math.round(baseSalary * salaryVariance);

  const baseSkill = 20 + level * 7 + Math.floor(Math.random() * 10);
  const skill = Math.min(100, Math.max(15, baseSkill));

  // Efficiency starts from 1.05 and grows with skill and level
  const efficiency = Number((1.0 + (level * 0.1) + (skill * 0.005)).toFixed(2));
  const morale = 75 + Math.floor(Math.random() * 25); // 75..100%

  const perksCount = Math.random() > 0.4 ? (Math.random() > 0.7 ? 2 : 1) : 0;
  const shuffledPerks = [...SPECIAL_PERKS].sort(() => 0.5 - Math.random());
  const perks = shuffledPerks.slice(0, perksCount);

  return {
    id: `emp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: `${firstName} ${lastName}`,
    type,
    salary,
    experience: (level - 1) * 30 + Math.floor(Math.random() * 20),
    skill,
    efficiency,
    level,
    morale,
    avatar,
    assignedBusinessId: null,
    assignedBusinessName: 'Не назначен',
    assignedBusinessType: 'general',
    hiredAtGameDay: gameDay,
    perks,
    loyalty: 80 + Math.floor(Math.random() * 20),
    totalEarnedSalary: 0,
  };
}

export function generateInitialRecruitmentMarket(gameDay = 1): Employee[] {
  const candidates: Employee[] = [];
  const allTypes: EmployeeType[] = [
    'salesperson',
    'salesperson',
    'manager',
    'mechanic',
    'driver',
    'engineer',
    'marketer',
    'accountant',
    'director',
    'trader',
    'analyst',
  ];

  for (const type of allTypes) {
    candidates.push(generateCandidate(type, 1, 3, gameDay));
  }

  return candidates;
}
