import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Layers,
  Database,
  Thermometer,
  Zap,
  BarChart3,
  Microscope,
  Box,
  Droplet,
  Settings,
  Cpu,
  Target,
  FileText,
  ShieldCheck,
  TrendingUp,
  Workflow
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatNumber } from '../../lib/utils';
import { InputWithSlider, DataRow } from '../SharedUI';
import {
  calculateCoreyRelPerm,
  calculateLeverettJ,
  convertPc
} from '../../lib/reservoir';

export function RockPropertiesTab() {
  const [activePhase, setActivePhase] = useState<1 | 2 | 3 | 4>(1);

  // Phase 1: Core Analysis State
  const [coreInp, setCoreInp] = useState({
    bulkVolume: 100,
    grainVolume: 78,
    bulkDensity: 2.3,
    grainDensity: 2.65,
    porosity: 0.22,
    permeability: 150
  });

  // Phase 2: Permeability State
  const [permInp, setPermInp] = useState({
    kAbs: 150,
    phi: 0.22,
    grainSize: 0.15, // mm
    swi: 0.15,
    sor: 0.25,
    no: 2.5,
    nw: 3.2,
    kroMax: 0.9,
    krwMax: 0.3,
    meanPressure: 100,
    slope: 0.05
  });

  // Phase 3: Compressibility State
  const [compInp, setCompInp] = useState({
    phi: 0.22,
    cf: 4.5e-6, // formation/pore compressibility
    cr: 2.0e-6, // rock/grain compressibility
    deltaP: 2000
  });

  // Phase 4: Wettability & Capillary State
  const [wettabilityInp, setWettabilityInp] = useState({
    pcLab: 15,
    sigmaLab: 72,
    thetaLab: 0,
    sigmaRes: 30,
    thetaRes: 30,
    k: 150,
    phi: 0.22,
    contactAngle: 45
  });

  const relPermData = useMemo(() => {
    const data = [];
    for (let sw = 0; sw <= 1; sw += 0.05) {
      const { kro, krw } = calculateCoreyRelPerm(
        sw, 
        permInp.swi, 
        permInp.sor, 
        permInp.kroMax, 
        permInp.krwMax, 
        permInp.no, 
        permInp.nw
      );
      data.push({
        sw: Number(sw.toFixed(2)),
        kro: Number(kro.toFixed(3)),
        krw: Number(krw.toFixed(3))
      });
    }
    return data;
  }, [permInp]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Phase Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-black/40 p-8 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Rock Properties <span className="text-cyan-500/50">Terminal</span></h2>
          <p className="text-[10px] text-slate-500 font-black mt-1 uppercase tracking-widest italic">Lithology Characterization · Core Analytics · SCAL</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
          {[
            { id: 1, label: 'Ph.1: Core Analysis', icon: Microscope },
            { id: 2, label: 'Ph.2: Permeability', icon: Zap },
            { id: 3, label: 'Ph.3: Compaction', icon: Box },
            { id: 4, label: 'Ph.4: Capillary', icon: Droplet },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id as any)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activePhase === p.id 
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20" 
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              <p.icon size={13} />{p.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activePhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activePhase === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                  <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest italic mb-8">Volumetric Inputs</h3>
                  <div className="space-y-6">
                    <InputWithSlider label="Grain Density" value={coreInp.grainDensity} min={2.5} max={2.85} step={0.01} unit="g/cc" onChange={v => setCoreInp({...coreInp, grainDensity: v})} />
                    <InputWithSlider label="Bulk Density" value={coreInp.bulkDensity} min={1.8} max={2.6} step={0.01} unit="g/cc" onChange={v => setCoreInp({...coreInp, bulkDensity: v})} />
                    <InputWithSlider label="Bulk Volume" value={coreInp.bulkVolume} min={10} max={200} step={1} unit="cc" onChange={v => setCoreInp({...coreInp, bulkVolume: v})} />
                  </div>
                </div>
                <div className="p-10 bg-cyan-600/10 rounded-3xl border border-cyan-500/20 text-center shadow-lg shadow-cyan-500/5">
                   <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2 italic">Calculated Porosity</p>
                   <p className="text-5xl font-black text-white italic tracking-tighter">
                     {((1 - coreInp.bulkDensity / coreInp.grainDensity) * 100).toFixed(1)}<span className="text-xl text-slate-500 not-italic">%</span>
                   </p>
                </div>
              </div>

              <div className="lg:col-span-8 flex flex-col gap-8">
                <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[450px] flex items-center justify-center relative overflow-hidden">
                   <CoreScanner3D porosity={1 - coreInp.bulkDensity / coreInp.grainDensity} />
                </div>
                <div className="grid grid-cols-3 gap-6">
                   <ResultCard label="Grain Volume" value={(coreInp.bulkVolume * (coreInp.bulkDensity / coreInp.grainDensity)).toFixed(2)} unit="cc" />
                   <ResultCard label="Pore Volume" value={(coreInp.bulkVolume * (1 - coreInp.bulkDensity / coreInp.grainDensity)).toFixed(2)} unit="cc" />
                   <ResultCard label="Effective Φ" value={(coreInp.porosity * 0.95).toFixed(3)} unit="v/v" />
                </div>
              </div>
            </div>
          )}

          {activePhase === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                  <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest italic mb-8">Flow Modeling</h3>
                  <div className="space-y-6">
                    <InputWithSlider label="Absolute Perm (Ka)" value={permInp.kAbs} min={0.1} max={5000} step={1} unit="mD" onChange={v => setPermInp({...permInp, kAbs: v})} />
                    <InputWithSlider label="Porosity (Φ)" value={permInp.phi} min={0.01} max={0.4} step={0.01} unit="v/v" onChange={v => setPermInp({...permInp, phi: v})} />
                    <InputWithSlider label="Mean Pressure" value={permInp.meanPressure} min={10} max={200} step={1} unit="psi" onChange={v => setPermInp({...permInp, meanPressure: v})} />
                  </div>
                </div>
                <div className="glass-card rounded-3xl p-8 border-white/5 bg-cyan-600/5">
                   <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-6 italic">Derived Parameters</h4>
                   <div className="space-y-4">
                      <DataRow label="Klinkenberg (K_l)" value={permInp.kAbs / (1 + 0.05 / permInp.meanPressure)} unit="mD" src="Gas-slip" precision={2} />
                      <DataRow label="FZI (Flow Zone)" value={0.0314 * Math.sqrt(permInp.kAbs / permInp.phi)} unit="μm" src="Amaefule" precision={3} />
                      <DataRow label="Movable Saturation" value={1 - permInp.swi - permInp.sor} unit="v/v" src="Residual" precision={3} />
                   </div>
                </div>
              </div>

              <div className="lg:col-span-8 flex flex-col gap-8">
                <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[500px] flex items-center justify-center relative overflow-hidden">
                   <PoreNetwork3D perm={permInp.kAbs} relPermData={relPermData} />
                </div>
              </div>
            </div>
          )}

          {activePhase === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-4 space-y-6">
                <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                  <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest italic mb-8">Mechanical Stress</h3>
                  <div className="space-y-6">
                    <InputWithSlider label="Pore Comp. (Cf)" value={compInp.cf * 1e6} min={1} max={50} step={0.1} unit="μ/psi" onChange={v => setCompInp({...compInp, cf: v/1e6})} />
                    <InputWithSlider label="Grain Comp. (Cr)" value={compInp.cr * 1e6} min={1} max={10} step={0.1} unit="μ/psi" onChange={v => setCompInp({...compInp, cr: v/1e6})} />
                    <InputWithSlider label="Pressure Delta" value={compInp.deltaP} min={100} max={5000} step={100} unit="psi" onChange={v => setCompInp({...compInp, deltaP: v})} />
                  </div>
                </div>
                <div className="glass-card rounded-3xl p-8 border-white/5 bg-cyan-600/5">
                   <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-6 italic">Geomechanical Results</h4>
                   <div className="space-y-4">
                      <DataRow label="Total Ct" value={compInp.cf + compInp.phi * compInp.cr} unit="psi⁻¹" src="Derived" precision={8} />
                      <DataRow label="Bulk Modulus" value={1/(compInp.cf * compInp.phi)} unit="psi" src="Elastic" precision={0} />
                      <DataRow label="Voidage Coeff." value={Math.exp(compInp.cf * compInp.deltaP).toFixed(4)} unit="" src="P-dep" />
                   </div>
                </div>
               </div>

               <div className="lg:col-span-8">
                  <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[550px] flex items-center justify-center relative overflow-hidden">
                     <RockCompaction3D compression={compInp.cf * compInp.deltaP} />
                  </div>
               </div>
            </div>
          )}

          {activePhase === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-4 space-y-6">
                <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                  <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest italic mb-8">Interface Analytics</h3>
                  <div className="space-y-6">
                    <InputWithSlider label="Contact Angle (θ)" value={wettabilityInp.contactAngle} min={0} max={180} step={1} unit="deg" onChange={v => setWettabilityInp({...wettabilityInp, contactAngle: v})} />
                    <InputWithSlider label="Matrix Perm (k)" value={wettabilityInp.k} min={1} max={1000} step={1} unit="mD" onChange={v => setWettabilityInp({...wettabilityInp, k: v})} />
                    <InputWithSlider label="Porosity (Φ)" value={wettabilityInp.phi} min={0.01} max={0.4} step={0.01} unit="v/v" onChange={v => setWettabilityInp({...wettabilityInp, phi: v})} />
                  </div>
                </div>
                <div className="p-8 bg-cyan-600/10 rounded-3xl border border-cyan-500/20 text-center">
                   <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2 italic">Leverett J-Function</p>
                   <p className="text-4xl font-black text-white italic tracking-tighter">
                     {calculateLeverettJ(15, 72, wettabilityInp.contactAngle, wettabilityInp.k, wettabilityInp.phi).toFixed(3)}
                   </p>
                </div>
               </div>

               <div className="lg:col-span-8 flex flex-col gap-8">
                  <div className="glass-card rounded-3xl p-10 border-white/5 bg-gradient-to-tr from-[#05070a] to-cyan-900/10 h-[500px] flex items-center justify-center relative overflow-hidden">
                     <CapillaryPressure3D contactAngle={wettabilityInp.contactAngle} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                        <h5 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest mb-2 italic">Wettability State</h5>
                        <p className="text-lg font-black text-white italic">
                           {wettabilityInp.contactAngle < 70 ? "Water-Wet" : wettabilityInp.contactAngle > 110 ? "Oil-Wet" : "Intermediate"}
                        </p>
                     </div>
                     <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                        <h5 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest mb-2 italic">Threshold Pressure</h5>
                        <p className="text-lg font-black text-white italic">
                           {(0.5 * Math.sqrt(wettabilityInp.phi / wettabilityInp.k) * 20).toFixed(1)} <span className="text-[10px] text-slate-500 not-italic uppercase tracking-widest">PSI</span>
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── 3D Kinetic Simulators ─────────────────────────────────────────────────

function CoreScanner3D({ porosity }: { porosity: number }) {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[500px]">
      <g transform="translate(150, 50)">
        {/* Core Plug Cylinder */}
        <rect x="0" y="0" width="100" height="200" fill="#1e293b" fillOpacity="0.3" stroke="#06b6d4" strokeWidth="2" rx="50" />
        {/* Porosity Particles (Isometric view) */}
        {[...Array(Math.floor(porosity * 100))].map((_, i) => (
          <motion.circle 
            key={i} r="2" fill="#06b6d4"
            initial={{ cx: Math.random()*100, cy: Math.random()*200 }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ repeat: Infinity, duration: 2 + Math.random()*2, delay: Math.random()*2 }}
          />
        ))}
        {/* CT Scanning Ring */}
        <motion.rect 
          x="-20" y="0" width="140" height="5" fill="#06b6d4" fillOpacity="0.4"
          animate={{ y: [0, 200, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        />
        {/* Laser line on core */}
        <motion.line 
          x1="0" y1="0" x2="100" y2="0" stroke="#06b6d4" strokeWidth="1"
          animate={{ y: [0, 200, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        />
      </g>
      <text x="250" y="280" fill="#06b6d4" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Digital Core CT Porosity Imaging</text>
    </svg>
  );
}

function PoreNetwork3D({ perm, relPermData }: { perm: number, relPermData: any[] }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
      <g transform="translate(50, 50)">
        {/* Pore Network Grid */}
        {[0, 1, 2, 3, 4].map(i => (
          [0, 1, 2, 3, 4].map(j => (
            <g key={`p-${i}-${j}`} transform={`translate(${i*80}, ${j*60})`}>
              <circle r="4" fill="#06b6d4" fillOpacity="0.2" />
              {i < 4 && (
                <motion.line 
                  x1="4" y1="0" x2="76" y2="0" stroke="#06b6d4" 
                  strokeWidth={Math.min(10, Math.sqrt(perm)/5)} strokeOpacity="0.1"
                  animate={{ strokeOpacity: [0.1, 0.4, 0.1] }}
                  transition={{ repeat: Infinity, duration: 3, delay: (i+j)*0.2 }}
                />
              )}
              {j < 4 && (
                <motion.line 
                  x1="0" y1="4" x2="0" y2="56" stroke="#06b6d4" 
                  strokeWidth={Math.min(10, Math.sqrt(perm)/10)} strokeOpacity="0.1"
                  animate={{ strokeOpacity: [0.1, 0.4, 0.1] }}
                  transition={{ repeat: Infinity, duration: 3, delay: (i+j)*0.2 }}
                />
              )}
            </g>
          ))
        ))}
        {/* Multiphase Flow Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.circle 
            key={i} r="3" fill={i % 2 === 0 ? "#06b6d4" : "#f59e0b"}
            initial={{ cx: 0, cy: Math.random()*240 }}
            animate={{ cx: [0, 320], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 3 + Math.random()*3, delay: i*0.3 }}
          />
        ))}
      </g>
      <text x="250" y="370" fill="#06b6d4" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Stochastic Pore Network Multiphase Flow</text>
    </svg>
  );
}

function RockCompaction3D({ compression }: { compression: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
      <g transform="translate(150, 50)">
        {/* Rock Grains */}
        {[...Array(20)].map((_, i) => (
          <motion.circle 
            key={i} r="15" fill="#475569" stroke="#ffffff20"
            cx={50 + (i % 4) * 35 - 50}
            cy={20 + Math.floor(i / 4) * 45}
            animate={{ 
              scale: [1, 1 - compression*0.1],
              cx: [50 + (i % 4) * 35 - 50, 50 + (i % 4) * (35 - compression*2) - 50]
            }}
            transition={{ repeat: Infinity, duration: 4, repeatType: "reverse" }}
          />
        ))}
        {/* Stress Arrows */}
        <motion.path 
          d="M 50 -20 L 50 20" stroke="#06b6d4" strokeWidth="4" markerEnd="url(#arrow)"
          animate={{ y: [-10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        />
        <motion.path 
          d="M 50 250 L 50 210" stroke="#06b6d4" strokeWidth="4" markerEnd="url(#arrow)"
          animate={{ y: [10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        />
      </g>
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="#06b6d4" />
        </marker>
      </defs>
      <text x="250" y="350" fill="#06b6d4" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Matrix Compaction & Pore Volume Compression</text>
    </svg>
  );
}

function CapillaryPressure3D({ contactAngle }: { contactAngle: number }) {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[600px]">
      <g transform="translate(100, 50)">
        {/* Capillary Tube */}
        <rect x="100" y="0" width="100" height="200" fill="none" stroke="#475569" strokeWidth="2" />
        {/* Meniscus Curve */}
        <motion.path 
          d={`M 100 150 Q 150 \${150 + (contactAngle - 90)/2} 200 150`}
          fill="none" stroke="#06b6d4" strokeWidth="4"
          animate={{ d: [`M 100 150 Q 150 \${150 + (contactAngle - 90)/2} 200 150`, `M 100 150 Q 150 \${160 + (contactAngle - 90)/2} 200 150`, `M 100 150 Q 150 \${150 + (contactAngle - 90)/2} 200 150`] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        {/* Fluid level */}
        <rect x="100" y="150" width="100" height="50" fill="#06b6d4" fillOpacity="0.2" />
        {/* Labels */}
        <text x="80" y="155" fill="#06b6d4" fontSize="10" textAnchor="end" className="font-black">Pc</text>
        <text x="220" y="155" fill="#f59e0b" fontSize="10" className="font-black">σ cosθ</text>
      </g>
      <text x="250" y="270" fill="#06b6d4" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Young-Laplace Interfacial Tension Dynamics</text>
    </svg>
  );
}

// ─── Visual Figure: Shared Components ──────────────────────────────────────

function ResultCard({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="glass-card p-6 rounded-2xl border-white/5 bg-white/5 text-center group hover:border-cyan-500/30 transition-all">
       <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mb-1 group-hover:text-cyan-500 transition-colors">{label}</p>
       <h4 className="text-2xl font-black text-white italic tracking-tighter">{value} <span className="text-[10px] text-slate-600 not-italic uppercase tracking-widest font-bold">{unit}</span></h4>
    </div>
  );
}
