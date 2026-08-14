/**
 * Business Empire: Ultimate
 * Logistics, Fleet & Supply Chain Engine
 * Manages commercial freight vehicles, deliveries (Supplier -> Warehouse -> Store),
 * real-time hourly transit tracking, and automated supply routes.
 */

import { gameState } from '../gameState';
import { economy } from '../economy';
import { gameLoop } from '../gameLoop';
import { goodsMarket } from '../markets/goodsMarket';
import { warehouseSystem } from './warehouses';
import {
  LogisticsTruck,
  Delivery,
  DeliveryItem,
  AutoSupplyRoute,
  GameState,
  Warehouse,
  GameTime,
} from '../../types/game';

export interface TruckModelConfig {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: 'van' | 'medium' | 'heavy' | 'road_train' | 'train' | 'plane';
  volumeCapacity: number; // m3
  weightCapacity: number; // kg
  speedKmH: number;
  purchasePrice: number;
  maintenanceDaily: number;
  fuelCostPerKm: number;
  description: string;
}

export const TRUCK_CATALOG: TruckModelConfig[] = [
  {
    id: 'trk_gazelle_next',
    name: 'ГАЗель NEXT (Городской фургон)',
    brand: 'ГАЗ',
    model: 'NEXT City Box',
    category: 'van',
    volumeCapacity: 14,
    weightCapacity: 1800,
    speedKmH: 90,
    purchasePrice: 18000,
    maintenanceDaily: 25,
    fuelCostPerKm: 0.35,
    description: 'Маневренный фургон для быстрых локальных доставок и снабжения магазинов (14 м³ / 1.8 т).',
  },
  {
    id: 'trk_man_tgm',
    name: 'MAN TGM / КамАЗ-54901 (Среднетоннажник)',
    brand: 'MAN / КамАЗ',
    model: 'TGM 18.290',
    category: 'medium',
    volumeCapacity: 45,
    weightCapacity: 9500,
    speedKmH: 80,
    purchasePrice: 68000,
    maintenanceDaily: 65,
    fuelCostPerKm: 0.65,
    description: 'Надежный грузовик для межрегиональных поставок средних партий товаров (45 м³ / 9.5 т).',
  },
  {
    id: 'trk_scania_r500',
    name: 'Scania R500 V8 Highline (Магистральная еврофура)',
    brand: 'Scania',
    model: 'R500 V8',
    category: 'heavy',
    volumeCapacity: 92,
    weightCapacity: 22000,
    speedKmH: 75,
    purchasePrice: 165000,
    maintenanceDaily: 140,
    fuelCostPerKm: 0.95,
    description: 'Золотой стандарт магистральной логистики. Высокая вместимость и надежность (92 м³ / 22 т).',
  },
  {
    id: 'trk_volvo_fh16',
    name: 'Volvo FH16 Globetrotter (Двойной автопоезд)',
    brand: 'Volvo',
    model: 'FH16 750 Road Train',
    category: 'road_train',
    volumeCapacity: 165,
    weightCapacity: 42000,
    speedKmH: 70,
    purchasePrice: 295000,
    maintenanceDaily: 240,
    fuelCostPerKm: 1.45,
    description: 'Мощный сцепной автопоезд с двумя полуприцепами для крупнооптовых перевозок (165 м³ / 42 т).',
  },
  {
    id: 'trk_rail_freight',
    name: 'Ж/Д Контейнерный состав (Логистический поезд)',
    brand: 'РЖД / DB Cargo',
    model: 'Freight Container Block',
    category: 'train',
    volumeCapacity: 600,
    weightCapacity: 180000,
    speedKmH: 55,
    purchasePrice: 750000,
    maintenanceDaily: 580,
    fuelCostPerKm: 2.2,
    description: 'Оптовый железнодорожный фрахт для транспортировки тяжелых сырьевых грузов (600 м³ / 180 т).',
  },
  {
    id: 'trk_boeing_747',
    name: 'Boeing 747-8 Freighter (Авиа-карго экспресс)',
    brand: 'Boeing Cargo',
    model: '747-8F Heavy Lifter',
    category: 'plane',
    volumeCapacity: 950,
    weightCapacity: 140000,
    speedKmH: 880,
    purchasePrice: 3200000,
    maintenanceDaily: 2400,
    fuelCostPerKm: 7.5,
    description: 'Сверхскоростная межконтинентальная доставка грузов в любую точку мира за считанные часы.',
  },
];

