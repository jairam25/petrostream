/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================
// PHASE 5: CRUDE OIL & PRODUCTS TRANSPORTATION (MIDSTREAM)
// All calculations are fully parameterized — inputs can be
// any magnitude (e.g. billion-scale), outputs drive visuals.
// ============================================================

// ============================================================
// Sub-Step 5.1: Transportation Mode Selection & Route Planning
// ============================================================

/**
 * Tanker vessel database — DWT ranges and typical capacities
 */
export const TANKER_CLASSES = {
    ULCC: { minDwt: 320000, maxDwt: 550000, barrels: 4000000, draftFt: 80, description: 'Ultra Large Crude Carrier' },
    VLCC: { minDwt: 200000, maxDwt: 320000, barrels: 2000000, draftFt: 65, description: 'Very Large Crude Carrier' },
    Suezmax: { minDwt: 120000, maxDwt: 200000, barrels: 1000000, draftFt: 50, description: 'Fits Suez Canal' },
    Aframax: { minDwt: 80000, maxDwt: 120000, barrels: 750000, draftFt: 45, description: 'Medium haul, smaller ports' },
    Panamax: { minDwt: 60000, maxDwt: 80000, barrels: 500000, draftFt: 40, description: 'Fits Panama Canal' },
    Handysize: { minDwt: 10000, maxDwt: 60000, barrels: 200000, draftFt: 30, description: 'Short haul, small ports' },
} as const;

/** Transport mode cost comparison structure */
export interface TransportMode {
    name: string;
    capexPerKm: number;          // $ per km (or per unit for marine/rail/truck)
    opexPerBarrel: number;       // $ per barrel
    capacityBpd: number;         // barrels per day throughput
    leadTimeMonths: number;      // deployment time
    flexibility: number;         // 0-1 scale
    spillRisk: number;           // 0-1 scale
    maxDistanceKm: number;       // practical max distance
}

/** Default transport modes for comparison */
export const DEFAULT_TRANSPORT_MODES: TransportMode[] = [
    { name: 'Pipeline (Onshore)', capexPerKm: 850000, opexPerBarrel: 0.50, capacityBpd: 500000, leadTimeMonths: 36, flexibility: 0.1, spillRisk: 0.05, maxDistanceKm: 5000 },
    { name: 'Pipeline (Offshore)', capexPerKm: 2500000, opexPerBarrel: 1.20, capacityBpd: 300000, leadTimeMonths: 48, flexibility: 0.05, spillRisk: 0.08, maxDistanceKm: 1000 },
    { name: 'VLCC Tanker', capexPerKm: 0, opexPerBarrel: 2.50, capacityBpd: 200000, leadTimeMonths: 3, flexibility: 0.9, spillRisk: 0.12, maxDistanceKm: 25000 },
    { name: 'Suezmax Tanker', capexPerKm: 0, opexPerBarrel: 3.20, capacityBpd: 100000, leadTimeMonths: 3, flexibility: 0.85, spillRisk: 0.10, maxDistanceKm: 20000 },
    { name: 'Rail (Unit Train)', capexPerKm: 120000, opexPerBarrel: 8.00, capacityBpd: 80000, leadTimeMonths: 6, flexibility: 0.7, spillRisk: 0.06, maxDistanceKm: 3000 },
    { name: 'Truck', capexPerKm: 0, opexPerBarrel: 12.00, capacityBpd: 5000, leadTimeMonths: 1, flexibility: 1.0, spillRisk: 0.04, maxDistanceKm: 300 },
    { name: 'Barge', capexPerKm: 0, opexPerBarrel: 4.00, capacityBpd: 30000, leadTimeMonths: 2, flexibility: 0.6, spillRisk: 0.07, maxDistanceKm: 2000 },
];

/** Route planning constraints */
export interface RoutePlanInputs {
    distanceKm: number;
    terrainClass: 'flat' | 'rolling' | 'mountainous' | 'swamp' | 'arctic' | 'offshore';
    jurisdictionCount: number;
    waterCrossings: number;
    roadCrossings: number;
    environmentalSensitivity: number; // 0-1
    geopoliticalRisk: number;         // 0-1
    portDraftAvailableFt: number;
    canalRequired: 'none' | 'suez' | 'panama' | 'hormuz' | 'malacca';
}

/** Chokepoint risk data */
export const CHOKEPOINT_RISKS: Record<string, { delayDays: number; costSurcharge: number; description: string }> = {
    hormuz: { delayDays: 2, costSurcharge: 0.15, description: 'Strait of Hormuz — geopolitical tension' },
    malacca: { delayDays: 1, costSurcharge: 0.05, description: 'Strait of Malacca — piracy risk' },
    suez: { delayDays: 1, costSurcharge: 0.08, description: 'Suez Canal — transit fees + congestion' },
    panama: { delayDays: 1, costSurcharge: 0.06, description: 'Panama Canal — draft restrictions' },
    bab: { delayDays: 2, costSurcharge: 0.10, description: 'Bab el-Mandeb — security risk' },
    turkish: { delayDays: 1, costSurcharge: 0.04, description: 'Turkish Straits — congestion + regulations' },
};

// --- 5.1 Calculation Functions ---

/** Calculate total transport cost per barrel for a mode */
export function calculateTransportCostPerBarrel(
    mode: TransportMode,
    distanceKm: number,
    volumeBarrels: number,
): { totalCost: number; costPerBarrel: number; annualOpex: number; capexTotal: number } {
    const capexTotal = mode.capexPerKm * distanceKm;
    const annualOpex = mode.opexPerBarrel * volumeBarrels;
    // Simple life-of-field: 20 years
    const lifeYears = 20;
    const totalCost = capexTotal + annualOpex * lifeYears;
    const costPerBarrel = totalCost / (volumeBarrels * lifeYears);
    return { totalCost, costPerBarrel, annualOpex, capexTotal };
}

/** Compare all transport modes for a given route */
export function compareTransportModes(
    modes: TransportMode[],
    distanceKm: number,
    volumeBpd: number,
    fieldLifeYears: number = 20,
): { name: string; capex: number; annualOpex: number; totalLifecycleCost: number; costPerBarrel: number; feasible: boolean; constraintReason: string }[] {
    const barrelsPerYear = volumeBpd * 365;
    return modes.map(m => {
        const feasible = distanceKm <= m.maxDistanceKm && volumeBpd <= m.capacityBpd;
        const constraintReason = !feasible
            ? (distanceKm > m.maxDistanceKm ? `Distance ${distanceKm}km exceeds max ${m.maxDistanceKm}km` : `Volume ${volumeBpd} bpd exceeds capacity ${m.capacityBpd} bpd`)
            : '';
        const { totalCost, costPerBarrel, annualOpex, capexTotal } = calculateTransportCostPerBarrel(m, distanceKm, barrelsPerYear);
        return {
            name: m.name,
            capex: capexTotal,
            annualOpex,
            totalLifecycleCost: totalCost,
            costPerBarrel,
            feasible,
            constraintReason,
        };
    });
}

