import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  TrendingUp, 
  Layers, 
  BarChart2, 
  Settings2,
  PieChart as PieIcon,
  Zap,
  Droplets,
  Wind,
  Info,
  ChevronRight,
  ShieldCheck,
  Activity,
  Box,
  ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';
import { 
  calculateWithdrawalF, 
  calculateExpansionEo, 
  calculateExpansionEg, 
  calculateExpansionEfw,
  calculatePOverZ,
  calculateStandingRs,
  calculateVasquezBeggsBo,
  calculateHallYarboroughZ,
  calculateFetkovichInflux
} from '../../lib/reservoir';

type HO_Method = 'solution_gas' | 'undersaturated' | 'gas_cap' | 'gas_cap_unknown_m' | 'water_drive';

export function MaterialBalanceTab() {
  const [analysisType, setAnalysisType] = useState<'oil' | 'gas'>('oil');
  const [hoMethod, setHoMethod] = useState<HO_Method>('solution_gas');
  
  // Reservoir Params
  const [mValue, setMValue] = useState(0.2); // Gas cap size
  const [swi, setSwi] = useState(0.25);
  const [cf, setCf] = useState(4.5e-6);
  const [cw, setCw] = useState(3.0e-6);
  
  // Aquifer Params
  const [wei, setWei] = useState(100); // Initial Aquifer Water MM bbl
  const [jAquifer, setJAquifer] = useState(0.8); // Aquifer PI STB/d/psi
  
  const [history] = useState([
    { pressure: 4500, np: 0, rp: 650, wp: 0, days: 0 },
    { pressure: 4200, np: 0.8, rp: 720, wp: 0.1, days: 180 },
    { pressure: 3800, np: 1.8, rp: 880, wp: 0.3, days: 360 },
    { pressure: 3400, np: 3.2, rp: 1150, wp: 0.6, days: 540 },
    { pressure: 3100, np: 4.8, rp: 1450, wp: 1.2, days: 720 },
    { pressure: 2800, np: 6.8, rp: 1900, wp: 2.2, days: 900 },
    { pressure: 2500, np: 9.2, rp: 2800, wp: 3.5, days: 1080 }
  ]);

  const mbResults = useMemo(() => {
    const initial = history[0];
    const gasGravity = 0.65;
    const api = 35;
    const temp = 180;
    
    const rsi = calculateStandingRs(initial.pressure, temp, gasGravity, api);
    const boi = calculateVasquezBeggsBo(initial.pressure, temp, rsi, gasGravity, api);
    const z_initial = calculateHallYarboroughZ(initial.pressure / 667, (temp + 460) / 375);
    const bgi = (0.02827 * z_initial * (temp + 460)) / initial.pressure;

    let we_prev = 0;
    const data = history.map((h, i) => {
      const rs = calculateStandingRs(h.pressure, temp, gasGravity, api);
      const bo = calculateVasquezBeggsBo(h.pressure, temp, rs, gasGravity, api);
      const z = calculateHallYarboroughZ(h.pressure / 667, (temp + 460) / 375);
      const bg = (0.02827 * z * (temp + 460)) / h.pressure;
      
      const dp = initial.pressure - h.pressure;
      const Eo = calculateExpansionEo(bo, boi, rs, rsi, bg);
      const Eg = calculateExpansionEg(bg, bgi, boi);
      const Efw = calculateExpansionEfw(boi, swi, cf, cw, dp);
      
      let we = 0;
      if (i > 0) {
        const dt = h.days - history[i-1].days;
        we = calculateFetkovichInflux(initial.pressure, history[i-1].pressure, h.pressure, wei * 1e6, jAquifer, dt, we_prev);
        we_prev = we;
      }

      const F = calculateWithdrawalF(h.np * 1e6, bo, h.rp, rs, bg, h.wp * 1e6, 1.02);
      const Et = Eo + mValue * Eg + Efw;
      const pz = calculatePOverZ(h.pressure, z);
      const gp = h.np * h.rp / 1000;
      
      return {
        ...h,
        F, Eo, Eg, Efw, Et, we, pz, gp,
        x_ho: hoMethod === 'gas_cap_unknown_m' ? (Eg / Eo) : Et,
        y_ho: hoMethod === 'gas_cap_unknown_m' ? (F / Eo) : (F - we),
        fOverEo: Eo > 0 ? F / Eo : 0,
        egOverEo: Eo > 0 ? Eg / Eo : 0,
        campbell: Et > 0 ? F / Et : 0,
        cole: gp > 0 ? F / gp : 0
      };
    });

    const validData = data.slice(1);
    let n_est = 0;
    let m_est = mValue;

    if (hoMethod === 'gas_cap_unknown_m') {
      const xs = validData.map(d => d.egOverEo);
      const ys = validData.map(d => d.fOverEo);
      const n = xs.length;
      const sumX = xs.reduce((a, b) => a + b, 0);
      const sumY = ys.reduce((a, b) => a + b, 0);
      const sumXY = xs.reduce((a, b, i) => a + b * ys[i], 0);
      const sumXX = xs.reduce((a, b) => a + b * b, 0);
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      n_est = intercept;
      m_est = slope / intercept;
    } else {
      const sumX = validData.reduce((acc, curr) => acc + curr.x_ho, 0);
      const sumY = validData.reduce((acc, curr) => acc + curr.y_ho, 0);
      n_est = sumX > 0 ? sumY / sumX : 0;
    }

    const last = data[data.length - 1];
    const ogip_est = (data[0].pz * last.gp) / (data[0].pz - last.pz);

    return { 
      data, n_est, m_est, ogip_est, rsi, boi, bgi,
      DDI: (n_est * data[data.length-1].Eo) / data[data.length-1].F,
      GDI: (n_est * m_est * data[data.length-1].Eg) / data[data.length-1].F,
      WDI: data[data.length-1].we / data[data.length-1].F
    };
  }, [history, mValue, swi, cf, cw, wei, jAquifer, hoMethod]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-4">
              <Database className="text-cyan-500" size={36} />
              Material Balance <span className="text-cyan-500/50">Analytics</span>
           </h2>
           <p className="text-[10px] text-slate-500 font-black mt-1 uppercase tracking-widest italic">Dynamic Reservoir Volume & Drive Energy Diagnostics</p>
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
           <button 
              onClick={() => setAnalysisType('oil')}
              className={cn("px-8 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest flex items-center gap-2", analysisType === 'oil' ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20" : "text-slate-500 hover:text-white")}
           ><Droplets size={14}/> Oil Analysis</button>
           <button 
              onClick={() => setAnalysisType('gas')}
              className={cn("px-8 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest flex items-center gap-2", analysisType === 'gas' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-white")}
           ><Wind size={14}/> Gas Analysis</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Control Sidebar */}
        <div className="lg:col-span-3 space-y-6">
           <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
              <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-6 italic">Diagnostic Method</h4>
              <div className="space-y-2">
                {[
                  { id: 'solution_gas', label: 'Solution Gas (Vol)' },
                  { id: 'undersaturated', label: 'Undersaturated' },
                  { id: 'gas_cap', label: 'Gas Cap (m fixed)' },
                  { id: 'gas_cap_unknown_m', label: 'Gas Cap (m var)' },
                  { id: 'water_drive', label: 'Water Drive (Fetkovich)' }
                ].map(m => (
                  <button 
                    key={m.id}
                    onClick={() => setHoMethod(m.id as HO_Method)}
                    className={cn(
                      "w-full text-left px-5 py-3 rounded-xl text-[10px] font-black uppercase transition-all tracking-tighter flex items-center justify-between group", 
                      hoMethod === m.id ? "bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5" : "text-slate-500 hover:bg-white/5 border border-transparent"
                    )}
                  >
                    {m.label}
                    <ChevronRight size={14} className={cn("transition-transform", hoMethod === m.id ? "translate-x-1" : "opacity-0")} />
                  </button>
                ))}
              </div>
           </div>

           <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40 space-y-8">
              <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest italic">Drive Inputs</h4>
              <AnimatePresence mode="wait">
                 <motion.div key={hoMethod} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {(hoMethod === 'gas_cap' || hoMethod === 'solution_gas') && (
                       <InputWithSlider label="Gas Cap Ratio (m)" value={mValue} min={0} max={2} step={0.1} unit="v/v" onChange={setMValue} />
                    )}
                    {hoMethod === 'water_drive' && (
                       <>
                         <InputWithSlider label="Aquifer Wei" value={wei} min={0} max={500} step={10} unit="MMbbl" onChange={setWei} />
                         <InputWithSlider label="Aquifer PI (J)" value={jAquifer} min={0} max={5} step={0.1} unit="stb/d/p" onChange={setJAquifer} />
                       </>
                    )}
                    <InputWithSlider label="Swi" value={swi} min={0.1} max={0.5} step={0.01} unit="" onChange={setSwi} />
                 </motion.div>
              </AnimatePresence>
           </div>

           <div className="p-10 bg-gradient-to-br from-cyan-600/20 to-black rounded-3xl border border-cyan-500/20 text-center shadow-2xl">
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2 italic">Estimated {analysisType === 'oil' ? 'OOIP' : 'OGIP'}</p>
              <p className="text-5xl font-black text-white italic tracking-tighter">
                 {analysisType === 'oil' ? (mbResults.n_est / 1e6).toFixed(1) : (mbResults.ogip_est / 1e3).toFixed(1)}
              </p>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-2">{analysisType === 'oil' ? 'MM STB' : 'BSCF'}</p>
           </div>
        </div>

        {/* Main 3D Visualizer */}
        <div className="lg:col-span-9 space-y-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[550px] flex flex-col relative overflow-hidden">
                 <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                       <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Havlena-Odeh Analysis</h3>
                       <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Linearized Mass Balance Straight Line</p>
                    </div>
                    <div className="p-3 bg-cyan-600/10 rounded-2xl border border-cyan-500/20">
                       <TrendingUp className="text-cyan-500" />
                    </div>
                 </div>
                 <div className="flex-1 flex items-center justify-center">
                    <HavlenaOdeh3D data={mbResults.data} nEst={mbResults.n_est} method={hoMethod} />
                 </div>
              </div>

              <div className="glass-card rounded-3xl p-10 border-white/5 bg-[#05070a] h-[550px] flex flex-col relative overflow-hidden">
                 <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                       <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Diagnostic Stability</h3>
                       <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Campbell / Cole Energy Distribution</p>
                    </div>
                    <div className="p-3 bg-emerald-600/10 rounded-2xl border border-emerald-500/20">
                       <Activity className="text-emerald-500" />
                    </div>
                 </div>
                 <div className="flex-1 flex items-center justify-center">
                    <CampbellCole3D data={mbResults.data} nEst={mbResults.n_est} />
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card rounded-3xl p-10 border-white/5 bg-black/40 flex items-center justify-between">
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-3 italic">
                       <Layers size={18} className="text-cyan-500" /> Drive Energy Partition
                    </h4>
                    <div className="grid grid-cols-3 gap-8">
                       <DriveStat label="Solution Gas" value={Math.round(mbResults.DDI * 100)} color="cyan" icon={<Droplets size={12}/>} />
                       <DriveStat label="Gas Cap" value={Math.round(mbResults.GDI * 100)} color="indigo" icon={<Wind size={12}/>} />
                       <DriveStat label="Water Influx" value={Math.round(mbResults.WDI * 100)} color="emerald" icon={<PieIcon size={12}/>} />
                    </div>
                 </div>
                 <div className="hidden lg:block">
                    <DriveEnergy3D ddi={mbResults.DDI} gdi={mbResults.GDI} wdi={mbResults.WDI} />
                 </div>
              </div>

              <div className="glass-card rounded-3xl p-10 border-white/5 bg-gradient-to-br from-indigo-900/20 to-black/20 flex flex-col justify-between">
                 <div className="space-y-6">
                    <div className="flex items-center gap-3 text-indigo-400">
                       <ShieldCheck size={20} />
                       <span className="text-[10px] font-black uppercase tracking-widest italic">Confidence Index</span>
                    </div>
                    <p className="text-[12px] text-slate-400 leading-relaxed font-medium italic">
                       {mbResults.WDI > 0.3 
                         ? "Strong active aquifer detected. Regression suggests Fetkovich r_e/r_w ratio is near-infinite." 
                         : "Volumetric depletion is dominant. Campbell plot stability confirms OOIP estimate reliability."}
                    </p>
                 </div>
                 <button className="group relative overflow-hidden w-full py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all flex items-center justify-center gap-3 italic">
                    Generate FEK Report
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// ─── 3D Kinetic Simulators ─────────────────────────────────────────────────

function HavlenaOdeh3D({ data, nEst, method }: { data: any[], nEst: number, method: string }) {
  const validData = data.slice(1);
  return (
    <svg viewBox="0 0 500 350" className="w-full h-full">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <g transform="translate(60, 50)">
        {/* Axes */}
        <line x1="0" y1="250" x2="400" y2="250" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" />
        <line x1="0" y1="0" x2="0" y2="250" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" />
        
        {/* Theoretical Straight Line */}
        <motion.line 
          x1="0" y1={250 - (method === 'gas_cap_unknown_m' ? 100 : 0)} 
          x2="350" y2={50} 
          stroke="url(#lineGrad)" strokeWidth="3" strokeOpacity="0.4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
        />
        
        {/* History Points */}
        {validData.map((d, i) => {
          const maxVal = Math.max(...validData.map(v => v.y_ho));
          const maxX = Math.max(...validData.map(v => v.x_ho));
          const px = (d.x_ho / maxX) * 350;
          const py = 250 - (d.y_ho / maxVal) * 200;
          return (
            <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i*0.1 }}>
              <circle cx={px} cy={py} r="5" fill="#06b6d4" />
              <motion.circle 
                cx={px} cy={py} r="10" fill="none" stroke="#06b6d4" strokeWidth="1"
                animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: i*0.2 }}
              />
            </motion.g>
          );
        })}
      </g>
      <text x="250" y="340" fill="#06b6d4" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Linearized Mass Balance Equilibrium Model</text>
    </svg>
  );
}

function CampbellCole3D({ data, nEst }: { data: any[], nEst: number }) {
  const validData = data.slice(1);
  return (
    <svg viewBox="0 0 500 350" className="w-full h-full">
      <g transform="translate(60, 50)">
        <line x1="0" y1="250" x2="400" y2="250" stroke="#475569" strokeWidth="2" />
        <line x1="0" y1="0" x2="0" y2="250" stroke="#475569" strokeWidth="2" />
        
        {/* Horizontal Ideal Line */}
        <line x1="0" y1="125" x2="400" y2="125" stroke="#10b981" strokeWidth="1" strokeDasharray="10,5" strokeOpacity="0.5" />
        
        {/* Data Trace */}
        <motion.path 
          d={validData.reduce((acc, d, i) => {
            const maxNp = Math.max(...validData.map(v => v.np));
            const px = (d.np / maxNp) * 380;
            const py = 250 - (d.campbell / (nEst * 1.5)) * 200;
            return i === 0 ? `M ${px} ${py}` : `${acc} L ${px} ${py}`;
          }, "")}
          fill="none" stroke="#10b981" strokeWidth="4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}
        />
        
        {/* Glow particles on trace */}
        {validData.map((d, i) => (
          <motion.circle 
            key={i} r="3" fill="#10b981"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.2, 1, 0.2],
              cx: (d.np / Math.max(...validData.map(v => v.np))) * 380,
              cy: 250 - (d.campbell / (nEst * 1.5)) * 200
            }}
            transition={{ repeat: Infinity, duration: 2, delay: i*0.2 }}
          />
        ))}
      </g>
      <text x="250" y="340" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Diagnostic Energy Stability Derivative</text>
    </svg>
  );
}

