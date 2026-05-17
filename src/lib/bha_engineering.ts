// ===============================================================================
// PHASE 6a: BHA (BOTTOM HOLE ASSEMBLY) & BIT DESIGN ENGINEERING
// ===============================================================================

export type BHAComponentType = 'bit' | 'bitSub' | 'mwd' | 'lwd' | 'pdmMotor' | 'rss' | 'nearBitStab' | 'stringStab' | 'dc' | 'nmdc' | 'hwdp' | 'jar' | 'shockSub' | 'circulationSub' | 'reamer' | 'crossover' | 'drillPipe';

export interface BHAComponent {
  id: string;
  type: BHAComponentType;
  name: string;
  od: number;        // inches
  innerDiameter: number;        // inches
  length: number;    // feet
  weight: number;    // lb/ft
  tensileYield?: number; // psi
  maxDogleg?: number;    // deg/100ft
  description: string;
  cost?: number;
  material?: string;
  typicalPlacement: number; // feet from bit
}

export interface BitSpecV2 {
  name: string;
  type: 'PDC' | 'Milled Tooth' | 'TCI' | 'Natural Diamond' | 'Impregnated Diamond';
  iadcCode: string;
  sizeRange: [number, number];
  recommendedFormations: string[];
  formationHardness: string;
  bladeCount?: number;
  cutterSize_mm?: number;
  maxWob_klb: number;
  maxRpm: number;
  cost: number;
  durability: 'Low' | 'Medium' | 'High';
  description: string;
}

export interface BitHydraulics {
  tfa_sqin: number;
  bitPressureLoss_psi: number;
  jetVelocity_ftPerSec: number;
  hhp: number;
  hsi: number;
  impactForce_lbf: number;
  annularVelocity_fpm: number;
  bitReynoldsNumber: number;
}

export interface BHAMechanicsData {
  neutralPoint_ft: number;
  totalBHAWeight_lbf: number;
  maxBendingStress_psi: number;
  criticalRotarySpeed_rpm: number;
  wobTransferEfficiency_pct: number;
  stringStiffness_EI: number;
  lateralDisplacement_in: number;
  vonMisesStress_psi: number;
}

export interface BitRecOutput {
  primary: BitSpecV2;
  alternative: BitSpecV2;
  recommendedNozzles: number[];
  expectedIADC: string;
  expectedROP_ftHr: [number, number];
  expectedFootage: [number, number];
}

export interface IADCDullGrade {
  innerCS: number;
  outerCS: number;
  dullChar: string;
  location: string;
  bearingSeals: string;
  gauge: number;
  otherDull: string;
  reasonPulled: string;
}

// --- EXPANDED BIT DATABASE ---

