/**
 * Business Empire: Ultimate
 * Auto Service, Repair Bays, Detailing, Tuning & Workshop Management
 */

import {
  AutoServiceWorkshop,
  CarComponentType,
  CarTuningState,
  OwnedCar,
} from '../../types/automotive';

export class AutoServiceSystem {
  /**
   * Generates initial workshop (Level 1 Garage)
   */
  public static createDefaultWorkshop(): AutoServiceWorkshop {
    return {
      id: 'workshop_main',
      name: 'Гаражный бокс "Перекуп-Авто"',
      level: 1,
      tierName: 'Гаражный сервис (2 подъемника)',
      location: 'Москва (ЮАО)',
      areaSqM: 120,
      liftsCount: 2,
      mechanicsCount: 2,
      equipmentLevel: 1,
      reputation: 45,
      dailyRent: 150,
      dailyMaintenance: 50,
      customerThroughputDaily: 3,
      dailyCustomerRevenue: 450,
      dailyCustomerProfit: 250,
      activePlayerCarRepairs: [],
    };
  }

  /**
   * Upgrades a workshop to the next tier
   */
  public static upgradeWorkshop(workshop: AutoServiceWorkshop): { success: boolean; cost: number; message: string } {
    if (workshop.level >= 4) {
      return { success: false, cost: 0, message: 'Автосервис уже улучшен до максимального уровня (Флагманская сеть)!' };
    }

    const upgradeCosts = [0, 25000, 85000, 250000];
    const targetLevel = (workshop.level + 1) as 1 | 2 | 3 | 4;
    const cost = upgradeCosts[workshop.level];

    workshop.level = targetLevel;
    if (targetLevel === 2) {
      workshop.tierName = 'Автосервис среднего класса (4 подъёмника)';
      workshop.areaSqM = 350;
      workshop.liftsCount = 4;
      workshop.mechanicsCount = 5;
      workshop.equipmentLevel = 2;
      workshop.dailyRent = 450;
      workshop.dailyMaintenance = 150;
      workshop.reputation = 65;
      workshop.customerThroughputDaily = 8;
      workshop.dailyCustomerRevenue = 1600;
      workshop.dailyCustomerProfit = 950;
    } else if (targetLevel === 3) {
      workshop.tierName = 'Премиальный техцентр (8 подъёмников + Покрасочная камера)';
      workshop.areaSqM = 850;
      workshop.liftsCount = 8;
      workshop.mechanicsCount = 12;
      workshop.equipmentLevel = 4;
      workshop.dailyRent = 1200;
      workshop.dailyMaintenance = 400;
      workshop.reputation = 85;
      workshop.customerThroughputDaily = 18;
      workshop.dailyCustomerRevenue = 4800;
      workshop.dailyCustomerProfit = 3100;
    } else if (targetLevel === 4) {
      workshop.tierName = 'Флагманский сетевой дилерский СТО (16 подъёмников)';
      workshop.areaSqM = 2200;
      workshop.liftsCount = 16;
      workshop.mechanicsCount = 28;
      workshop.equipmentLevel = 5;
      workshop.dailyRent = 3500;
      workshop.dailyMaintenance = 1100;
      workshop.reputation = 98;
      workshop.customerThroughputDaily = 45;
      workshop.dailyCustomerRevenue = 15000;
      workshop.dailyCustomerProfit = 10200;
    }

    return {
      success: true,
      cost,
      message: `Сервис успешно модернизирован до уровня "${workshop.tierName}"!`,
    };
  }

  /**
   * Repairs a single component on an owned car
   */
  public static repairComponent(
    car: OwnedCar,
    componentType: CarComponentType,
    useWarehousePart: boolean,
    warehouseStock: Record<string, number>
  ): { success: boolean; cost: number; message: string } {
    const comp = car.components[componentType];
    if (!comp) return { success: false, cost: 0, message: 'Компонент не найден' };

    if (comp.condition >= 98) {
      return { success: false, cost: 0, message: 'Компонент уже в идеальном состоянии!' };
    }

    let cost = comp.repairCostEst;
    let partUsed = false;

    if (useWarehousePart && comp.requiredPartId) {
      const stock = warehouseStock[comp.requiredPartId] || 0;
      if (stock > 0) {
        warehouseStock[comp.requiredPartId] = stock - 1;
        cost = Math.round(cost * 0.35); // 65% savings on parts, pay only labor!
        partUsed = true;
      }
    }

    comp.condition = 100;
    comp.wear = 0;
    comp.quality = 'Оригинал';
    comp.faultDescription = undefined;
    comp.repairCostEst = 0;

    // Remove associated faults
    car.faults = car.faults.filter(f => f.component !== componentType);

    // Recalculate car overall condition
    const avgCond = Math.round(
      Object.values(car.components).reduce((sum, c) => sum + c.condition, 0) /
        Object.keys(car.components).length
    );
    car.condition = avgCond;

    // Update financials & market value
    car.financials.partsCost += partUsed ? 0 : Math.round(cost * 0.7);
    car.financials.laborCost += Math.round(cost * 0.3);
    car.financials.totalInvested += cost;

    // Recalculate market value gain
    const valueBoost = Math.round(cost * 1.35);
    car.marketValue += valueBoost;

    return {
      success: true,
      cost,
      message: `Узел "${comp.name}" полностью отремонтирован! Состояние авто: ${car.condition}%, рыночная стоимость выросла на $${valueBoost.toLocaleString()}.`,
    };
  }

