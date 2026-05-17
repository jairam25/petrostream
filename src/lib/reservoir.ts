/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- Capillary Pressure ---

/**
 * Leverett J-function for capillary pressure normalization/conversion
 * J(Sw) = (Pc / (sigma * cos(theta))) * sqrt(k / phi)
 */
export function calculateLeverettJ(pc: number, sigma: number, thetaDeg: number, permeability: number, porosity: number): number {
  const thetaRad = (thetaDeg * Math.PI) / 180;
  return (pc / (sigma * Math.cos(thetaRad))) * Math.sqrt(permeability / porosity);
}

/**
 * Convert Pc from lab to reservoir conditions
 * Pc_res = Pc_lab * (sigma_res * cos(theta_res)) / (sigma_lab * cos(theta_lab))
 */
export function convertPc(pcLab: number, sigmaLab: number, thetaLabDeg: number, sigmaRes: number, thetaResDeg: number): number {
  const thetaLabRad = (thetaLabDeg * Math.PI) / 180;
  const thetaResRad = (thetaResDeg * Math.PI) / 180;
  return pcLab * (sigmaRes * Math.cos(thetaResRad)) / (sigmaLab * Math.cos(thetaLabRad));
}

// --- Relative Permeability ---

export interface RelPermResult {
  sw: number;
  kro: number;
  krw: number;
}

/**
 * Corey two-phase relative permeability model
 */
export function calculateCoreyRelPerm(
  sw: number,
  swi: number,
  sor: number,
  kro_max: number,
  krw_max: number,
  no: number,
  nw: number
): { kro: number; krw: number } {
  const sw_star = (sw - swi) / (1 - swi - sor);
  
  if (sw <= swi) return { kro: kro_max, krw: 0 };
  if (sw >= 1 - sor) return { kro: 0, krw: krw_max };
  
  const kro = kro_max * Math.pow(1 - sw_star, no);
  const krw = krw_max * Math.pow(sw_star, nw);
  
  return { kro, krw };
}

// --- Black Oil Correlations (PVT) ---

/**
 * Standing correlation for Solution GOR (Rs)
 * Revised: γg × [(p/18.2 + 1.4) × 10^(0.0125·API - 0.00091·T)]^1.2048
 */
export function calculateStandingRs(pressure: number, tempF: number, gasGravity: number, apiGravity: number): number {
  const pb = pressure;
  const exponent = 1.2048;
  const pTerm = (pb / 18.2) + 1.4;
  const tTerm = Math.pow(10, 0.0125 * apiGravity - 0.00091 * tempF);
  return gasGravity * Math.pow(pTerm * tTerm, exponent);
}

// --- Material Balance (MBE) ---

/**
 * Total Underground Withdrawal (F)
 * F = Np[Bo + (Rp - Rs)Bg] + Wp * Bw
 */
export function calculateWithdrawalF(
  np: number, 
  bo: number, 
  rp: number, 
  rs: number, 
  bg: number, 
  wp: number, 
  bw: number
): number {
  return np * (bo + (rp - rs) * bg) + wp * bw;
}

/**
 * Oil and Dissolved Gas Expansion (Eo)
 * Eo = (Bo - Boi) + (Rsi - Rs) * Bg
 */
export function calculateExpansionEo(bo: number, boi: number, rs: number, rsi: number, bg: number): number {
  return (bo - boi) + (rsi - rs) * bg;
}

/**
 * Gas Cap Expansion (Eg)
 * Eg = Boi * (Bg / Bgi - 1)
 */
export function calculateExpansionEg(bg: number, bgi: number, boi: number): number {
  return boi * (bg / bgi - 1);
}

/**
 * P/Z Calculation for Gas Reservoirs
 */
export function calculatePOverZ(p: number, z: number): number {
  if (z === 0) return 0;
  return p / z;
}

/**
 * Formation and Water Expansion (Efw)
 * Efw = Boi * [(cf + swi * cw) / (1 - swi)] * dp
 */
export function calculateExpansionEfw(boi: number, swi: number, cf: number, cw: number, dp: number): number {
  if (swi >= 1) return 0;
  return boi * ((cf + swi * cw) / (1 - swi)) * dp;
}

/**
 * Vasquez-Beggs correlation for Oil FVF (Bo)
 */
export function calculateVasquezBeggsBo(
  pressure: number, 
  tempF: number, 
  rs: number, 
  gasGravity: number, 
  apiGravity: number
): number {
  let c1, c2, c3;
  
  if (apiGravity <= 30) {
    c1 = 4.677e-4;
    c2 = 1.751e-5;
    c3 = -1.811e-8;
  } else {
    c1 = 4.670e-4;
    c2 = 1.100e-5;
    c3 = 1.337e-9;
  }
  
  return 1 + c1 * rs + c2 * (tempF - 60) * (apiGravity / gasGravity) + c3 * rs * (tempF - 60) * (apiGravity / gasGravity);
}

/**
 * Beggs-Robinson Oil Viscosity (dead oil)
 */
export function calculateBeggsRobinsonViscosity(tempF: number, apiGravity: number): number {
  const z = 3.0324 - 0.02023 * apiGravity;
  const y = Math.pow(10, z);
  const x = y * Math.pow(tempF, -1.163);
  return Math.pow(10, x) - 1;
}

/**
 * Lee-Gonzalez-Eakin Gas Viscosity
 */
export function calculateLeeGonzalezViscosity(p_psi: number, t_rankine: number, zFactor: number, gasGravity: number): number {
  const m_g = gasGravity * 28.97;
  const rho_g = (p_psi * m_g) / (10.73 * t_rankine * zFactor) * 0.016018; // lb/ft3 to g/cc approx? No, units are tricky.
  
  const x = 3.5 + (986 / t_rankine) + 0.01 * m_g;
  const y = 2.4 - 0.2 * x;
  const k = (9.4 + 0.02 * m_g) * Math.pow(t_rankine, 1.5) / (209 + 19 * m_g + t_rankine);
  
  return k * 1e-4 * Math.exp(x * Math.pow(rho_g, y));
}

/**
 * Hall-Yarborough Z-factor
 */
export function calculateHallYarboroughZ(p_pr: number, t_pr: number): number {
  const t = 1 / t_pr;
  const A = 0.06125 * p_pr * t * Math.exp(-1.2 * Math.pow(1 - t, 2));
  
  const b1 = 14.76 * t - 9.76 * t * t + 4.58 * Math.pow(t, 3);
  const b2 = 90.7 * t - 242.2 * t * t + 42.4 * Math.pow(t, 3);
  const b3 = 2.18 + 2.82 * t;

  let y = 0.01;
  for (let i = 0; i < 50; i++) {
    const y2 = y * y;
    const y3 = y2 * y;
    const y4 = y3 * y;
    
    // Objective function F(y) = 0
    const term1 = (y + y2 + y3 - y4) / Math.pow(1 - y, 3);
    const f = term1 - b1 * y2 + b2 * Math.pow(y, b3) - A;
    
    // Derivative dF/dy
    const df1 = (1 + 4 * y + 4 * y2 - 4 * y3 + y4) / Math.pow(1 - y, 4);
    const df = df1 - 2 * b1 * y + b2 * b3 * Math.pow(y, b3 - 1);
    
    const delta = f / df;
    y = y - delta;
    if (Math.abs(f) < 1e-8) break;
  }
  
  return A / y;
}

