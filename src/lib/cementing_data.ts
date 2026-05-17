/**
 * Cementing Reference Data
 * API Spec 10A / RP 10B-2 reference tables
 */

export interface CementClassData {
    class: string;
    apiClass: string;
    description: string;
    depthRange: string;
    defaultDensity: number;  // ppg
    defaultYield: number;    // cuft/sk
    waterRequirement: number; // gal/sk
    thickeningTime: string;  // typical
    compressive8hr: string;  // typical 8hr @ temp
    application: string;
}

export interface CementAdditive {
    name: string;
    type: string;
    dosage: string;
    bwocRange: string;
    effect: string;
    color: string;
    impact: {
        density: number;        // Δ ppg
        thickeningTime: number; // % change
        compressiveStrength: number; // % change
        fluidLoss: number;      // % reduction
        freeWater: number;      // % reduction
        rheology: number;       // % change YP/PV
    };
}

export interface CentralizerType {
    name: string;
    type: 'bow-spring' | 'rigid' | 'semi-rigid';
    odRange: string;
    restoringForce: string;  // lbf
    runningForce: string;    // lbf
    standoff: string;        // %
    application: string;
}

// ── API Cement Classes ──
export const CEMENT_CLASSES: CementClassData[] = [
    {
        class: 'A',
        apiClass: 'API Class A',
        description: 'General purpose cement for use from surface to 6,000 ft when no special properties are required.',
        depthRange: '0 – 6,000 ft',
        defaultDensity: 15.6,
        defaultYield: 1.18,
        waterRequirement: 5.19,
        thickeningTime: '90 min @ 100°F',
        compressive8hr: '1,500 psi @ 100°F',
        application: 'Surface casing, shallow wells'
    },
    {
        class: 'B',
        apiClass: 'API Class B',
        description: 'Moderate sulfate resistance. Suitable for use from surface to 6,000 ft.',
        depthRange: '0 – 6,000 ft',
        defaultDensity: 15.6,
        defaultYield: 1.18,
        waterRequirement: 5.19,
        thickeningTime: '90 min @ 100°F',
        compressive8hr: '1,500 psi @ 100°F',
        application: 'Surface casing where sulfate resistance needed'
    },
    {
        class: 'C',
        apiClass: 'API Class C',
        description: 'High early strength cement. Available in ordinary, moderate, and high sulfate-resistant types.',
        depthRange: '0 – 6,000 ft',
        defaultDensity: 14.8,
        defaultYield: 1.32,
        waterRequirement: 6.32,
        thickeningTime: '90 min @ 100°F',
        compressive8hr: '2,000 psi @ 100°F',
        application: 'Surface pipe — early strength development'
    },
    {
        class: 'D',
        apiClass: 'API Class D',
        description: 'Retarded cement for moderately high temperatures and pressures.',
        depthRange: '6,000 – 10,000 ft',
        defaultDensity: 16.4,
        defaultYield: 1.10,
        waterRequirement: 4.29,
        thickeningTime: '4 hr @ 170°F',
        compressive8hr: '1,000 psi @ 170°F',
        application: 'Intermediate casing — HPHT conditions'
    },
    {
        class: 'E',
        apiClass: 'API Class E',
        description: 'Retarded cement for high temperatures and pressures.',
        depthRange: '10,000 – 14,000 ft',
        defaultDensity: 16.4,
        defaultYield: 1.10,
        waterRequirement: 4.29,
        thickeningTime: '4 hr @ 206°F',
        compressive8hr: '1,000 psi @ 206°F',
        application: 'Deep production casing'
    },
    {
        class: 'F',
        apiClass: 'API Class F',
        description: 'Retarded cement for extremely high temperatures and pressures.',
        depthRange: '10,000 – 16,000 ft',
        defaultDensity: 16.4,
        defaultYield: 1.10,
        waterRequirement: 4.29,
        thickeningTime: '4 hr @ 260°F',
        compressive8hr: '1,000 psi @ 260°F',
        application: 'Deep HPHT production casing'
    },
    {
        class: 'G',
        apiClass: 'API Class G',
        description: 'Basic cement (no additives except C₃A ≤ 3% and calcium sulfate). Compatible with accelerators or retarders for well conditions 0-8,000 ft as mixed, deeper with retarders.',
        depthRange: '0 – 8,000 ft (neat)',
        defaultDensity: 15.8,
        defaultYield: 1.15,
        waterRequirement: 4.49,
        thickeningTime: '90-120 min @ 125°F',
        compressive8hr: '1,500 psi @ 140°F',
        application: 'Universal workhorse — most common primary cement'
    },
    {
        class: 'H',
        apiClass: 'API Class H',
        description: 'Similar to Class G but coarser grind. No additives except calcium sulfate ≤ 3% and optionally C₃A ≤ 3%.',
        depthRange: '0 – 8,000 ft (neat)',
        defaultDensity: 16.4,
        defaultYield: 1.06,
        waterRequirement: 4.29,
        thickeningTime: '90-120 min @ 125°F',
        compressive8hr: '1,500 psi @ 140°F',
        application: 'Basic cement — coarser grind for higher density'
    },
    {
        class: 'J',
        apiClass: 'API Class J',
        description: 'Specially manufactured cement for ultra-deep, high temperature wells. Requires no retarders at high temps.',
        depthRange: '12,000 – 16,000+ ft',
        defaultDensity: 16.0,
        defaultYield: 1.12,
        waterRequirement: 4.40,
        thickeningTime: '4+ hr @ 300°F',
        compressive8hr: '800 psi @ 300°F',
        application: 'Ultra-deep wells — HPHT, extended pumping times'
    }
];

