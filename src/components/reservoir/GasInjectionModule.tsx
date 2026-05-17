import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wind, ArrowDownUp, Thermometer, CloudFog, Zap, AlertTriangle, Layers, CloudRain, Flame, ShieldAlert, FileDigit,
  Settings, Activity, Target, ShieldCheck, TrendingUp, RefreshCcw, ArrowRight, Gauge
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculateCO2MMP, calculateYelligMetcalfeMMP, calculateHolmJosendalMMP } from '../../lib/reservoir';

export function GasInjectionModule() {
  const [activePhase, setActivePhase] = useState<'4A' | '4B' | '4C' | '4D' | '4E' | '4F'>('4A');
  
  // Phase 4B: MMP
  const [tempF, setTempF] = useState(160);
  const [mwC5Plus, setMwC5Plus] = useState(180);

  const mmpCronquist = useMemo(() => calculateCO2MMP(tempF, mwC5Plus), [tempF, mwC5Plus]);
  const mmpYm = useMemo(() => calculateYelligMetcalfeMMP(tempF), [tempF]);
  const mmpHj = useMemo(() => calculateHolmJosendalMMP(tempF, mwC5Plus), [tempF, mwC5Plus]);
  
  const mmp = mmpCronquist;

  const phases = [
    { id: '4A', name: 'Miscibility', icon: ArrowDownUp },
    { id: '4B', name: 'MMP Analysis', icon: Gauge },
    { id: '4C', name: 'CO2 Flood', icon: CloudFog },
    { id: '4D', name: 'HC Gas', icon: Flame },
    { id: '4E', name: 'Nitrogen', icon: Wind },
    { id: '4F', name: 'Challenges', icon: AlertTriangle }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-4">
            <Wind className="text-indigo-500" size={36} />
            Phase 4: Gas Injection <span className="text-indigo-500/50">Enhanced Recovery</span>
          </h2>
          <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-widest italic">Miscible & Immiscible Compositional Displacement Suite</p>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit mt-4 flex-wrap gap-1 backdrop-blur-md">
          {phases.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id as any)}
              className={cn(
                "px-6 py-2.5 rounded-[14px] flex items-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest",
                activePhase === p.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              <p.icon size={14} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 h-full">
          <AnimatePresence mode="wait">
             <motion.div
               key={activePhase}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="h-full"
             >
                {/* --- 4A: Miscibility --- */}
                {activePhase === '4A' && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-4 space-y-6">
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] space-y-6">
                           <h3 className="text-2xl font-black text-white italic mb-4 uppercase tracking-tighter">Compositional Drive</h3>
                           <p className="text-[11px] text-slate-400 leading-relaxed italic mb-8">
                              Gas-oil miscibility develops via multi-contact mass transfer of intermediate components.
                           </p>
                           <div className="space-y-4">
                              <PhaseStep num="V" title="Vaporizing" desc="Lean gas strips intermediates from oil bank." color="indigo" />
                              <PhaseStep num="C" title="Condensing" desc="Enriched gas transfers components into oil." color="amber" />
                              <PhaseStep num="CV" title="Combined" desc="Mixed mechanism common in CO2 floods." color="emerald" />
                           </div>
                        </div>
                      </div>
                      <div className="lg:col-span-8 flex flex-col gap-8">
                         <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[500px] flex items-center justify-center relative overflow-hidden">
                            <MiscibilityFront3D mechanism={activePhase === '4A' ? 'CV' : 'V'} />
                         </div>
                      </div>
                   </div>
                )}

                {/* --- 4B: MMP --- */}
                {activePhase === '4B' && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-4 space-y-6">
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] space-y-8">
                           <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-6 italic">
                              <Thermometer size={14} /> Miscibility Calibration
                           </h4>
                           <InputWithSlider label="Reservoir Temp (°F)" value={tempF} min={80} max={300} step={5} unit="°F" onChange={setTempF} />
                           <InputWithSlider label="C5+ Molecular Weight" value={mwC5Plus} min={100} max={300} step={5} unit="g/mol" onChange={setMwC5Plus} />
                           
                           <div className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl mt-8 text-center shadow-lg shadow-indigo-500/5">
                              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-2 italic">Cronquist MMP Estimate</p>
                              <p className="text-4xl font-black text-white italic tracking-tighter">{Math.max(0, mmpCronquist).toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-xl text-slate-500 not-italic">psi</span></p>
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Yellig-Metcalfe</p>
                              <p className="text-lg font-black text-white italic">{Math.max(0, mmpYm).toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                           </div>
                           <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Holm-Josendal</p>
                              <p className="text-lg font-black text-white italic">{Math.max(0, mmpHj).toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                           </div>
                        </div>
                      </div>

                      <div className="lg:col-span-8">
                         <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[600px] flex items-center justify-center relative overflow-hidden">
                            <SlimTubeMMP3D mmp={mmp} />
                         </div>
                      </div>
                   </div>
                )}

                {/* --- 4C: CO2 Flood --- */}
                {activePhase === '4C' && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-8">
                         <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[600px] flex items-center justify-center relative overflow-hidden">
                            <CO2Sequestration3D />
                         </div>
                      </div>
                      <div className="lg:col-span-4 space-y-6">
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                           <h3 className="text-2xl font-black text-white italic mb-6 uppercase tracking-tighter">CO2 & CCUS Strategy</h3>
                           <div className="space-y-4">
                              <DriveCard title="Swelling" desc="CO2 dissolves into oil, increasing volume by 10-40%." icon={CloudFog} />
                              <DriveCard title="Visco-Reduction" desc="Can reduce heavy oil viscosity by up to 90%." icon={Activity} />
                              <DriveCard title="WAG Control" desc="Water-Alternating-Gas for mobility buffer." icon={RefreshCcw} />
                           </div>
                        </div>
                        <div className="p-8 bg-red-900/10 border border-red-500/20 rounded-3xl">
                           <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2 italic">
                              <ShieldAlert size={16} /> Carbonic Acid Risk
                           </h4>
                           <p className="text-[11px] text-slate-400 leading-relaxed italic">"CO2 + H2O forms acidic brine. High alloy <span className="text-white font-bold">13Cr</span> metallurgy required for tubing."</p>
                        </div>
                      </div>
                   </div>
                )}

                {/* --- 4F: Challenges --- */}
                {activePhase === '4F' && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-8 glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[550px] flex items-center justify-center relative overflow-hidden">
                         <ViscousFingering3D />
                      </div>
                      <div className="lg:col-span-4 flex flex-col gap-6">
                         <ChallengeCard title="Viscous Fingering" desc="Unfavorable mobility ratio causes gas to bypass oil banks." mitigation="WAG Injection / Foam" />
                         <ChallengeCard title="Gravity Override" desc="Low density gas rises to reservoir top prematurely." mitigation="Horizontal Wells / Conformance" />
                         <ChallengeCard title="Breakthrough" desc="Early cycling through high-k thief zones." mitigation="Mechanical Isolation" />
                      </div>
                   </div>
                )}
             </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── 3D Kinetic Simulators ─────────────────────────────────────────────────

