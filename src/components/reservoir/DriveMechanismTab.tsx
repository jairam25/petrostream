import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Droplets, 
  Wind, 
  Zap, 
  CircleDot,
  Info,
  ChevronRight,
  Activity,
  Search,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface DriveDetails {
  id: string;
  name: string;
  rfRange: [number, number];
  description: string;
  pressureTrend: string;
  gorTrend: string;
  waterCutTrend: string;
  color: string;
  keyFeatures: string[];
}

const DRIVE_MECHANISMS: DriveDetails[] = [
  {
    id: 'solution_gas',
    name: 'Solution Gas Drive',
    rfRange: [5, 30],
    description: 'Gas expands out of solution as pressure drops below bubble point. Highly efficient at first, but energy depletes rapidly.',
    pressureTrend: 'Rapid and continuous decline',
    gorTrend: 'Increases rapidly after initial period',
    waterCutTrend: 'Very low or negligible',
    color: 'bg-cyan-500',
    keyFeatures: ['Steep pressure decline', 'Rapid rise in GOR', 'Small or no aquifer']
  },
  {
    id: 'gas_cap',
    name: 'Gas Cap Drive',
    rfRange: [20, 40],
    description: 'An initial gas cap expands, maintaining reservoir pressure and pushing oil down towards the wells.',
    pressureTrend: 'Slower decline than solution gas',
    gorTrend: 'Increases as gas cap expands to wells',
    waterCutTrend: 'Low to moderate',
    color: 'bg-indigo-500',
    keyFeatures: ['Pressure maintained by gas expansion', 'Good recovery in high gravity oil', 'm ratio > 0.1']
  },
  {
    id: 'water_drive',
    name: 'Natural Water Drive',
    rfRange: [35, 75],
    description: 'Water from an adjacent aquifer moves into the reservoir to replace produced fluids, maintaining high pressure.',
    pressureTrend: 'Very slow or no decline (steady state)',
    gorTrend: 'Remains low and nearly constant',
    waterCutTrend: 'Increases early and significantly',
    color: 'bg-emerald-500',
    keyFeatures: ['High energy maintenance', 'High water production', 'Efficient sweep']
  },
  {
    id: 'gravity_drainage',
    name: 'Gravity Drainage',
    rfRange: [40, 80],
    description: 'In thick or steeply dipping formations, gravity pulls oil down, allowing highly efficient recovery.',
    pressureTrend: 'Slow decline',
    gorTrend: 'Increases only near the top of the structure',
    waterCutTrend: 'Negligible',
    color: 'bg-rose-500',
    keyFeatures: ['Thick formation', 'High dipping angle', 'Excellent recovery']
  },
  {
    id: 'rock_expansion',
    name: 'Rock/Fluid Expansion',
    rfRange: [1, 5],
    description: 'For undersaturated oil above bubble point, recovery is driven solely by the expansion of the rock and slightly compressible fluid.',
    pressureTrend: 'Extremely rapid decline',
    gorTrend: 'Constant at Rsi',
    waterCutTrend: 'Zero',
    color: 'bg-slate-500',
    keyFeatures: ['Undersaturated reservoirs', 'Low compressibility energy', 'Fastest pressure drop']
  }
];

