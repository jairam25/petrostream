import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio, Activity, Search, Target, Layers, Globe, Zap, Waves,
  Cpu, Database, Box, Magnet, Gauge, Map, Calendar, DollarSign,
  Truck, Ruler, Crosshair, TrendingUp, Clock, BarChart3, BookOpen,
  Grid3X3, Maximize, Minimize, ChevronRight, AlertTriangle
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { InputWithSlider, DataRow, SectionHeader } from '../SharedUI';
import {
  SeismicSurveyConfig, GravitySurveyConfig, MagneticSurveyConfig,
  EMSurveyConfig, GeochemConfig, SurveyType, LocationType,
  SeismicSource, ReceiverType, GravityPlatform, MagneticPlatform,
  EMSurveyMethod,
  calculateSeismicFold, calculateNyquistFrequency,
  calculateMaxReceiverSpacing, calculateMigrationAperture,
  calculateVerticalResolution, calculateFresnelZone,
  generateFoldDistribution, modelSeismicTimeline,
  estimateSeismicCost, calculateSourceEnergy,
  calculateGravitySurveyLineKm, calculateBouguerAnomaly,
  calculateTheoreticalGravity, estimateBasementDepthGravity,
  calculateMagSurveyLineKm, calculateRTPFactor, applyRTPCorrection,
  calculateSkinDepth, calculateCSEMResponse, estimateCSEMCost,
  generateGeochemGrid, calculateGeochemAnomalyThreshold,
  classifyGeochemSample, estimateGeochemCost,
  compareSurveyCosts, getEquipmentFleet, generateShotRecGeometry,
  FoldCoverageResult, AcquisitionTimeline, SurveyCostEstimate,
  GEOPHYSICS_PAPERS, GeophysicsPaper
} from '../../lib/geophysics';
import {
  XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  ScatterChart, Scatter, ZAxis, ComposedChart, Line, Legend
} from 'recharts';

type SurveySubTab = 'design' | 'fold' | 'resolution' | 'timeline' | 'cost' | 'fleet' | 'layout' | 'compare' | 'references';

