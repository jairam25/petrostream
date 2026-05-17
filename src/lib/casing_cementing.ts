/**
 * ─── Casing Design & Cementing ───
 * Sub-Steps 3.1.3 (extended) & 3.3.4 — PetroStream Simulation Suite
 *
 * Covers: kick tolerance (Leach & Wand 1987), liner design, connection selection,
 * casing wear prediction (Maurer 1987), thermal expansion stress, cement slurry
 * design (API 10B-2), cement volume & displacement, squeeze cementing,
 * cement bond evaluation (CBL/VDL, USIT), remedial cementing.
 *
 * References:
 *   - Leach, C.P. & Wand, P.A. (1987) "Use of a Kick Tolerance Concept..."
 *   - API 5C3 — Casing burst/collapse/tension design
 *   - API 10B-2 — Cement testing
 *   - Maurer, W.C. (1987) — Casing wear prediction
 *   - Adams, N.J. (1985) "Drilling Engineering" — Kick tolerance
 *   - NACE MR0175 / ISO 15156 — Sour service material selection
 *   - SPE 20340 — Thermal casing design for HPHT
 *   - SPE 90408 — Wellbore positioning & anti-collision
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type CasingGrade =
  | 'H-40' | 'J-55' | 'K-55' | 'N-80'
  | 'L-80' | 'L-80-13Cr' | 'C-90' | 'C-95'
  | 'T-95' | 'P-110' | 'Q-125' | 'V-150';

export type ConnectionType =
  | 'STC' | 'LTC' | 'BTC'
  | 'VAM-TOP' | 'Tennessee' | 'Hydril-563'
  | 'VAM-FJL' | 'Gas-Tight-Premium';

export interface CasingGradeProps {
  grade: CasingGrade;
  minYieldKsi: number;
  minUltimateKsi: number;
  sourService: boolean;
  maxTempF: number;
  hardnessHRC: number;
  costMultiplier: number;
}

export interface ConnectionProps {
  type: ConnectionType;
  gasTight: boolean;
  tensionEfficiency: number;    // fraction of pipe body yield
  compressionRating: number;     // fraction of tension
  makeUpTorqueFtLb: number;      // per inch OD
  costMultiplier: number;
  sealType: 'metal-to-metal' | 'elastomer' | 'thread-compound';
}

export interface CasingWearInput {
  rotatingHours: number;
  sideForceLb: number;          // side force at contact point
  rpm: number;
  toolJointHardnessHB: number;  // Brinell hardness
  casingHardnessHB: number;
  mudAbrasivenessFactor: number; // 0-1 scale, sand content dependent
  originalWallIn: number;
  odIn: number;
}

export interface CasingWearResult {
  wearGrooveDepthIn: number;
  remainingWallIn: number;
  remainingBurstPct: number;
  remainingCollapsePct: number;
  wearRateInPerMillionRevs: number;
  safeRotatingHours: number;
  recommendation: string;
}

export interface ThermalExpansionInput {
  deltaTF: number;              // temperature change from baseline (+ for heating)
  youngsModulusPsi: number;     // typically 30e6 for steel
  thermalCoeffPerF: number;     // ~6.5e-6 for carbon steel, ~9.8e-6 for 13Cr
  poissonRatio: number;         // 0.3 for steel
  odIn: number;
  idIn: number;
  constrainedAxial: boolean;    // cemented string = constrained
  internalPressureChangePsi: number;
  externalPressureChangePsi: number;
  yieldStrengthPsi: number;
}

export interface ThermalExpansionResult {
  thermalStrainInPerIn: number;
  thermalStressPsi: number;
  pressureStressPsi: number;
  vonMisesStressPsi: number;
  safetyFactorTriaxial: number;
  axialForceLbf: number;
  bucklingPotential: 'none' | 'sinusoidal' | 'helical';
  lengthChangeIn: number;
}

export interface KickToleranceInput {
  tvdShoeFt: number;
  tvdHoleFt: number;
  mudWeightPpg: number;
  fractureGradientPpg: number;
  casingIdIn: number;
  holeDiameterIn: number;
  kickIntensityPpg: number;        // ppt of gas influx
  gasGradientPpg: number;          // typically 0.1 ppg for gas
  temperatureGradientFPerFt: number;
  surfaceTemperatureF: number;
  formationPressurePpg: number;
}

export interface KickToleranceResult {
  maxKickVolumeBbl: number;
  kickTolerancePpg: number;        // max allowable kick intensity
  shoePressureDuringKickPsi: number;
  fracturePressureAtShoePsi: number;
  marginOfSafetyPsi: number;
  canCirculateWithoutFracture: boolean;
  killMudWeightPpg: number;
  requiredCasingSettingDepthFt: number;
  gasExpansionFactor: number;
}

export interface LinerDesignInput {
  linerTopDepthFt: number;
  linerShoeDepthFt: number;
  previousShoeDepthFt: number;     // shoe of casing above liner
  odIn: number;
  weightLbPerFt: number;
  grade: CasingGrade;
  burstRatingPsi: number;
  collapseRatingPsi: number;
  designFactors: {
    burst: number;
    collapse: number;
    tension: number;
    triaxial: number;
  };
  maxInternalPressurePsi: number;
  maxExternalPressurePsi: number;
  linerTopAppliedLoadLbf: number;  // weight below liner-top packer
  linerTopPressurePsi: number;     // pressure at liner top
  linerOverlapFt: number;
  thermalDeltaTF: number;
}

export interface LinerDesignResult {
  passBurst: boolean;
  passCollapse: boolean;
  passTension: boolean;
  passTriaxial: boolean;
  safeShoeDepthMinFt: number;
  safeShoeDepthMaxFt: number;
  factorBurst: number;
  factorCollapse: number;
  factorTension: number;
  factorTriaxial: number;
  linerTopSealRating: 'adequate' | 'marginal' | 'inadequate';
  recommendations: string[];
}

export interface CementSlurryInput {
  apiClass: 'A' | 'B' | 'C' | 'G' | 'H' | 'D' | 'E' | 'F';
  densityPpg: number;
  mixWaterGalPerSack: number;
  yieldCuFtPerSack: number;
  bhstF: number;
  bhctF: number;                      // bottomhole circulating temperature
  additives: CementAdditive[];
  excessPct: number;
  sectionLengthFt: number;
  holeDiameterIn: number;
  casingOdIn: number;
  previousCasingIdIn: number;        // for multi-stage strings
}

export interface CementAdditive {
  name: string;
  type: 'accelerator' | 'retarder' | 'fluid-loss' | 'extender'
        | 'weighting' | 'anti-gas' | 'LCM' | 'strength' | 'defoamer' | 'dispersant';
  concentration: number;
  unit: '%BWOC' | 'gps' | '%BWOW' | 'ppb';
  effectOnThickeningTimePct: number;  // +/- % change
  effectOnCompressiveStrengthPct: number;
}

export interface CementSlurryResult {
  totalSlurryVolumeBbl: number;
  leadSlurryVolumeBbl: number;
  tailSlurryVolumeBbl: number;
  sacksOfCement: number;
  mixWaterBbl: number;
  thickeningTimeHr: number;
  compressiveStrength8hrPsi: number;
  compressiveStrength24hrPsi: number;
  transitionTimeMin: number;          // 48-500 psi static gel strength
  fluidLossCcPer30min: number;
  freeWaterPct: number;
  rheology: {
    plasticViscosityCp: number;
    yieldPointLbfPer100ft2: number;
    gel10secLbfPer100ft2: number;
    gel10minLbfPer100ft2: number;
  };
  displacementVolumeBbl: number;
  pumpTimeHr: number;
  topOfCementFt: number;
  wocTimeHr: number;                  // wait on cement
  costUsd: number;
}

export interface CementBondInput {
  cblAmplitudeMv: number;             // 0-100 mV, lower = better bond
  freePipeAmplitudeMv: number;        // calibration in free pipe
  attenuationDbPerFt: number;
  vdlFormationArrival: 'strong' | 'moderate' | 'weak' | 'absent';
  casingArrival: 'normal' | 'attenuated' | 'stretched';
  microannulusDetected: boolean;
  channelingDetected: boolean;
  contaminatedCementPct: number;
  usitAcousticImpedanceMrayl: number; // >3.7 Mrayl = good bond
}

export interface CementBondResult {
  bondIndex: number;                   // 0-1, normalized
  qualitativeIndex: 'good' | 'fair' | 'poor' | 'free-pipe';
  zonalIsolation: 'adequate' | 'questionable' | 'failed';
  squeezeRecommended: boolean;
  squeezeIntervalTopFt: number;
  squeezeIntervalBaseFt: number;
  squeezeVolumeBbl: number;
  remedialMethod: string;
}

export interface SqueezeCementInput {
  perforationDepthTopFt: number;
  perforationDepthBaseFt: number;
  injectionRateBpm: number;
  injectionPressurePsi: number;
  formationFracPressurePsi: number;
  slurryDensityPpg: number;
  slurryVolumeBbl: number;
  displacementVolumeBbl: number;
  squeezePressurePsi: number;
  hesitationSqueeze: boolean;
}

export interface SqueezeCementResult {
  isBelowFracPressure: boolean;
  surfacePressureOneSackPsi: number;
  finalSqueezePressurePsi: number;
  estimatedCementPlacedBbl: number;
  successProbability: number;
  numberStages: number;
  totalTimeHr: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE DATABASE (API 5C3 min yield, NACE MR0175 compliance)
// ═══════════════════════════════════════════════════════════════════════════════

export const CASING_GRADES: Record<CasingGrade, CasingGradeProps> = {
  'H-40':  { grade:'H-40',  minYieldKsi:40,  minUltimateKsi:60,  sourService:false, maxTempF:400,  hardnessHRC:16,  costMultiplier:0.65 },
  'J-55':  { grade:'J-55',  minYieldKsi:55,  minUltimateKsi:75,  sourService:false, maxTempF:400,  hardnessHRC:18,  costMultiplier:0.75 },
  'K-55':  { grade:'K-55',  minYieldKsi:55,  minUltimateKsi:95,  sourService:false, maxTempF:400,  hardnessHRC:19,  costMultiplier:0.80 },
  'N-80':  { grade:'N-80',  minYieldKsi:80,  minUltimateKsi:100, sourService:false, maxTempF:500,  hardnessHRC:22,  costMultiplier:1.00 },
  'L-80':  { grade:'L-80',  minYieldKsi:80,  minUltimateKsi:95,  sourService:true,  maxTempF:500,  hardnessHRC:22,  costMultiplier:1.15 },
  'L-80-13Cr': { grade:'L-80-13Cr', minYieldKsi:80, minUltimateKsi:95, sourService:false, maxTempF:550, hardnessHRC:22, costMultiplier:2.50 },
  'C-90':  { grade:'C-90',  minYieldKsi:90,  minUltimateKsi:100, sourService:true,  maxTempF:550,  hardnessHRC:25,  costMultiplier:1.60 },
  'C-95':  { grade:'C-95',  minYieldKsi:95,  minUltimateKsi:105, sourService:true,  maxTempF:550,  hardnessHRC:26,  costMultiplier:1.80 },
  'T-95':  { grade:'T-95',  minYieldKsi:95,  minUltimateKsi:110, sourService:true,  maxTempF:550,  hardnessHRC:25,  costMultiplier:2.00 },
  'P-110': { grade:'P-110', minYieldKsi:110, minUltimateKsi:125, sourService:false, maxTempF:600,  hardnessHRC:28,  costMultiplier:1.50 },
  'Q-125': { grade:'Q-125', minYieldKsi:125, minUltimateKsi:140, sourService:false, maxTempF:650,  hardnessHRC:30,  costMultiplier:2.20 },
  'V-150': { grade:'V-150', minYieldKsi:150, minUltimateKsi:160, sourService:false, maxTempF:700,  hardnessHRC:34,  costMultiplier:3.50 },
};

export const CONNECTION_TYPES: Record<ConnectionType, ConnectionProps> = {
  'STC':    { type:'STC',    gasTight:false, tensionEfficiency:1.00, compressionRating:0.60, makeUpTorqueFtLb:900,  costMultiplier:0.70, sealType:'thread-compound' },
  'LTC':    { type:'LTC',    gasTight:false, tensionEfficiency:1.00, compressionRating:0.70, makeUpTorqueFtLb:1100, costMultiplier:0.80, sealType:'thread-compound' },
  'BTC':    { type:'BTC',    gasTight:false, tensionEfficiency:1.00, compressionRating:0.80, makeUpTorqueFtLb:1300, costMultiplier:0.90, sealType:'thread-compound' },
  'VAM-TOP': { type:'VAM-TOP', gasTight:true, tensionEfficiency:1.00, compressionRating:1.00, makeUpTorqueFtLb:2500, costMultiplier:2.00, sealType:'metal-to-metal' },
  'Tennessee': { type:'Tennessee', gasTight:true, tensionEfficiency:0.85, compressionRating:0.85, makeUpTorqueFtLb:2000, costMultiplier:1.60, sealType:'metal-to-metal' },
  'Hydril-563': { type:'Hydril-563', gasTight:true, tensionEfficiency:1.00, compressionRating:1.00, makeUpTorqueFtLb:2800, costMultiplier:2.50, sealType:'metal-to-metal' },
  'VAM-FJL': { type:'VAM-FJL', gasTight:true, tensionEfficiency:1.00, compressionRating:1.00, makeUpTorqueFtLb:2200, costMultiplier:1.80, sealType:'metal-to-metal' },
  'Gas-Tight-Premium': { type:'Gas-Tight-Premium', gasTight:true, tensionEfficiency:1.00, compressionRating:1.00, makeUpTorqueFtLb:3000, costMultiplier:3.00, sealType:'metal-to-metal' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. KICK TOLERANCE (Leach & Wand 1987, Adams 1985)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate maximum kick volume and tolerance at casing shoe.
 *
 * Method: Gas bubble rises from bottom, expands per Boyle's law.
 * Check: Does pressure at shoe exceed FG during circulation?
 *
 *   P_shoe = P_form + ΔP_annulus_friction + ΔP_choke
 *   P_shoe ≤ P_fracture for safe condition
 */
