/**
 * Business Empire: Ultimate
 * Used Car Market View - 100+ Models, 17 Categories, Filters, Bargaining & Diagnostics
 */

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Wrench,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Eye,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Zap,
  Gauge,
  Tag,
  RefreshCw,
} from 'lucide-react';
import { CarCategory, UsedCarListing } from '../../types/automotive';
import { automotiveManager } from '../../game/automotive/automotiveManager';
import { UsedMarketSystem } from '../../game/automotive/usedMarketSystem';
import { gameState } from '../../game/gameState';

const CATEGORY_NAMES: Record<CarCategory, string> = {
  budget: 'Бюджетные',
  city: 'Городские',
  sedan: 'Седаны',
  wagon: 'Универсалы',
  crossover: 'Кроссоверы',
  suv: 'Внедорожники / SUV',
  pickup: 'Пикапы',
  sport: 'Спорткары',
  premium: 'Премиум',
  luxury: 'Люкс',
  ev: 'Электромобили (EV)',
  hybrid: 'Гибриды',
  classic: 'Классика / Ретро',
  commercial: 'Коммерческий',
  truck: 'Тяжелые тягачи',
  supercar: 'Суперкары',
  hypercar: 'Гиперкары',
};

interface Props {
  listings: UsedCarListing[];
  onListingUpdated: () => void;
}