function MiscibilityFront3D({ mechanism }: { mechanism: string }) {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[500px]">
      <g transform="translate(50, 50)">
        {/* Reservoir Zone */}
        <rect x="0" y="50" width="400" height="100" fill="#1e293b" fillOpacity="0.3" rx="10" />
        {/* Gas Front */}
        <motion.path 
          d="M 0 50 Q 150 100 0 150"
          fill="#6366f1" fillOpacity="0.1" stroke="#6366f1" strokeWidth="3"
          animate={{ d: ["M 0 50 Q 150 100 0 150", "M 0 50 Q 350 100 0 150", "M 0 50 Q 150 100 0 150"] }}
          transition={{ repeat: Infinity, duration: 8 }}
        />
        {/* Mass Transfer Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.circle 
            key={i} r="2" fill={i % 2 === 0 ? "#6366f1" : "#f59e0b"}
            initial={{ cx: 100 + Math.random()*100, cy: 50 + Math.random()*100 }}
            animate={{ 
              cx: [100 + Math.random()*100, 200 + Math.random()*100],
              opacity: [0, 1, 0]
            }}
            transition={{ repeat: Infinity, duration: 3, delay: i*0.2 }}
          />
        ))}
        <rect x="-5" y="0" width="10" height="200" fill="#475569" rx="5" />
      </g>
      <text x="250" y="280" fill="#6366f1" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">MCM Compositional Exchange Simulation</text>
    </svg>
  );
}

function SlimTubeMMP3D({ mmp }: { mmp: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
      <g transform="translate(60, 50)">
        {/* Recovery Curve */}
        <line x1="0" y1="300" x2="380" y2="300" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" />
        <line x1="0" y1="0" x2="0" y2="300" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" />
        
        <motion.path 
          d="M 0 300 Q 100 250 200 50 L 380 30"
          fill="none" stroke="#10b981" strokeWidth="4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
        />
        
        {/* MMP Marker */}
        <motion.circle 
          cx="200" cy="50" r="8" fill="#f43f5e"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2 }}
        />
        <motion.line 
          x1="200" y1="50" x2="200" y2="300" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4,4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
        />
      </g>
      <text x="250" y="380" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Slim Tube Displacement Efficiency Breakpoint</text>
    </svg>
  );
}

