/**
 * Business Empire: Ultimate
 * Advanced AI Competitor Market Simulation Engine
 * Autonomous Multi-Corporate Ecosystem with 20+ Real-Time AI Tycoons
 */

import { gameState } from '../gameState';
import { gameLoop } from '../gameLoop';
import { economy } from '../economy';
import {
  AICompetitorCompany,
  AICompetitorAction,
  AIStrategy,
  AICreditRating,
  LeaderboardRankingItem,
} from '../../types/aiCompetitors';
import { INITIAL_AI_COMPANIES } from './competitorsData';
import { goodsMarket } from '../markets/goodsMarket';
import { stockExchangeManager } from '../markets/stockExchangeManager';
import { holdingManager } from '../holding/holdingManager';

class CompetitorMarketEngine {
  private companies: AICompetitorCompany[] = [];
  private companyMap: Map<string, AICompetitorCompany> = new Map();
  private actionFeed: AICompetitorAction[] = [];
  private isInitialized = false;

  constructor() {
    this.init();

    // Hook into daily game loop
    gameLoop.onDay((gameTime) => {
      this.processDailySimulation(gameTime.totalDays);
    });
  }

  /**
   * Initializes AI companies and hydrates 15-day synthetic history for sparklines
   */
  public init(): void {
    if (this.isInitialized) return;

    this.companies = JSON.parse(JSON.stringify(INITIAL_AI_COMPANIES));
    this.companyMap.clear();

    const curDay = gameState.getState()?.gameTime?.totalDays || 1;

    for (const c of this.companies) {
      this.companyMap.set(c.id, c);

      // Generate 15-day back-history if empty
      if (!c.history || c.history.length === 0) {
        c.history = [];
        let baseNw = c.netWorth * 0.88;
        let baseRev = c.dailyRevenue * 0.9;
        let baseCash = c.cash * 0.85;

        for (let d = Math.max(1, curDay - 15); d < curDay; d++) {
          const drift = (Math.random() - 0.46) * 0.03;
          baseNw = Math.round(baseNw * (1 + drift));
          baseRev = Math.round(baseRev * (1 + (Math.random() - 0.48) * 0.02));
          baseCash = Math.round(baseCash * (1 + drift * 0.8));
          const profit = Math.round(baseRev * 0.28);

          c.history.push({
            day: d,
            netWorth: baseNw,
            revenue: baseRev,
            profit,
            cash: baseCash,
          });
        }
      }
    }

    this.recalculateMarketShares();
    this.isInitialized = true;
  }

  public getCompanies(): AICompetitorCompany[] {
    return this.companies;
  }

  public getCompany(id: string): AICompetitorCompany | undefined {
    return this.companyMap.get(id);
  }

  public getActionFeed(): AICompetitorAction[] {
    return this.actionFeed;
  }

  /**
   * Main daily simulation routine
   */
  public processDailySimulation(currentDay: number): void {
    if (!this.isInitialized) this.init();

    // 1. Process finances for all 22 AI companies
    for (const comp of this.companies) {
      this.simulateCompanyDay(comp, currentDay);
    }

    // 2. Perform strategy-driven autonomous actions for a subset of companies each day
    this.executeStrategicActions(currentDay);

    // 3. Recalculate market dominance and sectoral shares
    this.recalculateMarketShares();

    // 4. Update GameState with AI corporate state
    gameState.update((draft: any) => {
      if (!draft.aiMarket) draft.aiMarket = {};
      draft.aiMarket.lastUpdateDay = currentDay;
    }, false);
  }

