/**
 * Business Empire: Ultimate
 * World Economy & Macroeconomics Simulation Engine
 * Manages 7 real-time macro indicators, Central Bank monetary policy,
 * active multi-day market events, dynamic consequential news feed, and sector multipliers.
 */

import { gameState } from '../gameState';
import { gameLoop } from '../gameLoop';
import {
  WorldEconomyState,
  MacroIndicators,
  ActiveEconomicEvent,
  MacroNewsItem,
  CentralBankState,
  EconomicEventDefinition,
  MacroHistoryPoint,
  MacroCyclePhase,
} from '../../types/worldEconomy';
import { GLOBAL_ECONOMIC_EVENTS_CATALOG } from './economicEventsCatalog';

export const INITIAL_MACRO_INDICATORS: MacroIndicators = {
  inflation: 3.8, // % per year
  interestRate: 5.25, // % Central Bank key rate
  consumerConfidence: 105, // Index (100 is neutral base, 20-180 range)
  unemployment: 4.6, // %
  economicGrowth: 2.6, // % GDP annual growth
  oilPrice: 78.5, // $ / bbl
  transportCost: 1.0, // Base freight multiplier (1.00x)
};

export const INITIAL_CENTRAL_BANK_STATE: CentralBankState = {
  targetInflation: 2.5,
  nextMeetingDays: 14,
  sentiment: 'neutral',
  lastDecisionSummary: 'Ставка сохранена на уровне 5.25% в рамках таргетирования инфляции.',
  projectedRateChange: 0.0,
};

export const INITIAL_WORLD_ECONOMY_STATE: WorldEconomyState = {
  indicators: { ...INITIAL_MACRO_INDICATORS },
  baseIndicators: { ...INITIAL_MACRO_INDICATORS },
  history: [],
  activeEvents: [],
  newsFeed: [],
  centralBank: { ...INITIAL_CENTRAL_BANK_STATE },
  economicCyclePhase: 'expansion',
  lastEventSpawnDay: 0,
};

class WorldEconomyEngine {
  private isInitialized = false;

  constructor() {
    this.init();

    // Hook daily update to central game loop
    gameLoop.onDay((currentTime) => {
      this.processDailyMacroEconomics(currentTime.totalDays, currentTime.day, currentTime.month, currentTime.year);
    });
  }

  /**
   * Initializes state and seeds initial historical points and initial breaking news
   */
  public init(): void {
    if (this.isInitialized) return;

    gameState.update((draft: any) => {
      if (!draft.worldEconomy) {
        draft.worldEconomy = JSON.parse(JSON.stringify(INITIAL_WORLD_ECONOMY_STATE));
        this.seedInitialHistory(draft.worldEconomy);
        this.seedInitialEvent(draft.worldEconomy);
      } else {
        // Migration safeguard
        if (!draft.worldEconomy.indicators) draft.worldEconomy.indicators = { ...INITIAL_MACRO_INDICATORS };
        if (!draft.worldEconomy.history) draft.worldEconomy.history = [];
        if (!draft.worldEconomy.activeEvents) draft.worldEconomy.activeEvents = [];
        if (!draft.worldEconomy.newsFeed) draft.worldEconomy.newsFeed = [];
        if (!draft.worldEconomy.centralBank) draft.worldEconomy.centralBank = { ...INITIAL_CENTRAL_BANK_STATE };
        if (draft.worldEconomy.history.length === 0) {
          this.seedInitialHistory(draft.worldEconomy);
        }
      }
    });

    this.isInitialized = true;
  }

