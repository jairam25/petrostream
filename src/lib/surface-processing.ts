/**
 * @license Apache-2.0
 * Phase 4: Production & Surface Processing — Industrial-Grade Calculation Library
 * 
 * Covers Sub-Steps 4.4–4.10:
 *   4.4  Production Manifold & Slug Catcher
 *   4.5  Primary Separation
 *   4.6  Crude Oil Treatment & Processing
 *   4.7  Gas Processing & Treatment
 *   4.8  Produced Water Management
 *   4.9  Utilities & Power Systems
 *   4.10 Facility Safety & Control Systems
 */

// ============================================================
// 4.4 — PRODUCTION MANIFOLD & SLUG CATCHER
// ============================================================

export interface ManifoldParams {
    wellCount: number;           // number of wells flowing into manifold
    totalOilRate: number;        // total oil rate, STB/D
    totalGasRate: number;        // total gas rate, MMscf/D
    totalWaterRate: number;      // total water rate, BWPD
    headerPressure: number;      // manifold header pressure, psig
    temperature: number;         // °F
    pipeDiameter: number;        // header pipe ID, inches
    pipeLength: number;          // trunk line length, ft
}

export interface SlugCatcherDesign {
    vesselType: 'finger' | 'pipe' | 'vessel';
    requiredVolume: number;      // bbl
    fingerCount: number;
    fingerDiameter: number;      // inches
    fingerLength: number;        // ft
    liquidSurgeVolume: number;   // bbl — estimated max slug
    gasCapacity: number;         // MMscf/D throughput
    slugFrequency: number;       // slugs per day
    liquidDrainRate: number;     // bbl/hr to downstream
}

/** Estimate slug catcher volume required (Baker Multiphase regime-based) */
export function designSlugCatcher(params: ManifoldParams & {
    slugFactor: number;          // 1.2–3.0 depending on terrain and flow regime
    piggingVolume: number;       // bbl from pigging operation
    rampUpSlugFraction: number;  // fraction of line fill as slug
}): SlugCatcherDesign {
    const { totalOilRate, totalWaterRate, pipeDiameter, pipeLength, slugFactor, piggingVolume, rampUpSlugFraction } = params;

    const totalLiquid = totalOilRate + totalWaterRate; // BFPD
    const liquidRateBblPerHr = totalLiquid / 24;

    // Line fill volume
    const lineVolBbl = (Math.pow(pipeDiameter, 2) / 1029.4) * pipeLength;

    // Hydrodynamic slug: typically 1.5–3× line fill
    const hydrodynamicSlug = lineVolBbl * slugFactor * rampUpSlugFraction;

    // Ramp-up slug: can be 3–10× normal slug
    const rampUpSlug = lineVolBbl * rampUpSlugFraction * 3;

    // Pigging slug: entire line fill pushed as slug
    const piggingSlug = piggingVolume > 0 ? piggingVolume : lineVolBbl * 1.5;

    const maxSlug = Math.max(hydrodynamicSlug, rampUpSlug, piggingSlug);

    // Design volume = max slug × safety factor 1.3
    const requiredVolume = maxSlug * 1.3;

    // Finger type sizing
    const fingerDiameter = Math.max(36, Math.min(60, Math.ceil(20 + requiredVolume / 50)));
    const fingerCount = Math.max(3, Math.ceil(requiredVolume / 200));
    const fingerLength = Math.ceil((requiredVolume * 5.615) / (fingerCount * Math.PI * Math.pow(fingerDiameter / 24, 2)));

    return {
        vesselType: params.wellCount > 10 ? 'pipe' : 'finger',
        requiredVolume: Math.round(requiredVolume * 100) / 100,
        fingerCount,
        fingerDiameter,
        fingerLength,
        liquidSurgeVolume: Math.round(maxSlug * 100) / 100,
        gasCapacity: params.totalGasRate * 1.15,
        slugFrequency: Math.round(totalLiquid / (lineVolBbl * 0.3)),
        liquidDrainRate: Math.round(liquidRateBblPerHr * 100) / 100,
    };
}

// ============================================================
// 4.5 — PRIMARY SEPARATION (Gravity, 2-Phase, 3-Phase)
// ============================================================

export interface SeparatorFeed {
    oilRate: number;         // STB/D
    gasRate: number;         // MMscf/D
    waterRate: number;       // BWPD
    oilDensity: number;      // °API
    gasSG: number;           // specific gravity (air = 1)
    waterSG: number;         // specific gravity (pure water = 1)
    temperature: number;     // °F
    operatingPressure: number; // psig
    zFactor: number;         // gas compressibility factor
    oilViscosity: number;    // cP at operating temperature
    waterDropletSize: number; // microns (oil-water separation target)
}

export interface SeparatorDesign {
    type: 'horizontal' | 'vertical';
    phases: 2 | 3;
    diameter: number;        // inches
    seamToSeamLength: number; // ft
    gasRetentionTime: number; // seconds
    liquidRetentionTime: number; // minutes
    oilPadHeight: number;    // inches (3-phase)
    waterPadHeight: number;  // inches (3-phase)
    gasCapacity: number;     // MMscf/D
    liquidCapacity: number;  // BFPD
    vesselVolume: number;    // bbl
    wallThickness: number;   // inches (ASME VIII)
    vesselWeight: number;    // tons
    nozzleSizes: {
        inlet: number;         // inches
        gasOutlet: number;
        oilOutlet: number;
        waterOutlet: number;
    };
    gasVelocity: number;     // ft/s
    criticalVelocity: number; // ft/s (Souders-Brown)
    oilInWaterOut: number;   // ppm expected
    waterInOilOut: number;   // % BS&W expected
}

/**
 * Souders-Brown critical gas velocity
 * v_crit = K × √((ρL − ρG) / ρG)
 * K = empirical factor (0.15–0.35 for vertical, 0.4–0.5 for horizontal with mist extractor)
 */
export function soudersBrownVelocity(
    liquidDensity: number,  // lb/ft³
    gasDensity: number,     // lb/ft³
    kFactor: number = 0.45  // horizontal with demister
): number {
    if (gasDensity <= 0) return 99;
    return kFactor * Math.sqrt((liquidDensity - gasDensity) / gasDensity);
}

/** Stokes' Law settling velocity (ft/s) */
export function stokesSettlingVelocity(
    dropletDiaMicrons: number,
    oilDensity: number,      // lb/ft³
    waterDensity: number,    // lb/ft³
    oilViscosity: number     // cP
): number {
    const diaFt = dropletDiaMicrons / 304800; // microns → ft
    const deltaRho = waterDensity - oilDensity; // positive if water heavier
    if (deltaRho <= 0 || oilViscosity <= 0) return 0;
    // v = (Δρ × g × d²) / (18 × μ)
    // μ in cP → lb/(ft·s): 1 cP = 0.000672 lb/(ft·s)
    const muLbFtS = oilViscosity * 0.000672;
    return (deltaRho * 32.174 * Math.pow(diaFt, 2)) / (18 * muLbFtS);
}

/** Convert °API to lb/ft³ density */
export function apiToDensity(api: number): number {
    const sg = 141.5 / (api + 131.5);
    return sg * 62.4;
}

/** Gas density at operating conditions (lb/ft³) */
export function gasDensityAtConditions(pressurePsia: number, tempF: number, sg: number, z: number): number {
    const tempR = tempF + 459.67;
    // ρ = (P × MW) / (z × R × T), MW_air = 28.97, R = 10.73 psi·ft³/(lbmol·°R)
    const mwGas = sg * 28.97;
    return (pressurePsia * mwGas) / (z * 10.73 * tempR);
}

/** Complete 3-phase horizontal separator design */
export function designHorizontalSeparator(params: SeparatorFeed & {
    kFactor?: number;
    retentionTimeMinutes?: number;
    lD?: number;             // length/diameter ratio (3–5 typical)
    maxDiameter?: number;    // inches (shop fab limit ~192")
    designPressurePsig?: number;
    corrosionAllowanceIn?: number;
    materialYieldStrength?: number; // psi (SA-516-70 default 70,000)
}): SeparatorDesign {
    const {
        oilRate, gasRate, waterRate, oilDensity: api, gasSG, waterSG,
        temperature, operatingPressure, zFactor, oilViscosity, waterDropletSize,
        kFactor = 0.45, retentionTimeMinutes = 5, lD = 4,
        maxDiameter = 192, designPressurePsig = 0, corrosionAllowanceIn = 0.125,
        materialYieldStrength = 70000
    } = params;

    const oilDens = apiToDensity(api);
    const waterDens = waterSG * 62.4;
    const pressPsia = operatingPressure + 14.7;
    const gasDens = gasDensityAtConditions(pressPsia, temperature, gasSG, zFactor);

    const totalLiquid = oilRate + waterRate; // BFPD
    const waterCut = totalLiquid > 0 ? waterRate / totalLiquid : 0;

    // Gas capacity sizing (Souders-Brown)
    const vCrit = soudersBrownVelocity(oilDens, gasDens, kFactor);
    const gasFlowActual = (gasRate * 1e6) / (24 * 3600 * (pressPsia / 14.7) * (520 / (temperature + 459.67)));
    const minGasArea = gasFlowActual / (vCrit * 0.5); // 50% of critical for margin
    const minGasDia = Math.ceil(Math.sqrt((4 * minGasArea) / Math.PI));

    // Liquid capacity sizing (retention time)
    const liquidVolRequired = (totalLiquid * retentionTimeMinutes) / (24 * 60); // bbl
    const liquidVolRequiredFt3 = liquidVolRequired * 5.615;

    // Oil pad height for water settling (Stokes' Law)
    const vSettle = stokesSettlingVelocity(waterDropletSize, oilDens, waterDens, oilViscosity);
    const timeAvailable = retentionTimeMinutes * 60; // seconds
    const maxOilPadHeight = vSettle * timeAvailable * 12; // inches

    // Iterate to find diameter matching both gas and liquid requirements
    let diameter = Math.max(minGasDia, 24);
    let length = diameter * lD;

    for (let iter = 0; iter < 50; iter++) {
        const r = diameter / 24; // ft radius
        const gasFillFraction = 0.3; // 30% gas space
        const liquidFillFraction = 0.7;

        const vesselVol = Math.PI * Math.pow(r, 2) * (length * 12 / 12); // ft³
        const liquidVolAvailable = vesselVol * liquidFillFraction * 0.85; // 85% of liquid space usable

        if (liquidVolAvailable * (1 / 5.615) >= liquidVolRequired * 1.1) break;

        diameter += 6;
        length = diameter * lD;
        if (diameter > maxDiameter) { diameter = maxDiameter; length = diameter * lD; break; }
    }

    const finalDia = Math.min(diameter, maxDiameter);
    const finalLength = Math.ceil(finalDia * lD / 12);
    const r = finalDia / 24;
    const vesselVol = Math.PI * Math.pow(r, 2) * (finalLength);
    const vesselVolBbl = vesselVol * (1 / 5.615);

    // Wall thickness (ASME VIII Div 1 simplified)
    const designPress = designPressurePsig > 0 ? designPressurePsig : operatingPressure * 1.25 + 10;
    const allowableStress = materialYieldStrength * 0.25; // 1/4 yield for ASME
    const jointEfficiency = 1.0;
    const tWall = (designPress * finalDia) / (2 * allowableStress * jointEfficiency - 1.2 * designPress) + corrosionAllowanceIn;

    // Nozzle sizing
    const gasVelPipe = vCrit * 0.3; // conservative
    const gasNozzleArea = gasFlowActual / gasVelPipe;
    const gasNozzle = Math.ceil(Math.sqrt((4 * gasNozzleArea) / Math.PI));
    const liquidVelPipe = 3; // ft/s for liquids
    const totalLiquidFt3 = totalLiquid * 5.615 / 86400;
    const liqNozzleArea = totalLiquidFt3 / liquidVelPipe;
    const liqNozzle = Math.ceil(Math.sqrt((4 * liqNozzleArea) / Math.PI));

    // Calculate actual gas velocity
    const actualGasVel = gasFlowActual / (Math.PI * Math.pow(r, 2) * 0.3);

    // Oil-in-water estimate (empirical based on retention time)
    const oilInWater = Math.max(5, Math.round(200 * Math.exp(-0.5 * retentionTimeMinutes / 5)));

    return {
        type: 'horizontal',
        phases: 3,
        diameter: Math.round(finalDia),
        seamToSeamLength: Math.round(finalLength),
        gasRetentionTime: Math.round((vesselVol * 0.3) / (gasFlowActual) * 10) / 10,
        liquidRetentionTime: retentionTimeMinutes,
        oilPadHeight: Math.round(Math.min(maxOilPadHeight, finalDia * 0.4)),
        waterPadHeight: Math.round(finalDia * 0.3),
        gasCapacity: gasRate,
        liquidCapacity: totalLiquid,
        vesselVolume: Math.round(vesselVolBbl * 10) / 10,
        wallThickness: Math.round(tWall * 1000) / 1000,
        vesselWeight: Math.round(vesselVolBbl * tWall * 0.15 * 10) / 10,
        nozzleSizes: {
            inlet: Math.max(4, Math.ceil(liqNozzle * 1.2)),
            gasOutlet: Math.max(3, Math.ceil(gasNozzle * 1.1)),
            oilOutlet: Math.max(2, Math.ceil(liqNozzle * 0.4)),
            waterOutlet: Math.max(2, Math.ceil(liqNozzle * 0.4)),
        },
        gasVelocity: Math.round(actualGasVel * 100) / 100,
        criticalVelocity: Math.round(vCrit * 100) / 100,
        oilInWaterOut: oilInWater,
        waterInOilOut: Math.round(Math.max(0.05, 1 - 0.9 * Math.exp(-retentionTimeMinutes / 3)) * 1000) / 1000,
    };
}

