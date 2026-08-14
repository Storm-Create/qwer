/**
 * Business Empire: Ultimate
 * Dynamic Macroeconomic Events & Market News Subsystem (Foundation)
 */

import { gameLoop } from '../gameLoop';
import { gameState } from '../gameState';
import { GameEvent } from '../../types/game';

export const EVENT_POOL: Omit<GameEvent, 'id' | 'timestamp' | 'daysLeft'>[] = [
  {
    title: 'Технологический бум',
    description: 'Инновационный прорыв в сфере чипов увеличивает рыночный спрос на электронику и сырье.',
    type: 'market',
    impactDurationDays: 14,
    multiplierEffects: { techDemand: 1.25, stockTechBonus: 0.12 },
  },
  {
    title: 'Налоговые каникулы для МСП',
    description: 'Государственная программа поддержки снижает операционную нагрузку на бизнес на 10%.',
    type: 'regulatory',
    impactDurationDays: 30,
    multiplierEffects: { expenseReduction: 0.1 },
  },
  {
    title: 'Потребительский ажиотаж',
    description: 'Сезонный всплеск потребительской уверенности стимулирует розничную торговлю на 20%.',
    type: 'opportunity',
    impactDurationDays: 10,
    multiplierEffects: { retailRevenueBonus: 0.2 },
  },
];

class EventsSystem {
  constructor() {
    gameLoop.onDay(() => {
      this.updateActiveEvents();
      this.rollRandomEventChance();
    });
  }

  public getActiveEvents(): GameEvent[] {
    return gameState.getState().events;
  }

  private updateActiveEvents(): void {
    gameState.update((draft) => {
      for (let i = draft.events.length - 1; i >= 0; i--) {
        draft.events[i].daysLeft -= 1;
        if (draft.events[i].daysLeft <= 0) {
          draft.events.splice(i, 1);
        }
      }
    }, false);
  }

  private rollRandomEventChance(): void {
    const currentEvents = gameState.getState().events;
    // Max 2 simultaneous events, ~8% chance per day
    if (currentEvents.length < 2 && Math.random() < 0.08) {
      const template = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
      const newEvent: GameEvent = {
        id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: template.title,
        description: template.description,
        type: template.type,
        impactDurationDays: template.impactDurationDays,
        daysLeft: template.impactDurationDays,
        multiplierEffects: { ...template.multiplierEffects },
        timestamp: Date.now(),
      };

      gameState.update((draft) => {
        draft.events.push(newEvent);
      });
    }
  }
}

export const eventsSystem = new EventsSystem();
