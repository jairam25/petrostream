import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, Target, Zap, RefreshCcw, ArrowRight, Gauge, Layers, Info, History,
  Compass, Map, Waypoints, ShieldCheck, TrendingUp, Scaling, Box, Activity,
  Crosshair, Drill, Radio, AlertTriangle, DollarSign, FileText, Search,
  Wrench, SlidersHorizontal, Eye, PenLine, GitBranch, Move3D
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { SectionHeader, InputWithSlider } from '../SharedUI';
import {
  // Trajectory
  calculateSurvey, calculateMotorYield, calculatePlannedDogleg, calculateMinimumCurvature,
  SurveyPoint, SurveyResult,
  // Kickoff & Build
  calculateWhipstockKickoff, calculateMotorBuildRate,
  designWhipstockKickoff, designRSSTrajectory,
  // Steering
  calculateSlidingDogleg, calculateRSSDeflection, calculateSlideSchedule,
  optimizeSlideRotateRatio, compareRSSTypes,
  // Toolface & Magnetic
  magToolfaceCorrection, toolfaceTo3DDogleg,
  getMagneticDeclination, correctAxialMagneticInterference,
  applyIFRCorrection, AxialInterferenceInput, IFRInput,
  calculatePumpPressureToolface,
  // Gyro
  calculateGyroSurvey, GyroSurveyInput,
  // Survey Corrections
  calculateMFMComparison,
  // Kickoff — Bit Walk
  calculateBitWalk,
  // Uncertainty
  calculateISCWSAError, ISCWSAStation,
  ISCWSA_MWD_ERROR_TERMS,
  calculateUncertaintyCone,
  // Anti-Collision
  calculateAntiCollision, calculateTravelingCylinder,
  // Cost
  calculateDirectionalCost,
  // Reference
  DRILLING_PAPERS
} from '../../lib/drilling';

// ─── Import SVG Components ───
import {
  // Trajectory SVGs
  TrajectorySVG, PlanViewSVG, VerticalSectionSVG,
  // Kickoff SVGs
  KickoffMethodDiagram, BuildRateChart, MotorBuildRateDiagram, RSSDiagram, RSSForceDiagram,
  BitWalkDiagram,
  // Toolface SVGs
  ToolfaceGauge, GravityToolface, MagneticToolface,
  PumpPressureToolfaceDiagram,
  // Survey correction
  MagneticDeclinationMap, AxialInterferenceDiagram, IFRDiagram, GyroDriftChart,
  MFMComparisonChart,
  // Uncertainty SVGs
  EllipseOfUncertaintySVG, ISCWSAErrorSpider, ErrorEllipse3D,
  UncertaintyConeDiagram,
  // Anti-collision
  AntiCollisionDiagram, SeparationFactorGauge, CollisionRiskMatrix,
  TravelingCylinderDiagram,
  // Cost
  DirectionalCostBreakdown,
  // Reference
  PapersTimelineChart,
  // Steering
  DLSProfile, SlideRotateGanttChart, RSSComparisonChart
} from './DirectionalSVGs';

// ─── Survey Method Info ──────────────────────────────────────────────────
const surveyMethods = [
  { id: 'tangential', name: 'Tangential', desc: 'Back station only', accuracy: 'Low' },
  { id: 'balanced', name: 'Balanced Tangential', desc: 'Averages both ends', accuracy: 'Medium' },
  { id: 'avg-angle', name: 'Average Angle', desc: 'Mean inc & azi', accuracy: 'Medium' },
  { id: 'min-curvature', name: 'Min. Curvature', desc: 'Smooth arc, industry standard', accuracy: 'High' },
  { id: 'radius-curvature', name: 'Radius of Curvature', desc: 'Cylindrical helix', accuracy: 'High' },
];

// ─── Tab Definitions ────────────────────────────────────────────────────
type TabId = 'trajectory' | 'kickoff' | 'steering' | 'toolface' | 'survey' | 'uncertainty' | 'anticollision' | 'cost' | 'reference';

const tabs: { id: TabId; name: string; icon: any; desc: string }[] = [
  { id: 'trajectory', name: '3D Trajectory', icon: Waypoints, desc: 'MWD survey & wellpath' },
  { id: 'kickoff', name: 'Kickoff', icon: Crosshair, desc: 'Whipstock, motor, RSS' },
  { id: 'steering', name: 'Steering', icon: SlidersHorizontal, desc: 'Sliding, rotating, DLS' },
  { id: 'toolface', name: 'Toolface', icon: Compass, desc: 'GTF, MTF, magnetic corr.' },
  { id: 'survey', name: 'Survey Corr.', icon: PenLine, desc: 'IFR, gyro, interference' },
  { id: 'uncertainty', name: 'Uncertainty', icon: Target, desc: 'ISCWSA EOU model' },
  { id: 'anticollision', name: 'Anti-Collision', icon: ShieldCheck, desc: 'Separation factor' },
  { id: 'cost', name: 'Economics', icon: DollarSign, desc: 'Directional costing' },
  { id: 'reference', name: 'Papers', icon: FileText, desc: 'SPE references' },
];

// ─── Default Inputs ─────────────────────────────────────────────────────
const defaultDirInp = {
  p1: { md: 0, inc: 0, azi: 0 },
  p2: { md: 1000, inc: 25, azi: 45 },
  surveyMethod: 'min-curvature' as string,
  motorBend: 1.5,
  motorSize: 6.75,
  slidePercent: 40,
  // Kickoff
  whipstockFace: 45,
  plannedInc: 3,
  formationDip: 5,
  dipAzimuth: 0,
  upperStabGauge: 8.25,
  lowerStabGauge: 8.25,
  bhaLength: 30,
  formationAnisotropy: 0.2,
  holeSize: 8.5,
  // RSS
  rssType: 'push' as const,
  pushForce: 2500,
  formationUCS: 15000,
  rssRpm: 120,
  rssRop: 50,
  // Steering
  targetDogleg: 3,
  motorYieldOverride: 8,
  rotaryDLS: 0.3,
  sectionLength: 2000,
  // Toolface
  magAzi: 45,
  inclination: 25,
  latitude: 30,
  longitude: -90,
  year: 2026,
  // Axial interference
  measuredAzimuth: 45,
  magDipAngle: 60,
  totalFieldStrength: 48000,
  axialBiasEstimate: 1500,
  nonMagSpacing: 40,
  bhaLengthBelowNMDC: 60,
  // IFR
  igrfDeclination: 2.5,
  igrfDip: 60,
  igrfTotalField: 48000,
  crustalFieldN: 50,
  crustalFieldE: -30,
  crustalFieldD: 20,
  diurnalVariation: 25,
  secularVariationRate: 20,
  yearsSinceModel: 2,
  // Gyro
  gyroType: 'rlg' as const,
  surveyTime: 4,
  temperature: 75,
  // Uncertainty
  confidenceLevel: 95,
  targetMD: 8000,
  // Anti-Collision
  offsetWellMD: 8500,
  offsetAzi: 48,
  offsetInc: 30,
  // Cost
  rigDayRate: 35000,
  slideROP: 30,
  rotateROP: 80,
  tripTime: 12,
  numTrips: 3,
  mudCostPerBbl: 85,
  mudVolume: 2000,
};

