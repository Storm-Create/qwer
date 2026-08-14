/**
 * Business Empire: Ultimate
 * Dealership & Showroom Network System
 */

import { CarDealership, OwnedCar } from '../../types/automotive';

export class DealershipSystem {
  /**
   * Generates a new dealership
   */
  public static createDealership(
    name: string,
    type: 'budget' | 'standard' | 'premium' | 'luxury',
    location: string
  ): { dealership: CarDealership; cost: number } {
    let cost = 75000;
    let capacity = 6;
    let dailyRent = 300;
    let baseRep = 50;

    if (type === 'standard') {
      cost = 180000;
      capacity = 12;
      dailyRent = 750;
      baseRep = 65;
    } else if (type === 'premium') {
      cost = 450000;
      capacity = 20;
      dailyRent = 2200;
      baseRep = 80;
    } else if (type === 'luxury') {
      cost = 1200000;
      capacity = 10; // Boutique
      dailyRent = 5500;
      baseRep = 95;
    }

    const dealership: CarDealership = {
      id: `dealer_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name,
      type,
      location,
      capacityCars: capacity,
      carsOnDisplayIds: [],
      salesStaffCount: 3,
      marketingDailyBudget: 200,
      reputation: baseRep,
      dailyRent,
      dailyExpense: dailyRent + 300,
      totalCarsSold: 0,
      totalRevenueGenerated: 0,
      totalProfitGenerated: 0,
    };

    return { dealership, cost };
  }

  /**
   * Simulates daily car sales in a dealership
   */
  public static simulateDailySales(
    dealership: CarDealership,
    ownedCars: OwnedCar[],
    currentDay: number
  ): Array<{ car: OwnedCar; soldPrice: number; profit: number }> {
    const soldCars: Array<{ car: OwnedCar; soldPrice: number; profit: number }> = [];
    const displayCars = ownedCars.filter(
      c => dealership.carsOnDisplayIds.includes(c.id) && c.status === 'in_showroom'
    );

    displayCars.forEach(car => {
      const askingPrice = car.saleAskingPrice || car.marketValue;
      const priceToMarketRatio = askingPrice / car.marketValue;

      // Base daily sale probability based on condition, reputation, marketing, and price
      let saleProb = 0.20; // 20% base daily chance per car
      
      // Price elasticity
      if (priceToMarketRatio <= 0.90) saleProb += 0.35;
      else if (priceToMarketRatio <= 1.0) saleProb += 0.15;
      else if (priceToMarketRatio <= 1.10) saleProb -= 0.05;
      else if (priceToMarketRatio <= 1.25) saleProb -= 0.15;
      else saleProb = 0.02; // Overpriced

      // Bonus for car condition and detailing
      if (car.condition >= 95) saleProb += 0.10;
      if (car.tuning.detailingDone) saleProb += 0.10;

      // Dealership marketing boost
      saleProb += Math.min(0.20, dealership.marketingDailyBudget / 2000);
      saleProb += (dealership.reputation - 50) * 0.002;

      // Roll chance
      if (Math.random() < saleProb) {
        const soldPrice = askingPrice;
        const profit = soldPrice - car.financials.totalInvested;

        car.status = 'for_sale';
        car.financials.soldPrice = soldPrice;
        car.financials.realizedProfit = profit;
        car.financials.roiPercent = Math.round((profit / Math.max(1, car.financials.totalInvested)) * 100);
        car.financials.soldDay = currentDay;

        dealership.carsOnDisplayIds = dealership.carsOnDisplayIds.filter(id => id !== car.id);
        dealership.totalCarsSold += 1;
        dealership.totalRevenueGenerated += soldPrice;
        dealership.totalProfitGenerated += profit;
        dealership.reputation = Math.min(100, dealership.reputation + 0.2);

        soldCars.push({ car, soldPrice, profit });
      }
    });

    return soldCars;
  }
}
