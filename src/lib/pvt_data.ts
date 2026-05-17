
export interface PureComponent {
  id: string;
  name: string;
  mw: number;
  tc: number; // Rankine
  pc: number; // psia
  vc: number; // ft3/lb-mol
  omega: number;
  zc: number;
  tb: number; // Rankine
  sg: number;
  shift: number; // Peneloux shift
}

export const PURE_COMPONENTS: Record<string, PureComponent> = {
  C1: { id: 'C1', name: 'Methane', mw: 16.043, tc: 343.08, pc: 667.8, vc: 1.58, omega: 0.0115, zc: 0.288, tb: 201.0, sg: 0.3, shift: -0.154 },
  C2: { id: 'C2', name: 'Ethane', mw: 30.070, tc: 549.77, pc: 708.3, vc: 2.37, omega: 0.0995, zc: 0.285, tb: 332.1, sg: 0.356, shift: -0.100 },
  C3: { id: 'C3', name: 'Propane', mw: 44.097, tc: 665.68, pc: 617.4, vc: 3.21, omega: 0.1523, zc: 0.281, tb: 416.0, sg: 0.508, shift: -0.085 },
  iC4: { id: 'iC4', name: 'i-Butane', mw: 58.124, tc: 734.65, pc: 529.1, vc: 4.21, omega: 0.1770, zc: 0.283, tb: 470.6, sg: 0.563, shift: -0.064 },
  nC4: { id: 'nC4', name: 'n-Butane', mw: 58.124, tc: 765.32, pc: 550.7, vc: 4.10, omega: 0.2002, zc: 0.274, tb: 490.8, sg: 0.584, shift: -0.064 },
  iC5: { id: 'iC5', name: 'i-Pentane', mw: 72.151, tc: 828.77, pc: 490.4, vc: 4.90, omega: 0.2275, zc: 0.273, tb: 541.8, sg: 0.625, shift: -0.043 },
  nC5: { id: 'nC5', name: 'n-Pentane', mw: 72.151, tc: 845.37, pc: 489.5, vc: 4.87, omega: 0.2515, zc: 0.262, tb: 556.6, sg: 0.631, shift: -0.043 },
  C6: { id: 'C6', name: 'Hexane', mw: 86.178, tc: 913.37, pc: 436.9, vc: 5.93, omega: 0.3013, zc: 0.264, tb: 615.4, sg: 0.664, shift: -0.021 },
  C7: { id: 'C7', name: 'Heptane', mw: 100.205, tc: 972.37, pc: 396.8, vc: 6.92, omega: 0.3495, zc: 0.263, tb: 668.0, sg: 0.688, shift: 0.000 },
  C8: { id: 'C8', name: 'Octane', mw: 114.232, tc: 1023.89, pc: 362.1, vc: 7.82, omega: 0.3996, zc: 0.259, tb: 717.8, sg: 0.707, shift: 0.012 },
  N2: { id: 'N2', name: 'Nitrogen', mw: 28.014, tc: 227.27, pc: 493.0, vc: 1.44, omega: 0.0377, zc: 0.291, tb: 139.3, sg: 0.809, shift: -0.192 },
  CO2: { id: 'CO2', name: 'Carbon Dioxide', mw: 44.010, tc: 547.56, pc: 1070.9, vc: 1.51, omega: 0.2250, zc: 0.274, tb: 350.5, sg: 0.818, shift: -0.067 },
  H2S: { id: 'H2S', name: 'Hydrogen Sulfide', mw: 34.082, tc: 672.35, pc: 1306.0, vc: 1.57, omega: 0.0942, zc: 0.284, tb: 382.7, sg: 0.790, shift: -0.046 },
  H2O: { id: 'H2O', name: 'Water', mw: 18.015, tc: 1164.85, pc: 3206.2, vc: 0.90, omega: 0.3449, zc: 0.235, tb: 671.7, sg: 1.000, shift: -0.020 }
};

export const BIP_NON_HC: Record<string, Record<string, number>> = {
  CO2: { C1: 0.1200, C2: 0.1300, C3: 0.1350, nC4: 0.1300, nC5: 0.1250, C6: 0.1200, C7: 0.1100, C8: 0.1150, N2: -0.0200 },
  N2: { C1: 0.0311, C2: 0.0515, C3: 0.0852, nC4: 0.1000, nC5: 0.1100, C6: 0.1200, C7: 0.1300, C8: 0.1400 },
  H2S: { C1: 0.0800, C2: 0.0850, C3: 0.0900, CO2: 0.1000, N2: 0.1700 }
};
