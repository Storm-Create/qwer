/**
 * Business Empire: Ultimate
 * Advanced Stock Exchange & Quantitative Capital Markets Engine
 */

import { gameState } from '../gameState';
import { gameLoop } from '../gameLoop';
import {
  StockCompany,
  StockExchangeState,
  StockHoldingRecord,
  StockMarketRegimeState,
  StockNewsItem,
  StockSector,
  StockTradeOrder,
  StockDividendPayout,
  MarketRegimeType,
} from '../../types/stockExchange';
import { generateStockMarketDirectory } from './stockCompaniesData';

class StockExchangeManager {
  private companies: StockCompany[] = [];
  private companyMap: Map<string, StockCompany> = new Map();
  private holdings: Record<string, StockHoldingRecord> = {};
  private orderHistory: StockTradeOrder[] = [];
  private dividendHistory: StockDividendPayout[] = [];
  private marketRegime: StockMarketRegimeState = {
    regime: 'bull',
    regimeDaysRemaining: 35,
    momentum: 0.35,
    interestRate: 0.045,
    inflationRate: 0.028,
    marketIndex: 5240.0,
    indexHistory: [5100, 5130, 5180, 5210, 5240],
    newsFeed: [],
    bullTrendDays: 14,
    bearTrendDays: 0,
  };
  private totalDividendsEarned = 0;
  private totalRealizedProfits = 0;
  private isInitialized = false;

  constructor() {
    this.init();

    // Hook daily market price updates and dividend distributions to game loop
    gameLoop.onDay(() => {
      this.simulateDailyExchange();
    });
  }

  /**
   * Initializes market catalog and restores from saved game state if present
   */
  public init(): void {
    if (this.isInitialized) return;

    // Generate full 3,000+ public company directory
    this.companies = generateStockMarketDirectory();
    this.companyMap.clear();
    for (const c of this.companies) {
      this.companyMap.set(c.ticker, c);
    }

    // Hydrate existing holdings from gameState if available
    const curState = gameState.getState();
    if (curState && (curState as any).stockExchange) {
      const savedEx = (curState as any).stockExchange as StockExchangeState;
      if (savedEx.holdings) this.holdings = savedEx.holdings;
      if (savedEx.orderHistory) this.orderHistory = savedEx.orderHistory;
      if (savedEx.dividendHistory) this.dividendHistory = savedEx.dividendHistory;
      if (savedEx.marketRegime) this.marketRegime = savedEx.marketRegime;
      if (savedEx.totalDividendsEarned) this.totalDividendsEarned = savedEx.totalDividendsEarned;
      if (savedEx.totalRealizedProfits) this.totalRealizedProfits = savedEx.totalRealizedProfits;
    } else if (curState?.stocks?.holdings) {
      // Migrate legacy holdings
      for (const [sym, h] of Object.entries(curState.stocks.holdings)) {
        if (h && h.shares > 0) {
          this.holdings[sym] = {
            ticker: sym,
            shares: h.shares,
            avgBuyPrice: h.avgPrice || (this.companyMap.get(sym)?.price || 100),
            totalInvested: (h.shares * (h.avgPrice || 100)),
            totalDividendsReceived: 0,
            firstPurchasedDay: curState.gameTime.totalDays || 1,
            lastPurchasedDay: curState.gameTime.totalDays || 1,
          };
        }
      }
    }

    this.isInitialized = true;
    this.syncWithGameState();
  }

  public getCompanies(): StockCompany[] {
    return this.companies;
  }

  public getCompany(ticker: string): StockCompany | undefined {
    return this.companyMap.get(ticker);
  }

  public getHoldings(): Record<string, StockHoldingRecord> {
    return this.holdings;
  }

  public getMarketRegime(): StockMarketRegimeState {
    return this.marketRegime;
  }

  public getOrderHistory(): StockTradeOrder[] {
    return this.orderHistory;
  }

  public getDividendHistory(): StockDividendPayout[] {
    return this.dividendHistory;
  }

