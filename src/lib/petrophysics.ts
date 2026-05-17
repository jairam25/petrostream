/**
 * Module 3: Formation Evaluation & Petrophysics
 * Phase 1: Well Logging Basics & Tool Reference
 */

export interface LoggingTool {
  id: string;
  category: 'Resistivity' | 'Porosity' | 'Lithology' | 'Auxiliary';
  name: string;
  acronym: string;
  description: string;
  measurePrinciple: string;
  depthOfInvestigation: string;
  verticalResolution: string;
  lithologyResponse: {
    sandstone: string;
    limestone: string;
    dolomite: string;
    shale: string;
  };
  environmentalCorrections: string[];
  usage: string;
  formula?: {
    name: string;
    latex: string;
  };
  peValue?: number;
}

export const LOGGING_TOOLS: LoggingTool[] = [
  // --- RESISTIVITY ---
  {
    id: 'laterolog',
    category: 'Resistivity',
    name: 'Laterolog',
    acronym: 'LLD/LLS',
    description: 'Measures formation resistivity using electrodes to focus current into the formation.',
    measurePrinciple: 'Focusing electrodes force current in a thin sheet into the formation. Ideal for salty muds (Rmf < Rw).',
    depthOfInvestigation: 'Deep (LLd: 30-50"), Shallow (LLs: 15-20")',
    verticalResolution: '2 - 3 ft',
    lithologyResponse: {
      sandstone: 'High in hydrocarbon zones, low in water zones',
      limestone: 'Typically high due to low porosity',
      dolomite: 'Typically high',
      shale: 'Low (0.5 - 10 ohm-m)'
    },
    environmentalCorrections: ['Borehole effect', 'Bed thickness', 'Invasion'],
    usage: 'Recommended in high resistivity contrast and salty mud environments.'
  },
  {
    id: 'induction',
    category: 'Resistivity',
    name: 'Induction Log',
    acronym: 'ILD/ILM',
    description: 'Measures formation conductivity using electromagnetic induction.',
    measurePrinciple: 'Transmitter coils create eddy currents in the formation; receiver coils detect the resulting magnetic field. Best for fresh muds or oil-based muds.',
    depthOfInvestigation: 'Deep (ILD: 60-80"), Medium (ILM: 30")',
    verticalResolution: '5 - 8 ft',
    lithologyResponse: {
      sandstone: 'Low conductivity in hydrocarbons',
      limestone: 'Very low conductivity',
      dolomite: 'Very low conductivity',
      shale: 'High conductivity (100 - 2000 mS/m)'
    },
    environmentalCorrections: ['Borehole effect', 'Skin effect', 'Shoulder bed'],
    usage: 'Standard tool for non-conductive muds (OBM) or fresh water muds.'
  },
  {
    id: 'msfl',
    category: 'Resistivity',
    name: 'Microresistivity',
    acronym: 'MSFL/MLL',
    description: 'Measures the resistivity of the flushed zone (Rxo) near the borehole wall.',
    measurePrinciple: 'Small electrodes mounted on a pad pressed against the wall. Focused current for shallow measurement.',
    depthOfInvestigation: 'Very Shallow (1 - 4")',
    verticalResolution: '1 - 2 inches',
    lithologyResponse: {
      sandstone: 'Reflects resistivity of mud filtrate (Rmf)',
      limestone: 'High if tight',
      dolomite: 'High if tight',
      shale: 'Close to Rt (no invasion)'
    },
    environmentalCorrections: ['Mudcake thickness', 'Tool standoff'],
    usage: 'Determining Rxo, locating permeable zones via mudcake presence.'
  },

  // --- POROSITY ---
  {
    id: 'density',
    category: 'Porosity',
    name: 'Density Log',
    acronym: 'FDC/RHOB',
    description: 'Measures bulk density of the formation by detecting gamma ray scattering (Compton scattering).',
    measurePrinciple: 'Gamma source emits pulses; count rates at detectors correlate to electron density, which correlates to bulk density (Rhob).',
    depthOfInvestigation: 'Shallow (2 - 4")',
    verticalResolution: '6 inches',
    lithologyResponse: {
      sandstone: '2.65 g/cc (matrix)',
      limestone: '2.71 g/cc (matrix)',
      dolomite: '2.87 g/cc (matrix)',
      shale: '2.5 - 2.8 g/cc (varies)'
    },
    environmentalCorrections: ['Mud weight', 'Borehole size', 'Mudcake'],
    usage: 'Primary porosity tool. Also used with Neutron for lithology (Gas effect detection).',
    formula: {
      name: 'Bulk Density to Porosity',
      latex: 'Φ = (ρma - ρb) / (ρma - ρfl)'
    }
  },
  {
    id: 'neutron',
    category: 'Porosity',
    name: 'Neutron Porosity',
    acronym: 'CNL/NPHI',
    description: 'Measures hydrogen index (HI) by bombarding atoms with neutrons and measuring slow-down rate.',
    measurePrinciple: 'Fast neutrons collide with hydrogen nuclei (effective because masses are similar). Slower neutrons = more hydrogen = higher porosity.',
    depthOfInvestigation: 'Medium (8 - 12")',
    verticalResolution: '1 - 2 ft',
    lithologyResponse: {
      sandstone: 'Low index (calibrated to Limestone)',
      limestone: 'Zero reference',
      dolomite: 'High index',
      shale: 'Very high apparent porosity (clay bound water)'
    },
    environmentalCorrections: ['Pressure/Temp', 'Mud salinity', 'Lithology correction'],
    usage: 'Porosity determination. Critical for "Gas Crossover" identification when paired with Density.'
  },
  {
    id: 'sonic',
    category: 'Porosity',
    name: 'Sonic Log',
    acronym: 'BHC/DT',
    description: 'Measures the shortest time for a compressional wave to travel through one foot of formation (interval transit time).',
    measurePrinciple: 'Piezoelectric transmitters and receivers measure arrival times of acoustic waves.',
    depthOfInvestigation: 'Very Shallow (1 - 2")',
    verticalResolution: '2 ft',
    lithologyResponse: {
      sandstone: '55.5 μs/ft (matrix)',
      limestone: '47.5 μs/ft (matrix)',
      dolomite: '43.5 μs/ft (matrix)',
      shale: '80 - 150 μs/ft'
    },
    environmentalCorrections: ['Borehole cycle skipping', 'Compaction correction'],
    usage: 'Porosity in consolidated formations. Used for seismic tie-ins (synthetic seismograms).',
    formula: {
      name: 'Wyllie Time-Average',
      latex: 'Φ = (Δt_log - Δt_ma) / (Δt_fl - Δt_ma)'
    }
  },

  // --- LITHOLOGY ---
  {
    id: 'gamma_ray',
    category: 'Lithology',
    name: 'Gamma Ray',
    acronym: 'GR',
    description: 'Measures natural radioactivity (Potassium, Uranium, Thorium).',
    measurePrinciple: 'Passive scintillation detector counts natural gamma emissions from the formation.',
    depthOfInvestigation: '6 - 12 inches',
    verticalResolution: '12 inches',
    lithologyResponse: {
      sandstone: 'Low (Clean sand: 15-30 API)',
      limestone: 'Low (10-20 API)',
      dolomite: 'Low',
      shale: 'High (70-150+ API)'
    },
    environmentalCorrections: ['Borehole size', 'Mud weight', 'Casing thickness'],
    usage: 'Correlation between wells, depth control, shale volume (Vsh) estimation.'
  },
  {
    id: 'sp',
    category: 'Lithology',
    name: 'Spontaneous Potential',
    acronym: 'SP',
    description: 'Measures DC voltage difference between an electrode in the hole and a ground at surface.',
    measurePrinciple: 'Electrochemical and electrokinetic potentials created at junctions of mud/mud filtrate/formation water across permeable beds.',
    depthOfInvestigation: 'Deep (lateral penetration)',
    verticalResolution: 'Depends on bed thickness',
    lithologyResponse: {
      sandstone: 'Deflection from shale baseline',
      limestone: 'Minimal deflection if tight',
      dolomite: 'Minimal deflection if tight',
      shale: 'Shale baseline (zero reference)'
    },
    environmentalCorrections: ['Borehole resistance', 'Invasion depth'],
    usage: 'Finding permeable beds, estimating formation water salinity (Rw), correlation.'
  },
  {
    id: 'pef',
    category: 'Lithology',
    name: 'Photoelectric Factor',
    acronym: 'PEF',
    description: 'Measures the ability of the formation to absorb gamma rays via photoelectric effect.',
    measurePrinciple: 'Part of the density tool measurement (lower energy window). Absorbtion depends heavily on atomic number (Z).',
    depthOfInvestigation: 'Shallow (1 - 2")',
    verticalResolution: '6 inches',
    lithologyResponse: {
      sandstone: '1.81 barns/electron',
      limestone: '5.08 barns/electron',
      dolomite: '3.14 barns/electron',
      shale: '3.0 - 4.5 barns/electron'
    },
    environmentalCorrections: ['Barite mud influence (Z=56)'],
    usage: 'Direct mineral identification. Very sensitive to Barite in mud.',
    peValue: 5.08
  },

  // --- AUX ---
  {
    id: 'nmr',
    category: 'Auxiliary',
    name: 'Nuclear Magnetic Resonance',
    acronym: 'NMR/CMR',
    description: 'Measures the relaxation time of hydrogen protons in a magnetic field.',
    measurePrinciple: 'Aligns protons with magnet, pulses RF to tip them, then measures T1/T2 relaxation times.',
    depthOfInvestigation: 'Shallow (focused shells)',
    verticalResolution: '6 - 12 inches',
    lithologyResponse: {
      sandstone: 'Matrix independent',
      limestone: 'Matrix independent',
      dolomite: 'Matrix independent',
      shale: 'Shows high bound water (short T2)'
    },
    environmentalCorrections: ['Temperature', 'Activation time'],
    usage: 'Direct measurement of movable vs bound fluid (effective porosity), permeability estimation.'
  },
  {
    id: 'caliper',
    category: 'Auxiliary',
    name: 'Caliper Log',
    acronym: 'CALI',
    description: 'Measures the diameter of the borehole.',
    measurePrinciple: 'Mechanical arms (2, 4, or multi-link) pressed against borehole wall.',
    depthOfInvestigation: 'N/A',
    verticalResolution: 'Continuous',
    lithologyResponse: {
      sandstone: 'May show mudcake (smaller than bit size)',
      limestone: 'Bit size (usually stable)',
      dolomite: 'Bit size',
      shale: 'Washouts (larger than bit size)'
    },
    environmentalCorrections: ['Tool centering'],
    usage: 'Borehole condition check, cement volume calculation, identifying mudcake.'
  }
];