/** Estimate permitting timeline based on project complexity */
export function estimatePermittingTimeline(
    jurisdictionCount: number,
    environmentalSensitivity: number, // 0-1
    indigenousConsultation: boolean,
    crossBorder: boolean,
): { minMonths: number; maxMonths: number; expectedMonths: number; keyMilestones: string[] } {
    const baseMonths = 12;
    const perJurisdiction = 4;
    const envFactor = environmentalSensitivity * 18;
    const indigenousFactor = indigenousConsultation ? 12 : 0;
    const crossBorderFactor = crossBorder ? 18 : 0;
    const expectedMonths = baseMonths + jurisdictionCount * perJurisdiction + envFactor + indigenousFactor + crossBorderFactor;
    const minMonths = Math.max(6, expectedMonths * 0.6);
    const maxMonths = expectedMonths * 1.8;
    const milestones = [
        'EIA/EIS Submission',
        'Public Comment Period',
        'ROW Acquisition',
        ...(crossBorder ? ['Cross-Border Permit Application'] : []),
        ...(indigenousConsultation ? ['FPIC Consultation'] : []),
        'Water Crossing Permits',
        'Cultural Clearance',
        'Final Construction Permit',
    ];
    return { minMonths, maxMonths, expectedMonths, keyMilestones: milestones };
}

/** Calculate lifecycle NPV of transport options */
export function calculateTransportNPV(
    capex: number,
    annualOpex: number,
    discountRate: number,
    fieldLifeYears: number = 20,
): { npv: number; undiscountedTotal: number; annualizedCost: number } {
    let npv = capex;
    for (let t = 1; t <= fieldLifeYears; t++) {
        npv += annualOpex / Math.pow(1 + discountRate, t);
    }
    const undiscountedTotal = capex + annualOpex * fieldLifeYears;
    // Annuity factor
    const annuityFactor = (1 - Math.pow(1 + discountRate, -fieldLifeYears)) / discountRate;
    const annualizedCost = annuityFactor > 0 ? npv / annuityFactor : npv / fieldLifeYears;
    return { npv, undiscountedTotal, annualizedCost };
}


// ============================================================
// Sub-Step 5.2: Pipeline Design & Engineering
// ============================================================

/** Pipe grade database: API 5L grades with SMYS */
export const PIPE_GRADES: Record<string, { smysPsi: number; smysMpa: number; description: string }> = {
    'B': { smysPsi: 35000, smysMpa: 241, description: 'Grade B — Standard' },
    'X42': { smysPsi: 42000, smysMpa: 290, description: 'X42' },
    'X46': { smysPsi: 46000, smysMpa: 317, description: 'X46' },
    'X52': { smysPsi: 52000, smysMpa: 359, description: 'X52 — Common for crude lines' },
    'X56': { smysPsi: 56000, smysMpa: 386, description: 'X56' },
    'X60': { smysPsi: 60000, smysMpa: 414, description: 'X60 — Gas transmission' },
    'X65': { smysPsi: 65000, smysMpa: 448, description: 'X65 — High pressure gas' },
    'X70': { smysPsi: 70000, smysMpa: 483, description: 'X70 — Modern high-strength' },
    'X80': { smysPsi: 80000, smysMpa: 552, description: 'X80 — Ultra high-strength' },
};

/** Location class design factors per ASME B31.8 */
export const LOCATION_CLASS_FACTORS: Record<number, { description: string; designFactor: number }> = {
    1: { description: 'Rural / Unpopulated', designFactor: 0.72 },
    2: { description: 'Semi-Rural', designFactor: 0.60 },
    3: { description: 'Suburban', designFactor: 0.50 },
    4: { description: 'Urban / High-density', designFactor: 0.40 },
};

/** Coating types database */
export const COATING_TYPES: Record<string, { name: string; frictionFactorReduction: number; costPerSqFt: number; temperatureLimitC: number; description: string }> = {
    FBE: { name: 'Fusion Bonded Epoxy', frictionFactorReduction: 0.0, costPerSqFt: 2.50, temperatureLimitC: 110, description: 'Standard onshore coating' },
    ThreeLPE: { name: '3-Layer Polyethylene', frictionFactorReduction: 0.0, costPerSqFt: 3.80, temperatureLimitC: 85, description: 'Enhanced mechanical protection' },
    ThreeLPP: { name: '3-Layer Polypropylene', frictionFactorReduction: 0.0, costPerSqFt: 5.00, temperatureLimitC: 140, description: 'High temperature, offshore' },
    InternalEpoxy: { name: 'Internal Epoxy Lining', frictionFactorReduction: 0.15, costPerSqFt: 1.20, temperatureLimitC: 100, description: 'Reduces friction, improves flow' },
    CWC: { name: 'Concrete Weight Coating', frictionFactorReduction: 0.0, costPerSqFt: 8.00, temperatureLimitC: 120, description: 'Offshore negative buoyancy' },
};

/**
 * Darcy-Weisbach: pressure drop in liquid pipelines
 * ΔP = f × (L/D) × (ρ × v² / 2)
 * @returns pressure drop in psi
 */
export function darcyWeisbachDP(
    frictionFactor: number,
    lengthFt: number,
    diameterIn: number,
    densityLbPerFt3: number,
    velocityFtPerSec: number,
): number {
    // ΔP in lb/ft² → divide by 144 to get psi
    const dpPsf = frictionFactor * (lengthFt / (diameterIn / 12)) * (densityLbPerFt3 * velocityFtPerSec * velocityFtPerSec / 2);
    return dpPsf / 144;
}

/**
 * Colebrook-White equation for friction factor via Newton-Raphson iteration
 * Converges for turbulent flow (Re > 4000) and transitional regime
 * @param reynoldsNumber Reynolds number (dimensionless)
 * @param relativeRoughness ε/D (dimensionless)
 * @returns Darcy friction factor f
 */
export function colebrookWhite(reynoldsNumber: number, relativeRoughness: number): number {
    if (reynoldsNumber <= 0) return 0.02; // Default
    if (reynoldsNumber < 2300) return 64 / reynoldsNumber; // Laminar

    // Newton-Raphson: f = 1 / ( -2·log10(ε/D/3.7 + 2.51/(Re·√f)) )²
    let f = 0.02; // Initial guess
    for (let i = 0; i < 50; i++) {
        const sqrtF = Math.sqrt(f);
        const invSqrtF = 1 / sqrtF;
        const term = relativeRoughness / 3.7 + 2.51 / (reynoldsNumber * sqrtF);
        const logTerm = Math.log10(term);
        // Function: g(f) = 1/√f + 2·log10(ε/D/3.7 + 2.51/(Re·√f))
        const g = invSqrtF + 2 * logTerm;
        // Derivative: g'(f) = -1/(2·f^(3/2)) - (2.51/(Re·f)) / (ln(10)·term)
        const dg = -0.5 / (f * sqrtF) - (2.51 / (reynoldsNumber * f)) / (Math.log(10) * term);
        const fNew = f - g / dg;
        if (Math.abs(fNew - f) < 1e-8) return fNew;
        if (fNew <= 0) return f; // Diverge safeguard
        f = fNew;
    }
    return f; // Return converged value
}

/**
 * Reynolds number calculation
 * Re = ρ × v × D / μ
 */
