/**
 * Business Empire: Ultimate
 * Industrial Production & Manufacturing Subsystem (Foundation)
 */

import { Business } from '../../types/game';

export interface FactoryRecipe {
  id: string;
  name: string;
  inputCommodityId: string;
  inputQuantity: number;
  outputCommodityId: string;
  outputQuantity: number;
  productionHours: number;
  productionCost: number;
}

export interface FactoryTemplate {
  id: string;
  name: string;
  category: 'factory';
  initialCost: number;
  baseDailyRevenue: number;
  baseDailyExpense: number;
  minEmployees: number;
  productionCapacityDaily: number;
  description: string;
}

export const FACTORY_CATALOG: FactoryTemplate[] = [
  {
    id: 'factory_beverage_bottling',
    name: 'Завод крафтовых напитков',
    category: 'factory',
    initialCost: 140000,
    baseDailyRevenue: 6200,
    baseDailyExpense: 3400,
    minEmployees: 8,
    productionCapacityDaily: 120,
    description: 'Линия розлива и упаковки премиальных органических напитков и кофе.',
  },
  {
    id: 'factory_electronics_assembly',
    name: 'Завод сборки микроэлектроники',
    category: 'factory',
    initialCost: 450000,
    baseDailyRevenue: 19500,
    baseDailyExpense: 10200,
    minEmployees: 24,
    productionCapacityDaily: 350,
    description: 'Высокоточное роботизированное производство печатных плат и электронных компонентов.',
  },
];

class FactorySystem {
  public getCatalog(): FactoryTemplate[] {
    return FACTORY_CATALOG;
  }

  public createFactoryFromTemplate(template: FactoryTemplate): Business {
    return {
      id: `factory_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: template.name,
      category: 'factory',
      level: 1,
      baseDailyRevenue: template.baseDailyRevenue,
      baseDailyExpense: template.baseDailyExpense,
      employeesCount: template.minEmployees,
      managerHired: false,
      status: 'active',
    };
  }
}

export const factorySystem = new FactorySystem();