function CO2Sequestration3D() {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full">
       <g transform="translate(100, 50)">
          {/* Caprock */}
          <rect x="0" y="0" width="300" height="40" fill="#475569" fillOpacity="0.8" rx="5" />
          {/* Porous Matrix */}
          <rect x="0" y="45" width="300" height="200" fill="#1e293b" fillOpacity="0.2" rx="10" />
          {/* CO2 Plume */}
          <motion.path 
            d="M 150 240 Q 150 150 150 100 Q 50 100 150 100 Q 250 100 150 100"
            fill="#6366f1" fillOpacity="0.1" stroke="#6366f1" strokeWidth="2"
            animate={{ 
              d: [
                "M 150 240 Q 150 150 150 100 Q 50 100 150 100 Q 250 100 150 100",
                "M 150 240 Q 150 150 150 60 Q 20 60 150 60 Q 280 60 150 60",
                "M 150 240 Q 150 150 150 100 Q 50 100 150 100 Q 250 100 150 100"
              ] 
            }}
            transition={{ repeat: Infinity, duration: 10 }}
          />
       </g>
       <text x="250" y="350" fill="#6366f1" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Hydrodynamic & Structural CO2 Trapping</text>
    </svg>
  );
}

function ViscousFingering3D() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <g transform="translate(50, 50)">
         {/* Interface Fingering */}
         <motion.path 
           d="M 0 50 L 50 50 Q 80 20 100 50 Q 130 80 150 50 Q 180 20 200 50 L 300 50"
           fill="none" stroke="#f59e0b" strokeWidth="3"
           animate={{ d: [
             "M 0 50 L 50 50 Q 80 20 100 50 Q 130 80 150 50 Q 180 20 200 50 L 300 50",
             "M 0 50 L 50 50 Q 80 80 100 50 Q 130 20 150 50 Q 180 80 200 50 L 300 50",
             "M 0 50 L 50 50 Q 80 20 100 50 Q 130 80 150 50 Q 180 20 200 50 L 300 50"
           ] }}
           transition={{ repeat: Infinity, duration: 2 }}
         />
         {/* Gas "Fingers" */}
         {[0, 1, 2].map(i => (
           <motion.path 
             key={i} d={`M ${50 + i*80} 50 L ${80 + i*80} 100`}
             stroke="#6366f1" strokeWidth="2" strokeOpacity="0.4"
             animate={{ pathLength: [0, 1], opacity: [0, 1, 0] }}
             transition={{ repeat: Infinity, duration: 3, delay: i*0.5 }}
           />
         ))}
      </g>
    </svg>
  );
}

// ─── Shared UI Components ──────────────────────────────────────────────────

function DriveCard({ title, desc, icon: Icon }: { title: string, desc: string, icon: any }) {
  return (
    <div className="p-5 border border-white/5 rounded-3xl bg-white/5 flex gap-4 items-start group hover:border-indigo-500/30 transition-all">
       <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
         <Icon size={16} />
       </div>
       <div>
         <h5 className="text-[11px] font-black text-white uppercase tracking-widest">{title}</h5>
         <p className="text-[10px] text-slate-400 mt-1 leading-relaxed italic">{desc}</p>
       </div>
    </div>
  );
}

function PhaseStep({ num, title, desc, color }: { num: string, title: string, desc: string, color: string }) {
  const colorMap: any = {
    indigo: "bg-indigo-500/20 text-indigo-500 border-indigo-500/20",
    amber: "bg-amber-500/20 text-amber-500 border-amber-500/20",
    emerald: "bg-emerald-500/20 text-emerald-500 border-emerald-500/20"
  };
  return (
    <div className={cn("flex gap-4 items-center p-5 border rounded-3xl transition-all hover:bg-white/5", colorMap[color])}>
       <span className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border border-current shadow-lg shadow-current/10">{num}</span>
       <div>
          <h5 className="text-[11px] font-black uppercase tracking-widest text-white">{title}</h5>
          <p className="text-[10px] opacity-70 mt-1 font-medium">{desc}</p>
       </div>
    </div>
  );
}

function ResultCard({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="glass-card p-6 rounded-2xl border-white/5 bg-white/5 text-center group hover:border-indigo-500/30 transition-all">
       <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">{label}</p>
       <h4 className="text-2xl font-black text-white italic tracking-tighter">{value} <span className="text-[10px] text-slate-600 not-italic uppercase tracking-widest font-bold">{unit}</span></h4>
    </div>
  );
}

function ChallengeCard({ title, desc, mitigation }: { title: string, desc: string, mitigation: string }) {
  return (
    <div className="glass-card p-8 rounded-3xl border-white/5 bg-[#05070a] border-t-4 border-t-indigo-500 shadow-xl">
       <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4 italic">{title}</h4>
       <p className="text-[11px] text-slate-400 leading-relaxed mb-6 italic">{desc}</p>
       <div className="pt-4 border-t border-white/5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Risk Mitigation</p>
          <p className="text-[10px] text-white font-black italic">{mitigation}</p>
       </div>
    </div>
  );
}