function DriveEnergy3D({ ddi, gdi, wdi }: { ddi: number, gdi: number, wdi: number }) {
  return (
    <svg viewBox="0 0 200 200" className="w-40 h-40">
       <g transform="translate(100, 100)">
          {/* Energy Spheres (Sized by Drive) */}
          <motion.circle 
            r={Math.max(10, ddi * 60)} fill="#06b6d4" fillOpacity="0.2" stroke="#06b6d4" strokeWidth="2"
            animate={{ scale: [1, 1.1, 1], y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}
          />
          <motion.circle 
            r={Math.max(10, gdi * 60)} fill="#6366f1" fillOpacity="0.2" stroke="#6366f1" strokeWidth="2"
            animate={{ scale: [1, 1.1, 1], x: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
          />
          <motion.circle 
            r={Math.max(10, wdi * 60)} fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="2"
            animate={{ scale: [1, 1.1, 1], x: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 5, delay: 1 }}
          />
       </g>
    </svg>
  );
}

// ─── Shared UI Components ──────────────────────────────────────────────────

function DriveStat({ label, value, color, icon }: { label: string, value: number, color: string, icon: React.ReactNode }) {
  const colorMap: any = {
    cyan: "bg-cyan-500 text-cyan-500",
    indigo: "bg-indigo-500 text-indigo-500",
    emerald: "bg-emerald-500 text-emerald-500"
  };
  return (
    <div className="space-y-4">
       <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-xl bg-opacity-10", colorMap[color].split(' ')[0])}>{icon}</div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
       </div>
       <div className="flex items-end gap-2">
          <span className="text-4xl font-black text-white italic tracking-tighter">{Math.max(0, value)}</span>
          <span className={cn("text-xs font-bold uppercase mb-1", colorMap[color].split(' ')[1])}>%</span>
       </div>
       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, value))}%` }} className={cn("h-full", colorMap[color].split(' ')[0])} />
       </div>
    </div>
  );
}
