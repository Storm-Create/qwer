/**
 * Business Empire: Ultimate
 * Used Car Market, Generation, Bargaining Engine, and Diagnostics
 */

import {
  CarComponentState,
  CarComponentType,
  CarFault,
  DiagnosticsReport,
  UsedCarListing,
} from '../../types/automotive';
import { CAR_CATALOG } from './carCatalog';

const CITIES = ['Москва', 'Санкт-Петербург', 'Дубай', 'Мюнхен', 'Токио', 'Лос-Анджелес', 'Франкфурт', 'Сеул'];
const COLORS = ['Черный металлик', 'Белый перламутр', 'Серый графит', 'Синий сапфир', 'Красный рубин', 'Серебристый', 'Зеленый изумруд'];

export class UsedMarketSystem {
  /**
   * Generates a realistic set of used car listings
   */
  public static generateMarketListings(currentDay: number, count: number = 24): UsedCarListing[] {
    const listings: UsedCarListing[] = [];

    for (let i = 0; i < count; i++) {
      const template = CAR_CATALOG[Math.floor(Math.random() * CAR_CATALOG.length)];
      const ageYears = Math.floor(Math.random() * 8) + 1; // 1 to 8 years old
      const year = Math.max(1990, 2024 - ageYears);
      const mileageKm = Math.round(ageYears * (12000 + Math.random() * 20000));

      // Calculate base condition and wear based on age and mileage
      const baseCondition = Math.max(25, Math.min(98, Math.round(100 - (ageYears * 4) - (mileageKm / 6000) + (Math.random() * 15 - 7))));
      
      // Calculate realistic market value
      let marketValue = template.baseMarketPrice;
      const yearsFromBase = 2024 - year;
      const totalDeprec = Math.min(0.75, yearsFromBase * template.depreciationPerYear);
      marketValue = Math.round(marketValue * (1 - totalDeprec) * (baseCondition / 100));
      marketValue = Math.max(1500, marketValue);

      // Seller pricing psychology
      const urgencies: Array<'low' | 'medium' | 'urgent' | 'distress'> = ['low', 'medium', 'urgent', 'distress'];
      const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];
      
      const personalities: Array<'tough' | 'flexible' | 'desperate' | 'dealer'> = ['tough', 'flexible', 'desperate', 'dealer'];
      const personality = personalities[Math.floor(Math.random() * personalities.length)];

      let priceDiscountFactor = 1.0;
      if (urgency === 'distress') priceDiscountFactor = 0.68 + Math.random() * 0.12; // 68-80% of market - GOLDEN FLIP DEAL!
      else if (urgency === 'urgent') priceDiscountFactor = 0.80 + Math.random() * 0.10;
      else if (urgency === 'medium') priceDiscountFactor = 0.92 + Math.random() * 0.12;
      else priceDiscountFactor = 1.02 + Math.random() * 0.15; // Above market

      const sellerPrice = Math.round(marketValue * priceDiscountFactor);

      // Generate component states
      const components = this.generateComponents(baseCondition, template.repairCostFactor);
      
      // Generate realistic faults
      const faults = this.generateFaults(components);
      const hasUndiscoveredDamage = Math.random() < 0.35 && baseCondition < 80;

      listings.push({
        id: `listing_${Date.now()}_${i}_${Math.floor(Math.random() * 10000)}`,
        templateId: template.id,
        brand: template.brand,
        model: template.model,
        generation: template.generation,
        category: template.category,
        year,
        mileageKm,
        condition: baseCondition,
        engine: template.engine,
        enginePowerHp: template.enginePowerHp,
        fuelType: template.fuelType,
        transmission: template.transmission,
        driveType: template.driveType,
        fuelConsumption: template.fuelConsumption,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        marketPrice: marketValue,
        sellerPrice,
        sellerUrgency: urgency,
        sellerPersonality: personality,
        negotiationStep: 0,
        demandsCash: Math.random() < 0.15,
        hasUndiscoveredDamage,
        components,
        faults,
        listedDay: currentDay,
        expiresDay: currentDay + Math.floor(Math.random() * 5) + 3,
        location: CITIES[Math.floor(Math.random() * CITIES.length)],
      });
    }

