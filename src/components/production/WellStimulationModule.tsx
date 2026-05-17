import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Flame, Zap, CheckCircle2, TestTube } from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculateFCD } from '../../lib/production';
import { StimulationNeuralSimulator } from './StimulationNeuralSimulator';

export function WellStimulationModule() {
  const [activePhase, setActivePhase] = useState<'7A' | '7B' | '7C' | '7D' | '7E'>('7A');
  const phases = [
    { id: '7A', name: 'Matrix Acid', icon: TestTube },
    { id: '7B', name: 'Acid Fracturing', icon: Droplets },
    { id: '7C', name: 'Hydraulic Frac', icon: Flame },
    { id: '7D', name: 'Unconventional', icon: Zap },
    { id: '7E', name: 'Evaluation', icon: CheckCircle2 },
  ];

  // Hydraulic frac inputs
  const [kf, setKf] = useState(50000);
  const [wf, setWf] = useState(0.25); // inches
  const [k, setK] = useState(1); // mD
  const [xf, setXf] = useState(500); // ft

  const fcd = useMemo(() => calculateFCD(kf, wf, k, xf), [kf, wf, k, xf]);
  const fcdInterpret = fcd > 50 ? 'Infinite Conductivity (Optimal)' : fcd > 10 ? 'Finite Conductivity (Acceptable)' : 'Under-conducting (Re-design)';
  const fcdColor = fcd > 50 ? 'text-emerald-400' : fcd > 10 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Flame className="text-rose-500" size={32} />
          Phase 7: Well Stimulation <span className="text-rose-500/50">Matrix & Fracturing</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Productivity Enhancement</p>
      </div>
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {phases.map(p => (
          <button key={p.id} onClick={() => setActivePhase(p.id as any)}
            className={cn("px-5 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
              activePhase === p.id ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "text-slate-500 hover:text-white")}>
            <p.icon size={13} />{p.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activePhase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

          {activePhase === '7A' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Sandstone Acidizing', desc: 'HF/HCl Mud Acid (12% HCl + 3% HF). Pre-flush (HCl) displaces brine and dissolves carbonates. Main acid dissolves clays and feldspars. Over-flush displaces spent acid. Precipitation of CaF₂ and fluosilicates is a key risk.' },
                { title: 'Carbonate Acidizing', desc: 'HCl (15-28%) creates wormholes rather than uniform dissolution. Optimal injection rate exists at the minimum in the Pore Volume to Breakthrough (PVBT) curve (Damköhler number criterion).' },
                { title: 'Diversion Techniques', desc: 'Mechanical (ball sealers, packers, CT) or chemical diverters (VES, foam, degradable fibers) ensure acid coverage across the entire perforated interval.' },
                { title: 'Treatment Design', desc: 'Key outputs: acid volume per foot of pay, injection rate (must be below fracture initiation pressure), pump schedule, and additive package (corrosion inhibitor, iron control, clay stabilizer).' },
              ].map(item => (
                <div key={item.title} className="glass-card p-8 rounded-3xl border-white/5 bg-rose-500/5 hover:border-rose-500/30 transition-all">
                  <h5 className="text-[13px] font-black text-rose-400 uppercase tracking-widest mb-3">{item.title}</h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activePhase === '7B' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Wormhole Etching', desc: 'In carbonates, acid etches the fracture face differentially. The uneven etching creates channels that remain propped open after hydraulic closure — no proppant needed.' },
                { title: 'Nierode-Kruk Correlation', desc: 'Industry standard for predicting acid-etched fracture conductivity as a function of etched width, rock embedment strength, and net closure stress.' },
                { title: 'Acid Spending', desc: 'HCl reacts rapidly — spending limits the effective fracture length. Retarded systems (gelled acid, emulsified acid, foamed acid) slow reaction for deeper penetration.' },
                { title: 'Fluid Loss Control', desc: 'Acid leaks off into the matrix, reducing fracture length and spending acid before it reaches the tip. Fluid loss additives (FLA) and viscosified acids help control leakoff.' },
              ].map(item => (
                <div key={item.title} className="glass-card p-8 rounded-3xl border-white/5 bg-rose-500/5 hover:border-rose-500/30 transition-all">
                  <h5 className="text-[13px] font-black text-rose-400 uppercase tracking-widest mb-3">{item.title}</h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activePhase === '7C' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
              <div className="lg:col-span-4">
                <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] space-y-6">
                  <h3 className="text-xl font-black text-white italic">Fracture Design</h3>
                  <InputWithSlider label="Fracture Perm (mD)" value={kf} min={10000} max={500000} step={5000} unit="mD" onChange={setKf} />
                  <InputWithSlider label="Fracture Width (in)" value={wf} min={0.05} max={1.0} step={0.05} unit="in" onChange={setWf} />
                  <InputWithSlider label="Reservoir Perm (mD)" value={k} min={0.001} max={100} step={0.001} unit="mD" onChange={setK} />
                  <InputWithSlider label="Half-Length xf (ft)" value={xf} min={50} max={3000} step={50} unit="ft" onChange={setXf} />
                  <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Dimensionless FCD</p>
                    <p className={cn("text-4xl font-black italic", fcdColor)}>{fcd.toFixed(1)}</p>
                    <p className="text-[11px] text-slate-500 font-bold mt-1">{fcdInterpret}</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8 flex flex-col gap-6">
                 <div className="flex-1">
                   <StimulationNeuralSimulator mode="frac" params={{ length: xf, width: wf }} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard color="text-rose-400" title="In-Situ Stress State" desc="Fracture propagates perpendicular to minimum horizontal stress (σh). Fracture height controlled by stress contrasts." />
                    <InfoCard color="text-rose-400" title="Fracture Geometry Models" desc="PKN model: long fractures, elliptical x-section. KGD model: short, wide fractures, plane strain." />
                 </div>
              </div>
            </div>
          )}

          {activePhase === '7D' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Multi-Stage Perforating', desc: 'Plug-and-perf: set plug, perforate cluster, frac, repeat uphole. Sliding sleeves: ball-activated stages. Limited entry: intentional flow restriction to distribute fluid across clusters.' },
                { title: 'Cluster & Stage Spacing', desc: 'Cluster spacing: 30-75 ft. Stage spacing: 150-300 ft. Stress shadow between adjacent fractures causes stress reversal and may divert subsequent fractures — complex network development.' },
                { title: 'Slickwater Treatment', desc: 'High rate (60-100 bpm), low viscosity, enables complex fracture growth in naturally fractured formations. 100 mesh sand for thin fractures, 40/70 for proppant transport.' },
                { title: 'Refracturing', desc: 'Re-stimulate older horizontals. Degradable chemical diverters redirect new fracture to unstimulated clusters. Refrac candidate identification from production decline and cluster efficiency analysis (DTS).' },
              ].map(item => (
                <div key={item.title} className="glass-card p-8 rounded-3xl border-white/5 bg-rose-500/5 hover:border-rose-500/30 transition-all">
                  <h5 className="text-[13px] font-black text-rose-400 uppercase tracking-widest mb-3">{item.title}</h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activePhase === '7E' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'DFIT / Minifrac Analysis', desc: 'Diagnostic Fracture Injection Test: inject small volume, shut in, analyse pressure falloff. G-function identifies closure pressure. Before-closure: leakoff coefficient. After-closure: reservoir permeability and pressure.' },
                { title: 'Skin Reduction', desc: 'Pre- and post-stimulation well tests quantify skin change. Flow Efficiency (FE) = J_actual / J_ideal. Folds-of-Increase (FOI) = q_post / q_pre.' },
                { title: 'Microseismic Mapping', desc: 'Records micro-earthquakes triggered by fracture propagation. Maps fracture geometry, height, length, and azimuth. Identifies out-of-zone growth and fault reactivation.' },
                { title: 'Fiber-Optic Diagnostics', desc: 'DTS: temperature anomalies show fluid entry per cluster. DAS: acoustic amplitude correlates with flow rate. Tracer logs: radioactive or chemical tracers to identify propped stages.' },
              ].map(item => (
                <div key={item.title} className="glass-card p-8 rounded-3xl border-white/5 bg-rose-500/5 hover:border-rose-500/30 transition-all">
                  <h5 className="text-[13px] font-black text-rose-400 uppercase tracking-widest mb-3">{item.title}</h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function InfoCard({ title, desc, color }: { title: string; desc: string; color: string }) {
  return (
    <div className="glass-card p-6 rounded-3xl border-white/5 bg-rose-500/5">
      <h5 className={cn("text-[11px] font-black uppercase tracking-widest mb-2", color)}>{title}</h5>
      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