  private seedInitialHistory(economyState: WorldEconomyState): void {
    const history: MacroHistoryPoint[] = [];
    const base = economyState.indicators;

    for (let i = 30; i >= 1; i--) {
      const noise = (Math.sin(i * 0.3) + Math.cos(i * 0.5)) * 0.5;
      history.push({
        day: -i,
        dateStr: `День ${Math.max(1, 30 - i)}`,
        inflation: Math.round((base.inflation + noise * 0.4) * 10) / 10,
        interestRate: Math.round((base.interestRate + (noise > 0.3 ? 0.25 : 0)) * 100) / 100,
        consumerConfidence: Math.round(base.consumerConfidence + noise * 6),
        unemployment: Math.round((base.unemployment - noise * 0.3) * 10) / 10,
        economicGrowth: Math.round((base.economicGrowth + noise * 0.6) * 10) / 10,
        oilPrice: Math.round((base.oilPrice + noise * 4.5) * 10) / 10,
        transportCost: Math.round((1.0 + noise * 0.05) * 100) / 100,
      });
    }

    economyState.history = history;
  }

  private seedInitialEvent(economyState: WorldEconomyState): void {
    // Seed initial event: Economic Boom
    const boomDef = GLOBAL_ECONOMIC_EVENTS_CATALOG.find((e) => e.id === 'evt_economic_boom') || GLOBAL_ECONOMIC_EVENTS_CATALOG[0];
    const initialActive: ActiveEconomicEvent = {
      id: `act_${Date.now()}_init`,
      definitionId: boomDef.id,
      title: boomDef.title,
      category: boomDef.category,
      severity: boomDef.severity,
      icon: boomDef.icon,
      description: boomDef.description,
      consequences: [...boomDef.consequences],
      startDay: 1,
      durationDays: 24,
      remainingDays: 24,
      modifiers: { ...boomDef.modifiers },
      newsHeadline: boomDef.newsHeadline,
      newsBody: boomDef.newsBody,
    };

    economyState.activeEvents.push(initialActive);

    // Initial breaking news
    economyState.newsFeed.unshift({
      id: `news_${Date.now()}_init`,
      day: 1,
      timestamp: Date.now(),
      headline: boomDef.newsHeadline,
      summary: boomDef.newsBody,
      category: boomDef.category,
      severity: boomDef.severity,
      icon: boomDef.icon,
      isBreaking: true,
      eventId: initialActive.id,
      impactMetrics: [
        { label: 'ВВП', value: '+3.5%', trend: 'up', isPositive: true },
        { label: 'Доверие потребителей', value: '+25 п.', trend: 'up', isPositive: true },
        { label: 'Выручка ритейла', value: '+25%', trend: 'up', isPositive: true },
        { label: 'Инфляция', value: '+1.2%', trend: 'up', isPositive: false },
      ],
    });
  }

  /**
   * Daily step for global economy
   */
  public processDailyMacroEconomics(totalDays: number, day: number, month: number, year: number): void {
    gameState.update((draft: any) => {
      if (!draft.worldEconomy) {
        draft.worldEconomy = JSON.parse(JSON.stringify(INITIAL_WORLD_ECONOMY_STATE));
      }

      const economyState: WorldEconomyState = draft.worldEconomy;

      // 1. Process active events countdown
      for (let i = economyState.activeEvents.length - 1; i >= 0; i--) {
        const ev = economyState.activeEvents[i];
        ev.remainingDays -= 1;

        if (ev.remainingDays <= 0) {
          // Event expired
          economyState.activeEvents.splice(i, 1);

          // Log news about event conclusion
          economyState.newsFeed.unshift({
            id: `news_end_${Date.now()}_${i}`,
            day: totalDays,
            timestamp: Date.now(),
            headline: `Завершение события: ${ev.title}`,
            summary: `Эффект от «${ev.title}» исчерпан. Рыночные показатели возвращаются к равновесным значениям.`,
            category: ev.category,
            severity: 'minor',
            icon: '✅',
            isBreaking: false,
            impactMetrics: [
              { label: 'Рынок', value: 'Нормализация', trend: 'neutral', isPositive: true },
            ],
          });
        }
      }

      // 2. Check for spawning a new event (keep 1 to 3 simultaneous active events)
      const canSpawn = economyState.activeEvents.length < 3 && (totalDays - economyState.lastEventSpawnDay >= 6 || economyState.activeEvents.length === 0);
      
      if (canSpawn) {
        // Chance to spawn on any given day: ~35%
        if (Math.random() < 0.38 || economyState.activeEvents.length === 0) {
          this.spawnRandomEvent(economyState, totalDays);
        }
      }

      // 3. Central Bank meeting countdown & policy reaction
      this.processCentralBankPolicy(economyState, totalDays);

      // 4. Calculate effective macro indicators
      this.recalculateMacroIndicators(economyState, totalDays);

      // 5. Record daily history snapshot
      const ind = economyState.indicators;
      economyState.history.push({
        day: totalDays,
        dateStr: `День ${totalDays}`,
        inflation: ind.inflation,
        interestRate: ind.interestRate,
        consumerConfidence: ind.consumerConfidence,
        unemployment: ind.unemployment,
        economicGrowth: ind.economicGrowth,
        oilPrice: ind.oilPrice,
        transportCost: ind.transportCost,
      });

      // Keep max 90 days of history
      if (economyState.history.length > 90) {
        economyState.history = economyState.history.slice(-90);
      }

      // Keep max 50 news items
      if (economyState.newsFeed.length > 50) {
        economyState.newsFeed = economyState.newsFeed.slice(0, 50);
      }
    });
  }

