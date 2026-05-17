import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, Info, BookOpen, Droplet, Zap, Activity, Clock,
  ShieldAlert, RefreshCcw, ArrowRight, Gauge, Layers, Scaling,
  Target,
  Wind, CloudFog
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  calculateKillMudWeight, 
  calculateInitialCirculatingPressure, 
  calculateFinalCirculatingPressure, 
  calculateMASP, 
  identifyInfluxType, 
  generateWWSchedule 
} from '../../lib/drilling';
import { WELL_CONTROL_REFERENCE } from '../../lib/safety_environmental_data';
import { InputWithSlider, SectionHeader, DataRow } from '../SharedUI';

interface WellControlTabProps {
  wellControlInp: any;
  setWellControlInp: (val: any) => void;
  mudInp: any;
  hydraulicsInp: any;
}

export const WellControlTab: React.FC<WellControlTabProps> = ({ 
  wellControlInp, 
  setWellControlInp, 
  mudInp,
  hydraulicsInp
}) => {
  const tvd_ft = (hydraulicsInp.dpLength + hydraulicsInp.dcLength) * 3.28;
  const kmw = calculateKillMudWeight(mudInp.currentMW, wellControlInp.sidpp, tvd_ft);
  const icp = calculateInitialCirculatingPressure(wellControlInp.sidpp, wellControlInp.scrp);
  const fcp = calculateFinalCirculatingPressure(kmw, mudInp.currentMW, wellControlInp.scrp);
  const masp = calculateMASP(7000, mudInp.currentMW, mudInp.shoeTVD);

  const [activeMode, setActiveMode] = useState<'kick' | 'kill' | 'migration'>('kick');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-4">
            <ShieldAlert className="text-rose-500" size={36} />
            Well Control <span className="text-rose-500/50">& Kick Terminal</span>
          </h2>
          <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-widest italic">Wait & Weight / Driller's Method Optimization Engine</p>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit backdrop-blur-md">
          {[
            { id: 'kick', name: 'Kick Diagnostic', icon: Activity },
            { id: 'kill', name: 'Kill Operation', icon: RefreshCcw },
            { id: 'migration', name: 'Gas Migration', icon: Wind }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveMode(t.id as any)}
              className={cn(
                "px-6 py-2.5 rounded-[14px] flex items-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest",
                activeMode === t.id 
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-500/20" 
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
              <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-8 italic">Observation Data</h4>
              <div className="space-y-8">
                 <InputWithSlider label="SIDPP" value={wellControlInp.sidpp} min={0} max={2000} step={10} unit="psi" onChange={v => setWellControlInp({...wellControlInp, sidpp: v})} />
                 <InputWithSlider label="SICP" value={wellControlInp.sicp} min={0} max={3000} step={10} unit="psi" onChange={v => setWellControlInp({...wellControlInp, sicp: v})} />
                 <InputWithSlider label="Pits Gain" value={wellControlInp.pitsGain} min={1} max={100} step={1} unit="bbl" onChange={v => setWellControlInp({...wellControlInp, pitsGain: v})} />
              </div>
           </div>

           <div className="p-10 bg-rose-600/10 rounded-3xl border border-rose-500/20 text-center shadow-lg shadow-rose-500/5">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 italic">Kill Mud Weight (KMW)</p>
              <p className="text-5xl font-black text-white italic tracking-tighter">
                {kmw.toFixed(2)} <span className="text-xl text-slate-500 not-italic">PPG</span>
              </p>
           </div>
           
           <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40">
              <div className="flex justify-between items-center mb-4">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Influx Type</h4>
                 <span className="text-[10px] font-black text-rose-500 italic uppercase">{identifyInfluxType(wellControlInp.sidpp, wellControlInp.sicp, wellControlInp.pitsGain, 500)}</span>
              </div>
              <p className="text-[10px] text-slate-500 italic leading-relaxed">
                 Identification based on pressure differential (SICP - SIDPP) and influx intensity.
              </p>
           </div>
        </div>

        {/* Center Display Area */}
        <div className="lg:col-span-9 h-full">
           <AnimatePresence mode="wait">
              <motion.div
                key={activeMode}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="h-full"
              >
                 {activeMode === 'kick' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                       <div className="lg:col-span-8 flex flex-col gap-8">
                          <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[500px] flex items-center justify-center relative overflow-hidden">
                             <KickDetection3D intensity={wellControlInp.pitsGain} />
                          </div>
                          <div className="grid grid-cols-3 gap-6">
                             <ResultCard label="ICP" value={icp.toFixed(0)} unit="psi" />
                             <ResultCard label="FCP" value={fcp.toFixed(0)} unit="psi" />
                             <ResultCard label="MASP" value={masp.toFixed(0)} unit="psi" />
                          </div>
                       </div>
                       <div className="lg:col-span-4 space-y-6">
                          <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                             <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-6 italic">Indicator Reference</h4>
                             <div className="grid grid-cols-1 gap-2">
                                {WELL_CONTROL_REFERENCE.kickIndicators.map((k, i) => (
                                   <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-rose-500/30 transition-all">
                                      <span className="text-[11px] font-black text-white uppercase italic">{k.label}</span>
                                      <span className={cn("text-[10px] font-bold uppercase", k.category === 'Primary' ? "text-rose-500" : "text-amber-500")}>{k.category}</span>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeMode === 'kill' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                       <div className="lg:col-span-8 flex flex-col gap-8">
                          <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[550px] flex items-center justify-center relative overflow-hidden">
                             <PressureSchedule3D icp={icp} fcp={fcp} />
                          </div>
                          <div className="p-8 bg-rose-600/10 border border-rose-500/20 rounded-3xl italic">
                             <p className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Wait & Weight Profile</p>
                             <p className="text-[11px] text-slate-400 leading-relaxed">
                                Calculated pressure decline schedule based on strokes to bit. Ensures bottom hole pressure remains above pore pressure during kmw displacement.
                             </p>
                          </div>
                       </div>
                       <div className="lg:col-span-4 space-y-6">
                          <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                             <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-8 italic">Kill Methods</h4>
                             <div className="space-y-4">
                                {WELL_CONTROL_REFERENCE.killMethods.map((method, idx) => (
                                   <div key={idx} className="p-5 border border-white/5 rounded-3xl bg-white/5 flex flex-col gap-2 group hover:border-rose-500/30 transition-all">
                                      <div className="flex justify-between items-center">
                                         <span className="text-[11px] font-black text-white uppercase italic">{method.name}</span>
                                         <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{method.logic}</span>
                                      </div>
                                      <p className="text-[11px] text-slate-400 italic">Pros: {method.pros}</p>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeMode === 'migration' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                       <div className="lg:col-span-8 flex flex-col gap-8">
                          <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[500px] flex items-center justify-center relative overflow-hidden">
                             <GasMigrationSimulator3D pInc={wellControlInp.migrationIncrease} time={wellControlInp.migrationTime} mw={mudInp.currentMW} />
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                             <ResultCard label="Migration Rate" value={Math.round((wellControlInp.migrationIncrease / (0.052 * mudInp.currentMW)) / (wellControlInp.migrationTime / 60)).toString()} unit="ft/hr" />
                             <ResultCard label="Expansion Factor" value="2.4" unit="vol/vol" />
                          </div>
                       </div>
                       <div className="lg:col-span-4 space-y-6">
                          <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                             <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-8 italic">Migration Inputs</h4>
                             <div className="space-y-6">
                                <InputWithSlider label="Pressure Increase" value={wellControlInp.migrationIncrease} min={0} max={500} step={10} unit="psi" onChange={v => setWellControlInp({...wellControlInp, migrationIncrease: v})} />
                                <InputWithSlider label="Observation Time" value={wellControlInp.migrationTime} min={10} max={120} step={5} unit="min" onChange={v => setWellControlInp({...wellControlInp, migrationTime: v})} />
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

function KickDetection3D({ intensity }: { intensity: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full">
      <g transform="translate(150, 50)">
         {/* Wellbore Annulus */}
         <rect x="0" y="0" width="100" height="300" fill="#1e293b" fillOpacity="0.3" rx="10" />
         <rect x="30" y="0" width="40" height="300" fill="#475569" fillOpacity="0.4" />
         
         {/* Influx Bubbles */}
         {[...Array(Math.floor(intensity/5) + 5)].map((_, i) => (
            <motion.circle 
               key={i} r={Math.random()*8 + 4} fill="#f43f5e" fillOpacity="0.6"
               initial={{ cx: Math.random()*100, cy: 280 + Math.random()*20 }}
               animate={{ 
                  cy: [-20, 300], 
                  opacity: [0, 0.8, 0],
                  scale: [1, 1.5, 1]
               }}
               transition={{ repeat: Infinity, duration: 4, delay: i*0.5 }}
            />
         ))}
         
         {/* Bottom Hole Influx */}
         <motion.path 
            d="M 0 300 Q 50 250 100 300 Z"
            fill="#f43f5e" fillOpacity="0.4"
            animate={{ d: ["M 0 300 Q 50 250 100 300 Z", "M 0 300 Q 50 200 100 300 Z", "M 0 300 Q 50 250 100 300 Z"] }}
            transition={{ repeat: Infinity, duration: 2 }}
         />
      </g>
      <text x="250" y="380" fill="#f43f5e" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Bottom Hole Influx & Annular Displacement Simulation</text>
    </svg>
  );
}

function PressureSchedule3D({ icp, fcp }: { icp: number, fcp: number }) {
  const schedule = generateWWSchedule(icp, fcp, 20);
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
      <g transform="translate(60, 50)">
        <line x1="0" y1="300" x2="380" y2="300" stroke="#475569" strokeWidth="1" strokeDasharray="5,5" />
        <line x1="0" y1="0" x2="0" y2="300" stroke="#475569" strokeWidth="1" strokeDasharray="5,5" />
        
        {/* Pressure Decline Path */}
        <motion.path 
          d={schedule.reduce((acc, p, i) => {
             const px = (i / 19) * 380;
             const py = 300 - (p.pressure / icp) * 250;
             return i === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
          }, "")}
          fill="none" stroke="#f43f5e" strokeWidth="4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
        />

        {/* Current Position Marker */}
        <motion.circle 
           r="6" fill="#ffffff" cx="0" cy={300 - (icp/icp)*250}
           animate={{ x: [0, 380, 0] }} transition={{ repeat: Infinity, duration: 10 }}
        />
      </g>
      <text x="250" y="380" fill="#f43f5e" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Wait & Weight Step-Down Pressure Profile</text>
    </svg>
  );
}

function GasMigrationSimulator3D({ pInc, time, mw }: { pInc: number, time: number, mw: number }) {
  const rate = (pInc / (0.052 * mw)) / (time / 60);
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full">
      <g transform="translate(200, 50)">
         <rect x="0" y="0" width="100" height="300" fill="#1e293b" fillOpacity="0.2" rx="4" />
         
         {/* Migrating Gas Slug */}
         <motion.g animate={{ y: [-200, 50] }} transition={{ repeat: Infinity, duration: 10 / (rate/1000 || 1), ease: "linear" }}>
            <ellipse cx="50" cy="200" rx="40" ry="15" fill="#f43f5e" fillOpacity="0.4" stroke="#f43f5e" strokeWidth="2" />
            <motion.path 
               d="M 50 185 Q 70 150 50 130 Q 30 150 50 185" 
               fill="#f43f5e" fillOpacity="0.2"
               animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}
            />
         </motion.g>
      </g>
      <text x="250" y="380" fill="#f43f5e" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Gas Migration Velocity & Expansion Kinetics</text>
    </svg>
  );
}

// ─── Shared UI Components ──────────────────────────────────────────────────

function ResultCard({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="glass-card p-8 rounded-3xl border-white/5 bg-white/5 text-center group hover:border-rose-500/30 transition-all">
       <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mb-1 group-hover:text-rose-500 transition-colors">{label}</p>
       <h4 className="text-3xl font-black text-white italic tracking-tighter">{value} <span className="text-[10px] text-slate-600 not-italic uppercase tracking-widest font-bold">{unit}</span></h4>
    </div>
  );
}
