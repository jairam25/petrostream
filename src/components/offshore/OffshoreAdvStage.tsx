import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ship, 
  Waves, 
  Anchor, 
  Wind, 
  Cog, 
  Layers, 
  Zap, 
  ArrowUp,
  Box,
  LayoutDashboard,
  ShieldCheck,
  FastForward,
  Cpu,
  Droplets,
  Wrench,
  Container,
  Activity,
  ArrowRight,
  Flame,
  Snowflake
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Search, Database, Target, Compass, HardHat } from 'lucide-react';

type OffshoreTab = 
  | 'ph1' | 'ph2' | 'ph3' | 'ph4' | 'ph5' | 'ph6' | 'ph7' | 'ph8' | 'ph9' | 'ph10' | 'ph11' | 'ph12';

export default function OffshoreAdvStage() {
  const [activeTab, setActiveTab] = useState<OffshoreTab>('ph1');
  const tabs = [
    { id: 'ph1' as OffshoreTab, label: 'Ph.1: Fixed Structures', icon: Ship },
    { id: 'ph2' as OffshoreTab, label: 'Ph.2: Floating Systems', icon: Container },
    { id: 'ph3' as OffshoreTab, label: 'Ph.3: Subsea Eng.', icon: Cpu },
    { id: 'ph4' as OffshoreTab, label: 'Ph.4: Risers & Lines', icon: Layers },
    { id: 'ph5' as OffshoreTab, label: 'Ph.5: Mooring', icon: Anchor },
    { id: 'ph6' as OffshoreTab, label: 'Ph.6: Drilling', icon: Cog },
    { id: 'ph7' as OffshoreTab, label: 'Ph.7: Installation', icon: Wrench },
    { id: 'ph8' as OffshoreTab, label: 'Ph.8: IMR', icon: Activity },
    { id: 'ph9' as OffshoreTab, label: 'Ph.9: Marine Ops', icon: FastForward },
    { id: 'ph10' as OffshoreTab, label: 'Ph.10: Decomm', icon: Box },
    { id: 'ph11' as OffshoreTab, label: 'Ph.11: Safety', icon: ShieldCheck },
    { id: 'ph12' as OffshoreTab, label: 'Ph.12: Arctic/Harsh', icon: Wind },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/20">
        <Waves className="text-blue-500" size={20} />
        <span className="text-white font-black italic text-lg tracking-tight mr-6 uppercase">Advanced Offshore Engineering</span>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === t.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            )}
          >
            <t.icon size={13} />{t.label}
          </button>
        ))}
        <div className="flex-1" />
        <button 
          onClick={() => {
            const content = `PETROSTREAM OFFSHORE ENGINEERING REPORT\nGenerated: ${new Date().toLocaleString()}\nModule: Offshore & Marine Ops\n\n1. SUBSEA: Layout & Telemetry (Stable)\n2. STABILITY: RAO Response within Limits\n3. DRILLING: Well Control Secure\n4. INSTALLATION: Lift Capacities Verified\n\nEnd of Summary.`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Offshore_Engineering_Report.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center gap-2 shadow-lg shadow-white/10"
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
            {activeTab === 'ph1' && <Phase1FixedStructures />}
            {activeTab === 'ph2' && <Phase2FloatingSystems />}
            {activeTab === 'ph3' && <Phase3Subsea />}
            {activeTab === 'ph4' && <Phase4Risers />}
            {activeTab === 'ph5' && <Phase5Mooring />}
            {activeTab === 'ph6' && <Phase6Drilling />}
            {activeTab === 'ph7' && <Phase7Installation />}
            {activeTab === 'ph8' && <Phase8IMR />}
            {activeTab === 'ph9' && <Phase9MarineOps />}
            {activeTab === 'ph10' && <Phase10Decommissioning />}
            {activeTab === 'ph11' && <Phase11Safety />}
            {activeTab === 'ph12' && <Phase12Harsh />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Phase 1: Fixed Structures ──────────────────────────────────────────────

function Phase1FixedStructures() {
  const jacketData = [
    { depth: 50, weight: 2000 },
    { depth: 150, weight: 8500 },
    { depth: 300, weight: 22000 },
    { depth: 450, weight: 45000 },
    { depth: 520, weight: 62000 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Ship className="text-blue-500" size={36} />
             Phase 1: Fixed <span className="text-blue-500/50">Structures</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Jackets · GBS · Compliant Towers · Piling</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-blue-500 italic">520 <span className="text-sm">M</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Max Design Water Depth</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-blue-500" />
                  Jacket Weight Scaling vs. Water Depth (Tonnes)
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <Jacket3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-blue-500/5 border-blue-500/10 flex-1 flex flex-col justify-center text-center">
               <Target size={48} className="text-blue-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Structural Reliability</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">β=3.72</p>
               <div className="px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 inline-block mx-auto">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">API RP 2A LRFD COMPLIANT</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── Phase 2: Floating Systems ──────────────────────────────────────────────

function Phase2FloatingSystems() {
  const raoData = [
    { freq: 0.1, response: 0.5 },
    { freq: 0.3, response: 1.2 },
    { freq: 0.5, response: 3.8 },
    { freq: 0.7, response: 0.8 },
    { freq: 0.9, response: 0.3 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Container className="text-blue-500" size={36} />
             Phase 2: Floating <span className="text-blue-500/50">Production</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">FPSO · Semi · SPAR · TLP · Stability · RAO</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-blue-500 italic">2.8 <span className="text-sm">M</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Metacentric Height (GM)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-blue-500" />
                  Motion RAO (Response Amplitude Operator) Spectrum
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <FPSO3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-blue-500/5 border-blue-500/10 flex-1 flex flex-col justify-center text-center">
               <Compass size={48} className="text-blue-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Stability Status</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">POSITIVE</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  Center of Gravity (KG): 18.5m
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── Phase 3: Subsea Engineering ────────────────────────────────────────────

function Phase3Subsea() {
  const subseaMix = [
    { name: 'Oil Wells', val: 12, color: '#3b82f6' },
    { name: 'Water Inj', val: 8, color: '#60a5fa' },
    { name: 'Gas Lift', val: 4, color: '#93c5fd' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Cpu className="text-blue-500" size={36} />
             Phase 3: Subsea <span className="text-blue-500/50">Production</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Trees · Manifolds · Controls · Processing · ROVs</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-blue-500 italic">4.2 <span className="text-sm">BAR</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Ambient Seawater Pressure</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-blue-500" />
                  Subsea Architecture Inventory (Well Count)
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <SubseaTree3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-blue-500/5 border-blue-500/10 flex-1 flex flex-col justify-center text-center">
               <Zap size={48} className="text-blue-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Umbilical Power</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">12.5 <span className="text-sm">KV</span></p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Transmission Status</p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── Phase 4: Risers ────────────────────────────────────────────────────────

function Phase4Risers() {
  const riserData = [
    { name: 'Hole-1', tension: 120 },
    { name: 'Hole-2', tension: 145 },
    { name: 'Hole-3', tension: 180 },
    { name: 'Hole-4', tension: 160 },
    { name: 'Hole-5', tension: 130 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Layers className="text-blue-500" size={36} />
             Phase 4: Risers <span className="text-blue-500/50">& Flowlines</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Rigid · Flexible · VIV · Analysis · SCR · TTR</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-blue-500 italic">420 <span className="text-sm">MT</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Top Tension Requirement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-blue-500" />
                  Riser System Tension Distribution (Metric Tonnes)
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <RiserSystem3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-blue-500/5 border-blue-500/10 flex-1 flex flex-col justify-center text-center">
               <Layers size={48} className="text-blue-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Fatigue Life</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">25 <span className="text-sm">YRS</span></p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Touch-down Point (TDP) Integrity</p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── Phase 5: Mooring Systems ──────────────────────────────────────────────

function Phase5Mooring() {
  const mooringLines = [
    { line: 'L-1', tension: 850 },
    { line: 'L-2', tension: 862 },
    { line: 'L-3', tension: 910 },
    { line: 'L-4', tension: 845 },
    { line: 'L-5', tension: 875 },
    { line: 'L-6', tension: 890 },
    { line: 'L-7', tension: 855 },
    { line: 'L-8', tension: 882 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Anchor className="text-blue-500" size={36} />
             Phase 5: Mooring <span className="text-blue-500/50">Systems</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Catenary · Taut Leg · DP · Turrets · Tension</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-emerald-500 italic">INTACT</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Line Integrity Status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-blue-500" />
                  Mooring Line Tension Analysis (kN)
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <MooringLayout3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-blue-500/5 border-blue-500/10 flex-1 flex flex-col justify-center text-center">
               <Anchor size={48} className="text-blue-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Max Line Load</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">910 <span className="text-sm">KN</span></p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Suction Pile Anchor Active</p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── Phase 6: Offshore Drilling ─────────────────────────────────────────────

function Phase6Drilling() {
  const drillingData = [
    { depth: 1000, pp: 1.05, ecd: 1.12, frac: 1.45 },
    { depth: 2000, pp: 1.15, ecd: 1.25, frac: 1.55 },
    { depth: 3000, pp: 1.45, ecd: 1.55, frac: 1.65 },
    { depth: 4000, pp: 1.62, ecd: 1.72, frac: 1.85 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Cog className="text-blue-500" size={36} />
             Phase 6: Offshore <span className="text-blue-500/50">Drilling</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Rigs · Well Construction · Deepwater · Pressure Control</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-blue-500 italic">4.2 <span className="text-sm">km</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Current Target Depth (TVD)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-blue-500" />
                  Drilling Window (SG): ECD vs. Pore Pressure vs. Frac Gradient
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <Drillship3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-blue-500/5 border-blue-500/10 flex-1 flex flex-col justify-center text-center">
               <HardHat size={48} className="text-blue-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Well Control</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">SECURE</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  BOP Stack Fully Functional
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── Phase 7: Installation Methods ──────────────────────────────────────────

function Phase7Installation() {
  const liftData = [
    { radius: 30, capacity: 20000 },
    { radius: 50, capacity: 15000 },
    { radius: 70, capacity: 8000 },
    { radius: 90, capacity: 4500 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Wrench className="text-blue-500" size={36} />
             Phase 7: Offshore <span className="text-blue-500/50">Installation</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Heavy Lift · Pipelay · Float-over · Stinger Design</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-blue-500 italic">20,000 <span className="text-sm">Te</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Max Crane Capacity (Tandem)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-blue-500" />
                  Heavy Lift Capacity Chart (Radius vs. SWL)
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <HeavyLift3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-blue-500/5 border-blue-500/10 flex-1 flex flex-col justify-center text-center">
               <Ship size={48} className="text-blue-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Vessel On-Hire</h4>
               <p className="text-2xl font-black text-white italic tracking-tighter mb-2">PIETER SCHELTE</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  Dual-Actuation Mode Ready
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── Phase 8: Inspection, Maintenance & Repair ──────────────────────────────

function Phase8IMR() {
  const inspectionData = [
    { name: 'Jacket Weld', status: 85, color: '#3b82f6' },
    { name: 'Anode Wear', status: 42, color: '#60a5fa' },
    { name: 'Scour Depth', status: 15, color: '#93c5fd' },
    { name: 'Marine Growth', status: 60, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Activity className="text-blue-500" size={36} />
             Phase 8: Offshore <span className="text-blue-500/50">IMR</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Inspection · Maintenance · Repair · CP · ROV</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-blue-500 italic">42%</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Structural Inspection Completion</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-blue-500" />
                  Asset Condition Assessment Matrix (%)
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <ROVSimulator3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-blue-500/5 border-blue-500/10 flex-1 flex flex-col justify-center text-center">
               <ShieldCheck size={48} className="text-blue-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Cathodic Pot.</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">-0.98 <span className="text-sm">V</span></p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Protection Active (Ag/AgCl)</p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── Phase 9: Marine Operations ─────────────────────────────────────────────

function Phase9MarineOps() {
  const metoceanData = [
    { hs: 1, tp: 8, uptime: 98 },
    { hs: 2, tp: 10, uptime: 92 },
    { hs: 4, tp: 12, uptime: 75 },
    { hs: 6, tp: 14, uptime: 40 },
    { hs: 8, tp: 16, uptime: 15 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <FastForward className="text-blue-500" size={36} />
             Phase 9: Marine <span className="text-blue-500/50">Operations</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Vessel Ops · Weather Windows · Metocean · Logistics</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-blue-500 italic">92%</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Vessel Workability Index</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-blue-500" />
                  Metocean Sea-State (Hs vs. Tp) Workability Mapping
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <MarineWorkability3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-blue-500/5 border-blue-500/10 flex-1 flex flex-col justify-center text-center">
               <Ship size={48} className="text-blue-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Vessel On-Station</h4>
               <p className="text-2xl font-black text-white italic tracking-tighter mb-2">SSCV SLEIPNER</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Heavy Lift Window</p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── Phase 10: Decommissioning ──────────────────────────────────────────────

function Phase10Decommissioning() {
  const decommCost = [
    { name: 'Well P&A', value: 45, color: '#3b82f6' },
    { name: 'Removal', value: 30, color: '#60a5fa' },
    { name: 'Logistics', value: 15, color: '#93c5fd' },
    { name: 'Regs/EIA', value: 10, color: '#bfdbfe' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Box className="text-blue-500" size={36} />
             Phase 10: Offshore <span className="text-blue-500/50">Decommissioning</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Well P&A · Removal · Regulations · ARO Economics</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-blue-500 italic">$2.4 <span className="text-sm">BN</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Estimated ARO Liability</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Database size={16} className="text-blue-500" />
                  Decommissioning Cost Distribution (%)
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <DecommBlock3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-blue-500/5 border-blue-500/10 flex-1 flex flex-col justify-center text-center">
               <ShieldCheck size={48} className="text-blue-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Reg. Compliance</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">OSPAR 98/3</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">North Sea Standard Active</p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── Phase 11: Offshore Safety Systems ──────────────────────────────────────

function Phase11Safety() {
  const safetyRadar = [
    { subject: 'Fire Detect', A: 95, B: 98, fullMark: 100 },
    { subject: 'Gas Detect', A: 92, B: 95, fullMark: 100 },
    { subject: 'ESD Speed', A: 88, B: 90, fullMark: 100 },
    { subject: 'Deluge Vol', A: 85, B: 92, fullMark: 100 },
    { subject: 'Evac Read', A: 98, B: 99, fullMark: 100 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <ShieldCheck className="text-blue-500" size={36} />
             Phase 11: Offshore <span className="text-blue-500/50">Safety</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Fire & Gas · ESD · Evacuation · TEMPSC · Lifeboats</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-blue-500 italic">SIL-3</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Safety Integrity Level Rating</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-blue-500" />
                  Life Safety Systems Reliability Radar
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <SafetyGrid3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-blue-500/5 border-blue-500/10 flex-1 flex flex-col justify-center text-center">
               <ShieldCheck size={48} className="text-blue-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Lifeboat Status</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">READY</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">120% POB Capacity Secured</p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── Phase 12: Arctic & Harsh Environments ──────────────────────────────────

function Phase12Harsh() {
  const iceData = [
    { thick: 0.5, load: 1200 },
    { thick: 1.0, load: 4500 },
    { thick: 1.5, load: 12000 },
    { thick: 2.0, load: 28000 },
    { thick: 2.5, load: 55000 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Snowflake className="text-blue-500" size={36} />
             Phase 12: Arctic <span className="text-blue-500/50">& Harsh</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Ice Loading · Winterization · GBS · Arctic Logistics</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-blue-500 italic">-45 <span className="text-sm">°C</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Extreme Design Temperature</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-blue-500" />
                  Structural Ice Loading vs. Sheet Thickness (kN/m)
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <IceLoad3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-blue-500/5 border-blue-500/10 flex-1 flex flex-col justify-center text-center">
               <Snowflake size={48} className="text-blue-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Winterization</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">ACTIVE</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  Heat Tracing & De-icing Engaged
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── 3D Visualizer Components ──────────────────────────────────────────────

function Jacket3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Isometric Jacket Structure */}
        <g transform="translate(250, 150)">
          {[0, 1, 2].map(i => (
            <g key={i} transform={`translate(0, ${i * 40})`}>
              <path d="M -80 -40 L 80 -40 L 120 40 L -120 40 Z" fill="none" stroke="#3b82f6" strokeWidth="2" strokeOpacity={1 - i*0.3} />
              {/* Diagonals */}
              <line x1="-80" y1="-40" x2="120" y2="40" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.3" />
              <line x1="80" y1="-40" x2="-120" y2="40" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.3" />
            </g>
          ))}
          {/* Legs */}
          <line x1="-80" y1="-40" x2="-120" y2="120" stroke="#3b82f6" strokeWidth="3" />
          <line x1="80" y1="-40" x2="120" y2="120" stroke="#3b82f6" strokeWidth="3" />
        </g>
        <text x="250" y="280" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Fixed Jacket Structural Model</text>
      </svg>
    </div>
  );
}

function FPSO3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        <motion.g animate={{ y: [0, 5, 0], rotate: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
          {/* Hull */}
          <path d="M 100 150 L 400 150 L 350 200 L 150 200 Z" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
          {/* Topside modules */}
          <rect x="150" y="120" width="40" height="30" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
          <rect x="220" y="130" width="60" height="20" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
          <rect x="300" y="110" width="30" height="40" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
        </motion.g>
        {/* Waves */}
        {[0, 1, 2].map(i => (
          <motion.path 
            key={i} d="M 50 210 Q 150 190 250 210 Q 350 230 450 210"
            fill="none" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.3"
            animate={{ x: [-20, 20, -20] }} transition={{ repeat: Infinity, duration: 3, delay: i*1 }}
          />
        ))}
      </svg>
    </div>
  );
}

function SubseaTree3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Subsea Xmas Tree Isometric */}
        <g transform="translate(250, 150)">
          <rect x="-40" y="-20" width="80" height="60" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
          <path d="M -40 -20 L 0 -50 L 40 -20" fill="none" stroke="#3b82f6" strokeWidth="2" />
          {/* Valves */}
          {[ -25, 0, 25 ].map(x => (
            <motion.circle 
              key={x} cx={x} cy="10" r="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="1"
              animate={{ strokeOpacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2, delay: x/50 }}
            />
          ))}
          {/* Flowlines */}
          <path d="M 40 20 H 100" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />
          <path d="M -40 20 H -100" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />
        </g>
        <text x="250" y="280" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Subsea Tree & Manifold Simulator</text>
      </svg>
    </div>
  );
}

function RiserSystem3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Sea Level */}
        <line x1="50" y1="100" x2="450" y2="100" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.2" />
        {/* Seabed */}
        <line x1="50" y1="250" x2="450" y2="250" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.2" />
        
        {/* Riser Catenary */}
        <motion.path 
          d="M 100 100 Q 150 250 400 250"
          fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
        />
        {/* Buoyancy modules */}
        {[ 0.4, 0.5, 0.6 ].map(p => (
          <motion.circle 
            key={p} r="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="1"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 + p }}
            cx={100 + p*300} cy={100 + p*150}
          />
        ))}
        <text x="250" y="40" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">SCR Dynamic Analysis</text>
      </svg>
    </div>
  );
}

function MooringLayout3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Bird's Eye Mooring Layout */}
        <rect x="200" y="120" width="100" height="60" rx="10" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
        {[0, 45, 135, 180, 225, 315].map(angle => {
          const rad = (angle * Math.PI) / 180;
          const x2 = 250 + Math.cos(rad) * 150;
          const y2 = 150 + Math.sin(rad) * 100;
          return (
            <motion.line 
              key={angle} x1="250" y1="150" x2={x2} y2={y2} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 2"
              animate={{ strokeOpacity: [0.1, 0.5, 0.1] }} transition={{ repeat: Infinity, duration: 3, delay: angle/100 }}
            />
          );
        })}
        <text x="250" y="280" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">8-Point Taut-Leg Mooring System</text>
      </svg>
    </div>
  );
}

function Drillship3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        <g transform="translate(250, 100)">
          {/* Derrick */}
          <path d="M -20 0 L 20 0 L 0 -80 Z" fill="none" stroke="#3b82f6" strokeWidth="2" />
          {/* Hull */}
          <path d="M -100 0 L 100 0 L 80 30 L -80 30 Z" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
          {/* Riser */}
          <motion.line 
            x1="0" y1="30" x2="0" y2="150" stroke="#3b82f6" strokeWidth="2"
            animate={{ strokeDashoffset: [0, -20] }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            strokeDasharray="4 2"
          />
        </g>
        <text x="250" y="280" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Deepwater Drillship Simulation</text>
      </svg>
    </div>
  );
}

function HeavyLift3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Crane Vessel */}
        <rect x="100" y="200" width="200" height="40" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
        {/* Crane Arm */}
        <motion.g animate={{ rotate: [-5, 5, -5] }} style={{ originX: '280px', originY: '200px' }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}>
          <line x1="280" y1="200" x2="400" y2="50" stroke="#3b82f6" strokeWidth="4" />
          {/* Hook & Load */}
          <line x1="400" y1="50" x2="400" y2="120" stroke="#3b82f6" strokeWidth="1" />
          <rect x="380" y="120" width="40" height="30" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
        </motion.g>
      </svg>
    </div>
  );
}

function ROVSimulator3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Subsea Structure Part */}
        <rect x="300" y="100" width="20" height="150" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
        {/* ROV */}
        <motion.g animate={{ x: [0, 20, 0], y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
          <rect x="100" y="120" width="60" height="40" rx="5" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
          {/* Thrusters */}
          <circle cx="100" cy="140" r="5" fill="#3b82f6" />
          {/* Scanning Beam */}
          <motion.path 
            d="M 160 140 L 300 120 L 300 160 Z" fill="#3b82f6" fillOpacity="0.1"
            animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 2 }}
          />
        </motion.g>
      </svg>
    </div>
  );
}

function MarineWorkability3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Metocean Grid */}
        <path d="M 50 200 L 250 100 L 450 200 L 250 300 Z" fill="none" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.2" />
        {[0, 1, 2, 3].map(i => (
          <motion.circle 
            key={i} cx={150 + i*50} cy={150 + i*20} r="5" fill="#3b82f6"
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.8, 0.2] }}
            transition={{ repeat: Infinity, duration: 3, delay: i*0.5 }}
          />
        ))}
        <text x="250" y="50" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Vessel Workability Envelope</text>
      </svg>
    </div>
  );
}

function DecommBlock3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Structure being cut */}
        <rect x="200" y="100" width="100" height="150" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
        {/* Cutting Line */}
        <motion.line 
          x1="180" y1="150" x2="320" y2="150" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 2"
          animate={{ strokeDashoffset: -20 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <text x="250" y="280" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Abrasive Water-Jet Cutting Sim</text>
      </svg>
    </div>
  );
}

function SafetyGrid3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Platform Layout */}
        <path d="M 100 150 L 250 50 L 400 150 L 250 250 Z" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
        {/* Safety Zones */}
        {[
          { x: 200, y: 120, color: '#f43f5e', label: 'FIRE' },
          { x: 300, y: 130, color: '#fbbf24', label: 'GAS' },
          { x: 250, y: 180, color: '#10b981', label: 'SAFE' }
        ].map((z, i) => (
          <g key={i}>
            <motion.circle 
              cx={z.x} cy={z.y} r="15" fill={z.color} fillOpacity="0.2" stroke={z.color} strokeWidth="1"
              animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, delay: i*0.3 }}
            />
            <text x={z.x} y={z.y+4} fill={z.color} fontSize="6" textAnchor="middle" className="font-black">{z.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function IceLoad3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* GBS Structure */}
        <path d="M 200 250 L 300 250 L 280 150 L 220 150 Z" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
        {/* Ice Sheet */}
        <motion.path 
          d="M 50 180 H 220" stroke="#bfdbfe" strokeWidth="10" strokeLinecap="round"
          animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
        {/* Ice load indicators */}
        <motion.path 
          d="M 220 180 L 180 160 M 220 180 L 180 200" stroke="#f43f5e" strokeWidth="2"
          animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 2 }}
        />
        <text x="250" y="280" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Arctic Ice-Structure Interaction</text>
      </svg>
    </div>
  );
}

function DetailCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass-card p-6 rounded-3xl border-white/5 bg-blue-500/5 hover:border-blue-500/30 transition-all">
      <h5 className="text-[11px] font-black uppercase tracking-widest text-blue-500 mb-4">{title}</h5>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <div className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
            <span className="text-[11px] text-slate-300 leading-relaxed font-medium">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