export function reynoldsNumber(
    densityKgPerM3: number,
    velocityMPerSec: number,
    diameterM: number,
    viscosityPaS: number,
): number {
    if (viscosityPaS <= 0) return 1e9;
    return (densityKgPerM3 * velocityMPerSec * diameterM) / viscosityPaS;
}

/**
 * Barlow's formula: pipe wall thickness
 * t = (P × D) / (2 × S × E × F × T)
 * @returns required wall thickness in inches
 */
export function barlowsWallThickness(
    designPressurePsi: number,
    outsideDiameterIn: number,
    smysPsi: number,
    jointFactor: number,        // E: 1.0 for seamless, 0.85 for ERW, etc.
    designFactor: number,        // F: location class factor
    temperatureDerating: number, // T: 1.0 at ambient, <1 at elevated temp
): { thicknessIn: number; thicknessMm: number; maopPsi: number } {
    const thicknessIn = (designPressurePsi * outsideDiameterIn) / (2 * smysPsi * jointFactor * designFactor * temperatureDerating);
    // MAOP check
    const maopPsi = (2 * smysPsi * jointFactor * designFactor * temperatureDerating * thicknessIn) / outsideDiameterIn;
    return { thicknessIn, thicknessMm: thicknessIn * 25.4, maopPsi };
}

/** Joint factor database */
export const JOINT_FACTORS: Record<string, number> = {
    seamless: 1.00,
    lsaw: 0.95,
    hsaw: 0.90,
    erw: 0.85,
};

/**
 * Gas pipeline: Weymouth flow equation
 * Q = 433.5 × (Tb/Pb) × ((P1² - P2²) / (G × Tf × L × Z))^0.5 × D^2.667
 * @returns flow rate in MMSCFD
 */
export function weymouthFlow(
    p1Psia: number,
    p2Psia: number,
    diameterIn: number,
    lengthMi: number,
    specificGravity: number,
    tempR: number,
    compressibilityZ: number,
    baseTempR: number = 520,
    basePressurePsia: number = 14.7,
    efficiencyFactor: number = 1.0,
): number {
    const dp2 = p1Psia * p1Psia - p2Psia * p2Psia;
    if (dp2 <= 0) return 0;
    return efficiencyFactor * 433.5 * (baseTempR / basePressurePsia) *
        Math.sqrt(dp2 / (specificGravity * tempR * lengthMi * compressibilityZ)) *
        Math.pow(diameterIn, 2.667);
}

/**
 * Panhandle A equation for gas pipelines (large diameter, high Re)
 * Q = 435.87 × E × (Tb/Pb)^1.0788 × ((P1² - P2²) / (G^0.8539 × Tf × L × Z))^0.5394 × D^2.6182
 */
export function panhandleAFlow(
    p1Psia: number,
    p2Psia: number,
    diameterIn: number,
    lengthMi: number,
    specificGravity: number,
    tempR: number,
    compressibilityZ: number,
    efficiency: number = 0.92,
    baseTempR: number = 520,
    basePressurePsia: number = 14.7,
): number {
    const dp2 = p1Psia * p1Psia - p2Psia * p2Psia;
    if (dp2 <= 0) return 0;
    const term = dp2 / (Math.pow(specificGravity, 0.8539) * tempR * lengthMi * compressibilityZ);
    return efficiency * 435.87 *
        Math.pow(baseTempR / basePressurePsia, 1.0788) *
        Math.pow(term, 0.5394) *
        Math.pow(diameterIn, 2.6182);
}

/**
 * Compressibility factor Z using Hall-Yarborough approximation
 * For natural gas at moderate pressures
 */
export function compressibilityFactor(
    pseudoReducedPressure: number,
    pseudoReducedTemperature: number,
): number {
    if (pseudoReducedTemperature <= 0) return 1.0;
    // Standing-Katz correlation via Dranchuk-Abou-Kassem (simplified)
    const t = 1 / pseudoReducedTemperature;
    const a1 = 0.3265; const a2 = -1.0700; const a3 = -0.5339;
    const a4 = 0.01569; const a5 = -0.05165; const a6 = 0.5475;
    const a7 = -0.7361; const a8 = 0.1844; const a9 = 0.1056;
    const a10 = 0.6134; const a11 = 0.7210;

    // Iterative solve for reduced density ρr
    let rhor = 0.27 * pseudoReducedPressure * t;
    for (let i = 0; i < 30; i++) {
        const f = 1 + a1 * rhor + a2 * rhor * rhor + a3 * Math.pow(rhor, 3) + a4 * Math.pow(rhor, 4) +
            a5 * Math.pow(rhor, 5) + a6 * Math.pow(rhor, 2) * (1 + a11 * rhor * rhor) * Math.exp(-a11 * rhor * rhor);
        const df = a1 + 2 * a2 * rhor + 3 * a3 * rhor * rhor + 4 * a4 * Math.pow(rhor, 3) +
            5 * a5 * Math.pow(rhor, 4) + a6 * (2 * rhor + 4 * a11 * Math.pow(rhor, 3) - 2 * a11 * Math.pow(rhor, 3) * (1 + a11 * rhor * rhor)) * Math.exp(-a11 * rhor * rhor);
        // Function: g(rhor) = f(rhor) - Ppr/(Tpr*rhor)
        const g = f - pseudoReducedPressure / (pseudoReducedTemperature * rhor);
        const dg = df + pseudoReducedPressure / (pseudoReducedTemperature * rhor * rhor);
        const rhorNew = rhor - g / dg;
        if (Math.abs(rhorNew - rhor) < 1e-8) { rhor = rhorNew; break; }
        if (rhorNew <= 0) break;
        rhor = rhorNew;
    }
    if (rhor <= 0) return 1.0;
    const Z = 0.27 * pseudoReducedPressure / (pseudoReducedTemperature * rhor);
    return Math.max(0.2, Math.min(2.5, Z));
}

/**
 * Erosional velocity limit for pipelines (API RP 14E)
 * Ve = C / √(ρ_mix) where C ≈ 100 for continuous service
 * @returns erosional velocity in ft/s
 */
export function erosionalVelocity(
    cFactor: number,   // 100 for clean, 150-200 for intermittent, 250 for non-continuous
    mixtureDensityLbPerFt3: number,
): number {
    if (mixtureDensityLbPerFt3 <= 0) return 30;
    return cFactor / Math.sqrt(mixtureDensityLbPerFt3);
}

/**
 * Optimal economic pipe diameter (crude oil)
 * Using simplified cost optimization: D_opt ∝ Q^0.45 / ΔP^0.15
 * @returns optimal diameter in inches
 */
export function optimalPipeDiameter(
    flowRateBpd: number,
    fluidViscosityCP: number,
    terrainFactor: number, // 1.0 flat, 1.3 rolling, 1.6 mountainous
): number {
    // Rule of thumb adapted from industry standards
    const baseDiameter = 2.5 * Math.pow(flowRateBpd / 1000, 0.45);
    const viscosityFactor = Math.pow(fluidViscosityCP, 0.15);
    return baseDiameter * viscosityFactor * terrainFactor;
}

/**
 * Pump station spacing for liquid pipelines
 * Based on hydraulic gradient and available pump discharge pressure
 * @returns station spacing in km
 */
