/**
 * Business Empire: Ultimate
 * Holding Conglomerate, Corporate Subsidiaries, M&A Valuation, IPO & Endgame Megacorp View
 */

import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Award,
  Crown,
  Plus,
  GitMerge,
  DollarSign,
  Briefcase,
  Layers,
  ArrowUpRight,
  Globe2,
  Share2,
  PieChart,
  Anchor,
  Flame,
  Scale,
  RefreshCw,
  Building,
  CheckCircle2,
  AlertTriangle,
  Users,
  Store,
  Car,
  Factory,
  Boxes,
  Truck,
  LineChart,
} from 'lucide-react';
import { GameState } from '../../types/game';
import { holdingManager } from '../../game/holding/holdingManager';
import { competitorMarketEngine } from '../../game/ai/competitorMarketEngine';
import { worldEconomyEngine } from '../../game/economy/worldEconomyEngine';
import {
  HoldingState,
  BusinessBranchType,
  SubsidiaryCompany,
  MegacorpTier,
  CompanyValuationBreakdown,
} from '../../types/holding';
import { AICompetitorCompany, LeaderboardRankingItem } from '../../types/aiCompetitors';

interface HoldingViewProps {
  state: GameState;
  showNotification: (msg: string) => void;
  currency?: string;
}

export const HoldingView: React.FC<HoldingViewProps> = ({
  state,
  showNotification,
  currency = '$',
}) => {
  const [holdingState, setHoldingState] = useState<HoldingState>(holdingManager.getHoldingState());
  const [activeTab, setActiveTab] = useState<'overview' | 'subsidiaries' | 'mna' | 'ipo' | 'endgame' | 'leaderboard'>('overview');

  // Establishment modal/form state
  const [holdingNameInput, setHoldingNameInput] = useState('Ultimate Imperial Holding');
  const [holdingMottoInput, setHoldingMottoInput] = useState('Global Multidisciplinary Excellence');
  const [holdingHqInput, setHoldingHqInput] = useState('Нью-Йорк / Токио');

  // Subsidiary creation form
  const [showCreateSubModal, setShowCreateSubModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubSector, setNewSubSector] = useState('Розничный ритейл');
  const [newSubCapital, setNewSubCapital] = useState(5000000);
  const [selectedSubBranches, setSelectedSubBranches] = useState<BusinessBranchType[]>(['retail']);

  // Merger modal
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeSub1Id, setMergeSub1Id] = useState('');
  const [mergeSub2Id, setMergeSub2Id] = useState('');
  const [mergedEntityName, setMergedEntityName] = useState('');

  // IPO setup form
  const [ipoTickerInput, setIpoTickerInput] = useState('BEU');
  const [ipoFloatPercent, setIpoFloatPercent] = useState(25);
  const [ipoDividendYield, setIpoDividendYield] = useState(0.04);
  const [buybackSharesInput, setBuybackSharesInput] = useState(1000000);

  // M&A search & filters
  const [mnaSearch, setMnaSearch] = useState('');
  const [selectedCompValuation, setSelectedCompValuation] = useState<CompanyValuationBreakdown | null>(null);

  // Leaderboard sorting
  const [leaderboardSort, setLeaderboardSort] = useState<'netWorth' | 'marketShare' | 'dailyRevenue' | 'dailyProfit'>('netWorth');

  // Refresh holding state regularly
  useEffect(() => {
    const update = () => {
      setHoldingState({ ...holdingManager.getHoldingState() });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const branches = holdingManager.getBranchesSummary();
  const competitors = competitorMarketEngine.getCompanies();
  const leaderboardItems = competitorMarketEngine.getLeaderboard();

  // Sort leaderboard
  const sortedLeaderboard = [...leaderboardItems].sort((a, b) => {
    return Number(b[leaderboardSort]) - Number(a[leaderboardSort]);
  });

  const playerRankItem = sortedLeaderboard.find((i) => i.isPlayer);
  const playerRankIndex = playerRankItem ? sortedLeaderboard.indexOf(playerRankItem) + 1 : 1;

  const getBranchIcon = (type: BusinessBranchType) => {
    switch (type) {
      case 'retail': return <Store className="w-4 h-4 text-violet-400" />;
      case 'automotive': return <Car className="w-4 h-4 text-amber-400" />;
      case 'industrial': return <Factory className="w-4 h-4 text-orange-400" />;
      case 'warehouses': return <Boxes className="w-4 h-4 text-emerald-400" />;
      case 'logistics': return <Truck className="w-4 h-4 text-blue-400" />;
      case 'real_estate': return <Building className="w-4 h-4 text-teal-400" />;
      case 'investments': return <LineChart className="w-4 h-4 text-rose-400" />;
    }
  };

  const getMegacorpTierBadge = (tier: MegacorpTier) => {
    switch (tier) {
      case 1: return { label: 'Уровень I: Региональный гигант', color: 'from-blue-600 to-indigo-600' };
      case 2: return { label: 'Уровень II: Транснациональная корпорация', color: 'from-indigo-600 to-purple-600' };
      case 3: return { label: 'Уровень III: Глобальный конгломерат', color: 'from-purple-600 to-pink-600' };
      case 4: return { label: 'Уровень IV: Мегакорпорация', color: 'from-amber-600 to-orange-600' };
      case 5: return { label: 'Уровень V: Мировой гегемон ($1T+)', color: 'from-emerald-500 to-teal-500' };
    }
  };

  const tierBadge = getMegacorpTierBadge(holdingState.megacorpTier);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Conglomerate Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {holdingState.established ? holdingState.name : 'КОРПОРАТИВНЫЙ ХОЛДИНГ'}
                </h2>
                {holdingState.established ? (
                  <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full text-white bg-gradient-to-r ${tierBadge.color} shadow-sm`}>
                    {tierBadge.label}
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Не учрежден
                  </span>
                )}
                {holdingState.ipo.isPublic && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                    <TrendingUp className="w-3 h-3" /> ${holdingState.ipo.ticker} • {currency}{holdingState.ipo.currentSharePrice.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                {holdingState.established ? (
                  <>
                    <strong className="text-slate-300">«{holdingState.motto}»</strong> • Штаб-квартира: <span className="text-indigo-300">{holdingState.headquartersCity}</span> • День основания: #{holdingState.establishedDay}
                  </>
                ) : (
                  'Объединяйте розницу, автосалоны, заводы, склады, флот, недвижимость и инвестиции в единую мегакорпорацию с глобальными синергиями.'
                )}
              </p>
            </div>
          </div>

          {/* Quick Holding Action / Established CTA */}
          <div className="flex flex-wrap items-center gap-3">
            {!holdingState.established ? (
              <button
                onClick={() => {
                  const res = holdingManager.establishHolding(holdingNameInput, holdingMottoInput, holdingHqInput);
                  showNotification(res.message);
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-950/50 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Учредить Холдинг ($1,000,000)
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateSubModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Дочерняя компания
                </button>
                <button
                  onClick={() => setShowMergeModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <GitMerge className="w-3.5 h-3.5" /> Слияние M&A
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 4 Core Consolidated Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Консолидированная стоимость</span>
            <div className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">
              {currency}{holdingState.totalConsolidatedNetWorth.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">Все 7 отраслевых дивизионов + дочки</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Консолидированная выручка</span>
            <div className="text-base sm:text-lg font-black text-indigo-400 font-mono mt-0.5">
              +{currency}{holdingState.totalConsolidatedDailyRevenue.toLocaleString()}<span className="text-xs text-slate-500 font-normal">/день</span>
            </div>
            <span className="text-[10px] text-slate-500">Годовой оборот: {currency}{Math.round(holdingState.totalConsolidatedDailyRevenue * 365).toLocaleString()}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Консолидированная чистая прибыль</span>
            <div className="text-base sm:text-lg font-black text-amber-400 font-mono mt-0.5">
              +{currency}{holdingState.totalConsolidatedDailyProfit.toLocaleString()}<span className="text-xs text-slate-500 font-normal">/день</span>
            </div>
            <span className="text-[10px] text-slate-500">Поступает в капитал ежедневно</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Место в мировом рейтинге</span>
            <div className="text-base sm:text-lg font-black text-purple-400 font-mono mt-0.5 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400" /> #{playerRankIndex} в мире
            </div>
            <span className="text-[10px] text-slate-500">Среди 22 мировых AI-корпораций</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'overview', label: '🏛️ Холдинг & Дивизионы', desc: '7 ветвей бизнеса' },
          { id: 'subsidiaries', label: `🏢 Дочерние компании (${holdingState.subsidiaries.length})`, desc: 'M&A и управление' },
          { id: 'mna', label: '🤝 Покупка AI-компаний', desc: 'Оценка и поглощение' },
          { id: 'ipo', label: `🔔 IPO & Биржа ${holdingState.ipo.isPublic ? '($' + holdingState.ipo.ticker + ')' : ''}`, desc: 'Акции и капитализация' },
          { id: 'endgame', label: '🌐 Endgame & Мегакорпорация', desc: 'Торговля, инвестиции, монополии' },
          { id: 'leaderboard', label: '🏆 Forbes Рейтинг', desc: 'AI-корпорации' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex flex-col items-start ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50 border border-indigo-500/40'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] font-normal ${activeTab === tab.id ? 'text-indigo-200' : 'text-slate-500'}`}>
              {tab.desc}
            </span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & 7 BUSINESS BRANCHES CONSOLIDATION */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {!holdingState.established && (
            <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Холдинг еще не зарегистрирован
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Зарегистрируйте головной холдинг для активации перекрестных синергий (+15% выручки, -25% расходов), создания дочерних компаний, выхода на IPO и запуска международных торговых коридоров.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <input
                    type="text"
                    placeholder="Название холдинга"
                    value={holdingNameInput}
                    onChange={(e) => setHoldingNameInput(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Корпоративный девиз"
                    value={holdingMottoInput}
                    onChange={(e) => setHoldingMottoInput(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Город штаб-квартиры"
                    value={holdingHqInput}
                    onChange={(e) => setHoldingHqInput(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  const res = holdingManager.establishHolding(holdingNameInput, holdingMottoInput, holdingHqInput);
                  showNotification(res.message);
                }}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider whitespace-nowrap shadow-lg shadow-amber-950/60 transition-all self-end md:self-center"
              >
                Создать Холдинг ($1M)
              </button>
            </div>
          )}

          {/* 7 Business Branches Consolidated Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> 7 Отраслевых дивизионов холдинга
              </h3>
              <span className="text-xs text-slate-500">Автоматически объединяются в единый баланс</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {(Object.keys(branches) as BusinessBranchType[]).map((type) => {
                const b = branches[type];
                return (
                  <div
                    key={type}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                            {getBranchIcon(type)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{b.name}</div>
                            <span className="text-[10px] text-slate-400 font-mono">Объектов: {b.count}</span>
                          </div>
                        </div>
                        {b.synergyBoostPercent > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                            +{b.synergyBoostPercent}% синергия
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3">{b.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/60 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Оценка активов:</span>
                        <strong className="text-white font-mono">{currency}{b.totalValuation.toLocaleString()}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Выручка/день:</span>
                        <strong className="text-indigo-400 font-mono">+{currency}{b.dailyRevenue.toLocaleString()}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Чистая прибыль:</span>
                        <strong className="text-emerald-400 font-mono">+{currency}{b.dailyProfit.toLocaleString()}/д</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Holding Synergies Matrix */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Корпоративные синергии холдинга
                </h3>
                <p className="text-xs text-slate-400">
                  Автоматически активируются при одновременном владении взаимосвязанными отраслевыми дивизионами
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {holdingState.synergies.map((syn) => (
                <div
                  key={syn.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    syn.unlocked
                      ? 'bg-gradient-to-br from-emerald-950/30 to-slate-900 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">{syn.name}</span>
                      {syn.unlocked ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Активна
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 font-bold">
                          Заблокирована
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{syn.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Требуются:</span>
                    <span className="text-indigo-300 font-medium">{syn.requiredBranches.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SUBSIDIARIES (ДОЧЕРНИЕ КОМПАНИИ & M&A) */}
      {/* ========================================================================= */}
      {activeTab === 'subsidiaries' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Дочерние корпорации и филиалы</h3>
              <p className="text-xs text-slate-400">
                Создавайте дочерние компании, выделяйте направления, сливайте структуры для масштабирования и продавайте при необходимости.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateSubModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Учредить компанию
              </button>
              <button
                onClick={() => setShowMergeModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <GitMerge className="w-4 h-4" /> Объединить компании
              </button>
            </div>
          </div>

          {holdingState.subsidiaries.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-300">Нет учрежденных дочерних компаний</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Создайте первую дочернюю структуру или поглотите AI-конкурента на вкладке M&A.
              </p>
              <button
                onClick={() => setShowCreateSubModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Создать дочернюю компанию
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {holdingState.subsidiaries.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{sub.name}</h4>
                        <span className="text-xs text-indigo-400 font-medium">{sub.sector}</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                        {sub.ownershipPercent}% доля
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-3">
                      Основана на дне #{sub.foundedDay} • Штат: <strong className="text-slate-300">{sub.employees} сотр.</strong>
                    </p>

                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs mb-4">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Рыночная оценка:</span>
                        <strong className="text-white font-mono">{currency}{sub.valuation.toLocaleString()}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Выручка/день:</span>
                        <strong className="text-indigo-400 font-mono">+{currency}{sub.dailyRevenue.toLocaleString()}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Чистая прибыль:</span>
                        <strong className="text-emerald-400 font-mono">+{currency}{sub.dailyProfit.toLocaleString()}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Доля рынка в секторе:</span>
                        <strong className="text-purple-400 font-mono">{sub.marketShare}%</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        const res = holdingManager.sellSubsidiary(sub.id);
                        showNotification(res.message);
                      }}
                      className="flex-1 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all"
                    >
                      Продать компанию (+10% премия)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal: Create Subsidiary */}
          {showCreateSubModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Учреждение дочерней компании</h3>
                  <button onClick={() => setShowCreateSubModal(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Название дочерней корпорации</label>
                    <input
                      type="text"
                      placeholder="например: Imperial Retail Ltd"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Отраслевая специализация</label>
                    <select
                      value={newSubSector}
                      onChange={(e) => setNewSubSector(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Розничный ритейл">Розничный ритейл & Торговые сети</option>
                      <option value="Автоиндустрия & Салоны">Автоиндустрия & Салоны</option>
                      <option value="Высокие технологии & Производство">Высокие технологии & Производство</option>
                      <option value="Коммерческая недвижимость">Коммерческая недвижимость & REIT</option>
                      <option value="Логистика & Грузоперевозки">Логистика & Грузоперевозки</option>
                      <option value="Инвестиции & Венчурный капитал">Инвестиции & Венчурный капитал</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Уставной капитал: <strong className="text-emerald-400 font-mono">{currency}{newSubCapital.toLocaleString()}</strong>
                    </label>
                    <input
                      type="range"
                      min={500000}
                      max={50000000}
                      step={500000}
                      value={newSubCapital}
                      onChange={(e) => setNewSubCapital(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setShowCreateSubModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      const res = holdingManager.createSubsidiary(newSubName, newSubSector, newSubCapital, selectedSubBranches);
                      showNotification(res.message);
                      if (res.success) {
                        setShowCreateSubModal(false);
                        setNewSubName('');
                      }
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    Учредить
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Merge Subsidiaries */}
          {showMergeModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Слияние корпораций (M&A Merger)</h3>
                  <button onClick={() => setShowMergeModal(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <p className="text-xs text-slate-400">
                  Объединение двух дочерних структур дает синергетический прирост капитализации +20% и снижает операционные издержки на -15%.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Первая компания</label>
                    <select
                      value={mergeSub1Id}
                      onChange={(e) => setMergeSub1Id(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    >
                      <option value="">-- Выберите компанию --</option>
                      {holdingState.subsidiaries.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({currency}{s.valuation.toLocaleString()})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Вторая компания</label>
                    <select
                      value={mergeSub2Id}
                      onChange={(e) => setMergeSub2Id(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    >
                      <option value="">-- Выберите компанию --</option>
                      {holdingState.subsidiaries.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({currency}{s.valuation.toLocaleString()})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Название объединенного синдиката</label>
                    <input
                      type="text"
                      placeholder="например: United Imperial Syndicate"
                      value={mergedEntityName}
                      onChange={(e) => setMergedEntityName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setShowMergeModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      const res = holdingManager.mergeSubsidiaries(mergeSub1Id, mergeSub2Id, mergedEntityName);
                      showNotification(res.message);
                      if (res.success) {
                        setShowMergeModal(false);
                        setMergedEntityName('');
                      }
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                  >
                    Провести слияние
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: M&A MARKET & BUYING AI COMPANIES */}
      {/* ========================================================================= */}
      {activeTab === 'mna' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Рынок M&A: Покупка и поглощение AI-корпораций</h3>
              <p className="text-xs text-slate-400">
                Оценка компаний в реальном времени рассчитывается по формуле: <span className="text-indigo-300 font-mono">Net Worth + Выручка + Прибыль (P/E 12x) + Активы - Долги × Макроэкономика</span>.
              </p>
            </div>
            <input
              type="text"
              placeholder="Поиск корпорации..."
              value={mnaSearch}
              onChange={(e) => setMnaSearch(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 w-full sm:w-64"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitors
              .filter((c) => !c.isBankrupt && (c.name.toLowerCase().includes(mnaSearch.toLowerCase()) || c.sector.toLowerCase().includes(mnaSearch.toLowerCase())))
              .map((comp) => {
                const val = holdingManager.calculateAICompanyValuation(comp);
                return (
                  <div
                    key={comp.id}
                    className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <span>{comp.avatarIcon}</span> {comp.name}
                          </h4>
                          <span className="text-xs text-indigo-400 font-medium">{comp.sector}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                          {comp.creditRating}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mb-3">{comp.description}</p>

                      {/* Valuation Metrics Breakdown */}
                      <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs mb-4 font-mono">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Чистые активы (Net Worth):</span>
                          <strong className="text-white">{currency}{comp.netWorth.toLocaleString()}</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Годовая выручка:</span>
                          <strong className="text-indigo-400">{currency}{Math.round(val.annualRevenue).toLocaleString()}</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Годовая чистая прибыль:</span>
                          <strong className="text-emerald-400">{currency}{Math.round(val.annualProfit).toLocaleString()}</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Материальные активы:</span>
                          <strong className="text-amber-400">{currency}{Math.round(val.tangibleAssets).toLocaleString()}</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Долговая нагрузка:</span>
                          <strong className="text-rose-400">{currency}{comp.debt.toLocaleString()}</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800">
                          <span>Макро-мультипликатор:</span>
                          <strong className="text-purple-300">{val.marketConditionsMultiplier}x ({val.cyclePhase})</strong>
                        </div>
                        <div className="flex items-center justify-between text-white font-bold pt-1 border-t border-slate-800 text-sm">
                          <span>Итоговая оценка M&A:</span>
                          <strong className="text-emerald-400">{currency}{val.finalValuation.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Buyout Stake Action Buttons */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        <button
                          onClick={() => {
                            const res = holdingManager.acquireAICompany(comp.id, '10%');
                            showNotification(res.message);
                          }}
                          className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[11px]"
                        >
                          10% ({currency}{(val.minority10Price / 1000000).toFixed(1)}M)
                        </button>
                        <button
                          onClick={() => {
                            const res = holdingManager.acquireAICompany(comp.id, '25%');
                            showNotification(res.message);
                          }}
                          className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[11px]"
                        >
                          25% ({currency}{(val.minority25Price / 1000000).toFixed(1)}M)
                        </button>
                        <button
                          onClick={() => {
                            const res = holdingManager.acquireAICompany(comp.id, '51%');
                            showNotification(res.message);
                          }}
                          className="py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 font-medium text-[11px] border border-indigo-500/30"
                        >
                          51% ({currency}{(val.controlling51Price / 1000000).toFixed(1)}M)
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          const res = holdingManager.acquireAICompany(comp.id, '100%');
                          showNotification(res.message);
                        }}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <Crown className="w-3.5 h-3.5" /> Полное поглощение 100% ({currency}{(val.buyout100Price / 1000000).toFixed(1)}M)
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: IPO & PUBLIC STOCK EXCHANGE */}
      {/* ========================================================================= */}
      {activeTab === 'ipo' && (
        <div className="space-y-6">
          {!holdingState.ipo.isPublic ? (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950/50 border border-slate-800 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Вывод корпорации на фондовую биржу (IPO)</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    Первичное публичное размещение акций позволяет привлечь десятки и сотни миллионов долларов живого капитала от институциональных инвесторов и фондов.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <label className="text-xs font-bold text-slate-300 block mb-1">Биржевой тикер (2-4 символа)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={ipoTickerInput}
                    onChange={(e) => setIpoTickerInput(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Размер публичного пакета (Float): <strong className="text-indigo-400">{ipoFloatPercent}%</strong>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={49}
                    value={ipoFloatPercent}
                    onChange={(e) => setIpoFloatPercent(Number(e.target.value))}
                    className="w-full accent-indigo-500 mt-2"
                  />
                  <span className="text-[10px] text-slate-500">Остаток 100-Float% сохраняется за вами</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Дивидендная доходность: <strong className="text-emerald-400">{(ipoDividendYield * 100).toFixed(1)}% годовых</strong>
                  </label>
                  <input
                    type="range"
                    min={0.01}
                    max={0.09}
                    step={0.005}
                    value={ipoDividendYield}
                    onChange={(e) => setIpoDividendYield(Number(e.target.value))}
                    className="w-full accent-emerald-500 mt-2"
                  />
                  <span className="text-[10px] text-slate-500">Выплачивается публичным акционерам</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-indigo-300 font-medium">Расчетная сумма привлекаемого капитала:</span>
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    ~{currency}{Math.round(holdingState.totalConsolidatedNetWorth * (ipoFloatPercent / 100) * 1.2).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const res = holdingManager.launchIPO(ipoTickerInput, ipoFloatPercent, ipoDividendYield);
                    showNotification(res.message);
                  }}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/50 transition-all"
                >
                  🚀 Провести звонок IPO
                </button>
              </div>
            </div>
          ) : (
            /* Live Public Corporation Dashboard */
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-white font-mono">${holdingState.ipo.ticker}</h3>
                      <span className="text-xs text-slate-400">{holdingState.ipo.companyName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                        Listed on Global Exchange
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        {currency}{holdingState.ipo.currentSharePrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        P/E: <strong className="text-white">{holdingState.ipo.peRatio}</strong> • Дивиденды: <strong className="text-emerald-400">{(holdingState.ipo.dividendYield * 100).toFixed(1)}%</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px]">Капитализация (Market Cap)</span>
                      <strong className="text-white text-base">{currency}{holdingState.ipo.marketCap.toLocaleString()}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[10px]">Ваша доля владения</span>
                      <strong className="text-indigo-400 text-base">{(100 - holdingState.ipo.publicFloatPercent).toFixed(1)}%</strong>
                    </div>
                  </div>
                </div>

                {/* Stock Price Mini Sparkline / History Bar */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Динамика котировок акций $ {holdingState.ipo.ticker}</span>
                    <span className="font-mono text-emerald-400">IPO Price: {currency}{holdingState.ipo.ipoPrice}</span>
                  </div>
                  <div className="flex items-end gap-1 h-20 w-full pt-2">
                    {holdingState.ipo.priceHistory.map((p, idx) => {
                      const minP = Math.min(...holdingState.ipo.priceHistory);
                      const maxP = Math.max(...holdingState.ipo.priceHistory);
                      const heightPct = Math.max(15, Math.min(100, ((p - minP) / Math.max(1, maxP - minP)) * 100));
                      return (
                        <div
                          key={idx}
                          className="flex-1 bg-emerald-500/40 hover:bg-emerald-400 rounded-t transition-all relative group"
                          style={{ height: `${heightPct}%` }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-[10px] font-mono text-white rounded whitespace-nowrap pointer-events-none z-20">
                            {currency}{p.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Share Buyback & SPO Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-400" /> Share Buyback (Обратный выкуп)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Выкуп акций у публичного рынка увеличивает вашу долю и толкает котировки вверх.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={100000}
                        max={holdingState.ipo.publicShares}
                        step={100000}
                        value={buybackSharesInput}
                        onChange={(e) => setBuybackSharesInput(Number(e.target.value))}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                      />
                      <button
                        onClick={() => {
                          const res = holdingManager.executeShareBuyback(buybackSharesInput);
                          showNotification(res.message);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all whitespace-nowrap"
                      >
                        Выкупить
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                      <Share2 className="w-4 h-4 text-indigo-400" /> SPO (Дополнительное размещение)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Продайте дополнительно 5% акций на бирже для привлечения крупного транша на новые сделки.
                    </p>
                    <button
                      onClick={() => {
                        const res = holdingManager.executeSecondaryOffering(5);
                        showNotification(res.message);
                      }}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all"
                    >
                      Привлечь капитал через SPO (5% акций)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ENDGAME & MEGACORPORATION */}
      {/* ========================================================================= */}
      {activeTab === 'endgame' && (
        <div className="space-y-6">
          {/* Megacorp Status Tier */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/40 border border-indigo-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  СТАТУС МЕГАКОРПОРАЦИИ
                </span>
                <h3 className="text-xl font-black text-white">{tierBadge.label}</h3>
              </div>
              <Crown className="w-8 h-8 text-amber-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
              {[
                { t: 1, name: 'Региональный гигант', req: '$100M+' },
                { t: 2, name: 'Транснациональная', req: '$1B+' },
                { t: 3, name: 'Глобальный конгломерат', req: '$10B+' },
                { t: 4, name: 'Мегакорпорация', req: '$100B+' },
                { t: 5, name: 'Мировой гегемон', req: '$1T+' },
              ].map((item) => (
                <div
                  key={item.t}
                  className={`p-3 rounded-2xl border transition-all ${
                    holdingState.megacorpTier >= item.t
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="font-bold text-[11px]">{item.name}</div>
                  <div className="text-[10px] font-mono mt-0.5">{item.req}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sector Monopolies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-400" /> Монополизация отраслевых рынков
              </h3>
              <button
                onClick={() => {
                  const res = holdingManager.toggleAntiTrustLobbying();
                  showNotification(res.message);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  holdingState.antiTrustLobbyingActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {holdingState.antiTrustLobbyingActive ? '🏛️ Лоббирование ВКЛ' : '🏛️ Включить антимонопольное лоббирование'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {holdingState.sectorMonopolies.map((mono) => (
                <div
                  key={mono.sectorId}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{mono.sectorName}</h4>
                    <span className="text-xs font-black font-mono text-purple-400">{mono.playerMarketShare}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${Math.min(100, mono.playerMarketShare)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Статус: <strong className="text-white capitalize">{mono.monopolyTier}</strong></span>
                    {mono.monopolyBonusRevenuePercent > 0 && (
                      <span className="text-emerald-400 font-bold">+{mono.monopolyBonusRevenuePercent}% сверхприбыль</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Trade Routes */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Anchor className="w-4 h-4 text-blue-400" /> Международная торговля & Супертанкерные маршруты
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {holdingState.globalTradeRoutes.map((route) => (
                <div
                  key={route.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    route.active
                      ? 'bg-gradient-to-br from-blue-950/30 to-slate-900 border-blue-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{route.name}</span>
                      {route.active ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                          Активен
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          Tier {route.requiredMegacorpTier}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Груз: <strong className="text-slate-300">{route.commodityType}</strong> • Тоннаж: {route.fleetCapacityTons.toLocaleString()} т.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Прибыль</span>
                      <strong className="text-emerald-400 text-xs font-mono">+{currency}{route.dailyProfit.toLocaleString()}/день</strong>
                    </div>

                    {!route.active && (
                      <button
                        onClick={() => {
                          const res = holdingManager.activateGlobalTradeRoute(route.id);
                          showNotification(res.message);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
                      >
                        Запустить ({currency}{(route.investmentCost / 1000000).toFixed(0)}M)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Sovereign Investments */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-emerald-400" /> Глобальные суверенные инвестиции
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {holdingState.globalInvestments.map((inv) => (
                <div
                  key={inv.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    inv.purchased
                      ? 'bg-gradient-to-br from-emerald-950/30 to-slate-900 border-emerald-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{inv.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-mono">
                        {inv.riskRating}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">{inv.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Доходность ({inv.annualYieldPercent}% годовых)</span>
                      <strong className="text-emerald-400 text-xs font-mono">+{currency}{inv.dailyYield.toLocaleString()}/день</strong>
                    </div>

                    {!inv.purchased && (
                      <button
                        onClick={() => {
                          const res = holdingManager.purchaseGlobalInvestment(inv.id);
                          showNotification(res.message);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                      >
                        Инвестировать ({currency}{(inv.investmentCost / 1000000).toFixed(0)}M)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: GLOBAL FORBES LEADERBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" /> Мировой рейтинг магнатов & AI-корпораций
              </h3>
              <p className="text-xs text-slate-400">
                Соревнуйтесь с 22 автономными корпорациями за мировое первенство по капиталу, выручке и контролю рынков.
              </p>
            </div>

            {/* Sorting Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {[
                { id: 'netWorth', label: 'Состояние' },
                { id: 'marketShare', label: 'Доля рынка' },
                { id: 'dailyRevenue', label: 'Выручка' },
                { id: 'dailyProfit', label: 'Прибыль' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setLeaderboardSort(s.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    leaderboardSort === s.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Ранг</th>
                    <th className="py-3 px-4">Корпорация & CEO</th>
                    <th className="py-3 px-4">Сектор</th>
                    <th className="py-3 px-4 text-right">Состояние (Net Worth)</th>
                    <th className="py-3 px-4 text-right">Выручка/день</th>
                    <th className="py-3 px-4 text-right">Прибыль/день</th>
                    <th className="py-3 px-4 text-right">Доля рынка</th>
                    <th className="py-3 px-4 text-center">Рейтинг</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {sortedLeaderboard.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        item.isPlayer
                          ? 'bg-indigo-950/40 hover:bg-indigo-950/60 font-bold text-white'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {idx === 0 && <Crown className="w-4 h-4 text-amber-400" />}
                          {idx === 1 && <Award className="w-4 h-4 text-slate-300" />}
                          {idx === 2 && <Award className="w-4 h-4 text-amber-600" />}
                          <span className={idx < 3 ? 'text-amber-400 font-black' : 'text-slate-500'}>
                            #{idx + 1}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{item.avatarIcon}</span>
                          <div>
                            <div className="font-sans font-bold text-white flex items-center gap-1.5">
                              {item.name}
                              {item.isPlayer && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  ВЫ
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-sans">{item.ceoName}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-sans text-xs text-slate-400">
                        {item.sector}
                      </td>

                      <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                        {currency}{item.netWorth.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right text-indigo-300">
                        +{currency}{item.dailyRevenue.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right text-amber-400">
                        +{currency}{item.dailyProfit.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right text-purple-400 font-bold">
                        {item.marketShare}%
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                          {item.creditRating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
