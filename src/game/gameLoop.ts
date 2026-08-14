/**
 * Business Empire: Ultimate
 * Central Unified Game Loop Engine
 */

import { gameState } from './gameState';
import { economy } from './economy';
import { MS_PER_GAME_HOUR } from './constants';
import { GameTime, TimeSpeed } from '../types/game';
import { realEstateManager } from './realEstate/realEstateManager';
import { bankManager } from './finance/bankManager';
import { casesManager } from './cases/casesManager';
import { esportsManager } from './esports/esportsManager';

type SystemHook = (gameTime: GameTime, hourDelta: number) => void;

class GameLoopEngine {
  private isRunning = false;
  private animationFrameId: number | null = null;
  private lastFrameTimestamp = 0;
  private accumulatedMs = 0;

  // Subsystem lifecycle hooks
  private hourlyHooks: Set<SystemHook> = new Set();
  private dailyHooks: Set<SystemHook> = new Set();
  private monthlyHooks: Set<SystemHook> = new Set();

  /**
   * Registers a subsystem hook called every in-game hour
   */
  public onHour(hook: SystemHook): () => void {
    this.hourlyHooks.add(hook);
    return () => this.hourlyHooks.delete(hook);
  }

  /**
   * Registers a subsystem hook called every in-game day (at 00:00)
   */
  public onDay(hook: SystemHook): () => void {
    this.dailyHooks.add(hook);
    return () => this.dailyHooks.delete(hook);
  }

  /**
   * Registers a subsystem hook called every in-game month (Day 1)
   */
  public onMonth(hook: SystemHook): () => void {
    this.monthlyHooks.add(hook);
    return () => this.monthlyHooks.delete(hook);
  }

  /**
   * Starts the central game loop
   */
  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFrameTimestamp = performance.now();
    this.accumulatedMs = 0;

