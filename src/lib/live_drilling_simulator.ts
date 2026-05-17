/* ═══════════════════════════════════════════════════════════════════════
   Live Drilling Simulator Engine
   - Simulates full directional well construction step-by-step
   - Links all calculations: survey, DLS, toolface, uncertainty, anti-collision
   - Produces frame-by-frame state for animated visualization components

   Used by: LiveDrillingSimulator.tsx, AnimatedWellPath.tsx, LiveFormulaPanel.tsx
   ═══════════════════════════════════════════════════════════════════════ */

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
  calculateSurvey, SurveyPoint, SurveyResult,
  calculateMotorYield, calculatePlannedDogleg,
  calculateWhipstockKickoff, calculateMotorBuildRate,
  calculateSlidingDogleg, calculateSlideSchedule, optimizeSlideRotateRatio,
  calculateRSSDeflection,
  magToolfaceCorrection, toolfaceTo3DDogleg, getMagneticDeclination,
  correctAxialMagneticInterference, AxialInterferenceInput,
  applyIFRCorrection, IFRInput,
  calculateGyroSurvey, GyroSurveyInput,
  calculateISCWSAError, ISCWSAStation, ISCWSA_MWD_ERROR_TERMS,
  calculateAntiCollision,
  calculateDirectionalCost,
} from './drilling';

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface SimulatorConfig {
  /* Well plan */
  kopMD: number;           // kickoff point MD (ft)
  targetMD: number;        // total measured depth (ft)
  targetInc: number;       // target inclination at TD (°)
  targetAzi: number;       // target azimuth at TD (°)
  buildRate: number;       // planned build rate (°/100ft)
  turnRate: number;        // planned turn rate (°/100ft)

  /* Motor / BHA */
  motorBend: number;       // bend angle (°)
  motorSize: number;       // motor OD (in)
  holeSize: number;        // hole size (in)
  slidePercent: number;    // percentage of sliding

  /* Toolface */
  toolface: number;        // toolface orientation (°)
  inclination: number;     // current inclination for corrections (°)

  /* RSS */
  rssType: 'push' | 'point';
  pushForce: number;       // pad force (lbf)
  formationUCS: number;    // formation strength (psi)
  rssRpm: number;          // RPM

  /* Magnetic */
  latitude: number;
  longitude: number;
  year: number;
  magAzimuth: number;

  /* Formation */
  formationDip: number;
  dipAzimuth: number;
  formationAnisotropy: number;

  /* Uncertainty */
  confidenceLevel: number;

  /* Anti-collision offset well */
  offsetWellMD: number;
  offsetAzi: number;
  offsetInc: number;

  /* Cost */
  rigDayRate: number;
  slideROP: number;
  rotateROP: number;
  tripTime: number;
  numTrips: number;
  mudCostPerBbl: number;
  mudVolume: number;

  /* Simulation control */
  simulationSpeed: number;   // 1x, 2x, 5x, 10x
  stepIntervalMD: number;    // ft per simulation step
  isRunning: boolean;
}

export interface SimulatorFrame {
  /* Progression */
  currentMD: number;
  progressPercent: number;
  currentTVD: number;
  currentNorth: number;
  currentEast: number;

  /* Current attitude */
  currentInc: number;
  currentAzi: number;

  /* Latest survey leg */
  surveyResult: SurveyResult;

  /* Kickoff parameters at current depth */
  motorYield: number;
  plannedDLS: number;

  /* Toolface at current state */
  declination: number;
  trueToolface: number;
  gravityToolface: number;
  magneticToolface: number;

  /* Steering */
  slidingDLS: number;
  slideFootage: number;
  rotateFootage: number;
  slidePct: number;
  optimalSlidePct: number;

  /* Magnetic corrections */
  correctedAzimuth: number;
  azimuthCorrection: number;
  ifrDeclination: number;
  ifrDeclinationCorrection: number;

