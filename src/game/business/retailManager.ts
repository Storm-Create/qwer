/**
 * Business Empire: Ultimate
 * Retail Master Engine: Store Lifecycle, Customer Simulation,
 * Inventory Logistics, Pricing, Upgrades, Staff Management & Analytics
 */

import { gameState } from '../gameState';
import { economy } from '../economy';
import { goodsMarket } from '../markets/goodsMarket';
import {
  RetailStore,
  RetailStoreType,
  LocationType,
  StoreProductItem,
  RetailEmployee,
  EmployeeRole,
  DailyStoreFinancialRecord,
  StoreProductAutoSupply,
} from '../../types/retail';
import {
  RETAIL_STORE_TEMPLATES,
  RETAIL_LOCATIONS,
  INITIAL_EQUIPMENT_BLUEPRINTS,
  MARKETING_CAMPAIGNS_CATALOG,
  generateRandomEmployeeName,
} from './retailCatalog';
import { CommodityCategory, InventoryItem, MarketCommodity } from '../../types/game';

class RetailManager {
  /**
   * Retrieves all retail stores owned by the player
   */
  public getStores(): RetailStore[] {
    const state = gameState.getState();
    return state.retailStores || [];
  }

  /**
   * Retrieves a specific store by ID
   */
  public getStoreById(storeId: string): RetailStore | undefined {
    return this.getStores().find((s) => s.id === storeId);
  }

  /**
   * Calculates setup cost for a new store
   */
  public calculateSetupCost(type: RetailStoreType, locationId: LocationType): number {
    const template = RETAIL_STORE_TEMPLATES[type];
    const location = RETAIL_LOCATIONS[locationId];
    if (!template || !location) return 50000;

    // Rent deposit (30 days) + initial setup + initial equipment
    const rentDeposit = Math.round(template.baseAreaSqM * location.rentPerSqMeter * 30);
    return template.initialSetupCost + rentDeposit;
  }

  /**
   * Opens / Creates a new retail store
   */
  public openStore(
    name: string,
    type: RetailStoreType,
    locationId: LocationType
  ): { success: boolean; message: string; store?: RetailStore } {
    const template = RETAIL_STORE_TEMPLATES[type];
    const location = RETAIL_LOCATIONS[locationId];

    if (!template || !location) {
      return { success: false, message: 'Некорректный тип магазина или локация.' };
    }

    const totalCost = this.calculateSetupCost(type, locationId);
    if (!economy.canAfford(totalCost)) {
      return {
        success: false,
        message: `Недостаточно средств. Требуется $${totalCost.toLocaleString()}, у вас $${gameState.getState().cash.toLocaleString()}`,
      };
    }

    // Deduct setup investment
    economy.removeMoney(
      totalCost,
      'Инвестиции в ритейл',
      `Открытие магазина "${name}" (${template.name}) в локации "${location.name}"`,
      'investment'
    );

    const initialEmployees: RetailEmployee[] = [];
    const state = gameState.getState();
    const currentDay = state.gameTime.day;

    // Hire starter skeleton crew based on minEmployees
    const roles: EmployeeRole[] = ['cashier', 'consultant', 'merchandiser', 'security'];
    for (let i = 0; i < template.minEmployees; i++) {
      const role = i === 0 ? 'cashier' : roles[i % roles.length];
      const salary = role === 'cashier' ? 65 : role === 'consultant' ? 80 : role === 'merchandiser' ? 70 : 90;
      initialEmployees.push({
        id: `emp_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`,
        name: generateRandomEmployeeName(),
        role,
        salaryDaily: salary,
        skillLevel: Math.floor(Math.random() * 2) + 2,
        morale: 85,
        hiredAtDay: currentDay,
      });
    }

    // Deep copy initial equipment blueprints
    const equipment = INITIAL_EQUIPMENT_BLUEPRINTS.map((eq) => ({ ...eq }));

    const newStore: RetailStore = {
      id: `store_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim() || `${template.shortName} #${this.getStores().length + 1}`,
      type,
      level: 1,
      locationId,
      areaSqM: template.baseAreaSqM,
      salesAreaSqM: Math.round(template.baseAreaSqM * 0.65),
      backroomAreaSqM: Math.round(template.baseAreaSqM * 0.35),
      shelvesVolumeCapacity: template.baseShelvesVolume,
      backroomVolumeCapacity: template.baseBackroomVolume,
      usedVolume: 0,
      employees: initialEmployees,
      inventory: [],
      maxProductSlots: 6 + 2 * 1, // 8 slots at level 1
      reputation: 50,
      cleanliness: 90,
      customerSatisfaction: 75,
      dailyCustomers: 0,
      dailyPurchases: 0,
      dailyAvgTicket: 0,
      dailyConversionRate: 0,
      outOfStockLossDaily: 0,
      activeCampaigns: [],
      equipment,
      dailyRent: Math.round(template.baseAreaSqM * location.rentPerSqMeter),
      dailyElectricity: Math.round(template.baseAreaSqM * 0.08 + 15),
      dailySalaries: initialEmployees.reduce((sum, e) => sum + e.salaryDaily, 0),
      dailyAdCost: 0,
      dailyRevenue: 0,
      dailyCogs: 0,
      dailyGrossProfit: 0,
      dailyNetProfit: 0,
      totalRevenue: 0,
      totalExpenses: totalCost,
      totalNetProfit: -totalCost,
      totalCustomersServed: 0,
      history: [],
      status: 'active',
      createdAtDay: currentDay,
    };

    gameState.update((draft) => {
      if (!draft.retailStores) {
        draft.retailStores = [];
      }
      draft.retailStores.push(newStore);
      draft.statistics.businessesFounded = (draft.statistics.businessesFounded || 0) + 1;
    });

    return {
      success: true,
      message: `Магазин "${newStore.name}" успешно открыт и готов к поставкам товаров!`,
      store: newStore,
    };
  }

