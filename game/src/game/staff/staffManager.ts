/**
 * Business Empire: Ultimate
 * Central Staff & Automation Management Engine
 */

import { gameState } from '../gameState';
import { economy } from '../economy';
import {
  Employee,
  EmployeeType,
  AutomationLevelId,
  AIManagerSettings,
  AIStrategy,
  StaffSubsystemState,
  StaffAggregatedBonuses,
  TrainingCourse,
} from '../../types/staff';
import {
  EMPLOYEE_ROLES,
  AUTOMATION_LEVELS,
  TRAINING_COURSES,
  generateCandidate,
  generateInitialRecruitmentMarket,
} from './staffCatalog';
import { retailManager } from '../business/retailManager';
import { industrialManager } from '../production/industrialManager';
import { automotiveManager } from '../automotive/automotiveManager';
import { goodsMarket } from '../markets/goodsMarket';

class StaffManager {
  /**
   * Retrieves or bootstraps the staff subsystem state in GameState
   */
  public getOrCreateState(): StaffSubsystemState {
    const raw = gameState.getState() as any;
    if (!raw.staff) {
      const initial: StaffSubsystemState = {
        employees: [
          // Starter Team: 1 Salesperson, 1 Driver
          {
            id: 'emp_starter_sales',
            name: 'Алексей Смирнов',
            type: 'salesperson',
            salary: 110,
            experience: 45,
            skill: 35,
            efficiency: 1.2,
            level: 2,
            morale: 90,
            avatar: '👨‍💼',
            assignedBusinessId: null,
            assignedBusinessName: 'Основной розничный сектор',
            assignedBusinessType: 'retail',
            hiredAtGameDay: 1,
            loyalty: 95,
            totalEarnedSalary: 0,
            perks: ['Прирожденный переговорщик (+15% сбыт)'],
          },
          {
            id: 'emp_starter_driver',
            name: 'Сергей Иванов',
            type: 'driver',
            salary: 95,
            experience: 60,
            skill: 40,
            efficiency: 1.25,
            level: 2,
            morale: 88,
            avatar: '🧔',
            assignedBusinessId: 'wh_starter_main',
            assignedBusinessName: 'Основной склад (Москва)',
            assignedBusinessType: 'warehouse',
            hiredAtGameDay: 1,
            loyalty: 92,
            totalEarnedSalary: 0,
            perks: ['Безаварийное вождение'],
          },
        ],
        marketCandidates: generateInitialRecruitmentMarket(1),
        automationLevel: 'manual',
        unlockedAutomationLevels: ['manual'],
        aiManager: {
          enabled: false,
          strategy: 'balanced',
          modules: {
            autoOrderGoods: true,
            autoSellGoods: true,
            manageInventory: true,
            managePricing: true,
            reallocateCash: false,
          },
          minCashReservePercent: 30,
          maxPriceMarkupPercent: 35,
          safetyStockDays: 3,
          reinvestSurplusIntoFactories: false,
          autoPayHighInterestLoans: true,
          actionLogs: [
            {
              id: 'log_init',
              timestamp: Date.now(),
              gameDay: 1,
              message: 'Нейросетевое ядро AI-менеджера инициализировано в режиме ожидания.',
              type: 'finance',
            },
          ],
        },
        corporateBonusDaily: 0,
        lastMarketRefreshDay: 1,
        stats: {
          totalSalariesPaid: 0,
          totalHires: 2,
          totalPromotions: 0,
          aiActionsExecuted: 0,
        },
      };

      gameState.update((state) => {
        (state as any).staff = initial;
      }, false);

      return initial;
    }

    return raw.staff;
  }

