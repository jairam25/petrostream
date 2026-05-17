import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplet, Layers, Beaker, Network, Maximize2, MoveVertical, MountainSnow
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';

export function LowSalinityModule() {
  const [activePhase, setActivePhase] = useState<'7A' | '7B' | '7C'>('7A');
  
  // Phase 7C: Design
  const [salinity, setSalinity] = useState(2500); // ppm

  const phases = [
    { id: '7A', name: 'Mechanisms', icon: Layers },
    { id: '7B', name: 'Lithology', icon: MountainSnow },
    { id: '7C', name: 'Design', icon: Beaker }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Droplet className="text-teal-500" size={32} />
            Phase 7: Low Salinity Water <span className="text-teal-500/50">Smart Water</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Wettability Alteration via Ionic Tuning</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit mt-4 flex-wrap gap-1">
          {phases.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id as any)}
              className={cn(
                "px-5 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
                activePhase === p.id 
                  ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" 
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
                {/* --- 7A: Mechanisms --- */}
                {activePhase === '7A' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <MechanismCard 
                        icon={Network} title="Multi-Ion Exchange (MIE)" 
                        desc="Exchange of multivalent cations (Ca²⁺, Mg²⁺) with monovalent cations at the clay surface, releasing bound oil." 
                        color="text-teal-500" bg="bg-teal-500/10" 
                      />
                      <MechanismCard 
                        icon={Maximize2} title="Double Layer Expansion" 
                        desc="Lower salinity expands the electrical double layer between clay and oil interfaces, increasing electrostatic repulsion." 
                        color="text-blue-500" bg="bg-blue-500/10" 
                      />
                      <MechanismCard 
                        icon={MoveVertical} title="Fine Migration" 
                        desc="Clay particles detach and migrate, exposing new water-wet surfaces and locally diverting flow to unswept pores." 
                        color="text-indigo-500" bg="bg-indigo-500/10" 
                      />
                      <MechanismCard 
                        icon={Beaker} title="pH Increase" 
                        desc="Localized increase in pH near clay surfaces acts similarly to an alkaline flood, generating in-situ surfactants." 
                        color="text-green-500" bg="bg-green-500/10" 
                      />
                      <MechanismCard 
                        icon={MountainSnow} title="Mineral Dissolution" 
                        desc="Dissolution of carbonate cementing materials (e.g., calcite, anhydrite) altering rock topology and wettability." 
                        color="text-yellow-500" bg="bg-yellow-500/10" 
                      />
                   </div>
                )}

                {/* --- 7B: Lithology (Sandstone vs Carbonate) --- */}
                {activePhase === '7B' && (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-gradient-to-br from-[#05070a] to-amber-900/10">
                         <h3 className="text-2xl font-black text-amber-500 italic mb-6 flex items-center gap-3"><MountainSnow /> Sandstone Formations</h3>
                         <div className="space-y-6">
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                               In sandstones, LSW mechanisms are heavily dependent on the presence of clay minerals (kaolinite, illite, chlorite).
                            </p>
                            <div className="p-5 border border-amber-500/20 rounded-2xl bg-amber-500/5">
                               <h5 className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-2">Primary Drivers</h5>
                               <ul className="text-[10px] text-slate-400 space-y-2 list-disc pl-4">
                                  <li>Clay-related Multi-Ion Exchange (MIE).</li>
                                  <li>Electrical Double Layer Expansion (causing oil detachment).</li>
                                  <li>Clay swelling and fines migration.</li>
                               </ul>
                            </div>
                         </div>
                      </div>
                      
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-gradient-to-br from-[#05070a] to-stone-400/10">
                         <h3 className="text-2xl font-black text-stone-300 italic mb-6 flex items-center gap-3"><Layers /> Carbonate Formations</h3>
                         <div className="space-y-6">
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                               In carbonates (limestone, dolomite), simple dilution isn't enough. The ionic composition must be actively "tuned" (Smart Water).
                            </p>
                            <div className="p-5 border border-stone-500/20 rounded-2xl bg-white/5">
                               <h5 className="text-[11px] font-bold text-stone-300 uppercase tracking-widest mb-2">Potential Determining Ions (PDIs)</h5>
                               <ul className="text-[10px] text-slate-400 space-y-2 list-disc pl-4">
                                  <li><strong>Sulfate (SO₄²⁻):</strong> Acts as a catalyst, adsorbing to the positive chalk surface and reducing charge.</li>
                                  <li><strong>Calcium (Ca²⁺) & Magnesium (Mg²⁺):</strong> Co-adsorb with sulfate at high temperatures to detach carboxylic oil components.</li>
                               </ul>
                            </div>
                         </div>
                      </div>
                   </div>
                )}

                {/* --- 7C: Design --- */}
                {activePhase === '7C' && (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] space-y-8">
                         <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                            <Beaker size={14} /> Fluid Salinity Design
                         </h4>
                         <InputWithSlider label="Injected Water Salinity (ppm)" value={salinity} min={500} max={10000} step={100} unit="ppm" onChange={setSalinity} />
                         
                         <div className="p-6 bg-teal-500/10 border border-teal-500/20 rounded-3xl mt-8">
                            <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mb-2">Expected Incremental OOIP</p>
                            <p className="text-4xl font-black text-white italic">
                               {salinity >= 1000 && salinity <= 5000 ? "1 - 5" : (salinity < 1000 ? "Risk of Fines" : "Minimal")} 
                               <span className="text-xl text-slate-500 not-italic"> %</span>
                            </p>
                            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                               Target salinity is typically between 1,000 and 5,000 ppm. Too high = no effect. Too low = severe formation damage from clay swelling.
                            </p>
                         </div>
                      </div>
                      
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] space-y-6">
                         <h3 className="text-xl font-black text-white italic mb-6">Field Implementation</h3>
                         <ul className="space-y-4">
                            <li className="flex gap-3 items-start">
                               <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold mt-0.5">1</span>
                               <p className="text-[11px] text-slate-400"><strong className="text-white block">Water Source:</strong> Usually requires massive reverse osmosis (RO) desalinization plants offshore (e.g., BP Clair Ridge).</p>
                            </li>
                            <li className="flex gap-3 items-start">
                               <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold mt-0.5">2</span>
                               <p className="text-[11px] text-slate-400"><strong className="text-white block">Verification:</strong> Single Well Chemical Tracer Tests (SWCTT) are the gold standard for verifying residual oil saturation reduction before field-wide roll-out.</p>
                            </li>
                            <li className="flex gap-3 items-start">
                               <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold mt-0.5">3</span>
                               <p className="text-[11px] text-slate-400"><strong className="text-white block">Cost Profile:</strong> Low OPEX per barrel compared to chemical EOR, but requires significant upfront CAPEX for RO facilities.</p>
                            </li>
                         </ul>
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

function MechanismCard({ icon: Icon, title, desc, color, bg }: { icon: any, title: string, desc: string, color: string, bg: string }) {
  return (
    <div className="glass-card p-8 rounded-2xl border-white/5 bg-[#05070a] group hover:border-teal-500/30 transition-all flex flex-col items-start">
       <div className={cn("p-4 rounded-2xl mb-6", bg, color)}>
         <Icon size={24} />
       </div>
       <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-3">{title}</h4>
       <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
