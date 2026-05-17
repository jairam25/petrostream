/**
 * Seismic Interpretation & Prospect Generation Library
 * PetroStream — Industry-standard equations for horizon interpretation,
 * fault analysis, depth conversion, volumetric estimation, prospect evaluation
 */

// ============================================================================
//  TYPES
// ============================================================================

export interface HorizonPick {
  x: number;        // inline/crossline index or UTM X
  y: number;        // UTM Y
  twt: number;      // Two-way time (seconds)
  confidence: number; // 0-1
}

export interface FaultPlane {
  name: string;
  strike: number;     // degrees
  dip: number;        // degrees
  throwVertical: number; // m
  sealPotential: number; // 0-1
  xCenter: number;
  yCenter: number;
}

export interface TrapConfig {
  type: 'anticline' | 'fault_block' | 'salt_dome' | 'pinchout' | 'unconformity' | 'reef' | 'channel';
  closureHeight: number;    // m
  spillPointDepth: number;  // m TVDSS
  areaClosure: number;      // km²
  columnHeight: number;     // m
}

export interface DHIFlag {
  type: 'bright_spot' | 'flat_spot' | 'dim_spot' | 'polarity_reversal';
  x: number;
  y: number;
  twt: number;
  confidence: number; // 0-1
}

export interface VolumetricDistribution {
  name: string;
  min: number;
  mode: number;
  max: number;
  distribution: 'triangular' | 'lognormal' | 'normal';
}

export interface ProspectEvaluation {
  name: string;
  grv: number;          // Gross Rock Volume (MM m³)
  ntg: number;          // Net-to-Gross (0-1)
  porosity: number;     // fraction
  sw: number;           // Water saturation fraction
  bo: number;           // FVF (bbl/stb)
  rf: number;           // Recovery Factor (0-1)
  stoiip: number;       // MMSTB
  recoverable: number;  // MMSTB
  cos: number;          // Chance of Success (0-1)
  emv: number;          // Expected Monetary Value (M$)
  rank: number;         // Portfolio rank
}

// ============================================================================
//  1. TIME-TO-DEPTH CONVERSION
// ============================================================================

/**
 * Convert two-way travel time to depth.
 * z = V_int × t / 2
 * 
 * @param twt      - Two-way travel time (seconds)
 * @param velocity - Interval velocity (m/s)
 * @returns Depth (meters)
 */
export function timeToDepth(twt: number, velocity: number): number {
  return (velocity * twt) / 2;
}

/**
 * Depth convert a grid of TWT picks using a velocity model.
 * @param picks   - Array of horizon picks with TWT
 * @param v0      - Surface velocity (m/s)
 * @param k       - Velocity gradient (1/s)
 * @returns Array of picks with depth added
 */
export function depthConvertGrid(
  picks: HorizonPick[],
  v0: number,
  k: number
): (HorizonPick & { depth: number })[] {
  return picks.map(p => {
    // V(z) = V₀ + k*z, iterative solution:
    // z = V_int * t/2 = (V₀ + k*z) * t/2
    // z = V₀ * t/2 + k * z * t/2
    // z * (1 - k*t/2) = V₀ * t/2
    // z = (V₀ * t/2) / (1 - k*t/2)
    const denom = 1 - (k * p.twt) / 2;
    let depth: number;
    if (Math.abs(denom) < 1e-6) {
      // Fallback: use average velocity
      const vAvg = v0 + (k * 1000) / 2;
      depth = (vAvg * p.twt) / 2;
    } else {
      depth = (v0 * p.twt / 2) / denom;
    }
    return { ...p, depth };
  });
}

/**
 * Calculate layer thickness (isochore/isopach) from top & base TWT.
 * Δz = V_interval × (TWT_base - TWT_top) / 2
 * 
 * @param twtTop       - TWT at top of layer (seconds)
 * @param twtBase      - TWT at base of layer (seconds)
 * @param vInterval    - Interval velocity of the layer (m/s)
 * @returns Thickness (meters)
 */
export function calculateIsochore(
  twtTop: number,
  twtBase: number,
  vInterval: number
): number {
  return vInterval * (twtBase - twtTop) / 2;
}

/**
 * Convert a full grid of TWT picks to a thickness grid.
 */
export function calculateThicknessGrid(
  topPicks: HorizonPick[],
  basePicks: HorizonPick[],
  vInterval: number
): { x: number; y: number; thickness: number }[] {
  // Assume picks are paired by index or nearest neighbor
  return topPicks.map((top, i) => {
    const base = basePicks[i] || basePicks[basePicks.length - 1];
    return {
      x: top.x,
      y: top.y,
      thickness: calculateIsochore(top.twt, base.twt, vInterval)
    };
  });
}