export const POROSITY_TRANSFORMS = [
  {
    name: 'Wyllie Time-Average',
    usage: 'Consolidated formations',
    formula: 'Φ = (Δt_log - Δt_ma) / (Δt_fl - Δt_ma)'
  },
  {
    name: 'Raymer-Hunt-Gardner (RHG)',
    usage: 'Wider range of porosities, better for unconsolidated',
    formula: 'Φ = C * (Δt_log - Δt_ma) / Δt_log'
  }
];

export const PEF_MATRIX_VALUES = [
  { mineral: 'Sandstone (Quartz)', pe: 1.81 },
  { mineral: 'Limestone (Calcite)', pe: 5.08 },
  { mineral: 'Dolomite', pe: 3.14 },
  { mineral: 'Anhydrite', pe: 5.05 },
  { mineral: 'Siderite', pe: 14.69 }
];

// --- SHALE VOLUME CALCULATIONS ---

export function calculateIGR(gr: number, grClean: number, grShale: number): number {
  if (grShale === grClean) return 0;
  const igr = (gr - grClean) / (grShale - grClean);
  return Math.max(0, Math.min(1, igr));
}

export function calculateVshLarionovTertiary(igr: number): number {
  return 0.33 * (Math.pow(2, 2 * igr) - 1);
}

