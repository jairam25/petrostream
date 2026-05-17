import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Activity, 
  Search, 
  Target, 
  Layers, 
  Globe, 
  Zap, 
  Waves,
  Cpu,
  Database,
  Box,
  Magnet
} from 'lucide-react';
import { cn } from '../../lib/utils';

type GeophysicsTab = 
  | 'ph1' | 'ph2' | 'ph3' | 'ph4' | 'ph5' | 'ph6' | 'ph7' | 'ph8';

export default function GeophysicsAdvStage() {
  const [activeTab, setActiveTab] = useState<GeophysicsTab>('ph1');
  const tabs = [
    { id: 'ph1' as GeophysicsTab, label: 'Ph.1: Acquisition', icon: Radio },
    { id: 'ph2' as GeophysicsTab, label: 'Ph.2: Processing', icon: Cpu },
    { id: 'ph3' as GeophysicsTab, label: 'Ph.3: Interpretation', icon: Search },
    { id: 'ph4' as GeophysicsTab, label: 'Ph.4: Quantitative', icon: Target },
    { id: 'ph5' as GeophysicsTab, label: 'Ph.5: 4D Seismic', icon: Waves },
    { id: 'ph6' as GeophysicsTab, label: 'Ph.6: Microseismic', icon: Activity },
    { id: 'ph7' as GeophysicsTab, label: 'Ph.7: Grav & Mag', icon: Magnet },
    { id: 'ph8' as GeophysicsTab, label: 'Ph.8: EM Methods', icon: Zap },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/20">
        <Radio className="text-purple-500" size={20} />
        <span className="text-white font-black italic text-lg tracking-tight mr-6 uppercase">Advanced Geophysics & Seismic</span>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === t.id
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
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
            {activeTab === 'ph1' && <Phase1Acquisition />}
            {activeTab === 'ph2' && <Phase2Processing />}
            {activeTab === 'ph3' && <Phase3Interpretation />}
            {activeTab === 'ph4' && <Phase4Quantitative />}
            {activeTab === 'ph5' && <Phase5TimeLapse />}
            {activeTab === 'ph6' && <Phase6Microseismic />}
            {activeTab === 'ph7' && <Phase7GravityMag />}
            {activeTab === 'ph8' && <Phase8EMMethods />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Phase Components ────────────────────────────────────────────────────────

function Phase1Acquisition() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Radio className="text-purple-500" size={32} />
          Phase 1: Seismic <span className="text-purple-500/50">Acquisition</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">2D/3D/4D · Vibroseis · Air Gun · OBN</p>
      </div>

      <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] flex items-center justify-center relative overflow-hidden">
        <SeismicVessel3D />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DetailCard title="Survey Design" items={["2D vs 3D vs 4D (Time-lapse)", "OBN (Ocean Bottom Nodes)", "Survey Geometry (Fold, Bin Size)", "Offset Range & Azimuth design"]} />
        <DetailCard title="Source Systems" items={["Onshore: Vibroseis (Vibration)", "Offshore: Air Gun Arrays", "Frequency Bandwidth Control", "Signature Debubbling"]} />
        <DetailCard title="Receiver Systems" items={["Onshore: Geophones (Velocity)", "Offshore: Hydrophones / Streamers", "MEMS Digital Accelerometers", "DAS (Distributed Acoustic Sensing)"]} />
      </div>
    </div>
  );
}

function Phase2Processing() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Cpu className="text-purple-500" size={32} />
          Phase 2: Seismic <span className="text-purple-500/50">Processing</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">NMO · Migration · Kirchhoff · PSDM</p>
      </div>

      <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] flex items-center justify-center relative overflow-hidden">
        <WaveformInversion3D />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DetailCard title="Signal Enhancement" items={["Field Static Corrections", "NMO (Normal Moveout) Correction", "Deconvolution & Multiple Attenuation", "Stacking & Noise Filtering"]} />
        <DetailCard title="Imaging/Migration" items={["Kirchhoff Time/Depth Migration", "RTM (Reverse Time Migration)", "PSDM (Pre-stack Depth Migration)", "Velocity Model Building (Tomography)"]} />
        <DetailCard title="Advanced Workflows" items={["Full Waveform Inversion (FWI)", "AVO-preserving processing", "SRME (Surface-related multiples)", "Semblance & Interval Velocity"]} />
      </div>
    </div>
  );
}

