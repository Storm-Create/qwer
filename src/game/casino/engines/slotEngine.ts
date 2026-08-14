/**
 * Business Empire: Ultimate
 * Slot Machine Mathematical Engine & Spin Evaluator
 */

export interface SlotSymbol {
  id: string;
  name: string;
  emoji: string;
  payout3: number; // multiplier for 3 in a row
  payout4: number; // multiplier for 4 in a row
  payout5: number; // multiplier for 5 in a row
  isWild?: boolean;
  isScatter?: boolean;
  isBonus?: boolean;
}

export const STANDARD_SLOT_SYMBOLS: SlotSymbol[] = [
  { id: 'seven', name: '777 Lucky', emoji: '7️⃣', payout3: 20, payout4: 100, payout5: 500 },
  { id: 'diamond', name: 'Diamond', emoji: '💎', payout3: 15, payout4: 60, payout5: 250 },
  { id: 'crown', name: 'Crown', emoji: '👑', payout3: 10, payout4: 40, payout5: 150 },
  { id: 'bell', name: 'Golden Bell', emoji: '🔔', payout3: 8, payout4: 25, payout5: 80 },
  { id: 'bar', name: 'Triple Bar', emoji: '🍫', payout3: 5, payout4: 15, payout5: 50 },
  { id: 'cherry', name: 'Cherry', emoji: '🍒', payout3: 3, payout4: 8, payout5: 25 },
  { id: 'lemon', name: 'Lemon', emoji: '🍋', payout3: 2, payout4: 5, payout5: 15 },
  { id: 'grape', name: 'Grape', emoji: '🍇', payout3: 2, payout4: 5, payout5: 15 },
  { id: 'wild', name: 'Wild Star', emoji: '⭐', payout3: 25, payout4: 150, payout5: 1000, isWild: true },
  { id: 'scatter', name: 'Scatter Coin', emoji: '🪙', payout3: 5, payout4: 20, payout5: 100, isScatter: true },
];

export interface SlotSpinResult {
  reels: string[][]; // 5 reels x 3 rows (symbol IDs)
  winningLines: {
    lineIndex: number;
    symbolId: string;
    count: number;
    payout: number;
  }[];
  totalPayoutCC: number;
  multiplier: number;
  scatterCount: number;
  freeSpinsWon: number;
  isBigWin: boolean;
  isMegaWin: boolean;
  isJackpotWin: boolean;
  jackpotType?: 'mini' | 'major' | 'mega';
}

// 20 standard video slot paylines on 5x3 grid (row index 0, 1, 2 for each of 5 reels)
export const PAYLINES_20: number[][] = [
  [1, 1, 1, 1, 1], // Center line
  [0, 0, 0, 0, 0], // Top line
  [2, 2, 2, 2, 2], // Bottom line
  [0, 1, 2, 1, 0], // V-shape
  [2, 1, 0, 1, 2], // Inverted V
  [0, 0, 1, 2, 2], // Diagonal down
  [2, 2, 1, 0, 0], // Diagonal up
  [1, 0, 0, 0, 1], // Shallow U
  [1, 2, 2, 2, 1], // Shallow inverted U
  [0, 1, 1, 1, 0], // Arch
  [2, 1, 1, 1, 2], // Inverted arch
  [0, 1, 0, 1, 0], // Zig-zag top
  [2, 1, 2, 1, 2], // Zig-zag bottom
  [1, 0, 1, 0, 1], // Wave top
  [1, 2, 1, 2, 1], // Wave bottom
  [0, 0, 1, 0, 0], // Middle dip top
  [2, 2, 1, 2, 2], // Middle rise bottom
  [1, 1, 0, 1, 1], // Peak middle
  [1, 1, 2, 1, 1], // Valley middle
  [0, 2, 0, 2, 0], // Extreme zig-zag
];

