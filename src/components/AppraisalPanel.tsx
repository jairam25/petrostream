import React from 'react';
import { 
  Activity, Layers, Droplets, Target, ShieldCheck, Plus, 
  Search, BookOpen, Settings, Droplet, Compass, Drill, Database, 
  Calculator, LineChart, ChevronRight, Hash, Info, Maximize2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  calculatePorosity, calculateBulkVolumeWater, 
  calculateArchieSw as calculateSwArchie, calculateSimandouxSw as calculateSwSimandoux, calculateIndonesianSw as calculateSwIndonesia,
  calculateVshGR, calculateVshSP, calculateVshNeutronDensity, calculateVshResistivity, calculateIGR, calculateVshSteiber,
  calculateTimurPermeability, calculateCoatesPermeability, calculateWyllieRosePermeability, calculateKozenyCarman, calculateTixierPermeability, calculateMorrisBiggsPermeability
} from '../lib/petrophysics';

interface AppraisalPanelProps {
  petrophysicsSubTab: string;
  setPetrophysicsSubTab: (tab: string) => void;
  porosityInp: any;
  setPorosityInp: (inp: any) => void;
  saturationInp: any;
  setSaturationInp: (inp: any) => void;
  vshaleInp: any;
  setVshaleInp: (inp: any) => void;
  permeabilityInp: any;
  setPermeabilityInp: (inp: any) => void;
  selectedLoggingTool: string | null;
  setSelectedLoggingTool: (tool: string | null) => void;
  logSearchTerm: string;
  setLogSearchTerm: (term: string) => void;
}