/** Multi-stage separation optimization (2-4 stages) */
export function optimizeMultiStageSeparation(
    feed: SeparatorFeed,
    stageCount: number = 3
): {
    stages: { pressure: number; gasMMscfd: number; oilSTBD: number; gor: number; api: number }[];
    totalShrinkage: number;
    stockTankOil: number;
    totalGas: number;
} {
    const { oilRate, gasRate: totalGasRate, operatingPressure: hpPressure } = feed;
    const stages: { pressure: number; gasMMscfd: number; oilSTBD: number; gor: number; api: number }[] = [];

    // Stage pressures: HP → IP → LP → Stock Tank
    const stagePressures = stageCount >= 3
        ? [hpPressure, Math.round(hpPressure * 0.25), Math.round(hpPressure * 0.05)]
        : stageCount === 2
            ? [hpPressure, Math.round(hpPressure * 0.1)]
            : [hpPressure];

    let remainingOil = oilRate;
    let cumGas = 0;
    const baseSolutionGOR = totalGasRate > 0 ? totalGasRate / oilRate * 1000 : 500;

    for (let i = 0; i < stageCount; i++) {
        const pressureRatio = stagePressures[i] / hpPressure;
        // Flash gas: more gas liberated at lower pressure
        const gasLiberated = baseSolutionGOR * pressureRatio * (i === 0 ? 0.3 : i === 1 ? 0.4 : 0.3);
        const gasMmscf = (remainingOil * gasLiberated) / 1000;
        cumGas += gasMmscf;
        stages.push({
            pressure: stagePressures[i],
            gasMMscfd: Math.round(gasMmscf * 100) / 100,
            oilSTBD: Math.round(remainingOil),
            gor: Math.round(gasLiberated),
            api: Math.round((feed.oilDensity + i * 0.5) * 10) / 10,
        });
    }

    const stockTankOil = Math.round(remainingOil * 0.92);
    const totalShrinkage = Math.round((1 - stockTankOil / oilRate) * 10000) / 100;

    return {
        stages,
        totalShrinkage,
        stockTankOil,
        totalGas: Math.round(cumGas * 100) / 100,
    };
}

// ============================================================
// 4.6 — CRUDE OIL TREATMENT & PROCESSING
// ============================================================

export interface HeaterTreaterDesign {
    heatDuty: number;          // MMBtu/hr
    fireTubeArea: number;      // ft²
    vesselDiameter: number;    // inches
    vesselLength: number;      // ft
    fuelGasRate: number;       // Mscf/D
    outletTemperature: number; // °F
    oilRetentionTime: number;  // minutes
    bsAndWOutlet: number;      // % expected
}

export interface ElectrostaticDesalterDesign {
    gridVoltage: number;       // volts
    gridType: 'AC' | 'AC/DC' | 'composite';
    vesselDiameter: number;    // inches
    vesselLength: number;      // ft
    powerConsumption: number;  // kW
    washWaterRate: number;     // BWPD (5-10% of crude)
    mixingDP: number;          // psi
    saltInlet: number;         // PTB (pounds per thousand barrels)
    saltOutlet: number;        // PTB
    stages: number;
}

export interface StabilizerDesign {
    columnDiameter: number;    // inches
    columnHeight: number;      // ft
    trays: number;
    reboilerDuty: number;      // MMBtu/hr
    overheadRate: number;      // MMscf/D (C1-C4)
    bottomRate: number;        // STB/D (stabilized)
    rvpInlet: number;          // psi
    rvpOutlet: number;         // psi
    operatingPressure: number; // psig
}

/** Design heater treater for crude dehydration */
export function designHeaterTreater(params: {
    oilRate: number;           // STB/D
    waterRate: number;         // BWPD
    inletTemp: number;         // °F
    targetTemp: number;        // °F
    apiGravity: number;
    emulsionStability: 'loose' | 'medium' | 'tight';
}): HeaterTreaterDesign {
    const { oilRate, waterRate, inletTemp, targetTemp, apiGravity, emulsionStability } = params;
    const totalLiquid = oilRate + waterRate;
    const waterCut = totalLiquid > 0 ? waterRate / totalLiquid : 0;

    // Heat duty: Q = m × Cp × ΔT
    const liquidMassLbHr = totalLiquid / 24 * (apiToDensity(apiGravity) + 62.4 * waterCut) / 2 * 5.615;
    const cpOil = 0.45 + 0.0004 * apiGravity; // Btu/(lb·°F)
    const cpWater = 1.0;
    const cpMixture = cpOil * (1 - waterCut) + cpWater * waterCut;
    const deltaT = targetTemp - inletTemp;
    const heatDuty = (liquidMassLbHr * cpMixture * deltaT) / 1e6; // MMBtu/hr

    // Fire tube sizing (typical flux: 8,000-12,000 Btu/hr·ft²)
    const fluxRate = 10000;
    const fireTubeArea = (heatDuty * 1e6) / fluxRate;

    // Fuel gas (assuming 1000 BTU/scf, 75% efficiency)
    const fuelGas = (heatDuty * 1e6) / (900 * 0.75) / 1000; // Mscf/D

    // Retention time based on emulsion stability
    const retentionTime = emulsionStability === 'loose' ? 10 : emulsionStability === 'medium' ? 20 : 40;

    // BS&W estimate
    const bsAndW = emulsionStability === 'loose' ? 0.5 : emulsionStability === 'medium' ? 0.8 : 1.5;

    // Vessel sizing
    const liquidVol = (totalLiquid * retentionTime) / (24 * 60); // bbl
    const diameter = Math.ceil(36 + liquidVol / 5);
    const length = Math.ceil((liquidVol * 5.615) / (Math.PI * Math.pow(diameter / 24, 2) * 0.7));

    return {
        heatDuty: Math.round(heatDuty * 100) / 100,
        fireTubeArea: Math.round(fireTubeArea),
        vesselDiameter: Math.round(Math.min(diameter, 192)),
        vesselLength: Math.round(length),
        fuelGasRate: Math.round(fuelGas),
        outletTemperature: targetTemp,
        oilRetentionTime: retentionTime,
        bsAndWOutlet: Math.round(bsAndW * 1000) / 1000,
    };
}

/** Design electrostatic desalter */
export function designDesalter(params: {
    oilRate: number;           // STB/D
    saltInlet: number;         // PTB
    targetSalt: number;        // PTB (typically <10-60 PTB)
    operatingTemp: number;     // °F
    gridType?: 'AC' | 'AC/DC' | 'composite';
}): ElectrostaticDesalterDesign {
    const { oilRate, saltInlet, targetSalt, operatingTemp, gridType = 'composite' } = params;
    const washWaterFraction = 0.07; // 7% wash water
    const washWaterRate = Math.round(oilRate * washWaterFraction);

    // Dilution: saltAfterWash = saltInlet × (remainingWater / (remainingWater + washWater))
    const initialWaterFraction = 0.005; // 0.5% water in oil
    const initialWaterVol = oilRate * initialWaterFraction;
    const mixingDP = 15; // psi — controlled pressure drop for emulsion

    // Salt removal efficiency (per stage, typically 90-95% per stage)
    const stageEff = 0.92;
    let saltRemaining = saltInlet;
    let stages = 1;
    for (let s = 0; s < 3; s++) {
        // Dilution factor
        const dilutionFactor = initialWaterVol / (initialWaterVol + washWaterRate);
        saltRemaining = saltRemaining * dilutionFactor * (1 - stageEff);
        stages = s + 1;
        if (saltRemaining <= targetSalt) break;
    }

    // Vessel sizing
    const retentionTime = 30; // minutes at operating temp
    const liquidVol = (oilRate * retentionTime) / (24 * 60);
    const diameter = Math.ceil(48 + liquidVol / 8);
    const length = Math.ceil((liquidVol * 5.615) / (Math.PI * Math.pow(diameter / 24, 2) * 0.7));

    // Power: ~0.05-0.15 kW per BPD
    const power = oilRate * 0.08; // kW

    return {
        gridVoltage: gridType === 'AC' ? 15000 : gridType === 'AC/DC' ? 25000 : 33000,
        gridType,
        vesselDiameter: Math.round(Math.min(diameter, 180)),
        vesselLength: Math.round(length),
        powerConsumption: Math.round(power),
        washWaterRate,
        mixingDP,
        saltInlet,
        saltOutlet: Math.round(saltRemaining),
        stages,
    };
}

/** Design crude stabilizer column */
export function designCrudeStabilizer(params: {
    oilRate: number;           // STB/D
    rvpInlet: number;          // psi
    rvpTarget: number;         // psi (typically <10-12 psi for pipeline)
    apiGravity: number;
    temperature: number;       // °F (column feed)
}): StabilizerDesign {
    const { oilRate, rvpInlet, rvpTarget, apiGravity } = params;

    // Column operating pressure: just enough to keep overheads condensable
    const opPressure = Math.max(50, rvpTarget * 3);

    // Number of trays (heuristic based on RVP reduction)
    const rvpRatio = rvpInlet / rvpTarget;
    const trays = Math.ceil(6 + rvpRatio * 2);

    // Column diameter (based on vapor loading)
    const vaporLoad = oilRate * rvpRatio * 0.015; // approximate vapor rate Mscf/D
    const vaporActual = vaporLoad * 1000 / (24 * 3600) * (14.7 / (opPressure + 14.7)) * ((460 + 200) / 520);
    const allowableVaporVel = 2.0; // ft/s for packed/trayed
    const columnArea = vaporActual / allowableVaporVel;
    const columnDiameter = Math.ceil(Math.sqrt(4 * columnArea / Math.PI) * 12);

    // Column height
    const traySpacing = 24; // inches
    const columnHeight = trays * traySpacing / 12 + 6; // +6 ft for top/bottom

    // Reboiler duty
    const liquidMass = oilRate / 24 * apiToDensity(apiGravity) * 5.615; // lb/hr
    const cp = 0.5;
    const reboilerDuty = (liquidMass * cp * 80) / 1e6; // ~80°F temp rise in reboiler

    // Overhead: light ends C1-C4
    const overheadRate = Math.round(oilRate * (rvpInlet - rvpTarget) / rvpInlet * 0.08 * 100) / 100;

    return {
        columnDiameter: Math.round(Math.max(12, columnDiameter)),
        columnHeight: Math.round(columnHeight),
        trays,
        reboilerDuty: Math.round(reboilerDuty * 100) / 100,
        overheadRate: Math.round(overheadRate * 100) / 100,
        bottomRate: oilRate - overheadRate,
        rvpInlet,
        rvpOutlet: rvpTarget,
        operatingPressure: Math.round(opPressure),
    };
}

// ============================================================
// 4.7 — GAS PROCESSING & TREATMENT
// ============================================================

export interface CompressorStage {
    stageNumber: number;
    suctionPressure: number;   // psia
    dischargePressure: number; // psia
    ratio: number;
    dischargeTemp: number;     // °F
    gasHP: number;             // HP
    intercoolerDuty: number;   // MMBtu/hr
}

export interface CompressionDesign {
    totalStages: number;
    totalPower: number;        // HP
    totalCoolingDuty: number;  // MMBtu/hr
    stages: CompressorStage[];
    driverType: string;
    fuelGasRate: number;       // Mscf/D (if gas turbine)
    antiSurgeRecycleFraction: number;
}

export interface AmineTreaterDesign {
    amineType: 'MEA' | 'DEA' | 'MDEA' | 'formulatedMDEA';
    circulationRate: number;   // gpm
    leanLoading: number;       // mol acid gas / mol amine
    richLoading: number;
    absorberDiameter: number;  // inches
    absorberHeight: number;    // ft
    trays: number;
    reboilerDuty: number;      // MMBtu/hr
    amineLosses: number;       // lb/day
    h2sOutlet: number;         // ppm
    co2Outlet: number;         // mol%
}

export interface GlycolDehydratorDesign {
    glycolType: 'TEG' | 'DEG';
    circulationRate: number;   // gpm
    glycolPurity: number;      // wt% (99.0-99.5 for TEG)
    contactorDiameter: number; // inches
    contactorHeight: number;   // ft
    trays: number;
    reboilerDuty: number;      // MMBtu/hr
    strippingGasRate: number;  // scf/gal TEG
    waterDewPoint: number;     // °F at pipeline pressure
    waterContentOutlet: number;// lb/MMscf
    btexEmissions: number;     // tons/year
}

export interface NGLRecoveryDesign {
    method: 'refrigeration' | 'JT' | 'cryogenic' | 'leanOil';
    ethaneRecovery: number;    // %
    propaneRecovery: number;   // %
    residueGasRate: number;    // MMscf/D
    nglProduction: {
        ethane: number;          // BPD
        propane: number;         // BPD
        butane: number;          // BPD
        naturalGasoline: number; // BPD (C5+)
    };
    compressionHP: number;
    refrigerationHP: number;
}

export interface SulfurRecoveryDesign {
    clausStages: 2 | 3;
    sulfurRecovery: number;   // %
    withTGTU: boolean;
    overallRecovery: number;  // %
    sulfurProduction: number; // LT/D (long tons per day)
    reactionFurnaceTemp: number; // °F
    wasteHeatBoilerDuty: number; // MMBtu/hr
}

