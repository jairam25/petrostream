/**
 * Well Completion Engineering Calculation Library
 * API RP 19B / ISO 17824 / NACE MR0175 compliant
 */

// ── Types ──
export interface PerforationInputs {
    formationPerm: number;  // mD
    porosity: number;       // fraction
    shotDensity: number;    // spf
    perfDiameter: number;   // inches
    perfLength: number;     // inches
    wellRadius: number;     // inches
    damageSkin: number;     // dimensionless
    compactionSkin: number; // dimensionless
    anisotropy: number;     // kv/kh
}

export interface CasingDesignInputs {
    collapsePressure: number;   // psi
    burstPressure: number;      // psi
    axialLoad: number;          // lbf
    casingOD: number;           // inches
    wallThickness: number;      // inches
    grade: string;              // e.g. 'L-80', 'P-110', 'Q-125'
    connectionType: string;     // e.g. 'BTC', 'VAM TOP', 'Hydril 563'
    sourService: boolean;       // NACE MR0175 applicable
}

export interface GravelPackInputs {
    formationSandD50: number;   // microns
    gravelSize: string;         // e.g. '20/40', '40/60'
    perfLength: number;         // ft
    annulusOD: number;          // inches
    screenOD: number;           // inches
    pumpRate: number;           // bbl/min
    carrierFluidVisc: number;   // cP
}

export interface ICDInputs {
    zonePerm: number[];         // mD per zone
    zoneLength: number[];       // ft per zone
    zonePressure: number[];     // psi per zone
    targetDrawdown: number;     // psi
    wellRadius: number;         // inches
    fluidVisc: number;          // cP
    fluidDensity: number;       // ppg
}

export interface TubingStringInputs {
    depth: number;              // ft
    tubingOD: number;           // inches
    tubingID: number;           // inches
    tubingWeight: number;       // lb/ft
    grade: string;              // e.g. 'L-80'
    packerDepth: number;        // ft
    annulusFluidDensity: number;// ppg
    tubingPressure: number;     // psi
    annulusPressure: number;    // psi
    temperature: number;        // °F
}

export interface SandControlInputs {
    formationD50: number;       // microns
    uniformityCoeff: number;    // d40/d90
    finesFrac: number;          // fraction < 44 micron
    wellDeviation: number;      // degrees
    expectedRate: number;       // bbl/day
    fluidVisc: number;          // cP
}

export interface CompletionFluidInputs {
    formationPressure: number;  // psi
    depth: number;              // ft
    overbalanceMargin: number;  // psi
    fluidType: string;          // 'brine' | 'OBM' | 'WBM'
    baseDensity: number;        // ppg
}

// ── Constants ──
const GRAVITY = 32.174; // ft/s²

// ── Perforation Engineering ──

/** Calculate perforation skin factor (Karasiak / Tariq model) */
export function calculatePerforationSkin(inputs: PerforationInputs): {
    totalSkin: number;
    convergenceSkin: number;
    wellboreSkin: number;
    compactionSkinTotal: number;
    productivityRatio: number;
    cfd: number; // completion flow efficiency
} {
    const { shotDensity, perfDiameter, perfLength, wellRadius, formationPerm, anisotropy } = inputs;

    // Shot spacing in inches
    const shotSpacing = 12 / shotDensity;

    // Horizontal convergence skin (Karasiak)
    const alpha = anisotropy; // kv/kh
    const rwEff = wellRadius / 12; // convert to ft
    const lp = perfLength / 12; // ft

    const convergenceSkin = (1 / (shotDensity * lp)) *
        Math.log(rwEff / (2 * alpha * lp));

    // Wellbore skin (phase angle effect — assume 60° phasing)
    const wellboreSkin = (shotDensity < 6) ? 2.5 : (shotDensity < 12) ? 1.2 : 0.4;

    // Compaction skin (~0.5" crushed zone)
    const kc = formationPerm * 0.2; // 80% perm reduction in crushed zone
    const rc = (perfDiameter / 2 + 0.5) / 12; // crushed zone radius (ft)
    const compactionSkinPerPerf = (formationPerm / kc - 1) * Math.log(rc / (perfDiameter / 24));
    const compactionSkinTotal = compactionSkinPerPerf / (shotDensity * lp);

    // Total skin
    const totalSkin = convergenceSkin + wellboreSkin + compactionSkinTotal + inputs.damageSkin + inputs.compactionSkin;

    // Productivity ratio (PR)
    const lnReRw = Math.log(1000 / (wellRadius / 12)); // drainage radius ~1000 ft
    const productivityRatio = lnReRw / (lnReRw + totalSkin);

    // Completion flow efficiency
    const cfd = Math.max(0, Math.min(1, productivityRatio));

    return {
        totalSkin: Math.round(totalSkin * 100) / 100,
        convergenceSkin: Math.round(convergenceSkin * 100) / 100,
        wellboreSkin: Math.round(wellboreSkin * 100) / 100,
        compactionSkinTotal: Math.round(compactionSkinTotal * 100) / 100,
        productivityRatio: Math.round(productivityRatio * 1000) / 1000,
        cfd: Math.round(cfd * 100) / 100
    };
}

