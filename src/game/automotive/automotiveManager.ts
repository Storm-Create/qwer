/**
 * Business Empire: Ultimate
 * Automotive Manager - Integrated Master Engine
 * Connects Used Market, Workshops, Parts Warehouses, Dealerships,
 * Factories, R&D, Financials, and Game Loop events.
 */

import {
  AutomotiveState,
  CarComponentType,
  CarDealership,
  CustomCarModelDesign,
  DiagnosticsReport,
  OwnedCar,
  PlayerCarBrand,
  UsedCarListing,
} from '../../types/automotive';
import { gameState, stateManager } from '../gameState';
import { economy } from '../economy';
import { UsedMarketSystem } from './usedMarketSystem';
import { AutoServiceSystem } from './autoServiceSystem';
import { DealershipSystem } from './dealershipSystem';
import { ManufacturingSystem } from './manufacturingSystem';
import { BrandAndRndSystem, DEFAULT_RND_TECHS } from './brandAndRndSystem';
import { AUTO_PARTS_CATALOG } from './partsCatalog';

export class AutomotiveManager {
  private static instance: AutomotiveManager;

  public static getInstance(): AutomotiveManager {
    if (!AutomotiveManager.instance) {
      AutomotiveManager.instance = new AutomotiveManager();
    }
    return AutomotiveManager.instance;
  }

  /**
   * Initializes or retrieves the persistent automotive state
   */
  public getOrCreateState(): AutomotiveState {
    const currentState = stateManager.getState();
    if (currentState.automotive) {
      return currentState.automotive;
    }

    const currentDay = currentState.gameTime.day;
    const initialListings = UsedMarketSystem.generateMarketListings(currentDay, 24);
    const initialWorkshop = AutoServiceSystem.createDefaultWorkshop();

    // Starter flip car in garage for instant fun!
    const starterListing = initialListings[0];
    const starterCar: OwnedCar = {
      id: `car_starter_${Date.now()}`,
      templateId: starterListing.templateId,
      brand: starterListing.brand,
      model: starterListing.model,
      generation: starterListing.generation,
      category: starterListing.category,
      year: starterListing.year,
      mileageKm: starterListing.mileageKm,
      condition: starterListing.condition,
      engine: starterListing.engine,
      enginePowerHp: starterListing.enginePowerHp,
      fuelType: starterListing.fuelType,
      transmission: starterListing.transmission,
      driveType: starterListing.driveType,
      fuelConsumption: starterListing.fuelConsumption,
      color: starterListing.color,
      marketValue: starterListing.marketPrice,
      status: 'in_garage',
      location: 'Гаражный бокс (Москва)',
      components: JSON.parse(JSON.stringify(starterListing.components)),
      faults: JSON.parse(JSON.stringify(starterListing.faults)),
      tuning: {
        chipStage: 0,
        paintType: 'factory',
        tintLevel: 'none',
        exhaustUpgraded: false,
        sportSuspension: false,
        leatherInteriorRedone: false,
        soundSystemUpgraded: false,
        detailingDone: false,
        powerGainHp: 0,
        valueAdded: 0,
      },
      financials: {
        purchasePrice: starterListing.sellerPrice,
        diagnosticsCost: 0,
        partsCost: 0,
        laborCost: 0,
        tuningCost: 0,
        logisticsCost: 0,
        advertisingCost: 0,
        totalInvested: starterListing.sellerPrice,
      },
      acquiredDay: currentDay,
    };

    const initialPartsStock: Record<string, number> = {
      part_brakes_discs_pads_std: 4,
      part_suspension_struts_arms: 2,
      part_oil_and_filters_full_service: 8,
      part_tires_set_premium_r19: 2,
      part_ecu_brain_harness: 1,
    };

    const initialAutomotive: AutomotiveState = {
      usedMarketListings: initialListings.slice(1),
      ownedCars: [starterCar],
      autoWorkshops: [initialWorkshop],
      dealerships: [],
      playerBrands: [],
      customModels: [],
      factoryLines: [],
      rndTechnologies: JSON.parse(JSON.stringify(DEFAULT_RND_TECHS)),
      partsWarehouseStock: initialPartsStock,
      lastMarketRefreshDay: currentDay,
      totalFlipsCompleted: 0,
      totalFlipProfit: 0,
      totalCarsManufactured: 0,
      totalCarsSoldViaDealerships: 0,
      warrantyClaimsExpenseDaily: 0,
    };

    stateManager.update(draft => {
      draft.automotive = initialAutomotive;
    });

    return initialAutomotive;
  }

  /**
   * Refreshes market listings
   */
  public refreshUsedMarket(force = false): void {
    const state = stateManager.getState();
    const auto = this.getOrCreateState();
    const currentDay = state.gameTime.day;

    if (force || currentDay - auto.lastMarketRefreshDay >= 3 || auto.usedMarketListings.length <= 4) {
      const newListings = UsedMarketSystem.generateMarketListings(currentDay, 24);
      stateManager.update(draft => {
        if (draft.automotive) {
          draft.automotive.usedMarketListings = newListings;
          draft.automotive.lastMarketRefreshDay = currentDay;
        }
      });
    }
  }

