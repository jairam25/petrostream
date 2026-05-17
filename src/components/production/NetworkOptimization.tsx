import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  Settings2, 
  TrendingUp, 
  Activity, 
  Cpu, 
  GitFork,
  ArrowRightCircle,
  BarChart3,
  Waves,
  Zap,
  Wind,
  Maximize2
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { calculateChokeFlow } from '../../lib/reservoir';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function NetworkOptimization() {
  const [totalGasAvailable, setTotalGasAvailable] = useState(15); // MMscf/d
  const [activeTab, setActiveTab] = useState<'gas-alloc' | 'choke' | 'compression'>('gas-alloc');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
      {/* Sidebar Selector */}
      <div className="lg:col-span-3 space-y-4">
        {[
          { id: 'gas-alloc', label: 'Gas Lift Allocation', desc: 'Optimize injection for peak oil', icon: Wind },
          { id: 'choke', label: 'Choke Performance', icon: Maximize2, desc: 'Gilbert critical flow modeling' },
          { id: 'compression', label: 'Compression Network', icon: Cpu, desc: 'Suction/Discharge optimization' }
        ].map(tab => (
           <motion.div 
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "glass-card rounded-2xl p-6 border-white/5 transition-all cursor-pointer",
                activeTab === tab.id ? "bg-cyan-500/10 ring-1 ring-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]" : "bg-black/40 hover:bg-white/[0.02]"
              )}
           >
              <div className="flex items-center gap-4">
                 <div className={cn("p-3 rounded-2xl", activeTab === tab.id ? "bg-cyan-500 text-black" : "bg-white/5 text-slate-500")}>
                    <tab.icon size={18} />
                 </div>
                 <div>
                    <h4 className={cn("text-xs font-black uppercase italic tracking-wider", activeTab === tab.id ? "text-cyan-400" : "text-white")}>{tab.label}</h4>
                    <p className="text-[11px] text-slate-600 italic mt-0.5">{tab.desc}</p>
                 </div>
              </div>
           </motion.div>
        ))}

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-indigo-900/40 to-black border-white/5 flex flex-col items-center text-center space-y-4">
           <Network className="text-indigo-400" size={24} />
           <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Network Topology</h5>
           <p className="text-[10px] text-slate-500 italic">5 Wells connected to Manifold M-01 via 4" flowlines.</p>
        </div>
      </div>

      {/* Main Analysis Area */}
      <div className="lg:col-span-9">
         <AnimatePresence mode="wait">
            {activeTab === 'gas-alloc' && <GasAllocationTool key="gas-alloc" />}
            {activeTab === 'choke' && <ChokeTool key="choke" />}
            {activeTab === 'compression' && <CompressionNetworkTool key="compression" />}
         </AnimatePresence>
      </div>
    </div>
  );
}

