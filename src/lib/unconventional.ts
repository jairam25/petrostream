/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * TOC estimation using Passey ΔlogR method
 * @param R Resistivity log value (ohm-m)
 * @param R_baseline Resistivity baseline in non-source rock (ohm-m)
 * @param dt Sonic transit time (μs/ft)
 * @param dt_baseline Sonic baseline in non-source rock (μs/ft)
 * @param LOM Level of Organic Maturity
 * @returns Estimated TOC percentage
 */
export function calculateTOCPassey(
  R: number,
  R_baseline: number,
  dt: number,
  dt_baseline: number,
  LOM: number
): number {
  const dLogR = Math.log10(R / R_baseline) + 0.02 * (dt - dt_baseline);
  const TOC = dLogR * Math.pow(10, 2.297 - 0.1688 * LOM);
  return Math.max(0, TOC);
}

/**
 * Brittleness Index using Rickman's method
 * @param E Young's Modulus (GPa or psi)
 * @param nu Poisson's Ratio
 * @param E_min Minimum Young's Modulus in the formation
 * @param E_max Maximum Young's Modulus in the formation
 * @param nu_min Minimum Poisson's Ratio
 * @param nu_max Maximum Poisson's Ratio
 * @returns Brittleness Index (0 to 1)
 */
export function calculateBrittlenessIndex(
  E: number,
  nu: number,
  E_min: number,
  E_max: number,
  nu_min: number,
  nu_max: number
): number {
  const E_brit = (E - E_min) / (E_max - E_min);
  const nu_brit = (nu_max - nu) / (nu_max - nu_min);
  return (E_brit + nu_brit) / 2;
}

/**
 * Dynamic Geomechanical Properties from sonic logs
 * @param rho Density (g/cc)
 * @param Vp P-wave velocity (m/s or ft/s)
 * @param Vs S-wave velocity (m/s or ft/s)
 * @returns Object with dynamic Young's Modulus and Poisson's Ratio
 */
export function calculateDynamicProperties(
  rho: number,
  Vp_fps: number,
  Vs_fps: number
) {
  // Convert ft/s to m/s
  const Vp = Vp_fps * 0.3048;
  const Vs = Vs_fps * 0.3048;
  const rho_si = rho * 1000; // g/cc to kg/m3

  const nu = (Math.pow(Vp, 2) - 2 * Math.pow(Vs, 2)) / (2 * (Math.pow(Vp, 2) - Math.pow(Vs, 2)));
  const E_dyn = rho_si * Math.pow(Vs, 2) * (3 * Math.pow(Vp, 2) - 4 * Math.pow(Vs, 2)) / (Math.pow(Vp, 2) - Math.pow(Vs, 2));
  
  return {
    dynamicYoungsModulus: E_dyn / 1e9, // GPa
    dynamicPoissonsRatio: Math.max(0, Math.min(0.5, nu))
  };
}

/**
 * Minimum horizontal stress profile using modified Eaton model
 * @param nu Poisson's Ratio
 * @param Sv Overburden stress (psi)
 * @param Pp Pore pressure (psi)
 * @param alpha Biot's coefficient (usually ~1.0)
 * @param eps_h Minimum tectonic strain
 * @param eps_H Maximum tectonic strain
 * @param E Static Young's Modulus (psi)
 * @returns Minimum horizontal stress (psi)
 */
export function calculateHorizontalStress(
  nu: number,
  Sv: number,
  Pp: number,
  alpha: number,
  eps_h: number,
  eps_H: number,
  E: number
): number {
  const term1 = (nu / (1 - nu)) * (Sv - alpha * Pp) + alpha * Pp;
  const term2 = (eps_h * E) / (1 - Math.pow(nu, 2));
  const term3 = (eps_H * nu * E) / (1 - Math.pow(nu, 2));
  return term1 + term2 + term3;
}

/**
 * Pore pressure estimation using Bowers method
 * @param V Velocity (ft/s)
 * @param sigma_v Vertical stress (psi)
 * @param V_normal Normal compaction velocity (ft/s)
 * @param A Bowers coefficient A
 * @param B Bowers coefficient B
 * @returns Pore pressure (psi)
 */
export function calculatePorePressureBowers(
  V: number,
  sigma_v: number,
  V0: number, // surface velocity
  A: number,
  B: number
): number {
  // Effective stress sigma_e = ((V - V0) / A)^(1/B)
  const sigma_e = Math.pow((V - V0) / A, 1 / B);
  return sigma_v - sigma_e;
}

