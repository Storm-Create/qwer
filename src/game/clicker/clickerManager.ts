/**
 * Business Empire: Ultimate
 * Clicker & Boosting Engine
 */

import { gameState } from '../gameState';
import { economy } from '../economy';
import { ClickerSubsystemState } from '../../types/game';

export interface ClickResult {
  amount: number;
  isCritical: boolean;
  multiplier: number;
}

export interface ClickerUpgrade {
  id: 'power' | 'crit' | 'auto' | 'synergy';
  name: string;
  description: string;
  level: number;
  cost: number;
  bonusText: string;
}

class ClickerManager {
  public getOrCreateState(): ClickerSubsystemState {
    const current = gameState.getState().clicker;
    if (current) return current;

    const initial: ClickerSubsystemState = {
      clickPowerLevel: 1,
      criticalChanceLevel: 0,
      autoClickerLevel: 0,
      synergyLevel: 0,
      totalClicks: 0,
      totalClickEarnings: 0,
    };

    gameState.update((draft) => {
      draft.clicker = initial;
    });

    return initial;
  }

  public calculateClickAmount(): ClickResult {
    const state = this.getOrCreateState();
    const currentFinancials = economy.getFinancialBreakdown();
    
    // Base formula
    const baseVal = 25 + (state.clickPowerLevel - 1) * 35;
    const synergyBonus = 1 + (state.synergyLevel * 0.08) + Math.min(1.5, currentFinancials.dailyProfit > 0 ? (currentFinancials.dailyProfit / 50000) * 0.1 : 0);
    
    const critChance = Math.min(0.60, 0.05 + state.criticalChanceLevel * 0.04);
    const isCritical = Math.random() < critChance;
    const critMultiplier = isCritical ? (2.5 + state.criticalChanceLevel * 0.3) : 1;

    const totalAmount = Math.round(baseVal * synergyBonus * critMultiplier);

    return {
      amount: totalAmount,
      isCritical,
      multiplier: Number(critMultiplier.toFixed(1)),
    };
  }

  public executeClick(): ClickResult {
    const res = this.calculateClickAmount();
    
    economy.addMoney(
      res.amount,
      'Бизнес-бустинг & Кликер',
      res.isCritical ? `Критический клик-буст (+${res.amount})` : `Клик-буст (+${res.amount})`,
      'revenue'
    );

    gameState.update((draft) => {
      if (!draft.clicker) {
        draft.clicker = {
          clickPowerLevel: 1,
          criticalChanceLevel: 0,
          autoClickerLevel: 0,
          synergyLevel: 0,
          totalClicks: 0,
          totalClickEarnings: 0,
        };
      }
      draft.clicker.totalClicks += 1;
      draft.clicker.totalClickEarnings += res.amount;
    });

    return res;
  }

  public getUpgrades(): ClickerUpgrade[] {
    const state = this.getOrCreateState();

    return [
      {
        id: 'power',
        name: 'Мощность клика',
        description: 'Увеличивает базовую доходность каждого касания',
        level: state.clickPowerLevel,
        cost: Math.round(300 * Math.pow(1.55, state.clickPowerLevel - 1)),
        bonusText: `+$${35 + state.clickPowerLevel * 10} к клику`,
      },
      {
        id: 'crit',
        name: 'Критический драйв',
        description: 'Повышает шанс и множитель критической сделки',
        level: state.criticalChanceLevel,
        cost: Math.round(1200 * Math.pow(1.75, state.criticalChanceLevel)),
        bonusText: `+4% шанс, +0.3x множитель`,
      },
      {
        id: 'auto',
        name: 'AI-Автокликер',
        description: 'Генерирует фоновую прибыль каждый игровой час',
        level: state.autoClickerLevel,
        cost: Math.round(2500 * Math.pow(1.9, state.autoClickerLevel)),
        bonusText: `+$${Math.round(150 * (state.autoClickerLevel + 1))}/час`,
      },
      {
        id: 'synergy',
        name: 'Корпоративная синергия',
        description: 'Увеличивает отдачу от всех кликов на процент от масштаба бизнеса',
        level: state.synergyLevel,
        cost: Math.round(8000 * Math.pow(2.2, state.synergyLevel)),
        bonusText: `+8% ко всем кликам`,
      },
    ];
  }

  public buyUpgrade(upgradeId: 'power' | 'crit' | 'auto' | 'synergy'): { success: boolean; message: string } {
    const upgrades = this.getUpgrades();
    const upgrade = upgrades.find((u) => u.id === upgradeId);
    if (!upgrade) return { success: false, message: 'Улучшение не найдено' };

    const currentCash = gameState.getState().cash;
    if (currentCash < upgrade.cost) {
      return { success: false, message: `Недостаточно средств. Требуется $${upgrade.cost.toLocaleString()}` };
    }

    const deducted = economy.removeMoney(
      upgrade.cost,
      'Апгрейд кликера',
      `Покупка апгрейда: ${upgrade.name} (Ур. ${upgrade.level + 1})`,
      'investment'
    );

    if (!deducted) {
      return { success: false, message: `Недостаточно средств. Требуется $${upgrade.cost.toLocaleString()}` };
    }

    gameState.update((draft) => {
      if (!draft.clicker) {
        draft.clicker = {
          clickPowerLevel: 1,
          criticalChanceLevel: 0,
          autoClickerLevel: 0,
          synergyLevel: 0,
          totalClicks: 0,
          totalClickEarnings: 0,
        };
      }
      if (upgradeId === 'power') draft.clicker.clickPowerLevel += 1;
      if (upgradeId === 'crit') draft.clicker.criticalChanceLevel += 1;
      if (upgradeId === 'auto') draft.clicker.autoClickerLevel += 1;
      if (upgradeId === 'synergy') draft.clicker.synergyLevel += 1;
    });

    return { success: true, message: `Улучшение «${upgrade.name}» успешно приобретено!` };
  }

  public handleHourTick(): void {
    const state = gameState.getState().clicker;
    if (!state || state.autoClickerLevel === 0) return;

    const hourlyAuto = Math.round(150 * state.autoClickerLevel * (1 + state.synergyLevel * 0.08));
    if (hourlyAuto > 0) {
      economy.addMoney(
        hourlyAuto,
        'AI-Автокликер',
        `Пассивный доход от автокликера (Ур. ${state.autoClickerLevel})`,
        'revenue'
      );
      gameState.update((draft) => {
        if (draft.clicker) {
          draft.clicker.totalClickEarnings += hourlyAuto;
        }
      });
    }
  }
}

export const clickerManager = new ClickerManager();
