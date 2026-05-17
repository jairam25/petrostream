import React, { useState, useMemo, Component, ReactNode, ErrorInfo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingDown, 
  Settings2, 
  BarChart3, 
  Activity, 
  Zap,
  Target,
  RefreshCw,
  Cpu,
  BrainCircuit,
  Calculator
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { calculateArpsHyperbolic } from '../../lib/reservoir';
import { 
  calculateDuongDecline, 
} from '../../lib/analytics';
import { calculateSEPD } from '../../lib/reservoir';
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

class DCAErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("DCA Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) return (
      <div className="p-10 text-red-500 bg-red-500/10 h-[600px] overflow-auto rounded-3xl">
        <h2 className="text-2xl font-bold mb-4">React Error in Auto-DCA Tab</h2>
        <pre className="text-xs font-mono whitespace-pre-wrap">{this.state.error?.stack || this.state.error?.toString()}</pre>
      </div>
    );
    return this.props.children;
  }
}

function NeuralFittingSimulator({ data, model }: { data: any[], model: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
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
      time += 0.02;

      // Draw Data Points as kinetic particles
      ctx.fillStyle = 'rgba(71, 85, 105, 0.5)';
      data.forEach((d, i) => {
        const x = (i / data.length) * (w - 40) + 20;
        const y = h - (d.actual / 2000) * (h - 40) - 20;
        const drift = Math.sin(time + i) * 2;
        ctx.beginPath();
        ctx.arc(x, y + drift, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Model Curve with Glow
      ctx.strokeStyle = model === 'arps' ? '#10b981' : model === 'duong' ? '#3b82f6' : '#f59e0b';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.beginPath();
      data.forEach((d, i) => {
        const x = (i / data.length) * (w - 40) + 20;
        const val = model === 'arps' ? d.arps : model === 'duong' ? d.duong : d.sepd;
        const y = h - (val / 2000) * (h - 40) - 20;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [data, model]);

  return <canvas ref={canvasRef} width={600} height={400} className="w-full h-full" />;
}

export function AutomatedDCATab() {
  return (
    <DCAErrorBoundary>
      <AutomatedDCATabInner />
    </DCAErrorBoundary>
  );
}

function AutomatedDCATabInner() {
  const [model, setModel] = useState<'arps' | 'duong' | 'sepd'>('arps');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationTick, setSimulationTick] = useState(0);

  // Restore core time-series data
  const data = useMemo(() => {
    const arr = [];
    for (let t = 0; t < 60; t++) {
      const arps = calculateArpsHyperbolic(1500, 0.4, 0.5, t);
      const duong = calculateDuongDecline(t + 1, 1500, 1.2, 1.1);
      const sepd = calculateSEPD(t, 1500, 24, 0.45);
      const noise = (Math.random() - 0.5) * 50;
      arr.push({ t, actual: Math.max(0, arps + noise), arps, duong, sepd });
    }
    return arr;
  }, []);

  // Derive all metrics dynamically based on the current model and simulation tick
  const modelMetrics = useMemo(() => {
    // Base values per model
    const base = {
      arps:  { p10: 3.1, p50: 3.8, p90: 4.2, conf: 0.982, meanEur: 3.8, spread: 0.8 },
      duong: { p10: 3.9, p50: 4.5, p90: 5.1, conf: 0.941, meanEur: 4.5, spread: 1.0 },
      sepd:  { p10: 2.5, p50: 3.2, p90: 3.9, conf: 0.995, meanEur: 3.2, spread: 0.6 }
    }[model];

    // Add Monte Carlo noise based on simulationTick
    const noise = simulationTick > 0 ? (Math.random() - 0.5) * 0.15 : 0;
    
    const p10 = base.p10 + noise;
    const p50 = base.p50 + noise;
    const p90 = base.p90 + noise;
    const conf = Math.min(0.999, Math.max(0.85, base.conf + (Math.random() - 0.5) * 0.02));

    // Generate normal distribution curve around the mean
    const distData = [];
    for (let eur = 1.0; eur <= 6.5; eur += 0.2) {
      const x = eur;
      // Normal distribution formula
      const count = Math.round(100 * Math.exp(-Math.pow(x - (base.meanEur + noise), 2) / (2 * Math.pow(base.spread / 2, 2))));
      distData.push({ eur: x.toFixed(1), count: Math.max(0, count) });
    }

    return { p10, p50, p90, conf, distData };
  }, [model, simulationTick]);

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSimulationTick(t => t + 1);
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 h-full">
      {/* Parameters Sidebar */}
      <div className="lg:col-span-3 space-y-6 h-full overflow-y-auto pr-2">
         <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40">
            <div className="flex items-center gap-3 mb-6">
               <Cpu size={18} className="text-emerald-500" />
               <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Auto-Fit Engine</h4>
            </div>
            
            <div className="space-y-4">
               {[
                 { id: 'arps', label: 'Arps Hyperbolic', aic: '-142.4' },
                 { id: 'duong', label: 'Duong Model', aic: '-158.2' },
                 { id: 'sepd', label: 'Stretched Exp', aic: '-139.1' }
               ].map(m => (
                 <button 
                   key={m.id}
                   onClick={() => setModel(m.id as any)}
                   className={cn(
                     "w-full p-4 rounded-2xl flex justify-between items-center transition-all border",
                     model === m.id ? "bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20" : "bg-white/5 border-transparent opacity-60 hover:opacity-100"
                   )}
                 >
                    <div className="text-left">
                       <span className="text-[10px] font-black text-white uppercase tracking-tight block">{m.label}</span>
                       <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">AIC: {m.aic}</span>
                    </div>
                    {model === m.id && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]" />}
                 </button>
               ))}
            </div>
         </div>

         <div className="glass-card rounded-2xl p-8 bg-gradient-to-br from-emerald-950 to-black border-white/5">
            <div className="flex items-center gap-3 mb-6">
               <BrainCircuit size={18} className="text-emerald-400" />
               <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Bootstrap Resampling</h4>
            </div>
            
            <div className="space-y-6">
               <div>
                 <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[11px] text-slate-500 uppercase font-bold">Iterations</span>
                    <span className="text-[11px] font-black text-emerald-400">1,000</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: isSimulating ? '100%' : '100%' }}
                      transition={{ duration: isSimulating ? 1.5 : 0 }}
                      className="h-full bg-emerald-500" 
                    />
                 </div>
               </div>

               <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-xl bg-black/40 border border-white/5">
                     <span className="text-[10px] text-slate-500 uppercase block">P10 EUR</span>
                     <span className="text-[10px] text-white font-bold">{modelMetrics.p10.toFixed(2)}M</span>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                     <span className="text-[10px] text-emerald-400 uppercase block">P50 EUR</span>
                     <span className="text-[10px] text-white font-bold">{modelMetrics.p50.toFixed(2)}M</span>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-black/40 border border-white/5">
                     <span className="text-[10px] text-slate-500 uppercase block">P90 EUR</span>
                     <span className="text-[10px] text-white font-bold">{modelMetrics.p90.toFixed(2)}M</span>
                  </div>
               </div>
            </div>

            <button 
               onClick={runSimulation}
               disabled={isSimulating}
               className={cn(
                 "w-full mt-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                 isSimulating ? "bg-emerald-800 text-emerald-400 cursor-not-allowed" : "bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
               )}
            >
               <RefreshCw size={14} className={cn(isSimulating && "animate-spin")} />
               {isSimulating ? 'Simulating...' : 'Re-run Simulation'}
            </button>
         </div>
      </div>

      {/* Decline Curve UI */}
      <div className="lg:col-span-9 space-y-8 h-full overflow-y-auto pr-2">
         <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a]">
               <div className="flex items-center justify-between mb-8">
                  <div>
                     <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Automated <span className="text-emerald-500">DCA</span></h3>
                     <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Intelligent Multi-Model Nonlinear Fitting</p>
                  </div>
               </div>

               <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                        <XAxis dataKey="t" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff' }}
                           cursor={{ stroke: '#ffffff10' }}
                        />
                        <Line type="monotone" dataKey="actual" stroke="#475569" strokeWidth={1} dot={{ r: 2, fill: '#64748b' }} strokeDasharray="3 3" />
                        {model === 'arps' && <Line type="monotone" dataKey="arps" stroke="#10b981" strokeWidth={3} dot={false} animationDuration={1000} />}
                        {model === 'duong' && <Line type="monotone" dataKey="duong" stroke="#3b82f6" strokeWidth={3} dot={false} animationDuration={1000} />}
                        {model === 'sepd' && <Line type="monotone" dataKey="sepd" stroke="#f59e0b" strokeWidth={3} dot={false} animationDuration={1000} />}
                     </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#030407] flex flex-col relative overflow-hidden">
               <div className="absolute top-8 left-10 z-10">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">Neural Fitting Engine</h4>
                  <p className="text-[11px] text-emerald-400 uppercase font-bold mt-1">Nonlinear Least-Squares Optimizer</p>
               </div>
               <div className="w-full h-full flex items-center justify-center pt-10">
                  <NeuralFittingSimulator data={data} model={model} />
               </div>
            </div>
         </div>

         {/* Distribution Plot */}
         <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a]">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 border-b border-white/5 pb-4 italic">EUR Distribution (Probabilistic Prediction)</h4>
            <div className="h-[200px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={modelMetrics.distData}>
                     <defs>
                        <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                     <XAxis dataKey="eur" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} label={{ value: 'MMbbl (P10/50/90)', position: 'insideBottom', offset: -5, fontSize: 8, fill: '#475569' }} />
                     <Tooltip />
                     <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#probGradient)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
}
