/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ==========================================
// Phase 1: Inflow Performance Relationship
// ==========================================

/**
 * Darcy's Radial Flow (Single Phase, Above Bubble Point)
 * @param k Permeability (mD)
 * @param h Thickness (ft)
 * @param pr Reservoir Pressure (psi)
 * @param pwf Flowing Bottomhole Pressure (psi)
 * @param mu Oil Viscosity (cP)
 * @param bo Oil Formation Volume Factor (rb/STB)
 * @param re Drainage Radius (ft)
 * @param rw Wellbore Radius (ft)
 * @param s Skin Factor
 * @returns Flow Rate q (STB/D)
 */
export function calculateDarcyRadialFlow(k: number, h: number, pr: number, pwf: number, mu: number, bo: number, re: number, rw: number, s: number = 0): number {
  if (pwf >= pr) return 0;
  const PI = (0.00708 * k * h) / (mu * bo * (Math.log(re / rw) - 0.75 + s));
  return PI * (pr - pwf);
}

/**
 * Vogel's IPR Model (Two Phase, Below Bubble Point)
 * @param pwf Flowing Bottomhole Pressure (psi)
 * @param pr Average Reservoir Pressure (psi)
 * @param qmax Absolute Open Flow Potential (AOF) (STB/D)
 * @returns Flow Rate q (STB/D)
 */
export function calculateVogelIPR(pwf: number, pr: number, qmax: number): number {
  if (pwf >= pr) return 0;
  return qmax * (1 - 0.2 * (pwf / pr) - 0.8 * Math.pow(pwf / pr, 2));
}

/**
 * Composite IPR Model
 * @param pwf Flowing Bottomhole Pressure (psi)
 * @param pr Reservoir Pressure (psi)
 * @param pb Bubble Point Pressure (psi)
 * @param j Productivity Index above bubble point (STB/D/psi)
 * @returns Flow Rate q (STB/D)
 */
export function calculateCompositeIPR(pwf: number, pr: number, pb: number, j: number): number {
  if (pwf >= pr) return 0;
  if (pr <= pb) {
    // Reservoir is entirely below bubble point -> Use Vogel
    const qmax = j * pr / 1.8;
    return calculateVogelIPR(pwf, pr, qmax);
  } else {
    if (pwf >= pb) {
      // Flowing pressure above bubble point -> Single phase linear PI
      return j * (pr - pwf);
    } else {
      // Flowing pressure below bubble point -> Stitching
      const qb = j * (pr - pb);
      const qvogel = j * pb / 1.8;
      const qmax = qb + qvogel;
      return qb + qvogel * (1 - 0.2 * (pwf / pb) - 0.8 * Math.pow(pwf / pb, 2));
    }
  }
}

/**
 * Fetkovich IPR Model
 * @param pwf Flowing Bottomhole Pressure (psi)
 * @param pr Reservoir Pressure (psi)
 * @param c Flow Coefficient
 * @param n Exponent (0.5 to 1.0)
 * @returns Flow Rate q
 */
export function calculateFetkovichIPR(pwf: number, pr: number, c: number, n: number): number {
  if (pwf >= pr) return 0;
  return c * Math.pow(Math.pow(pr, 2) - Math.pow(pwf, 2), n);
}

/**
 * Gas Well Backpressure IPR (Simplified)
 * @param pwf Flowing Bottomhole Pressure (psi)
 * @param pr Reservoir Pressure (psi)
 * @param c Flow Coefficient
 * @param n Exponent (0.5 to 1.0)
 * @returns Gas Flow Rate qg (Mscf/D)
 */
export function calculateGasWellIPR(pwf: number, pr: number, c: number, n: number): number {
  return calculateFetkovichIPR(pwf, pr, c, n);
}

/**
 * Horizontal Well IPR (Joshi's Model - Simplified)
 * @param k Permeability (mD)
 * @param h Thickness (ft)
 * @param pr Reservoir Pressure (psi)
 * @param pwf Bottomhole Pressure (psi)
 * @param mu Viscosity (cP)
 * @param bo FVF (rb/STB)
 * @param re Drainage Radius (ft)
 * @param rw Wellbore Radius (ft)
 * @param L Horizontal Length (ft)
 * @param kv Vertical Permeability (mD)
 * @returns Flow Rate q (STB/D)
 */
