/**
 * ─── Rig Selection & Logistics ───
 * Section 3.1.6 — PetroStream Simulation Suite
 *
 * Covers: rig database, day rate estimation, logistics, service contracts,
 * HSE planning, torque/drag, kick tolerance, AFE costing, timeline estimation.
 */

// ─── Types ────────────────────────────────────────────────────────────────

export type RigLocation = 'onshore' | 'offshore';

export interface RigSpec {
  id: string;
  name: string;
  type:
    | 'land_mechanical'
    | 'land_electric_scr'
    | 'land_vfd'
    | 'coiled_tubing'
    | 'self_moving';
  location: RigLocation;
  manufacturer: string;
  yearBuilt: number;
  // capacities
  maxDrillingDepth_ft: number;
  maxWaterDepth_ft: number;
  maxHookLoad_klb: number;
  drawworksHP: number;
  // mud system
  mudPumpHP: number;
  mudPumpCount: number;
  maxPumpPressure_psi: number;
  maxFlowRate_gpm: number;
  // top-drive / rotary
  topDriveTorque_ftlb: number;
  // derrick
  derrickHeight_ft: number;
  derrickCapacity_klb: number;
  // BOP
  bopRating_psi: number;
  // crew / support
  crewSize: number;
  quartersCapacity: number;
  fuelConsumption_galPerDay: number;
  mobilizationCost: number;
  pipeHandling: 'manual' | 'semi_auto' | 'auto';
  // rate
  dayRateRange_low: number;
  dayRateRange_high: number;
}

export interface DrillingSection {
  name: string;
  holeSize_in: number;
  casingSize_in: number;
  depthFrom_ft: number;
  depthTo_ft: number;
  mudWeight_ppg: number;
  estimatedDays: number;
  estimatedROP_ftHr: number;
  bitType: string;
  bhaType: string;
  riskFactor: number;
}

export interface AFEBreakdown {
  item: string;
  category: 'tangible' | 'intangible' | 'service' | 'logistics' | 'contingency';
  cost: number;
  depthDependent: boolean;
  notes: string;
}

export interface AFEResult {
  totalCost: number;
  breakdown: AFEBreakdown[];
  contingency: number;
}

export interface HSEPlan {
  hazidRisks: { hazard: string; likelihood: number; consequence: number; mitigation: string }[];
  emergencyProcedures: string[];
  shallowGasProcedure: string;
  oilSpillContingency: string;
  wellControlBridle: string;
}

export interface TorqueDragResult {
  depth_ft: number;
  torque_ftlb: number;
  drag_klb: number;
  tension_klb: number;
  bucklingRisk: 'None' | 'Sinusoidal' | 'Helical';
}

export interface KickTolerance {
  kickVolume_bbl: number;
  safetyMargin_bbl: number;
  maxAllowableSurfacePressure_psi: number;
  killMudWeight_ppg: number;
  shoeDepth_ft: number;
}

export interface SectionTimeline {
  name: string;
  totalDays: number;
  drillingDays: number;
  trippingDays: number;
  casingRunningDays: number;
  cementingDays: number;
  nptDays: number;
}

// ─── Expanded Rig Database (20 rigs) ─────────────────────────────────────

export interface RigRecommendation {
  primary: RigSpec;
  alternatives: RigSpec[];
  justification: string[];
}

export function recommendRig(
  targetDepth_ft: number,
  waterDepth_ft: number,
  maxPressure_psi: number,
  location: RigLocation
): RigRecommendation {
  const pool = RIG_DATABASE.filter(r => r.location === location && r.maxDrillingDepth_ft >= targetDepth_ft && r.bopRating_psi >= maxPressure_psi);
  const ranked = pool.sort((a, b) => {
    const scoreA = (a.maxDrillingDepth_ft / targetDepth_ft) + (a.bopRating_psi / maxPressure_psi) + (a.topDriveTorque_ftlb / 50000) + (a.drawworksHP / 2000) - (a.dayRateRange_low / 30000);
    const scoreB = (b.maxDrillingDepth_ft / targetDepth_ft) + (b.bopRating_psi / maxPressure_psi) + (b.topDriveTorque_ftlb / 50000) + (b.drawworksHP / 2000) - (b.dayRateRange_low / 30000);
    return scoreB - scoreA;
  });
  if (ranked.length === 0) {
    return { primary: pool[0] || RIG_DATABASE[0], alternatives: [], justification: ['No rig exactly meets all criteria. Closest match shown.'] };
  }
  const primary = ranked[0];
  const justification: string[] = [
    `Depth capacity ${primary.maxDrillingDepth_ft.toLocaleString()} ft ≥ target ${targetDepth_ft.toLocaleString()} ft`,
    `BOP rating ${(primary.bopRating_psi / 1000).toFixed(0)}K psi meets max expected pressure ${(maxPressure_psi / 1000).toFixed(0)}K psi`,
    `Drawworks ${primary.drawworksHP} HP provides sufficient hoisting capacity`,
    `Top drive ${primary.topDriveTorque_ftlb.toLocaleString()} ft-lb suitable for directional work`,
    location === 'offshore' && primary.maxWaterDepth_ft > 0 ? `Water depth capacity ${primary.maxWaterDepth_ft} ft` : '',
  ].filter(Boolean) as string[];
  return { primary, alternatives: ranked.slice(1, 4), justification };
}

