import React from 'react';
import { motion } from 'motion/react';
import { Settings, ShieldCheck, Box, Zap, Info, Layers } from 'lucide-react';
import { SectionHeader, DataRow } from '../SharedUI';
import { 
  API_PRESSURE_RATINGS, 
  BORE_SIZES_API, 
  MATERIAL_CLASSES_API, 
  RING_GASKET_SPECS,
  VALVE_TRIM_MATERIALS,
  ACTUATOR_TYPES
} from '../../lib/wellhead_data';

export const WellheadTab: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8 border-white/5 bg-black/40"
      >
        <SectionHeader 
          title="API 6A & 17D Wellhead Specifications" 
          subtitle="Onshore, Platform & Subsea Tree Standards" 
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
          <div>
            <h5 className="text-[10px] font-bold text-industry-label uppercase mb-4 flex items-center gap-2">
              <Zap size={14} className="text-amber-400" />
              Pressure Ratings & Bore Sizes
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 font-bold uppercase px-1">API Pressure Ratings</p>
                {API_PRESSURE_RATINGS.map((p, i) => (
                  <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl">
                    <div className="text-[11px] font-bold text-white">{p.rating}</div>
                    <p className="text-[11px] text-slate-500 leading-tight italic">{p.applications}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 font-bold uppercase px-1">Standard Bore Sizes</p>
                {BORE_SIZES_API.map((b, i) => (
                  <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl">
                    <div className="text-[11px] font-bold text-cyan-400 font-mono">{b.size}</div>
                    <p className="text-[11px] text-slate-500 leading-tight">{b.usage}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h5 className="text-[10px] font-bold text-industry-label uppercase mb-4 flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                API Material Classifications
              </h5>
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/5">
                <table className="industry-table">
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Application</th>
                      <th>Typical Metallurgy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MATERIAL_CLASSES_API.map((m, i) => (
                      <tr key={i}>
                        <td className="text-[11px] font-black text-white">{m.class}</td>
                        <td className="text-[10px] text-slate-300">{m.description}</td>
                        <td className="text-[10px] text-slate-500 italic">{m.materials}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <p className="text-[11px] text-emerald-500 font-bold uppercase mb-1">Metallurgy Note</p>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Materials class DD and above typically require NACE MR0175 compliance for sour service, including strict hardness limits (typically &le; 22 HRC for L-80/316SS components).
                </p>
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
          <SectionHeader title="Valve & Actuation Systems" subtitle="Gate Valves, Trim & Controls" />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h6 className="text-[11px] font-bold text-industry-label uppercase border-b border-white/5 pb-1">Trim Materials</h6>
              {VALVE_TRIM_MATERIALS.map((v, i) => (
                <div key={i} className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-white uppercase">{v.material}</span>
                  <span className="text-[10px] text-slate-500 text-right max-w-[150px] leading-tight italic">{v.condition}</span>
                </div>
              ))}
              <div className="mt-4 space-y-2">
                <p className="text-[11px] text-cyan-400 font-bold uppercase">Valve Logic</p>
                <p className="text-[10px] text-slate-400">• Expanding Gate: Preferred for Master Valves (Bi-directional)</p>
                <p className="text-[10px] text-slate-400">• Slab Gate: Commonly used for Wing Valves</p>
              </div>
            </div>
            <div className="space-y-4">
              <h6 className="text-[11px] font-bold text-industry-label uppercase border-b border-white/5 pb-1">Actuator Specifications</h6>
              {ACTUATOR_TYPES.map((a, i) => (
                <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-bold text-white">{a.type}</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded uppercase">{a.failsafe}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">{a.control}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-3xl p-8 border-white/5 bg-black/40"
        >
          <SectionHeader title="API Flange & Gasket Types" subtitle="Pressure Containment Interfaces" />
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-3">
              {RING_GASKET_SPECS.map((r, i) => (
                <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center group hover:border-cyan-400/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-white/10 flex items-center justify-center text-lg font-black italic scale-95 group-hover:scale-100 group-hover:border-cyan-400/50 transition-all text-white">
                      {r.type}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white uppercase">{r.description}</p>
                      <p className="text-[10px] text-slate-500 italic">Seal: {r.seal}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-cyan-400">{r.pressure}</div>
                    <div className="text-[10px] text-slate-600 uppercase font-bold tracking-widest mt-1">Rating</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-start gap-3">
               <div className="p-1.5 bg-blue-500/20 rounded shadow-sm">
                  <Info size={12} className="text-blue-400" />
               </div>
               <p className="text-[10px] text-slate-400 leading-tight">
                 Ring joints (RTJ) must be inspected for surface imperfections. BX type gaskets are only compatible with API 6BX flanges and are and not interchangeable with R or RX types.
               </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
