import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, 
  DollarSign, 
  Calendar, 
  FileText, 
  ShieldAlert, 
  Users, 
  LayoutDashboard,
  Zap,
  Box,
  FastForward,
  Layers,
  TrendingUp,
  Target,
  Activity,
  Database,
  ArrowRight,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { cn } from '../../lib/utils';

type ProjectTab = 
  | 'ph1' | 'ph2' | 'ph3' | 'ph4' | 'ph5' | 'ph6';

export default function ProjectAdvStage() {
  const [activeTab, setActiveTab] = useState<ProjectTab>('ph1');
  const tabs = [
    { id: 'ph1' as ProjectTab, label: 'Ph.1: Lifecycle', icon: Layers },
    { id: 'ph2' as ProjectTab, label: 'Ph.2: Cost Control', icon: DollarSign },
    { id: 'ph3' as ProjectTab, label: 'Ph.3: Scheduling', icon: Calendar },
    { id: 'ph4' as ProjectTab, label: 'Ph.4: Contracting', icon: FileText },
    { id: 'ph5' as ProjectTab, label: 'Ph.5: Risk Mgmt', icon: ShieldAlert },
    { id: 'ph6' as ProjectTab, label: 'Ph.6: Stakeholders', icon: Users },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/20">
        <ClipboardList className="text-rose-500" size={20} />
        <span className="text-white font-black italic text-lg tracking-tight mr-6 uppercase">Oil & Gas Project Management</span>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === t.id
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20'
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
            {activeTab === 'ph1' && <Phase1Lifecycle />}
            {activeTab === 'ph2' && <Phase2Cost />}
            {activeTab === 'ph3' && <Phase3Schedule />}
            {activeTab === 'ph4' && <Phase4Contracting />}
            {activeTab === 'ph5' && <Phase5Risk />}
            {activeTab === 'ph6' && <Phase6Stakeholders />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Phase Components ────────────────────────────────────────────────────────

function Phase1Lifecycle() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Layers className="text-rose-500" size={36} />
             Phase 1: Project <span className="text-rose-500/50">Lifecycle</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">FEL 1-3 · Stage-Gate · FEED · Commissioning</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-rose-500 italic">FEL-3</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Current Maturity Stage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] flex items-center justify-center relative overflow-hidden">
               <ProjectLifecycle3D />
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-rose-500/5 border-rose-500/10 flex-1 flex flex-col justify-center text-center">
               <Zap size={48} className="text-rose-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Stage-Gate Status</h4>
               <p className="text-2xl font-black text-white italic tracking-tighter mb-2">GATE 3: IN-PROGRESS</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  "Execution funding approval pending technical FEED validation."
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase2Cost() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <DollarSign className="text-rose-500" size={36} />
             Phase 2: Cost <span className="text-rose-500/50">Estimation & Control</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Class 1-5 · EVM · CPI/SPI · Change Management</p>
        </div>
        <div className="flex gap-8">
           <div className="text-right">
              <p className="text-3xl font-black text-rose-500 italic">0.98</p>
              <p className="text-[11px] text-slate-500 uppercase font-bold">CPI (Cost Performance)</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] flex items-center justify-center relative overflow-hidden">
               <CostControl3D />
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-rose-500/5 border-rose-500/10 flex-1 flex flex-col justify-center text-center">
               <TrendingUp size={48} className="text-rose-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Estimate Accuracy</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">±15%</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  "Current project alignment with AACE Class 3 standards."
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase3Schedule() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Calendar className="text-rose-500" size={36} />
             Phase 3: Schedule <span className="text-rose-500/50">Management</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">WBS · CPM · Monte Carlo · Float · Crashing</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-white italic">7.2 <span className="text-sm">Mos</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Est. Duration Remaining</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] flex items-center justify-center relative overflow-hidden">
               <ScheduleManagement3D />
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-rose-500/5 border-rose-500/10 flex-1 flex flex-col justify-center">
               <h4 className="text-xs font-black text-white uppercase italic mb-6">Critical Path Analysis</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center px-4 py-3 bg-black/20 rounded-2xl border border-white/5">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">Total Float</span>
                     <span className="text-rose-400 font-black italic text-lg">12 DAYS</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-black/20 rounded-2xl border border-white/5">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">Critical Tasks</span>
                     <span className="text-white font-black italic text-lg">42</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase4Contracting() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <FileText className="text-rose-500" size={36} />
             Phase 4: <span className="text-rose-500/50">Contracting Strategy</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">EPC · EPCM · Lump Sum · FIDIC · Alliance</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-white italic">EPC <span className="text-sm">Lump Sum</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Selected Execution Model</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <ContractingStrategy3D />
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-rose-500/5 border-rose-500/10 flex-1 flex flex-col justify-center">
               <h4 className="text-xs font-black text-white uppercase italic mb-6 text-center">Legal & Commercial Status</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center px-4 py-3 bg-black/20 rounded-2xl border border-white/5">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">LD Exposure</span>
                     <span className="text-rose-400 font-black italic text-lg">$2.4MM</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-black/20 rounded-2xl border border-white/5">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">FIDIC Form</span>
                     <span className="text-white font-black italic text-lg">SILVER BOOK</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-black/20 rounded-2xl border border-white/5">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">Claims Value</span>
                     <span className="text-amber-400 font-black italic text-lg">$450K</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase5Risk() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <ShieldAlert className="text-rose-500" size={36} />
             Phase 5: <span className="text-rose-500/50">Risk Management</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Risk Register · Monte Carlo · Mitigation · Response</p>
        </div>
        <div className="px-6 py-2 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
           <span className="text-[10px] font-black text-white uppercase tracking-widest">Risk Level: ELEVATED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] flex items-center justify-center relative overflow-hidden">
               <RiskManagement3D />
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-rose-500/5 border-rose-500/10 flex-1 flex flex-col justify-center text-center">
               <Box size={48} className="text-rose-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Contingency Reserve</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">$12.4 <span className="text-sm">MM</span></p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">35% UTILIZED</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase6Stakeholders() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Users className="text-rose-500" size={36} />
             Phase 6: <span className="text-rose-500/50">Stakeholder Management</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Government · Community · NGOs · JV Partners</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-emerald-500 italic">POSITIVE</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Social License Status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <StakeholderInfluence3D />
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-rose-500/5 border-rose-500/10 flex-1 flex flex-col justify-center text-center">
               <Target size={48} className="text-rose-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Social License Index</h4>
               <p className="text-5xl font-black text-white italic tracking-tighter mb-2">8.2</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Stable Community Relations</p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── 3D Visualizers ─────────────────────────────────────────────────────────