  public getTotalDividendsEarned(): number {
    return this.totalDividendsEarned;
  }

  public getTotalRealizedProfits(): number {
    return this.totalRealizedProfits;
  }

  /**
   * Evaluates overall player portfolio
   */
  public getPortfolioSummary(): {
    totalValue: number;
    totalInvested: number;
    unrealizedProfit: number;
    unrealizedProfitPercent: number;
    todayProfit: number;
    todayProfitPercent: number;
    holdingsCount: number;
    annualDividendsProjected: number;
    sectorAllocation: { sector: StockSector; value: number; percent: number }[];
  } {
    let totalValue = 0;
    let totalInvested = 0;
    let todayValueOld = 0;
    let annualDividendsProjected = 0;
    const sectorMap: Record<string, number> = {};

    for (const [ticker, h] of Object.entries(this.holdings)) {
      if (h.shares <= 0) continue;
      const comp = this.companyMap.get(ticker);
      const currentPrice = comp ? comp.price : h.avgBuyPrice;
      const prevPrice = comp ? comp.previousPrice : currentPrice;
      const posValue = h.shares * currentPrice;
      const posInvested = h.shares * h.avgBuyPrice;

      totalValue += posValue;
      totalInvested += posInvested;
      todayValueOld += h.shares * prevPrice;

      if (comp) {
        annualDividendsProjected += h.shares * comp.dividend;
        sectorMap[comp.sector] = (sectorMap[comp.sector] || 0) + posValue;
      }
    }

    const unrealizedProfit = totalValue - totalInvested;
    const unrealizedProfitPercent = totalInvested > 0 ? (unrealizedProfit / totalInvested) * 100 : 0;
    const todayProfit = totalValue - todayValueOld;
    const todayProfitPercent = todayValueOld > 0 ? (todayProfit / todayValueOld) * 100 : 0;

    const sectorAllocation: { sector: StockSector; value: number; percent: number }[] = [];
    for (const [sec, val] of Object.entries(sectorMap)) {
      sectorAllocation.push({
        sector: sec as StockSector,
        value: val,
        percent: totalValue > 0 ? Math.round((val / totalValue) * 1000) / 10 : 0,
      });
    }
    sectorAllocation.sort((a, b) => b.value - a.value);

    return {
      totalValue,
      totalInvested,
      unrealizedProfit,
      unrealizedProfitPercent,
      todayProfit,
      todayProfitPercent,
      holdingsCount: Object.values(this.holdings).filter((h) => h.shares > 0).length,
      annualDividendsProjected,
      sectorAllocation,
    };
  }

