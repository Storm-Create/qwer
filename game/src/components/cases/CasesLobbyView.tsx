import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Boxes,
  ArrowUpRight,
  Scroll,
  TrendingUp,
  Gavel,
  Hammer,
  Trophy,
  Award,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  DollarSign,
  Star,
  Lock,
  Unlock,
  Eye,
  Plus,
  Zap,
  CheckCircle2,
  Clock,
  Flame,
  ShieldCheck,
  Percent,
  Layers,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import {
  GameState,
} from '../../types/game';
import {
  SkinItem,
  CaseDefinition,
  SkinCategory,
  SkinRarity,
  SkinTemplate,
  SkinMarketListing,
  SkinAuction,
  SkinCraftingRecipe,
} from '../../types/cases';
import {
  SKIN_TEMPLATES,
  SKIN_COLLECTIONS,
  CURATED_CASES,
  CRAFTING_RECIPES,
  RARITY_CONFIG,
} from '../../game/cases/skinCatalog';
import { casesManager } from '../../game/cases/casesManager';
import { casinoManager } from '../../game/casino/casinoManager';
import { SkinInspectModal } from './SkinInspectModal';
import { CaseOpeningModal } from './CaseOpeningModal';
import { useToast } from '../ui/ToastContext';

interface CasesLobbyViewProps {
  gameState: GameState;
}

type CasesTab =
  | 'cases'
  | 'inventory'
  | 'upgrade'
  | 'contracts'
  | 'market'
  | 'auctions'
  | 'crafting'
  | 'collections'
  | 'achievements';

