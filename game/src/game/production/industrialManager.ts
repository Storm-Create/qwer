/**
 * Business Empire: Ultimate
 * Industrial Production Manager & Economic Simulation Engine
 */

import { gameState } from '../gameState';
import { economy } from '../economy';
import { warehouseSystem } from '../business/warehouses';
import { goodsMarket } from '../markets/goodsMarket';
import {
  IndustrialState,
  IndustrialFactory,
  FactoryType,
  FactoryRecipe,
  FactoryAutomationConfig,
  UnitCostBreakdown,
  FactoryUpgradeTier,
} from '../../types/production';
import {
  FACTORY_BLUEPRINTS,
  FACTORY_RECIPES,
  UPGRADE_TIERS,
} from './productionCatalog';
import { Warehouse, InventoryItem } from '../../types/game';

class IndustrialManager {
  /**
   * Initializes or returns existing industrial state in GameState
   */
  public getOrCreateState(): IndustrialState {
    const state = gameState.getState();
    if (state.industrial && state.industrial.factories) {
      return state.industrial;
    }

    const initialFactId = `factory_${Date.now()}_food1`;
    const defaultFoodFactory: IndustrialFactory = {
      id: initialFactId,
      type: 'food_factory',
      name: 'Пищевой комбинат «Агро-Альянс» №1',
      location: 'Москва (Южный кластер)',
      level: 1,
      status: 'active',
      activeRecipeId: 'recipe_grain_to_flour',
      capacityUtilization: 1.0,
      targetBatchVolume: 1,
      employeesCount: 14,
      employeeSalaryDaily: 95,
      electricityKWhDaily: 480,
      electricityPricePerKWh: 0.14,
      maintenanceDaily: 240,
      automation: {
        autoBuyRawMaterials: true,
        autoBuyThresholdBatches: 3,
        maxAutoBuyPriceMultiplier: 1.25,
        autoTransferToWarehouse: true,
        targetWarehouseId: 'any',
        sourceWarehouseId: 'any',
        autoSupplyRetail: true,
        autoSellExcess: false,
      },
      progress: {
        currentCycleHoursElapsed: 0,
        currentBatchId: `batch_${Date.now()}`,
        totalBatchesCompleted: 0,
        materialsLockedForCurrentBatch: false,
        lastRunTimestamp: Date.now(),
      },
      dailyProducedUnits: 0,
      dailyRevenue: 0,
      dailyExpenses: 0,
      dailyProfit: 0,
      totalProducedUnits: 0,
      totalRevenueAllTime: 0,
      totalCostAllTime: 0,
      missingMaterials: [],
      recentLogs: [
        {
          id: `log_init_${Date.now()}`,
          timestamp: Date.now(),
          gameDay: 1,
          gameHour: 8,
          message: 'Производственная линия мукомольного помола зерна введена в эксплуатацию.',
          type: 'info',
        },
      ],
    };

    const initialIndustrial: IndustrialState = {
      factories: [defaultFoodFactory],
      selectedFactoryId: initialFactId,
      totalIndustrialInvestment: 280000,
      totalIndustrialRevenue: 0,
      totalIndustrialProfit: 0,
      totalUnitsManufactured: 0,
      electricityTariffKWh: 0.14,
    };

    gameState.update((draft) => {
      draft.industrial = initialIndustrial;
    });

    return initialIndustrial;
  }

