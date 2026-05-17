import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Activity, 
  Target, 
  Droplet, 
  Layers, 
  Calculator,
  LineChart as LineChartIcon,
  Search,
  Box,
  Settings2,
  Table as TableIcon
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { 
  calculateVogelQ,
  calculatePI
} from '../../lib/reservoir';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';

export function FlowPerformanceModule() {
  const [activePhase, setActivePhase] = useState<1 | 2 | 3 | 4>(1);

  // Darcy's Law State
  const [darcyInp, setDarcyInp] = useState({
    k: 50,
    a: 20,
    dp: 500,
    mu: 1.2,
    l: 1000,
    flowType: 'radial' as 'linear' | 'radial'
  });

  // IPR State
  const [iprInp, setIprInp] = useState({
    pr: 3500,
    pwf: 2800,
    q: 450,
    pb: 3200,
    model: 'vogel' as 'vogel' | 'fetkovich' | 'composite'
  });

  // Nodal State
  const [nodalInp, setNodalInp] = useState({
    depth: 8000,
    id: 2.441, // 2-7/8" tubing
    roughness: 0.0006,
    gor: 600,
    wc: 0.1
  });

  // Calculations
  const darcyResults = useMemo(() => {
    // q = k*A*dp / (mu*L) for linear
    const q = (darcyInp.k * 0.001127 * darcyInp.a * darcyInp.dp) / (darcyInp.mu * darcyInp.l);
    return { q };
  }, [darcyInp]);

  const iprData = useMemo(() => {
    const data = [];
    const points = 20;
    const pi = iprInp.q / (iprInp.pr - iprInp.pwf);
    const qmax = pi * iprInp.pr / 1.8; // Vogel Qmax approx

    for (let i = 0; i <= points; i++) {
        const pwf = iprInp.pr * (i / points);
        const q_vogel = calculateVogelQ(pwf, iprInp.pr, qmax);
        const vlp = 500 + (Math.pow(q_vogel, 1.8) * 0.005); // Dummy VLP
        
        data.push({
            pwf: Math.round(pwf),
            q: Math.round(q_vogel),
            vlp: Math.round(vlp)
        });
    }
    return data;
  }, [iprInp]);

  const phases = [
    { id: 1, name: "Darcy's Law", icon: Box },
    { id: 2, name: 'IPR Analysis', icon: Target },
    { id: 3, name: 'VLP / Nodal', icon: Activity },
    { id: 4, name: 'Skin & Acid', icon: Droplet }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Zap className="text-amber-500" size={32} />
            Reservoir Flow & Performance <span className="text-amber-500/50">Module 6</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl font-medium uppercase tracking-widest">Inflow-Outflow Integration & System Optimization Engine</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            {phases.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePhase(p.id as any)}
                  className={cn(
                    "px-6 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-xs font-black uppercase tracking-widest",
                    activePhase === p.id 
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" 
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
         {/* Left Controls */}
         <div className="lg:col-span-4 space-y-6">
            <AnimatePresence mode="wait">
                <motion.div
                   key={activePhase}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="glass-card rounded-3xl p-8 border-white/5 bg-black/40 h-full"
                >
                    <div className="flex items-center gap-3 mb-8">
                       <Settings2 size={16} className="text-amber-500" />
                       <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">{phases[activePhase-1].name} Inputs</h4>
                    </div>

                    {activePhase === 1 && (
                        <div className="space-y-8">
                            <FlowSlider label="Permeabilty" value={darcyInp.k} min={10} max={1000} step={10} unit="mD" onChange={v => setDarcyInp({...darcyInp, k:v})} />
                            <FlowSlider label="Viscosity" value={darcyInp.mu} min={0.5} max={10} step={0.1} unit="cP" onChange={v => setDarcyInp({...darcyInp, mu:v})} />
                            <FlowSlider label="Press. Drop" value={darcyInp.dp} min={100} max={1500} step={50} unit="psi" onChange={v => setDarcyInp({...darcyInp, dp:v})} />
                            <FlowSlider label="Section Area" value={darcyInp.a} min={1} max={100} step={1} unit="ft²" onChange={v => setDarcyInp({...darcyInp, a:v})} />
                        </div>
                    )}

                    {activePhase === 2 && (
                        <div className="space-y-8">
                            <FlowSlider label="Reservoir Press" value={iprInp.pr} min={1000} max={6000} step={100} unit="psi" onChange={v => setIprInp({...iprInp, pr:v})} />
                            <FlowSlider label="Flow Rate Test" value={iprInp.q} min={100} max={2500} step={50} unit="stb/d" onChange={v => setIprInp({...iprInp, q:v})} />
                            <FlowSlider label="Test Pwf" value={iprInp.pwf} min={500} max={5500} step={50} unit="psi" onChange={v => setIprInp({...iprInp, pwf:v})} />
                            <FlowSlider label="Bubble Pt" value={iprInp.pb} min={500} max={4000} step={100} unit="psi" onChange={v => setIprInp({...iprInp, pb:v})} />
                        </div>
                    )}

                    {activePhase === 3 && (
                        <div className="space-y-8">
                            <FlowSlider label="Tubing ID" value={nodalInp.id} min={1.5} max={4.5} step={0.1} unit="in" onChange={v => setNodalInp({...nodalInp, id:v})} />
                            <FlowSlider label="Water Cut" value={nodalInp.wc * 100} min={0} max={100} step={5} unit="%" onChange={v => setNodalInp({...nodalInp, wc:v/100})} />
                            <FlowSlider label="Produced GOR" value={nodalInp.gor} min={100} max={5000} step={100} unit="scf/b" onChange={v => setNodalInp({...nodalInp, gor:v})} />
                        </div>
                    )}

                    {activePhase === 4 && (
                        <div className="space-y-8">
                            <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl">
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Mechanical Skin</p>
                                <p className="text-3xl font-black text-white italic">+4.5</p>
                            </div>
                            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Acid Stimulation Δs</p>
                                <p className="text-3xl font-black text-white italic">-2.8</p>
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono italic leading-relaxed">Pseudo-skin effects from perforation, deviation, and partial penetration should be aggregated using standard additive methods.</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
         </div>

         {/* Main Visuals Column */}
         <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
                <motion.div
                   key={activePhase}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="h-full flex flex-col"
                >
                    {activePhase === 1 && (
                        <div className="space-y-8 flex-grow">
                            <div className="p-12 glass-card bg-[#05070a] rounded-3xl border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 text-black group-hover:text-amber-500/10">
                                    <Box size={140} />
                                </div>
                                <h3 className="text-7xl font-black text-white italic tracking-tighter">
                                    {(darcyResults.q * 1000).toFixed(0)} <span className="text-3xl text-slate-700">mSTB/D</span>
                                </h3>
                                <p className="text-xs text-slate-500 uppercase font-black tracking-widest mt-4">Steady-State Linear Flux Estimate</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 grow">
                                <div className="p-10 glass-card bg-black/40 rounded-3xl border border-white/5 space-y-4">
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Theoretical Formulation</p>
                                    <div className="text-3xl text-white italic font-serif">q = (k * A * ΔP) / (μ * L)</div>
                                    <p className="text-[11px] text-slate-500 leading-relaxed italic">The fundamental equation for porous media flow, relating driving force to viscous resistance.</p>
                                </div>
                                <div className="p-8 bg-amber-500/5 rounded-3xl border border-amber-500/10">
                                   <h5 className="text-[10px] font-black text-amber-300 uppercase mb-4 tracking-widest">Non-Darcy effects</h5>
                                   <p className="text-xs text-amber-100/40 leading-relaxed font-light">At high velocities, turbulent effects (inertial factors) dominate, leading to Forchheimer flow regimes where apparent permeability decreases.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activePhase === 2 && (
                        <div className="space-y-8 flex-grow">
                             <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[500px]">
                                <div className="flex justify-between items-center mb-10">
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Vogel IPR Curve Analysis</h4>
                                    <div className="text-xs font-black text-emerald-400 uppercase italic">AOF: {formatNumber(iprData[iprData.length-1].q, 0)} stb/d</div>
                                </div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={iprData} layout="vertical" margin={{ left: 50, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" />
                                        <XAxis type="number" dataKey="q" domain={[0, 'auto']} stroke="#475569" fontSize={10} label={{ value: 'Rate (STB/D)', position: 'insideBottom', offset: -5, fill: '#475569' }} />
                                        <YAxis type="number" dataKey="pwf" domain={[0, 'auto']} stroke="#475569" fontSize={10} label={{ value: 'Pwf (psi)', angle: -90, position: 'insideLeft', offset: -10, fill: '#475569' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                                        <Line type="monotone" dataKey="pwf" stroke="#f59e0b" strokeWidth={4} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                             </div>
                        </div>
                    )}

                    {activePhase === 3 && (
                        <div className="space-y-8 flex-grow">
                             <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[500px]">
                                <div className="flex justify-between items-center mb-10">
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Nodal Analysis Intersection</h4>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-amber-500"><div className="w-2 h-2 rounded-full bg-amber-500" /> IPR</div>
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-cyan-500"><div className="w-2 h-2 rounded-full bg-cyan-500" /> VLP</div>
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={iprData} margin={{ left: 50, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" />
                                        <XAxis dataKey="q" type="number" stroke="#475569" fontSize={10} label={{ value: 'Rate (STB/D)', position: 'insideBottom', offset: -5, fill: '#475569' }} />
                                        <YAxis domain={[0, 'auto']} stroke="#475569" fontSize={10} label={{ value: 'Pressure (psi)', angle: -90, position: 'insideLeft', offset: -10, fill: '#475569' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                                        <Line type="monotone" dataKey="pwf" stroke="#f59e0b" strokeWidth={3} dot={false} />
                                        <Line type="monotone" dataKey="vlp" stroke="#06b6d4" strokeWidth={3} dot={false} />
                                        {/* Intersection point would be marked here */}
                                    </LineChart>
                                </ResponsiveContainer>
                             </div>
                        </div>
                    )}

                    {activePhase === 4 && (
                        <div className="space-y-8 flex-grow">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-10 glass-card bg-black/40 rounded-3xl border border-white/5 space-y-6">
                                    <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Near Wellbore Damage</h4>
                                    <p className="text-sm text-slate-400 font-light italic leading-relaxed">
                                        Skin factor components describe the pressure drop in excess of the ideal Darcy flow due to reduced permeability (damage) or restricted entry.
                                    </p>
                                    <div className="pt-6 border-t border-white/5">
                                        <div className="flex justify-between text-[10px] text-white font-mono">
                                            <span>S_combined</span>
                                            <span className="font-bold">+1.7</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-10 glass-card bg-emerald-500/5 rounded-3xl border border-emerald-500/20">
                                   <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
                                      <Droplet size={32} />
                                   </div>
                                   <h4 className="text-xl font-black text-white italic mb-4">Stimulation Design</h4>
                                   <p className="text-xs text-slate-500 font-medium leading-relaxed">Matrix acidizing targets the S_damage component by restoring K and extending beyond the depth of filtrate invasion.</p>
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

function FlowSlider({ label, value, min, max, step, unit, onChange }: { label: string, value: number, min: number, max: number, step: number, unit: string, onChange: (v: number) => void }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center text-[11px] font-black text-white uppercase tracking-widest">
                <span>{label}</span>
                <span className="text-amber-400 font-mono">{value} {unit}</span>
            </div>
            <input 
              type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
        </div>
    );
}