export const RIG_DATABASE: RigSpec[] = [
  // ▸ ONSHORE
  {
    id: 'LR-MECH-1', name: 'Nomad-250', type: 'land_mechanical', location: 'onshore',
    manufacturer: 'Dreco/Bentec', yearBuilt: 2005,
    maxDrillingDepth_ft: 18000, maxWaterDepth_ft: 0,
    maxHookLoad_klb: 500, drawworksHP: 1500,
    mudPumpHP: 1300, mudPumpCount: 2, maxPumpPressure_psi: 5000, maxFlowRate_gpm: 550,
    topDriveTorque_ftlb: 28000,
    derrickHeight_ft: 142, derrickCapacity_klb: 650,
    bopRating_psi: 5000,
    crewSize: 28, quartersCapacity: 50, fuelConsumption_galPerDay: 1600, mobilizationCost: 350000,
    pipeHandling: 'manual', dayRateRange_low: 15000, dayRateRange_high: 22000
  },
  {
    id: 'LR-SCR-1', name: 'Titan-SCR-300', type: 'land_electric_scr', location: 'onshore',
    manufacturer: 'National Oilwell Varco', yearBuilt: 2012,
    maxDrillingDepth_ft: 25000, maxWaterDepth_ft: 0,
    maxHookLoad_klb: 750, drawworksHP: 2000,
    mudPumpHP: 1600, mudPumpCount: 3, maxPumpPressure_psi: 7500, maxFlowRate_gpm: 800,
    topDriveTorque_ftlb: 42000,
    derrickHeight_ft: 152, derrickCapacity_klb: 1000,
    bopRating_psi: 10000,
    crewSize: 32, quartersCapacity: 60, fuelConsumption_galPerDay: 2100, mobilizationCost: 650000,
    pipeHandling: 'semi_auto', dayRateRange_low: 28000, dayRateRange_high: 38000
  },
  {
    id: 'LR-VFD-1', name: 'Quantum-VFD-1500', type: 'land_vfd', location: 'onshore',
    manufacturer: 'Canrig/Huisman', yearBuilt: 2019,
    maxDrillingDepth_ft: 35000, maxWaterDepth_ft: 0,
    maxHookLoad_klb: 1000, drawworksHP: 3000,
    mudPumpHP: 2200, mudPumpCount: 3, maxPumpPressure_psi: 7500, maxFlowRate_gpm: 1000,
    topDriveTorque_ftlb: 60000,
    derrickHeight_ft: 166, derrickCapacity_klb: 1250,
    bopRating_psi: 15000,
    crewSize: 35, quartersCapacity: 70, fuelConsumption_galPerDay: 2800, mobilizationCost: 1200000,
    pipeHandling: 'auto', dayRateRange_low: 45000, dayRateRange_high: 65000
  },
  {
    id: 'LR-SM-1', name: 'Pathfinder-M200', type: 'self_moving', location: 'onshore',
    manufacturer: 'Schramm/NOV', yearBuilt: 2017,
    maxDrillingDepth_ft: 12000, maxWaterDepth_ft: 0,
    maxHookLoad_klb: 300, drawworksHP: 800,
    mudPumpHP: 600, mudPumpCount: 1, maxPumpPressure_psi: 3500, maxFlowRate_gpm: 350,
    topDriveTorque_ftlb: 15000,
    derrickHeight_ft: 112, derrickCapacity_klb: 400,
    bopRating_psi: 3000,
    crewSize: 15, quartersCapacity: 30, fuelConsumption_galPerDay: 800, mobilizationCost: 150000,
    pipeHandling: 'manual', dayRateRange_low: 8000, dayRateRange_high: 14000
  },
];

