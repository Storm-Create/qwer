/**
 * Business Empire: Ultimate
 * Storage, Inventory Hub & Warehouse Management Subsystem
 * Supports multi-warehouse network, 8 volume tiers (100 to 25,000 m³),
 * daily rent, maintenance & storage expenses, weight/volume validation, and inter-hub logistics.
 */

import { gameState } from '../gameState';
import { economy } from '../economy';
import { Warehouse, InventoryItem, GameState } from '../../types/game';

export interface WarehouseLevelConfig {
  level: number;
  capacity: number; // in m3 / volume units
  maxWeight: number; // in kg
  upgradeCost: number; // cost to upgrade from previous level
  dailyRent: number; // daily rent cost
  dailyMaintenance: number; // daily maintenance cost
  name: string;
  description: string;
}

export interface WarehouseLocationConfig {
  id: string;
  city: string;
  country: string;
  hubName: string;
  basePurchaseCost: number; // for starting level 1 warehouse
  distanceFromMoscowKm: number;
  description: string;
}

export const WAREHOUSE_LEVELS: WarehouseLevelConfig[] = [
  {
    level: 1,
    capacity: 100,
    maxWeight: 5000,
    upgradeCost: 0,
    dailyRent: 40,
    dailyMaintenance: 20,
    name: 'Складской модуль S-100',
    description: 'Компактный складской бокс для первичных партий оптовой торговли (100 м³).',
  },
  {
    level: 2,
    capacity: 250,
    maxWeight: 15000,
    upgradeCost: 35000,
    dailyRent: 90,
    dailyMaintenance: 45,
    name: 'Логистический бокс M-250',
    description: 'Расширенный бокс с рампой для быстрой разгрузки среднетоннажных фургонов (250 м³).',
  },
  {
    level: 3,
    capacity: 500,
    maxWeight: 35000,
    upgradeCost: 75000,
    dailyRent: 170,
    dailyMaintenance: 85,
    name: 'Распределительный склад L-500',
    description: 'Полноразмерный склад с многоярусными стеллажами и гидравлическими погрузчиками (500 м³).',
  },
  {
    level: 4,
    capacity: 1000,
    maxWeight: 80000,
    upgradeCost: 160000,
    dailyRent: 320,
    dailyMaintenance: 160,
    name: 'Региональный комплекс XL-1000',
    description: 'Крупный распределительный терминал с адресной системой хранения (1 000 м³).',
  },
  {
    level: 5,
    capacity: 2500,
    maxWeight: 220000,
    upgradeCost: 380000,
    dailyRent: 750,
    dailyMaintenance: 350,
    name: 'Транзитно-грузовой терминал XXL-2500',
    description: 'Интермодальный терминал с железнодорожной веткой и площадкой для контейнеров (2 500 м³).',
  },
  {
    level: 6,
    capacity: 5000,
    maxWeight: 500000,
    upgradeCost: 750000,
    dailyRent: 1400,
    dailyMaintenance: 650,
    name: 'Мультимодальный хаб A-5000',
    description: 'Высокотехнологичный комплекс класса «А» с автоматическими кранами-штабелерами (5 000 м³).',
  },
  {
    level: 7,
    capacity: 10000,
    maxWeight: 1200000,
    upgradeCost: 1600000,
    dailyRent: 2600,
    dailyMaintenance: 1200,
    name: 'Индустриальный мегапарк A+-10000',
    description: 'Роботизированный мегапарк с термозонами и круглосуточной диспетчеризацией (10 000 м³).',
  },
  {
    level: 8,
    capacity: 25000,
    maxWeight: 3500000,
    upgradeCost: 3800000,
    dailyRent: 5800,
    dailyMaintenance: 2500,
    name: 'Глобальный логистический кластер Ultra-25000',
    description: 'Флагманский ультра-хаб международного масштаба с собственным аэродромом и ж/д узлом (25 000 м³).',
  },
];

