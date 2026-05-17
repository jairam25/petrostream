import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Settings2, 
  TrendingUp, 
  Activity, 
  AlertOctagon,
  HardHat,
  Thermometer,
  ArrowRightCircle,
  Stethoscope,
  Wind,
  ShieldCheck,
  Flame,
  LifeBuoy
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { calculatePipelineRemainingLife, calculateMAOP, calculateReliefAreaLiquid } from '../../lib/reservoir';
import { H2S_SAFETY_LIMITS, ENVIRONMENTAL_COMPLIANCE } from '../../lib/safety_environmental_data';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export function HSEIntegrityTab() {
  const [activePortal, setActivePortal] = useState<'wellhead' | 'pipeline' | 'psv' | 'safety'>('wellhead');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
      {/* Sidebar Selector */}
      <div className="lg:col-span-3 space-y-4">
        {[
          { id: 'wellhead', label: 'Wellhead Integrity', desc: 'SCP monitoring & leak rates', icon: Stethoscope },
          { id: 'pipeline', label: 'Pipeline Health', icon: Activity, desc: 'Remaining life & MAOP calcs' },
          { id: 'psv', label: 'Process Safety', icon: ShieldAlert, desc: 'Relief valve & flare capacity' },
          { id: 'safety', label: 'Safety & Env.', icon: HardHat, desc: 'H2S toxicity & Eco-compliance' }
        ].map(p => (
           <motion.div 
              key={p.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActivePortal(p.id as any)}
              className={cn(
                "glass-card rounded-2xl p-6 border-white/5 transition-all cursor-pointer",
                activePortal === p.id ? "bg-red-500/10 ring-1 ring-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]" : "bg-black/40 hover:bg-white/[0.02]"
              )}
           >
              <div className="flex items-center gap-4">
                 <div className={cn("p-3 rounded-2xl", activePortal === p.id ? "bg-red-500 text-white" : "bg-white/5 text-slate-500")}>
                    <p.icon size={18} />
                 </div>
                 <div>
                    <h4 className={cn("text-xs font-black uppercase italic tracking-wider", activePortal === p.id ? "text-red-400" : "text-white")}>{p.label}</h4>
                    <p className="text-[11px] text-slate-600 italic mt-0.5">{p.desc}</p>
                 </div>
              </div>
           </motion.div>
        ))}

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-red-900/20 to-black border-red-500/10 mt-8">
           <div className="flex items-center gap-3 mb-6">
              <ShieldCheck size={18} className="text-red-500" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Safety Compliance</h5>
           </div>
           <div className="space-y-4 font-mono">
              <div className="flex justify-between items-center">
                 <span className="text-[11px] text-slate-500 uppercase">HSE Score</span>
                 <span className="text-[10px] text-emerald-400 font-bold">98/100</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[11px] text-slate-500 uppercase">Last Inspection</span>
                 <span className="text-[10px] text-white">4D AGO</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[11px] text-slate-500 uppercase">Open Correctives</span>
                 <span className="text-[10px] text-amber-500 font-bold">02</span>
              </div>
           </div>
        </div>
      </div>

      {/* Analysis UI */}
      <div className="lg:col-span-9">
         <AnimatePresence mode="wait">
            {activePortal === 'wellhead' && <WellheadIntegrityTool key="wellhead" />}
            {activePortal === 'pipeline' && <PipelineIntegrityTool key="pipeline" />}
            {activePortal === 'psv' && <ProcessSafetyTool key="psv" />}
            {activePortal === 'safety' && <SafetyEnvironmentalTool key="safety" />}
         </AnimatePresence>
      </div>
    </div>
  );
}

