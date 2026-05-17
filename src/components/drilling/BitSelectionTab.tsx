import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FlaskConical, ShieldAlert, ShieldCheck, Dna, Grid3X3, Database, Wrench, Activity, 
  Target, Zap, RefreshCcw, ArrowRight, Gauge, Layers, Info, History,
  TrendingUp, Scaling, Box
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { BIT_DATABASE, calculateROP, calculateCostPerFoot } from '../../lib/drilling';
import { IADC_BIT_CLASSIFICATION, HOLE_CASING_MATCHING, DRILL_PIPE_SPECS, DRILL_COLLAR_SPECS } from '../../lib/drilling_data';
import { SectionHeader, DataRow, InputWithSlider } from '../SharedUI';

interface BitSelectionTabProps {
  bitInp: any;
  setBitInp: (val: any) => void;
  hydraulicsInp: any;
  mudInp: any;
}

export const BitSelectionTab: React.FC<BitSelectionTabProps> = ({ 
  bitInp, 
  setBitInp,
  hydraulicsInp,
  mudInp
}) => {
  const currentDepth = (hydraulicsInp.dpLength + hydraulicsInp.dcLength) * 3.28;
  const rop = calculateROP(bitInp.wob, bitInp.rpm, hydraulicsInp.dh, currentDepth, 4500, mudInp.currentMW, bitInp.toothWear);
  const cpf = calculateCostPerFoot(BIT_DATABASE[bitInp.selectedBitIndex].cost, bitInp.rigRate, bitInp.tripTime, bitInp.drillingTime, bitInp.nextDepth - currentDepth);

  const [activeTab, setActiveTab] = useState<'mechanics' | 'economy' | 'standards'>('mechanics');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-4">
            <Wrench className="text-cyan-500" size={36} />
            Bit Selection <span className="text-cyan-500/50">& ROP Terminal</span>
          </h2>
          <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-widest italic">Bourgoyne & Young Penetration Optimization Engine</p>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit backdrop-blur-md">
          {[
            { id: 'mechanics', name: 'Bit Mechanics', icon: Gauge },
            { id: 'economy', name: 'Drilling Economy', icon: TrendingUp },
            { id: 'standards', name: 'API Standards', icon: ShieldCheck }
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
              <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-8 italic">Drilling Inputs</h4>
              <div className="space-y-8">
                 <InputWithSlider label="Weight on Bit" value={bitInp.wob} min={1} max={60} step={1} unit="klb" onChange={v => setBitInp({...bitInp, wob: v})} />
                 <InputWithSlider label="Rotary RPM" value={bitInp.rpm} min={20} max={300} step={5} unit="rpm" onChange={v => setBitInp({...bitInp, rpm: v})} />
                 <InputWithSlider label="Tooth Wear" value={bitInp.toothWear} min={0} max={8} step={1} unit="T-Scale" onChange={v => setBitInp({...bitInp, toothWear: v})} />
              </div>
           </div>

           <div className="p-10 bg-cyan-600/10 rounded-3xl border border-cyan-500/20 text-center shadow-lg shadow-cyan-500/5">
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2 italic">Est. Penetration (ROP)</p>
              <p className="text-5xl font-black text-white italic tracking-tighter">
                {rop.toFixed(1)} <span className="text-xl text-slate-500 not-italic">ft/hr</span>
              </p>
           </div>
           
           <div className="glass-card rounded-2xl p-6 border-white/5 bg-black/40">
              <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <ShieldAlert size={14} /> Efficiency Alerts
              </h4>
              <div className="space-y-3">
                 {bitInp.toothWear > 5 && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-red-400 font-bold italic">
                       CRITICAL WEAR: T{bitInp.toothWear} exceeds efficient thresholds.
                    </div>
                 )}
                 {rop < 5 && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-500 font-bold italic">
                       LOW ROP: Increase WOB/RPM if within safe limits.
                    </div>
                 )}
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
                 {activeTab === 'mechanics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                       <div className="lg:col-span-8 flex flex-col gap-8">
                          <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[550px] flex items-center justify-center relative overflow-hidden">
                             <DrillBit3D rpm={bitInp.rpm} wear={bitInp.toothWear} />
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                             <ResultCard label="Mechanical Energy" value={(bitInp.wob * bitInp.rpm / 1000).toFixed(1)} unit="MSE" />
                             <ResultCard label="Vibration Factor" value={(bitInp.rpm / 60).toFixed(2)} unit="Hz" />
                          </div>
                       </div>
                       <div className="lg:col-span-4 space-y-6">
                          <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                             <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-6 italic">Bit Database</h4>
                             <div className="space-y-3">
                                {BIT_DATABASE.map((bit, idx) => (
                                   <button 
                                      key={idx}
                                      onClick={() => setBitInp({...bitInp, selectedBitIndex: idx})}
                                      className={cn(
                                         "w-full p-5 rounded-2xl border transition-all text-left group",
                                         bitInp.selectedBitIndex === idx 
                                            ? "bg-cyan-600/10 border-cyan-500/40 shadow-lg shadow-cyan-500/5" 
                                            : "bg-white/5 border-white/5 hover:border-white/10"
                                      )}
                                   >
                                      <div className="flex justify-between items-center mb-1">
                                         <span className="text-[11px] font-black text-white uppercase italic">{bit.name}</span>
                                         <span className="text-[11px] text-cyan-400 font-mono">{bit.type}</span>
                                      </div>
                                      <div className="flex gap-2 mt-2">
                                         {bit.recommendedFormations.slice(0, 2).map(f => (
                                            <span key={f} className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-slate-500 font-bold">{f}</span>
                                         ))}
                                      </div>
                                   </button>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeTab === 'economy' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                       <div className="lg:col-span-8 flex flex-col gap-8">
                          <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[550px] flex items-center justify-center relative overflow-hidden">
                             <CPFOptimization3D cpf={cpf} footage={bitInp.nextDepth - currentDepth} />
                          </div>
                          <div className="p-8 bg-emerald-600/10 border border-emerald-500/20 rounded-3xl text-center shadow-lg shadow-emerald-500/5">
                             <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 italic">Calculated Cost Per Foot</p>
                             <p className="text-5xl font-black text-white italic tracking-tighter">${cpf.toFixed(2)}</p>
                          </div>
                       </div>
                       <div className="lg:col-span-4 space-y-6">
                          <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                             <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-8 italic">Economy Settings</h4>
                             <div className="space-y-6">
                                <InputWithSlider label="Rig Day Rate" value={bitInp.rigRate} min={1000} max={5000} step={100} unit="$/hr" onChange={v => setBitInp({...bitInp, rigRate: v})} />
                                <InputWithSlider label="Trip Time" value={bitInp.tripTime} min={1} max={24} step={1} unit="hrs" onChange={v => setBitInp({...bitInp, tripTime: v})} />
                             </div>
                          </div>
                          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl italic">
                             <p className="text-[10px] text-slate-500 font-black uppercase mb-4 tracking-widest">Model Basis</p>
                             <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                "CPF = (C_bit + R * (T_drill + T_trip)) / Footage"
                             </p>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeTab === 'standards' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                       <div className="lg:col-span-12 glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] min-h-[600px] overflow-hidden">
                          <SectionHeader title="API Standards & Technical Database" subtitle="IADC Classification & BHA Specifications" />
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
                             <div className="space-y-8">
                                <h5 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest italic mb-6">IADC System</h5>
                                <div className="space-y-6">
                                   <StandardRow label="First Digit" desc={IADC_BIT_CLASSIFICATION.firstDigit} />
                                   <StandardRow label="Second Digit" desc={IADC_BIT_CLASSIFICATION.secondDigit} />
                                   <StandardRow label="Third Digit" desc={IADC_BIT_CLASSIFICATION.thirdDigit} />
                                </div>
                             </div>
                             <div className="lg:col-span-2 space-y-8">
                                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-6">Hole & Casing Matching</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {HOLE_CASING_MATCHING.map((m, i) => (
                                      <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group">
                                         <div className="flex flex-col">
                                            <span className="text-lg font-black text-white italic group-hover:text-cyan-400 transition-colors">{m.holeSize}</span>
                                            <span className="text-[11px] text-slate-600 font-bold uppercase tracking-widest italic">{m.type}</span>
                                         </div>
                                         <div className="text-right">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Casing OD</span>
                                            <span className="text-sm font-black text-white italic">{m.casingOD}</span>
                                         </div>
                                      </div>
                                   ))}
                                </div>
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

function DrillBit3D({ rpm, wear }: { rpm: number, wear: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full">
      <g transform="translate(250, 200)">
         {/* Main Bit Body */}
         <motion.path 
           d="M -60 -100 L 60 -100 L 80 50 L 0 120 L -80 50 Z"
           fill="#475569" fillOpacity="0.2" stroke="#475569" strokeWidth="2"
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 60 / (rpm || 1), ease: "linear" }}
         />
         
         {/* Cutters */}
         {[0, 120, 240].map(angle => (
            <motion.g key={angle} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 60 / (rpm || 1), ease: "linear" }}>
               <motion.path 
                  d="M -10 110 L 10 110 L 0 140 Z"
                  fill={wear > 5 ? "#f43f5e" : "#06b6d4"}
                  transform={`rotate(${angle})`}
                  animate={wear > 5 ? { opacity: [0.5, 1, 0.5] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
               />
            </motion.g>
         ))}

         {/* Mechanical Energy Waves */}
         <motion.circle 
           r="150" fill="none" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.1"
           animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.1, 0.3, 0.1] }}
           transition={{ repeat: Infinity, duration: 2 }}
         />
      </g>
      <text x="250" y="380" fill="#06b6d4" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Rotational Bit Mechanics & Cutter Wear Simulation</text>
    </svg>
  );
}