export function calculateVshLarionovOlder(igr: number): number {
  return 0.07 * (Math.pow(2, 3.7 * igr) - 1);
}

export function calculateVshSteiber(igr: number): number {
  if (3 - 2 * igr === 0) return igr;
  return igr / (3 - 2 * igr);
}

export function calculateVshClavier(igr: number): number {
  const term = 3.38 - Math.pow(igr + 0.7, 2);
  if (term < 0) return igr;
  return 1.7 - Math.sqrt(term);
}

export function calculateVshSP(sp: number, spBase: number, spMax: number): number {
  if (spMax === spBase) return 0;
  const vsh = (sp - spMax) / (spBase - spMax);
  return Math.max(0, Math.min(1, vsh));
}

export function calculateVshNeutronDensity(nphi: number, dphi: number, nphiSh: number, dphiSh: number): number {
  const denominator = nphiSh - dphiSh;
  if (denominator === 0) return 0;
  const vsh = (nphi - dphi) / denominator;
  return Math.max(0, Math.min(1, vsh));
}

export function calculateVshResistivity(rt: number, rClean: number, rShale: number): number {
  if (rt <= 0 || rShale <= 0) return 0;
  // A common resistivity Vsh method (Steiber variation or empirical)
  // Simplified: (Rsh / Rt) * (Rclean - Rt) / (Rclean - Rsh)
  // Or: Vsh = (Rsh/Rt) for low Vsh
  const vsh = (rShale / rt) * (rClean - rt) / (rClean - rShale);
  return Math.max(0, Math.min(1, vsh));
}