export function calculateKickTolerance(input: KickToleranceInput): KickToleranceResult {
  const {
    tvdShoeFt, tvdHoleFt, mudWeightPpg, fractureGradientPpg,
    casingIdIn, holeDiameterIn, kickIntensityPpg, gasGradientPpg,
    temperatureGradientFPerFt, surfaceTemperatureF, formationPressurePpg,
  } = input;

  const grad = 0.052; // psi/ft per ppg
  const shoeFracPsi = fractureGradientPpg * grad * tvdShoeFt;
  const annularCapacityBblPerFt = (holeDiameterIn ** 2 - casingIdIn ** 2) / 1029.4;

  // Gas properties
  const TshoeR = surfaceTemperatureF + 460 + temperatureGradientFPerFt * tvdShoeFt;
  const TbottomR = surfaceTemperatureF + 460 + temperatureGradientFPerFt * tvdHoleFt;
  const PshoePsi = mudWeightPpg * grad * tvdShoeFt;
  const PbottomPsi = formationPressurePpg * grad * tvdHoleFt;

  // Gas expansion factor at shoe (Boyle's + Charles' law)
  const gasExpansionFactor = (PbottomPsi / PshoePsi) * (TshoeR / TbottomR);

  // Kick height at shoe (assuming single bubble)
  const maxShoePressurePsi = shoeFracPsi - mudWeightPpg * grad * tvdShoeFt;
  const maxKickHeightFt = maxShoePressurePsi / ((mudWeightPpg - gasGradientPpg) * grad);

  const maxKickVolumeBbl = maxKickHeightFt * annularCapacityBblPerFt;

  // Kick tolerance in ppg
  const kickTolerancePpg = maxShoePressurePsi / (grad * tvdShoeFt);

  // Margin
  const shoePressureDuringKickPsi = mudWeightPpg * grad * tvdShoeFt +
    (maxKickVolumeBbl / annularCapacityBblPerFt) * (kickIntensityPpg - gasGradientPpg) * grad;
  const marginOfSafetyPsi = shoeFracPsi - shoePressureDuringKickPsi;

  const canCirculate = marginOfSafetyPsi > 50; // 50 psi margin

  // Kill mud weight
  const sidppPsi = (formationPressurePpg - mudWeightPpg) * grad * tvdHoleFt;
  const killMudWeightPpg = mudWeightPpg + sidppPsi / (grad * tvdHoleFt);

  // Minimum setting depth if current shoe inadequate
  const requiredCasingSettingDepthFt = tvdShoeFt + (marginOfSafetyPsi < 0
    ? Math.abs(marginOfSafetyPsi) / (fractureGradientPpg * grad)
    : 0);

  return {
    maxKickVolumeBbl,
    kickTolerancePpg,
    shoePressureDuringKickPsi,
    fracturePressureAtShoePsi: shoeFracPsi,
    marginOfSafetyPsi,
    canCirculateWithoutFracture: canCirculate,
    killMudWeightPpg,
    requiredCasingSettingDepthFt,
    gasExpansionFactor,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. LINER DESIGN (hung casing strings)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Liner design evaluation.
 * Checks burst, collapse, tension, triaxial (von Mises) for liners hung
 * inside previous casing. Overlap section subject to dual-casing constraint.
 */
export function designLiner(input: LinerDesignInput): LinerDesignResult {
  const {
    linerTopDepthFt, linerShoeDepthFt, previousShoeDepthFt, odIn,
    weightLbPerFt, grade, burstRatingPsi, collapseRatingPsi,
    designFactors, maxInternalPressurePsi, maxExternalPressurePsi,
    linerTopAppliedLoadLbf, linerTopPressurePsi, linerOverlapFt,
    thermalDeltaTF,
  } = input;

  const lengthFt = linerShoeDepthFt - linerTopDepthFt;
  const wallIn = weightLbPerFt / (3.46 * odIn); // approximate from weight
  const idIn = odIn - 2 * wallIn;
  const crossSectionAreaIn2 = Math.PI / 4 * (odIn ** 2 - idIn ** 2);
  const internalAreaIn2 = Math.PI / 4 * idIn ** 2;

  const gradeProps = CASING_GRADES[grade];
  const yieldStressPsi = gradeProps.minYieldKsi * 1000;

  // Burst
  const burstLimitPsi = Math.min(burstRatingPsi, 0.875 * 2 * yieldStressPsi * wallIn / odIn);
  const safeInternalPsiBurst = burstLimitPsi / designFactors.burst;
  const passBurst = maxInternalPressurePsi <= safeInternalPsiBurst;

  // Collapse (elastic collapse per API 5C3, adjusted for D/t)
  const dOverT = odIn / wallIn;
  let collapseLimitPsi: number;
  if (dOverT <= 13.5) {
    collapseLimitPsi = yieldStressPsi * (2 - 1.155 / dOverT); // yield collapse
  } else if (dOverT <= 22.5) {
    collapseLimitPsi = yieldStressPsi * (2.0 / dOverT - 0.0363); // plastic collapse
  } else if (dOverT <= 32.5) {
    collapseLimitPsi = yieldStressPsi * (1.989 / dOverT - 0.0375); // transition
  } else {
    collapseLimitPsi = 46.95e6 / (dOverT * (dOverT - 1) ** 2); // elastic collapse
  }
  collapseLimitPsi = Math.min(collapseLimitPsi, collapseRatingPsi);

  const safeExternalPsiCollapse = collapseLimitPsi / designFactors.collapse;
  const passCollapse = maxExternalPressurePsi <= safeExternalPsiCollapse;

  // Tension
  const jointYieldStrengthLbf = yieldStressPsi * crossSectionAreaIn2;
  const safeTensionLbf = jointYieldStrengthLbf / designFactors.tension;
  const hangingWeightLbf = weightLbPerFt * lengthFt;
  const buoyancyFactor = 1 - (maxExternalPressurePsi / (0.052 * linerShoeDepthFt)) / 8.33;
  const buoyedWeightLbf = hangingWeightLbf * buoyancyFactor;
  const totalAxialLoadLbf = buoyedWeightLbf + linerTopAppliedLoadLbf;
  const passTension = totalAxialLoadLbf <= safeTensionLbf;

  // Thermal stress (constrained axial, like cemented liner)
  const thermalStrain = 6.5e-6 * thermalDeltaTF;
  const thermalAxialStressPsi = gradeProps.minYieldKsi * 1000 > 0
    ? -(30e6 * thermalStrain) : 0; // compressive when heated
  const axialStressFromLoad = totalAxialLoadLbf / crossSectionAreaIn2;
  const hoopStressBurst = maxInternalPressurePsi * odIn / (2 * wallIn);
  const radialStress = -(maxInternalPressurePsi + maxExternalPressurePsi) / 2;

  // von Mises triaxial stress
  const sigmaA = axialStressFromLoad + thermalAxialStressPsi;
  const sigmaH = hoopStressBurst;
  const sigmaR = radialStress;
  const vonMises = Math.sqrt(
    0.5 * ((sigmaA - sigmaH) ** 2 + (sigmaH - sigmaR) ** 2 + (sigmaR - sigmaA) ** 2)
  );
  const triaxialSafety = yieldStressPsi / vonMises;
  const passTriaxial = triaxialSafety >= designFactors.triaxial;

  // Liner-top seal assessment
  const overlapPressureDiff = linerTopPressurePsi > 0
    ? linerTopPressurePsi / 0.052 / linerOverlapFt
    : 0;
  let sealRating: LinerDesignResult['linerTopSealRating'] = 'adequate';
  if (overlapPressureDiff > 16) sealRating = 'inadequate';
  else if (overlapPressureDiff > 12) sealRating = 'marginal';

  const recommendations: string[] = [];
  if (!passBurst) recommendations.push('Increase burst rating or reduce internal pressure');
  if (!passCollapse) recommendations.push('Increase collapse rating or add external support');
  if (!passTension) recommendations.push('Reduce liner length or use higher grade');
  if (!passTriaxial) recommendations.push('Review combined loading — triaxial failure risk');
  if (sealRating !== 'adequate') recommendations.push('Extend liner overlap or enhance seal design');

  return {
    passBurst,
    passCollapse,
    passTension,
    passTriaxial,
    safeShoeDepthMinFt: previousShoeDepthFt + linerOverlapFt,
    safeShoeDepthMaxFt: linerShoeDepthFt,
    factorBurst: safeInternalPsiBurst / Math.max(maxInternalPressurePsi, 1),
    factorCollapse: safeExternalPsiCollapse / Math.max(maxExternalPressurePsi, 1),
    factorTension: safeTensionLbf / Math.max(totalAxialLoadLbf, 1),
    factorTriaxial: triaxialSafety,
    linerTopSealRating: sealRating,
    recommendations,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. CASING WEAR (Maurer 1987 — Tool-joint wear on casing)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Predict casing wear groove depth from drill-pipe rotation.
 *
 * Maurer wear model:
 *   Wear Volume = K × SideForce × SlidingDistance / Hardness_casing
 *   K = wear coefficient (function of mud abrasiveness, tooljoint hardness ratio)
 *
 * Groove is assumed crescent-shaped — convert volume to depth.
 *
 * References: Maurer Engineering (1987), SPE 14327
 */
export function calculateCasingWear(input: CasingWearInput): CasingWearResult {
  const {
    rotatingHours, sideForceLb, rpm, toolJointHardnessHB,
    casingHardnessHB, mudAbrasivenessFactor, originalWallIn, odIn,
  } = input;

  const slidingDistanceFt = Math.PI * (odIn / 12) * rpm * rotatingHours * 60;
  const hardnessRatio = toolJointHardnessHB / Math.max(casingHardnessHB, 1);

  // Wear coefficient (dimensionless, typically 1e-6 to 1e-4)
  const baseWearCoeff = 2.5e-5;
  const wearCoefficient = baseWearCoeff * hardnessRatio * (1 + mudAbrasivenessFactor * 3);

  const wearVolumeIn3 = wearCoefficient * sideForceLb * slidingDistanceFt * 12; // convert ft to in

  // Convert to crescent groove depth (approximate)
  // groove cross-section ≈ (2/3) × width × depth, width ≈ 2 × sqrt(od/2 × depth)
  // Solving for depth from volume
  const wearGrooveDepthIn = Math.pow(
    (wearVolumeIn3 * 1.5) / (2 * Math.sqrt(odIn / 2) * slidingDistanceFt * 12),
    2 / 3
  );

  const grooveClamped = Math.min(wearGrooveDepthIn, originalWallIn * 0.8); // max 80% wall loss
  const remainingWallIn = originalWallIn - grooveClamped;
  const remainingBurstPct = (remainingWallIn / originalWallIn) * 100;
  const remainingCollapsePct = Math.pow(remainingWallIn / originalWallIn, 2) * 100; // collapse ∝ t²

  // Wear rate
  const revolutions = rpm * rotatingHours * 60;
  const wearRateInPerMillionRevs = revolutions > 0
    ? (grooveClamped / revolutions) * 1e6
    : 0;

  // Safe rotating hours (to 30% wall loss limit)
  const safeLimitIn = originalWallIn * 0.3;
  const safeRotatingHours = wearRateInPerMillionRevs > 0
    ? (safeLimitIn / wearRateInPerMillionRevs) * 1e6 / (rpm * 60)
    : 1e9;

  let recommendation = 'Acceptable wear — continue monitoring';
  if (remainingBurstPct < 50) recommendation = 'CRITICAL — Replace casing or add protective liner';
  else if (remainingBurstPct < 70) recommendation = 'WARNING — Schedule casing inspection, limit rotation';

  return {
    wearGrooveDepthIn: grooveClamped,
    remainingWallIn,
    remainingBurstPct,
    remainingCollapsePct,
    wearRateInPerMillionRevs,
    safeRotatingHours,
    recommendation,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. THERMAL EXPANSION / CONTRACTION (HPHT)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Thermal stress analysis for casing strings subject to temperature change.
 * HPHT wells, steam injection, geothermal — heating causes compressive stress
 * in constrained (cemented) strings, potentially causing buckling.
 *
 *   Thermal strain ε_th = α × ΔT
 *   Thermal stress σ_th = E × α × ΔT (if fully constrained)
 *   Free length change ΔL = α × L × ΔT (if free to expand)
 *
 * Triaxial von Mises from pressure + thermal loading.
 */
export function calculateThermalExpansion(input: ThermalExpansionInput): ThermalExpansionResult {
  const {
    deltaTF, youngsModulusPsi, thermalCoeffPerF, poissonRatio,
    odIn, idIn, constrainedAxial, internalPressureChangePsi,
    externalPressureChangePsi, yieldStrengthPsi,
  } = input;

  const wallIn = (odIn - idIn) / 2;
  const crossSectionIn2 = Math.PI / 4 * (odIn ** 2 - idIn ** 2);

  // Thermal strain
  const thermalStrainInPerIn = thermalCoeffPerF * deltaTF;

  // Thermal stress (only if constrained)
  const thermalStressPsi = constrainedAxial
    ? -youngsModulusPsi * thermalStrainInPerIn  // negative = compressive
    : 0;

  // Pressure-induced stresses (Lame equations for thick-walled cylinder)
  const rRatio = odIn / idIn;
  const hoopStressPsi = internalPressureChangePsi > 0 && externalPressureChangePsi > 0
    ? (internalPressureChangePsi * (rRatio ** 2 + 1) - 2 * externalPressureChangePsi * rRatio ** 2) / (rRatio ** 2 - 1)
    : 0;

  const radialStressPsi = -(internalPressureChangePsi + externalPressureChangePsi) / 2;
  const axialPressureStressPsi = (internalPressureChangePsi - externalPressureChangePsi * rRatio ** 2) / (rRatio ** 2 - 1);

  // Total axial stress
  const totalAxialStressPsi = thermalStressPsi + axialPressureStressPsi;

  // von Mises triaxial
  const vonMisesStressPsi = Math.sqrt(
    0.5 * (
      (totalAxialStressPsi - hoopStressPsi) ** 2 +
      (hoopStressPsi - radialStressPsi) ** 2 +
      (radialStressPsi - totalAxialStressPsi) ** 2
    )
  );

  const safetyFactorTriaxial = vonMisesStressPsi > 0
    ? yieldStrengthPsi / vonMisesStressPsi
    : 999;

  // Axial force
  const axialForceLbf = totalAxialStressPsi * crossSectionIn2;

  // Buckling assessment (for unconstrained or partially constrained strings)
  let bucklingPotential: ThermalExpansionResult['bucklingPotential'] = 'none';
  if (axialForceLbf < -10000) {
    bucklingPotential = 'helical'; // compressive load > threshold
  } else if (axialForceLbf < -5000) {
    bucklingPotential = 'sinusoidal';
  }

  // Length change (if free to move)
  const lengthChangeIn = thermalStrainInPerIn * 1000 * 12; // per 1000 ft

  return {
    thermalStrainInPerIn,
    thermalStressPsi,
    pressureStressPsi: axialPressureStressPsi,
    vonMisesStressPsi,
    safetyFactorTriaxial,
    axialForceLbf,
    bucklingPotential,
    lengthChangeIn,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. CEMENT SLURRY DESIGN (API 10B-2)
// ═══════════════════════════════════════════════════════════════════════════════

const API_CLASS_PROPERTIES: Record<string, {
  baseDensityPpg: number; baseYield: number; baseWater: number;
  depthMinFt: number; depthMaxFt: number; baseThickTimeCoeff: number;
}> = {
  'A': { baseDensityPpg:15.6, baseYield:1.18, baseWater:5.19, depthMinFt:0,    depthMaxFt:6000,  baseThickTimeCoeff:1.0 },
  'B': { baseDensityPpg:15.6, baseYield:1.18, baseWater:5.19, depthMinFt:0,    depthMaxFt:6000,  baseThickTimeCoeff:0.9 },
  'C': { baseDensityPpg:14.8, baseYield:1.32, baseWater:6.32, depthMinFt:0,    depthMaxFt:6000,  baseThickTimeCoeff:1.0 },
  'G': { baseDensityPpg:15.8, baseYield:1.15, baseWater:4.97, depthMinFt:0,    depthMaxFt:8000,  baseThickTimeCoeff:1.2 },
  'H': { baseDensityPpg:16.4, baseYield:1.06, baseWater:4.29, depthMinFt:0,    depthMaxFt:10000, baseThickTimeCoeff:1.3 },
  'D': { baseDensityPpg:15.6, baseYield:1.18, baseWater:5.19, depthMinFt:6000, depthMaxFt:12000, baseThickTimeCoeff:0.7 },
  'E': { baseDensityPpg:15.6, baseYield:1.18, baseWater:5.19, depthMinFt:10000,depthMaxFt:14000, baseThickTimeCoeff:0.5 },
  'F': { baseDensityPpg:15.6, baseYield:1.18, baseWater:5.19, depthMinFt:10000,depthMaxFt:16000, baseThickTimeCoeff:0.4 },
};

/**
 * Design cement slurry and calculate job parameters.
 *
 * Lead slurry (lower density, ahead) + Tail slurry (higher density, shoe area).
 * Thickening time adjusted for BHCT per API schedule.
 * Compressive strength from maturity method.
 */
export function designCementSlurry(input: CementSlurryInput): CementSlurryResult {
  const {
    apiClass, densityPpg, mixWaterGalPerSack, yieldCuFtPerSack,
    bhstF, bhctF, additives, excessPct, sectionLengthFt,
    holeDiameterIn, casingOdIn, previousCasingIdIn,
  } = input;

  const classProps = API_CLASS_PROPERTIES[apiClass] || API_CLASS_PROPERTIES['G'];

  // Annulus volumes
  const openHoleAnnulusBblPerFt = (holeDiameterIn ** 2 - casingOdIn ** 2) / 1029.4;
  const casedAnnulusBblPerFt = previousCasingIdIn > 0
    ? (previousCasingIdIn ** 2 - casingOdIn ** 2) / 1029.4
    : 0;

  // Assume 80% open hole, 20% inside previous casing for overlap
  const openHoleLength = sectionLengthFt * 0.8;
  const casedLength = sectionLengthFt * 0.2;
  const theoreticalAnnularBbl = openHoleAnnulusBblPerFt * openHoleLength +
    casedAnnulusBblPerFt * casedLength;

  const excessFactor = 1 + excessPct / 100;
  const totalSlurryVolumeBbl = theoreticalAnnularBbl * excessFactor;

  // Lead/tail split (70/30 typical)
  const leadSlurryVolumeBbl = totalSlurryVolumeBbl * 0.7;
  const tailSlurryVolumeBbl = totalSlurryVolumeBbl * 0.3;

  // Cement sacks
  const sacksOfCement = Math.ceil(totalSlurryVolumeBbl * 5.615 / yieldCuFtPerSack);

  // Mix water
  const mixWaterBbl = (mixWaterGalPerSack * sacksOfCement) / 42;

  // Thickening time (from API schedule, adjusted for BHCT and additives)
  const baseThickeningTime = 120 * classProps.baseThickTimeCoeff * Math.exp(-0.003 * bhctF);
  let additiveEffectPct = 0;
  for (const a of additives) {
    additiveEffectPct += a.effectOnThickeningTimePct;
  }
  const thickeningTimeHr = Math.max(1.5, baseThickeningTime * (1 + additiveEffectPct / 100));

  // Compressive strength (maturity concept — equivalent curing time at BHST)
  const maturityHr = 8; // assumed 8-hour strength test
  const tempFactor = Math.exp(0.05 * (bhstF - 100));
  const basePsi8hr = 1200 * tempFactor; // ~1200 psi for Class G at 100°F
  let strengthEffectPct = 0;
  for (const a of additives) {
    strengthEffectPct += a.effectOnCompressiveStrengthPct;
  }
  const compressiveStrength8hrPsi = basePsi8hr * (1 + strengthEffectPct / 100);

  // 24-hour strength (typically 2-3x 8-hour)
  const compressiveStrength24hrPsi = compressiveStrength8hrPsi * 2.5;

  // Transition time (static gel strength 48→500 psi)
  const baseTransitionMin = 45;
  const transitionTimeMin = baseTransitionMin * (1 - additiveEffectPct / 200); // additives can reduce

  // Fluid loss (API)
  const baseFluidLoss = 800; // cc/30min for neat cement
  const fluidLossCcPer30min = Math.max(20, baseFluidLoss * Math.exp(-0.015 * Math.abs(additiveEffectPct)));

  // Free water
  const freeWaterPct = Math.max(0, 1.5 - 0.02 * Math.abs(additiveEffectPct));

  // Rheology (Bingham Plastic, approximate from density and additives)
  const plasticViscosityCp = 30 + (densityPpg - 14) * 15;
  const yieldPointLbfPer100ft2 = 10 + (densityPpg - 14) * 8;
  const gel10secLbfPer100ft2 = yieldPointLbfPer100ft2 * 0.5;
  const gel10minLbfPer100ft2 = yieldPointLbfPer100ft2 * 1.2;

  // Displacement volume (casing internal volume + surface lines)
  const casingInternalBblPerFt = (casingOdIn - 2 * (0.3)) ** 2 / 1029.4;
  const displacementVolumeBbl = casingInternalBblPerFt * sectionLengthFt + 5; // +5 bbl surface lines

  // Pump time (at typical 5-8 BPM cementing rate)
  const pumpRateBpm = 5;
  const pumpTimeHr = (totalSlurryVolumeBbl + displacementVolumeBbl) / (pumpRateBpm * 60);

  // Top of cement (from shoe, accounting for excess)
  const cementColumnFt = totalSlurryVolumeBbl / (openHoleAnnulusBblPerFt * excessFactor);
  const topOfCementFt = Math.max(0, sectionLengthFt - cementColumnFt);

  // WOC time (Wait on Cement — until 500 psi compressive strength)
  const requiredPsi = 500;
  const wocTimeHr = requiredPsi < compressiveStrength8hrPsi
    ? (requiredPsi / compressiveStrength8hrPsi) * 8
    : 8 + (requiredPsi - compressiveStrength8hrPsi) / (compressiveStrength24hrPsi - compressiveStrength8hrPsi) * 16;

  // Cost estimation
  const costPerSack = 12 + (densityPpg - 14) * 1.5;
  const additiveCost = additives.reduce((sum, a) => sum + a.concentration * 0.5, 0);
  const costUsd = sacksOfCement * (costPerSack + additiveCost);

  return {
    totalSlurryVolumeBbl,
    leadSlurryVolumeBbl,
    tailSlurryVolumeBbl,
    sacksOfCement,
    mixWaterBbl,
    thickeningTimeHr,
    compressiveStrength8hrPsi,
    compressiveStrength24hrPsi,
    transitionTimeMin,
    fluidLossCcPer30min,
    freeWaterPct,
    rheology: { plasticViscosityCp, yieldPointLbfPer100ft2, gel10secLbfPer100ft2, gel10minLbfPer100ft2 },
    displacementVolumeBbl,
    pumpTimeHr,
    topOfCementFt,
    wocTimeHr,
    costUsd,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. CEMENT BOND EVALUATION (CBL/VDL, USIT)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Evaluate cement bond quality from CBL/VDL and ultrasonic data.
 *
 * Bond Index = (Attenuation_log - Attenuation_free_pipe) /
 *              (Attenuation_100pct_bond - Attenuation_free_pipe)
 *
 * Normalized to 0-1 where 0 = free pipe, 1 = fully bonded.
 *
 * References: SPE 18144, SPE 49207, API RP 10B-6
 */
export function evaluateCementBond(input: CementBondInput): CementBondResult {
  const {
    cblAmplitudeMv, freePipeAmplitudeMv, attenuationDbPerFt,
    vdlFormationArrival, casingArrival, microannulusDetected,
    channelingDetected, contaminatedCementPct,
    usitAcousticImpedanceMrayl,
  } = input;

  // Bond index from CBL amplitude
  const amplitudeRatio = Math.max(0, Math.min(1, cblAmplitudeMv / freePipeAmplitudeMv));
  const bondIndexCbl = 1 - amplitudeRatio;

  // Bond index from attenuation
  const maxAttenuation = 12; // dB/ft for fully bonded (typical for 7" casing)
  const bondIndexAttenuation = Math.min(1, attenuationDbPerFt / maxAttenuation);

  // USIT impedance-based bond
  const bondIndexUsit = usitAcousticImpedanceMrayl >= 3.7
    ? 1.0
    : usitAcousticImpedanceMrayl > 2.0
      ? (usitAcousticImpedanceMrayl - 2.0) / 1.7
      : 0;

  // Composite bond index
  const bondIndex = (bondIndexCbl * 0.35 + bondIndexAttenuation * 0.35 + bondIndexUsit * 0.3)
    * (1 - contaminatedCementPct / 100)
    * (channelingDetected ? 0.6 : 1)
    * (microannulusDetected ? 0.7 : 1);

  // Qualitative interpretation
  let qualitativeIndex: CementBondResult['qualitativeIndex'];
  let zonalIsolation: CementBondResult['zonalIsolation'];

  if (bondIndex >= 0.8) {
    qualitativeIndex = 'good';
    zonalIsolation = 'adequate';
  } else if (bondIndex >= 0.5) {
    qualitativeIndex = 'fair';
    zonalIsolation = 'questionable';
  } else if (bondIndex >= 0.2) {
    qualitativeIndex = 'poor';
    zonalIsolation = 'failed';
  } else {
    qualitativeIndex = 'free-pipe';
    zonalIsolation = 'failed';
  }

  // Squeeze recommendation
  const squeezeRecommended = bondIndex < 0.5;
  const squeezeIntervalTopFt = 0;
  const squeezeIntervalBaseFt = 100;
  const squeezeGapFt = squeezeIntervalBaseFt - squeezeIntervalTopFt;

  // Squeeze volume estimation (1 bbl per 100 ft of poor bond)
  const squeezeVolumeBbl = squeezeGapFt / 100 * (1 - bondIndex) * 2;

  // Remedial method
  let remedialMethod = 'None — bond adequate';
  if (bondIndex < 0.8 && bondIndex >= 0.5) remedialMethod = 'Re-perforate and low-rate squeeze';
  else if (bondIndex < 0.5 && bondIndex >= 0.2) remedialMethod = 'Multi-stage squeeze cementing with hesitation';
  else if (bondIndex < 0.2) remedialMethod = 'Section mill and re-cement, or set scab liner';

  return {
    bondIndex,
    qualitativeIndex,
    zonalIsolation,
    squeezeRecommended,
    squeezeIntervalTopFt,
    squeezeIntervalBaseFt,
    squeezeVolumeBbl,
    remedialMethod,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. SQUEEZE CEMENTING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Squeeze cementing design — injection into perforations below frac pressure.
 *
 * Hesitation squeeze: pump, wait, pump, wait (dehydrates slurry against formation).
 * Running squeeze: continuous injection at constant rate.
 *
 * Surface pressure = Bottomhole pressure - hydrostatic head of cement column.
 * Must remain below fracture pressure to avoid uncontrolled propagation.
 */
export function designSqueezeCement(input: SqueezeCementInput): SqueezeCementResult {
  const {
    perforationDepthTopFt, perforationDepthBaseFt, injectionRateBpm,
    injectionPressurePsi, formationFracPressurePsi, slurryDensityPpg,
    slurryVolumeBbl, displacementVolumeBbl, squeezePressurePsi,
    hesitationSqueeze,
  } = input;

  const perfMidDepthFt = (perforationDepthTopFt + perforationDepthBaseFt) / 2;
  const grad = 0.052;

  // Hydrostatic of cement column
  const cementColumnPsi = slurryDensityPpg * grad * perfMidDepthFt;

  // Bottomhole injection pressure
  const bottomholePressurePsi = injectionPressurePsi + cementColumnPsi;
  const isBelowFracPressure = bottomholePressurePsi < formationFracPressurePsi;

  // Surface pressure when 1 sack left (minimum surface pressure)
  const annulusVolBbl = 3; // approximate behind-casing annulus
  const oneSackVolBbl = 1.15 / 5.615; // yield per sack in bbl
  const surfacePressureOneSackPsi = displacementVolumeBbl > 0
    ? squeezePressurePsi * (oneSackVolBbl / annulusVolBbl)
    : squeezePressurePsi * 0.2;

  // Final squeeze pressure (typically 500-1500 psi above injection)
  const finalSqueezePressurePsi = squeezePressurePsi + 500;

  // Estimated cement placed
  const estimatedCementPlacedBbl = slurryVolumeBbl * (isBelowFracPressure ? 0.8 : 0.3);

  // Success probability model
  let successProbability = 0.95;
  if (!isBelowFracPressure) successProbability -= 0.4;
  if (injectionRateBpm > 2) successProbability -= 0.1;
  if (hesitationSqueeze) successProbability += 0.1;
  successProbability = Math.max(0.1, Math.min(0.99, successProbability));

  // Number of stages
  const numberStages = hesitationSqueeze ? Math.ceil(slurryVolumeBbl / 2) : 1;

  // Total time
  const totalTimeHr = hesitationSqueeze
    ? numberStages * 0.5 + 2 // pump + wait cycles
    : slurryVolumeBbl / injectionRateBpm / 60 + 1;

  return {
    isBelowFracPressure,
    surfacePressureOneSackPsi,
    finalSqueezePressurePsi,
    estimatedCementPlacedBbl,
    successProbability,
    numberStages,
    totalTimeHr,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. CONVENIENCE: CASING DESIGN SUMMARY (multi-string)
// ═══════════════════════════════════════════════════════════════════════════════

export interface CasingDesignSummary {
  stringName: string;
  odIn: number;
  weightLbPerFt: number;
  grade: CasingGrade;
  topFt: number;
  shoeFt: number;
  connection: ConnectionType;
  burstSafety: number;
  collapseSafety: number;
  tensionSafety: number;
  triaxialSafety: number;
  kickToleranceBbl: number;
  costPerFt: number;
  totalCost: number;
  sourServiceOk: boolean;
}

/**
 * Generate a multi-string casing program summary with safety factor dashboard.
 */
export function summarizeCasingProgram(strings: {
  name: string; odIn: number; weightLbPerFt: number; grade: CasingGrade;
  topFt: number; shoeFt: number; connection: ConnectionType;
}[], output: {
  mudWeightPpg: number; fractureGradientPpg: number;
}): CasingDesignSummary[] {
  const grad = 0.052;

  return strings.map(s => {
    const gradeProps = CASING_GRADES[s.grade];
    const connProps = CONNECTION_TYPES[s.connection];
    const wallIn = s.weightLbPerFt / (3.46 * s.odIn);

    // Simple burst/collapse checks at shoe
    const internalPressurePsi = output.mudWeightPpg * grad * s.shoeFt * 1.1; // 10% surge
    const externalPressurePsi = output.mudWeightPpg * grad * s.shoeFt * 1.0;
    const burstLimit = gradeProps.minYieldKsi * 1000 * 2 * wallIn / s.odIn * 0.875;
    const burstSafety = internalPressurePsi > 0 ? burstLimit / internalPressurePsi : 99;

    const dOverT = s.odIn / Math.max(wallIn, 0.01);
    const collapseLimit = dOverT > 30
      ? 46.95e6 / (dOverT * (dOverT - 1) ** 2)
      : gradeProps.minYieldKsi * 1000 * (2.0 / dOverT - 0.0363);
    const collapseSafety = externalPressurePsi > 0 ? collapseLimit / externalPressurePsi : 99;

    const length = s.shoeFt - s.topFt;
    const axialLoad = s.weightLbPerFt * length * (1 - output.mudWeightPpg / 65.4); // buoyed
    const axialCapacity = gradeProps.minYieldKsi * 1000 * Math.PI / 4 * (s.odIn ** 2 - (s.odIn - 2 * wallIn) ** 2);
    const tensionSafety = axialLoad > 0 ? axialCapacity / axialLoad : 99;

    const triaxialSafety = Math.min(burstSafety, collapseSafety, tensionSafety) * 0.95;

    // Kick tolerance at shoe (simplified)
    const shoeFracPsi = output.fractureGradientPpg * grad * s.shoeFt;
    const shoeMudPsi = output.mudWeightPpg * grad * s.shoeFt;
    const kickTolerance = Math.max(0, (shoeFracPsi - shoeMudPsi) / (grad * s.shoeFt));

    // Cost (material + connection premium)
    const costPerFt = s.weightLbPerFt * gradeProps.costMultiplier * connProps.costMultiplier * 2.5;
    const totalCost = costPerFt * length;

    return {
      stringName: s.name,
      odIn: s.odIn,
      weightLbPerFt: s.weightLbPerFt,
      grade: s.grade,
      topFt: s.topFt,
      shoeFt: s.shoeFt,
      connection: s.connection,
      burstSafety,
      collapseSafety,
      tensionSafety,
      triaxialSafety,
      kickToleranceBbl: kickTolerance * 10,
      costPerFt,
      totalCost,
      sourServiceOk: gradeProps.sourService && output.mudWeightPpg > 0,
    };
  });
}