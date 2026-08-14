/**
 * Business Empire: Ultimate
 * Real Estate Manager Subsystem
 */

import { gameState } from '../gameState';
import { economy } from '../economy';
import {
  RealEstateProperty,
  RealEstateCatalogItem,
  RealEstateMarketState,
  RealEstateType,
} from '../../types/realEstate';
import { REAL_ESTATE_CATALOG, UPGRADE_TIERS } from './realEstateCatalog';

class RealEstateManager {
  private initialized = false;

  public initialize(): void {
    if (this.initialized) return;

    const state = gameState.getState();
    if (!state.realEstate) {
      gameState.update((draft) => {
        draft.realEstate = {
          properties: [],
          market: {
            marketIndex: 100,
            marketIndexHistory: [96, 97, 98, 99, 99.5, 100],
            districtMultipliers: {
              city_center: 1.05,
              business_district: 1.04,
              elite_suburb: 1.02,
              residential_area: 1.0,
              commercial_avenue: 1.03,
              industrial_zone: 0.98,
              logistics_hub: 1.01,
            },
            trend: 'growing',
            annualGrowthRate: 0.075, // +7.5% per year
            lastUpdatedDay: draft.gameTime.totalDays || 1,
          },
        };
      });
    }

    this.initialized = true;
  }

  public getProperties(): RealEstateProperty[] {
    this.initialize();
    return gameState.getState().realEstate?.properties || [];
  }

  public getMarketState(): RealEstateMarketState {
    this.initialize();
    return (
      gameState.getState().realEstate?.market || {
        marketIndex: 100,
        marketIndexHistory: [100],
        districtMultipliers: {},
        trend: 'stable',
        annualGrowthRate: 0.05,
        lastUpdatedDay: 1,
      }
    );
  }

  public getCatalog(): (RealEstateCatalogItem & { currentPrice: number; currentRentDaily: number; currentMaintDaily: number })[] {
    const market = this.getMarketState();
    const marketFactor = market.marketIndex / 100;

    return REAL_ESTATE_CATALOG.map((item) => {
      const districtMultiplier = market.districtMultipliers[item.districtId] || 1.0;
      const currentPrice = Math.round(item.basePrice * marketFactor * districtMultiplier);
      const currentRentDaily = Math.round(item.baseRentDaily * marketFactor * (districtMultiplier * 0.95 + 0.05));
      const currentMaintDaily = Math.round(item.baseMaintenanceDaily * (1 + (marketFactor - 1) * 0.3));

      return {
        ...item,
        currentPrice,
        currentRentDaily,
        currentMaintDaily,
      };
    });
  }

  public buyProperty(catalogId: string): { success: boolean; message: string; property?: RealEstateProperty } {
    this.initialize();
    const catalog = this.getCatalog();
    const item = catalog.find((c) => c.id === catalogId);

    if (!item) {
      return { success: false, message: 'Объект недвижимости не найден в каталоге' };
    }

    const state = gameState.getState();
    if (state.cash < item.currentPrice) {
      return {
        success: false,
        message: `Недостаточно средств. Требуется $${item.currentPrice.toLocaleString()}, в наличии $${Math.floor(state.cash).toLocaleString()}`,
      };
    }

    const newProperty: RealEstateProperty = {
      id: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: item.name,
      type: item.type,
      location: item.location,
      districtId: item.districtId,
      level: 1,
      purchasePrice: item.currentPrice,
      baseMarketValue: item.currentPrice,
      marketValue: item.currentPrice,
      rent: item.currentRentDaily,
      maintenance: item.currentMaintDaily,
      occupancy: item.baseOccupancy,
      isRented: true,
      condition: 100,
      acquiredDay: state.gameTime.totalDays,
      totalRentCollected: 0,
      priceHistory: [item.currentPrice],
      perks: [...item.perks],
      description: item.description,
      imageEmoji: item.imageEmoji,
    };

    // Deduct cash via economy
    const deducted = economy.removeMoney(
      item.currentPrice,
      'Покупка недвижимости',
      `Приобретен объект: ${item.name} ($${item.currentPrice.toLocaleString()})`,
      'investment'
    );

    if (!deducted) {
      return { success: false, message: 'Ошибка при проведении платежа' };
    }

    gameState.update((draft) => {
      if (!draft.realEstate) {
        draft.realEstate = {
          properties: [],
          market: {
            marketIndex: 100,
            marketIndexHistory: [100],
            districtMultipliers: {},
            trend: 'stable',
            annualGrowthRate: 0.05,
            lastUpdatedDay: draft.gameTime.totalDays,
          },
        };
      }
      draft.realEstate.properties.push(newProperty);
      draft.statistics.transactionsCount += 1;
    });

    return {
      success: true,
      message: `Объект «${item.name}» успешно приобретен за $${item.currentPrice.toLocaleString()}!`,
      property: newProperty,
    };
  }

