import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, 
  Flame, 
  FlaskConical, 
  Globe, 
  Target, 
  Activity, 
  Search,
  Box,
  LayoutDashboard,
  ShieldCheck,
  FastForward,
  Filter,
  Thermometer,
  Compass
} from 'lucide-react';
import { cn } from '../../lib/utils';

type GeochemistryTab = 
  | 'ph1' | 'ph2' | 'ph3' | 'ph4' | 'ph5';

export default function GeochemistryAdvStage() {
  const [activeTab, setActiveTab] = useState<GeochemistryTab>('ph1');
  const tabs = [
    { id: 'ph1' as GeochemistryTab, label: 'Ph.1: Source Rock', icon: FlaskConical },
    { id: 'ph2' as GeochemistryTab, label: 'Ph.2: Maturity', icon: Thermometer },
    { id: 'ph3' as GeochemistryTab, label: 'Ph.3: Correlation', icon: Dna },
    { id: 'ph4' as GeochemistryTab, label: 'Ph.4: Reservoir', icon: Box },
    { id: 'ph5' as GeochemistryTab, label: 'Ph.5: Basin Model', icon: Globe },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/20">
        <FlaskConical className="text-amber-500" size={20} />
        <span className="text-white font-black italic text-lg tracking-tight mr-6 uppercase">Advanced Petroleum Geochemistry</span>
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
            {activeTab === 'ph1' && <Phase1SourceRock />}
            {activeTab === 'ph2' && <Phase2Maturity />}
            {activeTab === 'ph3' && <Phase3Correlation />}
            {activeTab === 'ph4' && <Phase4Reservoir />}
            {activeTab === 'ph5' && <Phase5BasinModeling />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Phase Components ────────────────────────────────────────────────────────

function Phase1SourceRock() {
  const vanKrevelen = [
    { oi: 10, hi: 850, type: 'Type I' },
    { oi: 20, hi: 600, type: 'Type II' },
    { oi: 50, hi: 250, type: 'Type III' },
    { oi: 80, hi: 50, type: 'Type IV' },
    { oi: 15, hi: 720, type: 'Current Sample' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <FlaskConical className="text-amber-500" size={36} />
             Phase 1: Source Rock <span className="text-amber-500/50">Evaluation</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">TOC · Rock-Eval Pyrolysis · Kerogen Types · Richness</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-amber-500 italic">4.2%</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Total Organic Carbon (TOC)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-amber-500" />
                  Van Krevelen Diagram (HI vs. OI)
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <KerogenCube3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-amber-500/5 border-amber-500/10 flex-1 flex flex-col justify-center text-center">
               <Target size={48} className="text-amber-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Richness Classification</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">EXCELLENT</p>
               <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 inline-block mx-auto">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">TYPE II KEROGEN DOMINANT</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase2Maturity() {
  const maturityData = [
    { depth: 1000, ro: 0.35, tmax: 420 },
    { depth: 2000, ro: 0.48, tmax: 432 },
    { depth: 3000, ro: 0.62, tmax: 445 },
    { depth: 4000, ro: 0.85, tmax: 458 },
    { depth: 5000, ro: 1.15, tmax: 472 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Thermometer className="text-amber-500" size={36} />
             Phase 2: Thermal <span className="text-amber-500/50">Maturity</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Ro% · Tmax · Biomarkers · Gas Window</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-emerald-500 italic">PEAK OIL</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Current Maturity Window</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-amber-500" />
                  Vitrinite Reflectance (Ro%) vs. Depth
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <MaturityGrid3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-amber-500/5 border-amber-500/10 flex-1 flex flex-col justify-center text-center">
               <Flame size={48} className="text-amber-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">T-Max Value</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">445°C</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Main Oil Generation Phase</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase3Correlation() {
  const radarData = [
    { subject: 'Pr/Ph', A: 120, fullMark: 150 },
    { subject: 'Steranes', A: 98, fullMark: 150 },
    { subject: 'Hopanes', A: 86, fullMark: 150 },
    { subject: 'Isotopes', A: 99, fullMark: 150 },
    { subject: 'Diamondoids', A: 85, fullMark: 150 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Dna className="text-amber-500" size={36} />
             Phase 3: Oil-Source <span className="text-amber-500/50">Correlation</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Biomarkers · Fingerprinting · Steranes · Isotopes</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-amber-500 italic">POSITIVE</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Correlation Confidence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Search size={16} className="text-amber-500" />
                  Biomarker Fingerprinting (Star Plot)
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <Fingerprint3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-amber-500/5 border-amber-500/10 flex-1 flex flex-col justify-center">
               <h4 className="text-xs font-black text-white uppercase italic mb-6 text-center">Isotopic Signature</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center px-4 py-3 bg-black/20 rounded-2xl border border-white/5">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">δ13C Sat</span>
                     <span className="text-amber-400 font-black italic text-lg">-28.5‰</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 bg-black/20 rounded-2xl border border-white/5">
                     <span className="text-[10px] text-slate-500 font-bold uppercase">δ13C Aro</span>
                     <span className="text-white font-black italic text-lg">-27.2‰</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase4Reservoir() {
  const biodegData = [
    { name: 'n-C17', val: 100 },
    { name: 'Pristane', val: 95 },
    { name: 'Phytane', val: 92 },
    { name: 'Steranes', val: 85 },
    { name: 'Hopanes', val: 40 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Box className="text-amber-500" size={36} />
             Phase 4: Reservoir <span className="text-amber-500/50">Geochemistry</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Fluid Inclusions · Compartmentalization · TSR</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-rose-500 italic">LEVEL 4</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">PM Peters-Moldowan Scale</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-amber-500" />
                  Biodegradation Sensitivity Profile
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <ReservoirPore3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-amber-500/5 border-amber-500/10 flex-1 flex flex-col justify-center text-center">
               <FastForward size={48} className="text-amber-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Compartmentalization</h4>
               <p className="text-3xl font-black text-white italic tracking-tighter mb-2">HIGH CONNECTIVITY</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Stable δ13C Profile across blocks</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase5BasinModeling() {
  const burialHistory = [
    { age: 150, depth: 0 },
    { age: 100, depth: 1200 },
    { age: 50, depth: 3500 },
    { age: 10, depth: 5200 },
    { age: 0, depth: 5500 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Globe className="text-amber-500" size={36} />
             Phase 5: <span className="text-amber-500/50">Basin Modeling</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Burial History · Backstripping · Expulsion · Charge Risk</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-white italic">45 <span className="text-sm">Ma</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Critical Moment of Charge</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-amber-500" />
                  Burial History & Subsidence Model
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <BasinModel3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-amber-500/5 border-amber-500/10 flex-1 flex flex-col justify-center text-center">
               <Compass size={48} className="text-amber-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Charge Window</h4>
               <p className="text-2xl font-black text-white italic tracking-tighter mb-2">CRETACEOUS-PALEO</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  "Expulsion peak aligned with structural trap formation."
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── 3D Visualizer Components ──────────────────────────────────────────────

function KerogenCube3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Isometric Cube representing Source Rock */}
        <motion.path 
          d="M 150 150 L 250 100 L 350 150 L 250 200 Z" 
          fill="#0f172a" stroke="#f59e0b" strokeWidth="2"
        />
        <motion.path 
          d="M 150 150 V 250 L 250 300 V 200 Z" 
          fill="#0f172a" stroke="#d97706" strokeWidth="2"
        />
        <motion.path 
          d="M 350 150 V 250 L 250 300 V 200 Z" 
          fill="#0f172a" stroke="#b45309" strokeWidth="2"
        />
        {/* Kerogen Particles */}
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <motion.circle 
            key={i} r="4" fill="#f59e0b"
            animate={{ 
              cx: [200 + i*15, 250 + i*5],
              cy: [150 + i*5, 100 + i*15],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{ repeat: Infinity, duration: 4, delay: i * 0.5 }}
          />
        ))}
        <text x="250" y="50" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Source Rock Organic Cube</text>
      </svg>
    </div>
  );
}

function MaturityGrid3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Depth Layers with Maturity Gradient */}
        {[0, 1, 2, 3].map(i => (
          <g key={i}>
            <motion.path 
              d={`M 100 ${50 + i*60} L 400 ${50 + i*60} L 450 ${80 + i*60} L 150 ${80 + i*60} Z`}
              fill="#f59e0b" fillOpacity={0.1 + i*0.1} stroke="#f59e0b" strokeWidth="1"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i*0.3 }}
            />
            {/* Heat pulse */}
            <motion.circle 
              cx="275" cy={65 + i*60} r="3" fill="#f59e0b"
              animate={{ r: [3, 8, 3], fillOpacity: [0.2, 0.6, 0.2] }}
              transition={{ repeat: Infinity, duration: 3, delay: i*0.5 }}
            />
          </g>
        ))}
        <text x="460" y="80" fill="#f59e0b" fontSize="8" className="font-black italic uppercase">Oil Window</text>
        <text x="460" y="260" fill="#d97706" fontSize="8" className="font-black italic uppercase">Gas Window</text>
      </svg>
    </div>
  );
}

function Fingerprint3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Molecular DNA-like Fingerprint */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <g key={i}>
            <motion.circle 
              cx={150 + i*40} cy={150 + Math.sin(i)*30} r="10" fill="#0f172a" stroke="#f59e0b" strokeWidth="2"
              animate={{ cy: [150 + Math.sin(i)*30, 150 - Math.sin(i)*30] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />
            {i < 5 && (
              <line x1={160 + i*40} y1={150} x2={190 + i*40} y2={150} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 2" />
            )}
          </g>
        ))}
        <text x="250" y="250" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Oil-Source Biomarker Chain</text>
      </svg>
    </div>
  );
}

function ReservoirPore3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Pore Space with Inclusions */}
        <motion.path 
          d="M 100 150 Q 250 50 400 150 Q 250 250 100 150" 
          fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="10 5"
        />
        {[0, 1, 2].map(i => (
          <motion.circle 
            key={i} cx={200 + i*50} cy={150 + (i-1)*20} r="15" fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="1"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 3, delay: i*0.5 }}
          />
        ))}
        <text x="250" y="280" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Fluid Inclusion Pore Network</text>
      </svg>
    </div>
  );
}

function BasinModel3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 400" className="w-full h-full">
        {/* Isometric Basin Block - Adjusted to fit 400 height */}
        <g transform="translate(0, 50)">
          <path d="M 50 150 L 250 50 L 450 150 L 250 250 Z" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
          <path d="M 50 150 V 200 L 250 300 V 250 Z" fill="#0f172a" stroke="#d97706" strokeWidth="2" />
          <path d="M 450 150 V 200 L 250 300 V 250 Z" fill="#0f172a" stroke="#b45309" strokeWidth="2" />
          
          {/* Maturity Isotherms */}
          {[0, 1, 2].map(i => (
            <motion.path 
              key={i} d={`M ${100+i*20} ${150+i*10} L ${250} ${75+i*25} L ${400-i*20} ${150+i*10}`}
              fill="none" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3"
              animate={{ strokeOpacity: [0.1, 0.5, 0.1] }}
              transition={{ repeat: Infinity, duration: 4, delay: i*0.8 }}
            />
          ))}
        </g>
        <text x="250" y="30" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic">Dynamic Basin Maturation Model</text>
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
