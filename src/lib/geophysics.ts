/**
 * Geophysics Engineering Library
 * Sub-Step 1.3 — Geophysical Surveying (Field Acquisition)
 * 
 * Comprehensive models for survey design, source-receiver geometry,
 * fold coverage, resolution analysis, cost modeling, acquisition timeline,
 * gravity/magnetic/EM/geochemical survey calculations.
 *
 * References:
 *   - Yilmaz (2001) — Seismic Data Analysis
 *   - Sheriff & Geldart (1995) — Exploration Seismology
 *   - Nabighian et al. (2005) — Gravity & Magnetic Methods
 *   - Constable (2010) — CSEM for hydrocarbon exploration
 *   - Cordsen, Galbraith & Peirce (2000) — 3D Seismic Survey Design
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type SurveyType = 'seismic_2d' | 'seismic_3d' | 'gravity' | 'magnetic' | 'em_csem' | 'em_mt' | 'geochemical';
export type LocationType = 'onshore' | 'offshore' | 'transition';
export type SeismicSource = 'dynamite' | 'vibroseis' | 'airgun' | 'weight_drop';
export type ReceiverType = 'geophone' | 'hydrophone' | 'obc' | 'obn';
export type GravityPlatform = 'ground' | 'airborne' | 'satellite';
export type MagneticPlatform = 'airborne' | 'ground' | 'marine' | 'drone';
export type EMSurveyMethod = 'csem' | 'mt' | 'amt';

export interface SeismicSurveyConfig {
  surveyType: '2d' | '3d';
  location: LocationType;
  sourceType: SeismicSource;
  receiverType: ReceiverType;
  shotSpacing_m: number;
  recSpacing_m: number;
  lineSpacing_m: number;        // 2D: line separation, 3D: sail line spacing
  nChannels: number;
  nSourceLines: number;          // 3D: source line count
  sampleRate_ms: number;
  recordLength_s: number;
  sweepFreqLow_Hz: number;       // vibroseis
  sweepFreqHigh_Hz: number;
  sweepLength_s: number;         // vibroseis
  chargeWeight_kg: number;       // dynamite
  airgunVolume_cuin: number;     // airgun
  surveyArea_sqkm: number;
  targetDepth_m: number;
  targetVelocity_ms: number;
}

export interface GravitySurveyConfig {
  platform: GravityPlatform;
  stationSpacing_m: number;
  lineSpacing_m: number;
  surveyArea_sqkm: number;
  densityContrast_gcc: number;
  expectedAnomalyRange_mGal: [number, number];
  targetDepth_m: number;
}

export interface MagneticSurveyConfig {
  platform: MagneticPlatform;
  flightHeight_m: number;        // airborne
  lineSpacing_m: number;
  tieLineSpacing_m: number;
  surveyArea_sqkm: number;
  inclination_deg: number;
  declination_deg: number;
  expectedAnomalyRange_nT: [number, number];
}

export interface EMSurveyConfig {
  method: EMSurveyMethod;
  location: LocationType;
  frequencyMin_Hz: number;
  frequencyMax_Hz: number;
  sourceRecOffset_m: number;     // CSEM tow offset
  towDepth_m: number;
  waterDepth_m: number;
  recSpacing_m: number;
  lineSpacing_m: number;
  surveyArea_sqkm: number;
  targetResistivity_ohm_m: number;
  backgroundResistivity_ohm_m: number;
}

export interface GeochemConfig {
  location: LocationType;
  gridSpacing_m: number;
  surveyArea_sqkm: number;
  sampleDepth_m: number;
  analytes: ('C1' | 'C2' | 'C3' | 'C4' | 'iC4' | 'nC4')[];
  backgroundC1_ppm: number;
  labMethod: 'headspace' | 'adsorbed' | 'microbial';
}

export interface SurveyCostEstimate {
  acquisitionCostUSD: number;
  processingCostUSD: number;
  mobilizationCostUSD: number;
  permittingCostUSD: number;
  hseCostUSD: number;
  totalCostUSD: number;
  costPerKmUSD: number;
  costPerSqKmUSD: number;
}

export interface AcquisitionTimeline {
  permittingDays: number;
  mobilizationDays: number;
  acquisitionDays: number;
  demobilizationDays: number;
  processingDays: number;
  interpretationDays: number;
  totalDurationDays: number;
  dailyProductionKm: number;
  crewSize: number;
}

export interface FoldCoverageResult {
  foldInline: number;
  foldCrossline: number;
  totalFold: number;
  binSize_m: number;
  maxOffset_m: number;
  minOffset_m: number;
  azimuthRange_deg: [number, number];
  cmpDensityPerSqKm: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEISMIC — SURVEY DESIGN
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate acoustic impedance.
 * AI = ρ × V  (g·cm⁻³ · m/s → g/cm²·s × 10⁴ = kg/m²·s)
 */
export function calculateAcousticImpedance(rho: number, v: number): number {
  return rho * v;
}

/**
 * Calculate reflection coefficient.
 * RC = (AI₂ − AI₁) / (AI₂ + AI₁)
 */
export function calculateReflectionCoefficient(aiAbove: number, aiBelow: number): number {
  if (aiAbove + aiBelow === 0) return 0;
  return (aiBelow - aiAbove) / (aiBelow + aiAbove);
}

/**
 * Calculate normal moveout (NMO).
 * Δt = √(t₀² + x²/v²) − t₀
 */
export function calculateNMO(t0: number, x: number, v: number): number {
  return Math.sqrt(t0 * t0 + (x * x) / (v * v)) - t0;
}

