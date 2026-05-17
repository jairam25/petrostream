import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Factory, Droplets, Wind, Waves } from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';

export function SurfaceFacilitiesModule() {
  const [activePhase, setActivePhase] = useState<'9A' | '9B' | '9C' | '9D' | '9E'>('9A');
  const phases = [
    { id: '9A', name: 'Wellhead', icon: Factory },
    { id: '9B', name: 'Separation', icon: Waves },
    { id: '9C', name: 'Oil Treatment', icon: Droplets },
    { id: '9D', name: 'Gas Treatment', icon: Wind },
    { id: '9E', name: 'Water Treatment', icon: Waves },
  ];

  const [chokeSize, setChokeSize] = useState(32); // /64ths (9A)
  const [retentionTime, setRetentionTime] = useState(5); // min (9B)
  const [heaterTemp, setHeaterTemp] = useState(160); // °F (9C)
  const [glycolRate, setGlycolRate] = useState(3); // gal/lb (9D)
  const [hydrocyclonePressure, setHydrocyclonePressure] = useState(50); // psi (9E)

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '9A': { items: [
      { title: 'Wellhead Components', desc: 'Casing head → Tubing head → Christmas tree (master valve, wing valve, swab valve). Pressure ratings: 2K, 5K, 10K, 15K psi. Manual/hydraulic actuation. ASME/API 6A standard.' },
      { title: 'Surface Safety Valve (SSV)', desc: 'Actuated by ESD (Emergency Shutdown) system. Closes wellhead on high/low pressure, fire, or loss of control signal. Last line of defense at surface.' },
      { title: 'SCSSV (Downhole Safety Valve)', desc: 'Tubing-retrievable or wireline-retrievable. Hydraulically controlled from surface. Typically set 100+ ft below mudline offshore. API 14A standard.' },
      { title: 'Choke Manifold', desc: 'Adjustable bean size controls flow rate. Fixed vs variable choke. Erosion-resistant tungsten carbide beans for high velocity / sandy service.' },
    ]},
    '9B': { items: [
      { title: 'Gravity Separation', desc: 'Oil-gas-water separate by density in a vessel with sufficient retention time: oil 3-10 min, water 5-15 min. Internals: inlet diverter, mist extractor, coalescing plates, weir, vortex breaker.' },
      { title: 'Separator Types', desc: 'Horizontal: preferred for high GOR and large liquid volumes. Vertical: small footprint for offshore. Spherical: compact, FPSO applications. Two-phase (oil+gas) vs three-phase (oil+gas+water).' },
      { title: 'Multistage Separation', desc: 'Two to three separator stages plus stock tank. Flash calculation at each stage determines optimal separator pressures to maximize C₅+ liquids recovery. Equal pressure ratio rule of thumb for initial design.' },
      { title: 'Mist Extractor', desc: 'Wire mesh pad (0.005" wire) or vane pack captures entrained liquid droplets from gas stream. Rated by droplet size removed (typically >10 microns).' },
    ]},
    '9C': { items: [
      { title: 'Dehydration', desc: 'Free Water Knockout (FWKO) removes bulk water. Heater treater combines heat + chemical + settling. Electrostatic treater uses AC or DC electric field to coalesce water droplets. BS&W target: < 0.5%.' },
      { title: 'Desalting', desc: 'Wash water injected and mixed into crude, then coalesced electrostatically to remove formation salts. Pipeline/refinery salt spec: typically < 10 PTB (pounds of salt per 1,000 barrels).' },
      { title: 'Crude Stabilization', desc: 'Flash stabilizer or reflux column removes light ends (C₁-C₄) to meet vapor pressure (RVP) specification for safe storage and transport. Maximizes C₅+ liquid recovery.' },
      { title: 'Tank Farm', desc: 'Floating roof tanks for crude storage. Fixed roof + internal floating roof for condensates. API 650 standard. Vapor recovery unit (VRU) to capture tank vapors.' },
    ]},
    '9D': { items: [
      { title: 'Glycol Dehydration', desc: 'TEG (triethylene glycol) absorber removes water vapour. TEG regenerator (still column + reboiler) strips water at 200°C. Glycol loss rate, contactor tray efficiency, dew point specification (typically -20 to -40°C).' },
      { title: 'Amine Gas Sweetening', desc: 'MDEA, DEA, or MDEA blends absorb H₂S and CO₂ selectively. Absorber + stripper (regenerator) loop. MDEA is selective for H₂S over CO₂. Sulfinol-M for high acid gas concentrations.' },
      { title: 'NGL Recovery', desc: 'Turboexpander plant (cryogenic): highest recovery (-100°C). Lean oil absorption. JT (Joule-Thomson) valve: simple, for lean gas, no moving parts. GPM (gallons per MCF) of C₃+ determines economics.' },
      { title: 'Claus Sulfur Recovery', desc: '2H₂S + SO₂ → 3S + 2H₂O. Thermal stage (1000°C) + 2-3 catalytic converter stages. Tail gas treating (SCOT) brings recovery to >99.8%. Liquid sulfur to sulfur pit/block.' },
    ]},
    '9E': { items: [
      { title: 'Produced Water Treatment', desc: 'Oil removal: skim tank → CPI (corrugated plate interceptor) → flotation (IGF induced gas, or DGF dissolved gas). Hydrocyclones for solids. Degasser removes H₂S and dissolved gas.' },
      { title: 'Discharge Spec', desc: 'Overboard discharge (offshore): typically < 30 mg/L dispersed oil (OSPAR). Land discharge: stricter local regulations. Reinjection: solids < 2 mg/L, particle size < 5 micron to preserve injectivity.' },
      { title: 'Water Injection Treatment', desc: 'Seawater source: deaeration (< 20 ppb O₂), filtration (cartridge + guard), biocide injection, sulfate removal (nanofiltration SRP to prevent BaSO₄ scale). Iron control for formation water reinjection.' },
      { title: 'Injectivity Maintenance', desc: 'Membrane filtration for ultra-low solids. Injectivity testing: regular step-rate tests, Hall plot analysis of injection pressure vs cumulative injection to detect plugging.' },
    ]},
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Factory className="text-amber-500" size={32} />
          Phase 9: Surface Facilities <span className="text-amber-500/50">Separation & Treatment</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Surface Process Engineering</p>
      </div>
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {phases.map(p => (
          <button key={p.id} onClick={() => setActivePhase(p.id as any)}
            className={cn("px-5 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
              activePhase === p.id ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-slate-500 hover:text-white")}>
            <p.icon size={13} />{p.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activePhase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-4">
               <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] space-y-6">
                  <h3 className="text-xl font-black text-white italic">Process Control</h3>
                  {activePhase === '9A' && <InputWithSlider label="Choke Size (/64 in)" value={chokeSize} min={8} max={64} step={1} unit="/64" onChange={setChokeSize} />}
                  {activePhase === '9B' && <InputWithSlider label="Retention Time (min)" value={retentionTime} min={1} max={15} step={0.5} unit="min" onChange={setRetentionTime} />}
                  {activePhase === '9C' && <InputWithSlider label="Treater Temperature (°F)" value={heaterTemp} min={100} max={300} step={5} unit="°F" onChange={setHeaterTemp} />}
                  {activePhase === '9D' && <InputWithSlider label="Glycol Circ. Rate (gal/lb H₂O)" value={glycolRate} min={1} max={10} step={0.5} unit="gal/lb" onChange={setGlycolRate} />}
                  {activePhase === '9E' && <InputWithSlider label="Hydrocyclone dP (psi)" value={hydrocyclonePressure} min={10} max={100} step={5} unit="psi" onChange={setHydrocyclonePressure} />}
                  
                  <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">System Status</p>
                     <p className="text-2xl font-black italic text-amber-400">
                        {activePhase === '9A' ? (chokeSize < 16 ? "Restricted" : chokeSize > 48 ? "High Flow" : "Optimal") : ""}
                        {activePhase === '9B' ? (retentionTime < 3 ? "Poor Separation" : "Optimal Separation") : ""}
                        {activePhase === '9C' ? (heaterTemp < 130 ? "High Viscosity" : heaterTemp > 250 ? "Energy Waste" : "Optimal Coalescence") : ""}
                        {activePhase === '9D' ? (glycolRate < 2.5 ? "High Dew Point" : "Spec Met") : ""}
                        {activePhase === '9E' ? (hydrocyclonePressure < 30 ? "Poor Oil Rejection" : "High Efficiency") : ""}
                     </p>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
               <SurfaceFacilitySimulator3D mode={activePhase} title={`${phases.find(p=>p.id === activePhase)?.name} Simulator`} params={{ chokeSize, retentionTime, heaterTemp, glycolRate, hydrocyclonePressure }} />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {content[activePhase].items.map(item => (
                    <div key={item.title} className="glass-card p-6 rounded-3xl border-white/5 bg-amber-500/5 hover:border-amber-500/30 transition-all">
                      <h5 className="text-[11px] font-black text-amber-400 uppercase tracking-widest mb-2">{item.title}</h5>
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

function SurfaceFacilitySimulator3D({ mode, title, params }: { mode: string, title: string, params: any }) {
   const { chokeSize = 32, retentionTime = 5, heaterTemp = 160, glycolRate = 3, hydrocyclonePressure = 50 } = params;

   return (
      <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] h-[250px] flex flex-col relative overflow-hidden">
         <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-2 italic z-10">{title}</h3>
         <div className="flex-1 w-full flex items-center justify-center">
            <svg viewBox="0 0 500 200" className="w-full h-full max-w-[600px] overflow-visible">
               
               {mode === '9A' && (
                  <g transform="translate(150, 100)">
                     {/* Wellhead Choke */}
                     <rect x="-100" y="-20" width="100" height="40" fill="#ffffff10" />
                     <rect x="20" y="-20" width="150" height="40" fill="#ffffff10" />
                     {/* Choke Bean */}
                     <path d={`M 0 -20 L 20 ${-20 + (64 - chokeSize)/3} L 20 ${20 - (64 - chokeSize)/3} L 0 20 Z`} fill="#fbbf24" />
                     {/* Flow */}
                     <motion.path d="M -100 0 L 170 0" stroke="#3b82f6" strokeWidth={10 + chokeSize/3} strokeDasharray={`${chokeSize} 10`} animate={{ strokeDashoffset: [-100, 0] }} transition={{ repeat: Infinity, duration: Math.max(0.2, 2 - chokeSize/32), ease: "linear" }} />
                  </g>
               )}

               {mode === '9B' && (
                  <g transform="translate(50, 50)">
                     {/* Horizontal Separator */}
                     <rect x="0" y="0" width="400" height="100" rx="30" fill="none" stroke="#ffffff20" strokeWidth="4" />
                     <rect x="10" y="5" width="380" height="40" fill="#bae6fd" fillOpacity="0.2" />
                     <rect x="10" y="45" width="380" height="35" fill="#f59e0b" fillOpacity="0.6" />
                     <rect x="10" y="80" width="380" height="15" fill="#3b82f6" fillOpacity="0.8" />
                     
                     {(() => {
                        const poorSep = retentionTime < 5;
                        const numDrops = poorSep ? Math.floor(20 - retentionTime * 3) : 0;
                        return (
                           <>
                              {poorSep && [...Array(numDrops)].map((_, i) => (
                                 <motion.circle key={`w-in-o-${i}`} r="3" fill="#3b82f6" initial={{ cx: Math.random()*300+50, cy: 45 + Math.random()*30 }} animate={{ cy: [45 + Math.random()*30, 80], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 1+Math.random() }} />
                              ))}
                              {poorSep && [...Array(numDrops)].map((_, i) => (
                                 <motion.circle key={`o-in-w-${i}`} r="3" fill="#f59e0b" initial={{ cx: Math.random()*300+50, cy: 80 + Math.random()*10 }} animate={{ cy: [80 + Math.random()*10, 50], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 1+Math.random() }} />
                              ))}
                           </>
                        )
                     })()}
                  </g>
               )}

               {mode === '9C' && (
                  <g transform="translate(50, 50)">
                     {/* Treater */}
                     <rect x="0" y="0" width="400" height="100" fill="none" stroke="#ffffff20" strokeWidth="4" rx="10" />
                     <rect x="5" y="5" width="390" height="90" fill="#f59e0b" fillOpacity="0.5" />
                     <motion.path d="M 0 50 L 400 50" stroke="#ef4444" strokeWidth="2" strokeDasharray="10 5" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: Math.max(0.2, 300/heaterTemp) }} />
                     
                     {(() => {
                        const effectiveness = Math.min(1, (heaterTemp - 100) / 100);
                        return (
                           <>
                              {[...Array(20)].map((_, i) => (
                                 <motion.circle key={i} r={2 + effectiveness*5} fill="#3b82f6"
                                    initial={{ cx: 50 + i*15, cy: Math.random()*40+10 }}
                                    animate={{ cy: 90 }}
                                    transition={{ repeat: Infinity, duration: 2 - effectiveness, delay: Math.random() }}
                                 />
                              ))}
                           </>
                        )
                     })()}
                  </g>
               )}

               {mode === '9D' && (
                  <g transform="translate(150, 20)">
                     {/* Contactor Tower */}
                     <rect x="50" y="0" width="100" height="160" fill="none" stroke="#ffffff20" strokeWidth="4" rx="10" />
                     {[20, 50, 80, 110, 140].map((y, i) => <line key={i} x1="50" y1={y} x2="150" y2={y} stroke="#ffffff40" strokeWidth="2" strokeDasharray="5 2" />)}
                     <motion.path d="M 100 160 L 100 0" stroke="#bae6fd" strokeWidth="40" strokeDasharray="10 10" animate={{ strokeDashoffset: [0, -40] }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
                     
                     {(() => {
                        const drops = Math.floor(glycolRate * 5);
                        return [...Array(drops)].map((_, i) => (
                           <motion.circle key={i} r="3" fill="#3b82f6" initial={{ cx: 60 + Math.random()*80, cy: 0 }} animate={{ cy: 160 }} transition={{ repeat: Infinity, duration: 2, delay: Math.random()*2 }} />
                        ))
                     })()}
                  </g>
               )}

               {mode === '9E' && (
                  <g transform="translate(150, 50)">
                     {/* Hydrocyclone */}
                     <polygon points="0,0 200,0 120,100 80,100" fill="none" stroke="#ffffff20" strokeWidth="4" />
                     
                     {(() => {
                        const spinRate = hydrocyclonePressure / 20;
                        return (
                           <>
                              <motion.path d="M 100 0 L 100 100" stroke="#3b82f6" strokeWidth="40" strokeDasharray="10 5" animate={{ strokeDashoffset: [0, -20] }} transition={{ repeat: Infinity, duration: 1/spinRate, ease: "linear" }} />
                              <motion.path d="M 100 80 L 100 0" stroke="#f59e0b" strokeWidth={5 + spinRate*2} strokeDasharray="5 5" animate={{ strokeDashoffset: [0, 10] }} transition={{ repeat: Infinity, duration: 1/spinRate, ease: "linear" }} />
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