  public sellProperty(propertyId: string): { success: boolean; message: string; proceeds?: number } {
    this.initialize();
    const state = gameState.getState();
    const prop = state.realEstate?.properties.find((p) => p.id === propertyId);

    if (!prop) {
      return { success: false, message: 'Объект недвижимости не найден в вашей собственности' };
    }

    // Broker commission is 2%
    const brokerFee = Math.round(prop.marketValue * 0.02);
    const netProceeds = prop.marketValue - brokerFee;

    gameState.update((draft) => {
      if (draft.realEstate) {
        draft.realEstate.properties = draft.realEstate.properties.filter((p) => p.id !== propertyId);
      }
    });

    economy.addMoney(
      netProceeds,
      'Продажа недвижимости',
      `Продажа объекта «${prop.name}» ($${prop.marketValue.toLocaleString()} за вычетом комиссии брокера $${brokerFee.toLocaleString()})`,
      'revenue'
    );

    return {
      success: true,
      message: `Объект «${prop.name}» продан за $${netProceeds.toLocaleString()} (комиссия $${brokerFee.toLocaleString()})`,
      proceeds: netProceeds,
    };
  }

  public toggleRent(propertyId: string): { success: boolean; message: string; isRented?: boolean } {
    this.initialize();
    let newStatus = false;
    let propName = '';

    gameState.update((draft) => {
      const p = draft.realEstate?.properties.find((item) => item.id === propertyId);
      if (p) {
        p.isRented = !p.isRented;
        newStatus = p.isRented;
        propName = p.name;
      }
    });

    if (!propName) {
      return { success: false, message: 'Объект не найден' };
    }

    return {
      success: true,
      message: newStatus
        ? `Объект «${propName}» сдан в аренду. Ежедневный доход активен.`
        : `Объект «${propName}» снят с аренды. Поступления приостановлены.`,
      isRented: newStatus,
    };
  }

  public getUpgradeCost(property: RealEstateProperty): number {
    if (property.level >= 5) return 0;
    const nextTier = UPGRADE_TIERS.find((t) => t.level === property.level + 1);
    if (!nextTier) return 0;
    return Math.round(property.marketValue * nextTier.costMultiplier);
  }

  public upgradeProperty(propertyId: string): { success: boolean; message: string } {
    this.initialize();
    const state = gameState.getState();
    const prop = state.realEstate?.properties.find((p) => p.id === propertyId);

    if (!prop) {
      return { success: false, message: 'Объект не найден' };
    }

    if (prop.level >= 5) {
      return { success: false, message: 'Объект уже модернизирован до максимального 5-го уровня' };
    }

    const nextTier = UPGRADE_TIERS.find((t) => t.level === prop.level + 1);
    if (!nextTier) {
      return { success: false, message: 'Конфигурация улучшения не найдена' };
    }

    const cost = this.getUpgradeCost(prop);
    if (state.cash < cost) {
      return {
        success: false,
        message: `Недостаточно средств для улучшения. Требуется $${cost.toLocaleString()}, доступно $${Math.floor(state.cash).toLocaleString()}`,
      };
    }

    const deducted = economy.removeMoney(
      cost,
      'Улучшение недвижимости',
      `Модернизация «${prop.name}» до ур. ${prop.level + 1} ($${cost.toLocaleString()})`,
      'expense'
    );

    if (!deducted) {
      return { success: false, message: 'Не удалось списать средства' };
    }

    gameState.update((draft) => {
      const p = draft.realEstate?.properties.find((item) => item.id === propertyId);
      if (p) {
        p.level += 1;
        p.marketValue = Math.round(p.marketValue * (1 + nextTier.valueBonusMultiplier));
        p.rent = Math.round(p.rent * (1 + nextTier.rentBonusMultiplier));
        p.maintenance = Math.max(5, Math.round(p.maintenance * (1 - nextTier.maintenanceReduction)));
        p.occupancy = Math.min(100, p.occupancy + nextTier.occupancyBonus);
        p.condition = 100; // Ремонт при улучшении
        p.perks.push(nextTier.name);
      }
    });

    return {
      success: true,
      message: `Объект «${prop.name}» успешно модернизирован до уровня ${prop.level + 1}!`,
    };
  }

