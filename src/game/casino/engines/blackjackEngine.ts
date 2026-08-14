/**
 * Business Empire: Ultimate
 * Blackjack Mathematical Engine & Dealer Simulator
 */

export interface PlayingCard {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string; // '2'-'10', 'J', 'Q', 'K', 'A'
  numericValue: number; // 2-10, 10 for J/Q/K, 11 for A
  isAce: boolean;
}

export interface BlackjackHand {
  cards: PlayingCard[];
  score: number;
  isBlackjack: boolean;
  isBust: boolean;
  isSoft: boolean;
}

export interface BlackjackRoundState {
  playerHand: BlackjackHand;
  dealerHand: BlackjackHand;
  dealerHiddenCard?: PlayingCard;
  status: 'betting' | 'player_turn' | 'dealer_turn' | 'resolved';
  betAmountCC: number;
  payoutCC: number;
  resultMessage: string;
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
}

export class BlackjackEngine {
  private static SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
  private static VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  /**
   * Creates and shuffles 6 standard 52-card decks
   */
  public static createShuffledShoe(decksCount = 6): PlayingCard[] {
    const deck: PlayingCard[] = [];
    for (let d = 0; d < decksCount; d++) {
      for (const suit of this.SUITS) {
        for (const val of this.VALUES) {
          let numVal = parseInt(val, 10);
          if (['J', 'Q', 'K'].includes(val)) numVal = 10;
          if (val === 'A') numVal = 11;
          deck.push({
            suit,
            value: val,
            numericValue: numVal,
            isAce: val === 'A',
          });
        }
      }
    }

    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  }

  /**
   * Calculates score and soft ace handling
   */
  public static evaluateHand(cards: PlayingCard[]): BlackjackHand {
    let score = 0;
    let aceCount = 0;

    for (const card of cards) {
      score += card.numericValue;
      if (card.isAce) aceCount++;
    }

    let isSoft = aceCount > 0;
    while (score > 21 && aceCount > 0) {
      score -= 10;
      aceCount--;
      if (aceCount === 0) isSoft = false;
    }

    const isBlackjack = cards.length === 2 && score === 21;
    const isBust = score > 21;

    return {
      cards,
      score,
      isBlackjack,
      isBust,
      isSoft,
    };
  }

  /**
   * Initializes a new round
   */
  public static startRound(betCC: number, shoe: PlayingCard[]): { state: BlackjackRoundState; remainingShoe: PlayingCard[] } {
    let currentShoe = shoe.length < 15 ? this.createShuffledShoe() : [...shoe];

    const pCard1 = currentShoe.pop()!;
    const dCard1 = currentShoe.pop()!;
    const pCard2 = currentShoe.pop()!;
    const dHidden = currentShoe.pop()!;

    const playerHand = this.evaluateHand([pCard1, pCard2]);
    const dealerHand = this.evaluateHand([dCard1]);

    let status: BlackjackRoundState['status'] = 'player_turn';
    let payoutCC = 0;
    let resultMessage = 'Ваш ход: Hit, Stand или Double';

    // Instant Natural Blackjack check
    if (playerHand.isBlackjack) {
      const fullDealerHand = this.evaluateHand([dCard1, dHidden]);
      status = 'resolved';
      if (fullDealerHand.isBlackjack) {
        payoutCC = betCC;
        resultMessage = 'Ничья (Push) — у обоих Natural Blackjack!';
      } else {
        payoutCC = Math.round(betCC * 2.5); // 3:2 payout (bet + 1.5x)
        resultMessage = '🔥 NATURAL BLACKJACK! Выплата 3:2!';
      }
      return {
        state: {
          playerHand,
          dealerHand: fullDealerHand,
          status,
          betAmountCC: betCC,
          payoutCC,
          resultMessage,
          canDouble: false,
          canSplit: false,
          canSurrender: false,
        },
        remainingShoe: currentShoe,
      };
    }

    return {
      state: {
        playerHand,
        dealerHand,
        dealerHiddenCard: dHidden,
        status,
        betAmountCC: betCC,
        payoutCC,
        resultMessage,
        canDouble: true,
        canSplit: pCard1.numericValue === pCard2.numericValue,
        canSurrender: true,
      },
      remainingShoe: currentShoe,
    };
  }

