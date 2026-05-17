import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Factory, Activity, Droplets, Wind, Zap } from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';

export const FacilitiesTab: React.FC = () => {
  const [liquidRate, setLiquidRate] = useState(5000);
  const [gasRate, setGasRate] = useState(10);
  const [pressure, setPressure] = useState(150);

  // Facility Sizing & Power Calculations
  const calculations = useMemo(() => {
    // API 12J Separator Sizing Heuristics
    const retentionTime = 3; // minutes
    const liqVolumeBbl = (liquidRate / 1440) * retentionTime;
    // Assuming L/D ratio of ~3. Vol = pi/4 * d^2 * 3d = 3*pi/4 * d^3
    // 1 bbl = 5.615 cu ft.
    const volCuFt = liqVolumeBbl * 5.615;
    // d (ft) = cbrt(volCuFt / (3 * pi / 4))
    const dFt = Math.pow(volCuFt / (3 * Math.PI / 4), 1/3);
    const dInches = Math.ceil((dFt * 12) / 6) * 6; // round to nearest 6 inches
    const lFt = Math.ceil((dFt * 3) / 2) * 2; // round to nearest 2 ft

    const separatorSize = `${Math.max(12, dInches)}" x ${Math.max(5, lFt)}'`;

    // Pump HP to boost liquid from separator (150 psi) to pipeline (e.g. 1000 psi)
    // HP = Q(gpm) * dP(psi) / (1714 * eff)
    const gpm = liquidRate * 42 / 1440;
    const dpLiquid = 1000 - pressure;
    const pumpHP = (gpm * dpLiquid) / (1714 * 0.75);

    // Compressor HP to boost gas from separator (150 psi) to pipeline (1000 psi)
    // HP = 22 * MMSCFD * (Rc^0.22 - 1) * stages
    const rc = 1000 / pressure;
    const stages = Math.ceil(Math.log(rc) / Math.log(3.5));
    const compHP = stages * 22 * gasRate * (Math.pow(rc, 0.22) - 1);

    return {
      separatorSize,
      pumpHP: Math.max(0, pumpHP),
      compHP: Math.max(0, compHP)
    };
  }, [liquidRate, gasRate, pressure]);

  return (
    <div className="space-y-8 pb-12 p-8 h-full">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
        {/* Input Panel */}
        <div className="xl:col-span-4 space-y-6">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="glass-card rounded-3xl p-8 border-white/5 bg-black/40 h-full flex flex-col justify-between"
           >
             <div>
                <h2 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3 mb-2">
                  <Factory className="text-blue-500" size={24} />
                  Surface <span className="text-blue-500">Facilities</span>
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-10">Equipment Sizing & Rating</p>

                <div className="space-y-8">
                   <FacilitySlider label="Liquid Rate" value={liquidRate} min={500} max={20000} step={500} unit="STB/D" onChange={setLiquidRate} color="text-cyan-400" bg="bg-cyan-500" />
                   <FacilitySlider label="Gas Rate" value={gasRate} min={1} max={100} step={1} unit="MMSCF/D" onChange={setGasRate} color="text-amber-400" bg="bg-amber-500" />
                   <FacilitySlider label="Separator Pressure" value={pressure} min={50} max={500} step={10} unit="PSI" onChange={setPressure} color="text-slate-300" bg="bg-slate-500" />
                </div>
             </div>

             <div className="mt-12 p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-center">
                 <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 italic">Computed API 12J Separator Size</h4>
                 <span className="text-5xl font-black text-white italic tracking-tighter">{calculations.separatorSize}</span>
             </div>
           </motion.div>
        </div>

        {/* 3D Visualization and Outputs */}
        <div className="xl:col-span-8 flex flex-col gap-8 h-full">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="glass-card rounded-3xl p-10 border-white/5 bg-[#030407] flex-1 flex flex-col relative overflow-hidden"
            >
                <div className="absolute top-8 left-10 z-10 w-full pr-20 flex justify-between items-start">
                    <div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">3D Process Flow Simulator</h4>
                        <p className="text-[11px] text-blue-400 uppercase font-bold mt-1">Separator, Pump, and Compressor Dynamics</p>
                    </div>
                    <div className="text-[11px] font-black text-blue-400 italic px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 animate-pulse">LIVE PROCESS FEED</div>
                </div>
                
                <div className="w-full h-[60%] mt-12 flex items-center justify-center">
                   <SurfaceFacilitySimulator3D liqRate={liquidRate} gasRate={gasRate} />
                </div>

                <div className="grid grid-cols-2 gap-6 mt-auto">
                   <div className="p-8 bg-white/5 border border-white/5 rounded-2xl relative overflow-hidden group">
                      <Droplets className="absolute right-6 top-6 text-cyan-500/20" size={60} />
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-2 relative z-10">Liquid Export Pump Rating</span>
                      <div className="relative z-10 flex items-baseline gap-2">
                         <span className="text-4xl font-black text-white italic tracking-tighter">{formatNumber(calculations.pumpHP, 0)}</span>
                         <span className="text-xs text-slate-500 font-bold uppercase">HP</span>
                      </div>
                   </div>
                   <div className="p-8 bg-white/5 border border-white/5 rounded-2xl relative overflow-hidden group">
                      <Wind className="absolute right-6 top-6 text-amber-500/20" size={60} />
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-2 relative z-10">Gas Export Compressor Rating</span>
                      <div className="relative z-10 flex items-baseline gap-2">
                         <span className="text-4xl font-black text-white italic tracking-tighter">{formatNumber(calculations.compHP, 0)}</span>
                         <span className="text-xs text-slate-500 font-bold uppercase">HP</span>
                      </div>
                   </div>
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

function FacilitySlider({ label, value, min, max, step, unit, onChange, color, bg }: any) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center text-[11px] font-black text-white uppercase tracking-widest">
                <span>{label}</span>
                <span className={cn("font-mono", color)}>{formatNumber(value, 0)} {unit}</span>
            </div>
            <input 
              type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
              className={cn("w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer", `accent-${bg.split('-')[1]}-500`)}
              style={{ accentColor: bg.includes('cyan') ? '#06b6d4' : bg.includes('amber') ? '#f59e0b' : '#64748b' }}
            />
        </div>
    );
}