/** Multi-stage gas compression design */
export function designGasCompression(params: {
    suctionPressure: number;   // psig
    dischargePressure: number; // psig
    gasRate: number;           // MMscf/D
    gasSG: number;
    suctionTemp: number;       // °F
    k: number;                 // Cp/Cv ratio (1.3 for natural gas)
    maxRatioPerStage?: number; // typically 3-4
    maxDischargeTemp?: number; // °F (typically 300°F)
}): CompressionDesign {
    const { suctionPressure, dischargePressure, gasRate, gasSG, suctionTemp, k } = params;
    const maxRatioPerStage = params.maxRatioPerStage ?? 3.5;
    const maxDischargeTemp = params.maxDischargeTemp ?? 300;

    const pSuction = suctionPressure + 14.7;
    const pDischarge = dischargePressure + 14.7;
    const overallRatio = pDischarge / pSuction;

    // Number of stages
    const stagesNeeded = Math.ceil(Math.log(overallRatio) / Math.log(maxRatioPerStage));
    const ratioPerStage = Math.pow(overallRatio, 1 / stagesNeeded);
    const stages: CompressorStage[] = [];

    let currentSuction = pSuction;
    let totalPower = 0;
    let totalCooling = 0;
    const Ts = suctionTemp + 459.67; // °R

    for (let i = 0; i < stagesNeeded; i++) {
        const pDisch = currentSuction * ratioPerStage;
        const ratio = pDisch / currentSuction;

        // Polytropic head
        const n = (k - 1) / k;
        const TdRankine = Ts * Math.pow(ratio, n);
        let TdF = TdRankine - 459.67;

        // If discharge temp too high, add intercooler
        let intercoolerDuty = 0;
        if (TdF > maxDischargeTemp) {
            const cp = 0.5; // Btu/(lb·°F)
            const massFlow = gasRate * 1e6 / 24 * gasSG * 28.97 / 379.5; // lb/hr
            intercoolerDuty = massFlow * cp * (TdF - 120) / 1e6; // cool to 120°F
            totalCooling += intercoolerDuty;
            TdF = Math.max(120, maxDischargeTemp - 20);
        }

        // Gas horsepower (polytropic)
        const massFlow = gasRate * 1e6 / 24 * gasSG * 28.97 / 379.5 / 60; // lb/min
        const gasHP = (massFlow * 1545 * Ts * k * (Math.pow(ratio, n) - 1)) / (144 * (k - 1) * n * 33000 / 550);

        totalPower += gasHP;

        stages.push({
            stageNumber: i + 1,
            suctionPressure: Math.round(currentSuction - 14.7),
            dischargePressure: Math.round(pDisch - 14.7),
            ratio: Math.round(ratio * 100) / 100,
            dischargeTemp: Math.round(TdF),
            gasHP: Math.round(gasHP),
            intercoolerDuty: Math.round(intercoolerDuty * 100) / 100,
        });

        currentSuction = pDisch;
    }

    // Driver type selection
    const driverType = totalPower > 5000 ? 'Gas Turbine (Frame 5/6)' :
        totalPower > 2000 ? 'Gas Turbine (Aeroderivative)' :
            totalPower > 500 ? 'Electric Motor' : 'Gas Engine';

    // Fuel gas for turbine drivers
    const fuelGasRate = driverType.includes('Turbine')
        ? totalPower * 0.007 // ~7 scf/HP-hr for turbines
        : 0;

    return {
        totalStages: stagesNeeded,
        totalPower: Math.round(totalPower),
        totalCoolingDuty: Math.round(totalCooling * 100) / 100,
        stages,
        driverType,
        fuelGasRate: Math.round(fuelGasRate),
        antiSurgeRecycleFraction: 0.15,
    };
}

/** Amine gas sweetening design */
export function designAmineTreater(params: {
    gasRate: number;           // MMscf/D
    h2sInlet: number;          // mol% or ppm
    co2Inlet: number;          // mol%
    operatingPressure: number; // psig
    amineType: 'MEA' | 'DEA' | 'MDEA' | 'formulatedMDEA';
    targetH2S: number;         // ppm (typically 4)
    targetCO2: number;         // mol%
}): AmineTreaterDesign {
    const { gasRate, h2sInlet, co2Inlet, operatingPressure, amineType, targetH2S, targetCO2 } = params;

    // Acid gas load
    const acidGasH2S = gasRate * h2sInlet / 100 * 1e6 / 379.5 / 24; // lbmol/hr H2S
    const acidGasCO2 = gasRate * co2Inlet / 100 * 1e6 / 379.5 / 24;   // lbmol/hr CO2
    const totalAcidGas = acidGasH2S + acidGasCO2;

    // Amine capacity (mol acid gas / mol amine at rich loading)
    const richLoading = amineType === 'MDEA' ? 0.5 : amineType === 'MEA' ? 0.35 : 0.45;
    const leanLoading = amineType === 'MDEA' ? 0.02 : amineType === 'MEA' ? 0.10 : 0.05;
    const netLoading = richLoading - leanLoading;

    // Amine concentration (wt%)
    const conc = amineType === 'MEA' ? 0.20 : amineType === 'MDEA' ? 0.50 : 0.35;
    const amineMW = amineType === 'MEA' ? 61 : amineType === 'MDEA' ? 119 : 105;
    const amineDensity = 8.5 + conc * 1.5; // lb/gal for amine solution

    // Circulation rate (gpm)
    const lbMolAmineNeeded = totalAcidGas / netLoading;
    const lbAmineNeeded = lbMolAmineNeeded * amineMW;
    const lbSolutionNeeded = lbAmineNeeded / conc;
    const circulationRate = lbSolutionNeeded / amineDensity / 60; // gpm

    // Absorber sizing (Souders-Brown for gas contactor)
    const gasActCFS = gasRate * 1e6 / 86400 * 14.7 / (operatingPressure + 14.7) * (460 + 120) / 520;
    const gasVel = 1.5; // ft/s for amine absorber
    const absorberArea = gasActCFS / gasVel;
    const absorberDia = Math.ceil(Math.sqrt(4 * absorberArea / Math.PI) * 12);

    // Trays or packing height
    const htus = 3; // ft per theoretical stage
    const theoreticalStages = amineType === 'MDEA' ? 6 : 10;
    const trays = theoreticalStages;
    const absorberHeight = theoreticalStages * htus + 10; // +10 for top/bottom

    // Reboiler duty
    const reboilerDuty = circulationRate * amineDensity * 60 * 900 / 1e6; // ~900 BTU/lb steam

    // H2S outlet (simplified)
    const removalEff = amineType === 'MDEA' ? 0.999 : 0.995;
    const h2sOutlet = h2sInlet * (1 - removalEff);

    return {
        amineType,
        circulationRate: Math.round(circulationRate),
        leanLoading,
        richLoading,
        absorberDiameter: Math.round(Math.max(12, absorberDia)),
        absorberHeight: Math.round(absorberHeight),
        trays,
        reboilerDuty: Math.round(reboilerDuty * 100) / 100,
        amineLosses: Math.round(circulationRate * 0.5),
        h2sOutlet: Math.round(h2sOutlet),
        co2Outlet: Math.round(co2Inlet * (1 - removalEff) * 1000) / 1000,
    };
}

/** TEG glycol dehydration design */
export function designGlycolDehydrator(params: {
    gasRate: number;           // MMscf/D
    waterContentInlet: number; // lb/MMscf
    operatingPressure: number; // psig
    temperature: number;       // °F
    targetWaterContent: number; // lb/MMscf (typically 4-7)
}): GlycolDehydratorDesign {
    const { gasRate, waterContentInlet, operatingPressure, temperature, targetWaterContent } = params;

    // Water to remove
    const waterIn = gasRate * waterContentInlet; // lb/hr (not divided by 24 since waterContent is already in lb/MMscf... wait, waterContentInlet is lb per MMscf)
    // Actually: waterIn = gasRate (MMscf/D) * waterContentInlet (lb/MMscf) = lb/D, then /24 for lb/hr
    const waterRemoved = (gasRate * (waterContentInlet - targetWaterContent)) / 24; // lb/hr

    // TEG circulation rate: typically 2-3 gal TEG per lb water removed
    const circulationFactor = 3; // gal TEG / lb water
    const circulationRate = waterRemoved * circulationFactor / 60; // gpm

    // Glycol purity from reboiler (380-400°F)
    const glycolPurity = 99.2; // wt%
    const waterDewPointDepression = 70 + glycolPurity * 0.5;
    const waterDewPoint = temperature - waterDewPointDepression;

    // Contactor sizing
    const gasActCFS = gasRate * 1e6 / 86400 * 14.7 / (operatingPressure + 14.7) * (460 + temperature) / 520;
    const gasVel = 2.5; // ft/s for glycol contactor
    const contactorArea = gasActCFS / gasVel;
    const contactorDia = Math.ceil(Math.sqrt(4 * contactorArea / Math.PI) * 12);

    const trays = Math.ceil(6 + waterContentInlet / 10);
    const contactorHeight = trays * 2 + 8; // 24" tray spacing + heads

    // Reboiler duty: ~1000-1200 BTU/gal TEG
    const reboilerDuty = (circulationRate * 60 * 1100) / 1e6; // MMBtu/hr

    // Stripping gas: ~2-4 scf/gal TEG for enhanced regeneration
    const strippingGasRate = 3;

    // Water content outlet
    const waterContentOutlet = Math.max(targetWaterContent, waterContentInlet * 0.01);

    // BTEX emissions estimate
    const btexEmissions = gasRate * 0.15; // ~0.15 tons/yr per MMscf/D

    return {
        glycolType: 'TEG',
        circulationRate: Math.round(circulationRate * 100) / 100,
        glycolPurity,
        contactorDiameter: Math.round(Math.max(12, contactorDia)),
        contactorHeight: Math.round(contactorHeight),
        trays,
        reboilerDuty: Math.round(reboilerDuty * 100) / 100,
        strippingGasRate,
        waterDewPoint: Math.round(waterDewPoint),
        waterContentOutlet: Math.round(waterContentOutlet * 10) / 10,
        btexEmissions: Math.round(btexEmissions * 10) / 10,
    };
}

/** NGL Recovery design (cryogenic turboexpander) */
export function designNGLRecovery(params: {
    gasRate: number;           // MMscf/D
    c2Content: number;         // mol% ethane
    c3Content: number;         // mol% propane
    c4Content: number;         // mol% butane
    c5PlusContent: number;     // mol% C5+
    method: 'refrigeration' | 'cryogenic' | 'leanOil';
    ethaneRecoveryTarget: number; // % (90-95 for cryogenic)
}): NGLRecoveryDesign {
    const { gasRate, c2Content, c3Content, c4Content, c5PlusContent, method, ethaneRecoveryTarget } = params;

    // Recovery efficiencies
    let c2Recovery, c3Recovery, c4Recovery, c5Recovery;
    if (method === 'cryogenic') {
        c2Recovery = ethaneRecoveryTarget / 100;
        c3Recovery = 0.99;
        c4Recovery = 0.995;
        c5Recovery = 0.999;
    } else if (method === 'refrigeration') {
        c2Recovery = ethaneRecoveryTarget / 200; // Much lower ethane
        c3Recovery = 0.85;
        c4Recovery = 0.95;
        c5Recovery = 0.98;
    } else {
        c2Recovery = 0.1;
        c3Recovery = 0.7;
        c4Recovery = 0.9;
        c5Recovery = 0.95;
    }

    // Convert mol% to volume
    const gasMolPerDay = gasRate * 1e6 / 379.5; // lbmol/day
    const ethaneMol = gasMolPerDay * c2Content / 100;
    const propaneMol = gasMolPerDay * c3Content / 100;
    const butaneMol = gasMolPerDay * c4Content / 100;
    const c5PlusMol = gasMolPerDay * c5PlusContent / 100;

    // Convert recovered mol to BPD liquid
    const ethaneBpd = ethaneMol * c2Recovery * 379.5 / (5.615 * 42);
    const propaneBpd = propaneMol * c3Recovery * 379.5 / (5.615 * 42);
    const butaneBpd = butaneMol * c4Recovery * 379.5 / (5.615 * 42);
    const ngBpd = c5PlusMol * c5Recovery * 379.5 / (5.615 * 42);

    const totalNGL = ethaneBpd + propaneBpd + butaneBpd + ngBpd;
    const residueGas = gasRate - (totalNGL * 42 * 5.615 / 379.5 / 1e6);

    const compressionHP = method === 'cryogenic' ? gasRate * 35 : gasRate * 5; // residue gas recompression
    const refrigerationHP = method === 'cryogenic' ? gasRate * 15 : gasRate * 8;

    return {
        method,
        ethaneRecovery: Math.round(c2Recovery * 10000) / 100,
        propaneRecovery: Math.round(c3Recovery * 10000) / 100,
        residueGasRate: Math.round(residueGas * 100) / 100,
        nglProduction: {
            ethane: Math.round(ethaneBpd),
            propane: Math.round(propaneBpd),
            butane: Math.round(butaneBpd),
            naturalGasoline: Math.round(ngBpd),
        },
        compressionHP: Math.round(compressionHP),
        refrigerationHP: Math.round(refrigerationHP),
    };
}

