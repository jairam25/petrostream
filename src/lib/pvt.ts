import { Composition } from '../types';

export const COMMON_COMPONENTS: Composition[] = [
  { component: 'N2', moleFraction: 0.01, criticalTemp: 126.2, criticalPress: 34.0, acentricFactor: 0.037 },
  { component: 'CO2', moleFraction: 0.01, criticalTemp: 304.1, criticalPress: 73.8, acentricFactor: 0.224 },
  { component: 'H2S', moleFraction: 0.01, criticalTemp: 373.2, criticalPress: 89.4, acentricFactor: 0.091 },
  { component: 'C1', moleFraction: 0.70, criticalTemp: 190.4, criticalPress: 46.0, acentricFactor: 0.011 },
  { component: 'C2', moleFraction: 0.05, criticalTemp: 305.4, criticalPress: 48.7, acentricFactor: 0.099 },
  { component: 'C3', moleFraction: 0.04, criticalTemp: 369.8, criticalPress: 42.5, acentricFactor: 0.152 },
  { component: 'iC4', moleFraction: 0.02, criticalTemp: 407.8, criticalPress: 36.4, acentricFactor: 0.181 },
  { component: 'nC4', moleFraction: 0.02, criticalTemp: 425.2, criticalPress: 38.0, acentricFactor: 0.196 },
  { component: 'iC5', moleFraction: 0.01, criticalTemp: 460.4, criticalPress: 33.8, acentricFactor: 0.222 },
  { component: 'nC5', moleFraction: 0.01, criticalTemp: 469.7, criticalPress: 33.7, acentricFactor: 0.252 },
  { component: 'C6', moleFraction: 0.02, criticalTemp: 507.6, criticalPress: 30.2, acentricFactor: 0.301 },
  { component: 'C7', moleFraction: 0.02, criticalTemp: 540.2, criticalPress: 27.4, acentricFactor: 0.349 },
  { component: 'C8', moleFraction: 0.02, criticalTemp: 568.7, criticalPress: 24.9, acentricFactor: 0.398 },
  { component: 'C9', moleFraction: 0.02, criticalTemp: 594.6, criticalPress: 22.9, acentricFactor: 0.444 },
  { component: 'C10', moleFraction: 0.02, criticalTemp: 617.7, criticalPress: 21.1, acentricFactor: 0.492 },
  { component: 'C11+', moleFraction: 0.02, criticalTemp: 660.0, criticalPress: 18.0, acentricFactor: 0.550 }
];

export function calculatePengRobinson(tempC: number, pressBar: number, composition: Composition[]) {
  const R = 0.08314472; // l bar / mol K
  const T = tempC + 273.15; // K
  const P = pressBar;

  let am = 0;
  let bm = 0;

  composition.forEach((comp, i) => {
    const Tr = T / comp.criticalTemp;
    const alpha_i = Math.pow(1 + (0.37464 + 1.54226 * comp.acentricFactor - 0.26992 * Math.pow(comp.acentricFactor, 2)) * (1 - Math.sqrt(Tr)), 2);
    const ai = 0.45724 * (Math.pow(R, 2) * Math.pow(comp.criticalTemp, 2)) / comp.criticalPress * alpha_i;
    const bi = 0.0778 * (R * comp.criticalTemp) / comp.criticalPress;

    bm += comp.moleFraction * bi;

    // Cross terms (simplified, no binary interaction parameters here for demo)
    composition.forEach((compJ, j) => {
      const TrJ = T / compJ.criticalTemp;
      const alpha_j = Math.pow(1 + (0.37464 + 1.54226 * compJ.acentricFactor - 0.26992 * Math.pow(compJ.acentricFactor, 2)) * (1 - Math.sqrt(TrJ)), 2);
      const aj = 0.45724 * (Math.pow(R, 2) * Math.pow(compJ.criticalTemp, 2)) / compJ.criticalPress * alpha_j;
      const aij = Math.sqrt(ai * aj); // D-O mix rule simplified
      am += comp.moleFraction * compJ.moleFraction * aij;
    });
  });

  const A = (am * P) / (Math.pow(R, 2) * Math.pow(T, 2));
  const B = (bm * P) / (R * T);

  // Cubic equation: Z^3 - (1-B)Z^2 + (A-3B^2-2B)Z - (AB-B^2-B^3) = 0
  const c2 = -(1 - B);
  const c1 = A - 3 * Math.pow(B, 2) - 2 * B;
  const c0 = -(A * B - Math.pow(B, 2) - Math.pow(B, 3));

  // Solve cubic (Cardano's method simplified or just return approximation for demo)
  // For simplicity, we calculate Z for gas phase (largest root)
  let Z = 1.0; // Initial guess
  for (let i = 0; i < 50; i++) {
    const f = Math.pow(Z, 3) + c2 * Math.pow(Z, 2) + c1 * Z + c0;
    const df = 3 * Math.pow(Z, 2) + 2 * c2 * Z + c1;
    Z = Z - f / df;
    if (Math.abs(f) < 0.00001) break;
  }

  const V = (Z * R * T) / P; // Molar volume L/mol
  const rho = 1 / V; // Molar density mol/L

  return { Z, V, rho, am, bm, A, B };
}