  /**
   * Purchases and constructs a new factory
   */
  public purchaseFactory(
    type: FactoryType,
    customName?: string,
    location?: string
  ): { success: boolean; message: string; factory?: IndustrialFactory } {
    const blueprint = FACTORY_BLUEPRINTS[type];
    if (!blueprint) {
      return { success: false, message: 'Неизвестный тип завода' };
    }

    const state = gameState.getState();
    const cost = blueprint.purchaseCost;

    if (!economy.canAfford(cost)) {
      const currency = state.settings.currency || '$';
      return {
        success: false,
        message: `Недостаточно средств. Требуется ${currency}${cost.toLocaleString()}`,
      };
    }

    const paid = economy.removeMoney(
      cost,
      'Промышленность',
      `Строительство завода: ${blueprint.name}`,
      'investment'
    );

    if (!paid) {
      return { success: false, message: 'Ошибка списания инвестиций' };
    }

    let created: IndustrialFactory | null = null;

    gameState.update((draft) => {
      if (!draft.industrial) {
        draft.industrial = {
          factories: [],
          totalIndustrialInvestment: 0,
          totalIndustrialRevenue: 0,
          totalIndustrialProfit: 0,
          totalUnitsManufactured: 0,
          electricityTariffKWh: 0.14,
        };
      }

      const newFactory: IndustrialFactory = {
        id: `factory_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type,
        name: customName || `${blueprint.name} #${draft.industrial.factories.length + 1}`,
        location: location || 'Центральный промышленный парк',
        level: 1,
        status: 'active',
        activeRecipeId: blueprint.defaultRecipeId,
        capacityUtilization: 1.0,
        targetBatchVolume: 1,
        employeesCount: blueprint.minEmployees,
        employeeSalaryDaily: blueprint.baseSalaryDailyPerWorker,
        electricityKWhDaily: blueprint.baseElectricityKWhDaily,
        electricityPricePerKWh: 0.14,
        maintenanceDaily: blueprint.baseMaintenanceDaily,
        automation: {
          autoBuyRawMaterials: true,
          autoBuyThresholdBatches: 3,
          maxAutoBuyPriceMultiplier: 1.25,
          autoTransferToWarehouse: true,
          targetWarehouseId: 'any',
          sourceWarehouseId: 'any',
          autoSupplyRetail: true,
          autoSellExcess: false,
        },
        progress: {
          currentCycleHoursElapsed: 0,
          currentBatchId: `batch_${Date.now()}`,
          totalBatchesCompleted: 0,
          materialsLockedForCurrentBatch: false,
          lastRunTimestamp: Date.now(),
        },
        dailyProducedUnits: 0,
        dailyRevenue: 0,
        dailyExpenses: 0,
        dailyProfit: 0,
        totalProducedUnits: 0,
        totalRevenueAllTime: 0,
        totalCostAllTime: 0,
        missingMaterials: [],
        recentLogs: [
          {
            id: `log_${Date.now()}`,
            timestamp: Date.now(),
            gameDay: draft.gameTime.day,
            gameHour: draft.gameTime.hour,
            message: `Завод «${blueprint.name}» успешно построен и готов к запуску.`,
            type: 'success',
          },
        ],
      };

      draft.industrial.factories.push(newFactory);
      draft.industrial.totalIndustrialInvestment += cost;
      draft.industrial.selectedFactoryId = newFactory.id;
      created = newFactory;
    });

    return {
      success: true,
      message: `Завод «${blueprint.name}» успешно открыт!`,
      factory: created || undefined,
    };
  }

  /**
   * Starts or resumes factory production
   */
  public startFactory(factoryId: string): { success: boolean; message: string } {
    let msg = '';
    gameState.update((draft) => {
      const f = draft.industrial?.factories.find((x) => x.id === factoryId);
      if (f) {
        f.status = 'active';
        f.recentLogs.unshift({
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          gameDay: draft.gameTime.day,
          gameHour: draft.gameTime.hour,
          message: 'Производственная линия запущена оператором.',
          type: 'info',
        });
        msg = `Завод «${f.name}» успешно запущен!`;
      }
    });
    return { success: !!msg, message: msg || 'Завод не найден' };
  }

  /**
   * Stops or pauses factory production
   */
  public stopFactory(factoryId: string): { success: boolean; message: string } {
    let msg = '';
    gameState.update((draft) => {
      const f = draft.industrial?.factories.find((x) => x.id === factoryId);
      if (f) {
        f.status = 'stopped';
        f.recentLogs.unshift({
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          gameDay: draft.gameTime.day,
          gameHour: draft.gameTime.hour,
          message: 'Производственная линия временно остановлена.',
          type: 'warning',
        });
        msg = `Завод «${f.name}» остановлен.`;
      }
    });
    return { success: !!msg, message: msg || 'Завод не найден' };
  }

