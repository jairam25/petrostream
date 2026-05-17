/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LithologyInfo {
  name: string;
  classification: string;
  description: string;
  grainSize?: string;
  density?: number | string;
  sonicDt?: number | string;
}

export const LITHOLOGY_DATABASE: LithologyInfo[] = [
  // Carbonates (Dunham)
  { name: 'Mudstone', classification: 'Dunham', description: 'Matrix-supported, <10% grains' },
  { name: 'Wackestone', classification: 'Dunham', description: 'Matrix-supported, >10% grains' },
  { name: 'Packstone', classification: 'Dunham', description: 'Grain-supported, contains lime mud' },
  { name: 'Grainstone', classification: 'Dunham', description: 'Grain-supported, lacks lime mud' },
  { name: 'Boundstone', classification: 'Dunham', description: 'Original components bound during deposition' },
  // Clastics (Folk-ish/Grain Size)
  { name: 'Quartz Arenite', classification: 'Folk', description: '>95% quartz grains', grainSize: 'Sand' },
  { name: 'Arkose', classification: 'Folk', description: '>25% feldspar', grainSize: 'Sand' },
  { name: 'Lithic Arenite', classification: 'Folk', description: 'High rock fragment content', grainSize: 'Sand' },
  { name: 'Siltstone', classification: 'General', description: 'Fine-grained siliciclastic', grainSize: 'Silt' },
  { name: 'Shale', classification: 'General', description: 'Fissile fine-grained clastic', grainSize: 'Clay' },
];

export interface DepositionalEnvironment {
  name: string;
  description: string;
  porosityRange: [number, number]; // [min, max] fraction
  permRange: [number, number]; // [min, max] mD
}

export const DEPOSITIONAL_ENVIRONMENTS: DepositionalEnvironment[] = [
  { 
    name: 'Fluvial (Braided)', 
    description: 'High energy, channel sands', 
    porosityRange: [0.15, 0.25], 
    permRange: [100, 2000] 
  },
  { 
    name: 'Deltaic (Distributary Mouth Bar)', 
    description: 'Progradational sand bodies', 
    porosityRange: [0.18, 0.28], 
    permRange: [50, 800] 
  },
  { 
    name: 'Aeolian', 
    description: 'Wind-blown dunes, very well sorted', 
    porosityRange: [0.20, 0.35], 
    permRange: [500, 5000] 
  },
  { 
    name: 'Marine Shelf (Shoreface)', 
    description: 'Wave-dominated sandstones', 
    porosityRange: [0.15, 0.22], 
    permRange: [10, 300] 
  },
  { 
    name: 'Deep Marine Fan (Turbidites)', 
    description: 'Gravity flow deposits', 
    porosityRange: [0.12, 0.20], 
    permRange: [1, 150] 
  },
  { 
    name: 'Carbonate Reef', 
    description: 'High primary/secondary porosity', 
    porosityRange: [0.05, 0.25], 
    permRange: [0.1, 5000] 
  }
];

export const GRAIN_SIZE_CHART = [
  { name: 'Very Coarse Sand', size: '1.0 - 2.0 mm', phi: '0 to -1' },
  { name: 'Coarse Sand', size: '0.5 - 1.0 mm', phi: '1 to 0' },
  { name: 'Medium Sand', size: '0.25 - 0.5 mm', phi: '2 to 1' },
  { name: 'Fine Sand', size: '0.125 - 0.25 mm', phi: '3 to 2' },
  { name: 'Very Fine Sand', size: '0.0625 - 0.125 mm', phi: '4 to 3' },
  { name: 'Silt', size: '0.0039 - 0.0625 mm', phi: '8 to 4' },
  { name: 'Clay', size: '< 0.0039 mm', phi: '> 8' },
];

export interface KerogenType {
  type: string;
  name: string;
  hiBase: number;
  oiBase: number;
  environment: string;
  source: string;
}

export const KEROGEN_TYPES: KerogenType[] = [
  { type: 'Type I', name: 'Algal', hiBase: 800, oiBase: 20, environment: 'Lacustrine', source: 'Algae' },
  { type: 'Type II', name: 'Planktonic', hiBase: 450, oiBase: 40, environment: 'Marine', source: 'Zooplankton/Algae' },
  { type: 'Type III', name: 'Humic', hiBase: 150, oiBase: 80, environment: 'Terrestrial', source: 'Higher Plants' },
  { type: 'Type IV', name: 'Inert', hiBase: 50, oiBase: 20, environment: 'Oxidized', source: 'Recycled/Charcoal' },
];

export const MATURITY_WINDOWS = [
  { label: 'Immature', minRo: 0, maxRo: 0.55, color: '#94a3b8' },
  { label: 'Oil Window', minRo: 0.55, maxRo: 1.3, color: '#22c55e' },
  { label: 'Gas Window', minRo: 1.3, maxRo: 2.0, color: '#eab308' },
  { label: 'Dry Gas/Overmature', minRo: 2.0, maxRo: 5.0, color: '#ef4444' },
];

/**
 * Classified Kerogen Type based on HI/OI
 */
export function classifyKerogen(hi: number, oi: number): string {
  if (hi > 600 && oi < 50) return 'Type I (Algal)';
  if (hi > 300 && oi < 75) return 'Type II (Planktonic/Marine)';
  if (hi > 50 && oi < 150) return 'Type III (Humic/Terrestrial)';
  return 'Type IV (Inert/Oxidized)';
}

/**
 * Get Maturity Stage with robust fallback
 */
export function getMaturityInfo(ro: number) {
  const window = MATURITY_WINDOWS.find(w => ro >= w.minRo && ro < w.maxRo);
  if (window) return window;
  if (ro >= 5.0) return { label: 'Graphitic/Overmature', minRo: 5, maxRo: 10, color: '#000000' };
  return { label: 'Unknown', minRo: 0, maxRo: 0, color: '#334155' };
}

export interface BurialEvent {
  age: number; // Ma
  depth: number; // m
  event: string;
}