class LogisticsSystem {
  constructor() {
    gameLoop.onHour((currentTime, delta) => {
      this.processHourlyTransit(currentTime, delta);
    });

    gameLoop.onDay((currentTime) => {
      this.processDailyAutoSupplyRoutes(currentTime.totalDays);
    });
  }

  public getTruckCatalog(): TruckModelConfig[] {
    return TRUCK_CATALOG;
  }

  /**
   * Purchases a new truck for the player's logistics fleet
   */
  public buyTruck(modelId: string): { success: boolean; message: string; truck?: LogisticsTruck } {
    const config = TRUCK_CATALOG.find((t) => t.id === modelId);
    if (!config) {
      return { success: false, message: 'Модель транспорта не найдена в каталоге' };
    }

    const state = gameState.getState();
    if (!economy.canAfford(config.purchasePrice)) {
      const currency = state.settings.currency || '$';
      return {
        success: false,
        message: `Недостаточно средств для покупки транспорта. Требуется ${currency}${config.purchasePrice.toLocaleString()}`,
      };
    }

    const ok = economy.removeMoney(
      config.purchasePrice,
      'Автопарк и логистика',
      `Приобретение грузового транспорта: ${config.name}`,
      'investment'
    );

    if (!ok) {
      return { success: false, message: 'Ошибка проведения платежа' };
    }

    let created: LogisticsTruck | null = null;

    gameState.update((draft) => {
      const newTruck: LogisticsTruck = {
        id: `trk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: config.name,
        brand: config.brand,
        model: config.model,
        category: config.category,
        volumeCapacity: config.volumeCapacity,
        weightCapacity: config.weightCapacity,
        speedKmH: config.speedKmH,
        purchasePrice: config.purchasePrice,
        maintenanceDaily: config.maintenanceDaily,
        fuelCostPerKm: config.fuelCostPerKm,
        status: 'idle',
        currentLocation: draft.warehouses[0]?.location || 'Москва',
      };

      if (!draft.trucks) draft.trucks = [];
      draft.trucks.push(newTruck);
      created = newTruck;
    });

    return {
      success: true,
      message: `Транспорт «${config.name}» успешно добавлен в автопарк!`,
      truck: created || undefined,
    };
  }

  /**
   * Calculates delivery duration & freight cost
   */
  public calculateDeliveryEstimate(
    distanceKm: number,
    totalVolume: number,
    totalWeight: number,
    truck?: LogisticsTruck
  ): {
    durationHours: number;
    cost: number;
    fitsInTruck: boolean;
  } {
    const speed = truck ? truck.speedKmH : 75;
    const durationHours = Math.max(1, Math.ceil(distanceKm / speed));

    let cost = 0;
    if (truck) {
      cost = Math.round(distanceKm * truck.fuelCostPerKm + 50);
    } else {
      // Third-party commercial courier service
      cost = Math.round(distanceKm * 0.85 + totalVolume * 4 + totalWeight * 0.05 + 100);
    }

    let fitsInTruck = true;
    if (truck) {
      if (totalVolume > truck.volumeCapacity || totalWeight > truck.weightCapacity) {
        fitsInTruck = false;
      }
    }

    return {
      durationHours,
      cost,
      fitsInTruck,
    };
  }

  /**
   * Dispatches a delivery between Supplier/Warehouse and Warehouse/Business
   */
  public dispatchDelivery(params: {
    origin: string;
    destination: string;
    sourceWarehouseId?: string;
    targetWarehouseId: string;
    targetBusinessId?: string;
    vehicleId?: string;
    items: DeliveryItem[];
    distanceKm: number;
    cost: number;
    totalHours: number;
  }): { success: boolean; message: string; delivery?: Delivery } {
    const state = gameState.getState();

    const targetWarehouse = state.warehouses.find((w) => w.id === params.targetWarehouseId);
    if (!targetWarehouse) {
      return { success: false, message: 'Склад назначения не найден' };
    }

    let totalVol = 0;
    let totalWt = 0;
    for (const it of params.items) {
      totalVol += (it.volume || 0.05) * it.quantity;
      totalWt += (it.weight || 0.5) * it.quantity;
    }
    totalVol = Math.round(totalVol * 100) / 100;
    totalWt = Math.round(totalWt * 10) / 10;

    // Check if target warehouse has enough capacity
    const metrics = warehouseSystem.getWarehouseMetrics(targetWarehouse);
    if (totalVol > metrics.freeVolume) {
      return {
        success: false,
        message: `Недостаточно свободного места на складе «${targetWarehouse.name}». Требуется ${totalVol} м³, свободно ${metrics.freeVolume} м³.`,
      };
    }

    // If source is a warehouse, verify and deduct items from source warehouse
    if (params.sourceWarehouseId) {
      const sourceWh = state.warehouses.find((w) => w.id === params.sourceWarehouseId);
      if (!sourceWh) {
        return { success: false, message: 'Исходный склад не найден' };
      }

      for (const reqItem of params.items) {
        const held = sourceWh.inventory.find((i) => i.id === reqItem.commodityId);
        if (!held || held.quantity < reqItem.quantity) {
          return {
            success: false,
            message: `На складе «${sourceWh.name}» недостаточно товара «${reqItem.name}» для отправки.`,
          };
        }
      }
    }

    // Deduct freight costs
    if (params.cost > 0) {
      if (!economy.canAfford(params.cost)) {
        const currency = state.settings.currency || '$';
        return {
          success: false,
          message: `Недостаточно средств на оплату логистических расходов (${currency}${params.cost.toLocaleString()})`,
        };
      }

      economy.removeMoney(
        params.cost,
        'Логистические расходы',
        `Транспортировка груза ${params.origin} → ${params.destination} (${totalVol} м³ / ${totalWt} кг)`,
        'expense'
      );
    }

    let createdDelivery: Delivery | null = null;

    gameState.update((draft) => {
      // 1. If inter-warehouse transfer, deduct from source warehouse
      if (params.sourceWarehouseId) {
        const srcWh = draft.warehouses.find((w) => w.id === params.sourceWarehouseId);
        if (srcWh) {
          for (const reqItem of params.items) {
            const heldIdx = srcWh.inventory.findIndex((i) => i.id === reqItem.commodityId);
            if (heldIdx >= 0) {
              const held = srcWh.inventory[heldIdx];
              held.quantity -= reqItem.quantity;
              held.totalCost -= reqItem.quantity * held.avgBuyPrice;
              if (held.quantity <= 0) {
                srcWh.inventory.splice(heldIdx, 1);
              }
            }
          }
        }
      }

      // 2. Mark vehicle as in_transit
      let vehicleName = 'Наемная транспортная компания';
      if (params.vehicleId) {
        const v = draft.trucks?.find((t) => t.id === params.vehicleId);
        if (v) {
          v.status = 'in_transit';
          vehicleName = v.name;
        }
      }

      // 3. Create delivery record
      createdDelivery = {
        id: `del_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: `Рейс ${params.origin} → ${params.destination}`,
        origin: params.origin,
        destination: params.destination,
        sourceWarehouseId: params.sourceWarehouseId,
        targetWarehouseId: params.targetWarehouseId,
        targetBusinessId: params.targetBusinessId,
        vehicleId: params.vehicleId,
        vehicleName,
        items: params.items,
        totalVolume: totalVol,
        totalWeight: totalWt,
        distanceKm: params.distanceKm,
        totalHours: params.totalHours,
        remainingHours: params.totalHours,
        cost: params.cost,
        status: 'in_transit',
        createdAt: Date.now(),
      };

      if (!draft.deliveries) draft.deliveries = [];
      draft.deliveries.push(createdDelivery);

      warehouseSystem.syncGlobalInventoryDraft(draft);
    });

    return {
      success: true,
      message: `Рейс «${params.origin} → ${params.destination}» успешно отправлен! Прибытие через ${params.totalHours} ч.`,
      delivery: createdDelivery || undefined,
    };
  }

