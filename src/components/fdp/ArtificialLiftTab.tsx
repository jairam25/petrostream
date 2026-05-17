import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Settings2, 
  Activity, 
  Wind, 
  Droplets, 
  TrendingUp,
  ArrowRightCircle,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Waves,
  RefreshCw,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface LiftMethod {
  name: string;
  score: number;
  bestFor: string;
  limits: string;
  icon: React.ReactNode;
}

export function ArtificialLiftTab() {
  const [params, setParams] = useState({
    pressure: 2500,
    depth: 8500,
    rate: 1500,
    gor: 800,
    waterCut: 40,
    viscosity: 5,
    deviation: 20
  });

  const [activeLift, setActiveLift] = useState<string>("ESP (Electrical Submersible)");
  const [isSimulating, setIsSimulating] = useState(false);
  const [showPlot, setShowPlot] = useState(false);

  const handleSelectLift = (name: string) => {
    setIsSimulating(true);
    setActiveLift(name);
    setTimeout(() => setIsSimulating(false), 1500);
  };

  const plotData = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      depth: i * 500,
      pressure: 3000 - (i * 120) - (Math.random() * 50),
      gradient: 0.433 + (Math.random() * 0.05)
    }));
  }, [activeLift]);

  const rankings: LiftMethod[] = useMemo(() => {
    const list: LiftMethod[] = [
      { 
        name: "ESP (Electrical Submersible)", 
        score: params.rate > 1000 && params.viscosity < 20 ? 95 : 60,
        bestFor: "High volume (200-30,000 bpd), Deep wells",
        limits: "High temperature, GOR > 400",
        icon: <Zap className="text-yellow-400" /> 
      },
      { 
        name: "Gas Lift", 
        score: params.gor > 500 && params.deviation > 15 ? 90 : 50,
        bestFor: "Deviated wells, High GOR, Offshore",
        limits: "Low reservoir pressure",
        icon: <Wind className="text-cyan-400" /> 
      },
      { 
        name: "Sucker Rod Pump (SRP)", 
        score: params.rate < 2000 && params.depth < 8000 ? 85 : 40,
        bestFor: "Low rate, Shallow-Medium onshore",
        limits: "Highly deviated wells, High GOR",
        icon: <Activity className="text-emerald-400" /> 
      },
      { 
        name: "PCP (Progressive Cavity)", 
        score: params.viscosity > 50 ? 98 : 30,
        bestFor: "Heavy oil, Sand production",
        limits: "Temperature, Depth > 6000ft",
        icon: <Droplets className="text-blue-400" /> 
      }
    ];
    return list.sort((a, b) => b.score - a.score);
  }, [params]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 relative">
      {/* Parameters */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Settings2 size={16} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Wellbore Environment</h4>
           </div>
           
           <div className="space-y-6">
              <InputWithSlider label="Flow Rate" value={params.rate} min={100} max={10000} step={100} unit="bpd" onChange={(v) => setParams({...params, rate: v})} />
              <InputWithSlider label="Well Depth" value={params.depth} min={1000} max={15000} step={100} unit="ft" onChange={(v) => setParams({...params, depth: v})} />
              <InputWithSlider label="Gas-Oil Ratio" value={params.gor} min={0} max={3000} step={50} unit="scf/stb" onChange={(v) => setParams({...params, gor: v})} />
              <InputWithSlider label="Water Cut" value={params.waterCut} min={0} max={100} step={1} unit="%" onChange={(v) => setParams({...params, waterCut: v})} />
              <InputWithSlider label="Deviation" value={params.deviation} min={0} max={90} step={5} unit="deg" onChange={(v) => setParams({...params, deviation: v})} />
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-cyan-900/40 to-black border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <Cpu size={18} className="text-cyan-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">AI Scoring Engine</h5>
           </div>
           <p className="text-[10px] text-slate-500 italic leading-relaxed">
              Scoring based on multi-criteria decision analysis (MCDA) weighing efficiency, OPEX, and reliability.
           </p>
        </div>
      </div>

      {/* Rankings */}
      <div className="lg:col-span-9 space-y-8">
        <div className="flex items-center justify-between">
           <div>
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Artificial Lift <span className="text-cyan-500">Screening</span></h3>
              <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Optimal solution ranking based on technical feasibility</p>
           </div>
        </div>

        <div className="space-y-4">
           {rankings.map((method, idx) => (
              <motion.div 
                 key={method.name}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: idx * 0.1 }}
                 onClick={() => handleSelectLift(method.name)}
                 className={cn(
                    "glass-card rounded-2xl p-8 border-white/5 transition-all flex flex-col md:flex-row items-center justify-between gap-8 group cursor-pointer relative overflow-hidden",
                    activeLift === method.name ? "bg-cyan-500/10 ring-1 ring-cyan-500/50" : "bg-black/40 hover:bg-white/[0.03]"
                 )}
              >
                 {activeLift === method.name && isSimulating && (
                    <motion.div 
                       layoutId="sim-bar"
                       className="absolute bottom-0 left-0 h-1 bg-cyan-500 w-full animate-progress"
                    />
                 )}
                 <div className="flex items-center gap-6">
                    <div className={cn(
                       "h-14 w-14 rounded-full flex items-center justify-center text-2xl border transition-all",
                       activeLift === method.name ? "bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]" : "bg-white/5 border-white/10"
                    )}>
                       {method.icon}
                    </div>
                    <div>
                       <div className="flex items-center gap-3 mb-1">
                          <h4 className={cn("text-xl font-black uppercase italic tracking-tighter", activeLift === method.name ? "text-white" : "text-slate-400")}>{method.name}</h4>
                          {idx === 0 && <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest border border-cyan-500/30">Primary Recommendation</span>}
                       </div>
                       <div className="flex gap-4">
                          <div className="flex items-center gap-1.5">
                             <CheckCircle2 size={12} className="text-emerald-500" />
                             <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{method.bestFor}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                             <AlertCircle size={12} className="text-red-500" />
                             <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{method.limits}</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-8">
                    <div className="text-right">
                       <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest block mb-1">Feasibility Score</span>
                       <span className={cn(
                          "text-3xl font-black italic tracking-tighter",
                          method.score > 80 ? "text-emerald-400" : "text-amber-400"
                       )}>{method.score}%</span>
                    </div>
                    {activeLift === method.name && isSimulating ? (
                       <RefreshCw className="text-cyan-400 animate-spin" size={32} />
                    ) : (
                       <ArrowRightCircle className={cn("transition-all", activeLift === method.name ? "text-cyan-400" : "text-slate-700 group-hover:text-white group-hover:translate-x-2")} size={32} />
                    )}
                 </div>
              </motion.div>
           ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 space-y-8">
              <div className="flex items-center gap-3">
                 <Waves size={20} className="text-blue-500" />
                 <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Sizing Calculator: {activeLift.split(' ')[0]}</h4>
              </div>
              <div className="space-y-6">
                 <InputWithSlider label="Total Dynamic Head (TDH)" value={8200} min={1000} max={15000} step={100} unit="ft" onChange={() => {}} />
                 <InputWithSlider label="Head per Stage" value={45} min={10} max={100} step={1} unit="ft/stg" onChange={() => {}} />
                 
                 <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Required Stages</span>
                    <span className="text-2xl font-black text-cyan-400 italic">183 Stages</span>
                 </div>
              </div>
           </div>

           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 space-y-8">
              <div className="flex items-center gap-3">
                 <Activity size={20} className="text-purple-500" />
                 <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Design Analysis</h4>
              </div>
              <div className="space-y-6">
                 <InputWithSlider label="Injn. Pressure" value={1200} min={500} max={3000} step={50} unit="psi" onChange={() => {}} />
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                       <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Injn. Depth</p>
                       <p className="text-lg font-black text-white">7,450 ft</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                       <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Valve Count</p>
                       <p className="text-lg font-black text-white">5 Valves</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => setShowPlot(true)}
                    className="w-full py-4 bg-purple-500 text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-purple-400 transition-all active:scale-95"
                 >
                    Plot Design Curve
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Design Curve Modal Overlay */}
      <AnimatePresence>
        {showPlot && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-4xl glass-card rounded-3xl p-12 bg-[#05070a] border-white/10 relative shadow-2xl"
            >
              <button 
                onClick={() => setShowPlot(false)}
                className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-purple-400" size={20} />
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Design Visualization</span>
                </div>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                  {activeLift.split(' ')[0]} <span className="text-purple-500">Performance Curve</span>
                </h3>
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={plotData}>
                    <defs>
                      <linearGradient id="colorCurve" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                    <XAxis dataKey="depth" stroke="#475569" fontSize={10} axisLine={false} label={{ value: 'Depth (ft)', position: 'insideBottomRight', offset: -10, fontSize: 10, fill: '#475569' }} />
                    <YAxis stroke="#475569" fontSize={10} axisLine={false} label={{ value: 'Pressure (PSI)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#475569' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="pressure" stroke="#a855f7" fillOpacity={1} fill="url(#colorCurve)" strokeWidth={3} />
                    <Line type="monotone" dataKey="gradient" stroke="#22d3ee" strokeWidth={2} dot={false} yAxisId="right" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setShowPlot(false)}
                  className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Close Analysis
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultBox({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
       <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">{label}</span>
       <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white italic tracking-tighter uppercase">{value}</span>
          <span className="text-[10px] font-bold text-slate-600 uppercase">{unit}</span>
       </div>
    </div>
  );
}
