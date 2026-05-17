import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Factory, 
  Activity, 
  TrendingUp, 
  Zap, 
  ChevronRight,
  Flame,
  Droplet,
  Gauge
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { cn, formatNumber } from '../../lib/utils';

export function RefiningNeuralSimulator() {
  const [utilization, setUtilization] = useState(92);
  const [crudeAPI, setCrudeAPI] = useState(32);
  const [complexity, setComplexity] = useState(10.5);
  const [margin, setMargin] = useState(8.5);

  const yieldData = useMemo(() => {
    // Basic yield model based on API
    const light = Math.max(10, (crudeAPI - 10) * 0.8);
    const middle = Math.max(20, (crudeAPI - 10) * 1.2);
    const heavy = 100 - light - middle;
    
    return [
      { name: 'LPG/Gasoline', value: light, color: '#fbbf24' },
      { name: 'Middle Distillates', value: middle, color: '#f59e0b' },
      { name: 'Fuel Oil/VGO', value: heavy * 0.6, color: '#b45309' },
      { name: 'Resid/Coke', value: heavy * 0.4, color: '#451a03' },
    ];
  }, [crudeAPI]);

  const marginData = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    actual: margin + (Math.random() * 2 - 1),
    benchmark: 7.0
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-8 bg-panel-bg border border-white/5 rounded-3xl shadow-2xl relative overflow-hidden group mb-8">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Control Panel */}
      <div className="lg:col-span-3 space-y-6 relative z-10">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
              <Factory size={20} className="animate-pulse" />
           </div>
           <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Refinery-AI Core</h3>
              <p className="text-[11px] text-slate-500 font-mono uppercase tracking-widest">Yield & Margin Optimization</p>
           </div>
        </div>

        <div className="space-y-4">
           <RefSlider label="Refinery Utilization (%)" value={utilization} min={60} max={100} step={1} onChange={setUtilization} />
           <RefSlider label="Crude API Gravity" value={crudeAPI} min={10} max={50} step={0.5} onChange={setCrudeAPI} />
           <RefSlider label="Nelson Complexity" value={complexity} min={2} max={20} step={0.1} onChange={setComplexity} />
           <RefSlider label="Net Margin ($/bbl)" value={margin} min={0} max={25} step={0.5} onChange={setMargin} />
        </div>
      </div>

      {/* Main Charts */}
      <div className="lg:col-span-6 flex flex-col gap-6 relative z-10">
         <div className="p-8 bg-black/40 border border-white/5 rounded-3xl flex-1 min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estimated Yield Profile (Vol %)</p>
               <Droplet size={14} className="text-orange-500" />
            </div>
            <div className="flex-1">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yieldData} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={true} vertical={false} />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" stroke="#475569" fontSize={8} width={80} fontWeight="bold" />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                     />
                     <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                        {yieldData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl flex flex-col">
               <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Margin Trend ($/bbl)</p>
               <div className="flex-1 min-h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={marginData}>
                        <XAxis dataKey="month" hide />
                        <YAxis hide />
                        <Line type="monotone" dataKey="actual" stroke="#f97316" strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="benchmark" stroke="#475569" strokeDasharray="3 3" dot={false} />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>
            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
               <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Energy Intensity Index</p>
               <h4 className="text-4xl font-black italic text-orange-400 tracking-tighter">88.4</h4>
               <div className="mt-2 px-3 py-1 bg-orange-500/10 rounded-full border border-orange-500/20">
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest italic">1st Quartile</span>
               </div>
            </div>
         </div>
      </div>

      {/* Analytics */}
      <div className="lg:col-span-3 space-y-6 relative z-10">
         <div className="p-6 bg-white/5 border border-white/5 rounded-2xl h-full flex flex-col">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 italic">Yield Diagnostics</h4>
            <div className="space-y-6 flex-1">
               <MetricRow label="Octane Potential" value="98.5" status="good" />
               <MetricRow label="Sulfur Removal" value="99.9%" status="good" />
               <MetricRow label="Catalyst Activity" value="Active" status="good" />
               <MetricRow label="Heat Integration" value="Optimal" status="good" />
            </div>
            
            <button className="w-full mt-8 py-4 bg-orange-600 text-black rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:scale-[0.98] transition-all flex items-center justify-center gap-2 italic shadow-lg shadow-orange-500/20">
               Optimize Crude Diet <ChevronRight size={14} />
            </button>
         </div>
      </div>
    </div>
  );
}

function RefSlider({ label, value, min, max, step, onChange }: any) {
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
            className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-500 cursor-pointer" 
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
