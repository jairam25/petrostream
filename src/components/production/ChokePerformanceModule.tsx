import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitCommit, Disc, Activity
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { 
  calculateChokeFlowRate
} from '../../lib/production';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export function ChokePerformanceModule() {
  const [activePhase, setActivePhase] = useState<'4A' | '4B'>('4A');

  const phases = [
    { id: '4A', name: 'Surface Choke', icon: GitCommit },
    { id: '4B', name: 'Subsurface Choke', icon: Disc }
  ];

  // Inputs
  const [pwh, setPwh] = useState(1500); // psi
  const [d, setD] = useState(32); // 64ths of an inch (1/2 inch)
  const [glr, setGlr] = useState(800); // scf/stb

  // Calculate flow rates using the three correlations
  const chokeData = useMemo(() => {
    const gilbert = calculateChokeFlowRate(pwh, d, glr, 'gilbert');
    const ros = calculateChokeFlowRate(pwh, d, glr, 'ros');
    const baxendell = calculateChokeFlowRate(pwh, d, glr, 'baxendell');

    return [
      { name: 'Gilbert', rate: Math.round(gilbert), color: '#3b82f6' },
      { name: 'Ros', rate: Math.round(ros), color: '#a855f7' },
      { name: 'Baxendell', rate: Math.round(baxendell), color: '#ec4899' }
    ];
  }, [pwh, d, glr]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <GitCommit className="text-pink-500" size={32} />
            Phase 4: Choke Performance <span className="text-pink-500/50">Flow Control</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Surface & Subsurface Regulation</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit mt-4 flex-wrap gap-1">
          {phases.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id as any)}
              className={cn(
                "px-5 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
                activePhase === p.id 
                  ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20" 
                  : "text-slate-500 hover:text-white"
              )}
            >
              <p.icon size={14} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Parameters */}
        <div className="lg:col-span-4 space-y-6">
           <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] h-full">
              <h3 className="text-xl font-black text-white italic mb-6">Choke Parameters</h3>
              <div className="space-y-8">
                 <InputWithSlider label="Wellhead Pressure (psi)" value={pwh} min={100} max={5000} step={50} unit="psi" onChange={setPwh} />
                 <InputWithSlider label="Choke Size (1/64 inch)" value={d} min={8} max={128} step={1} unit="/64" onChange={setD} />
                 <InputWithSlider label="Gas-Liquid Ratio (scf/stb)" value={glr} min={100} max={10000} step={100} unit="scf/stb" onChange={setGlr} />
                 
                 <div className="p-4 bg-pink-500/5 border border-pink-500/20 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-1">Equivalent Diameter</p>
                    <p className="text-lg font-bold text-white">{(d/64).toFixed(3)}"</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Visualization & Info */}
        <div className="lg:col-span-8 space-y-6">
             <AnimatePresence mode="wait">
                 <motion.div
                     key={activePhase}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className="space-y-6 h-full flex flex-col"
                 >
                     {activePhase === '4A' && (
                         <>
                             <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] h-[400px] flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                   <div>
                                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Critical Flow Multiphase Correlations</h4>
                                      <p className="text-[11px] text-slate-500 uppercase font-black mt-1">Predicted Liquid Flow Rate (STB/D)</p>
                                   </div>
                                </div>
                                
                                <div className="flex-1 min-h-0">
                                   <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={chokeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                        <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                                        <YAxis stroke="#475569" fontSize={10} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                        />
                                        <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                                            {chokeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                      </BarChart>
                                   </ResponsiveContainer>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoCard title="Critical vs Subcritical" desc="Critical flow implies sonic velocity at the throat; flow rate is independent of downstream pressure. Usually occurs when Pdsc / Pusc < 0.5." />
                                <InfoCard title="Empirical Models" desc="Gilbert is widely used for typical oil wells. Ros was developed for higher GORs. Baxendell is optimized for high-rate flow." />
                             </div>
                         </>
                     )}

                     {activePhase === '4B' && (
                         <div className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full flex flex-col items-center justify-center text-center">
                             <Disc size={100} className="text-pink-500/20 mb-8" />
                             <h3 className="text-3xl font-black text-white italic mb-4">Downhole Flow Control</h3>
                             <p className="text-slate-400 text-sm max-w-2xl leading-relaxed mb-8">
                                 Subsurface chokes and Inflow Control Devices (ICDs) are placed in the completion string to equalize production across heterogeneous zones, delaying water or gas breakthrough.
                             </p>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                 <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                     <h5 className="text-[11px] font-black text-pink-400 uppercase tracking-widest mb-2">Passive ICD</h5>
                                     <p className="text-[10px] text-slate-500 font-medium">Fixed restriction (nozzle or channel) limiting flux from high-perm streaks.</p>
                                 </div>
                                 <div className="p-6 bg-pink-500/10 rounded-3xl border border-pink-500/30">
                                     <h5 className="text-[11px] font-black text-pink-400 uppercase tracking-widest mb-2">Autonomous AICD</h5>
                                     <p className="text-[10px] text-slate-400 font-medium">Reacts to fluid properties. Chokes back low-viscosity fluids (water/gas) automatically.</p>
                                 </div>
                                 <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                     <h5 className="text-[11px] font-black text-pink-400 uppercase tracking-widest mb-2">Smart ICV</h5>
                                     <p className="text-[10px] text-slate-500 font-medium">Interval Control Valve. Hydraulically or electrically actuated from surface.</p>
                                 </div>
                             </div>
                         </div>
                     )}
                 </motion.div>
             </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="glass-card p-6 rounded-3xl border-white/5 bg-pink-500/5">
       <h5 className="text-[11px] font-black text-pink-400 uppercase tracking-widest mb-2">{title}</h5>
       <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