  /**
   * Executes a BUY order for shares
   */
  public buyStock(ticker: string, shares: number): { success: boolean; message: string } {
    if (shares <= 0 || !Number.isFinite(shares)) {
      return { success: false, message: 'Некорректное количество акций' };
    }

    const company = this.companyMap.get(ticker);
    if (!company) {
      return { success: false, message: 'Компания не найдена на бирже' };
    }

    const totalCost = Math.round(company.price * shares * 100) / 100;
    const state = gameState.getState();

    if (state.cash < totalCost) {
      return {
        success: false,
        message: `Недостаточно средств. Требуется $${totalCost.toLocaleString()}, у вас $${state.cash.toLocaleString()}`,
      };
    }

    // Process transaction
    gameState.update((draft) => {
      draft.cash -= totalCost;
      draft.statistics.totalSpent += totalCost;
      draft.statistics.transactionsCount += 1;

      draft.transactions.unshift({
        id: `tx_stock_buy_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        timestamp: Date.now(),
        gameTime: { ...draft.gameTime },
        amount: -totalCost,
        type: 'investment',
        category: 'Фондовый рынок',
        description: `Покупка ${shares.toLocaleString()} акций ${company.ticker} (${company.name}) по $${company.price.toFixed(2)}`,
        balanceAfter: draft.cash,
      });
      if (draft.transactions.length > 100) draft.transactions.pop();
    });

    // Update internal holdings
    const existing = this.holdings[ticker];
    const day = state.gameTime.totalDays || 1;

    if (existing && existing.shares > 0) {
      const oldShares = existing.shares;
      const oldInvested = existing.totalInvested;
      const newShares = oldShares + shares;
      const newInvested = oldInvested + totalCost;
      const newAvg = newInvested / newShares;

      this.holdings[ticker] = {
        ticker,
        shares: newShares,
        avgBuyPrice: Math.round(newAvg * 100) / 100,
        totalInvested: Math.round(newInvested * 100) / 100,
        totalDividendsReceived: existing.totalDividendsReceived,
        firstPurchasedDay: existing.firstPurchasedDay,
        lastPurchasedDay: day,
      };
    } else {
      this.holdings[ticker] = {
        ticker,
        shares,
        avgBuyPrice: company.price,
        totalInvested: totalCost,
        totalDividendsReceived: 0,
        firstPurchasedDay: day,
        lastPurchasedDay: day,
      };
    }

    // Small buy impact on company investor demand
    company.investorSentiment = Math.min(1.0, company.investorSentiment + 0.05);

    // Record order
    this.orderHistory.unshift({
      id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      day,
      timestamp: Date.now(),
      ticker,
      companyName: company.name,
      type: 'BUY',
      shares,
      price: company.price,
      totalAmount: totalCost,
      avgBuyPrice: company.price,
    });
    if (this.orderHistory.length > 200) this.orderHistory.pop();

    this.syncWithGameState();
    return {
      success: true,
      message: `Успешно куплено ${shares.toLocaleString()} акций ${company.ticker} на $${totalCost.toLocaleString()}`,
    };
  }

  /**
   * Executes a SELL order for shares
   */
  public sellStock(ticker: string, shares: number): { success: boolean; message: string; profit?: number } {
    const existing = this.holdings[ticker];
    if (!existing || existing.shares < shares || shares <= 0) {
      return { success: false, message: 'Недостаточно акций в вашем портфеле для продажи' };
    }

    const company = this.companyMap.get(ticker);
    if (!company) {
      return { success: false, message: 'Компания не найдена' };
    }

    const totalProceeds = Math.round(company.price * shares * 100) / 100;
    const costBasis = Math.round(existing.avgBuyPrice * shares * 100) / 100;
    const realizedProfit = Math.round((totalProceeds - costBasis) * 100) / 100;
    const profitPercent = costBasis > 0 ? (realizedProfit / costBasis) * 100 : 0;
    const state = gameState.getState();
    const day = state.gameTime.totalDays || 1;

    // Process transaction in gameState
    gameState.update((draft) => {
      draft.cash += totalProceeds;
      draft.statistics.totalEarned += totalProceeds;
      draft.statistics.dealsClosed += 1;
      draft.statistics.totalTradeProfit += Math.max(0, realizedProfit);
      draft.statistics.transactionsCount += 1;

      draft.transactions.unshift({
        id: `tx_stock_sell_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        timestamp: Date.now(),
        gameTime: { ...draft.gameTime },
        amount: totalProceeds,
        type: 'revenue',
        category: 'Фондовый рынок',
        description: `Продажа ${shares.toLocaleString()} акций ${company.ticker} по $${company.price.toFixed(2)} (P/L: ${realizedProfit >= 0 ? '+' : ''}$${realizedProfit.toLocaleString()})`,
        balanceAfter: draft.cash,
      });
      if (draft.transactions.length > 100) draft.transactions.pop();
    });

    // Update internal holdings
    const remainingShares = existing.shares - shares;
    if (remainingShares <= 0) {
      delete this.holdings[ticker];
    } else {
      const remainingInvested = Math.round(remainingShares * existing.avgBuyPrice * 100) / 100;
      this.holdings[ticker] = {
        ...existing,
        shares: remainingShares,
        totalInvested: remainingInvested,
        lastPurchasedDay: day,
      };
    }

    this.totalRealizedProfits += realizedProfit;

    // Record order
    this.orderHistory.unshift({
      id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      day,
      timestamp: Date.now(),
      ticker,
      companyName: company.name,
      type: 'SELL',
      shares,
      price: company.price,
      totalAmount: totalProceeds,
      avgBuyPrice: existing.avgBuyPrice,
      realizedProfit,
      profitPercent: Math.round(profitPercent * 10) / 10,
    });
    if (this.orderHistory.length > 200) this.orderHistory.pop();

    this.syncWithGameState();

    const profitStr = realizedProfit >= 0 ? `+$${realizedProfit.toLocaleString()}` : `-$${Math.abs(realizedProfit).toLocaleString()}`;
    return {
      success: true,
      message: `Продано ${shares.toLocaleString()} акций ${company.ticker} за $${totalProceeds.toLocaleString()} (Финансовый результат: ${profitStr})`,
      profit: realizedProfit,
    };
  }