// ── Cement Additive Library ──
export const CEMENT_ADDITIVES: CementAdditive[] = [
    {
        name: 'Calcium Chloride',
        type: 'Accelerator',
        dosage: '2 – 4% BWOC',
        bwocRange: '1 – 4%',
        effect: 'Reduces thickening time 40-60%. Increases early compressive strength 100-200%. Effective to ~150°F BHCT.',
        color: 'text-amber-400',
        impact: { density: 0.1, thickeningTime: -50, compressiveStrength: 80, fluidLoss: 0, freeWater: 20, rheology: 15 }
    },
    {
        name: 'Sodium Chloride',
        type: 'Accelerator / Dispersant',
        dosage: '2 – 5% BWOC',
        bwocRange: '2 – 10%',
        effect: 'Mild accelerator at < 5%. Dispersant effect at higher concentrations. Prevents clay hydration in salt formations.',
        color: 'text-amber-300',
        impact: { density: 0.05, thickeningTime: -20, compressiveStrength: 30, fluidLoss: 5, freeWater: 10, rheology: -10 }
    },
    {
        name: 'Lignosulfonate',
        type: 'Retarder',
        dosage: '0.2 – 0.5% BWOC',
        bwocRange: '0.1 – 1.0%',
        effect: 'Standard retarder for moderate temperatures (< 200°F BHCT). Extends thickening time proportionally.',
        color: 'text-blue-400',
        impact: { density: 0, thickeningTime: 60, compressiveStrength: -10, fluidLoss: 0, freeWater: 5, rheology: -5 }
    },
    {
        name: 'CMHEC / HEC',
        type: 'Retarder / Fluid Loss',
        dosage: '0.3 – 1.0% BWOC',
        bwocRange: '0.2 – 2.0%',
        effect: 'Cellulose-based retarder with fluid loss control. Effective to 230°F BHCT. Provides ≤ 50 ml/30min fluid loss.',
        color: 'text-blue-300',
        impact: { density: 0, thickeningTime: 40, compressiveStrength: -15, fluidLoss: 60, freeWater: 30, rheology: 25 }
    },
    {
        name: 'AMPS Copolymer',
        type: 'HT Retarder / Fluid Loss',
        dosage: '0.5 – 2.0% BWOC',
        bwocRange: '0.3 – 4.0%',
        effect: 'Synthetic high-temperature retarder and fluid loss additive. Stable to 400°F+. Required above 300°F.',
        color: 'text-purple-400',
        impact: { density: 0, thickeningTime: 70, compressiveStrength: -5, fluidLoss: 85, freeWater: 40, rheology: 15 }
    },
    {
        name: 'Silica Flour (35%)',
        type: 'Strength Stabilizer',
        dosage: '35 – 40% BWOC',
        bwocRange: '35 – 50%',
        effect: 'Prevents compressive strength retrogression (C₂SH α → C₆S₆H) above 230°F. Reduces permeability.',
        color: 'text-slate-400',
        impact: { density: 0.3, thickeningTime: 20, compressiveStrength: 40, fluidLoss: 10, freeWater: 10, rheology: 10 }
    },
    {
        name: 'Bentonite (Gel)',
        type: 'Extender',
        dosage: '2 – 10% BWOC',
        bwocRange: '1 – 16%',
        effect: 'Reduces slurry density (lightweight to ~12 ppg). Increases yield. Reduces compressive strength. Pre-blended in some commercial cements.',
        color: 'text-amber-500',
        impact: { density: -1.5, thickeningTime: 10, compressiveStrength: -40, fluidLoss: -10, freeWater: 80, rheology: 40 }
    },
    {
        name: 'Pozzolan / Fly Ash',
        type: 'Extender',
        dosage: '25 – 50% BWOC',
        bwocRange: '25 – 100%',
        effect: 'Lightweight extender. Pozzolanic reaction gives long-term strength. Good sulphate resistance. Reduces heat of hydration.',
        color: 'text-gray-400',
        impact: { density: -1.0, thickeningTime: 15, compressiveStrength: -25, fluidLoss: -5, freeWater: 50, rheology: 20 }
    },
    {
        name: 'Hematite',
        type: 'Weighting Agent',
        dosage: '10 – 100% BWOC',
        bwocRange: '10 – 150%',
        effect: 'Increases slurry density up to 22+ ppg. SG = 5.0. Requires additional water for wetting. May segregate if over-dosed.',
        color: 'text-red-400',
        impact: { density: 3.0, thickeningTime: -5, compressiveStrength: 20, fluidLoss: 0, freeWater: -30, rheology: 30 }
    },
    {
        name: 'Barite',
        type: 'Weighting Agent (Backup)',
        dosage: '10 – 80% BWOC',
        bwocRange: '10 – 100%',
        effect: 'Moderate weight-up agent. SG = 4.2. Less segregation than hematite but lower maximum density.',
        color: 'text-red-300',
        impact: { density: 2.0, thickeningTime: -5, compressiveStrength: 10, fluidLoss: 0, freeWater: -20, rheology: 20 }
    },
    {
        name: 'Latex',
        type: 'Fluid Loss / Gas Block',
        dosage: '1 – 2 gal/sk',
        bwocRange: '0.5 – 3 gal/sk',
        effect: 'Polymer film seals cement matrix. Reduces fluid loss to < 25 ml. Prevents gas migration. Improves bonding.',
        color: 'text-emerald-400',
        impact: { density: -0.2, thickeningTime: -10, compressiveStrength: -10, fluidLoss: 95, freeWater: 60, rheology: 30 }
    },
    {
        name: 'Microsilica',
        type: 'Anti-Gas Migration',
        dosage: '10 – 30% BWOC',
        bwocRange: '5 – 40%',
        effect: 'Ultra-fine silica fills pore throats. Prevents gas percolation through setting cement. Reduces transition time.',
        color: 'text-cyan-400',
        impact: { density: 0.1, thickeningTime: -5, compressiveStrength: 30, fluidLoss: 50, freeWater: 90, rheology: 20 }
    },
    {
        name: 'Gilsonite',
        type: 'Lost Circulation',
        dosage: '10 – 50 lb/sk',
        bwocRange: '5 – 50 lb/sk',
        effect: 'Granular bridging material for lost circulation zones. Deforms into fractures and seals. Reduces slurry density slightly.',
        color: 'text-yellow-400',
        impact: { density: -0.5, thickeningTime: 0, compressiveStrength: -15, fluidLoss: 30, freeWater: -10, rheology: -5 }
    },
    {
        name: 'Cellophane Flakes',
        type: 'Lost Circulation',
        dosage: '0.5 – 2 lb/sk',
        bwocRange: '0.25 – 5 lb/sk',
        effect: 'Fibrous bridging additive. Effective in sealing permeable and vugular formations. Biodegradable.',
        color: 'text-yellow-300',
        impact: { density: 0, thickeningTime: 0, compressiveStrength: -5, fluidLoss: 40, freeWater: -5, rheology: -5 }
    },
    {
        name: 'Polypropylene Fibers',
        type: 'Mechanical Reinforcement',
        dosage: '0.5 – 1.5 lb/sk',
        bwocRange: '0.25 – 3 lb/sk',
        effect: 'Improves tensile strength and impact resistance. Reduces microcracking during perforating. Increases ductility.',
        color: 'text-indigo-400',
        impact: { density: 0, thickeningTime: 0, compressiveStrength: 10, fluidLoss: 0, freeWater: 0, rheology: 5 }
    },
    {
        name: 'Defoamer',
        type: 'Surface Modifier',
        dosage: '0.05 – 0.2 gal/sk',
        bwocRange: '0.02 – 0.5 gal/sk',
        effect: 'Controls foaming from organic additives (lignosulfonates, latex). Prevents air entrapment and density variation.',
        color: 'text-gray-300',
        impact: { density: 0.1, thickeningTime: 0, compressiveStrength: 5, fluidLoss: 0, freeWater: 0, rheology: -5 }
    },
    {
        name: 'Dispersant',
        type: 'Rheology Modifier',
        dosage: '0.1 – 0.5% BWOC',
        bwocRange: '0.05 – 1.0%',
        effect: 'Polynaphthalene sulfonate (PNS). Reduces yield point for turbulent flow at lower rates. Enables higher density with lower viscosity.',
        color: 'text-teal-400',
        impact: { density: 0, thickeningTime: -5, compressiveStrength: 5, fluidLoss: 0, freeWater: 0, rheology: -40 }
    }
];