  /* Uncertainty */
  semiMajorUncertainty: number;
  semiMinorUncertainty: number;
  verticalUncertainty: number;
  eouOrientation: number;

  /* Anti-collision */
  separationFactor: number;
  closestApproach: number;
  riskLevel: string;

  /* Cost accrued */
  elapsedHours: number;
  costAccrued: number;

  /* Well path so far (array of points) */
  wellPathPoints: { md: number; tvd: number; north: number; east: number; inc: number; azi: number; dls: number }[];

  /* Offset well path */
  offsetWellPoints: { md: number; tvd: number; north: number; east: number; inc: number; azi: number }[];

  /* ISCWSA stations built up so far */
  iscwsaStations: ISCWSAStation[];

  /* Latest warning flags */
  warnings: SimulatorWarning[];
}

export interface SimulatorWarning {
  type: 'dls_high' | 'collision_risk' | 'toolface_invalid' | 'uncertainty_high' | 'build_rate_exceeded';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  value: number;
  threshold: number;
}

export const defaultSimConfig: SimulatorConfig = {
  kopMD: 3000,
  targetMD: 10000,
  targetInc: 30,
  targetAzi: 45,
  buildRate: 2.5,
  turnRate: 0.5,
  motorBend: 1.5,
  motorSize: 6.75,
  holeSize: 8.5,
  slidePercent: 40,
  toolface: 45,
  inclination: 0,
  rssType: 'push',
  pushForce: 2500,
  formationUCS: 15000,
  rssRpm: 120,
  latitude: 30,
  longitude: -90,
  year: 2026,
  magAzimuth: 45,
  formationDip: 5,
  dipAzimuth: 0,
  formationAnisotropy: 0.8,
  confidenceLevel: 95,
  offsetWellMD: 8500,
  offsetAzi: 48,
  offsetInc: 30,
  rigDayRate: 35000,
  slideROP: 30,
  rotateROP: 80,
  tripTime: 12,
  numTrips: 3,
  mudCostPerBbl: 85,
  mudVolume: 2000,
  simulationSpeed: 5,
  stepIntervalMD: 50,
  isRunning: false,
};

/* ─── Core Simulation Engine ─────────────────────────────────────────── */

/**
 * Compute a single frame of the drilling simulator.
 * This is a PURE function - takes current state + config, returns next frame.
 * No side effects, no React state. Designed to be called from a timer or RAF loop.
 */
