import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Waves, Droplets, Settings2, Activity, TrendingUp, Box, Layers, Target, Wind, Calculator, TestTube, BarChart3, ChevronRight,
  ShieldCheck, ArrowRight, Zap, Target as TargetIcon, Database, Scaling
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider, DataRow } from '../SharedUI';
import { 
    calculateCoreyKr, calculateFractionalFlow, calculateDykstraParsons, 
    calculateMobilityRatio, calculateArealSweepFiveSpot, calculateStilesMethod
} from '../../lib/reservoir';

export function WaterfloodingModule() {
  const [activePhase, setActivePhase] = useState<'2A' | '2B' | '2C' | '2D'>('2A');
  
  // State for 2A & 2B
  const [swc, setSwc] = useState(0.2);
  const [sor, setSor] = useState(0.25);
  const [nw, setNw] = useState(2.0);
  const [no, setNo] = useState(3.0);
  const [mu_o, setMuO] = useState(10);
  const [mu_w, setMuW] = useState(0.5);
  const [kValuesString, setKValuesString] = useState("10, 25, 45, 80, 150, 250, 500");

  const results = useMemo(() => {
    const data = [];
    const steps = 50;
    let maxSlope = 0;
    let sw_bt = 0;
    let fw_bt = 0;

    for (let i = 0; i <= steps; i++) {
      const sw = i / steps;
      const { krw, kro } = calculateCoreyKr(sw, swc, sor, 0.4, 0.9, nw, no);
      const fw = calculateFractionalFlow(krw, kro, mu_o, mu_w);
      
      if (sw > swc && sw < 1 - sor) {
        const slope = fw / (sw - swc);
        if (slope > maxSlope) {
          maxSlope = slope;
          sw_bt = sw;
          fw_bt = fw;
        }
      }

      data.push({ sw, krw, kro, fw });
    }

    const ed_bt = (sw_bt - swc) / (1 - swc);
    const ks = kValuesString.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    const v_dp = calculateDykstraParsons(ks);
    
    const krw_sor = calculateCoreyKr(1 - sor, swc, sor, 0.4, 0.9, nw, no).krw;
    const kro_swc = calculateCoreyKr(swc, swc, sor, 0.4, 0.9, nw, no).kro;
    const M = calculateMobilityRatio(krw_sor, kro_swc, mu_w, mu_o);
    const ea = calculateArealSweepFiveSpot(M);

    const stilesLayers = ks.map(k => ({ k, h: 10 })); 
    const stilesRes = calculateStilesMethod(stilesLayers, mu_w, mu_o);

    return { data, sw_bt, fw_bt, ed_bt, v_dp, maxSlope, M, ea, stilesRes };
  }, [swc, sor, nw, no, mu_o, mu_w, kValuesString]);

  const phases = [
    { id: '2A', name: 'Displacement', icon: Waves },
    { id: '2B', name: 'Sweep Efficiency', icon: Layers },
    { id: '2C', name: 'Flood Design', icon: TargetIcon },
    { id: '2D', name: 'Performance', icon: Activity }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-4">
            <Waves className="text-blue-500" size={36} />
            Phase 2: Waterflooding <span className="text-blue-500/50">Sweep & Recovery</span>
          </h2>
          <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-widest italic">Secondary Recovery Thermodynamics & Pattern Optimization</p>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit mt-4 flex-wrap gap-1 backdrop-blur-md">
          {phases.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id as any)}
              className={cn(
                "px-6 py-2.5 rounded-[14px] flex items-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest",
                activePhase === p.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
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
             <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-8 italic">Matrix Properties</h4>
             <div className="space-y-8">
                <InputWithSlider label="Connate Water (Swc)" value={swc * 100} min={10} max={40} step={1} unit="%" onChange={(v) => setSwc(v/100)} />
                <InputWithSlider label="Residual Oil (Sor)" value={sor * 100} min={10} max={40} step={1} unit="%" onChange={(v) => setSor(v/100)} />
                <InputWithSlider label="Viscosity Ratio (M)" value={mu_o / mu_w} min={0.5} max={100} step={0.5} unit="" onChange={(v) => setMuO(v * mu_w)} />
                {['2B', '2D'].includes(activePhase) && (
                   <div className="pt-4 border-t border-white/5 space-y-3">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic">Vertical Perm Dist. (md)</label>
                      <textarea 
                        value={kValuesString}
                        onChange={(e) => setKValuesString(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-[10px] text-blue-400 font-mono h-24 focus:border-blue-500 outline-none no-scrollbar"
                      />
                   </div>
                )}
             </div>
          </div>
          <div className="p-10 bg-blue-600/10 rounded-3xl border border-blue-500/20 text-center shadow-lg shadow-blue-500/5">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 italic">Mobility Ratio (M)</p>
              <p className="text-5xl font-black text-white italic tracking-tighter">
                {results.M.toFixed(2)}
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
                {/* --- 2A: Displacement --- */}
                {activePhase === '2A' && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                      <div className="lg:col-span-8 flex flex-col gap-8">
                         <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[500px] flex items-center justify-center relative overflow-hidden">
                            <FractionalFlow3D results={results} />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <ResultCard label="Breakthrough Sw" value={`${(results.sw_bt * 100).toFixed(1)}%`} unit="BT" />
                            <ResultCard label="Displacement Efficiency" value={`${(results.ed_bt * 100).toFixed(1)}%`} unit="Ed" />
                         </div>
                      </div>
                      <div className="lg:col-span-4 space-y-6">
                         <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6 italic">Buckley-Leverett Front</h4>
                            <div className="space-y-4">
                               <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                  Welge tangent analysis determines the average water saturation at breakthrough (<span className="text-white font-bold">Swbt</span>) and the shock front propagation velocity.
                               </p>
                               <DataRow label="Shock Front Sw" value={results.sw_bt} unit="v/v" src="Welge" precision={3} />
                               <DataRow label="Avg Sw @ BT" value={results.sw_bt + (1 - results.fw_bt)/results.maxSlope} unit="v/v" src="Integral" precision={3} />
                            </div>
                         </div>
                         <div className="glass-card rounded-3xl p-8 border-white/5 bg-white/5">
                            <RelPerm3D results={results} />
                         </div>
                      </div>
                   </div>
                )}

                {/* --- 2B: Sweep Efficiency --- */}
                {activePhase === '2B' && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-8 flex flex-col gap-8">
                         <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[550px] flex items-center justify-center relative overflow-hidden">
                            <FiveSpotSweep3D m={results.M} />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="p-8 bg-white/5 rounded-3xl border border-white/5 group hover:border-blue-500/30 transition-all">
                               <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 italic">Areal Sweep (Ea)</h5>
                               <p className="text-4xl font-black text-white italic">{(results.ea * 100).toFixed(1)}%</p>
                               <p className="text-[11px] text-slate-500 uppercase font-bold mt-2">Pattern Breakthrough Limit</p>
                            </div>
                            <div className="p-8 bg-white/5 rounded-3xl border border-white/5 group hover:border-purple-500/30 transition-all">
                               <h5 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4 italic">Vertical Sweep (Ev)</h5>
                               <p className="text-4xl font-black text-white italic">{( (1 - results.v_dp) * 100).toFixed(1)}%</p>
                               <p className="text-[11px] text-slate-500 uppercase font-bold mt-2">Dykstra-Parsons Index: {results.v_dp.toFixed(2)}</p>
                            </div>
                         </div>
                      </div>
                      <div className="lg:col-span-4 flex flex-col gap-6">
                         <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-8 italic">Heterogeneity Analysis</h4>
                            <StratifiedFlow3D vdp={results.v_dp} />
                            <div className="mt-8 p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                               <p className="text-[10px] text-slate-400 italic leading-relaxed">
                                  High Vdp (<span className="text-white font-bold">&gt; 0.7</span>) indicates severe channeling potential and early breakthrough in high-permeability thief zones.
                               </p>
                            </div>
                         </div>
                      </div>
                   </div>
                )}

                {/* --- 2C/2D: Design & Prediction --- */}
                {['2C', '2D'].includes(activePhase) && (
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-4 space-y-6">
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
                           <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-8 italic">Prediction Metrics</h4>
                           <div className="space-y-6">
                              <ResultCard label="Recovery Fraction" value={`${(results.stilesRes.recoveryFraction * 100).toFixed(1)}%`} unit="Stiles" />
                              <ResultCard label="Limit Water Cut" value={`${(results.stilesRes.waterCut * 100).toFixed(1)}%`} unit="WC" />
                           </div>
                        </div>
                        <div className="glass-card rounded-3xl p-8 border-white/5 bg-white/5">
                           <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 italic flex items-center gap-2">
                              <ShieldCheck size={14} className="text-emerald-500" /> Voidage Replacement
                           </h5>
                           <p className="text-[11px] text-slate-400 leading-relaxed italic">"Current VRR: <span className="text-white font-bold">1.02</span>. Sustaining reservoir pressure above bubble point to prevent gas release."</p>
                        </div>
                      </div>
                      <div className="lg:col-span-8 h-full">
                         <div className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full flex flex-col justify-center items-center relative overflow-hidden">
                            <WaterfloodPattern3D />
                            <div className="mt-[320px] text-center max-w-xl">
                               <h3 className="text-3xl font-black text-white italic tracking-tighter mb-4 uppercase">Flood Performance Profile</h3>
                               <p className="text-sm text-slate-400 leading-relaxed italic mb-8">
                                  Integrating Buckley-Leverett (1D displacement) with Dykstra-Parsons (vertical sweep) to estimate total field recovery factor and WOR trends.
                               </p>
                               <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center gap-3 mx-auto italic shadow-xl shadow-blue-500/20">
                                  Generate Performance Forecast
                                  <ArrowRight size={14} />
                               </button>
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
}

// ─── 3D Kinetic Simulators ─────────────────────────────────────────────────

function FractionalFlow3D({ results }: { results: any }) {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[500px]">
      <g transform="translate(60, 50)">
        {/* Plot Frame */}
        <line x1="0" y1="200" x2="380" y2="200" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" />
        <line x1="0" y1="0" x2="0" y2="200" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" />
        
        {/* FW Curve */}
        <motion.path 
          d={results.data.reduce((acc: string, d: any, i: number) => {
            const px = d.sw * 380;
            const py = 200 - d.fw * 200;
            return i === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
          }, "")}
          fill="none" stroke="#3b82f6" strokeWidth="4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}
        />
        
        {/* Welge Tangent */}
        <motion.line 
          x1={results.data[0].sw * 380} y1="200" 
          x2="380" y2={200 - results.maxSlope * (1 - results.data[0].sw) * 200}
          stroke="#8b5cf6" strokeWidth="2" strokeDasharray="8,4" strokeOpacity="0.6"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 1 }}
        />

        {/* Breakthrough Point */}
        <motion.circle 
          cx={results.sw_bt * 380} cy={200 - results.fw_bt * 200} r="6" fill="#f43f5e"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2 }}
        />
      </g>
      <text x="250" y="280" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Welge-Leverett Displacement Dynamics</text>
    </svg>
  );
}

