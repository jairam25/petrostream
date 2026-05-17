/**
 * Fix 9 — Sample Datasets for Every Stage
 * Provides pre-loaded sample data for each lifecycle stage so users
 * can immediately see a working simulation without entering data from scratch.
 *
 * Usage: import { explorationSample, appraisalSample, ... } from '../lib/sampleData';
 * Each sample function returns data compatible with the store layer type.
 */

// ───────────────────────────────────────────────────────────────
// HELPER: Generate synthetic well log (GR, resistivity, density, neutron, sonic)
// ───────────────────────────────────────────────────────────────
export interface LogPoint {
    depth: number;       // ft
    gr: number;          // API
    resistivity: number; // ohm-m
    density: number;     // g/cm³ (bulk)
    neutron: number;     // v/v (limestone porosity units)
    sonic: number;       // μs/ft (DT)
    caliper: number;     // inches
}

export interface CorePlug {
    depth: number;       // ft
    porosity: number;    // v/v fraction
    permeability: number; // mD
    grainDensity: number; // g/cm³
}

export interface WellLogDataset {
    name: string;
    field: string;
    basin: string;
    topReservoirFt: number;
    baseReservoirFt: number;
    oilWaterContactFt: number;
    points: LogPoint[];
    corePlugs: CorePlug[];
}

/**
 * Generate a synthetic sandstone reservoir well log with 500+ depth points.
 * Models a fining-upward sequence with clear sand-shale interbeds.
 */