  /**
   * Spawns a new random event from the catalog
   */
  private spawnRandomEvent(economyState: WorldEconomyState, currentDay: number): void {
    const activeDefIds = new Set(economyState.activeEvents.map((e) => e.definitionId));
    const available = GLOBAL_ECONOMIC_EVENTS_CATALOG.filter((e) => !activeDefIds.has(e.id));

    if (available.length === 0) return;

    const chosen = available[Math.floor(Math.random() * available.length)];
    const duration = Math.floor(
      chosen.durationDaysMin + Math.random() * (chosen.durationDaysMax - chosen.durationDaysMin + 1)
    );

    const activeEv: ActiveEconomicEvent = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      definitionId: chosen.id,
      title: chosen.title,
      category: chosen.category,
      severity: chosen.severity,
      icon: chosen.icon,
      description: chosen.description,
      consequences: [...chosen.consequences],
      startDay: currentDay,
      durationDays: duration,
      remainingDays: duration,
      modifiers: { ...chosen.modifiers },
      newsHeadline: chosen.newsHeadline,
      newsBody: chosen.newsBody,
    };

    economyState.activeEvents.push(activeEv);
    economyState.lastEventSpawnDay = currentDay;

    // Convert modifiers into quantified impact metrics for news card
    const impactMetrics: { label: string; value: string; trend: 'up' | 'down' | 'neutral'; isPositive: boolean }[] = [];

    if (chosen.modifiers.oilPricePercentChange) {
      const pct = Math.round(chosen.modifiers.oilPricePercentChange * 100);
      impactMetrics.push({
        label: 'Нефть Brent',
        value: `${pct > 0 ? '+' : ''}${pct}%`,
        trend: pct > 0 ? 'up' : 'down',
        isPositive: pct < 0,
      });
    }

    if (chosen.modifiers.transportCostPercentChange) {
      const pct = Math.round(chosen.modifiers.transportCostPercentChange * 100);
      impactMetrics.push({
        label: 'Транспорт и логистика',
        value: `${pct > 0 ? '+' : ''}${pct}%`,
        trend: pct > 0 ? 'up' : 'down',
        isPositive: pct < 0,
      });
    }

    if (chosen.modifiers.economicGrowthDelta) {
      const delta = chosen.modifiers.economicGrowthDelta;
      impactMetrics.push({
        label: 'ВВП',
        value: `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`,
        trend: delta > 0 ? 'up' : 'down',
        isPositive: delta > 0,
      });
    }