  /**
   * Upgrades a factory to the next level tier
   */
  public upgradeFactory(factoryId: string): { success: boolean; message: string } {
    const state = gameState.getState();
    const factory = state.industrial?.factories.find((f) => f.id === factoryId);
    if (!factory) return { success: false, message: 'Завод не найден' };

    const currentLevel = factory.level;
    if (currentLevel >= UPGRADE_TIERS.length) {
      return { success: false, message: 'Достигнут максимальный уровень завода (Уровень 6)' };
    }

    const nextTier = UPGRADE_TIERS[currentLevel]; // 0-indexed: level 1 gets tier index 1
    const cost = nextTier.upgradeCost;

    if (!economy.canAfford(cost)) {
      const currency = state.settings.currency || '$';
      return {
        success: false,
        message: `Недостаточно средств для модернизации. Требуется ${currency}${cost.toLocaleString()}`,
      };
    }

    const paid = economy.removeMoney(
      cost,
      'Модернизация производства',
      `Апгрейд завода ${factory.name} до уровня ${nextTier.level} (${nextTier.name})`,
      'investment'
    );

    if (!paid) return { success: false, message: 'Ошибка списания средств' };

    gameState.update((draft) => {
      const f = draft.industrial?.factories.find((x) => x.id === factoryId);
      if (f) {
        f.level = nextTier.level;
        f.employeesCount = Math.max(f.employeesCount, nextTier.minEmployees);
        f.maintenanceDaily = nextTier.dailyMaintenance;
        f.recentLogs.unshift({
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          gameDay: draft.gameTime.day,
          gameHour: draft.gameTime.hour,
          message: `Модернизация завершена: ${nextTier.name}! Производительность увеличена на +${Math.round((nextTier.capacityMultiplier - 1) * 100)}%.`,
          type: 'success',
        });
      }
    });

    return {
      success: true,
      message: `Завод «${factory.name}» успешно модернизирован до уровня ${nextTier.level}!`,
    };
  }

  /**
   * Updates capacity utilization (0.1 to 1.0)
   */
  public setCapacityUtilization(factoryId: string, utilization: number): void {
    const clamped = Math.max(0.1, Math.min(1.0, utilization));
    gameState.update((draft) => {
      const f = draft.industrial?.factories.find((x) => x.id === factoryId);
      if (f) {
        f.capacityUtilization = clamped;
      }
    });
  }

  /**
   * Updates target batch volume multiplier (1 to 10)
   */
  public setBatchVolume(factoryId: string, volume: number): void {
    const clamped = Math.max(1, Math.min(10, Math.round(volume)));
    gameState.update((draft) => {
      const f = draft.industrial?.factories.find((x) => x.id === factoryId);
      if (f) {
        f.targetBatchVolume = clamped;
      }
    });
  }

  /**
   * Sets active recipe for a factory
   */
  public setActiveRecipe(factoryId: string, recipeId: string): { success: boolean; message: string } {
    const recipe = FACTORY_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return { success: false, message: 'Рецепт не найден' };

    let msg = '';
    gameState.update((draft) => {
      const f = draft.industrial?.factories.find((x) => x.id === factoryId);
      if (f) {
        f.activeRecipeId = recipeId;
        f.progress.currentCycleHoursElapsed = 0;
        f.progress.materialsLockedForCurrentBatch = false;
        f.missingMaterials = [];
        f.recentLogs.unshift({
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          gameDay: draft.gameTime.day,
          gameHour: draft.gameTime.hour,
          message: `Производственная линия перенастроена на рецепт: «${recipe.name}».`,
          type: 'info',
        });
        msg = `Рецепт изменен на: ${recipe.name}`;
      }
    });

    return { success: !!msg, message: msg };
  }

  /**
   * Updates factory automation settings
   */
  public updateAutomation(
    factoryId: string,
    updates: Partial<FactoryAutomationConfig>
  ): void {
    gameState.update((draft) => {
      const f = draft.industrial?.factories.find((x) => x.id === factoryId);
      if (f) {
        f.automation = {
          ...f.automation,
          ...updates,
        };
      }
    });
  }