/**
 * Brooks-Corey Three-Phase Relative Permeability
 * Simplified implementation: Stone II Model combined with Brooks-Corey endpoints
 */
export function calculateBrooksCorey3Phase(
  sw: number,
  sg: number,
  swi: number,
  sorw: number,
  sorg: number,
  sl: number, // Total liquid saturation (sw + so)
  kro_max: number,
  krw_max: number,
  krg_max: number,
  nw: number,
  no: number,
  ng: number
): { krw: number; krg: number; kro: number } {
  const so = 1 - sw - sg;
  
  // Normalized saturations
  const sw_star = Math.max(0, (sw - swi) / (1 - swi - sorw));
  const sg_star = Math.max(0, sg / (1 - swi - sorg));
  const so_star = Math.max(0, (so - sorw) / (1 - swi - sorw));

  const krw = krw_max * Math.pow(sw_star, nw);
  const krg = krg_max * Math.pow(sg_star, ng);
  
  // Stone II for kro
  const krow = kro_max * Math.pow(1 - sw_star, no); // Oil-water system
  const krog = kro_max * Math.pow(1 - sg_star, no); // Gas-oil system
  const kro = kro_max * ((krow/kro_max + krw) * (krog/kro_max + krg) - (krw + krg));

  return { krw, krg, kro: Math.max(0, kro) };
}

/**
 * Dranchuk-Abou-Kassem Z-factor
 * Based on 11 constant equation of state.
 * Ref: Dranchuk and Abou-Kassem (1975)
 */
export function calculateDranchukAbouKassemZ(p_pr: number, t_pr: number): number {
  const A1 = 0.3265;
  const A2 = -1.0700;
  const A3 = -0.5339;
  const A4 = 0.01569;
  const A5 = -0.05165;
  const A6 = 0.5475;
  const A7 = -0.7361;
  const A8 = 0.1844;
  const A9 = 0.1056;
  const A10 = 0.6134;
  const A11 = 0.7210;
  
  const tr = t_pr;
  const tr2 = tr * tr;
  const tr3 = tr2 * tr;
  const tr4 = tr3 * tr;
  const tr5 = tr4 * tr;

  const c1 = A1 + A2 / tr + A3 / tr3 + A4 / tr4 + A5 / tr5;
  const c2 = A6 + A7 / tr + A8 / tr2;
  const c3 = A9 * (A7 / tr + A8 / tr2);
  const c4 = A10 / tr3;

  let rho_r = (0.27 * p_pr) / tr; // Initial guess
  
  for (let i = 0; i < 50; i++) {
    const r = rho_r;
    const r2 = r * r;
    const r5 = Math.pow(r, 5);
    const expTerm = Math.exp(-A11 * r2);
    
    // f(rho_r) = 1 + c1*r + c2*r^2 + c3*r^5 + c4*r^2(1 + A11*r^2)exp(-A11*r^2) - (0.27*P_pr)/(tr * r) = 0
    const term4 = c4 * r2 * (1 + A11 * r2) * expTerm;
    const f = 1 + c1 * r + c2 * r2 + c3 * r5 + term4 - (0.27 * p_pr) / (tr * r);
    
    // df/drho_r
    const dTerm4 = c4 * expTerm * (2 * r + 2 * A11 * Math.pow(r, 3) * (1 - A11 * r2));
    const df = c1 + 2 * c2 * r + 5 * c3 * Math.pow(r, 4) + dTerm4 + (0.27 * p_pr) / (tr * r2);
    
    const delta = f / df;
    rho_r = r - delta;
    if (rho_r <= 0) rho_r = 0.01;
    if (rho_r > 5.0) rho_r = 0.5 * r;
    
    if (Math.abs(f) < 1e-8) break;
  }
  
  return (0.27 * p_pr) / (tr * rho_r);
}

/**
 * McCain's Solution Gas-Water Ratio (Rsw)
 * Corrected to match McCain (1991) polynomial form.
 * Salinity in ppm.
 */
export function calculateMcCainRsw(pressure: number, tempF: number, salinity: number): number {
  const p = pressure;
  const t = tempF;
  
  // Pure water gas solubility coefficients (McCain 1991)
  const A = 2.12 + 3.45e-3 * t - 3.59e-5 * t * t;
  const B = 0.0107 - 5.26e-5 * t + 1.48e-7 * t * t;
  const C = -8.75e-7 + 3.9e-9 * t - 1.02e-11 * t * t;
  
  const rsw_pure = A + B * p + C * p * p;
  
  // Salinity correction (McCain 1991)
  // Rsw = Rswp * 10^( -S * m )
  const m = 0.0000001 * (0.0753 - 0.000173 * t);
  const rsw = rsw_pure * Math.pow(10, -salinity * m);
  
  return Math.max(0, rsw);
}

// --- Water Properties ---

/**
 * McCain's Water FVF (Bw)
 */
export function calculateMcCainBw(p_psi: number, t_f: number): number {
  const dvt = -1.0001e-2 + 1.33391e-4 * t_f + 5.50654e-7 * t_f * t_f;
  const bwp = 1 - (p_psi * (3.593e-7 + 1.25e-8 * t_f));
  return (1 + dvt) * (1 + 2.4e-6 * t_f) * bwp;
}

/**
 * Klinkenberg Effect: K_gas = K_inf * (1 + b / P_mean)
 * b = 0.777 * K_inf^-0.39
 */
export function calculateKlinkenberg(kAbs: number, pMean: number): number {
  if (kAbs <= 0 || pMean <= 0) return 0;
  const b = 0.777 * Math.pow(kAbs, -0.39);
  return kAbs * (1 + b / pMean);
}

/**
 * Kozeny-Carman Permeability Estimation
 * k = (phi^3 / (1 - phi)^2) * (1 / (Fs * Sv^2))
 */
export function calculateKozenyCarman(phi: number, grainSize_mm: number): number {
  if (phi >= 1 || phi <= 0) return 0;
  const Fs = 5; // Shape factor for spheres
  const Sv = 6 / grainSize_mm; // Surface area per unit volume
  const k_raw = (Math.pow(phi, 3) / Math.pow(1 - phi, 2)) * (1 / (Fs * Sv * Sv));
  return k_raw * 101325 * 1000; // Simplified conversion to mD
}

/**
 * Dynamic Rock Compressibility (Newman Correlation)
 * Cr = A / (1 + B * phi)
 */
export function calculateRockCompressibility(phi: number): number {
  return 1.442e-6 / Math.pow(phi, 1.054);
}