/**
 * Economic optimization for lateral length
 * @param length Lateral length (ft)
 * @param drillingCostBase Base cost for drilling
 * @param drillingCostPerFoot Extra cost per foot (linear)
 * @param completionCostPerFoot Cost per stage
 * @param stageSpacing Distance between stages
 * @param eurPerFoot Expected EUR per lateral foot
 * @param price Price of resource
 */
export function calculateLateralEconomics(
  length: number,
  drillingCostBase: number,
  drillingCostPerFoot: number,
  completionCostPerFoot: number,
  stageSpacing: number,
  eurPerFoot: number,
  price: number
) {
  const drillingCost = drillingCostBase + (length * drillingCostPerFoot);
  const stages = Math.floor(length / stageSpacing);
  const completionCost = stages * completionCostPerFoot;
  const totalCost = drillingCost + completionCost;
  
  const totalEUR = length * eurPerFoot;
  const revenue = totalEUR * price;
  const npv_simple = revenue - totalCost;
  
  return {
    totalCost,
    totalEUR,
    revenue,
    npv_simple,
    costPerFoot: totalCost / length
  };
}

/**
 * PKN Fracture Model - Maximum Width at wellbore
 * @param qi Injection rate (bpm)
 * @param mu Fluid viscosity (cP)
 * @param xf Fracture half-length (ft)
 * @param G_prime Plane strain modulus (psi)
 * @returns Maximum width at wellbore (inches)
 */
export function calculatePKNWidth(
  qi: number,
  mu: number,
  xf: number,
  G_prime: number
): number {
  // Convert cP to lb-s/ft^2 or similar if needed, but the formula provided is specific:
  // wmax = 2.53 * ((qi * mu * xf) / G')^0.25 (assuming consistent units or specific empirical ones)
  // Let's assume the provided formula handles conversions for common field units.
  return 2.53 * Math.pow((qi * mu * xf) / G_prime, 0.25);
}

/**
 * Proppant settling velocity (Stokes Law modified)
 * @param dp Proppant diameter (mm)
 * @param rho_p Proppant density (g/cc)
 * @param rho_f Fluid density (g/cc)
 * @param mu_app Apparent viscosity (cP)
 * @returns Settling velocity (ft/s)
 */
export function calculateProppantSettlingVelocity(
  dp: number,
  rho_p: number,
  rho_f: number,
  mu_app: number
): number {
  const g = 32.17; // ft/s^2
  const dp_ft = (dp / 1000) * 3.28084;
  const rho_p_field = rho_p * 62.4;
  const rho_f_field = rho_f * 62.4;
  const mu_lb = mu_app * 0.00067197; // cP to lb/(ft*s)
  
  return (Math.pow(dp_ft, 2) * (rho_p_field - rho_f_field) * g) / (18 * mu_lb);
}

/**
 * Dimensionless Fracture Conductivity (FCD)
 * @param kf Proppant pack permeability (mD)
 * @param w Fracture width (ft)
 * @param k Reservoir permeability (mD)
 * @param xf Fracture half-length (ft)
 * @returns FCD
 */
export function calculateFCD(
  kf: number,
  w: number,
  k: number,
  xf: number
): number {
  return (kf * w) / (k * xf);
}

/**
 * Stress Shadow Effect (Sneddon Equation)
 * @param pNet Net pressure (psi)
 * @param w Fracture width (ft)
 * @param r Distance from fracture (ft)
 * @returns Stress shadow magnitude (psi)
 */
export function calculateStressShadow(
  pNet: number,
  w: number,
  r: number
): number {
  return (pNet * w) / (Math.PI * r);
}

/**
 * Perforation Friction
 * @param q Flow rate per stage (bpm)
 * @param rho Fluid density (ppg)
 * @param n Number of perforations
 * @param d Perforation diameter (inches)
 * @param cd Discharge coefficient
 * @returns Pressure drop (psi)
 */
export function calculatePerfFriction(
  q: number,
  rho: number,
  n: number,
  d: number,
  cd: number
): number {
  return (0.2369 * Math.pow(q, 2) * rho) / (Math.pow(n, 2) * Math.pow(d, 4) * Math.pow(cd, 2));
}

/**
 * Parent-Child Production Interference Estimation
 * @param spacing Well spacing (ft)
 * @param depletionYears Time since parent well start (years)
 * @param parentRecoveryFactor Recovery factor of parent well (0 to 1)
 * @returns Estimated percentage loss on child well EUR vs parent
 */
