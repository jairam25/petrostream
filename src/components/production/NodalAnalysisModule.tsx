import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
   Network, Settings, Activity, GitMerge, AlertCircle, Link2, Link2Off
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import {
   calculateDarcyRadialFlow,
   calculateVLPProxy,
   findNodalOperatingPoint
} from '../../lib/production';
import {
   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot
} from 'recharts';
import { NodalNeuralSimulator } from './NodalNeuralSimulator';
import { IPRNeuralSimulator } from './IPRNeuralSimulator';
import { useAppraisal, useDrilling, useProduction } from '../../store/hooks';

export function NodalAnalysisModule() {
   const [activePhase, setActivePhase] = useState<'3A' | '3B' | '3C'>('3A');

   const phases = [
      { id: '3A', name: 'System Components', icon: Network },
      { id: '3B', name: 'System Analysis', icon: Activity },
      { id: '3C', name: 'Design Optimization', icon: GitMerge }
   ];

   // ── Read upstream data from Appraisal & Drilling layers ──
   const { data: appraisal } = useAppraisal();
   const { data: drilling } = useDrilling();
   const { data: production, update: updateProduction } = useProduction();

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
      s: drilling?.wells?.[0]?.perforations?.[0]?.perforationSkin
         ?? (drilling?.wells?.[0]?.stimulation?.postStimSkin ?? 2),
      tubingId: drilling?.wells?.[0]?.tubingSize?.id ?? 2.441,
      depth: drilling?.wells?.[0]?.totalDepth?.tvd ?? 8000,
      gor: appraisal?.pvt?.solutionGOR?.rs?.[0] ?? 500,
   }), [appraisal, drilling]);

   const [hasUpstreamData, setHasUpstreamData] = useState(false);

   // Reservoir IPR Inputs
   const [pr, setPr] = useState(upstreamDefaults.pr);
   const [k, setK] = useState(upstreamDefaults.k);
   const [h, setH] = useState(upstreamDefaults.h);
   const [s, setS] = useState(upstreamDefaults.s);

   // VLP Inputs
   const [whp, setWhp] = useState(250); // psi
   const [depth, setDepth] = useState(upstreamDefaults.depth);
   const [tubingId, setTubingId] = useState(upstreamDefaults.tubingId);
   const [gor, setGor] = useState(upstreamDefaults.gor);
   const [wc, setWc] = useState(0.2); // fraction

   // Sync if upstream data changes after mount
   useEffect(() => {
      if (appraisal?.wellTests || appraisal?.petrophysics || drilling?.wells) {
         setHasUpstreamData(true);
         setPr(upstreamDefaults.pr);
         setK(upstreamDefaults.k);
         setH(upstreamDefaults.h);
         setS(upstreamDefaults.s);
         setTubingId(upstreamDefaults.tubingId);
         setDepth(upstreamDefaults.depth);
         setGor(upstreamDefaults.gor);
      }
   }, [upstreamDefaults, appraisal, drilling]);

   // Generate Nodal Data
   const nodalData = useMemo(() => {
      const iprPts = [];
      const vlpPts = [];

      // IPR parameters
      const mu = 1.2;
      const bo = 1.15;
      const re = 1500;
      const rw = 0.328;

      const maxRate = calculateDarcyRadialFlow(k, h, pr, 0, mu, bo, re, rw, s) * 1.2; // Extend a bit
      const maxQ = Math.max(1000, maxRate);

      const points = 50;
      for (let i = 0; i <= points; i++) {
         const q = (i / points) * maxQ;

         // VLP
         const pwf_vlp = calculateVLPProxy(q, whp, depth, tubingId, gor, wc);
         vlpPts.push({ q, pwf: pwf_vlp });

         // IPR (solving for Pwf given q is linear for Darcy)
         // q = J * (Pr - Pwf) => Pwf = Pr - (q / J)
         const J = (0.00708 * k * h) / (mu * bo * (Math.log(re / rw) - 0.75 + s));
         const pwf_ipr = pr - (q / J);
         if (pwf_ipr >= 0) {
            iprPts.push({ q, pwf: pwf_ipr });
         }
      }

      const opPoint = findNodalOperatingPoint(iprPts, vlpPts);

      return {
         iprPts,
         vlpPts,
         opPoint
      };
   }, [pr, k, h, s, whp, depth, tubingId, gor, wc]);

   // Persist nodal operating point to Production layer for downstream stages
   useEffect(() => {
      if (nodalData.opPoint) {
         const prodRecord = {
            date: new Date().toISOString().slice(0, 7),
            oilRate: Math.round(nodalData.opPoint.q),
            gasRate: Math.round(nodalData.opPoint.q * (gor / 1000)),
            waterRate: Math.round(nodalData.opPoint.q * wc),
            liquidRate: Math.round(nodalData.opPoint.q + nodalData.opPoint.q * wc),
            waterCut: wc,
            gor,
            glr: gor,
            chokeSize: 24,
            fthp: whp,
            fchp: whp * 0.8,
            fbhP: Math.round(nodalData.opPoint.pwf),
            reservoirPressure: pr,
            cumulativeOil: 0,
            cumulativeGas: 0,
            cumulativeWater: 0,
            status: 'producing' as const,
         };
         updateProduction({
            history: [
               {
                  wellId: 'PROD-001',
                  records: (
                     production?.history?.[0]?.records
                        ? [...production.history[0].records, prodRecord]
                        : [prodRecord]
                  ),
               },
            ],
            fieldAggregate: {
               ...(production?.fieldAggregate ?? {
                  totalOilRate: 0,
                  totalGasRate: 0,
                  totalWaterRate: 0,
                  totalLiquidRate: 0,
                  fieldWaterCut: 0,
                  fieldGOR: 0,
                  cumulativeOil: 0,
                  recoveryFactor: 0,
               }),
               totalOilRate: Math.round(nodalData.opPoint.q),
               totalGasRate: Math.round(nodalData.opPoint.q * (gor / 1000)),
               totalWaterRate: Math.round(nodalData.opPoint.q * wc),
               totalLiquidRate: Math.round(nodalData.opPoint.q + nodalData.opPoint.q * wc),
               fieldWaterCut: wc,
               fieldGOR: gor,
            },
            facilities: {
               ...(production?.facilities ?? {
                  separatorPressures: { hp: 0, ip: 0, lp: 0 },
                  exportSpec: { bsw: 0, salt: 0, rvp: 0, status: 'on-spec' },
                  gasExportRate: 0,
                  waterInjectionRate: 0,
                  gasLiftRate: 0,
                  chemicalInjection: [],
               }),
               separatorPressures: { hp: whp, ip: whp * 0.5, lp: whp * 0.2 },
            },
         });
      }
   }, [nodalData.opPoint, gor, wc, whp, pr, production?.history?.[0]?.records]);

   // Combined data for Recharts (needs to share X-axis which is Q)
   const chartData = useMemo(() => {
      const data = [];
      const maxQ = Math.max(...nodalData.iprPts.map(d => d.q), ...nodalData.vlpPts.map(d => d.q));
      for (let q = 0; q <= maxQ; q += (maxQ / 50)) {
         // Interpolate IPR
         let pwf_ipr = null;
         const iPt = nodalData.iprPts.find(p => p.q >= q);
         if (iPt) pwf_ipr = iPt.pwf;

         // Interpolate VLP
         let pwf_vlp = null;
         const vPt = nodalData.vlpPts.find(p => p.q >= q);
         if (vPt) pwf_vlp = vPt.pwf;

         if (pwf_ipr !== null || pwf_vlp !== null) {
            data.push({
               q: Math.round(q),
               ipr: pwf_ipr !== null ? Math.round(pwf_ipr) : null,
               vlp: pwf_vlp !== null ? Math.round(pwf_vlp) : null
            });
         }
      }
      return data;
   }, [nodalData]);

   return (
      <div className="space-y-8 animate-in fade-in duration-700">
         <div className="flex flex-col gap-4">
            <div>
               <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
                  <Network className="text-orange-500" size={32} />
                  Phase 3: Nodal Analysis <span className="text-orange-500/50">Systems Optimization</span>
               </h2>
               <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Inflow & Outflow Integration</p>
            </div>

            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit mt-4 flex-wrap gap-1">
               {phases.map(p => (
                  <button
                     key={p.id}
                     onClick={() => setActivePhase(p.id as any)}
                     className={cn(
                        "px-5 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
                        activePhase === p.id
                           ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                           : "text-slate-500 hover:text-white"
                     )}
                  >
                     <p.icon size={14} />
                     {p.name}
                  </button>
               ))}
            </div>
         </div>

         {/* Upstream data indicator */}
         <div className="flex items-center gap-2 text-[10px]">
            {hasUpstreamData ? (
               <span className="flex items-center gap-1 text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                  <Link2 size={12} /> Linked to Appraisal & Drilling
               </span>
            ) : (
               <span className="flex items-center gap-1 text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  <Link2Off size={12} /> Using defaults (no upstream data)
               </span>
            )}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Parameters */}
            <div className="lg:col-span-4 space-y-6">
               <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] h-full overflow-y-auto custom-scrollbar max-h-[800px]">
                  <div className="flex items-center gap-2 mb-6 text-orange-400">
                     <Settings size={20} />
                     <h3 className="text-xl font-black italic">System Parameters</h3>
                  </div>

                  <div className="space-y-8">
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest pb-2 border-b border-white/5">Inflow (Reservoir)</h4>
                        <InputWithSlider label="Reservoir Pressure (psi)" value={pr} min={1000} max={8000} step={50} unit="psi" onChange={setPr} />
                        <InputWithSlider label="Permeability (mD)" value={k} min={1} max={1000} step={1} unit="mD" onChange={setK} />
                        <InputWithSlider label="Skin Factor" value={s} min={-5} max={20} step={0.5} unit="" onChange={setS} />
                     </div>

                     <div className="space-y-4 pt-4">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest pb-2 border-b border-white/5">Outflow (Wellbore/Surface)</h4>
                        <InputWithSlider label="Wellhead Pressure (psi)" value={whp} min={50} max={2000} step={10} unit="psi" onChange={setWhp} />
                        <InputWithSlider label="Tubing ID (inches)" value={tubingId} min={1.5} max={5.5} step={0.1} unit="in" onChange={setTubingId} />
                        <InputWithSlider label="Gas-Oil Ratio (scf/stb)" value={gor} min={0} max={5000} step={50} unit="scf/stb" onChange={setGor} />
                     </div>
                  </div>
               </div>
            </div>

            {/* Visualization & Info */}
            <div className="lg:col-span-8 space-y-6">
               {/* Nodal Plot */}
               <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] h-[450px] flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Solution Node: Bottomhole</h4>
                        <p className="text-[11px] text-slate-500 uppercase font-black mt-1">Intersection determines operating point</p>
                     </div>
                     <div className="text-right flex gap-6">
                        <div>
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Operating Rate</p>
                           <p className={cn("text-2xl font-black italic", nodalData.opPoint ? "text-orange-400" : "text-red-500")}>
                              {nodalData.opPoint ? formatNumber(nodalData.opPoint.q, 0) : "0"} <span className="text-[10px] text-slate-500 not-italic">STB/d</span>
                           </p>
                        </div>
                        <div>
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Operating Pwf</p>
                           <p className={cn("text-2xl font-black italic", nodalData.opPoint ? "text-orange-400" : "text-red-500")}>
                              {nodalData.opPoint ? formatNumber(nodalData.opPoint.pwf, 0) : "N/A"} <span className="text-[10px] text-slate-500 not-italic">psi</span>
                           </p>
                        </div>
                     </div>
                  </div>

                  {!nodalData.opPoint && (
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-full border border-red-500/20 z-10">
                        <AlertCircle size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Well is Dead (No Intersection)</span>
                     </div>
                  )}

                  <div className="flex-1 min-h-0 relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" />
                           <XAxis type="number" dataKey="q" domain={[0, 'auto']} stroke="#475569" fontSize={10} label={{ value: 'Flow Rate (STB/D)', position: 'insideBottom', offset: -10, fill: '#64748b' }} />
                           <YAxis type="number" domain={[0, pr]} stroke="#475569" fontSize={10} label={{ value: 'Pressure (psi)', angle: -90, position: 'insideLeft', offset: -5, fill: '#64748b' }} />
                           <Tooltip
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                              itemStyle={{ fontWeight: 'bold' }}
                           />
                           {/* IPR Curve */}
                           <Line type="monotone" dataKey="ipr" name="IPR (Inflow)" stroke="#3b82f6" strokeWidth={3} dot={false} isAnimationActive={false} />
                           {/* VLP Curve */}
                           <Line type="monotone" dataKey="vlp" name="VLP (Outflow)" stroke="#a855f7" strokeWidth={3} dot={false} isAnimationActive={false} />

                           {nodalData.opPoint && (
                              <ReferenceDot x={nodalData.opPoint.q} y={nodalData.opPoint.pwf} r={6} fill="#f97316" stroke="#fff" strokeWidth={2} />
                           )}
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <AnimatePresence mode="wait">
                  <motion.div
                     key={activePhase}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                  >
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activePhase === '3A' && (
                           <>
                              <InfoCard title="Solution Node" desc="Typically chosen at the bottomhole (Pwf). This splits the system into Inflow (Reservoir to Bottomhole) and Outflow (Bottomhole to Surface)." />
                              <NodalNeuralSimulator pr={pr} pwf={pr * 0.6} pwh={whp} />
                           </>
                        )}
                        {activePhase === '3B' && (
                           <>
                              <InfoCard title="Effect of Depletion" desc="As reservoir pressure (Pr) drops, the blue IPR curve shifts left and down. Eventually, it will not intersect the purple VLP curve, and the well will die." />
                              <IPRNeuralSimulator mode="radial" params={{ skin: s, k, pr }} />
                           </>
                        )}
                        {activePhase === '3C' && (
                           <>
                              <InfoCard title="Tubing Sizing" desc="Smaller tubing increases friction (VLP steepens at high rates). Larger tubing decreases friction but increases liquid loading risk (VLP shifts up at low rates)." />
                              <IPRNeuralSimulator mode="horizontal" params={{ L: 2000, k, pr }} />
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

function InfoCard({ title, desc }: { title: string, desc: string }) {
   return (
      <div className="glass-card p-6 rounded-3xl border-white/5 bg-orange-500/5">
         <h5 className="text-[11px] font-black text-orange-400 uppercase tracking-widest mb-2">{title}</h5>
         <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{desc}</p>
      </div>
   );
}