// ─── AFE CALCULATOR ──────────────────────────────────────────────────────

export function calculateAFE(
  sections: DrillingSection[],
  rigDayRate: number,
  locationType: RigLocation,
  includeLogistics: boolean,
  maxExpectedPressure_psi: number
): AFEResult {
  const breakdown: AFEBreakdown[] = [];

  let totalTangible = 0;
  sections.forEach(s => {
    const casingCost = s.depthTo_ft * 150;
    breakdown.push({ item: `${s.name} Casing (${s.casingSize_in}")`, category: 'tangible', cost: casingCost, depthDependent: true, notes: `${s.depthTo_ft - s.depthFrom_ft}ft @ $150/ft` });
    totalTangible += casingCost;
  });

  const wellheadRating = maxExpectedPressure_psi > 10000 ? 15000 : (maxExpectedPressure_psi > 7500 ? 10000 : 5000);
  const wellheadCost = wellheadRating >= 10000 ? 250000 : 150000;
  breakdown.push({ item: 'Wellhead & Xmas Tree', category: 'tangible', cost: wellheadCost, depthDependent: false, notes: `${wellheadRating}psi rated` });
  totalTangible += wellheadCost;

  let totalIntangible = 0;
  let totalDrillingDays = 0;
  sections.forEach(s => {
    const sectionDays = s.estimatedDays * s.riskFactor;
    totalDrillingDays += sectionDays;
    const sectionCost = sectionDays * rigDayRate;
    breakdown.push({ item: `${s.name} Rig Days (${sectionDays.toFixed(0)} days)`, category: 'intangible', cost: sectionCost, depthDependent: true, notes: `${sectionDays.toFixed(0)} days @ $${rigDayRate.toLocaleString()}/day` });
    totalIntangible += sectionCost;
  });

  breakdown.push({ item: 'Directional Drilling Services', category: 'service', cost: totalDrillingDays * 2500, depthDependent: true, notes: 'MWD/LWD + DD engineers' });
  breakdown.push({ item: 'Mud Engineering', category: 'service', cost: totalDrillingDays * 1800, depthDependent: true, notes: 'Mud engineer + chemicals' });
  breakdown.push({ item: 'Cementing Services', category: 'service', cost: sections.length * 75000, depthDependent: true, notes: `${sections.length} strings cemented` });
  breakdown.push({ item: 'Wireline Logging', category: 'service', cost: 80000, depthDependent: false, notes: 'Open hole + cased hole logs' });
  breakdown.push({ item: 'Casing Running', category: 'service', cost: sections.length * 45000, depthDependent: true, notes: 'Casing crew + equipment' });
  const totalService = totalDrillingDays * (2500 + 1800) + sections.length * (75000 + 45000) + 80000;

  let totalLogistics = 0;
  if (includeLogistics && locationType === 'offshore') {
    breakdown.push({ item: 'Supply Vessels (PSV)', category: 'logistics', cost: totalDrillingDays * 15000, depthDependent: true, notes: '2 PSVs @ $15K/day' });
    breakdown.push({ item: 'Helicopter Support', category: 'logistics', cost: totalDrillingDays * 5000, depthDependent: true, notes: 'Crew changes weekly' });
    breakdown.push({ item: 'Shore Base & Fuel', category: 'logistics', cost: totalDrillingDays * 8000, depthDependent: true, notes: 'Fuel, water, bulk material' });
    totalLogistics = totalDrillingDays * (15000 + 5000 + 8000);
  } else if (includeLogistics) {
    breakdown.push({ item: 'Access Road & Pad', category: 'logistics', cost: 250000, depthDependent: false, notes: 'Well pad construction' });
    breakdown.push({ item: 'Water Supply', category: 'logistics', cost: totalDrillingDays * 2000, depthDependent: true, notes: 'Water trucks + storage' });
    breakdown.push({ item: 'Camp & Facilities', category: 'logistics', cost: totalDrillingDays * 1200, depthDependent: true, notes: 'Crew camp + catering' });
    breakdown.push({ item: 'Waste Disposal', category: 'logistics', cost: totalDrillingDays * 1500, depthDependent: true, notes: 'Cuttings, waste water disposal' });
    totalLogistics = 250000 + totalDrillingDays * (2000 + 1200 + 1500);
  }

  const subtotal = totalTangible + totalIntangible + totalService + totalLogistics;
  const contingency = subtotal * 0.15;
  const totalCost = subtotal + contingency;

  return { totalCost, breakdown, contingency };
}

