import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mountain, 
  Layers, 
  Droplet, 
  Waves, 
  Zap, 
  Box, 
  ArrowRight,
  Activity,
  Ruler,
  Compass,
  Map,
  Database,
  FastForward
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie,
  ScatterChart,
  Scatter,
  ZAxis,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

type GeologyTab = 
  | 'ph1' | 'ph2' | 'ph3' | 'ph4' | 'ph5' | 'ph6' | 'ph7' | 'ph8';

export default function GeologyBasinAdvStage() {
  const [activeTab, setActiveTab] = useState<GeologyTab>('ph1');
  const tabs = [
    { id: 'ph1' as GeologyTab, label: 'Ph.1: Basins', icon: Mountain },
    { id: 'ph2' as GeologyTab, label: 'Ph.2: Source', icon: Droplet },
    { id: 'ph3' as GeologyTab, label: 'Ph.3: Reservoir', icon: Layers },
    { id: 'ph4' as GeologyTab, label: 'Ph.4: Traps', icon: Box },
    { id: 'ph5' as GeologyTab, label: 'Ph.5: Migration', icon: ArrowRight },
    { id: 'ph6' as GeologyTab, label: 'Ph.6: Systems', icon: Activity },
    { id: 'ph7' as GeologyTab, label: 'Ph.7: Stratigraphy', icon: Ruler },
    { id: 'ph8' as GeologyTab, label: 'Ph.8: Carbonates', icon: Waves },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/20">
        <Mountain className="text-emerald-500" size={20} />
        <span className="text-white font-black italic text-lg tracking-tight mr-6 uppercase">Petroleum Geology & Basin Analysis</span>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === t.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'ph1' && <Phase1Basins />}
            {activeTab === 'ph2' && <Phase2Source />}
            {activeTab === 'ph3' && <Phase3Reservoir />}
            {activeTab === 'ph4' && <Phase4Traps />}
            {activeTab === 'ph5' && <Phase5Migration />}
            {activeTab === 'ph6' && <Phase6Systems />}
            {activeTab === 'ph7' && <Phase7Stratigraphy />}
            {activeTab === 'ph8' && <Phase8Carbonates />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Phase 1: Sedimentary Basins ──────────────────────────────────────────

function Phase1Basins() {
  const subsidenceData = [
    { time: 100, depth: 0 },
    { time: 80, depth: 1200 },
    { time: 60, depth: 2800 },
    { time: 40, depth: 4200 },
    { time: 20, depth: 5100 },
    { time: 0, depth: 5800 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Mountain className="text-emerald-500" size={36} />
             Phase 1: Sedimentary <span className="text-emerald-500/50">Basins</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Basin Evolution · Tectonic Setting · Subsidence</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-emerald-500 italic">5.8 KM</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Max Sedimentary Fill</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                     <Activity size={16} className="text-emerald-500" />
                     Isometric Basin Subsidence Model
                  </h3>
               </div>
               <div className="h-[300px] flex items-center justify-center">
                  <BasinProfile3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-emerald-500/5 border-emerald-500/10 flex-1 flex flex-col justify-center">
               <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-6 italic">Tectonic Profile</h4>
               <div className="space-y-4">
                  {[
                    { label: 'Thermal Subsidence', val: 65 },
                    { label: 'Tectonic Loading', val: 25 },
                    { label: 'Isostatic Comp.', val: 10 },
                  ].map(p => (
                    <div key={p.label}>
                       <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                          <span className="text-white">{p.label}</span>
                          <span className="text-slate-500">{p.val}%</span>
                       </div>
                       <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${p.val}%` }} />
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

function BasinProfile3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full drop-shadow-2xl">
        {/* Isometric Basin Block */}
        <path d="M 50 100 L 250 50 L 450 100 L 250 150 Z" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
        <path d="M 50 100 V 250 L 250 300 V 150 Z" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
        <path d="M 450 100 V 250 L 250 300 V 150 Z" fill="#1e293b" stroke="#10b981" strokeWidth="1" />
        
        {/* Sedimentary Layers */}
        {[0, 1, 2, 3].map(i => (
          <motion.path 
            key={i}
            d={`M ${80 + i*20} ${110 + i*10} Q 250 ${180 + i*15}, ${420 - i*20} ${110 + i*10}`}
            fill="none" stroke="#10b981" strokeWidth="2" strokeOpacity={0.6 - i*0.1}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: i * 0.3 }}
          />
        ))}
        
        {/* Fault Line */}
        <motion.line 
          x1="350" y1="80" x2="350" y2="280" 
          stroke="#ef4444" strokeWidth="2" strokeDasharray="5 5"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </svg>
    </div>
  );
}

// ─── Phase 2: Source Rocks ──────────────────────────────────────────────

function Phase2Source() {
  const vanKrevelen = [
    { hi: 850, oi: 20, type: 'Type I' },
    { hi: 620, oi: 45, type: 'Type II' },
    { hi: 210, oi: 80, type: 'Type III' },
    { hi: 50, oi: 150, type: 'Type IV' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Droplet className="text-emerald-500" size={36} />
             Phase 2: Source <span className="text-emerald-500/50">Rocks</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Generation · Kerogen · Expulsion</p>
        </div>
        <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
           <span className="text-[10px] font-black text-white uppercase tracking-widest">Maturity: OIL WINDOW</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] relative overflow-hidden">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Database size={16} className="text-emerald-500" />
                  Kerogen Maturation 3D Block Model
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <KerogenMaturation3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-emerald-500/5 border-emerald-500/10 flex-1 flex flex-col justify-center text-center">
               <Activity size={48} className="text-emerald-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Total Organic Carbon</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-4">4.2 <span className="text-sm text-slate-500">wt%</span></p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">EXCELLENT SOURCE POTENTIAL</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function KerogenMaturation3D() {
  return (
    <div className="w-full h-full max-w-[400px]">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {/* Depth Block */}
        <rect x="100" y="50" width="200" height="300" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
        {/* Maturation Zones */}
        <motion.rect x="102" y="52" width="196" height="60" fill="#1e293b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        <motion.rect x="102" y="112" width="196" height="100" fill="#10b981" fillOpacity="0.2" animate={{ fillOpacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 4 }} />
        <motion.rect x="102" y="212" width="196" height="80" fill="#fbbf24" fillOpacity="0.2" />
        <motion.rect x="102" y="292" width="196" height="56" fill="#ef4444" fillOpacity="0.2" />
        
        {/* Labels */}
        <text x="310" y="90" fill="#64748b" fontSize="10" className="font-black uppercase tracking-tighter italic">Immature</text>
        <text x="310" y="170" fill="#10b981" fontSize="10" className="font-black uppercase tracking-tighter italic">Oil Window</text>
        <text x="310" y="260" fill="#fbbf24" fontSize="10" className="font-black uppercase tracking-tighter italic">Gas Window</text>
        
        {/* Expulsion Droplets */}
        {[0, 1, 2, 3].map(i => (
          <motion.circle 
            key={i} cx={150 + i*30} cy="180" r="4" fill="#10b981"
            animate={{ x: [0, 100], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: i * 0.7 }}
          />
        ))}
      </svg>
    </div>
  );
}

// ─── Phase 3: Reservoir Rocks ────────────────────────────────────────────

function Phase3Reservoir() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Layers className="text-emerald-500" size={36} />
             Phase 3: Reservoir <span className="text-emerald-500/50">Rocks</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Clastics · Carbonates · Diagenesis</p>
        </div>
        <div className="flex gap-4">
           <div className="text-right">
              <p className="text-3xl font-black text-white italic">280 <span className="text-sm">mD</span></p>
              <p className="text-[11px] text-slate-500 uppercase font-bold">Avg. Permeability</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] relative overflow-hidden">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Ruler size={16} className="text-emerald-500" />
                  3D Pore Network Visualization
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <PoreStructure3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-emerald-500/5 border-emerald-500/10 flex-1 flex flex-col justify-center">
               <h4 className="text-xs font-black text-white uppercase italic mb-6">Pore Architecture</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">Authigenic Clays</span>
                     <span className="text-white font-black italic text-lg">12%</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">Secondary Poro</span>
                     <span className="text-emerald-400 font-black italic text-lg">HIGH</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function PoreStructure3D() {
  return (
    <div className="w-full h-full max-w-[400px]">
      <svg viewBox="0 0 400 400" className="w-full h-full opacity-60">
        {/* Sand Grains */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <motion.circle 
            key={i}
            cx={100 + (i%3)*100} 
            cy={100 + Math.floor(i/3)*100} 
            r={40 + Math.random()*10} 
            fill="#334155"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4, delay: i * 0.2 }}
          />
        ))}
        {/* Interconnected Pores (Oil droplets moving through) */}
        {[0, 1, 2, 3].map(i => (
          <motion.circle 
            key={i} r="6" fill="#10b981"
            animate={{ 
              cx: [150, 250, 150, 50, 150],
              cy: [50, 150, 250, 150, 50]
            }}
            transition={{ repeat: Infinity, duration: 8, delay: i * 2, ease: "linear" }}
          />
        ))}
      </svg>
    </div>
  );
}

// ─── Phase 4: Traps & Seals ──────────────────────────────────────────────

function Phase4Traps() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Box className="text-emerald-500" size={36} />
             Phase 4: Traps <span className="text-emerald-500/50">& Seals</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Structural · Stratigraphic · Seal Integrity</p>
        </div>
        <div className="flex items-center gap-4 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
           <span className="text-[10px] font-black text-white uppercase tracking-widest">Seal Status: INTACT</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] relative overflow-hidden">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-emerald-500" />
                  Trap & Closure Architecture 3D
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <TrapStructure3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-emerald-500/5 border-emerald-500/10 flex-1 flex flex-col justify-center text-center">
               <Compass size={48} className="text-emerald-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Structural Closure</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">420 <span className="text-sm text-slate-500">ACRES</span></p>
               <p className="text-[10px] text-slate-500 font-bold uppercase">4-Way Dip Closure</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function TrapStructure3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Anticlinal Layers */}
        {[0, 1, 2, 3].map(i => (
          <motion.path 
            key={i}
            d={`M 50 ${250 - i*30} Q 250 ${50 - i*30}, 450 ${250 - i*30}`}
            fill="none" stroke="#10b981" strokeWidth="15" strokeOpacity={0.8 - i*0.2}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2 }}
          />
        ))}
        {/* Hydrocarbon Accumulation */}
        <motion.path 
          d="M 180 120 Q 250 80, 320 120 Z" 
          fill="#10b981" 
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 3 }}
        />
        {/* Spill Point */}
        <circle cx="320" cy="120" r="4" fill="#ef4444" />
        <text x="330" y="125" fill="#ef4444" fontSize="8" className="font-black uppercase tracking-widest italic">Spill Point</text>
      </svg>
    </div>
  );
}

// ─── Phase 5: Migration ──────────────────────────────────────────────────

function Phase5Migration() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <ArrowRight className="text-emerald-500" size={36} />
             Phase 5: Migration <span className="text-emerald-500/50">& Accumulation</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Carrier Beds · Pathways · Fill-Spill</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-emerald-500 italic">LONG</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Migration Range (km)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] relative overflow-hidden">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <FastForward size={16} className="text-emerald-500" />
                  Secondary Migration Pathway Simulator
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <MigrationPath3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-emerald-500/5 border-emerald-500/10 flex-1 flex flex-col justify-center text-center">
               <Zap size={32} className="text-emerald-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Primary Expulsion</h4>
               <p className="text-2xl font-black text-white italic tracking-tighter mb-2">92% EFFICIENT</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase">Peak Generation Sync</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function MigrationPath3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Inclined Carrier Bed */}
        <path d="M 50 250 L 450 150 V 170 L 50 270 Z" fill="#334155" fillOpacity="0.3" stroke="#10b981" strokeWidth="1" />
        {/* Migration Bubbles */}
        {[0, 1, 2, 3, 4].map(i => (
          <motion.circle 
            key={i} r="5" fill="#10b981"
            animate={{ 
              cx: [50 + i*20, 450],
              cy: [260 - i*5, 160],
              opacity: [0, 1, 0]
            }}
            transition={{ repeat: Infinity, duration: 4, delay: i * 0.8 }}
          />
        ))}
        {/* Structural High */}
        <path d="M 430 150 Q 450 130, 470 150" fill="none" stroke="#fbbf24" strokeWidth="3" />
        <text x="430" y="120" fill="#fbbf24" fontSize="8" className="font-black uppercase italic tracking-widest">Structural High</text>
      </svg>
    </div>
  );
}

// ─── Phase 6: Petroleum Systems ──────────────────────────────────────────

function Phase6Systems() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Activity className="text-emerald-500" size={36} />
             Phase 6: Petroleum <span className="text-emerald-500/50">Systems & Risking</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Source · Reservoir · Seal · Trap · Timing</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-emerald-500 italic">54%</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">POS (Probability of Success)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] relative overflow-hidden">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-emerald-500" />
                  Petroleum System Connectivity Model
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <SystemRisk3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-emerald-500/5 border-emerald-500/10 flex-1 flex flex-col justify-center">
               <h4 className="text-xs font-black text-white uppercase italic mb-6">Critical Moment</h4>
               <div className="relative h-2 w-full bg-white/5 rounded-full mb-4">
                  <div className="absolute top-0 left-[65%] w-4 h-4 bg-emerald-500 rounded-full -translate-x-1/2 -translate-y-1/4 shadow-lg shadow-emerald-500/50" />
               </div>
               <div className="flex justify-between text-[11px] font-black uppercase text-slate-500">
                  <span>100 Ma</span>
                  <span className="text-white">CRITICAL (65 Ma)</span>
                  <span>Present</span>
               </div>
               <p className="text-[10px] text-slate-400 mt-6 leading-relaxed italic">
                  "Charge timing coincides with late-stage Laramide trap formation, maximizing accumulation efficiency."
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function SystemRisk3D() {
  const elements = ['Source', 'Reservoir', 'Seal', 'Trap', 'Timing'];
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Connecting Hexagon/Network */}
        {elements.map((el, i) => {
          const angle = (i * 360) / 5;
          const rad = (angle * Math.PI) / 180;
          const x = 250 + Math.cos(rad) * 100;
          const y = 150 + Math.sin(rad) * 100;
          return (
            <g key={el}>
              <motion.line 
                x1="250" y1="150" x2={x} y2={y} 
                stroke="#10b981" strokeWidth="2" strokeOpacity="0.3"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              />
              <motion.rect 
                x={x-30} y={y-15} width="60" height="30" rx="4"
                fill="#1e293b" stroke="#10b981" strokeWidth="1"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 4, delay: i * 0.5 }}
              />
              <text x={x} y={y+5} fill="#10b981" fontSize="8" textAnchor="middle" className="font-black uppercase tracking-tighter italic">{el}</text>
            </g>
          );
        })}
        <circle cx="250" cy="150" r="40" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeDasharray="5 5" />
        <text x="250" y="155" fill="white" fontSize="12" textAnchor="middle" className="font-black italic">POS</text>
      </svg>
    </div>
  );
}

// ─── Phase 7: Sequence Stratigraphy ──────────────────────────────────────

function Phase7Stratigraphy() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Ruler className="text-emerald-500" size={36} />
             Phase 7: Sequence <span className="text-emerald-500/50">Stratigraphy</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Systems Tracts · Surfaces · Accommodation</p>
        </div>
        <div className="flex items-center gap-4 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
           <span className="text-[10px] font-black text-white uppercase tracking-widest">HST ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] relative overflow-hidden">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Waves size={16} className="text-emerald-500" />
                  Systems Tract Block Diagram 3D
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <SequenceStrat3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-emerald-500/5 border-emerald-500/10 flex-1 flex flex-col justify-center">
               <h4 className="text-xs font-black text-white uppercase italic mb-6">Stacking Patterns</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">Progradational</span>
                     <span className="text-emerald-400 font-black italic text-lg">HST</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">Retrogradational</span>
                     <span className="text-white font-black italic text-lg">TST</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function SequenceStrat3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Sea Level Line */}
        <motion.path 
          d="M 0 100 Q 125 80, 250 100 T 500 100"
          fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="5 5"
          animate={{ d: ["M 0 100 Q 125 80, 250 100 T 500 100", "M 0 120 Q 125 100, 250 120 T 500 120", "M 0 100 Q 125 80, 250 100 T 500 100"] }}
          transition={{ repeat: Infinity, duration: 5 }}
        />
        {/* Systems Tracts Blocks */}
        <rect x="50" y="150" width="100" height="80" fill="#1e293b" stroke="#10b981" strokeWidth="1" />
        <rect x="150" y="130" width="100" height="100" fill="#334155" stroke="#10b981" strokeWidth="1" />
        <rect x="250" y="170" width="100" height="60" fill="#1e293b" stroke="#10b981" strokeWidth="1" />
        <rect x="350" y="110" width="100" height="120" fill="#334155" stroke="#10b981" strokeWidth="1" />
        
        <text x="100" y="250" fill="#64748b" fontSize="8" textAnchor="middle" className="font-black italic">LST</text>
        <text x="200" y="250" fill="#10b981" fontSize="8" textAnchor="middle" className="font-black italic">TST</text>
        <text x="300" y="250" fill="#64748b" fontSize="8" textAnchor="middle" className="font-black italic">FSST</text>
        <text x="400" y="250" fill="#10b981" fontSize="8" textAnchor="middle" className="font-black italic">HST</text>
      </svg>
    </div>
  );
}

// ─── Phase 8: Carbonate Geology ──────────────────────────────────────────

function Phase8Carbonates() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Waves className="text-emerald-500" size={36} />
             Phase 8: Carbonate <span className="text-emerald-500/50">Geology</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Factory · Reefs · Platforms · Diagenesis</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-emerald-500 italic">PLATFORM</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Depositional Setting</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] relative overflow-hidden">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Database size={16} className="text-emerald-500" />
                  Carbonate Factory Platform Model 3D
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <CarbonateFactory3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-emerald-500/5 border-emerald-500/10 flex-1 flex flex-col justify-center text-center">
               <Layers size={48} className="text-emerald-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Secondary Porosity</h4>
               <p className="text-3xl font-black text-white italic tracking-tighter mb-4">VUGGY/MOLDIC</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  "Intense dissolution during subaerial exposure has enhanced storage capacity."
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function CarbonateFactory3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Platform Profile */}
        <path d="M 0 100 H 150 L 250 150 L 350 250 H 500 V 300 H 0 Z" fill="#334155" fillOpacity="0.3" stroke="#10b981" strokeWidth="2" />
        {/* Reef Core */}
        <motion.circle 
          cx="200" cy="125" r="30" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="2"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
        />
        <text x="200" y="125" fill="white" fontSize="8" textAnchor="middle" className="font-black uppercase italic">Reef Core</text>
        {/* Lagoon */}
        <rect x="20" y="80" width="100" height="20" fill="#06b6d4" fillOpacity="0.2" />
        <text x="70" y="95" fill="#06b6d4" fontSize="8" textAnchor="middle" className="font-black uppercase italic">Lagoon</text>
        {/* Slope/Basin */}
        <text x="400" y="270" fill="#64748b" fontSize="8" textAnchor="middle" className="font-black uppercase italic">Basin</text>
      </svg>
    </div>
  );
}

// ─── Shared Components ──────────────────────────────────────────────────────

function DetailCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass-card p-6 rounded-3xl border-emerald-500/10 bg-emerald-500/5 hover:border-emerald-500/30 transition-all">
      <h5 className="text-[11px] font-black uppercase tracking-widest text-emerald-500 mb-4">{title}</h5>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <div className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[11px] text-slate-300 leading-relaxed font-medium">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
