/**
 * Business Empire: Ultimate
 * Supplementary Casino & Game Engines:
 * Dice, Baccarat, Wheel of Fortune, Boss Battles, Virtual Racing, Gacha & Arcade
 */

import { CollectionItem, CollectionRarity } from '../../../types/casino';

// ----------------------------------------------------
// 1. DICE ENGINE
// ----------------------------------------------------
export interface DiceRollResult {
  dice1: number;
  dice2: number;
  total: number;
  isDouble: boolean;
  won: boolean;
  payoutCC: number;
  message: string;
}

export class DiceEngine {
  public static roll(
    betCC: number,
    betType: 'over7' | 'under7' | 'exact7' | 'even' | 'odd' | 'doubles'
  ): DiceRollResult {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    const isDouble = d1 === d2;

    let won = false;
    let multiplier = 0;

    switch (betType) {
      case 'over7':
        if (total > 7) { won = true; multiplier = 2.3; }
        break;
      case 'under7':
        if (total < 7) { won = true; multiplier = 2.3; }
        break;
      case 'exact7':
        if (total === 7) { won = true; multiplier = 5.8; }
        break;
      case 'even':
        if (total % 2 === 0) { won = true; multiplier = 1.95; }
        break;
      case 'odd':
        if (total % 2 !== 0) { won = true; multiplier = 1.95; }
        break;
      case 'doubles':
        if (isDouble) { won = true; multiplier = 5.5; }
        break;
    }

    const payoutCC = won ? Math.round(betCC * multiplier) : 0;
    const message = won
      ? `🎲 Выпало [${d1}] + [${d2}] = ${total}. Победа! Выплата: ${payoutCC.toLocaleString()} CC`
      : `🎲 Выпало [${d1}] + [${d2}] = ${total}. Ставка не сыграла.`;

    return { dice1: d1, dice2: d2, total, isDouble, won, payoutCC, message };
  }
}

// ----------------------------------------------------
// 2. BACCARAT ENGINE
// ----------------------------------------------------
export interface BaccaratRoundResult {
  playerCards: number[]; // card values 0-9
  bankerCards: number[];
  playerScore: number;
  bankerScore: number;
  winner: 'player' | 'banker' | 'tie';
  payoutCC: number;
  message: string;
}

export class BaccaratEngine {
  public static play(
    betCC: number,
    betOn: 'player' | 'banker' | 'tie'
  ): BaccaratRoundResult {
    const drawCard = () => {
      const v = Math.floor(Math.random() * 13) + 1; // 1 to 13 (A to K)
      return v >= 10 ? 0 : v; // 10, J, Q, K are 0 points
    };

    let p1 = drawCard();
    let p2 = drawCard();
    let b1 = drawCard();
    let b2 = drawCard();

    let pScore = (p1 + p2) % 10;
    let bScore = (b1 + b2) % 10;

    let pCards = [p1, p2];
    let bCards = [b1, b2];

    // Standard third card rule
    if (pScore < 8 && bScore < 8) {
      if (pScore <= 5) {
        const p3 = drawCard();
        pCards.push(p3);
        pScore = (pScore + p3) % 10;
      }
      if (bScore <= 5) {
        const b3 = drawCard();
        bCards.push(b3);
        bScore = (bScore + b3) % 10;
      }
    }

    let winner: 'player' | 'banker' | 'tie' = 'tie';
    if (pScore > bScore) winner = 'player';
    else if (bScore > pScore) winner = 'banker';

    let payoutCC = 0;
    if (betOn === winner) {
      if (winner === 'player') payoutCC = betCC * 2; // 1:1
      else if (winner === 'banker') payoutCC = Math.round(betCC * 1.95); // 0.95:1 (5% commission)
      else if (winner === 'tie') payoutCC = betCC * 9; // 8:1
    }

    const message = betOn === winner
      ? `🎉 ${winner.toUpperCase()} победил (${pScore} против ${bScore})! Выплата: ${payoutCC.toLocaleString()} CC`
      : `Победил ${winner.toUpperCase()} (${pScore} против ${bScore}). Ставка проиграна.`;

    return { playerCards: pCards, bankerCards: bCards, playerScore: pScore, bankerScore: bScore, winner, payoutCC, message };
  }
}

// ----------------------------------------------------
// 3. WHEEL OF FORTUNE ENGINE
// ----------------------------------------------------
export interface WheelSector {
  label: string;
  multiplier: number;
  isJackpot?: boolean;
  color: string;
}