  /**
   * Fully restores all components on an owned car
   */
  public static fullyRestoreCar(
    car: OwnedCar,
    warehouseStock: Record<string, number>
  ): { success: boolean; totalCost: number; message: string } {
    let totalCost = 0;
    const types = Object.keys(car.components) as CarComponentType[];

    types.forEach(t => {
      if (car.components[t].condition < 95) {
        const res = this.repairComponent(car, t, true, warehouseStock);
        if (res.success) {
          totalCost += res.cost;
        }
      }
    });

    car.condition = 99;
    return {
      success: true,
      totalCost,
      message: `Автомобиль ${car.brand} ${car.model} прошел полный капитальный ремонт! Состояние: 99%, затраты: $${totalCost.toLocaleString()}`,
    };
  }

  /**
   * Applies full detailing (wash, polish, ceramic coating, dry clean interior)
   */
  public static applyDetailing(car: OwnedCar): { success: boolean; cost: number; valueAdded: number; message: string } {
    if (car.tuning.detailingDone) {
      return { success: false, cost: 0, valueAdded: 0, message: 'Детейлинг уже выполнен на высшем уровне!' };
    }

    const cost = Math.max(350, Math.round(car.marketValue * 0.025));
    const valueAdded = Math.round(cost * 2.2); // 220% ROI on detailing

    car.tuning.detailingDone = true;
    car.tuning.paintType = 'ceramic';
    car.tuning.valueAdded += valueAdded;
    car.financials.tuningCost += cost;
    car.financials.totalInvested += cost;
    car.marketValue += valueAdded;
    car.condition = Math.min(100, car.condition + 5);

    return {
      success: true,
      cost,
      valueAdded,
      message: `Комплексный детейлинг завершен! Керамика нанесена, салон сияет. Стоимость авто выросла на $${valueAdded.toLocaleString()}!`,
    };
  }

  /**
   * Applies Engine Stage Chip Tuning
   */
  public static applyChipTuning(
    car: OwnedCar,
    targetStage: 1 | 2 | 3
  ): { success: boolean; cost: number; hpGain: number; valueAdded: number; message: string } {
    if (car.tuning.chipStage >= targetStage) {
      return { success: false, cost: 0, hpGain: 0, valueAdded: 0, message: `Уже установлен Stage ${car.tuning.chipStage}!` };
    }

    let cost = 600;
    let hpGain = Math.round(car.enginePowerHp * 0.20); // +20% HP
    let valueAdded = Math.round(cost * 1.5);

    if (targetStage === 2) {
      cost = 1800;
      hpGain = Math.round(car.enginePowerHp * 0.35); // +35% HP
      valueAdded = Math.round(cost * 1.6);
    } else if (targetStage === 3) {
      cost = 5500;
      hpGain = Math.round(car.enginePowerHp * 0.60); // +60% HP
      valueAdded = Math.round(cost * 1.75);
    }

    car.tuning.chipStage = targetStage;
    car.tuning.powerGainHp += hpGain;
    car.enginePowerHp += hpGain;
    car.tuning.valueAdded += valueAdded;
    car.financials.tuningCost += cost;
    car.financials.totalInvested += cost;
    car.marketValue += valueAdded;

    return {
      success: true,
      cost,
      hpGain,
      valueAdded,
      message: `Успешно установлен Stage ${targetStage}! Прирост мощности: +${hpGain} л.с. (Итого: ${car.enginePowerHp} л.с.). Рыночная стоимость: +$${valueAdded.toLocaleString()}`,
    };
  }
}
