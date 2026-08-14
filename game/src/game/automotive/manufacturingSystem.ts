/**
 * Business Empire: Ultimate
 * Automotive Factory, Assembly Line, Bill of Materials (BOM), QC & Unit Economics
 */

import {
  AutoFactoryLine,
  CustomCarModelDesign,
  OwnedCar,
} from '../../types/automotive';
import { UsedMarketSystem } from './usedMarketSystem';

export class ManufacturingSystem {
  /**
   * Generates default automotive assembly plant
   */
  public static createFactoryLine(name: string, location: string): { factory: AutoFactoryLine; cost: number } {
    const cost = 2500000; // $2.5M for standard assembly plant
    const factory: AutoFactoryLine = {
      id: `factory_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      location,
      level: 1,
      tierName: 'Автосборочный цех (Мелкосерийное производство)',
      roboticsLevel: 1,
      automatedPaintShop: false,
      qualityControlLab: false,
      workersCount: 45,
      engineersCount: 8,
      dailySalaryExpense: 5500,
      dailyPowerExpense: 1800,
      dailyMaintenance: 1200,
      capacityCarsPerMonth: 60,
      defectRatePct: 8.5,
    };

    return { factory, cost };
  }

  /**
   * Calculates true Unit Economics & BOM for a custom car model
   */
  public static calculateUnitCost(design: Partial<CustomCarModelDesign>): {
    materialsCost: number;
    partsCost: number;
    laborCost: number;
    energyCost: number;
    overheadCost: number;
    totalUnitCost: number;
    recommendedRetailPrice: number;
  } {
    let materialsCost = 4500;
    let partsCost = 6500;
    let laborCost = 1800;
    let energyCost = 600;
    let overheadCost = 900;

    // Adjust according to engine type & power
    if (design.engineType === 'electric_dual_motor') {
      partsCost += 8500; // EV Battery + dual inverters
      materialsCost += 2000;
    } else if (design.engineType === 'ice_v8_twin_turbo') {
      partsCost += 6000;
      materialsCost += 1500;
    }

    if (design.interiorTrim === 'nappa_carbon') partsCost += 2500;
    else if (design.interiorTrim === 'executive_wood') partsCost += 3500;

    if (design.techPackage === 'full_autopilot') partsCost += 3000;

    const totalUnitCost = materialsCost + partsCost + laborCost + energyCost + overheadCost;
    const recommendedRetailPrice = Math.round(totalUnitCost * 1.45); // 45% standard gross margin

    return {
      materialsCost,
      partsCost,
      laborCost,
      energyCost,
      overheadCost,
      totalUnitCost,
      recommendedRetailPrice,
    };
  }

  /**
   * Upgrades factory line robotics / QC
   */
  public static upgradeFactoryLine(
    factory: AutoFactoryLine,
    upgradeType: 'robotics' | 'paint' | 'qc'
  ): { success: boolean; cost: number; message: string } {
    if (upgradeType === 'robotics') {
      if (factory.roboticsLevel >= 5) {
        return { success: false, cost: 0, message: 'Роботизация уже на максимальном уровне (KUKA Robotics 5.0)!' };
      }
      const cost = 1200000 * factory.roboticsLevel;
      factory.roboticsLevel += 1;
      factory.capacityCarsPerMonth += 40;
      factory.defectRatePct = Math.max(0.8, factory.defectRatePct - 1.5);
      return { success: true, cost, message: `Роботизированные манипуляторы улучшены до уровня ${factory.roboticsLevel}! Производительность выросла!` };
    }

    if (upgradeType === 'paint') {
      if (factory.automatedPaintShop) {
        return { success: false, cost: 0, message: 'Автоматический окрасочный комплекс уже установлен!' };
      }
      const cost = 1800000;
      factory.automatedPaintShop = true;
      factory.defectRatePct = Math.max(0.8, factory.defectRatePct - 2.0);
      return { success: true, cost, message: 'Автоматизированная катафорезная покрасочная линия успешно запущена!' };
    }

    if (upgradeType === 'qc') {
      if (factory.qualityControlLab) {
        return { success: false, cost: 0, message: 'Лаборатория контроля качества ISO 9001 уже работает!' };
      }
      const cost = 950000;
      factory.qualityControlLab = true;
      factory.defectRatePct = Math.max(0.5, factory.defectRatePct - 2.5);
      return { success: true, cost, message: 'Стенд лазерного 3D-контроля геометрии и испытательный трек активированы!' };
    }

    return { success: false, cost: 0, message: 'Неизвестный тип улучшения' };
  }

  /**
   * Completes a manufactured car unit and generates an OwnedCar
   */
  public static produceCarUnit(
    design: CustomCarModelDesign,
    brandName: string,
    factory: AutoFactoryLine,
    currentDay: number
  ): OwnedCar {
    const isDefective = Math.random() * 100 < factory.defectRatePct;
    const condition = isDefective ? 82 : 100;
    const unitCost = design.calculatedUnitCost;
    const marketValue = design.recommendedRetailPrice;

    const components = UsedMarketSystem.generateComponents(condition, 1.0);

    return {
      id: `mfg_car_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      templateId: design.id,
      brand: brandName,
      model: design.name,
      generation: 'I Gen (Заводская сборка)',
      category: design.category,
      year: 2024,
      mileageKm: 15,
      condition,
      engine: `${design.engineType === 'electric_dual_motor' ? 'EV Dual Motor' : 'Turbo'} (${design.enginePowerHp} л.с.)`,
      enginePowerHp: design.enginePowerHp,
      fuelType: design.engineType === 'electric_dual_motor' ? 'electric' : 'petrol',
      transmission: design.transmission,
      driveType: design.driveType,
      fuelConsumption: design.engineType === 'electric_dual_motor' ? 16.5 : 8.5,
      color: 'Белый перламутр',
      marketValue,
      status: 'in_garage',
      location: `Завод ${factory.name}`,
      components,
      faults: isDefective ? [{
        id: `fault_mfg_${Date.now()}`,
        component: 'electronics',
        title: 'Заводской дефект калибровки датчиков ADAS',
        severity: 'minor',
        repairCost: 350,
        partRequired: 'part_ecu_brain_harness',
        discovered: true,
      }] : [],
      tuning: {
        chipStage: 0,
        paintType: 'factory',
        tintLevel: 'none',
        exhaustUpgraded: false,
        sportSuspension: false,
        leatherInteriorRedone: false,
        soundSystemUpgraded: false,
        detailingDone: true,
        powerGainHp: 0,
        valueAdded: 0,
      },
      financials: {
        purchasePrice: unitCost,
        diagnosticsCost: 0,
        partsCost: 0,
        laborCost: 0,
        tuningCost: 0,
        logisticsCost: 0,
        advertisingCost: 0,
        totalInvested: unitCost,
      },
      acquiredDay: currentDay,
      isManufacturedByPlayer: true,
      customBrandName: brandName,
      warrantyMonthsRemaining: 36, // 3 years factory warranty
    };
  }
}