export const FORTUNE_WHEEL_SECTORS: WheelSector[] = [
  { label: '0x', multiplier: 0, color: 'bg-slate-700' },
  { label: '1.5x', multiplier: 1.5, color: 'bg-blue-600' },
  { label: '2x', multiplier: 2, color: 'bg-emerald-600' },
  { label: '0.5x', multiplier: 0.5, color: 'bg-slate-600' },
  { label: '3x', multiplier: 3, color: 'bg-indigo-600' },
  { label: '5x', multiplier: 5, color: 'bg-purple-600' },
  { label: '0x', multiplier: 0, color: 'bg-slate-700' },
  { label: '2.5x', multiplier: 2.5, color: 'bg-teal-600' },
  { label: '10x', multiplier: 10, color: 'bg-amber-600' },
  { label: '1.2x', multiplier: 1.2, color: 'bg-cyan-600' },
  { label: '20x', multiplier: 20, color: 'bg-rose-600' },
  { label: '👑 MEGA JACKPOT', multiplier: 100, isJackpot: true, color: 'bg-gradient-to-r from-amber-500 to-yellow-300 text-black font-black' },
];

export class WheelEngine {
  public static spin(betCC: number, sectors: WheelSector[] = FORTUNE_WHEEL_SECTORS): { sectorIndex: number; sector: WheelSector; payoutCC: number; message: string } {
    // Weighted wheel spin (RTP ~96.5%)
    const weights = [18, 25, 20, 15, 12, 6, 18, 14, 4, 20, 2, 1];
    const totalW = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * totalW;
    let sectorIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      if (r < weights[i]) {
        sectorIndex = i;
        break;
      }
      r -= weights[i];
    }

    const sector = sectors[sectorIndex];
    const payoutCC = Math.round(betCC * sector.multiplier);
    const message = sector.isJackpot
      ? `👑 ДЖЕКПОТ НА КОЛЕСЕ ФОРТУНЫ! Выигрыш: ${payoutCC.toLocaleString()} CC!`
      : payoutCC > 0
      ? `🎡 Колесо остановилось на секторе [${sector.label}]. Выплата: ${payoutCC.toLocaleString()} CC`
      : `🎡 Сектор [0x]. Попробуйте еще раз!`;

    return { sectorIndex, sector, payoutCC, message };
  }
}

// ----------------------------------------------------
// 4. BOSS BATTLE ENGINE
// ----------------------------------------------------
export interface BossFightResult {
  damageDealt: number;
  isCrit: boolean;
  bossHpRemaining: number;
  bossDefeated: boolean;
  rewardMultiplier: number;
  payoutCC: number;
  message: string;
}

export class BossBattleEngine {
  public static attack(
    betCC: number,
    currentBossHp: number,
    maxBossHp = 10000
  ): BossFightResult {
    const isCrit = Math.random() < 0.25;
    const baseDamage = Math.floor(betCC * (1.2 + Math.random() * 1.5));
    const damageDealt = isCrit ? Math.round(baseDamage * 2.5) : baseDamage;

    const bossHpRemaining = Math.max(0, currentBossHp - damageDealt);
    const bossDefeated = bossHpRemaining === 0;

    let rewardMultiplier = isCrit ? 2.5 : 1.2;
    if (bossDefeated) {
      rewardMultiplier += 10.0; // Huge bonus for defeating raid boss
    }

    const payoutCC = Math.round(betCC * rewardMultiplier);
    const message = bossDefeated
      ? `🔥 БОСС ПОВЕРЖЕН! Вы нанесли ${damageDealt.toLocaleString()} урона и сорвали куш ${payoutCC.toLocaleString()} CC!`
      : isCrit
      ? `⚡ КРИТИЧЕСКИЙ УДАР! Нанесено ${damageDealt.toLocaleString()} урона! Награда: ${payoutCC.toLocaleString()} CC`
      : `⚔️ Атака проведена: ${damageDealt.toLocaleString()} урона. Награда: ${payoutCC.toLocaleString()} CC`;

    return { damageDealt, isCrit, bossHpRemaining, bossDefeated, rewardMultiplier, payoutCC, message };
  }
}

// ----------------------------------------------------
// 5. VIRTUAL RACING ENGINE
// ----------------------------------------------------
export interface VirtualRacer {
  id: string;
  name: string;
  car: string;
  speed: number;
  acceleration: number;
  odds: number; // e.g. 3.5x
  color: string;
  emoji: string;
}

export const VIRTUAL_RACERS: VirtualRacer[] = [
  { id: 'racer_1', name: 'Cyber Phantom', car: 'Apex GT-R', speed: 96, acceleration: 92, odds: 2.8, color: 'text-cyan-400', emoji: '🏎️' },
  { id: 'racer_2', name: 'Tokyo Viper', car: 'Shinobi RX', speed: 94, acceleration: 95, odds: 3.2, color: 'text-rose-400', emoji: '🚗' },
  { id: 'racer_3', name: 'Inferno Devil', car: 'Diablo V12', speed: 98, acceleration: 89, odds: 3.5, color: 'text-amber-400', emoji: '🔥' },
  { id: 'racer_4', name: 'Shadow Ghost', car: 'Stealth EV', speed: 91, acceleration: 97, odds: 4.5, color: 'text-purple-400', emoji: '⚡' },
  { id: 'racer_5', name: 'Underdog Rocket', car: 'Turbo 911', speed: 88, acceleration: 90, odds: 7.0, color: 'text-emerald-400', emoji: '🚀' },
];

