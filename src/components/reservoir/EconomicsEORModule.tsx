import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, Map, Factory, Leaf, TrendingUp, AlertCircle, ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';

export function EconomicsEORModule() {
  const [activePhase, setActivePhase] = useState<'11A' | '11B' | '11C'>('11A');
  
  // Phase 11B: Economics
  const [oilPrice, setOilPrice] = useState(70); // $/bbl
  const [incrementalRecovery, setIncrementalRecovery] = useState(1000000); // bbls
  const [capex, setCapex] = useState(15000000); // $
  const [opex, setOpex] = useState(25000000); // $

  const costPerBbl = (capex + opex) / incrementalRecovery;
  const isViable = oilPrice > costPerBbl;

  const phases = [
    { id: '11A', name: 'Pilot Design', icon: Map },
    { id: '11B', name: 'Economics', icon: DollarSign },
    { id: '11C', name: 'Facilities & Env', icon: Factory }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <DollarSign className="text-emerald-500" size={32} />
            Phase 11: Economics <span className="text-emerald-500/50">& Field Ops</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Viability & Implementation</p>
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
                {/* --- 11A: Pilot Design --- */}
                {activePhase === '11A' && (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-gradient-to-br from-[#05070a] to-emerald-900/10 space-y-6">
                         <h3 className="text-2xl font-black text-emerald-500 italic mb-4">Pilot Testing</h3>
                         <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
                            EOR methods are CAPEX intensive and carry high subsurface risk. A field pilot is required to validate laboratory assumptions (sweep efficiency, retention, breakthrough) before full-field expansion.
                         </p>
                         <div className="space-y-4">
                            <InfoCard title="Single Pattern" desc="One injector surrounded by producers (e.g., 5-spot). Fastest results (1-2 years) but lacks confinement, making sweep efficiency hard to calculate." />
                            <InfoCard title="Multi-Pattern" desc="Several adjacent patterns (e.g., four 5-spots). Central pattern is confined, providing accurate sweep and recovery data. Takes 3-5 years." />
                            <InfoCard title="SWCTT" desc="Single Well Chemical Tracer Test. Very fast (weeks). Only measures residual oil saturation (Sor) reduction near the wellbore, not macroscopic sweep." />
                         </div>
                      </div>
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] flex flex-col justify-center">
                         <h3 className="text-xl font-black text-white italic mb-6">Scale-up Criteria</h3>
                         <ul className="text-[11px] text-slate-400 space-y-4 list-none">
                            <li className="flex gap-4 items-center p-4 border border-white/5 rounded-2xl bg-white/5">
                               <TrendingUp className="text-emerald-500 flex-shrink-0" />
                               <span>Did the pilot achieve the target incremental oil recovery predicted by simulation?</span>
                            </li>
                            <li className="flex gap-4 items-center p-4 border border-white/5 rounded-2xl bg-white/5">
                               <Factory className="text-emerald-500 flex-shrink-0" />
                               <span>Were the surface facilities able to handle the produced fluids (emulsions, scaling, gas)?</span>
                            </li>
                            <li className="flex gap-4 items-center p-4 border border-white/5 rounded-2xl bg-white/5">
                               <DollarSign className="text-emerald-500 flex-shrink-0" />
                               <span>Are the economics viable at the current and forecasted oil price?</span>
                            </li>
                         </ul>
                      </div>
                   </div>
                )}

                {/* --- 11B: Economics --- */}
                {activePhase === '11B' && (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] space-y-8">
                         <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                            <DollarSign size={14} /> Unit Cost Calculator
                         </h4>
                         <InputWithSlider label="Oil Price ($/bbl)" value={oilPrice} min={20} max={150} step={1} unit="$" onChange={setOilPrice} />
                         <InputWithSlider label="Incremental Recovery (bbls)" value={incrementalRecovery} min={100000} max={5000000} step={100000} unit="bbls" onChange={setIncrementalRecovery} />
                         <InputWithSlider label="Total CAPEX ($)" value={capex} min={1000000} max={50000000} step={1000000} unit="$" onChange={setCapex} />
                         <InputWithSlider label="Total OPEX ($)" value={opex} min={1000000} max={50000000} step={1000000} unit="$" onChange={setOpex} />
                      </div>
                      
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] flex flex-col justify-center text-center">
                         <div className={cn(
                            "p-8 rounded-3xl border transition-all mb-8",
                            isViable ? "bg-emerald-500/10 border-emerald-500/50" : "bg-red-500/10 border-red-500/50"
                         )}>
                            {isViable ? <ShieldCheck size={48} className="text-emerald-500 mb-4 mx-auto" /> : <AlertCircle size={48} className="text-red-500 mb-4 mx-auto" />}
                            <p className="text-[10px] font-bold uppercase mb-2 tracking-widest text-white">Cost per Incremental Barrel</p>
                            <p className={cn("text-5xl font-black italic", isViable ? "text-emerald-400" : "text-red-400")}>
                               ${costPerBbl.toFixed(2)}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-4">
                               {isViable ? "Project is economically viable." : "Project is uneconomic at current oil price."}
                            </p>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="p-4 border border-white/5 rounded-2xl bg-white/5">
                               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Typical Chem Costs</p>
                               <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4">
                                  <li>Surfactant: $2-5/lb</li>
                                  <li>Polymer: $1-3/lb</li>
                                  <li>Alkali: $0.15-0.30/lb</li>
                                </ul>
                            </div>
                            <div className="p-4 border border-white/5 rounded-2xl bg-white/5">
                               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Typical Gas Costs</p>
                               <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4">
                                  <li>CO2: $15-40/ton</li>
                                  <li>Compression: High OPEX</li>
                                </ul>
                            </div>
                         </div>
                      </div>
                   </div>
                )}

                {/* --- 11C: Facilities & Env --- */}
                {activePhase === '11C' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a]">
                         <h3 className="text-2xl font-black text-white italic mb-6 flex items-center gap-3"><Factory className="text-slate-400" /> Surface Facilities</h3>
                         <ul className="space-y-4">
                            <EconDataRow title="Chemical Mixing" desc="Polymer requires specialized shear-free mixing and hydration equipment." />
                            <EconDataRow title="Steam Generation" desc="Once-Through Steam Generators (OTSG) or Drum Boilers. Require extensive water treatment (softening) to prevent scaling." />
                            <EconDataRow title="Gas Handling" desc="CO2 floods require massive compression, dehydration, and recycling facilities as CO2 breaks through." />
                            <EconDataRow title="Emulsion Breaking" desc="Chemical floods produce severe tight emulsions requiring heat and demulsifiers to separate oil and water." />
                         </ul>
                      </div>
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-gradient-to-tr from-[#05070a] to-emerald-900/10">
                         <h3 className="text-2xl font-black text-emerald-500 italic mb-6 flex items-center gap-3"><Leaf /> Environmental Impact</h3>
                         <ul className="space-y-4">
                            <EconDataRow title="GHG Emissions" desc="Thermal EOR burns massive amounts of natural gas. Requires carbon capture or cogeneration to mitigate footprint." />
                            <EconDataRow title="Produced Water" desc="EOR produces large volumes of water laced with chemicals or H2S. Requires deep disposal wells or extensive treatment." />
                            <EconDataRow title="CCUS Synergy" desc="CO2 EOR permanently sequesters roughly 30-50% of the injected CO2, qualifying for carbon credits (e.g., 45Q in the US)." />
                            <EconDataRow title="Surface Disturbance" desc="Dense well spacing (e.g., thermal pads) requires significant land use and habitat mitigation." />
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

function InfoCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-4 border border-emerald-500/20 rounded-2xl bg-emerald-500/5">
       <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-1">{title}</h5>
       <p className="text-[10px] text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function EconDataRow({ title, desc }: { title: string, desc: string }) {
  return (
    <li className="pb-4 border-b border-white/5">
       <strong className="text-[11px] text-white uppercase tracking-widest block mb-1">{title}</strong>
       <span className="text-[10px] text-slate-400">{desc}</span>
    </li>
  );
}