// ============================================================================
//  2. FAULT ANALYSIS
// ============================================================================

/**
 * Calculate throw from fault displacement.
 * Vertical throw = |depth_top_hangingwall - depth_top_footwall|
 * 
 * @param hwDepth - Hanging wall depth of horizon
 * @param fwDepth - Foot wall depth of horizon
 * @returns Vertical throw (meters)
 */
export function calculateThrow(hwDepth: number, fwDepth: number): number {
  return Math.abs(hwDepth - fwDepth);
}

/**
 * Calculate fault seal potential (Allan diagram principle).
 * Simplified: compares juxtaposition lithology
 * 
 * @param hwLithology - Hanging wall lithology (shale=0, sand=1)
 * @param fwLithology - Foot wall lithology
 * @param SmearFactor - Shale Smear Factor (SSF) = throw / shale_thickness
 * @returns Seal potential (0-1, 1 = perfect seal)
 */
export function calculateFaultSealPotential(
  hwLithology: number,
  fwLithology: number,
  smearFactor: number
): number {
  // If sand juxtaposed against sand, poor seal
  const juxtapositionScore = 1 - Math.abs(hwLithology - fwLithology);

  // Smear factor contribution (SSF < 4 typically sealing)
  const smearScore = Math.max(0, 1 - smearFactor / 7);

  return juxtapositionScore * 0.5 + smearScore * 0.5;
}

// ============================================================================
//  3. TRAP ANALYSIS
// ============================================================================

/**
 * Calculate trap closure area (simplified dome model).
 * Assumes elliptical closure; area = π × a × b
 * 
 * @param closureHeight - Vertical closure (m)
 * @param structuralDip - Average dip angle (degrees)
 * @param aspectRatio   - Closure aspect ratio (1 = circular)
 * @returns Closure area in km²
 */
export function calculateTrapClosureArea(
  closureHeight: number,
  structuralDip: number,
  aspectRatio: number = 1
): number {
  const dipRad = (structuralDip * Math.PI) / 180;
  // Radius = closure / tan(dip)
  const r = closureHeight / Math.tan(dipRad);
  // Elliptical area
  const areaM2 = Math.PI * r * r * aspectRatio;
  return areaM2 / 1e6; // convert to km²
}

/**
 * Calculate maximum hydrocarbon column height from buoyancy pressure & seal capacity.
 * H_max = (P_entry - P_displacement) / (g × Δρ)
 * 
 * @param entryPressure      - Capillary entry pressure of seal (Pa)
 * @param displacementPressure - Displacement pressure difference (Pa)
 * @param densityDiff        - Density difference water-HC (kg/m³)
 * @param g                  - Gravitational acceleration (m/s²)
 * @returns Max column height (meters)
 */
export function maxColumnHeight(
  entryPressure: number,
  displacementPressure: number,
  densityDiff: number,
  g: number = 9.81
): number {
  return (entryPressure - displacementPressure) / (g * densityDiff);
}

/**
 * Spill point analysis: determine fill level relative to closure.
 */
export function calculateFillLevel(
  contactDepth: number,
  crestDepth: number,
  spillPointDepth: number
): { fillFraction: number; status: 'underfilled' | 'fill-to-spill' | 'overfilled' } {
  const closureHeight = spillPointDepth - crestDepth;
  const columnHeight = contactDepth - crestDepth;
  const fillFraction = Math.min(1, Math.max(0, columnHeight / closureHeight));

  let status: 'underfilled' | 'fill-to-spill' | 'overfilled' = 'underfilled';
  if (fillFraction >= 0.95 && fillFraction <= 1.05) status = 'fill-to-spill';
  if (fillFraction > 1.05) status = 'overfilled';

  return { fillFraction, status };
}

// ============================================================================
//  4. SEISMIC ATTRIBUTES
// ============================================================================

/**
 * Calculate coherence (semblance-based) from 3D amplitude volume.
 * Simplified: cross-correlation in 3×3 inline/crossline window.
 * 
 * @param amplitudes - 3×3 grid of amplitude values
 * @returns Coherence [0, 1]
 */
