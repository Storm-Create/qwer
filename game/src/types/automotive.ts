/**
 * Business Empire: Ultimate
 * Automotive Industry, Used Car Trading, Service, Parts & Manufacturing Types
 */

import { GameTime } from './game';

export type CarCategory =
  | 'budget'
  | 'city'
  | 'sedan'
  | 'wagon'
  | 'crossover'
  | 'suv'
  | 'pickup'
  | 'sport'
  | 'premium'
  | 'luxury'
  | 'ev'
  | 'hybrid'
  | 'classic'
  | 'commercial'
  | 'truck'
  | 'supercar'
  | 'hypercar';

export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'hydrogen';
export type TransmissionType = 'manual' | 'automatic' | 'robot' | 'cvt' | 'single_speed';
export type DriveType = 'fwd' | 'rwd' | 'awd' | '4wd';

export type CarComponentType =
  | 'engine'
  | 'transmission'
  | 'suspension'
  | 'brakes'
  | 'electronics'
  | 'body'
  | 'interior'
  | 'wheels'
  | 'tires'
  | 'battery';

export interface CarComponentState {
  type: CarComponentType;
  name: string;
  condition: number; // 0 to 100%
  wear: number; // 0 to 100%
  quality: 'Эконом' | 'Стандарт' | 'Премиум' | 'Оригинал' | 'OEM' | 'Китай' | 'Люкс';
  faultDescription?: string;
  repairCostEst: number;
  requiredPartId: string;
}

export interface DiagnosticsReport {
  timestamp: number;
  gameDay: number;
  level: 'visual' | 'obd' | 'expert';
  cost: number;
  accuracy: number; // 0.6 to 1.0
  discoveredFaults: string[];
  hiddenDamageFound: boolean;
  actualOverallCondition: number;
  estimatedRepairCost: number;
  realMarketValue: number;
}

export interface CarFault {
  id: string;
  component: CarComponentType;
  title: string;
  severity: 'minor' | 'medium' | 'critical';
  repairCost: number;
  partRequired: string;
  discovered: boolean;
}

export interface CarTuningState {
  chipStage: 0 | 1 | 2 | 3;
  paintType: 'factory' | 'ceramic' | 'metallic' | 'matte' | 'wrap';
  tintLevel: 'none' | 'rear' | 'full';
  exhaustUpgraded: boolean;
  sportSuspension: boolean;
  leatherInteriorRedone: boolean;
  soundSystemUpgraded: boolean;
  detailingDone: boolean; // polished + dry cleaned
  powerGainHp: number;
  valueAdded: number;
}

export interface CarFinancialRecord {
  purchasePrice: number;
  diagnosticsCost: number;
  partsCost: number;
  laborCost: number;
  tuningCost: number;
  logisticsCost: number;
  advertisingCost: number;
  totalInvested: number;
  soldPrice?: number;
  realizedProfit?: number;
  roiPercent?: number;
  soldDay?: number;
}

export interface CarModelTemplate {
  id: string;
  brand: string;
  model: string;
  generation: string;
  category: CarCategory;
  baseYear: number;
  engine: string;
  enginePowerHp: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  driveType: DriveType;
  fuelConsumption: number; // L/100km or kWh/100km
  baseNewPrice: number;
  baseMarketPrice: number;
  demand: number; // 0.3 to 2.5
  rarity: number; // 1 to 10
  reliability: number; // 1 to 100
  repairCostFactor: number; // 0.5 to 3.0
  depreciationPerYear: number; // 0.05 to 0.20
  description: string;
}

export interface UsedCarListing {
  id: string;
  templateId: string;
  brand: string;
  model: string;
  generation: string;
  category: CarCategory;
  year: number;
  mileageKm: number;
  condition: number; // 0 to 100%
  engine: string;
  enginePowerHp: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  driveType: DriveType;
  fuelConsumption: number;
  color: string;
  marketPrice: number;
  sellerPrice: number;
  sellerUrgency: 'low' | 'medium' | 'urgent' | 'distress';
  sellerPersonality: 'tough' | 'flexible' | 'desperate' | 'dealer';
  negotiationStep: number;
  lastCounterOffer?: number;
  demandsCash: boolean;
  hasUndiscoveredDamage: boolean;
  components: Record<CarComponentType, CarComponentState>;
  faults: CarFault[];
  diagnosticsReport?: DiagnosticsReport;
  listedDay: number;
  expiresDay: number;
  location: string;
}

export interface OwnedCar {
  id: string;
  templateId: string;
  brand: string;
  model: string;
  generation: string;
  category: CarCategory;
  year: number;
  mileageKm: number;
  condition: number; // 0 to 100%
  engine: string;
  enginePowerHp: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  driveType: DriveType;
  fuelConsumption: number;
  color: string;
  marketValue: number;
  status: 'in_garage' | 'in_service' | 'in_showroom' | 'in_transit' | 'for_sale';
  location: string; // e.g., 'Гараж (Москва)', 'Автосалон Премиум'
  components: Record<CarComponentType, CarComponentState>;
  faults: CarFault[];
  tuning: CarTuningState;
  financials: CarFinancialRecord;
  diagnosticsReport?: DiagnosticsReport;
  acquiredDay: number;
  assignedShowroomId?: string;
  saleAskingPrice?: number;
  isManufacturedByPlayer?: boolean;
  customBrandName?: string;
  warrantyMonthsRemaining?: number;
}

