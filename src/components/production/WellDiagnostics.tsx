import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  Activity, 
  Zap, 
  Layers, 
  BarChart, 
  Crosshair,
  AlertTriangle,
  ChevronRight,
  Target,
  FlaskConical,
  Wind,
  Droplets
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
  ScatterChart,
  Scatter,
  ComposedChart,
  ReferenceDot
} from 'recharts';

export function WellDiagnostics() {
  const [selectedTool, setSelectedTool] = useState('hall');

  // Diagnostic Tools Definition
  const tools = [
    { id: 'hall', name: 'Hall Plot', icon: Activity, desc: 'Injection Integrity & Skin evolution' },
    { id: 'step', name: 'Step Rate Test', icon: Zap, desc: 'Fracture pressure identification' },
    { id: 'gradient', name: 'Flowing Gradient', icon: Layers, desc: 'P-Depth survey interpretation' },
    { id: 'skin', name: 'Skin Tracker', icon: Crosshair, desc: 'Historical skin factor trend' },
    { id: 'vogel', name: 'Vogel Back-Calc', icon: Target, desc: 'IPR construction from test point' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
      {/* Tool Selector Sidebar */}
      <div className="lg:col-span-3 space-y-4">
        {tools.map(tool => (
           <ToolCard 
              key={tool.id}
              active={selectedTool === tool.id}
              onClick={() => setSelectedTool(tool.id)}
              {...tool}
           />
        ))}

        <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-amber-900/40 to-black border-amber-500/10 mt-8">
           <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={18} className="text-amber-500" />
              <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Warning Flags</h5>
           </div>
           <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl">
                 <p className="text-[11px] text-slate-400 italic">
                    {selectedTool === 'hall' && "Well W-02: Steep Hall Plot slope detected. Potential plugging in injector."}
                    {selectedTool === 'step' && "Well W-05: Breakpoint detected at lower than expected pressure (1,720 PSI)."}
                    {selectedTool === 'gradient' && "Well W-01: Irregular fluid gradient detected. Potential liquid loading."}
                    {selectedTool === 'skin' && "Well W-03: High skin factor trend detected. Stimulation evaluation recommended."}
                    {selectedTool === 'vogel' && "Well W-04: IPR indicates high drawdown. Check for potential gas coning."}
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Diagnostic Display Area */}
      <div className="lg:col-span-9">
        <AnimatePresence mode="wait">
           {selectedTool === 'hall' && <HallPlotDiagnostic key="hall" />}
           {selectedTool === 'step' && <StepRateDiagnostic key="step" />}
           {selectedTool === 'gradient' && <GradientSurveyDiagnostic key="gradient" />}
           {selectedTool === 'skin' && <SkinTrackerDiagnostic key="skin" />}
           {selectedTool === 'vogel' && <VogelBackCalcDiagnostic key="vogel" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ToolCard({ name, icon: Icon, desc, active, onClick }: { name: string, icon: any, desc: string, active: boolean, onClick: () => void }) {
  return (
    <motion.div 
       whileHover={{ scale: 1.02 }}
       whileTap={{ scale: 0.98 }}
       onClick={onClick}
       className={cn(
          "glass-card rounded-2xl p-6 border-white/5 transition-all cursor-pointer",
          active ? "bg-cyan-500/10 ring-1 ring-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]" : "bg-black/40 hover:bg-white/[0.02]"
       )}
    >
       <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-2xl", active ? "bg-cyan-500 text-black" : "bg-white/5 text-slate-500")}>
             <Icon size={18} />
          </div>
          <div>
             <h4 className={cn("text-xs font-black uppercase italic tracking-wider", active ? "text-cyan-400" : "text-white")}>{name}</h4>
             <p className="text-[11px] text-slate-600 italic mt-0.5">{desc}</p>
          </div>
          {active && <ChevronRight className="ml-auto text-cyan-400" size={14} />}
       </div>
    </motion.div>
  );
}

function HallPlotDiagnostic() {
  const data = [
    { cumInj: 100, hallVal: 200, slope: 'normal' },
    { cumInj: 200, hallVal: 450, slope: 'normal' },
    { cumInj: 300, hallVal: 750, slope: 'steeper' },
    { cumInj: 400, hallVal: 1200, slope: 'steeper' },
    { cumInj: 500, hallVal: 1800, slope: 'steeper' },
  ];

  return (
    <motion.div 
       initial={{ opacity: 0, x: 20 }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: -20 }}
       className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="mb-10">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Hall <span className="text-cyan-500">Integrity Plot</span></h3>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Injection Surveillance & Plugging Diagnostic</p>
       </div>

       <div className="h-[400px] w-full mb-10">
          <ResponsiveContainer width="100%" height="100%">
             <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis dataKey="cumInj" label={{ value: 'Cumulative Injection', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#475569' }} stroke="#475569" fontSize={10} />
                <YAxis label={{ value: '∑(Pinj-Pres)Δt', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#475569' }} stroke="#475569" fontSize={10} />
                <Tooltip />
                <Line type="monotone" dataKey="hallVal" stroke="#06b6d4" strokeWidth={4} dot={{ fill: '#06b6d4', r: 4 }} />
             </LineChart>
          </ResponsiveContainer>
       </div>

       <div className="grid grid-cols-3 gap-6">
          <DiagnosticFact label="Slope State" value="STEEPENING" color="text-amber-500" />
          <DiagnosticFact label="Status" value="PLUGGING" color="text-red-500" />
          <DiagnosticFact label="Confidence" value="88%" color="text-slate-400" />
       </div>
    </motion.div>
  );
}

function StepRateDiagnostic() {
  const data = [
    { rate: 100, press: 1200 },
    { rate: 200, press: 1400 },
    { rate: 300, press: 1600 },
    { rate: 350, press: 1700 },
    { rate: 450, press: 1800 },
    { rate: 550, press: 1880 },
    { rate: 650, press: 1950 },
  ];

  return (
    <motion.div 
       initial={{ opacity: 0, x: 20 }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: -20 }}
       className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="mb-10">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Step <span className="text-emerald-500">Rate Test</span></h3>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Fracture Pressure Identification Survey</p>
       </div>

       <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
             <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis dataKey="rate" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip />
                <Line type="monotone" dataKey="press" stroke="#10b981" strokeWidth={4} />
             </LineChart>
          </ResponsiveContainer>
       </div>
       <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/5">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2">Detected Breakpoint</span>
          <span className="text-xl font-black text-white italic">1,720 PSI @ 365 BWPD</span>
       </div>
    </motion.div>
  );
}

function GradientSurveyDiagnostic() {
  const data = [
    { depth: 0, p: 200 },
    { depth: 1000, p: 450 },
    { depth: 2000, p: 700 },
    { depth: 3000, p: 1200 }, // Gas Liquid Interface
    { depth: 4000, p: 1800 },
    { depth: 5000, p: 2400 },
  ];

  return (
    <motion.div 
       initial={{ opacity: 0, x: 20 }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: -20 }}
       className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="mb-10">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Flowing <span className="text-indigo-500">Gradient</span></h3>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Pressure-Depth Survey Interpretation</p>
       </div>

       <div className="flex gap-8 h-[400px]">
          <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} layout="vertical">
                   <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" />
                   <XAxis type="number" stroke="#475569" fontSize={10} axisLine={false} />
                   <YAxis dataKey="depth" type="number" stroke="#475569" fontSize={10} reversed axisLine={false} />
                   <Tooltip />
                   <Line type="monotone" dataKey="p" stroke="#6366f1" strokeWidth={4} />
                </LineChart>
             </ResponsiveContainer>
          </div>
          <div className="w-48 space-y-4 pt-10">
             <GradientPoint label="Surface" val="200 PSI" />
             <div className="h-20" />
             <GradientPoint label="Fluid Level" val="2,850 FT" color="text-indigo-400" />
             <div className="h-32" />
             <GradientPoint label="BHP" val="2,400 PSI" />
          </div>
       </div>
    </motion.div>
  );
}

function VogelBackCalcDiagnostic() {
  const [testQ, setTestQ] = useState(1200);
  const [testPwf, setTestPwf] = useState(1800);
  const [testPr, setTestPr] = useState(3200);

  const calculateQmax = () => {
    const r = testPwf / testPr;
    // avoid divide by zero if user sets r=1 (testPwf = testPr)
    if (r >= 1) return testQ; 
    return testQ / (1 - 0.2 * r - 0.8 * r * r);
  };

  const qMax = calculateQmax();

  const iprData = React.useMemo(() => {
    const data = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const pwf = testPr - (testPr / steps) * i;
      const r = pwf / testPr;
      const q = qMax * (1 - 0.2 * r - 0.8 * r * r);
      data.push({ pwf, q: Math.max(0, q) });
    }
    return data;
  }, [testPr, qMax]);

  return (
    <motion.div 
       initial={{ opacity: 0, x: 20 }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: -20 }}
       className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="mb-10 flex items-center justify-between">
          <div>
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Vogel <span className="text-cyan-500">IPR Back-Calc</span></h3>
             <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Construct full IPR from a single test point</p>
          </div>
          <div className="p-6 bg-cyan-500/10 rounded-3xl border border-cyan-500/20 text-center">
             <span className="text-[11px] font-black text-cyan-400 uppercase tracking-widest mb-1 block">Absolute Open Flow (AOF)</span>
             <span className="text-3xl font-black text-white italic tracking-tighter">{formatNumber(qMax, 0)} <span className="text-sm font-normal text-slate-500">STB/D</span></span>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <InputGroup label="Test Rate (q)" unit="STB/D" value={testQ} onChange={setTestQ} />
          <InputGroup label="Test Pwf" unit="PSI" value={testPwf} onChange={setTestPwf} />
          <InputGroup label="Res. Pressure (Pr)" unit="PSI" value={testPr} onChange={setTestPr} />
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
             <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6">Inflow Performance Relationship (IPR)</h4>
             <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <ComposedChart data={iprData} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                      <XAxis type="number" dataKey="q" stroke="#475569" fontSize={10} domain={[0, 'auto']} label={{ value: 'Rate (STB/D)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#475569' }} />
                      <YAxis type="number" dataKey="pwf" stroke="#475569" fontSize={10} domain={[0, testPr]} label={{ value: 'Pwf (PSI)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#475569' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="q" stroke="#06b6d4" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                      <ReferenceDot x={testQ} y={testPwf} r={6} fill="#f59e0b" stroke="#ffffff" strokeWidth={2} />
                   </ComposedChart>
                </ResponsiveContainer>
             </div>
             <div className="flex justify-between items-center mt-4 text-[11px] font-mono text-slate-500 uppercase">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#06b6d4]"></div> IPR Curve</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#f59e0b] border border-white"></div> Test Point</span>
             </div>
          </div>

          <div className="glass-card rounded-3xl p-8 border-white/5 bg-black/40">
             <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-6">Kinetic Reservoir Inflow Simulator</h4>
             <div className="h-[250px] flex items-center justify-center">
                <ReservoirInflowSimulator3D pr={testPr} pwf={testPwf} q={testQ} />
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function ReservoirInflowSimulator3D({ pr, pwf, q }: { pr: number, pwf: number, q: number }) {
  const speed = Math.max(0.2, 2000 / (q || 1));
  const drawdown = pr - pwf;
  const flowIntensity = Math.min(25, Math.floor(Math.max(2, q / 150)));

  return (
     <svg viewBox="0 0 200 200" className="w-full h-full max-w-[250px] mx-auto">
        <rect x="0" y="0" width="200" height="200" fill="#f59e0b" fillOpacity="0.1" />
        
        <defs>
           <radialGradient id="drawdownGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={Math.min(0.8, drawdown / 2000)} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
           </radialGradient>
        </defs>
        <rect x="0" y="0" width="200" height="200" fill="url(#drawdownGrad)" />

        <rect x="80" y="0" width="40" height="200" fill="#1e293b" stroke="#334155" strokeWidth="2" />
        
        {[40, 80, 120, 160].map(y => (
           <g key={y}>
             <rect x="75" y={y} width="10" height="4" fill="#000" />
             <rect x="115" y={y} width="10" height="4" fill="#000" />
           </g>
        ))}

        {/* Fluid flowing up wellbore */}
        <motion.path 
           d="M 100 200 L 100 0" 
           stroke="#06b6d4" 
           strokeWidth="15" 
           strokeDasharray="20 10" 
           animate={{ strokeDashoffset: [0, -30] }} 
           transition={{ repeat: Infinity, duration: speed * 0.5, ease: "linear" }} 
        />

        {/* Fluid flowing in */}
        {[...Array(flowIntensity)].map((_, i) => (
           <motion.circle key={`l-${i}`} r="2" fill="#06b6d4"
              initial={{ cx: Math.random() * 60, cy: Math.random() * 200 }}
              animate={{ cx: 85, cy: 100, opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: speed, delay: Math.random() * speed }}
           />
        ))}
        {[...Array(flowIntensity)].map((_, i) => (
           <motion.circle key={`r-${i}`} r="2" fill="#06b6d4"
              initial={{ cx: 200 - Math.random() * 60, cy: Math.random() * 200 }}
              animate={{ cx: 115, cy: 100, opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: speed, delay: Math.random() * speed }}
           />
        ))}
     </svg>
  );
}

function DiagnosticFact({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
       <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1 block">{label}</span>
       <span className={cn("text-lg font-black italic tracking-tight", color)}>{value}</span>
    </div>
  );
}

function GradientPoint({ label, val, color = "text-white" }: { label: string, val: string, color?: string }) {
  return (
    <div className="relative pl-4 border-l border-white/10">
       <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white/20" />
       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">{label}</span>
       <span className={cn("text-[10px] font-bold italic", color)}>{val}</span>
    </div>
  );
}

function InputGroup({ label, unit, value, onChange }: { label: string, unit: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-3">
       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
       <div className="relative group">
          <input 
             type="number" 
             value={value}
             onChange={(e) => onChange(parseFloat(e.target.value))}
             className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg font-black text-white italic focus:ring-1 focus:ring-cyan-500 outline-none" 
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-700 italic">{unit}</span>
       </div>
    </div>
  );
}

function SkinTrackerDiagnostic() {
  const [skinFactor, setSkinFactor] = useState(5.0);

  const historicalData = React.useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      date: `2026-0${Math.floor(i/2)+1}-${(i%2)*15+10}`,
      skin: Math.max(-5, skinFactor - (9 - i) * 0.5 + Math.random() * 2),
    }));
  }, [skinFactor]);

  return (
    <motion.div 
       initial={{ opacity: 0, x: 20 }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: -20 }}
       className="glass-card rounded-3xl p-12 border-white/5 bg-[#05070a] h-full"
    >
       <div className="mb-10">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Skin <span className="text-red-500">Tracker</span></h3>
          <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest italic font-bold">Formation Damage & Stimulation Evaluation</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-6">
             <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Skin Factor (S)</label>
               <input 
                  type="range" min="-5" max="20" step="0.5" value={skinFactor}
                  onChange={(e) => setSkinFactor(parseFloat(e.target.value))}
                  className="w-full accent-red-500"
               />
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-emerald-500">Stimulated (-5)</span>
                  <span className="text-2xl font-black text-white italic">{skinFactor.toFixed(1)}</span>
                  <span className="text-[10px] font-mono text-red-500">Damaged (+20)</span>
               </div>
             </div>
             
             <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                      <XAxis dataKey="date" stroke="#475569" fontSize={8} />
                      <YAxis stroke="#475569" fontSize={10} domain={[-5, 25]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="skin" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} />
                   </LineChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border-white/5 bg-black/40 flex items-center justify-center relative overflow-hidden">
             {/* 3D Wellbore Skin Animation */}
             <svg viewBox="0 0 200 200" className="w-full h-full max-w-[250px]">
                {/* Reservoir */}
                <rect x="0" y="0" width="200" height="200" fill="#f59e0b" fillOpacity="0.2" />
                
                {/* Skin Zone (Damage or Stimulation) */}
                {(() => {
                   if (skinFactor > 0) {
                      // Damaged (Red)
                      const radius = 20 + skinFactor * 4;
                      return <circle cx="100" cy="100" r={radius} fill="#ef4444" fillOpacity="0.4" />;
                   } else if (skinFactor < 0) {
                      // Stimulated (Green/Fractures)
                      return (
                         <g>
                            <circle cx="100" cy="100" r="60" fill="#10b981" fillOpacity="0.2" />
                            {/* Fracture lines */}
                            <path d="M 100 100 L 40 40 M 100 100 L 160 40 M 100 100 L 40 160 M 100 100 L 160 160" stroke="#10b981" strokeWidth="4" />
                         </g>
                      );
                   }
                   return null;
                })()}

                {/* Wellbore */}
                <circle cx="100" cy="100" r="15" fill="#1e293b" stroke="#ffffff" strokeWidth="2" />
                
                {/* Flow particles */}
                {(() => {
                   const speed = Math.max(0.5, 2 + (skinFactor / 5)); 
                   const particles = 12;
                   return [...Array(particles)].map((_, i) => {
                      const angle = (i / particles) * Math.PI * 2;
                      const startX = 100 + Math.cos(angle) * 90;
                      const startY = 100 + Math.sin(angle) * 90;
                      const endX = 100 + Math.cos(angle) * 20;
                      const endY = 100 + Math.sin(angle) * 20;
                      return (
                         <motion.circle key={i} r="2" fill="#3b82f6"
                            initial={{ cx: startX, cy: startY }}
                            animate={{ cx: endX, cy: endY, opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: speed, delay: (i % 3) * 0.5 }}
                         />
                      );
                   });
                })()}
             </svg>

             {/* Pressure Profile Overlay */}
             <div className="absolute bottom-4 left-4 right-4 bg-black/60 p-3 rounded-xl border border-white/10 backdrop-blur-md">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Near-Wellbore Pressure Drop</span>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div className={cn("h-full", skinFactor > 0 ? "bg-red-500" : "bg-emerald-500")} style={{ width: `${Math.min(100, Math.max(5, (skinFactor + 5) * 4))}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                   <span className="text-[10px] font-mono text-slate-500">P_wf</span>
                   <span className="text-[10px] font-mono text-slate-500">P_res</span>
                </div>
             </div>
          </div>
       </div>
    </motion.div>
  );
}
