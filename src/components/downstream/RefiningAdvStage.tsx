import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Factory, 
  FlaskConical, 
  Beaker, 
  TrendingUp, 
  LayoutDashboard,
  Zap,
  Box,
  FastForward,
  Droplet,
  Flame,
  Gauge,
  Database,
  Activity
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

type RefiningTab = 
  | 'ph1' | 'ph2' | 'ph3' | 'ph4';

export default function RefiningAdvStage() {
  const [activeTab, setActiveTab] = useState<RefiningTab>('ph1');
  const tabs = [
    { id: 'ph1' as RefiningTab, label: 'Ph.1: Crude Assay', icon: FlaskConical },
    { id: 'ph2' as RefiningTab, label: 'Ph.2: Processes', icon: Factory },
    { id: 'ph3' as RefiningTab, label: 'Ph.3: Products', icon: Beaker },
    { id: 'ph4' as RefiningTab, label: 'Ph.4: Economics', icon: TrendingUp },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/20">
        <Factory className="text-orange-400" size={20} />
        <span className="text-white font-black italic text-lg tracking-tight mr-6 uppercase">Downstream Refining & Processing</span>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === t.id
                ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'ph1' && <Phase1Assay />}
            {activeTab === 'ph2' && <Phase2Processes />}
            {activeTab === 'ph3' && <Phase3Products />}
            {activeTab === 'ph4' && <Phase4Economics />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Phase Components ────────────────────────────────────────────────────────

function DistillationColumn3D() {
  return (
    <div className="w-full h-full max-w-[400px] flex items-center justify-center">
      <svg viewBox="0 0 300 400" className="w-full h-full drop-shadow-2xl">
        {/* Main Column Body */}
        <motion.path 
          d="M 120 50 H 180 V 350 H 120 Z" 
          fill="#1e293b" stroke="#f97316" strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2 }}
        />
        
        {/* Trays/Fractures */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <g key={i}>
            <line x1="120" y1={80 + i*50} x2="180" y2={80 + i*50} stroke="#f97316" strokeWidth="1" strokeOpacity="0.5" />
            {/* Heat Bubbles */}
            {[0, 1, 2].map(j => (
              <motion.circle 
                key={j} r="2" fill="#f97316"
                animate={{ 
                  cx: [130 + j*20, 130 + j*20],
                  cy: [100 + i*50, 60 + i*50],
                  opacity: [0, 1, 0]
                }}
                transition={{ repeat: Infinity, duration: 2, delay: i*0.3 + j*0.5 }}
              />
            ))}
          </g>
        ))}

        {/* Output Pipes */}
        <path d="M 180 80 H 250" stroke="#f97316" strokeWidth="2" strokeDasharray="4 2" />
        <path d="M 180 180 H 250" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
        <path d="M 180 280 H 250" stroke="#ea580c" strokeWidth="2" strokeDasharray="4 2" />

        <text x="260" y="85" fill="#f97316" fontSize="8" className="font-black italic uppercase">Light Ends</text>
        <text x="260" y="185" fill="#f59e0b" fontSize="8" className="font-black italic uppercase">Distillates</text>
        <text x="260" y="285" fill="#ea580c" fontSize="8" className="font-black italic uppercase">Residue</text>

        {/* Heat Glow at Bottom */}
        <motion.ellipse 
          cx="150" cy="350" rx="40" ry="10" 
          fill="#f97316" fillOpacity="0.2"
          animate={{ fillOpacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        />
      </svg>
    </div>
  );
}

