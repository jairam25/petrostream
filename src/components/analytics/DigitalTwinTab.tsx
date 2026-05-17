import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Radio, 
  Activity, 
  Settings2, 
  ShieldAlert, 
  Zap, 
  Cpu, 
  Target,
  RefreshCw,
  BoxSelect,
  Layers,
  FlaskConical,
  Trello,
  Maximize2,
  TrendingUp,
  History
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
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
  BarChart,
  Bar,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export function DigitalTwinTab() {
  const [activePortal, setActivePortal] = useState<'proxy' | 'optimization' | 'cleanup' | 'economics'>('proxy');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-3 space-y-4">
        {[
          { id: 'proxy', label: 'Proxy Simulator', desc: 'Predictive What-if engine', icon: Cpu },
          { id: 'optimization', label: 'Field Optimizer', icon: Zap, desc: 'Real-time choke matching' },
          { id: 'cleanup', label: 'Cleanup AI', icon: Activity, desc: 'Frac flowback ramp-up' },
          { id: 'economics', label: 'Life Extension', icon: TrendingUp, desc: 'NPV & Field tail analysis' }
        ].map(p => (
           <motion.div 
              key={p.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActivePortal(p.id as any)}
              className={cn(
                "glass-card rounded-2xl p-6 border-white/5 transition-all cursor-pointer",
                activePortal === p.id ? "bg-indigo-500/10 ring-1 ring-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.1)]" : "bg-black/40 hover:bg-white/[0.02]"
              )}
           >
              <div className="flex items-center gap-4">
                 <div className={cn("p-3 rounded-2xl", activePortal === p.id ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-500")}>
                    <p.icon size={18} />
                 </div>
                 <div>
                    <h4 className={cn("text-xs font-black uppercase italic tracking-wider", activePortal === p.id ? "text-indigo-400" : "text-white")}>{p.label}</h4>
                    <p className="text-[11px] text-slate-600 italic mt-0.5">{p.desc}</p>
                 </div>
              </div>
           </motion.div>
        ))}

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-indigo-950/40 to-black border-white/5 mt-8">
           <div className="flex items-center gap-3 mb-6">
              <Trello size={18} className="text-indigo-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Twin Fidelity</h5>
           </div>
           <div className="space-y-4">
              <SyncMetric label="Last Update" val="14M AGO" />
              <SyncMetric label="RMS Error" val="2.4%" />
              <SyncMetric label="State Estimation" val="ACTIVE" />
           </div>
        </div>
      </div>

      {/* Analysis Content */}
      <div className="lg:col-span-9">
         {activePortal === 'proxy' && <ProxySimulatorTool />}
         {activePortal === 'optimization' && <RealtimeOptimizerTool />}
         {activePortal === 'cleanup' && <CleanupAITool />}
         {activePortal === 'economics' && <LifeExtensionTool />}
      </div>
    </div>
  );
}

function ProxySimulatorTool() {
  const [inflow, setInflow] = useState(100);
  const [pressure, setPressure] = useState(3000);
  const [isShutInA, setIsShutInA] = useState(true);
  const [isIncreasedInj, setIsIncreasedInj] = useState(false);

  const predictedGain = useMemo(() => {
    let base = 1.2;
    if (isShutInA) base += 0.6;
    if (isIncreasedInj) base += 0.4;
    base += (inflow / 500) * 0.5;
    base -= (pressure / 5000) * 0.3;
    return base.toFixed(1);
  }, [inflow, pressure, isShutInA, isIncreasedInj]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="flex justify-between items-start mb-12">
          <div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter italic">Proxy <span className="text-indigo-500 italic">Simulator</span></h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Reduced-Order Modelling (ROM) for Instant What-If Scenarios</p>
          </div>
          <div className="p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 text-center">
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1 underline">Compute Latency</span>
             <span className="text-2xl font-black text-white italic">42ms</span>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div className="space-y-8">
             <TwinSlider label="Central Influx Rate" val={inflow} setVal={setInflow} min={0} max={500} unit="STBD" />
             <TwinSlider label="Bottomhole Pressure" val={pressure} setVal={setPressure} min={1000} max={5000} unit="PSI" />
             
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 italic leading-tight">Scenario Configuration</h5>
                <div className="space-y-3">
                   <button 
                      onClick={() => setIsShutInA(!isShutInA)}
                      className={cn(
                        "w-full flex justify-between items-center text-[10px] font-bold uppercase italic p-3 rounded-xl transition-all",
                        isShutInA ? "text-white bg-indigo-500/20 border border-indigo-500/30" : "text-slate-500 bg-black/40 border border-transparent"
                      )}
                   >
                      <span>Shut-in Well A</span>
                      <div className={cn("w-10 h-5 rounded-full relative transition-colors", isShutInA ? "bg-indigo-500" : "bg-slate-800")}>
                         <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", isShutInA ? "left-6" : "left-1")} />
                      </div>
                   </button>

                   <button 
                      onClick={() => setIsIncreasedInj(!isIncreasedInj)}
                      className={cn(
                        "w-full flex justify-between items-center text-[10px] font-bold uppercase italic p-3 rounded-xl transition-all",
                        isIncreasedInj ? "text-white bg-indigo-500/20 border border-indigo-500/30" : "text-slate-500 bg-black/40 border border-transparent"
                      )}
                   >
                      <span>Increase Inj-01</span>
                      <div className={cn("w-10 h-5 rounded-full relative transition-colors", isIncreasedInj ? "bg-indigo-500" : "bg-slate-800")}>
                         <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", isIncreasedInj ? "left-6" : "left-1")} />
                      </div>
                   </button>
                </div>
             </div>
          </div>

          <div className="flex flex-col justify-center items-center">
             <div className="p-12 bg-gradient-to-br from-indigo-950 to-black border border-indigo-500/20 rounded-3xl text-center w-full relative group">
                <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-4 italic">Predicted Recovery Gain</span>
                <span className="text-7xl font-black text-white italic tracking-tighter">{predictedGain} <span className="text-2xl text-slate-500 font-normal">%</span></span>
                <div className="h-1 w-48 bg-white/5 mx-auto mt-8 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 animate-pulse" style={{ width: `${parseFloat(predictedGain) * 20}%` }} />
                </div>
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function RealtimeOptimizerTool() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="mb-12">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter italic">Field <span className="text-indigo-400 italic">Optimization</span></h3>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Maximizing Field Oil Rate subject to Network Constraints</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
             {[
                { well: 'BRAVO-01', current: '1,200', optimal: '1,450', gain: '+20.8%' },
                { well: 'BRAVO-04', current: '1,800', optimal: '1,820', gain: '+1.1%' },
                { well: 'ALPHA-12', current: '940', optimal: '1,100', gain: '+17.0%' },
             ].map((w, i) => (
                <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-indigo-500/40 transition-all cursor-pointer">
                   <div className="flex justify-between items-start mb-4">
                      <h4 className="text-xs font-black text-white uppercase italic">{w.well}</h4>
                      <span className="text-[10px] font-black text-emerald-400 font-mono">{w.gain}</span>
                   </div>
                   <div className="flex gap-10">
                      <div>
                         <span className="text-[10px] font-black text-slate-600 uppercase block mb-1">Current</span>
                         <span className="text-xs font-black text-slate-400">{w.current}</span>
                      </div>
                      <div>
                         <span className="text-[10px] font-black text-indigo-400 uppercase block mb-1 italic">Optimal</span>
                         <span className="text-xs font-black text-white italic">{w.optimal}</span>
                      </div>
                   </div>
                </div>
             ))}

             <button className="w-full py-5 bg-indigo-500 text-black text-[10px] font-black uppercase tracking-widest italic rounded-[24px] hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                Execute Global Optimization
             </button>
          </div>

          <div className="h-[400px] glass-card rounded-3xl p-8 border border-white/5 bg-black">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 border-b border-white/10 pb-4 italic">Efficiency Frontier</h4>
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={Array.from({ length: 15 }).map((_, i) => ({ x: i, y: 100 - Math.pow(i-10, 2)*0.5 }))}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                   <XAxis dataKey="x" hide />
                   <Tooltip />
                   <Area type="monotone" dataKey="y" stroke="#6366f1" fill="rgba(99,102,241,0.1)" strokeWidth={3} />
                </AreaChart>
             </ResponsiveContainer>
          </div>
       </div>
    </motion.div>
  );
}

function CleanupAITool() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
        <div className="flex justify-between items-start mb-12">
           <div>
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter italic">Cleanup <span className="text-emerald-500 italic">Predictor</span></h3>
             <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold italic">Frac Fluid Recovery & Ramp-up Stability Analysis</p>
           </div>
           <div className="flex gap-6 items-center">
              <button className="px-8 py-4 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest italic rounded-2xl hover:bg-emerald-500/10 transition-all">
                 Start Simulation
              </button>
              <div className="p-8 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1 italic">Load Recovery</span>
                 <span className="text-3xl font-black text-white italic font-mono">42.4%</span>
              </div>
           </div>
        </div>

       <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
             <LineChart data={Array.from({ length: 40 }).map((_, i) => ({ t: i, recovery: Math.min(100, i*2.5), gas: i > 25 ? (i-25)*5 : 0 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis dataKey="t" label={{ value: 'Days Post-Stim', position: 'insideBottom', fontSize: 8, fill: '#475569', fontWeight: 'bold' }} />
                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="recovery" stroke="#3b82f6" strokeWidth={3} dot={false} name="Load Rec %" />
                <Line type="monotone" dataKey="gas" stroke="#f59e0b" strokeWidth={3} dot={false} name="HC Influx" />
             </LineChart>
          </ResponsiveContainer>
       </div>
    </motion.div>
  );
}

function LifeExtensionTool() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="mb-12">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter italic">Life <span className="text-indigo-400 italic">Extension</span> Analyzer</h3>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Incremental NPV from Workover & Enhanced Recovery Campaigns</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="p-10 bg-white/5 rounded-3xl border border-white/5 flex flex-col justify-center gap-8">
             <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-bold italic">Base Field Life</span>
                <span className="text-xl font-black text-white italic">2032 (7 YRS)</span>
             </div>
             <div className="flex justify-between items-baseline pt-6 border-t border-white/10">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic font-bold italic">Extended Expectancy</span>
                <span className="text-3xl font-black text-white italic underline decoration-indigo-500/50">2045 (20 YRS)</span>
             </div>
             <div className="flex justify-between items-baseline pt-6 border-t border-white/10">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic font-bold italic">Incremental NPV-10</span>
                <span className="text-2xl font-black text-white italic">$45.8 MM</span>
             </div>
          </div>

          <div className="h-[350px]">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-4 italic underline underline-offset-4 decoration-slate-800">Scenario NPV Probabilities</h4>
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                   { scenario: 'Base', npv: 120 },
                   { scenario: 'Intervention', npv: 165 },
                   { scenario: 'EOR Flood', npv: 245 },
                ]}>
                   <XAxis dataKey="scenario" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                   <YAxis hide />
                   <Tooltip />
                   <Bar dataKey="npv" radius={[12, 12, 0, 0]}>
                      {['#475569', '#6366f1', '#10b981'].map((c, i) => (
                         <Cell key={i} fill={c} fillOpacity={0.6} />
                      ))}
                   </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
       </div>
    </motion.div>
  );
}

function SyncMetric({ label, val }: { label: string, val: string }) {
  return (
    <div className="flex justify-between items-center bg-black p-4 rounded-xl border border-white/5">
       <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">{label}</span>
       <span className="text-[10px] font-bold text-white italic">{val}</span>
    </div>
  );
}

function TwinSlider({ label, val, setVal, min, max, unit }: { label: string, val: number, setVal: (v: number) => void, min: number, max: number, unit: string }) {
  return (
    <div className="space-y-4">
       <div className="flex justify-between items-baseline">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{label}</label>
          <div className="flex items-baseline gap-2">
             <span className="text-[11px] font-black text-white font-mono">{val}</span>
             <span className="text-[10px] text-slate-700 font-bold uppercase">{unit}</span>
          </div>
       </div>
       <input 
          type="range" min={min} max={max} value={val} 
          onChange={(e) => setVal(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
       />
    </div>
  );
}