// ── Centralizer Type Reference ──
export const CENTRALIZER_TYPES: CentralizerType[] = [
    {
        name: 'Bow-Spring (Standard)',
        type: 'bow-spring',
        odRange: '4½" – 13⅝"',
        restoringForce: '800 – 2,500 lbf',
        runningForce: '200 – 600 lbf',
        standoff: '65 – 70%',
        application: 'Vertical to moderate inclination wells. Good restoring force at low cost.'
    },
    {
        name: 'Bow-Spring (High-Performance)',
        type: 'bow-spring',
        odRange: '4½" – 10¾"',
        restoringForce: '2,500 – 5,000 lbf',
        runningForce: '400 – 1,000 lbf',
        standoff: '70 – 80%',
        application: 'Deviated wells >30° where higher restoring force needed.'
    },
    {
        name: 'Rigid (Straight Vane)',
        type: 'rigid',
        odRange: '4½" – 20"',
        restoringForce: 'N/A (fixed OD)',
        runningForce: '300 – 800 lbf',
        standoff: '50 – 65%',
        application: 'Severe doglegs, horizontal wells, and close-tolerance applications.'
    },
    {
        name: 'Semi-Rigid (Spiral)',
        type: 'semi-rigid',
        odRange: '4½" – 13⅝"',
        restoringForce: '1,000 – 2,000 lbf',
        runningForce: '250 – 550 lbf',
        standoff: '60 – 70%',
        application: 'Intermediate applications — turbulence generation for mud removal.'
    }
];