export function pumpStationSpacing(
    maxDischargePressurePsi: number,
    minSuctionPressurePsi: number,
    frictionGradientPsiPerKm: number,
    elevationGainFt: number,
    fluidDensityLbPerGal: number,
): number {
    const availableDPsi = maxDischargePressurePsi - minSuctionPressurePsi;
    const staticHeadPsi = elevationGainFt * fluidDensityLbPerGal * 0.052;
    const frictionAvailPsi = availableDPsi - staticHeadPsi;
    if (frictionGradientPsiPerKm <= 0) return 500;
    return Math.max(20, frictionAvailPsi / frictionGradientPsiPerKm);
}

/**
 * Compressor station power requirement
 * HP = (Q × Zavg × Tavg × (r^{(k-1)/k} - 1)) / (η × (k-1)/k × constant)
 * @returns required horsepower
 */
export function compressorPowerRequired(
    flowMMscfd: number,
    suctionPressurePsia: number,
    dischargePressurePsia: number,
    suctionTempR: number,
    compressibilityZ: number,
    ratioSpecificHeats: number,  // k = Cp/Cv ≈ 1.3 for natural gas
    efficiency: number,           // typically 0.75-0.85
): number {
    if (suctionPressurePsia <= 0 || flowMMscfd <= 0) return 0;
    const r = dischargePressurePsia / suctionPressurePsia;
    if (r <= 1) return 0;
    const exponent = (ratioSpecificHeats - 1) / ratioSpecificHeats;
    const powerMMscfd = flowMMscfd * compressibilityZ * suctionTempR *
        (Math.pow(r, exponent) - 1) / (efficiency * exponent * 33000);
    // Convert to HP: standard gas constant factor
    // 1 MMSCFD ≈ 1e6 SCF/day → HP ≈ 0.085 × Q × ln(r) / η (rule of thumb)
    const hp = (3.03 * flowMMscfd * compressibilityZ * suctionTempR *
        (Math.pow(r, exponent) - 1)) / (efficiency * exponent);
    return hp;
}

/**
 * DRA (Drag Reducing Agent) throughput boost
 * @returns percentage increase in throughput
 */
export function draThroughputBoost(
    dRAConcentrationPpm: number,
    baseFrictionFactor: number,
): { boostedThroughputPct: number; reducedFrictionFactor: number } {
    // DRA reduces friction by 20-70% depending on concentration
    const maxReduction = 0.70;
    const halfMaxPpm = 10; // ppm at which half max reduction occurs
    const reductionFraction = maxReduction * dRAConcentrationPpm / (dRAConcentrationPpm + halfMaxPpm);
    const reducedFrictionFactor = baseFrictionFactor * (1 - reductionFraction);
    // Throughput ∝ 1/√f → % increase = (1/√(f_new) - 1/√(f_old)) / (1/√(f_old))
    const throughputRatio = Math.sqrt(baseFrictionFactor / reducedFrictionFactor);
    const boostedThroughputPct = (throughputRatio - 1) * 100;
    return { boostedThroughputPct, reducedFrictionFactor };
}

/**
 * Temperature profile along pipeline length
 * T(x) = T_ambient + (T_inlet - T_ambient) × e^(-Kx)
 */
export function pipelineTemperatureProfile(
    inletTempC: number,
    ambientTempC: number,
    distanceKm: number,
    overallHeatTransferCoeff: number, // W/m²·K
    pipeDiameterIn: number,
    massFlowKgPerS: number,
    specificHeatJPerKgK: number,
): { xKm: number; tempC: number }[] {
    const diameterM = pipeDiameterIn * 0.0254;
    const circumference = Math.PI * diameterM;
    const K = (overallHeatTransferCoeff * circumference) / (massFlowKgPerS * specificHeatJPerKgK); // per m
    const KPerKm = K * 1000;
    const points: { xKm: number; tempC: number }[] = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
        const x = (distanceKm * i) / steps;
        const tempC = ambientTempC + (inletTempC - ambientTempC) * Math.exp(-KPerKm * x);
        points.push({ xKm: x, tempC });
    }
    return points;
}


// ============================================================
// Sub-Step 5.3: Pipeline Construction
// ============================================================

/** Terrain productivity factors */
export const TERRAIN_FACTORS: Record<string, number> = {
    flat: 1.0,
    rolling: 0.75,
    mountainous: 0.35,
    swamp: 0.25,
    arctic: 0.20,
    offshore: 0.15, // Subsea lay rate
};

/** Estimate construction duration */
export function estimateConstructionDuration(
    pipelineLengthKm: number,
    diameterIn: number,
    terrainType: string,
    riverCrossings: number,
    roadCrossings: number,
    hddCrossings: number,
    spreadCount: number,
): { totalDays: number; productionRateKmPerDay: number; phaseDurations: { phase: string; days: number }[] } {
    const terrainFactor = TERRAIN_FACTORS[terrainType] || 1.0;
    // Base production rate: 1-2 km/day for large diameter, adjusted
    const baseRate = 1.5 * Math.pow(24 / diameterIn, 0.3);
    const productionRate = baseRate * terrainFactor * Math.min(spreadCount, 1);
    const mainlineDays = pipelineLengthKm / productionRate;
    const riverDays = riverCrossings * 30;    // 30 days per major river crossing
    const roadDays = roadCrossings * 3;       // 3 days per road crossing
    const hddDays = hddCrossings * 45;        // 45 days per HDD crossing
    const hydroDays = pipelineLengthKm * 0.1; // Hydrotest ~10% of mainline time
    const commissioningDays = 14;
    const totalDays = mainlineDays + riverDays + roadDays + hddDays + hydroDays + commissioningDays;
    return {
        totalDays,
        productionRateKmPerDay: productionRate,
        phaseDurations: [
            { phase: 'Clearing & Grading', days: mainlineDays * 0.15 },
            { phase: 'Trenching', days: mainlineDays * 0.10 },
            { phase: 'Stringing & Welding', days: mainlineDays * 0.40 },
            { phase: 'NDT & Coating', days: mainlineDays * 0.10 },
            { phase: 'Lowering-in', days: mainlineDays * 0.10 },
            { phase: 'Backfilling', days: mainlineDays * 0.10 },
            { phase: 'Crossings (River/Road/HDD)', days: riverDays + roadDays + hddDays },
            { phase: 'Hydrostatic Testing', days: hydroDays },
            { phase: 'Commissioning', days: commissioningDays },
        ],
    };
}

