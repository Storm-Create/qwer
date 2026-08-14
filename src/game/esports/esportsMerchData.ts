/**
 * Business Empire: Ultimate
 * Esports Empire — Merch Store & Manufacturing Linkage
 * Connects directly with player's Textile & Manufacturing factories
 */

import { MerchItem } from '../../types/esports';

export const INITIAL_MERCH_ITEMS: MerchItem[] = [
  {
    id: 'merch_jerseys',
    name: 'Официальное джерси команды (Pro Player Jersey)',
    category: 'jerseys',
    unitCost: 18,
    retailPrice: 75,
    stock: 250,
    monthlySales: 180,
    qualityRating: 92,
    suppliedByTextileFactory: false,
  },
  {
    id: 'merch_hoodies',
    name: 'Премиум худи с вышивкой и капюшоном (Esports Champion Hoodie)',
    category: 'hoodies',
    unitCost: 28,
    retailPrice: 110,
    stock: 180,
    monthlySales: 120,
    qualityRating: 95,
    suppliedByTextileFactory: false,
  },
  {
    id: 'merch_caps',
    name: 'Бейсболка с 3D-логотипом и голограммой (Pro Snapback Cap)',
    category: 'caps',
    unitCost: 8,
    retailPrice: 35,
    stock: 300,
    monthlySales: 210,
    qualityRating: 88,
    suppliedByTextileFactory: false,
  },
  {
    id: 'merch_mousepads',
    name: 'Коврик для мыши Speed+Control 900x400мм (Control Deskmat)',
    category: 'mousepads',
    unitCost: 10,
    retailPrice: 45,
    stock: 350,
    monthlySales: 240,
    qualityRating: 90,
    suppliedByTextileFactory: false,
  },
  {
    id: 'merch_posters',
    name: 'Глянцевый коллекционный постер с автографами игроков',
    category: 'posters',
    unitCost: 3,
    retailPrice: 20,
    stock: 500,
    monthlySales: 320,
    qualityRating: 85,
    suppliedByTextileFactory: false,
  },
  {
    id: 'merch_accessories',
    name: 'Браслеты, кейкарды и рукава для прицеливания (Pro Arm Sleeves)',
    category: 'accessories',
    unitCost: 5,
    retailPrice: 25,
    stock: 400,
    monthlySales: 260,
    qualityRating: 89,
    suppliedByTextileFactory: false,
  },
];
