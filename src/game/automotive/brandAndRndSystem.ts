/**
 * Business Empire: Ultimate
 * Automotive Brand, R&D Tech Tree & Custom Model Designer
 */

import {
  AutomotiveRndTech,
  CustomCarModelDesign,
  PlayerCarBrand,
} from '../../types/automotive';
import { ManufacturingSystem } from './manufacturingSystem';

export const DEFAULT_RND_TECHS: AutomotiveRndTech[] = [
  {
    id: 'rnd_modular_platform',
    name: 'Модульная платформа шасси (CMA/MQB)',
    category: 'materials',
    description: 'Универсальная база для седанов и кроссоверов, снижает себестоимость сборки на 12%.',
    cost: 500000,
    researchHours: 48,
    progressHours: 48,
    unlocked: true,
    requiredTechIds: [],
    bonusEffects: { costReductionPct: 12 },
  },
  {
    id: 'rnd_twin_scroll_turbo',
    name: 'Twin-Scroll турбокомпрессор высокого давления',
    category: 'powertrain',
    description: 'Повышает удельную мощность моторов на 18% без увеличения расхода топлива.',
    cost: 850000,
    researchHours: 72,
    progressHours: 0,
    unlocked: false,
    requiredTechIds: ['rnd_modular_platform'],
    bonusEffects: { powerMultiplier: 1.18 },
  },
  {
    id: 'rnd_solid_state_battery',
    name: 'Твердотельные аккумуляторы (Solid-State EV)',
    category: 'battery',
    description: 'Увеличение запаса хода на 40% и зарядка за 12 минут без риска возгорания.',
    cost: 2500000,
    researchHours: 120,
    progressHours: 0,
    unlocked: false,
    requiredTechIds: ['rnd_modular_platform'],
    bonusEffects: { rangeBoostPct: 40, demandBoostPct: 25 },
  },
  {
    id: 'rnd_level3_autopilot',
    name: 'Автопилот Level 3 (AI Vision + LiDAR)',
    category: 'autopilot',
    description: 'Полный автопилот на магистралях с нейросетевым зрением. Взрывной рост спроса на 30%.',
    cost: 3200000,
    researchHours: 160,
    progressHours: 0,
    unlocked: false,
    requiredTechIds: ['rnd_modular_platform'],
    bonusEffects: { demandBoostPct: 30 },
  },
  {
    id: 'rnd_carbon_tub_chassis',
    name: 'Углепластиковый карбоновый монокок (Carbon Tub)',
    category: 'materials',
    description: 'Снижение массы авто на 300 кг и сверхвысокая жесткость на кручение.',
    cost: 1900000,
    researchHours: 96,
    progressHours: 0,
    unlocked: false,
    requiredTechIds: ['rnd_modular_platform'],
    bonusEffects: { defectReductionPct: 3 },
  },
];

export class BrandAndRndSystem {
  /**
   * Registers a new custom player car brand
   */
  public static createBrand(
    name: string,
    country: string,
    positioning: 'budget' | 'mass' | 'premium' | 'luxury' | 'sport' | 'ev'
  ): PlayerCarBrand {
    return {
      id: `brand_${Date.now()}`,
      name,
      logo: '🏎️',
      country,
      foundedYear: 2024,
      positioning,
      reputation: 50,
      prestigeScore: positioning === 'luxury' || positioning === 'sport' ? 80 : 50,
      totalCarsManufactured: 0,
      totalCarsSold: 0,
      activeModelsCount: 0,
    };
  }

  /**
   * Designs a new custom car model
   */
  public static designNewModel(
    brand: PlayerCarBrand,
    name: string,
    category: any,
    engineType: any,
    enginePowerHp: number,
    interiorTrim: any,
    techPackage: any
  ): CustomCarModelDesign {
    const rawDesign: Partial<CustomCarModelDesign> = {
      name,
      category,
      engineType,
      enginePowerHp,
      interiorTrim,
      techPackage,
    };

    const costBreakdown = ManufacturingSystem.calculateUnitCost(rawDesign);

    const model: CustomCarModelDesign = {
      id: `model_design_${Date.now()}`,
      brandId: brand.id,
      name,
      category,
      bodyType: category === 'suv' ? 'SUV 5-дверный' : category === 'sport' ? 'Купе 2-дверное' : 'Седан',
      engineType,
      enginePowerHp,
      transmission: engineType === 'electric_dual_motor' ? 'single_speed' : 'automatic',
      driveType: 'awd',
      interiorTrim,
      techPackage,
      calculatedUnitCost: costBreakdown.totalUnitCost,
      recommendedRetailPrice: costBreakdown.recommendedRetailPrice,
      productionHoursPerCar: 12,
      bomRequirements: [
        { commodityId: 'cat_metally_item_2_var_1', name: 'Алюминий первичный слитки', quantity: 2 },
        { commodityId: 'cat_stroymaterialy_item_2_var_1', name: 'Арматура строительная стальная', quantity: 3 },
        { commodityId: 'cat_plastik_item_2_var_2', name: 'ABS-пластик ударопрочный', quantity: 2 },
      ],
      partsRequirements: [
        { partId: 'part_engine_assembly_i4', name: 'Двигатель в сборе', quantity: 1 },
        { partId: 'part_brakes_discs_pads_std', name: 'Тормозная система', quantity: 1 },
        { partId: 'part_suspension_struts_arms', name: 'Подвеска', quantity: 1 },
        { partId: 'part_tires_set_premium_r19', name: 'Шины', quantity: 1 },
      ],
      qualityRating: 88,
      safetyRating: 5,
      reliabilityRating: 86,
      marketDemandScore: 1.8,
      researchCompleted: true,
      researchProgressHours: 24,
      totalResearchHours: 24,
    };

    brand.activeModelsCount += 1;
    return model;
  }
}