export const BIT_DATABASE_V2: BitSpecV2[] = [
  { name: '6-Blade PDC (16mm)', type: 'PDC', iadcCode: 'M323', sizeRange: [8.5, 12.25], recommendedFormations: ['Shale', 'Sandstone', 'Siltstone'], formationHardness: 'Soft-Medium', bladeCount: 6, cutterSize_mm: 16, maxWob_klb: 35, maxRpm: 250, cost: 25000, durability: 'High', description: 'Standard 6-blade PDC for soft-medium formations. Excellent ROP.' },
  { name: '5-Blade PDC (13mm)', type: 'PDC', iadcCode: 'M423', sizeRange: [6, 8.5], recommendedFormations: ['Sandstone', 'Shale', 'Limestone'], formationHardness: 'Medium', bladeCount: 5, cutterSize_mm: 13, maxWob_klb: 30, maxRpm: 200, cost: 22000, durability: 'Medium', description: '5-blade PDC for medium formations. Balanced design.' },
  { name: '7-Blade PDC (13mm)', type: 'PDC', iadcCode: 'M523', sizeRange: [4, 6.125], recommendedFormations: ['Limestone', 'Dolomite', 'Hard Sandstone'], formationHardness: 'Medium-Hard', bladeCount: 7, cutterSize_mm: 13, maxWob_klb: 25, maxRpm: 180, cost: 28000, durability: 'High', description: 'Heavy-set 7-blade PDC for harder formations.' },
  { name: '8-Blade PDC (11mm)', type: 'PDC', iadcCode: 'M623', sizeRange: [6, 8.5], recommendedFormations: ['Hard Limestone', 'Quartzite', 'Chert'], formationHardness: 'Hard', bladeCount: 8, cutterSize_mm: 11, maxWob_klb: 35, maxRpm: 150, cost: 32000, durability: 'High', description: 'Premium 8-blade with small cutters for hard abrasive formations.' },
  { name: 'Steel Body PDC (19mm)', type: 'PDC', iadcCode: 'M223', sizeRange: [12.25, 17.5], recommendedFormations: ['Soft Shale', 'Claystone', 'Unconsolidated Sand'], formationHardness: 'Very Soft-Soft', bladeCount: 5, cutterSize_mm: 19, maxWob_klb: 40, maxRpm: 300, cost: 18000, durability: 'Medium', description: 'Large cutter steel body PDC for maximum ROP in soft formations.' },
  { name: 'Tri-Cone Milled Tooth', type: 'Milled Tooth', iadcCode: '211', sizeRange: [6, 26], recommendedFormations: ['Soft Limestone', 'Soft Shale', 'Chalk'], formationHardness: 'Very Soft-Soft', maxWob_klb: 50, maxRpm: 120, cost: 8000, durability: 'Low', description: 'Classic tri-cone with milled steel teeth. Economical for shallow sections.' },
  { name: 'Tri-Cone Milled (Medium)', type: 'Milled Tooth', iadcCode: '321', sizeRange: [6, 17.5], recommendedFormations: ['Medium Shale', 'Medium Sandstone', 'Marl'], formationHardness: 'Medium', maxWob_klb: 55, maxRpm: 100, cost: 10000, durability: 'Medium', description: 'Tri-cone with shorter harder teeth for medium formations.' },
  { name: 'TCI Insert (Hard)', type: 'TCI', iadcCode: '537', sizeRange: [4.75, 12.25], recommendedFormations: ['Hard Sandstone', 'Anhydrite', 'Hard Limestone'], formationHardness: 'Hard', maxWob_klb: 60, maxRpm: 80, cost: 15000, durability: 'Medium', description: 'Tungsten carbide insert bit for hard formations.' },
  { name: 'TCI Insert (Very Hard)', type: 'TCI', iadcCode: '637', sizeRange: [4.75, 9.875], recommendedFormations: ['Quartzite', 'Chert', 'Volcanics'], formationHardness: 'Very Hard', maxWob_klb: 65, maxRpm: 60, cost: 22000, durability: 'Low', description: 'Hemispherical TCI inserts for extremely hard formations.' },
  { name: 'Natural Diamond', type: 'Natural Diamond', iadcCode: 'D3F', sizeRange: [4.5, 8.5], recommendedFormations: ['Granite', 'Basalt', 'Chert'], formationHardness: 'Extremely Hard', maxWob_klb: 40, maxRpm: 300, cost: 45000, durability: 'High', description: 'Surface-set natural diamonds. Very long life in hard formations.' },
  { name: 'Impregnated Diamond', type: 'Impregnated Diamond', iadcCode: 'D5F', sizeRange: [4.5, 8.5], recommendedFormations: ['Granite', 'Quartzite', 'Basalt', 'Gneiss'], formationHardness: 'Extremely Hard', maxWob_klb: 45, maxRpm: 500, cost: 35000, durability: 'High', description: 'Diamond grit in wearing matrix. Self-sharpening.' },
];

// --- BHA COMPONENT LIBRARY ---

