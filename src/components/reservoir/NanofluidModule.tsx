import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Atom, Box, Settings, Layers, Lock, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';

export function NanofluidModule() {
  const [activePhase, setActivePhase] = useState<'8A' | '8B' | '8C'>('8A');
  
  // Phase 8C: Concentration & Plugging
  const [concentration, setConcentration] = useState(0.1); // wt%
  const [size, setSize] = useState(20); // nm

  const riskScore = concentration * (size / 10); // arbitrary risk proxy

  const phases = [
    { id: '8A', name: 'Nano Types', icon: Box },
    { id: '8B', name: 'Mechanisms', icon: Layers },
    { id: '8C', name: 'Injectivity', icon: Settings }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Atom className="text-violet-500" size={32} />
            Phase 8: Nanofluid EOR <span className="text-violet-500/50">Smart Particles</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Disjoining Pressure & Log-jamming</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit mt-4 flex-wrap gap-1">
          {phases.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id as any)}
              className={cn(
                "px-5 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
                activePhase === p.id 
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" 
                  : "text-slate-500 hover:text-white"
              )}
            >
              <p.icon size={14} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <AnimatePresence mode="wait">
             <motion.div
               key={activePhase}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="h-full"
             >
                {/* --- 8A: Nano Types & Surface Mods --- */}
                {activePhase === '8A' && (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-gradient-to-br from-[#05070a] to-violet-900/10">
                         <h3 className="text-2xl font-black text-white italic mb-6">Nanoparticle Types</h3>
                         <div className="space-y-4">
                            <NanoCard title="Silica (SiO₂)" desc="Most common. Cheap, easy to surface modify, hydrophilic by default." />
                            <NanoCard title="Alumina (Al₂O₃) & Titania (TiO₂)" desc="Used for specific wettability alteration. Often higher density." />
                            <NanoCard title="Iron Oxide (Fe₂O₃)" desc="Magnetic properties. Can be manipulated via external magnetic fields." />
                            <NanoCard title="Carbon Nanotubes / Graphene" desc="Exceptional strength and thermal conductivity. Extremely expensive." />
                         </div>
                      </div>
                      
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] flex flex-col justify-center">
                         <ShieldCheck size={48} className="text-violet-500 mb-6" />
                         <h3 className="text-2xl font-black text-white italic mb-4">Surface Modification</h3>
                         <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
                            Raw nanoparticles rapidly aggregate in high salinity reservoir brines. They must be coated to ensure stability and transportability.
                         </p>
                         <ul className="text-[10px] text-slate-400 space-y-3 list-disc pl-4">
                            <li><strong className="text-white">PEG Coating:</strong> Polyethylene glycol provides steric hindrance against aggregation.</li>
                            <li><strong className="text-white">Silane Treatment:</strong> Modifies the hydrophobicity (water-wet vs oil-wet preference).</li>
                            <li><strong className="text-white">Polymer Grafting:</strong> Attaching polymer chains directly to the nano-core.</li>
                         </ul>
                      </div>
                   </div>
                )}

                {/* --- 8B: Mechanisms --- */}
                {activePhase === '8B' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-violet-900/10 border-violet-500/20">
                         <h3 className="text-xl font-black text-violet-400 italic mb-4">Structural Disjoining Pressure</h3>
                         <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
                            Nanoparticles form a structured wedge-like film at the three-phase contact line (oil-rock-water). The immense osmotic pressure generated at the vertex of this nano-wedge physically peels the oil droplet off the rock surface.
                         </p>
                         <div className="h-32 rounded-2xl bg-[#05070a] border border-white/5 flex items-center justify-center relative overflow-hidden">
                            {/* Abstract visual of wedge */}
                            <div className="absolute left-0 bottom-0 w-full h-4 bg-stone-700" /> {/* Rock */}
                            <div className="absolute right-8 bottom-4 w-32 h-20 bg-amber-900/50 rounded-tl-full rounded-bl-full" /> {/* Oil */}
                            <div className="absolute left-4 bottom-4 flex gap-1 items-end">
                               {[...Array(12)].map((_, i) => (
                                 <div key={i} className="w-2 h-2 rounded-full bg-violet-500" style={{ transform: `translateY(-${i*2}px)` }} />
                               ))}
                            </div>
                            <p className="absolute text-[10px] font-black text-violet-500 uppercase tracking-widest top-4">Nano-Wedge Peeling Mechanism</p>
                         </div>
                      </div>

                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a]">
                         <h3 className="text-xl font-black text-white italic mb-4">Log-Jamming Effect</h3>
                         <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
                            While individual nanoparticles are orders of magnitude smaller than pore throats, they can temporarily bridge or "log-jam" in the throat. This localized pressure spike forces displacing fluid into adjacent, unswept pores before the jam clears.
                         </p>
                         <div className="flex gap-4 items-center">
                            <Lock className="text-slate-500" />
                            <div className="flex-1 h-2 bg-white/5 rounded-full relative">
                               <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 flex gap-0.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                 <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                 <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                               </div>
                            </div>
                            <Lock className="text-slate-500" />
                         </div>
                      </div>
                   </div>
                )}

                {/* --- 8C: Injectivity --- */}
                {activePhase === '8C' && (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] space-y-8">
                         <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                            <Settings size={14} /> Fluid Design
                         </h4>
                         <InputWithSlider label="Concentration (wt%)" value={concentration} min={0.01} max={1.5} step={0.01} unit="wt%" onChange={setConcentration} />
                         <InputWithSlider label="Primary Particle Size (nm)" value={size} min={5} max={100} step={5} unit="nm" onChange={setSize} />
                      </div>
                      
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] flex flex-col justify-center">
                         <div className={cn(
                            "p-8 rounded-3xl border transition-all flex flex-col items-center text-center",
                            riskScore > 1.0 ? "bg-red-500/10 border-red-500/50" : (riskScore > 0.4 ? "bg-amber-500/10 border-amber-500/50" : "bg-green-500/10 border-green-500/50")
                         )}>
                            {riskScore > 1.0 ? <AlertTriangle size={48} className="text-red-500 mb-4" /> : <ShieldCheck size={48} className={riskScore > 0.4 ? "text-amber-500 mb-4" : "text-green-500 mb-4"} />}
                            
                            <p className="text-[10px] font-bold uppercase mb-2 tracking-widest text-white">Formation Damage Risk</p>
                            <p className={cn("text-3xl font-black italic", riskScore > 1.0 ? "text-red-400" : (riskScore > 0.4 ? "text-amber-400" : "text-green-400"))}>
                               {riskScore > 1.0 ? "Severe Plugging" : (riskScore > 0.4 ? "Moderate Retention" : "Safe Transport")}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-4 leading-relaxed max-w-xs">
                               Higher concentrations (&gt;0.1 wt%) and larger particle sizes drastically increase the risk of severe pore throat plugging and total loss of injectivity.
                            </p>
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

function NanoCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-4 border border-white/5 rounded-2xl bg-white/5">
       <h5 className="text-[11px] font-bold text-white uppercase tracking-widest mb-1">{title}</h5>
       <p className="text-[10px] text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}