function ProjectLifecycle3D() {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[500px]">
      <defs>
        <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
      </defs>
      {/* Stage Gates */}
      {[0, 1, 2, 3].map(i => (
        <motion.g 
          key={i}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.2 }}
        >
          {/* Box shadow/glow */}
          <rect x={100 + i*80} y={100} width="60" height="80" fill="#f43f5e" fillOpacity={0.05} rx="8" />
          {/* Main Block */}
          <motion.path 
            d={`M ${100 + i*80} 140 L ${130 + i*80} 120 L ${160 + i*80} 140 L ${130 + i*80} 160 Z`}
            fill={i < 3 ? "url(#roseGrad)" : "#1e293b"}
            stroke="#f43f5e"
            strokeWidth={i === 2 ? 2 : 1}
            animate={i === 2 ? { y: [0, -10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          />
          {/* Connecting Lines */}
          {i < 3 && (
            <motion.path 
              d={`M ${160 + i*80} 140 L ${180 + i*80} 140`}
              stroke="#f43f5e"
              strokeDasharray="4,2"
              animate={{ strokeDashoffset: [0, -10] }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
          )}
          <text x={130 + i*80} y={180} fill={i < 3 ? "#f43f5e" : "#475569"} fontSize="8" textAnchor="middle" className="font-black uppercase tracking-tighter">
            {i === 3 ? 'EPC' : `FEL ${i+1}`}
          </text>
        </motion.g>
      ))}
      {/* Gate Markers */}
      {[0, 1, 2].map(i => (
        <motion.g key={`gate-${i}`} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2, delay: i }}>
          <circle cx={170 + i*80} cy={140} r="3" fill="#f43f5e" />
          <path d={`M ${170 + i*80} 130 L ${170 + i*80} 150`} stroke="#f43f5e" strokeWidth="1" />
        </motion.g>
      ))}
      <text x="250" y="260" fill="#f43f5e" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">FEL Stage-Gate Progression Engine</text>
    </svg>
  );
}

