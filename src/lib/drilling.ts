/**
 * Well Planning & Trajectory Utilities
 */

export interface SurveyStation {
  md: number; // Measured Depth
  inc: number; // Inclination (deg)
  azi: number; // Azimuth (deg)
}

export interface SurveyResult {
  tvd: number;
  north: number;
  east: number;
  dls: number; // Dogleg Severity (deg/100ft)
}

/**
 * Calculate Survey using Minimum Curvature Method
 */
export function calculateMinimumCurvature(s1: SurveyStation, s2: SurveyStation): SurveyResult {
  const i1 = (s1.inc * Math.PI) / 180;
  const i2 = (s2.inc * Math.PI) / 180;
  const a1 = (s1.azi * Math.PI) / 180;
  const a2 = (s2.azi * Math.PI) / 180;
  const dMD = s2.md - s1.md;

  if (dMD <= 0) return { tvd: 0, north: 0, east: 0, dls: 0 };

  // Dogleg Angle (Beta)
  const cosBeta = Math.cos(i2 - i1) - (Math.sin(i1) * Math.sin(i2) * (1 - Math.cos(a2 - a1)));
  const beta = Math.acos(Math.max(-1, Math.min(1, cosBeta)));
  
  // Ratio Factor (RF)
  let rf = 1.0;
  if (beta > 0) {
    rf = (2 / beta) * Math.tan(beta / 2);
  }

  const dNorth = (dMD / 2) * (Math.sin(i1) * Math.cos(a1) + Math.sin(i2) * Math.cos(a2)) * rf;
  const dEast = (dMD / 2) * (Math.sin(i1) * Math.sin(a1) + Math.sin(i2) * Math.sin(a2)) * rf;
  const dTVD = (dMD / 2) * (Math.cos(i1) + Math.cos(i2)) * rf;
  
  // DLS per 100 units
  const dls = (beta * 180 / Math.PI) * (100 / dMD);

  return { tvd: dTVD, north: dNorth, east: dEast, dls };
}

/**
 * Design J-Type Well (Kickoff and Build)
 */
export function designJTypeWell(targetTVD: number, targetDeparture: number, kop: number, buildRate: number) {
  const brRad = (buildRate * Math.PI / 180) / 100; // Build rate in radians per unit depth
  const radius = 1 / brRad;
  
  // Target coordinates relative to KOP
  const tV = targetTVD - kop;
  const tD = targetDeparture;
  
  // Angle of hold section
  const dist = Math.sqrt(tV * tV + tD * tD);
  if (dist < radius) return { holdAngle: 0, radius, eobTVD: kop, eobDeparture: 0, maxInc: 0, totalMD: kop, eobMD: kop };

  const angleToTarget = Math.atan2(tD, tV);
  const angleAlpha = Math.acos(radius / dist);
  const holdAngle = (angleToTarget - angleAlpha) * 180 / Math.PI;
  
  const arcLength = (holdAngle * Math.PI / 180) * radius;
  const eobTVD = kop + radius * Math.sin(holdAngle * Math.PI / 180);
  const eobDeparture = radius * (1 - Math.cos(holdAngle * Math.PI / 180));
  
  // Distance from EOB to Target
  const dV = targetTVD - eobTVD;
  const dD = targetDeparture - eobDeparture;
  const tangentLength = Math.sqrt(dV * dV + dD * dD);
  
  return {
    holdAngle,
    radius,
    eobTVD,
    eobDeparture,
    maxInc: holdAngle,
    totalMD: kop + arcLength + tangentLength,
    eobMD: kop + arcLength
  };
}

/**
 * Anti-collision: Separation Factor basics
 */
export function calculateSeparationFactor(p1: {x: number, y: number, z: number}, p2: {x: number, y: number, z: number}, r1: number, r2: number): number {
  const centerDistance = Math.sqrt(
    Math.pow(p1.x - p2.x, 2) + 
    Math.pow(p1.y - p2.y, 2) + 
    Math.pow(p1.z - p2.z, 2)
  );
  return centerDistance / (r1 + r2);
}

/**
 * PHASE 2: Pore Pressure & Fracture Gradient prediction
 */

/**
 * Eaton's Method for Pore Pressure (Sonic)
 * P = S - (S - Pn) * (DTn / DTobs)^3
 * S: Overburden stress gradient (psi/ft or ppg equivalent)
 * Pn: Normal pore pressure gradient (usually 0.433 psi/ft or 9.0 ppg)
 */
export function eatonPorePressure(overburden: number, normalPP: number, dtNormal: number, dtObs: number): number {
  if (dtObs === 0) return normalPP;
  return overburden - (overburden - normalPP) * Math.pow(dtNormal / dtObs, 3);
}

/**
 * Eaton's Fracture Gradient
 * FG = (v / (1 - v)) * (S - Pp) + Pp
 * v: Poisson's ratio
 */
export function eatonFractureGradient(poisson: number, overburden: number, porePressure: number): number {
  const ratio = poisson / (1 - poisson);
  return ratio * (overburden - porePressure) + porePressure;
}

/**
 * d-exponent calculation
 * ROP: Rate of penetration (ft/hr)
 * RPM: Rotary speed
 * WOB: Weight on bit (klbs)
 * BitDiam: Bit diameter (inches)
 */
export function calculateDExponent(rop: number, rpm: number, wob: number, bitDiam: number): number {
  // Simplified industry formula
  const r = rop;
  const n = rpm;
  const w = wob;
  const d = bitDiam;
  
  if (n === 0 || (12 * w) <= 0) return 0;
  
  const top = Math.log10(r / (60 * n));
  const bottom = Math.log10((12 * w) / (1000 * d)); // Using 1000 for klbs
  
  return top / bottom;
}

/**
 * Corrected d-exponent (dc)
 * normalMW: Normal mud weight (e.g. 9.0 ppg)
 * currentMW: Current mud weight used in drilling
 */
export function calculateDc(dExp: number, normalMW: number, currentMW: number): number {
  if (currentMW === 0) return dExp;
  return dExp * (normalMW / currentMW);
}

/**
 * PHASE 3: Casing Design
 */

export interface CasingSpec {
  grade: string;
  weight: number; // lb/ft
  od: number; // inches
  id: number; // inches
  yieldStrength: number; // psi
  burstRating: number; // psi
  collapseRating: number; // psi
}

export const CASING_GRADES: Record<string, CasingSpec[]> = {
  'J-55': [
    { grade: 'J-55', weight: 23, od: 7, id: 6.366, yieldStrength: 55000, burstRating: 4360, collapseRating: 3270 },
    { grade: 'J-55', weight: 26, od: 7, id: 6.276, yieldStrength: 55000, burstRating: 4980, collapseRating: 4320 },
  ],
  'N-80': [
    { grade: 'N-80', weight: 26, od: 7, id: 6.276, yieldStrength: 80000, burstRating: 7240, collapseRating: 5410 },
    { grade: 'N-80', weight: 29, od: 7, id: 6.184, yieldStrength: 80000, burstRating: 8160, collapseRating: 7020 },
  ],
  'P-110': [
    { grade: 'P-110', weight: 29, od: 7, id: 6.184, yieldStrength: 110000, burstRating: 11220, collapseRating: 8530 },
    { grade: 'P-110', weight: 32, od: 7, id: 6.094, yieldStrength: 110000, burstRating: 12460, collapseRating: 10780 },
  ]
};

/**
 * Calculate Buoyancy Factor
 * MW in ppg, steel density ~65.5 ppg
 */
export function calculateBuoyancyFactor(mw: number): number {
  return 1 - (mw / 65.5);
}

/**
 * Calculate Tensile Load
 */
export function calculateTensileLoad(depth: number, weight: number, mw: number): number {
  const bf = calculateBuoyancyFactor(mw);
  return depth * weight * bf; // lbs
}

/**
 * API Collapse Pressure (Simplified Logic)
 * In a real app, this would use D/t ratio boundaries for Plastic/Elastic/Transition
 */
export function calculateCollapseSafetyFactor(depth: number, mw: number, rating: number): number {
  const externalPressure = 0.052 * mw * depth;
  return rating / externalPressure;
}

/**
 * Burst Safety Factor
 */
export function calculateBurstSafetyFactor(pi: number, pe: number, rating: number): number {
  const diff = pi - pe;
  if (diff <= 0) return 99.9;
  return rating / diff;
}

/**
 * PHASE 5: Drilling Hydraulics
 */

export type RheologyModel = 'bingham' | 'power-law';

/**
 * Pressure Loss through Bit Nozzles
 */
export function calculateBitPressureLoss(mw: number, q: number, nozzles: number[]): number {
  const cd = 0.95;
  const area = nozzles.reduce((sum, n) => sum + (Math.PI * Math.pow(n / 32, 2)) / 4, 0);
  if (area === 0) return 0;
  return (mw * Math.pow(q, 2)) / (10858 * Math.pow(cd, 2) * Math.pow(area, 2));
}

/**
 * Surface Equipment Pressure Loss
 * Types 1-4 (Industry Standard)
 */
export function calculateSurfaceLoss(type: number, mw: number, q: number, pv: number): number {
  // Constants for E (equivalent length) based on pipe size, simplified for app
  const constants: Record<number, number> = { 1: 0.0001, 2: 0.00008, 3: 0.00006, 4: 0.00004 };
  const c = constants[type] || constants[1];
  return c * mw * Math.pow(q, 1.8) * Math.pow(pv, 0.2);
}

/**
 * Detailed Pressure Loss for Pipe or Annulus
 */
export function calculateFrictionalLoss(
  mw: number, 
  v: number, 
  dh: number, 
  di: number, 
  length: number, 
  pv: number, 
  yp: number, 
  model: RheologyModel
): number {
  const d_eff = dh - di; // Hydraulic diameter
  if (d_eff <= 0) return 0;

  if (model === 'bingham') {
    // Bingham Plastic Simplified
    const criticalVelocity = (1.08 * pv + 1.08 * Math.sqrt(Math.pow(pv, 2) + 9.26 * Math.pow(d_eff, 2) * yp * mw)) / (mw * d_eff);
    if (v < criticalVelocity) {
      // Laminar
      return ((pv * v) / (1000 * Math.pow(d_eff, 2)) + (yp / (20 * d_eff))) * length;
    } else {
      // Turbulent
      return (Math.pow(mw, 0.8) * Math.pow(v, 1.8) * Math.pow(pv, 0.2) / (1430 * Math.pow(d_eff, 1.2))) * length;
    }
  } else {
    // Power Law Simplified
    const n = 3.32 * Math.log10((2 * pv + yp) / (pv + yp));
    const k = (pv + yp) / Math.pow(511, n);
    const gamma = (1.6 * v / d_eff) * ((3 * n + 1) / (4 * n));
    const tau = k * Math.pow(gamma, n);
    return (tau * length) / (300 * d_eff);
  }
}

/**
 * Bit Hydraulics Optimization Recommendation
 */
export function recommendOptimalNozzles(mw: number, q: number, pMax: number, depth: number, bitDiam: number) {
  // Parasitic losses approx for optimization
  const p_parasitic = 0.0001 * depth * Math.pow(q, 1.8);
  const p_bit_target_hhp = (pMax - p_parasitic) * 0.65; // Approx for Max HHP
  const p_bit_target_impact = (pMax - p_parasitic) * 0.48; // Approx for Impact Force
  
  const solveArea = (p_target: number) => Math.sqrt((mw * Math.pow(q, 2)) / (10858 * Math.pow(0.95, 2) * p_target));
  
  const areaHHP = solveArea(p_bit_target_hhp);
  const areaImpact = solveArea(p_bit_target_impact);
  
  // Convert area back to 3-nozzle 1/32nd equivalent
  const getNozzles = (area: number) => {
    const d = Math.sqrt((4 * area / 3) / Math.PI) * 32;
    return [Math.round(d), Math.round(d), Math.round(d)];
  };

  return {
    maxHHP: getNozzles(areaHHP),
    maxImpact: getNozzles(areaImpact),
    targets: { hhp: p_bit_target_hhp, impact: p_bit_target_impact }
  };
}

/**
 * Bit Hydraulics Optimization Output
 */
export function calculateHydraulicOptimization(mw: number, q: number, nozzles: number[], bitDiam: number) {
  const bitLoss = calculateBitPressureLoss(mw, q, nozzles);
  const hhp = (q * bitLoss) / 1714;
  const impactForce = 0.01823 * q * Math.sqrt(mw * bitLoss);
  
  const area = nozzles.reduce((sum, n) => sum + (Math.PI * Math.pow(n / 32, 2)) / 4, 0);
  const bitArea = (Math.PI * Math.pow(bitDiam, 2)) / 4;
  const hsi = hhp / bitArea;
  
  return { hhp, impactForce, hsi, bitLoss };
}

/**
 * Surge & Swab Estimation (Simplified Burkhardt's Logic)
 * ΔP = (0.114 * Vp * Yp) / (Dh - Dp) + (0.001 * PV * Vp * L) / (Dh - Dp)^2
 */
export function calculateSurgeSwab(vp: number, yp: number, pv: number, dh: number, dp: number, length: number): number {
  const clearance = dh - dp;
  if (clearance <= 0) return 0;
  const term1 = (0.114 * vp * yp) / clearance;
  const term2 = (0.001 * pv * vp * length) / Math.pow(clearance, 2);
  return term1 + term2;
}

/**
 * PHASE 6: Bit Selection & ROP Optimization
 */

export interface DrillingBit {
  type: 'PDC' | 'Milled Tooth' | 'TCI' | 'Diamond';
  name: string;
  recommendedFormations: string[];
  maxWob: number; // klb
  maxRpm: number;
  cost: number;
}

export const BIT_DATABASE: DrillingBit[] = [
  { type: 'PDC', name: 'Steel Body PDC', recommendedFormations: ['Shale', 'Sandstone'], maxWob: 35, maxRpm: 180, cost: 25000 },
  { type: 'Milled Tooth', name: 'Tri-Cone Milled', recommendedFormations: ['Soft Limestone', 'Shale'], maxWob: 50, maxRpm: 120, cost: 8000 },
  { type: 'TCI', name: 'Tungsten Carbide Insert', recommendedFormations: ['Anhydrite', 'Hard Sandstone'], maxWob: 60, maxRpm: 100, cost: 15000 },
  { type: 'Diamond', name: 'Impregnated Diamond', recommendedFormations: ['Chert', 'Quartzite'], maxWob: 40, maxRpm: 300, cost: 45000 }
];

/**
 * Bourgoyne & Young ROP Model (Simplified)
 * ROP = f1 * f2 * f3 * f4 * f5 * f6 * f7 * f8
 * f1: Formation Strength
 * f2: Depth (Compaction)
 * f3: Pore Pressure (Differential)
 * f4: Bit Weight (WOB/Db)
 * f5: Rotary Speed (RPM/Db)
 * f6: Tooth Wear
 * f7: Bit Hydraulics
 * f8: Global Correction Factor
 */
export function calculateROP(
  wob: number, 
  rpm: number, 
  db: number, 
  depth: number, 
  porePress: number, 
  mw: number,
  toothWear: number // 0 to 8 T-scale
): number {
  const f1 = 15; // Base formation drillability index
  const f2 = Math.exp(0.0001 * (10000 - depth)); // Compaction
  const f3 = Math.exp(-0.0001 * depth * (mw - porePress)); // Differential pressure
  const f4 = Math.pow((wob / db) / 4, 1.5); // WOB factor
  const f5 = Math.pow(rpm / 100, 0.8); // RPM factor
  const f6 = Math.exp(-0.1 * toothWear); // Wear factor
  
  const rop = f1 * f2 * f3 * f4 * f5 * f6;
  return Math.max(0, rop);
}

