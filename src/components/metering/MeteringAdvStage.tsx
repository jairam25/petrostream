import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ruler, 
  Droplets, 
  Wind, 
  Layers, 
  Activity, 
  Database, 
  Zap,
  Box,
  LayoutDashboard,
  ShieldCheck,
  FastForward,
  Thermometer,
  Calculator,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Gauge,
  Info,
  CheckCircle2,
  AlertTriangle,
  Waves,
  Percent,
  X,
  History,
  FileText,
  Loader2,
  Settings,
  Shield
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';

type MeteringTab = 
  | 'ph1' | 'ph2' | 'ph3' | 'ph4' | 'ph5' | 'ph6';

export default function MeteringAdvStage() {
  const [activeTab, setActiveTab] = useState<MeteringTab>('ph1');
  const tabs = [
    { id: 'ph1' as MeteringTab, label: 'Ph.1: Principles', icon: Ruler },
    { id: 'ph2' as MeteringTab, label: 'Ph.2: Oil Metering', icon: Droplets },
    { id: 'ph3' as MeteringTab, label: 'Ph.3: Gas Metering', icon: Wind },
    { id: 'ph4' as MeteringTab, label: 'Ph.4: Multiphase', icon: Layers },
    { id: 'ph5' as MeteringTab, label: 'Ph.5: Allocation', icon: Activity },
    { id: 'ph6' as MeteringTab, label: 'Ph.6: Fiscal/Custody', icon: Database },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/20">
        <Ruler className="text-amber-500" size={20} />
        <span className="text-white font-black italic text-lg tracking-tight mr-6 uppercase">Metering, Allocation & Fiscal Measurement</span>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === t.id
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            )}
          >
            <t.icon size={13} />{t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'ph1' && <Phase1Principles />}
            {activeTab === 'ph2' && <Phase2Oil />}
            {activeTab === 'ph3' && <Phase3Gas />}
            {activeTab === 'ph4' && <Phase4Multiphase />}
            {activeTab === 'ph5' && <Phase5Allocation />}
            {activeTab === 'ph6' && <Phase6Fiscal />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Phase Components ────────────────────────────────────────────────────────

function Phase1Principles() {
  const [activeLogic, setActiveLogic] = useState('dp');
  const [turndown, setTurndown] = useState(4);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Ruler className="text-amber-500" size={36} />
             Phase 1: Flow Measurement <span className="text-amber-500/50">Principles</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Accuracy · Rangeability · Turndown · Uncertainty</p>
        </div>
        <div className="flex gap-2">
           {['dp', 'velocity', 'mass'].map(id => (
             <button 
               key={id} 
               onClick={() => setActiveLogic(id)}
               className={cn(
                 "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                 activeLogic === id ? "border-amber-500 bg-amber-500/10 text-white" : "border-white/5 text-slate-500"
               )}
             >
               {id}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <MeasurementPrinciple3D activeLogic={activeLogic} turndown={turndown} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Flow Physics Simulator</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Differential Pressure & Velocity Profiling</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 space-y-8">
               <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Rangeability Control</h4>
               <InputWithSlider label="Turndown Ratio" value={turndown} min={1} max={50} step={1} unit=":1" onChange={setTurndown} />
            </div>
            <div className="glass-card p-8 rounded-3xl bg-amber-500/5 border-amber-500/10 flex-1 flex flex-col justify-center text-center">
               <Gauge size={48} className="text-amber-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Uncertainty Target</h4>
               <p className="text-5xl font-black text-white italic tracking-tighter mb-4">±{ (1.5 / (turndown/4)).toFixed(2) }%</p>
               <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Predicted Confidence</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase2Oil() {
  const [pressure, setPressure] = useState(350);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Droplets className="text-amber-500" size={36} />
             Phase 2: Oil <span className="text-amber-500/50">Metering & Custody</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">LACT Units · Proving · API MPMS · Meter Factor</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-emerald-400 italic">0.9998</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Meter Factor (K)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <OilMeteringProver3D pressure={pressure} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">LACT Unit / Prover Simulator</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">API 11.1 Temperature & Pressure Correction</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 space-y-8">
               <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Proving Loop Status</h4>
               <InputWithSlider label="Line Pressure" value={pressure} min={100} max={1000} step={10} unit="psi" onChange={setPressure} />
            </div>
            <div className="glass-card p-8 rounded-3xl bg-amber-500/5 border-amber-500/10 flex-1 flex flex-col justify-center text-center">
               <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">BS&W Analysis</h4>
               <p className="text-4xl font-black text-emerald-400 italic tracking-tighter mb-2">0.02%</p>
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Compliant Volume</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase3Gas() {
  const [methane, setMethane] = useState(84.2);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Wind className="text-amber-500" size={36} />
             Phase 3: Gas <span className="text-amber-500/50">Metering & Analysis</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">AGA 3/7/8 · Ultrasonic · GC · Heating Value</p>
        </div>
        <div className="flex items-center gap-4 px-6 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
           <Zap size={14} className="text-amber-500" />
           <span className="text-[10px] font-black text-white uppercase tracking-widest">HV: 1,042 BTU/SCF</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <GasAnalysis3D methane={methane} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Gas Compositional Engine</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Real-time AGA-8 Supercompressibility Logic</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 space-y-8">
               <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Composition Control</h4>
               <InputWithSlider label="Methane (C1)" value={methane} min={60} max={100} step={0.1} unit="%" onChange={setMethane} />
            </div>
            <div className="glass-card p-8 rounded-3xl bg-amber-500/5 border-amber-500/10 flex-1 flex flex-col justify-center text-center">
               <Calculator size={32} className="text-amber-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Z-Factor</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">{(0.85 + (100-methane)/1000).toFixed(4)}</p>
               <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">NIST Traceable Calculation</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase4Multiphase() {
  const [waterCut, setWaterCut] = useState(34);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Layers className="text-amber-500" size={36} />
             Phase 4: Multiphase <span className="text-amber-500/50">Measurement</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">MPFM · Wet Gas · Gamma Ray · Subsea</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-amber-500 italic">82% GVF</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Gas Void Fraction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <MultiphaseFlow3D waterCut={waterCut} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">MPFM Flow Stream Simulator</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Gamma-Ray Attenuation & Impedance Tracking</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 space-y-8">
               <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Fluid Phase Control</h4>
               <InputWithSlider label="Water Cut (WLR)" value={waterCut} min={0} max={100} step={1} unit="%" onChange={setWaterCut} />
            </div>
            <div className="glass-card p-8 rounded-3xl bg-blue-500/5 border-blue-500/10 flex-1 flex flex-col justify-center text-center">
               <Waves size={32} className="text-blue-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Impedance Cal</h4>
               <p className="text-4xl font-black text-blue-400 italic tracking-tighter mb-2">{waterCut}%</p>
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active Dual-Energy Correction</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase5Allocation() {
  const [errorMargin, setErrorMargin] = useState(1.2);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Activity className="text-amber-500" size={36} />
             Phase 5: Production <span className="text-amber-500/50">Allocation</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Back-Allocation · Factors · Commingled Flow</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-amber-500 italic">0.952</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Field Allocation Factor</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <AllocationReconciler3D errorMargin={errorMargin} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Global Mass Balance Engine</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Back-Allocation Reconciliation across 14 Export Points</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 space-y-8">
               <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Audit Sensitivity</h4>
               <InputWithSlider label="Error Margin" value={errorMargin} min={0.1} max={5} step={0.1} unit="%" onChange={setErrorMargin} />
            </div>
            <div className="glass-card p-8 rounded-3xl bg-amber-500/5 border-amber-500/10 flex-1 flex flex-col justify-center text-center">
               <Shield size={32} className="text-emerald-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">SOX Compliance</h4>
               <p className="text-3xl font-black text-emerald-400 italic tracking-tighter mb-4">VERIFIED</p>
               <button className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-amber-500">Generate Audit Trail</button>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase6Fiscal() {
  const [exportVolume, setExportVolume] = useState(12.4);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Database className="text-amber-500" size={36} />
             Phase 6: Fiscal <span className="text-amber-500/50">& Custody Transfer</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Uncertainty · Regulation · Export · LNG</p>
        </div>
        <div className="px-6 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
           <span className="text-[10px] font-black text-white uppercase tracking-widest">NIST Traceability: ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <FiscalMeasurement3D volume={exportVolume} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Export Velocity Simulator</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Regulatory Compliance & Volume Reconciliation</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 space-y-8">
               <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Target Volume</h4>
               <InputWithSlider label="MTD Export" value={exportVolume} min={1} max={50} step={0.5} unit="MMBBL" onChange={setExportVolume} />
            </div>
            <div className="glass-card p-8 rounded-3xl bg-amber-500/5 border-amber-500/10 flex-1 flex flex-col justify-center text-center">
               <TrendingUp size={32} className="text-amber-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Reconciled Value</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-4">${(exportVolume * 78.4).toFixed(1)}M</p>
               <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Settlement Guaranteed</p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── 3D Kinetic Simulators ─────────────────────────────────────────────────

function MeasurementPrinciple3D({ activeLogic, turndown }: { activeLogic: string; turndown: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(100, 200)">
          {/* Pipe Section */}
          <rect x="0" y="-30" width="300" height="60" fill="none" stroke="#ffffff10" strokeWidth="2" />
          
          {/* Flow Particles */}
          {[...Array(20)].map((_, i) => (
             <motion.circle 
                key={i} r="2" fill="#f59e0b"
                initial={{ cx: 0, cy: Math.random()*50 - 25 }}
                animate={{ cx: 300 }}
                transition={{ 
                   repeat: Infinity, 
                   duration: (2 + Math.random()) / (turndown/10), 
                   delay: i*0.2,
                   ease: "linear"
                }}
             />
          ))}

          {/* Differential Pressure Visualization */}
          {activeLogic === 'dp' && (
             <g transform="translate(150, 0)">
                <path d="M -20 -30 L 0 -10 L 20 -30" fill="none" stroke="#f59e0b" strokeWidth="3" />
                <motion.path 
                   d="M -150 40 Q 0 80 150 40" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5"
                   animate={{ opacity: [0.2, 0.6, 0.2] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                />
                <text x="0" y="60" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-bold">ΔP VENTURI EFFECT</text>
             </g>
          )}

          {/* Velocity Profile */}
          {activeLogic === 'velocity' && (
             <g transform="translate(150, 0)">
                {[...Array(5)].map((_, i) => (
                   <motion.line 
                      key={i} x1="-20" y1={-20 + i*10} x2="20" y2={-20 + i*10} 
                      stroke="#06b6d4" strokeWidth="2"
                      animate={{ x: [-20, 20, -20] }}
                      transition={{ repeat: Infinity, duration: 2, delay: i*0.2 }}
                   />
                ))}
                <text x="0" y="60" fill="#06b6d4" fontSize="10" textAnchor="middle" className="font-bold">ULTRASONIC TRANSIT TIME</text>
             </g>
          )}

          {/* Mass / Coriolis */}
          {activeLogic === 'mass' && (
             <g transform="translate(150, 0)">
                <motion.path 
                   d="M -50 0 Q 0 -60 50 0 Q 0 60 -50 0" fill="none" stroke="#f59e0b" strokeWidth="4"
                   animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
                   transition={{ repeat: Infinity, duration: 0.5 }}
                />
                <text x="0" y="80" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-bold">CORIOLIS PHASE SHIFT</text>
             </g>
          )}
       </g>
       <text x="250" y="380" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Kinetic Flow Measurement Principles Simulator</text>
    </svg>
  );
}

function OilMeteringProver3D({ pressure }: { pressure: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(250, 200)">
          {/* Prover Loop */}
          <circle r="120" fill="none" stroke="#ffffff05" strokeWidth="20" />
          <motion.circle 
             r="120" fill="none" stroke="#f59e0b" strokeWidth="1"
             strokeDasharray="753" strokeDashoffset="0"
          />

          {/* Displacement Sphere */}
          <motion.circle 
             r="10" fill="#f59e0b"
             animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
             }}
             transition={{ 
                rotate: { repeat: Infinity, duration: 1000/pressure, ease: "linear" },
                scale: { repeat: Infinity, duration: 1 }
             }}
             cx="120" cy="0"
          />

          {/* Detector Switches */}
          <circle cx="120" cy="0" r="4" fill="#ffffff" />
          <circle cx="-120" cy="0" r="4" fill="#ffffff" />
          
          {/* Pressure Waves */}
          <circle r={40 + pressure/20} fill="none" stroke="#f59e0b10" strokeWidth="1" />
       </g>
       <text x="250" y="380" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">API 11.1 Prover Displacement & Correction Simulator</text>
    </svg>
  );
}

function GasAnalysis3D({ methane }: { methane: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(250, 200)">
          {/* Central Gas Molecule */}
          <motion.circle r="40" fill="#f59e0b10" stroke="#f59e0b" strokeWidth="2" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4 }} />
          
          {/* Component Orbitals */}
          {[...Array(6)].map((_, i) => {
             const angle = (i / 6) * Math.PI * 2;
             const r = 80 + Math.random() * 40;
             return (
                <motion.g key={i} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10 + i*2, ease: "linear" }}>
                   <circle cx={r} cy="0" r={i === 0 ? 8 : 4} fill={i === 0 ? "#f59e0b" : "#475569"} />
                   <text x={r + 10} y="5" fill="#ffffff20" fontSize="8" className="font-black uppercase">{i === 0 ? 'C1' : 'C2+'}</text>
                </motion.g>
             );
          })}

          {/* Supercompressibility Lines */}
          {[...Array(Math.floor(methane/10))].map((_, i) => (
             <motion.line 
                key={i} x1="0" y1="0" 
                x2={Math.cos(i) * 150} y2={Math.sin(i) * 150} 
                stroke="#f59e0b10" strokeWidth="1" 
             />
          ))}
       </g>
       <text x="250" y="380" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">AGA-8 Chromatograph & Supercompressibility Engine</text>
    </svg>
  );
}

function MultiphaseFlow3D({ waterCut }: { waterCut: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(100, 200)">
          {/* Pipe */}
          <rect x="0" y="-40" width="300" height="80" rx="10" fill="none" stroke="#ffffff10" strokeWidth="2" />
          
          {/* Fluid Phases */}
          <motion.rect 
            x="0" y={40 - (waterCut/100 * 80)} width="300" height={waterCut/100 * 80} 
            fill="#3b82f630" stroke="#3b82f650" strokeWidth="1"
          />
          <motion.rect 
            x="0" y="-40" width="300" height={80 - (waterCut/100 * 80)} 
            fill="#f59e0b30" stroke="#f59e0b50" strokeWidth="1"
          />

          {/* Bubbles / Droplets */}
          {[...Array(30)].map((_, i) => (
             <motion.circle 
                key={i} r={Math.random() * 4} 
                fill={i % 2 === 0 ? "#3b82f6" : "#f59e0b"}
                initial={{ cx: 0, cy: Math.random() * 80 - 40 }}
                animate={{ cx: 300 }}
                transition={{ repeat: Infinity, duration: 1.5 + Math.random(), delay: i*0.1 }}
             />
          ))}

          {/* Gamma Ray Source */}
          <g transform="translate(150, -60)">
             <circle r="10" fill="#ef4444" />
             <motion.line 
                x1="0" y1="10" x2="0" y2="100" 
                stroke="#ef4444" strokeWidth="2" strokeDasharray="4,4"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
             />
             <text x="15" y="0" fill="#ef4444" fontSize="8" className="font-black uppercase">Cs-137 SOURCE</text>
          </g>
       </g>
       <text x="250" y="380" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Gamma-Ray Attenuation Multiphase Flow Simulator</text>
    </svg>
  );
}

function AllocationReconciler3D({ errorMargin }: { errorMargin: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(250, 200)">
          {/* Reconciliation Matrix */}
          {[...Array(12)].map((_, i) => (
             <motion.rect 
                key={i} 
                x={-150 + (i%4)*80} y={-100 + Math.floor(i/4)*80} 
                width="60" height="60" rx="8"
                fill="none" stroke="#f59e0b20" strokeWidth="1"
                animate={{ 
                   strokeOpacity: [0.1, 0.5, 0.1],
                   strokeWidth: [1, 2, 1]
                }}
                transition={{ repeat: Infinity, duration: 2, delay: i*0.2 }}
             />
          ))}

          {/* Sync Pulses */}
          {[...Array(8)].map((_, i) => (
             <motion.circle 
                key={i} r="2" fill="#10b981"
                initial={{ cx: 0, cy: 0 }}
                animate={{ 
                   cx: Math.cos(i) * 200,
                   cy: Math.sin(i) * 200,
                   opacity: [0, 1, 0]
                }}
                transition={{ repeat: Infinity, duration: 3, delay: i*0.4 }}
             />
          ))}

          {/* Central Balancer */}
          <motion.circle r="30" fill="#1e293b" stroke="#10b981" strokeWidth="2" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} />
          <Shield size={20} className="text-emerald-500 absolute translate-x-[-10px] translate-y-[-10px]" />
       </g>
       <text x="250" y="380" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Production Back-Allocation Mass Balance Reconciliation</text>
    </svg>
  );
}

function FiscalMeasurement3D({ volume }: { volume: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(250, 200)">
          {/* Export Pipeline Visual */}
          <path d="M -200 0 L 200 0" stroke="#ffffff10" strokeWidth="40" strokeLinecap="round" />
          <motion.path 
             d="M -200 0 L 200 0" 
             stroke="#f59e0b" strokeWidth={2}
             strokeDasharray="10,20"
             animate={{ strokeDashoffset: -300 }}
             transition={{ repeat: Infinity, duration: 50/volume, ease: "linear" }}
          />

          {/* Regulatory Stamp */}
          <g transform="translate(0, -80)">
             <motion.circle 
               r="30" fill="none" stroke="#f59e0b" strokeWidth="1"
               animate={{ opacity: [0.2, 0.6, 0.2] }}
               transition={{ repeat: Infinity, duration: 2 }}
             />
             <text x="0" y="5" fill="#f59e0b" fontSize="8" textAnchor="middle" className="font-black uppercase">FISCAL APPROVED</text>
          </g>

          {/* Volume Pulses */}
          {[...Array(5)].map((_, i) => (
             <motion.circle 
                key={i} r="4" fill="#f59e0b"
                initial={{ cx: -180 }}
                animate={{ cx: 180, opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: i*0.4 }}
             />
          ))}
       </g>
       <text x="250" y="380" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">NIST Traceable Custody Transfer Volume Simulator</text>
    </svg>
  );
}
