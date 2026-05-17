import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Globe, BrainCircuit, LineChart } from 'lucide-react';
import { cn } from '../../lib/utils';

export function DigitalOilfieldModule() {
  const [activePhase, setActivePhase] = useState<'12A' | '12B' | '12C'>('12A');
  const phases = [
    { id: '12A', name: 'Well Optimization', icon: LineChart },
    { id: '12B', name: 'Field Optimization', icon: Globe },
    { id: '12C', name: 'Digital Oilfield', icon: BrainCircuit },
  ];

  const kpis = [
    { label: 'Wells Online', value: '247', unit: '', color: 'text-violet-400' },
    { label: 'Total Liquid Rate', value: '124,500', unit: 'STB/D', color: 'text-cyan-400' },
    { label: 'Water Cut (Avg)', value: '62', unit: '%', color: 'text-blue-400' },
    { label: 'Field GOR', value: '1,240', unit: 'scf/stb', color: 'text-emerald-400' },
    { label: 'Active ESPs', value: '183', unit: 'of 247', color: 'text-yellow-400' },
    { label: 'ML Anomalies', value: '4', unit: 'Flagged', color: 'text-red-400' },
  ];

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '12A': { items: [
      { title: 'Choke Optimization', desc: 'Adjust choke size to maximize rate within operating constraints (sand production threshold, water/gas coning limit, equipment pressure/rate limits). Real-time optimization via SCADA.' },
      { title: 'Artificial Lift Optimization', desc: 'ESP: VSD frequency optimization for BEP. Gas lift: injection rate per well optimized to maximize field production at constrained gas volume. Rod pump: stroke speed and POC to prevent pump-off.' },
      { title: 'Drawdown Management', desc: 'Controlled drawdown (minimum Pwf) to avoid sand failure, coning, or formation damage. Rate limits set from geomechanical sanding predictions and historical data.' },
      { title: 'Stimulation Candidate Screening', desc: 'Compare current PI vs theoretical PI (skin = 0). High positive skin = damage. Identify wells where stimulation NPV is positive given current oil price and workover cost.' },
    ]},
    '12B': { items: [
      { title: 'Well Spacing & Infill Drilling', desc: 'Drainage area per well from PTA boundary analysis. Interference testing between wells. Optimize infill drill locations using isobaric maps and remaining oil saturation models.' },
      { title: 'Injection Optimization', desc: 'Waterflood: allocate injection to high-sweep patterns (VRR balance). Profile modification (gel treatments) to divert water into unswept zones. Pattern balancing via CRM (Capacitance-Resistance Model).' },
      { title: 'Facility Constraint Management', desc: 'Field rate limited by gas handling, water injection, compression, or pipeline capacity. Allocate production across wells to maximize value given these facility constraints.' },
      { title: 'Integrated Asset Model (IAM)', desc: 'Reservoir + well + pipeline + facilities model in a single simulator. Models full system response to changes. Used for production forecasting, debottlenecking studies, and infill planning.' },
    ]},
    '12C': { items: [
      { title: 'SCADA & Real-Time Data', desc: 'Supervisory Control and Data Acquisition. Well site automation: wellhead pressure, temperature, flow rate, choke position. Alarms, remote shutdown (ESD), production optimization loops. Historian database.' },
      { title: 'Virtual Metering (Soft Sensing)', desc: 'Multi-phase flow model predicts well rates using surface measurements (Pwh, Twh, choke position) without a physical MPFM. Reduces test separator reliance. Continuous allocation for all wells.' },
      { title: 'Predictive Analytics & ML', desc: 'ESP failure prediction (vibration, motor temp, current signature). Rod pump dynamometer card classification (neural network). Production anomaly detection. Rate forecasting (decline curve + ML hybrid).' },
      { title: 'Digital Twin', desc: 'High-fidelity integrated model of reservoir + wellbore + facilities updated continuously with real-time data. Enables scenario testing, what-if analysis, and automated control loop optimization for the entire asset.' },
    ]},
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <BrainCircuit className="text-violet-500" size={32} />
          Phase 12: Production Optimization <span className="text-violet-500/50">& Digital Oilfield</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Smart Fields & Analytics</p>
      </div>
      
      {/* Live KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="glass-card p-5 rounded-3xl border-white/5 bg-violet-500/5 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className={cn("text-xl font-black italic", kpi.color)}>{kpi.value}</p>
            <p className="text-[10px] text-slate-600 font-bold">{kpi.unit}</p>
          </div>
        ))}
      </div>

      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {phases.map(p => (
          <button key={p.id} onClick={() => setActivePhase(p.id as any)}
            className={cn("px-5 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
              activePhase === p.id ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" : "text-slate-500 hover:text-white")}>
            <p.icon size={13} />{p.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activePhase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content[activePhase].items.map(item => (
              <div key={item.title} className="glass-card p-8 rounded-3xl border-white/5 bg-violet-500/5 hover:border-violet-500/30 transition-all">
                <h5 className="text-[13px] font-black text-violet-400 uppercase tracking-widest mb-3">{item.title}</h5>
                <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