  /**
   * Transfers goods from a player's warehouse to a store
   */
  public transferGoodsFromWarehouse(
    storeId: string,
    warehouseId: string,
    commodityId: string,
    quantity: number
  ): { success: boolean; message: string } {
    if (quantity <= 0) {
      return { success: false, message: 'Количество должно быть больше нуля.' };
    }

    const state = gameState.getState();
    const store = state.retailStores?.find((s) => s.id === storeId);
    const warehouse = state.warehouses.find((w) => w.id === warehouseId);

    if (!store) return { success: false, message: 'Магазин не найден.' };
    if (!warehouse) return { success: false, message: 'Склад не найден.' };

    const whItem = warehouse.inventory.find((i) => i.id === commodityId);
    if (!whItem || whItem.quantity < quantity) {
      return {
        success: false,
        message: `На складе недостаточно товара (в наличии: ${whItem?.quantity || 0}).`,
      };
    }

    const commodityMeta = goodsMarket.getCommodity(commodityId);
    const itemVolume = (commodityMeta?.volume || 0.01) * quantity;
    const currentTotalCapacity = store.shelvesVolumeCapacity + store.backroomVolumeCapacity;
    const remainingCapacity = currentTotalCapacity - store.usedVolume;

    if (itemVolume > remainingCapacity) {
      return {
        success: false,
        message: `Недостаточно свободного места в магазине! Требуется ${itemVolume.toFixed(
          1
        )}м³, свободно ${Math.max(0, remainingCapacity).toFixed(1)}м³.`,
      };
    }

    // Execute transfer
    gameState.update((draft) => {
      const dStore = draft.retailStores?.find((s) => s.id === storeId);
      const dWh = draft.warehouses.find((w) => w.id === warehouseId);
      if (!dStore || !dWh) return;

      const dWhItem = dWh.inventory.find((i) => i.id === commodityId);
      if (!dWhItem) return;

      const unitCost = dWhItem.avgBuyPrice;

      // Deduct from warehouse
      dWhItem.quantity -= quantity;
      dWhItem.totalCost -= unitCost * quantity;
      dWh.usedCapacity = Math.max(0, dWh.usedCapacity - itemVolume);
      dWh.usedWeight = Math.max(0, dWh.usedWeight - (commodityMeta?.weight || 1) * quantity);

      if (dWhItem.quantity <= 0) {
        dWh.inventory = dWh.inventory.filter((i) => i.id !== commodityId);
      }

      // Add to store inventory
      let storeItem = dStore.inventory.find((i) => i.commodityId === commodityId);
      const template = RETAIL_STORE_TEMPLATES[dStore.type];
      const defaultMarkup = template ? template.baseMarginExpected : 40;
      const refMarketPrice = commodityMeta?.currentPrice || unitCost * 1.2;
      const initialSellingPrice = Math.round(unitCost * (1 + defaultMarkup / 100));

      if (storeItem) {
        const totalOldCost = storeItem.currentStock * storeItem.avgCostPrice;
        const totalNewCost = quantity * unitCost;
        storeItem.currentStock += quantity;
        storeItem.avgCostPrice = Math.round((totalOldCost + totalNewCost) / storeItem.currentStock);
        storeItem.currentMarketPrice = refMarketPrice;
        storeItem.volume = commodityMeta?.volume || 0.01;
        storeItem.weight = commodityMeta?.weight || 1;
      } else {
        storeItem = {
          id: `p_${commodityId}_${Date.now()}`,
          commodityId,
          name: commodityMeta?.name || dWhItem.name,
          category: commodityMeta?.category || dWhItem.category,
          quality: commodityMeta?.quality || dWhItem.quality,
          unit: commodityMeta?.unit || dWhItem.unit,
          weight: commodityMeta?.weight || 1,
          volume: commodityMeta?.volume || 0.01,
          currentStock: quantity,
          maxStockCapacity: 500,
          avgCostPrice: Math.round(unitCost),
          currentMarketPrice: refMarketPrice,
          sellingPrice: initialSellingPrice,
          markupPercent: defaultMarkup,
          discountPercent: 0,
          dailySoldUnits: 0,
          dailyRevenue: 0,
          dailyProfit: 0,
          totalSoldUnits: 0,
          totalRevenue: 0,
          totalProfit: 0,
          autoSupply: {
            enabled: false,
            sourceWarehouseId: warehouseId,
            minThreshold: 20,
            batchQuantity: 50,
          },
        };
        dStore.inventory.push(storeItem);
      }

      // Recalculate used volume
      dStore.usedVolume = dStore.inventory.reduce(
        (sum, item) => sum + item.currentStock * item.volume,
        0
      );
    });

    return {
      success: true,
      message: `Успешно перемещено ${quantity} ${whItem.unit} товара "${whItem.name}" со склада в магазин "${store.name}".`,
    };
  }

