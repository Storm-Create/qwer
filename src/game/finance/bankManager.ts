/**
 * Business Empire: Ultimate
 * Commercial Banking, Credit Rating, Deposits & Crisis Management Subsystem
 */

import { gameState } from '../gameState';
import { economy } from '../economy';
import {
  CreditRatingGrade,
  CreditScoreReport,
  BankLoan,
  BankDeposit,
  DepositPlan,
  LoanProduct,
  FinancialCrisisStatus,
  BankSubsystemState,
} from '../../types/bank';

export const DEPOSIT_PLANS: DepositPlan[] = [
  {
    id: 'dep_liquid_30',
    name: '«Ликвидный Овернайт»',
    minAmount: 5000,
    annualInterestRate: 0.055, // 5.5% годовых
    termDays: 30,
    earlyWithdrawalFee: 0.0, // Без штрафа
    description: 'Гибкий депозит для управления свободной ликвидностью с возможностью вывода в любой день.',
    badge: 'Высокая ликвидность',
  },
  {
    id: 'dep_growth_90',
    name: '«Капитальный Рост»',
    minAmount: 25000,
    annualInterestRate: 0.088, // 8.8% годовых
    termDays: 90,
    earlyWithdrawalFee: 0.015, // 1.5% штраф
    description: 'Оптимальный баланс высокой доходности и разумного квартального срока фиксации ставки.',
    badge: 'Популярный',
  },
  {
    id: 'dep_corporate_180',
    name: '«Корпоративный Доход»',
    minAmount: 100000,
    annualInterestRate: 0.115, // 11.5% годовых
    termDays: 180,
    earlyWithdrawalFee: 0.025, // 2.5% штраф
    description: 'Полугодовой депозит для крупных корпоративных резервов с повышенной процентной ставкой.',
    badge: 'Высокая ставка',
  },
  {
    id: 'dep_institutional_360',
    name: '«Институциональный Максимум»',
    minAmount: 500000,
    annualInterestRate: 0.145, // 14.5% годовых
    termDays: 360,
    earlyWithdrawalFee: 0.04, // 4.0% штраф
    description: 'Премиальный годовой план с максимальной капитализацией процентов для крупных холдингов.',
    badge: 'Максимальный доход',
  },
];

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'loan_micro',
    name: 'Микрокредит «Быстрый Старт»',
    type: 'micro',
    minRatingRequired: 'B',
    maxAmountMultiplier: 25000,
    baseAnnualRate: 0.135, // 13.5%
    termDays: 45,
    description: 'Мгновенное пополнение оборотных средств без залога и сложного аудита.',
    badge: 'Быстрое одобрение',
    iconName: 'Zap',
  },
  {
    id: 'loan_commercial',
    name: 'Коммерческая Кредитная Линия',
    type: 'commercial',
    minRatingRequired: 'BB',
    maxAmountMultiplier: 150000,
    baseAnnualRate: 0.095, // 9.5%
    termDays: 120,
    description: 'Кредитная линия для закупки оптовых партий товаров и масштабирования автопарка.',
    badge: 'Низкая ставка',
    iconName: 'TrendingUp',
  },
  {
    id: 'loan_mortgage',
    name: 'Ипотечный Инвест-Кредит',
    type: 'mortgage',
    minRatingRequired: 'A',
    maxAmountMultiplier: 750000,
    baseAnnualRate: 0.075, // 7.5%
    termDays: 240,
    description: 'Целевое долгосрочное финансирование для покупки бизнес-центров, торговых центров и складов.',
    badge: 'Под залог активов',
    iconName: 'Building',
  },
  {
    id: 'loan_syndicated',
    name: 'Синдицированный Заем Холдинга',
    type: 'syndicated',
    minRatingRequired: 'AAA',
    maxAmountMultiplier: 5000000,
    baseAnnualRate: 0.055, // 5.5%
    termDays: 360,
    description: 'Крупнейший институциональный заем от консорциума банков для глобальной экспансии.',
    badge: 'VIP Институциональный',
    iconName: 'ShieldCheck',
  },
];

class BankManager {
  private initialized = false;