// ─── TORQUE & DRAG ───────────────────────────────────────────────────────

export function calculateTorqueDrag(
  depth_ft: number,
  inclination_deg: number,
  azimuth_deg: number,
  mudWeight_ppg: number,
  frictionFactor: number,
  pipeOD_in: number,
  pipeWeight_lbft: number
): TorqueDragResult {
  const rad = inclination_deg * Math.PI / 180;
  const bf = 1 - (mudWeight_ppg / 65.5);
  const buoyedWeight = pipeWeight_lbft * bf;
  const tension = buoyedWeight * depth_ft * Math.cos(rad) / 1000;
  const normalForce = buoyedWeight * depth_ft * Math.sin(rad);
  const drag = (normalForce * frictionFactor) / 1000;
  const torque = (pipeOD_in / 24) * normalForce * frictionFactor;

  let bucklingRisk: 'None' | 'Sinusoidal' | 'Helical' = 'None';
  if (inclination_deg > 45 && drag > tension * 0.8) bucklingRisk = 'Helical';
  else if (inclination_deg > 30 && drag > tension * 0.5) bucklingRisk = 'Sinusoidal';

  return {
    depth_ft, torque_ftlb: Math.round(torque),
    drag_klb: Math.round(drag * 10) / 10,
    tension_klb: Math.round(tension * 10) / 10,
    bucklingRisk,
  };
}

// ─── KICK TOLERANCE ──────────────────────────────────────────────────────

export function calculateKickTolerance(
  shoeDepth_ft: number,
  holeDepth_ft: number,
  mudWeight_ppg: number,
  formationFracGradient_psiPerFt: number,
  formationPoreGradient_psiPerFt: number,
  holeDiameter_in: number,
  drillPipeOD_in: number
): KickTolerance {
  const shoeFracPressure = formationFracGradient_psiPerFt * shoeDepth_ft;
  const mudHydrostatic = 0.052 * mudWeight_ppg * shoeDepth_ft;
  const MAASP = shoeFracPressure - mudHydrostatic;

  const annCap_bblPerFt = (holeDiameter_in ** 2 - drillPipeOD_in ** 2) / 1029.4;
  const kickHeightMax = MAASP / (0.052 * (mudWeight_ppg - 1.0));
  const kickVolumeMax = kickHeightMax * annCap_bblPerFt;
  const killMW = mudWeight_ppg + (MAASP / (0.052 * holeDepth_ft));

  return {
    shoeDepth_ft,
    kickVolume_bbl: Math.round(kickVolumeMax * 10) / 10,
    maxAllowableSurfacePressure_psi: Math.round(MAASP),
    killMudWeight_ppg: Math.round(killMW * 10) / 10,
    safetyMargin_bbl: Math.round(kickVolumeMax * 0.8 * 10) / 10,
  };
}

// ─── SERVICE COSTS ───────────────────────────────────────────────────────

export function estimateServiceCosts(
  totalDays: number,
  hasSlickline: boolean,
  hasCoring: boolean,
  hasWellTesting: boolean
): { item: string; dailyCost: number; totalCost: number }[] {
  const services = [
    { item: 'Directional Drilling (MWD/LWD)', dailyCost: 4500, active: true },
    { item: 'Mud Engineering', dailyCost: 2500, active: true },
    { item: 'Solids Control', dailyCost: 1800, active: true },
    { item: 'Cementing (per job)', dailyCost: 0, active: true, fixed: 65000 },
    { item: 'Wireline Logging (per run)', dailyCost: 0, active: true, fixed: 35000 },
    { item: 'Mud Logging', dailyCost: 1800, active: true },
    { item: 'Casing Running', dailyCost: 3500, active: true },
    { item: 'Slickline', dailyCost: 1200, active: hasSlickline },
    { item: 'Coring Services', dailyCost: 5500, active: hasCoring },
    { item: 'Well Testing', dailyCost: 8000, active: hasWellTesting },
  ];

  return services
    .filter(s => s.active)
    .map(s => ({
      item: s.item,
      dailyCost: s.dailyCost,
      totalCost: s.dailyCost > 0 ? s.dailyCost * totalDays : (s as any).fixed ?? 0,
    }));
}

// ─── HSE PLAN ────────────────────────────────────────────────────────────

