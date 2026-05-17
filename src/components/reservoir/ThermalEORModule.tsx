import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, Thermometer, Waves, ChevronDown, Zap, ShieldAlert, RotateCw, Factory, ArrowDownToLine, Radio, LineChart as ChartIcon, 
  Settings, Activity, Layers, Target, FileText, Droplets, Zap as ZapIcon, ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculateSAGDRate, calculateMarxLangenheimArea } from '../../lib/reservoir';

export function ThermalEORModule() {
  const [activePhase, setActivePhase] = useState<'5A' | '5B' | '5C' | '5D' | '5E'>('5A');
  
  // Phase 5A: Steam Flooding
  const [timeDays, setTimeDays] = useState(100);
  const [thickness, setThickness] = useState(50);
  
  // Phase 5C: SAGD
  const [perm, setPerm] = useState(500); // md
  const [payZone, setPayZone] = useState(20); // m
  const [muHeated, setMuHeated] = useState(10); // cp

  const heatEfficiency = useMemo(() => calculateMarxLangenheimArea(timeDays, thickness), [timeDays, thickness]);
  const sagdRate = useMemo(() => calculateSAGDRate(perm, payZone, muHeated), [perm, payZone, muHeated]);

  const phases = [
    { id: '5A', name: 'Steam Flood', icon: Waves },
    { id: '5B', name: 'CSS', icon: RotateCw },
    { id: '5C', name: 'SAGD', icon: ArrowDownToLine },
    { id: '5D', name: 'In-Situ Comb', icon: Flame },
    { id: '5E', name: 'Other', icon: Zap }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Flame className="text-red-500" size={36} />
            Phase 5: Thermal EOR <span className="text-red-500/50">Viscosity Reduction</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Heavy Oil & Oil Sands Recovery</p>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit mt-4 flex-wrap gap-1 backdrop-blur-md">
          {phases.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id as any)}
              className={cn(
                "px-6 py-2.5 rounded-[14px] flex items-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest",
                activePhase === p.id 
                  ? "bg-red-600 text-white shadow-lg shadow-red-500/20" 
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
                {/* --- 5A: Steam Flooding --- */}
                {activePhase === '5A' && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-4 space-y-8">
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] space-y-8">
                           <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2 mb-6 italic">
                              <Thermometer size={14} /> Heat Loss Parameters
                           </h4>
                           <InputWithSlider label="Time Since Injection (Days)" value={timeDays} min={10} max={1000} step={10} unit="d" onChange={setTimeDays} />
                           <InputWithSlider label="Reservoir Thickness (ft)" value={thickness} min={10} max={150} step={5} unit="ft" onChange={setThickness} />
                           
                           <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl mt-8 text-center">
                              <p className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-2 italic">Heating Efficiency</p>
                              <p className="text-5xl font-black text-white italic tracking-tighter">{(heatEfficiency * 100).toFixed(1)}<span className="text-xl text-slate-500 not-italic">%</span></p>
                              <p className="text-[10px] text-slate-500 mt-4 leading-relaxed font-medium">Heat loss to overburden/underburden over time.</p>
                           </div>
                        </div>
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-white/5">
                           <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 italic">
                              <ShieldCheck size={14} className="text-red-500" /> Operational Limit
                           </h5>
                           <p className="text-[11px] text-slate-400 leading-relaxed italic">"Economically viable cumulative SOR: <span className="text-white font-bold">&lt; 4.0</span>. Current efficiency suggests steam quality must exceed <span className="text-white font-bold">78%</span>."</p>
                        </div>
                      </div>

                      <div className="lg:col-span-8 flex flex-col gap-8">
                         <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[500px] flex items-center justify-center relative overflow-hidden">
                            <SteamFlood3D efficiency={heatEfficiency} />
                         </div>
                         <div className="grid grid-cols-3 gap-6">
                            <ConceptCard title="Steam Zone" desc="Near injector, contains residual oil and steam vapor." />
                            <ConceptCard title="Hot Water" desc="Mobilizes oil bank ahead of the steam chamber." />
                            <ConceptCard title="Oil Bank" desc="Heated mobilized oil mass pushed toward producer." />
                         </div>
                      </div>
                   </div>
                )}

                {/* --- 5B: CSS --- */}
                {activePhase === '5B' && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-4 flex flex-col gap-8">
                        <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] flex-1">
                           <h3 className="text-2xl font-black text-white italic mb-4 uppercase tracking-tighter">Cyclic Steam (Huff & Puff)</h3>
                           <p className="text-[11px] text-slate-400 leading-relaxed mb-8 italic">
                              Viscosity reduction via periodic steam injection, soaking, and production phases within a single wellbore.
                           </p>
                           <div className="space-y-4">
                              <PhaseStep num="1" title="Injection (Huff)" desc="1-4 weeks of high-pressure steam." color="red" />
                              <PhaseStep num="2" title="Soak" desc="3-7 days shut-in for thermal equilibrium." color="amber" />
                              <PhaseStep num="3" title="Production (Puff)" desc="Mobilized oil flow until thermal depletion." color="green" />
                           </div>
                        </div>
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-red-900/10 text-center">
                           <RotateCw className="text-red-500 mx-auto mb-4" />
                           <h5 className="text-[10px] font-black text-white uppercase tracking-widest italic">Phase Synchronization</h5>
                           <p className="text-[11px] text-slate-500 uppercase mt-2 font-bold tracking-widest">Cycle 4: Active</p>
                        </div>
                      </div>

                      <div className="lg:col-span-8">
                         <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[600px] flex items-center justify-center relative overflow-hidden">
                            <CSSCycles3D />
                         </div>
                      </div>
                   </div>
                )}

                {/* --- 5C: SAGD --- */}
                {activePhase === '5C' && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-4 space-y-6">
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] space-y-6">
                           <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2 mb-6 italic">
                              <ArrowDownToLine size={14} /> SAGD Butler Parameters
                           </h4>
                           <InputWithSlider label="Vertical Permeability (md)" value={perm} min={100} max={5000} step={100} unit="md" onChange={setPerm} />
                           <InputWithSlider label="Pay Zone Thickness (m)" value={payZone} min={10} max={50} step={2} unit="m" onChange={setPayZone} />
                           <InputWithSlider label="Heated Oil Viscosity (cp)" value={muHeated} min={1} max={50} step={1} unit="cp" onChange={setMuHeated} />
                           
                           <div className="p-8 bg-red-600/10 border border-red-500/20 rounded-2xl mt-8 text-center">
                              <p className="text-[10px] text-red-400 font-black uppercase mb-2 italic">Theoretical Production</p>
                              <p className="text-4xl font-black text-white italic tracking-tighter">{sagdRate.toLocaleString(undefined, {maximumFractionDigits:0})} <span className="text-xl text-slate-500 not-italic">STB/d</span></p>
                           </div>
                        </div>
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-white/5">
                           <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 italic">
                              <Settings size={14} className="text-red-500" /> Steam Trap Control
                           </h5>
                           <p className="text-[11px] text-slate-400 leading-relaxed italic">"Sub-cool setpoint: <span className="text-white font-bold">12°C</span>. Preventing live steam breakthrough to production liner."</p>
                        </div>
                      </div>
                      
                      <div className="lg:col-span-8 flex flex-col gap-8">
                         <div className="glass-card rounded-3xl p-10 border-white/5 bg-gradient-to-tr from-[#05070a] to-red-900/10 h-[500px] flex items-center justify-center relative overflow-hidden">
                            <SAGDChamber3D payZone={payZone} />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <ConceptCard title="Gravity Drainage" desc="Heated oil and condensate flow along steam chamber edges." />
                            <ConceptCard title="Dual Horizontal" desc="Parallel wellbore architecture, typically 5m vertical separation." />
                         </div>
                      </div>
                   </div>
                )}

                {/* --- 5D: ISC --- */}
                {activePhase === '5D' && (
                   <div className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full flex flex-col justify-center items-center relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                         <InSituCombustion3D />
                      </div>
                      
                      <div className="relative z-10 text-center max-w-2xl mt-[300px]">
                         <h3 className="text-4xl font-black text-white italic tracking-tighter mb-4 uppercase">In-Situ Combustion (Fireflood)</h3>
                         <p className="text-sm text-slate-400 font-medium leading-relaxed mb-12 italic">
                            Subsurface ignition sustainment via air injection. Cracking residual oil into fuel coke to advance the 600°C combustion front.
                         </p>
                         
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-white/5 rounded-3xl border border-orange-500/20 backdrop-blur-md">
                               <h5 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2 italic">Wet Combustion</h5>
                               <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Water co-injection for enhanced heat transport (COFCAW).</p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-3xl border border-orange-500/20 backdrop-blur-md">
                               <h5 className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2 italic">THAI Process</h5>
                               <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Toe-to-Heel air injection with horizontal production.</p>
                            </div>
                            <div className="p-6 bg-red-900/20 rounded-3xl border border-red-500/30 backdrop-blur-md">
                               <h5 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2 italic"><ShieldAlert size={12}/> Risks</h5>
                               <p className="text-[11px] text-slate-400 leading-relaxed font-medium">H2S/CO2 corrosion and massive compression costs.</p>
                            </div>
                         </div>
                      </div>
                   </div>
                )}

                {/* --- 5E: Other --- */}
                {activePhase === '5E' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] flex flex-col justify-between">
                         <div>
                            <h3 className="text-3xl font-black text-white italic mb-6 flex items-center gap-4 uppercase tracking-tighter"><Thermometer className="text-amber-500" size={32}/> Hot Water Flood</h3>
                            <p className="text-sm text-slate-400 leading-relaxed italic mb-8">
                               Low-enthalpy alternative for thin reservoirs or permafrost zones where steam generation is energetically restricted.
                            </p>
                         </div>
                         <div className="h-48 flex items-center justify-center bg-white/5 rounded-2xl">
                            <HotWater3D />
                         </div>
                      </div>
                      <div className="glass-card rounded-3xl p-12 border-white/5 bg-gradient-to-br from-[#05070a] to-blue-900/20 flex flex-col justify-between">
                         <div>
                            <h3 className="text-3xl font-black text-white italic mb-6 flex items-center gap-4 uppercase tracking-tighter"><Radio className="text-blue-500" size={32}/> EM Heating</h3>
                            <p className="text-sm text-slate-400 leading-relaxed italic mb-8">
                               Volumetric heating via electromagnetic radiation (RF) or electrical resistance for pre-heating and sidetrack mobilization.
                            </p>
                         </div>
                         <div className="h-48 flex items-center justify-center bg-white/5 rounded-2xl">
                            <EMHeating3D />
                         </div>
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