  /**
   * Simulates individual corporate daily accounting
   */
  private simulateCompanyDay(comp: AICompetitorCompany, currentDay: number): void {
    if (comp.isBankrupt) {
      comp.bankruptDaysCount += 1;
      // Chance of restructuring after 7-14 days
      if (comp.bankruptDaysCount >= 10 && Math.random() < 0.4) {
        this.restructureBankruptCompany(comp, currentDay);
      }
      return;
    }

    // Macro multiplier based on strategy
    const noise = (Math.random() - 0.47) * 0.06;
    let revGrowth = 1 + noise;

    // Physical assets contribute to revenue
    const storeRev = comp.stores * (12000 + Math.random() * 4000);
    const factoryRev = comp.factories * (38000 + Math.random() * 12000);
    const realEstateRent = comp.realEstateCount * (18000 + Math.random() * 6000);

    const calculatedBaseRevenue = storeRev + factoryRev + realEstateRent + (comp.netWorth * 0.0035);
    comp.dailyRevenue = Math.round(Math.max(50000, (comp.dailyRevenue * 0.6 + calculatedBaseRevenue * 0.4) * revGrowth));

    // Operating expenses: Staff payroll + maintenance + debt interest
    const payrollCost = comp.employees * (140 + Math.random() * 20);
    const maintenanceCost = (comp.stores * 1800) + (comp.factories * 6000) + (comp.realEstateCount * 2200) + (comp.carsCount * 80);
    const dailyDebtInterest = Math.round((comp.debt * 0.08) / 365); // 8% annual debt interest

    comp.dailyExpenses = Math.round(payrollCost + maintenanceCost + dailyDebtInterest + (comp.dailyRevenue * 0.45));
    comp.dailyProfit = comp.dailyRevenue - comp.dailyExpenses;

    // Apply profit/loss to cash
    comp.cash += comp.dailyProfit;
    comp.totalRevenue += comp.dailyRevenue;
    comp.totalProfit += comp.dailyProfit;

    // Check consecutive loss days
    if (comp.dailyProfit < 0) {
      comp.consecutiveLossDays += 1;
    } else {
      comp.consecutiveLossDays = Math.max(0, comp.consecutiveLossDays - 1);
    }

    // Calculate Asset Value
    let inventoryVal = 0;
    for (const [commId, qty] of Object.entries(comp.inventory)) {
      const comm = goodsMarket.getCommodity(commId);
      const price = comm ? comm.currentPrice : 50;
      inventoryVal += qty * price;
    }

    let stockVal = 0;
    for (const [ticker, shares] of Object.entries(comp.stockPortfolio)) {
      const stock = stockExchangeManager.getCompany(ticker);
      const price = stock ? stock.price : 100;
      stockVal += shares * price;
    }

    const storesValue = comp.stores * 750000;
    const factoriesValue = comp.factories * 2800000;
    const realEstateValue = comp.realEstateCount * 3200000;
    const carsValue = comp.carsCount * 65000;

    const totalAssets = comp.cash + inventoryVal + stockVal + storesValue + factoriesValue + realEstateValue + carsValue;
    comp.netWorth = Math.max(100000, totalAssets - comp.debt);

    // Update Credit Rating
    comp.creditRating = this.evaluateCreditRating(comp);

    // Update Status
    if (comp.netWorth > 90000000) comp.status = 'dominant';
    else if (comp.dailyProfit > 150000 && comp.consecutiveLossDays === 0) comp.status = 'growing';
    else if (comp.consecutiveLossDays > 10 || comp.cash < 0) comp.status = 'distressed';
    else comp.status = 'stable';

    // Insolvency & Bankruptcy Trigger
    if (comp.cash < -1500000 && comp.debt > comp.netWorth * 1.5 && comp.consecutiveLossDays > 18) {
      this.triggerBankruptcy(comp, currentDay);
      return;
    }

    // Append to 30-day history
    comp.history.push({
      day: currentDay,
      netWorth: comp.netWorth,
      revenue: comp.dailyRevenue,
      profit: comp.dailyProfit,
      cash: comp.cash,
    });
    if (comp.history.length > 30) comp.history.shift();
  }

  /**
   * Evaluates corporate credit rating (AAA down to D)
   */
  private evaluateCreditRating(c: AICompetitorCompany): AICreditRating {
    if (c.isBankrupt) return 'D';
    if (c.cash < -500000 || c.consecutiveLossDays > 12) return 'CCC';
    const debtRatio = c.debt / Math.max(1, c.netWorth);
    if (debtRatio > 0.6) return 'B';
    if (debtRatio > 0.4) return 'BB';
    if (debtRatio > 0.25) return 'BBB';
    if (debtRatio > 0.12 && c.netWorth > 30000000) return 'A';
    if (debtRatio > 0.05 && c.netWorth > 50000000) return 'AA';
    return 'AAA';
  }