  public initialize(): void {
    if (this.initialized) return;

    const state = gameState.getState();
    if (!state.bank) {
      gameState.update((draft) => {
        draft.bank = {
          loans: [],
          deposits: [],
          creditScore: 720,
          creditRating: 'A',
          totalLoansTakenCount: 0,
          totalLoansRepaidCount: 0,
          totalDefaultsCount: 0,
          crisis: {
            inCrisis: false,
            graceDaysRemaining: 5,
            maxGraceDays: 5,
            cashDeficit: 0,
            dailyNetCashflow: 0,
            recommendedActions: [],
          },
          lastCalculatedDay: draft.gameTime.totalDays || 1,
        };
      });
    }

    this.initialized = true;
  }

  public getBankState(): BankSubsystemState {
    this.initialize();
    return (
      gameState.getState().bank || {
        loans: [],
        deposits: [],
        creditScore: 700,
        creditRating: 'A',
        totalLoansTakenCount: 0,
        totalLoansRepaidCount: 0,
        totalDefaultsCount: 0,
        crisis: {
          inCrisis: false,
          graceDaysRemaining: 5,
          maxGraceDays: 5,
          cashDeficit: 0,
          dailyNetCashflow: 0,
          recommendedActions: [],
        },
        lastCalculatedDay: 1,
      }
    );
  }

  public getDepositPlans(): DepositPlan[] {
    return DEPOSIT_PLANS;
  }

  public getLoanProducts(): LoanProduct[] {
    return LOAN_PRODUCTS;
  }

  public getActiveLoans(): BankLoan[] {
    this.initialize();
    return gameState.getState().bank?.loans || [];
  }

  public getActiveDeposits(): BankDeposit[] {
    this.initialize();
    return gameState.getState().bank?.deposits || [];
  }

