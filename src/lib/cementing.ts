/**
 * Cementing Engineering Calculation Library
 * API RP 10B / API Spec 10A compliant
 */

// ── Types ──
export interface SlurryInputs {
    cementClass: string;
    density: number;       // ppg
    yield: number;         // cuft/sk
    waterRatio: number;    // gal/sk
    waterDensity: number;  // ppg (fresh=8.34, brine=10.0)
    additiveFrac: number;  // % BWOC
    additiveDensity: number; // ppg
}

export interface ThickeningInputs {
    bhst: number;          // °F
    retarderPct: number;   // % BWOC
    acceleratorPct: number; // % BWOC
    silicaPresent: boolean;
}

export interface CompressiveInputs {
    curingTime: number;    // hours
    curingTemp: number;    // °F
    silicaPct: number;     // % BWOC
    density: number;       // ppg
}

export interface AnnularInputs {
    holeDiameter: number;  // inches
    casingOD: number;      // inches
    intervalLength: number; // ft
    excessFactor: number;  // dimensionless (1.1 = 10%)
}

export interface WellheadInputs {
    casingID: number;      // inches
    shoeDepth: number;     // ft
    mudWeight: number;     // ppg
    waterDepth: number;    // ft (0 for land)
    airGap: number;        // ft
}

export interface CentralizerInputs {
    casingOD: number;      // inches
    holeDiameter: number;  // inches
    spacing: number;       // ft between centralizers
    deviation: number;     // degrees from vertical
    casingWeight: number;  // lb/ft
    type: 'bow-spring' | 'rigid' | 'semi-rigid';
    mudWeight: number;     // ppg
}

export interface CementBondInputs {
    compressiveStrength: number; // psi
    casingSize: number;          // inches OD
    casingThickness: number;     // inches
    cementDensity: number;       // ppg
    microannulusGap: number;     // microns (0 = perfect)
}

// ── Constants ──
const SACK_WEIGHT_LB = 94; // standard cement sack
const GAL_PER_CUFT = 7.4805;
const GAL_PER_BBL = 42;

// ── Slurry Calculations ──

/** Calculate slurry density from water ratio and additives */
export function calculateSlurryDensity(inputs: SlurryInputs): number {
    const cementMass = SACK_WEIGHT_LB;
    const waterMass = inputs.waterRatio * inputs.waterDensity;
    const additiveMass = (inputs.additiveFrac / 100) * cementMass;

    const cementVol = SACK_WEIGHT_LB / (inputs.density * 0.1198); // cuft (approx)
    const waterVol = inputs.waterRatio / GAL_PER_CUFT;
    const additiveVol = additiveMass / (inputs.additiveDensity * 0.1198);

    const totalMass = cementMass + waterMass + additiveMass;
    const totalVol = cementVol + waterVol + additiveVol + 1e-6;

    return totalMass / (totalVol * 8.3454); // lbs/cuft -> ppg
}

/** Calculate slurry yield (cuft per sack) */
export function calculateSlurryYield(
    waterRatio: number,   // gal/sk
    additiveVol: number    // gal/sk from additives
): number {
    // Cement absolute volume ≈ 3.59 gal/sk (0.479 cuft)
    return (3.59 + waterRatio + additiveVol) / GAL_PER_CUFT;
}

/** Calculate water requirement for slurry batch */
export function calculateWaterRequirement(
    sacks: number,
    waterRatio: number,   // gal/sk
    additiveWaterDemand: number // gal/sk additional
): { totalGal: number; totalBbl: number } {
    const totalGal = sacks * (waterRatio + additiveWaterDemand);
    return {
        totalGal,
        totalBbl: totalGal / GAL_PER_BBL
    };
}

// ── Thickening Time ──

