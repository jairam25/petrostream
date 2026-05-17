import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ArrowUpCircle, Wind, Cog, Flame, BarChart2 } from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculateESPTDH } from '../../lib/production';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LiftDynamicsSimulator } from './LiftDynamicsSimulator';

export function ArtificialLiftModule() {
  const [activePhase, setActivePhase] = useState<'5A' | '5B' | '5C' | '5D' | '5E' | '5F' | '5G'>('5A');
  const phases = [
    { id: '5A', name: 'Beam Pump', icon: Cog },
    { id: '5B', name: 'ESP', icon: Zap },
    { id: '5C', name: 'Gas Lift', icon: Wind },
    { id: '5D', name: 'PCP', icon: ArrowUpCircle },
    { id: '5E', name: 'Plunger', icon: Flame },
    { id: '5F', name: 'Jet Pump', icon: BarChart2 },
    { id: '5G', name: 'Selection', icon: BarChart2 },
  ];

  // ESP inputs
  const [depth, setDepth] = useState(8000);
  const [whp, setWhp] = useState(250);
  const [flowRate, setFlowRate] = useState(2000);
  const [espFreq, setEspFreq] = useState(60);

  const whpHead = (whp * 2.31); // psi to ft
  const frictionLoss = (depth * 0.03); // rough proxy
  const netLift = depth; // Vertical lift distance in ft
  const tdh = calculateESPTDH(netLift, frictionLoss, whpHead);
  const flowRateGPM = flowRate / 34.28; // STB/D to GPM
  const estimatedHP = Math.round((flowRateGPM * tdh) / (3960 * 0.65)); // Corrected for GPM using 3960 constant

  const selectionData = [
    { name: 'Gas Lift', rateMin: 500, rateMax: 30000, depthMax: 15000, score: 85 },
    { name: 'ESP', rateMin: 200, rateMax: 50000, depthMax: 12000, score: 90 },
    { name: 'Rod Pump', rateMin: 5, rateMax: 4000, depthMax: 10000, score: 70 },
    { name: 'PCP', rateMin: 10, rateMax: 4000, depthMax: 6000, score: 65 },
    { name: 'Plunger', rateMin: 2, rateMax: 500, depthMax: 12000, score: 55 },
    { name: 'Jet Pump', rateMin: 100, rateMax: 15000, depthMax: 15000, score: 60 },
  ];

  const liftContent: Record<string, { title: string; color: string; body: string; sub: string }> = {
    '5A': { title: 'Sucker Rod Beam Pump', color: 'text-yellow-400', body: 'The oldest artificial lift method. A surface beam drives sucker rods to a downhole pump. Dynamometer cards reveal pump condition — fluid pound, gas interference, and worn pumps show distinctive surface card shapes.', sub: 'Design parameters: pump depth, plunger diameter, stroke length (SPM), tapered rod string (3/4" → 7/8" → 1").' },
    '5C': { title: 'Continuous Gas Lift', color: 'text-cyan-400', body: 'Gas injected into the annulus reaches the deepest operating valve, lightening the fluid column. Unloading valves open sequentially from top to bottom during startup. System is designed to maximize rate per unit gas injected (GLR optimization).', sub: 'Design: gradient intersection method. Valve types: IPO (injection pressure operated) vs PPO (production pressure operated).' },
    '5D': { title: 'Progressive Cavity Pump', color: 'text-emerald-400', body: 'A helical rotor turns inside an elastomeric stator creating progressive cavities that move heavy, viscous oil to surface. Highly tolerant of solids and sand. Limited by temperature (elastomer degradation above 120°C for NBR).', sub: 'Applications: heavy oil, high water cut, sandy production, horizontal wells.' },
    '5E': { title: 'Plunger Lift', color: 'text-purple-400', body: 'A free-piston descends to the tubing shoe during shut-in. The well builds pressure, then is opened — the plunger rises, carrying a liquid slug to surface. Used to unload liquids in gas wells below the Turner critical rate.', sub: 'Cycle: shut-in (fall + pressure build) → open (rise + unload) → flow-after-arrival.' },
    '5F': { title: 'Jet Pump (Hydraulic)', color: 'text-pink-400', body: 'High-pressure power fluid (oil or water) is injected downhole through a nozzle, creating a low-pressure zone that entrains reservoir fluid. No moving parts — can handle gas, sand, and deviated wells. Easily retrieved by circulating.', sub: 'Design critical items: nozzle/throat sizing, NPSH (cavitation), power fluid rate/pressure.' },
    '5B': { title: 'Electrical Submersible Pump (ESP)', color: 'text-blue-400', body: '', sub: '' },
    '5G': { title: 'Lift Method Selection Matrix', color: 'text-orange-400', body: 'Method selection depends on rate, depth, GOR, sand, temperature, and economics.', sub: '' },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Zap className="text-yellow-500" size={32} />
          Phase 5: Artificial Lift <span className="text-yellow-500/50">Methods & Design</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Well Energy Supplement</p>
      </div>
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {phases.map(p => (
          <button key={p.id} onClick={() => setActivePhase(p.id as any)}
            className={cn("px-4 py-2.5 rounded-[14px] flex items-center gap-1.5 transition-all text-[10px] font-black uppercase tracking-widest",
              activePhase === p.id ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" : "text-slate-500 hover:text-white")}>
            <p.icon size={12} />{p.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activePhase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

          {activePhase === '5B' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4">
                <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] space-y-6">
                  <h3 className="text-xl font-black text-white italic">ESP Design Parameters</h3>
                  <InputWithSlider label="Pump Depth (ft)" value={depth} min={2000} max={15000} step={100} unit="ft" onChange={setDepth} />
                  <InputWithSlider label="Wellhead Pressure (psi)" value={whp} min={50} max={1500} step={25} unit="psi" onChange={setWhp} />
                  <InputWithSlider label="Flow Rate (STB/D)" value={flowRate} min={200} max={20000} step={100} unit="STB/D" onChange={setFlowRate} />
                  <InputWithSlider label="Motor Frequency (Hz)" value={espFreq} min={30} max={90} step={1} unit="Hz" onChange={setEspFreq} />
                </div>
              </div>
              <div className="lg:col-span-8 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Dynamic Head', value: formatNumber(tdh, 0), unit: 'ft', color: 'text-blue-400' },
                    { label: 'Net Lift', value: formatNumber(netLift, 0), unit: 'ft', color: 'text-cyan-400' },
                    { label: 'Friction Loss', value: formatNumber(frictionLoss, 0), unit: 'ft', color: 'text-purple-400' },
                    { label: 'Est. Motor HP', value: formatNumber(estimatedHP, 0), unit: 'hp', color: 'text-yellow-400' },
                  ].map(kpi => (
                    <div key={kpi.label} className="glass-card p-6 rounded-3xl border-white/5 bg-yellow-500/5 text-center">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{kpi.label}</p>
                      <p className={cn("text-2xl font-black italic", kpi.color)}>{kpi.value}</p>
                      <p className="text-[11px] text-slate-500 font-bold">{kpi.unit}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoCard color="text-yellow-400" title="Pump Curve" desc="Each ESP pump has a Head vs Flow rate curve at rated speed. Affinity laws allow adjusting for VSD frequency: Q ∝ f, Head ∝ f², Power ∝ f³. BEP should be targeted at the operating point." />
                  <LiftDynamicsSimulator method="esp" intensity={espFreq / 60} />
                </div>
              </div>
            </div>
          )}

          {activePhase === '5G' && (
            <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] h-[450px] flex flex-col">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic mb-6">Method Applicability Score (Qualitative)</h4>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectionData} layout="vertical" margin={{ left: 60, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="#475569" fontSize={10} label={{ value: 'Suitability Score', position: 'insideBottom', offset: -5, fill: '#64748b' }} />
                    <YAxis type="category" dataKey="name" stroke="#475569" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                    <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                      {selectionData.map((_, i) => (
                        <Cell key={i} fill={['#eab308', '#3b82f6', '#10b981', '#22d3ee', '#a855f7', '#ec4899'][i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {!['5B', '5G'].includes(activePhase) && (() => {
            const c = liftContent[activePhase];
            const methodMap: any = { '5A': 'beam', '5C': 'gas', '5D': 'pcp', '5E': 'plunger', '5F': 'jet' };
            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] flex flex-col items-center justify-center min-h-[400px] text-center gap-8">
                  <h3 className={cn("text-4xl font-black italic tracking-tighter", c.color)}>{c.title}</h3>
                  <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">{c.body}</p>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl max-w-2xl">
                    <p className="text-[10px] text-slate-400 font-medium">{c.sub}</p>
                  </div>
                </div>
                <LiftDynamicsSimulator method={methodMap[activePhase]} intensity={0.6} />
              </div>
            );
          })()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function InfoCard({ title, desc, color }: { title: string; desc: string; color: string }) {
  return (
    <div className="glass-card p-6 rounded-3xl border-white/5 bg-yellow-500/5">
      <h5 className={cn("text-[11px] font-black uppercase tracking-widest mb-2", color)}>{title}</h5>
      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
