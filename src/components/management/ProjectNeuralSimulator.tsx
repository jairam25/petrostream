import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Activity, 
  Target, 
  Zap, 
  ChevronRight,
  AlertTriangle,
  Clock,
  DollarSign
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn, formatNumber } from '../../lib/utils';

export function ProjectNeuralSimulator() {
  const [budget, setBudget] = useState(1200); // $MM
  const [progress, setProgress] = useState(35); // %
  const [riskExposure, setRiskExposure] = useState(45); // %
  const [felScore, setFelScore] = useState(82); // %

  const sCurveData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const planned = (Math.pow(month, 2) / 144) * budget;
      const actual = month <= 4 ? planned * (1 + (Math.random() * 0.1 - 0.05)) : null;
      return { month: `M${month}`, planned, actual };
    });
  }, [budget]);

  const riskData = [
    { name: 'Financial', value: 30, color: '#f43f5e' },
    { name: 'Technical', value: 45, color: '#fbbf24' },
    { name: 'Regulatory', value: 20, color: '#38bdf8' },
    { name: 'Operational', value: 15, color: '#10b981' },
  ];

  const estimatedCompletion = useMemo(() => {
    const burnRate = progress / 4; // % per month
    const monthsRemaining = (100 - progress) / burnRate;
    return monthsRemaining.toFixed(1);
  }, [progress]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-8 bg-panel-bg border border-white/5 rounded-3xl shadow-2xl relative overflow-hidden group mb-8">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Controller */}
      <div className="lg:col-span-3 space-y-6 relative z-10">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
              <Activity size={20} className="animate-pulse" />
           </div>
           <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Project-AI Engine</h3>
              <p className="text-[11px] text-slate-500 font-mono uppercase tracking-widest">Live FEL-3 Optimization</p>
           </div>
        </div>

        <div className="space-y-4">
           <SimSlider label="Project Budget ($MM)" value={budget} min={100} max={5000} step={100} onChange={setBudget} color="rose" />
           <SimSlider label="Physical Progress (%)" value={progress} min={0} max={100} step={1} onChange={setProgress} color="rose" />
           <SimSlider label="FEL Maturity Score" value={felScore} min={0} max={100} step={1} onChange={setFelScore} color="rose" />
           <SimSlider label="Risk Exposure (%)" value={riskExposure} min={0} max={100} step={1} onChange={setRiskExposure} color="rose" />
        </div>

        <div className="pt-6 border-t border-white/5">
           <div className="flex items-center justify-between p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
              <div className="flex items-center gap-2">
                 <Clock size={14} className="text-rose-500" />
                 <span className="text-[10px] font-black text-slate-400 uppercase">Est. Finish</span>
              </div>
              <span className="text-xs font-black text-white italic">{estimatedCompletion} Months</span>
           </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="lg:col-span-6 flex flex-col gap-6 relative z-10">
         <div className="p-8 bg-black/40 border border-white/5 rounded-3xl flex-1 min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cost S-Curve (Planned vs Actual)</p>
               <TrendingUp size={14} className="text-rose-500" />
            </div>
            <div className="flex-1">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sCurveData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                     <XAxis dataKey="month" stroke="#475569" fontSize={8} fontWeight="bold" />
                     <YAxis stroke="#475569" fontSize={8} fontWeight="bold" />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                     />
                     <Area type="monotone" dataKey="planned" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.05} strokeWidth={3} />
                     <Area type="monotone" dataKey="actual" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.1} strokeWidth={3} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl flex flex-col">
               <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Risk Heatmap Distribution</p>
               <div className="flex-1 min-h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={riskData}>
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                           {riskData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
               <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">CPI (Cost Performance)</p>
               <h4 className="text-4xl font-black italic text-emerald-400 tracking-tighter">1.04</h4>
               <div className="mt-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Under Budget</span>
               </div>
            </div>
         </div>
      </div>

      {/* Analytics */}
      <div className="lg:col-span-3 space-y-6 relative z-10">
         <div className="p-6 bg-white/5 border border-white/5 rounded-2xl h-full flex flex-col">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 italic">Strategic Insight</h4>
            <div className="space-y-6 flex-1">
               <MetricRow label="Schedule Variance" value="-2.4%" status="warning" />
               <MetricRow label="Estimate Accuracy" value="±15%" status="info" />
               <MetricRow label="Critical Path" value="FEED-12" status="good" />
               <MetricRow label="Contingency Used" value="12.4%" status="good" />
            </div>
            
            <button className="w-full mt-8 py-4 bg-rose-600 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:scale-[0.98] transition-all flex items-center justify-center gap-2 italic shadow-lg shadow-rose-500/20">
               Optimize Execution Strategy <ChevronRight size={14} />
            </button>
         </div>
      </div>
    </div>
  );
}

function SimSlider({ label, value, min, max, step, onChange, color }: any) {
   return (
      <div className="space-y-2">
         <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label}</label>
            <span className="text-[10px] font-mono text-white bg-white/5 px-2 py-0.5 rounded-md">{value}</span>
         </div>
         <input 
            type="range" 
            min={min} 
            max={max} 
            step={step} 
            value={value} 
            onChange={e => onChange(Number(e.target.value))}
            className={cn(
               "w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer",
               color === 'rose' ? "accent-rose-500" : "accent-brand-primary"
            )} 
         />
      </div>
   );
}

function MetricRow({ label, value, status }: any) {
   const colors: any = {
      good: "bg-emerald-500",
      warning: "bg-amber-500",
      info: "bg-cyan-500"
   };
   return (
      <div className="flex items-center justify-between group">
         <div className="flex items-center gap-3">
            <div className={cn("w-1.5 h-1.5 rounded-full", colors[status])} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label}</span>
         </div>
         <span className="text-[10px] font-mono text-white font-black">{value}</span>
      </div>
   );
}
