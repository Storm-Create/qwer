/**
 * Business Empire: Ultimate
 * Casino Empire Master Lobby & Management View
 */

import React, { useState, useMemo } from 'react';
import { GameState } from '../../types/game';
import {
  CasinoGameCategory,
  CasinoGameDefinition,
  CasinoVenueSize,
  VipTier,
} from '../../types/casino';
import { gameRegistry } from '../../game/casino/casinoCatalog';
import { casinoManager } from '../../game/casino/casinoManager';

import { SlotGameModal } from './games/SlotGameModal';
import { BlackjackGameModal } from './games/BlackjackGameModal';
import { RouletteGameModal } from './games/RouletteGameModal';
import { CrashGameModal } from './games/CrashGameModal';
import { PokerGameModal } from './games/PokerGameModal';
import { GenericGameModal } from './games/GenericGameModal';

import {
  Sparkles,
  Search,
  Flame,
  Zap,
  Award,
  Trophy,
  Building2,
  DollarSign,
  ArrowRightLeft,
  Star,
  Users,
  Shield,
  Briefcase,
  Layers,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Gift,
  Crown,
} from 'lucide-react';

interface CasinoLobbyViewProps {
  gameState: GameState;
}

export const CasinoLobbyView: React.FC<CasinoLobbyViewProps> = ({ gameState }) => {
  const casino = casinoManager.getOrCreateState();

  // Navigation sub-tab inside Casino
  const [activeTab, setActiveTab] = useState<'lobby' | 'business' | 'vip_tournaments' | 'exchange'>('lobby');

  // Filter and Search states
  const [selectedCategory, setSelectedCategory] = useState<CasinoGameCategory | 'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 18;

  // Active game modal
  const [activeGame, setActiveGame] = useState<CasinoGameDefinition | null>(null);

  // Exchange inputs
  const [usdToCcAmount, setUsdToCcAmount] = useState<number>(10000);
  const [ccToUsdAmount, setCcToUsdAmount] = useState<number>(10000);
  const [exchangeFeedback, setExchangeFeedback] = useState<string | null>(null);

  // New venue modal / creation state
  const [newVenueName, setNewVenueName] = useState('Nexus Grand Casino');
  const [newVenueSize, setNewVenueSize] = useState<CasinoVenueSize>('medium');
  const [newVenueCity, setNewVenueCity] = useState('Las Vegas');
  const [venueFeedback, setVenueFeedback] = useState<string | null>(null);

  // ----------------------------------------------------
  // FILTERED GAMES CATALOG
  // ----------------------------------------------------
  const filteredGames = useMemo(() => {
    let list = gameRegistry.getAllGames();

    if (selectedCategory === 'favorites') {
      list = list.filter((g) => casino.favorites.includes(g.id));
    } else if (selectedCategory !== 'all') {
      list = list.filter((g) => g.category === selectedCategory);
    }

    if (selectedTheme !== 'all') {
      list = list.filter((g) => g.theme === selectedTheme);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((g) => g.name.toLowerCase().includes(q) || (g.tag && g.tag.toLowerCase().includes(q)));
    }

    return list;
  }, [selectedCategory, selectedTheme, searchQuery, casino.favorites]);

  const totalPages = Math.ceil(filteredGames.length / pageSize) || 1;
  const paginatedGames = filteredGames.slice((page - 1) * pageSize, page * pageSize);

  // ----------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------
  const handleExchangeCashToCC = () => {
    const res = casinoManager.exchangeCashToCC(usdToCcAmount);
    setExchangeFeedback(res.message);
    setTimeout(() => setExchangeFeedback(null), 4000);
  };

  const handleExchangeCCToCash = () => {
    const res = casinoManager.exchangeCCToCash(ccToUsdAmount);
    setExchangeFeedback(res.message);
    setTimeout(() => setExchangeFeedback(null), 4000);
  };

  const handleCreateVenue = () => {
    const res = casinoManager.openCasinoVenue(newVenueName, newVenueSize, newVenueCity);
    setVenueFeedback(res.message);
    setTimeout(() => setVenueFeedback(null), 4000);
  };

  const handleClaimMission = (missionId: string) => {
    const res = casinoManager.claimMissionReward(missionId);
    if (res.success) {
      setExchangeFeedback(res.message);
      setTimeout(() => setExchangeFeedback(null), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-100 pb-12">
      {/* Top Banner / Ticker Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-purple-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Title & Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-widest uppercase">
                🎰 CASINO EMPIRE
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono">
                Виртуальная Экономика
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Лас-Вегас Внутри Бизнес-Империи
            </h1>
            <p className="text-sm text-slate-300 max-w-xl mt-1">
              Управляйте сетью роскошных казино-резортов по всему миру, инвестируйте в слот-залы или играйте в 120+ захватывающих игр с виртуальными фишками.
            </p>
          </div>

          {/* Player Casino Status Card */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950/80 p-4 rounded-2xl border border-amber-500/40 shadow-xl backdrop-blur-md">
            {/* Balance */}
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Баланс Казино</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-black text-amber-300 font-mono">
                  {casino.casinoCoins.toLocaleString()} CC
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                ≈ ${casino.casinoCoins.toLocaleString()} USD
              </div>
            </div>

            <div className="h-px sm:h-12 w-full sm:w-px bg-slate-800 my-1 sm:my-0" />

            {/* VIP & Level */}
            <div className="flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/40 text-[10px] font-black uppercase">
                  VIP {casino.vipTier}
                </span>
                <span className="text-xs font-bold text-slate-300 font-mono">
                  Уровень {casino.level}
                </span>
              </div>
              <div className="w-32 bg-slate-800 rounded-full h-2 mt-2 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full"
                  style={{ width: `${Math.min(100, (casino.xp / (casino.level * 1000)) * 100)}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                XP: {casino.xp} / {casino.level * 1000}
              </span>
            </div>
          </div>
        </div>

        {/* Live Progressive Jackpots Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-blue-500/30 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">MINI JACKPOT</div>
              <div className="text-lg font-black text-white font-mono">{Math.round(casino.jackpotPool.mini).toLocaleString()} CC</div>
            </div>
            <span className="text-2xl">💎</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-purple-500/30 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">MAJOR JACKPOT</div>
              <div className="text-lg font-black text-white font-mono">{Math.round(casino.jackpotPool.major).toLocaleString()} CC</div>
            </div>
            <span className="text-2xl">🔥</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider">👑 MEGA JACKPOT</div>
              <div className="text-xl font-black text-amber-300 font-mono animate-pulse">{Math.round(casino.jackpotPool.mega).toLocaleString()} CC</div>
            </div>
            <span className="text-3xl animate-bounce">👑</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'lobby', label: '🎰 Игровой Зал', icon: Sparkles },
          { id: 'business', label: '🏢 Бизнес Казино', icon: Building2 },
          { id: 'vip_tournaments', label: '🏆 Турниры и VIP', icon: Trophy },
          { id: 'exchange', label: '🔄 Обмен CC / USD', icon: ArrowRightLeft },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* TAB 1: GAME LOBBY */}
      {/* ==================================================== */}
      {activeTab === 'lobby' && (
        <div className="flex flex-col gap-6">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: 'all', label: '🔥 Все Игры (120+)' },
              { id: 'favorites', label: '⭐ Избранное' },
              { id: 'slots', label: '🎰 Слоты' },
              { id: 'cards', label: '🃏 Карты / Blackjack' },
              { id: 'roulette', label: '🎡 Рулетка' },
              { id: 'crash', label: '🚀 Crash' },
              { id: 'poker', label: '♠️ Poker' },
              { id: 'dice', label: '🎲 Кости' },
              { id: 'wheel', label: '🎡 Колесо' },
              { id: 'boss', label: '👹 Боссы' },
              { id: 'racing', label: '🏎️ Гонки' },
              { id: 'gacha', label: '🎁 Gacha' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCategory(c.id as any);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedCategory === c.id
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search & Theme Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Поиск слота или игры по названию..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Theme Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Тематика:</span>
              <select
                value={selectedTheme}
                onChange={(e) => {
                  setSelectedTheme(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="all">Все темы</option>
                <option value="Anime">🌸 Anime & Waifu</option>
                <option value="Cyberpunk">⚡ Cyberpunk 2099</option>
                <option value="Fantasy">🐉 Dragon Fantasy</option>
                <option value="Classic Vegas">👑 Classic Vegas</option>
                <option value="Space">🚀 Space Galaxy</option>
                <option value="Horror">🎃 Dark Horror</option>
                <option value="Mythology">⚡ Greek Mythology</option>
              </select>
            </div>
          </div>

          {/* Games Bento Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {paginatedGames.map((game) => {
              const isFav = casino.favorites.includes(game.id);
              return (
                <div
                  key={game.id}
                  onClick={() => setActiveGame(game)}
                  className="group relative bg-slate-900 border border-slate-800/80 hover:border-amber-500/60 rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10"
                >
                  {/* Card Thumbnail / Header */}
                  <div className={`h-28 bg-gradient-to-br ${game.bannerGradient} flex flex-col items-center justify-center p-3 relative select-none`}>
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-200 filter drop-shadow">
                      {game.thumbnailEmoji}
                    </span>

                    {/* Tag */}
                    {game.tag && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-tighter">
                        {game.tag}
                      </span>
                    )}

                    {/* Favorite Star */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        casinoManager.toggleFavorite(game.id);
                      }}
                      className={`absolute top-2 right-2 p-1 rounded-md bg-slate-950/40 transition-colors ${
                        isFav ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-3 flex flex-col justify-between flex-1 bg-slate-900/90">
                    <div>
                      <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate">
                        {game.name}
                      </h4>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{game.theme}</div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">RTP {game.rtp}%</span>
                      <span className="text-amber-300 font-bold">{game.minBet}-{game.maxBet} CC</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold ${
                    page === p
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: CASINO BUSINESS MANAGEMENT */}
      {/* ==================================================== */}
      {activeTab === 'business' && (
        <div className="flex flex-col gap-6">
          {/* Business Overview Header */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 font-bold uppercase">Владеем заведений</div>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {casino.ownedCasinos.length} казино
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 font-bold uppercase">Оценка активов казино</div>
              <div className="text-2xl font-black text-amber-300 font-mono mt-1">
                ${casino.businessStatistics.totalCasinoValuation.toLocaleString()}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 font-bold uppercase">Накопленная прибыль</div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                +${casino.businessStatistics.cumulativeBusinessProfit.toLocaleString()}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs text-slate-400 font-bold uppercase">Доля мирового рынка</div>
              <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
                {casino.businessStatistics.playerMarketShare}%
              </div>
            </div>
          </div>

          {/* Feedback */}
          {venueFeedback && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold font-mono">
              {venueFeedback}
            </div>
          )}

          {/* Owned Casinos List */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Ваши Казино-Резорты</h3>
              <button
                onClick={() => {
                  const form = document.getElementById('open_venue_form');
                  if (form) form.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase"
              >
                + Открыть Новое Казино
              </button>
            </div>

            {casino.ownedCasinos.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 text-center flex flex-col items-center justify-center gap-3">
                <span className="text-4xl">🏢</span>
                <div className="text-base font-bold text-white">У вас пока нет открытых казино</div>
                <p className="text-xs text-slate-400 max-w-md">
                  Инвестируйте в открытие первого казино в Лас-Вегасе или Макао, чтобы получать ежедневный пассивный доход от игровых залов и слот-машин.
                </p>
              </div>
            ) : (
              casino.ownedCasinos.map((venue) => (
                <div
                  key={venue.id}
                  className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col gap-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-black text-white">{venue.name}</h4>
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold text-[10px] uppercase">
                          {venue.venueSize.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        📍 {venue.cityLocation} • Репутация: {Math.round(venue.reputation)}/100 • Безопасность: {venue.securityRating}/100
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="text-right">
                        <div className="text-slate-400">Суточный GGR:</div>
                        <div className="font-bold text-white">${venue.stats.dailyGrossRevenue.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-400">Чистая прибыль:</div>
                        <div className="font-bold text-emerald-400">+${venue.stats.dailyNetProfit.toLocaleString()} / день</div>
                      </div>
                    </div>
                  </div>

                  {/* Halls & Infrastructure */}
                  <div>
                    <div className="text-xs font-bold uppercase text-slate-400 mb-3">Залы и Инфраструктура</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                      {venue.halls.map((hall) => (
                        <div
                          key={hall.id}
                          className={`p-3 rounded-xl border text-center ${
                            hall.unlocked
                              ? 'bg-slate-950/80 border-slate-700 text-slate-200'
                              : 'bg-slate-950/30 border-slate-800/40 text-slate-600 opacity-60'
                          }`}
                        >
                          <div className="text-xs font-bold truncate">{hall.name}</div>
                          <div className="text-[10px] text-amber-400 font-mono mt-1">
                            {hall.unlocked ? `Ур. ${hall.level} (Вмест: ${hall.capacity})` : 'Заблокировано'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Installed Machines */}
                  <div>
                    <div className="text-xs font-bold uppercase text-slate-400 mb-3">Установленное Оборудование ({venue.installedMachines.length})</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {venue.installedMachines.map((m) => (
                        <div key={m.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-white">{m.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">Перевес: {m.houseEdgePercent}% • Популярность: {m.popularityRating}%</div>
                          </div>
                          <div className="text-xs font-mono font-bold text-amber-300">
                            ${m.avgDailyTurnover.toLocaleString()}/д
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form: Open New Casino Venue */}
          <div id="open_venue_form" className="p-6 rounded-3xl bg-slate-900 border border-amber-500/30 flex flex-col gap-4">
            <h3 className="text-lg font-black text-white">Инвестировать в Новое Казино</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-bold">Название Казино</label>
                <input
                  type="text"
                  value={newVenueName}
                  onChange={(e) => setNewVenueName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-bold">Масштаб Заведения</label>
                <select
                  value={newVenueSize}
                  onChange={(e) => setNewVenueSize(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="small">Small Boutique ($100,000)</option>
                  <option value="medium">Medium Luxury ($1,000,000)</option>
                  <option value="large">Large Casino Resort ($10,000,000)</option>
                  <option value="mega_resort">Mega Vegas Complex ($100,000,000)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-bold">Город / Локация</label>
                <select
                  value={newVenueCity}
                  onChange={(e) => setNewVenueCity(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Las Vegas">🇺🇸 Лас-Вегас (США)</option>
                  <option value="Macau">🇲🇴 Макао (Китай)</option>
                  <option value="Monaco">🇲🇨 Монте-Карло (Монако)</option>
                  <option value="Singapore">🇸🇬 Сингапур</option>
                  <option value="Tokyo">🇯🇵 Токио (Япония)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <button
                onClick={handleCreateVenue}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg"
              >
                ОТКРЫТЬ КАЗИНО
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: VIP, TOURNAMENTS & MISSIONS */}
      {/* ==================================================== */}
      {activeTab === 'vip_tournaments' && (
        <div className="flex flex-col gap-6">
          {/* Daily Missions */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                Ежедневные Миссии
              </h3>
              <span className="text-xs text-slate-400 font-mono">Обновление каждые 24 часа</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {casino.dailyMissions.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{m.title}</h4>
                      <span className="text-xs font-mono font-bold text-amber-300">+{m.rewardCC} CC</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{m.description}</p>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-2">
                    {/* Progress Bar */}
                    <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-emerald-500 h-full transition-all"
                        style={{ width: `${Math.min(100, (m.currentCount / m.targetCount) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {m.currentCount} / {m.targetCount}
                    </span>

                    {m.claimed ? (
                      <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-500 text-xs font-bold">
                        Получено
                      </span>
                    ) : m.completed ? (
                      <button
                        onClick={() => handleClaimMission(m.id)}
                        className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black uppercase animate-pulse"
                      >
                        Забрать
                      </button>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-slate-900 text-slate-500 text-xs">
                        В процессе
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Tournament */}
          {casino.tournaments.map((tourn) => (
            <div key={tourn.id} className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-black text-white">{tourn.title}</h3>
                  </div>
                  <div className="text-xs text-purple-300 font-mono mt-0.5">
                    Призовой фонд: {tourn.prizePoolCC.toLocaleString()} CC • Ваш счет: {tourn.playerScore.toLocaleString()}
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-400 text-purple-300 text-xs font-mono font-bold">
                  Ваше место: #{tourn.playerRank}
                </div>
              </div>

              {/* Leaderboard Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono">
                    <tr>
                      <th className="p-2.5 rounded-l-xl">Место</th>
                      <th className="p-2.5">Игрок</th>
                      <th className="p-2.5">Очки</th>
                      <th className="p-2.5 rounded-r-xl">Приз (CC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {tourn.leaderboard.map((row) => (
                      <tr key={row.rank} className="hover:bg-slate-950/40">
                        <td className="p-2.5 font-bold text-amber-400">#{row.rank}</td>
                        <td className="p-2.5 font-bold text-white">{row.name}</td>
                        <td className="p-2.5 text-slate-300">{row.score.toLocaleString()}</td>
                        <td className="p-2.5 font-bold text-emerald-400">+{row.prizeCC.toLocaleString()} CC</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: CURRENCY EXCHANGE ($ <-> CC) */}
      {/* ==================================================== */}
      {activeTab === 'exchange' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feedback */}
          {exchangeFeedback && (
            <div className="col-span-full p-4 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-bold font-mono">
              {exchangeFeedback}
            </div>
          )}

          {/* Buy CC Form */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💵 ➔ 🪙</span>
                <h3 className="text-lg font-black text-white">Купить Casino Coins</h3>
              </div>
              <p className="text-xs text-slate-400">
                Конвертируйте доллары с баланса вашего бизнеса в Casino Coins. Комиссия банка: 5%.
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <label className="text-xs text-slate-400 font-bold">Сумма в USD ($):</label>
                <div className="flex items-center gap-2">
                  {[1000, 5000, 25000, 100000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setUsdToCcAmount(v)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                        usdToCcAmount === v ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400'
                      }`}
                    >
                      ${v >= 1000 ? `${v / 1000}k` : v}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={usdToCcAmount}
                  onChange={(e) => setUsdToCcAmount(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono mt-1"
                />
              </div>

              <div className="mt-3 text-xs text-slate-400 font-mono">
                Будет получено: <span className="font-bold text-amber-300 font-mono">{Math.round(usdToCcAmount * 0.95).toLocaleString()} CC</span>
              </div>
            </div>

            <button
              disabled={gameState.cash < usdToCcAmount}
              onClick={handleExchangeCashToCC}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg"
            >
              ОБМЕНЯТЬ ${usdToCcAmount.toLocaleString()} НА CC
            </button>
          </div>

          {/* Cashout CC Form */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🪙 ➔ 💵</span>
                <h3 className="text-lg font-black text-white">Вывести в Бизнес-Баланс</h3>
              </div>
              <p className="text-xs text-slate-400">
                Выводите выигранные Casino Coins обратно в капитал компании. Комиссия казино: 8%.
              </p>

              <div className="mt-4 flex flex-col gap-2">
                <label className="text-xs text-slate-400 font-bold">Сумма в CC:</label>
                <div className="flex items-center gap-2">
                  {[1000, 5000, 25000, 100000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setCcToUsdAmount(v)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                        ccToUsdAmount === v ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400'
                      }`}
                    >
                      {v >= 1000 ? `${v / 1000}k` : v} CC
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={ccToUsdAmount}
                  onChange={(e) => setCcToUsdAmount(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono mt-1"
                />
              </div>

              <div className="mt-3 text-xs text-slate-400 font-mono">
                Будет зачислено в капитал: <span className="font-bold text-emerald-400 font-mono">${Math.round(ccToUsdAmount * 0.92).toLocaleString()}</span>
              </div>
            </div>

            <button
              disabled={casino.casinoCoins < ccToUsdAmount}
              onClick={handleExchangeCCToCash}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg"
            >
              ВЫВЕСТИ {ccToUsdAmount.toLocaleString()} CC В ДОЛЛАРЫ
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* PLAYABLE GAME MODALS DISPATCHER */}
      {/* ==================================================== */}
      {activeGame && (
        <>
          {activeGame.category === 'slots' ? (
            <SlotGameModal
              game={activeGame}
              onClose={() => setActiveGame(null)}
              casinoCoins={casino.casinoCoins}
            />
          ) : activeGame.id.includes('blackjack') || (activeGame.category === 'cards' && activeGame.name.toLowerCase().includes('blackjack')) ? (
            <BlackjackGameModal
              game={activeGame}
              onClose={() => setActiveGame(null)}
              casinoCoins={casino.casinoCoins}
            />
          ) : activeGame.category === 'roulette' ? (
            <RouletteGameModal
              game={activeGame}
              onClose={() => setActiveGame(null)}
              casinoCoins={casino.casinoCoins}
            />
          ) : activeGame.category === 'crash' ? (
            <CrashGameModal
              game={activeGame}
              onClose={() => setActiveGame(null)}
              casinoCoins={casino.casinoCoins}
            />
          ) : activeGame.category === 'poker' ? (
            <PokerGameModal
              game={activeGame}
              onClose={() => setActiveGame(null)}
              casinoCoins={casino.casinoCoins}
            />
          ) : (
            <GenericGameModal
              game={activeGame}
              onClose={() => setActiveGame(null)}
              casinoCoins={casino.casinoCoins}
            />
          )}
        </>
      )}
    </div>
  );
};