/** Construction cost estimation per km */
export function estimateConstructionCost(
    pipelineLengthKm: number,
    diameterIn: number,
    terrainType: string,
    coatingType: string,
    laborCostPerDayPerSpread: number,
    materialCostPerTon: number,
    specialCrossingsCount: number,
): { costPerKm: number; totalCost: number; breakdown: { item: string; cost: number }[] } {
    const terrainFactor = TERRAIN_FACTORS[terrainType] || 1.0;
    // Pipe steel weight: ~10.68 × wall_t × (OD - wall_t) lb/ft for API pipe
    const wallThicknessIn = diameterIn * 0.005; // Approx 0.5% of diameter
    const weightPerFt = 10.68 * wallThicknessIn * (diameterIn - wallThicknessIn);
    const weightPerKm = weightPerFt * 3280.84 / 2000; // tons per km
    const pipeCost = weightPerKm * materialCostPerTon;
    const laborCost = (laborCostPerDayPerSpread * 200) / terrainFactor; // Rough days per km
    const coatingCost = COATING_TYPES[coatingType]?.costPerSqFt ?? 2.5;
    const surfaceAreaPerKm = Math.PI * (diameterIn / 12) * 3280.84; // sq ft
    const coatingTotal = coatingCost * surfaceAreaPerKm;
    const crossingsCost = specialCrossingsCount * 500000; // Rough avg per crossing
    const miscCost = (pipeCost + laborCost + coatingTotal) * 0.15;
    const costPerKm = pipeCost + laborCost + coatingTotal + miscCost;
    const totalCost = costPerKm * pipelineLengthKm + crossingsCost;
    return {
        costPerKm,
        totalCost,
        breakdown: [
            { item: 'Pipe Material', cost: pipeCost * pipelineLengthKm },
            { item: 'Labor & Equipment', cost: laborCost * pipelineLengthKm },
            { item: 'Coating', cost: coatingTotal * pipelineLengthKm },
            { item: 'Special Crossings', cost: crossingsCost },
            { item: 'Misc/Contingency (15%)', cost: miscCost * pipelineLengthKm },
        ],
    };
}

/** Hydrostatic test pressure calculation */
export function hydrotestPressure(
    maopPsi: number,
    pipelineType: 'liquid' | 'gas',
): { testPressurePsi: number; testPressureToMAOPRatio: number; holdTimeHours: number } {
    const ratio = pipelineType === 'liquid' ? 1.25 : 1.4;
    const testPressurePsi = maopPsi * ratio;
    const holdTimeHours = pipelineType === 'liquid' ? 4 : 8;
    return { testPressurePsi, testPressureToMAOPRatio: ratio, holdTimeHours };
}


// ============================================================
// Sub-Step 5.4: Storage Terminals & Tank Farms
// ============================================================

/** Tank type database */
export const TANK_TYPES = {
    fixedCone: { name: 'Fixed Cone Roof', costPerBarrel: 15, emissionFactor: 1.0, maxSizeBarrels: 500000 },
    fixedDome: { name: 'Fixed Dome Roof', costPerBarrel: 18, emissionFactor: 0.9, maxSizeBarrels: 500000 },
    externalFloat: { name: 'External Floating Roof', costPerBarrel: 22, emissionFactor: 0.15, maxSizeBarrels: 1500000 },
    internalFloat: { name: 'Internal Floating Roof', costPerBarrel: 28, emissionFactor: 0.08, maxSizeBarrels: 1000000 },
    sphere: { name: 'Horton Sphere (LPG)', costPerBarrel: 65, emissionFactor: 0.0, maxSizeBarrels: 30000 },
    bullet: { name: 'Bullet Tank (LPG)', costPerBarrel: 45, emissionFactor: 0.0, maxSizeBarrels: 15000 },
};

/**
 * API 650 shell thickness using 1-foot method
 * @returns shell course thicknesses
 */
export function api650ShellThickness(
    tankDiameterFt: number,
    tankHeightFt: number,
    designSpecificGravity: number,
    materialAllowableStressPsi: number,
    jointEfficiency: number,
    corrosionAllowanceIn: number,
): { bottomFt: number; topFt: number; thicknessIn: number }[] {
    const courses: { bottomFt: number; topFt: number; thicknessIn: number }[] = [];
    const courseHeight = 8; // Standard 8ft plate courses
    const numCourses = Math.ceil(tankHeightFt / courseHeight);
    for (let i = 0; i < numCourses; i++) {
        const bottomFt = i * courseHeight;
        const topFt = Math.min((i + 1) * courseHeight, tankHeightFt);
        const designLiquidLevel = tankHeightFt - bottomFt; // Head at bottom of course
        // td = 2.6 × D × (H - 1) × G / Sd  + CA  (1-foot method from API 650)
        const calcThickness = 2.6 * tankDiameterFt * Math.max(0, designLiquidLevel - 1) * designSpecificGravity / materialAllowableStressPsi;
        const thicknessIn = Math.max(0.1875, calcThickness) + corrosionAllowanceIn; // Min 3/16"
        courses.push({ bottomFt, topFt, thicknessIn });
    }
    return courses;
}

/**
 * Bund wall / dike volume calculation per NFPA 30
 * Volume must contain 100-110% of largest tank
 */
export function bundWallVolume(
    largestTankVolumeBarrels: number,
    containmentFactor: number = 1.10,
): { requiredVolumeBbl: number; requiredVolumeGal: number; suggestedHeightFt: number; suggestedAreaSqFt: number } {
    const requiredVolumeBbl = largestTankVolumeBarrels * containmentFactor;
    const requiredVolumeGal = requiredVolumeBbl * 42;
    // Suggest dimensions: height typically 3-6 ft
    const heightFt = 4;
    const areaSqFt = requiredVolumeBbl * 5.615 / heightFt; // 1 bbl = 5.615 cuft
    return { requiredVolumeBbl, requiredVolumeGal, suggestedHeightFt: heightFt, suggestedAreaSqFt: areaSqFt };
}

/**
 * Fire foam requirement per NFPA 11
 */
export function fireFoamRequirement(
    tankDiameterFt: number,
    applicationRateGpmPerSqFt: number,  // Typically 0.16 for rim seal, 0.10 for full surface
    durationMinutes: number,            // Typically 20 min for rim, 55-65 min for full
    foamExpansionRatio: number,         // Typically 3-4% concentrate
): { foamConcentrateGal: number; waterRequiredGal: number; applicationRateGpm: number } {
    const area = Math.PI * Math.pow(tankDiameterFt / 2, 2);
    const applicationRateGpm = area * applicationRateGpmPerSqFt;
    const totalSolutionGal = applicationRateGpm * durationMinutes;
    const foamConcentrateGal = totalSolutionGal * foamExpansionRatio / 100;
    const waterRequiredGal = totalSolutionGal - foamConcentrateGal;
    return { foamConcentrateGal, waterRequiredGal, applicationRateGpm };
}

/**
 * Tank breathing losses (standing storage) — API MPMS Ch 19 / EPA AP-42
 * LS = 365 × Vv × Wv × KE × KS
 */
export function calculateBreathingLoss(
    tankDiameterFt: number,
    avgVaporPressurePsia: number,
    avgLiquidSurfaceTempR: number,
    avgAmbientTempRangeR: number,
    tankPaintSolarAbsorptance: number, // 0.17 for white, 0.8 for aluminum
    roofType: 'fixed' | 'externalFloat' | 'internalFloat',
): number {
    // Simplified AP-42 model
    const Vv = Math.PI * Math.pow(tankDiameterFt / 2, 2) * (roofType === 'fixed' ? 1 : 0.05); // Vapor space volume
    const Wv = avgVaporPressurePsia / (10.731 * avgLiquidSurfaceTempR); // Vapor density lb-mol/ft³
    const KE = 0.001 * avgAmbientTempRangeR * tankPaintSolarAbsorptance;
    const KS = roofType === 'fixed' ? 1.0 : roofType === 'externalFloat' ? 0.25 : 0.1;
    // lb/yr → barrels/yr (1 bbl ≈ 300 lb for typical crude vapor)
    const lossLbPerYear = 365 * Vv * Wv * KE * KS;
    const lossBblPerYear = lossLbPerYear / 280; // Approximate conversion
    return lossBblPerYear;
}