  /**
   * Calculates comprehensive credit score (300 - 850) and detailed financial audit report
   */
  public getCreditScoreReport(): CreditScoreReport {
    this.initialize();
    const state = gameState.getState();
    const bankState = this.getBankState();
    const loans = bankState.loans;
    const deposits = bankState.deposits;

    const totalActiveDebt = loans.reduce((acc, l) => acc + l.remainingDebt, 0);
    const dailyDebtService = loans.reduce((acc, l) => acc + l.payment, 0);
    const totalDepositedCash = deposits.reduce((acc, d) => acc + d.amount, 0);
    const dailyDepositIncome = deposits.reduce((acc, d) => acc + d.dailyInterest, 0);

    const totalAssets = Math.max(1000, state.netWorth);
    const debtToAssetRatio = totalActiveDebt / totalAssets;

    // Estimate daily net revenue
    let estimatedDailyRevenue = 0;
    for (const biz of state.businesses) {
      if (biz.status === 'active') {
        estimatedDailyRevenue += Math.max(0, biz.baseDailyRevenue - biz.baseDailyExpense);
      }
    }
    if (state.realEstate) {
      for (const p of state.realEstate.properties) {
        if (p.isRented) {
          estimatedDailyRevenue += Math.max(0, Math.round(p.rent * (p.occupancy / 100)) - p.maintenance);
        }
      }
    }

    const debtServiceCoverageRatio = dailyDebtService > 0 ? estimatedDailyRevenue / dailyDebtService : 10.0;

    // Score calculation
    let baseScore = 700;

    // Factor 1: Debt to Asset ratio
    if (debtToAssetRatio < 0.15) baseScore += 50;
    else if (debtToAssetRatio < 0.35) baseScore += 20;
    else if (debtToAssetRatio < 0.55) baseScore -= 40;
    else if (debtToAssetRatio < 0.75) baseScore -= 100;
    else baseScore -= 180;

    // Factor 2: Debt Service Coverage
    if (dailyDebtService > 0) {
      if (debtServiceCoverageRatio >= 2.5) baseScore += 40;
      else if (debtServiceCoverageRatio >= 1.2) baseScore += 10;
      else if (debtServiceCoverageRatio >= 0.8) baseScore -= 50;
      else baseScore -= 120;
    }

    // Factor 3: Cash cushion
    if (state.cash > 200000) baseScore += 40;
    else if (state.cash > 50000) baseScore += 20;
    else if (state.cash < 5000) baseScore -= 40;
    if (state.cash < 0) baseScore -= 150;

    // Factor 4: Track record
    baseScore += Math.min(60, bankState.totalLoansRepaidCount * 15);
    baseScore -= bankState.totalDefaultsCount * 80;

    const finalScore = Math.max(300, Math.min(850, Math.round(baseScore)));

    // Rating bracket
    let rating: CreditRatingGrade = 'BBB';
    if (finalScore >= 800) rating = 'AAA';
    else if (finalScore >= 750) rating = 'AA';
    else if (finalScore >= 700) rating = 'A';
    else if (finalScore >= 640) rating = 'BBB';
    else if (finalScore >= 580) rating = 'BB';
    else if (finalScore >= 500) rating = 'B';
    else if (finalScore >= 400) rating = 'CCC';
    else rating = 'D';

    // Risk level
    let riskLevel: 'minimal' | 'low' | 'moderate' | 'elevated' | 'critical' = 'low';
    if (debtToAssetRatio > 0.7 || debtServiceCoverageRatio < 0.8 || state.cash < 0) {
      riskLevel = 'critical';
    } else if (debtToAssetRatio > 0.5 || debtServiceCoverageRatio < 1.2) {
      riskLevel = 'elevated';
    } else if (debtToAssetRatio > 0.3) {
      riskLevel = 'moderate';
    } else if (debtToAssetRatio > 0.1) {
      riskLevel = 'low';
    } else {
      riskLevel = 'minimal';
    }

    const maxCreditLine = Math.max(
      30000,
      Math.round(state.netWorth * (finalScore / 700) * 0.4)
    );

    const factors = [
      {
        title: 'Отношение долга к активам (D/A)',
        impact: (debtToAssetRatio < 0.35 ? 'positive' : debtToAssetRatio > 0.6 ? 'negative' : 'neutral') as 'positive' | 'neutral' | 'negative',
        detail: `Текущая долговая нагрузка: ${(debtToAssetRatio * 100).toFixed(1)}% от стоимости компании`,
      },
      {
        title: 'Коэффициент покрытия долга (DSCR)',
        impact: (debtServiceCoverageRatio >= 1.5 ? 'positive' : debtServiceCoverageRatio < 1.0 ? 'negative' : 'neutral') as 'positive' | 'neutral' | 'negative',
        detail: dailyDebtService > 0 ? `Покрытие: ${debtServiceCoverageRatio.toFixed(2)}x от ежедневных платежей` : 'Долговые обязательства отсутствуют',
      },
      {
        title: 'Ликвидная подушка и резервы',
        impact: (state.cash > 50000 ? 'positive' : state.cash < 0 ? 'negative' : 'neutral') as 'positive' | 'neutral' | 'negative',
        detail: `Доступная ликвидность на счетах: $${Math.floor(state.cash).toLocaleString()}`,
      },
      {
        title: 'Кредитная история',
        impact: (bankState.totalLoansRepaidCount > 0 ? 'positive' : 'neutral') as 'positive' | 'neutral' | 'negative',
        detail: `Погашено кредитов: ${bankState.totalLoansRepaidCount}, просрочек: ${bankState.totalDefaultsCount}`,
      },
    ];

    return {
      rating,
      score: finalScore,
      maxCreditLine,
      debtToAssetRatio,
      debtServiceCoverageRatio,
      riskLevel,
      totalActiveDebt,
      dailyDebtService,
      totalDepositedCash,
      dailyDepositIncome,
      ratingChangeReason: 'Рейтинг рассчитывается в реальном времени на основе финансовой устойчивости.',
      factors,
    };
  }

  public openDeposit(planId: string, amount: number): { success: boolean; message: string } {
    this.initialize();
    const plan = DEPOSIT_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return { success: false, message: 'План депозита не найден' };
    }

    if (amount < plan.minAmount) {
      return {
        success: false,
        message: `Минимальная сумма для вклада «${plan.name}» составляет $${plan.minAmount.toLocaleString()}`,
      };
    }

    const state = gameState.getState();
    if (state.cash < amount) {
      return {
        success: false,
        message: `Недостаточно средств. В наличии $${Math.floor(state.cash).toLocaleString()}`,
      };
    }

    const deducted = economy.removeMoney(
      amount,
      'Банковский депозит',
      `Размещение средств во вклад «${plan.name}» ($${amount.toLocaleString()}) под ${(plan.annualInterestRate * 100).toFixed(1)}%`,
      'investment'
    );

