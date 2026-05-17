/**
 * Seismic Data Processing Calculation Library
 * PetroStream — Industrial-grade equations for seismic processing workflow
 * 
 * Covers: NMO correction, velocity analysis, statics, deconvolution,
 * CMP stacking, DMO, migration, AVO analysis, inversion, cost modeling
 */

// ============================================================================
//  UTILITY TYPES & HELPERS
// ============================================================================

export interface VelocityLayer {
  depth: number;   // m
  vInterval: number; // m/s
  vRMS?: number;
}

export interface SeismicTrace {
  offset: number;    // m
  samples: number[]; // amplitude values
  dt: number;        // sample interval (seconds)
  cmpX?: number;
  cmpY?: number;
  sourceX?: number;
  sourceY?: number;
}

export interface CMPGather {
  cmpId: number;
  traces: SeismicTrace[];
}

export interface ProcessingFlowStep {
  name: string;
  enabled: boolean;
  costPerSqKm: number; // USD
  hoursPerGB: number;  // processing hours per GB of input data
}

export interface AVOResult {
  intercept: number;    // A (zero-offset reflectivity)
  gradient: number;     // B (AVO gradient)
  rSquared: number;     // fit quality
  class: AVOClass;
  fluidHint: string;
}

export type AVOClass = 'I' | 'II' | 'IIp' | 'III' | 'IV';

export interface SemblancePoint {
  t0: number;    // zero-offset time (s)
  vStack: number; // stacking velocity (m/s)
  semblance: number; // 0-1
}

// ============================================================================
//  1. NORMAL MOVEOUT (NMO) CORRECTION
// ============================================================================

/**
 * Calculate NMO correction (delta T) for a given offset and zero-offset time.
 * ΔT_NMO = t(x) - t₀ ≈ x² / (2 V²_rms t₀)
 * 
 * @param t0   - Zero-offset two-way travel time (seconds)
 * @param x    - Source-receiver offset (meters)
 * @param vrms - RMS velocity at t0 (m/s)
 * @returns NMO correction in seconds
 */
export function calculateNMOCorrection(t0: number, x: number, vrms: number): number {
  if (t0 <= 0 || vrms <= 0) return 0;
  // Full hyperbolic: t(x) = sqrt(t0² + x²/vrms²), NMO = t(x) - t0
  return Math.sqrt(t0 * t0 + (x * x) / (vrms * vrms)) - t0;
}

/**
 * Apply NMO correction to a trace — flattens the hyperbola.
 * Returns the trace with time shifts applied.
 */
export function applyNMOToTrace(
  trace: SeismicTrace,
  t0Values: number[],
  vrmsValues: number[]
): number[] {
  const n = trace.samples.length;
  const corrected = new Array(n).fill(0);
  const dt = trace.dt;

  for (let i = 0; i < n; i++) {
    const t = i * dt;
    // Find nearest t0/vrms pair
    let vrms = vrmsValues[vrmsValues.length - 1];
    for (let j = 0; j < t0Values.length - 1; j++) {
      if (t >= t0Values[j] && t < t0Values[j + 1]) {
        const frac = (t - t0Values[j]) / (t0Values[j + 1] - t0Values[j]);
        vrms = vrmsValues[j] + frac * (vrmsValues[j + 1] - vrmsValues[j]);
        break;
      }
    }

    const deltaT = calculateNMOCorrection(t, trace.offset, vrms);
    const stretchedTime = t + deltaT;
    const stretchIdx = Math.round(stretchedTime / dt);

    if (stretchIdx >= 0 && stretchIdx < n) {
      corrected[i] = trace.samples[i];
    }
    // NMO stretch mute: if stretched sample is far, set to zero
    if (stretchIdx >= n) corrected[i] = 0;
  }

  return corrected;
}

// ============================================================================
//  2. SEMBLANCE (VELOCITY ANALYSIS)
// ============================================================================

