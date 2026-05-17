/**
 * Exploration & Basin Analysis Library
 * Phase 1.1 — Basin Analysis & Regional Screening
 * Phase 1.2 — Desk Study & Data Acquisition
 *
 * Engineering-grade models for petroleum systems analysis,
 * source rock evaluation, thermal maturity, prospect ranking,
 * license economics, and fiscal regime comparison.
 *
 * References:
 *   - Magoon & Dow (1994) — Petroleum System
 *   - Tissot & Welte (1984) — Petroleum Formation and Occurrence
 *   - Waples (1980) — Time-Temperature Index (TTI)
 *   - Sweeney & Burnham (1990) — Easy%Ro
 *   - Wood Mackenzie / IHS for fiscal regime benchmarking
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** Tectonic basin classification */
export type BasinType =
  | 'rift'
  | 'foreland'
  | 'passive_margin'
  | 'cratonic'
  | 'strike_slip'
  | 'intracratonic'
  | 'forearc'
  | 'backarc';

/** Depositional environment */
export type DepEnvironment =
  | 'fluvial'
  | 'deltaic'
  | 'aeolian'
  | 'shoreface'
  | 'turbidite'
  | 'carbonate_reef'
  | 'lacustrine'
  | 'evaporitic'
  | 'deep_marine'
  | 'glacial';

/** Petroleum system element */
export interface PetroleumSystemElement {
  element: 'source' | 'reservoir' | 'seal' | 'trap' | 'migration' | 'timing';
  presence: boolean;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  confidence: number; // 0-1
  description: string;
}

/** Basin configuration for analysis */
export interface BasinConfig {
  basinName: string;
  basinType: BasinType;
  areaSqKm: number;         // km²
  maxSedimentThicknessM: number; // meters
  geothermalGradientCM: number;  // °C/km
  surfaceTempC: number;
  waterDepthM: number;
}

/** Source rock parameters */
export interface SourceRockParams {
  tocWtPct: number;          // Total Organic Carbon (wt%)
  hydrogenIndex: number;      // mg HC / g TOC
  oxygenIndex: number;        // mg CO2 / g TOC
  thicknessM: number;         // meters
  arealExtentSqKm: number;   // km²
  kerogenType: KerogenTypeLabel;
  vitriniteReflectanceRo: number; // %Ro
  tmaxC: number;              // Rock-Eval Tmax (°C)
  pi: number;                 // Production Index (S1/(S1+S2))
}

export type KerogenTypeLabel = 'Type I' | 'Type II' | 'Type I/II' | 'Type II/III' | 'Type III' | 'Type IV';

/** Burial history event */
export interface BurialEvent {
  ageMa: number;       // Million years ago
  depthM: number;      // Depth at that time
  heatFlowMwM2: number; // Paleo heat flow mW/m²
  event: string;
}

/** Thermal maturity result */
export interface MaturityResult {
  vitriniteReflectanceRo: number;
  tti: number;           // Time-Temperature Index (Waples)
  easyRo: number;        // Easy%Ro (Sweeney & Burnham)
  transformationRatio: number; // TR 0-1
  maturityZone: MaturityZone;
  peakOilWindowDepthM: number;
  peakGasWindowDepthM: number;
  hydrocarbonPhase: 'immature' | 'heavy_oil' | 'light_oil' | 'wet_gas' | 'dry_gas' | 'overmature';
}

export type MaturityZone = 'immature' | 'early_oil' | 'main_oil' | 'late_oil' | 'wet_gas' | 'dry_gas' | 'overmature';

/** Petroleum system event chart entry */
export interface PSEventChartEntry {
  ageMa: number;
  label: string;
  element: PetroleumSystemElement['element'];
  startMa: number;
  endMa: number;
  critical: boolean;
}

/** Prospect ranking input */
export interface ProspectRankingInput {
  prospectName: string;
  sourcePresence: number;    // 0-1
  sourceQuality: number;     // 0-5
  reservoirPresence: number; // 0-1
  reservoirQuality: number;  // 0-5
  sealPresence: number;      // 0-1
  sealQuality: number;       // 0-5
  trapIntegrity: number;     // 0-5
  migrationEfficiency: number; // 0-5
  timingRisk: number;        // 0-5
  meanResourcesMmbbl: number; // MMbbl (recoverable)
  drillDepthM: number;
  waterDepthM: number;
  distanceToInfrastructureKm: number;
}

/** Prospect ranking result */
export interface ProspectRankingResult {
  overallScore: number;       // 0-100
  geologicalScore: number;    // 0-100
  economicScore: number;      // 0-100
  rank: number;
  riskCategory: 'lead' | 'prospect' | 'drill_ready';
  emvUsd: number;             // Expected Monetary Value
  gPoS: number;               // Geological Probability of Success
  cos: number;                // Chance of Success (geological + commercial)
}

/** Fiscal regime configuration */
export interface FiscalRegime {
  country: string;
  regimeType: 'concession' | 'psc' | 'service_contract' | 'r_factor';
  royaltyRate: number;        // fraction
  costRecoveryCeiling: number; // fraction (PSC)
  profitOilSplitGov: number;  // fraction (PSC)
  incomeTaxRate: number;      // fraction
  bonusSignatureUsd: number;
  rentalFeesUsdPerYr: number;
  vatRate: number;
  depreciationYears: number;
  ringFencing: boolean;
}

/** Desk study data quality assessment */
export interface DataQualityAssessment {
  dataType: string;
  coverage: number;      // % area covered 0-100
  vintage: number;       // year acquired
  resolution: string;    // e.g. "25m bin", "4ms sample"
  confidence: number;    // 0-1
  processingLevel: 'raw' | 'processed' | 'interpreted' | 'validated';
  notes: string;
}