  /**
   * Simulates daily market price evolution, macro regimes, news, and dividend distributions
   */
  public simulateDailyExchange(): void {
    const state = gameState.getState();
    const day = state.gameTime.totalDays || 1;

    // 1. Evolve Macro Economic Regime gradually
    this.updateMacroMarketRegime(day);

    // 2. Distribute Dividends to Player
    this.processDailyDividends(day);

    // 3. AI Institutional Rebalancing & Competitor Action
    this.simulateAiCompetitorActions();

    // 4. Generate Daily Market News
    this.generateDailyNews(day);

    // 5. Update All Stock Prices (3,000+ companies)
    let compositeSum = 0;
    const regime = this.marketRegime.regime;
    const momentum = this.marketRegime.momentum;

    for (let i = 0; i < this.companies.length; i++) {
      const c = this.companies[i];
      c.previousPrice = c.price;

      // Base fundamental drift from profitability & debt
      const margin = c.revenue > 0 ? c.profit / c.revenue : 0.05;
      const debtBurden = c.marketCap > 0 ? c.debt / c.marketCap : 0.3;
      const fundamentalFactor = (margin * 0.06) - (debtBurden * 0.03);

      // Macro regime impact
      let regimeDrift = 0;
      let regimeVolMultiplier = 1.0;

      switch (regime) {
        case 'bull':
          regimeDrift = 0.0035 + (c.sector === 'Technology' || c.sector === 'Consumer Discretionary' ? 0.002 : 0.0005);
          regimeVolMultiplier = 0.85;
          break;
        case 'bear':
          regimeDrift = -0.0035 + (c.sector === 'Healthcare' || c.sector === 'Utilities' || c.sector === 'Consumer Staples' ? 0.0025 : -0.0015);
          regimeVolMultiplier = 1.15;
          break;
        case 'crisis':
          regimeDrift = -0.015 - (debtBurden > 0.5 ? 0.01 : 0);
          regimeVolMultiplier = 2.2;
          break;
        case 'rally':
          regimeDrift = 0.012 + (c.sector === 'Technology' ? 0.008 : 0.002);
          regimeVolMultiplier = 1.4;
          break;
        case 'crash':
          regimeDrift = -0.028 + (Math.random() - 0.4) * 0.02;
          regimeVolMultiplier = 2.8;
          break;
        case 'neutral':
        default:
          regimeDrift = 0.0005;
          regimeVolMultiplier = 1.0;
          break;
      }

      // News impact
      let newsImpact = 0;
      if (c.latestNews && c.latestNews.day === day) {
        newsImpact = c.latestNews.impactPercent / 100;
      }

      // Sentiment & AI competitor buying pressure
      const sentimentDrift = c.investorSentiment * 0.004;

      // Random Walk with volatility
      const randWalk = (Math.random() - 0.495) * 2 * (c.volatility * regimeVolMultiplier);

      // Total percentage change
      const totalChangePct = fundamentalFactor * 0.05 + regimeDrift + momentum * 0.003 + newsImpact + sentimentDrift + randWalk;

      // New price calculation
      const newPrice = Math.max(0.25, Math.round((c.price * (1 + totalChangePct)) * 100) / 100);
      c.price = newPrice;
      c.change24h = Math.round((newPrice - c.previousPrice) * 100) / 100;
      c.change24hPercent = Math.round(((c.change24h / (c.previousPrice || 1)) * 100) * 100) / 100;

      // Update price history (keep last 40 points)
      c.priceHistory.push(newPrice);
      if (c.priceHistory.length > 40) {
        c.priceHistory.shift();
      }

      // Update 52-week and daily extremes
      c.dayLow = Math.min(newPrice, Math.round(newPrice * (1 - c.volatility * 0.8) * 100) / 100);
      c.dayHigh = Math.max(newPrice, Math.round(newPrice * (1 + c.volatility * 0.8) * 100) / 100);
      c.week52Low = Math.min(c.week52Low, newPrice);
      c.week52High = Math.max(c.week52High, newPrice);

      // Update market cap & P/E
      c.marketCap = Math.round(c.sharesOutstanding * newPrice);
      c.eps = Math.round((c.profit / c.sharesOutstanding) * 100) / 100;
      c.peRatio = c.eps > 0 ? Math.round((newPrice / c.eps) * 10) / 10 : 20.0;
      c.dividendYield = Math.round((c.dividend / newPrice) * 1000) / 1000;

      // Soft decay sentiment
      c.investorSentiment = Math.max(-1.0, Math.min(1.0, c.investorSentiment * 0.92));

      // Calculate composite index contribution
      compositeSum += newPrice;
    }

    // Update Market Index (S&P composite style)
    const newIndex = Math.round((compositeSum / this.companies.length) * 48 * 10) / 10;
    this.marketRegime.marketIndex = newIndex;
    this.marketRegime.indexHistory.push(newIndex);
    if (this.marketRegime.indexHistory.length > 40) {
      this.marketRegime.indexHistory.shift();
    }

    this.syncWithGameState();
  }

