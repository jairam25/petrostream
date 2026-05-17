import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  Layers, 
  Activity, 
  Settings2, 
  Grid3X3, 
  Zap,
  ArrowRightCircle,
  AlertCircle,
  Scan,
  Maximize2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { calculateDrainageRadius, calculateRadiusOfInvestigation } from '../../lib/reservoir';

export function WellSpacingTab() {
  const [params, setParams] = useState({
    totalArea: 640,
    wellType: 'Vertical',
    k: 50,
    phi: 0.20,
    mu: 1.0,
    ct: 20e-6,
    testTime: 72, // hours
    spacing: 40 // acres per well
  });

  const spacingStats = useMemo(() => {
    const drainageRadius = calculateDrainageRadius(params.spacing);
    const ri = calculateRadiusOfInvestigation(params.k, params.testTime, params.phi, params.mu, params.ct);
    const isInterfering = ri > drainageRadius;
    const wellCount = Math.floor(params.totalArea / params.spacing);
    
    return { drainageRadius, ri, isInterfering, wellCount };
  }, [params]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Sidebar Controls */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Settings2 size={16} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Drainage Config</h4>
           </div>
           
           <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Well Architecture</label>
                <select 
                  value={params.wellType}
                  onChange={(e) => setParams({...params, wellType: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-[10px] text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                >
                  <option value="Vertical">Vertical</option>
                  <option value="Horizontal (3000ft lateral)">Horizontal (3k ft)</option>
                  <option value="Horizontal (5000ft lateral)">Horizontal (5k ft)</option>
                </select>
              </div>

              <InputWithSlider label="Well Spacing" value={params.spacing} min={10} max={160} step={10} unit="acres/well" onChange={(v) => setParams({...params, spacing: v})} />
              <InputWithSlider label="Permeability (k)" value={params.k} min={1} max={500} step={1} unit="md" onChange={(v) => setParams({...params, k: v})} />
              <InputWithSlider label="Test Time" value={params.testTime} min={12} max={168} step={12} unit="hours" onChange={(v) => setParams({...params, testTime: v})} />
           </div>
        </div>
        
        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-purple-900/40 to-black border-white/5">
           <div className="flex items-center gap-3 mb-6">
              <Grid3X3 size={18} className="text-purple-400" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Flood Pattern</h5>
           </div>
           <div className="grid grid-cols-2 gap-2">
              {['5-Spot', '9-Spot', 'Line Drive', 'Direct Line'].map(p => (
                 <button key={p} className="p-3 bg-white/5 rounded-xl text-[11px] font-black uppercase text-slate-500 hover:text-white border border-white/5">
                    {p}
                 </button>
              ))}
           </div>
        </div>
      </div>

      {/* Speracing Visuals */}
      <div className="lg:col-span-9 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <SpacingMetric 
             label="Drainage Radius" 
             value={spacingStats.drainageRadius.toFixed(0)} 
             unit="ft" 
             icon={<Scan className="text-cyan-500" />} 
             sub="Equivalent Radius (re)"
           />
           <SpacingMetric 
             label="Radius of Investigation" 
             value={spacingStats.ri.toFixed(0)} 
             unit="ft" 
             icon={<Activity className={spacingStats.isInterfering ? "text-red-500" : "text-emerald-500"} />} 
             sub={`Calculated @ ${params.testTime}h`}
             alert={spacingStats.isInterfering ? "Potential Well Interference Detected" : "Independent Drainage Confirmed"}
           />
        </div>

        <div className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] relative overflow-hidden flex flex-col items-center justify-center">
           <div className="absolute top-10 left-10">
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Drainage <span className="text-purple-500">Visualization</span></h3>
              <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic">{params.spacing} Acre Pattern</p>
           </div>

           <div className="relative h-[400px] w-[400px] flex items-center justify-center border border-white/5 rounded-3xl bg-white/[0.02] mt-8">
              {/* Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-10">
                 {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="border border-white/20" />
                 ))}
              </div>

              {/* Target Area */}
              <motion.div 
                animate={{ scale: [0.9, 1.1, 1], opacity: [0.2, 0.4, 0.3] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute inset-0 bg-cyan-500/10 rounded-3xl m-4"
              />

              {/* Well Circle */}
              <div className="relative">
                 {/* Radius of Investigation */}
                 <motion.div 
                   style={{ width: `${spacingStats.ri / 5}px`, height: `${spacingStats.ri / 5}px` }}
                   className={cn(
                     "rounded-full border-2 border-dashed absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all",
                     spacingStats.isInterfering ? "border-red-500/40 bg-red-500/10" : "border-emerald-500/40 bg-emerald-500/10"
                   )}
                 />
                 
                 {/* Drainage Radius */}
                 <div 
                   style={{ width: `${spacingStats.drainageRadius / 5}px`, height: `${spacingStats.drainageRadius / 5}px` }}
                   className="rounded-full border-2 border-white/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                 />

                 {/* Well Symbol */}
                 <div className="h-6 w-6 bg-white rounded-full flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                    <div className="h-1.5 w-1.5 bg-black rounded-full" />
                 </div>
              </div>

              <div className="absolute bottom-6 right-6 text-[10px] text-slate-600 font-mono uppercase tracking-widest font-black">
                 Scale: 1px = 5ft
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 space-y-6">
              <div className="flex items-center gap-3">
                 <Target size={20} className="text-cyan-500" />
                 <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Development Stats</h4>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Optimal Wells</span>
                    <span className="text-lg font-black text-white">{spacingStats.wellCount}</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Area</span>
                    <span className="text-lg font-black text-white">{params.totalArea} Acres</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Infill Capacity</span>
                    <span className="text-lg font-black text-emerald-500">{(spacingStats.wellCount * 0.25).toFixed(0)} slots</span>
                 </div>
              </div>
           </div>

           <div className="glass-card rounded-3xl p-10 border-white/5 bg-black/40 flex flex-col justify-between">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <AlertCircle size={20} className="text-amber-500" />
                    <h4 className="text-xs font-black text-white uppercase italic tracking-widest">Engineering Note</h4>
                 </div>
                 <p className="text-[11px] text-slate-500 leading-relaxed italic">
                    Radius of investigation (ri) is time-dependent. Over long periods, ri will eventually exceed drainage boundaries (re), marking the transition from transient to boundary-dominated flow. Spacing optimization balances incremental EUR vs Capex per well.
                 </p>
              </div>
              <button className="flex items-center justify-between w-full p-6 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all group">
                 <span className="text-[11px] font-black text-white uppercase tracking-widest">Run Areal Sweep Calc</span>
                 <ArrowRightCircle className="text-cyan-500 group-hover:translate-x-2 transition-transform" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function SpacingMetric({ label, value, unit, icon, sub, alert }: { label: string, value: string, unit: string, icon: React.ReactNode, sub: string, alert?: string }) {
  return (
    <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40 relative overflow-hidden group">
       <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             {icon}
             <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
          </div>
       </div>
       <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-black text-white italic tracking-tighter uppercase">{value}</span>
          <span className="text-[10px] font-bold text-slate-600 uppercase">{unit}</span>
       </div>
       <div className="flex justify-between items-center mt-4">
          <p className="text-[11px] text-slate-600 font-mono uppercase tracking-widest font-black italic">{sub}</p>
          {alert && (
            <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                alert.includes("Detected") ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            )}>
                {alert}
            </span>
          )}
       </div>
    </div>
  );
}