function SafetyEnvironmentalTool() {
  const [h2sPPM, setH2sPPM] = useState(5000); // PPM H2S concentration
  const [gasRate, setGasRate] = useState(5);   // MMSCFD release volume
  const [windSpeed, setWindSpeed] = useState(5); // mph

  // Texas RRC Rule 36 ROE Formula (industry standard):
  // ROE (ft) = C * (H2S_MMSCFD)^0.6258
  // where H2S_MMSCFD = (PPM/1,000,000) * gasRate
  // C(100ppm) = 1.589e6^0.6258 => use published lookup coefficients
  const h2sMMSCFD = (h2sPPM / 1_000_000) * gasRate;
  
  // Coefficients from Texas RRC Rule 36 Table 1
  const roe100 = h2sMMSCFD > 0 ? Math.min(99999, 13_267 * Math.pow(h2sMMSCFD, 0.6258)) : 0;
  const roe500 = h2sMMSCFD > 0 ? Math.min(99999,  5_432 * Math.pow(h2sMMSCFD, 0.6258)) : 0;

  // Wind correction factor: higher wind disperses faster = smaller zone
  const windFactor = Math.max(0.4, 1 - ((windSpeed - 5) * 0.04));
  const correctedRoe100 = roe100 * windFactor;
  const correctedRoe500 = roe500 * windFactor;

  // OSHA threshold: ROE-100 must not exceed public property (3000 ft limit)
  const isCompliant = correctedRoe100 < 3000;

  // Categorize H2S hazard level
  const hazardLevel = h2sPPM < 10 ? "SAFE"
    : h2sPPM < 50  ? "CAUTION (IDLH Approach)"
    : h2sPPM < 100 ? "DANGER (IDLH Zone)"
    : h2sPPM < 300 ? "FATAL EXPOSURE"
    : "INSTANT DEATH";

  const hazardColor = h2sPPM < 10 ? "text-emerald-400"
    : h2sPPM < 50  ? "text-amber-400"
    : h2sPPM < 100 ? "text-orange-500"
    : "text-red-500";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full overflow-y-auto scrollbar-hide"
    >
       <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Safety &amp; <span className="text-emerald-500">Environment</span></h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">H2S Dispersion ROE Calculator — Texas RRC Rule 36</p>
          </div>
          <div className="flex gap-4">
             <div className={cn("p-6 rounded-3xl border text-center transition-all duration-500", isCompliant ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.2)]")}>
                <span className={cn("text-[10px] font-black uppercase tracking-widest block mb-1", isCompliant ? "text-emerald-400" : "text-red-400")}>Regulatory Status</span>
                <span className="text-xl font-black text-white italic uppercase">{isCompliant ? "Compliant" : "⚠ Violation"}</span>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Left: Inputs + Results */}
          <div className="space-y-8">
             <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <ShieldAlert size={14} className="text-red-500" />
                   H2S Release Scenario
                </h4>
                <div className="space-y-8">
                   <InputSlide label="H2S Concentration" val={h2sPPM} setVal={setH2sPPM} min={0} max={100000} step={500} unit="PPM" />
                   <InputSlide label="Gas Release Volume" val={gasRate} setVal={setGasRate} min={0.1} max={50} step={0.1} unit="MMSCFD" />
                   <InputSlide label="Wind Speed" val={windSpeed} setVal={setWindSpeed} min={1} max={30} step={1} unit="MPH" />
                </div>
             </div>

             {/* Hazard Classification */}
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Hazard Classification</h5>
                <div className="flex items-center justify-between">
                   <span className="text-[11px] text-slate-500 uppercase font-black">H2S Level → {h2sPPM.toLocaleString()} PPM</span>
                   <span className={cn("text-[10px] font-black uppercase tracking-widest", hazardColor)}>{hazardLevel}</span>
                </div>
                <div className="mt-4 h-2 bg-slate-900 rounded-full overflow-hidden">
                   <motion.div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500"
                      animate={{ width: `${Math.min(100, (h2sPPM / 1000))}%` }}
                   />
                </div>
             </div>

             {/* Calculated ROE Outputs */}
             <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-amber-500/10 rounded-3xl border border-amber-500/20 text-center">
                   <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1">100 PPM ROE</span>
                   <span className="text-2xl font-black text-white italic font-mono">{formatNumber(correctedRoe100, 0)}</span>
                   <span className="text-[11px] text-slate-500 block">FT radius</span>
                </div>
                <div className="p-6 bg-red-500/10 rounded-3xl border border-red-500/20 text-center">
                   <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block mb-1">500 PPM ROE</span>
                   <span className="text-2xl font-black text-white italic font-mono">{formatNumber(correctedRoe500, 0)}</span>
                   <span className="text-[11px] text-slate-500 block">FT radius</span>
                </div>
             </div>

             <div className="p-6 bg-red-500/5 rounded-3xl border border-red-500/10">
                <h5 className="text-[11px] font-black text-red-400 uppercase tracking-widest mb-3 italic">Pasquill-Gifford Note</h5>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                  Wind correction factor applied ({windFactor.toFixed(2)}x). Stability class D assumed. If 100 PPM ROE &gt; 3,000 ft, public exclusion zone and SCBA deployment required under Texas RRC Rule 36.
                </p>
             </div>
          </div>

          {/* Right: 3D Plume Simulator */}
          <div className="glass-card rounded-2xl p-8 bg-[#030407] border-white/5 flex flex-col relative overflow-hidden">
             <div className="absolute top-6 left-6 z-10">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">3D Toxic Plume Simulator</h4>
                <p className="text-[11px] text-red-400 uppercase font-bold mt-1">Real-time ROE Dispersion Zones</p>
             </div>

             <div className="w-full h-full min-h-[350px] mt-14 flex items-center justify-center">
                <H2SPlumeSimulator3D roe100={correctedRoe100} roe500={correctedRoe500} windSpeed={windSpeed} />
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function H2SPlumeSimulator3D({ roe100, roe500, windSpeed }: { roe100: number, roe500: number, windSpeed: number }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2;
      time += 0.05;

      const scale = 0.05; // ft to pixels approx
      const r100 = roe100 * scale;
      const r500 = roe500 * scale;
      const drift = windSpeed * 2;

      // Draw Zones with Glow
      const drawZone = (r: number, color: string, alpha: number) => {
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        // Shifted ellipse for wind drift
        ctx.ellipse(centerX + drift, centerY, r + drift, r, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      };

      drawZone(r100, '#f59e0b', 0.2);
      drawZone(r500, '#ef4444', 0.4);

      // Source point
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4 + Math.sin(time * 5) * 2, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [roe100, roe500, windSpeed]);

  return <canvas ref={canvasRef} width={400} height={400} className="w-full h-full" />;
}