export function calculateJoshiHorizontalIPR(k: number, h: number, pr: number, pwf: number, mu: number, bo: number, re: number, rw: number, L: number, kv: number): number {
  if (pwf >= pr) return 0;
  const Iani = Math.sqrt(k / kv);
  const a = (L / 2) * Math.pow(0.5 + Math.sqrt(0.25 + Math.pow(2 * re / L, 4)), 0.5);
  const topTerm = 0.00708 * k * h * (pr - pwf);
  const bottomTerm1 = mu * bo * Math.log((a + Math.sqrt(a * a - Math.pow(L / 2, 2))) / (L / 2));
  const bottomTerm2 = (mu * bo * Iani * h / L) * Math.log(Iani * h / (rw * (1 + Iani)));
  
  return topTerm / (bottomTerm1 + bottomTerm2);
}

// ==========================================
// Phase 2: Vertical Lift Performance (VLP)
// ==========================================

/**
 * Very basic approximation of Tubing Performance Curve (VLP)
 * Typically this requires numerical integration of Hagedorn-Brown/Beggs-Brill.
 * We use an analytical proxy for visualization purposes.
 * @param rate Flow rate (STB/D)
 * @param whp Wellhead Pressure (psi)
 * @param depth Depth (ft)
 * @param tubingId Tubing Inner Diameter (inches)
 * @param gor Gas-Oil Ratio (scf/stb)
 * @param wc Water Cut (fraction)
 * @returns Pwf (psi)
 */
export function calculateVLPProxy(rate: number, whp: number, depth: number, tubingId: number, gor: number, wc: number): number {
  if (rate <= 0) return whp + (depth * 0.433); // Static hydrostatic

  // Fluid densities (lb/ft3) -> approx gradient (psi/ft)
  const oilGrad = 0.35;
  const waterGrad = 0.433;
  const gasGrad = 0.05;

  const liquidGrad = (oilGrad * (1 - wc)) + (waterGrad * wc);
  
  // High GOR lightens the column, but too much gas increases friction
  // Slippage factor roughly modeled
  const gasEffect = Math.min(0.2, (gor / 5000)); 
  const mixtureGrad = liquidGrad - gasEffect;
  
  const hydrostaticP = depth * mixtureGrad;

  // Friction component (Darcy-Weisbach proxy)
  // Pressure loss proportional to length, v^2, 1/d^5
  const frictionFactor = 0.02; // Approx
  const v = rate / (Math.pow(tubingId, 2) * 10); // arbitrary scaling for velocity proxy
  const frictionP = (depth * frictionFactor * Math.pow(v, 2)) / (tubingId);

  // Return total Pwf
  return whp + hydrostaticP + frictionP;
}

/**
 * Turner's Critical Rate for Liquid Loading in Gas Wells
 * @param p Pressure (psia)
 * @param temp Temperature (Rankine)
 * @param z Gas Compressibility
 * @param tubingId Tubing Inner Diameter (inches)
 * @returns Critical Gas Rate (MMscf/D)
 */
export function calculateTurnerCriticalRate(p: number, temp: number, z: number, tubingId: number): number {
  const densityGas = (2.7 * p * 0.6) / (temp * z); // simple approx
  const densityLiquid = 62.4; // water approx
  
  const sigma = 60; // dynes/cm surface tension
  const v_critical = 1.593 * Math.pow(sigma * (densityLiquid - densityGas), 0.25) / Math.pow(densityGas, 0.5);
  
  const area = Math.PI * Math.pow(tubingId / 24, 2); // ft2
  const q_critical = 3.06 * p * v_critical * area / (temp * z); // MMscf/D proxy
  
  return q_critical;
}

// ==========================================
// Phase 3: Nodal Analysis
// ==========================================

/**
 * Finds the operating point (intersection) of IPR and VLP curves
 * @param iprCurve Array of {pwf, q} for IPR
 * @param vlpCurve Array of {pwf, q} for VLP
 * @returns The intersection point {pwf, q} or null if no intersection
 */
export function findNodalOperatingPoint(
  iprCurve: {pwf: number, q: number}[],
  vlpCurve: {pwf: number, q: number}[]
): {pwf: number, q: number} | null {
  // Simple heuristic: find the point where VLP Pwf crosses IPR Pwf
  // Both curves should be sorted by flow rate (q)
  for (let i = 0; i < Math.min(iprCurve.length, vlpCurve.length) - 1; i++) {
    const ipr1 = iprCurve[i];
    const ipr2 = iprCurve[i+1];
    
    // Find matching q in VLP
    const vlp1 = vlpCurve.find(v => Math.abs(v.q - ipr1.q) < 5);
    const vlp2 = vlpCurve.find(v => Math.abs(v.q - ipr2.q) < 5);

    if (vlp1 && vlp2) {
      if (vlp1.pwf <= ipr1.pwf && vlp2.pwf >= ipr2.pwf) {
        // Intersection happened between i and i+1
        // Linear interpolation
        const fraction = (ipr1.pwf - vlp1.pwf) / ((vlp2.pwf - vlp1.pwf) - (ipr2.pwf - ipr1.pwf));
        const q_intersect = ipr1.q + fraction * (ipr2.q - ipr1.q);
        const pwf_intersect = ipr1.pwf + fraction * (ipr2.pwf - ipr1.pwf);
        return { pwf: pwf_intersect, q: q_intersect };
      }
    }
  }
  return null;
}