// ── CBL Amplitude Reference ──
export const CBL_REFERENCE = {
    freePipe_13_375: 72,
    freePipe_9_625: 68,
    freePipe_7: 63,
    freePipe_5_5: 55,
    freePipe_4_5: 48,
    excellent: '< 5 mV',
    good: '5 – 15 mV',
    fair: '15 – 30 mV',
    poor: '30 – 50 mV',
    freePipe: '> 50 mV'
};

// ── Pump Schedule Reference ──
export const CEMENT_PUMP_SCHEDULE = [
    { fluid: 'Chemical Wash', volume: '20 bbl', rate: '3 bbl/min', time: '7 min', color: '#06b6d4' },
    { fluid: 'Spacer (Weighted)', volume: '50 bbl', rate: '4 bbl/min', time: '13 min', color: '#8b5cf6' },
    { fluid: 'Lead Slurry', volume: '200 bbl', rate: '5 bbl/min', time: '40 min', color: '#a3a3a3' },
    { fluid: 'Tail Slurry', volume: '100 bbl', rate: '4 bbl/min', time: '25 min', color: '#f59e0b' },
    { fluid: 'Displacement', volume: '250 bbl', rate: '5 bbl/min', time: '50 min', color: '#10b981' }
];

// ── Slurry Quality Gates ──
export const SLURRY_QUALITY_SPECS = [
    { parameter: 'Free Water', spec: '< 1.0% (vertical), < 0% (horizontal)', standard: 'API 10B-2 Sec 17' },
    { parameter: 'Fluid Loss', spec: '< 50 ml/30min (primary), < 100 ml (filler)', standard: 'API 10B-2 Sec 15' },
    { parameter: 'Thickening Time', spec: 'Job time + 1-2 hr safety margin', standard: 'API 10B-2 Sec 14' },
    { parameter: 'Compressive Strength', spec: '> 500 psi @ 8 hr, > 1,500 psi @ 24 hr', standard: 'API 10B-2 Sec 7' },
    { parameter: 'Rheology (PV)', spec: '< 100 cP (pumpable)', standard: 'API 10B-2 Sec 12' },
    { parameter: 'Settling', spec: '< 0.5 ppg density Δ top-to-bottom', standard: 'API 10B-2 Sec 17' }
];