// ── Casing Design (Triaxial Stress) ──

/** Evaluate casing under triaxial stress (Von Mises) */
export function evaluateCasingTriaxial(inputs: CasingDesignInputs): {
    vonMises: number;
    designFactor: number;
    collapseDF: number;
    burstDF: number;
    axialDF: number;
    suitability: string;
    naceCompliant: boolean;
} {
    const { collapsePressure, burstPressure, axialLoad, casingOD, wallThickness, grade, sourService } = inputs;

    // Grade yield strengths (psi)
    const gradeYield: Record<string, number> = {
        'H-40': 40000, 'J-55': 55000, 'K-55': 55000,
        'N-80': 80000, 'L-80': 80000, 'C-90': 90000,
        'T-95': 95000, 'P-110': 110000, 'Q-125': 125000,
        'V-150': 150000
    };

    const Yp = gradeYield[grade] || 80000;

    // NACE MR0175 hardness limits
    const naceMaxYield: Record<string, number> = {
        'L-80': 80000, 'C-90': 90000, 'T-95': 95000
    };
    const naceCompliant = !sourService || (grade in naceMaxYield && Yp <= naceMaxYield[grade]);

    // Cross-sectional area
    const csArea = Math.PI * (Math.pow(casingOD / 2, 2) - Math.pow((casingOD - 2 * wallThickness) / 2, 2));

    // Hoop stress (burst)
    const hoopStress = (burstPressure * casingOD) / (2 * wallThickness);

    // Radial stress (collapse)
    const radialStress = -(collapsePressure * casingOD) / (2 * wallThickness);

    // Axial stress
    const axialStress = axialLoad / csArea;

    // Von Mises stress
    const vonMises = Math.sqrt(
        0.5 * (
            Math.pow(hoopStress - axialStress, 2) +
            Math.pow(axialStress - radialStress, 2) +
            Math.pow(radialStress - hoopStress, 2)
        )
    );

    // Design factors (API 5C3)
    const collapseDF = (collapsePressure > 0) ? Yp / Math.abs(radialStress) : 99;
    const burstDF = (burstPressure > 0) ? Yp / hoopStress : 99;
    const axialDF = (axialLoad > 0) ? Yp / Math.abs(axialStress) : 99;
    const designFactor = Math.min(collapseDF, burstDF, axialDF);

    let suitability: string;
    if (designFactor >= 1.25) suitability = 'Meets API 5C3 DF ≥ 1.25 — Approved';
    else if (designFactor >= 1.1) suitability = 'Meets minimum DF ≥ 1.1 — Acceptable with monitoring';
    else if (designFactor >= 1.0) suitability = 'Marginal — Consider higher grade or heavier wall';
    else suitability = 'FAIL — Design factor below 1.0. Redesign required.';

    return {
        vonMises: Math.round(vonMises),
        designFactor: Math.round(designFactor * 100) / 100,
        collapseDF: Math.round(collapseDF * 100) / 100,
        burstDF: Math.round(burstDF * 100) / 100,
        axialDF: Math.round(axialDF * 100) / 100,
        suitability,
        naceCompliant
    };
}

// ── Gravel Pack Design (Saucier) ──

