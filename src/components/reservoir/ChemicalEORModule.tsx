import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplet, Activity, FlaskConical, TestTube, Bubbles, Wind, ArrowRight, TrendingDown,
  Zap, Beaker, ShieldCheck, RefreshCcw, Layers, Scaling, Target, ArrowDownUp,
  Microscope, Atom, Waves, Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculateCapillaryNumber, calculateChunHuhIFT } from '../../lib/reservoir';

export function ChemicalEORModule() {
  const [activePhase, setActivePhase] = useState<'3A' | '3B' | '3C' | '3D' | '3E'>('3A');
  
  // Phase 3A: Polymer
  const [polymerViscosity, setPolymerViscosity] = useState(25);
  const [waterViscosity, setWaterViscosity] = useState(0.8);
  const [kWaterInit, setKWaterInit] = useState(100);
  const [kWaterAfter, setKWaterAfter] = useState(40);
  
  // Phase 3B: Surfactant
  const [solubilizationRatio, setSolubilizationRatio] = useState(15);
  const [velocity, setVelocity] = useState(1.0);
  
  // Phase 3C: Alkaline
  const [tan, setTan] = useState(0.5);

  const phases = [
    { id: '3A', name: 'Polymer', icon: Droplet, color: 'pink' },
    { id: '3B', name: 'Surfactant', icon: Microscope, color: 'orange' },
    { id: '3C', name: 'Alkaline', icon: Beaker, color: 'emerald' },
    { id: '3D', name: 'ASP Synergy', icon: Sparkles, color: 'indigo' },
    { id: '3E', name: 'Foam Control', icon: Bubbles, color: 'cyan' }
  ];

  const calculatedIft = useMemo(() => calculateChunHuhIFT(solubilizationRatio), [solubilizationRatio]);
  const currentNc = calculateCapillaryNumber(velocity * 0.3048 / 86400, waterViscosity / 1000, calculatedIft / 1000);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-4">
            <FlaskConical className="text-pink-500" size={36} />
            Phase 3: Chemical EOR <span className="text-pink-500/50">Molecular Solutions</span>
          </h2>
          <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-widest italic">Tertiary Recovery & Interfacial Tension Reduction Mechanics</p>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit mt-4 flex-wrap gap-1 backdrop-blur-md">
          {phases.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id as any)}
              className={cn(
                "px-6 py-2.5 rounded-[14px] flex items-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest",
                activePhase === p.id 
                  ? `bg-${p.color}-600 text-white shadow-lg shadow-${p.color}-500/20` 
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
        <div className="lg:col-span-3 space-y-6">
           <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
              <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-8 italic">Fluid Kinetics</h4>
              <div className="space-y-8">
                 {activePhase === '3A' && (
                    <>
                       <InputWithSlider label="Polymer Viscosity" value={polymerViscosity} min={5} max={100} step={1} unit="cP" onChange={setPolymerViscosity} />
                       <InputWithSlider label="Perm Reduction" value={kWaterInit / kWaterAfter} min={1} max={10} step={0.1} unit="RRF" onChange={(v) => setKWaterAfter(kWaterInit / v)} />
                    </>
                 )}
                 {activePhase === '3B' && (
                    <>
                       <InputWithSlider label="Solubilization" value={solubilizationRatio} min={1} max={50} step={1} unit="ratio" onChange={setSolubilizationRatio} />
                       <InputWithSlider label="Velocity" value={velocity} min={0.1} max={5} step={0.1} unit="ft/d" onChange={setVelocity} />
                    </>
                 )}
                 {activePhase === '3C' && (
                    <InputWithSlider label="Total Acid Number" value={tan} min={0} max={3} step={0.1} unit="mg KOH/g" onChange={setTan} />
                 )}
                 <div className="pt-4 border-t border-white/5">
                    <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest mb-4">Baseline Brine</p>
                    <InputWithSlider label="Brine Visco" value={waterViscosity} min={0.3} max={2.0} step={0.1} unit="cP" onChange={setWaterViscosity} />
                 </div>
              </div>
           </div>
           
           <div className="p-10 bg-pink-600/10 rounded-3xl border border-pink-500/20 text-center shadow-lg shadow-pink-500/5">
              <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-2 italic">Mobility Reduction</p>
              <p className="text-5xl font-black text-white italic tracking-tighter">
                {(polymerViscosity / waterViscosity).toFixed(1)}
              </p>
           </div>
        </div>

        <div className="lg:col-span-9 h-full">
          <AnimatePresence mode="wait">
             <motion.div
               key={activePhase}
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -10 }}
               className="h-full"
             >
                {/* --- 3A: Polymer --- */}
                {activePhase === '3A' && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-8 flex flex-col gap-8">
                         <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[500px] flex items-center justify-center relative overflow-hidden">
                            <PolymerChains3D viscosity={polymerViscosity} />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <ResultCard label="Resistance Factor" value={(polymerViscosity/waterViscosity).toFixed(1)} unit="RF" />
                            <ResultCard label="Residual Res Factor" value={(kWaterInit/kWaterAfter).toFixed(1)} unit="RRF" />
                         </div>
                      </div>
                      <div className="lg:col-span-4 space-y-6">
                         <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                            <h4 className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-6 italic">Rheological Shield</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed italic mb-8">
                               Polymer chains increase water viscosity and reduce effective permeability via adsorption, ensuring favorable mobility ratios for stable displacement.
                            </p>
                            <div className="space-y-4">
                               <DriveCard title="Entanglement" desc="HPAM chains create viscous drag." icon={RefreshCcw} />
                               <DriveCard title="Salinity Sensitivity" desc="Hardness causes chain collapse." icon={ShieldCheck} />
                            </div>
                         </div>
                      </div>
                   </div>
                )}

                {/* --- 3B: Surfactant --- */}
                {activePhase === '3B' && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-8 flex flex-col gap-8">
                         <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[550px] flex items-center justify-center relative overflow-hidden">
                            <CapillaryDesaturation3D nc={currentNc} />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <ResultCard label="Capillary Number" value={currentNc.toExponential(2)} unit="Nc" />
                            <ResultCard label="Equil. IFT" value={calculatedIft.toExponential(2)} unit="mN/m" />
                         </div>
                      </div>
                      <div className="lg:col-span-4 space-y-6">
                         <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                            <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-8 italic">IFT Reduction Engine</h4>
                            <div className="space-y-4">
                               <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                  Surfactants reduce interfacial tension by <span className="text-white font-bold">4 orders of magnitude</span> to mobilize trapped oil droplets.
                               </p>
                               <DriveCard title="Micellar Sweep" desc="Droplet mobilization via Nc shift." icon={Atom} />
                               <DriveCard title="Phase Behavior" desc="Windsor I, II, III transitions." icon={Scaling} />
                            </div>
                         </div>
                      </div>
                   </div>
                )}

                {/* --- 3C: Alkaline --- */}
                {activePhase === '3C' && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-8 flex flex-col gap-8">
                         <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[500px] flex items-center justify-center relative overflow-hidden">
                            <SoapGeneration3D tan={tan} />
                         </div>
                         <div className="p-8 bg-emerald-600/10 border border-emerald-500/20 rounded-3xl text-center">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 italic">In-Situ Soap Status</p>
                            <p className="text-4xl font-black text-white italic">{tan >= 0.2 ? 'REACTION VIABLE' : 'INSUFFICIENT ACIDITY'}</p>
                         </div>
                      </div>
                      <div className="lg:col-span-4 space-y-6">
                         <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6 italic">Chemical Saponification</h4>
                            <div className="space-y-4">
                               <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                  Alkali reacts with naphthenic acids in crude oil to form <span className="text-white font-bold">in-situ surfactants</span>.
                               </p>
                               <DriveCard title="Na2CO3 Preferred" desc="Lower rock consumption vs NaOH." icon={Beaker} />
                               <DriveCard title="Adsorption Buffering" desc="Protects high-cost surfactants." icon={Layers} />
                            </div>
                         </div>
                      </div>
                   </div>
                )}

                {/* --- 3D: ASP Synergy --- */}
                {activePhase === '3D' && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-12 glass-card rounded-3xl p-16 border-white/5 bg-gradient-to-tr from-[#05070a] via-indigo-900/10 to-[#05070a] flex flex-col items-center justify-center relative overflow-hidden">
                         <ASPSynergy3D />
                         <div className="mt-[350px] text-center max-w-2xl relative z-10">
                            <h3 className="text-4xl font-black text-white italic tracking-tighter mb-4 uppercase">ASP Thermodynamic Synergy</h3>
                            <p className="text-sm text-slate-400 leading-relaxed italic mb-8">
                               Integrated flooding strategy: Alkali reduces adsorption, Surfactant mobilizes oil, and Polymer ensures volumetric sweep stability.
                            </p>
                            <div className="grid grid-cols-3 gap-6">
                               <MetricChip icon={Beaker} label="Alkaline" color="emerald" />
                               <MetricChip icon={Microscope} label="Surfactant" color="orange" />
                               <MetricChip icon={Droplet} label="Polymer" color="pink" />
                            </div>
                         </div>
                      </div>
                   </div>
                )}

                {/* --- 3E: Foam --- */}
                {activePhase === '3E' && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-8 flex flex-col gap-8">
                         <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[550px] flex items-center justify-center relative overflow-hidden">
                            <FoamLamella3D />
                         </div>
                      </div>
                      <div className="lg:col-span-4 flex flex-col gap-6">
                         <ChallengeCard title="Foam Conformance" desc="Significantly reduces gas mobility in high-k thief zones." mitigation="Snap-off Generation" />
                         <ChallengeCard title="Oil Sensitivity" desc="Crude oil often destabilizes lamella structures." mitigation="AOS / Fluorosurfactants" />
                         <ChallengeCard title="Gravity Buffer" desc="Mitigates premature gas override in dipping beds." mitigation="Mobility Ratio Control" />
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

function PolymerChains3D({ viscosity }: { viscosity: number }) {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[500px]">
      <g transform="translate(100, 50)">
        {[...Array(8)].map((_, i) => (
          <motion.path 
            key={i} d={`M ${Math.random()*300} ${Math.random()*200} Q ${Math.random()*300} ${Math.random()*200} ${Math.random()*300} ${Math.random()*200}`}
            fill="none" stroke="#ec4899" strokeWidth={viscosity/5} strokeOpacity="0.3"
            animate={{ 
              d: [
                `M ${Math.random()*300} ${Math.random()*200} Q ${Math.random()*300} ${Math.random()*200} ${Math.random()*300} ${Math.random()*200}`,
                `M ${Math.random()*300} ${Math.random()*200} Q ${Math.random()*300} ${Math.random()*200} ${Math.random()*300} ${Math.random()*200}`
              ]
            }}
            transition={{ repeat: Infinity, duration: 5 + i, ease: "easeInOut" }}
          />
        ))}
        {/* Flowing particles */}
        {[...Array(15)].map((_, i) => (
          <motion.circle 
            key={i} r="3" fill="#ec4899"
            animate={{ cx: [0, 300], y: [Math.random()*200, Math.random()*200] }}
            transition={{ repeat: Infinity, duration: 4 + (viscosity/10), delay: i*0.2 }}
          />
        ))}
      </g>
      <text x="250" y="280" fill="#ec4899" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">HPAM Chain Entanglement & Viscosity Simulator</text>
    </svg>
  );
}