export const WAREHOUSE_LOCATIONS: WarehouseLocationConfig[] = [
  {
    id: 'loc_moscow',
    city: 'Москва',
    country: 'Россия',
    hubName: 'Центральный грузовой кластер',
    basePurchaseCost: 45000,
    distanceFromMoscowKm: 0,
    description: 'Крупнейший потребительский рынок и центральный логистический узел европейской части.',
  },
  {
    id: 'loc_spb',
    city: 'Санкт-Петербург',
    country: 'Россия',
    hubName: 'Балтийский морской терминал',
    basePurchaseCost: 40000,
    distanceFromMoscowKm: 700,
    description: 'Морские торговые ворота с доступом к международным контейнерным линиям.',
  },
  {
    id: 'loc_ekb',
    city: 'Екатеринбург',
    country: 'Россия',
    hubName: 'Транссибирский распределительный хаб',
    basePurchaseCost: 32000,
    distanceFromMoscowKm: 1800,
    description: 'Главный связующий узел между европейской частью, Уралом и Сибирью.',
  },
  {
    id: 'loc_nsk',
    city: 'Новосибирск',
    country: 'Россия',
    hubName: 'Сибирский мультимодальный терминал',
    basePurchaseCost: 30000,
    distanceFromMoscowKm: 3350,
    description: 'Стратегический центр оптовых потоков Сибирского региона и Центральной Азии.',
  },
  {
    id: 'loc_vladivostok',
    city: 'Владивосток',
    country: 'Россия',
    hubName: 'Тихоокеанский глубоководный порт',
    basePurchaseCost: 38000,
    distanceFromMoscowKm: 9100,
    description: 'Прямой выход к морским путям Китая, Южной Кореи и Японии.',
  },
  {
    id: 'loc_dubai',
    city: 'Дубай',
    country: 'ОАЭ',
    hubName: 'JAFZA Freezone MegaHub',
    basePurchaseCost: 95000,
    distanceFromMoscowKm: 3700,
    description: 'Беспошлинная свободная зона Ближнего Востока с колоссальным реэкспортным потенциалом.',
  },
  {
    id: 'loc_shanghai',
    city: 'Шанхай',
    country: 'Китай',
    hubName: 'Восточно-Азиатский торговый порт',
    basePurchaseCost: 85000,
    distanceFromMoscowKm: 6800,
    description: 'Крупнейший в мире контейнерный порт и производственная столица мира.',
  },
  {
    id: 'loc_rotterdam',
    city: 'Роттердам',
    country: 'Нидерланды',
    hubName: 'Европейский интермодальный терминал',
    basePurchaseCost: 90000,
    distanceFromMoscowKm: 2500,
    description: 'Главный порт Европы с выходом на крупнейшие трансъевропейские магистрали.',
  },
];

export const WAREHOUSE_TIER_CONFIG = WAREHOUSE_LEVELS;
export const AVAILABLE_LOCATIONS = WAREHOUSE_LOCATIONS;

class WarehouseSystem {
  public getLevels(): WarehouseLevelConfig[] {
    return WAREHOUSE_LEVELS;
  }

  public getLocations(): WarehouseLocationConfig[] {
    return WAREHOUSE_LOCATIONS;
  }

  public getLevelConfig(level: number): WarehouseLevelConfig {
    const found = WAREHOUSE_LEVELS.find((l) => l.level === level);
    return found || WAREHOUSE_LEVELS[0];
  }

  /**
   * Calculates metrics for a specific warehouse
   */
  public getWarehouseMetrics(w: Warehouse): {
    usedVolume: number;
    freeVolume: number;
    volumePercent: number;
    usedWeight: number;
    freeWeight: number;
    weightPercent: number;
    dailyStorageCost: number;
    totalDailyCost: number;
  } {
    let usedVolume = 0;
    let usedWeight = 0;
    let dailyStorageCost = 0;

    for (const item of w.inventory) {
      const vol = (item.volume && item.volume > 0 ? item.volume : 0.05) * item.quantity;
      const wt = (item.weight && item.weight > 0 ? item.weight : 0.5) * item.quantity;
      usedVolume += vol;
      usedWeight += wt;
      // Storage fee per unit: proportional to volume and value
      dailyStorageCost += item.quantity * Math.max(0.01, (item.volume || 0.05) * 0.4);
    }

    usedVolume = Math.round(usedVolume * 100) / 100;
    usedWeight = Math.round(usedWeight * 10) / 10;
    dailyStorageCost = Math.round(dailyStorageCost * 100) / 100;

    const capacity = w.capacity || 100;
    const maxWeight = w.maxWeight || capacity * 50;
    const freeVolume = Math.max(0, Math.round((capacity - usedVolume) * 100) / 100);
    const freeWeight = Math.max(0, Math.round((maxWeight - usedWeight) * 10) / 10);
    const volumePercent = Math.min(100, Math.round((usedVolume / capacity) * 100));
    const weightPercent = Math.min(100, Math.round((usedWeight / maxWeight) * 100));

    const totalDailyCost = (w.rent || 0) + (w.maintenance || 0) + dailyStorageCost;

    return {
      usedVolume,
      freeVolume,
      volumePercent,
      usedWeight,
      freeWeight,
      weightPercent,
      dailyStorageCost,
      totalDailyCost: Math.round(totalDailyCost),
    };
  }

