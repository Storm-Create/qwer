/**
 * Business Empire: Ultimate
 * Texas Hold'em Poker Engine vs AI
 */

import { PlayingCard } from './blackjackEngine';

export type PokerHandRank =
  | 'High Card'
  | 'One Pair'
  | 'Two Pair'
  | 'Three of a Kind'
  | 'Straight'
  | 'Flush'
  | 'Full House'
  | 'Four of a Kind'
  | 'Straight Flush'
  | 'Royal Flush';

export interface PokerRoundState {
  stage: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished';
  playerCards: PlayingCard[];
  aiCards: PlayingCard[];
  communityCards: PlayingCard[];
  potCC: number;
  playerBetCC: number;
  aiBetCC: number;
  currentBetCC: number;
  playerFolded: boolean;
  aiFolded: boolean;
  winner?: 'player' | 'ai' | 'tie';
  playerHandRank?: PokerHandRank;
  aiHandRank?: PokerHandRank;
  resultMessage: string;
}

export class PokerEngine {
  private static SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
  private static VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  public static createDeck(): PlayingCard[] {
    const deck: PlayingCard[] = [];
    for (const suit of this.SUITS) {
      for (let i = 0; i < this.VALUES.length; i++) {
        const val = this.VALUES[i];
        deck.push({
          suit,
          value: val,
          numericValue: i + 2, // 2 = 2, ..., Ace = 14
          isAce: val === 'A',
        });
      }
    }

    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  }

  public static startRound(blindCC: number): { state: PokerRoundState; deck: PlayingCard[] } {
    const deck = this.createDeck();
    const p1 = deck.pop()!;
    const p2 = deck.pop()!;
    const a1 = deck.pop()!;
    const a2 = deck.pop()!;

    return {
      state: {
        stage: 'preflop',
        playerCards: [p1, p2],
        aiCards: [a1, a2],
        communityCards: [],
        potCC: blindCC * 2,
        playerBetCC: blindCC,
        aiBetCC: blindCC,
        currentBetCC: blindCC,
        playerFolded: false,
        aiFolded: false,
        resultMessage: 'Префлоп: Сделайте Call, Raise или Fold',
      },
      deck,
    };
  }

  public static dealFlop(state: PokerRoundState, deck: PlayingCard[]): { state: PokerRoundState; deck: PlayingCard[] } {
    const d = [...deck];
    d.pop(); // Burn card
    const c1 = d.pop()!;
    const c2 = d.pop()!;
    const c3 = d.pop()!;

    return {
      state: {
        ...state,
        stage: 'flop',
        communityCards: [c1, c2, c3],
        resultMessage: 'Флоп открыт: ваш ход',
      },
      deck: d,
    };
  }

  public static dealTurn(state: PokerRoundState, deck: PlayingCard[]): { state: PokerRoundState; deck: PlayingCard[] } {
    const d = [...deck];
    d.pop(); // Burn card
    const c4 = d.pop()!;

    return {
      state: {
        ...state,
        stage: 'turn',
        communityCards: [...state.communityCards, c4],
        resultMessage: 'Тёрн открыт: оцените шансы',
      },
      deck: d,
    };
  }

  public static dealRiver(state: PokerRoundState, deck: PlayingCard[]): { state: PokerRoundState; deck: PlayingCard[] } {
    const d = [...deck];
    d.pop(); // Burn card
    const c5 = d.pop()!;

    return {
      state: {
        ...state,
        stage: 'river',
        communityCards: [...state.communityCards, c5],
        resultMessage: 'Ривер: финальный раунд торговли',
      },
      deck: d,
    };
  }

  /**
   * Simplified robust 5-card / 7-card poker hand evaluation
   */
  public static evaluatePokerHand(allCards: PlayingCard[]): { rank: PokerHandRank; score: number } {
    if (allCards.length < 5) return { rank: 'High Card', score: 0 };

    const sorted = [...allCards].sort((a, b) => b.numericValue - a.numericValue);
    const valueCounts: Record<number, number> = {};
    const suitCounts: Record<string, number> = {};

    sorted.forEach((c) => {
      valueCounts[c.numericValue] = (valueCounts[c.numericValue] || 0) + 1;
      suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
    });

    const isFlush = Object.values(suitCounts).some((cnt) => cnt >= 5);
    const uniqueValues = Array.from(new Set(sorted.map((c) => c.numericValue))).sort((a, b) => b - a);

    let isStraight = false;
    for (let i = 0; i <= uniqueValues.length - 5; i++) {
      if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
        isStraight = true;
        break;
      }
    }
    // Ace-low straight A, 5, 4, 3, 2
    if (!isStraight && uniqueValues.includes(14) && uniqueValues.includes(5) && uniqueValues.includes(4) && uniqueValues.includes(3) && uniqueValues.includes(2)) {
      isStraight = true;
    }

    const counts = Object.values(valueCounts).sort((a, b) => b - a);

    if (isFlush && isStraight && uniqueValues[0] === 14) return { rank: 'Royal Flush', score: 1000 };
    if (isFlush && isStraight) return { rank: 'Straight Flush', score: 900 };
    if (counts[0] === 4) return { rank: 'Four of a Kind', score: 800 };
    if (counts[0] === 3 && counts[1] >= 2) return { rank: 'Full House', score: 700 };
    if (isFlush) return { rank: 'Flush', score: 600 };
    if (isStraight) return { rank: 'Straight', score: 500 };
    if (counts[0] === 3) return { rank: 'Three of a Kind', score: 400 };
    if (counts[0] === 2 && counts[1] === 2) return { rank: 'Two Pair', score: 300 };
    if (counts[0] === 2) return { rank: 'One Pair', score: 200 };

    return { rank: 'High Card', score: sorted[0].numericValue };
  }

  public static showdown(state: PokerRoundState): PokerRoundState {
    const playerEval = this.evaluatePokerHand([...state.playerCards, ...state.communityCards]);
    const aiEval = this.evaluatePokerHand([...state.aiCards, ...state.communityCards]);

    let winner: 'player' | 'ai' | 'tie' = 'tie';
    let resultMessage = '';

    if (playerEval.score > aiEval.score) {
      winner = 'player';
      resultMessage = `🎉 Вы победили с комбинацией "${playerEval.rank}"! Выигрыш ${state.potCC.toLocaleString()} CC`;
    } else if (playerEval.score < aiEval.score) {
      winner = 'ai';
      resultMessage = `AI победил с комбинацией "${aiEval.rank}". Ваша рука: ${playerEval.rank}.`;
    } else {
      winner = 'tie';
      resultMessage = `Ничья (Split Pot) с комбинацией "${playerEval.rank}". Банк поделен поровну.`;
    }

    return {
      ...state,
      stage: 'showdown',
      winner,
      playerHandRank: playerEval.rank,
      aiHandRank: aiEval.rank,
      resultMessage,
    };
  }
}