function CapillaryDesaturation3D({ nc }: { nc: number }) {
  const logNc = Math.log10(nc);
  return (
    <svg viewBox="0 0 500 350" className="w-full h-full max-w-[600px]">
      <g transform="translate(60, 50)">
        {/* Curve Frame */}
        <line x1="0" y1="250" x2="400" y2="250" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" />
        <line x1="0" y1="0" x2="0" y2="250" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" />
        
        {/* CDC Curve */}
        <motion.path 
          d="M 0 50 L 150 50 Q 250 50 350 230 L 400 240"
          fill="none" stroke="#f97316" strokeWidth="4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
        />
        
        {/* Current State Marker */}
        <motion.g 
          animate={{ x: Math.max(0, Math.min(400, (logNc + 7) * 50)) }}
          transition={{ duration: 1 }}
        >
          <motion.circle 
            r="8" fill="#3b82f6" cx="0" cy={logNc < -5 ? 50 : 50 + (logNc+5)*40}
            animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}
          />
        </motion.g>
      </g>
      <text x="250" y="340" fill="#f97316" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Capillary Number (Nc) vs Sor Relationship</text>
    </svg>
  );
}

function SoapGeneration3D({ tan }: { tan: number }) {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full">
      <g transform="translate(100, 50)">
        {/* Oil Bank */}
        <rect x="0" y="0" width="300" height="100" fill="#f59e0b" fillOpacity="0.2" rx="10" />
        {/* Brine Bank */}
        <rect x="0" y="105" width="300" height="100" fill="#10b981" fillOpacity="0.1" rx="10" />
        
        {/* Interface Reaction */}
        {[...Array(10)].map((_, i) => (
          <motion.circle 
            key={i} r="4" fill="#ffffff"
            initial={{ cx: i*30, cy: 102 }}
            animate={{ 
              scale: tan >= 0.2 ? [1, 1.5, 1] : [0.5, 0.5, 0.5],
              opacity: tan >= 0.2 ? [0.3, 1, 0.3] : [0.1, 0.1, 0.1]
            }}
            transition={{ repeat: Infinity, duration: 2, delay: i*0.1 }}
          />
        ))}
        {/* Saponification arrows */}
        {tan >= 0.2 && [0, 1, 2].map(i => (
          <motion.path 
            key={`a-${i}`} d={`M ${100+i*50} 80 L ${100+i*50} 120`}
            stroke="#ffffff" strokeWidth="2" strokeDasharray="4,2" strokeOpacity="0.4"
            animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2, delay: i*0.5 }}
          />
        ))}
      </g>
      <text x="250" y="280" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Interfacial Saponification Reaction Kinetics</text>
    </svg>
  );
}