/**
 * Dix equation for interval velocity.
 * Vint = √((Vrms₂²·t₂ − Vrms₁²·t₁) / (t₂ − t₁))
 */
export function calculateDixVelocity(vrms1: number, t1: number, vrms2: number, t2: number): number {
  const dt = t2 - t1;
  if (dt <= 0) return 0;
  const val = (vrms2 * vrms2 * t2 - vrms1 * vrms1 * t1) / dt;
  return val > 0 ? Math.sqrt(val) : 0;
}

/**
 * Vertical resolution (Rayleigh criterion: λ/4).
 */
export function calculateVerticalResolution(velocity: number, frequency: number): number {
  if (frequency <= 0) return 0;
  return velocity / frequency / 4;
}

/**
 * Fresnel zone radius (lateral resolution).
 * r_f = (v/2) × √(t₀/f)
 * where v = velocity, t₀ = two-way time, f = dominant frequency
 */
export function calculateFresnelZone(velocity: number, t0: number, frequency: number): number {
  if (frequency <= 0) return 0;
  return (velocity / 2) * Math.sqrt(t0 / frequency);
}

/**
 * Generate a Ricker wavelet.
 * w(t) = (1 − 2π²f²t²) × exp(−π²f²t²)
 */
export function generateRickerWavelet(f: number, dt: number = 0.001, lengthMs: number = 100): { t: number; amplitude: number }[] {
  const points: { t: number; amplitude: number }[] = [];
  const lengthSec = lengthMs / 1000;
  for (let t = -lengthSec / 2; t <= lengthSec / 2; t += dt) {
    const pift = Math.PI * f * t;
    const amp = (1 - 2 * pift * pift) * Math.exp(-pift * pift);
    points.push({ t: t * 1000, amplitude: amp });
  }
  return points;
}

/**
 * Calculate source energy in dB relative to 1 μPa @ 1m.
 * Dynamite: ~200-215 dB, Airgun: ~220-250 dB, Vibroseis: ~120-135 dB (ground force)
 */
