import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Wrench, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';

export function WellIntegrityModule() {
  const [activePhase, setActivePhase] = useState<'11A' | '11B' | '11C'>('11A');
  const phases = [
    { id: '11A', name: 'Well Integrity', icon: ShieldCheck },
    { id: '11B', name: 'Workover', icon: Wrench },
    { id: '11C', name: 'Abandonment', icon: XCircle },
  ];

  const [casingPressure, setCasingPressure] = useState(500); // psi (11A)
  const [killWeightMW, setKillWeightMW] = useState(10); // ppg (11B)
  const [plugDepth, setPlugDepth] = useState(5000); // ft (11C)

  const content: Record<string, { items: { title: string; desc: string }[] }> = {
    '11A': { items: [
      { title: 'Barrier Philosophy', desc: 'NORSOK D-010 / API RP 96 requires two independent, tested barriers at all times. Primary barrier (tubing + SCSSV + packer) and secondary barrier (casing + wellhead + annular cement). Well Barrier Diagram (WBD) documents each element.' },
      { title: 'Casing Integrity', desc: 'Burst, collapse, and tension design to API 5CT. Casing wear from rotating drill string reduces wall thickness — caliper surveys quantify. Sustained Casing Pressure (SCP) indicates cement or tubing integrity failure.' },
      { title: 'Cement Integrity', desc: 'CBL/VDL (Cement Bond Log / Variable Density Log) and ultrasonic tools (USIT, Isolation Scanner) evaluate bond quality. Microannulus, channeling, and gas migration are primary failure modes. Squeeze cementing for repair.' },
      { title: 'Tubing Integrity', desc: 'Corrosion monitoring (coupon, ER probe), periodic pressure testing, caliper surveys. Tubing leaks identified by temperature anomaly (DTS), annular pressure buildup, or noise log.' },
    ]},
    '11B': { items: [
      { title: 'Well Killing', desc: 'Bullheading: pump kill weight fluid from surface against reservoir pressure. Circulation (forward or reverse): two-barrier method required during workover. Kill weight = (0.052 × MW × TVD) ≥ reservoir pressure.' },
      { title: 'Fishing', desc: 'Retrieve stuck/lost equipment (drill pipe, tubing, wireline). Tools: overshot (exterior catch), spear (internal catch), jar (hydraulic or mechanical), washover pipe (mill around fish), junk baskets, magnets.' },
      { title: 'Sidetracking & Re-entry', desc: 'Kick off from existing wellbore to a new target using a whipstock or open-hole sidetrack. Cement plug or whipstock set at kick-off point. Old hole section plugged and abandoned.' },
      { title: 'Recompletion & Zonal Isolation', desc: 'Change producing interval by perforating new zone and isolating old zone with bridge plug. Cement squeeze to isolate unwanted water or gas zones. Mechanical isolation: packer, plug.' },
    ]},
    '11C': { items: [
      { title: 'Plug & Abandon (P&A)', desc: 'Cement plugs placed across all permeable zones, casing shoes, and at surface. Verified by weight test (set plug supports pipe weight) and/or pressure test. Conductor cut and removed at surface.' },
      { title: 'Regulatory Requirements', desc: 'State/national P&A regulations govern plug depth, number, and material. Offshore: wellhead recovery, casing cut below mudline. Surface site restoration required. Liability transfer upon final P&A sign-off.' },
      { title: 'Permanent vs Temporary', desc: 'Temporary Abandonment (TA): well suspended with two barriers, periodic monitoring. Permanent Abandonment: all barriers set, wellhead removed, site restored. TA wells carry ongoing liability.' },
      { title: 'Cost Optimization', desc: 'Well abandonment is a major Liability item (OPEX). Late-life planning: slot recovery for reuse. P&A batch campaigns reduce rig and logistics cost. New P&A materials (bismuth alloys, thermite, expandable) being piloted.' },
    ]},
  };

  const dynamicBarrierElements = [
    { name: 'SCSSV', status: 'Tested', ok: true },
    { name: 'Tubing', status: 'Pressure Tested', ok: true },
    { name: 'Production Packer', status: 'Verified', ok: true },
    { name: 'Cement (Prod)', status: casingPressure > 3000 ? 'Microannulus' : 'CBL Passed', ok: casingPressure <= 3000 },
    { name: 'Wellhead', status: casingPressure > 1500 ? 'Leak Detected (SCP)' : 'Tested', ok: casingPressure <= 1500 },
    { name: 'Casing (Prod)', status: 'Rated OK', ok: true },
    { name: 'Cement (Surface)', status: casingPressure > 4000 ? 'Failed' : 'Verified', ok: casingPressure <= 4000 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <ShieldCheck className="text-green-500" size={32} />
          Phase 11: Well Integrity <span className="text-green-500/50">& Workover</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Barrier Assurance & Remediation</p>
      </div>
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit flex-wrap gap-1">
        {phases.map(p => (
          <button key={p.id} onClick={() => setActivePhase(p.id as any)}
            className={cn("px-5 py-2.5 rounded-[14px] flex items-center gap-2 transition-all text-[10px] font-black uppercase tracking-widest",
              activePhase === p.id ? "bg-green-500 text-black shadow-lg shadow-green-500/20" : "text-slate-500 hover:text-white")}>
            <p.icon size={13} />{p.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activePhase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
               <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] space-y-6">
                  <h3 className="text-xl font-black text-white italic">Operations Control</h3>
                  {activePhase === '11A' && <InputWithSlider label="Sustained Casing Pressure (psi)" value={casingPressure} min={0} max={5000} step={100} unit="psi" onChange={setCasingPressure} />}
                  {activePhase === '11B' && <InputWithSlider label="Kill Fluid Density (ppg)" value={killWeightMW} min={8} max={18} step={0.2} unit="ppg" onChange={setKillWeightMW} />}
                  {activePhase === '11C' && <InputWithSlider label="Target Plug Depth (ft)" value={plugDepth} min={1000} max={10000} step={500} unit="ft" onChange={setPlugDepth} />}
                  
                  <div className="p-5 rounded-2xl bg-green-500/10 border border-green-500/30 text-center">
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Condition Status</p>
                     <p className="text-2xl font-black italic text-green-400">
                        {activePhase === '11A' ? (casingPressure > 1500 ? "Barrier Failure (SCP)" : "Integrity Maintained") : ""}
                        {activePhase === '11B' ? (killWeightMW < 11.5 ? "Underbalanced (Kicking)" : "Overbalanced (Dead)") : ""}
                        {activePhase === '11C' ? (plugDepth > 8000 ? "Deep Isolation" : "Surface/Intermediate Plug") : ""}
                     </p>
                  </div>
               </div>

               {activePhase === '11A' && (
                  <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] space-y-3">
                     <h3 className="text-[11px] font-black text-green-400 uppercase tracking-widest mb-4">Well Barrier Status</h3>
                     {dynamicBarrierElements.map(be => (
                        <div key={be.name} className={cn("flex items-center justify-between p-4 rounded-2xl border transition-all",
                           be.ok ? "bg-green-500/5 border-green-500/20" : "bg-red-500/10 border-red-500/30")}>
                           <div>
                              <p className="text-[11px] font-black text-white uppercase tracking-widest">{be.name}</p>
                              <p className={cn("text-[11px] font-bold uppercase", be.ok ? "text-slate-500" : "text-red-400")}>{be.status}</p>
                           </div>
                           <div className={cn("w-2.5 h-2.5 rounded-full", be.ok ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500 shadow-[0_0_8px_#ef4444]")} />
                        </div>
                     ))}
                  </div>
               )}
            </div>

            <div className="lg:col-span-8 space-y-6">
               <IntegritySimulator3D mode={activePhase} title={`${phases.find(p=>p.id === activePhase)?.name} Simulator`} params={{ casingPressure, killWeightMW, plugDepth }} />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {content[activePhase].items.map(item => (
                   <div key={item.title} className="glass-card p-6 rounded-3xl border-white/5 bg-green-500/5 hover:border-green-500/30 transition-all">
                     <h5 className="text-[11px] font-black text-green-400 uppercase tracking-widest mb-2">{item.title}</h5>
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

function IntegritySimulator3D({ mode, title, params }: { mode: string, title: string, params: any }) {
   const { casingPressure = 0, killWeightMW = 10, plugDepth = 5000 } = params;

   return (
      <div className="glass-card rounded-3xl p-8 border-white/5 bg-[#05070a] h-[250px] flex flex-col relative overflow-hidden">
         <h3 className="text-sm font-black text-green-500 uppercase tracking-widest mb-2 italic z-10">{title}</h3>
         <div className="flex-1 w-full flex items-center justify-center">
            <svg viewBox="0 0 500 200" className="w-full h-full max-w-[600px] overflow-visible">
               
               {mode === '11A' && (
                  <g transform="translate(250, 20)">
                     {/* Surface Wellhead */}
                     <rect x="-20" y="0" width="40" height="30" fill="#ffffff20" />
                     {/* Production Casing */}
                     <rect x="-15" y="30" width="30" height="150" fill="none" stroke="#ffffff40" strokeWidth="2" />
                     {/* Tubing */}
                     <rect x="-5" y="30" width="10" height="150" fill="#ffffff20" />
                     {/* Packer */}
                     <rect x="-15" y="150" width="30" height="10" fill="#ef4444" />
                     
                     {/* Sustained Casing Pressure (SCP) Bubbles */}
                     {(() => {
                        const leakSeverity = Math.max(0, casingPressure - 1500) / 3500;
                        const numBubbles = Math.floor(leakSeverity * 20);
                        return (
                           <>
                              {numBubbles > 0 && [...Array(numBubbles)].map((_, i) => (
                                 <motion.circle key={i} r={Math.random()*2+1} fill="#ef4444" 
                                    initial={{ cx: (Math.random()-0.5)*20, cy: 150 }}
                                    animate={{ cy: 30, x: (Math.random()-0.5)*10 }}
                                    transition={{ repeat: Infinity, duration: 1+Math.random()*2, delay: Math.random()*2 }}
                                 />
                              ))}
                              {leakSeverity > 0 && <text x="30" y="50" fill="#ef4444" fontSize="10">SCP Detected</text>}
                           </>
                        )
                     })()}
                  </g>
               )}

               {mode === '11B' && (
                  <g transform="translate(250, 0)">
                     {/* Wellbore */}
                     <rect x="-20" y="20" width="40" height="160" fill="#ffffff10" />
                     
                     {/* Kill Fluid column */}
                     <rect x="-20" y="20" width="40" height="160" fill="#3b82f6" fillOpacity={killWeightMW / 20} />
                     
                     {/* Reservoir Gas Influx (Kicking) */}
                     {(() => {
                        const isKicking = killWeightMW < 11.5;
                        return (
                           <>
                              <path d="M -40 180 L -20 180 M 40 180 L 20 180" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 5" />
                              <text x="30" y="180" fill="#f59e0b" fontSize="10">Reservoir</text>
                              
                              {isKicking && [...Array(15)].map((_, i) => (
                                 <motion.circle key={i} r={Math.random()*4+2} fill="#f59e0b" opacity="0.8"
                                    initial={{ cx: (Math.random()-0.5)*30, cy: 180 }}
                                    animate={{ cy: 20 }}
                                    transition={{ repeat: Infinity, duration: 1+Math.random(), delay: Math.random() }}
                                 />
                              ))}
                              {!isKicking && <text x="-15" y="100" fill="#ffffff" fontSize="10" transform="rotate(-90 -15 100)">Well Dead</text>}
                           </>
                        )
                     })()}
                  </g>
               )}

               {mode === '11C' && (
                  <g transform="translate(250, 0)">
                     {/* Depth Scale */}
                     <line x1="-50" y1="20" x2="-50" y2="180" stroke="#ffffff40" strokeWidth="1" />
                     <text x="-70" y="25" fill="#ffffff40" fontSize="8">0 ft</text>
                     <text x="-80" y="180" fill="#ffffff40" fontSize="8">10,000 ft</text>
                     
                     {/* Casing */}
                     <rect x="-20" y="20" width="40" height="160" fill="none" stroke="#ffffff40" strokeWidth="2" />
                     
                     {/* Cement Plug based on plugDepth */}
                     {(() => {
                        const yPos = 20 + (plugDepth / 10000) * 160;
                        return (
                           <>
                              <rect x="-18" y={yPos - 20} width="36" height="40" fill="#94a3b8" />
                              <path d={`M -18 ${yPos - 20} L 18 ${yPos + 20} M 18 ${yPos - 20} L -18 ${yPos + 20}`} stroke="#475569" strokeWidth="2" />
                              <text x="30" y={yPos} fill="#94a3b8" fontSize="10" dominantBaseline="middle">TA/PA Plug</text>
                              <motion.line x1="0" y1="20" x2="0" y2={yPos - 20} stroke="#ffffff" strokeWidth="1" animate={{ y1: [0, 20] }} transition={{ repeat: Infinity, duration: 1 }} />
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