  /**
   * Executes AI strategic actions according to company character
   */
  private executeStrategicActions(currentDay: number): void {
    // Pick 4 to 8 companies randomly each day to perform strategic market actions
    const candidateIndices = Array.from({ length: this.companies.length }, (_, i) => i)
      .sort(() => Math.random() - 0.5)
      .slice(0, 5 + Math.floor(Math.random() * 4));

    for (const idx of candidateIndices) {
      const comp = this.companies[idx];
      if (!comp || comp.isBankrupt) continue;

      switch (comp.strategy) {
        case 'aggressive':
          this.executeAggressiveStrategy(comp, currentDay);
          break;
        case 'conservative':
          this.executeConservativeStrategy(comp, currentDay);
          break;
        case 'trading':
          this.executeTradingStrategy(comp, currentDay);
          break;
        case 'industrial':
          this.executeIndustrialStrategy(comp, currentDay);
          break;
        case 'retail':
          this.executeRetailStrategy(comp, currentDay);
          break;
        case 'investment':
          this.executeInvestmentStrategy(comp, currentDay);
          break;
      }
    }
  }

  /**
   * Aggressive Strategy: rapid leveraged expansion, factory building, debt usage
   */
  private executeAggressiveStrategy(comp: AICompetitorCompany, day: number): void {
    // If cash is low, take out bank loan
    if (comp.cash < comp.netWorth * 0.15 && comp.debt < comp.netWorth * 0.5) {
      const loanAmount = Math.round(2000000 + Math.random() * 3000000);
      comp.cash += loanAmount;
      comp.debt += loanAmount;
      this.recordAction({
        id: `act_${day}_${comp.id}_loan`,
        day,
        timestamp: Date.now(),
        companyId: comp.id,
        companyName: comp.name,
        actionType: 'take_loan',
        title: 'Привлечение кредитной линии',
        description: `${comp.name} привлекла синдицированный кредит на сумму $${(loanAmount / 1000000).toFixed(1)}M для финансирования экспансии.`,
        amount: loanAmount,
        impact: 'Рост долговой нагрузки, увеличение инвестиционного кэша',
        icon: '💳',
      }, comp);
      return;
    }

    // Build factory or acquire commercial real estate
    if (comp.cash >= 3500000) {
      const cost = 2800000;
      comp.cash -= cost;
      comp.factories += 1;
      comp.employees += 80;
      comp.reputation = Math.min(100, comp.reputation + 1);

      this.recordAction({
        id: `act_${day}_${comp.id}_fact`,
        day,
        timestamp: Date.now(),
        companyId: comp.id,
        companyName: comp.name,
        actionType: 'build_factory',
        title: 'Строительство промышленного комплекса',
        description: `${comp.name} ввела в эксплуатацию новый высокотехнологичный производственный комплекс ($${(cost / 1000000).toFixed(1)}M).`,
        amount: cost,
        impact: '+80 рабочих мест, увеличение производственных мощностей',
        icon: '🏭',
      }, comp);
    } else if (comp.cash >= 1200000) {
      // Open stores
      const cost = 750000;
      comp.cash -= cost;
      comp.stores += 2;
      comp.employees += 35;

      this.recordAction({
        id: `act_${day}_${comp.id}_store`,
        day,
        timestamp: Date.now(),
        companyId: comp.id,
        companyName: comp.name,
        actionType: 'open_store',
        title: 'Открытие торговых филиалов',
        description: `${comp.name} открыла 2 новых флагманских магазина для захвата клиентского трафика.`,
        amount: cost,
        impact: 'Увеличение выручки и доли сектора',
        icon: '🏪',
      }, comp);
    }
  }