function SurfaceFacilitySimulator3D({ liqRate, gasRate }: { liqRate: number, gasRate: number }) {
  const lSpeed = Math.max(0.2, 2 - (liqRate / 20000));
  const gSpeed = Math.max(0.1, 1 - (gasRate / 100));

  return (
    <svg viewBox="0 0 600 300" className="w-full h-full max-h-[350px]">
       {/* Multiphase Inlet Pipe */}
       <path d="M 0 150 L 100 150" stroke="#475569" strokeWidth="8" />
       {[...Array(5)].map((_, i) => (
          <motion.circle key={`in-${i}`}
             cx={0} cy="150" r="3" fill="#ffffff" opacity="0.5"
             animate={{ cx: [0, 100] }}
             transition={{ repeat: Infinity, duration: 1, delay: i * 0.2, ease: "linear" }}
          />
       ))}
       <text x="50" y="140" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">INLET</text>

       {/* Separator Vessel (API 12J) */}
       <rect x="100" y="100" width="160" height="100" rx="30" fill="#0f172a" stroke="#334155" strokeWidth="4" />
       
       {/* Gas Section (Top) */}
       <rect x="110" y="105" width="140" height="40" rx="10" fill="#f59e0b" opacity="0.1" />
       
       {/* Liquid Section (Bottom) */}
       <rect x="110" y="155" width="140" height="40" rx="10" fill="#06b6d4" opacity="0.3" />
       
       <text x="180" y="155" fill="#475569" fontSize="12" fontWeight="bold" textAnchor="middle" letterSpacing="2">3-PHASE SEPARATOR</text>

       {/* Gas Export Line & Compressor */}
       <path d="M 180 100 L 180 50 L 350 50" stroke="#f59e0b" strokeWidth="4" fill="transparent" opacity="0.6" />
       <circle cx="350" cy="50" r="25" fill="#1e293b" stroke="#f59e0b" strokeWidth="3" />
       <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: gSpeed, ease: "linear" }} style={{ originX: '350px', originY: '50px' }}>
          <line x1="325" y1="50" x2="375" y2="50" stroke="#f59e0b" strokeWidth="4" />
          <line x1="350" y1="25" x2="350" y2="75" stroke="#f59e0b" strokeWidth="4" />
       </motion.g>
       <text x="350" y="20" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle">GAS COMPRESSOR</text>
       
       {/* Gas Flow Particles */}
       {[...Array(6)].map((_, i) => (
          <motion.circle key={`gas-${i}`}
             cx="0" cy="0" r="2" fill="#f59e0b"
             animate={{ 
                x: [180, 180, 320], 
                y: [100, 50, 50] 
             }}
             transition={{ repeat: Infinity, duration: gSpeed * 2, delay: i * 0.3, ease: "linear" }}
          />
       ))}
       <path d="M 375 50 L 550 50" stroke="#f59e0b" strokeWidth="4" strokeDasharray="10 10" opacity="0.4" />

       {/* Liquid Export Line & Pump */}
       <path d="M 180 200 L 180 250 L 350 250" stroke="#06b6d4" strokeWidth="4" fill="transparent" opacity="0.6" />
       <rect x="330" y="235" width="40" height="30" fill="#1e293b" stroke="#06b6d4" strokeWidth="3" rx="4" />
       <motion.line 
          x1="335" y1="250" x2="365" y2="250" stroke="#06b6d4" strokeWidth="6" strokeLinecap="round"
          animate={{ x1: [335, 345, 335], x2: [365, 355, 365] }}
          transition={{ repeat: Infinity, duration: lSpeed, ease: "easeInOut" }}
       />
       <text x="350" y="280" fill="#06b6d4" fontSize="10" fontWeight="bold" textAnchor="middle">LIQUID EXPORT PUMP</text>

       {/* Liquid Flow Particles */}
       {[...Array(6)].map((_, i) => (
          <motion.circle key={`liq-${i}`}
             cx="0" cy="0" r="3" fill="#06b6d4"
             animate={{ 
                x: [180, 180, 320], 
                y: [200, 250, 250] 
             }}
             transition={{ repeat: Infinity, duration: lSpeed * 2, delay: i * 0.4, ease: "linear" }}
          />
       ))}
       <path d="M 370 250 L 550 250" stroke="#06b6d4" strokeWidth="4" strokeDasharray="10 10" opacity="0.4" />

       {/* Export Labels */}
       <text x="500" y="40" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle" opacity="0.8">TO PIPELINE</text>
       <text x="500" y="240" fill="#06b6d4" fontSize="8" fontWeight="bold" textAnchor="middle" opacity="0.8">TO PIPELINE</text>
    </svg>
  );
}