function Phase3Interpretation() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Search className="text-purple-500" size={32} />
          Phase 3: Seismic <span className="text-purple-500/50">Interpretation</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Horizon Picking · Structural Mapping · DHIs</p>
      </div>

      <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] flex items-center justify-center relative overflow-hidden">
        <HorizonMapper3D />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DetailCard title="Structural Mapping" items={["Horizon Picking & Correlating", "Fault Interpretation & Linking", "Time-to-Depth Conversion", "Isochron & Isopach Mapping"]} />
        <DetailCard title="Seismic Stratigraphy" items={["Sequence Stratigraphy Analysis", "Onlap, Downlap & Truncation", "Seismic Facies Mapping", "Geomorphology Interpretation"]} />
        <DetailCard title="DHIs & Indicators" items={["Bright Spots & Dim Spots", "Flat Spots (Fluid Contacts)", "Polarity Reversals", "Gas Chimney Recognition"]} />
      </div>
    </div>
  );
}

function Phase4Quantitative() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Target className="text-purple-500" size={32} />
          Phase 4: Quantitative <span className="text-purple-500/50">Interpretation</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">AVO · Inversion · Rock Physics · Reservoir Char</p>
      </div>

      <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] flex items-center justify-center relative overflow-hidden">
        <QuantitativeModel3D />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DetailCard title="AVO Analysis" items={["Intercept & Gradient Analysis", "AVO Classes I, II, III, IV", "Fluid Substitution (Gassmann)", "Elastic Impedance (EI)"]} />
        <DetailCard title="Seismic Inversion" items={["Acoustic Impedance (AI) Inversion", "Simultaneous Elastic Inversion", "Stochastic & Deterministic Inversion", "Colored Inversion for thin beds"]} />
        <DetailCard title="Rock Physics" items={["Hashin-Shtrikman Bounds", "Vp/Vs Ratio vs Lithology", "Fluid Effect Sensitivity", "Reservoir Parameter Mapping"]} />
      </div>
    </div>
  );
}

function Phase5TimeLapse() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Waves className="text-purple-500" size={32} />
          Phase 5: 4D / <span className="text-purple-500/50">Time-Lapse Seismic</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Fluid Monitoring · NRMS · CO2 Tracking</p>
      </div>

      <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] flex items-center justify-center relative overflow-hidden">
        <FluidMonitoring4D />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DetailCard title="Monitoring" items={["Fluid Movement (Water/Steam/Gas)", "Pressure & Compaction Effects", "Waterflood Sweep Efficiency", "CO2 Plume/Plume Tracking"]} />
        <DetailCard title="Quality Metrics" items={["Repeatability Analysis (NRMS)", "Cross-Equalization Workflows", "Time-Shift Analysis (Warps)", "Predictability (PRED) Metrics"]} />
        <DetailCard title="Interpretation" items={["4D Difference Sections", "Saturation/Pressure decoupling", "Dynamic Reservoir Modeling link", "In-fill Well Target Identification"]} />
      </div>
    </div>
  );
}

function Phase6Microseismic() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Activity className="text-purple-500" size={32} />
          Phase 6: <span className="text-purple-500/50">Microseismic Monitoring</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Hydraulic Fracturing · Source Location · DAS</p>
      </div>

      <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] flex items-center justify-center relative overflow-hidden">
        <MicroseismicEvent3D />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DetailCard title="Frac Monitoring" items={["Hydraulic Fracture Geometry", "Stimulated Reservoir Volume (SRV)", "Event Mapping in Real-time", "Surface vs Downhole arrays"]} />
        <DetailCard title="Event Physics" items={["Source Location (P & S Arrivals)", "Moment Tensor Analysis", "Magnitude & Energy Scaling", "Focal Mechanism Diagnosis"]} />
        <DetailCard title="Advanced Sensing" items={["DAS (Fiber Optic) Microseismic", "Reservoir Compaction Monitoring", "Fault Activation Monitoring", "Ambient Noise Tomography"]} />
      </div>
    </div>
  );
}

function Phase7GravityMag() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Magnet className="text-purple-500" size={32} />
          Phase 7: Gravity <span className="text-purple-500/50">& Magnetics</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">Salt Delineation · Basement Mapping · Gradiometry</p>
      </div>

      <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] flex items-center justify-center relative overflow-hidden">
        <PotentialFields3D />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DetailCard title="Gravity Surveys" items={["Basin Mapping & Salt Delineation", "Density Contrast Modeling", "Bouguer & Free-Air Corrections", "Full Tensor Gradiometry (FTG)"]} />
        <DetailCard title="Magnetic Surveys" items={["Basement Mapping & Igneous Detection", "Magnetic Susceptibility Analysis", "Reduction to Pole (RTP)", "Analytic Signal Analysis"]} />
        <DetailCard title="Applications" items={["Sub-salt Exploration support", "Structural Grain Delineation", "Satellite Gravity integration", "Microgravity for monitoring"]} />
      </div>
    </div>
  );
}