/**
 * Calculate semblance for a velocity panel at given t0 and vStack.
 * Semblance = Σ_window (Σ_traces a_i)² / (M * Σ_window Σ_traces a_i²)
 * 
 * @param gather  - CMP gather with multiple offset traces
 * @param t0      - Zero-offset time (seconds)
 * @param vStack  - Trial stacking velocity (m/s)
 * @param windowSamples - Number of samples in the semblance window
 * @returns Semblance value [0, 1]
 */
export function calculateSemblance(
  gather: CMPGather,
  t0: number,
  vStack: number,
  windowSamples: number = 20
): number {
  const M = gather.traces.length;
  if (M < 2) return 0;

  const dt = gather.traces[0].dt;
  const t0Idx = Math.round(t0 / dt);

  let numeratorSum = 0;
  let denominatorSum = 0;

  for (let w = -Math.floor(windowSamples / 2); w < Math.floor(windowSamples / 2); w++) {
    const sampleIdx = t0Idx + w;
    let sumAmps = 0;
    let sumSquaredAmps = 0;

    for (let j = 0; j < M; j++) {
      const trace = gather.traces[j];
      const nmo = calculateNMOCorrection(t0, trace.offset, vStack);
      const stretchedTime = t0 + nmo + w * dt;
      const stretchedIdx = Math.round(stretchedTime / dt);

      if (stretchedIdx >= 0 && stretchedIdx < trace.samples.length) {
        const amp = trace.samples[stretchedIdx];
        sumAmps += amp;
        sumSquaredAmps += amp * amp;
      }
    }

    numeratorSum += sumAmps * sumAmps;
    denominatorSum += sumSquaredAmps;
  }

  if (denominatorSum === 0) return 0;
  return numeratorSum / (M * denominatorSum);
}

/**
 * Generate a full semblance panel over velocity-time grid.
 */
export function generateSemblancePanel(
  gather: CMPGather,
  t0Range: number[],
  vRange: number[]
): SemblancePoint[][] {
  const panel: SemblancePoint[][] = [];

  for (const t0 of t0Range) {
    const row: SemblancePoint[] = [];
    for (const v of vRange) {
      row.push({
        t0,
        vStack: v,
        semblance: calculateSemblance(gather, t0, v)
      });
    }
    panel.push(row);
  }

  return panel;
}

/**
 * Pick the best stacking velocity from a semblance row at a given t0.
 * Returns the velocity with max semblance.
 */
export function pickVelocityFromSemblance(
  panel: SemblancePoint[][],
  t0Index: number
): { vStack: number; semblance: number } {
  const row = panel[t0Index];
  let best = { vStack: 1500, semblance: 0 };
  for (const pt of row) {
    if (pt.semblance > best.semblance) {
      best = { vStack: pt.vStack, semblance: pt.semblance };
    }
  }
  return best;
}

// ============================================================================
//  3. STATIC CORRECTIONS
// ============================================================================

/**
 * Calculate elevation static correction.
 * Δt = -(E_datum - E_source) / V_replacement + (E_datum - E_receiver) / V_replacement
 * Simplified: Δt = 2 * (E_datum - E_surface) / V_weathering
 * 
 * @param datumElevation  - Seismic reference datum (m)
 * @param surfaceElevation - Ground surface elevation (m)
 * @param weatheringVelocity - Near-surface velocity (m/s), typically 500-800 m/s
 * @returns Static time shift in seconds (positive = shift down = add time)
 */
export function calculateElevationStatic(
  datumElevation: number,
  surfaceElevation: number,
  weatheringVelocity: number
): number {
  // Time shift needed to bring the shot/receiver to the datum plane
  return (datumElevation - surfaceElevation) / weatheringVelocity;
}

/**
 * Calculate refraction static correction using the intercept-time method.
 * Δt_refraction = t_intercept - (offset / V_refractor) 
 * (Simplified for simulation)
 * 
 * @param offset          - Source-receiver offset (m)
 * @param weatheringVelocity - Velocity in weathered layer (m/s)
 * @param refractorVelocity  - Velocity in consolidated layer (m/s)
 * @param weatheredThickness - Thickness of weathered layer (m)
 * @returns Refraction static shift in seconds
 */