  /**
   * Hires a candidate from the recruitment market
   */
  public hireCandidate(candidateId: string): { success: boolean; message: string; employee?: Employee } {
    const state = this.getOrCreateState();
    const candidateIndex = state.marketCandidates.findIndex((c) => c.id === candidateId);

    if (candidateIndex === -1) {
      return { success: false, message: 'Кандидат уже трудоустроен или отозвал резюме.' };
    }

    const candidate = state.marketCandidates[candidateIndex];
    // Placement fee: 3 days of salary
    const placementCost = candidate.salary * 3;

    if (!economy.canAfford(placementCost)) {
      return {
        success: false,
        message: `Недостаточно средств для агентского рекрутинга (${economy.formatMoney(placementCost)}).`,
      };
    }

    const currentDay = gameState.getState().gameTime.totalDays || 1;

    economy.removeMoney(
      placementCost,
      'Рекрутинг и найм',
      `Найм сотрудника: ${candidate.name} (${EMPLOYEE_ROLES[candidate.type].title})`,
      'expense'
    );

    const hired: Employee = {
      ...candidate,
      hiredAtGameDay: currentDay,
      morale: 100, // Joy of being hired
      loyalty: 85,
      totalEarnedSalary: 0,
    };

    gameState.update((s) => {
      const staff = (s as any).staff as StaffSubsystemState;
      staff.marketCandidates.splice(candidateIndex, 1);
      staff.employees.push(hired);
      staff.stats.totalHires += 1;
    });

    return {
      success: true,
      message: `Сотрудник ${hired.name} успешно принят в штат на должность «${EMPLOYEE_ROLES[hired.type].title}».`,
      employee: hired,
    };
  }

  /**
   * Dismisses an employee from the company
   */
  public fireEmployee(employeeId: string): { success: boolean; message: string } {
    const state = this.getOrCreateState();
    const emp = state.employees.find((e) => e.id === employeeId);

    if (!emp) {
      return { success: false, message: 'Сотрудник не найден в штатном расписании.' };
    }

    // Severance pay: 2 days of salary
    const severance = emp.salary * 2;
    if (economy.canAfford(severance)) {
      economy.removeMoney(
        severance,
        'Выходное пособие',
        `Увольнение сотрудника: ${emp.name}`,
        'expense'
      );
    }

    gameState.update((s) => {
      const staff = (s as any).staff as StaffSubsystemState;
      staff.employees = staff.employees.filter((e) => e.id !== employeeId);
    });

    return {
      success: true,
      message: `Трудовой договор с ${emp.name} расторгнут.`,
    };
  }

  /**
   * Assigns an employee to a specific business, factory, or department
   */
  public assignEmployee(
    employeeId: string,
    businessId: string | null,
    businessName: string,
    businessType: 'retail' | 'factory' | 'car_service' | 'warehouse' | 'trading' | 'headquarters' | 'general'
  ): { success: boolean; message: string } {
    const state = this.getOrCreateState();
    const emp = state.employees.find((e) => e.id === employeeId);

    if (!emp) {
      return { success: false, message: 'Сотрудник не найден.' };
    }

    gameState.update((s) => {
      const staff = (s as any).staff as StaffSubsystemState;
      const target = staff.employees.find((e) => e.id === employeeId);
      if (target) {
        target.assignedBusinessId = businessId;
        target.assignedBusinessName = businessName;
        target.assignedBusinessType = businessType;
      }
    });

    return {
      success: true,
      message: `Сотрудник ${emp.name} назначен на объект «${businessName}».`,
    };
  }

  /**
   * Enrolls an employee in a professional training course
   */
  public trainEmployee(employeeId: string, courseId: string): { success: boolean; message: string } {
    const state = this.getOrCreateState();
    const emp = state.employees.find((e) => e.id === employeeId);
    const course = TRAINING_COURSES.find((c) => c.id === courseId);

    if (!emp || !course) {
      return { success: false, message: 'Некорректный сотрудник или учебная программа.' };
    }

    if (emp.level < course.targetMinLevel) {
      return {
        success: false,
        message: `Для курса «${course.name}» требуется минимум ${course.targetMinLevel}-й уровень сотрудника.`,
      };
    }

    if (!economy.canAfford(course.cost)) {
      return {
        success: false,
        message: `Недостаточно средств на корпоративное обучение (${economy.formatMoney(course.cost)}).`,
      };
    }

    economy.removeMoney(
      course.cost,
      'Корпоративное обучение',
      `Курс «${course.name}» для ${emp.name}`,
      'expense'
    );

    gameState.update((s) => {
      const staff = (s as any).staff as StaffSubsystemState;
      const target = staff.employees.find((e) => e.id === employeeId);
      if (target) {
        target.skill = Math.min(100, target.skill + course.skillBonus);
        target.efficiency = Number((target.efficiency + course.efficiencyBonus).toFixed(2));
        target.morale = Math.min(100, target.morale + course.moraleBonus);
        target.level = Math.min(10, target.level + 1);
        target.salary = Math.round(target.salary * 1.15); // Promotion raise +15%
        staff.stats.totalPromotions += 1;
      }
    });

    return {
      success: true,
      message: `Сотрудник ${emp.name} успешно завершил обучение! Навык +${course.skillBonus}, Эффективность +${Math.round(course.efficiencyBonus * 100)}%, Уровень повышен до ${emp.level + 1}.`,
    };
  }

