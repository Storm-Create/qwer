/**
 * Business Empire: Ultimate
 * Main Application Root & Engine Bootstrapper
 */

import React, { useEffect, useState } from 'react';
import { gameState } from './game/gameState';
import { gameLoop } from './game/gameLoop';
import { saveSystem } from './game/saveSystem';
import { economy } from './game/economy';
import { automotiveManager } from './game/automotive/automotiveManager';
import { retailManager } from './game/business/retailManager';
import { industrialManager } from './game/production/industrialManager';
import { staffManager } from './game/staff/staffManager';
import { worldEconomyEngine } from './game/economy/worldEconomyEngine';
import { casinoManager } from './game/casino/casinoManager';
import { casesManager } from './game/cases/casesManager';
import { esportsManager } from './game/esports/esportsManager';
import { clickerManager } from './game/clicker/clickerManager';
import { GameState, NavigationTab, OfflineProgressResult } from './types/game';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileMoreDrawer } from './components/MobileMoreDrawer';
import { DashboardView } from './components/DashboardView';
import { SectionPlaceholderView } from './components/SectionPlaceholderView';
import { OfflineProgressModal } from './components/OfflineProgressModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastProvider } from './components/ui/ToastContext';

export default function App() {
  return (
    <ToastProvider>
      <MainGameContainer />
    </ToastProvider>
  );
}

function MainGameContainer() {
  const [state, setState] = useState<GameState>(gameState.getState());
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMore, setShowMobileMore] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [offlineResult, setOfflineResult] = useState<OfflineProgressResult | null>(null);

  useEffect(() => {
    // 1. Subscribe React state to game state changes
    const unsubscribe = gameState.subscribe((newState) => {
      setState({ ...newState });
    });

    // 2. Load game from storage and check for offline progress
    const loadResult = saveSystem.loadGame();
    if (loadResult.success && loadResult.offlineResult) {
      setOfflineResult(loadResult.offlineResult);
    }

    // 3. Start unified Game Loop engine
    gameLoop.start();

    // 4. Initialize automotive, retail, industrial, staff, world economy, cases, esports & clicker systems
    worldEconomyEngine.init();
    automotiveManager.getOrCreateState();
    retailManager.getStores();
    industrialManager.getOrCreateState();
    staffManager.getOrCreateState();
    casinoManager.getOrCreateState();
    casesManager.getOrCreateState();
    esportsManager.getOrCreateState();
    clickerManager.getOrCreateState();

    const unhookHourly = gameLoop.onHour((time) => {
      industrialManager.handleHourTick(time.hour);
      staffManager.handleHourTick(time.hour);
      clickerManager.handleHourTick();
    });

    const unhookAutoDay = gameLoop.onDay((time) => {
      automotiveManager.handleDayTick(time.day);
      retailManager.handleDayTick(time.day);
      industrialManager.handleDayTick(time.day);
      staffManager.handleDayTick(time.day);
      casinoManager.handleDayTick(time.day);
    });

    // 5. Start 30-second periodic autosave
    saveSystem.startAutoSave(30);

    // Initial capture snapshot if history is empty
    if (gameState.getState().financialHistory.length === 0) {
      economy.captureSnapshot();
    }

    // Cleanup on unmount
    return () => {
      unsubscribe();
      unhookHourly();
      unhookAutoDay();
      gameLoop.stop();
      saveSystem.stopAutoSave();
    };
  }, []);

  const breakdown = economy.getFinancialBreakdown();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header with Financial Counters and Time Engine */}
      <Header
        state={state}
        onOpenSettings={() => setShowSettings(true)}
        onOpenMobileMenu={() => setShowMobileMore(true)}
        onNavigateTab={setActiveTab}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 w-full mx-auto flex flex-col lg:flex-row">
        {/* Left Sidebar Navigation (Desktop) */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          state={state}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Dynamic Main Viewport */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto pb-24 lg:pb-8">
          {activeTab === 'dashboard' ? (
            <DashboardView
              state={state}
              breakdown={breakdown}
              onNavigateTab={setActiveTab}
            />
          ) : (
            <SectionPlaceholderView tab={activeTab} state={state} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenMore={() => setShowMobileMore(true)}
        state={state}
      />

      {/* Mobile "More" Drawer Hub */}
      <MobileMoreDrawer
        isOpen={showMobileMore}
        onClose={() => setShowMobileMore(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        state={state}
        onOpenSettings={() => setShowSettings(true)}
        onSaveGame={() => {
          saveSystem.saveGame();
        }}
      />

      {/* Offline Earnings Report Modal */}
      {offlineResult && (
        <OfflineProgressModal
          result={offlineResult}
          currency={state.settings.currency}
          onClose={() => setOfflineResult(null)}
        />
      )}

      {/* Settings & Save Management Modal */}
      {showSettings && (
        <SettingsModal
          state={state}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