export function calculateRefractionStatic(
  offset: number,
  weatheringVelocity: number,
  refractorVelocity: number,
  weatheredThickness: number
): number {
  const criticalAngle = Math.asin(weatheringVelocity / refractorVelocity);
  const tIntercept = (2 * weatheredThickness * Math.cos(criticalAngle)) / weatheringVelocity;
  const tRefraction = offset / refractorVelocity;
  return tIntercept - tRefraction + offset / weatheringVelocity;
}

// ============================================================================
//  4. DECONVOLUTION
// ============================================================================

/**
 * Generate a minimum-phase wavelet (for predictive deconvolution).
 */
export function generateMinimumPhaseWavelet(
  length: number,
  dt: number,
  peakFreq: number
): number[] {
  const wavelet: number[] = [];
  const tau = 1 / peakFreq;
  for (let i = 0; i < length; i++) {
    const t = i * dt;
    // Minimum-phase Ricker approximation
    const env = Math.exp(-t / tau);
    const osc = Math.sin(2 * Math.PI * peakFreq * t);
    wavelet.push(env * osc);
  }
  return wavelet;
}

/**
 * Simple predictive deconvolution using Levinson recursion.
 * Computes the prediction error filter from the autocorrelation.
 * 
 * @param trace   - Input seismic trace
 * @param filterLength - Prediction filter length (samples)
 * @param predictionLag - Lag for prediction (samples)
 * @returns Deconvolved trace
 */
export function applyPredictiveDeconvolution(
  trace: number[],
  filterLength: number = 40,
  predictionLag: number = 1
): number[] {
  const n = trace.length;
  if (n < filterLength) return trace;

  // Compute autocorrelation
  const autocorr: number[] = [];
  for (let lag = 0; lag < filterLength; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) {
      sum += trace[i] * trace[i + lag];
    }
    autocorr.push(sum);
  }

  // Levinson recursion to compute prediction filter
  const coeffs: number[] = new Array(filterLength).fill(0);
  coeffs[0] = 1;
  const r = [...autocorr];

  let prevError = r[0];
  for (let k = 1; k < filterLength; k++) {
    let reflection = r[k];
    for (let j = 1; j < k; j++) {
      reflection += coeffs[j] * r[k - j];
    }
    reflection = -reflection / prevError;

    // Update coefficients
    const oldCoeffs = [...coeffs];
    coeffs[k] = reflection;
    for (let j = 1; j < k; j++) {
      coeffs[j] = oldCoeffs[j] + reflection * oldCoeffs[k - j];
    }

    prevError *= (1 - reflection * reflection);
  }

  // Apply filter (convolution)
  const output: number[] = new Array(n).fill(0);
  for (let i = predictionLag; i < n - filterLength; i++) {
    let sum = 0;
    for (let j = 0; j < filterLength; j++) {
      sum += coeffs[j] * trace[i - predictionLag + j];
    }
    // Prediction error = actual - predicted
    output[i] = trace[i] - sum;
  }

  // Copy edges
  for (let i = 0; i < predictionLag; i++) output[i] = trace[i];
  for (let i = n - filterLength; i < n; i++) output[i] = trace[i];

  return output;
}

/**
 * Calculate autocorrelation of a trace.
 */
export function calculateAutocorrelation(trace: number[], maxLag: number): number[] {
  const acf: number[] = [];
  const n = trace.length;
  for (let lag = 0; lag < maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) {
      sum += trace[i] * trace[i + lag];
    }
    acf.push(lag === 0 && sum !== 0 ? 1 : sum / (acf[0] * n || 1));
    if (lag === 0) acf[0] = 1;
  }
  return acf;
}

// ============================================================================
//  5. CMP STACKING
// ============================================================================