  /**
   * Pays a direct cash bonus to an employee to raise morale
   */
  public payBonus(employeeId: string, amount: number): { success: boolean; message: string } {
    if (amount <= 0 || !economy.canAfford(amount)) {
      return { success: false, message: 'Недостаточно средств для выплаты премии.' };
    }

    const state = this.getOrCreateState();
    const emp = state.employees.find((e) => e.id === employeeId);
    if (!emp) return { success: false, message: 'Сотрудник не найден.' };

    economy.removeMoney(
      amount,
      'Премиальный фонд',
      `Премия сотруднику: ${emp.name}`,
      'expense'
    );

    const moraleBoost = Math.min(40, Math.round((amount / emp.salary) * 20));

    gameState.update((s) => {
      const staff = (s as any).staff as StaffSubsystemState;
      const target = staff.employees.find((e) => e.id === employeeId);
      if (target) {
        target.morale = Math.min(100, target.morale + moraleBoost);
        target.loyalty = Math.min(100, target.loyalty + 10);
      }
    });

    return {
      success: true,
      message: `Премия ${economy.formatMoney(amount)} выплачена. Мораль ${emp.name} выросла на +${moraleBoost}%!`,
    };
  }

  /**
   * Unlocks an automation level
   */
  public unlockAutomationLevel(levelId: AutomationLevelId): { success: boolean; message: string } {
    const state = this.getOrCreateState();
    const cfg = AUTOMATION_LEVELS.find((l) => l.id === levelId);

    if (!cfg) return { success: false, message: 'Неизвестный уровень автоматизации.' };

    if (state.unlockedAutomationLevels.includes(levelId)) {
      // Already unlocked, just switch active
      gameState.update((s) => {
        const staff = (s as any).staff as StaffSubsystemState;
        staff.automationLevel = levelId;
      });
      return { success: true, message: `Режим «${cfg.name}» активирован.` };
    }

    // Check staff requirements
    if (cfg.requiredStaffRole && cfg.requiredStaffCount) {
      const matchingStaff = state.employees.filter((e) => e.type === cfg.requiredStaffRole);
      if (matchingStaff.length < cfg.requiredStaffCount) {
        const roleName = EMPLOYEE_ROLES[cfg.requiredStaffRole].title;
        return {
          success: false,
          message: `Для разблокировки уровня «${cfg.name}» требуется минимум ${cfg.requiredStaffCount} сотр. на должности «${roleName}» (в наличии: ${matchingStaff.length}).`,
        };
      }
    }

    if (!economy.canAfford(cfg.unlockCost)) {
      return {
        success: false,
        message: `Недостаточно средств для внедрения автоматизации (${economy.formatMoney(cfg.unlockCost)}).`,
      };
    }

    economy.removeMoney(
      cfg.unlockCost,
      'Внедрение автоматизации',
      `Разблокировка уровня: ${cfg.name}`,
      'expense'
    );

    gameState.update((s) => {
      const staff = (s as any).staff as StaffSubsystemState;
      if (!staff.unlockedAutomationLevels.includes(levelId)) {
        staff.unlockedAutomationLevels.push(levelId);
      }
      staff.automationLevel = levelId;
      if (levelId === 'ai_manager' || levelId === 'full_autonomy') {
        staff.aiManager.enabled = true;
      }
    });

    return {
      success: true,
      message: `Уровень автоматизации «${cfg.name}» успешно внедрен и активирован!`,
    };
  }

