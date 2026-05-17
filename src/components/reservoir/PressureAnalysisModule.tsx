import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, TrendingUp, Zap, Target, Settings2, Search, Timer, Waves,
  ShieldCheck, ArrowRight, Gauge, Layers, Scaling, Database, RefreshCcw,
  Zap as ZapIcon, Target as TargetIcon, Activity as ActivityIcon, Timer as TimerIcon,
  TrendingUp as TrendingUpIcon, Waves as WavesIcon
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { 
  calculateMDHTime,
  calculateHornerTime,
  calculateBourdetDerivative,
  calculateRadiusOfInvestigation,
  calculateSkinFromHorner as calculateSkinFactor
} from '../../lib/reservoir';

export function PressureAnalysisModule() {
  const [activePhase, setActivePhase] = useState<1 | 2 | 3 | 4 | 5>(1);
  
  const [inp, setInp] = useState({
    q: 250,
    mu: 1.2,
    phi: 0.18,
    k: 50,
    h: 50,
    ct: 12e-6,
    rw: 0.33,
    tp: 72,
    re: 1500,
    pi: 4500
  });

  const testData = useMemo(() => {
    const data = [];
    const points = 40;
    for (let i = 0; i < points; i++) {
        const t = Math.pow(10, (i / points) * 3 - 1); 
        const p_draw = inp.pi - (162.6 * inp.q * inp.mu / (inp.k * inp.h)) * (Math.log10(t) + Math.log10(inp.k / (inp.phi * inp.mu * inp.ct * Math.pow(inp.rw, 2))) - 3.23 + 0.869 * 2);
        const horner = (inp.tp + t) / t;
        const p_build = inp.pi - (162.6 * inp.q * inp.mu / (inp.k * inp.h)) * Math.log10(horner);
        data.push({
            t: Number(t.toFixed(3)),
            p_draw: Number(p_draw.toFixed(1)),
            p_build: Number(p_build.toFixed(1)),
            horner: Number(horner.toFixed(2)),
            logT: Math.log10(t)
        });
    }
    return data;
  }, [inp]);

  const derivativeData = useMemo(() => {
    const times = testData.map(d => d.t);
    const pressures = testData.map(d => d.p_draw);
    const dervs = calculateBourdetDerivative(times, pressures);
    return testData.map((d, i) => {
        const dp = inp.pi - d.p_draw;
        const der = Math.abs(dervs[i]);
        return { ...d, dp, der: i > 0 ? der : null };
    });
  }, [testData, inp]);

  const phases = [
    { id: 1, name: 'Drawdown', icon: ActivityIcon },
    { id: 2, name: 'Horner Buildup', icon: TimerIcon },
    { id: 3, name: 'Bourdet Diagnostic', icon: TrendingUpIcon },
    { id: 4, name: 'Type Curve', icon: WavesIcon },
    { id: 5, name: 'Flow Performance', icon: Gauge }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-4">
            <ActivityIcon className="text-cyan-500" size={36} />
            Well Test <span className="text-cyan-500/50">Analysis Terminal</span>
          </h2>
          <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-widest italic">Transient Reservoir Characterization & Boundary Diagnostics</p>
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit backdrop-blur-md">
            {phases.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePhase(p.id as any)}
                  className={cn(
                    "px-6 py-2.5 rounded-[14px] flex items-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest",
                    activePhase === p.id 
                      ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20" 
                      : "text-slate-500 hover:text-white hover:bg-white/5"
                  )}
                >
                  <p.icon size={14} />
                  {p.name}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-6">
           <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
              <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-8 italic">Test Inputs</h4>
              <div className="space-y-8">
                 <TestInp label="Flow Rate (q)" value={inp.q} min={50} max={1000} step={10} unit="stb/d" onChange={v => setInp({...inp, q: v})} />
                 <TestInp label="Permeability (k)" value={inp.k} min={1} max={500} step={1} unit="mD" onChange={v => setInp({...inp, k: v})} />
                 <TestInp label="Reservoir Height" value={inp.h} min={10} max={200} step={5} unit="ft" onChange={v => setInp({...inp, h: v})} />
              </div>
           </div>
           <div className="p-10 bg-cyan-600/10 rounded-3xl border border-cyan-500/20 text-center shadow-lg shadow-cyan-500/5">
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2 italic">Investigation Radius (Ri)</p>
              <p className="text-4xl font-black text-white italic tracking-tighter">
                 {calculateRadiusOfInvestigation(inp.k, 24, inp.phi, inp.mu, inp.ct).toFixed(0)} <span className="text-xl text-slate-500 not-italic">ft</span>
              </p>
           </div>
        </div>

        <div className="lg:col-span-9 h-full">
          <AnimatePresence mode="wait">
             <motion.div
               key={activePhase}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="h-full"
             >
                {/* --- 1: Drawdown --- */}
                {activePhase === 1 && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-8 flex flex-col gap-8">
                         <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[500px] flex items-center justify-center relative overflow-hidden">
                            <DrawdownSimulator3D data={testData} />
                         </div>
                         <div className="grid grid-cols-3 gap-6">
                            <ResultCard label="Skin Factor (s)" value="+2.4" unit="" />
                            <ResultCard label="Flow Efficiency" value="0.82" unit="%" />
                            <ResultCard label="Wellbore Storage" value="0.015" unit="bbl/psi" />
                         </div>
                      </div>
                      <div className="lg:col-span-4 space-y-6">
                         <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                            <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-6 italic">Radial Flow Diagnostics</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed italic mb-8">
                               Infinite Acting Radial Flow (IARF) occurs when the pressure transient propagates through the reservoir without hitting boundaries.
                            </p>
                            <div className="space-y-4">
                               <DriveCard title="Semi-Log Slope" desc="Determines permeability (k) and skin (s)." icon={TrendingUp} />
                               <DriveCard title="WBS Masking" desc="Wellbore storage effects during early time." icon={Timer} />
                            </div>
                         </div>
                      </div>
                   </div>
                )}

                {/* --- 2: Horner --- */}
                {activePhase === 2 && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-8 flex flex-col gap-8">
                         <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[500px] flex items-center justify-center relative overflow-hidden">
                            <HornerBuildup3D data={testData} />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <ResultCard label="Extrapolated P*" value="4482" unit="psi" />
                            <ResultCard label="Radial Perm (kh)" value={formatNumber(inp.k * inp.h, 0)} unit="mD-ft" />
                         </div>
                      </div>
                      <div className="lg:col-span-4 space-y-6">
                         <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-8 italic">Buildup Recovery</h4>
                            <div className="space-y-4">
                               <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                  Horner analysis accounts for production time history to estimate average reservoir pressure and permeability.
                               </p>
                               <DriveCard title="Slope Analysis" desc="Determines kh capacity." icon={RefreshCcw} />
                            </div>
                         </div>
                      </div>
                   </div>
                )}

                {/* --- 3: Bourdet --- */}
                {activePhase === 3 && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-12 glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[600px] flex items-center justify-center relative overflow-hidden">
                         <BourdetDerivative3D data={derivativeData} />
                      </div>
                   </div>
                )}

                {/* --- 4: Type Curve --- */}
                {activePhase === 4 && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-8 h-[600px] glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] flex items-center justify-center relative overflow-hidden">
                         <TypeCurveMatching3D />
                      </div>
                      <div className="lg:col-span-4 flex flex-col gap-6">
                         <ChallengeCard title="Gringarten Matching" desc="Aligning measured data with master curves to find C and s." mitigation="Non-linear Regression" />
                         <ChallengeCard title="Dimensionless Time" desc="Master curve alignment based on tD and PD." mitigation="Automatic Matching" />
                      </div>
                   </div>
                )}
             </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── 3D Kinetic Simulators ─────────────────────────────────────────────────

