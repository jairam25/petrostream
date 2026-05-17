import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  AreaChart,
  Area,
  ReferenceLine,
  Scatter
} from 'recharts';
import { 
  TrendingDown, 
  Activity, 
  BarChart3, 
  FileText, 
  Settings2,
  AlertCircle,
  Database,
  ArrowRightCircle,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculateArpsHyperbolic, calculateArpsRemainingReserves } from '../../lib/reservoir';

export function DeclineReservesTab() {
  const [activeModel, setActiveModel] = useState<'exponential' | 'hyperbolic' | 'harmonic'>('hyperbolic');
  
  // Arps Parameters
  const [params, setParams] = useState({
    qi: 500,
    di_annual: 0.25, // 25% annual
    b: 0.5,
    qEconomic: 25,
    tToDate: 0
  });

  const [forecastYears, setForecastYears] = useState(10);

  const results = useMemo(() => {
    const di_daily = params.di_annual / 365;
    const b = activeModel === 'exponential' ? 0 : activeModel === 'harmonic' ? 1 : params.b;
    
    // Time to economic limit
    // t_limit = [(qi/qe)^b - 1] / (b * di)
    let t_limit = 0;
    if (b === 0) {
      t_limit = Math.log(params.qi / params.qEconomic) / di_daily;
    } else {
      t_limit = (Math.pow(params.qi / params.qEconomic, b) - 1) / (b * di_daily);
    }
    
    const remainingReserves = calculateArpsRemainingReserves(params.qi, params.qEconomic, di_daily, b);
    const eur = remainingReserves; // Simplified: just forecast for now

    // Generate forecast points
    const points = [];
    const step = t_limit / 50;
    for (let t = 0; t <= t_limit; t += step) {
      points.push({
        time: t / 365,
        rate: calculateArpsHyperbolic(params.qi, di_daily, b, t)
      });
    }

    return { points, remainingReserves, eur, t_limit: t_limit / 365, b };
  }, [params, activeModel]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Parameters Sidebar */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Settings2 size={16} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">DCA Parameters</h4>
           </div>
           
           <div className="space-y-8">
              <InputWithSlider label="Initial Rate (qi)" value={params.qi} min={50} max={2000} step={10} unit="STB/d" onChange={(v) => setParams({...params, qi: v})} />
              <InputWithSlider label="Annual Decline (Di)" value={params.di_annual * 100} min={1} max={80} step={1} unit="%" onChange={(v) => setParams({...params, di_annual: v/100})} />
              
              {activeModel === 'hyperbolic' && (
                <InputWithSlider label="Hyperbolic Exponent (b)" value={params.b} min={0.01} max={0.99} step={0.01} unit="" onChange={(v) => setParams({...params, b: v})} />
              )}
              
              <InputWithSlider label="Economic Limit (qe)" value={params.qEconomic} min={5} max={100} step={1} unit="STB/d" onChange={(v) => setParams({...params, qEconomic: v})} />
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-indigo-900/40 to-black border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <Activity size={18} className="text-indigo-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Arps Model Selection</h5>
           </div>
           <div className="flex flex-col gap-2">
              {[
                { id: 'exponential', label: 'Exponential (b=0)' },
                { id: 'hyperbolic', label: 'Hyperbolic (0 < b < 1)' },
                { id: 'harmonic', label: 'Harmonic (b=1)' }
              ].map(model => (
                <button
                  key={model.id}
                  onClick={() => setActiveModel(model.id as any)}
                  className={cn(
                    "w-full py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all text-left px-6",
                    activeModel === model.id ? "bg-white text-black" : "bg-white/5 text-slate-500 hover:text-white"
                  )}
                >
                  {model.label}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Analysis Area */}
      <div className="lg:col-span-9 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <DCA_Metric label="Remaining Reserves" value={(results.remainingReserves / 1000).toFixed(1)} unit="MSTB" sub="Until Economic Limit" icon={<Database className="text-emerald-500" />} />
           <DCA_Metric label="EUR" value={(results.eur / 1000).toFixed(1)} unit="MSTB" sub="Estimate @ Final" icon={<Zap className="text-amber-500" />} />
           <DCA_Metric label="Production Life" value={results.t_limit.toFixed(1)} unit="Years" sub={`@ qe=${params.qEconomic}`} icon={<TrendingDown className="text-cyan-500" />} />
        </div>

        <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] relative overflow-hidden">
           <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                 <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Decline <span className="text-cyan-500">Forecast</span></h3>
                 <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic">{activeModel} mode active</p>
              </div>
              <div className="flex items-center gap-4">
                 <button className="p-2 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
                    <BarChart3 size={18} />
                 </button>
              </div>
           </div>

           <div className="h-[450px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={results.points}>
                    <defs>
                       <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#475569" 
                      fontSize={10} 
                      label={{ value: 'Time (Years)', position: 'insideBottom', offset: -20, fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={10} 
                      scale="log"
                      domain={[params.qEconomic / 2, 'auto']}
                      label={{ value: 'Rate (STB/d)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }}
                      formatter={(v: number) => [v.toFixed(1), 'Rate']}
                    />
                    <Area type="monotone" dataKey="rate" stroke="#06b6d4" fillOpacity={1} fill="url(#colorRate)" strokeWidth={3} />
                    <ReferenceLine y={params.qEconomic} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Econ Limit', fill: '#f43f5e', fontSize: 9, fontWeight: 800 }} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 space-y-6">
              <div className="flex items-center gap-3">
                 <AlertCircle size={20} className="text-amber-500" />
                 <h4 className="text-xs font-black text-white italic uppercase tracking-widest">Engineering Note</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                Decline curve analysis (DCA) is valid only for wells in boundary-dominated flow. Hyperbolic models often overestimate reserves if 'b' is too high (typical range 0.4-0.6). Modified hyperbolic models switch to exponential decline at a terminal rate (5-8%) to prevent unrealistic long-term forecasts.
              </p>
           </div>

           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 space-y-6">
              <div className="flex items-center gap-3">
                 <ArrowRightCircle size={20} className="text-indigo-500" />
                 <h4 className="text-xs font-black text-white italic uppercase tracking-widest">Future Workflow</h4>
              </div>
              <ul className="space-y-4">
                 <li className="flex items-start gap-3">
                    <div className="h-1 w-1 rounded-full bg-indigo-500 mt-2" />
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Fetkovich Type Curve Matching</span>
                 </li>
                 <li className="flex items-start gap-3">
                    <div className="h-1 w-1 rounded-full bg-indigo-500 mt-2" />
                    <span className="text-[10px] text-slate-500 uppercase font-bold">q vs Np (Rate-Cumulative) Diagnostic</span>
                 </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}

function DCA_Metric({ label, value, unit, sub, icon }: { label: string, value: string, unit: string, sub: string, icon: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40 relative overflow-hidden group">
       <div className="flex items-center gap-3 mb-6 relative z-10">
          {icon}
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
       </div>
       <div className="flex items-baseline gap-2 mb-2 relative z-10">
          <span className="text-4xl font-black text-white italic tracking-tighter uppercase">{value}</span>
          <span className="text-[10px] font-bold text-slate-600 uppercase">{unit}</span>
       </div>
       <p className="text-[11px] text-slate-600 font-mono uppercase tracking-widest relative z-10">{sub}</p>
       <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
         {icon}
       </div>
    </div>
  );
}