/** Claus sulfur recovery unit design */
export function designSulfurRecovery(params: {
    h2sRate: number;           // lbmol/hr entering SRU
    clausStages: 2 | 3;
    withTGTU: boolean;
}): SulfurRecoveryDesign {
    const { h2sRate, clausStages, withTGTU } = params;

    // Claus reaction: 2H2S + SO2 → 3S + 2H2O
    const sulfurLbmolPerHr = h2sRate * 0.5; // stoichiometric: 1 mol S per mol H2S
    const sulfurLbPerHr = sulfurLbmolPerHr * 32.06;
    const sulfurLtPerDay = sulfurLbPerHr * 24 / 2240; // long tons

    const baseRecovery = clausStages === 2 ? 0.96 : 0.98;
    const overallRecovery = withTGTU ? 0.999 : baseRecovery;

    // Reaction furnace: 1/3 H2S burned to SO2 at ~2000-2500°F
    const reactionFurnaceTemp = 2200;

    const wasteHeatBoilerDuty = h2sRate * 50000 / 1e6; // ~50,000 BTU/lbmol H2S

    return {
        clausStages,
        sulfurRecovery: Math.round(baseRecovery * 10000) / 100,
        withTGTU,
        overallRecovery: Math.round(overallRecovery * 10000) / 100,
        sulfurProduction: Math.round(sulfurLtPerDay * 10) / 10,
        reactionFurnaceTemp,
        wasteHeatBoilerDuty: Math.round(wasteHeatBoilerDuty * 10) / 10,
    };
}

// ============================================================
// 4.8 — PRODUCED WATER MANAGEMENT
// ============================================================

export interface WaterTreatmentDesign {
    oilInWaterInlet: number;     // mg/L (ppm)
    oilInWaterOutlet: number;    // mg/L
    treatmentStages: {
        name: string;
        efficiency: number;        // % removal
        outletOIW: number;         // mg/L
    }[];
    deoilingHydrocycloneCount: number;
    igfCells: number;            // Induced Gas Flotation
    filterVessels: number;
    chemicalConsumption: {
        demulsifier: number;       // gal/day
        scaleInhibitor: number;    // gal/day
        biocide: number;           // gal/day
        oxygenScavenger: number;   // gal/day
    };
}

export interface WaterInjectionDesign {
    injectionRate: number;       // BWPD
    injectionPressure: number;   // psig
    pumpType: string;
    pumpStages: number;
    pumpPower: number;           // HP
    tubingSize: number;          // inches
    surfaceLineDiameter: number; // inches
    filtrationLevel: number;     // microns
}

/** Design produced water treatment system */
export function designWaterTreatment(params: {
    waterRate: number;          // BWPD
    oilInWaterInlet: number;    // mg/L
    targetOIW: number;          // mg/L (overboard: <40, injection: <10)
    destination: 'overboard' | 'injection' | 'disposal';
}): WaterTreatmentDesign {
    const { waterRate, oilInWaterInlet, targetOIW, destination } = params;

    const stages: { name: string; efficiency: number; outletOIW: number }[] = [];
    let currentOIW = oilInWaterInlet;

    // Stage 1: Hydrocyclones (70-90% removal)
    if (currentOIW > 50) {
        const hydroEff = 0.85;
        currentOIW *= (1 - hydroEff);
        stages.push({ name: 'De-oiling Hydrocyclones', efficiency: hydroEff * 100, outletOIW: Math.round(currentOIW) });
    }

    // Stage 2: Induced Gas Flotation (80-95% removal)
    if (currentOIW > targetOIW * 1.5) {
        const igfEff = 0.90;
        currentOIW *= (1 - igfEff);
        stages.push({ name: 'Induced Gas Flotation (IGF)', efficiency: igfEff * 100, outletOIW: Math.round(currentOIW) });
    }

    // Stage 3: Walnut shell / multimedia filters (90-95%)
    if (currentOIW > targetOIW) {
        const filterEff = 0.92;
        currentOIW *= (1 - filterEff);
        stages.push({ name: 'Multimedia Filtration', efficiency: filterEff * 100, outletOIW: Math.round(currentOIW) });
    }

    // Chemical rates (proportional to water rate)
    const demulsifierRate = waterRate * 0.005; // gal per 1000 bbl
    const scaleInhibitorRate = waterRate * 0.003;
    const biocideRate = destination === 'injection' ? waterRate * 0.015 : waterRate * 0.005;
    const o2ScavRate = destination === 'injection' ? waterRate * 0.01 : 0;

    // Equipment counts
    const hydrocycloneCount = Math.max(1, Math.ceil(waterRate / 50000));
    const igfCells = Math.max(2, Math.ceil(waterRate / 25000));
    const filterVessels = Math.max(2, Math.ceil(waterRate / 30000));

    return {
        oilInWaterInlet,
        oilInWaterOutlet: Math.round(Math.max(targetOIW, currentOIW)),
        treatmentStages: stages,
        deoilingHydrocycloneCount: hydrocycloneCount,
        igfCells,
        filterVessels,
        chemicalConsumption: {
            demulsifier: Math.round(demulsifierRate * 10) / 10,
            scaleInhibitor: Math.round(scaleInhibitorRate * 10) / 10,
            biocide: Math.round(biocideRate * 10) / 10,
            oxygenScavenger: Math.round(o2ScavRate * 10) / 10,
        },
    };
}

/** Design water injection system */
export function designWaterInjection(params: {
    injectionRate: number;      // BWPD
    reservoirPressure: number;  // psig
    injectivityIndex: number;   // BWPD/psi
    wellheadElevation: number;  // ft
    depth: number;              // ft TVD
    frictionGradient: number;   // psi/1000 ft (depends on tubing size)
}): WaterInjectionDesign {
    const { injectionRate, reservoirPressure, injectivityIndex, depth, frictionGradient } = params;

    // Injection bottomhole pressure needed
    const deltaP = injectionRate / injectivityIndex;
    const bhpRequired = reservoirPressure + deltaP;

    // Surface pressure (bhp + hydrostatic - friction)
    const hydrostaticGradient = 0.433; // psi/ft (assume water gradient)
    const hydrostatic = depth * hydrostaticGradient;
    const friction = (depth / 1000) * frictionGradient;
    const surfacePressure = bhpRequired - hydrostatic + friction;

    // Pump selection
    const pumpType = surfacePressure > 3000 ? 'Horizontal Split-Case Multistage' :
        surfacePressure > 1500 ? 'BB3 Multistage Centrifugal' : 'Single-Stage Centrifugal';

    // Pump power
    const waterSG = 1.02;
    const gpm = injectionRate / 24 / 60 * 42; // BWPD → gpm
    const pumpEff = 0.82;
    const pumpPower = (gpm * surfacePressure) / (1714 * pumpEff);

    // Tubing size
    const tubingVel = 12; // ft/s max
    const tubingArea = (injectionRate * 5.615 / 86400) / tubingVel;
    const tubingSize = Math.ceil(Math.sqrt(4 * tubingArea / Math.PI) * 12 * 10) / 10;

    // Surface line diameter
    const lineVel = 8; // ft/s
    const lineArea = (injectionRate * 5.615 / 86400) / lineVel;
    const lineDiameter = Math.ceil(Math.sqrt(4 * lineArea / Math.PI) * 12);

    return {
        injectionRate,
        injectionPressure: Math.round(surfacePressure),
        pumpType,
        pumpStages: Math.ceil(surfacePressure / 500),
        pumpPower: Math.round(pumpPower),
        tubingSize: Math.max(2.375, Math.round(tubingSize * 10) / 10),
        surfaceLineDiameter: Math.max(4, lineDiameter),
        filtrationLevel: 5, // microns for injection wells
    };
}

// ============================================================
// 4.9 — UTILITIES & POWER SYSTEMS
// ============================================================

export interface PowerSystemDesign {
    totalPowerDemand: number;    // kW
    generation: {
        type: string;
        capacity: number;          // kW each
        quantity: number;
        fuelConsumption: number;   // Mscf/D gas or gal/D diesel
    }[];
    wasteHeatRecovery: number;   // MMBtu/hr
    powerImport: number;         // kW from grid
    emergencyBackup: number;     // kW
    emissions: {
        co2: number;               // tons/day
        nox: number;               // tons/day
    };
}

export interface FlareSystemDesign {
    flareType: 'HP' | 'LP' | 'coldVent';
    tipDiameter: number;         // inches
    stackHeight: number;         // ft
    thermalRadiationLimit: number; // BTU/hr·ft² at grade (API 521: 1600 for personnel)
    safeDistance: number;        // ft from flare to grade
    knockoutDrumVolume: number;  // bbl
    emergencyRate: number;       // MMscf/D
    pilotGasRate: number;        // Mscf/D
    steamAssistRate: number;     // lb/hr
    flameLength: number;         // ft
}

/** Design power generation system */
export function designPowerSystem(params: {
    totalConnectedLoad: number;  // kW
    processHeatingDemand: number; // MMBtu/hr
    hasGasSupply: boolean;
    gasSupplyRate: number;       // MMscf/D available
    gridAvailable: boolean;
    reliability: 'N' | 'N+1' | '2N';
}): PowerSystemDesign {
    const { totalConnectedLoad, processHeatingDemand, hasGasSupply, gasSupplyRate, gridAvailable, reliability } = params;

    const runningLoad = totalConnectedLoad * 0.85; // diversity factor
    const generation: PowerSystemDesign['generation'] = [];
    let totalGenCap = 0;

    if (hasGasSupply && gasSupplyRate > 1) {
        // Gas turbine generation
        const turbineSize = runningLoad > 20000 ? 25000 : runningLoad > 10000 ? 15000 : 5000;
        const nTurbines = reliability === '2N' ? 2 * Math.ceil(runningLoad / turbineSize)
            : reliability === 'N+1' ? Math.ceil(runningLoad / turbineSize) + 1
                : Math.ceil(runningLoad / turbineSize);

        const turbineHeatRate = 10000; // BTU/kWh
        const fuelPerTurbine = (turbineSize * turbineHeatRate * 24) / 1e6 / 900; // Mscf/D per turbine

        generation.push({
            type: `Gas Turbine (${turbineSize} kW)`,
            capacity: turbineSize,
            quantity: nTurbines,
            fuelConsumption: Math.round(fuelPerTurbine),
        });
        totalGenCap += turbineSize * nTurbines;
    } else if (gridAvailable) {
        generation.push({
            type: 'Grid Import',
            capacity: Math.ceil(runningLoad),
            quantity: 1,
            fuelConsumption: 0,
        });
        totalGenCap += runningLoad;
    } else {
        // Diesel backup
        const dieselSize = 2000;
        const nDiesel = Math.ceil(runningLoad / dieselSize);
        generation.push({
            type: `Diesel Generator (${dieselSize} kW)`,
            capacity: dieselSize,
            quantity: nDiesel,
            fuelConsumption: Math.round(dieselSize * 0.07 * 24), // gal/D
        });
        totalGenCap += dieselSize * nDiesel;
    }

    // Emergency backup
    const emergencyBackup = gridAvailable ? Math.ceil(runningLoad * 0.5) : 0;

    // Waste heat recovery
    const wasteHeatRecovery = generation.reduce((sum, g) => {
        if (g.type.includes('Turbine')) return sum + g.capacity * g.quantity * 0.003412 * 0.5; // ~50% exhaust heat
        return sum;
    }, 0);

    // Emissions
    const co2PerMMBTU = 117; // lb CO2/MMBTU for gas
    const totalFuelMMBTU = generation.reduce((sum, g) => sum + g.fuelConsumption * 0.9, 0); // 900 BTU/scf
    const co2 = (totalFuelMMBTU * co2PerMMBTU) / 2000; // tons/day

    return {
        totalPowerDemand: totalConnectedLoad,
        generation,
        wasteHeatRecovery: Math.round(wasteHeatRecovery * 10) / 10,
        powerImport: gridAvailable ? Math.ceil(runningLoad * 0.3) : 0,
        emergencyBackup,
        emissions: {
            co2: Math.round(co2 * 10) / 10,
            nox: Math.round(totalFuelMMBTU * 0.1 / 2000 * 10) / 10, // 0.1 lb/MMBTU NOx
        },
    };
}

/** Design flare system per API 521 */
export function designFlareSystem(params: {
    emergencyReliefRate: number; // MMscf/D
    gasMW: number;              // molecular weight (16-20 for natural gas)
    gasTemperature: number;     // °F
    windSpeed: number;          // mph (API uses 20 mph)
    radiationLimit: number;     // BTU/hr·ft² (1600 for personnel, 3000 for equipment)
    flareGasHHV: number;        // BTU/scf (typically 900-1200)
}): FlareSystemDesign {
    const { emergencyReliefRate, gasMW, gasTemperature, windSpeed, radiationLimit, flareGasHHV } = params;

    // Mach number at flare tip (0.2-0.5 for hydrocarbon flares)
    const mach = 0.3;
    const sonicVel = 223 * Math.sqrt((gasTemperature + 460) / gasMW);
    const exitVel = mach * sonicVel; // ft/s

    // Tip diameter
    const gasRateSCFS = emergencyReliefRate * 1e6 / 86400;
    const gasRateACFS = gasRateSCFS * (14.7 / 14.7) * (gasTemperature + 460) / 520;
    const tipArea = gasRateACFS / exitVel;
    const tipDiameter = Math.sqrt(4 * tipArea / Math.PI) * 12;

    // Flame length (API 521)
    const heatRelease = emergencyReliefRate * flareGasHHV * 1000 / 24; // BTU/hr
    const flameLength = 0.00326 * Math.pow(heatRelease, 0.478); // ft

    // Stack height based on thermal radiation
    const fractionHeatRadiated = 0.3; // fraction of heat radiated
    const radiatedHeat = heatRelease * fractionHeatRadiated; // BTU/hr

    // Safe distance: r = √(τQ / (4πK)) where K is radiation limit
    // API 521: K = radiation limit at grade
    let stackHeight = 50;
    for (let iter = 0; iter < 100; iter++) {
        const slantRange = Math.sqrt(Math.pow(stackHeight, 2) + Math.pow(flameLength * 0.5, 2));
        const radiation = radiatedHeat / (4 * Math.PI * Math.pow(slantRange, 2));
        if (radiation < radiationLimit) break;
        stackHeight += 5;
    }

    const safeDistance = Math.sqrt(Math.pow(radiatedHeat / (4 * Math.PI * radiationLimit), 2));

    // Knockout drum (API 521: sized for max slug)
    const kODVol = emergencyReliefRate * 1.5; // approximate bbl per MMscf/D

    // Pilot gas
    const pilotCount = tipDiameter > 24 ? 3 : 2;
    const pilotGasRate = pilotCount * 50; // ~50 Mscf/D per pilot

    // Steam assist for smokeless (0.3 lb steam / lb hydrocarbon)
    const steamAssist = heatRelease / flareGasHHV * 19 * 0.3; // lb/hr steam

    return {
        flareType: 'HP',
        tipDiameter: Math.round(Math.max(4, tipDiameter)),
        stackHeight: Math.round(Math.max(30, stackHeight)),
        thermalRadiationLimit: radiationLimit,
        safeDistance: Math.round(safeDistance),
        knockoutDrumVolume: Math.round(Math.max(50, kODVol)),
        emergencyRate: emergencyReliefRate,
        pilotGasRate: Math.round(pilotGasRate),
        steamAssistRate: Math.round(steamAssist),
        flameLength: Math.round(flameLength),
    };
}

