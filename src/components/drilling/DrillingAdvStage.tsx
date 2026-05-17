/**
 * CHANGE #7: DrillingAdvStage — wired to shared simulation store.
 *   - Reads exploration layer (targetDepth, pressureProfile, afeCost, drillingDays)
 *     on mount to pre-populate drilling parameters.
 *   - "Persist to Simulation" floating bar at the bottom writes key as-drilled outputs
 *     (totalDepth, cost, drillingDays, nptDays) back to the drillingCompletion layer.
 *   - Works with DrillingCompletionLayer.wells[] array (finds or creates WELL_001 entry).
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Construction,
  Droplets,
  Wind,
  Cog,
  Layers,
  Calendar,
  Navigation,
  Compass,
  Database,
  ArrowRight,
  Cpu,
  ShieldAlert,
  Zap,
  Activity,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import CementingTab from './CementingTab';
import CompletionTab from './CompletionTab';
import StimulationTab from './StimulationTab';
import { useExploration, useDrilling } from '../../store/hooks';
import type { DrilledWell } from '../../store/types';
import SampleDataLoader from '../shared/SampleDataLoader';
import { getDrillingSample } from '../../lib/sampleData';

type DrillingTab =
  | 'ph1' | 'ph2' | 'ph3' | 'ph4' | 'ph5' | 'ph6' | 'ph7'
  | 'ph8' | 'ph9' | 'ph10' | 'ph11' | 'ph12' | 'ph13'
  | 'ph14' | 'ph15' | 'ph16' | 'ph17' | 'ph18' | 'ph19' | 'ph20' | 'ph21'
  | 'ph22' | 'ph23';

// Default well ID used within the wells array
const WELL_ID = 'WELL_001';

export default function DrillingAdvStage() {
  const [activeTab, setActiveTab] = useState<DrillingTab>('ph1');
  const [showSaved, setShowSaved] = useState(false);

  // ── Store hooks ──
  const { data: exp } = useExploration();
  const { data: drill, update: updateDrilling } = useDrilling();

  // Find or build default well from store
  const well: DrilledWell = drill?.wells?.[0] ?? {
    wellId: WELL_ID,
    trajectory: [],
    totalDepth: { md: 0, tvd: 0 },
    casingInstalled: [],
    cementBondQuality: [],
    completionType: 'cased_perforated',
    perforations: [],
    tubingSize: { id: 3.5, od: 4.0 },
    tubingMaterial: 'carbonSteel',
    packerDepth: 0,
    scssvDepth: 0,
    artificialLift: { type: 'natural', params: {} },
    stimulation: { type: 'none', postStimSkin: 0 },
    cost: { drilling: 0, completion: 0, total: 0, afeVariance: 0, drillingDays: 0, nptDays: 0 },
  };

  // ── Local state populated from exploration + drilling ──
  const [targetDepth, setTargetDepth] = useState(exp?.explorationWell?.targetDepth ?? 12000);
  const [porePressureAtTd, setPorePressureAtTd] = useState(
    exp?.pressureProfile?.porePressure?.[exp.pressureProfile.porePressure.length - 1]?.pressure ?? 6500
  );
  const [fractureGradientAtShoe, setFractureGradientAtShoe] = useState(
    exp?.pressureProfile?.fractureGradient?.[0]?.gradient ?? 0.85
  );
  const [plannedAfe, setPlannedAfe] = useState(exp?.explorationWell?.afeCost ?? 15);
  const [plannedDays, setPlannedDays] = useState(exp?.explorationWell?.drillingDays ?? 45);

  // As-drilled inputs
  const [asDrilledMD, setAsDrilledMD] = useState(well.totalDepth?.md ?? targetDepth);
  const [asDrilledTVD, setAsDrilledTVD] = useState(well.totalDepth?.tvd ?? targetDepth);
  const [actualCost, setActualCost] = useState(well.cost?.drilling ?? plannedAfe);
  const [actualDays, setActualDays] = useState(well.cost?.drillingDays ?? plannedDays);
  const [nptDays, setNptDays] = useState(well.cost?.nptDays ?? 0);
  const [completionCost, setCompletionCost] = useState(well.cost?.completion ?? 3);

  // ── Sync from exploration on mount ──
  useEffect(() => {
    if (exp) {
      setTargetDepth(exp.explorationWell?.targetDepth ?? 12000);
      const pp = exp.pressureProfile?.porePressure;
      if (pp && pp.length > 0) {
        setPorePressureAtTd(pp[pp.length - 1].pressure ?? 6500);
      }
      const fg = exp.pressureProfile?.fractureGradient;
      if (fg && fg.length > 0) {
        setFractureGradientAtShoe(fg[0].gradient ?? 0.85);
      }
      setPlannedAfe(exp.explorationWell?.afeCost ?? 15);
      setPlannedDays(exp.explorationWell?.drillingDays ?? 45);
    }
  }, [exp?.version]);

  // ── Sync from drilling layer on first mount ──
  useEffect(() => {
    const w = drill?.wells?.[0];
    if (w) {
      if (w.totalDepth) {
        setAsDrilledMD(w.totalDepth.md ?? targetDepth);
        setAsDrilledTVD(w.totalDepth.tvd ?? targetDepth);
      }
      if (w.cost) {
        setActualCost(w.cost.drilling ?? plannedAfe);
        setActualDays(w.cost.drillingDays ?? plannedDays);
        setNptDays(w.cost.nptDays ?? 0);
        setCompletionCost(w.cost.completion ?? 3);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist to simulation store ──
  const handlePersist = useCallback(() => {
    const afeVariance = plannedAfe > 0 ? ((actualCost - plannedAfe) / plannedAfe) * 100 : 0;
    const updatedWell: DrilledWell = {
      ...well,
      wellId: WELL_ID,
      totalDepth: { md: asDrilledMD, tvd: asDrilledTVD },
      cost: {
        drilling: actualCost,
        completion: completionCost,
        total: actualCost + completionCost,
        afeVariance,
        drillingDays: actualDays,
        nptDays,
      },
    };
    updateDrilling({ wells: [updatedWell] });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  }, [updateDrilling, well, asDrilledMD, asDrilledTVD, actualCost, actualDays, nptDays, completionCost, plannedAfe]);

  // ── Tab definitions ──
  const tabs: { id: DrillingTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'ph1', label: 'Ph.1: Bits', icon: Construction },
    { id: 'ph2', label: 'Ph.2: Fluids', icon: Droplets },
    { id: 'ph3', label: 'Ph.3: Hydraulics', icon: Wind },
    { id: 'ph4', label: 'Ph.4: Drillstring', icon: Cog },
    { id: 'ph5', label: 'Ph.5: Casing', icon: Layers },
    { id: 'ph6', label: 'Ph.6: Cementing', icon: ShieldCheck },
    { id: 'ph7', label: 'Ph.7: Planning', icon: Calendar },
    { id: 'ph8', label: 'Ph.8: Directional', icon: Navigation },
    { id: 'ph9', label: 'Ph.9: Profiles', icon: Compass },
    { id: 'ph10', label: 'Ph.10: BHA', icon: Database },
    { id: 'ph11', label: 'Ph.11: ERD', icon: ArrowRight },
    { id: 'ph12', label: 'Ph.12: Multilateral', icon: Cpu },
    { id: 'ph13', label: 'Ph.13: CT Drilling', icon: Wind },
    { id: 'ph14', label: 'Ph.14: Kick Detect', icon: AlertTriangle },
    { id: 'ph15', label: 'Ph.15: Shut-In', icon: ShieldAlert },
    { id: 'ph16', label: 'Ph.16: Kill Methods', icon: Activity },
    { id: 'ph17', label: 'Ph.17: Kill Sheet', icon: FileText },
    { id: 'ph18', label: 'Ph.18: BOP Equip', icon: Cog },
    { id: 'ph19', label: 'Ph.19: Special Ops', icon: Zap },
    { id: 'ph20', label: 'Ph.20: Blowout', icon: ShieldAlert },
    { id: 'ph21', label: 'Ph.21: Regs', icon: ShieldCheck },
    { id: 'ph22', label: 'Ph.22: Completion', icon: Database },
    { id: 'ph23', label: 'Ph.23: Stimulation', icon: Zap },
  ];

  // ── Load sample data ──
  const handleLoadDrillingSample = useCallback(() => {
    const s = getDrillingSample();
    setTargetDepth(s.totalDepthFt);
    const pp = s.totalDepthFt > 0 ? (0.052 * 11.5 * s.totalDepthFt) : 6500; // ~11.5 ppg pore
    setPorePressureAtTd(Math.round(pp));
    setFractureGradientAtShoe(0.85); // conservative estimate
    setPlannedAfe(s.estimatedCostMMUSD);
    setPlannedDays(s.totalDays);
    setAsDrilledMD(s.totalDepthFt);
    setAsDrilledTVD(s.tvdFt);
    setActualCost(s.estimatedCostMMUSD * 1.08);
    setActualDays(Math.round(s.totalDays * 1.04));
    setNptDays(Math.round(s.totalDays * 0.12));
    setCompletionCost(s.estimatedCostMMUSD * 0.35);
  }, []);

  // ── Exploration source display ──
  const explorationSource = exp ? (
    <div className="flex items-center gap-4 text-[10px] text-slate-500">
      <span>TD: {(exp.explorationWell?.targetDepth ?? 12000).toLocaleString()} ft</span>
      <span>AFE: ${(exp.explorationWell?.afeCost ?? 15).toFixed(1)}MM</span>
      <span>Days: {exp.explorationWell?.drillingDays ?? 45}</span>
    </div>
  ) : (
    <div className="text-[10px] text-amber-600">No exploration data loaded</div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center gap-2 px-6 py-4 border-b border-white/5 bg-black/20">
        <Construction className="text-cyan-500" size={20} />
        <span className="text-white font-black italic text-lg tracking-tight mr-6 uppercase">
          Advanced Drilling Engineering
        </span>
        {explorationSource}
        <SampleDataLoader
          label="Load 12,000 ft Deviated Well"
          stageName="Drilling"
          loadSample={handleLoadDrillingSample}
        />
        <div className="flex-1" />
        <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar max-w-[calc(100%-450px)]">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap',
                activeTab === t.id
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              )}
            >
              <t.icon size={12} />{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content Area ── */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'ph1' && <BitsTab targetDepth={targetDepth} />}
            {activeTab === 'ph2' && <FluidsTab porePressure={porePressureAtTd} targetDepth={targetDepth} />}
            {activeTab === 'ph3' && <HydraulicsTab targetDepth={targetDepth} />}
            {activeTab === 'ph4' && <DrillstringTab targetDepth={targetDepth} />}
            {activeTab === 'ph5' && <CasingTab targetDepth={targetDepth} fractureGradient={fractureGradientAtShoe} />}
            {activeTab === 'ph6' && <CementingTab />}
            {activeTab === 'ph7' && <PlanningTab plannedDays={plannedDays} plannedAfe={plannedAfe} targetDepth={targetDepth} />}
            {activeTab === 'ph8' && <DirectionalTab targetDepth={targetDepth} />}
            {activeTab === 'ph9' && <PlaceholderTab title="Well Profiles — 2D/3D Visualization" />}
            {activeTab === 'ph10' && <PlaceholderTab title="BHA Configurator" />}
            {activeTab === 'ph11' && <PlaceholderTab title={`Extended Reach Drilling (ERD) — Step-out / TVD ratio for ${targetDepth} ft TD`} />}
            {activeTab === 'ph12' && <PlaceholderTab title="Multilateral Junction Design (Levels 1-6)" />}
            {activeTab === 'ph13' && <PlaceholderTab title="Coiled Tubing Drilling — Underbalanced Ops" />}
            {activeTab === 'ph14' && <PlaceholderTab title="Real-Time Kick Detection & Early Warning" />}
            {activeTab === 'ph15' && <PlaceholderTab title="Shut-In Procedures & Hard/Soft Shut-In" />}
            {activeTab === 'ph16' && <PlaceholderTab title="Well Kill Methods — Driller's, Wait & Weight, Volumetric" />}
            {activeTab === 'ph17' && <PlaceholderTab title="Kill Sheet & Circulating Pressures" />}
            {activeTab === 'ph18' && <PlaceholderTab title="BOP Stack Configuration & Shear Ram Analysis" />}
            {activeTab === 'ph19' && <PlaceholderTab title="Managed Pressure Drilling / UBD / Air Drilling" />}
            {activeTab === 'ph20' && <PlaceholderTab title="Blowout Contingency & Relief Well Planning" />}
            {activeTab === 'ph21' && <PlaceholderTab title="Regulatory Compliance & Well Integrity Standards" />}
            {activeTab === 'ph22' && <CompletionTab />}
            {activeTab === 'ph23' && <StimulationTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── As-Drilled Summary + Persist Bar ── */}
      <div className="border-t border-white/10 bg-black/40 px-6 py-3 flex flex-wrap items-center gap-6 text-[11px]">
        <div className="flex items-center gap-4">
          <span className="text-slate-400 uppercase tracking-wider">As-Drilled</span>
          <label className="flex items-center gap-1 text-slate-300">
            MD
            <input
              type="number"
              value={asDrilledMD}
              onChange={e => setAsDrilledMD(Number(e.target.value))}
              className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-center"
            />
          </label>
          <label className="flex items-center gap-1 text-slate-300">
            TVD
            <input
              type="number"
              value={asDrilledTVD}
              onChange={e => setAsDrilledTVD(Number(e.target.value))}
              className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-center"
            />
          </label>
          <label className="flex items-center gap-1 text-slate-300">
            Cost $MM
            <input
              type="number"
              value={actualCost}
              onChange={e => setActualCost(Number(e.target.value))}
              className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-center"
            />
          </label>
          <label className="flex items-center gap-1 text-slate-300">
            Days
            <input
              type="number"
              value={actualDays}
              onChange={e => setActualDays(Number(e.target.value))}
              className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-center"
            />
          </label>
          <label className="flex items-center gap-1 text-slate-300">
            NPT
            <input
              type="number"
              value={nptDays}
              onChange={e => setNptDays(Number(e.target.value))}
              className="w-14 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-center"
            />
          </label>
          <label className="flex items-center gap-1 text-slate-300">
            Compl. $MM
            <input
              type="number"
              value={completionCost}
              onChange={e => setCompletionCost(Number(e.target.value))}
              className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-center"
            />
          </label>
        </div>
        <div className="flex-1" />
        <button
          onClick={handlePersist}
          className={cn(
            'flex items-center gap-2 px-5 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all',
            showSaved
              ? 'bg-emerald-500 text-white'
              : 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg shadow-cyan-500/20'
          )}
        >
          {showSaved ? (
            <>Saved</>
          ) : (
            <><Save size={14} /> Persist to Simulation</>
          )}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Tab sub-components