interface DirectionalTabProps {
  directionalInp: any;
  setDirectionalInp: (val: any) => void;
  hydraulicsInp: any;
}

export const DirectionalTab: React.FC<DirectionalTabProps> = ({ 
  directionalInp, 
  setDirectionalInp,
  hydraulicsInp
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('trajectory');
  const inp = directionalInp || defaultDirInp;
  const update = (key: string, val: any) => setDirectionalInp({ ...inp, [key]: val });

  // ─── Core Calculations ────────────────────────────────────────────────
  const surveyRes = useMemo(() => {
    const p1: SurveyPoint = inp.p1 || defaultDirInp.p1;
    const p2: SurveyPoint = inp.p2 || defaultDirInp.p2;
    return calculateSurvey(p1, p2, inp.surveyMethod as any);
  }, [inp.p1, inp.p2, inp.surveyMethod]);

  const motorYield = useMemo(() => 
    calculateMotorYield(inp.motorBend ?? 1.5, inp.motorSize ?? 6.75, hydraulicsInp?.dh ?? inp.holeSize ?? 8.5),
    [inp.motorBend, inp.motorSize, hydraulicsInp?.dh, inp.holeSize]);
  const plannedDLS = useMemo(() => calculatePlannedDogleg(motorYield, inp.slidePercent ?? 40), [motorYield, inp.slidePercent]);

  // Kickoff
  const whipstockRes = useMemo(() => calculateWhipstockKickoff(
    inp.whipstockFace ?? 45, inp.plannedInc ?? 3, inp.formationDip ?? 5, inp.dipAzimuth ?? 0
  ), [inp.whipstockFace, inp.plannedInc, inp.formationDip, inp.dipAzimuth]);
  const motorBuildRes = useMemo(() => calculateMotorBuildRate(
    inp.motorBend ?? 1.5, inp.motorSize ?? 6.75, inp.holeSize ?? 8.5,
    inp.upperStabGauge ?? 8.25, inp.lowerStabGauge ?? 8.25,
    inp.bhaLength ?? 30, inp.formationAnisotropy ?? 0.2
  ), [inp.motorBend, inp.motorSize, inp.holeSize, inp.upperStabGauge, inp.lowerStabGauge, inp.bhaLength, inp.formationAnisotropy]);
  const rssSteerRes = useMemo(() => calculateRSSDeflection(
    inp.pushForce ?? 2500, inp.formationUCS ?? 15000, inp.rssRpm ?? 120, inp.holeSize ?? 8.5
  ), [inp.pushForce, inp.formationUCS, inp.rssRpm, inp.holeSize]);
  const whipDesign = useMemo(() => designWhipstockKickoff(
    8000, inp.dipAzimuth ?? 0, 5000, inp.whipstockFace ?? 45, 2000
  ), [inp.whipstockFace, inp.dipAzimuth]);
  const rssTrajectory = useMemo(() => designRSSTrajectory(
    25, inp.dipAzimuth ?? 45, 3, 5000, 3, 0
  ), [inp.dipAzimuth]);

  // Steering
  const slideDogleg = useMemo(() => calculateSlidingDogleg(
    inp.motorBend ?? 1.5, inp.whipstockFace ?? 45, inp.formationAnisotropy ?? 1.0, inp.holeSize ?? 8.5, inp.motorSize ?? 6.75
  ), [inp.motorBend, inp.whipstockFace, inp.formationAnisotropy, inp.holeSize, inp.motorSize]);
  const slideSched = useMemo(() => calculateSlideSchedule(
    inp.targetDogleg ?? 3, motorYield, inp.rotaryDLS ?? 0.3, inp.sectionLength ?? 2000
  ), [inp.targetDogleg, motorYield, inp.rotaryDLS, inp.sectionLength]);
  const slideOpt = useMemo(() => optimizeSlideRotateRatio(inp.targetDogleg ?? 3, motorYield), [inp.targetDogleg, motorYield]);

  /* ── Derived data for steering SVGs ── */
  const dlsStations = useMemo(() => {
    const stations = [];
    const sectionLen = inp.sectionLength ?? 2000;
    const steps = 30;
    const startMD = inp.p1?.md ?? 0;
    const bend = inp.motorBend ?? 1.5;
    const tf = inp.whipstockFace ?? 45;
    const aniso = inp.formationAnisotropy ?? 1.0;
    const holeSz = inp.holeSize ?? 8.5;
    const motSz = inp.motorSize ?? 6.75;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const md = startMD + frac * sectionLen;
      // Simulate DLS varying along section by tweaking anisotropy at each station
      const localAniso = aniso + 0.2 * Math.sin(frac * Math.PI * 4);
      const dls = (bend * motSz * (tf % 180 === 0 ? 1.0 : 0.9) * localAniso * 5.5) / holeSz;
      stations.push({ md: Math.round(md), dls: Math.round(dls * 100) / 100 });
    }
    return stations;
  }, [inp.sectionLength, inp.p1, inp.motorBend, inp.whipstockFace, inp.formationAnisotropy, inp.holeSize, inp.motorSize]);

  const slideRotateStands = useMemo(() => {
    const stands = [];
    const sectionLen = inp.sectionLength ?? 2000;
    const startMD = inp.p1?.md ?? 0;
    const sched = slideSched;
    const nStands = Math.ceil(sectionLen / 30);
    const slidePerStand = sched.slidePerJoint;
    const dlsPerStand = (inp.targetDogleg ?? 3) * (slidePerStand / 30);
    for (let i = 0; i < nStands; i++) {
      const mdStart = startMD + i * 30;
      const mdEnd = Math.min(mdStart + 30, startMD + sectionLen);
      const actualLen = mdEnd - mdStart;
      const slideFt = Math.min(slidePerStand, actualLen);
      const rotateFt = actualLen - slideFt;
      stands.push({
        standNumber: i + 1,
        mdStart: Math.round(mdStart),
        mdEnd: Math.round(mdEnd),
        slideFt: Math.round(slideFt * 10) / 10,
        rotateFt: Math.round(rotateFt * 10) / 10,
        dlsContribution: Math.round(dlsPerStand * 100) / 100,
      });
    }
    return stands;
  }, [inp.sectionLength, inp.p1, slideSched, inp.targetDogleg]);

  // Toolface
  const declination = useMemo(() => getMagneticDeclination(inp.latitude ?? 30, inp.longitude ?? -90, inp.year ?? 2026),
    [inp.latitude, inp.longitude, inp.year]);
  const tfCorr = useMemo(() => magToolfaceCorrection(inp.magAzi ?? 45, inp.inclination ?? 25, declination),
    [inp.magAzi, inp.inclination, declination]);
  const tf3d = useMemo(() => toolfaceTo3DDogleg(inp.whipstockFace ?? 45, surveyRes.dls, inp.inclination ?? 25),
    [inp.whipstockFace, surveyRes.dls, inp.inclination]);

  // Axial Interference
  const axialInterf: AxialInterferenceInput = {
    measuredAzimuth: inp.measuredAzimuth ?? 45,
    inclination: inp.inclination ?? 25,
    magDipAngle: inp.magDipAngle ?? 60,
    totalFieldStrength: inp.totalFieldStrength ?? 48000,
    axialBiasEstimate: inp.axialBiasEstimate ?? 1500,
    nonMagSpacing: inp.nonMagSpacing ?? 40,
    bhaLengthBelowNMDC: inp.bhaLengthBelowNMDC ?? 60,
  };
  const axialRes = useMemo(() => correctAxialMagneticInterference(axialInterf), [
    axialInterf.measuredAzimuth, axialInterf.inclination, axialInterf.magDipAngle,
    axialInterf.totalFieldStrength, axialInterf.axialBiasEstimate,
    axialInterf.nonMagSpacing, axialInterf.bhaLengthBelowNMDC
  ]);

  // IFR
  const ifrInput: IFRInput = {
    igrfDeclination: inp.igrfDeclination ?? 2.5,
    igrfDip: inp.igrfDip ?? 60,
    igrfTotalField: inp.igrfTotalField ?? 48000,
    crustalFieldN: inp.crustalFieldN ?? 50,
    crustalFieldE: inp.crustalFieldE ?? -30,
    crustalFieldD: inp.crustalFieldD ?? 20,
    diurnalVariation: inp.diurnalVariation ?? 25,
    secularVariationRate: inp.secularVariationRate ?? 20,
    yearsSinceModel: inp.yearsSinceModel ?? 2,
  };
  const ifrRes = useMemo(() => applyIFRCorrection(ifrInput), [
    ifrInput.igrfDeclination, ifrInput.igrfDip, ifrInput.igrfTotalField,
    ifrInput.crustalFieldN, ifrInput.crustalFieldE, ifrInput.crustalFieldD,
    ifrInput.diurnalVariation, ifrInput.secularVariationRate, ifrInput.yearsSinceModel
  ]);

  // Gyro
  const gyroInput: GyroSurveyInput = {
    gyroType: inp.gyroType ?? 'rlg',
    surveyDepth: inp.p2?.md ?? 1000,
    surveyTime: inp.surveyTime ?? 4,
    latitude: inp.latitude ?? 30,
    temperature: inp.temperature ?? 75,
    inclination: inp.inclination ?? 25,
  };
  const gyroRes = useMemo(() => calculateGyroSurvey(gyroInput), [
    gyroInput.gyroType, gyroInput.surveyTime, gyroInput.latitude,
    gyroInput.temperature, gyroInput.inclination
  ]);

  // ISCWSA Uncertainty
  const iscwsaStations: ISCWSAStation[] = useMemo(() => {
    const st: ISCWSAStation[] = [];
    const p1 = inp.p1 || defaultDirInp.p1;
    const p2 = inp.p2 || defaultDirInp.p2;
    const totalMD = inp.targetMD ?? 8000;
    const steps = 20;
    let tvd = 0, north = 0, east = 0;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const md = frac * totalMD;
      const inc = p1.inc + frac * (p2.inc - p1.inc);
      const azi = p1.azi + frac * (p2.azi - p1.azi);
      const seg = totalMD / steps;
      const iRad = (inc * Math.PI) / 180;
      const aRad = (azi * Math.PI) / 180;
      tvd += seg * Math.cos(iRad);
      north += seg * Math.sin(iRad) * Math.cos(aRad);
      east += seg * Math.sin(iRad) * Math.sin(aRad);
      st.push({ md, inc, azi, tvd, north, east });
    }
    return st;
  }, [inp.p1, inp.p2, inp.targetMD]);

  const eou = useMemo(() => calculateISCWSAError(
    iscwsaStations, ISCWSA_MWD_ERROR_TERMS, inp.latitude ?? 30, inp.confidenceLevel ?? 95
  ), [iscwsaStations, inp.latitude, inp.confidenceLevel]);

  // Anti-Collision
  const refWell = useMemo(() => {
    const pts: SurveyPoint[] = [];
    let tvd = 0, n = 0, e = 0;
    const totalMD = inp.targetMD ?? 8000;
    for (let i = 0; i <= 20; i++) {
      const md = (i / 20) * totalMD;
      const inc = (inp.p1?.inc ?? 0) + (i / 20) * ((inp.p2?.inc ?? 25) - (inp.p1?.inc ?? 0));
      const azi = (inp.p1?.azi ?? 0) + (i / 20) * ((inp.p2?.azi ?? 45) - (inp.p1?.azi ?? 0));
      pts.push({ md, inc, azi });
    }
    return pts;
  }, [inp.targetMD, inp.p1, inp.p2]);
  const offsetWell = useMemo(() => {
    const pts: import('../../lib/drilling').OffsetWellStation[] = [];
    let tvd = 0, n = 200, e = 150;
    const totalMD = (inp.offsetWellMD ?? 8500);
    for (let i = 0; i <= 20; i++) {
      const md = (i / 20) * totalMD;
      const inc = 0 + (i / 20) * (inp.offsetInc ?? 30);
      const azi = (inp.offsetAzi ?? 48);
      const seg = totalMD / 20;
      tvd += seg * Math.cos((inc * Math.PI) / 180);
      n += seg * Math.sin((inc * Math.PI) / 180) * Math.cos((azi * Math.PI) / 180);
      e += seg * Math.sin((inc * Math.PI) / 180) * Math.sin((azi * Math.PI) / 180);
      // EOU grows with depth: ~1.5 ft per 1000 ft of MD
      const eouRadius = 10 + (md / 1000) * 1.5;
      pts.push({ md, inc, azi, tvd, north: n, east: e, semiMajor: eouRadius * 1.6, semiMinor: eouRadius, eouAzimuth: 45 });
    }
    return pts;
  }, [inp.offsetWellMD, inp.offsetAzi, inp.offsetInc]);
  const antiColRes = useMemo(() => calculateAntiCollision(refWell, offsetWell), [refWell, offsetWell]);

  // 3D coordinates for anti-collision SVG (Minimum Curvature from refWell survey stations)
  const refWellCoords = useMemo(() => {
    const coords: { md: number; tvd: number; n: number; e: number; inc: number; azi: number }[] = [];
    let tvd = 0, n = 0, e = 0;
    for (let i = 0; i < refWell.length; i++) {
      const p = refWell[i];
      if (i > 0) {
        const seg = calculateMinimumCurvature(refWell[i - 1], refWell[i]);
        tvd += seg.tvd;
        n += seg.north;
        e += seg.east;
      }
      coords.push({ md: p.md, tvd, n, e, inc: p.inc, azi: p.azi });
    }
    return coords;
  }, [refWell]);

  const offsetWellCoords = useMemo(() => {
    return offsetWell.map(p => ({ md: p.md, tvd: p.tvd, n: p.north, e: p.east, inc: p.inc, azi: p.azi }));
  }, [offsetWell]);

  // Cost
  const dirCost = useMemo(() => calculateDirectionalCost(
    inp.p2?.md ?? 1000, 8000,
    inp.rigDayRate ?? 35000, inp.slideROP ?? 30, inp.rotateROP ?? 80,
    inp.slidePercent ?? 40, inp.tripTime ?? 12, inp.numTrips ?? 3,
    inp.mudCostPerBbl ?? 85, inp.mudVolume ?? 2000
  ), [inp.p2, inp.rigDayRate, inp.slideROP, inp.rotateROP, inp.slidePercent, inp.tripTime, inp.numTrips, inp.mudCostPerBbl, inp.mudVolume]);

  // ─── Phase 11: Bit Walk ───────────────────────────────────────────
  const bitWalk = useMemo(() => calculateBitWalk(
    inp.inclination ?? 25, inp.p2?.azi ?? 45,
    inp.formationDip ?? 5, inp.dipAzimuth ?? 0,
    inp.formationAnisotropy ?? 0.2, inp.formationUCS ?? 15000
  ), [inp.inclination, inp.p2, inp.formationDip, inp.dipAzimuth, inp.formationAnisotropy, inp.formationUCS]);

  // ─── Phase 11: Pump Pressure Toolface ─────────────────────────────
  const pumpTF = useMemo(() => calculatePumpPressureToolface(
    inp.whipstockFace ?? 45, hydraulicsInp?.flowRate ?? 400,
    hydraulicsInp?.bitDP ?? 1500, inp.motorDisp ?? 5, inp.motorStall ?? 3500,
    inp.p2?.md ?? 1000, hydraulicsInp?.dpOD ?? 5, hydraulicsInp?.dpID ?? 4.276
  ), [inp.whipstockFace, hydraulicsInp?.flowRate, hydraulicsInp?.bitDP, inp.motorDisp, inp.motorStall, inp.p2]);

  // ─── Phase 11: MFM Comparison ─────────────────────────────────────
  const mfmComp = useMemo(() => calculateMFMComparison(
    inp.latitude ?? 30, inp.longitude ?? -90, inp.year ?? 2026,
    inp.crustalFieldN ?? 50, inp.crustalFieldE ?? -30,
    inp.diurnalVariation ?? 25
  ), [inp.latitude, inp.longitude, inp.year, inp.crustalFieldN, inp.crustalFieldE, inp.diurnalVariation]);

  // ─── Phase 11: RSS Comparison ─────────────────────────────────────
  const rssComp = useMemo(() => compareRSSTypes(
    inp.pushForce ?? 2500, inp.formationUCS ?? 15000,
    inp.rssRpm ?? 120, inp.holeSize ?? 8.5
  ), [inp.pushForce, inp.formationUCS, inp.rssRpm, inp.holeSize]);

  // ─── Phase 11: Uncertainty Cone ───────────────────────────────────
  const uncertaintyCone = useMemo(() => calculateUncertaintyCone(
    iscwsaStations, inp.latitude ?? 30, inp.confidenceLevel ?? 95
  ), [iscwsaStations, inp.latitude, inp.confidenceLevel]);

  // ─── Phase 11: Traveling Cylinder ─────────────────────────────────
  const travelingCylinder = useMemo(() => calculateTravelingCylinder(
    refWellCoords, offsetWellCoords, 0.005, 0.005, 2.447
  ), [refWellCoords, offsetWellCoords]);

  // ─── Helpers ──────────────────────────────────────────────────────────
  const StatPill = ({ label, value, unit, color = 'indigo' }: { label: string; value: number | string; unit?: string; color?: string }) => (
    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-black">{label}</div>
      <div className={`text-${color}-400 text-xl font-black mt-0.5`}>{typeof value === 'number' ? formatNumber(value, 2) : value}<span className="text-slate-500 text-sm ml-1">{unit || ''}</span></div>
    </div>
  );

  const SliderInput = ({ label, value, onChange, min, max, step, unit }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; unit?: string }) => (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-slate-400 w-28">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        className="flex-1 h-1 accent-indigo-500"
        onChange={e => onChange(parseFloat(e.target.value))} />
      <span className="text-xs text-indigo-400 font-black w-20 text-right">{formatNumber(value, 1)}{unit || ''}</span>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter flex items-center gap-4">
            <Navigation className="text-indigo-500" size={36} />
            Directional <span className="text-indigo-500/50">Drilling Terminal</span>
          </h2>
          <p className="text-slate-500 text-[10px] mt-1 font-black uppercase tracking-widest italic">
            ISCWSA Error Models • IFR Geomagnetic Referencing • Anti-Collision • RSS Steering
          </p>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex flex-wrap gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/10">
        {tabs.map(t => (
          <button key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all',
              activeTab === t.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}>
            <t.icon size={14} />
            <span className="hidden sm:inline">{t.name}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {/* ══════════════════════════════════════════════════════════════
              TAB 1: 3D TRAJECTORY
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'trajectory' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                  <h3 className="text-sm font-black text-white mb-4">3D Well Path Visualization</h3>
                  <div className="aspect-video bg-slate-950 rounded-xl border border-white/5 overflow-hidden">
                    <TrajectorySVG
                      tvd={surveyRes.tvd}
                      north={surveyRes.north}
                      east={surveyRes.east}
                      dls={surveyRes.dls}
                      inc1={inp.p1?.inc ?? 0}
                      inc2={inp.p2?.inc ?? 25}
                      azi1={inp.p1?.azi ?? 0}
                      azi2={inp.p2?.azi ?? 45}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="aspect-square bg-slate-950 rounded-xl border border-white/5 overflow-hidden">
                      <PlanViewSVG north={surveyRes.north} east={surveyRes.east} azi1={inp.p1?.azi ?? 0} azi2={inp.p2?.azi ?? 45} />
                    </div>
                    <div className="aspect-square bg-slate-950 rounded-xl border border-white/5 overflow-hidden">
                      <VerticalSectionSVG tvd={surveyRes.tvd} departure={Math.sqrt(surveyRes.north**2 + surveyRes.east**2)}
                        inc1={inp.p1?.inc ?? 0} inc2={inp.p2?.inc ?? 25} />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <SectionHeader title="Survey Setup" />
                  <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
                    <SliderInput label="Survey MD1" value={inp.p1?.md ?? 0} onChange={v => update('p1', { ...inp.p1, md: v })} min={0} max={2000} step={10} unit=" ft" />
                    <SliderInput label="Inclination 1" value={inp.p1?.inc ?? 0} onChange={v => update('p1', { ...inp.p1, inc: v })} min={0} max={90} step={0.5} unit="°" />
                    <SliderInput label="Azimuth 1" value={inp.p1?.azi ?? 0} onChange={v => update('p1', { ...inp.p1, azi: v })} min={0} max={360} step={1} unit="°" />
                    <SliderInput label="Survey MD2" value={inp.p2?.md ?? 1000} onChange={v => update('p2', { ...inp.p2, md: v })} min={100} max={10000} step={50} unit=" ft" />
                    <SliderInput label="Inclination 2" value={inp.p2?.inc ?? 25} onChange={v => update('p2', { ...inp.p2, inc: v })} min={0} max={90} step={0.5} unit="°" />
                    <SliderInput label="Azimuth 2" value={inp.p2?.azi ?? 45} onChange={v => update('p2', { ...inp.p2, azi: v })} min={0} max={360} step={1} unit="°" />
                    <label className="text-xs text-slate-500 block">Survey Method</label>
                    <select value={inp.surveyMethod ?? 'min-curvature'}
                      onChange={e => update('surveyMethod', e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-xs">
                      {surveyMethods.map(m => <option key={m.id} value={m.id}>{m.name} ({m.accuracy})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <StatPill label="Dogleg Severity" value={surveyRes.dls} unit="°/100ft" color="amber" />
                    <StatPill label="ΔTVD" value={surveyRes.tvd} unit="ft" color="emerald" />
                    <StatPill label="ΔNorth" value={surveyRes.north} unit="ft" />
                    <StatPill label="ΔEast" value={surveyRes.east} unit="ft" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 2: KICKOFF & BUILD
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'kickoff' && (
            <div className="space-y-6">
              {/* Whipstock Card */}
              <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2"><Drill size={16} /> Whipstock Kickoff Analysis (SPE-11382)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <SliderInput label="Whipstock Face" value={inp.whipstockFace ?? 45} onChange={v => update('whipstockFace', v)} min={0} max={360} step={1} unit="°" />
                    <SliderInput label="Planned Inc." value={inp.plannedInc ?? 3} onChange={v => update('plannedInc', v)} min={1} max={15} step={0.5} unit="°" />
                    <SliderInput label="Formation Dip" value={inp.formationDip ?? 5} onChange={v => update('formationDip', v)} min={0} max={45} step={0.5} unit="°" />
                    <SliderInput label="Dip Azimuth" value={inp.dipAzimuth ?? 0} onChange={v => update('dipAzimuth', v)} min={0} max={360} step={1} unit="°" />
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <StatPill label="Exit Azimuth" value={whipstockRes.exitAzimuth} unit="°" color="cyan" />
                      <StatPill label="DLS" value={whipstockRes.doglegSeverity} unit="°/100ft" color="amber" />
                      <StatPill label="Window" value={whipstockRes.windowLength} unit="ft" color="pink" />
                    </div>
                  </div>
                  <div className="aspect-square bg-slate-950 rounded-xl border border-white/5 overflow-hidden">
                    <KickoffMethodDiagram
                      whipstockFace={inp.whipstockFace ?? 45}
                      plannedInc={inp.plannedInc ?? 3}
                      doglegSeverity={whipstockRes.doglegSeverity}
                      tvd={8000} kop={5000}
                    />
                  </div>
                </div>
              </div>

              {/* Mud Motor Build Rate */}
              <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2"><Wrench size={16} /> Mud Motor Build Rate (SPE-30497)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <SliderInput label="Bend Angle" value={inp.motorBend ?? 1.5} onChange={v => update('motorBend', v)} min={0.5} max={3} step={0.1} unit="°" />
                    <SliderInput label="Motor OD" value={inp.motorSize ?? 6.75} onChange={v => update('motorSize', v)} min={4.75} max={9.5} step={0.25} unit="″" />
                    <SliderInput label="Upper Stab" value={inp.upperStabGauge ?? 8.25} onChange={v => update('upperStabGauge', v)} min={5} max={12.25} step={0.125} unit="″" />
                    <SliderInput label="Lower Stab" value={inp.lowerStabGauge ?? 8.25} onChange={v => update('lowerStabGauge', v)} min={5} max={12.25} step={0.125} unit="″" />
                    <SliderInput label="BHA Length" value={inp.bhaLength ?? 30} onChange={v => update('bhaLength', v)} min={10} max={60} step={1} unit=" ft" />
                    <div className="grid grid-cols-3 gap-2">
                      <StatPill label="Build Rate" value={motorBuildRes.buildRate} unit="°/100ft" color="emerald" />
                      <StatPill label="Turn Rate" value={motorBuildRes.turnRate} unit="°/100ft" color="amber" />
                      <StatPill label="Net DLS" value={motorBuildRes.netDogleg} unit="°/100ft" color="cyan" />
                    </div>
                  </div>
                  <div className="bg-slate-950 rounded-xl border border-white/5 p-4">
                    <MotorBuildRateDiagram buildRate={motorBuildRes.buildRate} netDogleg={motorBuildRes.netDogleg}
                      bendAngle={inp.motorBend ?? 1.5} holeSize={inp.holeSize ?? 8.5} />
                    <BuildRateChart buildRate={motorBuildRes.buildRate} bendAngle={inp.motorBend ?? 1.5} />
                  </div>
                </div>
              </div>

              {/* RSS Steering */}
              <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2"><Radio size={16} /> RSS Pad-Force Steering (SPE-170592)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs text-slate-500 block">RSS Type</label>
                    <div className="flex gap-2 mb-2">
                      {(['push','point'] as const).map(t => (
                        <button key={t} onClick={() => update('rssType', t)}
                          className={cn('px-3 py-1.5 rounded-lg text-xs font-black transition-all', (inp.rssType ?? 'push') === t ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400')}>
                          {t === 'push' ? 'Push-the-Bit' : 'Point-the-Bit'}
                        </button>
                      ))}
                    </div>
                    <SliderInput label="Pad Force" value={inp.pushForce ?? 2500} onChange={v => update('pushForce', v)} min={500} max={8000} step={100} unit=" lbf" />
                    <SliderInput label="Formation UCS" value={inp.formationUCS ?? 15000} onChange={v => update('formationUCS', v)} min={5000} max={30000} step={500} unit=" psi" />
                    <SliderInput label="RPM" value={inp.rssRpm ?? 120} onChange={v => update('rssRpm', v)} min={40} max={300} step={5} unit=" rev/min" />
                    <div className="grid grid-cols-3 gap-2">
                      <StatPill label="DLS" value={rssSteerRes.dls} unit="°/100ft" color="cyan" />
                      <StatPill label="Lat. Cut" value={formatNumber(rssSteerRes.lateralCutInPerRev, 4)} unit=" in/rev" />
                      <StatPill label="ROP Eff." value={formatNumber(rssSteerRes.ropEfficiency * 100, 1)} unit="%" color="emerald" />
                    </div>
                  </div>
                  <div className="bg-slate-950 rounded-xl border border-white/5 p-4 space-y-2">
                    <RSSDiagram dls={rssSteerRes.dls} padForce={inp.pushForce ?? 2500} formationUCS={inp.formationUCS ?? 15000} />
                    <RSSForceDiagram padForce={inp.pushForce ?? 2500} netSteeringForce={rssSteerRes.netSteeringForce}
                      padPressure={rssSteerRes.padPressure} formationUCS={inp.formationUCS ?? 15000} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 3: STEERING MODES
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'steering' && (
            <div className="space-y-6">
              {/* Sliding Mode Dogleg + DLS Profile */}
              <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2"><SlidersHorizontal size={16} /> Sliding Mode Dogleg & DLS Profile</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <SliderInput label="Bend Angle" value={inp.motorBend ?? 1.5} onChange={v => update('motorBend', v)} min={0.5} max={3} step={0.1} unit="°" />
                    <SliderInput label="Toolface" value={inp.whipstockFace ?? 45} onChange={v => update('whipstockFace', v)} min={0} max={360} step={1} unit="°" />
                    <SliderInput label="Anisotropy" value={inp.formationAnisotropy ?? 1} onChange={v => update('formationAnisotropy', v)} min={0.5} max={2} step={0.05} />
                    <div className="grid grid-cols-3 gap-2">
                      <StatPill label="DLS" value={slideDogleg.dls} unit="°/100ft" color="cyan" />
                      <StatPill label="Build" value={slideDogleg.buildRate} unit="°/100ft" />
                      <StatPill label="Turn" value={slideDogleg.turnRate} unit="°/100ft" color="amber" />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">
                      DLS = (Bend × Motor OD × Toolface factor × Anisotropy × 5.5) ÷ Hole Size
                    </p>
                  </div>
                  <div className="bg-slate-950 rounded-xl border border-white/5 overflow-hidden" style={{ height: 280 }}>
                    <DLSProfile stations={dlsStations} maxDls={10} targetDls={inp.targetDogleg ?? 3} />
                  </div>
                </div>
              </div>

              {/* Slide / Rotate Schedule + Gantt */}
              <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2"><Activity size={16} /> Slide / Rotate Schedule & Stand-by-Stand Gantt</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <SliderInput label="Target DLS" value={inp.targetDogleg ?? 3} onChange={v => update('targetDogleg', v)} min={0.5} max={15} step={0.1} unit="°/100ft" />
                    <SliderInput label="Motor Yield" value={motorYield} onChange={() => {}} min={motorYield-2} max={motorYield+2} step={0.1} unit="°/100ft" />
                    <SliderInput label="Rotary DLS" value={inp.rotaryDLS ?? 0.3} onChange={v => update('rotaryDLS', v)} min={0} max={2} step={0.1} unit="°/100ft" />
                    <SliderInput label="Section Length" value={inp.sectionLength ?? 2000} onChange={v => update('sectionLength', v)} min={100} max={5000} step={50} unit=" ft" />
                    <div className="grid grid-cols-3 gap-2">
                      <StatPill label="Slide Ft" value={slideSched.slideFootage} unit="ft" color="pink" />
                      <StatPill label="Rotate Ft" value={slideSched.rotateFootage} unit="ft" color="emerald" />
                      <StatPill label="Slide %" value={slideSched.slidePercent} unit="%" color="amber" />
                    </div>
                    <div className="bg-slate-950 rounded-lg p-3 text-xs text-slate-400">
                      <span className="text-slate-500">Slide per 30′ joint: </span>
                      <span className="text-cyan-400 font-black">{slideSched.slidePerJoint} ft</span>
                      <span className="text-slate-600 mx-2">|</span>
                      <span className="text-slate-500">Achieved DLS: </span>
                      <span className="text-emerald-400 font-black">{slideSched.targetAchieved} °/100ft</span>
                    </div>
                    <div className="bg-slate-950 rounded-lg p-3 text-xs text-slate-400">
                      <span className="text-slate-500">Optimal Ratio: </span>
                      <span className="text-indigo-400 font-black">{slideOpt.slidePct}% slide</span>
                      <span className="text-slate-600 mx-2">|</span>
                      <span className="text-slate-500">Rotate: </span>
                      <span className="text-amber-400 font-black">{slideOpt.rotatePct}%</span>
                    </div>
                  </div>
                  <div className="bg-slate-950 rounded-xl border border-white/5 overflow-hidden" style={{ height: 340 }}>
                    <SlideRotateGanttChart
                      stands={slideRotateStands}
                      totalMd={inp.sectionLength ?? 2000}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 4: TOOLFACE CONTROL
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'toolface' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* GTF */}
                <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                  <h3 className="text-sm font-black text-white mb-4">Gravity Toolface</h3>
                  <div className="aspect-square bg-slate-950 rounded-xl border border-white/5 overflow-hidden">
                    <GravityToolface toolface={inp.whipstockFace ?? 45} inclination={inp.inclination ?? 25} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <StatPill label="GTF Angle" value={inp.whipstockFace ?? 45} unit="°" color="cyan" />
                    <StatPill label="Inc." value={inp.inclination ?? 25} unit="°" />
                  </div>
                </div>

                {/* MTF */}
                <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                  <h3 className="text-sm font-black text-white mb-4">Magnetic Toolface</h3>
                  <div className="aspect-square bg-slate-950 rounded-xl border border-white/5 overflow-hidden">
                    <MagneticToolface toolface={inp.magAzi ?? 45} declination={declination} latitude={inp.latitude ?? 30} />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 text-center">
                    {inp.inclination < 5 ? 'MTF valid at low inclination (< 5°)' : 'GTF recommended above 5° inclination'}
                  </p>
                </div>

                {/* Magnetic Corrections */}
                <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                  <h3 className="text-sm font-black text-white mb-4">Magnetic Corrections</h3>
                  <div className="space-y-3">
                    <SliderInput label="Latitude" value={inp.latitude ?? 30} onChange={v => update('latitude', v)} min={-90} max={90} step={1} unit="°" />
                    <SliderInput label="Longitude" value={inp.longitude ?? -90} onChange={v => update('longitude', v)} min={-180} max={180} step={1} unit="°" />
                    <SliderInput label="Mag. Azimuth" value={inp.magAzi ?? 45} onChange={v => update('magAzi', v)} min={0} max={360} step={1} unit="°" />
                    <div className="grid grid-cols-2 gap-2">
                      <StatPill label="Declination" value={declination} unit="°" color="amber" />
                      <StatPill label="True TF" value={tfCorr.trueToolface} unit="°" color="emerald" />
                    </div>
                    <div className="bg-slate-950 rounded-xl border border-white/5 overflow-hidden" style={{ height: 180 }}>
                      <MagneticDeclinationMap lat={inp.latitude ?? 30} lon={inp.longitude ?? -90} declination={declination} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 5: SURVEY CORRECTIONS
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'survey' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Axial Magnetic Interference */}
                <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                  <h3 className="text-sm font-black text-white mb-4">Axial Magnetic Interference (SPE-103736)</h3>
                  <div className="space-y-3">
                    <SliderInput label="Measured Azi" value={inp.measuredAzimuth ?? 45} onChange={v => update('measuredAzimuth', v)} min={0} max={360} step={1} unit="°" />
                    <SliderInput label="Mag Dip Angle" value={inp.magDipAngle ?? 60} onChange={v => update('magDipAngle', v)} min={0} max={90} step={0.5} unit="°" />
                    <SliderInput label="Total Field" value={inp.totalFieldStrength ?? 48000} onChange={v => update('totalFieldStrength', v)} min={20000} max={70000} step={100} unit=" nT" />
                    <SliderInput label="Axial Bias" value={inp.axialBiasEstimate ?? 1500} onChange={v => update('axialBiasEstimate', v)} min={0} max={5000} step={50} unit=" nT" />
                    <SliderInput label="Non-Mag Spacing" value={inp.nonMagSpacing ?? 40} onChange={v => update('nonMagSpacing', v)} min={10} max={120} step={1} unit=" ft" />
                    <div className="grid grid-cols-2 gap-2">
                      <StatPill label="Corrected Azi" value={axialRes.correctedAzimuth} unit="°" color="emerald" />
                      <StatPill label="Δ Correction" value={axialRes.azimuthCorrection} unit="°" color="amber" />
                      <StatPill label="H Field" value={axialRes.horizontalField} unit="nT" color="cyan" />
                      <StatPill label="Reliability" value={axialRes.reliabilityFlag.toUpperCase()} color={
                        axialRes.reliabilityFlag === 'good' ? 'emerald' : axialRes.reliabilityFlag === 'marginal' ? 'amber' : 'red'
                      } />
                    </div>
                    <div className="bg-slate-950 rounded-xl border border-white/5 overflow-hidden" style={{ height: 160 }}>
                      <AxialInterferenceDiagram correctedAzimuth={axialRes.correctedAzimuth}
                        azimuthCorrection={axialRes.azimuthCorrection} horizontalField={axialRes.horizontalField}
                        axialBias={inp.axialBiasEstimate ?? 1500} />
                    </div>
                  </div>
                </div>

                {/* IFR Correction */}
                <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                  <h3 className="text-sm font-black text-white mb-4">IFR Geomagnetic Referencing (SPE-174861)</h3>
                  <div className="space-y-3">
                    <SliderInput label="IGRF Decl." value={inp.igrfDeclination ?? 2.5} onChange={v => update('igrfDeclination', v)} min={-20} max={20} step={0.1} unit="°" />
                    <SliderInput label="IGRF Dip" value={inp.igrfDip ?? 60} onChange={v => update('igrfDip', v)} min={0} max={90} step={0.5} unit="°" />
                    <SliderInput label="Crustal N" value={inp.crustalFieldN ?? 50} onChange={v => update('crustalFieldN', v)} min={-500} max={500} step={10} unit=" nT" />
                    <SliderInput label="Crustal E" value={inp.crustalFieldE ?? -30} onChange={v => update('crustalFieldE', v)} min={-500} max={500} step={10} unit=" nT" />
                    <SliderInput label="Diurnal Var." value={inp.diurnalVariation ?? 25} onChange={v => update('diurnalVariation', v)} min={0} max={100} step={5} unit=" nT" />
                    <div className="grid grid-cols-2 gap-2">
                      <StatPill label="Corr. Decl." value={ifrRes.correctedDeclination} unit="°" color="emerald" />
                      <StatPill label="Δ Decl." value={ifrRes.declinationCorrection} unit="°" color="amber" />
                      <StatPill label="Corr. Field" value={ifrRes.correctedTotalField} unit="nT" color="cyan" />
                      <StatPill label="Uncert." value={ifrRes.uncertaintyEstimate} unit="nT" color="pink" />
                    </div>
                    <div className="bg-slate-950 rounded-xl border border-white/5 overflow-hidden" style={{ height: 160 }}>
                      <IFRDiagram correctedDeclination={ifrRes.correctedDeclination}
                        declinationCorrection={ifrRes.declinationCorrection}
                        igrfDeclination={inp.igrfDeclination ?? 2.5} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Gyro Survey */}
              <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                <h3 className="text-sm font-black text-white mb-4">Gyroscopic Survey Drift Model (SPE-173136)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs text-slate-500 block">Gyro Type</label>
                    <div className="flex gap-2">
                      {(['rate','rlg','fog','mems'] as const).map(t => (
                        <button key={t} onClick={() => update('gyroType', t)}
                          className={cn('px-3 py-1.5 rounded-lg text-xs font-black', (inp.gyroType ?? 'rlg') === t ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400')}>
                          {t.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <SliderInput label="Survey Time" value={inp.surveyTime ?? 4} onChange={v => update('surveyTime', v)} min={0.5} max={24} step={0.5} unit=" hr" />
                    <SliderInput label="Temperature" value={inp.temperature ?? 75} onChange={v => update('temperature', v)} min={20} max={200} step={1} unit="°C" />
                    <div className="grid grid-cols-3 gap-2">
                      <StatPill label="Drift Rate" value={gyroRes.driftRate} unit="°/hr" color="amber" />
                      <StatPill label="Total Drift" value={gyroRes.totalDrift} unit="°" color="cyan" />
                      <StatPill label="Quality" value={formatNumber(gyroRes.qualityIndex, 3)} color={gyroRes.qualityIndex > 0.7 ? 'emerald' : 'amber'} />
                    </div>
                    <div className="bg-slate-950 rounded-lg p-3 text-xs text-slate-400">
                      <span className="text-slate-500">Re-survey every: </span>
                      <span className="text-cyan-400 font-black">{gyroRes.recommendedReSurveyInterval} hr</span>
                      <span className="text-slate-600 mx-2">|</span>
                      <span className="text-slate-500">Earth Rate: </span>
                      <span className="text-emerald-400 font-black">{gyroRes.earthRateCorrection} °/hr</span>
                    </div>
                  </div>
                  <div className="bg-slate-950 rounded-xl border border-white/5 p-4">
                    <GyroDriftChart driftRate={gyroRes.driftRate} totalDrift={gyroRes.totalDrift}
                      gyroType={gyroInput.gyroType} qualityIndex={gyroRes.qualityIndex}
                      surveyTime={inp.surveyTime ?? 4} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 6: UNCERTAINTY (ISCWSA)
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'uncertainty' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                  <h3 className="text-sm font-black text-white mb-4">ISCWSA Error Model (SPE-67616 Rev.4)</h3>
                  <div className="space-y-3">
                    <SliderInput label="Target MD" value={inp.targetMD ?? 8000} onChange={v => update('targetMD', v)} min={1000} max={15000} step={100} unit=" ft" />
                    <SliderInput label="Confidence" value={inp.confidenceLevel ?? 95} onChange={v => update('confidenceLevel', v)} min={39.3} max={99} step={5} unit="%" />
                    <div className="grid grid-cols-2 gap-2">
                      <StatPill label="Semi-Major (1σ)" value={eou.semiMajor / eou.kFactor} unit="ft" color="cyan" />
                      <StatPill label="Semi-Minor (1σ)" value={eou.semiMinor / eou.kFactor} unit="ft" />
                      <StatPill label={`Semi-Major (${eou.confidenceLevel}%)`} value={eou.semiMajor} unit="ft" color="amber" />
                      <StatPill label={`Vertical (${eou.confidenceLevel}%)`} value={eou.verticalUncertainty} unit="ft" />
                    </div>
                    <div className="bg-slate-950 rounded-xl border border-white/5 overflow-hidden" style={{ height: 240 }}>
                      <EllipseOfUncertaintySVG semiMajor={eou.semiMajor} semiMinor={eou.semiMinor}
                        orientation={eou.orientation} confidenceLevel={eou.confidenceLevel}
                        kFactor={eou.kFactor} verticalUncertainty={eou.verticalUncertainty} />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                  <h3 className="text-sm font-black text-white mb-4">Error Source Contribution</h3>
                    <div className="bg-slate-950 rounded-xl border border-white/5 overflow-hidden" style={{ height: 260 }}>
                    <ISCWSAErrorSpider errorTerms={ISCWSA_MWD_ERROR_TERMS.map(t => ({ name: t.code, weight: t.magnitude, value: t.magnitude * 10 }))}
                      inclinations={[iscwsaStations[iscwsaStations.length-1]?.inc ?? 25]}
                      magField={48000} />
                  </div>
                  <div className="bg-slate-950 rounded-xl border border-white/5 overflow-hidden mt-4" style={{ height: 200 }}>
                    <ErrorEllipse3D semiMajor={eou.semiMajor} semiMinor={eou.semiMinor}
                      orientation={eou.orientation} verticalUncertainty={eou.verticalUncertainty}
                      md={inp.targetMD ?? 8000} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 7: ANTI-COLLISION
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'anticollision' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                  <h3 className="text-sm font-black text-white mb-4">Anti-Collision Analysis (SPE-199072)</h3>
                  <div className="space-y-3">
                    <SliderInput label="Offset Well MD" value={inp.offsetWellMD ?? 8500} onChange={v => update('offsetWellMD', v)} min={1000} max={15000} step={100} unit=" ft" />
                    <SliderInput label="Offset Azi" value={inp.offsetAzi ?? 48} onChange={v => update('offsetAzi', v)} min={0} max={360} step={1} unit="°" />
                    <SliderInput label="Offset Inc" value={inp.offsetInc ?? 30} onChange={v => update('offsetInc', v)} min={0} max={90} step={0.5} unit="°" />
                    <div className="grid grid-cols-2 gap-2">
                      <StatPill label="Closest Approach" value={antiColRes.closestApproachDistance} unit="ft" color="cyan" />
                      <StatPill label="@ MD" value={antiColRes.depthAtClosestApproach} unit="ft" />
                      <StatPill label="Sep. Factor" value={antiColRes.separationFactor} color={
                        antiColRes.riskLevel === 'safe' ? 'emerald' : antiColRes.riskLevel === 'minor' ? 'amber' : 'red'
                      } />
                      <StatPill label="Risk Level" value={antiColRes.riskLevel.toUpperCase()} color={
                        antiColRes.riskLevel === 'safe' ? 'emerald' : antiColRes.riskLevel === 'moderate' ? 'amber' : 'red'
                      } />
                    </div>
                    <div className="bg-slate-950 rounded-xl border border-white/5 overflow-hidden" style={{ height: 220 }}>
                      <AntiCollisionDiagram
                        refWell={refWellCoords}
                        offsetWell={offsetWellCoords}
                        closestApproach={antiColRes.closestApproachDistance}
                        depthAtClosest={antiColRes.depthAtClosestApproach}
                        separationFactor={antiColRes.separationFactor}
                        riskLevel={antiColRes.riskLevel}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                  <h3 className="text-sm font-black text-white mb-4">Separation Factor Gauge</h3>
                  <div className="bg-slate-950 rounded-xl border border-white/5 overflow-hidden" style={{ height: 260 }}>
                    <SeparationFactorGauge separationFactor={antiColRes.separationFactor} riskLevel={antiColRes.riskLevel}
                      refEOU={antiColRes.referenceEOU} offsetEOU={antiColRes.offsetEOU} />
                  </div>
                  <div className="bg-slate-950 rounded-xl border border-white/5 overflow-hidden mt-4" style={{ height: 200 }}>
                    <CollisionRiskMatrix separationFactor={antiColRes.separationFactor}
                      closestApproach={antiColRes.closestApproachDistance}
                      riskLevel={antiColRes.riskLevel} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 8: ECONOMICS
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'cost' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                  <h3 className="text-sm font-black text-white mb-4">Directional Cost Estimation</h3>
                  <div className="space-y-3">
                    <SliderInput label="Rig Day Rate" value={inp.rigDayRate ?? 35000} onChange={v => update('rigDayRate', v)} min={10000} max={100000} step={1000} unit=" $/day" />
                    <SliderInput label="Slide ROP" value={inp.slideROP ?? 30} onChange={v => update('slideROP', v)} min={5} max={100} step={1} unit=" ft/hr" />
                    <SliderInput label="Rotate ROP" value={inp.rotateROP ?? 80} onChange={v => update('rotateROP', v)} min={10} max={200} step={5} unit=" ft/hr" />
                    <SliderInput label="Slide %" value={inp.slidePercent ?? 40} onChange={v => update('slidePercent', v)} min={0} max={100} step={1} unit="%" />
                    <SliderInput label="# Trips" value={inp.numTrips ?? 3} onChange={v => update('numTrips', v)} min={1} max={10} step={1} />
                    <SliderInput label="Trip Time" value={inp.tripTime ?? 12} onChange={v => update('tripTime', v)} min={4} max={48} step={1} unit=" hr" />
                    <SliderInput label="Mud $/bbl" value={inp.mudCostPerBbl ?? 85} onChange={v => update('mudCostPerBbl', v)} min={20} max={300} step={5} unit=" $" />
                    <div className="grid grid-cols-2 gap-2">
                      <StatPill label="Drill Time" value={dirCost.drillingTimeHours} unit="hr" color="cyan" />
                      <StatPill label="Total Cost" value={`$${(dirCost.totalCostUSD / 1000).toFixed(0)}k`} color="emerald" />
                      <StatPill label="Cost/Foot" value={`$${dirCost.costPerFoot}`} unit="/ft" color="amber" />
                      <StatPill label="Complexity" value={dirCost.complexityIndex} color="pink" />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                  <h3 className="text-sm font-black text-white mb-4">Cost Breakdown</h3>
                  <div className="bg-slate-950 rounded-xl border border-white/5 overflow-hidden" style={{ height: 380 }}>
                    <DirectionalCostBreakdown
                      drillingTimeHours={dirCost.drillingTimeHours}
                      totalCostUSD={dirCost.totalCostUSD}
                      costPerFoot={dirCost.costPerFoot}
                      complexityIndex={dirCost.complexityIndex}
                      rigDayRate={inp.rigDayRate ?? 35000}
                        mudCost={(inp.mudCostPerBbl ?? 85) * (inp.mudVolume ?? 2000)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 9: REFERENCE PAPERS
              ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'reference' && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-6">
                <h3 className="text-sm font-black text-white mb-4">SPE Papers Timeline</h3>
                <div className="bg-slate-950 rounded-xl border border-white/5 p-4 overflow-hidden" style={{ height: 220 }}>
                  <PapersTimelineChart papers={DRILLING_PAPERS} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DRILLING_PAPERS.map(p => (
                  <a key={p.title} href={p.link} target="_blank" rel="noopener noreferrer"
                    className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all group cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors leading-snug">{p.title}</h4>
                      <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-black shrink-0',
                        p.difficulty === 'Basic' ? 'bg-emerald-500/20 text-emerald-400' :
                        p.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400')}>{p.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                      <span>{p.authors}</span>
                      {p.speNumber && <span className="text-indigo-500/70">{p.speNumber}</span>}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                    <p className="text-[11px] text-indigo-400/70 mt-1 font-black">{p.keyConcept}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};