/**
 * Business Empire: Ultimate
 * Industrial Production & Manufacturing Subsystem Types
 * Real production chains:
 * 1. Oil → Plastic → Components → Electronics
 * 2. Cotton → Fabric → Clothing
 * 3. Iron → Steel → Parts → Auto Parts
 * 4. Grain → Flour → Bread
 * 5. Timber → Lumber/Planks → Furniture
 * 6. Automotive Assembly: Auto Parts + Electronics + Steel + Fabric → Finished Vehicles
 */

export type FactoryType =
  | 'food_factory'        // Пищевой завод
  | 'textile_factory'     // Текстильная фабрика
  | 'metallurgy_plant'    // Металлургический завод
  | 'electronics_plant'   // Электронный завод
  | 'autoparts_factory'   // Завод автозапчастей
  | 'automobile_plant';   // Автозавод

export type FactoryChainId =
  | 'oil_to_electronics'
  | 'cotton_to_clothing'
  | 'iron_to_autoparts'
  | 'grain_to_bread'
  | 'wood_to_furniture'
  | 'car_assembly';

export type FactoryStatus =
  | 'active'              // Работает / В процессе выпуска
  | 'stopped'             // Остановлен игроком
  | 'out_of_materials'    // Простой: нехватка сырья
  | 'warehouse_full'      // Простой: целевой склад переполнен
  | 'upgrading';          // Идет модернизация цехов

export interface RecipeResourceRequirement {
  id?: string;             // Specific commodity ID if fixed
  category: string;        // Commodity category (e.g. 'Нефть', 'Зерно', 'Металлы')
  name: string;            // Display title (e.g. 'Сырая нефть', 'Пшеница 3 класс')
  quantity: number;        // Quantity required per production cycle batch
  unit: string;            // 'т', 'кг', 'барр.', 'м³', 'шт.', 'комплект'
  preferredQuality?: string;
  estimatedCost?: number;  // Market price reference for calculations
}

export interface RecipeOutputProduct {
  id?: string;             // Specific commodity ID if mapped
  category: string;        // Commodity category
  name: string;            // Display title (e.g. 'Пластик гранулированный', 'Мука высший сорт')
  quantity: number;        // Quantity produced per batch
  unit: string;            // 'т', 'кг', 'шт.', 'м³'
  quality: 'Стандарт' | 'Премиум' | 'Люкс' | 'Промышленный' | 'Оригинал' | 'OEM';
  weight: number;          // kg per unit
  volume: number;          // m3 per unit
  baseMarketValue: number; // Base selling price per unit
}

export interface FactoryRecipe {
  id: string;
  factoryType: FactoryType;
  chainId: FactoryChainId;
  name: string;
  tagline: string;
  description: string;
  tierRequired: number;    // Min factory level (1..10)
  cycleHours: number;      // productionTime in hours per batch
  inputs: RecipeResourceRequirement[];
  outputs: RecipeOutputProduct[];
  laborRequirement: number; // minimum workers required
  electricityKWhPerBatch: number; // Energy consumed per batch
  reagentCostPerBatch: number;    // Auxiliary chemicals/tooling per batch
}

export interface FactoryUpgradeTier {
  level: number;
  name: string;
  description: string;
  upgradeCost: number;
  capacityMultiplier: number;     // e.g. 1.0, 1.35, 1.8, 2.4, 3.2, etc.
  cycleTimeReduction: number;     // 0.00 to 0.40 (up to 40% faster)
  energyEfficiency: number;       // 1.00 to 0.65 (up to 35% less power)
  minEmployees: number;
  maxEmployees: number;
  dailyRent: number;
  dailyMaintenance: number;
  unlockedRecipes: string[];
}

export interface FactoryAutomationConfig {
  autoBuyRawMaterials: boolean;     // Автозакупка сырья на бирже при исчерпании
  autoBuyThresholdBatches: number;  // Порог закупки (на сколько партий держать запас, 1..20)
  maxAutoBuyPriceMultiplier: number;// Макс. множитель цены (например, до +25% от нормы)
  autoTransferToWarehouse: boolean; // Автоматически складировать на склад
  targetWarehouseId: string;        // ID целевого склада для готовой продукции (или 'nearest' / 'any')
  sourceWarehouseId: string;        // ID склада-источника сырья (или 'any')
  autoSupplyRetail: boolean;        // Напрямую снабжать магазины розничной сети
  autoSellExcess: boolean;          // Продавать на рынке излишки при нехватке места
}

export interface UnitCostBreakdown {
  batchSize: number;
  outputQuantity: number;
  rawMaterialsCost: number;         // Total raw material cost for batch
  rawMaterialsCostPerUnit: number;  // Raw materials cost / unit
  laborCostPerUnit: number;         // Labor / unit
  electricityCostPerUnit: number;   // Electricity / unit
  maintenanceCostPerUnit: number;   // Maintenance & tooling / unit
  totalUnitCost: number;            // Total production cost (Себестоимость)
  currentMarketPrice: number;       // Current average market price
  estimatedMarginDollars: number;   // Margin ($)
  estimatedMarginPercent: number;   // Margin (%)
  dailyEstimatedBatches: number;
  dailyEstimatedUnits: number;
  dailyEstimatedRevenue: number;
  dailyEstimatedExpenses: number;
  dailyEstimatedNetProfit: number;
}

export interface ProductionProgressState {
  currentCycleHoursElapsed: number; // 0 to recipe.cycleHours
  currentBatchId: string;
  totalBatchesCompleted: number;
  materialsLockedForCurrentBatch: boolean;
  lastRunTimestamp: number;
}

export interface FactoryLogEntry {
  id: string;
  timestamp: number;
  gameDay: number;
  gameHour: number;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export interface IndustrialFactory {
  id: string;
  type: FactoryType;
  name: string;
  location: string;
  level: number;
  status: FactoryStatus;
  activeRecipeId: string;
  
  // Volume / capacity tuning
  capacityUtilization: number;     // 0.1 to 1.0 (10% to 100%)
  targetBatchVolume: number;       // Multiplier for batch size (1 to 10)
  
  // Operational parameters
  employeesCount: number;
  employeeSalaryDaily: number;
  electricityKWhDaily: number;
  electricityPricePerKWh: number;  // Default ~$0.14/kWh
  maintenanceDaily: number;
  
  // Automation settings
  automation: FactoryAutomationConfig;
  
  // Progress tracker
  progress: ProductionProgressState;
  
  // Metrics & Stats
  dailyProducedUnits: number;
  dailyRevenue: number;
  dailyExpenses: number;
  dailyProfit: number;
  totalProducedUnits: number;
  totalRevenueAllTime: number;
  totalCostAllTime: number;
  
  // Diagnostic logs
  missingMaterials: string[];
  recentLogs: FactoryLogEntry[];
}

export interface ProductionChainNode {
  id: string;
  name: string;
  category: string;
  type: 'raw' | 'intermediate' | 'finished';
  iconName: string;
  factoryType?: FactoryType;
  factoryName?: string;
  recipeName?: string;
  unit: string;
  avgMarketPrice: number;
  inStockQuantity: number;
}

export interface ProductionChainDefinition {
  id: FactoryChainId;
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  description: string;
  steps: ProductionChainNode[];
  associatedFactories: FactoryType[];
}

export interface IndustrialState {
  factories: IndustrialFactory[];
  selectedFactoryId?: string;
  totalIndustrialInvestment: number;
  totalIndustrialRevenue: number;
  totalIndustrialProfit: number;
  totalUnitsManufactured: number;
  electricityTariffKWh: number;
}
