import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Settings, 
  BarChart2, 
  Zap, 
  Waves, 
  ShieldCheck, 
  Droplet,
  ArrowUpCircle,
  Eye,
  Maximize2,
  ListFilter,
  Monitor
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { 
  estimateGasLiftInjection
} from '../../lib/reservoir';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export function ProductionEngineeringModule() {
  const [activePhase, setActivePhase] = useState<1 | 2 | 3>(1);
  const [inp, setInp] = useState({
    q_liquid: 1200,
    glr_target: 800,
    glr_form: 200,
    water_cut: 45
  });

  // Convert scf/day to Mscf/day by dividing by 1000
  const q_gl_injected = estimateGasLiftInjection(inp.q_liquid, inp.glr_target, inp.glr_form) / 1000;

  const optimizationData = useMemo(() => {
    const base = inp.q_liquid;
    // Nodal Analysis Optimization math (heuristic based on inputs)
    // Higher GLR reduces fluid gradient, increasing rate up to a point
    const glrFactor = Math.min(1.3, 1 + (inp.glr_target - inp.glr_form) / 4000);
    // Water cut increases gradient, hurting rate
    const wcFactor = 1 - (inp.water_cut / 200);
    
    const optimized = base * glrFactor * wcFactor;
    
    return [
      { name: 'Base Rate', rate: base },
      { name: 'Gas Lift Opt', rate: optimized },
      { name: 'Choke Opt', rate: optimized * 1.05 },
      { name: 'Nodal Max', rate: optimized * 1.12 }
    ];
  }, [inp]);

  const phases = [
    { id: 1, name: 'Artificial Lift', icon: ArrowUpCircle },
    { id: 2, name: 'Optimization', icon: Zap },
    { id: 3, name: 'Surveillance', icon: Monitor }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
       <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Activity className="text-emerald-500" size={32} />
            Production Engineering <span className="text-emerald-500/50">Module 12</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl font-medium uppercase tracking-widest">Asset Performance & Well Lifecycle Management</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            {phases.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePhase(p.id as any)}
                  className={cn(
                    "px-6 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-xs font-black uppercase tracking-widest",
                    activePhase === p.id 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
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
        <div className="lg:col-span-4 space-y-6">
           <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-8 italic flex items-center gap-2">
                 <Settings size={16} className="text-emerald-500" /> Operational Tuning
              </h4>
              <div className="space-y-8">
                 <ProdSlider label="Liquid Rate" value={inp.q_liquid} min={100} max={5000} step={100} unit="STB/D" onChange={v => setInp({...inp, q_liquid: v})} />
                 <ProdSlider label="Target GLR" value={inp.glr_target} min={100} max={2000} step={50} unit="scf/stb" onChange={v => setInp({...inp, glr_target: v})} />
                 <ProdSlider label="Water Cut" value={inp.water_cut} min={0} max={99} step={1} unit="%" onChange={v => setInp({...inp, water_cut: v})} />
              </div>
           </div>

           <div className="glass-card p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20">
               <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 italic">Computed Injection</h4>
               <div className="text-center py-6">
                   <h3 className="text-5xl font-black text-white italic tracking-tighter mb-2">{formatNumber(q_gl_injected, 0)}</h3>
                   <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Required Gas Injection <br/><span className="text-slate-500">(Mscf/D)</span></p>
               </div>
           </div>
        </div>

        <div className="lg:col-span-8 h-full">
            <AnimatePresence mode="wait">
                <motion.div
                   key={activePhase}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="h-full"
                >
                    {activePhase === 1 && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                            <div className="glass-card rounded-3xl p-10 bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-center">
                                <h4 className="text-4xl font-black text-white italic tracking-tighter mb-4 italic italic">Lift & Sucker Rod Design</h4>
                                <div className="space-y-4">
                                    {[
                                        { n: 'Gas Lift', desc: 'Injection rate 1200 psi', icon: Waves, status: 'Active' },
                                        { n: 'ESP', desc: '60Hz Frequency Opt', icon: Zap, status: 'Active' },
                                        { n: 'Rod Pump', desc: 'Dynamometer & String', icon: Maximize2, status: 'Standby' },
                                        { n: 'PCP', desc: 'Squeeze & Sand Control', icon: ListFilter, status: 'N/A' }
                                    ].map(it => (
                                        <div key={it.n} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-emerald-500/50 transition-all">
                                            <div className="flex items-center gap-3">
                                                <it.icon size={16} className="text-emerald-500" />
                                                <div>
                                                    <p className="text-[11px] font-black text-white uppercase italic">{it.n}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase">{it.desc}</p>
                                                </div>
                                            </div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#030407] h-full flex flex-col relative overflow-hidden">
                                <div className="absolute top-8 left-10 z-10">
                                   <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">3D Gas Lift Injection Simulator</h4>
                                   <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Real-time Multiphase Flow</p>
                                </div>
                                <div className="w-full h-full flex items-center justify-center pt-10">
                                   <ArtificialLiftSimulator3D gasRate={q_gl_injected} liquidRate={inp.q_liquid} />
                                </div>
                            </div>
                         </div>
                    )}

                    {activePhase === 2 && (
                        <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#030407] h-[600px] flex flex-col relative overflow-hidden">
                            <div className="absolute top-8 left-10 z-10 w-full pr-20 flex justify-between items-start">
                                <div>
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">3D Nodal Analysis Simulator</h4>
                                    <p className="text-[11px] text-emerald-400 uppercase font-black mt-1">IPR / VLP Intersection Modeling</p>
                                </div>
                                <div className="text-[11px] font-black text-emerald-400 italic px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">SYSTEM OPTIMIZED</div>
                            </div>
                            
                            <div className="w-full h-[50%] mt-12 flex items-center justify-center">
                               <NodalSimulator3D rate={optimizationData[3].rate} waterCut={inp.water_cut} />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 h-full pb-4">
                               {optimizationData.map((d, i) => (
                                  <div key={d.name} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex flex-col justify-end relative overflow-hidden group">
                                     <div className="absolute bottom-0 left-0 w-full bg-slate-800" style={{ height: `${(d.rate / 3000) * 100}%` }}>
                                        <motion.div 
                                           className="w-full h-full"
                                           style={{ backgroundColor: i === 3 ? '#10b981' : '#334155' }}
                                           initial={{ height: 0 }}
                                           animate={{ height: '100%' }}
                                           transition={{ type: 'spring', delay: i * 0.1 }}
                                        />
                                     </div>
                                     <div className="z-10 relative">
                                        <span className="text-3xl font-black text-white italic tracking-tighter block mb-1">{formatNumber(d.rate, 0)}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.name}</span>
                                     </div>
                                  </div>
                               ))}
                            </div>
                        </div>
                    )}

                    {activePhase === 3 && (
                        <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#030407] h-[600px] flex flex-col relative overflow-hidden">
                            <Activity size={300} className="text-emerald-500/5 absolute -left-20 -bottom-20 -rotate-12" />
                            <div className="absolute top-8 left-10 z-10 w-full pr-20 flex justify-between items-start">
                                <div>
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">3D SCADA & Fiber Optics Simulator</h4>
                                    <p className="text-[11px] text-emerald-400 uppercase font-black mt-1">DTS / DAS / PLT Real-time Sensing</p>
                                </div>
                                <div className="text-[11px] font-black text-emerald-400 italic px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 animate-pulse">LIVE DATA FEED</div>
                            </div>

                            <div className="w-full h-full mt-8 z-10 flex flex-col justify-center items-center">
                               <SurveillanceSimulator3D rate={inp.q_liquid} waterCut={inp.water_cut} />
                               
                               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-10">
                                   {[
                                       { t: 'DTS Thermal', v: 'Continuous' },
                                       { t: 'DAS Acoustic', v: 'High-Freq' },
                                       { t: 'PBU Match', v: 'Calibrated' },
                                       { t: 'PLT Logging', v: 'Zone Match' }
                                   ].map(it => (
                                       <div key={it.t} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center">
                                           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 italic">{it.t}</p>
                                           <p className="text-[10px] text-slate-500 font-black uppercase">{it.v}</p>
                                       </div>
                                   ))}
                               </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ProdSlider({ label, value, min, max, step, unit, onChange }: { label: string, value: number, min: number, max: number, step: number, unit: string, onChange: (v: number) => void }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center text-[11px] font-black text-white uppercase tracking-widest">
                <span>{label}</span>
                <span className="text-emerald-400 font-mono">{formatNumber(value, 0)} {unit}</span>
            </div>
            <input 
              type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
        </div>
    );
}

function ArtificialLiftSimulator3D({ gasRate, liquidRate }: { gasRate: number, liquidRate: number }) {
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
      const midX = w / 2;
      time += 0.02;

      const gasSpeed = (gasRate / 5000) * 10;
      const liquidSpeed = (liquidRate / 5000) * 5;

      // Casing
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(midX - 50, 20, 100, h - 40);
      
      // Tubing
      const tubGrad = ctx.createLinearGradient(midX - 20, 0, midX + 20, 0);
      tubGrad.addColorStop(0, '#0f172a');
      tubGrad.addColorStop(0.5, '#334155');
      tubGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = tubGrad;
      ctx.fillRect(midX - 20, 20, 40, h - 40);

      // Gas Bubbles (Injected)
      ctx.fillStyle = '#10b981';
      for (let i = 0; i < 30; i++) {
        const x = midX - 35 + (Math.sin(i * 123) * 10);
        const y = ((i * 20 + time * gasSpeed * 50) % (h - 60)) + 20;
        ctx.beginPath();
        ctx.arc(x, h - y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Liquid Flow (Production)
      ctx.fillStyle = '#06b6d4';
      for (let i = 0; i < 20; i++) {
        const y = ((i * 30 + time * liquidSpeed * 50) % (h - 40)) + 20;
        ctx.beginPath();
        ctx.arc(midX, h - y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [gasRate, liquidRate]);

  return (
    <canvas ref={canvasRef} width={200} height={400} className="w-full h-full" />
  );
}

function NodalSimulator3D({ rate, waterCut }: { rate: number, waterCut: number }) {
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

      const flowSpeed = (rate / 3000) * 5;

      // Draw Curves Conceptually
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 40);
      ctx.quadraticCurveTo(w/2, h/2, w-40, h-40);
      ctx.stroke();

      // Operating Point Glow
      const glow = Math.sin(time * 5) * 5 + 10;
      ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.beginPath();
      ctx.arc(w/2, h/2, glow, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(w/2, h/2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Flow Particles along the wellbore
      ctx.fillStyle = waterCut > 50 ? '#3b82f6' : '#10b981';
      for (let i = 0; i < 20; i++) {
        const x = ((i * 30 + time * flowSpeed * 20) % (w - 80)) + 40;
        ctx.beginPath();
        ctx.arc(x, h/2 + Math.sin(x/20 + time) * 5, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [rate, waterCut]);

  return (
    <canvas ref={canvasRef} width={400} height={200} className="w-full h-full" />
  );
}

function SurveillanceSimulator3D({ rate, waterCut }: { rate: number, waterCut: number }) {
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

      const flowSpeed = (rate / 5000) * 8;

      // Fiber Optic Line
      ctx.strokeStyle = waterCut > 50 ? '#3b82f6' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, h/2);
      ctx.lineTo(w - 50, h/2);
      ctx.stroke();

      // Acoustic Pulses (DAS)
      for (let i = 0; i < 5; i++) {
        const x = ((i * 80 + time * 100) % (w - 100)) + 50;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.beginPath();
        ctx.arc(x, h/2, (time * 50) % 30, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Heat Map Blocks (DTS)
      const segments = 10;
      for (let i = 0; i < segments; i++) {
        const x = 50 + (i * (w - 100) / segments);
        const tempColor = `hsla(${200 - i * 15}, 70%, 50%, 0.3)`;
        ctx.fillStyle = tempColor;
        ctx.fillRect(x, h/2 + 20, (w - 100) / segments - 5, 10);
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [rate, waterCut]);

  return (
    <canvas ref={canvasRef} width={500} height={200} className="w-full h-full" />
  );
}