export function calculateCoherence(amplitudes: number[][]): number {
  const n = amplitudes.length * amplitudes[0].length;
  let sumA = 0, sumA2 = 0;
  
  const flat = amplitudes.flat();
  for (const a of flat) {
    sumA += a;
    sumA2 += a * a;
  }

  const mean = sumA / n;
  const variance = sumA2 / n - mean * mean;

  if (variance === 0) return 1; // perfectly coherent
  return 1 / (1 + variance); // simplified coherence measure
}

/**
 * Spectral decomposition using simplified Short-Time Fourier Transform (STFT).
 * Computes amplitude at a target frequency for a sliding window.
 * 
 * @param trace       - Seismic trace (1D amplitude array)
 * @param dt          - Sample interval (s)
 * @param windowSize  - Window size in samples
 * @param frequencies - Target frequencies (Hz) to decompose
 * @returns 2D array: [frequencyIndex][timeIndex]
 */
export function spectralDecomposition(
  trace: number[],
  dt: number,
  windowSize: number,
  frequencies: number[]
): number[][] {
  const n = trace.length;
  const nFreq = frequencies.length;
  const nTime = n - windowSize;
  const result: number[][] = [];

  for (let fi = 0; fi < nFreq; fi++) {
    const f = frequencies[fi];
    const row: number[] = [];
    const omega = 2 * Math.PI * f;

    for (let i = 0; i < nTime; i++) {
      let realSum = 0, imagSum = 0;
      for (let w = 0; w < windowSize; w++) {
        const t = (i + w) * dt;
        realSum += trace[i + w] * Math.cos(omega * t);
        imagSum += trace[i + w] * Math.sin(omega * t);
      }
      row.push(Math.sqrt(realSum * realSum + imagSum * imagSum) / windowSize);
    }
    result.push(row);
  }

  return result;
}

/**
 * Detect Direct Hydrocarbon Indicators from amplitude anomalies.
 */
export function detectDHIs(
  amplitudes: { x: number; y: number; twt: number; amplitude: number }[],
  thresholdBright: number = 0.7,
  thresholdDim: number = 0.1
): DHIFlag[] {
  const flags: DHIFlag[] = [];
  const maxAmp = Math.max(...amplitudes.map(a => Math.abs(a.amplitude)), 1);
  
  const normalized = amplitudes.map(a => ({
    ...a,
    normAmp: Math.abs(a.amplitude) / maxAmp
  }));

  // Bright spots: high amplitude relative to background
  const brightSpots = normalized.filter(a => a.normAmp > thresholdBright);
  brightSpots.slice(0, 5).forEach(a => {
    flags.push({
      type: 'bright_spot',
      x: a.x, y: a.y, twt: a.twt,
      confidence: a.normAmp
    });
  });

  // Dim spots: very low amplitude
  const dimSpots = normalized.filter(a => a.normAmp < thresholdDim);
  dimSpots.slice(0, 3).forEach(a => {
    flags.push({
      type: 'dim_spot',
      x: a.x, y: a.y, twt: a.twt,
      confidence: 1 - a.normAmp
    });
  });

  // Flat spot detection: check for horizontal amplitude contrast
  // (simplified: horizontal amplitude gradient)
  for (let i = 0; i < amplitudes.length - 1; i += 10) {
    const grad = amplitudes[i + 1].amplitude - amplitudes[i].amplitude;
    if (Math.abs(grad) > thresholdBright * maxAmp) {
      flags.push({
        type: 'flat_spot',
        x: amplitudes[i].x, y: amplitudes[i].y, twt: amplitudes[i].twt,
        confidence: Math.abs(grad) / maxAmp
      });
      break; // Just one for simulation
    }
  }

  return flags;
}

// ============================================================================
//  5. GROSS ROCK VOLUME (GRV) CALCULATION
// ============================================================================

/**
 * Calculate Gross Rock Volume via trapezoidal rule on a grid.
 * GRV = Σ (cell_area × average_thickness)
 * 
 * @param topDepths     - 2D array of top reservoir depths (m TVDSS)
 * @param baseDepths    - 2D array of base reservoir depths (m TVDSS)
 * @param cellWidth     - Grid cell width (m)
 * @param cellHeight    - Grid cell height (m)
 * @returns GRV in million cubic meters (MM m³)
 */
export function calculateGRV2D(
  topDepths: number[][],
  baseDepths: number[][],
  cellWidth: number,
  cellHeight: number
): number {
  let totalVolume = 0;
  const rows = Math.min(topDepths.length, baseDepths.length);
  const cols = Math.min(topDepths[0]?.length || 0, baseDepths[0]?.length || 0);
  const cellArea = cellWidth * cellHeight;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const thickness = baseDepths[i][j] - topDepths[i][j];
      if (thickness > 0) {
        totalVolume += cellArea * thickness;
      }
    }
  }

  return totalVolume / 1e6; // convert m³ to MM m³
}

