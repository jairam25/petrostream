import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Anchor, Ship, Truck, Factory, Shield, DollarSign,
  Clock, Waves, Flame, Gauge, Zap, Radio, Calendar,
  Activity, AlertTriangle, CheckCircle, TrendingUp, Info,
  ChevronDown, ChevronUp, Download, FileText, Cog, MapPin,
  Compass, Thermometer, Droplets, Wind, HardHat, Crosshair,
  Layers, BarChart3, TrendingDown, Target, Eye, EyeOff,
  AlertCircle, Construction, Wrench, Hammer,
  Fuel, Droplet, Mountain, Home, Building2, Users,
  ArrowRight, ArrowUpRight, ZapOff, GaugeCircle, Scale,
  BarChart4
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  RIG_DATABASE, RigSpec, RigLocation, DrillingSection, AFEBreakdown, HSEPlan,
  recommendRig, calculateAFE, calculateTorqueDrag, calculateKickTolerance,
  estimateServiceCosts, generateHSEPlan, estimateSectionDays
} from '../../lib/rig_selection';
import { InputWithSlider } from '../SharedUI';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart as RechartsLineChart, Line, Legend, Area, AreaChart,
  PieChart as RechartsPieChart, Pie, Cell, RadialBarChart, RadialBar,
  ComposedChart as RechartsComposedChart, Scatter, ScatterChart,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Sankey,
  Treemap
} from 'recharts';

// ─── Props ──────────────────────────────────────────────────────────────

interface RigSelectionTabProps {
  mudInp: any;
  targetParams: any;
  setTargetParams: (v: any) => void;
  pressureProfile: any[];
}

// ─── Color scales ──────────────────────────────────────────────────────

const CYAN = '#06b6d4';
const ROSE = '#f43f5e';
const AMBER = '#f59e0b';
const EMERALD = '#10b981';
const VIOLET = '#8b5cf6';
const SLATE = '#64748b';
const TEAL = '#14b8a6';
const ORANGE = '#f97316';
const PINK = '#ec4899';
const INDIGO = '#6366f1';

const COLORS_8 = [CYAN, VIOLET, AMBER, EMERALD, ROSE, TEAL, ORANGE, PINK];
const GLASS_BG = 'bg-black/30 backdrop-blur-xl border border-white/5';
const GLASS_CARD = 'glass-card rounded-2xl p-6 border-white/5 bg-[#05070a]';
const SECTION_TITLE = 'text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4 italic';

// ─── Main Component ─────────────────────────────────────────────────────