  /**
   * Manages smooth, gradual transitions between macro economic regimes
   */
  private updateMacroMarketRegime(day: number): void {
    this.marketRegime.regimeDaysRemaining -= 1;

    if (this.marketRegime.regimeDaysRemaining <= 0) {
      // Regime transition
      const cur = this.marketRegime.regime;
      const roll = Math.random();

      if (cur === 'bull') {
        if (roll < 0.20) {
          this.marketRegime.regime = 'rally';
          this.marketRegime.regimeDaysRemaining = 8 + Math.floor(Math.random() * 12);
          this.marketRegime.momentum = 0.8;
        } else if (roll < 0.65) {
          this.marketRegime.regime = 'neutral';
          this.marketRegime.regimeDaysRemaining = 20 + Math.floor(Math.random() * 20);
          this.marketRegime.momentum = 0.05;
        } else {
          this.marketRegime.regime = 'bear';
          this.marketRegime.regimeDaysRemaining = 25 + Math.floor(Math.random() * 30);
          this.marketRegime.momentum = -0.4;
        }
      } else if (cur === 'rally') {
        // Rally usually cools off into bull or neutral
        this.marketRegime.regime = roll < 0.6 ? 'bull' : 'neutral';
        this.marketRegime.regimeDaysRemaining = 20 + Math.floor(Math.random() * 25);
        this.marketRegime.momentum = 0.3;
      } else if (cur === 'bear') {
        if (roll < 0.15) {
          this.marketRegime.regime = 'crisis';
          this.marketRegime.regimeDaysRemaining = 10 + Math.floor(Math.random() * 15);
          this.marketRegime.momentum = -0.85;
        } else if (roll < 0.55) {
          this.marketRegime.regime = 'neutral';
          this.marketRegime.regimeDaysRemaining = 15 + Math.floor(Math.random() * 20);
          this.marketRegime.momentum = -0.05;
        } else {
          this.marketRegime.regime = 'bull';
          this.marketRegime.regimeDaysRemaining = 30 + Math.floor(Math.random() * 35);
          this.marketRegime.momentum = 0.4;
        }
      } else if (cur === 'crisis' || cur === 'crash') {
        // After crisis, market recovers to bear or neutral with high upside potential
        this.marketRegime.regime = 'neutral';
        this.marketRegime.regimeDaysRemaining = 15 + Math.floor(Math.random() * 20);
        this.marketRegime.momentum = 0.1;
      } else {
        // Neutral transition
        if (roll < 0.50) {
          this.marketRegime.regime = 'bull';
          this.marketRegime.regimeDaysRemaining = 30 + Math.floor(Math.random() * 30);
          this.marketRegime.momentum = 0.35;
        } else if (roll < 0.85) {
          this.marketRegime.regime = 'bear';
          this.marketRegime.regimeDaysRemaining = 25 + Math.floor(Math.random() * 25);
          this.marketRegime.momentum = -0.35;
        } else {
          this.marketRegime.regime = 'rally';
          this.marketRegime.regimeDaysRemaining = 10 + Math.floor(Math.random() * 12);
          this.marketRegime.momentum = 0.7;
        }
      }
    } else {
      // Gradual momentum damping/drifting towards zero or building up
      if (this.marketRegime.regime === 'bull') {
        this.marketRegime.momentum = Math.min(0.6, this.marketRegime.momentum + 0.01);
      } else if (this.marketRegime.regime === 'bear') {
        this.marketRegime.momentum = Math.max(-0.6, this.marketRegime.momentum - 0.01);
      }
    }
  }