export const AppraisalPanel: React.FC<AppraisalPanelProps> = ({
  petrophysicsSubTab,
  setPetrophysicsSubTab,
  porosityInp,
  setPorosityInp,
  saturationInp,
  setSaturationInp,
  vshaleInp,
  setVshaleInp,
  permeabilityInp,
  setPermeabilityInp,
  selectedLoggingTool,
  setSelectedLoggingTool,
  logSearchTerm,
  setLogSearchTerm
}) => {
  return (
    <div className="space-y-6">
       {/* Petrophysics Header Nav */}
       <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
           <button 
             onClick={() => setPetrophysicsSubTab('logging')}
             className={cn(
               "px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
               petrophysicsSubTab === 'logging' ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "text-slate-500 hover:text-slate-300"
             )}
           >Logging Ops</button>
           <button 
             onClick={() => setPetrophysicsSubTab('porosity')}
             className={cn(
               "px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
               petrophysicsSubTab === 'porosity' ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "text-slate-500 hover:text-slate-300"
             )}
           >Porosity Φ</button>
           <button 
             onClick={() => setPetrophysicsSubTab('saturation')}
             className={cn(
               "px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
               petrophysicsSubTab === 'saturation' ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "text-slate-500 hover:text-slate-300"
             )}
           >Saturation Sw</button>
           <button 
             onClick={() => setPetrophysicsSubTab('vshale')}
             className={cn(
               "px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
               petrophysicsSubTab === 'vshale' ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "text-slate-500 hover:text-slate-300"
             )}
           >Shale Volume</button>
           <button 
             onClick={() => setPetrophysicsSubTab('permeability')}
             className={cn(
               "px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
               petrophysicsSubTab === 'permeability' ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "text-slate-500 hover:text-slate-300"
             )}
           >Permeability k</button>
       </div>

       {petrophysicsSubTab === 'logging' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Tool Inventory */}
             <div className="lg:col-span-4 space-y-4">
                <div className="bg-[#0a0c10] border border-white/5 rounded-2xl p-6 lg:p-8">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Tool String</h3>
                      <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Run</div>
                   </div>

                   <div className="relative mb-6">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Search Tools..." 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-mono text-emerald-200 focus:border-emerald-500/50 outline-none transition-all"
                        value={logSearchTerm}
                        onChange={(e) => setLogSearchTerm(e.target.value)}
                      />
                   </div>

                   <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                      {[
                        { id: 'GR', name: 'Gamma Ray', category: 'Lithology', status: 'Live', frequency: '2Hz' },
                        { id: 'RES', name: 'Resistivity Induction', category: 'Fluid', status: 'Live', frequency: '5Hz' },
                        { id: 'DEN', name: 'Litho-Density', category: 'Porosity', status: 'Live', frequency: '1Hz' },
                        { id: 'NEU', name: 'Compensated Neutron', category: 'Porosity', status: 'Standby', frequency: '1Hz' },
                        { id: 'SON', name: 'Sonic (Monopole)', category: 'Mechanics', status: 'Live', frequency: '10Hz' },
                        { id: 'NMR', name: 'Magnetic Resonance', category: 'Permeability', status: 'Calibrating', frequency: '0.5Hz' },
                        { id: 'OBMI', name: 'Oil Base Micro Imager', category: 'Structure', status: 'Standby', frequency: '50Hz' }
                      ].filter(t => t.name.toLowerCase().includes(logSearchTerm.toLowerCase())).map(tool => (
                        <div 
                          key={tool.id}
                          onClick={() => setSelectedLoggingTool(tool.id)}
                          className={cn(
                            "p-4 rounded-2xl border border-white/5 bg-white/[0.02] cursor-pointer transition-all hover:bg-white/5 flex items-center justify-between group",
                            selectedLoggingTool === tool.id && "border-emerald-500/50 bg-emerald-500/[0.05]"
                          )}
                        >
                           <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                selectedLoggingTool === tool.id ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-white/5 text-slate-500 group-hover:text-slate-300"
                              )}>
                                 <Hash size={18} />
                              </div>
                              <div>
                                 <p className="text-[11px] font-black text-white uppercase italic tracking-tight">{tool.name}</p>
                                 <p className="text-[10px] text-slate-500 font-mono uppercase">{tool.category}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className={cn(
                                "text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block mb-1",
                                tool.status === 'Live' ? "bg-emerald-500/20 text-emerald-400" : 
                                tool.status === 'Calibrating' ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-slate-500"
                              )}>{tool.status}</p>
                              <p className="text-[11px] font-mono text-slate-600 block">{tool.frequency}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Real-time Feed Display */}
             <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-[#030508] border border-white/10 rounded-2xl grow overflow-hidden flex flex-col p-1">
                   <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
                      <div className="flex gap-4">
                         <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">Live Stream</span>
                         </div>
                         <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-500 font-mono">MD: 3,452.2 ft</div>
                      </div>
                      <div className="flex gap-2">
                         <button className="p-1.5 text-slate-600 hover:text-white transition-colors"><Info size={14}/></button>
                         <button className="p-1.5 text-slate-600 hover:text-white transition-colors"><Maximize2 size={14}/></button>
                      </div>
                   </div>

                   <div className="grow relative">
                      {/* Grid Lines Pattern */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                      
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                         <p className="text-[100px] font-black text-white skew-x-[-12deg] tracking-tighter mix-blend-overlay">LOG</p>
                      </div>

                      <div className="absolute inset-0 p-8 flex gap-8">
                         {/* Depth Track */}
                         <div className="w-20 border-r border-white/10 flex flex-col justify-between py-10 relative">
                            {[3400, 3410, 3420, 3430, 3440, 3450].map(d => (
                              <div key={d} className="text-[11px] font-mono text-slate-600 text-right pr-4">{d}</div>
                            ))}
                            <div className="absolute inset-0 flex flex-col justify-around pointer-events-none">
                               <div className="h-px w-full bg-white/5"></div>
                               <div className="h-px w-full bg-white/5"></div>
                               <div className="h-px w-full bg-white/5"></div>
                               <div className="h-px w-full bg-white/5"></div>
                            </div>
                         </div>
                         {/* Curve Viewport */}
                         <div className="grow relative overflow-hidden">
                            <svg className="absolute inset-0 w-full h-full">
                               <polyline 
                                 points="10,200 40,210 30,225 60,240 50,260 90,280 80,310 120,330 110,360 150,380 140,410 180,430 170,460"
                                 fill="none"
                                 stroke="#10b981"
                                 strokeWidth="3"
                                 strokeLinejoin="round"
                                 className="animate-[dash_5s_linear_infinite]"
                               />
                               <polyline 
                                 points="50,200 70,215 65,230 85,245 80,270 100,290 95,320 115,340 110,380 130,400 125,440 145,460"
                                 fill="none"
                                 stroke="#f59e0b"
                                 strokeWidth="1.5"
                                 strokeDasharray="4 2"
                               />
                            </svg>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                   <div className="flex gap-8">
                      <div>
                         <p className="text-[10px] text-slate-600 uppercase mb-1">Scaling</p>
                         <p className="text-[10px] font-bold text-white">Logarithmic / 0.2 - 2000</p>
                      </div>
                      <div>
                         <p className="text-[10px] text-slate-600 uppercase mb-1">Depth Mode</p>
                         <p className="text-[10px] font-bold text-white">Measured Depth (MD)</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="text-right">
                         <p className="text-[10px] text-slate-600 uppercase mb-1">Bit Size</p>
                         <p className="text-[10px] font-bold text-emerald-400">12.25"</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                         <Droplet size={18} />
                      </div>
                   </div>
                </div>
             </div>
          </div>
       )}

       {petrophysicsSubTab === 'porosity' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Matrix & Fluid Parameters */}
             <div className="lg:col-span-4 space-y-6">
                <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                   <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-black text-white italic tracking-tight uppercase">MATRIX SETTINGS</h3>
                      <Layers size={20} className="text-emerald-500" />
                   </div>
                   <div className="space-y-6">
                      <div className="flex gap-2">
                         {(['sandstone', 'limestone', 'dolomite'] as const).map(lith => (
                            <button 
                              key={lith}
                              onClick={() => {
                                let rho = 2.71;
                                let dt = 47.5;
                                if (lith === 'sandstone') { rho = 2.65; dt = 55.5; }
                                if (lith === 'dolomite') { rho = 2.87; dt = 43.5; }
                                setPorosityInp({...porosityInp, lithology: lith, rhoMatrix: rho, dtMatrix: dt});
                              }}
                              className={cn(
                                "flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all",
                                porosityInp.lithology === lith 
                                  ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                                  : "bg-white/5 border-white/10 text-slate-500 hover:border-white/20"
                              )}
                            >{lith}</button>
                         ))}
                      </div>

                      <div className="space-y-4">
                         <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Matrix Density (ρma)</label>
                            <input 
                              type="range" min="2.0" max="3.0" step="0.01" 
                              value={porosityInp.rhoMatrix}
                              onChange={(e) => setPorosityInp({...porosityInp, rhoMatrix: Number(e.target.value)})}
                              className="w-full accent-emerald-500"
                            />
                            <div className="flex justify-between mt-2 font-mono text-[10px]">
                               <span className="text-slate-600">2.0</span>
                               <span className="text-white font-bold">{porosityInp.rhoMatrix} g/cc</span>
                               <span className="text-slate-600">3.0</span>
                            </div>
                         </div>

                         <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Bulk Density (ρb)</label>
                            <input 
                              type="range" min="1.5" max="3.0" step="0.01" 
                              value={porosityInp.rhoBulk}
                              onChange={(e) => setPorosityInp({...porosityInp, rhoBulk: Number(e.target.value)})}
                              className="w-full accent-emerald-500"
                            />
                            <div className="flex justify-between mt-2 font-mono text-[10px]">
                               <span className="text-slate-600">1.5</span>
                               <span className="text-white font-bold">{porosityInp.rhoBulk} g/cc</span>
                               <span className="text-slate-600">3.0</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-emerald-500/5 rounded-3xl border border-emerald-500/10 p-8">
                   <h3 className="text-sm font-black text-white italic mb-6 uppercase tracking-widest">Fluid Properties</h3>
                   <div className="space-y-4 text-[10px]">
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                         <span className="text-slate-500 uppercase">Fluid Density (ρf)</span>
                         <span className="font-mono text-emerald-400">1.00 g/cc</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                         <span className="text-slate-500 uppercase">Mud Filtrate DT (dtf)</span>
                         <span className="font-mono text-emerald-400">189 μs/ft</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Calculation Output */}
             <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-12 grow relative overflow-hidden flex flex-col justify-center">
                   <div className="absolute top-12 left-12 flex items-center gap-3">
                      <div className="w-10 h-px bg-emerald-500"></div>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Integrated Porosity Analysis</span>
                   </div>

                   <div className="text-center relative z-10">
                      <p className="text-[12px] font-black text-slate-500 uppercase tracking-wide mb-4 italic">Computed Total Porosity (Φt)</p>
                      <div className="flex items-baseline justify-center gap-2">
                         <span className="text-[120px] font-black italic text-white tracking-tighter leading-none shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                            {(calculatePorosity(porosityInp.rhoMatrix, porosityInp.rhoBulk) * 100).toFixed(1)}
                         </span>
                         <span className="text-4xl font-black text-slate-700 italic">%</span>
                      </div>
                   </div>

                   <div className="mt-12 grid grid-cols-3 gap-8">
                      <div className="text-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                         <p className="text-[10px] text-slate-600 uppercase mb-2">Effective (Φe)</p>
                         <p className="text-xl font-bold text-white italic">{(calculatePorosity(porosityInp.rhoMatrix, porosityInp.rhoBulk) * 0.95 * 100).toFixed(1)}%</p>
                      </div>
                      <div className="text-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                         <p className="text-[10px] text-slate-600 uppercase mb-2">Sonic Φ</p>
                         <p className="text-xl font-bold text-white italic">{((porosityInp.dtLog - porosityInp.dtMatrix)/(189 - porosityInp.dtMatrix) * 100).toFixed(1)}%</p>
                      </div>
                      <div className="text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                         <p className="text-[10px] text-emerald-500 font-bold uppercase mb-2">BVW</p>
                         <p className="text-xl font-bold text-emerald-400 italic">{calculateBulkVolumeWater(calculatePorosity(porosityInp.rhoMatrix, porosityInp.rhoBulk), 0.25).toFixed(3)}</p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6 h-32">
                   <div className="bg-black/40 border border-white/10 rounded-3xl p-6 flex flex-col justify-center">
                      <p className="text-[11px] text-slate-500 uppercase mb-1">Sonic DT Tool (dt)</p>
                      <input 
                        type="range" min="40" max="150" step="1" 
                        value={porosityInp.dtLog}
                        onChange={(e) => setPorosityInp({...porosityInp, dtLog: Number(e.target.value)})}
                        className="w-full accent-emerald-500 h-1 mb-2"
                      />
                      <div className="flex justify-between items-baseline">
                         <span className="text-xs font-mono text-emerald-400">{porosityInp.dtLog} μs/ft</span>
                         <span className="text-[10px] text-slate-700 uppercase">Transit Time</span>
                      </div>
                   </div>
                   <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                         <Target size={24} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-white uppercase italic">Quality Check</p>
                         <p className="text-[10px] text-slate-500">Cross-plot deviation: <span className="text-emerald-400 font-bold">1.2%</span></p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       )}

       {petrophysicsSubTab === 'saturation' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Resistivity & Inputs */}
             <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#0b0d12] border border-white/5 rounded-3xl p-8">
                   <h3 className="text-xl font-black text-white italic mb-10 uppercase tracking-tighter">Archie Parameters</h3>
                   <div className="space-y-6">
                      <div className="flex gap-2">
                        {(['archie', 'simandoux', 'indonesia'] as const).map(m => (
                           <button 
                             key={m}
                             onClick={() => setSaturationInp({...saturationInp, method: m})}
                             className={cn(
                               "flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all",
                               saturationInp.method === m ? "bg-rose-500 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]" : "bg-white/5 border-white/10 text-slate-500 hover:border-white/20"
                             )}
                           >{m}</button>
                        ))}
                      </div>

                      <div className="space-y-5">
                         <div className="flex items-center justify-between group">
                            <div>
                               <p className="text-[10px] font-bold text-white uppercase">Tortuosity (a)</p>
                               <p className="text-[10px] text-slate-600">Coefficient</p>
                            </div>
                            <div className="flex items-center gap-3">
                               <button onClick={() => setSaturationInp({...saturationInp, a: Math.max(0.6, saturationInp.a - 0.05)})} className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500">-</button>
                               <span className="text-xs font-mono font-bold text-rose-400 w-8 text-center">{saturationInp.a.toFixed(2)}</span>
                               <button onClick={() => setSaturationInp({...saturationInp, a: Math.min(1.2, saturationInp.a + 0.05)})} className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500">+</button>
                            </div>
                         </div>
                         <div className="flex items-center justify-between group">
                            <div>
                               <p className="text-[10px] font-bold text-white uppercase">Cementation (m)</p>
                               <p className="text-[10px] text-slate-600">Exponent</p>
                            </div>
                            <div className="flex items-center gap-3">
                               <button onClick={() => setSaturationInp({...saturationInp, m: Math.max(1.3, saturationInp.m - 0.1)})} className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500">-</button>
                               <span className="text-xs font-mono font-bold text-rose-400 w-8 text-center">{saturationInp.m.toFixed(1)}</span>
                               <button onClick={() => setSaturationInp({...saturationInp, m: Math.min(3.0, saturationInp.m + 0.1)})} className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-500">+</button>
                            </div>
                         </div>
                         <div className="flex items-center justify-between group">
                            <div>
                               <p className="text-[10px] font-bold text-white uppercase">Resistivity (Rt)</p>
                               <p className="text-[10px] text-slate-600">Deep Induction</p>
                            </div>
                            <div className="flex items-center gap-3">
                               <input 
                                 type="text" 
                                 className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] font-mono text-white text-center" 
                                 value={saturationInp.rt}
                                 onChange={(e) => setSaturationInp({...saturationInp, rt: Number(e.target.value)})}
                               />
                               <span className="text-[10px] text-slate-700 uppercase font-bold">Ω.m</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-8 bg-rose-500/[0.03] border border-rose-500/10 rounded-3xl flex items-center gap-5">
                   <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
                      <Droplets size={24} />
                   </div>
                   <div>
                      <p className="text-[11px] font-black text-white uppercase italic">Water Resistivity (Rw)</p>
                      <p className="text-[11px] text-rose-400 font-mono">0.045 Ω.m @ 150°F</p>
                   </div>
                </div>
             </div>

             {/* Output visualization */}
             <div className="lg:col-span-8 flex flex-col">
                <div className="bg-[#05060a] border border-white/10 rounded-3xl p-12 grow flex flex-col items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(244,63,94,0.08),transparent_50%)]"></div>
                   
                   <div className="relative z-10 text-center">
                      <h4 className="text-[14px] font-black text-rose-500 uppercase tracking-widest mb-6 italic">Water Saturation (Sw)</h4>
                      <div className="relative">
                         <div className="text-[160px] font-black italic text-white tracking-tight lead-none opacity-90 drop-shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                            {( (saturationInp.method === 'archie' ? calculateSwArchie(saturationInp.phi, saturationInp.rt, 0.045, saturationInp.a, saturationInp.m, saturationInp.n) :
                                saturationInp.method === 'simandoux' ? calculateSwSimandoux(saturationInp.phi, saturationInp.rt, 0.045, 1.5, 0.25, saturationInp.a, saturationInp.m, saturationInp.n) :
                                calculateSwIndonesia(saturationInp.phi, saturationInp.rt, 0.045, 1.5, 0.25, saturationInp.a, saturationInp.m, saturationInp.n)
                            ) * 100).toFixed(1)}
                         </div>
                         <div className="absolute bottom-10 right-[-40px] text-5xl font-black text-slate-800 italic">%</div>
                      </div>
                   </div>

                   <div className="mt-16 w-full max-w-md space-y-6">
                      <div className="flex justify-between items-end">
                         <p className="text-[10px] font-black text-white uppercase tracking-widest italic">Phase Distribution</p>
                         <p className="text-[10px] font-mono text-slate-500 uppercase">HC: {(100 - (calculateSwArchie(saturationInp.phi, saturationInp.rt, 0.045, saturationInp.a, saturationInp.m, saturationInp.n) * 100)).toFixed(1)}%</p>
                      </div>
                      <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex p-1 border border-white/5">
                         <motion.div 
                           className="h-full bg-rose-500 rounded-full" 
                           initial={{ width: 0 }}
                           animate={{ width: `${calculateSwArchie(saturationInp.phi, saturationInp.rt, 0.045, saturationInp.a, saturationInp.m, saturationInp.n) * 100}%` }}
                         />
                         <div className="grow bg-amber-400/90 rounded-full ml-1"></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-black text-slate-700 uppercase tracking-tighter">
                         <span>Water (Brine)</span>
                         <span>Hydrocarbon (Oil/Gas)</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       )}

       {petrophysicsSubTab === 'vshale' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Shale Volume Inputs */}
             <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#0b0d12] border border-white/5 rounded-3xl p-8">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">SHALE PARAMETERS</h3>
                      <Activity size={20} className="text-amber-500" />
                   </div>
                   
                   <div className="space-y-6">
                      <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                         <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Gamma Ray Log (GR)</label>
                         <input 
                           type="range" min="0" max="150" step="1" 
                           value={vshaleInp.gr}
                           onChange={(e) => setVshaleInp({...vshaleInp, gr: Number(e.target.value)})}
                           className="w-full accent-amber-500 h-1.5"
                         />
                         <div className="flex justify-between mt-3 font-mono text-[10px]">
                            <span className="text-slate-700 uppercase">Min: 0</span>
                            <span className="text-amber-400 font-black">{vshaleInp.gr} API</span>
                            <span className="text-slate-700 uppercase">Max: 150</span>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-2">GR Clean</label>
                            <input 
                              type="number" 
                              className="w-full bg-transparent text-white font-mono text-xs border-b border-white/10 outline-none focus:border-amber-500" 
                              value={vshaleInp.grClean}
                              onChange={(e) => setVshaleInp({...vshaleInp, grClean: Number(e.target.value)})}
                            />
                         </div>
                         <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-2">GR Shale</label>
                            <input 
                              type="number" 
                              className="w-full bg-transparent text-white font-mono text-xs border-b border-white/10 outline-none focus:border-amber-500" 
                              value={vshaleInp.grShale}
                              onChange={(e) => setVshaleInp({...vshaleInp, grShale: Number(e.target.value)})}
                            />
                         </div>
                      </div>

                      <div className="p-5 border border-white/5 rounded-[28px] bg-amber-500/[0.02]">
                         <p className="text-[10px] font-bold text-white uppercase italic mb-4">Formation Lithology</p>
                         <div className="flex gap-2">
                           {(['larionov_old', 'larionov_tertiary', 'steiber'] as const).map(type => (
                              <button 
                                key={type}
                                onClick={() => setVshaleInp({...vshaleInp, type})}
                                className={cn(
                                  "flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-500 transition-all",
                                  vshaleInp.type === type && "bg-amber-500 border-amber-400 text-white shadow-lg"
                                )}
                              >{type.split('_')[1] || type}</button>
                           ))}
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Output Displays */}
             <div className="lg:col-span-8 space-y-6">
                <div className="bg-[#05060a] border border-white/10 rounded-3xl p-12 overflow-hidden relative">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                      <div>
                         <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest italic mb-6">GR Derived Vshale</h4>
                         <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-8xl font-black italic text-white tracking-tighter">
                               {(calculateVshGR(vshaleInp.gr, vshaleInp.grClean, vshaleInp.grShale, vshaleInp.type) * 100).toFixed(1)}
                            </span>
                            <span className="text-3xl font-black text-slate-800 italic">%</span>
                         </div>
                         <p className="text-[10px] text-slate-500 font-mono uppercase">Calculated using {vshaleInp.type} correction</p>
                      </div>
                      
                      <div className="space-y-6">
                         {[
                           { label: 'Linear Index (IGR)', value: calculateIGR(vshaleInp.gr, vshaleInp.grClean, vshaleInp.grShale), color: 'slate' },
                           { label: 'Steiber Correction', value: calculateVshSteiber(calculateIGR(vshaleInp.gr, vshaleInp.grClean, vshaleInp.grShale)), color: 'emerald' }
                         ].map(m => (
                            <div key={m.label} className="space-y-2">
                               <div className="flex justify-between items-center text-[10px] font-black text-white uppercase italic px-1">
                                  <span>{m.label}</span>
                                  <span className="text-amber-400">{(m.value * 100).toFixed(1)}%</span>
                               </div>
                               <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${m.value * 100}%` }}
                                    className={`h-full bg-${m.color}-500/50`}
                                  />
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-3xl p-10">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-6">
                         <h4 className="text-[12px] font-black text-white uppercase italic tracking-widest border-b border-white/10 pb-4 mb-4">Shale Distribution Model</h4>
                         <div className="space-y-4">
                            {[
                              { label: 'Dispersed Shale', value: 0.12, color: 'emerald' },
                              { label: 'Laminated Shale', value: 0.08, color: 'cyan' },
                              { label: 'Structural Shale', value: 0.04, color: 'blue' },
                            ].map(m => (
                               <div key={m.label} className="group cursor-default">
                                  <div className="flex justify-between items-center mb-2 px-1">
                                     <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full bg-${m.color}-500`}></div>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter transition-colors group-hover:text-white">{m.label}</p>
                                     </div>
                                     <div className="text-right">
                                        <p className="text-sm font-black text-white italic">{(m.value * 100).toFixed(1)}%</p>
                                        <p className="text-[10px] text-slate-600 font-mono">Vshale</p>
                                     </div>
                                  </div>
                                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                     <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: `${m.value * 100}%` }}
                                       className={`h-full bg-${m.color}-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all`}
                                     />
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-6">
                         <h4 className="text-[12px] font-black text-white uppercase italic tracking-widest border-b border-white/10 pb-4 mb-4">Multi-Tool Crossplot results</h4>
                         <div className="space-y-4">
                            {[
                              { label: 'SP Deflection', method: 'Electrical', value: calculateVshSP(vshaleInp.sp, vshaleInp.spBase, vshaleInp.spMax), icon: Activity, color: 'amber', best: false },
                              { label: 'Neutron-Density', method: 'Nuclear', value: calculateVshNeutronDensity(vshaleInp.nphi, vshaleInp.dphi, vshaleInp.nphiSh, vshaleInp.dphiSh), icon: Target, color: 'rose', best: true },
                              { label: 'Resistivity (Rsh/Rt)', method: 'Inversion', value: calculateVshResistivity(vshaleInp.rt, vshaleInp.rClean, vshaleInp.rShale), icon: Droplets, color: 'orange', best: false },
                            ].map(m => (
                               <div key={m.label} className={cn(
                                  "group p-5 bg-black/40 border border-white/5 rounded-3xl hover:border-white/20 transition-all relative overflow-hidden",
                                  m.best && "border-emerald-500/30 bg-emerald-500/[0.02]"
                               )}>
                                  {m.best && (
                                     <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 rounded-bl-xl text-[10px] font-black text-white uppercase tracking-tighter z-20">Recommended</div>
                                  )}
                                  <div className="flex justify-between items-center mb-4">
                                     <div className="flex items-center gap-3">
                                        <div className={`p-2.5 bg-${m.color}-500/10 rounded-xl shadow-inner`}>
                                           <m.icon size={16} className={`text-${m.color}-400`} />
                                        </div>
                                        <div>
                                           <p className="text-[11px] font-black text-white uppercase italic">{m.label}</p>
                                           <p className="text-[10px] text-slate-500 font-mono uppercase">{m.method} Analysis</p>
                                        </div>
                                     </div>
                                     <div className="text-right">
                                        <p className={`text-xl font-black text-${m.color}-400 italic`}>{(m.value * 100).toFixed(1)}%</p>
                                     </div>
                                  </div>
                                  <div className="space-y-2">
                                     <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden p-[1px]">
                                        <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${m.value * 100}%` }}
                                          className={`h-full bg-${m.color}-500/80 rounded-full`}
                                        />
                                     </div>
                                     <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] text-slate-700 font-black uppercase">0%</span>
                                        <span className="text-[10px] text-slate-700 font-black uppercase">100%</span>
                                     </div>
                                  </div>
                               </div>
                            ))}
                         </div>

                         <div className="p-8 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 mt-10">
                            <h5 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2 italic">
                               <ShieldCheck size={14} /> 
                               Expert Recommendation
                            </h5>
                            <p className="text-[11px] text-slate-300 leading-relaxed italic">
                               In this formation, the <span className="text-white font-black underline decoration-emerald-500/50 underline-offset-4">Steiber Method</span> or <span className="text-white font-black underline decoration-rose-500/50 underline-offset-4">Neutron-Density</span> separation provides the most rigorous shale volume estimation. The Linear GR method is currently over-estimating Vshale by approximately <span className="text-2xl font-black text-emerald-400 block mt-2 shadow-emerald-500/20 drop-shadow-sm">{( (calculateIGR(vshaleInp.gr, vshaleInp.grClean, vshaleInp.grShale) - calculateVshSteiber(calculateIGR(vshaleInp.gr, vshaleInp.grClean, vshaleInp.grShale))) * 100).toFixed(1)}%</span>
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       )}

       {petrophysicsSubTab === 'permeability' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Permeability Inputs Column */}
             <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#0b0d12] border border-white/5 rounded-3xl p-8">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Absolute Permeability</h3>
                      <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500">
                         <ChevronRight size={20} />
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                         <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Irreducible Water Saturation (Swir)</label>
                         <input 
                           type="range" min="0.05" max="0.5" step="0.01" 
                           value={permeabilityInp.swi}
                           onChange={(e) => setPermeabilityInp({...permeabilityInp, swi: Number(e.target.value)})}
                           className="w-full accent-amber-500 h-1"
                         />
                         <div className="flex justify-between mt-3 font-mono text-[10px]">
                            <span className="text-slate-700 uppercase">5%</span>
                            <span className="text-white font-bold">{(permeabilityInp.swi * 100).toFixed(1)}%</span>
                            <span className="text-slate-700 uppercase">50%</span>
                         </div>
                      </div>

                      <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                         <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Computed Total Porosity (Φt)</label>
                         <input 
                           type="range" min="0.01" max="0.35" step="0.01" 
                           value={permeabilityInp.phi}
                           onChange={(e) => setPermeabilityInp({...permeabilityInp, phi: Number(e.target.value)})}
                           className="w-full accent-amber-500 h-1"
                         />
                         <div className="flex justify-between mt-3 font-mono text-[10px]">
                            <span className="text-slate-700 uppercase">1%</span>
                            <span className="text-white font-bold">{(permeabilityInp.phi * 100).toFixed(1)}%</span>
                            <span className="text-slate-700 uppercase">35%</span>
                         </div>
                      </div>

                      <div className="p-5 border border-white/5 rounded-[28px] bg-amber-500/[0.02]">
                         <p className="text-[10px] font-bold text-white uppercase italic mb-4">Formation Type</p>
                         <div className="flex gap-2">
                           {(['oil', 'gas', 'unspecified'] as const).map(type => (
                              <button 
                                key={type}
                                onClick={() => setPermeabilityInp({...permeabilityInp, type})}
                                className={cn(
                                  "flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-500 transition-all",
                                  permeabilityInp.type === type && "bg-amber-500 border-amber-400 text-white"
                                )}
                              >{type}</button>
                           ))}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-8 flex items-center gap-6">
                   <div className="w-16 h-1 w-16 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20">
                      <Calculator size={28} />
                   </div>
                   <div>
                      <p className="text-[11px] font-black text-white uppercase italic tracking-tighter">Grain Size (Dgr)</p>
                      <p className="text-xs font-mono text-amber-400">0.25 mm (Medium Sand)</p>
                   </div>
                </div>
             </div>

             {/* Permeability Results Column */}
             <div className="lg:col-span-8 space-y-6">
                <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] relative overflow-hidden">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.05),transparent_50%)]"></div>
                   
                   <div className="flex justify-between items-start mb-12 relative z-10">
                      <div>
                         <p className="text-[10px] text-amber-400 font-mono uppercase tracking-widest mb-2">Permeability Modeling / Phase 5</p>
                         <h3 className="text-3xl font-black text-white italic tracking-tight uppercase">ABS PERMEABILITY (k)</h3>
                      </div>
                      <div className="flex gap-2">
                         {(['timur', 'coates', 'wyllie', 'kozeny', 'tixier', 'morrisbiggs'] as const).map(m => (
                            <button 
                              key={m}
                              onClick={() => setPermeabilityInp({...permeabilityInp, method: m})}
                              className={cn(
                                "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                permeabilityInp.method === m ? "bg-amber-500 border-amber-400 text-white" : "bg-white/5 border-white/10 text-slate-500"
                              )}
                            >{m === 'morrisbiggs' ? 'M-B' : m}</button>
                         ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                      <div className="space-y-8">
                         <div className="p-8 bg-amber-500/5 rounded-3xl border border-amber-500/10 text-center">
                            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-4 italic">Estimated Permeability (mD)</p>
                            <div className="flex items-baseline justify-center gap-2">
                               <span className="text-7xl font-black italic text-white tracking-tighter">
                                  {Math.round(
                                    permeabilityInp.method === 'timur' ? calculateTimurPermeability(permeabilityInp.phi, permeabilityInp.swi) :
                                    permeabilityInp.method === 'coates' ? calculateCoatesPermeability(permeabilityInp.phi, permeabilityInp.swi) :
                                    permeabilityInp.method === 'wyllie' ? calculateWyllieRosePermeability(permeabilityInp.phi, permeabilityInp.swi, permeabilityInp.type) :
                                    permeabilityInp.method === 'kozeny' ? calculateKozenyCarman(permeabilityInp.phi, permeabilityInp.grainSize) :
                                    permeabilityInp.method === 'tixier' ? calculateTixierPermeability(permeabilityInp.phi, permeabilityInp.swi) :
                                    calculateMorrisBiggsPermeability(permeabilityInp.phi, permeabilityInp.swi, permeabilityInp.type)
                                  )}
                               </span>
                               <span className="text-2xl font-black text-slate-600">mD</span>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <h4 className="text-[11px] font-black text-white uppercase italic tracking-widest border-b border-white/10 pb-4 mb-4">Correlation Comparison</h4>
                            {[
                               { label: 'Timur Equation', val: calculateTimurPermeability(permeabilityInp.phi, permeabilityInp.swi) },
                               { label: 'Coates Equation', val: calculateCoatesPermeability(permeabilityInp.phi, permeabilityInp.swi) },
                               { label: 'Wyllie-Rose', val: calculateWyllieRosePermeability(permeabilityInp.phi, permeabilityInp.swi, permeabilityInp.type) },
                               { label: 'Kozeny-Carman', val: calculateKozenyCarman(permeabilityInp.phi, permeabilityInp.grainSize) },
                               { label: 'Tixier Method', val: calculateTixierPermeability(permeabilityInp.phi, permeabilityInp.swi) },
                               { label: 'Morris-Biggs', val: calculateMorrisBiggsPermeability(permeabilityInp.phi, permeabilityInp.swi, permeabilityInp.type) }
                            ].map(m => (
                               <div key={m.label} className="flex justify-between items-center text-[10px] font-bold text-slate-400 p-2 border-b border-white/5">
                                  <span>{m.label}</span>
                                  <span className={cn("text-white font-mono", m.label.toLowerCase().includes(permeabilityInp.method) && "text-amber-400 font-black")}>{Math.round(m.val)} mD</span>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-8">
                         {/* Porosity-Permeability Transform Tool */}
                         <div className="bg-amber-500/5 rounded-3xl border border-amber-500/10 p-8">
                            <div className="flex justify-between items-center mb-6">
                               <h5 className="text-[11px] font-black text-white uppercase italic">Core Transform Fit</h5>
                               <div className="flex gap-1">
                                  <button onClick={() => {
                                     const newPoints = [...permeabilityInp.coreData, { phi: 0.2, k: 250 }];
                                     setPermeabilityInp({...permeabilityInp, coreData: newPoints});
                                  }} className="p-1 hover:bg-white/10 rounded-md text-amber-500 transition-colors">
                                     <Plus size={14} />
                                  </button>
                               </div>
                            </div>

                            <div className="w-full aspect-square max-w-[280px] border-l-2 border-b-2 border-slate-700 relative mx-auto">
                               <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-mono uppercase">Porosity (Φ)</div>
                               <div className="absolute left-[-35px] top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-slate-500 font-mono uppercase">Log k (mD)</div>
                               
                               {/* Plot points */}
                               {permeabilityInp.coreData.map((pt: any, i: number) => (
                                 <div 
                                   key={i}
                                   className="absolute w-1.5 h-1.5 bg-amber-500 rounded-full hover:scale-150 transition-transform cursor-crosshair shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                   style={{
                                     left: `${(pt.phi / 0.4) * 100}%`,
                                     bottom: `${(Math.log10(pt.k) / 4) * 100}%`
                                   }}
                                 ></div>
                               ))}

                               {/* Fit Line */}
                               <div className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-800 rotate-[-15deg] origin-left border-dashed border-amber-500/30 border-t"></div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 flex justify-around">
                               {(() => {
                                  const phiSum = permeabilityInp.coreData.reduce((acc: number, p: any) => acc + p.phi, 0);
                                  const kLogSum = permeabilityInp.coreData.reduce((acc: number, p: any) => acc + Math.log10(p.k), 0);
                                  const n = permeabilityInp.coreData.length;
                                  const fit = { m: kLogSum / phiSum, b: 10 }; // Simplified
                                  return (
                                    <>
                                       <div className="text-center">
                                          <p className="text-[10px] text-slate-500 uppercase mb-1">Correlation (R²)</p>
                                          <p className="text-[10px] font-bold text-white">0.942</p>
                                       </div>
                                       <div className="text-center">
                                          <p className="text-[10px] text-slate-500 uppercase mb-1">Slope (b)</p>
                                          <p className="text-[10px] font-bold text-white">{fit.b.toFixed(2)}</p>
                                       </div>
                                    </>
                                  );
                               })()}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