    if (!deducted) {
      return { success: false, message: 'Не удалось провести операцию списания' };
    }

    const dailyInterest = Math.round((amount * plan.annualInterestRate) / 360);

    const newDeposit: BankDeposit = {
      id: `dep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: plan.name,
      planId: plan.id,
      amount,
      interestRate: plan.annualInterestRate,
      duration: plan.termDays,
      daysRemaining: plan.termDays,
      dailyInterest,
      totalInterestEarned: 0,
      createdDay: state.gameTime.totalDays,
      autoRenew: true,
    };

    gameState.update((draft) => {
      if (!draft.bank) {
        this.initialize();
      }
      draft.bank?.deposits.push(newDeposit);
    });

    return {
      success: true,
      message: `Депозит «${plan.name}» на сумму $${amount.toLocaleString()} успешно открыт!`,
    };
  }

  public withdrawDeposit(depositId: string, isEarly = false): { success: boolean; message: string } {
    this.initialize();
    const state = gameState.getState();
    const deposit = state.bank?.deposits.find((d) => d.id === depositId);

    if (!deposit) {
      return { success: false, message: 'Депозит не найден' };
    }

    const plan = DEPOSIT_PLANS.find((p) => p.id === deposit.planId);
    let penalty = 0;
    if (isEarly && deposit.daysRemaining > 0 && plan) {
      penalty = Math.round(deposit.amount * plan.earlyWithdrawalFee);
    }

    const payout = deposit.amount - penalty;

    gameState.update((draft) => {
      if (draft.bank) {
        draft.bank.deposits = draft.bank.deposits.filter((d) => d.id !== depositId);
      }
    });

    economy.addMoney(
      payout,
      'Возврат депозита',
      `Закрытие вклада «${deposit.name}» ($${payout.toLocaleString()}${penalty > 0 ? `, штраф за досрочный вывод: $${penalty.toLocaleString()}` : ''})`,
      'revenue'
    );

    return {
      success: true,
      message: `Депозит закрыт. На счет зачислено $${payout.toLocaleString()}${penalty > 0 ? ` (удержана комиссия $${penalty.toLocaleString()})` : ''}`,
    };
  }

  public toggleDepositAutoRenew(depositId: string): void {
    this.initialize();
    gameState.update((draft) => {
      const dep = draft.bank?.deposits.find((d) => d.id === depositId);
      if (dep) {
        dep.autoRenew = !dep.autoRenew;
      }
    });
  }

  public isRatingSufficient(playerRating: CreditRatingGrade, requiredRating: CreditRatingGrade): boolean {
    const order: CreditRatingGrade[] = ['D', 'CCC', 'B', 'BB', 'BBB', 'A', 'AA', 'AAA'];
    return order.indexOf(playerRating) >= order.indexOf(requiredRating);
  }

  public takeLoan(productId: string, requestedAmount: number): { success: boolean; message: string } {
    this.initialize();
    const product = LOAN_PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      return { success: false, message: 'Кредитный продукт не найден' };
    }

    const report = this.getCreditScoreReport();
    if (!this.isRatingSufficient(report.rating, product.minRatingRequired)) {
      return {
        success: false,
        message: `Для оформления «${product.name}» требуется кредитный рейтинг не ниже ${product.minRatingRequired} (ваш текущий рейтинг: ${report.rating})`,
      };
    }

    const maxAllowed = Math.min(product.maxAmountMultiplier, report.maxCreditLine);
    if (requestedAmount <= 0 || requestedAmount > maxAllowed) {
      return {
        success: false,
        message: `Сумма займа превышает допустимый лимит ($${maxAllowed.toLocaleString()})`,
      };
    }

    // Calculate amortized total repayment
    const totalInterest = requestedAmount * (product.baseAnnualRate * (product.termDays / 360));
    const totalRemainingDebt = Math.round(requestedAmount + totalInterest);
    const dailyPayment = Math.round(totalRemainingDebt / product.termDays);

    const newLoan: BankLoan = {
      id: `loan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: product.name,
      type: product.type,
      principal: requestedAmount,
      interestRate: product.baseAnnualRate,
      duration: product.termDays,
      remainingDebt: totalRemainingDebt,
      payment: dailyPayment,
      daysRemaining: product.termDays,
      takenDay: gameState.getState().gameTime.totalDays,
      totalPaid: 0,
    };