export class SlotEngine {
  /**
   * Executes a spin with specified bet and active paylines
   */
  public static spin(
    betPerLine: number,
    activeLinesCount = 20,
    symbols: SlotSymbol[] = STANDARD_SLOT_SYMBOLS,
    rtpTarget = 96.5
  ): SlotSpinResult {
    const totalBet = betPerLine * activeLinesCount;
    const numReels = 5;
    const numRows = 3;

    // Build symbol weight distribution
    const symbolWeights: { sym: SlotSymbol; weight: number }[] = symbols.map((s) => {
      if (s.isWild) return { sym: s, weight: 6 };
      if (s.isScatter) return { sym: s, weight: 8 };
      if (s.payout5 >= 500) return { sym: s, weight: 10 };
      if (s.payout5 >= 150) return { sym: s, weight: 18 };
      return { sym: s, weight: 35 };
    });

    const totalWeight = symbolWeights.reduce((acc, w) => acc + w.weight, 0);

    const pickSymbol = (): SlotSymbol => {
      let r = Math.random() * totalWeight;
      for (const sw of symbolWeights) {
        if (r < sw.weight) return sw.sym;
        r -= sw.weight;
      }
      return symbolWeights[symbolWeights.length - 1].sym;
    };

    // Generate 5x3 reel grid
    const grid: SlotSymbol[][] = [];
    for (let r = 0; r < numReels; r++) {
      const reelColumn: SlotSymbol[] = [];
      for (let row = 0; row < numRows; row++) {
        reelColumn.push(pickSymbol());
      }
      grid.push(reelColumn);
    }

    // Evaluate paylines
    const winningLines: SlotSpinResult['winningLines'] = [];
    let totalWin = 0;
    const linesToEvaluate = PAYLINES_20.slice(0, Math.min(activeLinesCount, PAYLINES_20.length));

    linesToEvaluate.forEach((line, lineIdx) => {
      // Find starting symbol
      let firstSym = grid[0][line[0]];
      let matchCount = 1;
      let targetSym = firstSym;

      // Handle Wild on first position
      for (let reel = 1; reel < numReels; reel++) {
        const currentSym = grid[reel][line[reel]];
        if (targetSym.isWild && !currentSym.isScatter) {
          targetSym = currentSym;
          matchCount++;
        } else if (currentSym.id === targetSym.id || (currentSym.isWild && !targetSym.isScatter)) {
          matchCount++;
        } else {
          break;
        }
      }

      if (matchCount >= 3) {
        let payoutMult = 0;
        if (matchCount === 3) payoutMult = targetSym.payout3;
        else if (matchCount === 4) payoutMult = targetSym.payout4;
        else if (matchCount >= 5) payoutMult = targetSym.payout5;

        const lineWin = Math.round(betPerLine * payoutMult);
        totalWin += lineWin;
        winningLines.push({
          lineIndex: lineIdx,
          symbolId: targetSym.id,
          count: matchCount,
          payout: lineWin,
        });
      }
    });

    // Evaluate Scatters anywhere on the screen
    let scatterCount = 0;
    for (let r = 0; r < numReels; r++) {
      for (let row = 0; row < numRows; row++) {
        if (grid[r][row].isScatter) scatterCount++;
      }
    }

    let freeSpinsWon = 0;
    if (scatterCount >= 3) {
      freeSpinsWon = scatterCount === 3 ? 10 : scatterCount === 4 ? 15 : 25;
      const scatterMultiplier = scatterCount === 3 ? 5 : scatterCount === 4 ? 25 : 100;
      totalWin += Math.round(totalBet * scatterMultiplier);
    }

    // Check Jackpot eligibility (random rare roll on high win or 5 wilds/sevens)
    let isJackpotWin = false;
    let jackpotType: 'mini' | 'major' | 'mega' | undefined = undefined;
    const hasFiveTopSymbols = winningLines.some((l) => l.count === 5 && (l.symbolId === 'seven' || l.symbolId === 'wild'));
    if (hasFiveTopSymbols && Math.random() < 0.35) {
      isJackpotWin = true;
      jackpotType = Math.random() < 0.15 ? 'mega' : Math.random() < 0.4 ? 'major' : 'mini';
    }

    const multiplier = totalBet > 0 ? Math.round((totalWin / totalBet) * 100) / 100 : 0;
    const isBigWin = multiplier >= 15 && multiplier < 50;
    const isMegaWin = multiplier >= 50;

    return {
      reels: grid.map((col) => col.map((s) => s.id)),
      winningLines,
      totalPayoutCC: totalWin,
      multiplier,
      scatterCount,
      freeSpinsWon,
      isBigWin,
      isMegaWin,
      isJackpotWin,
      jackpotType,
    };
  }
}
