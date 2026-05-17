import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Zap, 
  ChevronRight,
  Target,
  BarChart2,
  PieChart as PieIcon,
  X
} from 'lucide-react';
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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { cn, formatNumber } from '../../lib/utils';

export function EconomicsNeuralSimulator({ activeTab, onHide }: { activeTab?: string; onHide?: () => void }) {
  const [price, setPrice] = useState(() => {
    if (activeTab === 'ph6') return 85; // Pricing phase starts higher
    if (activeTab === 'ph13') return 65; // Carbon econ lower base
    return 75;
  });
  const [capex, setCapex] = useState(() => {
    if (activeTab === 'ph8') return 1200; // Dev planning high capex
    if (activeTab === 'ph10') return 150; // Exploration lower capex
    return 400;
  });
  const [opex, setOpex] = useState(() => {
    if (activeTab === 'ph9') return 25; // Prod econ higher opex
    return 12;
  });
  const [royalty, setRoyalty] = useState(() => {
    if (activeTab === 'ph1') return 18.5; // Fiscal systems specific
    return 12.5;
  });

  const metrics = useMemo(() => {
    const totalProd = 50; // MMboe
    const revenue = totalProd * price;
    const costs = capex + (opex * totalProd);
    const taxable = revenue - costs;
    const netProfit = taxable * (1 - (royalty + 25) / 100);
    
    const utc = costs / totalProd;
    const pi = (netProfit + capex) / Math.max(1, capex);
    const payout = capex / Math.max(1, (netProfit / 10)); // 10 year simplified
    
    return {
      utc: utc.toFixed(1),
      pi: pi.toFixed(2),
      payout: payout.toFixed(1),
      netProfit
    };
  }, [price, capex, opex, royalty]);

  const npvCurveData = useMemo(() => {
    return [0, 5, 10, 15, 20, 25].map(rate => {
      const annualProfit = metrics.netProfit / 10;
      let npv = -capex;
      for (let i = 1; i <= 10; i++) {
        npv += annualProfit / Math.pow(1 + rate / 100, i);
      }
      return { rate: `${rate}%`, npv: Math.round(npv) };
    });
  }, [capex, metrics.netProfit]);

  const [isSimulating, setIsSimulating] = useState(false);

  const handleMonteCarlo = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setPrice(prev => prev + (Math.random() - 0.5) * 10);
    }, 1500);
  };

  const fiscalData = [
    { name: 'Govt Take', value: royalty + 25, color: '#f43f5e' },
    { name: 'OPEX', value: 15, color: '#38bdf8' },
    { name: 'CAPEX Recovery', value: 20, color: '#fbbf24' },
    { name: 'Net Profit', value: Math.max(5, 100 - (royalty + 25 + 15 + 20)), color: '#10b981' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-8 bg-panel-bg border border-white/5 rounded-3xl shadow-2xl relative overflow-hidden group mb-8">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {onHide && (
        <button 
          onClick={onHide}
          className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-500 transition-all border border-white/5 hover:border-red-500/30"
        >
          <X size={20} />
        </button>
      )}

      {/* Control Panel */}
      <div className="lg:col-span-3 space-y-6 relative z-10">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
              <TrendingUp size={20} className={cn(isSimulating && "animate-spin")} />
           </div>
           <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Econ-AI Predictor</h3>
              <p className="text-[11px] text-slate-500 font-mono uppercase tracking-widest">{isSimulating ? 'Computing Iterations...' : 'Live Fiscal Modeling'}</p>
           </div>
        </div>

        <div className="space-y-4">
           <EconSlider label="Oil Price ($/bbl)" value={price} min={30} max={150} step={1} onChange={setPrice} />
           <EconSlider label="CAPEX (MM$)" value={capex} min={100} max={2000} step={50} onChange={setCapex} />
           <EconSlider label="OPEX ($/boe)" value={opex} min={5} max={50} step={1} onChange={setOpex} />
           <EconSlider label="Royalty (%)" value={royalty} min={0} max={30} step={0.5} onChange={setRoyalty} />
        </div>
      </div>

      {/* Main Charts */}
      <div className="lg:col-span-6 flex flex-col gap-6 relative z-10">
          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl flex-1 min-h-[300px] flex flex-col relative overflow-hidden">
             <div className="absolute top-6 left-8 z-10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Monte Carlo Engine</p>
                <h5 className="text-[11px] font-black text-amber-400 uppercase italic">Stochastic NPV Distribution</h5>
             </div>
             <div className="flex-1">
                <MonteCarloCanvas isSimulating={isSimulating} price={price} />
             </div>
          </div>

         <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl flex flex-col">
               <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Revenue Distribution (%)</p>
               <div className="flex-1 min-h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={fiscalData}
                           innerRadius={40}
                           outerRadius={60}
                           paddingAngle={5}
                           dataKey="value"
                        >
                           {fiscalData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Pie>
                        <Tooltip />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>
            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
               <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Project IRR</p>
               <h4 className="text-4xl font-black italic text-emerald-400 tracking-tighter">
                  {((price / 75) * 22 + (capex < 500 ? 5 : 0)).toFixed(1)}%
               </h4>
               <div className="mt-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">
                    {((price / 75) * 22) > 15 ? 'Above Hurdle Rate' : 'Review Required'}
                  </span>
               </div>
            </div>
         </div>
      </div>

      {/* Analytics */}
      <div className="lg:col-span-3 space-y-6 relative z-10">
         <div className="p-6 bg-white/5 border border-white/5 rounded-2xl h-full flex flex-col">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 italic">Fiscal Intelligence</h4>
            <div className="space-y-6 flex-1">
               <MetricRow label="Payout Period" value={`${metrics.payout} Yrs`} status={Number(metrics.payout) < 5 ? 'good' : 'warning'} />
               <MetricRow label="Profitability Index" value={metrics.pi} status={Number(metrics.pi) > 1.2 ? 'good' : 'warning'} />
               <MetricRow label="Max Exposure" value={`$${capex}MM`} status={capex > 1000 ? 'warning' : 'good'} />
               <MetricRow label="UTC ($/boe)" value={`$${metrics.utc}`} status="info" />
            </div>
            
            <button 
              onClick={handleMonteCarlo}
              disabled={isSimulating}
              className="w-full mt-8 py-4 bg-amber-600 text-black rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:scale-[0.98] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 italic shadow-lg shadow-amber-500/20">
               {isSimulating ? 'Processing...' : 'Run Monte Carlo'} <ChevronRight size={14} className={isSimulating ? 'animate-ping' : ''} />
            </button>
         </div>
      </div>
    </div>
  );
}


