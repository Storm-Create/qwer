/**
 * Business Empire: Ultimate
 * Car Dealership & Fleet Market Subsystem (Foundation)
 */

import { Vehicle } from '../../types/game';

export interface CarDealershipListing {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: 'economy' | 'business' | 'luxury' | 'commercial' | 'supercar';
  basePrice: number;
  marketPrice: number;
  condition: number;
  maintenanceDaily: number;
  prestigePoints: number;
}

export const DEALERSHIP_CATALOG: CarDealershipListing[] = [
  {
    id: 'car_courier_van',
    brand: 'TransVan',
    model: 'Cargo Master 350',
    year: 2024,
    category: 'commercial',
    basePrice: 32000,
    marketPrice: 32000,
    condition: 100,
    maintenanceDaily: 25,
    prestigePoints: 5,
  },
  {
    id: 'car_exec_sedan',
    brand: 'Aethelgard',
    model: 'Executive V8',
    year: 2025,
    category: 'business',
    basePrice: 85000,
    marketPrice: 85000,
    condition: 100,
    maintenanceDaily: 60,
    prestigePoints: 40,
  },
  {
    id: 'car_super_gt',
    brand: 'Monza',
    model: 'Stradale V12',
    year: 2026,
    category: 'supercar',
    basePrice: 320000,
    marketPrice: 320000,
    condition: 100,
    maintenanceDaily: 220,
    prestigePoints: 200,
  },
];

class CarMarketSystem {
  public getCatalog(): CarDealershipListing[] {
    return DEALERSHIP_CATALOG;
  }

  public createVehicleInstance(listing: CarDealershipListing): Vehicle {
    return {
      id: `veh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: `${listing.brand} ${listing.model}`,
      brand: listing.brand,
      model: listing.model,
      type: listing.category === 'commercial' ? 'commercial' : 'personal',
      condition: listing.condition,
      purchasePrice: listing.marketPrice,
      marketValue: listing.marketPrice,
      maintenanceCostDaily: listing.maintenanceDaily,
      status: 'idle',
    };
  }
}

export const carMarket = new CarMarketSystem();
