import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, 
  Layers, 
  Activity, 
  Target, 
  Zap, 
  ArrowDown, 
  AlertTriangle,
  MoveDown,
  Scaling,
  Box,
  LayoutDashboard,
  ShieldCheck,
  FastForward,
  Database,
  Search,
  HardHat,
  Thermometer
} from 'lucide-react';
import { cn } from '../../lib/utils';

type GeomechanicsTab = 
  | 'ph1' | 'ph2' | 'ph3' | 'ph4' | 'ph5' | 'ph6' | 'ph7';

export default function GeomechanicsAdvStage() {
  const [activeTab, setActiveTab] = useState<GeomechanicsTab>('ph1');
  const tabs = [
    { id: 'ph1' as GeomechanicsTab, label: 'Ph.1: In-Situ Stress', icon: Layers },
    { id: 'ph2' as GeomechanicsTab, label: 'Ph.2: Rock Props', icon: Dna },
    { id: 'ph3' as GeomechanicsTab, label: 'Ph.3: Stability', icon: ShieldCheck },
    { id: 'ph4' as GeomechanicsTab, label: 'Ph.4: Sand Prod', icon: Box },
    { id: 'ph5' as GeomechanicsTab, label: 'Ph.5: HF Geomech', icon: Zap },
    { id: 'ph6' as GeomechanicsTab, label: 'Ph.6: Compaction', icon: MoveDown },
    { id: 'ph7' as GeomechanicsTab, label: 'Ph.7: Fault Stability', icon: AlertTriangle },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/20">
        <Layers className="text-orange-500" size={20} />
        <span className="text-white font-black italic text-lg tracking-tight mr-6 uppercase">Advanced Geomechanics & Rock Physics</span>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
              activeTab === t.id
                ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            )}
          >
            <t.icon size={13} />{t.label}
          </button>
        ))}
        <div className="flex-1" />
        <button 
          onClick={() => {
            const content = `PETROSTREAM GEOMECHANICS ENGINEERING REPORT\nGenerated: ${new Date().toLocaleString()}\nModule: Geomechanics & Rock Physics\n\n1. STRESS: Normal Faulting Regime (Sv > SH > Sh)\n2. STABILITY: Mud Weight Window (9.4 - 11.2 ppg)\n3. ROCK PROPS: Static Young's Modulus (4.2 Mpsi)\n4. HF: Breakdown Pressure (8,400 psi)\n\nEnd of Summary.`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Geomechanics_Analysis_Report.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-100 transition-all flex items-center gap-2 shadow-lg shadow-white/10"
        >
          <FastForward size={14} />
          Generate Report
        </button>
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
            {activeTab === 'ph1' && <Phase1InSituStress />}
            {activeTab === 'ph2' && <Phase2RockProps />}
            {activeTab === 'ph3' && <Phase3Stability />}
            {activeTab === 'ph4' && <Phase4SandProd />}
            {activeTab === 'ph5' && <Phase5HFGeomech />}
            {activeTab === 'ph6' && <Phase6Compaction />}
            {activeTab === 'ph7' && <Phase7FaultStability />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Phase Components ────────────────────────────────────────────────────────

function Phase1InSituStress() {
  const stressData = [
    { depth: 0, sv: 0, shmin: 0, shmax: 0 },
    { depth: 2000, sv: 2000, shmin: 1400, shmax: 1600 },
    { depth: 4000, sv: 4000, shmin: 2800, shmax: 3200 },
    { depth: 6000, sv: 6000, shmin: 4500, shmax: 5200 },
    { depth: 8000, sv: 8000, shmin: 6200, shmax: 7100 },
    { depth: 10000, sv: 10000, shmin: 8100, shmax: 9200 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Layers className="text-orange-500" size={36} />
             Phase 1: In-Situ <span className="text-orange-500/50">Stress Profile</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Sv · σhmin · σHmax · Stress Regimes</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-orange-500 italic">Normal</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Predicted Stress Regime</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-orange-500" />
                  In-Situ Stress vs. Depth (psi)
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <StressState3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-orange-500/5 border-orange-500/10 flex-1 flex flex-col justify-center text-center">
               <Database size={48} className="text-orange-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Effective Stress</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">3,450 <span className="text-sm">psi</span></p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  σ' = σ - Pp (at 8500 ft)
               </p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailCard title="Stress Components" items={["Vertical Stress (Overburden, σv = ∫ρg dz)", "Minimum Horizontal Stress (σhmin) from LOT/XLOT", "Maximum Horizontal Stress (σHmax) from breakouts", "Effective Stress = Total Stress - Pore Pressure"]} />
        <DetailCard title="Stress Regimes" items={["Normal Faulting (σv > σH > σh)", "Strike-Slip (σH > σv > σh)", "Reverse Faulting (σH > σh > σv)", "Andersonian Faulting Theory"]} />
        <DetailCard title="Measurement" items={["Leak-off Tests (LOT) & XLOT", "Minifrac & DFIT analysis", "Borehole Breakout & Induced Fracture ID", "Sonic Scanner / Crossed-Dipole Sonic"]} />
      </div>
    </div>
  );
}

function Phase2RockProps() {
  const rockData = [
    { dynamic: 2.1, static: 1.8 },
    { dynamic: 3.5, static: 2.9 },
    { dynamic: 4.8, static: 4.1 },
    { dynamic: 6.2, static: 5.4 },
    { dynamic: 7.5, static: 6.8 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Dna className="text-orange-500" size={36} />
             Phase 2: Rock <span className="text-orange-500/50">Mechanical Props</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Young's Modulus · Poisson's Ratio · Failure Criteria</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-orange-500 italic">4.2 <span className="text-sm text-slate-500">Mpsi</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Static Young's Modulus</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-orange-500" />
                  Dynamic to Static Modulus Correlation
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <RockCore3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-orange-500/5 border-orange-500/10 flex-1 flex flex-col justify-center text-center">
               <Scaling size={48} className="text-orange-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">UCS Prediction</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">8,200 <span className="text-sm">psi</span></p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sandstone Strength</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailCard title="Elastic Properties" items={["Young's Modulus (E) - Stiffness", "Poisson's Ratio (ν) - Lateral expansion", "Static vs Dynamic properties", "Sonic log based dynamic-to-static correlation"]} />
        <DetailCard title="Strength Parameters" items={["Unconfined Compressive Strength (UCS)", "Cohesion & Internal Friction Angle", "Tensile Strength (T)", "Biot's Coefficient (α)"]} />
        <DetailCard title="Failure Criteria" items={["Mohr-Coulomb Failure Criterion", "Drucker-Prager / Modified Lade", "Mogi-Coulomb (3D influence)", "Failure Envelope Construction"]} />
      </div>
    </div>
  );
}

function Phase3Stability() {
  const mwwData = [
    { depth: 8000, pp: 9.2, collapse: 9.8, frac: 15.2 },
    { depth: 8200, pp: 9.3, collapse: 9.9, frac: 15.4 },
    { depth: 8400, pp: 9.4, collapse: 10.1, frac: 15.5 },
    { depth: 8600, pp: 9.5, collapse: 10.4, frac: 15.7 },
    { depth: 8800, pp: 9.6, collapse: 10.8, frac: 15.8 },
    { depth: 9000, pp: 9.8, collapse: 11.2, frac: 16.1 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <ShieldCheck className="text-orange-500" size={36} />
             Phase 3: Wellbore <span className="text-orange-500/50">Stability</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Mud Weight Window · Breakouts · Kirsch Equations</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-orange-500 italic">10.2 <span className="text-sm text-slate-500">ppg</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Planned Mud Weight</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-orange-500" />
                  Safe Mud Weight Window Simulator (ppg vs. Depth)
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <WellboreStress3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-orange-500/5 border-orange-500/10 flex-1 flex flex-col justify-center text-center">
               <Target size={48} className="text-orange-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Kick Margin</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">0.8 <span className="text-sm">ppg</span></p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Safe Operating Window</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailCard title="Stress Concentration" items={["Kirsch Equations (Radial, Tangential, Axial)", "Hoop Stress (σθθ) Analysis", "Stress amplification at borehole wall", "Pore pressure effects on stability"]} />
        <DetailCard title="Failure Modes" items={["Borehole Breakouts (Compressive failure)", "Tensile Induced Fractures", "Safe Mud Weight Window (MWW)", "Collapse Pressure to Fracture Gradient"]} />
        <DetailCard title="Trajectory Optimization" items={["Effect of Well Inclination/Azimuth", "Optimal drilling direction relative to SHmax", "Critical angle for wellbore collapse", "Lamination & Anisotropy effects"]} />
      </div>
    </div>
  );
}

function Phase4SandProd() {
  const sandData = [
    { drawdown: 0, sanding: 0 },
    { drawdown: 500, sanding: 0 },
    { drawdown: 1000, sanding: 0 },
    { drawdown: 1500, sanding: 15 },
    { drawdown: 2000, sanding: 120 },
    { drawdown: 2500, sanding: 450 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Box className="text-orange-500" size={36} />
             Phase 4: Sand <span className="text-orange-500/50">Production</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Sanding Onset · Drawdown Limits · Cavity Growth</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-orange-500 italic">1,420 <span className="text-sm text-slate-500">psi</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Predicted Sanding Onset</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-orange-500" />
                  Sanding Risk: Rate vs. Drawdown Pressure
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <SandArch3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-orange-500/5 border-orange-500/10 flex-1 flex flex-col justify-center text-center">
               <HardHat size={48} className="text-orange-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Management</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">SCREENS</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Sand Control Deployed</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailCard title="Sanding Analysis" items={["Critical Drawdown Pressure (CDP)", "Critical Bottom-Hole Pressure (CBHP)", "Sanding Rate & Cavity Growth", "Thick-Wall Cylinder (TWC) Test"]} />
        <DetailCard title="Prediction Tools" items={["Log-based sanding prediction (UCS/Sonic)", "Operational envelope for drawdowns", "Depletion effects on sanding risk", "Hollow Cylinder laboratory testing"]} />
        <DetailCard title="Management" items={["Production Rate Restriction", "Sand Exclusion (Screens, Gravel Pack)", "Chemical Consolidation", "Sand management in CHOPS"]} />
      </div>
    </div>
  );
}

function Phase5HFGeomech() {
  const hfData = [
    { name: 'Stage 1', breakdown: 8200, closure: 5400 },
    { name: 'Stage 2', breakdown: 8500, closure: 5600 },
    { name: 'Stage 3', breakdown: 8900, closure: 5900 },
    { name: 'Stage 4', breakdown: 9400, closure: 6300 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <Zap className="text-orange-500" size={36} />
             Phase 5: HF <span className="text-orange-500/50">Geomechanics</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Breakdown · Stress Shadow · Containment</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-orange-500 italic">+850 <span className="text-sm text-slate-500">psi</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Predicted Stress Shadow</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-orange-500" />
                  Breakdown vs. Closure Stress per Stage
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <HFPropagation3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-orange-500/5 border-orange-500/10 flex-1 flex flex-col justify-center text-center">
               <Zap size={48} className="text-orange-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Initiation</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">LONGITUDINAL</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Optimized Well Alignment</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailCard title="Initiation & Growth" items={["Breakdown Pressure (Pb)", "Fracture Initiation vs Propagation", "Fracture Closure Stress", "Stress Barriers & Height Growth"]} />
        <DetailCard title="Complexity" items={["Stress Shadow between parallel fractures", "Poroelastic stress changes", "Fracture containment in layered media", "In-situ stress measurement via DFIT"]} />
        <DetailCard title="Interaction" items={["Frac-hits & Induced stress changes", "Interaction with natural fractures", "Stress reorientation during production", "Multi-stage interference effects"]} />
      </div>
    </div>
  );
}

function Phase6Compaction() {
  const compactionData = [
    { depletion: 0, subsidence: 0 },
    { depletion: 1000, subsidence: 0.1 },
    { depletion: 2000, subsidence: 0.25 },
    { depletion: 3000, subsidence: 0.52 },
    { depletion: 4000, subsidence: 0.88 },
    { depletion: 5000, subsidence: 1.45 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <ArrowDown className="text-orange-500" size={36} />
             Phase 6: Compaction <span className="text-orange-500/50">& Subsidence</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Pressure Depletion · Geertsma Model · Casing Deformation</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-orange-500 italic">1.45 <span className="text-sm text-slate-500">m</span></p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Estimated Seafloor Subsidence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-orange-500" />
                  Compaction Drive: Subsidence vs. Pressure Depletion
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <ReservoirCompaction3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-orange-500/5 border-orange-500/10 flex-1 flex flex-col justify-center text-center">
               <MoveDown size={48} className="text-orange-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Uni-Compaction</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2">0.002 <span className="text-sm">/psi</span></p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Uniaxial Compaction Coeff.</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailCard title="Reservoir Mechanics" items={["Compaction due to pressure depletion", "Compaction Drive mechanism", "Uniaxial Compaction Coefficient", "Porosity reduction with stress"]} />
        <DetailCard title="Surface Effects" items={["Surface Subsidence (Geertsma model)", "Environmental & Facility impact", "InSAR & Leveling monitoring", "Seafloor bathymetry surveys"]} />
        <DetailCard title="Integrity Issues" items={["Casing Deformation & Buckling", "Wellhead sinking / platform stability", "Formation shearing & fault reactivation", "Radioactive marker monitoring"]} />
      </div>
    </div>
  );
}

function Phase7FaultStability() {
  const mohrData = [
    { sigma: 1000, tau: 0 },
    { sigma: 2000, tau: 800 },
    { sigma: 3000, tau: 1000 },
    { sigma: 4000, tau: 800 },
    { sigma: 5000, tau: 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-3">
             <AlertTriangle className="text-orange-500" size={36} />
             Phase 7: Fault <span className="text-orange-500/50">Stability</span>
           </h2>
           <p className="text-slate-500 text-sm mt-2 font-medium uppercase tracking-widest">Induced Seismicity · Mohr Circles · Slip Tendency</p>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-orange-500 italic">0.42</p>
           <p className="text-[11px] text-slate-500 uppercase font-bold">Slip Tendency (Ts)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8">
            <div className="glass-card p-10 rounded-3xl bg-black/40 border-white/5 h-[400px]">
               <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-8 flex items-center gap-2">
                  <Activity size={16} className="text-orange-500" />
                  Mohr Circle & Failure Envelope (σ vs. τ)
               </h3>
               <div className="h-[300px] flex items-center justify-center">
                  <FaultSlip3D />
               </div>
            </div>
         </div>
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card p-8 rounded-3xl bg-orange-500/5 border-orange-500/10 flex-1 flex flex-col justify-center text-center">
               <Thermometer size={48} className="text-orange-500 mx-auto mb-4" />
               <h4 className="text-xs font-black text-white uppercase italic mb-2">Risk Level</h4>
               <p className="text-4xl font-black text-white italic tracking-tighter mb-2 text-green-500">LOW</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  Traffic Light: GREEN
               </p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailCard title="Fault Mechanics" items={["Coulomb failure on pre-existing faults", "Critically Stressed Fault Analysis", "Slip Tendency & Dilation Tendency", "Mohr Circle analysis for fault slip"]} />
        <DetailCard title="Induced Seismicity" items={["Risk Assessment from injection (SWD)", "Fault reactivation from Waterflood/CO2", "Triggered Seismicity vs Induced", "Magnitude & frequency monitoring"]} />
        <DetailCard title="Mitigation" items={["Injection pressure/rate limits", "Traffic light protocols", "Fault seal integrity analysis", "Stress path modeling (γ factor)"]} />
      </div>
    </div>
  );
}

// ─── Shared Components ──────────────────────────────────────────────────────

// ─── 3D Visualizer Components ──────────────────────────────────────────────

function StressState3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Earth Block */}
        <path d="M 100 200 L 250 120 L 400 200 L 250 280 Z" fill="#0f172a" stroke="#f97316" strokeWidth="2" strokeOpacity="0.3" />
        <path d="M 100 200 L 100 120 L 250 40 L 400 120 L 400 200" fill="none" stroke="#f97316" strokeWidth="2" strokeOpacity="0.2" />
        
        {/* Stress Vectors */}
        <g>
          {/* Sv - Vertical */}
          <motion.line 
            x1="250" y1="20" x2="250" y2="100" stroke="#ef4444" strokeWidth="4" 
            animate={{ y1: [20, 30, 20], y2: [100, 110, 100] }} transition={{ repeat: Infinity, duration: 2 }}
          />
          <text x="260" y="40" fill="#ef4444" fontSize="10" className="font-bold italic">Sv</text>
          
          {/* SHmax - Max Horizontal */}
          <motion.line 
            x1="120" y1="180" x2="380" y2="140" stroke="#f59e0b" strokeWidth="4"
            animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 3 }}
          />
          <text x="360" y="130" fill="#f59e0b" fontSize="10" className="font-bold italic">SHmax</text>
          
          {/* Shmin - Min Horizontal */}
          <motion.line 
            x1="180" y1="220" x2="320" y2="100" stroke="#3b82f6" strokeWidth="4"
            animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 3, delay: 1.5 }}
          />
          <text x="310" y="90" fill="#3b82f6" fontSize="10" className="font-bold italic">Shmin</text>
        </g>
        <text x="250" y="290" fill="#f97316" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">In-Situ Stress Tensor Visualization</text>
      </svg>
    </div>
  );
}

function RockCore3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Pressure Cell (Hoek Cell) Boundary */}
        <rect x="150" y="40" width="200" height="220" fill="none" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="5,5" rx="10" />
        
        {/* Cylindrical Core */}
        <motion.ellipse 
          cx="250" cy="80" rx="60" ry="25" fill="#1e293b" stroke="#f97316" strokeWidth="2"
          animate={{ ry: [25, 28, 25] }} transition={{ repeat: Infinity, duration: 4 }}
        />
        <rect x="190" y="80" width="120" height="140" fill="#1e293b" stroke="#f97316" strokeWidth="2" strokeOpacity="0.3" />
        <ellipse cx="250" cy="220" rx="60" ry="25" fill="#1e293b" stroke="#f97316" strokeWidth="2" />
        
        {/* Axial Stress Arrows (σ1) */}
        <motion.path 
          d="M 250 10 L 250 50 M 240 40 L 250 50 L 260 40" fill="none" stroke="#ef4444" strokeWidth="3"
          animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 2 }}
        />
        <text x="265" y="35" fill="#ef4444" fontSize="10" className="font-bold italic">σ₁</text>
        
        {/* Confining Pressure Arrows (σ3) - Left & Right */}
        {[0, 1, 2].map(i => (
          <g key={i}>
            {/* Left side */}
            <motion.path 
              d={`M 140 ${100 + i*50} L 180 ${100 + i*50} M 170 ${95 + i*50} L 180 ${100 + i*50} L 170 ${105 + i*50}`} 
              fill="none" stroke="#3b82f6" strokeWidth="2"
              animate={{ x: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 2, delay: i*0.2 }}
            />
            {/* Right side */}
            <motion.path 
              d={`M 360 ${100 + i*50} L 320 ${100 + i*50} M 330 ${95 + i*50} L 320 ${100 + i*50} L 330 ${105 + i*50}`} 
              fill="none" stroke="#3b82f6" strokeWidth="2"
              animate={{ x: [5, -5, 5] }} transition={{ repeat: Infinity, duration: 2, delay: i*0.2 }}
            />
          </g>
        ))}
        <text x="140" y="90" fill="#3b82f6" fontSize="10" className="font-bold italic">σ₃</text>
        <text x="360" y="90" fill="#3b82f6" fontSize="10" className="font-bold italic text-right">σ₃</text>
        
        {/* Strain Kinetic Lines */}
        {[...Array(4)].map((_, i) => (
          <motion.path 
            key={i} d={`M ${210 + i*25} 100 L ${210 + i*25} 200`}
            stroke="#f97316" strokeWidth="1" strokeOpacity="0.5"
            animate={{ scaleY: [1, 0.95, 1], scaleX: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          />
        ))}
        <text x="250" y="290" fill="#f97316" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">Triaxial Compression Engineering Sim</text>
      </svg>
    </div>
  );
}