  /**
   * Direct purchase from wholesale market straight to store shelves
   */
  public directPurchaseToStore(
    storeId: string,
    commodityId: string,
    quantity: number
  ): { success: boolean; message: string } {
    if (quantity <= 0) return { success: false, message: 'Некорректное количество.' };

    const state = gameState.getState();
    const store = state.retailStores?.find((s) => s.id === storeId);
    if (!store) return { success: false, message: 'Магазин не найден.' };

    const commodity = goodsMarket.getCommodity(commodityId);
    if (!commodity) return { success: false, message: 'Товар не найден на бирже.' };

    const totalCost = Math.round(commodity.currentPrice * quantity);
    if (!economy.canAfford(totalCost)) {
      return {
        success: false,
        message: `Недостаточно средств. Необходимо $${totalCost.toLocaleString()}, у вас $${state.cash.toLocaleString()}`,
      };
    }

    const itemVolume = commodity.volume * quantity;
    const maxCapacity = store.shelvesVolumeCapacity + store.backroomVolumeCapacity;
    if (store.usedVolume + itemVolume > maxCapacity) {
      return {
        success: false,
        message: `В магазине недостаточно свободного места (нужно ${itemVolume.toFixed(1)}м³).`,
      };
    }

    // Deduct money
    economy.removeMoney(
      totalCost,
      'Закупка товаров для магазина',
      `Прямая закупка ${quantity} ${commodity.unit} "${commodity.name}" для "${store.name}"`,
      'expense'
    );

    gameState.update((draft) => {
      const dStore = draft.retailStores?.find((s) => s.id === storeId);
      if (!dStore) return;

      const template = RETAIL_STORE_TEMPLATES[dStore.type];
      const defaultMarkup = template ? template.baseMarginExpected : 40;
      let item = dStore.inventory.find((i) => i.commodityId === commodityId);

      if (item) {
        const oldTotalCost = item.currentStock * item.avgCostPrice;
        const newTotalCost = totalCost;
        item.currentStock += quantity;
        item.avgCostPrice = Math.round((oldTotalCost + newTotalCost) / item.currentStock);
        item.currentMarketPrice = commodity.currentPrice;
      } else {
        item = {
          id: `p_${commodityId}_${Date.now()}`,
          commodityId,
          name: commodity.name,
          category: commodity.category,
          quality: commodity.quality,
          unit: commodity.unit,
          weight: commodity.weight,
          volume: commodity.volume,
          currentStock: quantity,
          maxStockCapacity: 500,
          avgCostPrice: Math.round(commodity.currentPrice),
          currentMarketPrice: commodity.currentPrice,
          sellingPrice: Math.round(commodity.currentPrice * (1 + defaultMarkup / 100)),
          markupPercent: defaultMarkup,
          discountPercent: 0,
          dailySoldUnits: 0,
          dailyRevenue: 0,
          dailyProfit: 0,
          totalSoldUnits: 0,
          totalRevenue: 0,
          totalProfit: 0,
          autoSupply: {
            enabled: false,
            sourceWarehouseId: '',
            minThreshold: 15,
            batchQuantity: 30,
          },
        };
        dStore.inventory.push(item);
      }

      dStore.usedVolume = dStore.inventory.reduce(
        (sum, it) => sum + it.currentStock * it.volume,
        0
      );
    });

    return {
      success: true,
      message: `Куплено ${quantity} ${commodity.unit} "${commodity.name}" на сумму $${totalCost.toLocaleString()}.`,
    };
  }