  /**
   * Aggregated metrics across all player warehouses
   */
  public getNetworkSummary(state: GameState): {
    totalCapacity: number;
    totalUsedVolume: number;
    totalFreeVolume: number;
    volumePercent: number;
    totalUsedWeight: number;
    totalMaxWeight: number;
    totalDailyRent: number;
    totalDailyMaintenance: number;
    totalDailyStorageCost: number;
    totalDailyExpenses: number;
    warehouseCount: number;
  } {
    const warehouses = state.warehouses && state.warehouses.length > 0 ? state.warehouses : [];
    
    let totalCapacity = 0;
    let totalUsedVolume = 0;
    let totalUsedWeight = 0;
    let totalMaxWeight = 0;
    let totalDailyRent = 0;
    let totalDailyMaintenance = 0;
    let totalDailyStorageCost = 0;

    for (const w of warehouses) {
      totalCapacity += w.capacity;
      totalMaxWeight += w.maxWeight || w.capacity * 50;
      totalDailyRent += w.rent || w.rentCostDaily || 0;
      totalDailyMaintenance += w.maintenance || 0;

      const m = this.getWarehouseMetrics(w);
      totalUsedVolume += m.usedVolume;
      totalUsedWeight += m.usedWeight;
      totalDailyStorageCost += m.dailyStorageCost;
    }

    totalUsedVolume = Math.round(totalUsedVolume * 100) / 100;
    totalUsedWeight = Math.round(totalUsedWeight * 10) / 10;
    const totalFreeVolume = Math.max(0, Math.round((totalCapacity - totalUsedVolume) * 100) / 100);
    const volumePercent = totalCapacity > 0 ? Math.min(100, Math.round((totalUsedVolume / totalCapacity) * 100)) : 0;
    const totalDailyExpenses = Math.round(totalDailyRent + totalDailyMaintenance + totalDailyStorageCost);

    return {
      totalCapacity,
      totalUsedVolume,
      totalFreeVolume,
      volumePercent,
      totalUsedWeight,
      totalMaxWeight,
      totalDailyRent,
      totalDailyMaintenance,
      totalDailyStorageCost,
      totalDailyExpenses,
      warehouseCount: warehouses.length,
    };
  }

  /**
   * Upgrades a warehouse to the next tier
   */
  public upgradeWarehouse(warehouseId: string): { success: boolean; message: string } {
    const state = gameState.getState();
    const warehouse = state.warehouses.find((w) => w.id === warehouseId);
    if (!warehouse) {
      return { success: false, message: 'Склад не найден' };
    }

    const currentLevel = warehouse.level || 1;
    if (currentLevel >= 8) {
      return { success: false, message: 'Склад уже улучшен до максимального 8 уровня (25 000 м³)' };
    }

    const nextLevelConfig = this.getLevelConfig(currentLevel + 1);
    const upgradeCost = nextLevelConfig.upgradeCost;

    if (!economy.canAfford(upgradeCost)) {
      const currency = state.settings.currency || '$';
      return {
        success: false,
        message: `Недостаточно средств. Требуется ${currency}${upgradeCost.toLocaleString()}`,
      };
    }

    const deducted = economy.removeMoney(
      upgradeCost,
      'Модернизация склада',
      `Улучшение склада «${warehouse.name}» до уровня ${nextLevelConfig.level} (${nextLevelConfig.capacity} м³)`,
      'investment'
    );

    if (!deducted) {
      return { success: false, message: 'Ошибка проведения платежа' };
    }

    gameState.update((draft) => {
      const target = draft.warehouses.find((w) => w.id === warehouseId);
      if (target) {
        target.level = nextLevelConfig.level;
        target.tier = nextLevelConfig.level;
        target.capacity = nextLevelConfig.capacity;
        target.maxWeight = nextLevelConfig.maxWeight;
        target.rent = nextLevelConfig.dailyRent;
        target.maintenance = nextLevelConfig.dailyMaintenance;
        target.rentCostDaily = nextLevelConfig.dailyRent + nextLevelConfig.dailyMaintenance;
      }
      this.syncGlobalInventoryDraft(draft);
    });

    return {
      success: true,
      message: `Склад «${warehouse.name}» успешно улучшен до ${nextLevelConfig.capacity} м³!`,
    };
  }

