import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Grid2X2, Shield, Cpu, Sliders, List } from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculatePerfSkin } from '../../lib/production';
import { CompletionNeuralSimulator } from './CompletionNeuralSimulator';

export function WellCompletionModule() {
  const [activePhase, setActivePhase] = useState<'6A' | '6B' | '6C' | '6D' | '6E' | '6F'>('6A');
  const phases = [
    { id: '6A', name: 'Completion Types', icon: Layers },
    { id: '6B', name: 'Perforation Design', icon: Grid2X2 },
    { id: '6C', name: 'Sand Control', icon: Shield },
    { id: '6D', name: 'Smart Completions', icon: Cpu },
    { id: '6E', name: 'Tubing Design', icon: Sliders },
    { id: '6F', name: 'Multi-Well', icon: List },
  ];

  const [spf, setSpf] = useState(6);
  const [pen, setPen] = useState(12);
  const [phase, setPhase] = useState(60);
  const [diam, setDiam] = useState(0.5);

  const perfSkin = useMemo(() => calculatePerfSkin(spf, pen, phase, diam), [spf, pen, phase, diam]);

  // ── Tubing Design State ──
  const [tubingSize, setTubingSize] = useState(3.5);
  const [tubingGrade, setTubingGrade] = useState('L80');
  const [tubingFlowRate, setTubingFlowRate] = useState(5000);
  const [tubingGOR, setTubingGOR] = useState(800);

  const tubingIDs: Record<number, number> = { 2.375: 1.995, 2.875: 2.441, 3.5: 2.992, 4.5: 3.958, 5.5: 4.892 };
  const tubeID = tubingIDs[tubingSize] ?? 2.992;
  const tubingArea = Math.PI * (tubeID / 2) ** 2;
  const tubingVelocity = tubingFlowRate / (tubingArea * 144 * 0.001); // ft/s approx
  const criticalVelocity = 5.34 * ((45 - 0.0031 * tubingGOR) ** 0.25) / ((tubingGOR * 0.002) ** 0.5);
  const erosionVelocity = 50 / Math.sqrt(tubingGOR * 0.002 + 0.1);

  const tubingGrades = [
    { grade: 'L80', yield: 80, application: 'Standard production — H₂S service' },
    { grade: 'C95', yield: 95, application: 'Heavy-duty — higher collapse resistance' },
    { grade: 'P110', yield: 110, application: 'Deep wells — high pressure' },
    { grade: 'Q125', yield: 125, application: 'HPHT environments — max strength' },
  ];

  // ── Multi-Well State ──
  const [selectedWells, setSelectedWells] = useState<string[]>(['Well-A1', 'Well-A2', 'Well-A3', 'Well-A4', 'Well-A5']);
  const availableWells = [
    'Well-A1', 'Well-A2', 'Well-A3', 'Well-A4', 'Well-A5',
    'Well-B1', 'Well-B2', 'Well-B3', 'Well-H1', 'Well-H2',
  ];
  const multiWellData = useMemo(() => {
    return selectedWells.map(w => ({
      id: w,
      completionType: ['Cased & Perf', 'Open Hole', 'Liner', 'Slotted Liner'][Math.floor(Math.random() * 4)],
      perfDensity: Math.floor(Math.random() * 10 + 2),
      sandControl: ['Gravel Pack', 'Wire Wrap', 'Frac-Pack', 'Standalone'][Math.floor(Math.random() * 4)],
      tubingSize: [2.375, 2.875, 3.5, 4.5][Math.floor(Math.random() * 4)],
      status: Math.random() > 0.3 ? 'Producing' : 'Shut-In',
    }));
  }, [selectedWells]);

  const completionTypes = [
    { name: 'Open Hole', desc: 'No casing across pay. Maximum inflow area. Best for competent rock & long horizontal wells.', status: 'Risk: No zonal isolation' },
    { name: 'Cased & Perforated', desc: 'Most common. Run casing, cement across pay, perforate selected intervals.', status: 'Best: Zonal isolation' },
    { name: 'Liner Completion', desc: 'Liner run to TD instead of full casing string. Reduces cost in deepwater.', status: 'Hybrid approach' },
    { name: 'Slotted Liner', desc: 'Pre-slotted or perforated liner used in horizontal wells as screen-equivalent.', status: 'Sand tolerant' },
  ];

  const sandControlMethods = [
    { name: 'Gravel Pack', desc: 'Gravel sized by Saucier criterion (D50 gravel = 5-6× formation D50) packed around screen.' },
    { name: 'Wire Wrap Screen', desc: 'Wire-wrapped or premium multi-layer sintered mesh. Slot sized to PSD.' },
    { name: 'Frac-Pack (TSO)', desc: 'Short, wide hydraulic fracture (Tip Screen-Out) packed with proppant + gravel pack combo.' },
    { name: 'Standalone Screen', desc: 'No gravel. Relies on screen alone. Low cost, higher risk. May include AICDs.' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Layers className="text-teal-500" size={32} />
          Phase 6: Well Completion <span className="text-teal-500/50">Design & Control</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Completion Architecture & Sand Management</p>
      </div>
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {phases.map(p => (
          <button key={p.id} onClick={() => setActivePhase(p.id as any)}
            className={cn("px-5 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
              activePhase === p.id ? "bg-teal-500 text-black shadow-lg shadow-teal-500/20" : "text-slate-500 hover:text-white")}>
            <p.icon size={13} />{p.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activePhase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

          {activePhase === '6A' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
              <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                {completionTypes.map((ct, idx) => (
                  <motion.div
                    key={ct.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card rounded-[24px] p-6 border-white/5 bg-black/40 hover:bg-teal-500/5 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500">
                        <Layers size={16} />
                      </div>
                    </div>
                    <h4 className="text-xs font-black text-white uppercase italic tracking-wider mb-1">{ct.name}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase">{ct.status}</p>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">{ct.desc}</p>
                  </motion.div>
                ))}
              </div>
              <div className="lg:col-span-8">
                <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#030407] h-full flex flex-col relative overflow-hidden min-h-[500px]">
                  <div className="absolute top-8 left-10 z-10">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Wellbore Architecture Simulator</h4>
                    <p className="text-[11px] text-teal-400 uppercase font-bold mt-1">Universal Completion String Modeling</p>
                  </div>
                  <div className="w-full h-full flex items-center justify-center">
                    <CompletionNeuralSimulator mode="wellbore" params={{}} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePhase === '6B' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4">
                <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] space-y-6">
                  <h3 className="text-xl font-black text-white italic">Perforation Parameters</h3>
                  <InputWithSlider label="Shots Per Foot (SPF)" value={spf} min={2} max={16} step={1} unit="spf" onChange={setSpf} />
                  <InputWithSlider label="Penetration Depth (in)" value={pen} min={4} max={30} step={1} unit="in" onChange={setPen} />
                  <InputWithSlider label="Phasing (degrees)" value={phase} min={0} max={180} step={60} unit="°" onChange={setPhase} />
                  <InputWithSlider label="Hole Diameter (in)" value={diam} min={0.25} max={1.0} step={0.05} unit="in" onChange={setDiam} />
                  <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Perforation Skin (Proxy)</p>
                    <p className={cn("text-4xl font-black italic", perfSkin < 0 ? "text-teal-400" : perfSkin < 2 ? "text-yellow-400" : "text-red-400")}>
                      {perfSkin.toFixed(1)}
                    </p>
                    <p className="text-[11px] text-slate-500 font-bold mt-1">{perfSkin < 0 ? 'Stimulated' : perfSkin < 2 ? 'Acceptable' : 'Damaged — optimize design'}</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoCard color="text-teal-400" title="Gun Types" desc="Casing guns: larger charges, run on wireline or TCP (tubing-conveyed perforating) for underbalanced shots. Through-tubing guns: smaller, coiled tubing deployed for selective reperforations." />
                  <InfoCard color="text-teal-400" title="Underbalanced Perforation" desc="Positive differential pressure into the wellbore at detonation clears crushed zone immediately. Self-cleaning perforation tunnels avoid compacted debris." />
                </div>
                <CompletionNeuralSimulator mode="perf" params={{ spf, pen, phase }} />
              </div>
            </div>
          )}

          {activePhase === '6C' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sandControlMethods.map(sc => (
                  <div key={sc.name} className="glass-card p-8 rounded-3xl border-white/5 bg-teal-500/5 hover:border-teal-500/30 transition-all">
                    <h5 className="text-[13px] font-black text-teal-400 uppercase tracking-widest mb-3">{sc.name}</h5>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{sc.desc}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="glass-card p-8 rounded-3xl border-white/5 bg-[#05070a]">
                  <h5 className="text-[11px] font-black text-teal-400 uppercase tracking-widest mb-3">Saucier Criterion (Gravel Sizing)</h5>
                  <p className="text-[11px] text-slate-300">Target gravel D<sub>50</sub> = 5 to 6 × Formation sand D<sub>50</sub>. Gravel must be large enough to avoid formation grain invasion into the pack, but small enough to bridge sand at the screen face. PSD analysis is mandatory input.</p>
                </div>
                <CompletionNeuralSimulator mode="sand" params={{ intensity: 0.8 }} />
              </div>
            </div>
          )}

          {activePhase === '6D' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: 'Permanent DG', desc: 'Permanent downhole pressure/temperature gauges. Continuous reservoir surveillance. Near real-time PTA via rate-normalized pressure.' },
                  { name: 'DTS (Fiber Temp)', desc: 'Distributed Temperature Sensing along entire wellbore. Flow profiling from temperature anomalies. Injection profiling, steam chamber monitoring.' },
                  { name: 'DAS (Fiber Acoustic)', desc: 'Distributed Acoustic Sensing. Detects flow noise, sand production, leaks, and fracture events along the full wellbore.' },
                  { name: 'ICV (Smart Valve)', desc: 'Interval Control Valves for individual zone management. Hydraulically or electrically actuated from surface. Enables reactive reservoir management.' },
                ].map(item => (
                  <div key={item.name} className="glass-card p-8 rounded-3xl border-white/5 bg-teal-500/5 hover:border-teal-500/30 transition-all">
                    <h5 className="text-[13px] font-black text-teal-400 uppercase tracking-widest mb-3">{item.name}</h5>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <CompletionNeuralSimulator mode="smart" params={{ intensity: 1.0 }} />
            </div>
          )}

          {activePhase === '6E' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4">
                <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] space-y-6">
                  <h3 className="text-xl font-black text-white italic">Tubing Configuration</h3>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">Tubing Size</label>
                    <div className="flex gap-2 flex-wrap">
                      {[2.375, 2.875, 3.5, 4.5, 5.5].map(sz => (
                        <button key={sz}
                          onClick={() => setTubingSize(sz)}
                          className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                            tubingSize === sz ? "bg-teal-500 text-black shadow-lg shadow-teal-500/20" : "bg-white/5 text-slate-400 hover:text-white")}>
                          {sz}&Prime;
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">Material Grade</label>
                    <select value={tubingGrade} onChange={e => setTubingGrade(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[10px] font-black uppercase tracking-wider">
                      {tubingGrades.map(g => <option key={g.grade} value={g.grade}>{g.grade} — {g.yield} ksi</option>)}
                    </select>
                  </div>
                  <InputWithSlider label="Flow Rate (bbl/d)" value={tubingFlowRate} min={100} max={20000} step={100} unit="bbl/d" onChange={setTubingFlowRate} />
                  <InputWithSlider label="Gas-Oil Ratio (scf/bbl)" value={tubingGOR} min={0} max={5000} step={100} unit="scf/bbl" onChange={setTubingGOR} />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Flow Velocity</p>
                      <p className={cn("text-2xl font-black italic", tubingVelocity < erosionVelocity ? "text-teal-400" : "text-rose-400")}>
                        {tubingVelocity.toFixed(1)} ft/s
                      </p>
                      <p className="text-[11px] text-slate-500 font-bold mt-1">{tubingVelocity < erosionVelocity ? 'Within limits' : 'Erosion risk!'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Critical Velocity</p>
                      <p className="text-2xl font-black text-yellow-400 italic">{criticalVelocity.toFixed(1)} ft/s</p>
                      <p className="text-[11px] text-slate-500 font-bold mt-1">Liquid unloading limit</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8 space-y-6">
                <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#030407] h-full flex flex-col relative overflow-hidden min-h-[400px]">
                  <div className="absolute top-8 left-10 z-10">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Tubing String Schematic</h4>
                    <p className="text-[11px] text-teal-400 uppercase font-bold mt-1">{tubingSize}&Prime; — {tubingGrade} — ID {tubeID}&Prime;</p>
                  </div>
                  <div className="w-full h-full flex items-center justify-center">
                    <CompletionNeuralSimulator mode="wellbore" params={{}} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tubingGrades.map(g => (
                    <div key={g.grade} className={cn("glass-card p-4 rounded-2xl border transition-all",
                      tubingGrade === g.grade ? "bg-teal-500/10 border-teal-500/50" : "bg-white/5 border-white/5")}>
                      <h5 className="text-[11px] font-black text-teal-400 uppercase tracking-widest mb-1">{g.grade}</h5>
                      <p className="text-[11px] text-slate-400">Yield: {g.yield} ksi — {g.application}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activePhase === '6F' && (
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-3xl border-white/5 bg-[#05070a]">
                <h5 className="text-[11px] font-black text-teal-400 uppercase tracking-widest mb-4">Selected Wells ({selectedWells.length})</h5>
                <div className="flex flex-wrap gap-2 mb-6">
                  {availableWells.map(w => {
                    const selected = selectedWells.includes(w);
                    return (
                      <button key={w}
                        onClick={() => setSelectedWells(prev => selected ? prev.filter(x => x !== w) : [...prev, w])}
                        className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                          selected ? "bg-teal-500 text-black shadow-lg shadow-teal-500/20" : "bg-white/5 text-slate-500 hover:text-white")}>
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left glass-card rounded-3xl border-white/5 bg-[#05070a]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Well</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion Type</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Perf Density</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sand Control</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tubing</th>
                      <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {multiWellData.map(row => (
                      <tr key={row.id} className="border-b border-white/5 hover:bg-teal-500/5 transition-all">
                        <td className="p-4 text-[11px] font-black text-white uppercase">{row.id}</td>
                        <td className="p-4 text-[10px] text-slate-300">{row.completionType}</td>
                        <td className="p-4 text-[10px] text-slate-300">{row.perfDensity} spf</td>
                        <td className="p-4 text-[10px] text-slate-300">{row.sandControl}</td>
                        <td className="p-4 text-[10px] text-slate-300">{row.tubingSize}&Prime;</td>
                        <td className="p-4">
                          <span className={cn("px-2 py-1 rounded-lg text-[11px] font-black uppercase",
                            row.status === 'Producing' ? "bg-green-500/20 text-green-400" : "bg-rose-500/20 text-rose-400")}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-5 rounded-2xl border-white/5 bg-teal-500/5 text-center">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Wells</p>
                  <p className="text-2xl font-black text-teal-400 italic">{selectedWells.length}</p>
                </div>
                <div className="glass-card p-5 rounded-2xl border-white/5 bg-teal-500/5 text-center">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Producing</p>
                  <p className="text-2xl font-black text-green-400 italic">{multiWellData.filter(d => d.status === 'Producing').length}</p>
                </div>
                <div className="glass-card p-5 rounded-2xl border-white/5 bg-teal-500/5 text-center">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Shut-In</p>
                  <p className="text-2xl font-black text-rose-400 italic">{multiWellData.filter(d => d.status === 'Shut-In').length}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function InfoCard({ title, desc, color }: { title: string; desc: string; color: string }) {
  return (
    <div className="glass-card p-6 rounded-3xl border-white/5 bg-teal-500/5">
      <h5 className={cn("text-[11px] font-black uppercase tracking-widest mb-2", color)}>{title}</h5>
      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
