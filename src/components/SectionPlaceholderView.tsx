/**
 * Business Empire: Ultimate
 * Subsystem Views & Section Foundation Previews
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  Car,
  Store,
  Boxes,
  Factory,
  Building2,
  LineChart,
  Landmark,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { NavigationTab, GameState } from '../types/game';
import { GoodsMarketView } from './trading/GoodsMarketView';
import { WarehouseLogisticsView } from './warehouses/WarehouseLogisticsView';
import { AutomotiveIndustryView } from './automotive/AutomotiveIndustryView';
import { RetailDashboardView } from './retail/RetailDashboardView';
import { IndustrialEconomyView } from './production/IndustrialEconomyView';
import { StaffManagementView } from './staff/StaffManagementView';
import { RealEstateView } from './realEstate/RealEstateView';
import { BankView } from './bank/BankView';
import { StockExchangeView } from './stocks/StockExchangeView';
import { CompetitorsMarketView } from './competitors/CompetitorsMarketView';
import { WorldEconomyView } from './economy/WorldEconomyView';
import { HoldingView } from './holding/HoldingView';
import { CasinoLobbyView } from './casino/CasinoLobbyView';
import { CasesLobbyView } from './cases/CasesLobbyView';
import { EsportsEmpireView } from './esports/EsportsEmpireView';
import { ClickerEmpireView } from './clicker/ClickerEmpireView';
import { goodsMarket } from '../game/markets/goodsMarket';
import { carMarket } from '../game/markets/carMarket';
import { stockMarket } from '../game/markets/stockMarket';
import { retailSystem } from '../game/business/retail';
import { factorySystem } from '../game/business/factories';
import { warehouseSystem } from '../game/business/warehouses';
import { loansSystem } from '../game/finance/loans';
import { technologySystem } from '../game/systems/technology';
import { corporationSystem } from '../game/systems/corporation';
import { competitorsSystem } from '../game/ai/competitors';

interface SectionViewProps {
  tab: NavigationTab;
  state: GameState;
}

export const SectionPlaceholderView: React.FC<SectionViewProps> = ({ tab, state }) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [holdingNameInput, setHoldingNameInput] = useState(state.corporation.name);
  const currency = state.settings.currency || '$';

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const renderContent = () => {
    switch (tab) {
      case 'world_economy': {
        return <WorldEconomyView state={state} showNotification={showNotification} />;
      }

      case 'trading': {
        return <GoodsMarketView gameState={state} />;
      }

      case 'cars': {
        return <AutomotiveIndustryView />;
      }

      case 'businesses': {
        return <RetailDashboardView />;
      }

      case 'warehouses': {
        return <WarehouseLogisticsView state={state} />;
      }

      case 'production': {
        return <IndustrialEconomyView state={state} />;
      }

      case 'staff': {
        return <StaffManagementView state={state} />;
      }

      case 'real_estate': {
        return <RealEstateView state={state} showNotification={showNotification} />;
      }

      case 'stocks': {
        return <StockExchangeView state={state} showNotification={showNotification} />;
      }

      case 'bank': {
        return <BankView state={state} showNotification={showNotification} />;
      }

      case 'competitors': {
        return <CompetitorsMarketView />;
      }

      case 'technology': {
        const techs = technologySystem.getTechnologies();
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 font-mono">
                  R&D ТЕХНОЛОГИЧЕСКОЕ ДЕРЕВО
                </h3>
                <p className="text-xs text-slate-400">
                  Исследования и патенты, дающие постоянные пассивные бонусы к доходам и логистике
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {techs.map((tech) => (
                <div
                  key={tech.id}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-indigo-400 font-bold">{tech.category}</span>
                      {tech.researched ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          Внедрено
                        </span>
                      ) : tech.progressHours > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                          Изучается ({tech.progressHours}/{tech.researchHours}ч)
                        </span>
                      ) : (
                        <span className="font-mono text-slate-400 text-xs">
                          {currency}{tech.cost.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-100 mb-1">{tech.name}</div>
                    <p className="text-[11px] text-slate-400 mb-3">{tech.description}</p>
                  </div>

                  {!tech.researched && tech.progressHours === 0 && (
                    <button
                      onClick={() => {
                        const res = technologySystem.startResearch(tech.id);
                        showNotification(res.message);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all"
                    >
                      Запустить исследование
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'corporation': {
        return <HoldingView state={state} showNotification={showNotification} currency={currency} />;
      }

      case 'casino': {
        return <CasinoLobbyView gameState={state} />;
      }

      case 'cases': {
        return <CasesLobbyView gameState={state} />;
      }

      case 'esports': {
        return <EsportsEmpireView state={state} showNotification={showNotification} />;
      }

      case 'clicker': {
        return <ClickerEmpireView gameState={state} />;
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Feedback */}
      {feedback && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {renderContent()}
    </div>
  );
};