  /**
   * Updates AI Manager settings and strategy
   */
  public updateAISettings(updates: Partial<AIManagerSettings>): void {
    gameState.update((s) => {
      const staff = (s as any).staff as StaffSubsystemState;
      staff.aiManager = {
        ...staff.aiManager,
        ...updates,
      };

      // Strategy presets adjustments
      if (updates.strategy) {
        if (updates.strategy === 'aggressive') {
          staff.aiManager.minCashReservePercent = 10;
          staff.aiManager.maxPriceMarkupPercent = 55;
          staff.aiManager.safetyStockDays = 1;
          staff.aiManager.reinvestSurplusIntoFactories = true;
        } else if (updates.strategy === 'balanced') {
          staff.aiManager.minCashReservePercent = 30;
          staff.aiManager.maxPriceMarkupPercent = 35;
          staff.aiManager.safetyStockDays = 3;
          staff.aiManager.reinvestSurplusIntoFactories = false;
        } else if (updates.strategy === 'conservative') {
          staff.aiManager.minCashReservePercent = 60;
          staff.aiManager.maxPriceMarkupPercent = 15;
          staff.aiManager.safetyStockDays = 7;
          staff.aiManager.reinvestSurplusIntoFactories = false;
        }
      }
    });
  }

  /**
   * Calculates holding-wide aggregated bonuses from all 10 employee roles
   */
  public getAggregatedBonuses(): StaffAggregatedBonuses {
    const state = this.getOrCreateState();
    const employees = state.employees;

    let totalPayroll = 0;
    let totalMorale = 0;

    let salesWeight = 0;
    let marketerWeight = 0;
    let mechanicWeight = 0;
    let driverWeight = 0;
    let engineerWeight = 0;
    let accountantWeight = 0;
    let traderWeight = 0;
    let analystWeight = 0;
    let managerWeight = 0;
    let directorWeight = 0;

    for (const emp of employees) {
      totalPayroll += emp.salary;
      totalMorale += emp.morale;

      // Effective contribution = efficiency * (morale / 100) * (level multiplier)
      const power = emp.efficiency * (emp.morale / 100);

      switch (emp.type) {
        case 'salesperson':
          salesWeight += power * 0.12; // +12% per standard salesperson
          break;
        case 'marketer':
          marketerWeight += power * 0.2; // +20% traffic per marketer
          break;
        case 'mechanic':
          mechanicWeight += power * 0.15; // -15% repair cost per mechanic
          break;
        case 'driver':
          driverWeight += power * 0.15; // -15% logistics cost per driver
          break;
        case 'engineer':
          engineerWeight += power * 0.15; // +15% capacity per engineer
          break;
        case 'accountant':
          accountantWeight += power * 0.05; // -5% tax / overhead per accountant
          break;
        case 'trader':
          traderWeight += power * 0.18; // -18% commission / +profit per trader
          break;
        case 'analyst':
          analystWeight += power * 0.22; // +22% forecast accuracy
          break;
        case 'manager':
          managerWeight += power * 0.1;
          break;
        case 'director':
          directorWeight += power * 0.25;
          break;
      }
    }

    const count = Math.max(1, employees.length);
    const holdingAverageMorale = Math.round(totalMorale / count);

    // Caps to prevent runaway numbers
    const salesVolumeMultiplier = Number((1.0 + Math.min(1.5, salesWeight + managerWeight * 0.2)).toFixed(2));
    const retailTrafficMultiplier = Number((1.0 + Math.min(2.0, marketerWeight + directorWeight * 0.15)).toFixed(2));
    const carRepairDiscount = Number(Math.min(0.7, mechanicWeight).toFixed(2)); // Max 70% off repair
    const logisticsCostDiscount = Number(Math.min(0.65, driverWeight).toFixed(2)); // Max 65% off logistics
    const factoryCapacityBonus = Number(Math.min(1.2, engineerWeight + managerWeight * 0.15).toFixed(2)); // Max +120%
    const factoryEfficiencyBonus = Number(Math.min(0.5, engineerWeight * 0.4).toFixed(2)); // -50% electricity
    const taxReductionRate = Number(Math.min(0.08, accountantWeight * 0.02).toFixed(3)); // Down to 5% tax from 13%
    const overheadCostDiscount = Number(Math.min(0.35, accountantWeight + managerWeight * 0.1).toFixed(2));
    const tradingCommissionDiscount = Number(Math.min(0.8, traderWeight).toFixed(2)); // Max 80% fee discount
    const tradingProfitBonus = Number(Math.min(0.5, traderWeight * 0.3 + analystWeight * 0.2).toFixed(2));
    const marketForecastAccuracy = Math.min(98, 45 + Math.round(analystWeight * 20));
    const managementSynergyBonus = Number((1.0 + Math.min(0.5, managerWeight)).toFixed(2));
    const directorLeadershipBonus = Number((1.0 + Math.min(0.8, directorWeight)).toFixed(2));

    return {
      salesVolumeMultiplier,
      retailTrafficMultiplier,
      carRepairDiscount,
      logisticsCostDiscount,
      factoryCapacityBonus,
      factoryEfficiencyBonus,
      taxReductionRate,
      overheadCostDiscount,
      tradingCommissionDiscount,
      tradingProfitBonus,
      marketForecastAccuracy,
      managementSynergyBonus,
      directorLeadershipBonus,
      holdingAverageMorale,
      totalDailyPayroll: totalPayroll,
      totalStaffCount: employees.length,
    };
  }