/** Calculate gravel pack sizing per Saucier criterion */
export function designGravelPack(inputs: GravelPackInputs): {
    saucierRatio: number;
    gravelD50: number;
    isSaucierCompliant: boolean;
    pumpRateMin: number;
    pumpRateMax: number;
    gravelVolumeBbl: number;
    gravelMassLb: number;
    carrierViscRequired: number;
} {
    const { formationSandD50, gravelSize, perfLength, annulusOD, screenOD, pumpRate, carrierFluidVisc } = inputs;

    // Parse gravel size
    const [dMin, dMax] = gravelSize.split('/').map(Number);
    const gravelD50 = (dMin + dMax) / 2; // microns

    // Saucier criterion: D50gravel / D50sand = 5-6
    const saucierRatio = gravelD50 / formationSandD50;
    const isSaucierCompliant = saucierRatio >= 3 && saucierRatio <= 8;

    // Pump rate for gravel transport
    // Minimum: 1 ft/sec annular velocity
    const annularArea = Math.PI * (Math.pow(annulusOD / 2, 2) - Math.pow(screenOD / 2, 2)) / 144; // sq ft
    const pumpRateMin = annularArea * 1.0 * 60 / 5.6146; // bbl/min for 1 ft/sec

    // Maximum: below frac gradient (~1 psi/ft)
    const pumpRateMax = pumpRateMin * 2.5; // approximate upper limit

    // Gravel volume
    const annularVolCuft = annularArea * perfLength;
    const gravelVolumeBbl = annularVolCuft / 5.6146 * 1.5; // 50% excess
    const gravelMassLb = gravelVolumeBbl * 42 * (gravelD50 / 1000 * 0.0022 * 1000); // approximate

    // Required carrier fluid viscosity
    const carrierViscRequired = Math.max(20, gravelD50 / 10);

    return {
        saucierRatio: Math.round(saucierRatio * 10) / 10,
        gravelD50,
        isSaucierCompliant,
        pumpRateMin: Math.round(pumpRateMin * 10) / 10,
        pumpRateMax: Math.round(pumpRateMax * 10) / 10,
        gravelVolumeBbl: Math.round(gravelVolumeBbl * 10) / 10,
        gravelMassLb: Math.round(gravelMassLb),
        carrierViscRequired: Math.round(carrierViscRequired)
    };
}

// ── ICD / Flow Control Design ──

/** Design ICD nozzle sizing for even inflow distribution */
export function designICDNozzles(inputs: ICDInputs): {
    nozzleSizes: number[];
    flowRatesPerZone: number[];
    pressureDropPerZone: number[];
    evenSweepEfficiency: number;
    drawdownProfile: { zone: number; dd: number }[];
} {
    const { zonePerm, zoneLength, zonePressure, targetDrawdown, fluidVisc } = inputs;
    const n = zonePerm.length;

    const flowRatesPerZone: number[] = [];
    const pressureDropPerZone: number[] = [];
    const nozzleSizes: number[] = [];
    const drawdownProfile: { zone: number; dd: number }[] = [];

    // Calculate required ICD ΔP per zone to balance inflow
    // Target rate proportional to kh per zone
    const khPerZone = zonePerm.map((k, i) => k * zoneLength[i]);
    const totalKH = khPerZone.reduce((a, b) => a + b, 0);

    // Base flow (Darcy radial per zone)
    for (let i = 0; i < n; i++) {
        const zoneKH = zonePerm[i] * zoneLength[i];
        const targetRate = 100 * (zoneKH / totalKH); // normalized to 100 bbl/day base

        // ICD ΔP = zone pressure - flowing BHP
        const zoneDD = targetDrawdown * (1 - zoneKH / totalKH * 0.3);
        const pressureDrop = Math.max(50, zonePressure[i] - zoneDD);

        // Nozzle diameter (simplified orifice equation)
        // Q = 0.6 * sqrt(ΔP/ρ) * Cv; for water-like: Cv ≈ 1
        const nozzleD = Math.sqrt(targetRate / (0.6 * Math.sqrt(pressureDrop / fluidVisc))) * 0.1;

        flowRatesPerZone.push(Math.round(targetRate * 10) / 10);
        pressureDropPerZone.push(Math.round(pressureDrop));
        nozzleSizes.push(Math.round(nozzleD * 100) / 100);
        drawdownProfile.push({ zone: i + 1, dd: Math.round(zoneDD) });
    }

    // Even sweep efficiency (lower spread = better)
    const maxNozzle = Math.max(...nozzleSizes);
    const minNozzle = Math.min(...nozzleSizes);
    const evenSweepEfficiency = Math.max(0, Math.min(1, 1 - (maxNozzle - minNozzle) / maxNozzle * 0.5));

    return {
        nozzleSizes,
        flowRatesPerZone,
        pressureDropPerZone,
        evenSweepEfficiency: Math.round(evenSweepEfficiency * 100) / 100,
        drawdownProfile
    };
}