// ═══════════════════════════════════════════════════════════════════

function BitsTab({ targetDepth }: { targetDepth: number }) {
  const [bitSize, setBitSize] = useState(8.5);
  const [bitType, setBitType] = useState('pdc');
  const [rpm, setRpm] = useState(120);
  const [wob, setWob] = useState(25);
  const rop = wob * rpm * 0.0005 + (bitType === 'pdc' ? 15 : 7);
  const estimatedHours = targetDepth / rop;
  return (
    <div className="max-w-4xl">
      <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Bit Selection & Performance</h3>
      <div className="grid grid-cols-2 gap-6">
        <ParamBlock label="Bit Size (in)" value={bitSize} set={setBitSize} min={3.75} max={36} step={0.125} unit='"' />
        <ParamBlock label="RPM" value={rpm} set={setRpm} min={20} max={250} step={5} />
        <ParamBlock label="WOB (klbs)" value={wob} set={setWob} min={5} max={100} step={1} unit="klbs" />
        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4">
          <label className="text-[10px] uppercase tracking-widest text-slate-500 block mb-2">Bit Type</label>
          <select value={bitType} onChange={e => setBitType(e.target.value)} className="bg-slate-800 text-white rounded px-3 py-2 text-sm w-full border border-white/10">
            <option value="pdc">PDC</option>
            <option value="tci">TCI (Tungsten Carbide Insert)</option>
            <option value="mill">Mill Tooth</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <MetricCard label="Est. ROP" value={rop.toFixed(1)} unit="ft/hr" />
        <MetricCard label="Est. Drilling Hours" value={estimatedHours.toFixed(0)} unit="hrs" />
        <MetricCard label="Est. Days" value={(estimatedHours / 24).toFixed(1)} unit="days" />
      </div>
    </div>
  );
}

