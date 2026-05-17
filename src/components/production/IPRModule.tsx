import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
   Target, Zap, Box, Wind, MoveHorizontal, Layers, Activity,
   RefreshCcw, ArrowRight, Gauge, Info, History, TrendingUp, Scaling,
   Droplets, Waves, ShieldCheck, Database, Link2Off, Link2
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { InputWithSlider, SectionHeader } from '../SharedUI';
import {
   calculateDarcyRadialFlow,
   calculateVogelIPR,
   calculateCompositeIPR,
   calculateFetkovichIPR,
   calculateGasWellIPR,
   calculateJoshiHorizontalIPR
} from '../../lib/production';
import { useAppraisal, useDrilling, useProduction } from '../../store/hooks';
import { useSimulationStore } from '../../store/simulationStore';
import type { ProductionRecord, WellStatus } from '../../store/types';

export function IPRModule() {
   const [activePhase, setActivePhase] = useState<'1A' | '1B' | '1C' | '1D' | '1E' | '1F'>('1A');

   const phases = [
      { id: '1A', name: 'Darcy', icon: Box },
      { id: '1B', name: 'Vogel', icon: Target },
      { id: '1C', name: 'Composite', icon: Zap },
      { id: '1D', name: 'Gas Well', icon: Wind },
      { id: '1E', name: 'Horizontal', icon: MoveHorizontal },
      { id: '1F', name: 'Multi-layer', icon: Layers }
   ];

   // ── Read upstream data from Appraisal & Drilling layers ──
   const { data: appraisal } = useAppraisal();
   const { data: drilling } = useDrilling();
   const { update: updateProduction } = useProduction();
   const exploration = useSimulationStore(s => s.exploration);

   // Derive initial values from upstream store data (fall back to hardcoded defaults)
   const upstreamDefaults = useMemo(() => ({
      pr: appraisal?.wellTests?.[0]?.reservoirPressure ?? 4000,
      pb: appraisal?.pvt?.bubblePoint ?? 2500,
      k: (() => {
         const petroKeys = appraisal?.petrophysics ? Object.keys(appraisal.petrophysics) : [];
         if (petroKeys.length > 0) {
            const wellKey = petroKeys[0];
            const zoneKeys = Object.keys(appraisal.petrophysics[wellKey] ?? {});
            if (zoneKeys.length > 0) return appraisal.petrophysics[wellKey][zoneKeys[0]].permeability ?? 50;
         }
         return 50;
      })(),
      h: (() => {
         const petroKeys = appraisal?.petrophysics ? Object.keys(appraisal.petrophysics) : [];
         if (petroKeys.length > 0) {
            const wellKey = petroKeys[0];
            const zoneKeys = Object.keys(appraisal.petrophysics[wellKey] ?? {});
            if (zoneKeys.length > 0) return appraisal.petrophysics[wellKey][zoneKeys[0]].netPay ?? 100;
         }
         return 100;
      })(),
      mu: appraisal?.pvt?.oilViscosity?.[0]?.value ?? 1.2,
      bo: appraisal?.pvt?.oilFVF?.[0]?.value ?? 1.15,
      s: drilling?.wells?.[0]?.perforations?.[0]?.perforationSkin
         ?? (drilling?.wells?.[0]?.stimulation?.postStimSkin ?? 2),
      re: 1500,
      rw: 0.328,
      fetN: 0.8,
      fetC: 0.005,
      L: 2000,
      kv: 10,
      targetDepthTVD: exploration?.explorationWell?.targetDepth ?? 8000,
   }), [appraisal, drilling, exploration]);

   // Track whether upstream data was used
   const [hasUpstreamData, setHasUpstreamData] = useState(false);

   const [pr, setPr] = useState(upstreamDefaults.pr);
   const [pb, setPb] = useState(upstreamDefaults.pb);
   const [k, setK] = useState(upstreamDefaults.k);
   const [h, setH] = useState(upstreamDefaults.h);
   const [mu, setMu] = useState(upstreamDefaults.mu);
   const [bo, setBo] = useState(upstreamDefaults.bo);
   const [s, setS] = useState(upstreamDefaults.s);
   const [re, setRe] = useState(upstreamDefaults.re);
   const [rw, setRw] = useState(upstreamDefaults.rw);
   const [fetN, setFetN] = useState(upstreamDefaults.fetN);
   const [fetC, setFetC] = useState(upstreamDefaults.fetC);
   const [L, setL] = useState(upstreamDefaults.L);
   const [kv, setKv] = useState(upstreamDefaults.kv);

   // Sync if upstream data changes after mount
   useEffect(() => {
      if (appraisal?.wellTests || appraisal?.petrophysics) {
         setHasUpstreamData(true);
         setPr(upstreamDefaults.pr);
         setPb(upstreamDefaults.pb);
         setK(upstreamDefaults.k);
         setH(upstreamDefaults.h);
         setMu(upstreamDefaults.mu);
         setBo(upstreamDefaults.bo);
         setS(upstreamDefaults.s);
      }
   }, [upstreamDefaults, appraisal]);

   const j = useMemo(() => {
      return (0.00708 * k * h) / (mu * bo * (Math.log(re / rw) - 0.75 + s));
   }, [k, h, mu, bo, re, rw, s]);

   const aof = useMemo(() => {
      if (activePhase === '1B') return j * pr / 1.8;
      if (activePhase === '1D') return calculateGasWellIPR(0, pr, fetC, fetN);
      return j * pr;
   }, [activePhase, j, pr, fetC, fetN]);

   // ── Auto-persist IPR results to Production layer on change ──
   const persistIPRResults = useCallback(() => {
      const wellId = 'PROD-1';
      const flowEfficiency = (Math.log(re / rw) - 0.75) / (Math.log(re / rw) - 0.75 + s);
      const now = new Date().toISOString().slice(0, 10);

      const record: ProductionRecord = {
         date: now,
         oilRate: aof,
         gasRate: activePhase === '1D' ? aof : 0,
         waterRate: 0,
         liquidRate: aof,
         waterCut: 0,
         gor: pb > 0 ? aof * 0.5 : 0,
         glr: 0,
         chokeSize: 32,
         fthp: pr * 0.65,
         fchp: pr * 0.55,
         fbhP: pr * 0.85,
         reservoirPressure: pr,
         cumulativeOil: 0,
         cumulativeGas: 0,
         cumulativeWater: 0,
         status: 'producing' as WellStatus,
      };

      updateProduction({
         history: [{
            wellId,
            records: [record],
         }],
         lastUpdated: Date.now(),
         version: (useSimulationStore.getState().production?.version ?? 0) + 1,
      });
      useSimulationStore.getState().setLayerDirty('production');
   }, [aof, activePhase, pr, pb, j, re, rw, s, updateProduction]);

   // Debounced auto-persist after slider changes settle
   useEffect(() => {
      const timer = setTimeout(persistIPRResults, 800);
      return () => clearTimeout(timer);
   }, [pr, pb, k, h, mu, bo, s, re, rw, persistIPRResults]);

   return (
      <div className="space-y-8 animate-in fade-in duration-700">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-4">
                  <Target className="text-blue-500" size={36} />
                  Inflow <span className="text-blue-500/50">Performance Terminal</span>
               </h2>
               <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-widest italic">Reservoir Deliverability & AOF Modeling Engine</p>
            </div>

            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit backdrop-blur-md">
               {phases.map(p => (
                  <button
                     key={p.id}
                     onClick={() => setActivePhase(p.id as any)}
                     className={cn(
                        "px-6 py-2.5 rounded-[14px] flex items-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest",
                        activePhase === p.id
                           ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                           : "text-slate-500 hover:text-white hover:bg-white/5"
                     )}
                  >
                     <p.icon size={14} />
                     {p.name}
                  </button>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Control Panel */}
            <div className="lg:col-span-3 space-y-6">
               <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40 h-full overflow-y-auto max-h-[700px] custom-scrollbar">
                  <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-8 italic">Inflow Parameters</h4>
                  <div className="space-y-8">
                     <InputWithSlider label="Reservoir Pressure" value={pr} min={1000} max={8000} step={50} unit="psi" onChange={setPr} />
                     <InputWithSlider label="Bubble Point" value={pb} min={500} max={pr} step={50} unit="psi" onChange={setPb} />
                     <InputWithSlider label="Permeability" value={k} min={1} max={500} step={1} unit="mD" onChange={setK} />
                     <InputWithSlider label="Formation Thickness" value={h} min={10} max={500} step={5} unit="ft" onChange={setH} />
                     <InputWithSlider label="Skin Factor" value={s} min={-5} max={20} step={0.5} unit="" onChange={setS} />
                  </div>
               </div>

               <div className="p-10 bg-blue-600/10 rounded-3xl border border-blue-500/20 text-center shadow-lg shadow-blue-500/5">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 italic">Productivity Index (J)</p>
                  <p className="text-5xl font-black text-white italic tracking-tighter">
                     {j.toFixed(2)} <span className="text-xl text-slate-500 not-italic">STB/d/psi</span>
                  </p>
               </div>
            </div>

            {/* Center Display Area */}
            <div className="lg:col-span-9 h-full">
               <AnimatePresence mode="wait">
                  <motion.div
                     key={activePhase}
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.98 }}
                     className="h-full flex flex-col gap-8"
                  >
                     <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[550px] flex items-center justify-center relative overflow-hidden">
                        <IPRCurve3D pr={pr} pb={pb} j={j} mode={activePhase} />
                        <div className="absolute top-8 left-10">
                           <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">{phases.find(p => p.id === activePhase)?.name} Inflow Dynamics</h4>
                           <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Deliverability vs Reservoir Depletion</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ResultCard label="AOF Potential" value={formatNumber(aof, 0)} unit={activePhase === '1D' ? 'Mscf/d' : 'STB/d'} />
                        <ResultCard label="Flow Efficiency" value={((Math.log(re / rw) - 0.75) / (Math.log(re / rw) - 0.75 + s)).toFixed(2)} unit="ratio" />
                        <ResultCard label="Reservoir Energy" value={(pr / 8000 * 100).toFixed(1)} unit="%" />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TheoryCard
                           title={phases.find(p => p.id === activePhase)?.name + " Method"}
                           desc={getTheoryDesc(activePhase, s, re, rw)}
                        />
                        <div className="glass-card p-8 rounded-3xl border-white/5 bg-black/40 flex items-center justify-center text-center">
                           <div>
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 italic">Diagnostic Recommendation</p>
                              <p className="text-[12px] text-blue-400 font-black italic">
                                 {s > 5 ? "CRITICAL SKIN DETECTED: Acid stimulation or hydraulic fracturing recommended." : "STABLE INFLOW: Maintain production within drawdown limits to prevent fines migration."}
                              </p>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               </AnimatePresence>
            </div>
         </div>
      </div>
   );
}