  /**
   * Player hits (takes another card)
   */
  public static hit(
    state: BlackjackRoundState,
    shoe: PlayingCard[]
  ): { state: BlackjackRoundState; remainingShoe: PlayingCard[] } {
    const currentShoe = [...shoe];
    const newCard = currentShoe.pop() || this.createShuffledShoe().pop()!;
    const updatedCards = [...state.playerHand.cards, newCard];
    const playerHand = this.evaluateHand(updatedCards);

    let nextState = { ...state, playerHand, canDouble: false, canSurrender: false, canSplit: false };

    if (playerHand.isBust) {
      nextState.status = 'resolved';
      nextState.payoutCC = 0;
      nextState.resultMessage = '💥 Перебор (Bust)! Вы проиграли ставку.';
    } else if (playerHand.score === 21) {
      // Auto-stand on 21
      return this.stand(nextState, currentShoe);
    }

    return { state: nextState, remainingShoe: currentShoe };
  }

  /**
   * Player stands and Dealer plays out turn (dealer hits soft 17)
   */
  public static stand(
    state: BlackjackRoundState,
    shoe: PlayingCard[]
  ): { state: BlackjackRoundState; remainingShoe: PlayingCard[] } {
    const currentShoe = [...shoe];
    let dealerCards = [...state.dealerHand.cards];
    if (state.dealerHiddenCard) {
      dealerCards.push(state.dealerHiddenCard);
    }

    let dealerHand = this.evaluateHand(dealerCards);

    // Dealer AI: Hit on < 17 or soft 17
    while (dealerHand.score < 17 || (dealerHand.score === 17 && dealerHand.isSoft)) {
      const card = currentShoe.pop() || this.createShuffledShoe().pop()!;
      dealerCards.push(card);
      dealerHand = this.evaluateHand(dealerCards);
    }

    const pScore = state.playerHand.score;
    const dScore = dealerHand.score;
    let payoutCC = 0;
    let resultMessage = '';

    if (dealerHand.isBust) {
      payoutCC = state.betAmountCC * 2;
      resultMessage = '🎉 Дилер перебрал (Dealer Bust)! Вы выиграли 1:1!';
    } else if (pScore > dScore) {
      payoutCC = state.betAmountCC * 2;
      resultMessage = `🎉 Победа! (${pScore} против ${dScore} дилера). Выплата 1:1!`;
    } else if (pScore < dScore) {
      payoutCC = 0;
      resultMessage = `Дилер победил (${dScore} против ${pScore}). Вы проиграли.`;
    } else {
      payoutCC = state.betAmountCC;
      resultMessage = `Ничья (Push) со счетом ${pScore}. Ставка возвращена.`;
    }

    return {
      state: {
        ...state,
        dealerHand,
        dealerHiddenCard: undefined,
        status: 'resolved',
        payoutCC,
        resultMessage,
      },
      remainingShoe: currentShoe,
    };
  }

  /**
   * Player doubles down
   */
  public static doubleDown(
    state: BlackjackRoundState,
    shoe: PlayingCard[]
  ): { state: BlackjackRoundState; remainingShoe: PlayingCard[] } {
    const currentShoe = [...shoe];
    const newCard = currentShoe.pop() || this.createShuffledShoe().pop()!;
    const updatedCards = [...state.playerHand.cards, newCard];
    const playerHand = this.evaluateHand(updatedCards);

    const doubledBet = state.betAmountCC * 2;
    const doubledState: BlackjackRoundState = {
      ...state,
      betAmountCC: doubledBet,
      playerHand,
      canDouble: false,
      canSurrender: false,
      canSplit: false,
    };

    if (playerHand.isBust) {
      return {
        state: {
          ...doubledState,
          status: 'resolved',
          payoutCC: 0,
          resultMessage: '💥 Перебор (Bust) после удвоения!',
        },
        remainingShoe: currentShoe,
      };
    }

    return this.stand(doubledState, currentShoe);
  }

  /**
   * Player surrenders (gets 50% bet back)
   */
  public static surrender(state: BlackjackRoundState): BlackjackRoundState {
    return {
      ...state,
      status: 'resolved',
      payoutCC: Math.round(state.betAmountCC * 0.5),
      resultMessage: 'Вы сдались (Surrender). Возвращено 50% ставки.',
    };
  }
}