function SteamFlood3D({ efficiency }: { efficiency: number }) {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[500px]">
      <g transform="translate(50, 50)">
        {/* Reservoir Layers */}
        <rect x="0" y="50" width="400" height="100" fill="#1e293b" fillOpacity="0.3" rx="10" />
        {/* Steam Front */}
        <motion.path 
          d={`M 0 50 Q ${200 * efficiency} 100 0 150`}
          fill="#f43f5e"
          fillOpacity="0.2"
          stroke="#f43f5e"
          strokeWidth="3"
          animate={{ d: [`M 0 50 Q ${200 * efficiency} 100 0 150`, `M 0 50 Q ${250 * efficiency} 100 0 150`, `M 0 50 Q ${200 * efficiency} 100 0 150`] }}
          transition={{ repeat: Infinity, duration: 4 }}
        />
        {/* Heat loss vectors to caprock */}
        {[0, 1, 2, 3, 4].map(i => (
          <motion.path 
            key={i} d={`M ${50 + i*60} 50 L ${50 + i*60} 20`}
            stroke="#f43f5e" strokeWidth="2" strokeOpacity="0.2"
            animate={{ y: [0, -10, 0], opacity: [0.1, 0.5, 0.1] }}
            transition={{ repeat: Infinity, duration: 2, delay: i*0.4 }}
          />
        ))}
        {/* Flow particles */}
        {[...Array(15)].map((_, i) => (
          <motion.circle 
            key={i} r="2" fill="#f43f5e"
            initial={{ cx: 0, cy: 50 + Math.random()*100 }}
            animate={{ cx: [0, 400], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 3 + Math.random()*2, delay: i*0.5 }}
          />
        ))}
        {/* Wells */}
        <rect x="-5" y="0" width="10" height="200" fill="#475569" rx="5" />
        <rect x="395" y="0" width="10" height="200" fill="#475569" rx="5" />
      </g>
      <text x="250" y="270" fill="#f43f5e" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Marx-Langenheim Thermal Propagation Stream</text>
    </svg>
  );
}