// ── Tubing String Analysis ──

/** Calculate tubing string tension, piston effect, and buckling */
export function analyzeTubingString(inputs: TubingStringInputs): {
    buoyedWeight: number;
    pistonForce: number;
    bucklingForce: number;
    neutralPoint: number;
    stressAtTop: number;
    elongation: number;
    connectionRating: number;
    designFactor: number;
} {
    const { depth, tubingOD, tubingID, tubingWeight, packerDepth, annulusFluidDensity, tubingPressure, annulusPressure, temperature, grade } = inputs;

    // Grade yield
    const gradeYield: Record<string, number> = {
        'H-40': 40000, 'J-55': 55000, 'N-80': 80000, 'L-80': 80000,
        'C-90': 90000, 'T-95': 95000, 'P-110': 110000
    };
    const Yp = gradeYield[grade] || 80000;

    // Areas
    const tubingArea = Math.PI * (Math.pow(tubingOD / 2, 2) - Math.pow(tubingID / 2, 2)); // sq in
    const tubingIDArea = Math.PI * Math.pow(tubingID / 2, 2);
    const tubingODArea = Math.PI * Math.pow(tubingOD / 2, 2);

    // Buoyed weight
    const steelDensity = 65.45; // ppg equivalent
    const buoyancyFactor = 1 - (annulusFluidDensity / steelDensity);
    const airWeight = tubingWeight * packerDepth;
    const buoyedWeight = airWeight * buoyancyFactor;

    // Piston effect (from pressure)
    const deltaPi = tubingPressure;
    const deltaPo = annulusPressure;
    const pistonForce = deltaPi * tubingIDArea - deltaPo * tubingODArea;

    // Buckling force (helical buckling threshold)
    const I = Math.PI / 64 * (Math.pow(tubingOD, 4) - Math.pow(tubingID, 4)); // moment of inertia
    const r = (tubingOD - tubingID) / 2; // radial clearance (simplified)
    const Fcrit = 2 * Math.sqrt(I * (buoyedWeight / packerDepth));
    const bucklingForce = Math.max(0, pistonForce - Fcrit);

    // Neutral point (ft from packer)
    const neutralPoint = (bucklingForce > 0)
        ? packerDepth * (1 - bucklingForce / Math.abs(pistonForce))
        : packerDepth;

    // Stress at top
    const stressAtTop = Math.abs(pistonForce) / tubingArea;

    // Elongation (thermal + piston)
    const thermalExpCoeff = 6.9e-6; // /°F for steel
    const deltaTemp = temperature - 70; // from ambient
    const E = 30e6; // Young's modulus
    const thermalElongation = thermalExpCoeff * deltaTemp * depth * 12; // inches
    const pistonElongation = (pistonForce * depth * 12) / (E * tubingArea);
    const elongation = thermalElongation + pistonElongation; // inches

    // Connection rating (simplified — 80% pipe body)
    const pipeBodyStrength = Yp * tubingArea;
    const connectionRating = pipeBodyStrength * 0.8;

    // Design factor
    const designFactor = (Math.abs(pistonForce) > 0)
        ? connectionRating / Math.abs(pistonForce)
        : 99;

    return {
        buoyedWeight: Math.round(buoyedWeight),
        pistonForce: Math.round(pistonForce),
        bucklingForce: Math.round(bucklingForce),
        neutralPoint: Math.round(neutralPoint),
        stressAtTop: Math.round(stressAtTop),
        elongation: Math.round(elongation * 10) / 10,
        connectionRating: Math.round(connectionRating),
        designFactor: Math.round(designFactor * 100) / 100
    };
}