function FluidsTab({ porePressure, targetDepth }: { porePressure: number; targetDepth: number }) {
  const [mudWeight, setMudWeight] = useState(Math.max(9, (porePressure / targetDepth) * 0.052 * 1.1));
  const [pv, setPv] = useState(18);
  const [yp, setYp] = useState(15);
  const hydrostatic = 0.052 * mudWeight * targetDepth;
  const overbalance = hydrostatic - porePressure;
  const overbalanceColor = overbalance > 200 ? 'text-emerald-400' : 'text-amber-400';
  return (
    <div className="max-w-4xl">
      <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Drilling Fluids & Mud Engineering</h3>
      <div className="grid grid-cols-2 gap-6">
        <ParamBlock label="Mud Weight (ppg)" value={mudWeight} set={setMudWeight} min={8.33} max={20} step={0.1} unit="ppg" />
        <ParamBlock label="Plastic Viscosity (cP)" value={pv} set={setPv} min={5} max={80} step={1} unit="cP" />
        <ParamBlock label="Yield Point (lb/100ft²)" value={yp} set={setYp} min={5} max={60} step={1} />
        <MetricCard label="Hydrostatic" value={hydrostatic.toFixed(0)} unit="psi" />
        <MetricCard label="Overbalance" value={overbalance.toFixed(0)} unit="psi" color={overbalanceColor} />
        <MetricCard label="Pore Pressure @TD" value={porePressure.toFixed(0)} unit="psi" color="text-slate-400" />
      </div>
    </div>
  );
}

