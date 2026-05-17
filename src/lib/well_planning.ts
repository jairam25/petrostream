/**
 * ─── Exploration Well Planning & Decision Gate ───
 * Sub-Step 1.6 — PetroStream Simulation Suite
 *
 * Covers: well location optimization, trajectory design, prognosed stratigraphy,
 * pore pressure & fracture gradient (Eaton), casing design (API 5C3),
 * mud weight program, logging program, coring/fluid sampling,
 * AFE cost estimation, risk assessment, FID decision tree, regulatory readiness.
 *
 * References:
 *   - Eaton (1975) — Pore pressure from seismic velocity
 *   - Matthews & Kelly (1967) — Fracture gradient
 *   - API 5C3 — Casing burst/collapse design
 *   - SPE 199072 — Anti-collision / risk matrix methodology
 *   - Childs et al. (2017) — Fault damage zone scaling
 *   - BSEE 30 CFR 250 — Regulatory requirements
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type WellTrajectoryType = 'vertical' | 'deviated' | 'horizontal';

export interface WellLocation {
  latitude: number;
  longitude: number;
  waterDepthFt: number;
  kellyBushingElevationFt: number;
}

export interface FaultBoundary {
  name: string;
  faultX1: number;
  faultY1: number;
  faultX2: number;
  faultY2: number;
  throwFt: number;
  sealingPotential: 'good' | 'moderate' | 'poor';
}

export interface SurfaceConstraint {
  type: 'pipeline' | 'platform' | 'environmental' | 'infrastructure' | 'shipping_lane';
  centerX: number;
  centerY: number;
  radiusFt: number;
  description: string;
}

export interface OptimalLocationResult {
  optimalX: number;
  optimalY: number;
  crestalX: number;
  crestalY: number;
  distanceToFaultFt: number;
  faultRiskCategory: 'low' | 'moderate' | 'high' | 'critical';
  surfaceConstraintScore: number;
  overallViabilityScore: number;
  recommendation: string;
}

export interface TrajectoryDesign {
  type: WellTrajectoryType;
  kopDepthFt: number;
  buildRateDegPer100ft: number;
  targetTvdFt: number;
  targetDepartureFt: number;
  tangentAngleDeg: number;
  totalMeasuredDepthFt: number;
  horizontalSectionFt: number;
  trajectoryPoints: { md: number; tvd: number; departure: number; inclination: number; azimuth: number }[];
}

export interface FormationTop {
  name: string;
  depthTvdFt: number;
  thicknessFt: number;
  lithology: string;
  velocityFtPerS: number;
  densityGPerCc: number;
  porosityFraction: number;
}

export interface StratigraphyPrognosis {
  formationTops: FormationTop[];
  prognosisConfidence: number;
  keyMarkerBeds: { name: string; depthFt: number; seismicAmplitude: string }[];
  drillingHazards: string[];
}

export interface PorePressureResult {
  depthFt: number;
  porePressurePpg: number;
  fractureGradientPpg: number;
  overburdenPpg: number;
  effectiveStressPsi: number;
  mudWindowMinPpg: number;
  mudWindowMaxPpg: number;
  kickToleranceBbl: number;
}

export interface PorePressureProfile {
  points: PorePressureResult[];
  eatonExponent: number;
  normalCompactionTrendFtPerS: number;
  prognosisConfidence: number;
  shallowHazards: string[];
}

export interface CasingString {
  name: string;
  odIn: number;
  weightLbPerFt: number;
  grade: string;
  topDepthFt: number;
  shoeDepthFt: number;
  burstRatingPsi: number;
  collapseRatingPsi: number;
  axialRatingKlb: number;
  connectionType: string;
  driftIn: number;
}

export interface CasingProgram {
  strings: CasingString[];
  designFactor: number;
  totalCasingCostUsd: number;
  triaxialSafetyFactors: { vme: number; burst: number; collapse: number }[];
}

export interface MudWeightSchedule {
  section: string;
  depthFromFt: number;
  depthToFt: number;
  mudWeightPpg: number;
  ecdPpg: number;
  yieldPointLbPer100ft2: number;
  plasticViscosityCp: number;
  wellboreStability: 'stable' | 'moderate' | 'unstable';
  recommendedInhibitor: string;
}

export interface WirelineLog {
  tool: string;
  acronym: string;
  measures: string;
  costPerFt: number;
  runDays: number;
  conveyance: 'wireline' | 'lwd' | 'pipe-conveyed';
}

export interface LoggingProgram {
  logs: WirelineLog[];
  totalCostUsd: number;
  totalRunDays: number;
  depthIntervalTopFt: number;
  depthIntervalBaseFt: number;
  operationalRisks: string[];
}

export interface CoringInterval {
  depthTopFt: number;
  depthBaseFt: number;
  coreType: 'conventional' | 'sidewall' | 'pressure';
  objective: string;
  expectedRecoveryPct: number;
  costPerFt: number;
}

export interface FluidSamplePoint {
  depthFt: number;
  tool: 'MDT' | 'RFT' | 'DST';
  objectives: string[];
  estimatedPumpTimeHr: number;
  costUsd: number;
}

export interface AFEBreakdownItem {
  item: string;
  category: 'tangible' | 'intangible' | 'service' | 'logistics' | 'contingency' | 'regulatory';
  cost: number;
  depthDependent: boolean;
  notes: string;
}

export interface AFEResult {
  totalCostUsd: number;
  breakdown: AFEBreakdownItem[];
  contingencyUsd: number;
  contingencyPct: number;
  dryHoleCostUsd: number;
  drillingDays: number;
  spreadRateUsdPerDay: number;
}

export interface RiskItem {
  id: string;
  category: 'geological' | 'operational' | 'mechanical' | 'HSE' | 'commercial';
  description: string;
  likelihood: number; // 1-5
  consequence: number; // 1-5
  riskScore: number; // L×C
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  mitigation: string;
  residualLikelihood: number;
  residualConsequence: number;
  residualScore: number;
}

export interface RiskAssessment {
  matrix: RiskItem[];
  overallRiskScore: number;
  topRisks: RiskItem[];
  probabilityOfSuccess: number; // Pg
  certaintyBand: 'P10' | 'P50' | 'P90';
}

export interface DecisionTreeNode {
  id: string;
  label: string;
  type: 'decision' | 'chance' | 'terminal';
  probability?: number;
  npvUsd?: number;
  capexUsd?: number;
  children: DecisionTreeNode[];
}

export interface FIDResult {
  recommendation: 'drill' | 'defer' | 'farmout' | 'drop';
  emvUsd: number;
  expectedNpvUsd: number;
  irrPct: number;
  voIUsd: number;
  hurdleRatePct: number;
  confidenceLevel: 'high' | 'moderate' | 'low';
  decisionTree: DecisionTreeNode;
}

export interface RegulatoryStatus {
  jurisdiction: string;
  permitsRequired: string[];
  permitsObtained: string[];
  permitTimelineDays: number;
  environmentalAssessment: 'EIS' | 'EA' | 'CE' | 'exempt';
  complianceScore: number;
  outstandingRequirements: string[];
  estimatedApprovalDate: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// WELL LOCATION OPTIMIZATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate optimal crestal position using 3-point interpolation.
 * Input: three structural points with depths; finds the highest structural point.
 */