  /**
   * Advances active deliveries by delta hours (called on each game hour tick)
   */
  public processHourlyTransit(currentTime: GameTime, hourDelta: number): void {
    gameState.update((draft) => {
      if (!draft.deliveries || draft.deliveries.length === 0) return;

      for (let i = draft.deliveries.length - 1; i >= 0; i--) {
        const delivery = draft.deliveries[i];
        if (delivery.status !== 'in_transit') continue;

        delivery.remainingHours -= hourDelta;

        // Arrival reached!
        if (delivery.remainingHours <= 0) {
          delivery.status = 'completed';

          // Free up assigned vehicle
          if (delivery.vehicleId && draft.trucks) {
            const v = draft.trucks.find((t) => t.id === delivery.vehicleId);
            if (v) {
              v.status = 'idle';
              const targetWh = draft.warehouses.find((w) => w.id === delivery.targetWarehouseId);
              if (targetWh) v.currentLocation = targetWh.location;
            }
          }

          // Unload items into target warehouse
          const targetWh = draft.warehouses.find((w) => w.id === delivery.targetWarehouseId);
          if (targetWh) {
            for (const it of delivery.items) {
              const existing = targetWh.inventory.find((i) => i.id === it.commodityId);
              if (existing) {
                const totalQ = existing.quantity + it.quantity;
                const totalC = existing.totalCost + it.quantity * it.avgBuyPrice;
                existing.quantity = totalQ;
                existing.totalCost = totalC;
                existing.avgBuyPrice = totalQ > 0 ? totalC / totalQ : it.avgBuyPrice;
              } else {
                targetWh.inventory.push({
                  id: it.commodityId,
                  name: it.name,
                  category: 'Продукты' as any,
                  quantity: it.quantity,
                  totalCost: it.quantity * it.avgBuyPrice,
                  avgBuyPrice: it.avgBuyPrice,
                  currentMarketPrice: it.avgBuyPrice,
                  weight: it.weight,
                  volume: it.volume,
                  quality: it.quality,
                  unit: it.unit,
                });
              }
            }
          }

          // Log notification event
          if (!draft.events) draft.events = [];
          draft.events.unshift({
            id: `evt_arr_${Date.now()}`,
            title: 'Доставка прибыла на склад!',
            description: `Груз из «${delivery.origin}» (${delivery.totalVolume} м³) успешно разгружен на складе «${targetWh?.name || 'Склад'}».`,
            type: 'company',
            impactDurationDays: 1,
            daysLeft: 1,
            multiplierEffects: {},
            timestamp: Date.now(),
          });
        }
      }

      warehouseSystem.syncGlobalInventoryDraft(draft);
    }, false);
  }

