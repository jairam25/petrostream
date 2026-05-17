import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRightLeft, 
  Droplets, 
  Construction, 
  ShieldCheck, 
  Activity, 
  Settings, 
  Wind,
  Layers,
  Zap,
  Box,
  LayoutDashboard,
  FastForward,
  Filter,
  Navigation
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Database, Search, Target } from 'lucide-react';

type PipelineTab = 
  | 'ph1' | 'ph2' | 'ph3' | 'ph4' | 'ph5' | 'ph6';

export default function PipelineAdvStage() {
  const [activeTab, setActiveTab] = useState<PipelineTab>('ph1');
  const tabs = [
    { id: 'ph1' as PipelineTab, label: 'Ph.1: Design', icon: Layers },
    { id: 'ph2' as PipelineTab, label: 'Ph.2: Hydraulics', icon: Droplets },
    { id: 'ph3' as PipelineTab, label: 'Ph.3: Construction', icon: Construction },
    { id: 'ph4' as PipelineTab, label: 'Ph.4: Integrity', icon: ShieldCheck },
    { id: 'ph5' as PipelineTab, label: 'Ph.5: Operations', icon: Activity },
    { id: 'ph6' as PipelineTab, label: 'Ph.6: Gas Proc', icon: Filter },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/20">
        <ArrowRightLeft className="text-slate-400" size={20} />
        <span className="text-white font-black italic text-lg tracking-tight mr-6 uppercase">Advanced Pipeline Engineering</span>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === t.id
                ? 'bg-slate-400 text-black shadow-lg shadow-slate-400/20'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            )}
          >
            <t.icon size={13} />{t.label}
          </button>
        ))}
        <div className="flex-1" />
        <button 
          onClick={() => {
            const content = `PETROSTREAM PIPELINE ENGINEERING REPORT\nGenerated: ${new Date().toLocaleString()}\nModule: Midstream Operations\n\n1. DESIGN: Wall thickness calculations (ASME B31.8)\n2. HYDRAULICS: Flow Profile Analysis (Stable)\n3. INTEGRITY: Intelligent Pigging Data (0 Anomalies)\n4. CONSTRUCTION: S-Curve Progress (85% Completion)\n\nEnd of Summary.`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Pipeline_Engineering_Report.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
        >
          <FastForward size={14} />
          Generate Report
        </button>
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
            {activeTab === 'ph1' && <Phase1Design />}
            {activeTab === 'ph2' && <Phase2Hydraulics />}
            {activeTab === 'ph3' && <Phase3Construction />}
            {activeTab === 'ph4' && <Phase4Integrity />}
            {activeTab === 'ph5' && <Phase5Operations />}
            {activeTab === 'ph6' && <Phase6GasProcessing />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Phase Components ────────────────────────────────────────────────────────

function Phase1Design() {
  const sizingData = [
    { flow: 1000, pd: 120 },
    { flow: 2000, pd: 245 },
    { flow: 3000, pd: 410 },
    { flow: 4000, pd: 650 },
    { flow: 5000, pd: 920 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Layers className="text-slate-400" size={36} />
             Phase 1: Pipeline <span className="text-slate-400/50">Design</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Wall Thickness · API 5L · Barlow Formula · Material Selection</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-slate-400 italic">24 <span className="text-sm">IN</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Nominal Pipe Diameter</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-slate-400" />
                  Pressure Drop (ΔP) vs. Flow Rate Analysis
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <PipelineDesign3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-slate-400/5 border-slate-400/10 flex-1 flex flex-col justify-center text-center">
               <ShieldCheck size={48} className="text-slate-400 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Wall Thickness (t)</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">0.625 <span className="text-sm">IN</span></p>
               <div className="px-3 py-1 bg-slate-400/10 rounded-full border border-slate-400/20 inline-block mx-auto">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">API 5L X70 GRADE</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase2Hydraulics() {
  const flowRegime = [
    { vel: 1, hold: 0.1, name: 'Stratified' },
    { vel: 2, hold: 0.3, name: 'Slug' },
    { vel: 4, hold: 0.5, name: 'Annular' },
    { vel: 5, hold: 0.7, name: 'Dispersed' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Droplets className="text-slate-400" size={36} />
             Phase 2: Pipeline <span className="text-slate-400/50">Hydraulics</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Liquid Flow · Gas Flow · Multiphase · Surge Analysis</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-slate-400 italic">2.4 <span className="text-sm">m/s</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Inlet Velocity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-slate-400" />
                  Multiphase Flow Regime Mapping
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <FlowDynamics3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-slate-400/5 border-slate-400/10 flex-1 flex flex-col justify-center text-center">
               <Zap size={48} className="text-slate-400 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Reynolds Number</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">4.5e5</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Turbulent Flow Regime</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase3Construction() {
  const constructionS = [
    { day: 'D10', planned: 5, actual: 4 },
    { day: 'D20', planned: 15, actual: 12 },
    { day: 'D30', planned: 35, actual: 28 },
    { day: 'D40', planned: 60, actual: 55 },
    { day: 'D50', planned: 85, actual: 82 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Construction className="text-slate-400" size={36} />
             Phase 3: Pipeline <span className="text-slate-400/50">Construction</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Route Selection · Trenching · Welding · Coating · HDD</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-slate-400 italic">82%</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Total Progress (S-Curve)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-slate-400" />
                  Construction S-Curve (Planned vs. Actual)
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <ConstructionScene3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-slate-400/5 border-slate-400/10 flex-1 flex flex-col justify-center text-center">
               <Navigation size={48} className="text-slate-400 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Current Activity</h4>
               <p className="text-2xl font-black text-white italic tracking-tighter mb-2">HDD RIVER CROSSING</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Section 4A / Unit 12</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase4Integrity() {
  const metalLoss = [
    { dist: 0, loss: 5 },
    { dist: 100, loss: 12 },
    { dist: 250, loss: 45 },
    { dist: 400, loss: 8 },
    { dist: 550, loss: 15 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <ShieldCheck className="text-slate-400" size={36} />
             Phase 4: Pipeline <span className="text-slate-400/50">Integrity</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Smart Pigging · Cathodic Protection · Risk Assessment</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-rose-500 italic">CRITICAL</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Anomaly Detection Status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Search size={16} className="text-slate-400" />
                  MFL Smart Pigging: Metal Loss Heatmap (%)
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <PIGSimulator3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-slate-400/5 border-slate-400/10 flex-1 flex flex-col justify-center text-center">
               <Target size={48} className="text-slate-400 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Cathodic Protection</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">-1.15 <span className="text-sm">mV</span></p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Rectifier Status</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase5Operations() {
  const opTrend = [
    { hour: '00:00', press: 850, flow: 4500 },
    { hour: '04:00', press: 842, flow: 4420 },
    { hour: '08:00', press: 865, flow: 4680 },
    { hour: '12:00', press: 855, flow: 4550 },
    { hour: '16:00', press: 848, flow: 4490 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Activity className="text-slate-400" size={36} />
             Phase 5: Pipeline <span className="text-slate-400/50">Operations</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">SCADA · Leak Detection · Batching · Line Pack</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-emerald-500 italic">NOMINAL</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">SCADA System Health</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-slate-400" />
                  Real-time Pressure & Flow Telemetry
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <ControlNetwork3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-slate-400/5 border-slate-400/10 flex-1 flex flex-col justify-center text-center">
               <Database size={48} className="text-slate-400 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Line Pack Vol</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">12.4 <span className="text-sm">MMcf</span></p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Inventory Management</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase6GasProcessing() {
  const gasMix = [
    { name: 'Methane', val: 82, color: '#94a3b8' },
    { name: 'Ethane', val: 8, color: '#64748b' },
    { name: 'Propane', val: 5, color: '#475569' },
    { name: 'Butane', val: 3, color: '#334155' },
    { name: 'Acid Gas', val: 2, color: '#1e293b' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Filter className="text-slate-400" size={36} />
             Phase 6: Gas Gathering <span className="text-slate-400/50">& Processing</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Gathering · Dehydration · NGL Recovery · Sweetening</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-slate-400 italic">94% <span className="text-sm">Ethane</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">NGL Recovery Efficiency</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Database size={16} className="text-slate-400" />
                  Gas Composition Analysis (Mole %)
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <GasProcessing3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-slate-400/5 border-slate-400/10 flex-1 flex flex-col justify-center">
               <h4 className="text-xs font-black text-white uppercase italic mb-6 text-center">Inlet Impurities</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center px-4 py-3 bg-black/20 rounded-2xl border border-white/5">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">H2S Content</span>
                     <span className="text-slate-400 font-black italic text-lg">4 PPM</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-black/20 rounded-2xl border border-white/5">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">Water Dew Point</span>
                     <span className="text-white font-black italic text-lg">-25°C</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── 3D Visualizer Components ──────────────────────────────────────────────

function PipelineDesign3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Isometric Pipe Cross Section */}
        <motion.path 
          d="M 150 150 A 100 50 0 1 1 350 150 A 100 50 0 1 1 150 150"
          fill="none" stroke="#94a3b8" strokeWidth="20" strokeOpacity="0.2"
        />
        <motion.path 
          d="M 170 150 A 80 40 0 1 1 330 150 A 80 40 0 1 1 170 150"
          fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="10 5"
        />
        {/* Wall Thickness Arrows */}
        {[0, 90, 180, 270].map(angle => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 250 + Math.cos(rad) * 80;
          const y1 = 150 + Math.sin(rad) * 40;
          const x2 = 250 + Math.cos(rad) * 100;
          const y2 = 150 + Math.sin(rad) * 50;
          return (
            <motion.line 
              key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="2"
              animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 2, delay: angle/100 }}
            />
          );
        })}
        <text x="250" y="280" fill="#64748b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Barlow Formula Wall Stress Analysis</text>
      </svg>
    </div>
  );
}

function FlowDynamics3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Pipe Bend */}
        <path d="M 100 200 Q 250 200 250 50" fill="none" stroke="#1e293b" strokeWidth="40" strokeLinecap="round" />
        <path d="M 100 200 Q 250 200 250 50" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="10 5" strokeOpacity="0.5" />
        
        {/* Animated flow lines */}
        {[0, 1, 2].map(i => (
          <motion.path 
            key={i}
            d="M 100 200 Q 250 200 250 50"
            fill="none" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round"
            initial={{ pathLength: 0, pathOffset: 0 }}
            animate={{ pathLength: 0.2, pathOffset: 1 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: i*0.6 }}
          />
        ))}
        <text x="250" y="280" fill="#64748b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Turbulent Flow Kinetic Mapping</text>
      </svg>
    </div>
  );
}

function ConstructionScene3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Trench */}
        <path d="M 50 200 L 450 200 L 420 250 L 80 250 Z" fill="#0f172a" stroke="#475569" strokeWidth="2" />
        {/* Pipe segment being lowered */}
        <motion.g animate={{ y: [0, 30, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
          <rect x="150" y="100" width="200" height="20" rx="10" fill="#94a3b8" stroke="#ffffff20" strokeWidth="1" />
          {/* Sideboom cables */}
          <line x1="200" y1="50" x2="200" y2="100" stroke="#475569" strokeWidth="2" />
          <line x1="300" y1="50" x2="300" y2="100" stroke="#475569" strokeWidth="2" />
        </motion.g>
        <text x="250" y="280" fill="#64748b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Section 4A Construction Progress</text>
      </svg>
    </div>
  );
}

function PIGSimulator3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Transparent Pipe */}
        <rect x="50" y="120" width="400" height="60" rx="30" fill="none" stroke="#94a3b8" strokeWidth="2" strokeOpacity="0.2" />
        {/* Intelligent PIG */}
        <motion.g animate={{ x: [0, 320] }} transition={{ repeat: Infinity, duration: 6, ease: "linear" }}>
          <rect x="60" y="130" width="60" height="40" rx="10" fill="#94a3b8" />
          {/* Scanning beams */}
          <motion.circle 
            cx="120" cy="150" r="10" fill="#f43f5e" fillOpacity="0.3"
            animate={{ scale: [1, 3], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        </motion.g>
        <text x="250" y="240" fill="#64748b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">MFL Intelligent Pigging Live Simulation</text>
      </svg>
    </div>
  );
}

function ControlNetwork3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Isometric Stations */}
        {[
          { x: 100, y: 200, label: 'Station A' },
          { x: 250, y: 150, label: 'Pump 01' },
          { x: 400, y: 100, label: 'Station B' }
        ].map((s, i) => (
          <g key={i}>
            <motion.path 
              d={`M ${s.x} ${s.y} L ${s.x+20} ${s.y-10} L ${s.x+40} ${s.y} L ${s.x+20} ${s.y+10} Z`}
              fill="#0f172a" stroke="#94a3b8" strokeWidth="2"
              animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3, delay: i*0.5 }}
            />
            <text x={s.x+20} y={s.y+25} fill="#64748b" fontSize="8" textAnchor="middle" className="font-black uppercase italic">{s.label}</text>
          </g>
        ))}
        {/* Connections */}
        <motion.path 
          d="M 120 200 L 250 150 L 400 100" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5"
          animate={{ strokeDashoffset: -20 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />
      </svg>
    </div>
  );
}

function GasProcessing3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Separation Vessel */}
        <motion.path 
          d="M 200 100 V 200 A 50 20 0 0 0 300 200 V 100 A 50 20 0 0 0 200 100"
          fill="#0f172a" stroke="#94a3b8" strokeWidth="3"
        />
        <ellipse cx="250" cy="100" rx="50" ry="20" fill="#0f172a" stroke="#94a3b8" strokeWidth="3" />
        
        {/* Internal streams */}
        {[0, 1, 2].map(i => (
          <motion.circle 
            key={i} cx="250" r="4" fill="#94a3b8"
            animate={{ y: [120, 180], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: i*1 }}
          />
        ))}
        <text x="250" y="260" fill="#64748b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Gas Gathering Composition Analysis</text>
      </svg>
    </div>
  );
}

function DetailCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass-card p-6 rounded-3xl border-white/5 bg-slate-400/5 hover:border-slate-400/30 transition-all">
      <h5 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">{title}</h5>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <div className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
            <span className="text-[11px] text-slate-300 leading-relaxed font-medium">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