/**
 * MDH Time Calculation: log(dt)
 */
export function calculateMDHTime(dt: number): number {
  return Math.log10(dt);
}

/**
 * Dimensionless Pressure (Pd)
 */
export function calculatePd(dp: number, k: number, h: number, q: number, b: number, mu: number): number {
  return (k * h * dp) / (141.2 * q * b * mu);
}

/**
 * Dimensionless Time (Td)
 */
export function calculateTd(dt: number, k: number, phi: number, mu: number, ct: number, rw: number): number {
  return (0.0002637 * k * dt) / (phi * mu * ct * rw * rw);
}

/**
 * Simple Linear Regression Helper
 */
export function linearRegression(x: number[], y: number[]): { slope: number, intercept: number, r2: number } {
  const n = x.length;
  if (n === 0) return { slope: 0, intercept: 0, r2: 0 };
  
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const yMean = sumY / n;
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i++) {
    const yPred = slope * x[i] + intercept;
    ssRes += Math.pow(y[i] - yPred, 2);
    ssTot += Math.pow(y[i] - yMean, 2);
  }
  
  const r2 = 1 - (ssRes / ssTot);
  
  return { slope, intercept, r2: isNaN(r2) ? 0 : r2 };
}

/**
 * Arps Remaining Reserves Calculation
 * qi: Initial rate (STB/d)
 * qe: Economic limit rate (STB/d)
 * D: Nominal decline rate (1/day)
 * b: Hyperbolic exponent (0 to 1)
 */
export function calculateArpsRemainingReserves(qi: number, qe: number, D: number, b: number): number {
  if (qi <= qe) return 0;
  if (b === 0) {
    // Exponential
    return (qi - qe) / D;
  } else if (b === 1) {
    // Harmonic
    return (qi / D) * Math.log(qi / qe);
  } else {
    // Hyperbolic
    const term = (qi / (D * (1 - b))) * (1 - Math.pow(qe / qi, 1 - b));
    // Another common form: (qi^b / ((1-b) * Di)) * (qi^(1-b) - qe^(1-b))
    return term;
  }
}

/**
 * Superposition Time for Multi-rate Tests
 */
export function calculateSuperpositionTime(times: number[], rates: number[], t: number): number {
  let sum = 0;
  for (let i = 0; i < times.length; i++) {
    if (times[i] >= t) break;
    const qi = rates[i];
    const qi_prev = i === 0 ? 0 : rates[i - 1];
    sum += (qi - qi_prev) * Math.log10(t - times[i]);
  }
  return sum;
}

// --- Inflow Performance Relationship (IPR) ---

/**
 * Vogel's IPR for solution gas drive reservoirs
 */
export function calculateVogelQ(pwf: number, pr: number, qmax: number): number {
  if (pwf >= pr) return 0;
  const ratio = pwf / pr;
  return qmax * (1 - 0.2 * ratio - 0.8 * Math.pow(ratio, 2));
}

/**
 * Generalized IPR (Combined Darcy and Vogel)
 * Used when Pr > Pb
 */
export function calculateGeneralizedIPR(pwf: number, pr: number, pb: number, j: number): number {
  if (pwf >= pr) return 0;
  
  if (pwf >= pb) {
    // Darcy Flow
    return j * (pr - pwf);
  } else {
    // Darcy above Pb + Vogel below Pb
    const qb = j * (pr - pb);
    const qmax_vogel = (j * pb) / 1.8;
    const ratio = pwf / pb;
    return qb + qmax_vogel * (1 - 0.2 * ratio - 0.8 * Math.pow(ratio, 2));
  }
}

// --- Reserves & Economics ---

/**
 * Deterministic OOIP (Oil Originally In Place)
 * A: Area (acres)
 * h: Net pay (ft)
 * phi: Porosity (fraction)
 * sw: Water saturation (fraction)
 * bo: formation volume factor (bbl/STB)
 */
export function calculateOOIP(A: number, h: number, phi: number, sw: number, bo: number): number {
  return 7758 * A * h * phi * (1 - sw) / bo;
}

/**
 * Deterministic OGIP (Gas Originally In Place)
 * bgi: gas formation volume factor (ft3/scf)
 */
export function calculateOGIP(A: number, h: number, phi: number, sw: number, bgi: number): number {
  return 43560 * A * h * phi * (1 - sw) / bgi;
}

/**
 * Random Variable Generators for Monte Carlo
 */
export const DistGenerators = {
  triangular: (min: number, mode: number, max: number) => {
    const u = Math.random();
    const fc = (mode - min) / (max - min);
    if (u < fc) return min + Math.sqrt(u * (max - min) * (mode - min));
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  },
  normal: (mean: number, std: number) => {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * std;
  },
  lognormal: (mean: number, std: number) => {
    // Transform parameters to log space
    const variance = std * std;
    const mu = Math.log(mean / Math.sqrt(1 + variance / (mean * mean)));
    const sigma = Math.sqrt(Math.log(1 + variance / (mean * mean)));
    return Math.exp(DistGenerators.normal(mu, sigma));
  }
};

/**
 * Unit Conversion Helpers
 */
export const UnitConverter = {
  acresToHectares: (v: number) => v * 0.404686,
  hectaresToAcres: (v: number) => v / 0.404686,
  stbToCubicMeters: (v: number) => v * 0.158987,
  cubicMetersToSTB: (v: number) => v / 0.158987
};

/**
 * Improved VLP (Vertical Lift Performance)
 * Uses a simplified multiphase gradient approach instead of a linear approximation.
 * Accounting for gravity and friction with variable mixture density.
 */
export function calculateVLP(
  q_oil: number, 
  pwh: number, 
  depth: number, 
  glr: number, 
  tubingID: number,
  waterCut = 0,
  apiGravity = 35,
  gasGravity = 0.65
): number {
  if (q_oil <= 0) return pwh + (0.433 * depth); // Static column (approx)

  // Fluid densities (lb/ft3)
  const rho_water = 62.4;
  const rho_oil = 141.5 / (apiGravity + 131.5) * 62.4;
  const rho_gas_st = gasGravity * 0.0765;

  // Mass flow rate per STB of oil (lb/STB)
  // One STB oil + accompanying water + accompanying gas
  const r_wc = waterCut / (1 - waterCut); // Water-oil ratio
  const mass_stb = rho_oil * 5.615 + (r_wc * rho_water * 5.615) + (glr * rho_gas_st);

  // Approximate average pressure
  // We'll do a 2-step iteration for P_avg
  let p_avg = pwh + (0.15 * depth); // Initial guess
  let pwf = pwh;

  for (let iter = 0; iter < 2; iter++) {
    // Gas properties at P_avg (T assumed 150F for simplified VLP)
    const t_avg = 150 + 460;
    const bg = 0.00504 * t_avg / p_avg; // Approximate B_g (ft3/scf)
    
    // Total in-situ volume rate for 1 STB oil
    // Simplified: ignore Rs for VLP curve behavior (demonstration grade)
    const bo = 1.2; // Constant Bo assumption
    const vol_insitu = bo * 5.615 + (r_wc * 1.03 * 5.615) + (glr * bg); // ft3/STB
    
    // Mixture density (lb/ft3)
    const rho_mix = mass_stb / vol_insitu;
    
    // Friction (Fanning approximation for multiphase)
    // Velocity (ft/s)
    const area = (Math.PI * Math.pow(tubingID / 12, 2)) / 4;
    const q_total_ft3s = (q_oil * vol_insitu) / 86400;
    const velocity = q_total_ft3s / area;
    
    const reynolds = (rho_mix * velocity * (tubingID/12)) / (1e-3); // Simplified visc
    const f = reynolds > 0 ? 0.0055 * (1 + Math.pow(20000 * (0.001 / tubingID) + 10e6 / reynolds, 1/3)) : 0.02;
    
    const grad_total = (rho_mix / 144) + (2 * f * rho_mix * velocity * velocity) / (32.17 * (tubingID / 12) * 144);
    
    pwf = pwh + grad_total * depth;
    p_avg = (pwh + pwf) / 2;
  }

  return Math.max(pwh, pwf);
}

