import React from 'react';
import { motion } from 'motion/react';
import { Ship, Landmark, HardHat, DollarSign, Settings, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SectionHeader, DataRow } from '../SharedUI';
import { 
  WELL_DESIGN_COMPARISON, 
  RIG_CLASSIFICATIONS, 
  FACILITIES_DIFFERENCES, 
  WELL_COST_REFERENCES 
} from '../../lib/offshore_onshore_data';

export const OffshoreOnshoreTab: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8 border-white/5 bg-black/40"
      >
        <SectionHeader 
          title="Onshore vs Offshore Strategic Comparison" 
          subtitle="Engineering, Logistics & Economic Divergence" 
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
          {/* Well Design Comparison */}
          <div>
            <h5 className="text-[10px] font-bold text-industry-label uppercase mb-4 flex items-center gap-2">
              <Layers size={14} className="text-cyan-400" />
              Well Design Differences
            </h5>
            <div className="space-y-4">
              {WELL_DESIGN_COMPARISON.map((item, i) => (
                <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-cyan-400/30 transition-all">
                  <div className="text-[11px] font-black text-white uppercase mb-3 border-b border-white/5 pb-1">{item.category}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-[11px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                        <Landmark size={10} /> Onshore
                      </div>
                      <p className="text-[10px] text-slate-300 leading-tight">{item.onshore}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] text-blue-400 font-bold uppercase flex items-center gap-1">
                        <Ship size={10} /> Offshore
                      </div>
                      <p className="text-[10px] text-slate-300 leading-tight">{item.offshore}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rig Classifications */}
          <div className="space-y-8">
            <div>
              <h5 className="text-[10px] font-bold text-industry-label uppercase mb-4 flex items-center gap-2">
                <HardHat size={14} className="text-cyan-400" />
                Rig Fleet Specifications
              </h5>
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[11px] text-emerald-400 font-bold uppercase px-2">Land Rigs</p>
                  <div className="grid grid-cols-1 gap-2">
                    {RIG_CLASSIFICATIONS.onshore.map((rig, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <div>
                          <p className="text-[11px] font-bold text-white">{rig.type}</p>
                          <p className="text-[11px] text-slate-500">{rig.power} | {rig.capacity}</p>
                        </div>
                        <div className="text-[10px] font-mono text-emerald-400">{rig.dayRate}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] text-blue-400 font-bold uppercase px-2">Offshore Units</p>
                  <div className="grid grid-cols-1 gap-2">
                    {RIG_CLASSIFICATIONS.offshore.map((rig, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                        <div>
                          <p className="text-[11px] font-bold text-white">{rig.type}</p>
                          <p className="text-[11px] text-slate-500">{rig.depth} | {rig.mobility}</p>
                        </div>
                        <div className="text-[10px] font-mono text-blue-400">{rig.dayRate}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-3xl p-8 border-white/5 bg-black/40"
        >
          <SectionHeader title="Facilities & Logistics" subtitle="Gathering, Processing & Export" />
          <div className="mt-6 space-y-4">
            {FACILITIES_DIFFERENCES.map((item, i) => (
              <div key={i} className="relative pl-4 border-l-2 border-white/5">
                <div className="text-[11px] font-bold text-cyan-400 uppercase mb-2">{item.component}</div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-[10px] text-slate-400"><span className="text-emerald-400/80 mr-1 italic">Onshore:</span> {item.onshore}</div>
                  <div className="text-[10px] text-slate-400"><span className="text-blue-400/80 mr-1 italic">Offshore:</span> {item.offshore}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-3xl p-8 border-white/5 bg-black/40"
        >
          <SectionHeader title="AFE Cost References" subtitle="Total Well CAPEX Benchmarks" />
          <div className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-white/5">
              <table className="industry-table">
                <thead>
                  <tr>
                    <th>Well / Project Type</th>
                    <th>Capex Range</th>
                    <th>Primary Driver</th>
                  </tr>
                </thead>
                <tbody>
                  {WELL_COST_REFERENCES.map((well, i) => (
                    <tr key={i}>
                      <td className="text-[11px] font-bold text-white uppercase">{well.type}</td>
                      <td className="data-mono text-[11px] text-amber-400">{well.cost}</td>
                      <td className="text-[10px] text-slate-500 italic">{well.driver}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={14} className="text-amber-500" />
                <span className="text-[11px] text-white font-bold uppercase">Capex Sensitivity Note</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Deepwater project costs are heavily influenced by subsea hardware lead times and vessel mobilization costs. A single tie-back manifold can add $50M-$100M to total project CAPEX.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