  /**
   * Creates or updates an automated replenishment supply route
   */
  public saveAutoSupplyRoute(route: AutoSupplyRoute): { success: boolean; message: string } {
    gameState.update((draft) => {
      if (!draft.autoSupplyRoutes) draft.autoSupplyRoutes = [];
      const idx = draft.autoSupplyRoutes.findIndex((r) => r.id === route.id);
      if (idx >= 0) {
        draft.autoSupplyRoutes[idx] = route;
      } else {
        draft.autoSupplyRoutes.push(route);
      }
    });

    return { success: true, message: 'Автопоставка успешно сохранена' };
  }

  /**
   * Deletes an auto supply route
   */
  public deleteAutoSupplyRoute(routeId: string): void {
    gameState.update((draft) => {
      if (!draft.autoSupplyRoutes) return;
      draft.autoSupplyRoutes = draft.autoSupplyRoutes.filter((r) => r.id !== routeId);
    });
  }

  /**
   * Checks and runs automated replenishment routes (called on daily rollover)
   */
  public processDailyAutoSupplyRoutes(currentDay: number): void {
    const state = gameState.getState();
    if (!state.autoSupplyRoutes || state.autoSupplyRoutes.length === 0) return;

    for (const route of state.autoSupplyRoutes) {
      if (!route.active) continue;

      const targetWh = state.warehouses.find((w) => w.id === route.targetWarehouseId);
      if (!targetWh) continue;

      // Current stock of commodity in target warehouse
      const currentStock = targetWh.inventory.find((i) => i.id === route.commodityId)?.quantity || 0;

      // Trigger condition: stock < minThreshold
      if (currentStock < route.minThreshold) {
        const commodity = goodsMarket.getCommodity(route.commodityId);
        if (!commodity) continue;

        // Check price limit if set
        if (route.maxPriceLimit && commodity.currentPrice > route.maxPriceLimit) {
          continue;
        }

        const qtyToOrder = route.batchQuantity;
        const totalVolume = (commodity.volume || 0.05) * qtyToOrder;
        const totalWeight = (commodity.weight || 0.5) * qtyToOrder;
        const costGoods = qtyToOrder * commodity.currentPrice;

        // Check funds & warehouse volume
        const metrics = warehouseSystem.getWarehouseMetrics(targetWh);
        if (metrics.freeVolume < totalVolume || !economy.canAfford(costGoods)) {
          continue;
        }

        // Buy from goodsMarket directly into the warehouse
        const res = goodsMarket.buyCommodity(route.commodityId, qtyToOrder, targetWh.id);
        if (res.success) {
          route.lastExecutedDay = currentDay;
        }
      }
    }
  }
}

export const logisticsSystem = new LogisticsSystem();