  /**
   * Conservative Strategy: debt reduction, stable cash reserves, REIT & dividend acquisitions
   */
  private executeConservativeStrategy(comp: AICompetitorCompany, day: number): void {
    // Pay off debt if any
    if (comp.debt > 0 && comp.cash > comp.netWorth * 0.25) {
      const repayAmount = Math.min(comp.debt, Math.round(comp.cash * 0.3));
      comp.debt -= repayAmount;
      comp.cash -= repayAmount;

      this.recordAction({
        id: `act_${day}_${comp.id}_repay`,
        day,
        timestamp: Date.now(),
        companyId: comp.id,
        companyName: comp.name,
        actionType: 'repay_loan',
        title: 'Досрочное погашение долговых обязательств',
        description: `${comp.name} выплатила $${(repayAmount / 1000000).toFixed(1)}M кредитов, укрепив кредитный рейтинг.`,
        amount: repayAmount,
        impact: 'Снижение процентных расходов, рост финансовой устойчивости',
        icon: '🛡️',
      }, comp);
      return;
    }

    // Buy premium real estate for passive rental cashflow
    if (comp.cash >= 4000000) {
      const cost = 3200000;
      comp.cash -= cost;
      comp.realEstateCount += 1;

      this.recordAction({
        id: `act_${day}_${comp.id}_re`,
        day,
        timestamp: Date.now(),
        companyId: comp.id,
        companyName: comp.name,
        actionType: 'buy_real_estate',
        title: 'Приобретение коммерческой недвижимости',
        description: `${comp.name} приобрела бизнес-центр класса А за $${(cost / 1000000).toFixed(1)}M для стабильного арендного дохода.`,
        amount: cost,
        impact: 'Рост стабильного пассивного дохода',
        icon: '🏙️',
      }, comp);
    }
  }

  /**
   * Trading Strategy: commodity arbitrage, vehicle acquisitions, wholesale movements
   */
  private executeTradingStrategy(comp: AICompetitorCompany, day: number): void {
    const commodities = goodsMarket.getCommodities();
    if (commodities.length === 0) return;

    // Pick a commodity
    const comm = commodities[Math.floor(Math.random() * commodities.length)];
    if (!comm) return;

    const price = comm.currentPrice;
    const isCheap = price <= comm.basePrice * 0.95;
    const heldQty = comp.inventory[comm.id] || 0;

    if (isCheap && comp.cash >= 800000) {
      // BUY commodity in bulk (drives market demand and price up)
      const buySpend = Math.min(comp.cash * 0.35, 1500000);
      const qty = Math.floor(buySpend / price);
      if (qty > 0) {
        comp.cash -= qty * price;
        comp.inventory[comm.id] = heldQty + qty;

        // Influence Goods Market: Increase demand, reduce free supply, boost price
        comm.demand = Math.min(2.5, comm.demand + 0.12);
        comm.supply = Math.max(0.2, comm.supply - 0.08);
        comm.currentPrice = Math.round(comm.currentPrice * 1.025 * 100) / 100;

        this.recordAction({
          id: `act_${day}_${comp.id}_trade_buy`,
          day,
          timestamp: Date.now(),
          companyId: comp.id,
          companyName: comp.name,
          actionType: 'buy_goods',
          title: `Оптовая закупка: ${comm.name}`,
          description: `${comp.name} выкупила крупную партию ${comm.name} (${qty.toLocaleString()} ед.) на общую сумму $${Math.round(qty * price).toLocaleString()}.`,
          amount: qty * price,
          impact: `Рыночный спрос на ${comm.name} вырос, цена подскочила на +2.5%`,
          icon: '📦',
        }, comp);
      }
    } else if (heldQty > 1000 && price >= comm.basePrice * 1.08) {
      // SELL commodity inventory at profit (drives supply up, price down)
      const sellQty = Math.floor(heldQty * 0.6);
      const proceeds = Math.round(sellQty * price);
      comp.cash += proceeds;
      comp.inventory[comm.id] = heldQty - sellQty;

      // Influence Goods Market: Increase supply, ease price
      comm.supply = Math.min(2.5, comm.supply + 0.15);
      comm.currentPrice = Math.max(comm.minPrice, Math.round(comm.currentPrice * 0.975 * 100) / 100);

      this.recordAction({
        id: `act_${day}_${comp.id}_trade_sell`,
        day,
        timestamp: Date.now(),
        companyId: comp.id,
        companyName: comp.name,
        actionType: 'sell_goods',
        title: `Фиксация прибыли: продажа ${comm.name}`,
        description: `${comp.name} реализовала на бирже ${sellQty.toLocaleString()} ед. ${comm.name} с выручкой $${proceeds.toLocaleString()}.`,
        amount: proceeds,
        impact: `Предложение на рынке ${comm.name} увеличилось, цена скорректировалась на -2.5%`,
        icon: '💰',
      }, comp);
    }
  }

