/**
 * Business Empire: Ultimate
 * Private Equity & Venture Investment Subsystem (Foundation)
 */

export interface VentureStartup {
  id: string;
  name: string;
  industry: string;
  valuation: number;
  minInvestment: number;
  equityPercentOffered: number;
  riskRating: 'Low' | 'Medium' | 'High' | 'Extreme';
  potentialRoiMultiplier: number;
  description: string;
}

export const VENTURE_DEALS: VentureStartup[] = [
  {
    id: 'startup_fintech_pay',
    name: 'NovaPay Global',
    industry: 'Fintech / Blockchain',
    valuation: 2500000,
    minInvestment: 50000,
    equityPercentOffered: 2.0,
    riskRating: 'Medium',
    potentialRoiMultiplier: 3.5,
    description: 'Инфраструктурный платежный шлюз для трансграничных B2B расчетов.',
  },
  {
    id: 'startup_aerospace_drone',
    name: 'SkyFreight Robotics',
    industry: 'Autonomous Drones',
    valuation: 4200000,
    minInvestment: 120000,
    equityPercentOffered: 2.8,
    riskRating: 'High',
    potentialRoiMultiplier: 6.0,
    description: 'Автономные грузовые дроны для экспресс-доставки между региональными складами.',
  },
];

class InvestmentsSystem {
  public getVentureDeals(): VentureStartup[] {
    return VENTURE_DEALS;
  }
}

export const investmentsSystem = new InvestmentsSystem();
