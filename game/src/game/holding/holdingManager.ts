/**
 * Business Empire: Ultimate
 * Holding, Conglomerate, Corporate Subsidiaries, M&A Valuation, IPO & Endgame Engine
 */

import { gameState } from '../gameState';
import { economy } from '../economy';
import { gameLoop } from '../gameLoop';
import { worldEconomyEngine } from '../economy/worldEconomyEngine';
import { competitorMarketEngine } from '../ai/competitorMarketEngine';
import { AICompetitorCompany } from '../../types/aiCompetitors';
import {
  HoldingState,
  HoldingBranchSummary,
  HoldingSynergy,
  SubsidiaryCompany,
  CompanyValuationBreakdown,
  IPOSystemState,
  MegacorpTier,
  GlobalTradeRoute,
  GlobalInvestment,
  SectorMonopolyStatus,
  BusinessBranchType,
} from '../../types/holding';

const INITIAL_SYNERGIES: HoldingSynergy[] = [
  {
    id: 'syn_vertical_integration',
    name: 'Вертикальная интеграция',
    description: 'Прямые поставки со своих заводов в собственную розничную сеть без посредников (+15% к выручке розницы)',
    unlocked: false,
    requiredBranches: ['industrial', 'retail'],
    bonusType: 'revenue',
    bonusValuePercent: 15,
  },
  {
    id: 'syn_logistics_hub',
    name: 'Сквозная корпоративная логистика',
    description: 'Объединение распределительных складов и собственного грузового флота (-25% к транспортным издержкам)',
    unlocked: false,
    requiredBranches: ['warehouses', 'logistics'],
    bonusType: 'logistics_discount',
    bonusValuePercent: 25,
  },
  {
    id: 'syn_auto_supply',
    name: 'Автомобильный кластер',
    description: 'Интеграция автозаводов, СТО и сети автосалонов (+12% к скорости выпуска и марже продаж авто)',
    unlocked: false,
    requiredBranches: ['industrial', 'automotive'],
    bonusType: 'production_speed',
    bonusValuePercent: 12,
  },
  {
    id: 'syn_reit_lease',
    name: 'Корпоративная недвижимость',
    description: 'Размещение предприятий и офисов на собственных площадях (-20% к операционным расходам)',
    unlocked: false,
    requiredBranches: ['real_estate', 'retail'],
    bonusType: 'logistics_discount',
    bonusValuePercent: 20,
  },
  {
    id: 'syn_tax_optimization',
    name: 'Конгломератная оптимизация налогов',
    description: 'Внутригрупповые займы, амортизация активов и единый баланс (-30% к налоговым отчислениям)',
    unlocked: false,
    requiredBranches: ['investments', 'industrial', 'retail'],
    bonusType: 'tax_reduction',
    bonusValuePercent: 30,
  },
  {
    id: 'syn_total_synergy',
    name: 'Имперская синергия конгломерата',
    description: 'Полное присутствие во всех 7 отраслях экономики (+20% к капитализации и глобальной репутации)',
    unlocked: false,
    requiredBranches: ['retail', 'automotive', 'industrial', 'warehouses', 'logistics', 'real_estate', 'investments'],
    bonusType: 'brand_reputation',
    bonusValuePercent: 20,
  },
];

const GLOBAL_TRADE_ROUTES_CATALOG: GlobalTradeRoute[] = [
  {
    id: 'tr_asia_europe',
    name: 'Шанхай — Роттердам (Электроника & Контейнеры)',
    originHub: 'Шанхай (Китай)',
    destinationHub: 'Роттердам (Нидерланды)',
    commodityType: 'Микроэлектроника & Промтовары',
    investmentCost: 25000000,
    dailyProfit: 380000,
    requiredMegacorpTier: 1,
    active: false,
    unlocked: false,
    riskFactorPercent: 8,
    fleetCapacityTons: 50000,
  },
  {
    id: 'tr_mideast_us',
    name: 'Дубай — Хьюстон (Энергетический супер-коридор)',
    originHub: 'Дубай (ОАЭ)',
    destinationHub: 'Хьюстон (США)',
    commodityType: 'Нефтепродукты & СПГ',
    investmentCost: 75000000,
    dailyProfit: 1150000,
    requiredMegacorpTier: 2,
    active: false,
    unlocked: false,
    riskFactorPercent: 12,
    fleetCapacityTons: 120000,
  },
  {
    id: 'tr_tokyo_london',
    name: 'Токио — Лондон (Премиальные технологии & Квантовое оборудование)',
    originHub: 'Токио (Япония)',
    destinationHub: 'Лондон (Великобритания)',
    commodityType: 'Высокие технологии & Робототехника',
    investmentCost: 200000000,
    dailyProfit: 3200000,
    requiredMegacorpTier: 3,
    active: false,
    unlocked: false,
    riskFactorPercent: 5,
    fleetCapacityTons: 35000,
  },
  {
    id: 'tr_global_grain',
    name: 'Сантус — Сингапур (Глобальный продовольственный флот)',
    originHub: 'Сантус (Бразилия)',
    destinationHub: 'Сингапур',
    commodityType: 'Агропродукция & Зерновые супертанкеры',
    investmentCost: 500000000,
    dailyProfit: 8500000,
    requiredMegacorpTier: 4,
    active: false,
    unlocked: false,
    riskFactorPercent: 7,
    fleetCapacityTons: 300000,
  },
  {
    id: 'tr_pan_orbital',
    name: 'Орбитальный транспортный экспресс (Суборбитальные перевозки)',
    originHub: 'Мыс Канаверал (США)',
    destinationHub: 'Глобальная сеть мегаполисов',
    commodityType: 'Сверхкритичные грузы & Редкоземельные материалы',
    investmentCost: 1500000000,
    dailyProfit: 28000000,
    requiredMegacorpTier: 5,
    active: false,
    unlocked: false,
    riskFactorPercent: 10,
    fleetCapacityTons: 15000,
  },
];

