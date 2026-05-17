/**
 * Prospect Evaluation & Risk Assessment Utilities
 */

export interface RiskFactors {
  source: number;
  reservoir: number;
  trap: number;
  seal: number;
  migration: number;
}

/**
 * Calculate Geological Probability of Success (Pg)
 */
export function calculatePg(factors: RiskFactors): number {
  return factors.source * factors.reservoir * factors.trap * factors.seal * factors.migration;
}

export interface VolumetricInputs {
  area: { min: number, base: number, max: number }; // Acres
  netPay: { min: number, base: number, max: number }; // Feet
  porosity: { min: number, base: number, max: number }; // Decimal
  sw: { min: number, base: number, max: number }; // Decimal (Water Saturation)
  bo: number; // FVF (bbl/stb)
}

/**
 * Calculate OOIP (Original Oil In Place)
 * OOIP = 7758 * A * h * phi * (1 - Sw) / Bo
 */
export function calculateOOIP(area: number, netPay: number, porosity: number, sw: number, bo: number): number {
  return (7758 * area * netPay * porosity * (1 - sw)) / bo;
}

/**
 * Simple Monte Carlo Simulation for Probabilistic Resource Estimation
 */
export function runVolumetricSimulation(inputs: VolumetricInputs, iterations: number = 5000): number[] {
  const results: number[] = [];

  for (let i = 0; i < iterations; i++) {
    // Random samples from triangular distributions
    const a = sampleTriangular(inputs.area.min, inputs.area.base, inputs.area.max);
    const h = sampleTriangular(inputs.netPay.min, inputs.netPay.base, inputs.netPay.max);
    const phi = sampleTriangular(inputs.porosity.min, inputs.porosity.base, inputs.porosity.max);
    const sw = sampleTriangular(inputs.sw.min, inputs.sw.base, inputs.sw.max);
    
    const ooip = calculateOOIP(a, h, phi, sw, inputs.bo);
    results.push(ooip);
  }

  return results.sort((a, b) => a - b);
}

/**
 * Extract P10, P50, P90 from simulation results
 * Note: In oil & gas, P90 is typically the 10th percentile (low side), 
 * P10 is 90th percentile (high side).
 */
export function getPercentiles(results: number[]) {
  const n = results.length;
  return {
    p90: results[Math.floor(n * 0.1)], // Conservative (10% of results are less than this)
    p50: results[Math.floor(n * 0.5)], // Median
    p10: results[Math.floor(n * 0.9)], // Optimistic (90% of results are less than this)
  };
}

function sampleTriangular(min: number, mode: number, max: number): number {
  const u = Math.random();
  const f = (mode - min) / (max - min);
  if (u < f) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }
}

export interface ProspectCompare {
  name: string;
  pg: number;
  p50Rec: number; // Recoverable MMSTB
  cost: number; // M$
}
