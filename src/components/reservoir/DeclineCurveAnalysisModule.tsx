import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingDown, 
  BarChart2, 
  Target, 
  Search, 
  Zap, 
  Settings2,
  LineChart as LineChartIcon,
  Timer
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { 
  calculateArpsHyperbolic,
  calculateDuongRate,
  calculateSEPD,
  calculateEUR
} from '../../lib/reservoir';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export function DeclineCurveAnalysisModule() {
  const [activePhase, setActivePhase] = useState<1 | 2 | 3>(1);
  const [inp, setInp] = useState({
    qi: 800,
    di: 0.1, // nominal
    b: 0.5,
    t_years: 15,
    q_limit: 10,
    // Modern DCA
    duong_a: 1.1,
    duong_m: 1.5,
    sepd_tau: 1000,
    sepd_n: 0.5
  });

  const chartData = useMemo(() => {
    const data = [];
    const steps = 60;
    const daysInMonth = 30.4375;
    
    for (let i = 0; i <= steps; i++) {
        const t_months = i;
        const t_days = t_months * daysInMonth;
        
        const q_arps = calculateArpsHyperbolic(inp.qi, inp.di / daysInMonth, inp.b, t_days);
        const q_duong = calculateDuongRate(t_months + 1, inp.duong_a, inp.duong_m, inp.qi);
        const q_sepd = calculateSEPD(t_days, inp.qi, inp.sepd_tau, inp.sepd_n);

        data.push({
            t: t_months,
            Arps: Math.max(0, q_arps),
            Duong: Math.max(0, q_duong),
            SEPD: Math.max(0, q_sepd)
        });
    }
    return data;
  }, [inp]);

  const phases = [
    { id: 1, name: 'Arps Models', icon: TrendingDown },
    { id: 2, name: 'Modern DCA', icon: Zap },
    { id: 3, name: 'Rate-Time Diag', icon: BarChart2 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <TrendingDown className="text-rose-500" size={32} />
            Decline Curve Analysis <span className="text-rose-500/50">Module 7</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl font-medium uppercase tracking-widest">Production Forecasting & EUR Optimization Engine</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            {phases.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePhase(p.id as any)}
                  className={cn(
                    "px-6 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-xs font-black uppercase tracking-widest",
                    activePhase === p.id 
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" 
                      : "text-slate-500 hover:text-white"
                  )}
                >
                  <p.icon size={14} />
                  {p.name}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-3 space-y-6">
           <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 italic flex items-center gap-2">
                 <Settings2 size={16} className="text-rose-500" /> Model Constants
              </h4>
              <div className="space-y-8">
                 <DCASlider label="Initial Rate (qi)" value={inp.qi} min={100} max={2500} step={50} unit="stb/d" onChange={v => setInp({...inp, qi: v})} />
                 <DCASlider label="Decline Rate (Di)" value={inp.di * 100} min={1} max={90} step={1} unit="%" onChange={v => setInp({...inp, di: v/100})} />
                 <DCASlider label="Arps b-factor" value={inp.b} min={0} max={1} step={0.1} unit="" onChange={v => setInp({...inp, b: v})} />
                 {activePhase === 2 && (
                    <>
                       <DCASlider label="Duong a" value={inp.duong_a} min={0.5} max={2} step={0.1} unit="" onChange={v => setInp({...inp, duong_a: v})} />
                       <DCASlider label="Duong m" value={inp.duong_m} min={1} max={3} step={0.1} unit="" onChange={v => setInp({...inp, duong_m: v})} />
                    </>
                 )}
              </div>
           </div>

           <div className="glass-card p-8 rounded-3xl bg-rose-500/5 border border-rose-500/20 text-center">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Estimated Ultimate Recovery</p>
              <p className="text-4xl font-black text-white italic">
                 {formatNumber(calculateEUR(inp.qi, inp.q_limit, inp.di / 365, inp.b), 0)}
              </p>
              <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">MSTB</p>
           </div>
        </div>

        {/* Main Display */}
        <div className="lg:col-span-9 h-full">
            <AnimatePresence mode="wait">
                <motion.div
                   key={activePhase}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="h-full"
                >
                    <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[600px] flex flex-col">
                        <div className="flex justify-between items-center mb-10">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">
                                {activePhase === 1 ? 'Arps Forecast (Exp vs Hyp vs Har)' : activePhase === 2 ? 'Modern DCA Comparison' : 'Production Diagnostic Plot'}
                            </h4>
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase italic">
                                    <Timer size={14} /> Forecast Limit: 2040
                                </div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                                <XAxis dataKey="t" stroke="#475569" fontSize={10} label={{ value: 'Months', position: 'insideBottom', offset: -10, fill: '#475569' }} />
                                <YAxis scale={activePhase === 3 ? "log" : "auto"} domain={['auto', 'auto']} stroke="#475569" fontSize={10} label={{ value: 'Rate (STB/D)', angle: -90, position: 'insideLeft', fill: '#475569', offset: -10 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line type="monotone" dataKey="Arps" stroke="#f43f5e" strokeWidth={4} dot={false} />
                                {activePhase === 2 && (
                                   <>
                                      <Line type="monotone" dataKey="Duong" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                      <Line type="monotone" dataKey="SEPD" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                                   </>
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function DCASlider({ label, value, min, max, step, unit, onChange }: { label: string, value: number, min: number, max: number, step: number, unit: string, onChange: (v: number) => void }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center text-[11px] font-black text-white uppercase tracking-widest">
                <span>{label}</span>
                <span className="text-rose-400 font-mono">{value} {unit}</span>
            </div>
            <input 
              type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-rose-500"
            />
        </div>
    );
}
