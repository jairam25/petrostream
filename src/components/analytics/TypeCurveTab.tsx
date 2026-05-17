import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
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
  ScatterChart,
  Scatter
} from 'recharts';
import { 
  Waves, 
  Settings2, 
  TrendingUp, 
  Activity, 
  BoxSelect, 
  Maximize2,
  Columns,
  Layers,
  History,
  Target
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';

export function TypeCurveTab() {
  const [normBasis, setNormBasis] = useState<'none' | 'lateral' | 'proppant'>('none');
  const [view, setView] = useState<'rate' | 'cum' | 'log'>('rate');
  const [selectedVintages, setSelectedVintages] = useState<string[]>(['2023 Vintage']);

  const typeCurveData = useMemo(() => {
    let scale = 1;
    if (normBasis === 'lateral') scale = 0.8;
    if (normBasis === 'proppant') scale = 0.6;

    let data = Array.from({ length: 60 }).map((_, t) => {
      const base = 2000 * Math.pow(t + 1, -0.6) * scale;
      return {
        t,
        p10: base * 0.7,
        p50: base,
        p90: base * 1.4,
        well: base * (0.8 + Math.random() * 0.4)
      };
    });

    if (view === 'cum') {
      let cumP10 = 0, cumP50 = 0, cumP90 = 0, cumWell = 0;
      data = data.map(d => {
        cumP10 += d.p10;
        cumP50 += d.p50;
        cumP90 += d.p90;
        cumWell += d.well;
        return { t: d.t, p10: cumP10, p50: cumP50, p90: cumP90, well: cumWell };
      });
    }

    // Filter for Log-Log to avoid log(0)
    if (view === 'log') {
      return data.filter(d => d.t > 0 && d.p10 > 0);
    }

    return data;
  }, [normBasis, view]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
      {/* Sidebar Controls */}
      <div className="lg:col-span-3 space-y-4">
        <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-6">
              <Maximize2 size={16} className="text-indigo-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Rate Normalization</h5>
           </div>
           <div className="space-y-3">
              {[
                { id: 'none', label: 'Raw Rates', icon: Activity },
                { id: 'lateral', label: 'By Lat. Length', icon: Layers },
                { id: 'proppant', label: 'By Prop. Mass', icon: BoxSelect }
              ].map(b => (
                <button 
                  key={b.id}
                  onClick={() => setNormBasis(b.id as any)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                    normBasis === b.id ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-white/5 border-transparent text-slate-500 hover:text-slate-300"
                  )}
                >
                   <div className="flex items-center gap-3">
                      <b.icon size={14} />
                      <span className="text-[10px] font-black uppercase tracking-tight">{b.label}</span>
                   </div>
                   {normBasis === b.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                </button>
              ))}
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-indigo-950/40 to-black border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <History size={18} className="text-indigo-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Vintage Analysis</h5>
           </div>
           <div className="space-y-4">
               {[
                 { label: '2021 Vintage', color: 'bg-emerald-500', count: 42 },
                 { label: '2022 Vintage', color: 'bg-cyan-500', count: 65 },
                 { label: '2023 Vintage', color: 'bg-indigo-500', count: 12 }
               ].map(v => (
                 <VintageItem 
                   key={v.label}
                   label={v.label} 
                   color={v.color} 
                   count={v.count} 
                   active={selectedVintages.includes(v.label)}
                   onClick={() => {
                     setSelectedVintages(prev => 
                       prev.includes(v.label) ? prev.filter(x => x !== v.label) : [...prev, v.label]
                     );
                   }}
                 />
               ))}
            </div>
        </div>

        <div className="glass-card rounded-2xl p-6 bg-white/5 border-white/10">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-black text-slate-500 uppercase italic">Aggregation Mode</span>
              <Columns size={12} className="text-slate-700" />
           </div>
           <h4 className="text-xs font-black text-white uppercase italic">Probabilistic (P10/50/90)</h4>
        </div>
      </div>

      {/* Main Plot Area */}
      <div className="lg:col-span-9 space-y-6">
         <div className="glass-card rounded-3xl p-12 border-white/5 bg-[#050710] h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Probabilistic <span className="text-indigo-500">Type Curves</span></h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Standardized Production Aggregation & Benchmarking</p>
               </div>
               
               <div className="flex bg-white/5 p-1.5 rounded-3xl border border-white/10">
                  {[
                    { id: 'rate', label: 'Rate' },
                    { id: 'cum', label: 'Cum' },
                    { id: 'log', label: 'Log-Log' }
                  ].map(v => (
                    <button 
                      key={v.id}
                      onClick={() => setView(v.id as any)}
                      className={cn(
                        "px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                        view === v.id ? "bg-indigo-500 text-white shadow-lg" : "text-slate-500 hover:text-white"
                      )}
                    >
                      {v.label}
                    </button>
                  ))}
               </div>
            </div>

            <div className="grow">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={typeCurveData}>
                     <defs>
                        <linearGradient id="envelopeGradient" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                           <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                     <XAxis 
                        dataKey="t" 
                        scale={view === 'log' ? 'log' : 'auto'} 
                        domain={view === 'log' ? [1, 60] : [0, 60]}
                        stroke="#475569" fontSize={10} axisLine={false} tickLine={false} 
                        label={{ value: 'Months On Production', position: 'insideBottom', offset: -10, fontSize: 9, fill: '#475569', fontWeight: 'bold' }} 
                      />
                      <YAxis 
                        scale={view === 'log' ? 'log' : 'auto'} 
                        domain={['auto', 'auto']}
                        stroke="#475569" fontSize={10} axisLine={false} tickLine={false} 
                        label={{ value: view === 'cum' ? 'Cumulative (Mbbl)' : 'Rate (bopd)', angle: -90, position: 'insideLeft', fontSize: 9, fill: '#475569', fontWeight: 'bold' }}
                      />
                      <Tooltip 
                         contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff' }}
                         cursor={{ stroke: '#6366f120', strokeWidth: 50 }}
                      />
                      <Area type="monotone" dataKey="p10" stroke="none" fill="url(#envelopeGradient)" />
                      <Area type="monotone" dataKey="p90" stroke="none" fill="transparent" />
                      
                      <Line type="monotone" dataKey="p50" stroke="#6366f1" strokeWidth={4} dot={false} strokeDasharray={view === 'log' ? "" : "5 5"} />
                      <Line type="monotone" dataKey="p10" stroke="#6366f130" strokeWidth={1} dot={false} />
                      <Line type="monotone" dataKey="p90" stroke="#6366f130" strokeWidth={1} dot={false} />
                      
                      {/* Representative Test Well */}
                      <Line type="monotone" dataKey="well" stroke="#fff" strokeWidth={2} dot={false} strokeOpacity={0.8} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>

            <div className="mt-12 flex justify-between items-center bg-black/40 p-8 rounded-3xl border border-white/5 font-bold italic">
               <div className="flex gap-10">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-1 bg-indigo-500 rounded-full" />
                     <span className="text-[10px] text-white uppercase tracking-widest">P50 Median Curve</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-4 bg-indigo-500/10 rounded-sm" />
                     <span className="text-[10px] text-slate-500 uppercase tracking-widest">P10-P90 Envelope</span>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  <span className="text-[10px] text-white uppercase tracking-widest">Target Well Profile</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function VintageItem({ label, color, count, active, onClick }: { label: string, color: string, count: number, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer hover:bg-white/[0.02]",
        active ? "border-indigo-500/40 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.05)]" : "border-white/5"
      )}
    >
       <div className="flex items-center gap-3">
          <div className={cn("w-2 h-8 rounded-full", color)} />
          <div>
            <span className="text-[10px] font-black text-white uppercase tracking-tight block">{label}</span>
            <span className="text-[10px] text-slate-600 font-bold uppercase">{count} Wells Grouped</span>
          </div>
       </div>
       <button className="p-2 text-slate-700 hover:text-white transition-colors">
          <Target size={14} />
       </button>
    </div>
  );
}
