import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Eye, Radio, Droplet, TrendingUp, Search
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

export function MonitoringEORModule() {
  const [activePhase, setActivePhase] = useState<'10A' | '10B' | '10C'>('10A');
  
  const phases = [
    { id: '10A', name: 'Tracers', icon: Droplet },
    { id: '10B', name: 'Geophysics', icon: Activity },
    { id: '10C', name: 'Production', icon: TrendingUp }
  ];

  // Dummy Tracer Data for Breakthrough Curve
  const tracerData = useMemo(() => {
    return [
      { pvi: 0.0, conc: 0 }, { pvi: 0.1, conc: 2 }, { pvi: 0.2, conc: 15 },
      { pvi: 0.3, conc: 45 }, { pvi: 0.4, conc: 80 }, { pvi: 0.5, conc: 100 },
      { pvi: 0.6, conc: 85 }, { pvi: 0.7, conc: 60 }, { pvi: 0.8, conc: 35 },
      { pvi: 0.9, conc: 15 }, { pvi: 1.0, conc: 5 }, { pvi: 1.2, conc: 0 }
    ];
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Eye className="text-cyan-500" size={32} />
            Phase 10: Surveillance <span className="text-cyan-500/50">EOR Monitoring</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Tracking Fluid Movement & Recovery</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit mt-4 flex-wrap gap-1">
          {phases.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id as any)}
              className={cn(
                "px-5 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
                activePhase === p.id 
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" 
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
                {/* --- 10A: Tracers --- */}
                {activePhase === '10A' && (
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] lg:col-span-1 space-y-6">
                         <h3 className="text-xl font-black text-white italic mb-4">Inter-well Tracers</h3>
                         <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
                            Injected into the reservoir to track fluid flow paths, measure transit times, and quantify swept volumes between injectors and producers.
                         </p>
                         <ul className="text-[10px] text-slate-400 space-y-3 list-disc pl-4">
                            <li><strong className="text-white">Chemical Tracers:</strong> Fluorobenzoic acids, salts. Non-reactive.</li>
                            <li><strong className="text-white">Radioactive Tracers:</strong> Tritium, Carbon-14. Highly detectable at trace levels.</li>
                            <li><strong className="text-white">Partitioning Tracers:</strong> Used specifically to measure residual oil saturation (Sor) by measuring the delay between a partitioning and non-partitioning tracer.</li>
                         </ul>
                      </div>
                      
                      <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] lg:col-span-2 flex flex-col">
                         <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Activity size={14} /> Tracer Breakthrough Curve
                         </h4>
                         <div className="flex-1 w-full min-h-[250px]">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={tracerData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                 <XAxis dataKey="pvi" stroke="#475569" fontSize={10} label={{ value: 'Pore Volumes Injected (PVI)', position: 'insideBottom', offset: -10, fill: '#64748b' }} />
                                 <YAxis stroke="#475569" fontSize={10} label={{ value: 'Tracer Conc. (ppb)', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                                 <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                                 <Area type="monotone" dataKey="conc" stroke="#06b6d4" fill="url(#colorConc)" strokeWidth={3} />
                                 <defs>
                                    <linearGradient id="colorConc" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                    </linearGradient>
                                 </defs>
                              </AreaChart>
                           </ResponsiveContainer>
                         </div>
                         <p className="text-[11px] text-slate-500 mt-4 text-center">
                            The area under the curve is used to calculate the swept volume. Early breakthrough indicates severe channeling/thief zones.
                         </p>
                      </div>
                   </div>
                )}

                {/* --- 10B: Geophysics --- */}
                {activePhase === '10B' && (
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="glass-card p-10 rounded-3xl border-white/5 bg-gradient-to-br from-[#05070a] to-blue-900/10">
                         <div className="mb-6 p-4 bg-blue-500/10 w-fit rounded-2xl"><Search className="text-blue-500" /></div>
                         <h3 className="text-xl font-black text-white italic mb-4">4D Seismic</h3>
                         <p className="text-[11px] text-slate-400 leading-relaxed">
                            Time-lapse (repeat) 3D seismic surveys over the life of the field. Used to track fluid front movement (water, gas, steam) by mapping changes in acoustic impedance as reservoir fluids are displaced.
                         </p>
                      </div>
                      <div className="glass-card p-10 rounded-3xl border-white/5 bg-gradient-to-br from-[#05070a] to-amber-900/10">
                         <div className="mb-6 p-4 bg-amber-500/10 w-fit rounded-2xl"><Activity className="text-amber-500" /></div>
                         <h3 className="text-xl font-black text-white italic mb-4">Microseismic</h3>
                         <p className="text-[11px] text-slate-400 leading-relaxed">
                            Listening to passive seismic emissions. Critical for monitoring hydraulic fracture growth, verifying caprock integrity during high-pressure injection, and detecting fault reactivation.
                         </p>
                      </div>
                      <div className="glass-card p-10 rounded-3xl border-white/5 bg-gradient-to-br from-[#05070a] to-purple-900/10">
                         <div className="mb-6 p-4 bg-purple-500/10 w-fit rounded-2xl"><Radio className="text-purple-500" /></div>
                         <h3 className="text-xl font-black text-white italic mb-4">Crosswell EM</h3>
                         <p className="text-[11px] text-slate-400 leading-relaxed">
                            Electromagnetic surveys between wells. Maps resistivity changes between the injector and producer. Especially effective for mapping steam chambers in SAGD/thermal operations.
                         </p>
                      </div>
                   </div>
                )}

                {/* --- 10C: Production & Wells --- */}
                {activePhase === '10C' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a]">
                         <h3 className="text-2xl font-black text-white italic mb-6">Production Data Analytics</h3>
                         <div className="space-y-4">
                            <EORDataRow title="Injection Pattern" desc="5-Spot Symmetric" />
                            <EORDataRow title="Current BHP" desc="3,450 psi" />
                            <EORDataRow title="Voidage Replacement" desc="1.02" />
                            <EORDataRow title="WOR & GOR Trends" desc="Water-Oil Ratio and Gas-Oil Ratio indicate breakthrough and displacement efficiency." />
                            <EORDataRow title="Chemical Breakthrough" desc="Monitoring produced water for surfactant/polymer. Crucial for designing surface separation facilities." />
                            <EORDataRow title="Hall Plot" desc="Cumulative pressure vs cumulative injection. Used to monitor injector well skin damage or fracturing." />
                            <EORDataRow title="Temperature Logging" desc="Monitoring producer wellheads for thermal breakthrough in steam floods." />
                         </div>
                      </div>
                      <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] border-t-4 border-t-cyan-500">
                         <h3 className="text-2xl font-black text-cyan-400 italic mb-6">Observation Wells</h3>
                         <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
                            Dedicated, non-producing wells equipped with permanent sensors to monitor reservoir changes away from the active injectors/producers.
                         </p>
                         <div className="space-y-4">
                            <div className="p-4 border border-white/5 rounded-2xl bg-white/5">
                               <h5 className="text-[11px] font-bold text-white uppercase tracking-widest mb-1">Saturation Logging</h5>
                               <p className="text-[10px] text-slate-400">Pulsed Neutron (PNN) or Carbon-Oxygen logs run periodically to measure dynamic changes in oil saturation.</p>
                            </div>
                            <div className="p-4 border border-white/5 rounded-2xl bg-white/5">
                               <h5 className="text-[11px] font-bold text-white uppercase tracking-widest mb-1">Pressure Gauges</h5>
                               <p className="text-[10px] text-slate-400">Permanent downhole gauges (PDGs) for continuous reservoir pressure monitoring and interference testing.</p>
                            </div>
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

function EORDataRow({ title, desc }: { title: string, desc: string }) {
  return (
    <li className="pb-4 border-b border-white/5">
       <strong className="text-[11px] text-white uppercase tracking-widest block mb-1">{title}</strong>
       <span className="text-[10px] text-slate-400">{desc}</span>
    </li>
  );
}