export function generateHSEPlan(
  locationType: RigLocation,
  containsH2S: boolean,
  nearUrbanArea: boolean
): HSEPlan {
  const hazidRisks = [
    { hazard: 'Well control incident (kick/blowout)', likelihood: 2, consequence: 5, mitigation: 'BOP testing schedule, crew well control training, kick drills, real-time monitoring' },
    { hazard: 'H2S release', likelihood: containsH2S ? 3 : 1, consequence: 5, mitigation: 'H2S monitors, breathing apparatus, wind socks, evacuation plan, flaring system' },
    { hazard: 'Lost circulation', likelihood: 3, consequence: 3, mitigation: 'LCM materials on site, predefined LCM pill formulations, ECD management' },
    { hazard: 'Pipe stuck', likelihood: 3, consequence: 2, mitigation: 'Torque/drag monitoring, jar placement in BHA, LCM sweep schedule' },
    { hazard: 'Dropped object', likelihood: 2, consequence: 4, mitigation: 'DROPS program, derrick inspection, red zone management' },
    { hazard: 'Fracture at shoe', likelihood: 2, consequence: 4, mitigation: 'LOT/FIT before drilling ahead, ECD management, max allowable surface pressure' },
    { hazard: 'Personnel injury', likelihood: 3, consequence: 3, mitigation: 'JSA, PTW, STOP card program, safety coaching' },
    { hazard: 'Fire/explosion', likelihood: 2, consequence: 5, mitigation: 'Gas detection, hot work permit, firefighting equipment, ignition source control' },
  ];

  const emergencyProcedures = [
    'Emergency Shutdown (ESD) - all personnel to muster stations',
    'Well control - shut in well using hard shut-in procedure',
    'Man overboard' + (locationType === 'offshore' ? ' - deploy rescue boat' : ' - N/A onshore'),
    'Medical emergency - contact rig medic, arrange medevac if needed',
    'Fire/explosion - activate fire pumps, isolate fuel sources, muster',
    'Gas release' + (containsH2S ? ' / H2S - don breathing apparatus, monitor wind direction' : ' - monitor LEL levels'),
    'Spill response - activate spill response team, deploy containment booms (offshore)',
    'Severe weather - secure well, suspend operations if winds exceed limits',
  ];

  return {
    hazidRisks,
    emergencyProcedures,
    oilSpillContingency: locationType === 'offshore'
      ? 'Tier 1: Rig-based equipment (booms, skimmers, dispersants). Tier 2: OSRL/industry mutual aid within 24hrs. Tier 3: National response within 48hrs.'
      : 'Secondary containment on pad. Lined reserve pit. Spill response kit on location.',
    shallowGasProcedure: 'Pilot hole drilled to 500ft below conductor shoe. Flow check every 50ft. Diverter system installed and tested.',
    wellControlBridle: 'BOP stack tested to rated working pressure before nippling up. Function test every 7 days. Pressure test every 21 days.',
  };
}

// ─── TIME ESTIMATOR ──────────────────────────────────────────────────────

export function estimateSectionDays(
  depthFrom_ft: number,
  depthTo_ft: number,
  avgROP_ftHr: number,
  trippingSpeed_ftHr: number,
  casingRunTime_hrs: number,
  loggingTime_hrs: number,
  nptFactor: number
): { drillingDays: number; trippingDays: number; totalDays: number; breakdown: string[] } {
  const sectionLength = depthTo_ft - depthFrom_ft;
  const drillingHours = sectionLength / Math.max(avgROP_ftHr, 1);
  const trippingHours = (depthTo_ft / trippingSpeed_ftHr) * 2;
  const totalHours = (drillingHours + trippingHours + casingRunTime_hrs + loggingTime_hrs) * nptFactor;
  const totalDays = totalHours / 24;

  return {
    drillingDays: drillingHours / 24,
    trippingDays: trippingHours / 24,
    totalDays: Math.round(totalDays * 10) / 10,
    breakdown: [
      `Drilling: ${(drillingHours / 24).toFixed(1)} days @ ${avgROP_ftHr} ft/hr`,
      `Tripping: ${(trippingHours / 24).toFixed(1)} days (RT @ ${trippingSpeed_ftHr} ft/hr)`,
      `Casing run: ${(casingRunTime_hrs / 24).toFixed(1)} days`,
      `Logging: ${(loggingTime_hrs / 24).toFixed(1)} days`,
      `NPT factor: ${nptFactor}x (${((nptFactor - 1) * 100).toFixed(0)}% contingency)`,
    ],
  };
}