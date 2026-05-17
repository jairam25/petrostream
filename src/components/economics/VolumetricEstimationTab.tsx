import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  PieChart as PieIcon, 
  Target, 
  Settings2, 
  RefreshCcw, 
  TrendingUp,
  Activity,
  Calculator,
  Waves,
  ArrowRightLeft
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculateOOIP, DistGenerators, UnitConverter } from '../../lib/reservoir';

interface MonteCarloInput {
  area: { min: number, mode: number, max: number };
  netPay: { min: number, mode: number, max: number };
  porosity: { min: number, mode: number, max: number };
  sw: { min: number, mode: number, max: number };
  bo: { min: number, mode: number, max: number };
  rf: { min: number, mode: number, max: number };
}

export function VolumetricEstimationTab() {
  const [activeMode, setActiveMode] = useState<'deterministic' | 'probabilistic'>('deterministic');
  
  // Deterministic Inputs
  const [detInp, setDetInp] = useState({
    area: 640,
    netPay: 50,
    phi: 0.18,
    sw: 0.25,
    bo: 1.25,
    rf: 0.35,
    unit: 'imperial' as 'imperial' | 'metric'
  });

  // Monte Carlo Inputs
  const [mcInp, setMcInp] = useState<MonteCarloInput>({
    area: { min: 400, mode: 640, max: 800 },
    netPay: { min: 30, mode: 50, max: 70 },
    porosity: { min: 0.12, mode: 0.18, max: 0.24 },
    sw: { min: 0.15, mode: 0.25, max: 0.35 },
    bo: { min: 1.15, mode: 1.25, max: 1.35 },
    rf: { min: 0.25, mode: 0.35, max: 0.45 }
  });

  const iterations = 5000;

  const results = useMemo(() => {
    // Deterministic
    const ooip = calculateOOIP(detInp.area, detInp.netPay, detInp.phi, detInp.sw, detInp.bo);
    const reserves = ooip * detInp.rf;

    // Probabilistic
    const simReserves = [];
    const sensitivityData = {
      area: 0,
      netPay: 0,
      phi: 0,
      sw: 0,
      bo: 0,
      rf: 0
    };

    for (let i = 0; i < iterations; i++) {
        const a = DistGenerators.triangular(mcInp.area.min, mcInp.area.mode, mcInp.area.max);
        const h = DistGenerators.triangular(mcInp.netPay.min, mcInp.netPay.mode, mcInp.netPay.max);
        const phi = DistGenerators.triangular(mcInp.porosity.min, mcInp.porosity.mode, mcInp.porosity.max);
        const sw = DistGenerators.triangular(mcInp.sw.min, mcInp.sw.mode, mcInp.sw.max);
        const bo = DistGenerators.triangular(mcInp.bo.min, mcInp.bo.mode, mcInp.bo.max);
        const rf = DistGenerators.triangular(mcInp.rf.min, mcInp.rf.mode, mcInp.rf.max);

        const res = calculateOOIP(a, h, phi, sw, bo) * rf;
        simReserves.push(res);
    }

    simReserves.sort((a, b) => a - b);
    const p90 = simReserves[Math.floor(iterations * 0.1)];
    const p50 = simReserves[Math.floor(iterations * 0.5)];
    const p10 = simReserves[Math.floor(iterations * 0.9)];
    const mean = simReserves.reduce((a, b) => a + b, 0) / iterations;

    // Build Histogram for simReserves
    const binCount = 30;
    const min = simReserves[0];
    const max = simReserves[simReserves.length - 1];
    const binSize = (max - min) / binCount;
    const histogram = Array.from({ length: binCount }, (_, i) => ({
        binStart: min + i * binSize,
        binEnd: min + (i + 1) * binSize,
        count: 0
    }));

    simReserves.forEach(v => {
        const binIdx = Math.min(binCount - 1, Math.floor((v - min) / binSize));
        histogram[binIdx].count++;
    });

    // Cumulative Probability Data
    const cumulative = histogram.map((h, i) => {
        const runningSum = histogram.slice(i).reduce((acc, curr) => acc + curr.count, 0);
        return {
            x: h.binStart,
            prob: (runningSum / iterations) * 100
        };
    });

    return { ooip, reserves, p10, p50, p90, mean, histogram, cumulative };
  }, [detInp, mcInp]);

  const switchUnits = () => {
    const next = detInp.unit === 'imperial' ? 'metric' : 'imperial';
    setDetInp({
        ...detInp,
        unit: next,
        area: next === 'metric' ? UnitConverter.acresToHectares(detInp.area) : UnitConverter.hectaresToAcres(detInp.area)
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Parameters Sidebar */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <Settings2 size={16} className="text-cyan-500" />
                 <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Input Parameters</h4>
              </div>
              <button 
                onClick={switchUnits}
                className="p-2 transition-all hover:bg-white/5 rounded-xl text-slate-500 hover:text-cyan-400"
              >
                <ArrowRightLeft size={16} />
              </button>
           </div>
           
           <div className="space-y-8">
              <InputWithSlider 
                label={detInp.unit === 'imperial' ? 'Area (Acres)' : 'Area (Hectares)'} 
                value={detInp.area} min={10} max={2000} step={10} unit="" onChange={(v) => setDetInp({...detInp, area: v})} 
              />
              <InputWithSlider label="Net Pay (ft)" value={detInp.netPay} min={5} max={200} step={1} unit="ft" onChange={(v) => setDetInp({...detInp, netPay: v})} />
              <InputWithSlider label="Porosity (phi)" value={detInp.phi} min={0.05} max={0.4} step={0.01} unit="" onChange={(v) => setDetInp({...detInp, phi: v})} />
              <InputWithSlider label="Saturation (Sw)" value={detInp.sw} min={0.1} max={0.8} step={0.01} unit="" onChange={(v) => setDetInp({...detInp, sw: v})} />
              <InputWithSlider label="Oil FVF (Bo)" value={detInp.bo} min={1.0} max={2.0} step={0.01} unit="bbl/STB" onChange={(v) => setDetInp({...detInp, bo: v})} />
              <InputWithSlider label="Recovery Factor" value={detInp.rf * 100} min={5} max={60} step={1} unit="%" onChange={(v) => setDetInp({...detInp, rf: v/100})} />
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-indigo-900/40 to-black border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <PieIcon size={18} className="text-indigo-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Calculation Mode</h5>
           </div>
           <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setActiveMode('deterministic')}
                className={cn(
                    "py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                    activeMode === 'deterministic' ? "bg-white text-black" : "bg-white/5 text-slate-500 hover:text-white"
                )}
              >
                Deterministic
              </button>
              <button 
                onClick={() => setActiveMode('probabilistic')}
                className={cn(
                    "py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                    activeMode === 'probabilistic' ? "bg-white text-black" : "bg-white/5 text-slate-500 hover:text-white"
                )}
              >
                Monte Carlo
              </button>
           </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="lg:col-span-9 space-y-8">
        {activeMode === 'deterministic' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="glass-card p-12 rounded-3xl border-white/5 bg-[#05070a] relative overflow-hidden group"
               >
                  <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-cyan-500/10 transition-colors">
                     <Calculator size={100} />
                  </div>
                  <div className="relative z-10">
                     <span className="px-3 py-1 bg-cyan-500/10 rounded-full text-[10px] font-black text-cyan-400 tracking-widest uppercase">STB</span>
                     <h4 className="text-6xl font-black text-white italic tracking-tighter mt-6">
                       {(results.ooip / 1e6).toFixed(2)}<span className="text-2xl text-slate-600 ml-2">MM</span>
                     </h4>
                     <p className="text-[10px] text-slate-500 font-mono mt-2 uppercase tracking-widest">Calculated OOIP</p>
                  </div>
               </motion.div>

               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="glass-card p-12 rounded-3xl border-white/5 bg-[#05070a] relative overflow-hidden group"
               >
                  <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-emerald-500/10 transition-colors">
                     <Target size={100} />
                  </div>
                  <div className="relative z-10">
                     <span className="px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-black text-emerald-400 tracking-widest uppercase">Reserves</span>
                     <h4 className="text-6xl font-black text-white italic tracking-tighter mt-6">
                       {(results.reserves / 1e6).toFixed(2)}<span className="text-2xl text-slate-600 ml-2">MM</span>
                     </h4>
                     <p className="text-[10px] text-slate-500 font-mono mt-2 uppercase tracking-widest">Recoverable Oil (1P Estimate)</p>
                  </div>
               </motion.div>
            </div>

            <div className="glass-card rounded-3xl p-12 border-white/5 bg-black/40">
               <div className="flex items-center gap-4 mb-8">
                  <Activity className="text-cyan-500" />
                  <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Sensitivity Analysis</h4>
               </div>
               <div className="space-y-6">
                  {/* Simplified Sensitivity Bar placeholders for Deterministic */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] text-slate-400 leading-relaxed">
                     <p>Unit conversions are handled automatically based on selection. For multi-phase systems, ensure Saturation represents the correct mobile fraction.</p>
                     <p>Deterministic calculations provide a single-point estimate but do not capture the uncertainty inherent in reservoir characterization. Switch to Monte Carlo for risk analysis.</p>
                  </div>
               </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <MC_Metric label="P90 (Proved)" value={(results.p90 / 1e6).toFixed(2)} unit="MM STB" color="text-emerald-500" />
               <MC_Metric label="P50 (Probable)" value={(results.p50 / 1e6).toFixed(2)} unit="MM STB" color="text-blue-500" />
               <MC_Metric label="P10 (Possible)" value={(results.p10 / 1e6).toFixed(2)} unit="MM STB" color="text-amber-500" />
               <MC_Metric label="Mean" value={(results.mean / 1e6).toFixed(2)} unit="MM STB" color="text-white" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a]">
                  <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                    <TrendingUp size={14} className="text-cyan-500" /> Reserve Distribution
                  </h5>
                  <div className="h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={results.histogram}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                           <XAxis dataKey="binStart" hide />
                           <YAxis hide />
                           <Tooltip 
                             contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }}
                             formatter={(v: number) => [`${v} iterations`, 'Frequency']}
                           />
                           <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                              {results.histogram.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index > 20 ? '#f59e0b' : index > 10 ? '#3b82f6' : '#10b981'} fillOpacity={0.6} />
                              ))}
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a]">
                  <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                    <Activity size={14} className="text-emerald-500" /> Cumulative Probability
                  </h5>
                  <div className="h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={results.cumulative}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                           <XAxis dataKey="x" stroke="#475569" fontSize={10} tickFormatter={(v) => `${(v/1e6).toFixed(1)}M`} />
                           <YAxis stroke="#475569" fontSize={10} tickFormatter={(v) => `${v}%`} />
                           <Tooltip 
                             contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }}
                             formatter={(v: number) => [`${v.toFixed(1)}%`, 'Probability of Exceedance']}
                           />
                           <Area type="monotone" dataKey="prob" stroke="#10b981" fill="url(#colorProb)" fillOpacity={0.2} strokeWidth={3} />
                           <ReferenceLine x={results.p90} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'P90', fill: '#10b981', fontSize: 10, fontWeight: 700 }} />
                           <ReferenceLine x={results.p50} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'P50', fill: '#3b82f6', fontSize: 10, fontWeight: 700 }} />
                           <ReferenceLine x={results.p10} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'P10', fill: '#f59e0b', fontSize: 10, fontWeight: 700 }} />
                           <defs>
                              <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>
            
            <div className="glass-card rounded-3xl p-12 border-white/5 bg-black/40">
               <div className="flex items-center gap-4 mb-10">
                  <RefreshCcw className="text-cyan-500" />
                  <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Monte Carlo Summary</h4>
               </div>
               <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
                 Standard simulation using {iterations} iterations with triangular distributions for all reservoir parameters. 
                 The wide spread between P90 and P10 indicates high technical uncertainty, often seen in early-stage appraisal.
                 <br /><br />
                 Note: Mean value reflects the arithmetic average of all outcomes, which is often higher than P50 in positively skewed log-normal like distributions commonly found in reserves.
               </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MC_Metric({ label, value, unit, color }: { label: string, value: string, unit: string, color: string }) {
  return (
    <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40">
       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{label}</span>
       <div className="flex items-baseline gap-1">
          <span className={cn("text-2xl font-black italic tracking-tighter", color)}>{value}</span>
          <span className="text-[10px] font-bold text-slate-600 uppercase">{unit}</span>
       </div>
    </div>
  );
}
