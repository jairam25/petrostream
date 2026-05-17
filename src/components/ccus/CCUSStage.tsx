import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Factory, Zap, Wind, Cpu, FlaskConical, Truck, Mountain, BarChart2, ShieldAlert, Scale, Radio, Recycle, DollarSign, Building2, Rocket, Loader2, CheckCircle, Calculator, ShieldCheck, AlertTriangle, Droplets, Gauge, Thermometer, Waves, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CCUSNeuralSimulator } from './CCUSNeuralSimulator';
import DataFlowIndicator from '../shared/DataFlowIndicator';
import SampleDataLoader from '../shared/SampleDataLoader';
import { getCCUSSample } from '../../lib/sampleData';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area,
} from 'recharts';

type CCUSTab = 'ph1' | 'ph2' | 'ph3' | 'ph4' | 'ph5' | 'ph6' | 'ph7' | 'ph8' | 'ph9' | 'ph10' | 'ph11' | 'ph12';

export default function CCUSStage() {
  const [activeTab, setActiveTab] = useState<CCUSTab>('ph1');

  const handleLoadSample = useCallback(() => {
    const s = getCCUSSample();
    const keys: Record<string, unknown> = {
      sourceType: s.sourceType, annualEmissionsTonne: s.annualEmissionsTonne,
      co2Purity: s.co2Purity, captureTech: s.captureTech,
      captureEfficiency: s.captureEfficiency, captureCostPerTonne: s.captureCostPerTonne,
      transportMode: s.transportMode, transportDistanceKm: s.transportDistanceKm,
      storageType: s.storageType, reservoirDepthM: s.reservoirDepthM,
      storageCapacityMt: s.storageCapacityMt, injectivityIndex: s.injectivityIndex,
      regulatoryFramework: s.regulatoryFramework, carbonPricePerTonne: s.carbonPricePerTonne,
      projectLifetimeYears: s.projectLifetimeYears, totalCapexM: s.totalCapexM,
      annualOpexM: s.annualOpexM,
    };
    (window as any).__petrostreamStore?.setState?.({ ccus: keys });
  }, []);

  const tabs = [
    { id: 'ph1' as CCUSTab, label: 'Ph.1: CO₂ Sources', icon: Factory },
    { id: 'ph2' as CCUSTab, label: 'Ph.2: Capture Tech', icon: FlaskConical },
    { id: 'ph3' as CCUSTab, label: 'Ph.3: Transport', icon: Truck },
    { id: 'ph4' as CCUSTab, label: 'Ph.4: Geo Storage', icon: Mountain },
    { id: 'ph5' as CCUSTab, label: 'Ph.5: Simulation', icon: BarChart2 },
    { id: 'ph6' as CCUSTab, label: 'Ph.6: MVA', icon: Radio },
    { id: 'ph7' as CCUSTab, label: 'Ph.7: Utilization', icon: Recycle },
    { id: 'ph8' as CCUSTab, label: 'Ph.8: Risk Assess', icon: ShieldAlert },
    { id: 'ph9' as CCUSTab, label: 'Ph.9: Regulatory', icon: Scale },
    { id: 'ph10' as CCUSTab, label: 'Ph.10: Economics', icon: DollarSign },
    { id: 'ph11' as CCUSTab, label: 'Ph.11: Hubs', icon: Building2 },
    { id: 'ph12' as CCUSTab, label: 'Ph.12: Emerging', icon: Rocket },
  ];

  return (
    <div className="h-full flex flex-col">
      <DataFlowIndicator activeStage="CCUS" />
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/20">
        <Globe className="text-emerald-400" size={20} />
        <span className="text-white font-black italic text-lg tracking-tight mr-6">CCUS</span>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={cn("flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === t.id ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-white hover:bg-white/5")}>
            <t.icon size={13} />{t.label}
          </button>
        ))}
        <SampleDataLoader loadSample={handleLoadSample} label="Load Northern Lights Analog" stageName="CCUS" />
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {activeTab === 'ph1' && <Phase1Sources />}
            {activeTab === 'ph2' && <Phase2Capture />}
            {activeTab === 'ph3' && <Phase3Transport />}
            {activeTab === 'ph4' && <Phase4GeoStorage />}
            {activeTab === 'ph5' && <Phase5Simulation />}
            {activeTab === 'ph6' && <Phase6MVA />}
            {activeTab === 'ph7' && <Phase7Utilization />}
            {activeTab === 'ph8' && <Phase8Risk />}
            {activeTab === 'ph9' && <Phase9Regulatory />}
            {activeTab === 'ph10' && <Phase10Economics />}
            {activeTab === 'ph11' && <Phase11Hubs />}
            {activeTab === 'ph12' && <Phase12Emerging />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Shared Components ---
function Card({ title, desc, color }: { title: string; desc?: string; color: string }) {
  return (
    <div className="glass-card p-6 rounded-3xl border-white/5 bg-emerald-500/5 hover:border-emerald-500/30 transition-all">
      <h5 className={cn('text-[11px] font-black uppercase tracking-widest mb-2', color)}>{title}</h5>
      {desc && <p className="text-[11px] text-slate-300 leading-relaxed">{desc}</p>}
    </div>
  );
}

function MetricRow({ label, value, unit, status }: { label: string; value: string; unit?: string; status?: 'good' | 'warning' | 'bad' }) {
  const statusColor = status === 'good' ? 'text-emerald-400' : status === 'warning' ? 'text-amber-400' : status === 'bad' ? 'text-red-400' : 'text-white';
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <span className={cn("text-[11px] font-black font-mono", statusColor)}>{value}{unit && <span className="text-slate-600 ml-1 text-[9px]">{unit}</span>}</span>
    </div>
  );
}