/** License block evaluation */
export interface LicenseBlock {
  blockId: string;
  areaSqKm: number;
  minimumWorkProgramUsd: number;
  commitmentWells: number;
  commitmentSeismicKm: number;
  phaseYears: number;
  available: boolean;
  roundName: string;
}

/** Sub-basin risk ranking */
export interface SubBasinRanking {
  name: string;
  basinType: BasinType;
  sourceScore: number;    // 0-5
  reservoirScore: number; // 0-5
  sealScore: number;      // 0-5
  trapScore: number;      // 0-5
  timingScore: number;    // 0-5
  overallRiskScore: number; // 0-100
  rank: number;
  recommendation: 'high_grade' | 'farm_in' | 'drop' | 'acquire_seismic';
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & DATABASES
// ═══════════════════════════════════════════════════════════════════════════════

export const BASIN_TYPE_INFO: { type: BasinType; name: string; description: string; typicalHeatFlow: [number, number]; trapStyles: string[] }[] = [
  { type: 'rift', name: 'Rift Basin', description: 'Extensional tectonics, horst-graben geometry', typicalHeatFlow: [60, 100], trapStyles: ['Tilted fault blocks', 'Rollover anticlines', 'Subunconformity'] },
  { type: 'foreland', name: 'Foreland Basin', description: 'Compressional, adjacent to orogenic belt', typicalHeatFlow: [40, 70], trapStyles: ['Thrust-related anticlines', 'Subthrust', 'Stratigraphic pinchouts'] },
  { type: 'passive_margin', name: 'Passive Margin', description: 'Atlantic-type, divergent margin', typicalHeatFlow: [40, 60], trapStyles: ['Growth faults', 'Salt diapirs', 'Carbonate buildup'] },
  { type: 'cratonic', name: 'Cratonic Basin', description: 'Stable continental interior', typicalHeatFlow: [30, 50], trapStyles: ['Broad anticlines', 'Stratigraphic', 'Basement-related'] },
  { type: 'strike_slip', name: 'Strike-Slip Basin', description: 'Wrench tectonics, pull-apart', typicalHeatFlow: [50, 90], trapStyles: ['Flower structures', 'En-echelon folds'] },
  { type: 'intracratonic', name: 'Intracratonic Basin', description: 'Sag-type interior basin', typicalHeatFlow: [35, 55], trapStyles: ['Drape over basement', 'Stratigraphic'] },
  { type: 'forearc', name: 'Forearc Basin', description: 'Trench-arc gap', typicalHeatFlow: [30, 50], trapStyles: ['Accretionary prism', 'Slope basins'] },
  { type: 'backarc', name: 'Backarc Basin', description: 'Behind volcanic arc, extensional', typicalHeatFlow: [60, 120], trapStyles: ['Extensional tilt blocks', 'Compressional inversion'] },
];

export const KEROGEN_DATABASE: { type: KerogenTypeLabel; name: string; hiAvg: number; oiAvg: number; environment: string; precursor: string; hydrocarbonProduct: string }[] = [
  { type: 'Type I', name: 'Algal/Liptinitic', hiAvg: 750, oiAvg: 25, environment: 'Lacustrine (anoxic)', precursor: 'Botryococcus algae', hydrocarbonProduct: 'Oil-prone (paraffinic)' },
  { type: 'Type I/II', name: 'Mixed Algal-Marine', hiAvg: 550, oiAvg: 35, environment: 'Marine / Lacustrine', precursor: 'Mixed algal-planktonic', hydrocarbonProduct: 'Oil-prone' },
  { type: 'Type II', name: 'Planktonic/Exinitic', hiAvg: 450, oiAvg: 45, environment: 'Marine (anoxic)', precursor: 'Marine plankton, bacteria', hydrocarbonProduct: 'Oil & gas' },
  { type: 'Type II/III', name: 'Mixed Marine-Terrigenous', hiAvg: 300, oiAvg: 60, environment: 'Deltaic, coastal', precursor: 'Mixed terrestrial-marine', hydrocarbonProduct: 'Gas & oil' },
  { type: 'Type III', name: 'Humic/Vitrinitic', hiAvg: 150, oiAvg: 80, environment: 'Coastal plain, delta', precursor: 'Higher land plants', hydrocarbonProduct: 'Gas-prone' },
  { type: 'Type IV', name: 'Inert/Inertinitic', hiAvg: 40, oiAvg: 15, environment: 'Oxidized/reworked', precursor: 'Charcoal, oxidized OM', hydrocarbonProduct: 'Inert (no potential)' },
];

export const MATURITY_WINDOWS: { zone: MaturityZone; roMin: number; roMax: number; hydrocarbonPhase: string; trMin: number; trMax: number }[] = [
  { zone: 'immature', roMin: 0.0, roMax: 0.55, hydrocarbonPhase: 'Biogenic gas only', trMin: 0, trMax: 0.05 },
  { zone: 'early_oil', roMin: 0.55, roMax: 0.70, hydrocarbonPhase: 'Heavy oil', trMin: 0.05, trMax: 0.25 },
  { zone: 'main_oil', roMin: 0.70, roMax: 1.00, hydrocarbonPhase: 'Light oil (peak generation)', trMin: 0.25, trMax: 0.65 },
  { zone: 'late_oil', roMin: 1.00, roMax: 1.30, hydrocarbonPhase: 'Light oil / condensate', trMin: 0.65, trMax: 0.90 },
  { zone: 'wet_gas', roMin: 1.30, roMax: 2.00, hydrocarbonPhase: 'Wet gas / condensate', trMin: 0.90, trMax: 0.99 },
  { zone: 'dry_gas', roMin: 2.00, roMax: 4.00, hydrocarbonPhase: 'Dry gas (methane)', trMin: 0.99, trMax: 1.0 },
  { zone: 'overmature', roMin: 4.00, roMax: 10.0, hydrocarbonPhase: 'Graphitic / no potential', trMin: 1.0, trMax: 1.0 },
];

export const DEP_ENVIRONMENT_DB: { env: DepEnvironment; name: string; reservoirQuality: number; sealPotential: number; sourcePotential: number; trappingStyle: string }[] = [
  { env: 'fluvial', name: 'Fluvial (Braided/Meandering)', reservoirQuality: 4, sealPotential: 2, sourcePotential: 1, trappingStyle: 'Stratigraphic / channel pinchout' },
  { env: 'deltaic', name: 'Deltaic (Distributary/Prodelta)', reservoirQuality: 4, sealPotential: 4, sourcePotential: 4, trappingStyle: 'Growth faults, rollover anticlines' },
  { env: 'aeolian', name: 'Aeolian (Erg/Dune)', reservoirQuality: 5, sealPotential: 3, sourcePotential: 1, trappingStyle: 'Stratigraphic / inter-dune seals' },
  { env: 'shoreface', name: 'Shoreface/Barrier Bar', reservoirQuality: 4, sealPotential: 3, sourcePotential: 2, trappingStyle: 'Stratigraphic / unconformity' },
  { env: 'turbidite', name: 'Deep Marine Turbidite', reservoirQuality: 3, sealPotential: 4, sourcePotential: 4, trappingStyle: 'Stratigraphic pinchout, compaction folds' },
  { env: 'carbonate_reef', name: 'Carbonate Reef/Buildup', reservoirQuality: 4, sealPotential: 4, sourcePotential: 4, trappingStyle: 'Diagenetic / depositional topography' },
  { env: 'lacustrine', name: 'Lacustrine', reservoirQuality: 3, sealPotential: 4, sourcePotential: 5, trappingStyle: 'Rift-related tilt blocks' },
  { env: 'evaporitic', name: 'Evaporitic/Sabkha', reservoirQuality: 2, sealPotential: 5, sourcePotential: 2, trappingStyle: 'Salt diapirs, salt withdrawal' },
  { env: 'deep_marine', name: 'Deep Marine (Pelagic)', reservoirQuality: 1, sealPotential: 3, sourcePotential: 3, trappingStyle: 'Stratigraphic / diagenetic' },
  { env: 'glacial', name: 'Glacial/Periglacial', reservoirQuality: 2, sealPotential: 2, sourcePotential: 1, trappingStyle: 'Subglacial channels / tunnel valleys' },
];

export const FISCAL_REGIME_EXAMPLES: FiscalRegime[] = [
  { country: 'Norway', regimeType: 'concession', royaltyRate: 0, costRecoveryCeiling: 1, profitOilSplitGov: 0.78, incomeTaxRate: 0.22, bonusSignatureUsd: 0, rentalFeesUsdPerYr: 0, vatRate: 0, depreciationYears: 6, ringFencing: true },
  { country: 'Nigeria (PSC)', regimeType: 'psc', royaltyRate: 0.10, costRecoveryCeiling: 0.80, profitOilSplitGov: 0.60, incomeTaxRate: 0.30, bonusSignatureUsd: 50000000, rentalFeesUsdPerYr: 500000, vatRate: 0.075, depreciationYears: 5, ringFencing: true },
  { country: 'Angola', regimeType: 'psc', royaltyRate: 0.10, costRecoveryCeiling: 0.55, profitOilSplitGov: 0.65, incomeTaxRate: 0.35, bonusSignatureUsd: 10000000, rentalFeesUsdPerYr: 300000, vatRate: 0.05, depreciationYears: 4, ringFencing: false },
  { country: 'Brazil (PSC)', regimeType: 'psc', royaltyRate: 0.15, costRecoveryCeiling: 0.75, profitOilSplitGov: 0.50, incomeTaxRate: 0.34, bonusSignatureUsd: 0, rentalFeesUsdPerYr: 500000, vatRate: 0.09, depreciationYears: 5, ringFencing: false },
  { country: 'US GOM (Deep)', regimeType: 'concession', royaltyRate: 0.181, costRecoveryCeiling: 1, profitOilSplitGov: 0, incomeTaxRate: 0.21, bonusSignatureUsd: 0, rentalFeesUsdPerYr: 200000, vatRate: 0, depreciationYears: 7, ringFencing: false },
  { country: 'Iraq (TSC)', regimeType: 'service_contract', royaltyRate: 0, costRecoveryCeiling: 0.60, profitOilSplitGov: 0, incomeTaxRate: 0.15, bonusSignatureUsd: 0, rentalFeesUsdPerYr: 1000000, vatRate: 0, depreciationYears: 5, ringFencing: true },
  { country: 'Malaysia (R/C)', regimeType: 'r_factor', royaltyRate: 0.10, costRecoveryCeiling: 0.60, profitOilSplitGov: 0.70, incomeTaxRate: 0.38, bonusSignatureUsd: 0, rentalFeesUsdPerYr: 150000, vatRate: 0.06, depreciationYears: 5, ringFencing: false },
  { country: 'Kazakhstan', regimeType: 'psc', royaltyRate: 0.08, costRecoveryCeiling: 0.75, profitOilSplitGov: 0.55, incomeTaxRate: 0.20, bonusSignatureUsd: 25000000, rentalFeesUsdPerYr: 800000, vatRate: 0.12, depreciationYears: 10, ringFencing: true },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 1.1 — BASIN ANALYSIS & PETROLEUM SYSTEMS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Classify kerogen type from Rock-Eval HI and OI values.
 * Uses modified Van Krevelen diagram boundaries.
 */
export function classifyKerogenType(hi: number, oi: number): { type: KerogenTypeLabel; confidence: number; name: string } {
  if (hi > 600 && oi < 50) return { type: 'Type I', confidence: 0.95, name: 'Algal/Liptinitic' };
  if (hi > 400 && hi <= 600 && oi < 70) return { type: 'Type I/II', confidence: 0.80, name: 'Mixed Algal-Marine' };
  if (hi > 300 && hi <= 400 && oi < 80) return { type: 'Type II', confidence: 0.85, name: 'Planktonic/Exinitic' };
  if (hi > 200 && hi <= 300 && oi < 100) return { type: 'Type II/III', confidence: 0.75, name: 'Mixed Marine-Terrigenous' };
  if (hi > 50 && hi <= 200 && oi > 40) return { type: 'Type III', confidence: 0.88, name: 'Humic/Vitrinitic' };
  return { type: 'Type IV', confidence: 0.90, name: 'Inert/Inertinitic' };
}

/**
 * Estimate source rock generation potential from TOC and HI.
 * S2 (mg HC/g rock) = TOC(%) * HI(mg HC/g TOC) / 100
 * Returns generation potential in kg HC / tonne rock.
 */
export function estimateSourcePotential(tocWtPct: number, hi: number): {
  s2MgPerGRock: number;
  generationPotentialKgPerTonne: number;
  quality: 'poor' | 'fair' | 'good' | 'very_good' | 'excellent';
  expectedHCType: string;
} {
  const s2 = (tocWtPct * hi) / 100;
  const gp = s2; // approximately S2 in kg/tonne

  let quality: 'poor' | 'fair' | 'good' | 'very_good' | 'excellent';
  if (gp < 2) quality = 'poor';
  else if (gp < 5) quality = 'fair';
  else if (gp < 10) quality = 'good';
  else if (gp < 20) quality = 'very_good';
  else quality = 'excellent';

  let expectedHCType = 'Dry gas';
  if (hi > 600) expectedHCType = 'Oil (paraffinic)';
  else if (hi > 450) expectedHCType = 'Light oil';
  else if (hi > 300) expectedHCType = 'Oil & gas';
  else if (hi > 200) expectedHCType = 'Gas & condensate';
  else if (hi > 50) expectedHCType = 'Gas (dry)';
  else expectedHCType = 'Inert (no potential)';

  return { s2MgPerGRock: s2, generationPotentialKgPerTonne: gp, quality, expectedHCType };
}

/**
 * Calculate Tmax-derived maturity assessment.
 * Tmax < 435°C → Immature
 * 435-445 → Early oil
 * 445-455 → Main oil window (peak)
 * 455-470 → Late oil / wet gas
 * > 470 → Dry gas / overmature
 */
export function getMaturityFromTmax(tmaxC: number): MaturityZone {
  if (tmaxC < 435) return 'immature';
  if (tmaxC < 445) return 'early_oil';
  if (tmaxC < 455) return 'main_oil';
  if (tmaxC < 470) return 'late_oil';
  if (tmaxC < 500) return 'wet_gas';
  return 'overmature';
}

/**
 * Convert Production Index (PI = S1/(S1+S2)) to Transformation Ratio.
 * PI increases as kerogen converts to hydrocarbons.
 */
export function piToTransformationRatio(pi: number): number {
  // Approximate TR from PI (Peters, 1986)
  return Math.min(1, Math.max(0, (pi - 0.02) / 0.48)); // rough calibration
}

/**
 * Waples (1980) Time-Temperature Index (TTI) calculation.
 * TTI = Σ (2^((T-105)/10) * Δt)  where T in °C, Δt in Ma
 * Then LOM = log10(TTI) for maturity correlation.
 */
export function calculateTTI(burialHistory: BurialEvent[], geothermalGradient: number, surfaceTempC: number): number {
  let tti = 0;
  const sorted = [...burialHistory].sort((a, b) => b.ageMa - a.ageMa); // oldest to youngest

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    const deltaTimeMa = Math.abs(next.ageMa - current.ageMa);
    const avgDepthM = (current.depthM + next.depthM) / 2;
    const tempC = surfaceTempC + (avgDepthM / 1000) * geothermalGradient;
    tti += Math.pow(2, (tempC - 105) / 10) * deltaTimeMa;
  }

  return tti;
}

/**
 * Convert TTI (Waples) to approximate Vitrinite Reflectance (Ro%).
 * Empirical correlation from Waples (1980).
 */
export function ttiToRo(tti: number): number {
  if (tti <= 0.001) return 0.2;
  const logTTI = Math.log10(tti);
  // Piecewise correlation
  if (logTTI < -1) return 0.2 + 0.1 * (logTTI + 3);
  if (logTTI < 1) return 0.35 + 0.35 * logTTI + 0.1 * logTTI * logTTI;
  if (logTTI < 2) return 0.7 + 0.5 * (logTTI - 1);
  return 1.2 + 0.8 * (logTTI - 2);
}

/**
 * Sweeney & Burnham (1990) Easy%Ro — simplified kinetic model.
 * Uses a first-order Arrhenius reaction with parallel activation energies.
 * This is a simplified implementation. Full EASY%Ro uses 20 parallel reactions.
 */
export function calculateEasyRo(
  burialHistory: BurialEvent[],
  geothermalGradient: number,
  surfaceTempC: number
): { easyRo: number; peakOilDepthM: number; peakGasDepthM: number } {
  const A = 1.0e13; // pre-exponential factor s⁻¹
  const R = 0.008314; // gas constant kJ/mol·K

  // Simplified: use average activation energy distribution
  const sorted = [...burialHistory].sort((a, b) => b.ageMa - a.ageMa);

  let totalF = 0;
  let peakOilDepthM = 0;
  let peakGasDepthM = 0;
  let maxOilRate = 0;
  let maxGasRate = 0;

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    const deltaTimeSec = Math.abs(next.ageMa - current.ageMa) * 1e6 * 365.25 * 24 * 3600;
    const tempC = surfaceTempC + (current.depthM / 1000) * geothermalGradient;
    const tempK = tempC + 273.15;

    // Use representative Ea distribution (simplified from 20 to 5 reactions)
    const activationEnergies = [140, 180, 210, 240, 270]; // kJ/mol
    for (const ea of activationEnergies) {
      const k = A * Math.exp(-ea / (R * tempK));
      const f_i = 1 - Math.exp(-k * deltaTimeSec);
      totalF += 0.2 * f_i; // equal weighting for simplified model
    }

    // Track conversion rates
    const oilRate = (tempC > 80 && tempC < 150) ? (totalF - (totalF > 0.1 ? totalF - 0.01 : 0)) / deltaTimeSec * 1e12 : 0;
    const gasRate = (tempC > 130 && tempC < 200) ? (totalF - (totalF > 0.5 ? totalF - 0.01 : 0)) / deltaTimeSec * 1e12 : 0;

    if (oilRate > maxOilRate) { maxOilRate = oilRate; peakOilDepthM = current.depthM; }
    if (gasRate > maxGasRate) { maxGasRate = gasRate; peakGasDepthM = current.depthM; }
  }

