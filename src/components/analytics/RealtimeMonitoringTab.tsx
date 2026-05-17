import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Activity, 
  Settings2, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  ShieldAlert,
  Zap,
  Pipette,
  Gauge,
  Thermometer,
  Waves,
  ZapOff,
  Bell,
  Waves as WavesIcon,
  RefreshCw
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';

export function RealtimeMonitoringTab() {
  const [activeSystem, setActiveSystem] = useState<'spc' | 'esp' | 'leak' | 'rod'>('spc');
  const [timestamp, setTimestamp] = useState(0);

  // Simulation loop
  useEffect(() => {
    const timer = setInterval(() => setTimestamp(t => t + 1), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
      {/* Sidebar - Monitoring Systems */}
      <div className="lg:col-span-3 space-y-4">
        {[
          { id: 'spc', label: 'SPC Control', desc: 'μ ± 3σ Thresholds', icon: Activity },
          { id: 'esp', label: 'ESP Health', desc: 'Predictive Failure', icon: Zap },
          { id: 'rod', label: 'Rod Pump AI', desc: 'Dynamometer Cards', icon: WavesIcon },
          { id: 'leak', label: 'Leak Detection', desc: 'Line Pack Balance', icon: ShieldAlert }
        ].map(sys => (
           <motion.div 
              key={sys.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSystem(sys.id as any)}
              className={cn(
                "glass-card rounded-2xl p-6 border-white/5 transition-all cursor-pointer shadow-sm relative overflow-hidden",
                activeSystem === sys.id ? "bg-red-500/10 ring-1 ring-red-500/50" : "bg-black/40 hover:bg-white/[0.02]"
              )}
           >
              {activeSystem === sys.id && (
                 <div className="absolute top-0 right-0 p-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
                 </div>
              )}
              <div className="flex items-center gap-4">
                 <div className={cn("p-3 rounded-2xl", activeSystem === sys.id ? "bg-red-500 text-white" : "bg-white/5 text-slate-500")}>
                    <sys.icon size={18} />
                 </div>
                 <div>
                    <h4 className={cn("text-xs font-black uppercase italic tracking-wider", activeSystem === sys.id ? "text-red-400" : "text-white")}>{sys.label}</h4>
                    <p className="text-[11px] text-slate-600 italic mt-0.5">{sys.desc}</p>
                 </div>
              </div>
           </motion.div>
        ))}

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-red-950/20 to-black border-red-500/10 mt-8">
           <div className="flex items-center gap-3 mb-6">
              <Bell size={18} className="text-red-500" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Active Alerts</h5>
           </div>
           <div className="space-y-4">
              <AlertMessage time="2M AGO" msg="Pressure Drop at Inlet A" severity="HIGH" />
              <AlertMessage time="14M AGO" msg="ESP Vib. Trending Up" severity="MED" />
           </div>
        </div>
      </div>

      {/* Monitoring View */}
      <div className="lg:col-span-9">
         <AnimatePresence mode="wait">
            {activeSystem === 'spc' && <SPCMonitoring key="spc" />}
            {activeSystem === 'esp' && <ESPFailureMonitor key="esp" />}
            {activeSystem === 'rod' && <RodPumpDetector key="rod" />}
            {activeSystem === 'leak' && <LeakDetectionModule key="leak" />}
         </AnimatePresence>
      </div>
    </div>
  );
}

function SPCMonitoring() {
  const data = Array.from({ length: 40 }).map((_, i) => ({
    t: i,
    val: 800 + Math.sin(i * 0.5) * 20 + (i === 32 ? 150 : (Math.random() * 30 - 15)),
    ucl: 860,
    lcl: 740,
    target: 800
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Statistical Process <span className="text-red-500">Control</span></h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Real-time μ ± 3σ Anomaly Detection Pipeline</p>
          </div>
          <div className="flex gap-4">
             <div className="p-6 bg-red-500/10 rounded-2xl border border-red-500/20 text-center animate-pulse">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-1 underline">OOC Trigger</span>
                <span className="text-2xl font-black text-white italic font-mono uppercase">Out of Ctrl</span>
             </div>
          </div>
       </div>

       <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
             <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis dataKey="t" hide />
                <YAxis stroke="#475569" fontSize={10} domain={[700, 1000]} axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }}
                />
                <ReferenceLine y={860} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'UCL', fill: '#ef4444', fontSize: 8 }} />
                <ReferenceLine y={740} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'LCL', fill: '#ef4444', fontSize: 8 }} />
                <ReferenceLine y={800} stroke="#475569" strokeOpacity={0.2} label={{ position: 'right', value: 'Target', fill: '#475569', fontSize: 8 }} />
                
                <Line 
                  type="monotone" 
                  dataKey="val" 
                  stroke="#fff" 
                  strokeWidth={2} 
                  dot={(props) => {
                    if (props.payload.val > 860 || props.payload.val < 740) {
                      return <circle cx={props.cx} cy={props.cy} r={5} fill="#ef4444" />;
                    }
                    return null;
                  }} 
                />
             </LineChart>
          </ResponsiveContainer>
       </div>
    </motion.div>
  );
}