// ============================================================
// 4.10 — FACILITY SAFETY & CONTROL SYSTEMS
// ============================================================

export interface SILDesign {
    safetyFunction: string;
    requiredSIL: 0 | 1 | 2 | 3 | 4;
    achievedSIL: number;
    pfdavg: number;             // Probability of Failure on Demand (avg)
    rrf: number;                // Risk Reduction Factor
    testInterval: number;       // months
    spuriousTripRate: number;   // trips/year
    sensors: string;
    logicSolver: string;
    finalElements: string;
}

export interface ESDSystemDesign {
    totalShutdownValves: number;
    blowdownValves: number;
    esdLevels: {
        level: number;
        description: string;
        responseTime: number;     // seconds
        affectedUnits: string[];
    }[];
    blowdownTime: number;       // minutes to 50% inventory pressure
    minDesignMetalTemp: number; // °F
    autoRefrigerationTemp: number; // °F after blowdown
}

export interface FandGDesign {
    gasDetectors: {
        type: string;
        quantity: number;
        coverage: number;         // % area covered
    }[];
    flameDetectors: {
        type: string;
        quantity: number;
    }[];
    h2sDetectors: number;
    firewaterPumps: {
        main: { capacity: number; driver: string; }; // gpm
        jockey: { capacity: number; };               // gpm
        backup: { capacity: number; driver: string; };
    };
    firewaterTank: number;      // bbl capacity (typically 4-8 hr)
    delugeSystems: number;
    foamSystems: number;
}

/** Design Safety Instrumented System per IEC 61511 */
export function designSIL(params: {
    processRisk: 'low' | 'medium' | 'high' | 'extreme';
    testIntervalMonths: number;
    sensorArchitecture: '1oo1' | '1oo2' | '2oo3' | '1oo3';
    finalElementArchitecture: '1oo1' | '1oo2' | '2oo3';
}): SILDesign[] {
    const { processRisk, testIntervalMonths, sensorArchitecture, finalElementArchitecture } = params;
    const designs: SILDesign[] = [];

    // PFD values per IEC 61508 architecture
    const sensorPFD = sensorArchitecture === '2oo3' ? 2e-4 : sensorArchitecture === '1oo2' ? 5e-4 : 1e-2;
    const logicPFD = 1e-4; // Logic solver (typically very reliable)
    const finalPFD = finalElementArchitecture === '2oo3' ? 5e-4 : finalElementArchitecture === '1oo2' ? 1e-3 : 2e-2;
    const pfdavg = sensorPFD + logicPFD + finalPFD;

    const rrf = 1 / pfdavg;

    // SIL assignment based on process risk
    const requiredSIL: 0 | 1 | 2 | 3 | 4 = processRisk === 'extreme' ? 3
        : processRisk === 'high' ? 2
            : processRisk === 'medium' ? 1
                : 0;

    designs.push({
        safetyFunction: 'High Pressure Protection (HIPPS)',
        requiredSIL,
        achievedSIL: pfdavg < 1e-4 ? 3 : pfdavg < 1e-3 ? 2 : pfdavg < 1e-2 ? 1 : 0,
        pfdavg: Math.round(pfdavg * 1e6) / 1e6,
        rrf: Math.round(rrf),
        testInterval: testIntervalMonths,
        spuriousTripRate: Math.round(12 / testIntervalMonths * 10) / 10,
        sensors: `Pressure transmitters (${sensorArchitecture})`,
        logicSolver: 'Safety PLC (SIL 3 certified)',
        finalElements: `Shutdown valves (${finalElementArchitecture}) with partial stroke testing`,
    });

    designs.push({
        safetyFunction: 'Emergency Depressurization (EDP)',
        requiredSIL,
        achievedSIL: pfdavg < 1e-3 ? 2 : 1,
        pfdavg: Math.round(pfdavg * 0.8 * 1e6) / 1e6,
        rrf: Math.round(1 / (pfdavg * 0.8)),
        testInterval: testIntervalMonths,
        spuriousTripRate: Math.round(12 / testIntervalMonths * 5) / 10,
        sensors: 'Manual ESD pushbutton + F&G logic',
        logicSolver: 'Safety PLC (SIL 3 certified)',
        finalElements: `Blowdown valves (${finalElementArchitecture})`,
    });

    return designs;
}

/** Design Emergency Shutdown system */
export function designESDSystem(params: {
    processUnitCount: number;
    vesselCount: number;
    totalGasInventory: number;  // MMscf
    minDesignMetalTemp: number; // °F
    gasComposition: { methane: number; ethane: number; propane: number; }; // mol%
}): ESDSystemDesign {
    const { processUnitCount, vesselCount, totalGasInventory, minDesignMetalTemp } = params;

    const sdvs = vesselCount * 2.5 + processUnitCount * 3; // ~2-3 SDVs per vessel + unit isolation
    const bdvs = Math.ceil(vesselCount * 1.2); // ~1 BDV per vessel

    // Blowdown time to 50% inventory (API 521: typically <15 minutes)
    const blowdownTime = totalGasInventory > 100 ? 15 : totalGasInventory > 50 ? 12 : 8;

    // Auto-refrigeration temp (Joule-Thomson cooling during blowdown)
    const autoRefrigerationTemp = minDesignMetalTemp - 30; // °F below MDMT

    return {
        totalShutdownValves: Math.round(sdvs),
        blowdownValves: Math.round(bdvs),
        esdLevels: [
            { level: 0, description: 'Single equipment trip', responseTime: 1, affectedUnits: ['Single compressor/pump'] },
            { level: 1, description: 'Process unit shutdown', responseTime: 5, affectedUnits: ['One process train'] },
            { level: 2, description: 'Total plant shutdown', responseTime: 15, affectedUnits: ['All process units'] },
            { level: 3, description: 'Total shutdown + blowdown', responseTime: 30, affectedUnits: ['All process + depressurization'] },
        ],
        blowdownTime,
        minDesignMetalTemp,
        autoRefrigerationTemp,
    };
}

/** Design Fire & Gas detection system */
export function designFandGSystem(params: {
    plotArea: number;           // ft² (facility footprint)
    processAreaFraction: number; // fraction that's process (not admin/utilities)
    h2sPresent: boolean;
    passiveFireproofingArea: number; // ft² of structural steel
}): FandGDesign {
    const { plotArea, processAreaFraction, h2sPresent, passiveFireproofingArea } = params;
    const processArea = plotArea * processAreaFraction;

    // Gas detectors: ~1 per 4000 ft² in congested areas
    const irPointDetectors = Math.ceil(processArea / 4000);
    const openPathDetectors = Math.max(1, Math.ceil(Math.sqrt(processArea) / 100));
    const acousticDetectors = Math.max(1, Math.ceil(processArea / 10000));
    const coverage = Math.min(100, Math.round((irPointDetectors * 4000 + openPathDetectors * 20000) / processArea * 100));

    // Flame detectors: ~1 per 2500 ft² in hydrocarbon areas
    const flameDetectors = Math.ceil(processArea * 0.5 / 2500);

    // H2S detectors
    const h2sDetectors = h2sPresent ? Math.ceil(processArea / 3000) : 0;

    // Firewater: ~0.25-0.5 gpm/ft² for process areas
    const firewaterRate = processArea * 0.3; // gpm
    const firewaterDuration = 6; // hours
    const firewaterTank = (firewaterRate * firewaterDuration * 60) / 42; // bbl

    const jockeyPumpRate = firewaterRate * 0.05;

    return {
        gasDetectors: [
            { type: 'IR Point (catalytic bead backup)', quantity: irPointDetectors, coverage },
            { type: 'Open-Path IR', quantity: openPathDetectors, coverage: Math.round(openPathDetectors * 20000 / processArea * 100) },
            { type: 'Ultrasonic Leak Detection', quantity: acousticDetectors, coverage: 80 },
        ],
        flameDetectors: [
            { type: 'UV/IR Multi-Spectrum', quantity: flameDetectors },
        ],
        h2sDetectors,
        firewaterPumps: {
            main: { capacity: Math.round(firewaterRate), driver: 'Diesel Engine' },
            jockey: { capacity: Math.round(jockeyPumpRate) },
            backup: { capacity: Math.round(firewaterRate), driver: 'Diesel Engine (standby)' },
        },
        firewaterTank: Math.round(firewaterTank),
        delugeSystems: Math.ceil(processArea / 5000),
        foamSystems: Math.ceil(processArea / 20000),
    };
}

// ============================================================
// EXTENDED SECTION — missing calculators for 6-tab surface UI
// ============================================================

// --- Tab 1: Separator — multi-stage flash with Rachford-Rice ---

export interface FlashResult {
    vaporFraction: number;
    liquidFraction: number;
    vaporComposition: number[];
    liquidComposition: number[];
    kValues: number[];
}

/**
 * Wilson K-value correlation (T in °F, P in psia, Tc in °F, Pc in psia, ω accentric)
 * kᵢ = (Pcᵢ / P) · exp[5.37 · (1 + ωᵢ) · (1 − Tcᵢᵣ / Tᵣ)]
 */
export function wilsonKValue(TdegF: number, Ppsia: number, TcR: number, PcPsia: number, omega: number): number {
    const Tr = (TdegF + 459.67) / TcR;
    const k = (PcPsia / Ppsia) * Math.exp(5.37 * (1 + omega) * (1 - 1 / Math.max(Tr, 0.4)));
    return Math.max(k, 0.001);
}

/** Rachford-Rice flash solver (single-stage isothermal) */
export function rachfordRiceFlash(comp: { zi: number; Pc: number; Tc: number; omega: number }[], TdegF: number, Ppsia: number): FlashResult {
    const n = comp.length;
    const kVal = comp.map(c => wilsonKValue(TdegF, Ppsia, c.Tc, c.Pc, c.omega));
    // Rachford-Rice: Σ zᵢ·(Kᵢ − 1) / (1 + β·(Kᵢ − 1)) = 0, solve for β
    let beta = 0.5;
    for (let iter = 0; iter < 80; iter++) {
        let f = 0, df = 0;
        for (let i = 0; i < n; i++) {
            const denom = 1 + beta * (kVal[i] - 1);
            f += comp[i].zi * (kVal[i] - 1) / denom;
            df -= comp[i].zi * Math.pow(kVal[i] - 1, 2) / Math.pow(denom, 2);
        }
        if (Math.abs(f) < 1e-8) break;
        const dbeta = -f / Math.max(df, -1e-6);
        beta = Math.max(0.001, Math.min(0.999, beta + dbeta));
        if (Math.abs(dbeta) < 1e-10) break;
    }
    const x: number[] = [], y: number[] = [];
    for (let i = 0; i < n; i++) {
        const denom = 1 + beta * (kVal[i] - 1);
        x.push(comp[i].zi / denom);
        y.push(kVal[i] * comp[i].zi / denom);
    }
    return { vaporFraction: Math.round(beta * 10000) / 10000, liquidFraction: Math.round((1 - beta) * 10000) / 10000, vaporComposition: y, liquidComposition: x, kValues: kVal };
}

// --- Tab 1: Hall-Yarborough Z-factor ---

export function hallYarboroughZ(Tr: number, Pr: number): number {
    const t = 1 / Math.max(Tr, 1.01);
    const A = 0.06125 * t * Math.exp(-1.2 * Math.pow(1 - t, 2));
    const B = t * (14.76 - 9.76 * t + 4.58 * t * t);
    const C = t * (90.7 - 242.2 * t + 42.4 * t * t);
    const D = 2.18 + 2.82 * t;
    let yRho = 0.001;
    for (let i = 0; i < 40; i++) {
        const f = -A * Pr + (yRho + yRho * yRho + yRho * yRho * yRho - yRho * yRho * yRho * yRho) / Math.pow(1 - yRho, 3) - B * yRho * yRho + C * Math.pow(yRho, D);
        const df = (1 + 2 * yRho + 3 * yRho * yRho - 4 * yRho * yRho * yRho) / Math.pow(1 - yRho, 3) + 3 * (yRho + yRho * yRho + yRho * yRho * yRho - yRho * yRho * yRho * yRho) / Math.pow(1 - yRho, 4) - 2 * B * yRho + C * D * Math.pow(yRho, D - 1);
        const dy = -f / Math.max(df, 1e-12);
        yRho += dy;
        if (Math.abs(dy) < 1e-11) break;
    }
    return Math.max(0.2, A * Pr / Math.max(yRho, 0.0001));
}

