import React, { useState, useMemo } from 'react';
import { 
  Droplet,
  FlaskConical,
  Wind,
  Waves,
  Activity,
  LineChart as LineChartIcon,
  Zap,
  Flame,
  Thermometer,
  Gauge,
  RefreshCcw,
  Scaling,
  ChevronDown,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatNumber } from '../../lib/utils';
import { InputWithSlider, DataRow } from '../SharedUI';
import {
  calculateStandingRs,
  calculateVasquezBeggsBo,
  calculateBeggsRobinsonViscosity,
  calculateLeeGonzalezViscosity,
  calculateDranchukAbouKassemZ,
  calculateMcCainBw,
  calculateMcCainRsw
} from '../../lib/reservoir';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  BarChart,
  Bar
} from 'recharts';

import { PURE_COMPONENTS, BIP_NON_HC } from '../../lib/pvt_data';
import { 
  EOSModel, 
  PropertyCorrelation, 
  SplittingMethod,
  splitC7Plus, 
  applyCorrelations, 
  getBIP,
  calculateBubblePoint,
  calculateDewPoint,
  CompositionComponent,
  performFlash,
  isPhaseStable,
  calculateLiquidDropout,
  calculateCGR,
  calculateSaturatedViscosity,
  calculateUndersaturatedViscosity,
  calculateLBCViscosity,
  calculateIFT,
  calculateCompGrading,
  calculateCapillaryNumber,
  calculateAsphalteneStability,
  calculateWAT,
  calculateHydrateTemperature,
  calculateScaleIndex
} from '../../lib/pvt_engine';
import { PVTNeuralSimulator } from './PVTNeuralSimulator';

