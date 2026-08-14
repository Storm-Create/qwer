/**
 * Business Empire: Ultimate
 * Crash Game Multiplier Engine (e.g. Aviator / Rocket / Cyberpunk Crash)
 */

export interface CrashRoundHistory {
  id: string;
  crashPoint: number;
  timestamp: number;
}

export class CrashEngine {
  /**
   * Generates a statistically fair crash point with standard 3% house edge (97% RTP).
   * Formula: crashPoint = Math.floor((100 * E) / (E - H)) / 100
   */
  public static generateCrashPoint(): number {
    const r = Math.random();
    // Instant crash at 1.00x on 3% of rounds
    if (r < 0.03) {
      return 1.00;
    }

    // Heavy-tailed Pareto / exponential distribution
    // 97 / (1 - r) scaled
    const point = 0.97 / (1 - r);
    const clamped = Math.max(1.01, Math.min(point, 1000.00));
    return Math.round(clamped * 100) / 100;
  }

  /**
   * Calculates cashout payout
   */
  public static calculateCashout(betCC: number, currentMultiplier: number): number {
    return Math.round(betCC * currentMultiplier);
  }
}