const GLOBAL_INVESTMENTS_CATALOG: GlobalInvestment[] = [
  {
    id: 'inv_us_treasuries',
    name: 'Суверенные казначейские облигации США (US Treasuries)',
    country: 'США',
    category: 'sovereign_bonds',
    investmentCost: 50000000,
    dailyYield: 350000,
    annualYieldPercent: 5.2,
    minMegacorpTier: 1,
    purchased: false,
    riskRating: 'AAA',
    description: 'Надежнейший финансовый инструмент с гарантированной ежедневной выплатой купона.',
  },
  {
    id: 'inv_eu_energy',
    name: 'Трансъевропейская зеленая энергосеть',
    country: 'Евросоюз',
    category: 'energy_grid',
    investmentCost: 180000000,
    dailyYield: 1450000,
    annualYieldPercent: 7.8,
    minMegacorpTier: 2,
    purchased: false,
    riskRating: 'AA',
    description: 'Пакет ветряных и гидроэлектростанций с долгосрочными государственными субсидиями.',
  },
  {
    id: 'inv_ai_supercluster',
    name: 'Глобальный ИИ-кластер на 100,000 квантовых GPU',
    country: 'Швейцария / Сингапур',
    category: 'ai_supercluster',
    investmentCost: 650000000,
    dailyYield: 6200000,
    annualYieldPercent: 11.5,
    minMegacorpTier: 3,
    purchased: false,
    riskRating: 'A',
    description: 'Вычислительный центр для корпораций и нейросетей нового поколения с колоссальной рентабельностью.',
  },
  {
    id: 'inv_space_telecom',
    name: 'Низкоорбитальная спутниковая группировка 6G',
    country: 'Международный консорциум',
    category: 'space_tech',
    investmentCost: 2000000000,
    dailyYield: 21500000,
    annualYieldPercent: 14.2,
    minMegacorpTier: 4,
    purchased: false,
    riskRating: 'AA',
    description: 'Глобальная телекоммуникационная монополия, обслуживающая морской и авиационный транспорт.',
  },
  {
    id: 'inv_fusion_reactor',
    name: 'Первый коммерческий термоядерный реактор (ITER-X)',
    country: 'Глобальный альянс',
    category: 'infrastructure',
    investmentCost: 8000000000,
    dailyYield: 95000000,
    annualYieldPercent: 18.0,
    minMegacorpTier: 5,
    purchased: false,
    riskRating: 'AAA',
    description: 'Безлимитная чистая энергия для целых континентов. Высшая точка технологического господства.',
  },
];

const INITIAL_SECTOR_MONOPOLIES: SectorMonopolyStatus[] = [
  {
    sectorId: 'retail',
    sectorName: 'Потребительский ритейл & Магазины',
    playerMarketShare: 4.5,
    topCompetitorShare: 18.2,
    monopolyTier: 'none',
    monopolyBonusRevenuePercent: 0,
    antiTrustRisk: 0,
    lobbyingBudgetDaily: 0,
  },
  {
    sectorId: 'automotive',
    sectorName: 'Автоиндустрия & Салоны',
    playerMarketShare: 3.2,
    topCompetitorShare: 24.5,
    monopolyTier: 'none',
    monopolyBonusRevenuePercent: 0,
    antiTrustRisk: 0,
    lobbyingBudgetDaily: 0,
  },
  {
    sectorId: 'industrial',
    sectorName: 'Тяжелая & Высокотехнологичная промышленность',
    playerMarketShare: 2.1,
    topCompetitorShare: 22.0,
    monopolyTier: 'none',
    monopolyBonusRevenuePercent: 0,
    antiTrustRisk: 0,
    lobbyingBudgetDaily: 0,
  },
  {
    sectorId: 'real_estate',
    sectorName: 'Коммерческая недвижимость & Девелопмент',
    playerMarketShare: 5.0,
    topCompetitorShare: 16.8,
    monopolyTier: 'none',
    monopolyBonusRevenuePercent: 0,
    antiTrustRisk: 0,
    lobbyingBudgetDaily: 0,
  },
  {
    sectorId: 'logistics',
    sectorName: 'Логистика, Склады & Перевозки',
    playerMarketShare: 6.2,
    topCompetitorShare: 15.4,
    monopolyTier: 'none',
    monopolyBonusRevenuePercent: 0,
    antiTrustRisk: 0,
    lobbyingBudgetDaily: 0,
  },
];

class HoldingManager {
  private holdingState: HoldingState;
  private isInitialized = false;

  constructor() {
    this.holdingState = this.getDefaultHoldingState();

    // Hook into daily game loop
    gameLoop.onDay((gameTime) => {
      this.processDailyHoldingTick(gameTime.totalDays);
    });
  }

  private getDefaultHoldingState(): HoldingState {
    return {
      established: false,
      establishedDay: 0,
      name: 'Ultimate Imperial Holding Corp',
      motto: 'Diversified Global Excellence',
      headquartersCity: 'Нью-Йорк / Токио',
      level: 1,
      holdingTreasury: 0,
      subsidiaries: [],
      synergies: JSON.parse(JSON.stringify(INITIAL_SYNERGIES)),
      ipo: {
        isPublic: false,
        ticker: 'BEU',
        companyName: 'Ultimate Imperial Holding Corp',
        sharesOutstanding: 100000000,
        publicFloatPercent: 0,
        playerShares: 100000000,
        publicShares: 0,
        ipoPrice: 50,
        currentSharePrice: 50,
        previousSharePrice: 50,
        priceHistory: [50, 50, 50, 50, 50],
        marketCap: 5000000000,
        capitalRaisedAtIPO: 0,
        quarterlyDividendPerShare: 0.5,
        dividendYield: 0.04,
        shareholderSatisfaction: 85,
        quarterlyProfitTarget: 50000000,
        currentQuarterProfit: 0,
        peRatio: 15.2,
      },
      megacorpTier: 1,
      globalTradeRoutes: JSON.parse(JSON.stringify(GLOBAL_TRADE_ROUTES_CATALOG)),
      globalInvestments: JSON.parse(JSON.stringify(GLOBAL_INVESTMENTS_CATALOG)),
      sectorMonopolies: JSON.parse(JSON.stringify(INITIAL_SECTOR_MONOPOLIES)),
      antiTrustLobbyingActive: false,
      totalConsolidatedNetWorth: 0,
      totalConsolidatedDailyRevenue: 0,
      totalConsolidatedDailyProfit: 0,
    };
  }

  public init(): void {
    if (this.isInitialized) return;
    this.recalculateConsolidatedFinancials();
    this.isInitialized = true;
  }

  public getHoldingState(): HoldingState {
    return this.holdingState;
  }