/**
 * Simplified GRV from closure area and average thickness.
 * GRV = Area × Avg_Thickness × Net-to-Gross (optional)
 * 
 * @param areaKm2     - Closure area (km²)
 * @param avgThickness - Average pay thickness (m)
 * @param ntg          - Net-to-Gross fraction
 * @returns GRV in million cubic meters (MM m³)
 */
export function estimateGRV(
  areaKm2: number,
  avgThickness: number,
  ntg: number = 1.0
): number {
  // Area in km² × 1e6 m²/km² × thickness in m / 1e6 = MM m³
  return areaKm2 * avgThickness * ntg;
}

// ============================================================================
//  6. VOLUMETRIC CALCULATIONS (STOIIP/GIIP)
// ============================================================================

/**
 * Calculate STOIIP (Stock Tank Oil Initially In Place).
 * STOIIP = 7758 × A × h × φ × (1 - Sw) / Bo  [STB]
 *   or   = GRV × 6.2898 × N/G × φ × (1 - Sw) / Bo  [STB]
 * 
 * @param grv     - Gross Rock Volume (MM m³)
 * @param ntg     - Net-to-Gross (0-1)
 * @param porosity - Porosity fraction
 * @param sw      - Water saturation fraction
 * @param bo      - Formation Volume Factor (bbl/stb)
 * @returns STOIIP in MMSTB
 */
export function calculateSTOIIP(
  grv: number,
  ntg: number,
  porosity: number,
  sw: number,
  bo: number
): number {
  // Convert GRV from MM m³ to STB using conversion factor
  // 1 m³ = 6.28981 bbl
  const grvBBL = grv * 1e6 * 6.28981;
  return (grvBBL * ntg * porosity * (1 - sw)) / bo / 1e6; // MMSTB
}

/**
 * Calculate GIIP (Gas Initially In Place).
 * GIIP = GRV × 6.2898 × N/G × φ × (1 - Sw) / Bg  [MSCF]
 * Bg = 0.00504 × Z × T / P  (approximate)
 */
export function calculateGIIP(
  grv: number,
  ntg: number,
  porosity: number,
  sw: number,
  pressure: number,
  temperature: number,
  zFactor: number = 0.85
): number {
  const bg = 0.00504 * zFactor * (temperature + 460) / pressure;
  const grvBBL = grv * 1e6 * 6.28981;
  return (grvBBL * ntg * porosity * (1 - sw)) / bg / 1e6; // BCF
}

/**
 * Recoverable resources = STOIIP × Recovery Factor
 */
export function calculateRecoverable(stoiip: number, rf: number): number {
  return stoiip * rf;
}

// ============================================================================
//  7. MONTE CARLO VOLUMETRIC SIMULATION
// ============================================================================

/**
 * Sample from a triangular distribution.
 */
export function sampleTriangular(min: number, mode: number, max: number): number {
  const u = Math.random();
  const f = (mode - min) / (max - min);
  if (u < f) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }
}

/**
 * Sample from a lognormal distribution (Box-Muller + exponential).
 */
export function sampleLognormal(mu: number, sigma: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.exp(mu + sigma * z);
}

/**
 * Run Monte Carlo volumetric simulation.
 */
export function runVolumetricMonteCarlo(
  distributions: VolumetricDistribution[],
  bo: number,
  rf: number,
  nIterations: number = 10000
): { stoiip: number[]; recoverable: number[] } {
  const stoiipResults: number[] = [];
  const recResults: number[] = [];

  for (let i = 0; i < nIterations; i++) {
    const samples: number[] = [];
    for (const dist of distributions) {
      let value: number;
      if (dist.distribution === 'triangular') {
        value = sampleTriangular(dist.min, dist.mode, dist.max);
      } else if (dist.distribution === 'lognormal') {
        const mu = Math.log(dist.mode);
        const sigma = Math.log(dist.max / dist.min) / 4;
        value = sampleLognormal(mu, sigma);
      } else {
        // Normal
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        value = dist.mode + z * (dist.max - dist.min) / 4;
      }
      samples.push(Math.max(0, value));
    }

    // Order: [area, thickness, ntg, porosity, sw]
    const [area, thickness, ntg, porosity, sw] = samples;
    const stoiip = calculateSTOIIP(
      estimateGRV(area, thickness, ntg),
      1.0, // NTG already applied in GRV
      porosity,
      sw,
      bo
    );
    stoiipResults.push(stoiip);
    recResults.push(stoiip * rf);
  }

  stoiipResults.sort((a, b) => a - b);
  recResults.sort((a, b) => a - b);
  return { stoiip: stoiipResults, recoverable: recResults };
}