/**
 * Perform CMP (Common Midpoint) stack after NMO correction.
 * Stack = Σ corrected_traces / N
 * 
 * @param gather    - NMO-corrected CMP gather
 * @returns Stacked trace (1D array)
 */
export function performCMPStack(gather: CMPGather): number[] {
  const nTraces = gather.traces.length;
  if (nTraces === 0) return [];
  
  const nSamples = gather.traces[0].samples.length;
  const stacked = new Array(nSamples).fill(0);

  for (let i = 0; i < nSamples; i++) {
    let sum = 0;
    let count = 0;
    for (const trace of gather.traces) {
      if (i < trace.samples.length) {
        sum += trace.samples[i];
        count++;
      }
    }
    stacked[i] = count > 0 ? sum / count : 0;
  }

  return stacked;
}

/**
 * Estimate Signal-to-Noise Ratio (SNR) improvement from stacking.
 * SNR_after_stack = SNR_before * sqrt(N)
 * where N is the fold (number of traces stacked).
 */
export function calculateSNRImprovement(fold: number): number {
  return Math.sqrt(fold);
}

// ============================================================================
//  6. DIP MOVEOUT (DMO) CORRECTION
// ============================================================================

/**
 * Calculate DMO correction for dipping reflectors.
 * ΔT_DMO ≈ (x² * sin²θ) / (2 * V² * t₀)  (simplified)
 * where θ is the reflector dip angle
 * 
 * @param t0    - Zero-offset time (seconds)
 * @param x     - Offset (m)
 * @param velocity - Medium velocity (m/s)
 * @param dipAngle  - Reflector dip in degrees
 * @returns DMO time correction in seconds
 */
export function calculateDMOCorrection(
  t0: number,
  x: number,
  velocity: number,
  dipAngle: number
): number {
  const dipRad = (dipAngle * Math.PI) / 180;
  const sinDip = Math.sin(dipRad);
  if (t0 <= 0 || velocity <= 0) return 0;
  return (x * x * sinDip * sinDip) / (2 * velocity * velocity * t0);
}

/**
 * Apply DMO correction to NMO-corrected traces.
 */
export function applyDMOToGather(
  gather: CMPGather,
  t0Values: number[],
  velocity: number,
  dipAngle: number
): number[][] {
  return gather.traces.map(trace => {
    const n = trace.samples.length;
    const dt = trace.dt;
    const corrected = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      const t = i * dt;
      const dmoShift = calculateDMOCorrection(t, trace.offset, velocity, dipAngle);
      const newIdx = Math.round((t - dmoShift) / dt);
      if (newIdx >= 0 && newIdx < n) {
        corrected[i] = trace.samples[newIdx];
      }
    }
    return corrected;
  });
}

// ============================================================================
//  7. MIGRATION (KIRCHHOFF)
// ============================================================================

/**
 * Simplified 2D Kirchhoff diffraction stack migration.
 * Maps a diffraction hyperbola back to its apex.
 * 
 * For each output point (x, z), sum amplitudes along the diffraction curve:
 * t = (2 / V) * sqrt((x - x₀)² + z²)
 * 
 * @param section     - 2D array: [traceIndex][sampleIndex]
 * @param dx          - Trace spacing (m)
 * @param dt          - Sample interval (s)
 * @param velocity    - Migration velocity (m/s)
 * @param apertureTraces - Half-aperture in number of traces
 * @returns Migrated section [nx][nz]
 */
