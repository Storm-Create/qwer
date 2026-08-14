/**
 * Business Empire: Ultimate
 * Research, Development & Technology Tree Subsystem (Foundation)
 */

import { gameLoop } from '../gameLoop';
import { gameState } from '../gameState';
import { economy } from '../economy';
import { Technology } from '../../types/game';

class TechnologySystem {
  constructor() {
    // Process ongoing research progress each game hour
    gameLoop.onHour((_time, hourDelta) => {
      this.advanceActiveResearch(hourDelta);
    });
  }

  public getTechnologies(): Technology[] {
    return gameState.getState().technologies;
  }

  public startResearch(techId: string): { success: boolean; message: string } {
    const state = gameState.getState();
    const tech = state.technologies.find((t) => t.id === techId);

    if (!tech) {
      return { success: false, message: 'Технология не найдена' };
    }

    if (tech.researched) {
      return { success: false, message: 'Технология уже исследована' };
    }

    if (!economy.canAfford(tech.cost)) {
      return { success: false, message: 'Недостаточно средств для финансирования R&D' };
    }

    economy.removeMoney(
      tech.cost,
      'НИОКР и Технологии',
      `Запуск исследования: ${tech.name}`,
      'investment'
    );

    gameState.update((draft) => {
      const targetTech = draft.technologies.find((t) => t.id === techId);
      if (targetTech) {
        targetTech.progressHours = 1; // Mark as started
      }
    });

    return { success: true, message: `Исследование «${tech.name}» успешно запущено` };
  }

  private advanceActiveResearch(hourDelta: number): void {
    gameState.update((draft) => {
      for (const tech of draft.technologies) {
        if (!tech.researched && tech.progressHours > 0) {
          tech.progressHours += hourDelta;
          if (tech.progressHours >= tech.researchHours) {
            tech.researched = true;
            tech.progressHours = tech.researchHours;

            draft.transactions.unshift({
              id: `tx_tech_${Date.now()}`,
              timestamp: Date.now(),
              gameTime: { ...draft.gameTime },
              amount: 0,
              type: 'investment',
              category: 'НИОКР Завершен',
              description: `Технология «${tech.name}» успешно внедрена в бизнес-процессы!`,
              balanceAfter: draft.cash,
            });
          }
        }
      }
    }, false);
  }
}

export const technologySystem = new TechnologySystem();
