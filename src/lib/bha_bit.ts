/**
 * ─── BHA Design & Bit Optimization ───
 * Sub-Step 3.1.3 — PetroStream Suite
 *
 * Covers:
 *   - BHA weight & neutral-point calculation
 *   - Stabilizer placement & bottom-hole assembly stiffness
 *   - Bit side force & build/drop/turn tendency
 *   - Mud motor performance: torque, RPM, differential pressure
 *   - RSS (Rotary Steerable System) dogleg capability
 *   - Bit optimization: WOB/RPM sweet spot, MSE, ROP prediction (Bourgoyne & Young)
 *   - Drill-off test analysis
 *   - Bit grading & IADC dull grading code
 *   - Specific energy & drilling efficiency
 *
 * References:
 *   - Bourgoyne & Young (1974) "Multiple Regression Approach to Optimal Drilling" SPE 4238
 *   - Teale, R. (1965) "The Concept of Specific Energy..." Int J Rock Mech
 *   - SPE 11380 — Torque & Drag directional
 *   - SPE 30350 — BHAs for directional control
 *   - IADC Dull Grading System (SPE/IADC 23939)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BHAInput {
  // Drill collars
  drillCollarOdIn: number;
  drillCollarIdIn: number;
  drillCollarLengthFt: number;
  drillCollarWeightLbPerFt: number;

  // HWDP
  hwdpOdIn: number;
  hwdpIdIn: number;
  hwdpLengthFt: number;
  hwdpWeightLbPerFt: number;

  // Drill pipe
  drillPipeOdIn: number;
  drillPipeWeightLbPerFt: number;

  // Stabilizers
  stabilizers: StabilizerInput[];

  // Operating parameters
  mudWeightPpg: number;
  wobLbf: number;
  inclinationDeg: number;
  holeDiameterIn: number;
  formationUcsPsi: number; // Unconfined Compressive Strength

  // Safety
  desiredSafetyFactor: number; // typically 1.15–1.25
}

export interface StabilizerInput {
  mdFt: number; // measured depth position from bit
  odIn: number; // stabilizer OD (typically 1/16" undergauge)
  gaugeLengthFt: number;
  type: 'integral' | 'sleeve' | 'roller-reamer';
}

export interface BHAResult {
  // Weight
  totalBhaWeightLbf: number;
  buoyedBhaWeightLbf: number;
  neutralPointFt: number;  // from bit upward where compression → tension
  percentDcInCompressionPct: number;

  // Stiffness
  bhaStiffnessLbIn2: number;
  criticalBucklingLoadLbf: number;

  // Bend analysis
  bitSideForceLbf: number;
  bitTiltAngleDeg: number;
  buildRateDegPer100ft: number; // predicted dogleg
  tendency: 'build' | 'drop' | 'neutral' | 'strong-build' | 'strong-drop';

  // Safety
  maxWobWithoutBucklingLbf: number;
  safetyFactor: number;
  marginOfOverpullLbf: number;
  maxDoglegSeverityDegPer100ft: number;

  // Stabilizer effectiveness
  effectiveStabilizerContact: boolean[];
}

export interface MotorInput {
  motorType: 'positive-displacement' | 'turbine';
  stages: number;
  stagePressureDropPsi: number; // per stage at max load
  rotorNozzleSize32ndIn: number; // bypass nozzle
  motorRpmPerGpm: number; // rev/gal
  motorMaxTorqueFtLb: number;
  motorMaxDiffPressurePsi: number;
  motorOdIn: number;
  bendAngleDeg: number; // adjustable bend setting
}

export interface MotorResult {
  motorRpm: number;
  motorTorqueFtLb: number;
  motorDiffPressurePsi: number;
  mechanicalHorsepowerHp: number;
  bitRpm: number; // motor RPM + string RPM
  totalBitRpm: number;
  bendDoglegDegPer100ft: number;
  maxDlsCapacityDegPer100ft: number;
  motorPressureLossPsi: number;
  motorEfficiencyPct: number;
  optimalFlowRateGpm: number;
  stallWobLbf: number;
}

export interface RSSInput {
  rssType: 'point-the-bit' | 'push-the-bit';
  steeringPadForceLbf: number;
  rssOdIn: number;
  holeDiameterIn: number;
  inclinationDeg: number;
  drillCollarOdIn: number;
}

export interface RSSResult {
  effectiveSideForceLbf: number;
  dlsCapacityDegPer100ft: number;
  steeringRatioPct: number; // % of full steering force used
  minimumFlowRateGpm: number;
  buildRateAtMaxForceDegPer100ft: number;
  turnRateCapability: number;
  requiredPadsActive: number;
  steeringWindow: 'narrow' | 'moderate' | 'wide';
}

export interface BitOptimizationInput {
  bitDiameterIn: number;
  bitType: 'PDC' | 'roller-cone' | 'hybrid' | 'impregnated';
  iadcCode: string; // e.g., "M223" or "111" for roller-cone
  jetNozzles32ndIn: number[]; // TFA nozzles
  formationUcsPsi: number;
  formationAbrasiveness: 'low' | 'medium' | 'high';
  confiningPressurePsi: number;
  mudWeightPpg: number;
  rpm: number;
  wobRangeLbf: [number, number]; // min, max
  bitCostUsd: number;
  rigRateUsdPerHr: number;
  tripTimeHr: number;
  previousBitFootageFt: number;
  previousIadcDullGrade: string; // e.g., "1-2-WT-A-X-I-NO-PR"
}

export interface BitOptimizationResult {
  optimalWobLbf: number;
  optimalRpm: number;
  predictedRopFtPerHr: number;
  mechanicalSpecificEnergyKsi: number;
  bitHsi: number;
  drillingEfficiencyPct: number;
  costPerFootUsd: number;
  expectedFootageFt: number;
  expectedBitLifeHr: number;
  recommendedWobRange: [number, number];
  recommendedRpmRange: [number, number];
  jetImpactForceLbf: number;
  formationDrillability: number;
}

export interface MSEResult {
  mechanicalSpecificEnergyKsi: number;
  hydroMechanicalSpecificEnergyKsi: number;
  drillingEfficiencyPct: number;
  energyLostToFrictionPct: number;
  minimumMseKsi: number; // found at optimal WOB/RPM
  optimalWobFromMseLbf: number;
  optimalRpmFromMse: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. BHA WEIGHT, NEUTRAL POINT & BUCKLING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate BHA weight, neutral point, and buckling limits.
 *
 * Neutral Point: depth from bit where axial stress transitions from compression to tension.
 *   N = WOB / (w_dc × BF)
 *   where w_dc = drill collar weight per ft, BF = buoyancy factor
 *
 * For safety, 80-85% of DC weight should be in compression (neutral point within DCs).
 * Remaining 15-20% of DC length in tension = safety margin for buckling.
 */