function Phase8EMMethods() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
          <Zap className="text-purple-500" size={32} />
          Phase 8: Electromagnetic <span className="text-purple-500/50">Methods</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium uppercase tracking-widest">CSEM · Magnetotellurics · Reservoir Monitoring</p>
      </div>

      <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px] flex items-center justify-center relative overflow-hidden">
        <EMFieldSimulator3D />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DetailCard title="Offshore EM" items={["CSEM (Controlled Source EM)", "Resistivity Contrast Detection", "Hydrocarbon vs Brine separation", "De-risking Exploration prospects"]} />
        <DetailCard title="Onshore EM" items={["Magnetotellurics (MT)", "Deep Structural Mapping", "Transient EM (TEM)", "Induced Polarization (IP)"]} />
        <DetailCard title="Borehole EM" items={["Crosswell EM Monitoring", "Fluid Front Mapping", "EOR Monitoring applications", "LWD Electromagnetic tools"]} />
      </div>
    </div>
  );
}

// ─── Shared Components ──────────────────────────────────────────────────────

function DetailCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass-card p-6 rounded-3xl border-white/5 bg-purple-500/5 hover:border-purple-500/30 transition-all">
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

// ─── 3D Visualizer Components ──────────────────────────────────────────────

function SeismicVessel3D() {
  return (
    <div className="w-full h-full max-w-[600px]">
      <svg viewBox="0 0 600 300" className="w-full h-full">
        {/* Vessel */}
        <motion.path 
          d="M 100 150 L 140 130 L 220 130 L 250 150 L 220 170 L 140 170 Z" 
          fill="#1e293b" stroke="#a855f7" strokeWidth="2"
          animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }}
        />
        {/* Streamers */}
        {[0, 1, 2].map(i => (
          <g key={i}>
            <motion.path 
              d={`M 250 150 L 550 ${120 + i*30}`} 
              fill="none" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.4"
              animate={{ pathLength: [0.8, 1, 0.8] }} transition={{ repeat: Infinity, duration: 2 }}
            />
            {/* Airgun pulses */}
            <motion.circle 
              r="4" fill="#a855f7"
              animate={{ cx: [250, 500], cy: [150, 150 + (i-1)*50], opacity: [0, 1, 0], scale: [0, 2, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: i*0.5 }}
            />
          </g>
        ))}
        <text x="300" y="280" fill="#a855f7" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">High-Resolution Marine Seismic Acquisition</text>
      </svg>
    </div>
  );
}

function WaveformInversion3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Grid of Velocity Cells */}
        {[...Array(6)].map((_, i) => (
          [...Array(4)].map((_, j) => (
            <motion.rect 
              key={`${i}-${j}`} x={100 + i*50} y={50 + j*40} width="48" height="38" 
              fill="#a855f7" fillOpacity="0.05" stroke="#a855f7" strokeWidth="1" strokeOpacity="0.2"
              animate={{ fillOpacity: [0.05, 0.2, 0.05] }}
              transition={{ repeat: Infinity, duration: 4, delay: (i+j)*0.2 }}
            />
          ))
        ))}
        {/* FWI Rays */}
        {[0, 1, 2].map(i => (
          <motion.path 
            key={i} d={`M 50 150 Q ${150 + i*50} ${50 + i*100} 450 150`}
            fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="5,5"
            animate={{ strokeDashoffset: [0, -20] }} transition={{ repeat: Infinity, duration: 2 }}
          />
        ))}
        <text x="250" y="270" fill="#a855f7" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">FWI Velocity Model Iteration Sim</text>
      </svg>
    </div>
  );
}

function HorizonMapper3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Isometric Block */}
        <path d="M 100 200 L 250 120 L 400 200 L 250 280 Z" fill="#0f172a" stroke="#a855f7" strokeWidth="2" strokeOpacity="0.3" />
        {/* Fault Plane */}
        <line x1="250" y1="120" x2="250" y2="280" stroke="#ef4444" strokeWidth="3" strokeDasharray="4,4" />
        
        {/* Picking Horizon 1 */}
        <motion.path 
          d="M 120 180 Q 250 140 380 180" fill="none" stroke="#a855f7" strokeWidth="4"
          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 3 }}
        />
        {/* Picking Horizon 2 */}
        <motion.path 
          d="M 140 220 Q 250 180 360 220" fill="none" stroke="#7e22ce" strokeWidth="4"
          animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 3, delay: 1.5 }}
        />
        <text x="250" y="290" fill="#a855f7" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">Structural Interpretation & Fault Picking</text>
      </svg>
    </div>
  );
}

