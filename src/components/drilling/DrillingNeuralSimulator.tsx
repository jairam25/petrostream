import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Activity, 
  ShieldAlert, 
  TrendingUp, 
  Gauge, 
  Settings,
  Cpu,
  ChevronRight,
  ShieldCheck
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
  Area
} from 'recharts';
import { cn, formatNumber } from '../../lib/utils';

export function DrillingNeuralSimulator() {
  const [params, setParams] = useState({
    wob: 35, // klbs
    rpm: 120,
    mudWeight: 10.5, // ppg
    pressure: 4500, // psi
    bitDiameter: 8.5, // in
  });

  // Simplified Warren ROP Model
  const rop = useMemo(() => {
    const { wob, rpm, bitDiameter } = params;
    const mechanicalFactor = (rpm * wob) / (bitDiameter * 20);
    const hydraulicFactor = 1.2; // constant for demo
    return mechanicalFactor * hydraulicFactor;
  }, [params]);

  const drillingTrend = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      depth: i * 50,
      rop: rop * (0.8 + Math.random() * 0.4),
      mse: 15 + Math.random() * 5
    }));
  }, [rop]);

  const [isUpdating, setIsUpdating] = useState(false);

  const metrics = useMemo(() => {
    const mse = (480 * params.wob) / (params.bitDiameter * params.bitDiameter) + (13.33 * params.rpm * params.wob) / (params.bitDiameter * rop);
    const ecd = params.mudWeight + (rop / 100);
    return {
      mse: mse.toFixed(1),
      ecd: ecd.toFixed(1),
      av: (100 + (params.rpm / 2)).toFixed(0)
    };
  }, [params, rop]);

  const [showSuccess, setShowSuccess] = useState(false);

  const handleUpdate = () => {
    setIsUpdating(true);
    setShowSuccess(false);
    
    // Simulate complex optimization calculation
    setTimeout(() => {
      setIsUpdating(false);
      setShowSuccess(true);
      
      // Slightly "optimize" WOB and RPM for higher ROP
      setParams(prev => ({
        ...prev,
        wob: Math.min(prev.wob + 2, 55),
        rpm: Math.min(prev.rpm + 5, 180)
      }));
      
      // Hide success after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-8 bg-panel-bg border border-border-subtle rounded-3xl shadow-2xl relative overflow-hidden group mb-8">

      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Control Panel */}
      <div className="lg:col-span-3 space-y-6 relative z-10">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400">
              <Zap size={20} className={cn(isUpdating && "animate-spin")} />
           </div>
           <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Drill-AI Terminal</h3>
              <p className="text-[11px] text-slate-500 font-mono uppercase tracking-widest">{isUpdating ? 'Recalculating...' : 'Real-Time Optimization'}</p>
           </div>
        </div>

        <div className="space-y-4">
           <DrillInput label="Weight on Bit" value={params.wob} unit="klbs" min={0} max={60} onChange={v => setParams({...params, wob: v})} />
           <DrillInput label="Rotary Speed" value={params.rpm} unit="rpm" min={40} max={200} onChange={v => setParams({...params, rpm: v})} />
           <DrillInput label="Mud Weight" value={params.mudWeight} unit="ppg" min={8} max={18} step={0.1} onChange={v => setParams({...params, mudWeight: v})} />
        </div>
      </div>

      {/* Main Display */}
      <div className="lg:col-span-6 flex flex-col gap-6 relative z-10">
         <div className="grid grid-cols-2 gap-6 flex-1">
            <div className="p-8 bg-black/40 border border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Rate of Penetration</p>
               <h4 className="text-5xl font-black text-white italic tracking-tighter">
                  {formatNumber(rop, 1)}
                  <span className="text-xs text-slate-500 not-italic ml-2">FT/HR</span>
               </h4>
               <div className="mt-6 flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                  <Activity size={12} className={cn("text-cyan-400", rop > 40 && "animate-pulse")} />
                  <span className="text-[11px] font-black text-cyan-400 uppercase italic">Dynamic MSE: {metrics.mse} ksi</span>
               </div>
            </div>

            <div className="p-8 bg-black/40 border border-white/5 rounded-3xl flex flex-col">
               <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Borehole Stability</p>
                  <ShieldAlert size={14} className={Number(metrics.mse) > 20 ? "text-amber-500" : "text-emerald-500"} />
               </div>
               <div className="flex-1 flex items-center justify-center">
                  <div className="relative w-24 h-24 rounded-full border-4 border-emerald-500/20 flex items-center justify-center">
                     <div className={cn("absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin", rop > 50 ? "duration-[1000ms]" : "duration-[3000ms]")} />
                     <span className="text-xl font-black text-white italic">{Math.max(85, 100 - (Number(metrics.mse)/5)).toFixed(0)}%</span>
                  </div>
               </div>
            </div>
         </div>

          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl h-48 flex flex-col relative overflow-hidden">
             <div className="absolute top-6 left-8 z-10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Bit Dynamics Simulator</p>
                <h5 className="text-[11px] font-black text-cyan-400 uppercase italic">Rotation & Vibration Feedback</h5>
             </div>
             <div className="flex-1">
                <BitCanvas wob={params.wob} rpm={params.rpm} isUpdating={isUpdating} />
             </div>
          </div>
      </div>

      {/* Analytics Panel */}
      <div className="lg:col-span-3 space-y-6 relative z-10">
         <div className="p-6 bg-white/5 border border-white/5 rounded-2xl h-full flex flex-col">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 italic">Drilling Intelligence</h4>
            <div className="space-y-6 flex-1">
               <MetricRow label="Bit Dull Grade" value="1-1-WT" status="good" />
               <MetricRow label="ECD @ Bit" value={`${metrics.ecd} ppg`} status={Number(metrics.ecd) > 13 ? 'warning' : 'good'} />
               <MetricRow label="Annular Vel" value={`${metrics.av} ft/min`} status="good" />
            </div>
            
            <button 
              onClick={handleUpdate}
              disabled={isUpdating}
              className={cn(
                "w-full mt-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2 italic shadow-lg",
                showSuccess ? "bg-emerald-500 shadow-emerald-500/20" : "bg-cyan-600 shadow-cyan-500/20"
              )}>
               {isUpdating ? 'Optimizing...' : showSuccess ? 'Plan Synchronized' : 'Update Drilling Plan'} 
               {!isUpdating && !showSuccess && <ChevronRight size={14} />}
               {isUpdating && <Cpu size={14} className="animate-spin" />}
               {showSuccess && <ShieldCheck size={14} className="text-white" />}
            </button>
            
            <AnimatePresence>
              {showSuccess && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] text-emerald-400 font-bold uppercase tracking-widest text-center mt-3 italic"
                >
                  Neural Weights Calibrated +2.4% ROP
                </motion.p>
              )}
            </AnimatePresence>
         </div>
      </div>

    </div>
  );
}

