/**
 * Business Empire: Ultimate
 * Esports Empire — Main Subsystem View
 * Complete management of 27 real disciplines, rosters, transfers,
 * tournaments, arenas, gaming houses, staff, sponsors, merch & holding synergies.
 */

import React, { useState } from 'react';
import {
  Gamepad2,
  Trophy,
  Users,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Tv,
  Award,
  Swords,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Flame,
  Star,
  Settings2,
  Building,
  Plus,
  Play,
  Briefcase,
  Zap,
  Globe,
  Monitor,
  Smartphone,
} from 'lucide-react';
import {
  DisciplineId,
  EsportsPlatform,
  EsportsRegion,
  EsportsRoster,
  EsportsStaff,
  ProPlayer,
  StaffRole,
  TournamentMatch,
} from '../../types/esports';
import { GameState } from '../../types/game';
import { esportsManager } from '../../game/esports/esportsManager';
import { ALL_DISCIPLINE_IDS, ESPORTS_DISCIPLINES } from '../../game/esports/esportsDisciplines';
import { STAFF_ROLES_INFO } from '../../game/esports/esportsStaffData';
import { EsportsMatchLiveModal } from './EsportsMatchLiveModal';
import { EsportsOrgCustomizerModal } from './EsportsOrgCustomizerModal';

interface EsportsEmpireViewProps {
  state: GameState;
  showNotification?: (msg: string) => void;
}

type EsportsSubTab = 
  | 'rosters' 
  | 'disciplines' 
  | 'transfers' 
  | 'tournaments' 
  | 'facilities' 
  | 'staff' 
  | 'sponsors' 
  | 'media' 
  | 'rankings';