export default function SurveyDesignTab() {
  const [activeTab, setActiveTab] = useState<SurveySubTab>('design');
  
  // ─── Survey Method & Location ───
  const [surveyMethod, setSurveyMethod] = useState<SurveyType>('seismic_3d');
  const [location, setLocation] = useState<LocationType>('onshore');
  
  // ─── Seismic Config ───
  const [seismicSurveyType, setSeismicSurveyType] = useState<'2d' | '3d'>('3d');
  const [sourceType, setSourceType] = useState<SeismicSource>('vibroseis');
  const [receiverType, setReceiverType] = useState<ReceiverType>('geophone');
  const [shotSpacing, setShotSpacing] = useState(50);
  const [recSpacing, setRecSpacing] = useState(25);
  const [lineSpacing, setLineSpacing] = useState(200);
  const [nChannels, setNChannels] = useState(480);
  const [nSourceLines, setNSourceLines] = useState(12);
  const [surveyArea, setSurveyArea] = useState(100);
  const [targetDepth, setTargetDepth] = useState(3000);
  const [targetVelocity, setTargetVelocity] = useState(3500);
  const [sweepLow, setSweepLow] = useState(8);
  const [sweepHigh, setSweepHigh] = useState(80);
  const [sweepLength, setSweepLength] = useState(12);
  const [chargeWeight, setChargeWeight] = useState(2);
  const [airgunVolume, setAirgunVolume] = useState(300);
  
  // ─── Gravity Config ───
  const [gravPlatform, setGravPlatform] = useState<GravityPlatform>('airborne');
  const [gravStationSpacing, setGravStationSpacing] = useState(500);
  const [gravLineSpacing, setGravLineSpacing] = useState(2000);
  const [densityContrast, setDensityContrast] = useState(0.35);
  
  // ─── Magnetic Config ───
  const [magPlatform, setMagPlatform] = useState<MagneticPlatform>('airborne');
  const [flightHeight, setFlightHeight] = useState(150);
  const [magLineSpacing, setMagLineSpacing] = useState(400);
  const [tieLineSpacing, setTieLineSpacing] = useState(2000);
  const [inclination, setInclination] = useState(65);
  const [declination, setDeclination] = useState(-8);
  
  // ─── EM Config ───
  const [emMethod, setEmMethod] = useState<EMSurveyMethod>('csem');
  const [emFreqMin, setEmFreqMin] = useState(0.1);
  const [emFreqMax, setEmFreqMax] = useState(10);
  const [csemOffset, setCsemOffset] = useState(5000);
  const [waterDepth, setWaterDepth] = useState(1500);
  const [targetResistivity, setTargetResistivity] = useState(50);
  const [bgResistivity, setBgResistivity] = useState(1);
  
  // ─── Geochem Config ───
  const [geochemGridSpacing, setGeochemGridSpacing] = useState(500);
  const [bgC1, setBgC1] = useState(45);
  const [labMethod, setLabMethod] = useState<'headspace' | 'adsorbed' | 'microbial'>('headspace');
  
  // ─── Derived Seismic Config ───
  const seismicConfig: SeismicSurveyConfig = useMemo(() => ({
    surveyType: seismicSurveyType,
    location,
    sourceType,
    receiverType,
    shotSpacing_m: shotSpacing,
    recSpacing_m: recSpacing,
    lineSpacing_m: lineSpacing,
    nChannels,
    nSourceLines,
    sampleRate_ms: 2,
    recordLength_s: 6,
    sweepFreqLow_Hz: sweepLow,
    sweepFreqHigh_Hz: sweepHigh,
    sweepLength_s: sweepLength,
    chargeWeight_kg: chargeWeight,
    airgunVolume_cuin: airgunVolume,
    surveyArea_sqkm: surveyArea,
    targetDepth_m: targetDepth,
    targetVelocity_ms: targetVelocity,
  }), [seismicSurveyType, location, sourceType, receiverType, shotSpacing, recSpacing, lineSpacing, nChannels, nSourceLines, sweepLow, sweepHigh, sweepLength, chargeWeight, airgunVolume, surveyArea, targetDepth, targetVelocity]);
  
  const gravityConfig: GravitySurveyConfig = useMemo(() => ({
    platform: gravPlatform,
    stationSpacing_m: gravStationSpacing,
    lineSpacing_m: gravLineSpacing,
    surveyArea_sqkm: surveyArea,
    densityContrast_gcc: densityContrast,
    expectedAnomalyRange_mGal: [0.5, 10],
    targetDepth_m: targetDepth,
  }), [gravPlatform, gravStationSpacing, gravLineSpacing, surveyArea, densityContrast, targetDepth]);
  
  const magneticConfig: MagneticSurveyConfig = useMemo(() => ({
    platform: magPlatform,
    flightHeight_m: flightHeight,
    lineSpacing_m: magLineSpacing,
    tieLineSpacing_m: tieLineSpacing,
    surveyArea_sqkm: surveyArea,
    inclination_deg: inclination,
    declination_deg: declination,
    expectedAnomalyRange_nT: [10, 500],
  }), [magPlatform, flightHeight, magLineSpacing, tieLineSpacing, surveyArea, inclination, declination]);
  
  const emConfig: EMSurveyConfig = useMemo(() => ({
    method: emMethod,
    location,
    frequencyMin_Hz: emFreqMin,
    frequencyMax_Hz: emFreqMax,
    sourceRecOffset_m: csemOffset,
    towDepth_m: 30,
    waterDepth_m: waterDepth,
    recSpacing_m: 500,
    lineSpacing_m: lineSpacing,
    surveyArea_sqkm: surveyArea,
    targetResistivity_ohm_m: targetResistivity,
    backgroundResistivity_ohm_m: bgResistivity,
  }), [emMethod, location, emFreqMin, emFreqMax, csemOffset, waterDepth, lineSpacing, surveyArea, targetResistivity, bgResistivity]);
  
  const geochemConfig: GeochemConfig = useMemo(() => ({
    location,
    gridSpacing_m: geochemGridSpacing,
    surveyArea_sqkm: surveyArea,
    sampleDepth_m: 1.5,
    analytes: ['C1', 'C2', 'C3'],
    backgroundC1_ppm: bgC1,
    labMethod,
  }), [location, geochemGridSpacing, surveyArea, bgC1, labMethod]);
  
  // ─── Computed Results ───
  const foldResult = useMemo(() => calculateSeismicFold(seismicConfig), [seismicConfig]);
  const timeline = useMemo(() => modelSeismicTimeline(seismicConfig), [seismicConfig]);
  const costEstimate = useMemo(() => estimateSeismicCost(seismicConfig), [seismicConfig]);
  const foldDist = useMemo(() => generateFoldDistribution(seismicConfig, 12), [seismicConfig]);
  const sourceEnergy = useMemo(() => calculateSourceEnergy(sourceType, chargeWeight, airgunVolume), [sourceType, chargeWeight, airgunVolume]);
  const nyquistFreq = useMemo(() => calculateNyquistFrequency(targetVelocity, recSpacing), [targetVelocity, recSpacing]);
  const maxRecSpacing = useMemo(() => calculateMaxReceiverSpacing(targetVelocity, sweepHigh), [targetVelocity, sweepHigh]);
  const vertRes = useMemo(() => calculateVerticalResolution(targetVelocity, sweepHigh), [targetVelocity, sweepHigh]);
  const twt = useMemo(() => targetDepth / targetVelocity * 2, [targetDepth, targetVelocity]);
  const fresnelRadius = useMemo(() => calculateFresnelZone(targetVelocity, twt, sweepHigh), [targetVelocity, twt, sweepHigh]);
  const migAperture = useMemo(() => calculateMigrationAperture(targetDepth, 30, fresnelRadius), [targetDepth, fresnelRadius]);
  const gravSurvey = useMemo(() => calculateGravitySurveyLineKm(gravityConfig), [gravityConfig]);
  const magSurvey = useMemo(() => calculateMagSurveyLineKm(magneticConfig), [magneticConfig]);
  const rtpFactor = useMemo(() => calculateRTPFactor(inclination, declination), [inclination, declination]);
  const skinDepthMid = useMemo(() => calculateSkinDepth(bgResistivity, (emFreqMin + emFreqMax) / 2), [bgResistivity, emFreqMin, emFreqMax]);
  const csemResponse = useMemo(() => calculateCSEMResponse(csemOffset, (emFreqMin + emFreqMax) / 2, waterDepth, targetResistivity, bgResistivity), [csemOffset, emFreqMin, emFreqMax, waterDepth, targetResistivity, bgResistivity]);
  const geochemGrid = useMemo(() => generateGeochemGrid(geochemConfig, 8), [geochemConfig]);
  const geochemCost = useMemo(() => estimateGeochemCost(geochemConfig), [geochemConfig]);
  const costComparison = useMemo(() => compareSurveyCosts(surveyArea, location), [surveyArea, location]);
  const shotRecGeom = useMemo(() => generateShotRecGeometry(5, shotSpacing, 24, recSpacing), [shotSpacing, recSpacing]);
  
  const isSeismic = surveyMethod === 'seismic_2d' || surveyMethod === 'seismic_3d';
  const isGravity = surveyMethod === 'gravity';
  const isMagnetic = surveyMethod === 'magnetic';
  const isEM = surveyMethod === 'em_csem' || surveyMethod === 'em_mt';
  const isGeochem = surveyMethod === 'geochemical';
  
  const subTabs: { id: SurveySubTab; label: string; icon: React.ElementType }[] = [
    { id: 'design', label: 'Design', icon: Grid3X3 },
    { id: 'fold', label: 'Fold', icon: Maximize },
    { id: 'resolution', label: 'Resolution', icon: Minimize },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'cost', label: 'Cost', icon: DollarSign },
    { id: 'fleet', label: 'Fleet', icon: Truck },
    { id: 'layout', label: 'Layout', icon: Map },
    { id: 'compare', label: 'Compare', icon: TrendingUp },
    { id: 'references', label: 'Papers', icon: BookOpen },
  ];
  
  const methodTabs: { id: SurveyType; label: string; icon: React.ElementType }[] = [
    { id: 'seismic_3d', label: '3D Seismic', icon: Waves },
    { id: 'seismic_2d', label: '2D Seismic', icon: Activity },
    { id: 'gravity', label: 'Gravity', icon: Globe },
    { id: 'magnetic', label: 'Magnetic', icon: Magnet },
    { id: 'em_csem', label: 'CSEM', icon: Zap },
    { id: 'em_mt', label: 'MT', icon: Radio },
    { id: 'geochemical', label: 'Geochem', icon: Database },
  ];
  
  return (
    <div className="h-full flex flex-col">
      {/* Method Tabs */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/30">
        <Ruler className="text-purple-500" size={16} />
        <span className="text-white font-black italic text-sm tracking-tight mr-4 uppercase">Survey Method</span>
        {methodTabs.map(m => (
          <button
            key={m.id}
            onClick={() => setSurveyMethod(m.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all',
              surveyMethod === m.id
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            )}
          >
            <m.icon size={11} />{m.label}
          </button>
        ))}
      </div>
      
      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-white/5 bg-black/20">
        {subTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all',
              activeTab === t.id
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'
            )}
          >
            <t.icon size={10} />{t.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'design' && <DesignTab {...{surveyMethod, location, setLocation, isSeismic, isGravity, isMagnetic, isEM, isGeochem, seismicSurveyType, setSeismicSurveyType, sourceType, setSourceType, receiverType, setReceiverType, shotSpacing, setShotSpacing, recSpacing, setRecSpacing, lineSpacing, setLineSpacing, nChannels, setNChannels, nSourceLines, setNSourceLines, surveyArea, setSurveyArea, targetDepth, setTargetDepth, targetVelocity, setTargetVelocity, sweepLow, setSweepLow, sweepHigh, setSweepHigh, sweepLength, setSweepLength, chargeWeight, setChargeWeight, airgunVolume, setAirgunVolume, gravPlatform, setGravPlatform, gravStationSpacing, setGravStationSpacing, gravLineSpacing, setGravLineSpacing, densityContrast, setDensityContrast, magPlatform, setMagPlatform, flightHeight, setFlightHeight, magLineSpacing, setMagLineSpacing, tieLineSpacing, setTieLineSpacing, inclination, setInclination, declination, setDeclination, emMethod, setEmMethod, emFreqMin, setEmFreqMin, emFreqMax, setEmFreqMax, csemOffset, setCsemOffset, waterDepth, setWaterDepth, targetResistivity, setTargetResistivity, bgResistivity, setBgResistivity, geochemGridSpacing, setGeochemGridSpacing, bgC1, setBgC1, labMethod, setLabMethod, sourceEnergy, nyquistFreq, maxRecSpacing, vertRes, fresnelRadius, skinDepthMid, csemResponse, rtpFactor, gravSurvey, magSurvey, geochemCost }} />}
            {activeTab === 'fold' && <FoldTab foldResult={foldResult} foldDist={foldDist} seismicConfig={seismicConfig} isSeismic={isSeismic} />}
            {activeTab === 'resolution' && <ResolutionTab vertRes={vertRes} fresnelRadius={fresnelRadius} nyquistFreq={nyquistFreq} maxRecSpacing={maxRecSpacing} migAperture={migAperture} targetDepth={targetDepth} targetVelocity={targetVelocity} sweepHigh={sweepHigh} twt={twt} />}
            {activeTab === 'timeline' && <TimelineTab timeline={timeline} surveyArea={surveyArea} />}
            {activeTab === 'cost' && <CostTab costEstimate={costEstimate} isSeismic={isSeismic} />}
            {activeTab === 'fleet' && <FleetTab surveyMethod={surveyMethod} />}
            {activeTab === 'layout' && <LayoutTab shotRecGeom={shotRecGeom} geochemGrid={geochemGrid} isSeismic={isSeismic} isGeochem={isGeochem} surveyMethod={surveyMethod} seismicConfig={seismicConfig} />}
            {activeTab === 'compare' && <CompareTab costComparison={costComparison} surveyArea={surveyArea} />}
            {activeTab === 'references' && <ReferencesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TAB
// ═══════════════════════════════════════════════════════════════════════════════

function DesignTab(props: any) {
  const { surveyMethod, location, setLocation, isSeismic, isGravity, isMagnetic, isEM, isGeochem, seismicSurveyType, setSeismicSurveyType, sourceType, setSourceType, receiverType, setReceiverType, shotSpacing, setShotSpacing, recSpacing, setRecSpacing, lineSpacing, setLineSpacing, nChannels, setNChannels, nSourceLines, setNSourceLines, surveyArea, setSurveyArea, targetDepth, setTargetDepth, targetVelocity, setTargetVelocity, sweepLow, setSweepLow, sweepHigh, setSweepHigh, sweepLength, setSweepLength, chargeWeight, setChargeWeight, airgunVolume, setAirgunVolume, gravPlatform, setGravPlatform, gravStationSpacing, setGravStationSpacing, gravLineSpacing, setGravLineSpacing, densityContrast, setDensityContrast, magPlatform, setMagPlatform, flightHeight, setFlightHeight, magLineSpacing, setMagLineSpacing, tieLineSpacing, setTieLineSpacing, inclination, setInclination, declination, setDeclination, emMethod, setEmMethod, emFreqMin, setEmFreqMin, emFreqMax, setEmFreqMax, csemOffset, setCsemOffset, waterDepth, setWaterDepth, targetResistivity, setTargetResistivity, bgResistivity, setBgResistivity, geochemGridSpacing, setGeochemGridSpacing, bgC1, setBgC1, labMethod, setLabMethod, sourceEnergy, nyquistFreq, maxRecSpacing, vertRes, fresnelRadius, skinDepthMid, csemResponse, rtpFactor, gravSurvey, magSurvey, geochemCost } = props;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Location */}
        <div className="glass-card p-5 rounded-2xl border-white/5 bg-purple-500/5">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-3">Location</h4>
          <div className="flex gap-2">
            {(['onshore', 'offshore', 'transition'] as LocationType[]).map(loc => (
              <button
                key={loc}
                onClick={() => setLocation(loc)}
                className={cn(
                  'flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all',
                  location === loc
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/5 text-slate-500 hover:text-white hover:bg-white/10'
                )}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
        
        {/* Survey Area */}
        <div className="glass-card p-5 rounded-2xl border-white/5 bg-purple-500/5">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-3">Survey Area (km²)</h4>
          <InputWithSlider value={surveyArea} onChange={setSurveyArea} min={1} max={2000} step={1} unit="km²" />
        </div>
        
        {/* Target Depth */}
        <div className="glass-card p-5 rounded-2xl border-white/5 bg-purple-500/5">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-3">Target Depth (m)</h4>
          <InputWithSlider value={targetDepth} onChange={setTargetDepth} min={200} max={8000} step={50} unit="m" />
        </div>
      </div>
      
      {/* Seismic Parameters */}
      {isSeismic && (
        <div className="space-y-4">
          <SectionHeader title="Seismic Survey Parameters" subtitle="Shot & Receiver Geometry" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5 rounded-2xl border-white/5 bg-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-3">Survey Type</h4>
              <div className="flex gap-2">
                {(['2d', '3d'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setSeismicSurveyType(t)}
                    className={cn(
                      'flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider',
                      seismicSurveyType === t ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10'
                    )}
                  >{t}</button>
                ))}
              </div>
            </div>
            <div className="glass-card p-5 rounded-2xl border-white/5 bg-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-3">Source Type</h4>
              <div className="flex gap-1.5 flex-wrap">
                {(['vibroseis', 'dynamite', 'airgun', 'weight_drop'] as SeismicSource[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setSourceType(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider',
                      sourceType === s ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10'
                    )}
                  >{s.replace('_', ' ')}</button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Shots / Line-km</h4>
              <InputWithSlider value={shotSpacing} onChange={setShotSpacing} min={10} max={200} step={5} unit="m spacing" />
              <p className="text-[11px] text-slate-500 mt-1">{formatNumber(1000 / shotSpacing)} shots/km</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Receiver Spacing</h4>
              <InputWithSlider value={recSpacing} onChange={setRecSpacing} min={5} max={100} step={5} unit="m" />
            </div>
            <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Line Spacing</h4>
              <InputWithSlider value={lineSpacing} onChange={setLineSpacing} min={25} max={1000} step={25} unit="m" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Active Channels</h4>
              <InputWithSlider value={nChannels} onChange={setNChannels} min={24} max={2000} step={24} unit="ch" />
            </div>
            {seismicSurveyType === '3d' && (
              <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Source Lines</h4>
                <InputWithSlider value={nSourceLines} onChange={setNSourceLines} min={2} max={40} step={1} unit="lines" />
              </div>
            )}
            <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Interval Velocity</h4>
              <InputWithSlider value={targetVelocity} onChange={setTargetVelocity} min={1500} max={6000} step={50} unit="m/s" />
            </div>
          </div>
          
          {/* Source-specific params */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sourceType === 'vibroseis' && (
              <>
                <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Sweep Range</h4>
                  <div className="flex items-center gap-2 text-white text-xs font-mono">
                    <input type="number" value={sweepLow} onChange={e => setSweepLow(+e.target.value)} className="w-16 bg-white/10 rounded-lg px-2 py-1 text-center text-xs" />
                    <span className="text-slate-500">-</span>
                    <input type="number" value={sweepHigh} onChange={e => setSweepHigh(+e.target.value)} className="w-16 bg-white/10 rounded-lg px-2 py-1 text-center text-xs" />
                    <span className="text-slate-500">Hz</span>
                  </div>
                </div>
                <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Sweep Length</h4>
                  <InputWithSlider value={sweepLength} onChange={setSweepLength} min={4} max={40} step={2} unit="s" />
                </div>
              </>
            )}
            {sourceType === 'dynamite' && (
              <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Charge Weight</h4>
                <InputWithSlider value={chargeWeight} onChange={setChargeWeight} min={0.5} max={25} step={0.5} unit="kg" />
              </div>
            )}
            {sourceType === 'airgun' && (
              <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Airgun Volume</h4>
                <InputWithSlider value={airgunVolume} onChange={setAirgunVolume} min={50} max={1000} step={50} unit="cu in" />
              </div>
            )}
            <div className="glass-card p-4 rounded-2xl border-white/5 bg-rose-500/5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-2">Source Energy</h4>
              <p className="text-2xl font-black text-white">{sourceEnergy.toFixed(0)} <span className="text-sm text-slate-500">dB</span></p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBadge label="Nyquist f" value={`${nyquistFreq.toFixed(1)} Hz`} color="purple" />
            <StatBadge label="Max Rec Δx" value={`${maxRecSpacing.toFixed(0)} m`} color="blue" />
            <StatBadge label="Vert Res" value={`${vertRes.toFixed(1)} m`} color="green" />
            <StatBadge label="Fresnel Zone" value={`${fresnelRadius.toFixed(0)} m`} color="amber" />
          </div>
        </div>
      )}
      
      {/* Gravity Parameters */}
      {isGravity && (
        <div className="space-y-4">
          <SectionHeader title="Gravity Survey Parameters" subtitle="Station & Line Design" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-2xl border-white/5 bg-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-3">Platform</h4>
              <div className="flex gap-2">
                {(['ground', 'airborne', 'satellite'] as GravityPlatform[]).map(p => (
                  <button key={p} onClick={() => setGravPlatform(p)}
                    className={cn('flex-1 py-2 rounded-xl text-[11px] font-black uppercase', gravPlatform === p ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10')}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Station Spacing</h4>
              <InputWithSlider value={gravStationSpacing} onChange={setGravStationSpacing} min={50} max={5000} step={50} unit="m" />
            </div>
            <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Line Spacing</h4>
              <InputWithSlider value={gravLineSpacing} onChange={setGravLineSpacing} min={100} max={10000} step={100} unit="m" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBadge label="Total Line-km" value={`${gravSurvey.totalLineKm.toFixed(0)} km`} color="purple" />
            <StatBadge label="Stations" value={formatNumber(gravSurvey.nStations)} color="blue" />
            <StatBadge label="Est. Cost" value={`$${formatNumber(gravSurvey.costEstimateUSD)}`} color="green" />
            <StatBadge label="Density Contrast" value={`${densityContrast} g/cc`} color="amber" />
          </div>
        </div>
      )}
      
      {/* Magnetic Parameters */}
      {isMagnetic && (
        <div className="space-y-4">
          <SectionHeader title="Magnetic Survey Parameters" subtitle="Line Spacing & Flight Height" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-2xl border-white/5 bg-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-3">Platform</h4>
              <div className="flex gap-2 flex-wrap">
                {(['airborne', 'ground', 'marine', 'drone'] as MagneticPlatform[]).map(p => (
                  <button key={p} onClick={() => setMagPlatform(p)}
                    className={cn('px-3 py-1.5 rounded-lg text-[11px] font-black uppercase', magPlatform === p ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10')}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Line Spacing</h4>
              <InputWithSlider value={magLineSpacing} onChange={setMagLineSpacing} min={50} max={5000} step={50} unit="m" />
            </div>
            <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Flight Height</h4>
              <InputWithSlider value={flightHeight} onChange={setFlightHeight} min={20} max={1000} step={10} unit="m" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBadge label="Total Line-km" value={`${magSurvey.totalLineKm.toFixed(0)} km`} color="purple" />
            <StatBadge label="Tie Line-km" value={`${magSurvey.tieLineKm.toFixed(0)} km`} color="blue" />
            <StatBadge label="RTP Factor" value={`${rtpFactor.toFixed(2)}×`} color="green" />
            <StatBadge label="Est. Cost" value={`$${formatNumber(magSurvey.costEstimateUSD)}`} color="amber" />
          </div>
        </div>
      )}
      
      {/* EM Parameters */}
      {isEM && (
        <div className="space-y-4">
          <SectionHeader title="EM Survey Parameters" subtitle="Frequency & Resistivity" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Frequency Range</h4>
              <div className="flex items-center gap-2 text-white text-xs font-mono">
                <input type="number" value={emFreqMin} onChange={e => setEmFreqMin(+e.target.value)} step={0.1} className="w-16 bg-white/10 rounded-lg px-2 py-1 text-center text-xs" />
                <span className="text-slate-500">-</span>
                <input type="number" value={emFreqMax} onChange={e => setEmFreqMax(+e.target.value)} step={1} className="w-16 bg-white/10 rounded-lg px-2 py-1 text-center text-xs" />
                <span className="text-slate-500">Hz</span>
              </div>
            </div>
            {emMethod === 'csem' && (
              <>
                <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tow Offset</h4>
                  <InputWithSlider value={csemOffset} onChange={setCsemOffset} min={500} max={15000} step={500} unit="m" />
                </div>
                <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Water Depth</h4>
                  <InputWithSlider value={waterDepth} onChange={setWaterDepth} min={50} max={4000} step={50} unit="m" />
                </div>
              </>
            )}
            <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Target Resistivity</h4>
              <InputWithSlider value={targetResistivity} onChange={setTargetResistivity} min={1} max={500} step={1} unit="Ω·m" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBadge label="Skin Depth" value={`${skinDepthMid.toFixed(0)} m`} color="purple" />
            <StatBadge label="E-field Norm" value={`${csemResponse.eFieldNorm.toExponential(2)}`} color="blue" />
            <StatBadge label="Phase" value={`${csemResponse.phase_deg.toFixed(1)}°`} color="green" />
            <StatBadge label="Regime" value={csemResponse.regime.replace('_', ' ')} color="amber" />
          </div>
        </div>
      )}
      
      {/* Geochem Parameters */}
      {isGeochem && (
        <div className="space-y-4">
          <SectionHeader title="Geochemical Survey Parameters" subtitle="Grid & Lab Method" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Grid Spacing</h4>
              <InputWithSlider value={geochemGridSpacing} onChange={setGeochemGridSpacing} min={100} max={2000} step={50} unit="m" />
            </div>
            <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Background C₁</h4>
              <InputWithSlider value={bgC1} onChange={setBgC1} min={5} max={200} step={1} unit="ppm" />
            </div>
            <div className="glass-card p-4 rounded-2xl border-white/5 bg-black/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Lab Method</h4>
              <div className="flex gap-2">
                {(['headspace', 'adsorbed', 'microbial'] as const).map(m => (
                  <button key={m} onClick={() => setLabMethod(m)}
                    className={cn('flex-1 py-2 rounded-xl text-[11px] font-black uppercase', labMethod === m ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10')}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBadge label="Samples" value={formatNumber(geochemCost.nSamples)} color="purple" />
            <StatBadge label="Est. Cost" value={`$${formatNumber(geochemCost.costEstimateUSD)}`} color="blue" />
            <StatBadge label="Grid Density" value={`${(1000 / geochemGridSpacing).toFixed(1)}/km`} color="green" />
            <StatBadge label="Anomaly Thr." value={`${(bgC1 * 1.6).toFixed(0)} ppm`} color="amber" />
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FOLD TAB
// ═══════════════════════════════════════════════════════════════════════════════

function FoldTab({ foldResult, foldDist, seismicConfig, isSeismic }: { foldResult: FoldCoverageResult; foldDist: { offset_m: number; fold: number; label: string }[]; seismicConfig: SeismicSurveyConfig; isSeismic: boolean }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Fold Coverage Analysis" subtitle="Inline × Crossline" />
      
      {isSeismic ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBadge label="Inline Fold" value={`${foldResult.foldInline}×`} color="purple" />
            <StatBadge label="Crossline Fold" value={`${foldResult.foldCrossline}×`} color="blue" />
            <StatBadge label="Total Fold" value={`${foldResult.totalFold}×`} color="green" />
            <StatBadge label="CMP Density" value={`${formatNumber(foldResult.cmpDensityPerSqKm)}/km²`} color="amber" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBadge label="Bin Size" value={`${foldResult.binSize_m} m`} color="purple" />
            <StatBadge label="Max Offset" value={`${foldResult.maxOffset_m.toFixed(0)} m`} color="blue" />
            <StatBadge label="Min Offset" value={`${foldResult.minOffset_m.toFixed(0)} m`} color="green" />
            <StatBadge label="Azimuth" value={`${foldResult.azimuthRange_deg[0]}°-${foldResult.azimuthRange_deg[1]}°`} color="amber" />
          </div>
          
          {/* Fold Distribution Chart */}
          <div className="glass-card p-6 rounded-2xl border-white/5 bg-black/20 h-[300px]">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-4">Fold vs Offset Distribution</h4>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={foldDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} />
                <RechartTooltip contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #4c1d95', borderRadius: 12 }} labelStyle={{ color: '#fff', fontSize: 10 }} itemStyle={{ color: '#c084fc' }} />
                <Area type="monotone" dataKey="fold" stroke="#a855f7" fill="#a855f730" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="glass-card p-8 rounded-2xl border-white/5 bg-black/20 text-center">
          <Maximize className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm">Fold analysis is only applicable to seismic surveys.</p>
          <p className="text-slate-600 text-xs mt-1">Select Seismic 2D or 3D to view fold calculations.</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESOLUTION TAB
// ═══════════════════════════════════════════════════════════════════════════════

function ResolutionTab({ vertRes, fresnelRadius, nyquistFreq, maxRecSpacing, migAperture, targetDepth, targetVelocity, sweepHigh, twt }: any) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Resolution Analysis" subtitle="Vertical · Lateral · Aliasing" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl border-white/5 bg-black/20 space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500">Vertical Resolution</h4>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-white">{vertRes.toFixed(1)}</span>
            <span className="text-slate-500 text-sm mb-1">meters (λ/4)</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            At dominant frequency {sweepHigh} Hz and velocity {targetVelocity} m/s.
            Can resolve beds thicker than ~{vertRes.toFixed(0)} m.
          </p>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose-500 to-purple-500 rounded-full" style={{ width: `${Math.min(100, (1 - vertRes / 50) * 100)}%` }} />
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-2xl border-white/5 bg-black/20 space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500">Lateral Resolution (Fresnel)</h4>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-white">{fresnelRadius.toFixed(0)}</span>
            <span className="text-slate-500 text-sm mb-1">meters radius</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            At depth {targetDepth} m (TWT {twt.toFixed(2)} s). Fresnel zone decreases with higher frequency and shallower depth.
          </p>
        </div>
        
        <div className="glass-card p-6 rounded-2xl border-white/5 bg-black/20 space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500">Spatial Aliasing</h4>
          <div className="space-y-2">
            <DataRow label="Nyquist Frequency" value={`${nyquistFreq.toFixed(1)} Hz`} />
            <DataRow label="Max Rx Spacing @ f_max" value={`${maxRecSpacing.toFixed(0)} m`} />
            <DataRow label="Actual Rx Spacing" value={`${maxRecSpacing > 0 ? (nyquistFreq > sweepHigh ? '✓ No Aliasing' : '⚠ Aliasing Risk') : 'Valid'} `} color={nyquistFreq > sweepHigh ? 'green' : 'red'} />
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-2xl border-white/5 bg-black/20 space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500">Migration Aperture</h4>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-white">{migAperture.toFixed(0)}</span>
            <span className="text-slate-500 text-sm mb-1">meters</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            For 30° dipping events at {targetDepth} m depth. Aperture = depth × tan(dip) + Fresnel radius.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIMELINE TAB
// ═══════════════════════════════════════════════════════════════════════════════

function TimelineTab({ timeline, surveyArea }: { timeline: AcquisitionTimeline; surveyArea: number }) {
  const phases = [
    { label: 'Permitting', days: timeline.permittingDays, color: '#64748b' },
    { label: 'Mobilization', days: timeline.mobilizationDays, color: '#f59e0b' },
    { label: 'Acquisition', days: timeline.acquisitionDays, color: '#a855f7' },
    { label: 'Demobilization', days: timeline.demobilizationDays, color: '#f59e0b' },
    { label: 'Processing', days: timeline.processingDays, color: '#06b6d4' },
    { label: 'Interpretation', days: timeline.interpretationDays, color: '#10b981' },
  ];
  const maxDays = Math.max(...phases.map(p => p.days), 1);
  
  const ganttData = phases.map(p => ({
    name: p.label,
    Days: p.days,
    color: p.color,
  }));
  
  return (
    <div className="space-y-6">
      <SectionHeader title="Acquisition Timeline" subtitle="Gantt & Phase Breakdown" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBadge label="Total Duration" value={`${timeline.totalDurationDays} days`} color="purple" />
        <StatBadge label="Daily Production" value={`${timeline.dailyProductionKm.toFixed(1)} km/d`} color="blue" />
        <StatBadge label="Crew Size" value={`${timeline.crewSize}`} color="green" />
        <StatBadge label="Area" value={`${surveyArea} km²`} color="amber" />
      </div>
      
      {/* Gantt-style chart */}
      <div className="glass-card p-6 rounded-2xl border-white/5 bg-black/20 h-[280px]">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-4">Project Gantt Timeline</h4>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={ganttData} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 9 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <RechartTooltip contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #4c1d95', borderRadius: 12 }} labelStyle={{ color: '#fff', fontSize: 10 }} />
            <Bar dataKey="Days" barSize={24} radius={[0, 8, 8, 0]}>
              {ganttData.map((entry, idx) => (
                <rect key={idx} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {phases.map(p => (
          <div key={p.label} className="glass-card p-4 rounded-xl border-white/5 bg-black/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-[10px] text-slate-300 font-bold">{p.label}</span>
            </div>
            <span className="text-white font-black text-sm">{p.days}d</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COST TAB
// ═══════════════════════════════════════════════════════════════════════════════

function CostTab({ costEstimate, isSeismic }: { costEstimate: SurveyCostEstimate; isSeismic: boolean }) {
  const costBreakdown = [
    { label: 'Acquisition', value: costEstimate.acquisitionCostUSD, color: '#a855f7', pct: ((costEstimate.acquisitionCostUSD / costEstimate.totalCostUSD) * 100).toFixed(0) },
    { label: 'Processing', value: costEstimate.processingCostUSD, color: '#06b6d4', pct: ((costEstimate.processingCostUSD / costEstimate.totalCostUSD) * 100).toFixed(0) },
    { label: 'Mobilization', value: costEstimate.mobilizationCostUSD, color: '#f59e0b', pct: ((costEstimate.mobilizationCostUSD / costEstimate.totalCostUSD) * 100).toFixed(0) },
    { label: 'Permitting', value: costEstimate.permittingCostUSD, color: '#64748b', pct: ((costEstimate.permittingCostUSD / costEstimate.totalCostUSD) * 100).toFixed(0) },
    { label: 'HSE', value: costEstimate.hseCostUSD, color: '#10b981', pct: ((costEstimate.hseCostUSD / costEstimate.totalCostUSD) * 100).toFixed(0) },
  ];
  
  return (
    <div className="space-y-6">
      <SectionHeader title="Cost Estimate" subtitle="Acquisition, Processing, Mob/DeMob" />
      
      {isSeismic ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBadge label="Total Cost" value={`$${formatNumber(costEstimate.totalCostUSD)}`} color="purple" />
            <StatBadge label="Per km" value={`$${formatNumber(costEstimate.costPerKmUSD)}`} color="blue" />
            <StatBadge label="Per km²" value={`$${formatNumber(costEstimate.costPerSqKmUSD)}`} color="green" />
            <StatBadge label="Acquisition %" value={`${((costEstimate.acquisitionCostUSD / costEstimate.totalCostUSD) * 100).toFixed(0)}%`} color="amber" />
          </div>
          
          {/* Cost Breakdown Chart */}
          <div className="glass-card p-6 rounded-2xl border-white/5 bg-black/20 h-[280px]">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-4">Cost Breakdown</h4>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={costBreakdown} layout="vertical" margin={{ left: 90 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 9 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <RechartTooltip formatter={(value: any) => `$${formatNumber(Number(value))}`} contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #4c1d95', borderRadius: 12 }} labelStyle={{ color: '#fff', fontSize: 10 }} />
                <Bar dataKey="value" barSize={22} radius={[0, 8, 8, 0]}>
                  {costBreakdown.map((entry, idx) => (
                    <rect key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {costBreakdown.map(c => (
              <div key={c.label} className="glass-card p-4 rounded-xl border-white/5 bg-black/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-[10px] text-slate-300 font-bold">{c.label}</span>
                </div>
                <span className="text-white font-black text-sm">${formatNumber(c.value)}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="glass-card p-8 rounded-2xl border-white/5 bg-black/20 text-center">
          <DollarSign className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm">Seismic cost modeling is available in this view.</p>
          <p className="text-slate-600 text-xs mt-1">Other survey costs are shown in their respective design panels.</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLEET TAB
// ═══════════════════════════════════════════════════════════════════════════════

function FleetTab({ surveyMethod }: { surveyMethod: SurveyType }) {
  const fleet = useMemo(() => getEquipmentFleet(surveyMethod), [surveyMethod]);
  const totalValue = fleet.reduce((sum, item) => sum + item.count * item.unitCostUSD, 0);
  
  return (
    <div className="space-y-6">
      <SectionHeader title="Equipment Fleet" subtitle="Crew & Capital Equipment" />
      <div className="glass-card p-4 rounded-2xl border-white/5 bg-emerald-500/10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Total Fleet Value</span>
          <span className="text-2xl font-black text-white">${formatNumber(totalValue)}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fleet.map((item, idx) => (
          <div key={idx} className="glass-card p-4 rounded-xl border-white/5 bg-black/20 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-200 font-bold">{item.name}</p>
              <p className="text-[11px] text-slate-500">Qty: {item.count} × ${formatNumber(item.unitCostUSD)}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-black text-sm">${formatNumber(item.count * item.unitCostUSD)}</p>
            </div>
          </div>
        ))}
      </div>
      
      {fleet.length === 0 && (
        <div className="glass-card p-8 rounded-2xl border-white/5 bg-black/20 text-center">
          <Truck className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm">Select a survey method to see equipment fleet.</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT TAB
// ═══════════════════════════════════════════════════════════════════════════════

function LayoutTab({ shotRecGeom, geochemGrid, isSeismic, isGeochem, surveyMethod, seismicConfig }: any) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Survey Layout Visualization" subtitle="Shot-Receiver · Geochem Grid" />
      
      {isSeismic && (
        <div className="glass-card p-6 rounded-2xl border-white/5 bg-black/20 h-[400px]">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-4">
            {seismicConfig.surveyType.toUpperCase()} Shot-Receiver Geometry
          </h4>
          <svg viewBox="0 0 800 200" className="w-full h-full max-h-[300px]">
            {/* Grid */}
            {Array.from({ length: 20 }, (_, i) => (
              <line key={`g${i}`} x1={i * 40} y1={0} x2={i * 40} y2={200} stroke="#ffffff05" strokeWidth={1} />
            ))}
            
            {/* Receivers (bottom line) */}
            {shotRecGeom.receivers.map((r: any, i: number) => {
              const sx = (r.x / (shotRecGeom.receivers.length * 33)) * 760 + 20;
              return (
                <motion.g key={`rx${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  <line x1={sx} y1={180} x2={sx} y2={190} stroke="#06b6d4" strokeWidth={2} />
                  <circle cx={sx} cy={180} r={4} fill="#06b6d4" opacity={0.6} />
                  {i % 8 === 0 && <text x={sx} y={165} textAnchor="middle" fill="#06b6d480" fontSize={8}>R{i}</text>}
                </motion.g>
              );
            })}
            
            {/* Shots (top dots with rays) */}
            {shotRecGeom.shots.map((s: any, si: number) => {
              const sx = (s.x / (shotRecGeom.shots.length * 50)) * 760 + 20;
              return (
                <motion.g key={`s${si}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: si * 0.1 }}>
                  <circle cx={sx} cy={20} r={6} fill="#f59e0b" />
                  <text x={sx} y={12} textAnchor="middle" fill="#f59e0b" fontSize={8}>S{si}</text>
                  {/* Ray paths to first 12 receivers */}
                  {shotRecGeom.receivers.slice(0, 12).map((r: any, ri: number) => {
                    const rx = (r.x / (shotRecGeom.receivers.length * 33)) * 760 + 20;
                    return (
                      <line key={`ray${si}${ri}`} x1={sx} y1={26} x2={rx} y2={176} stroke="#f59e0b20" strokeWidth={0.5} />
                    );
                  })}
                </motion.g>
              );
            })}
            
            {/* Midpoints */}
            {shotRecGeom.midpoints.filter((_: any, i: number) => i % 10 === 0).map((mp: any, i: number) => {
              const mx = (mp.x / (shotRecGeom.midpoints[shotRecGeom.midpoints.length - 1]?.x || 800)) * 760 + 20;
              return (
                <circle key={`mp${i}`} cx={mx} cy={100} r={2} fill="#a855f7" opacity={0.4} />
              );
            })}
            
            {/* Labels */}
            <text x={400} y={15} textAnchor="middle" fill="#f59e0b80" fontSize={10} fontWeight="bold">SHOTS</text>
            <text x={400} y={175} textAnchor="middle" fill="#06b6d480" fontSize={10} fontWeight="bold">RECEIVERS</text>
            <text x={400} y={105} textAnchor="middle" fill="#a855f780" fontSize={10} fontWeight="bold">CMPs</text>
          </svg>
        </div>
      )}
      
      {isGeochem && (
        <div className="glass-card p-6 rounded-2xl border-white/5 bg-black/20 h-[400px]">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-4">
            Geochemical Survey Grid — C₁ Concentration
          </h4>
          <svg viewBox="0 0 400 400" className="w-full h-full max-h-[300px]">
            {geochemGrid.map((pt: any, idx: number) => {
              const cx = (pt.x_km / Math.sqrt(geochemGrid.length > 0 ? (pt.x_km || 1) : 1)) * 360 + 20;
              const cy = (pt.y_km / Math.sqrt(geochemGrid.length > 0 ? (pt.y_km || 1) : 1)) * 360 + 20;
              const intensity = Math.min(1, pt.C1_ppm / 200);
              const r = pt.classification === 'macro_seep' ? 8 : pt.classification === 'micro_seep' ? 5 : 3;
              const color = pt.classification === 'macro_seep' ? '#ef4444' : pt.classification === 'micro_seep' ? '#f59e0b' : '#64748b';
              return <circle key={idx} cx={cx} cy={cy} r={r} fill={color} opacity={0.5 + intensity * 0.5} />;
            })}
            {/* Legend */}
            <rect x={10} y={350} width={380} height={40} rx={8} fill="#00000060" />
            <circle cx={30} cy={370} r={4} fill="#ef4444" /><text x={40} y={374} fill="#94a3b8" fontSize={9}>Macro-seep</text>
            <circle cx={120} cy={370} r={4} fill="#f59e0b" /><text x={130} y={374} fill="#94a3b8" fontSize={9}>Micro-seep</text>
            <circle cx={220} cy={370} r={4} fill="#64748b" /><text x={230} y={374} fill="#94a3b8" fontSize={9}>Background</text>
          </svg>
        </div>
      )}
      
      {!isSeismic && !isGeochem && (
        <div className="glass-card p-8 rounded-2xl border-white/5 bg-black/20 text-center">
          <Map className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm">Layout visualization available for seismic and geochemical surveys.</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPARE TAB
// ═══════════════════════════════════════════════════════════════════════════════

function CompareTab({ costComparison, surveyArea }: { costComparison: { surveyType: string; costLowUSD: number; costHighUSD: number; typicalDurationDays: number }[]; surveyArea: number }) {
  const chartData = costComparison.map(c => ({
    name: c.surveyType,
    'Low (USD)': c.costLowUSD,
    'High (USD)': c.costHighUSD,
    Days: c.typicalDurationDays,
  }));
  
  return (
    <div className="space-y-6">
      <SectionHeader title="Survey Cost Comparison" subtitle="Low–High Range by Method" />
      <p className="text-[10px] text-slate-500">All surveys benchmarked for {surveyArea} km² area</p>
      
      <div className="glass-card p-6 rounded-2xl border-white/5 bg-black/20 h-[350px]">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-4">Cost Range by Survey Type</h4>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 9 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <RechartTooltip formatter={(value: any) => `$${formatNumber(Number(value))}`} contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #4c1d95', borderRadius: 12 }} labelStyle={{ color: '#fff', fontSize: 10 }} />
            <Bar dataKey="Low (USD)" barSize={14} fill="#a855f7" radius={[0, 0, 0, 0]} />
            <Bar dataKey="High (USD)" barSize={14} fill="#f59e0b" radius={[0, 6, 6, 0]} opacity={0.5} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {costComparison.map(c => (
          <div key={c.surveyType} className="glass-card p-3 rounded-xl border-white/5 bg-black/20">
            <p className="text-[11px] text-slate-500 font-bold uppercase">{c.surveyType}</p>
            <p className="text-white font-black text-xs">${formatNumber(c.costLowUSD)}–${formatNumber(c.costHighUSD)}</p>
            <p className="text-[11px] text-slate-600">{c.typicalDurationDays} days</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFERENCES TAB
// ═══════════════════════════════════════════════════════════════════════════════

function ReferencesTab() {
  const [filter, setFilter] = useState<string>('all');
  const categories = ['all', 'seismic', 'gravity', 'magnetic', 'em', 'geochem', 'survey_design'];
  const filtered = filter === 'all' ? GEOPHYSICS_PAPERS : GEOPHYSICS_PAPERS.filter(p => p.category === filter);
  
  return (
    <div className="space-y-6">
      <SectionHeader title="Academic References" subtitle="Cited Papers & Textbooks" />
      
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider',
              filter === cat ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10'
            )}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((paper, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="glass-card p-4 rounded-xl border-white/5 bg-black/20 hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] text-white font-bold leading-snug">{paper.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{paper.authors} · {paper.year} · <span className="italic">{paper.journal}</span></p>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{paper.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-black uppercase',
                  paper.difficulty === 'Basic' ? 'bg-emerald-500/20 text-emerald-400' :
                  paper.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-rose-500/20 text-rose-400'
                )}>{paper.difficulty}</span>
                <span className="text-[10px] text-purple-500 font-bold uppercase">{paper.keyConcept}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED MICRO COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function StatBadge({ label, value, color }: { label: string; value: string; color: 'purple' | 'blue' | 'green' | 'amber' | 'red' }) {
  const colorMap = {
    purple: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
    blue: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
    green: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    amber: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
    red: 'border-red-500/30 bg-red-500/5 text-red-400',
  };
  return (
    <div className={cn('p-3 rounded-xl border', colorMap[color])}>
      <p className="text-[10px] uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-sm font-black mt-0.5">{value}</p>
    </div>
  );
}