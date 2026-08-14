/**
 * Business Empire: Ultimate
 * Master Automotive Industry View
 * Sub-Tabs: Used Market, Garage, Workshop, Parts Warehouse, Dealerships, Factories, R&D & Brand, Analytics
 */

import React, { useState, useEffect } from 'react';
import {
  Car,
  ShoppingBag,
  Wrench,
  Package,
  Store,
  Factory,
  Cpu,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { automotiveManager } from '../../game/automotive/automotiveManager';
import { AutomotiveState } from '../../types/automotive';
import { gameState } from '../../game/gameState';
import { UsedCarMarketView } from './UsedCarMarketView';
import { MyGarageView } from './MyGarageView';
import { AutoServiceWorkshopView } from './AutoServiceWorkshopView';
import { AutoPartsWarehouseView } from './AutoPartsWarehouseView';
import { CarDealershipsView } from './CarDealershipsView';
import { CarManufacturingView } from './CarManufacturingView';
import { CarBrandAndRndView } from './CarBrandAndRndView';
import { AutomotiveAnalyticsView } from './AutomotiveAnalyticsView';

type AutoSubTab =
  | 'used_market'
  | 'garage'
  | 'auto_service'
  | 'parts_warehouse'
  | 'dealerships'
  | 'factories'
  | 'rnd_brand'
  | 'analytics';

export const AutomotiveIndustryView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<AutoSubTab>('used_market');
  const [autoState, setAutoState] = useState<AutomotiveState>(() => automotiveManager.getOrCreateState());

  useEffect(() => {
    const unsub = gameState.subscribe(state => {
      if (state.automotive) {
        setAutoState({ ...state.automotive });
      }
    });

    return unsub;
  }, []);

  const handleDataUpdated = () => {
    const freshState = automotiveManager.getOrCreateState();
    setAutoState({ ...freshState });
  };

  const handleNavigateToTab = (tabId: string) => {
    if (tabId === 'market') setActiveSubTab('used_market');
    else if (tabId === 'garage') setActiveSubTab('garage');
    else if (tabId === 'service') setActiveSubTab('auto_service');
    else if (tabId === 'parts') setActiveSubTab('parts_warehouse');
    else if (tabId === 'dealers') setActiveSubTab('dealerships');
    else if (tabId === 'factory') setActiveSubTab('factories');
    else if (tabId === 'rnd') setActiveSubTab('rnd_brand');
    else if (tabId === 'analytics') setActiveSubTab('analytics');
  };

  return (
    <div className="space-y-6 animate-fade-in" id="automotive-industry-master-view">
      {/* Sub-Navigation Navigation Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-2 flex items-center gap-1.5 overflow-x-auto shadow-md">
        <button
          onClick={() => setActiveSubTab('used_market')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'used_market'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Вторичный рынок ({autoState.usedMarketListings.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('garage')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'garage'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Мой автопарк ({autoState.ownedCars.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('auto_service')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'auto_service'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Автосервис & СТО ({autoState.autoWorkshops.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('parts_warehouse')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'parts_warehouse'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Склад автозапчастей</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dealerships')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'dealerships'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Автосалоны ({autoState.dealerships.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('factories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'factories'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Factory className="w-4 h-4" />
          <span>Автозаводы ({autoState.factoryLines.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rnd_brand')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'rnd_brand'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>КБ & Бренд</span>
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'analytics'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Аналитика & P&L</span>
        </button>
      </div>

      {/* SubTab Views */}
      {activeSubTab === 'used_market' && (
        <UsedCarMarketView
          listings={autoState.usedMarketListings}
          onListingUpdated={handleDataUpdated}
        />
      )}

      {activeSubTab === 'garage' && (
        <MyGarageView
          cars={autoState.ownedCars}
          onCarUpdated={handleDataUpdated}
          onNavigateToTab={handleNavigateToTab}
        />
      )}

      {activeSubTab === 'auto_service' && (
        <AutoServiceWorkshopView
          workshops={autoState.autoWorkshops}
          onWorkshopUpdated={handleDataUpdated}
        />
      )}

      {activeSubTab === 'parts_warehouse' && <AutoPartsWarehouseView />}

      {activeSubTab === 'dealerships' && (
        <CarDealershipsView
          dealerships={autoState.dealerships}
          ownedCars={autoState.ownedCars}
          onDealershipUpdated={handleDataUpdated}
          onNavigateToTab={handleNavigateToTab}
        />
      )}

      {activeSubTab === 'factories' && (
        <CarManufacturingView
          factories={autoState.factoryLines}
          brands={autoState.playerBrands}
          models={autoState.customModels}
          onFactoryUpdated={handleDataUpdated}
          onNavigateToTab={handleNavigateToTab}
        />
      )}

      {activeSubTab === 'rnd_brand' && (
        <CarBrandAndRndView
          brands={autoState.playerBrands}
          models={autoState.customModels}
          technologies={autoState.rndTechnologies}
          onDataUpdated={handleDataUpdated}
          onNavigateToTab={handleNavigateToTab}
        />
      )}

      {activeSubTab === 'analytics' && <AutomotiveAnalyticsView automotiveState={autoState} />}
    </div>
  );
};
