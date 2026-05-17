/**
 * ─── Well Control, Kick Management & Pipe Sticking ───
 * Sub-Steps 3.1.4, 3.2.1, 3.2.2 — PetroStream Suite
 *
 * Covers:
 *   - Kick detection: pit gain, SIDPP, SICP, kick tolerance
 *   - Kill methods: Driller's method, Wait & Weight, Volumetric, Bullheading
 *   - Gas migration & bubble expansion (single-phase/slug model)
 *   - Kick tolerance & maximum allowable annular surface pressure (MAASP)
 *   - Lost circulation: fracture gradient, LCM selection, wellbore strengthening
 *   - Stuck pipe: differential sticking (Outmans 1958), mechanical sticking
 *   - Jar placement, overpull limits, fishing basics
 *   - Underground blowout & crossflow modeling
 *
 * References:
 *   - API RP 59 — Well Control Operations
 *   - SPE 20410 — Gas Migration in Deviated Wells
 *   - Outmans, H.D. (1958) "Mechanics of Differential Pressure Sticking..." SPE 963
 *   - SPE 15951 — Kick Tolerance & Well Control
 *   - IADC WellCAP curriculum
 *   - Watson, D. (1984) "Surface BOP Stack Requirements" SPE 11463
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface KickDetectionInput {
  pitGainBbl: number;
  flowOutIncreasePct: number;
  ropIncreasePct: number;
  drillingBreak: boolean;
  connectionGasBackgroundUnits: number;
  connectionGasPeakUnits: number;
  mudWeightPpg: number;
  formationPressurePpg: number;
  holeDiameterIn: number;
  pipeOdIn: number;
  bitDepthFt: number;
  tvdFt: number;
}

export interface KickResult {
  kickSeverity: 'no-kick' | 'minor' | 'moderate' | 'major' | 'blowout-risk';
  pitGainBbl: number;
  influxType: 'gas' | 'oil' | 'water' | 'mixed';
  initialSidppPsi: number;          // Shut-In Drill Pipe Pressure
  initialSicpPsi: number;           // Shut-In Casing Pressure
  kickFluidDensityPpg: number;
  kickHeightFt: number;
  killMudWeightPpg: number;
  maxAllowableSurfacePressurePsi: number;
  maxAllowablePitGainBbl: number;   // kick tolerance
  timeToCirculateKickMin: number;
}

export interface KillMethodInput {
  kickResult: KickResult;
  pumpRateKillGpm: number;
  strokesToBit: number;
  strokesToSurface: number;
  totalStrokes: number;
  slowCirculatingRatePsi: number;   // SCR at kill rate
  casingBurstPressurePsi: number;
  formationFracPressurePsi: number;
}

export interface KillMethodResult {
  killType: 'drillers' | 'wait-and-weight' | 'volumetric' | 'bullheading';
  initialCirculatingPressurePsi: number;
  finalCirculatingPressurePsi: number;
  pressureDropSchedule: { strokes: number; pressurePsi: number }[];
  killTimeMin: number;
  killMudVolumeBbl: number;
  pitGainAtGasToSurfaceBbl: number;
  maxCasingPressurePsi: number;
  maxCasingPressureAtGasToSurfacePsi: number;
  isWithinLimits: boolean;
  bullheadPressurePsi: number;
  volumetricCycles: number;
}

export interface GasMigrationInput {
  initialKickVolumeBbl: number;
  gasDensityPpg: number;
  mudWeightPpg: number;
  initialDepthFt: number;
  holeDiameterIn: number;
  pipeOdIn: number;
  shutInPressurePsi: number;
  formationPressurePsi: number;
  temperatureGradientDegFPer100ft: number;
  surfaceTempF: number;
  migrationTimeMin: number;
}

export interface GasMigrationResult {
  gasPositionFt: number;
  gasVolumeAtNewDepthBbl: number;
  gasPressurePsi: number;
  casingPressureIncreasePsi: number;
  surfacePressureAfterMigrationPsi: number;
  gasBubbleVelocityFtPerMin: number;
  timeToSurfaceMin: number;
  maximumGasExpansionRatio: number;
  recommendedBleedProcedure: 'continuous' | 'step' | 'immediate-kill';
}

export interface LostCirculationInput {
  mudWeightPpg: number;
  ecdPpg: number;
  formationFractureGradientPpg: number;
  porePressurePpg: number;
  lostCirculationRateBblPerHr: number;
  lossesDepthFt: number;
  holeDiameterIn: number;
  formationType: 'sandstone' | 'carbonate' | 'shale' | 'fractured' | 'vugular';
}

export interface LostCirculationResult {
  severity: 'seepage' | 'partial' | 'severe' | 'total';
  fractureWidthIn: number;
  lcmType: 'fine' | 'medium' | 'coarse' | 'combination' | 'cement-plug';
  lcmConcentrationPpb: number;      // pounds per barrel
  lcmPillVolumeBbl: number;
  proposedMudWeightReductionPpg: number;
  wellboreStrengtheningMaterial: string;
  squeezeltInjectionPressurePsi: number;
  spottingVolumeBbl: number;
  successProbabilityPct: number;
  wellboreStrengtheningPressurePsi: number;
}

export interface StuckPipeInput {
  differentialPressurePsi: number;
  formationPermeabilityMd: number;
  mudCakeThicknessIn: number;
  contactLengthFt: number;          // length of pipe contacting wall
  pipeOdIn: number;
  pipeWeightLbPerFt: number;
  holeAngleDeg: number;
  timeSinceStuckHr: number;
  overbalancePsi: number;
  mudType: 'WBM' | 'OBM' | 'SBM';
}

export interface StuckPipeResult {
  stickingType: 'differential' | 'mechanical' | 'wellbore-geometry' | 'packoff';
  differentialStickingForceLbf: number;
  requiredPullingForceLbf: number;
  maxSafeOverpullLbf: number;
  requiredJarForceLbf: number;
  recommendedJarType: 'hydraulic' | 'mechanical' | 'double-acting';
  jarPlacementDepthFt: number;
  spottingFluidVolumeBbl: number;
  spottingFluidDensityPpg: number;
  spottingFluidType: 'diesel' | 'mineral-oil' | 'acid' | 'freshwater';
  spottingSoakTimeRecommendedHr: number;
  successProbabilityPct: number;
  backupOption: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. KICK DETECTION & INITIAL SHUT-IN
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze kick indicators and compute initial shut-in pressures.
 *
 * Kick Fluid Density from shut-in pressures:
 *   ρ_kick = ρ_mud - (SICP - SIDPP) / (0.052 × h_kick)
 *   where h_kick = pit_gain / annular_capacity
 *
 * Kill Mud Weight:
 *   KMW = ρ_mud + SIDPP / (0.052 × TVD)
 *
 * MAASP (Maximum Allowable Annular Surface Pressure):
 *   MAASP = (FG - ρ_mud) × 0.052 × shoe_TVD
 */