function DrillInput({ label, value, unit, min, max, step = 1, onChange }: any) {
   return (
      <div className="space-y-2">
         <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label}</label>
            <span className="text-[10px] font-mono text-white bg-white/5 px-2 py-0.5 rounded-md">{value} {unit}</span>
         </div>
         <input 
            type="range" 
            min={min} 
            max={max} 
            step={step} 
            value={value} 
            onChange={e => onChange(Number(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-full appearance-none accent-cyan-500 cursor-pointer" 
         />
      </div>
   );
}

function MetricRow({ label, value, status }: any) {
   return (
      <div className="flex items-center justify-between group">
         <div className="flex items-center gap-3">
            <div className={cn("w-1.5 h-1.5 rounded-full", status === 'good' ? 'bg-emerald-500' : 'bg-amber-500')} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{label}</span>
         </div>
         <span className="text-[10px] font-mono text-white font-black">{value}</span>
      </div>
   );
}

function BitCanvas({ wob, rpm, isUpdating }: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      
      const speed = (rpm / 120) * 0.1;
      rotation += speed;

      const centerX = w / 2;
      const centerY = h / 2;
      const bitSize = 40;

      const vibration = (wob / 10) * (rpm / 100);
      const vx = Math.sin(rotation * 20) * vibration;
      const vy = Math.cos(rotation * 15) * vibration;

      ctx.strokeStyle = '#ffffff05';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX + vx, centerY + vy, bitSize + 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX + vx, centerY + vy);
      ctx.rotate(rotation);
      
      ctx.fillStyle = '#475569';
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(bitSize, -10);
        ctx.lineTo(bitSize, 10);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(bitSize - 5, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      ctx.restore();

      if (isUpdating || rpm > 0) {
        ctx.fillStyle = '#4b3621';
        for (let i = 0; i < 10; i++) {
          const px = centerX + Math.cos(rotation * 5 + i) * (bitSize + 20);
          const py = centerY + Math.sin(rotation * 5 + i) * (bitSize + 20);
          ctx.beginPath();
          ctx.arc(px, py, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [wob, rpm, isUpdating]);

  return <canvas ref={canvasRef} width={600} height={200} className='w-full h-full' />;
}