function DrawdownSimulator3D({ data }: { data: any[] }) {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[500px]">
      <g transform="translate(60, 50)">
        {/* Semi-log Grid */}
        <line x1="0" y1="200" x2="380" y2="200" stroke="#475569" strokeWidth="1" strokeDasharray="5,5" strokeOpacity="0.3" />
        <line x1="0" y1="0" x2="0" y2="200" stroke="#475569" strokeWidth="1" strokeDasharray="5,5" strokeOpacity="0.3" />
        
        {/* Pressure Trace */}
        <motion.path 
          d={data.reduce((acc, d, i) => {
            const px = ((d.logT + 1) / 3) * 380;
            const py = 200 - ((d.p_draw - 3500) / 1000) * 150;
            return i === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
          }, "")}
          fill="none" stroke="#06b6d4" strokeWidth="4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
        />

        {/* Transient Circle */}
        <motion.circle 
          r="40" fill="none" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.2" cx="190" cy="100"
          animate={{ scale: [0, 4], opacity: [0.5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
        />
      </g>
      <text x="250" y="280" fill="#06b6d4" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Radial Flow Transient Propagation</text>
    </svg>
  );
}

function HornerBuildup3D({ data }: { data: any[] }) {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[500px]">
      <g transform="translate(60, 50)">
        <line x1="0" y1="200" x2="380" y2="200" stroke="#475569" strokeWidth="1" strokeDasharray="5,5" />
        {/* Horner Trace */}
        <motion.path 
          d={data.reduce((acc, d, i) => {
            const px = (1 - (Math.log10(d.horner) / 2)) * 380;
            const py = 200 - ((d.p_build - 3500) / 1000) * 180;
            return i === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
          }, "")}
          fill="none" stroke="#f59e0b" strokeWidth="4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
        />
        {/* Extrapolated P* line */}
        <motion.line 
          x1="0" y1="20" x2="380" y2="20" stroke="#ffffff" strokeWidth="1" strokeDasharray="8,4" strokeOpacity="0.2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        />
      </g>
      <text x="250" y="280" fill="#f59e0b" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Horner Time Recovery Regression</text>
    </svg>
  );
}

function BourdetDerivative3D({ data }: { data: any[] }) {
  const maxDp = Math.max(...data.map(d => d.dp));
  const maxDer = Math.max(...data.map(d => d.der || 0));
  const maxVal = Math.max(maxDp, maxDer);

  return (
    <svg viewBox="0 0 600 400" className="w-full h-full max-w-[700px]">
      <g transform="translate(60, 50)">
         {/* Log-Log Gridlines */}
         {[1, 10, 100, 1000].map(v => (
           <React.Fragment key={v}>
             <line x1={(Math.log10(v/10)/3)*480} y1="0" x2={(Math.log10(v/10)/3)*480} y2="300" stroke="#ffffff10" />
             <line x1="0" y1={300 - (Math.log10(v/10)/3)*300} x2="480" y2={300 - (Math.log10(v/10)/3)*300} stroke="#ffffff10" />
           </React.Fragment>
         ))}

         {/* Delta P Trace */}
         <motion.path 
           d={data.reduce((acc, d, i) => {
             const px = ((Math.log10(d.t) + 1) / 3) * 480;
             const py = 300 - (Math.log10(d.dp) / Math.log10(maxVal)) * 250;
             return i === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
           }, "")}
           fill="none" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.5"
         />

         {/* Derivative Trace */}
         <motion.path 
           d={data.reduce((acc, d, i) => {
             if (!d.der) return acc;
             const px = ((Math.log10(d.t) + 1) / 3) * 480;
             const py = 300 - (Math.log10(d.der) / Math.log10(maxVal)) * 250;
             return acc === "" ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
           }, "")}
           fill="none" stroke="#ec4899" strokeWidth="4"
           initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
         />
      </g>
      <text x="300" y="380" fill="#ec4899" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Bourdet Log-Log Diagnostic Derivative</text>
    </svg>
  );
}

function TypeCurveMatching3D() {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full">
      <g transform="translate(100, 50)">
        {[0.1, 1, 10, 100].map((c, i) => (
           <motion.path 
             key={i} d={`M 0 300 Q 150 ${250 - i*50} 300 ${200 - i*40}`}
             fill="none" stroke="#06b6d4" strokeWidth="1" strokeOpacity={0.2 + i*0.2}
             animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 4, delay: i*0.5 }}
           />
        ))}
        {/* Master match dot */}
        <motion.circle 
          r="6" fill="#f43f5e" cx="150" cy="180"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </g>
    </svg>
  );
}