/**
 * Carter-Tracy Aquifer Influx Approximation
 * PD term is often approximated for infinite acting or finite radial.
 */
export function calculateCarterTracyInflux(
  tc: number, // Time from start of production
  dt: number, // Time step
  dp: number, // Pressure drop across boundary (pi - p)
  phi: number,
  rw: number,
  h: number,
  ct: number,
  k: number,
  mu: number,
  theta: number, // Degrees (360 for full circle)
  we_prev: number
): number {
  const B = 1.119 * phi * ct * Math.pow(rw, 2) * h * (theta / 360);
  const td = (0.006328 * k * tc) / (phi * mu * ct * Math.pow(rw, 2));
  
  if (td <= 0) return 0;
  
  // Simple infinite-acting PD approximation for radial
  const pd = 0.5 * (Math.log(td) + 0.80907);
  const dpd = 1 / (2 * td);
  
  const we = we_prev + (B * dp - we_prev * dpd) / (pd - td * dpd);
  return Math.max(0, we);
}

/**
 * CO2 MMP Estimation (Cronquist Correlation)
 * T: Temp in F
 * C5_plus_MW: Molecular weight of C5+ fraction (default 150-200)
 */
export function calculateCO2MMP(tempF: number, mwC5Plus = 180): number {
  return 15.988 * tempF * (0.744206 + 0.0011038 * mwC5Plus) - 3972.11;
}

/**
 * Enhanced Oil Recovery (EOR) Screening Criteria
 */
export function screenEOR(props: {
  api: number;
  viscosity: number; // cp
  depth: number; // ft
  temp: number; // F
  porosity: number;
  permeability: number; // md
  oilSat: number; // fraction
}): string[] {
  const methods = [];

  // Waterflooding
  if (props.viscosity < 100 && props.permeability > 1) methods.push("Waterflooding");

  // Polymer Flooding
  if (props.viscosity > 10 && props.viscosity < 200 && props.temp < 200) methods.push("Polymer Flooding");

  // Surfactant / ASP
  if (props.permeability > 20 && props.viscosity < 30 && props.oilSat > 0.3) methods.push("Surfactant/ASP Flooding");

  // CO2 Miscible
  if (props.api > 22 && props.viscosity < 10 && props.depth > 2500) methods.push("CO2 Miscible Injection");

  // Steam Flooding (Thermal)
  if (props.api < 25 && props.viscosity > 100 && props.depth < 3000) methods.push("Steam Flooding");

  // In-Situ Combustion
  if (props.api < 35 && props.depth > 500 && props.permeability > 50) methods.push("In-Situ Combustion");

  return methods;
}

/**
 * Fetkovich Aquifer Model (Simplified)
 * Returns the cumulative water influx We at a given step
 */
export function calculateFetkovichInflux(
  pi: number,
  p_avg_prev: number,
  p_avg_curr: number,
  wei: number,
  j: number,
  dt_days: number,
  we_prev: number
): number {
  const p_res_avg = (p_avg_prev + p_avg_curr) / 2;
  const p_aq_prev = pi * (1 - we_prev / wei);
  
  const f = (j * pi * dt_days) / wei;
  const delta_we = (wei / pi) * (p_aq_prev - p_res_avg) * (1 - Math.exp(-f));
  
  return we_prev + Math.max(0, delta_we);
}

// --- Decline Curve Analysis (DCA) ---

/**
 * Arps Exponential Decline: q = qi * e^(-D*t)
 */
export function calculateArpsExponential(qi: number, D: number, t: number): number {
  return qi * Math.exp(-D * t);
}

/**
 * Arps Hyperbolic Decline: q = qi / (1 + b*Di*t)^(1/b)
 * For 0 < b < 1
 */
export function calculateArpsHyperbolic(qi: number, Di: number, b: number, t: number): number {
  if (b === 0) return calculateArpsExponential(qi, Di, t);
  if (b === 1) return calculateArpsHarmonic(qi, Di, t);
  return qi / Math.pow(1 + b * Di * t, 1 / b);
}

/**
 * Arps Harmonic Decline: q = qi / (1 + Di*t)
 * b = 1
 */
export function calculateArpsHarmonic(qi: number, Di: number, t: number): number {
  return qi / (1 + Di * t);
}

/**
 * Cumulative Production (Np) for Exponential Decline
 */
export function calculateNpExponential(qi: number, q: number, D: number): number {
  if (D === 0) return 0;
  return (qi - q) / D;
}

/**
 * Cumulative Production (Np) for Hyperbolic Decline
 */
export function calculateNpHyperbolic(qi: number, q: number, Di: number, b: number): number {
  if (b === 1) return (qi / Di) * Math.log(qi / q);
  return (qi / (Di * (1 - b))) * (1 - Math.pow(q / qi, 1 - b));
}

/**
 * Estimated Ultimate Recovery (EUR)
 */
export function calculateEUR(qi: number, qlimit: number, Di: number, b: number): number {
  if (b === 0) return calculateNpExponential(qi, qlimit, Di);
  return calculateNpHyperbolic(qi, qlimit, Di, b);
}

/**
 * Internal Rate of Return (IRR)
 * Uses Newton's method to find r where NPV = 0
 */
export function calculateIRR(cashFlows: number[], initialGuess = 0.1, maxIter = 100): number {
  let rate = initialGuess;
  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let dNPV = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const discountFac = Math.pow(1 + rate, t);
      npv += cashFlows[t] / discountFac;
      if (t > 0) {
        dNPV -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
      }
    }
    
    if (Math.abs(npv) < 1e-4) return rate;
    if (Math.abs(dNPV) < 1e-10) break;
    
    const nextRate = rate - npv / dNPV;
    if (Math.abs(nextRate - rate) < 1e-6) return nextRate;
    rate = nextRate;
  }
  return rate;
}