  /**
   * Establish official holding conglomerate
   */
  public establishHolding(name: string, motto: string, headquartersCity: string): { success: boolean; message: string } {
    if (!name.trim()) return { success: false, message: 'Укажите название холдинга' };

    const state = gameState.getState();
    const cost = 1000000; // $1M registration, legal and structuring cost

    if (state.cash < cost) {
      return { success: false, message: `Для регистрации холдинга требуется $${cost.toLocaleString()}` };
    }

    economy.removeMoney(cost, 'Регистрация холдинга', `Создание головного холдинга "${name.trim()}"`, 'investment');

    this.holdingState.established = true;
    this.holdingState.establishedDay = state.gameTime.totalDays;
    this.holdingState.name = name.trim();
    this.holdingState.motto = motto.trim() || 'Global Strategic Holding';
    this.holdingState.headquartersCity = headquartersCity || 'Нью-Йорк / Токио';
    this.holdingState.ipo.companyName = name.trim();

    this.recalculateSynergies();
    this.recalculateConsolidatedFinancials();

    return {
      success: true,
      message: `🎉 Поздравляем! Холдинг "${name.trim()}" официально зарегистрирован! Открыты корпоративные синергии и управление дочерними компаниями.`,
    };
  }

  /**
   * Recalculates summaries across all 7 business branches
   */
  public getBranchesSummary(): Record<BusinessBranchType, HoldingBranchSummary> {
    const s = gameState.getState();

    // 1. Retail Stores
    const retailStores = s.retailStores || [];
    let retailValuation = 0;
    let retailRevenue = 0;
    let retailExpense = 0;
    for (const store of retailStores) {
      retailValuation += store.level * 150000;
      retailRevenue += store.dailyRevenue || 0;
      retailExpense += (store.dailyRent || 0) + (store.dailyElectricity || 0) + (store.dailySalaries || 0) + (store.dailyAdCost || 0) + (store.dailyCogs || 0);
    }

    // 2. Automotive
    const auto = s.automotive;
    let autoValuation = (auto?.ownedCars?.length || 0) * 45000;
    let autoRevenue = 0;
    let autoExpense = 0;
    if (auto) {
      autoValuation += (auto.dealerships?.length || 0) * 1200000;
      autoValuation += (auto.autoWorkshops?.length || 0) * 500000;
      autoValuation += (auto.factoryLines?.length || 0) * 8000000;
      autoRevenue = (auto.dealerships?.length || 0) * 45000 + (auto.autoWorkshops?.length || 0) * 12000;
      autoExpense = (auto.dealerships?.length || 0) * 15000 + (auto.autoWorkshops?.length || 0) * 4000;
    }

    // 3. Industrial
    const factories = s.industrial?.factories || [];
    let indValuation = 0;
    let indRevenue = 0;
    let indExpense = 0;
    for (const f of factories) {
      indValuation += f.level * 2500000;
      indRevenue += f.dailyRevenue || (f.level * 120000);
      indExpense += f.dailyExpenses || (f.level * 35000);
    }

    // 4. Warehouses
    const warehouses = s.warehouses || [];
    let whValuation = 0;
    let whRevenue = 0;
    let whExpense = 0;
    for (const w of warehouses) {
      whValuation += w.capacity * 250;
      whExpense += (w.rent || 0) + (w.maintenance || 0) || (w.capacity * 5);
    }

    // 5. Logistics
    const trucks = s.trucks || [];
    let logValuation = trucks.length * 120000;
    let logRevenue = (s.autoSupplyRoutes?.length || 0) * 25000;
    let logExpense = trucks.length * 800;

    // 6. Real Estate
    const properties = s.realEstate?.properties || [];
    let reValuation = 0;
    let reRevenue = 0;
    let reExpense = 0;
    for (const p of properties) {
      reValuation += p.marketValue || p.purchasePrice;
      if (p.isRented) {
        reRevenue += p.rent;
      }
      reExpense += p.maintenance;
    }

    // 7. Investments
    const holdings = (s as any).stockExchange?.holdings || {};
    let invValuation = 0;
    let invRevenue = 0;
    for (const key of Object.keys(holdings)) {
      const h = holdings[key];
      invValuation += (h.shares || 0) * (h.avgPrice || 100);
      invRevenue += Math.round(((h.shares || 0) * 4) / 30); // estimated dividend flow
    }

    return {
      retail: {
        type: 'retail',
        name: 'Розничный ритейл',
        count: retailStores.length,
        totalValuation: retailValuation,
        dailyRevenue: retailRevenue,
        dailyExpense: retailExpense,
        dailyProfit: retailRevenue - retailExpense,
        synergyBoostPercent: this.getBranchSynergyBoost('retail'),
        description: 'Сеть супермаркетов, бутиков и магазинов электроники',
      },
      automotive: {
        type: 'automotive',
        name: 'Автомобильный дивизион',
        count: (auto?.dealerships?.length || 0) + (auto?.autoWorkshops?.length || 0) + (auto?.factoryLines?.length || 0),
        totalValuation: autoValuation,
        dailyRevenue: autoRevenue,
        dailyExpense: autoExpense,
        dailyProfit: autoRevenue - autoExpense,
        synergyBoostPercent: this.getBranchSynergyBoost('automotive'),
        description: 'Автосалоны, заводы суперкаров, СТО и парк машин',
      },
      industrial: {
        type: 'industrial',
        name: 'Промышленный комплекс',
        count: factories.length,
        totalValuation: indValuation,
        dailyRevenue: indRevenue,
        dailyExpense: indExpense,
        dailyProfit: indRevenue - indExpense,
        synergyBoostPercent: this.getBranchSynergyBoost('industrial'),
        description: 'Тяжелые заводы, микрочипы, химия и сборочные линии',
      },
      warehouses: {
        type: 'warehouses',
        name: 'Складская сеть',
        count: warehouses.length,
        totalValuation: whValuation,
        dailyRevenue: whRevenue,
        dailyExpense: whExpense,
        dailyProfit: whRevenue - whExpense,
        synergyBoostPercent: this.getBranchSynergyBoost('warehouses'),
        description: 'Крупноузловые хабы и логистические терминалы',
      },
      logistics: {
        type: 'logistics',
        name: 'Транспорт & Логистика',
        count: trucks.length + (s.autoSupplyRoutes?.length || 0),
        totalValuation: logValuation,
        dailyRevenue: logRevenue,
        dailyExpense: logExpense,
        dailyProfit: logRevenue - logExpense,
        synergyBoostPercent: this.getBranchSynergyBoost('logistics'),
        description: 'Магистральные тягачи и автоматические маршруты',
      },
      real_estate: {
        type: 'real_estate',
        name: 'Недвижимость & Девелопмент',
        count: properties.length,
        totalValuation: reValuation,
        dailyRevenue: reRevenue,
        dailyExpense: reExpense,
        dailyProfit: reRevenue - reExpense,
        synergyBoostPercent: this.getBranchSynergyBoost('real_estate'),
        description: 'Небоскребы, торговые центры и элитные апартаменты',
      },
      investments: {
        type: 'investments',
        name: 'Капитал & Ценные бумаги',
        count: Object.keys(holdings).length,
        totalValuation: invValuation,
        dailyRevenue: invRevenue,
        dailyExpense: 0,
        dailyProfit: invRevenue,
        synergyBoostPercent: this.getBranchSynergyBoost('investments'),
        description: 'Портфель акций мировых корпораций и дивидендный поток',
      },
    };
  }

