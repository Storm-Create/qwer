/**
 * Business Empire: Ultimate
 * Corporation, Holding Structure & IPO Subsystem (Foundation)
 */

import { gameState } from '../gameState';
import { CorporationState } from '../../types/game';

class CorporationSystem {
  public getCorporationInfo(): CorporationState {
    return gameState.getState().corporation;
  }

  public renameCorporation(newName: string): { success: boolean; message: string } {
    if (!newName.trim()) {
      return { success: false, message: 'Название корпорации не может быть пустым' };
    }

    gameState.update((draft) => {
      draft.corporation.name = newName.trim();
    });

    return { success: true, message: 'Название корпорации успешно обновлено' };
  }
}

export const corporationSystem = new CorporationSystem();
