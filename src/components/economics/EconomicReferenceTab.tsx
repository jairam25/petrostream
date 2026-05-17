import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Globe, 
  PieChart, 
  ArrowUpRight, 
  Droplet, 
  Flame,
  Zap,
  Briefcase,
  Scale,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { COMMODITY_PRICES, OPERATING_COSTS, FISCAL_TERMS_REF } from '../../lib/economics_data';
import { SectionHeader } from '../SharedUI';

export function EconomicReferenceTab() {
  const [activeTab, setActiveTab] = useState<'prices' | 'costs' | 'fiscal'>('prices');

  return (
    <div className="space-y-8 p-8 pb-20">
      <SectionHeader 
        title="Global Economics & Market Reference" 
        subtitle="Live Benchmarks, OPEX Baselines & Fiscal Regimes" 
      />

      {/* Tabs */}
      <div className="flex gap-4 p-1 bg-white/5 border border-white/5 rounded-2xl w-fit">
        {[
          { id: 'prices', label: 'Commodity Prices', icon: TrendingUp },
          { id: 'costs', label: 'Operating Costs', icon: Briefcase },
          { id: 'fiscal', label: 'Fiscal Terms', icon: Scale }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === tab.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-white"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'prices' && (
          <motion.div
            key="prices"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Oil */}
            <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <Droplet size={16} className="text-emerald-400" />
                </div>
                <h3 className="text-xs font-black text-white uppercase italic tracking-widest">Crude Benchmarks</h3>
              </div>
              <div className="space-y-3">
                {COMMODITY_PRICES.oil.map((o, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase">{o.label}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{o.diff === 'Base' ? 'Benchmark' : `Diff: ${o.diff}`}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-400 font-mono">{o.price}</p>
                      <span className="text-[10px] text-slate-600 font-bold uppercase">{o.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gas */}
            <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Flame size={16} className="text-blue-400" />
                </div>
                <h3 className="text-xs font-black text-white uppercase italic tracking-widest">Gas Benchmarks</h3>
              </div>
              <div className="space-y-3">
                {COMMODITY_PRICES.gas.map((g, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase">{g.label}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Basis: {g.diff}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-blue-400 font-mono">{g.price}</p>
                      <span className="text-[10px] text-slate-600 font-bold uppercase">{g.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NGL */}
            <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                  <Zap size={16} className="text-cyan-400" />
                </div>
                <h3 className="text-xs font-black text-white uppercase italic tracking-widest">NGL (Mt. Belvieu)</h3>
              </div>
              <div className="space-y-3">
                {COMMODITY_PRICES.ngl.map((n, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase">{n.label}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-cyan-400 font-mono">{n.price}</p>
                      <span className="text-[10px] text-slate-600 font-bold uppercase">{n.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-center">
                 <p className="text-[11px] text-slate-500 italic">BOE Conversion: 1 MCF gas &asymp; 1/6 BOE</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'costs' && (
          <motion.div
            key="costs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {OPERATING_COSTS.map((cost, i) => (
              <div key={i} className="glass-card rounded-2xl p-8 border-white/5 bg-black/40 hover:border-emerald-500/30 transition-all group">
                <div className="flex justify-between items-start mb-6">
                   <h3 className="text-sm font-black text-white italic uppercase tracking-tighter">{cost.region}</h3>
                   <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{cost.currency}</span>
                </div>
                <div className="grid grid-cols-3 gap-6">
                   <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Lifting Cost</p>
                      <p className="text-xs font-black text-white font-mono">{cost.lifting}</p>
                      <p className="text-[10px] text-slate-600 uppercase">/ BOE</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Water Disp.</p>
                      <p className="text-xs font-black text-white font-mono">{cost.water}</p>
                      <p className="text-[10px] text-slate-600 uppercase">/ BBL</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Gathering</p>
                      <p className="text-xs font-black text-white font-mono">{cost.gathering}</p>
                      <p className="text-[10px] text-slate-600 uppercase">/ MCF</p>
                   </div>
                </div>
              </div>
            ))}
            <div className="glass-card rounded-2xl p-8 border-dashed border-white/10 flex flex-col justify-center items-center text-center space-y-4">
               <Info size={24} className="text-slate-600" />
               <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Overhead Allocation</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mt-2 italic leading-relaxed">
                    Corporate G&A is typically allocated as $2,000 - $5,000 per well / month or $1 - $3 per BOE produced.
                  </p>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'fiscal' && (
          <motion.div
            key="fiscal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {FISCAL_TERMS_REF.map((f, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 border-white/5 bg-black/40 flex gap-6">
                <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-white/5 rounded-2xl">
                   <Globe size={20} className="text-slate-400" />
                </div>
                <div className="space-y-3">
                   <h3 className="text-xs font-black text-white uppercase italic tracking-widest">{f.country}</h3>
                   <div className="flex gap-4">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase mb-1">Royalty</p>
                        <p className="text-[11px] font-black text-emerald-400 font-mono italic">{f.royalty}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase mb-1">Tax Rate</p>
                        <p className="text-[11px] font-black text-white font-mono italic">{f.tax}</p>
                      </div>
                   </div>
                   <p className="text-[10px] text-slate-500 italic leading-snug">{f.notes}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