    gameState.update((draft) => {
      if (!draft.bank) {
        this.initialize();
      }
      draft.bank?.loans.push(newLoan);
      if (draft.bank) {
        draft.bank.totalLoansTakenCount += 1;
      }
    });

    economy.addMoney(
      requestedAmount,
      'Банковский кредит',
      `Получен заем «${product.name}» на сумму $${requestedAmount.toLocaleString()} под ${(product.baseAnnualRate * 100).toFixed(1)}% годовых`,
      'loan'
    );

    return {
      success: true,
      message: `Кредит на сумму $${requestedAmount.toLocaleString()} успешно одобрен и зачислен на счет!`,
    };
  }

  public repayLoanEarly(loanId: string): { success: boolean; message: string } {
    this.initialize();
    const state = gameState.getState();
    const loan = state.bank?.loans.find((l) => l.id === loanId);

    if (!loan) {
      return { success: false, message: 'Кредит не найден' };
    }

    const payoffAmount = loan.remainingDebt;
    if (state.cash < payoffAmount) {
      return {
        success: false,
        message: `Недостаточно средств для полного досрочного погашения ($${payoffAmount.toLocaleString()})`,
      };
    }

    const deducted = economy.removeMoney(
      payoffAmount,
      'Досрочное погашение кредита',
      `Полное погашение кредита «${loan.name}» ($${payoffAmount.toLocaleString()})`,
      'expense'
    );

    if (!deducted) {
      return { success: false, message: 'Ошибка при проведении платежа' };
    }

    gameState.update((draft) => {
      if (draft.bank) {
        draft.bank.loans = draft.bank.loans.filter((l) => l.id !== loanId);
        draft.bank.totalLoansRepaidCount += 1;
      }
    });

    return {
      success: true,
      message: `Кредит «${loan.name}» полностью погашен! Кредитный рейтинг повышен.`,
    };
  }

  public restructureLoan(loanId: string): { success: boolean; message: string } {
    this.initialize();
    let loanName = '';
    let newPayment = 0;

    gameState.update((draft) => {
      const loan = draft.bank?.loans.find((l) => l.id === loanId);
      if (loan) {
        // Double remaining days, add small 3% fee to debt, halve daily payment
        loan.daysRemaining = Math.max(30, loan.daysRemaining * 2);
        loan.remainingDebt = Math.round(loan.remainingDebt * 1.03);
        loan.payment = Math.round(loan.remainingDebt / loan.daysRemaining);
        loanName = loan.name;
        newPayment = loan.payment;
      }
    });

    if (!loanName) {
      return { success: false, message: 'Кредит не найден' };
    }

    return {
      success: true,
      message: `Кредит «${loanName}» успешно реструктурирован! Новый ежедневный платеж снижен до $${newPayment.toLocaleString()}/день.`,
    };
  }

  public applyEmergencyBailout(): { success: boolean; message: string } {
    this.initialize();
    const state = gameState.getState();
    if (state.cash >= 0) {
      return { success: false, message: 'Кассовый разрыв отсутствует, экстренная помощь не требуется.' };
    }

    const deficit = Math.abs(state.cash);
    const bailoutAmount = deficit + 15000; // cover deficit plus $15,000 buffer

    const bailoutLoan: BankLoan = {
      id: `loan_bailout_${Date.now()}`,
      name: 'Антикризисный стабилизационный транш',
      type: 'emergency_bailout',
      principal: bailoutAmount,
      interestRate: 0.12,
      duration: 90,
      remainingDebt: Math.round(bailoutAmount * 1.06),
      payment: Math.round((bailoutAmount * 1.06) / 90),
      daysRemaining: 90,
      takenDay: state.gameTime.totalDays,
      totalPaid: 0,
    };

    gameState.update((draft) => {
      if (draft.bank) {
        draft.bank.loans.push(bailoutLoan);
        draft.bank.crisis.inCrisis = false;
        draft.bank.crisis.graceDaysRemaining = 5;
      }
    });

    economy.addMoney(
      bailoutAmount,
      'Стабилизационный транш',
      `Экстренный антикризисный заем ($${bailoutAmount.toLocaleString()}) для устранения дефицита ликвидности`,
      'loan'
    );

    return {
      success: true,
      message: `Стабилизационный транш на сумму $${bailoutAmount.toLocaleString()} зачислен. Финансовый кризис преодолен!`,
    };
  }

  /**
   * Daily Bank update: pays interest on deposits, deducts amortized loan installments, checks bankruptcy/crisis
   */
  public processDailyUpdate(currentDay: number): void {
    this.initialize();
    const state = gameState.getState();

    // 1. Process active deposits (accrue and pay daily interest)
    let totalDepositIncome = 0;
    gameState.update((draft) => {
      if (!draft.bank) return;

      for (let i = draft.bank.deposits.length - 1; i >= 0; i--) {
        const dep = draft.bank.deposits[i];
        dep.daysRemaining -= 1;
        dep.totalInterestEarned += dep.dailyInterest;
        totalDepositIncome += dep.dailyInterest;

        // Matured deposit
        if (dep.daysRemaining <= 0) {
          if (dep.autoRenew) {
            dep.daysRemaining = dep.duration;
          } else {
            // Payout principal
            draft.cash += dep.amount;
            draft.bank.deposits.splice(i, 1);
          }
        }
      }
    });

    if (totalDepositIncome > 0) {
      economy.addMoney(
        totalDepositIncome,
        'Проценты по депозитам',
        `Начислены ежедневные проценты по вкладам ($${totalDepositIncome.toLocaleString()})`,
        'revenue'
      );
    }

    // 2. Process active loans (deduct daily payment)
    let totalLoanPayments = 0;
    gameState.update((draft) => {
      if (!draft.bank) return;

      for (let i = draft.bank.loans.length - 1; i >= 0; i--) {
        const loan = draft.bank.loans[i];
        if (loan.remainingDebt > 0) {
          const installment = Math.min(loan.payment, loan.remainingDebt);
          draft.cash -= installment;
          loan.remainingDebt -= installment;
          loan.totalPaid += installment;
          loan.daysRemaining -= 1;
          totalLoanPayments += installment;
          draft.statistics.totalSpent += installment;
        }

        if (loan.remainingDebt <= 0 || loan.daysRemaining <= 0) {
          draft.bank.loans.splice(i, 1);
          draft.bank.totalLoansRepaidCount += 1;
        }
      }
    });

    if (totalLoanPayments > 0) {
      // Record transaction
      gameState.update((draft) => {
        draft.transactions.unshift({
          id: `tx_${Date.now()}_loan_pay`,
          timestamp: Date.now(),
          gameTime: { ...draft.gameTime },
          amount: totalLoanPayments,
          type: 'expense',
          category: 'Погашение кредитов',
          description: `Ежедневные выплаты по кредитам за день ${currentDay}`,
          balanceAfter: draft.cash,
        });
      });
    }

    // 3. Bankruptcy and Financial Crisis Monitor
    const updatedState = gameState.getState();
    gameState.update((draft) => {
      if (!draft.bank) return;

      if (draft.cash < 0) {
        draft.bank.crisis.inCrisis = true;
        draft.bank.crisis.cashDeficit = Math.abs(draft.cash);
        draft.bank.crisis.graceDaysRemaining = Math.max(0, draft.bank.crisis.graceDaysRemaining - 1);

        // If grace period ran out, auto-liquidate high-cost assets or apply automatic bankruptcy protection restructuring
        if (draft.bank.crisis.graceDaysRemaining <= 0) {
          // If player has real estate, sell one to cover deficit
          if (draft.realEstate && draft.realEstate.properties.length > 0) {
            const prop = draft.realEstate.properties.pop();
            if (prop) {
              const recoveryCash = Math.round(prop.marketValue * 0.9);
              draft.cash += recoveryCash;
              draft.bank.crisis.inCrisis = draft.cash < 0;
              draft.bank.crisis.graceDaysRemaining = 3;
            }
          } else {
            // Restructure: grant emergency buffer
            draft.cash = 2500;
            draft.bank.crisis.inCrisis = false;
            draft.bank.crisis.graceDaysRemaining = 5;
            draft.bank.totalDefaultsCount += 1;
          }
        }
      } else {
        // Recovered
        draft.bank.crisis.inCrisis = false;
        draft.bank.crisis.graceDaysRemaining = 5;
        draft.bank.crisis.cashDeficit = 0;
      }
    });
  }
}

export const bankManager = new BankManager();
