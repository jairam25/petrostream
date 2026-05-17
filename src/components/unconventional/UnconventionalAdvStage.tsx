import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Layers,
  Droplet,
  Compass,
  Thermometer,
  Zap,
  Microscope,
  Box,
  FastForward,
  TrendingDown,
  Wind,
  Activity,
  Database,
  Target,
  Search,
  HardHat
} from 'lucide-react';
import { cn } from '../../lib/utils';
import DataFlowIndicator from '../shared/DataFlowIndicator';
import SampleDataLoader from '../shared/SampleDataLoader';
import { getUnconventionalSample } from '../../lib/sampleData';
import { useUnconventional } from '../../store/hooks';

type UnconventionalAdvTab =
  | 'ph1' | 'ph2' | 'ph3' | 'ph4' | 'ph5' | 'ph6' | 'ph7';

export default function UnconventionalAdvStage() {
  const [activeTab, setActiveTab] = useState<UnconventionalAdvTab>('ph1');
  const { data, update } = useUnconventional();
  const tabs = [
    { id: 'ph1' as UnconventionalAdvTab, label: 'Ph.1: Shale O&G', icon: Flame },
    { id: 'ph2' as UnconventionalAdvTab, label: 'Ph.2: Tight O&G', icon: TrendingDown },
    { id: 'ph3' as UnconventionalAdvTab, label: 'Ph.3: CBM', icon: Wind },
    { id: 'ph4' as UnconventionalAdvTab, label: 'Ph.4: Gas Hydrates', icon: Thermometer },
    { id: 'ph5' as UnconventionalAdvTab, label: 'Ph.5: Heavy Oil', icon: Droplet },
    { id: 'ph6' as UnconventionalAdvTab, label: 'Ph.6: Basin Gas', icon: Box },
    { id: 'ph7' as UnconventionalAdvTab, label: 'Ph.7: Shale Tools', icon: Microscope },
  ];

  return (
    <div className="h-full flex flex-col">
      <DataFlowIndicator activeStage="UNCONVENTIONAL_ADV" />
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/20">
        <Flame className="text-amber-500" size={20} />
        <span className="text-white font-black italic text-lg tracking-tight mr-6 uppercase">Advanced Unconventional Resources</span>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === t.id
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            )}
          >
            <t.icon size={13} />{t.label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => {
            const content = `PETROSTREAM UNCONVENTIONAL RESOURCES REPORT\nGenerated: ${new Date().toLocaleString()}\nModule: Advanced Unconventional Ops\n\n1. SHALE: SRV Volumetrics (Stable)\n2. TIGHT O&G: Transient Flow Analysis\n3. CBM: Langmuir Desorption Isotherms\n4. HYDRATES: Phase Stability Mapping\n\nEnd of Summary.`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Unconventional_Engineering_Report.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center gap-2 shadow-lg shadow-white/10"
        >
          <FastForward size={14} />
          Generate Report
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'ph1' && <Phase1ShaleOG />}
            {activeTab === 'ph2' && <Phase2TightOG />}
            {activeTab === 'ph3' && <Phase3CBM />}
            {activeTab === 'ph4' && <Phase4GasHydrates />}
            {activeTab === 'ph5' && <Phase5HeavyOil />}
            {activeTab === 'ph6' && <Phase6BasinGas />}
            {activeTab === 'ph7' && <Phase7ShaleTools />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Phase Components ────────────────────────────────────────────────────────

function Phase1ShaleOG() {
  const srvData = [
    { time: 0, srv: 0, pressure: 8500 },
    { time: 10, srv: 250, pressure: 8200 },
    { time: 20, srv: 1200, pressure: 7800 },
    { time: 30, srv: 4500, pressure: 7200 },
    { time: 40, srv: 8900, pressure: 6500 },
    { time: 50, srv: 12500, pressure: 5800 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Flame className="text-amber-500" size={36} />
            Phase 1: Shale <span className="text-amber-500/50">Oil & Gas</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Source Rock Reservoir · Nanopermeability · SRV</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-amber-500 italic">12.5 <span className="text-sm text-slate-500">MMCF</span></p>
          <p className="text-[11px] text-slate-500 uppercase font-bold">Estimated SRV Volume</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
            <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
              <Activity size={16} className="text-amber-500" />
              SRV Growth vs. Frac Pressure Propagation
            </h3>
            <div className="h-[300px] flex items-center justify-center">
              <FracPropagator3D />
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card p-8 rounded-3xl bg-amber-500/5 border-amber-500/10 flex-1 flex flex-col justify-center text-center">
            <Database size={48} className="text-amber-500 mx-auto mb-4" />
            <h4 className="text-xs font-black text-white uppercase italic mb-2">Thermal Maturity</h4>
            <p className="text-4xl font-black text-white italic tracking-tighter mb-2">1.25 <span className="text-sm">VRo</span></p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Late Oil / Early Gas Window</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailCard title="Source Mechanics" items={["Organic-rich mudstones (Self-sourced)", "Kerogen types (I, II, III)", "Total Organic Carbon (TOC) levels", "Thermal Maturity (Ro, Tmax)"]} />
        <DetailCard title="Storage & Flow" items={["Organic porosity vs Intraparticle", "Adsorbed gas vs Free gas", "Nanodarcies to Microdarcies perm", "Stimulated Reservoir Volume (SRV)"]} />
        <DetailCard title="Development" items={["Manufacturing mode factory drilling", "Horizontal well + Multi-stage frac", "Sweet spot identification", "DCA & RTA decline challenges"]} />
      </div>
    </div>
  );
}

function Phase2TightOG() {
  const rtaData = [
    { sqrtTime: 1, rate: 2500 },
    { sqrtTime: 2, rate: 2200 },
    { sqrtTime: 4, rate: 1800 },
    { sqrtTime: 8, rate: 1400 },
    { sqrtTime: 12, rate: 1100 },
    { sqrtTime: 16, rate: 900 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <TrendingDown className="text-amber-500" size={36} />
            Phase 2: Tight <span className="text-amber-500/50">Oil & Gas</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Low Perm SS/Carb · Linear Flow · B-Factor</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-amber-500 italic">0.05 <span className="text-sm text-slate-500">mD</span></p>
          <p className="text-[11px] text-slate-500 uppercase font-bold">Matrix Permeability</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
            <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
              <Activity size={16} className="text-amber-500" />
              RTA Transient Flow Analysis (Rate vs. √Time)
            </h3>
            <div className="h-[300px] flex items-center justify-center">
              <TransientFlow3D />
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card p-8 rounded-3xl bg-amber-500/5 border-amber-500/10 flex-1 flex flex-col justify-center text-center">
            <Target size={48} className="text-amber-500 mx-auto mb-4" />
            <h4 className="text-xs font-black text-white uppercase italic mb-2">Linear Flow</h4>
            <p className="text-4xl font-black text-white italic tracking-tighter mb-2">940 <span className="text-sm">Days</span></p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              Transient Linear Flow Duration
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailCard title="Reservoir Type" items={["Low Perm Sandstone & Carbonate (<0.1 mD)", "Matrix vs Natural Fracture contribution", "Pervasive accumulations", "Discrete Fracture Network (DFN)"]} />
        <DetailCard title="Flow Dynamics" items={["Dominant linear flow regimes", "Long-term transient flow", "Rate Transient Analysis (RTA)", "Type curve matching"]} />
        <DetailCard title="Forecasting" items={["Decline curve challenges (b > 1)", "Stretched exponential models", "Duong's model for transient flow", "Drainage area estimation"]} />
      </div>
    </div>
  );
}

function Phase3CBM() {
  const langmuirData = [
    { pressure: 0, content: 0 },
    { pressure: 200, content: 80 },
    { pressure: 400, content: 150 },
    { pressure: 800, content: 240 },
    { pressure: 1200, content: 300 },
    { pressure: 2000, content: 360 },
    { pressure: 3000, content: 395 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Wind className="text-amber-500" size={36} />
            Phase 3: Coalbed <span className="text-amber-500/50">Methane (CBM)</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Adsorption · Dewatering · Langmuir Isotherm</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-amber-500 italic">420 <span className="text-sm text-slate-500">SCF/T</span></p>
          <p className="text-[11px] text-slate-500 uppercase font-bold">Max Gas Content (VL)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
            <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
              <Activity size={16} className="text-amber-500" />
              Langmuir Adsorption Isotherm Simulator
            </h3>
            <div className="h-[300px] flex items-center justify-center">
              <CoalMatrix3D />
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card p-8 rounded-3xl bg-amber-500/5 border-amber-500/10 flex-1 flex flex-col justify-center text-center">
            <Droplet size={48} className="text-amber-500 mx-auto mb-4" />
            <h4 className="text-xs font-black text-white uppercase italic mb-2">Dewatering</h4>
            <p className="text-4xl font-black text-white italic tracking-tighter mb-2">ACTIVE</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              Pressure below Desorption
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailCard title="Storage Physics" items={["Gas adsorption on coal matrix", "Langmuir Isotherm models", "Coal Rank (Maturity vs Gas)", "Cleat systems (Macro/Micro)"]} />
        <DetailCard title="Production Cycle" items={["Dewatering process (Initial stage)", "Pressure reduction below desorption", "Negative decline (Increasing rates)", "Critical desorption pressure"]} />
        <DetailCard title="Dynamics" items={["Matrix shrinkage & Perm enhancement", "Effective stress effects on cleats", "Fairway identification", "ECBM (CO2 injection)"]} />
      </div>
    </div>
  );
}

function Phase4GasHydrates() {
  const stabilityData = [
    { temp: 0, stable: 300, unstable: 100 },
    { temp: 5, stable: 600, unstable: 150 },
    { temp: 10, stable: 1100, unstable: 200 },
    { temp: 15, stable: 2200, unstable: 300 },
    { temp: 20, stable: 4500, unstable: 500 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Thermometer className="text-amber-500" size={36} />
            Phase 4: Gas <span className="text-amber-500/50">Hydrates</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Permafrost · Deep Marine · Depressurization</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-amber-500 italic">4,500 <span className="text-sm text-slate-500">TCF</span></p>
          <p className="text-[11px] text-slate-500 uppercase font-bold">Global Resource Est.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
            <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
              <Activity size={16} className="text-amber-500" />
              P-T Hydrate Stability Envelope (psi vs °C)
            </h3>
            <div className="h-[300px] flex items-center justify-center">
              <ClathrateCage3D />
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card p-8 rounded-3xl bg-blue-500/5 border-blue-500/10 flex-1 flex flex-col justify-center text-center">
            <Box size={48} className="text-blue-500 mx-auto mb-4" />
            <h4 className="text-xs font-black text-white uppercase italic mb-2">Clathrate Cage</h4>
            <p className="text-4xl font-black text-white italic tracking-tighter mb-2">SI/SII</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Crystal Structure Identified</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailCard title="Occurrence" items={["Permafrost accumulations (Arctic)", "Deep Marine sediments (BSR)", "Clathrate cage structure", "Massive resource scale (10x Conv)"]} />
        <DetailCard title="Recovery Methods" items={["Depressurization (Primary)", "Thermal Stimulation", "Chemical Inhibition", "CO2-CH4 Exchange"]} />
        <DetailCard title="Challenges" items={["Sand production management", "Wellbore & Seafloor stability", "Environmental & Methane release", "Heat transfer limitations"]} />
      </div>
    </div>
  );
}

function Phase5HeavyOil() {
  const steamData = [
    { year: 2020, steam: 120, oil: 45 },
    { year: 2021, steam: 150, oil: 62 },
    { year: 2022, steam: 180, oil: 85 },
    { year: 2023, steam: 210, oil: 110 },
    { year: 2024, steam: 240, oil: 145 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Droplet className="text-amber-500" size={36} />
            Phase 5: Heavy Oil <span className="text-amber-500/50">& Bitumen</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">SAGD · CHOPS · Oil Sands · Upgrading</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-amber-500 italic">2.8 <span className="text-sm text-slate-500">SOR</span></p>
          <p className="text-[11px] text-slate-500 uppercase font-bold">Steam-Oil Ratio Efficiency</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
            <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
              <Activity size={16} className="text-amber-500" />
              SAGD Performance: Steam Injection vs. Oil Recovery
            </h3>
            <div className="h-[300px] flex items-center justify-center">
              <SAGDSimulator3D />
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card p-8 rounded-3xl bg-amber-500/5 border-amber-500/10 flex-1 flex flex-col justify-center text-center">
            <Flame size={48} className="text-amber-500 mx-auto mb-4" />
            <h4 className="text-xs font-black text-white uppercase italic mb-2">Upgrading</h4>
            <p className="text-4xl font-black text-white italic tracking-tighter mb-2">92% <span className="text-sm">Yield</span></p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Synthetic Crude Conversion</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailCard title="Fluid Properties" items={["Heavy Oil (API < 22°)", "Bitumen (API < 10°)", "Viscosity > 1,000,000 cP", "Athabasca & Orinoco deposits"]} />
        <DetailCard title="Production" items={["SAGD (Steam Assisted Gravity Drainage)", "CSS (Cyclic Steam Stimulation)", "CHOPS (Cold Prod with Sand)", "Surface Mining & Extraction"]} />
        <DetailCard title="Midstream" items={["Diluent blending (Dilbit/Synbit)", "Condensate requirements", "Upgrading (Coking, Hydrocracking)", "Synthetic Crude (SCO) production"]} />
      </div>
    </div>
  );
}

function Phase6BasinGas() {
  const saturationData = [
    { depth: 8000, sat: 45 },
    { depth: 8500, sat: 52 },
    { depth: 9000, sat: 68 },
    { depth: 9500, sat: 85 },
    { depth: 10000, sat: 92 },
    { depth: 10500, sat: 95 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Box className="text-amber-500" size={36} />
            Phase 6: Basin-Centered <span className="text-amber-500/50">Gas</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Continuous Accumulation · Abnormal Pressure · Sweet Spots</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-amber-500 italic">0.85 <span className="text-sm text-slate-500">Psi/ft</span></p>
          <p className="text-[11px] text-slate-500 uppercase font-bold">Pore Pressure Gradient</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
            <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
              <Activity size={16} className="text-amber-500" />
              Gas Saturation Profile (Depth vs. Sg %)
            </h3>
            <div className="h-[300px] flex items-center justify-center">
              <BasinTrapping3D />
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card p-8 rounded-3xl bg-amber-500/5 border-amber-500/10 flex-1 flex flex-col justify-center text-center">
            <Search size={48} className="text-amber-500 mx-auto mb-4" />
            <h4 className="text-xs font-black text-white uppercase italic mb-2">Exploration</h4>
            <p className="text-4xl font-black text-white italic tracking-tighter mb-2">REGIONAL</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Continuous Trapping ID</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailCard title="Characteristics" items={["Continuous gas accumulations", "No conventional water contacts", "Pervasive gas saturation", "Abnormal pressure (Over/Under)"]} />
        <DetailCard title="Exploration" items={["Regional low-permeability plays", "Sweet spot identification", "Pressure-driven trapping", "Petroleum system timing"]} />
        <DetailCard title="Evaluation" items={["Resource density mapping", "Saturation calculation challenges", "Effective porosity determination", "Fracture intensity analysis"]} />
      </div>
    </div>
  );
}

function Phase7ShaleTools() {
  const nmrData = [
    { t2: 0.1, volume: 15 },
    { t2: 0.5, volume: 45 },
    { t2: 1.0, volume: 120 },
    { t2: 5.0, volume: 300 },
    { t2: 10.0, volume: 80 },
    { t2: 50.0, volume: 20 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Microscope className="text-amber-500" size={36} />
            Phase 7: Shale <span className="text-amber-500/50">Characterization</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">FIB-SEM · Rock-Eval · MICP · Nano-Indentation</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-amber-500 italic">2 <span className="text-sm text-slate-500">nm</span></p>
          <p className="text-[11px] text-slate-500 uppercase font-bold">SEM Scanning Resolution</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
            <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
              <Activity size={16} className="text-amber-500" />
              Pore Size Distribution (NMR T2 Relaxation)
            </h3>
            <div className="h-[300px] flex items-center justify-center">
              <NanoPore3D />
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card p-8 rounded-3xl bg-amber-500/5 border-amber-500/10 flex-1 flex flex-col justify-center text-center">
            <HardHat size={48} className="text-amber-500 mx-auto mb-4" />
            <h4 className="text-xs font-black text-white uppercase italic mb-2">Nano-Mechanics</h4>
            <p className="text-4xl font-black text-white italic tracking-tighter mb-2">42 <span className="text-sm">GPa</span></p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Average Young's Modulus</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailCard title="Imaging" items={["FESEM / FIB-SEM nanoscale imaging", "Digital Rock Physics (DRP)", "XRD Mineralogy analysis", "CT Scanning for fracture ID"]} />
        <DetailCard title="Chemistry" items={["Rock-Eval Pyrolysis (S1, S2, Tmax)", "FTIR Mineral Identification", "TOC measurement", "Maturity analysis"]} />
        <DetailCard title="Petrophysics" items={["MICP (Mercury Capillary Pressure)", "NMR Pore Size Distribution", "Nano-indentation (Mechanics)", "Adsorption Isotherm testing"]} />
      </div>
    </div>
  );
}

// ─── Shared Components ──────────────────────────────────────────────────────

// ─── 3D Visualizer Components ──────────────────────────────────────────────

function FracPropagator3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Isometric Shale Block */}
        <path d="M 100 200 L 250 120 L 400 200 L 250 280 Z" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.4" />
        <path d="M 100 200 L 100 150 L 250 70 L 400 150 L 400 200" fill="none" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.3" />

        {/* Horizontal Wellbore */}
        <line x1="150" y1="230" x2="350" y2="120" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />

        {/* Animated Fractures */}
        {[0, 1, 2, 3].map(i => (
          <motion.g key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.5, duration: 1 }}>
            <motion.path
              d={`M ${200 + i * 40} ${210 - i * 20} Q ${220 + i * 40} ${150 - i * 20} ${180 + i * 40} ${120 - i * 20}`}
              fill="none" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.8"
              animate={{ strokeDashoffset: [0, -10] }} transition={{ repeat: Infinity, duration: 1 }}
            />
            {/* SRV Glow */}
            <motion.circle
              cx={200 + i * 40} cy={210 - i * 20} r="20" fill="#f59e0b" fillOpacity="0.15"
              animate={{ r: [20, 30, 20] }} transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.g>
        ))}
        <text x="250" y="290" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Multi-Stage Frac Propagation Sim</text>
      </svg>
    </div>
  );
}

function TransientFlow3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Matrix flow streamlines */}
        {[...Array(6)].map((_, i) => (
          <motion.path
            key={i} d={`M ${50 + i * 80} 50 L 250 150`}
            fill="none" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.6"
            animate={{ pathLength: [0, 1], opacity: [0.2, 1, 0.2] }}
            transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
          />
        ))}
        {/* Central Fracture */}
        <line x1="250" y1="50" x2="250" y2="250" stroke="#f59e0b" strokeWidth="3" />
        <text x="250" y="280" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Linear Flow Kinetic Mapping</text>
      </svg>
    </div>
  );
}

function CoalMatrix3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Coal Cleats Grid */}
        {[...Array(8)].map((_, i) => (
          <g key={i}>
            <line x1={50 + i * 50} y1="50" x2={50 + i * 50} y2="250" stroke="#94a3b8" strokeWidth="1" strokeOpacity="0.4" />
            <line x1="50" y1={50 + i * 30} x2="450" y2={50 + i * 30} stroke="#94a3b8" strokeWidth="1" strokeOpacity="0.4" />
          </g>
        ))}
        {/* Desorbing Gas Bubbles */}
        {[...Array(12)].map((_, i) => (
          <motion.circle
            key={i} r="3" fill="#f59e0b"
            initial={{ cx: 100 + Math.random() * 300, cy: 100 + Math.random() * 150, opacity: 0 }}
            animate={{ cy: [null, -20], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: Math.random() * 2 }}
          />
        ))}
        <text x="250" y="280" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Langmuir Desorption Kinetic Simulator</text>
      </svg>
    </div>
  );
}

