import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  Target, 
  TrendingUp, 
  Activity, 
  Database, 
  Settings2, 
  ArrowRightLeft,
  PieChart as PieIcon,
  RefreshCcw,
  BarChart2,
  GitBranch,
  Search,
  LineChart as LineChartIcon
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { 
  calculateOOIP, 
  calculateOGIP, 
  DistGenerators, 
  UnitConverter,
  calculateWithdrawalF,
  calculateExpansionEo,
  calculateExpansionEg,
  calculateExpansionEfw,
  linearRegression
} from '../../lib/reservoir';
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
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter
} from 'recharts';

export function VolumetricEstimationModule() {
  const [activePhase, setActivePhase] = useState<1 | 2 | 3>(1);
  
  // Phase 1: Deterministic
  const [detInp, setDetInp] = useState({
    area: 640,
    netPay: 50,
    phi: 0.18,
    sw: 0.25,
    bo: 1.25,
    bg: 0.0012,
    rf: 0.35,
    fluid: 'oil' as 'oil' | 'gas'
  });

  // Phase 2: Probabilistic
  const [mcInp, setMcInp] = useState({
    area: { min: 400, mode: 640, max: 800 },
    netPay: { min: 30, mode: 50, max: 70 },
    porosity: { min: 0.12, mode: 0.18, max: 0.24 },
    sw: { min: 0.15, mode: 0.25, max: 0.35 },
    bo: { min: 1.15, mode: 1.25, max: 1.35 },
    rf: { min: 0.25, mode: 0.35, max: 0.45 }
  });

  const iterations = 5000;

  // Phase 3: Material Balance
  const [mbeInp, setMbeInp] = useState({
    boi: 1.25,
    rsi: 650,
    bgi: 0.0012,
    cf: 4e-6,
    cw: 3e-6,
    swi: 0.25,
    m: 0.1 // Gas cap size ratio
  });

  // Simulated Time-Series Data for MBE Plots
  const mbeData = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => {
        const p = 4000 - i * 300;
        const np = i * 100000;
        const rp = 650 + i * 100;
        const bo = 1.25 - i * 0.01;
        const rs = 650 - i * 40;
        const bg = 0.0012 + i * 0.0002;
        const wp = i * 5000;
        const bw = 1.03;

        const F = calculateWithdrawalF(np, bo, rp, rs, bg, wp, bw);
        const Eo = calculateExpansionEo(bo, mbeInp.boi, rs, mbeInp.rsi, bg);
        const Eg = calculateExpansionEg(bg, mbeInp.bgi, mbeInp.boi);
        const Efw = calculateExpansionEfw(mbeInp.boi, mbeInp.swi, mbeInp.cf, mbeInp.cw, 4000 - p);
        
        const Et = Eo + mbeInp.m * Eg + Efw;
        
        return {
            p,
            np,
            F,
            Et,
            fEt: F / (Et || 1),
            Eo,
            Eg,
            Efw,
            eoEt: Eo / Et,
            egEt: (mbeInp.m * Eg) / Et,
            efwEt: Efw / Et
        };
    });
  }, [mbeInp]);

  const mcResults = useMemo(() => {
    const simVolumes = [];
    for (let i = 0; i < iterations; i++) {
        const a = DistGenerators.triangular(mcInp.area.min, mcInp.area.mode, mcInp.area.max);
        const h = DistGenerators.triangular(mcInp.netPay.min, mcInp.netPay.mode, mcInp.netPay.max);
        const phi = DistGenerators.triangular(mcInp.porosity.min, mcInp.porosity.mode, mcInp.porosity.max);
        const sw = DistGenerators.triangular(mcInp.sw.min, mcInp.sw.mode, mcInp.sw.max);
        const bo = DistGenerators.triangular(mcInp.bo.min, mcInp.bo.mode, mcInp.bo.max);
        const rf = DistGenerators.triangular(mcInp.rf.min, mcInp.rf.mode, mcInp.rf.max);

        const res = calculateOOIP(a, h, phi, sw, bo) * rf;
        simVolumes.push(res);
    }
    simVolumes.sort((a, b) => a - b);
    
    // Histogram
    const binCount = 30;
    const min = simVolumes[0];
    const max = simVolumes[simVolumes.length - 1];
    const binSize = (max - min) / binCount;
    const histogram = Array.from({ length: binCount }, (_, i) => ({
        binStart: min + i * binSize,
        count: 0
    }));
    simVolumes.forEach(v => {
        const idx = Math.min(binCount - 1, Math.floor((v - min) / binSize));
        histogram[idx].count++;
    });

    const cumulative = histogram.map((h, i) => {
        const runningSum = histogram.slice(i).reduce((acc, curr) => acc + curr.count, 0);
        return { x: h.binStart, prob: (runningSum / iterations) * 100 };
    });

    return {
        p90: simVolumes[Math.floor(iterations * 0.1)],
        p50: simVolumes[Math.floor(iterations * 0.5)],
        p10: simVolumes[Math.floor(iterations * 0.9)],
        mean: simVolumes.reduce((a, b) => a + b, 0) / iterations,
        histogram,
        cumulative
    };
  }, [mcInp]);

  const detRes = useMemo(() => {
    const oip = detInp.fluid === 'oil' 
        ? calculateOOIP(detInp.area, detInp.netPay, detInp.phi, detInp.sw, detInp.bo)
        : calculateOGIP(detInp.area, detInp.netPay, detInp.phi, detInp.sw, detInp.bg);
    return { oip, reserves: oip * detInp.rf };
  }, [detInp]);

  const phases = [
    { id: 1, name: 'Deterministic', icon: Target },
    { id: 2, name: 'Probabilistic', icon: Activity },
    { id: 3, name: 'Material Balance', icon: BarChart2 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Calculator className="text-cyan-500" size={32} />
            Volumetric Estimation <span className="text-cyan-500/50">Module 4</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl font-medium uppercase tracking-widest">Reserves Characterization & Dynamic Material Balance Engine</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            {phases.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePhase(p.id as any)}
                  className={cn(
                    "px-6 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-xs font-black uppercase tracking-widest",
                    activePhase === p.id 
                      ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" 
                      : "text-slate-500 hover:text-white"
                  )}
                >
                  <p.icon size={14} />
                  {p.name}
                </button>
            ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activePhase}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
           className="min-h-[700px]"
        >
          {activePhase === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               {/* Controls */}
               <div className="lg:col-span-4 space-y-6">
                  <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                     <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-3">
                            <Settings2 size={16} className="text-cyan-500" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Calculated Parameter Set</h4>
                         </div>
                         <button 
                            onClick={() => setDetInp({...detInp, fluid: detInp.fluid === 'oil' ? 'gas' : 'oil'})}
                            className="p-2 transition-all hover:bg-white/5 rounded-xl text-slate-500 hover:text-cyan-400"
                         >
                            <ArrowRightLeft size={16} />
                         </button>
                     </div>
                     <div className="space-y-8">
                        <PetroSlider label="Area (Acres)" value={detInp.area} min={40} max={2000} step={40} onChange={v => setDetInp({...detInp, area: v})} />
                        <PetroSlider label="Net Pay (ft)" value={detInp.netPay} min={5} max={250} step={5} onChange={v => setDetInp({...detInp, netPay: v})} />
                        <PetroSlider label="Porosity (frac)" value={detInp.phi} min={0.05} max={0.35} step={0.01} onChange={v => setDetInp({...detInp, phi: v})} />
                        <PetroSlider label="Saturation Sw" value={detInp.sw} min={0.1} max={0.8} step={0.01} onChange={v => setDetInp({...detInp, sw: v})} />
                        {detInp.fluid === 'oil' ? (
                            <PetroSlider label="Oil FVF Bo" value={detInp.bo} min={1.0} max={2.0} step={0.01} onChange={v => setDetInp({...detInp, bo: v})} />
                        ) : (
                            <PetroSlider label="Gas FVF Bg" value={detInp.bg} min={0.0005} max={0.005} step={0.0001} onChange={v => setDetInp({...detInp, bg: v})} />
                        )}
                        <PetroSlider label="Recovery Factor %" value={detInp.rf * 100} min={5} max={60} step={1} onChange={v => setDetInp({...detInp, rf: v/100})} />
                     </div>
                  </div>
               </div>

               {/* Results */}
               <div className="lg:col-span-8 space-y-8 text-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="glass-card p-12 rounded-3xl border-white/5 bg-[#05070a] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-cyan-500/10 transition-colors">
                            <Database size={100} />
                        </div>
                        <span className="px-3 py-1 bg-cyan-500/10 rounded-full text-[10px] font-black text-cyan-400 tracking-widest uppercase">Initial Volume ({detInp.fluid === 'oil' ? 'STB' : 'SCF'})</span>
                        <h4 className="text-6xl font-black italic tracking-tighter mt-6">
                            {(detRes.oip / 1e6).toFixed(2)}<span className="text-2xl text-slate-600 ml-2">MM {detInp.fluid === 'oil' ? '' : 'FT³'}</span>
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-2 uppercase tracking-widest italic">{detInp.fluid === 'oil' ? 'Oil Originally In Place (OOIP)' : 'Gas Originally In Place (OGIP)'}</p>
                     </div>
                     <div className="glass-card p-12 rounded-3xl border-white/5 bg-[#05070a] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-emerald-500/10 transition-colors">
                            <Target size={100} />
                        </div>
                        <span className="px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-black text-emerald-400 tracking-widest uppercase">Estimated Reserves</span>
                        <h4 className="text-6xl font-black italic tracking-tighter mt-6 text-emerald-500">
                            {(detRes.reserves / 1e6).toFixed(2)}<span className="text-2xl text-slate-600 ml-2">MM</span>
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-2 uppercase tracking-widest italic">1P Commercial Recoverable Estimate</p>
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40">
                     <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2 italic">
                        <GitBranch size={16} className="text-cyan-500" />
                        Static Volumetric Invariant
                     </h4>
                     <p className="text-sm text-slate-400 leading-relaxed font-light">
                        Single-point estimation assumes uniform distribution across the drainage area. This method serves as the baseline for internal review before stochastic modeling.
                        <br /><br />
                        Fluid formation volume factors (Bo/Bg) should be evaluated at Initial Reservoir Pressure (Pi).
                     </p>
                  </div>
               </div>
            </div>
          )}

          {activePhase === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Stats Header */}
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4 text-white">
                    <MetricCard label="P90 (Low Case)" value={(mcResults.p90 / 1e6).toFixed(2)} color="text-amber-500" />
                    <MetricCard label="P50 (Best Case)" value={(mcResults.p50 / 1e6).toFixed(2)} color="text-blue-500" />
                    <MetricCard label="P10 (High Case)" value={(mcResults.p10 / 1e6).toFixed(2)} color="text-emerald-500" />
                    <MetricCard label="Expected (Mean)" value={(mcResults.mean / 1e6).toFixed(2)} color="text-white" />
                </div>
                
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                        <div className="flex items-center gap-3 mb-8">
                            <Activity size={16} className="text-cyan-500" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Uncertainty Bounds</h4>
                        </div>
                        <div className="space-y-6">
                            <MCRangeInput label="Net Pay" values={mcInp.netPay} unit="ft" onChange={v => setMcInp({...mcInp, netPay: v})} />
                            <MCRangeInput label="Porosity" values={mcInp.porosity} unit="" onChange={v => setMcInp({...mcInp, porosity: v})} />
                            <MCRangeInput label="Recovery Factor" values={mcInp.rf} unit="frac" onChange={v => setMcInp({...mcInp, rf: v})} />
                        </div>
                        <div className="mt-10 p-6 bg-cyan-500/5 rounded-3xl border border-cyan-500/20 text-[10px] text-cyan-400 leading-relaxed font-bold">
                            SIMULATING {iterations} ITERATIONS WITH TRIANGULAR DISTRIBUTION
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a]">
                            <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                                <TrendingUp size={14} className="text-cyan-500" /> Reserve Frequency Histogram
                            </h5>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={mcResults.histogram}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                        <XAxis dataKey="binStart" hide />
                                        <YAxis hide />
                                        <Tooltip cursor={{ fill: 'white', fillOpacity: 0.05 }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                            {mcResults.histogram.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index > 20 ? '#10b981' : index > 10 ? '#3b82f6' : '#f59e0b'} fillOpacity={0.4} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a]">
                            <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                                <Activity size={14} className="text-emerald-500" /> Expectation Curve (P-Sum)
                            </h5>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mcResults.cumulative}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                        <XAxis dataKey="x" stroke="#475569" fontSize={10} tickFormatter={v => `${(v/1e6).toFixed(1)}M`} />
                                        <YAxis stroke="#475569" fontSize={10} tickFormatter={v => `${v}%`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                                        <Area type="monotone" dataKey="prob" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={3} />
                                        <ReferenceLine x={mcResults.p50} stroke="#3b82f6" strokeDasharray="3 3" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {activePhase === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Controls */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                         <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-8">PVT & Expansion Data</h4>
                         <div className="space-y-6">
                             <PetroSlider label="Gas Cap Ratio (m)" value={mbeInp.m} min={0} max={2.0} step={0.1} onChange={v => setMbeInp({...mbeInp, m: v})} />
                             <PetroSlider label="Boi (bbl/stb)" value={mbeInp.boi} min={1.0} max={1.8} step={0.01} onChange={v => setMbeInp({...mbeInp, boi: v})} />
                             <PetroSlider label="Solution GOR initial" value={mbeInp.rsi} min={200} max={2000} step={10} onChange={v => setMbeInp({...mbeInp, rsi: v})} />
                             <PetroSlider label="Formation Comp." value={mbeInp.cf * 1e6} min={1} max={10} step={0.1} onChange={v => setMbeInp({...mbeInp, cf: v/1e6})} />
                         </div>
                    </div>
                </div>

                {/* Analysis Plots */}
                <div className="lg:col-span-9 space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a]">
                            <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                                <LineChartIcon size={14} className="text-cyan-500" /> Havlena-Odeh Method (F/Et vs We/Et)
                            </h5>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                                        <XAxis type="number" dataKey="p" name="Pressure" stroke="#64748b" fontSize={10} reversed />
                                        <YAxis type="number" dataKey="fEt" name="F/Et" stroke="#64748b" fontSize={10} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                        <Scatter name="Production History" data={mbeData} fill="#3b82f6" />
                                        {/* Linear regression intercept would be OOIP */}
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 p-4 bg-white/5 rounded-2xl flex justify-between text-[10px] font-mono">
                                <span className="text-slate-500 uppercase">Havlena-Odeh Slope Interpretation</span>
                                <span className="text-emerald-400">CONSTANT VOLUME: DEPLETION DRIVE</span>
                            </div>
                        </div>

                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a]">
                            <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                                <PieIcon size={14} className="text-indigo-500" /> Energy Plot (Drive Indices)
                            </h5>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mbeData} stackOffset="expand">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                                        <XAxis dataKey="p" reversed fontSize={10} stroke="#64748b" />
                                        <YAxis fontSize={10} stroke="#64748b" tickFormatter={v => `${(v*100).toFixed(0)}%`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                                        <Area type="monotone" dataKey="eoEt" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Oil Exp." />
                                        <Area type="monotone" dataKey="egEt" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Gas Cap" />
                                        <Area type="monotone" dataKey="efwEt" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Water/Comp." />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 text-sm text-slate-400 font-light leading-relaxed">
                       Dynamic Material Balance confirms field-wide OOIP by matching historical pressure depletion with produced fluid volumes.
                       The Campbell Plot (F/Et vs F) can be used to identify active water drive (upward trend) if current depletion models diverge.
                    </div>
                </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="glass-card rounded-3xl p-6 bg-black/50 border border-white/5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{label}</span>
            <p className={cn("text-3xl font-black italic tracking-tighter", color)}>{value}<span className="text-xs ml-1 font-normal not-italic text-slate-600">MM</span></p>
        </div>
    );
}

function PetroSlider({ label, value, min, max, step, onChange }: { label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center text-[11px] font-black text-white uppercase tracking-widest">
                <span>{label}</span>
                <span className="text-cyan-400 font-mono">{formatNumber(value, unitSuffix(label))}</span>
            </div>
            <input 
              type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-500"
            />
        </div>
    );
}

function MCRangeInput({ label, values, unit, onChange }: { label: string, values: {min: number, mode: number, max: number}, unit: string, onChange: (v: any) => void }) {
    return (
        <div className="space-y-3">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{label} {unit && `(${unit})`}</p>
            <div className="grid grid-cols-3 gap-2">
                <input type="number" value={values.min} onChange={e => onChange({...values, min: Number(e.target.value)})} className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" placeholder="Min" />
                <input type="number" value={values.mode} onChange={e => onChange({...values, mode: Number(e.target.value)})} className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" placeholder="Mode" />
                <input type="number" value={values.max} onChange={e => onChange({...values, max: Number(e.target.value)})} className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white" placeholder="Max" />
            </div>
        </div>
    );
}

function unitSuffix(label: string): number {
    if (label.includes('frac') || label.includes('phi')) return 3;
    if (label.includes('ratio') || label.includes('FVF')) return 2;
    return 0;
}