  /**
   * Industrial Strategy: builds factories, consumes raw materials, hires skilled personnel
   */
  private executeIndustrialStrategy(comp: AICompetitorCompany, day: number): void {
    if (comp.cash >= 3000000) {
      const cost = 2800000;
      comp.cash -= cost;
      comp.factories += 1;
      comp.employees += 110;

      this.recordAction({
        id: `act_${day}_${comp.id}_ind_fact`,
        day,
        timestamp: Date.now(),
        companyId: comp.id,
        companyName: comp.name,
        actionType: 'build_factory',
        title: 'Запуск металлургического/сборочного завода',
        description: `${comp.name} запустила производственный цех нового поколения ($${(cost / 1000000).toFixed(1)}M). Нанято 110 инженеров.`,
        amount: cost,
        impact: 'Увеличение выпуска промышленной продукции и доминирования в секторе',
        icon: '🏭',
      }, comp);
    } else if (comp.cash >= 600000) {
      // Bulk raw materials purchase
      const rawComm = goodsMarket.getCommodity('iron_ore') || goodsMarket.getCommodity('copper') || goodsMarket.getCommodity('raw_oil');
      if (rawComm) {
        const qty = Math.floor(400000 / rawComm.currentPrice);
        comp.cash -= qty * rawComm.currentPrice;
        comp.inventory[rawComm.id] = (comp.inventory[rawComm.id] || 0) + qty;
        rawComm.demand = Math.min(2.5, rawComm.demand + 0.1);

        this.recordAction({
          id: `act_${day}_${comp.id}_raw`,
          day,
          timestamp: Date.now(),
          companyId: comp.id,
          companyName: comp.name,
          actionType: 'buy_goods',
          title: `Закупка сырья для заводов: ${rawComm.name}`,
          description: `${comp.name} закупила ${qty.toLocaleString()} ед. ${rawComm.name} для бесперебойного снабжения фабрик.`,
          amount: qty * rawComm.currentPrice,
          impact: `Повышенный спрос на промышленное сырье (+1.8%)`,
          icon: '⛏️',
        }, comp);
      }
    }
  }

  /**
   * Retail Strategy: opens retail chains, hires store staff, buys consumer goods
   */
  private executeRetailStrategy(comp: AICompetitorCompany, day: number): void {
    if (comp.cash >= 1500000) {
      const cost = 1200000;
      comp.cash -= cost;
      comp.stores += 3;
      comp.employees += 45;

      this.recordAction({
        id: `act_${day}_${comp.id}_ret_stores`,
        day,
        timestamp: Date.now(),
        companyId: comp.id,
        companyName: comp.name,
        actionType: 'open_store',
        title: 'Экспансия торговой сети',
        description: `${comp.name} открыла 3 супермаркета и наняла 45 сотрудников торгового зала.`,
        amount: cost,
        impact: 'Рост торгового оборота и доли розничного рынка',
        icon: '🏪',
      }, comp);
    }
  }

  /**
   * Investment Strategy: buys high-value stocks on the exchange, boosting sentiment and stock price
   */
  private executeInvestmentStrategy(comp: AICompetitorCompany, day: number): void {
    const tickers = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'JPM', 'LLY', 'TSLA', 'WMT', 'CAT'];
    const ticker = tickers[Math.floor(Math.random() * tickers.length)];
    const stockComp = stockExchangeManager.getCompany(ticker);