export function estimateParentChildInterference(
  spacing: number,
  depletionYears: number,
  parentRecoveryFactor: number
): number {
  // Empirical simplification: closer spacing and higher depletion = more interference
  const spacingFactor = Math.max(0, (1000 - spacing) / 1000);
  const depletionFactor = Math.min(1, depletionYears / 5) * parentRecoveryFactor;
  return spacingFactor * depletionFactor * 0.5 * 100; // Result in %
}

/**
 * Gutenberg-Richter b-value calculation
 * @param magnitudes Array of event magnitudes
 * @returns b-value (slope of log frequency vs magnitude)
 */
export function calculateBValue(magnitudes: number[]): number {
  if (magnitudes.length < 5) return 1.0;
  const minMag = Math.min(...magnitudes);
  const avgMag = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
  // Maximum likelihood estimate for continuous data: b = log10(e) / (avgM - Mmin)
  // For binned data: b = log10(e) / (avgM - (Mmin - deltaM/2))
  const b = Math.log10(Math.E) / Math.max(0.01, (avgMag - minMag));
  return Math.min(2.5, Math.max(0.5, b));
}

/**
 * Fracture Complexity Index (FCI)
 * @param events Array of (x, y) coordinates
 * @param azimuth Fracture azimuth in degrees
 * @returns FCI (0 to 1, higher is more complex)
 */
export function calculateFractureComplexity(
  events: { x: number; y: number }[],
  azimuth: number
): number {
  if (events.length < 2) return 0;
  
  // Rotate coordinates to align with azimuth
  const rad = (azimuth * Math.PI) / 180;
  const rotated = events.map(e => ({
    l: e.x * Math.cos(rad) + e.y * Math.sin(rad), // Longitudinal (along frac)
    p: -e.x * Math.sin(rad) + e.y * Math.cos(rad) // Perpendicular
  }));
  
  const l_min = Math.min(...rotated.map(r => r.l));
  const l_max = Math.max(...rotated.map(r => r.l));
  const p_min = Math.min(...rotated.map(r => r.p));
  const p_max = Math.max(...rotated.map(r => r.p));
  
  const length = l_max - l_min;
  const width = p_max - p_min;
  
  if (length === 0) return 1;
  return Math.min(1, width / length);
}

/**
 * G-function for DFIT Analysis
 * Simplified approximation of the superposition function
 * @param dtD Dimensionless shut-in time (dt / t_patch)
 * @returns G-function value
 */
export function calculateGFunction(dtD: number): number {
  const g = (dtD: number) => {
    return (1 + dtD) * Math.asin(Math.pow(1 + dtD, -0.5)) + Math.pow(dtD, 0.5);
  };
  return (4 / Math.PI) * (g(dtD) - g(0));
}

/**
 * Fluid Efficiency (eta) from G-closure
 * @param G_closure G-function value at closure
 * @returns Efficiency (0 to 1)
 */
export function calculateFluidEfficiency(G_closure: number): number {
  return G_closure / (G_closure + 2);
}

/**
 * Linear Flow Parameter calculation from RTA
 * @param slope Slope of 1/q vs sqrt(t) plot
 * @param p_diff Pressure difference (Pi - Pwf)
 * @param mu Viscosity (cP)
 * @param ct Total compressibility (1/psi)
 * @returns sqrt(k) * xf * h
 */
export function calculateLinearFlowParameter(
  slope: number,
  p_diff: number,
  mu: number,
  ct: number
): number {
  // Simplification of the linear flow equation for tight reservoirs
  return p_diff / (slope * 31.3 * Math.sqrt(mu * ct));
}

/**
 * Multi-segment Decline Model (Hyperbolic to Exponential)
 * @param t Time in days
 * @param qi Initial rate (bbl/d)
 * @param b Arps b-factor (usually > 1 for unconventional)
 * @param di Initial nominal decline rate (1/d)
 * @param d_term Terminal exponential decline rate (1/d)
 * @returns Rate at time t
 */
export function calculateMultiSegmentDecline(
  t: number,
  qi: number,
  b: number,
  di_annual: number,
  d_term_annual: number
): number {
  const di_daily = di_annual / 365;
  const d_term_daily = d_term_annual / 365;

  // Arps Hyperbolic: q = qi / (1 + b*di*t)^(1/b)
  const q_hyp = qi / Math.pow(1 + b * di_daily * t, 1 / b);
  
  // Current instantaneous decline d = di / (1 + b*di*t)
  const d_inst = di_daily / (1 + b * di_daily * t);
  
  if (d_inst <= d_term_daily) {
    const t_switch = (di_daily / d_term_daily - 1) / (b * di_daily);
    const q_switch = qi / Math.pow(1 + b * di_daily * t_switch, 1 / b);
    return q_switch * Math.exp(-d_term_daily * (t - t_switch));
  }
  
  return q_hyp;
}