export function kirchhoffMigration(
  section: number[][],
  dx: number,
  dt: number,
  velocity: number,
  apertureTraces: number = 30
): number[][] {
  const nTraces = section.length;
  const nSamples = section[0].length;
  const migrated: number[][] = [];

  for (let ix = 0; ix < nTraces; ix++) {
    const col: number[] = [];
    const x0 = ix * dx;

    for (let iz = 0; iz < nSamples; iz++) {
      const z = (iz * dt * velocity) / 2;
      let sum = 0;
      let weightSum = 0;

      const apStart = Math.max(0, ix - apertureTraces);
      const apEnd = Math.min(nTraces - 1, ix + apertureTraces);

      for (let jx = apStart; jx <= apEnd; jx++) {
        const x = jx * dx;
        const dist = Math.sqrt((x - x0) * (x - x0) + z * z);
        const travelTime = 2 * dist / velocity;
        const sampleIdx = Math.round(travelTime / dt);

        if (sampleIdx >= 0 && sampleIdx < nSamples) {
          // Simple obliquity weighting
          const theta = Math.atan2(Math.abs(x - x0), z);
          const weight = Math.cos(theta);
          sum += section[jx][sampleIdx] * weight;
          weightSum += weight;
        }
      }

      col.push(weightSum > 0 ? sum / weightSum : 0);
    }
    migrated.push(col);
  }

  return migrated;
}

// ============================================================================
//  8. VELOCITY MODEL BUILDING
// ============================================================================

/**
 * Build a layered 1D velocity model.
 * V(z) = V₀ + k * z  (linear gradient)
 * Provides interval velocities at discrete depth steps.
 * 
 * @param v0 - Surface velocity (m/s)
 * @param k  - Velocity gradient (1/s)
 * @param maxDepth - Maximum depth (m)
 * @param dz  - Depth increment (m)
 * @returns Array of velocity layers
 */
export function buildVelocityModel(
  v0: number,
  k: number,
  maxDepth: number,
  dz: number = 50
): VelocityLayer[] {
  const layers: VelocityLayer[] = [];
  let cumulativeTWT = 0;
  let sumVI2dT = 0;

  for (let z = 0; z <= maxDepth; z += dz) {
    const vi = v0 + k * z;
    const dT = 2 * dz / vi;
    cumulativeTWT += dT;
    sumVI2dT += vi * vi * dT;

    const vrms = cumulativeTWT > 0 ? Math.sqrt(sumVI2dT / cumulativeTWT) : v0;

    layers.push({
      depth: z,
      vInterval: vi,
      vRMS: vrms
    });
  }

  return layers;
}

/**
 * Convert interval velocity to RMS velocity at a given TWT.
 * Dix formula (inverse): V²_rms(T) = (1/T) * ∫₀ᵀ V²_int(t) dt
 */
export function intervalToRMS(intervalVelocities: number[], dt: number): number[] {
  const rmsVels: number[] = [];
  let sumVI2 = 0;
  for (let i = 0; i < intervalVelocities.length; i++) {
    sumVI2 += intervalVelocities[i] * intervalVelocities[i];
    rmsVels.push(Math.sqrt(sumVI2 / (i + 1)));
  }
  return rmsVels;
}

// ============================================================================
//  9. AVO (AMPLITUDE VARIATION WITH OFFSET) ANALYSIS
// ============================================================================

/**
 * Shuey 2-term approximation for P-wave reflection coefficient vs angle.
 * R(θ) ≈ A + B * sin²θ
 * 
 * where A = R₀ (intercept, normal-incidence reflection coefficient)
 *       B = gradient (AVO gradient)
 * 
 * @param vp1 - P-wave velocity upper layer (m/s)
 * @param vs1 - S-wave velocity upper layer (m/s)
 * @param rho1 - Density upper layer (g/cc)
 * @param vp2 - P-wave velocity lower layer (m/s)
 * @param vs2 - S-wave velocity lower layer (m/s)
 * @param rho2 - Density lower layer (g/cc)
 * @returns AVO intercept (A) and gradient (B)
 */
export function shueyAVOParameters(
  vp1: number, vs1: number, rho1: number,
  vp2: number, vs2: number, rho2: number
): { A: number; B: number } {
  const dVp = vp2 - vp1;
  const dVs = vs2 - vs1;
  const dRho = rho2 - rho1;
  const avgVp = (vp1 + vp2) / 2;
  const avgVs = (vs1 + vs2) / 2;
  const avgRho = (rho1 + rho2) / 2;

  // Normal incidence reflectivity (A = R₀)
  const A = 0.5 * (dVp / avgVp + dRho / avgRho);

  // Gradient B
  const B = 0.5 * (dVp / avgVp)
    - 2 * (avgVs / avgVp) * (avgVs / avgVp) * (dRho / avgRho + 2 * dVs / avgVs);

  return { A, B };
}