export const BHA_LIBRARY: BHAComponent[] = [
  // Drill Collars
  { id: 'dc-6.25', type: 'dc', name: '6.25in Drill Collar', od: 6.25, innerDiameter: 2.81, length: 31, weight: 90, tensileYield: 110000, maxDogleg: 3, description: 'Standard DC for WOB in vertical sections.', cost: 4500, material: 'AISI 4145H', typicalPlacement: 12 },
  { id: 'dc-8.0', type: 'dc', name: '8.0in Drill Collar', od: 8.0, innerDiameter: 2.81, length: 31, weight: 150, tensileYield: 110000, maxDogleg: 2, description: 'Heavy DC for large hole sections.', cost: 6500, material: 'AISI 4145H', typicalPlacement: 12 },
  { id: 'dc-9.5', type: 'dc', name: '9.5in Drill Collar', od: 9.5, innerDiameter: 3.0, length: 31, weight: 215, tensileYield: 110000, maxDogleg: 1.5, description: 'Extra-heavy DC for 17-1/2in and 12-1/4in hole.', cost: 8000, material: 'AISI 4145H', typicalPlacement: 12 },
  { id: 'dc-4.75', type: 'dc', name: '4.75in Drill Collar', od: 4.75, innerDiameter: 2.0, length: 31, weight: 45, tensileYield: 110000, maxDogleg: 5, description: 'Slim DC for 6in hole sections.', cost: 3500, material: 'AISI 4145H', typicalPlacement: 12 },
  // NMDCs
  { id: 'nmdc-6.25', type: 'nmdc', name: '6.25in NMDC (Monel)', od: 6.25, innerDiameter: 2.81, length: 31, weight: 88, tensileYield: 100000, maxDogleg: 3, description: 'Non-magnetic Monel K-500 for MWD directional surveys.', cost: 12000, material: 'Monel K-500', typicalPlacement: 5 },
  { id: 'nmdc-8.0', type: 'nmdc', name: '8.0in NMDC', od: 8.0, innerDiameter: 2.81, length: 31, weight: 145, tensileYield: 100000, maxDogleg: 2, description: 'Non-magnetic DC for larger hole sizes.', cost: 18000, material: 'Monel K-500', typicalPlacement: 5 },
  // Stabilizers
  { id: 'nbs-12.25', type: 'nearBitStab', name: '12.25in Near-Bit Stabilizer', od: 12.25, innerDiameter: 3.0, length: 6, weight: 80, maxDogleg: 0, description: '3-blade spiral near-bit stabilizer. Controls bit tilt and build tendency.', cost: 3000, typicalPlacement: 1 },
  { id: 'nbs-8.5', type: 'nearBitStab', name: '8.5in Near-Bit Stabilizer', od: 8.5, innerDiameter: 2.81, length: 5, weight: 50, maxDogleg: 0, description: 'Spiral blade near-bit stabilizer for 8-1/2in hole.', cost: 2500, typicalPlacement: 1 },
  { id: 'ss-12.25', type: 'stringStab', name: '12.25in String Stabilizer', od: 12.25, innerDiameter: 3.0, length: 6, weight: 70, maxDogleg: 0, description: 'String stabilizer for packed assemblies and drop tendency control.', cost: 2800, typicalPlacement: 60 },
  { id: 'ss-8.5', type: 'stringStab', name: '8.5in String Stabilizer', od: 8.5, innerDiameter: 2.81, length: 5, weight: 45, maxDogleg: 0, description: 'String stabilizer for 8-1/2in hole. Packed hole key component.', cost: 2300, typicalPlacement: 60 },
  // MWD/LWD
  { id: 'mwd-8.0', type: 'mwd', name: '8.0in MWD (Pulser)', od: 8.0, innerDiameter: 2.25, length: 30, weight: 70, maxDogleg: 8, description: 'Mud pulse telemetry MWD. Survey (INC/AZI/TF), gamma ray, APWD.', cost: 150000, typicalPlacement: 18 },
  { id: 'mwd-6.75', type: 'mwd', name: '6.75in MWD/LWD Suite', od: 6.75, innerDiameter: 2.25, length: 28, weight: 55, maxDogleg: 12, description: 'Combined MWD+LWD: resistivity, density, neutron, sonic.', cost: 250000, typicalPlacement: 18 },
  { id: 'lwd-6.75', type: 'lwd', name: '6.75in LWD Triple Combo', od: 6.75, innerDiameter: 2.25, length: 35, weight: 60, maxDogleg: 10, description: 'Density-neutron-resistivity LWD for formation evaluation while drilling.', cost: 180000, typicalPlacement: 18 },
  // Mud Motors (PDM)
  { id: 'pdm-9.625', type: 'pdmMotor', name: '9-5/8in PDM Motor 5:6', od: 9.625, innerDiameter: 3.0, length: 32, weight: 100, maxDogleg: 2, description: 'Positive displacement motor. 5:6 lobe. High torque for 12-1/4in hole.', cost: 45000, typicalPlacement: 3 },
  { id: 'pdm-6.75', type: 'pdmMotor', name: '6.75in PDM Motor 4:5', od: 6.75, innerDiameter: 2.25, length: 28, weight: 60, maxDogleg: 3, description: 'PDM for 8-1/2in hole directional work. Bend setting 0-3deg.', cost: 38000, typicalPlacement: 3 },
  { id: 'pdm-4.75', type: 'pdmMotor', name: '4.75in PDM Motor 3:4', od: 4.75, innerDiameter: 1.5, length: 25, weight: 35, maxDogleg: 5, description: 'Slim PDM for 6in slimhole drilling. Higher RPM.', cost: 32000, typicalPlacement: 3 },
  // RSS
  { id: 'rss-8.25', type: 'rss', name: '8.25in RSS Push-the-Bit', od: 8.25, innerDiameter: 3.0, length: 30, weight: 65, maxDogleg: 3, description: 'Push-the-bit RSS. Continuous rotation, higher ROP than PDM. 3-pad design.', cost: 250000, typicalPlacement: 3 },
  { id: 'rss-6.75', type: 'rss', name: '6.75in RSS Point-the-Bit', od: 6.75, innerDiameter: 2.25, length: 28, weight: 50, maxDogleg: 5, description: 'Point-the-bit RSS. Precise directional control with near-bit inc.', cost: 280000, typicalPlacement: 3 },
  // HWDP
  { id: 'hwdp-5', type: 'hwdp', name: '5in HWDP', od: 5.0, innerDiameter: 3.0, length: 31, weight: 42, tensileYield: 135000, maxDogleg: 6, description: 'Heavyweight drill pipe. Transitions from collars to DP with centered wear pads.', cost: 2800, typicalPlacement: 250 },
  { id: 'hwdp-4', type: 'hwdp', name: '4in HWDP', od: 4.0, innerDiameter: 2.5, length: 31, weight: 28, tensileYield: 135000, maxDogleg: 8, description: 'Slim HWDP for smaller hole sections.', cost: 2200, typicalPlacement: 250 },
  // Jars
  { id: 'jar-hyd-6.5', type: 'jar', name: '6.5in Hydraulic Jar', od: 6.5, innerDiameter: 2.75, length: 33, weight: 45, maxDogleg: 5, description: 'Adjustable firing hydraulic jar for freeing stuck pipe. Up/down jarring.', cost: 18000, typicalPlacement: 280 },
  { id: 'jar-mech-8.0', type: 'jar', name: '8.0in Mechanical Jar', od: 8.0, innerDiameter: 3.0, length: 35, weight: 60, maxDogleg: 3, description: 'Preset mechanical jar. Robust for large hole sections.', cost: 15000, typicalPlacement: 280 },
  // Shock Sub
  { id: 'shock-8.25', type: 'shockSub', name: '8.25in Shock Sub', od: 8.25, innerDiameter: 3.0, length: 10, weight: 50, maxDogleg: 2, description: 'Absorbs axial and torsional vibrations. Protects MWD/LWD tools.', cost: 12000, typicalPlacement: 4 },
  { id: 'shock-6.75', type: 'shockSub', name: '6.75in Shock Sub', od: 6.75, innerDiameter: 2.25, length: 8, weight: 35, maxDogleg: 4, description: 'Compact vibration dampener for slim assemblies.', cost: 10000, typicalPlacement: 4 },
  // Cross-over
  { id: 'xo-6.625', type: 'crossover', name: '6-5/8in FH X-Over', od: 8.0, innerDiameter: 3.0, length: 3, weight: 40, maxDogleg: 5, description: 'Cross-over sub for transitions between thread types.', cost: 1500, typicalPlacement: 200 },
  // Circulation Sub
  { id: 'cs-8.0', type: 'circulationSub', name: '8.0in Circulation Sub', od: 8.0, innerDiameter: 3.0, length: 5, weight: 45, maxDogleg: 3, description: 'Ball-activated circulation sub for lost circulation treatment.', cost: 5000, typicalPlacement: 220 },
  // Bit Sub
  { id: 'bitsub-8.0', type: 'bitSub', name: '8.0in Bit Sub (Float)', od: 8.0, innerDiameter: 3.0, length: 3, weight: 35, maxDogleg: 0, description: 'Bit sub with float valve. Connects bit to BHA.', cost: 1200, typicalPlacement: 0 },
  // Reamer
  { id: 'reamer-12.25', type: 'reamer', name: '12.25in Near-Bit Reamer', od: 12.25, innerDiameter: 3.0, length: 8, weight: 90, maxDogleg: 2, description: 'Simultaneous reaming while drilling. Reduces dogleg severity.', cost: 8000, typicalPlacement: 2 },
];