function ClathrateCage3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        <motion.g animate={{ rotateY: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} style={{ originX: '250px', originY: '150px' }}>
          {/* Hexagonal Cage Nodes */}
          {[0, 60, 120, 180, 240, 300].map(angle => {
            const rad = (angle * Math.PI) / 180;
            const x = 250 + Math.cos(rad) * 60;
            const y = 150 + Math.sin(rad) * 60;
            return (
              <g key={angle}>
                <circle cx={x} cy={y} r="6" fill="#3b82f6" />
                <line x1="250" y1="150" x2={x} y2={y} stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.6" />
              </g>
            );
          })}
          {/* Methane Molecule Center */}
          <motion.circle
            cx="250" cy="150" r="12" fill="#f59e0b"
            animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}
          />
        </motion.g>
        <text x="250" y="260" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Clathrate Cage Molecular Geometry</text>
      </svg>
    </div>
  );
}

function SAGDSimulator3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Steam Injector (Top) */}
        <line x1="100" y1="120" x2="400" y2="120" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
        {/* Oil Producer (Bottom) */}
        <line x1="100" y1="180" x2="400" y2="180" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />

        {/* Growing Steam Chamber */}
        <motion.path
          d="M 150 120 Q 250 50 350 120 Q 250 150 150 120"
          fill="#3b82f6" fillOpacity="0.4" stroke="#3b82f6" strokeWidth="1.5"
          animate={{ d: ["M 150 120 Q 250 110 350 120 Q 250 130 150 120", "M 150 120 Q 250 20 350 120 Q 250 150 150 120"] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        />
        {/* Oil Droplets */}
        {[0, 1, 2].map(i => (
          <motion.circle
            key={i} r="4" fill="#f59e0b" fillOpacity="0.9"
            animate={{ y: [130, 175], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: i * 1 }}
            cx={200 + i * 50}
          />
        ))}
        <text x="250" y="250" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">SAGD Steam Chamber Dynamics</text>
      </svg>
    </div>
  );
}