function RelPerm3D({ results }: { results: any }) {
  return (
    <svg viewBox="0 0 200 150" className="w-full h-full">
       <g transform="translate(30, 20)">
          <motion.path 
            d={results.data.reduce((acc: string, d: any, i: number) => {
              const px = d.sw * 140;
              const py = 100 - d.krw * 100;
              return i === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
            }, "")}
            fill="none" stroke="#3b82f6" strokeWidth="3"
          />
          <motion.path 
            d={results.data.reduce((acc: string, d: any, i: number) => {
              const px = d.sw * 140;
              const py = 100 - d.kro * 100;
              return i === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
            }, "")}
            fill="none" stroke="#f43f5e" strokeWidth="3"
          />
       </g>
    </svg>
  );
}

function FiveSpotSweep3D({ m }: { m: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
      <g transform="translate(100, 50)">
        {/* Grid Pattern */}
        <rect x="0" y="0" width="300" height="300" fill="none" stroke="#ffffff10" strokeWidth="2" strokeDasharray="10,10" />
        
        {/* Sweep Front (Expanding) */}
        <motion.circle 
          cx="150" cy="150" r="10" fill="#3b82f6" fillOpacity="0.1" stroke="#3b82f6" strokeWidth="2"
          animate={{ r: [10, 140, 10], fillOpacity: [0.1, 0.4, 0.1] }}
          transition={{ repeat: Infinity, duration: 6 }}
        />
        
        {/* Fingers if M > 1 */}
        {m > 1 && [0, 45, 90, 135, 180, 225, 270, 315].map(a => (
           <motion.path 
             key={a} d={`M 150 150 L ${150 + Math.cos(a*Math.PI/180)*140} ${150 + Math.sin(a*Math.PI/180)*140}`}
             stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5"
             animate={{ opacity: [0, 1, 0], pathLength: [0, 1] }}
             transition={{ repeat: Infinity, duration: 2, delay: a/360 }}
           />
        ))}

        {/* Wells */}
        <circle cx="150" cy="150" r="8" fill="#3b82f6" /> {/* Injector */}
        <circle cx="0" cy="0" r="8" fill="#f43f5e" /> {/* Producer */}
        <circle cx="300" cy="0" r="8" fill="#f43f5e" />
        <circle cx="0" cy="300" r="8" fill="#f43f5e" />
        <circle cx="300" cy="300" r="8" fill="#f43f5e" />
      </g>
      <text x="250" y="380" fill="#3b82f6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Kinetic Areal Sweep Pattern Stability</text>
    </svg>
  );
}