function HydraulicsTab({ targetDepth: _targetDepth }: { targetDepth: number }) {
  void _targetDepth;
  const [flowRate, setFlowRate] = useState(500);
  const [nozzleSize, setNozzleSize] = useState(12);
  const hsi = (flowRate * nozzleSize * 0.001) / (Math.PI * 4.25 * 4.25);
  const ecd = 10.5 + hsi * 0.5;
  const annularVelocity = flowRate / 40;
  return (
    <div className="max-w-4xl">
      <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Hydraulics Optimization</h3>
      <div className="grid grid-cols-2 gap-6">
        <ParamBlock label="Flow Rate (gpm)" value={flowRate} set={setFlowRate} min={100} max={1500} step={10} unit="gpm" />
        <ParamBlock label="Nozzle TFA (in²)" value={nozzleSize} set={setNozzleSize} min={5} max={40} step={0.5} unit="in²" />
        <MetricCard label="HSI" value={hsi.toFixed(2)} unit="hp/in²" />
        <MetricCard label="ECD" value={ecd.toFixed(1)} unit="ppg" />
        <MetricCard label="Annular Velocity" value={annularVelocity.toFixed(0)} unit="ft/min" />
        <MetricCard label="Bit ΔP" value={(flowRate * flowRate * 0.0001).toFixed(0)} unit="psi" />
      </div>
    </div>
  );
}