export function generateSampleWellLog(): WellLogDataset {
    const topReservoir = 8500;
    const baseReservoir = 9050;
    const owc = 8920; // Oil-Water Contact
    const step = 1.0; // 1 ft sampling
    const nPoints = Math.floor((baseReservoir - topReservoir) / step) + 1;

    const points: LogPoint[] = [];
    const corePlugs: CorePlug[] = [];

    // Sand baseline parameters
    const sandGrMin = 25;
    const sandGrMax = 55;
    const shaleGrBase = 95;
    const shaleGrNoise = 20;
    const sandResistivity = 20;  // ohm-m (oil zone)
    const waterResistivity = 1.8; // ohm-m (water zone)
    const sandDensity = 2.35;     // g/cm³
    const shaleDensity = 2.62;
    const sandNeutron = 0.18;     // v/v
    const shaleNeutron = 0.38;
    const sandSonic = 65;         // μs/ft
    const shaleSonic = 95;
    const caliperBase = 8.5;      // inches (bit size)

    // Seed for reproducibility
    let seed = 42;
    function pseudoRandom(): number {
        seed = (seed * 16807 + 0) % 2147483647;
        return (seed - 1) / 2147483646;
    }

    // Create sand lobe pattern: alternating 10-30ft sands and 2-15ft shales
    const lobes: { start: number; end: number; sandFraction: number }[] = [];
    let currentDepth = topReservoir;
    let lobeIdx = 0;
    while (currentDepth < baseReservoir) {
        const isSand = lobeIdx % 2 === 0;
        const thickness = isSand
            ? 12 + pseudoRandom() * 25   // 12-37 ft sand
            : 2 + pseudoRandom() * 10;    // 2-12 ft shale
        const end = Math.min(currentDepth + thickness, baseReservoir);
        lobes.push({
            start: currentDepth,
            end,
            sandFraction: isSand ? 0.82 + pseudoRandom() * 0.16 : 0.05 + pseudoRandom() * 0.1,
        });
        currentDepth = end;
        lobeIdx++;
    }

    function lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    function sandFractionAtDepth(d: number): number {
        for (const lobe of lobes) {
            if (d >= lobe.start && d < lobe.end) {
                // Ease toward edges for transitional bounds
                const mid = (lobe.start + lobe.end) / 2;
                const halfLen = (lobe.end - lobe.start) / 2;
                const distFromMid = Math.abs(d - mid);
                const edgeWeight = Math.max(0, 1 - distFromMid / halfLen) * 0.3;
                return Math.max(0, Math.min(1, lobe.sandFraction - edgeWeight));
            }
        }
        return 0.05;
    }

    for (let i = 0; i < nPoints; i++) {
        const depth = topReservoir + i * step;
        const sf = sandFractionAtDepth(depth);

        // GR: low in sand, high in shale
        const grClean = sandGrMin + pseudoRandom() * (sandGrMax - sandGrMin);
        const grShaly = shaleGrBase + pseudoRandom() * shaleGrNoise;
        const gr = lerp(grClean, grShaly, 1 - sf) + (pseudoRandom() - 0.5) * 6;

        // Resistivity: high in oil sand, drops in water, low in shale
        const isOilZone = depth < owc;
        const rtClean = isOilZone ? sandResistivity : waterResistivity;
        const rtShale = 2.5 + pseudoRandom() * 1.5;
        const resistivity = lerp(rtClean, rtShale, 1 - sf) * (0.85 + pseudoRandom() * 0.3);

        // Density: lower in porous sand, higher in shale
        const density = lerp(sandDensity + pseudoRandom() * 0.06, shaleDensity + pseudoRandom() * 0.04, 1 - sf);

        // Neutron: lower in sand, higher in shale (sandstone scale)
        const neutron = lerp(sandNeutron + pseudoRandom() * 0.02, shaleNeutron + pseudoRandom() * 0.03, 1 - sf);

        // Sonic: lower (faster) in sand, higher (slower) in shale
        const sonic = lerp(sandSonic + pseudoRandom() * 4, shaleSonic + pseudoRandom() * 5, 1 - sf);

        // Caliper: on-gauge in sand, rugose/washout in shale
        const caliper = lerp(caliperBase + pseudoRandom() * 0.2, caliperBase + 1.5 + pseudoRandom() * 2.5, 1 - sf);

        points.push({
            depth: Math.round(depth * 10) / 10,
            gr: Math.round(gr * 10) / 10,
            resistivity: Math.round(resistivity * 100) / 100,
            density: Math.round(density * 1000) / 1000,
            neutron: Math.round(neutron * 1000) / 1000,
            sonic: Math.round(sonic * 10) / 10,
            caliper: Math.round(caliper * 10) / 10,
        });
    }

    // Generate 20 core plugs at representative depths
    const plugDepths: number[] = [];
    for (let i = 0; i < 20; i++) {
        plugDepths.push(topReservoir + 30 + (i / 19) * (baseReservoir - topReservoir - 60));
    }
    for (const depth of plugDepths) {
        const sf = sandFractionAtDepth(depth);
        const porosity = sf * (0.18 + pseudoRandom() * 0.10) + (1 - sf) * (0.02 + pseudoRandom() * 0.03);
        const logPerm = Math.log10(porosity * 100 * 8 + 0.001) * 2 + pseudoRandom() * 0.8;
        corePlugs.push({
            depth: Math.round(depth),
            porosity: Math.round(porosity * 10000) / 10000,
            permeability: Math.round(Math.pow(10, logPerm) * 100) / 100,
            grainDensity: Math.round((2.648 + pseudoRandom() * 0.02) * 1000) / 1000,
        });
    }

    return {
        name: 'EX-7 Sandstone Appraisal',
        field: 'West Delta Block 42',
        basin: 'Rift Basin, East Africa Analog',
        topReservoirFt: topReservoir,
        baseReservoirFt: baseReservoir,
        oilWaterContactFt: owc,
        points,
        corePlugs,
    };
}

// ───────────────────────────────────────────────────────────────
// EXPLORATION: Sample prospect in a rift basin
// ───────────────────────────────────────────────────────────────
export interface ExplorationSample {
    prospectName: string;
    basin: string;
    trapType: string;
    areaAcres: number;
    grossIntervalFt: number;
    netToGross: number;
    porosity: number;
    waterSaturation: number;
    formationVolumeFactor: number;
    recoveryFactor: number;
    seismicAmplitude: string;
    seismicConfidence: number;
    riskSource: number;
    riskReservoir: number;
    riskSeal: number;
    riskTrap: number;
    riskMigration: number;
    riskTiming: number;
    targetDepthFt: number;
    waterDepthFt: number;
}