  public repairProperty(propertyId: string): { success: boolean; message: string } {
    this.initialize();
    const state = gameState.getState();
    const prop = state.realEstate?.properties.find((p) => p.id === propertyId);

    if (!prop) {
      return { success: false, message: 'Объект не найден' };
    }

    if (prop.condition >= 98) {
      return { success: false, message: 'Объект находится в отличном техническом состоянии' };
    }

    const wearDeficit = 100 - prop.condition;
    const repairCost = Math.max(50, Math.round(prop.marketValue * (wearDeficit / 100) * 0.04));

    if (state.cash < repairCost) {
      return {
        success: false,
        message: `Недостаточно средств на ремонт ($${repairCost.toLocaleString()})`,
      };
    }

    economy.removeMoney(
      repairCost,
      'Ремонт недвижимости',
      `Капитальный ремонт «${prop.name}» ($${repairCost.toLocaleString()})`,
      'expense'
    );

    gameState.update((draft) => {
      const p = draft.realEstate?.properties.find((item) => item.id === propertyId);
      if (p) {
        p.condition = 100;
        p.occupancy = Math.min(100, p.occupancy + 5);
      }
    });

    return {
      success: true,
      message: `Объект «${prop.name}» отремонтирован до 100% за $${repairCost.toLocaleString()}`,
    };
  }

  /**
   * Daily market tick: updates market index, district variations, property valuation history and condition
   */
  public processDailyUpdate(currentDay: number): void {
    this.initialize();

    gameState.update((draft) => {
      if (!draft.realEstate) return;

      const market = draft.realEstate.market;

      // 1. Economic market oscillation (daily drift +/- 0.4% with positive long-term drift)
      const dailyDrift = (Math.random() - 0.47) * 0.008; // slight positive bias
      const newIndex = Math.max(60, Math.min(250, market.marketIndex * (1 + dailyDrift)));
      market.marketIndex = parseFloat(newIndex.toFixed(2));

      // Market trend categorization
      if (dailyDrift > 0.003) market.trend = 'booming';
      else if (dailyDrift > 0) market.trend = 'growing';
      else if (dailyDrift > -0.003) market.trend = 'stable';
      else market.trend = 'cooling';

      market.marketIndexHistory.push(market.marketIndex);
      if (market.marketIndexHistory.length > 30) {
        market.marketIndexHistory.shift();
      }

      // 2. Micro fluctuations in districts
      const districts = Object.keys(market.districtMultipliers);
      for (const d of districts) {
        const districtShift = (Math.random() - 0.5) * 0.004;
        market.districtMultipliers[d] = Math.max(
          0.8,
          Math.min(1.5, market.districtMultipliers[d] + districtShift)
        );
      }

      // 3. Update player properties valuation, condition, and collect rent
      let totalDailyRent = 0;
      let totalDailyMaint = 0;

      for (const prop of draft.realEstate.properties) {
        // Wear & tear (-0.1% to -0.3% per day)
        prop.condition = Math.max(20, prop.condition - (0.1 + Math.random() * 0.2));

        // Dynamic market value adjustment
        const districtMult = market.districtMultipliers[prop.districtId] || 1.0;
        const conditionFactor = 0.8 + (prop.condition / 100) * 0.2; // 0.8 to 1.0
        const updatedValuation = Math.round(
          prop.baseMarketValue * (market.marketIndex / 100) * districtMult * (1 + (prop.level - 1) * 0.25) * conditionFactor
        );
        prop.marketValue = updatedValuation;

        prop.priceHistory.push(updatedValuation);
        if (prop.priceHistory.length > 30) {
          prop.priceHistory.shift();
        }

        // Daily rent collection & maintenance
        if (prop.isRented) {
          const effectiveOccupancyRate = (prop.occupancy / 100) * (prop.condition / 100);
          const earnedRent = Math.round(prop.rent * effectiveOccupancyRate);
          totalDailyRent += earnedRent;
          prop.totalRentCollected += earnedRent;
        }
        totalDailyMaint += prop.maintenance;
      }

      market.lastUpdatedDay = currentDay;
    });
  }

  public getPortfolioStats() {
    const props = this.getProperties();
    const count = props.length;
    const totalValuation = props.reduce((acc, p) => acc + p.marketValue, 0);
    const totalInvested = props.reduce((acc, p) => acc + p.purchasePrice, 0);
    const totalDailyRent = props.reduce((acc, p) => (p.isRented ? acc + Math.round(p.rent * (p.occupancy / 100)) : acc), 0);
    const totalDailyMaint = props.reduce((acc, p) => acc + p.maintenance, 0);
    const netDailyIncome = totalDailyRent - totalDailyMaint;
    const avgOccupancy = count > 0 ? Math.round(props.reduce((acc, p) => acc + p.occupancy, 0) / count) : 0;
    const capitalAppreciation = totalValuation - totalInvested;
    const appreciationPercent = totalInvested > 0 ? (capitalAppreciation / totalInvested) * 100 : 0;

    return {
      count,
      totalValuation,
      totalInvested,
      totalDailyRent,
      totalDailyMaint,
      netDailyIncome,
      avgOccupancy,
      capitalAppreciation,
      appreciationPercent,
    };
  }
}

export const realEstateManager = new RealEstateManager();
