import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Layers, 
  Target, 
  Droplet, 
  Settings2,
  Box,
  Layout,
  GitMerge,
  Search,
  Activity,
  Construction,
  Hammer
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { 
  calculateHawkinsSkin,
  calculateFCD,
  estimatePKNLength
} from '../../lib/reservoir';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  AreaChart,
  Area
} from 'recharts';

export function FormationCompletionModule() {
  const [activePhase, setActivePhase] = useState<1 | 2 | 3>(1);
  const [inp, setInp] = useState({
    k: 25,
    ks: 5,
    rw: 0.33,
    rs: 1.5,
    // Frac
    kf: 150000,
    w: 0.25, // in
    xf: 250,
    mu: 50,
    ePrime: 3e6,
    q: 10
  });

  const skinResults = useMemo(() => {
    const s_mech = calculateHawkinsSkin(inp.k, inp.ks, inp.rs, inp.rw);
    return { s_mech };
  }, [inp]);

  const fracResults = useMemo(() => {
    const fcd = calculateFCD(inp.kf, inp.w / 12, inp.k, inp.xf); // Convert w to ft
    return { fcd };
  }, [inp]);

  const phases = [
    { id: 1, name: 'Formation Damage', icon: Construction },
    { id: 2, name: 'Completion Design', icon: Layout },
    { id: 3, name: 'Hydraulic Frac', icon: Hammer }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Layers className="text-violet-500" size={32} />
            Formation Damage & Completion <span className="text-violet-500/50">Module 9</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl font-medium uppercase tracking-widest">Wellbore-Reservoir Interface Engineering & Stimulation</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            {phases.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePhase(p.id as any)}
                  className={cn(
                    "px-6 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-xs font-black uppercase tracking-widest",
                    activePhase === p.id 
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" 
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
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
               <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 italic flex items-center gap-2">
                  <Settings2 size={16} className="text-violet-500" /> Interface Params
               </h4>
               <div className="space-y-8">
                  <FormSlider label="Formation Perm (k)" value={inp.k} min={1} max={500} step={1} unit="mD" onChange={v => setInp({...inp, k: v})} />
                  <FormSlider label="Skin Zone Perm (ks)" value={inp.ks} min={0.1} max={200} step={1} unit="mD" onChange={v => setInp({...inp, ks: v})} />
                  <FormSlider label="Wellbore Radius (rw)" value={inp.rw} min={0.1} max={0.6} step={0.01} unit="ft" onChange={v => setInp({...inp, rw: v})} />
                  <FormSlider label="Damage Radius (rs)" value={inp.rs} min={0.5} max={5} step={0.1} unit="ft" onChange={v => setInp({...inp, rs: v})} />
               </div>
            </div>

            <div className="p-8 glass-card bg-violet-500/5 rounded-3xl border border-violet-500/20 text-center">
                <p className="text-[11px] font-black text-violet-400 uppercase tracking-widest mb-2">Hawkins Mechanical Skin</p>
                <h3 className="text-5xl font-black text-white italic">
                   {skinResults.s_mech > 0 ? '+' : ''}{skinResults.s_mech.toFixed(2)}
                </h3>
            </div>
         </div>

         <div className="lg:col-span-8 h-full">
            <AnimatePresence mode="wait">
                <motion.div
                   key={activePhase}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="h-full"
                >
                    {activePhase === 1 && (
                        <div className="space-y-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 {[
                                     { title: 'Invasion Mechanism', desc: 'Drilling mud filtrate invasion and solids plugging.', level: 85 },
                                     { title: 'Chemical Alteration', desc: 'Clay swelling and scale deposition near wellbore.', level: 40 },
                                     { title: 'Mechanical Flux', desc: 'Fines migration under high drawdown regimes.', level: 60 }
                                 ].map(it => (
                                     <div key={it.title} className="p-10 glass-card bg-[#05070a] rounded-3xl border border-white/5 group hover:border-violet-500/50 transition-all">
                                         <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-4 italic">{it.title}</h4>
                                         <p className="text-sm text-slate-500 font-light leading-relaxed mb-6 italic">{it.desc}</p>
                                         <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-violet-500/30" style={{ width: `${it.level}%` }} />
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    )}

                    {activePhase === 2 && (
                        <div className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full flex flex-col justify-center relative overflow-hidden">
                            <Layout size={180} className="text-white/5 absolute -right-20 -bottom-20 rotate-12" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 z-10">
                                <div>
                                    <h4 className="text-4xl font-black text-white italic tracking-tighter mb-6">Completion Architecture</h4>
                                    <p className="text-xs text-slate-500 font-medium leading-[2] uppercase tracking-widest mb-10">Optimizing Perforation Phasing and Stand-off for Minimum Completion Skin</p>
                                    <div className="flex gap-4">
                                        <button className="px-6 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-violet-500 hover:text-white transition-all">Cased & Perfed</button>
                                        <button className="px-6 py-3 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:border-violet-500 transition-all">Open Hole</button>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                     <div className="p-6 glass-card bg-black flex justify-between items-center rounded-3xl border border-white/5">
                                        <span className="text-[10px] font-black text-slate-500 uppercase">Perforation Density</span>
                                        <span className="text-xl font-black text-white italic">6 SPF</span>
                                     </div>
                                     <div className="p-6 glass-card bg-black flex justify-between items-center rounded-3xl border border-white/5">
                                        <span className="text-[10px] font-black text-slate-500 uppercase">Shot Phasing</span>
                                        <span className="text-xl font-black text-white italic">60/120°</span>
                                     </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activePhase === 3 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                            <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] flex flex-col">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic mb-10">Dimensionless Conductivity (FCD)</h4>
                                <div className="flex-grow flex flex-col justify-center text-center">
                                    <h3 className="text-7xl font-black text-emerald-400 italic tracking-tighter mb-2">{fracResults.fcd.toFixed(1)}</h3>
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Optimum Range: 2.0 - 10.0</p>
                                </div>
                                <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/10 space-y-2">
                                     <div className="flex justify-between text-[11px] uppercase font-black text-slate-500"><span>Target FCD</span> <span>5.0</span></div>
                                     <div className="flex justify-between text-[11px] uppercase font-black text-slate-500"><span>Actual Flux Efficiency</span> <span>84%</span></div>
                                </div>
                            </div>
                            <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] space-y-8">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic mb-6">Fracture Geometry Inputs</h4>
                                <FormSlider label="Prop. Perm (kf)" value={inp.kf} min={50000} max={300000} step={10000} unit="mD" onChange={v => setInp({...inp, kf: v})} />
                                <FormSlider label="Width (w)" value={inp.w} min={0.1} max={0.5} step={0.01} unit="in" onChange={v => setInp({...inp, w: v})} />
                                <FormSlider label="Half-Length (xf)" value={inp.xf} min={50} max={1000} step={25} unit="ft" onChange={v => setInp({...inp, xf: v})} />
                                <p className="text-[11px] text-slate-700 italic font-mono leading-relaxed mt-4">Simplified PKN/KGD models assume infinite height containment and constant leak-off coefficients.</p>
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

function FormSlider({ label, value, min, max, step, unit, onChange }: { label: string, value: number, min: number, max: number, step: number, unit: string, onChange: (v: number) => void }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center text-[11px] font-black text-white uppercase tracking-widest">
                <span>{label}</span>
                <span className="text-violet-400 font-mono">{formatNumber(value, 2)} {unit}</span>
            </div>
            <input 
              type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-violet-500"
            />
        </div>
    );
}