// --- POROSITY DETERMINATION ---

export function calculateDensityPorosity(rhob: number, rhoMatrix: number, rhoFluid: number): number {
  const denominator = rhoMatrix - rhoFluid;
  if (denominator === 0) return 0;
  const phi = (rhoMatrix - rhob) / denominator;
  return Math.max(0, phi);
}

/**
 * Generic Porosity helper for AppraisalPanel (defaults to Density Porosity with 1.0 fluid density)
 */
export function calculatePorosity(rhoMatrix: number, rhob: number, rhoFluid: number = 1.0): number {
  const denominator = rhoMatrix - rhoFluid;
  if (denominator === 0) return 0;
  const phi = (rhoMatrix - rhob) / denominator;
  return Math.max(0, phi);
}

export function calculateBulkVolumeWater(phi: number, sw: number): number {
  return phi * sw;
}

export function calculateVshGR(gr: number, grClean: number, grShale: number, type?: 'larionov_old' | 'larionov_tertiary' | 'steiber' | 'clavier'): number {
  const igr = (gr - grClean) / (grShale - grClean);
  const cleanIgr = Math.max(0, Math.min(1, igr));
  
  if (!type) return cleanIgr;
  
  switch (type) {
    case 'larionov_old': return calculateVshLarionovOlder(cleanIgr);
    case 'larionov_tertiary': return calculateVshLarionovTertiary(cleanIgr);
    case 'steiber': return calculateVshSteiber(cleanIgr);
    case 'clavier': return calculateVshClavier(cleanIgr);
    default: return cleanIgr;
  }
}

export function calculateSonicPorosityWyllie(dt: number, dtMatrix: number, dtFluid: number): number {
  const denominator = dtFluid - dtMatrix;
  if (denominator === 0) return 0;
  const phi = (dt - dtMatrix) / denominator;
  return Math.max(0, phi);
}