// --- BHA MECHANICS CALCULATIONS ---

export function calculateBHAMechanics(
  components: BHAComponent[],
  wob_klb: number,
  rpm: number,
  holeSize_in: number,
  mudWeight_ppg: number
): BHAMechanicsData {
  let totalLen = 0, totalAirWt = 0, firstStabDist = Infinity, dist = 0;
  components.forEach(c => {
    totalLen += c.length;
    totalAirWt += c.length * (c.weight ?? 0);
    if ((c.type === 'nearBitStab' || c.type === 'bitSub') && firstStabDist === Infinity) firstStabDist = dist + c.length;
    dist += c.length;
  });
  const bf = 1 - (mudWeight_ppg / 65.5);
  const buoyedWt = totalAirWt * bf;
  const avgWt = totalAirWt / Math.max(totalLen, 1);
  const neutralPt = (wob_klb * 1000) / Math.max(avgWt * bf, 1);
  const span = firstStabDist < Infinity ? firstStabDist : totalLen;
  const od = components.length > 0 ? components[0].od : 6.75;
  const id = components.length > 0 ? components[0].innerDiameter : 2.81;
  const critRPM = (4.76e6 * Math.sqrt(od**2 + id**2)) / Math.max(span**2, 1);
  const clearance = (holeSize_in - od) / 2;
  const moi = Math.PI / 64 * (od**4 - id**4);
  const E = 30e6;
  const bendStress = (E * od/2 * clearance) / Math.max((span * 12)**2, 1);
  const doglegF = components.some(c => c.type === 'pdmMotor') ? 0.85 : 0.92;
  const holeF = holeSize_in > 12 ? 0.80 : (holeSize_in > 8 ? 0.85 : 0.90);
  const wobEff = Math.max(50, doglegF * holeF * 100);
  const ei = E * moi;
  const latDisp = (clearance * Math.PI) / 2;
  const axialS = (wob_klb * 1000) / (Math.PI / 4 * (od**2 - id**2));
  const vonMises = Math.sqrt(axialS**2 + 3 * (bendStress/2)**2);

  return {
    neutralPoint_ft: Math.round(neutralPt * 10) / 10,
    totalBHAWeight_lbf: Math.round(buoyedWt),
    maxBendingStress_psi: Math.round(bendStress),
    criticalRotarySpeed_rpm: Math.round(critRPM),
    wobTransferEfficiency_pct: Math.round(wobEff),
    stringStiffness_EI: Math.round(ei / 1e6) * 1e6,
    lateralDisplacement_in: Math.round(latDisp * 1000) / 1000,
    vonMisesStress_psi: Math.round(vonMises),
  };
}