/**
 * Cost Per Foot Calculator
 * CPF = (Bit Cost + Rig Rate * (Trip Time + Drilling Time)) / Footage
 */
export function calculateCostPerFoot(
  bitCost: number,
  rigRate: number, // $/hr
  tripTime: number, // hr
  drillingTime: number, // hr
  footage: number
): number {
  if (footage === 0) return 0;
  return (bitCost + rigRate * (tripTime + drillingTime)) / footage;
}

/**
 * PHASE 7: Well Control
 */

export interface KillStep {
  strokes: number;
  pressure: number;
}

export function calculateKillMudWeight(omw: number, sidpp: number, tvd: number): number {
  if (tvd === 0) return omw;
  return omw + (sidpp / (0.052 * tvd));
}

export function calculateInitialCirculatingPressure(sidpp: number, scrp: number): number {
  return sidpp + scrp;
}

export function calculateFinalCirculatingPressure(kmw: number, omw: number, scrp: number): number {
  if (omw === 0) return scrp;
  return scrp * (kmw / omw);
}

export function calculateMASP(porePressure: number, omw: number, tvd: number): number {
  return porePressure - (0.052 * omw * tvd);
}

export function identifyInfluxType(sidpp: number, sicp: number, pitsGain: number, length: number): string {
  const gradient = (sicp - sidpp) / (0.052 * length); // Gradient of influx in psi/ft
  if (gradient < 0.1) return "Gas (Dry)";
  if (gradient < 0.2) return "Gas (Wet)";
  if (gradient < 0.45) return "Oil/Condensate";
  return "Salt Water";
}

export function calculateGasMigrationRate(sidpp_increase: number, time_min: number, mw: number): number {
  // Rate in ft/hr = ΔP / (0.052 * MW * hours)
  if (mw === 0 || time_min === 0) return 0;
  return sidpp_increase / (0.052 * mw * (time_min / 60));
}

/**
 * Wait & Weight Pressure Schedule
 */
export function generateWWSchedule(icp: number, fcp: number, totalStrokes: number, steps: number = 10): KillStep[] {
  const schedule: KillStep[] = [];
  const strokeStep = totalStrokes / steps;
  for (let i = 0; i <= steps; i++) {
    const s = Math.round(i * strokeStep);
    // Linear pressure drop across the drill string volume
    const p = icp - ((icp - fcp) * (s / totalStrokes));
    schedule.push({ strokes: s, pressure: Math.round(p) });
  }
  return schedule;
}

/**
 * PHASE 8: Directional Drilling Tools
 */

export interface SurveyPoint {
  md: number;
  inc: number;
  azi: number;
}

export type SurveyMethod = 'tangential' | 'balanced' | 'avg-angle' | 'min-curvature' | 'radius-curvature';

export function calculateSurvey(p1: SurveyPoint, p2: SurveyPoint, method: SurveyMethod): SurveyResult {
  const DL = p2.md - p1.md;
  const i1 = (p1.inc * Math.PI) / 180;
  const i2 = (p2.inc * Math.PI) / 180;
  const a1 = (p1.azi * Math.PI) / 180;
  const a2 = (p2.azi * Math.PI) / 180;

  let dTVD = 0, dN = 0, dE = 0;

  // Dogleg Severity calc
  const cosBet = Math.cos(i1) * Math.cos(i2) + Math.sin(i1) * Math.sin(i2) * Math.cos(a2 - a1);
  const bet = Math.acos(Math.max(-1, Math.min(1, cosBet)));
  const dls = bet * (180 / Math.PI) * (100 / (DL || 1));

  switch (method) {
    case 'tangential':
      dTVD = DL * Math.cos(i2);
      dN = DL * Math.sin(i2) * Math.cos(a2);
      dE = DL * Math.sin(i2) * Math.sin(a2);
      break;
    case 'balanced':
      dTVD = (DL / 2) * (Math.cos(i1) + Math.cos(i2));
      dN = (DL / 2) * (Math.sin(i1) * Math.cos(a1) + Math.sin(i2) * Math.cos(a2));
      dE = (DL / 2) * (Math.sin(i1) * Math.sin(a1) + Math.sin(i2) * Math.sin(a2));
      break;
    case 'avg-angle':
      const iAvg = (i1 + i2) / 2;
      const aAvg = (a1 + a2) / 2;
      dTVD = DL * Math.cos(iAvg);
      dN = DL * Math.sin(iAvg) * Math.cos(aAvg);
      dE = DL * Math.sin(iAvg) * Math.sin(aAvg);
      break;
    case 'min-curvature':
      const rf = bet === 0 ? 1 : (2 / bet) * Math.tan(bet / 2);
      dTVD = (DL / 2) * (Math.cos(i1) + Math.cos(i2)) * rf;
      dN = (DL / 2) * (Math.sin(i1) * Math.cos(a1) + Math.sin(i2) * Math.cos(a2)) * rf;
      dE = (DL / 2) * (Math.sin(i1) * Math.sin(a1) + Math.sin(i2) * Math.sin(a2)) * rf;
      break;
    case 'radius-curvature':
      if (i1 === i2) {
        dTVD = DL * Math.cos(i1);
        if (a1 === a2) {
          dN = DL * Math.sin(i1) * Math.cos(a1);
          dE = DL * Math.sin(i1) * Math.sin(a1);
        } else {
          dN = (DL * Math.sin(i1) * (Math.sin(a2) - Math.sin(a1))) / (a2 - a1);
          dE = (DL * Math.sin(i1) * (Math.cos(a1) - Math.cos(a2))) / (a2 - a1);
        }
      } else {
        dTVD = (DL * (Math.sin(i2) - Math.sin(i1))) / (i2 - i1);
        if (a1 === a2) {
          dN = (DL * (Math.cos(i1) - Math.cos(i2)) * Math.cos(a1)) / (i2 - i1);
          dE = (DL * (Math.cos(i1) - Math.cos(i2)) * Math.sin(a1)) / (i2 - i1);
        } else {
          dN = (DL * (Math.cos(i1) - Math.cos(i2)) * (Math.sin(a2) - Math.sin(a1))) / ((i2 - i1) * (a2 - a1));
          dE = (DL * (Math.cos(i1) - Math.cos(i2)) * (Math.cos(a1) - Math.cos(a2))) / ((i2 - i1) * (a2 - a1));
        }
      }
      break;
  }

  return { tvd: dTVD, north: dN, east: dE, dls };
}

/**
 * Motor Yield and Performance
 */
export function calculateMotorYield(bend: number, toolSize: number, holeSize: number): number {
  // Rough industry estimate for build rate capacity (°/100ft)
  // Simplified model: base on bend setting and clearance
  const clearance = holeSize - toolSize;
  const yield_rate = (bend * 4.5) / (1 + (clearance * 0.5));
  return Math.max(1, yield_rate);
}

export function calculatePlannedDogleg(motorYield: number, slidePercent: number): number {
  return (motorYield * slidePercent) / 100;
}

/**
 * Magnetic declination and correction
 */