  /**
   * Hourly game loop tick
   */
  public handleHourTick(hour: number): void {
    // Check if AI manager runs hourly micro-optimizations
    const state = this.getOrCreateState();
    if (state.aiManager.enabled && (hour === 9 || hour === 15 || hour === 21)) {
      this.executeAIMicroCycle(hour);
    }
  }

  /**
   * Daily game loop tick (at 00:00)
   */
  public handleDayTick(day: number): void {
    const state = this.getOrCreateState();
    const bonuses = this.getAggregatedBonuses();

    // 1. Pay staff salaries
    if (bonuses.totalDailyPayroll > 0) {
      const payrollPaid = economy.removeMoney(
        bonuses.totalDailyPayroll,
        'Фонд оплаты труда (ФОТ)',
        `Ежедневная выплата зарплаты штату (${state.employees.length} сотр.)`,
        'expense'
      );

      gameState.update((s) => {
        const staff = (s as any).staff as StaffSubsystemState;
        staff.stats.totalSalariesPaid += bonuses.totalDailyPayroll;

        // Update employee stats, loyalty and gradual experience
        for (const emp of staff.employees) {
          emp.totalEarnedSalary += emp.salary;
          emp.experience += 1;

          // Organic skill growth every 30 days of experience
          if (emp.experience % 30 === 0 && emp.skill < 95) {
            emp.skill += 1;
            emp.efficiency = Number((emp.efficiency + 0.02).toFixed(2));
          }

          // If payroll couldn't be paid, morale plummets
          if (!payrollPaid) {
            emp.morale = Math.max(10, emp.morale - 25);
          } else {
            // Natural morale recovery towards 85%
            if (emp.morale < 85) emp.morale = Math.min(85, emp.morale + 2);
          }
        }
      });
    }

    // 2. Candidate market refresh every 3 days
    if (day - state.lastMarketRefreshDay >= 3) {
      gameState.update((s) => {
        const staff = (s as any).staff as StaffSubsystemState;
        staff.marketCandidates = generateInitialRecruitmentMarket(day);
        staff.lastMarketRefreshDay = day;
      });
    }

    // 3. Full daily AI Manager execution
    if (state.aiManager.enabled) {
      this.executeAIDailyStrategy(day);
    }
  }