export const CasesLobbyView: React.FC<CasesLobbyViewProps> = ({ gameState }) => {
  const { showSuccess, showError, showWarning } = useToast();
  const [activeTab, setActiveTab] = useState<CasesTab>('cases');
  const [tick, setTick] = useState(0);

  // Subsystem state
  const casesState = casesManager.getOrCreateState();
  const casinoCoins = casinoManager.getCasinoCoins();

  // Modals & Selected items
  const [inspectSkin, setInspectSkin] = useState<SkinItem | null>(null);
  const [openingCase, setOpeningCase] = useState<CaseDefinition | null>(null);

  // Case category filter
  const [caseCategory, setCaseCategory] = useState<string>('all');

  // Inventory filters & sorting
  const [inventoryCategory, setInventoryCategory] = useState<string>('all');
  const [inventoryRarity, setInventoryRarity] = useState<string>('all');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventorySort, setInventorySort] = useState<'price_desc' | 'price_asc' | 'rarity' | 'float_asc' | 'newest'>('price_desc');

  // Upgrade state
  const [upgradeSelectedInputIds, setUpgradeSelectedInputIds] = useState<string[]>([]);
  const [upgradeTargetTemplateId, setUpgradeTargetTemplateId] = useState<string>(SKIN_TEMPLATES[0].id);
  const [upgradeTargetMultiplier, setUpgradeTargetMultiplier] = useState<number>(2.0);
  const [upgradeIsSpinning, setUpgradeIsSpinning] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<{
    won: boolean;
    rollResult: number;
    winChance: number;
    rewardItem?: SkinItem;
  } | null>(null);
  const [upgradeNeedleAngle, setUpgradeNeedleAngle] = useState(0);

  // Trade-up contract state
  const [contractSelectedIds, setContractSelectedIds] = useState<string[]>([]);
  const [contractResult, setContractResult] = useState<SkinItem | null>(null);

  // Market state
  const [marketSearch, setMarketSearch] = useState('');
  const [marketCategory, setMarketCategory] = useState<string>('all');
  const [marketSellSkinId, setMarketSellSkinId] = useState<string>('');
  const [marketSellPrice, setMarketSellPrice] = useState<number>(1000);

  // Auction state
  const [auctionBidInputs, setAuctionBidInputs] = useState<Record<string, number>>({});

  // Studio Creation Form
  const [studioBrandName, setStudioBrandName] = useState('');
  const [studioTagline, setStudioTagline] = useState('');
  const [studioEmoji, setStudioEmoji] = useState('⚡');

  // Custom Case Creation Form
  const [customCaseName, setCustomCaseName] = useState('');
  const [customCaseTheme, setCustomCaseTheme] = useState('');
  const [customCasePrice, setCustomCasePrice] = useState(5000);
  const [customCaseItemIds, setCustomCaseItemIds] = useState<string[]>([]);

  // Periodically refresh view for auctions and market ticks
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Total inventory calculation
  const totalInventoryValue = useMemo(() => {
    return casesState.inventory.reduce((sum, item) => sum + item.marketValue, 0);
  }, [casesState.inventory, tick]);

  // Filtered cases
  const displayedCases = useMemo(() => {
    const all = casesManager.getAllCases();
    if (caseCategory === 'all') return all;
    return all.filter((c) => c.category === caseCategory);
  }, [caseCategory, casesState.customCases, tick]);

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    let list = [...casesState.inventory];

    if (inventoryCategory !== 'all') {
      if (inventoryCategory === 'favorites') {
        list = list.filter((it) => it.isFavorite);
      } else {
        list = list.filter((it) => it.category === inventoryCategory);
      }
    }

    if (inventoryRarity !== 'all') {
      list = list.filter((it) => it.rarity === inventoryRarity);
    }

    if (inventorySearch.trim()) {
      const q = inventorySearch.toLowerCase();
      list = list.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.weaponType.toLowerCase().includes(q) ||
          it.skinName.toLowerCase().includes(q) ||
          it.collectionName.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      switch (inventorySort) {
        case 'price_desc':
          return b.marketValue - a.marketValue;
        case 'price_asc':
          return a.marketValue - b.marketValue;
        case 'rarity': {
          const rA = RARITY_CONFIG[a.rarity]?.order || 0;
          const rB = RARITY_CONFIG[b.rarity]?.order || 0;
          return rB - rA;
        }
        case 'float_asc':
          return a.float - b.float;
        case 'newest':
        default:
          return b.acquiredAt - a.acquiredAt;
      }
    });

    return list;
  }, [casesState.inventory, inventoryCategory, inventoryRarity, inventorySearch, inventorySort, tick]);

  // UPGRADE HANDLERS
  const upgradeInputTotalValue = useMemo(() => {
    return casesState.inventory
      .filter((s) => upgradeSelectedInputIds.includes(s.id))
      .reduce((sum, s) => sum + s.marketValue, 0);
  }, [upgradeSelectedInputIds, casesState.inventory]);

  const targetUpgradeTemplate = useMemo(() => {
    return casesManager.getTemplate(upgradeTargetTemplateId) || SKIN_TEMPLATES[0];
  }, [upgradeTargetTemplateId]);

  const calculatedUpgradeTargetValue = Math.round(
    upgradeInputTotalValue > 0 ? upgradeInputTotalValue * upgradeTargetMultiplier : targetUpgradeTemplate.baseValue
  );

  const { winChance: upgradeWinChance } = useMemo(() => {
    return casesManager.calculateUpgradeChance(upgradeInputTotalValue, calculatedUpgradeTargetValue);
  }, [upgradeInputTotalValue, calculatedUpgradeTargetValue]);

  const handleStartUpgrade = () => {
    if (upgradeSelectedInputIds.length === 0 || upgradeIsSpinning) return;
    setUpgradeIsSpinning(true);
    setUpgradeResult(null);

    // Trigger visual needle spin
    const targetAngle = 360 * 5 + Math.random() * 360;
    setUpgradeNeedleAngle(targetAngle);

    setTimeout(() => {
      const res = casesManager.executeUpgrade(
        upgradeSelectedInputIds,
        upgradeTargetTemplateId,
        upgradeTargetMultiplier
      );
      setUpgradeResult(res);
      setUpgradeIsSpinning(false);
      setUpgradeSelectedInputIds([]);
      setTick((t) => t + 1);
    }, 3200);
  };

  // TRADE-UP HANDLERS
  const handleToggleContractItem = (skinId: string) => {
    if (contractSelectedIds.includes(skinId)) {
      setContractSelectedIds(contractSelectedIds.filter((id) => id !== skinId));
    } else {
      if (contractSelectedIds.length >= 10) return;
      const skin = casesState.inventory.find((s) => s.id === skinId);
      if (!skin) return;

      if (contractSelectedIds.length > 0) {
        const firstSkin = casesState.inventory.find((s) => s.id === contractSelectedIds[0]);
        if (firstSkin && skin.rarity !== firstSkin.rarity) {
          showWarning('Контракт обмена', 'Все предметы в контракте должны быть одной редкости!');
          return;
        }
      }
      setContractSelectedIds([...contractSelectedIds, skinId]);
    }
  };

  const handleExecuteContract = () => {
    const res = casesManager.executeTradeUpContract(contractSelectedIds);
    if (res.success && res.resultItem) {
      setContractResult(res.resultItem);
      setContractSelectedIds([]);
      setTick((t) => t + 1);
      showSuccess('Контракт выполнен', `Получен скин: ${res.resultItem.name}`);
    } else {
      showError('Ошибка контракта', res.error || 'Ошибка исполнения контракта');
    }
  };

  // MARKETPLACE HANDLERS
  const handleListOnMarket = () => {
    if (!marketSellSkinId || marketSellPrice <= 0) return;
    const res = casesManager.listSkinOnMarket(marketSellSkinId, marketSellPrice);
    if (res.success) {
      setMarketSellSkinId('');
      setTick((t) => t + 1);
      showSuccess('Маркет скинов', 'Скин успешно выставлен на продажу');
    } else {
      showError('Ошибка маркета', res.error || 'Не удалось выставить предмет на продажу');
    }
  };

  return (
    <div id="cases-lobby-container" className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & VIRTUAL WALLET BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Brand & Stats */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(245,158,11,0.35)]">
              🎁
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                  CASE & SKIN EMPIRE
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                  VIRTUAL ONLY
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Кейсы, 120+ скинов, апгрейды, контракты, живой маркет и производство холдинга
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* CC Balance */}
            <div className="flex-1 sm:flex-initial bg-slate-950/80 border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-inner">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                CC
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Баланс монет</span>
                <span className="text-base font-black text-amber-300 font-mono">
                  {casinoCoins.toLocaleString()} CC
                </span>
              </div>
            </div>

            {/* Inventory Valuation */}
            <div className="flex-1 sm:flex-initial bg-slate-950/80 border border-indigo-500/30 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-inner">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                💎
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Инвентарь ({casesState.inventory.length} шт.)
                </span>
                <span className="text-base font-black text-indigo-300 font-mono">
                  {totalInventoryValue.toLocaleString()} CC
                </span>
              </div>
            </div>

            {/* Opened Cases Count */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 hidden sm:flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                📦
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Открыто кейсов</span>
                <span className="text-base font-black text-slate-200 font-mono">
                  {casesState.openedCasesCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-6 border-t border-slate-800/80 pt-4 no-scrollbar">
          {[
            { id: 'cases', label: 'Магазин Кейсов', icon: Package, count: displayedCases.length },
            { id: 'inventory', label: 'Инвентарь', icon: Boxes, count: casesState.inventory.length },
            { id: 'upgrade', label: 'Апгрейд', icon: ArrowUpRight, badge: 'HOT' },
            { id: 'contracts', label: 'Trade-Up Контракты', icon: Scroll },
            { id: 'market', label: 'Маркетплейс', icon: TrendingUp, count: casesState.marketListings.length },
            { id: 'auctions', label: 'Аукционы', icon: Gavel, count: casesState.activeAuctions.length },
            { id: 'crafting', label: 'Крафт & Фабрика', icon: Hammer },
            { id: 'collections', label: 'Коллекции', icon: Trophy, count: SKIN_COLLECTIONS.length },
            { id: 'achievements', label: 'Достижения', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as CasesTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800/80 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                      isActive ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-md text-[10px] font-black bg-rose-500 text-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: CASE MARKET */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'cases' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {[
              { id: 'all', label: '🔥 Все кейсы' },
              { id: 'popular', label: '🔥 Популярные' },
              { id: 'new', label: '🆕 Новые' },
              { id: 'premium', label: '💎 Премиум' },
              { id: 'weapons', label: '🎯 Оружие и Ножи' },
              { id: 'cars', label: '🚗 Гиперкары' },
              { id: 'anime', label: '🌸 Аниме' },
              { id: 'cyberpunk', label: '🌆 Киберпанк' },
              { id: 'luxury', label: '👑 24K Роскошь' },
              { id: 'custom', label: '📦 Свои кейсы' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCaseCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  caseCategory === cat.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Cases Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayedCases.map((caseDef) => (
              <div
                key={caseDef.id}
                className="group relative rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Case Top Visual */}
                <div
                  className={`p-6 bg-gradient-to-b ${caseDef.gradient} flex flex-col items-center justify-center relative min-h-[160px]`}
                >
                  {caseDef.isCustomCreated && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 text-[10px] font-black">
                      Кастомный ({caseDef.creatorBrand})
                    </span>
                  )}
                  <span className="absolute top-3 right-3 text-xs text-slate-300 font-medium">
                    {caseDef.theme}
                  </span>
                  <div className="text-6xl drop-shadow-2xl group-hover:scale-110 transition-transform duration-300 my-2">
                    {caseDef.emoji}
                  </div>
                </div>

                {/* Case Info & Contents Preview */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                      {caseDef.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{caseDef.description}</p>
                  </div>

                  {/* Drop Table Probabilities Mini-bar */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                      <span>Шансы дропа</span>
                      <span className="text-amber-400">Prestige: {caseDef.dropRates.Prestige}%</span>
                    </span>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="bg-slate-400" style={{ width: `${caseDef.dropRates.Common}%` }} />
                      <div className="bg-sky-400" style={{ width: `${caseDef.dropRates.Uncommon}%` }} />
                      <div className="bg-indigo-400" style={{ width: `${caseDef.dropRates.Rare}%` }} />
                      <div className="bg-purple-400" style={{ width: `${caseDef.dropRates.Epic}%` }} />
                      <div className="bg-rose-400" style={{ width: `${caseDef.dropRates.Legendary}%` }} />
                      <div className="bg-amber-400" style={{ width: `${caseDef.dropRates.Mythic}%` }} />
                      <div className="bg-emerald-400" style={{ width: `${caseDef.dropRates['Ultra Rare']}%` }} />
                      <div className="bg-fuchsia-400" style={{ width: `${caseDef.dropRates.Prestige}%` }} />
                    </div>
                  </div>

                  {/* Price & Open Button */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Цена</span>
                      <span className="text-base font-black text-amber-300 font-mono">
                        {caseDef.priceCC.toLocaleString()} CC
                      </span>
                    </div>

                    <button
                      onClick={() => setOpeningCase(caseDef)}
                      className="px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-400 hover:to-yellow-400 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Открыть
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: SKIN INVENTORY */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Filter, Search & Sort Control Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по названию, оружию или коллекции..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Category Select */}
            <div className="flex items-center gap-2">
              <select
                value={inventoryCategory}
                onChange={(e) => setInventoryCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Все категории</option>
                <option value="favorites">⭐ Избранные</option>
                <option value="Knives">🗡️ Ножи & Катаны</option>
                <option value="Weapons">🎯 Оружие</option>
                <option value="Gloves">🧤 Перчатки</option>
                <option value="Anime">🌸 Аниме</option>
                <option value="Cars">🏎️ Гиперкары</option>
                <option value="Luxury">👑 Роскошь</option>
              </select>

              {/* Rarity Select */}
              <select
                value={inventoryRarity}
                onChange={(e) => setInventoryRarity(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Любая редкость</option>
                <option value="Prestige">Prestige ★</option>
                <option value="Ultra Rare">Ultra Rare</option>
                <option value="Mythic">Mythic</option>
                <option value="Legendary">Legendary</option>
                <option value="Epic">Epic</option>
                <option value="Rare">Rare</option>
                <option value="Uncommon">Uncommon</option>
                <option value="Common">Common</option>
              </select>

              {/* Sort Select */}
              <select
                value={inventorySort}
                onChange={(e) => setInventorySort(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="price_desc">Сначала дорогие</option>
                <option value="price_asc">Сначала дешевые</option>
                <option value="rarity">По редкости</option>
                <option value="float_asc">По качеству (Float)</option>
                <option value="newest">Сначала новые</option>
              </select>
            </div>
          </div>

          {/* Inventory Grid */}
          {filteredInventory.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="text-5xl">🧰</div>
              <h3 className="text-lg font-bold text-slate-300">Инвентарь пуст</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Откройте кейсы в магазине или скрафтите предметы на фабрике, чтобы пополнить коллекцию!
              </p>
              <button
                onClick={() => setActiveTab('cases')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all"
              >
                Перейти к Кейсам
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredInventory.map((skin) => {
                const rCfg = RARITY_CONFIG[skin.rarity] || RARITY_CONFIG.Common;
                return (
                  <div
                    key={skin.id}
                    onClick={() => setInspectSkin(skin)}
                    className={`relative rounded-xl p-3.5 bg-gradient-to-b ${rCfg.gradient} border ${rCfg.border} hover:scale-105 transition-all duration-200 flex flex-col justify-between cursor-pointer group shadow-md`}
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between w-full">
                      <span className={`px-1.5 py-0.5 text-[9px] font-black rounded ${rCfg.badgeBg}`}>
                        {skin.rarity}
                      </span>
                      <div className="flex items-center gap-1">
                        {skin.hasStatTrak && (
                          <span className="px-1 py-0.2 text-[8px] font-black bg-orange-500/40 text-orange-200 rounded">
                            ST
                          </span>
                        )}
                        {skin.isFavorite && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                        {skin.isLocked && <Lock className="w-3 h-3 text-rose-400" />}
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="text-5xl my-3 text-center drop-shadow-md group-hover:scale-110 transition-transform">
                      {skin.iconEmoji}
                    </div>

                    {/* Title & Float */}
                    <div className="text-center w-full space-y-1">
                      <h4 className="text-xs font-extrabold text-white truncate">{skin.name}</h4>
                      <p className="text-[10px] text-slate-300 truncate">{skin.condition}</p>

                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                        <span>FL: {skin.float.toFixed(3)}</span>
                        <span>#{skin.pattern}</span>
                      </div>

                      <div className="mt-2 px-2 py-1 rounded bg-slate-950/80 text-[11px] font-black text-amber-300 font-mono">
                        {skin.marketValue.toLocaleString()} CC
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: SKIN UPGRADE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'upgrade' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Selection from Inventory */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                1. Выберите предмет(ы) для ставки
              </h3>
              <span className="text-xs text-amber-300 font-mono font-bold">
                Вход: {upgradeInputTotalValue.toLocaleString()} CC
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[420px] space-y-2 pr-1">
              {casesState.inventory.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Инвентарь пуст. Сначала откройте кейс.
                </div>
              ) : (
                casesState.inventory.map((skin) => {
                  const isSelected = upgradeSelectedInputIds.includes(skin.id);
                  const rCfg = RARITY_CONFIG[skin.rarity] || RARITY_CONFIG.Common;
                  return (
                    <div
                      key={skin.id}
                      onClick={() => {
                        if (upgradeIsSpinning) return;
                        if (isSelected) {
                          setUpgradeSelectedInputIds(upgradeSelectedInputIds.filter((id) => id !== skin.id));
                        } else {
                          setUpgradeSelectedInputIds([...upgradeSelectedInputIds, skin.id]);
                        }
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{skin.iconEmoji}</span>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">{skin.name}</p>
                          <span className={`text-[10px] font-bold ${rCfg.text}`}>
                            {skin.rarity} • {skin.condition}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-amber-300 font-mono">
                        {skin.marketValue.toLocaleString()} CC
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Upgrade Target & Interactive Circular Gauge Dial */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-indigo-400" />
                2. Настройка шанса и цели
              </h3>
              <div className="flex items-center gap-2">
                {[1.5, 2.0, 3.0, 5.0, 10.0].map((mult) => (
                  <button
                    key={mult}
                    onClick={() => {
                      if (upgradeIsSpinning) return;
                      setUpgradeTargetMultiplier(mult);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono transition-all ${
                      upgradeTargetMultiplier === mult
                        ? 'bg-indigo-500 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mult}x
                  </button>
                ))}
              </div>
            </div>

            {/* Circular Gauge Representation */}
            <div className="flex flex-col items-center justify-center space-y-4 my-auto">
              <div className="relative w-56 h-56 rounded-full border-4 border-slate-800 flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden bg-slate-950">
                {/* Visual Win Zone background slice */}
                <div
                  className="absolute inset-0 bg-emerald-500/20"
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${
                      upgradeWinChance > 50 ? '100% 0%, 100% 100%, 0% 100%, 0% 0%' : '100% 0%, 100% 100%'
                    }, 50% 50%)`,
                  }}
                />

                {/* Spinning Needle */}
                <div
                  className="absolute top-1/2 left-1/2 w-1 h-24 bg-amber-400 origin-top transform -translate-x-1/2 shadow-[0_0_15px_#f59e0b] z-20 transition-all duration-[3200ms] ease-out"
                  style={{ transform: `rotate(${upgradeNeedleAngle}deg)` }}
                >
                  <div className="w-3 h-3 rounded-full bg-amber-400 absolute -top-1.5 -left-1 shadow" />
                </div>

                {/* Center Stats Display */}
                <div className="relative z-10 text-center bg-slate-900/90 rounded-full w-36 h-36 flex flex-col items-center justify-center border border-slate-700 shadow-inner">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Шанс победы</span>
                  <span className="text-3xl font-black text-emerald-400 font-mono">
                    {upgradeWinChance}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {upgradeTargetMultiplier}x Множитель
                  </span>
                </div>
              </div>

              {/* Target & Potential Rewards */}
              <div className="w-full grid grid-cols-2 gap-4 max-w-md">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Ставка</span>
                  <span className="text-sm font-black text-amber-300 font-mono">
                    {upgradeInputTotalValue.toLocaleString()} CC
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Потенциальный выигрыш</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    {calculatedUpgradeTargetValue.toLocaleString()} CC
                  </span>
                </div>
              </div>

              {/* Outcome Announcement */}
              {upgradeResult && (
                <div
                  className={`p-4 rounded-xl border text-center animate-in zoom-in-95 duration-200 max-w-md w-full ${
                    upgradeResult.won
                      ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                      : 'bg-rose-950/70 border-rose-500 text-rose-200'
                  }`}
                >
                  <h4 className="text-base font-black">
                    {upgradeResult.won ? '🎉 АПГРЕЙД УСПЕШЕН!' : '💥 АПГРЕЙД НЕ УДАЛСЯ'}
                  </h4>
                  <p className="text-xs mt-1">
                    {upgradeResult.won
                      ? `Вы получили: ${upgradeResult.rewardItem?.name} (${upgradeResult.rewardItem?.marketValue.toLocaleString()} CC)!`
                      : 'Предметы сгорели. Попробуйте еще раз!'}
                  </p>
                </div>
              )}
            </div>

            {/* Start Upgrade Button */}
            <button
              onClick={handleStartUpgrade}
              disabled={upgradeSelectedInputIds.length === 0 || upgradeIsSpinning}
              className="w-full py-4 rounded-xl font-black text-base bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-400 hover:to-yellow-300 transition-all flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {upgradeIsSpinning ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  ВРАЩЕНИЕ ДИСКА...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  КРУТИТЬ АПГРЕЙД ({upgradeWinChance}%)
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: TRADE-UP CONTRACTS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'contracts' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Scroll className="w-5 h-5 text-amber-400" />
                Контракт Обмена (Trade-Up Contract)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Поместите ровно 10 предметов одной редкости, чтобы сжечь их и получить 1 предмет следующего тира!
              </p>
            </div>

            {/* 10-Slot Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3">
              {Array.from({ length: 10 }).map((_, idx) => {
                const skinId = contractSelectedIds[idx];
                const skin = skinId ? casesState.inventory.find((s) => s.id === skinId) : null;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (skinId) {
                        setContractSelectedIds(contractSelectedIds.filter((id) => id !== skinId));
                      }
                    }}
                    className={`h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-2 text-center transition-all ${
                      skin
                        ? 'bg-slate-900 border-amber-500 cursor-pointer shadow-md'
                        : 'bg-slate-950/40 border-slate-800 text-slate-600'
                    }`}
                  >
                    {skin ? (
                      <>
                        <span className="text-2xl mb-1">{skin.iconEmoji}</span>
                        <p className="text-[10px] font-bold text-white truncate w-full">{skin.name}</p>
                        <span className="text-[9px] text-amber-300 font-mono">
                          {skin.marketValue.toLocaleString()} CC
                        </span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-bold">Слот #{idx + 1}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs text-slate-300">
                Заполнено: <strong className="text-amber-300">{contractSelectedIds.length} / 10</strong> предметов
              </div>

              <button
                onClick={handleExecuteContract}
                disabled={contractSelectedIds.length !== 10}
                className="px-6 py-2.5 rounded-xl font-black text-xs uppercase bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-400 hover:to-yellow-400 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Scroll className="w-4 h-4" />
                Подписать Контракт
              </button>
            </div>

            {/* Contract Success Modal / Notice */}
            {contractResult && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/60 via-purple-950/60 to-slate-900 border-2 border-amber-500 text-center space-y-3 animate-in zoom-in-95 duration-300">
                <span className="text-xs font-black uppercase text-amber-400">✨ КОНТРАКТ ИСПОЛНЕН ✨</span>
                <div className="text-6xl">{contractResult.iconEmoji}</div>
                <h3 className="text-xl font-black text-white">{contractResult.name}</h3>
                <p className="text-xs text-slate-300">
                  Редкость: <strong className="text-amber-300">{contractResult.rarity}</strong> • Float:{' '}
                  <strong>{contractResult.float.toFixed(4)}</strong> ({contractResult.condition})
                </p>
                <div className="text-sm font-black text-amber-300 font-mono">
                  {contractResult.marketValue.toLocaleString()} CC
                </div>
              </div>
            )}

            {/* Inventory Picker for Contract */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Выберите предметы из инвентаря:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {casesState.inventory.map((skin) => {
                  const isSelected = contractSelectedIds.includes(skin.id);
                  const rCfg = RARITY_CONFIG[skin.rarity] || RARITY_CONFIG.Common;
                  return (
                    <div
                      key={skin.id}
                      onClick={() => handleToggleContractItem(skin.id)}
                      className={`p-3 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/30 border-amber-400 text-white shadow-md'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <span className="text-2xl">{skin.iconEmoji}</span>
                      <p className="text-[11px] font-bold text-white truncate w-full mt-1">{skin.name}</p>
                      <span className={`text-[9px] font-black ${rCfg.text}`}>{skin.rarity}</span>
                      <span className="text-[10px] text-amber-300 font-mono mt-1">
                        {skin.marketValue.toLocaleString()} CC
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: SKIN MARKETPLACE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          {/* Market Stats & Listing Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Market Listings */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Активные лоты на Маркете ({casesState.marketListings.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-1">
                {casesState.marketListings.map((listing) => {
                  const rCfg = RARITY_CONFIG[listing.skin.rarity] || RARITY_CONFIG.Common;
                  return (
                    <div
                      key={listing.id}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3 shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded ${rCfg.badgeBg}`}>
                          {listing.skin.rarity}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {listing.sellerName}
                        </span>
                      </div>

                      <div className="text-4xl text-center my-1">{listing.skin.iconEmoji}</div>

                      <div>
                        <h4 className="text-xs font-bold text-white truncate">{listing.skin.name}</h4>
                        <p className="text-[10px] text-slate-400">{listing.skin.condition}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-sm font-black text-amber-300 font-mono">
                          {listing.priceCC.toLocaleString()} CC
                        </span>

                        {listing.isPlayer ? (
                          <button
                            onClick={() => casesManager.cancelMarketListing(listing.id)}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all"
                          >
                            Снять
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const res = casesManager.buyMarketListing(listing.id);
                              if (!res.success) {
                                showError('Ошибка покупки', res.error || 'Не удалось купить скин');
                              } else {
                                showSuccess('Покупка завершена', 'Скин добавлен в ваш инвентарь');
                                setTick((t) => t + 1);
                              }
                            }}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all flex items-center gap-1"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            Купить
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sell Form */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Выставить скин на продажу
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Выберите предмет:</label>
                  <select
                    value={marketSellSkinId}
                    onChange={(e) => {
                      setMarketSellSkinId(e.target.value);
                      const skin = casesState.inventory.find((s) => s.id === e.target.value);
                      if (skin) setMarketSellPrice(skin.marketValue);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="">-- Выберите из инвентаря --</option>
                    {casesState.inventory
                      .filter((s) => !s.isLocked)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.marketValue.toLocaleString()} CC)
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Цена продажи (CC):</label>
                  <input
                    type="number"
                    value={marketSellPrice}
                    onChange={(e) => setMarketSellPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono"
                  />
                </div>

                <button
                  onClick={handleListOnMarket}
                  disabled={!marketSellSkinId || marketSellPrice <= 0}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all disabled:opacity-40"
                >
                  Опубликовать лот на Маркет
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: LIVE AUCTIONS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'auctions' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Gavel className="w-5 h-5 text-amber-400" />
              Живые Аукционы Редких Скинов
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              AI-коллекционеры, киты и трейдеры делают ставки в реальном времени. Перебивайте ставки и забирайте эксклюзивные лоты!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {casesState.activeAuctions.map((auc) => {
              const rCfg = RARITY_CONFIG[auc.skin.rarity] || RARITY_CONFIG.Common;
              const timeLeftSeconds = Math.max(0, Math.floor((auc.endsAt - Date.now()) / 1000));
              const currentBidInput = auctionBidInputs[auc.id] || auc.minNextBidCC;

              return (
                <div
                  key={auc.id}
                  className={`rounded-2xl bg-gradient-to-b ${rCfg.gradient} border ${rCfg.border} p-5 flex flex-col justify-between space-y-4 shadow-xl`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded ${rCfg.badgeBg}`}>
                      {auc.skin.rarity}
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-400 bg-slate-950/80 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-rose-500/30">
                      <Clock className="w-3 h-3 animate-spin" />
                      {Math.floor(timeLeftSeconds / 60)}м {timeLeftSeconds % 60}с
                    </span>
                  </div>

                  <div className="text-6xl text-center drop-shadow-lg my-2">{auc.skin.iconEmoji}</div>

                  <div>
                    <h3 className="text-base font-black text-white">{auc.skin.name}</h3>
                    <p className="text-xs text-slate-300">{auc.skin.condition}</p>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Лидер ставки:</span>
                      <strong className={auc.highestBidderIsPlayer ? 'text-emerald-400' : 'text-slate-200'}>
                        {auc.highestBidderName}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Текущая ставка:</span>
                      <strong className="text-amber-300 font-mono text-sm">
                        {auc.currentBidCC.toLocaleString()} CC
                      </strong>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Всего ставок:</span>
                      <span className="text-slate-400 font-mono">{auc.bidCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="number"
                      value={currentBidInput}
                      onChange={(e) =>
                        setAuctionBidInputs({
                          ...auctionBidInputs,
                          [auc.id]: Number(e.target.value),
                        })
                      }
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono"
                    />
                    <button
                      onClick={() => {
                        const res = casesManager.placeAuctionBid(auc.id, currentBidInput);
                        if (!res.success) {
                          showError('Ошибка аукциона', res.error || 'Не удалось сделать ставку');
                        } else {
                          showSuccess('Ставка принята', `Вы предложили ${currentBidInput.toLocaleString()} CC`);
                          setTick((t) => t + 1);
                        }
                      }}
                      className="flex-1 py-2 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all flex items-center justify-center gap-1"
                    >
                      <Gavel className="w-3.5 h-3.5" />
                      Поставить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 7: CRAFTING & FACTORIES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'crafting' && (
        <div className="space-y-8">
          {/* Section 1: Factory Crafting Recipes */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Hammer className="w-5 h-5 text-amber-400" />
                Синтез и Ковка из Заводских Ресурсов
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Используйте ресурсы, произведенные на заводах холдинга (Металл, Электроника, Пластик), для создания эксклюзивных скинов!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {CRAFTING_RECIPES.map((recipe) => (
                <div
                  key={recipe.id}
                  className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <h3 className="text-sm font-black text-white">{recipe.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{recipe.description}</p>
                  </div>

                  {/* Required Materials */}
                  <div className="space-y-1.5 bg-slate-900 p-3 rounded-xl border border-slate-800/80 text-xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Требуемые материалы:
                    </span>
                    {recipe.requiredMaterials.map((mat, mIdx) => (
                      <div key={mIdx} className="flex justify-between text-slate-300 text-[11px]">
                        <span>{mat.resourceName}:</span>
                        <strong className="text-indigo-300">
                          {mat.quantity} {mat.unit}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-xs font-black text-amber-300 font-mono">
                      {recipe.costCC.toLocaleString()} CC
                    </span>

                    <button
                      onClick={() => {
                        const res = casesManager.craftSkin(recipe.id);
                        if (res.success && res.item) {
                          showSuccess('Крафт завершен', `Успешно синтезирован скин: ${res.item.name}!`);
                          setTick((t) => t + 1);
                        } else {
                          showError('Ошибка крафта', res.error || 'Ошибка синтеза скина');
                        }
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-400 hover:to-yellow-400 transition-all flex items-center gap-1.5"
                    >
                      <Hammer className="w-3.5 h-3.5" />
                      Скрафтить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Case Factory & Brand Studio */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                Собственная Студия & Фабрика Кейсов
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Создайте собственный бренд (NeonWorks, CyberForge), создавайте авторские кейсы и получайте ежедневные роялти!
              </p>
            </div>

            {!casesState.playerStudio.isCreated ? (
              <div className="max-w-md space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h3 className="text-sm font-bold text-white">Регистрация Бренда</h3>
                <input
                  type="text"
                  placeholder="Название бренда (например: Obsidian Works)"
                  value={studioBrandName}
                  onChange={(e) => setStudioBrandName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Слоган"
                  value={studioTagline}
                  onChange={(e) => setStudioTagline(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  onClick={() => {
                    casesManager.createPlayerStudio(studioBrandName, studioTagline, studioEmoji);
                    setTick((t) => t + 1);
                  }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-500 text-white hover:bg-indigo-400 transition-all"
                >
                  Создать Студию Брендов
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <div className="text-center">
                  <span className="text-[11px] text-slate-400 block">Бренд</span>
                  <span className="text-base font-black text-white">{casesState.playerStudio.brandName}</span>
                </div>
                <div className="text-center">
                  <span className="text-[11px] text-slate-400 block">Репутация</span>
                  <span className="text-base font-black text-indigo-400 font-mono">
                    {casesState.playerStudio.reputation}%
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[11px] text-slate-400 block">Фолловеры</span>
                  <span className="text-base font-black text-amber-300 font-mono">
                    {casesState.playerStudio.followersCount.toLocaleString()}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[11px] text-slate-400 block">Ежедневное роялти</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    +{casesState.playerStudio.dailyRoyaltyIncomeCC.toLocaleString()} CC/день
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 8: COLLECTIONS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'collections' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SKIN_COLLECTIONS.map((col) => {
              const ownedCount = casesState.inventory.filter((it) => it.collectionId === col.id).length;
              const isCompleted = casesState.completedCollections.includes(col.id);
              const percent = Math.min(100, Math.round((ownedCount / col.itemTemplateIds.length) * 100));

              return (
                <div
                  key={col.id}
                  className={`rounded-2xl bg-gradient-to-b ${col.bannerGradient} border border-slate-800 p-6 flex flex-col justify-between space-y-4 shadow-xl`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{col.iconEmoji}</span>
                      <div>
                        <h3 className="text-base font-black text-white">{col.name}</h3>
                        <p className="text-xs text-slate-300">{col.theme}</p>
                      </div>
                    </div>

                    {isCompleted && (
                      <span className="px-2.5 py-1 text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Собрана!
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{col.description}</p>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Собрано предметов:</span>
                      <strong className="font-mono text-amber-300">
                        {ownedCount} / {col.itemTemplateIds.length} ({percent}%)
                      </strong>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                      <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${percent}%` }} />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Награда за коллекцию</span>
                      <span className="text-sm font-black text-amber-300 font-mono">
                        +{col.completionRewardCC.toLocaleString()} CC + Трофей
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const res = casesManager.claimCollectionReward(col.id);
                        if (res.success) {
                          showSuccess('Коллекция завершена', `Поздравляем! Награда за коллекцию «${col.name}» получена!`);
                          setTick((t) => t + 1);
                        } else {
                          showError('Ошибка награды', res.error || 'Не удалось забрать награду');
                        }
                      }}
                      disabled={isCompleted || ownedCount < col.itemTemplateIds.length}
                      className="px-4 py-2 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Забрать награду
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 9: ACHIEVEMENTS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {casesState.achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                  ach.unlocked
                    ? 'bg-slate-900 border-amber-500/50 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                      ach.unlocked
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-900 text-slate-600 border-slate-800'
                    }`}
                  >
                    {ach.iconEmoji}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${ach.unlocked ? 'text-white' : 'text-slate-400'}`}>
                      {ach.title}
                    </h4>
                    <p className="text-xs text-slate-400">{ach.description}</p>
                    <div className="text-[10px] text-amber-400 font-mono mt-1">
                      Награда: +{ach.rewardCC.toLocaleString()} CC
                    </div>
                  </div>
                </div>

                <div>
                  {ach.unlocked ? (
                    <span className="px-2.5 py-1 text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg">
                      Выполнено
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-slate-500">
                      {ach.progress} / {ach.maxProgress}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODALS */}
      {/* ------------------------------------------------------------- */}
      {inspectSkin && (
        <SkinInspectModal
          skin={inspectSkin}
          onClose={() => setInspectSkin(null)}
          onQuickSell={(s) => {
            casesManager.quickSellSkin(s.id);
            setTick((t) => t + 1);
          }}
          onNavigateToUpgrade={(s) => {
            setUpgradeSelectedInputIds([s.id]);
            setActiveTab('upgrade');
          }}
          onNavigateToMarket={(s) => {
            setMarketSellSkinId(s.id);
            setMarketSellPrice(s.marketValue);
            setActiveTab('market');
          }}
        />
      )}

      {openingCase && (
        <CaseOpeningModal
          caseDef={openingCase}
          onClose={() => {
            setOpeningCase(null);
            setTick((t) => t + 1);
          }}
        />
      )}
    </div>
  );
};