export function calculateOptimalCrestalPosition(
  points: { x: number; y: number; depthFt: number }[]
): { crestalX: number; crestalY: number; crestalDepthFt: number; quality: string } {
  const sorted = [...points].sort((a, b) => a.depthFt - b.depthFt);
  const shallowest = sorted[0];
  const deepest = sorted[sorted.length - 1];
  const relief = deepest.depthFt - shallowest.depthFt;

  // Weighted centroid toward shallower points
  let weightedX = 0;
  let weightedY = 0;
  let totalWeight = 0;
  for (const p of points) {
    const weight = 1 / Math.max(p.depthFt - shallowest.depthFt + 100, 100);
    weightedX += p.x * weight;
    weightedY += p.y * weight;
    totalWeight += weight;
  }

  const quality = relief > 500 ? 'Strong closure' : relief > 200 ? 'Moderate relief' : 'Low relief';

  return {
    crestalX: weightedX / totalWeight,
    crestalY: weightedY / totalWeight,
    crestalDepthFt: shallowest.depthFt,
    quality,
  };
}

/**
 * Assess risk from fault proximity using damage zone scaling.
 * Childs et al. (2017): damage zone width ≈ throwFt × 0.1 to 0.3
 */
export function assessFaultProximityRisk(
  wellX: number,
  wellY: number,
  faults: FaultBoundary[]
): {
  nearestFaultName: string;
  distanceToNearestFt: number;
  riskCategory: 'low' | 'moderate' | 'high' | 'critical';
  damageZoneRadiusFt: number;
  withinDamageZone: boolean;
} {
  let minDist = Infinity;
  let nearestFault: FaultBoundary = faults[0];

  for (const fault of faults) {
    // Distance from point to line segment
    const dx = fault.faultX2 - fault.faultX1;
    const dy = fault.faultY2 - fault.faultY1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) {
      const dist = Math.sqrt((wellX - fault.faultX1) ** 2 + (wellY - fault.faultY1) ** 2);
      if (dist < minDist) { minDist = dist; nearestFault = fault; }
      continue;
    }
    let t = ((wellX - fault.faultX1) * dx + (wellY - fault.faultY1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const projX = fault.faultX1 + t * dx;
    const projY = fault.faultY1 + t * dy;
    const dist = Math.sqrt((wellX - projX) ** 2 + (wellY - projY) ** 2);
    if (dist < minDist) { minDist = dist; nearestFault = fault; }
  }

  const damageZoneRadiusFt = nearestFault.throwFt * 0.15;

  let riskCategory: 'low' | 'moderate' | 'high' | 'critical';
  if (minDist < damageZoneRadiusFt * 0.5) riskCategory = 'critical';
  else if (minDist < damageZoneRadiusFt) riskCategory = 'high';
  else if (minDist < damageZoneRadiusFt * 2) riskCategory = 'moderate';
  else riskCategory = 'low';

  return {
    nearestFaultName: nearestFault?.name || 'Unknown',
    distanceToNearestFt: minDist,
    riskCategory,
    damageZoneRadiusFt,
    withinDamageZone: minDist < damageZoneRadiusFt,
  };
}

/**
 * Evaluate surface accessibility constraints.
 */
export function evaluateSurfaceConstraints(
  wellX: number,
  wellY: number,
  constraints: SurfaceConstraint[]
): {
  conflicts: SurfaceConstraint[];
  clearanceScore: number; // 0-100
  requiresRelocation: boolean;
  relocationSuggestion: { x: number; y: number } | null;
} {
  const conflicts: SurfaceConstraint[] = [];
  let clearanceScore = 100;

  for (const c of constraints) {
    const dist = Math.sqrt((wellX - c.centerX) ** 2 + (wellY - c.centerY) ** 2);
    if (dist < c.radiusFt) {
      conflicts.push(c);
      clearanceScore -= 25;
    }
  }

  clearanceScore = Math.max(0, clearanceScore);

  let relocationSuggestion: { x: number; y: number } | null = null;
  if (conflicts.length > 0) {
    // Suggest moving away from the largest constraint
    const largest = conflicts.reduce((a, b) => a.radiusFt > b.radiusFt ? a : b);
    const dx = wellX - largest.centerX;
    const dy = wellY - largest.centerY;
    const currentDist = Math.sqrt(dx * dx + dy * dy);
    if (currentDist > 0) {
      const safeDist = largest.radiusFt * 1.2;
      relocationSuggestion = {
        x: largest.centerX + (dx / currentDist) * safeDist,
        y: largest.centerY + (dy / currentDist) * safeDist,
      };
    }
  }

  return { conflicts, clearanceScore, requiresRelocation: conflicts.length > 0, relocationSuggestion };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRAJECTORY DESIGN
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Design exploration well trajectory (vertical, deviated, or horizontal).
 * Constant-curvature build section, tangent section, optional horizontal section.
 */
export function designExplorationTrajectory(
  kopDepthFt: number,
  buildRateDegPer100ft: number,
  targetTvdFt: number,
  tangentAngleDeg: number,
  horizontalTargetFt: number,
  type: WellTrajectoryType
): TrajectoryDesign {
  const buildRadiusFt = (180 / Math.PI) * (100 / buildRateDegPer100ft);
  const tangentAngleRad = tangentAngleDeg * Math.PI / 180;

  let totalMdFt: number;
  let horizontalSectionFt: number;
  const trajectoryPoints: TrajectoryDesign['trajectoryPoints'] = [];

  if (type === 'vertical') {
    totalMdFt = targetTvdFt;
    horizontalSectionFt = 0;
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const md = (i / steps) * totalMdFt;
      trajectoryPoints.push({ md, tvd: md, departure: 0, inclination: 0, azimuth: 0 });
    }
  } else {
    // Build section
    const buildEndTvd = kopDepthFt + buildRadiusFt * Math.sin(tangentAngleRad);
    const buildEndDeparture = buildRadiusFt * (1 - Math.cos(tangentAngleRad));
    const buildMd = kopDepthFt + (tangentAngleDeg / buildRateDegPer100ft) * 100;

    let remainingTvd = targetTvdFt - buildEndTvd;
    if (type === 'horizontal' && remainingTvd < 0) {
      remainingTvd = 0;
    }

    const tangentLengthFt = remainingTvd / Math.cos(tangentAngleRad);
    const tangentDeparture = tangentLengthFt * Math.sin(tangentAngleRad);

    if (type === 'horizontal') {
      horizontalSectionFt = horizontalTargetFt > 0 ? horizontalTargetFt : 2000;
      totalMdFt = buildMd + tangentLengthFt + horizontalSectionFt;
    } else {
      horizontalSectionFt = 0;
      totalMdFt = buildMd + tangentLengthFt;
    }

    // Generate trajectory points
    const numPoints = 50;
    for (let i = 0; i <= numPoints; i++) {
      const md = (i / numPoints) * totalMdFt;
      let tvd: number;
      let departure: number;
      let inclination: number;

      if (md <= kopDepthFt) {
        // Vertical section
        tvd = md;
        departure = 0;
        inclination = 0;
      } else if (md <= buildMd) {
        // Build section (constant curvature)
        const incRad = ((md - kopDepthFt) / 100) * buildRateDegPer100ft * Math.PI / 180;
        inclination = (incRad * 180) / Math.PI;
        tvd = kopDepthFt + buildRadiusFt * Math.sin(incRad);
        departure = buildRadiusFt * (1 - Math.cos(incRad));
      } else if (type === 'horizontal' && md > buildMd + tangentLengthFt) {
        // Horizontal section
        tvd = buildEndTvd + remainingTvd;
        departure = buildEndDeparture + tangentDeparture + (md - buildMd - tangentLengthFt);
        inclination = 90;
      } else {
        // Tangent section
        const tanMd = md - buildMd;
        tvd = buildEndTvd + tanMd * Math.cos(tangentAngleRad);
        departure = buildEndDeparture + tanMd * Math.sin(tangentAngleRad);
        inclination = tangentAngleDeg;
      }

      trajectoryPoints.push({ md, tvd, departure, inclination, azimuth: 0 });
    }
  }

  return {
    type,
    kopDepthFt,
    buildRateDegPer100ft,
    targetTvdFt,
    targetDepartureFt: trajectoryPoints[trajectoryPoints.length - 1]?.departure || 0,
    tangentAngleDeg,
    totalMeasuredDepthFt: totalMdFt,
    horizontalSectionFt,
    trajectoryPoints,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROGNOSED STRATIGRAPHY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Prognose formation tops from seismic velocity model and offset well data.
 * Uses Dix-converted interval velocities to bound expected formation tops.
 */
export function prognoseFormationTops(
  velocityLayers: { intervalVelocityFtPerS: number; thicknessFt: number; formationName: string; lithology: string; porosity: number }[],
  confidenceFactor: number // 0-1 based on seismic quality
): StratigraphyPrognosis {
  const formationTops: FormationTop[] = [];
  let cumulativeDepth = 0;
  const keyMarkerBeds: StratigraphyPrognosis['keyMarkerBeds'] = [];
  const drillingHazards: string[] = [];

  for (const layer of velocityLayers) {
    const topDepth = cumulativeDepth;
    cumulativeDepth += layer.thicknessFt;

    const density = 1.6 + (layer.intervalVelocityFtPerS - 5000) * 0.00025; // Gardner relation

    formationTops.push({
      name: layer.formationName,
      depthTvdFt: topDepth,
      thicknessFt: layer.thicknessFt,
      lithology: layer.lithology,
      velocityFtPerS: layer.intervalVelocityFtPerS,
      densityGPerCc: Math.max(1.8, Math.min(2.85, density)),
      porosityFraction: layer.porosity,
    });

    // Identify key markers and hazards
    if (layer.lithology.includes('shale') && layer.thicknessFt > 500) {
      keyMarkerBeds.push({
        name: `${layer.formationName} (regional seal)`,
        depthFt: topDepth + layer.thicknessFt / 2,
        seismicAmplitude: 'High amplitude top seal',
      });
    }

    if (layer.lithology.includes('salt')) {
      drillingHazards.push(`Salt section at ${layer.formationName}: salt creep, washout risk, mud weight adjustment needed`);
    }
    if (layer.lithology.includes('carbonate') && layer.porosity > 0.15) {
      drillingHazards.push(`Vuggy/fractured carbonate at ${layer.formationName}: potential lost circulation zone (${(layer.porosity * 100).toFixed(0)}% porosity)`);
    }
  }

  return {
    formationTops,
    prognosisConfidence: confidenceFactor,
    keyMarkerBeds,
    drillingHazards,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PORE PRESSURE & FRACTURE GRADIENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Eaton (1975) pore pressure estimation from seismic velocity.
 * PP = OBG - (OBG - Pn) * (Vobs / Vnct)^n
 */
export function estimatePorePressureEaton(
  depthFt: number,
  intervalVelocityFtPerS: number,
  normalCompactionTrendFtPerS: number,
  eatonExponent: number,
  overburdenGradientPsiPerFt: number
): {
  porePressureGradientPsg: number;
  effectiveStressPsi: number;
  porePressurePpg: number;
  overburdenPpg: number;
} {
  const overburdenPsi = overburdenGradientPsiPerFt * depthFt;
  const overburdenPpg = overburdenPsi / 0.052 / depthFt;

  const normalHydrostatic = 8.6; // ppg normal pressure
  const normalPressurePsi = 0.052 * normalHydrostatic * depthFt;

  const velRatio = intervalVelocityFtPerS / normalCompactionTrendFtPerS;
  const ppPsi = overburdenPsi - (overburdenPsi - normalPressurePsi) * Math.pow(velRatio, eatonExponent);

  const porePressureGradientPsg = ppPsi / depthFt;
  const porePressurePpg = ppPsi / 0.052 / depthFt;
  const effectiveStressPsi = overburdenPsi - ppPsi;

  return { porePressureGradientPsg, effectiveStressPsi, porePressurePpg, overburdenPpg };
}

/**
 * Matthews & Kelly (1967) — Fracture Gradient
 * FG = (σv - Pp) × (ν / (1 - ν)) / D + Pp/D
 */
export function calculateFractureGradientMatthewsKelly(
  depthFt: number,
  porePressurePsi: number,
  overburdenPsi: number,
  poissonsRatio: number
): number {
  const effectiveStress = overburdenPsi - porePressurePsi;
  const matrixStress = effectiveStress * (poissonsRatio / (1 - poissonsRatio));
  const fracPsi = matrixStress + porePressurePsi;
  return fracPsi / 0.052 / depthFt; // ppg
}

/**
 * Build a full pore pressure and fracture gradient profile.
 */
export function buildPorePressureProfile(
  depthIntervalFt: number,
  maxDepthFt: number,
  velocityProfileFtPerS: number[],
  normalCompactionTrendFtPerS: number,
  eatonExponent: number,
  overburdenGradientPsiPerFt: number,
  poissonsRatio: number
): PorePressureProfile {
  const numPoints = velocityProfileFtPerS.length;
  const points: PorePressureResult[] = [];
  const shallowHazards: string[] = [];

  for (let i = 0; i < numPoints; i++) {
    const depthFt = depthIntervalFt * i;
    if (depthFt > maxDepthFt) break;

    const vel = velocityProfileFtPerS[i];
    const { porePressurePpg, overburdenPpg } = estimatePorePressureEaton(
      depthFt, vel, normalCompactionTrendFtPerS, eatonExponent, overburdenGradientPsiPerFt
    );

    const obPsi = overburdenGradientPsiPerFt * depthFt;
    const ppPsi = porePressurePpg * 0.052 * depthFt;
    const fgPpg = calculateFractureGradientMatthewsKelly(depthFt, ppPsi, obPsi, poissonsRatio);

    const mudWindowMinPpg = porePressurePpg + 0.5; // 0.5 ppg margin
    const mudWindowMaxPpg = fgPpg - 0.5; // ECD margin
    const kickToleranceBbl = ((fgPpg - porePressurePpg - 1.0) * 0.052 * depthFt) / (0.052 * depthFt) * 50;

    points.push({
      depthFt,
      porePressurePpg,
      fractureGradientPpg: fgPpg,
      overburdenPpg,
      effectiveStressPsi: obPsi - ppPsi,
      mudWindowMinPpg,
      mudWindowMaxPpg,
      kickToleranceBbl: Math.max(5, kickToleranceBbl),
    });

    // Shallow hazard detection
    if (depthFt < 3000 && porePressurePpg > 10) {
      shallowHazards.push(`Shallow overpressure at ${depthFt.toFixed(0)} ft: ${porePressurePpg.toFixed(1)} ppg`);
    }
  }

  return {
    points,
    eatonExponent,
    normalCompactionTrendFtPerS,
    prognosisConfidence: 0.75,
    shallowHazards,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CASING DESIGN
// ═══════════════════════════════════════════════════════════════════════════════

const CASING_GRADE_DATABASE: { grade: string; minYieldKsi: number; minTensileKsi: number }[] = [
  { grade: 'H-40', minYieldKsi: 40, minTensileKsi: 60 },
  { grade: 'K-55', minYieldKsi: 55, minTensileKsi: 95 },
  { grade: 'N-80', minYieldKsi: 80, minTensileKsi: 100 },
  { grade: 'L-80', minYieldKsi: 80, minTensileKsi: 95 },
  { grade: 'C-90', minYieldKsi: 90, minTensileKsi: 100 },
  { grade: 'T-95', minYieldKsi: 95, minTensileKsi: 105 },
  { grade: 'P-110', minYieldKsi: 110, minTensileKsi: 125 },
  { grade: 'Q-125', minYieldKsi: 125, minTensileKsi: 135 },
];

/**
 * Calculate burst rating per API 5C3.
 */
export function calculateBurstLoad(
  odIn: number,
  wallIn: number,
  gradeMinYieldKsi: number,
  designFactor: number
): number {
  const burstPsi = (2 * gradeMinYieldKsi * 1000 * wallIn) / odIn;
  return burstPsi / designFactor;
}

/**
 * Calculate collapse rating per API 5C3 (simplified).
 */
export function calculateCollapseLoad(
  odIn: number,
  wallIn: number,
  gradeMinYieldKsi: number,
  designFactor: number
): number {
  // Plastic collapse for D/t range 14-25 (simplified Barlow)
  const dOverT = odIn / wallIn;
  const YP = gradeMinYieldKsi * 1000;
  let collapsePsi: number;
  if (dOverT <= 14) {
    collapsePsi = YP * ((dOverT - 1) / (dOverT * dOverT));
  } else {
    collapsePsi = YP * ((1.5 / (dOverT * dOverT)) + (0.0375 / dOverT));
  }
  return Math.min(collapsePsi, YP) / designFactor;
}

/**
 * Design full casing program for exploration well.
 */
export function designCasingProgram(
  conductorDepthFt: number,
  surfaceDepthFt: number,
  intermediateDepthFt: number,
  productionDepthFt: number,
  maxPorePressurePpg: number,
  maxFracGradientPpg: number,
  designFactor: number
): CasingProgram {
  const strings: CasingString[] = [
    {
      name: 'Conductor',
      odIn: 30,
      weightLbPerFt: 310,
      grade: 'H-40',
      topDepthFt: 0,
      shoeDepthFt: conductorDepthFt,
      burstRatingPsi: calculateBurstLoad(30, 1.00, 40, designFactor),
      collapseRatingPsi: calculateCollapseLoad(30, 1.00, 40, designFactor),
      axialRatingKlb: 40 * 1.00 * Math.PI * 30 / 1000,
      connectionType: 'Drive pipe / weld',
      driftIn: 28,
    },
    {
      name: 'Surface',
      odIn: 20,
      weightLbPerFt: 133,
      grade: 'K-55',
      topDepthFt: 0,
      shoeDepthFt: surfaceDepthFt,
      burstRatingPsi: calculateBurstLoad(20, 0.635, 55, designFactor),
      collapseRatingPsi: calculateCollapseLoad(20, 0.635, 55, designFactor),
      axialRatingKlb: 55 * 0.635 * Math.PI * 20 / 1000,
      connectionType: 'BTC',
      driftIn: 18.73,
    },
    {
      name: 'Intermediate',
      odIn: 13.375,
      weightLbPerFt: 72,
      grade: maxPorePressurePpg > 14 ? 'P-110' : 'N-80',
      topDepthFt: surfaceDepthFt - 200,
      shoeDepthFt: intermediateDepthFt,
      burstRatingPsi: calculateBurstLoad(13.375, 0.514, maxPorePressurePpg > 14 ? 110 : 80, designFactor),
      collapseRatingPsi: calculateCollapseLoad(13.375, 0.514, maxPorePressurePpg > 14 ? 110 : 80, designFactor),
      axialRatingKlb: (maxPorePressurePpg > 14 ? 110 : 80) * 0.514 * Math.PI * 13.375 / 1000,
      connectionType: 'BTC',
      driftIn: 12.347,
    },
    {
      name: 'Production',
      odIn: 9.625,
      weightLbPerFt: 53.5,
      grade: maxPorePressurePpg > 15 ? 'Q-125' : maxPorePressurePpg > 13 ? 'P-110' : 'L-80',
      topDepthFt: intermediateDepthFt - 300,
      shoeDepthFt: productionDepthFt,
      burstRatingPsi: calculateBurstLoad(9.625, 0.545, maxPorePressurePpg > 15 ? 125 : maxPorePressurePpg > 13 ? 110 : 80, designFactor),
      collapseRatingPsi: calculateCollapseLoad(9.625, 0.545, maxPorePressurePpg > 15 ? 125 : maxPorePressurePpg > 13 ? 110 : 80, designFactor),
      axialRatingKlb: (maxPorePressurePpg > 15 ? 125 : maxPorePressurePpg > 13 ? 110 : 80) * 0.545 * Math.PI * 9.625 / 1000,
      connectionType: 'Premium',
      driftIn: 8.535,
    },
  ];

  const totalCasingCostUsd = strings.reduce((sum, s) => {
    const length = s.shoeDepthFt - s.topDepthFt;
    return sum + length * s.weightLbPerFt * 2.5; // ~$2.50/lb installed
  }, 0);

  const triaxialSafetyFactors = strings.map(s => ({
    vme: s.burstRatingPsi / (maxPorePressurePpg * 0.052 * s.shoeDepthFt),
    burst: s.burstRatingPsi / (maxPorePressurePpg * 0.052 * s.shoeDepthFt),
    collapse: s.collapseRatingPsi / (maxFracGradientPpg * 0.052 * s.shoeDepthFt),
  }));

  return { strings, designFactor, totalCasingCostUsd, triaxialSafetyFactors };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MUD WEIGHT PROGRAM
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate mud weight schedule for each hole section.
 */
export function calculateMudWeightSchedule(
  sections: { name: string; from: number; to: number; porePressurePpg: number; fracGradientPpg: number }[]
): MudWeightSchedule[] {
  return sections.map((s, i) => {
    const mwPpg = s.porePressurePpg + 0.5; // 0.5 ppg trip margin
    const ecdPpg = mwPpg * 1.03; // 3% ECD addition
    const wellboreStability: 'stable' | 'moderate' | 'unstable' =
      s.fracGradientPpg - mwPpg > 3 ? 'stable' : s.fracGradientPpg - mwPpg > 1.5 ? 'moderate' : 'unstable';

    let recommendedInhibitor = 'KCl (3-5%) basic inhibition';
    if (s.porePressurePpg > 12) recommendedInhibitor = 'KCl + Polymer (glycol/PHPA)';
    if (s.porePressurePpg > 15) recommendedInhibitor = 'OBM (synthetic) — high inhibition needed';

    return {
      section: s.name,
      depthFromFt: s.from,
      depthToFt: s.to,
      mudWeightPpg: mwPpg,
      ecdPpg,
      yieldPointLbPer100ft2: 10 + s.porePressurePpg * 1.5,
      plasticViscosityCp: 8 + s.porePressurePpg * 1.2,
      wellboreStability,
      recommendedInhibitor,
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING PROGRAM
// ═══════════════════════════════════════════════════════════════════════════════

const WIRELINE_LOG_DATABASE: Omit<WirelineLog, 'depthIntervalTopFt' | 'depthIntervalBaseFt'>[] = [
  { tool: 'Gamma Ray (GR)', acronym: 'GR', measures: 'Natural radioactivity, shale volume', costPerFt: 2.50, runDays: 0.5, conveyance: 'wireline' },
  { tool: 'Dual Laterolog', acronym: 'DLL', measures: 'Deep/shallow resistivity, invasion profile', costPerFt: 4.00, runDays: 0.5, conveyance: 'wireline' },
  { tool: 'Density-Neutron', acronym: 'RHOB/NPHI', measures: 'Bulk density, neutron porosity', costPerFt: 4.50, runDays: 0.5, conveyance: 'wireline' },
  { tool: 'Sonic (DSI)', acronym: 'DT', measures: 'Compressional/shear velocity, mechanical properties', costPerFt: 5.00, runDays: 0.5, conveyance: 'wireline' },
  { tool: 'Formation MicroImager', acronym: 'FMI', measures: 'High-res resistivity image, fractures, bedding', costPerFt: 12.00, runDays: 0.8, conveyance: 'wireline' },
  { tool: 'Sidewall Cores', acronym: 'SWC', measures: 'Rotary sidewall samples for lithology', costPerFt: 8.00, runDays: 1.0, conveyance: 'wireline' },
];

/**
 * Plan wireline logging suite for exploration well.
 */
export function planWirelineLoggingSuite(
  depthTopFt: number,
  depthBaseFt: number,
  includeFMI: boolean,
  includeCores: boolean
): LoggingProgram {
  const intervalFt = depthBaseFt - depthTopFt;
  const logs = WIRELINE_LOG_DATABASE
    .filter(l => {
      if (l.acronym === 'FMI' && !includeFMI) return false;
      if (l.acronym === 'SWC' && !includeCores) return false;
      return true;
    })
    .map(l => ({ ...l, depthIntervalTopFt: depthTopFt, depthIntervalBaseFt: depthBaseFt }));

  const totalCostUsd = logs.reduce((sum, l) => sum + l.costPerFt * intervalFt, 0);
  const totalRunDays = logs.reduce((sum, l) => sum + l.runDays, 0);

  const operationalRisks: string[] = [];
  if (intervalFt > 5000) operationalRisks.push('Long logging interval: tool sticking risk');
  if (includeFMI) operationalRisks.push('FMI requires conductive mud system (water-based)');

  return { logs, totalCostUsd, totalRunDays, depthIntervalTopFt: depthTopFt, depthIntervalBaseFt: depthBaseFt, operationalRisks };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORING & FLUID SAMPLING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Plan coring program.
 */
export function planCoringProgram(
  coreIntervals: { topFt: number; baseFt: number; type: CoringInterval['coreType']; objective: string }[]
): { intervals: CoringInterval[]; totalCostUsd: number; totalCoreFt: number } {
  const intervals: CoringInterval[] = coreIntervals.map(c => {
    const baseCost = c.type === 'conventional' ? 350 : c.type === 'sidewall' ? 200 : 1200;
    const expectedRecovery = c.type === 'conventional' ? 90 : c.type === 'sidewall' ? 70 : 95;
    const length = c.baseFt - c.topFt;
    return {
      depthTopFt: c.topFt,
      depthBaseFt: c.baseFt,
      coreType: c.type,
      objective: c.objective,
      expectedRecoveryPct: expectedRecovery,
      costPerFt: baseCost,
    };
  });

  const totalCostUsd = intervals.reduce((sum, int) => sum + int.costPerFt * (int.depthBaseFt - int.depthTopFt), 0);
  const totalCoreFt = intervals.reduce((sum, int) => sum + (int.depthBaseFt - int.depthTopFt), 0);

  return { intervals, totalCostUsd, totalCoreFt };
}

/**
 * Plan fluid sampling program (MDT/RFT/DST).
 */
export function planFluidSampling(
  samplePoints: { depthFt: number; tool: FluidSamplePoint['tool'] }[]
): { points: FluidSamplePoint[]; totalCostUsd: number; totalTimeHr: number } {
  const points: FluidSamplePoint[] = samplePoints.map(p => {
    const pumpTimeHr = p.tool === 'DST' ? 24 : p.tool === 'MDT' ? 3 : 2;
    const costUsd = p.tool === 'DST' ? 750000 : p.tool === 'MDT' ? 150000 : 80000;
    return {
      depthFt: p.depthFt,
      tool: p.tool,
      objectives: ['Formation pressure', 'Fluid ID', 'Permeability estimate'],
      estimatedPumpTimeHr: pumpTimeHr,
      costUsd,
    };
  });

  const totalCostUsd = points.reduce((sum, p) => sum + p.costUsd, 0);
  const totalTimeHr = points.reduce((sum, p) => sum + p.estimatedPumpTimeHr, 0);

  return { points, totalCostUsd, totalTimeHr };
}

// ═══════════════════════════════════════════════════════════════════════════════
// AFE COST ESTIMATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Estimate drilling days using depth and ROP models.
 */
export function estimateDrillingDays(
  totalMdFt: number,
  avgRopFtPerHr: number,
  trippingFactor: number, // typically 0.3-0.4
  casingStringCount: number,
  loggingDays: number,
  contingencyPct: number
): number {
  const drillingHours = totalMdFt / avgRopFtPerHr;
  const trippingHours = drillingHours * trippingFactor;
  const casingHours = casingStringCount * 24;
  const totalHours = drillingHours + trippingHours + casingHours + loggingDays * 24;
  return (totalHours / 24) * (1 + contingencyPct / 100);
}

/**
 * Calculate full AFE for an exploration well.
 */
export function calculateExplorationAFE(
  totalMdFt: number,
  drillingDays: number,
  spreadRateUsdPerDay: number,
  casingCostUsd: number,
  loggingCostUsd: number,
  coringCostUsd: number,
  samplingCostUsd: number,
  locationPrepCostUsd: number,
  contingencyPct: number,
  waterDepthFt: number
): AFEResult {
  const intangibleDrillingCost = drillingDays * spreadRateUsdPerDay;
  const mudCost = totalMdFt * 12; // $12/ft mud cost
  const cementingCost = totalMdFt * 5;
  const bitsBhaCost = totalMdFt * 18;
  const directionalCost = totalMdFt * 3;

  const tangibleCost = casingCostUsd + mudCost + cementingCost + bitsBhaCost;
  const intangibleCost = intangibleDrillingCost + directionalCost;
  const serviceCost = loggingCostUsd + coringCostUsd + samplingCostUsd;
  const logisticsCost = locationPrepCostUsd + waterDepthFt * 500; // $500/ft water depth logistics

  const subtotal = tangibleCost + intangibleCost + serviceCost + logisticsCost;
  const contingencyUsd = subtotal * (contingencyPct / 100);
  const totalCostUsd = subtotal + contingencyUsd;

  const breakdown: AFEBreakdownItem[] = [
    { item: 'Casing & Tubulars', category: 'tangible', cost: casingCostUsd, depthDependent: true, notes: 'API 5CT tubulars' },
    { item: 'Mud System', category: 'tangible', cost: mudCost, depthDependent: true, notes: 'WBM/OBM + chemicals' },
    { item: 'Cementing', category: 'tangible', cost: cementingCost, depthDependent: true, notes: 'Primary + remedial' },
    { item: 'Bits & BHA', category: 'tangible', cost: bitsBhaCost, depthDependent: true, notes: 'PDC + roller cone' },
    { item: 'Drilling Spread', category: 'intangible', cost: intangibleDrillingCost, depthDependent: true, notes: `Rig day rate $${(spreadRateUsdPerDay / 1000).toFixed(0)}k/day` },
    { item: 'Directional Services', category: 'intangible', cost: directionalCost, depthDependent: true, notes: 'MWD/LWD/RSS' },
    { item: 'Wireline Logging', category: 'service', cost: loggingCostUsd, depthDependent: false, notes: 'Open-hole wireline' },
    { item: 'Coring & Sampling', category: 'service', cost: coringCostUsd + samplingCostUsd, depthDependent: false, notes: 'Conventional + fluid' },
    { item: 'Location Prep', category: 'logistics', cost: locationPrepCostUsd, depthDependent: false, notes: 'Site prep + roads' },
    { item: 'Marine Logistics', category: 'logistics', cost: waterDepthFt * 500, depthDependent: false, notes: 'Supply vessels, helicopter' },
    { item: 'Regulatory & Permits', category: 'regulatory', cost: 250000, depthDependent: false, notes: 'Permit fees, EIA' },
    { item: 'Contingency', category: 'contingency', cost: contingencyUsd, depthDependent: false, notes: `${contingencyPct}% of subtotal` },
  ];

  return {
    totalCostUsd,
    breakdown,
    contingencyUsd,
    contingencyPct,
    dryHoleCostUsd: totalCostUsd * 0.7, // no completion
    drillingDays,
    spreadRateUsdPerDay,
  };
}

/**
 * Design logging program for a given TVD interval.
 * Convenience wrapper called by ExplorationStage with 2-param signature.
 */
export function designLoggingProgram(
  depthTopFt: number,
  depthBaseFt: number,
): LoggingProgram {
  return planWirelineLoggingSuite(depthTopFt, depthBaseFt, true, true);
}

/**
 * Design coring program from pre-populated interval array.
 * Convenience wrapper called by ExplorationStage.
 */
export function designCoringProgram(
  intervals: CoringInterval[],
): { intervals: CoringInterval[]; totalCostUsd: number; totalCoreFt: number } {
  const totalCostUsd = intervals.reduce((sum, int) => sum + int.costPerFt * (int.depthBaseFt - int.depthTopFt), 0);
  const totalCoreFt = intervals.reduce((sum, int) => sum + (int.depthBaseFt - int.depthTopFt), 0);
  return { intervals, totalCostUsd, totalCoreFt };
}

/**
 * Estimate AFE for exploration well.
 * Convenience wrapper called by ExplorationStage — types align with casing / logging / coring program shapes.
 */
export function estimateAFE(
  totalMdFt: number,
  casingProgram: CasingProgram,
  loggingProgram: LoggingProgram,
  coringProgram: { intervals: CoringInterval[]; totalCostUsd: number; totalCoreFt: number },
  spreadRateUsdPerDay: number,
  dryHoleDays: number,
): AFEResult {
  const casingCost: number = casingProgram.totalCasingCostUsd ?? 0;
  const loggingCost: number = loggingProgram.totalCostUsd ?? 0;
  const coringCost: number = coringProgram.totalCostUsd ?? 0;
  const samplingCost: number = (
    loggingProgram.logs
      .filter(l => l.acronym === 'MDT' || l.acronym === 'SWC')
      .reduce((s, l) => s + l.costPerFt * (loggingProgram.depthIntervalBaseFt - loggingProgram.depthIntervalTopFt), 0)
  );
  const locationPrepCost: number = totalMdFt > 8000 ? 500000 : 250000;

  return calculateExplorationAFE(
    totalMdFt,
    dryHoleDays > 0 ? dryHoleDays : estimateDrillingDays(totalMdFt, 30, 0.35, casingProgram.strings.length, loggingProgram.totalRunDays, 15),
    spreadRateUsdPerDay,
    casingCost,
    loggingCost,
    coringCost,
    samplingCost,
    locationPrepCost,
    15,
    0,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RISK ASSESSMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate risk register and 5×5 risk matrix.
 */
export function assessExplorationRisk(
  customRisks: Omit<RiskItem, 'riskScore' | 'riskLevel' | 'residualScore'>[]
): RiskAssessment {
  const matrix: RiskItem[] = customRisks.map(r => {
    const riskScore = r.likelihood * r.consequence;
    let riskLevel: RiskItem['riskLevel'] = 'low';
    if (riskScore >= 20) riskLevel = 'extreme';
    else if (riskScore >= 15) riskLevel = 'high';
    else if (riskScore >= 9) riskLevel = 'moderate';

    const residualLikelihood = Math.max(1, r.likelihood - 1);
    const residualConsequence = Math.max(1, r.consequence - 1);
    const residualScore = residualLikelihood * residualConsequence;

    return { ...r, riskScore, riskLevel, residualLikelihood, residualConsequence, residualScore };
  });

  const sorted = [...matrix].sort((a, b) => b.riskScore - a.riskScore);
  const topRisks = sorted.slice(0, 5);
  const overallRiskScore = matrix.reduce((sum, r) => sum + r.riskScore, 0) / Math.max(1, matrix.length);

  // Estimate Pg from risk scores
  const probabilityOfSuccess = Math.max(0.05, 1 - overallRiskScore / 25);

  let certaintyBand: 'P10' | 'P50' | 'P90' = 'P50';
  if (overallRiskScore < 8) certaintyBand = 'P10';
  else if (overallRiskScore > 16) certaintyBand = 'P90';

  return { matrix, overallRiskScore, topRisks, probabilityOfSuccess, certaintyBand };
}

// ═══════════════════════════════════════════════════════════════════════════════
// FID DECISION TREE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build and evaluate FID decision tree.
 * Drill / Defer / Farmout branches with probabilities and NPVs.
 */
export function calculateDecisionTree(
  drillCostUsd: number,
  successNpvUsd: number,
  dryHoleCostUsd: number,
  pg: number, // geological probability of success
  farmoutValueUsd: number,
  deferCostUsd: number,
  deferProbabilityGain: number, // how much Pg improves with deferral
  hurdleRatePct: number
): FIDResult {
  // Drill branch
  const drillEmv = pg * successNpvUsd - (1 - pg) * dryHoleCostUsd;
  const drillEmvNet = drillEmv - drillCostUsd;

  // Farmout branch
  const farmoutEmv = farmoutValueUsd;

  // Defer branch
  const deferredPg = Math.min(1, pg + deferProbabilityGain);
  const deferFutureCost = drillCostUsd * 1.1; // 10% cost escalation
  const deferEmv = deferredPg * successNpvUsd - (1 - deferredPg) * dryHoleCostUsd - deferFutureCost - deferCostUsd;

  // Value of Information
  const voI = Math.max(0, Math.max(drillEmvNet, deferEmv) - farmoutEmv);

  let recommendation: FIDResult['recommendation'];
  let emvUsd: number;
  let npvUsd: number;

  if (drillEmvNet > deferEmv && drillEmvNet > farmoutEmv) {
    recommendation = 'drill';
    emvUsd = drillEmvNet;
    npvUsd = drillEmvNet;
  } else if (deferEmv > drillEmvNet && deferEmv > farmoutEmv) {
    recommendation = 'defer';
    emvUsd = deferEmv;
    npvUsd = deferEmv;
  } else {
    recommendation = 'farmout';
    emvUsd = farmoutEmv;
    npvUsd = farmoutEmv;
  }

  if (recommendation !== 'drill' && drillEmvNet > -drillCostUsd * 0.3) {
    recommendation = Math.max(drillEmvNet, deferEmv, farmoutEmv) === drillEmvNet ? 'drill' : recommendation;
  }

  const irr = recommendation === 'drill' ? Math.max(0, ((successNpvUsd * pg) / drillCostUsd - 1) * 100) : 5;

  let confidenceLevel: 'high' | 'moderate' | 'low' = 'moderate';
  if (voI > drillCostUsd * 0.5) confidenceLevel = 'high';
  if (voI < drillCostUsd * 0.1) confidenceLevel = 'low';

  const decisionTree: DecisionTreeNode = {
    id: 'root',
    label: 'Exploration Well Decision',
    type: 'decision',
    children: [
      {
        id: 'drill',
        label: 'Drill',
        type: 'chance',
        probability: 1,
        npvUsd: drillEmvNet,
        capexUsd: drillCostUsd,
        children: [
          { id: 'drill-success', label: `Success (Pg=${(pg * 100).toFixed(0)}%)`, type: 'terminal', probability: pg, npvUsd: successNpvUsd - drillCostUsd, capexUsd: drillCostUsd, children: [] },
          { id: 'drill-dry', label: 'Dry Hole', type: 'terminal', probability: 1 - pg, npvUsd: -dryHoleCostUsd - drillCostUsd, capexUsd: drillCostUsd, children: [] },
        ],
      },
      {
        id: 'defer',
        label: `Defer (Pg→${(deferredPg * 100).toFixed(0)}%)`,
        type: 'terminal',
        probability: 1,
        npvUsd: deferEmv,
        capexUsd: deferCostUsd,
        children: [],
      },
      {
        id: 'farmout',
        label: 'Farm-out',
        type: 'terminal',
        probability: 1,
        npvUsd: farmoutValueUsd,
        capexUsd: 0,
        children: [],
      },
    ],
  };

  return {
    recommendation,
    emvUsd,
    expectedNpvUsd: npvUsd,
    irrPct: irr,
    voIUsd: voI,
    hurdleRatePct,
    confidenceLevel,
    decisionTree,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGULATORY READINESS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Assess regulatory readiness for exploration well.
 */
export function assessRegulatoryReadiness(
  jurisdiction: string,
  permitsObtained: string[],
  environmentalSensitivity: 'low' | 'moderate' | 'high'
): RegulatoryStatus {
  const jurisdictionPermits: Record<string, string[]> = {
    'US GOM': ['BOEM APD', 'BSEE Permit', 'NEPA EA/EIS', 'MMS Lease', 'Coast Guard', 'EPA Discharge'],
    'North Sea': ['OGA License', 'BEIS Consent', 'Environmental Statement', 'HSE Safety Case', 'Pipeline Works Auth'],
    'Middle East': ['Concession Agreement', 'Environmental Permit', 'Drilling Permit', 'MoE Approval', 'Municipal Permit'],
    'West Africa': ['PSC Approval', 'Environmental Certificate', 'Drilling Permit', 'Local Content Plan', 'MoP Approval'],
    'default': ['Exploration License', 'Environmental Permit', 'Drilling Permit', 'Zoning Approval'],
  };

  const required = jurisdictionPermits[jurisdiction] || jurisdictionPermits['default'];
  const outstandingRequirements = required.filter(p => !permitsObtained.includes(p));
  const complianceScore = ((required.length - outstandingRequirements.length) / required.length) * 100;

  let environmentalAssessment: RegulatoryStatus['environmentalAssessment'] = 'CE';
  if (environmentalSensitivity === 'high') environmentalAssessment = 'EIS';
  else if (environmentalSensitivity === 'moderate') environmentalAssessment = 'EA';

  // Estimate permit timeline
  const baseTimeline = environmentalAssessment === 'EIS' ? 540 : environmentalAssessment === 'EA' ? 270 : 90;
  const permitTimelineDays = baseTimeline * (1 - permitsObtained.length / required.length);

  const estimatedApprovalDate = new Date();
  estimatedApprovalDate.setDate(estimatedApprovalDate.getDate() + permitTimelineDays);

  return {
    jurisdiction,
    permitsRequired: required,
    permitsObtained,
    permitTimelineDays,
    environmentalAssessment,
    complianceScore,
    outstandingRequirements,
    estimatedApprovalDate: estimatedApprovalDate.toISOString().split('T')[0],
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFERENCE PAPERS
// ═══════════════════════════════════════════════════════════════════════════════

export interface WellPlanningPaper {
  title: string;
  authors: string;
  year: number;
  journal: string;
  description: string;
  keyConcept: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  category: 'pore_pressure' | 'casing' | 'trajectory' | 'economics' | 'risk';
}

export const WELL_PLANNING_PAPERS: WellPlanningPaper[] = [
  { title: 'Fracture Gradient Prediction Techniques and Their Application', authors: 'Matthews, W.R., Kelly, J.', year: 1967, journal: 'Oil & Gas Journal', description: 'Establishes the Matthews & Kelly method for fracture gradient prediction using Poisson\'s ratio.', keyConcept: 'Fracture gradient from effective stress', difficulty: 'Basic', category: 'pore_pressure' },
  { title: 'The Equation for Geopressure Prediction from Well Logs', authors: 'Eaton, B.A.', year: 1975, journal: 'SPE 5544', description: 'The classic Eaton method for pore pressure estimation from sonic velocity and resistivity.', keyConcept: 'Eaton pore pressure method', difficulty: 'Intermediate', category: 'pore_pressure' },
  { title: 'Casing Design Theory and Practice', authors: 'Adams, A.J., MacEachran, A.', year: 1994, journal: 'SPE Textbook Vol. 1', description: 'Comprehensive treatment of casing design including burst, collapse, and triaxial loading per API 5C3.', keyConcept: 'API 5C3 triaxial casing design', difficulty: 'Advanced', category: 'casing' },
  { title: 'Directional Drilling', authors: 'Inglis, T.A.', year: 1987, journal: 'Petroleum Engineering & Development Studies', description: 'Foundational text on directional well planning, trajectory types, and torque/drag analysis.', keyConcept: 'Well trajectory design methodology', difficulty: 'Intermediate', category: 'trajectory' },
  { title: 'Decision Analysis for Petroleum Exploration', authors: 'Newendorp, P.D., Schuyler, J.R.', year: 2000, journal: 'Planning Press', description: 'Decision tree methodology for exploration, EMV calculation, and value of information.', keyConcept: 'FID decision tree economics', difficulty: 'Intermediate', category: 'economics' },
  { title: 'Quantitative Risk Assessment for Wells', authors: 'Aadnoy, B.S., et al.', year: 2009, journal: 'SPE 121352', description: 'Risk matrix framework for well planning with 5×5 likelihood-consequence classification.', keyConcept: 'Well risk matrix (5×5)', difficulty: 'Intermediate', category: 'risk' },
  { title: 'Well Cost Estimation and AFE Preparation', authors: 'SPE Reprint No. 24', year: 1979, journal: 'SPE', description: 'Standard AFE structure for exploration wells: tangibles, intangibles, contingencies.', keyConcept: 'AFE cost breakdown methodology', difficulty: 'Basic', category: 'economics' },
  { title: 'The Growth of Geological Faults: A Review', authors: 'Childs, C., et al.', year: 2017, journal: 'Journal of Structural Geology', description: 'Fault damage zone scaling relationships for well placement risk assessment.', keyConcept: 'Fault damage zone proximity risk', difficulty: 'Advanced', category: 'risk' },
];