    return listings;
  }

  /**
   * Generates component states for a car
   */
  public static generateComponents(overallCondition: number, costFactor: number): Record<CarComponentType, CarComponentState> {
    const types: CarComponentType[] = [
      'engine',
      'transmission',
      'suspension',
      'brakes',
      'electronics',
      'body',
      'interior',
      'wheels',
      'tires',
      'battery',
    ];

    const partMap: Record<CarComponentType, { name: string; partId: string; baseCost: number }> = {
      engine: { name: 'Двигатель и навесное', partId: 'part_engine_assembly_i4', baseCost: 1500 },
      transmission: { name: 'Коробка передач', partId: 'part_gearbox_auto_8speed', baseCost: 1200 },
      suspension: { name: 'Подвеска и стойки', partId: 'part_suspension_struts_arms', baseCost: 350 },
      brakes: { name: 'Тормозная система', partId: 'part_brakes_discs_pads_std', baseCost: 200 },
      electronics: { name: 'Электрика и блоки ЭБУ', partId: 'part_ecu_brain_harness', baseCost: 400 },
      body: { name: 'Кузов и ЛКП', partId: 'part_body_panels_bumpers', baseCost: 600 },
      interior: { name: 'Салон и отделка', partId: 'part_interior_leather_seats', baseCost: 500 },
      wheels: { name: 'Диски и ступицы', partId: 'part_wheels_forged_r20', baseCost: 450 },
      tires: { name: 'Комплект шин', partId: 'part_tires_set_premium_r19', baseCost: 300 },
      battery: { name: 'Аккумулятор / Батарея', partId: 'part_alternator_starter_kit', baseCost: 250 },
    };

    const res: Partial<Record<CarComponentType, CarComponentState>> = {};

    types.forEach(type => {
      const variance = Math.floor(Math.random() * 25) - 12;
      const cond = Math.max(10, Math.min(100, overallCondition + variance));
      const wear = 100 - cond;
      const meta = partMap[type];

      let faultDesc: string | undefined = undefined;
      if (cond < 40) {
        faultDesc = `Критический износ (${cond}%). Требуется срочная замена узла.`;
      } else if (cond < 65) {
        faultDesc = `Умеренный износ (${cond}%). Рекомендуется обслуживание.`;
      }

      res[type] = {
        type,
        name: meta.name,
        condition: cond,
        wear,
        quality: cond > 85 ? 'Оригинал' : cond > 60 ? 'Стандарт' : 'Китай',
        faultDescription: faultDesc,
        repairCostEst: Math.round(meta.baseCost * costFactor * (wear / 100)),
        requiredPartId: meta.partId,
      };
    });

    return res as Record<CarComponentType, CarComponentState>;
  }

  /**
   * Generates specific faults
   */
  public static generateFaults(components: Record<CarComponentType, CarComponentState>): CarFault[] {
    const faults: CarFault[] = [];

    if (components.engine.condition < 60) {
      faults.push({
        id: `fault_eng_${Date.now()}_1`,
        component: 'engine',
        title: 'Течь прокладки ГБЦ и масложор турбины',
        severity: components.engine.condition < 35 ? 'critical' : 'medium',
        repairCost: Math.round(components.engine.repairCostEst * 0.9),
        partRequired: 'part_turbocharger_unit',
        discovered: false,
      });
    }

    if (components.transmission.condition < 55) {
      faults.push({
        id: `fault_trans_${Date.now()}_2`,
        component: 'transmission',
        title: 'Пинки мехатроника при переключении 2-3',
        severity: 'medium',
        repairCost: Math.round(components.transmission.repairCostEst * 0.8),
        partRequired: 'part_clutch_flywheel_kit',
        discovered: false,
      });
    }

    if (components.suspension.condition < 65) {
      faults.push({
        id: `fault_susp_${Date.now()}_3`,
        component: 'suspension',
        title: 'Люфт сайлентблоков передних рычагов',
        severity: 'minor',
        repairCost: Math.round(components.suspension.repairCostEst * 0.7),
        partRequired: 'part_suspension_struts_arms',
        discovered: false,
      });
    }

    if (components.brakes.condition < 50) {
      faults.push({
        id: `fault_brk_${Date.now()}_4`,
        component: 'brakes',
        title: 'Биение тормозных дисков при торможении',
        severity: 'medium',
        repairCost: Math.round(components.brakes.repairCostEst),
        partRequired: 'part_brakes_discs_pads_std',
        discovered: false,
      });
    }

    return faults;
  }

  /**
   * Executes a diagnostics scan
   */
  public static performDiagnostics(
    listing: UsedCarListing,
    level: 'visual' | 'obd' | 'expert',
    currentDay: number
  ): { report: DiagnosticsReport; cost: number } {
    let cost = 0;
    let accuracy = 0.6;

    if (level === 'visual') {
      cost = 0;
      accuracy = 0.6;
    } else if (level === 'obd') {
      cost = 250;
      accuracy = 0.85;
    } else if (level === 'expert') {
      cost = 750;
      accuracy = 1.0;
    }

    const discoveredFaults: string[] = [];
    let hiddenDamageFound = false;

    listing.faults.forEach(f => {
      const chance = level === 'expert' ? 1.0 : level === 'obd' ? 0.8 : 0.4;
      if (Math.random() < chance) {
        f.discovered = true;
        discoveredFaults.push(`${f.title} (${f.severity === 'critical' ? 'Критично' : 'Средне'})`);
      }
    });

    if (listing.hasUndiscoveredDamage && level === 'expert') {
      hiddenDamageFound = true;
      discoveredFaults.push('ВНИМАНИЕ: Обнаружено нарушение геометрии лонжеронов после ДТП!');
    }

    let estTotalRepair = 0;
    Object.values(listing.components).forEach(c => {
      if (c.condition < 80) {
        estTotalRepair += c.repairCostEst;
      }
    });

    const realMarketValue = Math.round(listing.marketPrice * (hiddenDamageFound ? 0.75 : 1.0));

    const report: DiagnosticsReport = {
      timestamp: Date.now(),
      gameDay: currentDay,
      level,
      cost,
      accuracy,
      discoveredFaults,
      hiddenDamageFound,
      actualOverallCondition: listing.condition,
      estimatedRepairCost: estTotalRepair,
      realMarketValue,
    };

    listing.diagnosticsReport = report;
    return { report, cost };
  }

  /**
   * Bargaining / Negotiation step
   */
  public static negotiatePrice(
    listing: UsedCarListing,
    offeredPrice: number
  ): {
    status: 'accepted' | 'counter' | 'rejected' | 'offended';
    counterPrice?: number;
    message: string;
  } {
    listing.negotiationStep += 1;
    const currentPrice = listing.lastCounterOffer || listing.sellerPrice;
    const discountRequestedPct = (currentPrice - offeredPrice) / currentPrice;

    // Distressed sellers accept big discounts
    let maxAllowedDiscount = 0.12; // default 12%
    if (listing.sellerUrgency === 'distress') maxAllowedDiscount = 0.28;
    else if (listing.sellerUrgency === 'urgent') maxAllowedDiscount = 0.20;
    else if (listing.sellerPersonality === 'desperate') maxAllowedDiscount = 0.25;
    else if (listing.sellerPersonality === 'tough') maxAllowedDiscount = 0.06;

    if (offeredPrice >= currentPrice) {
      return {
        status: 'accepted',
        message: 'Продавец согласился на сделку без колебаний!',
      };
    }

    if (discountRequestedPct > 0.40) {
      // Outrageous lowball
      return {
        status: 'offended',
        message: 'Продавец оскорблен вашим предложением и завершил разговор!',
      };
    }

    if (discountRequestedPct <= maxAllowedDiscount) {
      // Accept offer!
      listing.sellerPrice = offeredPrice;
      return {
        status: 'accepted',
        message: `Продавец согласился уступить! Итоговая цена: $${offeredPrice.toLocaleString()}`,
      };
    }

    // Counter offer
    const counterDiscount = maxAllowedDiscount * 0.75;
    const counterPrice = Math.round(currentPrice * (1 - counterDiscount));
    listing.lastCounterOffer = counterPrice;

    if (listing.negotiationStep >= 3) {
      return {
        status: 'rejected',
        counterPrice,
        message: `Это моё последнее слово: $${counterPrice.toLocaleString()}. Меньше не отдам.`,
      };
    }

    return {
      status: 'counter',
      counterPrice,
      message: `Ваша цена слишком низкая. Готов отдать за $${counterPrice.toLocaleString()}.`,
    };
  }
}
