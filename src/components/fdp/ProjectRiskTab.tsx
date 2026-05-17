import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Settings2, 
  Activity, 
  ShieldAlert, 
  ArrowRightCircle, 
  Clock, 
  Truck, 
  HardHat, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ListRestart,
  BarChart3,
  Info,
  RefreshCw
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  AreaChart,
  Area
} from 'recharts';

export function ProjectRiskTab() {
  const [activeView, setActiveView] = useState<'timeline' | 'risk'>('timeline');
  const [activeTool, setActiveTool] = useState<'mitigation' | 'montecarlo' | null>(null);

  // Timeline Milestones
  const milestones = [
    { label: "Concept Selection", duration: 12, start: 0, color: '#3b82f6' },
    { label: "FEED", duration: 18, start: 12, color: '#6366f1' },
    { label: "Detailed Eng.", duration: 24, start: 30, color: '#8b5cf6' },
    { label: "Procure & Fab", duration: 36, start: 42, color: '#ec4899' },
    { label: "Install & Hookup", duration: 12, start: 78, color: '#f43f5e' },
    { label: "Commissioning", duration: 6, start: 90, color: '#f59e0b' }
  ];

  const totalMonths = milestones[milestones.length - 1].start + milestones[milestones.length - 1].duration;

  // Risk Register
  const risks = [
    { id: 1, name: "Reservoir performance uncertainty", cat: "Subsurface", p: 4, c: 5 },
    { id: 2, name: "Offshore weather delays", cat: "Operational", p: 5, c: 3 },
    { id: 3, name: "Steel price fluctuation", cat: "Commercial", p: 3, c: 4 },
    { id: 4, name: "Lost circulation (Drilling)", cat: "Technical", p: 3, c: 3 },
    { id: 5, name: "HSE Regulatory shifts", cat: "Regulatory", p: 2, c: 5 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Sidebar Controls */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Settings2 size={16} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Project View</h4>
           </div>
           
           <div className="space-y-3">
              <button 
                onClick={() => { setActiveView('timeline'); setActiveTool(null); }}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl transition-all border",
                  activeView === 'timeline' && !activeTool ? "bg-cyan-500 text-black border-cyan-500" : "bg-white/5 text-slate-500 border-white/10"
                )}
              >
                 <span className="text-[10px] font-black uppercase tracking-widest">Master Timeline</span>
                 <Calendar size={16} />
              </button>
              <button 
                onClick={() => { setActiveView('risk'); setActiveTool(null); }}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl transition-all border",
                  activeView === 'risk' && !activeTool ? "bg-red-500 text-white border-red-500" : "bg-white/5 text-slate-500 border-white/10"
                )}
              >
                 <span className="text-[10px] font-black uppercase tracking-widest">Risk Register</span>
                 <ShieldAlert size={16} />
              </button>
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-amber-900/40 to-black border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <Clock size={18} className="text-amber-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Decision Gates</h5>
           </div>
           <div className="space-y-4">
              <GateItem label="DG1: Concept Selection" complete />
              <GateItem label="DG2: FEED Entry" active />
              <GateItem label="DG3: FID (Final Investment)" />
              <GateItem label="DG4: First Oil" />
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-9 space-y-8">
        {activeTool === 'mitigation' ? (
           <MitigationBuilder risks={risks} onBack={() => setActiveTool(null)} />
        ) : activeTool === 'montecarlo' ? (
           <MonteCarloSimulator onBack={() => setActiveTool(null)} />
        ) : activeView === 'timeline' ? (
           <div className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] relative overflow-hidden">
              <div className="flex items-center justify-between mb-12 relative z-10">
                 <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Project <span className="text-cyan-500">Master Schedule</span></h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Standard Offshore Development Lifecycle (Months)</p>
                 </div>
                 <div className="flex gap-4">
                    <div className="text-right">
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Total Duration</span>
                       <span className="text-2xl font-black text-white italic">{totalMonths} Months</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-4 relative z-10">
                 {milestones.map((m, idx) => (
                    <div key={m.label} className="group relative">
                       <div className="flex items-center gap-6 mb-2">
                          <span className="w-32 text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{m.label}</span>
                          <div className="flex-1 h-3 bg-white/5 rounded-full relative overflow-hidden">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(m.duration / totalMonths) * 100}%` }}
                                transition={{ delay: idx * 0.1 }}
                                style={{ marginLeft: `${(m.start / totalMonths) * 100}%`, backgroundColor: m.color }}
                                className="h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:brightness-125 transition-all"
                             />
                          </div>
                          <span className="w-16 text-right text-[10px] font-mono text-slate-500 uppercase tracking-widest">{m.duration}M</span>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="absolute bottom-8 right-12 flex items-center gap-2 group cursor-help">
                 <Info size={14} className="text-slate-600 group-hover:text-cyan-400" />
                 <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest group-hover:text-slate-500 italic">Critical Path Identification Enabled</span>
              </div>
           </div>
        ) : (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-12 glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] relative overflow-hidden">
                 <div className="flex items-center justify-between mb-12">
                    <div>
                       <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Project <span className="text-red-500">Risk Matrix</span></h3>
                       <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Probability vs Consequence Severity Breakdown</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="h-[400px] w-full relative">
                       <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" />
                             <XAxis type="number" dataKey="p" name="Probability" stroke="#475569" fontSize={10} domain={[0, 5]} ticks={[1,2,3,4,5]} label={{ value: 'Probability', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#475569' }} />
                             <YAxis type="number" dataKey="c" name="Consequence" stroke="#475569" fontSize={10} domain={[0, 5]} ticks={[1,2,3,4,5]} label={{ value: 'Consequence', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#475569' }} />
                             <ZAxis type="number" range={[400, 1000]} />
                             <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                             <Scatter name="Risks" data={risks}>
                                {risks.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.p * entry.c > 15 ? '#f43f5e' : entry.p * entry.c > 8 ? '#f59e0b' : '#10b981'} />
                                ))}
                             </Scatter>
                          </ScatterChart>
                       </ResponsiveContainer>
                       {/* Labels for risk zones */}
                       <div className="absolute top-10 right-10 text-[10px] font-black text-red-500 uppercase italic opacity-30">Critical Zone</div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6">Top Critical Risks (P x C)</h4>
                       {risks.sort((a,b) => (b.p*b.c) - (a.p*a.c)).map(risk => (
                          <div key={risk.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                             <div className="flex items-center gap-4">
                                <div className={cn(
                                   "h-2 w-2 rounded-full",
                                   risk.p * risk.c > 15 ? "bg-red-500 shadow-[0_0_10px_#f43f5e]" : 
                                   risk.p * risk.c > 8 ? "bg-amber-500 shadow-[0_0_10px_#f59e0b]" : "bg-emerald-500 shadow-[0_0_10px_#10b981]"
                                )} />
                                <div>
                                   <p className="text-[10px] font-black text-white uppercase tracking-wider">{risk.name}</p>
                                   <p className="text-[10px] text-slate-500 uppercase tracking-widest">{risk.cat}</p>
                                </div>
                             </div>
                             <span className="text-[11px] font-black text-slate-400 font-mono">Rank {risk.p * risk.c}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div 
             onClick={() => setActiveTool('mitigation')}
             className={cn(
               "glass-card rounded-3xl p-10 border-white/5 flex items-center justify-between group cursor-pointer transition-all",
               activeTool === 'mitigation' ? "bg-indigo-500/20 border-indigo-500/50" : "bg-black/40 hover:bg-white/5"
             )}
           >
              <div className="flex items-center gap-6">
                 <div className={cn(
                   "h-16 w-16 rounded-[24px] border flex items-center justify-center transition-all",
                   activeTool === 'mitigation' ? "bg-indigo-500 text-white border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
                 )}>
                    <ListRestart size={32} />
                 </div>
                 <div>
                    <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Mitigation Plan Builder</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Define countermeasures for critical subsurface risk</p>
                 </div>
              </div>
              <ArrowRightCircle size={32} className={cn("transition-all", activeTool === 'mitigation' ? "text-indigo-500 translate-x-2" : "text-slate-700 group-hover:text-indigo-500 group-hover:translate-x-2")} />
           </div>

           <div 
             onClick={() => setActiveTool('montecarlo')}
             className={cn(
               "glass-card rounded-3xl p-10 border-white/5 flex items-center justify-between group cursor-pointer transition-all",
               activeTool === 'montecarlo' ? "bg-emerald-500/20 border-emerald-500/50" : "bg-black/40 hover:bg-white/5"
             )}
           >
              <div className="flex items-center gap-6">
                 <div className={cn(
                   "h-16 w-16 rounded-[24px] border flex items-center justify-center transition-all",
                   activeTool === 'montecarlo' ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                 )}>
                    <BarChart3 size={32} />
                 </div>
                 <div>
                    <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Monte Carlo Timeline</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Probabilistic P10/P50/P90 project startup</p>
                 </div>
              </div>
              <ArrowRightCircle size={32} className={cn("transition-all", activeTool === 'montecarlo' ? "text-emerald-500 translate-x-2" : "text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-2")} />
           </div>
        </div>
      </div>
    </div>
  );
}

function MitigationBuilder({ risks, onBack }: { risks: any[], onBack: () => void }) {
  const [selectedRisk, setSelectedRisk] = useState<number | null>(null);

  const mitigationMapping: Record<number, { label: string, cost: string, reduction: string }[]> = {
    1: [
      { label: "Enhanced Seismic Inversion", cost: "$1.2MM", reduction: "-45%" },
      { label: "Downhole Intelligent Gauges", cost: "$0.8MM", reduction: "-30%" },
      { label: "Pressure Maintenance Program", cost: "$2.5MM", reduction: "-50%" }
    ],
    2: [
      { label: "Heavy Lift Contingency", cost: "$4.5MM", reduction: "-60%" },
      { label: "Metocean Monitoring System", cost: "$0.3MM", reduction: "-25%" },
      { label: "Logistics Buffer Schedule", cost: "$0.0MM", reduction: "-15%" }
    ],
    3: [
      { label: "Steel Forward Procurement", cost: "$1.8MM", reduction: "-40%" },
      { label: "Material Substitution Study", cost: "$0.2MM", reduction: "-10%" },
      { label: "Supplier Diversification", cost: "$0.5MM", reduction: "-20%" }
    ],
    4: [
      { label: "Managed Pressure Drilling", cost: "$2.2MM", reduction: "-55%" },
      { label: "Wellbore Stability Analysis", cost: "$0.4MM", reduction: "-35%" },
      { label: "Contingency Casing Design", cost: "$1.5MM", reduction: "-40%" }
    ],
    5: [
      { label: "Env. Baseline Survey", cost: "$0.6MM", reduction: "-30%" },
      { label: "Safety Culture Program", cost: "$0.3MM", reduction: "-20%" },
      { label: "Compliance Audit Stream", cost: "$0.2MM", reduction: "-15%" }
    ]
  };

  const activeMitigations = selectedRisk ? mitigationMapping[selectedRisk] || [] : [];
  const totalCost = activeMitigations.reduce((acc, m) => acc + parseFloat(m.cost.replace('$', '').replace('MM', '')), 0).toFixed(1);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] min-h-[500px]"
    >
       <div className="flex justify-between items-center mb-12">
          <div>
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter italic underline decoration-indigo-500/50 underline-offset-8">Mitigation <span className="text-indigo-500 italic">Plan Builder</span></h3>
             <p className="text-[10px] text-slate-500 font-mono mt-4 uppercase tracking-widest italic font-bold">Neural Countermeasure Assignment Engine</p>
          </div>
          <button onClick={onBack} className="px-6 py-2 bg-white/5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-all">Close Editor</button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Select Risk Target</h4>
             {risks.map(r => (
                <button 
                  key={r.id} 
                  onClick={() => setSelectedRisk(r.id)}
                  className={cn(
                    "w-full p-6 rounded-[24px] border transition-all text-left group",
                    selectedRisk === r.id ? "bg-indigo-500 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]" : "bg-white/5 border-white/5 hover:bg-white/[0.08]"
                  )}
                >
                   <div className="flex justify-between items-center">
                      <span className={cn("text-xs font-black uppercase italic transition-all", selectedRisk === r.id ? "text-white" : "text-slate-300 group-hover:text-white")}>{r.name}</span>
                      <span className={cn("text-[11px] font-mono", selectedRisk === r.id ? "text-white/60" : "text-slate-600")}>ID-{r.id}</span>
                   </div>
                </button>
             ))}
          </div>

          <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40 flex flex-col justify-center items-center text-center">
             {!selectedRisk ? (
                <div className="space-y-4">
                   <ShieldAlert size={48} className="text-slate-800 mx-auto" />
                   <p className="text-[11px] text-slate-600 uppercase font-black italic tracking-widest">Select a risk to generate neural mitigations</p>
                </div>
             ) : (
                <div className="w-full space-y-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div>
                      <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Recommended Actions</h5>
                      <div className="space-y-3">
                         {activeMitigations.map((m, idx) => (
                           <MitigationRow key={idx} label={m.label} cost={m.cost} riskReduction={m.reduction} />
                         ))}
                      </div>
                   </div>
                   <div className="pt-8 border-t border-white/5">
                      <div className="flex justify-between items-end mb-2">
                         <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Mitigation Cost</span>
                         <span className="text-xl font-black text-white italic font-mono">$ {totalCost} MM</span>
                      </div>
                      <button className="w-full py-4 bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:brightness-110 transition-all">Approve Countermeasures</button>
                   </div>
                </div>
             )}
          </div>
       </div>
    </motion.div>
  );
}

function MonteCarloSimulator({ onBack }: { onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] min-h-[500px]"
    >
       <div className="flex justify-between items-center mb-12">
          <div>
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter italic underline decoration-emerald-500/50 underline-offset-8">Monte Carlo <span className="text-emerald-500 italic">Timeline</span></h3>
             <p className="text-[10px] text-slate-500 font-mono mt-4 uppercase tracking-widest italic font-bold italic">Probabilistic Project Startup Distribution (10,000 Iterations)</p>
          </div>
          <button onClick={onBack} className="px-6 py-2 bg-white/5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 transition-all">Close Simulator</button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={Array.from({ length: 50 }).map((_, i) => {
                   const x = i + 80;
                   const y = Math.exp(-Math.pow(x-96, 2) / 50) * 100; // Normal distribution
                   return { months: x, prob: y };
                })}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                   <XAxis dataKey="months" stroke="#475569" fontSize={10} label={{ value: 'Project Months', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#475569' }} />
                   <YAxis hide />
                   <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                   <Area type="monotone" dataKey="prob" stroke="#10b981" fill="rgba(16,185,129,0.1)" strokeWidth={3} />
                </AreaChart>
             </ResponsiveContainer>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-center gap-6">
             <ProbMetric label="P10 (Optimistic)" val="88M" color="text-sky-400" />
             <ProbMetric label="P50 (Deterministic)" val="96M" color="text-emerald-400" />
             <ProbMetric label="P90 (Pessimistic)" val="108M" color="text-rose-400" />
             
             <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                <p className="text-[11px] text-slate-500 uppercase font-bold leading-relaxed italic text-center">Neural Simulation considers supply chain volatility, reservoir uncertainty, and weather windows.</p>
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function MitigationRow({ label, cost, riskReduction }: { label: string, cost: string, riskReduction: string }) {
  return (
    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
       <span className="text-[10px] font-bold text-white uppercase italic">{label}</span>
       <div className="flex gap-4 items-center">
          <span className="text-[11px] font-mono text-slate-500">{cost}</span>
          <span className="text-[10px] font-black text-emerald-400 font-mono italic">{riskReduction}</span>
       </div>
    </div>
  );
}

function ProbMetric({ label, val, color }: { label: string, val: string, color: string }) {
  return (
    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex justify-between items-baseline group hover:bg-white/[0.08] transition-all cursor-pointer">
       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
       <span className={cn("text-2xl font-black italic transition-all group-hover:scale-110", color)}>{val}</span>
    </div>
  );
}

function GateItem({ label, active, complete }: { label: string, active?: boolean, complete?: boolean }) {
  return (
    <div className="flex items-center gap-4 group">
       <div className={cn(
          "h-3 w-3 rounded-full border-2 transition-all",
          complete ? "bg-emerald-500 border-emerald-500" : 
          active ? "bg-cyan-500 border-cyan-500 shadow-[0_0_10px_#06b6d4]" : "border-slate-700"
       )} />
       <span className={cn(
          "text-[11px] font-black uppercase tracking-widest transition-all",
          complete ? "text-slate-500 line-through" : active ? "text-white" : "text-slate-700"
       )}>{label}</span>
    </div>
  );
}