    if (chosen.modifiers.consumerConfidenceDelta) {
      const delta = chosen.modifiers.consumerConfidenceDelta;
      impactMetrics.push({
        label: 'Индекс доверия',
        value: `${delta > 0 ? '+' : ''}${delta} п.`,
        trend: delta > 0 ? 'up' : 'down',
        isPositive: delta > 0,
      });
    }

    if (chosen.modifiers.retailSalesMultiplier && chosen.modifiers.retailSalesMultiplier !== 1.0) {
      const pct = Math.round((chosen.modifiers.retailSalesMultiplier - 1.0) * 100);
      impactMetrics.push({
        label: 'Продажи в ритейле',
        value: `${pct > 0 ? '+' : ''}${pct}%`,
        trend: pct > 0 ? 'up' : 'down',
        isPositive: pct > 0,
      });
    }

    if (chosen.modifiers.productionCostMultiplier && chosen.modifiers.productionCostMultiplier !== 1.0) {
      const pct = Math.round((chosen.modifiers.productionCostMultiplier - 1.0) * 100);
      impactMetrics.push({
        label: 'Себестоимость заводов',
        value: `${pct > 0 ? '+' : ''}${pct}%`,
        trend: pct > 0 ? 'up' : 'down',
        isPositive: pct < 0,
      });
    }

    if (chosen.modifiers.inflationDelta) {
      const delta = chosen.modifiers.inflationDelta;
      impactMetrics.push({
        label: 'Инфляция',
        value: `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`,
        trend: delta > 0 ? 'up' : 'down',
        isPositive: delta < 0,
      });
    }

