import React, { useState, useMemo } from 'react';
import { 
  Plus,
  Activity,
  ExternalLink,
  Search,
  Layers,
  Zap,
  Radio,
  Box,
  Calculator,
  Shield,
  BarChart3,
  PieChart,
  Library,
  Waves,
  Filter,
  Compass,
  MapPin,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { 
  calculateAcousticImpedance, 
  calculateReflectionCoefficient, 
  calculateNMO, 
  calculateDixVelocity, 
  calculateVerticalResolution, 
  calculateFresnelZone, 
  generateRickerWavelet,
  calculateFreeAirCorrection,
  calculateBouguerSlabCorrection,
  estimateSourceDepth,
  estimateBasementDepthMagnetic
} from '../../lib/geophysics';
import { 
  LITHOLOGY_DATABASE, 
  MATURITY_WINDOWS,
  classifyKerogen,
  getMaturityInfo
} from '../../lib/geology';
import {
  calculatePg,
  runVolumetricSimulation,
  getPercentiles,
  RiskFactors,
  VolumetricInputs
} from '../../lib/prospect';
import { ACADEMIC_LIBRARY } from '../../lib/references';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { InputWithSlider, DataRow, SectionHeader } from '../SharedUI';
import { 
  GLOBAL_BASIN_DATABASE, 
  PETROLEUM_SYSTEM_CHECKLIST, 
  FLUID_CLASSIFICATION,
  SEISMIC_ACQUISITION_DESIGN,
  VELOCITY_MODEL_REFERENCE
} from '../../lib/exploration_data';

import { FormationDatabaseTab } from './FormationDatabaseTab';
import { ProspectNeuralSimulator } from './ProspectNeuralSimulator';

// ─── Well Planning Imports ───
import {
  WellLocation,
  FaultBoundary,
  SurfaceConstraint,
  OptimalLocationResult,
  TrajectoryDesign,
  WellTrajectoryType,
  StratigraphyPrognosis,
  FormationTop,
  PorePressureProfile,
  PorePressureResult,
  CasingProgram,
  CasingString,
  MudWeightSchedule,
  WirelineLog,
  LoggingProgram,
  CoringInterval,
  FluidSamplePoint,
  AFEBreakdownItem,
  AFEResult,
  RiskItem,
  RiskAssessment,
  DecisionTreeNode,
  FIDResult,
  RegulatoryStatus,
  calculateOptimalCrestalPosition,
  assessFaultProximityRisk,
  evaluateSurfaceConstraints,
  designExplorationTrajectory,
  prognoseFormationTops,
  estimatePorePressureEaton,
  calculateFractureGradientMatthewsKelly,
  buildPorePressureProfile,
  designCasingProgram,
  calculateMudWeightSchedule,
  designLoggingProgram,
  designCoringProgram,
  estimateAFE,
  assessExplorationRisk,
  calculateDecisionTree,
  assessRegulatoryReadiness,
} from '../../lib/well_planning';
import {
  CrestalPositionMap,
  TrajectoryProfile,
  PorePressureChart,
  CasingSchematic,
  LoggingProgramSVG,
  CoringSamplingSVG,
  AFECostBreakdownSVG,
  RiskMatrixSVG,
  DecisionTreeSVG,
  RegulatoryTimelineSVG,
  StratigraphyColumnSVG,
} from './WellPlanningSVGs';

export function ExplorationStage() {
  const [explorationSubTab, setExplorationSubTab] = useState<
    'seismic' | 'surface' | 'basin' | 'geophysics' | 'evaluation' | 'reference' | 'visualization' | 'formations' | 'well_planning'
  >('seismic');
  
  // Seismic State
  const [velocity, setVelocity] = useState(3250);
  const [twt, setTwt] = useState(4.5);
  const [elevation, setElevation] = useState(1500);
  const [picks, setPicks] = useState<{well: string, depth: number, formation: string}[]>([]);
  
  const calculatedDepth = useMemo(() => (velocity * twt) / 2, [velocity, twt]);
  const calculatedBouguer = useMemo(() => calculateBouguerSlabCorrection(elevation, 2.67), [elevation]);

  // Surface Geology State
  const [dipAngle, setDipAngle] = useState(15);
  const [strikeAngle, setStrikeAngle] = useState(45);
  const [apparentThickness, setApparentThickness] = useState(100);
  const [gpsCoords, setGpsCoords] = useState({ lat: 28.54, lon: -90.41 });
  const [outcrops, setOutcrops] = useState<{lat: number, lon: number, formation: string, lithology: string}[]>([]);
  const calculatedTST = useMemo(() => apparentThickness * Math.cos(dipAngle * Math.PI / 180), [apparentThickness, dipAngle]);

  // Basin Intelligence State
  const [toc, setToc] = useState(2.4);
  const [hydrogenIndex, setHydrogenIndex] = useState(450);
  const [oxygenIndex, setOxygenIndex] = useState(25);
  const [vitriniteReflectance, setVitriniteReflectance] = useState(0.85);
  const [burialEvents, setBurialEvents] = useState([
    { age: 150, depth: 0, event: 'Deposition Start' },
    { age: 100, depth: 1200, event: 'Rapid Subsidence' },
    { age: 60, depth: 2500, event: 'Maximum Burial' },
    { age: 0, depth: 2200, event: 'Present Day' }
  ]);

  const kerogenType = useMemo(() => classifyKerogen(hydrogenIndex, oxygenIndex), [hydrogenIndex, oxygenIndex]);
  const maturityInfo = useMemo(() => getMaturityInfo(vitriniteReflectance), [vitriniteReflectance]);
  const sortedBurialHistory = useMemo(() => [...burialEvents].sort((a,b) => b.age - a.age), [burialEvents]);

  const addBurialEvent = () => {
    setBurialEvents([...burialEvents, { age: 0, depth: 0, event: 'New Event' }]);
  };

  const removeBurialEvent = (index: number) => {
    setBurialEvents(burialEvents.filter((_, i) => i !== index));
  };

  // Geophysics State
  const [seismicFreq, setSeismicFreq] = useState(30);
  const [seismicOffset, setSeismicOffset] = useState(1000);
  const [vAbove, setVAbove] = useState(2500);
  const [vBelow, setVBelow] = useState(3000);
  const [rhoAbove, setRhoAbove] = useState(2.2);
  const [rhoBelow, setRhoBelow] = useState(2.4);
  const [magIntensity, setMagIntensity] = useState(48000);
  const [magAnomWidth, setMagAnomWidth] = useState(500);
  const [magDiurnal, setMagDiurnal] = useState(25);
  const [vrms1, setVrms1] = useState(2000);
  const [t1, setT1] = useState(1.0);
  const [vrms2, setVrms2] = useState(2500);
  const [t2, setT2] = useState(1.5);

  const aiAbove = useMemo(() => calculateAcousticImpedance(vAbove, rhoAbove), [vAbove, rhoAbove]);
  const aiBelow = useMemo(() => calculateAcousticImpedance(vBelow, rhoBelow), [vBelow, rhoBelow]);
  const rc = useMemo(() => calculateReflectionCoefficient(aiAbove, aiBelow), [aiAbove, aiBelow]);
  const nmoCorrection = useMemo(() => calculateNMO(twt, seismicOffset, velocity), [twt, seismicOffset, velocity]);
  const intervalVelocity = useMemo(() => calculateDixVelocity(vrms1, t1, vrms2, t2), [vrms1, t1, vrms2, t2]);
  const verticalRes = useMemo(() => calculateVerticalResolution(velocity, seismicFreq), [velocity, seismicFreq]);
  const fresnelZone = useMemo(() => calculateFresnelZone(velocity, twt, seismicFreq), [velocity, twt, seismicFreq]);
  const rickerWavelet = useMemo(() => generateRickerWavelet(seismicFreq, 0.1), [seismicFreq]);
  const freeAirCorr = useMemo(() => calculateFreeAirCorrection(elevation), [elevation]);
  const bouguerSlabCorr = useMemo(() => calculateBouguerSlabCorrection(elevation, 2.67), [elevation]);
  const sourceDepth = useMemo(() => estimateBasementDepthMagnetic(magAnomWidth), [magAnomWidth]);

  // Risk & Volumetrics State
  const [riskFactors, setRiskFactors] = useState<RiskFactors>({
    source: 0.8,
    reservoir: 0.7,
    trap: 0.9,
    seal: 0.8,
    migration: 0.85
  });
  const [volInputs, setVolInputs] = useState<VolumetricInputs>({
    area: { min: 500, base: 1200, max: 3000 },
    netPay: { min: 20, base: 45, max: 100 },
    porosity: { min: 0.12, base: 0.18, max: 0.25 },
    sw: { min: 0.2, base: 0.3, max: 0.45 },
    bo: 1.25
  });
  const pg = useMemo(() => calculatePg(riskFactors), [riskFactors]);
  const simulationResults = useMemo(() => runVolumetricSimulation(volInputs, 1000), [volInputs]);

  // Visualization State
  const [structuralData, setStructuralData] = useState<{strike: number, dip: number}[]>([
    { strike: 45, dip: 30 },
    { strike: 50, dip: 35 },
    { strike: 40, dip: 28 },
    { strike: 135, dip: 60 },
    { strike: 130, dip: 55 },
    { strike: 220, dip: 15 },
  ]);
  const [structuralDeformity, setStructuralDeformity] = useState(1);
  const [refSearchTerm, setRefSearchTerm] = useState('');

  // ═══════════════════════════════════════════════════════════════════════
  // WELL PLANNING STATE
  // ═══════════════════════════════════════════════════════════════════════
  const [wpSubTab, setWpSubTab] = useState<'location' | 'trajectory' | 'stratigraphy' | 'pore_pressure' | 'casing' | 'mud' | 'logging' | 'coring' | 'afe' | 'risk' | 'decision_tree' | 'regulatory'>('location');

  // Location State
  const [wpStructuralPoints, setWpStructuralPoints] = useState([
    { x: 100, y: 200, depthFt: 8500 },
    { x: 300, y: 150, depthFt: 8200 },
    { x: 500, y: 250, depthFt: 8700 },
    { x: 200, y: 400, depthFt: 8800 },
    { x: 400, y: 350, depthFt: 8600 },
  ]);
  const [wpFaults] = useState<FaultBoundary[]>([
    { name: 'Fault A', faultX1: 80, faultY1: 80, faultX2: 520, faultY2: 100, throwFt: 200, sealingPotential: 'good' },
    { name: 'Fault B', faultX1: 50, faultY1: 350, faultX2: 450, faultY2: 380, throwFt: 350, sealingPotential: 'moderate' },
    { name: 'Fault C', faultX1: 350, faultY1: 50, faultX2: 380, faultY2: 500, throwFt: 150, sealingPotential: 'poor' },
  ]);
  const [wpSurfaceConstraints] = useState<SurfaceConstraint[]>([
    { type: 'pipeline', centerX: 250, centerY: 250, radiusFt: 60, description: 'Existing gas pipeline corridor' },
    { type: 'environmental', centerX: 400, centerY: 150, radiusFt: 80, description: 'Marine protected area boundary' },
    { type: 'shipping_lane', centerX: 100, centerY: 400, radiusFt: 50, description: 'Approved shipping fairway' },
  ]);

  // Trajectory State
  const [wpKOP, setWpKOP] = useState(3500);
  const [wpBuildRate, setWpBuildRate] = useState(2.5);
  const [wpTargetTVD, setWpTargetTVD] = useState(11000);
  const [wpTangentAngle, setWpTangentAngle] = useState(35);
  const [wpHorizontalTarget, setWpHorizontalTarget] = useState(2500);
  const [wpTrajectoryType, setWpTrajectoryType] = useState<WellTrajectoryType>('deviated');

  // Stratigraphy State
  const [wpVelocityLayers, setWpVelocityLayers] = useState([
    { intervalVelocityFtPerS: 6500, thicknessFt: 2000, formationName: 'Upper Miocene', lithology: 'sand-shale', porosity: 0.28 },
    { intervalVelocityFtPerS: 8000, thicknessFt: 1500, formationName: 'Middle Miocene', lithology: 'shale', porosity: 0.18 },
    { intervalVelocityFtPerS: 9500, thicknessFt: 1200, formationName: 'Lower Miocene', lithology: 'sandstone', porosity: 0.15 },
    { intervalVelocityFtPerS: 10500, thicknessFt: 800, formationName: 'Oligocene', lithology: 'carbonate', porosity: 0.12 },
    { intervalVelocityFtPerS: 12000, thicknessFt: 1500, formationName: 'Eocene', lithology: 'limestone', porosity: 0.08 },
  ]);
  const [wpSeismicConfidence, setWpSeismicConfidence] = useState(0.75);

  // Pore Pressure State
  const [wpNCT, setWpNCT] = useState(8500);
  const [wpEatonExp, setWpEatonExp] = useState(1.2);
  const [wpOBGradient, setWpOBGradient] = useState(1.0);
  const [wpPoissonsRatio, setWpPoissonsRatio] = useState(0.28);
  const [wpMaxDepth, setWpMaxDepth] = useState(14000);

  // Casing State
  const [wpConductorDepth, setWpConductorDepth] = useState(350);
  const [wpSurfaceDepth, setWpSurfaceDepth] = useState(3500);
  const [wpIntermediateDepth, setWpIntermediateDepth] = useState(9000);
  const [wpProductionDepth, setWpProductionDepth] = useState(12000);
  const [wpDesignFactor, setWpDesignFactor] = useState(1.15);

  // Logging State
  const [wpLogTVDTop, setWpLogTVDTop] = useState(1000);
  const [wpLogTVDBase, setWpLogTVDBase] = useState(11000);

  // Coring State
  const [wpCoringIntervals, setWpCoringIntervals] = useState<{ depthTopFt: number; depthBaseFt: number; coreType: 'conventional' | 'sidewall' | 'pressure'; objective: string }[]>([
    { depthTopFt: 7000, depthBaseFt: 7160, coreType: 'conventional', objective: 'Reservoir zone characterization' },
    { depthTopFt: 9800, depthBaseFt: 9860, coreType: 'pressure', objective: 'Pressure-preserved source rock' },
  ]);

  // AFE State
  const [wpSpreadRate, setWpSpreadRate] = useState(350000);
  const [wpDryHoleDays, setWpDryHoleDays] = useState(45);

  // Risk State
  const [wpRiskPg, setWpRiskPg] = useState(0.35);

  // FID State
  const [wpWacc, setWpWacc] = useState(10);
  const [wpOilPrice, setWpOilPrice] = useState(75);

  // Regulatory State
  const [wpJurisdiction, setWpJurisdiction] = useState('US GoM (Federal Waters)');

  // ═══════════════════════════════════════════════════════════════════════
  // WELL PLANNING COMPUTED VALUES
  // ═══════════════════════════════════════════════════════════════════════

  // Location calculations
  const crestalResult = useMemo(() =>
    calculateOptimalCrestalPosition(wpStructuralPoints),
    [wpStructuralPoints]
  );

  const faultRisk = useMemo(() =>
    assessFaultProximityRisk(crestalResult.crestalX, crestalResult.crestalY, wpFaults),
    [crestalResult.crestalX, crestalResult.crestalY, wpFaults]
  );

  const surfaceEval = useMemo(() =>
    evaluateSurfaceConstraints(crestalResult.crestalX, crestalResult.crestalY, wpSurfaceConstraints),
    [crestalResult.crestalX, crestalResult.crestalY, wpSurfaceConstraints]
  );

  // Trajectory design
  const trajectory = useMemo(() =>
    designExplorationTrajectory(wpKOP, wpBuildRate, wpTargetTVD, wpTangentAngle, wpHorizontalTarget, wpTrajectoryType),
    [wpKOP, wpBuildRate, wpTargetTVD, wpTangentAngle, wpHorizontalTarget, wpTrajectoryType]
  );

  // Stratigraphy prognosis
  const stratigraphy = useMemo(() =>
    prognoseFormationTops(wpVelocityLayers, wpSeismicConfidence),
    [wpVelocityLayers, wpSeismicConfidence]
  );

  // Pore pressure profile
  const porePressureProfile = useMemo(() => {
    const velProfile: number[] = [];
    const totalPoints = Math.floor(wpMaxDepth / 200);
    for (let i = 0; i < totalPoints; i++) {
      const depth = i * 200;
      let vel = 7000 + depth * 0.3;
      // Apply layering effect from velocity model
      for (const layer of wpVelocityLayers) {
        let cumulativeDepth = 0;
        for (const l of wpVelocityLayers) {
          if (depth >= cumulativeDepth && depth < cumulativeDepth + l.thicknessFt) {
            vel = l.intervalVelocityFtPerS;
            break;
          }
          cumulativeDepth += l.thicknessFt;
        }
      }
      velProfile.push(vel);
    }
    return buildPorePressureProfile(200, wpMaxDepth, velProfile, wpNCT, wpEatonExp, wpOBGradient, wpPoissonsRatio);
  }, [wpMaxDepth, wpNCT, wpEatonExp, wpOBGradient, wpPoissonsRatio, wpVelocityLayers]);

  // Max pore pressure and frac gradient for casing design
  const maxPP = useMemo(() => {
    if (porePressureProfile.points.length === 0) return 10;
    return Math.max(...porePressureProfile.points.map(p => p.porePressurePpg));
  }, [porePressureProfile]);

  const maxFG = useMemo(() => {
    if (porePressureProfile.points.length === 0) return 14;
    return Math.max(...porePressureProfile.points.map(p => p.fractureGradientPpg));
  }, [porePressureProfile]);

  // Casing program
  const casingProgram = useMemo(() =>
    designCasingProgram(wpConductorDepth, wpSurfaceDepth, wpIntermediateDepth, wpProductionDepth, maxPP, maxFG, wpDesignFactor),
    [wpConductorDepth, wpSurfaceDepth, wpIntermediateDepth, wpProductionDepth, maxPP, maxFG, wpDesignFactor]
  );

  // Mud weight schedule
  const mudSchedule = useMemo(() => {
    const sections = [
      { name: 'Conductor', from: 0, to: wpConductorDepth, porePressurePpg: 8.6, fracGradientPpg: 12 },
      { name: 'Surface', from: wpConductorDepth, to: wpSurfaceDepth, porePressurePpg: 9.0, fracGradientPpg: 13 },
      { name: 'Intermediate', from: wpSurfaceDepth, to: wpIntermediateDepth, porePressurePpg: maxPP, fracGradientPpg: maxFG },
      { name: 'Production', from: wpIntermediateDepth, to: wpProductionDepth, porePressurePpg: maxPP, fracGradientPpg: maxFG },
    ];
    return calculateMudWeightSchedule(sections);
  }, [wpConductorDepth, wpSurfaceDepth, wpIntermediateDepth, wpProductionDepth, maxPP, maxFG]);

  // Logging program
  const loggingProgram = useMemo(() =>
    designLoggingProgram(wpLogTVDTop, wpLogTVDBase),
    [wpLogTVDTop, wpLogTVDBase]
  );

  // Coring program
  const coringProgram = useMemo(() =>
    designCoringProgram(wpCoringIntervals.map(ci => ({
      ...ci,
      expectedRecoveryPct: ci.coreType === 'pressure' ? 95 : 85,
      costPerFt: ci.coreType === 'pressure' ? 1800 : ci.coreType === 'conventional' ? 600 : 350,
    }))),
    [wpCoringIntervals]
  );

  // AFE
  const afe = useMemo(() =>
    estimateAFE(trajectory.totalMeasuredDepthFt, casingProgram, loggingProgram, coringProgram, wpSpreadRate, wpDryHoleDays),
    [trajectory.totalMeasuredDepthFt, casingProgram, loggingProgram, coringProgram, wpSpreadRate, wpDryHoleDays]
  );

  // Risk assessment — build risk items from trajectory and pore pressure
  const riskAssessment = useMemo(() => {
    const riskItems: Omit<RiskItem, 'riskScore' | 'riskLevel' | 'residualScore'>[] = [
      { id: 'dry-hole', description: 'Dry hole — no commercial hydrocarbons', category: 'geological', likelihood: Math.round((1 - wpRiskPg) * 5), consequence: 5, residualLikelihood: Math.max(1, Math.round((1 - wpRiskPg) * 5) - 1), residualConsequence: 4, mitigation: 'Amplitude-supported target; adjacent well control' },
      { id: 'overpressure', description: 'Overpressure kick / influx', category: 'operational', likelihood: maxPP > 14 ? 4 : 2, consequence: 4, residualLikelihood: 2, residualConsequence: 3, mitigation: 'Mud weight +30% above pore pressure; BOP stack testing' },
      { id: 'stuck-pipe', description: 'Differential sticking in depleted zones', category: 'operational', likelihood: 3, consequence: 3, residualLikelihood: 2, residualConsequence: 2, mitigation: 'LCM sweeps; rotating BHA; minimize stationary time' },
      { id: 'lost-circulation', description: 'Lost circulation in fractured carbonates', category: 'operational', likelihood: trajectory.tangentAngleDeg > 45 ? 3 : 1, consequence: 3, residualLikelihood: 1, residualConsequence: 2, mitigation: 'LCM pills; managed pressure drilling' },
      { id: 'trajectory-error', description: 'Wellbore position uncertainty exceeding target tolerance', category: 'operational', likelihood: 2, consequence: 3, residualLikelihood: 1, residualConsequence: 2, mitigation: 'MWD + gyro surveys every 100 ft' },
      { id: 'cost-overrun', description: 'AFE cost overrun > 25%', category: 'commercial', likelihood: 3, consequence: 4, residualLikelihood: 2, residualConsequence: 3, mitigation: '15% contingency + risk allowance' },
    ];
    return assessExplorationRisk(riskItems);
  }, [wpRiskPg, maxPP, trajectory]);

  // FID decision tree
  const fidResult = useMemo(() => {
    const successNpv = afe.totalCostUsd * 3.5; // Simplified: 3.5x investment return on success
    const dryHoleCost = afe.dryHoleCostUsd;
    const farmoutValue = afe.totalCostUsd * 0.15; // 15% of AFE as farmout value
    const deferCost = afe.totalCostUsd * 0.05; // 5% to defer
    return calculateDecisionTree(afe.totalCostUsd, successNpv, dryHoleCost, wpRiskPg, farmoutValue, deferCost, 0.05, wpWacc);
  }, [afe.totalCostUsd, afe.dryHoleCostUsd, wpRiskPg, wpWacc]);

  // Regulatory
  const regulatory = useMemo(() => {
    const jurisdictionKey = wpJurisdiction.startsWith('US') ? 'US GOM' : wpJurisdiction.startsWith('UK') ? 'North Sea' : 'default';
    const somePermits = jurisdictionKey === 'US GOM' ? ['BOEM APD', 'MMS Lease', 'Coast Guard'] : jurisdictionKey === 'North Sea' ? ['OGA License', 'HSE Safety Case'] : ['Exploration License'];
    const sensitivity = afe.totalCostUsd > 50e6 ? 'high' as const : afe.totalCostUsd > 20e6 ? 'moderate' as const : 'low' as const;
    return assessRegulatoryReadiness(jurisdictionKey, somePermits, sensitivity);
  }, [wpJurisdiction, afe.totalCostUsd]);

  return (
    <div className="flex flex-col h-full bg-app-bg transition-all duration-150">
      {/* Exploration Sub-navigation */}
      <div className="flex gap-1 p-1 bg-panel-bg border-b border-border-subtle shrink-0 flex-wrap">
        {[
          { id: 'seismic', label: 'Seismic' },
          { id: 'surface', label: 'Surface' },
          { id: 'basin', label: 'Basin Analysis' },
          { id: 'geophysics', label: 'Surveys' },
          { id: 'evaluation', label: 'Risk/Vol.' },
          { id: 'well_planning', label: 'Well Planning' },
          { id: 'reference', label: 'Library' },
          { id: 'formations', label: 'Formations' },
          { id: 'visualization', label: 'Structural' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setExplorationSubTab(tab.id as any)}
            className={cn(
              "px-4 py-1.5 rounded text-[11px] font-bold uppercase tracking-tight transition-colors",
              explorationSubTab === tab.id ? "bg-brand-primary text-white" : "text-text-tertiary hover:bg-hover-bg hover:text-text-primary"
            )}
          >{tab.label}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
         <ProspectNeuralSimulator />
         
         <div className="mt-4">
            {explorationSubTab === 'seismic' && (
              <div className="flex h-[800px]">
                <div className="w-[320px] bg-panel-bg border-r border-border-subtle p-4 overflow-y-auto shrink-0 scrollbar-hide">
                  <SectionHeader title="Seismic Parameters" subtitle="Migration Profile: Kirchhoff" />
                  <div className="space-y-4">
                    <InputWithSlider label="Avg. Velocity" value={velocity} min={1500} max={6000} step={10} unit="m/s" onChange={setVelocity} />
                    <InputWithSlider label="Two-Way Time" value={twt} min={0} max={10} step={0.01} unit="sec" onChange={setTwt} />
                    <InputWithSlider label="Datum Elevation" value={elevation} min={-500} max={5000} step={10} unit="m" onChange={setElevation} />
                  </div>
                  <div className="mt-8">
                    <SectionHeader title="Calculated Results" />
                    <div className="bg-app-bg border border-border-subtle rounded p-2">
                      <DataRow label="Target Depth" value={calculatedDepth} unit="m" precision={1} source="D = (V * T) / 2" />
                      <DataRow label="Bouguer Correction" value={calculatedBouguer} unit="mGal" precision={2} source="Bullard 1967" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto duration-150">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="industry-card p-4 rounded-lg">
                      <SectionHeader title="Seismic Acquisition Design" subtitle="Technical Specifications" />
                      <div className="space-y-4">
                        {SEISMIC_ACQUISITION_DESIGN.map((design, i) => (
                          <div key={i} className="p-3 bg-app-bg border border-border-subtle rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-brand-primary uppercase">{design.method}</span>
                            </div>
                            <p className="text-[10px] text-text-secondary mb-2 italic">Source: {design.source}</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-border-subtle/30 pt-2">
                              {Object.entries(design.params).map(([key, val]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-[11px] text-text-tertiary uppercase">{key}</span>
                                  <span className="text-[10px] text-text-primary data-mono">{val}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {explorationSubTab === 'surface' && (
              <div className="flex h-[800px]">
                <div className="w-[320px] bg-panel-bg border-r border-border-subtle p-4 overflow-y-auto shrink-0 scrollbar-hide">
                  <SectionHeader title="Field Compass Data" />
                  <div className="space-y-4">
                    <InputWithSlider label="Dip Angle" value={dipAngle} min={0} max={90} step={1} unit="deg" onChange={setDipAngle} />
                    <InputWithSlider label="Strike Angle" value={strikeAngle} min={0} max={360} step={1} unit="deg" onChange={setStrikeAngle} />
                  </div>
                </div>
              </div>
            )}

            {explorationSubTab === 'basin' && (
               <div className="p-4 bg-panel-bg rounded-lg border border-border-subtle">
                  <SectionHeader title="Source Properties" subtitle="Petroleum Systems Modeling" />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <InputWithSlider label="TOC" value={toc} min={0} max={15} step={0.1} unit="wt%" onChange={setToc} />
                    <InputWithSlider label="HI" value={hydrogenIndex} min={0} max={1000} step={10} unit="mg/g" onChange={setHydrogenIndex} />
                    <InputWithSlider label="OI" value={oxygenIndex} min={0} max={200} step={5} unit="mg/g" onChange={setOxygenIndex} />
                    <InputWithSlider label="Vitrinite" value={vitriniteReflectance} min={0.2} max={3.5} step={0.01} unit="Ro%" onChange={setVitriniteReflectance} />
                  </div>
               </div>
            )}

            {explorationSubTab === 'geophysics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="industry-card p-4">
                   <SectionHeader title="Signal Analysis" />
                   <InputWithSlider label="Peak Freq." value={seismicFreq} min={5} max={100} step={1} unit="Hz" onChange={setSeismicFreq} />
                 </div>
              </div>
            )}

            {explorationSubTab === 'evaluation' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="industry-card p-4">
                   <SectionHeader title="Success Spectrum" />
                   <p className="text-4xl font-black text-brand-primary">{(pg * 100).toFixed(1)}%</p>
                 </div>
              </div>
            )}

            {explorationSubTab === 'formations' && <FormationDatabaseTab />}
            
            {explorationSubTab === 'reference' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {ACADEMIC_LIBRARY.slice(0, 6).map(paper => (
                   <div key={paper.id} className="industry-card p-4">
                     <h5 className="text-xs font-bold text-white uppercase">{paper.title}</h5>
                     <p className="text-[10px] text-slate-500 mt-2">{paper.authors}</p>
                   </div>
                 ))}
              </div>
            )}

            {explorationSubTab === 'visualization' && (
              <div className="h-[400px] bg-black rounded-lg border border-white/5 flex items-center justify-center">
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest">3D Structural Engine Initializing...</p>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                WELL PLANNING TAB
                ═══════════════════════════════════════════════════════ */}
            {explorationSubTab === 'well_planning' && (
              <div className="flex flex-col gap-4">
                {/* Well Planning Sub-navigation */}
                <div className="flex gap-1 p-1 bg-panel-bg border border-border-subtle rounded-lg shrink-0 flex-wrap">
                  {[
                    { id: 'location', label: 'Location', icon: MapPin },
                    { id: 'trajectory', label: 'Trajectory', icon: Compass },
                    { id: 'stratigraphy', label: 'Stratigraphy', icon: Layers },
                    { id: 'pore_pressure', label: 'Pore Pressure', icon: TrendingUp },
                    { id: 'casing', label: 'Casing', icon: Box },
                    { id: 'mud', label: 'Mud Program', icon: Waves },
                    { id: 'logging', label: 'Logging', icon: Activity },
                    { id: 'coring', label: 'Coring/Samp.', icon: Filter },
                    { id: 'afe', label: 'AFE Cost', icon: Calculator },
                    { id: 'risk', label: 'Risk', icon: AlertTriangle },
                    { id: 'decision_tree', label: 'FID', icon: BarChart3 },
                    { id: 'regulatory', label: 'Regulatory', icon: Shield },
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setWpSubTab(tab.id as any)}
                        className={cn(
                          "px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-tight transition-colors flex items-center gap-1",
                          wpSubTab === tab.id ? "bg-brand-primary text-white" : "text-text-tertiary hover:bg-hover-bg hover:text-text-primary"
                        )}
                      >
                        <Icon size={12} /> {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* ─── 1. WELL LOCATION OPTIMIZATION ─── */}
                {wpSubTab === 'location' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="industry-card p-4 xl:col-span-2">
                      <SectionHeader title="Crestal Position & Surface Assessment" subtitle="Weighted interpolation from structural grid" />
                      <CrestalPositionMap
                        points={wpStructuralPoints}
                        faults={wpFaults}
                        constraints={wpSurfaceConstraints}
                        wellX={crestalResult.crestalX}
                        wellY={crestalResult.crestalY}
                        crestalX={crestalResult.crestalX}
                        crestalY={crestalResult.crestalY}
                      />
                    </div>
                    <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-4">
                      <SectionHeader title="Structural Grid" subtitle="Edit 5 control points" />
                      {wpStructuralPoints.map((pt, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <span className="text-[11px] text-text-tertiary w-4">P{i+1}</span>
                          <div className="flex-1 grid grid-cols-3 gap-1">
                            <div className="flex flex-col">
                              <label className="text-[10px] text-text-tertiary uppercase">X</label>
                              <input
                                type="number"
                                value={pt.x}
                                onChange={e => {
                                  const updated = [...wpStructuralPoints];
                                  updated[i] = { ...pt, x: Number(e.target.value) };
                                  setWpStructuralPoints(updated);
                                }}
                                className="w-full bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[10px] text-text-primary"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-[10px] text-text-tertiary uppercase">Y</label>
                              <input
                                type="number"
                                value={pt.y}
                                onChange={e => {
                                  const updated = [...wpStructuralPoints];
                                  updated[i] = { ...pt, y: Number(e.target.value) };
                                  setWpStructuralPoints(updated);
                                }}
                                className="w-full bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[10px] text-text-primary"
                              />
                            </div>
                            <div className="flex flex-col">
                              <label className="text-[10px] text-text-tertiary uppercase">Depth</label>
                              <input
                                type="number"
                                value={pt.depthFt}
                                onChange={e => {
                                  const updated = [...wpStructuralPoints];
                                  updated[i] = { ...pt, depthFt: Number(e.target.value) };
                                  setWpStructuralPoints(updated);
                                }}
                                className="w-full bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[10px] text-text-primary"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1">
                        <DataRow label="Crestal X" value={parseFloat(crestalResult.crestalX.toFixed(1))} unit="grid" precision={1} />
                        <DataRow label="Crestal Y" value={parseFloat(crestalResult.crestalY.toFixed(1))} unit="grid" precision={1} />
                        <DataRow label="Crestal Depth" value={crestalResult.crestalDepthFt} unit="ft" precision={0} />
                        <DataRow label="Quality" value={crestalResult.quality} unit="" precision={0} source="Childs et al. 2017" />
                        <div className="border-t border-border-subtle/30 pt-1 mt-1" />
                        <DataRow label="Nearest Fault" value={faultRisk.distanceToNearestFt} unit="ft" precision={0} />
                        <DataRow label="Fault Risk" value={faultRisk.riskCategory.toUpperCase()} unit="" precision={0} />
                        <DataRow label="Surface Score" value={surfaceEval.clearanceScore} unit="/100" precision={0} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── 2. TRAJECTORY DESIGN ─── */}
                {wpSubTab === 'trajectory' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="industry-card p-4 xl:col-span-2">
                      <SectionHeader title="Wellbore Trajectory Profile" subtitle="Constant curve build + tangent section" />
                      <TrajectoryProfile
                        trajectory={trajectory}
                        formationTops={stratigraphy.formationTops.map(ft => ({ name: ft.name, depthFt: ft.depthTvdFt, color: ft.porosityFraction > 0.2 ? '#f59e0b' : '#6366f1' }))}
                      />
                    </div>
                    <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                      <SectionHeader title="Trajectory Parameters" subtitle="BHA & borehole design" />
                      <div className="flex gap-2 mb-3">
                        {(['vertical', 'deviated', 'horizontal'] as WellTrajectoryType[]).map(t => (
                          <button
                            key={t}
                            onClick={() => setWpTrajectoryType(t)}
                            className={cn(
                              "flex-1 py-1 rounded text-[11px] font-bold uppercase",
                              wpTrajectoryType === t ? "bg-brand-primary text-white" : "bg-app-bg text-text-tertiary border border-border-subtle"
                            )}
                          >{t}</button>
                        ))}
                      </div>
                      <InputWithSlider label="KOP Depth" value={wpKOP} min={500} max={10000} step={100} unit="ft" onChange={setWpKOP} />
                      <InputWithSlider label="Build Rate" value={wpBuildRate} min={0.5} max={6} step={0.1} unit="°/100ft" onChange={setWpBuildRate} />
                      <InputWithSlider label="Target TVD" value={wpTargetTVD} min={3000} max={25000} step={100} unit="ft" onChange={setWpTargetTVD} />
                      <InputWithSlider label="Tangent Angle" value={wpTangentAngle} min={5} max={85} step={1} unit="deg" onChange={setWpTangentAngle} />
                      {wpTrajectoryType === 'horizontal' && (
                        <InputWithSlider label="Horizontal Section" value={wpHorizontalTarget} min={500} max={10000} step={100} unit="ft" onChange={setWpHorizontalTarget} />
                      )}
                      <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1 mt-4">
                        <DataRow label="Total MD" value={trajectory.totalMeasuredDepthFt} unit="ft" precision={0} />
                        <DataRow label="Departure" value={trajectory.targetDepartureFt} unit="ft" precision={0} />
                        <DataRow label="Build Section" value={(trajectory.tangentAngleDeg / wpBuildRate * 100).toFixed(0)} unit="ft" precision={0} />
                        <DataRow label="Horizontal" value={trajectory.horizontalSectionFt} unit="ft" precision={0} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── 3. STRATIGRAPHY PROGNOSIS ─── */}
                {wpSubTab === 'stratigraphy' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="industry-card p-4 xl:col-span-2">
                      <SectionHeader title="Prognosed Stratigraphic Column" subtitle="From seismic velocity model & Gardner density" />
                      <StratigraphyColumnSVG prognosis={stratigraphy} />
                    </div>
                    <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                      <SectionHeader title="Velocity Model" subtitle="Dix interval velocities" />
                      <InputWithSlider label="Seismic Confidence" value={wpSeismicConfidence} min={0.1} max={1.0} step={0.05} unit="" onChange={setWpSeismicConfidence} />
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {wpVelocityLayers.map((layer, i) => (
                          <div key={i} className="bg-app-bg border border-border-subtle rounded p-2 text-[10px]">
                            <div className="font-bold text-text-primary">{layer.formationName}</div>
                            <div className="grid grid-cols-3 gap-1 mt-1">
                              <div>
                                <label className="text-[10px] text-text-tertiary">Vel</label>
                                <input
                                  type="number"
                                  value={layer.intervalVelocityFtPerS}
                                  onChange={e => {
                                    const updated = [...wpVelocityLayers];
                                    updated[i] = { ...layer, intervalVelocityFtPerS: Number(e.target.value) };
                                    setWpVelocityLayers(updated);
                                  }}
                                  className="w-full bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[11px] text-text-primary"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-text-tertiary">Thk</label>
                                <input
                                  type="number"
                                  value={layer.thicknessFt}
                                  onChange={e => {
                                    const updated = [...wpVelocityLayers];
                                    updated[i] = { ...layer, thicknessFt: Number(e.target.value) };
                                    setWpVelocityLayers(updated);
                                  }}
                                  className="w-full bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[11px] text-text-primary"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-text-tertiary">Φ</label>
                                <input
                                  type="number"
                                  value={layer.porosity}
                                  step={0.01}
                                  onChange={e => {
                                    const updated = [...wpVelocityLayers];
                                    updated[i] = { ...layer, porosity: Number(e.target.value) };
                                    setWpVelocityLayers(updated);
                                  }}
                                  className="w-full bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[11px] text-text-primary"
                                />
                              </div>
                            </div>
                            <div className="text-[11px] text-text-secondary mt-1">{layer.lithology} | Top: {stratigraphy.formationTops[i]?.depthTvdFt.toFixed(0)} ft</div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1">
                        <DataRow label="Confidence" value={stratigraphy.prognosisConfidence * 100} unit="%" precision={0} />
                        <DataRow label="Markers" value={stratigraphy.keyMarkerBeds.length} unit="beds" precision={0} />
                        <DataRow label="Hazards" value={stratigraphy.drillingHazards.length} unit="identified" precision={0} />
                      </div>
                      {stratigraphy.drillingHazards.length > 0 && (
                        <div className="bg-red-900/20 border border-red-800/40 rounded p-2">
                          <p className="text-[11px] text-red-400 font-bold uppercase mb-1">Drilling Hazards</p>
                          {stratigraphy.drillingHazards.map((h, i) => (
                            <p key={i} className="text-[10px] text-red-300 leading-relaxed">⚠ {h}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ─── 4. PORE PRESSURE & FRACTURE GRADIENT ─── */}
                {wpSubTab === 'pore_pressure' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="industry-card p-4 xl:col-span-2">
                      <SectionHeader title="Pore Pressure & Fracture Gradient" subtitle="Eaton (1975) + Matthews & Kelly (1967)" />
                      <PorePressureChart profile={porePressureProfile} />
                    </div>
                    <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                      <SectionHeader title="Eaton Parameters" subtitle="Compaction-based prediction" />
                      <InputWithSlider label="NCT Velocity" value={wpNCT} min={5000} max={15000} step={100} unit="ft/s" onChange={setWpNCT} />
                      <InputWithSlider label="Eaton Exponent" value={wpEatonExp} min={0.5} max={3.0} step={0.05} unit="n" onChange={setWpEatonExp} />
                      <InputWithSlider label="OB Gradient" value={wpOBGradient} min={0.7} max={1.2} step={0.01} unit="psi/ft" onChange={setWpOBGradient} />
                      <InputWithSlider label="Poisson's Ratio" value={wpPoissonsRatio} min={0.15} max={0.45} step={0.01} unit="ν" onChange={setWpPoissonsRatio} />
                      <InputWithSlider label="Max Depth" value={wpMaxDepth} min={5000} max={30000} step={500} unit="ft" onChange={setWpMaxDepth} />
                      <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1 mt-2">
                        <DataRow label="Max PP" value={maxPP} unit="ppg" precision={1} />
                        <DataRow label="Max FG" value={maxFG} unit="ppg" precision={1} />
                        <DataRow label="Mud Window" value={maxFG - maxPP} unit="ppg" precision={1} />
                        <DataRow label="Confidence" value={porePressureProfile.prognosisConfidence * 100} unit="%" precision={0} />
                      </div>
                      {porePressureProfile.shallowHazards.length > 0 && (
                        <div className="bg-amber-900/20 border border-amber-800/40 rounded p-2">
                          <p className="text-[11px] text-amber-400 font-bold uppercase mb-1">Shallow Hazards</p>
                          {porePressureProfile.shallowHazards.map((h, i) => (
                            <p key={i} className="text-[10px] text-amber-300">⚠ {h}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ─── 5. CASING DESIGN ─── */}
                {wpSubTab === 'casing' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="industry-card p-4 xl:col-span-2">
                      <SectionHeader title="Casing Schematic" subtitle="API 5C3 burst/collapse — Von Mises triaxial" />
                      <CasingSchematic casingProgram={casingProgram} />
                    </div>
                    <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                      <SectionHeader title="Shoe Depths" subtitle="Set minimum shoe depths" />
                      <InputWithSlider label="Conductor Shoe" value={wpConductorDepth} min={100} max={1000} step={50} unit="ft" onChange={setWpConductorDepth} />
                      <InputWithSlider label="Surface Shoe" value={wpSurfaceDepth} min={1000} max={8000} step={100} unit="ft" onChange={setWpSurfaceDepth} />
                      <InputWithSlider label="Interm. Shoe" value={wpIntermediateDepth} min={3000} max={18000} step={100} unit="ft" onChange={setWpIntermediateDepth} />
                      <InputWithSlider label="Production Shoe" value={wpProductionDepth} min={5000} max={30000} step={100} unit="ft" onChange={setWpProductionDepth} />
                      <InputWithSlider label="Design Factor" value={wpDesignFactor} min={1.0} max={1.5} step={0.01} unit="" onChange={setWpDesignFactor} />
                      <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1">
                        <DataRow label="Total Cost" value={casingProgram.totalCasingCostUsd} unit="USD" precision={0} source="API 5C3" />
                        {casingProgram.strings.map((s, i) => (
                          <div key={i} className="border-t border-border-subtle/30 pt-1 mt-1">
                            <div className="text-[11px] text-brand-primary font-bold">{s.name}</div>
                            <DataRow label="OD" value={s.odIn} unit="in" precision={2} />
                            <DataRow label="Grade" value={s.grade} unit="" precision={0} />
                            <DataRow label="Weight" value={s.weightLbPerFt} unit="lb/ft" precision={0} />
                            <DataRow label="Burst" value={s.burstRatingPsi} unit="psi" precision={0} />
                            <DataRow label="Collapse" value={s.collapseRatingPsi} unit="psi" precision={0} />
                            <DataRow label="Drift" value={s.driftIn} unit="in" precision={2} />
                            <DataRow label="SF Burst" value={casingProgram.triaxialSafetyFactors[i]?.burst || 0} unit="" precision={2} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── 6. MUD WEIGHT PROGRAM ─── */}
                {wpSubTab === 'mud' && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="industry-card p-4">
                      <SectionHeader title="Mud Weight Schedule" subtitle="ECD, yield point, wellbore stability" />
                      <div className="overflow-x-auto">
                        <table className="w-full text-[10px]">
                          <thead>
                            <tr className="text-text-tertiary uppercase text-[11px]">
                              <th className="text-left py-1 px-2">Section</th>
                              <th className="text-right py-1 px-2">From</th>
                              <th className="text-right py-1 px-2">To</th>
                              <th className="text-right py-1 px-2">MW</th>
                              <th className="text-right py-1 px-2">ECD</th>
                              <th className="text-center py-1 px-2">Stability</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mudSchedule.map((s, i) => (
                              <tr key={i} className="border-t border-border-subtle/20">
                                <td className="py-1 px-2 text-text-primary font-bold">{s.section}</td>
                                <td className="py-1 px-2 text-right text-text-secondary">{s.depthFromFt.toFixed(0)}</td>
                                <td className="py-1 px-2 text-right text-text-secondary">{s.depthToFt.toFixed(0)}</td>
                                <td className="py-1 px-2 text-right text-brand-primary data-mono">{s.mudWeightPpg.toFixed(1)}</td>
                                <td className="py-1 px-2 text-right text-text-secondary">{s.ecdPpg.toFixed(1)}</td>
                                <td className={cn(
                                  "py-1 px-2 text-center font-bold text-[11px]",
                                  s.wellboreStability === 'stable' ? 'text-green-400' : s.wellboreStability === 'moderate' ? 'text-amber-400' : 'text-red-400'
                                )}>{s.wellboreStability}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                      <SectionHeader title="Mud Properties" subtitle="Per section details" />
                      {mudSchedule.map((s, i) => (
                        <div key={i} className="bg-app-bg border border-border-subtle rounded p-3">
                          <div className="text-[10px] text-brand-primary font-bold upppercase">{s.section}</div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                            <DataRow label="Mud Weight" value={s.mudWeightPpg} unit="ppg" precision={1} />
                            <DataRow label="ECD" value={s.ecdPpg} unit="ppg" precision={1} />
                            <DataRow label="Yield Point" value={s.yieldPointLbPer100ft2} unit="lb/100ft²" precision={0} />
                            <DataRow label="PV" value={s.plasticViscosityCp} unit="cP" precision={0} />
                            <div className="col-span-2">
                              <DataRow label="Inhibitor" value={s.recommendedInhibitor} unit="" precision={0} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── 7. LOGGING PROGRAM ─── */}
                {wpSubTab === 'logging' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="industry-card p-4 xl:col-span-2">
                      <SectionHeader title="Wireline Logging Program" subtitle="Quad-combo + specialty tools" />
                      <LoggingProgramSVG logProgram={loggingProgram} />
                    </div>
                    <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                      <SectionHeader title="Logging Parameters" />
                      <InputWithSlider label="Top Depth" value={wpLogTVDTop} min={0} max={5000} step={100} unit="ft" onChange={setWpLogTVDTop} />
                      <InputWithSlider label="Base Depth" value={wpLogTVDBase} min={2000} max={30000} step={100} unit="ft" onChange={setWpLogTVDBase} />
                      <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1">
                        <DataRow label="Total Cost" value={loggingProgram.totalCostUsd} unit="USD" precision={0} />
                        <DataRow label="Run Days" value={loggingProgram.totalRunDays} unit="days" precision={1} />
                        <DataRow label="Interval" value={loggingProgram.depthIntervalTopFt} unit="ft" precision={0} suffix={` — ${loggingProgram.depthIntervalBaseFt} ft`} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] text-text-tertiary uppercase font-bold">Risks</p>
                        {loggingProgram.operationalRisks.map((r, i) => (
                          <p key={i} className="text-[10px] text-amber-400">⚠ {r}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── 8. CORING & SAMPLING ─── */}
                {wpSubTab === 'coring' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="industry-card p-4 xl:col-span-2">
                      <SectionHeader title="Coring & Fluid Sampling Plan" subtitle="Conventional, sidewall, & pressure coring" />
                      <CoringSamplingSVG
                        coreIntervals={coringProgram.intervals || []}
                        samplePoints={[]}
                        maxDepthFt={wpProductionDepth}
                      />
                    </div>
                    <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                      <SectionHeader title="Coring Intervals" />
                      {wpCoringIntervals.map((ci, i) => (
                        <div key={i} className="bg-app-bg border border-border-subtle rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] text-brand-primary font-bold uppercase">Interval {i+1}</span>
                            <select
                              value={ci.coreType}
                              onChange={e => {
                                const updated = [...wpCoringIntervals];
                                updated[i] = { ...ci, coreType: e.target.value as any };
                                setWpCoringIntervals(updated);
                              }}
                              className="bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[11px] text-text-primary"
                            >
                              <option value="conventional">Conventional</option>
                              <option value="sidewall">Sidewall</option>
                              <option value="pressure">Pressure</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <div>
                              <label className="text-[10px] text-text-tertiary uppercase">Top</label>
                              <input
                                type="number"
                                value={ci.depthTopFt}
                                onChange={e => {
                                  const updated = [...wpCoringIntervals];
                                  updated[i] = { ...ci, depthTopFt: Number(e.target.value) };
                                  setWpCoringIntervals(updated);
                                }}
                                className="w-full bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[11px] text-text-primary"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-text-tertiary uppercase">Base</label>
                              <input
                                type="number"
                                value={ci.depthBaseFt}
                                onChange={e => {
                                  const updated = [...wpCoringIntervals];
                                  updated[i] = { ...ci, depthBaseFt: Number(e.target.value) };
                                  setWpCoringIntervals(updated);
                                }}
                                className="w-full bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[11px] text-text-primary"
                              />
                            </div>
                          </div>
                          <input
                            type="text"
                            value={ci.objective}
                            onChange={e => {
                              const updated = [...wpCoringIntervals];
                              updated[i] = { ...ci, objective: e.target.value };
                              setWpCoringIntervals(updated);
                            }}
                            className="w-full bg-app-bg border border-border-subtle rounded px-1 py-0.5 text-[11px] text-text-primary mt-1"
                            placeholder="Objective..."
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => setWpCoringIntervals([...wpCoringIntervals, { depthTopFt: 5000, depthBaseFt: 5060, coreType: 'conventional', objective: 'New interval' }])}
                        className="text-[11px] text-brand-primary hover:text-brand-primary/80 uppercase font-bold"
                      >+ Add Interval</button>
                      <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1">
                        <DataRow label="Total Length" value={wpCoringIntervals.reduce((s, ci) => s + (ci.depthBaseFt - ci.depthTopFt), 0)} unit="ft" precision={0} />
                        <DataRow label="Avg Recovery" value={wpCoringIntervals.length > 0 ? wpCoringIntervals.reduce((s, ci) => s + (ci.coreType === 'conventional' ? 90 : ci.coreType === 'sidewall' ? 70 : 95), 0) / wpCoringIntervals.length : 0} unit="%" precision={0} />
                        <DataRow label="Cost" value={coringProgram.totalCostUsd} unit="USD" precision={0} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── 9. AFE COST BREAKDOWN ─── */}
                {wpSubTab === 'afe' && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className="industry-card p-4">
                      <SectionHeader title="AFE Cost Breakdown" subtitle="Tangible, intangible, services & contingency" />
                      <AFECostBreakdownSVG afe={afe} />
                    </div>
                    <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                      <SectionHeader title="AFE Parameters" />
                      <InputWithSlider label="Spread Rate" value={wpSpreadRate} min={50000} max={1000000} step={10000} unit="USD/day" onChange={setWpSpreadRate} />
                      <InputWithSlider label="Dry Hole Days" value={wpDryHoleDays} min={10} max={180} step={1} unit="days" onChange={setWpDryHoleDays} />
                      <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1">
                        <DataRow label="Total AFE" value={afe.totalCostUsd} unit="USD" precision={0} />
                        <DataRow label="Dry Hole Cost" value={afe.dryHoleCostUsd} unit="USD" precision={0} />
                        <DataRow label="Contingency" value={afe.contingencyPct} unit="%" precision={1} suffix={` ($${(afe.contingencyUsd / 1e6).toFixed(1)}M)`} />
                        <DataRow label="Drilling Days" value={afe.drillingDays} unit="days" precision={0} />
                        <DataRow label="Casing Cost" value={casingProgram.totalCasingCostUsd} unit="USD" precision={0} />
                        <DataRow label="Logging Cost" value={loggingProgram.totalCostUsd} unit="USD" precision={0} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── 10. RISK ASSESSMENT ─── */}
                {wpSubTab === 'risk' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="industry-card p-4 xl:col-span-2">
                      <SectionHeader title="Risk Matrix" subtitle="Probability × Consequence = Risk Score" />
                      <RiskMatrixSVG assessment={riskAssessment} />
                    </div>
                    <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                      <SectionHeader title="Risk Parameters" />
                      <InputWithSlider label="Pg (Geological)" value={wpRiskPg} min={0.05} max={0.95} step={0.01} unit="" onChange={setWpRiskPg} />
                      <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1">
                        <DataRow label="Overall Risk" value={riskAssessment.overallRiskScore} unit="/25" precision={0} />
                        <DataRow label="Probability" value={riskAssessment.probabilityOfSuccess * 100} unit="%" precision={1} />
                        <DataRow label="Certainty" value={riskAssessment.certaintyBand} unit="" precision={0} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] text-text-tertiary uppercase font-bold">Top Risks</p>
                        {riskAssessment.topRisks.slice(0, 5).map((r, i) => (
                          <div key={i} className={cn(
                            "bg-app-bg border rounded p-2 text-[11px]",
                            r.riskLevel === 'extreme' ? 'border-red-800/50' : r.riskLevel === 'high' ? 'border-amber-800/50' : 'border-border-subtle'
                          )}>
                            <div className="flex justify-between">
                              <span className="text-text-primary font-bold">{r.description.slice(0, 40)}...</span>
                              <span className={cn(
                                "font-bold",
                                r.riskLevel === 'extreme' ? 'text-red-400' : r.riskLevel === 'high' ? 'text-amber-400' : 'text-green-400'
                              )}>{r.riskLevel.toUpperCase()}</span>
                            </div>
                            <div className="text-text-secondary mt-0.5">Score: {r.riskScore} → Residual: {r.residualScore} | {r.mitigation.slice(0, 50)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── 11. FID DECISION TREE ─── */}
                {wpSubTab === 'decision_tree' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="industry-card p-4 xl:col-span-2">
                      <SectionHeader title="FID Decision Tree" subtitle="EMV Analysis — Drill vs Defer vs Farm-out vs Drop" />
                      <DecisionTreeSVG fid={fidResult} />
                    </div>
                    <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                      <SectionHeader title="Economic Parameters" />
                      <InputWithSlider label="Oil Price" value={wpOilPrice} min={30} max={150} step={1} unit="USD/bbl" onChange={setWpOilPrice} />
                      <InputWithSlider label="WACC" value={wpWacc} min={5} max={20} step={0.5} unit="%" onChange={setWpWacc} />
                      <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1">
                        <DataRow label="Recommendation" value={fidResult.recommendation.toUpperCase()} unit="" precision={0} />
                        <DataRow label="EMV" value={fidResult.emvUsd} unit="USD" precision={0} />
                        <DataRow label="Expected NPV" value={fidResult.expectedNpvUsd} unit="USD" precision={0} />
                        <DataRow label="IRR" value={fidResult.irrPct} unit="%" precision={1} />
                        <DataRow label="VoI" value={fidResult.voIUsd} unit="USD" precision={0} />
                        <DataRow label="Hurdle Rate" value={fidResult.hurdleRatePct} unit="%" precision={1} />
                        <DataRow label="Confidence" value={fidResult.confidenceLevel.toUpperCase()} unit="" precision={0} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── 12. REGULATORY READINESS ─── */}
                {wpSubTab === 'regulatory' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="industry-card p-4 xl:col-span-2">
                      <SectionHeader title="Regulatory Timeline" subtitle="BSEE 30 CFR 250 — NEPA compliance tracking" />
                      <RegulatoryTimelineSVG status={regulatory} />
                    </div>
                    <div className="bg-panel-bg border border-border-subtle rounded-lg p-4 space-y-3">
                      <SectionHeader title="Jurisdiction" />
                      <select
                        value={wpJurisdiction}
                        onChange={e => setWpJurisdiction(e.target.value)}
                        className="w-full bg-app-bg border border-border-subtle rounded px-3 py-2 text-[11px] text-text-primary"
                      >
                        <option>US GoM (Federal Waters)</option>
                        <option>UK North Sea</option>
                        <option>Norway NCS</option>
                        <option>Gulf of Thailand</option>
                        <option>West Africa Deepwater</option>
                      </select>
                      <div className="bg-app-bg border border-border-subtle rounded p-3 space-y-1">
                        <DataRow label="Jurisdiction" value={regulatory.jurisdiction} unit="" precision={0} />
                        <DataRow label="NEPA Level" value={regulatory.environmentalAssessment} unit="" precision={0} />
                        <DataRow label="Compliance" value={regulatory.complianceScore} unit="/100" precision={0} />
                        <DataRow label="Timeline" value={regulatory.permitTimelineDays} unit="days" precision={0} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] text-text-tertiary uppercase font-bold">Permits Required</p>
                        {regulatory.permitsRequired.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 text-[11px]">
                            <span className={cn(
                              "w-3 h-3 rounded-full shrink-0",
                              regulatory.permitsObtained.includes(p) ? 'bg-green-500' : 'bg-amber-500'
                            )} />
                            <span className="text-text-primary">{p}</span>
                          </div>
                        ))}
                      </div>
                      {regulatory.outstandingRequirements.length > 0 && (
                        <div className="bg-red-900/20 border border-red-800/40 rounded p-2">
                          <p className="text-[11px] text-red-400 font-bold uppercase mb-1">Outstanding</p>
                          {regulatory.outstandingRequirements.map((r, i) => (
                            <p key={i} className="text-[10px] text-red-300">• {r}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
             </div>
            )}
         </div>
      </div>
    </div>
  );
}