function CostControl3D() {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[500px]">
      <g transform="translate(100, 50)">
        {/* Planned Path */}
        <motion.path 
          d="M 0 200 Q 150 180 300 50"
          fill="none"
          stroke="#475569"
          strokeWidth="4"
          strokeDasharray="10,5"
          opacity="0.3"
        />
        {/* Actual Path */}
        <motion.path 
          d="M 0 200 Q 150 200 300 70"
          fill="none"
          stroke="#f43f5e"
          strokeWidth="6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2 }}
        />
        {/* Kinetic Stacks (EVM Layers) */}
        {[0, 1, 2, 3, 4].map(i => (
          <motion.g 
            key={i} 
            transform={`translate(${i * 70}, 0)`}
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: i * 0.2 }}
          >
            {/* Base */}
            <path d="M -20 200 L 0 190 L 20 200 L 0 210 Z" fill="#1e293b" stroke="#f43f5e" strokeOpacity="0.2" />
            {/* Planned volume (Transparent) */}
            <rect x="-10" y={200 - (i+1)*30} width="20" height={(i+1)*30} fill="#475569" fillOpacity="0.1" stroke="#475569" strokeWidth="1" strokeOpacity="0.2" />
            {/* Actual volume (Solid) */}
            <rect x="-8" y={200 - (i+1)*28} width="16" height={(i+1)*28} fill="#f43f5e" fillOpacity="0.3" stroke="#f43f5e" strokeWidth="1" />
          </motion.g>
        ))}
      </g>
      <text x="250" y="270" fill="#f43f5e" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">EVM Planned vs Actual Value Stacks</text>
    </svg>
  );
}

function ScheduleManagement3D() {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[500px]">
      <g transform="translate(50, 50)">
        {/* S-Curve Path in 3D */}
        <motion.path 
          d="M 0 200 Q 100 200 200 100 T 400 0"
          fill="none"
          stroke="#f43f5e"
          strokeWidth="8"
          strokeOpacity="0.1"
          strokeLinecap="round"
        />
        {/* Kinetic Progress Sphere */}
        <motion.circle 
          r="10"
          fill="#f43f5e"
          animate={{ 
            cx: [0, 100, 200, 300, 400],
            cy: [200, 200, 100, 0, 0],
            opacity: [1, 1, 1, 0, 0]
          }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        />
        {/* Milestones */}
        {[100, 200, 300].map(x => (
          <g key={x} transform={`translate(${x}, ${x === 100 ? 200 : x === 200 ? 100 : 0})`}>
            <circle r="4" fill="#f43f5e" />
            <motion.circle 
              r="8" fill="none" stroke="#f43f5e" 
              animate={{ scale: [1, 2], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </g>
        ))}
        {/* Gantt Bars floating */}
        {[0, 1, 2].map(i => (
          <motion.rect 
            key={i}
            x={50 + i*100} y={150 - i*50} width="80" height="12"
            fill="#1e293b"
            stroke="#f43f5e"
            strokeWidth="1"
            rx="4"
            animate={{ x: [50 + i*100, 60 + i*100, 50 + i*100] }}
            transition={{ repeat: Infinity, duration: 4, delay: i }}
          />
        ))}
      </g>
      <text x="250" y="270" fill="#f43f5e" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Dynamic CPM Path & S-Curve Pulse</text>
    </svg>
  );
}

function ContractingStrategy3D() {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[500px]">
      <g transform="translate(250, 150)">
        {/* Isometric Donut / Cylinder */}
        {[2, 1, 0].map(layer => (
          <motion.g 
            key={layer}
            animate={{ y: [layer*20, layer*20 - 5, layer*20] }}
            transition={{ repeat: Infinity, duration: 5, delay: layer * 0.5 }}
          >
            {/* Back Half */}
            <path d="M -100 0 A 100 50 0 0 1 100 0 L 80 0 A 80 40 0 0 0 -80 0 Z" fill="#1e293b" stroke="#f43f5e" strokeOpacity="0.2" />
            {/* Slices */}
            <path d="M -100 0 A 100 50 0 0 0 0 50 L 0 40 A 80 40 0 0 1 -80 0 Z" fill="#f43f5e" fillOpacity={0.6} stroke="#f43f5e" />
            <path d="M 0 50 A 100 50 0 0 0 100 0 L 80 0 A 80 40 0 0 1 0 40 Z" fill="#fb7185" fillOpacity={0.4} stroke="#fb7185" />
            {/* Labels floating */}
            <motion.text x="-120" y="-20" fill="#f43f5e" fontSize="10" className="font-black italic uppercase tracking-widest">Lump Sum</motion.text>
            <motion.text x="80" y="60" fill="#fb7185" fontSize="10" className="font-black italic uppercase tracking-widest">Reimbursable</motion.text>
          </motion.g>
        ))}
      </g>
      <text x="250" y="280" fill="#f43f5e" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Contract Model Allocation Cylinder</text>
    </svg>
  );
}

function RiskManagement3D() {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[500px]">
      <g transform="translate(100, 50) skewX(-20)">
        {/* Risk Grid */}
        {[0, 1, 2, 3, 4].map(i => (
          <React.Fragment key={i}>
            <line x1="0" y1={i*40} x2="200" y2={i*40} stroke="#475569" strokeOpacity="0.2" />
            <line x1={i*40} y1="0" x2={i*40} y2="200" stroke="#475569" strokeOpacity="0.2" />
          </React.Fragment>
        ))}
        {/* Risk Pillars */}
        {[
          { x: 40, y: 40, h: 40, color: "#f43f5e" },
          { x: 120, y: 80, h: 80, color: "#e11d48" },
          { x: 80, y: 160, h: 30, color: "#fb7185" },
          { x: 160, y: 40, h: 100, color: "#9f1239" },
        ].map((p, idx) => (
          <motion.g 
            key={idx} 
            transform={`translate(${p.x}, ${p.y})`}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: idx * 0.2 }}
          >
            <rect x="-10" y={-p.h} width="20" height={p.h} fill={p.color} fillOpacity={0.6} stroke={p.color} />
            <path d={`M -10 ${-p.h} L 0 ${-p.h-10} L 10 ${-p.h} L 0 ${-p.h+10} Z`} fill={p.color} stroke={p.color} />
            <motion.circle 
              cy={-p.h-20} r="4" fill={p.color}
              animate={{ opacity: [0, 1, 0], scale: [1, 2, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: idx }}
            />
          </motion.g>
        ))}
      </g>
      <text x="250" y="280" fill="#f43f5e" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Probabilistic Risk Impact Terrain</text>
    </svg>
  );
}