// --- BIT HYDRAULICS ---

export function calculateBitHydraulicsV2(
  mudWeight_ppg: number,
  flowRate_gpm: number,
  nozzleSizes_32nd: number[],
  bitDiameter_in: number
): BitHydraulics {
  const tfa = nozzleSizes_32nd.reduce((s, n) => s + (Math.PI * (n/32)**2) / 4, 0);
  const Cd = 0.95;
  const bitPL = tfa > 0 ? (mudWeight_ppg * flowRate_gpm**2) / (10858 * Cd**2 * tfa**2) : 0;
  const jetVel = tfa > 0 ? (0.32086 * flowRate_gpm) / tfa : 0;
  const hhp = (flowRate_gpm * bitPL) / 1714;
  const bitArea = Math.PI * bitDiameter_in**2 / 4;
  const hsi = bitArea > 0 ? hhp / bitArea : 0;
  const impForce = 0.01823 * flowRate_gpm * Math.sqrt(mudWeight_ppg * Math.max(bitPL, 1));
  const annVel = (24.51 * flowRate_gpm) / Math.max(bitDiameter_in**2 - (bitDiameter_in*0.6)**2, 0.1);
  const avgNz = nozzleSizes_32nd.length > 0 ? nozzleSizes_32nd.reduce((a,b)=>a+b,0) / nozzleSizes_32nd.length / 32 : 0.5;
  const Re = (928 * jetVel * mudWeight_ppg * avgNz) / 20;

  return {
    tfa_sqin: Math.round(tfa * 1000) / 1000,
    bitPressureLoss_psi: Math.round(bitPL),
    jetVelocity_ftPerSec: Math.round(jetVel),
    hhp: Math.round(hhp * 10) / 10,
    hsi: Math.round(hsi * 10) / 10,
    impactForce_lbf: Math.round(impForce),
    annularVelocity_fpm: Math.round(annVel),
    bitReynoldsNumber: Math.round(Re),
  };
}