export class VirtualRacingEngine {
  public static runRace(
    chosenRacerId: string,
    betCC: number,
    racers: VirtualRacer[] = VIRTUAL_RACERS
  ): { ranking: VirtualRacer[]; playerWon: boolean; payoutCC: number; message: string } {
    // Simulate race scores based on stats + random performance roll
    const scoredRacers = racers.map((r) => {
      const performance = (r.speed * 0.4) + (r.acceleration * 0.4) + (Math.random() * 30);
      return { racer: r, score: performance };
    });

    scoredRacers.sort((a, b) => b.score - a.score);
    const ranking = scoredRacers.map((s) => s.racer);
    const winner = ranking[0];

    const playerWon = winner.id === chosenRacerId;
    const payoutCC = playerWon ? Math.round(betCC * winner.odds) : 0;

    const message = playerWon
      ? `🏁 ПОБЕДА! Ваш гонщик "${winner.name}" финишировал 1-м! Выплата: ${payoutCC.toLocaleString()} CC`
      : `🏁 Победил "${winner.name}". Ваш гонщик занял ${ranking.findIndex((r) => r.id === chosenRacerId) + 1}-е место.`;

    return { ranking, playerWon, payoutCC, message };
  }
}

// ----------------------------------------------------
// 6. GACHA & LOOT BOX ENGINE
// ----------------------------------------------------
export const REWARD_COLLECTION_CATALOG: CollectionItem[] = [
  { id: 'col_avatar_cyber_samurai', name: 'Cyber Samurai Avatar', category: 'avatar', rarity: 'Legendary', bonusType: 'xp_boost', bonusValue: 0.15, icon: '⚔️', description: '+15% к получаемому Casino XP' },
  { id: 'col_avatar_kitsune_queen', name: 'Kitsune Queen Avatar', category: 'avatar', rarity: 'Epic', bonusType: 'luck_boost', bonusValue: 0.05, icon: '🦊', description: '+5% к шансу выигрышных комбинаций' },
  { id: 'col_talisman_gold_dragon', name: 'Imperial Dragon Talisman', category: 'talisman', rarity: 'Mythic', bonusType: 'cashback_boost', bonusValue: 0.08, icon: '🐉', description: '+8% постоянного VIP кэшбэка' },
  { id: 'col_trophy_high_roller', name: 'Diamond High Roller Trophy', category: 'trophy', rarity: 'Legendary', bonusType: 'reputation_boost', bonusValue: 0.10, icon: '🏆', description: '+10% к репутации вашего бизнеса казино' },
  { id: 'col_car_hyper_phantom', name: 'Cyber Phantom Supercar', category: 'car', rarity: 'Mythic', bonusType: 'aesthetic', bonusValue: 0.20, icon: '🏎️', description: 'Уникальный золотой гиперкар для лобби' },
  { id: 'col_skin_neon_matrix', name: 'Matrix Green VIP Skin', category: 'skin', rarity: 'Rare', bonusType: 'xp_boost', bonusValue: 0.05, icon: '💾', description: '+5% Casino XP' },
  { id: 'col_talisman_lucky_clover', name: 'Emerald Clover Charm', category: 'talisman', rarity: 'Common', bonusType: 'luck_boost', bonusValue: 0.02, icon: '🍀', description: '+2% к удаче' },
  { id: 'col_talisman_gold_coin', name: 'Lucky Vegas Chip', category: 'talisman', rarity: 'Uncommon', bonusType: 'xp_boost', bonusValue: 0.03, icon: '🪙', description: '+3% Casino XP' },
];

export class GachaLootBoxEngine {
  public static openChest(
    costCC: number,
    chestType: 'mystery' | 'cyber' | 'dragon' | 'royal'
  ): { item: CollectionItem; instantCashCC: number; message: string } {
    const roll = Math.random();
    let rarity: CollectionRarity = 'Common';

    if (chestType === 'royal' || chestType === 'dragon') {
      if (roll < 0.10) rarity = 'Mythic';
      else if (roll < 0.35) rarity = 'Legendary';
      else if (roll < 0.70) rarity = 'Epic';
      else rarity = 'Rare';
    } else {
      if (roll < 0.02) rarity = 'Mythic';
      else if (roll < 0.08) rarity = 'Legendary';
      else if (roll < 0.25) rarity = 'Epic';
      else if (roll < 0.55) rarity = 'Rare';
      else if (roll < 0.80) rarity = 'Uncommon';
      else rarity = 'Common';
    }

    const availableItems = REWARD_COLLECTION_CATALOG.filter((i) => i.rarity === rarity);
    const item = availableItems.length > 0
      ? availableItems[Math.floor(Math.random() * availableItems.length)]
      : REWARD_COLLECTION_CATALOG[0];

    const instantCashCC = Math.round(costCC * (0.2 + Math.random() * 1.5));
    const message = `🎁 Распакован [${item.rarity.toUpperCase()}] предмет: "${item.name}"! + ${instantCashCC.toLocaleString()} CC бонуса!`;

    return {
      item: { ...item, unlockedAt: Date.now() },
      instantCashCC,
      message,
    };
  }
}
