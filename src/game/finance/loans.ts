/**
 * Business Empire: Ultimate
 * Corporate Loans, Credit Lines & Debt Financing Subsystem (Foundation)
 */

import { gameState } from '../gameState';
import { economy } from '../economy';
import { Loan } from '../../types/game';

export interface LoanOffer {
  id: string;
  name: string;
  maxAmount: number;
  annualInterestRate: number;
  termDays: number;
  minCreditRating: string;
  description: string;
}

export const LOAN_OFFERS: LoanOffer[] = [
  {
    id: 'loan_starter_credit',
    name: 'Микрокредит для начинающих предпринимателей',
    maxAmount: 20000,
    annualInterestRate: 0.12, // 12% годовых
    termDays: 60,
    minCreditRating: 'B',
    description: 'Быстрый заем без залога для пополнения оборотных средств на раннем этапе.',
  },
  {
    id: 'loan_commercial_expansion',
    name: 'Кредитная линия на масштабирование',
    maxAmount: 100000,
    annualInterestRate: 0.085, // 8.5% годовых
    termDays: 180,
    minCreditRating: 'A',
    description: 'Низкая процентная ставка под залог имеющихся коммерческих активов компании.',
  },
  {
    id: 'loan_syndicated_syndicate',
    name: 'Синдицированный инвестиционный заем',
    maxAmount: 500000,
    annualInterestRate: 0.065, // 6.5% годовых
    termDays: 360,
    minCreditRating: 'AAA',
    description: 'Крупный институциональный заем для поглощений и индустриальных заводов.',
  },
];

class LoansSystem {
  public getAvailableOffers(): LoanOffer[] {
    return LOAN_OFFERS;
  }

  public takeLoan(offer: LoanOffer, requestedAmount: number): { success: boolean; message: string } {
    if (requestedAmount <= 0 || requestedAmount > offer.maxAmount) {
      return { success: false, message: 'Некорректная сумма кредита' };
    }

    const totalInterest = requestedAmount * (offer.annualInterestRate * (offer.termDays / 360));
    const totalToRepay = Math.round(requestedAmount + totalInterest);
    const dailyPayment = Math.round(totalToRepay / offer.termDays);

    const newLoan: Loan = {
      id: `loan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: offer.name,
      principal: requestedAmount,
      remainingAmount: totalToRepay,
      dailyInterestRate: offer.annualInterestRate / 360,
      dailyPayment,
      termDays: offer.termDays,
      daysRemaining: offer.termDays,
    };

    gameState.update((draft) => {
      draft.loans.push(newLoan);
    });

    economy.addMoney(
      requestedAmount,
      'Кредитование',
      `Получен заем: ${offer.name} ($${requestedAmount.toLocaleString()})`,
      'loan'
    );

    return { success: true, message: `Кредит на сумму $${requestedAmount.toLocaleString()} успешно оформлен` };
  }
}

export const loansSystem = new LoansSystem();
