import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplets, 
  Filter, 
  Wind, 
  ArrowRightLeft, 
  Activity, 
  FlaskConical, 
  LayoutDashboard,
  Zap,
  Box,
  FastForward,
  Pipette,
  Recycle,
  Waves,
  Database
} from 'lucide-react';
import { cn } from '../../lib/utils';

type WaterTab = 
  | 'ph1' | 'ph2' | 'ph3' | 'ph4' | 'ph5' | 'ph6';

export default function WaterAdvStage() {
  const [activeTab, setActiveTab] = useState<WaterTab>('ph1');
  const tabs = [
    { id: 'ph1' as WaterTab, label: 'Ph.1: Characterization', icon: Pipette },
    { id: 'ph2' as WaterTab, label: 'Ph.2: Treatment', icon: Filter },
    { id: 'ph3' as WaterTab, label: 'Ph.3: Disposal', icon: Waves },
    { id: 'ph4' as WaterTab, label: 'Ph.4: Reuse', icon: Recycle },
    { id: 'ph5' as WaterTab, label: 'Ph.5: Sourcing', icon: Droplets },
    { id: 'ph6' as WaterTab, label: 'Ph.6: Frac Water', icon: Zap },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/20">
        <Droplets className="text-cyan-500" size={20} />
        <span className="text-white font-black italic text-lg tracking-tight mr-6 uppercase">Advanced Water Management</span>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === t.id
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
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
            className="h-full"
          >
            {activeTab === 'ph1' && <Phase1Characterization />}
            {activeTab === 'ph2' && <Phase2Treatment />}
            {activeTab === 'ph3' && <Phase3Disposal />}
            {activeTab === 'ph4' && <Phase4Reuse />}
            {activeTab === 'ph5' && <Phase5Sourcing />}
            {activeTab === 'ph6' && <Phase6FracWater />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Phase Components ────────────────────────────────────────────────────────

function Phase1Characterization() {
  const ionicData = [
    { name: 'Sodium', val: 95, color: '#06b6d4' },
    { name: 'Calcium', val: 78, color: '#0891b2' },
    { name: 'Magnesium', val: 65, color: '#0e7490' },
    { name: 'Chloride', val: 99, color: '#155e75' },
    { name: 'Sulfate', val: 42, color: '#06b6d4' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Pipette className="text-cyan-500" size={36} />
             Phase 1: Water <span className="text-cyan-500/50">Characterization</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">TDS · Ionic Composition · Scaling Index · Bacteria</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-cyan-500 italic">45k <span className="text-sm">mg/L</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Total Dissolved Solids (TDS)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-6">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-cyan-500" />
                  Major Ionic Composition Analysis
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <IonicGrid3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-cyan-500/5 border-cyan-500/10 flex-1 flex flex-col justify-center text-center relative overflow-hidden">
               <ScalingCrystalVisualizer />
               <div className="relative z-10 pt-24">
                  <FlaskConical size={48} className="text-cyan-500 mx-auto mb-4" />
                  <h4 className="text-xs font-black text-white uppercase italic mb-2">Scaling Index (LSI)</h4>
                  <p className="text-4xl font-black text-white italic tracking-tighter mb-2">+1.4</p>
                  <div className="px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 inline-block mx-auto">
                     <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">MODERATE SCALING TENDENCY</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ScalingCrystalVisualizer() {
  return (
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      <svg viewBox="0 0 200 400" className="w-full h-full">
        {/* Surface */}
        <rect x="0" y="350" width="200" height="50" fill="#334155" />
        {/* Growing Crystals */}
        {[30, 80, 130, 170].map((x, i) => (
          <motion.path
            key={x}
            d={`M ${x} 350 L ${x+10} ${330 - i*5} L ${x+20} 350 Z`}
            fill="#06b6d4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ repeat: Infinity, duration: 4, delay: i * 0.5 }}
          />
        ))}
        {/* Ionic Ions floating */}
        {[0, 1, 2, 3, 4].map(i => (
          <motion.circle 
            key={i}
            cx={40 + i * 30} 
            cy={300} 
            r="4" 
            fill="#06b6d4"
            animate={{ y: [0, 50], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: i * 0.7 }}
          />
        ))}
      </svg>
    </div>
  );
}

function Phase2Treatment() {
  const treatmentEfficiency = [
    { step: 'Gravity', eff: 45 },
    { step: 'Hydrocyclone', eff: 72 },
    { step: 'Filtration', eff: 88 },
    { step: 'NanoFiltr', eff: 94 },
    { step: 'Reverse Osm', eff: 99 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Filter className="text-cyan-500" size={36} />
             Phase 2: Produced <span className="text-cyan-500/50">Water Treatment</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Separation · Filtration · Membrane · RO</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-emerald-500 italic">99.2%</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Removal Efficiency</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] relative overflow-hidden">
               <TreatmentFlowSimulator />
               <div className="relative z-10">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                     <Activity size={16} className="text-cyan-500" />
                     Treatment Step Efficiency Ladder (%)
                  </h3>
                  <div className="h-[300px] flex items-center justify-center">
                     <TreatmentPlant3D />
                  </div>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-cyan-500/5 border-cyan-500/10 flex-1 flex flex-col justify-center text-center">
               <Zap size={48} className="text-cyan-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Effluent Quality</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">&lt;5 <span className="text-sm">PPM</span></p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Oil in Water Content</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function TreatmentFlowSimulator() {
  return (
    <div className="absolute inset-0 opacity-10 pointer-events-none">
      <svg viewBox="0 0 800 400" className="w-full h-full">
        {/* Tanks */}
        {[100, 300, 500, 700].map((x, i) => (
          <g key={x}>
            <rect x={x-40} y="150" width="80" height="120" fill="none" stroke="#06b6d4" strokeWidth="2" rx="10" />
            <motion.rect 
              x={x-38} y="270" width="76" height="0" 
              fill="#06b6d4" 
              animate={{ height: [-80, -100, -80], y: [270, 270, 270] }}
              transition={{ repeat: Infinity, duration: 4, delay: i * 0.5 }}
            />
          </g>
        ))}
        {/* Connecting Pipes */}
        {[140, 340, 540].map(x => (
          <path key={x} d={`M ${x} 210 H ${x+120}`} stroke="#06b6d4" strokeWidth="4" strokeDasharray="10 5" />
        ))}
        {/* Particles */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <motion.circle 
            key={i}
            r="3" fill="#06b6d4"
            animate={{ 
              x: [100, 300, 500, 700],
              y: [210, 210, 210, 210],
              opacity: [1, 0.8, 0.5, 0.2]
            }}
            transition={{ repeat: Infinity, duration: 6, delay: i * 0.8 }}
          />
        ))}
      </svg>
    </div>
  );
}

function Phase3Disposal() {
  const injectionTrend = [
    { vol: 0, pres: 800 },
    { vol: 2, pres: 1200 },
    { vol: 5, pres: 1800 },
    { vol: 8, pres: 2400 },
    { vol: 12, pres: 2900 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Waves className="text-cyan-500" size={36} />
             Phase 3: <span className="text-cyan-500/50">Water Disposal</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">SWD · UIC Class II · Seismicity · Injectivity</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-white italic">2,450 <span className="text-sm">PSI</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Injection Well Pressure</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] relative overflow-hidden">
               <InjectionWellSimulator />
               <div className="relative z-10">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                     <Activity size={16} className="text-cyan-500" />
                     Injection Pressure vs. Cumulative Volume (MMbbl)
                  </h3>
                  <div className="h-[300px] flex items-center justify-center">
                     <DisposalWell3D />
                  </div>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-cyan-500/5 border-cyan-500/10 flex-1 flex flex-col justify-center text-center">
               <Box size={48} className="text-cyan-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Induced Seismicity</h4>
               <p className="text-2xl font-black text-emerald-500 italic tracking-tighter mb-2">GREEN LIGHT</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Seismic Monitor Active</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function InjectionWellSimulator() {
  return (
    <div className="absolute inset-0 opacity-10 pointer-events-none">
      <svg viewBox="0 0 400 800" className="w-full h-full">
        {/* Surface */}
        <rect x="0" y="50" width="400" height="20" fill="#334155" />
        {/* Wellbore */}
        <rect x="190" y="50" width="20" height="700" fill="#1e293b" stroke="#06b6d4" strokeWidth="2" />
        {/* Formation Layers */}
        {[200, 400, 600].map(y => (
          <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#ffffff20" strokeWidth="1" strokeDasharray="10 10" />
        ))}
        {/* Pressure Waves at Bottom */}
        <motion.circle 
          cx="200" cy="700" r="10" stroke="#06b6d4" fill="none"
          animate={{ scale: [1, 4], opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <motion.circle 
          cx="200" cy="700" r="10" stroke="#06b6d4" fill="none"
          animate={{ scale: [1, 4], opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 2, delay: 1 }}
        />
        {/* Droplets descending */}
        {[0, 1, 2, 3, 4].map(i => (
          <motion.circle 
            key={i}
            cx="200" r="3" fill="#06b6d4"
            animate={{ y: [60, 680] }}
            transition={{ repeat: Infinity, duration: 3, delay: i * 0.6 }}
          />
        ))}
      </svg>
    </div>
  );
}

function Phase4Reuse() {
  const reuseMix = [
    { name: 'Frac Supply', val: 75, color: '#06b6d4' },
    { name: 'Irrigation', val: 12, color: '#0891b2' },
    { name: 'Industrial', val: 8, color: '#0e7490' },
    { name: 'Mineral Ext', val: 5, color: '#155e75' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Recycle className="text-cyan-500" size={36} />
             Phase 4: <span className="text-cyan-500/50">Beneficial Reuse</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Circular Economy · Irrigation · Frac Supply</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-cyan-500 italic">82%</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Reuse / Recycling Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] relative overflow-hidden">
               <WaterCycleVisualizer />
               <div className="relative z-10">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                     <Database size={16} className="text-cyan-500" />
                     Water Reuse Allocation (% Vol)
                  </h3>
                  <div className="h-[300px] flex items-center justify-center">
                     <ReuseNetwork3D />
                  </div>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-cyan-500/5 border-cyan-500/10 flex-1 flex flex-col justify-center">
               <h4 className="text-xs font-black text-white uppercase italic mb-6 text-center">Mineral Recovery (Est)</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center px-4 py-3 bg-black/20 rounded-2xl border border-white/5">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">Lithium (Li)</span>
                     <span className="text-cyan-400 font-black italic text-lg">145 PPM</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-black/20 rounded-2xl border border-white/5">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">Bromine (Br)</span>
                     <span className="text-white font-black italic text-lg">520 PPM</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function WaterCycleVisualizer() {
  return (
    <div className="absolute inset-0 opacity-10 pointer-events-none">
      <svg viewBox="0 0 800 400" className="w-full h-full">
        {/* Large Circle Path */}
        <circle cx="400" cy="200" r="120" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="20 10" />
        {/* Icons positions */}
        {[0, 120, 240].map(angle => {
          const rad = (angle * Math.PI) / 180;
          const x = 400 + Math.cos(rad) * 120;
          const y = 200 + Math.sin(rad) * 120;
          return (
            <motion.circle 
              key={angle} cx={x} cy={y} r="15" fill="#06b6d4"
              animate={{ r: [15, 20, 15] }}
              transition={{ repeat: Infinity, duration: 3, delay: angle / 100 }}
            />
          );
        })}
        {/* Flowing particles along the circle */}
        {[0, 1, 2, 3, 4].map(i => (
          <motion.circle 
            key={i} r="4" fill="#06b6d4"
            animate={{ 
              rotate: [0, 360]
            }}
            style={{ originX: '400px', originY: '200px' }}
            transition={{ repeat: Infinity, duration: 10, delay: i * 2, ease: "linear" }}
            cx="520" cy="200"
          />
        ))}
      </svg>
    </div>
  );
}

function Phase5Sourcing() {
  const sourceData = [
    { name: 'Produced Water', val: 65, color: '#06b6d4' },
    { name: 'Brackish GW', val: 25, color: '#0891b2' },
    { name: 'Freshwater', val: 10, color: '#155e75' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Droplets className="text-cyan-500" size={36} />
             Phase 5: Water <span className="text-cyan-500/50">Sourcing & Transfer</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Freshwater · Brackish · Storage · Pipelines</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-white italic">1.2 <span className="text-sm">MM Bbl</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Total Storage Capacity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] relative overflow-hidden">
               <SourcingMapSimulator />
               <div className="relative z-10">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                     <Database size={16} className="text-cyan-500" />
                     Water Sourcing Mix Analysis (% Vol)
                  </h3>
                  <div className="h-[300px] flex items-center justify-center">
                     <SourcingMap3D />
                  </div>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-cyan-500/5 border-cyan-500/10 flex-1 flex flex-col justify-center text-center">
               <FastForward size={48} className="text-cyan-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Transfer Capacity</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">85k <span className="text-sm">BPD</span></p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Pipeline Flow</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function SourcingMapSimulator() {
  return (
    <div className="absolute inset-0 opacity-10 pointer-events-none">
      <svg viewBox="0 0 800 400" className="w-full h-full">
        {/* River */}
        <motion.path 
          d="M 0 300 Q 200 250, 400 300 T 800 300"
          fill="none" stroke="#06b6d4" strokeWidth="20"
          animate={{ strokeDashoffset: [0, -100] }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          strokeDasharray="20 10"
        />
        {/* Aquifer nodes */}
        {[100, 300, 500, 700].map(x => (
          <circle key={x} cx={x} cy="100" r="10" fill="#06b6d4" fillOpacity="0.5" />
        ))}
        {/* Pipelines */}
        <path d="M 100 100 V 300 M 300 100 V 300 M 500 100 V 300 M 700 100 V 300" stroke="#06b6d4" strokeWidth="2" strokeDasharray="5 5" />
        {/* Pumping icons */}
        {[100, 300, 500, 700].map(x => (
          <motion.circle 
            key={x} cx={x} cy="200" r="5" fill="#06b6d4"
            animate={{ scale: [1, 2, 1] }}
            transition={{ repeat: Infinity, duration: 2, delay: x / 1000 }}
          />
        ))}
      </svg>
    </div>
  );
}

function Phase6FracWater() {
  const volumeData = [
    { stage: 'St 1', vol: 12000 },
    { stage: 'St 2', vol: 15500 },
    { stage: 'St 3', vol: 14200 },
    { stage: 'St 4', vol: 16800 },
    { stage: 'St 5', vol: 18500 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Zap className="text-cyan-500" size={36} />
             Phase 6: Hydraulic <span className="text-cyan-500/50">Fracturing Water</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Volume requirements · Chemistry · Flowback · CO2 Frac</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-cyan-500 italic">12.5 <span className="text-sm">MM Gal</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Total Water Requirement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] relative overflow-hidden">
               <FracVolumeVisualizer />
               <div className="relative z-10">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                     <Activity size={16} className="text-cyan-500" />
                     Stage-wise Water Volume Consumption (Bbl)
                  </h3>
                  <div className="h-[300px] flex items-center justify-center">
                     <FracBlending3D />
                  </div>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-cyan-500/5 border-cyan-500/10 flex-1 flex flex-col justify-center text-center">
               <Waves size={48} className="text-cyan-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Chemical Loading</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">0.5%</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Friction Reducer · Biocide · Scale</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function FracVolumeVisualizer() {
  return (
    <div className="absolute inset-0 opacity-10 pointer-events-none">
      <svg viewBox="0 0 800 400" className="w-full h-full">
        {/* Blending unit */}
        <rect x="350" y="250" width="100" height="100" fill="none" stroke="#06b6d4" strokeWidth="2" rx="10" />
        <motion.rect 
          x="355" y="345" width="90" height="0" 
          fill="#06b6d4" 
          animate={{ height: -80, y: 345 }}
          transition={{ repeat: Infinity, duration: 4 }}
        />
        {/* Chemicals entering */}
        {[0, 1, 2].map(i => (
          <motion.circle 
            key={i} cx={300 - i * 40} cy="280" r="4" fill="#06b6d4"
            animate={{ x: [0, 60], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
          />
        ))}
        {/* Frac Fluid exiting */}
        <motion.path 
          d="M 450 300 H 600"
          stroke="#06b6d4" strokeWidth="6" strokeDasharray="10 5"
          animate={{ strokeDashoffset: -100 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />
      </svg>
    </div>
  );
}

// ─── 3D Visualizer Components ──────────────────────────────────────────────

function IonicGrid3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Isometric Grid Lattice */}
        {[0, 1, 2, 3].map(i => (
          <g key={i}>
            {[0, 1, 2, 3].map(j => {
              const x = 250 + (i - j) * 50;
              const y = 100 + (i + j) * 25;
              return (
                <g key={`${i}-${j}`}>
                   <path 
                     d={`M ${x} ${y} L ${x+50} ${y-25} L ${x+100} ${y} L ${x+50} ${y+25} Z`}
                     fill="none" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.2"
                   />
                   <motion.circle 
                     cx={x+50} cy={y} r="4" fill="#06b6d4"
                     animate={{ r: [3, 6, 3], fillOpacity: [0.3, 0.8, 0.3] }}
                     transition={{ repeat: Infinity, duration: 3, delay: (i+j)*0.5 }}
                   />
                </g>
              );
            })}
          </g>
        ))}
        <text x="250" y="280" fill="#64748b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">3D Ionic Lattice Structure</text>
      </svg>
    </div>
  );
}

function TreatmentPlant3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Isometric Tanks */}
        {[0, 1, 2].map(i => {
          const x = 100 + i*120;
          const y = 150;
          return (
            <g key={i}>
              <motion.path 
                d={`M ${x} ${y} L ${x+40} ${y-20} L ${x+80} ${y} L ${x+40} ${y+20} Z`}
                fill="#0f172a" stroke="#06b6d4" strokeWidth="2"
              />
              <motion.rect 
                x={x} y={y} width="80" height="60" fill="#0f172a" stroke="#06b6d4" strokeWidth="2"
                initial={{ height: 0 }} animate={{ height: 60 }} transition={{ duration: 1, delay: i*0.2 }}
              />
              {/* Flow between tanks */}
              {i < 2 && (
                <path d={`M ${x+80} ${y+30} H ${x+120}`} stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 2" />
              )}
            </g>
          );
        })}
        <motion.circle 
          cx="100" cy="180" r="4" fill="#06b6d4"
          animate={{ x: [0, 240], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        />
      </svg>
    </div>
  );
}

function DisposalWell3D() {
  return (
    <div className="w-full h-full max-w-[400px]">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <rect x="180" y="50" width="40" height="300" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" rx="5" />
        {[0, 1, 2, 3].map(i => (
          <motion.circle 
            key={i} cx="200" cy={100 + i*60} r="6" fill="#06b6d4"
            animate={{ scale: [1, 2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, delay: i*0.5 }}
          />
        ))}
        {/* Radial Pressure Waves */}
        <motion.circle 
          cx="200" cy="350" r="10" stroke="#06b6d4" fill="none" strokeWidth="2"
          animate={{ scale: [1, 8], opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        />
      </svg>
    </div>
  );
}

function ReuseNetwork3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        <circle cx="250" cy="150" r="80" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="10 5" />
        {[0, 90, 180, 270].map(angle => {
          const rad = (angle * Math.PI) / 180;
          const x = 250 + Math.cos(rad) * 80;
          const y = 150 + Math.sin(rad) * 80;
          return (
            <motion.rect 
              key={angle} x={x-15} y={y-15} width="30" height="30" rx="5"
              fill="#0f172a" stroke="#06b6d4" strokeWidth="2"
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            />
          );
        })}
        <motion.circle 
          cx="250" cy="70" r="6" fill="#06b6d4"
          animate={{ rotate: [0, 360] }}
          style={{ originX: '250px', originY: '150px' }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
        />
      </svg>
    </div>
  );
}

function SourcingMap3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Isometric Map Grid */}
        <path d="M 50 150 L 250 50 L 450 150 L 250 250 Z" fill="#0f172a" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.3" />
        {[
          { x: 150, y: 120, label: 'River' },
          { x: 300, y: 100, label: 'Well' },
          { x: 250, y: 180, label: 'Tank' }
        ].map((p, i) => (
          <g key={i}>
            <motion.circle 
              cx={p.x} cy={p.y} r="5" fill="#06b6d4"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i*0.3 }}
            />
            <text x={p.x} y={p.y - 15} fill="#06b6d4" fontSize="8" textAnchor="middle" className="font-black uppercase italic">{p.label}</text>
            {/* Pulsing connections */}
            <motion.line 
              x1={p.x} y1={p.y} x2="250" y2="150" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 2"
              animate={{ strokeDashoffset: [0, -20] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

function FracBlending3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Central Blending Tank */}
        <rect x="200" y="100" width="100" height="100" rx="10" fill="#0f172a" stroke="#06b6d4" strokeWidth="3" />
        
        {/* Input Pipes */}
        <path d="M 50 120 H 200" stroke="#06b6d4" strokeWidth="4" />
        <path d="M 50 180 H 200" stroke="#0891b2" strokeWidth="4" />
        
        {/* Output Pipe */}
        <path d="M 300 150 H 450" stroke="#22d3ee" strokeWidth="8" strokeDasharray="12 6" />
        
        {/* Animated Particles */}
        {[0, 1, 2].map(i => (
          <motion.circle 
            key={i} r="4" fill="#06b6d4"
            animate={{ x: [50, 450], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: i*1, ease: "linear" }}
          />
        ))}
        
        <text x="250" y="230" fill="#06b6d4" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">High Volume Blending Station</text>
      </svg>
    </div>
  );
}

function DetailCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass-card p-6 rounded-3xl border-white/5 bg-cyan-500/5 hover:border-cyan-500/30 transition-all">
      <h5 className="text-[11px] font-black uppercase tracking-widest text-cyan-500 mb-4">{title}</h5>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <div className="mt-1.5 w-1 h-1 rounded-full bg-cyan-500 shrink-0" />
            <span className="text-[11px] text-slate-300 leading-relaxed font-medium">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