/**
 * Extract P10, P50, P90 from sorted results.
 */
export function getPercentiles(sorted: number[]): { p90: number; p50: number; p10: number; mean: number } {
  const n = sorted.length;
  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  return {
    p90: sorted[Math.floor(n * 0.1)],  // Low estimate
    p50: sorted[Math.floor(n * 0.5)],  // Best estimate
    p10: sorted[Math.floor(n * 0.9)],  // High estimate
    mean,
  };
}

// ============================================================================
//  8. CHANCE OF SUCCESS (COS) & RISK ANALYSIS
// ============================================================================

export interface COSElements {
  source: number;
  reservoir: number;
  trap: number;
  seal: number;
  migration: number;
  timing: number;
}

/**
 * Calculate overall Chance of Success.
 * COS = P(source) × P(reservoir) × P(trap) × P(seal) × P(migration) × P(timing)
 */
export function calculateCOS(elements: COSElements): number {
  return elements.source * elements.reservoir * elements.trap
    * elements.seal * elements.migration * elements.timing;
}

/**
 * Calculate the marginal contribution of each risk element for tornado chart.
 * Returns sensitivity: % change in COS when each element is varied ±20%
 */
export function calculateCOSSensitivity(elements: COSElements): { element: string; lowCOS: number; highCOS: number }[] {
  const base = calculateCOS(elements);
  const keys = Object.keys(elements) as (keyof COSElements)[];
  const labels: Record<keyof COSElements, string> = {
    source: 'Source Rock',
    reservoir: 'Reservoir',
    trap: 'Trap',
    seal: 'Seal',
    migration: 'Migration',
    timing: 'Timing',
  };

  return keys.map(key => {
    const lowVals = { ...elements, [key]: Math.max(0.05, elements[key] * 0.8) };
    const highVals = { ...elements, [key]: Math.min(0.99, elements[key] * 1.2) };
    return {
      element: labels[key],
      lowCOS: calculateCOS(lowVals),
      highCOS: calculateCOS(highVals),
    };
  }).sort((a, b) => (b.highCOS - b.lowCOS) - (a.highCOS - a.lowCOS));
}

// ============================================================================
//  9. ECONOMICS & PROSPECT RANKING
// ============================================================================

/**
 * Calculate Expected Monetary Value (EMV).
 * EMV = COS × NPV_success - (1 - COS) × DHC
 * 
 * where DHC = Dry Hole Cost (exploration well cost)
 * 
 * @param cos            - Chance of Success (0-1)
 * @param npvSuccess     - NPV of success (M$)
 * @param dryHoleCost    - Dry Hole Cost (M$)
 * @returns EMV in M$
 */
export function calculateEMV(
  cos: number,
  npvSuccess: number,
  dryHoleCost: number
): number {
  return cos * npvSuccess - (1 - cos) * dryHoleCost;
}

/**
 * Estimate NPV from recoverable resources.
 * Simplified: NPV = Revenue - CAPEX - OPEX
 * Revenue = Recoverable × OilPrice × DiscountFactor
 * 
 * @param recoverableMMSTB - Recoverable oil (MMSTB)
 * @param oilPrice         - Oil price ($/bbl)
 * @param developmentCost  - Development CAPEX (M$)
 * @param opexPerBBL       - OPEX ($/bbl)
 * @param discountRate     - Annual discount rate
 * @param years            - Production period (years)
 * @returns NPV in M$
 */
export function estimateNPV(
  recoverableMMSTB: number,
  oilPrice: number,
  developmentCost: number,
  opexPerBBL: number,
  discountRate: number,
  years: number
): number {
  const annualProd = recoverableMMSTB / years;
  let pvRevenue = 0;

  for (let y = 1; y <= years; y++) {
    const rev = annualProd * (oilPrice - opexPerBBL);
    pvRevenue += rev / Math.pow(1 + discountRate, y);
  }

  return pvRevenue * 1e6 - developmentCost * 1e3; // M$
}

/**
 * Multi-criteria prospect ranking.
 * Ranks prospects by risked resources, EMV, risk/reward ratio.
 * 
 * @param prospects - Array of prospects to rank
 * @returns Ranked prospects with scores
 */