function BasinTrapping3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Basin layers */}
        <path d="M 50 200 Q 250 280 450 200 L 450 100 Q 250 180 50 100 Z" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.5" />
        {/* Continuous Gas Zone */}
        <motion.path
          d="M 100 180 Q 250 240 400 180" fill="none" stroke="#f59e0b" strokeWidth="10" strokeOpacity="0.6"
          animate={{ strokeOpacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 4 }}
        />
        <text x="250" y="50" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Basin-Centered Continuous Trapping</text>
      </svg>
    </div>
  );
}

function NanoPore3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Nano-pore network */}
        <path d="M 100 150 Q 150 50 200 150 Q 250 250 300 150 Q 350 50 400 150" fill="none" stroke="#f59e0b" strokeWidth="20" strokeOpacity="0.3" strokeLinecap="round" />
        {/* Molecular flow */}
        {[0, 1, 2, 3].map(i => (
          <motion.circle
            key={i} r="4" fill="#f59e0b" fillOpacity="1"
            animate={{ cx: [100, 400], cy: [150, 50, 150, 250, 150] }}
            transition={{ repeat: Infinity, duration: 4, delay: i * 1, ease: "linear" }}
          />
        ))}
        <text x="250" y="280" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">FIB-SEM Nanoscale Pore Network</text>
      </svg>
    </div>
  );
}

function DetailCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass-card p-6 rounded-3xl border-white/5 bg-amber-500/5 hover:border-amber-500/30 transition-all">
      <h5 className="text-[11px] font-black uppercase tracking-widest text-amber-500 mb-4">{title}</h5>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <div className="mt-1.5 w-1 h-1 rounded-full bg-amber-500 shrink-0" />
            <span className="text-[11px] text-slate-300 leading-relaxed font-medium">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