export function calculateSourceEnergy(sourceType: SeismicSource, chargeWeight_kg?: number, airgunVolume?: number, sweepForce_kN?: number): number {
  switch (sourceType) {
    case 'dynamite':
      // E = 10 * log10(chargeWt^0.75 * 1e12) approximately
      return Math.max(190, Math.min(220, 200 + 12 * Math.log10(Math.max(0.1, chargeWeight_kg || 1))));
    case 'airgun':
      return Math.max(210, Math.min(255, 220 + 15 * Math.log10(Math.max(10, airgunVolume || 100) / 100)));
    case 'vibroseis':
      return Math.max(110, Math.min(140, 120 + 16 * Math.log10(Math.max(5, sweepForce_kN || 27) / 27)));
    case 'weight_drop':
      return 140 + 8 * Math.log10(Math.max(100, chargeWeight_kg || 200) / 200);
    default:
      return 200;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEISMIC — FOLD & GEOMETRY (Cordsen, Galbraith & Peirce, 2000)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate full fold coverage for a 3D or 2D seismic survey.
 * 
 * 2D Fold = nChannels × shotSpacing / (2 × recSpacing)
 * 3D Fold inline = nChannels × recSpacing / (2 × shotSpacing) per line
 * 3D Fold crossline = nSourceLines × shotSpacing / (2 × lineSpacing)  
 * 3D Total Fold = foldInline × foldCrossline
 * 
 * Bin size (3D) = recSpacing/2 × lineSpacing/2
 */
export function calculateSeismicFold(config: SeismicSurveyConfig): FoldCoverageResult {
  if (config.surveyType === '2d') {
    const fold = Math.round((config.nChannels * config.shotSpacing_m) / (2 * config.recSpacing_m));
    const maxOffset = (config.nChannels - 1) * config.recSpacing_m;
    const cmpDensity = fold / config.shotSpacing_m * 1000;
    return {
      foldInline: fold,
      foldCrossline: 1,
      totalFold: fold,
      binSize_m: config.recSpacing_m / 2,
      maxOffset_m: maxOffset,
      minOffset_m: config.recSpacing_m,
      azimuthRange_deg: [0, 180],
      cmpDensityPerSqKm: cmpDensity,
    };
  }
  // 3D
  const foldInline = Math.round((config.nChannels * config.recSpacing_m) / (2 * config.shotSpacing_m));
  const foldCrossline = Math.max(1, Math.round((config.nSourceLines * config.shotSpacing_m) / (2 * config.lineSpacing_m)));
  const totalFold = foldInline * foldCrossline;
  const binSize = config.recSpacing_m / 2;
  const maxOffset = Math.sqrt(
    Math.pow((config.nChannels - 1) * config.recSpacing_m / 2, 2) +
    Math.pow((config.nSourceLines - 1) * config.lineSpacing_m / 2, 2)
  );
  const cmpDensity = totalFold / (binSize * binSize / 1e6);
  return {
    foldInline,
    foldCrossline,
    totalFold,
    binSize_m: binSize,
    maxOffset_m: maxOffset,
    minOffset_m: Math.sqrt(binSize * binSize + binSize * binSize),
    azimuthRange_deg: [0, 360],
    cmpDensityPerSqKm: cmpDensity,
  };
}

/**
 * Calculate the spatial alias frequency (Nyquist) for given receiver spacing.
 * f_nyq = v / (2 × dx)
 * dx must be ≤ v / (2 × f_max) = λ/2
 */
export function calculateNyquistFrequency(velocity_ms: number, receiverSpacing_m: number): number {
  if (receiverSpacing_m <= 0) return Infinity;
  return velocity_ms / (2 * receiverSpacing_m);
}

/**
 * Calculate required receiver spacing to avoid aliasing at given frequency.
 */
export function calculateMaxReceiverSpacing(velocity_ms: number, maxFrequency_Hz: number): number {
  if (maxFrequency_Hz <= 0) return Infinity;
  return velocity_ms / (2 * maxFrequency_Hz);
}

/**
 * Calculate migration aperture (radius) needed to image a dipping event.
 * Aperture = depth × tan(dip) + Fresnel zone radius
 */
export function calculateMigrationAperture(depth_m: number, dip_deg: number, fresnelRadius_m: number): number {
  return depth_m * Math.tan(dip_deg * Math.PI / 180) + fresnelRadius_m;
}

/**
 * Generate fold coverage distribution across offset bins.
 * Returns offset vs fold for fold taper analysis.
 */
export function generateFoldDistribution(
  config: SeismicSurveyConfig,
  nOffsetBins: number = 10
): { offset_m: number; fold: number; label: string }[] {
  const foldResult = calculateSeismicFold(config);
  const maxOff = foldResult.maxOffset_m;
  const bins: { offset_m: number; fold: number; label: string }[] = [];
  for (let i = 0; i < nOffsetBins; i++) {
    const offset = (maxOff / nOffsetBins) * (i + 0.5);
    // Fold typically decreases at far offsets (taper)
    const nearFactor = Math.max(0.3, 1 - 0.4 * (offset / maxOff));
    const fold = Math.round(foldResult.totalFold * nearFactor);
    bins.push({ offset_m: offset, fold, label: `${offset.toFixed(0)}m` });
  }
  return bins;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEISMIC — ACQUISITION DURATION & COST
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Model seismic acquisition duration.
 * Based on production rate (shots/day or km/day) dependent on terrain/source.
 */
export function modelSeismicTimeline(config: SeismicSurveyConfig): AcquisitionTimeline {
  let dailyProdKm: number;
  switch (config.sourceType) {
    case 'dynamite': dailyProdKm = config.location === 'onshore' ? 3 : 1.5; break;
    case 'vibroseis': dailyProdKm = 15; break;
    case 'airgun': dailyProdKm = 40; break;
    case 'weight_drop': dailyProdKm = 5; break;
    default: dailyProdKm = 10;
  }
  // Terrain factor
  if (config.location === 'transition') dailyProdKm *= 0.5;
  else if (config.location === 'onshore' && ['dynamite', 'weight_drop'].includes(config.sourceType))
    dailyProdKm *= 0.85;

  const totalLineKm = config.surveyType === '2d'
    ? config.surveyArea_sqkm * 1000 / config.lineSpacing_m
    : config.surveyArea_sqkm * 1000 / config.lineSpacing_m * (config.nSourceLines || 1);

  const acquisitionDays = Math.ceil(totalLineKm / Math.max(0.1, dailyProdKm));
  const crewSize = config.sourceType === 'vibroseis' ? 35 : config.sourceType === 'airgun' ? 25 : 50;
  const permittingDays = Math.ceil(config.surveyArea_sqkm * 0.3) + 30;
  const mobilizationDays = config.location === 'offshore' ? 14 : 10;
  const processingDays = Math.ceil(acquisitionDays * 0.5 + 30);
  const interpretationDays = Math.ceil(processingDays * 0.4 + 14);

  return {
    permittingDays,
    mobilizationDays,
    acquisitionDays,
    demobilizationDays: Math.ceil(mobilizationDays * 0.7),
    processingDays,
    interpretationDays,
    totalDurationDays: permittingDays + mobilizationDays + acquisitionDays + Math.ceil(mobilizationDays * 0.7) + processingDays + interpretationDays,
    dailyProductionKm: dailyProdKm,
    crewSize,
  };
}

/**
 * Estimate seismic survey cost.
 * Onshore 2D: $5,000-15,000 / line-km
 * Onshore 3D: $25,000-80,000 / sq-km
 * Offshore 2D: $500-3,000 / line-km
 * Offshore 3D: $3,000-15,000 / sq-km
 */
export function estimateSeismicCost(config: SeismicSurveyConfig): SurveyCostEstimate {
  const isOffshore = config.location === 'offshore';
  const is3D = config.surveyType === '3d';

  let costPerKm: number;
  if (!isOffshore && !is3D) costPerKm = 8000;
  else if (!isOffshore && is3D) costPerKm = 45000;
  else if (isOffshore && !is3D) costPerKm = 1200;
  else costPerKm = 7000;

  const lineKm = is3D
    ? config.surveyArea_sqkm * 1000 / config.lineSpacing_m * config.nSourceLines
    : config.surveyArea_sqkm * 1000 / config.lineSpacing_m;

  // Source cost factor
  let sourceFactor = 1;
  if (config.sourceType === 'vibroseis') sourceFactor = 0.6;
  else if (config.sourceType === 'dynamite') sourceFactor = 1.4;
  else if (config.sourceType === 'airgun') sourceFactor = 0.35;

  const acquisitionCost = lineKm * costPerKm * sourceFactor;
  const processingCost = acquisitionCost * (is3D ? 0.25 : 0.20);
  const mobilizationCost = isOffshore ? acquisitionCost * 0.15 : acquisitionCost * 0.08;
  const permittingCost = isOffshore ? acquisitionCost * 0.03 : acquisitionCost * 0.08;
  const hseCost = acquisitionCost * 0.05;
  const total = acquisitionCost + processingCost + mobilizationCost + permittingCost + hseCost;
  const sqKmApprox = config.surveyArea_sqkm;

  return {
    acquisitionCostUSD: Math.round(acquisitionCost),
    processingCostUSD: Math.round(processingCost),
    mobilizationCostUSD: Math.round(mobilizationCost),
    permittingCostUSD: Math.round(permittingCost),
    hseCostUSD: Math.round(hseCost),
    totalCostUSD: Math.round(total),
    costPerKmUSD: Math.round(total / Math.max(1, lineKm)),
    costPerSqKmUSD: Math.round(total / Math.max(1, sqKmApprox)),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRAVITY & MAGNETICS — FIELD SURVEY CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Free Air Correction (FAC).
 * FAC = −0.3086 × h  mGal (h in meters)
 * Negative sign: add FAC to gobs to get FAA (i.e. FAA = gobs + FAC)
 */
export function calculateFreeAirCorrection(elevation: number): number {
  return -0.3086 * elevation;
}

/**
 * Bouguer slab correction.
 * BC = 0.04191 × ρ × h  mGal
 * ρ in g/cm³, h in meters
 * This is subtracted from FAA to get simple Bouguer anomaly.
 */
export function calculateBouguerSlabCorrection(elevation: number, density: number = 2.67): number {
  return 0.04191 * density * elevation;
}

/**
 * Complete Bouguer anomaly.
 * BA = gobs ± FAC − BC + TC
 * Returns: freeAirAnomaly, simpleBouguer, completeBouguer
 */
export function calculateBouguerAnomaly(
  observedGravity_mGal: number,
  elevation_m: number,
  theoreticalGravity_mGal: number,
  density_gcc: number = 2.67,
  terrainCorrection_mGal: number = 0
): {
  freeAirAnomaly_mGal: number;
  simpleBouguerAnomaly_mGal: number;
  completeBouguerAnomaly_mGal: number;
} {
  const fac = calculateFreeAirCorrection(elevation_m);
  const freeAir = observedGravity_mGal + fac - theoreticalGravity_mGal;
  const bc = calculateBouguerSlabCorrection(elevation_m, density_gcc);
  const simpleBouguer = freeAir - bc;
  const completeBouguer = simpleBouguer + terrainCorrection_mGal;
  return {
    freeAirAnomaly_mGal: freeAir,
    simpleBouguerAnomaly_mGal: simpleBouguer,
    completeBouguerAnomaly_mGal: completeBouguer,
  };
}

/**
 * Normal/theoretical gravity at latitude (WGS84 ellipsoid, Somigliana's formula).
 * g(φ) = gₑ(1 + k sin²φ) / √(1 − e² sin²φ)
 * Simplified: g ≈ 978031.85(1 + 0.0053024 sin²φ − 0.0000058 sin²2φ) mGal
 */
export function calculateTheoreticalGravity(latitude_deg: number): number {
  const phi = latitude_deg * Math.PI / 180;
  const sin2 = Math.sin(phi) ** 2;
  const sin22 = Math.sin(2 * phi) ** 2;
  return 978031.85 * (1 + 0.0053024 * sin2 - 0.0000058 * sin22);
}

/**
 * Estimate basement/source depth from gravity anomaly (half-slab approximation).
 * Δg = 2πG Δρ h  →  h = Δg / (2πG Δρ)
 * G = 6.6743e-11 m³/(kg·s²), Δρ in kg/m³ (= g/cm³ × 1000), Δg in mGal (= 1e-5 m/s²)
 * h = Δg_mGal × 1e-5 / (2π × 6.6743e-11 × Δρ_kgm3) = Δg × 23.84 / Δρ_gcc
 */
export function estimateBasementDepthGravity(anomaly_mGal: number, densityContrast_gcc: number): number {
  if (densityContrast_gcc <= 0) return 0;
  return (Math.abs(anomaly_mGal) * 23.84) / densityContrast_gcc;
}

/**
 * Calculate total line-km for a gravity survey.
 */
export function calculateGravitySurveyLineKm(config: GravitySurveyConfig): { totalLineKm: number; nStations: number; costEstimateUSD: number } {
  const nLines = Math.ceil(Math.sqrt(config.surveyArea_sqkm) * 1000 / config.lineSpacing_m) + 1;
  const lineLength_m = Math.sqrt(config.surveyArea_sqkm) * 1000;
  const totalLineKm = (nLines * lineLength_m) / 1000;
  const stationsPerLine = Math.ceil(lineLength_m / config.stationSpacing_m) + 1;
  const nStations = nLines * stationsPerLine;

  let costPerStation: number;
  switch (config.platform) {
    case 'ground': costPerStation = 120; break;
    case 'airborne': costPerStation = 8; break;
    case 'satellite': costPerStation = 0.5; break;
    default: costPerStation = 100;
  }
  return { totalLineKm, nStations, costEstimateUSD: Math.round(nStations * costPerStation) };
}

/**
 * Magnetic: calculate Reduced-To-Pole (RTP) anomaly.
 * Simplified: RTP amplifies anomalies at the pole.
 * RTP_factor = 1 / [sin²(I) + cos²(I)·cos²(D−D₀)]
 * where I = inclination, D = declination, D₀ = azimuth of profile
 */
export function calculateRTPFactor(inclination_deg: number, declination_deg: number, profileAzimuth_deg: number = 0): number {
  const I = inclination_deg * Math.PI / 180;
  const D = declination_deg * Math.PI / 180;
  const D0 = profileAzimuth_deg * Math.PI / 180;
  const denom = Math.sin(I) ** 2 + Math.cos(I) ** 2 * Math.cos(D - D0) ** 2;
  return denom > 0.001 ? 1 / denom : 1;
}

/**
 * Calculate approximate RTP anomaly from TMI.
 */
export function applyRTPCorrection(tmi_nT: number, inclination_deg: number, declination_deg: number): number {
  const factor = calculateRTPFactor(inclination_deg, declination_deg);
  return tmi_nT * factor;
}

/**
 * Estimate magnetic source (basement) depth from anomaly half-width.
 * Depth ≈ half-width × 0.65 (for thin dike model)
 * Depth ≈ half-width × 1.0 (for broad contact)
 */
export function estimateBasementDepthMagnetic(anomalyHalfWidth_m: number, modelType: 'dike' | 'contact' = 'dike'): number {
  const factor = modelType === 'dike' ? 0.65 : 1.0;
  return anomalyHalfWidth_m * factor;
}

/**
 * Calculate total line-km for magnetic survey with tie lines.
 */
export function calculateMagSurveyLineKm(config: MagneticSurveyConfig): { totalLineKm: number; tieLineKm: number; costEstimateUSD: number } {
  const areaSide_m = Math.sqrt(config.surveyArea_sqkm) * 1000;
  const nLines = Math.ceil(areaSide_m / config.lineSpacing_m) + 1;
  const nTieLines = Math.ceil(areaSide_m / config.tieLineSpacing_m) + 1;
  const totalLineKm = (nLines * areaSide_m) / 1000;
  const tieLineKm = (nTieLines * areaSide_m) / 1000;
  const costPerLineKm = config.platform === 'airborne' ? 80 : 350;
  return { totalLineKm, tieLineKm, costEstimateUSD: Math.round((totalLineKm + tieLineKm) * costPerLineKm) };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EM METHODS (CSEM / MT)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate EM skin depth.
 * δ = 503 × √(ρ / f) meters
 * ρ = resistivity in Ω·m, f = frequency in Hz
 */
export function calculateSkinDepth(resistivity_ohm_m: number, frequency_Hz: number): number {
  if (frequency_Hz <= 0 || resistivity_ohm_m <= 0) return Infinity;
  return 503 * Math.sqrt(resistivity_ohm_m / frequency_Hz);
}

/**
 * Calculate CSEM normalized E-field magnitude (simplified 1D model).
 * |E| ∝ 1/r³ in near-field, ∝ 1/r² at intermediate, ∝ 1/r⁴e^(−r/δ) in far-field
 * Returns normalized amplitude at given offset.
 */
export function calculateCSEMResponse(
  offset_m: number,
  frequency_Hz: number,
  waterDepth_m: number,
  targetResistivity_ohm_m: number,
  backgroundResistivity_ohm_m: number
): { eFieldNorm: number; phase_deg: number; skinDepth_m: number; regime: 'near_field' | 'transition' | 'far_field' } {
  const skinDepth = calculateSkinDepth(backgroundResistivity_ohm_m, frequency_Hz);
  const normalizedRange = offset_m / Math.max(1, waterDepth_m);

  let regime: 'near_field' | 'transition' | 'far_field';
  let eFieldNorm: number;
  let phase_deg: number;

  if (normalizedRange < 1.5) {
    // Near-field: geometric spreading dominates
    regime = 'near_field';
    eFieldNorm = 1 / Math.pow(normalizedRange, 3);
    phase_deg = 0;
  } else if (normalizedRange < 5) {
    // Transition zone — most sensitive to resistive layers
    regime = 'transition';
    const resistivityContrast = targetResistivity_ohm_m / Math.max(1, backgroundResistivity_ohm_m);
    eFieldNorm = (1 / Math.pow(normalizedRange, 2)) * (1 + 0.3 * Math.log10(Math.max(1, resistivityContrast)));
    phase_deg = 30 + 15 * Math.log10(Math.max(1, resistivityContrast));
  } else {
    // Far-field: exponential decay
    regime = 'far_field';
    const resistivityContrastParam = targetResistivity_ohm_m / Math.max(1, backgroundResistivity_ohm_m);
    eFieldNorm = Math.exp(-normalizedRange / 6) / Math.pow(normalizedRange, 4) * resistivityContrastParam;
    phase_deg = 45 + 20 * Math.log10(Math.max(1, resistivityContrastParam));
  }

  return { eFieldNorm, phase_deg: Math.min(90, Math.max(0, phase_deg)), skinDepth_m: skinDepth, regime };
}

/**
 * Calculate CSEM survey line-km and cost.
 */
export function estimateCSEMCost(config: EMSurveyConfig): { totalLineKm: number; costEstimateUSD: number; vesselDays: number } {
  const areaSide_m = Math.sqrt(config.surveyArea_sqkm) * 1000;
  const nLines = Math.ceil(areaSide_m / config.lineSpacing_m) + 1;
  const totalLineKm = (nLines * areaSide_m) / 1000;
  const vesselDailyProdKm = 15; // CSEM towing speed ~1.5 kts = ~30 km/day, ~15 effective
  const vesselDays = Math.ceil(totalLineKm / vesselDailyProdKm);
  const dailyRate = 85000; // CSEM vessel day rate
  const costEstimate = vesselDays * dailyRate + 500000; // + processing
  return { totalLineKm, costEstimateUSD: Math.round(costEstimate), vesselDays };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GEOCHEMICAL SURVEY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate geochemical anomaly threshold.
 * Threshold = background + 2σ (95th percentile)
 */
export function calculateGeochemAnomalyThreshold(
  background_ppm: number,
  stdDev_ppm: number,
  confidenceLevel: 1 | 2 | 3 = 2
): { threshold_ppm: number; microSeepThreshold: number; macroSeepThreshold: number } {
  const z = confidenceLevel;
  const threshold = background_ppm + z * stdDev_ppm;
  return {
    threshold_ppm: threshold,
    microSeepThreshold: threshold,
    macroSeepThreshold: threshold * 3,
  };
}

/**
 * Classify a geochemical sample measurement.
 */
export function classifyGeochemSample(
  concentration_ppm: number,
  background_ppm: number,
  stdDev_ppm: number
): 'background' | 'micro_seep' | 'macro_seep' {
  const { microSeepThreshold, macroSeepThreshold } = calculateGeochemAnomalyThreshold(background_ppm, stdDev_ppm);
  if (concentration_ppm > macroSeepThreshold) return 'macro_seep';
  if (concentration_ppm > microSeepThreshold) return 'micro_seep';
  return 'background';
}

/**
 * Generate synthetic geochemical survey data over a grid.
 */
export function generateGeochemGrid(
  config: GeochemConfig,
  nPointsPerSide: number = 10
): { x_km: number; y_km: number; C1_ppm: number; C2_ppm: number; C3_ppm: number; classification: 'background' | 'micro_seep' | 'macro_seep' }[] {
  const sideKm = Math.sqrt(config.surveyArea_sqkm);
  const stepKm = sideKm / (nPointsPerSide - 1);
  const points: { x_km: number; y_km: number; C1_ppm: number; C2_ppm: number; C3_ppm: number; classification: 'background' | 'micro_seep' | 'macro_seep' }[] = [];

  // Leak point at center (simulated hydrocarbon seepage)
  const leakX = sideKm / 2, leakY = sideKm / 2;

  for (let i = 0; i < nPointsPerSide; i++) {
    for (let j = 0; j < nPointsPerSide; j++) {
      const x = i * stepKm;
      const y = j * stepKm;
      const distFromLeak = Math.sqrt((x - leakX) ** 2 + (y - leakY) ** 2);
      // Gaussian plume model
      const plumeFactor = Math.exp(-distFromLeak * distFromLeak / (2 * (sideKm * 0.15) ** 2));
      const noise = (Math.random() - 0.5) * 0.4;
      const C1_ppm = config.backgroundC1_ppm * (1 + plumeFactor * 15 + noise);
      const C2_ppm = config.backgroundC1_ppm * 0.12 * (1 + plumeFactor * 25 + noise * 1.5);
      const C3_ppm = config.backgroundC1_ppm * 0.05 * (1 + plumeFactor * 30 + noise * 2);
      const classification = classifyGeochemSample(C1_ppm, config.backgroundC1_ppm, config.backgroundC1_ppm * 0.3);

      points.push({ x_km: x, y_km: y, C1_ppm, C2_ppm, C3_ppm, classification });
    }
  }
  return points;
}

/**
 * Calculate geochem survey cost.
 */
export function estimateGeochemCost(config: GeochemConfig): { nSamples: number; costEstimateUSD: number } {
  const sideM = Math.sqrt(config.surveyArea_sqkm) * 1000;
  const nPerSide = Math.floor(sideM / config.gridSpacing_m) + 1;
  const nSamples = nPerSide * nPerSide;
  const costPerSample = config.labMethod === 'headspace' ? 85 : config.labMethod === 'adsorbed' ? 150 : 250;
  const fieldCost = nSamples * 45;
  const labCost = nSamples * costPerSample;
  return { nSamples, costEstimateUSD: Math.round(fieldCost + labCost + 50000) };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENERAL — SURVEY COST & TIMELINE COMPARISON
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate cost comparison across survey types for the same area.
 */
export function compareSurveyCosts(
  area_sqkm: number,
  location: LocationType
): { surveyType: string; costLowUSD: number; costHighUSD: number; typicalDurationDays: number }[] {
  return [
    { surveyType: '2D Seismic', costLowUSD: Math.round(area_sqkm * 3000), costHighUSD: Math.round(area_sqkm * 15000), typicalDurationDays: Math.ceil(area_sqkm * 0.4 + 45) },
    { surveyType: '3D Seismic', costLowUSD: Math.round(area_sqkm * 25000), costHighUSD: Math.round(area_sqkm * 120000), typicalDurationDays: Math.ceil(area_sqkm * 1.2 + 60) },
    { surveyType: 'Gravity (Ground)', costLowUSD: Math.round(area_sqkm * 200), costHighUSD: Math.round(area_sqkm * 1500), typicalDurationDays: Math.ceil(area_sqkm * 0.5 + 14) },
    { surveyType: 'Gravity (Airborne)', costLowUSD: Math.round(area_sqkm * 15), costHighUSD: Math.round(area_sqkm * 80), typicalDurationDays: Math.ceil(area_sqkm * 0.05 + 7) },
    { surveyType: 'Magnetic (Airborne)', costLowUSD: Math.round(area_sqkm * 8), costHighUSD: Math.round(area_sqkm * 50), typicalDurationDays: Math.ceil(area_sqkm * 0.04 + 7) },
    { surveyType: 'CSEM', costLowUSD: Math.round(area_sqkm * 800), costHighUSD: Math.round(area_sqkm * 5000), typicalDurationDays: Math.ceil(area_sqkm * 0.3 + 30) },
    { surveyType: 'MT', costLowUSD: Math.round(area_sqkm * 400), costHighUSD: Math.round(area_sqkm * 2500), typicalDurationDays: Math.ceil(area_sqkm * 0.2 + 21) },
    { surveyType: 'Geochemical', costLowUSD: Math.round(area_sqkm * 500), costHighUSD: Math.round(area_sqkm * 4000), typicalDurationDays: Math.ceil(area_sqkm * 0.4 + 21) },
  ];
}

/**
 * Crew and equipment fleet breakdown for each survey type.
 */
export function getEquipmentFleet(surveyType: SurveyType): { name: string; count: number; unitCostUSD: number }[] {
  switch (surveyType) {
    case 'seismic_3d':
      return [
        { name: 'Recording Truck', count: 1, unitCostUSD: 350000 },
        { name: 'Vibrator Trucks', count: 4, unitCostUSD: 800000 },
        { name: 'Geophone Strings (12-ch)', count: 2000, unitCostUSD: 250 },
        { name: 'Cable Reels', count: 120, unitCostUSD: 3000 },
        { name: 'Survey GPS Stations', count: 8, unitCostUSD: 15000 },
        { name: 'Field Support Vehicles', count: 12, unitCostUSD: 45000 },
      ];
    case 'seismic_2d':
      return [
        { name: 'Recording Truck', count: 1, unitCostUSD: 280000 },
        { name: 'Shot Hole Drill Rig', count: 2, unitCostUSD: 500000 },
        { name: 'Geophone Strings', count: 480, unitCostUSD: 250 },
        { name: 'Explosive Magazine Trailer', count: 1, unitCostUSD: 12000 },
        { name: 'Survey Crew Sets', count: 4, unitCostUSD: 8000 },
        { name: 'Support Vehicles', count: 8, unitCostUSD: 45000 },
      ];
    case 'gravity':
      return [
        { name: 'Gravimeter (CG-5/CG-6)', count: 2, unitCostUSD: 85000 },
        { name: 'DGPS Base Station', count: 1, unitCostUSD: 25000 },
        { name: 'Field Vehicles', count: 3, unitCostUSD: 45000 },
        { name: 'Laptops + Software', count: 3, unitCostUSD: 5000 },
      ];
    case 'magnetic':
      return [
        { name: 'Cesium Magnetometer', count: 2, unitCostUSD: 35000 },
        { name: 'Aircraft (Cessna/Britten-Norman)', count: 1, unitCostUSD: 1200000 },
        { name: 'Base Station Mag', count: 1, unitCostUSD: 25000 },
        { name: 'Radar Altimeter', count: 1, unitCostUSD: 18000 },
        { name: 'Data Acquisition System', count: 1, unitCostUSD: 45000 },
      ];
    case 'em_csem':
      return [
        { name: 'Source Vessel (CSEM)', count: 1, unitCostUSD: 35000000 },
        { name: 'Source Dipole (300m)', count: 1, unitCostUSD: 2500000 },
        { name: 'Receiver Nodes (OBS)', count: 60, unitCostUSD: 120000 },
        { name: 'ROV Deployment', count: 1, unitCostUSD: 5000000 },
        { name: 'Navigation System', count: 1, unitCostUSD: 350000 },
      ];
    case 'em_mt':
      return [
        { name: 'MT Recording Systems', count: 8, unitCostUSD: 75000 },
        { name: 'E-field Electrodes', count: 40, unitCostUSD: 800 },
        { name: 'H-field Coils', count: 24, unitCostUSD: 6000 },
        { name: 'Field Vehicles', count: 4, unitCostUSD: 45000 },
        { name: 'Solar Charging Kits', count: 8, unitCostUSD: 1500 },
      ];
    case 'geochemical':
      return [
        { name: 'Soil Gas Probes', count: 20, unitCostUSD: 450 },
        { name: 'Vacuum Sampling Pump', count: 5, unitCostUSD: 3500 },
        { name: 'GC Analyzer (Field)', count: 1, unitCostUSD: 75000 },
        { name: 'Sample Vials', count: 2000, unitCostUSD: 2 },
        { name: 'Field Vehicles', count: 3, unitCostUSD: 45000 },
        { name: 'GPS Handhelds', count: 5, unitCostUSD: 3000 },
      ];
    default:
      return [];
  }
}

/**
 * Generate synthetic 2D seismic line geometry for SVG visualization.
 */
export function generateShotRecGeometry(
  nShots: number,
  shotSpacing_m: number,
  nReceivers: number,
  recSpacing_m: number
): { shots: { x: number; y: number }[]; receivers: { x: number; y: number }[]; midpoints: { x: number; y: number }[] } {
  const shots: { x: number; y: number }[] = [];
  const receivers: { x: number; y: number }[] = [];
  const midpoints: { x: number; y: number }[] = [];

  for (let s = 0; s < nShots; s++) {
    const sx = s * shotSpacing_m;
    shots.push({ x: sx, y: 100 });
    for (let r = 0; r < nReceivers; r++) {
      const rx = sx + r * recSpacing_m;
      if (s === 0) receivers.push({ x: rx, y: 0 });
      midpoints.push({ x: (sx + rx) / 2, y: 50 });
    }
  }
  return { shots, receivers, midpoints };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFERENCE PAPERS
// ═══════════════════════════════════════════════════════════════════════════════

export interface GeophysicsPaper {
  title: string;
  authors: string;
  year: number;
  journal: string;
  description: string;
  keyConcept: string;
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
  category: 'seismic' | 'gravity' | 'magnetic' | 'em' | 'geochem' | 'survey_design';
}

export const GEOPHYSICS_PAPERS: GeophysicsPaper[] = [
  { title: 'Seismic Data Analysis: Processing, Inversion, and Interpretation', authors: 'Yilmaz, Ö.', year: 2001, journal: 'SEG Investigations in Geophysics No. 10', description: 'Comprehensive reference on seismic acquisition, processing, and interpretation workflows — industry standard.', keyConcept: 'Seismic processing & imaging', difficulty: 'Intermediate', category: 'seismic' },
  { title: 'Exploration Seismology', authors: 'Sheriff, R.E., Geldart, L.P.', year: 1995, journal: 'Cambridge University Press', description: 'Classic textbook covering seismic theory, acquisition, and interpretation from first principles.', keyConcept: 'Seismic wave propagation & acquisition', difficulty: 'Basic', category: 'seismic' },
  { title: 'Planning Land 3-D Seismic Surveys', authors: 'Cordsen, A., Galbraith, M., Peirce, J.', year: 2000, journal: 'SEG Geophysical Developments No. 9', description: 'Definitive guide to 3D seismic survey design: geometry, fold, binning, and acquisition economics.', keyConcept: '3D survey design parameters', difficulty: 'Advanced', category: 'survey_design' },
  { title: '75th Anniversary: Historical development of the gravity method in exploration', authors: 'Nabighian, M.N., et al.', year: 2005, journal: 'Geophysics', description: 'Comprehensive review of gravity methods — instrumentation, corrections, interpretation for oil & mineral exploration.', keyConcept: 'Gravity survey methodology', difficulty: 'Intermediate', category: 'gravity' },
  { title: '75th Anniversary: Historical development of the magnetic method in exploration', authors: 'Nabighian, M.N., et al.', year: 2005, journal: 'Geophysics', description: 'Review of magnetic exploration — from compass surveys to modern aeromagnetic gradiometry.', keyConcept: 'Magnetic survey & RTP processing', difficulty: 'Intermediate', category: 'magnetic' },
  { title: 'Ten years of marine CSEM for hydrocarbon exploration', authors: 'Constable, S.', year: 2010, journal: 'Geophysics', description: 'Reviews 10 years of CSEM application: principles, case studies, integration with seismic.', keyConcept: 'CSEM response to resistive layers', difficulty: 'Advanced', category: 'em' },
  { title: 'The Magnetotelluric Method: Theory and Practice', authors: 'Chave, A.D., Jones, A.G.', year: 2012, journal: 'Cambridge University Press', description: 'Complete reference on MT theory, data acquisition, processing, and inversion for deep Earth imaging.', keyConcept: 'MT for deep crustal imaging', difficulty: 'Advanced', category: 'em' },
  { title: 'Surface Geochemical Exploration for Petroleum', authors: 'Schumacher, D.', year: 2004, journal: 'AAPG Treatise of Petroleum Geology', description: 'Comprehensive guide to soil gas sampling, analysis, and interpretation of hydrocarbon microseepage.', keyConcept: 'Geochemical seep detection', difficulty: 'Basic', category: 'geochem' },
  { title: 'Acquisition Geometry Analysis for 3D Surveys', authors: 'Vermeer, G.J.O.', year: 2002, journal: 'SEG Books', description: 'Wavefield sampling theory applied to 3D acquisition — noise suppression and resolution optimization.', keyConcept: 'Acquisition footprint & noise analysis', difficulty: 'Advanced', category: 'survey_design' },
  { title: 'Interpreting Hydrocarbon Microseepage From Surface Geochemistry', authors: 'Klusman, R.W.', year: 2011, journal: 'AAPG Bulletin', description: 'Statistical methods for distinguishing true hydrocarbon microseepage from background noise in soil gas surveys.', keyConcept: 'Microseepage anomaly detection', difficulty: 'Intermediate', category: 'geochem' },
  { title: 'Gravity and Magnetic Exploration: Principles, Practices, and Applications', authors: 'Hinze, W.J., von Frese, R.R.B., Saad, A.H.', year: 2013, journal: 'Cambridge University Press', description: 'Modern integrated approach to potential-field geophysics for basin analysis.', keyConcept: 'Integrated gravity & magnetic interpretation', difficulty: 'Intermediate', category: 'gravity' },
  { title: 'Airborne Electromagnetic Methods for Hydrocarbon Exploration', authors: 'Smith, R.S.', year: 2014, journal: 'Interpretation', description: 'Review of AEM applications, resolution analysis, and integration with seismic for shallow gas and permafrost mapping.', keyConcept: 'AEM for shallow hazards', difficulty: 'Intermediate', category: 'em' },
];

/**
 * Estimate source depth from surface geochemical anomalies using
 * empirical diffusion models (Klusman 2011; Schumacher 2004).
 *
 * Derives approximate depth of hydrocarbon accumulation based on
 * surface C₁ concentration relative to background and the known
 * seepage rate constants for the dominant migration mechanism.
 *
 * @param surfaceC1_ppm   - Measured C₁ at surface (ppm)
 * @param backgroundC1_ppm - Regional background C₁ (ppm)
 * @param seepageType     - 'diffusion' | 'micro_seep' | 'macro_seep'  
 * @returns Estimated source depth in meters (100–10,000 m range)
 */
export function estimateSourceDepth(
  surfaceC1_ppm: number,
  backgroundC1_ppm: number,
  seepageType: 'diffusion' | 'micro_seep' | 'macro_seep' = 'diffusion'
): number {
  const anomalyRatio = surfaceC1_ppm / Math.max(backgroundC1_ppm, 1);
  const rateConstants: Record<string, number> = {
    diffusion: 0.00015,  // m⁻¹ — slow molecular diffusion
    micro_seep: 0.0006,  // m⁻¹ — micro-fracture assisted  
    macro_seep: 0.0025,  // m⁻¹ — fault/fracture conduit flow
  };
  const k = rateConstants[seepageType] ?? rateConstants.diffusion;
  const depth = Math.max(100, Math.min(10000, -Math.log(Math.max(anomalyRatio - 1, 0.01)) / k));
  return Math.round(depth / 50) * 50; // round to nearest 50 m
}