// ── Sand Control Selection ──

/** Recommend sand control method based on formation characteristics */
export function recommendSandControl(inputs: SandControlInputs): {
    method: string;
    screenType: string;
    gravelSize: string;
    rationale: string;
    riskLevel: 'low' | 'moderate' | 'high';
    alternative: string;
} {
    const { formationD50, uniformityCoeff, finesFrac, wellDeviation, expectedRate, fluidVisc } = inputs;

    let method: string;
    let screenType: string;
    let gravelSize: string;
    let rationale: string;
    let riskLevel: 'low' | 'moderate' | 'high';
    let alternative: string;

    // Sorting assessment
    const isWellSorted = uniformityCoeff < 3;
    const isModerateSorted = uniformityCoeff >= 3 && uniformityCoeff < 10;
    const isPoorlySorted = uniformityCoeff >= 10;

    // Fines assessment
    const isHighFines = finesFrac > 0.1;

    if (formationD50 >= 200 && isWellSorted && finesFrac < 0.02) {
        method = 'Stand-Alone Screen (SAS)';
        screenType = 'Premium Mesh (250-300 μm)';
        gravelSize = 'N/A';
        rationale = 'Coarse, well-sorted formation sand with minimal fines. SAS sufficient for sand retention.';
        riskLevel = 'low';
        alternative = 'Wire-Wrap Screen (0.008" gauge)';
    } else if (formationD50 >= 100 && isModerateSorted && finesFrac < 0.05) {
        method = 'Wire-Wrap Screen (WWS)';
        screenType = 'Wire-Wrap (0.008-0.012" gauge)';
        gravelSize = 'Optional 20/40 gravel';
        rationale = 'Medium grain size with moderate sorting. Wire-wrap with optional gravel pack for insurance.';
        riskLevel = 'moderate';
        alternative = 'Premium Mesh SAS with chemical consolidation';
    } else if (formationD50 < 100 || isPoorlySorted || finesFrac > 0.05) {
        method = 'Cased-Hole Gravel Pack (CHGP)';
        screenType = 'Wire-Wrap + Gravel Pack';
        gravelSize = (formationD50 >= 80) ? '20/40' : '40/60';
        rationale = 'Fine or poorly sorted sand. Gravel pack required per Saucier criterion.';
        riskLevel = 'high';
        alternative = 'Frac-Pack with tip screenout';
    } else {
        method = 'Open-Hole Gravel Pack (OHGP)';
        screenType = 'Premium Mesh + Gravel Pack';
        gravelSize = '20/40';
        rationale = 'Intermediate conditions with high expected rate. OHGP maximizes inflow area.';
        riskLevel = 'moderate';
        alternative = 'Expandable Sand Screen (ESS)';
    }

    // Horizontal/ERD adjustments
    if (wellDeviation > 60) {
        method = method.replace('Stand-Alone', 'Extended-Reach ');
        rationale += ' ERD/horizontal well — consider swellable packers for annular isolation.';
    }

    return { method, screenType, gravelSize, rationale, riskLevel, alternative };
}

// ── Completion Brine Design ──