// --- Tab 2: BS&W tracking through full treatment train ---

export interface BSWStageResult {
    stage: string;
    bsAndWInletPct: number;
    bsAndWOutletPct: number;
    waterRemovedBWPD: number;
    oilCarriedOverPpm: number;
}

export function calculateBSWTrain(params: { oilRate: number; waterRate: number; stages: { name: string; efficiencyPct: number; oilLossPpm: number }[] }): BSWStageResult[] {
    const { oilRate, waterRate, stages } = params;
    let currentWater = waterRate;
    const results: BSWStageResult[] = [];
    for (const s of stages) {
        const bsIn = currentWater / (oilRate + currentWater) * 100;
        const waterRemoved = currentWater * (s.efficiencyPct / 100);
        currentWater = Math.max(0.01, currentWater - waterRemoved);
        const bsOut = currentWater / (oilRate + currentWater) * 100;
        const oilCarried = (waterRemoved * (s.oilLossPpm / 1e6) * 1000);
        results.push({ stage: s.name, bsAndWInletPct: Math.round(bsIn * 1000) / 1000, bsAndWOutletPct: Math.round(bsOut * 1000) / 1000, waterRemovedBWPD: Math.round(waterRemoved), oilCarriedOverPpm: Math.round(oilCarried * 10) / 10 });
    }
    return results;
}

// --- Tab 3: McKetta-Wehe water content (glycol dehydration) ---

export function mcKettaWeheWaterContent(TdegF: number, Ppsia: number): number {
    // Approximate correlation: lb H₂O / MMscf
    const A = 16.0 * Math.exp(0.058 * TdegF) / Math.pow(Math.max(Ppsia, 14.7), 0.7);
    return Math.max(0.5, Math.round(A * 100) / 100);
}

export function tegDehydrationCalc(params: { gasRate: number; inletWater: number; targetWater: number; tegCirculationRate: number }): { waterRemovedLbHr: number; dewPointDepressionF: number; tegPumpGpm: number; reboilerDutyMMBtuHr: number; leanTegPurityPct: number } {
    const { gasRate, inletWater, targetWater, tegCirculationRate } = params;
    const waterRemoved = gasRate * (inletWater - targetWater) / 24;
    const dewPointDepression = Math.round(50 + Math.log10(Math.max(waterRemoved, 1)) * 15);
    const tegPumpGpm = tegCirculationRate * 0.3;
    const reboilerDuty = waterRemoved * 0.0012;
    const leanTegPurity = 98.5 + Math.min(1.2, tegCirculationRate * 0.1);
    return { waterRemovedLbHr: Math.round(waterRemoved), dewPointDepressionF: Math.min(dewPointDepression, 120), tegPumpGpm: Math.round(tegPumpGpm * 10) / 10, reboilerDutyMMBtuHr: Math.round(reboilerDuty * 100) / 100, leanTegPurityPct: Math.round(leanTegPurity * 10) / 10 };
}

// --- Tab 3: Amine sweetening ---
export function amineSweeteningCalc(params: { gasRate: number; h2sInletPpm: number; co2InletPct: number; amineType: 'MEA' | 'DEA' | 'MDEA' }): { circulationRateGpm: number; absorberDiameterIn: number; reboilerDutyMMBtuHr: number; h2sOutletPpm: number; co2OutletPct: number } {
    const { gasRate, h2sInletPpm, co2InletPct, amineType } = params;
    const loadingMol = amineType === 'MEA' ? 0.35 : amineType === 'DEA' ? 0.45 : 0.55;
    const amineConcentration = amineType === 'MEA' ? 0.15 : amineType === 'DEA' ? 0.35 : 0.5;
    const gasMolHr = gasRate * 1e6 / 379.5 / 24;
    const h2sMol = gasMolHr * h2sInletPpm / 1e6;
    const co2Mol = gasMolHr * co2InletPct / 100;
    const totalAcidGas = h2sMol + co2Mol;
    const circRate = (totalAcidGas / loadingMol) / amineConcentration * 8.34 / 60;
    const absDia = Math.sqrt(gasRate * 0.03 / Math.PI) * 12;
    const reboilerDuty = totalAcidGas * 72 / 1e6;
    const h2sOut = Math.max(1, h2sInletPpm * 0.0001);
    const co2Out = amineType === 'MDEA' ? co2InletPct * 0.03 : co2InletPct * 0.005;
    return { circulationRateGpm: Math.round(circRate), absorberDiameterIn: Math.round(Math.max(12, absDia)), reboilerDutyMMBtuHr: Math.round(reboilerDuty * 100) / 100, h2sOutletPpm: Math.round(h2sOut), co2OutletPct: Math.round(co2Out * 1000) / 1000 };
}

// --- Tab 3: NGL Recovery ---
export function nglRecoveryCalc(params: { gasRate: number; c2MolPct: number; c3MolPct: number; c4MolPct: number; c5PlusMolPct: number; method: 'JT' | 'Refrigeration' | 'Cryogenic' }): { nglYieldBpd: number; c2RecoveryPct: number; c3RecoveryPct: number; c4PlusRecoveryPct: number; gpM: number; powerMW: number } {
    const { gasRate, c2MolPct, c3MolPct, c4MolPct, c5PlusMolPct, method } = params;
    const eff = method === 'Cryogenic' ? [0.75, 0.98, 0.995] : method === 'Refrigeration' ? [0.1, 0.55, 0.92] : [0.0, 0.2, 0.7];
    const c3Bpd = gasRate * (c3MolPct / 100) * 1e6 / 379.5 * 37.5 / 42 * eff[1];
    const c4PlusBpd = gasRate * ((c4MolPct + c5PlusMolPct) / 100) * 1e6 / 379.5 * 58 / 42 * eff[2];
    const c2Bpd = gasRate * (c2MolPct / 100) * 1e6 / 379.5 * 30.1 / 42 * eff[0];
    const totalBpd = c2Bpd + c3Bpd + c4PlusBpd;
    const gpm = totalBpd * 42 / (gasRate * 1e6 / 1000);
    const power = method === 'Cryogenic' ? gasRate * 25 : method === 'Refrigeration' ? gasRate * 12 : gasRate * 2;
    return { nglYieldBpd: Math.round(totalBpd), c2RecoveryPct: Math.round(eff[0] * 100), c3RecoveryPct: Math.round(eff[1] * 100), c4PlusRecoveryPct: Math.round(eff[2] * 100), gpM: Math.round(gpm * 100) / 100, powerMW: Math.round(power / 1000 * 10) / 10 };
}

// --- Tab 3: Claus sulfur recovery ---

export function clausSulfurCalc(params: { h2sRateTpd: number; catalyticStages: number; hasTGTU: boolean }): { sulfurRecoveryTpd: number; overallRecoveryPct: number; thermalStageTempC: number; steamGeneratedLbHr: number; tailGasH2sPpm: number } {
    const { h2sRateTpd, catalyticStages, hasTGTU } = params;
    const thermalEff = 0.70;
    let catEff = thermalEff;
    for (let i = 0; i < catalyticStages; i++) catEff += (1 - catEff) * 0.6;
    const overallRecovery = hasTGTU ? Math.min(0.999, catEff + (1 - catEff) * 0.95) : catEff;
    const sulfurTpd = h2sRateTpd * overallRecovery * (32 / 34.08);
    const steamLbHr = h2sRateTpd * 2000 / 24 * 0.5;
    const tailGasH2sPpm = hasTGTU ? 50 : Math.round((1 - overallRecovery) * h2sRateTpd * 1e6 / 10);
    return { sulfurRecoveryTpd: Math.round(sulfurTpd), overallRecoveryPct: Math.round(overallRecovery * 1000) / 10, thermalStageTempC: 1000, steamGeneratedLbHr: Math.round(steamLbHr), tailGasH2sPpm };
}

// --- Tab 3: Sales gas spec compliance matrix ---

export interface SalesGasSpec {
    parameter: string;
    spec: string;
    value: number;
    unit: string;
    pass: boolean;
}

export function checkSalesGasSpec(params: { hhv: number; h2sPpm: number; co2Pct: number; waterLbMMscf: number; hydrocarbonDewPointF: number; nitrogenPct: number; oxygenPpm: number }): SalesGasSpec[] {
    const { hhv, h2sPpm, co2Pct, waterLbMMscf, hydrocarbonDewPointF, nitrogenPct, oxygenPpm } = params;
    return [
        { parameter: 'HHV', spec: '950–1150 BTU/scf', value: hhv, unit: 'BTU/scf', pass: hhv >= 950 && hhv <= 1150 },
        { parameter: 'H₂S', spec: '< 4 ppm', value: h2sPpm, unit: 'ppm', pass: h2sPpm < 4 },
        { parameter: 'CO₂', spec: '< 2 mol%', value: co2Pct, unit: 'mol%', pass: co2Pct < 2 },
        { parameter: 'Water', spec: '< 7 lb/MMscf', value: waterLbMMscf, unit: 'lb/MMscf', pass: waterLbMMscf < 7 },
        { parameter: 'HC Dew Point', spec: '< 15°F @ 800 psig', value: hydrocarbonDewPointF, unit: '°F', pass: hydrocarbonDewPointF < 15 },
        { parameter: 'N₂', spec: '< 4 mol%', value: nitrogenPct, unit: 'mol%', pass: nitrogenPct < 4 },
        { parameter: 'O₂', spec: '< 10 ppm', value: oxygenPpm, unit: 'ppm', pass: oxygenPpm < 10 },
    ];
}

// --- Tab 4: Scale prediction (Stiff-Davis saturation index) ---

export function stiffDavisSI(params: { caPpm: number; hco3Ppm: number; tdsPpm: number; tempF: number }): { si: number; scalingTendency: string; scaleRateInPerYear: number } {
    const { caPpm, hco3Ppm, tdsPpm, tempF } = params;
    const ionicStrength = tdsPpm * 2.5e-5;
    const ksp = 4.8e-9 * Math.exp(0.003 * tempF);
    const caMol = caPpm / 40080;
    const hco3Mol = hco3Ppm / 61017;
    const gamma = Math.pow(10, -0.5 * 2 * 2 * Math.sqrt(ionicStrength) / (1 + Math.sqrt(ionicStrength)));
    const si = Math.log10(caMol * gamma * hco3Mol * gamma / ksp);
    const scalingTendency = si > 0.5 ? 'Severe scaling' : si > 0 ? 'Moderate scaling' : si > -0.5 ? 'Slight scaling' : 'No scaling';
    const scaleRate = si > 0 ? Math.pow(10, si) * 0.03 : 0;
    return { si: Math.round(si * 100) / 100, scalingTendency, scaleRateInPerYear: Math.round(scaleRate * 1000) / 1000 };
}

export function oddoTomsonSI(params: { baPpm: number; so4Ppm: number; tdsPpm: number; tempF: number }): { si: number; scalingTendency: string } {
    const { baPpm, so4Ppm, tdsPpm, tempF } = params;
    const ionicStrength = tdsPpm * 2.5e-5;
    const kspBaSO4 = 1.05e-10 * Math.exp(0.0018 * tempF);
    const baMol = baPpm / 137327;
    const so4Mol = so4Ppm / 96063;
    const gamma = Math.pow(10, -0.5 * 4 * Math.sqrt(ionicStrength) / (1 + Math.sqrt(ionicStrength)));
    const si = Math.log10(baMol * gamma * so4Mol * gamma / kspBaSO4);
    return { si: Math.round(si * 100) / 100, scalingTendency: si > 0 ? 'BaSO₄ scale likely' : 'No BaSO₄ scale' };
}

// --- Tab 4: Hall plot analysis for injection wells ---

export interface HallPlotResult {
    cumulativeInjectionBbl: number[];
    hallIntegralPsiDay: number[];
    slopePsiDayPerBbl: number;
    interpretation: string;
}

export function computeHallPlot(params: { injectionRateBWPD: number; wellheadPressurePsig: number; reservoirPressurePsig: number; months: number }): HallPlotResult {
    const { injectionRateBWPD, wellheadPressurePsig, reservoirPressurePsig, months } = params;
    const deltaP = wellheadPressurePsig - reservoirPressurePsig;
    const days = Math.max(1, months * 30);
    const cumInj: number[] = [];
    const hallIntegral: number[] = [];
    const nPoints = 12;
    for (let i = 0; i < nPoints; i++) {
        const t = (days / nPoints) * (i + 1);
        const V = injectionRateBWPD * t;
        cumInj.push(Math.round(V));
        hallIntegral.push(Math.round(deltaP * t * 10) / 10);
    }
    const slope = cumInj.length > 1 ? (hallIntegral[hallIntegral.length - 1] - hallIntegral[0]) / Math.max(cumInj[cumInj.length - 1] - cumInj[0], 1) : deltaP / injectionRateBWPD;
    const interpretation = slope < 1 ? 'Increasing injectivity (fracturing?)' : slope < 3 ? 'Stable injection' : slope < 8 ? 'Gradual plugging' : 'Severe plugging — stimulation needed';
    return { cumulativeInjectionBbl: cumInj, hallIntegralPsiDay: hallIntegral, slopePsiDayPerBbl: Math.round(slope * 1000) / 1000, interpretation };
}