// --- BIT RECOMMENDATION ENGINE ---

export function recommendBitForSectionV2(
  holeSize_in: number,
  formationType: string,
  depth_ft: number,
  isDirectional: boolean
): BitRecOutput {
  const sized = BIT_DATABASE_V2.filter(b => holeSize_in >= b.sizeRange[0] && holeSize_in <= b.sizeRange[1]);
  const fLower = formationType.toLowerCase();
  const scored = sized.map(b => {
    let s = 0;
    b.recommendedFormations.forEach(f => {
      if (f.toLowerCase().includes(fLower)) s += 3;
      if (fLower.includes(f.toLowerCase())) s += 2;
    });
    if (isDirectional && b.type !== 'PDC') s -= 2;
    if (depth_ft > 15000 && b.durability === 'High') s += 2;
    if (depth_ft < 3000 && b.cost < 15000) s += 1;
    return { bit: b, score: s };
  });
  scored.sort((a,b) => b.score - a.score);
  const p = scored[0]?.bit ?? BIT_DATABASE_V2[0];
  const a = scored[1]?.bit ?? BIT_DATABASE_V2[1];
  const bitArea = Math.PI * holeSize_in**2 / 4;
  const targetHSI = 2.5, targetHHP = targetHSI * bitArea;
  const approxTFA = Math.sqrt(Math.max((400*400*10) / (10858 * targetHHP * 1714 / 400), 0.001));
  const nz = Math.round(Math.sqrt((4 * approxTFA / 3) / Math.PI) * 32);

  return {
    primary: p, alternative: a,
    recommendedNozzles: [nz, nz, Math.max(nz-1, 10)],
    expectedIADC: p.iadcCode,
    expectedROP_ftHr: depth_ft > 15000 ? [5,20] : [20,50],
    expectedFootage: p.type === 'PDC' ? [3000,6000] : [500,2000],
  };
}

// --- BHA LAYOUT ---

export interface BHAVisNode {
  component: BHAComponent;
  distanceFromBit_ft: number;
  scaledLength: number;
}

export function layoutBHA(components: BHAComponent[]): BHAVisNode[] {
  let cum = 0;
  const totLen = components.reduce((s,c) => s + c.length, 1);
  return components.map(c => {
    const node: BHAVisNode = { component: c, distanceFromBit_ft: cum, scaledLength: Math.max(1, (c.length/totLen)*100) };
    cum += c.length;
    return node;
  });
}

// --- STABILIZER ANALYSIS ---