// ==========================================
// Phase 4: Choke Performance
// ==========================================

/**
 * Multiphase Choke Correlation (Gilbert, Ros, Baxendell)
 * Calculates liquid flow rate based on upstream pressure (critical flow)
 * @param pwh Upstream Wellhead Pressure (psi)
 * @param d Choke size in 1/64th of an inch
 * @param glr Gas Liquid Ratio (scf/STB)
 * @param model Correlation model name
 * @returns Flow Rate q (STB/D)
 */
export function calculateChokeFlowRate(
  pwh: number, 
  d: number, 
  glr: number, 
  model: 'gilbert' | 'ros' | 'baxendell' = 'gilbert'
): number {
  if (glr <= 0) return 0; // Avoid division by zero
  
  let c = 10.0;
  let n = 0.546;
  let m = 1.89;

  switch (model) {
    case 'gilbert':
      c = 10.0; n = 0.546; m = 1.89;
      break;
    case 'ros':
      c = 17.4; n = 0.5; m = 2.0;
      break;
    case 'baxendell':
      c = 9.56; n = 0.546; m = 1.93;
      break;
  }

  // q = (Pwh * D^m) / (C * (GLR/1000)^n)
  // Gilbert/Ros/Baxendell constants C, n, m are defined for GLR in Mscf/STB
  const glrMscf = glr / 1000;
  return (pwh * Math.pow(d, m)) / (c * Math.pow(glrMscf, n));
}

// ==========================================
// Phase 5: Artificial Lift
// ==========================================

/**
 * Calculates Total Dynamic Head (TDH) for an ESP
 * @param netLift Vertical distance fluid must be lifted (ft)
 * @param frictionLoss Friction loss in tubing (ft)
 * @param whp Wellhead pressure expressed in head (ft)
 * @returns TDH in feet
 */
export function calculateESPTDH(netLift: number, frictionLoss: number, whpHead: number): number {
  return netLift + frictionLoss + whpHead;
}

// ==========================================
// Phase 6: Well Completion
// ==========================================

/**
 * Simplified Perforation Skin proxy (Karakas-Tariq inspired)
 * @param spf Shots per foot
 * @param pen Penetration depth (inches)
 * @param phase Phasing angle (degrees)
 * @param diam Hole diameter (inches)
 * @returns Skin factor (dimensionless)
 */
export function calculatePerfSkin(spf: number, pen: number, phase: number, diam: number): number {
  // A true Karakas-Tariq requires evaluating damage zone, crushed zone, etc.
  // This is a simplified proxy mapping basic relationships.
  // More SPF = lower skin. Deeper pen = lower skin.
  
  let baseSkin = 5.0;
  baseSkin -= (spf * 0.2);
  baseSkin -= (pen * 0.15);
  baseSkin -= (diam * 2.0);
  
  if (phase === 60 || phase === 90) {
    baseSkin -= 0.5; // Optimal phasing
  }
  
  return Math.max(-2, baseSkin); // Cap minimum skin
}

// ==========================================
// Phase 7: Well Stimulation
// ==========================================

/**
 * Calculates Dimensionless Fracture Conductivity (FCD)
 * @param kf Fracture permeability (mD)
 * @param wf Fracture width (inches)
 * @param k Reservoir permeability (mD)
 * @param xf Fracture half-length (ft)
 * @returns FCD (dimensionless)
 */
export function calculateFCD(kf: number, wf: number, k: number, xf: number): number {
  if (k <= 0 || xf <= 0) return 0;
  // Convert width from inches to ft for unit consistency
  const wf_ft = wf / 12.0;
  return (kf * wf_ft) / (k * xf);
}

// ==========================================
// Phase 8: Flow Assurance
// ==========================================

/**
 * Simplified proxy for Hydrate formation temperature based on pressure
 * @param pressure Pressure (psia)
 * @returns Approximate Hydrate Formation Temperature (°F) for a 0.6 gravity gas
 */
export function calculateHydrateTempProxy(pressure: number): number {
  if (pressure <= 0) return 0;
  // Based on Katz gravity chart proxy
  // Temp = a * ln(P) + b
  // For 0.6 gravity: roughly 100 psia -> 35F, 1000 psia -> 65F, 4000 psia -> 80F
  return 12.0 * Math.log(pressure) - 18.0; 
}

