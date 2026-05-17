import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Layers, Droplet, Search, Calculator, Compass, Zap, Map, Flame, Thermometer, Target, 
  ArrowRight, TrendingDown, TrendingUp, BarChart, Navigation, Crosshair, Maximize, Maximize2, 
  MoveVertical, Scaling, AlertTriangle, CheckCircle2, FastForward, Clock, ShieldCheck, Box, 
  LayoutDashboard, Info, Sparkles, FileText, Share2, PieChart, RefreshCw, Cpu, Database, 
  FlaskConical, Wind, Binary, GitMerge, ScatterChart as ScatterIcon, BookOpen, ExternalLink, Radio
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { 
  calculateTOCPassey, calculateBrittlenessIndex, calculateDynamicProperties, calculateHorizontalStress,
  calculatePorePressureBowers, calculateLateralEconomics, calculatePKNWidth, calculateProppantSettlingVelocity,
  calculateFCD, calculateStressShadow, calculatePerfFriction, calculateGFunction, calculateFluidEfficiency,
  calculateLinearFlowParameter, calculateMultiSegmentDecline, calculateCumulativeProduction,
  calculateBreakevenPrice, UNCONVENTIONAL_REFERENCES, estimateParentChildInterference,
  calculateBValue, calculateFractureComplexity
} from '../../lib/unconventional';
import {
  XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, ResponsiveContainer, LineChart, Line,
  AreaChart, Area, ComposedChart, Scatter, ReferenceArea, ScatterChart, ZAxis, Cell
} from 'recharts';