/** Calculate estimated thickening time based on BHST and retarder */
export function calculateThickeningTime(inputs: ThickeningInputs): { hours: number; min: number; totalMin: number; interpretation: string } {
    // Base thickening time at 200°F: ~120 min for neat Class G
    let baseMin = 120;

    // Temperature effect: every 10°F above 200°F halves thickening time roughly
    const tempFactor = Math.pow(2, (inputs.bhst - 200) / 10);
    let totalMin = baseMin / tempFactor;

    // Retarder effect: each 1% BWOC adds ~60% to thickening time
    const retarderMultiplier = 1 + (inputs.retarderPct * 0.6);
    totalMin *= retarderMultiplier;

    // Accelerator effect: each 1% BWOC reduces thickening time ~20%
    const acceleratorMultiplier = 1 - (inputs.acceleratorPct * 0.2);
    totalMin *= Math.max(0.1, acceleratorMultiplier);

    // Silica reduces sensitivity at high temp
    if (inputs.silicaPresent && inputs.bhst > 230) {
        totalMin *= 1.3;
    }

    // Clamp
    totalMin = Math.max(30, Math.min(480, totalMin));

    const hours = Math.floor(totalMin / 60);
    const min = Math.round(totalMin % 60);

    let interpretation: string;
    if (totalMin < 120) interpretation = 'Short — risk of premature set';
    else if (totalMin < 240) interpretation = 'Adequate for most primary jobs';
    else if (totalMin < 360) interpretation = 'Good for long liners / large volumes';
    else interpretation = 'Extended — verify retarder compatibility';

    return { hours, min, totalMin: Math.round(totalMin), interpretation };
}

// ── Compressive Strength ──

/** Calculate compressive strength development over time */
export function calculateCompressiveStrength(inputs: CompressiveInputs): number {
    // Base ultimate compressive strength: density-dependent
    const UCS = 2000 * Math.pow(inputs.density / 14.0, 2.5);

    // Time development (exponential approach)
    // t50 = time to reach 50% UCS, roughly 12 hr at 120°F
    const t50 = 12 * Math.pow(1.5, (100 - inputs.curingTemp) / 50);
    const frac = inputs.curingTime / (inputs.curingTime + t50);

    // Temperature acceleration
    const tempAccel = Math.pow(1.15, (inputs.curingTemp - 80) / 20);
    let strength = UCS * frac * tempAccel;

    // Silica flour enhancement for high-temp
    if (inputs.silicaPct > 25 && inputs.curingTemp > 230) {
        strength *= 1.4;
    } else if (inputs.curingTemp > 230 && inputs.silicaPct < 25) {
        // Strength retrogression without silica
        strength *= 0.3;
    }

    return Math.round(strength);
}

/** Generate compressive strength curve data points */
export function generateStrengthCurve(inputs: CompressiveInputs, points: number = 20): { time: number; strength: number }[] {
    const maxTime = 72; // hours
    const curve: { time: number; strength: number }[] = [];
    for (let i = 1; i <= points; i++) {
        const time = (maxTime / points) * i;
        curve.push({
            time: Math.round(time * 10) / 10,
            strength: calculateCompressiveStrength({ ...inputs, curingTime: time })
        });
    }
    return curve;
}

// ── Annular Volume Calculations ──

/** Calculate cement volume for an annular section */
export function calculateCementVolume(inputs: AnnularInputs): {
    annularVolBbl: number;
    annularVolCuft: number;
    sacksNeeded: number;
    waterBbl: number;
} {
    const holeArea = Math.PI * Math.pow(inputs.holeDiameter / 2, 2); // sq in
    const casingArea = Math.PI * Math.pow(inputs.casingOD / 2, 2);
    const annularAreaSqIn = holeArea - casingArea;
    const annularVolCuft = (annularAreaSqIn / 144) * inputs.intervalLength * inputs.excessFactor;
    const annularVolBbl = annularVolCuft / 5.6146;

    // Sacks needed (yield ≈ 1.15 cuft/sk for typical 15.8 ppg)
    const yieldCuftPerSk = 1.15;
    const sacksNeeded = Math.ceil(annularVolCuft / yieldCuftPerSk);
    const waterBbl = (sacksNeeded * 5.2) / GAL_PER_BBL; // ~5.2 gal/sk

    return { annularVolBbl, annularVolCuft, sacksNeeded, waterBbl };
}