  /**
   * Purchases a new warehouse in the specified location
   */
  public buyNewWarehouse(
    locationId: string,
    customName?: string
  ): { success: boolean; message: string; warehouse?: Warehouse } {
    const loc = WAREHOUSE_LOCATIONS.find((l) => l.id === locationId);
    if (!loc) {
      return { success: false, message: 'Локация не найдена' };
    }

    const state = gameState.getState();
    const l1Config = this.getLevelConfig(1);
    const totalCost = loc.basePurchaseCost;

    if (!economy.canAfford(totalCost)) {
      const currency = state.settings.currency || '$';
      return {
        success: false,
        message: `Недостаточно средств для покупки склада. Требуется ${currency}${totalCost.toLocaleString()}`,
      };
    }

    const ok = economy.removeMoney(
      totalCost,
      'Покупка недвижимости',
      `Приобретение склада: ${loc.city} (${loc.hubName}) 100 м³`,
      'investment'
    );

    if (!ok) {
      return { success: false, message: 'Ошибка списания средств' };
    }

    let created: Warehouse | null = null;

    gameState.update((draft) => {
      const newWh: Warehouse = {
        id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: customName || `Склад «${loc.city}» (${loc.hubName})`,
        level: 1,
        tier: 1,
        capacity: l1Config.capacity,
        usedCapacity: 0,
        usedWeight: 0,
        maxWeight: l1Config.maxWeight,
        rent: l1Config.dailyRent,
        maintenance: l1Config.dailyMaintenance,
        storageCostDaily: 0,
        rentCostDaily: l1Config.dailyRent + l1Config.dailyMaintenance,
        location: loc.city,
        inventory: [],
      };

      if (!draft.warehouses) draft.warehouses = [];
      draft.warehouses.push(newWh);
      created = newWh;
      this.syncGlobalInventoryDraft(draft);
    });

    return {
      success: true,
      message: `Новый склад в г. ${loc.city} успешно открыт! Вместимость: 100 м³.`,
      warehouse: created || undefined,
    };
  }

  /**
   * Internal draft helper to keep draft.inventory synchronized with items across all warehouses
   */
  public syncGlobalInventoryDraft(draft: any): void {
    if (!draft.warehouses) return;

    const consolidatedMap = new Map<string, InventoryItem>();

    for (const w of draft.warehouses) {
      if (!w.inventory) w.inventory = [];
      
      let usedVol = 0;
      let usedWt = 0;

      for (const item of w.inventory) {
        usedVol += (item.volume || 0.05) * item.quantity;
        usedWt += (item.weight || 0.5) * item.quantity;

        const existing = consolidatedMap.get(item.id);
        if (existing) {
          const totalQty = existing.quantity + item.quantity;
          const totalCost = existing.totalCost + item.totalCost;
          existing.quantity = totalQty;
          existing.totalCost = totalCost;
          existing.avgBuyPrice = totalQty > 0 ? totalCost / totalQty : item.avgBuyPrice;
          existing.currentMarketPrice = item.currentMarketPrice;
        } else {
          consolidatedMap.set(item.id, { ...item });
        }
      }

      w.usedCapacity = Math.round(usedVol * 100) / 100;
      w.usedWeight = Math.round(usedWt * 10) / 10;
    }

    draft.inventory = Array.from(consolidatedMap.values());
  }
}

export const warehouseSystem = new WarehouseSystem();
