
import { PURE_COMPONENTS, PureComponent, BIP_NON_HC } from './pvt_data';

export enum EOSModel {
  PR = 'Peng-Robinson',
  SRK = 'Soave-Redlich-Kwong',
  VDW = 'Van der Waals'
}

export enum PropertyCorrelation {
  KESLER_LEE = 'Kesler-Lee',
  RIAZI_DAUBERT = 'Riazi-Daubert',
  CAVETT = 'Cavett',
  TWU = 'Twu'
}

export enum SplittingMethod {
  WHITSON = 'Whitson (Gamma)',
  PEDERSEN = 'Pedersen',
  LOHRENZ = 'Lohrenz'
}

export interface PseudoComponent extends PureComponent {
  isPseudo: true;
  scn?: number; // Single Carbon Number
}

export interface CompositionComponent {
  component: PureComponent | PseudoComponent;
  z: number; // mole fraction
}

/**
 * Whitson Three-Parameter Gamma Distribution Splitting
 * Simplified implementation for demonstration
 */
export function splitC7Plus(
  c7PlusZ: number, 
  c7PlusMW: number, 
  c7PlusSG: number, 
  numGroups: number,
  method: SplittingMethod = SplittingMethod.WHITSON
): PseudoComponent[] {
  const groups: PseudoComponent[] = [];
  
  // Whitson simplified splitting
  for (let i = 0; i < numGroups; i++) {
    const mw = c7PlusMW * (0.5 + (i * 1.5 / numGroups)); 
    const sg = 0.6 + (mw / 500); 
    
    groups.push({
      id: `C7_${i}`,
      name: `Pseudo_${i+1}`,
      mw: mw,
      sg: sg,
      tc: 0, 
      pc: 0,
      vc: 0,
      omega: 0,
      zc: 0,
      tb: 0, 
      shift: 0,
      isPseudo: true,
      scn: 7 + i
    });
  }
  
  return groups;
}

/**
 * Calculates Tb (Boiling point) from MW and SG if not provided
 */
export function estimateTb(mw: number, sg: number): number {
  return 10.73 * Math.pow(mw, 0.6) * Math.pow(sg, 0.4); 
}

/**
 * Property Correlations for pseudo-components
 */
export function applyCorrelations(
  pseudo: PseudoComponent, 
  correlation: PropertyCorrelation = PropertyCorrelation.KESLER_LEE
): PseudoComponent {
  const tb = pseudo.tb || estimateTb(pseudo.mw, pseudo.sg);
  const sg = pseudo.sg;
  const mw = pseudo.mw;
  
  let tc, pc, omega;
  
  if (correlation === PropertyCorrelation.KESLER_LEE) {
    tc = 341.7 + 811.1 * sg + (0.4244 + 0.1174 * sg) * tb + (0.4669 - 3.2623 * sg) * 1e5 / tb;
    pc = Math.exp(8.3634 - 0.0566/sg - (0.24244 + 2.2898/sg + 0.11857/sg**2)*1e-3*tb + (1.4685 + 3.648/sg + 0.47227/sg**2)*1e-7*tb**2 - (0.42019 + 1.6977/sg**2)*1e-10*tb**3);
    omega = (3/7) * (Math.log10(pc / 14.696) / (tc / tb - 1)) - 1;
  } else {
    // Riazi-Daubert (simplified)
    tc = 19.06232 * Math.pow(tb, 0.58848) * Math.pow(sg, 0.3596);
    pc = 5.53027 * 1e7 * Math.pow(tb, -2.3125) * Math.pow(sg, 2.3201);
    omega = (3/7) * (Math.log10(pc / 14.696) / (tc / tb - 1)) - 1;
  }
  
  return { ...pseudo, tc, pc, omega, tb };
}

/**
 * Calculate BIP k(i,j)
 */
export function getBIP(compI: PureComponent | PseudoComponent, compJ: PureComponent | PseudoComponent): number {
  if (compI.id === compJ.id) return 0;
  
  if (BIP_NON_HC[compI.id]?.[compJ.id]) return BIP_NON_HC[compI.id][compJ.id];
  if (BIP_NON_HC[compJ.id]?.[compI.id]) return BIP_NON_HC[compJ.id][compI.id];
  
  const vi = compI.vc || 1.0;
  const vj = compJ.vc || 1.0;
  const n = 1.2;
  const kij = 1 - Math.pow((2 * Math.pow(vi * vj, 1/6)) / (Math.pow(vi, 1/3) + Math.pow(vj, 1/3)), n);
  
  return Math.max(0, kij);
}

/**
 * EOS Alpha(T) function
 */