// --- Phase 1: CO₂ Sources ---
function Phase1Sources() {
  const sources = [
    { sector: 'Power Generation', emissions: 145, color: '#10b981', icon: Zap },
    { sector: 'Cement', emissions: 62, color: '#6366f1', icon: Factory },
    { sector: 'Steel', emissions: 52, color: '#f59e0b', icon: Factory },
    { sector: 'Refining', emissions: 38, color: '#ef4444', icon: FlaskConical },
    { sector: 'Chemicals', emissions: 25, color: '#06b6d4', icon: FlaskConical },
    { sector: 'Natural Gas Processing', emissions: 18, color: '#8b5cf6', icon: Wind },
  ];
  const pieData = sources.map(s => ({ name: s.sector, value: s.emissions, color: s.color }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Factory className="text-emerald-500" size={32} />
          Phase 1: CO₂ Emission Sources <span className="text-emerald-500/50">& Inventory</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card rounded-3xl p-6">
          <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-4">Global CO₂ by Sector (Mt/yr)</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>{pieData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4">
          {sources.map((s, i) => (
            <motion.div key={s.sector} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5">
              <s.icon size={20} style={{ color: s.color }} />
              <div className="flex-1">
                <span className="text-white text-sm font-bold">{s.sector}</span>
                <div className="h-1.5 mt-1 rounded-full bg-white/10 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(s.emissions / 150) * 100}%` }} transition={{ delay: i * 0.2, duration: 0.8 }} className="h-full rounded-full" style={{ backgroundColor: s.color }} />
                </div>
              </div>
              <span className="text-white font-mono font-bold text-sm">{s.emissions} Mt/yr</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Phase 2: Capture Technology ---
function Phase2Capture() {
  const techs = [
    { name: 'Amine Scrubbing', trl: 9, efficiency: 90, cost: 55, color: 'text-emerald-400', desc: 'Chemical absorption with aqueous amines — industrial standard for post-combustion' },
    { name: 'Membrane Separation', trl: 7, efficiency: 80, cost: 45, color: 'text-blue-400', desc: 'Polymeric or ceramic membranes selective for CO₂/N₂ separation' },
    { name: 'Oxy-fuel Combustion', trl: 6, efficiency: 95, cost: 70, color: 'text-amber-400', desc: 'Pure oxygen combustion produces nearly pure CO₂ flue gas stream' },
    { name: 'Calcium Looping', trl: 6, efficiency: 88, cost: 40, color: 'text-purple-400', desc: 'CaO carbonation/calcination cycle using fluidized bed reactors' },
    { name: 'Cryogenic Separation', trl: 5, efficiency: 85, cost: 80, color: 'text-cyan-400', desc: 'Low-temperature distillation to separate CO₂ from flue gas' },
    { name: 'Direct Air Capture', trl: 5, efficiency: 60, cost: 300, color: 'text-rose-400', desc: 'Capture CO₂ directly from ambient air (400 ppm) with solid sorbents' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <FlaskConical className="text-emerald-500" size={32} />
          Phase 2: Capture Technology <span className="text-emerald-500/50">& Assessment</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {techs.map((t, i) => (
          <motion.div key={t.name} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="glass-card p-5 rounded-2xl">
            <h5 className={cn('text-[10px] font-black uppercase tracking-widest mb-3', t.color)}>{t.name}</h5>
            <p className="text-[10px] text-slate-400 mb-4">{t.desc}</p>
            <div className="space-y-2">
              <MetricRow label="TRL" value={`${t.trl}/9`} status={t.trl >= 8 ? 'good' : t.trl >= 6 ? 'warning' : 'bad'} />
              <MetricRow label="Capture Efficiency" value={`${t.efficiency}`} unit="%" />
              <MetricRow label="Cost" value={`$${t.cost}`} unit="/tonne" status={t.cost < 60 ? 'good' : t.cost < 100 ? 'warning' : 'bad'} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Phase 3: Transport ---
function Phase3Transport() {
  const modes = [
    { mode: 'Pipeline (Dense Phase)', cost: 2.5, distance: '100+ km', capacity: '5-20 Mt/yr', color: 'text-emerald-400', desc: 'Supercritical CO₂ at >1085 psi via carbon steel pipelines — most economical for large volumes' },
    { mode: 'Ship Transport', cost: 15, distance: '500-1500 km', capacity: '0.5-2 Mt/yr', color: 'text-blue-400', desc: 'Liquefied CO₂ at -50°C and 7 bar in insulated cryogenic tanks — ideal for long-distance offshore' },
    { mode: 'Rail Transport', cost: 25, distance: '200-800 km', capacity: '0.1-0.5 Mt/yr', color: 'text-amber-400', desc: 'Pressurized tank cars — suited for regional distribution networks and early-phase projects' },
    { mode: 'Truck Transport', cost: 40, distance: '50-200 km', capacity: '<0.1 Mt/yr', color: 'text-red-400', desc: 'Liquid CO₂ trailers for small pilot projects and dispersed sources' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Truck className="text-emerald-500" size={32} />
          Phase 3: CO₂ Transport <span className="text-emerald-500/50">& Logistics</span>
        </h2>
      </div>
      <div className="space-y-6">
        {modes.map((m, i) => (
          <motion.div key={m.mode} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.15 }} className="glass-card p-6 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h5 className={cn('text-[11px] font-black uppercase tracking-widest mb-1', m.color)}>{m.mode}</h5>
                <p className="text-[10px] text-slate-400 mb-4">{m.desc}</p>
                <div className="grid grid-cols-3 gap-4">
                  <div><span className="text-[9px] text-slate-500 uppercase block">$/tonne/100km</span><span className="text-white font-mono font-bold">{m.cost}</span></div>
                  <div><span className="text-[9px] text-slate-500 uppercase block">Range</span><span className="text-white font-mono font-bold">{m.distance}</span></div>
                  <div><span className="text-[9px] text-slate-500 uppercase block">Capacity</span><span className="text-white font-mono font-bold">{m.capacity}</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Phase 4: Geological Storage ---
function Phase4GeoStorage() {
  const storageTypes = [
    { type: 'Saline Aquifers', capacity: 10000, certainty: 'High', color: 'text-emerald-400', desc: 'Deep porous, permeable formations saturated with brine — largest global storage capacity' },
    { type: 'Depleted Oil/Gas Fields', capacity: 900, certainty: 'Highest', color: 'text-blue-400', desc: 'Proven seal integrity and well-characterized geology — ready for immediate use' },
    { type: 'EOR Storage', capacity: 140, certainty: 'High', color: 'text-amber-400', desc: 'CO₂ injection enhances oil recovery while storing — revenue offset opportunity' },
    { type: 'Basalt/Mineralization', capacity: 5000, certainty: 'Medium', color: 'text-purple-400', desc: 'Reactive rock turns CO₂ into stable carbonate minerals — permanent storage' },
    { type: 'Coal Seams (ECBM)', capacity: 200, certainty: 'Low', color: 'text-rose-400', desc: 'CO₂ displaces methane in deep unmineable coal beds — dual benefit potential' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Mountain className="text-emerald-500" size={32} />
          Phase 4: Geological Storage <span className="text-emerald-500/50">& Reservoir Characterization</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {storageTypes.map((s, i) => (
          <motion.div key={s.type} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="glass-card p-5 rounded-2xl">
            <h5 className={cn('text-[11px] font-black uppercase tracking-widest mb-2', s.color)}>{s.type}</h5>
            <p className="text-[10px] text-slate-400 mb-4">{s.desc}</p>
            <div className="flex gap-6">
              <div><span className="text-[9px] text-slate-500 block uppercase">Global Capacity</span><span className="text-white font-mono font-bold">{s.capacity}+ Gt</span></div>
              <div><span className="text-[9px] text-slate-500 block uppercase">Certainty</span><span className={cn('font-mono font-bold', s.certainty === 'Highest' ? 'text-emerald-400' : s.certainty === 'High' ? 'text-blue-400' : s.certainty === 'Medium' ? 'text-amber-400' : 'text-red-400')}>{s.certainty}</span></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Phase 5: Simulation ---
function Phase5Simulation() {
  const plumeData = [
    { year: 0, radius: 0, pressure: 245 },
    { year: 5, radius: 450, pressure: 260 },
    { year: 10, radius: 680, pressure: 272 },
    { year: 20, radius: 950, pressure: 278 },
    { year: 30, radius: 1150, pressure: 280 },
    { year: 50, radius: 1400, pressure: 275 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <BarChart2 className="text-emerald-500" size={32} />
          Phase 5: CO₂ Plume Simulation <span className="text-emerald-500/50">& Modeling</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card rounded-3xl p-6">
          <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-4">Plume Migration Radius (m)</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={plumeData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 10 }} /><YAxis stroke="#64748b" tick={{ fontSize: 10 }} /><Tooltip /><Area type="monotone" dataKey="radius" stroke="#10b981" fill="url(#greenGrad)" strokeWidth={2} /><defs><linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs></AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-4">Key Simulation Metrics</p>
          <MetricRow label="Injection Rate" value="1.5" unit="Mt/yr" />
          <MetricRow label="Reservoir Depth" value="2,500" unit="m TVDSS" />
          <MetricRow label="Formation Thickness" value="120" unit="m" />
          <MetricRow label="Avg Porosity" value="22" unit="%" />
          <MetricRow label="Permeability" value="250" unit="mD" />
          <MetricRow label="BHP @ Injector" value="298" unit="bar" status="warning" />
          <MetricRow label="Fracture Pressure" value="310" unit="bar" />
          <MetricRow label="CO₂ Dissolved (30yr)" value="18.5" unit="% of total" status="good" />
          <MetricRow label="Trapping Efficiency" value="85" unit="%" status="good" />
        </div>
      </div>
    </div>
  );
}

// --- Phase 6: MVA ---
function Phase6MVA() {
  const mvaTechs = [
    { name: '4D Seismic', cost: 500000, detection: 'Excellent', desc: 'Repeat 3D surveys detect ΔVp, ΔVs from CO₂ saturation changes' },
    { name: 'Downhole PT Gauges', cost: 50000, detection: 'Real-time', desc: 'Permanent fiber-optic pressure and temperature sensors in monitoring wells' },
    { name: 'Soil Gas Sampling', cost: 20000, detection: 'Surface leak', desc: 'Flux chambers and eddy covariance for near-surface leakage detection' },
    { name: 'Tracer Injection', cost: 100000, detection: 'Breakthrough', desc: 'Perfluorocarbon tracers in injection stream for plume tracking' },
    { name: 'InSAR Satellite', cost: 80000, detection: 'Surface deformation', desc: 'Millimeter-scale ground deformation from pressure changes' },
    { name: 'Water Chemistry', cost: 30000, detection: 'Dissolution', desc: 'pH, alkalinity, dissolved CO₂ monitoring in aquifer monitoring wells' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Radio className="text-emerald-500" size={32} />
          Phase 6: Monitoring, Verification & Accounting <span className="text-emerald-500/50">(MVA)</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mvaTechs.map((t, i) => (
          <motion.div key={t.name} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="glass-card p-4 rounded-2xl">
            <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">{t.name}</h5>
            <p className="text-[9px] text-slate-400 mb-3">{t.desc}</p>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">$ {t.cost.toLocaleString()}/yr</span>
              <span className="text-emerald-400 font-bold">{t.detection}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Phase 7: Utilization ---
function Phase7Utilization() {
  const usePaths = [
    { name: 'CO₂-EOR', maturity: 'Commercial', volume: 80, revenue: 25, desc: 'Enhanced oil recovery with CO₂ — generates revenue from incremental oil' },
    { name: 'Urea / Fertilizer', maturity: 'Commercial', volume: 130, revenue: 100, desc: 'CO₂ + NH₃ → urea for fertilizer — chemical feedstock use' },
    { name: 'Methanol Synthesis', maturity: 'Pilot', volume: 10, revenue: 200, desc: 'CO₂ + H₂ → methanol — e-fuel and chemical building block' },
    { name: 'Concrete Curing', maturity: 'Demo', volume: 5, revenue: 50, desc: 'CO₂ mineralization in concrete — permanent storage + strength gain' },
    { name: 'Algae / Biofuels', maturity: 'R&D', volume: 1, revenue: 80, desc: 'CO₂ bioconversion to lipids and biofuels — high value, low volume' },
    { name: 'Polycarbonates', maturity: 'Pilot', volume: 3, revenue: 400, desc: 'CO₂ copolymerization for durable plastics — high value market' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Recycle className="text-emerald-500" size={32} />
          Phase 7: CO₂ Utilization <span className="text-emerald-500/50">Pathways</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {usePaths.map((u, i) => (
          <motion.div key={u.name} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="glass-card p-5 rounded-2xl">
            <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">{u.name}</h5>
            <p className={cn('text-[9px] font-bold mb-3', u.maturity === 'Commercial' ? 'text-emerald-500' : u.maturity === 'Pilot' ? 'text-amber-400' : 'text-blue-400')}>{u.maturity}</p>
            <p className="text-[9px] text-slate-400 mb-4">{u.desc}</p>
            <MetricRow label="CO₂ Use Volume" value={`${u.volume}`} unit="Mt/yr" />
            <MetricRow label="Revenue Potential" value={`$${u.revenue}`} unit="/tonne CO₂" status={u.revenue > 100 ? 'good' : u.revenue > 50 ? 'warning' : 'bad'} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Phase 8: Risk Assessment ---
function Phase8Risk() {
  const risks = [
    { name: 'Leakage via Wells', severity: 9, likelihood: 3, mitigation: 'Proper well abandonment, cement bond logs, sustained casing pressure monitoring' },
    { name: 'Fault Reactivation', severity: 8, likelihood: 2, mitigation: 'Geomechanical modeling, injection below fracture pressure, microseismic monitoring' },
    { name: 'Caprock Failure', severity: 10, likelihood: 1, mitigation: 'Detailed caprock characterization, MICP threshold testing, fracture gradient analysis' },
    { name: 'Induced Seismicity', severity: 7, likelihood: 3, mitigation: 'Traffic light system, injection rate control, basement fault avoidance' },
    { name: 'Groundwater Contamination', severity: 9, likelihood: 2, mitigation: 'USDW protection, multiple barrier verification, groundwater monitoring network' },
    { name: 'Pipeline Rupture', severity: 6, likelihood: 4, mitigation: 'Corrosion inhibition, smart pigging, leak detection systems, ROW monitoring' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <ShieldAlert className="text-red-400" size={32} />
          Phase 8: Risk Assessment <span className="text-emerald-500/50">& Bowtie Analysis</span>
        </h2>
      </div>
      <div className="space-y-4">
        {risks.map((r, i) => {
          const riskScore = r.severity * r.likelihood;
          const riskColor = riskScore > 30 ? 'text-red-400' : riskScore > 15 ? 'text-amber-400' : 'text-emerald-400';
          return (
            <motion.div key={r.name} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="glass-card p-5 rounded-2xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h5 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">{r.name}</h5>
                  <p className="text-[9px] text-slate-400 mb-3">{r.mitigation}</p>
                  <div className="flex gap-4">
                    <div><span className="text-[8px] text-slate-500 block uppercase">Severity</span><span className="text-white font-mono font-bold text-sm">{r.severity}/10</span></div>
                    <div><span className="text-[8px] text-slate-500 block uppercase">Likelihood</span><span className="text-white font-mono font-bold text-sm">{r.likelihood}/10</span></div>
                    <div><span className="text-[8px] text-slate-500 block uppercase">Risk Score</span><span className={cn('font-mono font-bold text-sm', riskColor)}>{riskScore}</span></div>
                  </div>
                </div>
                <div className={cn('w-16 h-16 rounded-full flex items-center justify-center border-2', riskColor.replace('text', 'border'))}>
                  <span className={cn('text-xl font-black', riskColor)}>{riskScore}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// --- Phase 9: Regulatory ---
function Phase9Regulatory() {
  const frameworks = [
    { region: 'EU ETS / CCS Directive', requirement: 'ETS Directive 2003/87/EC + CCS Dir 2009/31/EC', permits: 'Storage permit (25yr+), Monitoring plan, Financial security', liability: 'Transfer to state after 20yr', status: 'Operational (Norway, NL, DK)' },
    { region: 'US EPA Class VI', requirement: 'SDWA Underground Injection Control', permits: 'Class VI well permit, MRV plan, PISC financial assurance', liability: 'Post-closure care 50yr', status: 'Primacy to ND, WY, LA' },
    { region: 'UK NSTA / OPRED', requirement: 'Energy Act 2008 + CCS Licensing', permits: 'Carbon storage license, Pipeline works auth, Decommissioning', liability: 'Transfer to NSTA after 20yr', status: 'Active (Endurance, Acorn, Viking)' },
    { region: 'ISO 27914 / 27916', requirement: 'International standards for CCS', permits: 'Voluntary framework, MRV guidelines', liability: 'Project-specific', status: 'Published 2017-2019' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Scale className="text-emerald-500" size={32} />
          Phase 9: Regulatory Frameworks <span className="text-emerald-500/50">& Permitting</span>
        </h2>
      </div>
      <div className="space-y-5">
        {frameworks.map((f, i) => (
          <motion.div key={f.region} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.15 }} className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Globe size={16} className="text-emerald-500" />
              <h5 className="text-[11px] font-black text-white uppercase tracking-widest">{f.region}</h5>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold ml-auto">{f.status}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px]">
              <div><span className="text-slate-500 block text-[9px] uppercase">Requirement</span><span className="text-white">{f.requirement}</span></div>
              <div><span className="text-slate-500 block text-[9px] uppercase">Permits Needed</span><span className="text-white">{f.permits}</span></div>
              <div><span className="text-slate-500 block text-[9px] uppercase">Liability Transfer</span><span className="text-white">{f.liability}</span></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Phase 10: Economics ---
function Phase10Economics() {
  const scenarios = [
    { name: 'Base Case (45Q)', price: 85, capex: 450, opex: 12, npv: 120, irr: 12.5 },
    { name: 'High Carbon Price', price: 150, capex: 450, opex: 12, npv: 380, irr: 22.0 },
    { name: 'Low Carbon Price', price: 45, capex: 450, opex: 12, npv: -80, irr: 2.0 },
    { name: 'EOR Revenue', price: 85, capex: 350, opex: 10, npv: 250, irr: 18.5 },
    { name: 'DAC + Storage', price: 200, capex: 800, opex: 45, npv: 50, irr: 8.0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <DollarSign className="text-emerald-500" size={32} />
          Phase 10: Economics <span className="text-emerald-500/50">& Project Financing</span>
        </h2>
      </div>
      <div className="glass-card rounded-3xl p-6">
        <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-4">LCOC Scenarios (10 Mt/yr, 20yr life)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-slate-500 uppercase tracking-widest border-b border-white/10">
                <th className="text-left py-2">Scenario</th>
                <th className="text-right py-2">Carbon Price ($/t)</th>
                <th className="text-right py-2">CAPEX ($M)</th>
                <th className="text-right py-2">OPEX ($M/yr)</th>
                <th className="text-right py-2">NPV ($M)</th>
                <th className="text-right py-2">IRR (%)</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s, i) => (
                <motion.tr key={s.name} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2 text-white font-bold">{s.name}</td>
                  <td className="py-2 text-right font-mono">{s.price}</td>
                  <td className="py-2 text-right font-mono">{s.capex}</td>
                  <td className="py-2 text-right font-mono">{s.opex}</td>
                  <td className={cn('py-2 text-right font-mono font-bold', s.npv > 0 ? 'text-emerald-400' : 'text-red-400')}>{s.npv}</td>
                  <td className={cn('py-2 text-right font-mono font-bold', s.irr > 10 ? 'text-emerald-400' : s.irr > 5 ? 'text-amber-400' : 'text-red-400')}>{s.irr}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Phase 11: Hubs ---
function Phase11Hubs() {
  const hubs = [
    { name: 'Northern Lights (Norway)', capacity: 5, stage: 'Operational', partners: 'Equinor, Shell, Total', desc: 'Open-access offshore storage in Utsira saline aquifer — Phase 2 expansion to 5 Mt/yr' },
    { name: 'Porthos (Netherlands)', capacity: 2.5, stage: 'Construction', partners: 'Port of Rotterdam, Gasunie, EBN', desc: 'Port industrial cluster feeding depleted offshore gas fields' },
    { name: 'Alberta Carbon Trunk Line', capacity: 14.6, stage: 'Operational', partners: 'Wolf Midstream, Enhance Energy', desc: '240 km pipeline connecting agri-industrial emitters to EOR fields' },
    { name: 'Houston Hub (USGC)', capacity: 100, stage: 'Feasibility', partners: 'ExxonMobil, Chevron, several', desc: 'Gulf Coast industrial corridor with offshore saline storage potential' },
    { name: 'Acorn (UK)', capacity: 5, stage: 'Advanced Dev', partners: 'Storegga, Shell, Harbour Energy', desc: 'Reuse of legacy gas infrastructure for North Sea storage' },
    { name: 'Strait of Canso (Canada)', capacity: 3, stage: 'FEED', partners: 'Nova Scotia Power, etc', desc: 'Atlantic Canada hub connecting power, refining, and offshore storage' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Building2 className="text-emerald-500" size={32} />
          Phase 11: CCUS Hubs <span className="text-emerald-500/50">& Cluster Infrastructure</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {hubs.map((h, i) => (
          <motion.div key={h.name} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={16} className="text-emerald-500" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">{h.name}</h5>
              <span className={cn('text-[8px] px-2 py-0.5 rounded-full font-bold ml-auto', h.stage === 'Operational' ? 'bg-emerald-500/20 text-emerald-400' : h.stage === 'Construction' || h.stage === 'Advanced Dev' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400')}>{h.stage}</span>
            </div>
            <p className="text-[9px] text-slate-400 mb-3">{h.desc}</p>
            <div className="flex gap-4 text-[9px]">
              <div><span className="text-slate-500 block">Capacity</span><span className="text-white font-mono font-bold">{h.capacity} Mt/yr</span></div>
              <div><span className="text-slate-500 block">Partners</span><span className="text-white">{h.partners}</span></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// --- Phase 12: Emerging ---
function Phase12Emerging() {
  const emerging = [
    { name: 'Direct Air Capture (DAC)', tech: 'Solid Sorbent / Liquid Solvent', cost: 250, potential: 'Unlimited', desc: 'Climeworks Orca (4kt/yr) → Mammoth (36kt/yr). DOE Carbon Negative Shot target $100/t by 2030' },
    { name: 'BECCS', tech: 'Biomass Power + CCS', cost: 100, potential: '10 Gt/yr', desc: 'Drax BECCS pilot — carbon-negative electricity. Land use and feedstock sustainability challenges' },
    { name: 'Mineral Carbonation', tech: 'Ex-situ / In-situ', cost: 150, potential: 'Large', desc: 'CarbFix project injects CO₂ into basalt → stable carbonates within 2 years' },
    { name: 'Biochar', tech: 'Pyrolysis', cost: 80, potential: '2-5 Gt/yr', desc: 'Carbon-negative soil amendment with co-benefits for agriculture' },
    { name: 'Ocean Alkalinity Enhancement', tech: 'Mineral dissolution', cost: 200, potential: 'Theoretical', desc: 'Adding alkaline minerals to seawater increases CO₂ uptake. Early R&D stage' },
    { name: 'Enhanced Weathering', tech: 'Silicate rock spreading', cost: 120, potential: '4 Gt/yr', desc: 'Crushed basalt on agricultural land accelerates natural carbonation' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Rocket className="text-emerald-500" size={32} />
          Phase 12: Emerging Technologies <span className="text-emerald-500/50">& Future Pathways</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {emerging.map((e, i) => (
          <motion.div key={e.name} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="glass-card p-5 rounded-2xl">
            <Rocket size={18} className="text-emerald-500 mb-2" />
            <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">{e.name}</h5>
            <p className="text-[9px] text-slate-500 mb-1">{e.tech}</p>
            <p className="text-[9px] text-slate-400 mb-4">{e.desc}</p>
            <div className="flex justify-between text-[9px]">
              <span className="text-slate-500">Cost: <span className="text-white font-mono font-bold">${e.cost}/t</span></span>
              <span className="text-slate-500">Potential: <span className="text-emerald-400 font-bold">{e.potential}</span></span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}