  /**
   * Executes AI-Manager autonomous decisions
   */
  private executeAIDailyStrategy(gameDay: number): void {
    const raw = gameState.getState() as any;
    const staffState = this.getOrCreateState();
    const settings = staffState.aiManager;

    if (!settings.enabled) return;

    const currentCash = raw.cash || 0;
    const minReserve = (currentCash * settings.minCashReservePercent) / 100;
    const availableCash = Math.max(0, currentCash - minReserve);

    // Module 1: Order Goods for Retail Stores with Low Stock
    if (settings.modules.autoOrderGoods && raw.retailStores && availableCash > 5000) {
      let ordersCount = 0;
      let spentOnOrders = 0;

      for (const store of raw.retailStores) {
        if (store.status !== 'active') continue;
        for (const item of store.inventory || []) {
          const threshold = item.maxStockCapacity * (settings.strategy === 'aggressive' ? 0.4 : settings.strategy === 'balanced' ? 0.3 : 0.2);
          if (item.currentStock < threshold) {
            const orderQty = Math.min(item.maxStockCapacity - item.currentStock, 150);
            const cost = orderQty * item.avgCostPrice;

            if (availableCash - spentOnOrders >= cost && cost > 0) {
              const res = retailManager.directPurchaseToStore(store.id, item.commodityId, orderQty);
              if (res.success) {
                ordersCount += 1;
                spentOnOrders += cost;
              }
            }
          }
        }
      }

      if (ordersCount > 0) {
        this.addAILog(
          gameDay,
          `AI-Менеджер пополнил запасы в розничной сети: оформлено ${ordersCount} поставок на ${economy.formatMoney(spentOnOrders)}.`,
          'order',
          spentOnOrders
        );
      }
    }

    // Module 2: Manage Pricing
    if (settings.modules.managePricing && raw.retailStores) {
      let pricesAdjusted = 0;
      for (const store of raw.retailStores) {
        if (store.status !== 'active') continue;
        const targetMarkup = settings.maxPriceMarkupPercent; // 15%, 35%, 55%
        for (const item of store.inventory || []) {
          const optimalPrice = Math.round(item.avgCostPrice * (1 + targetMarkup / 100));
          if (Math.abs(item.sellingPrice - optimalPrice) > 5) {
            item.sellingPrice = optimalPrice;
            pricesAdjusted += 1;
          }
        }
      }

      if (pricesAdjusted > 0) {
        this.addAILog(
          gameDay,
          `AI оптимизировал цены на ${pricesAdjusted} позиций (стратегия: ${settings.strategy}, наценка +${settings.maxPriceMarkupPercent}%).`,
          'price'
        );
      }
    }

    // Module 3: Cash Reallocation & Debt Management
    if (settings.modules.reallocateCash && settings.autoPayHighInterestLoans && raw.loans && raw.loans.length > 0) {
      // Find loan with highest interest
      const highRateLoan = [...raw.loans].sort((a, b) => b.dailyInterestRate - a.dailyInterestRate)[0];
      if (highRateLoan && availableCash > 10000) {
        const payAmount = Math.min(availableCash * 0.4, highRateLoan.remainingAmount);
        if (payAmount > 1000) {
          economy.removeMoney(
            payAmount,
            'Досрочное погашение займа',
            `AI-менеджер досрочно погасил часть кредита «${highRateLoan.name}»`,
            'loan'
          );
          highRateLoan.remainingAmount -= payAmount;
          this.addAILog(
            gameDay,
            `AI направил излишек ликвидности (${economy.formatMoney(payAmount)}) на досрочное погашение займа с высокой ставкой.`,
            'finance',
            payAmount
          );
        }
      }
    }
  }

  private executeAIMicroCycle(hour: number): void {
    // Micro-optimizations for industrial lines & store supply
    const state = this.getOrCreateState();
    if (!state.aiManager.enabled) return;

    gameState.update((s) => {
      const staff = (s as any).staff as StaffSubsystemState;
      staff.stats.aiActionsExecuted += 1;
    }, false);
  }

  private addAILog(
    gameDay: number,
    message: string,
    type: 'order' | 'sell' | 'price' | 'finance' | 'inventory',
    amount?: number
  ): void {
    gameState.update((s) => {
      const staff = (s as any).staff as StaffSubsystemState;
      staff.aiManager.actionLogs.unshift({
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        gameDay,
        message,
        type,
        amount,
      });

      if (staff.aiManager.actionLogs.length > 40) {
        staff.aiManager.actionLogs = staff.aiManager.actionLogs.slice(0, 40);
      }
    });
  }
}

export const staffManager = new StaffManager();