/**
 * Payout Period
 * Time in years until cumulative cash flow becomes positive
 */
export function calculatePayout(cashFlows: number[]): number {
  let cumulative = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    const prev = cumulative;
    cumulative += cashFlows[t];
    if (prev < 0 && cumulative >= 0) {
      // Linear interpolation for more precise payout within the year/month
      const fraction = -prev / (cumulative - prev);
      return t + fraction;
    }
  }
  return cumulative < 0 ? -1 : cashFlows.length;
}

/**
 * Profitability Index (PI)
 * PI = NPV(positive flows) / |NPV(negative flows)|
 */
export function calculatePI(cashFlows: number[], discountRate: number): number {
  let posNPV = 0;
  let negNPV = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    const pv = cashFlows[t] / Math.pow(1 + discountRate, t);
    if (pv > 0) posNPV += pv;
    else negNPV += Math.abs(pv);
  }
  return negNPV === 0 ? Infinity : posNPV / negNPV;
}

/**
 * Production Sharing Contract (PSC) simplified model
 * returns { contractorNCF, govtTake, costOilRecovered }
 */
export function calculatePSCFiscal(
  grossRevenue: number,
  opex: number,
  capex: number,
  royaltyRate: number,
  costRecoveryLimit: number, // fraction
  contractorProfitSplit: number, // fraction
  taxRate: number
) {
  const royalty = grossRevenue * royaltyRate;
  const netRevenue = grossRevenue - royalty;
  
  // Cost Recovery
  const costAvailable = opex + capex;
  const costRecoveryPool = netRevenue * costRecoveryLimit;
  const costOilRecovered = Math.min(costAvailable, costRecoveryPool);
  
  // Profit Oil
  const profitOil = netRevenue - costOilRecovered;
  const contractorProfitOil = profitOil * contractorProfitSplit;
  const govtProfitOil = profitOil * (1 - contractorProfitSplit);
  
  // Tax
  const contractorTaxable = contractorProfitOil; // Simplified
  const tax = contractorTaxable * taxRate;
  
  const contractorNCF = costOilRecovered + contractorProfitOil - tax - costAvailable;
  const govtTake = royalty + govtProfitOil + tax;
  
  return { contractorNCF, govtTake, costOilRecovered, profitOil };
}

/**
 * R-Factor Calculation
 */
export function calculateRFactor(cumRevenue: number, cumCapex: number): number {
  if (cumCapex === 0) return 0;
  return cumRevenue / cumCapex;
}

/**
 * Reserves Replacement Ratio (RRR)
 * rrr = (extensions + discoveries + improvedRecovery + revisions) / production
 */
export function calculateRRR(changes: number, production: number): number {
  if (production === 0) return 0;
  return changes / production;
}

/**
 * Reserves Life Index (RLI)
 * rli = remainingReserves / annualProduction
 */
export function calculateRLI(remainingReserves: number, annualProduction: number): number {
  if (annualProduction === 0) return Infinity;
  return remainingReserves / annualProduction;
}

/**
 * Finding and Development Cost (F&D)
 * fd = capex / reservesAdditions
 */
export function calculateFD(capex: number, additions: number): number {
  if (additions === 0) return 0;
  return capex / additions;
}

/**
 * Unit Technical Cost (UTC)
 * utc = (capex + opex) / totalEUR
 */
export function calculateUTC(totalCapex: number, totalOpex: number, totalEUR: number): number {
  if (totalEUR === 0) return 0;
  return (totalCapex + totalOpex) / totalEUR;
}

/**
 * Radius of Investigation
 * ri = sqrt(k*t / (948 * phi * mu * ct))
 * k: permeability (md)
 * t: time (hours)
 * phi: porosity (fraction)
 * mu: viscosity (cp)
 * ct: total compressibility (1/psi)
 */
export function calculateRadiusOfInvestigation(k: number, t: number, phi: number, mu: number, ct: number): number {
  if (phi === 0 || mu === 0 || ct === 0) return 0;
  return Math.sqrt((k * t) / (948 * phi * mu * ct));
}

/**
 * Drainage Radius from Area
 * r = sqrt(Area / PI)
 * Area in acres, result in ft
 */
export function calculateDrainageRadius(areaAcres: number): number {
  // 1 acre = 43560 sq ft
  const areaSqFt = areaAcres * 43560;
  return Math.sqrt(areaSqFt / Math.PI);
}

/**
 * Recovery Factor Estimation
 * Simplified model based on drive mechanism and reservoir type
 */
export function estimateRecoveryFactor(drive: string, fluidType: string): { min: number, max: number, avg: number } {
  const drives: Record<string, { min: number, max: number }> = {
    'Solution Gas': { min: 0.05, max: 0.15 },
    'Gas Cap': { min: 0.15, max: 0.25 },
    'Water Drive (Strong)': { min: 0.30, max: 0.50 },
    'Water Drive (Moderate)': { min: 0.20, max: 0.35 },
    'Gravity Drainage': { min: 0.40, max: 0.80 },
    'Gas Depletion': { min: 0.60, max: 0.85 }
  };

  const base = drives[drive] || { min: 0.1, max: 0.3 };
  
  if (fluidType === 'Heavy Oil') {
    return { min: base.min * 0.5, max: base.max * 0.5, avg: (base.min + base.max) * 0.25 };
  }
  
  return { min: base.min, max: base.max, avg: (base.min + base.max) / 2 };
}

/**
 * Drilling Schedule Generator
 */
export function generateDrillingSchedule(numRigs: number, daysPerWell: number, totalWells: number, startDate: Date) {
  const schedule = [];
  const currentRigDates = new Array(numRigs).fill(new Date(startDate));
  
  for (let i = 0; i < totalWells; i++) {
    // Find the rig that becomes free earliest
    let earliestRigIdx = 0;
    for (let r = 1; r < numRigs; r++) {
      if (currentRigDates[r] < currentRigDates[earliestRigIdx]) {
        earliestRigIdx = r;
      }
    }
    
    const startTime = new Date(currentRigDates[earliestRigIdx]);
    const endTime = new Date(startTime);
    endTime.setDate(endTime.getDate() + daysPerWell);
    
    schedule.push({
      wellId: i + 1,
      rigId: earliestRigIdx + 1,
      start: startTime,
      end: endTime
    });
    
    currentRigDates[earliestRigIdx] = new Date(endTime);
  }
  
  return schedule;
}

/**
 * Souders-Brown Liquid/Gas Separation
 * Vt = K * sqrt((rhoL - rhoG) / rhoG)
 */
export function calculateSoudersBrown(kValue: number, rhoL: number, rhoG: number): number {
  if (rhoG === 0) return 0;
  return kValue * Math.sqrt((rhoL - rhoG) / rhoG);
}

/**
 * Adiabatic Compression Horsepower
 * HP = (P1 * Q1 / 33000) * (k / (k-1)) * ((P2/P1)^((k-1)/k) - 1)
 * Simplified form for quick estimate
 */
