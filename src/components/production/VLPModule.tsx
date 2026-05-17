import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, ArrowUpCircle, Filter, ChevronDown, Layers, Thermometer
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { 
  calculateVLPProxy,
  calculateTurnerCriticalRate
} from '../../lib/production';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { VLPFlowSimulator } from './VLPFlowSimulator';

export function VLPModule() {
  const [activePhase, setActivePhase] = useState<'2A' | '2B' | '2C' | '2D' | '2E'>('2A');

  const phases = [
    { id: '2A', name: 'Flow Patterns', icon: Filter },
    { id: '2B', name: 'Pressure Grad.', icon: ChevronDown },
    { id: '2C', name: 'Correlations', icon: Layers },
    { id: '2D', name: 'TPC Curves', icon: Activity },
    { id: '2E', name: 'Temperature', icon: Thermometer }
  ];

  // Global inputs for VLP
  const [depth, setDepth] = useState(8000); // ft
  const [tubingId, setTubingId] = useState(2.441); // inches
  const [gor, setGor] = useState(500); // scf/stb
  const [wc, setWc] = useState(0.2); // fraction
  const [whp, setWhp] = useState(250); // psi

  // Turner criteria inputs
  const [gasPress, setGasPress] = useState(1000); // psi
  const [gasTemp, setGasTemp] = useState(560); // Rankine

  // Generate TPC Data
  const tpcData = useMemo(() => {
    const data = [];
    const points = 30;
    const maxRate = 5000;
    
    for (let i = 1; i <= points; i++) {
        const rate = (i / points) * maxRate;
        const pwf = calculateVLPProxy(rate, whp, depth, tubingId, gor, wc);

        data.push({
            rate: Math.round(rate),
            pwf: Math.round(pwf)
        });
    }
    return data;
  }, [depth, tubingId, gor, wc, whp]);

  const turnerRate = useMemo(() => {
    return calculateTurnerCriticalRate(gasPress, gasTemp, 0.85, tubingId);
  }, [gasPress, gasTemp, tubingId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <ArrowUpCircle className="text-purple-500" size={32} />
            Phase 2: Vertical Lift <span className="text-purple-500/50">VLP Hydraulics</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Wellbore Flow Performance</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit mt-4 flex-wrap gap-1">
          {phases.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id as any)}
              className={cn(
                "px-5 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
                activePhase === p.id 
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" 
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
           <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] h-full overflow-y-auto custom-scrollbar max-h-[800px]">
              <h3 className="text-xl font-black text-white italic mb-6">Wellbore Parameters</h3>
              <div className="space-y-8">
                 <InputWithSlider label="Wellhead Pressure (psi)" value={whp} min={50} max={2000} step={10} unit="psi" onChange={setWhp} />
                 <InputWithSlider label="True Vertical Depth (ft)" value={depth} min={1000} max={15000} step={100} unit="ft" onChange={setDepth} />
                 <InputWithSlider label="Tubing ID (inches)" value={tubingId} min={1.5} max={5.5} step={0.1} unit="in" onChange={setTubingId} />
                 <InputWithSlider label="Gas-Oil Ratio (scf/stb)" value={gor} min={0} max={5000} step={50} unit="scf/stb" onChange={setGor} />
                 <InputWithSlider label="Water Cut (%)" value={wc * 100} min={0} max={100} step={1} unit="%" onChange={(v) => setWc(v/100)} />

                 {activePhase === '2D' && (
                    <>
                       <div className="pt-4 border-t border-white/5">
                          <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-6">Liquid Loading (Turner)</h4>
                          <InputWithSlider label="Flowing Pressure (psia)" value={gasPress} min={100} max={3000} step={50} unit="psia" onChange={setGasPress} />
                          <InputWithSlider label="Temperature (°R)" value={gasTemp} min={500} max={800} step={10} unit="°R" onChange={setGasTemp} />
                       </div>
                    </>
                 )}
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
                 {/* Visual Area */}
                 {activePhase === '2A' && (
                    <div className="flex gap-8">
                        <VLPFlowSimulator 
                           pattern={gor < 500 ? 'bubble' : gor < 2000 ? 'slug' : gor < 4000 ? 'churn' : 'annular'} 
                           intensity={gor / 5000} 
                        />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FlowPatternCard 
                              name="Bubble Flow" 
                              active={gor < 500}
                              desc="Gas dispersed as discrete bubbles in a continuous liquid phase. Low superficial gas velocity." 
                           />
                           <FlowPatternCard 
                              name="Slug Flow" 
                              active={gor >= 500 && gor < 2000}
                              desc="Gas bubbles coalesce into large Taylor bubbles occupying the pipe. Alternating slugs of liquid." 
                           />
                           <FlowPatternCard 
                              name="Churn Flow" 
                              active={gor >= 2000 && gor < 4000}
                              desc="Highly turbulent, unstable flow. Taylor bubbles break down. Oscillatory motion." 
                           />
                           <FlowPatternCard 
                              name="Annular Flow" 
                              active={gor >= 4000}
                              desc="High gas velocity drives a continuous gas core, pushing liquid to form a film on the tubing wall." 
                           />
                        </div>
                    </div>
                 )}

                 {(activePhase === '2D' || activePhase === '2B' || activePhase === '2C') && (
                     <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] h-[500px] flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Tubing Performance Curve (TPC)</h4>
                              <p className="text-[11px] text-slate-500 uppercase font-black mt-1">Flowing Bottomhole Pressure vs Rate</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[11px] font-black text-purple-400 uppercase tracking-widest">Turner Critical Rate</p>
                              <p className="text-2xl font-black text-white italic">{formatNumber(turnerRate, 2)} <span className="text-[10px] text-slate-500 not-italic">MMscf/D</span></p>
                           </div>
                        </div>
                        <div className="flex-1 min-h-0">
                           <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={tpcData} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" />
                                 <XAxis type="number" dataKey="rate" domain={[0, 'auto']} stroke="#475569" fontSize={10} label={{ value: 'Flow Rate (STB/D)', position: 'insideBottom', offset: -10, fill: '#64748b' }} />
                                 <YAxis type="number" dataKey="pwf" domain={[whp, 'auto']} stroke="#475569" fontSize={10} label={{ value: 'Required Pwf (psi)', angle: -90, position: 'insideLeft', offset: -5, fill: '#64748b' }} />
                                 <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#a855f7', fontWeight: 'bold' }}
                                 />
                                 <Line type="monotone" dataKey="pwf" stroke="#a855f7" strokeWidth={3} dot={false} isAnimationActive={false} />
                              </LineChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                 )}

                 {activePhase === '2E' && (
                     <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] h-[400px] flex items-center justify-center">
                         <div className="text-center space-y-4">
                             <Thermometer size={64} className="text-purple-500 mx-auto" />
                             <h4 className="text-2xl font-black text-white italic">Geothermal & Flowing Temperature</h4>
                             <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
                                 Flowing fluid temperature changes along the wellbore due to heat transfer with the formation (Ramey's model) and Joule-Thomson effects. This impacts local fluid PVT properties and thus the entire pressure gradient.
                             </p>
                         </div>
                     </div>
                 )}

                 {/* Theory Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activePhase === '2A' && (
                       <>
                          <InfoCard title="Holdup vs No-Slip" desc="Liquid Holdup (HL) is the actual fraction of pipe occupied by liquid. Due to slip (gas moving faster than liquid), actual holdup is greater than the no-slip (input) holdup." />
                          <InfoCard title="Mixture Density" desc="ρ_mix = ρL * HL + ρg * (1 - HL). Mixture density dictates the hydrostatic pressure drop, the largest component in vertical wells." />
                       </>
                    )}
                    {activePhase === '2B' && (
                       <>
                          <InfoCard title="Hydrostatic Component" desc="ΔP_elev = ρ_mix * g * sin(θ) * Δz. Dominates vertical upward flow (70-90% of total drop). Highly dependent on GOR and Liquid Holdup." />
                          <InfoCard title="Friction Component" desc="ΔP_fric = f * ρ_mix * v² / (2d). Becomes dominant at high flow rates or in smaller tubing sizes. High GOR increases velocity, thus increasing friction." />
                       </>
                    )}
                    {activePhase === '2C' && (
                       <>
                          <InfoCard title="Hagedorn-Brown" desc="Widely used empirical correlation for vertical oil wells. Good for bubble and slug flow regimes." />
                          <InfoCard title="Beggs-Brill" desc="Highly versatile empirical correlation. Includes horizontal flow pattern maps with corrections for wellbore inclination." />
                       </>
                    )}
                    {activePhase === '2D' && (
                       <>
                          <InfoCard title="J-Curve Shape" desc="At low rates, slippage causes high liquid holdup and high hydrostatic pressure. At high rates, friction dominates. The minimum point is the most efficient flow rate." />
                          <InfoCard title="Liquid Loading" desc={`Turner's critical rate represents the minimum gas velocity required to continuously lift liquid droplets. Below ${turnerRate.toFixed(2)} MMscf/D, this well may load up.`} />
                       </>
                    )}
                    {activePhase === '2E' && (
                       <>
                          <InfoCard title="Geothermal Gradient" desc="Undisturbed earth temperature typically increases 1-2°F per 100 ft of depth. Determines static wellbore temperature." />
                          <InfoCard title="Joule-Thomson Cooling" desc="As gas expands moving up the tubing, it cools down. In high-pressure gas wells, this can lead to hydrate formation near the surface." />
                       </>
                    )}
                 </div>
              </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function FlowPatternCard({ name, desc, active }: { name: string, desc: string, active?: boolean }) {
  return (
    <div className={cn(
      "glass-card p-6 rounded-3xl border-white/5 transition-all flex flex-col h-full text-center",
      active ? "bg-purple-500/20 border-purple-500/40" : "bg-purple-500/5 hover:border-purple-500/30"
    )}>
       <h5 className={cn(
         "text-[11px] font-black uppercase tracking-widest mb-3",
         active ? "text-purple-400" : "text-slate-500"
       )}>{name}</h5>
       <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function InfoCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="glass-card p-6 rounded-3xl border-white/5 bg-purple-500/5">
       <h5 className="text-[11px] font-black text-purple-400 uppercase tracking-widest mb-2">{title}</h5>
       <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