export function calculateSonicPorosityRHG(dt: number, dtMatrix: number): number {
  if (dt === 0) return 0;
  // Raymer-Hunt-Gardner: Phi = 0.625 * (1 - dtMatrix/dt)
  const phi = 0.625 * (1 - (dtMatrix / dt));
  return Math.max(0, phi);
}

export function calculateNeutronMatrixCorrection(nphi: number, matrix: 'sandstone' | 'limestone' | 'dolomite'): number {
  // Neutron logs are usually in Limestone units. Corrections required for other matrices.
  if (matrix === 'limestone') return nphi;
  if (matrix === 'sandstone') return nphi + 0.04; // Simplified linear shift
  if (matrix === 'dolomite') return nphi - 0.04;
  return nphi;
}

export function calculateNDCrossplotPorosity(nphi: number, dphi: number): number {
  // Common root-mean-square approximation for N-D porosity
  return Math.sqrt((Math.pow(nphi, 2) + Math.pow(dphi, 2)) / 2);
}

export function calculateEffectivePorosity(phiTotal: number, vsh: number): number {
  return phiTotal * (1 - vsh);
}

export function applyShaleCorrection(phiLog: number, vsh: number, phiShale: number): number {
  return phiLog - (vsh * phiShale);
}

// --- WATER SATURATION CALCULATION ---

export function calculateArchieSw(a: number, rw: number, phi: number, m: number, rt: number, n: number): number {
  if (phi <= 0 || rt <= 0) return 1;
  const sw_n = (a * rw) / (Math.pow(phi, m) * rt);
  return Math.max(0, Math.min(1, Math.pow(sw_n, 1 / n)));
}

export function calculateIndonesianSw(vsh: number, rsh: number, phi: number, rw: number, rt: number, a: number, m: number, n: number): number {
  if (rt <= 0 || phi <= 0) return 1;
  const term1 = Math.sqrt(Math.pow(vsh, 2 - vsh) / rsh);
  const term2 = Math.sqrt(Math.pow(phi, m) / (a * rw));
  const sw = Math.pow(1 / (rt * Math.pow(term1 + term2, 2)), 1 / n);
  return Math.max(0, Math.min(1, sw));
}

export function calculateSimandouxSw(vsh: number, rsh: number, phi: number, rw: number, rt: number, a: number, m: number, n: number): number {
  if (rt <= 0 || phi <= 0 || rsh <= 0) return 1;
  const c = (a * rw) / (2 * Math.pow(phi, m));
  const term1 = vsh / rsh;
  const term2 = Math.sqrt(Math.pow(term1, 2) + 4 / (c * rt));
  const sw = c * (term2 - term1);
  return Math.max(0, Math.min(1, Math.pow(sw, 2 / n))); // Simplified n=2 context
}

export function calculateDualWaterSw(phi_t: number, vsh: number, nphi_sh: number, rw: number, rwb: number, rt: number, m: number, n: number): number {
  if (rt <= 0 || phi_t <= 0) return 1;
  const swb = vsh * nphi_sh / phi_t;
  const rw_eff = 1 / ((1 - swb) / rw + swb / rwb);
  const sw_t = Math.pow((rw_eff / (Math.pow(phi_t, m) * rt)), 1 / n);
  return Math.max(0, Math.min(1, sw_t));
}

/**
 * Waxman-Smits Sw Model for Shaly Sands
 * 1/Rt = (Sw^n / F*) * (1/Rw + B*Qv/Sw)
 */
