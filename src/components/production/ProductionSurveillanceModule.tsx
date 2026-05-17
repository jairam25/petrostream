import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Radio, TestTube, BarChart2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';

export function ProductionSurveillanceModule() {
  const [activePhase, setActivePhase] = useState<'10A' | '10B' | '10C' | '10D'>('10A');
  const phases = [
    { id: '10A', name: 'PLT Logging', icon: TestTube },
    { id: '10B', name: 'Fiber Optic', icon: Radio },
    { id: '10C', name: 'Well Testing', icon: Eye },
    { id: '10D', name: 'Reservoir Surveillance', icon: BarChart2 },
  ];

  const [pltFlowRate, setPltFlowRate] = useState(500); // BPD (10A)
  const [dtsTemperature, setDtsTemperature] = useState(150); // °F (10B)
  const [ptaDrawdown, setPtaDrawdown] = useState(500); // psi (10C)
  const [vrr, setVrr] = useState(1.0); // Ratio (10D)

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '10A': { items: [
      { title: 'Flow Measurement Tools', desc: 'Spinner (fullbore or diverter) measures velocity profile. Gradiomanometer measures mixture density (holdup). Capacitance/resistance probes measure water fraction. Temperature and pressure gauges complete the suite.' },
      { title: 'Flow Profile Interpretation', desc: 'Zonal contribution (% flow from each perforated interval). Water/gas entry identification from spinner + holdup response. Crossflow detection when well is shut in. Thief zone identification.' },
      { title: 'PLT Deployment', desc: 'Wireline (flowing and shut-in passes). Coiled tubing in highly deviated or horizontal wells. Memory gauges run on slickline. Real-time surface readout for critical wells.' },
      { title: 'Composite Log', desc: 'Combines flow, holdup, temperature, and pressure into a single depth-referenced display. Identifies zones of crossflow, coning, and bypass. Input for production allocation and workover decisions.' },
    ]},
    '10B': { items: [
      { title: 'DTS (Temperature Sensing)', desc: 'Measures temperature continuously along the wellbore using Raman backscattering. Spatial resolution 1-2 m. Warm-back analysis after injection gives flow profiling. Key tool for steam chamber monitoring in SAGD.' },
      { title: 'DAS (Acoustic Sensing)', desc: 'Records acoustic signal (microseismic, flow noise, sand noise) using Rayleigh backscattering. Detects sand production (broadband noise), leaks (distinctive acoustic signature), and fracture events in real time.' },
      { title: 'DSS (Strain Sensing)', desc: 'Distributed strain sensing using Brillouin scattering. Detects formation compaction, casing deformation, and subsidence. Important in chalk and weak sandstone reservoirs.' },
      { title: 'Cluster Efficiency (Frac)', desc: 'DTS warm-back after multi-stage fracturing shows which clusters received fluid. Cold zones = fluid entered, warm zones = no fluid. Quantifies ineffective perforation clusters.' },
    ]},
    '10C': { items: [
      { title: 'Pressure Transient Analysis (PTA)', desc: 'Buildup (BU) and drawdown (DD) tests. Log-log diagnostic plot: infinite-acting radial flow (IARF) gives kh and skin. Boundary effects in late time. Deconvolution allows PTA from variable-rate production history.' },
      { title: 'MPFM & Virtual Metering', desc: 'Multiphase Flow Meter provides continuous flow rates without test separator. Gamma-ray / microwave / venturi sensors. Virtual meter (soft sensor) uses well model + surface data to back-calculate downhole rates.' },
      { title: 'Surface Well Testing', desc: 'Extended Well Test (EWT) for exploration wells. Rate-pressure relationships. Separator metering. Flaring management. Objective: reservoir characterization and early production.' },
      { title: 'Deconvolution', desc: 'Allows PTA from noisy variable-rate history without a clean shut-in. Converts variable rate/pressure response to equivalent unit-rate drawdown. Reveals boundary effects invisible in short conventional BU tests.' },
    ]},
    '10D': { items: [
      { title: 'Production Decline Analysis', desc: 'Rate vs time (Arps: exponential, hyperbolic, harmonic). WOR and GOR trend monitoring. WOR slope change indicates water channeling or coning. GOR rise indicates gas cap or dissolved gas production.' },
      { title: 'Pattern Surveillance (Waterflood)', desc: 'Voidage Replacement Ratio (VRR = injection / production in RB/RB). WOR diagnostic plots (dWOR/dt). Inter-well connectivity via Capacitance-Resistance Model (CRM). Pattern balancing.' },
      { title: 'Production Allocation', desc: 'Well test rates allocated back through the gathering system. MPFM and virtual meters supplement infrequent well tests. Fiscal metering vs operational metering.' },
      { title: 'Anomaly Detection', desc: 'Deviation from expected production trend triggers investigation. Possible causes: scaling, sand, slugging, equipment failure, zonal breakthrough, reservoir heterogeneity. Statistical and ML-based methods used.' },
    ]},
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Eye className="text-indigo-500" size={32} />
          Phase 10: Production Surveillance <span className="text-indigo-500/50">Monitoring & Diagnostics</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Data Acquisition & Reservoir Insight</p>
      </div>
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {phases.map(p => (
          <button key={p.id} onClick={() => setActivePhase(p.id as any)}
            className={cn("px-5 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
              activePhase === p.id ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-white")}>
            <p.icon size={13} />{p.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activePhase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-4">
               <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] space-y-6">
                  <h3 className="text-xl font-black text-white italic">Diagnostics Control</h3>
                  {activePhase === '10A' && <InputWithSlider label="Zonal Flow Rate (BPD)" value={pltFlowRate} min={100} max={1000} step={50} unit="BPD" onChange={setPltFlowRate} />}
                  {activePhase === '10B' && <InputWithSlider label="DTS Warm-back Temp (°F)" value={dtsTemperature} min={50} max={200} step={5} unit="°F" onChange={setDtsTemperature} />}
                  {activePhase === '10C' && <InputWithSlider label="Drawdown Pressure (psi)" value={ptaDrawdown} min={100} max={1000} step={50} unit="psi" onChange={setPtaDrawdown} />}
                  {activePhase === '10D' && <InputWithSlider label="Voidage Replacement Ratio" value={vrr} min={0.5} max={1.5} step={0.1} unit="VRR" onChange={setVrr} />}
                  
                  <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center">
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Signal Status</p>
                     <p className="text-2xl font-black italic text-indigo-400">
                        {activePhase === '10A' ? (pltFlowRate < 300 ? "Low Contribution" : "Active Zone") : ""}
                        {activePhase === '10B' ? (dtsTemperature > 160 ? "Hot Spot (Fluid Entry)" : "Cool Zone") : ""}
                        {activePhase === '10C' ? (ptaDrawdown > 800 ? "High Skin/Damage" : "Good Permeability") : ""}
                        {activePhase === '10D' ? (vrr < 1.0 ? "Pressure Depletion" : "Sweep Supported") : ""}
                     </p>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
               <SurveillanceSimulator3D mode={activePhase} title={`${phases.find(p=>p.id === activePhase)?.name} Simulator`} params={{ plt: pltFlowRate, dts: dtsTemperature, pta: ptaDrawdown, vrr }} />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {content[activePhase].items.map(item => (
                   <div key={item.title} className="glass-card p-6 rounded-3xl border-white/5 bg-indigo-500/5 hover:border-indigo-500/30 transition-all">
                     <h5 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-2">{item.title}</h5>
                     <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SurveillanceSimulator3D({ mode, title, params }: { mode: string, title: string, params: any }) {
   const { plt = 500, dts = 150, pta = 500, vrr = 1.0 } = params;

   return (
      <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] h-[250px] flex flex-col relative overflow-hidden">
         <h3 className="text-sm font-black text-indigo-500 uppercase tracking-widest mb-2 italic z-10">{title}</h3>
         <div className="flex-1 w-full flex items-center justify-center">
            <svg viewBox="0 0 500 200" className="w-full h-full max-w-[600px] overflow-visible">
               
               {mode === '10A' && (
                  <g transform="translate(250, 0)">
                     {/* Wellbore */}
                     <rect x="-30" y="0" width="60" height="200" fill="#ffffff05" stroke="#ffffff20" strokeWidth="2" />
                     {/* Fluid flow */}
                     <motion.path d="M -15 200 L -15 0 M 15 200 L 15 0" stroke="#3b82f6" strokeWidth="4" strokeDasharray="10 20" animate={{ strokeDashoffset: [0, -100] }} transition={{ repeat: Infinity, duration: Math.max(0.1, 100/plt), ease: "linear" }} />
                     
                     {/* PLT Tool */}
                     <motion.g animate={{ y: [20, 140, 20] }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }}>
                        <line x1="0" y1="-200" x2="0" y2="20" stroke="#ffffff" strokeWidth="1" />
                        <rect x="-10" y="20" width="20" height="60" fill="#6366f1" rx="4" />
                        {/* Spinner */}
                        <motion.ellipse cx="0" cy="90" rx="15" ry="5" fill="#fbbf24" animate={{ rotateY: 360 }} transition={{ repeat: Infinity, duration: Math.max(0.1, 50/plt), ease: "linear" }} />
                        <line x1="0" y1="80" x2="0" y2="100" stroke="#fbbf24" strokeWidth="2" />
                     </motion.g>
                  </g>
               )}

               {mode === '10B' && (
                  <g transform="translate(50, 80)">
                     {/* Wellbore */}
                     <rect x="0" y="0" width="400" height="40" fill="#ffffff05" stroke="#ffffff20" strokeWidth="2" />
                     {/* Fiber Cable */}
                     <path d="M 0 5 L 400 5" stroke="#ffffff" strokeWidth="2" />
                     
                     {/* Heatmap warm-back based on dts */}
                     {(() => {
                        const tempColor = dts > 150 ? '#ef4444' : dts > 100 ? '#f59e0b' : '#3b82f6';
                        const spread = (dts / 200) * 150;
                        return (
                           <>
                              <motion.ellipse cx="200" cy="20" rx={spread} ry="30" fill={tempColor} fillOpacity="0.4" filter="blur(10px)" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} />
                              {[...Array(5)].map((_, i) => (
                                 <motion.circle key={i} cx={200} cy={20} r="10" stroke="#ffffff" strokeWidth="1" fill="none" animate={{ r: [10, 50], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: i*0.2 }} />
                              ))}
                           </>
                        )
                     })()}
                  </g>
               )}

               {mode === '10C' && (
                  <g transform="translate(100, 20)">
                     {/* Axes */}
                     <polyline points="0,150 0,0" stroke="#ffffff40" strokeWidth="2" />
                     <polyline points="0,150 300,150" stroke="#ffffff40" strokeWidth="2" />
                     <text x="-20" y="75" fill="#64748b" fontSize="10" transform="rotate(-90 -20 75)">ΔP / ΔP'</text>
                     <text x="150" y="170" fill="#64748b" fontSize="10">dt</text>
                     
                     {/* Pressure derivative curve moving based on PTA Drawdown */}
                     {(() => {
                        const shift = (pta / 1000) * 80;
                        return (
                           <>
                              <motion.path d={`M 20 ${130 - shift} Q 100 ${130 - shift} 150 ${150 - shift} T 280 ${130 - shift}`} fill="none" stroke="#6366f1" strokeWidth="4" />
                              <motion.path d={`M 20 ${90 - shift} Q 100 ${90 - shift} 150 ${110 - shift} T 280 ${90 - shift}`} fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5 5" />
                              <text x="290" y={130 - shift} fill="#6366f1" fontSize="12" dominantBaseline="middle">IARF</text>
                           </>
                        )
                     })()}
                  </g>
               )}

               {mode === '10D' && (
                  <g transform="translate(50, 50)">
                     {/* Injector Well */}
                     <rect x="0" y="0" width="20" height="100" fill="#3b82f6" />
                     <text x="10" y="-10" fill="#3b82f6" fontSize="10" textAnchor="middle">Inj</text>
                     {/* Producer Well */}
                     <rect x="380" y="0" width="20" height="100" fill="#ef4444" />
                     <text x="390" y="-10" fill="#ef4444" fontSize="10" textAnchor="middle">Prod</text>
                     
                     {/* Water Front based on VRR */}
                     {(() => {
                        const frontPosition = (vrr / 1.5) * 300;
                        return (
                           <>
                              <rect x="20" y="10" width={Math.max(0, frontPosition)} height="80" fill="#3b82f6" fillOpacity="0.3" />
                              <rect x={20 + frontPosition} y="10" width={Math.max(0, 360 - frontPosition)} height="80" fill="#f59e0b" fillOpacity="0.5" />
                              <motion.path d={`M 20 50 L ${10 + frontPosition} 50`} stroke="#3b82f6" strokeWidth="4" strokeDasharray="10 10" animate={{ strokeDashoffset: [-20, 0] }} transition={{ repeat: Infinity, duration: Math.max(0.5, 2 - vrr) }} />
                              <text x={30 + frontPosition} y="45" fill="#ffffff" fontSize="10">Sweep Front</text>
                           </>
                        )
                     })()}
                  </g>
               )}

            </svg>
         </div>
      </div>
   );
}
