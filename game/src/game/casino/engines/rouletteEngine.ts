/**
 * Business Empire: Ultimate
 * European Roulette Engine & Bet Evaluator
 */

export type RouletteBetType =
  | 'number' // Single straight number 0-36 (35:1)
  | 'red' // Red color (1:1)
  | 'black' // Black color (1:1)
  | 'even' // Even numbers (1:1)
  | 'odd' // Odd numbers (1:1)
  | 'low' // 1-18 (1:1)
  | 'high' // 19-36 (1:1)
  | 'dozen1' // 1st dozen 1-12 (2:1)
  | 'dozen2' // 2nd dozen 13-24 (2:1)
  | 'dozen3' // 3rd dozen 25-36 (2:1)
  | 'col1' // Column 1 (2:1)
  | 'col2' // Column 2 (2:1)
  | 'col3'; // Column 3 (2:1)

export interface RoulettePlacedBet {
  type: RouletteBetType;
  value?: number; // target number if type === 'number'
  amountCC: number;
}

export interface RouletteSpinResult {
  winningNumber: number;
  color: 'red' | 'black' | 'green';
  isEven: boolean;
  totalBetCC: number;
  totalPayoutCC: number;
  netProfitCC: number;
  winningBets: { bet: RoulettePlacedBet; payout: number }[];
}

export const ROULETTE_RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
export const ROULETTE_BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

export class RouletteEngine {
  /**
   * Evaluates all placed bets against a randomly generated winning number (0-36)
   */
  public static spin(bets: RoulettePlacedBet[]): RouletteSpinResult {
    const winningNumber = Math.floor(Math.random() * 37); // 0 to 36
    let color: 'red' | 'black' | 'green' = 'green';
    if (ROULETTE_RED_NUMBERS.includes(winningNumber)) color = 'red';
    else if (ROULETTE_BLACK_NUMBERS.includes(winningNumber)) color = 'black';

    const isEven = winningNumber !== 0 && winningNumber % 2 === 0;
    const isOdd = winningNumber !== 0 && winningNumber % 2 !== 0;
    const isLow = winningNumber >= 1 && winningNumber <= 18;
    const isHigh = winningNumber >= 19 && winningNumber <= 36;
    const isDozen1 = winningNumber >= 1 && winningNumber <= 12;
    const isDozen2 = winningNumber >= 13 && winningNumber <= 24;
    const isDozen3 = winningNumber >= 25 && winningNumber <= 36;
    const isCol1 = winningNumber > 0 && winningNumber % 3 === 1;
    const isCol2 = winningNumber > 0 && winningNumber % 3 === 2;
    const isCol3 = winningNumber > 0 && winningNumber % 3 === 0;

    let totalBetCC = 0;
    let totalPayoutCC = 0;
    const winningBets: RouletteSpinResult['winningBets'] = [];

    for (const b of bets) {
      totalBetCC += b.amountCC;
      let won = false;
      let multiplier = 0;

      switch (b.type) {
        case 'number':
          if (b.value === winningNumber) {
            won = true;
            multiplier = 36; // 35:1 profit + original bet
          }
          break;
        case 'red':
          if (color === 'red') {
            won = true;
            multiplier = 2; // 1:1
          }
          break;
        case 'black':
          if (color === 'black') {
            won = true;
            multiplier = 2;
          }
          break;
        case 'even':
          if (isEven) {
            won = true;
            multiplier = 2;
          }
          break;
        case 'odd':
          if (isOdd) {
            won = true;
            multiplier = 2;
          }
          break;
        case 'low':
          if (isLow) {
            won = true;
            multiplier = 2;
          }
          break;
        case 'high':
          if (isHigh) {
            won = true;
            multiplier = 2;
          }
          break;
        case 'dozen1':
          if (isDozen1) {
            won = true;
            multiplier = 3; // 2:1
          }
          break;
        case 'dozen2':
          if (isDozen2) {
            won = true;
            multiplier = 3;
          }
          break;
        case 'dozen3':
          if (isDozen3) {
            won = true;
            multiplier = 3;
          }
          break;
        case 'col1':
          if (isCol1) {
            won = true;
            multiplier = 3;
          }
          break;
        case 'col2':
          if (isCol2) {
            won = true;
            multiplier = 3;
          }
          break;
        case 'col3':
          if (isCol3) {
            won = true;
            multiplier = 3;
          }
          break;
      }

      if (won) {
        const payout = Math.round(b.amountCC * multiplier);
        totalPayoutCC += payout;
        winningBets.push({ bet: b, payout });
      }
    }

    return {
      winningNumber,
      color,
      isEven,
      totalBetCC,
      totalPayoutCC,
      netProfitCC: totalPayoutCC - totalBetCC,
      winningBets,
    };
  }
}
