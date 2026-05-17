import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Layers, 
  Settings2, 
  TrendingUp, 
  Activity, 
  Map as MapIcon, 
  RefreshCw,
  Waves,
  Zap,
  Target,
  Database,
  Search,
  Droplets,
  CheckCircle2
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  BarChart,
  Bar
} from 'recharts';

export function ReservoirAnalyticsTab() {
  const [activeAnalysis, setActiveAnalysis] = useState<'material-balance' | 'waterflood' | 'connectivity' | 'infill'>('material-balance');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
      {/* Sidebar */}
      <div className="lg:col-span-3 space-y-4">
        {[
          { id: 'material-balance', label: 'MBAL Cross-Check', desc: 'Volumetric vs DCA vs MatBal', icon: Database },
          { id: 'waterflood', label: 'Flood Performance', icon: Droplets, desc: 'VRR & Hall Plots' },
          { id: 'connectivity', label: 'Inter-well Sync', icon: Activity, desc: 'Lagged Correlation Analysis' },
          { id: 'infill', label: 'Infill Optimizer', icon: Target, desc: 'Undrained area detection' }
        ].map(ana => (
           <motion.div 
              key={ana.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveAnalysis(ana.id as any)}
              className={cn(
                "glass-card rounded-2xl p-6 border-white/5 transition-all cursor-pointer",
                activeAnalysis === ana.id ? "bg-emerald-500/10 ring-1 ring-emerald-500/50" : "bg-black/40 hover:bg-white/[0.02]"
              )}
           >
              <div className="flex items-center gap-4">
                 <div className={cn("p-3 rounded-2xl", activeAnalysis === ana.id ? "bg-emerald-500 text-black" : "bg-white/5 text-slate-500")}>
                    <ana.icon size={18} />
                 </div>
                 <div>
                    <h4 className={cn("text-xs font-black uppercase italic tracking-wider", activeAnalysis === ana.id ? "text-emerald-400" : "text-white")}>{ana.label}</h4>
                    <p className="text-[11px] text-slate-600 italic mt-0.5">{ana.desc}</p>
                 </div>
              </div>
           </motion.div>
        ))}

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-emerald-950 to-black border-white/5 mt-8">
           <div className="flex items-center gap-3 mb-6">
              <RefreshCw size={18} className="text-emerald-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Reservoir Sync</h5>
           </div>
           <div className="space-y-4">
              <SyncMetric label="Historical Match" val="94%" />
              <SyncMetric label="Pressure Match" val="88%" />
              <SyncMetric label="Model Deviance" val="LOW" />
           </div>
        </div>
      </div>

      {/* Main Analysis View */}
      <div className="lg:col-span-9">
         {activeAnalysis === 'material-balance' && <MaterialBalanceCrossCheck />}
         {activeAnalysis === 'waterflood' && <WaterfloodAnalytics />}
         {activeAnalysis === 'connectivity' && <ConnectivityAnalysis />}
         {activeAnalysis === 'infill' && <InfillWellAnalysis />}
      </div>
    </div>
  );
}

function MaterialBalanceCrossCheck() {
  const data = [
    { method: 'Volumetric', val: 1450, error: 15 },
    { method: 'DCA (Arps)', val: 1240, error: 10 },
    { method: 'Material Bal', val: 1380, error: 8 },
    { method: 'Simulation', val: 1410, error: 5 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#050710] h-full"
    >
       <div className="flex justify-between items-start mb-12">
          <div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Material Balance <span className="text-emerald-500">Cross-Check</span></h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Reserves Comparison & Discrepancy Auditing</p>
          </div>
          <div className="p-6 bg-red-500/10 rounded-3xl border border-red-500/20 text-center">
             <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-1">Max Deviation</span>
             <span className="text-2xl font-black text-white italic">16.9%</span>
          </div>
       </div>

       <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
             <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis dataKey="method" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} label={{ value: 'MMSTB', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#475569' }} />
                <Tooltip 
                   cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                   contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }}
                />
                <Bar dataKey="val" radius={[12, 12, 0, 0]}>
                   {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#1e293b'} />
                   ))}
                </Bar>
             </BarChart>
          </ResponsiveContainer>
       </div>
    </motion.div>
  );
}

function WaterfloodAnalytics() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#050710] h-full"
    >
       <div className="flex justify-between items-start mb-12">
          <div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter italic">Waterflood <span className="text-cyan-400 italic">Efficiency</span></h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold italic">Voidage Replacement Ratio (VRR) & WOR Performance</p>
          </div>
          <div className="flex gap-4">
             <div className="p-6 bg-cyan-500/10 rounded-3xl border border-cyan-500/20 text-center">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-1">Target VRR</span>
                <span className="text-2xl font-black text-white italic">1.02</span>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-[300px]">
             <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-4 italic">Injection/Production History</h4>
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={Array.from({ length: 20 }).map((_, i) => ({ t: i, q: 100 - i, j: 95 + Math.sin(i)*5 }))}>
                   <XAxis dataKey="t" hide />
                   <YAxis stroke="#475569" fontSize={10} axisLine={false} />
                   <Tooltip />
                   <Line type="monotone" dataKey="q" stroke="#10b981" strokeWidth={3} dot={false} name="Prod" />
                   <Line type="monotone" dataKey="j" stroke="#3b82f6" strokeWidth={3} dot={false} name="Inject" strokeDasharray="5 5" />
                </LineChart>
             </ResponsiveContainer>
          </div>
          <div className="h-[300px]">
             <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-4 italic">Hall Plot (Pluggedness Detection)</h4>
             <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                   <XAxis type="number" dataKey="x" name="Cum Inject" stroke="#475569" fontSize={10} />
                   <YAxis type="number" dataKey="y" name="Pressure Integral" stroke="#475569" fontSize={10} />
                   <Tooltip />
                   <Scatter data={Array.from({ length: 15 }).map((_, i) => ({ x: i*10, y: i*12 + (i > 10 ? i*1.5 : 0) }))} fill="#22d3ee" />
                </ScatterChart>
             </ResponsiveContainer>
          </div>
       </div>
    </motion.div>
  );
}