function DrillstringTab({ targetDepth }: { targetDepth: number }) {
  const [dpWeight, setDpWeight] = useState(19.5);
  const [dpGrade, setDpGrade] = useState('S-135');
  const stringWeight = targetDepth * dpWeight;
  const marginOfOverpull = stringWeight * 0.8;
  return (
    <div className="max-w-4xl">
      <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Drillstring Design & Torque/Drag</h3>
      <div className="grid grid-cols-2 gap-6">
        <ParamBlock label="DP Nominal Weight (lb/ft)" value={dpWeight} set={setDpWeight} min={10} max={30} step={0.5} unit="lb/ft" />
        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4">
          <label className="text-[10px] uppercase tracking-widest text-slate-500 block mb-2">DP Grade</label>
          <select value={dpGrade} onChange={e => setDpGrade(e.target.value)} className="bg-slate-800 text-white rounded px-3 py-2 text-sm w-full border border-white/10">
            <option value="G-105">G-105</option>
            <option value="S-135">S-135</option>
            <option value="V-150">V-150</option>
            <option value="Z-140">Z-140</option>
          </select>
        </div>
        <MetricCard label="String Weight" value={(stringWeight / 1000).toFixed(0)} unit="klbs" />
        <MetricCard label="Max Overpull" value={(marginOfOverpull / 1000).toFixed(0)} unit="klbs" />
      </div>
    </div>
  );
}

