import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Cpu, 
  Layers,
  ChevronRight,
  Database
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { cn, formatNumber } from '../../lib/utils';

export function NeuralSimulator() {
  const [inputs, setInputs] = useState({
    area: 1200, // acres
    thickness: 45, // ft
    phi: 0.18,
    sw: 0.25,
    bo: 1.25,
    rf: 0.35
  });

  const ooip = useMemo(() => {
    return (7758 * inputs.area * inputs.thickness * inputs.phi * (1 - inputs.sw)) / 1000000;
  }, [inputs]);

  const reserves = useMemo(() => ooip * inputs.rf, [ooip, inputs.rf]);

  const dataReserves = [
    { name: 'Recoverable', value: reserves, color: '#10b981' },
    { name: 'Residual', value: ooip - reserves, color: '#ef4444' }
  ];

  const forecastData = useMemo(() => {
    const data = [];
    const initialRate = 1200;
    const decline = 0.15;
    for (let i = 0; i < 12; i++) {
      data.push({
        month: i,
        rate: initialRate * Math.exp(-decline * (i/12))
      });
    }
    return data;
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-8 bg-panel-bg border border-border-subtle rounded-3xl shadow-2xl relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-brand-primary/10 transition-all duration-1000" />
      
      {/* Left: Input Console */}
      <div className="lg:col-span-3 space-y-6 relative z-10">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
              <Cpu size={20} className="animate-pulse" />
           </div>
           <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Neural Solver</h3>
              <p className="text-[11px] text-slate-500 font-mono uppercase tracking-widest">Live Volumetric Engine</p>
           </div>
        </div>

        <div className="space-y-4">
           <SimInput label="Drainage Area" value={inputs.area} unit="acres" onChange={v => setInputs({...inputs, area: v})} />
           <SimInput label="Net Thickness" value={inputs.thickness} unit="ft" onChange={v => setInputs({...inputs, thickness: v})} />
           <SimInput label="Porosity" value={inputs.phi} unit="v/v" step={0.01} onChange={v => setInputs({...inputs, phi: v})} />
           <SimInput label="Water Sat" value={inputs.sw} unit="v/v" step={0.01} onChange={v => setInputs({...inputs, sw: v})} />
        </div>
      </div>

      {/* Middle: Visualization Hub */}
      <div className="lg:col-span-6 flex flex-col gap-6 relative z-10">
         <div className="grid grid-cols-2 gap-6 flex-1">
            <div className="p-8 bg-black/40 border border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Original Oil In Place</p>
               <h4 className="text-5xl font-black text-white italic tracking-tighter">
                  {formatNumber(ooip, 1)}
                  <span className="text-xs text-slate-500 not-italic ml-2">MMSTB</span>
               </h4>
               <div className="mt-6 flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <TrendingUp size={12} className="text-emerald-500" />
                  <span className="text-[11px] font-black text-emerald-500 uppercase italic">Volumetric Confidence: 94.2%</span>
               </div>
            </div>

            <div className="p-8 bg-black/40 border border-white/5 rounded-3xl flex flex-col">
               <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resource Split</p>
                  <PieChartIcon size={14} className="text-brand-primary" />
               </div>
               <div className="flex-1 min-h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={dataReserves}
                           cx="50%"
                           cy="50%"
                           innerRadius={45}
                           outerRadius={65}
                           paddingAngle={5}
                           dataKey="value"
                        >
                           {dataReserves.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                           ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         <div className="p-8 bg-black/40 border border-white/5 rounded-3xl h-48 flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estimated Production Profile</p>
               <Activity size={14} className="text-brand-primary" />
            </div>
            <div className="flex-1">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData}>
                     <XAxis dataKey="month" hide />
                     <YAxis hide />
                     <Line type="monotone" dataKey="rate" stroke="#3182ce" strokeWidth={4} dot={false} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* Right: Insights Panel */}
      <div className="lg:col-span-3 space-y-6 relative z-10">
         <div className="p-6 bg-white/5 border border-white/5 rounded-2xl h-full flex flex-col">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 italic">Engineering Insights</h4>
            <div className="space-y-6 flex-1">
               <InsightRow label="Mobility Ratio" value="M < 1.0" status="ideal" />
               <InsightRow label="Capillary Press" value="12.5 psi" status="warning" />
               <InsightRow label="Drainage Radius" value="1,240 ft" status="info" />
            </div>
            
            <button className="w-full mt-8 py-4 bg-brand-primary text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:scale-[0.98] transition-all flex items-center justify-center gap-2 italic shadow-lg shadow-brand-primary/20">
               Sync to Reservoir Model <ChevronRight size={14} />
            </button>
         </div>
      </div>
    </div>
  );
}

function SimInput({ label, value, unit, step = 1, onChange }: any) {
   return (
      <div className="space-y-2">
         <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label}</label>
            <span className="text-[10px] font-mono text-white bg-white/5 px-2 py-0.5 rounded-md">{value} {unit}</span>
         </div>
         <input 
            type="range" 
            min={0} 
            max={value * 2} 
            step={step} 
            value={value} 
            onChange={e => onChange(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-full appearance-none accent-brand-primary cursor-pointer" 
         />
      </div>
   );
}

function InsightRow({ label, value, status }: any) {
   const colors: any = {
      ideal: "bg-emerald-500",
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
