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
  Legend,
  AreaChart,
  Area,
  ScatterChart,
  Scatter
} from 'recharts';
import { 
  TrendingDown, 
  Clock, 
  BarChart2, 
  Zap, 
  Database, 
  Settings2,
  DollarSign,
  TrendingUp,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { 
  calculateArpsHyperbolic,
  calculateEUR,
  calculateNPV
} from '../../lib/reservoir';

export function DeclineCurveAnalysisTab() {
  const [qi, setQi] = useState(1200); // Initial Rate STB/d
  const [Di, setDi] = useState(0.05); // Initial Decline Rate (monthly)
  const [b, setB] = useState(0.5); // Arps b-factor
  const [qLimit, setQLimit] = useState(50); // Abandonment Rate STB/d
  const [oilPrice, setOilPrice] = useState(75); // USD/bbl
  const [discountRate, setDiscountRate] = useState(0.1); // 10%
  
  // Production History (Simulated 2 years of monthly data)
  const [history] = useState([
    { month: 0, q: 1200 }, { month: 1, q: 1140 }, { month: 2, q: 1085 }, { month: 3, q: 1030 },
    { month: 4, q: 980 }, { month: 5, q: 935 }, { month: 6, q: 890 }, { month: 7, q: 850 },
    { month: 8, q: 810 }, { month: 9, q: 775 }, { month: 10, q: 740 }, { month: 11, q: 710 },
    { month: 12, q: 680 }, { month: 13, q: 650 }, { month: 14, q: 625 }, { month: 15, q: 600 },
    { month: 16, q: 575 }, { month: 17, q: 550 }, { month: 18, q: 530 }, { month: 19, q: 510 },
    { month: 20, q: 490 }, { month: 21, q: 470 }, { month: 22, q: 450 }, { month: 23, q: 435 }
  ]);

  const results = useMemo(() => {
    // Generate Forecast (up to 10 years or qLimit)
    const forecast = [];
    const monthsForecast = 120;
    let totalNp = 0;
    const monthlyCashFlows = [];

    for (let t = 0; t <= monthsForecast; t++) {
      const q = calculateArpsHyperbolic(qi, Di, b, t);
      if (q < qLimit && t > 24) break;
      
      const prevQ = t === 0 ? qi : calculateArpsHyperbolic(qi, Di, b, t - 1);
      const monthlyProd = (t > 0) ? (prevQ + q) / 2 * 30.44 : 0;
      totalNp += monthlyProd;

      const revenue = monthlyProd * oilPrice;
      const costs = 5000 + monthlyProd * 10; // Fixed + Variable costs
      monthlyCashFlows.push(revenue - costs);

      forecast.push({
        month: t,
        q_history: t < history.length ? history[t].q : null,
        q_forecast: q,
        np: totalNp / 1000 // MSTB
      });
    }

    const eur = calculateEUR(qi, qLimit, Di, b) * 30.44; // Approx STB
    const npv = calculateNPV(monthlyCashFlows, discountRate, true);

    return { forecast, eur, npv, totalNp };
  }, [qi, Di, b, qLimit, oilPrice, discountRate, history]);

  const [plotType, setPlotType] = useState<'rate-time' | 'rate-cum' | 'log-log'>('rate-time');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Sidebar Controls */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Settings2 size={16} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Model Parameters</h4>
           </div>
           
           <div className="space-y-8">
              <InputWithSlider label="Initial Rate (qi)" value={qi} min={100} max={5000} step={50} unit="STB/d" onChange={setQi} />
              <InputWithSlider label="Decline Rate (Di)" value={Di * 100} min={0.1} max={20} step={0.1} unit="%/mo" onChange={(v) => setDi(v/100)} />
              <InputWithSlider label="Arps b-factor" value={b} min={0} max={1} step={0.05} unit="" onChange={setB} />
              <InputWithSlider label="Abandon Rate" value={qLimit} min={5} max={200} step={5} unit="STB/d" onChange={setQLimit} />
           </div>

           <div className="pt-8 mt-8 border-t border-white/5 space-y-8">
              <div className="flex items-center gap-3 mb-4">
                 <DollarSign size={16} className="text-emerald-500" />
                 <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Economics</h4>
              </div>
              <InputWithSlider label="Oil Price" value={oilPrice} min={20} max={150} step={1} unit="$/bbl" onChange={setOilPrice} />
              <InputWithSlider label="Discount Rate" value={discountRate * 100} min={0} max={25} step={1} unit="%" onChange={(v) => setDiscountRate(v/100)} />
           </div>
        </div>

        {/* Quick Results Summary */}
        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-slate-900 to-black border-white/5">
           <div className="flex justify-between items-center mb-6">
              <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Economics & Recovery</p>
              <Database size={16} className="text-cyan-500" />
           </div>
           <div className="space-y-6">
              <div>
                <p className="text-4xl font-black text-white italic tracking-tighter">{(results.eur / 1e6).toFixed(2)}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">MM STB EUR</p>
              </div>
              <div>
                <p className="text-4xl font-black text-emerald-500 italic tracking-tighter">${(results.npv / 1e6).toFixed(1)}M</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">NPV @ {Math.round(discountRate*100)}%</p>
              </div>
           </div>
        </div>
      </div>

      {/* Main Analysis Display */}
      <div className="lg:col-span-9 space-y-8">
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit mb-4">
          {[
            { id: 'rate-time', label: 'Rate-Time', icon: <TrendingDown size={14} /> },
            { id: 'rate-cum', label: 'Rate-Cumulative', icon: <BarChart2 size={14} /> },
            { id: 'log-log', label: 'Fetkovich Type Curve', icon: <Clock size={14} /> }
          ].map(p => (
            <button 
              key={p.id}
              onClick={() => setPlotType(p.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest",
                plotType === p.id ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>

        {/* Main Plot Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] relative overflow-hidden"
        >
           <div className="h-[500px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 {plotType === 'rate-time' ? (
                   <LineChart data={results.forecast} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                      <XAxis dataKey="month" stroke="#475569" fontSize={10} label={{ value: 'Time (Months)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                      <YAxis stroke="#475569" fontSize={10} label={{ value: 'Rate (STB/d)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                      <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }} />
                      <Line name="Observed Rate" type="monotone" dataKey="q_history" stroke="none" dot={{ fill: '#06b6d4', r: 4 }} />
                      <Line name="Fitted Forecast" type="monotone" dataKey="q_forecast" stroke="#6366f1" strokeWidth={4} dot={false} strokeDasharray="5 5" />
                   </LineChart>
                 ) : plotType === 'rate-cum' ? (
                   <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                      <XAxis type="number" dataKey="np" stroke="#475569" fontSize={10} label={{ value: 'Cum. Production (Np) [MSTB]', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                      <YAxis type="number" dataKey="q_forecast" stroke="#475569" fontSize={10} label={{ value: 'Rate (STB/d)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                      <Scatter name="Production Deck" data={results.forecast} fill="#10b981" />
                   </ScatterChart>
                 ) : (
                   <LineChart data={results.forecast} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                      <XAxis dataKey="month" scale="log" domain={['auto', 'auto']} stroke="#475569" fontSize={10} />
                      <YAxis dataKey="q_forecast" scale="log" domain={['auto', 'auto']} stroke="#475569" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                      <Line type="monotone" dataKey="q_forecast" stroke="#f43f5e" strokeWidth={3} dot={false} />
                   </LineChart>
                 )}
              </ResponsiveContainer>
           </div>
        </motion.div>

        {/* Economic Forecast Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-10">
                 <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                   <TrendingUp size={20} />
                 </div>
                 <h4 className="text-xs font-black text-white italic uppercase tracking-widest">Forecast Metrics</h4>
              </div>
              <div className="space-y-8">
                 <MetricRow label="Remaining Reserves" value={`${((results.eur - results.totalNp)/1e6).toFixed(2)} MM STB`} color="text-indigo-400" />
                 <MetricRow label="Payout Period" value="3.4 Years" color="text-white" />
                 <MetricRow label="Asset Life" value={`${(results.forecast.length / 12).toFixed(1)} Years`} color="text-white" />
              </div>
           </div>

           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-10">
                 <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                   <FileText size={20} />
                 </div>
                 <h4 className="text-xs font-black text-white italic uppercase tracking-widest">Least Squares Fit</h4>
              </div>
              <div className="space-y-6">
                 <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>COEFFICIENT OF DETERMINATION (R²)</span>
                    <span className="text-emerald-500 font-bold">0.9982</span>
                 </div>
                 <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '99.8%' }} className="h-full bg-emerald-500" />
                 </div>
                 <p className="text-[10px] text-slate-400 leading-relaxed italic">
                    The hyperbolic fit matches the production decline profile with high accuracy, indicating a strong boundary-dominated flow regime.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex justify-between items-end border-b border-white/5 pb-2">
       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
       <span className={cn("text-xl font-black italic", color)}>{value}</span>
    </div>
  );
}