  private getBranchSynergyBoost(type: BusinessBranchType): number {
    let total = 0;
    for (const syn of this.holdingState.synergies) {
      if (syn.unlocked && syn.requiredBranches.includes(type)) {
        total += syn.bonusValuePercent;
      }
    }
    return total;
  }

  /**
   * Checks & unlocks Holding Synergies
   */
  public recalculateSynergies(): void {
    const branches = this.getBranchesSummary();

    for (const syn of this.holdingState.synergies) {
      const hasAllBranches = syn.requiredBranches.every((b) => branches[b].count > 0 || branches[b].totalValuation > 0);
      syn.unlocked = hasAllBranches && this.holdingState.established;
    }
  }

  /**
   * Consolidated net worth, revenues and megacorp tier
   */
  public recalculateConsolidatedFinancials(): void {
    const branches = this.getBranchesSummary();
    let totalNw = gameState.getState().cash;
    let totalRev = 0;
    let totalProf = 0;

    for (const key of Object.keys(branches) as BusinessBranchType[]) {
      const b = branches[key];
      totalNw += b.totalValuation;
      totalRev += b.dailyRevenue;
      totalProf += b.dailyProfit;
    }

    // Add subsidiaries financials
    for (const sub of this.holdingState.subsidiaries) {
      totalNw += sub.valuation * (sub.ownershipPercent / 100);
      totalRev += sub.dailyRevenue * (sub.ownershipPercent / 100);
      totalProf += sub.dailyProfit * (sub.ownershipPercent / 100);
    }

    // Add Global Trade Routes revenue
    for (const r of this.holdingState.globalTradeRoutes) {
      if (r.active) {
        totalRev += r.dailyProfit;
        totalProf += r.dailyProfit;
      }
    }

    // Add Global Sovereign Investments
    for (const inv of this.holdingState.globalInvestments) {
      if (inv.purchased) {
        totalNw += inv.investmentCost;
        totalRev += inv.dailyYield;
        totalProf += inv.dailyYield;
      }
    }

    this.holdingState.totalConsolidatedNetWorth = Math.round(totalNw);
    this.holdingState.totalConsolidatedDailyRevenue = Math.round(totalRev);
    this.holdingState.totalConsolidatedDailyProfit = Math.round(totalProf);

    // Determine Megacorp Tier based on consolidated net worth
    if (totalNw >= 1000000000000) {
      this.holdingState.megacorpTier = 5; // $1T+
    } else if (totalNw >= 100000000000) {
      this.holdingState.megacorpTier = 4; // $100B+
    } else if (totalNw >= 10000000000) {
      this.holdingState.megacorpTier = 3; // $10B+
    } else if (totalNw >= 1000000000) {
      this.holdingState.megacorpTier = 2; // $1B+
    } else {
      this.holdingState.megacorpTier = 1; // <$1B
    }

    // Unlock trade routes per tier
    for (const route of this.holdingState.globalTradeRoutes) {
      route.unlocked = this.holdingState.megacorpTier >= route.requiredMegacorpTier;
    }

    this.recalculateSectorMonopolies();
  }

  /**
   * Recalculates player market share vs AI Competitors
   */
  public recalculateSectorMonopolies(): void {
    const aiCompanies = competitorMarketEngine.getCompanies();
    const branches = this.getBranchesSummary();

    // Map sectors
    const sectorValues: Record<string, { playerVal: number; aiVals: number[] }> = {
      retail: { playerVal: branches.retail.dailyRevenue, aiVals: [] },
      automotive: { playerVal: branches.automotive.dailyRevenue, aiVals: [] },
      industrial: { playerVal: branches.industrial.dailyRevenue, aiVals: [] },
      real_estate: { playerVal: branches.real_estate.dailyRevenue, aiVals: [] },
      logistics: { playerVal: branches.logistics.dailyRevenue, aiVals: [] },
    };

    // Add subsidiaries into sectors
    for (const sub of this.holdingState.subsidiaries) {
      if (sectorValues[sub.sector]) {
        sectorValues[sub.sector].playerVal += sub.dailyRevenue * (sub.ownershipPercent / 100);
      }
    }

    for (const comp of aiCompanies) {
      const sec = comp.sector.toLowerCase();
      if (sec.includes('ритейл') || sec.includes('retail') || sec.includes('торговл')) {
        sectorValues.retail.aiVals.push(comp.dailyRevenue);
      } else if (sec.includes('авто') || sec.includes('auto')) {
        sectorValues.automotive.aiVals.push(comp.dailyRevenue);
      } else if (sec.includes('пром') || sec.includes('индустр') || sec.includes('tech') || sec.includes('завод')) {
        sectorValues.industrial.aiVals.push(comp.dailyRevenue);
      } else if (sec.includes('недвиж') || sec.includes('estate')) {
        sectorValues.real_estate.aiVals.push(comp.dailyRevenue);
      } else {
        sectorValues.logistics.aiVals.push(comp.dailyRevenue);
      }
    }

    for (const mono of this.holdingState.sectorMonopolies) {
      const data = sectorValues[mono.sectorId];
      if (!data) continue;

      const totalAIRev = data.aiVals.reduce((a, b) => a + b, 0);
      const totalSecMarket = data.playerVal + totalAIRev;

      if (totalSecMarket > 0) {
        mono.playerMarketShare = Math.min(100, Number(((data.playerVal / totalSecMarket) * 100).toFixed(1)));
        const maxAi = data.aiVals.length > 0 ? Math.max(...data.aiVals) : 0;
        mono.topCompetitorShare = Number(((maxAi / totalSecMarket) * 100).toFixed(1));
      }

      if (mono.playerMarketShare >= 90) {
        mono.monopolyTier = 'absolute_hegemony';
        mono.monopolyBonusRevenuePercent = 40;
        mono.antiTrustRisk = 80;
      } else if (mono.playerMarketShare >= 65) {
        mono.monopolyTier = 'monopoly';
        mono.monopolyBonusRevenuePercent = 25;
        mono.antiTrustRisk = 50;
      } else if (mono.playerMarketShare >= 40) {
        mono.monopolyTier = 'dominant';
        mono.monopolyBonusRevenuePercent = 15;
        mono.antiTrustRisk = 25;
      } else if (mono.playerMarketShare >= 20) {
        mono.monopolyTier = 'oligopoly';
        mono.monopolyBonusRevenuePercent = 8;
        mono.antiTrustRisk = 0;
      } else {
        mono.monopolyTier = 'none';
        mono.monopolyBonusRevenuePercent = 0;
        mono.antiTrustRisk = 0;
      }
    }
  }

