/**
 * Business Empire: Ultimate
 * Staff & Automation Core Types
 */

export type EmployeeType =
  | 'salesperson'   // продавец
  | 'manager'       // менеджер
  | 'mechanic'      // механик
  | 'driver'        // водитель
  | 'engineer'      // инженер
  | 'marketer'      // маркетолог
  | 'accountant'    // бухгалтер
  | 'director'      // директор
  | 'trader'        // трейдер
  | 'analyst';      // аналитик

export type RussianEmployeeType =
  | 'продавец'
  | 'менеджер'
  | 'механик'
  | 'водитель'
  | 'инженер'
  | 'маркетолог'
  | 'бухгалтер'
  | 'директор'
  | 'трейдер'
  | 'аналитик';

export interface EmployeeRoleConfig {
  type: EmployeeType;
  russianName: RussianEmployeeType;
  title: string;
  category: 'commercial' | 'technical' | 'logistics' | 'management' | 'finance';
  description: string;
  primaryImpactDescription: string;
  baseSalaryMin: number;
  baseSalaryMax: number;
  iconName: string;
  colorClass: string;
  badgeBg: string;
  recommendedDepartment: string;
  skills: string[];
}

export interface Employee {
  id: string;
  name: string;
  type: EmployeeType;
  salary: number;            // Daily salary in $
  experience: number;        // XP / days worked
  skill: number;             // Skill score (1..100)
  efficiency: number;        // Multiplier percentage (e.g. 1.25 for +25%)
  level: number;             // Level (1..10)
  morale: number;            // Morale (0..100%)
  avatar: string;
  assignedBusinessId?: string | null;
  assignedBusinessName?: string;
  assignedBusinessType?: 'retail' | 'factory' | 'car_service' | 'warehouse' | 'trading' | 'headquarters' | 'general';
  hiredAtGameDay: number;
  trainingDaysRemaining?: number;
  perks?: string[];
  loyalty: number;           // 0..100%
  totalEarnedSalary: number;
}

// 7 Automation Levels
export type AutomationLevelId =
  | 'manual'            // 1. ручное управление
  | 'auto_purchasing'   // 2. автозакупка
  | 'auto_selling'      // 3. автопродажа
  | 'auto_logistics'    // 4. автологистика
  | 'auto_production'   // 5. автопроизводство
  | 'ai_manager'        // 6. AI-менеджер
  | 'full_autonomy';    // 7. полная автоматизация

export interface AutomationLevelConfig {
  id: AutomationLevelId;
  levelNumber: number;
  name: string;
  russianName: string;
  tagline: string;
  description: string;
  unlockCost: number;
  requiredStaffRole?: EmployeeType;
  requiredStaffCount?: number;
  requiredTechId?: string;
  benefits: string[];
  features: {
    autoBuy: boolean;
    autoSell: boolean;
    autoLogistics: boolean;
    autoProduction: boolean;
    aiPricing: boolean;
    aiReallocation: boolean;
    fullAutonomy: boolean;
  };
}

// AI-Manager Strategies
export type AIStrategy = 'aggressive' | 'balanced' | 'conservative';

export interface AIManagerSettings {
  enabled: boolean;
  strategy: AIStrategy;
  modules: {
    autoOrderGoods: boolean;     // Заказывать товары
    autoSellGoods: boolean;      // Продавать товары
    manageInventory: boolean;    // Управлять запасами
    managePricing: boolean;      // Управлять ценами
    reallocateCash: boolean;     // Перераспределять деньги
  };
  minCashReservePercent: number; // e.g. 10%, 30%, 60%
  maxPriceMarkupPercent: number; // e.g. 60%, 35%, 15%
  safetyStockDays: number;       // e.g. 1, 3, 7 days
  reinvestSurplusIntoFactories: boolean;
  autoPayHighInterestLoans: boolean;
  actionLogs: Array<{
    id: string;
    timestamp: number;
    gameDay: number;
    message: string;
    type: 'order' | 'sell' | 'price' | 'finance' | 'inventory';
    amount?: number;
  }>;
}

export interface TrainingCourse {
  id: string;
  name: string;
  role: EmployeeType | 'all';
  targetMinLevel: number;
  cost: number;
  durationDays: number;
  skillBonus: number;
  efficiencyBonus: number;
  moraleBonus: number;
  description: string;
}

export interface StaffAggregatedBonuses {
  salesVolumeMultiplier: number;      // Продавцы: +% к продажам
  retailTrafficMultiplier: number;    // Маркетологи: +% к потоку покупателей
  carRepairDiscount: number;          // Механики: -% к ремонту авто
  logisticsCostDiscount: number;      // Водители: -% к расходам на логистику
  factoryCapacityBonus: number;       // Инженеры: +% к мощности заводов
  factoryEfficiencyBonus: number;     // Инженеры: -% к расходу энергии
  taxReductionRate: number;           // Бухгалтеры: -% налогов
  overheadCostDiscount: number;       // Бухгалтеры: -% к расходам холдинга
  tradingCommissionDiscount: number;  // Трейдеры: -% комиссий
  tradingProfitBonus: number;         // Трейдеры: +% доходность сделок
  marketForecastAccuracy: number;     // Аналитики: точность сигналов (0..100%)
  managementSynergyBonus: number;     // Менеджеры: общая слаженность
  directorLeadershipBonus: number;    // Директора: общая мораль и мультипликатор оценки
  holdingAverageMorale: number;
  totalDailyPayroll: number;
  totalStaffCount: number;
}

export interface StaffSubsystemState {
  employees: Employee[];
  marketCandidates: Employee[];
  automationLevel: AutomationLevelId;
  unlockedAutomationLevels: AutomationLevelId[];
  aiManager: AIManagerSettings;
  corporateBonusDaily: number;
  lastMarketRefreshDay: number;
  stats: {
    totalSalariesPaid: number;
    totalHires: number;
    totalPromotions: number;
    aiActionsExecuted: number;
  };
}
