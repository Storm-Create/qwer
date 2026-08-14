/**
 * Business Empire: Ultimate
 * Interactive Industrial Production Chains Diagram
 */

import React, { useState } from 'react';
import {
  Cpu,
  Shirt,
  Flame,
  Wheat,
  Hammer,
  Car,
  Droplet,
  Feather,
  Boxes,
  Package,
  Layers,
  Smartphone,
  Shield,
  Cog,
  Wrench,
  Utensils,
  Trees,
  Armchair,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  DollarSign,
} from 'lucide-react';
import { PRODUCTION_CHAINS } from '../../game/production/productionCatalog';
import { FactoryChainId, IndustrialFactory } from '../../types/production';
import { Warehouse, InventoryItem } from '../../types/game';
import { goodsMarket } from '../../game/markets/goodsMarket';

interface ProductionChainsDiagramProps {
  factories: IndustrialFactory[];
  warehouses: Warehouse[];
  currency: string;
  onNavigateToMarket?: (category: string) => void;
  onSelectFactory?: (factoryId: string) => void;
}

export const ProductionChainsDiagram: React.FC<ProductionChainsDiagramProps> = ({
  factories,
  warehouses,
  currency,
  onNavigateToMarket,
  onSelectFactory,
}) => {
  const [selectedChainId, setSelectedChainId] = useState<FactoryChainId>('oil_to_electronics');

  const selectedChain = PRODUCTION_CHAINS.find((c) => c.id === selectedChainId) || PRODUCTION_CHAINS[0];
  const allCommodities = goodsMarket.getCommodities();

  // Helper to calculate total inventory quantity in player warehouses
  const getWarehouseStock = (category: string, name: string): number => {
    let total = 0;
    for (const wh of warehouses) {
      for (const item of wh.inventory || []) {
        if (
          item.category === category ||
          item.name.toLowerCase().includes(name.toLowerCase())
        ) {
          total += item.quantity;
        }
      }
    }
    return Math.round(total * 10) / 10;
  };

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplet':
        return <Droplet className="w-5 h-5 text-cyan-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-blue-400" />;
      case 'Shirt':
        return <Shirt className="w-5 h-5 text-purple-400" />;
      case 'Feather':
        return <Feather className="w-5 h-5 text-pink-400" />;
      case 'Boxes':
        return <Boxes className="w-5 h-5 text-amber-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-red-400" />;
      case 'Wheat':
        return <Wheat className="w-5 h-5 text-yellow-400" />;
      case 'Hammer':
        return <Hammer className="w-5 h-5 text-emerald-400" />;
      case 'Car':
        return <Car className="w-5 h-5 text-indigo-400" />;
      case 'Layers':
        return <Layers className="w-5 h-5 text-violet-400" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5 text-cyan-400" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-slate-300" />;
      case 'Cog':
        return <Cog className="w-5 h-5 text-amber-300" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-orange-400" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-amber-400" />;
      case 'Trees':
        return <Trees className="w-5 h-5 text-emerald-400" />;
      case 'Armchair':
        return <Armchair className="w-5 h-5 text-emerald-300" />;
      default:
        return <Package className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Chain Tabs Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {PRODUCTION_CHAINS.map((chain) => {
          const isSelected = chain.id === selectedChainId;
          const matchingFactoryCount = factories.filter((f) =>
            chain.associatedFactories.includes(f.type)
          ).length;

          return (
            <button
              key={chain.id}
              onClick={() => setSelectedChainId(chain.id)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-950/30'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${chain.accentColor} text-white shadow-sm`}
                >
                  {chain.id === 'oil_to_electronics' && <Cpu className="w-4 h-4" />}
                  {chain.id === 'cotton_to_clothing' && <Shirt className="w-4 h-4" />}
                  {chain.id === 'iron_to_autoparts' && <Flame className="w-4 h-4" />}
                  {chain.id === 'grain_to_bread' && <Wheat className="w-4 h-4" />}
                  {chain.id === 'wood_to_furniture' && <Hammer className="w-4 h-4" />}
                  {chain.id === 'car_assembly' && <Car className="w-4 h-4" />}
                </div>

                {matchingFactoryCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {matchingFactoryCount} зав.
                  </span>
                )}
              </div>

              <div className="font-bold text-xs text-slate-200 line-clamp-1">
                {chain.title.split(' → ')[0]} → {chain.title.split(' → ').slice(-1)[0]}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {chain.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Chain Detailed Interactive Flowchart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 lg:p-6 shadow-xl relative overflow-hidden">
        {/* Header Description */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Технологическая карта цепочки
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black text-slate-100 font-mono mt-1">
              {selectedChain.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {selectedChain.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Связанные заводы в собственности:</span>
            <span className="font-mono text-xs px-2.5 py-1 bg-slate-800 rounded-lg text-emerald-400 font-bold border border-slate-700">
              {factories.filter((f) => selectedChain.associatedFactories.includes(f.type)).length} шт.
            </span>
          </div>
        </div>

        {/* Horizontal Flowchart Nodes */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {selectedChain.steps.map((step, idx) => {
            const inStock = getWarehouseStock(step.category, step.name);
            const matchedComm = allCommodities.find(
              (c) => c.category === step.category || c.name.toLowerCase().includes(step.name.toLowerCase())
            );
            const currentPrice = matchedComm ? matchedComm.currentPrice : step.avgMarketPrice;

            return (
              <div key={step.id} className="relative flex flex-col justify-between">
                {/* Node Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-full transition-all hover:border-slate-700">
                  <div>
                    {/* Step Type Pill */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                          step.type === 'raw'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : step.type === 'intermediate'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {step.type === 'raw'
                          ? '1. Сырье'
                          : step.type === 'intermediate'
                          ? `${idx + 1}. Полуфабрикат`
                          : `${idx + 1}. Конечный продукт`}
                      </span>

                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        {getStepIcon(step.iconName)}
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 font-mono">
                      {step.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Категория: {step.category}
                    </span>

                    {/* Factory producing this if not raw */}
                    {step.factoryName && (
                      <div className="mt-2.5 p-2 rounded bg-slate-900/90 border border-slate-800 text-[11px]">
                        <span className="text-slate-400 block text-[10px]">Производственный узел:</span>
                        <span className="text-slate-200 font-medium">{step.factoryName}</span>
                        {step.recipeName && (
                          <span className="text-emerald-400 block text-[10px] mt-0.5">
                            ⚙ {step.recipeName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Market & Warehouse Stats */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Биржевая цена:</span>
                      <span className="font-mono text-slate-200 font-semibold">
                        {currency}{currentPrice.toLocaleString()}/{step.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">На складах:</span>
                      <span
                        className={`font-mono font-bold ${
                          inStock > 0 ? 'text-emerald-400' : 'text-slate-500'
                        }`}
                      >
                        {inStock} {step.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Arrow Connector (between cards on desktop) */}
                {idx < selectedChain.steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-slate-400 shadow">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