export function calculateCompressionHP(qMMcfd: number, pSuction: number, pDischarge: number, k: number = 1.3): number {
  if (pSuction <= 0 || qMMcfd <= 0) return 0;
  const ratio = pDischarge / pSuction;
  
  /**
   * Adiabatic Horsepower Equation (Field Units):
   * HP = 0.0642 * Q_mmcfd * (T_suction/520) * (k/(k-1)) * [(P2/P1)^((k-1)/k) - 1]
   * Assuming T_suction = 520R (60F) for standard calculation
   */
  const factor = (k / (k - 1)) * (Math.pow(ratio, (k - 1) / k) - 1);
  const hpPerMmcfd = 14.7 * 144 * (1e6 / 1440) / 33000; // ~44.54
  
  return qMMcfd * hpPerMmcfd * factor;
}

/**
 * ESP Stage Requirements
 * tdh = friction + elevation + surface_pressure
 */
export function calculateESPStages(tdh: number, headPerStage: number): number {
  if (headPerStage <= 0) return 0;
  return Math.ceil(tdh / headPerStage);
}

/**
 * Hammerschmidt Equation for Hydrate Inhibitor
 * deltaT = (2335 * W) / (Mw * (100 - W))
 * deltaT: temperature depression (F)
 * W: weight % of inhibitor
 * Mw: molecular weight of inhibitor (MeOH=32.04, MEG=62.07)
 */
export function calculateInhibitorDepression(W: number, Mw: number): number {
  if (W >= 100) return 0;
  return (2335 * W) / (Mw * (100 - W));
}

/**
 * API RP 14E Erosional Velocity
 * Ve = C / sqrt(rho_mix)
 * C: empirical constant (typically 100 for continuous, 125 for intermittent)
 * rho_mix: fluid mixture density (lb/ft3)
 */
export function calculateErosionalVelocity(C: number, rhoMix: number): number {
  if (rhoMix <= 0) return 0;
  return C / Math.sqrt(rhoMix);
}

/**
 * Voidage Replacement Ratio (VRR)
 */
export function calculateVRR(injRate: number, prodRate: number, bo: number, gOR: number, bg: number): number {
  const totalVoidage = prodRate * bo; // Simplified
  if (totalVoidage === 0) return 0;
  return injRate / totalVoidage;
}

/**
 * Hall Plot cumulative value
 * Sum of (P_inj - P_res) * delta_t / 1000
 */
export function calculateHallPlotPoint(prevHall: number, pInj: number, pRes: number, days: number): number {
  return prevHall + ((pInj - pRes) * days) / 1000;
}

/**
 * Moving Average Smoothing
 */
export function movingAverage(data: number[], window: number): number[] {
  if (window <= 1) return data;
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(window / 2));
    const end = Math.min(data.length, i + Math.ceil(window / 2));
    const slice = data.slice(start, end);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    result.push(avg);
  }
  return result;
}

/**
 * Vogel Back-calculation for Qmax
 * q = qmax * (1 - 0.2*(Pwf/Pr) - 0.8*(Pwf/Pr)^2)
 */
export function calculateVogelQmax(q: number, pwf: number, pr: number): number {
  if (pr <= 0) return 0;
  const ratio = pwf / pr;
  const factor = 1 - 0.2 * ratio - 0.8 * Math.pow(ratio, 2);
  if (factor <= 0) return q; // Undefined behavior if pwf > pr
  return q / factor;
}

/**
 * Production Allocation Factor
 * Distributes total measured production based on well tests
 */
export function calculateAllocationFactor(totalMeasured: number, sumOfWellTests: number): number {
  if (sumOfWellTests === 0) return 0;
  return totalMeasured / sumOfWellTests;
}

/**
 * Beam Pump Displacement (STB/D)
 * PD = 0.1166 * Ap * S * N
 */
export function calculateBeamPumpDisplacement(ap: number, s: number, n: number): number {
  return 0.1166 * ap * s * n;
}

/**
 * ESP Motor Horsepower
 */
export function calculateESPMotorHP(rate: number, tdh: number, sg: number, efficiency: number): number {
  if (efficiency <= 0) return 0;
  return (rate * tdh * sg) / (3960 * efficiency);
}

/**
 * Dimensionless Fracture Conductivity (FCD)
 * FCD = (kf * w) / (k * xf)
 */
export function calculateFCD(kf: number, w: number, k: number, xf: number): number {
  if (k === 0 || xf === 0) return 0;
  // w should be in ft, kf in md, k in md, xf in ft
  return (kf * w) / (k * xf);
}

/**
 * NPV of Well Intervention
 * incrementalRevenueSum: sum of discounted incremental cash flows
 */
export function calculateInterventionNPV(incrementalRevenueSum: number, interventionCost: number): number {
  return incrementalRevenueSum - interventionCost;
}

/**
 * Langelier Saturation Index (LSI)
 * Rough approximation for Calcite scaling tendency
 */
export function calculateLSI(ph: number, tempF: number, calcium: number, alkalinity: number, tds: number): number {
  const pK2_pK8 = 2.4; // Simplified constant
  const logCa = Math.log10(calcium);
  const logAlk = Math.log10(alkalinity);
  const logTDS = Math.log10(tds);
  
  // Very simplified pHs calculation
  const phs = (9.3 + logTDS - 0.1) - (logCa + logAlk); 
  return ph - phs;
}

/**
 * Choke Performance (Gilbert Correlation)
 * Pwh = (C * q * GLR^m) / S^n
 * Solving for q: q = (Pwh * S^n) / (C * GLR^m)
 */
export function calculateChokeFlow(pwh: number, size64ths: number, glr: number): number {
  const c = 3.86;
  const m = 0.546;
  const n = 1.89;
  if (glr <= 0) return 0;
  return (pwh * Math.pow(size64ths, n)) / (c * Math.pow(glr, m));
}

/**
 * Scale Squeeze Treatment Volume
 * V_total = V_overflush + V_inhibitor
 */
export function calculateSqueezeVolume(radius: number, thickness: number, porosity: number): number {
  const pi = Math.PI;
  const bulkVolume = pi * Math.pow(radius, 2) * thickness;
  return bulkVolume * porosity * 5.615 * 42; // gallons
}

/**
 * Pipeline Remaining Life (Years)
 */
export function calculatePipelineRemainingLife(t_measured: number, t_min: number, corrosionRate: number): number {
  if (corrosionRate <= 0) return 99; // Assume indefinite if no corrosion
  const life = (t_measured - t_min) / corrosionRate;
  return Math.max(0, life);
}

/**
 * MAOP Calculator (ASME B31.8)
 * P = (2 * S * t / D) * F * E * T
 * Assuming E=1, T=1 for simplicity
 */
export function calculateMAOP(smys: number, wallThickness: number, diameter: number, classFactor: number): number {
  if (diameter <= 0) return 0;
  return (2 * smys * wallThickness / diameter) * classFactor;
}