export const RigSelectionTab: React.FC<RigSelectionTabProps> = ({
  mudInp, targetParams, setTargetParams, pressureProfile
}) => {
  const [activeView, setActiveView] = useState<'selector' | 'afe' | 'torque' | 'kick' | 'hse' | 'services' | 'timeline' | 'logistics' | 'rigspec'>('selector');
  const [locationType, setLocationType] = useState<RigLocation>('onshore');
  const [targetDepth, setTargetDepth] = useState(12000);
  const [waterDepth, setWaterDepth] = useState(500);
  const [maxPressure, setMaxPressure] = useState(7500);
  const [inclination, setInclination] = useState(25);
  const [azimuth, setAzimuth] = useState(135);
  const [frictionFactor, setFrictionFactor] = useState(0.28);
  const [containsH2S, setContainsH2S] = useState(false);
  const [nearUrban, setNearUrban] = useState(false);
  const [selectedRigId, setSelectedRigId] = useState<string>('');
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [rigFilterType, setRigFilterType] = useState<string>('all');

  // ─── Computed Data ──────────────────────────────────────────────────
  const currentMW = mudInp?.currentMW ?? 10.5;
  
  const rigRec = useMemo(() => recommendRig(targetDepth, waterDepth, maxPressure, locationType), [targetDepth, waterDepth, maxPressure, locationType]);
  const activeRig = useMemo(() => selectedRigId ? RIG_DATABASE.find(r => r.id === selectedRigId) : rigRec.primary, [selectedRigId, rigRec]);

  const sections: DrillingSection[] = useMemo(() => {
    const surfaceTop = 0;
    const surfaceBot = Math.min(3500, targetDepth * 0.22);
    const interTop = surfaceBot;
    const interBot = Math.min(9500, targetDepth * 0.65);
    const prodTop = interBot;
    const prodBot = targetDepth;
    const secs: DrillingSection[] = [
      { name: 'Conductor', holeSize_in: 24, casingSize_in: 20, depthFrom_ft: 0, depthTo_ft: Math.min(200, targetDepth * 0.03), mudWeight_ppg: 9.0, estimatedDays: 2, estimatedROP_ftHr: 60, bitType: 'Hole Opener / Milled Tooth', bhaType: 'Surface BHA', riskFactor: 1.05 },
      { name: 'Surface', holeSize_in: 17.5, casingSize_in: 13.375, depthFrom_ft: Math.min(200, targetDepth * 0.03), depthTo_ft: surfaceBot, mudWeight_ppg: 9.5, estimatedDays: 6, estimatedROP_ftHr: 50, bitType: 'Milled Tooth IADC 1-2', bhaType: 'Pendulum', riskFactor: 1.10 },
      { name: 'Intermediate', holeSize_in: 12.25, casingSize_in: 9.625, depthFrom_ft: surfaceBot, depthTo_ft: interBot, mudWeight_ppg: 10.5, estimatedDays: 14, estimatedROP_ftHr: 35, bitType: 'PDC 6-blade 16mm', bhaType: 'Packed Hole', riskFactor: 1.18 },
      { name: 'Production', holeSize_in: 8.5, casingSize_in: 7.0, depthFrom_ft: interBot, depthTo_ft: prodBot, mudWeight_ppg: currentMW, estimatedDays: 20, estimatedROP_ftHr: 22, bitType: 'PDC 8-blade 13mm', bhaType: 'Steerable Directional', riskFactor: 1.25 },
    ];
    return secs.filter(s => s.depthTo_ft > s.depthFrom_ft);
  }, [targetDepth, currentMW]);

  const selectedDayRate = useMemo(() => activeRig ? (activeRig.dayRateRange_low + activeRig.dayRateRange_high) / 2 : 35000, [activeRig]);
  const afe = useMemo(() => calculateAFE(sections, selectedDayRate, locationType, true, maxPressure), [sections, selectedDayRate, locationType, maxPressure]);
  const hsePlan = useMemo(() => generateHSEPlan(locationType, containsH2S, nearUrban), [locationType, containsH2S, nearUrban]);
  const totalDays = useMemo(() => sections.reduce((s, sec) => s + sec.estimatedDays * sec.riskFactor, 0), [sections]);
  const serviceCosts = useMemo(() => estimateServiceCosts(totalDays, true, true, true), [totalDays]);

  // ─── Torque/Drag depth profile ──────────────────────────────────────
  const torqueDragPoints = useMemo(() => {
    const points = [];
    for (let d = 0; d <= targetDepth; d += 300) {
      const fraction = d / Math.max(targetDepth, 1);
      const buildRate = 2.5; // deg/100ft
      const inc = Math.min(inclination, fraction * buildRate * (targetDepth / 100));
      points.push(calculateTorqueDrag(d, inc, azimuth, currentMW, frictionFactor, 5.0, 21.9));
    }
    return points;
  }, [targetDepth, inclination, azimuth, currentMW, frictionFactor]);

  // ─── Kick Tolerance ──────────────────────────────────────────────── 
  const kickTol = useMemo(() => calculateKickTolerance(
    sections.length > 1 ? sections[1]?.depthTo_ft ?? 3500 : 3500, targetDepth, currentMW, 0.75, 0.465, 12.25, 5.0
  ), [sections, targetDepth, currentMW]);

  // ─── Multi-depth kick tolerance ─────────────────────────────────▞──
  const kickDepthProfile = useMemo(() => {
    const pts = [];
    const shoe = sections.length > 1 ? sections[1].depthTo_ft : 3500;
    for (let d = shoe + 500; d <= targetDepth; d += 500) {
      const kt = calculateKickTolerance(shoe, d, currentMW, 0.75, 0.465, 12.25, 5.0);
      pts.push({ depth: d, kickVol: kt.kickVolume_bbl, maasp: kt.maxAllowableSurfacePressure_psi, safety_mgn: kt.safetyMargin_bbl });
    }
    return pts;
  }, [sections, targetDepth, currentMW]);

  // ─── Timeline ───────────────────────────────────────────────────────
  const timelineEstimate = useMemo(() => {
    return sections.map(s => ({
      ...s,
      ...estimateSectionDays(s.depthFrom_ft, s.depthTo_ft, s.estimatedROP_ftHr, 750, 18, 12, s.riskFactor),
    }));
  }, [sections]);
  const totalTimelineDays = useMemo(() => timelineEstimate.reduce((s, t) => s + t.totalDays, 0), [timelineEstimate]);

  // ─── Rig spec radar ─────────────────────────────────────────────────
  const rigSpecRadar = useMemo(() => {
    if (!activeRig) return [];
    const max = RIG_DATABASE.filter(r => r.location === locationType).reduce((mx, r) => ({
      depth: Math.max(mx.depth, r.maxDrillingDepth_ft),
      hook: Math.max(mx.hook, r.maxHookLoad_klb),
      hp: Math.max(mx.hp, r.drawworksHP),
      bop: Math.max(mx.bop, r.bopRating_psi),
      torque: Math.max(mx.torque, r.topDriveTorque_ftlb / 1000),
    }), { depth: 1, hook: 1, hp: 1, bop: 1, torque: 1 });
    return [
      { spec: 'Max Depth', value: (activeRig.maxDrillingDepth_ft / max.depth) * 100, full: activeRig.maxDrillingDepth_ft, unit: 'ft' },
      { spec: 'Hook Load', value: (activeRig.maxHookLoad_klb / max.hook) * 100, full: activeRig.maxHookLoad_klb, unit: 'klb' },
      { spec: 'Drawworks', value: (activeRig.drawworksHP / max.hp) * 100, full: activeRig.drawworksHP, unit: 'HP' },
      { spec: 'BOP Rating', value: (activeRig.bopRating_psi / max.bop) * 100, full: activeRig.bopRating_psi, unit: 'psi' },
      { spec: 'Top Drive', value: (activeRig.topDriveTorque_ftlb / Math.max(1, max.torque) / 1000) * 100, full: activeRig.topDriveTorque_ftlb, unit: 'ft-lb' },
      { spec: 'Water Dpth', value: locationType === 'offshore' ? (activeRig.maxWaterDepth_ft / 12000) * 100 : 0, full: activeRig.maxWaterDepth_ft, unit: 'ft' },
    ];
  }, [activeRig, locationType]);

  // ─── Cost breakdown by category for treemap ────────────────────────
  const costTreemap = useMemo(() => {
    const cats: Record<string, { name: string; items: any[]; total: number }> = {};
    afe.breakdown.forEach(b => {
      if (!cats[b.category]) cats[b.category] = { name: b.category, items: [], total: 0 };
      cats[b.category].items.push(b);
      cats[b.category].total += b.cost;
    });
    return Object.values(cats).map(c => ({ name: c.name.toUpperCase(), value: c.total, color: c.name === 'tangible' ? CYAN : c.name === 'intangible' ? VIOLET : c.name === 'service' ? AMBER : EMERALD }));
  }, [afe]);

  // ─── Rig comparison table ───────────────────────────────────────────
  const filteredRigs = useMemo(() => {
    let rigs = RIG_DATABASE.filter(r => r.location === locationType);
    if (rigFilterType !== 'all') rigs = rigs.filter(r => r.type === rigFilterType);
    return rigs;
  }, [locationType, rigFilterType]);

  const activeViewKey = activeView;

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* ─── HEADER ──────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-4">
            <Anchor className="text-cyan-500" size={36} />
            Rig <span className="text-cyan-500/50">Selection & Logistics</span>
          </h2>
          <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-widest italic">
            AFE Costing • HAZID/HSE • Torque/Drag • Kick Tolerance • Rig Specs • Timeline
          </p>
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit backdrop-blur-md flex-wrap gap-1">
          {[
            { id: 'selector', name: 'Rig DB', icon: Ship },
            { id: 'rigspec', name: 'Specs', icon: Gauge },
            { id: 'afe', name: 'AFE', icon: DollarSign },
            { id: 'torque', name: 'T&D', icon: Activity },
            { id: 'kick', name: 'Kick', icon: AlertTriangle },
            { id: 'hse', name: 'HSE', icon: Shield },
            { id: 'services', name: 'Svcs', icon: Cog },
            { id: 'logistics', name: 'Logistics', icon: Truck },
            { id: 'timeline', name: 'Timeline', icon: Calendar },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveView(t.id as any)}
              className={cn(
                "px-3 py-2 rounded-[14px] flex items-center gap-1.5 transition-all text-[11px] font-black uppercase tracking-widest",
                activeView === t.id ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20" : "text-slate-500 hover:text-white hover:bg-white/5"
              )}
            >
              <t.icon size={13} />{t.name}
            </button>
          ))}
        </div>
      </div>

      {/* ─── QUICK STATS ROW ─────────────────────────────────────────── */}
      {activeRig && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <QuickBadge icon={Anchor} label="Active Rig" value={activeRig.name} color={CYAN} />
          <QuickBadge icon={DollarSign} label="Day Rate" value={`$${Math.round((activeRig.dayRateRange_low + activeRig.dayRateRange_high) / 2000)}K`} color={EMERALD} />
          <QuickBadge icon={Gauge} label="Max Depth" value={`${(activeRig.maxDrillingDepth_ft / 1000).toFixed(0)}K ft`} color={AMBER} />
          <QuickBadge icon={Shield} label="BOP" value={`${activeRig.bopRating_psi / 1000}K psi`} color={ROSE} />
          <QuickBadge icon={Clock} label="Est. Duration" value={`${totalTimelineDays.toFixed(0)} days`} color={VIOLET} />
          <QuickBadge icon={DollarSign} label="AFE Total" value={`$${(afe.totalCost / 1e6).toFixed(1)}M`} color={TEAL} />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={activeViewKey} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
          
          {/* ═══════════ RIG SELECTOR ═══════════════════════════════════════ */}
          {activeView === 'selector' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <div className={cn(GLASS_CARD, 'bg-black/40')}>
                  <h4 className={SECTION_TITLE}>Well Parameters</h4>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 uppercase font-bold flex items-center gap-1.5"><MapPin size={11} />Location</span>
                      <div className="flex gap-1">
                        <button onClick={() => { setLocationType('onshore'); setWaterDepth(0); setSelectedRigId(''); }} className={cn("px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all", locationType === 'onshore' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "bg-white/5 text-slate-500 hover:bg-white/10")}>Onshore</button>
                        <button onClick={() => { setLocationType('offshore'); setWaterDepth(500); setSelectedRigId(''); }} className={cn("px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all", locationType === 'offshore' ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-white/5 text-slate-500 hover:bg-white/10")}>Offshore</button>
                      </div>
                    </div>
                    <InputWithSlider label="Target Depth" value={targetDepth} min={2000} max={40000} step={500} unit="ft" onChange={setTargetDepth} />
                    {locationType === 'offshore' && <InputWithSlider label="Water Depth" value={waterDepth} min={50} max={12000} step={100} unit="ft" onChange={setWaterDepth} />}
                    <InputWithSlider label="Max BHP (Pressure)" value={maxPressure} min={3000} max={25000} step={500} unit="psi" onChange={setMaxPressure} />
                    <InputWithSlider label="Mud Weight" value={currentMW} min={8.3} max={18} step={0.1} unit="ppg" onChange={() => {}} disabled />
                  </div>
                </div>
                
                {/* Recommended Rig */}
                <motion.div 
                  initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                  className="p-5 bg-gradient-to-br from-cyan-500/10 to-blue-600/5 border border-cyan-500/20 rounded-[24px]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={14} className="text-cyan-400" />
                    <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest italic">Recommended</h4>
                  </div>
                  <p className="text-sm font-black text-white">{rigRec.primary.name}</p>
                  <p className="text-[11px] text-cyan-400 mt-1 font-mono">${rigRec.primary.dayRateRange_low.toLocaleString()} - ${rigRec.primary.dayRateRange_high.toLocaleString()}/day</p>
                  <div className="mt-2 space-y-1">
                    {rigRec.justification.slice(0, 2).map((j, i) => (
                      <p key={i} className="text-[10px] text-slate-500 leading-relaxed">{j}</p>
                    ))}
                  </div>
                </motion.div>

                {/* Alternatives */}
                {rigRec.alternatives.length > 0 && (
                  <div className="p-4 bg-white/5 border border-white/5 rounded-[20px]">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alternatives</h4>
                    {rigRec.alternatives.map((alt, i) => (
                      <div key={i} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-[11px] text-white font-bold">{alt.name}</span>
                        <span className="text-[10px] text-slate-400">${Math.round(alt.dayRateRange_low / 1000)}K</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="lg:col-span-9">
                <div className={cn(GLASS_CARD, 'min-h-[650px]')}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                    <h4 className={SECTION_TITLE}>Rig Database ({filteredRigs.length} rigs)</h4>
                    <div className="flex gap-1.5 flex-wrap">
                      {['all', ...Array.from(new Set(RIG_DATABASE.filter(r => r.location === locationType).map(r => r.type)))].map(t => (
                        <button
                          key={t}
                          onClick={() => setRigFilterType(t)}
                          className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all", rigFilterType === t ? "bg-cyan-600 text-white" : "bg-white/5 text-slate-500 hover:text-white")}
                        >
                          {t.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto custom-scrollbar max-h-[550px]">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-[#05070a]/95 backdrop-blur-sm z-10">
                        <tr className="border-b border-white/10">
                          {['Rig Name', 'Type', 'Max Dpth', 'Hook', 'DW HP', 'Mud HP', 'BOP', 'Day Rate', 'Water', 'Year', ''].map(h => (
                            <th key={h} className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRigs.map((rig) => {
                          const isSelected = (activeRig?.id === rig.id);
                          const isRecommended = rig.id === rigRec.primary.id;
                          return (
                            <tr
                              key={rig.id}
                              className={cn(
                                "border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer",
                                isRecommended && "bg-cyan-500/5",
                                isSelected && "bg-amber-500/5 border-l-2 border-l-amber-400"
                              )}
                              onClick={() => setSelectedRigId(selectedRigId === rig.id ? '' : rig.id)}
                            >
                              <td className="py-3 px-1 text-[11px] font-black text-white uppercase whitespace-nowrap">
                                {rig.name}
                                {isRecommended && <span className="ml-1.5 px-1 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] rounded-full font-bold uppercase align-middle">BEST</span>}
                                {isSelected && <span className="ml-1.5 px-1 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded-full font-bold uppercase align-middle">SEL</span>}
                              </td>
                              <td className="py-3 px-1 text-[10px] text-slate-400 whitespace-nowrap">{rig.type.replace(/_/g, ' ')}</td>
                              <td className="py-3 px-1 text-[10px] text-slate-400 whitespace-nowrap text-right">{(rig.maxDrillingDepth_ft / 1000).toFixed(0)}K</td>
                              <td className="py-3 px-1 text-[10px] text-slate-400 whitespace-nowrap text-right">{rig.maxHookLoad_klb}</td>
                              <td className="py-3 px-1 text-[10px] text-slate-400 whitespace-nowrap text-right">{rig.drawworksHP}</td>
                              <td className="py-3 px-1 text-[10px] text-slate-400 whitespace-nowrap text-right">{rig.mudPumpHP}</td>
                              <td className="py-3 px-1 text-[10px] font-bold whitespace-nowrap text-right" style={{ color: rig.bopRating_psi >= maxPressure ? EMERALD : ROSE }}>{rig.bopRating_psi / 1000}K</td>
                              <td className="py-3 px-1 text-[10px] text-slate-400 whitespace-nowrap text-right">${Math.round(rig.dayRateRange_low / 1000)}-${Math.round(rig.dayRateRange_high / 1000)}K</td>
                              <td className="py-3 px-1 text-[10px] text-slate-400 whitespace-nowrap text-right">{rig.maxWaterDepth_ft > 0 ? rig.maxWaterDepth_ft : '-'}</td>
                              <td className="py-3 px-1 text-[10px] text-slate-500 whitespace-nowrap text-right">{rig.yearBuilt}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ RIG SPEC RADAR ═══════════════════════════════════════ */}
          {activeView === 'rigspec' && activeRig && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <div className={cn(GLASS_CARD, 'min-h-[600px]')}>
                  <h4 className={SECTION_TITLE}>Rig Specification</h4>
                  <div className="space-y-3">
                    <SpecRow icon={Anchor} label="Name" value={activeRig.name} color={CYAN} />
                    <SpecRow icon={Factory} label="Manufacturer" value={activeRig.manufacturer} color={SLATE} />
                    <SpecRow icon={Calendar} label="Year Built" value={String(activeRig.yearBuilt)} color={AMBER} />
                    <SpecRow icon={HardHat} label="Type" value={activeRig.type.replace(/_/g, ' ')} color={VIOLET} />
                    <SpecRow icon={TrendingUp} label="Max Drill Depth" value={`${activeRig.maxDrillingDepth_ft.toLocaleString()} ft`} color={CYAN} />
                    <SpecRow icon={Compass} label="Max Water Depth" value={activeRig.maxWaterDepth_ft > 0 ? `${activeRig.maxWaterDepth_ft.toLocaleString()} ft` : 'N/A (Land)'} color={CYAN} />
                    <hr className="border-white/5" />
                    <SpecRow icon={Zap} label="Drawworks HP" value={`${activeRig.drawworksHP} HP`} color={AMBER} />
                    <SpecRow icon={Droplets} label="Mud Pumps" value={`${activeRig.mudPumpCount} × ${activeRig.mudPumpHP} HP`} color={TEAL} />
                    <SpecRow icon={Gauge} label="Pump Pressure" value={`${activeRig.maxPumpPressure_psi.toLocaleString()} psi`} color={ROSE} />
                    <SpecRow icon={Waves} label="Flow Rate" value={`${activeRig.maxFlowRate_gpm} gpm`} color={CYAN} />
                    <hr className="border-white/5" />
                    <SpecRow icon={Shield} label="BOP Rating" value={`${activeRig.bopRating_psi.toLocaleString()} psi`} color={ROSE} />
                    <SpecRow icon={Anchor} label="Hook Load" value={`${activeRig.maxHookLoad_klb} klb`} color={AMBER} />
                    <SpecRow icon={Activity} label="Top Drive Torque" value={`${activeRig.topDriveTorque_ftlb.toLocaleString()} ft-lb`} color={VIOLET} />
                    <SpecRow icon={Building2} label="Derrick" value={`${activeRig.derrickHeight_ft} ft / ${activeRig.derrickCapacity_klb} klb`} color={SLATE} />
                    <hr className="border-white/5" />
                    <SpecRow icon={Users} label="Crew" value={`${activeRig.crewSize} persons`} color={EMERALD} />
                    <SpecRow icon={Home} label="Quarters" value={`${activeRig.quartersCapacity} beds`} color={INDIGO} />
                    <SpecRow icon={Fuel} label="Fuel" value={`${activeRig.fuelConsumption_galPerDay.toLocaleString()} gal/day`} color={ORANGE} />
                    <SpecRow icon={Truck} label="Mobilization" value={`$${activeRig.mobilizationCost.toLocaleString()}`} color={PINK} />
                    <SpecRow icon={Wrench} label="Pipe Handling" value={activeRig.pipeHandling.replace(/_/g, ' ')} color={TEAL} />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8 space-y-6">
                <div className={cn(GLASS_CARD, 'min-h-[350px]')}>
                  <h4 className={SECTION_TITLE}>Capability Radar (vs Class Max)</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={rigSpecRadar}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="spec" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 7 }} />
                      <Radar name={activeRig.name} dataKey="value" stroke={CYAN} fill={CYAN} fillOpacity={0.25} strokeWidth={2} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                        formatter={(value: any, _: any, props: any) => [`${props.payload.full?.toLocaleString()} ${props.payload.unit}`, props.payload.spec]} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {rigSpecRadar.map((spec, i) => (
                    <motion.div
                      key={spec.spec}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="p-4 rounded-2xl border border-white/5 bg-white/5"
                    >
                      <p className="text-[11px] text-slate-500 uppercase font-bold mb-1">{spec.spec}</p>
                      <div className="h-2 bg-white/5 rounded-full mb-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${spec.value}%` }}
                          transition={{ delay: 0.3 + i * 0.08, duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${COLORS_8[i]}, ${COLORS_8[(i+1)%8]})` }}
                        />
                      </div>
                      <p className="text-xs font-black text-white">{spec.full?.toLocaleString()} {spec.unit}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ AFE CALCULATOR ═══════════════════════════════════════ */}
          {activeView === 'afe' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <div className={cn(GLASS_CARD, 'min-h-[600px]')}>
                  <h4 className={SECTION_TITLE}>AFE Cost Breakdown</h4>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                    {afe.breakdown.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex justify-between items-center py-2 border-b border-white/5"
                      >
                        <div>
                          <p className="text-[11px] text-white font-bold">{item.item}</p>
                          <p className="text-[10px] text-slate-500">{item.notes}</p>
                        </div>
                        <span className="text-[10px] text-white font-black shrink-0 ml-3">${item.cost.toLocaleString()}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Sub-Total</span>
                      <span className="text-[10px] text-white font-black">${(afe.totalCost - afe.contingency).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-amber-400 uppercase font-bold">Contingency (15%)</span>
                      <span className="text-[10px] text-amber-400 font-black">${afe.contingency.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/5">
                      <span className="text-sm text-white uppercase font-black">Total AFE</span>
                      <span className="text-base text-cyan-400 font-black">${afe.totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8 grid grid-cols-1 gap-6">
                <div className={cn(GLASS_CARD)}>
                  <h4 className={SECTION_TITLE}>Cost Distribution (Donut)</h4>
                  <ResponsiveContainer width="100%" height={280}>
                    <RechartsPieChart>
                      <Pie data={costTreemap} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={6} dataKey="value" label={({ name, value }) => `${name}: $${(value / 1e6).toFixed(1)}M`}>
                        {costTreemap.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px', color: '#fff' }} formatter={(v: any) => `$${v.toLocaleString()}`} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', color: '#94a3b8' }} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className={cn(GLASS_CARD)}>
                  <h4 className={SECTION_TITLE}>Cost by Category (Bar)</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={costTreemap}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={v => `$${(v/1e6).toFixed(0)}M`} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} formatter={(v: any) => `$${v.toLocaleString()}`} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {costTreemap.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TORQUE & DRAG ═══════════════════════════════════════ */}
          {activeView === 'torque' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <div className={cn(GLASS_CARD, 'bg-black/40')}>
                  <h4 className={SECTION_TITLE}>T&D Parameters</h4>
                  <div className="space-y-5">
                    <InputWithSlider label="Inclination" value={inclination} min={0} max={90} step={1} unit="°" onChange={setInclination} />
                    <InputWithSlider label="Azimuth" value={azimuth} min={0} max={360} step={5} unit="°" onChange={setAzimuth} />
                    <InputWithSlider label="Friction Factor" value={frictionFactor} min={0.10} max={0.50} step={0.01} unit="" onChange={setFrictionFactor} />
                    <InputWithSlider label="Pipe OD" value={5.0} min={3.5} max={7.0} step={0.5} unit="in" onChange={() => {}} disabled />
                    <InputWithSlider label="Pipe WL" value={21.9} min={13} max={30} step={0.5} unit="lb/ft" onChange={() => {}} disabled />
                  </div>
                </div>
                {torqueDragPoints.length > 0 && (() => {
                  const td = torqueDragPoints[torqueDragPoints.length - 1];
                  const q75 = torqueDragPoints[Math.floor(torqueDragPoints.length * 0.75)];
                  const q50 = torqueDragPoints[Math.floor(torqueDragPoints.length * 0.50)];
                  return (
                    <div className="space-y-3">
                      <div className="p-5 bg-cyan-500/5 border border-cyan-500/10 rounded-[24px]">
                        <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest mb-3 italic">At Total Depth ({targetDepth} ft)</h4>
                        <InfoRow label="Torque" value={`${td.torque_ftlb.toLocaleString()} ft-lb`} />
                        <InfoRow label="Drag (HOOK)" value={`${td.drag_klb?.toFixed(1)} klb`} />
                        <InfoRow label="Tension" value={`${td.tension_klb?.toFixed(1)} klb`} />
                        <InfoRow label="Buckling Risk" value={td.bucklingRisk} color={td.bucklingRisk === 'Helical' ? ROSE : td.bucklingRisk === 'Sinusoidal' ? AMBER : EMERALD} />
                      </div>
                      <div className="p-4 bg-white/5 border border-white/5 rounded-[20px]">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mid-point (50%)</h4>
                        <InfoRow label="Torque" value={`${q50?.torque_ftlb?.toLocaleString() ?? '-'} ft-lb`} />
                        <InfoRow label="Drag" value={`${q50?.drag_klb?.toFixed(1) ?? '-'} klb`} />
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="lg:col-span-9">
                <div className={cn(GLASS_CARD, 'min-h-[650px]')}>
                  <h4 className={SECTION_TITLE}>Torque & Drag vs Depth</h4>
                  <div className="grid grid-cols-1 gap-8">
                    <div>
                      <h5 className="text-[11px] text-slate-500 uppercase font-bold mb-3 flex items-center gap-2"><Activity size={12} className="text-amber-400" />Torque (ft-lb)</h5>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={torqueDragPoints}>
                          <defs><linearGradient id="torqueGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={AMBER} stopOpacity={0.3} /><stop offset="95%" stopColor={AMBER} stopOpacity={0.02} /></linearGradient></defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="depth_ft" stroke="#64748b" tick={{ fontSize: 9 }} />
                          <YAxis stroke="#64748b" tick={{ fontSize: 9 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px', color: '#fff' }} />
                          <Area type="monotone" dataKey="torque_ftlb" stroke={AMBER} fill="url(#torqueGrad)" strokeWidth={2} name="Torque" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h5 className="text-[11px] text-slate-500 uppercase font-bold mb-3 flex items-center gap-2"><TrendingDown size={12} className="text-cyan-400" />Drag & Tension (klb)</h5>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsLineChart data={torqueDragPoints}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="depth_ft" stroke="#64748b" tick={{ fontSize: 9 }} />
                          <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px', color: '#fff' }} />
                          <Legend wrapperStyle={{ fontSize: '9px' }} />
                          <Line type="monotone" dataKey="drag_klb" stroke={ROSE} strokeWidth={2} dot={false} name="Drag (klb)" />
                          <Line type="monotone" dataKey="tension_klb" stroke={CYAN} strokeWidth={2} dot={false} name="Tension (klb)" />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Buckling Risk Indicator */}
                  <div className="mt-6 p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Buckling Risk Profile</h5>
                    <div className="flex gap-3">
                      {torqueDragPoints.filter(p => p.bucklingRisk !== 'None').slice(0, 5).map((p, i) => (
                        <div key={i} className="flex-1 p-2 rounded-xl text-center" style={{ backgroundColor: p.bucklingRisk === 'Helical' ? '#f43f5e20' : '#f59e0b20' }}>
                          <p className="text-[10px] text-slate-500">{p.depth_ft} ft</p>
                          <p className="text-[10px] font-black" style={{ color: p.bucklingRisk === 'Helical' ? ROSE : AMBER }}>{p.bucklingRisk}</p>
                        </div>
                      ))}
                      {torqueDragPoints.filter(p => p.bucklingRisk !== 'None').length === 0 && (
                        <p className="text-[11px] text-emerald-400">✓ No buckling risk detected — drill string stable throughout</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ KICK TOLERANCE ═══════════════════════════════════════ */}
          {activeView === 'kick' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <div className={cn(GLASS_CARD, 'bg-black/40')}>
                  <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-5 italic flex items-center gap-2"><AlertTriangle size={14} />Well Control</h4>
                  <div className="space-y-4">
                    <InputWithSlider label="Shoe Depth" value={sections[1]?.depthTo_ft ?? 3500} min={500} max={20000} step={500} unit="ft" onChange={() => {}} disabled />
                    <InputWithSlider label="Hole TVD" value={targetDepth} min={500} max={40000} step={500} unit="ft" onChange={setTargetDepth} />
                    <InputWithSlider label="Frac Gradient" value={0.75} min={0.55} max={0.95} step={0.01} unit="psi/ft" onChange={() => {}} disabled />
                    <InputWithSlider label="Pore Gradient" value={0.465} min={0.43} max={0.52} step={0.001} unit="psi/ft" onChange={() => {}} disabled />
                  </div>
                </div>
                <div className="p-5 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                  <h4 className="text-[11px] font-black text-rose-400 uppercase tracking-widest mb-4 italic flex items-center gap-2"><Crosshair size={13} />Results</h4>
                  <InfoRow label="Kick Volume" value={`${kickTol.kickVolume_bbl} bbl`} color={CYAN} />
                  <InfoRow label="Safety Margin" value={`${kickTol.safetyMargin_bbl} bbl`} color={AMBER} />
                  <InfoRow label="MAASP" value={`${kickTol.maxAllowableSurfacePressure_psi} psi`} color={ROSE} />
                  <InfoRow label="Kill MW" value={`${kickTol.killMudWeight_ppg} ppg`} color={EMERALD} />
                  <InfoRow label="Frac @ Shoe" value={`${(0.75 * (sections[1]?.depthTo_ft ?? 3500)).toFixed(0)} psi`} color={SLATE} />
                </div>
              </div>
              <div className="lg:col-span-9">
                <div className={cn(GLASS_CARD, 'min-h-[300px]')}>
                  <h4 className={SECTION_TITLE}>Kick Volume Profile vs Depth</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsComposedChart data={kickDepthProfile}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="depth" stroke="#64748b" tick={{ fontSize: 9 }} label={{ value: 'Depth (ft)', position: 'insideBottom', offset: -5, style: { fill: '#64748b', fontSize: 9 } }} />
                      <YAxis yAxisId="left" stroke={CYAN} tick={{ fontSize: 9 }} label={{ value: 'Volume (bbl)', angle: -90, position: 'insideLeft', style: { fill: CYAN, fontSize: 8 } }} />
                      <YAxis yAxisId="right" orientation="right" stroke={ROSE} tick={{ fontSize: 9 }} label={{ value: 'Pressure (psi)', angle: 90, position: 'insideRight', style: { fill: ROSE, fontSize: 8 } }} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px', color: '#fff' }} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="kickVol" fill={ROSE} fillOpacity={0.7} radius={[4, 4, 0, 0]} name="Kick Vol (bbl)" />
                      <Line yAxisId="right" type="monotone" dataKey="maasp" stroke={CYAN} strokeWidth={2} dot={{ r: 3 }} name="MAASP (psi)" />
                      <Area yAxisId="left" type="monotone" dataKey="safety_mgn" stroke={AMBER} fill={AMBER} fillOpacity={0.15} name="Safety Margin (bbl)" />
                    </RechartsComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 p-6 bg-white/5 border border-white/5 rounded-2xl">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><BarChart3 size={13} />Driller's Well Control Steps</h5>
                  <div className="space-y-2">
                    {[
                      '1. Determine shoe strength via LOT (Leak-Off Test) — record surface pressure and mud density',
                      '2. Calculate MAASP = (Frac Gradient − MW) × 0.052 × Shoe TVD (vertical depth)',
                      '3. Determine maximum gas influx height that can be tolerated at the shoe',
                      '4. Convert influx height to volume: Volume (bbl) = Height (ft) × Annular Capacity (bbl/ft)',
                      '5. Apply operational safety factor of 0.8 to calculated kick volume',
                      `6. Shoe LOT Pressure: ${(0.75 * (sections[1]?.depthTo_ft ?? 3500) - 0.052 * currentMW * (sections[1]?.depthTo_ft ?? 3500)).toFixed(0)} psi  |  Kill MW: ${kickTol.killMudWeight_ppg} ppg  |  MAASP: ${kickTol.maxAllowableSurfacePressure_psi} psi`,
                    ].map((step, i) => (
                      <p key={i} className="text-[10px] text-slate-400">{step}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ HSE PLANNING ═══════════════════════════════════════ */}
          {activeView === 'hse' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <div className={cn(GLASS_CARD, 'bg-black/40')}>
                  <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-5 italic flex items-center gap-2"><Shield size={14} />Risk Profile</h4>
                  <div className="space-y-4">
                    <ToggleRow label="H₂S Present" active={containsH2S} onChange={() => setContainsH2S(!containsH2S)} activeColor="rose" />
                    <ToggleRow label="Near Urban" active={nearUrban} onChange={() => setNearUrban(!nearUrban)} activeColor="amber" />
                    <ToggleRow label={locationType === 'offshore' ? 'Offshore Ops' : 'Onshore Ops'} active={true} onChange={() => {}} activeColor="blue" readOnly />
                  </div>
                </div>
                
                {/* Risk Summary */}
                <div className="p-5 bg-gradient-to-br from-rose-500/5 to-amber-500/5 border border-white/5 rounded-[24px]">
                  <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-widest mb-3">Risk Summary</h4>
                  {(() => {
                    const highRisks = hsePlan.hazidRisks.filter(r => r.likelihood * r.consequence >= 10);
                    const medRisks = hsePlan.hazidRisks.filter(r => r.likelihood * r.consequence >= 6 && r.likelihood * r.consequence < 10);
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px]"><span className="text-rose-400 font-bold">HIGH ({highRisks.length})</span><span className="text-rose-400">Risk ≥ 10</span></div>
                        <div className="flex justify-between text-[10px]"><span className="text-amber-400 font-bold">MEDIUM ({medRisks.length})</span><span className="text-amber-400">Risk 6-9</span></div>
                        <div className="flex justify-between text-[10px]"><span className="text-emerald-400 font-bold">LOW ({hsePlan.hazidRisks.length - highRisks.length - medRisks.length})</span><span className="text-emerald-400">{'Risk < 6'}</span></div>
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="lg:col-span-9">
                <div className={cn(GLASS_CARD, 'min-h-[350px]')}>
                  <h4 className={SECTION_TITLE}>HAZID Risk Assessment Matrix</h4>
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-[#05070a]">
                        <tr className="border-b border-white/10">
                          {['Hazard', 'L', 'C', 'Risk', 'Level', 'Mitigation'].map(h => (
                            <th key={h} className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {hsePlan.hazidRisks.map((r, i) => {
                          const riskScore = r.likelihood * r.consequence;
                          const level = riskScore >= 15 ? 'CRITICAL' : riskScore >= 10 ? 'HIGH' : riskScore >= 6 ? 'MEDIUM' : 'LOW';
                          const lvlColor = level === 'CRITICAL' ? PINK : level === 'HIGH' ? ROSE : level === 'MEDIUM' ? AMBER : EMERALD;
                          return (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-3 px-1 text-[11px] text-white font-bold max-w-[180px]">{r.hazard}</td>
                              <td className="py-3 px-1 text-[11px] text-slate-400 text-center">{r.likelihood}</td>
                              <td className="py-3 px-1 text-[11px] text-slate-400 text-center">{r.consequence}</td>
                              <td className="py-3 px-1 text-[10px] font-black text-center" style={{ color: lvlColor }}>{riskScore}</td>
                              <td className="py-3 px-1 text-[10px] font-bold text-center"><span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: lvlColor + '30', color: lvlColor }}>{level}</span></td>
                              <td className="py-3 px-1 text-[10px] text-slate-400 max-w-[280px]">{r.mitigation}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                    <h5 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-3">Emergency Response Plan</h5>
                    <div className="space-y-1.5">
                      {hsePlan.emergencyProcedures.map((p, i) => (
                        <p key={i} className="text-[10px] text-slate-400 leading-relaxed">• {p}</p>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                      <h5 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest mb-2">Shallow Gas Contingency</h5>
                      <p className="text-[10px] text-slate-400 italic leading-relaxed">{hsePlan.shallowGasProcedure}</p>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                      <h5 className="text-[11px] font-black text-rose-400 uppercase tracking-widest mb-2">Oil Spill Contingency</h5>
                      <p className="text-[10px] text-slate-400 italic leading-relaxed">{hsePlan.oilSpillContingency}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ SERVICES ═══════════════════════════════════════ */}
          {activeView === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <div className={cn(GLASS_CARD, 'min-h-[600px]')}>
                  <h4 className={SECTION_TITLE}>Service Company Contracts</h4>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {serviceCosts.map((svc, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex justify-between items-center py-3 border-b border-white/5"
                      >
                        <div>
                          <p className="text-[10px] text-white font-bold">{svc.item}</p>
                          {svc.dailyCost > 0 && <p className="text-[10px] text-slate-500">${svc.dailyCost.toLocaleString()}/day × {totalDays.toFixed(0)} days</p>}
                        </div>
                        <span className="text-[10px] text-cyan-400 font-black shrink-0 ml-4">${svc.totalCost.toLocaleString()}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-white uppercase font-black">Total Services</span>
                      <p className="text-[10px] text-slate-500">Over {totalDays.toFixed(0)} total rig days</p>
                    </div>
                    <span className="text-base text-cyan-400 font-black">${serviceCosts.reduce((s, c) => s + c.totalCost, 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 space-y-6">
                <div className={cn(GLASS_CARD)}>
                  <h4 className={SECTION_TITLE}>Service Cost Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={serviceCosts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" stroke="#64748b" tick={{ fontSize: 8 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                      <YAxis type="category" dataKey="item" stroke="#64748b" tick={{ fontSize: 8, fill: '#94a3b8' }} width={140} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} formatter={(v: any) => `$${v.toLocaleString()}`} />
                      <Bar dataKey="totalCost" radius={[0, 8, 8, 0]}>
                        {serviceCosts.map((_, i) => <Cell key={i} fill={COLORS_8[i % COLORS_8.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ LOGISTICS ═══════════════════════════════════════ */}
          {activeView === 'logistics' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <div className={cn(GLASS_CARD, 'min-h-[500px]')}>
                  <h4 className={SECTION_TITLE}>Logistics & Infrastructure</h4>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <StatCard icon={Truck} label="Mobilization" value={`$${activeRig?.mobilizationCost.toLocaleString() ?? '-'}`} color={AMBER} />
                    <StatCard icon={Fuel} label="Fuel/Day" value={`${activeRig?.fuelConsumption_galPerDay.toLocaleString() ?? '-'} gal`} color={ROSE} />
                    <StatCard icon={Ship} label={locationType === 'offshore' ? 'Supply Vsl' : 'H₂O Trucks'} value={locationType === 'offshore' ? '2–3 PSVs' : '3–5 Trucks'} color={CYAN} />
                    <StatCard icon={Users} label="Crew Size" value={`${activeRig?.crewSize ?? '-'} persons`} color={EMERALD} />
                    <StatCard icon={Home} label="Camp/Quarters" value={`${activeRig?.quartersCapacity ?? '-'} beds`} color={VIOLET} />
                    <StatCard icon={Wrench} label="Pipe Handling" value={activeRig?.pipeHandling?.replace('_', ' ') ?? '-'} color={ORANGE} />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8">
                <div className={cn(GLASS_CARD, 'min-h-[500px]')}>
                  <h4 className={SECTION_TITLE}>Support Infrastructure Requirements</h4>
                  {locationType === 'offshore' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { title: 'Shore Base', items: ['Laydown yard & warehouse', 'Bulk material storage (barite, cement)', 'Fuel depot', 'Office & comms center'], icon: Building2, color: CYAN },
                        { title: 'Marine Support', items: ['2 × Platform Supply Vessels (PSV)', '1 × Standby vessel on station', 'AHTS for rig moves', 'Fuel/water resupply schedule'], icon: Ship, color: CYAN },
                        { title: 'Aviation', items: ['Helicopter crew change (weekly)', 'Medevac standby', 'Cargo basket operations', 'Helideck certified to CAP 437'], icon: Radio, color: EMERALD },
                        { title: 'Environmental', items: ['Waste management & skip & ship', 'Cuttings re-injection / disposal', 'Oil spill response kit on board', 'Emissions monitoring'], icon: Droplets, color: TEAL },
                      ].map((grp, i) => (
                        <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                          <h5 className="text-[11px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: COLORS_8[i] }}>
                            <grp.icon size={12} color={COLORS_8[i]} /> {grp.title}
                          </h5>
                          {grp.items.map((it, j) => (
                            <p key={j} className="text-[10px] text-slate-400 leading-relaxed">• {it}</p>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { title: 'Civil Works', items: ['Access road construction & maintenance', 'Well pad levelling & compaction', 'Cellar & conductor pipe installation', 'Fencing & security perimeter'], icon: Construction, color: AMBER },
                        { title: 'Utilities', items: ['Water well or trucked supply', 'Power generation (diesel gensets)', 'Fuel storage & handling', 'Camp & catering facilities'], icon: Zap, color: AMBER },
                        { title: 'Waste Management', items: ['Reserve pit excavation & lining', 'Cuttings burial / land farming', 'Waste water disposal well', 'Solid waste skip & disposal'], icon: Droplets, color: TEAL },
                        { title: 'Site Support', items: ['Communications (VSAT / LTE)', 'Crane & forklift on site', 'Pipe racks & casing storage', 'Security & HSE station'], icon: Radio, color: EMERALD },
                      ].map((grp, i) => (
                        <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                          <h5 className="text-[11px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: COLORS_8[(i + 4) % 8] }}>
                            <grp.icon size={12} /> {grp.title}
                          </h5>
                          {grp.items.map((it, j) => (
                            <p key={j} className="text-[10px] text-slate-400 leading-relaxed">• {it}</p>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TIMELINE ═══════════════════════════════════════ */}
          {activeView === 'timeline' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-12">
                <div className={cn(GLASS_CARD, 'min-h-[600px]')}>
                  <h4 className={SECTION_TITLE}>Well Construction Timeline (Gantt Chart)</h4>
                  
                  {/* Gantt Bars */}
                  <div className="overflow-x-auto custom-scrollbar">
                    <div className="min-w-[900px]">
                      <div className="flex items-end gap-0 mb-3">
                        <div className="w-40 shrink-0" />
                        {Array.from({ length: Math.ceil(totalTimelineDays / 10) + 1 }, (_, i) => (
                          <div key={i} className="flex-1 text-center text-[10px] text-slate-600 font-bold uppercase">
                            {i % 5 === 0 || i === 0 ? `Day ${i * 10}` : ''}
                          </div>
                        ))}
                      </div>
                      <div className="h-3 bg-white/5 rounded-full mb-8 relative overflow-hidden">
                        {timelineEstimate.map((sec, i) => {
                          const startDay = timelineEstimate.slice(0, i).reduce((s, t) => s + t.totalDays, 0);
                          const pctStart = (startDay / totalTimelineDays) * 100;
                          const pctWidth = (sec.totalDays / totalTimelineDays) * 100;
                          return (
                            <motion.div
                              key={i}
                              initial={{ width: 0, left: 0 }}
                              animate={{ width: `${pctWidth}%`, left: `${pctStart}%` }}
                              transition={{ duration: 0.6, delay: i * 0.1 }}
                              className="h-full absolute rounded-full"
                              style={{ backgroundColor: COLORS_8[i % COLORS_8.length] }}
                            />
                          );
                        })}
                      </div>
                      <div className="space-y-4">
                        {timelineEstimate.map((sec, i) => {
                          const startDay = timelineEstimate.slice(0, i).reduce((s, t) => s + t.totalDays, 0);
                          const color = COLORS_8[i % COLORS_8.length];
                          return (
                            <div key={i} className="flex items-center gap-4">
                              <div className="w-40 shrink-0">
                                <p className="text-[10px] text-white font-black uppercase">{sec.name}</p>
                                <p className="text-[10px] text-slate-500">{sec.holeSize_in}" × {sec.bitType.split(' ').slice(0, 2).join(' ')}</p>
                              </div>
                              <div className="flex-1 h-10 bg-white/5 rounded-lg overflow-hidden relative">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(sec.totalDays / totalTimelineDays) * 100}%` }}
                                  transition={{ duration: 0.7, delay: 0.2 + i * 0.1 }}
                                  className="h-full rounded-lg flex items-center justify-between px-4"
                                  style={{ backgroundColor: color + '25', borderLeft: `3px solid ${color}` }}
                                >
                                  <span className="text-[11px] font-bold" style={{ color }}>
                                    {sec.totalDays.toFixed(1)} d
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    Drill: {sec.drillingDays.toFixed(1)}d | Trip: {sec.trippingDays.toFixed(1)}d
                                  </span>
                                </motion.div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeline Summary */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-2"><Clock size={18} className="text-cyan-400" /><span className="text-[10px] text-cyan-400 font-black uppercase">Drilling</span></div>
                      <span className="text-sm text-white font-black">{totalTimelineDays.toFixed(1)} days</span>
                    </div>
                    <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-2"><AlertCircle size={18} className="text-amber-400" /><span className="text-[10px] text-amber-400 font-black uppercase">With NPT</span></div>
                      <span className="text-sm text-white font-black">{(totalTimelineDays * 1.2).toFixed(1)} days</span>
                    </div>
                    <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-2"><DollarSign size={18} className="text-emerald-400" /><span className="text-[10px] text-emerald-400 font-black uppercase">Rig Cost</span></div>
                      <span className="text-sm text-white font-black">${(totalTimelineDays * selectedDayRate).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ─── Atom Components ────────────────────────────────────────────────────

function InfoRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5">
      <span className="text-[11px] text-slate-500 uppercase font-bold">{label}</span>
      <span className="text-[10px] text-white font-black" style={color ? { color } : {}}>{value}</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-white/10 transition-all duration-300">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: color + '20', color }}>
        <Icon size={14} />
      </div>
      <p className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">{label}</p>
      <p className="text-xs font-black text-white">{value}</p>
    </div>
  );
}

function QuickBadge({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="p-3 rounded-2xl border border-white/5 bg-black/30 backdrop-blur-sm flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + '20', color }}>
        <Icon size={12} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-500 uppercase font-bold truncate">{label}</p>
        <p className="text-[10px] font-black text-white truncate">{value}</p>
      </div>
    </div>
  );
}

function ToggleRow({ label, active, onChange, activeColor, readOnly }: { label: string; active: boolean; onChange: () => void; activeColor: string; readOnly?: boolean }) {
  const colors: Record<string, string> = { rose: 'bg-rose-600', amber: 'bg-amber-600', emerald: 'bg-emerald-600', blue: 'bg-blue-600', cyan: 'bg-cyan-600' };
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-slate-500 uppercase font-bold">{label}</span>
      <button
        onClick={readOnly ? undefined : onChange}
        className={cn("px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all", active ? colors[activeColor] + ' text-white' : "bg-white/5 text-slate-500", readOnly ? 'cursor-default' : 'hover:opacity-80')}
      >
        {active ? 'YES' : 'NO'}
      </button>
    </div>
  );
}

function SpecRow({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5">
      <Icon size={12} style={{ color }} className="shrink-0" />
      <div className="flex justify-between w-full min-w-0">
        <span className="text-[11px] text-slate-500 uppercase font-bold">{label}</span>
        <span className="text-[10px] text-white font-black text-right">{value}</span>
      </div>
    </div>
  );
}