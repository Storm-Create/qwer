/**
 * Business Empire: Ultimate
 * Banking, Loans, Deposits, Credit Rating & Crisis Types
 */

export type CreditRatingGrade = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'D';

export type FinancialRiskLevel = 'minimal' | 'low' | 'moderate' | 'elevated' | 'critical';

export interface BankLoan {
  id: string;
  name: string;
  type: 'micro' | 'commercial' | 'mortgage' | 'syndicated' | 'emergency_bailout';
  principal: number; // initial borrowed amount
  interestRate: number; // annual rate e.g. 0.12 (12%)
  duration: number; // term in days (e.g. 60, 180, 360)
  remainingDebt: number; // total remaining balance to repay
  payment: number; // daily amortized payment
  daysRemaining: number;
  takenDay: number;
  totalPaid: number;
}

export interface LoanProduct {
  id: string;
  name: string;
  type: 'micro' | 'commercial' | 'mortgage' | 'syndicated';
  minRatingRequired: CreditRatingGrade;
  maxAmountMultiplier: number; // multiplier of Net Worth or fixed max
  baseAnnualRate: number; // e.g. 0.08 (8%)
  termDays: number;
  description: string;
  badge: string;
  iconName: string;
}

export interface BankDeposit {
  id: string;
  name: string;
  planId: string;
  amount: number;
  interestRate: number; // annual rate e.g. 0.095 (9.5%)
  duration: number; // term in days (e.g. 30, 90, 180, 360)
  daysRemaining: number;
  dailyInterest: number;
  totalInterestEarned: number;
  createdDay: number;
  autoRenew: boolean;
}

export interface DepositPlan {
  id: string;
  name: string;
  minAmount: number;
  annualInterestRate: number; // e.g. 0.065
  termDays: number;
  earlyWithdrawalFee: number; // e.g. 0.02 (2% penalty on principal)
  description: string;
  badge: string;
}

export interface CreditScoreReport {
  rating: CreditRatingGrade;
  score: number; // 300 to 850
  maxCreditLine: number;
  debtToAssetRatio: number; // Total Debt / Total Assets
  debtServiceCoverageRatio: number; // Net Daily Revenue / Daily Debt Payments
  riskLevel: FinancialRiskLevel;
  totalActiveDebt: number;
  dailyDebtService: number;
  totalDepositedCash: number;
  dailyDepositIncome: number;
  ratingChangeReason: string;
  factors: {
    title: string;
    impact: 'positive' | 'neutral' | 'negative';
    detail: string;
  }[];
}

export interface FinancialCrisisStatus {
  inCrisis: boolean;
  graceDaysRemaining: number; // e.g. 5 days to get cash >= 0
  maxGraceDays: number;
  cashDeficit: number;
  dailyNetCashflow: number;
  recommendedActions: {
    id: string;
    title: string;
    description: string;
    type: 'restructure' | 'liquidate_stock' | 'liquidate_property' | 'emergency_loan' | 'state_bailout';
  }[];
}

export interface BankSubsystemState {
  loans: BankLoan[];
  deposits: BankDeposit[];
  creditScore: number;
  creditRating: CreditRatingGrade;
  totalLoansTakenCount: number;
  totalLoansRepaidCount: number;
  totalDefaultsCount: number;
  crisis: FinancialCrisisStatus;
  lastCalculatedDay: number;
}