  /**
   * Calculates comprehensive mathematical Unit Cost Breakdown (Себестоимость)
   */
  public calculateUnitCostBreakdown(
    factory: IndustrialFactory,
    recipe: FactoryRecipe
  ): UnitCostBreakdown {
    const tier = UPGRADE_TIERS[factory.level - 1] || UPGRADE_TIERS[0];
    const batchMultiplier = (factory.targetBatchVolume || 1) * (factory.capacityUtilization || 1);
    
    // 1. Calculate Raw Materials Cost
    let rawMaterialsCost = 0;
    const allCommodities = goodsMarket.getCommodities();

    for (const input of recipe.inputs) {
      const neededQty = input.quantity * batchMultiplier;
      // Match market commodity to estimate current price
      const matched = allCommodities.find(
        (c) =>
          c.category === input.category ||
          c.name.toLowerCase().includes(input.name.toLowerCase())
      );
      const unitPrice = matched ? matched.currentPrice : (input.estimatedCost || 100);
      rawMaterialsCost += neededQty * unitPrice;
    }

    // 2. Output units produced in 1 batch
    const totalOutputUnits = recipe.outputs.reduce((acc, o) => acc + o.quantity * batchMultiplier, 0) || 1;

    // 3. Cycle Time in Hours with upgrade efficiency
    const effectiveHours = Math.max(1, Math.round(recipe.cycleHours * (1 - tier.cycleTimeReduction)));
    const batchesPerDay = (24 / effectiveHours) * (factory.capacityUtilization || 1);

    // 4. Labor Cost per unit
    const dailySalaries = factory.employeesCount * factory.employeeSalaryDaily;
    const dailyLaborPerBatch = dailySalaries / Math.max(1, batchesPerDay);
    const laborCostPerUnit = dailyLaborPerBatch / totalOutputUnits;

    // 5. Electricity Cost per unit
    const kwhPerBatch = recipe.electricityKWhPerBatch * tier.energyEfficiency * batchMultiplier;
    const electricityCostBatch = kwhPerBatch * (factory.electricityPricePerKWh || 0.14);
    const electricityCostPerUnit = electricityCostBatch / totalOutputUnits;

    // 6. Maintenance & Tooling per unit
    const dailyMaintenance = factory.maintenanceDaily + tier.dailyRent;
    const maintPerBatch = (dailyMaintenance / Math.max(1, batchesPerDay)) + (recipe.reagentCostPerBatch * batchMultiplier);
    const maintenanceCostPerUnit = maintPerBatch / totalOutputUnits;

    // 7. Raw Materials per unit
    const rawMaterialsCostPerUnit = rawMaterialsCost / totalOutputUnits;

    // 8. TOTAL UNIT COST (Себестоимость)
    const totalUnitCost = Math.round((rawMaterialsCostPerUnit + laborCostPerUnit + electricityCostPerUnit + maintenanceCostPerUnit) * 100) / 100;

    // 9. Current Market Value of Outputs
    let totalOutputMarketValue = 0;
    for (const out of recipe.outputs) {
      const outQty = out.quantity * batchMultiplier;
      const matched = allCommodities.find(
        (c) =>
          c.category === out.category ||
          c.name.toLowerCase().includes(out.name.toLowerCase())
      );
      const price = matched ? matched.currentPrice : out.baseMarketValue;
      totalOutputMarketValue += outQty * price;
    }
    const currentMarketPrice = Math.round((totalOutputMarketValue / totalOutputUnits) * 100) / 100;
    const estimatedMarginDollars = Math.round((currentMarketPrice - totalUnitCost) * 100) / 100;
    const estimatedMarginPercent = totalUnitCost > 0
      ? Math.round(((currentMarketPrice - totalUnitCost) / totalUnitCost) * 10000) / 100
      : 0;

    // Daily Projections
    const dailyEstimatedUnits = Math.round(totalOutputUnits * batchesPerDay);
    const dailyEstimatedRevenue = Math.round(totalOutputMarketValue * batchesPerDay);
    const dailyEstimatedExpenses = Math.round((rawMaterialsCost + dailyLaborPerBatch + electricityCostBatch + maintPerBatch) * batchesPerDay);
    const dailyEstimatedNetProfit = dailyEstimatedRevenue - dailyEstimatedExpenses;

    return {
      batchSize: batchMultiplier,
      outputQuantity: totalOutputUnits,
      rawMaterialsCost: Math.round(rawMaterialsCost),
      rawMaterialsCostPerUnit: Math.round(rawMaterialsCostPerUnit * 100) / 100,
      laborCostPerUnit: Math.round(laborCostPerUnit * 100) / 100,
      electricityCostPerUnit: Math.round(electricityCostPerUnit * 100) / 100,
      maintenanceCostPerUnit: Math.round(maintenanceCostPerUnit * 100) / 100,
      totalUnitCost,
      currentMarketPrice,
      estimatedMarginDollars,
      estimatedMarginPercent,
      dailyEstimatedBatches: Math.round(batchesPerDay * 10) / 10,
      dailyEstimatedUnits,
      dailyEstimatedRevenue,
      dailyEstimatedExpenses,
      dailyEstimatedNetProfit,
    };
  }