  /**
   * Distributes daily proportion of annual dividends to player
   */
  private processDailyDividends(day: number): void {
    let totalDividendsToday = 0;

    for (const [ticker, h] of Object.entries(this.holdings)) {
      if (h.shares <= 0) continue;
      const comp = this.companyMap.get(ticker);
      if (!comp || comp.dividend <= 0) continue;

      // Daily payout rate = Annual Dividend / 30 days
      const dailyPerShare = comp.dividend / 30;
      const payout = Math.round(h.shares * dailyPerShare * 100) / 100;

      if (payout > 0) {
        totalDividendsToday += payout;
        h.totalDividendsReceived += payout;

        this.dividendHistory.unshift({
          id: `div_${day}_${ticker}_${Math.random().toString(36).substr(2, 4)}`,
          day,
          timestamp: Date.now(),
          ticker,
          companyName: comp.name,
          shares: h.shares,
          perShare: Math.round(dailyPerShare * 1000) / 1000,
          totalAmount: payout,
        });
      }
    }

    if (totalDividendsToday > 0) {
      this.totalDividendsEarned += totalDividendsToday;

      gameState.update((draft) => {
        draft.cash += totalDividendsToday;
        draft.statistics.totalEarned += totalDividendsToday;

        draft.transactions.unshift({
          id: `tx_dividend_${day}_${Date.now()}`,
          timestamp: Date.now(),
          gameTime: { ...draft.gameTime },
          amount: totalDividendsToday,
          type: 'revenue',
          category: 'Дивиденды',
          description: `Выплата дивидендов по акциям за день: +$${totalDividendsToday.toLocaleString()}`,
          balanceAfter: draft.cash,
        });
        if (draft.transactions.length > 100) draft.transactions.pop();
      });

      if (this.dividendHistory.length > 200) {
        this.dividendHistory = this.dividendHistory.slice(0, 200);
      }
    }
  }

  /**
   * Simulates institutional AI funds buying / selling based on valuation
   */
  private simulateAiCompetitorActions(): void {
    // Pick 5 random companies to buy / rebalance
    for (let k = 0; k < 5; k++) {
      const idx = Math.floor(Math.random() * this.companies.length);
      const c = this.companies[idx];
      if (!c) continue;

      // Undervalued if P/E < 15 and profit > 0
      if (c.peRatio < 15 && c.profit > 0) {
        c.aiCompetitorHoldings += Math.round(c.sharesOutstanding * 0.002);
        c.investorSentiment = Math.min(1.0, c.investorSentiment + 0.15);
      } else if (c.peRatio > 45) {
        c.aiCompetitorHoldings = Math.max(0, c.aiCompetitorHoldings - Math.round(c.sharesOutstanding * 0.001));
        c.investorSentiment = Math.max(-1.0, c.investorSentiment - 0.10);
      }
    }
  }

