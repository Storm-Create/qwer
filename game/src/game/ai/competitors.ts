/**
 * Business Empire: Ultimate
 * AI Competitor Tycoons & Rival Corporations Subsystem
 */

import { competitorMarketEngine } from './competitorMarketEngine';
export { competitorMarketEngine } from './competitorMarketEngine';
export * from '../../types/aiCompetitors';

export interface AICompetitor {
  id: string;
  name: string;
  ceoName: string;
  marketCap: number;
  marketShare: number; // 0 to 100%
  aggression: number; // 0 to 1
  primarySector: string;
  avatarIcon: string;
  status: 'active' | 'hostile' | 'neutral' | 'allied';
}

class CompetitorsSystem {
  public getCompetitors(): AICompetitor[] {
    const aiComps = competitorMarketEngine.getCompanies();
    return aiComps.map((c) => ({
      id: c.id,
      name: c.name,
      ceoName: c.ceoName,
      marketCap: c.netWorth,
      marketShare: c.marketShare,
      aggression: c.strategy === 'aggressive' ? 0.9 : c.strategy === 'trading' ? 0.7 : 0.4,
      primarySector: c.sector,
      avatarIcon: c.avatarIcon,
      status: c.isBankrupt ? 'hostile' : 'neutral',
    }));
  }
}

export const competitorsSystem = new CompetitorsSystem();
