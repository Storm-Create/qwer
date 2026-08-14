/**
 * Business Empire: Ultimate
 * Esports Empire — Sponsors Catalog
 * Real Business Categories:
 * 1. Gaming Hardware
 * 2. Smartphones
 * 3. Internet Providers
 * 4. Energy Drinks
 * 5. Cars
 * 6. Clothing
 * 7. Technology
 * 8. Software
 */

import { SponsorCategory, SponsorOffer } from '../../types/esports';

export interface SponsorBrandTemplate {
  companyName: string;
  logoEmoji: string;
  category: SponsorCategory;
  tier: 1 | 2 | 3 | 4 | 5;
  baseMonthlyPayment: number;
  baseVictoryBonus: number;
  baseMvpBonus: number;
  minFansRequired: number;
  minWorldRankingRequired: number;
  durationMonths: number;
}

export const SPONSOR_CATALOG: SponsorBrandTemplate[] = [
  // 1. Gaming Hardware
  {
    companyName: 'HyperX Pro Gaming',
    logoEmoji: '🎧',
    category: 'gaming_hardware',
    tier: 1,
    baseMonthlyPayment: 15000,
    baseVictoryBonus: 25000,
    baseMvpBonus: 5000,
    minFansRequired: 5000,
    minWorldRankingRequired: 50,
    durationMonths: 6,
  },
  {
    companyName: 'Razer Chroma Synapse',
    logoEmoji: '🐍',
    category: 'gaming_hardware',
    tier: 3,
    baseMonthlyPayment: 60000,
    baseVictoryBonus: 100000,
    baseMvpBonus: 15000,
    minFansRequired: 40000,
    minWorldRankingRequired: 20,
    durationMonths: 12,
  },
  {
    companyName: 'Logitech G LIGHTSPEED',
    logoEmoji: '🖱️',
    category: 'gaming_hardware',
    tier: 5,
    baseMonthlyPayment: 180000,
    baseVictoryBonus: 350000,
    baseMvpBonus: 50000,
    minFansRequired: 200000,
    minWorldRankingRequired: 5,
    durationMonths: 24,
  },

  // 2. Smartphones
  {
    companyName: 'Black Shark Mobile',
    logoEmoji: '📱',
    category: 'smartphones',
    tier: 2,
    baseMonthlyPayment: 35000,
    baseVictoryBonus: 50000,
    baseMvpBonus: 8000,
    minFansRequired: 20000,
    minWorldRankingRequired: 30,
    durationMonths: 6,
  },
  {
    companyName: 'ROG Phone Ultra Esports',
    logoEmoji: '🔥',
    category: 'smartphones',
    tier: 4,
    baseMonthlyPayment: 120000,
    baseVictoryBonus: 200000,
    baseMvpBonus: 30000,
    minFansRequired: 100000,
    minWorldRankingRequired: 10,
    durationMonths: 12,
  },
  {
    companyName: 'RedMagic Pro Gaming Phones',
    logoEmoji: '📲',
    category: 'smartphones',
    tier: 5,
    baseMonthlyPayment: 220000,
    baseVictoryBonus: 400000,
    baseMvpBonus: 60000,
    minFansRequired: 350000,
    minWorldRankingRequired: 3,
    durationMonths: 24,
  },

  // 3. Internet Providers
  {
    companyName: 'FastPing Fiber Optics',
    logoEmoji: '🌐',
    category: 'internet_providers',
    tier: 1,
    baseMonthlyPayment: 12000,
    baseVictoryBonus: 15000,
    baseMvpBonus: 3000,
    minFansRequired: 3000,
    minWorldRankingRequired: 60,
    durationMonths: 6,
  },
  {
    companyName: 'Starlink Pro Ultra-Low Latency',
    logoEmoji: '🛰️',
    category: 'internet_providers',
    tier: 4,
    baseMonthlyPayment: 95000,
    baseVictoryBonus: 150000,
    baseMvpBonus: 25000,
    minFansRequired: 80000,
    minWorldRankingRequired: 12,
    durationMonths: 12,
  },

  // 4. Energy Drinks
  {
    companyName: 'G-Fuel Energy Formula',
    logoEmoji: '⚡',
    category: 'energy_drinks',
    tier: 2,
    baseMonthlyPayment: 28000,
    baseVictoryBonus: 45000,
    baseMvpBonus: 7000,
    minFansRequired: 15000,
    minWorldRankingRequired: 35,
    durationMonths: 6,
  },
  {
    companyName: 'Monster Energy Claw',
    logoEmoji: '🟢',
    category: 'energy_drinks',
    tier: 4,
    baseMonthlyPayment: 110000,
    baseVictoryBonus: 180000,
    baseMvpBonus: 35000,
    minFansRequired: 120000,
    minWorldRankingRequired: 8,
    durationMonths: 12,
  },
  {
    companyName: 'Red Bull Wings Esports',
    logoEmoji: '🐂',
    category: 'energy_drinks',
    tier: 5,
    baseMonthlyPayment: 250000,
    baseVictoryBonus: 500000,
    baseMvpBonus: 75000,
    minFansRequired: 500000,
    minWorldRankingRequired: 2,
    durationMonths: 24,
  },

  // 5. Cars
  {
    companyName: 'Audi RS Performance',
    logoEmoji: '🏎️',
    category: 'cars',
    tier: 3,
    baseMonthlyPayment: 75000,
    baseVictoryBonus: 120000,
    baseMvpBonus: 20000,
    minFansRequired: 60000,
    minWorldRankingRequired: 15,
    durationMonths: 12,
  },
  {
    companyName: 'BMW M-Power Motorsport',
    logoEmoji: '🚙',
    category: 'cars',
    tier: 4,
    baseMonthlyPayment: 140000,
    baseVictoryBonus: 240000,
    baseMvpBonus: 40000,
    minFansRequired: 150000,
    minWorldRankingRequired: 6,
    durationMonths: 18,
  },
  {
    companyName: 'Porsche Taycan GT',
    logoEmoji: '🚗',
    category: 'cars',
    tier: 5,
    baseMonthlyPayment: 300000,
    baseVictoryBonus: 600000,
    baseMvpBonus: 100000,
    minFansRequired: 750000,
    minWorldRankingRequired: 1,
    durationMonths: 24,
  },

  // 6. Clothing
  {
    companyName: 'Puma Esports Division',
    logoEmoji: '👟',
    category: 'clothing',
    tier: 2,
    baseMonthlyPayment: 30000,
    baseVictoryBonus: 40000,
    baseMvpBonus: 6000,
    minFansRequired: 18000,
    minWorldRankingRequired: 28,
    durationMonths: 6,
  },
  {
    companyName: 'Nike Pro Esports Gear',
    logoEmoji: '✔️',
    category: 'clothing',
    tier: 4,
    baseMonthlyPayment: 130000,
    baseVictoryBonus: 220000,
    baseMvpBonus: 35000,
    minFansRequired: 140000,
    minWorldRankingRequired: 7,
    durationMonths: 12,
  },

  // 7. Technology
  {
    companyName: 'AMD Ryzen & Radeon Pro',
    logoEmoji: '🔴',
    category: 'technology',
    tier: 3,
    baseMonthlyPayment: 65000,
    baseVictoryBonus: 110000,
    baseMvpBonus: 18000,
    minFansRequired: 45000,
    minWorldRankingRequired: 18,
    durationMonths: 12,
  },
  {
    companyName: 'NVIDIA GeForce RTX Studio',
    logoEmoji: '🟩',
    category: 'technology',
    tier: 5,
    baseMonthlyPayment: 275000,
    baseVictoryBonus: 550000,
    baseMvpBonus: 85000,
    minFansRequired: 600000,
    minWorldRankingRequired: 2,
    durationMonths: 24,
  },

  // 8. Software
  {
    companyName: 'NordVPN Secure Gaming',
    logoEmoji: '🛡️',
    category: 'software',
    tier: 2,
    baseMonthlyPayment: 22000,
    baseVictoryBonus: 30000,
    baseMvpBonus: 5000,
    minFansRequired: 10000,
    minWorldRankingRequired: 40,
    durationMonths: 6,
  },
  {
    companyName: 'Discord Nitro Pro Circuit',
    logoEmoji: '💬',
    category: 'software',
    tier: 4,
    baseMonthlyPayment: 115000,
    baseVictoryBonus: 190000,
    baseMvpBonus: 32000,
    minFansRequired: 130000,
    minWorldRankingRequired: 8,
    durationMonths: 12,
  },
];

export function createInitialSponsors(): SponsorOffer[] {
  return SPONSOR_CATALOG.map((t, idx) => ({
    id: `sponsor_${t.category}_${idx}`,
    companyName: t.companyName,
    logoEmoji: t.logoEmoji,
    category: t.category,
    tier: t.tier,
    monthlyPayment: t.baseMonthlyPayment,
    tournamentVictoryBonus: t.baseVictoryBonus,
    mvpBonus: t.baseMvpBonus,
    minFansRequired: t.minFansRequired,
    minWorldRankingRequired: t.minWorldRankingRequired,
    durationMonths: t.durationMonths,
    monthsRemaining: 0,
    isActive: false,
  }));
}