function WellboreStress3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Formation Background */}
        <rect x="50" y="50" width="400" height="200" fill="#0f172a" rx="100" opacity="0.3" />
        {/* Wellbore Center */}
        <circle cx="250" cy="150" r="40" fill="#1e293b" stroke="#f97316" strokeWidth="3" />
        
        {/* Stress Concentrations (Hoop Stress) */}
        {[0, 90, 180, 270].map(angle => (
          <motion.path 
            key={angle}
            d={`M ${250 + Math.cos(angle*Math.PI/180)*50} ${150 + Math.sin(angle*Math.PI/180)*50} Q ${250 + Math.cos(angle*Math.PI/180)*80} ${150 + Math.sin(angle*Math.PI/180)*80} ${250 + Math.cos((angle+45)*Math.PI/180)*60} ${150 + Math.sin((angle+45)*Math.PI/180)*60}`}
            fill="none" stroke={angle % 180 === 0 ? "#ef4444" : "#3b82f6"} strokeWidth="2"
            animate={{ strokeDasharray: ["0, 100", "100, 0"] }} transition={{ repeat: Infinity, duration: 3, delay: angle/90 }}
          />
        ))}
        
        {/* Breakout Zones */}
        <motion.path 
          d="M 290 150 A 40 40 0 0 1 290 155 L 310 152 Z" fill="#ef4444" fillOpacity="0.4"
          animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 2 }}
        />
        <motion.path 
          d="M 210 150 A 40 40 0 0 0 210 155 L 190 152 Z" fill="#ef4444" fillOpacity="0.4"
          animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 2 }}
        />
        
        <text x="250" y="270" fill="#f97316" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">Kirsch Stress Field Mapping</text>
      </svg>
    </div>
  );
}