// --- Tab 5: Cooling system sizing ---

export function designCoolingSystem(params: { heatRejectionMMBtuHr: number; ambientTempF: number; approachF?: number }): { finFanCount: number; finFanDiameterFt: number; finFanPowerHp: number; seawaterGpm: number; seawaterDeltaTF: number } {
    const { heatRejectionMMBtuHr, ambientTempF, approachF = 25 } = params;
    const finFanDuty = heatRejectionMMBtuHr * 0.5;
    const finFanCount = Math.ceil(finFanDuty / 15);
    const finFanDiameterFt = 12 + Math.ceil(finFanDuty / 20);
    const finFanPowerHp = finFanCount * 30;
    const seawaterDuty = heatRejectionMMBtuHr * 0.5;
    const seawaterDeltaTF = 15;
    const seawaterGpm = seawaterDuty * 1e6 / (8.34 * 60 * seawaterDeltaTF);
    return { finFanCount, finFanDiameterFt, finFanPowerHp, seawaterGpm: Math.round(seawaterGpm), seawaterDeltaTF };
}

// --- Tab 5: Steam balance ---

export function steamBalanceCalc(params: { hpSteamDemandLbHr: number; mpSteamDemandLbHr: number; lpSteamDemandLbHr: number; boilerCapacityLbHr: number; hpToMpExtraction: number }): { hpGeneration: number; hpBalance: number; mpBalance: number; lpBalance: number; boilerUtilizationPct: number } {
    const { hpSteamDemandLbHr, mpSteamDemandLbHr, lpSteamDemandLbHr, boilerCapacityLbHr, hpToMpExtraction } = params;
    const hpGen = boilerCapacityLbHr;
    const hpBal = hpGen - hpSteamDemandLbHr - hpToMpExtraction;
    const mpBal = hpToMpExtraction - mpSteamDemandLbHr;
    const lpBal = mpBal * 0.8 - lpSteamDemandLbHr;
    return { hpGeneration: hpGen, hpBalance: Math.round(hpBal), mpBalance: Math.round(mpBal), lpBalance: Math.round(lpBal), boilerUtilizationPct: Math.round(hpGen / hpSteamDemandLbHr * 100) };
}

// --- Tab 5: Flare Gas Recovery Unit (FGRU) economics ---

export function fgruEconomics(params: { flareGasMMscfd: number; gasPricePerMscf: number; liquidYieldBblPerMMscf: number; liquidPricePerBbl: number }): { grossRevenuePerYear: number; paybackMonths: number; capexEstimate: number; opexPerYear: number } {
    const { flareGasMMscfd, gasPricePerMscf, liquidYieldBblPerMMscf, liquidPricePerBbl } = params;
    const gasRevenue = flareGasMMscfd * gasPricePerMscf * 365 * 1000;
    const liquidRevenue = flareGasMMscfd * liquidYieldBblPerMMscf * 365 * liquidPricePerBbl;
    const grossRevenue = gasRevenue + liquidRevenue;
    const capex = flareGasMMscfd * 3e6;
    const opex = grossRevenue * 0.15;
    const paybackMonths = Math.round(capex / Math.max(grossRevenue - opex, 1) * 12);
    return { grossRevenuePerYear: Math.round(grossRevenue), paybackMonths, capexEstimate: Math.round(capex), opexPerYear: Math.round(opex) };
}

// --- Tab 5: Fuel gas network & CO2 emissions ---

export function fuelGasEmissionsCalc(params: { fuelGasMMscfd: number; gasCO2FactorLbPerMMBTU?: number }): { co2TonsPerDay: number; co2TonsPerYear: number; equivalentCars: number; energyMMBTUDay: number } {
    const { fuelGasMMscfd, gasCO2FactorLbPerMMBTU = 117 } = params;
    const energyMMBTUDay = fuelGasMMscfd * 1000 * 0.9;
    const co2TonsPerDay = energyMMBTUDay * gasCO2FactorLbPerMMBTU / 2000;
    const co2TonsPerYear = co2TonsPerDay * 365;
    const equivalentCars = Math.round(co2TonsPerYear / 4.6);
    return { co2TonsPerDay: Math.round(co2TonsPerDay * 10) / 10, co2TonsPerYear: Math.round(co2TonsPerYear), equivalentCars, energyMMBTUDay: Math.round(energyMMBTUDay) };
}

// --- Tab 6: Hazardous area classification (API RP 500 / 505) ---

export interface HazardousZone {
    classification: string;
    radiusFt: number;
    description: string;
    equipmentRequirement: string;
}

export function classifyHazardousZones(params: { processAreaSqft: number; hasVenting: boolean; ventilationRateAcfm: number; gasDensityRelativeToAir: number }): HazardousZone[] {
    const { processAreaSqft, hasVenting, ventilationRateAcfm, gasDensityRelativeToAir } = params;
    const zone0Radius = processAreaSqft > 10000 ? 15 : 10;
    const zone1Radius = zone0Radius * 2.5 + (hasVenting ? 5 : 0);
    const zone2Radius = zone1Radius * 1.8;
    const zones: HazardousZone[] = [
        { classification: 'Zone 0', radiusFt: zone0Radius, description: 'Continuous presence of flammable atmosphere (>1000 hr/yr) — inside tanks, sumps, drains', equipmentRequirement: 'Ex ia (intrinsically safe) only' },
        { classification: 'Zone 1', radiusFt: Math.round(zone1Radius), description: 'Likely to occur in normal operation (10–1000 hr/yr) — around vents, seals, sample points', equipmentRequirement: 'Ex d (flameproof), Ex e (increased safety)' },
        { classification: 'Zone 2', radiusFt: Math.round(zone2Radius), description: 'Not likely in normal operation, short duration (<10 hr/yr) — general process areas', equipmentRequirement: 'Ex nA (non-sparking), Ex ec' },
        { classification: 'Unclassified', radiusFt: 0, description: 'Non-hazardous — admin buildings, control room, substations', equipmentRequirement: 'Standard industrial' },
    ];
    const ventilationAdequacy = ventilationRateAcfm / Math.max(processAreaSqft, 1) * 60;
    if (ventilationAdequacy > 12 && gasDensityRelativeToAir < 1.5) zones[0].radiusFt = Math.max(3, zone0Radius * 0.5);
    return zones;
}

// --- Tab 6: PFDavg per IEC 61511 for various SIF architectures ---

export function computePFDavg(params: { sensorArchitecture: '1oo1' | '1oo2' | '2oo3' | '1oo3'; logicArchitecture: '1oo1' | '1oo2' | '2oo3'; finalElementArchitecture: '1oo1' | '1oo2' | '2oo3'; proofTestIntervalMonths: number; lambdaD: number }): { pfdSensor: number; pfdLogic: number; pfdFinal: number; pfdTotal: number; rrf: number; achievedSIL: number } {
    const { sensorArchitecture, logicArchitecture, finalElementArchitecture, proofTestIntervalMonths, lambdaD } = params;
    const TI = proofTestIntervalMonths * 730; // hours
    const pfdArch = (arch: string, ld: number) => {
        const pfd_1oo1 = ld * TI / 2;
        if (arch === '1oo2') return pfd_1oo1 * 2 * ld * TI / 2; // simplified
        if (arch === '2oo3') return pfd_1oo1 * ld * TI * 0.5;
        if (arch === '1oo3') return pfd_1oo1 * 2;
        return pfd_1oo1;
    };
    const pfdSensor = pfdArch(sensorArchitecture, lambdaD);
    const pfdLogic = pfdArch(logicArchitecture, lambdaD * 0.1);
    const pfdFinal = pfdArch(finalElementArchitecture, lambdaD * 0.5);
    const pfdTotal = pfdSensor + pfdLogic + pfdFinal;
    const rrf = 1 / Math.max(pfdTotal, 1e-10);
    let achievedSIL = 0;
    if (pfdTotal < 1e-4) achievedSIL = 3;
    else if (pfdTotal < 1e-3) achievedSIL = 2;
    else if (pfdTotal < 1e-2) achievedSIL = 1;
    return { pfdSensor: Math.round(pfdSensor * 1e10) / 1e10, pfdLogic: Math.round(pfdLogic * 1e10) / 1e10, pfdFinal: Math.round(pfdFinal * 1e10) / 1e10, pfdTotal: Math.round(pfdTotal * 1e10) / 1e10, rrf: Math.round(rrf), achievedSIL };
}

// --- Tab 6: Cause-and-effect matrix ---

export interface CauseEffectEntry {
    cause: string;
    effect: string;
    priority: 'A' | 'B' | 'C';
    esdLevel: 0 | 1 | 2 | 3;
    responseTimeSec: number;
}

export function generateCauseEffectMatrix(params: { processUnits: { name: string; criticality: 'high' | 'medium' | 'low' }[] }): CauseEffectEntry[] {
    const matrix: CauseEffectEntry[] = [];
    for (const unit of params.processUnits) {
        const priority = unit.criticality === 'high' ? 'A' : unit.criticality === 'medium' ? 'B' : 'C';
        matrix.push({ cause: `${unit.name} high pressure`, effect: `Shutdown ${unit.name} feed`, priority, esdLevel: unit.criticality === 'high' ? 1 : 0, responseTimeSec: unit.criticality === 'high' ? 5 : 10 });
        matrix.push({ cause: `${unit.name} fire detected`, effect: `ESD Level 2 + deluge ${unit.name}`, priority: 'A', esdLevel: 2, responseTimeSec: 15 });
        matrix.push({ cause: `${unit.name} gas leak`, effect: `Isolate ${unit.name} + blowdown`, priority: 'A', esdLevel: 2, responseTimeSec: 20 });
    }
    matrix.push({ cause: 'Manual ESD pushbutton', effect: 'Total facility shutdown + blowdown', priority: 'A', esdLevel: 3, responseTimeSec: 30 });
    return matrix;
}

// --- Tab 6: Blowdown valve sizing (API 521) ---

export function sizeBlowdownValve(params: { vesselVolumeFt3: number; initialPressurePsia: number; gasMW: number; gasTempF: number; targetTimeMin?: number }): { bdvOrificeIn: number; depressurizationRatePsiPerMin: number; autoRefrigerationTempF: number; mdmtPass: boolean; minDesignMetalTempF: number } {
    const { vesselVolumeFt3, initialPressurePsia, gasMW, gasTempF, targetTimeMin = 15 } = params;
    const kGas = 1.27;
    const initialDensity = initialPressurePsia * gasMW / (10.73 * (gasTempF + 459.67));
    const initialMass = initialDensity * vesselVolumeFt3;
    const massFlowTarget = initialMass / (targetTimeMin * 60);
    const sonicVel = 223 * Math.sqrt((gasTempF + 459.67) / gasMW);
    const critPressureRatio = Math.pow(2 / (kGas + 1), kGas / (kGas - 1));
    const critFlow = initialPressurePsia / Math.sqrt(gasTempF + 459.67) * Math.sqrt(kGas * gasMW / (1545)) * Math.pow(2 / (kGas + 1), (kGas + 1) / (2 * (kGas - 1)));
    const bdvArea = massFlowTarget / (0.9 * critFlow);
    const bdvOrificeIn = Math.sqrt(4 * bdvArea / Math.PI) / 12;
    const depressRate = initialPressurePsia * 0.5 / targetTimeMin;
    const dT = 2 * (initialPressurePsia - 14.7) * 0.04;
    const autoRefrigTemp = gasTempF - dT;
    const mdmt = -20;
    return { bdvOrificeIn: Math.round(Math.max(1, bdvOrificeIn) * 100) / 100, depressurizationRatePsiPerMin: Math.round(depressRate), autoRefrigerationTempF: Math.round(autoRefrigTemp), mdmtPass: autoRefrigTemp >= mdmt, minDesignMetalTempF: mdmt };
}

// --- Tab 2: RVP blending calculator ---

export function rvpBlendCalc(params: { components: { name: string; volumeBpd: number; rvpPsi: number }[] }): { blendRvpPsi: number; pipelinePass: boolean; maxRvpComponent: string } {
    const { components } = params;
    let totalMol = 0;
    let totalVp = 0;
    let maxRvp = 0;
    let maxName = '';
    for (const c of components) {
        const molFrac = c.volumeBpd / Math.max(1, components.reduce((s, x) => s + x.volumeBpd, 0));
        totalMol += molFrac;
        totalVp += c.rvpPsi * Math.pow(molFrac, 1.25);
        if (c.rvpPsi > maxRvp) { maxRvp = c.rvpPsi; maxName = c.name; }
    }
    const blendRvp = totalVp;
    return { blendRvpPsi: Math.round(blendRvp * 10) / 10, pipelinePass: blendRvp < 12, maxRvpComponent: maxName };
}

// --- Tab 2: Export quality checker ---
export function exportQualityCheck(params: { bsAndWPct: number; saltPTB: number; rvpPsi: number; api: number; h2sPpm: number }): { specName: string; limit: string; actual: string; pass: boolean }[] {
    const { bsAndWPct, saltPTB, rvpPsi, api, h2sPpm } = params;
    return [
        { specName: 'BS&W', limit: '< 0.5%', actual: bsAndWPct.toFixed(2) + '%', pass: bsAndWPct < 0.5 },
        { specName: 'Salt', limit: '< 10 PTB', actual: saltPTB + ' PTB', pass: saltPTB < 10 },
        { specName: 'RVP', limit: '< 12 psi', actual: rvpPsi.toFixed(1) + ' psi', pass: rvpPsi < 12 },
        { specName: 'API', limit: '> 20°', actual: api.toFixed(0) + '°', pass: api > 20 },
        { specName: 'H₂S', limit: '< 50 ppm in vapor', actual: h2sPpm + ' ppm', pass: h2sPpm < 50 },
    ];
}