export function designBHA(input: BHAInput): BHAResult {
  const {
    drillCollarOdIn, drillCollarIdIn, drillCollarLengthFt,
    drillCollarWeightLbPerFt, hwdpOdIn, hwdpIdIn, hwdpLengthFt,
    hwdpWeightLbPerFt, drillPipeOdIn, drillPipeWeightLbPerFt,
    stabilizers, mudWeightPpg, wobLbf, inclinationDeg,
    holeDiameterIn, formationUcsPsi, desiredSafetyFactor,
  } = input;

  const steelDensityPpg = 65.4;
  const buoyancyFactor = 1 - mudWeightPpg / steelDensityPpg;

  // BHA total weight
  const dcWeightAirLbf = drillCollarWeightLbPerFt * drillCollarLengthFt;
  const hwdpWeightAirLbf = hwdpWeightLbPerFt * hwdpLengthFt;
  const totalBhaWeightLbf = dcWeightAirLbf + hwdpWeightAirLbf;
  const buoyedBhaWeightLbf = totalBhaWeightLbf * buoyancyFactor;

  // Neutral point (from bit)
  const neutralPointFt = drillCollarWeightLbPerFt * buoyancyFactor > 0
    ? wobLbf / (drillCollarWeightLbPerFt * buoyancyFactor)
    : 0;

  // % of DC length in compression
  const percentDcInCompressionPct = drillCollarLengthFt > 0
    ? (neutralPointFt / drillCollarLengthFt) * 100
    : 0;

  // BHA bending stiffness (EI)
  const IDcIn4 = Math.PI / 64 * (drillCollarOdIn ** 4 - drillCollarIdIn ** 4);
  const youngsModulusPsi = 30e6;
  const bhaStiffnessLbIn2 = youngsModulusPsi * IDcIn4;

  // Critical buckling load (Dawson-Paslay sinusoidal in inclined hole)
  const clearanceIn = (holeDiameterIn - drillCollarOdIn) / 2;
  const incRad = inclinationDeg * Math.PI / 180;
  const contactForcePerInch = drillCollarWeightLbPerFt * buoyancyFactor * Math.sin(incRad) / 12;
  const criticalBucklingLoadLbf = clearanceIn > 0
    ? 2 * Math.sqrt(bhaStiffnessLbIn2 * contactForcePerInch / clearanceIn)
    : 100000;

  // Max WOB before sinusoidal buckling
  const maxWobWithoutBucklingLbf = criticalBucklingLoadLbf * 0.85;

  // Safety factor
  const safetyFactor = wobLbf > 0 ? maxWobWithoutBucklingLbf / wobLbf : 10;

  // Margin of overpull
  const dcYieldLoadLbf = 110000 * Math.PI / 4 * (drillCollarOdIn ** 2 - drillCollarIdIn ** 2);
  const marginOfOverpullLbf = dcYieldLoadLbf * 0.7 - totalBhaWeightLbf * buoyancyFactor;

  // Max dogleg severity the BHA can pass (Lubinski formula)
  const maxDoglegSeverityDegPer100ft = clearanceIn > 0
    ? (200 * (holeDiameterIn - drillCollarOdIn)) / (drillCollarLengthFt * 0.01 + 1)
    : 8;

  // --- Stabilizer contact & bit side force ---
  const effectiveStabilizerContact: boolean[] = [];
  let bitSideForceLbf = 0;
  let bitTiltAngleDeg = 0;

  // Simplified 3-point geometry: bit, first stab, second stab
  if (stabilizers.length >= 2) {
    const L1 = stabilizers[0].mdFt; // distance bit to first stab
    const L2 = stabilizers[1].mdFt; // distance first to second stab
    const clearanceAtFirstStab = (holeDiameterIn - stabilizers[0].odIn) / 2;
    const clearanceAtSecondStab = (holeDiameterIn - stabilizers[1].odIn) / 2;

    // Bit tilt from stabilizer clearance differential
    if (L1 > 0) {
      bitTiltAngleDeg = clearanceAtFirstStab / L1 * (180 / Math.PI);
    }

    // Side force at bit (pendulum effect + formation force)
    const pendulumForce = buoyedBhaWeightLbf * Math.sin(incRad) * L1 * 0.5;
    const formationAnisotropyForce = formationUcsPsi * 0.01 * drillCollarOdIn;
    bitSideForceLbf = pendulumForce - formationAnisotropyForce + clearanceAtFirstStab * 500;

    // Check if stabilizers effectively contact wellbore
    for (const stab of stabilizers) {
      const gaugeClearance = (holeDiameterIn - stab.odIn) / 2;
      // Under compressive load, stabilizer contacts if clearance is small
      effectiveStabilizerContact.push(gaugeClearance < 0.125); // < 1/8" clearance
    }
  } else if (stabilizers.length === 1) {
    const L1 = stabilizers[0].mdFt;
    const clearance = (holeDiameterIn - stabilizers[0].odIn) / 2;
    bitTiltAngleDeg = L1 > 0 ? clearance / L1 * (180 / Math.PI) / 2 : 0;
    bitSideForceLbf = buoyedBhaWeightLbf * Math.sin(incRad) * L1 * 0.3;
    effectiveStabilizerContact.push(clearance < 0.125);
  } else {
    // No stabilizers — slick BHA (pendulum)
    const L = drillCollarLengthFt;
    bitSideForceLbf = buoyedBhaWeightLbf * Math.sin(incRad) * L * 0.25;
    bitTiltAngleDeg = (holeDiameterIn - drillCollarOdIn) / (L * 12) * (180 / Math.PI);
  }

  // Build/drop/neutral tendency from side force
  let tendency: BHAResult['tendency'];
  if (bitSideForceLbf > 800) tendency = 'strong-build';
  else if (bitSideForceLbf > 300) tendency = 'build';
  else if (bitSideForceLbf < -800) tendency = 'strong-drop';
  else if (bitSideForceLbf < -300) tendency = 'drop';
  else tendency = 'neutral';

  // Predicted build rate from bit tilt and side force
  const buildRateDegPer100ft = Math.abs(bitTiltAngleDeg * 5 + bitSideForceLbf / 1000);

  return {
    totalBhaWeightLbf,
    buoyedBhaWeightLbf,
    neutralPointFt,
    percentDcInCompressionPct,
    bhaStiffnessLbIn2,
    criticalBucklingLoadLbf,
    bitSideForceLbf,
    bitTiltAngleDeg,
    buildRateDegPer100ft,
    tendency,
    maxWobWithoutBucklingLbf,
    safetyFactor,
    marginOfOverpullLbf,
    maxDoglegSeverityDegPer100ft,
    effectiveStabilizerContact,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. MUD MOTOR PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate mud motor RPM, torque, differential pressure, and bend DLS.
 *
 * Positive displacement motor:
 *   RPM = FlowRate × motorRpmPerGpm
 *   Torque = (ΔP_motor × displacement) / (2π)
 *   ΔP_motor = stages × ΔP_stage × (Torque/Torque_max)
 *
 * Motor stall: MaxWOB exceeds motor bearing capacity (torque maxes out)
 */
export function calculateMotorPerformance(
  input: MotorInput,
  flowRateGpm: number,
  surfaceRpm: number
): MotorResult {
  const {
    motorType, stages, stagePressureDropPsi,
    rotorNozzleSize32ndIn, motorRpmPerGpm,
    motorMaxTorqueFtLb, motorMaxDiffPressurePsi,
    motorOdIn, bendAngleDeg,
  } = input;

  const motorRpm = flowRateGpm * motorRpmPerGpm;
  const bitRpm = motorRpm + surfaceRpm;

  // Operating differential pressure (load-dependent)
  const operatingDiffPressurePsi = motorMaxDiffPressurePsi * 0.7; // typical 70%
  const motorTorqueFtLb = motorMaxTorqueFtLb * (operatingDiffPressurePsi / motorMaxDiffPressurePsi);

  // Mechanical horsepower at motor
  const mechanicalHorsepowerHp = (motorTorqueFtLb * motorRpm) / 5252;

  // Motor pressure loss
  const motorPressureLossPsi = stages * stagePressureDropPsi * 0.7;

  // Bend DLS (approximate — depends on bend angle, motor length, hole size)
  // Dogleg = bend_angle × k / tool_length where k ≈ 100 for standard motors
  const motorLengthFt = stages * 1.2 + 15; // approximate motor length
  const bendDoglegDegPer100ft = bendAngleDeg * 100 / motorLengthFt;

  // Maximum DLS capacity
  const maxDlsCapacityDegPer100ft = 1.5 * bendDoglegDegPer100ft;

  // Motor efficiency
  const theoreticalPower = flowRateGpm * motorPressureLossPsi / 1714;
  const motorEfficiencyPct = theoreticalPower > 0
    ? (mechanicalHorsepowerHp / theoreticalPower) * 100
    : 85;

  // Optimal flow rate (nameplate)
  const optimalFlowRateGpm = motorMaxTorqueFtLb / motorRpmPerGpm / 0.03;

  // Stall WOB: WOB at which motor torque exceeds max
  const stallWobLbf = motorMaxTorqueFtLb * 12 / (motorOdIn / 2) * 0.5;

  return {
    motorRpm,
    motorTorqueFtLb,
    motorDiffPressurePsi: operatingDiffPressurePsi,
    mechanicalHorsepowerHp,
    bitRpm,
    totalBitRpm: bitRpm,
    bendDoglegDegPer100ft,
    maxDlsCapacityDegPer100ft,
    motorPressureLossPsi,
    motorEfficiencyPct,
    optimalFlowRateGpm,
    stallWobLbf,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ROTARY STEERABLE SYSTEM (RSS) PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Estimate RSS dogleg capability based on steering pad force.
 *
 * Point-the-bit: bit shaft deflected internally → proportional to deflection angle
 * Push-the-bit: pads push against wellbore → side force at bit
 *
 * DLS ≈ (F_pad × BHA_lever_arm) / (EI × clearance) × geometry_factor
 */
export function calculateRSSPerformance(input: RSSInput): RSSResult {
  const {
    rssType, steeringPadForceLbf, rssOdIn, holeDiameterIn,
    inclinationDeg, drillCollarOdIn,
  } = input;

  const clearanceIn = (holeDiameterIn - rssOdIn) / 2;

  // Lever arm from pads to bit (approximately)
  const leverArmFt = 4; // typical pad-to-bit distance

  // Effective side force at bit
  const effectiveSideForceLbf = rssType === 'push-the-bit'
    ? steeringPadForceLbf * 0.7 // pad force translated through BHA
    : steeringPadForceLbf * 0.25; // point-the-bit is more deflection-based

  // DLS capacity
  const IIn4 = Math.PI / 64 * (drillCollarOdIn ** 4);
  const EI = 30e6 * IIn4; // steel

  const dlsCapacityDegPer100ft = clearanceIn > 0
    ? (effectiveSideForceLbf * leverArmFt * 12 * 5730) / (EI * 12)
    : 6;

  // Steering ratio: % of maximum force used
  const maxPadForceLbf = 5000; // typical max
  const steeringRatioPct = (steeringPadForceLbf / maxPadForceLbf) * 100;

  const buildRateAtMaxForceDegPer100ft = dlsCapacityDegPer100ft * (maxPadForceLbf / Math.max(1, steeringPadForceLbf));

  // Turn rate capability (< build rate due to tool orientation)
  const turnRateCapability = dlsCapacityDegPer100ft * 0.75;

  // Active pads
  const requiredPadsActive = Math.ceil(steeringRatioPct / 25);

  // Steering window (depends on clearance)
  let steeringWindow: 'narrow' | 'moderate' | 'wide' = 'moderate';
  if (clearanceIn < 0.5) steeringWindow = 'narrow';
  else if (clearanceIn > 1.5) steeringWindow = 'wide';

  return {
    effectiveSideForceLbf,
    dlsCapacityDegPer100ft,
    steeringRatioPct,
    minimumFlowRateGpm: 250,
    buildRateAtMaxForceDegPer100ft,
    turnRateCapability,
    requiredPadsActive,
    steeringWindow,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. MECHANICAL SPECIFIC ENERGY (MSE) & DRILLING EFFICIENCY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate Mechanical Specific Energy (Teale 1965).
 *
 * MSE = WOB/A_bit + (120 × π × RPM × T) / (A_bit × ROP)
 * where T = torque at bit
 *
 * Ideal MSE ≈ UCS of rock. Higher MSE = inefficient drilling, wasted energy.
 * MSE/UCS ratio = drilling efficiency.
 *
 * Hydro-mechanical MSE adds bit hydraulic energy:
 *   HMSE = MSE + (ΔP_bit × Q) / (A_bit × ROP)
 */
export function calculateMSE(
  wobLbf: number,
  rpm: number,
  torqueFtLb: number,
  ropFtPerHr: number,
  bitDiameterIn: number,
  ucsPsi: number,
  bitPressureDropPsi: number,
  flowRateGpm: number
): MSEResult {
  const bitAreaIn2 = Math.PI / 4 * bitDiameterIn ** 2;

  // Mechanical Specific Energy
  const mseKsi = ropFtPerHr > 0
    ? (wobLbf / bitAreaIn2 + (120 * Math.PI * rpm * torqueFtLb) / (bitAreaIn2 * ropFtPerHr * 12)) / 1000
    : 999;

  // Hydromechanical Specific Energy
  const hydroEnergyKsi = bitPressureDropPsi > 0 && ropFtPerHr > 0
    ? (bitPressureDropPsi * flowRateGpm) / (bitAreaIn2 * ropFtPerHr * 12 * 60) / 1000
    : 0;

  const hmseKsi = mseKsi + hydroEnergyKsi;

  // Drilling efficiency
  const drillingEfficiencyPct = mseKsi > 0
    ? (ucsPsi / 1000 / mseKsi) * 100
    : 100;

  // Energy lost to friction
  const energyLostToFrictionPct = 100 - drillingEfficiencyPct;

  // Find minimum MSE (for drill-off test analysis)
  // Optimum WOB ~ UCS * area (rough first-pass)
  const optimalWobFromMseLbf = ucsPsi * bitAreaIn2 * 0.4;
  const optimalRpmFromMse = rpm; // simplified: real optimization from drill-off data
  const minimumMseKsi = ucsPsi / 1000 * 0.7; // expected min at optimal parameters

  return {
    mechanicalSpecificEnergyKsi: mseKsi,
    hydroMechanicalSpecificEnergyKsi: hmseKsi,
    drillingEfficiencyPct: Math.min(100, Math.max(0, drillingEfficiencyPct)),
    energyLostToFrictionPct: Math.min(100, Math.max(0, energyLostToFrictionPct)),
    minimumMseKsi,
    optimalWobFromMseLbf,
    optimalRpmFromMse,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. BIT OPTIMIZATION & ROP PREDICTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Bourgoyne & Young (1974) ROP model — simplified 8-parameter form.
 *
 * ROP = exp[a1 + Σ(a2 × x2 + ... + a8 × x8)]
 *
 * Parameters:
 *   a1 = formation drillability constant
 *   a2 = depth/compaction effect
 *   a3 = pore pressure effect
 *   a4 = differential pressure effect
 *   a5 = WOB/diameter effect
 *   a6 = RPM effect
 *   a7 = tooth wear effect
 *   a8 = bit hydraulic effect
 */
export function optimizeBit(input: BitOptimizationInput): BitOptimizationResult {
  const {
    bitDiameterIn, bitType, iadcCode, jetNozzles32ndIn,
    formationUcsPsi, formationAbrasiveness, confiningPressurePsi,
    mudWeightPpg, rpm, wobRangeLbf, bitCostUsd,
    rigRateUsdPerHr, tripTimeHr, previousBitFootageFt,
    previousIadcDullGrade,
  } = input;

  const bitAreaIn2 = Math.PI / 4 * bitDiameterIn ** 2;

  // IADC code parsing for bit characteristics
  const formationDrillability = calculateFormationDrillability(formationUcsPsi, formationAbrasiveness);

  // TFA & hydraulic impact force
  let tfaIn2 = 0;
  for (const n32 of jetNozzles32ndIn) {
    tfaIn2 += Math.PI / 4 * (n32 / 32) ** 2;
  }
  const jetImpactForceLbf = 0.01823 * 0.95 * 400 * Math.sqrt(mudWeightPpg * 1500);

  // Optimal WOB from formation UCS
  const wobMinLbf = wobRangeLbf[0];
  const wobMaxLbf = wobRangeLbf[1];
  const optimalWobLbf = formationUcsPsi * bitAreaIn2 * 0.35;
  const clampedWob = Math.max(wobMinLbf, Math.min(wobMaxLbf, optimalWobLbf));

  // Optimal RPM (depends on bit type)
  let optimalRpm = rpm;
  if (bitType === 'roller-cone') optimalRpm = Math.min(120, rpm);
  else if (bitType === 'PDC') optimalRpm = Math.min(250, rpm);
  else if (bitType === 'impregnated') optimalRpm = Math.min(600, rpm);

  // ROP prediction (Bourgoyne & Young simplified)
  // ln(ROP) = ln(K) + α × ln(WOB/d) + β × ln(RPM) + γ × ln(hydraulic)
  const dBitIn = bitDiameterIn;
  const wobPerDiameter = clampedWob / dBitIn / 1000; // klb/in
  const ropBase = formationDrillability * 20; // ft/hr base

  const wobExponent = bitType === 'PDC' ? 0.8 : 1.0;
  const rpmExponent = bitType === 'PDC' ? 0.6 : 0.8;

  const predictedRopFtPerHr = ropBase *
    Math.pow(wobPerDiameter, wobExponent) *
    Math.pow(optimalRpm / 100, rpmExponent) *
    (1 + (tfaIn2 / 0.5) * 0.15);

  // MSE
  const torqueEstimateFtLb = clampedWob * bitDiameterIn / 3 / 12;
  const mseResult = calculateMSE(
    clampedWob, optimalRpm, torqueEstimateFtLb,
    predictedRopFtPerHr, bitDiameterIn, formationUcsPsi,
    1500, 400
  );

  // HSI
  const hhp = 1500 * 400 / 1714 * 0.35; // 35% at bit
  const bitHsi = hhp / bitAreaIn2;

  // Expected bit life (abrasion-dependent)
  const baseLifeHr = bitType === 'PDC' ? 80 : (bitType === 'roller-cone' ? 40 : 150);
  const abrasionFactor = formationAbrasiveness === 'high' ? 0.4
    : formationAbrasiveness === 'medium' ? 0.65 : 1.0;
  const expectedBitLifeHr = baseLifeHr * abrasionFactor *
    (1.5 - clampedWob / formationUcsPsi / bitAreaIn2);

  // Expected footage
  const expectedFootageFt = predictedRopFtPerHr * expectedBitLifeHr;

  // Cost per foot
  const bitRunCost = bitCostUsd + rigRateUsdPerHr * (expectedBitLifeHr + tripTimeHr);
  const costPerFootUsd = expectedFootageFt > 0 ? bitRunCost / expectedFootageFt : 999;

  // Recommended ranges (±20%)
  const recommendedWobRange: [number, number] = [
    clampedWob * 0.8, clampedWob * 1.2
  ];
  const recommendedRpmRange: [number, number] = [
    optimalRpm * 0.8, optimalRpm * 1.2
  ];

  return {
    optimalWobLbf: clampedWob,
    optimalRpm,
    predictedRopFtPerHr,
    mechanicalSpecificEnergyKsi: mseResult.mechanicalSpecificEnergyKsi,
    bitHsi,
    drillingEfficiencyPct: mseResult.drillingEfficiencyPct,
    costPerFootUsd,
    expectedFootageFt,
    expectedBitLifeHr,
    recommendedWobRange,
    recommendedRpmRange,
    jetImpactForceLbf,
    formationDrillability,
  };
}

/**
 * Formation drillability constant from UCS and abrasiveness.
 */
export function calculateFormationDrillability(
  ucsPsi: number,
  abrasiveness: 'low' | 'medium' | 'high'
): number {
  // Base: normalized by reference UCS (5000 psi)
  const baseDrillability = 5000 / Math.max(1, ucsPsi);

  // Abrasion factor reduces drillability
  const abrasionFactor = abrasiveness === 'high' ? 0.5
    : abrasiveness === 'medium' ? 0.75 : 1.0;

  return baseDrillability * abrasionFactor;
}

/**
 * IADC Dull Grading Code parser.
 * Format: I-O-D-L-B-G-R (8 positions), e.g., "1-2-WT-A-X-I-NO-PR"
 *
 * Positions:
 *   1-2: Inner/Outer cutting structure wear (0-8 linear scale)
 *   3: Dull characteristic (WT, BT, CT, etc.)
 *   4: Location (C, N, T, A = all)
 *   5: Bearing seal condition (E, F, N, X = N/A for PDC)
 *   6: Gauge wear (0-8, "I" = in gauge)
 *   7: Other dull characteristics
 *   8: Reason pulled (PR, TD, DTF, etc.)
 */
export function parseIADCDullGrade(code: string): {
  innerWear: number;
  outerWear: number;
  dullCharacteristic: string;
  location: string;
  bearingSeal: string;
  gaugeWear: number;
  otherChar: string;
  reasonPulled: string;
} {
  const parts = code.split('-');
  const innerWear = parts[0] ? parseInt(parts[0]) : 0;
  const outerWear = parts[1] ? parseInt(parts[1]) : 0;
  const dullCharacteristic = parts[2] || 'WT';
  const location = parts[3] || 'A';
  const bearingSeal = parts[4] || 'X';
  const gaugeWearStr = parts[5] || '0';
  const gaugeWear = gaugeWearStr === 'I' ? 0 : parseInt(gaugeWearStr);
  const otherChar = parts[6] || 'NO';
  const reasonPulled = parts[7] || 'PR';

  return { innerWear, outerWear, dullCharacteristic, location, bearingSeal, gaugeWear, otherChar, reasonPulled };
}