function ASPSynergy3D() {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full">
      <g transform="translate(250, 200)">
        {/* Rotating Synergy Rings */}
        <motion.circle 
          r="120" fill="none" stroke="#ec4899" strokeWidth="2" strokeDasharray="20,10"
          animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        />
        <motion.circle 
          r="100" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="15,15"
          animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
        />
        <motion.circle 
          r="80" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="10,20"
          animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
        />
        
        {/* Core Synergy Center */}
        <motion.circle 
          r="40" fill="#6366f1" fillOpacity="0.1" stroke="#6366f1" strokeWidth="1"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 4 }}
        />
      </g>
    </svg>
  );
}

function FoamLamella3D() {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[500px]">
      <g transform="translate(100, 50)">
         {[0, 1, 2].map(i => (
           [0, 1, 2].map(j => (
             <motion.circle 
               key={`${i}-${j}`} r="30" fill="none" stroke="#22d3ee" strokeWidth="2" strokeOpacity="0.4"
               cx={i*70} cy={j*70}
               animate={{ scale: [1, 1.1, 1], r: [30, 35, 30] }}
               transition={{ repeat: Infinity, duration: 3 + i, delay: j*0.2 }}
             />
           ))
         ))}
         {/* Gas cycling through foam */}
         {[...Array(10)].map((_, i) => (
           <motion.circle 
             key={i} r="2" fill="#ffffff"
             animate={{ cx: [0, 200], y: [100, 100 + (Math.random()-0.5)*100], opacity: [0, 1, 0] }}
             transition={{ repeat: Infinity, duration: 10, delay: i }}
           />
         ))}
      </g>
      <text x="250" y="280" fill="#22d3ee" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Polyhedral Foam Lamella Resistance Model</text>
    </svg>
  );
}