  /**
   * Hourly production processor executed by central game loop
   */
  public handleHourTick(gameHour: number): void {
    gameState.update((draft) => {
      if (!draft.industrial?.factories || draft.industrial.factories.length === 0) return;

      const warehouses = draft.warehouses || [];

      for (const factory of draft.industrial.factories) {
        if (factory.status === 'stopped' || factory.status === 'upgrading') {
          continue;
        }

        const recipe = FACTORY_RECIPES.find((r) => r.id === factory.activeRecipeId);
        if (!recipe) continue;

        const tier = UPGRADE_TIERS[factory.level - 1] || UPGRADE_TIERS[0];
        const effectiveCycleHours = Math.max(1, Math.round(recipe.cycleHours * (1 - tier.cycleTimeReduction)));
        const batchMultiplier = (factory.targetBatchVolume || 1) * (factory.capacityUtilization || 1);

        // STEP 1: If materials not locked, attempt to verify and reserve inputs
        if (!factory.progress.materialsLockedForCurrentBatch) {
          const missing: string[] = [];

          // Check all recipe inputs
          for (const req of recipe.inputs) {
            const neededQty = req.quantity * batchMultiplier;
            let availableQty = 0;

            // Search warehouses
            for (const wh of warehouses) {
              if (factory.automation.sourceWarehouseId !== 'any' && wh.id !== factory.automation.sourceWarehouseId) {
                continue;
              }
              for (const item of wh.inventory || []) {
                if (
                  item.category === req.category ||
                  item.name.toLowerCase().includes(req.name.toLowerCase())
                ) {
                  availableQty += item.quantity;
                }
              }
            }

            if (availableQty < neededQty) {
              const shortfall = neededQty - availableQty;
              // Attempt auto-buy from Goods Market if automation is enabled
              if (factory.automation.autoBuyRawMaterials) {
                const commodities = goodsMarket.getCommodities();
                const matched = commodities.find(
                  (c) =>
                    c.category === req.category ||
                    c.name.toLowerCase().includes(req.name.toLowerCase())
                );

                if (matched) {
                  const buyBatches = Math.max(shortfall, req.quantity * (factory.automation.autoBuyThresholdBatches || 2));
                  const buyTotalCost = buyBatches * matched.currentPrice;

                  if (draft.cash >= buyTotalCost) {
                    draft.cash -= buyTotalCost;
                    draft.statistics.totalSpent += buyTotalCost;

                    // Add to first suitable warehouse
                    const targetWh = warehouses[0];
                    if (targetWh) {
                      if (!targetWh.inventory) targetWh.inventory = [];
                      const existing = targetWh.inventory.find((i) => i.id === matched.id);
                      if (existing) {
                        existing.quantity += buyBatches;
                        existing.totalCost += buyTotalCost;
                        existing.avgBuyPrice = existing.totalCost / existing.quantity;
                      } else {
                        targetWh.inventory.push({
                          id: matched.id,
                          name: matched.name,
                          category: matched.category,
                          quantity: buyBatches,
                          totalCost: buyTotalCost,
                          avgBuyPrice: matched.currentPrice,
                          currentMarketPrice: matched.currentPrice,
                          weight: matched.weight,
                          volume: matched.volume,
                          quality: matched.quality,
                          unit: matched.unit,
                        });
                      }
                      availableQty += buyBatches;

                      factory.recentLogs.unshift({
                        id: `log_autobuy_${Date.now()}_${Math.random()}`,
                        timestamp: Date.now(),
                        gameDay: draft.gameTime.day,
                        gameHour,
                        message: `Автозакупка сырья: ${matched.name} x${buyBatches} ${matched.unit} на бирже (-$${Math.round(buyTotalCost).toLocaleString()}).`,
                        type: 'info',
                      });
                    }
                  }
                }
              }
            }

            if (availableQty < neededQty) {
              missing.push(`${req.name} (нужно ${neededQty} ${req.unit}, в наличии ${availableQty.toFixed(1)})`);
            }
          }

          // If still missing ingredients -> halt and set status
          if (missing.length > 0) {
            factory.status = 'out_of_materials';
            factory.missingMaterials = missing;
            if (gameHour % 12 === 0) {
              factory.recentLogs.unshift({
                id: `log_nomat_${Date.now()}`,
                timestamp: Date.now(),
                gameDay: draft.gameTime.day,
                gameHour,
                message: `Простой линии: нехватка сырья [${missing.join('; ')}].`,
                type: 'warning',
              });
              if (factory.recentLogs.length > 15) factory.recentLogs.pop();
            }
            continue;
          }

          // All inputs are present! Deduct from warehouse inventory
          for (const req of recipe.inputs) {
            let toDeduct = req.quantity * batchMultiplier;

            for (const wh of warehouses) {
              if (toDeduct <= 0) break;
              if (factory.automation.sourceWarehouseId !== 'any' && wh.id !== factory.automation.sourceWarehouseId) {
                continue;
              }

              for (let i = (wh.inventory || []).length - 1; i >= 0; i--) {
                const item = wh.inventory[i];
                if (
                  item.category === req.category ||
                  item.name.toLowerCase().includes(req.name.toLowerCase())
                ) {
                  const take = Math.min(item.quantity, toDeduct);
                  item.quantity -= take;
                  item.totalCost -= take * item.avgBuyPrice;
                  toDeduct -= take;
                  if (item.quantity <= 0.001) {
                    wh.inventory.splice(i, 1);
                  }
                }
              }
            }
          }

          factory.status = 'active';
          factory.missingMaterials = [];
          factory.progress.materialsLockedForCurrentBatch = true;
          factory.progress.currentCycleHoursElapsed = 0;
        }

        // STEP 2: Progress active batch
        factory.progress.currentCycleHoursElapsed += 1;

        // STEP 3: Complete batch when cycle time reached
        if (factory.progress.currentCycleHoursElapsed >= effectiveCycleHours) {
          // Find target warehouse
          let targetWh = warehouses.find((w) => w.id === factory.automation.targetWarehouseId);
          if (!targetWh) {
            // Find warehouse with highest remaining capacity
            targetWh = warehouses.reduce((best, w) => {
              const free = (w.capacity || 100) - (w.usedCapacity || 0);
              const bestFree = best ? (best.capacity || 100) - (best.usedCapacity || 0) : -1;
              return free > bestFree ? w : best;
            }, null as Warehouse | null) || warehouses[0];
          }

          // Check if warehouse is completely full
          const isFull = targetWh && (targetWh.usedCapacity || 0) >= (targetWh.capacity || 100);

          if (isFull && !factory.automation.autoSellExcess) {
            factory.status = 'warehouse_full';
            factory.recentLogs.unshift({
              id: `log_full_${Date.now()}`,
              timestamp: Date.now(),
              gameDay: draft.gameTime.day,
              gameHour,
              message: `Склад «${targetWh.name}» переполнен! Партия готова, но ожидает отгрузки.`,
              type: 'warning',
            });
            continue;
          }

          // Output goods generation
          let batchRevenue = 0;
          let batchCost = factory.employeeSalaryDaily + (recipe.reagentCostPerBatch * batchMultiplier);

          for (const out of recipe.outputs) {
            const producedQty = Math.round(out.quantity * batchMultiplier * 100) / 100;
            const itemId = out.id || `prod_${recipe.id}_${out.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

            if (isFull && factory.automation.autoSellExcess) {
              // Auto-sell wholesale on Goods Market
              const saleAmount = Math.round(producedQty * out.baseMarketValue);
              draft.cash += saleAmount;
              batchRevenue += saleAmount;
              factory.recentLogs.unshift({
                id: `log_autosell_${Date.now()}`,
                timestamp: Date.now(),
                gameDay: draft.gameTime.day,
                gameHour,
                message: `Автопродажа излишков: ${out.name} x${producedQty} ${out.unit} продано на бирже (+$${saleAmount.toLocaleString()}).`,
                type: 'success',
              });
            } else if (targetWh) {
              if (!targetWh.inventory) targetWh.inventory = [];
              const existing = targetWh.inventory.find((i) => i.id === itemId || i.name === out.name);

              const unitCostVal = Math.round((out.baseMarketValue * 0.55) * 100) / 100;

              if (existing) {
                existing.quantity += producedQty;
                existing.totalCost += producedQty * unitCostVal;
                existing.avgBuyPrice = existing.totalCost / existing.quantity;
                existing.currentMarketPrice = out.baseMarketValue;
              } else {
                targetWh.inventory.push({
                  id: itemId,
                  name: out.name,
                  category: out.category as any,
                  quantity: producedQty,
                  totalCost: producedQty * unitCostVal,
                  avgBuyPrice: unitCostVal,
                  currentMarketPrice: out.baseMarketValue,
                  weight: out.weight,
                  volume: out.volume,
                  quality: out.quality,
                  unit: out.unit,
                });
              }

              // Direct integration with retail stores: auto-supply matching retail shops
              if (factory.automation.autoSupplyRetail && draft.retailStores) {
                for (const store of draft.retailStores) {
                  if (store.status === 'active' && store.inventory) {
                    const shopItem = store.inventory.find(
                      (si) => si.category === out.category || si.name.toLowerCase().includes(out.name.toLowerCase())
                    );
                    if (shopItem && shopItem.currentStock < shopItem.maxStockCapacity * 0.4) {
                      const supplyQty = Math.min(producedQty * 0.5, shopItem.maxStockCapacity - shopItem.currentStock);
                      if (supplyQty > 0) {
                        shopItem.currentStock += supplyQty;
                        shopItem.avgCostPrice = unitCostVal;
                      }
                    }
                  }
                }
              }

              // Direct integration with automotive: auto parts sync with parts warehouse stock
              if (out.category === 'Автозапчасти' && draft.automotive?.partsWarehouseStock) {
                const partKey = out.name.includes('Тормоз')
                  ? 'part_brakes_oem'
                  : out.name.includes('Амортизатор')
                  ? 'part_suspension_oem'
                  : out.name.includes('Турбо')
                  ? 'part_engine_oem'
                  : 'part_electronics_oem';
                draft.automotive.partsWarehouseStock[partKey] =
                  (draft.automotive.partsWarehouseStock[partKey] || 0) + Math.round(producedQty);
              }
            }

            factory.dailyProducedUnits += producedQty;
            factory.totalProducedUnits += producedQty;
          }

          // Reset batch cycle
          factory.progress.totalBatchesCompleted += 1;
          factory.progress.currentCycleHoursElapsed = 0;
          factory.progress.materialsLockedForCurrentBatch = false;
          factory.dailyRevenue += batchRevenue;
          factory.dailyExpenses += batchCost;
          factory.dailyProfit = factory.dailyRevenue - factory.dailyExpenses;
          factory.totalRevenueAllTime += batchRevenue;
          factory.totalCostAllTime += batchCost;

          factory.recentLogs.unshift({
            id: `log_batch_done_${Date.now()}`,
            timestamp: Date.now(),
            gameDay: draft.gameTime.day,
            gameHour,
            message: `Партия «${recipe.name}» успешно выпущена и передана на склад «${targetWh?.name || 'Хаб'}».`,
            type: 'success',
          });

          if (factory.recentLogs.length > 20) {
            factory.recentLogs.pop();
          }
        }
      }

      // Sync warehouse capacities & draft.inventory
      warehouseSystem.syncGlobalInventoryDraft(draft);
    });
  }

  /**
   * Daily rollover accounting executed at midnight
   */
  public handleDayTick(gameDay: number): void {
    gameState.update((draft) => {
      if (!draft.industrial?.factories) return;

      let totalPowerCost = 0;
      let totalMaintCost = 0;
      let totalSalaries = 0;

      for (const factory of draft.industrial.factories) {
        if (factory.status !== 'stopped') {
          const powerCost = Math.round(factory.electricityKWhDaily * (factory.electricityPricePerKWh || 0.14));
          const maint = factory.maintenanceDaily;
          const salaries = factory.employeesCount * factory.employeeSalaryDaily;

          totalPowerCost += powerCost;
          totalMaintCost += maint;
          totalSalaries += salaries;

          factory.dailyExpenses = powerCost + maint + salaries;
          factory.dailyProfit = factory.dailyRevenue - factory.dailyExpenses;

          // Reset daily counters
          factory.dailyProducedUnits = 0;
          factory.dailyRevenue = 0;
        }
      }

      const totalDailyExpenses = totalPowerCost + totalMaintCost + totalSalaries;

      if (totalDailyExpenses > 0 && draft.cash >= totalDailyExpenses) {
        draft.cash -= totalDailyExpenses;
        draft.statistics.totalSpent += totalDailyExpenses;

        draft.transactions.unshift({
          id: `tx_ind_${Date.now()}`,
          timestamp: Date.now(),
          gameTime: draft.gameTime,
          amount: -totalDailyExpenses,
          type: 'expense',
          category: 'operating_cost',
          description: `Промышленные расходы: электроэнергия ($${totalPowerCost}), техобслуживание ($${totalMaintCost}), зарплаты ($${totalSalaries})`,
          balanceAfter: draft.cash,
        });
      }
    });
  }
}

export const industrialManager = new IndustrialManager();