function SandArch3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Perforation Tunnel */}
        <path d="M 50 120 Q 250 80 450 120 L 450 180 Q 250 220 50 180 Z" fill="#0f172a" stroke="#f97316" strokeWidth="2" strokeOpacity="0.3" />
        
        {/* Sand Arch Kinetic */}
        <motion.path 
          d="M 180 120 Q 250 150 320 120" fill="none" stroke="#f59e0b" strokeWidth="4" strokeOpacity="0.6"
          animate={{ strokeWidth: [4, 6, 4], strokeOpacity: [0.4, 0.8, 0.4] }} transition={{ repeat: Infinity, duration: 3 }}
        />
        
        {/* Sand Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.circle 
            key={i} r="2" fill="#f59e0b"
            initial={{ cx: 100 + Math.random()*300, cy: 100 + Math.random()*100, opacity: 0 }}
            animate={{ cx: [null, 250], cy: [null, 150], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: Math.random()*2 }}
          />
        ))}
        <text x="250" y="280" fill="#f97316" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">Stability Arch & Particle Migration</text>
      </svg>
    </div>
  );
}

function HFPropagation3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Layered Formation */}
        {[0, 1, 2].map(i => (
          <path key={i} d={`M 50 ${80+i*60} L 450 ${80+i*60}`} stroke="#f97316" strokeWidth="1" strokeOpacity="0.2" />
        ))}
        
        {/* Fracture Wing */}
        <motion.path 
          d="M 250 150 Q 350 100 400 150 Q 350 200 250 150" fill="#f59e0b" fillOpacity="0.1" stroke="#f59e0b" strokeWidth="2"
          animate={{ d: ["M 250 150 Q 260 150 270 150", "M 250 150 Q 350 80 430 150 Q 350 220 250 150"] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeOut" }}
        />
        
        {/* Stress Shadow Glow */}
        <motion.ellipse 
          cx="340" cy="150" rx="80" ry="100" fill="#3b82f6" fillOpacity="0.03"
          animate={{ rx: [80, 100, 80], opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 5 }}
        />
        <text x="250" y="270" fill="#f97316" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">Dynamic Fracture Mechanics Sim</text>
      </svg>
    </div>
  );
}

