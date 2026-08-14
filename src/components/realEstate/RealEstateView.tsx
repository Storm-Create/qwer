/**
 * Business Empire: Ultimate
 * Real Estate View Subsystem
 */

import React, { useState } from 'react';
import {
  Building2,
  Building,
  Store,
  Warehouse,
  Factory,
  Home,
  Briefcase,
  TrendingUp,
  Plus,
  Filter,
  Layers,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { GameState } from '../../types/game';
import { RealEstateType, RealEstateProperty } from '../../types/realEstate';
import { realEstateManager } from '../../game/realEstate/realEstateManager';
import { REAL_ESTATE_TYPES_META } from '../../game/realEstate/realEstateCatalog';
import { RealEstatePortfolioStats } from './RealEstatePortfolioStats';
import { PropertyCard } from './PropertyCard';
import { MarketListingCard } from './MarketListingCard';
import { UpgradePropertyModal } from './UpgradePropertyModal';

interface RealEstateViewProps {
  state: GameState;
  showNotification?: (message: string) => void;
}

export const RealEstateView: React.FC<RealEstateViewProps> = ({
  state,
  showNotification = (msg) => console.log(msg),
}) => {
  const [activeTab, setActiveTab] = useState<'my_properties' | 'catalog' | 'analytics'>('my_properties');
  const [typeFilter, setTypeFilter] = useState<RealEstateType | 'all'>('all');
  const [upgradingProperty, setUpgradingProperty] = useState<RealEstateProperty | null>(null);

  const properties = realEstateManager.getProperties();
  const catalog = realEstateManager.getCatalog();
  const marketState = realEstateManager.getMarketState();
  const currency = state.settings?.currency || '$';

  const filteredProperties = properties.filter((p) =>
    typeFilter === 'all' ? true : p.type === typeFilter
  );

  const filteredCatalog = catalog.filter((c) =>
    typeFilter === 'all' ? true : c.type === typeFilter
  );

  const handleBuy = (catalogId: string) => {
    const res = realEstateManager.buyProperty(catalogId);
    showNotification(res.message);
    if (res.success) {
      setActiveTab('my_properties');
    }
  };

  const handleSell = (property: RealEstateProperty) => {
    const res = realEstateManager.sellProperty(property.id);
    showNotification(res.message);
  };

  const handleToggleRent = (id: string) => {
    const res = realEstateManager.toggleRent(id);
    showNotification(res.message);
  };

  const handleRepair = (id: string) => {
    const res = realEstateManager.repairProperty(id);
    showNotification(res.message);
  };

  const handleUpgrade = (propertyId: string) => {
    const res = realEstateManager.upgradeProperty(propertyId);
    showNotification(res.message);
  };

  const categoryButtons: { id: RealEstateType | 'all'; title: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', title: 'Все типы', icon: Building2 },
    { id: 'apartment', title: 'Квартиры', icon: Building },
    { id: 'house', title: 'Дома', icon: Home },
    { id: 'office', title: 'Офисы', icon: Briefcase },
    { id: 'shop', title: 'Магазины', icon: Store },
    { id: 'warehouse', title: 'Склады', icon: Warehouse },
    { id: 'mall', title: 'Торговые центры', icon: Building2 },
    { id: 'factory', title: 'Заводы', icon: Factory },
  ];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Portfolio Top Stats */}
      <RealEstatePortfolioStats
        properties={properties}
        market={marketState}
        currency={currency}
      />

      {/* Main Navigation & View Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('my_properties')}
            className={`flex-1 sm:flex-none py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'my_properties'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Мои объекты ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 sm:flex-none py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'catalog'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Каталог рынка ({catalog.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 sm:flex-none py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Аналитика цен</span>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
          {categoryButtons.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setTypeFilter(cat.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  typeFilter === cat.id
                    ? 'bg-slate-800 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: My Properties */}
      {activeTab === 'my_properties' && (
        <div>
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onToggleRent={handleToggleRent}
                  onUpgrade={(p) => setUpgradingProperty(p)}
                  onRepair={handleRepair}
                  onSell={handleSell}
                  currency={currency}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-teal-500/10 text-teal-400 border border-teal-500/20 mx-auto flex items-center justify-center">
                <Building2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-100">
                {typeFilter === 'all'
                  ? 'В вашем портфеле пока нет объектов недвижимости'
                  : `Нет объектов в категории «${REAL_ESTATE_TYPES_META[typeFilter as RealEstateType]?.title || typeFilter}»`}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Инвестируйте в жилые квартиры, премиальные дома, офисные центры, магазины, логистические склады, мегамоллы и заводы для стабильного ежедневного арендного дохода.
              </p>
              <button
                onClick={() => {
                  setTypeFilter('all');
                  setActiveTab('catalog');
                }}
                className="py-2.5 px-5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20"
              >
                <span>Перейти в каталог рынка</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Market Catalog */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Доступно объектов в каталоге: {filteredCatalog.length}</span>
            <span className="font-mono text-teal-400">
              Цены обновляются динамически в соответствии с рыночным индексом
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalog.map((item) => (
              <MarketListingCard
                key={item.id}
                item={item}
                playerCash={state.cash}
                onBuy={handleBuy}
                currency={currency}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Market Analytics & Districts */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Market Index History */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                  <span>Индекс цен на недвижимость (RE Index)</span>
                </h4>
                <span className="font-mono text-xs font-bold text-teal-300">
                  {marketState.marketIndex.toFixed(1)} pts
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Динамика изменения средней стоимости квадратного метра в столичной агломерации.
              </p>

              <div className="h-32 flex items-end gap-1 pt-4 pb-1 border-b border-slate-800">
                {marketState.marketIndexHistory.map((val, idx) => {
                  const min = Math.min(...marketState.marketIndexHistory) * 0.95;
                  const max = Math.max(...marketState.marketIndexHistory) * 1.05;
                  const heightPercent = Math.max(15, Math.min(100, ((val - min) / (max - min || 1)) * 100));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div
                        className="w-full rounded-t bg-teal-500/40 group-hover:bg-teal-400 transition-all"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>30 дней назад</span>
                <span>Сегодня ({marketState.trend})</span>
              </div>
            </div>

            {/* District Multipliers */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Территориальные коэффициенты районов</span>
              </h4>
              <p className="text-xs text-slate-400">
                Текущий спрос и премия за локацию в ключевых экономических кластерах города.
              </p>

              <div className="space-y-2.5 pt-2">
                {[
                  { name: 'Исторический Центр & Набережная', key: 'city_center', color: 'bg-indigo-500' },
                  { name: 'Деловой Квартал «Moscow-City»', key: 'business_district', color: 'bg-blue-500' },
                  { name: 'Золотая Миля & Ривьера', key: 'elite_suburb', color: 'bg-emerald-500' },
                  { name: 'Торговые Проспекты & Ритейл', key: 'commercial_avenue', color: 'bg-amber-500' },
                  { name: 'Логистические Транзитные Хабы', key: 'logistics_hub', color: 'bg-cyan-500' },
                  { name: 'Индустриальные Промзоны', key: 'industrial_zone', color: 'bg-rose-500' },
                  { name: 'Спальные Жилые Районы', key: 'residential_area', color: 'bg-slate-500' },
                ].map((dist) => {
                  const mult = marketState.districtMultipliers[dist.key] || 1.0;
                  const diffPercent = (mult - 1.0) * 100;

                  return (
                    <div key={dist.key} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${dist.color}`} />
                        <span className="text-slate-300">{dist.name}</span>
                      </div>
                      <span
                        className={`font-mono font-bold ${
                          diffPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {mult.toFixed(2)}x ({diffPercent >= 0 ? '+' : ''}{diffPercent.toFixed(1)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {upgradingProperty && (
        <UpgradePropertyModal
          property={upgradingProperty}
          playerCash={state.cash}
          onClose={() => setUpgradingProperty(null)}
          onConfirmUpgrade={handleUpgrade}
          currency={currency}
        />
      )}
    </div>
  );
};