    const loop = (currentTimestamp: number) => {
      if (!this.isRunning) return;

      const deltaMs = Math.min(currentTimestamp - this.lastFrameTimestamp, 2000); // Guard against massive background tab lag
      this.lastFrameTimestamp = currentTimestamp;

      const state = gameState.getState();
      const speed = state.timeSpeed;

      if (speed > 0) {
        // Effective ms threshold per game hour adjusted by speed
        const effectiveMsPerHour = MS_PER_GAME_HOUR / speed;
        this.accumulatedMs += deltaMs;

        // Process discrete game hours
        while (this.accumulatedMs >= effectiveMsPerHour) {
          this.accumulatedMs -= effectiveMsPerHour;
          this.processGameHourTick();
        }
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Stops the central game loop
   */
  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Updates game speed
   */
  public setSpeed(speed: TimeSpeed): void {
    gameState.setTimeSpeed(speed);
  }

  /**
   * Toggles pause state
   */
  public togglePause(): void {
    const currentSpeed = gameState.getState().timeSpeed;
    if (currentSpeed === 0) {
      gameState.setTimeSpeed(1);
    } else {
      gameState.setTimeSpeed(0);
    }
  }

  /**
   * Processes a single game hour tick across all connected subsystems
   */
  private processGameHourTick(): void {
    const { dayChanged, monthChanged, yearChanged } = gameState.advanceTime(1);
    const currentTime = gameState.getState().gameTime;

    // Execute hourly subsystem hooks
    try {
      casesManager.handleHourTick(currentTime.totalHours);
      esportsManager.handleHourTick(currentTime.totalHours);
    } catch (err) {
      console.error('Error updating cases/esports subsystem:', err);
    }

    for (const hook of this.hourlyHooks) {
      try {
        hook(currentTime, 1);
      } catch (err) {
        console.error('Error in hourly game hook:', err);
      }
    }

    // If day rolled over (midnight)
    if (dayChanged) {
      this.processDayRollover(currentTime);
    }

    // If month rolled over
    if (monthChanged) {
      for (const hook of this.monthlyHooks) {
        try {
          hook(currentTime, 1);
        } catch (err) {
          console.error('Error in monthly game hook:', err);
        }
      }
    }

    // Notify UI subscribers on tick
    gameState.notify();
  }

  /**
   * Processes daily financial accounting, loan repayments, and metrics
   */
  private processDayRollover(currentTime: GameTime): void {
    const state = gameState.getState();

    // 1. Process active businesses daily revenue & expenses
    let dailyBizRevenue = 0;
    let dailyBizExpense = 0;

    for (const biz of state.businesses) {
      if (biz.status === 'active') {
        const revenue = Math.round(biz.baseDailyRevenue * (1 + biz.level * 0.15));
        const expense = Math.round(biz.baseDailyExpense);
        dailyBizRevenue += revenue;
        dailyBizExpense += expense;
      }
    }

    if (dailyBizRevenue > 0) {
      economy.addMoney(
        dailyBizRevenue,
        'Бизнес-доход',
        `Выручка предприятий за день ${currentTime.day}`,
        'revenue'
      );
    }

    if (dailyBizExpense > 0) {
      economy.removeMoney(
        dailyBizExpense,
        'Операционные расходы',
        `Расходы предприятий за день ${currentTime.day}`,
        'expense'
      );
    }

    // 2. Process real estate rentals, market shifts & maintenance
    realEstateManager.processDailyUpdate(currentTime.totalDays);
    
    const realEstateState = gameState.getState().realEstate;
    let rentIncome = 0;
    let propertyMaint = 0;
    if (realEstateState && realEstateState.properties.length > 0) {
      for (const prop of realEstateState.properties) {
        if (prop.isRented) {
          const effectiveOccupancyRate = (prop.occupancy / 100) * (prop.condition / 100);
          rentIncome += Math.round(prop.rent * effectiveOccupancyRate);
        }
        propertyMaint += prop.maintenance;
      }
    } else {
      for (const prop of state.properties) {
        if (prop.isRented) {
          rentIncome += prop.rentalIncomeDaily;
        }
        propertyMaint += prop.maintenanceDaily;
      }
    }

    if (rentIncome > 0) {
      economy.addMoney(
        rentIncome,
        'Аренда недвижимости',
        `Арендные поступления от объектов за день ${currentTime.day}`,
        'revenue'
      );
    }

    if (propertyMaint > 0) {
      economy.removeMoney(
        propertyMaint,
        'Обслуживание недвижимости',
        `Эксплуатационные расходы за день ${currentTime.day}`,
        'expense'
      );
    }

    // 3. Process warehouse rent, maintenance, storage costs, trucks & employees
    let warehouseDailyTotal = 0;
    for (const w of state.warehouses) {
      const rent = w.rent ?? 40;
      const maint = w.maintenance ?? 20;
      const storageFee = w.storageCostDaily ?? Math.round((w.usedCapacity || 0) * 0.05);
      warehouseDailyTotal += (rent + maint + storageFee);
    }

    let fleetExpense = 0;
    if (state.trucks) {
      for (const t of state.trucks) {
        fleetExpense += t.maintenanceDaily;
      }
    }
    for (const car of state.cars) {
      fleetExpense += car.maintenanceCostDaily;
    }

    let employeeSalaries = 0;
    for (const emp of state.employees) {
      employeeSalaries += emp.salaryDaily;
    }

    const storageAndVehiclesExpense = warehouseDailyTotal + fleetExpense + employeeSalaries;

    if (storageAndVehiclesExpense > 0) {
      economy.removeMoney(
        storageAndVehiclesExpense,
        'Складские и логистические расходы',
        `Аренда/содержание складов ($${warehouseDailyTotal}), автопарк ($${fleetExpense}), персонал ($${employeeSalaries}) за день ${currentTime.day}`,
        'expense'
      );
    }

    // 4. Process banking subsystem (loans amortization, deposit interest, crisis monitor)
    bankManager.processDailyUpdate(currentTime.totalDays);

    if (state.loans && state.loans.length > 0) {
      gameState.update((draft) => {
        for (let i = draft.loans.length - 1; i >= 0; i--) {
          const loan = draft.loans[i];
          if (loan.remainingAmount > 0) {
            const payment = Math.min(loan.dailyPayment, loan.remainingAmount);
            if (draft.cash >= payment) {
              draft.cash -= payment;
              loan.remainingAmount -= payment;
              loan.daysRemaining -= 1;
              draft.statistics.totalSpent += payment;
            }
          }
          if (loan.remainingAmount <= 0 || loan.daysRemaining <= 0) {
            draft.loans.splice(i, 1);
          }
        }
      });
    }

    // 5. Update statistics and capture financial snapshot for chart
    gameState.update((draft) => {
      draft.statistics.daysPlayed += 1;
    });

    economy.captureSnapshot();

    // Process Cases subsystem daily rollover (royalties, collection progress)
    try {
      casesManager.handleDayTick(currentTime.day);
      esportsManager.handleDayTick(currentTime.day);
    } catch (err) {
      console.error('Error in cases/esports daily tick:', err);
    }

    // 6. Execute registered daily hooks
    for (const hook of this.dailyHooks) {
      try {
        hook(currentTime, 1);
      } catch (err) {
        console.error('Error in daily game hook:', err);
      }
    }
  }
}

export const gameLoop = new GameLoopEngine();