/** Calculate displacement volume to bump plug */
export function calculateDisplacementVolume(casingID: number, depth: number): {
    displacementBbl: number;
    strokesNeeded: number;
} {
    const areaSqIn = Math.PI * Math.pow(casingID / 2, 2);
    const volCuft = (areaSqIn / 144) * depth;
    const displacementBbl = volCuft / 5.6146;

    // Assume 15 bbl triplex pump capacity per stroke ~0.15 bbl
    const bblPerStroke = 0.15;
    const strokesNeeded = Math.ceil(displacementBbl / bblPerStroke);

    return { displacementBbl, strokesNeeded };
}

// ── ECD & Hydrostatics ──

/** Calculate Effective Circulating Density */
export function calculateECD(
    mudDensity: number,      // ppg
    pumpRate: number,         // bbl/min
    holeDiameter: number,     // inches
    casingOD: number,         // inches
    depth: number,            // ft
    plasticViscosity: number, // cP
    yieldPoint: number        // lb/100ft²
): { ecd: number; apLoss: number; ecdAboveFrac: number; fracGradient: number; isSafe: boolean } {
    // Annular velocity
    const holeArea = Math.PI * Math.pow(holeDiameter / 2, 2);
    const casingArea = Math.PI * Math.pow(casingOD / 2, 2);
    const annularAreaSqIn = holeArea - casingArea;
    const annularVelocity = (pumpRate * 5.6146 * 144) / (annularAreaSqIn * 60); // ft/sec

    // Annular pressure loss (simplified Bingham plastic)
    const dh = holeDiameter - casingOD; // hydraulic diameter
    const apLoss = (
        (plasticViscosity * annularVelocity * depth) / (1500 * dh * dh) +
        (yieldPoint * depth) / (225 * dh)
    );

    const ecd = mudDensity + apLoss / (0.052 * depth);

    // Typical fracture gradient ~0.75 psi/ft for normal pressure
    const fracGradient = 0.75;
    const fracPPGatDepth = fracGradient / 0.052;
    const ecdAboveFrac = ecd - fracPPGatDepth;
    const isSafe = ecd < fracPPGatDepth;

    return { ecd, apLoss, ecdAboveFrac, fracGradient, isSafe };
}

/** Calculate hydrostatic pressure at given depth */
export function calculateHydrostaticPressure(
    fluidDensity: number, // ppg
    columnHeight: number  // ft
): number {
    return 0.052 * fluidDensity * columnHeight;
}

// ── U-Tube Effect ──

/** Assess U-tube / free-fall risk during cementing */
export function calculateUTubeRisk(
    cementDensity: number,     // ppg
    cementColumnHeight: number, // ft
    mudDensity: number,        // ppg
    totalDepth: number,        // ft
    spacerDensity: number      // ppg
): { freeFallRisk: 'none' | 'low' | 'moderate' | 'high'; pressureImbalance: number; description: string } {
    const cementHydro = calculateHydrostaticPressure(cementDensity, cementColumnHeight);
    const mudHydro = calculateHydrostaticPressure(mudDensity, totalDepth - cementColumnHeight);

    // U-tube side: cement column
    const uTubeSide = cementHydro + calculateHydrostaticPressure(spacerDensity, 50); // assume 50 ft spacer

    // Annular side (simplified as equal height mud)
    const annulusSide = mudHydro;

    const pressureImbalance = uTubeSide - annulusSide;

    let freeFallRisk: 'none' | 'low' | 'moderate' | 'high';
    let description: string;

    if (pressureImbalance < 100) {
        freeFallRisk = 'none';
        description = 'Near-balanced conditions. Controlled placement expected.';
    } else if (pressureImbalance < 500) {
        freeFallRisk = 'low';
        description = 'Slight imbalance. Plug float equipment recommended.';
    } else if (pressureImbalance < 1000) {
        freeFallRisk = 'moderate';
        description = 'Significant U-tube. Use auto-fill float collar and restrict flow after displacement.';
    } else {
        freeFallRisk = 'high';
        description = 'CRITICAL: Severe free-fall risk. Stage cement or reduce Δ-density required.';
    }

    return { freeFallRisk, pressureImbalance, description };
}

