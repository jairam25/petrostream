import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, Microscope, Leaf, Target, ShieldAlert, CheckCircle2, AlertCircle, Droplet, Wind, GitPullRequest
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';

export function MicrobialEORModule() {
  const [activePhase, setActivePhase] = useState<'6A' | '6B' | '6C'>('6A');
  
  // Phase 6B: Screening
  const [temp, setTemp] = useState(60); // C
  const [salinity, setSalinity] = useState(5); // %
  const [perm, setPerm] = useState(100); // md

  const isViable = temp < 80 && salinity < 10 && perm > 50;

  const phases = [
    { id: '6A', name: 'Mechanisms', icon: Dna },
    { id: '6B', name: 'Screening', icon: Target },
    { id: '6C', name: 'Nutrients & Ops', icon: Leaf }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Microscope className="text-emerald-500" size={32} />
            Phase 6: Microbial EOR <span className="text-emerald-500/50">Bio-Recovery</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">In-situ & Ex-situ Bioprocesses</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit mt-4 flex-wrap gap-1">
          {phases.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id as any)}
              className={cn(
                "px-5 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
                activePhase === p.id 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
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
                {/* --- 6A: Mechanisms --- */}
                {activePhase === '6A' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <MechanismCard 
                        icon={Droplet} title="Bio-surfactants" 
                        desc="Microbes produce surfactants that reduce Interfacial Tension (IFT) to mobilize residual oil." 
                        color="text-orange-500" bg="bg-orange-500/10" 
                      />
                      <MechanismCard 
                        icon={GitPullRequest} title="Biopolymers" 
                        desc="Production of high-molecular-weight polymers for mobility control and improved volumetric sweep." 
                        color="text-pink-500" bg="bg-pink-500/10" 
                      />
                      <MechanismCard 
                        icon={Wind} title="Biogas" 
                        desc="Generation of CO2 and CH4. Provides pressure support, oil swelling, and viscosity reduction." 
                        color="text-indigo-500" bg="bg-indigo-500/10" 
                      />
                      <MechanismCard 
                        icon={Leaf} title="Bio-acids" 
                        desc="Acids dissolve carbonate rock, increasing permeability and altering wettability towards water-wet." 
                        color="text-yellow-500" bg="bg-yellow-500/10" 
                      />
                      <MechanismCard 
                        icon={ShieldAlert} title="Selective Plugging" 
                        desc="Biomass blocks high-permeability thief zones, forcing displacing fluids into unswept matrix." 
                        color="text-red-500" bg="bg-red-500/10" 
                      />
                   </div>
                )}

                {/* --- 6B: Screening Tool --- */}
                {activePhase === '6B' && (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] space-y-8">
                         <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                            <Target size={14} /> MEOR Viability Envelope
                         </h4>
                         <InputWithSlider label="Reservoir Temperature (°C)" value={temp} min={20} max={120} step={1} unit="°C" onChange={setTemp} />
                         <InputWithSlider label="Salinity (%)" value={salinity} min={0} max={25} step={0.5} unit="%" onChange={setSalinity} />
                         <InputWithSlider label="Permeability (md)" value={perm} min={10} max={500} step={10} unit="md" onChange={setPerm} />
                      </div>
                      
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] flex flex-col justify-center items-center text-center">
                         {isViable ? (
                            <>
                               <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
                                  <CheckCircle2 size={48} className="text-emerald-500" />
                               </div>
                               <h3 className="text-3xl font-black text-emerald-400 italic mb-4">Highly Viable</h3>
                               <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm">
                                  Reservoir conditions are optimal for microbial survival and transport. Bacteria can thrive, reproduce, and mobilize oil effectively.
                               </p>
                            </>
                         ) : (
                            <>
                               <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
                                  <AlertCircle size={48} className="text-red-500" />
                               </div>
                               <h3 className="text-3xl font-black text-red-400 italic mb-4">Hostile Environment</h3>
                               <div className="text-[10px] text-slate-400 space-y-2 max-w-sm">
                                  {temp >= 80 && <p className="text-red-300">Temperature &ge; 80°C will denature/kill most microbes.</p>}
                                  {salinity >= 10 && <p className="text-red-300">Salinity &ge; 10% exceeds osmotic tolerance.</p>}
                                  {perm <= 50 && <p className="text-red-300">Permeability &le; 50 md prevents bacterial transport (pore throats too small).</p>}
                               </div>
                            </>
                         )}
                      </div>
                   </div>
                )}

                {/* --- 6C: Ops --- */}
                {activePhase === '6C' && (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-gradient-to-tr from-[#05070a] to-emerald-900/10">
                         <h3 className="text-2xl font-black text-white italic mb-6">In-situ vs Ex-situ</h3>
                         <div className="space-y-6">
                            <div className="p-5 border border-white/5 rounded-2xl bg-white/5">
                               <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-2">In-situ</h5>
                               <p className="text-[10px] text-slate-400 leading-relaxed">
                                  Inject nutrients (molasses, nitrates, phosphates) to stimulate indigenous bacteria already present in the reservoir. Cheaper, but less controlled.
                               </p>
                            </div>
                            <div className="p-5 border border-white/5 rounded-2xl bg-white/5">
                               <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Ex-situ</h5>
                               <p className="text-[10px] text-slate-400 leading-relaxed">
                                  Grow specific microbial strains in surface bioreactors. Inject the cultured microbes along with their produced metabolites (surfactants/polymers) into the reservoir.
                               </p>
                            </div>
                         </div>
                      </div>
                      
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] space-y-6">
                         <h3 className="text-xl font-black text-white italic mb-6">Challenges & Considerations</h3>
                         <ul className="space-y-4">
                            <li className="flex gap-3 items-start">
                               <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold mt-0.5">1</span>
                               <p className="text-[11px] text-slate-400"><strong className="text-white block">Slow Kinetics:</strong> Bio-processes take weeks to months to develop in-situ.</p>
                            </li>
                            <li className="flex gap-3 items-start">
                               <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold mt-0.5">2</span>
                               <p className="text-[11px] text-slate-400"><strong className="text-white block">Unpredictability:</strong> Highly empirical results; hard to model subsurface bio-dynamics accurately.</p>
                            </li>
                            <li className="flex gap-3 items-start">
                               <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold mt-0.5">3</span>
                               <p className="text-[11px] text-slate-400"><strong className="text-white block">Souring Risk:</strong> Stimulating SRBs (Sulfate Reducing Bacteria) can inadvertently generate H2S.</p>
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
    <div className="glass-card p-8 rounded-2xl border-white/5 bg-[#05070a] group hover:border-emerald-500/30 transition-all flex flex-col items-start">
       <div className={cn("p-4 rounded-2xl mb-6", bg, color)}>
         <Icon size={24} />
       </div>
       <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-3">{title}</h4>
       <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