export function getExplorationSample(): ExplorationSample {
    return {
        prospectName: 'Mlima-1 Rift Anticline',
        basin: 'East African Rift System (EARS) Analog',
        trapType: 'Faulted Anticline',
        areaAcres: 2840,
        grossIntervalFt: 320,
        netToGross: 0.62,
        porosity: 0.19,
        waterSaturation: 0.32,
        formationVolumeFactor: 1.28,
        recoveryFactor: 0.35,
        seismicAmplitude: 'Class III (bright spot)',
        seismicConfidence: 0.78,
        riskSource: 0.75,
        riskReservoir: 0.68,
        riskSeal: 0.82,
        riskTrap: 0.70,
        riskMigration: 0.80,
        riskTiming: 0.85,
        targetDepthFt: 11200,
        waterDepthFt: 0,
    };
}

// ───────────────────────────────────────────────────────────────
// APPRAISAL: Sample well log + core data (calls generateSampleWellLog)
// ───────────────────────────────────────────────────────────────
export function getAppraisalSample(): WellLogDataset {
    return generateSampleWellLog();
}

// ───────────────────────────────────────────────────────────────
// DRILLING: Sample well plan for a 12,000 ft deviated well
// ───────────────────────────────────────────────────────────────
export interface CasingString {
    holeSizeIn: number;
    casingSizeIn: number;
    shoeDepthFt: number;
    grade: string;
    weightLbFt: number;
    burstPsi: number;
    collapsePsi: number;
}

export interface MudSection {
    type: string;
    densityPpg: number;
    fromFt: number;
    toFt: number;
    plasticViscosity: number;
    yieldPoint: number;
}

export interface BHAComponent {
    description: string;
    odIn: number;
    lengthFt: number;
    cumulativeFt: number;
}

export interface WellPlanSample {
    name: string;
    wellType: string;
    totalDepthFt: number;
    tvdFt: number;
    kopFt: number;
    buildRateDegPer100ft: number;
    maxAngleDeg: number;
    lateralDisplacementFt: number;
    targetTvdFt: number;
    casingProgram: CasingString[];
    mudProgram: MudSection[];
    bhaComponents: BHAComponent[];
    bitType: string;
    expectedRopFph: number;
    costPerDay: number;
    totalDays: number;
    estimatedCostMMUSD: number;
}

export function getDrillingSample(): WellPlanSample {
    return {
        name: 'Mlima-1H Development Well',
        wellType: 'Horizontal Producer',
        totalDepthFt: 15200,
        tvdFt: 11180,
        kopFt: 3400,
        buildRateDegPer100ft: 2.5,
        maxAngleDeg: 89.5,
        lateralDisplacementFt: 4200,
        targetTvdFt: 11150,
        casingProgram: [
            { holeSizeIn: 26, casingSizeIn: 20, shoeDepthFt: 350, grade: 'K-55', weightLbFt: 94, burstPsi: 2110, collapsePsi: 520 },
            { holeSizeIn: 17.5, casingSizeIn: 13.375, shoeDepthFt: 3400, grade: 'N-80', weightLbFt: 68, burstPsi: 5020, collapsePsi: 1950 },
            { holeSizeIn: 12.25, casingSizeIn: 9.625, shoeDepthFt: 11150, grade: 'P-110', weightLbFt: 47, burstPsi: 9810, collapsePsi: 7240 },
            { holeSizeIn: 8.5, casingSizeIn: 5.5, shoeDepthFt: 15200, grade: 'P-110', weightLbFt: 23, burstPsi: 12620, collapsePsi: 9530 },
        ],
        mudProgram: [
            { type: 'Spud Mud', densityPpg: 9.0, fromFt: 0, toFt: 350, plasticViscosity: 8, yieldPoint: 6 },
            { type: 'WBM (KCl/Polymer)', densityPpg: 10.5, fromFt: 350, toFt: 3400, plasticViscosity: 14, yieldPoint: 16 },
            { type: 'OBM (Synthetic)', densityPpg: 12.0, fromFt: 3400, toFt: 11150, plasticViscosity: 24, yieldPoint: 18 },
            { type: 'OBM (Synthetic)', densityPpg: 11.5, fromFt: 11150, toFt: 15200, plasticViscosity: 22, yieldPoint: 15 },
        ],
        bhaComponents: [
            { description: 'Bit — 12.25" PDC, 6-blade', odIn: 12.25, lengthFt: 1.2, cumulativeFt: 1.2 },
            { description: 'Bit Sub', odIn: 9.5, lengthFt: 3, cumulativeFt: 4.2 },
            { description: 'Mud Motor — 9.5" 5:6 lobe, 3.0 stage', odIn: 9.5, lengthFt: 28, cumulativeFt: 32.2 },
            { description: 'Float Sub', odIn: 9.5, lengthFt: 3, cumulativeFt: 35.2 },
            { description: 'Stabilizer — Spiral', odIn: 12.0, lengthFt: 6, cumulativeFt: 41.2 },
            { description: 'MWD/LWD Sub — GR, Res, APWD', odIn: 8.25, lengthFt: 32, cumulativeFt: 73.2 },
            { description: 'Stabilizer — Spiral', odIn: 12.0, lengthFt: 6, cumulativeFt: 79.2 },
            { description: 'Drill Collar — 8.25" x 3"', odIn: 8.25, lengthFt: 270, cumulativeFt: 349.2 },
            { description: 'Jar — 8" Hydraulic', odIn: 8.0, lengthFt: 32, cumulativeFt: 381.2 },
            { description: 'HWDP — 5" x 3"', odIn: 5.0, lengthFt: 540, cumulativeFt: 921.2 },
            { description: 'Drill Pipe — 5" S-135', odIn: 5.0, lengthFt: 10229, cumulativeFt: 11150 },
        ],
        bitType: 'PDC — 6-blade, 13mm cutters',
        expectedRopFph: 45,
        costPerDay: 185000,
        totalDays: 48,
        estimatedCostMMUSD: 8.88,
    };
}