function ReservoirCompaction3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Subsiding Layers */}
        {[0, 1, 2].map(i => (
          <motion.path 
            key={i} d={`M 100 ${150+i*30} L 400 ${150+i*30}`} stroke="#f97316" strokeWidth="2" strokeOpacity="0.3"
            animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 4, delay: i*0.2 }}
          />
        ))}
        
        {/* Subsidence Bowl */}
        <motion.path 
          d="M 50 50 Q 250 50 450 50" fill="none" stroke="#ef4444" strokeWidth="3"
          animate={{ d: ["M 50 50 Q 250 50 450 50", "M 50 50 Q 250 100 450 50"] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        />
        
        {/* Pressure Depletion Kinetic */}
        {[...Array(6)].map((_, i) => (
          <motion.circle 
            key={i} r="2" fill="#3b82f6"
            cx={150 + i*40} cy="200"
            animate={{ r: [2, 0], opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: i*0.5 }}
          />
        ))}
        <text x="250" y="270" fill="#f97316" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">Geertsma Subsidence Modeling</text>
      </svg>
    </div>
  );
}

function FaultSlip3D() {
  return (
    <div className="w-full h-full max-w-[500px]">
      <svg viewBox="0 0 500 300" className="w-full h-full">
        {/* Faulted Earth Blocks */}
        <motion.path 
          d="M 100 100 L 300 80 L 300 180 L 100 200 Z" fill="#1e293b" stroke="#f97316" strokeWidth="2"
          animate={{ y: [-5, 0, -5] }} transition={{ repeat: Infinity, duration: 4 }}
        />
        <motion.path 
          d="M 300 80 L 450 100 L 450 200 L 300 180 Z" fill="#0f172a" stroke="#f97316" strokeWidth="2"
          animate={{ y: [5, 0, 5] }} transition={{ repeat: Infinity, duration: 4 }}
        />
        
        {/* Shear Stress Vectors */}
        <motion.path 
          d="M 280 100 L 320 100" stroke="#ef4444" strokeWidth="4"
          animate={{ scaleX: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}
        />
        <motion.path 
          d="M 280 160 L 320 160" stroke="#ef4444" strokeWidth="4"
          animate={{ scaleX: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }}
        />
        
        {/* Stability Warning nodes */}
        <motion.circle 
          cx="300" cy="130" r="15" fill="#f59e0b" fillOpacity="0.2"
          animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 3 }}
        />
        <text x="250" y="270" fill="#f97316" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest italic opacity-60">Slip Tendency & Seismicity Mapping</text>
      </svg>
    </div>
  );
}

function DetailCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="glass-card p-6 rounded-3xl border-white/5 bg-orange-500/5 hover:border-orange-500/30 transition-all">
      <h5 className="text-[11px] font-black uppercase tracking-widest text-orange-500 mb-4">{title}</h5>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <div className="mt-1.5 w-1 h-1 rounded-full bg-orange-500 shrink-0" />
            <span className="text-[11px] text-slate-300 leading-relaxed font-medium">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