/**
 * Shuey reflection coefficient at a given angle.
 */
export function shueyReflectionCoefficient(
  A: number, B: number, thetaDeg: number
): number {
  const theta = (thetaDeg * Math.PI) / 180;
  const sin2 = Math.sin(theta) * Math.sin(theta);
  return A + B * sin2;
}

/**
 * Classify AVO response using Rutherford-Williams classification.
 * 
 * Class I:  High impedance sand, A > 0, B < 0 (decreasing amplitude with offset)
 * Class II: Near-zero impedance contrast, |A| small, B < 0 (polarity reversal possible)
 * Class IIp: Class II with polarity reversal at some offset
 * Class III: Low impedance sand, A < 0, B < 0 (increasing amplitude with offset = bright spot)
 * Class IV: Low impedance sand, A < 0, B > 0 (decreasing amplitude with offset)
 */
export function classifyAVO(A: number, B: number): AVOResult {
  let avoClass: AVOClass = 'II';
  let fluidHint = 'Brine-wet or low saturation';

  if (A < -0.05 && B < -0.05) {
    avoClass = 'III';
    fluidHint = 'Class III: Classic bright spot — likely gas-bearing';
  } else if (A < -0.05 && B > 0.05) {
    avoClass = 'IV';
    fluidHint = 'Class IV: Dimming with offset — possible gas (unconsolidated)';
  } else if (A > 0.05 && B < -0.05) {
    avoClass = 'I';
    fluidHint = 'Class I: High-impedance gas sand (hard sand) — amplitude decreases with offset';
  } else if (Math.abs(A) < 0.05 && B < -0.05) {
    avoClass = 'IIp';
    fluidHint = 'Class IIp: Near-zero intercept, polarity reversal — possible gas';
  } else {
    avoClass = 'II';
    fluidHint = 'Class II: Small impedance contrast — ambiguous, check other indicators';
  }

  // R² placeholder (computed from actual fit if data available)
  return { intercept: A, gradient: B, rSquared: 0.95, class: avoClass, fluidHint };
}

/**
 * Fit AVO intercept and gradient from pick amplitudes at multiple offsets.
 * Uses least-squares linear regression: R(θ) ≈ A + B * sin²θ
 */
export function fitAVOFromPicks(
  offsets: number[],      // offset distances (m)
  amplitudes: number[],    // picked amplitudes at each offset
  vrms: number,           // RMS velocity (m/s)
  t0: number              // zero-offset time (s)
): AVOResult {
  const n = offsets.length;
  if (n < 2) {
    return { intercept: 0, gradient: 0, rSquared: 0, class: 'II', fluidHint: 'Insufficient data' };
  }

  // Convert offsets to sin²θ
  const sin2Theta: number[] = [];
  for (const x of offsets) {
    const tx = Math.sqrt(t0 * t0 + (x * x) / (vrms * vrms));
    const sinTheta = (x / vrms) / tx;  // sinθ = x / (V * t(x))
    sin2Theta.push(sinTheta * sinTheta);
  }

  // Least squares: y = A + B * x where y = amplitudes, x = sin²θ
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += sin2Theta[i];
    sumY += amplitudes[i];
    sumXY += sin2Theta[i] * amplitudes[i];
    sumX2 += sin2Theta[i] * sin2Theta[i];
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) {
    return { intercept: sumY / n, gradient: 0, rSquared: 0, class: 'II', fluidHint: 'Zero variance' };
  }

  const B = (n * sumXY - sumX * sumY) / denom;
  const A = (sumY - B * sumX) / n;

  // R²
  const yMean = sumY / n;
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < n; i++) {
    const yPred = A + B * sin2Theta[i];
    ssRes += (amplitudes[i] - yPred) ** 2;
    ssTot += (amplitudes[i] - yMean) ** 2;
  }
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0;

  const classification = classifyAVO(A, B);
  return { ...classification, intercept: A, gradient: B, rSquared };
}