export function DriveMechanismTab() {
  const [selectedId, setSelectedId] = useState(DRIVE_MECHANISMS[0].id);
  const selected = DRIVE_MECHANISMS.find(d => d.id === selectedId)!;

  // Diagnostic Inputs
  const [pTrend, setPTrend] = useState('rapid');
  const [gorTrend, setGorTrend] = useState('stable');
  const [wcTrend, setWcTrend] = useState('low');

  const diagnosis = (() => {
    if (pTrend === 'stable' && wcTrend === 'high') return DRIVE_MECHANISMS.find(d => d.id === 'water_drive');
    if (pTrend === 'rapid' && gorTrend === 'increasing') return DRIVE_MECHANISMS.find(d => d.id === 'solution_gas');
    if (pTrend === 'moderate' && gorTrend === 'increasing') return DRIVE_MECHANISMS.find(d => d.id === 'gas_cap');
    if (pTrend === 'extreme') return DRIVE_MECHANISMS.find(d => d.id === 'rock_expansion');
    return null;
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4">
      {/* Reference Module */}
      <div className="lg:col-span-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DRIVE_MECHANISMS.map(drive => (
            <button
              key={drive.id}
              onClick={() => setSelectedId(drive.id)}
              className={cn(
                "glass-card p-6 rounded-2xl border-white/5 text-left transition-all relative overflow-hidden group",
                selectedId === drive.id ? "bg-white/10 ring-1 ring-white/20" : "bg-black/20 hover:bg-black/40"
              )}
            >
              <div className={cn("h-1 w-12 rounded-full mb-4", drive.color)} />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">{drive.name}</h5>
              <p className="text-[20px] font-black text-slate-400 italic mt-2">{drive.rfRange[0]}-{drive.rfRange[1]}%</p>
              <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">Recovery Range</p>
              
              <ChevronRight className={cn(
                "absolute bottom-4 right-4 text-slate-700 transition-all",
                selectedId === drive.id ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
              )} size={16} />
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Shield size={160} className="text-white" />
             </div>

             <div className="flex flex-col md:flex-row justify-between gap-12 items-start relative z-10">
                <div className="flex-1 space-y-8">
                   <div>
                      <div className="flex items-center gap-2 mb-4">
                         <div className={cn("h-3 w-3 rounded-full shadow-lg", selected.color)} />
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mechanism Profile</span>
                      </div>
                      <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">{selected.name}</h3>
                      <p className="text-sm text-slate-400 mt-4 leading-relaxed max-w-xl">{selected.description}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <h6 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                           <Activity size={12} className="text-cyan-500" /> Production Trends
                         </h6>
                         <TrendItem label="Pressure" value={selected.pressureTrend} />
                         <TrendItem label="Gas-Oil Ratio" value={selected.gorTrend} />
                         <TrendItem label="Water Cut" value={selected.waterCutTrend} />
                      </div>
                      <div className="space-y-4">
                         <h6 className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                           <Zap size={12} className="text-emerald-500" /> Key Identifiers
                         </h6>
                         {selected.keyFeatures.map((f, i) => (
                           <div key={i} className="flex items-center gap-3">
                              <CheckCircle2 size={14} className="text-white/20" />
                              <span className="text-[10px] text-slate-400 font-medium">{f}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="w-full md:w-64 space-y-6">
                   <div className="glass-card bg-white/5 p-8 rounded-2xl border-white/5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Efficiency Spectrum</p>
                      <div className="relative h-40 flex items-end justify-center gap-2">
                         <div className="absolute inset-0 flex flex-col justify-between text-[10px] font-mono text-slate-700">
                            <span>80%</span>
                            <span>60%</span>
                            <span>40%</span>
                            <span>20%</span>
                            <span>0%</span>
                         </div>
                         <motion.div 
                           initial={{ height: 0 }} 
                           animate={{ height: `${selected.rfRange[1]}%` }}
                           className={cn("w-12 rounded-t-xl transition-all", selected.color)} 
                         />
                      </div>
                      <div className="flex justify-between mt-4 text-[10px] font-black text-white italic italic">
                         <span>Typical RF</span>
                         <span>{selected.rfRange[0]}%-{selected.rfRange[1]}%</span>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Diagnostic Tool */}
      <div className="lg:col-span-4 space-y-8">
        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-8">
              <Search size={18} className="text-cyan-500" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Drive Diagnostic</h4>
           </div>

           <div className="space-y-8">
              <DiagnosticSelect 
                label="Pressure Decline Profile" 
                options={[
                  { id: 'stable', label: 'Stable / Constant' },
                  { id: 'moderate', label: 'Moderate / Slow' },
                  { id: 'rapid', label: 'Rapid' },
                  { id: 'extreme', label: 'Extreme / Volumetric' }
                ]}
                value={pTrend}
                onChange={setPTrend}
              />

              <DiagnosticSelect 
                label="Gas-Oil Ratio (GOR)" 
                options={[
                  { id: 'stable', label: 'Stable' },
                  { id: 'increasing', label: 'Rapidly Increasing' },
                  { id: 'slow_rise', label: 'Slow Increase' }
                ]}
                value={gorTrend}
                onChange={setGorTrend}
              />

              <DiagnosticSelect 
                label="Water Production" 
                options={[
                  { id: 'low', label: 'Low / Negligible' },
                  { id: 'high', label: 'High / Early Breakthrough' },
                  { id: 'moderate', label: 'Moderate / Gradual' }
                ]}
                value={wcTrend}
                onChange={setWcTrend}
              />
           </div>

           <div className="mt-12 pt-8 border-t border-white/5">
              <AnimatePresence mode="wait">
                 {diagnosis ? (
                   <motion.div
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="glass-card bg-emerald-500/10 p-6 rounded-3xl border-emerald-500/20"
                   >
                      <div className="flex items-center gap-2 text-emerald-400 mb-2">
                         <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Likely Mechanism</span>
                      </div>
                      <h5 className="text-xl font-black text-white italic mb-2">{diagnosis.name}</h5>
                      <p className="text-[10px] text-slate-500 font-mono">System Energy: {diagnosis.rfRange[1]}% Potential</p>
                      <button 
                        onClick={() => setSelectedId(diagnosis.id)}
                        className="mt-4 text-[11px] font-bold text-emerald-400 uppercase tracking-widest underline underline-offset-4"
                      >View Full Reference</button>
                   </motion.div>
                 ) : (
                   <div className="flex items-center gap-4 text-slate-700 italic text-[11px] p-6 border-dashed border-2 border-white/5 rounded-3xl">
                      <Info size={16} />
                      Adjust trends to diagnose drive mechanism.
                   </div>
                 )}
              </AnimatePresence>
           </div>
        </div>

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-indigo-900/40 to-black border-white/5">
           <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Engineering Rule of Thumb</h5>
           <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
             Gravity drainage can achieve the highest recovery factors ({'>'}70%) in reservoirs with high vertical permeability and steep dips, often outperforming even strong water drives.
           </p>
        </div>
      </div>
    </div>
  );
}

function TrendItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1 border-l-2 border-white/5 pl-4">
       <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{label}</span>
       <span className="text-[10px] font-black text-slate-300 uppercase">{value}</span>
    </div>
  );
}

function DiagnosticSelect({ label, options, value, onChange }: { label: string, options: any[], value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-4">
       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
       <div className="grid grid-cols-1 gap-2">
          {options.map(opt => (
            <button
               key={opt.id}
               onClick={() => onChange(opt.id)}
               className={cn(
                 "text-left px-4 py-2.5 rounded-xl text-[10px] font-bold transition-all border",
                 value === opt.id ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-white/5 border-transparent text-slate-500 hover:bg-white/10"
               )}
            >
               {opt.label}
            </button>
          ))}
       </div>
    </div>
  );
}
