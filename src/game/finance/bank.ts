/**
 * Business Empire: Ultimate
 * Commercial Banking, Deposits & Liquidity Subsystem (Foundation)
 */

import { gameState } from '../gameState';
import { economy } from '../economy';

export interface BankDepositPlan {
  id: string;
  name: string;
  minDeposit: number;
  annualInterestRate: number; // e.g. 0.065 for 6.5%
  termMonths: number;
  earlyWithdrawalPenalty: number;
}

export const DEPOSIT_PLANS: BankDepositPlan[] = [
  {
    id: 'dep_flexible',
    name: 'Ликвидный Овернайт',
    minDeposit: 10000,
    annualInterestRate: 0.045, // 4.5% годовых
    termMonths: 1,
    earlyWithdrawalPenalty: 0.0,
  },
  {
    id: 'dep_strategic',
    name: 'Капитальный Рост',
    minDeposit: 50000,
    annualInterestRate: 0.082, // 8.2% годовых
    termMonths: 6,
    earlyWithdrawalPenalty: 0.02,
  },
];

class BankSystem {
  public getDepositPlans(): BankDepositPlan[] {
    return DEPOSIT_PLANS;
  }
}

export const bankSystem = new BankSystem();