  /**
   * Updates retail price & markup for a product in store
   */
  public updateProductPricing(
    storeId: string,
    commodityId: string,
    newSellingPrice: number,
    discountPercent = 0
  ): { success: boolean; message: string } {
    if (newSellingPrice <= 0) {
      return { success: false, message: 'Цена должна быть больше нуля.' };
    }

    let updatedItemName = '';

    gameState.update((draft) => {
      const store = draft.retailStores?.find((s) => s.id === storeId);
      if (!store) return;

      const item = store.inventory.find((i) => i.commodityId === commodityId);
      if (!item) return;

      item.sellingPrice = Math.round(newSellingPrice);
      item.discountPercent = Math.max(0, Math.min(90, discountPercent));
      item.markupPercent = Math.round(
        ((item.sellingPrice - item.avgCostPrice) / (item.avgCostPrice || 1)) * 100
      );
      updatedItemName = item.name;
    });

    return {
      success: true,
      message: `Цена для "${updatedItemName}" установлена: $${newSellingPrice} (наценка ${Math.round(
        ((newSellingPrice - 1) / 1) * 100
      )}%).`,
    };
  }

  /**
   * Configures Auto-Supply parameters for a product
   */
  public configureAutoSupply(
    storeId: string,
    commodityId: string,
    config: StoreProductAutoSupply
  ): { success: boolean; message: string } {
    gameState.update((draft) => {
      const store = draft.retailStores?.find((s) => s.id === storeId);
      if (!store) return;
      const item = store.inventory.find((i) => i.commodityId === commodityId);
      if (item) {
        item.autoSupply = { ...config };
      }
    });

    return {
      success: true,
      message: config.enabled
        ? `Авто-поставка включена (порог: <${config.minThreshold}, партия: ${config.batchQuantity} ед.).`
        : 'Авто-поставка отключена.',
    };
  }

  /**
   * Executes Auto-Supply batch triggers for all active stores
   */
  public executeAutoSupplyRounds(): void {
    const state = gameState.getState();
    if (!state.retailStores || state.retailStores.length === 0) return;

    for (const store of state.retailStores) {
      if (store.status !== 'active') continue;

      for (const item of store.inventory) {
        if (!item.autoSupply.enabled || item.currentStock >= item.autoSupply.minThreshold) {
          continue;
        }

        const sourceWhId = item.autoSupply.sourceWarehouseId;
        const sourceWh = state.warehouses.find((w) => w.id === sourceWhId);

        if (sourceWh) {
          const whItem = sourceWh.inventory.find((i) => i.id === item.commodityId);
          if (whItem && whItem.quantity > 0) {
            const transferQty = Math.min(whItem.quantity, item.autoSupply.batchQuantity);
            this.transferGoodsFromWarehouse(store.id, sourceWhId, item.commodityId, transferQty);
          }
        }
      }
    }
  }

  /**
   * Upgrades Store Area (Sq.m expansion)
   */
  public expandStoreArea(storeId: string): { success: boolean; message: string } {
    const store = this.getStoreById(storeId);
    if (!store) return { success: false, message: 'Магазин не найден.' };

    const expansionStepSqM = Math.round(store.areaSqM * 0.35);
    const expansionCost = Math.round(expansionStepSqM * 850 * (1 + store.level * 0.1));

    if (!economy.canAfford(expansionCost)) {
      return {
        success: false,
        message: `Недостаточно средств для расширения. Требуется $${expansionCost.toLocaleString()}`,
      };
    }

    economy.removeMoney(
      expansionCost,
      'Капитальный ремонт и расширение',
      `Расширение площади магазина "${store.name}" на +${expansionStepSqM} кв.м`,
      'investment'
    );

    gameState.update((draft) => {
      const dStore = draft.retailStores?.find((s) => s.id === storeId);
      if (!dStore) return;

      dStore.areaSqM += expansionStepSqM;
      dStore.salesAreaSqM = Math.round(dStore.areaSqM * 0.65);
      dStore.backroomAreaSqM = Math.round(dStore.areaSqM * 0.35);
      dStore.shelvesVolumeCapacity += Math.round(expansionStepSqM * 0.7);
      dStore.backroomVolumeCapacity += Math.round(expansionStepSqM * 0.5);

      const location = RETAIL_LOCATIONS[dStore.locationId];
      if (location) {
        dStore.dailyRent = Math.round(dStore.areaSqM * location.rentPerSqMeter);
        dStore.dailyElectricity = Math.round(dStore.areaSqM * 0.08 + 15);
      }
    });

    return {
      success: true,
      message: `Площадь магазина увеличена на +${expansionStepSqM} м² (итого: ${
        store.areaSqM + expansionStepSqM
      } м²). Вместимость витрин и склада расширена!`,
    };
  }

