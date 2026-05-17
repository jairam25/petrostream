import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Waves, 
  Settings2, 
  Activity, 
  Wind, 
  Target, 
  TrendingUp,
  ArrowRightCircle,
  Zap,
  Droplets,
  ZapOff,
  Filter,
  BarChart3,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculateVRR, calculateHallPlotPoint } from '../../lib/reservoir';
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
  ReferenceLine
} from 'recharts';

export function InjectionDesignTab() {
  const [params, setParams] = useState({
    injRate: 8000,
    prodRate: 7500,
    fo: 1.25,
    pRes: 2200,
    pInj: 3500,
    fractureGrad: 0.75, // psi/ft
    depth: 8500,
    scheme: 'Waterflood'
  });

  const [isDownloading, setIsDownloading] = useState(false);

  const injectionStats = useMemo(() => {
    const vrr = calculateVRR(params.injRate, params.prodRate, params.fo, 0, 0);
    const fracPressure = params.fractureGrad * params.depth;
    const isSafe = params.pInj < fracPressure;
    
    // Mock Hall Plot Data
    const hallData = Array.from({ length: 20 }).map((_, i) => ({
        day: i * 30,
        cumInj: i * 150,
        hallValue: calculateHallPlotPoint(i * 450, params.pInj, params.pRes, 30)
    }));

    return { vrr, fracPressure, isSafe, hallData };
  }, [params]);

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      try {
        const reportContent = `INJECTION PERFORMANCE FORECAST\n============================\nScheme: ${params.scheme}\nInjection Rate: ${params.injRate} bpd\nVRR Factor: ${injectionStats.vrr.toFixed(2)}\nFracture Pressure Limit: ${injectionStats.fracPressure.toFixed(0)} psi\nSafety Status: ${injectionStats.isSafe ? "SAFE" : "DANGER"}\n\nHALL PLOT DATA OVERVIEW:\n${injectionStats.hallData.slice(0, 10).map(d => `Day ${d.day}: Cum Inj ${d.cumInj} MB, Hall Integral ${d.hallValue.toFixed(2)}`).join('\n')}\n`;
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Injection_Performance_Forecast.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Download failed:", err);
      } finally {
        setIsDownloading(false);
      }
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Parameters */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Settings2 size={16} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Injection Config</h4>
           </div>
           
           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Injection Type</label>
                <select 
                  value={params.scheme}
                  onChange={(e) => setParams({...params, scheme: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-[10px] text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                >
                  <option value="Waterflood">Waterflood</option>
                  <option value="Gas Injection">Gas Injection</option>
                  <option value="WAG">WAG (Water Alt. Gas)</option>
                </select>
              </div>

              <InputWithSlider label="Total Injection" value={params.injRate} min={100} max={25000} step={500} unit="bpd" onChange={(v) => setParams({...params, injRate: v})} />
              <InputWithSlider label="Wellhead Pressure" value={params.pInj} min={1000} max={6000} step={100} unit="psi" onChange={(v) => setParams({...params, pInj: v})} />
              <InputWithSlider label="Fracture Gradient" value={params.fractureGrad} min={0.5} max={1.0} step={0.01} unit="psi/ft" onChange={(v) => setParams({...params, fractureGrad: v})} />
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-indigo-900/40 to-black border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <Filter size={18} className="text-indigo-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Water Treatment</h5>
           </div>
           <div className="space-y-3">
              <InjectionCheck label="SRB Control" active />
              <InjectionCheck label="Oxygen Scavenging" active />
              <InjectionCheck label="Fine Filtration" active />
           </div>
        </div>
      </div>

      {/* Analysis Content */}
      <div className="lg:col-span-9 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <StatusBox label="VRR Factor" value={injectionStats.vrr.toFixed(2)} unit="ratio" icon={<Activity className="text-cyan-500" />} sub={injectionStats.vrr >= 1 ? "Pressure Maintains" : "Pressure Depleting"} />
           <StatusBox label="Frac Pressure" value={injectionStats.fracPressure.toFixed(0)} unit="psi" icon={<Zap className="text-amber-500" />} sub="Bottomhole Limit" />
           <StatusBox label="Injn. Status" value={injectionStats.isSafe ? "SAFE" : "DANGER"} unit="" icon={<ShieldAlert className={injectionStats.isSafe ? "text-emerald-500" : "text-red-500"} />} sub={injectionStats.isSafe ? "Below Frac Limit" : "Risk of Fracking"} />
        </div>

        <div className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] relative overflow-hidden">
           <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                 <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Injectivity <span className="text-indigo-500">Monitoring</span></h3>
                 <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Hall Plot: Cumulative Pressure-Time vs Cumulative Injection</p>
              </div>
           </div>

           <div className="h-[400px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={injectionStats.hallData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                    <XAxis dataKey="cumInj" stroke="#475569" fontSize={10} axisLine={false} label={{ value: 'Cum. Injection (MB)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#475569' }} />
                    <YAxis stroke="#475569" fontSize={10} axisLine={false} label={{ value: 'Hall Integral', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#475569' }} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }}
                    />
                    <Line type="monotone" dataKey="hallValue" stroke="#6366f1" strokeWidth={3} dot={false} />
                    <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
                 </LineChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 space-y-8">
              <div className="flex items-center gap-3">
                 <Target size={20} className="text-emerald-500" />
                 <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Well Performance</h4>
              </div>
              <div className="space-y-6">
                 <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Injectivity Index</span>
                    <span className="text-xl font-black text-white italic">24.5 bpd/psi</span>
                 </div>
                 <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Injn. Wells Needed</span>
                    <span className="text-xl font-black text-white italic">5 Wells</span>
                 </div>
                 <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">WAG Ratio (Opt)</span>
                    <span className="text-xl font-black text-white italic">1.2 : 1</span>
                 </div>
              </div>
           </div>

           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 flex flex-col justify-between">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <BarChart3 size={20} className="text-blue-500" />
                    <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Simulation Integration</h4>
                 </div>
                 <p className="text-[11px] text-slate-500 leading-relaxed italic">
                    Hall Plot slope analysis provides real-time detection of well plugging (slope increase) or out-of-zone injection/fracturing (slope decrease). This module connects to your reservoir simulation output to refine injection scheme design.
                 </p>
              </div>
              <button 
                 onClick={handleDownload}
                 disabled={isDownloading}
                 className={cn(
                    "w-full py-4 rounded-2xl border transition-all flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest",
                    isDownloading ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-white/5 border-white/5 text-white hover:bg-white/10 active:scale-95"
                 )}
              >
                 {isDownloading ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                 {isDownloading ? 'Generating...' : 'Download Performance Forecast'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function StatusBox({ label, value, unit, icon, sub }: { label: string, value: string, unit: string, icon: React.ReactNode, sub: string }) {
  return (
    <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40">
       <div className="flex items-center gap-3 mb-4">
          {icon}
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
       </div>
       <div className="flex items-baseline gap-1 mb-1">
          <span className="text-3xl font-black text-white italic tracking-tighter uppercase">{value}</span>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{unit}</span>
       </div>
       <p className="text-[11px] text-slate-600 font-mono uppercase tracking-widest font-black italic">{sub}</p>
    </div>
  );
}

function InjectionCheck({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
       <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
          active ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500"
       )}>{active ? 'Active' : 'N/A'}</div>
    </div>
  );
}

function ShieldAlert(props: any) {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