function CasingTab({ targetDepth, fractureGradient }: { targetDepth: number; fractureGradient: number }) {
  const [surfaceDepth, setSurfaceDepth] = useState(Math.round(targetDepth * 0.15));
  const [intermediateDepth, setIntermediateDepth] = useState(Math.round(targetDepth * 0.55));
  const surfaceBurst = surfaceDepth * 0.052 * 9;
  const productionBurst = targetDepth * 0.052 * 9;
  return (
    <div className="max-w-4xl">
      <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Casing Design & Load Cases</h3>
      <div className="grid grid-cols-2 gap-6">
        <ParamBlock label="Surface Casing Shoe (ft)" value={surfaceDepth} set={setSurfaceDepth} min={500} max={5000} step={50} unit="ft" />
        <ParamBlock label="Intermediate Shoe (ft)" value={intermediateDepth} set={setIntermediateDepth} min={2000} max={15000} step={50} unit="ft" />
        <MetricCard label="Surface Burst" value={surfaceBurst.toFixed(0)} unit="psi" />
        <MetricCard label="Production Burst" value={productionBurst.toFixed(0)} unit="psi" />
        <MetricCard label="Production Collapse" value={(targetDepth * 0.052 * 10).toFixed(0)} unit="psi" />
        <MetricCard label="Frac Gradient" value={(fractureGradient * targetDepth).toFixed(0)} unit="psi" color="text-cyan-400" />
      </div>
    </div>
  );
}

function PlanningTab({ plannedDays, plannedAfe, targetDepth }: { plannedDays: number; plannedAfe: number; targetDepth: number }) {
  const dailyCost = (plannedAfe * 1e6) / plannedDays;
  const costPerFoot = (plannedAfe * 1e6) / targetDepth;
  return (
    <div className="max-w-4xl">
      <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Well Planning & AFE Summary</h3>
      <div className="grid grid-cols-3 gap-6">
        <MetricCard label="Target Depth" value={targetDepth.toLocaleString()} unit="ft" color="text-cyan-400" />
        <MetricCard label="Planned Days" value={plannedDays.toString()} unit="days" />
        <MetricCard label="AFE Cost" value={`$${plannedAfe.toFixed(1)}`} unit="MM" color="text-emerald-400" />
        <MetricCard label="Daily Cost" value={`$${(dailyCost / 1000).toFixed(0)}`} unit="k/day" />
        <MetricCard label="Cost/Foot" value={`$${costPerFoot.toFixed(0)}`} unit="/ft" />
        <MetricCard label="Spread Rate" value={`$${(dailyCost / 24 / 3600).toFixed(0)}`} unit="/sec" color="text-amber-400" />
      </div>
    </div>
  );
}

function DirectionalTab({ targetDepth: _targetDepth }: { targetDepth: number }) {
  void _targetDepth;
  const [kop, setKop] = useState(Math.round(_targetDepth * 0.3));
  const [buildRate, setBuildRate] = useState(3);
  const [inclination, setInclination] = useState(45);
  const tvdAtEob = kop + (Math.sin(inclination * Math.PI / 180) / (buildRate / 100));
  return (
    <div className="max-w-4xl">
      <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Directional Drilling & Trajectory</h3>
      <div className="grid grid-cols-2 gap-6">
        <ParamBlock label="KOP (ft)" value={kop} set={setKop} min={500} max={10000} step={100} unit="ft" />
        <ParamBlock label="Build Rate (°/100ft)" value={buildRate} set={setBuildRate} min={1} max={8} step={0.5} unit="°/100ft" />
        <ParamBlock label="Inclination (°)" value={inclination} set={setInclination} min={0} max={90} step={1} unit="°" />
        <MetricCard label="TVD @EOB" value={tvdAtEob.toFixed(0)} unit="ft" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Reusable UI primitives
// ═══════════════════════════════════════════════════════════════════

function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-600">
      <Zap size={48} className="mb-4 opacity-30" />
      <span className="text-xs uppercase tracking-widest">{title}</span>
    </div>
  );
}

function ParamBlock({ label, value, set, min, max, step, unit }: {
  label: string;
  value: number;
  set: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}) {
  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4">
      <label className="text-[10px] uppercase tracking-widest text-slate-500 block mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => set(Number(e.target.value))}
          className="w-full accent-cyan-500"
        />
        <span className="text-white font-mono text-sm min-w-[60px] text-right">
          {value.toFixed(step < 1 ? 1 : 0)}{unit ? ` ${unit}` : ''}
        </span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, color }: { label: string; value: string; unit: string; color?: string }) {
  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{label}</div>
      <div className={cn('text-2xl font-black font-mono', color || 'text-white')}>
        {value}
        <span className="text-sm text-slate-500 ml-1">{unit}</span>
      </div>
    </div>
  );
}