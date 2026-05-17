import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Database, 
  Brain, 
  Eye, 
  MessageSquare, 
  Layers, 
  Zap, 
  BarChart3,
  LayoutDashboard,
  FastForward,
  Settings,
  Microscope,
  Network,
  Cloud,
  Terminal,
  Activity,
  Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { InputWithSlider } from '../SharedUI';

type DigitalTab = 
  | 'ph1' | 'ph2' | 'ph3' | 'ph4' | 'ph5' | 'ph6' | 'ph7';

export default function DigitalAdvStage() {
  const [activeTab, setActiveTab] = useState<DigitalTab>('ph1');
  const tabs = [
    { id: 'ph1' as DigitalTab, label: 'Ph.1: Data Infra', icon: Database },
    { id: 'ph2' as DigitalTab, label: 'Ph.2: ML Apps', icon: Brain },
    { id: 'ph3' as DigitalTab, label: 'Ph.3: Computer Vision', icon: Eye },
    { id: 'ph4' as DigitalTab, label: 'Ph.4: NLP', icon: MessageSquare },
    { id: 'ph5' as DigitalTab, label: 'Ph.5: Digital Twins', icon: Layers },
    { id: 'ph6' as DigitalTab, label: 'Ph.6: Control', icon: Settings },
    { id: 'ph7' as DigitalTab, label: 'Ph.7: Analytics', icon: BarChart3 },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/20">
        <Cpu className="text-violet-500" size={20} />
        <span className="text-white font-black italic text-lg tracking-tight mr-6 uppercase">Digital Oilfield & AI Engineering</span>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === t.id
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'ph1' && <Phase1DataInfra />}
            {activeTab === 'ph2' && <Phase2ML />}
            {activeTab === 'ph3' && <Phase3Vision />}
            {activeTab === 'ph4' && <Phase4NLP />}
            {activeTab === 'ph5' && <Phase5DigitalTwins />}
            {activeTab === 'ph6' && <Phase6Control />}
            {activeTab === 'ph7' && <Phase7Analytics />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Phase Components ────────────────────────────────────────────────────────

function Phase1DataInfra() {
  const [load, setLoad] = useState(65);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Database className="text-violet-500" size={36} />
             Phase 1: Data <span className="text-violet-500/50">Infrastructure</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">SCADA · IoT · OSDU · Cloud · Data Lakes</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-violet-500 italic">4.2 TB</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Daily Ingestion Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <DataIngestion3D load={load} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Data Stream Simulator</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Real-time SCADA & IoT Packet Flow</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 space-y-8">
               <h4 className="text-[10px] font-black text-violet-500 uppercase tracking-widest italic">Ingestion Control</h4>
               <InputWithSlider label="Network Load" value={load} min={10} max={100} step={1} unit="%" onChange={setLoad} />
            </div>
            <div className="glass-card p-8 rounded-3xl bg-violet-500/5 border-white/5 flex-1 flex flex-col justify-center">
               <h4 className="text-xs font-black text-white uppercase italic mb-6">Storage Distribution</h4>
               <div className="space-y-4">
                  {[
                    { label: 'Cloud Lake', val: 74, color: 'bg-violet-500' },
                    { label: 'OSDU Core', val: 18, color: 'bg-cyan-500' },
                    { label: 'Edge Cache', val: 8, color: 'bg-slate-700' },
                  ].map(s => (
                    <div key={s.label}>
                       <div className="flex justify-between text-[10px] font-black uppercase mb-1 italic">
                          <span className="text-white">{s.label}</span>
                          <span className="text-slate-500">{s.val}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${s.val}%` }} className={cn("h-full", s.color)} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase2ML() {
  const [neurons, setNeurons] = useState(12);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Brain className="text-violet-500" size={36} />
             Phase 2: Machine <span className="text-violet-500/50">Learning Apps</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Forecasting · DCA · Log Prediction · Fault ID</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-emerald-400 italic">94.2%</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Avg. Prediction Accuracy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <NeuralModel3D neurons={neurons} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Neural Network Architecture</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Layered Inference & Stochastic Gradient Sync</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 space-y-8">
               <h4 className="text-[10px] font-black text-violet-500 uppercase tracking-widest italic">Model Complexity</h4>
               <InputWithSlider label="Active Neurons" value={neurons} min={4} max={32} step={1} unit="" onChange={setNeurons} />
            </div>
            <div className="glass-card p-8 rounded-3xl bg-violet-500/5 border-violet-500/10 flex-1 flex flex-col justify-center text-center">
               <Network size={48} className="text-violet-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Active Models</h4>
               <p className="text-5xl font-black text-white italic tracking-tighter mb-4">24</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase">In Production (Global)</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase3Vision() {
  const [resolution, setResolution] = useState(80);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Eye className="text-violet-500" size={36} />
             Phase 3: Computer <span className="text-violet-500/50">Vision</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Neural Monitoring · Safety · Leak Detection</p>
        </div>
        <div className="flex items-center gap-4 px-6 py-2 bg-violet-500/10 border border-violet-500/20 rounded-2xl">
           <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-white uppercase tracking-widest">Neural Sync Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <ComputerVision3D resolution={resolution} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Neural Sight Engine</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Live Object Recognition & Hazard Detection</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 space-y-8">
               <h4 className="text-[10px] font-black text-violet-500 uppercase tracking-widest italic">Vision Parameters</h4>
               <InputWithSlider label="Grid Resolution" value={resolution} min={20} max={200} step={10} unit="px" onChange={setResolution} />
            </div>
            <div className="space-y-4">
              {[
                { label: 'Rig PPE Compliance', val: 98, color: '#10b981' },
                { label: 'Leak Detection', val: 92, color: '#8b5cf6' },
                { label: 'Equipment Health', val: 84, color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} className="glass-card p-6 rounded-2xl bg-white/5 border-white/5">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-white uppercase italic">{s.label}</span>
                      <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.val}%</span>
                   </div>
                   <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${s.val}%` }} className="h-full" style={{ backgroundColor: s.color }} />
                   </div>
                </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase4NLP() {
  const [isAgentActive, setIsAgentActive] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <MessageSquare className="text-violet-500" size={36} />
             Phase 4: Natural Language <span className="text-violet-500/50">Processing</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Entity Extraction · Report Gen · LLM Interface</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-violet-500 italic">8.4M</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Docs Indexed (Legacy)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <SemanticSpace3D isActive={isAgentActive} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Knowledge Graph Simulator</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Multidimensional Entity Relationship Mapping</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-violet-500/5 border-violet-500/10 flex-1 flex flex-col justify-center">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-violet-500/20 rounded-2xl flex items-center justify-center text-violet-500"><Brain size={24} /></div>
                  <h4 className="text-xs font-black text-white uppercase italic">AI Assistant Context</h4>
               </div>
               <p className="text-[12px] text-slate-300 italic leading-relaxed mb-6">
                  "System correctly extracted 1,242 porosity data points from unstructured PDF reports (1978-1985). Cross-referenced with OSDU database for validation."
               </p>
               <button 
                 onClick={() => setIsAgentActive(!isAgentActive)}
                 className={cn(
                   "w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg",
                   isAgentActive 
                    ? "bg-emerald-600 text-white shadow-emerald-500/20" 
                    : "bg-violet-600 text-white shadow-violet-500/20 hover:bg-violet-500"
                 )}
               >
                 {isAgentActive ? "Agent Session Active" : "Launch AI Agent"}
               </button>
               {isAgentActive && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="mt-4 p-4 bg-black/40 rounded-xl border border-emerald-500/20"
                 >
                    <p className="text-[10px] text-emerald-400 font-black uppercase italic animate-pulse">Neural Handshake Complete...</p>
                    <p className="text-[11px] text-slate-500 mt-1 uppercase leading-relaxed">Agent is monitoring document stream and preparing semantic summary.</p>
                 </motion.div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase5DigitalTwins() {
  const [fidelity, setFidelity] = useState(95);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Layers className="text-violet-500" size={36} />
             Phase 5: Digital <span className="text-violet-500/50">Twins</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Real-time Models · What-if Scenarios · Nodal Analysis</p>
        </div>
        <div className="px-6 py-2 bg-violet-500/10 border border-violet-500/20 rounded-2xl">
           <span className="text-[10px] font-black text-white uppercase tracking-widest">Model Fidelity: {fidelity}.4%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <DigitalTwinSim3D fidelity={fidelity} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Asset Synchronizer</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Deterministic Physics & Real-time Mirroring</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 space-y-8">
               <h4 className="text-[10px] font-black text-violet-500 uppercase tracking-widest italic">Twin Controls</h4>
               <InputWithSlider label="Sync Fidelity" value={fidelity} min={50} max={100} step={1} unit="%" onChange={setFidelity} />
            </div>
            <div className="glass-card p-8 rounded-3xl bg-violet-500/5 border-violet-500/10 flex-1 flex flex-col justify-center text-center">
               <Settings size={32} className="text-violet-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Simulation Engine</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">RUNNING</p>
               <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Convergence: 0.0001</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase6Control() {
  const [autonomy, setAutonomy] = useState(82);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Settings className="text-violet-500" size={36} />
             Phase 6: Optimization <span className="text-violet-500/50">& Control</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Closed-Loop · Autonomous Systems · Reinforcement Learning</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-violet-500 italic">{autonomy}.4%</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Autonomous Control Depth</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <AutonomousControl3D autonomy={autonomy} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">Closed-Loop Autonomy Simulator</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Reinforcement Learning Set-Point Optimization</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 space-y-8">
               <h4 className="text-[10px] font-black text-violet-500 uppercase tracking-widest italic">System Depth</h4>
               <InputWithSlider label="Autonomy Level" value={autonomy} min={10} max={100} step={1} unit="%" onChange={setAutonomy} />
            </div>
            <div className="glass-card p-8 rounded-3xl bg-violet-500/5 border-violet-500/10 flex-1 flex flex-col justify-center text-center">
               <Zap size={32} className="text-violet-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Control Protocol</h4>
               <p className="text-2xl font-black text-white italic tracking-tighter mb-4">RL-ADAPTIVE</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase italic leading-relaxed">
                  "Reinforcement Learning agent is active for pattern-based optimization in the Gulf Cluster."
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function Phase7Analytics() {
  const [growth, setGrowth] = useState(88);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <BarChart3 className="text-violet-500" size={36} />
             Phase 7: Analytics <span className="text-violet-500/50">& Visualization</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">ROI Tracking · Executive Dashboards · AR/VR</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-emerald-400 italic">$12.4M</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Total Digital Value Realized</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[450px] flex items-center justify-center relative overflow-hidden">
               <AnalyticsEngine3D growth={growth} />
               <div className="absolute top-8 left-10">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">ROI Intelligence Engine</h4>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1 italic">Global Multi-Asset Value Realization Simulator</p>
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 space-y-6">
            <div className="glass-card p-8 rounded-3xl bg-black/40 border-white/5 space-y-8">
               <h4 className="text-[10px] font-black text-violet-500 uppercase tracking-widest italic">Adoption Metrics</h4>
               <InputWithSlider label="Global Adoption" value={growth} min={0} max={100} step={1} unit="%" onChange={setGrowth} />
            </div>
            <div className="glass-card p-8 rounded-3xl bg-emerald-500/5 border-emerald-500/10 flex-1 flex flex-col justify-center text-center">
               <LayoutDashboard size={48} className="text-emerald-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Value Captured</h4>
               <p className="text-5xl font-black text-emerald-400 italic tracking-tighter mb-4">{growth}%</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase">Business Unit Integration</p>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── 3D Kinetic Simulators ─────────────────────────────────────────────────

function DataIngestion3D({ load }: { load: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(250, 200)">
          {/* Central Cloud / Data Lake */}
          <motion.g animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 4 }}>
             <path d="M -40 0 Q -60 -40, 0 -40 T 40 0 T 0 40 T -40 0" fill="#8b5cf6" fillOpacity="0.2" stroke="#8b5cf6" strokeWidth="2" />
             <Cloud className="text-violet-500 absolute translate-x-[-12px] translate-y-[-12px]" size={24} />
          </motion.g>

          {/* Data Packets */}
          {[...Array(Math.floor(load/5))].map((_, i) => {
             const angle = (i / (load/5)) * Math.PI * 2;
             return (
                <motion.g key={i}>
                   <motion.circle 
                      r="3" fill={i % 2 === 0 ? "#8b5cf6" : "#06b6d4"}
                      initial={{ cx: Math.cos(angle) * 200, cy: Math.sin(angle) * 200 }}
                      animate={{ 
                         cx: [Math.cos(angle) * 200, 0],
                         cy: [Math.sin(angle) * 200, 0],
                         opacity: [0, 1, 0]
                      }}
                      transition={{ 
                         repeat: Infinity, 
                         duration: 2 + Math.random() * 2,
                         delay: i * 0.1
                      }}
                   />
                </motion.g>
             );
          })}

          {/* Connection Lines */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
             <line 
                key={deg} x1="0" y1="0" 
                x2={Math.cos(deg * Math.PI/180) * 180} 
                y2={Math.sin(deg * Math.PI/180) * 180} 
                stroke="#ffffff05" strokeWidth="1" 
             />
          ))}
       </g>
       <text x="250" y="380" fill="#8b5cf6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Multimodal High-Velocity Ingestion Architecture</text>
    </svg>
  );
}

function NeuralModel3D({ neurons }: { neurons: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(100, 100)">
          {/* Input Layer */}
          {[...Array(4)].map((_, i) => (
             <circle key={`in-${i}`} cx="0" cy={i * 60} r="6" fill="#1e293b" stroke="#8b5cf6" strokeWidth="1" />
          ))}

          {/* Hidden Layer */}
          {[...Array(Math.min(neurons, 8))].map((_, i) => (
             <motion.circle 
                key={`h1-${i}`} cx="150" cy={i * 30 + 15} r="4" 
                fill="#8b5cf6"
                animate={{ fillOpacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
             />
          ))}

          {/* Output Layer */}
          {[...Array(2)].map((_, i) => (
             <circle key={`out-${i}`} cx="300" cy={i * 120 + 30} r="8" fill="#10b981" />
          ))}

          {/* Synapses */}
          {[...Array(4)].map((_, i) => (
             [...Array(Math.min(neurons, 8))].map((_, j) => (
                <motion.line 
                   key={`syn-${i}-${j}`}
                   x1="0" y1={i * 60} x2="150" y2={j * 30 + 15}
                   stroke="#8b5cf6" strokeWidth="0.5" strokeOpacity="0.1"
                   animate={{ strokeOpacity: [0.05, 0.2, 0.05] }}
                   transition={{ repeat: Infinity, duration: 3, delay: (i+j)*0.1 }}
                />
             ))
          ))}
       </g>
       <text x="250" y="380" fill="#8b5cf6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Deep Reservoir Neural Network Inference</text>
    </svg>
  );
}

function ComputerVision3D({ resolution }: { resolution: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(250, 200)">
          {/* Grid Overlay */}
          <rect x="-150" y="-100" width="300" height="200" fill="none" stroke="#8b5cf620" strokeWidth="1" />
          {[...Array(10)].map((_, i) => (
             <React.Fragment key={i}>
                <line x1="-150" y1={-100 + i*20} x2="150" y2={-100 + i*20} stroke="#8b5cf610" strokeWidth="0.5" />
                <line x1={-150 + i*30} y1="-100" x2={-150 + i*30} y2="100" stroke="#8b5cf610" strokeWidth="0.5" />
             </React.Fragment>
          ))}

          {/* Detection Boxes */}
          <motion.rect 
            x="-40" y="-30" width="80" height="60" rx="4"
            fill="none" stroke="#10b981" strokeWidth="2"
            animate={{ 
               scale: [1, 1.05, 1],
               strokeOpacity: [0.5, 1, 0.5]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <motion.path d="M -40 -30 L -30 -30 M -40 -30 L -40 -20" stroke="#10b981" strokeWidth="4" />
          
          {/* Scanning Beam */}
          <motion.line 
            x1="-150" y1="-100" x2="150" y2="-100" stroke="#8b5cf6" strokeWidth="2"
            animate={{ y: [-100, 100, -100] }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          />

          {/* Identified Points */}
          {[...Array(20)].map((_, i) => (
             <motion.circle 
                key={i} r="2" fill="#8b5cf6"
                initial={{ cx: Math.random()*300 - 150, cy: Math.random()*200 - 100 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1, delay: Math.random()*2 }}
             />
          ))}
       </g>
       <text x="250" y="380" fill="#8b5cf6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Neural Feature Extraction & Spatial Mapping</text>
    </svg>
  );
}

function SemanticSpace3D({ isActive }: { isActive?: boolean }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(250, 200)">
          {/* Floating Words / Entities */}
          {[...Array(isActive ? 30 : 15)].map((_, i) => {
             const angle = (i / (isActive ? 30 : 15)) * Math.PI * 2;
             const r = 60 + Math.random() * 80;
             return (
                <motion.g key={i} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: (20 + i) / (isActive ? 2 : 1), ease: "linear" }}>
                   <circle cx={r} cy="0" r={isActive ? 3 : 2} fill="#8b5cf6" fillOpacity={isActive ? 0.8 : 0.4} />
                   <motion.line 
                     x1="0" y1="0" x2={r} y2="0" stroke="#8b5cf6" strokeWidth="0.5" strokeOpacity={isActive ? 0.2 : 0.1} 
                   />
                </motion.g>
             );
          })}
          
          {/* Central Processor */}
          <motion.circle 
            r={isActive ? 35 : 30} 
            fill="#1e293b" 
            stroke="#8b5cf6" 
            strokeWidth="2" 
            animate={{ 
               scale: isActive ? [1, 1.2, 1] : [1, 1.1, 1],
               boxShadow: isActive ? ["0 0 0px #8b5cf6", "0 0 20px #8b5cf6", "0 0 0px #8b5cf6"] : []
            }} 
            transition={{ repeat: Infinity, duration: isActive ? 1.5 : 3 }} 
          />
          <MessageSquare className={cn("text-violet-500 absolute translate-x-[-10px] translate-y-[-10px]", isActive && "animate-pulse")} size={20} />
       </g>
       <text x="250" y="380" fill="#8b5cf6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">NLP Entity Vectorization & Semantic Latent Space</text>
    </svg>
  );
}

function DigitalTwinSim3D({ fidelity }: { fidelity: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(250, 200)">
          {/* Physical Asset (Static) */}
          <path d="M -80 40 L 0 -40 L 80 40 Z" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4,4" />
          
          {/* Digital Twin (Dynamic) */}
          <motion.path 
             d="M -80 40 L 0 -40 L 80 40 Z" 
             fill="#8b5cf6" fillOpacity={fidelity/200}
             stroke="#8b5cf6" strokeWidth={2}
             animate={{ 
                scale: [1, 1.02, 1],
                opacity: [0.5, 1, 0.5]
             }}
             transition={{ repeat: Infinity, duration: 2 }}
          />

          {/* Sync Pulses */}
          {[...Array(5)].map((_, i) => (
             <motion.circle 
                key={i} r="2" fill="#06b6d4"
                initial={{ cx: 0, cy: -40 }}
                animate={{ 
                   cy: [-40, 40],
                   opacity: [0, 1, 0]
                }}
                transition={{ repeat: Infinity, duration: 1.5, delay: i*0.3 }}
             />
          ))}

          {/* Fidelity Rings */}
          <circle r={fidelity} fill="none" stroke="#8b5cf610" strokeWidth="1" />
       </g>
       <text x="250" y="380" fill="#8b5cf6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">High-Fidelity Deterministic Physical Mirroring</text>
    </svg>
  );
}

function AutonomousControl3D({ autonomy }: { autonomy: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(250, 200)">
          {/* Control Loop Circle */}
          <circle r="120" fill="none" stroke="#ffffff05" strokeWidth="10" />
          <motion.circle 
             r="120" fill="none" stroke="#8b5cf6" strokeWidth="10"
             strokeDasharray="753" strokeDashoffset={753 - (autonomy/100 * 753)}
             transform="rotate(-90)"
          />

          {/* Autonomous Nodes */}
          {[0, 90, 180, 270].map(deg => (
             <g key={deg} transform={`rotate(${deg}) translate(120, 0)`}>
                <circle r="12" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" />
                <Settings size={14} className="text-violet-500 absolute translate-x-[-7px] translate-y-[-7px]" />
             </g>
          ))}

          {/* Central AI Processor */}
          <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }}>
             <path d="M -30 -30 L 30 -30 L 30 30 L -30 30 Z" fill="#8b5cf620" stroke="#8b5cf6" strokeWidth="2" />
             <Zap size={24} className="text-violet-500 absolute translate-x-[-12px] translate-y-[-12px]" />
          </motion.g>
       </g>
       <text x="250" y="380" fill="#8b5cf6" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">Closed-Loop Autonomous System Optimization</text>
    </svg>
  );
}

function AnalyticsEngine3D({ growth }: { growth: number }) {
  return (
    <svg viewBox="0 0 500 400" className="w-full h-full max-w-[600px]">
       <g transform="translate(250, 200)">
          {/* Data Bars in 3D-ish perspective */}
          {[...Array(6)].map((_, i) => {
             const h = 40 + Math.random() * 100 * (growth/100);
             return (
                <motion.g key={i} transform={`translate(${-150 + i*60}, 50)`}>
                   <motion.rect 
                      width="40" height={h} y={-h} 
                      fill="#10b981" fillOpacity={0.2 + (i/6)*0.4}
                      initial={{ height: 0, y: 0 }}
                      animate={{ height: h, y: -h }}
                   />
                   <rect width="40" height="10" fill="#065f46" />
                </motion.g>
             );
          })}

          {/* Trending Line */}
          <motion.path 
            d={(() => {
               let path = "";
               for (let i = 0; i < 6; i++) {
                  const x = -130 + i*60;
                  const y = 50 - (40 + Math.random() * 100 * (growth/100));
                  path += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
               }
               return path;
            })()}
            fill="none" stroke="#10b981" strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2 }}
          />
       </g>
       <text x="250" y="380" fill="#10b981" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-40">ROI Realization & Global Adoption Velocity</text>
    </svg>
  );
}