  // ==========================================
  // SUBSIDIARY MANAGEMENT (ДОЧЕРНИЕ КОМПАНИИ)
  // ==========================================

  public createSubsidiary(
    name: string,
    sector: string,
    initialCapital: number,
    branches: BusinessBranchType[]
  ): { success: boolean; message: string } {
    if (!this.holdingState.established) {
      return { success: false, message: 'Сначала зарегистрируйте головной холдинг' };
    }
    if (!name.trim()) return { success: false, message: 'Укажите название дочерней компании' };
    if (initialCapital < 500000) return { success: false, message: 'Минимальный уставной капитал — $500,000' };

    const state = gameState.getState();
    if (state.cash < initialCapital) {
      return { success: false, message: `Недостаточно средств. Баланс: $${state.cash.toLocaleString()}` };
    }

    economy.removeMoney(initialCapital, 'Создание дочерней компании', `Уставной капитал "${name.trim()}"`, 'investment');

    const newSub: SubsidiaryCompany = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      sector,
      ceoName: 'Назначенный совет директоров',
      foundedDay: state.gameTime.totalDays,
      capital: initialCapital,
      valuation: Math.round(initialCapital * 1.3),
      dailyRevenue: Math.round(initialCapital * 0.012),
      dailyExpenses: Math.round(initialCapital * 0.005),
      dailyProfit: Math.round(initialCapital * 0.007),
      marketShare: 1.5,
      ownershipPercent: 100,
      status: 'active',
      consolidatedBranches: branches,
      assetCount: Math.max(1, branches.length),
      employees: Math.round(initialCapital / 25000),
    };

    this.holdingState.subsidiaries.push(newSub);
    this.recalculateConsolidatedFinancials();