export function calculateWaxmanSmitsSw(phi: number, rw: number, rt: number, m: number, n: number, qv: number, b: number): number {
  if (rt <= 0 || phi <= 0) return 1;
  // F* is the shaly sand formation factor
  const f_star = 1 / Math.pow(phi, m);
  
  // Numerical approximation for Sw (Newton-Raphson would be better, but we iterate)
  let sw = 0.5;
  for (let i = 0; i < 10; i++) {
    const conductivity = (Math.pow(sw, n) / (f_star * rw)) * (1 + (rw * b * qv / sw));
    const rt_calc = 1 / (conductivity || 0.0001);
    const diff = rt_calc - rt;
    if (Math.abs(diff) < 0.001) break;
    // Simple update step
    sw = sw * Math.pow(rt_calc / rt, 1/n);
    sw = Math.max(0.01, Math.min(1, sw));
  }
  return Math.max(0, Math.min(1, sw));
}

// --- Rw DETERMINATION ---

export function calculateRwFromSalinity(salinityPPM: number, tempF: number): number {
  // Arps' Equation for resistivity-salinity conversion
  const tempC = (tempF - 32) * (5 / 9);
  const rw75 = (400000 / salinityPPM); // Approx for common NaCl brines at 75F
  return rw75 * (75 + 6.77) / (tempF + 6.77);
}

export function calculateRwFromSP(ssp: number, tempF: number, rmfe: number): number {
  const t_abs = tempF + 460;
  const k = 61 + (0.133 * tempF);
  const rmf_we = rmfe / Math.pow(10, -ssp / k);
  // Simplified conversion from Rwe to Rw
  return rmf_we; 
}

export function calculateRwa(rt: number, phi: number, m: number, a: number): number {
  if (phi <= 0) return 0;
  return (rt * Math.pow(phi, m)) / a;
}

// --- PERMEABILITY ESTIMATION ---

export function calculateTixierPermeability(phi: number, swi: number): number {
  if (swi <= 0 || phi <= 0) return 0;
  // Tixier: k^0.5 = 250 * phi^3 / swi
  const k = Math.pow((250 * Math.pow(phi, 3)) / swi, 2);
  return Math.max(0, k);
}

export function calculateMorrisBiggsPermeability(phi: number, swi: number, type: 'oil' | 'gas'): number {
  if (swi <= 0 || phi <= 0) return 0;
  // Morris-Biggs: 250 for oil, 79 for gas
  const constant = type === 'oil' ? 250 : 79;
  const k = Math.pow((constant * Math.pow(phi, 3)) / swi, 2);
  return Math.max(0, k);
}

export function calculateTimurPermeability(phi: number, swi: number): number {
  if (swi <= 0 || phi <= 0) return 0;
  // Timur equation: k = 8.58 * (phi^4.4 / swi^2) * 10^4 (for md)
  // Or k = 0.136 * (phi^4.4 / swi^2)
  const k = 0.136 * (Math.pow(phi, 4.4) / Math.pow(swi, 2)) * 10000;
  return Math.max(0, k);
}

export function calculateCoatesPermeability(phi: number, swi: number): number {
  if (swi <= 0 || phi <= 0) return 0;
  // Coates equation: k = [ (phi^2 * (1-swi)/swi) ]^2 * 10^4
  const term1 = Math.pow(phi, 2) * (1 - swi) / swi;
  const k = Math.pow(100 * term1, 2);
  return Math.max(0, k);
}

export function calculateWyllieRosePermeability(phi: number, swi: number, type: 'oil' | 'gas'): number {
  if (swi <= 0 || phi <= 0) return 0;
  // Oil zone: k = [ (a * phi^b) / swi ]^2
  const a = type === 'oil' ? 62.5 : 25;
  const k = Math.pow((a * Math.pow(phi, 3)) / swi, 2);
  return Math.max(0, k);
}

export function calculateWinlandR35(k: number, phi: number): number {
  if (k <= 0 || phi <= 0) return 0;
  // log10(R35) = 0.732 + 0.588 * log10(k) - 0.864 * log10(phi*100)
  const logR35 = 0.732 + 0.588 * Math.log10(k) - 0.864 * Math.log10(phi * 100);
  return Math.pow(10, logR35);
}

