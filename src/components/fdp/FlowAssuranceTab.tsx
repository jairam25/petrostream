import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Thermometer, 
  Settings2, 
  Activity, 
  Wind, 
  Droplets, 
  AlertTriangle,
  ArrowRightCircle,
  Zap,
  Waves,
  ShieldAlert,
  Pipette,
  Gauge
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculateInhibitorDepression, calculateErosionalVelocity } from '../../lib/reservoir';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis,
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  ReferenceArea
} from 'recharts';

export function FlowAssuranceTab() {
  const [params, setParams] = useState({
    pressure: 2500,
    fluidTemp: 120,
    ambientTemp: 45,
    gasGravity: 0.65,
    inhibitorConc: 25, // wt %
    inhibitorType: 'Methanol',
    rhoMix: 5.2, // lb/ft3
    cFactor: 100
  });

  const flowAssuranceData = useMemo(() => {
    const mw = params.inhibitorType === 'Methanol' ? 32.04 : 62.07;
    const dT = calculateInhibitorDepression(params.inhibitorConc, mw);
    const hydrateTemp = 55; // Simplified Kat'z gravity chart value
    const protectedTemp = hydrateTemp - dT;
    
    const erosionalVe = calculateErosionalVelocity(params.cFactor, params.rhoMix);
    const actualVe = 25; // ft/s

    return { 
      dT, 
      protectedTemp, 
      isHydrateRisk: params.ambientTemp < protectedTemp,
      erosionalVe,
      actualVe,
      isErosionRisk: actualVe > erosionalVe
    };
  }, [params]);

  // Baker Plot Data (Conceptual)
  const bakerData = [
    { x: 10, y: 50, regime: 'Slug' },
    { x: 100, y: 10, regime: 'Mist' },
    { x: 5, y: 2, regime: 'Stratified' },
    { x: params.rhoMix * 2, y: 15, regime: 'Current' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Parameters */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Settings2 size={16} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Pipeline Conditions</h4>
           </div>
           
           <div className="space-y-6">
              <InputWithSlider label="Ambient Temp" value={params.ambientTemp} min={30} max={100} step={1} unit="°F" onChange={(v) => setParams({...params, ambientTemp: v})} />
              <InputWithSlider label="Fluid Temp" value={params.fluidTemp} min={50} max={250} step={1} unit="°F" onChange={(v) => setParams({...params, fluidTemp: v})} />
              <InputWithSlider label="Pressure" value={params.pressure} min={500} max={5000} step={100} unit="psi" onChange={(v) => setParams({...params, pressure: v})} />
              
              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Hydrate Inhibition</label>
                <select 
                  value={params.inhibitorType}
                  onChange={(e) => setParams({...params, inhibitorType: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-[10px] text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                >
                  <option value="Methanol">Methanol (CH3OH)</option>
                  <option value="MEG">MEG (Ethylene Glycol)</option>
                </select>
                <InputWithSlider label="Conc. (wt%)" value={params.inhibitorConc} min={0} max={60} step={1} unit="%" onChange={(v) => setParams({...params, inhibitorConc: v})} />
              </div>
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-red-900/40 to-black border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <ShieldAlert size={18} className="text-red-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Flow Risk Alert</h5>
           </div>
           <div className="space-y-4">
              <RiskItem label="Hydrates" risk={flowAssuranceData.isHydrateRisk ? 'High' : 'Low'} />
              <RiskItem label="Erosion" risk={flowAssuranceData.isErosionRisk ? 'Critical' : 'Safe'} />
              <RiskItem label="Wax/Asphaltene" risk="Medium" />
           </div>
        </div>
      </div>

      {/* Analysis Content */}
      <div className="lg:col-span-9 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Hydrate Prediction */}
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40">
              <div className="flex items-center gap-3 mb-8">
                 <Thermometer className="text-cyan-500" size={24} />
                 <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Hydrate <span className="text-cyan-500">Stability</span></h3>
              </div>
              
              <div className="space-y-8">
                 <div className="flex justify-between items-end">
                    <div>
                       <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Suppressed Formation Temp</span>
                       <span className="text-4xl font-black text-white italic tracking-tighter">{flowAssuranceData.protectedTemp.toFixed(1)}°F</span>
                    </div>
                    <div className="text-right">
                       <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Temp Depression (ΔT)</span>
                       <span className="text-xl font-black text-cyan-400">-{flowAssuranceData.dT.toFixed(1)}°F</span>
                    </div>
                 </div>

                 <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4 relative overflow-hidden">
                    <div className="flex justify-between items-center text-[10px]">
                       <span className="text-slate-500 font-bold uppercase tracking-widest">Subcooling Margin</span>
                       <span className={cn(
                          "font-mono font-bold",
                          flowAssuranceData.isHydrateRisk ? "text-red-500" : "text-emerald-500"
                       )}>{(params.ambientTemp - flowAssuranceData.protectedTemp).toFixed(1)}°F</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div 
                         className={cn("h-full transition-all", flowAssuranceData.isHydrateRisk ? "bg-red-500" : "bg-emerald-500")} 
                         style={{ width: `${Math.min(100, Math.max(0, (params.ambientTemp - 30) / (70 - 30) * 100))}%` }} 
                       />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                       <span>30°F (Danger)</span>
                       <span>70°F (Safe)</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Erosion Protection */}
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40">
              <div className="flex items-center gap-3 mb-8">
                 <Zap className="text-amber-500" size={24} />
                 <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Erosional <span className="text-amber-500">Velocity</span></h3>
              </div>
              
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                       <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Limit (Ve)</span>
                       <span className="text-2xl font-black text-white italic">{flowAssuranceData.erosionalVe.toFixed(1)}</span>
                       <span className="text-[10px] font-bold text-slate-600 ml-1">FT/S</span>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                       <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Actual Vel.</span>
                       <span className="text-2xl font-black text-white italic">{flowAssuranceData.actualVe}</span>
                       <span className="text-[10px] font-bold text-slate-600 ml-1">FT/S</span>
                    </div>
                 </div>
                 
                 <div className={cn(
                    "p-4 rounded-2xl flex items-center gap-3 border",
                    flowAssuranceData.isErosionRisk ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                 )}>
                    {flowAssuranceData.isErosionRisk ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                    <span className="text-[11px] font-black uppercase tracking-widest">
                       {flowAssuranceData.isErosionRisk ? "API RP 14E Limit Exceeded" : "Velocity within safe operational limits"}
                    </span>
                 </div>
              </div>
           </div>
        </div>

        {/* Slugging Analysis / Baker Map */}
        <div className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] relative overflow-hidden">
           <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                 <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Liquid/Gas <span className="text-indigo-500">Flow Regimes</span></h3>
                 <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Baker Flow Pattern Map for Two-Phase Horizontal Pipeline</p>
              </div>
           </div>

           <div className="h-[400px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                 <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                    <XAxis type="number" dataKey="x" name="Liquid Mass Velocity" stroke="#475569" fontSize={10} axisLine={false} label={{ value: 'Liquid Loading', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#475569' }} />
                    <YAxis type="number" dataKey="y" name="Gas Mass Velocity" stroke="#475569" fontSize={10} axisLine={false} scale="log" domain={[1, 1000]} />
                    
                    {/* Simplified Regime Areas */}
                    <ReferenceArea x1={0} x2={50} y1={0} y2={10} fill="#10b981" fillOpacity={0.05} />
                    <ReferenceArea x1={50} x2={100} y1={10} y2={100} fill="#f43f5e" fillOpacity={0.05} />
                    
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }}
                    />
                    <Scatter name="Flow Regime" data={bakerData} fill="#3b82f6">
                       {bakerData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.regime === 'Current' ? '#6366f1' : '#ffffff20'} />
                       ))}
                    </Scatter>
                 </ScatterChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Bottom Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <MetricBox label="CII Index" value="1.24" unit="" group="Asphaltene" status="neutral" />
           <MetricBox label="WAT Est." value="72°F" unit="" group="Wax Deposition" status="positive" />
           <MetricBox label="Scale LSI" value="+0.4" unit="" group="Calcite Scale" status="neutral" />
           <MetricBox label="Pigging Freq" value="14" unit="Days" group="Maintenance" status="positive" />
        </div>

        <div className="glass-card rounded-3xl p-10 border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between group cursor-pointer hover:bg-emerald-500/10 transition-all">
           <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-[24px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                 <Pipette size={32} />
              </div>
              <div>
                 <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Inhibitor Sizing & Pumping</h4>
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Calculate pump stroke and drum capacity for Methanol Injection</p>
              </div>
           </div>
           <ArrowRightCircle size={32} className="text-slate-700 group-hover:text-emerald-500 transition-all group-hover:translate-x-2" />
        </div>
      </div>
    </div>
  );
}

function RiskItem({ label, risk }: { label: string, risk: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
       <span className={cn(
          "text-[11px] font-black uppercase tracking-widest",
          risk === 'High' || risk === 'Critical' ? "text-red-500" : 
          risk === 'Medium' ? "text-amber-500" : "text-emerald-500"
       )}>{risk} Risk</span>
    </div>
  );
}

function MetricBox({ label, value, unit, group, status }: { label: string, value: string, unit: string, group: string, status: 'positive' | 'neutral' | 'negative' }) {
  return (
    <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40">
       <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{group}</span>
          <div className={cn(
             "h-1.5 w-1.5 rounded-full",
             status === 'positive' ? "bg-emerald-500" : status === 'neutral' ? "bg-amber-500" : "bg-red-500"
          )} />
       </div>
       <div className="flex items-baseline gap-1 mb-1">
          <span className="text-2xl font-black text-white italic tracking-tighter uppercase">{value}</span>
          <span className="text-[10px] font-bold text-slate-600 uppercase">{unit}</span>
       </div>
       <p className="text-[11px] text-slate-500 font-mono uppercase tracking-widest font-black italic">{label}</p>
    </div>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