  /**
   * Upgrades a piece of equipment in the store
   */
  public upgradeEquipment(
    storeId: string,
    equipmentId: string
  ): { success: boolean; message: string } {
    const store = this.getStoreById(storeId);
    if (!store) return { success: false, message: 'Магазин не найден.' };

    const eq = store.equipment.find((e) => e.id === equipmentId);
    if (!eq) return { success: false, message: 'Оборудование не найдено.' };
    if (eq.currentLevel >= eq.maxLevel) {
      return { success: false, message: 'Оборудование уже улучшено до максимального уровня.' };
    }

    const upgradeCost = Math.round(eq.cost * Math.pow(1.6, eq.currentLevel));
    if (!economy.canAfford(upgradeCost)) {
      return {
        success: false,
        message: `Недостаточно средств. Необходимо $${upgradeCost.toLocaleString()}`,
      };
    }

    economy.removeMoney(
      upgradeCost,
      'Модернизация оборудования',
      `Улучшение "${eq.name}" до ур. ${eq.currentLevel + 1} в магазине "${store.name}"`,
      'investment'
    );

    gameState.update((draft) => {
      const dStore = draft.retailStores?.find((s) => s.id === storeId);
      if (!dStore) return;

      const dEq = dStore.equipment.find((e) => e.id === equipmentId);
      if (!dEq) return;

      dEq.currentLevel += 1;
      dEq.conversionBonus = Math.round(dEq.conversionBonus * 1.4);
      dEq.serviceSpeedBonus = Math.round(dEq.serviceSpeedBonus * 1.35);
      dEq.shrinkageReduction = Math.min(90, Math.round(dEq.shrinkageReduction * 1.3));
      dEq.spoilageReduction = Math.min(85, Math.round(dEq.spoilageReduction * 1.3));
      dEq.dailyElectricityCost = Math.round(dEq.dailyElectricityCost * 1.25);
    });

    return {
      success: true,
      message: `Оборудование "${eq.name}" улучшено до уровня ${eq.currentLevel + 1}!`,
    };
  }