// ───────────────────────────────────────────────────────────────
// PRODUCTION: 5-year monthly production history for a 10-well field
// ───────────────────────────────────────────────────────────────
export interface ProductionMonth {
    year: number;
    month: number; // 1-12
    oilBopd: number;
    gasMmscfd: number;
    waterBopd: number;
    waterCut: number;
    flowingBhpPsi: number;
    chokeSize64th: number;
    gasLiftMMscfd: number;
}

export interface ProductionHistorySample {
    fieldName: string;
    startYear: number;
    startMonth: number;
    numWells: number;
    initialOilBopd: number;
    plateauOilBopd: number;
    plateauEndMonth: number; // month index when plateau ends
    declineRateAnnual: number;
    months: ProductionMonth[];
}

export function getProductionSample(): ProductionHistorySample {
    const seed = 137;
    function prng(): number {
        // Simple LCG
        const s = (seed * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    }

    const startMonth = 1;
    const startYear = 2021;
    const nWells = 10;
    const initialOilBopd = 12500;
    const plateauOilBopd = 11800;
    const plateauEndMonth = 18; // 1.5 years of plateau
    const declineRateAnnual = 0.28; // 28% annual decline
    const declineRateMonthly = 1 - Math.pow(1 - declineRateAnnual, 1 / 12);

    const months: ProductionMonth[] = [];
    let currentOil = initialOilBopd;
    let cumOil = 0;
    let waterCut = 0.02;

    for (let i = 0; i < 60; i++) {
        const year = startYear + Math.floor(i / 12);
        const month = ((startMonth - 1 + i) % 12) + 1;

        // Build-up phase (months 0-5)
        if (i < 6) {
            const rampFactor = 0.3 + (i / 6) * 0.7;
            currentOil = initialOilBopd * (0.4 + rampFactor * 0.5);
            waterCut = 0.01 + (i / 60) * 0.02;
        }
        // Plateau phase (months 6-17)
        else if (i < plateauEndMonth) {
            currentOil = plateauOilBopd + (prng() - 0.5) * 400;
            waterCut = 0.03 + (i - 6) / (plateauEndMonth - 6) * 0.08;
        }
        // Decline phase (months 18-59)
        else {
            const monthsInDecline = i - plateauEndMonth;
            currentOil = currentOil * (1 - declineRateMonthly);
            // Add some noise
            currentOil *= 0.96 + prng() * 0.08;
            waterCut = 0.12 + monthsInDecline * 0.007 + (prng() - 0.5) * 0.03;
            waterCut = Math.min(waterCut, 0.72);
        }

        currentOil = Math.max(currentOil, 200);
        cumOil += currentOil * 30.4375;

        const gasBopd = currentOil * (1.1 + prng() * 0.4); // GOR ~1100-1500 scf/bbl
        const waterBopd = currentOil * (waterCut / (1 - waterCut + 0.0001));
        const fbhpp = 4800 - (i * 35) + (prng() - 0.5) * 200;

        months.push({
            year,
            month,
            oilBopd: Math.round(currentOil),
            gasMmscfd: Math.round(gasBopd * 100) / 100,
            waterBopd: Math.round(waterBopd * 10) / 10,
            waterCut: Math.round(waterCut * 10000) / 100,
            flowingBhpPsi: Math.round(fbhpp),
            chokeSize64th: Math.round(32 + prng() * 16),
            gasLiftMMscfd: i > 30 ? Math.round((2 + prng() * 4) * 10) / 10 : 0,
        });
    }

    return {
        fieldName: 'West Delta Block 42 — Producers',
        startYear,
        startMonth,
        numWells: nWells,
        initialOilBopd,
        plateauOilBopd,
        plateauEndMonth,
        declineRateAnnual,
        months,
    };
}

// ───────────────────────────────────────────────────────────────
// REFINING: Sample crude assay (TBP curve, fraction properties)
// ───────────────────────────────────────────────────────────────
export interface TBPCut {
    tbpTempF: number;
    cumulativeYieldWtPct: number;
    apiGravity: number;
    sulfurWtPct: number;
}

export interface CrudeAssaySample {
    crudeName: string;
    apiGravity: number;
    sulfurWtPct: number;
    tanMgKoh: number;
    nickelPpm: number;
    vanadiumPpm: number;
    pourPointF: number;
    viscosityCstAt100F: number;
    rvpPsi: number;
    saltLbPer1000Bbl: number;
    tbpCuts: TBPCut[];
    fractionProperties: {
        naphtha: { yieldWtPct: number; api: number; sulfur: number; octane: number };
        kerosene: { yieldWtPct: number; api: number; sulfur: number; freezePointF: number; smokePointMm: number };
        diesel: { yieldWtPct: number; api: number; sulfur: number; cetane: number; cloudPointF: number };
        vgo: { yieldWtPct: number; api: number; sulfur: number; anilinePointF: number };
        vacuumResid: { yieldWtPct: number; api: number; sulfur: number; concarbonWtPct: number };
    };
}

export function getRefiningSample(): CrudeAssaySample {
    return {
        crudeName: 'Mars Blend (Medium Sour)',
        apiGravity: 31.0,
        sulfurWtPct: 1.52,
        tanMgKoh: 0.42,
        nickelPpm: 18,
        vanadiumPpm: 35,
        pourPointF: 15,
        viscosityCstAt100F: 12.8,
        rvpPsi: 5.2,
        saltLbPer1000Bbl: 12,
        tbpCuts: [
            { tbpTempF: 65, cumulativeYieldWtPct: 0, apiGravity: 82, sulfurWtPct: 0.01 },
            { tbpTempF: 100, cumulativeYieldWtPct: 3.2, apiGravity: 78, sulfurWtPct: 0.01 },
            { tbpTempF: 150, cumulativeYieldWtPct: 7.8, apiGravity: 65, sulfurWtPct: 0.02 },
            { tbpTempF: 200, cumulativeYieldWtPct: 12.5, apiGravity: 55, sulfurWtPct: 0.05 },
            { tbpTempF: 250, cumulativeYieldWtPct: 17.0, apiGravity: 48, sulfurWtPct: 0.12 },
            { tbpTempF: 300, cumulativeYieldWtPct: 21.0, apiGravity: 42, sulfurWtPct: 0.25 },
            { tbpTempF: 350, cumulativeYieldWtPct: 24.8, apiGravity: 37, sulfurWtPct: 0.45 },
            { tbpTempF: 400, cumulativeYieldWtPct: 28.5, apiGravity: 34, sulfurWtPct: 0.68 },
            { tbpTempF: 450, cumulativeYieldWtPct: 32.0, apiGravity: 31, sulfurWtPct: 0.95 },
            { tbpTempF: 500, cumulativeYieldWtPct: 35.5, apiGravity: 28, sulfurWtPct: 1.20 },
            { tbpTempF: 550, cumulativeYieldWtPct: 39.0, apiGravity: 26, sulfurWtPct: 1.45 },
            { tbpTempF: 600, cumulativeYieldWtPct: 42.8, apiGravity: 24, sulfurWtPct: 1.65 },
            { tbpTempF: 650, cumulativeYieldWtPct: 47.0, apiGravity: 22, sulfurWtPct: 1.85 },
            { tbpTempF: 700, cumulativeYieldWtPct: 51.5, apiGravity: 20, sulfurWtPct: 2.05 },
            { tbpTempF: 750, cumulativeYieldWtPct: 56.0, apiGravity: 18, sulfurWtPct: 2.25 },
            { tbpTempF: 800, cumulativeYieldWtPct: 60.5, apiGravity: 16, sulfurWtPct: 2.45 },
            { tbpTempF: 850, cumulativeYieldWtPct: 65.0, apiGravity: 14, sulfurWtPct: 2.65 },
            { tbpTempF: 900, cumulativeYieldWtPct: 69.0, apiGravity: 12, sulfurWtPct: 2.85 },
            { tbpTempF: 950, cumulativeYieldWtPct: 73.0, apiGravity: 10, sulfurWtPct: 3.05 },
            { tbpTempF: 1000, cumulativeYieldWtPct: 76.5, apiGravity: 8, sulfurWtPct: 3.25 },
            { tbpTempF: 1050, cumulativeYieldWtPct: 80.0, apiGravity: 6, sulfurWtPct: 3.50 },
        ],
        fractionProperties: {
            naphtha: { yieldWtPct: 17.0, api: 55, sulfur: 0.05, octane: 52 },
            kerosene: { yieldWtPct: 11.5, api: 38, sulfur: 0.28, freezePointF: -52, smokePointMm: 22 },
            diesel: { yieldWtPct: 21.0, api: 31, sulfur: 0.95, cetane: 44, cloudPointF: 8 },
            vgo: { yieldWtPct: 34.0, api: 22, sulfur: 1.85, anilinePointF: 165 },
            vacuumResid: { yieldWtPct: 16.5, api: 8, sulfur: 3.25, concarbonWtPct: 18.5 },
        },
    };
}

// ───────────────────────────────────────────────────────────────
// RETAIL: Sample station with 3 USTs, 8 dispensers, 12 months sales
// ───────────────────────────────────────────────────────────────
export interface USTInfo {
    id: string;
    capacityGal: number;
    product: string;
    currentInventoryGal: number;
    reorderPointGal: number;
    tankMaterial: string;
    installYear: number;
}

export interface DispenserInfo {
    id: string;
    hoses: number;
    products: string[];
    avgGpm: number;
}

export interface RetailSalesMonth {
    year: number;
    month: number;
    regularGal: number;
    premiumGal: number;
    dieselGal: number;
    regularPricePerGal: number;
    premiumPricePerGal: number;
    dieselPricePerGal: number;
    totalRevenue: number;
    totalTransactions: number;
    avgTransactionGal: number;
}

export interface RetailStationSample {
    stationName: string;
    location: string;
    usts: USTInfo[];
    dispensers: DispenserInfo[];
    salesHistory: RetailSalesMonth[];
}

// ───────────────────────────────────────────────────────────────
// CCUS: Sample CO₂ sources, capture, storage, and economics
// ───────────────────────────────────────────────────────────────
export interface CCUSSample {
    projectName: string;
    basin: string;
    sourceType: string;
    annualEmissionsTonne: number;
    co2Purity: number;
    captureTech: string;
    captureEfficiency: number;
    captureCostPerTonne: number;
    transportMode: string;
    transportDistanceKm: number;
    storageType: string;
    reservoirDepthM: number;
    storageCapacityMt: number;
    injectivityIndex: number;
    monitoringMethods: string[];
    regulatoryFramework: string;
    carbonPricePerTonne: number;
    projectLifetimeYears: number;
    totalCapexM: number;
    annualOpexM: number;
}

export function getCCUSSample(): CCUSSample {
    return {
        projectName: 'Northern Lights Phase II Analog',
        basin: 'North Sea — Utsira Formation',
        sourceType: 'Gas-Fired Power Plant + Cement Kiln',
        annualEmissionsTonne: 1500000,
        co2Purity: 0.97,
        captureTech: 'Amine-Based Post-Combustion',
        captureEfficiency: 0.90,
        captureCostPerTonne: 42.50,
        transportMode: 'Pipeline (Dense Phase)',
        transportDistanceKm: 110,
        storageType: 'Saline Aquifer',
        reservoirDepthM: 2600,
        storageCapacityMt: 100,
        injectivityIndex: 8.5,
        monitoringMethods: ['4D Seismic', 'InSAR', 'Tracers', 'Downhole P/T', 'Geochemistry'],
        regulatoryFramework: 'EU ETS + London Protocol',
        carbonPricePerTonne: 85,
        projectLifetimeYears: 25,
        totalCapexM: 980,
        annualOpexM: 65,
    };
}

// ───────────────────────────────────────────────────────────────
// ECONOMICS: Sample petroleum fiscal system & cash flow model
// ───────────────────────────────────────────────────────────────
export interface EconomicsSample {
    projectName: string;
    country: string;
    fiscalSystem: string;
    royaltyRate: number;
    costRecoveryCeiling: number;
    profitOilSplitGovt: number;
    incomeTaxRate: number;
    oilPriceBrent: number;
    gasPriceHenryHub: number;
    oilProductionBopd: number;
    gasProductionMmscfd: number;
    capexM: number;
    opexPerBbl: number;
    abandonmentCostM: number;
    discountRate: number;
    projectLifeYears: number;
    inflationRate: number;
    exchangeRate: number;
}

export function getEconomicsSample(): EconomicsSample {
    return {
        projectName: 'Deepwater Block 44 — PSC Model',
        country: 'Nigeria (Deep Offshore)',
        fiscalSystem: 'Production Sharing Contract',
        royaltyRate: 12.0,
        costRecoveryCeiling: 80.0,
        profitOilSplitGovt: 65.0,
        incomeTaxRate: 50.0,
        oilPriceBrent: 78.50,
        gasPriceHenryHub: 3.25,
        oilProductionBopd: 75000,
        gasProductionMmscfd: 120,
        capexM: 4500,
        opexPerBbl: 12.50,
        abandonmentCostM: 350,
        discountRate: 10.0,
        projectLifeYears: 20,
        inflationRate: 3.0,
        exchangeRate: 1.0,
    };
}

// ───────────────────────────────────────────────────────────────
// UNCONVENTIONAL: Sample shale/tight/CBM dataset
// ───────────────────────────────────────────────────────────────
export interface UnconventionalSample {
    playName: string;
    basin: string;
    resourceType: string;
    tvdFt: number;
    lateralLengthFt: number;
    numberOfStages: number;
    proppantPerStageLbs: number;
    fluidPerStageBbl: number;
    wellSpacingAcres: number;
    eurMboe: number;
    ipBopd: number;
    declineRate: number;
    oilGravityApi: number;
    porosity: number;
    permeabilityNd: number;
    tocWtPct: number;
    initialProduction: number[];
    monthlyDecline: number[];
}

export function getUnconventionalSample(): UnconventionalSample {
    const ipData = [1250, 1180, 1125, 1070, 1020, 975, 930, 890, 855, 820, 790, 760];
    const declineData = [5.6, 4.7, 4.9, 4.8, 4.6, 4.7, 4.5, 4.4, 4.3, 4.2, 4.1, 4.0];
    return {
        playName: 'Wolfcamp A — Midland Basin Type Well',
        basin: 'Permian Basin, West Texas',
        resourceType: 'Shale Oil (Unconventional Tight)',
        tvdFt: 8200,
        lateralLengthFt: 10500,
        numberOfStages: 48,
        proppantPerStageLbs: 350000,
        fluidPerStageBbl: 8500,
        wellSpacingAcres: 80,
        eurMboe: 650,
        ipBopd: 1250,
        declineRate: 65.0,
        oilGravityApi: 42,
        porosity: 0.08,
        permeabilityNd: 550,
        tocWtPct: 3.8,
        initialProduction: ipData,
        monthlyDecline: declineData,
    };
}

export function getRetailSample(): RetailStationSample {
    const seed = 42;
    function prng(): number {
        const s = (seed * 16807) % 2147483647;
        return s / 2147483647;
    }

    const regularBase = 125000;
    const premiumRatio = 0.18;
    const dieselBase = 42000;
    const regPriceBase = 3.15;
    const premPriceBase = 3.85;
    const dieselPriceBase = 3.65;

    const salesHistory: RetailSalesMonth[] = [];
    for (let i = 0; i < 12; i++) {
        const year = 2025;
        const month = i + 1;
        const seasonal = 1 + 0.12 * Math.sin((month - 3) * Math.PI / 6); // Summer peak

        const regularGal = Math.round(regularBase * seasonal * (0.92 + prng() * 0.16));
        const premiumGal = Math.round(regularGal * premiumRatio * (0.90 + prng() * 0.20));
        const dieselGal = Math.round(dieselBase * seasonal * (0.93 + prng() * 0.14));

        const regPrice = Math.round((regPriceBase + (prng() - 0.5) * 0.6) * 100) / 100;
        const premPrice = Math.round((premPriceBase + (prng() - 0.5) * 0.7) * 100) / 100;
        const dieselPrice = Math.round((dieselPriceBase + (prng() - 0.5) * 0.5) * 100) / 100;

        const totalRevenue = Math.round((regularGal * regPrice + premiumGal * premPrice + dieselGal * dieselPrice) * 100) / 100;
        const totalTransactions = Math.round((regularGal + premiumGal + dieselGal) / (10 + prng() * 5));

        salesHistory.push({
            year,
            month,
            regularGal,
            premiumGal,
            dieselGal,
            regularPricePerGal: regPrice,
            premiumPricePerGal: premPrice,
            dieselPricePerGal: dieselPrice,
            totalRevenue,
            totalTransactions,
            avgTransactionGal: Math.round((regularGal + premiumGal + dieselGal) / totalTransactions * 10) / 10,
        });
    }

    return {
        stationName: 'PetroStream Station #42 — Highway 290',
        location: 'Austin, TX — Suburban Corridor',
        usts: [
            { id: 'UST-1', capacityGal: 20000, product: 'Regular 87', currentInventoryGal: 12400, reorderPointGal: 4000, tankMaterial: 'FRP', installYear: 2018 },
            { id: 'UST-2', capacityGal: 12000, product: 'Premium 93', currentInventoryGal: 7800, reorderPointGal: 2400, tankMaterial: 'FRP', installYear: 2018 },
            { id: 'UST-3', capacityGal: 10000, product: 'Diesel #2', currentInventoryGal: 6200, reorderPointGal: 2000, tankMaterial: 'Steel (STI-P3)', installYear: 2015 },
        ],
        dispensers: [
            { id: 'DISP-1', hoses: 4, products: ['Regular', 'Premium'], avgGpm: 8.5 },
            { id: 'DISP-2', hoses: 4, products: ['Regular', 'Premium'], avgGpm: 8.5 },
            { id: 'DISP-3', hoses: 4, products: ['Regular', 'Premium'], avgGpm: 8.5 },
            { id: 'DISP-4', hoses: 4, products: ['Regular', 'Premium'], avgGpm: 8.5 },
            { id: 'DISP-5', hoses: 4, products: ['Regular', 'Premium'], avgGpm: 8.5 },
            { id: 'DISP-6', hoses: 4, products: ['Regular', 'Premium'], avgGpm: 8.5 },
            { id: 'DISP-7', hoses: 2, products: ['Diesel'], avgGpm: 7.0 },
            { id: 'DISP-8', hoses: 2, products: ['Diesel'], avgGpm: 7.0 },
        ],
        salesHistory,
    };
}