// ─── Shared UI Components ──────────────────────────────────────────────────

function ResultCard({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="glass-card p-8 rounded-3xl border-white/5 bg-white/5 text-center group hover:border-pink-500/30 transition-all">
       <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mb-1 group-hover:text-pink-500 transition-colors">{label}</p>
       <h4 className="text-3xl font-black text-white italic tracking-tighter">{value} <span className="text-[10px] text-slate-600 not-italic uppercase tracking-widest font-bold">{unit}</span></h4>
    </div>
  );
}

function DriveCard({ title, desc, icon: Icon }: { title: string, desc: string, icon: any }) {
  return (
    <div className="p-5 border border-white/5 rounded-3xl bg-white/5 flex gap-4 items-start group hover:border-pink-500/30 transition-all">
       <div className="p-2 bg-pink-500/20 rounded-xl text-pink-400 group-hover:scale-110 transition-transform">
         <Icon size={16} />
       </div>
       <div>
         <h5 className="text-[11px] font-black text-white uppercase tracking-widest">{title}</h5>
         <p className="text-[10px] text-slate-400 mt-1 leading-relaxed italic">{desc}</p>
       </div>
    </div>
  );
}

function MetricChip({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
  const colorMap: any = {
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    pink: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
  };
  return (
    <div className={cn("px-6 py-4 rounded-2xl border flex items-center gap-3 transition-all hover:scale-105", colorMap[color])}>
       <Icon size={16} />
       <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}

function ChallengeCard({ title, desc, mitigation }: { title: string, desc: string, mitigation: string }) {
  return (
    <div className="glass-card p-8 rounded-3xl border-white/5 bg-[#05070a] border-t-4 border-t-pink-500 shadow-xl">
       <h4 className="text-sm font-black text-pink-400 uppercase tracking-widest mb-4 italic">{title}</h4>
       <p className="text-[11px] text-slate-400 leading-relaxed mb-6 italic">{desc}</p>
       <div className="pt-4 border-t border-white/5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Risk Mitigation</p>
          <p className="text-[10px] text-white font-black italic">{mitigation}</p>
       </div>
    </div>
  );
}