function EconSlider({ label, value, min, max, step, onChange }: any) {
   return (
      <div className="space-y-2">
         <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label}</label>
            <span className="text-[10px] font-mono text-white bg-white/5 px-2 py-0.5 rounded-md">{value}</span>
         </div>
         <input 
            type="range" 
            min={min} 
            max={max} 
            step={step} 
            value={value} 
            onChange={e => onChange(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-full appearance-none accent-amber-500 cursor-pointer" 
         />
      </div>
   );
}

function MetricRow({ label, value, status }: any) {
   const colors: any = {
      good: "bg-emerald-500",
      warning: "bg-amber-500",
      info: "bg-cyan-500"
   };
   return (
      <div className="flex items-center justify-between group">
         <div className="flex items-center gap-3">
            <div className={cn("w-1.5 h-1.5 rounded-full", colors[status])} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label}</span>
         </div>
         <span className="text-[10px] font-mono text-white font-black">{value}</span>
      </div>
   );
}

function MonteCarloCanvas({ isSimulating, price }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      time += 0.05;

      ctx.strokeStyle = '#f59e0b44';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, h);
      const centerX = w * (price / 150);
      for (let x = 0; x < w; x++) {
        const y = h - Math.exp(-Math.pow(x - centerX, 2) / 2000) * (h * 0.8);
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      if (isSimulating) {
        ctx.fillStyle = '#f59e0b';
        for (let i = 0; i < 20; i++) {
          const x = centerX + (Math.random() - 0.5) * 100;
          const y = h - Math.random() * (h * 0.6);
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isSimulating, price]);

  return <canvas ref={canvasRef} width={600} height={300} className='w-full h-full' />;
}