function CSSCycles3D() {
  const [phase, setPhase] = useState(0); // 0: Huff, 1: Soak, 2: Puff
  React.useEffect(() => {
    const interval = setInterval(() => setPhase(p => (p + 1) % 3), 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
      <g transform="translate(100, 50)">
        {/* Reservoir Matrix */}
        <circle cx="150" cy="150" r="120" fill="#0f172a" stroke="#ffffff10" />
        {/* Heat Halo */}
        <motion.circle 
          cx="150" cy="150" r={phase === 0 ? 40 : phase === 1 ? 100 : 60}
          fill={phase === 0 ? "#f43f5e" : phase === 1 ? "#fbbf24" : "#10b981"}
          fillOpacity="0.1"
          stroke={phase === 0 ? "#f43f5e" : phase === 1 ? "#fbbf24" : "#10b981"}
          strokeWidth="2"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        {/* Wellbore */}
        <circle cx="150" cy="150" r="10" fill="#475569" />
        {/* Kinetics */}
        {phase === 0 && ( // Huff: Injection outwards
          [0, 45, 90, 135, 180, 225, 270, 315].map(a => (
            <motion.path 
              key={a} d={`M 150 150 L ${150 + Math.cos(a*Math.PI/180)*80} ${150 + Math.sin(a*Math.PI/180)*80}`}
              stroke="#f43f5e" strokeWidth="2" strokeDasharray="5,5"
              animate={{ strokeDashoffset: [20, 0] }} transition={{ repeat: Infinity, duration: 0.5 }}
            />
          ))
        )}
        {phase === 2 && ( // Puff: Production inwards
          [0, 45, 90, 135, 180, 225, 270, 315].map(a => (
            <motion.path 
              key={a} d={`M ${150 + Math.cos(a*Math.PI/180)*80} ${150 + Math.sin(a*Math.PI/180)*80} L 150 150`}
              stroke="#10b981" strokeWidth="2" strokeDasharray="5,5"
              animate={{ strokeDashoffset: [0, 20] }} transition={{ repeat: Infinity, duration: 0.5 }}
            />
          ))
        )}
        <text x="150" y="320" fill="#f43f5e" fontSize="12" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">
          {phase === 0 ? "INJECTION PHASE" : phase === 1 ? "SOAKING PHASE" : "PRODUCTION PHASE"}
        </text>
      </g>
    </svg>
  );
}

function SAGDChamber3D({ payZone }: { payZone: number }) {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[600px]">
      <g transform="translate(100, 50)">
        {/* Formation */}
        <rect x="0" y="0" width="300" height="200" fill="#1e293b" fillOpacity="0.2" rx="20" />
        {/* Steam Chamber (Expanding) */}
        <motion.path 
          d={`M 150 150 Q 50 100 150 50 Q 250 100 150 150`}
          fill="#f43f5e" fillOpacity="0.1" stroke="#f43f5e" strokeWidth="2"
          animate={{ d: [`M 150 150 Q 50 100 150 50 Q 250 100 150 150`, `M 150 150 Q 30 80 150 20 Q 270 80 150 150`, `M 150 150 Q 50 100 150 50 Q 250 100 150 150`] }}
          transition={{ repeat: Infinity, duration: 8 }}
        />
        {/* Oil Drainage Paths */}
        {[0, 1, 2, 3].map(i => (
          <motion.path 
            key={i} d={`M ${50 + i*20} 100 Q 150 160 150 180`}
            fill="none" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.4"
            animate={{ pathLength: [0, 1], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: i*0.5 }}
          />
        ))}
        {/* Horizontal Well Pair */}
        <circle cx="150" cy="150" r="6" fill="#f43f5e" /> {/* Injector */}
        <circle cx="150" cy="180" r="6" fill="#fbbf24" /> {/* Producer */}
        <text x="150" y="230" fill="#f43f5e" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Kinetic Steam Chamber Expansion & Gravity Drainage</text>
      </g>
    </svg>
  );
}

function InSituCombustion3D() {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full">
      <defs>
        <radialGradient id="fireGrad">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <g transform="translate(100, 50)">
        {/* Wells */}
        <line x1="0" y1="0" x2="0" y2="200" stroke="#475569" strokeWidth="4" />
        <line x1="300" y1="0" x2="300" y2="200" stroke="#475569" strokeWidth="4" />
        {/* Combustion Front */}
        <motion.circle 
          cx="100" cy="100" r="60" fill="url(#fireGrad)" fillOpacity="0.4"
          animate={{ cx: [50, 250], scale: [0.8, 1.2, 0.8] }}
          transition={{ repeat: Infinity, duration: 10 }}
        />
        {/* Smoke/Gas Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.circle 
            key={i} r="2" fill="#94a3b8"
            initial={{ cx: 100, cy: 100 }}
            animate={{ cx: [100, 300], cy: [100, 100 + (Math.random()-0.5)*50], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 4, delay: i*0.2 }}
          />
        ))}
      </g>
      <text x="250" y="270" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">In-Situ Thermal Cracking & Front Propagation</text>
    </svg>
  );
}

function HotWater3D() {
  return (
    <svg viewBox="0 0 400 150" className="w-full h-full">
       <g transform="translate(50, 25)">
          <rect x="0" y="30" width="300" height="40" fill="#0369a1" fillOpacity="0.2" rx="10" />
          {[...Array(10)].map((_, i) => (
            <motion.circle 
              key={i} r="3" fill="#0ea5e9"
              animate={{ cx: [0, 300], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 4, delay: i*0.4 }}
            />
          ))}
          <line x1="0" y1="0" x2="0" y2="100" stroke="#475569" strokeWidth="3" />
          <line x1="300" y1="0" x2="300" y2="100" stroke="#475569" strokeWidth="3" />
       </g>
    </svg>
  );
}

function EMHeating3D() {
  return (
    <svg viewBox="0 0 400 150" className="w-full h-full">
       <g transform="translate(200, 75)">
          <motion.circle 
            r="40" fill="none" stroke="#3b82f6" strokeWidth="2"
            animate={{ scale: [1, 3], opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <motion.circle 
            r="20" fill="none" stroke="#3b82f6" strokeWidth="2"
            animate={{ scale: [1, 2.5], opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
          />
          <rect x="-5" y="-50" width="10" height="100" fill="#475569" rx="5" />
       </g>
    </svg>
  );
}

// ─── Visual Figure: Concept Card ───────────────────────────────────────────

function ConceptCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-6 border border-white/5 rounded-2xl bg-white/5 hover:border-red-500/30 transition-all group">
       <h5 className="text-[11px] font-black text-white uppercase tracking-widest mb-2 group-hover:text-red-400 transition-colors">{title}</h5>
       <p className="text-[10px] text-slate-400 leading-relaxed italic">{desc}</p>
    </div>
  );
}

function PhaseStep({ num, title, desc, color }: { num: string, title: string, desc: string, color: string }) {
  const colorMap: any = {
    red: "bg-red-500/20 text-red-500 border-red-500/20",
    amber: "bg-amber-500/20 text-amber-500 border-amber-500/20",
    green: "bg-green-500/20 text-green-500 border-green-500/20"
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