export const UsedCarMarketView: React.FC<Props> = ({ listings, onListingUpdated }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CarCategory | 'all'>('all');
  const [selectedListing, setSelectedListing] = useState<UsedCarListing | null>(null);
  const [negotiationListing, setNegotiationListing] = useState<UsedCarListing | null>(null);
  const [diagnosticsListing, setDiagnosticsListing] = useState<UsedCarListing | null>(null);

  const [customOffer, setCustomOffer] = useState<number>(0);
  const [negotiationStatus, setNegotiationStatus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const playerCash = gameState.getState().cash;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredListings = listings.filter(item => {
    const matchesSearch =
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.generation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleBuy = (listing: UsedCarListing, price: number) => {
    const res = automotiveManager.buyUsedCar(listing.id, price);
    showToast(res.message);
    if (res.success) {
      setSelectedListing(null);
      setNegotiationListing(null);
      onListingUpdated();
    }
  };

  const handleBargainSubmit = (listing: UsedCarListing) => {
    if (customOffer <= 0) return;
    const res = UsedMarketSystem.negotiatePrice(listing, customOffer);
    setNegotiationStatus(res.message);

    if (res.status === 'accepted') {
      showToast(res.message);
      onListingUpdated();
    }
  };

  const handleRunDiagnostics = (listing: UsedCarListing, level: 'visual' | 'obd' | 'expert') => {
    const currentDay = gameState.getState().gameTime.day;
    const { report, cost } = UsedMarketSystem.performDiagnostics(listing, level, currentDay);

    if (cost > 0) {
      if (playerCash < cost) {
        showToast('Недостаточно средств для проведения диагностики!');
        return;
      }
      gameState.update(draft => {
        draft.cash -= cost;
      });
    }

    showToast(`Диагностика проведена! Выявлено ${report.discoveredFaults.length} замечаний.`);
    onListingUpdated();
  };

  return (
    <div className="space-y-6" id="used-car-market-view">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 font-medium flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded"
          >
            Закрыть
          </button>
        </div>
      )}

      {/* Header & Market Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🏷️</span> Вторичный автомобильный рынок
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Ищите недооцененные варианты, торгуйтесь с владельцами, проводите диагностику и зарабатывайте на перепродаже!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              automotiveManager.refreshUsedMarket(true);
              onListingUpdated();
              showToast('Рынок объявлений успешно обновлен!');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-medium transition-all border border-zinc-700 hover:border-zinc-600 shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Обновить объявления</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Поиск по марке, модели, поколению (напр. BMW, Camry, Tesla, Golf)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Все категории ({listings.length})
            </button>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CATEGORY_NAMES) as CarCategory[]).map(cat => {
            const count = listings.filter(l => l.category === cat).length;
            if (count === 0 && selectedCategory !== cat) return null;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                    : 'bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {CATEGORY_NAMES[cat]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Car Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredListings.map(item => {
          const discountPct = Math.round(((item.marketPrice - item.sellerPrice) / item.marketPrice) * 100);
          const isBelowMarket = discountPct > 0;
          const isDistressDeal = discountPct >= 20;

          return (
            <div
              key={item.id}
              className="bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-black/40 group relative"
            >
              {/* Hot deal badge */}
              {isDistressDeal && (
                <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-[11px] font-extrabold px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-black" />
                  <span>СРОЧНЫЙ ВЫКУП (-{discountPct}%)</span>
                </div>
              )}

              <div>
                {/* Brand, Model & Year */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-400/90">
                      {CATEGORY_NAMES[item.category] || item.category}
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                      {item.brand} {item.model}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {item.generation} • {item.year} г.
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-zinc-500">Цена продавца:</span>
                    <div className="text-lg font-black text-white">${item.sellerPrice.toLocaleString()}</div>
                    {isBelowMarket && (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        Рынок: ${item.marketPrice.toLocaleString()} (-{discountPct}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Specs Pill Grid */}
                <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-zinc-800/60 text-xs text-zinc-300">
                  <div className="flex items-center gap-2 bg-zinc-950/60 px-2.5 py-1.5 rounded-lg border border-zinc-800/40">
                    <Gauge className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{item.mileageKm.toLocaleString()} км</span>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-950/60 px-2.5 py-1.5 rounded-lg border border-zinc-800/40">
                    <Wrench className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      Состояние:{' '}
                      <strong className={item.condition > 75 ? 'text-emerald-400' : 'text-amber-400'}>
                        {item.condition}%
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-950/60 px-2.5 py-1.5 rounded-lg border border-zinc-800/40 col-span-2">
                    <span className="truncate">
                      ⚙️ {item.engine} • {item.enginePowerHp} л.с. • {item.driveType.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Seller Urgency & Location */}
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-4 px-1">
                  <span>📍 {item.location}</span>
                  <span
                    className={`font-semibold ${
                      item.sellerUrgency === 'distress'
                        ? 'text-emerald-400'
                        : item.sellerUrgency === 'urgent'
                        ? 'text-amber-400'
                        : 'text-zinc-400'
                    }`}
                  >
                    Срочность: {item.sellerUrgency === 'distress' ? 'Очень высокая' : item.sellerUrgency === 'urgent' ? 'Высокая' : 'Обычная'}
                  </span>
                </div>

                {/* Diagnostics summary if conducted */}
                {item.diagnosticsReport && (
                  <div className="p-2.5 mb-3 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-zinc-300 font-semibold">
                      <span className="flex items-center gap-1.5 text-sky-400">
                        <ShieldCheck className="w-3.5 h-3.5" /> Отчет диагностики ({item.diagnosticsReport.level})
                      </span>
                      <span>Точность: {Math.round(item.diagnosticsReport.accuracy * 100)}%</span>
                    </div>
                    {item.diagnosticsReport.discoveredFaults.length > 0 ? (
                      <p className="text-[11px] text-amber-300 line-clamp-2">
                        ⚠️ Найдено {item.diagnosticsReport.discoveredFaults.length} неисправностей. Ремонт: ~$
                        {item.diagnosticsReport.estimatedRepairCost.toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-400">✅ Серьезных дефектов не обнаружено</p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80">
                <button
                  onClick={() => setDiagnosticsListing(item)}
                  className="px-3 py-2 bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/80 rounded-xl text-xs font-semibold text-zinc-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>Диагн.</span>
                </button>

                <button
                  onClick={() => {
                    setNegotiationListing(item);
                    setCustomOffer(Math.round(item.sellerPrice * 0.88));
                    setNegotiationStatus(null);
                  }}
                  className="px-3 py-2 bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/80 rounded-xl text-xs font-semibold text-amber-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Торг</span>
                </button>

                <button
                  onClick={() => handleBuy(item, item.sellerPrice)}
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-1"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Купить</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredListings.length === 0 && (
        <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-8 space-y-3">
          <p className="text-zinc-400 text-sm">По вашему запросу объявлений не найдено.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-xl transition-colors"
          >
            Сбросить фильтры
          </button>
        </div>
      )}

      {/* Diagnostics Modal */}
      {diagnosticsListing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                <span>Диагностика {diagnosticsListing.brand} {diagnosticsListing.model}</span>
              </h3>
              <button
                onClick={() => setDiagnosticsListing(null)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {/* Option 1: Visual */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">Визуальный осмотр</h4>
                  <p className="text-xs text-zinc-400">Осмотр кузова, толщиномер ЛКП, проверка стекол (Точность 60%)</p>
                </div>
                <button
                  onClick={() => handleRunDiagnostics(diagnosticsListing, 'visual')}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Бесплатно
                </button>
              </div>

              {/* Option 2: OBD */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">Компьютерная OBD-II диагностика</h4>
                  <p className="text-xs text-zinc-400">Считывание ошибок ЭБУ, параметров работы турбины и КПП (Точность 85%)</p>
                </div>
                <button
                  onClick={() => handleRunDiagnostics(diagnosticsListing, 'obd')}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  $250
                </button>
              </div>

              {/* Option 3: Expert */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-amber-400">Экспертная проверка на СТО (Full)</h4>
                  <p className="text-xs text-zinc-400">Подъемник, эндоскопия цилиндров, геометрия рамы (Точность 100%)</p>
                </div>
                <button
                  onClick={() => handleRunDiagnostics(diagnosticsListing, 'expert')}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-bold transition-colors"
                >
                  $750
                </button>
              </div>
            </div>

            {diagnosticsListing.diagnosticsReport && (
              <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-2">
                <div className="text-xs font-bold text-white">Результаты последнего отчета:</div>
                <ul className="text-xs text-zinc-300 space-y-1 list-disc pl-4">
                  {diagnosticsListing.diagnosticsReport.discoveredFaults.length === 0 && (
                    <li className="text-emerald-400">Критических дефектов не обнаружено.</li>
                  )}
                  {diagnosticsListing.diagnosticsReport.discoveredFaults.map((f, idx) => (
                    <li key={idx} className="text-amber-300">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDiagnosticsListing(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bargaining Modal */}
      {negotiationListing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-400" />
                <span>Торг с продавцом</span>
              </h3>
              <button
                onClick={() => setNegotiationListing(null)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1.5 text-xs text-zinc-300">
                <div className="flex justify-between">
                  <span>Автомобиль:</span>
                  <strong className="text-white">{negotiationListing.brand} {negotiationListing.model}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Текущая цена продавца:</span>
                  <strong className="text-amber-400 font-bold">${negotiationListing.sellerPrice.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Рыночная стоимость:</span>
                  <span>${negotiationListing.marketPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Характер продавца:</span>
                  <span className="capitalize">{negotiationListing.sellerPersonality}</span>
                </div>
              </div>

              {negotiationStatus && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-medium leading-relaxed">
                  💬 {negotiationStatus}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">Ваше ценовое предложение ($):</label>
                <input
                  type="number"
                  value={customOffer}
                  onChange={e => setCustomOffer(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-bold text-base focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Quick discount buttons */}
              <div className="flex gap-2">
                {[-5, -10, -15, -20].map(pct => (
                  <button
                    key={pct}
                    onClick={() => setCustomOffer(Math.round(negotiationListing.sellerPrice * (1 + pct / 100)))}
                    className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setNegotiationListing(null)}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => handleBargainSubmit(negotiationListing)}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20"
              >
                Предложить цену
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