export function calculateAlpha(t: number, comp: PureComponent, model: EOSModel): number {
  const tr = t / comp.tc;
  let m: number;
  
  if (model === EOSModel.PR) {
    if (comp.omega <= 0.491) {
      m = 0.37464 + 1.54226 * comp.omega - 0.26992 * comp.omega**2;
    } else {
      m = 0.379642 + 1.48503 * comp.omega - 0.164423 * comp.omega**2 + 0.016666 * comp.omega**3;
    }
  } else if (model === EOSModel.SRK) {
    m = 0.480 + 1.574 * comp.omega - 0.176 * comp.omega**2;
  } else {
    return 1.0; // VDW
  }
  
  return (1 + m * (1 - Math.sqrt(tr)))**2;
}

/**
 * Rachford-Rice Objective Function
 */
function rachfordRice(nv: number, z: number[], k: number[]): { f: number, df: number } {
  let f = 0;
  let df = 0;
  for (let i = 0; i < z.length; i++) {
    const denom = 1 + nv * (k[i] - 1);
    f += (z[i] * (k[i] - 1)) / denom;
    df -= (z[i] * (k[i] - 1)**2) / (denom**2);
  }
  return { f, df };
}

/**
 * Flash calculation (Rachford-Rice with Newton-Raphson)
 */
export function performFlash(
  pressure: number, 
  temp: number, 
  composition: CompositionComponent[], 
  model: EOSModel = EOSModel.PR
): { liquidFrac: number, gasFrac: number, kValues: number[], liquidZ: number[], gasZ: number[] } {
  const z = composition.map(c => c.z);
  
  // Wilson's correlation for initial K-values
  let kValues = composition.map(c => {
    return (c.component.pc / pressure) * Math.exp(5.37 * (1 + c.component.omega) * (1 - c.component.tc / temp));
  });
  
  // Solve Rachford-Rice
  let nv = 0.5; // Vapor fraction
  for (let i = 0; i < 50; i++) {
    const { f, df } = rachfordRice(nv, z, kValues);
    if (Math.abs(f) < 1e-10) break;
    const step = f / df;
    nv = Math.max(0, Math.min(1, nv - step));
  }
  
  const liquidZ = z.map((zi, i) => zi / (1 + nv * (kValues[i] - 1)));
  const gasZ = z.map((zi, i) => (zi * kValues[i]) / (1 + nv * (kValues[i] - 1)));
  
  return {
    liquidFrac: 1 - nv,
    gasFrac: nv,
    kValues,
    liquidZ,
    gasZ
  };
}

/**
 * Stability Analysis (Simplified TPD)
 */
export function isPhaseStable(composition: CompositionComponent[], pressure: number, temp: number): boolean {
  // Simplified: If flash returns something near 0 or 1, it might be stable as single phase
  const result = performFlash(pressure, temp, composition);
  return result.gasFrac < 0.001 || result.gasFrac > 0.999;
}

/**
 * Bubble Point Pressure Calculation
 */
export function calculateBubblePoint(composition: CompositionComponent[], temp: number): number {
  let pb = 2000; // Guess
  let z = composition.map(c => c.z);
  
  for (let iter = 0; iter < 20; iter++) {
    let sumKz = 0;
    const kValues = composition.map(c => {
      const k = (c.component.pc / pb) * Math.exp(5.37 * (1 + c.component.omega) * (1 - c.component.tc / temp));
      sumKz += k * c.z;
      return k;
    });
    
    if (Math.abs(sumKz - 1) < 1e-5) break;
    pb = pb * sumKz; // Simple iteration
  }
  return pb;
}

/**
 * Dew Point Pressure Calculation
 */
export function calculateDewPoint(composition: CompositionComponent[], temp: number): number {
  let pd = 3000; // Guess
  for (let iter = 0; iter < 20; iter++) {
    let sumZoverK = 0;
    const kValues = composition.map(c => {
      const k = (c.component.pc / pd) * Math.exp(5.37 * (1 + c.component.omega) * (1 - c.component.tc / temp));
      sumZoverK += c.z / k;
      return k;
    });
    
    if (Math.abs(sumZoverK - 1) < 1e-5) break;
    pd = pd / sumZoverK; // Simple iteration
  }
  return pd;
}

/**
 * Saturated Oil Viscosity (Beggs-Robinson)
 */
export function calculateSaturatedViscosity(deadVisco: number, rs: number): number {
  const a = 10.715 * Math.pow(rs + 100, -0.515);
  const b = 5.44 * Math.pow(rs + 150, -0.338);
  return a * Math.pow(deadVisco, b);
}

/**
 * Undersaturated Oil Viscosity (Vasquez-Beggs)
 */
export function calculateUndersaturatedViscosity(satVisco: number, p: number, pb: number): number {
  if (p <= pb) return satVisco;
  const m = 2.6 * Math.pow(p, 1.187) * Math.exp(-11.513 - 1.302 * 1e-5 * p);
  return satVisco * Math.pow(p / pb, m);
}

/**
 * Liquid Dropout (CVD Estimation - Simplified)
 */
