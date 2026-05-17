import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Settings2, 
  Settings, 
  Zap,
  ArrowRightCircle,
  Truck,
  HardHat,
  Timer,
  Factory,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { generateDrillingSchedule } from '../../lib/reservoir';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

export function DrillingScheduleTab() {
  const [params, setParams] = useState({
    numRigs: 2,
    daysPerWell: 18,
    totalWells: 24,
    wellType: 'Deviated',
    dayRate: 45000,
    completionTime: 10 // days
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStrategy, setActiveStrategy] = useState('Batch Drilling');

  const scheduleResults = useMemo(() => {
    const schedule = generateDrillingSchedule(params.numRigs, params.daysPerWell, params.totalWells, new Date());
    const totalDays = Math.ceil((params.totalWells * params.daysPerWell) / params.numRigs);
    const totalCost = (params.totalWells * params.daysPerWell * params.dayRate) + (params.totalWells * 2.5e6); // Rig cost + Fixed D&C cost
    
    // Aggregated monthly online count for chart
    const onlineMonthly = Array.from({ length: 12 }).map((_, i) => ({
        month: i + 1,
        wells: Math.min(params.totalWells, Math.floor((i + 1) * 30 * params.numRigs / params.daysPerWell)),
        cost: (Math.min(params.totalWells, Math.floor((i + 1) * 30 * params.numRigs / params.daysPerWell)) * 3.2e6) / 1e6
    }));

    return { schedule, totalDays, totalCost, onlineMonthly };
  }, [params]);

  const handleExportReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const reportContent = `DRILLING OPTIMIZATION REPORT\n============================\nStrategy: ${activeStrategy}\nActive Rigs: ${params.numRigs}\nTotal Program: ${params.totalWells} Wells\nEst. D&C Cost: $${(scheduleResults.totalCost / 1e6).toFixed(1)}M\nPeak Duration: ${scheduleResults.totalDays} Days\n\nSCHEDULE OVERVIEW:\n${scheduleResults.schedule.slice(0, 20).map(w => `Well ${w.wellId}: Rig ${w.rigId} (${w.start.toLocaleDateString()} - ${w.end.toLocaleDateString()})`).join('\n')}\n`;
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Drilling_Optimization_Report.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Sidebar Controls */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Settings2 size={16} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Efficiency Parameters</h4>
           </div>
           
           <div className="space-y-8">
              <InputWithSlider label="Active Rigs" value={params.numRigs} min={1} max={10} step={1} unit="Units" onChange={(v) => setParams({...params, numRigs: v})} />
              <InputWithSlider label="Cycle Time (D&C)" value={params.daysPerWell} min={5} max={60} step={1} unit="Days" onChange={(v) => setParams({...params, daysPerWell: v})} />
              <InputWithSlider label="Total Program" value={params.totalWells} min={1} max={100} step={1} unit="Wells" onChange={(v) => setParams({...params, totalWells: v})} />
              <InputWithSlider label="Rig Dayrate" value={params.dayRate} min={5000} max={200000} step={5000} unit="$" onChange={(v) => setParams({...params, dayRate: v})} />
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-amber-900/40 to-black border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <Truck size={18} className="text-amber-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Logistics Strategy</h5>
           </div>
           <div className="space-y-3">
              {['Batch Drilling', 'Pad Side-by-Side', 'Sequential Single'].map(s => (
                 <button 
                    key={s} 
                    onClick={() => setActiveStrategy(s)}
                    className={cn(
                      "w-full py-4 px-6 border rounded-2xl text-[10px] font-bold transition-all text-left flex items-center justify-between",
                      activeStrategy === s ? "bg-amber-500 border-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-white/5 border-white/5 text-slate-500 hover:text-white"
                    )}
                 >
                    {s}
                    {activeStrategy === s && <CheckCircle2 size={12} />}
                 </button>
              ))}
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-9 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <SummaryBox label="Project Duration" value={scheduleResults.totalDays.toString()} unit="Days" icon={<Timer className="text-cyan-500" />} />
           <SummaryBox label="Peak Online Capacity" value={params.numRigs.toString()} unit="Rigs" icon={<Factory className="text-amber-500" />} />
           <SummaryBox label="Est. D&C Cost" value={`$${(scheduleResults.totalCost / 1e6).toFixed(1)}`} unit="M" icon={<Zap className="text-emerald-500" />} />
           <SummaryBox label="Readiness" value="94%" unit="" icon={<CheckCircle2 className="text-purple-500" />} />
        </div>

        <div className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] relative overflow-hidden">
           <div className="flex justify-between items-start mb-10 relative z-10">
              <div>
                 <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Production <span className="text-amber-500">Ramp-up</span> Profile</h3>
                 <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Aggregated Well Online Projection (Cumulative)</p>
              </div>
           </div>

           <div className="h-[350px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={scheduleResults.onlineMonthly}>
                    <defs>
                       <linearGradient id="colorWells" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                    <XAxis dataKey="month" stroke="#475569" fontSize={10} axisLine={false} label={{ value: 'Month', position: 'insideBottomRight', offset: -10, fontSize: 10, fill: '#475569' }} />
                    <YAxis stroke="#475569" fontSize={10} axisLine={false} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="wells" stroke="#f59e0b" fillOpacity={1} fill="url(#colorWells)" strokeWidth={3} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                 <Calendar className="text-indigo-500" size={20} />
                 <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Drilling Sequence (Rig 01 and 02)</h4>
              </div>
              <button className="text-[10px] font-black text-cyan-400 uppercase tracking-widest italic border-b border-cyan-400/30 active:scale-95 transition-all">View Rig Schedule</button>
           </div>
           
           <div className="space-y-4">
              {scheduleResults.schedule.slice(0, 10).map((well, idx) => (
                 <div key={idx} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/[0.08] transition-all">
                    <div className="flex items-center gap-6">
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">W{well.wellId.toString().padStart(2, '0')}</span>
                       <div>
                          <p className="text-[11px] font-black text-white uppercase tracking-wider">Rig {well.rigId.toString().padStart(2, '0')} Slot</p>
                          <p className="text-[11px] text-slate-500 font-mono">{well.start.toLocaleDateString()} — {well.end.toLocaleDateString()}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: idx < 3 ? '100%' : idx === 3 ? '40%' : '0%' }}
                            className={cn(
                              "h-full rounded-full",
                              idx < 3 ? "bg-emerald-500" : "bg-cyan-500"
                            )}
                          />
                       </div>
                       <span className={cn(
                         "text-[11px] font-black uppercase tracking-widest",
                         idx < 3 ? "text-emerald-500" : idx === 3 ? "text-cyan-500" : "text-slate-600"
                       )}>
                         {idx < 3 ? "Complete" : idx === 3 ? "Active" : "Planned"}
                       </span>
                    </div>
                 </div>
              ))}
              <div className="text-center pt-4">
                 <p className="text-[11px] text-slate-500 uppercase tracking-widest font-black italic">... + {params.totalWells - 10} additional wells in program ...</p>
              </div>
           </div>
        </div>

        <div className="p-8 border border-white/5 bg-white/5 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <AlertTriangle size={28} />
                </div>
                <div>
                    <h5 className="text-[11px] font-black text-white uppercase tracking-wider mb-1">Schedule Delay Sensitivity</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed max-w-md italic">
                        Every 5-day rig delay results in approximately $1.2M of deferred NPV and $450k in idle rig costs (if not de-mobilized).
                    </p>
                </div>
            </div>
            <button 
               onClick={handleExportReport}
               disabled={isGenerating}
               className={cn(
                 "px-8 py-4 rounded-2xl border transition-all flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest",
                 isGenerating ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-white/5 border-white/5 text-white hover:bg-white/10 active:scale-95"
               )}
            >
                {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <HardHat size={14} />}
                {isGenerating ? 'Generating...' : 'Optimization Report'}
            </button>
        </div>
      </div>
    </div>
  );
}

function SummaryBox({ label, value, unit, icon }: { label: string, value: string, unit: string, icon: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40">
       <div className="flex items-center gap-3 mb-4">
          {icon}
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
       </div>
       <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-white italic tracking-tighter uppercase">{value}</span>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{unit}</span>
       </div>
    </div>
  );
}