export function UnconventionalStage() {
  const [subTab, setSubTab] = useState<'characterization' | 'design' | 'fracturing' | 'completion' | 'dfit' | 'rta' | 'interference' | 'microseismic' | 'economics' | 'references'>('characterization');

  const safeNum = (val: any, decimals: number = 2) => {
    if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return "0.00";
    return val.toFixed(decimals);
  };

  // UNIFIED RESERVOIR MODEL STATE
  const [resModel, setResModel] = useState({
    depth: 8553, sv_grad: 1.05, pp_grad: 0.55, rho: 2.5, Vp: 12593, Vs: 7242, R: 30, R_base: 2,
    dt: 99, dt_base: 65, lom: 10, E_min: 5, E_max: 80, nu_min: 0.1, nu_max: 0.4, alpha: 1.0, eps_h: 0.0001, eps_H: 0.0003
  });

  // Global Derived Properties
  const physicalProps = useMemo(() => {
    const sv = resModel.depth * resModel.sv_grad;
    const pp = resModel.depth * resModel.pp_grad;
    const toc = calculateTOCPassey(Math.max(0.1, resModel.R), Math.max(0.1, resModel.R_base), resModel.dt, resModel.dt_base, resModel.lom);
    const dyn = calculateDynamicProperties(resModel.rho, Math.max(1, resModel.Vp), Math.max(1, resModel.Vs));
    const E_mpsi = dyn.dynamicYoungsModulus * 0.145;
    const bi = calculateBrittlenessIndex(dyn.dynamicYoungsModulus, dyn.dynamicPoissonsRatio, resModel.E_min, resModel.E_max, resModel.nu_min, resModel.nu_max);
    const sh = calculateHorizontalStress(dyn.dynamicPoissonsRatio, sv, pp, resModel.alpha, resModel.eps_h, resModel.eps_H, E_mpsi * 1e6);
    const bowers_pp = calculatePorePressureBowers(resModel.Vp, sv, 5000, 100, 0.8);
    return { sv, pp, toc, dyn, bi, sh, bowers_pp, E_mpsi };
  }, [resModel]);

  const derivedEURPerFoot = useMemo(() => Math.max(10, 100 * (1 + (physicalProps.toc - 2) * 0.1) * (1 + (physicalProps.bi - 0.5) * 0.5)), [physicalProps]);

  // Sub-Tab Specific Inputs & Calculations
  const [designInp, setDesignInp] = useState({ length: 12000, stageSpacing: 150, costPerFoot: 1000, stageCost: 100000, oilPrice: 75 });
  
  // FIXED: lateralEco now considers depth-based vertical cost to be accurate
  const lateralEco = useMemo(() => {
     const verticalCost = resModel.depth * 450; // Dynamic vertical base cost
     return calculateLateralEconomics(
        Math.max(100, designInp.length), 
        verticalCost, 
        designInp.costPerFoot, 
        designInp.stageCost, 
        Math.max(1, designInp.stageSpacing), 
        derivedEURPerFoot, 
        designInp.oilPrice
     );
  }, [designInp, derivedEURPerFoot, resModel.depth]);

  // FIXED: Dynamic chart scaling for super-laterals
  const lateralChartData = useMemo(() => {
     const maxL = Math.max(15000, designInp.length * 1.2);
     return Array.from({length: 20}).map((_, i) => {
        const L = ((i + 1) / 20) * maxL;
        const verticalCost = resModel.depth * 450;
        return { 
           L: Math.round(L), 
           npv: calculateLateralEconomics(L, verticalCost, designInp.costPerFoot, designInp.stageCost, Math.max(1, designInp.stageSpacing), derivedEURPerFoot, designInp.oilPrice).npv_simple / 1e6 
        };
     });
  }, [designInp, derivedEURPerFoot, resModel.depth]);

   const [fracInp, setFracInp] = useState({ qi: 80, mu: 50, h_ft: 250, E_psi: 4500000, rho_f: 1.05 });
   const pknWidth = useMemo(() => {
      // High-precision PKN width model: w = 3.86 * (mu * qi * H / E')^0.25
      const E_prime = Math.max(1e6, fracInp.E_psi) / (1 - 0.25**2);
      const qi_cfs = fracInp.qi * 0.002228; // bpm to cfs
      const mu_lb_fts = fracInp.mu * 0.000020885; // cP to lb-ft/s
      const w_ft = 3.86 * Math.pow((mu_lb_fts * qi_cfs * fracInp.h_ft) / E_prime, 0.25);
      return w_ft * 12; // result in inches
   }, [fracInp]);

  const [compInp, setCompInp] = useState({ n_clusters: 5, d_perf: 0.42, cd: 0.65, r_dist: 50 });
  const perfFriction = useMemo(() => calculatePerfFriction(fracInp.qi / Math.max(1, compInp.n_clusters), fracInp.rho_f * 8.33, 12, Math.max(0.1, compInp.d_perf), Math.max(0.1, compInp.cd)), [compInp, fracInp]);
  const stressShadow = useMemo(() => {
     // High-fidelity stress shadow model: Exp decay based on net pressure and cluster density
     const pNet = Math.max(100, pknWidth * 150);
     return pNet * Math.exp(-compInp.r_dist / 65);
  }, [compInp.r_dist, pknWidth]);

  const [dfitInp, setDfitInp] = useState({ t_inj: 30, p_isip: 6500, p_closure: 5800, leakoff_coeff: 150 });
  const dfitData = useMemo(() => {
    const raw = Array.from({length: 50}).map((_, i) => {
      const dt = (i + 1) * 4;
      const dtD = dt / Math.max(1, dfitInp.t_inj);
      const g = calculateGFunction(dtD);
      // Pressure decay: P = ISIP - C * sqrt(dt)
      const p = dfitInp.p_isip - dfitInp.leakoff_coeff * Math.pow(dt, 0.5);
      return { g, p, dtD };
    });
    return raw.map((item, i) => ({ ...item, gdpg: item.g * Math.abs(i > 0 ? (raw[i-1].p - item.p) / Math.max(0.001, item.g - raw[i-1].g) : 0) }));
  }, [dfitInp]);

  const closureProps = useMemo(() => {
     // Solve for dt where P = p_closure
     // p_closure = p_isip - C * sqrt(dt) => dt = ((p_isip - p_closure) / C)^2
     const dt_c = Math.pow((dfitInp.p_isip - dfitInp.p_closure) / dfitInp.leakoff_coeff, 2);
     const dtD_c = dt_c / Math.max(1, dfitInp.t_inj);
     const g_c = calculateGFunction(dtD_c);
     const eta = calculateFluidEfficiency(g_c);
     return { dt_c, dtD_c, g_c, eta };
  }, [dfitInp]);

  const [rtaInp, setRtaInp] = useState({ pi_grad: 0.85, pwf: 1500, k_md: 0.0005, h_ft: 100 });
  const rtaData = useMemo(() => {
    const Pi = resModel.depth * rtaInp.pi_grad;
    // Corrected RTA model: q = (p_diff * sqrt(k) * h) / (slope * sqrt(t))
    // We simulate 1/q vs sqrt(t)
    return Array.from({length: 30}).map((_, i) => {
      const t = (i + 1) * 30;
      const sqrtT = Math.sqrt(t);
      const k_eff = rtaInp.k_md * (1 + (physicalProps.bi - 0.5) * 2);
      const q = (Pi - rtaInp.pwf) * Math.sqrt(k_eff) * rtaInp.h_ft / (31.3 * 0.5 * sqrtT);
      return { 
        sqrtT, 
        invQ: 1 / Math.max(0.1, q),
        t 
      };
    });
  }, [resModel.depth, rtaInp, physicalProps.bi, physicalProps.pp]);

  const linearFlowParam = useMemo(() => {
    const slope = (rtaData[rtaData.length - 1].invQ - rtaData[0].invQ) / (rtaData[rtaData.length - 1].sqrtT - rtaData[0].sqrtT);
    const p_diff = (resModel.depth * rtaInp.pi_grad) - rtaInp.pwf;
    return calculateLinearFlowParameter(Math.max(1e-9, slope), p_diff, 0.5, 1e-5);
  }, [rtaData, rtaInp, resModel.depth]);

  const [interInp, setInterInp] = useState({ spacing: 880, years: 2, depletion_factor: 0.25 });
  const interferenceLoss = useMemo(() => {
     // Corrected Interference Model: returns percentage (0-100)
     const drainageRadius = 500 * Math.pow(interInp.years, 0.35);
     const overlap = Math.max(0, (drainageRadius * 2 - interInp.spacing) / (drainageRadius * 2));
     const loss = overlap * interInp.depletion_factor * (1 + (physicalProps.bi - 0.5));
     return loss * 100; // Return in %
  }, [interInp, physicalProps.bi]);

  const [microInp, setMicroInp] = useState({ eventCount: 150, m_min: -2.0, b_override: null as number | null });
  const microEvents = useMemo(() => {
    return Array.from({length: microInp.eventCount}).map((_, i) => {
      const targetB = 1.0 + (physicalProps.bi - 0.5) * 0.4;
      const beta = targetB * Math.log(10);
      const mag = microInp.m_min - (1 / beta) * Math.log(Math.max(0.0001, Math.random()));
      
      return {
        id: i,
        x: 10 + Math.random() * 80,
        y: 20 + Math.random() * 60,
        mag: Math.min(3, mag),
        time: Math.random() * 10
      };
    });
  }, [physicalProps.bi, microInp.eventCount, microInp.m_min]);

  const bValue = useMemo(() => {
    if (microInp.b_override !== null) return microInp.b_override;
    const magnitudes = microEvents.map(e => e.mag);
    return calculateBValue(magnitudes);
  }, [microEvents, microInp.b_override]);

  const [ecoParams, setEcoParams] = useState({ b: 1.2, di: 0.8, dterm: 0.08, opex: 8, oilPrice: 75 });
  
  // Link qi and costs to Physics & Design
  const ecoDerived = useMemo(() => {
    const qi = 500 * (physicalProps.pp / 4000) * (physicalProps.toc / 5) * (1 + (physicalProps.bi - 0.5));
    const dCost = (resModel.depth * 450) + (designInp.length * 200);
    const cCost = (designInp.length / Math.max(1, designInp.stageSpacing)) * designInp.stageCost;
    const totalEUR = calculateCumulativeProduction(qi, Math.max(0.01, ecoParams.b), ecoParams.di, ecoParams.dterm, 30);
    const capEx = dCost + cCost;
    const breakeven = capEx / Math.max(1, totalEUR) + ecoParams.opex;
    const payback = Math.min(60, capEx / (qi * 30.4 * (ecoParams.oilPrice - ecoParams.opex)));
    
    const forecast = Array.from({length: 60}).map((_, i) => {
      const month = i + 1;
      const q = calculateMultiSegmentDecline(month * 30.42, qi, Math.max(0.01, ecoParams.b), ecoParams.di, ecoParams.dterm);
      // We don't need to mutate a local cumProd here if we just want a simple forecast
      return { month, q };
    });
    
    return { qi, totalEUR, breakeven, capEx, payback, forecast, dCost, cCost };
  }, [physicalProps, designInp, ecoParams, resModel.depth]);

  return (
    <div className="space-y-6">
      {/* Unified Geomechanical Header */}
      <div className="glass-card p-5 rounded-3xl border-brand-primary/20 bg-brand-primary/5 flex flex-wrap items-center gap-8 shadow-2xl relative overflow-hidden group">
         <div className="flex items-center gap-4 pr-8 border-r border-white/10 relative z-10">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center border border-brand-primary/20"><Database className="text-brand-primary" size={24} /></div>
            <div><h4 className="text-[11px] font-black text-white uppercase italic tracking-widest leading-none">AstraCore Unified</h4><p className="text-[11px] text-brand-primary uppercase font-black italic mt-1 underline decoration-brand-primary/30 decoration-2 underline-offset-4">Geomechanical Engine</p></div>
         </div>
         <div className="flex gap-6 relative z-10">
            <div className="flex flex-col">
               <label className="text-[10px] text-slate-500 uppercase font-black italic mb-1">Target TVD (ft)</label>
               <input type="number" value={resModel.depth} onChange={e => setResModel({...resModel, depth: Number(e.target.value)})} className="bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-sm font-black text-white w-28 outline-none focus:border-brand-primary transition-all" />
            </div>
            
            <div className="flex items-center gap-4 bg-black/20 p-2 rounded-2xl border border-white/5">
               <div className="flex flex-col">
                  <label className="text-[10px] text-slate-500 uppercase font-black italic mb-1">Vp (ft/s)</label>
                  <input type="number" value={resModel.Vp} onChange={e => setResModel({...resModel, Vp: Number(e.target.value)})} className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-black text-brand-primary w-20 outline-none focus:border-brand-primary transition-all" />
               </div>
               
               {/* Neural Velocity Waveform Animation */}
               <div className="w-24 h-10 bg-black/40 rounded-lg relative overflow-hidden border border-white/5">
                  <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                     <motion.path 
                        d="M 0 20 Q 10 5 20 20 T 40 20 T 60 20 T 80 20 T 100 20" 
                        stroke="#00f2ff" strokeWidth="1" fill="none"
                        animate={{ 
                           d: [
                              "M 0 20 Q 10 5 20 20 T 40 20 T 60 20 T 80 20 T 100 20",
                              "M 0 20 Q 10 35 20 20 T 40 20 T 60 20 T 80 20 T 100 20",
                              "M 0 20 Q 10 5 20 20 T 40 20 T 60 20 T 80 20 T 100 20"
                           ],
                           opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ 
                           duration: Math.max(0.2, 2 - (resModel.Vp / 15000) * 1.8), 
                           repeat: Infinity, 
                           ease: "linear" 
                        }}
                     />
                     <motion.path 
                        d="M 0 20 Q 10 10 20 20 T 40 20 T 60 20 T 80 20 T 100 20" 
                        stroke="#f59e0b" strokeWidth="1" fill="none"
                        animate={{ 
                           d: [
                              "M 0 20 Q 10 10 20 20 T 40 20 T 60 20 T 80 20 T 100 20",
                              "M 0 20 Q 10 30 20 20 T 40 20 T 60 20 T 80 20 T 100 20",
                              "M 0 20 Q 10 10 20 20 T 40 20 T 60 20 T 80 20 T 100 20"
                           ],
                           opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{ 
                           duration: Math.max(0.4, 3 - (resModel.Vs / 10000) * 2.5), 
                           repeat: Infinity, 
                           ease: "linear" 
                        }}
                     />
                  </svg>
               </div>

               <div className="flex flex-col">
                  <label className="text-[10px] text-slate-500 uppercase font-black italic mb-1">Vs (ft/s)</label>
                  <input type="number" value={resModel.Vs} onChange={e => setResModel({...resModel, Vs: Number(e.target.value)})} className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-black text-amber-500 w-20 outline-none focus:border-amber-500 transition-all" />
               </div>
            </div>
         </div>

         <div className="flex-1 flex justify-end gap-12 pr-6 border-l border-white/10 relative z-10">
            <div className="text-right">
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 italic">Derived Overburden (Sv)</p>
               <p className="text-sm font-black text-white italic">{formatNumber(physicalProps.sv, 0)} <span className="text-[11px] text-slate-500 not-italic ml-1">PSI</span></p>
            </div>
            <div className="text-right">
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 italic">Pore Pressure (Bowers)</p>
               <p className="text-sm font-black text-brand-primary italic">{formatNumber(physicalProps.bowers_pp, 0)} <span className="text-[11px] text-slate-500 not-italic ml-1">PSI</span></p>
            </div>
         </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-black/40 border border-white/10 rounded-[24px] w-fit shadow-inner backdrop-blur-xl">
         {[
            { id: 'characterization', label: 'Characterization', icon: Activity }, { id: 'design', label: 'Well Design', icon: Maximize2 }, { id: 'fracturing', label: 'Fracturing', icon: Zap }, { id: 'completion', label: 'Completion', icon: Layers }, { id: 'dfit', label: 'DFIT', icon: Clock }, { id: 'rta', label: 'RTA', icon: Cpu }, { id: 'interference', label: 'Interference', icon: GitMerge }, { id: 'microseismic', label: 'Microseismic', icon: Wind }, { id: 'economics', label: 'Economics', icon: PieChart }, { id: 'references', label: 'References', icon: BookOpen }
         ].map(item => (
            <button key={item.id} onClick={() => setSubTab(item.id as any)} className={cn("px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2", subTab === item.id ? "bg-brand-primary text-white shadow-[0_0_30px_rgba(47,129,247,0.4)]" : "text-slate-500 hover:text-slate-200")}>
               <item.icon size={14} />{item.label}
            </button>
         ))}
      </div>

      <AnimatePresence mode="wait">
         <motion.div key={subTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            
            {subTab === 'characterization' && (
               <div className="grid grid-cols-1 gap-6">
                  {/* Passey Interpretation Card */}
                  <div className="glass-card p-8 rounded-3xl border-amber-500/10 relative overflow-hidden group bg-black/20">
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        <div className="lg:col-span-3 space-y-6">
                           <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-2"><Flame className="text-amber-500" size={18} /> Passey Method</h3>
                           <div className="space-y-4">
                              <div><label className="text-[11px] text-slate-500 block mb-1 uppercase font-black tracking-widest">Resistivity (ohm-m)</label><input type="number" value={resModel.R} onChange={e => setResModel({...resModel, R: Number(e.target.value)})} className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none transition-all" /></div>
                              <div><label className="text-[11px] text-slate-500 block mb-1 uppercase font-black tracking-widest">Sonic Δt (us/ft)</label><input type="number" value={resModel.dt} onChange={e => setResModel({...resModel, dt: Number(e.target.value)})} className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none transition-all" /></div>
                           </div>
                        </div>

                        {/* Dedicated Animation Zone */}
                        <div className="lg:col-span-6 h-32 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden group-hover:border-amber-500/20 transition-all">
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <svg className="w-full h-full opacity-40" viewBox="0 0 400 100" preserveAspectRatio="none">
                                 <motion.path 
                                    d="M 100 0 Q 120 25 100 50 Q 80 75 100 100" 
                                    stroke="#f59e0b" strokeWidth="2" fill="none"
                                    animate={{ d: [
                                       "M 100 0 Q 120 25 100 50 Q 80 75 100 100",
                                       "M 110 0 Q 90 25 110 50 Q 130 75 110 100",
                                       "M 100 0 Q 120 25 100 50 Q 80 75 100 100"
                                    ]}}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                 />
                                 <motion.path 
                                    d="M 300 0 Q 280 25 300 50 Q 320 75 300 100" 
                                    stroke="#3b82f6" strokeWidth="2" fill="none"
                                    animate={{ d: [
                                       "M 300 0 Q 280 25 300 50 Q 320 75 300 100",
                                       "M 290 0 Q 310 25 290 50 Q 270 75 290 100",
                                       "M 300 0 Q 280 25 300 50 Q 320 75 300 100"
                                    ]}}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                 />
                                 <motion.rect 
                                    x="100" y="20" width="200" height="60" fill="url(#p-grad)"
                                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                 />
                                 <defs>
                                    <linearGradient id="p-grad" x1="0" y1="0" x2="1" y2="0">
                                       <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
                                       <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.5" />
                                       <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                    </linearGradient>
                                 </defs>
                              </svg>
                              <div className="absolute top-2 left-4 text-[10px] font-black text-amber-500 uppercase tracking-widest opacity-50">Log Track Simulation</div>
                           </div>
                        </div>

                        <div className="lg:col-span-3">
                           <div className="flex flex-col items-center justify-center p-6 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                              <div className="text-5xl font-black text-amber-500 italic mb-1">{safeNum(physicalProps.toc, 1)}%</div>
                              <p className="text-[10px] text-slate-500 uppercase font-black italic tracking-widest">Total Organic Carbon</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Brittleness (Rickman) Card */}
                  <div className="glass-card p-8 rounded-3xl border-emerald-500/10 relative overflow-hidden group bg-black/20">
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        <div className="lg:col-span-3 space-y-6">
                           <div className="flex justify-between items-center">
                              <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-2"><Activity className="text-emerald-500" size={18} /> Brittleness</h3>
                           </div>
                           <div className="space-y-3">
                              <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center">
                                 <label className="text-[11px] text-slate-500 uppercase font-black italic">Density</label>
                                 <input type="number" step="0.01" value={resModel.rho} onChange={e => setResModel({...resModel, rho: Number(e.target.value)})} className="bg-white/5 border border-white/10 rounded-lg p-1 text-[10px] text-white w-14 text-center outline-none focus:border-emerald-500" />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                 <div className="p-3 bg-white/5 rounded-xl text-center"><p className="text-[10px] text-slate-500 uppercase italic mb-1">E_dyn</p><p className="text-sm font-black text-white">{safeNum(physicalProps.dyn.dynamicYoungsModulus, 1)}</p></div>
                                 <div className="p-3 bg-white/5 rounded-xl text-center"><p className="text-[10px] text-slate-500 uppercase italic mb-1">ν_dyn</p><p className="text-sm font-black text-white">{safeNum(physicalProps.dyn.dynamicPoissonsRatio, 2)}</p></div>
                              </div>
                           </div>
                        </div>

                        {/* Dedicated Rickman Plot Zone */}
                        <div className="lg:col-span-6 h-48 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden p-6 group-hover:border-emerald-500/20 transition-all">
                           <div className="w-full h-full border-l border-b border-white/10 relative">
                              <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-amber-500/5 to-transparent" />
                              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-emerald-500/5 to-transparent" />
                              
                              <motion.div 
                                 className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] border-2 border-emerald-500 z-20"
                                 animate={{ 
                                    left: `${((physicalProps.dyn.dynamicYoungsModulus - resModel.E_min) / (resModel.E_max - resModel.E_min)) * 100}%`,
                                    bottom: `${((resModel.nu_max - physicalProps.dyn.dynamicPoissonsRatio) / (resModel.nu_max - resModel.nu_min)) * 100}%`
                                 }}
                                 transition={{ type: "spring", stiffness: 80, damping: 12 }}
                              >
                                 <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-30" />
                              </motion.div>

                              <motion.div className="absolute left-0 w-full h-px border-t border-white/10 border-dashed" animate={{ bottom: `${((resModel.nu_max - physicalProps.dyn.dynamicPoissonsRatio) / (resModel.nu_max - resModel.nu_min)) * 100}%` }} />
                              <motion.div className="absolute bottom-0 h-full w-px border-l border-white/10 border-dashed" animate={{ left: `${((physicalProps.dyn.dynamicYoungsModulus - resModel.E_min) / (resModel.E_max - resModel.E_min)) * 100}%` }} />
                              <div className="absolute top-2 left-4 text-[10px] font-black text-emerald-500 uppercase tracking-widest opacity-50">Rickman Geomechanical Matrix</div>
                           </div>
                        </div>

                        <div className="lg:col-span-3 space-y-4">
                           <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-center relative overflow-hidden group">
                              <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-emerald-500/20" />
                              <p className="text-[10px] text-white uppercase mb-1 relative z-10 font-black tracking-widest">BI Index</p>
                              <p className="text-5xl font-black text-white italic relative z-10">{safeNum(physicalProps.bi * 100, 1)}%</p>
                           </div>
                           <div className="flex justify-center">
                              <span className={cn("text-[10px] font-black uppercase px-4 py-1.5 rounded-full border transition-all", physicalProps.bi > 0.5 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30")}>
                                 {physicalProps.bi > 0.5 ? "★ BRITTLE DOMAIN" : "⚠ DUCTILE DOMAIN"}
                              </span>
                           </div>
                        </div>
                     </div>
                     
                     <div className="pt-4 border-t border-white/5 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                           <p className="text-[10px] text-slate-600 uppercase font-black italic tracking-widest">Basin Calibration Limits</p>
                           <div className="flex items-center gap-2">
                              <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded", physicalProps.bi > 0.5 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400")}>
                                 {physicalProps.bi > 0.5 ? "Brittle Domain" : "Ductile Domain"}
                              </span>
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-3">
                              <div className="flex justify-between items-center group">
                                 <label className="text-[11px] text-slate-500 uppercase italic group-hover:text-emerald-500 transition-colors">E_min (GPa)</label>
                                 <input type="number" value={resModel.E_min} onChange={e => setResModel({...resModel, E_min: Number(e.target.value)})} className="bg-white/5 border border-white/10 rounded-lg p-1.5 text-[10px] text-white w-16 text-center outline-none focus:border-emerald-500" />
                              </div>
                              <div className="flex justify-between items-center group">
                                 <label className="text-[11px] text-slate-500 uppercase italic group-hover:text-emerald-500 transition-colors">E_max (GPa)</label>
                                 <input type="number" value={resModel.E_max} onChange={e => setResModel({...resModel, E_max: Number(e.target.value)})} className="bg-white/5 border border-white/10 rounded-lg p-1.5 text-[10px] text-white w-16 text-center outline-none focus:border-emerald-500" />
                              </div>
                           </div>
                           <div className="space-y-3">
                              <div className="flex justify-between items-center group">
                                 <label className="text-[11px] text-slate-500 uppercase italic group-hover:text-emerald-500 transition-colors">ν_min</label>
                                 <input type="number" step="0.01" value={resModel.nu_min} onChange={e => setResModel({...resModel, nu_min: Number(e.target.value)})} className="bg-white/5 border border-white/10 rounded-lg p-1.5 text-[10px] text-white w-16 text-center outline-none focus:border-emerald-500" />
                              </div>
                              <div className="flex justify-between items-center group">
                                 <label className="text-[11px] text-slate-500 uppercase italic group-hover:text-emerald-500 transition-colors">ν_max</label>
                                 <input type="number" step="0.01" value={resModel.nu_max} onChange={e => setResModel({...resModel, nu_max: Number(e.target.value)})} className="bg-white/5 border border-white/10 rounded-lg p-1.5 text-[10px] text-white w-16 text-center outline-none focus:border-emerald-500" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {subTab === 'design' && (
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-4 glass-card p-8 rounded-3xl border-cyan-500/20 space-y-8 bg-black/20">
                     <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-2"><Maximize2 className="text-cyan-500" size={18} /> Optimization</h3>
                     
                     <div className="space-y-6">
                        <div className="p-5 bg-white/5 rounded-3xl border border-white/5 group hover:border-cyan-500/30 transition-all">
                           <label className="text-[11px] text-slate-500 uppercase italic block mb-2 font-black tracking-widest">Lateral Length (ft)</label>
                           <input 
                              type="number" 
                              step="500" 
                              value={designInp.length} 
                              onChange={e => setDesignInp({...designInp, length: Math.max(0, Number(e.target.value))})} 
                              className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-3xl font-black text-cyan-400 outline-none focus:border-cyan-500 transition-all" 
                           />
                        </div>

                        {/* Neural Wellbore Trajectory Animation */}
                        <div className="h-32 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden p-4">
                           <div className="absolute top-2 left-4 text-[10px] font-black text-cyan-500 uppercase tracking-widest opacity-50">Wellbore Trajectory (Live)</div>
                           <svg className="w-full h-full" viewBox="0 0 400 100">
                              {/* Formation Layers */}
                              <rect x="0" y="40" width="400" height="20" fill="white" fillOpacity="0.05" />
                              
                              {/* Vertical Section */}
                              <line x1="20" y1="0" x2="20" y2="50" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
                              
                              {/* Curve (Heel) */}
                              <path d="M 20 50 Q 20 60 30 60" stroke="#06b6d4" strokeWidth="4" fill="none" />
                              
                              {/* Lateral Section (Animated) */}
                              <motion.line 
                                 x1="30" y1="60" 
                                 animate={{ x2: 30 + Math.min(350, (designInp.length / 25000) * 350) }}
                                 y2="60" 
                                 stroke="#06b6d4" strokeWidth="4" 
                                 strokeLinecap="round"
                                 transition={{ type: "spring", stiffness: 50 }}
                              />
                              
                              {/* Stages Dots */}
                              {Array.from({ length: Math.min(20, Math.floor(designInp.length / designInp.stageSpacing / 10)) }).map((_, i) => (
                                 <motion.circle 
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ 
                                       opacity: 1,
                                       cx: 40 + i * (340 / 20) 
                                    }}
                                    cy="60" r="1.5" fill="#22d3ee"
                                 />
                              ))}
                           </svg>
                        </div>

                        <div className="p-6 bg-cyan-500/10 rounded-2xl text-center border border-cyan-500/20 relative overflow-hidden group">
                           <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-white/10" />
                           <p className="text-[10px] text-cyan-500 italic mb-1 uppercase font-black tracking-widest relative z-10">Project NPV</p>
                           <p className="text-4xl font-black text-white italic relative z-10">${safeNum(lateralEco.npv_simple / 1e6, 1)}M</p>
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-8 glass-card p-10 rounded-3xl bg-panel-bg h-[500px] border-white/5 relative overflow-hidden">
                     <div className="absolute top-6 left-10 flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">NPV Sensitivity Curve</span>
                     </div>
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lateralChartData}>
                           <defs>
                              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                 <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                           <XAxis dataKey="L" stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v/1000}k`} />
                           <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v}M`} />
                           <RechartTooltip 
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '16px' }}
                              itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
                           />
                           <Line 
                              type="monotone" 
                              dataKey="npv" 
                              stroke="#06b6d4" 
                              strokeWidth={4} 
                              dot={false}
                              activeDot={{ r: 6, fill: '#fff', stroke: '#06b6d4', strokeWidth: 3 }}
                           />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            )}

            {subTab === 'fracturing' && (
               <div className="grid grid-cols-1 gap-6">
                  {/* PKN Simulation Configuration */}
                  <div className="glass-card p-8 rounded-3xl border-indigo-500/10 relative overflow-hidden group bg-black/20">
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        <div className="lg:col-span-3 space-y-6">
                           <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-2"><Zap className="text-indigo-500" size={18} /> Fracture Dynamics</h3>
                           <div className="space-y-4">
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <label className="text-[11px] text-slate-500 block mb-2 uppercase font-black tracking-widest">Injection Rate (bpm)</label>
                                 <input type="number" value={fracInp.qi} onChange={e => setFracInp({...fracInp, qi: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-2xl font-black text-indigo-400 outline-none" />
                              </div>
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <label className="text-[11px] text-slate-500 block mb-2 uppercase font-black tracking-widest">Fluid Viscosity (cP)</label>
                                 <input type="number" value={fracInp.mu} onChange={e => setFracInp({...fracInp, mu: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-2xl font-black text-white outline-none" />
                              </div>
                           </div>
                        </div>

                        {/* Dedicated Fracture Expansion Animation */}
                        <div className="lg:col-span-6 h-48 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden p-6 group-hover:border-indigo-500/20 transition-all">
                           <div className="absolute top-2 left-4 text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-50">Neural Fracture Expansion (Live)</div>
                           <div className="flex justify-center items-center h-full gap-2">
                              {/* Left Rock Face */}
                              <motion.div 
                                 className="w-24 h-32 bg-slate-800 rounded-lg border-r-4 border-indigo-500 shadow-[20px_0_40px_rgba(99,102,241,0.1)]"
                                 animate={{ x: -Math.min(50, pknWidth * 10) }}
                                 transition={{ type: "spring", stiffness: 40 }}
                              />
                              {/* Fluid Channel */}
                              <motion.div 
                                 className="h-28 bg-indigo-500/20 flex flex-col justify-around py-4 overflow-hidden"
                                 animate={{ width: Math.min(100, pknWidth * 20) }}
                                 transition={{ type: "spring", stiffness: 40 }}
                              >
                                 {Array.from({ length: 5 }).map((_, i) => (
                                    <motion.div 
                                       key={i}
                                       className="h-0.5 bg-indigo-400/50 rounded-full"
                                       animate={{ x: [-20, 20] }}
                                       transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                    />
                                 ))}
                              </motion.div>
                              {/* Right Rock Face */}
                              <motion.div 
                                 className="w-24 h-32 bg-slate-800 rounded-lg border-l-4 border-indigo-500 shadow-[-20px_0_40px_rgba(99,102,241,0.1)]"
                                 animate={{ x: Math.min(50, pknWidth * 10) }}
                                 transition={{ type: "spring", stiffness: 40 }}
                              />
                           </div>
                        </div>

                        <div className="lg:col-span-3 space-y-4 text-center">
                           <div className="p-8 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 relative overflow-hidden group">
                              <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-indigo-500/10" />
                              <p className="text-[10px] text-indigo-400 uppercase mb-1 relative z-10 font-black tracking-widest">Simulated Width</p>
                              <p className="text-5xl font-black text-white italic relative z-10">{safeNum(pknWidth, 3)}<span className="text-sm not-italic ml-1">in</span></p>
                           </div>
                           <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                                 <p className="text-[10px] text-slate-500 uppercase font-black">Net Pressure</p>
                                 <p className="text-sm font-black text-white italic">{safeNum(pknWidth * 150, 0)} <span className="text-[10px]">psi</span></p>
                              </div>
                              <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                                 <p className="text-[10px] text-slate-500 uppercase font-black">E-Modulus</p>
                                 <p className="text-sm font-black text-white italic">{safeNum(fracInp.E_psi / 1e6, 1)} <span className="text-[10px]">MMpsi</span></p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Geomechanical Inputs Panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <div className="glass-card p-6 rounded-2xl border-white/5 flex items-center justify-between bg-black/20">
                        <div className="space-y-1">
                           <p className="text-[10px] text-slate-500 uppercase font-black italic">Fracture Height (ft)</p>
                           <input type="range" min="50" max="500" value={fracInp.h_ft} onChange={e => setFracInp({...fracInp, h_ft: Number(e.target.value)})} className="w-48 accent-indigo-500" />
                        </div>
                        <p className="text-2xl font-black text-white italic">{fracInp.h_ft} ft</p>
                     </div>
                     <div className="glass-card p-6 rounded-2xl border-white/5 flex items-center justify-between bg-black/20">
                        <div className="space-y-1">
                           <p className="text-[10px] text-slate-500 uppercase font-black italic">Young's Modulus (psi)</p>
                           <input type="range" min="1000000" max="8000000" step="100000" value={fracInp.E_psi} onChange={e => setFracInp({...fracInp, E_psi: Number(e.target.value)})} className="w-48 accent-indigo-500" />
                        </div>
                        <p className="text-2xl font-black text-white italic">{safeNum(fracInp.E_psi / 1e6, 1)}M</p>
                     </div>
                  </div>
               </div>
            )}

            {subTab === 'completion' && (
               <div className="grid grid-cols-1 gap-6">
                  {/* Perforation Friction Card */}
                  <div className="glass-card p-8 rounded-3xl border-rose-500/10 relative overflow-hidden group bg-black/20">
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        <div className="lg:col-span-3 space-y-6">
                           <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-2"><Layers className="text-rose-500" size={18} /> Perf Hydraulics</h3>
                           <div className="space-y-4">
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <label className="text-[11px] text-slate-500 block mb-2 uppercase font-black tracking-widest">Clusters per Stage</label>
                                 <input type="number" value={compInp.n_clusters} onChange={e => setCompInp({...compInp, n_clusters: Math.max(1, Number(e.target.value))})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-2xl font-black text-rose-500 outline-none" />
                              </div>
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <label className="text-[11px] text-slate-500 block mb-2 uppercase font-black tracking-widest">Perf Diameter (in)</label>
                                 <input type="number" step="0.01" value={compInp.d_perf} onChange={e => setCompInp({...compInp, d_perf: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-2xl font-black text-white outline-none" />
                              </div>
                           </div>
                        </div>

                        {/* Dedicated Perforation Jet Animation */}
                        <div className="lg:col-span-6 h-48 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden p-6 group-hover:border-rose-500/20 transition-all">
                           <div className="absolute top-2 left-4 text-[10px] font-black text-rose-500 uppercase tracking-widest opacity-50">Perforation Jet Simulation (Live)</div>
                           <div className="flex flex-col justify-around h-full py-4">
                              {Array.from({ length: Math.min(6, compInp.n_clusters) }).map((_, i) => (
                                 <div key={i} className="flex items-center gap-4">
                                    <div className="w-4 h-4 rounded-full bg-slate-700 border border-white/20" />
                                    <motion.div 
                                       className="h-1 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent rounded-full origin-left"
                                       animate={{ 
                                          width: ['0%', '100%', '0%'],
                                          opacity: [0, 1, 0]
                                       }}
                                       transition={{ 
                                          duration: 1 + Math.random(), 
                                          repeat: Infinity, 
                                          delay: i * 0.2 
                                       }}
                                    />
                                    <motion.div 
                                       className="w-2 h-2 rounded-full bg-white blur-[2px]"
                                       animate={{ 
                                          x: [0, 200],
                                          opacity: [1, 0]
                                       }}
                                       transition={{ 
                                          duration: 0.5, 
                                          repeat: Infinity, 
                                          delay: i * 0.2 
                                       }}
                                    />
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div className="lg:col-span-3 space-y-4">
                           <div className="p-6 bg-rose-500/5 rounded-2xl border border-rose-500/10 text-center relative overflow-hidden group">
                              <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-rose-500/10" />
                              <p className="text-[10px] text-rose-500 uppercase mb-1 relative z-10 font-black tracking-widest">Perf Friction</p>
                              <p className="text-5xl font-black text-white italic relative z-10">{safeNum(perfFriction, 0)} <span className="text-xs not-italic text-slate-500">PSI</span></p>
                           </div>
                           <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                              <p className="text-[10px] text-slate-500 uppercase mb-1 font-black">Velocity per Perf</p>
                              <p className="text-lg font-black text-white italic">{safeNum(80 / compInp.n_clusters / 0.05, 0)} <span className="text-[10px] text-slate-600">ft/s</span></p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Stress Shadow Matrix Card */}
                  <div className="glass-card p-8 rounded-3xl border-indigo-500/10 relative overflow-hidden group bg-black/20">
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        <div className="lg:col-span-3 space-y-6">
                           <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-2"><GitMerge className="text-indigo-500" size={18} /> Geomechanical Shadow</h3>
                           <div className="space-y-4">
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <label className="text-[11px] text-slate-500 block mb-2 uppercase font-black tracking-widest">Cluster Spacing (ft)</label>
                                 <input type="number" value={compInp.r_dist} onChange={e => setCompInp({...compInp, r_dist: Math.max(1, Number(e.target.value))})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-2xl font-black text-indigo-400 outline-none" />
                              </div>
                           </div>
                        </div>

                        {/* Stress Shadow Visualization Zone */}
                        <div className="lg:col-span-6 h-48 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden p-6 group-hover:border-indigo-500/20 transition-all">
                           <div className="absolute top-2 left-4 text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-50">Cluster Interference Matrix</div>
                           <div className="flex justify-center items-center h-full gap-8">
                              <div className="relative">
                                 <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/40 relative z-10" />
                                 <motion.div 
                                    className="absolute inset-[-20px] rounded-full bg-indigo-500/10 blur-xl"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                 />
                              </div>
                              <motion.div 
                                 className="h-px bg-gradient-to-r from-indigo-500/50 via-white/20 to-indigo-500/50 flex items-center justify-center"
                                 animate={{ width: compInp.r_dist * 2 }}
                              >
                                 <span className="text-[10px] font-black text-white bg-black/60 px-2 py-0.5 rounded-full border border-white/10">{compInp.r_dist} ft</span>
                              </motion.div>
                              <div className="relative">
                                 <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/40 relative z-10" />
                                 <motion.div 
                                    className="absolute inset-[-20px] rounded-full bg-indigo-500/10 blur-xl"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="lg:col-span-3">
                           <div className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-center relative overflow-hidden group">
                              <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-indigo-500/10" />
                              <p className="text-[10px] text-indigo-400 uppercase mb-1 relative z-10 font-black tracking-widest">Stress Shadow</p>
                              <p className="text-5xl font-black text-white italic relative z-10">{safeNum(stressShadow, 0)} <span className="text-xs not-italic text-slate-500">PSI</span></p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {subTab === 'dfit' && (
               <div className="grid grid-cols-1 gap-6">
                  {/* G-Function Configuration Card */}
                  <div className="glass-card p-8 rounded-3xl border-blue-500/10 relative overflow-hidden group bg-black/20">
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        <div className="lg:col-span-3 space-y-6">
                           <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-2"><Clock className="text-blue-500" size={18} /> G-Function Analysis</h3>
                           <div className="space-y-4">
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <label className="text-[11px] text-slate-500 block mb-2 uppercase font-black tracking-widest">ISIP (psi)</label>
                                 <input type="number" value={dfitInp.p_isip} onChange={e => setDfitInp({...dfitInp, p_isip: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-2xl font-black text-blue-400 outline-none" />
                              </div>
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <label className="text-[11px] text-slate-500 block mb-2 uppercase font-black tracking-widest">Closure Pressure (psi)</label>
                                 <input type="number" value={dfitInp.p_closure} onChange={e => setDfitInp({...dfitInp, p_closure: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-2xl font-black text-white outline-none" />
                              </div>
                              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                 <label className="text-[10px] text-slate-500 block mb-1 uppercase font-black">Leakoff Coeff (C)</label>
                                 <input type="number" value={dfitInp.leakoff_coeff} onChange={e => setDfitInp({...dfitInp, leakoff_coeff: Number(e.target.value)})} className="w-full bg-transparent text-xs text-blue-300 font-black outline-none" />
                              </div>
                           </div>
                        </div>

                        {/* Dedicated Fracture Closure Animation - Linked to Calculator */}
                        <div className="lg:col-span-6 h-48 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden p-6 group-hover:border-blue-500/20 transition-all">
                           <div className="absolute top-2 left-4 text-[10px] font-black text-blue-500 uppercase tracking-widest opacity-50">Fracture Closure Simulation (Live)</div>
                           <div className="flex justify-center items-center h-full">
                              <div className="relative w-64 h-32 flex items-center justify-center">
                                 {/* Rock Formation */}
                                 <div className="absolute inset-0 bg-slate-800/30 rounded-xl border border-white/5" />
                                 
                                 {/* Dynamic Fracture Width - Tied to Closure Time */}
                                 <motion.div 
                                    className="h-16 bg-blue-500/60 border-x-2 border-blue-400 shadow-[0_0_50px_rgba(59,130,246,0.4)] relative"
                                    animate={{ 
                                       width: [60, 0],
                                       opacity: [1, 0.2]
                                    }}
                                    transition={{ 
                                       duration: Math.max(2, Math.min(10, closureProps.dt_c / 2)), 
                                       repeat: Infinity, 
                                       ease: "linear" 
                                    }}
                                 >
                                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(255,255,255,0.05)_5px,rgba(255,255,255,0.05)_10px)]" />
                                 </motion.div>
                                 
                                 <div className="absolute bottom-2 text-[10px] font-mono text-blue-400 uppercase font-black">
                                    Time to Closure: {safeNum(closureProps.dt_c, 1)} min
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="lg:col-span-3 space-y-4 text-center">
                           <div className="p-8 bg-blue-500/10 rounded-3xl border border-blue-500/20 relative overflow-hidden group">
                              <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-blue-500/10" />
                              <p className="text-[12px] text-blue-400 uppercase mb-1 relative z-10 font-black tracking-widest">Efficiency (η)</p>
                              <p className="text-6xl font-black text-white italic relative z-10">{safeNum(closureProps.eta * 100, 1)}%</p>
                           </div>
                           <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                              <p className="text-[11px] text-slate-500 uppercase mb-1 font-black">G-Closure Target</p>
                              <p className="text-xl font-black text-white italic">{safeNum(closureProps.g_c, 2)}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Diagnostic G-Plot Card */}
                  <div className="glass-card p-10 rounded-3xl bg-panel-bg h-[500px] border-white/5 relative overflow-hidden">
                     <div className="absolute top-8 left-10 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">After-Closure Diagnostic (dP/dG)</span>
                     </div>
                     <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={dfitData}>
                           <defs>
                              <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                           <XAxis dataKey="g" stroke="#64748b" fontSize={10} tickFormatter={(v) => `G:${v.toFixed(1)}`} />
                           <YAxis yAxisId="left" stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v} psi`} />
                           <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={10} tickFormatter={(v) => `PdG:${v.toFixed(0)}`} />
                           <RechartTooltip 
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px' }}
                              itemStyle={{ fontWeight: 'bold' }}
                           />
                           <Area yAxisId="left" type="monotone" dataKey="p" stroke="#3b82f6" strokeWidth={4} fill="url(#pGrad)" />
                           <Line yAxisId="right" type="monotone" dataKey="gdpg" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                        </ComposedChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            )}

            {subTab === 'rta' && (
               <div className="grid grid-cols-1 gap-6">
                  {/* RTA Configuration Card */}
                  <div className="glass-card p-8 rounded-3xl border-purple-500/10 relative overflow-hidden group bg-black/20">
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        <div className="lg:col-span-3 space-y-6">
                           <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-2"><Cpu className="text-purple-500" size={18} /> Transient Analysis</h3>
                           <div className="space-y-4">
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <label className="text-[11px] text-slate-500 block mb-2 uppercase font-black tracking-widest">Initial Perm (mD)</label>
                                 <input type="number" step="0.0001" value={rtaInp.k_md} onChange={e => setRtaInp({...rtaInp, k_md: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-2xl font-black text-purple-400 outline-none" />
                              </div>
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <label className="text-[11px] text-slate-500 block mb-2 uppercase font-black tracking-widest">Pay Height (ft)</label>
                                 <input type="number" value={rtaInp.h_ft} onChange={e => setRtaInp({...rtaInp, h_ft: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-2xl font-black text-white outline-none" />
                              </div>
                           </div>
                        </div>

                        {/* Dedicated Diffusion Animation */}
                        <div className="lg:col-span-6 h-48 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden p-6 group-hover:border-purple-500/20 transition-all">
                           <div className="absolute top-2 left-4 text-[10px] font-black text-purple-500 uppercase tracking-widest opacity-50">Matrix-to-Fracture Diffusion (Live)</div>
                           <div className="flex items-center justify-center h-full relative">
                              {/* Horizontal Wellbore/Fracture */}
                              <div className="w-full h-2 bg-purple-500/30 rounded-full border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.4)]" />
                              
                              {/* Diffusing Particles */}
                              {Array.from({ length: 40 }).map((_, i) => (
                                 <motion.div 
                                    key={i}
                                    className="absolute w-1 h-1 bg-purple-400 rounded-full blur-[1px]"
                                    initial={{ 
                                       x: (Math.random() - 0.5) * 400,
                                       y: Math.random() > 0.5 ? 40 : -40,
                                       opacity: 0
                                    }}
                                    animate={{ 
                                       y: 0,
                                       opacity: [0, 1, 0]
                                    }}
                                    transition={{ 
                                       duration: 1 + Math.random() * 2,
                                       repeat: Infinity,
                                       delay: Math.random() * 2,
                                       ease: "easeIn"
                                    }}
                                 />
                              ))}
                           </div>
                        </div>

                        <div className="lg:col-span-3 space-y-4 text-center">
                           <div className="p-8 bg-purple-500/10 rounded-3xl border border-purple-500/20 relative overflow-hidden group">
                              <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-purple-500/10" />
                              <p className="text-[10px] text-purple-400 uppercase mb-1 relative z-10 font-black tracking-widest">Linear Flow Param</p>
                              <p className="text-4xl font-black text-white italic relative z-10">{safeNum(linearFlowParam, 1)}</p>
                           </div>
                           <div className="p-3 bg-white/5 rounded-2xl border border-white/5 inline-flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                              <span className="text-[11px] font-black text-slate-500 uppercase italic">Flow Regime: Linear (Tight)</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* RTA Specialized Plot Card */}
                  <div className="glass-card p-10 rounded-3xl bg-panel-bg h-[500px] border-white/5 relative overflow-hidden">
                     <div className="absolute top-8 left-10 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Production Diagnostic (1/q vs √t)</span>
                     </div>
                     <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                           <XAxis dataKey="sqrtT" stroke="#64748b" fontSize={10} name="sqrt(t)" tickFormatter={(v) => `√${v.toFixed(0)}`} />
                           <YAxis dataKey="invQ" stroke="#64748b" fontSize={10} name="1/q" tickFormatter={(v) => v.toFixed(3)} />
                           <RechartTooltip 
                              cursor={{ strokeDasharray: '3 3', stroke: '#a855f7' }}
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '16px' }}
                              itemStyle={{ color: '#a855f7', fontWeight: 'bold' }}
                           />
                           <Scatter name="Linear Flow" data={rtaData} fill="#a855f7">
                              {rtaData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fillOpacity={0.6 + (index / rtaData.length) * 0.4} />
                              ))}
                           </Scatter>
                        </ScatterChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            )}

            {subTab === 'interference' && (
               <div className="grid grid-cols-1 gap-6">
                  {/* Interference Configuration Card */}
                  <div className="glass-card p-8 rounded-3xl border-orange-500/10 relative overflow-hidden group bg-black/20">
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        <div className="lg:col-span-3 space-y-6">
                           <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-2"><GitMerge className="text-orange-500" size={18} /> Spacing Analyzer</h3>
                           <div className="space-y-4">
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <label className="text-[11px] text-slate-500 block mb-2 uppercase font-black tracking-widest">Well Spacing (ft)</label>
                                 <input type="range" min="330" max="1320" step="10" value={interInp.spacing} onChange={e => setInterInp({...interInp, spacing: Number(e.target.value)})} className="w-full accent-orange-500 mb-2" />
                                 <div className="flex justify-between text-[10px] text-white font-black italic"><span>330'</span><span>{interInp.spacing}'</span><span>1320'</span></div>
                              </div>
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <label className="text-[11px] text-slate-500 block mb-2 uppercase font-black tracking-widest">Parent Depletion (yrs)</label>
                                 <input type="number" value={interInp.years} onChange={e => setInterInp({...interInp, years: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xl font-black text-white outline-none" />
                              </div>
                           </div>
                        </div>

                        {/* Dedicated Frac-Hit Animation */}
                        <div className="lg:col-span-6 h-48 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden p-8 group-hover:border-orange-500/20 transition-all">
                           <div className="absolute top-4 left-6 text-[10px] font-black text-orange-500 uppercase tracking-widest opacity-60 z-20 bg-black/40 px-2 py-1 rounded-md">Neural Frac-Hit Simulation (Live)</div>
                           <div className="flex justify-center items-center h-full gap-24 relative mt-4">
                              {/* Parent Well */}
                              <div className="flex flex-col items-center gap-4 relative">
                                 <div className="w-4 h-28 bg-orange-500 rounded-full shadow-[0_0_30px_rgba(249,115,22,0.4)]" />
                                 <span className="text-[10px] font-black text-slate-500 uppercase">Parent</span>
                                 
                                 {/* Depletion Zone */}
                                 <motion.div 
                                    className="absolute inset-[-20px] rounded-full bg-orange-500/5 border border-orange-500/10"
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                 />
                              </div>

                              {/* Interference Pulses */}
                              <div className="flex-1 h-px bg-white/10 relative">
                                 {interferenceLoss > 10 && (
                                    <motion.div 
                                       className="absolute h-1 bg-gradient-to-r from-orange-500 to-transparent rounded-full shadow-[0_0_20px_rgba(249,115,22,0.6)]"
                                       animate={{ 
                                          left: ['0%', '100%'],
                                          opacity: [0, 1, 0]
                                       }}
                                       transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                 )}
                              </div>

                              {/* Child Well */}
                              <div className="flex flex-col items-center gap-4 relative">
                                 <div className="w-4 h-28 bg-emerald-500 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)]" />
                                 <span className="text-[10px] font-black text-emerald-500 uppercase">Child</span>
                                 
                                 {/* Potential Zone */}
                                 <motion.div 
                                    className="absolute inset-[-10px] rounded-full bg-emerald-500/5 border border-emerald-500/10"
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.4, 0.1] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="lg:col-span-3 space-y-4 text-center">
                           <div className="p-8 bg-orange-500/10 rounded-3xl border border-orange-500/20 relative overflow-hidden group">
                              <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-orange-500/10" />
                              <p className="text-[12px] text-orange-400 uppercase mb-1 relative z-10 font-black tracking-widest">Production Loss</p>
                              <p className="text-6xl font-black text-white italic relative z-10">{safeNum(interferenceLoss, 1)}%</p>
                           </div>
                           <div className="p-3 bg-white/5 rounded-2xl border border-white/5 inline-flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${interferenceLoss > 20 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                              <span className="text-[11px] font-black text-slate-500 uppercase italic">Status: {interferenceLoss > 20 ? 'High Interference' : 'Optimal Spacing'}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Depletion Intensity Map */}
                  <div className="glass-card p-10 rounded-3xl bg-panel-bg h-[450px] border-white/5 relative overflow-hidden flex flex-col items-center justify-center">
                     <div className="absolute top-8 left-10 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Parent-Well Depletion Zone Intensity</span>
                     </div>
                     <div className="relative w-full max-w-2xl h-64 bg-black/40 rounded-3xl border border-white/10 overflow-hidden mt-8">
                        <motion.div 
                           className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/20 via-orange-500/5 to-transparent"
                           animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                           transition={{ duration: 5, repeat: Infinity }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center gap-48">
                           <div className="w-2 h-40 bg-orange-500 rounded-full shadow-[0_0_50px_rgba(249,115,22,0.8)]" />
                           <div className="w-2 h-40 bg-white/10 rounded-full" />
                        </div>
                     </div>
                     <div className="mt-6 text-center z-10">
                        <p className="text-[11px] text-orange-400 font-black uppercase italic tracking-widest bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20">Calculated Interference Reach: {safeNum(500 * Math.pow(interInp.years, 0.35), 0)} ft</p>
                     </div>
                  </div>
               </div>
            )}

            {subTab === 'microseismic' && (
               <div className="grid grid-cols-1 gap-6">
                  {/* Event Configuration & Analytics */}
                  <div className="glass-card p-8 rounded-3xl border-emerald-500/10 relative overflow-hidden group bg-black/20">
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        <div className="lg:col-span-3 space-y-6">
                           <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-2"><Radio className="text-emerald-500" size={18} /> Acoustic Monitoring</h3>
                           <div className="space-y-4">
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <label className="text-[11px] text-slate-500 block mb-2 uppercase font-black tracking-widest">Detection Threshold (Mmin)</label>
                                 <input type="number" step="0.1" value={microInp.m_min} onChange={e => setMicroInp({...microInp, m_min: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-2xl font-black text-emerald-400 outline-none" />
                              </div>
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <label className="text-[11px] text-slate-500 block mb-2 uppercase font-black tracking-widest">Manual B-Value Override</label>
                                 <input type="number" step="0.01" value={microInp.b_override || ''} placeholder="Auto" onChange={e => setMicroInp({...microInp, b_override: e.target.value ? Number(e.target.value) : null})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xl font-black text-white outline-none" />
                              </div>
                           </div>
                        </div>

                        {/* Dedicated Event Playback Visualizer */}
                        <div className="lg:col-span-6 h-48 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden p-4 group-hover:border-emerald-500/20 transition-all">
                           <div className="absolute top-2 left-4 text-[10px] font-black text-emerald-500 uppercase tracking-widest opacity-50">Neural Event Playback (Live)</div>
                           <div className="w-full h-full relative">
                              {microEvents.slice(0, 50).map((event, i) => (
                                 <motion.div 
                                    key={i}
                                    className="absolute rounded-full bg-emerald-400/40 border border-emerald-400/60"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ 
                                       scale: [0, 1.5, 1],
                                       opacity: [0, 1, 0]
                                    }}
                                    transition={{ 
                                       duration: 2, 
                                       delay: i * 0.1, 
                                       repeat: Infinity,
                                       repeatDelay: 2
                                    }}
                                    style={{ 
                                       left: `${event.x}%`, 
                                       top: `${event.y}%`,
                                       width: `${Math.max(4, event.mag * 8)}px`,
                                       height: `${Math.max(4, event.mag * 8)}px`
                                    }}
                                 />
                              ))}
                              {/* Central Wellbore Path */}
                              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 border-t border-dashed border-white/20" />
                           </div>
                        </div>

                        <div className="lg:col-span-3 space-y-4 text-center">
                           <div className="p-8 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 relative overflow-hidden group">
                              <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-emerald-500/10" />
                              <p className="text-[10px] text-emerald-400 uppercase mb-1 relative z-10 font-black tracking-widest">Calculated B-Value</p>
                              <p className="text-6xl font-black text-white italic relative z-10">{safeNum(bValue, 2)}</p>
                           </div>
                           <div className="p-3 bg-white/5 rounded-2xl border border-white/5 inline-flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                              <span className="text-[11px] font-black text-slate-500 uppercase italic">Events Logged: {microInp.eventCount}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Gutenberg-Richter Frequency Plot */}
                  <div className="glass-card p-10 rounded-3xl bg-panel-bg h-[400px] border-white/5 relative overflow-hidden">
                     <div className="absolute top-8 left-10 flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Frequency-Magnitude Diagnostic (Log N vs M)</span>
                     </div>
                     <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                           <XAxis type="number" dataKey="mag" stroke="#64748b" fontSize={10} name="Magnitude" domain={['auto', 'auto']} />
                           <YAxis type="number" dataKey="id" stroke="#64748b" fontSize={10} name="Log N" tickFormatter={() => ''} hide />
                           <RechartTooltip 
                              cursor={{ strokeDasharray: '3 3', stroke: '#10b981' }}
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px' }}
                              itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                           />
                           <Scatter name="Events" data={microEvents} fill="#10b981">
                              {microEvents.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fillOpacity={0.2 + (entry.mag + 2) / 5} />
                              ))}
                           </Scatter>
                        </ScatterChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            )}

            {subTab === 'economics' && (
               <div className="grid grid-cols-1 gap-6">
                  {/* Economic Inputs & Cash Flow Visualization */}
                  <div className="glass-card p-8 rounded-3xl border-lime-500/10 relative overflow-hidden group bg-black/20">
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        <div className="lg:col-span-3 space-y-6">
                           <h3 className="text-sm font-black text-white uppercase italic flex items-center gap-2"><Flame className="text-lime-500" size={18} /> Asset Valuation</h3>
                           <div className="space-y-4">
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <label className="text-[11px] text-slate-500 block mb-2 uppercase font-black tracking-widest">Oil Price ($/bbl)</label>
                                 <input type="number" value={ecoParams.oilPrice} onChange={e => setEcoParams({...ecoParams, oilPrice: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-2xl font-black text-lime-400 outline-none" />
                              </div>
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <label className="text-[11px] text-slate-500 block mb-2 uppercase font-black tracking-widest">B-Factor (Decline)</label>
                                 <input type="number" step="0.1" value={ecoParams.b} onChange={e => setEcoParams({...ecoParams, b: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xl font-black text-white outline-none" />
                              </div>
                           </div>
                        </div>

                        {/* Dedicated Neural Cash Flow Animation */}
                        <div className="lg:col-span-6 h-64 bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden p-8 group-hover:border-lime-500/20 transition-all">
                           <div className="absolute top-4 left-6 text-[10px] font-black text-lime-500 uppercase tracking-widest opacity-60">Neural Cash Flow Lifecycle (Live)</div>
                           <div className="flex justify-between items-center h-full relative px-8">
                              {/* Capital Source */}
                              <div className="flex flex-col items-center gap-3">
                                 <div className="p-4 bg-lime-500/10 rounded-2xl border border-lime-500/30">
                                    <Database size={24} className="text-lime-500" />
                                 </div>
                                 <span className="text-[10px] font-black text-slate-500 uppercase">CapEx</span>
                              </div>

                              {/* Flowing Revenue Pulses */}
                              <div className="flex-1 h-px bg-white/10 relative mx-4">
                                 {Array.from({ length: 8 }).map((_, i) => (
                                    <motion.div 
                                       key={i}
                                       className="absolute w-2 h-2 bg-lime-400 rounded-full blur-[2px]"
                                       initial={{ left: '0%', opacity: 0 }}
                                       animate={{ 
                                          left: '100%',
                                          opacity: [0, 1, 0],
                                          scale: [1, 1.5, 1]
                                       }}
                                       transition={{ 
                                          duration: 2, 
                                          repeat: Infinity, 
                                          delay: i * 0.4,
                                          ease: "easeInOut"
                                       }}
                                    />
                                 ))}
                              </div>

                              {/* Revenue Target */}
                              <div className="flex flex-col items-center gap-3">
                                 <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
                                    <TrendingUp size={24} className="text-emerald-500" />
                                 </div>
                                 <span className="text-[10px] font-black text-slate-500 uppercase">Revenue</span>
                              </div>
                           </div>
                           
                           {/* ROI Bar */}
                           <div className="absolute bottom-6 left-12 right-12 h-2 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                 className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 shadow-[0_0_20px_rgba(132,204,22,0.4)]"
                                 initial={{ width: 0 }}
                                 animate={{ width: `${Math.min(100, (ecoParams.oilPrice / ecoDerived.breakeven) * 40)}%` }}
                                 transition={{ duration: 1 }}
                              />
                           </div>
                           <div className="absolute bottom-10 left-12 right-12 flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              <span>Investment</span>
                              <span>ROI Threshold</span>
                              <span>Profitability</span>
                           </div>
                        </div>

                        <div className="lg:col-span-3 space-y-4 text-center">
                           <div className="p-8 bg-lime-500/10 rounded-3xl border border-lime-500/20 relative overflow-hidden group">
                              <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-lime-500/10" />
                              <p className="text-[12px] text-lime-400 uppercase mb-1 relative z-10 font-black tracking-widest">Breakeven</p>
                              <p className="text-6xl font-black text-white italic relative z-10">${safeNum(ecoDerived.breakeven, 2)}</p>
                           </div>
                           <div className="p-3 bg-white/5 rounded-2xl border border-white/5 inline-flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${ecoParams.oilPrice > ecoDerived.breakeven ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                              <span className="text-[11px] font-black text-slate-500 uppercase italic">Payback: {safeNum(ecoDerived.payback, 1)} months</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Secondary Asset Metrics */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <div className="glass-card p-6 rounded-2xl border-white/5 flex items-center justify-between bg-black/20">
                        <div className="space-y-1">
                           <p className="text-[10px] text-slate-500 uppercase font-black italic">Total Asset EUR</p>
                           <p className="text-2xl font-black text-white italic">{formatNumber(ecoDerived.totalEUR, 0)} BBL</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl"><FileText size={20} className="text-slate-400" /></div>
                     </div>
                     <div className="glass-card p-6 rounded-2xl border-white/5 flex items-center justify-between bg-black/20">
                        <div className="space-y-1">
                           <p className="text-[10px] text-slate-500 uppercase font-black italic">Total CapEx</p>
                           <p className="text-2xl font-black text-white italic">${formatNumber(ecoDerived.capEx / 1e6, 2)}M</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl"><Calculator size={20} className="text-slate-400" /></div>
                     </div>
                     <div className="glass-card p-6 rounded-2xl border-white/5 flex items-center justify-between bg-black/20">
                        <div className="space-y-1">
                           <p className="text-[10px] text-slate-500 uppercase font-black italic">Operating Expense</p>
                           <div className="flex items-center gap-4">
                              <input type="range" min="2" max="25" value={ecoParams.opex} onChange={e => setEcoParams({...ecoParams, opex: Number(e.target.value)})} className="w-24 accent-lime-500" />
                              <p className="text-2xl font-black text-white italic">${ecoParams.opex}</p>
                           </div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl"><TrendingDown size={20} className="text-rose-400" /></div>
                     </div>
                  </div>
               </div>
            )}

            {subTab === 'references' && (
               <div className="glass-card p-10 rounded-3xl bg-panel-bg space-y-10 border border-white/5">
                  <div className="flex justify-between items-center"><h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3"><BookOpen className="text-brand-primary" size={28} /> Technical Library</h3><p className="text-[10px] text-slate-500 uppercase font-black italic tracking-widest underline decoration-brand-primary decoration-2 underline-offset-8">AstraCore Repository Access</p></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{UNCONVENTIONAL_REFERENCES.map(ref => (<motion.div key={ref.id} whileHover={{ scale: 1.02, translateY: -5 }} onClick={() => ref.url && window.open(ref.url, '_blank')} className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-all group cursor-pointer relative overflow-hidden"><div className="absolute top-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity"><ExternalLink size={14} className="text-brand-primary" /></div><h4 className="text-sm font-black text-white italic mb-3 group-hover:text-brand-primary transition-colors leading-tight">{ref.title}</h4><div className="flex items-center gap-2 mb-4"><span className="px-2 py-0.5 bg-white/10 rounded text-[10px] text-slate-400 font-mono uppercase">{ref.year}</span><span className="text-[10px] text-slate-500 uppercase font-black italic">{ref.authors}</span></div><p className="text-[11px] text-slate-400 leading-relaxed italic line-clamp-3">{ref.description}</p></motion.div>))}</div>
               </div>
            )}

         </motion.div>
      </AnimatePresence>
    </div>
  );
}