export function rankProspects(prospects: ProspectEvaluation[]): ProspectEvaluation[] {
  // Normalize each metric to 0-1
  const maxRecoverable = Math.max(...prospects.map(p => p.recoverable), 1);
  const maxEMV = Math.max(...prospects.map(p => Math.max(Math.abs(p.emv), 1)), 1);

  const scored = prospects.map(p => {
    // Composite score: 40% risked volume + 40% EMV + 20% COS
    const riskedScore = (p.recoverable * p.cos) / (maxRecoverable + 1);
    const emvScore = (Math.max(0, p.emv)) / (maxEMV + 1);
    const cosScore = p.cos;

    const compositeScore = 0.4 * riskedScore + 0.4 * emvScore + 0.2 * cosScore;
    return { ...p, rank: compositeScore };
  });

  return scored.sort((a, b) => b.rank - a.rank).map((p, i) => ({ ...p, rank: i + 1 }));
}

// ============================================================================
//  10. WELL ANTI-COLLISION (Interpretation & Planning)
// ============================================================================

/**
 * Calculate minimum distance between two well trajectories in 3D.
 * Uses closest approach between survey stations.
 * 
 * @param trajectoryA - Array of {x, y, z} for well A
 * @param trajectoryB - Array of {x, y, z} for well B
 * @returns Minimum separation distance (meters) and the stations
 */
export function calculateClosestApproach(
  trajectoryA: { x: number; y: number; z: number }[],
  trajectoryB: { x: number; y: number; z: number }[]
): { minDistance: number; stationA: number; stationB: number } {
  let minDist = Infinity;
  let minSA = 0, minSB = 0;

  for (let i = 0; i < trajectoryA.length; i++) {
    for (let j = 0; j < trajectoryB.length; j++) {
      const dx = trajectoryA[i].x - trajectoryB[j].x;
      const dy = trajectoryA[i].y - trajectoryB[j].y;
      const dz = trajectoryA[i].z - trajectoryB[j].z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < minDist) {
        minDist = dist;
        minSA = i;
        minSB = j;
      }
    }
  }

  return { minDistance: minDist, stationA: minSA, stationB: minSB };
}

/**
 * Calculate separation factor for anti-collision.
 * SF = Center-to-Center Distance / (R1 + R2)
 * where R1, R2 are the ellipse radii at closest approach
 * 
 * SF > 1.5 is typically safe
 */
export function calculateSeparationFactor(
  centerDistance: number,
  radiusA: number,
  radiusB: number
): number {
  return centerDistance / (radiusA + radiusB);
}

// ============================================================================
//  11. TRAP CLASSIFICATION & MODEL GENERATION
// ============================================================================

/**
 * Generate synthetic structure map for a given trap type.
 */
export function generateTrapStructure(
  trapType: TrapConfig['type'],
  gridSize: number = 50
): { x: number; y: number; depth: number }[] {
  const points: { x: number; y: number; depth: number }[] = [];
  const center = gridSize / 2;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const dx = i - center;
      const dy = j - center;
      const r = Math.sqrt(dx * dx + dy * dy);
      const rNorm = r / center;

      let depth = center;
      switch (trapType) {
        case 'anticline':
          // Dome-shaped: shallower at center
          depth = center - center * Math.cos(rNorm * Math.PI) * 0.5;
          break;
        case 'fault_block':
          // Asymmetric: faulted on one side (left)
          depth = center - center * Math.exp(-rNorm * 1.5) * 0.5;
          if (i < center * 0.3) depth = center + r * 0.3;
          break;
        case 'salt_dome':
          // Steep dome with flank dips
          depth = center - center * Math.exp(-rNorm * rNorm * 4) * 0.7;
          break;
        case 'pinchout':
          // Wedge shape: thinning to the right
          depth = center - (1 - i / gridSize) * center * 0.6;
          break;
        case 'unconformity':
          // Truncation at angle
          depth = center - center * Math.cos(rNorm * Math.PI) * 0.4;
          if (j < gridSize * 0.4) depth += (j / gridSize) * center * 0.3;
          break;
        case 'reef':
          // Steep-sided buildup
          depth = center - center * (1 / (1 + Math.exp((rNorm - 0.4) * 10))) * 0.6;
          break;
        case 'channel':
          // Linear feature
          depth = center - center * Math.exp(-(dy * dy) / (center * center * 0.04)) * 0.5;
          break;
      }
      points.push({ x: i, y: j, depth });
    }
  }

  return points;
}