/**
 * Relief Valve Orifice Area (API 520 - Simplified Liquid)
 * A = (Q * sqrt(SG)) / (38 * Kd * Kw * Kc * Kv * sqrt(P1 - P2))
 */
export function calculateReliefAreaLiquid(q_gpm: number, sg: number, p_set: number, p_back: number): number {
  const kd = 0.62; // Standard discharge coefficient
  const diffP = p_set - p_back;
  if (diffP <= 0) return 0;
  return (q_gpm * Math.sqrt(sg)) / (38 * kd * Math.sqrt(diffP));
}

/**
 * Net Present Value (NPV)
 * cashFlows: array of monthly or yearly cash flows
 * discountRate: annual rate (e.g., 0.10 for 10%)
 * isMonthly: if true, discount rate is adjusted to monthly
 */
export function calculateNPV(cashFlows: number[], discountRate: number, isMonthly = true): number {
  const r = isMonthly ? Math.pow(1 + discountRate, 1/12) - 1 : discountRate;
  return cashFlows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + r, i), 0);
}

/**
 * Buckley-Leverett Fractional Flow (fw)
 * mu_ratio = mu_o / mu_w
 * krw, kro: relative permeabilities at saturation Sw
 */
export function calculateFractionalFlow(krw: number, kro: number, mu_o: number, mu_w: number): number {
  if (krw <= 0) return 0;
  const mu_ratio = mu_w / mu_o; // Note: industry standard is often defined as mu_w / mu_o in the denominator
  return 1 / (1 + (kro / krw) * mu_ratio);
}

/**
 * Corey Relative Permeability
 */
export function calculateCoreyKr(sw: number, swc: number, sor: number, krw_max: number, kro_max: number, nw: number, no: number): { krw: number, kro: number } {
  if (sw <= swc) return { krw: 0, kro: kro_max };
  if (sw >= 1 - sor) return { krw: krw_max, kro: 0 };
  
  const sw_star = (sw - swc) / (1 - swc - sor);
  return {
    krw: krw_max * Math.pow(sw_star, nw),
    kro: kro_max * Math.pow(1 - sw_star, no)
  };
}

/**
 * Dykstra-Parsons Coefficient (V)
 * k_values: Array of permeability measurements
 */
export function calculateDykstraParsons(k_values: number[]): number {
  if (k_values.length < 2) return 0;
  const sorted = [...k_values].sort((a, b) => b - a);
  // Using simplified 84.1% and 50% points on log-normal distribution
  const n = sorted.length;
  const idx50 = Math.floor(n * 0.5);
  const idx84 = Math.floor(n * 0.841);
  
  const k50 = sorted[idx50];
  const k84 = sorted[idx84] || sorted[n - 1];
  
  return (k50 - k84) / k50;
}

/**
 * Pressure Transient Analysis (PTA) ---
 */

/**
 * Line Source Solution (Constant Rate Drawdown)
 * Pwf = Pi - (162.6 * q * B * mu / (k * h)) * [log(t) + log(k / (phi * mu * ct * rw^2)) - 3.23 + 0.87s]
 */
export function calculateDrawdownPwf(
  pi: number,
  q: number,
  b: number,
  mu: number,
  k: number,
  h: number,
  phi: number,
  ct: number,
  rw: number,
  s: number,
  t: number
): number {
  const slope = (162.6 * q * b * mu) / (k * h);
  const skinTerm = 0.87 * s;
  const logTerm = Math.log10(k / (phi * mu * ct * rw * rw)) - 3.23;
  return pi - slope * (Math.log10(t) + logTerm + skinTerm);
}

/**
 * Horner Time Calculation: (tp + dt) / dt
 */
export function calculateHornerTime(tp: number, dt: number): number {
  return (tp + dt) / dt;
}

/**
 * Permeability from Horner Slope 'm'
 * k = (162.6 * q * B * mu) / (m * h)
 */
export function calculateKFromSlope(q: number, b: number, mu: number, h: number, m: number): number {
  return Math.abs((162.6 * q * b * mu) / (m * h));
}

/**
 * Skin factor from Horner Plot
 * s = 1.151 * [(P1hr - Pwf_at_delta_t_0) / m - log(k / (phi * mu * ct * rw^2)) + 3.23]
 */
export function calculateSkinFromHorner(
  p1hr: number,
  pwf_at_0: number,
  m: number,
  k: number,
  phi: number,
  mu: number,
  ct: number,
  rw: number
): number {
  const term1 = (Math.abs(p1hr - pwf_at_0)) / Math.abs(m);
  const term2 = Math.log10(k / (phi * mu * ct * rw * rw));
  return 1.151 * (term1 - term2 + 3.23);
}

/**
 * Bourdet Pressure Derivative
 * t * dp/dt = t_i * [ (dp_i / (ln(t_i) - ln(t_{i-1}))) * (ln(t_{i+1}) - ln(t_i)) + ... ]
 * Simplified central difference for local points
 */
export function calculateBourdetDerivative(t: number[], p: number[]): number[] {
  const derivative = new Array(t.length).fill(0);
  for (let i = 1; i < t.length - 1; i++) {
    const dt1 = Math.log(t[i]) - Math.log(t[i - 1]);
    const dt2 = Math.log(t[i + 1]) - Math.log(t[i]);
    const dp1 = (p[i] - p[i - 1]) / dt1;
    const dp2 = (p[i + 1] - p[i]) / dt2;
    // Central weighted derivative
    derivative[i] = t[i] * (dp1 * dt2 + dp2 * dt1) / (dt1 + dt2);
  }
  // Fill edges
  derivative[0] = derivative[1];
  derivative[t.length - 1] = derivative[t.length - 2];
  return derivative;
}

/**
 * Duong Model for Tight/Shale Reservoirs
 * q = qi * t^-a * e^(b/(1-a) * (t^(1-a)-1))
 */
export function calculateDuongRate(t: number, a: number, m: number, qi: number): number {
    return qi * Math.pow(t, -a) * Math.exp((m / (1 - a)) * (Math.pow(t, 1 - a) - 1));
}

/**
 * Stretched Exponential Production Decline (SEPD)
 * q = qi * exp(-(t/tau)^n)
 */
export function calculateSEPD(t: number, qi: number, tau: number, n: number): number {
    return qi * Math.exp(-Math.pow(t / tau, n));
}

/**
 * Hawkins Formula for Skin
 * s = (k / ks - 1) * ln(rs / rw)
 */
export function calculateHawkinsSkin(k: number, ks: number, rs: number, rw: number): number {
    if (ks === 0 || rw === 0) return 0;
    return (k / ks - 1) * Math.log(rs / rw);
}

/**
 * PKN Fracture Geometry (Single Wing Length)
 * L = (q * mu / (E' * h)) * ... (Simplified version for app)
 */
export function estimatePKNLength(q: number, mu: number, h: number, ePrime: number, t: number): number {
    // Highly simplified PKN approx
    return 0.5 * Math.pow((q * mu * Math.pow(t, 3)) / (ePrime * h), 0.2);
}