/**
 * Fits a linear regression to log10(permeability) vs porosity.
 * k = a * 10^(b * phi)
 * Returns { a, b, r2 }
 */
export function fitPermeabilityTransform(data: { phi: number, k: number }[]) {
  if (data.length < 2) return { a: 0, b: 0, r2: 0 };
  
  const n = data.length;
  const x = data.map(d => d.phi);
  const y = data.map(d => Math.log10(d.k));
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, current, i) => sum + current * y[i], 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // k = 10^(intercept + slope * phi) = 10^intercept * 10^(slope * phi)
  const a = Math.pow(10, intercept);
  const b = slope;
  
  // Simple R2 calculation
  const yMean = sumY / n;
  const ssTot = y.reduce((acc, curr) => acc + Math.pow(curr - yMean, 2), 0);
  const ssRes = y.reduce((acc, curr, i) => acc + Math.pow(curr - (intercept + slope * x[i]), 2), 0);
  const r2 = 1 - (ssRes / (ssTot || 1));

  return { a, b, r2 };
}

// --- NET PAY DETERMINATION ---

export interface NetPayCutoffs {
  minPhi: number;
  maxVsh: number;
  maxSw: number;
  minK: number;
}

export interface LogDataPoint {
  depth: number;
  phi: number;
  vsh: number;
  sw: number;
  k: number;
}

export interface NetPayResult {
  isNetPay: boolean;
  isNetReservoir: boolean;
}

export function evaluateNetPay(point: LogDataPoint, cutoffs: NetPayCutoffs): NetPayResult {
  const isNetReservoir = point.phi >= cutoffs.minPhi && point.vsh <= cutoffs.maxVsh;
  const isNetPay = isNetReservoir && point.sw <= cutoffs.maxSw && point.k >= cutoffs.minK;
  
  return { isNetPay, isNetReservoir };
}

export function calculateNetPayStats(data: LogDataPoint[], cutoffs: NetPayCutoffs) {
  let netReservoirThickness = 0;
  let netPayThickness = 0;
  let grossThickness = 0;
  let sumPhi = 0;
  let sumSw = 0;
  let sumK = 0;
  let countPay = 0;

  if (data.length < 2) return {
    grossThickness: 0,
    netReservoirThickness: 0,
    netPayThickness: 0,
    ntg: 0,
    avgPhi: 0,
    avgSw: 0,
    avgK: 0
  };

  for (let i = 0; i < data.length - 1; i++) {
    const dz = Math.abs(data[i+1].depth - data[i].depth);
    grossThickness += dz;
    
    const { isNetPay, isNetReservoir } = evaluateNetPay(data[i], cutoffs);
    
    if (isNetReservoir) {
      netReservoirThickness += dz;
    }
    
    if (isNetPay) {
      netPayThickness += dz;
      sumPhi += data[i].phi * dz;
      sumSw += data[i].sw * dz;
      sumK += data[i].k * dz;
      countPay += dz;
    }
  }

  const ntg = grossThickness > 0 ? netPayThickness / grossThickness : 0;
  const avgPhi = countPay > 0 ? sumPhi / countPay : 0;
  const avgSw = countPay > 0 ? sumSw / countPay : 0;
  const avgK = countPay > 0 ? sumK / countPay : 0;

  return {
    grossThickness,
    netReservoirThickness,
    netPayThickness,
    ntg,
    avgPhi,
    avgSw,
    avgK
  };
}

export function calculateOOIP(area: number, netPay: number, phi: number, sw: number, bo: number): number {
  // OOIP (stb) = 7758 * Area (acres) * Net Pay (ft) * Phi * (1 - Sw) / Bo
  return (7758 * area * netPay * phi * (1 - sw)) / bo;
}

// --- FLUID CONTACT IDENTIFICATION ---