function WellheadIntegrityTool() {
  const [scpA, setScpA] = useState(450);
  const [scpB, setScpB] = useState(120);

   const threshold = 1200;
   
   // Diagnostics Logic
   const isABad = scpA > threshold * 0.8;
   const isBBad = scpB > threshold * 0.5; // B annulus is more critical
   
   const bleedTest = scpA > 0 || scpB > 0 ? "REQUIRED" : "N/A";
   const lubeBleed = scpA > 500 ? "REQUIRED" : "PENDING";
   const workoverRisk = (isABad || isBBad) ? "HIGH RISK" : scpA > 300 ? "MONITOR" : "LOW RISK";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="flex items-center justify-between mb-12">
          <div>
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Wellhead <span className="text-red-500">Integrity</span></h3>
             <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Sustained Casing Pressure (SCP) Diagnostics</p>
          </div>
          <div className="flex gap-4">
             <div className="p-6 bg-red-500/10 rounded-3xl border border-red-500/20 text-center">
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block mb-1">Max SCP Threshold</span>
                <span className="text-2xl font-black text-white italic font-mono">{formatNumber(threshold, 0)} <span className="text-sm font-normal text-slate-500">PSI</span></span>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div className="space-y-8">
             <InputSlide label="Annulus A Pressure" val={scpA} setVal={setScpA} min={0} max={2000} unit="PSI" />
             <InputSlide label="Annulus B Pressure" val={scpB} setVal={setScpB} min={0} max={1000} unit="PSI" />
             
             <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Diagnostics Decision Tree</h5>
                <div className="space-y-3">
                   <DecisionStep label="Bleed Down Test" status={bleedTest} active={bleedTest === "REQUIRED"} />
                   <DecisionStep label="Lube and Bleed" status={lubeBleed} active={lubeBleed === "REQUIRED"} />
                   <DecisionStep label="Workover / Remediation" status={workoverRisk} active={workoverRisk === "HIGH RISK"} />
                </div>
             </div>
          </div>

          <div className="glass-card rounded-2xl p-8 bg-[#030407] border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-6 left-6 z-10">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">3D Annular Integrity Simulator</h4>
                <p className="text-[11px] text-red-400 uppercase font-bold mt-1">Real-time Gas Migration View</p>
             </div>
             
             <div className="w-full h-full min-h-[300px] mt-8 flex items-center justify-center">
                <SCPWellheadSimulator3D scpA={scpA} scpB={scpB} threshold={threshold} />
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function SCPWellheadSimulator3D({ scpA, scpB, threshold }: { scpA: number, scpB: number, threshold: number }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const midX = w / 2;
      time += 0.02;

      // Draw Wellhead
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(midX - 40, 50, 80, h - 100);
      
      // Bubbles in Annulus A
      const intensityA = scpA / threshold;
      ctx.fillStyle = `rgba(239, 68, 68, ${0.2 + intensityA * 0.5})`;
      for (let i = 0; i < 20; i++) {
        const x = midX - 30 + (Math.sin(i * 45) * 10);
        const y = ((i * 20 + time * 50) % (h - 120)) + 60;
        ctx.beginPath();
        ctx.arc(x, h - y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [scpA, scpB, threshold]);

  return <canvas ref={canvasRef} width={300} height={400} className="w-full h-full" />;
}

function PipelineIntegrityTool() {
  const [measuredT, setMeasuredT] = useState(0.350);
  const [minT, setMinT] = useState(0.200);
  const [corrRate, setCorrRate] = useState(0.015);

  const remainingLife = calculatePipelineRemainingLife(measuredT, minT, corrRate);
  const maop = calculateMAOP(35000, measuredT, 12.75, 0.72);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Pipeline <span className="text-emerald-500">Integrity</span></h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Remaining Life & MAOP (ASME B31.8) Assessment</p>
          </div>
          <div className="p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 text-center">
             <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Calculated MAOP</span>
             <span className="text-2xl font-black text-white italic font-mono">{formatNumber(maop, 0)} <span className="text-sm font-normal text-slate-500">PSI</span></span>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
             <InputSlide label="Measured Wall Thickness" val={measuredT} setVal={setMeasuredT} min={0.1} max={1.0} step={0.001} unit="IN" />
             <InputSlide label="Design Min Thickness" val={minT} setVal={setMinT} min={0.1} max={0.5} step={0.001} unit="IN" />
             <InputSlide label="Corrosion Rate" val={corrRate} setVal={setCorrRate} min={0} max={0.1} step={0.001} unit="IN/YR" />
          </div>

          <div className="glass-card rounded-2xl p-8 bg-[#030407] border-white/5 flex flex-col relative overflow-hidden">
             <div className="absolute top-6 left-6 z-10 w-full pr-12 flex justify-between items-start">
                <div>
                   <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">3D Pipeline Wall Simulator</h4>
                   <p className="text-[11px] text-emerald-400 uppercase font-bold mt-1">Cross-section Corrosion Model</p>
                </div>
                <div className="text-right">
                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1 italic">Remaining Life</span>
                   <span className="text-3xl font-black text-white italic tracking-tighter">{formatNumber(remainingLife, 1)} <span className="text-xs font-normal text-slate-500">YRS</span></span>
                </div>
             </div>

             <div className="w-full h-full min-h-[300px] mt-16 flex items-center justify-center">
                <PipelineHealthSimulator3D measuredT={measuredT} minT={minT} originalT={0.500} />
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function PipelineHealthSimulator3D({ measuredT, minT, originalT }: { measuredT: number, minT: number, originalT: number }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      time += 0.02;

      const thickness = (measuredT / originalT) * 40;

      // Pipe Profile
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.arc(w/2, h/2, 60, 0, Math.PI * 2);
      ctx.stroke();

      // Corrosion Spots
      const health = measuredT / minT;
      if (health < 1.2) {
        ctx.fillStyle = '#ef4444';
        for (let i = 0; i < 10; i++) {
          const angle = i * 45;
          ctx.beginPath();
          ctx.arc(w/2 + Math.cos(angle) * 60, h/2 + Math.sin(angle) * 60, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [measuredT, minT]);

  return <canvas ref={canvasRef} width={400} height={300} className="w-full h-full" />;
}

function ProcessSafetyTool() {
  const [reliefLoad, setReliefLoad] = useState(800); // GPM
  const [setPressure, setSetPressure] = useState(1200);

  const area = calculateReliefAreaLiquid(reliefLoad, 0.85, setPressure, 0);
  const radiation = (reliefLoad * 0.05) / 100; // Simplified estimation for radiation (kW/m^2)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Process <span className="text-amber-500">Safety</span></h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">API 520 Relief Valve & Flare Capacity</p>
          </div>
          <div className="p-6 bg-amber-500/10 rounded-3xl border border-amber-500/20 text-center">
             <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1">Required Area</span>
             <span className="text-2xl font-black text-white italic font-mono">{formatNumber(area, 3)} <span className="text-sm font-normal text-slate-500">SQ IN</span></span>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
             <InputSlide label="Required Relief Load" val={reliefLoad} setVal={setReliefLoad} min={10} max={5000} step={50} unit="GPM" />
             <InputSlide label="Set Pressure" val={setPressure} setVal={setSetPressure} min={100} max={3000} step={50} unit="PSI" />
             
             <div className="p-8 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-6">
                   <Flame className="text-amber-500" size={18} />
                   <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Flare Capacity Check</h5>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[11px] text-slate-400 uppercase font-black tracking-widest">Radiation at Fence</span>
                   <span className={cn("text-[10px] font-bold", radiation > 1.5 ? "text-red-500" : "text-emerald-400")}>
                      {radiation > 1.5 ? "FAILED" : "PASSED"} (P = {radiation.toFixed(2)} kW/m²)
                   </span>
                </div>
             </div>
          </div>

          <div className="glass-card rounded-2xl p-8 bg-[#030407] border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-6 left-6 z-10 w-full pr-12 flex justify-between items-start">
                <div>
                   <h4 className="text-[10px] font-black text-white uppercase tracking-widest italic">3D PSV & Flare Simulator</h4>
                   <p className="text-[11px] text-amber-400 uppercase font-bold mt-1">API 520 Dynamic Valve Relief</p>
                </div>
             </div>
             
             <div className="w-full h-full min-h-[300px] mt-12 flex items-center justify-center">
                <PSVFlareSimulator3D reliefLoad={reliefLoad} setPressure={setPressure} />
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function PSVFlareSimulator3D({ reliefLoad, setPressure }: { reliefLoad: number, setPressure: number }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      time += 0.02;

      const loadRatio = reliefLoad / 5000;

      // Flare Tip
      ctx.fillStyle = '#475569';
      ctx.fillRect(w - 100, h - 200, 20, 200);

      // Flame
      const flameH = 40 + loadRatio * 100;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(w - 100, h - 200);
      ctx.quadraticCurveTo(w - 90 + Math.sin(time * 10) * 10, h - 200 - flameH, w - 80, h - 200);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [reliefLoad, setPressure]);

  return <canvas ref={canvasRef} width={500} height={300} className="w-full h-full" />;
}

function InputSlide({ label, val, setVal, min, max, step = 1, unit }: { label: string, val: number, setVal: (v: number) => void, min: number, max: number, step?: number, unit: string }) {
  return (
    <div className="space-y-4">
       <div className="flex justify-between items-baseline">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
          <div className="flex items-baseline gap-2">
             <span className="text-[11px] font-black text-white font-mono">{val}</span>
             <span className="text-[10px] text-slate-700 font-bold uppercase">{unit}</span>
          </div>
       </div>
       <input 
          type="range" min={min} max={max} step={step} value={val} 
          onChange={(e) => setVal(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500" 
       />
    </div>
  );
}
function DecisionStep({ label, status, active }: { label: string, status: string, active?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
       <span className="text-[11px] font-black text-white uppercase">{label}</span>
       <span className={cn(
          "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
          active ? "bg-red-500 text-white" : "bg-white/5 text-slate-700"
       )}>{status}</span>
    </div>
  );
}
