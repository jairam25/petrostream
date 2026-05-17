import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Waves, Droplet, Flame, Wind, Target, CheckCircle2, AlertCircle, Database, PlayCircle, Beaker, Map
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { screenEOR } from '../../lib/reservoir';

export function EORScreeningModule() {
  const [activeTab, setActiveTab] = useState<'criteria' | 'workflow' | 'methods'>('criteria');
  const [inp, setInp] = useState({
    api: 32,
    viscosity: 5,
    depth: 6500,
    temp: 140,
    porosity: 0.22,
    permeability: 85,
    oilSat: 0.65
  });

  const screeningResults = useMemo(() => screenEOR(inp), [inp]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Target className="text-emerald-500" size={32} />
            Phase 1: EOR Screening <span className="text-emerald-500/50">& Classification</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Taber-Martin-Seright Evaluation</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            {[
              { id: 'criteria', label: 'Screening Criteria' },
              { id: 'workflow', label: 'Implementation Workflow' },
              { id: 'methods', label: 'EOR Methods' }
            ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setActiveTab(p.id as any)}
                  className={cn(
                    "px-6 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-xs font-black uppercase tracking-widest",
                    activeTab === p.id 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                      : "text-slate-500 hover:text-white"
                  )}
                >
                  {p.label}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Reservoir Properties Pane */}
        <div className="lg:col-span-4 space-y-6">
           <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a]">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 italic flex items-center gap-2">
                 <Database size={16} className="text-emerald-500" /> Reservoir Parameters
              </h4>
              <div className="space-y-8">
                 <EORSlider label="Oil Gravity (API)" value={inp.api} min={10} max={50} step={1} unit="°" onChange={v => setInp({...inp, api: v})} />
                 <EORSlider label="Viscosity (μo)" value={inp.viscosity} min={0.5} max={100} step={0.5} unit="cP" onChange={v => setInp({...inp, viscosity: v})} />
                 <EORSlider label="Porosity (ϕ)" value={inp.porosity * 100} min={5} max={35} step={1} unit="%" onChange={v => setInp({...inp, porosity: v/100})} />
                 <EORSlider label="Reservoir Temp" value={inp.temp} min={60} max={300} step={5} unit="°F" onChange={v => setInp({...inp, temp: v})} />
                 <EORSlider label="Permeability (k)" value={inp.permeability} min={1} max={1000} step={10} unit="md" onChange={v => setInp({...inp, permeability: v})} />
                 <EORSlider label="Oil Saturation (So)" value={inp.oilSat * 100} min={10} max={90} step={5} unit="%" onChange={v => setInp({...inp, oilSat: v/100})} />
              </div>
           </div>

           <div className="glass-card p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20">
              <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6">Viable Methods</h4>
              <div className="space-y-4">
                  {screeningResults.map(res => (
                      <div key={res} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                          <CheckCircle2 size={16} className="text-emerald-400" />
                          <span className="text-[11px] font-black text-white uppercase tracking-wider">{res}</span>
                      </div>
                  ))}
                  {screeningResults.length === 0 && (
                      <div className="text-center py-6">
                          <AlertCircle size={32} className="mx-auto text-slate-700 mb-2" />
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No optimal methods found</p>
                      </div>
                  )}
              </div>
           </div>
        </div>

        <div className="lg:col-span-8 h-full">
            <AnimatePresence mode="wait">
                <motion.div
                   key={activeTab}
                   initial={{ opacity: 0, scale: 0.98 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.98 }}
                   className="h-full"
                >
                    {activeTab === 'criteria' && (
                        <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-full">
                            <h3 className="text-xl font-black text-white italic mb-6">Taber-Martin-Seright Criteria</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                   <thead>
                                      <tr className="border-b border-white/10 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                         <th className="py-4 px-4">Method</th>
                                         <th className="py-4 px-4">API Gravity</th>
                                         <th className="py-4 px-4">Viscosity (cp)</th>
                                         <th className="py-4 px-4">Depth (ft)</th>
                                         <th className="py-4 px-4">Perm (md)</th>
                                      </tr>
                                   </thead>
                                   <tbody>
                                      {[
                                        { name: 'Miscible N2', api: '> 35', visc: '< 0.4', depth: '> 6000', perm: 'NC' },
                                        { name: 'Miscible CO2', api: '> 22', visc: '< 10', depth: '> 2500', perm: 'NC' },
                                        { name: 'Polymer', api: '> 15', visc: '10 - 150', depth: '< 9000', perm: '> 10' },
                                        { name: 'Surfactant/Polymer', api: '> 20', visc: '< 30', depth: '< 8000', perm: '> 20' },
                                        { name: 'Steamflood', api: '8 - 25', visc: '> 20', depth: '< 3000', perm: '> 200' },
                                        { name: 'In-Situ Combustion', api: '10 - 40', visc: '< 5000', depth: '> 500', perm: '> 50' },
                                      ].map((row, i) => (
                                         <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-4 px-4 text-xs font-bold text-white">{row.name}</td>
                                            <td className="py-4 px-4 text-xs font-mono text-slate-300">{row.api}</td>
                                            <td className="py-4 px-4 text-xs font-mono text-slate-300">{row.visc}</td>
                                            <td className="py-4 px-4 text-xs font-mono text-slate-300">{row.depth}</td>
                                            <td className="py-4 px-4 text-xs font-mono text-slate-300">{row.perm}</td>
                                         </tr>
                                      ))}
                                   </tbody>
                                </table>
                            </div>
                            <p className="text-[10px] text-slate-500 italic mt-6">NC = Not Critical. Values are based on general industry guidelines.</p>
                        </div>
                    )}

                    {activeTab === 'workflow' && (
                        <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-full flex flex-col justify-center">
                            <h3 className="text-xl font-black text-white italic mb-12 text-center">EOR Project Implementation Workflow</h3>
                            <div className="relative flex justify-between items-center w-full max-w-3xl mx-auto">
                               {/* Connecting Line */}
                               <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 z-0" />
                               
                               {[
                                  { icon: Database, name: 'Data Gathering' },
                                  { icon: Target, name: 'Quick Screening' },
                                  { icon: PlayCircle, name: 'Detailed Sim' },
                                  { icon: Beaker, name: 'Pilot Design' },
                                  { icon: Map, name: 'Field Implement' }
                               ].map((step, idx) => (
                                  <div key={idx} className="relative z-10 flex flex-col items-center group cursor-default">
                                      <div className="w-16 h-16 rounded-full bg-[#0f172a] border-4 border-[#1e293b] flex items-center justify-center text-emerald-500 group-hover:border-emerald-500 group-hover:scale-110 transition-all duration-300 shadow-xl shadow-black/50">
                                         <step.icon size={24} />
                                      </div>
                                      <p className="absolute top-20 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center w-24 leading-relaxed group-hover:text-white transition-colors">
                                         {step.name}
                                      </p>
                                  </div>
                               ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'methods' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <MethodCard icon={Wind} title="Gas Injection" desc="Miscible & Immiscible CO2, N2, or Hydrocarbon gas injection to reduce viscosity and swell oil." />
                           <MethodCard icon={Droplet} title="Chemical EOR" desc="Polymers, Surfactants, and Alkaline agents to improve mobility ratio and reduce IFT." />
                           <MethodCard icon={Flame} title="Thermal Recovery" desc="Steamflooding, SAGD, and In-Situ Combustion for heavy oil viscosity reduction." />
                           <MethodCard icon={Target} title="Microbial EOR" desc="Injection of microorganisms to produce biosurfactants and gases in-situ." />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function EORSlider({ label, value, min, max, step, unit, onChange }: { label: string, value: number, min: number, max: number, step: number, unit: string, onChange: (v: number) => void }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center text-[11px] font-black text-white uppercase tracking-widest">
                <span>{label}</span>
                <span className="text-emerald-400 font-mono">{value} {unit}</span>
            </div>
            <input 
              type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
        </div>
    );
}

function MethodCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="glass-card rounded-2xl p-8 border-white/5 bg-[#05070a] group hover:border-emerald-500/30 transition-colors">
       <Icon size={32} className="text-emerald-500/50 mb-6 group-hover:text-emerald-500 transition-colors" />
       <h4 className="text-sm font-black text-white uppercase tracking-widest mb-3">{title}</h4>
       <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