export function detectKick(input: KickDetectionInput): KickResult {
  const {
    pitGainBbl, flowOutIncreasePct, ropIncreasePct,
    drillingBreak, connectionGasBackgroundUnits, connectionGasPeakUnits,
    mudWeightPpg, formationPressurePpg, holeDiameterIn,
    pipeOdIn, bitDepthFt, tvdFt,
  } = input;

  // Annular capacity
  const annularCapacityBblPerFt = (holeDiameterIn ** 2 - pipeOdIn ** 2) / 1029.4;

  // Determine influx type from indicators
  let influxType: KickResult['influxType'] = 'mixed';
  const gasRatio = connectionGasPeakUnits / Math.max(1, connectionGasBackgroundUnits);

  if (gasRatio > 3 && drillingBreak) {
    influxType = 'gas';
  } else if (flowOutIncreasePct > 20 && ropIncreasePct > 50) {
    influxType = 'gas';
  } else if (pitGainBbl > 5 && flowOutIncreasePct > 10) {
    influxType = 'oil';
  } else if (pitGainBbl > 3 && ropIncreasePct < 10) {
    influxType = 'water';
  }

  // SIDPP estimate (from formation pressure - mud hydrostatic)
  const mudHydrostaticPsi = 0.052 * mudWeightPpg * tvdFt;
  const formationPressureEstPsi = 0.052 * formationPressurePpg * tvdFt;
  const initialSidppPsi = Math.max(0, formationPressureEstPsi - mudHydrostaticPsi);

  // SICP estimate (SIDPP + influx hydrostatic deficit)
  const kickHeightFt = annularCapacityBblPerFt > 0
    ? pitGainBbl / annularCapacityBblPerFt
    : 0;

  // Assume kick fluid gradient between gas (0.1 psi/ft) and water (0.465 psi/ft)
  const gasGradientPsiPerFt = 0.1;
  const waterGradientPsiPerFt = 0.465;
  let kickGradientPsiPerFt = waterGradientPsiPerFt;
  if (influxType === 'gas') kickGradientPsiPerFt = gasGradientPsiPerFt;
  else if (influxType === 'oil') kickGradientPsiPerFt = 0.25;

  const mudGradientPsiPerFt = 0.052 * mudWeightPpg;
  const kickDensityPpg = kickGradientPsiPerFt / 0.052;
  const influxHydrostaticDeficitPsi = (mudGradientPsiPerFt - kickGradientPsiPerFt) * kickHeightFt;
  const initialSicpPsi = initialSidppPsi + influxHydrostaticDeficitPsi;

  // Kill mud weight
  const killMudWeightPpg = tvdFt > 0
    ? mudWeightPpg + initialSidppPsi / (0.052 * tvdFt)
    : mudWeightPpg;

  // Kick severity classification
  let kickSeverity: KickResult['kickSeverity'];
  if (pitGainBbl < 5 && initialSidppPsi < 100) {
    kickSeverity = 'no-kick';
  } else if (pitGainBbl < 10 && initialSidppPsi < 300) {
    kickSeverity = 'minor';
  } else if (pitGainBbl < 20 && initialSidppPsi < 500) {
    kickSeverity = 'moderate';
  } else if (pitGainBbl < 40) {
    kickSeverity = 'major';
  } else {
    kickSeverity = 'blowout-risk';
  }

  // MAASP (fracture at shoe) — simplified
  const shoeTvd = tvdFt * 0.7; // assume shoe at 70% of TVD
  const fracGradientPpg = 0.8;  // psi/ft → ppg: 0.8/0.052 = 15.4 ppg
  const maxAllowableSurfacePressurePsi = 0.052 * (fracGradientPpg / 0.052 - mudWeightPpg) * shoeTvd;

  // Kick tolerance (max pit gain before exceeding fracture at shoe)
  const maxAllowablePitGainBbl = annularCapacityBblPerFt > 0
    ? Math.max(0, (maxAllowableSurfacePressurePsi - initialSicpPsi) / mudGradientPsiPerFt) * annularCapacityBblPerFt
    : 50;

  // Time to circulate kick (bottom up)
  const pumpRateBpm = 8; // barrels per minute typical kill rate
  const annularVolumeBbl = bitDepthFt * annularCapacityBblPerFt;
  const timeToCirculateKickMin = pumpRateBpm > 0
    ? annularVolumeBbl / pumpRateBpm
    : 60;

  return {
    kickSeverity,
    pitGainBbl,
    influxType,
    initialSidppPsi,
    initialSicpPsi,
    kickFluidDensityPpg: kickDensityPpg,
    kickHeightFt,
    killMudWeightPpg,
    maxAllowableSurfacePressurePsi,
    maxAllowablePitGainBbl,
    timeToCirculateKickMin,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. KILL METHODS: DRILLER'S, WAIT & WEIGHT, VOLUMETRIC, BULLHEADING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate kill sheet for specified kill method.
 *
 * Driller's Method:
 *   1st circulation: circulate influx out with original mud
 *   2nd circulation: circulate kill mud
 *
 * Wait & Weight:
 *   Single circulation with kill mud from start
 *   ICP = SIDPP + SCR   (Initial Circulating Pressure)
 *   FCP = KMW / OMW × SCR   (Final Circulating Pressure)
 *
 * Volumetric:
 *   Bleed casing pressure while maintaining constant BHP
 *
 * Bullheading:
 *   Pump mud down annulus or drill pipe to force influx back into formation
 */
export function calculateKillMethod(input: KillMethodInput): KillMethodResult {
  const {
    kickResult, pumpRateKillGpm, strokesToBit, strokesToSurface,
    totalStrokes, slowCirculatingRatePsi, casingBurstPressurePsi,
    formationFracPressurePsi,
  } = input;

  const { initialSidppPsi, killMudWeightPpg, kickFluidDensityPpg,
    pitGainBbl, influxType, maxAllowableSurfacePressurePsi } = kickResult;

  const mudWeightPpg = killMudWeightPpg - initialSidppPsi / (0.052 * kickResult.kickHeightFt / 0.7);

  // Wait & Weight method (preferred for most kicks)
  const icp = initialSidppPsi + slowCirculatingRatePsi;
  const fcp = mudWeightPpg > 0 ? (killMudWeightPpg / mudWeightPpg) * slowCirculatingRatePsi : slowCirculatingRatePsi;

  // Pressure drop schedule (linear drop from ICP to FCP by strokes to bit)
  const pressureDropSchedule: { strokes: number; pressurePsi: number }[] = [];
  const numSteps = 10;
  const pressureDropPerStep = (icp - fcp) / numSteps;
  const strokesPerStep = strokesToBit / numSteps;

  for (let i = 0; i <= numSteps; i++) {
    pressureDropSchedule.push({
      strokes: Math.round(i * strokesPerStep),
      pressurePsi: Math.round(icp - i * pressureDropPerStep),
    });
  }

  // Kill time
  const strokesPerMin = pumpRateKillGpm / 0.026;
  const killTimeMin = strokesPerMin > 0 ? totalStrokes / strokesPerMin : 120;

  // Kill mud volume
  const killMudVolumeBbl = totalStrokes * 0.026;

  // Gas expansion at surface (worst case)
  const gasExpansionRatio = influxType === 'gas' ? 100 : 10;
  const pitGainAtGasToSurfaceBbl = pitGainBbl * gasExpansionRatio;

  // Max casing pressure when gas reaches surface
  const maxCasingPressureAtGasToSurfacePsi = Math.min(
    casingBurstPressurePsi * 0.8,
    initialSidppPsi + pitGainAtGasToSurfaceBbl * 0.052 * mudWeightPpg * 2
  );

  // Check if within limits
  const isWithinLimits = maxCasingPressureAtGasToSurfacePsi < Math.min(
    casingBurstPressurePsi * 0.8,
    formationFracPressurePsi * 0.9
  );

  // Bullhead pressure
  const bullheadPressurePsi = formationFracPressurePsi - 200;

  // Volumetric cycles
  const volumetricCycles = Math.ceil(pitGainBbl / 5);

  return {
    killType: 'wait-and-weight',
    initialCirculatingPressurePsi: icp,
    finalCirculatingPressurePsi: fcp,
    pressureDropSchedule,
    killTimeMin,
    killMudVolumeBbl,
    pitGainAtGasToSurfaceBbl,
    maxCasingPressurePsi: fcp,
    maxCasingPressureAtGasToSurfacePsi,
    isWithinLimits,
    bullheadPressurePsi,
    volumetricCycles,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. GAS MIGRATION & BUBBLE BEHAVIOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Model gas bubble migration in shut-in well.
 *
 * Gas rising: velocity depends on mud rheology and annular geometry
 *   V_slip ≈ 0.1 - 0.5 ft/sec (Taylor bubble velocity in annulus)
 *
 * Boyle's Law for gas expansion:
 *   P₁V₁ = P₂V₂ (isothermal)
 *   Gas pressure increases as bubble rises (hydrostatic)
 *
 * Casing pressure increases if gas is not bled off properly.
 */
export function modelGasMigration(input: GasMigrationInput): GasMigrationResult {
  const {
    initialKickVolumeBbl, gasDensityPpg, mudWeightPpg,
    initialDepthFt, holeDiameterIn, pipeOdIn,
    shutInPressurePsi, formationPressurePsi,
    temperatureGradientDegFPer100ft, surfaceTempF,
    migrationTimeMin,
  } = input;

  const annularCapacityBblPerFt = (holeDiameterIn ** 2 - pipeOdIn ** 2) / 1029.4;
  const mudPressureGradientPsiPerFt = 0.052 * mudWeightPpg;

  // Initial gas bubble height
  const initialGasHeightFt = annularCapacityBblPerFt > 0
    ? initialKickVolumeBbl / annularCapacityBblPerFt
    : 0;

  // Gas bubble velocity (Taylor bubble in annulus)
  const gasBubbleVelocityFtPerMin = 60; // 1 ft/sec typical

  // Gas position after migration time
  const migrationDistanceFt = gasBubbleVelocityFtPerMin * migrationTimeMin;
  const gasPositionFt = Math.max(0, initialDepthFt - migrationDistanceFt);

  // Gas pressure at new depth (hydrostatic reduction)
  const depthChangeFt = initialDepthFt - gasPositionFt;
  const hydrostaticReductionPsi = depthChangeFt * mudPressureGradientPsiPerFt;
  const gasPressurePsi = formationPressurePsi - hydrostaticReductionPsi;

  // Gas volume at new depth (Boyle's Law)
  const initialGasPressurePsi = formationPressurePsi;
  const gasVolumeAtNewDepthBbl = gasPressurePsi > 0
    ? initialGasPressurePsi * initialKickVolumeBbl / gasPressurePsi
    : initialKickVolumeBbl * 10;

  // Casing pressure increase (if gas not bled)
  const casingPressureIncreasePsi = hydrostaticReductionPsi;

  // Surface pressure
  const surfacePressureAfterMigrationPsi = shutInPressurePsi + casingPressureIncreasePsi;

  // Time to surface
  const timeToSurfaceMin = gasBubbleVelocityFtPerMin > 0
    ? gasPositionFt / gasBubbleVelocityFtPerMin
    : 0;

  // Maximum expansion ratio
  const surfacePressurePsi = 14.7; // atmospheric
  const maximumGasExpansionRatio = surfacePressurePsi > 0
    ? formationPressurePsi / surfacePressurePsi
    : 100;

  // Bleed recommendation
  let recommendedBleedProcedure: 'continuous' | 'step' | 'immediate-kill';
  if (gasVolumeAtNewDepthBbl > initialKickVolumeBbl * 3) {
    recommendedBleedProcedure = 'continuous';
  } else if (casingPressureIncreasePsi > 100) {
    recommendedBleedProcedure = 'step';
  } else {
    recommendedBleedProcedure = 'immediate-kill';
  }

  return {
    gasPositionFt,
    gasVolumeAtNewDepthBbl,
    gasPressurePsi,
    casingPressureIncreasePsi,
    surfacePressureAfterMigrationPsi,
    gasBubbleVelocityFtPerMin,
    timeToSurfaceMin,
    maximumGasExpansionRatio,
    recommendedBleedProcedure,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. LOST CIRCULATION ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze lost circulation severity and recommend LCM treatment.
 *
 * Lost circulation severity:
 *   - Seepage: < 10 bbl/hr
 *   - Partial: 10-30 bbl/hr, mud returns reduced
 *   - Severe: > 30 bbl/hr, no returns at surface
 *   - Total: complete loss, unable to keep hole full
 *
 * Fracture width estimation (from equivalent fracture gradient):
 *   w = (ΔP × r_w) / (E × β)
 *
 * LCM selection based on fracture width + formation type
 */
export function analyzeLostCirculation(input: LostCirculationInput): LostCirculationResult {
  const {
    mudWeightPpg, ecdPpg, formationFractureGradientPpg,
    porePressurePpg, lostCirculationRateBblPerHr,
    lossesDepthFt, holeDiameterIn, formationType,
  } = input;

  // Severity classification
  let severity: LostCirculationResult['severity'];
  if (lostCirculationRateBblPerHr < 5) severity = 'seepage';
  else if (lostCirculationRateBblPerHr < 20) severity = 'partial';
  else if (lostCirculationRateBblPerHr < 50) severity = 'severe';
  else severity = 'total';

  // Fracture width estimation
  const deltaPressureOverFracPsi = Math.max(0, 0.052 * (ecdPpg - formationFractureGradientPpg) * lossesDepthFt);
  const youngsModulusPsi = 3e6; // typical for sandstone
  const fractureWidthIn = deltaPressureOverFracPsi * holeDiameterIn / (youngsModulusPsi * 0.8);

  // LCM type selection
  let lcmType: LostCirculationResult['lcmType'];
  let lcmConcentrationPpb: number;

  if (fractureWidthIn < 0.02) {
    lcmType = 'fine';
    lcmConcentrationPpb = 15;
  } else if (fractureWidthIn < 0.05) {
    lcmType = 'medium';
    lcmConcentrationPpb = 25;
  } else if (fractureWidthIn < 0.1) {
    lcmType = 'coarse';
    lcmConcentrationPpb = 40;
  } else if (fractureWidthIn < 0.2) {
    lcmType = 'combination';
    lcmConcentrationPpb = 60;
  } else {
    lcmType = 'cement-plug';
    lcmConcentrationPpb = 100;
  }

  // LCM pill volume (2× open-hole annular volume near loss zone)
  const lcmIntervalFt = 200; // treat 200 ft around loss zone
  const annularVolBblPerFt = (holeDiameterIn ** 2) / 1029.4; // open hole
  const lcmPillVolumeBbl = annularVolBblPerFt * lcmIntervalFt * 2;

  // Mud weight reduction
  const proposedMudWeightReductionPpg = Math.max(0, ecdPpg - formationFractureGradientPpg + 0.3);

  // Wellbore strengthening material
  const wellboreStrengtheningMaterial = fractureWidthIn < 0.03
    ? 'calcium-carbonate-fine'
    : fractureWidthIn < 0.06
      ? 'graphite-medium'
      : 'nut-shell-coarse';

  // Squeeze injection pressure
  const squeezeltInjectionPressurePsi = 0.052 * (ecdPpg - porePressurePpg) * lossesDepthFt * 1.05;

  // Spotting volume
  const spottingVolumeBbl = lcmPillVolumeBbl * 1.5;

  // Success probability
  let successProbabilityPct: number;
  if (severity === 'seepage') successProbabilityPct = 95;
  else if (severity === 'partial') successProbabilityPct = 80;
  else if (severity === 'severe') successProbabilityPct = 55;
  else successProbabilityPct = 25;

  // Wellbore strengthening pressure
  const wellboreStrengtheningPressurePsi = formationFractureGradientPpg * 0.052 * lossesDepthFt * 0.05;

  return {
    severity,
    fractureWidthIn,
    lcmType,
    lcmConcentrationPpb,
    lcmPillVolumeBbl,
    proposedMudWeightReductionPpg,
    wellboreStrengtheningMaterial,
    squeezeltInjectionPressurePsi,
    spottingVolumeBbl,
    successProbabilityPct,
    wellboreStrengtheningPressurePsi,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. STUCK PIPE ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze stuck pipe and recommend freeing strategy.
 *
 * Differential Sticking (Outmans 1958):
 *   F_stick = ΔP × A_contact × μ_cake
 *   where ΔP = overbalance, A_contact = embedded pipe contact area
 *
 * Freeing force:
 *   F_free = F_stick × safety factor (1.5-2.0)
 *
 * Jar placement: above BHA top, in tension section
 *
 * Spotting fluid: diesel, mineral oil, acid, freshwater to break mud cake
 */
export function analyzeStuckPipe(input: StuckPipeInput): StuckPipeResult {
  const {
    differentialPressurePsi, formationPermeabilityMd,
    mudCakeThicknessIn, contactLengthFt,
    pipeOdIn, pipeWeightLbPerFt, holeAngleDeg,
    timeSinceStuckHr, overbalancePsi, mudType,
  } = input;

  // Differential sticking force
  const embeddedDepthIn = mudCakeThicknessIn * 0.5; // pipe embeds half the cake
  const embeddedArcDeg = Math.acos(1 - 2 * embeddedDepthIn / pipeOdIn) * 180 / Math.PI;
  const contactAreaIn2 = pipeOdIn * embeddedArcDeg / 360 * 12 * contactLengthFt;
  const frictionCoefficient = mudType === 'OBM' ? 0.15 : 0.2;

  const differentialStickingForceLbf = differentialPressurePsi * contactAreaIn2 * frictionCoefficient;

  // Required pulling force
  const safetyFactorForStuck = 1.5;
  const requiredPullingForceLbf = differentialStickingForceLbf * safetyFactorForStuck;

  // Determine sticking type
  let stickingType: StuckPipeResult['stickingType'];
  if (overbalancePsi > 500 && formationPermeabilityMd > 50) {
    stickingType = 'differential';
  } else if (holeAngleDeg > 60 && contactLengthFt > 50) {
    stickingType = 'wellbore-geometry';
  } else if (timeSinceStuckHr < 0.5) {
    stickingType = 'packoff';
  } else {
    stickingType = 'mechanical';
  }

  // Max safe overpull (75% of pipe yield for Grade S-135)
  const pipeYield85Lbf = 135000 * Math.PI / 4 * (pipeOdIn ** 2 - (pipeOdIn - 0.5) ** 2);
  const maxSafeOverpullLbf = pipeYield85Lbf * 0.75;

  // Jar force requirements
  const jarImpactForceRequiredLbf = stickingType === 'differential'
    ? differentialStickingForceLbf * 0.8
    : differentialStickingForceLbf * 1.2;
  const requiredJarForceLbf = Math.min(jarImpactForceRequiredLbf, maxSafeOverpullLbf * 0.8);

  // Jar type recommendation
  let recommendedJarType: StuckPipeResult['recommendedJarType'];
  if (stickingType === 'differential') {
    recommendedJarType = 'hydraulic';
  } else {
    recommendedJarType = 'double-acting';
  }

  // Jar placement (above BHA, in highest tension zone)
  const bhaLengthFt = 300; // approximate
  const jarPlacementDepthFt = bhaLengthFt * 1.2;

  // Spotting fluid volume
  const annularVolBblPerFt = (holeAngleDeg > 45 ? 1.2 : 1.0) * pipeOdIn ** 2 / 1029.4;
  const spottingFluidVolumeBbl = annularVolBblPerFt * (contactLengthFt + 100); // cover stuck zone + 100ft

  // Spotting fluid type
  let spottingFluidType: StuckPipeResult['spottingFluidType'];
  if (mudType === 'OBM' || mudType === 'SBM') {
    spottingFluidType = 'acid';
  } else if (stickingType === 'differential') {
    spottingFluidType = 'diesel';
  } else {
    spottingFluidType = 'freshwater';
  }

  const spottingFluidDensityPpg = spottingFluidType === 'diesel' ? 6.8 : 8.34;

  // Soak time recommendation
  const spottingSoakTimeRecommendedHr = stickingType === 'differential'
    ? Math.min(24, Math.max(4, timeSinceStuckHr * 2))
    : 6;

  // Success probability
  let successProbabilityPct: number;
  if (stickingType === 'differential' && timeSinceStuckHr < 8) {
    successProbabilityPct = 85;
  } else if (stickingType === 'differential') {
    successProbabilityPct = 60;
  } else if (stickingType === 'packoff') {
    successProbabilityPct = 70;
  } else {
    successProbabilityPct = 40;
  }

  // Backup option
  let backupOption: string;
  if (stickingType === 'differential') {
    backupOption = 'reduce-hydrostatic-then-jar';
  } else if (stickingType === 'mechanical') {
    backupOption = 'backoff-and-fish';
  } else if (stickingType === 'wellbore-geometry') {
    backupOption = 'ream-and-washover';
  } else {
    backupOption = 'circulate-high-rate-then-jar';
  }

  return {
    stickingType,
    differentialStickingForceLbf,
    requiredPullingForceLbf,
    maxSafeOverpullLbf,
    requiredJarForceLbf,
    recommendedJarType,
    jarPlacementDepthFt,
    spottingFluidVolumeBbl,
    spottingFluidDensityPpg,
    spottingFluidType,
    spottingSoakTimeRecommendedHr,
    successProbabilityPct,
    backupOption,
  };
}