function ESPFailureMonitor() {
  const [scheduling, setScheduling] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  const handleSchedule = () => {
    setScheduling(true);
    setTimeout(() => {
      setScheduling(false);
      setScheduled(true);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="mb-12">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">ESP <span className="text-red-500">Predictive</span> Health</h3>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Motor vibration & Current Draw Trend Analysis</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
             <div className="p-10 bg-black/40 rounded-3xl border border-white/5 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-yellow-500/5 animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 italic">Next failure Probability</span>
                <span className="text-7xl font-black text-white italic tracking-tighter">72 <span className="text-2xl text-red-500 opacity-80">%</span></span>
                <p className="text-[10px] text-red-400 font-bold uppercase mt-6">Predicted Window: 12-14 Days</p>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <SensorMetric label="Vibration" val="4.2" unit="mm/s" status="HIGH" />
                <SensorMetric label="Motor Temp" val="185" unit="°F" status="OK" />
             </div>
          </div>

          <div className="glass-card rounded-3xl p-8 bg-white/5 flex flex-col justify-center gap-6">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic border-b border-white/10 pb-4">Classification Factors</h4>
             <FactorItem label="Current Instability" value={0.88} />
             <FactorItem label="Intake Press. Delta" value={0.45} />
             <FactorItem label="Runtime Hours" value={0.95} />
             <button 
               onClick={handleSchedule}
               disabled={scheduling || scheduled}
               className={cn(
                 "w-full mt-4 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border",
                 scheduled 
                   ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                   : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 active:scale-95"
               )}
             >
               {scheduling ? (
                  <div className="flex items-center justify-center gap-2">
                     <RefreshCw size={14} className="animate-spin" />
                     Scheduling...
                  </div>
               ) : scheduled ? (
                  <div className="flex items-center justify-center gap-2">
                     <CheckCircle2 size={14} />
                     Workover Scheduled
                  </div>
               ) : (
                  'Schedule Preventive Pull'
               )}
             </button>
          </div>
       </div>
    </motion.div>
  );
}

function RodPumpDetector() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="flex justify-between items-start mb-12">
          <div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Rod Pump <span className="text-indigo-400">AI</span></h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Automated Dynamometer Card Pattern Recognition (CNN)</p>
          </div>
          <div className="px-6 py-3 bg-indigo-500 rounded-2xl text-[11px] font-black text-black uppercase tracking-widest animate-pulse">Running Inference...</div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12 h-[350px]">
          <div className="glass-card bg-black rounded-2xl p-8 border border-white/10 flex items-center justify-center">
             {/* SIMULATED DYNAMOMETER CARD */}
             <div className="relative w-full h-full max-h-[250px]">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                   {/* Normal Card Outline */}
                   <path 
                     d="M 10 70 Q 10 30 50 30 Q 90 30 90 70 Q 90 80 50 80 Q 10 80 10 70" 
                     fill="none" 
                     stroke="#475569" 
                     strokeWidth="0.5" 
                     strokeDasharray="2 2"
                   />
                   {/* Detected card with gas interference */}
                   <path 
                     d="M 10 70 Q 10 30 50 30 Q 90 30 90 70 Q 95 85 50 85 L 15 85 Z" 
                     fill="rgba(99, 102, 241, 0.2)" 
                     stroke="#6366f1" 
                     strokeWidth="2"
                   />
                   <text x="20" y="20" fill="#6366f1" fontSize="5" fontWeight="bold" className="uppercase">Gas Interference Detected</text>
                </svg>
             </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-4 italic">CNN Classification Ranking</h4>
             <ClassificationBar label="Gas Interference" prob={0.92} color="bg-indigo-500" />
             <ClassificationBar label="Fluid Pound" prob={0.05} color="bg-slate-700" />
             <ClassificationBar label="Pump-Off" prob={0.02} color="bg-slate-800" />
             <ClassificationBar label="Standing Valve Leak" prob={0.01} color="bg-slate-900" />
          </div>
       </div>
    </motion.div>
  );
}

