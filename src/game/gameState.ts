/**
 * Business Empire: Ultimate
 * Centralized Game State Manager
 */

import { INITIAL_GAME_STATE } from './constants';
import { GameState, GameTime, TimeSpeed } from '../types/game';

type StateListener = (state: GameState) => void;

class StateManager {
  private state: GameState;
  private listeners: Set<StateListener> = new Set();

  constructor() {
    this.state = JSON.parse(JSON.stringify(INITIAL_GAME_STATE));
  }

  /**
   * Returns current game state snapshot
   */
  public getState(): Readonly<GameState> {
    return this.state;
  }

  /**
   * Subscribes a callback to state change events
   */
  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifies all subscribers about state change
   */
  public notify(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Error in state subscriber:', err);
      }
    }
  }

  /**
   * Direct state replacement (used by Save/Load system)
   */
  public setState(newState: GameState): void {
    this.state = newState;
    this.notify();
  }

  /**
   * Partial updater function
   */
  public update(updater: (draft: GameState) => void, shouldNotify = true): void {
    updater(this.state);
    if (shouldNotify) {
      this.notify();
    }
  }

  /**
   * Resets game state to initial defaults
   */
  public reset(): void {
    this.state = JSON.parse(JSON.stringify(INITIAL_GAME_STATE));
    this.state.lastSavedTimestamp = Date.now();
    this.notify();
  }

  /**
   * Updates game time speed (0 = Pause, 1, 2, 4, 8)
   */
  public setTimeSpeed(speed: TimeSpeed): void {
    this.state.timeSpeed = speed;
    this.notify();
  }

  /**
   * Advances game time by delta hours
   */
  public advanceTime(hoursDelta = 1): { dayChanged: boolean; monthChanged: boolean; yearChanged: boolean } {
    let dayChanged = false;
    let monthChanged = false;
    let yearChanged = false;

    const time = this.state.gameTime;
    time.hour += hoursDelta;
    time.totalHours += hoursDelta;

    while (time.hour >= 24) {
      time.hour -= 24;
      time.day += 1;
      time.totalDays += 1;
      dayChanged = true;

      if (time.day > 30) {
        time.day = 1;
        time.month += 1;
        monthChanged = true;

        if (time.month > 12) {
          time.month = 1;
          time.year += 1;
          yearChanged = true;
        }
      }
    }

    return { dayChanged, monthChanged, yearChanged };
  }
}

export const gameState = new StateManager();
export const stateManager = gameState;