function StakeholderInfluence3D() {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[500px]">
      <g transform="translate(250, 150)">
        {/* Central Project Hub */}
        <motion.circle 
          r="15" fill="#f43f5e" 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ repeat: Infinity, duration: 4 }}
        />
        <circle r="30" fill="none" stroke="#f43f5e" strokeOpacity="0.2" strokeDasharray="5,5" />
        
        {/* Stakeholder Nodes */}
        {[0, 1, 2, 3, 4].map(i => {
          const angle = (i * 72) * (Math.PI / 180);
          const dist = 80 + Math.sin(i) * 20;
          const x = Math.cos(angle) * dist;
          const y = Math.sin(angle) * dist;
          return (
            <motion.g 
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.3 }}
            >
              {/* Connecting Tension Line */}
              <motion.line 
                x1="0" y1="0" x2={x} y2={y} 
                stroke="#f43f5e" 
                strokeWidth="1" 
                strokeOpacity="0.3"
                animate={{ strokeDashoffset: [0, 20] }}
                strokeDasharray="4,2"
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              />
              {/* Node */}
              <motion.g 
                animate={{ y: [y, y-10, y] }}
                transition={{ repeat: Infinity, duration: 3, delay: i }}
              >
                <circle cx={x} cy={y} r="8" fill="#1e293b" stroke="#f43f5e" strokeWidth="2" />
                <circle cx={x} cy={y} r="15" fill="none" stroke="#f43f5e" strokeOpacity="0.1" />
                <text x={x} y={y + 20} fill="#f43f5e" fontSize="8" textAnchor="middle" className="font-black uppercase tracking-tighter">
                  {['Govt', 'NGOs', 'Media', 'Partners', 'Community'][i]}
                </text>
              </motion.g>
            </motion.g>
          );
        })}
      </g>
      <text x="250" y="280" fill="#f43f5e" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Stakeholder Influence Network Web</text>
    </svg>
  );
}