export function computeSimulatorFrame(
  config: SimulatorConfig,
  currentMD: number,
  previousFrame: SimulatorFrame | null
): SimulatorFrame {
  const {
    kopMD, targetMD, targetInc, targetAzi, buildRate, turnRate,
    motorBend, motorSize, holeSize, toolface,
    rssType, pushForce, formationUCS, rssRpm,
    latitude, longitude, year,
    magAzimuth, formationDip, dipAzimuth, formationAnisotropy,
    confidenceLevel,
    offsetWellMD, offsetAzi, offsetInc,
    rigDayRate, slideROP, rotateROP, tripTime, numTrips,
    mudCostPerBbl, mudVolume,
  } = config;

  const progressPercent = Math.min(100, (currentMD / targetMD) * 100);

  /* ── Compute current attitude (inc / azi) based on well plan ── */
  let currentInc: number;
  let currentAzi: number;

  if (currentMD <= kopMD) {
    /* Vertical section */
    currentInc = 0;
    currentAzi = 0;
  } else {
    const buildMD = currentMD - kopMD;
    /* Build section: linear inc build */
    const plannedIncAtMD = Math.min(targetInc, (buildMD / 100) * buildRate);
    /* Turn: start turning after some build */
    const turnStartMD = kopMD + 500; // turn starts 500ft after kickoff
    if (currentMD > turnStartMD) {
      const turnMD = currentMD - turnStartMD;
      const plannedAziChange = Math.min(targetAzi, (turnMD / 100) * turnRate);
      currentAzi = plannedAziChange;
    } else {
      currentAzi = 0;
    }
    /* Incorporate formation dip effect on effective build */
    const dipEffect = 1 + (formationDip / 90) * Math.cos(((dipAzimuth - currentAzi) * Math.PI) / 180);
    currentInc = Math.min(targetInc, plannedIncAtMD * dipEffect);
  }

  /* ── Previous point for survey calculation ── */
  const prevPoint: SurveyPoint = previousFrame
    ? {
        md: previousFrame.currentMD,
        inc: previousFrame.currentInc,
        azi: previousFrame.currentAzi,
      }
    : { md: 0, inc: 0, azi: 0 };

  const currPoint: SurveyPoint = { md: currentMD, inc: currentInc, azi: currentAzi };
  const surveyResult = calculateSurvey(prevPoint, currPoint, 'min-curvature');

  /* ── Build well path points ── */
  const wellPathPoints = previousFrame
    ? [...previousFrame.wellPathPoints]
    : [{ md: 0, tvd: 0, north: 0, east: 0, inc: 0, azi: 0, dls: 0 }];

  /* Add cumulative position */
  const lastWP = wellPathPoints[wellPathPoints.length - 1];
  const newTVD = lastWP.tvd + surveyResult.tvd;
  const newNorth = lastWP.north + surveyResult.north;
  const newEast = lastWP.east + surveyResult.east;

  wellPathPoints.push({
    md: currentMD,
    tvd: Math.round(newTVD * 100) / 100,
    north: Math.round(newNorth * 100) / 100,
    east: Math.round(newEast * 100) / 100,
    inc: currentInc,
    azi: currentAzi,
    dls: surveyResult.dls,
  });

  /* ── Offset well path (simulated) ── */
  const offsetWellPoints = generateOffsetWellPath(
    offsetWellMD, offsetInc, offsetAzi, currentMD
  );

  /* ── Motor / Kickoff calculations ── */
  const motorYield = calculateMotorYield(motorBend, motorSize, holeSize);
  const plannedDLS = calculatePlannedDogleg(motorYield, config.slidePercent);
  const whipstockRes = calculateWhipstockKickoff(toolface, currentInc, formationDip, dipAzimuth);

  /* ── Steering calculations ── */
  const slideDogleg = calculateSlidingDogleg(
    motorBend, toolface, formationAnisotropy, holeSize, motorSize
  );
  const sectionLength = targetMD - currentMD;
  const slideSched = calculateSlideSchedule(plannedDLS, motorYield, 0.3, Math.max(100, sectionLength));
  const slideOpt = optimizeSlideRotateRatio(plannedDLS, motorYield);

  /* ── RSS deflection ── */
  const rssSteerRes = calculateRSSDeflection(pushForce, formationUCS, rssRpm, holeSize);

  /* ── Toolface / Magnetic ── */
  const declination = getMagneticDeclination(latitude, longitude, year);
  const tfCorr = magToolfaceCorrection(magAzimuth, currentInc, declination);
  const tf3d = toolfaceTo3DDogleg(toolface, surveyResult.dls, currentInc);

  /* ── Axial magnetic interference ── */
  const axialInput: AxialInterferenceInput = {
    measuredAzimuth: magAzimuth,
    inclination: currentInc,
    magDipAngle: 60,
    totalFieldStrength: 48000,
    axialBiasEstimate: 1500,
    nonMagSpacing: 40,
    bhaLengthBelowNMDC: 60,
  };
  const axialRes = correctAxialMagneticInterference(axialInput);

  /* ── IFR ── */
  const ifrInput: IFRInput = {
    igrfDeclination: 2.5,
    igrfDip: 60,
    igrfTotalField: 48000,
    crustalFieldN: 50,
    crustalFieldE: -30,
    crustalFieldD: 20,
    diurnalVariation: 25,
    secularVariationRate: 20,
    yearsSinceModel: 2,
  };
  const ifrRes = applyIFRCorrection(ifrInput);

  /* ── ISCWSA Uncertainty (progressive) ── */
  const iscwsaStations = buildISCWSAStations(wellPathPoints);
  const eou = calculateISCWSAError(
    iscwsaStations, ISCWSA_MWD_ERROR_TERMS, latitude, confidenceLevel
  );

  /* ── Anti-Collision ── */
  const antiColRes = calculateAntiCollision(wellPathPoints, offsetWellPoints);

  /* ── Cost accrual ── */
  const elapsedMD = currentMD - (previousFrame?.currentMD ?? 0);
  const elapsedHours = (previousFrame?.elapsedHours ?? 0) +
    (elapsedMD / ((slideROP * config.slidePercent / 100) + (rotateROP * (100 - config.slidePercent) / 100)));
  const costAccrued = elapsedHours * (rigDayRate / 24) + (mudCostPerBbl * mudVolume * (currentMD / targetMD));

  /* ── Warnings ── */
  const warnings: SimulatorWarning[] = [];
  if (surveyResult.dls > 5) {
    warnings.push({
      type: 'dls_high',
      message: `DLS ${surveyResult.dls.toFixed(1)} °/100ft exceeds 5 °/100ft`,
      severity: surveyResult.dls > 8 ? 'critical' : 'warning',
      value: surveyResult.dls,
      threshold: 5,
    });
  }
  if (antiColRes.separationFactor < 2 && antiColRes.separationFactor > 0) {
    warnings.push({
      type: 'collision_risk',
      message: `Separation factor ${antiColRes.separationFactor.toFixed(2)} below 2.0`,
      severity: antiColRes.separationFactor < 1 ? 'critical' : 'warning',
      value: antiColRes.separationFactor,
      threshold: 2,
    });
  }
  if (currentInc < 5 && toolface !== 0) {
    warnings.push({
      type: 'toolface_invalid',
      message: `GTF unreliable below 5° inclination (current: ${currentInc.toFixed(1)}°)`,
      severity: 'info',
      value: currentInc,
      threshold: 5,
    });
  }
  if (eou.semiMajor > 100) {
    warnings.push({
      type: 'uncertainty_high',
      message: `EOU semi-major ${eou.semiMajor.toFixed(0)} ft exceeds 100 ft at ${confidenceLevel}%`,
      severity: eou.semiMajor > 200 ? 'critical' : 'warning',
      value: eou.semiMajor,
      threshold: 100,
    });
  }

  return {
    currentMD,
    progressPercent,
    currentTVD: newTVD,
    currentNorth: newNorth,
    currentEast: newEast,
    currentInc,
    currentAzi,
    surveyResult,
    motorYield,
    plannedDLS,
    declination,
    trueToolface: tfCorr.trueToolface,
    gravityToolface: toolface,
    magneticToolface: magAzimuth,
    slidingDLS: slideDogleg.dls,
    slideFootage: slideSched.slideFootage,
    rotateFootage: slideSched.rotateFootage,
    slidePct: slideSched.slidePercent,
    optimalSlidePct: slideOpt.slidePct,
    correctedAzimuth: axialRes.correctedAzimuth,
    azimuthCorrection: axialRes.azimuthCorrection,
    ifrDeclination: ifrRes.correctedDeclination,
    ifrDeclinationCorrection: ifrRes.declinationCorrection,
    semiMajorUncertainty: eou.semiMajor,
    semiMinorUncertainty: eou.semiMinor,
    verticalUncertainty: eou.verticalUncertainty,
    eouOrientation: eou.orientation,
    separationFactor: antiColRes.separationFactor,
    closestApproach: antiColRes.closestApproachDistance,
    riskLevel: antiColRes.riskLevel,
    elapsedHours: Math.round(elapsedHours * 100) / 100,
    costAccrued: Math.round(costAccrued),
    wellPathPoints,
    offsetWellPoints,
    iscwsaStations,
    warnings,
  };
}