function GasAllocationTool() {
  const [supply, setSupply] = useState(12);

  const { wData, totalGain, marginalGain } = React.useMemo(() => {
     // Dynamic optimization heuristic
     // Model: gain = A * (1 - Math.exp(-k * alloc))
     // At lower supply, prioritize wells with high 'k' (steep early response)
     let w1, w2, w3, w4;
     if (supply <= 8) {
        w1 = supply * 0.2; w2 = supply * 0.5; w3 = supply * 0.05; w4 = supply * 0.25;
     } else if (supply <= 16) {
        w1 = supply * 0.35; w2 = supply * 0.3; w3 = supply * 0.2; w4 = supply * 0.15;
     } else {
        w1 = supply * 0.45; w2 = supply * 0.2; w3 = supply * 0.25; w4 = supply * 0.1;
     }

     const data = [
        { name: 'W-01', alloc: w1, gain: 800 * (1 - Math.exp(-0.25 * w1)), color: '#06b6d4' },
        { name: 'W-02', alloc: w2, gain: 500 * (1 - Math.exp(-0.6 * w2)), color: '#6366f1' },
        { name: 'W-03', alloc: w3, gain: 600 * (1 - Math.exp(-0.2 * w3)), color: '#10b981' },
        { name: 'W-04', alloc: w4, gain: 300 * (1 - Math.exp(-0.8 * w4)), color: '#f59e0b' },
     ];
     
     const total = data.reduce((acc, w) => acc + w.gain, 0);
     const marginal = supply > 0 ? (total / supply) * 0.85 : 0; // approximate derivative
     
     return { wData: data, totalGain: total, marginalGain: marginal };
  }, [supply]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="flex items-center justify-between mb-12">
          <div>
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Gas Lift <span className="text-cyan-500">Allocation</span></h3>
             <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Maximize Oil Gain per Unit Injection Gas</p>
          </div>
          <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center flex gap-8">
             <div className="px-4">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Marginal Gain</span>
                <span className="text-2xl font-black text-white italic">{formatNumber(marginalGain, 1)} <span className="text-xs text-slate-500">BBL/MM</span></span>
             </div>
             <div className="w-px h-full bg-white/5" />
             <div className="px-4">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-1">Field Opt Oil</span>
                <span className="text-2xl font-black text-emerald-400 italic">{formatNumber(totalGain, 0)} <span className="text-xs text-slate-500">STBD</span></span>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-10">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Total Field Gas Supply (MMscf/d)</label>
                <input 
                  type="range" min="2" max="30" value={supply} 
                  onChange={(e) => setSupply(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold uppercase italic">
                   <span>Reduced: 2 MM</span>
                   <span className="text-cyan-400">Current: {supply} MM</span>
                   <span>Excess: 30 MM</span>
                </div>
             </div>

             <div className="space-y-4 h-[250px] w-full bg-[#030407] rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest absolute top-6 left-6 z-10">3D Network Allocation Simulator</h4>
                <div className="w-full h-full pt-8">
                   <GasLiftManifoldSimulator3D data={wData} totalSupply={supply} />
                </div>
             </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-8">
             <div className="grid grid-cols-2 gap-4 w-full h-full">
                {wData.map((well) => (
                   <div key={well.name} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col justify-between h-[150px]">
                      <div>
                         <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-black text-white uppercase italic">{well.name}</span>
                            <span className="text-[11px] font-bold text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-full">+{formatNumber(well.gain, 0)} BBL</span>
                         </div>
                         <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white tracking-tighter italic">{formatNumber(well.alloc, 1)}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">MMscfd</span>
                         </div>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-4">
                         <motion.div 
                            className="h-full" 
                            style={{ backgroundColor: well.color }}
                            animate={{ width: `${(well.alloc / supply) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 50 }}
                         />
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function GasLiftManifoldSimulator3D({ data, totalSupply }: { data: any[], totalSupply: number }) {
  const baseSpeed = Math.max(0.5, 3 - (totalSupply / 10)); // Total flow speed

  return (
    <svg viewBox="0 0 500 250" className="w-full h-full">
       <defs>
          <linearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="0">
             <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
             <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
          </linearGradient>
       </defs>
       
       {/* Main Header / Compressor Source */}
       <rect x="20" y="90" width="80" height="70" fill="#1e293b" rx="8" stroke="#334155" strokeWidth="2" />
       <circle cx="60" cy="125" r="15" fill="#f59e0b" className="animate-pulse" />
       <text x="60" y="165" fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">COMPRESSOR</text>
       
       <motion.path 
          d="M 100 125 L 180 125" 
          stroke="url(#headerGrad)" strokeWidth="16" strokeDasharray="20 10" 
          animate={{ strokeDashoffset: [-30, 0] }} 
          transition={{ repeat: Infinity, duration: baseSpeed, ease: "linear" }} 
       />
       <rect x="180" y="40" width="40" height="170" fill="#0f172a" rx="4" stroke="#1e293b" strokeWidth="2" />
       <text x="200" y="30" fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="bold">DISTRIBUTION MANIFOLD</text>

       {/* Branch Lines to Wells */}
       {data.map((well, idx) => {
          const yPos = 60 + idx * 45;
          const allocRatio = well.alloc / totalSupply;
          const branchSpeed = Math.max(0.5, 4 - (well.alloc / 2)); // Faster if more alloc
          const branchWidth = Math.max(2, allocRatio * 20); // Thicker if more alloc
          
          return (
             <g key={well.name}>
                {/* Flowline */}
                <path d={`M 220 ${yPos} L 400 ${yPos}`} stroke="#ffffff05" strokeWidth={Math.max(8, branchWidth)} strokeLinecap="round" />
                <motion.path 
                   d={`M 220 ${yPos} L 400 ${yPos}`} 
                   stroke={well.color} strokeWidth={branchWidth} strokeDasharray="15 15" strokeLinecap="round"
                   animate={{ strokeDashoffset: [-30, 0] }} 
                   transition={{ repeat: Infinity, duration: branchSpeed, ease: "linear" }} 
                />
                
                {/* Wellhead target */}
                <circle cx="410" cy={yPos} r="12" fill="#1e293b" stroke={well.color} strokeWidth="2" />
                <circle cx="410" cy={yPos} r="4" fill={well.color} />
                <text x="435" y={yPos + 4} fill="#e2e8f0" fontSize="12" fontWeight="bold">{well.name}</text>
             </g>
          );
       })}
    </svg>
  );
}

function ChokeTool() {
  const [pwh, setPwh] = useState(800);
  const [size, setSize] = useState(32);
  const [glr, setGlr] = useState(600);

  // Gilbert Correlation: Q = P_wh * S^1.89 / (10.0 * GLR^0.546)
  const rate = pwh > 0 && glr > 0 ? (pwh * Math.pow(size, 1.89)) / (10.0 * Math.pow(glr, 0.546)) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="flex items-center justify-between mb-12">
          <div>
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Choke <span className="text-amber-500">Performance</span></h3>
             <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Gilbert Correlation / Critical Flow Modeling</p>
          </div>
          <div className="p-8 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-center">
             <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest block mb-1">Predicted Rate</span>
             <span className="text-4xl font-black text-white italic tracking-tighter">{formatNumber(rate, 0)} <span className="text-sm font-normal text-slate-500 uppercase">STBD</span></span>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <InputGroup label="WH Pressure" unit="PSI" value={pwh} onChange={setPwh} min={0} max={5000} />
          <InputGroup label="Choke Size" unit="64ths" value={size} onChange={setSize} min={4} max={128} />
          <InputGroup label="GLR" unit="SCF/BBL" value={glr} onChange={setGlr} min={50} max={5000} />
       </div>

       <div className="mt-12 p-10 bg-[#030407] rounded-3xl border border-white/5 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
             <h4 className="text-[10px] font-black text-white uppercase tracking-widest">3D Critical Flow Simulator</h4>
             <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full w-fit">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Critical Flow Stable</span>
             </div>
          </div>
          
          <div className="w-full h-[250px] mt-8 flex items-center justify-center">
             <ChokeSimulator3D size={size} rate={rate} pwh={pwh} />
          </div>
       </div>
    </motion.div>
  );
}

function ChokeSimulator3D({ size, rate, pwh }: { size: number, rate: number, pwh: number }) {
  // Map size (4-128) to an orifice radius in SVG
  const maxRadius = 40;
  const orificeRadius = Math.max(5, (size / 128) * maxRadius);
  
  // Speed of particles based on differential pressure (visual proxy)
  const particleSpeed = Math.max(0.1, 2 - (pwh / 5000));
  const count = Math.min(20, Math.max(3, Math.floor(rate / 500)));

  return (
    <svg viewBox="0 0 400 200" className="w-full h-full max-w-[400px]">
       <defs>
          <linearGradient id="fluidGrad" x1="0" y1="0" x2="1" y2="0">
             <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
             <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
          </linearGradient>
       </defs>
       
       {/* Pipe Outline */}
       <path d="M 0 50 L 180 50 L 180 150 L 0 150" fill="#0f172a" stroke="#334155" strokeWidth="4" />
       <path d="M 400 50 L 220 50 L 220 150 L 400 150" fill="#0f172a" stroke="#334155" strokeWidth="4" />
       
       {/* Choke Body */}
       <rect x="180" y="30" width="40" height="140" fill="#1e293b" rx="8" stroke="#475569" strokeWidth="3" />
       
       {/* Fluid Mass (Upstream) */}
       <rect x="0" y="52" width="180" height="96" fill="url(#fluidGrad)" />
       <text x="90" y="105" fill="#ffffff80" fontSize="14" fontWeight="bold" textAnchor="middle" className="italic">{pwh} PSI</text>

       {/* Orifice Opening */}
       <rect x="180" y={100 - orificeRadius} width="40" height={orificeRadius * 2} fill="#05070a" />

       {/* Fluid Spray (Downstream) */}
       {[...Array(count)].map((_, i) => {
          const yStart = 100 + (Math.random() - 0.5) * orificeRadius * 1.5;
          const yEnd = 100 + (Math.random() - 0.5) * 80; // Expand after choke
          return (
             <motion.line key={i}
                x1="200" y1={yStart}
                x2="400" y2={yEnd}
                stroke="#f59e0b" strokeWidth={Math.random() * 4 + 1} strokeLinecap="round" opacity="0.6"
                strokeDasharray="20 40"
                animate={{ strokeDashoffset: [-60, 0] }}
                transition={{ repeat: Infinity, duration: particleSpeed * (0.8 + Math.random() * 0.4), ease: "linear" }}
             />
          );
       })}
    </svg>
  );
}

function CompressionNetworkTool() {
  const [ps, setPs] = useState(50);
  const [pd, setPd] = useState(1000);
  const [q, setQ] = useState(15);

  // Thermodynamics: Compression Ratio
  const totalRatio = pd / Math.max(1, ps);
  // Assume max ratio per stage is around 3.5 for natural gas
  const stages = Math.max(1, Math.ceil(Math.log(totalRatio) / Math.log(3.5)));
  const ratioPerStage = Math.pow(totalRatio, 1 / stages);
  
  // Power requirement (Approximate HP for natural gas: HP = 22 * Q * (Rc^0.22 - 1) * stages)
  const powerReq = stages * 22 * q * (Math.pow(ratioPerStage, 0.22) - 1);
  
  // Comp efficiency decays if ratio per stage gets too high
  const efficiency = Math.max(50, 95 - (ratioPerStage - 1) * 5);
  
  // Fuel gas consumption (approx 0.2 MSCFD per HP)
  const fuelGasRaw = (powerReq * 0.2) / 1000; // in MMscfd
  const fuelPct = q > 0 ? (fuelGasRaw / q) * 100 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="flex items-center justify-between mb-12">
          <div>
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Compression <span className="text-indigo-500">Efficiency</span></h3>
             <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Optimization of Suction Pressure & Staging</p>
          </div>
          <div className="p-8 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-center">
             <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Required Power</span>
             <span className="text-4xl font-black text-white italic tracking-tighter">{formatNumber(powerReq, 0)} <span className="text-sm font-normal text-slate-500 uppercase">HP</span></span>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <InputGroup label="Suction Pressure" unit="PSI" value={ps} onChange={setPs} min={10} max={1000} />
          <InputGroup label="Discharge Pressure" unit="PSI" value={pd} onChange={setPd} min={50} max={5000} />
          <InputGroup label="Flow Rate" unit="MMSCFD" value={q} onChange={setQ} min={1} max={100} />
       </div>

       <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#030407] rounded-2xl border border-white/5 p-6 relative overflow-hidden h-[300px] flex items-center justify-center">
             <h4 className="text-[10px] font-bold text-white uppercase tracking-widest absolute top-6 left-6 z-10">3D Compressor Matrix Simulator</h4>
             <CompressorSimulator3D power={powerReq} stages={stages} />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col justify-center">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest block mb-2">Required Stages</span>
                <span className="text-3xl font-black text-white italic">{stages}<span className="text-xs text-slate-500 ml-1">-STAGE</span></span>
             </div>
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col justify-center">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest block mb-2">Stage Ratio</span>
                <span className="text-3xl font-black text-white italic">{formatNumber(ratioPerStage, 1)}<span className="text-xs text-slate-500 ml-1">: 1</span></span>
             </div>
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col justify-center">
                   <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest block mb-2">Adiabatic Eff.</span>
                   <span className={cn("text-3xl font-black italic", efficiency < 70 ? "text-red-400" : "text-emerald-400")}>
                      {formatNumber(efficiency, 1)}%
                   </span>
             </div>
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex flex-col justify-center">
                   <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest block mb-2">Fuel Gas</span>
                   <span className="text-3xl font-black text-amber-400 italic">{formatNumber(fuelPct, 1)}%</span>
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function CompressorSimulator3D({ power, stages }: { power: number, stages: number }) {
  // Rotate faster based on HP
  const rpmDuration = Math.max(0.1, 3 - (power / 2000));
  
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full max-w-[300px]">
       {/* Manifold Block */}
       <rect x="50" y="50" width="200" height="100" fill="#0f172a" rx="16" stroke="#1e293b" strokeWidth="4" />
       <text x="150" y="40" fill="#475569" fontSize="10" textAnchor="middle" fontWeight="bold" letterSpacing="2">COMPRESSOR UNIT</text>

       {/* Drive Shaft */}
       <rect x="20" y="95" width="260" height="10" fill="#334155" />
       
       {/* Stages */}
       {[...Array(Math.min(stages, 4))].map((_, i) => {
          const xPos = 80 + i * (140 / Math.max(1, stages - 1)); // distribute evenly
          const radius = 35 - (i * 5); // stages get smaller as gas compresses
          
          return (
             <g key={i} transform={`translate(${xPos}, 100)`}>
                <circle r={radius} fill="#1e293b" stroke="#6366f1" strokeWidth="2" />
                <motion.g
                   animate={{ rotate: 360 }}
                   transition={{ repeat: Infinity, duration: rpmDuration, ease: "linear" }}
                >
                   {/* Impeller Blades */}
                   {[...Array(6)].map((_, b) => (
                      <line 
                         key={b}
                         x1="0" y1="0" 
                         x2="0" y2={-radius + 4} 
                         stroke="#6366f1" strokeWidth="3" strokeLinecap="round" opacity="0.6"
                         transform={`rotate(${b * 60})`}
                      />
                   ))}
                   <circle r="8" fill="#indigo-500" />
                </motion.g>
                <text y={radius + 15} fill="#64748b" fontSize="8" textAnchor="middle" fontWeight="bold">STAGE {i + 1}</text>
             </g>
          );
       })}
    </svg>
  );
}

function InputGroup({ label, unit, value, onChange, min, max, step = 1 }: { label: string, unit: string, value: number, onChange: (v: number) => void, min?: number, max?: number, step?: number }) {
  return (
    <div className="space-y-3">
       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
       <div className="relative group">
          <input 
             type="number" 
             value={value}
             min={min}
             max={max}
             step={step}
             onChange={(e) => onChange(parseFloat(e.target.value))}
             className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg font-black text-white italic focus:ring-1 focus:ring-cyan-500 outline-none" 
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-700 italic uppercase">{unit}</span>
       </div>
    </div>
  );
}