  // Map to Ro-equivalent
  const easyRo = 0.2 + 3.5 * Math.min(1, totalF);
  return { easyRo, peakOilDepthM, peakGasDepthM };
}

/**
 * Full Source Rock Maturity Analysis
 * Combines multiple indicators for robust assessment.
 */
export function analyzeSourceMaturity(params: SourceRockParams, burialHistory: BurialEvent[], gradient: number, surfaceTempC: number): MaturityResult {
  const tti = calculateTTI(burialHistory, gradient, surfaceTempC);
  const ttiRo = ttiToRo(tti);
  const { easyRo, peakOilDepthM, peakGasDepthM } = calculateEasyRo(burialHistory, gradient, surfaceTempC);
  const trFromPI = piToTransformationRatio(params.pi);

  // Best estimate Ro (weighted average of inputs)
  const roInputs: { val: number; weight: number; label: string }[] = [];
  if (params.vitriniteReflectanceRo > 0) roInputs.push({ val: params.vitriniteReflectanceRo, weight: 0.5, label: 'Measured Ro' });
  if (params.tmaxC > 300) {
    // Tmax to Ro: Ro ≈ 0.018 * Tmax - 7.35 (Jarvie, 2001)
    const tmaxRo = 0.018 * params.tmaxC - 7.35;
    roInputs.push({ val: Math.max(0.2, Math.min(5, tmaxRo)), weight: 0.3, label: 'Tmax-derived Ro' });
  }
  roInputs.push({ val: easyRo, weight: 0.15, label: 'Easy%Ro' });
  roInputs.push({ val: ttiRo, weight: 0.05, label: 'TTI-derived Ro' });

  let weightedRo = 0;
  let totalWt = 0;
  for (const r of roInputs) { weightedRo += r.val * r.weight; totalWt += r.weight; }
  const bestRo = totalWt > 0 ? weightedRo / totalWt : 0.3;

  // Determine maturity zone
  const zone = MATURITY_WINDOWS.find(w => bestRo >= w.roMin && bestRo < w.roMax);
  const maturityZone: MaturityZone = zone?.zone || 'immature';

  // Determine hydrocarbon phase
  let hydrocarbonPhase: MaturityResult['hydrocarbonPhase'] = 'immature';
  if (bestRo < 0.55) hydrocarbonPhase = 'immature';
  else if (bestRo < 0.60) hydrocarbonPhase = 'heavy_oil';
  else if (bestRo < 1.00) hydrocarbonPhase = 'light_oil';
  else if (bestRo < 1.30) hydrocarbonPhase = 'light_oil';
  else if (bestRo < 2.00) hydrocarbonPhase = 'wet_gas';
  else if (bestRo < 4.00) hydrocarbonPhase = 'dry_gas';
  else hydrocarbonPhase = 'overmature';

  return {
    vitriniteReflectanceRo: bestRo,
    tti,
    easyRo,
    transformationRatio: bestRo > 0.55 ? trFromPI : 0.02,
    maturityZone,
    peakOilWindowDepthM: peakOilDepthM,
    peakGasWindowDepthM: peakGasDepthM,
    hydrocarbonPhase,
  };
}