export function analyzeStabilizerPlacement(
  components: BHAComponent[],
  holeSize_in: number
): { stiffnessRatio: number; bendingMomentReduction_pct: number; recommendation: string } {
  const stabs = components.filter(c => c.type === 'nearBitStab' || c.type === 'stringStab');
  let ratio = 0, reduction = 0, rec = '';
  if (stabs.length === 0) {
    rec = 'No stabilizers. BHA free to flex. High buckling risk in compression.';
  } else if (stabs.length === 1) {
    ratio = 2.5; reduction = 60;
    rec = 'Single stabilizer. Adequate for tangent sections. Limited lateral control.';
  } else if (stabs.length === 2) {
    ratio = 4.5; reduction = 80;
    rec = 'Two stabilizers. Good lateral stiffness. Suitable for build/drop assemblies.';
  } else {
    ratio = 6.0; reduction = 90;
    rec = 'Packed hole assembly. Maximum stiffness. Best for vertical/hold sections.';
  }
  return { stiffnessRatio: Math.round(ratio*10)/10, bendingMomentReduction_pct: reduction, recommendation: rec };
}

// --- IADC DULL GRADING ---

export function calculateDullGradeV2(
  bitType: string,
  footage_ft: number,
  hours: number,
  formationHardness: string
): IADCDullGrade {
  let wr = 1.0;
  if (formationHardness.includes('Soft')) wr = 0.3;
  else if (formationHardness.includes('Medium')) wr = 0.6;
  else if (formationHardness.includes('Hard')) wr = 1.2;
  const iW = Math.min(8, Math.round(wr * footage_ft / 1000));
  const oW = Math.min(8, Math.round(wr * 1.3 * footage_ft / 1000));
  const gW = Math.min(8, Math.round(wr * 0.8 * footage_ft / 1000));
  return { innerCS: iW, outerCS: oW, dullChar: oW>4 ? 'WO' : 'WT', location: 'G', bearingSeals: bitType.includes('PDC') ? 'X' : 'E', gauge: gW, otherDull: 'NO', reasonPulled: footage_ft>3000 ? 'TD' : 'PR' };
}

// --- PRESET BHA DESIGNS ---

export const PRESET_BHA_DESIGNS = {
  surface: {
    name: 'Surface BHA (17-1/2in)',
    section: 'surface' as const,
    holeSize: 17.5,
    recommendedComponents: ['bitsub-8.0', 'nbs-12.25', 'dc-8.0', 'dc-8.0', 'dc-8.0', 'ss-12.25', 'dc-8.0', 'hwdp-5', 'jar-hyd-6.5', 'hwdp-5'],
  },
  intermediate: {
    name: 'Intermediate BHA (12-1/4in)',
    section: 'intermediate' as const,
    holeSize: 12.25,
    recommendedComponents: ['bitsub-8.0', 'nbs-12.25', 'shock-8.25', 'mwd-8.0', 'nmdc-8.0', 'ss-12.25', 'dc-8.0', 'dc-8.0', 'ss-12.25', 'dc-8.0', 'hwdp-5', 'jar-hyd-6.5', 'hwdp-5'],
  },
  intermediateMotor: {
    name: 'Directional BHA (12-1/4in w/ Motor)',
    section: 'intermediate' as const,
    holeSize: 12.25,
    recommendedComponents: ['bitsub-8.0', 'nbs-12.25', 'pdm-9.625', 'shock-8.25', 'mwd-8.0', 'nmdc-8.0', 'ss-12.25', 'dc-8.0', 'dc-8.0', 'hwdp-5', 'jar-hyd-6.5', 'hwdp-5'],
  },
  production: {
    name: 'Production BHA (8-1/2in)',
    section: 'production' as const,
    holeSize: 8.5,
    recommendedComponents: ['bitsub-8.0', 'nbs-8.5', 'shock-6.75', 'mwd-6.75', 'nmdc-6.25', 'ss-8.5', 'dc-6.25', 'dc-6.25', 'hwdp-5', 'jar-hyd-6.5', 'hwdp-5'],
  },
  productionRSS: {
    name: 'Production BHA (8-1/2in w/ RSS)',
    section: 'production' as const,
    holeSize: 8.5,
    recommendedComponents: ['bitsub-8.0', 'nbs-8.5', 'rss-6.75', 'mwd-6.75', 'nmdc-6.25', 'ss-8.5', 'dc-6.25', 'dc-6.25', 'hwdp-5', 'jar-hyd-6.5', 'hwdp-5'],
  },
};
