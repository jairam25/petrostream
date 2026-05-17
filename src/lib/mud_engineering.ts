/**
 * ─── Mud Engineering & Solids Control ───
 * Sub-Step 3.1.1 (Drilling Fluids Program) — PetroStream Suite
 *
 * Covers:
 *   - Mud rheology: Bingham Plastic, Power-law, Herschel-Bulkley (extended)
 *   - Marsh funnel viscosity & effective viscosity
 *   - Oil-based mud O/W ratio & emulsion stability (ES volts)
 *   - Solids analysis: low-gravity solids (LGS), high-gravity solids (HGS)
 *   - Methylene Blue Test (MBT) — cation exchange capacity
 *   - Material balance for WBM/OBM
 *   - Dilution & solids removal equations
 *   - Solids control equipment efficiency (shale shaker, desander, desilter, centrifuge)
 *   - API filter loss & filter cake properties
 *   - Activity coefficient & shale inhibition
 *   - HTHP fluid loss
 *
 * References:
 *   - API RP 13B-1 (WBM testing) / 13B-2 (OBM testing)
 *   - API RP 13D — Rheology & Hydraulics
 *   - Chenevert, M.E. (1970) "Shale Control with Balanced Activity..."
 *   - SPE 14777 — Cation Exchange Capacity & MBT
 *   - API 13I — Laboratory testing of drilling fluids
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface MudRheologyInput {
  dial600: number;
  dial300: number;
  dial200?: number;
  dial100?: number;
  dial6?: number;
  dial3?: number;
  mudWeightPpg: number;
  temperatureF: number;
}

export interface MudRheologyResult {
  plasticViscosityCp: number;
  yieldPointLbfPer100ft2: number;
  yieldPointRatio: number;          // YP/PV — indicates dispersion quality
  nPrime: number;
  kPrimeEqCp: number;
  nHB?: number;
  kHB?: number;
  tau0LbfPer100ft2?: number;
  modelType: 'Bingham' | 'PowerLaw' | 'HerschelBulkley';
  effectiveViscosityCp: number;
  marshFunnelSecPerQt: number;
  gpmPerSqIn: number;               // flow through 1 in² at given shear
}

export interface OBMFormulationInput {
  baseOilBbl: number;
  dieselOrMineral: 'diesel' | 'mineral';
  oilWeightPpg: number;             // typically 6.7–7.2
  brineVolumeBbl: number;
  brineSalinityPct: number;         // CaCl2 or NaCl weight %
  emulsifierConcentrationPpb: number; // pounds per barrel
  wettingAgentPpb: number;
  limePpb: number;
  organophilicClayPpb: number;
  fluidLossAdditivePpb: number;
  bariteWeightPpg: number;
  bariteVolumeBbl: number;
  lgsVolumePct: number;             // low-gravity solids vol%
}

export interface OBMFormulationResult {
  owr: number;                       // oil/water ratio (e.g., 80/20)
  waterPhaseSalinityPpm: number;
  oilVolumePct: number;
  waterVolumePct: number;
  solidsVolumePct: number;
  mudDensityPpg: number;
  totalVolumeBbl: number;
  oilBbl: number;
  brineBbl: number;
  densityBalance: 'under-weighted' | 'balanced' | 'over-weighted';
  emulsionStabilityEstimateVolts: number;
  recommendedEmulsifierAdjustmentPpb: number;
  costPerBbl: number;
}

export interface SolidsAnalysisInput {
  mudWeightPpg: number;
  solidsVolumePct: number;           // from retort
  oilVolumePct: number;             // from retort (0 for WBM)
  waterVolumePct: number;           // from retort
  mbtLbPerBblEq: number;            // methylene blue test (bentonite equivalent)
  clPpm: number;                    // chloride content
  apiFluidLossCc: number;
  cakeThickness32ndIn: number;
  sandContentPct: number;
}

export interface SolidsAnalysisResult {
  lgsVolumePct: number;             // low-gravity solids (bentonite + drilled solids)
  hgsVolumePct: number;             // high-gravity solids (barite)
  drilledSolidsPct: number;         // non-bentonite LGS
  bentoniteVolumePct: number;       // from MBT
  bariteVolumePct: number;
  sandVolumePct: number;
  lgsToHgsRatio: number;
  solidsControlEfficiencyPct: number;
  dilutionRequiredBblPer100Bbl: number;
  bariteRequiredLbPerBbl: number;
  waterRequiredBblPer100Bbl: number;
  filterCakeDensityPpg: number;
  filterCakePorosityPct: number;
}

export interface DilutionInput {
  currentVolumeBbl: number;
  currentLgsPct: number;
  targetLgsPct: number;
  dilutionFluidDensityPpg: number;
  currentDensityPpg: number;
  targetDensityPpg: number;
  bariteDensityPpg: number;         // 35 ppg typical
  solidsRemovalEfficiencyPct: number; // from solids control equipment
}

export interface DilutionResult {
  dilutionVolumeBbl: number;
  disposalVolumeBbl: number;
  bariteToAddLb: number;
  waterToAddBbl: number;
  dilutionCostUsd: number;
  newVolumeBbl: number;
  bariteSavedByRemovalLb: number;
}

export interface ShaleInhibitionInput {
  formationCecMeqPer100g: number;   // cation exchange capacity
  waterPhaseSalinityPpm: number;
  waterActivity: number;            // measured pore water activity
  mudWaterActivity: number;         // calculated mud water phase activity
  temperatureF: number;
  inhibitorType: 'KCl' | 'NaCl' | 'CaCl2' | 'amine' | 'glycol' | 'silicate';
  inhibitorConcentrationPpb: number;
}

export interface ShaleInhibitionResult {
  activityDifference: number;        // positive = mud pulls water FROM shale (drying)
  osmoticPressurePsi: number;
  inhibitionAdequacy: 'excellent' | 'good' | 'marginal' | 'poor';
  swellingIndexPct: number;          // expected swelling %
  recommendedInhibitorConcentration: number;
  waterTransportDirection: 'into-shale' | 'balanced' | 'out-of-shale';
  dispersionRisk: 'low' | 'medium' | 'high';
}

export interface SolidsControlEquipment {
  type: 'shale-shaker' | 'desander' | 'desilter' | 'centrifuge' | 'mud-cleaner';
  cutPointMicrons: number;
  efficiencyPct: number;            // % of particles above cut-point removed
  processingRateGpm: number;
  discardVolumeBblPerDay: number;
  discardDensityPpg: number;
}

export interface SolidsControlSystem {
  equipment: SolidsControlEquipment[];
  totalMudVolumeBbl: number;
  drillRateFtPerHr: number;
  holeDiameterIn: number;
}

export interface SolidsControlResult {
  overallEfficiencyPct: number;
  totalDiscardBblPerDay: number;
  bariteDiscardedLbPerDay: number;
  drilledSolidsRemovedLbPerDay: number;
  retainedLgsPct: number;
  equipmentUtilization: {
    shakerLoadGpm: number;
    desanderLoadGpm: number;
    desilterLoadGpm: number;
    centrifugeLoadGpm: number;
  };
  newMudRequiredBblPerDay: number;
  bariteMakeUpLbPerDay: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. MUD RHEOLOGY (extended — Bingham, Power-law, Herschel-Bulkley)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Full rheological characterization from Fann 35 readings.
 * Returns Bingham Plastic, Power-law, and Herschel-Bulkley parameters,
 * plus Marsh funnel time estimate and effective viscosity.
 */