// ============================================================================
//  10. SEISMIC INVERSION (RECURSIVE)
// ============================================================================

/**
 * Recursive seismic inversion: convert reflectivity series to acoustic impedance.
 * Z_{i+1} = Z_i * (1 + R_i) / (1 - R_i)
 * 
 * @param reflectivity - Reflection coefficient series
 * @param z0           - Starting acoustic impedance (first layer)
 * @returns Acoustic impedance series
 */
export function recursiveSeismicInversion(
  reflectivity: number[],
  z0: number
): number[] {
  const impedance: number[] = [z0];
  for (let i = 0; i < reflectivity.length; i++) {
    const r = Math.max(-0.99, Math.min(0.99, reflectivity[i]));
    const zNext = impedance[i] * (1 + r) / (1 - r);
    impedance.push(zNext);
  }
  return impedance;
}

/**
 * Generate a low-frequency impedance model (background trend).
 * Z_bg(z) = Z₀ * exp(k * z)  — exponential compaction trend
 */
export function lowFrequencyImpedanceModel(
  z0: number,
  compactionK: number,
  depths: number[]
): number[] {
  return depths.map(z => z0 * Math.exp(compactionK * z));
}

// ============================================================================
//  11. COST & TURNAROUND MODELING
// ============================================================================

/**
 * Default processing flow steps with costs (industry-typical USD rates).
 */
export const DEFAULT_PROCESSING_FLOW: ProcessingFlowStep[] = [
  { name: 'Demultiplexing & Reformatting', enabled: true, costPerSqKm: 800, hoursPerGB: 0.5 },
  { name: 'Geometry Assignment', enabled: true, costPerSqKm: 600, hoursPerGB: 0.3 },
  { name: 'Trace Editing & Noise Removal', enabled: true, costPerSqKm: 1200, hoursPerGB: 0.8 },
  { name: 'Static Corrections', enabled: true, costPerSqKm: 1500, hoursPerGB: 1.0 },
  { name: 'Deconvolution', enabled: true, costPerSqKm: 2000, hoursPerGB: 1.5 },
  { name: 'Velocity Analysis', enabled: true, costPerSqKm: 3500, hoursPerGB: 4.0 },
  { name: 'NMO Correction & CMP Stack', enabled: true, costPerSqKm: 1000, hoursPerGB: 0.5 },
  { name: 'DMO Correction', enabled: false, costPerSqKm: 2000, hoursPerGB: 1.0 },
  { name: 'Post-Stack Migration', enabled: true, costPerSqKm: 3000, hoursPerGB: 2.0 },
  { name: 'Pre-Stack Time Migration (PSTM)', enabled: false, costPerSqKm: 8000, hoursPerGB: 6.0 },
  { name: 'Pre-Stack Depth Migration (PSDM)', enabled: false, costPerSqKm: 15000, hoursPerGB: 12.0 },
  { name: 'AVO Analysis', enabled: false, costPerSqKm: 2500, hoursPerGB: 1.5 },
  { name: 'Seismic Inversion', enabled: false, costPerSqKm: 5000, hoursPerGB: 3.0 },
  { name: 'Final Filtering, Scaling & Display', enabled: true, costPerSqKm: 1500, hoursPerGB: 1.0 },
];

/**
 * Calculate total processing cost.
 * @param flowSteps - Array of processing steps
 * @param surveyAreaSqKm - Survey area in square kilometers
 * @returns Total cost in USD
 */
export function calculateProcessingCost(
  flowSteps: ProcessingFlowStep[],
  surveyAreaSqKm: number
): number {
  return flowSteps
    .filter(s => s.enabled)
    .reduce((sum, s) => sum + s.costPerSqKm * surveyAreaSqKm, 0);
}