/* ─── React Hook: useLiveDrillingSimulator ───────────────────────────── */

export function useLiveDrillingSimulator(initialConfig: Partial<SimulatorConfig> = {}) {
  const config = useMemo<SimulatorConfig>(
    () => ({ ...defaultSimConfig, ...initialConfig }),
    [JSON.stringify(initialConfig)] // eslint-disable-line
  );

  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(config.simulationSpeed);
  const [currentMD, setCurrentMD] = useState(0);
  const [frame, setFrame] = useState<SimulatorFrame | null>(null);
  const [frameHistory, setFrameHistory] = useState<SimulatorFrame[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef<SimulatorFrame | null>(null);
  const mdRef = useRef(0);

  const stepSimulation = useCallback(() => {
    const newMD = mdRef.current + config.stepIntervalMD * speed;
    if (newMD >= config.targetMD) {
      mdRef.current = config.targetMD;
      const finalFrame = computeSimulatorFrame(config, config.targetMD, frameRef.current);
      frameRef.current = finalFrame;
      setFrame(finalFrame);
      setCurrentMD(config.targetMD);
      setFrameHistory(prev => [...prev, finalFrame]);
      setIsRunning(false);
      setIsComplete(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    mdRef.current = newMD;
    const newFrame = computeSimulatorFrame(config, newMD, frameRef.current);
    frameRef.current = newFrame;
    setFrame(newFrame);
    setCurrentMD(newMD);
    setFrameHistory(prev => [...prev, newFrame]);
  }, [config, speed]);

  const play = useCallback(() => {
    if (isRunning) return;
    if (isComplete) {
      /* Reset */
      mdRef.current = 0;
      frameRef.current = null;
      setFrame(null);
      setCurrentMD(0);
      setFrameHistory([]);
      setIsComplete(false);
    }
    setIsRunning(true);
    /* Initial frame at 0 if none */
    if (!frameRef.current) {
      const initFrame = computeSimulatorFrame(config, 0, null);
      frameRef.current = initFrame;
      setFrame(initFrame);
      setCurrentMD(0);
    }
    intervalRef.current = setInterval(stepSimulation, 100); // 100ms per step (~10 fps)
  }, [isRunning, isComplete, config, stepSimulation]);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    pause();
    mdRef.current = 0;
    frameRef.current = null;
    setFrame(null);
    setCurrentMD(0);
    setFrameHistory([]);
    setIsComplete(false);
  }, [pause]);

  const setSimSpeed = useCallback((s: number) => {
    setSpeed(s);
    if (isRunning) {
      /* Restart interval with new speed */
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(stepSimulation, 100);
    }
  }, [isRunning, stepSimulation]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    config,
    isRunning,
    isComplete,
    currentMD,
    frame,
    frameHistory,
    speed,
    play,
    pause,
    reset,
    setSimSpeed,
    setCurrentMD, // for manual scrubbing
  };
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function buildISCWSAStations(wellPath: { md: number; inc: number; azi: number; tvd: number; north: number; east: number }[]): ISCWSAStation[] {
  return wellPath.map(p => ({
    md: p.md,
    inc: p.inc,
    azi: p.azi,
    tvd: p.tvd,
    north: p.north,
    east: p.east,
  }));
}

function generateOffsetWellPath(
  offsetMD: number,
  offsetInc: number,
  offsetAzi: number,
  refMD: number
): import('./drilling').OffsetWellStation[] {
  const points: import('./drilling').OffsetWellStation[] = [];
  const nSteps = 20;
  let tvd = 0, n = 0, e = 0;

  /* Offset well starts offset by 100 ft NE from reference, same trajectory shape */
  const startN = 100;
  const startE = 80;

  for (let i = 0; i <= nSteps; i++) {
    const frac = i / nSteps;
    const md = frac * offsetMD;
    const inc = frac * offsetInc;
    const azi = offsetAzi;
    const seg = offsetMD / nSteps;
    const iRad = (inc * Math.PI) / 180;
    const aRad = (azi * Math.PI) / 180;
    tvd += seg * Math.cos(iRad);
    n = startN + tvd * Math.tan(iRad) * Math.cos(aRad);
    e = startE + tvd * Math.tan(iRad) * Math.sin(aRad);

    /* EOU grows linearly with MD for offset well */
    const eouSf = 2.8;
    const semiMajor = md * 0.004 * eouSf;  // ~0.4% of depth at 2.8σ
    const semiMinor = md * 0.002 * eouSf;  // ~0.2% of depth at 2.8σ
    const eouAzimuth = offsetAzi;               // aligned with well direction

    if (md <= refMD) {
      points.push({
        md: Math.round(md),
        tvd: Math.round(tvd * 100) / 100,
        north: Math.round(n * 100) / 100,
        east: Math.round(e * 100) / 100,
        inc: Math.round(inc * 10) / 10,
        azi,
        semiMajor: Math.round(semiMajor * 100) / 100,
        semiMinor: Math.round(semiMinor * 100) / 100,
        eouAzimuth: Math.round(eouAzimuth * 10) / 10,
      });
    }
  }
  return points;
}

/* ─── Live Formula Evaluator ─────────────────────────────────────────── */

export interface FormulaDisplay {
  name: string;
  symbol: string;
  generic: string;
  substituted: string;
  result: string;
  unit: string;
  speRef: string;
  group: string;
}

/**
 * Generate live-substituted formula strings from current frame.
 * Each formula shows the generic equation AND the current values plugged in.
 */
export function generateLiveFormulas(frame: SimulatorFrame, config: SimulatorConfig): FormulaDisplay[] {
  const formulas: FormulaDisplay[] = [];

  /* Minimum Curvature */
  const inc1 = frame.currentInc;
  const inc2 = frame.currentInc; // same for demo
  const azi1 = frame.currentAzi;
  const azi2 = frame.currentAzi;

  formulas.push({
    name: 'Minimum Curvature DL',
    symbol: 'cos⁻¹[cos(I₂-I₁) - sin(I₁)sin(I₂)(1-cos(A₂-A₁))]',
    generic: 'DL = cos⁻¹[cos(ΔI) − sin(I₁)·sin(I₂)·(1 − cos(ΔA))]',
    substituted: `DL = cos⁻¹[cos(${((inc2-inc1)).toFixed(1)}°) − sin(${inc1.toFixed(1)}°)·sin(${inc2.toFixed(1)}°)·(1 − cos(${((azi2-azi1)).toFixed(1)}°))]`,
    result: frame.surveyResult.dls.toFixed(2),
    unit: '°/100ft',
    speRef: 'SPE-67616',
    group: 'Survey',
  });

  formulas.push({
    name: 'RF (Ratio Factor)',
    symbol: 'RF = (2/DL)·tan(DL/2)',
    generic: 'RF = (2 / DL) · tan(DL / 2)',
    substituted: `RF = (2 / ${frame.surveyResult.dls.toFixed(2)}) · tan(${frame.surveyResult.dls.toFixed(2)} / 2)`,
    result: (frame.surveyResult.tvd > 0 ? (frame.surveyResult.tvd / (frame.currentMD - (frame.wellPathPoints[frame.wellPathPoints.length-2]?.md ?? 0))) : 0).toFixed(4),
    unit: 'dimensionless',
    speRef: 'SPE-67616',
    group: 'Survey',
  });

  /* DLS from motor */
  formulas.push({
    name: 'Motor DLS',
    symbol: 'DLS = (Bend × OD × TF × Aniso × 5.5) / Hole',
    generic: 'DLS_motor = (Bend × MotorOD × ToolfaceFactor × Anisotropy × 5.5) / HoleSize',
    substituted: `DLS_motor = (${config.motorBend}° × ${config.motorSize}″ × ${(config.toolface % 180 === 0 ? '1.0' : '0.9')} × ${config.formationAnisotropy} × 5.5) / ${config.holeSize}″`,
    result: frame.slidingDLS.toFixed(2),
    unit: '°/100ft',
    speRef: 'SPE-30497',
    group: 'Kickoff',
  });

  /* Build rate */
  formulas.push({
    name: 'Motor Build Rate',
    symbol: 'BR = Bend × K_geo × (1 − Aniso²)',
    generic: 'BR = BendAngle × GeometricFactor × (1 − Anisotropy²)',
    substituted: `BR = ${config.motorBend}° × K_geo × (1 − ${config.formationAnisotropy.toFixed(2)}²)`,
    result: frame.motorYield.toFixed(2),
    unit: '°/100ft',
    speRef: 'SPE-30497',
    group: 'Kickoff',
  });

  /* Magnetic declination */
  formulas.push({
    name: 'Magnetic Declination',
    symbol: 'True = Mag + Declination',
    generic: 'Azi_true = Azi_magnetic + Declination(lat, lon, year)',
    substituted: `Azi_true = ${config.magAzimuth}° + ${frame.declination.toFixed(2)}°`,
    result: frame.trueToolface.toFixed(2),
    unit: '°',
    speRef: 'IGRF-14',
    group: 'Toolface',
  });

  /* Axial interference correction */
  formulas.push({
    name: 'Axial Correction',
    symbol: 'ΔAzi = B_axial_eff / (B_h · sin(I) · sin(D))',
    generic: 'ΔAzimuth = B_axial_eff / (B_horizontal · sin(Inclination) · sin(MagDip))',
    substituted: `ΔAzi = 1500 / (${(48000 * Math.cos(60 * Math.PI/180)).toFixed(0)} · sin(${frame.currentInc.toFixed(1)}°) · sin(60°))`,
    result: frame.azimuthCorrection.toFixed(2),
    unit: '°',
    speRef: 'SPE-103736',
    group: 'Survey Correction',
  });

  /* ISCWSA EOU scaling */
  formulas.push({
    name: 'EOU Scaling (k-Factor)',
    symbol: 'EOU_95 = σ × k(95%, 2DOF)',
    generic: 'EOU₉₅ = σ₁ · √[−2·ln(1 − 0.95)]  (Rayleigh distribution)',
    substituted: `EOU₉₅ = σ₁ · √[−2·ln(0.05)] = σ₁ · ${Math.sqrt(-2 * Math.log(0.05)).toFixed(3)}`,
    result: frame.semiMajorUncertainty.toFixed(1),
    unit: 'ft',
    speRef: 'SPE-67616 Rev.4',
    group: 'Uncertainty',
  });

  /* Cost per foot */
  formulas.push({
    name: 'Cost per Foot',
    symbol: '$/ft = (DayRate·Days + Mud + Trips) / MD',
    generic: '$/ft = (RigDayRate × DrillingDays + MudCost + TripCost) / TotalMD',
    substituted: `$/ft = ($${config.rigDayRate} × ${frame.elapsedHours.toFixed(1)}/24 + $${config.mudCostPerBbl}×${config.mudVolume} + trips) / ${frame.currentMD} ft`,
    result: (frame.costAccrued / Math.max(1, frame.currentMD)).toFixed(0),
    unit: '$/ft',
    speRef: 'SPE-11382',
    group: 'Economics',
  });

  /* Separation Factor */
  formulas.push({
    name: 'Separation Factor',
    symbol: 'SF = CenterDist / (EOU₁ + EOU₂)',
    generic: 'SF = Center-to-Center Distance / (EOU_ref + EOU_offset)',
    substituted: `SF = ${frame.closestApproach.toFixed(1)} / (${frame.semiMajorUncertainty.toFixed(1)} + ${frame.semiMinorUncertainty.toFixed(1)})`,
    result: frame.separationFactor.toFixed(2),
    unit: 'dimensionless',
    speRef: 'SPE-199072',
    group: 'Anti-Collision',
  });

  return formulas;
}