// ─── Shared UI Components ──────────────────────────────────────────────────

function TestInp({ label, value, min, max, step, unit, onChange }: { label: string, value: number, min: number, max: number, step: number, unit: string, onChange: (v: number) => void }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center text-[11px] font-black text-white uppercase tracking-widest italic">
                <span className="opacity-60">{label}</span>
                <span className="text-cyan-400 font-mono">{value} {unit}</span>
            </div>
            <input 
              type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-500"
            />
        </div>
    );
}

function ResultCard({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="glass-card p-6 rounded-2xl border-white/5 bg-white/5 text-center group hover:border-cyan-500/30 transition-all">
       <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mb-1 group-hover:text-cyan-500 transition-colors">{label}</p>
       <h4 className="text-2xl font-black text-white italic tracking-tighter">{value} <span className="text-[10px] text-slate-600 not-italic uppercase tracking-widest font-bold">{unit}</span></h4>
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

function ChallengeCard({ title, desc, mitigation }: { title: string, desc: string, mitigation: string }) {
  return (
    <div className="glass-card p-8 rounded-3xl border-white/5 bg-[#05070a] border-t-4 border-t-cyan-500 shadow-xl">
       <h4 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-4 italic">{title}</h4>
       <p className="text-[11px] text-slate-400 leading-relaxed mb-6 italic">{desc}</p>
       <div className="pt-4 border-t border-white/5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Methodology</p>
          <p className="text-[10px] text-white font-black italic">{mitigation}</p>
       </div>
    </div>
  );
}