export const EsportsEmpireView: React.FC<EsportsEmpireViewProps> = ({ state, showNotification }) => {
  const [activeTab, setActiveTab] = useState<EsportsSubTab>('rosters');
  const [selectedDiscipline, setSelectedDiscipline] = useState<DisciplineId>('cs2');
  const [platformFilter, setPlatformFilter] = useState<EsportsPlatform | 'All'>('All');
  const [transferSearch, setTransferSearch] = useState('');
  const [transferGameFilter, setTransferGameFilter] = useState<DisciplineId | 'All'>('All');
  const [transferMinRating, setTransferMinRating] = useState(60);

  const [activeLiveMatch, setActiveLiveMatch] = useState<TournamentMatch | null>(null);
  const [showOrgCustomizer, setShowOrgCustomizer] = useState(false);
  const [localFeedback, setLocalFeedback] = useState<string | null>(null);

  const esports = esportsManager.getOrCreateState();
  const org = esports.organization;
  const currency = state.settings.currency || '$';

  const notify = (msg: string) => {
    if (showNotification) {
      showNotification(msg);
    } else {
      setLocalFeedback(msg);
      setTimeout(() => setLocalFeedback(null), 3000);
    }
  };

  const currentRoster = esports.rosters[selectedDiscipline];
  const currentDisciplineInfo = ESPORTS_DISCIPLINES[selectedDiscipline];
  const ownedPlayersInCurrentDiscipline = esports.players.filter(
    (p) => p.gameId === selectedDiscipline && p.teamId === 'player_org'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Feedback */}
      {localFeedback && (
        <div className="fixed top-20 right-6 z-50 bg-cyan-950 border border-cyan-500 text-cyan-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold">{localFeedback}</span>
        </div>
      )}

      {/* Organization Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
          <Gamepad2 className="w-80 h-80 text-cyan-400" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-xl border border-white/20 flex-shrink-0"
              style={{ backgroundColor: `${org.primaryColor}30`, borderColor: org.primaryColor }}
            >
              {org.logoEmoji}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  [{org.tag}] Уровень {org.level}
                </span>
                <span className="text-xs text-slate-400">Основана в {org.foundedYear} г.</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight mt-0.5">
                {org.name}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Глобальная киберспортивная организация • 27 соревновательных дисциплин
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400 uppercase">
                <Users className="w-3.5 h-3.5 text-cyan-400" /> Фанаты
              </div>
              <div className="text-lg font-black text-white mt-0.5">
                {org.fansCount.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400 uppercase">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> Трофеи
              </div>
              <div className="text-lg font-black text-amber-400 mt-0.5">
                {org.totalTrophiesCount} шт.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400 uppercase">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Призовые
              </div>
              <div className="text-lg font-black text-emerald-400 mt-0.5">
                {currency}{org.totalPrizeMoneyEarned.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400 uppercase">
                <Globe className="w-3.5 h-3.5 text-blue-400" /> Мировой ранг
              </div>
              <div className="text-lg font-black text-blue-400 mt-0.5">
                #{org.worldRankOverall}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowOrgCustomizer(true)}
            className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700"
          >
            <Settings2 className="w-4 h-4 text-cyan-400" />
            Брендинг
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-800">
        {[
          { id: 'rosters', label: 'Составы (Rosters)', icon: Swords },
          { id: 'disciplines', label: '27 Дисциплин', icon: Gamepad2 },
          { id: 'transfers', label: 'Трансферный рынок', icon: Briefcase },
          { id: 'tournaments', label: 'Турниры & Матчи', icon: Trophy },
          { id: 'facilities', label: 'Gaming House & Арена', icon: Building },
          { id: 'staff', label: 'Персонал & Тренировки', icon: Users },
          { id: 'sponsors', label: 'Спонсоры & Мерч', icon: ShoppingBag },
          { id: 'media', label: 'Медиа & Стриминг', icon: Tv },
          { id: 'rankings', label: 'Мировой рейтинг', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as EsportsSubTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: ROSTERS (СОСТАВЫ)
         ========================================================================= */}
      {activeTab === 'rosters' && (
        <div className="space-y-6">
          {/* Discipline Selector Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {ALL_DISCIPLINE_IDS.map((dId) => {
              const dInfo = ESPORTS_DISCIPLINES[dId];
              const isSelected = selectedDiscipline === dId;
              const r = esports.rosters[dId];
              const isFull = r.activePlayerIds.length >= dInfo.rosterSize;
              return (
                <button
                  key={dId}
                  onClick={() => setSelectedDiscipline(dId)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white border-cyan-400 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{dInfo.iconEmoji}</span>
                  <span>{dInfo.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-black ${isFull ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                    {r.activePlayerIds.length}/{dInfo.rosterSize}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Discipline Overview Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Discipline Stats & Chemistry */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{currentDisciplineInfo.iconEmoji}</span>
                  <div>
                    <h3 className="font-black text-white text-base">{currentRoster.teamName}</h3>
                    <span className="text-xs text-slate-400">{currentDisciplineInfo.platform} • {currentDisciplineInfo.genre} • {currentDisciplineInfo.teamFormat}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
                  #{currentRoster.worldRank} в мире
                </span>
              </div>

              {/* Roster Chemistry, Form & Morale */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Рейтинг команды (Team Rating)</span>
                    <span className="text-cyan-400 font-bold">{currentRoster.teamRating}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${currentRoster.teamRating}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Сыгранность (Chemistry)</span>
                    <span className="text-emerald-400 font-bold">{currentRoster.chemistry}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${currentRoster.chemistry}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Мораль (Morale)</span>
                    <span className="text-amber-400 font-bold">{currentRoster.morale}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${currentRoster.morale}%` }} />
                  </div>
                </div>
              </div>

              {/* Training Focus Selector */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Фокус тренировок</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['balanced', 'mechanics', 'tactics', 'teamwork', 'mental', 'rest'] as const).map((focus) => (
                    <button
                      key={focus}
                      onClick={() => {
                        esportsManager.setTrainingFocus(selectedDiscipline, focus);
                        notify(`Фокус тренировок изменен на: ${focus.toUpperCase()}`);
                      }}
                      className={`p-2 rounded-xl text-[11px] font-bold capitalize transition border ${
                        currentRoster.trainingFocus === focus
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {focus === 'balanced' ? 'Баланс' : focus === 'mechanics' ? 'Механика' : focus === 'tactics' ? 'Тактика' : focus === 'teamwork' ? 'Тимплей' : focus === 'mental' ? 'Психология' : 'Отдых'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Record & Trophies */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Матчи: </span>
                  <b className="text-emerald-400">{currentRoster.winLoss.wins}W</b> - <b className="text-rose-400">{currentRoster.winLoss.losses}L</b>
                </div>
                <div>
                  <span className="text-slate-400">Трофеи: </span>
                  <b className="text-amber-400">{currentRoster.trophies} 🏆</b>
                </div>
              </div>
            </div>

            {/* Right: Active Starting Lineup & Bench */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Основной состав ({currentRoster.activePlayerIds.length}/{currentDisciplineInfo.rosterSize})</h4>
                  <span className="text-xs text-slate-400">Игроки, выступающие в официальных турнирных матчах</span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('transfers');
                    setTransferGameFilter(selectedDiscipline);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Найти игрока на рынке
                </button>
              </div>

              {/* Active Player Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentRoster.activePlayerIds.map((pId) => {
                  const player = esports.players.find((p) => p.id === pId);
                  if (!player) return null;
                  return (
                    <div key={pId} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center font-black text-cyan-300 text-sm">
                          {player.rating}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-base font-black text-white">{player.nickname}</span>
                            <span className="text-xs">{player.nationalityEmoji}</span>
                          </div>
                          <p className="text-xs text-slate-400">{player.realName} • {player.role}</p>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Зарплата: <b className="text-slate-300">{currency}{player.salary.toLocaleString()}/мес</b>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          esportsManager.benchPlayer(selectedDiscipline, player.id);
                          notify(`${player.nickname} переведен в запас`);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                      >
                        В запас
                      </button>
                    </div>
                  );
                })}

                {/* Empty Slots */}
                {Array.from({ length: Math.max(0, currentDisciplineInfo.rosterSize - currentRoster.activePlayerIds.length) }).map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveTab('transfers');
                      setTransferGameFilter(selectedDiscipline);
                    }}
                    className="p-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 flex items-center justify-center text-slate-500 hover:border-cyan-500/50 hover:text-cyan-400 cursor-pointer transition py-8"
                  >
                    <div className="text-center">
                      <Plus className="w-5 h-5 mx-auto mb-1 opacity-60" />
                      <span className="text-xs font-bold">Свободный слот стартового состава</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Substitute Players (Bench) */}
              {currentRoster.substitutePlayerIds.length > 0 && (
                <div className="pt-2">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Запасные игроки (Bench)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentRoster.substitutePlayerIds.map((pId) => {
                      const player = esports.players.find((p) => p.id === pId);
                      if (!player) return null;
                      return (
                        <div key={pId} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-300 text-sm">{player.nickname}</span>
                              <span className="text-xs text-cyan-400 font-black">[{player.rating}]</span>
                            </div>
                            <span className="text-xs text-slate-500">{player.role}</span>
                          </div>

                          <button
                            onClick={() => {
                              const res = esportsManager.setStarterPlayer(selectedDiscipline, player.id);
                              if (res) notify(`${player.nickname} переведен в основной состав!`);
                              else notify('В основном составе нет свободных мест!');
                            }}
                            className="px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold transition"
                          >
                            В старт
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: DISCIPLINES CATALOG (27 ИГР)
         ========================================================================= */}
      {activeTab === 'disciplines' && (
        <div className="space-y-4">
          {/* Platform Filters */}
          <div className="flex items-center gap-2">
            {(['All', 'Mobile', 'PC', 'Cross-platform', 'Web'] as const).map((plat) => (
              <button
                key={plat}
                onClick={() => setPlatformFilter(plat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                  platformFilter === plat
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {plat === 'All' ? 'Все 27 игр' : plat}
              </button>
            ))}
          </div>

          {/* Grid of 27 Disciplines */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_DISCIPLINE_IDS.filter((dId) => {
              if (platformFilter === 'All') return true;
              return ESPORTS_DISCIPLINES[dId].platform === platformFilter;
            }).map((dId) => {
              const d = ESPORTS_DISCIPLINES[dId];
              const r = esports.rosters[dId];
              return (
                <div
                  key={dId}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{d.iconEmoji}</span>
                        <div>
                          <h4 className="font-black text-white text-base">{d.name}</h4>
                          <span className="text-xs text-slate-400">{d.platform} • {d.genre}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {d.teamFormat}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {d.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div>
                        <span className="text-slate-500">Зрители (Avg/Peak):</span>
                        <div className="font-bold text-slate-200">{(d.avgViewers / 1000).toFixed(0)}k / {(d.peakViewers / 1000000).toFixed(1)}M</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Призовые в год:</span>
                        <div className="font-bold text-emerald-400">{currency}{(d.prizePoolScale / 1000000).toFixed(1)}M</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Про-команд:</span>
                        <div className="font-bold text-slate-200">{d.proTeamsCount}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Сезон:</span>
                        <div className="font-bold text-amber-400 truncate">{d.currentSeason}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-slate-800/80 mt-4">
                    <span className="text-xs text-slate-400">
                      Состав: <b className="text-white">{r.activePlayerIds.length}/{d.rosterSize}</b>
                    </span>

                    <button
                      onClick={() => {
                        setSelectedDiscipline(dId);
                        setActiveTab('rosters');
                      }}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs transition shadow-sm"
                    >
                      Управлять составом
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: TRANSFER MARKET (ТРАНСФЕРНЫЙ РЫНОК)
         ========================================================================= */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          {/* Transfer Filters & Search Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={transferSearch}
                onChange={(e) => setTransferSearch(e.target.value)}
                placeholder="Поиск игрока по никнейму..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <select
                value={transferGameFilter}
                onChange={(e) => setTransferGameFilter(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-500 focus:outline-none"
              >
                <option value="All">Все дисциплины (27 игр)</option>
                {ALL_DISCIPLINE_IDS.map((dId) => (
                  <option key={dId} value={dId}>
                    {ESPORTS_DISCIPLINES[dId].name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 whitespace-nowrap">Мин. рейтинг:</span>
              <input
                type="range"
                min={60}
                max={95}
                value={transferMinRating}
                onChange={(e) => setTransferMinRating(Number(e.target.value))}
                className="flex-1 accent-cyan-400"
              />
              <span className="text-xs font-bold text-cyan-400">{transferMinRating}+</span>
            </div>
          </div>

          {/* Player Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {esports.players
              .filter((p) => {
                if (transferGameFilter !== 'All' && p.gameId !== transferGameFilter) return false;
                if (p.rating < transferMinRating) return false;
                if (transferSearch && !p.nickname.toLowerCase().includes(transferSearch.toLowerCase()) && !p.realName.toLowerCase().includes(transferSearch.toLowerCase())) return false;
                return true;
              })
              .map((player) => {
                const isOwned = player.teamId === 'player_org';
                const disc = ESPORTS_DISCIPLINES[player.gameId];
                return (
                  <div
                    key={player.id}
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition ${
                      isOwned ? 'bg-cyan-950/20 border-cyan-500/40' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center font-black text-cyan-300 text-sm">
                            {player.rating}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-black text-white text-base">{player.nickname}</h4>
                              <span>{player.nationalityEmoji}</span>
                            </div>
                            <span className="text-xs text-slate-400">{player.realName} • {player.age} лет</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-amber-400">Pot: {player.potential}</span>
                          <div className="text-[10px] text-slate-500">{disc.name}</div>
                        </div>
                      </div>

                      {/* Attributes Radar Bars */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                        <div>
                          <span className="text-slate-500">Aim / Скилл:</span>
                          <div className="font-bold text-slate-200">{player.attributes.aim}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Реакция:</span>
                          <div className="font-bold text-slate-200">{player.attributes.reaction}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Тимплей:</span>
                          <div className="font-bold text-slate-200">{player.attributes.teamwork}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Опыт:</span>
                          <div className="font-bold text-slate-200">{player.experience}%</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Зарплата: <b className="text-white">{currency}{player.salary.toLocaleString()}/мес</b></span>
                        <span className="text-slate-400">Трансфер: <b className="text-emerald-400">{currency}{player.marketValue.toLocaleString()}</b></span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                      {isOwned ? (
                        <div className="flex items-center gap-2 w-full">
                          <button
                            onClick={() => {
                              const res = esportsManager.renewContract(player.id, 12);
                              notify(res.message);
                            }}
                            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
                          >
                            Продлить (+12 мес)
                          </button>
                          <button
                            onClick={() => {
                              const res = esportsManager.sellPlayer(player.id);
                              notify(res.message);
                            }}
                            className="flex-1 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition"
                          >
                            Продать
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const res = esportsManager.buyPlayer(player.id);
                            notify(res.message);
                          }}
                          className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl text-xs transition shadow-md"
                        >
                          Купить игрока ({currency}{player.marketValue.toLocaleString()})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: TOURNAMENTS & MATCHES (ТУРНИРЫ)
         ========================================================================= */}
      {activeTab === 'tournaments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {esports.tournaments.map((t) => {
              const disc = ESPORTS_DISCIPLINES[t.disciplineId];
              const isOngoing = t.status === 'ongoing';
              const isFinished = t.status === 'finished';
              return (
                <div
                  key={t.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between ${
                    isOngoing ? 'bg-gradient-to-br from-cyan-950/40 to-slate-900 border-cyan-500/50 shadow-xl' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{disc.iconEmoji}</span>
                        <div>
                          <h4 className="font-black text-white text-base">{t.name}</h4>
                          <span className="text-xs text-slate-400">{t.tier.toUpperCase()} • Регион: {t.region}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                        isOngoing ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 animate-pulse' : isFinished ? 'bg-slate-800 text-slate-400' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {isOngoing ? 'В ПРОЦЕССЕ' : isFinished ? 'ЗАВЕРШЕН' : 'РЕГИСТРАЦИЯ'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Призовой фонд:</span>
                        <div className="text-base font-black text-emerald-400">{currency}{t.prizePool.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">1-е место (Трофей):</span>
                        <div className="text-sm font-bold text-amber-400">{currency}{t.prizes.firstPlace.toLocaleString()} 🏆</div>
                      </div>
                    </div>

                    {isFinished && t.winnerTeamName && (
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>Победитель: <b className="text-white">{t.winnerTeamName}</b></span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-end gap-2">
                    {!isOngoing && !isFinished && (
                      <button
                        onClick={() => {
                          const res = esportsManager.participateInTournament(t.id);
                          notify(res.message);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs transition"
                      >
                        Зарегистрировать команду
                      </button>
                    )}

                    {isOngoing && (
                      <div className="flex items-center gap-2 w-full">
                        <button
                          onClick={() => {
                            const match = esportsManager.playTournamentMatch(t.id);
                            if (match) setActiveLiveMatch(match);
                          }}
                          className="flex-1 py-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-black rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20"
                        >
                          <Play className="w-3.5 h-3.5" /> Смотреть матч LIVE
                        </button>
                        <button
                          onClick={() => {
                            const match = esportsManager.playTournamentMatch(t.id);
                            if (match) notify(`Матч сыгран! Счет: ${match.scoreA} : ${match.scoreB}`);
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
                        >
                          Быстрая симуляция
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: FACILITIES & ARENA (GAMING HOUSE & СТАДИОН)
         ========================================================================= */}
      {activeTab === 'facilities' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Gaming House & Bootcamp */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="font-black text-white text-base">{esports.gamingHouse.name}</h3>
                  <span className="text-xs text-slate-400">Тренировочная база & Буткемп</span>
                </div>
              </div>
              <span className="text-xs text-slate-400">
                Содержание: <b className="text-rose-400">{currency}{esports.gamingHouse.monthlyUpkeep.toLocaleString()}/мес</b>
              </span>
            </div>

            {/* Sub-Upgrades */}
            <div className="space-y-3 pt-2">
              {[
                { key: 'gamingPCsLevel', label: 'Топовые ПК и Мониторы 360Hz', desc: '+Скорость реакции и тренировок' },
                { key: 'internetLevel', label: 'Оптоволоконный интернет 10 Гбит/с', desc: 'Нулевой пинг и стабильный коннект' },
                { key: 'analysisRoomLevel', label: 'Аналитическая комната & War Room', desc: '+Тактическая подготовка команды' },
                { key: 'recoveryGymLevel', label: 'Зона восстановления & Сауна', desc: '+Быстрое снятие усталости (Fatigue)' },
                { key: 'streamingStudioLevel', label: 'Медиа & Стриминг-студия', desc: '+Доход от трансляций и фанаты' },
              ].map((item) => {
                const lvl = esports.gamingHouse[item.key as keyof typeof esports.gamingHouse] as number;
                return (
                  <div key={item.key} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{item.label}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-bold">Lvl {lvl}/5</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>

                    <button
                      onClick={() => {
                        const res = esportsManager.upgradeGamingHouse(item.key as any);
                        notify(res.message);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold transition border border-slate-700"
                    >
                      Улучшить
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Esports Arena */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="font-black text-white text-base">{esports.arena.name}</h3>
                  <span className="text-xs text-slate-400">Вместимость: {esports.arena.seatCapacity.toLocaleString()} мест</span>
                </div>
              </div>
              <button
                onClick={() => {
                  const res = esportsManager.upgradeArena('level');
                  notify(res.message);
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-xl text-xs transition"
              >
                Расширить арену
              </button>
            </div>

            {/* Arena Ticket Pricing & Concessions */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Цена входного билета:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={10}
                    max={150}
                    value={esports.arena.ticketPrice}
                    onChange={(e) => esportsManager.setArenaTicketPrice(Number(e.target.value))}
                    className="accent-cyan-400"
                  />
                  <b className="text-emerald-400 font-black">{currency}{esports.arena.ticketPrice}</b>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500">Доход от билетов:</span>
                  <div className="font-bold text-white mt-0.5">{currency}{esports.arena.lastMonthRevenue.tickets.toLocaleString()}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500">VIP-ложи & Еда:</span>
                  <div className="font-bold text-white mt-0.5">{currency}{(esports.arena.lastMonthRevenue.vip + esports.arena.lastMonthRevenue.food).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 6: STAFF MANAGEMENT (ПЕРСОНАЛ)
         ========================================================================= */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Штат специалистов ({esports.staff.length} сотрудников)</h4>
              <span className="text-xs text-slate-400">Тренеры, аналитики, психологи, скауты и медиа-директора</span>
            </div>
          </div>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {esports.staff.map((s) => (
              <div key={s.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-black text-white text-sm">{s.name}</h5>
                    <span className="text-xs font-black text-cyan-400">Рейтинг: {s.rating}</span>
                  </div>
                  <p className="text-xs text-slate-400">{s.specialization}</p>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-emerald-300">
                    {s.bonusEffect}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Зарплата: <b className="text-white">{currency}{s.salary.toLocaleString()}/мес</b></span>
                  <button
                    onClick={() => {
                      esportsManager.fireStaff(s.id);
                      notify(`Сотрудник ${s.name} уволен`);
                    }}
                    className="px-2.5 py-1 text-rose-400 hover:bg-rose-500/10 rounded-lg text-xs font-bold transition"
                  >
                    Уволить
                  </button>
                </div>
              </div>
            ))}

            {/* Hire New Staff Card */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 space-y-3">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Нанять нового специалиста</h5>
              <div className="grid grid-cols-1 gap-1.5">
                {(Object.keys(STAFF_ROLES_INFO) as StaffRole[]).slice(0, 4).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      const res = esportsManager.hireStaff(role);
                      notify(res.message);
                    }}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-left border border-slate-800 text-xs flex items-center justify-between transition"
                  >
                    <span className="font-semibold text-slate-300">{STAFF_ROLES_INFO[role].titleRu}</span>
                    <span className="text-cyan-400 font-bold">{currency}{STAFF_ROLES_INFO[role].baseSalary.toLocaleString()}/мес</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: SPONSORS & MERCH (СПОНСОРЫ & МЕРЧ-МАГАЗИН)
         ========================================================================= */}
      {activeTab === 'sponsors' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Sponsor Contracts */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Спонсорские контракты (8 категорий бизнеса)</h4>
            <div className="space-y-3">
              {esports.sponsors.map((s) => (
                <div
                  key={s.id}
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    s.isActive ? 'bg-cyan-950/20 border-cyan-500/40' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.logoEmoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-black text-white text-sm">{s.companyName}</h5>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold">Тир {s.tier}</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Выплата: <b className="text-emerald-400">+{currency}{s.monthlyPayment.toLocaleString()}/мес</b> • Бонус победы: <b className="text-amber-400">+{currency}{s.tournamentVictoryBonus.toLocaleString()}</b>
                      </p>
                    </div>
                  </div>

                  {s.isActive ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold">
                      Активен
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        const res = esportsManager.signSponsor(s.id);
                        notify(res.message);
                      }}
                      className="px-3.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition"
                    >
                      Подписать
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Merch Store & Factory Synergy */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Мерч-магазин организации</h4>
                <span className="text-xs text-slate-400">Одежда, джерси и девайсы с синергией фабрик</span>
              </div>
            </div>

            <div className="space-y-3">
              {esports.merch.map((m) => (
                <div key={m.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-white text-sm">{m.name}</h5>
                      <span className="text-xs text-slate-400">
                        Цена: <b className="text-emerald-400">{currency}{m.retailPrice}</b> • Себестоимость: <b className="text-slate-300">{currency}{m.unitCost}</b>
                      </span>
                    </div>
                    <span className="text-xs text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      Склад: <b className="text-cyan-400">{m.stock} шт.</b>
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        const res = esportsManager.restockMerchWithTextileFactory(m.id, 100);
                        notify(res.message);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
                    >
                      Произвести партию (+100 шт)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 8: MEDIA & STREAMING (МЕДИА)
         ========================================================================= */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-xs font-bold text-slate-400 uppercase">Подписчики соцсетей</div>
              <div className="text-2xl font-black text-cyan-400 mt-1">{esports.media.followers.toLocaleString()}</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-xs font-bold text-slate-400 uppercase">Просмотры видео в месяц</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{(esports.media.videoViewsMonthly / 1000).toFixed(0)}k просмотров</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-xs font-bold text-slate-400 uppercase">Медийная стоимость</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{currency}{esports.media.monthlySponsorValue.toLocaleString()}/мес</div>
            </div>
          </div>

          {/* Launch Media Campaigns */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Запустить вирусную медиа-кампанию</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { type: 'highlights', label: 'Хайлайты клатчей', cost: 8000, gain: '+9,500 фанатов' },
                { type: 'vlog', label: 'Влог с буткемпа', cost: 15000, gain: '+15,000 фанатов' },
                { type: 'stream_marathon', label: '24-часовой стрим-марафон', cost: 25000, gain: '+28,000 фанатов' },
              ].map((c) => (
                <button
                  key={c.type}
                  onClick={() => {
                    const res = esportsManager.launchMediaCampaign(c.type as any);
                    notify(res.message);
                  }}
                  className="p-4 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left transition flex flex-col justify-between"
                >
                  <div>
                    <h5 className="font-bold text-white text-sm">{c.label}</h5>
                    <span className="text-xs text-emerald-400 font-semibold">{c.gain}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-3">
                    Стоимость: <b className="text-white">{currency}{c.cost.toLocaleString()}</b>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 9: WORLD RANKINGS (МИРОВОЙ РЕЙТИНГ)
         ========================================================================= */}
      {activeTab === 'rankings' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {ALL_DISCIPLINE_IDS.map((dId) => (
              <button
                key={dId}
                onClick={() => setSelectedDiscipline(dId)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  selectedDiscipline === dId
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {ESPORTS_DISCIPLINES[dId].name}
              </button>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-3">
              Мировой рейтинг {ESPORTS_DISCIPLINES[selectedDiscipline].name}
            </h4>

            <div className="space-y-2">
              {(esports.rankings[selectedDiscipline] || []).map((entry) => (
                <div
                  key={entry.teamId}
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    entry.isPlayerOrg ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                      entry.rank === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-900 text-slate-400'
                    }`}>
                      #{entry.rank}
                    </span>
                    <div>
                      <h5 className={`text-sm font-bold ${entry.isPlayerOrg ? 'text-cyan-300' : 'text-white'}`}>
                        {entry.teamName}
                      </h5>
                      <span className="text-xs text-slate-500">{entry.region}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Винрейт: </span>
                      <b className="text-emerald-400">{entry.winLossRate}%</b>
                    </div>
                    <div className="font-black text-cyan-400">{entry.points} pts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Match Viewer Modal */}
      {activeLiveMatch && (
        <EsportsMatchLiveModal
          match={activeLiveMatch}
          onClose={() => setActiveLiveMatch(null)}
        />
      )}

      {/* Rebranding Modal */}
      {showOrgCustomizer && (
        <EsportsOrgCustomizerModal
          currentName={org.name}
          currentTag={org.tag}
          currentLogo={org.logoEmoji}
          currentColor={org.primaryColor}
          onClose={() => setShowOrgCustomizer(false)}
          onSuccess={(msg) => notify(msg)}
        />
      )}

    </div>
  );
};