/**
 * Calculate processing turnaround time.
 * @param flowSteps - Array of processing steps
 * @param dataVolumeGB - Total data volume in GB
 * @returns Total hours
 */
export function calculateTurnaroundTime(
  flowSteps: ProcessingFlowStep[],
  dataVolumeGB: number
): number {
  return flowSteps
    .filter(s => s.enabled)
    .reduce((sum, s) => sum + s.hoursPerGB * dataVolumeGB, 0);
}

/**
 * Generate per-step cost breakdown.
 */
export function generateCostBreakdown(
  flowSteps: ProcessingFlowStep[],
  surveyAreaSqKm: number
): { name: string; cost: number; hours: number; }[] {
  return flowSteps
    .filter(s => s.enabled)
    .map(s => ({
      name: s.name,
      cost: s.costPerSqKm * surveyAreaSqKm,
      hours: s.hoursPerGB * 50, // assuming 50GB baseline for simplicity
    }));
}

// ============================================================================
//  12. SYNTHETIC SEISMOGRAM GENERATION
// ============================================================================

/**
 * Generate a reflectivity series from acoustic impedance log.
 * R_i = (Z_{i+1} - Z_i) / (Z_{i+1} + Z_i)
 */
export function impedanceToReflectivity(impedance: number[]): number[] {
  const rc: number[] = [];
  for (let i = 0; i < impedance.length - 1; i++) {
    rc.push((impedance[i + 1] - impedance[i]) / (impedance[i + 1] + impedance[i]));
  }
  return rc;
}

/**
 * Convolve a wavelet with a reflectivity series to produce a synthetic seismogram.
 * s(t) = w(t) * r(t)
 */
export function convolveWaveletReflectivity(
  wavelet: number[],
  reflectivity: number[]
): number[] {
  const nw = wavelet.length;
  const nr = reflectivity.length;
  const output = new Array(nw + nr - 1).fill(0);

  for (let i = 0; i < nw; i++) {
    for (let j = 0; j < nr; j++) {
      output[i + j] += wavelet[i] * reflectivity[j];
    }
  }

  return output;
}

/**
 * Generate a synthetic shot gather with hyperbolic moveout.
 */
export function generateSyntheticGather(
  nTraces: number,
  nSamples: number,
  dt: number,
  minOffset: number,
  offsetIncrement: number,
  reflectivityDepthPairs: { depth: number; rc: number }[],
  velocityModel: VelocityLayer[]
): CMPGather {
  const traces: SeismicTrace[] = [];

  for (let t = 0; t < nTraces; t++) {
    const offset = minOffset + t * offsetIncrement;
    const samples: number[] = new Array(nSamples).fill(0);

    for (const { depth, rc } of reflectivityDepthPairs) {
      // Find velocity at this depth
      let v = 2000;
      for (const layer of velocityModel) {
        if (layer.depth >= depth) {
          v = layer.vInterval;
          break;
        }
      }

      // Two-way travel time for this offset
      const t0 = 2 * depth / v;
      const tx = Math.sqrt(t0 * t0 + (offset * offset) / (v * v));
      const sampleIdx = Math.round(tx / dt);

      if (sampleIdx >= 0 && sampleIdx < nSamples) {
        // Place Ricker-like pulse
        const peakFreq = 30;
        for (let w = -10; w <= 10; w++) {
          const si = sampleIdx + w;
          if (si >= 0 && si < nSamples) {
            const tw = w * dt;
            const ricker = (1 - 2 * Math.PI * Math.PI * peakFreq * peakFreq * tw * tw)
              * Math.exp(-Math.PI * Math.PI * peakFreq * peakFreq * tw * tw);
            samples[si] += rc * ricker;
          }
        }
      }
    }

    traces.push({
      offset,
      samples,
      dt,
      cmpX: 0,
      cmpY: 0,
      sourceX: -offset / 2,
      sourceY: 0,
    });
  }

  return { cmpId: 1, traces };
}