/**
 * Integrate decline curve for EUR
 */
export function calculateCumulativeProduction(
  qi: number,
  b: number,
  di_annual: number,
  d_term_annual: number,
  years: number
): number {
  let total = 0;
  const steps = years * 12;
  const daysPerMonth = 30.42;
  
  for (let i = 0; i < steps; i++) {
    const t = i * daysPerMonth;
    const q = calculateMultiSegmentDecline(t, qi, b, di_annual, d_term_annual);
    total += q * daysPerMonth;
  }
  return total;
}

/**
 * Unconventional Well Breakeven Price Calculator
 * @param capitalCost Total CAPEX ($)
 * @param opex Fixed OPEX ($/month)
 * @param variableOpex Variable OPEX ($/bbl)
 * @param eur Estimated Ultimate Recovery (bbl)
 * @param discountRate Annual discount rate (e.g. 0.1)
 * @returns Breakeven price ($/bbl)
 */
export function calculateBreakevenPrice(
  capitalCost: number,
  opexFixed: number,
  opexVar: number,
  eur: number,
  discountRate: number = 0.1
): number {
  // P * EUR_disc = Capex + OPEX_fixed_disc + P_var * EUR_disc
  // P = (Capex + OPEX_fixed_disc) / EUR_disc + P_var
  const years = 20;
  const annuityFactor = (1 - Math.pow(1 + discountRate, -years)) / discountRate;
  
  const totalOpexFixedDisc = opexFixed * 12 * annuityFactor;
  
  // Assuming front-loaded production (Arps), we use a standard 0.65-0.75 discount factor for EUR
  const eurDiscounted = eur * 0.72; 
  
  const breakeven = (capitalCost + totalOpexFixedDisc) / eurDiscounted + opexVar;
  
  return isFinite(breakeven) ? breakeven : 0;
}

export const UNCONVENTIONAL_REFERENCES = [
  {
    id: 'eco-nolte',
    title: 'Reservoir Stimulation',
    authors: 'Michael J. Economides and Kenneth G. Nolte',
    year: '2000',
    type: 'Textbook',
    description: 'The definitive textbook on hydraulic fracturing and reservoir stimulation.',
    url: 'https://scholar.google.com/scholar?q=Economides+Nolte+Reservoir+Stimulation'
  },
  {
    id: 'king-2010',
    title: 'Thirty Years of Gas Shale Fracturing: What Have We Learned?',
    authors: 'George E. King',
    year: '2010',
    type: 'SPE Paper',
    description: 'Comprehensive review of the evolution of shale fracturing techniques.',
    url: 'https://onepetro.org/JPT/article/62/04/72/197621/Thirty-Years-of-Gas-Shale-Fracturing-What-Have-We'
  },
  {
    id: 'mcclure-2019',
    title: 'A Review of Diagnostic Fracture Injection Tests (DFIT)',
    authors: 'Mark McClure',
    year: '2019',
    type: 'Journal Paper',
    description: 'Modern interpretation methods for G-function and after-closure analysis.',
    url: 'https://onepetro.org/SPE/proceedings/19SPE/19URTC/D19URTC-191147-MS/215758'
  },
  {
    id: 'duong-2011',
    title: 'Rate-Decline Analysis for Fracture-Dominated Shale Reservoirs',
    authors: 'Anh Duong',
    year: '2011',
    type: 'SPE Paper',
    description: 'Introduction of the Duong model for unconventional rate transient analysis.',
    url: 'https://onepetro.org/SPE/article/14/03/377/202685/Rate-Decline-Analysis-for-Fracture-Dominated-Shale'
  },
  {
    id: 'wattenbarger-1998',
    title: 'Production Analysis of Vertical Wells with Settlement Fractures',
    authors: 'Robert A. Wattenbarger',
    year: '1998',
    type: 'SPE Paper',
    description: 'Foundational work on linear flow analysis in tight reservoirs.',
    url: 'https://onepetro.org/SPE/proceedings/98SPE/98ATCE/D98ATCE-49293-MS/208226'
  }
];