export type AutoPartCategory =
  | 'engine'
  | 'transmission'
  | 'brakes'
  | 'suspension'
  | 'electronics'
  | 'body'
  | 'interior'
  | 'wheels'
  | 'tires'
  | 'fluids'
  | 'battery';

export interface AutoPartItem {
  id: string;
  name: string;
  category: AutoPartCategory;
  quality: 'Эконом' | 'Стандарт' | 'Премиум' | 'Оригинал' | 'OEM' | 'Китай' | 'Люкс';
  basePrice: number;
  marketPrice: number;
  supplier: string;
  weight: number; // kg
  volume: number; // m3
  productionCost: number;
  materialRequirements: Array<{
    commodityId: string;
    commodityName: string;
    quantity: number;
  }>;
  description: string;
}

export interface AutoServiceWorkshop {
  id: string;
  name: string;
  level: 1 | 2 | 3 | 4; // Garage, Service, Premium Tech Center, Flagship Network
  tierName: string;
  location: string;
  areaSqM: number;
  liftsCount: number;
  mechanicsCount: number;
  equipmentLevel: number; // 1 to 5
  reputation: number; // 0 to 100
  dailyRent: number;
  dailyMaintenance: number;
  customerThroughputDaily: number;
  dailyCustomerRevenue: number;
  dailyCustomerProfit: number;
  activePlayerCarRepairs: Array<{
    carId: string;
    component: CarComponentType;
    hoursRemaining: number;
    totalHours: number;
    partUsedId?: string;
    cost: number;
  }>;
}

export interface CarDealership {
  id: string;
  name: string;
  type: 'budget' | 'standard' | 'premium' | 'luxury';
  location: string;
  capacityCars: number;
  carsOnDisplayIds: string[];
  salesStaffCount: number;
  marketingDailyBudget: number;
  reputation: number; // 0 to 100
  dailyRent: number;
  dailyExpense: number;
  totalCarsSold: number;
  totalRevenueGenerated: number;
  totalProfitGenerated: number;
}

export interface PlayerCarBrand {
  id: string;
  name: string;
  logo: string;
  country: string;
  foundedYear: number;
  positioning: 'budget' | 'mass' | 'premium' | 'luxury' | 'sport' | 'ev';
  reputation: number; // 0 to 100
  prestigeScore: number;
  totalCarsManufactured: number;
  totalCarsSold: number;
  activeModelsCount: number;
}

export interface CustomCarModelDesign {
  id: string;
  brandId: string;
  name: string;
  category: CarCategory;
  bodyType: string;
  engineType: 'ice_petrol' | 'ice_diesel' | 'ice_v8_twin_turbo' | 'electric_dual_motor' | 'hybrid_phev';
  enginePowerHp: number;
  transmission: TransmissionType;
  driveType: DriveType;
  interiorTrim: 'basic_cloth' | 'comfort_leather' | 'nappa_carbon' | 'executive_wood';
  techPackage: 'standard' | 'advanced_adas' | 'full_autopilot';
  batteryCapacityKwh?: number;
  calculatedUnitCost: number;
  recommendedRetailPrice: number;
  productionHoursPerCar: number;
  bomRequirements: Array<{
    commodityId: string;
    name: string;
    quantity: number;
  }>;
  partsRequirements: Array<{
    partId: string;
    name: string;
    quantity: number;
  }>;
  qualityRating: number; // 50 to 100
  safetyRating: number; // 1 to 5 stars
  reliabilityRating: number; // 1 to 100
  marketDemandScore: number;
  researchCompleted: boolean;
  researchProgressHours: number;
  totalResearchHours: number;
}

export interface AutoFactoryLine {
  id: string;
  name: string;
  location: string;
  level: number; // 1 to 5
  tierName: string;
  roboticsLevel: number; // 1 to 5
  automatedPaintShop: boolean;
  qualityControlLab: boolean;
  workersCount: number;
  engineersCount: number;
  dailySalaryExpense: number;
  dailyPowerExpense: number;
  dailyMaintenance: number;
  capacityCarsPerMonth: number;
  defectRatePct: number; // 1% to 15%
  activeProductionBatch?: {
    modelId: string;
    modelName: string;
    targetQuantity: number;
    completedQuantity: number;
    hoursRemaining: number;
    totalHours: number;
    unitCost: number;
    targetWarehouseId: string;
    warrantyOfferedMonths: number;
  };
}

export interface AutomotiveRndTech {
  id: string;
  name: string;
  category: 'powertrain' | 'battery' | 'autopilot' | 'materials' | 'safety' | 'aerodynamics';
  description: string;
  cost: number;
  researchHours: number;
  progressHours: number;
  unlocked: boolean;
  requiredTechIds: string[];
  bonusEffects: {
    powerMultiplier?: number;
    costReductionPct?: number;
    defectReductionPct?: number;
    demandBoostPct?: number;
    rangeBoostPct?: number;
  };
}

export interface AutomotiveState {
  usedMarketListings: UsedCarListing[];
  ownedCars: OwnedCar[];
  autoWorkshops: AutoServiceWorkshop[];
  dealerships: CarDealership[];
  playerBrands: PlayerCarBrand[];
  customModels: CustomCarModelDesign[];
  factoryLines: AutoFactoryLine[];
  rndTechnologies: AutomotiveRndTech[];
  partsWarehouseStock: Record<string, number>; // partId -> quantity
  lastMarketRefreshDay: number;
  totalFlipsCompleted: number;
  totalFlipProfit: number;
  totalCarsManufactured: number;
  totalCarsSoldViaDealerships: number;
  warrantyClaimsExpenseDaily: number;
}