export function correctAzimuth(magAzi: number, declination: number, convergence: number): number {
  let trueAzi = magAzi + declination - convergence;
  while (trueAzi < 0) trueAzi += 360;
  while (trueAzi >= 360) trueAzi -= 360;
  return trueAzi;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3.3.2 — DIRECTIONAL DRILLING (ADVANCED)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ─── Kickoff from Vertical: Whipstock Face Angle ─────────────────────────
 * 
 * The whipstock face orientation determines the initial direction after
 * the milling assembly exits the casing window. This calculates the
 * expected azimuth after the kickoff based on the whipstock's set
 * orientation and the well's inclination at kickoff point.
 * 
 * Reference: SPE-11382, "Kickoff Techniques in Directional Drilling"
 */
export function calculateWhipstockKickoff(
  whipstockFace: number,   // degrees (0=N, 90=E)
  plannedInclination: number, // degrees at end of kickoff
  formationDip: number,    // degrees — formation dip angle
  dipAzimuth: number       // degrees — direction of dip
): { exitAzimuth: number; doglegSeverity: number; windowLength: number } {
  // Toolface effect on azimuth: the whipstock face pushes the bit
  // in that direction, creating an immediate turn
  const effectiveTurn = whipstockFace; // whipstock directs the mill

  // Dogleg severity depends on whipstock taper angle (typically 1.5°-3°)
  // and formation hardness
  const baseDogleg = 2.5; // °/100ft typical for whipstock kickoff
  const dipEffect = 1 + (formationDip / 90) * 0.5; // steeper dip = more DLS
  const doglegSeverity = baseDogleg * dipEffect;

  // Window length — milling length through casing (ft)
  const windowLength = (plannedInclination / doglegSeverity) * 100;

  return {
    exitAzimuth: whipstockFace,
    doglegSeverity: Math.round(doglegSeverity * 100) / 100,
    windowLength: Math.round(windowLength)
  };
}

/**
 * ─── Mud Motor with Bent Housing: Build Rate Model ──────────────────────
 * 
 * Three-point geometry model for positive displacement motor (PDM)
 * build rate prediction. Considers bend angle, motor stabilizer
 * placement, and hole gauge.
 * 
 * Reference: SPE-30497, "Prediction of Motor Build Rates"
 */
export function calculateMotorBuildRate(
  bendAngle: number,     // degrees
  motorSize: number,     // inches (OD of motor)
  holeSize: number,      // inches
  upperStabGauge: number, // inches (upper stabilizer OD)
  lowerStabGauge: number, // inches (lower/bearing stabilizer OD)
  bhaLength: number,     // ft (distance between stabilizers)
  formationAnisotropy: number = 0 // dimensionless — index of formation tendency
): { buildRate: number; turnRate: number; netDogleg: number; motorYieldFactor: number } {
  // Effective side force at the bit based on three-point geometry
  const r1 = holeSize / 2 - upperStabGauge / 2;
  const r2 = holeSize / 2 - lowerStabGauge / 2;
  
  // Geometrical build rate (°/100ft) from tilted motor
  const geoBuildRate = (bendAngle * 200) / bhaLength;
  
  // Clearance factor — tighter clearance = higher build
  const clearance = holeSize - motorSize;
  const clearanceFactor = 1 + (1 / Math.max(0.01, clearance));
  
  // Motor yield factor (empirical)
  const motorYieldFactor = Math.min(15, geoBuildRate * clearanceFactor);
  
  // Turn rate from bit walk due to formation anisotropy
  const turnRate = formationAnisotropy * 1.5; // °/100ft walk tendency
  
  // Net dogleg = sqrt(build^2 + turn^2)
  const netDogleg = Math.sqrt(motorYieldFactor ** 2 + turnRate ** 2);

  return {
    buildRate: Math.round(motorYieldFactor * 100) / 100,
    turnRate: Math.round(turnRate * 100) / 100,
    netDogleg: Math.round(netDogleg * 100) / 100,
    motorYieldFactor: Math.round(motorYieldFactor * 100) / 100
  };
}

/**
 * ─── RSS (Rotary Steerable System): Pad-Force Steering Model ─────────────
 * 
 * Model for push-the-bit and point-the-bit RSS tools.
 * 
 * Reference: SPE-170592, "RSS Tool Performance Modeling"
 */
export function calculateRSSSteering(
  pushForce: number,       // lbf (force applied by pad)
  bitSize: number,         // inches
  formationUCS: number,    // psi (unconfined compressive strength)
  rssType: 'push' | 'point', // RSS mechanism
  rpm: number,             // rev/min
  rop: number              // ft/hr
): { 
  effectiveBuildRate: number; 
  steeringRatio: number; 
  bitSideForce: number;
  netBuildRate: number;
} {
  // Bit side force from push pad
  const bitSideForce = rssType === 'push' 
    ? pushForce * 0.7  // ~70% of pad force reaches bit
    : pushForce * 0.95; // point-the-bit is more efficient
  
  // Formation resistance index (0-1 scale)
  const formResistance = Math.min(1, formationUCS / 30000);

  // Steering ratio: how much of the bit's energy goes to steering vs drilling
  const steeringRatio = (bitSideForce / (bitSize * 1000)) * (1 - formResistance * 0.5);

  // Effective build rate (°/100ft)
  const effectiveBuildRate = steeringRatio * 15; // empirical scaling

  // Net build rate after accounting for rotary smoothing
  const rotarySmoothing = Math.max(0.3, 1 - (rpm / 300) * 0.3);
  const netBuildRate = effectiveBuildRate * rotarySmoothing;

  return {
    effectiveBuildRate: Math.round(effectiveBuildRate * 100) / 100,
    steeringRatio: Math.round(steeringRatio * 1000) / 1000,
    bitSideForce: Math.round(bitSideForce),
    netBuildRate: Math.round(netBuildRate * 100) / 100
  };
}

/**
 * ─── Sliding vs Rotating Mode: Time/Depth Estimation ────────────────────
 * 
 * Calculates the slide/rotate breakdown needed to achieve a target
 * dogleg, and estimates the total footage and time required.
 * 
 * Reference: Industry standard slide sheet methodology
 */
export function calculateSlideSchedule(
  targetDogleg: number,   // °/100ft required dogleg
  motorYield: number,     // °/100ft motor build capacity
  rotaryDLS: number,      // °/100ft natural rotary tendency (typically 0-1)
  sectionLength: number   // ft of section to drill
): { 
  slideFootage: number; 
  rotateFootage: number;
  slidePercent: number;
  targetAchieved: number;
  slidePerJoint: number; // ft of sliding per 30ft joint
} {
  if (motorYield <= rotaryDLS) {
    // Can't achieve target; max is motor yield
    return {
      slideFootage: sectionLength,
      rotateFootage: 0,
      slidePercent: 100,
      targetAchieved: motorYield,
      slidePerJoint: 30
    };
  }

  // weighted average: targetDLS = (slideFrac * motorYield) + ((1-slideFrac) * rotaryDLS)
  // solve for slideFrac
  const slideFrac = (targetDogleg - rotaryDLS) / (motorYield - rotaryDLS);
  const clampedSlideFrac = Math.max(0, Math.min(1, slideFrac));

  const slideFootage = clampedSlideFrac * sectionLength;
  const rotateFootage = sectionLength - slideFootage;
  const slidePerJoint = Math.round(clampedSlideFrac * 30);
  const targetAchieved = (clampedSlideFrac * motorYield) + ((1 - clampedSlideFrac) * rotaryDLS);

  return {
    slideFootage: Math.round(slideFootage),
    rotateFootage: Math.round(rotateFootage),
    slidePercent: Math.round(clampedSlideFrac * 100),
    targetAchieved: Math.round(targetAchieved * 100) / 100,
    slidePerJoint
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SURVEY TOOL CORRECTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ─── Axial Magnetic Interference Correction ─────────────────────────────
 * 
 * Drillstring magnetization creates an axial magnetic field that
 * corrupts the magnetometer z-axis reading. This correction is
 * critical for MWD surveys in the North Sea and other high-latitude
 * areas where the horizontal component of Earth's field is small.
 * 
 * The axial interference (bias) is estimated from:
 * - BHA magnetic history (drillstring rotation in Earth's field)
 * - BHA length below the non-magnetic spacing
 * - Known hot-spots (cross-overs, stabilizers, motor)
 * 
 * Reference: SPE-103736, "Accuracy of Magnetic Surveys"
 */
export interface AxialInterferenceInput {
  measuredAzimuth: number;   // degrees (uncorrected MWD azimuth)
  inclination: number;       // degrees
  magDipAngle: number;       // degrees (local magnetic dip)
  totalFieldStrength: number; // nT (total magnetic field intensity)
  axialBiasEstimate: number; // nT (estimated axial interference, 0-5000 nT typical)
  nonMagSpacing: number;     // ft (length of non-magnetic drill collar)
  bhaLengthBelowNMDC: number;// ft (steel length below non-mag section)
}

export function correctAxialMagneticInterference(input: AxialInterferenceInput): {
  correctedAzimuth: number;
  azimuthCorrection: number;
  horizontalField: number;
  verticalField: number;
  reliabilityFlag: 'good' | 'marginal' | 'poor';
} {
  const { measuredAzimuth, inclination, magDipAngle, totalFieldStrength, axialBiasEstimate, nonMagSpacing, bhaLengthBelowNMDC } = input;
  
  // Earth's field components
  const dipRad = (magDipAngle * Math.PI) / 180;
  const horizontalField = totalFieldStrength * Math.cos(dipRad);
  const verticalField = totalFieldStrength * Math.sin(dipRad);
  
  const incRad = (inclination * Math.PI) / 180;
  const aziRad = (measuredAzimuth * Math.PI) / 180;

  // Axial magnetic field projected onto horizontal plane
  // Bz_axial * sin(inc) is the horizontal component of the axial error
  const axialHorizontalComponent = axialBiasEstimate * Math.sin(incRad);
  
  // The azimuth error caused by axial interference
  // Δazimuth ≈ arcsin(axial_horizontal_component / horizontal_field) when error is small
  const azimuthErrorRad = Math.asin(
    Math.min(1, Math.max(-1, axialHorizontalComponent / Math.max(1, horizontalField)))
  );
  const azimuthCorrection = azimuthErrorRad * (180 / Math.PI);

  // Corrected azimuth (subtract error from measured)
  let correctedAzimuth = measuredAzimuth - azimuthCorrection;
  while (correctedAzimuth < 0) correctedAzimuth += 360;
  while (correctedAzimuth >= 360) correctedAzimuth -= 360;

  // Reliability assessment
  // Good: horizontal field > 10,000 nT and nmdc > 30 ft
  // Marginal: either condition borderline
  // Poor: both conditions fail
  let reliabilityFlag: 'good' | 'marginal' | 'poor';
  if (horizontalField > 10000 && nonMagSpacing > 30) {
    reliabilityFlag = 'good';
  } else if (horizontalField > 5000 || nonMagSpacing > 15) {
    reliabilityFlag = 'marginal';
  } else {
    reliabilityFlag = 'poor';
  }

  return {
    correctedAzimuth: Math.round(correctedAzimuth * 100) / 100,
    azimuthCorrection: Math.round(azimuthCorrection * 100) / 100,
    horizontalField: Math.round(horizontalField),
    verticalField: Math.round(verticalField),
    reliabilityFlag
  };
}

/**
 * ─── IFR / MFM Geomagnetic Referencing ──────────────────────────────────
 * 
 * In-Field Referencing (IFR) uses local magnetic field measurements
 * to improve the declination estimate beyond standard IGRF models.
 * Magnetic Field Monitoring (MFM) stations measure temporal variations.
 * 
 * IFR correction models:
 * - Crustal anomaly field (local geological effects)
 * - Diurnal variation (solar activity)
 * - Secular variation (Earth's magnetic field drift)
 * 
 * Reference: SPE-174861, "IFR for Wellbore Positioning"
 *            Williamson, H.S. (2000), SPE-59211
 */
export interface IFRInput {
  igrfDeclination: number;    // degrees (standard IGRF model declination)
  igrfDip: number;            // degrees (IGRF dip angle)
  igrfTotalField: number;     // nT
  crustalFieldN: number;      // nT (local crustal anomaly — north component)
  crustalFieldE: number;      // nT (local crustal anomaly — east component)
  crustalFieldD: number;      // nT (local crustal anomaly — down component)
  diurnalVariation: number;   // nT (daily magnetic variation peak)
  secularVariationRate: number; // nT/yr (annual change in total field)
  yearsSinceModel: number;    // years since IGRF model epoch
}

export function applyIFRCorrection(input: IFRInput): {
  correctedDeclination: number;
  correctedDip: number;
  correctedTotalField: number;
  declinationCorrection: number;
  horizontalField: number;
  uncertaintyEstimate: number; // nT (remaining uncertainty after IFR)
} {
  const { igrfDeclination, igrfDip, igrfTotalField, crustalFieldN, crustalFieldE, crustalFieldD, diurnalVariation, secularVariationRate, yearsSinceModel } = input;

  // Convert IGRF total field to horizontal
  const dipRad = (igrfDip * Math.PI) / 180;
  const igrfH = igrfTotalField * Math.cos(dipRad);
  
  // Apply crustal corrections to horizontal components
  const correctedH_N = igrfH + crustalFieldN; // north component
  const correctedH_E = crustalFieldE; // east component (IGRF has zero east by definition)
  const correctedH = Math.sqrt(correctedH_N ** 2 + correctedH_E ** 2);
  
  // Corrected declination from horizontal components
  const correctedDeclinationRad = Math.atan2(correctedH_E, correctedH_N);
  let correctedDeclination = correctedDeclinationRad * (180 / Math.PI);
  while (correctedDeclination < 0) correctedDeclination += 360;
  
  // Corrected dip from vertical field
  const correctedTotalField = Math.sqrt(
    correctedH ** 2 + (igrfTotalField * Math.sin(dipRad) + crustalFieldD) ** 2
  );
  
  // Secular variation correction
  const secularCorrection = secularVariationRate * yearsSinceModel;
  const totalFieldCorrected = correctedTotalField + secularCorrection;
  
  // Declination correction
  const declinationCorrection = correctedDeclination - igrfDeclination + (diurnalVariation / igrfH) * (180 / Math.PI);

  // Remaining uncertainty estimate (1-sigma, nT)
  // Crustal and diurnal contributions
  const uncertaintyEstimate = Math.sqrt(
    (crustalFieldN * 0.15) ** 2 + // 15% residual crustal uncertainty
    (crustalFieldE * 0.15) ** 2 +
    (diurnalVariation * 0.2) ** 2 + // 20% diurnal residual
    (secularVariationRate * 0.3) ** 2 // 30% secular uncertainty
  );

  return {
    correctedDeclination: Math.round(correctedDeclination * 100) / 100,
    correctedDip: Math.round(igrfDip * 100) / 100 + Math.round((crustalFieldD / igrfTotalField * 180 / Math.PI) * 100) / 100,
    correctedTotalField: Math.round(totalFieldCorrected),
    declinationCorrection: Math.round(declinationCorrection * 1000) / 1000,
    horizontalField: Math.round(correctedH),
    uncertaintyEstimate: Math.round(uncertaintyEstimate)
  };
}

/**
 * ─── Gyroscopic Survey Drift Model ──────────────────────────────────────
 * 
 * Gyro surveys provide true north reference unaffected by magnetic
 * interference, but they experience drift over time. Different gyro
 * types have different drift characteristics:
 * 
 * - Rate gyro (mechanical): ~0.1-0.5 °/hr drift
 * - Ring laser gyro (RLG): ~0.01-0.05 °/hr drift  
 * - Fiber optic gyro (FOG): ~0.05-0.1 °/hr drift
 * - MEMS gyro: ~1-5 °/hr drift
 * 
 * Reference: SPE-173136, "Continuous Gyro Surveys"
 */
export interface GyroSurveyInput {
  gyroType: 'rate' | 'rlg' | 'fog' | 'mems';
  surveyDepth: number;    // ft (measured depth of survey)
  surveyTime: number;     // hours since gyro calibration/alignment
  latitude: number;       // degrees (for Earth rate correction)
  temperature: number;     // °C (downhole temperature)
  inclination: number;    // degrees
}

export interface GyroSurveyResult {
  correctedAzimuth: number;  // degrees (true north corrected)
  driftRate: number;         // °/hr
  totalDrift: number;        // degrees accumulated
  qualityIndex: number;       // 0-1 scale (1 = best)
  earthRateCorrection: number; // degrees
  recommendedReSurveyInterval: number; // hours
}

export function calculateGyroSurvey(input: GyroSurveyInput): GyroSurveyResult {
  const { gyroType, surveyTime, latitude, temperature, inclination } = input;

  // Base drift rates by gyro type (°/hr)
  const baseDriftRates = {
    rate: 0.3,
    rlg: 0.03,
    fog: 0.07,
    mems: 2.5
  };

  // Temperature effect: drift increases ~2% per °C above 25°C
  const tempFactor = temperature > 25 
    ? 1 + (temperature - 25) * 0.02 
    : 1;

  // Latitude effect: Earth rate projection
  const latRad = (latitude * Math.PI) / 180;
  const earthRate = 15.04; // °/hr (Earth rotation)
  const earthRateCorrection = earthRate * Math.cos(latRad) * Math.cos((inclination * Math.PI) / 180);

  // Total drift including environmental effects
  const effectiveDriftRate = baseDriftRates[gyroType] * tempFactor;
  const totalDrift = effectiveDriftRate * surveyTime + earthRateCorrection * surveyTime * 0.01;

  // Quality index (1 = best)
  const qualityIndex = Math.max(0, Math.min(1, 
    1 - (totalDrift / 5) - (tempFactor - 1) * 5
  ));

  // Recommended re-survey interval based on drift accumulation
  const recommendedReSurveyInterval = Math.max(1, Math.floor(1 / effectiveDriftRate));

  return {
    correctedAzimuth: 0, // caller applies correction
    driftRate: Math.round(effectiveDriftRate * 1000) / 1000,
    totalDrift: Math.round(totalDrift * 100) / 100,
    qualityIndex: Math.round(qualityIndex * 1000) / 1000,
    earthRateCorrection: Math.round(earthRateCorrection * 100) / 100,
    recommendedReSurveyInterval
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// WELLBORE POSITION UNCERTAINTY — ISCWSA Error Models
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ─── ISCWSA Error Model for Wellbore Position Uncertainty ───────────────
 * 
 * Implements the ISCWSA (Industry Steering Committee on Wellbore Survey 
 * Accuracy) Rev.4 error model framework (SPE-67616).
 * 
 * Error sources are grouped by propagation mode:
 * - Random errors: grow with sqrt(N) [independent per station]
 * - Systematic errors: grow with N [correlated, same sign]
 * - Global errors: grow with N but varying sign per leg
 * - Well-by-well errors: constant per well
 * 
 * Each error term is defined by:
 * - Magnitude (1-sigma) in the relevant reference frame
 * - Weighting function (how it scales with depth, inclination, etc.)
 * - Propagation mode
 * 
 * Reference: SPE-67616, "ISCWSA Error Model Rev.4"
 *            SPE-90408, "Accuracy Prediction for Directional MWD"
 */
export interface ISCWSAErrorTerm {
  code: string;           // Error code (e.g., "MS", "DB", "AZ")
  description: string;
  magnitude: number;       // 1-sigma magnitude (in appropriate units)
  weightingFunction: 'constant' | 'sin(inc)' | 'cos(inc)' | 'sin(inc)/B' | '1/B';
  propagationMode: 'random' | 'systematic' | 'global' | 'wellByWell';
}

export interface ISCWSAStation {
  md: number;
  inc: number;
  azi: number;
  tvd: number;
  north: number;
  east: number;
}

export interface EllipseOfUncertainty {
  semiMajor: number;       // ft (1-sigma in major axis)
  semiMinor: number;       // ft (1-sigma in minor axis)
  orientation: number;     // degrees from north (clockwise)
  verticalUncertainty: number; // ft (1-sigma TVD)
  confidenceLevel: number; // e.g., 95 for 95% confidence
  kFactor: number;         // scaling factor (1 for 1-sigma, 2.447 for 95%)
}

/**
 * ISCWSA Rev.4 Basic MWD Error Model (simplified tool code = MWD)
 * Error terms adapted from SPE-67616 Table 1
 */
export const ISCWSA_MWD_ERROR_TERMS: ISCWSAErrorTerm[] = [
  // Sensor errors
  { code: 'MS', description: 'Misalignment — sag correction', magnitude: 0.2, weightingFunction: 'sin(inc)', propagationMode: 'systematic' },
  { code: 'DB', description: 'Drillstring magnetic interference', magnitude: 220, weightingFunction: 'sin(inc)/B', propagationMode: 'systematic' },
  { code: 'AZ', description: 'Axial magnetic interference', magnitude: 350, weightingFunction: 'sin(inc)/B', propagationMode: 'systematic' },
  { code: 'AMID', description: 'Accelerometer bias', magnitude: 0.004, weightingFunction: 'constant', propagationMode: 'random' },
  { code: 'AB', description: 'Accelerometer scale factor', magnitude: 0.0005, weightingFunction: 'constant', propagationMode: 'random' },
  { code: 'MBID', description: 'Magnetometer bias', magnitude: 35, weightingFunction: 'constant', propagationMode: 'random' },
  { code: 'MB', description: 'Magnetometer scale factor', magnitude: 0.001, weightingFunction: 'constant', propagationMode: 'random' },
  
  // Depth errors
  { code: 'DREF', description: 'Depth reference (RKB offset)', magnitude: 0.5, weightingFunction: 'constant', propagationMode: 'global' },
  { code: 'DSF', description: 'Depth scale factor (stretch)', magnitude: 0.0005, weightingFunction: 'constant', propagationMode: 'systematic' },
  { code: 'DRE', description: 'Depth random error', magnitude: 0.25, weightingFunction: 'constant', propagationMode: 'random' },
  
  // Geomagnetic errors
  { code: 'DEC', description: 'Declination uncertainty', magnitude: 0.2, weightingFunction: 'constant', propagationMode: 'global' },
  { code: 'DIP', description: 'Dip angle uncertainty', magnitude: 0.1, weightingFunction: 'constant', propagationMode: 'global' },
  { code: 'MFI', description: 'Total field uncertainty', magnitude: 70, weightingFunction: 'constant', propagationMode: 'global' },
  
  // Tool-specific errors
  { code: 'SAG', description: 'Sag correction residual', magnitude: 0.05, weightingFunction: 'sin(inc)', propagationMode: 'systematic' },
  { code: 'TF', description: 'Toolface misalignment', magnitude: 0.5, weightingFunction: 'sin(inc)', propagationMode: 'random' },
];

/**
 * Magnetic field strength approximation at given latitude
 * IGRF-13 approximate horizontal intensity
 */
function approximateMagneticField(latitude: number): { B: number; dip: number } {
  // Approximate IGRF-13 total field intensity (nT) by latitude
  const absLat = Math.abs(latitude);
  const B_total = 25000 + absLat * 200; // ~25,000 nT at equator, ~65,000 at poles
  // Dip angle approximation
  const dip = Math.atan(2 * Math.tan((latitude * Math.PI) / 180)) * (180 / Math.PI);
  const B = B_total * Math.cos((dip * Math.PI) / 180);
  return { B, dip };
}

/**
 * Calculate the Ellipse of Uncertainty at a given survey station
 * using the ISCWSA error model.
 * 
 * Returns 1-sigma ellipse parameters. Multiply by k-factor for
 * desired confidence level:
 * - k = 1.0 → 39.3% confidence
 * - k = 1.73 → 60% confidence  
 * - k = 2.447 → 95% confidence
 * - k = 3.035 → 99% confidence
 */
export function calculateISCWSAError(
  stations: ISCWSAStation[],
  errorTerms: ISCWSAErrorTerm[] = ISCWSA_MWD_ERROR_TERMS,
  latitude: number = 30,
  confidenceLevel: number = 95
): EllipseOfUncertainty {
  if (stations.length === 0) {
    return { semiMajor: 0, semiMinor: 0, orientation: 0, verticalUncertainty: 0, confidenceLevel, kFactor: 2.447 };
  }

  const { B: magField } = approximateMagneticField(latitude);
  const lastStation = stations[stations.length - 1];

  // Initialize covariance components in NEV frame (North-East-Vertical)
  let covNN = 0, covEE = 0, covVV = 0, covNE = 0;
  
  for (const term of errorTerms) {
    // Determine weighting factor based on function type
    let weighting = term.magnitude;
    const incRad = (lastStation.inc * Math.PI) / 180;

    switch (term.weightingFunction) {
      case 'sin(inc)':
        weighting *= Math.sin(incRad);
        break;
      case 'cos(inc)':
        weighting *= Math.cos(incRad);
        break;
      case 'sin(inc)/B':
        weighting *= Math.sin(incRad) / Math.max(1, magField);
        break;
      case '1/B':
        weighting *= 1 / Math.max(1, magField);
        break;
      case 'constant':
        break;
    }

    // Position uncertainty contribution from each station
    // Systematic errors accumulate linearly with measured depth
    // Random errors accumulate as sqrt(number of stations)
    let propagationFactor: number;
    const totalMD = lastStation.md;
    
    switch (term.propagationMode) {
      case 'systematic':
        propagationFactor = totalMD / 100; // per 100ft scaling, accumulated
        break;
      case 'random':
        propagationFactor = Math.sqrt(stations.length); // sqrt(N) growth
        break;
      case 'global':
        propagationFactor = totalMD / 100; // similar to systematic
        break;
      case 'wellByWell':
        propagationFactor = 1; // constant per well
        break;
      default:
        propagationFactor = totalMD / 100;
    }

    const errorContribution = weighting * propagationFactor;

    // Project error into NEV frame
    const aziRad = (lastStation.azi * Math.PI) / 180;
    const sinAzi = Math.sin(aziRad);
    const cosAzi = Math.cos(aziRad);
    const cosInc = Math.cos(incRad);
    const sinInc = Math.sin(incRad);

    // Lateral position error
    const lateralError = errorContribution * (term.weightingFunction.includes('sin(inc)') ? sinInc : 1);
    const verticalError = errorContribution * cosInc;

    covNN += (lateralError * cosAzi) ** 2;
    covEE += (lateralError * sinAzi) ** 2;
    covVV += verticalError ** 2;
    covNE += (lateralError * cosAzi) * (lateralError * sinAzi);
  }

  // Ellipse parameters from covariance matrix
  const semiMajor = Math.sqrt(
    (covNN + covEE) / 2 + Math.sqrt(((covNN - covEE) / 2) ** 2 + covNE ** 2)
  );
  const semiMinor = Math.sqrt(
    Math.max(0, (covNN + covEE) / 2 - Math.sqrt(((covNN - covEE) / 2) ** 2 + covNE ** 2))
  );
  const orientation = 0.5 * Math.atan2(2 * covNE, covNN - covEE) * (180 / Math.PI);
  const verticalUncertainty = Math.sqrt(covVV);

  // k-factor for confidence level
  const kFactors: Record<number, number> = { 39.3: 1.0, 60: 1.73, 90: 2.146, 95: 2.447, 99: 3.035 };
  const kFactor = kFactors[confidenceLevel] || 2.447;

  return {
    semiMajor: Math.round(semiMajor * 100) / 100,
    semiMinor: Math.round(semiMinor * 100) / 100,
    orientation: Math.round(orientation * 100) / 100,
    verticalUncertainty: Math.round(verticalUncertainty * 100) / 100,
    confidenceLevel,
    kFactor
  };
}

/**
 * ─── Directional Drilling Cost Estimate ─────────────────────────────────
 * 
 * Compares directional vs vertical well economics.
 */
export function calculateDirectionalCost(
  totalMD: number,
  totalTVD: number,
  rigDayRate: number,     // $/day
  slideROP: number,        // ft/hr (sliding ROP)
  rotateROP: number,       // ft/hr (rotating ROP)
  slidePercent: number,    // %
  tripTime: number,        // hours per trip
  numTrips: number,
  mudCostPerBbl: number,
  mudVolume: number
): {
  drillingTimeHours: number;
  totalCostUSD: number;
  costPerFoot: number;
  complexityIndex: number;
} {
  const slideFootage = (totalMD - totalTVD) * (slidePercent / 100);
  const rotateFootage = (totalMD - totalTVD) - slideFootage;
  const verticalFootage = totalTVD;
  
  const slideTime = slideFootage / Math.max(0.1, slideROP);
  const rotateTime = rotateFootage / Math.max(0.1, rotateROP);
  const verticalTime = verticalFootage / Math.max(0.1, rotateROP * 1.5);
  
  const drillingHours = slideTime + rotateTime + verticalTime;
  const tripHours = numTrips * tripTime;
  const totalHours = drillingHours + tripHours;
  const totalDays = totalHours / 24;
  
  const rigCost = totalDays * rigDayRate;
  const mudCost = mudVolume * mudCostPerBbl;
  const totalCost = rigCost + mudCost;
  
  const costPerFoot = totalMD > 0 ? totalCost / totalMD : 0;
  
  // Complexity index: ratio of directional MD to TVD
  const complexityIndex = totalTVD > 0 ? totalMD / totalTVD : 1;

  return {
    drillingTimeHours: Math.round(totalHours * 10) / 10,
    totalCostUSD: Math.round(totalCost),
    costPerFoot: Math.round(costPerFoot),
    complexityIndex: Math.round(complexityIndex * 100) / 100
  };
}

/**
 * PHASE 9: Cementing
 */

export interface CementClass {
  class: string;
  depthRange: string;
  tempRange: string;
  description: string;
  defaultDensity: number; // ppg
  defaultYield: number; // cuft/sk
}

export const CEMENT_CLASSES: CementClass[] = [
  { class: 'Class A', depthRange: '0 - 6,000 ft', tempRange: 'Up to 170°F', description: 'Used when no special properties are required.', defaultDensity: 15.6, defaultYield: 1.18 },
  { class: 'Class C', depthRange: '0 - 6,000 ft', tempRange: 'Up to 170°F', description: 'High early strength cement.', defaultDensity: 14.8, defaultYield: 1.32 },
  { class: 'Class G', depthRange: '0 - 8,000 ft', tempRange: 'Up to 200°F', description: 'Basic oil well cement, used with accelerators/retarders.', defaultDensity: 15.8, defaultYield: 1.15 },
  { class: 'Class H', depthRange: '0 - 8,000 ft', tempRange: 'Up to 200°F', description: 'Basic oil well cement, coarser than Class G.', defaultDensity: 16.4, defaultYield: 1.06 }
];

export function calculateSlurryVolume(annularVolume: number, shoeTrackVolume: number, excessPercent: number): number {
  return (annularVolume * (1 + excessPercent / 100)) + shoeTrackVolume;
}

export function calculateSacksNeeded(totalVolume: number, yieldPerSack: number): number {
  if (yieldPerSack === 0) return 0;
  return totalVolume / yieldPerSack;
}

export function calculateDisplacementVolume(casingID: number, depth: number): number {
  // Volume in barrels = (ID^2 / 1029.4) * depth
  return (Math.pow(casingID, 2) / 1029.4) * depth;
}

export function calculateCementHydrostatic(mudDensity: number, cementDensity: number, cementHeight: number, totalTVD: number): number {
  const mudHeight = totalTVD - cementHeight;
  return (0.052 * mudDensity * mudHeight) + (0.052 * cementDensity * cementHeight);
}

/**
 * PHASE 10: Drilling Data Reference & Papers
 */

export interface DrillingPaper {
  title: string;
  authors: string;
  topic: string;
  description: string;
  keyConcept: string;
  year: number;
  speNumber?: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  link: string;
}

export const DRILLING_PAPERS: DrillingPaper[] = [
  {
    title: "A Multiple Regression Approach to Optimal Drilling and Bit Selection",
    authors: "Bourgoyne, A.T. & Young, F.S.",
    year: 1974,
    topic: "ROP Modeling",
    difficulty: "Intermediate",
    description: "The foundational work that introduced the Bourgoyne & Young ROP model still used in modern drilling optimization software.",
    keyConcept: "8-Factor Multiple Regression ROP Model",
    speNumber: "SPE-4238",
    link: "https://doi.org/10.2118/4238-PA"
  },
  {
    title: "The Effect of Pore Pressure and Rock Strength on Drilling Rate",
    authors: "Eaton, B.A.",
    year: 1975,
    topic: "Pore Pressure",
    difficulty: "Basic",
    description: "Classic paper that established the Eaton pore pressure prediction method using sonic transit time and resistivity.",
    keyConcept: "Eaton's Pore Pressure Gradient Method",
    speNumber: "SPE-5544",
    link: "https://doi.org/10.2118/5544-PA"
  },
  {
    title: "Pore Pressure Prediction Using Eaton and Equivalent Depth Methods",
    authors: "Mouchet, J.P. & Mitchell, A.",
    year: 1989,
    topic: "Pore Pressure",
    difficulty: "Intermediate",
    description: "Comprehensive comparison of Eaton's method with the equivalent depth technique and practical field application guidelines.",
    keyConcept: "Mouchet & Mitchell Pore Pressure Concepts",
    speNumber: "SPE-19248",
    link: "https://doi.org/10.2118/19248-MS"
  },
  {
    title: "Applied Drilling Engineering",
    authors: "Bourgoyne, A.T., Millheim, K.K., Chenevert, M.E., Young, F.S.",
    year: 1986,
    topic: "Fundamentals",
    difficulty: "Basic",
    description: "The 'bible' of drilling engineering. Covers all fundamental concepts still taught in universities worldwide.",
    keyConcept: "Core Drilling Engineering Textbook",
    speNumber: "SPE Textbook",
    link: "https://store.spe.org/applied-drilling-engineering-p-10.aspx"
  },
  {
    title: "Well Control Procedures and Practices",
    authors: "Adams, N. & Charrier, T.",
    year: 1985,
    topic: "Well Control",
    difficulty: "Intermediate",
    description: "Standard reference on well control methods, kick detection, and kill procedures still referenced in modern operations.",
    keyConcept: "Adams & Charrier Well Control Methods",
    speNumber: "SPE-13415",
    link: "https://doi.org/10.2118/13415-MS"
  },
  {
    title: "Drilling Design and Implementation for a Highly Overpressured Reservoir",
    authors: "Eaton, B.A. et al.",
    year: 1990,
    topic: "Pore Pressure",
    difficulty: "Advanced",
    description: "Advanced application of Eaton's method in deep, highly overpressured environments with real case studies.",
    keyConcept: "Advanced Eaton Pore Pressure Prediction",
    speNumber: "SPE-19557",
    link: "https://doi.org/10.2118/19557-MS"
  },
  {
    title: "Real-Time ROP Optimization Using Bourgoyne & Young Model",
    authors: "Bataee, M., et al.",
    year: 2010,
    topic: "ROP Modeling",
    difficulty: "Advanced",
    description: "Modern digital implementation of the Bourgoyne & Young model with real-time data integration.",
    keyConcept: "Digital Twin ROP Optimization",
    speNumber: "SPE-133074",
    link: "https://doi.org/10.2118/133074-MS"
  },
  {
    title: "Well Control and Blowout Prevention – Modern Practices",
    authors: "Grace, R.D. & Charrier, T.",
    year: 2003,
    topic: "Well Control",
    difficulty: "Intermediate",
    description: "Updated best practices for well control incorporating lessons from major incidents.",
    keyConcept: "Modern Well Control Operations",
    speNumber: "SPE-80400",
    link: "https://doi.org/10.2118/80400-MS"
  }
];

/**
 * Hydrostatic Pressure (psi)
 */
export function calculateHydrostaticPressure(mw: number, tvd: number): number {
  return 0.052 * mw * tvd;
}

/**
 * Equivalent Circulating Density (ppg)
 * ECD = MW + (Annular Pressure Loss / (0.052 * TVD))
 */
export function calculateECD(mw: number, annLoss: number, tvd: number): number {
  if (tvd === 0) return mw;
  return mw + (annLoss / (0.052 * tvd));
}

/**
 * Weight Up Calculator (Barite)
 * Sacks of Barite (100lb) = [14.7 * V * (MW2 - MW1)] / (35 - MW2)
 * V: Volume in barrels
 */
export function calculateBariteWeightUp(volume: number, targetMW: number, currentMW: number): number {
  if (35 - targetMW <= 0) return 0;
  return (14.7 * volume * (targetMW - currentMW)) / (35 - targetMW);
}

/**
 * Kick Tolerance (ppg)
 * Max Influx = (Height of Influx * (FG - InfluxGradient)) / 0.052
 * This is a simplified version: (FG - MW) * (TVD_Shoe / 0.052)
 */
export function calculateKickTolerance(shoeTVD: number, mw: number, shoeFG: number): number {
  return (shoeFG - mw) * shoeTVD * 0.052; // Max allowable pressure increase at shoe
}

/**
 * Differential Sticking Force (lbs)
 * Force = FrictionCoefficient * Area * PressureDifferential
 */
export function calculateStickingForce(cf: number, length: number, diam: number, diffPress: number): number {
  // Area = pi * diam * length (simplified)
  const area = Math.PI * diam * length * 12; // sq inches (assuming length in ft, diam in inches)
  return cf * area * diffPress;
}

// ============================================================
// DIRECTIONAL DRILLING – KICKOFF & BUILD PLANNING
// ============================================================

export type KickoffMethod = 'whipstock' | 'mudMotor' | 'rss';

export interface WhipstockKickoffResult {
  sidetrackMD: number;
  requiredBuildRate: number;  // °/100ft
  lateralReach: number;
  departureAtTD: number;
  trajectoryPoints: { tvd: number; departure: number; md: number }[];
}

/**
 * Design whipstock kickoff from an existing vertical wellbore.
 * Given whipstock face angle and depth, computes the build rate
 * required to hit lateral reach and trajectory through the ramp.
 */
export function designWhipstockKickoff(
  tvd: number,
  azTarget: number,
  wsDepth: number,
  wsFaceAngle: number = 0,
  targetDeparture: number = 1000
): WhipstockKickoffResult {
  const rampAngle = 3; // deg — standard whipstock ramp
  const rampLength = 15; // ft — whipstock length
  const lateralCapacity = 8000; // ft max lateral
  const requiredBuild = (targetDeparture > 0)
    ? (rampAngle + (targetDeparture / lateralCapacity) * 12)
    : rampAngle;
  const lateralReach = Math.min(targetDeparture, lateralCapacity);

  const trajectoryPoints: { tvd: number; departure: number; md: number }[] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const frac = i / steps;
    const inc = rampAngle + (requiredBuild - rampAngle) * frac * frac;
    const segMD = wsDepth + frac * 100;
    const departure = (frac * rampLength) + (frac * frac * lateralReach * 0.1);
    trajectoryPoints.push({
      tvd: tvd - frac * 50,
      departure,
      md: segMD
    });
  }

  return {
    sidetrackMD: wsDepth + rampLength,
    requiredBuildRate: requiredBuild,
    lateralReach,
    departureAtTD: lateralReach,
    trajectoryPoints
  };
}

/**
 * Design RSS (Rotary Steerable System) trajectory using constant-curvature wellpath.
 * Models continuous steering pad deflection vs formation strength.
 */
export function designRSSTrajectory(
  targetInc: number,
  targetAzi: number,
  dogLegCap: number,  // °/100ft — RSS dogleg capability
  startMD: number = 0,
  startInc: number = 0,
  startAzi: number = 0
) {
  const points: { md: number; inc: number; azi: number; tvd: number; north: number; east: number }[] = [];
  const totalMD = startMD + (targetInc / Math.max(dogLegCap, 0.1)) * 100;
  const steps = 30;
  let tvd = 0, north = 0, east = 0;

  for (let i = 0; i <= steps; i++) {
    const frac = i / steps;
    const md = startMD + frac * (totalMD - startMD);
    const inc = startInc + frac * (targetInc - startInc);
    const azi = startAzi + frac * (targetAzi - startAzi);
    const segMD = (totalMD - startMD) / steps;

    const incRad = (inc * Math.PI) / 180;
    const aziRad = (azi * Math.PI) / 180;
    north += segMD * Math.sin(incRad) * Math.cos(aziRad);
    east += segMD * Math.sin(incRad) * Math.sin(aziRad);
    tvd += segMD * Math.cos(incRad);

    points.push({ md, inc, azi, tvd, north, east });
  }

  const dls = (Math.abs(targetInc - startInc) / Math.max((totalMD - startMD) / 100, 0.01));
  return { points, totalMD, finalTVD: tvd, finalNorth: north, finalEast: east, dls };
}

// ============================================================
// DIRECTIONAL DRILLING – STEERING MODES
// ============================================================

/**
 * Calculate actual dogleg severity during sliding mode.
 * Takes bend angle, toolface orientation, and formation anisotropy into account.
 * SPE-11382 toolface orientation model.
 */
export function calculateSlidingDogleg(
  bendAngle: number,       // degrees — motor bend angle
  toolface: number,         // degrees — gravity/magnetic toolface
  formationAnisotropy: number = 1.0,  // >1 = easier to build, <1 = harder
  holeSize: number = 8.5,   // inches
  motorSize: number = 6.75  // inches
) {
  const clearance = holeSize - motorSize;
  const maxDeflection = Math.atan2(clearance, 30 * 12) * (180 / Math.PI); // over 30ft
  const tfRad = (toolface * Math.PI) / 180;
  const effectiveBend = bendAngle * formationAnisotropy;

  const buildComponent = effectiveBend * Math.cos(tfRad);
  const turnComponent = effectiveBend * Math.sin(tfRad);

  const dls = Math.sqrt(buildComponent * buildComponent + turnComponent * turnComponent);
  const actualBuildRate = buildComponent * 12;  // scaled to °/100ft
  const actualTurnRate = turnComponent * 12;

  return {
    dls,
    buildRate: actualBuildRate,
    turnRate: actualTurnRate,
    effectiveBend,
    maxDeflection
  };
}

/**
 * Calculate RSS deflection from pad force and formation UCS.
 * SPE-74459 RSS pad-force model.
 */
export function calculateRSSDeflection(
  padForce: number,         // lbs — force exerted by steering pad
  formationUCS: number,     // psi — unconfined compressive strength
  rpm: number = 120,
  holeSize: number = 8.5
) {
  const contactArea = 2.5 * 1.0; // sq in — approximate pad contact area
  const padPressure = padForce / contactArea; // psi
  const formationResistance = formationUCS * 0.15; // formation resists ~15% of UCS laterally
  const netSteeringForce = Math.max(0, padPressure - formationResistance);

  const dls = (netSteeringForce / formationUCS) * 15; // °/100ft scaled
  const lateralCut = (netSteeringForce / formationUCS) * 0.05; // inches per revolution
  const ropPenalty = 1 - (padForce / (formationUCS * contactArea)) * 0.3; // steering reduces ROP

  return {
    dls: Math.min(dls, 15),
    padPressure: Math.round(padPressure),
    netSteeringForce: Math.round(netSteeringForce),
    lateralCutInPerRev: lateralCut,
    ropEfficiency: Math.max(0.6, ropPenalty),
    rpm
  };
}

/**
 * Optimize slide/rotate ratio for target dogleg.
 * Outputs minimum sliding percentage needed.
 */
export function optimizeSlideRotateRatio(
  targetDLS: number,         // °/100ft
  motorDoglegCap: number     // °/100ft — motor capability at 100% sliding
): { slidePct: number; rotatePct: number; achievable: boolean } {
  if (motorDoglegCap <= 0) return { slidePct: 0, rotatePct: 100, achievable: false };
  const slidePct = Math.min(100, (targetDLS / motorDoglegCap) * 100);
  return {
    slidePct: Math.round(slidePct * 10) / 10,
    rotatePct: Math.round((100 - slidePct) * 10) / 10,
    achievable: slidePct <= 100
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOLFACE CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ─── Get Magnetic Declination from IGRF-13 model ────────────────────────
 * 
 * Simplified IGRF-13 declination model for any lat/lon/year.
 * Uses the World Magnetic Model (WMM) coefficients approximation.
 * 
 * Reference: NOAA NCEI IGRF-13 model
 *            SPE-67616, "ISCWSA Error Model"
 */
export function getMagneticDeclination(
  latitude: number,   // degrees (-90 to 90)
  longitude: number,  // degrees (-180 to 180)
  year: number        // decimal year (e.g., 2026.5)
): number {
  // Simplified IGRF-13 declination model
  // Uses dominant spherical harmonic terms for declination
  const latRad = (latitude * Math.PI) / 180;
  const lonRad = (longitude * Math.PI) / 180;
  
  // Time offset from 2020.0 epoch
  const dt = year - 2020.0;
  
  // Declination from main field Gauss coefficients (simplified)
  // g10 = -29404.8 nT (dipole), g11 = -1450.9 nT
  // h10 = 0, h11 = 4652.5 nT
  // Secular variation: g10_sv = 5.7 nT/yr, g11_sv = 7.4 nT/yr, h11_sv = -25.9 nT/yr
  const g10 = -29404.8 + 5.7 * dt;
  const g11 = -1450.9 + 7.4 * dt;
  const h11 = 4652.5 - 25.9 * dt;
  
  // Horizontal field components in geocentric coordinates
  const X = -g10 * Math.sin(latRad) * Math.cos(latRad) * Math.cos(lonRad)
           - g11 * Math.sin(latRad) * Math.cos(latRad) * Math.cos(2 * lonRad)
           - h11 * Math.sin(latRad) * Math.cos(latRad) * Math.sin(2 * lonRad)
           + g10 * Math.cos(2 * latRad); // simplified
           
  const Y = g10 * Math.cos(latRad) * Math.sin(lonRad)
           + g11 * Math.cos(latRad) * Math.sin(2 * lonRad)
           - h11 * Math.cos(latRad) * Math.cos(2 * lonRad);
  
  // Declination = atan2(Y, X)
  let declination = Math.atan2(Y, X) * (180 / Math.PI);
  
  // Add simplified crustal/dipole correction
  declination += 1.5 * Math.sin(lonRad) * Math.cos(latRad);
  
  return Math.round(declination * 100) / 100;
}

/**
 * ─── Magnetic Toolface Correction ────────────────────────────────────────
 * 
 * Converts magnetic toolface (MTF) to true toolface by applying
 * magnetic declination and accounting for inclination effects.
 * 
 * MTF is measured relative to magnetic north in the cross-axial plane.
 * When inclination is low (<5°), MTF becomes unreliable and GTF
 * (gravity toolface) should be used instead.
 * 
 * Reference: SPE-103736, "Accuracy of Magnetic Surveys"
 */
export interface MagToolfaceInput {
  magneticToolface: number;  // degrees (0-360)
  inclination: number;        // degrees
  declination: number;        // degrees (magnetic declination at location)
}

export function magToolfaceCorrection(
  magneticToolface: number,
  inclination: number,
  declination: number
): {
  trueToolface: number;
  gravityToolface: number;
  correction: number;
  reliability: 'excellent' | 'good' | 'marginal' | 'unreliable';
} {
  const incRad = (inclination * Math.PI) / 180;
  
  // For high inclination, MTF and GTF converge
  // For low inclination, MTF correction becomes unreliable
  const correction = declination * Math.cos(incRad);
  
  let trueToolface = magneticToolface + correction;
  while (trueToolface < 0) trueToolface += 360;
  while (trueToolface >= 360) trueToolface -= 360;
  
  // GTF is derived from MTF by removing magnetic reference
  const gravityToolface = magneticToolface; // simplification: same as MTF at high inc
  
  // Reliability assessment based on inclination
  let reliability: 'excellent' | 'good' | 'marginal' | 'unreliable';
  if (inclination > 30) reliability = 'excellent';
  else if (inclination > 15) reliability = 'good';
  else if (inclination > 5) reliability = 'marginal';
  else reliability = 'unreliable';
  
  return {
    trueToolface: Math.round(trueToolface * 100) / 100,
    gravityToolface: Math.round(gravityToolface * 100) / 100,
    correction: Math.round(correction * 100) / 100,
    reliability
  };
}

/**
 * ─── Toolface to 3D Dogleg Conversion ───────────────────────────────────
 * 
 * Converts toolface orientation and DLS into build and turn components.
 * Used for planning and real-time steering decisions.
 * 
 * Build rate = DLS × cos(toolface)
 * Turn rate = DLS × sin(toolface)
 * 
 * Where toolface = 0° means building (pure inclination change),
 * toolface = 90° means turning right (pure azimuth change).
 * 
 * Reference: Industry standard directional drilling
 */
export function toolfaceTo3DDogleg(
  toolface: number,    // degrees
  dls: number,         // °/100ft dogleg severity
  inclination: number  // degrees (current inclination)
): {
  buildRate: number;   // °/100ft vertical build
  turnRate: number;    // °/100ft azimuthal turn
  dogleg: number;      // °/100ft net dogleg
  inclinationChange: number; // ° change expected per 100ft
  azimuthChange: number;     // ° change expected per 100ft
  walkRate: number;          // °/100ft tendency to walk right
} {
  const tfRad = (toolface * Math.PI) / 180;
  const incRad = (inclination * Math.PI) / 180;
  
  // Build and turn components
  const buildRate = dls * Math.cos(tfRad);
  const turnRate = dls * Math.sin(tfRad);
  
  // Azimuth change is projected through inclination
  // ΔAzi = turnRate / sin(inc) for nonzero inclination
  const azimuthChange = Math.sin(incRad) > 0.001 
    ? turnRate / Math.sin(incRad) 
    : turnRate * 100; // limit behavior near vertical
  
  // Net dogleg confirmation
  const dogleg = Math.sqrt(buildRate ** 2 + turnRate ** 2);
  
  // Walk rate (right-turn tendency from formation/BHA)
  const walkRate = turnRate * 0.1; // ~10% of turn component
  
  return {
    buildRate: Math.round(buildRate * 100) / 100,
    turnRate: Math.round(turnRate * 100) / 100,
    dogleg: Math.round(dogleg * 100) / 100,
    inclinationChange: Math.round(buildRate * 100) / 100,
    azimuthChange: Math.round(azimuthChange * 100) / 100,
    walkRate: Math.round(walkRate * 100) / 100
  };
}

// ─── Anti-Collision Types ───────────────────────────────────────────────

export interface OffsetWellStation {
  md: number;
  tvd: number;
  north: number;
  east: number;
  inc: number;
  azi: number;
  semiMajor: number;   // EOU semi-major axis at this station (ft)
  semiMinor: number;   // EOU semi-minor axis at this station (ft)
  eouAzimuth: number;  // EOU ellipse orientation (deg from North)
}

export interface AntiCollisionResult {
  // Primary fields (new ISCWSA-based)
  minimumSeparation: number;     // closest center-to-center distance (ft)
  separationFactor: number;      // separation / sum of EOU radii (>1 is safe)
  depthAtClosestApproach: number; // MD of reference well at closest point
  offsetDepthAtClosest: number;  // MD of offset well at closest point
  closestNorth: number;          // N coordinate of ref well at closest
  closestEast: number;           // E coordinate of ref well at closest
  riskLevel: 'safe' | 'minor' | 'moderate' | 'critical';
  pairwiseSeparations: { md: number; separation: number; factor: number }[];
  centerToCenter: number;        // minimum 3D center-to-center
  eouCombinedRadius: number;     // sum of EOU radii at closest point
  bearingToOffset: number;       // bearing from ref to offset at closest point
  collisionProbability: number;  // estimated collision probability (0-1)
  recommendedAction: string;

  // Backward-compatible aliases (for DirectionalTab.tsx)
  closestApproachDistance: number; // alias to minimumSeparation
  referenceEOU: number;            // alias to eouCombinedRadius / 2
  offsetEOU: number;               // alias to eouCombinedRadius / 2
}

// ─── Anti-Collision Calculation (ISCWSA MWD+IFR1 Error Model) ───────────

/**
 * calculateAntiCollision
 * 
 * Performs anti-collision analysis between a reference well and an offset well
 * using ISCWSA error model principles. Computes closest-approach scan across
 * all survey stations, combining EOU ellipses to determine separation factors.
 * 
 * ISCWSA Error Model basis (MWD+IFR1):
 *   - Along-hole depth error (instrument): 0.35% of MD
 *   - Inc error growth: 0.25° + 0.1°×sin(inc)/1000ft
 *   - Azi error growth: function of magnetic model + tool misalignment
 *   - Position uncertainty grows with depth as EOU = √(Σ σ²)
 * 
 * Separation Factor (SF):
 *   SF = (Center-to-Center distance) / (REOU + OEOU)
 *   SF > 2.0 : SAFE - no action
 *   SF 1.5-2.0 : MONITOR - continue with caution  
 *   SF 1.0-1.5 : WARNING - adjust trajectory
 *   SF < 1.0 : CRITICAL - stop drilling, replan
 * 
 * Reference: SPE 67616 (Williamson), ISCWSA Revision 5, SPE 90408
 */
export function calculateAntiCollision(
  refWell: SurveyStation[],
  offsetWell: OffsetWellStation[],
  options?: {
    minSeparationThreshold?: number;   // ft, default 50
    warningFactor?: number;            // default 1.5
    criticalFactor?: number;           // default 1.0
    eouScaleFactor?: number;           // default 2.8 (2.8σ = 95% confidence)
  }
): AntiCollisionResult {
  const WARN_FACTOR = options?.warningFactor ?? 1.5;
  const CRIT_FACTOR = options?.criticalFactor ?? 1.0;
  const EOU_SF = options?.eouScaleFactor ?? 2.8;

  if (refWell.length < 2 || offsetWell.length < 2) {
    return {
      minimumSeparation: Infinity,
      separationFactor: Infinity,
      depthAtClosestApproach: 0,
      offsetDepthAtClosest: 0,
      closestNorth: 0,
      closestEast: 0,
      riskLevel: 'safe',
      pairwiseSeparations: [],
      centerToCenter: Infinity,
      eouCombinedRadius: 0,
      bearingToOffset: 0,
      collisionProbability: 0,
      recommendedAction: 'Insufficient survey data for anti-collision analysis.',
      closestApproachDistance: Infinity,
      referenceEOU: 0,
      offsetEOU: 0
    };
  }

  // Reconstruct full 3D coordinates for both wells using Minimum Curvature
  const refCoords: { md: number; tvd: number; n: number; e: number }[] = [];
  let tvd = 0, n = 0, e = 0;
  refCoords.push({ md: refWell[0].md, tvd, n, e });
  for (let i = 1; i < refWell.length; i++) {
    const seg = calculateMinimumCurvature(refWell[i - 1], refWell[i]);
    tvd += seg.tvd;
    n += seg.north;
    e += seg.east;
    refCoords.push({ md: refWell[i].md, tvd, n, e });
  }

  const pairwiseSeparations: { md: number; separation: number; factor: number }[] = [];
  let minSep = Infinity;
  let minSepIdx = 0;
  let minOffsetIdx = 0;

  // Brute-force scan: for each ref station, find closest offset station
  for (let ri = 0; ri < refCoords.length; ri++) {
    const rc = refCoords[ri];
    let bestSep = Infinity;
    let bestOI = 0;

    for (let oi = 0; oi < offsetWell.length; oi++) {
      const ow = offsetWell[oi];
      // 3D center-to-center distance (ignoring TVD for horizontal plane scan,
      // but TVD matters for actual 3D proximity)
      const dn = rc.n - ow.north;
      const de = rc.e - ow.east;
      const dt = rc.tvd - ow.tvd;
      const sep3D = Math.sqrt(dn * dn + de * de + dt * dt);
      
      // Horizontal separation for EOU-based analysis
      const hSep = Math.sqrt(dn * dn + de * de);
      
      // EOU radii at this offset station (scaled to confidence)
      const rEOU = Math.sqrt(
        (ow.semiMajor * EOU_SF) ** 2 * (Math.cos(ow.eouAzimuth * Math.PI / 180)) ** 2 +
        (ow.semiMinor * EOU_SF) ** 2 * (Math.sin(ow.eouAzimuth * Math.PI / 180)) ** 2
      );
      
      // Ref EOU estimated from depth (grows linearly)
      const refEOU = rc.md * 0.005 * EOU_SF; // ~0.5% of depth at 2.8σ

      const factor = hSep / Math.max(rEOU + refEOU, 0.01);

      if (sep3D < bestSep) {
        bestSep = sep3D;
        bestOI = oi;
      }

      if (ri === 0 || oi === 0) {
        // Track all pairwise for closest station
        if (sep3D < minSep) {
          minSep = sep3D;
          minSepIdx = ri;
          minOffsetIdx = oi;
        }
      }
    }

    pairwiseSeparations.push({
      md: rc.md,
      separation: Math.round(bestSep * 100) / 100,
      factor: Math.round((bestSep / Math.max(rc.md * 0.005 * EOU_SF, 0.01)) * 100) / 100
    });

    if (bestSep < minSep) {
      minSep = bestSep;
      minSepIdx = ri;
      minOffsetIdx = bestOI;
    }
  }

  // Compute EOU at closest approach
  const refEOUClosest = refCoords[minSepIdx].md * 0.005 * EOU_SF;
  const offEOUClosest = offsetWell[minOffsetIdx] 
    ? Math.sqrt(
        (offsetWell[minOffsetIdx].semiMajor * EOU_SF) ** 2 +
        (offsetWell[minOffsetIdx].semiMinor * EOU_SF) ** 2
      ) / Math.SQRT2
    : refEOUClosest;

  const eouCombined = refEOUClosest + offEOUClosest;
  const separationFactor = minSep / Math.max(eouCombined, 0.01);

  // Bearing from reference to offset at closest point
  const dnClose = refCoords[minSepIdx].n - (offsetWell[minOffsetIdx]?.north ?? 0);
  const deClose = refCoords[minSepIdx].e - (offsetWell[minOffsetIdx]?.east ?? 0);
  let bearing = Math.atan2(deClose, dnClose) * 180 / Math.PI;
  if (bearing < 0) bearing += 360;

  // Collision probability (simplified Gaussian overlap estimate)
  const pOverlap = Math.exp(-0.5 * separationFactor * separationFactor);

  // Risk classification
  let riskLevel: AntiCollisionResult['riskLevel'];
  let recommendedAction: string;

  if (separationFactor >= 2.0) {
    riskLevel = 'safe';
    recommendedAction = 'Clearance adequate. Continue drilling with standard monitoring.';
  } else if (separationFactor >= 1.5) {
    riskLevel = 'minor';
    recommendedAction = 'Moderate proximity. Continue with enhanced monitoring and MWD surveys every stand.';
  } else if (separationFactor >= 1.0) {
    riskLevel = 'moderate';
    recommendedAction = 'Significant proximity risk. Reduce ROP, survey every connection, prepare avoidance plan.';
  } else {
    riskLevel = 'critical';
    recommendedAction = 'CRITICAL: EOU ellipses overlap. Stop drilling immediately. Perform gyro survey and replan trajectory.';
  }

  const minSepRounded = Math.round(minSep * 100) / 100;
  const eouCombinedR = Math.round(eouCombined * 100) / 100;

  return {
    minimumSeparation: minSepRounded,
    separationFactor: Math.round(separationFactor * 1000) / 1000,
    depthAtClosestApproach: Math.round(refCoords[minSepIdx].md * 10) / 10,
    offsetDepthAtClosest: Math.round((offsetWell[minOffsetIdx]?.md ?? 0) * 10) / 10,
    closestNorth: Math.round(refCoords[minSepIdx].n * 10) / 10,
    closestEast: Math.round(refCoords[minSepIdx].e * 10) / 10,
    riskLevel,
    pairwiseSeparations,
    centerToCenter: minSepRounded,
    eouCombinedRadius: eouCombinedR,
    bearingToOffset: Math.round(bearing * 10) / 10,
    collisionProbability: Math.round(pOverlap * 10000) / 10000,
    recommendedAction,
    // Backward-compatible aliases
    closestApproachDistance: minSepRounded,
    referenceEOU: Math.round(eouCombinedR / 2 * 100) / 100,
    offsetEOU: Math.round(eouCombinedR / 2 * 100) / 100
  };
}




// ============================================================
// PHASE 11 — ADVANCED DIRECTIONAL DRILLING EXTENSIONS
// ============================================================

export interface PumpPressureToolfaceResult {
  reactiveTorque: number;
  toolfaceOffset: number;
  netToolface: number;
  motorDeltaP: number;
  stallMargin: number;
}

/**
 * calculatePumpPressureToolface
 * Reactive torque from mud motor twists the drillstring, offsetting toolface.
 * Uses torsional stiffness of drillpipe to estimate twist-back angle.
 */
export function calculatePumpPressureToolface(
  setTF: number,
  flowRate: number,
  bitDP: number,
  motorDisp: number,
  motorStall: number,
  dpLen: number,
  dpOD: number,
  dpID: number
): PumpPressureToolfaceResult {
  const motorDP = bitDP * 0.6 + 200;
  const sMargin = Math.max(0, motorStall - motorDP);
  const dispPerRev = 231 / Math.max(0.01, motorDisp);
  const reacTorque = (motorDP * dispPerRev) / (24 * Math.PI);
  const G = 11.5e6;
  const J = (Math.PI / 32) * (Math.pow(dpOD, 4) - Math.pow(dpID, 4));
  const L = dpLen * 12;
  const kFTLBF = (G * J) / Math.max(1, L) / 12;
  const tfOffRad = kFTLBF > 0 ? reacTorque / kFTLBF : 0;
  const tfOff = (tfOffRad * 180) / Math.PI;
  let netTF = setTF - tfOff;
  while (netTF < 0) netTF += 360;
  while (netTF >= 360) netTF -= 360;
  return {
    reactiveTorque: Math.round(reacTorque * 10) / 10,
    toolfaceOffset: Math.round(tfOff * 100) / 100,
    netToolface: Math.round(netTF * 10) / 10,
    motorDeltaP: Math.round(motorDP),
    stallMargin: Math.round(sMargin)
  };
}


export interface MFMComparisonResult {
  igrfDeclination: number;
  ifrDeclination: number;
  mfmDeclination: number;
  igrfOnlyAzimuthError: number;
  ifrOnlyAzimuthError: number;
  mfmResidualError: number;
  diurnalSignal: number;
  stormActivity: 'quiet' | 'active' | 'storm';
}

/**
 * calculateMFMComparison
 * Compare IGRF-only, IFR-corrected, and MFM (Magnetic Field Monitoring)
 * declination values and resulting azimuth errors.
 */
export function calculateMFMComparison(
  lat: number,
  lon: number,
  year: number,
  crustN: number,
  crustE: number,
  diurnalEst: number
): MFMComparisonResult {
  const igrfD = getMagneticDeclination(lat, lon, year);
  const hEst = 24000;
  const crustCorr = (crustE / Math.max(1, hEst)) * (180 / Math.PI);
  const ifrD = igrfD + crustCorr;
  const diurnalCorr = (diurnalEst / Math.max(1, hEst)) * (180 / Math.PI);
  const mfmD = ifrD + diurnalCorr;
  const igrfErr = Math.abs(crustCorr) + Math.abs(diurnalCorr) * 0.3;
  const ifrErr = Math.abs(diurnalCorr) * 0.8;
  const mfmResErr = Math.abs(diurnalCorr) * 0.1;
  let storm: 'quiet' | 'active' | 'storm';
  if (diurnalEst < 30) storm = 'quiet';
  else if (diurnalEst < 100) storm = 'active';
  else storm = 'storm';
  return {
    igrfDeclination: Math.round(igrfD * 100) / 100,
    ifrDeclination: Math.round(ifrD * 100) / 100,
    mfmDeclination: Math.round(mfmD * 100) / 100,
    igrfOnlyAzimuthError: Math.round(igrfErr * 1000) / 1000,
    ifrOnlyAzimuthError: Math.round(ifrErr * 1000) / 1000,
    mfmResidualError: Math.round(mfmResErr * 1000) / 1000,
    diurnalSignal: diurnalEst,
    stormActivity: storm
  };
}


export interface RSSComparisonResult {
  pushDLS: number;
  pointDLS: number;
  pushLateralCut: number;
  pointLateralCut: number;
  recommendedSystem: 'push' | 'point';
  dlsAdvantagePct: number;
}

/**
 * compareRSSTypes
 * Compares push-the-bit vs point-the-bit RSS performance
 * for a given formation UCS.
 */
export function compareRSSTypes(
  padForce: number,
  ucs: number,
  rpm: number,
  holeSz: number
): RSSComparisonResult {
  const pushRes = calculateRSSDeflection(padForce, ucs, rpm, holeSz);
  const ptEff = ucs > 15000 ? 1.35 : 1.15;
  const ptDLS = pushRes.dls * ptEff;
  const ptCut = pushRes.lateralCutInPerRev * ptEff;
  const rec: 'push' | 'point' = ptDLS > pushRes.dls * 1.1 ? 'point' : 'push';
  const adv = ((Math.max(pushRes.dls, ptDLS) / Math.min(pushRes.dls, ptDLS)) - 1) * 100;
  return {
    pushDLS: Math.round(pushRes.dls * 100) / 100,
    pointDLS: Math.round(ptDLS * 100) / 100,
    pushLateralCut: Math.round(pushRes.lateralCutInPerRev * 1000) / 1000,
    pointLateralCut: Math.round(ptCut * 1000) / 1000,
    recommendedSystem: rec,
    dlsAdvantagePct: Math.round(adv * 10) / 10
  };
}


export interface BitWalkEstimate {
  walkRate: number;
  walkDirection: 'left' | 'right';
  netBuildModifier: number;
  dipAngleRelative: number;
  severity: 'negligible' | 'mild' | 'moderate' | 'severe';
}

/**
 * calculateBitWalk
 * Estimates bit walk tendency based on formation dip, anisotropy, and UCS.
 */
export function calculateBitWalk(
  inc: number,
  azi: number,
  fDip: number,
  dipAzi: number,
  anisotropy: number,
  ucs: number
): BitWalkEstimate {
  const cosRel =
    Math.sin((inc * Math.PI) / 180) * Math.sin((fDip * Math.PI) / 180) *
      Math.cos(((azi - dipAzi) * Math.PI) / 180) +
    Math.cos((inc * Math.PI) / 180) * Math.cos((fDip * Math.PI) / 180);
  const relDip = Math.acos(Math.max(-1, Math.min(1, cosRel))) * (180 / Math.PI);
  const ucsF = Math.min(1.5, ucs / 15000);
  const wRate = anisotropy * Math.sin((relDip * Math.PI) / 180) * ucsF * 0.5;
  const cross = Math.sin(((dipAzi - azi) * Math.PI) / 180);
  const wDir: 'left' | 'right' = cross > 0 ? 'left' : 'right';
  const nBuild = anisotropy * Math.cos((relDip * Math.PI) / 180) * 0.3;
  let sev: 'negligible' | 'mild' | 'moderate' | 'severe';
  if (wRate < 0.2) sev = 'negligible';
  else if (wRate < 0.5) sev = 'mild';
  else if (wRate < 1.0) sev = 'moderate';
  else sev = 'severe';
  return {
    walkRate: Math.round(wRate * 100) / 100,
    walkDirection: wDir,
    netBuildModifier: Math.round(nBuild * 100) / 100,
    dipAngleRelative: Math.round(relDip * 10) / 10,
    severity: sev
  };
}


export interface UncertaintyConeStation {
  md: number;
  tvd: number;
  north: number;
  east: number;
  semiMajor: number;
  semiMinor: number;
  verticalUncertainty: number;
  orientation: number;
}

/**
 * calculateUncertaintyCone
 * Computes ISCWSA EOU at each station along a wellbore,  
 * building a 3D cone of uncertainty from surface to TD.
 */
export function calculateUncertaintyCone(
  stations: ISCWSAStation[],
  lat: number,
  conf: number = 95
): UncertaintyConeStation[] {
  return stations.map((st, idx) => {
    const sub = stations.slice(0, idx + 1);
    const eou = calculateISCWSAError(sub, ISCWSA_MWD_ERROR_TERMS, lat, conf);
    return {
      md: st.md,
      tvd: st.tvd,
      north: st.north,
      east: st.east,
      semiMajor: eou.semiMajor,
      semiMinor: eou.semiMinor,
      verticalUncertainty: eou.verticalUncertainty,
      orientation: eou.orientation
    };
  });
}


export interface TravelingCylinderStation {
  md: number;
  centerToCenter: number;
  combinedEOU: number;
  separationFactor: number;
  refSemiMajor: number;
  refSemiMinor: number;
  offsetSemiMajor: number;
  offsetSemiMinor: number;
  riskFlag: 'safe' | 'warning' | 'critical';
}

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED: 3D Covariance Propagation (Full ISCWSA Rev.4/5)
// ═══════════════════════════════════════════════════════════════════════════

export interface CovarianceMatrix {
  // 3x3 covariance in NEV frame (North-East-Vertical)
  cnn: number; cne: number; cnv: number;
  cee: number; cev: number; cvv: number;
}

export interface CovarianceStation {
  md: number;
  tvd: number;
  north: number;
  east: number;
  cov: CovarianceMatrix;
  semiMajor: number;
  semiMinor: number;
  semiVertical: number;
  orientation: number; // deg from North
  confidence: number;
}

/**
 * propagateCovariance3D
 * Full 3D covariance propagation along wellbore using ISCWSA Rev.4 error model.
 * Accumulates sensor uncertainties chain-wise from surface to each station.
 * Produces true covariance ellipsoids, not just scalar EOU.
 */
export function propagateCovariance3D(
  stations: ISCWSAStation[],
  errorTerms: ISCWSAErrorTerm[],
  latitude: number,
  confidenceLevel: number = 95
): CovarianceStation[] {
  if (stations.length === 0) return [];
  const degToRad = Math.PI / 180;
  const kFactor = confidenceToKFactor(confidenceLevel);
  const latRad = latitude * degToRad;
  const g = 9.80665 * (1 - 0.0026 * Math.cos(2 * latRad));
  
  // Accumulated covariance in NEV frame (ft²)
  let cnn = 0, cne = 0, cnv = 0, cee = 0, cev = 0, cvv = 0;
  let prevMD = stations[0].md;
  
  const results: CovarianceStation[] = stations.map((st, idx) => {
    const ds = (st.md - prevMD) * 0.3048; // ft -> m for error propagation
    if (ds < 0) { prevMD = st.md; }
    const incRad = st.inc * degToRad;
    const aziRad = st.azi * degToRad;
    const sinInc = Math.sin(incRad);
    const cosInc = Math.cos(incRad);
    const sinAzi = Math.sin(aziRad);
    const cosAzi = Math.cos(aziRad);
    
    // Direction cosine derivatives
    const dN_dInc = ds * cosInc * cosAzi;
    const dN_dAzi = -ds * sinInc * sinAzi;
    const dE_dInc = ds * cosInc * sinAzi;
    const dE_dAzi = ds * sinInc * cosAzi;
    const dV_dInc = -ds * sinInc;
    const dV_dMD = ds * cosInc; // reapplied from TVD derivation
    
    // Accumulate error contributions from each ISCWSA term
    for (const et of errorTerms) {
      const w = et.magnitude; // 1-sigma magnitude
      if (w <= 0) continue;
      
      // Categorize errors by propagation type
      const isRandom = et.code.includes('RND') || et.code.includes('SAG') || et.code.includes('DRF');
      const isSystematic = et.code.includes('SYS') || et.code.includes('MAG') || et.code.includes('GRAV');
      const isDepth = et.code.includes('MD') || et.code.includes('DEPT');
      
      // Scale: systematic errors grow with distance, random with sqrt(distance)
      let scaleFactor = 1.0;
      if (isSystematic) scaleFactor = ds * 3.28084; // convert m to ft scale
      else if (isRandom) scaleFactor = Math.sqrt(ds * 3.28084);
      
      const sigma2 = (w * scaleFactor) ** 2; // variance (ft²)
      
      if (isDepth) {
        cnn += sigma2 * (cosInc * cosAzi) ** 2;
        cee += sigma2 * (cosInc * sinAzi) ** 2;
        cvv += sigma2 * sinInc ** 2;
        cne += sigma2 * cosInc * cosAzi * cosInc * sinAzi;
        cnv += sigma2 * cosInc * cosAzi * sinInc;
        cev += sigma2 * cosInc * sinAzi * sinInc;
      } else {
        // Angle-dependent error propagation
        const dIncSigma = w * (isRandom ? Math.sqrt(ds * 3.28084) : 1) * degToRad;
        const dAziSigma = w * (isRandom ? Math.sqrt(ds * 3.28084) : 1) * degToRad;
        
        cnn += (dN_dInc * dIncSigma) ** 2 + (dN_dAzi * dAziSigma) ** 2;
        cee += (dE_dInc * dIncSigma) ** 2 + (dE_dAzi * dAziSigma) ** 2;
        cvv += (dV_dInc * dIncSigma) ** 2 + sigma2 * 0.1; // small vertical contribution
        cne += dN_dInc * dE_dInc * dIncSigma ** 2 + dN_dAzi * dE_dAzi * dAziSigma ** 2;
        cnv += dN_dInc * dV_dInc * dIncSigma ** 2;
        cev += dE_dInc * dV_dInc * dIncSigma ** 2;
      }
    }
    
    prevMD = st.md;
    
    // Eigendecomposition of 2x2 horizontal slice for semi-axes
    const delta = Math.sqrt((cnn - cee) ** 2 + 4 * cne ** 2);
    const lambda1 = (cnn + cee + delta) / 2; // major axis variance
    const lambda2 = (cnn + cee - delta) / 2; // minor axis variance
    const orient = 0.5 * Math.atan2(2 * cne, cnn - cee) * (180 / Math.PI);
    
    const smaj = Math.sqrt(Math.max(0, lambda1)) * kFactor;
    const smin = Math.sqrt(Math.max(0, lambda2)) * kFactor;
    const svert = Math.sqrt(Math.max(0, cvv)) * kFactor;
    
    return {
      md: st.md,
      tvd: st.tvd,
      north: st.north,
      east: st.east,
      cov: { cnn, cne, cnv, cee, cev, cvv },
      semiMajor: Math.round(smaj * 100) / 100,
      semiMinor: Math.round(smin * 100) / 100,
      semiVertical: Math.round(svert * 100) / 100,
      orientation: Math.round(orient * 100) / 100,
      confidence: confidenceLevel
    };
  });
  
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED: Bit Walk & Formation Anisotropy Projection
// ═══════════════════════════════════════════════════════════════════════════

export interface BitWalkProjection {
  projectedPath: { md: number; inc: number; azi: number; north: number; east: number; tvd: number }[];
  cumulativeWalk: number;       // total azimuth walk (deg)
  walkRatePer100ft: number;     // °/100ft average walk rate
  anisotropyFactor: number;     // effective anisotropy multiplier
  formationTendency: 'none' | 'right' | 'left';
  walkSeverity: 'low' | 'moderate' | 'high';
  projectedTVD: number;
  projectedDeparture: number;
}

/**
 * projectBitWalk
 * Projects bit trajectory forward accounting for formation anisotropy,
 * RSS/BHA walk tendencies, and current steering parameters.
 * Models the bit's natural tendency to walk right (or left) in dipping formations.
 *
 * Reference: SPE-30497, SPE-170592
 */
export function projectBitWalk(
  currentInc: number,
  currentAzi: number,
  startMD: number,
  startTVD: number,
  startNorth: number,
  startEast: number,
  projectionLength: number,     // ft to project forward
  formationDip: number,          // degrees
  dipAzimuth: number,            // degrees
  anisotropyRatio: number = 1.1, // hh/hv ratio (typical 1.0-1.5 for shales)
  rssType: 'push' | 'point' = 'push',
  currentDLS: number = 3,
  stepSize: number = 30          // ft per step
): BitWalkProjection {
  const degToRad = Math.PI / 180;
  const dipRad = formationDip * degToRad;
  const dipAziRad = dipAzimuth * degToRad;
  
  // Anisotropy effect: bit tends to walk up-dip (toward lower formation stress)
  const anisotropyEffect = (anisotropyRatio - 1) * 3; // °/100ft walk from anisotropy
  
  // RSS type effect: push-the-bit tends to walk right more than point-the-bit
  const rssWalkBias = rssType === 'push' ? 0.15 : 0.05; // °/100ft
  
  // Combined walk rate
  const walkRate = anisotropyEffect + rssWalkBias * currentDLS;
  const absWalkRate = Math.abs(walkRate);
  
  const walkSeverity = absWalkRate < 0.3 ? 'low' : absWalkRate < 1.0 ? 'moderate' : 'high';
  const formationTendency = walkRate > 0.1 ? 'right' : walkRate < -0.1 ? 'left' : 'none';
  
  const steps = Math.ceil(projectionLength / stepSize);
  const path: BitWalkProjection['projectedPath'] = [];
  
  let inc = currentInc;
  let azi = currentAzi;
  let md = startMD;
  let tvd = startTVD;
  let north = startNorth;
  let east = startEast;
  let cumulativeWalk = 0;
  
  for (let i = 0; i <= steps; i++) {
    const incR = inc * degToRad;
    const aziR = azi * degToRad;
    
    // Forward step
    tvd += stepSize * Math.cos(incR);
    north += stepSize * Math.sin(incR) * Math.cos(aziR);
    east += stepSize * Math.sin(incR) * Math.sin(aziR);
    md += stepSize;
    
    path.push({ md, inc, azi, north, east, tvd });
    
    // Apply DLS to inclination (build)
    const dlsPerStep = currentDLS * (stepSize / 100);
    inc = Math.min(90, Math.max(0, inc + dlsPerStep));
    
    // Apply walk to azimuth (anisotropy × dip direction)
    const walkPerStep = walkRate * (stepSize / 100);
    // Walk direction is toward dip azimuth
    const walkDir = Math.sign(Math.sin((dipAziRad - azi * degToRad)));
    azi += walkPerStep * walkDir;
    while (azi >= 360) azi -= 360;
    while (azi < 0) azi += 360;
    
    cumulativeWalk += Math.abs(walkPerStep);
  }
  
  return {
    projectedPath: path,
    cumulativeWalk: Math.round(cumulativeWalk * 100) / 100,
    walkRatePer100ft: Math.round(walkRate * 100) / 100,
    anisotropyFactor: anisotropyRatio,
    formationTendency,
    walkSeverity,
    projectedTVD: Math.round(tvd * 10) / 10,
    projectedDeparture: Math.round(Math.sqrt(north ** 2 + east ** 2) * 10) / 10
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED: Multi-Station Magnetic Analysis (MSA/IFR-2)
// ═══════════════════════════════════════════════════════════════════════════

export interface MSAStation {
  stationIndex: number;
  md: number;
  inc: number;
  aziMag: number;      // raw magnetic azimuth
  aziCorrected: number; // after MSA correction
  bTotal: number;       // nT
  gTotal: number;       // m/s²
  dipAngle: number;     // deg
  axialCorrection: number; // nT correction applied
  convergence: number;  // residual between iterations
}

export interface MSAResult {
  stations: MSAStation[];
  converged: boolean;
  iterations: number;
  finalBias: number;        // estimated axial magnetic bias (nT)
  biasUncertainty: number;  // ± nT
  correctionConfidence: 'high' | 'moderate' | 'low';
  averageConvergence: number;
  azimuthShift: number;     // average azimuth correction (deg)
}

/**
 * performMultiStationAnalysis
 * Iterative multi-station correction for axial magnetic interference.
 * Uses multiple survey stations to separate BHA-induced magnetic bias
 * from the geomagnetic field, converging when residuals stabilize.
 *
 * Reference: SPE-103736, SPE-174861 (IFR-2)
 */
export function performMultiStationAnalysis(
  stations: { md: number; inc: number; aziMag: number; bTotal: number; gTotal: number }[],
  referenceBTotal: number = 48000,   // IGRF total field (nT)
  referenceDip: number = 60,          // IGRF dip angle (deg)
  tolerance: number = 50,             // nT convergence tolerance
  maxIterations: number = 20
): MSAResult {
  if (stations.length < 2) {
    return {
      stations: [],
      converged: false,
      iterations: 0,
      finalBias: 0,
      biasUncertainty: Infinity,
      correctionConfidence: 'low',
      averageConvergence: 0,
      azimuthShift: 0
    };
  }
  
  const degToRad = Math.PI / 180;
  const refDipRad = referenceDip * degToRad;
  
  // Initialize bias estimate from first station
  let estimatedBias = stations[0].bTotal - referenceBTotal;
  let converged = false;
  let iterations = 0;
  let prevBias = estimatedBias;
  
  // Iterative refinement
  for (let iter = 0; iter < maxIterations; iter++) {
    iterations = iter + 1;
    let totalResidual = 0;
    
    // Compute corrected values at each station
    for (const st of stations) {
      const incRad = st.inc * degToRad;
      const sinInc = Math.sin(incRad);
      const cosInc = Math.cos(incRad);
      
      // Axial interference affects the Z-axis magnetometer
      // Bz_corrected = Bz_measured - estimatedBias
      // Recompute total field: B_total² = Bx² + By² + Bz²
      const bHorizontal = Math.sqrt(
        Math.max(0, st.bTotal ** 2 - (st.bTotal * Math.sin(refDipRad)) ** 2)
      );
      const bVertical = st.bTotal * Math.sin(refDipRad) - estimatedBias;
      const correctedBTotal = Math.sqrt(bHorizontal ** 2 + bVertical ** 2);
      
      const residual = correctedBTotal - referenceBTotal;
      totalResidual += Math.abs(residual);
    }
    
    // Update bias estimate
    const avgResidual = totalResidual / stations.length;
    estimatedBias = prevBias + avgResidual * 0.5; // damped update
    
    if (Math.abs(estimatedBias - prevBias) < tolerance) {
      converged = true;
      break;
    }
    prevBias = estimatedBias;
  }
  
  // Compute final corrected stations
  const refProj = referenceBTotal * Math.cos(refDipRad);
  const refVert = referenceBTotal * Math.sin(refDipRad);
  
  const msaStations: MSAStation[] = stations.map((st, idx) => {
    const incRad = st.inc * degToRad;
    const sinInc = Math.sin(incRad);
    
    // Corrected vertical component
    const bVertMeasured = st.bTotal * Math.sin(Math.asin((st.bTotal - refProj) / st.bTotal));
    const bVertCorrected = bVertMeasured - estimatedBias;
    const bHoriCorrected = Math.sqrt(Math.max(0, refProj ** 2));
    
    // Recompute corrected azimuth
    const correctedDip = Math.atan2(bVertCorrected, bHoriCorrected) * (180 / Math.PI);
    let correctedAzi = st.aziMag;
    
    // Azimuth correction from field distortion
    const aziCorrection = Math.atan2(
      estimatedBias * Math.sin(incRad),
      bHoriCorrected
    ) * (180 / Math.PI);
    correctedAzi += aziCorrection;
    while (correctedAzi >= 360) correctedAzi -= 360;
    while (correctedAzi < 0) correctedAzi += 360;
    
    const residual = Math.abs(st.bTotal - referenceBTotal - estimatedBias * Math.cos(incRad));
    
    return {
      stationIndex: idx,
      md: st.md,
      inc: st.inc,
      aziMag: st.aziMag,
      aziCorrected: Math.round(correctedAzi * 100) / 100,
      bTotal: st.bTotal,
      gTotal: st.gTotal,
      dipAngle: Math.round(correctedDip * 10) / 10,
      axialCorrection: Math.round(estimatedBias),
      convergence: Math.round(residual)
    };
  });
  
  // Average convergence
  const avgConv = msaStations.reduce((s, st) => s + st.convergence, 0) / msaStations.length;
  const azShift = msaStations.reduce((s, st, i) => {
    if (i === 0) return 0;
    return s + Math.abs(st.aziCorrected - st.aziMag);
  }, 0) / Math.max(1, msaStations.length - 1);
  
  return {
    stations: msaStations,
    converged,
    iterations,
    finalBias: Math.round(estimatedBias),
    biasUncertainty: Math.round(avgConv * 10) / 10,
    correctionConfidence: converged ? (avgConv < 100 ? 'high' : 'moderate') : 'low',
    averageConvergence: Math.round(avgConv * 10) / 10,
    azimuthShift: Math.round(azShift * 100) / 100
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED: MWD Telemetry Latency & DLS Lag Model
// ═══════════════════════════════════════════════════════════════════════════

export interface MWDLatencyResult {
  realTimeMD: number;           // actual bit MD
  lastSurveyMD: number;         // last received survey MD
  lagDistance: number;          // ft between bit and last survey
  lagTime: number;              // seconds of latency
  laggedDLS: number;            // DLS at last known survey
  projectedDLS: number;         // estimated current DLS at bit
  dlsDrift: number;             // DLS change rate
  surveyTransitTime: number;    // seconds for mud pulse to surface
  recommendedRefreshInterval: number; // seconds
  dataAgeCategory: 'fresh' | 'stale' | 'blind';
}

/**
 * modelMWDLatency
 * Models the lag between downhole measurements and surface reception.
 * Critical for real-time steering decisions: the bit may have advanced
 * 30-60 ft beyond the last received survey during mud-pulse telemetry.
 *
 * Reference: SPE-204075
 */
export function modelMWDLatency(
  currentMD: number,
  lastSurveyMD: number,
  rop: number,            // ft/hr
  mudPulseSpeed: number = 4800,  // ft/s in mud (typical 4000-5000)
  depth: number = 8000,   // ft (well depth)
  lastDLS: number = 3,    // °/100ft from last survey
  dlsTrend: number = 0    // °/100ft per 100ft trend
): MWDLatencyResult {
  const lagDistance = currentMD - lastSurveyMD;
  const surveyTransitTime = depth / mudPulseSpeed; // seconds for pulse to reach surface
  const lagTime = (lagDistance / Math.max(rop, 1)) * 3600; // seconds since last survey
  
  // DLS drift projection
  const projectedDLS = lastDLS + dlsTrend * (lagDistance / 100);
  const dlsDrift = dlsTrend;
  
  // Data age categorization
  let dataAgeCategory: MWDLatencyResult['dataAgeCategory'];
  if (lagDistance < 30) dataAgeCategory = 'fresh';
  else if (lagDistance < 90) dataAgeCategory = 'stale';
  else dataAgeCategory = 'blind';
  
  // Recommended refresh based on ROP
  const recommendedRefreshInterval = Math.max(5, Math.min(60, 30 / Math.max(rop / 60, 0.1)));
  
  return {
    realTimeMD: currentMD,
    lastSurveyMD,
    lagDistance: Math.round(lagDistance * 10) / 10,
    lagTime: Math.round(lagTime * 10) / 10,
    laggedDLS: Math.round(lastDLS * 100) / 100,
    projectedDLS: Math.round(projectedDLS * 100) / 100,
    dlsDrift: Math.round(dlsDrift * 1000) / 1000,
    surveyTransitTime: Math.round(surveyTransitTime * 10) / 10,
    recommendedRefreshInterval: Math.round(recommendedRefreshInterval),
    dataAgeCategory
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED: Traveling Cylinder Volume (3D anti-collision intersection)
// ═══════════════════════════════════════════════════════════════════════════

export interface CylinderIntersection {
  stationMD: number;
  separationFactor: number;
  overlapVolume: number;     // ft³ of overlapping EOU ellipsoids
  intersectionRatio: number; // 0 = no overlap, 1 = complete overlap
  closestApproach3D: number; // ft (true 3D distance)
  crossingAngle: number;     // degrees between well paths
  riskIndex: number;         // composite risk (0-100 normalized)
}

/**
 * calculateCylinderIntersectionVolume
 * Computes the 3D intersection volume of uncertainty ellipsoids
 * between reference and offset wells at each station.
 * Uses the ISCWSA traveling cylinder principle with EOU ellipsoid overlap.
 *
 * Reference: SPE-199072, ISCWSA Rev.5
 */
export function calculateCylinderIntersectionVolume(
  refCovStations: CovarianceStation[],
  offsetCovStations: CovarianceStation[],
  refPath: { md: number; north: number; east: number; tvd: number; inc: number; azi: number }[],
  offsetPath: { md: number; north: number; east: number; tvd: number; inc: number; azi: number }[]
): CylinderIntersection[] {
  const degToRad = Math.PI / 180;
  const results: CylinderIntersection[] = [];
  
  for (const refCov of refCovStations) {
    // Find nearest offset station in 3D
    let minDist3D = Infinity;
    let bestOffCov: CovarianceStation | null = null;
    let bestOffIdx = 0;
    
    for (let j = 0; j < offsetCovStations.length; j++) {
      const offCov = offsetCovStations[j];
      const d3 = Math.sqrt(
        (refCov.north - offCov.north) ** 2 +
        (refCov.east - offCov.east) ** 2 +
        (refCov.tvd - offCov.tvd) ** 2
      );
      if (d3 < minDist3D) {
        minDist3D = d3;
        bestOffCov = offCov;
        bestOffIdx = j;
      }
    }
    
    if (!bestOffCov || minDist3D > 500) continue;
    
    // EOU ellipsoid semi-axes
    const rMA = refCov.semiMajor;
    const rMI = refCov.semiMinor;
    const rV = refCov.semiVertical;
    const oMA = bestOffCov.semiMajor;
    const oMI = bestOffCov.semiMinor;
    const oV = bestOffCov.semiVertical;
    
    // Combined EOU radius in separation direction
    const combHorizontal = (rMA + oMA) / 2;
    const combVertical = (rV + oV) / 2;
    const combRadial = Math.sqrt(combHorizontal ** 2 + combVertical ** 2);
    
    // Separation factor
    const sf = minDist3D / Math.max(combRadial, 0.01);
    
    // Ellipsoid overlap volume approximation
    // V_overlap ≈ (4π/3) × min(a1,a2) × min(b1,b2) × min(c1,c2) × max(0, 1 - d/combRad)
    const minA = Math.min(rMA, oMA);
    const minB = Math.min(rMI, oMI);
    const minV = Math.min(rV, oV);
    const overlapFraction = Math.max(0, Math.min(1, 1 - (minDist3D / Math.max(combRadial, 0.01))));
    const overlapVolume = (4 * Math.PI / 3) * minA * minB * minV * overlapFraction;
    
    // Crossing angle
    const refPt = refPath.find(p => Math.abs(p.md - refCov.md) < 1);
    const offPt = offsetPath[bestOffIdx];
    let crossingAngle = 0;
    if (refPt && offPt) {
      const refV = {
        x: Math.sin(refPt.inc * degToRad) * Math.cos(refPt.azi * degToRad),
        y: Math.sin(refPt.inc * degToRad) * Math.sin(refPt.azi * degToRad),
        z: Math.cos(refPt.inc * degToRad)
      };
      const offV = {
        x: Math.sin(offPt.inc * degToRad) * Math.cos(offPt.azi * degToRad),
        y: Math.sin(offPt.inc * degToRad) * Math.sin(offPt.azi * degToRad),
        z: Math.cos(offPt.inc * degToRad)
      };
      const dot = refV.x * offV.x + refV.y * offV.y + refV.z * offV.z;
      crossingAngle = Math.acos(Math.min(1, Math.abs(dot))) * (180 / Math.PI);
    }
    
    // Composite risk index (0-100)
    const riskIndex = Math.min(100, Math.max(0,
      (1 - Math.min(sf, 5) / 5) * 60 +      // separation factor (60%)
      overlapFraction * 30 +                  // overlap (30%)
      (1 - Math.min(crossingAngle, 90) / 90) * 10 // crossing angle (10%)
    ));
    
    results.push({
      stationMD: refCov.md,
      separationFactor: Math.round(sf * 1000) / 1000,
      overlapVolume: Math.round(overlapVolume * 10) / 10,
      intersectionRatio: Math.round(overlapFraction * 1000) / 1000,
      closestApproach3D: Math.round(minDist3D * 10) / 10,
      crossingAngle: Math.round(crossingAngle * 10) / 10,
      riskIndex: Math.round(riskIndex * 10) / 10
    });
  }
  
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED: Toolface Crossover Zone (GTF ↔ MTF transition)
// ═══════════════════════════════════════════════════════════════════════════

export interface ToolfaceCrossoverResult {
  inclination: number;
  recommendedMode: 'gtf' | 'mtf' | 'crossover';
  gtfReliability: number;  // 0-1
  mtfReliability: number;  // 0-1
  crossoverWeight: number; // 0 = full MTF, 1 = full GTF
  blendedToolface: number;
  gtfValue: number;
  mtfValue: number;
  uncertainty: number;     // degrees of toolface uncertainty
}

/**
 * calculateToolfaceCrossover
 * Determines the optimal toolface reference mode based on inclination.
 * GTF: reliable above 8° inclination (gravity vector)
 * MTF: reliable below 5° inclination (magnetic vector)
 * Crossover zone: 5-8° where both are blended.
 *
 * Reference: SPE-103736, Industry standard practice
 */
export function calculateToolfaceCrossover(
  inclination: number,
  gtfRaw: number,
  mtfRaw: number,
  declination: number
): ToolfaceCrossoverResult {
  const degToRad = Math.PI / 180;
  
  // Reliability functions (logistic curves centered at 6.5°)
  const gtfRel = 1 / (1 + Math.exp(-(inclination - 6.5) * 1.5)); // GTF gets better with inclination
  const mtfRel = 1 / (1 + Math.exp((inclination - 6.5) * 1.5));  // MTF gets worse with inclination
  
  // Crossover weight (0 = full MTF, 1 = full GTF)
  const crossoverWeight = gtfRel / Math.max(gtfRel + mtfRel, 0.001);
  
  // Determine recommended mode
  let recommendedMode: 'gtf' | 'mtf' | 'crossover';
  if (inclination >= 8) recommendedMode = 'gtf';
  else if (inclination <= 5) recommendedMode = 'mtf';
  else recommendedMode = 'crossover';
  
  // Blended toolface: weighted average of GTF and MTF (GTF may need correction)
  const gtfCorrected = gtfRaw; // GTF is directly referenced to high side
  let mtfCorrected = mtfRaw + declination * Math.cos(inclination * degToRad);
  while (mtfCorrected >= 360) mtfCorrected -= 360;
  while (mtfCorrected < 0) mtfCorrected += 360;
  
  const blendedTF = gtfCorrected * crossoverWeight + mtfCorrected * (1 - crossoverWeight);
  
  // Uncertainty: 1° at pure GTF, 5° at pure MTF (magnetic noise)
  const uncertainty = 1 + 4 * (1 - crossoverWeight);
  
  return {
    inclination,
    recommendedMode,
    gtfReliability: Math.round(gtfRel * 1000) / 1000,
    mtfReliability: Math.round(mtfRel * 1000) / 1000,
    crossoverWeight: Math.round(crossoverWeight * 1000) / 1000,
    blendedToolface: Math.round(blendedTF * 10) / 10,
    gtfValue: Math.round(gtfCorrected * 10) / 10,
    mtfValue: Math.round(mtfCorrected * 10) / 10,
    uncertainty: Math.round(uncertainty * 100) / 100
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ENHANCED: DLS Target Envelope & Build-Rate Feasibility
// ═══════════════════════════════════════════════════════════════════════════

export interface DLSEnvelopeResult {
  stations: { md: number; dls: number; targetDLS: number; minDLS: number; maxDLS: number; insideEnvelope: boolean; exceedance: number }[];
  peakExceedance: number;
  exceedanceCount: number;
  envelopeWidth: number;   // ±° range around target
  percentInside: number;
  motorCapabilityOK: boolean;
  rssCapabilityOK: boolean;
}

/**
 * calculateDLSEnvelope
 * Evaluates achieved DLS against a target ± tolerance envelope
 * along the wellbore. Flags exceedances for steering correction.
 */
export function calculateDLSEnvelope(
  stations: { md: number; dls: number }[],
  targetDLS: number,
  tolerance: number = 0.5,   // ±° tolerance
  motorDLSMax: number = 12,  // motor capability
  rssDLSMax: number = 8      // RSS capability
): DLSEnvelopeResult {
  const envStations = stations.map(st => {
    const insideEnvelope = Math.abs(st.dls - targetDLS) <= tolerance;
    const exceedance = Math.max(0, Math.abs(st.dls - targetDLS) - tolerance);
    return {
      md: st.md,
      dls: Math.round(st.dls * 100) / 100,
      targetDLS,
      minDLS: Math.round((targetDLS - tolerance) * 100) / 100,
      maxDLS: Math.round((targetDLS + tolerance) * 100) / 100,
      insideEnvelope,
      exceedance: Math.round(exceedance * 100) / 100
    };
  });
  
  const exceedances = envStations.filter(s => !s.insideEnvelope);
  const peakExceedance = exceedances.length > 0
    ? Math.max(...exceedances.map(s => s.exceedance))
    : 0;
  
  return {
    stations: envStations,
    peakExceedance: Math.round(peakExceedance * 100) / 100,
    exceedanceCount: exceedances.length,
    envelopeWidth: tolerance,
    percentInside: Math.round((envStations.filter(s => s.insideEnvelope).length / envStations.length) * 1000) / 10,
    motorCapabilityOK: targetDLS <= motorDLSMax,
    rssCapabilityOK: targetDLS <= rssDLSMax
  };
}

/**
 * Helper: confidence level to k-factor
 */
function confidenceToKFactor(conf: number): number {
  const confMap: Record<number, number> = {
    39.3: 0.5, 50: 0.674, 68.27: 1.0, 80: 1.282,
    90: 1.645, 95: 1.96, 95.45: 2.0, 99: 2.576, 99.73: 3.0
  };
  if (confMap[Math.round(conf)]) return confMap[Math.round(conf)];
  if (confMap[Math.round(conf * 10) / 10]) return confMap[Math.round(conf * 10) / 10];
  // Interpolate
  return 0.674 + (conf - 50) / 45 * 1.902;
}

/**
 * calculateTravelingCylinder
 * Simplified traveling-cylinder anti-collision scan between two wells.
 * At each reference well station, finds the closest offset station
 * and computes the EOU-based separation factor.
 */
export function calculateTravelingCylinder(
  refWell: { md: number; tvd: number; n: number; e: number; inc: number; azi: number }[],
  offWell: { md: number; tvd: number; n: number; e: number; inc: number; azi: number }[],
  refEOUF: number = 0.005,
  offEOUF: number = 0.005,
  k: number = 2.447
): TravelingCylinderStation[] {
  const res: TravelingCylinderStation[] = [];
  for (let ri = 0; ri < refWell.length; ri++) {
    const rc = refWell[ri];
    let bestSep = Infinity;
    let bestOI = 0;
    for (let oi = 0; oi < offWell.length; oi++) {
      const oc = offWell[oi];
      const sep = Math.sqrt(
        (rc.n - oc.n) ** 2 + (rc.e - oc.e) ** 2 + (rc.tvd - oc.tvd) ** 2
      );
      if (sep < bestSep) {
        bestSep = sep;
        bestOI = oi;
      }
    }
    const rSM = rc.md * refEOUF * k;
    const rSm = rSM * 0.45;
    const oSM = offWell[bestOI].md * offEOUF * k;
    const oSm = oSM * 0.45;
    const combEOU = rSM + oSM;
    const sf = bestSep / Math.max(combEOU, 0.01);
    let rf: 'safe' | 'warning' | 'critical';
    if (sf >= 2.0) rf = 'safe';
    else if (sf >= 1.0) rf = 'warning';
    else rf = 'critical';
    res.push({
      md: rc.md,
      centerToCenter: Math.round(bestSep * 10) / 10,
      combinedEOU: Math.round(combEOU * 10) / 10,
      separationFactor: Math.round(sf * 1000) / 1000,
      refSemiMajor: Math.round(rSM * 10) / 10,
      refSemiMinor: Math.round(rSm * 10) / 10,
      offsetSemiMajor: Math.round(oSM * 10) / 10,
      offsetSemiMinor: Math.round(oSm * 10) / 10,
      riskFlag: rf
    });
  }
  return res;
}