function getTheoryDesc(phase: string, s: number, re: number, rw: number) {
   switch (phase) {
      case '1A': return "Darcy's Law for radial single-phase flow. Results in a linear relationship between Pwf and Q.";
      case '1B': return "Vogel's correlation for solution-gas drive reservoirs. Accounts for relative permeability decline below Pb.";
      case '1C': return "Composite model using Darcy above Pb and Vogel below Pb for saturated reservoirs.";
      case '1D': return "Back-pressure equation for gas wells. Uses the n exponent to account for non-Darcy turbulence effects.";
      case '1E': return "Joshi's Horizontal well model. Highly sensitive to vertical permeability and wellbore exposure length.";
      default: return "Multi-layer deliverability analysis combining contrasting formation properties.";
   }
}

// ─── 3D Kinetic Simulators ─────────────────────────────────────────────────

function IPRCurve3D({ pr, pb, j, mode }: { pr: number, pb: number, j: number, mode: string }) {
   const points = 40;

   const curveData = useMemo(() => {
      let qb = j * (pr - pb);
      let aof_comp = qb + (j * pb) / 1.8;
      let aof_gas = 0.005 * Math.pow(pr * pr, 0.8);
      let j_horiz = j * 3.5;
      let aof_horiz = j_horiz * pr;

      let aof = j * pr;
      if (mode === '1B') aof = j * pr / 1.8;
      if (mode === '1C') aof = aof_comp;
      if (mode === '1D') aof = aof_gas;
      if (mode === '1E') aof = aof_horiz;
      if (mode === '1F') aof = aof_comp * 1.5;

      const kx = [];
      const ky = [];
      let path = "";
      let pathL1 = "";
      let pathL2 = "";

      for (let i = 0; i <= points; i++) {
         const pwf = pr * (1 - (i / points));
         let q = 0, q1 = 0, q2 = 0;

         if (mode === '1A') {
            q = j * (pr - pwf);
         } else if (mode === '1B') {
            q = aof * (1 - 0.2 * (pwf / pr) - 0.8 * Math.pow(pwf / pr, 2));
         } else if (mode === '1C') {
            if (pwf >= pb) {
               q = j * (pr - pwf);
            } else {
               q = qb + ((j * pb) / 1.8) * (1 - 0.2 * (pwf / pb) - 0.8 * Math.pow(pwf / pb, 2));
            }
         } else if (mode === '1D') {
            q = 0.005 * Math.pow(pr * pr - pwf * pwf, 0.8);
         } else if (mode === '1E') {
            q = j_horiz * (pr - pwf);
         } else if (mode === '1F') {
            q1 = pwf >= pb ? j * (pr - pwf) : qb + ((j * pb) / 1.8) * (1 - 0.2 * (pwf / pb) - 0.8 * Math.pow(pwf / pb, 2));
            q2 = (j * 0.5) * (pr - pwf);
            q = q1 + q2;
         }

         const py = 300 - (pwf / pr) * 300;
         const px = (q / aof) * 380;

         kx.push(px);
         ky.push(py);
         path += (i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`);

         if (mode === '1F') {
            const px1 = (q1 / aof) * 380;
            const px2 = (q2 / aof) * 380;
            pathL1 += (i === 0 ? `M ${px1} ${py}` : ` L ${px1} ${py}`);
            pathL2 += (i === 0 ? `M ${px2} ${py}` : ` L ${px2} ${py}`);
         }
      }

      return { path, kx, ky, pathL1, pathL2 };
   }, [pr, pb, j, mode]);

   const { path, kx, ky, pathL1, pathL2 } = curveData;
   const cxAnim = [...kx, ...[...kx].reverse()];
   const cyAnim = [...ky, ...[...ky].reverse()];

   const strokeColor = mode === '1D' ? '#06b6d4' : mode === '1E' ? '#10b981' : mode === '1F' ? '#8b5cf6' : '#3b82f6';

   return (
      <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
         <g transform="translate(60, 50)">
            {/* Axis Labels */}
            <line x1="0" y1="300" x2="380" y2="300" stroke="#ffffff10" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="0" y1="0" x2="0" y2="300" stroke="#ffffff10" strokeWidth="1" strokeDasharray="5,5" />

            {/* Multi-layer sub-paths */}
            {mode === '1F' && (
               <>
                  <motion.path d={pathL1} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} />
                  <motion.path d={pathL2} fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} />
               </>
            )}

            {/* Dynamic IPR Path */}
            <motion.path
               d={path}
               fill="none" stroke={strokeColor} strokeWidth="4"
               initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
            />

            {/* Flowing Indicator */}
            <motion.circle
               r="6" fill="#ffffff"
               animate={{
                  cx: cxAnim,
                  cy: cyAnim,
                  opacity: cxAnim.map((_, i) => i === 0 || i === cxAnim.length - 1 ? 0.2 : 1)
               }}
               transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
            />

            {/* Grid Waves */}
            {[...Array(5)].map((_, i) => (
               <motion.circle
                  key={i} r={i * 40} fill="none" stroke={strokeColor} strokeWidth="1" strokeOpacity="0.05"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 4, delay: i * 0.5 }}
               />
            ))}
         </g>
         <text x="250" y="380" fill={strokeColor} fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Kinetic Reservoir Deliverability & Inflow Model</text>
      </svg>
   );
}

// ─── Shared UI Components ──────────────────────────────────────────────────

function ResultCard({ label, value, unit }: { label: string, value: string, unit: string }) {
   return (
      <div className="glass-card p-8 rounded-3xl border-white/5 bg-white/5 text-center group hover:border-blue-500/30 transition-all">
         <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">{label}</p>
         <h4 className="text-3xl font-black text-white italic tracking-tighter">{value} <span className="text-[10px] text-slate-600 not-italic uppercase tracking-widest font-bold">{unit}</span></h4>
      </div>
   );
}

function TheoryCard({ title, desc }: { title: string, desc: string }) {
   return (
      <div className="glass-card p-8 rounded-3xl border-white/5 bg-blue-600/5">
         <h5 className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-2">{title}</h5>
         <p className="text-[11px] text-slate-400 leading-relaxed italic">{desc}</p>
      </div>
   );
}
