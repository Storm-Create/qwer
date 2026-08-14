/**
 * Business Empire: Ultimate
 * Retail & Commercial Business Enterprise Subsystem (Foundation)
 */

import { Business } from '../../types/game';

export interface RetailTemplate {
  id: string;
  name: string;
  category: 'retail';
  initialCost: number;
  baseDailyRevenue: number;
  baseDailyExpense: number;
  minEmployees: number;
  description: string;
}

export const RETAIL_CATALOG: RetailTemplate[] = [
  {
    id: 'retail_coffee_kiosk',
    name: 'Кофейный киоск Specialty',
    category: 'retail',
    initialCost: 18000,
    baseDailyRevenue: 850,
    baseDailyExpense: 420,
    minEmployees: 2,
    description: 'Компактная точка формата To-Go с высокой маржинальностью и быстрой окупаемостью.',
  },
  {
    id: 'retail_boutique',
    name: 'Бутик дизайнерской одежды',
    category: 'retail',
    initialCost: 65000,
    baseDailyRevenue: 2800,
    baseDailyExpense: 1350,
    minEmployees: 4,
    description: 'Магазин премиальной одежды в оживленном торговом центре города.',
  },
  {
    id: 'retail_supermarket',
    name: 'Круглосуточный супермаркет',
    category: 'retail',
    initialCost: 190000,
    baseDailyRevenue: 7500,
    baseDailyExpense: 4100,
    minEmployees: 12,
    description: 'Сетевой продуктовый магазин с масштабным товарооборотом и постоянным трафиком.',
  },
];

class RetailSystem {
  public getCatalog(): RetailTemplate[] {
    return RETAIL_CATALOG;
  }

  public createBusinessFromTemplate(template: RetailTemplate): Business {
    return {
      id: `biz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: template.name,
      category: template.category,
      level: 1,
      baseDailyRevenue: template.baseDailyRevenue,
      baseDailyExpense: template.baseDailyExpense,
      employeesCount: template.minEmployees,
      managerHired: false,
      status: 'active',
    };
  }
}

export const retailSystem = new RetailSystem();