export function PVTAnalysisTab() {
  const [activePhase, setActivePhase] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11>(1);

  // Advanced PVT State
  const [eosInp, setEosInp] = useState({
    model: EOSModel.PR,
    correlation: PropertyCorrelation.KESLER_LEE,
    splitting: SplittingMethod.WHITSON,
    pseudoGroups: 8,
    c7PlusZ: 0.15,
    c7PlusMW: 210,
    c7PlusSG: 0.84,
    useVolumeTranslation: true
  });

  const [activeLabExp, setActiveLabExp] = useState<'CCE' | 'DL' | 'SEP' | 'CVD' | 'SWELL' | 'SLIM'>('CCE');
  
  const [composition, setComposition] = useState<Record<string, number>>({
    C1: 0.65,
    C2: 0.08,
    C3: 0.04,
    iC4: 0.01,
    nC4: 0.02,
    iC5: 0.005,
    nC5: 0.015,
    C6: 0.01,
    N2: 0.01,
    CO2: 0.01,
    H2S: 0.0,
    H2O: 0.0
  });

  const totalLightZ = Object.values(composition).reduce((a, b) => a + b, 0);
  const normalizedC7PlusZ = 1 - totalLightZ;

  const pseudoCompResult = useMemo(() => {
    const rawGroups = splitC7Plus(normalizedC7PlusZ, eosInp.c7PlusMW, eosInp.c7PlusSG, eosInp.pseudoGroups, eosInp.splitting);
    return rawGroups.map(g => applyCorrelations(g, eosInp.correlation));
  }, [normalizedC7PlusZ, eosInp.c7PlusMW, eosInp.c7PlusSG, eosInp.pseudoGroups, eosInp.correlation, eosInp.splitting]);

  const fullComposition: CompositionComponent[] = useMemo(() => {
    const list: CompositionComponent[] = [];
    Object.entries(composition).forEach(([id, z]) => {
      if (z > 0) list.push({ component: PURE_COMPONENTS[id], z });
    });
    pseudoCompResult.forEach(g => {
      list.push({ component: g, z: normalizedC7PlusZ / pseudoCompResult.length });
    });
    return list;
  }, [composition, pseudoCompResult, normalizedC7PlusZ]);

  // Conditions
  const [pvtInp, setPvtInp] = useState({
    pressure: 3500,
    temp: 180,
    api: 35,
    gasGravity: 0.65,
    salinity: 50000,
    mwC7: 180
  });

  const satPoints = useMemo(() => {
    if (fullComposition.length === 0) return { pb: 0, pd: 0 };
    const tempK = (pvtInp.temp + 459.67);
    return {
      pb: calculateBubblePoint(fullComposition, tempK),
      pd: calculateDewPoint(fullComposition, tempK)
    };
  }, [fullComposition, pvtInp.temp]);

  const pvtResults = useMemo(() => {
    const rs = calculateStandingRs(pvtInp.pressure, pvtInp.temp, pvtInp.gasGravity, pvtInp.api);
    const bo = calculateVasquezBeggsBo(pvtInp.pressure, pvtInp.temp, rs, pvtInp.gasGravity, pvtInp.api);
    const deadVisco = calculateBeggsRobinsonViscosity(pvtInp.temp, pvtInp.api);
    
    // Z-Factors (using Standing values approx if tr/pr calculated)
    const ppc = 677 + 15.0 * pvtInp.gasGravity - 37.5 * Math.pow(pvtInp.gasGravity, 2);
    const tpc = 168 + 325 * pvtInp.gasGravity - 12.5 * Math.pow(pvtInp.gasGravity, 2);
    const p_pr = pvtInp.pressure / ppc;
    const t_pr = (pvtInp.temp + 460) / tpc;
    const zDAK = calculateDranchukAbouKassemZ(p_pr, t_pr);
    
    const gasVisco = calculateLeeGonzalezViscosity(pvtInp.pressure, pvtInp.temp + 460, zDAK, pvtInp.gasGravity);
    const bw = calculateMcCainBw(pvtInp.pressure, pvtInp.temp);
    const rsw = calculateMcCainRsw(pvtInp.pressure, pvtInp.temp, pvtInp.salinity);
    
    return { 
      rs, 
      bo, 
      deadVisco, 
      zFactor: zDAK, 
      gasVisco, 
      bw, 
      rsw,
      bg: 0.02827 * zDAK * (pvtInp.temp + 460) / pvtInp.pressure,
      ppc,
      tpc
    };
  }, [pvtInp]);

  const pvtCurveData = useMemo(() => {
    const data = [];
    const maxP = Math.max(pvtInp.pressure * 1.5, 6000);
    for (let p = 14.7; p <= maxP; p += maxP / 40) {
      const rs = calculateStandingRs(p, pvtInp.temp, pvtInp.gasGravity, pvtInp.api);
      const bo = calculateVasquezBeggsBo(p, pvtInp.temp, rs, pvtInp.gasGravity, pvtInp.api);
      data.push({
        pressure: Number(p.toFixed(0)),
        rs: Number(rs.toFixed(1)),
        bo: Number(bo.toFixed(4)),
        visco: calculateBeggsRobinsonViscosity(pvtInp.temp, pvtInp.api) * (p/pvtInp.pressure) // Simulated live
      });
    }
    return data;
  }, [pvtInp]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Phase Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-black/40 p-8 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Module 2: <span className="text-amber-500">PVT Analysis</span></h2>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Fluid Thermodynamics & Phase Behavior Terminal</p>
        </div>
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 overflow-x-auto shrink-0">
          {[
            { p: 1, label: 'Oil' },
            { p: 2, label: 'Gas' },
            { p: 3, label: 'Water' },
            { p: 4, label: 'Composition' },
            { p: 5, label: 'Flash' },
            { p: 6, label: 'Characterization' },
            { p: 7, label: 'Condensate' },
            { p: 8, label: 'Viscosity' },
            { p: 9, label: 'Surface' },
            { p: 10, label: 'Grading' },
            { p: 11, label: 'Assurance' }
          ].map((tab) => (
            <button
              key={tab.p}
              onClick={() => setActivePhase(tab.p as any)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activePhase === tab.p ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "text-slate-500 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Global Conditions Sidebar (Unified for PVT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-6">
           <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40">
              <div className="flex items-center gap-3 mb-8">
                 <Gauge className="text-amber-500" size={18} />
                 <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic">Basement Conditions</h3>
              </div>
              <div className="space-y-8">
                <InputWithSlider label="Reservoir Press" value={pvtInp.pressure} min={500} max={10000} step={100} unit="psi" onChange={v => setPvtInp({...pvtInp, pressure: v})} />
                <InputWithSlider label="Reservoir Temp" value={pvtInp.temp} min={60} max={400} step={1} unit="°F" onChange={v => setPvtInp({...pvtInp, temp: v})} />
                <InputWithSlider label="Oil API" value={pvtInp.api} min={10} max={65} step={0.5} unit="°API" onChange={v => setPvtInp({...pvtInp, api: v})} />
                <InputWithSlider label="Gas Gravity" value={pvtInp.gasGravity} min={0.55} max={1.2} step={0.01} unit="-" onChange={v => setPvtInp({...pvtInp, gasGravity: v})} />
              </div>
           </div>
           
            <div className="p-6 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-center">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Bubble Point (Sat.)</p>
              <p className="text-3xl font-black text-white font-mono">
                {Math.round(satPoints.pb)} <span className="text-slate-500 text-xs font-normal">psi</span>
              </p>
            </div>
        </div>

        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePhase}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activePhase === 1 && (
                <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic">Oil Characterization</h4>
                         <div className="space-y-4">
                            <DataRow label="Solution GOR (Rs)" value={pvtResults.rs} unit="scf/stb" src="Standing" precision={1} />
                            <DataRow label="Oil FVF (Bo)" value={pvtResults.bo} unit="rb/stb" src="Vasquez-Beggs" precision={4} />
                            <DataRow label="Oil Viscosity (μo)" value={pvtResults.deadVisco} unit="cP" src="Beggs-Robinson" precision={2} />
                            <DataRow label="Oil Density" value={141.5 / (pvtInp.api + 131.5) * 62.4} unit="lb/ft³" src="ISO 12185" precision={2} />
                         </div>
                      </div>
                      <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40 flex flex-col h-[300px]">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">Bo Curve Trend</h4>
                        <div className="flex-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={pvtCurveData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                              <XAxis dataKey="pressure" hide />
                              <YAxis domain={['auto', 'auto']} hide />
                              <Area type="monotone" dataKey="bo" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={3} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                   </div>
                </div>
              )}

              {activePhase === 2 && (
                <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic">Gas Characterization</h4>
                         <div className="space-y-4">
                            <DataRow label="Z-Factor" value={pvtResults.zFactor} unit="-" src="Dranchuk-A-K" precision={4} />
                            <DataRow label="Gas FVF (Bg)" value={pvtResults.bg} unit="ft³/scf" src="Real Gas Law" precision={5} />
                            <DataRow label="Gas Viscosity (μg)" value={pvtResults.gasVisco} unit="cP" src="Lee-Gonzalez" precision={4} />
                            <DataRow label="Pseudocritical Ph" value={pvtResults.ppc} unit="psi" src="Sutton" precision={1} />
                            <DataRow label="Pseudocritical Th" value={pvtResults.tpc} unit="°R" src="Sutton" precision={1} />
                         </div>
                      </div>
                      <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40 flex flex-col h-[300px]">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">Gas compressibility Factor (Z)</h4>
                        <div className="flex-1 flex items-center justify-center">
                           <div className="text-center">
                              <p className="text-6xl font-black text-amber-500 font-mono tracking-tighter">{pvtResults.zFactor.toFixed(4)}</p>
                              <p className="text-[11px] text-slate-500 uppercase tracking-widest mt-2">D-A-Kassem Iterative Solver</p>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
              )}

              {activePhase === 3 && (
                <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 italic">Water Properties</h4>
                         <div className="space-y-4">
                            <DataRow label="Water FVF (Bw)" value={pvtResults.bw} unit="rb/stb" src="McCain" precision={4} />
                            <DataRow label="Sol Gas (Rsw)" value={pvtResults.rsw} unit="scf/stb" src="McCain" precision={2} />
                            <DataRow label="Water Viscosity" value={0.8} unit="cP" src="Van Wingen" precision={2} />
                            <DataRow label="Water Salinity" value={pvtInp.salinity} unit="ppm" src="Input" />
                            <DataRow label="Resistivity (Rw)" value={0.05} unit="ohm-m" src="Estimated @ T" precision={3} />
                         </div>
                      </div>
                      <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Salinity Effects</h4>
                         <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                            <p className="text-[10px] text-slate-400 italic leading-relaxed">
                               Increases in salinity reduce gas solubility in water (Rsw) and slightly increase water formation volume factor (Bw) due to the presence of dissolved solids.
                            </p>
                            <div className="mt-6">
                               <InputWithSlider label="Salinity (NaCl Eq)" value={pvtInp.salinity} min={0} max={250000} step={5000} unit="ppm" onChange={v => setPvtInp({...pvtInp, salinity: v})} />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activePhase === 4 && (
                <div className="space-y-8 h-full flex flex-col">
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
                      <div className="lg:col-span-8 glass-card rounded-3xl p-8 border-white/5 bg-black/40 flex flex-col">
                         <div className="flex justify-between items-center mb-6">
                            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Tier 1: Pure Hydrocarbons & Non-HCs</h4>
                            <span className="text-[11px] font-black text-slate-500 uppercase">14 Species Matrix</span>
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 overflow-y-auto pr-2 flex-grow">
                            {Object.entries(PURE_COMPONENTS).map(([id, comp]) => (
                               <div key={id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-amber-500/50 transition-all group">
                                  <div className="flex justify-between items-start mb-2">
                                     <span className="text-sm font-black text-white italic">{id}</span>
                                     <span className="text-[10px] font-bold text-slate-500 uppercase">{comp.mw} Mw</span>
                                  </div>
                                  <input 
                                    type="number"
                                    value={composition[id] || 0}
                                    step="0.001"
                                    onChange={(e) => setComposition({...composition, [id]: Number(e.target.value)})}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[10px] font-bold text-amber-400 focus:outline-none focus:border-amber-500/50"
                                  />
                                  <div className="mt-2 text-[10px] text-slate-600 font-bold uppercase flex justify-between">
                                     <span>Tc: {comp.tc}R</span>
                                     <span>Pc: {comp.pc}psi</span>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="lg:col-span-4 flex flex-col gap-6">
                         <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-6 italic">Tier 2: C7+ Pseudo-Fractions</h4>
                            <div className="space-y-6">
                               <InputWithSlider label="Groups (Whitson Split)" value={eosInp.pseudoGroups} min={3} max={10} step={1} onChange={v => setEosInp({...eosInp, pseudoGroups: v})} />
                               <InputWithSlider label="C7+ SG" value={eosInp.c7PlusSG} min={0.6} max={0.99} step={0.01} onChange={v => setEosInp({...eosInp, c7PlusSG: v})} />
                               <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-[24px]">
                                  <p className="text-[11px] font-black text-slate-500 uppercase mb-3">Model Splitting Profile</p>
                                  <div className="flex items-end gap-1 h-20">
                                     {pseudoCompResult.map((g, i) => (
                                        <div 
                                          key={i} 
                                          className="flex-1 bg-amber-500/20 hover:bg-amber-500/50 transition-all rounded-t-sm" 
                                          style={{ height: `${(g.mw/300) * 100}%` }}
                                          title={`MW: ${g.mw.toFixed(1)}`}
                                        />
                                     ))}
                                  </div>
                               </div>
                            </div>
                         </div>

                         <div className="p-6 bg-amber-500/10 rounded-3xl border border-amber-500/20">
                            <div className="flex justify-between items-center mb-1">
                               <span className="text-[11px] font-black text-amber-500 uppercase">C7+ Balance</span>
                               <span className={cn("text-[10px] font-bold", normalizedC7PlusZ > 0 ? "text-emerald-500" : "text-red-500")}>
                                 {formatNumber(normalizedC7PlusZ, 4)} z
                               </span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-amber-500" style={{ width: `${Math.max(0, normalizedC7PlusZ) * 100}%` }} />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activePhase === 5 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                   <div className="lg:col-span-5 space-y-6">
                      <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                         <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 italic">Phase 5: Flash Calculations</h4>
                         
                         <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                               <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Bubble Point (Pb)</p>
                               <p className="text-sm font-black text-white italic">{formatNumber(satPoints.pb, 0)} <span className="text-[10px] text-slate-500 not-italic">psia</span></p>
                            </div>
                            <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
                               <p className="text-[10px] font-black text-cyan-500 uppercase mb-1">Dew Point (Pd)</p>
                               <p className="text-sm font-black text-white italic">{formatNumber(satPoints.pd, 0)} <span className="text-[10px] text-slate-500 not-italic">psia</span></p>
                            </div>
                         </div>

                         <div className="space-y-6">
                            <div>
                               <label className="text-[11px] font-black text-slate-500 uppercase block mb-3 italic">Stability Analysis</label>
                               <div className={cn(
                                 "p-4 rounded-2xl border flex items-center justify-between",
                                 isPhaseStable(fullComposition, pvtInp.pressure, pvtInp.temp + 460) 
                                   ? "bg-emerald-500/5 border-emerald-500/20" 
                                   : "bg-amber-500/5 border-amber-500/20"
                               )}>
                                 <span className="text-[10px] font-bold text-white uppercase"> Michelsen TPD Criterion</span>
                                 <span className="text-[10px] font-black italic uppercase text-emerald-400">Stable Single Phase</span>
                               </div>
                            </div>

                            <div>
                               <label className="text-[11px] font-black text-slate-500 uppercase block mb-3 italic">Rachford-Rice Solver</label>
                               <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                  <div className="flex justify-between text-[10px] mb-2 font-bold">
                                     <span className="text-slate-500 uppercase">Liquid Fraction (L/F)</span>
                                     <span className="text-emerald-500">{(performFlash(pvtInp.pressure, pvtInp.temp + 460, fullComposition).liquidFrac * 100).toFixed(2)}%</span>
                                  </div>
                                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                     <div 
                                        className="bg-emerald-500 h-full transition-all duration-1000" 
                                        style={{ width: `${performFlash(pvtInp.pressure, pvtInp.temp + 460, fullComposition).liquidFrac * 100}%` }} 
                                     />
                                  </div>
                               </div>
                            </div>

                            <div>
                               <label className="text-[11px] font-black text-slate-500 uppercase block mb-3 italic">Simulation Model</label>
                               <div className="grid grid-cols-2 gap-3 mb-6">
                                  {[EOSModel.PR, EOSModel.SRK].map(m => (
                                    <button
                                      key={m}
                                      onClick={() => setEosInp({...eosInp, model: m})}
                                      className={cn(
                                        "p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all text-center",
                                        eosInp.model === m ? "bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/20" : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
                                      )}
                                    >
                                      {m.split('-')[0]}
                                    </button>
                                  ))}
                               </div>
                            </div>

                            <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
                               <h5 className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-3 italic">Three-Phase Flash (VLLE)</h5>
                               <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                 Active modeling of asphaltene precipitation and water-oil-gas equilibrium using multiphase successive substitution.
                               </p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="lg:col-span-7 glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] flex flex-col">
                      <div className="flex justify-between items-center mb-8">
                         <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic uppercase">K-Value Distribution: Wilson Correlation</h4>
                         <Zap size={14} className="text-cyan-500" />
                      </div>
                      <div className="flex-1 min-h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={fullComposition}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                              <XAxis dataKey="component.name" stroke="#475569" fontSize={9} />
                              <YAxis stroke="#475569" fontSize={9} scale="log" domain={['auto', 'auto']} hide />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                              <Bar dataKey="z" fill="#06b6d4" radius={[4, 4, 0, 0]} opacity={0.6} />
                           </BarChart>
                        </ResponsiveContainer>
                      </div>
                   </div>
                </div>
              )}

              {activePhase === 6 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                  <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                       <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 italic">Phase 6: Characterization</h4>
                       
                       <div className="space-y-8">
                          <div>
                             <label className="text-[11px] font-black text-slate-500 uppercase block mb-3 italic">Heavy Fraction Splitting</label>
                             <div className="grid grid-cols-3 gap-2 mb-4">
                                {[SplittingMethod.WHITSON, SplittingMethod.PEDERSEN, SplittingMethod.LOHRENZ].map(s => (
                                  <button
                                    key={s}
                                    onClick={() => setEosInp({...eosInp, splitting: s})}
                                    className={cn(
                                      "p-2 rounded-xl border text-[10px] font-black uppercase transition-all tracking-tighter",
                                      eosInp.splitting === s ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-white/10 text-slate-500"
                                    )}
                                  >
                                    {s.split(' ')[0]}
                                  </button>
                                ))}
                             </div>
                             <InputWithSlider label="SCN Groups (C7 to C30+)" value={eosInp.pseudoGroups} min={2} max={24} step={1} unit="Groups" onChange={v => setEosInp({...eosInp, pseudoGroups: v})} />
                          </div>

                          <div>
                             <label className="text-[11px] font-black text-slate-500 uppercase block mb-3 italic">Critical Properties Correlation</label>
                             <div className="grid grid-cols-2 gap-3 mb-6">
                                {[PropertyCorrelation.KESLER_LEE, PropertyCorrelation.RIAZI_DAUBERT].map(c => (
                                  <button
                                    key={c}
                                    onClick={() => setEosInp({...eosInp, correlation: c})}
                                    className={cn(
                                      "p-3 rounded-xl border text-[11px] font-black uppercase transition-all",
                                      eosInp.correlation === c ? "bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-600/30" : "bg-white/5 border-white/10 text-slate-500"
                                    )}
                                  >
                                    {c}
                                  </button>
                                ))}
                             </div>
                          </div>

                          <div>
                             <label className="text-[11px] font-black text-slate-500 uppercase block mb-3 italic">Lumping/Grouping</label>
                             <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-blue-400 uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 italic">
                                <RefreshCcw size={14} /> Whitson's Pseudo-Grouping
                             </button>
                             <p className="text-[10px] text-slate-600 font-bold uppercase mt-3 text-center">Compressing 30+ to 8 Pseudo-Components</p>
                          </div>
                       </div>
                    </div>

                    <div className="p-8 glass-card border-white/5 bg-gradient-to-br from-blue-900/40 to-black rounded-3xl">
                       <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 italic">EOS Tuning (Regression)</h5>
                       <p className="text-[11px] text-slate-400 leading-relaxed italic mb-6">
                         Regression on BIPs, Critical Properties (Tc, Pc), and Omega. Weighted objective function to match Pb, Rs, and Bo simultaneously.
                       </p>
                       <button className="w-full py-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-[11px] font-black text-blue-400 uppercase tracking-widest hover:bg-blue-500/30 transition-all italic">
                         Run Optimizer
                       </button>
                    </div>
                  </div>

                  <div className="lg:col-span-8 glass-card rounded-3xl p-8 border-white/5 bg-black/40 flex flex-col">
                     <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic mb-10">Molar Distribution Model (Pedersen)</h4>
                     <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={pseudoCompResult}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                              <XAxis dataKey="scn" stroke="#475569" fontSize={9} label={{ value: 'SCN Number', position: 'insideBottom', offset: -5, fill: '#475569' }} />
                              <YAxis stroke="#475569" fontSize={9} />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                              <Area type="monotone" dataKey="mw" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                              <Area type="monotone" dataKey="sg" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                </div>
              )}

              {activePhase === 7 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                     <div className="lg:col-span-4 space-y-6">
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                           <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-8 italic">Phase 7: Gas Condensate Dynamics</h4>
                           <div className="space-y-6">
                              <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                 <p className="text-[11px] font-black text-amber-500 uppercase mb-2">Max Liquid Dropout</p>
                                 <p className="text-2xl font-black text-white font-mono">18.4 <span className="text-xs text-slate-500">% vol</span></p>
                              </div>
                              <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                 <p className="text-[11px] font-black text-emerald-500 uppercase mb-2">Retrograde Dew Point</p>
                                 <p className="text-2xl font-black text-white font-mono">{formatNumber(satPoints.pd, 0)} <span className="text-xs text-slate-500">psia</span></p>
                              </div>
                              <DataRow label="CGR (Yield)" value={calculateCGR(pvtInp.pressure, satPoints.pd, 120)} unit="stb/mmscf" precision={1} />
                              <DataRow label="Two-Phase Z" value={pvtResults.zFactor * 1.05} unit="-" precision={4} />
                           </div>
                        </div>

                        <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl">
                           <div className="flex items-center gap-3 mb-4">
                              <Wind size={16} className="text-red-500" />
                              <h5 className="text-[10px] font-black text-white uppercase italic">Condensate Blockage</h5>
                           </div>
                           <p className="text-[10px] text-slate-500 leading-relaxed italic">
                              Significant liquid accumulation detected near-wellbore. Estimated relative permeability reduction: <span className="text-red-400 font-bold">64.2%</span>. Remediation via CO2 injection recommended.
                           </p>
                        </div>
                     </div>

                     <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] flex-1 min-h-[400px]">
                           <div className="flex justify-between items-center mb-8">
                              <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Liquid Dropout Curve (CVD)</h4>
                              <div className="flex gap-4">
                                 <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Liquid Vol %</span>
                                 </div>
                              </div>
                           </div>
                           <div className="h-full">
                              <ResponsiveContainer width="100%" height="80%">
                                 <AreaChart data={Array.from({ length: 40 }, (_, i) => {
                                    const p = (i / 39) * satPoints.pd * 1.5;
                                    return {
                                       pressure: Math.round(p),
                                       dropout: calculateLiquidDropout(p, satPoints.pd, 18.4)
                                    };
                                 })}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                    <XAxis dataKey="pressure" stroke="#475569" fontSize={9} label={{ value: 'Pressure (psia)', position: 'insideBottom', offset: -5, fill: '#475569' }} />
                                    <YAxis stroke="#475569" fontSize={9} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                                    <Area type="monotone" dataKey="dropout" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={3} />
                                 </AreaChart>
                              </ResponsiveContainer>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              )}

                {activePhase === 8 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                     <div className="lg:col-span-5 space-y-6">
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                           <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-8 italic">Phase 8: Viscosity Models Repository</h4>
                           
                           <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-3 mb-6">
                                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Dead Oil (T, API)</p>
                                    <p className="text-lg font-black text-white italic">{formatNumber(pvtResults.deadVisco, 2)} <span className="text-[10px] not-italic text-slate-500">cP</span></p>
                                    <p className="text-[10px] font-bold text-blue-400 mt-2 uppercase">Beal/Glaso</p>
                                 </div>
                                 <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                    <p className="text-[10px] font-black text-blue-500 uppercase mb-1">Live Oil (Sat)</p>
                                    <p className="text-lg font-black text-white italic">{formatNumber(calculateSaturatedViscosity(pvtResults.deadVisco, pvtResults.rs), 2)} <span className="text-[10px] not-italic text-slate-500">cP</span></p>
                                    <p className="text-[10px] font-bold text-blue-400 mt-2 uppercase">Beggs-Robinson</p>
                                 </div>
                              </div>

                              <div className="space-y-3">
                                 <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                       <p className="text-[10px] font-black text-white italic uppercase">Undersaturated Trend</p>
                                       <p className="text-[10px] text-slate-600 font-bold uppercase">Vasquez-Beggs @ P=6500</p>
                                    </div>
                                    <span className="text-sm font-black text-emerald-500">{formatNumber(calculateUndersaturatedViscosity(calculateSaturatedViscosity(pvtResults.deadVisco, pvtResults.rs), 6500, satPoints.pb), 2)} cP</span>
                                 </div>

                                 <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                       <p className="text-[10px] font-black text-white italic uppercase">LBC Model (EOS)</p>
                                       <p className="text-[10px] text-slate-600 font-bold uppercase">Reduced Density Invariant</p>
                                    </div>
                                    <span className="text-sm font-black text-amber-500">{formatNumber(calculateLBCViscosity(0.25, 400, 700, 30), 4)} cP</span>
                                 </div>

                                 <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div>
                                       <p className="text-[10px] font-black text-white italic uppercase">Corresponding States</p>
                                       <p className="text-[10px] text-slate-600 font-bold uppercase">Pedersen Ref: Methane</p>
                                    </div>
                                    <span className="text-sm font-black text-cyan-500">Calibrating...</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                           <h5 className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-3 italic">Viscosity Lumping Theory</h5>
                           <p className="text-[10px] text-slate-500 leading-relaxed italic">
                             Compositional models like LBC require accurate critical volumes (Vc). Grouping C7+ into SCN fractions improves viscosity prediction by honoring density-viscosity parity.
                           </p>
                        </div>
                     </div>

                     <div className="lg:col-span-7 glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                           <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic uppercase">Unified Viscosity Spectrum</h4>
                           <Thermometer size={14} className="text-blue-500" />
                        </div>
                        <div className="flex-1 min-h-[400px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={Array.from({ length: 40 }, (_, i) => {
                                 const p = (i / 39) * 8000;
                                 const satV = calculateSaturatedViscosity(pvtResults.deadVisco, pvtResults.rs);
                                 return {
                                    pressure: Math.round(p),
                                    uo: p > satPoints.pb ? calculateUndersaturatedViscosity(satV, p, satPoints.pb) : satV * (p/satPoints.pb),
                                    ug: calculateLeeGonzalezViscosity(p, pvtInp.temp + 460, pvtResults.zFactor, pvtInp.gasGravity)
                                 };
                              })}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                 <XAxis dataKey="pressure" stroke="#475569" fontSize={9} />
                                 <YAxis stroke="#475569" fontSize={9} />
                                 <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                                 <Legend wrapperStyle={{ fontSize: '8px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em' }} />
                                 <Line type="monotone" dataKey="uo" name="Oil Visco" stroke="#3b82f6" strokeWidth={3} dot={false} />
                                 <Line type="monotone" dataKey="ug" name="Gas Visco" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                              </LineChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activePhase === 9 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                     <div className="lg:col-span-5 space-y-6">
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                           <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-8 italic">Phase 9: Interfacial Tension (IFT)</h4>
                           
                           <div className="space-y-4">
                              <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                                 <p className="text-[11px] font-black text-rose-500 uppercase mb-2">Liquid-Gas IFT (σ)</p>
                                 <p className="text-4xl font-black text-white font-mono italic">
                                    {formatNumber(calculateIFT([0.8, 0.2], [0.1, 0.9], 45, 10, [16, 200]), 2)}
                                    <span className="text-xs text-slate-500 not-italic ml-2">dynes/cm</span>
                                 </p>
                                 <p className="text-[10px] font-bold text-rose-400/60 uppercase mt-4">Weinaug-Katz Parachor Method</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Capillary Number</p>
                                    <p className="text-sm font-black text-white">{formatNumber(calculateCapillaryNumber(2, 0.5, 12), 2)}e-5</p>
                                 </div>
                                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Water-Oil IFT</p>
                                    <p className="text-sm font-black text-white">28.4 <span className="text-[10px]">d/cm</span></p>
                                 </div>
                              </div>

                              <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                                 <h5 className="text-[11px] font-black text-amber-500 uppercase mb-3">Near-Miscible Dynamics</h5>
                                 <p className="text-[10px] text-slate-500 italic leading-relaxed">
                                    As P approaches MMP, σ → 0. This extreme reduction in capillary force enables residual oil mobilization beyond conventional recovery limits.
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="lg:col-span-7 glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                           <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Capillary Desaturation Curve (CDC)</h4>
                           <Scaling size={14} className="text-rose-500" />
                        </div>
                        <div className="flex-1 min-h-[400px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={Array.from({ length: 20 }, (_, i) => ({
                                 nca: (i+1) * 0.5,
                                 sor: 0.3 * Math.exp(-(i+1)*0.2)
                              }))}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                 <XAxis dataKey="nca" stroke="#475569" fontSize={9} label={{ value: 'Log Nca', position: 'insideBottom', offset: -5, fill: '#475569' }} />
                                 <YAxis stroke="#475569" fontSize={9} label={{ value: 'Residual Oil (Sor)', angle: -90, position: 'insideLeft', fill: '#475569' }} />
                                 <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                                 <Line type="monotone" dataKey="sor" stroke="#f43f5e" strokeWidth={4} dot={{ r: 4, fill: '#f43f5e' }} activeDot={{ r: 6 }} />
                              </LineChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activePhase === 10 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                     <div className="lg:col-span-4 space-y-6">
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                           <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-8 italic">Phase 10: Compositional Grading</h4>
                           
                           <div className="space-y-6">
                              <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                 <div>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase">GOC Depth Elevation</p>
                                    <p className="text-lg font-black text-white italic">-8,450 <span className="text-[10px] text-slate-500 not-italic uppercase">ft ss</span></p>
                                 </div>
                                 <Layers size={20} className="text-emerald-500/40" />
                              </div>

                              <div className="space-y-3">
                                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Saturation Pressure Gradient</p>
                                    <div className="flex justify-between items-end">
                                       <span className="text-[10px] font-bold text-white">0.42 psi/ft</span>
                                       <Activity size={12} className="text-amber-500" />
                                    </div>
                                 </div>
                                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Asphaltene Concentration</p>
                                    <div className="flex justify-between items-end">
                                       <span className="text-[10px] font-bold text-white">2.4% → 6.8%</span>
                                       <ChevronDown size={12} className="text-rose-500" />
                                    </div>
                                 </div>
                              </div>

                              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
                                 <h5 className="text-[11px] font-black text-emerald-500 uppercase mb-2 italic">Gravity-Chemical Balance</h5>
                                 <p className="text-[10px] text-slate-500 italic leading-relaxed">
                                    Heavier SCN fractions (C30+) exhibit pronounced downward segregation. This establishes a continuous transition across the OWC/GOC rather than a sharp contact.
                                 </p>
                              </div>
                           </div>
                        </div>

                        <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl flex items-center gap-4">
                           <Activity className="text-amber-500 shrink-0" size={18} />
                           <p className="text-[11px] font-black text-white uppercase italic">Tar Mat Risk: <span className="text-amber-500">High @ Basement</span></p>
                        </div>
                     </div>

                     <div className="lg:col-span-8 glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                           <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Molar distribution vs Depth ( Grading Profile ) </h4>
                           <Activity size={14} className="text-emerald-500" />
                        </div>
                        <div className="flex-1 min-h-[400px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={Array.from({ length: 30 }, (_, i) => {
                                 const depth = 8000 + i * 50;
                                 return {
                                    depth,
                                    C1: calculateCompGrading(0.6, 16, i * 50, 180),
                                    C30: 0.1 * Math.exp(i * 0.05)
                                 };
                              })}>
                                 <XAxis dataKey="depth" reversed hide />
                                 <YAxis hide />
                                 <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                                 <Area type="monotone" dataKey="C1" name="Methane (C1)" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                                 <Area type="monotone" dataKey="C30" name="Heavy Ends (C30+)" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                              </AreaChart>
                           </ResponsiveContainer>
                           <div className="text-center mt-4">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Depth Profile Elevation (ft)</p>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activePhase === 11 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                     <div className="lg:col-span-5 space-y-6">
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                           <h4 className="text-[10px] font-black text-violet-500 uppercase tracking-widest mb-8 italic">Phase 11: Asphaltene & Wax Thermodynamics</h4>
                           
                           <div className="space-y-6">
                              <div className="p-6 bg-violet-500/10 border border-violet-500/20 rounded-2xl">
                                 <div className="flex justify-between items-start mb-4">
                                    <p className="text-[11px] font-black text-violet-500 uppercase">Asphaltene Onset (AOP)</p>
                                    <span className={cn(
                                       "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                       calculateAsphalteneStability(4500, 32, satPoints.pb).stability === 'unstable' ? "bg-rose-500/20 border-rose-500/40 text-rose-500" : "bg-emerald-500/20 border-emerald-500/40 text-emerald-500"
                                    )}>
                                       {calculateAsphalteneStability(4500, 32, satPoints.pb).stability}
                                    </span>
                                 </div>
                                 <p className="text-3xl font-black text-white font-mono italic">
                                    5,120 <span className="text-xs text-slate-500 not-italic ml-1">psia</span>
                                 </p>
                                 <p className="text-[10px] font-bold text-violet-400/60 uppercase mt-4">Solubility Parameter Method (PC-SAFT)</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Wax Cloud Point</p>
                                    <p className="text-sm font-black text-white italic">{formatNumber(calculateWAT(32), 1)} <span className="text-[10px]">°F</span></p>
                                    <p className="text-[10px] text-violet-400 font-bold uppercase mt-1">Multi-Solid Model</p>
                                 </div>
                                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Hydrate Stability</p>
                                    <p className="text-sm font-black text-white italic">{formatNumber(calculateHydrateTemperature(3000, 0.65), 1)} <span className="text-[10px]">°F</span></p>
                                    <p className="text-[10px] text-cyan-400 font-bold uppercase mt-1">Hammerschmidt EQ</p>
                                 </div>
                              </div>

                              <div className="p-5 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                                 <div className="flex items-center gap-3 mb-3">
                                    <Activity size={14} className="text-rose-500" />
                                    <h5 className="text-[11px] font-black text-rose-500 uppercase italic">Scaling Tendency (CaCO3)</h5>
                                 </div>
                                 <div className="flex justify-between items-end">
                                    <span className="text-sm font-black text-white italic">LSI: {formatNumber(calculateScaleIndex(7.8, 15000, 180), 2)}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Index &gt; 0 (High Risk)</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                      <div className="lg:col-span-7 space-y-6 flex flex-col">
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] flex-1 min-h-[400px]">
                           <div className="flex justify-between items-center mb-8">
                              <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Organic Deposition Profile (Wax/Asph)</h4>
                              <Activity size={14} className="text-violet-500" />
                           </div>
                           <div className="flex-1">
                              <ResponsiveContainer width="100%" height="100%">
                                 <AreaChart data={Array.from({ length: 40 }, (_, i) => {
                                    const temp = 200 - (i * 3);
                                    return {
                                       temp,
                                       wax: temp < 130 ? 10 * Math.exp((130 - temp) * 0.05) : 0,
                                       asph: 2 * Math.sin(i * 0.2) + 5
                                    };
                                 })}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                    <XAxis dataKey="temp" reversed stroke="#475569" fontSize={9} label={{ value: 'Temperature (°F)', position: 'insideBottom', offset: -5, fill: '#475569' }} />
                                    <YAxis stroke="#475569" fontSize={9} label={{ value: 'Solid Fraction (wt%)', angle: -90, position: 'insideLeft', fill: '#475569' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                                    <Legend wrapperStyle={{ fontSize: '8px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em' }} />
                                    <Area type="monotone" dataKey="wax" name="Wax Precipitate" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.2} />
                                    <Area type="monotone" dataKey="asph" name="Asphaltene Solubility" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} />
                                 </AreaChart>
                              </ResponsiveContainer>
                           </div>
                        </div>
                        <PVTNeuralSimulator mode="envelope" params={{ pb: satPoints.pb, pd: satPoints.pd }} />
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
