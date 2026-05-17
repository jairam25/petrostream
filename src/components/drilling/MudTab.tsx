import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FlaskConical, Droplets, Target, RefreshCcw, ArrowRight, Gauge, Layers, Info, History,
  TrendingUp, Scaling, Box, Activity, ShieldCheck, Thermometer, Waves
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { calculateHydrostaticPressure, calculateECD, calculateBariteWeightUp, calculateKickTolerance, calculateStickingForce } from '../../lib/drilling';
import { MUD_SYSTEM_SELECTION, MUD_TEST_STANDARDS } from '../../lib/drilling_data';
import { SectionHeader, DataRow, InputWithSlider } from '../SharedUI';

interface MudTabProps {
  mudInp: any;
  setMudInp: (val: any) => void;
  hydraulicsInp: any;
}

export const MudTab: React.FC<MudTabProps> = ({ 
  mudInp, 
  setMudInp,
  hydraulicsInp
}) => {
  const [activeView, setActiveView] = useState<'rheology' | 'weightup' | 'lab'>('rheology');

  const currentDepthFt = (hydraulicsInp.dpLength + hydraulicsInp.dcLength) * 3.28;
  const hydrostatic = calculateHydrostaticPressure(mudInp.currentMW, currentDepthFt);
  const ecd = calculateECD(mudInp.currentMW, mudInp.annLoss, currentDepthFt);
  const barite = calculateBariteWeightUp(mudInp.volume, mudInp.targetMW, mudInp.currentMW);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-4">
            <FlaskConical className="text-cyan-500" size={36} />
            Fluid <span className="text-cyan-500/50">Rheology Terminal</span>
          </h2>
          <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-widest italic">API RP 13B-1/2 Drilling Fluid Analysis Engine</p>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit backdrop-blur-md">
          {[
            { id: 'rheology', name: 'Fluid Mechanics', icon: Waves },
            { id: 'weightup', name: 'Mixing & Weight', icon: Scaling },
            { id: 'lab', name: 'API Lab Tests', icon: FlaskConical }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveView(t.id as any)}
              className={cn(
                "px-6 py-2.5 rounded-[14px] flex items-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest",
                activeView === t.id 
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
              <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-8 italic">Fluid Properties</h4>
              <div className="space-y-8">
                 <InputWithSlider label="Mud Weight" value={mudInp.currentMW} min={8.33} max={22} step={0.1} unit="ppg" onChange={v => setMudInp({...mudInp, currentMW: v})} />
                 <InputWithSlider label="Plastic Viscosity" value={mudInp.pv} min={5} max={100} step={1} unit="cP" onChange={v => setMudInp({...mudInp, pv: v})} />
                 <InputWithSlider label="Yield Point" value={mudInp.yp} min={5} max={100} step={1} unit="lb/100" onChange={v => setMudInp({...mudInp, yp: v})} />
              </div>
           </div>

           <div className="p-10 bg-cyan-600/10 rounded-3xl border border-cyan-500/20 text-center shadow-lg shadow-cyan-500/5">
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2 italic">Hydrostatic at Bit</p>
              <p className="text-5xl font-black text-white italic tracking-tighter">
                {Math.round(hydrostatic)} <span className="text-xl text-slate-500 not-italic">PSI</span>
              </p>
           </div>
           
           <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40">
              <div className="flex justify-between items-center mb-4">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">YP/PV Ratio</h4>
                 <span className="text-[11px] font-black text-cyan-400 italic">{(mudInp.yp / mudInp.pv).toFixed(2)}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (mudInp.yp / mudInp.pv) * 40)}%` }}
                    className="h-full bg-cyan-500"
                 />
              </div>
           </div>
        </div>

        {/* Center Display Area */}
        <div className="lg:col-span-9 h-full">
           <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full"
              >
                 {activeView === 'rheology' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                       <div className="lg:col-span-8 flex flex-col gap-8">
                          <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[550px] flex items-center justify-center relative overflow-hidden">
                             <FluidRheology3D pv={mudInp.pv} yp={mudInp.yp} />
                          </div>
                          <div className="grid grid-cols-3 gap-6">
                             <ResultCard label="ECD Static" value={mudInp.currentMW.toFixed(1)} unit="ppg" />
                             <ResultCard label="ECD Dynamic" value={ecd.toFixed(2)} unit="ppg" />
                             <ResultCard label="Kick Tolerance" value="42" unit="bbl" />
                          </div>
                       </div>
                       <div className="lg:col-span-4 space-y-6">
                          <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                             <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-8 italic">Fluid Systems</h4>
                             <div className="space-y-3">
                                {MUD_SYSTEM_SELECTION.map((system, i) => (
                                   <div key={i} className="p-5 border border-white/5 rounded-3xl bg-white/5 flex flex-col gap-2 group hover:border-cyan-500/30 transition-all cursor-help">
                                      <div className="flex justify-between items-center">
                                         <span className="text-[11px] font-black text-white uppercase italic">{system.name}</span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 italic leading-relaxed">{system.usage}</p>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeView === 'weightup' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                       <div className="lg:col-span-8 flex flex-col gap-8">
                          <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[550px] flex items-center justify-center relative overflow-hidden">
                             <BariteWeightUp3D current={mudInp.currentMW} target={mudInp.targetMW} sacks={barite} />
                          </div>
                          <div className="p-8 bg-cyan-600/10 border border-cyan-500/20 rounded-3xl text-center shadow-lg shadow-cyan-500/5">
                             <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2 italic">Barite Required</p>
                             <p className="text-6xl font-black text-white italic tracking-tighter">
                                {Math.round(barite).toLocaleString()} <span className="text-xl text-slate-500 not-italic">SACKS</span>
                             </p>
                          </div>
                       </div>
                       <div className="lg:col-span-4 space-y-6">
                          <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                             <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-8 italic">Weight Control</h4>
                             <div className="space-y-8">
                                <InputWithSlider label="Target Weight" value={mudInp.targetMW} min={9} max={18} step={0.1} unit="ppg" onChange={v => setMudInp({...mudInp, targetMW: v})} />
                                <InputWithSlider label="Active Volume" value={mudInp.volume} min={100} max={5000} step={10} unit="bbl" onChange={v => setMudInp({...mudInp, volume: v})} />
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeView === 'lab' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                       <div className="lg:col-span-12 glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] min-h-[600px]">
                          <SectionHeader title="API Standard Mud Test Lab" subtitle="Industry Reference Values & Specifications" />
                          <div className="overflow-x-auto mt-12 custom-scrollbar">
                             <table className="w-full text-left border-collapse">
                                <thead>
                                   <tr className="border-b border-white/10">
                                      <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Test Parameter</th>
                                      <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit</th>
                                      <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Reference Range</th>
                                      <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Status</th>
                                   </tr>
                                </thead>
                                <tbody>
                                   {MUD_TEST_STANDARDS.map((test, i) => (
                                      <tr key={i} className="border-b border-white/5 group hover:bg-white/5 transition-colors">
                                         <td className="py-5 text-[11px] font-black text-white uppercase italic">{test.test}</td>
                                         <td className="py-5 text-[10px] text-cyan-400 font-mono">{test.unit}</td>
                                         <td className="py-5 text-[10px] text-slate-500 italic">{test.normal || test.good || "N/A"}</td>
                                         <td className="py-5 text-right">
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-widest">Compliant</span>
                                         </td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
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

function FluidRheology3D({ pv, yp }: { pv: number, yp: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full">
      <g transform="translate(250, 200)">
         {/* Pipe Cross Section */}
         <circle r="120" fill="none" stroke="#ffffff10" strokeWidth="2" />
         <circle r="80" fill="none" stroke="#ffffff05" strokeWidth="1" strokeDasharray="5,5" />
         
         {/* Flow Velocity Profile (Laminar/Turbulent) */}
         {[...Array(8)].map((_, i) => (
            <motion.path 
               key={i}
               d={`M -120 ${-140 + i*40} Q 0 ${-140 + i*40 + (yp/5)} 120 ${-140 + i*40}`}
               fill="none" stroke="#06b6d4" strokeWidth="2" strokeOpacity={0.2}
               animate={{ 
                  d: [`M -120 ${-140 + i*40} Q 0 ${-140 + i*40 + (yp/10)} 120 ${-140 + i*40}`, `M -120 ${-140 + i*40} Q 100 ${-140 + i*40 + (yp/10)} 120 ${-140 + i*40}`, `M -120 ${-140 + i*40} Q 0 ${-140 + i*40 + (yp/10)} 120 ${-140 + i*40}`]
               }}
               transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
         ))}

         {/* Gel Strength Pulse */}
         <motion.circle 
           r="150" fill="none" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.1"
           animate={{ scale: [0.8, 1.2, 0.8], opacity: [0, 0.3, 0] }}
           transition={{ repeat: Infinity, duration: 3 }}
         />
      </g>
      <text x="250" y="380" fill="#06b6d4" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Bingham Plastic & Power Law Flow Simulation</text>
    </svg>
  );
}

function BariteWeightUp3D({ current, target, sacks }: { current: number, target: number, sacks: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full">
      <g transform="translate(150, 50)">
         {/* Active Pit */}
         <rect x="0" y="0" width="200" height="250" fill="#1e293b" fillOpacity="0.3" rx="10" />
         
         {/* Mud Level */}
         <motion.rect 
            x="0" y={250 - (current/20)*250} width="200" height={(current/20)*250}
            fill="#475569" fillOpacity="0.4" rx="4"
            animate={{ height: (target/20)*250, y: 250 - (target/20)*250 }}
         />
         
         {/* Barite Addition (Particles) */}
         {[...Array(15)].map((_, i) => (
            <motion.rect 
               key={i} width="4" height="4" fill="#ffffff"
               initial={{ x: 80 + Math.random()*40, y: -20 }}
               animate={{ 
                  y: 250,
                  opacity: [0, 1, 0],
                  rotate: 360
               }}
               transition={{ repeat: Infinity, duration: 1.5, delay: i*0.2 }}
            />
         ))}
      </g>
      <text x="250" y="380" fill="#06b6d4" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Dynamic Mud Weight & Barite Mixing Kinetics</text>
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