  /**
   * Hires a new employee for the store
   */
  public hireEmployee(
    storeId: string,
    role: EmployeeRole,
    skillLevel = 3
  ): { success: boolean; message: string } {
    const store = this.getStoreById(storeId);
    if (!store) return { success: false, message: 'Магазин не найден.' };

    const salaryMap: Record<EmployeeRole, number> = {
      cashier: 65,
      consultant: 85,
      merchandiser: 75,
      store_manager: 160,
      security: 90,
    };

    const baseSalary = salaryMap[role] * (1 + (skillLevel - 1) * 0.15);
    const hiringFee = Math.round(baseSalary * 5);

    if (!economy.canAfford(hiringFee)) {
      return {
        success: false,
        message: `Недостаточно средств для найма (комиссия HR: $${hiringFee.toLocaleString()}).`,
      };
    }

    economy.removeMoney(
      hiringFee,
      'Рекрутинг персонала',
      `Найм сотрудника (${role}) в магазин "${store.name}"`,
      'expense'
    );

    const newEmp: RetailEmployee = {
      id: `emp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: generateRandomEmployeeName(),
      role,
      salaryDaily: Math.round(baseSalary),
      skillLevel,
      morale: 90,
      hiredAtDay: gameState.getState().gameTime.day,
    };

    gameState.update((draft) => {
      const dStore = draft.retailStores?.find((s) => s.id === storeId);
      if (!dStore) return;
      dStore.employees.push(newEmp);
      dStore.dailySalaries = dStore.employees.reduce((sum, e) => sum + e.salaryDaily, 0);
    });

    return {
      success: true,
      message: `Сотрудник ${newEmp.name} (${role}, навык ${skillLevel}) принят в штат!`,
    };
  }

  /**
   * Trains employees to raise their skill level and morale
   */
  public trainEmployees(storeId: string): { success: boolean; message: string } {
    const store = this.getStoreById(storeId);
    if (!store) return { success: false, message: 'Магазин не найден.' };
    if (store.employees.length === 0) {
      return { success: false, message: 'В магазине нет нанятых сотрудников.' };
    }

    const trainingCost = store.employees.length * 450;
    if (!economy.canAfford(trainingCost)) {
      return {
        success: false,
        message: `Недостаточно средств. Стоимость тренинга команды: $${trainingCost.toLocaleString()}`,
      };
    }

    economy.removeMoney(
      trainingCost,
      'Обучение персонала',
      `Корпоративный тренинг персонала магазина "${store.name}"`,
      'expense'
    );

    gameState.update((draft) => {
      const dStore = draft.retailStores?.find((s) => s.id === storeId);
      if (!dStore) return;

      for (const emp of dStore.employees) {
        if (emp.skillLevel < 10) {
          emp.skillLevel += 1;
          emp.salaryDaily = Math.round(emp.salaryDaily * 1.1);
        }
        emp.morale = Math.min(100, emp.morale + 15);
      }

      dStore.dailySalaries = dStore.employees.reduce((sum, e) => sum + e.salaryDaily, 0);
    });

    return {
      success: true,
      message: `Тренинг успешно завершен! Квалификация всех ${store.employees.length} сотрудников повышена.`,
    };
  }

  /**
   * Fires an employee from the store
   */
  public fireEmployee(storeId: string, employeeId: string): { success: boolean; message: string } {
    let firedName = '';
    gameState.update((draft) => {
      const dStore = draft.retailStores?.find((s) => s.id === storeId);
      if (!dStore) return;
      const emp = dStore.employees.find((e) => e.id === employeeId);
      if (emp) {
        firedName = emp.name;
        dStore.employees = dStore.employees.filter((e) => e.id !== employeeId);
        dStore.dailySalaries = dStore.employees.reduce((sum, e) => sum + e.salaryDaily, 0);
      }
    });

    return {
      success: true,
      message: `Сотрудник ${firedName} уволен.`,
    };
  }

  /**
   * Toggles a marketing campaign for the store
   */
  public toggleCampaign(
    storeId: string,
    campaignId: string
  ): { success: boolean; message: string } {
    const store = this.getStoreById(storeId);
    if (!store) return { success: false, message: 'Магазин не найден.' };

    const campaign = MARKETING_CAMPAIGNS_CATALOG.find((c) => c.id === campaignId);
    if (!campaign) return { success: false, message: 'Кампания не найдена.' };

    let isNowActive = false;

    gameState.update((draft) => {
      const dStore = draft.retailStores?.find((s) => s.id === storeId);
      if (!dStore) return;

      if (dStore.activeCampaigns.includes(campaignId)) {
        dStore.activeCampaigns = dStore.activeCampaigns.filter((id) => id !== campaignId);
        isNowActive = false;
      } else {
        dStore.activeCampaigns.push(campaignId);
        isNowActive = true;
      }

      // Recalculate daily ad cost
      dStore.dailyAdCost = dStore.activeCampaigns.reduce((sum, cId) => {
        const c = MARKETING_CAMPAIGNS_CATALOG.find((x) => x.id === cId);
        return sum + (c ? c.costDaily : 0);
      }, 0);
    });

    return {
      success: true,
      message: isNowActive
        ? `Рекламная кампания "${campaign.name}" запущена (+${campaign.trafficBoostPercent}% трафика).`
        : `Рекламная кампания "${campaign.name}" остановлена.`,
    };
  }

  /**
   * Advances store level (Level Up)
   */
  public levelUpStore(storeId: string): { success: boolean; message: string } {
    const store = this.getStoreById(storeId);
    if (!store) return { success: false, message: 'Магазин не найден.' };

    if (store.level >= 10) {
      return { success: false, message: 'Магазин уже достиг максимального 10-го уровня!' };
    }

    const nextLevel = store.level + 1;
    const upgradeCost = Math.round(
      RETAIL_STORE_TEMPLATES[store.type].initialSetupCost * 0.75 * Math.pow(1.5, store.level - 1)
    );

    if (!economy.canAfford(upgradeCost)) {
      return {
        success: false,
        message: `Недостаточно средств для повышения уровня. Требуется $${upgradeCost.toLocaleString()}`,
      };
    }

    economy.removeMoney(
      upgradeCost,
      'Повышение уровня магазина',
      `Масштабирование магазина "${store.name}" до Уровня ${nextLevel}`,
      'investment'
    );

    gameState.update((draft) => {
      const dStore = draft.retailStores?.find((s) => s.id === storeId);
      if (!dStore) return;

      dStore.level = nextLevel;
      dStore.maxProductSlots = 6 + 2 * nextLevel;
      dStore.reputation = Math.min(100, dStore.reputation + 8);
    });

    return {
      success: true,
      message: `Магазин "${store.name}" повышен до Уровня ${nextLevel}! Открыты новые слоты для ассортимента и повышен лимит репутации.`,
    };
  }

  /**
   * Renames the store
   */
  public renameStore(storeId: string, newName: string): { success: boolean; message: string } {
    if (!newName.trim()) return { success: false, message: 'Имя не может быть пустым.' };

    gameState.update((draft) => {
      const dStore = draft.retailStores?.find((s) => s.id === storeId);
      if (dStore) {
        dStore.name = newName.trim();
      }
    });

    return { success: true, message: `Магазин переименован в "${newName.trim()}".` };
  }

  /**
   * Daily / Hourly Simulation Tick for all stores
   * Handles customer traffic, purchase decisions, revenue, COGS, out-of-stock losses,
   * reputation dynamics, operational overheads, and P&L history generation.
   */
  public handleDayTick(currentDay: number): void {
    const state = gameState.getState();
    if (!state.retailStores || state.retailStores.length === 0) return;

    // First, run auto-supply
    this.executeAutoSupplyRounds();

    let totalDailyRetailRevenue = 0;
    let totalDailyRetailExpenses = 0;

    gameState.update((draft) => {
      if (!draft.retailStores) return;

      for (const store of draft.retailStores) {
        if (store.status !== 'active') continue;

        const template = RETAIL_STORE_TEMPLATES[store.type];
        const location = RETAIL_LOCATIONS[store.locationId];
        if (!template || !location) continue;

        // 1. Calculate Marketing Boost & Ad Cost
        let trafficBoostMult = 1.0;
        let conversionBoost = 0;
        let dailyAdCost = 0;

        for (const campId of store.activeCampaigns) {
          const camp = MARKETING_CAMPAIGNS_CATALOG.find((c) => c.id === campId);
          if (camp) {
            trafficBoostMult += camp.trafficBoostPercent / 100;
            conversionBoost += camp.conversionBoostPercent;
            dailyAdCost += camp.costDaily;
            store.reputation = Math.min(100, store.reputation + camp.reputationBoostDaily);
          }
        }
        store.dailyAdCost = dailyAdCost;

        // 2. Calculate Equipment & Service Bonuses
        let equipConversionBonus = 0;
        let serviceSpeedBonus = 0;
        let spoilageReduction = 0;
        let shrinkageReduction = 0;
        let equipElectricity = 0;

        for (const eq of store.equipment) {
          equipConversionBonus += eq.conversionBonus;
          serviceSpeedBonus += eq.serviceSpeedBonus;
          spoilageReduction += eq.spoilageReduction;
          shrinkageReduction += eq.shrinkageReduction;
          equipElectricity += eq.dailyElectricityCost;
        }

        // Staff service quality
        const avgStaffSkill =
          store.employees.length > 0
            ? store.employees.reduce((s, e) => s + e.skillLevel, 0) / store.employees.length
            : 1;
        const staffBonus = Math.min(15, avgStaffSkill * 1.5);

        // 3. Foot traffic and Store Visitors
        const baseTraffic = location.baseFootTraffic;
        const storeAttractiveness =
          (store.level * 4 + store.reputation * 0.4 + equipConversionBonus) / 100;
        const totalVisitors = Math.round(
          baseTraffic * trafficBoostMult * Math.max(0.2, storeAttractiveness)
        );

        store.dailyCustomers = totalVisitors;

        // 4. Sales Simulation across Inventory
        let storeRevenue = 0;
        let storeCogs = 0;
        let storePurchases = 0;
        let outOfStockLoss = 0;

        // Reset daily item metrics
        for (const item of store.inventory) {
          item.dailySoldUnits = 0;
          item.dailyRevenue = 0;
          item.dailyProfit = 0;
        }

        if (store.inventory.length > 0 && totalVisitors > 0) {
          // Each visitor looks for items matching their category interest
          const customersPerItemSlot = Math.max(
            5,
            Math.round(totalVisitors / Math.max(1, store.inventory.length))
          );

          for (const item of store.inventory) {
            // Price evaluation
            const wholesalePrice = item.avgCostPrice || 10;
            const effectivePrice = Math.round(
              item.sellingPrice * (1 - (item.discountPercent || 0) / 100)
            );
            const markup = ((effectivePrice - wholesalePrice) / wholesalePrice) * 100;
            const expectedMarkup = template.baseMarginExpected;

            // Purchase probability calculation based on price sensitivity
            let buyChance = 0.45; // baseline

            if (markup <= expectedMarkup * 0.7) {
              buyChance = 0.88; // great bargain
            } else if (markup <= expectedMarkup * 1.1) {
              buyChance = 0.62; // fair price
            } else if (markup <= expectedMarkup * 1.6) {
              buyChance = 0.32; // somewhat pricey
            } else if (markup <= expectedMarkup * 2.3) {
              buyChance = 0.12; // expensive
            } else {
              buyChance = 0.03; // gouging
            }

            // Apply conversions & staff bonuses
            buyChance = Math.min(
              0.95,
              buyChance + (conversionBoost + equipConversionBonus + staffBonus) / 100
            );

            const potentialBuyers = Math.round(customersPerItemSlot * buyChance);

            if (item.currentStock >= potentialBuyers) {
              // Fulfilled full demand
              const unitsSold = potentialBuyers;
              const itemRev = unitsSold * effectivePrice;
              const itemCost = unitsSold * item.avgCostPrice;
              const itemProfit = itemRev - itemCost;

              item.currentStock -= unitsSold;
              item.dailySoldUnits += unitsSold;
              item.dailyRevenue += itemRev;
              item.dailyProfit += itemProfit;
              item.totalSoldUnits += unitsSold;
              item.totalRevenue += itemRev;
              item.totalProfit += itemProfit;

              storeRevenue += itemRev;
              storeCogs += itemCost;
              storePurchases += unitsSold;
            } else if (item.currentStock > 0) {
              // Partial fulfill, ran out of stock
              const unitsSold = item.currentStock;
              const missedUnits = potentialBuyers - unitsSold;
              const itemRev = unitsSold * effectivePrice;
              const itemCost = unitsSold * item.avgCostPrice;

              outOfStockLoss += missedUnits * effectivePrice;
              item.currentStock = 0;
              item.dailySoldUnits += unitsSold;
              item.dailyRevenue += itemRev;
              item.dailyProfit += itemRev - itemCost;
              item.totalSoldUnits += unitsSold;
              item.totalRevenue += itemRev;
              item.totalProfit += itemRev - itemCost;

              storeRevenue += itemRev;
              storeCogs += itemCost;
              storePurchases += unitsSold;

              // Reputation penalty for stockout
              store.reputation = Math.max(10, store.reputation - 0.2);
            } else {
              // Completely out of stock!
              const missedRevenue = potentialBuyers * effectivePrice;
              outOfStockLoss += missedRevenue;
              store.reputation = Math.max(10, store.reputation - 0.4);
            }
          }
        }

        // Recalculate used volume
        store.usedVolume = store.inventory.reduce(
          (sum, item) => sum + item.currentStock * item.volume,
          0
        );

        // 5. Store Overheads: Rent, Electricity, Salaries, Advertising
        store.dailyRent = Math.round(store.areaSqM * location.rentPerSqMeter);
        store.dailyElectricity = Math.round(store.areaSqM * 0.08 + equipElectricity + 12);
        store.dailySalaries = store.employees.reduce((sum, e) => sum + e.salaryDaily, 0);

        const totalOperationalExpenses =
          store.dailyRent + store.dailyElectricity + store.dailySalaries + store.dailyAdCost;

        const grossProfit = storeRevenue - storeCogs;
        const netProfit = grossProfit - totalOperationalExpenses;

        store.dailyRevenue = storeRevenue;
        store.dailyCogs = storeCogs;
        store.dailyGrossProfit = grossProfit;
        store.dailyNetProfit = netProfit;
        store.dailyPurchases = storePurchases;
        store.outOfStockLossDaily = outOfStockLoss;
        store.dailyConversionRate =
          totalVisitors > 0 ? Math.round((storePurchases / totalVisitors) * 100) : 0;
        store.dailyAvgTicket =
          storePurchases > 0 ? Math.round(storeRevenue / storePurchases) : 0;

        // Update Lifetime Stats
        store.totalRevenue += storeRevenue;
        store.totalExpenses += storeCogs + totalOperationalExpenses;
        store.totalNetProfit += netProfit;
        store.totalCustomersServed += storePurchases;

        // Customer Satisfaction update
        if (outOfStockLoss > storeRevenue * 0.3) {
          store.customerSatisfaction = Math.max(20, store.customerSatisfaction - 3);
        } else if (storePurchases > 0) {
          store.customerSatisfaction = Math.min(98, store.customerSatisfaction + 1);
          store.reputation = Math.min(100, store.reputation + 0.3);
        }

        // 6. Record Historical P&L Entry (Keep last 30 days)
        const histRecord: DailyStoreFinancialRecord = {
          day: currentDay,
          dateStr: `День ${currentDay}`,
          revenue: storeRevenue,
          cogs: storeCogs,
          grossProfit,
          salaries: store.dailySalaries,
          rent: store.dailyRent,
          electricity: store.dailyElectricity,
          advertising: store.dailyAdCost,
          otherExpenses: 0,
          netProfit,
          customersVisited: totalVisitors,
          customersPurchased: storePurchases,
          conversionRate: store.dailyConversionRate,
          avgTicket: store.dailyAvgTicket,
          outOfStockLoss,
        };

        store.history.push(histRecord);
        if (store.history.length > 30) {
          store.history = store.history.slice(store.history.length - 30);
        }

        totalDailyRetailRevenue += storeRevenue;
        totalDailyRetailExpenses += storeCogs + totalOperationalExpenses;
      }
    });

    // 7. Post transaction & update cash through economy API
    if (totalDailyRetailRevenue > 0) {
      economy.addMoney(
        totalDailyRetailRevenue,
        'Розничная выручка',
        `Выручка розничной сети магазинов за день ${currentDay}`,
        'revenue'
      );
    }

    if (totalDailyRetailExpenses > 0) {
      economy.removeMoney(
        totalDailyRetailExpenses,
        'Расходы ритейла (COGS, аренда, зарплаты, реклама)',
        `Операционные издержки магазинов за день ${currentDay}`,
        'expense'
      );
    }
  }
}

export const retailManager = new RetailManager();
