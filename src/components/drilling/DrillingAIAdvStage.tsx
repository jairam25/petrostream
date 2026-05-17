import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BrainCircuit, 
  Settings, 
  Activity, 
  Compass, 
  Zap, 
  Cpu, 
  Layers, 
  LineChart as LineChartIcon, 
  Target,
  FileText,
  ShieldCheck,
  FastForward,
  Cog,
  TrendingUp,
  BarChart3,
  Dna,
  Workflow,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

type DrillingAITab = 
  | 'ph1' | 'ph2' | 'ph3' | 'ph4' | 'ph5';

export default function DrillingAIAdvStage() {
  const [activeTab, setActiveTab] = useState<DrillingAITab>('ph1');
  const tabs = [
    { id: 'ph1' as DrillingAITab, label: 'Ph.1: Automated Systems', icon: Cog },
    { id: 'ph2' as DrillingAITab, label: 'Ph.2: RT Optimization', icon: Activity },
    { id: 'ph3' as DrillingAITab, label: 'Ph.3: Geosteering', icon: Target },
    { id: 'ph4' as DrillingAITab, label: 'Ph.4: Stability AI', icon: ShieldCheck },
    { id: 'ph5' as DrillingAITab, label: 'Ph.5: Digital Planning', icon: FileText },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/20">
        <BrainCircuit className="text-purple-500" size={20} />
        <span className="text-white font-black italic text-lg tracking-tight mr-6 uppercase">AI & Automation in Drilling</span>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === t.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            )}
          >
            <t.icon size={13} />{t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'ph1' && <Phase1Automated />}
            {activeTab === 'ph2' && <Phase2Optimization />}
            {activeTab === 'ph3' && <Phase3Geosteering />}
            {activeTab === 'ph4' && <Phase4Stability />}
            {activeTab === 'ph5' && <Phase5Planning />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Phase 1: Automated Drilling Systems ────────────────────────────────────

function Phase1Automated() {
  const [activeSystem, setActiveSystem] = useState('steering');
  
  const systems = [
    { id: 'steering', title: 'Auto-Steering', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'tripping', title: 'Robotic Tripping', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { id: 'mpd', title: 'Autonomous MPD', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Cog className="text-purple-500" size={36} />
            Phase 1: Automated <span className="text-purple-500/50">Drilling Systems</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Neural Control · Robotics · MPD · Well Control</p>
        </div>
        <div className="flex gap-2">
           {systems.map(s => (
             <button 
               key={s.id} 
               onClick={() => setActiveSystem(s.id)}
               className={cn(
                 "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                 activeSystem === s.id ? "border-purple-500 bg-purple-500/10 text-white" : "border-white/5 text-slate-500"
               )}
             >
               {s.title}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
           <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[500px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-20">
                 <Workflow size={200} className="text-purple-500" />
              </div>
              
              <div className="relative z-10 flex-1 flex flex-col">
                 <div className="flex justify-between items-start mb-12">
                    <div>
                       <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-1">Execution Status</span>
                       <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Live Control Logic</h3>
                    </div>
                    <div className="flex gap-12">
                       <div className="text-right">
                          <p className="text-3xl font-black text-emerald-400 italic">94.2%</p>
                          <p className="text-[11px] text-slate-500 uppercase font-bold">Automation Uptime</p>
                       </div>
                       <div className="text-right">
                          <p className="text-3xl font-black text-white italic">0.02s</p>
                          <p className="text-[11px] text-slate-500 uppercase font-bold">Command Latency</p>
                       </div>
                    </div>
                 </div>

                 <div className="flex-1 grid grid-cols-2 gap-8">
                    <div className="space-y-6">
                       {activeSystem === 'steering' && (
                         <div className="space-y-4">
                            <ControlMetric label="Target Inclination" value="88.4°" target="88.5°" progress={98} />
                            <ControlMetric label="Target Azimuth" value="274.1°" target="274.0°" progress={99} />
                            <ControlMetric label="DLS Commanded" value="4.2°/100ft" target="4.5°/100ft" progress={93} />
                         </div>
                       )}
                       {activeSystem === 'tripping' && (
                         <div className="space-y-4">
                            <ControlMetric label="Pipe Rack Speed" value="120 jts/hr" target="135 jts/hr" progress={88} />
                            <ControlMetric label="Iron Roughneck Torque" value="42k ft-lb" target="42k ft-lb" progress={100} />
                            <ControlMetric label="Tripping Surge Margin" value="1.2 ppg" target="0.8 ppg" progress={75} />
                         </div>
                       )}
                       {activeSystem === 'mpd' && (
                         <div className="space-y-4">
                            <ControlMetric label="Backpressure Setpoint" value="420 psi" target="420 psi" progress={100} />
                            <ControlMetric label="Choke Opening" value="12.4%" target="12.0%" progress={96} />
                            <ControlMetric label="Bottom Hole Pressure" value="8,420 psi" target="8,400 psi" progress={99} />
                         </div>
                       )}
                    </div>
                    <div className="bg-white/5 rounded-3xl border border-white/5 p-8 flex items-center justify-center">
                       <NeuralDataStream color={activeSystem === 'tripping' ? '#06b6d4' : activeSystem === 'mpd' ? '#10b981' : '#a855f7'} />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
           <div className="glass-card p-8 rounded-3xl bg-purple-500/5 border-purple-500/10 flex-1">
              <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-6 italic">Neural Decisions</h4>
              <div className="space-y-4">
                 {[
                   { log: "RSS Tool face adjustment commanded (8° Left)", time: "14:22:04", status: "Executed" },
                   { log: "Backpressure stabilized at 420 PSI", time: "14:21:58", status: "Success" },
                   { log: "Robotic Tripping: Stand 42 handled", time: "14:21:40", status: "Success" },
                   { log: "Anomaly detection: Bit whirl threshold approaching", time: "14:20:12", status: "Warning" }
                 ].map((log, i) => (
                   <div key={i} className="flex justify-between items-start text-[11px]">
                      <div className="flex gap-3">
                         <div className={cn("w-1 h-1 rounded-full mt-1.5", log.status === 'Warning' ? "bg-amber-500" : "bg-purple-500")} />
                         <div>
                            <p className="text-white font-medium italic">{log.log}</p>
                            <p className="text-slate-600 text-[11px] font-mono">{log.time}</p>
                         </div>
                      </div>
                      <span className={cn("text-[11px] font-black uppercase", log.status === 'Warning' ? "text-amber-500" : "text-purple-500")}>{log.status}</span>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-purple-500">
                    <Zap size={24} />
                 </div>
                 <div>
                    <h5 className="text-xs font-black text-white uppercase italic">Safety Handshake</h5>
                    <p className="text-[11px] text-slate-500 uppercase">AES-256 Protocol Active</p>
                 </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">"All robotic floor systems are currently synchronized with the neural well control engine. Emergency shut-in response time: <span className="text-white font-bold">140ms</span>."</p>
           </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phase 2: Real-Time Drilling Optimization ──────────────────────────────

function Phase2Optimization() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Activity className="text-purple-500" size={36} />
          Phase 2: Real-Time <span className="text-purple-500/50">Drilling Optimization</span>
        </h2>
        <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">ROP Modeling · MSE · Dysfunction Detection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] flex items-center justify-center">
              <RealTimeOptimization3D />
           </div>
        </div>

        <div className="glass-card p-10 rounded-3xl bg-purple-500/5 border-purple-500/10 flex flex-col justify-center text-center">
           <BarChart3 size={48} className="text-purple-500 mx-auto mb-6" />
           <h4 className="text-4xl font-black text-white italic tracking-tighter mb-2">+24.2%</h4>
           <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest italic mb-6">Efficiency Gain Predicted</p>
           <p className="text-[12px] text-slate-400 font-medium leading-relaxed italic">
              "Neural optimizer recommends increasing WOB to <span className="text-white font-black">22 klbs</span> and RPM to <span className="text-white font-black">140</span> to bypass resonance zone detected at 8,420 ft."
           </p>
           <DeployButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
         <MetricCard title="Stick-Slip Index" value="0.14" unit="Ratio" color="text-emerald-400" status="Optimal" />
         <MetricCard title="Lateral Vibration" value="1.2" unit="G-rms" color="text-amber-400" status="Caution" />
         <MetricCard title="Bit Balling Prob." value="4%" unit="Risk" color="text-emerald-400" status="Minimal" />
      </div>
    </div>
  );
}

// ─── Phase 3: Geosteering ──────────────────────────────────────────────────

function Phase3Geosteering() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Target className="text-purple-500" size={36} />
            Phase 3: Automated <span className="text-purple-500/50">Geosteering</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">LWD · Well Placement · Deep Learning</p>
        </div>
        <div className="flex items-center gap-4 px-6 py-2 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
           <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-white uppercase tracking-widest">In-Zone: 98.4%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
           <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5">
              <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-6 italic">Lithology Vision AI</h4>
              <div className="space-y-6">
                 {[
                   { rock: 'Shale', confidence: 92, color: 'bg-purple-500' },
                   { rock: 'Sandstone', confidence: 74, color: 'bg-cyan-500' },
                   { rock: 'Carbonate', confidence: 12, color: 'bg-slate-700' },
                 ].map(r => (
                   <div key={r.rock} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase">
                         <span className="text-white">{r.rock}</span>
                         <span className="text-slate-500">{r.confidence}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                         <div className={cn("h-full transition-all duration-1000", r.color)} style={{ width: `${r.confidence}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           <div className="glass-card p-8 rounded-3xl bg-purple-500/5 border-purple-500/10">
              <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4 italic">Boundary Prediction</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-6">"Upper boundary detected <span className="text-white font-bold">4.2 ft</span> above bit. Recommending dip adjustment of <span className="text-white font-bold">-0.5°</span> to maximize reservoir contact."</p>
              <button className="w-full py-2 bg-white/5 text-purple-400 border border-purple-500/20 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-purple-500/10 transition-all">
                 Recalibrate Target Model
              </button>
           </div>
        </div>

        <div className="lg:col-span-8">
           <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[500px] flex items-center justify-center relative overflow-hidden">
               <Geosteering3D />
           </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phase 4: Wellbore Stability Prediction ─────────────────────────────────

function Phase4Stability() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <ShieldCheck className="text-purple-500" size={36} />
          Phase 4: Wellbore <span className="text-purple-500/50">Stability AI</span>
        </h2>
        <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Pore Pressure · Mud Weight · Digital Models</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
           <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <StabilityPrediction3D />
           </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
           <div className="glass-card p-8 rounded-3xl bg-rose-500/5 border-rose-500/10 flex-1">
              <div className="flex justify-between items-center mb-6">
                 <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic">Instability Warning</h4>
                 <AlertTriangle size={16} className="text-rose-500 animate-bounce" />
              </div>
              <p className="text-[12px] text-slate-300 leading-relaxed mb-6">
                 "Neural vision detected high cavings concentration at shaker 2. Caliper logs indicate breakout in Shaley zone at <span className="text-white font-bold">8,240 ft</span>. Recommending mud weight increase to <span className="text-rose-500 font-bold">11.8 ppg</span>."
              </p>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                 <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                    <span className="text-slate-500">Risk Confidence</span>
                    <span className="text-white">88%</span>
                 </div>
                 <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: '88%' }} />
                 </div>
              </div>
           </div>
           
           <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 text-center">
              <Dna size={32} className="text-cyan-500 mx-auto mb-4" />
              <h5 className="text-xs font-black text-white uppercase italic">Mechanical Earth Model</h5>
              <p className="text-[11px] text-slate-500 uppercase mt-2 italic">Real-time Stress Calibration Active</p>
           </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phase 5: Digital Well Planning ─────────────────────────────────────────

function Phase5Planning() {
  const [activeView, setActiveView] = useState('traj');
  const [isFinalized, setIsFinalized] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <FileText className="text-purple-500" size={36} />
          Phase 5: Digital <span className="text-purple-500/50">Well Planning</span>
        </h2>
        <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Optimization · Anti-Collision · AFE AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {[
           { label: 'Avg AFE Accuracy', value: '94%', sub: 'vs Offset History' },
           { label: 'Time Reduction', value: '14.2%', sub: 'Neural Pathfinding' },
           { label: 'Conflict Delta', value: '0.00', sub: 'Anti-Collision' },
         ].map(s => (
           <div key={s.label} className="glass-card p-8 rounded-3xl bg-white/5 border-white/5">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{s.label}</p>
              <h4 className="text-4xl font-black text-white italic tracking-tighter mb-2">{s.value}</h4>
              <p className="text-[11px] text-purple-400 uppercase font-bold italic">{s.sub}</p>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
           <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] flex items-center justify-center relative overflow-hidden">
               <WellPlanning3D activeView={activeView} />
               <div className="absolute top-8 right-8 flex gap-4">
                  <button onClick={() => setActiveView('traj')} className={cn("px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest border transition-all", activeView === 'traj' ? "border-purple-500 text-purple-400 bg-purple-500/10" : "border-white/5 text-slate-600")}>Trajectory</button>
                  <button onClick={() => setActiveView('afe')} className={cn("px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest border transition-all", activeView === 'afe' ? "border-purple-500 text-purple-400 bg-purple-500/10" : "border-white/5 text-slate-600")}>AFE Cost</button>
               </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="glass-card p-8 rounded-3xl bg-purple-500/5 border-purple-500/10 h-full flex flex-col justify-center">
              <CheckCircle2 size={32} className={cn("mb-6 transition-colors", isFinalized ? "text-purple-500" : "text-emerald-500")} />
              <h4 className="text-xl font-black text-white uppercase italic mb-4">{isFinalized ? "WELL PLAN FINALIZED" : "PLAN READY"}</h4>
              <p className="text-[12px] text-slate-400 leading-relaxed mb-8">
                 {isFinalized 
                   ? "Well Plan #842-A has been locked and pushed to the rig control center. AFE Approval routing initiated for regional management."
                   : "Trajectory optimized for minimum torque. AFE cost estimated at $8.42M. All regulatory anti-collision checks passed."
                 }
              </p>
              <div className="flex gap-4">
                 <button 
                   onClick={() => setIsFinalized(true)}
                   disabled={isFinalized}
                   className={cn(
                     "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
                     isFinalized ? "bg-white/10 text-slate-500 cursor-not-allowed" : "bg-purple-600 text-white shadow-purple-500/20"
                   )}
                 >
                   {isFinalized ? "PLAN LOCKED" : "Finalize Well Plan"}
                 </button>
                 <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-white"><FileText size={16} /></button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function DeployButton() {
  const [status, setStatus] = useState<'idle' | 'deploying' | 'active'>('idle');

  return (
    <button 
      onClick={() => {
        setStatus('deploying');
        setTimeout(() => setStatus('active'), 2000);
      }}
      disabled={status !== 'idle'}
      className={cn(
        "mt-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
        status === 'idle' && "bg-purple-600 text-white shadow-purple-500/20 hover:scale-[1.02]",
        status === 'deploying' && "bg-amber-600 text-white cursor-wait",
        status === 'active' && "bg-emerald-600 text-white cursor-default"
      )}
    >
      {status === 'idle' && "Deploy Optimization Sequence"}
      {status === 'deploying' && "Deploying Neural Logic..."}
      {status === 'active' && "OPTIMIZATION ACTIVE"}
    </button>
  );
}

// ─── 3D Visualizers ─────────────────────────────────────────────────────────

function RealTimeOptimization3D() {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[500px]">
      <g transform="translate(100, 50)">
        {/* Param Grid */}
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1="0" y1={i*50} x2="300" y2={i*50} stroke="#475569" strokeOpacity="0.1" />
        ))}
        {/* Kinetic Optimization Ribbon */}
        <motion.path 
          d="M 0 150 Q 50 100 100 130 T 200 80 T 300 110"
          fill="none"
          stroke="#a855f7"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />
        {/* Resonance Zones (3D Pillars) */}
        {[80, 220].map(x => (
          <g key={x} transform={`translate(${x}, 150)`}>
            <rect x="-10" y="-100" width="20" height="100" fill="#f43f5e" fillOpacity="0.1" stroke="#f43f5e" strokeOpacity="0.2" />
            <motion.path 
              d="M -10 -100 L 0 -110 L 10 -100 L 0 -90 Z" 
              fill="#f43f5e"
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </g>
        ))}
        {/* Optimal Path Trace */}
        <motion.circle 
          r="6" fill="#a855f7"
          animate={{ cx: [0, 100, 200, 300], cy: [150, 130, 80, 110] }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
        />
      </g>
      <text x="250" y="270" fill="#a855f7" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Neural Parameter Optimization Stream</text>
    </svg>
  );
}

function Geosteering3D() {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[500px]">
      <g transform="perspective(600) rotateX(20)">
        {/* Stratigraphy Layers */}
        {[0, 1, 2].map(i => (
          <motion.path 
            key={i}
            d={`M 0 ${50 + i*60} L 500 ${100 + i*60} L 500 ${160 + i*60} L 0 ${110 + i*60} Z`}
            fill={['#1e293b', '#0f172a', '#1e293b'][i]}
            stroke="#a855f7"
            strokeOpacity="0.1"
            animate={{ skewY: [0, 2, 0] }}
            transition={{ repeat: Infinity, duration: 10, delay: i }}
          />
        ))}
        {/* Target Reservoir Zone */}
        <motion.path 
          d="M 0 110 L 500 160 L 500 200 L 0 150 Z"
          fill="#a855f7"
          fillOpacity="0.1"
          stroke="#a855f7"
          strokeWidth="2"
        />
        {/* Horizontal Well Trajectory */}
        <motion.path 
          d="M 0 80 Q 150 100 250 140 T 500 165"
          fill="none"
          stroke="#a855f7"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3 }}
        />
        {/* Bit Marker */}
        <motion.circle 
          cx="500" cy="165" r="8" fill="#a855f7"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </g>
      <text x="250" y="280" fill="#a855f7" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">3D Neural Geosteering Trajectory</text>
    </svg>
  );
}

function StabilityPrediction3D() {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[500px]">
      <g transform="translate(100, 50)">
        {/* 3D Wellbore Cylinder */}
        <rect x="120" y="0" width="60" height="200" fill="#0f172a" stroke="#475569" strokeOpacity="0.2" rx="30" />
        {/* Pressure Envelopes */}
        <motion.path 
          d="M 50 0 Q 80 100 60 200" fill="none" stroke="#f43f5e" strokeWidth="3" opacity="0.4"
          animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 4 }}
        />
        <motion.path 
          d="M 250 0 Q 220 100 240 200" fill="none" stroke="#06b6d4" strokeWidth="3" opacity="0.4"
          animate={{ x: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }}
        />
        {/* Mud Weight Line (Active) */}
        <motion.path 
          d="M 150 0 Q 170 100 155 200" fill="none" stroke="#a855f7" strokeWidth="5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
        />
        {/* Risk Hotspots */}
        <motion.circle 
          cx="160" cy="120" r="10" fill="#f43f5e" fillOpacity="0.3"
          animate={{ scale: [1, 2, 1], opacity: [0.1, 0.5, 0.1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <text x="50" y="-10" fill="#f43f5e" fontSize="8" className="font-bold">PORE</text>
        <text x="230" y="-10" fill="#06b6d4" fontSize="8" className="font-bold">FRAC</text>
      </g>
      <text x="250" y="270" fill="#a855f7" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Wellbore Stability Envelope Projection</text>
    </svg>
  );
}

function WellPlanning3D({ activeView }: { activeView: string }) {
  return (
    <svg viewBox="0 0 500 300" className="w-full h-full max-w-[500px]">
      <g transform="translate(100, 50)">
        {activeView === 'traj' ? (
          <g>
            {/* Multiple Path Iterations (Monte Carlo) */}
            {[0, 1, 2, 3, 4].map(i => (
              <motion.path 
                key={i}
                d={`M 0 0 Q ${100 + i*10} ${50 + i*10} ${200 + i*10} ${150 + i*10} T 350 200`}
                fill="none"
                stroke={i === 2 ? "#a855f7" : "#475569"}
                strokeWidth={i === 2 ? 4 : 1}
                strokeOpacity={i === 2 ? 1 : 0.2}
                animate={i === 2 ? { strokeWidth: [4, 6, 4] } : {}}
                transition={{ repeat: Infinity, duration: 3 }}
              />
            ))}
          </g>
        ) : (
          <g transform="perspective(500) rotateX(45)">
            {/* AFE Cost Stacks */}
            {[0, 1, 2, 3, 4].map(i => (
              <motion.rect 
                key={i}
                x={50 + i*50} y={150 - (i+1)*30} width="30" height={(i+1)*30}
                fill="#a855f7" fillOpacity={0.2 + i*0.1} stroke="#a855f7"
                animate={{ height: [(i+1)*30, (i+1)*30 + 20, (i+1)*30] }}
                transition={{ repeat: Infinity, duration: 4, delay: i * 0.2 }}
              />
            ))}
          </g>
        )}
      </g>
      <text x="250" y="270" fill="#a855f7" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">
        {activeView === 'traj' ? 'Monte Carlo Trajectory Space' : 'Probabilistic AFE Cost Stacks'}
      </text>
    </svg>
  );
}

// ─── Visual Figure: Neural Data Stream ──────────────────────────────────────

function NeuralDataStream({ color = '#a855f7' }: { color?: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
         <div className="w-full h-full border border-dashed border-white/20 rounded-full animate-spin-slow" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-4">
         <div className="relative">
            <div className="absolute inset-0 blur-xl opacity-50" style={{ backgroundColor: color }} />
            <BrainCircuit size={64} style={{ color }} className="relative z-10" />
         </div>
         <div className="flex gap-1">
            {Array.from({length: 5}).map((_, i) => (
              <motion.div 
                key={i}
                animate={{ height: [4, 12, 4], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                className="w-1 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
         </div>
      </div>
    </div>
  );
}

// ─── Visual Figure: Metric Card ──────────────────────────────────────────────

function MetricCard({ title, value, unit, color, status }: any) {
  return (
    <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 flex justify-between items-center group hover:border-purple-500/20 transition-all">
       <div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
             <h4 className={cn("text-3xl font-black italic tracking-tighter", color)}>{value}</h4>
             <span className="text-[10px] text-slate-600 font-bold uppercase">{unit}</span>
          </div>
       </div>
       <div className="text-right">
          <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", color.replace('text-', 'border-').replace('400', '500/20').replace('500', '500/20'))}>
             {status}
          </span>
       </div>
    </div>
  );
}

function ControlMetric({ label, value, target, progress }: any) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between text-[10px] font-black uppercase">
          <span className="text-slate-500">{label}</span>
          <span className="text-white">{value} <span className="text-slate-600">/ {target}</span></span>
       </div>
       <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
       </div>
    </div>
  );
}

// ─── Shared Components ──────────────────────────────────────────────────────

function DetailCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass-card p-6 rounded-3xl border-purple-500/10 bg-purple-500/5 hover:border-purple-500/30 transition-all">
      <h5 className="text-[11px] font-black uppercase tracking-widest text-purple-500 mb-4">{title}</h5>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <div className="mt-1.5 w-1 h-1 rounded-full bg-purple-500 shrink-0" />
            <span className="text-[11px] text-slate-300 leading-relaxed font-medium">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
