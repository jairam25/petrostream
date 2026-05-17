import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Zap, 
  Settings2, 
  Layers, 
  BarChart3, 
  Calendar,
  Activity,
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculateArpsHyperbolic } from '../../lib/reservoir';

export function ProductionForecastingTab() {
  const [forecastMode, setForecastMode] = useState<'single' | 'field'>('single');
  
  // Single Well Parameters
  const [params, setParams] = useState({
    rampMonths: 2,
    plateauRate: 1200,
    plateauMonths: 18,
    di_annual: 0.35,
    b: 0.5,
    qEconomic: 40
  });

  // Field Rollup Parameters
  const [fieldParams, setFieldParams] = useState({
    wellsPerYear: 5,
    totalWells: 25,
    delayMonths: 3
  });

  const forecastData = useMemo(() => {
    const data = [];
    const di_daily = params.di_annual / 365;
    let cumProd = 0;
    
    // Forecast 10 years
    const totalDays = 365 * 10;
    
    for (let day = 0; day < totalDays; day += 30) {
      let q = 0;
      const month = day / 30;
      
      if (month < params.rampMonths) {
        // Ramp up
        q = (month / params.rampMonths) * params.plateauRate;
      } else if (month < params.rampMonths + params.plateauMonths) {
        // Plateau
        q = params.plateauRate;
      } else {
        // Decline
        const t_decline = (month - params.rampMonths - params.plateauMonths) * 30;
        q = calculateArpsHyperbolic(params.plateauRate, di_daily, params.b, t_decline);
        if (q < params.qEconomic) q = params.qEconomic;
      }
      
      cumProd += q * 30;
      data.push({
        month,
        year: month / 12,
        rate: q,
        cum: cumProd / 1000 // MSTB
      });
    }
    
    return data;
  }, [params]);

  // Field rollup calculation
  const fieldData = useMemo(() => {
    if (forecastMode !== 'field') return [];
    
    const singleWell = forecastData;
    const totalMonths = 12 * 15; // 15 years for field
    const monthlyTotal = new Array(totalMonths).fill(0);
    const monthlyCum = new Array(totalMonths).fill(0);
    
    for (let wellIdx = 0; wellIdx < fieldParams.totalWells; wellIdx++) {
      // Delay based on wells per year
      const startMonth = Math.floor(wellIdx / fieldParams.wellsPerYear) * 12 + (wellIdx % fieldParams.wellsPerYear) * fieldParams.delayMonths;
      
      for (let m = 0; m < singleWell.length; m++) {
        const fieldMonth = startMonth + m;
        if (fieldMonth < totalMonths) {
          monthlyTotal[fieldMonth] += singleWell[m].rate;
        }
      }
    }
    
    let runningCum = 0;
    return monthlyTotal.map((rate, m) => {
      runningCum += rate * 30;
      return {
        month: m,
        year: m / 12,
        rate: rate,
        cum: runningCum / 1000 // MSTB
      };
    });
  }, [forecastData, fieldParams, forecastMode]);

  const activeData = forecastMode === 'single' ? forecastData : fieldData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Parameters Sidebar */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Settings2 size={16} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Segment Parameters</h4>
           </div>
           
           <div className="space-y-8">
              <InputWithSlider label="Ramp-up (Months)" value={params.rampMonths} min={0} max={12} step={1} unit="m" onChange={(v) => setParams({...params, rampMonths: v})} />
              <InputWithSlider label="Plateau Rate" value={params.plateauRate} min={100} max={5000} step={50} unit="STB/d" onChange={(v) => setParams({...params, plateauRate: v})} />
              <InputWithSlider label="Plateau Duration" value={params.plateauMonths} min={0} max={60} step={1} unit="m" onChange={(v) => setParams({...params, plateauMonths: v})} />
              <InputWithSlider label="Annual Decline" value={params.di_annual * 100} min={5} max={80} step={1} unit="%" onChange={(v) => setParams({...params, di_annual: v/100})} />
              <InputWithSlider label="B-Factor" value={params.b} min={0} max={1} step={0.05} unit="" onChange={(v) => setParams({...params, b: v})} />
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-purple-900/40 to-black border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <Layers size={18} className="text-purple-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Rollup Analysis</h5>
           </div>
           <div className="grid grid-cols-2 gap-2 mb-6">
              <button 
                onClick={() => setForecastMode('single')}
                className={cn(
                    "py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                    forecastMode === 'single' ? "bg-white text-black" : "bg-white/5 text-slate-500 hover:text-white"
                )}
              >
                Type Well
              </button>
              <button 
                onClick={() => setForecastMode('field')}
                className={cn(
                    "py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                    forecastMode === 'field' ? "bg-white text-black" : "bg-white/5 text-slate-500 hover:text-white"
                )}
              >
                Field Rollup
              </button>
           </div>
           
           {forecastMode === 'field' && (
             <div className="space-y-6 pt-4 border-t border-white/5">
                <InputWithSlider label="Wells / Year" value={fieldParams.wellsPerYear} min={1} max={50} step={1} unit="" onChange={(v) => setFieldParams({...fieldParams, wellsPerYear: v})} />
                <InputWithSlider label="Total Wells" value={fieldParams.totalWells} min={1} max={500} step={1} unit="" onChange={(v) => setFieldParams({...fieldParams, totalWells: v})} />
                <InputWithSlider label="Drill Gap" value={fieldParams.delayMonths} min={1} max={12} step={1} unit="mo" onChange={(v) => setFieldParams({...fieldParams, delayMonths: v})} />
             </div>
           )}
        </div>
      </div>

      {/* Forecast Visuals */}
      <div className="lg:col-span-9 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <ForecastCard 
             title={forecastMode === 'single' ? 'Production Rate' : 'Field Total Rate'} 
             value={activeData[activeData.length/2]?.rate.toFixed(0) || "0"}
             unit="STB/D"
             icon={<Activity className="text-cyan-500" />}
             chart={
               <ResponsiveContainer width="100%" height={100}>
                  <AreaChart data={activeData}>
                     <Area type="monotone" dataKey="rate" stroke="#06b6d4" fill="#06b6d433" />
                  </AreaChart>
               </ResponsiveContainer>
             }
           />
           <ForecastCard 
             title="EUR/Total Recovery" 
             value={(activeData[activeData.length-1]?.cum || 0).toFixed(1)}
             unit="MSTB"
             icon={<Zap className="text-amber-500" />}
             chart={
               <ResponsiveContainer width="100%" height={100}>
                  <AreaChart data={activeData}>
                     <Area type="monotone" dataKey="cum" stroke="#f59e0b" fill="#f59e0b33" />
                  </AreaChart>
               </ResponsiveContainer>
             }
           />
        </div>

        <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] relative overflow-hidden">
           <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                 <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Full Life <span className="text-purple-500">Forecast</span></h3>
                 <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic">{forecastMode === 'single' ? 'Single Well Profile' : 'Development Schedule Rollup'}</p>
              </div>
              <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[11px] font-black text-white/50 tracking-widest uppercase">
                {forecastMode === 'single' ? 'Ramp -> Plateau -> Arps' : 'Combined Wells'}
              </div>
           </div>

           <div className="h-[450px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={activeData}>
                    <defs>
                       <linearGradient id="colorRateF" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                    <XAxis 
                      dataKey="year" 
                      stroke="#475569" 
                      fontSize={10} 
                      tickFormatter={(v) => `Yr ${v.toFixed(0)}`}
                      label={{ value: 'Field Life (Years)', position: 'insideBottom', offset: -20, fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={10} 
                      label={{ value: 'Rate (STB/d)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }}
                      formatter={(v: number) => [v.toFixed(0), 'Production Rate']}
                    />
                    <Area type="monotone" dataKey="rate" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRateF)" strokeWidth={3} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 space-y-6">
              <div className="flex items-center gap-3">
                 <Calendar size={20} className="text-cyan-500" />
                 <h4 className="text-xs font-black text-white italic uppercase tracking-widest">Drilling Schedule</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The current schedule assumes {fieldParams.wellsPerYear} wells drilled annually with a {fieldParams.delayMonths}-month stagger. 
                This results in a total field plateau duration based on the overlap of individual well performance.
              </p>
              <div className="flex gap-2">
                 <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] font-black text-slate-400 uppercase">Max Active Wells: {fieldParams.totalWells}</div>
                 <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] font-black text-slate-400 uppercase">Total Field Life: 15 Years</div>
              </div>
           </div>

           <div className="glass-card rounded-2xl p-10 bg-gradient-to-br from-emerald-900/20 to-black border-white/5 flex flex-col justify-center">
              <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Facility Capacity Check</h5>
              <div className="flex items-end justify-between mb-2">
                 <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest text-white/40">Peak Field Rate</span>
                 <span className="text-2xl font-black text-white tracking-tighter">{Math.max(...activeData.map(d => d.rate)).toFixed(0)} STB/d</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500" style={{ width: '75%' }} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function ForecastCard({ title, value, unit, icon, chart }: { title: string, value: string, unit: string, icon: React.ReactNode, chart: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40 flex flex-col">
       <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             {icon}
             <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{title}</span>
          </div>
       </div>
       <div className="flex items-baseline gap-2 mb-8">
          <span className="text-5xl font-black text-white italic tracking-tighter">{value}</span>
          <span className="text-[10px] font-bold text-slate-600 uppercase">{unit}</span>
       </div>
       <div className="h-16 w-full opacity-50">{chart}</div>
    </div>
  );
}