export function characterizeMudRheology(input: MudRheologyInput): MudRheologyResult {
  const { dial600, dial300, dial200, dial100, dial6, dial3, mudWeightPpg, temperatureF } = input;

  // Bingham Plastic
  const plasticViscosityCp = dial600 - dial300;
  const yieldPointLbfPer100ft2 = dial300 - plasticViscosityCp;
  const yieldPointRatio = plasticViscosityCp > 0
    ? yieldPointLbfPer100ft2 / plasticViscosityCp
    : 5;

  // Power-law
  const nPrime = dial300 > 0 && dial600 > 0
    ? 3.322 * Math.log10(dial600 / dial300)
    : 0.85;
  const kPrimeEqCp = dial300 > 0
    ? (510 * dial300) / Math.pow(511, nPrime)
    : 100;

  // Herschel-Bulkley
  let nHB: number | undefined;
  let kHB: number | undefined;
  let tau0LbfPer100ft2: number | undefined;
  let modelType: 'Bingham' | 'PowerLaw' | 'HerschelBulkley' = 'PowerLaw';

  if (dial3 !== undefined && dial6 !== undefined && dial100 !== undefined && dial200 !== undefined) {
    tau0LbfPer100ft2 = Math.max(0, 2 * dial3 - dial6);
    if (tau0LbfPer100ft2 > 0.3) {
      const gamma3 = 5.11;
      const gamma6 = 10.22;
      const gamma100 = 170.3;
      const tau3 = Math.max(0.01, dial3 - tau0LbfPer100ft2);
      const tau6 = Math.max(0.01, dial6 - tau0LbfPer100ft2);
      nHB = Math.log(tau6 / tau3) / Math.log(gamma6 / gamma3);
      kHB = tau6 / Math.pow(gamma6, nHB);
      modelType = 'HerschelBulkley';
    } else if (Math.abs(yieldPointLbfPer100ft2) > 3) {
      modelType = 'Bingham';
    }
  } else if (Math.abs(yieldPointLbfPer100ft2) > 2) {
    modelType = 'Bingham';
  }

  // Effective viscosity at 300 rpm (511 sec⁻¹)
  const effectiveViscosityCp = dial300 > 0 ? 300 * dial300 / 511 : plasticViscosityCp + yieldPointLbfPer100ft2 / 1.703;

  // Marsh funnel estimate (empirical correlation from API)
  const marshFunnelSecPerQt = 26 + 0.025 * effectiveViscosityCp + mudWeightPpg * 0.3;

  // Flow per square inch (for hydraulics)
  const gpmPerSqIn = dial600 > 0 ? 5.82 / (dial600 / 1000) : 0.5;

  return {
    plasticViscosityCp,
    yieldPointLbfPer100ft2,
    yieldPointRatio,
    nPrime,
    kPrimeEqCp,
    nHB,
    kHB,
    tau0LbfPer100ft2,
    modelType,
    effectiveViscosityCp,
    marshFunnelSecPerQt,
    gpmPerSqIn,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. OIL-BASED MUD FORMULATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Formulate oil-based mud (OBM/SBM) with O/W ratio, density, and emulsion stability.
 *
 * Oil/Water Ratio:
 *   OWR = V_oil / (V_oil + V_brine) × 100
 *
 * Density balance:
 *   ρ_mud = (ρ_oil × V_oil + ρ_brine × V_brine + ρ_barite × V_barite + ...) / V_total
 *
 * Emulsion stability (approximate from emulsifier concentration):
 *   ES ≈ 400 + 2.5 × emulsifier_ppb (for mineral oil systems)
 */
export function formulateOBM(input: OBMFormulationInput): OBMFormulationResult {
  const {
    baseOilBbl, dieselOrMineral, oilWeightPpg, brineVolumeBbl,
    brineSalinityPct, emulsifierConcentrationPpb, wettingAgentPpb,
    limePpb, organophilicClayPpb, fluidLossAdditivePpb,
    bariteWeightPpg, bariteVolumeBbl, lgsVolumePct,
  } = input;

  // Oil properties
  const oilDensityPpg = dieselOrMineral === 'diesel' ? 7.0 : 6.7;

  // Brine properties (CaCl2 or NaCl brine)
  const brineDensityPpg = 8.34 + brineSalinityPct * 0.008; // approximate
  const waterPhaseSalinityPpm = brineSalinityPct * 10000;

  // Volumes
  const oilBbl = baseOilBbl;
  const brineBbl = brineVolumeBbl;
  const totalLiquidBbl = oilBbl + brineBbl;
  const owr = totalLiquidBbl > 0 ? (oilBbl / totalLiquidBbl) * 100 : 80;

  // Solids volume
  const bariteDensityPpgInput = bariteWeightPpg;
  const bariteSpecificGravity = bariteDensityPpgInput / 8.34;
  const bariteSolidVolBbl = bariteVolumeBbl;

  // Low-gravity solids volume
  const lgsSolidVolBbl = lgsVolumePct / 100 * (oilBbl + brineBbl + bariteSolidVolBbl);

  // Total volume
  const totalVolumeBbl = oilBbl + brineBbl + bariteSolidVolBbl + lgsSolidVolBbl
    + (emulsifierConcentrationPpb * totalLiquidBbl / 1500)  // approximate liquid additive volume
    + (organophilicClayPpb * totalLiquidBbl / 2100);        // clay volume

  // Density calculation: mass balance
  const oilMassLb = oilBbl * oilDensityPpg * 42;
  const brineMassLb = brineBbl * brineDensityPpg * 42;
  const bariteMassLb = bariteSolidVolBbl * bariteDensityPpgInput * 42;
  const lgsMassLb = lgsSolidVolBbl * 21.7 * 42; // LGS density ~2.6 SG
  const additiveMassLb = (emulsifierConcentrationPpb + wettingAgentPpb + limePpb
    + organophilicClayPpb + fluidLossAdditivePpb) * totalLiquidBbl;

  const mudDensityPpg = totalVolumeBbl > 0
    ? (oilMassLb + brineMassLb + bariteMassLb + lgsMassLb + additiveMassLb) / (totalVolumeBbl * 42)
    : 10;

  // Density balance check
  let densityBalance: 'under-weighted' | 'balanced' | 'over-weighted' = 'balanced';
  if (lgsVolumePct > 6) densityBalance = 'over-weighted';
  else if (lgsVolumePct < 2 && bariteVolumeBbl < 0.1) densityBalance = 'under-weighted';

  // Emulsion stability estimate
  const emulsionStabilityEstimateVolts = 200 + emulsifierConcentrationPpb * 4
    - brineSalinityPct * 2 + limePpb * 1.5;

  // Recommended emulsifier adjustment
  const recommendedEmulsifierAdjustmentPpb = emulsionStabilityEstimateVolts < 400
    ? (400 - emulsionStabilityEstimateVolts) / 4
    : 0;

  // Cost estimation (simplified)
  const oilCostPerBbl = dieselOrMineral === 'diesel' ? 120 : 180;
  const emulsifierCostPerLb = 3;
  const bariteCostPerLb = 0.12;
  const costPerBbl = (oilBbl * oilCostPerBbl
    + brineBbl * 10
    + bariteSolidVolBbl * 42 * bariteDensityPpgInput * bariteCostPerLb
    + emulsifierConcentrationPpb * totalLiquidBbl * emulsifierCostPerLb
  ) / totalVolumeBbl;

  return {
    owr,
    waterPhaseSalinityPpm,
    oilVolumePct: (oilBbl / totalVolumeBbl) * 100,
    waterVolumePct: (brineBbl / totalVolumeBbl) * 100,
    solidsVolumePct: ((bariteSolidVolBbl + lgsSolidVolBbl) / totalVolumeBbl) * 100,
    mudDensityPpg,
    totalVolumeBbl,
    oilBbl,
    brineBbl,
    densityBalance,
    emulsionStabilityEstimateVolts,
    recommendedEmulsifierAdjustmentPpb,
    costPerBbl,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SOLIDS ANALYSIS (from retort, MBT, chloride)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze drilled solids, barite content, dilution requirements from retort & MBT.
 *
 * Mass balance equations:
 *   V_solids = V_lgs + V_hgs
 *   ρ_mud = (ρ_lgs × V_lgs + ρ_hgs × V_hgs + ρ_liquid × V_liquid) / V_total
 *
 * MBT: 1.0 lb/bbl bentonite equivalent = ~5 wt% bentonite by volume
 */
export function analyzeSolids(input: SolidsAnalysisInput): SolidsAnalysisResult {
  const {
    mudWeightPpg, solidsVolumePct, oilVolumePct,
    waterVolumePct, mbtLbPerBblEq, clPpm,
    apiFluidLossCc, cakeThickness32ndIn, sandContentPct,
  } = input;

  const liquidVolumePct = oilVolumePct + waterVolumePct;

  // Densities: LGS ~2.6 SG (21.7 ppg), HGS ~4.2 SG (35 ppg), liquid ~8.5 ppg
  const rhoLgs = 21.7;
  const rhoHgs = 35.0;
  const rhoLiquid = (oilVolumePct * 6.8 + waterVolumePct * 8.34) / Math.max(liquidVolumePct, 1);

  // Solve for LGS volume fraction from density balance
  const vLgs = liquidVolumePct > 0 && solidsVolumePct > 0
    ? (mudWeightPpg * 100 - rhoHgs * solidsVolumePct - rhoLiquid * liquidVolumePct)
      / (rhoLgs - rhoHgs)
    : 0;

  const vHgs = solidsVolumePct - vLgs;
  const lgsVolumePct = Math.max(0, vLgs);
  const hgsVolumePct = Math.max(0, vHgs);

  // Bentonite volume from MBT (1 lb/bbl ≈ 0.5% vol bentonite)
  const bentoniteVolumePct = mbtLbPerBblEq * 0.5;

  // Drilled solids = total LGS - bentonite
  const drilledSolidsPct = Math.max(0, lgsVolumePct - bentoniteVolumePct);

  // Barite volume
  const bariteVolumePct = hgsVolumePct;

  // Sand volume
  const sandVolumePct = sandContentPct;

  // LGS/HGS ratio — indicator of solids removal efficiency
  const lgsToHgsRatio = hgsVolumePct > 0 ? lgsVolumePct / hgsVolumePct : 10;

  // Solids control efficiency (based on LGS/HGS ratio)
  const solidsControlEfficiencyPct = lgsToHgsRatio < 1
    ? 95
    : lgsToHgsRatio < 2
      ? 85
      : lgsToHgsRatio < 3
        ? 70
        : 50;

  // Dilution required to reduce LGS to 5% target
  const targetLgsPct = 5;
  const dilutionRequiredBblPer100Bbl = lgsVolumePct > targetLgsPct
    ? 100 * (lgsVolumePct - targetLgsPct) / (targetLgsPct - 0.5)
    : 0;

  // Barite required to maintain density after dilution
  const bariteRequiredLbPerBbl = mudWeightPpg > 10
    ? (mudWeightPpg - 8.34) * 14.7
    : 0;

  // Water required
  const waterRequiredBblPer100Bbl = dilutionRequiredBblPer100Bbl * 0.9; // 90% of diluent is water for WBM

  // Filter cake density
  const filterCakeDensityPpg = apiFluidLossCc > 0
    ? 8.34 + (cakeThickness32ndIn / apiFluidLossCc) * 5
    : 10;

  // Filter cake porosity
  const filterCakePorosityPct = apiFluidLossCc > 0
    ? 70 - cakeThickness32ndIn * 2
    : 60;

  return {
    lgsVolumePct: Math.max(0, Math.min(100, lgsVolumePct)),
    hgsVolumePct: Math.max(0, Math.min(100, hgsVolumePct)),
    drilledSolidsPct: Math.max(0, Math.min(100, drilledSolidsPct)),
    bentoniteVolumePct: Math.max(0, Math.min(100, bentoniteVolumePct)),
    bariteVolumePct: Math.max(0, Math.min(100, bariteVolumePct)),
    sandVolumePct,
    lgsToHgsRatio,
    solidsControlEfficiencyPct,
    dilutionRequiredBblPer100Bbl,
    bariteRequiredLbPerBbl,
    waterRequiredBblPer100Bbl,
    filterCakeDensityPpg,
    filterCakePorosityPct,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. DILUTION & SOLIDS REMOVAL STRATEGY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate dilution requirements and solids removal optimization.
 *
 * Dilution equation:
 *   V_dilution = V_current × (C_current - C_target) / (C_target - C_dilution)
 *
 * Barite to add for density maintenance:
 *   Barite_lb = (V_total × 42) × (ρ_target - ρ_current) / (ρ_barite - ρ_target) × ρ_barite
 */
export function calculateDilution(input: DilutionInput): DilutionResult {
  const {
    currentVolumeBbl, currentLgsPct, targetLgsPct,
    dilutionFluidDensityPpg, currentDensityPpg, targetDensityPpg,
    bariteDensityPpg, solidsRemovalEfficiencyPct,
  } = input;

  // Dilution volume to reduce LGS
  const effectiveRemovalFactor = solidsRemovalEfficiencyPct / 100;
  const adjustedCurrentLgs = currentLgsPct * (1 - effectiveRemovalFactor * 0.7); // solids removal first

  const dilutionVolumeBbl = adjustedCurrentLgs > targetLgsPct
    ? currentVolumeBbl * (adjustedCurrentLgs - targetLgsPct) / (targetLgsPct - 1)
    : 0;

  const newVolumeBbl = currentVolumeBbl + dilutionVolumeBbl;

  // Barite to add for density
  const densityDeficitPpg = targetDensityPpg - currentDensityPpg;
  const bariteToAddLb = densityDeficitPpg > 0
    ? newVolumeBbl * 42 * densityDeficitPpg * bariteDensityPpg / (bariteDensityPpg - targetDensityPpg)
    : 0;

  // Water to add
  const waterToAddBbl = dilutionVolumeBbl;

  // Disposal volume (mud to discard)
  const disposalVolumeBbl = dilutionVolumeBbl * 0.8;

  // Barite saved by solids removal
  const hgsSavedPct = (currentDensityPpg - 8.34) / (bariteDensityPpg - 8.34) * 100;
  const bariteSavedByRemovalLb = currentVolumeBbl * hgsSavedPct / 100 * effectiveRemovalFactor
    * bariteDensityPpg * 42;

  // Cost (simplified)
  const dilutionCostUsd = dilutionVolumeBbl * 15 + bariteToAddLb * 0.12;

  return {
    dilutionVolumeBbl,
    disposalVolumeBbl,
    bariteToAddLb: Math.max(0, bariteToAddLb),
    waterToAddBbl,
    dilutionCostUsd,
    newVolumeBbl,
    bariteSavedByRemovalLb,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. SHALE INHIBITION ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Evaluate shale inhibition potential of a mud system.
 *
 * Activity-based inhibition (Chenevert 1970):
 *   Osmotic pressure difference = (RT/V_w) × ln(a_mud / a_shale)
 *   where a = water activity, R = gas constant, T = temperature, V_w = partial molar volume of water
 *
 * Positive osmotic pressure → water flows OUT of shale → inhibition (drying)
 * Negative osmotic pressure → water flows INTO shale → hydration/swelling
 */
export function evaluateShaleInhibition(input: ShaleInhibitionInput): ShaleInhibitionResult {
  const {
    formationCecMeqPer100g, waterPhaseSalinityPpm,
    waterActivity, mudWaterActivity, temperatureF,
    inhibitorType, inhibitorConcentrationPpb,
  } = input;

  // Activity difference
  const activityDifference = mudWaterActivity - waterActivity;

  // Osmotic pressure (from activity ratio)
  // π = (RT/V_w) × ln(a_mud/a_shale)  in psi
  const RT_Vw = 1.12 * (temperatureF + 460); // approximate for water
  const osmoticPressurePsi = waterActivity > 0
    ? RT_Vw * Math.log(mudWaterActivity / waterActivity)
    : -500;

  // Swelling index (CEC-based, activity-adjusted)
  const baseSwellingPct = formationCecMeqPer100g * 2.5; // % swelling per meq/100g
  const activityCorrection = 1 - activityDifference * 1.5; // reduced swelling with inhibition
  const swellingIndexPct = baseSwellingPct * Math.max(0, activityCorrection);

  // Inhibition adequacy
  let inhibitionAdequacy: ShaleInhibitionResult['inhibitionAdequacy'];
  if (activityDifference < -0.05 && swellingIndexPct < 10) {
    inhibitionAdequacy = 'excellent';
  } else if (activityDifference < -0.02 && swellingIndexPct < 20) {
    inhibitionAdequacy = 'good';
  } else if (activityDifference < 0.02) {
    inhibitionAdequacy = 'marginal';
  } else {
    inhibitionAdequacy = 'poor';
  }

  // Water transport direction
  let waterTransportDirection: 'into-shale' | 'balanced' | 'out-of-shale' = 'balanced';
  if (activityDifference > 0.02) waterTransportDirection = 'into-shale';
  else if (activityDifference < -0.02) waterTransportDirection = 'out-of-shale';

  // Dispersion risk
  let dispersionRisk: 'low' | 'medium' | 'high' = 'medium';
  if (formationCecMeqPer100g > 30 && swellingIndexPct > 20) dispersionRisk = 'high';
  else if (formationCecMeqPer100g < 10 && swellingIndexPct < 10) dispersionRisk = 'low';

  // Recommended inhibitor concentration
  let inhibitorFactor = 10; // ppb inhibitor per unit activity difference needed
  if (inhibitorType === 'CaCl2') inhibitorFactor = 5;
  else if (inhibitorType === 'silicate') inhibitorFactor = 3;
  else if (inhibitorType === 'glycol') inhibitorFactor = 15;
  const recommendedInhibitorConcentration = Math.max(0,
    inhibitorConcentrationPpb + activityDifference * inhibitorFactor * 100
  );

  return {
    activityDifference,
    osmoticPressurePsi,
    inhibitionAdequacy,
    swellingIndexPct,
    recommendedInhibitorConcentration,
    waterTransportDirection,
    dispersionRisk,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. SOLIDS CONTROL EQUIPMENT SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Model solids control system efficiency.
 *
 * Multi-stage: shale shaker → desander → desilter → centrifuge
 * Each stage removes particles larger than cut-point with given efficiency.
 *
 * Barite recovery: centrifuge underflow returns barite to active system.
 */
export function evaluateSolidsControl(system: SolidsControlSystem): SolidsControlResult {
  const { equipment, totalMudVolumeBbl, drillRateFtPerHr, holeDiameterIn } = system;

  // Drilled solids generation rate
  const holeVolumeBblPerFt = holeDiameterIn ** 2 / 1029.4;
  const drilledSolidsBblPerDay = holeVolumeBblPerFt * drillRateFtPerHr * 24;
  const drilledSolidsLbPerDay = drilledSolidsBblPerDay * 21.7 * 42; // LGS density

  // Process each stage
  let remainingLgs = drilledSolidsLbPerDay;
  let bariteDiscardedLbPerDay = 0;
  let totalDiscardBblPerDay = 0;

  const equipmentUtilization = {
    shakerLoadGpm: 0,
    desanderLoadGpm: 0,
    desilterLoadGpm: 0,
    centrifugeLoadGpm: 0,
  };

  for (const eq of equipment) {
    const efficiency = eq.efficiencyPct / 100;

    if (eq.type === 'shale-shaker') {
      remainingLgs *= (1 - efficiency * 0.7); // shaker removes 70% of what it can
      totalDiscardBblPerDay += eq.discardVolumeBblPerDay;
      equipmentUtilization.shakerLoadGpm = eq.processingRateGpm;
    } else if (eq.type === 'desander') {
      remainingLgs *= (1 - efficiency * 0.5);
      bariteDiscardedLbPerDay += eq.discardVolumeBblPerDay * 0.02 * 35 * 42; // 2% barite in underflow
      totalDiscardBblPerDay += eq.discardVolumeBblPerDay;
      equipmentUtilization.desanderLoadGpm = eq.processingRateGpm;
    } else if (eq.type === 'desilter') {
      remainingLgs *= (1 - efficiency * 0.4);
      bariteDiscardedLbPerDay += eq.discardVolumeBblPerDay * 0.01 * 35 * 42;
      totalDiscardBblPerDay += eq.discardVolumeBblPerDay;
      equipmentUtilization.desilterLoadGpm = eq.processingRateGpm;
    } else if (eq.type === 'centrifuge') {
      remainingLgs *= (1 - efficiency * 0.6);
      bariteDiscardedLbPerDay += eq.discardVolumeBblPerDay * 0.03 * 35 * 42;
      totalDiscardBblPerDay += eq.discardVolumeBblPerDay;
      equipmentUtilization.centrifugeLoadGpm = eq.processingRateGpm;
    } else if (eq.type === 'mud-cleaner') {
      remainingLgs *= (1 - efficiency * 0.55);
      totalDiscardBblPerDay += eq.discardVolumeBblPerDay;
    }
  }

  const drilledSolidsRemovedLbPerDay = drilledSolidsLbPerDay - remainingLgs;
  const overallEfficiencyPct = drilledSolidsLbPerDay > 0
    ? (drilledSolidsRemovedLbPerDay / drilledSolidsLbPerDay) * 100
    : 95;

  // Retained LGS in active system
  const retainedLgsPct = Math.min(8, (remainingLgs / (totalMudVolumeBbl * 21.7 * 42)) * 100);

  // New mud required (to replace discard volume)
  const newMudRequiredBblPerDay = totalDiscardBblPerDay * 1.1;

  // Barite makeup (replace barite lost in discard + maintain density)
  const bariteMakeUpLbPerDay = bariteDiscardedLbPerDay * 1.2 + drilledSolidsBblPerDay * 14.7;

  return {
    overallEfficiencyPct,
    totalDiscardBblPerDay,
    bariteDiscardedLbPerDay,
    drilledSolidsRemovedLbPerDay,
    retainedLgsPct,
    equipmentUtilization,
    newMudRequiredBblPerDay,
    bariteMakeUpLbPerDay,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. API FLUID LOSS & FILTER CAKE
// ═══════════════════════════════════════════════════════════════════════════════

export interface FluidLossInput {
  apiFluidLoss30MinCc: number;
  spurtLossCc: number;
  cakeThickness32ndIn: number;
  cakePermeabilityMicroDarcy: number;
  solidsVolumePct: number;
  overbalancePsi: number;
  temperatureF: number;
  fluidType: 'WBM' | 'OBM' | 'SBM';
}

export interface FluidLossResult {
  staticFluidLossCc: number;
  dynamicFluidLossCc: number;
  cakeCompressibility: number;
  cakeQuality: 'excellent' | 'good' | 'fair' | 'poor';
  invasionDepthIn: number;
  formationDamageSkin: number;
  spurtLossInterpretation: 'low' | 'normal' | 'high';
  filterCakeErosionVelocityFtPerMin: number;
  expectedHthpFluidLossCc: number;
}

/**
 * Evaluate API fluid loss and filter cake quality.
 * Extrapolates static fluid loss and estimates formation invasion.
 */
export function evaluateFluidLoss(input: FluidLossInput): FluidLossResult {
  const {
    apiFluidLoss30MinCc, spurtLossCc, cakeThickness32ndIn,
    cakePermeabilityMicroDarcy, solidsVolumePct, overbalancePsi,
    temperatureF, fluidType,
  } = input;

  // Static fluid loss per API schedule (V = V_spurt + m × √t)
  // m = (V_30min - V_spurt) / √30
  const m = Math.max(0, (apiFluidLoss30MinCc - spurtLossCc) / Math.sqrt(30));
  const staticFluidLossCc = apiFluidLoss30MinCc;

  // Dynamic fluid loss (typically 40-60% of static)
  const dynamicFluidLossCc = staticFluidLossCc * 0.55;

  // Cake compressibility (from cake thickness / fluid loss ratio)
  const cakeCompressibility = solidsVolumePct > 0
    ? cakeThickness32ndIn / (spurtLossCc + staticFluidLossCc)
    : 0.5;

  // Cake quality
  let cakeQuality: FluidLossResult['cakeQuality'];
  if (apiFluidLoss30MinCc < 5 && cakeThickness32ndIn < 2) {
    cakeQuality = 'excellent';
  } else if (apiFluidLoss30MinCc < 10 && cakeThickness32ndIn < 4) {
    cakeQuality = 'good';
  } else if (apiFluidLoss30MinCc < 15) {
    cakeQuality = 'fair';
  } else {
    cakeQuality = 'poor';
  }

  // Invasion depth (Darcy radial model, simplified)
  const porosity = 0.25; // typical formation
  const filtrateViscCp = fluidType === 'OBM' ? 2 : 1;
  const invasionDepthIn = overbalancePsi > 0
    ? Math.sqrt(cakePermeabilityMicroDarcy * overbalancePsi * 30 / (porosity * filtrateViscCp)) * 0.5
    : 1;

  // Formation damage skin (Hawkins formula approximation)
  const rw = 4.25; // wellbore radius in inches
  const formationDamageSkin = (cakePermeabilityMicroDarcy / 0.1 - 1)
    * Math.log((rw + invasionDepthIn) / rw);

  // Spurt loss interpretation
  let spurtLossInterpretation: 'low' | 'normal' | 'high' = 'normal';
  if (spurtLossCc < 0.5) spurtLossInterpretation = 'low';
  else if (spurtLossCc > 2) spurtLossInterpretation = 'high';

  // Filter cake erosion velocity
  const filterCakeErosionVelocityFtPerMin = cakeCompressibility < 0.3
    ? 300 + 100 * (1 - cakeCompressibility * 3)
    : 180;

  // Expected HTHP fluid loss (extrapolate from API at temp)
  const tempFactor = Math.exp(0.02 * (temperatureF - 77)); // Arrhenius
  const expectedHthpFluidLossCc = staticFluidLossCc * tempFactor * 1.5 * (overbalancePsi / 100);

  return {
    staticFluidLossCc,
    dynamicFluidLossCc,
    cakeCompressibility,
    cakeQuality,
    invasionDepthIn,
    formationDamageSkin,
    spurtLossInterpretation,
    filterCakeErosionVelocityFtPerMin,
    expectedHthpFluidLossCc,
  };
}