function ConnectivityAnalysis() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#050710] h-full"
    >
       <div className="mb-12">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter italic">Well <span className="text-indigo-400 italic">Connectivity</span> Analysis</h3>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold italic">Lagged Pearson Correlation (Injector to Producer Response)</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
             {[
                { pair: 'INJ-01 → PRD-04', correlation: 0.82, lag: '14 Days' },
                { pair: 'INJ-01 → PRD-02', correlation: 0.35, lag: '8 Days' },
                { pair: 'INJ-02 → PRD-04', correlation: 0.12, lag: 'N/A' },
                { pair: 'INJ-03 → PRD-09', correlation: 0.74, lag: '21 Days' },
             ].map((c, i) => (
                <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/[0.08] transition-all">
                   <div className="flex items-center gap-4">
                      <div className="w-2 h-8 rounded-full bg-indigo-500/20 group-hover:bg-indigo-500 transition-all" />
                      <div>
                         <span className="text-[10px] font-black text-white uppercase tracking-tight block">{c.pair}</span>
                         <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Travel Time: {c.lag}</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="text-[12px] font-black text-indigo-400 font-mono italic">r={c.correlation}</span>
                   </div>
                </div>
             ))}
          </div>

          <div className="p-8 bg-black/40 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center">
             <div className="w-32 h-32 border-4 border-indigo-500/20 rounded-full relative mb-6 animate-spin-slow">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,1)]" />
             </div>
             <h4 className="text-xs font-black text-white uppercase italic mb-2 italic">Network Topology</h4>
             <p className="text-[10px] text-slate-600 max-w-[220px]">Inferring reservoir permeability channels through surface flowrate transients.</p>
          </div>
       </div>
    </motion.div>
  );
}

function InfillWellAnalysis() {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      
      // Trigger actual download
      const proposalContent = `INFILL DRILLING PROPOSAL: TARGET-A\n==================================\nDrainage Radius: 1,240 ft\nInitial Pressure: 3,450 PSI\nBypass Pay Probability: 82%\nUndrained Potential: 4.5 MMbbl\n\nTARGET COORDS:\nX: 50, Y: 50\n`;
      const blob = new Blob([proposalContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Drilling_Proposal_Target_A.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#050710] h-full"
    >
       <div className="flex justify-between items-start mb-12">
          <div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter italic">Infill <span className="text-amber-500 italic">Optimization</span></h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold italic">Drainage Area Analysis & Sweet Spot Detection</p>
          </div>
          <div className="p-6 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-center">
             <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1 italic">Undrained Potential</span>
             <span className="text-2xl font-black text-white italic">4.5 MMbbl</span>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-[350px] glass-card bg-black rounded-2xl p-8 border border-white/5">
             <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                   <XAxis type="number" dataKey="x" hide />
                   <YAxis type="number" dataKey="y" hide />
                   <ZAxis type="number" dataKey="z" range={[100, 1000]} />
                   <Tooltip />
                   <Scatter name="Existing Wells" data={[
                      { x: 10, y: 15, z: 400, name: 'Well 01' },
                      { x: 25, y: 30, z: 400, name: 'Well 02' },
                      { x: 50, y: 10, z: 400, name: 'Well 03' },
                      { x: 80, y: 70, z: 400, name: 'Well 04' },
                      { x: 20, y: 80, z: 400, name: 'Well 05' },
                   ]} fill="#475569" />
                   <Scatter name="Sweet Spot" data={[
                      { x: 50, y: 50, z: 1200, name: 'INFILL TARGET-A' }
                   ]} fill="#f59e0b" />
                </ScatterChart>
             </ResponsiveContainer>
          </div>

          <div className="space-y-6">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic border-b border-white/5 pb-4">Target-A Characteristics</h4>
             <InfillSpec label="Est. Drainage Radius" val="1,240 ft" />
             <InfillSpec label="Est. Initial Pressure" val="3,450 PSI" />
             <InfillSpec label="Bypass Pay Prob" val="82%" />
             <button 
               onClick={handleGenerate}
               disabled={generating || generated}
               className={cn(
                 "w-full mt-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                 generated 
                   ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                   : "bg-amber-500 text-black hover:bg-amber-400 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
               )}
             >
                {generating ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw size={14} className="animate-spin" />
                    Generating...
                  </div>
                ) : generated ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    Proposal Ready (PDF)
                  </div>
                ) : (
                  <>
                    <Target size={14} />
                    Generate Drilling Proposal
                  </>
                )}
             </button>
          </div>
       </div>
    </motion.div>
  );
}

function SyncMetric({ label, val }: { label: string, val: string }) {
  return (
    <div className="flex justify-between items-center bg-black p-4 rounded-xl border border-white/5">
       <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">{label}</span>
       <span className="text-[10px] font-bold text-white italic">{val}</span>
    </div>
  );
}

function InfillSpec({ label, val }: { label: string, val: string }) {
  return (
    <div className="flex justify-between items-center py-2">
       <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest italic">{label}</span>
       <span className="text-[11px] font-black text-white italic">{val}</span>
    </div>
  );
}