/**
 * Build Petroleum System Event Chart from element ages.
 */
export function buildPSEventChart(elements: { element: PetroleumSystemElement['element']; startMa: number; endMa: number; critical: boolean }[]): PSEventChartEntry[] {
  return elements.map((el, i) => ({
    ageMa: (el.startMa + el.endMa) / 2,
    label: el.element.charAt(0).toUpperCase() + el.element.slice(1),
    element: el.element,
    startMa: el.startMa,
    endMa: el.endMa,
    critical: el.critical,
  }));
}

/**
 * Assess petroleum system completeness.
 */
export function assessPetroleumSystem(elements: PetroleumSystemElement[]): {
  completenessScore: number; // 0-100
  criticalGaps: string[];
  confidence: number; // 0-1
  overallAssessment: string;
} {
  const weights = { source: 0.25, reservoir: 0.20, seal: 0.20, trap: 0.15, migration: 0.12, timing: 0.08 };
  let score = 0;
  const criticalGaps: string[] = [];
  let totalConfidence = 0;

  for (const el of elements) {
    const w = weights[el.element];
    const qualityScore = { poor: 0.25, fair: 0.50, good: 0.75, excellent: 1.0 }[el.quality];
    if (el.presence) {
      score += w * qualityScore * 100;
      totalConfidence += w * el.confidence;
    } else {
      criticalGaps.push(el.element);
    }
  }

  let overallAssessment = 'Low risk — all elements confirmed';
  if (criticalGaps.length === 1) overallAssessment = 'Moderate risk — one element unconfirmed';
  else if (criticalGaps.length === 2) overallAssessment = 'High risk — two elements missing';
  else if (criticalGaps.length > 2) overallAssessment = 'Very high risk — multiple elements missing';

  return { completenessScore: Math.min(100, score), criticalGaps, confidence: totalConfidence, overallAssessment };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1.2 — DESK STUDY & DATA ACQUISITION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Assess overall data quality from multiple data types.
 */
export function assessDataQuality(assessments: DataQualityAssessment[]): {
  overallScore: number; // 0-100
  dataGaps: string[];
  recommendation: string;
  estimatedAcquisitionCostUSD: number;
} {
  let totalScore = 0;
  const dataGaps: string[] = [];

  for (const a of assessments) {
    const coverageScore = a.coverage / 100;
    const vintageScore = Math.max(0, 1 - (2026 - a.vintage) / 30); // older data = lower score
    const processingScore = { raw: 0.3, processed: 0.6, interpreted: 0.8, validated: 1.0 }[a.processingLevel];
    const typeScore = (coverageScore * 0.4 + vintageScore * 0.2 + processingScore * 0.3 + a.confidence * 0.1) * 100;
    totalScore += typeScore;

    if (typeScore < 30) dataGaps.push(`Inadequate ${a.dataType} — coverage ${a.coverage}%, vintage ${a.vintage}`);
  }

  const overallScore = assessments.length > 0 ? totalScore / assessments.length : 0;
  let recommendation = 'Proceed to exploration drilling';
  if (overallScore < 40) recommendation = 'Acquire new 2D/3D seismic before drilling';
  else if (overallScore < 65) recommendation = 'Consider targeted infill seismic + reprocessing';
  else if (overallScore < 80) recommendation = 'Good — proceed with detailed prospect mapping';

  // Rough cost estimate
  const seismicCost = dataGaps.some(g => g.includes('Seismic')) ? 5000000 : 0;
  const wellDataCost = dataGaps.some(g => g.includes('Well')) ? 2000000 : 0;
  const estimatedAcquisitionCostUSD = seismicCost + wellDataCost + 1500000; // base license/fees

  return { overallScore, dataGaps, recommendation, estimatedAcquisitionCostUSD };
}

/**
 * Evaluate a license block economically.
 */
export function evaluateLicenseBlock(
  block: LicenseBlock,
  fiscalRegime: FiscalRegime,
  estimatedReservesMbbl: number,
  oilPriceUsdPerBbl: number
): {
  netPresentValueUsd: number;
  governmentTakeFraction: number;
  contractorTakeFraction: number;
  profitabilityIndex: number;
  breakevenOilPriceUsd: number;
  decision: 'acquire' | 'negotiate' | 'drop';
} {
  const grossRevenue = estimatedReservesMbbl * 1e6 * oilPriceUsdPerBbl;
  const royalty = grossRevenue * fiscalRegime.royaltyRate;
  const netRevenue = grossRevenue - royalty;

  let costOil = 0;
  let profitOilContractor = 0;
  let profitOilGovernment = 0;
  let incomeTax = 0;

  if (fiscalRegime.regimeType === 'psc' || fiscalRegime.regimeType === 'r_factor') {
    const totalCosts = block.minimumWorkProgramUsd * 2; // rough estimate: 2x min work program
    costOil = Math.min(netRevenue * fiscalRegime.costRecoveryCeiling, totalCosts);
    const profitOil = netRevenue - costOil;
    profitOilGovernment = profitOil * fiscalRegime.profitOilSplitGov;
    profitOilContractor = profitOil * (1 - fiscalRegime.profitOilSplitGov);
    incomeTax = profitOilContractor * fiscalRegime.incomeTaxRate;
  } else if (fiscalRegime.regimeType === 'concession') {
    incomeTax = netRevenue * fiscalRegime.incomeTaxRate;
    profitOilContractor = netRevenue - incomeTax;
    profitOilGovernment = royalty + incomeTax;
  } else {
    // Service contract
    const serviceFee = netRevenue * 0.15; // typical
    profitOilContractor = serviceFee;
    profitOilGovernment = netRevenue - serviceFee;
    incomeTax = profitOilContractor * fiscalRegime.incomeTaxRate;
  }

  const contractorNet = profitOilContractor - incomeTax;
  const costs = block.minimumWorkProgramUsd + block.commitmentWells * 15000000 + block.commitmentSeismicKm * 50000;
  const npv = contractorNet - costs;
  const governmentTakeFraction = (royalty + profitOilGovernment + incomeTax) / grossRevenue;
  const contractorTakeFraction = contractorNet / grossRevenue;
  const profitabilityIndex = costs > 0 ? contractorNet / costs : 0;
  const breakevenOilPrice = costs > 0 ? (costs / estimatedReservesMbbl / 1e6) / contractorTakeFraction : 0;

  let decision: 'acquire' | 'negotiate' | 'drop' = 'drop';
  if (npv > 0 && profitabilityIndex > 1.5) decision = 'acquire';
  else if (npv > 0) decision = 'negotiate';

  return { netPresentValueUsd: npv, governmentTakeFraction, contractorTakeFraction, profitabilityIndex, breakevenOilPriceUsd: breakevenOilPrice, decision };
}

/**
 * Rank sub-basins by petroleum system risk.
 */
export function rankSubBasins(basins: { name: string; basinType: BasinType; scores: { source: number; reservoir: number; seal: number; trap: number; timing: number } }[]): SubBasinRanking[] {
  const weights = { source: 0.25, reservoir: 0.20, seal: 0.20, trap: 0.20, timing: 0.15 };
  const ranked = basins.map((b, i) => {
    const rawScore = b.scores.source * weights.source + b.scores.reservoir * weights.reservoir + b.scores.seal * weights.seal + b.scores.trap * weights.trap + b.scores.timing * weights.timing;
    const overallRiskScore = Math.min(100, rawScore * 20); // scale 0-5 to 0-100
    let recommendation: SubBasinRanking['recommendation'] = 'drop';
    if (overallRiskScore > 75) recommendation = 'high_grade';
    else if (overallRiskScore > 55) recommendation = 'farm_in';
    else if (overallRiskScore > 35) recommendation = 'acquire_seismic';
    return { name: b.name, basinType: b.basinType, sourceScore: b.scores.source, reservoirScore: b.scores.reservoir, sealScore: b.scores.seal, trapScore: b.scores.trap, timingScore: b.scores.timing, overallRiskScore, rank: 0, recommendation };
  });
  ranked.sort((a, b) => b.overallRiskScore - a.overallRiskScore);
  ranked.forEach((r, i) => { r.rank = i + 1; });
  return ranked;
}

/**
 * Calculate the critical moment of a petroleum system.
 * Critical moment = time when most hydrocarbons were generated and migrated.
 */
export function calculateCriticalMoment(burialHistory: BurialEvent[], gradient: number, surfaceTempC: number): {
  criticalMomentAgeMa: number;
  criticalDepthM: number;
  preservationTimeMa: number;
} {
  const sorted = [...burialHistory].sort((a, b) => b.ageMa - a.ageMa);
  let maxGenRate = 0;
  let criticalAge = 0;
  let criticalDepth = 0;

  for (const event of sorted) {
    const tempC = surfaceTempC + (event.depthM / 1000) * gradient;
    // Generation rate proportional to temperature in oil window
    if (tempC > 60 && tempC < 150) {
      const genRate = (tempC - 60) * event.depthM;
      if (genRate > maxGenRate) {
        maxGenRate = genRate;
        criticalAge = event.ageMa;
        criticalDepth = event.depthM;
      }
    }
  }

  const lastEvent = sorted[sorted.length - 1];
  const preservationTimeMa = criticalAge - (lastEvent?.ageMa || 0);

  return { criticalMomentAgeMa: criticalAge, criticalDepthM: criticalDepth, preservationTimeMa };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROSPECT RANKING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Rank prospects using weighted geological + economic scoring.
 */
export function rankProspects(prospects: ProspectRankingInput[]): ProspectRankingResult[] {
  const results: ProspectRankingResult[] = prospects.map(p => {
    // Geological score (0-100)
    const geoScore = (
      p.sourcePresence * p.sourceQuality * 4.0 +
      p.reservoirPresence * p.reservoirQuality * 4.0 +
      p.sealPresence * p.sealQuality * 4.0 +
      p.trapIntegrity * 2.0 +
      p.migrationEfficiency * 2.0 +
      (5 - p.timingRisk) * 2.0
    );
    const geologicalScore = Math.min(100, geoScore);

    // GoS (Geological Probability of Success)
    const gPoS = Math.min(1, Math.max(0.05,
      p.sourcePresence * 0.3 + p.reservoirPresence * 0.25 + p.sealPresence * 0.25 + (5 - p.timingRisk) / 5 * 0.2
    ));

    // Economic score (0-100)
    const recoveryFactor = 0.30; // typical
    const recoverableBbl = p.meanResourcesMmbbl * 1e6 * recoveryFactor;
    const npvPerBbl = 8; // rough margin
    const npv = recoverableBbl * npvPerBbl;
    const drillCost = (p.drillDepthM * 2500 + p.waterDepthM * 5000 + p.distanceToInfrastructureKm * 200000);
    const economicScore = Math.min(100, Math.max(0, (npv - drillCost) / Math.max(1, drillCost) * 50 + 50));

    // EMV
    const emvUsd = gPoS * (npv - drillCost) - (1 - gPoS) * drillCost * 0.3;
    const cos = gPoS * 0.85; // chance of success = geological × commercial factor

    // Overall score
    const overallScore = geologicalScore * 0.55 + economicScore * 0.45;

    let riskCategory: 'lead' | 'prospect' | 'drill_ready' = 'lead';
    if (overallScore > 70 && gPoS > 0.35) riskCategory = 'drill_ready';
    else if (overallScore > 45) riskCategory = 'prospect';

    return { overallScore, geologicalScore, economicScore, rank: 0, riskCategory, emvUsd, gPoS, cos };
  });

  results.sort((a, b) => b.overallScore - a.overallScore);
  results.forEach((r, i) => { r.rank = i + 1; });
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BURIAL HISTORY & SUBSIDENCE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate synthetic burial history curve for visualization.
 */
export function generateBurialCurve(maxDepthM: number, maxAgeMa: number, steps: number): { ageMa: number; depthM: number; tempC: number; gradient: number; surfaceTempC: number }[] {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const ageMa = maxAgeMa * (1 - i / steps);
    // Subsidence follows a logarithmic/exponential decay model
    const depthM = maxDepthM * Math.pow(i / steps, 1.3);
    const tempC = 15 + (depthM / 1000) * 30; // default 30°C/km
    points.push({ ageMa, depthM, tempC, gradient: 30, surfaceTempC: 15 });
  }
  return points;
}

/**
 * Estimate erosion from missing section (vitrinite reflectance discontinuity).
 */
export function estimateErosion(roSurface: number, roDeep: number, depthGapM: number, gradient: number): { erodedThicknessM: number; maxBurialDepthM: number } {
  if (roSurface <= 0 || roDeep <= 0 || depthGapM <= 0) return { erodedThicknessM: 0, maxBurialDepthM: depthGapM };
  const roGradient = (roDeep - roSurface) / depthGapM;
  const erodedThicknessM = roSurface / Math.max(0.001, roGradient);
  return { erodedThicknessM, maxBurialDepthM: depthGapM + erodedThicknessM };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFERENCE PAPERS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ExplorationPaper {
  title: string;
  authors: string;
  year: number;
  journal: string;
  description: string;
  keyConcept: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  category: 'basin' | 'geochem' | 'geophysics' | 'petroleum_system' | 'economics';
}

export const EXPLORATION_PAPERS: ExplorationPaper[] = [
  { title: 'The Petroleum System', authors: 'Magoon, L.B., Dow, W.G.', year: 1994, journal: 'AAPG Memoir 60', description: 'Definitive framework linking source, reservoir, seal, trap, migration & timing into a unified petroleum system concept.', keyConcept: 'Petroleum system elements & critical moment', difficulty: 'Basic', category: 'petroleum_system' },
  { title: 'Guidelines for Evaluating Petroleum Source Rock Using Programmed Pyrolysis', authors: 'Peters, K.E.', year: 1986, journal: 'AAPG Bulletin', description: 'Establishes Rock-Eval pyrolysis interpretation guidelines: TOC, HI, OI, Tmax for source rock screening.', keyConcept: 'Rock-Eval pyrolysis interpretation', difficulty: 'Basic', category: 'geochem' },
  { title: 'Applied Source Rock Geochemistry', authors: 'Peters, K.E., Cassa, M.R.', year: 1994, journal: 'AAPG Memoir 60', description: 'Comprehensive review of source rock evaluation: organic richness, quality, and thermal maturity.', keyConcept: 'Source rock evaluation workflow', difficulty: 'Intermediate', category: 'geochem' },
  { title: 'Evaluation of a Simple Model of Vitrinite Reflectance Based on Chemical Kinetics', authors: 'Sweeney, J.J., Burnham, A.K.', year: 1990, journal: 'AAPG Bulletin', description: 'Presents the Easy%Ro algorithm — 20 parallel first-order Arrhenius reactions for vitrinite maturation modeling.', keyConcept: 'Easy%Ro kinetic model', difficulty: 'Advanced', category: 'geochem' },
  { title: 'Time and Temperature in Petroleum Formation: Application of Lopatin\'s Method', authors: 'Waples, D.W.', year: 1980, journal: 'AAPG Bulletin', description: 'Introduces the Time-Temperature Index (TTI) for modeling thermal maturity from burial history.', keyConcept: 'TTI maturity modeling', difficulty: 'Intermediate', category: 'geochem' },
  { title: 'Basin Analysis: Principles and Applications', authors: 'Allen, P.A., Allen, J.R.', year: 2005, journal: 'Wiley-Blackwell', description: 'Fundamental textbook on basin formation mechanisms, subsidence analysis, and thermal history.', keyConcept: 'Subsidence & thermal history', difficulty: 'Intermediate', category: 'basin' },
  { title: 'Petroleum Formation and Occurrence', authors: 'Tissot, B.P., Welte, D.H.', year: 1984, journal: 'Springer-Verlag', description: 'Classic reference on kerogen types, hydrocarbon generation, and migration processes.', keyConcept: 'Kerogen classification & generation', difficulty: 'Intermediate', category: 'basin' },
  { title: 'Geothermal Gradients, Heat Flow, and Hydrocarbon Recovery', authors: 'Klemme, H.D.', year: 1975, journal: 'AAPG Memoir 25', description: 'Global compilation of geothermal gradients and their impact on hydrocarbon maturation.', keyConcept: 'Geothermal gradient database', difficulty: 'Basic', category: 'basin' },
  { title: 'Fiscal Systems for Oil and Gas', authors: 'Johnston, D.', year: 1994, journal: 'OGCI Publications', description: 'Comparative analysis of global petroleum fiscal regimes: concessions, PSCs, service contracts.', keyConcept: 'Fiscal regime comparison', difficulty: 'Intermediate', category: 'economics' },
  { title: 'Seismic Geomorphology: Applications to HC Exploration', authors: 'Posamentier, H.W., Kolla, V.', year: 2003, journal: 'AAPG Memoir', description: 'Using seismic attributes to reconstruct depositional environments and identify stratigraphic traps.', keyConcept: 'Seismic geomorphology for exploration', difficulty: 'Advanced', category: 'geophysics' },
  { title: 'Global Basin Classification System', authors: 'Kingston, D.R., et al.', year: 1983, journal: 'AAPG Bulletin', description: 'Comprehensive basin classification based on tectonic setting and depositional cycles.', keyConcept: 'Basin type classification', difficulty: 'Basic', category: 'basin' },
  { title: 'Sequence Stratigraphy as a Scientific Enterprise', authors: 'Catuneanu, O.', year: 2006, journal: 'Marine & Petroleum Geology', description: 'Modern synthesis of sequence stratigraphy concepts for exploration workflow.', keyConcept: 'Sequence stratigraphy methods', difficulty: 'Advanced', category: 'basin' },
];