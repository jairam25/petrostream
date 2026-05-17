import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Map, 
  DollarSign, 
  Scale, 
  TrendingUp, 
  ShieldCheck, 
  Database,
  ChevronRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { cn, formatNumber } from '../../lib/utils';
import { useEffect, useRef } from 'react';

export function LandNeuralSimulator() {
  const [params, setParams] = useState({
    grossAcres: 640,
    mineralInterest: 0.5,
    leaseRoyalty: 0.25,
    bonusPerAcre: 5000,
    oilPrice: 75
  });

  const nma = useMemo(() => params.grossAcres * params.mineralInterest, [params]);
  const totalBonus = useMemo(() => nma * params.bonusPerAcre, [nma, params.bonusPerAcre]);
  const nri = useMemo(() => params.mineralInterest * (1 - params.leaseRoyalty), [params]);

  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const metrics = useMemo(() => {
    const valuation = totalBonus * (1 + params.leaseRoyalty * 10);
    const taxImpact = valuation * 0.21;
    return {
      valuation: (valuation / 1e6).toFixed(2),
      tax: (taxImpact / 1e6).toFixed(2),
      status: params.bonusPerAcre > 10000 ? 'Premium' : 'Standard'
    };
  }, [params, totalBonus]);

  const valueData = useMemo(() => [
    { name: 'Bonus Value', value: totalBonus, color: '#3182ce' },
    { name: 'Future Royalty', value: totalBonus * 2.5, color: '#10b981' }
  ], [totalBonus]);

  const handleUpdate = () => {
    setIsUpdating(true);
    setShowSuccess(false);
    setTimeout(() => {
      setIsUpdating(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-8 bg-panel-bg border border-border-subtle rounded-3xl shadow-2xl relative overflow-hidden group mb-8">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Inputs */}
      <div className="lg:col-span-3 space-y-6 relative z-10">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
              <Map size={20} className={cn(isUpdating && "animate-spin")} />
           </div>
           <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Land-AI Terminal</h3>
              <p className="text-[11px] text-slate-500 font-mono uppercase tracking-widest">{isUpdating ? 'Rendering GIS...' : 'Mineral Value Analysis'}</p>
           </div>
        </div>

        <div className="space-y-4">
           <LandInput label="Gross Acres" value={params.grossAcres} unit="ac" min={40} max={1280} onChange={v => setParams({...params, grossAcres: v})} />
           <LandInput label="Mineral Int." value={params.mineralInterest} unit="frac" min={0} max={1} step={0.01} onChange={v => setParams({...params, mineralInterest: v})} />
           <LandInput label="Lease Royalty" value={params.leaseRoyalty} unit="frac" min={0.125} max={0.3} step={0.005} onChange={v => setParams({...params, leaseRoyalty: v})} />
           <LandInput label="Bonus/Acre" value={params.bonusPerAcre} unit="$" min={0} max={25000} step={100} onChange={v => setParams({...params, bonusPerAcre: v})} />
        </div>
      </div>

      {/* Main Stats */}
      <div className="lg:col-span-6 flex flex-col gap-6 relative z-10">
         <div className="grid grid-cols-2 gap-6 flex-1">
            <div className="p-8 bg-black/40 border border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Net Mineral Acres (NMA)</p>
               <h4 className="text-5xl font-black text-white italic tracking-tighter">
                  {formatNumber(nma, 2)}
                  <span className="text-xs text-slate-500 not-italic ml-2">ACRES</span>
               </h4>
               <div className="mt-6 flex items-center gap-2 px-4 py-1.5 bg-brand-primary/10 rounded-full border border-brand-primary/20">
                  <DollarSign size={12} className={cn("text-brand-primary", isUpdating && "animate-bounce")} />
                  <span className="text-[11px] font-black text-brand-primary uppercase italic">Total Bonus: ${formatNumber(totalBonus/1000, 1)}k</span>
               </div>
            </div>

            <div className="p-8 bg-black/40 border border-white/5 rounded-3xl flex flex-col">
               <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Valuation</p>
                  <PieChartIcon size={14} className="text-brand-primary" />
               </div>
               <div className="flex-1 min-h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={valueData}
                           cx="50%"
                           cy="50%"
                           innerRadius={45}
                           outerRadius={65}
                           paddingAngle={5}
                           dataKey="value"
                        >
                           {valueData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                           ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl flex-1 flex flex-col relative overflow-hidden">
             <div className="absolute top-6 left-8 z-10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">GIS Terminal</p>
                <h5 className="text-[11px] font-black text-emerald-400 uppercase italic">Interactive Lease Map</h5>
             </div>
             <div className="flex-1 min-h-[180px]">
                <GISCanvas params={params} isUpdating={isUpdating} />
             </div>
          </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-3 space-y-6 relative z-10">
         <div className="p-6 bg-white/5 border border-white/5 rounded-2xl h-full flex flex-col">
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6 italic">Land Intelligence</h4>
            <div className="space-y-6 flex-1">
               <MetricRow label="Est. Asset Value" value={`$${metrics.valuation}MM`} status="good" />
               <MetricRow label="Tax Liability" value={`$${metrics.tax}MM`} status="warning" />
               <MetricRow label="Market Status" value={metrics.status} status="info" />
            </div>
            
             <button 
               onClick={handleUpdate}
               disabled={isUpdating}
               className={cn(
                 "w-full mt-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2 italic shadow-lg",
                 showSuccess ? "bg-emerald-500 shadow-emerald-500/20" : "bg-brand-primary shadow-brand-primary/20 text-white"
               )}>
                {isUpdating ? 'Analyzing GIS...' : showSuccess ? 'Map Generated' : 'Generate Lease Map'} 
                {!isUpdating && !showSuccess && <ChevronRight size={14} />}
                {isUpdating && <Database size={14} className="animate-spin" />}
                {showSuccess && <ShieldCheck size={14} />}
             </button>
         </div>
      </div>

    </div>
  );
}

function LandInput({ label, value, unit, min, max, step = 1, onChange }: any) {
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
            className="w-full h-1 bg-white/10 rounded-full appearance-none accent-brand-primary cursor-pointer" 
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

function GISCanvas({ params, isUpdating }: any) {
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
      time += 0.02;

      ctx.strokeStyle = '#ffffff05';
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
      }
      for (let i = 0; i < h; i += 20) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
      }

      const centerX = w / 2;
      const centerY = h / 2;
      const size = Math.sqrt(params.grossAcres) * 5;

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(centerX - size/2, centerY - size/2, size, size);
      ctx.setLineDash([]);

      ctx.fillStyle = isUpdating ? '#10b98133' : '#10b98111';
      ctx.fillRect(centerX - size/2, centerY - size/2, size * params.mineralInterest, size);

      if (isUpdating) {
        const scanY = (time * 100) % h;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(w, scanY); ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [params, isUpdating]);

  return <canvas ref={canvasRef} width={600} height={300} className='w-full h-full' />;
}