/**
 * Working losses (filling/emptying) — API MPMS Ch 19
 * LW = 0.0010 × Mv × Pva × Q × KN × KP
 */
export function calculateWorkingLoss(
    annualThroughputBarrels: number,
    molecularWeightVapor: number,
    vaporPressurePsia: number,
    turnoverRate: number, // Annual turnovers
): number {
    const KN = turnoverRate > 36 ? (180 + turnoverRate) / (6 * turnoverRate) : 1.0;
    const KP = 1.0; // Product factor
    const lossLb = 0.0010 * molecularWeightVapor * vaporPressurePsia * annualThroughputBarrels * KN * KP;
    return lossLb / 280; // barrels
}


// ============================================================
// Sub-Step 5.5: Pipeline Integrity Management
// ============================================================

/**
 * ASME B31G — Remaining strength of corroded pipe (original)
 * @returns safe operating pressure and failure pressure
 */
export function asmeB31G(
    smysPsi: number,
    outsideDiameterIn: number,
    nominalWallThicknessIn: number,
    corrosionDepthIn: number,
    corrosionLengthIn: number,
): { safePressurePsi: number; failurePressurePsi: number; safeAtMAOP: boolean; repairRequired: boolean; erFactor: number } {
    const D = outsideDiameterIn;
    const t = nominalWallThicknessIn;
    const d = corrosionDepthIn;
    const L = corrosionLengthIn;

    if (d <= 0 || d >= t * 0.8) {
        // Through-wall or very deep defect
        return { safePressurePsi: 0, failurePressurePsi: 0, safeAtMAOP: false, repairRequired: true, erFactor: 0 };
    }

    const BValue = Math.sqrt(1 + 0.893 * (L / Math.sqrt(D * t)));
    const flowStress = 1.1 * smysPsi;
    const A0 = L * t; // Original area
    const A = corrosionDepthIn * corrosionLengthIn; // Corroded area
    const Pf = flowStress * (2 * t / D) * ((1 - 0.85 * (d / t)) / (1 - 0.85 * (d / t) / BValue));
    const safePressurePsi = Pf * 0.72; // Design factor
    const repairRequired = d / t > 0.5 || Pf < 1.25 * (2 * smysPsi * t * 0.72 / D);
    const erFactor = 1 - 0.85 * (d / t); // Estimated Repair factor

    return {
        failurePressurePsi: Pf,
        safePressurePsi,
        safeAtMAOP: !repairRequired,
        repairRequired,
        erFactor,
    };
}

/**
 * Modified B31G (RSTRENG) — effective area method
 * More accurate for long corrosion defects in high-toughness pipe
 */
export function modifiedB31G(
    smysPsi: number,
    outsideDiameterIn: number,
    nominalWallThicknessIn: number,
    corrosionDepths: number[],  // Depth profile along defect
    measurementSpacingIn: number, // Spacing between depth measurements
): { safePressurePsi: number; failurePressurePsi: number; burstPressurePsi: number } {
    if (corrosionDepths.length === 0) {
        const t = nominalWallThicknessIn;
        const dp = 2 * smysPsi * t * 0.72 / outsideDiameterIn;
        return { safePressurePsi: dp, failurePressurePsi: dp / 0.72, burstPressurePsi: dp / 0.72 };
    }

    const D = outsideDiameterIn;
    const t = nominalWallThicknessIn;
    const L = corrosionDepths.length * measurementSpacingIn;
    const dMax = Math.max(...corrosionDepths);

    // Modified parameters
    const BValue = L <= Math.sqrt(50 * D * t)
        ? Math.sqrt(1 + 0.6275 * (L * L / (D * t)) - 0.003375 * Math.pow(L, 4) / Math.pow(D * t, 2))
        : 0.032 * (L * L / (D * t)) + 3.3;

    const flowStress = smysPsi + 10000;

    // Effective area approach
    const avgDepth = corrosionDepths.reduce((s, d) => s + d, 0) / corrosionDepths.length;
    const effectiveDepth = 0.85 * dMax; // Conservative approximation

    const Pf = flowStress * (2 * t / D) * ((1 - 0.85 * (effectiveDepth / t)) / (1 - 0.85 * (effectiveDepth / t) / BValue));
    const safePressurePsi = Pf * 0.72;

    return {
        failurePressurePsi: Pf,
        safePressurePsi,
        burstPressurePsi: Pf,
    };
}

/**
 * Corrosion growth rate estimation from multiple ILI runs
 */
export function corrosionGrowthRate(
    depthsRun1: number[], // Previous ILI depths (in)
    depthsRun2: number[], // Latest ILI depths (in)
    yearsBetween: number,
): { averageGrowthRateInchPerYr: number; maxGrowthRateInchPerYr: number; remainingLifeYears: number; remainingWall: number } {
    if (yearsBetween <= 0 || depthsRun1.length === 0) return { averageGrowthRateInchPerYr: 0, maxGrowthRateInchPerYr: 0, remainingLifeYears: 999, remainingWall: 0.25 };
    const growths = depthsRun2.map((d2, i) => (depthsRun1[i] !== undefined ? d2 - depthsRun1[i] : 0));
    const avgGrowthRate = growths.reduce((s, g) => s + g, 0) / (growths.length * yearsBetween);
    const maxGrowthRate = Math.max(...growths) / yearsBetween;
    const remainingLifeYears = maxGrowthRate > 0 ? (0.8 * 0.25 - Math.max(...depthsRun2)) / maxGrowthRate : 999;
    return {
        averageGrowthRateInchPerYr: avgGrowthRate,
        maxGrowthRateInchPerYr: maxGrowthRate,
        remainingLifeYears,
        remainingWall: 0.25 - Math.max(...depthsRun2),
    };
}

/**
 * Leak detection sensitivity analysis
 */
export function leakDetectionSensitivity(
    pipelineDiameterIn: number,
    operatingPressurePsi: number,
    systemType: 'mass-balance' | 'rttm' | 'pressure-point' | 'fiber-optic-das' | 'fiber-optic-dts',
): { minDetectableLeakRateBpd: number; responseTimeMinutes: number; falseAlarmRatePerYear: number } {
    const sensitivities: Record<string, { flowFraction: number; responseTimeMin: number; falseAlarmRate: number }> = {
        'mass-balance': { flowFraction: 0.01, responseTimeMin: 60, falseAlarmRate: 5 },
        'rttm': { flowFraction: 0.005, responseTimeMin: 15, falseAlarmRate: 2 },
        'pressure-point': { flowFraction: 0.02, responseTimeMin: 5, falseAlarmRate: 8 },
        'fiber-optic-das': { flowFraction: 0.001, responseTimeMin: 1, falseAlarmRate: 0.5 },
        'fiber-optic-dts': { flowFraction: 0.002, responseTimeMin: 3, falseAlarmRate: 1 },
    };
    const s = sensitivities[systemType] || sensitivities['mass-balance'];
    // Rough flow rate for 0.25 psi/ft gradient
    const approxFlowBpd = Math.PI * Math.pow(pipelineDiameterIn / 2, 2) * 24 * 3600 / 5.615;
    const minDetectableLeakRateBpd = approxFlowBpd * s.flowFraction;
    return {
        minDetectableLeakRateBpd,
        responseTimeMinutes: s.responseTimeMin,
        falseAlarmRatePerYear: s.falseAlarmRate,
    };
}