function LeakDetectionModule() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="flex justify-between items-start mb-12">
          <div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Pipeline <span className="text-emerald-500">Integrity</span> Alert</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Mass Balance & Line Pack Leak Detection (LDS)</p>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card bg-black/40 rounded-2xl p-8 border border-white/5 text-center">
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1 italic">Segment Inlet</span>
             <span className="text-3xl font-black text-white flex items-center justify-center gap-2">4,500 <span className="text-xs text-slate-500 font-normal">m3/d</span></span>
          </div>
          <div className="flex flex-col items-center justify-center p-8 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
             <Waves className="text-emerald-500 animate-pulse mb-2" size={32} />
             <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Balanced</span>
             <span className="text-[10px] text-slate-700 mt-1 uppercase font-bold italic">Delta: 0.1%</span>
          </div>
          <div className="glass-card bg-black/40 rounded-2xl p-8 border border-white/5 text-center">
             <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1 italic">Segment Outlet</span>
             <span className="text-3xl font-black text-white flex items-center justify-center gap-2">4,495 <span className="text-xs text-slate-500 font-normal">m3/d</span></span>
          </div>
       </div>
       
       <div className="mt-12 p-10 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-8">
          <div className="flex-1 space-y-4">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Detection Sensitivity OK</h4>
             <div className="flex justify-between items-baseline">
                <span className="text-[11px] text-slate-600 uppercase italic font-bold">Line Pack Estimator</span>
                <span className="text-[10px] text-white font-mono">12,450 m3</span>
             </div>
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '92%' }} />
             </div>
          </div>
          <div className="w-px h-16 bg-white/5" />
          <p className="text-[10px] text-slate-600 italic font-medium leading-relaxed max-w-[300px]">System compensates for temperature variations and compressibility using AGA-8 equations to ensure no false alarms during pack/unpack cycles.</p>
       </div>
    </motion.div>
  );
}

function SensorMetric({ label, val, unit, status }: { label: string, val: string, unit: string, status: string }) {
  return (
    <div className="p-4 bg-white/4 rounded-2xl flex flex-col items-center">
       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">{label}</span>
       <div className="flex items-baseline gap-1 mb-1">
          <span className="text-sm font-black text-white">{val}</span>
          <span className="text-[10px] text-slate-700 font-bold">{unit}</span>
       </div>
       <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full uppercase", status === 'HIGH' ? "bg-red-500 text-white" : "bg-emerald-500/10 text-emerald-500")}>{status}</span>
    </div>
  );
}

function FactorItem({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-1.5">
       <div className="flex justify-between items-baseline">
          <span className="text-[11px] font-black text-slate-600 uppercase italic tracking-tighter">{label}</span>
          <span className="text-[11px] font-black text-white italic">{(value * 100).toFixed(0)}%</span>
       </div>
       <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-red-400" style={{ width: `${value * 100}%` }} />
       </div>
    </div>
  );
}

function ClassificationBar({ label, prob, color }: { label: string, prob: number, color: string }) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight italic">
          <span className="text-white">{label}</span>
          <span className="text-slate-600">{(prob * 100).toFixed(0)}% Match</span>
       </div>
       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${prob * 100}%` }}
            className={cn("h-full", color)} 
          />
       </div>
    </div>
  );
}

function AlertMessage({ time, msg, severity }: { time: string, msg: string, severity: 'HIGH' | 'MED' }) {
  return (
    <div className="p-4 bg-black/40 rounded-2xl border-l-2 border-red-500 flex items-start gap-4">
       <div className="text-[10px] font-black text-slate-700 leading-none mt-1">{time}</div>
       <div>
          <h5 className="text-[10px] font-black text-white uppercase italic">{msg}</h5>
          <span className={cn("text-[10px] font-black uppercase mt-1 inline-block", severity === 'HIGH' ? "text-red-500" : "text-amber-500")}>{severity} PRIORITY</span>
       </div>
    </div>
  );
}