  /**
   * Buys a car from the used market
   */
  public buyUsedCar(listingId: string, agreedPrice: number): { success: boolean; message: string } {
    const state = stateManager.getState();
    const auto = this.getOrCreateState();

    const listing = auto.usedMarketListings.find(l => l.id === listingId);
    if (!listing) return { success: false, message: 'Объявление больше неактуально' };

    if (state.cash < agreedPrice) {
      return { success: false, message: `Недостаточно средств. Требуется $${agreedPrice.toLocaleString()}` };
    }

    const currentDay = state.gameTime.day;
    const newOwnedCar: OwnedCar = {
      id: `car_owned_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      templateId: listing.templateId,
      brand: listing.brand,
      model: listing.model,
      generation: listing.generation,
      category: listing.category,
      year: listing.year,
      mileageKm: listing.mileageKm,
      condition: listing.condition,
      engine: listing.engine,
      enginePowerHp: listing.enginePowerHp,
      fuelType: listing.fuelType,
      transmission: listing.transmission,
      driveType: listing.driveType,
      fuelConsumption: listing.fuelConsumption,
      color: listing.color,
      marketValue: listing.marketPrice,
      status: 'in_garage',
      location: 'Гаражный бокс (Москва)',
      components: JSON.parse(JSON.stringify(listing.components)),
      faults: JSON.parse(JSON.stringify(listing.faults)),
      tuning: {
        chipStage: 0,
        paintType: 'factory',
        tintLevel: 'none',
        exhaustUpgraded: false,
        sportSuspension: false,
        leatherInteriorRedone: false,
        soundSystemUpgraded: false,
        detailingDone: false,
        powerGainHp: 0,
        valueAdded: 0,
      },
      financials: {
        purchasePrice: agreedPrice,
        diagnosticsCost: listing.diagnosticsReport ? listing.diagnosticsReport.cost : 0,
        partsCost: 0,
        laborCost: 0,
        tuningCost: 0,
        logisticsCost: 0,
        advertisingCost: 0,
        totalInvested: agreedPrice + (listing.diagnosticsReport ? listing.diagnosticsReport.cost : 0),
      },
      diagnosticsReport: listing.diagnosticsReport,
      acquiredDay: currentDay,
    };

    stateManager.update(draft => {
      draft.cash -= agreedPrice;
      draft.transactions.unshift({
        id: `tx_${Date.now()}`,
        timestamp: Date.now(),
        gameTime: draft.gameTime,
        amount: -agreedPrice,
        type: 'expense',
        category: 'equipment',
        description: `Покупка авто: ${newOwnedCar.brand} ${newOwnedCar.model} (${newOwnedCar.year})`,
        balanceAfter: draft.cash,
      });

      if (draft.automotive) {
        draft.automotive.usedMarketListings = draft.automotive.usedMarketListings.filter(l => l.id !== listingId);
        draft.automotive.ownedCars.unshift(newOwnedCar);
      }
    });

    return {
      success: true,
      message: `Поздравляем с покупкой! Автомобиль ${newOwnedCar.brand} ${newOwnedCar.model} доставлен в ваш гараж!`,
    };
  }

  /**
   * Instant sale to a wholesale car buyer
   */
  public sellCarDirect(carId: string): { success: boolean; payout: number; profit: number; message: string } {
    const auto = this.getOrCreateState();
    const car = auto.ownedCars.find(c => c.id === carId);

    if (!car) return { success: false, payout: 0, profit: 0, message: 'Автомобиль не найден' };

    // Direct wholesale payout is 92% of real market value (fast cash)
    const payout = Math.round(car.marketValue * 0.92);
    const profit = payout - car.financials.totalInvested;
    const currentDay = stateManager.getState().gameTime.day;

    stateManager.update(draft => {
      draft.cash += payout;
      draft.transactions.unshift({
        id: `tx_${Date.now()}`,
        timestamp: Date.now(),
        gameTime: draft.gameTime,
        amount: payout,
        type: 'revenue',
        category: 'revenue',
        description: `Срочная продажа авто: ${car.brand} ${car.model} (Прибыль: $${profit.toLocaleString()})`,
        balanceAfter: draft.cash,
      });

      if (draft.automotive) {
        draft.automotive.ownedCars = draft.automotive.ownedCars.filter(c => c.id !== carId);
        draft.automotive.totalFlipsCompleted += 1;
        draft.automotive.totalFlipProfit += profit;
      }
    });

    return {
      success: true,
      payout,
      profit,
      message: `Автомобиль продан за $${payout.toLocaleString()}! Чистая прибыль со сделки: $${profit.toLocaleString()} (ROI: ${Math.round((profit / Math.max(1, car.financials.totalInvested)) * 100)}%)`,
    };
  }

  /**
   * Assigns car to showroom floor
   */
  public assignCarToShowroom(carId: string, dealershipId: string, askingPrice: number): { success: boolean; message: string } {
    const auto = this.getOrCreateState();
    const car = auto.ownedCars.find(c => c.id === carId);
    const dealer = auto.dealerships.find(d => d.id === dealershipId);

    if (!car || !dealer) return { success: false, message: 'Автомобиль или автосалон не найден' };
    if (dealer.carsOnDisplayIds.length >= dealer.capacityCars) {
      return { success: false, message: `В автосалоне "${dealer.name}" нет свободных мест (вместимость ${dealer.capacityCars})` };
    }

    stateManager.update(draft => {
      const dCar = draft.automotive?.ownedCars.find(c => c.id === carId);
      const dDealer = draft.automotive?.dealerships.find(d => d.id === dealershipId);
      if (dCar && dDealer) {
        dCar.status = 'in_showroom';
        dCar.assignedShowroomId = dealershipId;
        dCar.saleAskingPrice = askingPrice;
        dCar.location = `Автосалон "${dDealer.name}"`;
        if (!dDealer.carsOnDisplayIds.includes(carId)) {
          dDealer.carsOnDisplayIds.push(carId);
        }
      }
    });

    return { success: true, message: `Автомобиль выставлен в шоурум "${dealer.name}" по цене $${askingPrice.toLocaleString()}` };
  }

  /**
   * Purchases spare parts into warehouse
   */
  public buyAutoParts(partId: string, quantity: number): { success: boolean; cost: number; message: string } {
    const part = AUTO_PARTS_CATALOG.find(p => p.id === partId);
    if (!part) return { success: false, cost: 0, message: 'Деталь не найдена' };

    const totalCost = part.marketPrice * quantity;
    const state = stateManager.getState();
    if (state.cash < totalCost) {
      return { success: false, cost: 0, message: `Недостаточно средств. Требуется $${totalCost.toLocaleString()}` };
    }

    stateManager.update(draft => {
      draft.cash -= totalCost;
      draft.transactions.unshift({
        id: `tx_${Date.now()}`,
        timestamp: Date.now(),
        gameTime: draft.gameTime,
        amount: -totalCost,
        type: 'expense',
        category: 'inventory',
        description: `Закупка автозапчастей: ${part.name} x${quantity}`,
        balanceAfter: draft.cash,
      });

      if (draft.automotive) {
        draft.automotive.partsWarehouseStock[partId] = (draft.automotive.partsWarehouseStock[partId] || 0) + quantity;
      }
    });

    return {
      success: true,
      cost: totalCost,
      message: `Закуплено ${quantity} шт. детали "${part.name}" на склад!`,
    };
  }

  /**
   * Day Tick Event Handlers: Daily sales in showrooms, workshop customer income, and rent
   */
  public handleDayTick(currentDay: number): void {
    const auto = this.getOrCreateState();

    // 1. Auto Service customer throughput income & rent
    auto.autoWorkshops.forEach(ws => {
      const netDaily = ws.dailyCustomerProfit - ws.dailyRent - ws.dailyMaintenance;
      stateManager.update(draft => {
        draft.cash += netDaily;
        if (netDaily !== 0) {
          draft.transactions.unshift({
            id: `tx_ws_${Date.now()}_${ws.id}`,
            timestamp: Date.now(),
            gameTime: draft.gameTime,
            amount: netDaily,
            type: netDaily > 0 ? 'revenue' : 'expense',
            category: netDaily > 0 ? 'revenue' : 'operating_cost',
            description: `Автосервис "${ws.name}": клиентская прибыль $${ws.dailyCustomerProfit} - аренда $${ws.dailyRent + ws.dailyMaintenance}`,
            balanceAfter: draft.cash,
          });
        }
      });
    });

    // 2. Dealership sales simulation
    auto.dealerships.forEach(dealer => {
      const sold = DealershipSystem.simulateDailySales(dealer, auto.ownedCars, currentDay);
      sold.forEach(s => {
        stateManager.update(draft => {
          draft.cash += s.soldPrice;
          draft.transactions.unshift({
            id: `tx_deal_${Date.now()}_${s.car.id}`,
            timestamp: Date.now(),
            gameTime: draft.gameTime,
            amount: s.soldPrice,
            type: 'revenue',
            category: 'revenue',
            description: `Продажа в автосалоне "${dealer.name}": ${s.car.brand} ${s.car.model} (Прибыль: $${s.profit.toLocaleString()})`,
            balanceAfter: draft.cash,
          });

          if (draft.automotive) {
            draft.automotive.ownedCars = draft.automotive.ownedCars.filter(c => c.id !== s.car.id);
            draft.automotive.totalCarsSoldViaDealerships += 1;
          }
        });
      });

      // Deduct dealership daily expenses
      const expense = dealer.dailyExpense;
      stateManager.update(draft => {
        draft.cash -= expense;
      });
    });

    // 3. Auto-refresh market if needed
    this.refreshUsedMarket();
  }
}

export const automotiveManager = AutomotiveManager.getInstance();