// ============================================================
// Sub-Step 5.6: Marine Transportation
// ============================================================

/**
 * Voyage economics calculation
 */
export function voyageEconomics(
    cargoBarrels: number,
    distanceNm: number,
    vesselSpeedKnots: number,
    fuelConsumptionMtPerDay: number,
    fuelCostPerMt: number,
    portCharges: number,
    canalFees: number,
    dailyCharterRate: number,
    loadingRateBph: number,
    dischargingRateBph: number,
): {
    seaDays: number;
    portDays: number;
    totalVoyageDays: number;
    fuelCost: number;
    totalVoyageCost: number;
    freightCostPerBarrel: number;
    tcePerDay: number; // Time Charter Equivalent
    wsRate: number;    // Worldscale
} {
    const seaDays = distanceNm / (vesselSpeedKnots * 24) * 2; // Round trip
    const loadingDays = cargoBarrels / (loadingRateBph * 24);
    const dischargingDays = cargoBarrels / (dischargingRateBph * 24);
    const portDays = loadingDays + dischargingDays;
    const waitingDays = 1; // Buffer
    const totalVoyageDays = seaDays + portDays + waitingDays;
    const fuelCost = fuelConsumptionMtPerDay * seaDays * fuelCostPerMt;
    const totalVoyageCost = fuelCost + portCharges + canalFees + dailyCharterRate * totalVoyageDays;
    const freightCostPerBarrel = totalVoyageCost / cargoBarrels;
    // TCE = (Freight Revenue — Voyage Costs) / Voyage Days
    const freightRevenue = freightCostPerBarrel * cargoBarrels;
    const voyageCostsExclCharter = fuelCost + portCharges + canalFees;
    const tcePerDay = (freightRevenue - voyageCostsExclCharter) / totalVoyageDays;

    // Worldscale: flat rate reference (simplified)
    const wsFlatRate = 15.0; // $/MT for reference route
    const wsRate = freightCostPerBarrel * 7.5 / wsFlatRate * 100; // Approx conversion

    return {
        seaDays,
        portDays,
        totalVoyageDays,
        fuelCost,
        totalVoyageCost,
        freightCostPerBarrel,
        tcePerDay,
        wsRate,
    };
}

/**
 * Demurrage calculation
 */
export function tankerDemurrage(
    cargoBarrels: number,
    allowedLaytimeHours: number,
    actualPortTimeHours: number,
    demurrageRatePerDay: number,
    despatchRatePerDay: number, // Half of demurrage typically
): { demurrageCost: number; despatchSavings: number; netPortTimeDeviation: number } {
    const laytimeUsed = actualPortTimeHours;
    const laytimeAllowed = allowedLaytimeHours;
    const deviation = laytimeUsed - laytimeAllowed;
    let demurrageCost = 0;
    let despatchSavings = 0;
    if (deviation > 0) {
        demurrageCost = (deviation / 24) * demurrageRatePerDay;
    } else {
        despatchSavings = (Math.abs(deviation) / 24) * despatchRatePerDay;
    }
    return { demurrageCost, despatchSavings, netPortTimeDeviation: deviation };
}

/**
 * Bunker fuel consumption estimation
 */
export function bunkerFuelConsumption(
    vesselDWT: number,
    speedKnots: number,
    fuelType: 'IFO380' | 'VLSFO' | 'MGO' | 'LNG',
): { consumptionMtPerDay: number; costPerMt: number; dailyFuelCost: number; co2TonsPerDay: number } {
    // Admiralty coefficient approach: P ∝ Δ^(2/3) × v³
    const displacement = vesselDWT * 1.15; // Approx
    const powerRequired = Math.pow(displacement, 2 / 3) * Math.pow(speedKnots, 3) / 480;
    const sfoc = fuelType === 'LNG' ? 145 : 185; // g/kWh specific fuel oil consumption
    const consumptionMtPerDay = powerRequired * sfoc * 24 / 1e6;

    const fuelCosts: Record<string, number> = {
        IFO380: 400,
        VLSFO: 550,
        MGO: 750,
        LNG: 500,
    };
    const co2Factors: Record<string, number> = {
        IFO380: 3.15,
        VLSFO: 3.12,
        MGO: 3.18,
        LNG: 2.75,
    };

    const costPerMt = fuelCosts[fuelType] || 500;
    const dailyFuelCost = consumptionMtPerDay * costPerMt;
    const co2TonsPerDay = consumptionMtPerDay * (co2Factors[fuelType] || 3.15);

    return { consumptionMtPerDay, costPerMt, dailyFuelCost, co2TonsPerDay };
}


// ============================================================
// Sub-Step 5.7: Gas Transportation
// ============================================================

/**
 * Line pack inventory calculation
 * Gas stored in the pipeline = volume × average pressure × compressibility
 */
export function linePackInventory(
    diameterIn: number,
    lengthMi: number,
    avgPressurePsia: number,
    avgTempR: number,
    compressibilityZ: number,
    basePressurePsia: number = 14.7,
    baseTempR: number = 520,
): number {
    const volumeCuFt = Math.PI * Math.pow(diameterIn / 24, 2) * lengthMi * 5280;
    const scfPerCuFt = (avgPressurePsia * baseTempR) / (basePressurePsia * avgTempR * compressibilityZ);
    return volumeCuFt * scfPerCuFt / 1e6; // MMSCF
}

/**
 * LNG boil-off gas rate
 */
export function lngBoilOffRate(
    tankVolumeM3: number,
    boilOffRatePctPerDay: number,  // Typically 0.10-0.15%
    ladenPct: number,              // How full the tank is
): { boilOffM3PerDay: number; boilOffMMBtuPerDay: number; boilOffMTPAPerYear: number } {
    const boilOffM3PerDay = tankVolumeM3 * ladenPct * boilOffRatePctPerDay / 100;
    // 1 m³ LNG ≈ 600 Nm³ gas ≈ 23.5 MMBtu
    const boilOffMMBtuPerDay = boilOffM3PerDay * 23.5;
    const boilOffMTPAPerYear = boilOffM3PerDay * 365 * 0.45 / 1e6; // t/d → MTPA
    return { boilOffM3PerDay, boilOffMMBtuPerDay, boilOffMTPAPerYear };
}

/**
 * LNG regasification heat duty
 */
