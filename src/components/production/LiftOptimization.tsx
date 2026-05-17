import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Settings2, 
  TrendingUp, 
  Activity, 
  Waves,
  RefreshCw,
  ChevronRight,
  Cylinder,
  ArrowRightCircle,
  Wind
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { calculateBeamPumpDisplacement, calculateESPMotorHP } from '../../lib/reservoir';
import { 
  ROD_PUMP_UNITS_API, 
  DOWNHOLE_PUMP_SIZES, 
  SUCKER_ROD_GRADES, 
  ESP_HOUSING_SIZES, 
  ESP_STAGE_TYPES, 
  GAS_LIFT_VALVE_SPECS,
  GAS_LIFT_MANDRELS
} from '../../lib/artificial_lift_data';
import { SectionHeader } from '../SharedUI';

export function LiftOptimization() {
  const [activeSystem, setActiveSystem] = useState<'rod' | 'esp' | 'gas'>('rod');
  const [globalStats, setGlobalStats] = useState({ eff: '72.4%', hp: '4,250 HP' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
      {/* Sidebar Selector */}
      <div className="lg:col-span-3 space-y-4">
        {[
          { id: 'rod', label: 'Rod Pump (SRP)', desc: 'Beam pump API design & Dyno cards', icon: Cylinder },
          { id: 'esp', label: 'ESP Optimization', icon: Zap, desc: 'Pump curves & VSD frequency' },
          { id: 'gas', label: 'Gas Lift Design', icon: Wind, desc: 'Valve spacing & performance' }
        ].map(sys => (
          <motion.div
            key={sys.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSystem(sys.id as any)}
            className={cn(
              "glass-card rounded-2xl p-6 border-white/5 transition-all cursor-pointer",
              activeSystem === sys.id ? "bg-cyan-500/10 ring-1 ring-cyan-500/50" : "bg-black/40 hover:bg-white/[0.02]"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-2xl", activeSystem === sys.id ? "bg-cyan-500 text-black" : "bg-white/5 text-slate-500")}>
                <sys.icon size={18} />
              </div>
              <div>
                <h4 className={cn("text-xs font-black uppercase italic tracking-wider", activeSystem === sys.id ? "text-cyan-400" : "text-white")}>{sys.label}</h4>
                <p className="text-[11px] text-slate-600 italic mt-0.5">{sys.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-indigo-900/40 to-black border-white/5 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <RefreshCw size={18} className="text-cyan-400" />
            <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Global Status</h5>
          </div>
          <div className="space-y-4 font-mono">
            <div className="flex justify-between">
              <span className="text-[11px] text-slate-500 uppercase">Avg Efficiency</span>
              <span className="text-[10px] text-emerald-400 font-bold">{globalStats.eff}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[11px] text-slate-500 uppercase">Total HP Demand</span>
              <span className="text-[10px] text-white">{globalStats.hp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-9">
         <AnimatePresence mode="wait">
            {activeSystem === 'rod' && <RodPumpTool key="rod" onUpdateStats={setGlobalStats} />}
            {activeSystem === 'esp' && <ESPTool key="esp" onUpdateStats={setGlobalStats} />}
            {activeSystem === 'gas' && <GasLiftTool key="gas" onUpdateStats={setGlobalStats} />}
         </AnimatePresence>
      </div>
    </div>
  );
}

function RodPumpTool({ onUpdateStats }: { onUpdateStats: (stats: any) => void }) {
  const [plungerSize, setPlungerSize] = useState(1.5); // inch
  const [strokeLength, setStrokeLength] = useState(120); // inch
  const [spm, setSpm] = useState(10);

  // Dynamic Calculations
  const depth = 5000; // ft (assumed)
  const plungerArea = Math.PI * Math.pow(plungerSize / 2, 2);
  const displacement = calculateBeamPumpDisplacement(plungerArea, strokeLength, spm);
  
  const accFactor = (strokeLength * Math.pow(spm, 2)) / 70500;
  const fluidLoad = plungerArea * depth * 0.433;
  const rodWeight = 1.63 * depth;
  
  const pprl = fluidLoad + rodWeight * (1 + accFactor);
  const mprl = Math.max(0, rodWeight * (1 - accFactor) - 0.1 * fluidLoad);
  const torque = (pprl - mprl) * (strokeLength / 2) * 0.3 / 1000;
  const motorHP = (pprl * strokeLength * spm) / (33000 * 12 * 0.8) + fluidLoad * strokeLength * spm / 1000000; 

  React.useEffect(() => {
     onUpdateStats({ 
       eff: Math.max(10, 100 - (pprl/25000)*15 - (spm > 15 ? (spm-15)*2 : 0)).toFixed(1) + '%', 
       hp: formatNumber(motorHP * 15, 0) + ' HP' // scale up for field level representation
     });
  }, [pprl, motorHP, spm, onUpdateStats]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a]"
    >
       <div className="flex items-center justify-between mb-12">
          <div>
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Beam Pump <span className="text-cyan-500">API Design</span></h3>
             <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Sucker Rod Lift Calculation & Optimization</p>
          </div>
          <div className="flex gap-4">
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center px-10">
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest block mb-1">Theoretical Displacement</span>
                <span className="text-3xl font-black text-white italic">{formatNumber(displacement, 0)} <span className="text-sm font-normal text-slate-500">BFPD</span></span>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <InputGroup label="Plunger Size" unit="IN" value={plungerSize} onChange={setPlungerSize} min={1} max={4.5} step={0.25} />
          <InputGroup label="Stroke Length" unit="IN" value={strokeLength} onChange={setStrokeLength} min={20} max={300} step={10} />
          <InputGroup label="Strokes / Min" unit="SPM" value={spm} onChange={setSpm} min={1} max={25} />
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card rounded-2xl p-8 bg-black/40 border-white/5">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-8">Kinetic Pump Jack Simulator</h4>
            <div className="h-[250px] relative flex items-center justify-center">
              <BeamPumpSimulator3D spm={spm} strokeLength={strokeLength} />
            </div>
            <div className="mt-6 flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
               <Activity size={14} className="text-emerald-500" />
               <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">Diagnostic: Full Pump Fillage</span>
            </div>
          </div>

          <div className="space-y-6">
             <div className="glass-card rounded-2xl p-8 border-white/5 bg-black/40 h-full">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6">Polished Rod Loads (API)</h4>
                <div className="space-y-4">
                   <MetricRow label="PPRL (Peak Load)" val={formatNumber(pprl, 0)} unit="LBS" />
                   <MetricRow label="MPRL (Min Load)" val={formatNumber(mprl, 0)} unit="LBS" />
                   <MetricRow label="Torque (Peak)" val={formatNumber(torque, 1)} unit="K IN-LB" />
                   <MetricRow label="Motor HP Req" val={formatNumber(motorHP, 1)} unit="HP" />
                </div>
             </div>
          </div>
       </div>

       <div className="mt-12 pt-12 border-t border-white/5">
         <SectionHeader title="Rod Pump API Engineering Specs" subtitle="API 11E, 11AX & 11B Standards" />
         <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-6">
           <div>
             <h5 className="text-[10px] font-bold text-industry-label uppercase mb-4">Pumping Unit Designations (API 11E)</h5>
             <div className="overflow-x-auto custom-scrollbar">
               <table className="industry-table min-w-[500px]">
                 <thead>
                   <tr>
                     <th>Designation</th>
                     <th>Geometry</th>
                     <th>Torque (in-lb)</th>
                     <th>Stroke (in)</th>
                     <th>Max Load (lb)</th>
                   </tr>
                 </thead>
                 <tbody>
                   {ROD_PUMP_UNITS_API.map((u, i) => (
                     <tr key={i}>
                       <td className="data-mono font-bold text-white text-[10px]">{u.designation}</td>
                       <td className="text-[11px] text-slate-500 uppercase">{u.geometry}</td>
                       <td className="data-mono text-[10px] text-industry-value">{u.torque}</td>
                       <td className="data-mono text-[10px] text-industry-value">{u.stroke}</td>
                       <td className="data-mono text-[10px] text-amber-500">{u.maxLoad}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <p className="text-[11px] text-slate-500 font-bold uppercase mb-3">Sucker Rod Specs (API 11B)</p>
                  <div className="space-y-4">
                    {SUCKER_ROD_GRADES.map((g, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-[11px] font-black text-cyan-400">{g.grade}</span>
                          <span className="text-[10px] text-white font-mono">{g.tensile}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight italic">{g.usage}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <p className="text-[11px] text-slate-500 font-bold uppercase mb-3">Downhole Pump Bores (API 11AX)</p>
                  <div className="space-y-3">
                    {DOWNHOLE_PUMP_SIZES.map((p, i) => (
                      <div key={i}>
                        <p className="text-[10px] font-bold text-white">{p.type}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.bores.map(b => (
                            <span key={b} className="text-[10px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded">{b}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
           </div>
         </div>
       </div>
    </motion.div>
  );
}

function ESPTool({ onUpdateStats }: { onUpdateStats: (stats: any) => void }) {
  const [rate, setRate] = useState(1500);
  const [tdh, setTdh] = useState(6500);
  const [efficiency, setEfficiency] = useState(0.65);
  const [hz, setHz] = useState(60);

  const motorHP = calculateESPMotorHP(rate, tdh, 1.0, efficiency) * Math.pow(hz / 60, 3); // Affinity laws scaling
  const voltageDrop = Math.min(15, (tdh / 5000) * 3 + (motorHP / 100));
  const operatingPoint = Math.min(100, Math.max(10, (rate / 3000) * 100 * (hz / 60)));

  React.useEffect(() => {
     onUpdateStats({ 
       eff: (efficiency * 100).toFixed(1) + '%', 
       hp: formatNumber(motorHP * 20, 0) + ' HP' // scale up for field level
     });
  }, [efficiency, motorHP, onUpdateStats]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a]"
    >
       <div className="flex items-center justify-between mb-12">
          <div>
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">ESP <span className="text-indigo-400">Optimization</span></h3>
             <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Variable Speed Drive & Pump Efficiency</p>
          </div>
          <div className="p-6 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 text-center">
             <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Estimated Brake HP</span>
             <span className="text-3xl font-black text-white italic">{formatNumber(motorHP, 0)} <span className="text-sm font-normal text-slate-500">HP</span></span>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <InputGroup label="Flow Rate" unit="BPD" value={rate} onChange={setRate} min={500} max={10000} step={100} />
          <InputGroup label="Total Dynamic Head" unit="FT" value={tdh} min={1000} max={15000} step={500} onChange={setTdh} />
          <InputGroup label="Pump Efficiency" unit="DEC" value={efficiency} onChange={setEfficiency} min={0.3} max={0.8} step={0.05} />
          <InputGroup label="Drive Frequency" unit="HZ" value={hz} onChange={setHz} min={30} max={90} step={1} />
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="h-[300px] glass-card rounded-2xl p-8 border-white/5 bg-black/40">
             <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6">Frequency Response (Hz)</h4>
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { hz: 40, rate: 800, hp: 300 },
                  { hz: 50, rate: 1000, hp: 450 },
                  { hz: 60, rate: 1250, hp: 680 },
                  { hz: 70, rate: 1500, hp: 950 },
                ]}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                   <XAxis dataKey="hz" stroke="#475569" fontSize={10} />
                   <YAxis stroke="#475569" fontSize={10} />
                   <Tooltip />
                   <Area type="monotone" dataKey="rate" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                </AreaChart>
             </ResponsiveContainer>
          </div>
          <div className="space-y-6">
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Cable Voltage Drop</h5>
                <div className="flex items-baseline gap-4">
                  <span className={cn("text-2xl font-black italic", voltageDrop > 10 ? "text-red-400" : "text-white")}>{voltageDrop.toFixed(1)}%</span>
                  <span className={cn("text-[10px] font-bold uppercase", voltageDrop > 10 ? "text-red-500" : "text-emerald-500")}>
                    {voltageDrop > 10 ? "EXCEEDS TOLERANCE" : "Within Tolerance"}
                  </span>
                </div>
             </div>
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">ESP Operating Point</h5>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={cn("h-full", operatingPoint > 80 || operatingPoint < 20 ? "bg-red-500" : "bg-indigo-500")} style={{ width: `${operatingPoint}%` }} />
                  </div>
                  <span className={cn("text-[11px] font-black uppercase italic", operatingPoint > 80 ? "text-red-400" : operatingPoint < 20 ? "text-amber-400" : "text-white")}>
                     {operatingPoint > 80 ? "Upthrust" : operatingPoint < 20 ? "Downthrust" : "Optimal Range"}
                  </span>
                </div>
             </div>
          </div>
       </div>

       <div className="mt-12 pt-12 border-t border-white/5">
         <SectionHeader title="Kinetic ESP Submersible Simulator" subtitle="Centrifugal Impeller & Shaft Dynamics" />
         <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40 mt-6 h-[400px] flex items-center justify-center">
            <ESPSimulator3D rate={rate * (hz/60)} hz={hz} />
         </div>
       </div>
    </motion.div>
  );
}

function ESPSimulator3D({ rate, hz }: { rate: number, hz: number }) {
  const duration = Math.max(0.05, 60 / hz);
  const flowIntensity = Math.min(50, Math.floor(Math.max(5, rate / 100)));

  return (
    <svg viewBox="0 0 400 200" className="w-full h-full max-w-[400px]">
      {/* Casing */}
      <rect x="175" y="10" width="50" height="180" fill="#1e293b" stroke="#334155" strokeWidth="2" />
      
      {/* Production Tubing */}
      <rect x="185" y="0" width="30" height="40" fill="#334155" />
      
      {/* Intake / Gas Separator */}
      <rect x="185" y="140" width="30" height="30" fill="#475569" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
      
      {/* ESP Housing (Pump Section) */}
      <rect x="185" y="40" width="30" height="100" fill="#475569" rx="2" />
      
      {/* Rotating Shaft */}
      <motion.rect x="198" y="40" width="4" height="130" fill="#cbd5e1" 
         animate={{ x: [198, 196, 200, 198] }}
         transition={{ repeat: Infinity, duration: duration, ease: "linear" }}
      />
      
      {/* Impeller Stages */}
      {[50, 70, 90, 110, 130].map((y, i) => (
         <motion.path key={i} d={`M 185 ${y} L 215 ${y} L 205 ${y-10} L 195 ${y-10} Z`} fill="#818cf8"
            animate={{ scaleX: [1, -1, 1] }}
            transition={{ repeat: Infinity, duration: duration, delay: i * 0.05, ease: "linear" }}
            style={{ transformOrigin: `200px ${y-5}px` }}
         />
      ))}
      
      {/* Motor Section */}
      <rect x="185" y="170" width="30" height="30" fill="#312e81" rx="2" />
      
      {/* Power Cable */}
      <path d="M 175 180 Q 150 180 150 0" fill="none" stroke="#f59e0b" strokeWidth="3" />
      
      {/* Fluid Flowing Up */}
      {[...Array(flowIntensity)].map((_, i) => (
         <motion.circle key={i} r="2" fill="#06b6d4" opacity="0.8"
            initial={{ cx: 185 + Math.random() * 30, cy: 150 + Math.random() * 20 }}
            animate={{ cy: 0, opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: duration * 15, delay: Math.random() * 2 }}
         />
      ))}
    </svg>
  );
}

function GasLiftTool({ onUpdateStats }: { onUpdateStats: (stats: any) => void }) {
  const [injectionRate, setInjectionRate] = useState(1.5); // MMSCFD
  const [injectionPressure, setInjectionPressure] = useState(1200); // PSI
  const [depth, setDepth] = useState(6000); // FT

  React.useEffect(() => {
     onUpdateStats({ 
       eff: Math.max(10, 100 - (injectionRate * 10)).toFixed(1) + '%', 
       hp: formatNumber(injectionPressure * injectionRate * 0.5, 0) + ' HP (Comp)'
     });
  }, [injectionRate, injectionPressure, onUpdateStats]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a]"
    >
       <div className="mb-12 flex justify-between items-center">
          <div>
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Gas <span className="text-amber-500">Lift Design</span></h3>
             <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Injection Pressure vs Depth Multi-valve Unloading</p>
          </div>
          <div className="p-6 bg-amber-500/10 rounded-3xl border border-amber-500/20 text-center">
             <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest block mb-1">Required Compressor</span>
             <span className="text-3xl font-black text-white italic">{formatNumber(injectionPressure * injectionRate * 0.5, 0)} <span className="text-sm font-normal text-slate-500">HP</span></span>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <InputGroup label="Injection Rate" unit="MMSCFD" value={injectionRate} onChange={setInjectionRate} min={0.5} max={10} step={0.5} />
          <InputGroup label="Injection Pressure" unit="PSI" value={injectionPressure} onChange={setInjectionPressure} min={500} max={3000} step={100} />
          <InputGroup label="Operating Depth" unit="FT" value={depth} onChange={setDepth} min={2000} max={12000} step={500} />
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { d: 0, p: injectionPressure, grad: 1000 },
                  { d: depth * 0.25, p: injectionPressure + (depth * 0.25 * 0.05), grad: 1600 },
                  { d: depth * 0.5, p: injectionPressure + (depth * 0.5 * 0.05), grad: 2200 },
                  { d: depth * 0.75, p: injectionPressure + (depth * 0.75 * 0.05), grad: 2800 },
                  { d: depth, p: injectionPressure + (depth * 0.05), grad: 3400 },
                ]} layout="vertical">
                   <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" />
                   <XAxis type="number" stroke="#475569" fontSize={10} />
                   <YAxis dataKey="d" type="number" stroke="#475569" fontSize={10} reversed />
                   <Tooltip />
                   <Line type="monotone" dataKey="p" stroke="#f59e0b" strokeWidth={3} name="Injection Grad" />
                   <Line type="monotone" dataKey="grad" stroke="#475569" strokeWidth={2} name="Fluid Grad" />
                </LineChart>
             </ResponsiveContainer>
          </div>
          <div className="space-y-6">
             <div className="p-8 bg-white/5 rounded-2xl border border-white/5">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Kinetic Gas Lift Simulator</h4>
                <div className="h-[250px] flex justify-center items-center">
                   <GasLiftSimulator3D injectionRate={injectionRate} pressure={injectionPressure} />
                </div>
             </div>
          </div>
       </div>

       <div className="mt-12 pt-12 border-t border-white/5">
         <SectionHeader title="Gas Lift Valve & Mandrel Specifications" subtitle="API 19G Industry Standards" />
         <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-6">
           <div className="space-y-4">
             {GAS_LIFT_VALVE_SPECS.map((v, i) => (
               <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                 <div className="text-[11px] font-bold text-amber-400 uppercase mb-2">{v.type}</div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <p className="text-[10px] text-slate-600 uppercase">Standard Sizes</p>
                     <p className="text-[10px] text-white font-mono">{v.sizes.join(" / ")}</p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] text-slate-600 uppercase">Bellows Rating</p>
                     <p className="text-[10px] text-white font-mono">{v.charge}</p>
                   </div>
                 </div>
                 <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-slate-500 italic">
                   Available Ports: {v.ports} (Larger port = Higher throughput)
                 </div>
               </div>
             ))}
           </div>
           <div className="space-y-4">
             <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
               <p className="text-[11px] text-slate-500 font-bold uppercase mb-3">Wireline Retrievable Mandrels</p>
               <div className="space-y-2">
                 {GAS_LIFT_MANDRELS.map((m, i) => (
                    <div key={i} className="flex justify-between text-[10px]">
                      <span className="text-text-tertiary">For {m.tubing}" Tubing</span>
                      <span className="text-white font-mono">{m.mandrelOD}" Mandrel OD</span>
                    </div>
                 ))}
               </div>
             </div>
             <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                <p className="text-[11px] text-slate-500 font-bold uppercase mb-2">Design Gradients</p>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <p className="text-[10px] text-slate-600 uppercase">Injection Gas SG</p>
                      <p className="text-[10px] text-white font-mono">0.65 - 0.75</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-slate-600 uppercase">Geo Gradient</p>
                      <p className="text-[10px] text-white font-mono">1.2 - 1.8°F/100ft</p>
                   </div>
                </div>
             </div>
           </div>
         </div>
       </div>
    </motion.div>
  );
}

function MetricRow({ label, val, unit }: { label: string, val: string, unit: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
       <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
       <div className="flex items-baseline gap-2">
          <span className="text-xs font-black text-white italic">{val}</span>
          <span className="text-[10px] text-slate-700 uppercase font-bold">{unit}</span>
       </div>
    </div>
  );
}

function ValveStep({ label, depth, status, active }: { label: string, depth: string, status: string, active?: boolean }) {
  return (
    <div className="flex items-center justify-between">
       <div>
          <span className="text-[11px] font-black text-white uppercase block">{label}</span>
          <span className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">{depth}</span>
       </div>
       <span className={cn(
          "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
          active ? "bg-amber-500 text-black" : "bg-white/5 text-slate-700"
       )}>{status}</span>
    </div>
  );
}

function InputGroup({ label, unit, value, onChange, min, max, step = 1 }: { label: string, unit: string, value: number, onChange: (v: number) => void, min: number, max: number, step?: number }) {
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

function BeamPumpSimulator3D({ spm, strokeLength }: { spm: number, strokeLength: number }) {
  const duration = 60 / spm;
  const rotationAngle = Math.min(25, strokeLength / 6); // visual scaling
  
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Foundation */}
      <rect x="20" y="160" width="160" height="10" fill="#1e293b" />
      
      {/* Samson Post */}
      <path d="M 90 160 L 100 80 L 110 160 Z" fill="#334155" />
      
      {/* Walking Beam Group */}
      <motion.g 
         style={{ transformOrigin: "100px 80px" }}
         animate={{ rotate: [rotationAngle, -rotationAngle, rotationAngle] }}
         transition={{ repeat: Infinity, duration: duration, ease: "easeInOut" }}
      >
        {/* Beam */}
        <rect x="30" y="75" width="140" height="10" fill="#06b6d4" />
        
        {/* Horsehead */}
        <path d="M 30 75 Q 15 100 30 130 L 40 75 Z" fill="#06b6d4" />
        
        {/* Pitman Arm connection point */}
        <circle cx="150" cy="80" r="4" fill="#fff" />
      </motion.g>
      
      {/* Wellhead */}
      <rect x="20" y="140" width="20" height="20" fill="#475569" />
      
      {/* Polished Rod (Animated vertically based on beam angle) */}
      <motion.line 
         x1="27" 
         x2="27" 
         stroke="#e2e8f0" 
         strokeWidth="2"
         animate={{ y1: [140, 90, 140], y2: [180, 180, 180] }}
         transition={{ repeat: Infinity, duration: duration, ease: "easeInOut" }}
      />
      
      {/* Counterweight & Crank (Animated rotation) */}
      <motion.g
         style={{ transformOrigin: "140px 140px" }}
         animate={{ rotate: [0, 360] }}
         transition={{ repeat: Infinity, duration: duration, ease: "linear" }}
      >
         {/* Crank Arm */}
         <line x1="140" y1="140" x2="160" y2="120" stroke="#475569" strokeWidth="6" />
         {/* Counterweight */}
         <path d="M 155 115 A 15 15 0 1 0 170 130 L 140 140 Z" fill="#64748b" />
      </motion.g>
      
      {/* Pitman Arm (connecting crank to beam) - Visual approximation */}
      <motion.line 
         stroke="#94a3b8" 
         strokeWidth="4"
         animate={{ 
            x1: [160, 120, 160], 
            y1: [120, 160, 120],
            x2: [150, 150, 150], 
            y2: [90, 70, 90] 
         }}
         transition={{ repeat: Infinity, duration: duration, ease: "linear" }}
      />
    </svg>
  );
}

function GasLiftSimulator3D({ injectionRate, pressure }: { injectionRate: number, pressure: number }) {
  const speed = Math.max(0.1, 2 / injectionRate);
  const bubbleCount = Math.min(30, Math.floor(injectionRate * 5));

  return (
    <svg viewBox="0 0 200 300" className="w-full h-full max-w-[200px]">
      {/* Casing */}
      <rect x="70" y="0" width="60" height="300" fill="#1e293b" stroke="#334155" strokeWidth="2" />
      
      {/* Tubing */}
      <rect x="90" y="0" width="20" height="280" fill="#334155" stroke="#475569" />
      
      {/* Gas Lift Mandrel / Valve */}
      <rect x="110" y="150" width="10" height="20" fill="#f59e0b" rx="2" />
      <polygon points="110,160 110,155 105,157" fill="#f59e0b" />
      
      {/* Annulus Gas Flow */}
      {[...Array(10)].map((_, i) => (
         <motion.line key={`g-${i}`} 
            x1="115" x2="115"
            stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4"
            initial={{ y1: 0, y2: 10 }}
            animate={{ y1: 150, y2: 160 }}
            transition={{ repeat: Infinity, duration: speed * 2, delay: Math.random() * speed }}
         />
      ))}
      
      {/* Fluid Inflow (Bottom) */}
      <motion.path d="M 100 300 L 100 280" stroke="#06b6d4" strokeWidth="16" strokeDasharray="4 2"
         animate={{ strokeDashoffset: [0, -10] }}
         transition={{ repeat: Infinity, duration: speed * 1.5, ease: "linear" }}
      />
      
      {/* Bubbles entering tubing & lightening column */}
      {[...Array(bubbleCount)].map((_, i) => (
         <motion.circle key={`b-${i}`} r={1 + Math.random() * 2} fill="#f59e0b" opacity="0.8"
            initial={{ cx: 95 + Math.random() * 10, cy: 160 }}
            animate={{ cy: 0, opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: speed, delay: Math.random() * speed }}
         />
      ))}
    </svg>
  );
}
