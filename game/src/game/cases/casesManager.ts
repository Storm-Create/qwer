/**
 * Business Empire: Ultimate
 * Cases & Skin Empire Manager — Core Game Logic & Simulation Engine
 */

import { gameState } from '../gameState';
import {
  CasesSubsystemState,
  SkinItem,
  SkinTemplate,
  CaseDefinition,
  SkinRarity,
  SkinCondition,
  UpgradeAttempt,
  TradeUpContractRecord,
  SkinMarketListing,
  SkinAuction,
  PlayerSkinStudio,
  SkinMarketTrend,
} from '../../types/cases';
import {
  SKIN_TEMPLATES,
  SKIN_COLLECTIONS,
  CURATED_CASES,
  CRAFTING_RECIPES,
  AI_COLLECTORS,
  SKIN_ACHIEVEMENTS,
  RARITY_CONFIG,
} from './skinCatalog';
import { casinoManager } from '../casino/casinoManager';

export const INITIAL_CASES_STATE: CasesSubsystemState = {
  inventory: [],
  openedCasesCount: 0,
  totalCasesValueCC: 0,
  totalSpentOnCasesCC: 0,
  marketListings: [],
  activeAuctions: [],
  completedCollections: [],
  customCases: [],
  playerStudio: {
    isCreated: false,
    brandName: 'CyberForge Studios',
    tagline: 'Precision Digital Craftsmanship',
    logoEmoji: '⚡',
    level: 1,
    reputation: 25,
    followersCount: 1200,
    marketSharePercent: 1.2,
    totalRoyaltiesEarnedCC: 0,
    dailyRoyaltyIncomeCC: 0,
    customCasesCreated: 0,
    skinsDesignedCount: 0,
    upgradesPurchased: {
      marketingLevel: 1,
      materialsDiscountLevel: 0,
      dropRateRefinementLevel: 0,
      factoryAutomationLevel: 0,
    },
  },
  upgradeHistory: [],
  tradeUpHistory: [],
  caseOpeningHistory: [],
  achievements: JSON.parse(JSON.stringify(SKIN_ACHIEVEMENTS)),
  marketTrends: {},
  lastSimulationTick: Date.now(),
};

class CasesManager {
  private state: CasesSubsystemState | null = null;
  private templateMap: Map<string, SkinTemplate> = new Map();
  private caseMap: Map<string, CaseDefinition> = new Map();

  constructor() {
    SKIN_TEMPLATES.forEach((t) => this.templateMap.set(t.id, t));
    CURATED_CASES.forEach((c) => this.caseMap.set(c.id, c));
  }

  // -------------------------------------------------------------
  // INITIALIZATION & STATE HYDRATION
  // -------------------------------------------------------------

  public getOrCreateState(): CasesSubsystemState {
    const root = gameState.getState();
    if (!root.cases) {
      const initial = JSON.parse(JSON.stringify(INITIAL_CASES_STATE)) as CasesSubsystemState;
      // Seed starter market listings and auctions
      this.seedInitialMarket(initial);
      this.seedInitialAuctions(initial);
      this.seedStarterInventory(initial);
      this.initMarketTrends(initial);

      gameState.update((draft) => {
        draft.cases = initial;
      });
      this.state = initial;
    } else {
      this.state = root.cases;
      // Ensure any newly added templates/trends are hydrated
      if (!this.state.marketTrends || Object.keys(this.state.marketTrends).length === 0) {
        this.initMarketTrends(this.state);
      }
      if (this.state.activeAuctions.length === 0) {
        this.seedInitialAuctions(this.state);
      }
    }
    return this.state;
  }

  public getTemplate(id: string): SkinTemplate | undefined {
    return this.templateMap.get(id);
  }

  public getAllTemplates(): SkinTemplate[] {
    return SKIN_TEMPLATES;
  }

  public getAllCases(): CaseDefinition[] {
    const custom = this.getOrCreateState().customCases || [];
    return [...CURATED_CASES, ...custom];
  }

  public getCase(id: string): CaseDefinition | undefined {
    const custom = this.getOrCreateState().customCases || [];
    return this.caseMap.get(id) || custom.find((c) => c.id === id);
  }

  // -------------------------------------------------------------
  // ITEM GENERATION ENGINE
  // -------------------------------------------------------------

