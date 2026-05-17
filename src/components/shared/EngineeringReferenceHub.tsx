import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  Scale, 
  Search,
  CheckCircle2,
  Library,
  ChevronRight,
  Activity,
  ArrowRightCircle
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { OILFIELD_UNIT_CONVERSIONS, REGULATORY_STANDARDS } from '../../lib/reference_data';
import { SectionHeader } from '../SharedUI';

export function EngineeringReferenceHub() {
  const [activeRefTab, setActiveRefTab] = useState<'conversions' | 'standards' | 'calculators'>('calculators');
  const [searchTerm, setSearchTerm] = useState("");
  
  // Calculator States
  const [depthVal, setDepthVal] = useState(10000);
  const [mudWeight, setMudWeight] = useState(12.5);
  const [pipeID, setPipeID] = useState(4.5);
  const [wt, setWt] = useState(0.250);
  const [permeability, setPermeability] = useState(100);
  const [viscosity, setViscosity] = useState(2.0);

  // Math Validated Results
  const hydrostaticPressure = 0.052 * mudWeight * depthVal;
  const pipeVolBbl = (Math.pow(pipeID, 2) / 1029.4) * depthVal;
  const burstPressure = (2 * 55000 * wt) / pipeID; // Simple Barlow's Formula

  const filteredStandards = REGULATORY_STANDARDS.filter(s => 
    s.standard.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.scope.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 p-8 pb-20 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <SectionHeader 
          title="PetroStream Engineering Reference Hub" 
          subtitle="Industrial-Grade Technical Reference & Live Calculation Terminal" 
        />
        
        {/* Tab Selector */}
        <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit backdrop-blur-xl">
          {[
            { id: 'calculators', label: 'Reference Sims', icon: Calculator, color: 'bg-cyan-500' },
            { id: 'conversions', label: 'Unit Factors', icon: Scale, color: 'bg-emerald-500' },
            { id: 'standards',   label: 'Industry Standards', icon: Library, color: 'bg-amber-500' }
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setActiveRefTab(t.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeRefTab === t.id ? `${t.color} text-white shadow-lg shadow-black/40` : "text-slate-500 hover:text-white"
              )}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeRefTab === 'calculators' && (
          <motion.div
            key="calculators"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
             {/* Parameters Sidebar */}
             <div className="lg:col-span-3 space-y-6">
                <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40 space-y-10">
                   <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest italic border-b border-white/5 pb-4">Variable Terminal</h4>
                   
                   <div className="space-y-10">
                      <RefInput label="True Vertical Depth" val={depthVal} min={1000} max={25000} unit="FT" onChange={setDepthVal} />
                      <RefInput label="Mud Weight" val={mudWeight} min={8.3} max={19.5} step={0.1} unit="PPG" onChange={setMudWeight} />
                      <RefInput label="Pipe Inside Diameter" val={pipeID} min={2} max={15} step={0.1} unit="IN" onChange={setPipeID} />
                      <RefInput label="Wall Thickness" val={wt} min={0.1} max={1.0} step={0.001} unit="IN" onChange={setWt} />
                      <RefInput label="Permeability (k)" val={permeability} min={1} max={500} unit="mD" onChange={setPermeability} />
                   </div>
                </div>

                <div className="glass-card rounded-2xl p-6 bg-cyan-500/10 border border-cyan-500/20">
                   <div className="flex items-center gap-2 mb-4">
                      <Activity size={14} className="text-cyan-400" />
                      <span className="text-[11px] font-black text-white uppercase tracking-widest">Real-time Diagnostics</span>
                   </div>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Hyd. Pressure</span>
                         <span className="text-sm font-black text-white font-mono">{formatNumber(hydrostaticPressure, 0)} PSI</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Well Capacity</span>
                         <span className="text-sm font-black text-white font-mono">{formatNumber(pipeVolBbl, 1)} BBL</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Yield Point (Est)</span>
                         <span className="text-sm font-black text-emerald-400 font-mono">{formatNumber(burstPressure, 0)} PSI</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* 3D Visualization Arena */}
             <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card rounded-3xl p-10 bg-black/60 border-white/5 relative overflow-hidden group">
                   <div className="absolute top-8 left-10 z-10">
                      <h3 className="text-sm font-black text-white uppercase italic tracking-widest">Wellbore Geometry <span className="text-cyan-400">3D</span></h3>
                      <p className="text-[11px] text-slate-500 font-bold uppercase mt-1">Volume & Pressure Gradient Model</p>
                   </div>
                   <div className="h-[400px] flex items-center justify-center">
                      <WellboreSim3D depth={depthVal} mudWeight={mudWeight} pipeID={pipeID} hydrostatic={hydrostaticPressure} />
                   </div>
                </div>

                <div className="glass-card rounded-3xl p-10 bg-black/60 border-white/5 relative overflow-hidden group">
                   <div className="absolute top-8 left-10 z-10">
                      <h3 className="text-sm font-black text-white uppercase italic tracking-widest">Pipe Cross-Section <span className="text-emerald-400">3D</span></h3>
                      <p className="text-[11px] text-slate-500 font-bold uppercase mt-1">Wall Integrity & Burst Dynamics</p>
                   </div>
                   <div className="h-[400px] flex items-center justify-center">
                      <PipeSectionSim3D pipeID={pipeID} wt={wt} pressure={burstPressure} />
                   </div>
                </div>

                <div className="lg:col-span-2 glass-card rounded-3xl p-10 bg-[#05070a] border-white/5 flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-4">
                       <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Reservoir Flow <span className="text-amber-500">Physics Simulator</span></h3>
                       <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                          Visualizing Darcy flow through a micro-porous matrix. The velocity vector is linked to permeability (k) and fluid viscosity (cp). 
                          Observe how pore-throat congestion impacts deliverability.
                       </p>
                       <div className="flex gap-4 pt-4">
                          <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                             <span className="text-[10px] font-black text-amber-500 uppercase block mb-1">Mobility Ratio</span>
                             <span className="text-sm font-black text-white font-mono">{(permeability / viscosity).toFixed(1)}</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex-1 w-full h-[250px]">
                       <ReservoirFlowSim3D k={permeability} mu={viscosity} />
                    </div>
                </div>
             </div>
          </motion.div>
        )}

        {activeRefTab === 'conversions' && (
          <motion.div
            key="conversions"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {OILFIELD_UNIT_CONVERSIONS.map((cat, i) => (
              <div key={i} className="glass-card rounded-2xl p-8 border-white/5 bg-black/40 hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                    <Scale size={20} className="text-emerald-400 group-hover:text-black" />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase italic tracking-widest">{cat.category}</h3>
                </div>
                <div className="space-y-4">
                  {cat.units.map((u, j) => (
                    <div key={j} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-emerald-400 font-mono italic">{u.label}</span>
                        <ChevronRight size={10} className="text-slate-700" />
                      </div>
                      <p className="text-xs text-white font-mono leading-tight tracking-tight">{u.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeRefTab === 'standards' && (
          <motion.div
            key="standards"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="relative max-w-2xl mx-auto">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-500" size={20} />
               <input 
                 type="text" 
                 placeholder="Search API, ISO, NACE, ASME Global Standards Database..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-8 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all shadow-2xl focus:shadow-amber-500/10"
               />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredStandards.map((std, i) => (
                <div key={i} className="glass-card rounded-3xl p-8 border-white/5 bg-black/40 hover:border-amber-500/30 transition-all flex gap-8 group">
                  <div className="shrink-0">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-3xl border border-amber-500/20 flex flex-col items-center justify-center group-hover:bg-amber-500 transition-all">
                      <h4 className="text-[11px] font-black text-center leading-tight text-amber-500 group-hover:text-black uppercase">Technical<br/>STD</h4>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                       <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">{std.standard}</h3>
                       <span className="text-[11px] font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest">Active Standard</span>
                    </div>
                    <p className="text-sm font-bold text-slate-300">{std.title}</p>
                    <p className="text-[11px] text-slate-500 italic leading-relaxed pr-8 line-clamp-2">{std.scope}</p>
                    <div className="pt-4 flex items-center gap-2">
                       <CheckCircle2 size={12} className="text-emerald-500" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Module: <span className="text-white">{std.module}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RefInput({ label, val, min, max, step = 1, unit, onChange }: any) {
  return (
    <div className="space-y-4">
       <div className="flex justify-between items-baseline">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
          <span className="text-[11px] font-black text-white font-mono">{val} <span className="text-[10px] text-slate-600">{unit}</span></span>
       </div>
       <input 
          type="range" min={min} max={max} step={step} value={val} 
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all" 
       />
    </div>
  );
}

function WellboreSim3D({ depth, mudWeight, pipeID, hydrostatic }: any) {
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

      // Draw Wellbore
      const centerX = w / 2;
      const wellWidth = pipeID * 10;
      
      // Gradient for 3D effect
      const grad = ctx.createLinearGradient(centerX - wellWidth, 0, centerX + wellWidth, 0);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e293b');
      grad.addColorStop(1, '#0f172a');

      ctx.fillStyle = grad;
      ctx.fillRect(centerX - wellWidth/2, 20, wellWidth, h - 40);

      // Pressure Gradient Line
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(centerX, 20);
      ctx.lineTo(centerX + (hydrostatic/50), h - 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Particles (Mud)
      ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
      for (let i = 0; i < 20; i++) {
        const py = ((i * 20 + time * 50) % (h - 40)) + 20;
        ctx.beginPath();
        ctx.arc(centerX + Math.sin(time + i) * (wellWidth/4), py, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [pipeID, hydrostatic]);

  return (
    <canvas ref={canvasRef} width={300} height={400} className="w-full h-full" />
  );
}

function PipeSectionSim3D({ pipeID, wt, pressure }: any) {
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
      const centerX = w / 2;
      const centerY = h / 2;
      time += 0.05;

      const baseR = pipeID * 8;
      const thickness = wt * 80;

      // Stress Glow
      const stress = Math.min(1, pressure / 20000);
      const grad = ctx.createRadialGradient(centerX, centerY, baseR, centerX, centerY, baseR + thickness);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, `rgba(239, 68, 68, ${stress * 0.4})`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseR + thickness + 10, 0, Math.PI * 2);
      ctx.fill();

      // Pipe Wall
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseR + thickness/2, 0, Math.PI * 2);
      ctx.stroke();

      // ID line
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + baseR, centerY);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [pipeID, wt, pressure]);

  return (
    <canvas ref={canvasRef} width={400} height={400} className="w-full h-full" />
  );
}

function ReservoirFlowSim3D({ k, mu }: any) {
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

      const speed = (k / 500) * (2 / mu);
      const particles = Math.floor((k / 500) * 100) + 20;

      // Matrix
      ctx.fillStyle = '#05070a';
      ctx.fillRect(0, 0, w, h);

      // Pore throats
      ctx.fillStyle = 'rgba(30, 41, 59, 0.3)';
      for (let i = 0; i < 40; i++) {
        const x = (Math.sin(i * 123) * 0.5 + 0.5) * w;
        const y = (Math.cos(i * 456) * 0.5 + 0.5) * h;
        ctx.beginPath();
        ctx.arc(x, y, 10 + Math.random() * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Flow Particles
      ctx.fillStyle = '#f59e0b';
      for (let i = 0; i < particles; i++) {
        const x = ((i * 137 + time * speed * 500) % w);
        const y = (Math.sin(i * 789 + time) * 0.5 + 0.5) * h;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [k, mu]);

  return (
    <div className="w-full h-full bg-[#05070a] rounded-[20px] overflow-hidden">
      <canvas ref={canvasRef} width={500} height={200} className="w-full h-full" />
    </div>
  );
}