function QuantitativeModel3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Seismic Wavelet */}
        <motion.path 
          d="M 50 150 Q 100 50 150 150 Q 200 250 250 150 Q 300 50 350 150 Q 400 250 450 150" 
          fill="none" stroke="#a855f7" strokeWidth="3"
          animate={{ pathLength: [0, 1] }} transition={{ repeat: Infinity, duration: 4 }}
        />
        {/* Rock Physics Grains */}
        {[...Array(12)].map((_, i) => (
          <motion.circle 
            key={i} cx={200 + Math.cos(i)*100} cy={150 + Math.sin(i)*60} r="6" fill="#a855f7" fillOpacity="0.3"
            animate={{ r: [6, 8, 6], fillOpacity: [0.2, 0.6, 0.2] }}
            transition={{ repeat: Infinity, duration: 3, delay: i*0.2 }}
          />
        ))}
        <text x="250" y="270" fill="#a855f7" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">AVO & Elastic Inversion Analysis</text>
      </svg>
    </div>
  );
}

function FluidMonitoring4D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Baseline State */}
        <rect x="100" y="100" width="120" height="80" fill="#1e293b" stroke="#a855f7" strokeWidth="2" strokeOpacity="0.3" />
        {/* Monitor State */}
        <rect x="280" y="100" width="120" height="80" fill="#1e293b" stroke="#a855f7" strokeWidth="2" strokeOpacity="0.3" />
        
        {/* Fluid movement difference */}
        <motion.circle 
          cx="160" cy="140" r="20" fill="#3b82f6" fillOpacity="0.2"
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 4 }}
        />
        <motion.circle 
          cx="340" cy="140" r="35" fill="#ef4444" fillOpacity="0.2"
          animate={{ scale: [1, 0.8, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 4 }}
        />
        
        <path d="M 220 140 L 280 140" stroke="#a855f7" strokeWidth="2" strokeDasharray="4,4" />
        <text x="250" y="250" fill="#a855f7" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">4D Time-Lapse Saturation Difference</text>
      </svg>
    </div>
  );
}

function MicroseismicEvent3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Wellbore */}
        <line x1="250" y1="50" x2="250" y2="250" stroke="#475569" strokeWidth="4" />
        
        {/* Random Events Cloud */}
        {[...Array(20)].map((_, i) => (
          <motion.circle 
            key={i} r="3" fill={i % 2 === 0 ? "#a855f7" : "#ef4444"}
            initial={{ cx: 250, cy: 150, opacity: 0 }}
            animate={{ cx: 250 + (Math.random()-0.5)*200, cy: 100 + Math.random()*100, opacity: [0, 1, 0], scale: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: Math.random()*3 }}
          />
        ))}
        <text x="250" y="280" fill="#a855f7" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">Real-Time SRV Microseismic Mapping</text>
      </svg>
    </div>
  );
}

function PotentialFields3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Surface Grid */}
        {[...Array(8)].map((_, i) => (
          <path key={i} d={`M ${50 + i*50} 50 L ${50 + i*50} 250`} stroke="#a855f7" strokeWidth="1" strokeOpacity="0.1" />
        ))}
        {/* Anomaly Relief */}
        <motion.path 
          d="M 100 150 Q 200 50 300 150 Q 400 250 450 150" fill="none" stroke="#a855f7" strokeWidth="4" strokeOpacity="0.8"
          animate={{ d: ["M 100 150 Q 200 100 300 150 Q 400 200 450 150", "M 100 150 Q 200 20 300 150 Q 400 280 450 150"] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        />
        <text x="250" y="270" fill="#a855f7" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">Grav/Mag Potential Field Inversion</text>
      </svg>
    </div>
  );
}

function EMFieldSimulator3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* CSEM Source */}
        <motion.circle 
          cx="250" cy="150" r="10" fill="#a855f7"
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 2 }}
        />
        {/* Propagating Fields */}
        {[0, 1, 2, 3].map(i => (
          <motion.circle 
            key={i} cx="250" cy="150" r="20" fill="none" stroke="#a855f7" strokeWidth="2" strokeOpacity="0.4"
            animate={{ r: [20, 200], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 4, delay: i*1 }}
          />
        ))}
        <text x="250" y="280" fill="#a855f7" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">CSEM Resistivity Induction Modeling</text>
      </svg>
    </div>
  );
}