function CPFOptimization3D({ cpf, footage }: { cpf: number, footage: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
      <g transform="translate(60, 50)">
        {/* Economic Trend Grid */}
        <line x1="0" y1="300" x2="380" y2="300" stroke="#475569" strokeWidth="1" strokeDasharray="5,5" strokeOpacity="0.3" />
        <line x1="0" y1="0" x2="0" y2="300" stroke="#475569" strokeWidth="1" strokeDasharray="5,5" strokeOpacity="0.3" />
        
        {/* CPF Curve (Parabolic optimization shape) */}
        <motion.path 
          d="M 20 50 Q 200 280 360 100"
          fill="none" stroke="#10b981" strokeWidth="4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
        />
        
        {/* Current Operating Point */}
        <motion.circle 
          cx={Math.min(360, Math.max(20, (footage/2000)*360))}
          cy={Math.min(280, Math.max(50, 300 - (cpf/1000)*250))}
          r="8" fill="#ffffff"
          animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}
        />
      </g>
      <text x="250" y="380" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Drilling Economy & Cost Per Foot Optimization</text>
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

function StandardRow({ label, desc }: { label: string, desc: string }) {
  return (
    <div className="pb-4 border-b border-white/5">
       <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">{label}</p>
       <p className="text-[10px] text-white font-bold italic leading-relaxed">{desc}</p>
    </div>
  );
}