  public generateSkinItem(
    templateId: string,
    options: {
      origin: SkinItem['origin'];
      overrideFloat?: number;
      overridePattern?: number;
      overrideStatTrak?: boolean;
      craftedBrand?: string;
    }
  ): SkinItem {
    const tpl = this.templateMap.get(templateId) || SKIN_TEMPLATES[0];

    // 1. Float roll (0.0001 - 0.9999) with realistic bias towards mid-range
    let float = options.overrideFloat !== undefined ? options.overrideFloat : this.rollFloat();
    float = Math.max(0.0001, Math.min(0.9999, float));

    // 2. Condition determination
    const condition = this.getConditionFromFloat(float);

    // 3. Pattern ID (1 - 1000)
    const pattern =
      options.overridePattern !== undefined ? options.overridePattern : Math.floor(Math.random() * 1000) + 1;

    // Check special pattern
    let isSpecialPattern = false;
    let specialPatternName: string | undefined;
    let patternMultiplier = 1.0;

    if (tpl.specialPatterns) {
      const match = tpl.specialPatterns.find((p) => p.patternId === pattern);
      if (match) {
        isSpecialPattern = true;
        specialPatternName = match.name;
        patternMultiplier = match.multiplier;
      }
    }

    // 4. StatTrak calculation (10% chance if template allows)
    const hasStatTrak =
      options.overrideStatTrak !== undefined
        ? options.overrideStatTrak
        : tpl.canBeStatTrak && Math.random() < 0.12;

    // 5. Value calculation
    const rarityCfg = RARITY_CONFIG[tpl.rarity];
    const conditionMultiplier = this.getConditionMultiplier(condition, float);
    const statTrakMultiplier = hasStatTrak ? 1.35 : 1.0;

    const baseValue = tpl.baseValue;
    const marketValue = Math.round(
      baseValue * conditionMultiplier * patternMultiplier * statTrakMultiplier
    );

    const skin: SkinItem = {
      id: `skin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      templateId: tpl.id,
      name: tpl.name,
      weaponType: tpl.weaponType,
      skinName: tpl.skinName,
      category: tpl.category,
      rarity: tpl.rarity,
      condition,
      float: parseFloat(float.toFixed(4)),
      pattern,
      isSpecialPattern,
      specialPatternName,
      hasStatTrak,
      statTrak: hasStatTrak ? 0 : undefined,
      baseValue,
      marketValue,
      collectionId: tpl.collectionId,
      collectionName: tpl.collectionName,
      isFavorite: false,
      isLocked: false,
      craftedByBrand: options.craftedBrand,
      acquiredAt: Date.now(),
      origin: options.origin,
      iconEmoji: tpl.iconEmoji,
      gradient: tpl.gradient,
      accentColor: tpl.accentColor,
      description: tpl.description,
    };

    return skin;
  }

  private rollFloat(): number {
    // Triangular/Beta distribution to create realistic float clustering
    const r1 = Math.random();
    const r2 = Math.random();
    const raw = (r1 + r2) / 2;
    // Bias: 10% FN, 20% MW, 40% FT, 15% WW, 15% BS
    return raw;
  }

  public getConditionFromFloat(float: number): SkinCondition {
    if (float < 0.07) return 'Factory New';
    if (float < 0.15) return 'Minimal Wear';
    if (float < 0.38) return 'Field-Tested';
    if (float < 0.45) return 'Well-Worn';
    return 'Battle-Scarred';
  }

  private getConditionMultiplier(condition: SkinCondition, float: number): number {
    switch (condition) {
      case 'Factory New': {
        const superLowFloatBonus = float < 0.01 ? 1.3 : 1.15;
        return 1.35 * superLowFloatBonus;
      }
      case 'Minimal Wear':
        return 1.15;
      case 'Field-Tested':
        return 1.0;
      case 'Well-Worn':
        return 0.82;
      case 'Battle-Scarred':
        return 0.68;
    }
  }

  // -------------------------------------------------------------
  // CASE OPENING SIMULATOR & UNBOXING ENGINE
  // -------------------------------------------------------------

  public openCase(caseId: string, count: number = 1): { success: boolean; items?: SkinItem[]; error?: string } {
    const c = this.getCase(caseId);
    if (!c) return { success: false, error: 'Кейс не найден' };

    const totalCost = c.priceCC * count;
    const currentCC = casinoManager.getCasinoCoins();

    if (currentCC < totalCost) {
      return {
        success: false,
        error: `Недостаточно Casino Coins. Требуется: ${totalCost.toLocaleString()} CC, у вас: ${currentCC.toLocaleString()} CC.`,
      };
    }

    // Deduct currency
    casinoManager.addTransaction({
      type: 'game_loss',
      amountCC: totalCost,
      description: `Открытие ${count}x "${c.name}"`,
    });

    const wonItems: SkinItem[] = [];

    for (let i = 0; i < count; i++) {
      const winningRarity = this.rollRarity(c.dropRates);
      const eligibleTemplates = c.itemIds
        .map((id) => this.templateMap.get(id))
        .filter((t): t is SkinTemplate => !!t && t.rarity === winningRarity);

      let chosenTemplate: SkinTemplate;
      if (eligibleTemplates.length > 0) {
        chosenTemplate = eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)];
      } else {
        // Fallback to any item in case
        const allCaseTemplates = c.itemIds
          .map((id) => this.templateMap.get(id))
          .filter((t): t is SkinTemplate => !!t);
        chosenTemplate = allCaseTemplates[Math.floor(Math.random() * allCaseTemplates.length)] || SKIN_TEMPLATES[0];
      }

      const item = this.generateSkinItem(chosenTemplate.id, {
        origin: 'case_opening',
      });
      wonItems.push(item);
    }

    // Update state
    this.updateState((state) => {
      state.inventory.unshift(...wonItems);
      state.openedCasesCount += count;
      state.totalSpentOnCasesCC += totalCost;
      state.totalCasesValueCC += wonItems.reduce((acc, it) => acc + it.marketValue, 0);

      wonItems.forEach((item) => {
        state.caseOpeningHistory.unshift({
          id: `open_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          caseId: c.id,
          caseName: c.name,
          item,
        });
      });

      // Keep max 50 opening history items
      if (state.caseOpeningHistory.length > 50) {
        state.caseOpeningHistory = state.caseOpeningHistory.slice(0, 50);
      }

      // Check achievements
      this.checkAchievements(state, wonItems);
    });

    return { success: true, items: wonItems };
  }

  public generateReelItems(caseId: string, winningItem: SkinItem, totalItems: number = 45): SkinItem[] {
    const c = this.getCase(caseId);
    const caseTemplates = (c ? c.itemIds : SKIN_TEMPLATES.map((t) => t.id))
      .map((id) => this.templateMap.get(id))
      .filter((t): t is SkinTemplate => !!t);

    const reel: SkinItem[] = [];
    const winningIndex = 35; // Target landing index

    for (let i = 0; i < totalItems; i++) {
      if (i === winningIndex) {
        reel.push(winningItem);
      } else {
        const randomTpl = caseTemplates[Math.floor(Math.random() * caseTemplates.length)] || SKIN_TEMPLATES[0];
        reel.push(
          this.generateSkinItem(randomTpl.id, {
            origin: 'case_opening',
          })
        );
      }
    }

    return reel;
  }

  private rollRarity(dropRates: Record<SkinRarity, number>): SkinRarity {
    const roll = Math.random() * 100;
    let accumulated = 0;

    const order: SkinRarity[] = [
      'Prestige',
      'Ultra Rare',
      'Mythic',
      'Legendary',
      'Epic',
      'Rare',
      'Uncommon',
      'Common',
    ];

    for (const r of order) {
      accumulated += dropRates[r] || 0;
      if (roll <= accumulated) {
        return r;
      }
    }

    return 'Common';
  }

  // -------------------------------------------------------------
  // SKIN UPGRADE ENGINE
  // -------------------------------------------------------------

  public calculateUpgradeChance(
    inputValue: number,
    targetValue: number
  ): { winChance: number; houseEdge: number } {
    if (inputValue <= 0 || targetValue <= 0) return { winChance: 0, houseEdge: 0.05 };
    const houseEdge = 0.05; // 5% house edge for realistic high-tension betting
    const rawChance = (inputValue / targetValue) * (1 - houseEdge) * 100;
    const winChance = Math.max(1.0, Math.min(95.0, parseFloat(rawChance.toFixed(2))));
    return { winChance, houseEdge };
  }

  public executeUpgrade(
    inputSkinIds: string[],
    targetTemplateId: string,
    targetMultiplier?: number
  ): {
    success: boolean;
    won: boolean;
    rollResult: number;
    winChance: number;
    rewardItem?: SkinItem;
    error?: string;
  } {
    const state = this.getOrCreateState();
    const inputSkins = state.inventory.filter((s) => inputSkinIds.includes(s.id));

    if (inputSkins.length === 0 || inputSkins.length !== inputSkinIds.length) {
      return { success: false, won: false, rollResult: 0, winChance: 0, error: 'Выбранные предметы не найдены в инвентаре' };
    }

    const inputTotalValue = inputSkins.reduce((sum, s) => sum + s.marketValue, 0);
    const targetTpl = this.templateMap.get(targetTemplateId);
    if (!targetTpl) {
      return { success: false, won: false, rollResult: 0, winChance: 0, error: 'Целевой скин не найден' };
    }

    const targetValue = targetMultiplier
      ? Math.round(inputTotalValue * targetMultiplier)
      : targetTpl.baseValue;

    const { winChance } = this.calculateUpgradeChance(inputTotalValue, targetValue);
    const rollResult = parseFloat((Math.random() * 100).toFixed(2));
    const won = rollResult <= winChance;

    let rewardItem: SkinItem | undefined;

    if (won) {
      rewardItem = this.generateSkinItem(targetTpl.id, {
        origin: 'upgrade',
      });
    }

    // Process inventory
    this.updateState((s) => {
      // Remove burned input skins
      s.inventory = s.inventory.filter((it) => !inputSkinIds.includes(it.id));

      if (won && rewardItem) {
        s.inventory.unshift(rewardItem);
      }

      const attempt: UpgradeAttempt = {
        id: `upg_${Date.now()}`,
        timestamp: Date.now(),
        inputItemIds: inputSkinIds,
        inputTotalValue,
        targetMultiplier: targetMultiplier || targetValue / inputTotalValue,
        targetValue,
        winChancePercent: winChance,
        rollResult,
        won,
        rewardItem,
      };

      s.upgradeHistory.unshift(attempt);
      if (s.upgradeHistory.length > 50) {
        s.upgradeHistory = s.upgradeHistory.slice(0, 50);
      }

      // Achievement check
      if (won && winChance < 25) {
        const ach = s.achievements.find((a) => a.id === 'ach_upgrade_king');
        if (ach && !ach.unlocked) {
          ach.unlocked = true;
          ach.unlockedAt = Date.now();
          ach.progress = 1;
          casinoManager.addTransaction({
            type: 'tournament_reward',
            amountCC: ach.rewardCC,
            description: `Достижение "${ach.title}"`,
          });
        }
      }
    });

    return {
      success: true,
      won,
      rollResult,
      winChance,
      rewardItem,
    };
  }

  // -------------------------------------------------------------
  // TRADE-UP CONTRACTS ENGINE
  // -------------------------------------------------------------

  public executeTradeUpContract(inputSkinIds: string[]): {
    success: boolean;
    resultItem?: SkinItem;
    error?: string;
  } {
    if (inputSkinIds.length !== 10) {
      return { success: false, error: 'Для контракта обмена требуется ровно 10 предметов одинаковой редкости' };
    }

    const state = this.getOrCreateState();
    const inputSkins = state.inventory.filter((s) => inputSkinIds.includes(s.id));

    if (inputSkins.length !== 10) {
      return { success: false, error: 'Один или несколько предметов не найдены в инвентаре' };
    }

    const firstRarity = inputSkins[0].rarity;
    const allSameRarity = inputSkins.every((s) => s.rarity === firstRarity);
    if (!allSameRarity) {
      return { success: false, error: 'Все 10 предметов должны быть одной категории редкости!' };
    }

    const rarityProgression: Record<SkinRarity, SkinRarity | null> = {
      Common: 'Uncommon',
      Uncommon: 'Rare',
      Rare: 'Epic',
      Epic: 'Legendary',
      Legendary: 'Mythic',
      Mythic: 'Ultra Rare',
      'Ultra Rare': 'Prestige',
      Prestige: null,
    };

    const outputRarity = rarityProgression[firstRarity];
    if (!outputRarity) {
      return { success: false, error: 'Предметы максимальной редкости Prestige нельзя использовать в контракте' };
    }

    // Float averaging
    const avgFloat = inputSkins.reduce((sum, s) => sum + s.float, 0) / 10;
    const floatVariance = (Math.random() - 0.5) * 0.05;
    const finalFloat = Math.max(0.0001, Math.min(0.9999, avgFloat + floatVariance));

    // Choose resulting collection from input collections
    const collectionsInContract = inputSkins.map((s) => s.collectionId);
    const chosenCollection = collectionsInContract[Math.floor(Math.random() * collectionsInContract.length)];

    // Find templates with outputRarity in that collection (or globally)
    let candidateTemplates = SKIN_TEMPLATES.filter(
      (t) => t.rarity === outputRarity && t.collectionId === chosenCollection
    );
    if (candidateTemplates.length === 0) {
      candidateTemplates = SKIN_TEMPLATES.filter((t) => t.rarity === outputRarity);
    }
    const chosenTemplate = candidateTemplates[Math.floor(Math.random() * candidateTemplates.length)] || SKIN_TEMPLATES[0];

    const resultItem = this.generateSkinItem(chosenTemplate.id, {
      origin: 'trade_up',
      overrideFloat: finalFloat,
    });

    this.updateState((s) => {
      // Burn input items
      s.inventory = s.inventory.filter((it) => !inputSkinIds.includes(it.id));
      // Add result
      s.inventory.unshift(resultItem);

      const record: TradeUpContractRecord = {
        id: `contract_${Date.now()}`,
        timestamp: Date.now(),
        inputItemIds: inputSkinIds,
        inputRarity: firstRarity,
        outputRarity,
        resultItem,
        averageFloat: avgFloat,
      };

      s.tradeUpHistory.unshift(record);
      if (s.tradeUpHistory.length > 50) s.tradeUpHistory = s.tradeUpHistory.slice(0, 50);

      // Check achievement
      const ach = s.achievements.find((a) => a.id === 'ach_contract_master');
      if (ach && !ach.unlocked) {
        ach.progress = s.tradeUpHistory.length;
        if (ach.progress >= ach.maxProgress) {
          ach.unlocked = true;
          ach.unlockedAt = Date.now();
          casinoManager.addTransaction({
            type: 'tournament_reward',
            amountCC: ach.rewardCC,
            description: `Достижение "${ach.title}"`,
          });
        }
      }
    });

    return { success: true, resultItem };
  }

  // -------------------------------------------------------------
  // SKIN CRAFTING & FACTORY INTEGRATION
  // -------------------------------------------------------------

  public craftSkin(recipeId: string): { success: boolean; item?: SkinItem; error?: string } {
    const recipe = CRAFTING_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return { success: false, error: 'Рецепт не найден' };

    const currentCC = casinoManager.getCasinoCoins();
    if (currentCC < recipe.costCC) {
      return {
        success: false,
        error: `Недостаточно Casino Coins. Стоимость крафта: ${recipe.costCC.toLocaleString()} CC`,
      };
    }

    // Deduct CC
    casinoManager.addTransaction({
      type: 'game_loss',
      amountCC: recipe.costCC,
      description: `Крафт: ${recipe.name}`,
    });

    const state = this.getOrCreateState();
    const brandName = state.playerStudio.isCreated ? state.playerStudio.brandName : undefined;

    const craftedItem = this.generateSkinItem(recipe.outputTemplateId, {
      origin: 'crafting',
      craftedBrand: brandName,
    });

    this.updateState((s) => {
      s.inventory.unshift(craftedItem);
      if (s.playerStudio.isCreated) {
        s.playerStudio.skinsDesignedCount += 1;
        s.playerStudio.reputation = Math.min(100, s.playerStudio.reputation + 2);
      }

      const ach = s.achievements.find((a) => a.id === 'ach_craft_factory');
      if (ach && !ach.unlocked) {
        ach.unlocked = true;
        ach.unlockedAt = Date.now();
        ach.progress = 1;
        casinoManager.addTransaction({
          type: 'tournament_reward',
          amountCC: ach.rewardCC,
          description: `Достижение "${ach.title}"`,
        });
      }
    });

    return { success: true, item: craftedItem };
  }

  // -------------------------------------------------------------
  // BRAND STUDIO & CASE FACTORY
  // -------------------------------------------------------------

  public createPlayerStudio(brandName: string, tagline: string, logoEmoji: string): boolean {
    if (!brandName.trim()) return false;
    this.updateState((s) => {
      s.playerStudio = {
        isCreated: true,
        brandName: brandName.trim(),
        tagline: tagline.trim() || 'Премиальные цифровые скины',
        logoEmoji: logoEmoji || '⚡',
        level: 1,
        reputation: 30,
        followersCount: 1500,
        marketSharePercent: 1.5,
        totalRoyaltiesEarnedCC: 0,
        dailyRoyaltyIncomeCC: 15000,
        customCasesCreated: 0,
        skinsDesignedCount: 0,
        upgradesPurchased: {
          marketingLevel: 1,
          materialsDiscountLevel: 0,
          dropRateRefinementLevel: 0,
          factoryAutomationLevel: 0,
        },
      };
    });
    return true;
  }

  public publishCustomCase(
    name: string,
    theme: string,
    priceCC: number,
    itemIds: string[],
    dropRates: Record<SkinRarity, number>,
    emoji: string = '📦'
  ): { success: boolean; caseDef?: CaseDefinition; error?: string } {
    const state = this.getOrCreateState();
    if (!state.playerStudio.isCreated) {
      return { success: false, error: 'Сначала откройте собственную студию брендов' };
    }
    if (priceCC < 500) {
      return { success: false, error: 'Минимальная стоимость кейса: 500 CC' };
    }
    if (itemIds.length < 4) {
      return { success: false, error: 'Выберите минимум 4 предмета для наполнения кейса' };
    }

    const customCase: CaseDefinition = {
      id: `custom_case_${Date.now()}`,
      name: name.trim(),
      category: 'custom',
      theme: theme.trim(),
      priceCC: Math.round(priceCC),
      rarity: 'Prestige',
      emoji,
      gradient: 'from-indigo-900 via-purple-950 to-slate-950',
      accentColor: '#818cf8',
      description: `Кастомный кейс от бренда ${state.playerStudio.brandName}`,
      itemIds,
      dropRates,
      isCustomCreated: true,
      creatorBrand: state.playerStudio.brandName,
      totalOpened: 0,
    };

    this.updateState((s) => {
      s.customCases.push(customCase);
      s.playerStudio.customCasesCreated += 1;
      s.playerStudio.followersCount += Math.floor(Math.random() * 500) + 300;
      s.playerStudio.dailyRoyaltyIncomeCC += Math.round(priceCC * 0.12 * 8);
    });

    return { success: true, caseDef: customCase };
  }

  // -------------------------------------------------------------
  // MARKETPLACE & AUCTION ENGINE
  // -------------------------------------------------------------

  public listSkinOnMarket(skinId: string, priceCC: number): { success: boolean; error?: string } {
    const state = this.getOrCreateState();
    const skin = state.inventory.find((s) => s.id === skinId);
    if (!skin) return { success: false, error: 'Предмет не найден' };
    if (skin.isLocked) return { success: false, error: 'Предмет заблокирован от продажи' };
    if (priceCC <= 0) return { success: false, error: 'Укажите корректную цену' };

    const listing: SkinMarketListing = {
      id: `listing_${Date.now()}`,
      skin,
      sellerId: 'player',
      sellerName: 'Вы (Владелец)',
      isPlayer: true,
      priceCC: Math.round(priceCC),
      listedAt: Date.now(),
      expiresAt: Date.now() + 86400000 * 3, // 3 days
    };

    this.updateState((s) => {
      s.inventory = s.inventory.filter((it) => it.id !== skinId);
      s.marketListings.unshift(listing);
    });

    return { success: true };
  }

  public cancelMarketListing(listingId: string): { success: boolean; error?: string } {
    const state = this.getOrCreateState();
    const listing = state.marketListings.find((l) => l.id === listingId && l.isPlayer);
    if (!listing) return { success: false, error: 'Листинг не найден' };

    this.updateState((s) => {
      s.marketListings = s.marketListings.filter((l) => l.id !== listingId);
      s.inventory.unshift(listing.skin);
    });

    return { success: true };
  }

  public buyMarketListing(listingId: string): { success: boolean; error?: string } {
    const state = this.getOrCreateState();
    const listing = state.marketListings.find((l) => l.id === listingId);
    if (!listing) return { success: false, error: 'Лот больше не доступен' };
    if (listing.isPlayer) return { success: false, error: 'Вы не можете купить свой собственный лот' };

    const currentCC = casinoManager.getCasinoCoins();
    if (currentCC < listing.priceCC) {
      return {
        success: false,
        error: `Недостаточно Casino Coins. Стоимость: ${listing.priceCC.toLocaleString()} CC`,
      };
    }

    casinoManager.addTransaction({
      type: 'game_loss',
      amountCC: listing.priceCC,
      description: `Покупка на маркете: ${listing.skin.name}`,
    });

    const acquiredSkin = {
      ...listing.skin,
      acquiredAt: Date.now(),
      origin: 'market_buy' as const,
    };

    this.updateState((s) => {
      s.marketListings = s.marketListings.filter((l) => l.id !== listingId);
      s.inventory.unshift(acquiredSkin);
    });

    return { success: true };
  }

  public placeAuctionBid(auctionId: string, bidAmountCC: number): { success: boolean; error?: string } {
    const state = this.getOrCreateState();
    const auction = state.activeAuctions.find((a) => a.id === auctionId);
    if (!auction) return { success: false, error: 'Аукцион не найден' };
    if (Date.now() > auction.endsAt) return { success: false, error: 'Аукцион уже завершен' };
    if (bidAmountCC < auction.minNextBidCC) {
      return {
        success: false,
        error: `Минимальная ставка: ${auction.minNextBidCC.toLocaleString()} CC`,
      };
    }

    const currentCC = casinoManager.getCasinoCoins();
    if (currentCC < bidAmountCC) {
      return { success: false, error: 'Недостаточно Casino Coins для этой ставки' };
    }

    this.updateState((s) => {
      const auc = s.activeAuctions.find((a) => a.id === auctionId);
      if (!auc) return;

      auc.currentBidCC = bidAmountCC;
      auc.highestBidderId = 'player';
      auc.highestBidderName = 'Вы (Игрок)';
      auc.highestBidderIsPlayer = true;
      auc.bidCount += 1;
      auc.minNextBidCC = Math.round(bidAmountCC * 1.08);
      auc.bidHistory.unshift({
        bidderName: 'Вы (Игрок)',
        amountCC: bidAmountCC,
        timestamp: Date.now(),
        isPlayer: true,
      });

      // Extend timer if less than 30s left
      if (auc.endsAt - Date.now() < 30000) {
        auc.endsAt = Date.now() + 45000;
      }
    });

    return { success: true };
  }

  // -------------------------------------------------------------
  // QUICK ACTIONS: SELL, LOCK, FAVORITE
  // -------------------------------------------------------------

  public quickSellSkin(skinId: string): { success: boolean; payoutCC?: number; error?: string } {
    const state = this.getOrCreateState();
    const skin = state.inventory.find((s) => s.id === skinId);
    if (!skin) return { success: false, error: 'Предмет не найден' };
    if (skin.isLocked) return { success: false, error: 'Предмет заблокирован от быстрой продажи' };

    const payoutCC = Math.round(skin.marketValue * 0.85); // 85% of market value instant cashout

    casinoManager.addTransaction({
      type: 'game_win',
      amountCC: payoutCC,
      description: `Быстрая продажа: ${skin.name} (${skin.condition})`,
    });

    this.updateState((s) => {
      s.inventory = s.inventory.filter((it) => it.id !== skinId);
    });

    return { success: true, payoutCC };
  }

  public toggleFavorite(skinId: string): boolean {
    let newVal = false;
    this.updateState((s) => {
      const skin = s.inventory.find((it) => it.id === skinId);
      if (skin) {
        skin.isFavorite = !skin.isFavorite;
        newVal = skin.isFavorite;
      }
    });
    return newVal;
  }

  public toggleLock(skinId: string): boolean {
    let newVal = false;
    this.updateState((s) => {
      const skin = s.inventory.find((it) => it.id === skinId);
      if (skin) {
        skin.isLocked = !skin.isLocked;
        newVal = skin.isLocked;
      }
    });
    return newVal;
  }

  public claimCollectionReward(collectionId: string): { success: boolean; rewardCC?: number; error?: string } {
    const col = SKIN_COLLECTIONS.find((c) => c.id === collectionId);
    if (!col) return { success: false, error: 'Коллекция не найдена' };

    const state = this.getOrCreateState();
    if (state.completedCollections.includes(collectionId)) {
      return { success: false, error: 'Награда за эту коллекцию уже получена!' };
    }

    // Check if player owns all templates of this collection
    const ownedTemplateIds = new Set(state.inventory.map((s) => s.templateId));
    const allCollected = col.itemTemplateIds.every((tid) => ownedTemplateIds.has(tid));

    if (!allCollected) {
      return { success: false, error: 'Вы еще не собрали все предметы этой коллекции' };
    }

    // Award bonus
    casinoManager.addTransaction({
      type: 'tournament_reward',
      amountCC: col.completionRewardCC,
      description: `Награда за сбор коллекции: ${col.name}`,
    });

    // Award exclusive skin
    const rewardItem = this.generateSkinItem(col.exclusiveRewardTemplateId, {
      origin: 'reward',
      overrideFloat: 0.001, // Super Factory New
    });

    this.updateState((s) => {
      s.completedCollections.push(collectionId);
      s.inventory.unshift(rewardItem);

      const ach = s.achievements.find((a) => a.id === 'ach_complete_collection');
      if (ach && !ach.unlocked) {
        ach.unlocked = true;
        ach.unlockedAt = Date.now();
        ach.progress = 1;
      }
    });

    return { success: true, rewardCC: col.completionRewardCC };
  }

  // -------------------------------------------------------------
  // SIMULATION TICKS (Hourly / Daily Background Engine)
  // -------------------------------------------------------------

  public handleHourTick(_totalHours?: number): void {
    const state = this.getOrCreateState();
    const now = Date.now();

    // 1. Process active auctions & AI bidding
    this.processAuctionsSimulation(state, now);

    // 2. Process AI marketplace purchases & new listings
    this.processMarketSimulation(state, now);

    // 3. Update market price trends (random walk)
    this.updateMarketTrends(state, now);
  }

  public handleDayTick(_day?: number): void {
    const state = this.getOrCreateState();

    // Studio Royalties payout
    if (state.playerStudio.isCreated && state.playerStudio.dailyRoyaltyIncomeCC > 0) {
      const payout = state.playerStudio.dailyRoyaltyIncomeCC;
      state.playerStudio.totalRoyaltiesEarnedCC += payout;

      casinoManager.addTransaction({
        type: 'business_dividend',
        amountCC: payout,
        description: `Ежедневное роялти студии "${state.playerStudio.brandName}"`,
      });
    }

    // Refresh expired listings
    this.cleanExpiredListings(state);
  }

  private processAuctionsSimulation(state: CasesSubsystemState, now: number): void {
    state.activeAuctions.forEach((auc) => {
      if (now > auc.endsAt) {
        // Auction completed
        if (auc.highestBidderIsPlayer) {
          // Player won the auction! Deduct CC, award skin
          casinoManager.addTransaction({
            type: 'game_loss',
            amountCC: auc.currentBidCC,
            description: `Победа на аукционе: ${auc.skin.name}`,
          });
          state.inventory.unshift({
            ...auc.skin,
            acquiredAt: now,
            origin: 'auction',
          });
        } else if (auc.sellerIsPlayer) {
          // AI bought player's item! Pay player
          casinoManager.addTransaction({
            type: 'game_win',
            amountCC: auc.currentBidCC,
            description: `Лот продан на аукционе: ${auc.skin.name}`,
          });
        }
      } else {
        // AI bidding roll (30% chance per tick if auction is active)
        if (Math.random() < 0.35) {
          const eligibleCollectors = AI_COLLECTORS.filter(
            (c) =>
              c.budgetCC >= auc.minNextBidCC &&
              (c.preferredCategories.includes(auc.skin.category) ||
                c.preferredRarities.includes(auc.skin.rarity))
          );

          if (eligibleCollectors.length > 0) {
            const bidder = eligibleCollectors[Math.floor(Math.random() * eligibleCollectors.length)];
            const maxBid = Math.min(bidder.budgetCC, Math.round(auc.skin.marketValue * 1.4));

            if (auc.minNextBidCC <= maxBid) {
              const newBid = auc.minNextBidCC;
              auc.currentBidCC = newBid;
              auc.highestBidderId = bidder.id;
              auc.highestBidderName = bidder.name;
              auc.highestBidderIsPlayer = false;
              auc.bidCount += 1;
              auc.minNextBidCC = Math.round(newBid * 1.08);
              auc.bidHistory.unshift({
                bidderName: `${bidder.avatar} ${bidder.name}`,
                amountCC: newBid,
                timestamp: now,
                isPlayer: false,
              });
            }
          }
        }
      }
    });

    // Remove expired auctions and seed new ones if count < 4
    state.activeAuctions = state.activeAuctions.filter((a) => now <= a.endsAt);
    if (state.activeAuctions.length < 4) {
      this.seedInitialAuctions(state);
    }
  }

  private processMarketSimulation(state: CasesSubsystemState, now: number): void {
    // 1. AI purchases player listings if price is attractive (< 110% market value)
    state.marketListings.forEach((listing) => {
      if (listing.isPlayer) {
        const ratio = listing.priceCC / listing.skin.marketValue;
        const buyChance = ratio <= 1.0 ? 0.4 : ratio <= 1.15 ? 0.2 : 0.05;

        if (Math.random() < buyChance) {
          // Sold! Pay player
          casinoManager.addTransaction({
            type: 'game_win',
            amountCC: listing.priceCC,
            description: `Лот продан на Маркете: ${listing.skin.name}`,
          });
          listing.expiresAt = 0; // mark for removal
        }
      }
    });

    state.marketListings = state.marketListings.filter((l) => l.expiresAt > now);

    // Keep market populated with AI listings (around 12-16 items)
    if (state.marketListings.length < 12) {
      this.seedInitialMarket(state);
    }
  }

  private updateMarketTrends(state: CasesSubsystemState, now: number): void {
    SKIN_TEMPLATES.forEach((tpl) => {
      let trend = state.marketTrends[tpl.id];
      if (!trend) {
        trend = {
          templateId: tpl.id,
          currentPrice: tpl.baseValue,
          change24hPercent: 0,
          volume24h: 120,
          history: [],
        };
        state.marketTrends[tpl.id] = trend;
      }

      // Random walk price shift (-4% to +4.5%)
      const deltaPercent = (Math.random() - 0.48) * 0.08;
      trend.currentPrice = Math.round(trend.currentPrice * (1 + deltaPercent));
      trend.currentPrice = Math.max(Math.round(tpl.baseValue * 0.5), trend.currentPrice);
      trend.change24hPercent = parseFloat((((trend.currentPrice - tpl.baseValue) / tpl.baseValue) * 100).toFixed(1));

      trend.history.push({
        timestamp: now,
        price: trend.currentPrice,
        volume: Math.floor(Math.random() * 50) + 10,
      });

      if (trend.history.length > 24) {
        trend.history = trend.history.slice(-24);
      }
    });
  }

  // -------------------------------------------------------------
  // SEEDING HELPERS
  // -------------------------------------------------------------

  private seedStarterInventory(state: CasesSubsystemState): void {
    if (state.inventory.length > 0) return;
    const starter1 = this.generateSkinItem('tpl_sub_pistol_alloy', { origin: 'case_opening' });
    const starter2 = this.generateSkinItem('tpl_tactical_knife_chrome', { origin: 'case_opening' });
    const starter3 = this.generateSkinItem('tpl_anime_smg_shonen', { origin: 'case_opening' });
    state.inventory.push(starter1, starter2, starter3);
  }

  private seedInitialMarket(state: CasesSubsystemState): void {
    const sampleTemplates = [
      'tpl_plasma_pistol_shibuya',
      'tpl_demon_slayer_daggers',
      'tpl_dragon_desert_eagle',
      'tpl_turbo_boost_smg',
      'tpl_space_sniper_andromeda',
      'tpl_royal_mp7_cash',
      'tpl_pulse_smg_tokyo',
      'tpl_titanium_exhaust_blade',
      'tpl_anime_mech_gloves',
      'tpl_dragon_scale_gloves',
    ];

    sampleTemplates.forEach((tid) => {
      const item = this.generateSkinItem(tid, { origin: 'case_opening' });
      const collector = AI_COLLECTORS[Math.floor(Math.random() * AI_COLLECTORS.length)];
      const priceVariation = (Math.random() - 0.5) * 0.15;
      const priceCC = Math.round(item.marketValue * (1 + priceVariation));

      state.marketListings.push({
        id: `mkt_init_${Math.random().toString(36).substring(2, 8)}`,
        skin: item,
        sellerId: collector.id,
        sellerName: `${collector.avatar} ${collector.name}`,
        isPlayer: false,
        priceCC,
        listedAt: Date.now() - Math.floor(Math.random() * 3600000 * 12),
        expiresAt: Date.now() + 86400000 * 2,
      });
    });
  }

  private seedInitialAuctions(state: CasesSubsystemState): void {
    const auctionTemplates = [
      'tpl_cyber_katana_void',
      'tpl_sakura_scythe_goddess',
      'tpl_draconic_karambit_flame',
      'tpl_car_phantom_hypergt',
      'tpl_royal_butterfly_24k',
    ];

    auctionTemplates.forEach((tid, idx) => {
      const skin = this.generateSkinItem(tid, {
        origin: 'case_opening',
        overrideStatTrak: true,
      });
      const startPrice = Math.round(skin.marketValue * 0.6);
      const collector = AI_COLLECTORS[idx % AI_COLLECTORS.length];

      state.activeAuctions.push({
        id: `auc_${Date.now()}_${idx}`,
        skin,
        sellerName: `${collector.avatar} ${collector.name}`,
        sellerIsPlayer: false,
        startingPriceCC: startPrice,
        currentBidCC: startPrice,
        highestBidderId: collector.id,
        highestBidderName: `${collector.avatar} ${collector.name}`,
        highestBidderIsPlayer: false,
        bidCount: 1,
        createdAt: Date.now() - 3600000,
        endsAt: Date.now() + 60000 * (15 + idx * 10), // 15 - 55 mins
        minNextBidCC: Math.round(startPrice * 1.08),
        bidHistory: [
          {
            bidderName: `${collector.avatar} ${collector.name}`,
            amountCC: startPrice,
            timestamp: Date.now() - 3600000,
            isPlayer: false,
          },
        ],
      });
    });
  }

  private initMarketTrends(state: CasesSubsystemState): void {
    state.marketTrends = {};
    const now = Date.now();
    SKIN_TEMPLATES.forEach((tpl) => {
      const history = [];
      let price = tpl.baseValue;
      for (let i = 24; i >= 0; i--) {
        const pDelta = (Math.random() - 0.49) * 0.05;
        price = Math.round(price * (1 + pDelta));
        history.push({
          timestamp: now - i * 3600000,
          price,
          volume: Math.floor(Math.random() * 40) + 15,
        });
      }
      state.marketTrends[tpl.id] = {
        templateId: tpl.id,
        currentPrice: price,
        change24hPercent: parseFloat((((price - tpl.baseValue) / tpl.baseValue) * 100).toFixed(1)),
        volume24h: 320,
        history,
      };
    });
  }

  private cleanExpiredListings(state: CasesSubsystemState): void {
    const now = Date.now();
    state.marketListings.forEach((listing) => {
      if (listing.isPlayer && listing.expiresAt <= now) {
        // Return to player inventory
        state.inventory.unshift(listing.skin);
      }
    });
    state.marketListings = state.marketListings.filter((l) => l.expiresAt > now);
  }

  private checkAchievements(state: CasesSubsystemState, wonItems: SkinItem[]): void {
    // 1. First case
    const achFirst = state.achievements.find((a) => a.id === 'ach_first_case');
    if (achFirst && !achFirst.unlocked && state.openedCasesCount >= 1) {
      achFirst.unlocked = true;
      achFirst.unlockedAt = Date.now();
      achFirst.progress = 1;
      casinoManager.addTransaction({
        type: 'tournament_reward',
        amountCC: achFirst.rewardCC,
        description: `Достижение "${achFirst.title}"`,
      });
    }

    // 2. Legendary drop
    const hasLegendary = wonItems.some(
      (it) => it.rarity === 'Legendary' || it.rarity === 'Mythic' || it.rarity === 'Ultra Rare' || it.rarity === 'Prestige'
    );
    const achLeg = state.achievements.find((a) => a.id === 'ach_first_legendary');
    if (achLeg && !achLeg.unlocked && hasLegendary) {
      achLeg.unlocked = true;
      achLeg.unlockedAt = Date.now();
      achLeg.progress = 1;
      casinoManager.addTransaction({
        type: 'tournament_reward',
        amountCC: achLeg.rewardCC,
        description: `Достижение "${achLeg.title}"`,
      });
    }

    // 3. Prestige drop
    const hasPrestige = wonItems.some((it) => it.rarity === 'Prestige');
    const achPrest = state.achievements.find((a) => a.id === 'ach_first_prestige');
    if (achPrest && !achPrest.unlocked && hasPrestige) {
      achPrest.unlocked = true;
      achPrest.unlockedAt = Date.now();
      achPrest.progress = 1;
      casinoManager.addTransaction({
        type: 'tournament_reward',
        amountCC: achPrest.rewardCC,
        description: `Достижение "${achPrest.title}"`,
      });
    }

    // 4. Total cases count
    const ach100 = state.achievements.find((a) => a.id === 'ach_open_100_cases');
    if (ach100 && !ach100.unlocked) {
      ach100.progress = state.openedCasesCount;
      if (ach100.progress >= ach100.maxProgress) {
        ach100.unlocked = true;
        ach100.unlockedAt = Date.now();
        casinoManager.addTransaction({
          type: 'tournament_reward',
          amountCC: ach100.rewardCC,
          description: `Достижение "${ach100.title}"`,
        });
      }
    }

    const ach1000 = state.achievements.find((a) => a.id === 'ach_open_1000_cases');
    if (ach1000 && !ach1000.unlocked) {
      ach1000.progress = state.openedCasesCount;
      if (ach1000.progress >= ach1000.maxProgress) {
        ach1000.unlocked = true;
        ach1000.unlockedAt = Date.now();
        casinoManager.addTransaction({
          type: 'tournament_reward',
          amountCC: ach1000.rewardCC,
          description: `Достижение "${ach1000.title}"`,
        });
      }
    }
  }

  private updateState(updater: (state: CasesSubsystemState) => void): void {
    const root = gameState.getState();
    const current = root.cases || INITIAL_CASES_STATE;
    const cloned = JSON.parse(JSON.stringify(current)) as CasesSubsystemState;
    updater(cloned);

    gameState.update((draft) => {
      draft.cases = cloned;
    });
    this.state = cloned;
  }
}

export const casesManager = new CasesManager();