// --- Tab 5: Load list builder ---
export interface EquipmentLoad {
    name: string;
    runningKw: number;
    standbyKw: number;
    quantity: number;
}

export function computeLoadList(equipment: EquipmentLoad[]): { totalRunningKw: number; totalConnectedKw: number; diversityFactor: number; minimumGeneratorKw: number; recommendedGeneratorKw: number } {
    let totalRunning = 0;
    let totalConnected = 0;
    for (const e of equipment) {
        totalRunning += e.runningKw * e.quantity;
        totalConnected += (e.runningKw + e.standbyKw) * e.quantity;
    }
    const diversity = totalConnected > 0 ? totalRunning / totalConnected : 0;
    const minGen = totalRunning * 1.15;
    const recGen = minGen * 1.3;
    return { totalRunningKw: Math.round(totalRunning), totalConnectedKw: Math.round(totalConnected), diversityFactor: Math.round(diversity * 1000) / 1000, minimumGeneratorKw: Math.round(minGen), recommendedGeneratorKw: Math.round(recGen) };
}

// --- Tab 5: Waste heat recovery boiler ---
export function wasteHeatRecoveryCalc(params: { exhaustTempF: number; exhaustFlowLbHr: number; stackMinTempF?: number }): { recoverableHeatMMBtuHr: number; steamGeneratedLbHr: number; hpsTeamLbHr: number; stackTempOutF: number } {
    const { exhaustTempF, exhaustFlowLbHr, stackMinTempF = 300 } = params;
    const cpExhaust = 0.26;
    const deltaT = exhaustTempF - stackMinTempF;
    const recoverableHeat = exhaustFlowLbHr * cpExhaust * deltaT / 1e6;
    const steamGen = recoverableHeat * 1e6 / 1000;
    const hpSteam = steamGen * 0.4;
    return { recoverableHeatMMBtuHr: Math.round(recoverableHeat * 100) / 100, steamGeneratedLbHr: Math.round(steamGen), hpsTeamLbHr: Math.round(hpSteam), stackTempOutF: stackMinTempF };
}

// --- Tab 6: SIL verification bar chart data ---
export function silVerificationData(silDesigns: SILDesign[]): { function: string; currentPFD: number; targetPFD: number; gap: number }[] {
    const silTargets: Record<number, number> = { 0: 1e-1, 1: 1e-2, 2: 1e-3, 3: 1e-4, 4: 1e-5 };
    return silDesigns.map(d => ({
        function: d.safetyFunction,
        currentPFD: d.pfdavg,
        targetPFD: silTargets[d.requiredSIL] || 1e-2,
        gap: Math.round((d.pfdavg - (silTargets[d.requiredSIL] || 1e-2)) * 1e8) / 1e8,
    }));
}

// --- Tab 4: Sulfate Removal Unit (SRP) nanofiltration design ---
export function designSulfateRemovalUnit(params: { feedSulfatePpm: number; targetSulfatePpm: number; injectionRateBWPD: number }): { membraneAreaFt2: number; feedPressurePsig: number; concentrateRateBWPD: number; permeateRateBWPD: number; recoveryPct: number; powerConsumptionKw: number } {
    const { feedSulfatePpm, targetSulfatePpm, injectionRateBWPD } = params;
    const sulfateRejection = 0.97;
    const recovery = 0.75;
    const permeateRate = injectionRateBWPD;
    const feedRate = permeateRate / recovery;
    const concentrateRate = feedRate - permeateRate;
    const flux = 12; // GFD
    const membraneArea = (permeateRate * 42) / flux;
    const feedPressure = 400 + (feedSulfatePpm / 100);
    const power = feedRate * feedPressure * 0.003;
    return { membraneAreaFt2: Math.round(membraneArea), feedPressurePsig: Math.round(feedPressure), concentrateRateBWPD: Math.round(concentrateRate), permeateRateBWPD: Math.round(permeateRate), recoveryPct: Math.round(recovery * 100), powerConsumptionKw: Math.round(power) };
}

// --- Tab 4: Produced water re-injection spec checker ---
export function producedWaterReinjectionSpec(params: { oiwPpm: number; tssPpm: number; particleSizeMicron: number; sulfatePpm: number; bacteriaCountPerMl: number }): { spec: string; value: string; pass: boolean }[] {
    const { oiwPpm, tssPpm, particleSizeMicron, sulfatePpm, bacteriaCountPerMl } = params;
    return [
        { spec: 'Oil in Water', value: oiwPpm + ' ppm', pass: oiwPpm < 30 },
        { spec: 'TSS', value: tssPpm + ' ppm', pass: tssPpm < 2 },
        { spec: 'Particle Size', value: particleSizeMicron + ' µm', pass: particleSizeMicron < 5 },
        { spec: 'Sulfate', value: sulfatePpm + ' ppm', pass: sulfatePpm < 50 },
        { spec: 'Bacteria', value: bacteriaCountPerMl + ' CFU/mL', pass: bacteriaCountPerMl < 100 },
    ];
}

// --- Tab 1: Separator internals configurator ---
export interface SeparatorInternals {
    inletDiverter: string;
    waveBreaker: boolean;
    mistExtractor: string;
    coalescingPlates: boolean;
    sandJetSystem: boolean;
    vortexBreaker: boolean;
    weirHeightIn: number;
    weirType: string;
}

export function configureSeparatorInternals(params: { sandProduction: boolean; highGOR: boolean; producedWaterRate: number; vesselDiameter: number }): SeparatorInternals {
    const { sandProduction, highGOR, producedWaterRate, vesselDiameter } = params;
    return {
        inletDiverter: highGOR ? 'Cyclone inlet device' : 'Half-open pipe with impact plate',
        waveBreaker: vesselDiameter > 60,
        mistExtractor: highGOR ? 'Vane pack (0.3 mm spacing)' : 'Wire mesh pad (0.011" wire)',
        coalescingPlates: producedWaterRate > 1000,
        sandJetSystem: sandProduction,
        vortexBreaker: true,
        weirHeightIn: Math.round(vesselDiameter * 0.5),
        weirType: 'Adjustable weir with bucket and nipple',
    };
}

// --- Tab 1: Test separator metering accuracy ---
export function testSeparatorMetering(params: { oilRateSTBD: number; gasRateMMscfd: number; waterRateBWPD: number; testDurationHrs: number }): { oilFlowUncertaintyPct: number; gasFlowUncertaintyPct: number; waterFlowUncertaintyPct: number; requiredTestHours: number; allocationConfidence: string } {
    const { oilRateSTBD, gasRateMMscfd, waterRateBWPD, testDurationHrs } = params;
    const oilUncertainty = Math.max(2, 15 / Math.sqrt(Math.max(oilRateSTBD * testDurationHrs / 24, 1)));
    const gasUncertainty = Math.max(1.5, 10 / Math.sqrt(Math.max(gasRateMMscfd * testDurationHrs / 24 * 1e3, 1)));
    const waterUncertainty = Math.max(3, 20 / Math.sqrt(Math.max(waterRateBWPD * testDurationHrs / 24, 1)));
    const avgUncertainty = (oilUncertainty + gasUncertainty + waterUncertainty) / 3;
    const confidence = avgUncertainty < 3 ? 'Excellent' : avgUncertainty < 7 ? 'Good' : 'Poor — extend test';
    return { oilFlowUncertaintyPct: Math.round(oilUncertainty * 100) / 100, gasFlowUncertaintyPct: Math.round(gasUncertainty * 100) / 100, waterFlowUncertaintyPct: Math.round(waterUncertainty * 100) / 100, requiredTestHours: avgUncertainty > 7 ? Math.round(testDurationHrs * 2) : testDurationHrs, allocationConfidence: confidence };
}

// --- Tab 3: Gas processing — Claus TGTU tail gas treating ---
export function clausTGTUCalc(params: { sulfurInletTpd: number }): { tgtuType: string; sulfurRecoveryIncrementPct: number; hydrogenConsumptionMscfd: number; amineCirculationGpm: number } {
    const { sulfurInletTpd } = params;
    const recoveryIncrement = 3.5;
    const h2Consumption = sulfurInletTpd * 0.05 * 1e3;
    const amineCirc = sulfurInletTpd * 0.8;
    return { tgtuType: 'SCOT (Shell Claus Off-gas Treating)', sulfurRecoveryIncrementPct: Math.round(recoveryIncrement * 10) / 10, hydrogenConsumptionMscfd: Math.round(h2Consumption), amineCirculationGpm: Math.round(amineCirc) };
}

// --- Tab 6: NFPA firewater pump sizing ---
export function nfpaFirewaterCalc(params: { protectedAreaSqft: number; hazardType: 'light' | 'ordinary' | 'extra' }): { designDensityGpmPerSqft: number; firewaterGpm: number; jockeyPumpGpm: number; mainPumpGpm: number; tankVolumeBbl: number; durationHrs: number } {
    const { protectedAreaSqft, hazardType } = params;
    const density = hazardType === 'extra' ? 0.4 : hazardType === 'ordinary' ? 0.3 : 0.2;
    const firewaterGpm = protectedAreaSqft * density;
    const jockeyPumpGpm = firewaterGpm * 0.05;
    const mainPumpGpm = firewaterGpm * 1.1;
    const duration = hazardType === 'extra' ? 4 : 3;
    const tankVolumeBbl = (firewaterGpm * duration * 60) / 42;
    return { designDensityGpmPerSqft: density, firewaterGpm: Math.round(firewaterGpm), jockeyPumpGpm: Math.round(jockeyPumpGpm), mainPumpGpm: Math.round(mainPumpGpm), tankVolumeBbl: Math.round(tankVolumeBbl), durationHrs: duration };
}

// --- Tab 4: Deoiling hydrocyclone design ---
export function designHydrocyclone(params: { feedRateBWPD: number; feedOIWPpm: number; targetOIWPpm: number }): { linerCount: number; linerDiameterMm: number; pressureDropPsi: number; rejectRateBWPD: number; rejectOIWPpm: number; oilRemovalEfficiencyPct: number } {
    const { feedRateBWPD, feedOIWPpm, targetOIWPpm } = params;
    const efficiency = Math.min(97, 60 + Math.log10(Math.max(feedOIWPpm, 1)) * 10);
    const linerDiameterMm = feedRateBWPD > 50000 ? 35 : feedRateBWPD > 20000 ? 25 : 15;
    const ratePerLiner = feedRateBWPD > 50000 ? 260 : feedRateBWPD > 20000 ? 150 : 60;
    const linerCount = Math.ceil(feedRateBWPD / ratePerLiner);
    const pressureDropPsi = 30 + feedOIWPpm * 0.02;
    const rejectRate = feedRateBWPD * 0.03;
    const rejectOIWPpm = feedOIWPpm * (1 - efficiency / 100) / 0.03;
    const oiwOut = feedOIWPpm * (1 - efficiency / 100);
    const achieved = oiwOut <= targetOIWPpm;
    return { linerCount, linerDiameterMm, pressureDropPsi: Math.round(pressureDropPsi), rejectRateBWPD: Math.round(rejectRate), rejectOIWPpm: Math.round(Math.min(5000, rejectOIWPpm)), oilRemovalEfficiencyPct: Math.round(efficiency * (achieved ? 1 : 0.8)) };
}

// --- Tab 6: Proof test interval impact on SIL ---
export function proofTestIntervalImpact(params: { lambdaD: number; architecture: '1oo1' | '1oo2' | '2oo3'; intervalsMonths: number[] }): { months: number; pfdAvg: number; silAchieved: number; rrf: number }[] {
    const { lambdaD, architecture, intervalsMonths } = params;
    return intervalsMonths.map(m => {
        const pfd = computePFDavg({ sensorArchitecture: '1oo1', logicArchitecture: '1oo1', finalElementArchitecture: architecture, proofTestIntervalMonths: m, lambdaD });
        const sil = pfd.pfdTotal < 1e-4 ? 3 : pfd.pfdTotal < 1e-3 ? 2 : pfd.pfdTotal < 1e-2 ? 1 : 0;
        return { months: m, pfdAvg: pfd.pfdTotal, silAchieved: sil, rrf: pfd.rrf };
    });
}

// --- Tab 3: JT valve NGL calculation ---
export function jtValveCalc(params: { upstreamPsia: number; downstreamPsia: number; upstreamTempF: number; gasRateMMscfd: number }): { deltaTF: number; downstreamTempF: number; liquidDropoutBpd: number; hydrateRisk: boolean } {
    const { upstreamPsia, downstreamPsia, upstreamTempF, gasRateMMscfd } = params;
    const deltaP = upstreamPsia - downstreamPsia;
    const jtCoeff = 0.04;
    const deltaTF = deltaP * jtCoeff;
    const downstreamTemp = upstreamTempF - deltaTF;
    const liquidDropout = Math.max(0, gasRateMMscfd * deltaTF * 0.5);
    const hydrateRisk = downstreamTemp < 70 && downstreamPsia > 300;
    return { deltaTF: Math.round(deltaTF * 10) / 10, downstreamTempF: Math.round(downstreamTemp), liquidDropoutBpd: Math.round(liquidDropout), hydrateRisk };
}