export interface PressurePoint {
  depth: number;
  pressure: number;
  label?: string;
}

export function calculateGradientIntersection(
  grad1: number, // psi/ft
  p1: number,    // psi at d1
  d1: number,    // ft
  grad2: number, // psi/ft
  p2: number,    // psi at d2
  d2: number     // ft
): number | null {
  // P = P_ref + grad * (D - D_ref)
  // grad1 * (D - d1) + p1 = grad2 * (D - d2) + p2
  // grad1*D - grad1*d1 + p1 = grad2*D - grad2*d2 + p2
  // D * (grad1 - grad2) = p2 - p1 + grad1*d1 - grad2*d2
  
  if (Math.abs(grad1 - grad2) < 0.001) return null;
  
  return (p2 - p1 + grad1 * d1 - grad2 * d2) / (grad1 - grad2);
}

export function calculateCapillaryRise(sigma: number, theta: number, rhoW: number, rhoO: number, r: number): number {
  // h = (2 * sigma * cos(theta)) / (r * g * (rhoW - rhoO))
  // Conver theta to radians
  const thetaRad = (theta * Math.PI) / 180;
  const deltaRho = Math.abs(rhoW - rhoO);
  
  if (deltaRho === 0 || r === 0) return 0;
  
  const g = 32.174; // standard gravity ft/s^2 (can be adjusted for units)
  
  // Return the calculated rise
  return (2 * sigma * Math.cos(thetaRad)) / (r * g * deltaRho);
}

export function calculateOWCFromFWL(fwl: number, pcEntry: number, gradW: number, gradO: number): number {
  // OWC is shallow of FWL by (Pc_entry / (gradW - gradO))
  const deltaGrad = Math.abs(gradW - gradO);
  if (deltaGrad === 0) return fwl;
  return fwl - (pcEntry / deltaGrad);
}

// --- CORE ANALYSIS & SCAL ---

export interface CorePoint {
  depth: number;
  phi: number;
  k: number;
  rhoGrain: number;
  so: number;
  sw: number;
}

export function calculateFormationFactor(phi: number, a: number, m: number): number {
  if (phi <= 0) return 0;
  return a / Math.pow(phi, m);
}

export function calculateResistivityIndex(rt: number, ro: number): number {
  if (ro <= 0) return 0;
  return rt / ro;
}

export function calculateSaturationExponent(ri: number, sw: number): number {
  if (sw <= 0 || ri <= 0) return 0;
  // I = Sw^-n  => ln(I) = -n * ln(Sw) => n = -ln(I) / ln(Sw)
  return -Math.log(ri) / Math.log(sw);
}

export function calculateLeverettJ(pc: number, k: number, phi: number, sigma: number, theta: number): number {
  if (k <= 0 || phi <= 0 || sigma === 0) return 0;
  // J(Sw) = (Pc / (sigma * cos(theta))) * sqrt(k / phi)
  // Standard conversion factor if needed, but often used normalized
  const k_ft2 = k * 1.06235e-14; // Approximate conversion from mD to ft^2
  return (pc / (sigma * Math.cos(theta * Math.PI / 180))) * Math.sqrt(k / phi);
}

export function calculateAmottIndex(wasted_water: number, wasted_oil: number, total_water: number, total_oil: number): { iw: number, io: number, i: number } {
  const iw = total_water > 0 ? wasted_water / total_water : 0;
  const io = total_oil > 0 ? wasted_oil / total_oil : 0;
  return { iw, io, i: iw - io };
}

export function calculateKozenyCarman(phi: number, grainSize: number): number {
  if (phi <= 0) return 0;
  // Simple version: k = (phi^3 * d^2) / (180 * (1-phi)^2)
  const numerator = Math.pow(phi, 3) * Math.pow(grainSize, 2);
  const denominator = 180 * Math.pow(1 - phi, 2);
  return (numerator / denominator) * 1000; // in mD approx
}
