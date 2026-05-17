import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Droplets, 
  Thermometer, 
  Activity, 
  Settings, 
  ShieldCheck, 
  Layers, 
  FastForward,
  Pipette,
  Zap,
  Box,
  LayoutDashboard,
  Search,
  Database,
  TrendingUp,
  Info,
  Waves,
  Cpu
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { InputWithSlider, SectionHeader } from '../SharedUI';

type CorrosionTab = 
  | 'ph1' | 'ph2' | 'ph3' | 'ph4' | 'ph5' | 'ph6' | 'ph7';

export default function CorrosionAdvStage() {
  const [activeTab, setActiveTab] = useState<CorrosionTab>('ph1');
  const tabs = [
    { id: 'ph1' as CorrosionTab, label: 'Ph.1: Mechanisms', icon: ShieldAlert },
    { id: 'ph2' as CorrosionTab, label: 'Ph.2: CO2 Corrosion', icon: Droplets },
    { id: 'ph3' as CorrosionTab, label: 'Ph.3: H2S/Sour', icon: Zap },
    { id: 'ph4' as CorrosionTab, label: 'Ph.4: Materials', icon: Layers },
    { id: 'ph5' as CorrosionTab, label: 'Ph.5: Prevention', icon: ShieldCheck },
    { id: 'ph6' as CorrosionTab, label: 'Ph.6: Monitoring', icon: Activity },
    { id: 'ph7' as CorrosionTab, label: 'Ph.7: Integrity', icon: Database },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/20">
        <ShieldAlert className="text-red-500" size={20} />
        <span className="text-white font-black italic text-lg tracking-tight mr-6 uppercase">Corrosion & Materials Terminal</span>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === t.id
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
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
            {activeTab === 'ph1' && <Phase1Mechanisms />}
            {activeTab === 'ph2' && <Phase2CO2 />}
            {activeTab === 'ph3' && <Phase3H2S />}
            {activeTab === 'ph4' && <Phase4Materials />}
            {activeTab === 'ph5' && <Phase5Prevention />}
            {activeTab === 'ph6' && <Phase6Monitoring />}
            {activeTab === 'ph7' && <Phase7Integrity />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Phase 1: Corrosion Mechanisms ──────────────────────────────────────────

function Phase1Mechanisms() {
  const [selectedMech, setSelectedMech] = useState('General');
  const mechData = [
    { name: 'General', val: 45, color: '#ef4444', desc: 'Uniform surface loss across the entire exposed area. Most predictable form of corrosion.' },
    { name: 'Pitting', val: 25, color: '#f97316', desc: 'Localized, extremely high penetration rate. Hard to detect and often leads to rapid failure.' },
    { name: 'Galvanic', val: 15, color: '#facc15', desc: 'Accelerated corrosion of one metal when in electrical contact with a more noble metal.' },
    { name: 'Cracking', val: 15, color: '#991b1b', desc: 'Branching fractures (SCC/SSC) caused by tensile stress and a corrosive environment.' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <ShieldAlert className="text-red-500" size={36} />
             Phase 1: Corrosion <span className="text-red-500/50">Mechanisms</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Pitting · Galvanic · Erosion · Environmental Cracking</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-red-500 italic">CRITICAL</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Overall System Severity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] relative overflow-hidden">
               <div className="flex justify-between items-center mb-8 relative z-10">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic flex items-center gap-2">
                     <LayoutDashboard size={16} className="text-red-500" />
                     Mechanism Simulation
                  </h3>
                  <div className="flex gap-2">
                    {mechData.map(m => (
                      <button 
                        key={m.name} 
                        onClick={() => setSelectedMech(m.name)}
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                          selectedMech === m.name ? "bg-red-500 border-red-500 text-white" : "border-white/10 text-slate-500"
                        )}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
               </div>
               
               <div className="h-[280px] flex items-center justify-center">
                  <CorrosionMechanismVisualizer type={selectedMech} />
               </div>

               <div className="absolute bottom-10 left-10 right-10">
                  <p className="text-[10px] text-slate-400 font-medium italic text-center max-w-md mx-auto">
                    {mechData.find(m => m.name === selectedMech)?.desc}
                  </p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-red-500/5 border-red-500/10 flex-1 flex flex-col justify-center">
               <h4 className="text-xs font-black text-white uppercase italic mb-4">Mechanism Alert</h4>
               <p className="text-[12px] text-slate-400 leading-relaxed italic mb-8">
                  "System detects high risk of <span className="text-white font-bold">Microbiologically Influenced Corrosion (MIC)</span> in the stagnant bypass lines. Biocide injection frequency should be increased."
               </p>
               <div className="flex gap-4">
                  <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                     <p className="text-[11px] text-slate-500 uppercase font-bold">Pitting Index</p>
                     <p className="text-xl font-black text-white">4.2</p>
                  </div>
                  <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                     <p className="text-[11px] text-slate-500 uppercase font-bold">SRB Count</p>
                     <p className="text-xl font-black text-red-500">HIGH</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function CorrosionMechanismVisualizer({ type }: { type: string }) {
  return (
    <div className="w-full h-full max-w-[400px] relative">
      <svg viewBox="0 0 400 200" className="w-full h-full">
        <rect x="50" y="100" width="300" height="60" fill="#334155" rx="4" />
        <rect x="50" y="100" width="300" height="10" fill="#475569" rx="2" />

        {type === 'General' && (
          <motion.g initial={{ y: 0 }} animate={{ y: 2 }} transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}>
            <rect x="50" y="95" width="300" height="5" fill="#991b1b" fillOpacity="0.6" />
            <path d="M50 95 Q 65 92, 80 95 T 110 95 T 140 95 T 170 95 T 200 95 T 230 95 T 260 95 T 290 95 T 320 95 T 350 95" 
              fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
          </motion.g>
        )}

        {type === 'Pitting' && (
          <g>
            {[80, 150, 220, 310].map((x, i) => (
              <motion.path 
                key={x}
                initial={{ d: `M ${x-5} 100 Q ${x} 100, ${x+5} 100` }}
                animate={{ d: `M ${x-8} 100 Q ${x} ${100 + (i+1)*8}, ${x+8} 100` }}
                transition={{ duration: 1, delay: i * 0.2 }}
                fill="#ef4444" 
                fillOpacity="0.4"
              />
            ))}
            <path d="M 50 100 H 72 M 88 100 H 142 M 158 100 H 212 M 228 100 H 302 M 318 100 H 350" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {type === 'Galvanic' && (
          <g>
            <rect x="50" y="100" width="150" height="60" fill="#1e293b" rx="2" />
            <rect x="200" y="100" width="150" height="60" fill="#64748b" rx="2" />
            <line x1="200" y1="100" x2="200" y2="160" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
            <motion.circle 
              cx="190" cy="90" r="4" fill="#ef4444" 
              animate={{ x: [0, 20, 0], y: [0, -10, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
            <motion.circle 
              cx="210" cy="85" r="3" fill="#facc15" 
              animate={{ x: [0, -15, 0], y: [0, -15, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.5 }}
            />
          </g>
        )}

        {type === 'Cracking' && (
          <g>
            <path d="M 180 100 L 190 120 L 185 135 M 190 120 L 205 125 L 210 145 M 205 125 L 220 120" 
              fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round">
              <motion.path 
                d="M 180 100 L 190 120 L 185 135 M 190 120 L 205 125 L 210 145 M 205 125 L 220 120"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </path>
            <path d="M 250 100 L 245 115 L 255 130" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </g>
        )}
      </svg>
    </div>
  );
}

// ─── Phase 2: CO2 Corrosion ───────────────────────────────────────────────

function Phase2CO2() {
  const [temp, setTemp] = useState(80);
  const rate = useMemo(() => {
    // Simplified De Waard-Milliams logic for visualization
    const maxRate = 3.42;
    const peakTemp = 100;
    return maxRate * Math.exp(-Math.pow(temp - peakTemp, 2) / 2000);
  }, [temp]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Droplets className="text-red-500" size={36} />
             Phase 2: CO2 <span className="text-red-500/50">Corrosion (Sweet)</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">De Waard-Milliams · FeCO3 Film · Flow Effects</p>
        </div>
        <div className="px-6 py-2 bg-red-500/10 border border-red-500/20 rounded-2xl">
           <span className="text-[10px] font-black text-white uppercase tracking-widest">Film Status: PROTECTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <CO2Kinetics3D temp={temp} rate={rate} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">CO2 Kinetic Simulator</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Film Stability vs Temperature Gradient</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 space-y-8">
               <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">Process Inputs</h4>
               <InputWithSlider label="Temperature" value={temp} min={20} max={150} step={1} unit="°C" onChange={setTemp} />
            </div>
            <div className="p-10 bg-red-600/10 rounded-3xl border border-red-500/20 text-center shadow-lg shadow-red-500/5">
               <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 italic">Predicted Loss Rate</p>
               <p className="text-5xl font-black text-white italic tracking-tighter">
                 {rate.toFixed(2)} <span className="text-xl text-slate-500 not-italic">mm/yr</span>
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── Phase 3: H2S Corrosion ───────────────────────────────────────────────

function Phase3H2S() {
  const [ph, setPh] = useState(5.5);
  const [ph2s, setPh2s] = useState(0.8);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Zap className="text-red-500" size={36} />
             Phase 3: H2S <span className="text-red-500/50">Corrosion (Sour)</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">NACE MR0175 · SSC · HIC Testing</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-red-500 italic">REGION 3</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">NACE Severity Class</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <SourRegionMap3D ph={ph} ph2s={ph2s} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Sour Service Simulator</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">NACE MR0175 Environmental Mapping</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 space-y-8">
               <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">Fluid Chemistry</h4>
               <InputWithSlider label="In-situ pH" value={ph} min={3} max={8} step={0.1} unit="" onChange={setPh} />
               <InputWithSlider label="H2S Partial Pressure" value={ph2s} min={0.01} max={10} step={0.01} unit="psi" onChange={setPh2s} />
            </div>
            <div className="glass-card p-8 rounded-3xl bg-red-500/5 border-red-500/10 flex flex-col justify-center text-center">
               <ShieldCheck size={32} className="text-red-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">HIC/SWC Risk</h4>
               <p className="text-3xl font-black text-white italic tracking-tighter">ELEVATED</p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── Phase 4: Material Selection ──────────────────────────────────────────

function Phase4Materials() {
  const materials = [
    { name: 'Carbon Steel', cost: 1, performance: 2 },
    { name: '13Cr', cost: 3, performance: 6 },
    { name: '22Cr Duplex', cost: 6, performance: 8 },
    { name: '25Cr Duplex', cost: 8, performance: 9 },
    { name: 'Alloy 825', cost: 12, performance: 10 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Layers className="text-red-500" size={36} />
             Phase 4: Material <span className="text-red-500/50">Selection Matrix</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Carbon Steel · CRAs · Non-Metallics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <MaterialMatrix3D materials={materials} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Alloy Optimization Radar</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Cost-Performance Lifecycle Simulation</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-red-500/5 border-red-500/10 h-full flex flex-col justify-center">
               <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-6 italic">PREN Index Thresholds</h4>
               <div className="space-y-6">
                  {[
                    { grade: 'Super Duplex', pren: 42, color: '#ef4444' },
                    { grade: 'Duplex', pren: 34, color: '#f87171' },
                    { grade: '13Cr', pren: 18, color: '#4b5563' },
                  ].map(g => (
                    <div key={g.grade} className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase">
                          <span className="text-white italic">{g.grade}</span>
                          <span className="text-slate-500">{g.pren}</span>
                       </div>
                       <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(g.pren/45)*100}%` }}
                            className="h-full bg-red-500"
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── Phase 5: Corrosion Prevention ────────────────────────────────────────

function Phase5Prevention() {
  const [dose, setDose] = useState(25);
  const efficiency = useMemo(() => {
    return 100 * (1 - Math.exp(-dose / 15));
  }, [dose]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <ShieldCheck className="text-red-500" size={36} />
             Phase 5: Corrosion <span className="text-red-500/50">Prevention</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Inhibitors · Coatings · Cathodic Protection</p>
        </div>
        <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">CP Active: -850 mV</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <InhibitorSim3D dose={dose} efficiency={efficiency} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Molecular Film Simulator</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Adsorption Kinetics & Surface Protection</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 space-y-8">
               <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">Inhibitor Dosing</h4>
               <InputWithSlider label="Dosage Rate" value={dose} min={0} max={100} step={1} unit="ppm" onChange={setDose} />
            </div>
            <div className="p-10 bg-emerald-600/10 rounded-3xl border border-emerald-500/20 text-center shadow-lg shadow-emerald-500/5">
               <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 italic">Protection Efficiency</p>
               <p className="text-5xl font-black text-white italic tracking-tighter">
                 {efficiency.toFixed(1)} <span className="text-xl text-slate-500 not-italic">%</span>
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── Phase 6: Corrosion Monitoring ────────────────────────────────────────

function Phase6Monitoring() {
  const [intensity, setIntensity] = useState(0.5);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Activity className="text-red-500" size={36} />
             Phase 6: Corrosion <span className="text-red-500/50">Monitoring</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Coupons · Probes · UT · Pigging</p>
        </div>
        <div className="flex items-center gap-4 px-6 py-2 bg-red-500/10 border border-red-500/20 rounded-2xl">
           <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
           <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE TELEMETRY</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <TelemetryPulse3D intensity={intensity} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Digital Twin Telemetry</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">LPR & ER Probe Data Stream Integration</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 space-y-8">
               <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">Monitoring Control</h4>
               <InputWithSlider label="Signal Intensity" value={intensity * 100} min={0} max={100} step={1} unit="%" onChange={(v) => setIntensity(v/100)} />
            </div>
            <div className="glass-card p-8 rounded-3xl bg-white/5 border-white/5 flex-1 flex flex-col justify-center">
               <h4 className="text-xs font-black text-white uppercase italic mb-6">Probe Status</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] text-slate-500 font-black uppercase italic">Life Remaining</span>
                     <span className="text-white font-black italic text-lg">84%</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] text-slate-500 font-black uppercase italic">Signal Quality</span>
                     <span className="text-emerald-400 font-black italic text-lg">V.GOOD</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── Phase 7: Integrity Management ────────────────────────────────────────

function Phase7Integrity() {
  const [years, setYears] = useState(15);
  const thickness = useMemo(() => {
    return 12.5 - (years * 0.12);
  }, [years]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Database className="text-red-500" size={36} />
             Phase 7: Integrity <span className="text-red-500/50">Management</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">RBI · FFS · AIMS · Remaining Life</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-red-500 italic">22.4 <span className="text-sm">YRS</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Predicted Remaining Life</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <RemainingLife3D years={years} thickness={thickness} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Asset Integrity Projection</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Wall Loss Decay & Life Cycle Assessment</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 space-y-8">
               <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">Time Projection</h4>
               <InputWithSlider label="Service Years" value={years} min={0} max={50} step={1} unit="yrs" onChange={setYears} />
            </div>
            <div className="p-10 bg-red-600/10 rounded-3xl border border-red-500/20 text-center shadow-lg shadow-red-500/5">
               <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 italic">Current Wall Thickness</p>
               <p className="text-5xl font-black text-white italic tracking-tighter">
                 {thickness.toFixed(2)} <span className="text-xl text-slate-500 not-italic">mm</span>
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── 3D Kinetic Simulators ─────────────────────────────────────────────────

function CO2Kinetics3D({ temp, rate }: { temp: number, rate: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(250, 200)">
          {/* Metal Pipe */}
          <rect x="-150" y="20" width="300" height="40" fill="#334155" rx="4" />
          
          {/* FeCO3 Protective Film */}
          <motion.rect 
            x="-150" y={20 - (10 - rate*2)} width="300" height={10 - rate*2}
            fill="#64748b" fillOpacity={0.8}
            animate={{ height: [10 - rate*2 - 2, 10 - rate*2 + 2, 10 - rate*2] }}
            transition={{ repeat: Infinity, duration: 4 }}
          />

          {/* CO2 Bubbles / Ions */}
          {[...Array(12)].map((_, i) => (
             <motion.circle 
                key={i} r={2 + i%3} fill="#ef4444"
                initial={{ cx: -150 + i*25, cy: 0 }}
                animate={{ 
                   cy: [0, 20, 0],
                   opacity: [0.2, 0.8, 0.2]
                }}
                transition={{ 
                   repeat: Infinity, 
                   duration: 3 + i%2, 
                   delay: i*0.2,
                   ease: "easeInOut"
                }}
             />
          ))}

          {/* Temperature Glow */}
          <motion.circle 
            r="100" fill="radial-gradient(circle, #ef4444 0%, transparent 70%)"
            fillOpacity={temp/200}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 5 }}
          />
       </g>
       <text x="250" y="380" fill="#ef4444" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Kinetic CO2 Film Stability & Loss Simulator</text>
    </svg>
  );
}

function SourRegionMap3D({ ph, ph2s }: { ph: number, ph2s: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(60, 50)">
          {/* Region Backgrounds */}
          <path d="M 0 300 L 0 0 L 380 0 L 380 300 Z" fill="#ef4444" fillOpacity="0.05" />
          <path d="M 0 300 L 380 0 L 380 300 Z" fill="#ef4444" fillOpacity="0.1" />
          
          {/* NACE Threshold Lines */}
          <motion.path 
            d="M 0 300 L 380 0" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" strokeOpacity="0.3"
          />

          {/* Current Operating Point */}
          <motion.g
            animate={{ 
               x: (ph - 3) / 5 * 380,
               y: 300 - (Math.log10(ph2s) + 2) / 3 * 300
            }}
          >
             <circle r="8" fill="#ef4444" />
             <circle r="15" fill="none" stroke="#ef4444" strokeWidth="2" strokeOpacity="0.3">
                <animate attributeName="r" from="8" to="30" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
             </circle>
          </motion.g>

          {/* Grid Labels */}
          <text x="190" y="320" fill="#475569" fontSize="10" textAnchor="middle" className="font-bold">pH</text>
          <text x="-40" y="150" fill="#475569" fontSize="10" textAnchor="middle" transform="rotate(-90, -40, 150)" className="font-bold">pH2S (log)</text>
       </g>
       <text x="250" y="380" fill="#ef4444" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">NACE MR0175 / ISO 15156 Sour Domain Simulator</text>
    </svg>
  );
}

function MaterialMatrix3D({ materials }: { materials: any[] }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(250, 200)">
          {materials.map((m, i) => {
             const angle = (i / materials.length) * Math.PI * 2;
             const dist = 40 + m.performance * 10;
             const x = Math.cos(angle) * dist;
             const y = Math.sin(angle) * dist;
             
             return (
                <motion.g key={m.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                   <line x1="0" y1="0" x2={x} y2={y} stroke="#ef4444" strokeWidth="1" strokeOpacity="0.2" />
                   <motion.circle 
                     cx={x} cy={y} r={m.cost * 2} fill={i === 0 ? "#4b5563" : "#ef4444"} 
                     animate={{ r: [m.cost*2, m.cost*2.2, m.cost*2] }}
                     transition={{ repeat: Infinity, duration: 3, delay: i*0.5 }}
                   />
                   <text x={x*1.2} y={y*1.2} fill="white" fontSize="8" textAnchor="middle" className="font-black italic uppercase tracking-tighter">
                      {m.name}
                   </text>
                </motion.g>
             );
          })}
          <circle r="30" fill="none" stroke="#ffffff10" strokeWidth="1" />
          <circle r="80" fill="none" stroke="#ffffff10" strokeWidth="1" />
       </g>
       <text x="250" y="380" fill="#ef4444" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">CRA Performance vs CAPEX Optimization Engine</text>
    </svg>
  );
}

function InhibitorSim3D({ dose, efficiency }: { dose: number, efficiency: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(250, 200)">
          {/* Metal Surface */}
          <rect x="-150" y="80" width="300" height="20" fill="#334155" rx="2" />
          
          {/* Adsorbed Inhibitor Film */}
          {[...Array(20)].map((_, i) => (
             <motion.rect 
                key={i} x={-150 + i*15} y={80 - (efficiency/10)} width="12" height={efficiency/10}
                fill="#10b981" fillOpacity={0.6}
                initial={{ height: 0 }}
                animate={{ height: efficiency/10 }}
             />
          ))}

          {/* Surfactant Micelles */}
          {[...Array(Math.floor(dose/5))].map((_, i) => (
             <motion.circle 
                key={i} r="4" fill="#10b981"
                initial={{ cx: Math.random()*300 - 150, cy: -100 }}
                animate={{ 
                   cy: [Math.random()*-100, 80],
                   opacity: [0, 1, 0]
                }}
                transition={{ repeat: Infinity, duration: 2 + Math.random()*2, delay: i*0.2 }}
             />
          ))}
       </g>
       <text x="250" y="380" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Surface Adsorption & Corrosion Inhibition Model</text>
    </svg>
  );
}

function TelemetryPulse3D({ intensity }: { intensity: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(250, 200)">
          {/* Pulse Rings */}
          {[1, 2, 3].map(i => (
             <motion.circle 
                key={i} r="20" fill="none" stroke="#ef4444" strokeWidth="2"
                animate={{ 
                   r: [20, 150],
                   opacity: [1, 0]
                }}
                transition={{ 
                   repeat: Infinity, 
                   duration: 3 / intensity, 
                   delay: i * (1/intensity),
                   ease: "easeOut"
                }}
             />
          ))}
          
          {/* Core Telemetry Node */}
          <motion.g animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>
             <circle r="15" fill="#ef4444" />
             <Cpu className="text-white absolute translate-x-[-8px] translate-y-[-8px]" size={16} />
          </motion.g>
       </g>
       <text x="250" y="380" fill="#ef4444" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">ER/LPR Sensor Network Live Data Stream</text>
    </svg>
  );
}

function RemainingLife3D({ years, thickness }: { years: number, thickness: number }) {
  const points = 30;
  
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(60, 50)">
          {/* Projection Curve */}
          <motion.path 
            d={(() => {
               let path = "";
               for (let i = 0; i <= points; i++) {
                  const x = (i/points) * 380;
                  const y = 300 - (12.5 - (i/points * 50 * 0.12)) / 13 * 300;
                  path += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
               }
               return path;
            })()}
            fill="none" stroke="#ef4444" strokeWidth="4" strokeOpacity="0.2"
          />

          {/* Actual Timeline Marker */}
          <motion.g transform={`translate(${(years/50) * 380}, ${300 - (thickness/13) * 300})`}>
             <circle r="6" fill="#ef4444" />
             <line x1="0" y1="0" x2="0" y2={300 - (300 - (thickness/13)*300)} stroke="#ef4444" strokeWidth="1" strokeDasharray="4,2" />
          </motion.g>

          {/* Safe Limit Line */}
          <line x1="0" y1={300 - (9.5/13)*300} x2="380" y2={300 - (9.5/13)*300} stroke="#991b1b" strokeWidth="2" strokeDasharray="10,5" />
          <text x="380" y={290 - (9.5/13)*300} fill="#991b1b" fontSize="8" textAnchor="end" className="font-black uppercase">Min. Wall Limit</text>
       </g>
       <text x="250" y="380" fill="#ef4444" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Probabilistic Remaining Life & Decay Simulator</text>
    </svg>
  );
}
