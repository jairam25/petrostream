import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Activity, 
  Leaf, 
  Zap, 
  ChevronRight,
  AlertTriangle,
  Wind,
  Droplets
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
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { cn, formatNumber } from '../../lib/utils';

export function HSENeuralSimulator() {
  const [incidents, setIncidents] = useState(0.24); // TRIR
  const [emissions, setEmissions] = useState(12.5); // kgCO2/boe
  const [safetyCompliance, setSafetyCompliance] = useState(98.2); // %
  const [methaneIntensity, setMethaneIntensity] = useState(0.12); // %

  const emissionData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: `M${i + 1}`,
      intensity: emissions + (Math.random() * 2 - 1),
      target: 10.0
    }));
  }, [emissions]);

  const radarData = [
    { subject: 'Air Quality', A: 85, fullMark: 100 },
    { subject: 'Water Usage', A: 90, fullMark: 100 },
    { subject: 'Waste Mgmt', A: 75, fullMark: 100 },
    { subject: 'Safety', A: 98, fullMark: 100 },
    { subject: 'Process Safety', A: 92, fullMark: 100 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-8 bg-panel-bg border border-white/5 rounded-3xl shadow-2xl relative overflow-hidden group mb-8">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Control Panel */}
      <div className="lg:col-span-3 space-y-6 relative z-10">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
              <ShieldCheck size={20} className="animate-pulse" />
           </div>
           <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">HSE-AI Guard</h3>
              <p className="text-[11px] text-slate-500 font-mono uppercase tracking-widest">Live Safety Monitoring</p>
           </div>
        </div>

        <div className="space-y-4">
           <HSESlider label="TRIR (Target < 0.5)" value={incidents} min={0} max={2} step={0.01} onChange={setIncidents} />
           <HSESlider label="Carbon Intensity" value={emissions} min={0} max={50} step={0.5} onChange={setEmissions} />
           <HSESlider label="Methane Leakage (%)" value={methaneIntensity} min={0} max={1} step={0.01} onChange={setMethaneIntensity} />
           <HSESlider label="Compliance Audit" value={safetyCompliance} min={0} max={100} step={0.1} onChange={setSafetyCompliance} />
        </div>
      </div>

      {/* Main Stats */}
      <div className="lg:col-span-6 flex flex-col gap-6 relative z-10">
         <div className="p-8 bg-black/40 border border-white/5 rounded-3xl flex-1 min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Emission intensity profile (kgCO2e/boe)</p>
               <Leaf size={14} className="text-emerald-500" />
            </div>
            <div className="flex-1">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={emissionData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                     <XAxis dataKey="month" stroke="#475569" fontSize={8} fontWeight="bold" />
                     <YAxis stroke="#475569" fontSize={8} fontWeight="bold" />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                     />
                     <Area type="monotone" dataKey="intensity" stroke="#10b981" fill="#10b981" fillOpacity={0.05} strokeWidth={3} />
                     <Area type="monotone" dataKey="target" stroke="#475569" fill="transparent" strokeDasharray="5 5" strokeWidth={1} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
               <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Barrier Integrity Radar</p>
               <div className="flex-1 min-h-[140px] -mt-4 scale-110">
                  <ResponsiveContainer width="100%" height="100%">
                     <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#ffffff10" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 8, fontWeight: 'bold' }} />
                        <Radar
                           name="Performance"
                           dataKey="A"
                           stroke="#10b981"
                           fill="#10b981"
                           fillOpacity={0.3}
                        />
                     </RadarChart>
                  </ResponsiveContainer>
               </div>
            </div>
            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
               <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Process Safety Score</p>
               <h4 className="text-4xl font-black italic text-emerald-400 tracking-tighter">94.8</h4>
               <div className="mt-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Tier 1 Target Met</span>
               </div>
            </div>
         </div>
      </div>

      {/* Analytics */}
      <div className="lg:col-span-3 space-y-6 relative z-10">
         <div className="p-6 bg-white/5 border border-white/5 rounded-2xl h-full flex flex-col">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 italic">Risk Diagnostics</h4>
            <div className="space-y-6 flex-1">
               <MetricRow label="LTI Count" value="0" status="good" />
               <MetricRow label="Flaring Index" value="Low" status="good" />
               <MetricRow label="LDAR Compliance" value="100%" status="good" />
               <MetricRow label="Spill Exposure" value="Minor" status="warning" />
            </div>
            
            <button className="w-full mt-8 py-4 bg-emerald-600 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:scale-[0.98] transition-all flex items-center justify-center gap-2 italic shadow-lg shadow-emerald-500/20">
               Generate Compliance Report <ChevronRight size={14} />
            </button>
         </div>
      </div>
    </div>
  );
}

function HSESlider({ label, value, min, max, step, onChange }: any) {
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
            className="w-full h-1 bg-white/10 rounded-full appearance-none accent-emerald-500 cursor-pointer" 
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