function StratifiedFlow3D({ vdp }: { vdp: number }) {
  return (
    <svg viewBox="0 0 300 150" className="w-full h-full">
      <g transform="translate(50, 25)">
        {[0, 1, 2, 3, 4].map(i => (
          <g key={i} transform={`translate(0, ${i*20})`}>
            <rect x="0" y="0" width="200" height="15" fill="#1e293b" rx="2" />
            <motion.rect 
              x="0" y="0" width={200 * (1 - vdp * (i/5))} height="15" fill="#3b82f6" fillOpacity="0.4" rx="2"
              animate={{ width: [0, 200 * (1 - vdp * (i/5))] }}
              transition={{ repeat: Infinity, duration: 4, delay: i*0.2 }}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

function WaterfloodPattern3D() {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full">
      <g transform="translate(100, 50)">
         {[0, 1, 2].map(i => (
           [0, 1, 2].map(j => (
             <g key={`${i}-${j}`} transform={`translate(${i*150}, ${j*100})`}>
                <circle r="5" fill={(i+j)%2 === 0 ? "#3b82f6" : "#f43f5e"} />
                {(i+j)%2 === 0 && (
                  <motion.circle 
                    r="40" fill="none" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.2"
                    animate={{ scale: [0, 1.5], opacity: [0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  />
                )}
             </g>
           ))
         ))}
      </g>
    </svg>
  );
}

// ─── Shared UI Components ──────────────────────────────────────────────────

function ResultCard({ label, value, unit }: { label: string, value: string, unit: string }) {
  return (
    <div className="glass-card p-8 rounded-3xl border-white/5 bg-white/5 text-center group hover:border-blue-500/30 transition-all">
       <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">{label}</p>
       <h4 className="text-3xl font-black text-white italic tracking-tighter">{value} <span className="text-[10px] text-slate-600 not-italic uppercase tracking-widest font-bold">{unit}</span></h4>
    </div>
  );
}