    // Push breaking news item
    economyState.newsFeed.unshift({
      id: `news_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      day: currentDay,
      timestamp: Date.now(),
      headline: chosen.newsHeadline,
      summary: chosen.newsBody,
      category: chosen.category,
      severity: chosen.severity,
      icon: chosen.icon,
      isBreaking: chosen.severity === 'critical' || chosen.severity === 'boom' || chosen.severity === 'major',
      eventId: activeEv.id,
      impactMetrics: impactMetrics.slice(0, 4),
    });
  }

  /**
   * Central Bank AI logic: monitors inflation and growth, decides key rate adjustments
   */
  private processCentralBankPolicy(economyState: WorldEconomyState, totalDays: number): void {
    const cb = economyState.centralBank;
    cb.nextMeetingDays -= 1;

    // Estimate sentiment & projected rate change ahead of meeting
    const ind = economyState.indicators;
    const inflationGap = ind.inflation - cb.targetInflation;

    if (inflationGap > 2.0) {
      cb.sentiment = 'hawkish';
      cb.projectedRateChange = 0.5;
    } else if (inflationGap > 0.8) {
      cb.sentiment = 'hawkish';
      cb.projectedRateChange = 0.25;
    } else if (ind.economicGrowth < 0.5 || ind.unemployment > 6.5) {
      cb.sentiment = 'dovish';
      cb.projectedRateChange = -0.5;
    } else if (inflationGap < -0.5) {
      cb.sentiment = 'dovish';
      cb.projectedRateChange = -0.25;
    } else {
      cb.sentiment = 'neutral';
      cb.projectedRateChange = 0.0;
    }

    // Meeting Day!
    if (cb.nextMeetingDays <= 0) {
      cb.nextMeetingDays = 30; // Next meeting in 30 days
      const rateDelta = cb.projectedRateChange;

      if (rateDelta !== 0) {
        economyState.baseIndicators.interestRate = Math.max(
          1.0,
          Math.min(18.0, Math.round((economyState.baseIndicators.interestRate + rateDelta) * 100) / 100)
        );

        cb.lastDecisionSummary = `Решением Совета Директоров ключевая ставка ${
          rateDelta > 0 ? 'повышена' : 'снижена'
        } на ${Math.abs(rateDelta).toFixed(2)}% до ${economyState.baseIndicators.interestRate.toFixed(2)}%.`;

        economyState.newsFeed.unshift({
          id: `news_cb_${Date.now()}`,
          day: totalDays,
          timestamp: Date.now(),
          headline: `Решение ЦБ: ключевая ставка изменена на ${rateDelta > 0 ? '+' : ''}${rateDelta.toFixed(2)}%`,
          summary: cb.lastDecisionSummary,
          category: 'monetary_policy',
          severity: Math.abs(rateDelta) >= 0.5 ? 'major' : 'moderate',
          icon: '🏛️',
          isBreaking: true,
          impactMetrics: [
            { label: 'Ключевая ставка', value: `${economyState.baseIndicators.interestRate.toFixed(2)}%`, trend: rateDelta > 0 ? 'up' : 'down', isPositive: rateDelta < 0 },
            { label: 'Кредиты бизнесу', value: rateDelta > 0 ? 'Дорожают' : 'Дешевеют', trend: rateDelta > 0 ? 'up' : 'down', isPositive: rateDelta < 0 },
            { label: 'Депозиты', value: rateDelta > 0 ? 'Выше доходность' : 'Ниже доходность', trend: rateDelta > 0 ? 'up' : 'down', isPositive: rateDelta > 0 },
          ],
        });
      } else {
        cb.lastDecisionSummary = `Регулятор сохранил ключевую ставку на уровне ${economyState.baseIndicators.interestRate.toFixed(2)}%. ДКП остается нейтральной.`;
      }
    }
  }

  /**
   * Recalculates effective macro indicators from base values + active event modifiers + stochastic cycles
   */
  private recalculateMacroIndicators(economyState: WorldEconomyState, totalDays: number): void {
    const base = economyState.baseIndicators;

    // Aggregated modifiers from active events
    let infDelta = 0;
    let rateDelta = 0;
    let confDelta = 0;
    let unempDelta = 0;
    let growthDelta = 0;
    let oilPctChange = 0;
    let transportPctChange = 0;

    for (const ev of economyState.activeEvents) {
      const m = ev.modifiers;
      if (m.inflationDelta) infDelta += m.inflationDelta;
      if (m.interestRateDelta) rateDelta += m.interestRateDelta;
      if (m.consumerConfidenceDelta) confDelta += m.consumerConfidenceDelta;
      if (m.unemploymentDelta) unempDelta += m.unemploymentDelta;
      if (m.economicGrowthDelta) growthDelta += m.economicGrowthDelta;
      if (m.oilPricePercentChange) oilPctChange += m.oilPricePercentChange;
      if (m.transportCostPercentChange) transportPctChange += m.transportCostPercentChange;
    }

    // Micro organic daily drift (Brownian noise)
    const driftNoise = (Math.sin(totalDays * 0.2) + (Math.random() - 0.5) * 0.4) * 0.1;

    // 1. Economic Growth (GDP %)
    let growth = base.economicGrowth + growthDelta + driftNoise * 0.5;
    growth = Math.max(-8.0, Math.min(10.0, Math.round(growth * 10) / 10));

    // Determine cycle phase
    if (growth > 3.5) economyState.economicCyclePhase = 'expansion';
    else if (growth >= 1.5) economyState.economicCyclePhase = 'recovery';
    else if (growth >= 0.0) economyState.economicCyclePhase = 'peak';
    else economyState.economicCyclePhase = 'recession';

    // 2. Oil Price ($/bbl)
    let oil = base.oilPrice * (1.0 + oilPctChange) + driftNoise * 2.0;
    oil = Math.max(30.0, Math.min(175.0, Math.round(oil * 10) / 10));

    // 3. Transport Cost Index (multiplier base 1.00)
    // Directly driven by oil price + active logistics events
    const oilImpact = (oil - 75.0) / 150.0; // +/- 0.3
    let transport = (1.0 + oilImpact + transportPctChange);
    transport = Math.max(0.65, Math.min(2.5, Math.round(transport * 100) / 100));

    // 4. Inflation (%)
    // Pressured by oil, growth, transport cost & active event delta
    const oilInfPressure = (oil > 90 ? (oil - 90) * 0.03 : 0);
    let inf = base.inflation + infDelta + oilInfPressure + driftNoise * 0.2;
    inf = Math.max(0.5, Math.min(22.0, Math.round(inf * 10) / 10));

    // 5. Interest Rate (%)
    let interest = base.interestRate + rateDelta;
    interest = Math.max(1.0, Math.min(25.0, Math.round(interest * 100) / 100));

    // 6. Unemployment (%)
    // Inversely related to economic growth
    const growthJobImpact = (growth - 2.5) * -0.3;
    let unemp = base.unemployment + unempDelta + growthJobImpact + driftNoise * 0.1;
    unemp = Math.max(1.8, Math.min(16.5, Math.round(unemp * 10) / 10));

    // 7. Consumer Confidence Index (20 - 180, base 100)
    // Boosted by low unemployment, high growth, low inflation
    const macroSentiment = (growth * 2.5) - (inf * 1.5) - (unemp * 2.0);
    let conf = base.consumerConfidence + confDelta + macroSentiment;
    conf = Math.max(30, Math.min(170, Math.round(conf)));

    // Assign final indicators
    economyState.indicators = {
      inflation: inf,
      interestRate: interest,
      consumerConfidence: conf,
      unemployment: unemp,
      economicGrowth: growth,
      oilPrice: oil,
      transportCost: transport,
    };
  }

  // ==========================================
  // PUBLIC QUERY GETTERS FOR ALL GAME SUBSYSTEMS
  // ==========================================

  public getIndicators(): MacroIndicators {
    const s = gameState.getState().worldEconomy;
    return s?.indicators || INITIAL_MACRO_INDICATORS;
  }

  public getActiveEvents(): ActiveEconomicEvent[] {
    const s = gameState.getState().worldEconomy;
    return s?.activeEvents || [];
  }

  public getNewsFeed(): MacroNewsItem[] {
    const s = gameState.getState().worldEconomy;
    return s?.newsFeed || [];
  }

  public getCentralBank(): CentralBankState {
    const s = gameState.getState().worldEconomy;
    return s?.centralBank || INITIAL_CENTRAL_BANK_STATE;
  }

  /**
   * Returns current transport & freight cost multiplier (base 1.00)
   * Applied to truck fuel, delivery routes, goods shipments
   */
  public getTransportCostMultiplier(): number {
    return this.getIndicators().transportCost;
  }

  /**
   * Returns inflation multiplier on operational expenses & maintenance
   * e.g. 4% inflation = 1.04x base costs
   */
  public getInflationExpenseMultiplier(): number {
    const inf = this.getIndicators().inflation;
    return 1.0 + (inf / 100.0) * 0.5;
  }

  /**
   * Returns retail sales revenue & footfall multiplier (base 1.00)
   * Driven by consumer confidence, active retail events & GDP growth
   */
  public getRetailSalesMultiplier(): number {
    const ind = this.getIndicators();
    let mult = (ind.consumerConfidence / 100.0) * (1.0 + (ind.economicGrowth - 2.5) * 0.03);

    for (const ev of this.getActiveEvents()) {
      if (ev.modifiers.retailSalesMultiplier) {
        mult *= ev.modifiers.retailSalesMultiplier;
      }
    }

    return Math.max(0.4, Math.min(2.5, Math.round(mult * 100) / 100));
  }

  /**
   * Returns production & factory overhead cost multiplier (base 1.00)
   * Driven by oil price, inflation, and active industrial events
   */
  public getProductionCostMultiplier(): number {
    const ind = this.getIndicators();
    let mult = 1.0 + ((ind.oilPrice - 75.0) / 75.0) * 0.15 + (ind.inflation / 100.0) * 0.3;

    for (const ev of this.getActiveEvents()) {
      if (ev.modifiers.productionCostMultiplier) {
        mult *= ev.modifiers.productionCostMultiplier;
      }
    }

    return Math.max(0.6, Math.min(2.2, Math.round(mult * 100) / 100));
  }

  /**
   * Returns factory manufacturing output multiplier (base 1.00)
   */
  public getFactoryOutputMultiplier(): number {
    let mult = 1.0;
    for (const ev of this.getActiveEvents()) {
      if (ev.modifiers.factoryOutputMultiplier) {
        mult *= ev.modifiers.factoryOutputMultiplier;
      }
    }
    return Math.max(0.5, Math.min(2.0, Math.round(mult * 100) / 100));
  }

  /**
   * Returns car dealership demand multiplier (base 1.00)
   */
  public getCarSalesMultiplier(): number {
    const ind = this.getIndicators();
    let mult = (ind.consumerConfidence / 100.0) * (1.0 + (ind.economicGrowth - 2.0) * 0.04);

    for (const ev of this.getActiveEvents()) {
      if (ev.modifiers.carSalesMultiplier) {
        mult *= ev.modifiers.carSalesMultiplier;
      }
    }

    return Math.max(0.4, Math.min(2.5, Math.round(mult * 100) / 100));
  }

  /**
   * Returns real estate demand & rent occupancy multiplier (base 1.00)
   */
  public getRealEstateDemandMultiplier(): number {
    const ind = this.getIndicators();
    // High interest rates cool real estate demand
    const interestCooling = Math.max(-0.25, (5.0 - ind.interestRate) * 0.02);
    let mult = 1.0 + interestCooling + (ind.economicGrowth - 2.5) * 0.03;

    for (const ev of this.getActiveEvents()) {
      if (ev.modifiers.realEstateDemandMultiplier) {
        mult *= ev.modifiers.realEstateDemandMultiplier;
      }
    }

    return Math.max(0.5, Math.min(2.0, Math.round(mult * 100) / 100));
  }

  /**
   * Returns bank loan interest rate modifier (+/- %)
   */
  public getBankLoanRateModifier(): number {
    const ind = this.getIndicators();
    // Base shift from Central Bank interest rate
    let modifier = (ind.interestRate - 5.0) / 100.0;

    for (const ev of this.getActiveEvents()) {
      if (ev.modifiers.bankLoanRateModifier) {
        modifier += ev.modifiers.bankLoanRateModifier;
      }
    }

    return Math.round(modifier * 1000) / 1000;
  }

  /**
   * Returns general stock market valuation sentiment drift
   */
  public getStockMarketSentiment(): number {
    const ind = this.getIndicators();
    let sentiment = (ind.economicGrowth - 2.5) * 0.015 - (ind.interestRate - 5.0) * 0.01;

    for (const ev of this.getActiveEvents()) {
      if (ev.modifiers.stockMarketSentiment) {
        sentiment += ev.modifiers.stockMarketSentiment;
      }
    }

    return Math.round(sentiment * 1000) / 1000;
  }

  /**
   * Returns commodity specific price multiplier based on category
   */
  public getCommodityCategoryPriceMultiplier(categoryName: string): number {
    let mult = 1.0;
    for (const ev of this.getActiveEvents()) {
      if (ev.modifiers.commodityCategoryPriceMod) {
        const found = ev.modifiers.commodityCategoryPriceMod.find((c) => c.category === categoryName);
        if (found) {
          mult *= found.multiplier;
        }
      }
    }
    return Math.round(mult * 100) / 100;
  }
  public getState(): WorldEconomyState {
    const s = gameState.getState().worldEconomy;
    return s || INITIAL_WORLD_ECONOMY_STATE;
  }

  public getCyclePhase(): MacroCyclePhase {
    const s = gameState.getState().worldEconomy;
    return s?.economicCyclePhase || 'expansion';
  }
}

export const worldEconomyEngine = new WorldEconomyEngine();