/**
 * Peaceman Wellbore Equivalent Radius
 * ro = 0.28 * sqrt( (ky/kx)^0.5 * dx^2 + (kx/ky)^0.5 * dy^2 ) / [ (ky/kx)^0.25 + (kx/ky)^0.25 ]
 */
export function calculatePeacemanRadius(dx: number, dy: number, kx: number, ky: number): number {
    const k_ratio = ky / kx;
    const inv_k_ratio = 1 / k_ratio;
    
    const numerator = 0.28 * Math.sqrt(Math.pow(k_ratio, 0.5) * dx * dx + Math.pow(inv_k_ratio, 0.5) * dy * dy);
    const denominator = Math.pow(k_ratio, 0.25) + Math.pow(inv_k_ratio, 0.25);
    
    return numerator / denominator;
}

/**
 * Spherical Variogram Model
 * gamma(h) = nugget + sill * [ 1.5 * (h/range) - 0.5 * (h/range)^3 ] if h < range
 */
export function calculateSphericalVariogram(h: number, nugget: number, sill: number, range: number): number {
    if (h <= 0) return 0;
    if (h >= range) return nugget + sill;
    const hr = h / range;
    return nugget + sill * (1.5 * hr - 0.5 * Math.pow(hr, 3));
}

/**
 * Simple Kriging Weight Approximation (Conceptual for UI)
 * Returns a weight based on distance and variogram
 */
export function estimateKrigingWeight(dist: number, range: number): number {
    return Math.max(0, 1 - (dist / range));
}

/**
 * Carter-Tracy Aquifer Influence Function Approximation
 * delta_Wp = B * sum(delta_p * Wp_D)
 */
export function calculateCarterTracyInfluence(time: number, tD_const: number): number {
    // Simplified tD influence
    return Math.log(1 + time * tD_const);
}

/**
 * Gas Lift Injection Rate Estimation
 * q_gl = (q_target * (GLR_target - GLR_formation))
 */
export function estimateGasLiftInjection(q_liquid: number, glr_target: number, glr_form: number): number {
    return q_liquid * Math.max(0, glr_target - glr_form);
}

// --- Waterflooding (Secondary Recovery) ---

/**
 * Waterflooding: Mobility Ratio (M)
 * M = (krw / mu_w) / (kro / mu_o)
 */
export function calculateMobilityRatio(krw: number, kro: number, mu_w: number, mu_o: number): number {
    if (kro === 0 || mu_w === 0) return 999;
    return (krw / mu_w) / (kro / mu_o);
}

/**
 * Waterflooding: Areal Sweep Efficiency (Ea) - 5-spot pattern approximation at breakthrough
 */
export function calculateArealSweepFiveSpot(mobilityRatio: number): number {
    if (mobilityRatio <= 0) return 1.0;
    const ea = 0.714 / Math.pow(mobilityRatio, 0.4);
    return Math.min(1.0, Math.max(0.1, ea));
}

/**
 * Waterflooding: Stiles Method Approximation for Stratified Reservoirs
 */
export function calculateStilesMethod(layers: { k: number, h: number }[], mu_w: number, mu_o: number): { recoveryFraction: number, waterCut: number } {
    if (layers.length === 0) return { recoveryFraction: 0, waterCut: 0 };
    
    const k_values = layers.map(l => l.k);
    const vdp = calculateDykstraParsons(k_values);
    
    // Heuristic approximation of recovery vs heterogeneity
    const recoveryFraction = Math.max(0.1, 0.6 * (1 - vdp));
    const waterCut = Math.min(0.99, vdp * 0.8 + (mu_w / mu_o) * 0.1);

    return { recoveryFraction, waterCut };
}

// --- Chemical & Gas EOR (Phase 3 & 4) ---

/**
 * Capillary Number (Nc)
 * Nc = (v * mu) / sigma
 */
export function calculateCapillaryNumber(velocity: number, viscosity: number, ift: number): number {
    if (ift <= 0) return Infinity;
    return (velocity * viscosity) / ift;
}

/**
 * Resistance Factor (RF) for Polymer
 */
export function calculateResistanceFactor(lambdaWater: number, lambdaPolymer: number): number {
    if (lambdaPolymer === 0) return Infinity;
    return lambdaWater / lambdaPolymer;
}

/**
 * Residual Resistance Factor (RRF) for Polymer
 */
export function calculateResidualResistanceFactor(kWaterInitial: number, kWaterAfter: number): number {
    if (kWaterAfter === 0) return Infinity;
    return kWaterInitial / kWaterAfter;
}

/**
 * Chun Huh Equation for IFT (Surfactant)
 * IFT = C / (solubilizationRatio^2)
 * C is typically around 0.3 mN/m
 */
export function calculateChunHuhIFT(solubilizationRatio: number, c = 0.3): number {
    if (solubilizationRatio <= 0) return 30; // Base water-oil IFT
    return c / Math.pow(solubilizationRatio, 2);
}

/**
 * Yellig-Metcalfe CO2 MMP Correlation
 * T in °F
 */
export function calculateYelligMetcalfeMMP(tempF: number): number {
    const t = tempF;
    if (t < 95) return calculateYelligMetcalfeMMP(95); // Valid for T > 95F
    return 1833.717 + 2.2518 * t + 0.018 * t * t - 103949.93 / t;
}

/**
 * Holm-Josendal CO2 MMP Correlation (Analytical Approximation)
 * Simplified fit for UI comparison based on Temp and MW C5+
 */
export function calculateHolmJosendalMMP(tempF: number, mwC5: number): number {
    // Highly simplified polynomial approximation of the Holm-Josendal curves
    const tBase = tempF - 100;
    const mwBase = mwC5 - 150;
    return 1200 + 12.5 * tBase + 8.5 * mwBase + 0.05 * tBase * tBase;
}

// --- Thermal & Microbial EOR (Phase 5 & 6) ---

/**
 * Simplified Butler SAGD Rate Approximation
 * q = proportional to sqrt(k * h^3 / mu_oil_steam_temp)
 * UI placeholder demonstrating rate dependence on perm and heavy oil vis reduction
 */
export function calculateSAGDRate(k: number, h: number, muOilHeated: number): number {
    if (muOilHeated <= 0) return 0;
    // Arbitrary constant for reasonable STB/day
    return 0.5 * Math.sqrt((k * Math.pow(h, 3)) / muOilHeated);
}

/**
 * Marx-Langenheim Heat Loss Area (dimensionless time proxy)
 * tD = (4 * thermal_diffusivity * t) / h^2
 */
export function calculateMarxLangenheimArea(timeDays: number, thickness: number, alpha = 0.5): number {
    if (thickness <= 0) return 0;
    const tD = (4 * alpha * (timeDays / 365)) / Math.pow(thickness, 2);
    // Return a simplified heating efficiency proxy
    return Math.exp(-tD) * Math.sqrt(tD); 
}