function Phase1Assay() {
  const tbpData = [
    { vol: 0, temp: 80 },
    { vol: 10, temp: 150 },
    { vol: 30, temp: 280 },
    { vol: 50, temp: 420 },
    { vol: 70, temp: 610 },
    { vol: 90, temp: 850 },
    { vol: 100, temp: 1050 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <FlaskConical className="text-orange-400" size={36} />
             Phase 1: Crude Oil <span className="text-orange-400/50">Assay</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">API Gravity · Sulfur · PNA · Distillation</p>
        </div>
        <div className="flex gap-8">
           <div className="text-right">
              <p className="text-3xl font-black text-orange-400 italic">32.4°</p>
              <p className="text-[11px] text-slate-500 uppercase font-bold">API Gravity</p>
           </div>
           <div className="text-right">
              <p className="text-3xl font-black text-white italic">0.42%</p>
              <p className="text-[11px] text-slate-500 uppercase font-bold">Sulfur Content</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] relative overflow-hidden">
               <div className="flex justify-between items-center mb-8 relative z-10">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic flex items-center gap-2">
                     <Activity size={16} className="text-orange-500" />
                     True Boiling Point (TBP) Column Profile
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Atmospheric Distillation Unit</span>
               </div>
               <div className="h-[300px] flex items-center justify-center">
                  <DistillationColumn3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-orange-500/5 border-orange-500/10 flex-1 flex flex-col justify-center text-center">
               <Database size={48} className="text-orange-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Chemical Fingerprint</h4>
               <div className="space-y-3 mt-4">
                  {[
                    { label: 'Paraffins', val: 42 },
                    { label: 'Naphthenes', val: 38 },
                    { label: 'Aromatics', val: 20 },
                  ].map(p => (
                    <div key={p.label}>
                       <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                          <span className="text-slate-400">{p.label}</span>
                          <span className="text-white">{p.val}%</span>
                       </div>
                       <div className="w-full h-1 bg-white/5 rounded-full">
                          <div className="h-full bg-orange-500" style={{ width: `${p.val}%` }} />
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

function ReactorUnit3D() {
  return (
    <div className="w-full h-full max-w-[400px]">
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {/* Reactor Vessel */}
        <rect x="150" y="50" width="100" height="200" rx="50" fill="#0f172a" stroke="#f97316" strokeWidth="3" />
        
        {/* Catalyst Bed */}
        <motion.rect 
          x="153" y="150" width="94" height="60" fill="#f97316" fillOpacity="0.1"
          animate={{ fillOpacity: [0.1, 0.3, 0.1] }}
          transition={{ repeat: Infinity, duration: 4 }}
        />
        
        {/* Particle Flow */}
        {[0, 1, 2, 3, 4].map(i => (
          <motion.circle 
            key={i} r="3" fill="#f97316"
            animate={{ 
              cx: [170 + i*15, 170 + i*15],
              cy: [80, 220],
              opacity: [0, 1, 0]
            }}
            transition={{ repeat: Infinity, duration: 3, delay: i * 0.6 }}
          />
        ))}

        {/* Temperature Indicators */}
        <text x="260" y="70" fill="#f97316" fontSize="10" className="font-black italic">TOP: 450°C</text>
        <text x="260" y="240" fill="#ea580c" fontSize="10" className="font-black italic">BTM: 520°C</text>

        {/* Heat Pulse */}
        <motion.circle 
          cx="200" cy="180" r="40" fill="#f97316" fillOpacity="0.05"
          animate={{ r: [30, 50, 30], fillOpacity: [0.05, 0.15, 0.05] }}
          transition={{ repeat: Infinity, duration: 5 }}
        />
      </svg>
    </div>
  );
}

function Phase2Processes() {
  const conversionData = [
    { unit: 'ADU', conv: 100, color: '#f97316' },
    { unit: 'FCC', conv: 82, color: '#fbbf24' },
    { unit: 'HCU', conv: 95, color: '#f59e0b' },
    { unit: 'Coker', conv: 75, color: '#ea580c' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Factory className="text-orange-400" size={36} />
             Phase 2: Refining <span className="text-orange-400/50">Processes</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Distillation · Cracking · Reforming · Coking</p>
        </div>
        <div className="px-6 py-2 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-center">
           <p className="text-[10px] font-black text-white uppercase tracking-widest">Reactor Temp</p>
           <p className="text-2xl font-black text-orange-400 italic">980°F</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] relative overflow-hidden">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Zap size={16} className="text-orange-500" />
                  Unit Conversion Kinetics & Catalyst Load
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <ReactorUnit3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-orange-500/5 border-orange-500/10 flex-1 flex flex-col justify-center text-center">
               <Activity size={48} className="text-orange-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Catalyst Activity</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">92%</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active - Optimal Regeneration</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function ProductFlowNetwork3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Storage Tanks */}
        {[0, 1, 2].map(i => (
          <g key={i}>
            <motion.rect 
              x={50 + i*150} y="150" width="80" height="60" rx="10" 
              fill="#1e293b" stroke="#f97316" strokeWidth="2"
              whileHover={{ scale: 1.05, strokeWidth: 3 }}
            />
            {/* Fill Level */}
            <motion.rect 
              x={52 + i*150} y={208 - (40 + i*10)} width="76" height={40 + i*10} rx="8" 
              fill="#f97316" fillOpacity="0.2"
              animate={{ fillOpacity: [0.1, 0.3, 0.1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />
          </g>
        ))}

        {/* Connecting Pipes */}
        <path d="M 130 180 H 200" stroke="#f97316" strokeWidth="3" strokeOpacity="0.3" />
        <path d="M 280 180 H 350" stroke="#f97316" strokeWidth="3" strokeOpacity="0.3" />

        {/* Flow Particles */}
        {[0, 1, 2, 3].map(i => (
          <motion.circle 
            key={i} r="4" fill="#f97316"
            animate={{ 
              cx: [50, 450],
              opacity: [0, 1, 0]
            }}
            transition={{ repeat: Infinity, duration: 6, delay: i * 1.5, ease: "linear" }}
          />
        ))}

        <text x="90" y="235" fill="#f97316" fontSize="8" textAnchor="middle" className="font-black uppercase italic">CDU Feed</text>
        <text x="240" y="235" fill="#f97316" fontSize="8" textAnchor="middle" className="font-black uppercase italic">FCC Unit</text>
        <text x="390" y="235" fill="#f97316" fontSize="8" textAnchor="middle" className="font-black uppercase italic">Product Pool</text>
      </svg>
    </div>
  );
}

function Phase3Products() {
  const yieldData = [
    { name: 'Gasoline', val: 45, color: '#fbbf24' },
    { name: 'Diesel', val: 30, color: '#f59e0b' },
    { name: 'Jet Fuel', val: 12, color: '#ea580c' },
    { name: 'Fuel Oil', val: 8, color: '#9a3412' },
    { name: 'LPG', val: 5, color: '#f97316' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Beaker className="text-orange-400" size={36} />
             Phase 3: Refined <span className="text-orange-400/50">Products</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Yield Profile · Specs · Transport Fuels</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-white italic">98.2</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Research Octane (RON)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] relative overflow-hidden">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Box size={16} className="text-orange-500" />
                  Product Yield Flow Network 3D
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <ProductFlowNetwork3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-orange-500/5 border-orange-500/10 flex-1 flex flex-col justify-center">
               <h4 className="text-xs font-black text-white uppercase italic mb-6 text-center">Product Quality Specs</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center px-4 py-3 bg-black/20 rounded-2xl border border-white/5">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">Diesel Cetane</span>
                     <span className="text-orange-400 font-black italic text-lg">52.4</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-black/20 rounded-2xl border border-white/5">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">Jet Flash Pt</span>
                     <span className="text-white font-black italic text-lg">42°C</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-black/20 rounded-2xl border border-white/5">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">VLSFO Sulfur</span>
                     <span className="text-emerald-400 font-black italic text-lg">&lt;0.5%</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function EconomicComplexity2D() {
  const data = [
    { label: 'Hydroskimming', margin: 4.2, color: '#f97316' },
    { label: 'Cracking', margin: 7.8, color: '#fbbf24' },
    { label: 'High Conversion', margin: 10.5, color: '#ea580c' },
  ];

  return (
    <div className="w-full h-full max-w-[500px] flex flex-col justify-center px-10">
      <div className="space-y-8">
        {data.map((d, i) => (
          <div key={d.label} className="group">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{d.label}</span>
              <span className="text-xl font-black text-white italic italic tracking-tighter">${d.margin} <span className="text-[10px] text-slate-500 uppercase">/ bbl</span></span>
            </div>
            <div className="relative h-12 w-full bg-white/5 rounded-2xl overflow-hidden border border-white/5 group-hover:border-white/10 transition-all">
              <motion.div 
                className="absolute top-0 left-0 h-full shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                style={{ backgroundColor: d.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(d.margin / 12) * 100}%` }}
                transition={{ duration: 1, delay: i * 0.1, ease: "circOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
              </motion.div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest border-t border-white/5 pt-4">
        <span>Low Complexity</span>
        <span>High Complexity</span>
      </div>
    </div>
  );
}

function Phase4Economics() {
  const marginData = [
    { month: 'Jan', margin: 6.2 },
    { month: 'Feb', margin: 7.1 },
    { month: 'Mar', margin: 8.5 },
    { month: 'Apr', margin: 7.8 },
    { month: 'May', margin: 9.2 },
    { month: 'Jun', margin: 10.5 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <TrendingUp className="text-orange-400" size={36} />
             Phase 4: Refinery <span className="text-orange-400/50">Economics</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Crack Spread · Net Margin · Utilization</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-orange-400 italic">$10.50</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Net Margin / Barrel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] relative overflow-hidden">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <TrendingUp size={16} className="text-orange-500" />
                  Refinery Economic Complexity vs Margin
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <EconomicComplexity2D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-orange-500/5 border-orange-500/10 flex-1 flex flex-col justify-center text-center">
               <Gauge size={48} className="text-orange-400 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Nelson Complexity</h4>
               <p className="text-5xl font-black text-white italic tracking-tighter mb-2">12.8</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">High Conversion Capability</p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── Shared Components ──────────────────────────────────────────────────────

function DetailCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass-card p-6 rounded-3xl border-white/5 bg-orange-400/5 hover:border-orange-400/30 transition-all">
      <h5 className="text-[11px] font-black uppercase tracking-widest text-orange-400 mb-4">{title}</h5>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <div className="mt-1.5 w-1 h-1 rounded-full bg-orange-400 shrink-0" />
            <span className="text-[11px] text-slate-300 leading-relaxed font-medium">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