// ── Free Water / Slurry Stability ──

/** Assess free water separation risk */
export function calculateFreeWaterRisk(
    freeWaterPct: number,    // API free water test %
    fluidLossMl: number,     // API fluid loss ml/30min
    deviationDeg: number     // wellbore deviation
): { risk: 'none' | 'low' | 'moderate' | 'high'; description: string; channels: boolean } {
    let riskScore = 0;

    if (freeWaterPct > 2.0) riskScore += 3;
    else if (freeWaterPct > 1.0) riskScore += 2;
    else if (freeWaterPct > 0.5) riskScore += 1;

    if (fluidLossMl > 200) riskScore += 2;
    else if (fluidLossMl > 100) riskScore += 1;

    // High deviation amplifies channeling
    if (deviationDeg > 60) riskScore += 2;
    else if (deviationDeg > 30) riskScore += 1;

    let risk: 'none' | 'low' | 'moderate' | 'high';
    let description: string;
    const channels = riskScore >= 2;

    if (riskScore === 0) {
        risk = 'none';
        description = 'Excellent slurry stability. No channeling expected.';
    } else if (riskScore <= 2) {
        risk = 'low';
        description = 'Acceptable. Consider minor slurry adjustments for critical zones.';
    } else if (riskScore <= 4) {
        risk = 'moderate';
        description = `${channels ? 'Potential channeling.' : ''} Reduce free water to <1% and improve fluid loss control.`;
    } else {
        risk = 'high';
        description = `${channels ? 'SEVERE channeling risk.' : ''} Reformulate slurry. Add anti-settling agents and dispersant.`;
    }

    return { risk, description, channels };
}

// ── Centralizer Calculations ──

/** Calculate centralizer standoff and optimal spacing */
export function calculateCentralizerStandoff(inputs: CentralizerInputs): {
    standoffPercent: number;
    recommendedSpacing: number;
    eccentricity: number;
    bowForceNeeded: number;
    interpretation: string;
} {
    const radialClearance = (inputs.holeDiameter - inputs.casingOD) / 2;

    // Standoff with current spacing
    // Bow-spring centralizers provide restoring force that decreases with spacing
    const maxStandoffMultiplier = inputs.type === 'bow-spring' ? 0.95 : inputs.type === 'rigid' ? 0.85 : 0.75;
    const spacingFactor = Math.min(1, 40 / Math.max(inputs.spacing, 1)); // optimal spacing ~40ft
    const deviationFactor = Math.cos(inputs.deviation * Math.PI / 180) * 0.3 + 0.7;

    const standoffPercent = maxStandoffMultiplier * spacingFactor * deviationFactor * 100;

    // API Spec 10D recommended spacing
    const recommendedSpacing = 40 * Math.cos(inputs.deviation * Math.PI / 180);

    // Eccentricity (0 = perfectly centered, 1 = fully against wall)
    const eccentricity = Math.max(0, 1 - standoffPercent / 100);

    // Estimated bow force needed
    const buoyedWeight = inputs.casingWeight * (1 - inputs.mudWeight / 65.45); // steel density = 65.45 ppg
    const bowForceNeeded = buoyedWeight * inputs.spacing * Math.sin(inputs.deviation * Math.PI / 180) * 2;

    let interpretation: string;
    if (standoffPercent > 67) interpretation = 'Good standoff — mud removal effective';
    else if (standoffPercent > 50) interpretation = 'Adequate standoff — consider additional centralizers in critical zones';
    else interpretation = 'Poor standoff — increase centralizer density or use rigid type';

    return { standoffPercent, recommendedSpacing: Math.round(recommendedSpacing), eccentricity, bowForceNeeded: Math.round(bowForceNeeded), interpretation };
}

// ── CBL Evaluation ──