export function regasificationHeatDuty(
    sendOutMMscfd: number,
    lngTempC: number,
    targetTempC: number,
): { heatDutyMMBtuPerHr: number; seawaterFlowGpm: number; vaporizerCount: number } {
    // LNG latent heat ~ 510 kJ/kg, sensible ~200 kJ/kg from -162°C to 5°C
    // 1 MMSCFD ≈ 20.8 tonnes LNG
    const lngTonsPerDay = sendOutMMscfd * 20.8;
    const lngKgPerHr = lngTonsPerDay * 1000 / 24;
    const totalHeatKjPerKg = 510 + 2.1 * (targetTempC - lngTempC); // Latent + sensible
    const heatDutyKW = lngKgPerHr * totalHeatKjPerKg / 3600;
    const heatDutyMMBtuPerHr = heatDutyKW * 0.003412;

    // Seawater: ΔT = 5°C, Cp = 4.18 kJ/kg·°C
    const seawaterFlowKgPerHr = heatDutyKW * 3600 / (4.18 * 5);
    const seawaterFlowGpm = seawaterFlowKgPerHr / (1000 * 3.785 * 60);

    // ORV capacity ~ 150-200 t/h each
    const vaporizerCount = Math.ceil(lngTonsPerDay / 24 / 180);

    return { heatDutyMMBtuPerHr, seawaterFlowGpm, vaporizerCount };
}

/**
 * LNG liquefaction train cost estimation
 */
export function liquefactionTrainCost(
    trainCapacityMTPA: number,
    processType: 'C3MR' | 'DMR' | 'Cascade' | 'Nitrogen-Expander',
): { capexMillionDollars: number; opexDollarsPerMmbtu: number; powerRequiredMW: number } {
    const processFactors: Record<string, { capexPerMTPA: number; opexPerMmbtu: number; powerMWPerMTPA: number }> = {
        'C3MR': { capexPerMTPA: 600, opexPerMmbtu: 0.30, powerMWPerMTPA: 35 },
        'DMR': { capexPerMTPA: 580, opexPerMmbtu: 0.32, powerMWPerMTPA: 38 },
        'Cascade': { capexPerMTPA: 650, opexPerMmbtu: 0.28, powerMWPerMTPA: 32 },
        'Nitrogen-Expander': { capexPerMTPA: 500, opexPerMmbtu: 0.40, powerMWPerMTPA: 25 },
    };
    const pf = processFactors[processType] || processFactors['C3MR'];
    return {
        capexMillionDollars: pf.capexPerMTPA * trainCapacityMTPA,
        opexDollarsPerMmbtu: pf.opexPerMmbtu,
        powerRequiredMW: pf.powerMWPerMTPA * trainCapacityMTPA,
    };
}


// ============================================================
// Sub-Step 5.8: Midstream Commercial & Regulatory
// ============================================================

/**
 * Cost-of-service tariff calculation (FERC methodology)
 */
export function costOfServiceTariff(
    rateBase: number,              // Net plant + working capital (million $)
    allowedReturnPct: number,      // Typically 8-12%
    annualOandM: number,           // Operating & maintenance costs ($)
    annualThroughputBarrels: number,
    depreciationAnnual: number,    // Annual depreciation ($)
    taxRate: number,               // Corporate tax rate
): { revenueRequirement: number; tariffPerBarrel: number; tariffComponents: { component: string; perBarrel: number }[] } {
    const returnOnEquity = rateBase * allowedReturnPct / 100;
    const incomeTaxAllowance = returnOnEquity * taxRate / (1 - taxRate);
    const revenueRequirement = returnOnEquity + incomeTaxAllowance + annualOandM + depreciationAnnual;
    const tariffPerBarrel = revenueRequirement / annualThroughputBarrels;
    return {
        revenueRequirement,
        tariffPerBarrel,
        tariffComponents: [
            { component: 'Return on Rate Base', perBarrel: returnOnEquity / annualThroughputBarrels },
            { component: 'Income Tax Allowance', perBarrel: incomeTaxAllowance / annualThroughputBarrels },
            { component: 'O&M', perBarrel: annualOandM / annualThroughputBarrels },
            { component: 'Depreciation', perBarrel: depreciationAnnual / annualThroughputBarrels },
        ],
    };
}

/**
 * Ship-or-pay obligation calculation
 */
export function shipOrPayObligation(
    contractedVolumeBpd: number,
    actualVolumeBpd: number,
    tariffPerBarrel: number,
    shipOrPayFactor: number, // Typically 0.85-0.95 of contracted volume
): { shortfallBpd: number; shipOrPayCharge: number; actualTransportCost: number; effectiveRatePerBarrel: number } {
    const minimumVolume = contractedVolumeBpd * shipOrPayFactor;
    const shortfallBpd = Math.max(0, minimumVolume - actualVolumeBpd);
    const shipOrPayCharge = shortfallBpd * tariffPerBarrel * 365;
    const actualTransportCost = actualVolumeBpd * tariffPerBarrel * 365 + shipOrPayCharge;
    const effectiveRatePerBarrel = actualTransportCost / (actualVolumeBpd * 365);
    return { shortfallBpd, shipOrPayCharge, actualTransportCost, effectiveRatePerBarrel };
}

/**
 * Quality bank adjustment
 */
export function qualityBankAdjustment(
    crudeAPI: number,
    crudeSulfurPct: number,
    crudeTAN: number,             // Total Acid Number
    referenceAPI: number,
    referenceSulfurPct: number,
    referenceTAN: number,
): { apiAdjustmentPerBarrel: number; sulfurAdjustmentPerBarrel: number; tanAdjustmentPerBarrel: number; totalAdjustmentPerBarrel: number } {
    const apiDiff = crudeAPI - referenceAPI;
    const sulfurDiff = crudeSulfurPct - referenceSulfurPct;
    const tanDiff = crudeTAN - referenceTAN;
    const apiAdjustmentPerBarrel = apiDiff * 0.15; // $/bbl per API degree
    const sulfurAdjustmentPerBarrel = -sulfurDiff * 2.50; // Penalty for sulfur
    const tanAdjustmentPerBarrel = -tanDiff * 5.00; // Penalty for acidity
    const totalAdjustmentPerBarrel = apiAdjustmentPerBarrel + sulfurAdjustmentPerBarrel + tanAdjustmentPerBarrel;
    return { apiAdjustmentPerBarrel, sulfurAdjustmentPerBarrel, tanAdjustmentPerBarrel, totalAdjustmentPerBarrel };
}

/**
 * TCE (Time Charter Equivalent) calculation
 */
export function tceCalculation(
    grossFreightRevenue: number,
    bunkerCost: number,
    portCharges: number,
    canalFees: number,
    agencyFees: number,
    totalVoyageDays: number,
): number {
    const voyageCosts = bunkerCost + portCharges + canalFees + agencyFees;
    return (grossFreightRevenue - voyageCosts) / totalVoyageDays;
}

/**
 * Pipeline capacity apportionment
 */
export function pipelineCapacityApportionment(
    availableCapacityBpd: number,
    shipperNominations: { shipper: string; nominatedBpd: number }[],
): { shipper: string; nominatedBpd: number; allocatedBpd: number; cutbackPct: number }[] {
    const totalNominated = shipperNominations.reduce((s, n) => s + n.nominatedBpd, 0);
    if (totalNominated <= availableCapacityBpd) {
        return shipperNominations.map(s => ({
            ...s,
            allocatedBpd: s.nominatedBpd,
            cutbackPct: 0,
        }));
    }
    const proRataFactor = availableCapacityBpd / totalNominated;
    return shipperNominations.map(s => ({
        ...s,
        allocatedBpd: s.nominatedBpd * proRataFactor,
        cutbackPct: (1 - proRataFactor) * 100,
    }));
}