  /**
   * Generates dynamic corporate news & earnings announcements
   */
  private generateDailyNews(day: number): void {
    // Generate 1-2 news items per day
    const count = Math.random() > 0.4 ? 2 : 1;
    for (let k = 0; k < count; k++) {
      const idx = Math.floor(Math.random() * this.companies.length);
      const c = this.companies[idx];
      if (!c) continue;

      const headlinesBullish = [
        `Квартальная прибыль превзошла ожидания Уолл-стрит на 18% благодаря ИИ-решениям`,
        `Совет директоров утвердил масштабную программу обратного выкупа акций (Buyback)`,
        `Заключен многомиллиардный стратегический контракт на поставку продукции`,
        `Рейтинговые агентства повысили кредитный рейтинг до инвестиционного уровня AAA`,
        `Запуск прорывной продуктовой линейки вызвал ажиотажный спрос клиентов`,
      ];

      const headlinesBearish = [
        `Выручка за квартал оказалась ниже консенсус-прогноза на фоне спада в секторе`,
        `Регуляторы инициировали антимонопольное расследование в отношении компании`,
        `Рост расходов на обслуживание долга оказал давление на операционную маржинальность`,
        `Снижение целевой цены ведущими инвестбанками из-за макроэкономических рисков`,
        `Срыв сроков масштабного проекта привел к единовременным списаниям убытков`,
      ];

      const isBull = Math.random() > 0.45;
      const textArr = isBull ? headlinesBullish : headlinesBearish;
      const headline = textArr[Math.floor(Math.random() * textArr.length)];
      const impactPercent = isBull
        ? Math.round((3.0 + Math.random() * 8.0) * 10) / 10
        : -Math.round((3.0 + Math.random() * 8.0) * 10) / 10;

      const newsItem: StockNewsItem = {
        id: `news_${day}_${c.ticker}_${Math.random().toString(36).substr(2, 4)}`,
        ticker: c.ticker,
        companyName: c.name,
        headline: `${c.name} (${c.ticker}): ${headline}`,
        sentiment: isBull ? 'bullish' : 'bearish',
        impactPercent,
        day,
      };

      c.latestNews = newsItem;
      c.investorSentiment += isBull ? 0.35 : -0.35;

      this.marketRegime.newsFeed.unshift(newsItem);
      if (this.marketRegime.newsFeed.length > 50) {
        this.marketRegime.newsFeed.pop();
      }
    }
  }

  /**
   * Synchronizes internal exchange state into centralized gameState
   */
  private syncWithGameState(): void {
    const stateObj: StockExchangeState = {
      companies: this.companies,
      holdings: this.holdings,
      orderHistory: this.orderHistory,
      dividendHistory: this.dividendHistory,
      marketRegime: this.marketRegime,
      totalDividendsEarned: this.totalDividendsEarned,
      totalRealizedProfits: this.totalRealizedProfits,
      lastSimulatedDay: gameState.getState().gameTime.totalDays || 1,
    };

    gameState.update((draft) => {
      (draft as any).stockExchange = stateObj;

      // Keep legacy stocks.holdings in sync for backward compatibility
      if (!draft.stocks) draft.stocks = { holdings: {}, market: [] };
      if (!draft.stocks.holdings) draft.stocks.holdings = {};

      for (const [ticker, h] of Object.entries(this.holdings)) {
        draft.stocks.holdings[ticker] = {
          symbol: ticker,
          shares: h.shares,
          avgPrice: h.avgBuyPrice,
          totalInvested: h.totalInvested,
        };
      }
    }, false);
  }
}

export const stockExchange = new StockExchangeManager();
export const stockMarket = stockExchange;
export const stockExchangeManager = stockExchange;