/** Simulate Cement Bond Log (CBL) amplitude */
export function calculateCBLAmp(inputs: CementBondInputs): {
    amplitude_mV: number;
    bondIndex: number;
    interpretation: string;
    quality: 'excellent' | 'good' | 'fair' | 'poor' | 'free-pipe';
} {
    // Base amplitude for perfectly bonded pipe
    const idealAmp = 0.5; // mV for perfect bond

    // Microannulus increases amplitude
    const microannulusFactor = 1 + (inputs.microannulusGap / 10);

    // Compressive strength reduction
    const strengthFactor = Math.max(0.1, 2000 / Math.max(inputs.compressiveStrength, 100));

    // Casing size effect
    const casingFactor = 0.5 + (inputs.casingSize / 20);

    const amplitude = idealAmp * microannulusFactor * strengthFactor * casingFactor * 100; // to mV scale

    // Bond Index: 1 = perfect, 0 = free pipe
    const freePipeAmp = 60; // mV typical free pipe
    const bondIndex = Math.max(0, Math.min(1, 1 - (amplitude - 0.5) / (freePipeAmp - 0.5)));

    let quality: 'excellent' | 'good' | 'fair' | 'poor' | 'free-pipe';
    let interpretation: string;

    if (amplitude < 5) {
        quality = 'excellent';
        interpretation = 'Excellent zonal isolation. No channeling detected.';
    } else if (amplitude < 15) {
        quality = 'good';
        interpretation = 'Good bond. Minor amplitude anomalies — likely microannulus.';
    } else if (amplitude < 30) {
        quality = 'fair';
        interpretation = 'Partial bond. Potential channeling — correlation with VDL recommended.';
    } else if (amplitude < 50) {
        quality = 'poor';
        interpretation = 'Poor bond. Significant channeling likely. Remedial cementing recommended.';
    } else {
        quality = 'free-pipe';
        interpretation = 'Free pipe / no cement bond. Complete remedial job required.';
    }

    return {
        amplitude_mV: Math.round(amplitude * 10) / 10,
        bondIndex: Math.round(bondIndex * 1000) / 1000,
        interpretation,
        quality
    };
}

// ── Remedial / Squeeze Cement ──

/** Estimate squeeze cement volume and pressure */
export function calculateSqueezeCement(
    perfLength: number,      // ft of perforations
    perfDiameter: number,    // inches
    matrixPerm: number,      // mD
    squeezePressure: number, // psi above frac
    slurryViscosity: number  // cP
): {
    initialRateBpm: number;
    totalVolumeBbl: number;
    maxPressurePsi: number;
    lcmRequired: boolean;
} {
    // Injection rate into perforations (Darcy radial)
    const perfAreaSqIn = Math.PI * perfDiameter * perfLength * 12; // total perf area
    const perfAreaSqFt = perfAreaSqIn / 144;

    // Radial Darcy: Q ≈ (k * h * ΔP) / (141.2 * μ * β * ln(re/rw))
    const initialRateBpd = (matrixPerm * perfLength * squeezePressure) / (141.2 * slurryViscosity * 1.2 * Math.log(1000 / (perfDiameter / 2)));
    const initialRateBpm = initialRateBpd / 1440; // bbl/min

    // Volume: 3× wellbore radius penetration
    const penetrationRadius = perfDiameter / 2 * 3;
    const volumeCuft = Math.PI * Math.pow(penetrationRadius / 12, 2) * perfLength;
    const totalVolumeBbl = volumeCuft / 5.6146 * 2; // 2× safety factor

    // Break-down pressure estimate
    const maxPressurePsi = squeezePressure * 1.5;

    // LCM needed for high-perm or vugular zones
    const lcmRequired = matrixPerm > 100 || initialRateBpm > 2;

    return { initialRateBpm: Math.round(initialRateBpm * 100) / 100, totalVolumeBbl: Math.round(totalVolumeBbl * 10) / 10, maxPressurePsi: Math.round(maxPressurePsi), lcmRequired };
}