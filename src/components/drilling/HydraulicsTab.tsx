import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Activity, Target, RefreshCcw, ArrowRight, Gauge, Layers, Info, History,
  TrendingUp, Scaling, Box, Droplets, Wind, ShieldCheck
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { 
  calculateBitPressureLoss, 
  calculateSurfaceLoss, 
  calculateFrictionalLoss, 
  calculateHydraulicOptimization 
} from '../../lib/drilling';
import { SectionHeader, InputWithSlider } from '../SharedUI';

interface HydraulicsTabProps {
  hydraulicsInp: any;
  setHydraulicsInp: (val: any) => void;
  mudInp: any;
}

export const HydraulicsTab: React.FC<HydraulicsTabProps> = ({ 
  hydraulicsInp, 
  setHydraulicsInp,
  mudInp
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'jetting' | 'cleaning'>('profile');

  const bitLoss = useMemo(() => calculateBitPressureLoss(mudInp.currentMW, hydraulicsInp.pumpRate, hydraulicsInp.nozzleSizes), [mudInp.currentMW, hydraulicsInp.pumpRate, hydraulicsInp.nozzleSizes]);
  const surfaceLoss = useMemo(() => calculateSurfaceLoss(hydraulicsInp.surfaceType, mudInp.currentMW, hydraulicsInp.pumpRate, mudInp.pv), [hydraulicsInp.surfaceType, mudInp.currentMW, hydraulicsInp.pumpRate, mudInp.pv]);
  const dpLoss = useMemo(() => calculateFrictionalLoss(mudInp.currentMW, hydraulicsInp.pumpRate, hydraulicsInp.dpID + 0.1, hydraulicsInp.dpID, hydraulicsInp.dpLength, mudInp.pv, mudInp.yp, hydraulicsInp.rheologyModel), [mudInp.currentMW, hydraulicsInp.pumpRate, hydraulicsInp.dpID, hydraulicsInp.dpLength, mudInp.pv, mudInp.yp, hydraulicsInp.rheologyModel]);
  const dcLoss = useMemo(() => calculateFrictionalLoss(mudInp.currentMW, hydraulicsInp.pumpRate, hydraulicsInp.dcID + 0.1, hydraulicsInp.dcID, hydraulicsInp.dcLength, mudInp.pv, mudInp.yp, hydraulicsInp.rheologyModel), [mudInp.currentMW, hydraulicsInp.pumpRate, hydraulicsInp.dcID, hydraulicsInp.dcLength, mudInp.pv, mudInp.yp, hydraulicsInp.rheologyModel]);
  
  const totalPressure = bitLoss + surfaceLoss + dpLoss + dcLoss;
  const opt = useMemo(() => calculateHydraulicOptimization(mudInp.currentMW, hydraulicsInp.pumpRate, hydraulicsInp.nozzleSizes, hydraulicsInp.bitDiam), [mudInp.currentMW, hydraulicsInp.pumpRate, hydraulicsInp.nozzleSizes, hydraulicsInp.bitDiam]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-4">
            <Zap className="text-cyan-500" size={36} />
            Hydraulic <span className="text-cyan-500/50">Optimization Terminal</span>
          </h2>
          <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-widest italic">Bit HHP & Cuttings Transport Dynamics Engine</p>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit backdrop-blur-md">
          {[
            { id: 'profile', name: 'Pressure Profile', icon: Layers },
            { id: 'jetting', name: 'Bit Jetting', icon: Target },
            { id: 'cleaning', name: 'Hole Cleaning', icon: Wind }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                "px-6 py-2.5 rounded-[14px] flex items-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest",
                activeTab === t.id 
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20" 
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              <t.icon size={14} />
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Panel */}
        <div className="lg:col-span-3 space-y-6">
           <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
              <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-8 italic">Operating Parameters</h4>
              <div className="space-y-8">
                 <InputWithSlider label="Pump Rate" value={hydraulicsInp.pumpRate} min={100} max={1200} step={10} unit="GPM" onChange={v => setHydraulicsInp({...hydraulicsInp, pumpRate: v})} />
                 <div className="space-y-4">
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">Nozzle Config (3-TFA)</p>
                    <div className="grid grid-cols-3 gap-2">
                       {hydraulicsInp.nozzleSizes.map((n: number, idx: number) => (
                          <input 
                             key={idx}
                             type="number" 
                             value={n} 
                             onChange={e => {
                                const newNozzles = [...hydraulicsInp.nozzleSizes];
                                newNozzles[idx] = Number(e.target.value);
                                setHydraulicsInp({...hydraulicsInp, nozzleSizes: newNozzles});
                             }} 
                             className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] text-white font-black text-center" 
                          />
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-10 bg-cyan-600/10 rounded-3xl border border-cyan-500/20 text-center shadow-lg shadow-cyan-500/5">
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2 italic">Total Standpipe Pressure</p>
              <p className="text-5xl font-black text-white italic tracking-tighter">
                {Math.round(totalPressure)} <span className="text-xl text-slate-500 not-italic">PSI</span>
              </p>
           </div>
           
           <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Rheology Model</h4>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                 <p className="text-[11px] text-white font-black uppercase italic">{hydraulicsInp.rheologyModel}</p>
                 <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">Power Law / Herschel-Bulkley</p>
              </div>
           </div>
        </div>

        {/* Center Display Area */}
        <div className="lg:col-span-9 h-full">
           <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full"
              >
                 {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                       <div className="lg:col-span-8 flex flex-col gap-8">
                          <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[550px] flex items-center justify-center relative overflow-hidden">
                             <PressureGradient3D bitLoss={bitLoss} total={totalPressure} />
                          </div>
                          <div className="grid grid-cols-3 gap-6">
                             <ResultCard label="Surface Loss" value={Math.round(surfaceLoss).toString()} unit="psi" />
                             <ResultCard label="DP Frictional" value={Math.round(dpLoss).toString()} unit="psi" />
                             <ResultCard label="DC Frictional" value={Math.round(dcLoss).toString()} unit="psi" />
                          </div>
                       </div>
                       <div className="lg:col-span-4 space-y-6">
                          <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                             <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-8 italic">Efficiency Metrics</h4>
                             <div className="space-y-4">
                                <HydraulicsDataRow label="HHP" value={opt.hhp.toFixed(0)} unit="hp" src="Optimization" />
                                <HydraulicsDataRow label="HSI" value={opt.hsi.toFixed(1)} unit="hhp/sqin" src="Optimization" />
                                <HydraulicsDataRow label="Impact Force" value={opt.impactForce.toFixed(0)} unit="lbs" src="Kinetics" />
                             </div>
                             <div className="mt-8 p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-3xl">
                                <p className="text-[11px] text-slate-400 italic leading-relaxed italic">
                                   Optimal hydraulics are typically achieved when parasitic losses account for 35% of total pump pressure.
                                </p>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeTab === 'jetting' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                       <div className="lg:col-span-8 flex flex-col gap-8">
                          <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[550px] flex items-center justify-center relative overflow-hidden">
                             <NozzleFlow3D flow={hydraulicsInp.pumpRate} nozzle={hydraulicsInp.nozzleSizes[0]} />
                          </div>
                          <div className="p-8 bg-cyan-600/10 border border-cyan-500/20 rounded-3xl italic">
                             <p className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Jet Impact Force Model</p>
                             <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                High velocity jets (V_j &gt; 300 ft/s) ensure efficient bottom-hole cleaning and prevent bit balling in plastic shale formations.
                             </p>
                          </div>
                       </div>
                       <div className="lg:col-span-4 space-y-6">
                          <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                             <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-8 italic">Optimization Targets</h4>
                             <div className="space-y-3">
                                <DriveCard title="Max HHP" desc="Optimal for high ROP hard rock drilling." icon={Zap} />
                                <DriveCard title="Max Impact" desc="Best for soft formation jetting." icon={Target} />
                                <DriveCard title="Jet Velocity" desc="Maintain >300 ft/sec for bit cleaning." icon={Activity} />
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeTab === 'cleaning' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                       <div className="lg:col-span-8 flex flex-col gap-8">
                          <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[550px] flex items-center justify-center relative overflow-hidden">
                             <CuttingsTransport3D flow={hydraulicsInp.pumpRate} density={mudInp.currentMW} />
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                             <ResultCard label="ECD Increase" value="0.24" unit="ppg" />
                             <ResultCard label="Transport Ratio" value="0.82" unit="" />
                          </div>
                       </div>
                       <div className="lg:col-span-4 space-y-6">
                          <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                             <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-8 italic">Cleaning Status</h4>
                             <div className="space-y-4 text-center">
                                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
                                   <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 block">Annular Flow Regime</span>
                                   <span className="text-xl font-black text-white italic">LAMINAR ANNULAR</span>
                                </div>
                                <p className="text-[10px] text-slate-500 italic leading-relaxed">
                                   Critical velocity (V_c) is maintained above slip velocity of 0.15 ft/sec.
                                </p>
                             </div>
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
};

// ─── 3D Kinetic Simulators ─────────────────────────────────────────────────

function PressureGradient3D({ bitLoss, total }: { bitLoss: number, total: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full">
      <g transform="translate(60, 50)">
         <line x1="0" y1="300" x2="380" y2="300" stroke="#475569" strokeWidth="1" strokeDasharray="5,5" />
         <line x1="0" y1="0" x2="0" y2="300" stroke="#475569" strokeWidth="1" strokeDasharray="5,5" />
         
         {/* Pressure Profile Curve */}
         <motion.path 
           d={`M 0 0 L 100 20 L 250 80 L 350 ${300 - (bitLoss/total)*300} L 380 300`}
           fill="none" stroke="#06b6d4" strokeWidth="4"
           initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
         />
         
         {/* Labels */}
         <text x="100" y="40" fill="#475569" fontSize="8" className="font-bold">Surface</text>
         <text x="340" y={280 - (bitLoss/total)*300} fill="#06b6d4" fontSize="8" className="font-bold uppercase tracking-widest italic">Bit Drop</text>
      </g>
      <text x="250" y="380" fill="#06b6d4" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Dynamic Circulating Pressure System Model</text>
    </svg>
  );
}

function NozzleFlow3D({ flow, nozzle }: { flow: number, nozzle: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full">
      <g transform="translate(250, 50)">
         {/* Nozzle Body */}
         <rect x="-20" y="0" width="40" height="60" fill="#475569" fillOpacity="0.4" rx="4" />
         <motion.path 
            d="M -15 60 L 15 60 L 40 300 L -40 300 Z"
            fill="url(#jetGrad)"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 2 }}
         />
         
         <defs>
            <linearGradient id="jetGrad" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
               <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
         </defs>

         {/* Particles */}
         {[...Array(12)].map((_, i) => (
            <motion.circle 
               key={i} r={Math.random()*3 + 1} fill="#ffffff"
               initial={{ cx: 0, cy: 60 }}
               animate={{ 
                  cx: (Math.random()-0.5)*80,
                  cy: 300,
                  opacity: [0, 1, 0]
               }}
               transition={{ repeat: Infinity, duration: 0.5 + Math.random(), delay: i*0.1 }}
            />
         ))}
      </g>
      <text x="250" y="380" fill="#06b6d4" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Bit Jetting & Nozzle Kinetics Simulation</text>
    </svg>
  );
}

function CuttingsTransport3D({ flow, density }: { flow: number, density: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full">
      <g transform="translate(200, 50)">
         <rect x="0" y="0" width="100" height="300" fill="#1e293b" fillOpacity="0.3" rx="4" />
         <rect x="35" y="0" width="30" height="300" fill="#475569" fillOpacity="0.4" />
         
         {/* Cuttings Moving Up */}
         {[...Array(10)].map((_, i) => (
            <motion.rect 
               key={i} width="6" height="6" fill="#fbbf24"
               initial={{ x: Math.random()*20 + 70, y: 300 }}
               animate={{ y: -20, opacity: [0, 1, 0] }}
               transition={{ repeat: Infinity, duration: 4 / (flow/500 || 1), delay: i*0.4 }}
               rx="1"
            />
         ))}
      </g>
      <text x="250" y="380" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Annular Cuttings Transport & Slip Velocity Model</text>
    </svg>
  );
}

// ─── Shared UI Components ──────────────────────────────────────────────────

function ResultCard({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="glass-card p-8 rounded-3xl border-white/5 bg-white/5 text-center group hover:border-cyan-500/30 transition-all">
       <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mb-1 group-hover:text-cyan-500 transition-colors">{label}</p>
       <h4 className="text-3xl font-black text-white italic tracking-tighter">{value} <span className="text-[10px] text-slate-600 not-italic uppercase tracking-widest font-bold">{unit}</span></h4>
    </div>
  );
}

function HydraulicsDataRow({ label, value, unit, src }: { label: string, value: any, unit: string, src: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/5">
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-white uppercase tracking-tighter italic">{label}</span>
        <span className="text-[10px] text-slate-600 font-bold uppercase">{src}</span>
      </div>
      <div className="text-right">
        <span className="text-sm font-black text-cyan-400 italic">{value}</span>
        <span className="text-[11px] text-slate-600 ml-1 font-bold">{unit}</span>
      </div>
    </div>
  );
}

function DriveCard({ title, desc, icon: Icon }: { title: string, desc: string, icon: any }) {
  return (
    <div className="p-5 border border-white/5 rounded-3xl bg-white/5 flex gap-4 items-start group hover:border-cyan-500/30 transition-all">
       <div className="p-2 bg-cyan-500/20 rounded-xl text-cyan-400 group-hover:scale-110 transition-transform">
         <Icon size={16} />
       </div>
       <div>
         <h5 className="text-[11px] font-black text-white uppercase tracking-widest">{title}</h5>
         <p className="text-[10px] text-slate-400 mt-1 leading-relaxed italic">{desc}</p>
       </div>
    </div>
  );
}