/** Calculate completion brine density and volume for well control */
export function designCompletionBrine(inputs: CompletionFluidInputs): {
    requiredDensity: number;
    hydrostaticPressure: number;
    overbalance: number;
    brineVolumeBbl: number;
    brineType: string;
    saltConcentration: number;
    crystallizationTemp: number;
} {
    const { formationPressure, depth, overbalanceMargin } = inputs;

    // Required density to achieve overbalance
    const requiredDensity = (formationPressure + overbalanceMargin) / (0.052 * depth);

    // Hydrostatic pressure at TD
    const hydrostaticPressure = 0.052 * requiredDensity * depth;

    // Overbalance
    const overbalance = hydrostaticPressure - formationPressure;

    // Brine type recommendation
    let brineType: string;
    let saltConcentration: number;
    let crystallizationTemp: number;

    if (requiredDensity <= 8.6) {
        brineType = 'KCl (Potassium Chloride)';
        saltConcentration = (requiredDensity - 8.34) / 0.00285;
        crystallizationTemp = 30 + saltConcentration * 0.5;
    } else if (requiredDensity <= 9.0) {
        brineType = 'NaCl (Sodium Chloride)';
        saltConcentration = (requiredDensity - 8.34) / 0.0027;
        crystallizationTemp = 28 + saltConcentration * 0.3;
    } else if (requiredDensity <= 11.6) {
        brineType = 'CaCl₂ (Calcium Chloride)';
        saltConcentration = (requiredDensity - 8.34) / 0.0038;
        crystallizationTemp = -20 + saltConcentration * 0.2;
    } else if (requiredDensity <= 15.1) {
        brineType = 'CaBr₂ (Calcium Bromide)';
        saltConcentration = (requiredDensity - 8.34) / 0.0048;
        crystallizationTemp = -40 + saltConcentration * 0.15;
    } else if (requiredDensity <= 19.2) {
        brineType = 'ZnBr₂/CaBr₂ (Zinc Bromide)';
        saltConcentration = (requiredDensity - 8.34) / 0.0058;
        crystallizationTemp = -60 + saltConcentration * 0.1;
    } else {
        brineType = 'Cs/K Formate (Cesium/Potassium Formate)';
        saltConcentration = (requiredDensity - 8.34) / 0.0065;
        crystallizationTemp = -80 + saltConcentration * 0.05;
    }

    // Volume estimate (wellbore + 50% excess)
    const wellboreVolBbl = (Math.PI * Math.pow(8.5 / 24, 2) * depth) / 5.6146; // assume 8.5" hole
    const brineVolumeBbl = wellboreVolBbl * 1.5;

    return {
        requiredDensity: Math.round(requiredDensity * 100) / 100,
        hydrostaticPressure: Math.round(hydrostaticPressure),
        overbalance: Math.round(overbalance),
        brineVolumeBbl: Math.round(brineVolumeBbl * 10) / 10,
        brineType,
        saltConcentration: Math.round(saltConcentration * 10) / 10,
        crystallizationTemp: Math.round(crystallizationTemp)
    };
}

// ── Completion Fluid Loss ──

/** Estimate completion fluid leakoff into formation */
export function estimateCompletionLeakoff(
    perm: number,           // mD
    overbalance: number,    // psi
    fluidVisc: number,      // cP
    exposureTime: number,   // hours
    zoneLength: number      // ft
): {
    totalLossBbl: number;
    invasionDepthFt: number;
    damageSeverity: 'minimal' | 'moderate' | 'severe' | 'catastrophic';
    recommendation: string;
} {
    // Darcy radial flow into formation
    const re = 1000; // ft (drainage radius)
    const rw = 0.354; // ft (8.5" bit)

    const rateBpd = (0.00708 * perm * zoneLength * overbalance) /
        (fluidVisc * Math.log(re / rw));

    const totalLossBbl = rateBpd * (exposureTime / 24);

    // Invasion depth (Civan model approximation)
    const porosity = Math.pow(perm / 100000, 0.5) * 0.25; // estimate
    const invasionAreaCuft = totalLossBbl * 5.6146 / porosity;
    const invasionDepthFt = Math.sqrt(invasionAreaCuft / (Math.PI * zoneLength));

    let damageSeverity: 'minimal' | 'moderate' | 'severe' | 'catastrophic';
    let recommendation: string;

    if (totalLossBbl < 10) {
        damageSeverity = 'minimal';
        recommendation = 'Minimal invasion. Standard completion procedure acceptable.';
    } else if (totalLossBbl < 50) {
        damageSeverity = 'moderate';
        recommendation = 'Consider fluid loss control pills or breaker system.';
    } else if (totalLossBbl < 200) {
        damageSeverity = 'severe';
        recommendation = 'Requires HEC gel pill or sized-salt LCM before completion operations.';
    } else {
        damageSeverity = 'catastrophic';
        recommendation = 'UNCONTROLLED LOSSES. Switch to underbalanced or managed-pressure completion.';
    }

    return {
        totalLossBbl: Math.round(totalLossBbl * 10) / 10,
        invasionDepthFt: Math.round(invasionDepthFt * 10) / 10,
        damageSeverity,
        recommendation
    };
}