import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell
} from 'recharts';
import { 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  Target, 
  Settings2,
  RefreshCcw,
  Zap,
  Activity,
  ArrowRightCircle,
  Box,
  ClipboardList,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';

interface ReservesItem {
  category: string;
  p1: number;
  p2: number;
  p3: number;
}

export function ReservesReportingTab() {
  const [activeView, setActiveView] = useState<'reconciliation' | 'metrics'>('reconciliation');
  
  // Reserves Data (MSTB)
  const [reserves, setReserves] = useState({
    beginning: 5000,
    production: 450,
    extensions: 200,
    discoveries: 150,
    improvedRecovery: 50,
    revisions: 80
  });

  const summaryData = useMemo(() => {
    const additions = reserves.extensions + reserves.discoveries + reserves.improvedRecovery + reserves.revisions;
    const ending = reserves.beginning - reserves.production + additions;
    
    // Probabilistic Rollup (Simplified)
    return {
      beginning: reserves.beginning,
      production: reserves.production,
      additions,
      ending,
      rrr: additions / reserves.production,
      rli: ending / reserves.production,
      fd: 12.5e6 / (additions * 1000) // Assumes $12.5M capex for additions
    };
  }, [reserves]);

  const chartData = [
    { name: 'Beginning', value: reserves.beginning, color: '#3b82f6' },
    { name: 'Prod', value: -reserves.production, color: '#f43f5e' },
    { name: 'Extensions', value: reserves.extensions, color: '#10b981' },
    { name: 'Discoveries', value: reserves.discoveries, color: '#06b6d4' },
    { name: 'Revisions', value: reserves.revisions, color: '#f59e0b' },
    { name: 'Ending', value: summaryData.ending, color: '#8b5cf6' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Sidebar Controls */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Settings2 size={16} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Reserves Adjustment</h4>
           </div>
           
           <div className="space-y-6">
              <InputWithSlider label="Beginning (MSTB)" value={reserves.beginning} min={1000} max={10000} step={100} unit="K" onChange={(v) => setReserves({...reserves, beginning: v})} />
              <InputWithSlider label="Production" value={reserves.production} min={10} max={1000} step={10} unit="K" onChange={(v) => setReserves({...reserves, production: v})} />
              <InputWithSlider label="Discoveries" value={reserves.discoveries} min={0} max={500} step={10} unit="K" onChange={(v) => setReserves({...reserves, discoveries: v})} />
              <InputWithSlider label="Revisions" value={reserves.revisions} min={-200} max={500} step={10} unit="K" onChange={(v) => setReserves({...reserves, revisions: v})} />
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-emerald-900/40 to-black border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <ShieldCheck size={18} className="text-emerald-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Compliance Audit</h5>
           </div>
           <p className="text-[10px] text-slate-500 leading-relaxed italic mb-6">
              PRMS 2018 reporting standards require clear separation of discovered and undiscovered volumes.
           </p>
           <button className="w-full py-3 rounded-2xl bg-white/5 border border-white/5 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2">
              <ClipboardList size={14} /> Validate SEC Rules
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-9 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <StatusBox label="Ending Reserves" value={`${summaryData.ending.toFixed(0)}`} unit="MSTB" sub="Total Proved" icon={<Box className="text-cyan-500" />} />
           <StatusBox label="RRR Factor" value={`${(summaryData.rrr * 100).toFixed(0)}%`} unit="" sub="Replacement Ratio" icon={<TrendingUp className="text-emerald-500" />} />
           <StatusBox label="Reserves Life" value={`${summaryData.rli.toFixed(1)}`} unit="Yrs" sub="Current Life Index" icon={<Zap className="text-amber-500" />} />
           <StatusBox label="F&D Cost" value={`$${summaryData.fd.toFixed(2)}`} unit="/BOE" sub="Find & Dev" icon={<Target className="text-purple-500" />} />
        </div>

        <div className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] relative overflow-hidden">
           <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                 <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Reserves <span className="text-cyan-500">Reconciliation</span></h3>
                 <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Standard Year-Over-Year Movement Waterfall</p>
              </div>
           </div>

           <div className="h-[400px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={10} axisLine={false} tickFormatter={(v) => `${v}K`} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                       {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40">
           <div className="flex items-center gap-4 mb-8">
              <FileText className="text-indigo-500" size={20} />
              <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Inventory Summary Table (MSTB)</h4>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-white/5">
                       <th className="py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Reserves Category</th>
                       <th className="py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Proved (1P)</th>
                       <th className="py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Proved + Prob (2P)</th>
                       <th className="py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Proved + Prob + Poss (3P)</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    <ReportRow label="Beginning Balance" v1={reserves.beginning} v2={reserves.beginning * 1.5} v3={reserves.beginning * 2.2} />
                    <ReportRow label="Production" v1={-reserves.production} v2={-reserves.production} v3={-reserves.production} negative />
                    <ReportRow label="Extensions & Discoveries" v1={reserves.extensions + reserves.discoveries} v2={(reserves.extensions + reserves.discoveries) * 1.4} v3={(reserves.extensions + reserves.discoveries) * 2} />
                    <ReportRow label="Technical Revisions" v1={reserves.revisions} v2={reserves.revisions * 1.2} v3={reserves.revisions * 1.8} />
                    <tr className="bg-white/5 font-black text-white">
                       <td className="py-6 px-4 text-[10px] uppercase italic">Ending Reserves Balance</td>
                       <td className="py-6 px-4 text-right text-cyan-400">{summaryData.ending.toFixed(0)}</td>
                       <td className="py-6 px-4 text-right text-cyan-400">{(summaryData.ending * 1.6).toFixed(0)}</td>
                       <td className="py-6 px-4 text-right text-cyan-400">{(summaryData.ending * 2.4).toFixed(0)}</td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                    <Activity size={24} />
                 </div>
                 <div>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Unit Economics</span>
                    <span className="text-[11px] font-bold text-white">Project UTC: $18.40/BOE</span>
                 </div>
              </div>
              <ArrowRightCircle className="text-slate-700 group-hover:text-cyan-500 transition-all" />
           </div>

           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500">
                    <ExternalLink size={24} />
                 </div>
                 <div>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">External Report</span>
                    <span className="text-[11px] font-bold text-white">Export to SEC Form 10-K</span>
                 </div>
              </div>
              <ArrowRightCircle className="text-slate-700 group-hover:text-purple-500 transition-all" />
           </div>
        </div>
      </div>
    </div>
  );
}

function StatusBox({ label, value, unit, sub, icon }: { label: string, value: string, unit: string, sub: string, icon: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40">
       <div className="flex items-center gap-3 mb-4">
          {icon}
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
       </div>
       <div className="flex items-baseline gap-1 mb-1">
          <span className="text-2xl font-black text-white italic tracking-tighter uppercase">{value}</span>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{unit}</span>
       </div>
       <p className="text-[11px] text-slate-600 font-mono uppercase tracking-widest font-bold">{sub}</p>
    </div>
  );
}

function ReportRow({ label, v1, v2, v3, negative }: { label: string, v1: number, v2: number, v3: number, negative?: boolean }) {
  return (
    <tr className="hover:bg-white/[0.02] transition-all">
       <td className="py-4 text-[10px] text-slate-400 font-medium uppercase italic">{label}</td>
       <td className={cn("py-4 text-right text-[11px] font-mono", negative ? "text-red-500" : "text-white")}>{v1.toFixed(0)}</td>
       <td className={cn("py-4 text-right text-[11px] font-mono", negative ? "text-red-500" : "text-white")}>{v2.toFixed(0)}</td>
       <td className={cn("py-4 text-right text-[11px] font-mono", negative ? "text-red-500" : "text-white")}>{v3.toFixed(0)}</td>
    </tr>
  );
}