export function calculateLiquidDropout(p: number, pd: number, maxDropout: number): number {
  if (p >= pd) return 0;
  // Simplified curve: starts at pd, peaks, then revaporizes
  const pr = p / pd;
  if (pr < 0.1) return 0;
  return maxDropout * 4 * pr * (1 - pr); // Simple parabolic dropout for demo
}

/**
 * CGR calculation
 */
export function calculateCGR(p: number, pd: number, initialCGR: number): number {
  if (p >= pd) return initialCGR;
  // CGR drops as pressure declines below dew point
  return initialCGR * Math.pow(p / pd, 1.5);
}

/**
 * LBC Viscosity (Compositional - Simplified placeholder)
 */
export function calculateLBCViscosity(rho: number, tc: number, pc: number, mw: number): number {
  // Zeta calculation for LBC (viscosity parameter)
  const xi = Math.pow(tc, 1/6) / (Math.pow(mw, 1/2) * Math.pow(pc, 2/3));
  // Standard LBC polynomial for reduced density
  // In a real simulator, rhoR = rho / rhoC
  const rhoR = Math.min(3.0, rho / 0.3); // Simplified reduced density cap
  
  // Low-pressure gas viscosity placeholder (Jossi-Stiel-Thodos type)
  const muStar = 0.01; 
  
  const poly = 0.1023 + 0.023364 * rhoR + 0.058533 * rhoR**2 - 0.040758 * rhoR**3 + 0.0093324 * rhoR**4;
  const mu = muStar + (Math.pow(poly, 4) - 1e-4) / xi;
  
  return Math.max(0.01, mu);
}

/**
 * Interfacial Tension (Parachor Method)
 */
export function calculateIFT(
  liquidZ: number[], 
  gasZ: number[], 
  rhoL: number, 
  rhoG: number, 
  mw: number[]
): number {
  // Parachors for pure components (simplified defaults)
  const parachors = [77, 108, 150, 189, 189, 231, 231, 270, 41, 78, 80, 50]; 
  let sum = 0;
  for (let i = 0; i < liquidZ.length; i++) {
    const p = parachors[i % parachors.length];
    sum += p * (liquidZ[i] * rhoL - gasZ[i] * rhoG);
  }
  return Math.pow(sum, 4) / 1000; // dynes/cm
}

/**
 * Capillary Number (Nca)
 */
export function calculateCapillaryNumber(visco: number, velocity: number, ift: number): number {
  if (ift <= 0) return 1e-1; // Miscible limit
  return (visco * 0.001 * velocity) / (ift * 0.001); // SI units conversion
}

/**
 * Compositional Grading (Barometric Equation)
 */
export function calculateCompGrading(zi: number, mw: number, depthDiff: number, temp: number): number {
  const g = 9.806;
  const r = 8.314;
  const tk = temp + 273.15;
  // Simplified gradient based on molecular weight and depth
  return zi * Math.exp(-(mw * 0.001 * g * depthDiff) / (r * tk));
}

/**
 * Asphaltene Onset Pressure (AOP) - Simplified Screening
 * De Boer Plot style
 */
export function calculateAsphalteneStability(p: number, density: number, bubblePoint: number): { stability: 'stable' | 'at-risk' | 'unstable', score: number } {
  // Simple heuristic: distance from bubble point and density
  // Pure asphaltenes are more likely to precipitate at lower densities (high API) 
  // and pressures just above bubble point.
  const dp = p - bubblePoint;
  if (dp < 0) return { stability: 'stable', score: 0 }; // Below Pb, solubility usually increases 
  
  const risk = (40 / density) * (1 / (dp + 100));
  if (risk > 0.5) return { stability: 'unstable', score: risk };
  if (risk > 0.3) return { stability: 'at-risk', score: risk };
  return { stability: 'stable', score: risk };
}

/**
 * Wax Appearance Temperature (WAT) Estimation
 */
export function calculateWAT(api: number): number {
  // Very simplified WAT correlation based on API
  // Heavier oils (lower API) generally have higher WAT
  return 140 - (api * 1.2);
}

/**
 * Hydrate Dissociation Temperature (Hammerschmidt)
 */
export function calculateHydrateTemperature(p: number, gravity: number): number {
  if (p <= 0) return 32;
  // Simplified version of Hammerschmidt equation for English units
  return 8.354 * Math.pow(p, 0.285) - (30 / gravity);
}

/**
 * Scale Saturation Index (Simplified CaCO3)
 */
export function calculateScaleIndex(ph: number, tds: number, temp: number): number {
  // Langelier Saturation Index (LSI) simplified
  const pCa = 2.5; 
  const pAlk = 2.8;
  const tc = (temp - 32) * 5/9;
  const pk2 = 1.0; // Approximation
  const si = ph - (pCa + pAlk + pk2 + (0.01 * tc));
  return si;
}