    if (stockComp && comp.cash >= 2000000) {
      const alloc = Math.min(comp.cash * 0.4, 3500000);
      const shares = Math.floor(alloc / stockComp.price);
      if (shares > 0) {
        const total = Math.round(shares * stockComp.price);
        comp.cash -= total;
        comp.stockPortfolio[ticker] = (comp.stockPortfolio[ticker] || 0) + shares;

        // Directly impact stock on the exchange
        stockComp.aiCompetitorHoldings += shares;
        stockComp.investorSentiment = Math.min(1.0, stockComp.investorSentiment + 0.2);
        stockComp.price = Math.round(stockComp.price * 1.022 * 100) / 100;

        this.recordAction({
          id: `act_${day}_${comp.id}_stock_buy`,
          day,
          timestamp: Date.now(),
          companyId: comp.id,
          companyName: comp.name,
          actionType: 'buy_stock',
          title: `Крупная институциональная покупка акций: ${ticker}`,
          description: `${comp.name} приобрела пакет из ${shares.toLocaleString()} акций ${stockComp.name} (${ticker}) на сумму $${(total / 1000000).toFixed(2)}M.`,
          amount: total,
          impact: `Котировки ${ticker} выросли на +2.2%, бычий импульс на фондовой бирже`,
          icon: '📈',
        }, comp);
      }
    }
  }

  /**
   * Triggers Corporate Bankruptcy: emergency liquidation, market flood, creditor haircut
   */
  private triggerBankruptcy(comp: AICompetitorCompany, day: number): void {
    comp.isBankrupt = true;
    comp.bankruptDaysCount = 1;
    comp.creditRating = 'D';
    comp.status = 'bankrupt';

    // 1. Dump 50% of goods inventory into the open market at heavy discount
    let totalLiquidationProceeds = 0;
    for (const [commId, qty] of Object.entries(comp.inventory)) {
      if (qty <= 0) continue;
      const comm = goodsMarket.getCommodity(commId);
      const dumpQty = Math.floor(qty * 0.7);
      if (comm && dumpQty > 0) {
        const price = comm.currentPrice * 0.65; // 35% discount
        totalLiquidationProceeds += dumpQty * price;
        comp.inventory[commId] = qty - dumpQty;

        // Glut the market
        comm.supply = Math.min(2.5, comm.supply + 0.35);
        comm.demand = Math.max(0.3, comm.demand - 0.2);
        comm.currentPrice = Math.max(comm.minPrice, Math.round(comm.currentPrice * 0.9 * 100) / 100);
      }
    }

    // 2. Dump stock portfolio
    for (const [ticker, shares] of Object.entries(comp.stockPortfolio)) {
      if (shares <= 0) continue;
      const stock = stockExchangeManager.getCompany(ticker);
      if (stock) {
        stock.aiCompetitorHoldings = Math.max(0, stock.aiCompetitorHoldings - shares);
        stock.investorSentiment = Math.max(-1.0, stock.investorSentiment - 0.3);
        stock.price = Math.max(1, Math.round(stock.price * 0.94 * 100) / 100);
      }
    }
    comp.stockPortfolio = {};

    // 3. Liquidate stores & factories
    comp.stores = Math.floor(comp.stores * 0.3);
    comp.factories = Math.floor(comp.factories * 0.3);
    comp.employees = Math.floor(comp.employees * 0.25);

    // Apply proceeds to debt
    comp.debt = Math.max(0, comp.debt - totalLiquidationProceeds);
    comp.cash = 500000; // Emergency DIP financing

    this.recordAction({
      id: `act_${day}_${comp.id}_bankrupt`,
      day,
      timestamp: Date.now(),
      companyId: comp.id,
      companyName: comp.name,
      actionType: 'bankruptcy',
      title: '🚨 Объявление о несостоятельности (Банкротство)',
      description: `${comp.name} не смогла расплатиться по долгам и объявила о банкротстве. Начата ликвидация активов и распродажа складов по демпинговым ценам.`,
      amount: comp.debt,
      impact: 'Демпинг цен на бирже товаров, распродажа недвижимости и падение котировок',
      icon: '💥',
    }, comp);
  }

  /**
   * Restructures a bankrupt company after turnaround / buyout
   */
  private restructureBankruptCompany(comp: AICompetitorCompany, day: number): void {
    comp.isBankrupt = false;
    comp.bankruptDaysCount = 0;
    comp.consecutiveLossDays = 0;
    comp.debt = Math.round(comp.netWorth * 0.15);
    comp.cash = Math.round(4000000 + Math.random() * 6000000);
    comp.creditRating = 'B';
    comp.status = 'growing';
    comp.reputation = 65;

    this.recordAction({
      id: `act_${day}_${comp.id}_restruct`,
      day,
      timestamp: Date.now(),
      companyId: comp.id,
      companyName: comp.name,
      actionType: 'restructure',
      title: 'Успешная финансовая реструктуризация',
      description: `${comp.name} завершила процедуру финансового оздоровления, привлекла нового стратегического инвестора и возвращается к операционной деятельности.`,
      amount: comp.cash,
      impact: 'Списание старых долгов, возобновление операций',
      icon: '🔄',
    }, comp);
  }

  /**
   * Records an AI action to the public market wire
   */
  private recordAction(action: AICompetitorAction, comp: AICompetitorCompany): void {
    this.actionFeed.unshift(action);
    if (this.actionFeed.length > 100) this.actionFeed.pop();

    comp.recentActions.unshift(action);
    if (comp.recentActions.length > 20) comp.recentActions.pop();
  }

  /**
   * Recalculates market share percentages for all AI companies and player
   */
  private recalculateMarketShares(): void {
    let totalCap = 0;
    for (const c of this.companies) {
      if (!c.isBankrupt) totalCap += Math.max(1000000, c.netWorth);
    }

    // Add player net worth
    const playerNw = Math.max(100000, economy.getNetWorth());
    const grandTotal = totalCap + playerNw;

    for (const c of this.companies) {
      if (c.isBankrupt) {
        c.marketShare = 0.1;
      } else {
        c.marketShare = Math.round((c.netWorth / grandTotal) * 1000) / 10;
      }
    }
  }

  /**
   * Generates the unified 23-entity Leaderboard (22 AI + 1 Player Corporation)
   */
  public getLeaderboard(): LeaderboardRankingItem[] {
    const state = gameState.getState();
    const holding = holdingManager.getHoldingState();
    const branches = holdingManager.getBranchesSummary();
    const playerNw = Math.max(0, holding.established ? holding.totalConsolidatedNetWorth : economy.getNetWorth());
    const playerCash = state.cash;

    // Calculate full consolidated player revenue & profit
    let playerDailyRev = 0;
    let playerDailyProfit = 0;

    for (const b of Object.values(branches)) {
      playerDailyRev += b.dailyRevenue;
      playerDailyProfit += b.dailyProfit;
    }

    // Add legacy businesses
    for (const b of state.businesses) {
      if (b.status === 'active') {
        const rev = Math.round(b.baseDailyRevenue * (1 + b.level * 0.15));
        const exp = Math.round(b.baseDailyExpense);
        playerDailyRev += rev;
        playerDailyProfit += (rev - exp);
      }
    }

    // Add subsidiaries
    for (const sub of holding.subsidiaries) {
      playerDailyRev += Math.round(sub.dailyRevenue * (sub.ownershipPercent / 100));
      playerDailyProfit += Math.round(sub.dailyProfit * (sub.ownershipPercent / 100));
    }

    const playerStores = branches.retail.count + (state.businesses || []).filter((b) => b.category === 'retail').length;
    const playerFactories = branches.industrial.count + (state.businesses || []).filter((b) => b.category === 'factory').length;
    const playerStaff = (state.employees?.length || 0) + (state.staff?.employees?.length || 0) + holding.subsidiaries.reduce((a, s) => a + s.employees, 0);
    const playerDebt = (state.loans || []).reduce((acc, l) => acc + l.remainingAmount, 0) + ((state.bank?.loans || []).reduce((acc, l) => acc + l.remainingDebt, 0));

    // Player Credit Rating
    const playerRatingStr = state.bank?.creditRating || state.corporation?.creditRating || (playerNw > 50000000 ? 'AAA' : playerNw > 10000000 ? 'AA' : 'A');

    // Calculate player market share
    let totalCap = playerNw;
    for (const c of this.companies) {
      if (!c.isBankrupt) totalCap += Math.max(1000000, c.netWorth);
    }
    const playerMarketShare = Math.round((playerNw / Math.max(1, totalCap)) * 1000) / 10;

    const playerItem: LeaderboardRankingItem = {
      rank: 0,
      isPlayer: true,
      id: 'player_corp',
      name: holding.established ? holding.name : (state.corporation?.name || 'Моя Бизнес-Империя'),
      ceoName: state.corporation?.executiveBoard?.ceo || 'Вы (Глава Корпорации)',
      avatarIcon: '👑',
      color: '#f59e0b',
      sector: holding.established ? (holding.megacorpTier >= 3 ? 'Глобальный мегаконгломерат' : 'Многопрофильный холдинг') : 'Частный бизнес',
      strategy: 'player',
      netWorth: playerNw,
      dailyRevenue: playerDailyRev,
      dailyProfit: playerDailyProfit,
      debt: playerDebt,
      employees: playerStaff,
      stores: playerStores,
      factories: playerFactories,
      marketShare: playerMarketShare,
      creditRating: playerRatingStr,
      isBankrupt: playerCash < 0 && playerDebt > playerNw * 1.5,
      status: playerNw > 100000000 ? 'dominant' : playerDailyProfit > 50000 ? 'growing' : 'stable',
    };

    // Build list
    const items: LeaderboardRankingItem[] = [
      playerItem,
      ...this.companies.map((c) => ({
        rank: 0,
        isPlayer: false,
        id: c.id,
        name: c.name,
        ceoName: c.ceoName,
        avatarIcon: c.avatarIcon,
        color: c.color,
        sector: c.sector,
        strategy: c.strategy,
        netWorth: c.netWorth,
        dailyRevenue: c.dailyRevenue,
        dailyProfit: c.dailyProfit,
        debt: c.debt,
        employees: c.employees,
        stores: c.stores,
        factories: c.factories,
        marketShare: c.marketShare,
        creditRating: c.creditRating,
        isBankrupt: c.isBankrupt,
        status: c.status,
      })),
    ];

    // Sort by Net Worth descending
    items.sort((a, b) => b.netWorth - a.netWorth);

    // Assign rank 1..N
    items.forEach((item, index) => {
      item.rank = index + 1;
    });

    return items;
  }

  /**
   * Competitive Marketing / Espionage / M&A actions by player
   */
  public launchMarketingCampaignAgainst(targetCompanyId: string): { success: boolean; message: string } {
    const comp = this.companyMap.get(targetCompanyId);
    if (!comp) return { success: false, message: 'Компания не найдена' };

    const cost = 250000;
    const state = gameState.getState();
    if (state.cash < cost) {
      return { success: false, message: `Недостаточно средств. Требуется $${cost.toLocaleString()}` };
    }

    economy.removeMoney(cost, 'Маркетинговая война', `Агрессивная рекламная кампания против ${comp.name}`, 'expense');
    comp.dailyRevenue = Math.round(comp.dailyRevenue * 0.93);
    comp.reputation = Math.max(30, comp.reputation - 4);

    this.recordAction({
      id: `act_${state.gameTime.totalDays}_player_war_${comp.id}`,
      day: state.gameTime.totalDays,
      timestamp: Date.now(),
      companyId: comp.id,
      companyName: comp.name,
      actionType: 'restructure',
      title: '⚔️ Маркетинговая атака игрока',
      description: `Холдинг игрока запустил масштабную таргетированную кампанию, переманив ключевых клиентов у ${comp.name}.`,
      amount: cost,
      impact: `Выручка ${comp.name} снижена на -7%, клиенты перешли к игроку`,
      icon: '🎯',
    }, comp);

    return {
      success: true,
      message: `Маркетинговая кампания успешно проведена! Вы перехватили долю рынка у ${comp.name}.`,
    };
  }

  /**
   * Purchase equity in competitor
   */
  public buyCompetitorEquity(targetCompanyId: string, percentage: number): { success: boolean; message: string } {
    const comp = this.companyMap.get(targetCompanyId);
    if (!comp) return { success: false, message: 'Компания не найдена' };

    const equityValue = Math.round((comp.netWorth * (percentage / 100)) * 1.15); // 15% control premium
    const state = gameState.getState();

    if (state.cash < equityValue) {
      return { success: false, message: `Недостаточно средств для покупки ${percentage}% акций. Требуется $${equityValue.toLocaleString()}` };
    }

    economy.removeMoney(equityValue, 'Стратегические инвестиции', `Приобретение ${percentage}% акций в ${comp.name}`, 'investment');
    comp.cash += Math.round(equityValue * 0.7); // 70% goes into company treasury

    this.recordAction({
      id: `act_${state.gameTime.totalDays}_equity_${comp.id}`,
      day: state.gameTime.totalDays,
      timestamp: Date.now(),
      companyId: comp.id,
      companyName: comp.name,
      actionType: 'buy_stock',
      title: `💼 Вхождение игрока в капитал (${percentage}%)`,
      description: `Игрок стал стратегическим акционером ${comp.name}, инвестировав $${(equityValue / 1000000).toFixed(2)}M.`,
      amount: equityValue,
      impact: `Получение дивидендов и право голоса в совете директоров ${comp.name}`,
      icon: '🤝',
    }, comp);

    return {
      success: true,
      message: `Сделка закрыта! Вы приобрели ${percentage}% акций корпорации ${comp.name} за $${equityValue.toLocaleString()}.`,
    };
  }
}

export const competitorMarketEngine = new CompetitorMarketEngine();