    return {
      success: true,
      message: `🏢 Дочерняя компания "${newSub.name}" успешно учреждена с капиталом $${initialCapital.toLocaleString()}!`,
    };
  }

  public sellSubsidiary(subsidiaryId: string): { success: boolean; message: string } {
    const idx = this.holdingState.subsidiaries.findIndex((s) => s.id === subsidiaryId);
    if (idx === -1) return { success: false, message: 'Дочерняя компания не найдена' };

    const sub = this.holdingState.subsidiaries[idx];
    const saleProceeds = Math.round(sub.valuation * (sub.ownershipPercent / 100) * 1.1); // 10% premium

    economy.addMoney(saleProceeds, 'Продажа дочерней компании', `Продажа 100% доли в "${sub.name}" институциональным фондам`, 'revenue');

    this.holdingState.subsidiaries.splice(idx, 1);
    this.recalculateConsolidatedFinancials();

    return {
      success: true,
      message: `💰 Сделка закрыта! Компания "${sub.name}" успешно продана за $${saleProceeds.toLocaleString()}. Средства зачислены на баланс.`,
    };
  }

  public mergeSubsidiaries(subId1: string, subId2: string, newMergedName: string): { success: boolean; message: string } {
    if (!newMergedName.trim()) return { success: false, message: 'Укажите название объединенной корпорации' };

    const sub1 = this.holdingState.subsidiaries.find((s) => s.id === subId1);
    const sub2 = this.holdingState.subsidiaries.find((s) => s.id === subId2);

    if (!sub1 || !sub2 || sub1.id === sub2.id) {
      return { success: false, message: 'Выберите две разные дочерние компании для слияния' };
    }

    const mergedCapital = sub1.capital + sub2.capital;
    // M&A synergy adds +20% valuation boost
    const mergedValuation = Math.round((sub1.valuation + sub2.valuation) * 1.2);
    const mergedRevenue = Math.round((sub1.dailyRevenue + sub2.dailyRevenue) * 1.15);
    const mergedExpense = Math.round((sub1.dailyExpenses + sub2.dailyExpenses) * 0.85); // cost synergies

    const mergedBranches = Array.from(new Set([...sub1.consolidatedBranches, ...sub2.consolidatedBranches]));

    const mergedSub: SubsidiaryCompany = {
      id: `merged_${Date.now()}`,
      name: newMergedName.trim(),
      sector: `${sub1.sector} & ${sub2.sector}`,
      ceoName: 'Объединенный комитет CEO',
      foundedDay: gameState.getState().gameTime.totalDays,
      capital: mergedCapital,
      valuation: mergedValuation,
      dailyRevenue: mergedRevenue,
      dailyExpenses: mergedExpense,
      dailyProfit: mergedRevenue - mergedExpense,
      marketShare: Number((sub1.marketShare + sub2.marketShare).toFixed(1)),
      ownershipPercent: 100,
      status: 'active',
      consolidatedBranches: mergedBranches,
      assetCount: sub1.assetCount + sub2.assetCount,
      employees: sub1.employees + sub2.employees,
    };

    this.holdingState.subsidiaries = this.holdingState.subsidiaries.filter((s) => s.id !== subId1 && s.id !== subId2);
    this.holdingState.subsidiaries.push(mergedSub);
    this.recalculateConsolidatedFinancials();

    return {
      success: true,
      message: `✨ Корпоративное слияние завершено! Образована синергетическая супер-корпорация "${mergedSub.name}" с капитализацией $${mergedValuation.toLocaleString()}!`,
    };
  }

  // ==========================================
  // AI COMPANY VALUATION & M&A ACQUISITIONS
  // ==========================================

  public calculateAICompanyValuation(company: AICompetitorCompany): CompanyValuationBreakdown {
    const macro = worldEconomyEngine.getIndicators();
    const cycle = worldEconomyEngine.getState().economicCyclePhase;

    // Macro multiplier based on cycle and interest rate
    let macroMult = 1.0;
    if (cycle === 'peak') macroMult = 1.25;
    else if (cycle === 'expansion') macroMult = 1.12;
    else if (cycle === 'recession') macroMult = 0.82;
    else if (cycle === 'recovery') macroMult = 0.95;

    // High interest rates discount valuations
    if (macro.interestRate > 12) macroMult *= 0.88;
    else if (macro.interestRate < 6) macroMult *= 1.1;

    const annualRevenue = company.dailyRevenue * 365;
    const annualProfit = company.dailyProfit * 365;
    const tangibleAssets = (company.stores * 300000) + (company.factories * 3500000) + (company.realEstateCount * 1200000) + company.cash;
    const debt = company.debt || 0;

    // Valuation formula requested: net worth, revenue, profit, assets, debt, market conditions
    const baseValuation = (company.netWorth * 0.85) + (annualRevenue * 1.5) + (Math.max(0, annualProfit) * 12) + (tangibleAssets * 0.9) - debt;
    const finalValuation = Math.max(500000, Math.round(baseValuation * macroMult));

    return {
      companyId: company.id,
      companyName: company.name,
      netWorth: company.netWorth,
      annualRevenue,
      annualProfit,
      tangibleAssets,
      debt,
      marketConditionsMultiplier: Number(macroMult.toFixed(2)),
      cyclePhase: cycle,
      finalValuation,
      buyout100Price: Math.round(finalValuation * 1.15), // 15% full buyout control premium
      controlling51Price: Math.round(finalValuation * 0.51 * 1.1),
      minority25Price: Math.round(finalValuation * 0.25 * 1.05),
      minority10Price: Math.round(finalValuation * 0.10),
    };
  }

  /**
   * Acquire AI Competitor (10%, 25%, 51%, 100%)
   */
  public acquireAICompany(
    companyId: string,
    stakeType: '10%' | '25%' | '51%' | '100%'
  ): { success: boolean; message: string } {
    const comp = competitorMarketEngine.getCompanies().find((c) => c.id === companyId);
    if (!comp) return { success: false, message: 'AI-компания не найдена' };

    const valuation = this.calculateAICompanyValuation(comp);
    let price = valuation.buyout100Price;
    let percentage = 100;

    if (stakeType === '51%') {
      price = valuation.controlling51Price;
      percentage = 51;
    } else if (stakeType === '25%') {
      price = valuation.minority25Price;
      percentage = 25;
    } else if (stakeType === '10%') {
      price = valuation.minority10Price;
      percentage = 10;
    }

    const state = gameState.getState();
    if (state.cash < price) {
      return { success: false, message: `Недостаточно средств. Требуется $${price.toLocaleString()}` };
    }

    economy.removeMoney(
      price,
      stakeType === '100%' ? 'M&A Поглощение корпорации' : `Покупка ${percentage}% пакета акций`,
      `Приобретение доли в "${comp.name}"`,
      'investment'
    );

    if (stakeType === '100%') {
      // 100% Absorption into Holding as a Subsidiary
      const newSub: SubsidiaryCompany = {
        id: `sub_mna_${comp.id}`,
        name: `${comp.name} (Acquired)`,
        sector: comp.sector,
        ceoName: `Экс-CEO: ${comp.ceoName}`,
        foundedDay: state.gameTime.totalDays,
        capital: comp.cash,
        valuation: valuation.finalValuation,
        dailyRevenue: comp.dailyRevenue,
        dailyExpenses: comp.dailyExpenses,
        dailyProfit: comp.dailyProfit,
        marketShare: comp.marketShare,
        ownershipPercent: 100,
        status: 'active',
        acquiredFromAIId: comp.id,
        consolidatedBranches: ['retail', 'industrial', 'logistics'],
        assetCount: comp.stores + comp.factories + comp.realEstateCount,
        employees: comp.employees,
      };

      this.holdingState.subsidiaries.push(newSub);

      // Transfer competitor stores/factories/assets into player empire
      comp.status = 'bankrupt';
      comp.isBankrupt = true;
      comp.marketShare = 0;

      this.recalculateConsolidatedFinancials();

      return {
        success: true,
        message: `🏆 Полное поглощение завершено! Корпорация "${comp.name}" куплена за $${price.toLocaleString()} и вошла в ваш холдинг как дочерняя компания! Все активы и клиенты теперь ваши!`,
      };
    } else {
      // Partial equity acquisition
      const existingSub = this.holdingState.subsidiaries.find((s) => s.acquiredFromAIId === comp.id);
      if (existingSub) {
        existingSub.ownershipPercent = Math.min(100, existingSub.ownershipPercent + percentage);
      } else {
        const partialSub: SubsidiaryCompany = {
          id: `sub_part_${comp.id}`,
          name: `${comp.name} (${percentage}% доля)`,
          sector: comp.sector,
          ceoName: comp.ceoName,
          foundedDay: state.gameTime.totalDays,
          capital: Math.round(comp.cash * (percentage / 100)),
          valuation: Math.round(valuation.finalValuation * (percentage / 100)),
          dailyRevenue: Math.round(comp.dailyRevenue * (percentage / 100)),
          dailyExpenses: Math.round(comp.dailyExpenses * (percentage / 100)),
          dailyProfit: Math.round(comp.dailyProfit * (percentage / 100)),
          marketShare: Number((comp.marketShare * (percentage / 100)).toFixed(1)),
          ownershipPercent: percentage,
          status: 'active',
          acquiredFromAIId: comp.id,
          consolidatedBranches: ['investments'],
          assetCount: 1,
          employees: Math.round(comp.employees * (percentage / 100)),
        };
        this.holdingState.subsidiaries.push(partialSub);
      }

      this.recalculateConsolidatedFinancials();

      return {
        success: true,
        message: `🤝 Сделка заключена! Вы приобрели ${percentage}% акций "${comp.name}" за $${price.toLocaleString()}. Дивиденды и доля в выручке теперь поступают в ваш холдинг!`,
      };
    }
  }

  // ==========================================
  // IPO ENGINE (ПЕРВИЧНОЕ РАЗМЕЩЕНИЕ НА БИРЖЕ)
  // ==========================================

  public launchIPO(ticker: string, publicFloatPercent: number, dividendYield: number): { success: boolean; message: string } {
    if (!this.holdingState.established) {
      return { success: false, message: 'Для выхода на IPO сначала создайте Холдинг' };
    }
    if (this.holdingState.ipo.isPublic) {
      return { success: false, message: 'Холдинг уже является публичной корпорацией на бирже' };
    }
    if (!ticker.trim() || ticker.length < 2 || ticker.length > 5) {
      return { success: false, message: 'Тикер акции должен содержать от 2 до 5 символов (например: BEU, EMP)' };
    }
    if (publicFloatPercent < 10 || publicFloatPercent > 49) {
      return { success: false, message: 'Размер публичного пакета (Float) должен быть от 10% до 49% (чтобы сохранить контроль)' };
    }

    this.recalculateConsolidatedFinancials();
    const netWorth = this.holdingState.totalConsolidatedNetWorth;
    const annualProfit = this.holdingState.totalConsolidatedDailyProfit * 365;

    if (netWorth < 50000000) {
      return { success: false, message: 'Минимальная консолидированная стоимость холдинга для IPO — $50,000,000' };
    }

    // Investment Bankers Pre-IPO Market Cap Valuation
    const peMultiple = 16.5;
    const preMoneyValuation = Math.max(netWorth * 1.2, annualProfit * peMultiple);
    const totalShares = 100000000;
    const sharePrice = Math.max(10, Math.round(preMoneyValuation / totalShares));
    const marketCap = sharePrice * totalShares;

    const publicShares = Math.round(totalShares * (publicFloatPercent / 100));
    const playerShares = totalShares - publicShares;
    const capitalRaised = Math.round(publicShares * sharePrice);

    // Credit raised IPO funds to player cash
    economy.addMoney(
      capitalRaised,
      'IPO Размещение акций',
      `Привлечение публичного капитала на IPO биржи ($${(capitalRaised / 1000000).toFixed(1)}M за ${publicFloatPercent}% акций)`,
      'investment'
    );

    this.holdingState.ipo = {
      isPublic: true,
      ipoDay: gameState.getState().gameTime.totalDays,
      ticker: ticker.toUpperCase().trim(),
      companyName: this.holdingState.name,
      sharesOutstanding: totalShares,
      publicFloatPercent,
      playerShares,
      publicShares,
      ipoPrice: sharePrice,
      currentSharePrice: sharePrice,
      previousSharePrice: sharePrice,
      priceHistory: [sharePrice, sharePrice, sharePrice],
      marketCap,
      capitalRaisedAtIPO: capitalRaised,
      quarterlyDividendPerShare: Math.max(0.1, Number(((sharePrice * dividendYield) / 4).toFixed(2))),
      dividendYield: Number(dividendYield.toFixed(3)),
      shareholderSatisfaction: 90,
      quarterlyProfitTarget: Math.round((annualProfit / 4) * 1.05),
      currentQuarterProfit: 0,
      peRatio: Number((marketCap / Math.max(1, annualProfit)).toFixed(1)),
    };

    return {
      success: true,
      message: `🔔 ЗВОНОК НА БИРЖЕ! Холдинг "${this.holdingState.name}" провел IPO с тикером $${ticker.toUpperCase()}! Привлечено $${capitalRaised.toLocaleString()} живого капитала! Капитализация: $${marketCap.toLocaleString()}.`,
    };
  }

  public executeShareBuyback(sharesCount: number): { success: boolean; message: string } {
    const ipo = this.holdingState.ipo;
    if (!ipo.isPublic) return { success: false, message: 'Компания не на бирже' };
    if (sharesCount <= 0 || sharesCount > ipo.publicShares) {
      return { success: false, message: `Можно выкупить максимум ${ipo.publicShares.toLocaleString()} публичных акций` };
    }

    const cost = Math.round(sharesCount * ipo.currentSharePrice);
    const state = gameState.getState();

    if (state.cash < cost) {
      return { success: false, message: `Недостаточно средств для байбэка. Требуется $${cost.toLocaleString()}` };
    }

    economy.removeMoney(cost, 'Share Buyback (Обратный выкуп)', `Выкуп ${sharesCount.toLocaleString()} акций $${ipo.ticker}`, 'investment');

    ipo.playerShares += sharesCount;
    ipo.publicShares -= sharesCount;
    ipo.publicFloatPercent = Number(((ipo.publicShares / ipo.sharesOutstanding) * 100).toFixed(1));
    ipo.currentSharePrice = Number((ipo.currentSharePrice * 1.04).toFixed(2)); // Buyback drives price up!
    ipo.shareholderSatisfaction = Math.min(100, ipo.shareholderSatisfaction + 5);

    return {
      success: true,
      message: `📈 Buyback завершен! Выкуплено ${sharesCount.toLocaleString()} акций за $${cost.toLocaleString()}. Доля владения увеличилась до ${(100 - ipo.publicFloatPercent).toFixed(1)}%, котировки выросли!`,
    };
  }

  public executeSecondaryOffering(sharesPercent: number): { success: boolean; message: string } {
    const ipo = this.holdingState.ipo;
    if (!ipo.isPublic) return { success: false, message: 'Компания не на бирже' };
    if (ipo.publicFloatPercent + sharesPercent > 60) {
      return { success: false, message: 'Нельзя продавать более 60% акций (угроза потери контроля)' };
    }

    const sharesToSell = Math.round(ipo.sharesOutstanding * (sharesPercent / 100));
    const proceeds = Math.round(sharesToSell * ipo.currentSharePrice * 0.95); // 5% underwriting fee

    economy.addMoney(proceeds, 'Secondary Offering (SPO)', `Дополнительное размещение ${sharesPercent}% акций $${ipo.ticker}`, 'investment');

    ipo.playerShares -= sharesToSell;
    ipo.publicShares += sharesToSell;
    ipo.publicFloatPercent = Number(((ipo.publicShares / ipo.sharesOutstanding) * 100).toFixed(1));
    ipo.currentSharePrice = Number((ipo.currentSharePrice * 0.97).toFixed(2)); // Slight dilution

    return {
      success: true,
      message: `💵 SPO завершено! Привлечено $${proceeds.toLocaleString()} за счет продажи ${sharesPercent}% акций.`,
    };
  }

  // ==========================================
  // ENDGAME: GLOBAL TRADE & SOVEREIGN INVESTMENTS
  // ==========================================

  public activateGlobalTradeRoute(routeId: string): { success: boolean; message: string } {
    const route = this.holdingState.globalTradeRoutes.find((r) => r.id === routeId);
    if (!route) return { success: false, message: 'Маршрут не найден' };
    if (route.active) return { success: false, message: 'Маршрут уже активен' };
    if (this.holdingState.megacorpTier < route.requiredMegacorpTier) {
      return { success: false, message: `Требуется статус Мегакорпорации Уровня ${route.requiredMegacorpTier}` };
    }

    const state = gameState.getState();
    if (state.cash < route.investmentCost) {
      return { success: false, message: `Недостаточно средств. Требуется $${route.investmentCost.toLocaleString()}` };
    }

    economy.removeMoney(route.investmentCost, 'Глобальный торговый коридор', `Запуск флота на маршруте "${route.name}"`, 'investment');

    route.active = true;
    this.recalculateConsolidatedFinancials();

    return {
      success: true,
      message: `🚢 Международный маршрут "${route.name}" открыт! Ежедневная прибыль: +$${route.dailyProfit.toLocaleString()}/день.`,
    };
  }

  public purchaseGlobalInvestment(investmentId: string): { success: boolean; message: string } {
    const inv = this.holdingState.globalInvestments.find((i) => i.id === investmentId);
    if (!inv) return { success: false, message: 'Инвестиция не найдена' };
    if (inv.purchased) return { success: false, message: 'Данный суверенный актив уже приобретен' };
    if (this.holdingState.megacorpTier < inv.minMegacorpTier) {
      return { success: false, message: `Требуется статус Мегакорпорации Уровня ${inv.minMegacorpTier}` };
    }

    const state = gameState.getState();
    if (state.cash < inv.investmentCost) {
      return { success: false, message: `Недостаточно средств. Требуется $${inv.investmentCost.toLocaleString()}` };
    }

    economy.removeMoney(inv.investmentCost, 'Глобальные суверенные инвестиции', `Приобретение актива "${inv.name}"`, 'investment');

    inv.purchased = true;
    this.recalculateConsolidatedFinancials();

    return {
      success: true,
      message: `🌐 Суверенный актив "${inv.name}" приобретен! Ежедневный доход: +$${inv.dailyYield.toLocaleString()}/день (${inv.annualYieldPercent}% годовых).`,
    };
  }

  public toggleAntiTrustLobbying(): { success: boolean; message: string } {
    this.holdingState.antiTrustLobbyingActive = !this.holdingState.antiTrustLobbyingActive;
    return {
      success: true,
      message: this.holdingState.antiTrustLobbyingActive
        ? '🏛️ Антимонопольное лоббирование включено ($50,000/день). Риск штрафов регуляторов снижен на 90%!'
        : 'Антимонопольное лоббирование отключено.',
    };
  }

  // ==========================================
  // DAILY SIMULATION LOOP
  // ==========================================

  public processDailyHoldingTick(day: number): void {
    if (!this.holdingState.established) return;

    this.recalculateSynergies();
    this.recalculateConsolidatedFinancials();

    // 1. Process Subsidiaries daily profit into holding treasury/cash
    let subProfitSum = 0;
    for (const sub of this.holdingState.subsidiaries) {
      const net = Math.round(sub.dailyProfit * (sub.ownershipPercent / 100));
      subProfitSum += net;
    }

    // 2. Global Trade Routes Profit
    let tradeProfitSum = 0;
    for (const r of this.holdingState.globalTradeRoutes) {
      if (r.active) {
        tradeProfitSum += r.dailyProfit;
      }
    }

    // 3. Global Sovereign Investments Yield
    let invYieldSum = 0;
    for (const inv of this.holdingState.globalInvestments) {
      if (inv.purchased) {
        invYieldSum += inv.dailyYield;
      }
    }

    // 4. Monopoly bonus revenues
    let monopolyBonusSum = 0;
    for (const mono of this.holdingState.sectorMonopolies) {
      if (mono.monopolyBonusRevenuePercent > 0) {
        const bonus = Math.round(this.holdingState.totalConsolidatedDailyRevenue * (mono.monopolyBonusRevenuePercent / 1000));
        monopolyBonusSum += bonus;
      }
    }

    const totalDailyInflow = subProfitSum + tradeProfitSum + invYieldSum + monopolyBonusSum;
    if (totalDailyInflow > 0) {
      economy.addMoney(totalDailyInflow, 'Доход конгломерата и глобальных активов', 'Дивиденды дочерних компаний, торговые коридоры и суверенные облигации', 'revenue');
    }

    // 5. Anti-Trust Lobbying Expense
    if (this.holdingState.antiTrustLobbyingActive) {
      economy.removeMoney(50000, 'Лоббирование регуляторов', 'Антимонопольная защита и юридический суверенитет', 'expense');
    }

    // 6. Public Stock Price Step (if IPO launched)
    if (this.holdingState.ipo.isPublic) {
      this.stepIPODailyPrice(day);
    }
  }

  private stepIPODailyPrice(day: number): void {
    const ipo = this.holdingState.ipo;
    const macro = worldEconomyEngine.getIndicators();
    const cycle = worldEconomyEngine.getState().economicCyclePhase;

    // Macro drift
    let drift = (Math.random() - 0.48) * 0.02;
    if (cycle === 'expansion') drift += 0.005;
    if (cycle === 'peak') drift += 0.008;
    if (cycle === 'recession') drift -= 0.009;

    // Profit performance vs expectation
    const dailyProfit = this.holdingState.totalConsolidatedDailyProfit;
    ipo.currentQuarterProfit += dailyProfit;

    if (dailyProfit > 1000000) drift += 0.003;

    ipo.previousSharePrice = ipo.currentSharePrice;
    const newPrice = Math.max(5, Number((ipo.currentSharePrice * (1 + drift)).toFixed(2)));
    ipo.currentSharePrice = newPrice;
    ipo.marketCap = Math.round(newPrice * ipo.sharesOutstanding);
    ipo.peRatio = Number((ipo.marketCap / Math.max(1, dailyProfit * 365)).toFixed(1));

    // Keep 30-day price history
    ipo.priceHistory.push(newPrice);
    if (ipo.priceHistory.length > 30) {
      ipo.priceHistory.shift();
    }

    // Quarterly Dividend payout to public shareholders (every 90 days)
    if (day % 90 === 0 && ipo.publicShares > 0) {
      const totalDividendPayout = Math.round(ipo.publicShares * ipo.quarterlyDividendPerShare);
      economy.removeMoney(totalDividendPayout, 'Выплата дивидендов по акциям', `Квартальный дивиденд публичным акционерам $${ipo.ticker}`, 'expense');
      ipo.shareholderSatisfaction = Math.min(100, Math.round(ipo.shareholderSatisfaction + 4));
    }
  }
}

export const holdingManager = new HoldingManager();
